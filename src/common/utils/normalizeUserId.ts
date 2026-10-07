export function normalizeUserId(userId: string): string {
  return userId.startsWith('u') ? userId.substring(0, 13) : userId.substring(0, 12);
}
