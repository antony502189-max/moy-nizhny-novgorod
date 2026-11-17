import { useEffect, useState } from 'react';

/** Tiny localStorage-backed state hook (all guest data stays on the device; no login). */
export function useLocal<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [val, setVal] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ } }, [key, val]);
  return [val, setVal];
}

export function readLocal<T>(key: string, initial: T): T {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : initial; } catch { return initial; }
}
export function writeLocal<T>(key: string, v: T) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* quota */ } }
