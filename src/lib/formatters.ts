export function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function fmtDec(n: number | null | undefined, digits: number): string {
  if (n == null || isNaN(n)) return '—';
  return '$' + n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  return n.toFixed(1) + '%';
}

export function fmtX(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  return n.toFixed(2) + 'x';
}

export function colorClass(
  val: number,
  opts: { greenAbove?: number; redBelow?: number } = {},
): string {
  if (opts.greenAbove != null && val > opts.greenAbove) return 'green';
  if (opts.redBelow != null && val < opts.redBelow) return 'red';
  return '';
}
