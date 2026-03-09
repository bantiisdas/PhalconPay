import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  AddressLookupTableAccount,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  getSwapInstructionsV6,
  type QuoteResponse,
  type JupiterRawInstruction,
} from "./jupiter";

function decodeBase64(data: string): Buffer {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(data, "base64");
  }
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return Buffer.from(bytes);
}

function jupiterInstructionToTransactionInstruction(
  raw: JupiterRawInstruction,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(raw.programId),
    keys: raw.accounts.map((acc) => ({
      pubkey: new PublicKey(acc.pubkey),
      isSigner: acc.isSigner,
      isWritable: acc.isWritable,
    })),
    data: decodeBase64(raw.data),
  });
}

/**
 * Build a single VersionedTransaction that:
 * 1. Optionally creates the recipient's ATA for the output mint
 * 2. Runs Jupiter swap with destinationTokenAccount = recipient ATA (swap output goes directly to recipient)
 *
 * User signs once; no separate transfer instruction.
 */
export async function buildSwapAndSendTransaction(params: {
  connection: Connection;
  quote: QuoteResponse;
  userPublicKey: PublicKey;
  recipientAddress: PublicKey;
  outputMint: PublicKey;
}): Promise<VersionedTransaction> {
  const { connection, quote, userPublicKey, recipientAddress, outputMint } =
    params;

  const recipientAta = await getAssociatedTokenAddress(
    outputMint,
    recipientAddress,
  );

  const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
  const needsCreateAta = recipientAtaInfo == null;

  const swapInstructions = await getSwapInstructionsV6(
    quote,
    userPublicKey.toBase58(),
    recipientAta.toBase58(),
  );

  const instructions: TransactionInstruction[] = [];

  if (needsCreateAta) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        userPublicKey,
        recipientAta,
        recipientAddress,
        outputMint,
        undefined,
        TOKEN_PROGRAM_ID,
      ),
    );
  }

  const jupiterOrder: JupiterRawInstruction[] = [
    ...swapInstructions.computeBudgetInstructions,
    ...swapInstructions.setupInstructions,
    swapInstructions.swapInstruction,
    ...(swapInstructions.cleanupInstruction
      ? [swapInstructions.cleanupInstruction]
      : []),
    ...swapInstructions.otherInstructions,
  ];

  for (const raw of jupiterOrder) {
    instructions.push(jupiterInstructionToTransactionInstruction(raw));
  }

  const recentBlockhash = await connection.getLatestBlockhash("confirmed");
  const lookupTableAddresses =
    swapInstructions.addressLookupTableAddresses ?? [];
  let addressLookupTableAccounts: AddressLookupTableAccount[] = [];

  if (lookupTableAddresses.length > 0) {
    const results = await Promise.all(
      lookupTableAddresses.map((addr) =>
        connection.getAddressLookupTable(new PublicKey(addr)),
      ),
    );
    addressLookupTableAccounts = results
      .map((r) => r.value)
      .filter((v): v is AddressLookupTableAccount => v != null);
  }

  const message = new TransactionMessage({
    payerKey: userPublicKey,
    recentBlockhash: recentBlockhash.blockhash,
    instructions,
  }).compileToV0Message(
    addressLookupTableAccounts.length > 0 ? addressLookupTableAccounts : undefined,
  );

  return new VersionedTransaction(message);
}
