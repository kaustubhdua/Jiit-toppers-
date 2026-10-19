export function safeRelativePath(value, fallback = '/') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return fallback;
  if (value.includes(String.fromCharCode(92))) return fallback;
  if ([...value].some(character => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127;
  })) return fallback;

  try {
    const base = 'https://jiit-toppers.invalid';
    const resolved = new URL(value, base);
    if (resolved.origin !== base) return fallback;
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return fallback;
  }
}
