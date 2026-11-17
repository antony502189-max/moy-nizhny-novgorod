import { useState } from 'react';

export function readLocal<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : initial;
  } catch { return initial; }
}

export function writeLocal<T>(key: string, value: T): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function useLocal<T>(key: string, initial: T): [T, (value: T) => boolean] {
  const [value, setValue] = useState<T>(() => readLocal(key, initial));
  function save(next: T) {
    if (!writeLocal(key, next)) return false;
    setValue(next);
    return true;
  }
  return [value, save];
}
