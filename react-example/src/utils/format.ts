export function shortenAddress(addr?: string, chars = 4): string {
  if (!addr) return "";
  const start = addr.slice(0, 2 + chars);
  const end = addr.slice(-chars);
  return `${start}…${end}`;
}

export function formatPercent(value?: number, digits = 2): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "-";
  return `${value.toFixed(digits)}%`;
}

export function parseFloatToRaw(value: string, decimals: number): string {
  if (!value) return "0";
  const [intPart, fracPart = ""] = value.split(".");
  const frac = (fracPart + "0".repeat(decimals)).slice(0, decimals);
  const raw = `${intPart || "0"}${frac}`.replace(/^0+/, "");
  return raw === "" ? "0" : raw;
}

export function rawToDecimalString(raw: string, decimals: number): string {
  const s = raw || "0";
  if (decimals === 0) return s;
  const neg = s.startsWith("-");
  const digits = neg ? s.slice(1) : s;
  const pad = digits.padStart(decimals + 1, "0");
  const intPart = pad.slice(0, -decimals);
  const fracPart = pad.slice(-decimals).replace(/0+$/, "");
  const joined = fracPart ? `${intPart}.${fracPart}` : intPart;
  return neg ? `-${joined}` : joined;
} 