export const formatInr = (value: any) => {
  const num =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ''));
  if (!isFinite(num)) return String(value ?? '');
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const toTitleCase = (value: string) =>
  (value || '')
    .toLowerCase()
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1));
    
export const normalizeLabel = (value: string) => {
  const v = (value || '').trim();
  const lower = v.toLowerCase();
  if (/^ca[\s\-]*inter/.test(lower)) return 'CA Inter';
  if (/^ca[\s\-]*final/.test(lower)) return 'CA Final';
  if (/^ca[\s\-]*foundation/.test(lower)) return 'CA Foundation';
  // Generic rule: if first word is 2 chars, uppercase it, rest title case
  const parts = v.split(/\s+/);
  if (parts.length > 0 && parts[0].length === 2) {
    const first = parts[0].toUpperCase();
    const rest = parts.slice(1).join(' ');
    return rest ? `${first} ${toTitleCase(rest)}` : first;
  }
  return toTitleCase(v);
};
