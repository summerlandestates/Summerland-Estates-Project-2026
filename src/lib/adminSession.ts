export function loadSessionJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveSessionJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures
  }
}
