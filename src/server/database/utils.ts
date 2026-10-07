export function stringToNumber(s: string | undefined, defaultValue: number): number {
  const parsed = parseInt(s || '');
  return Number.isInteger(parsed) ? parsed : defaultValue;
}
