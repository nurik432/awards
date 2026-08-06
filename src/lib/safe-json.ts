/**
 * Application.employeeData / formData and Nomination.criteria are TEXT columns
 * holding JSON. A single malformed row would otherwise throw during render and
 * take down the whole admin or jury list, not just that one entry.
 */
export function safeParseObject(raw: unknown): Record<string, any> {
  if (typeof raw !== 'string') return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function safeParseArray(raw: unknown): string[] {
  if (typeof raw !== 'string') return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
