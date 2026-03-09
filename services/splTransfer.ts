import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export interface SendSplTokenParams {
  connection: Connection;
  senderPublicKey: PublicKey;
  recipientAddress: PublicKey;
  mint: PublicKey;
  amount: number;
  decimals: number;
}

/**
 * Builds a transaction to send SPL tokens (TransferChecked).
 * Creates the recipient's associated token account if it does not exist.
 * Returns the transaction for the wallet to sign and send.
 */
export async function sendSplToken(params: SendSplTokenParams): Promise<Transaction> {
  const {
    connection,
    senderPublicKey,
    recipientAddress,
    mint,
    amount,
    decimals,
  } = params;

  const amountRaw = BigInt(Math.floor(amount * 10 ** decimals));
  if (amountRaw <= 0n) throw new Error("Amount must be greater than 0");

  const senderAta = await getAssociatedTokenAddress(
    mint,
    senderPublicKey,
  );
  const recipientAta = await getAssociatedTokenAddress(
    mint,
    recipientAddress,
  );

  const transaction = new Transaction();
  transaction.feePayer = senderPublicKey;

  const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
  if (!recipientAtaInfo) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        senderPublicKey,
        recipientAta,
        recipientAddress,
        mint,
      ),
    );
  }

  transaction.add(
    createTransferCheckedInstruction(
      senderAta,
      mint,
      recipientAta,
      senderPublicKey,
      amountRaw,
      decimals,
      [],
      TOKEN_PROGRAM_ID,
    ),
  );

  return transaction;
}
