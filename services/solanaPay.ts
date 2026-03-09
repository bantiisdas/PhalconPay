/**
 * Parse Solana Pay QR code URLs.
 * Format: solana:<recipient>?amount=...&spl-token=...&reference=...&label=...&message=...&memo=...
 * @see https://docs.solanapay.com/spec
 */

export interface SolanaPayParsed {
  recipient: string;
  amount?: string;
  splToken?: string;
  reference?: string;
  label?: string;
  message?: string;
  memo?: string;
}

const SOLANA_PAY_PREFIX = "solana:";

/**
 * Parses a Solana Pay URL (e.g. from a QR code) and returns the recipient address and optional params.
 * Returns null if the string is not a valid Solana Pay URL.
 */
export function parseSolanaPayUrl(data: string): SolanaPayParsed | null {
  const trimmed = (data || "").trim();
  if (!trimmed.toLowerCase().startsWith(SOLANA_PAY_PREFIX)) {
    return null;
  }
  const withoutScheme = trimmed.slice(SOLANA_PAY_PREFIX.length).trim();
  const [path, search] = withoutScheme.split("?");
  const recipient = (path || "").trim();
  if (!recipient || recipient.length < 32) {
    return null;
  }
  const result: SolanaPayParsed = { recipient };
  if (search) {
    const params = new URLSearchParams(search);
    const amount = params.get("amount");
    if (amount != null) result.amount = amount;
    const splToken = params.get("spl-token");
    if (splToken != null) result.splToken = splToken;
    const reference = params.get("reference");
    if (reference != null) result.reference = reference;
    const label = params.get("label");
    if (label != null) result.label = decodeURIComponent(label);
    const message = params.get("message");
    if (message != null) result.message = decodeURIComponent(message);
    const memo = params.get("memo");
    if (memo != null) result.memo = decodeURIComponent(memo);
  }
  return result;
}

/**
 * Returns the wallet address from a scanned string if it's a Solana Pay URL, otherwise null.
 */
export function getRecipientFromSolanaPay(data: string): string | null {
  const parsed = parseSolanaPayUrl(data);
  return parsed ? parsed.recipient : null;
}

export interface BuildSolanaPayUrlParams {
  recipient: string;
  amount?: string;
  splToken?: string;
  label?: string;
  message?: string;
  memo?: string;
  reference?: string;
}

/**
 * Build a Solana Pay URL for QR codes.
 * Per spec, `amount` is a decimal human amount (e.g. "1.5"),
 * not in smallest units / lamports.
 */
export function buildSolanaPayUrl(params: BuildSolanaPayUrlParams): string {
  const { recipient, amount, splToken, label, message, memo, reference } =
    params;
  const base = `${SOLANA_PAY_PREFIX}${recipient}`;
  const search = new URLSearchParams();
  if (amount != null && amount !== "") search.set("amount", amount);
  if (splToken != null && splToken !== "") search.set("spl-token", splToken);
  if (label != null && label !== "") search.set("label", encodeURIComponent(label));
  if (message != null && message !== "") search.set("message", encodeURIComponent(message));
  if (memo != null && memo !== "") search.set("memo", encodeURIComponent(memo));
  if (reference != null && reference !== "") search.set("reference", reference);
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}
