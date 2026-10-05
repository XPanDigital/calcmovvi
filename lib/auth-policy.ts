export function allowedIdentity(owner: unknown, email?: unknown, verified?: unknown) {
  if (typeof owner !== 'string') return false;
  const ids = (process.env.AUTH_ALLOWED_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (ids.includes(owner)) return true;
  const emails = (process.env.AUTH_ALLOWED_GOOGLE_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return owner.startsWith('google:') && verified === true && typeof email === 'string' && emails.includes(email.toLowerCase());
}
