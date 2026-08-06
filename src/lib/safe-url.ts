/**
 * Guards for values that reach href/src attributes.
 *
 * Application rows can be created by an anonymous POST to /api/apply, so
 * photoUrl / presentationUrl / materialsLink are attacker-controlled for any
 * row written before input validation landed. Rendering them unchecked lets an
 * attacker put arbitrary content inside the trusted admin and jury interface.
 */

/** Accepts only paths served from our own /uploads directory. */
export function isLocalUpload(v: unknown, prefix = '/uploads/'): v is string {
  if (typeof v !== 'string' || v.length === 0 || v.length > 200) return false;
  if (!v.startsWith(prefix)) return false;
  if (v.startsWith(prefix + '/')) return false; // "//evil.tld/x" is protocol-relative
  if (v.includes('..') || v.includes('\\') || v.includes('://')) return false;
  return /^[A-Za-z0-9._/-]+$/.test(v);
}

/** A local upload that is really a PDF — the only thing safe to iframe. */
export function isLocalPdf(v: unknown): v is string {
  return isLocalUpload(v, '/uploads/presentations/') && (v as string).endsWith('.pdf');
}

/** Accepts only absolute http(s) links for outbound anchors. */
export function isHttpLink(v: unknown): v is string {
  if (typeof v !== 'string' || v.length === 0 || v.length > 2000) return false;
  return /^https?:\/\/[^\s<>"']+$/i.test(v);
}
