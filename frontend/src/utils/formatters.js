export function fmtMoney(n) {
  if (n === null || n === undefined || isNaN(n)) return "$0.00";
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtInt(n) {
  if (n === null || n === undefined || isNaN(n)) return "0";
  return Number(n).toLocaleString("en-US");
}

export function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s);
}

export function pctStr(actual, target) {
  if (!target) return "N/A";
  return (100 * actual / target).toFixed(1) + "%";
}

export function perfClass(p) {
  return p >= 100 ? "pg-good" : (p >= 90 ? "pg-mid" : "pg-under");
}
