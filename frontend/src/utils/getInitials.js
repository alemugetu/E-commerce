/**
 * Derives a 1–2 character avatar monogram from a user object.
 *
 * Priority order:
 *   1. first_name + last_name  → "John Doe"   → "JD"
 *   2. first_name only         → "John"        → "J"
 *   3. email                   → "john@..."    → "J"
 *   4. fallback                →               → "?"
 */
export const getInitials = (user) => {
  if (!user) return '?';

  const first = user.first_name?.trim();
  const last  = user.last_name?.trim();

  if (first && last)  return `${first[0]}${last[0]}`.toUpperCase();
  if (first)          return first[0].toUpperCase();
  if (user.email)     return user.email[0].toUpperCase();

  return '?';
};
