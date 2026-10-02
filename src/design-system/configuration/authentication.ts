export const minimumPasswordLength = 8;

export function isAuthEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value.trim());
}

export function isNewPassword(value: string): boolean {
  return value.length >= minimumPasswordLength;
}
