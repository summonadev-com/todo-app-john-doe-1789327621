import { useCallback, useEffect, useRef, useState } from 'react';

export interface StorageState<T> {
  value: T;
  setValue: (next: T | ((prev: T) => T)) => void;
  /** True when reads/writes to localStorage are failing (private mode, quota, etc.). */
  persistenceFailed: boolean;
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Typed localStorage state with guarded JSON handling. `deserialize` must never
 * throw — it receives already-parsed unknown JSON and returns a safe value.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  deserialize: (raw: unknown) => T,
  serialize: (value: T) => unknown,
): StorageState<T> {
  const [persistenceFailed, setPersistenceFailed] = useState(false);
  const deserializeRef = useRef(deserialize);
  const serializeRef = useRef(serialize);
  deserializeRef.current = deserialize;
  serializeRef.current = serialize;

  const [value, setValueState] = useState<T>(() => {
    const raw = readRaw(key);
    if (raw == null) return initialValue;
    try {
      return deserializeRef.current(JSON.parse(raw) as unknown);
    } catch {
      // Corrupt stored JSON — start clean rather than crashing.
      return initialValue;
    }
  });

  const hydrated = useRef(false);

  useEffect(() => {
    // Skip the very first run so we never overwrite good data with the initial value
    // before the user has changed anything.
    if (!hydrated.current) {
      hydrated.current = true;
      if (readRaw(key) != null) return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(serializeRef.current(value)));
      setPersistenceFailed(false);
    } catch {
      setPersistenceFailed(true);
    }
  }, [key, value]);

  const setValue = useCallback((next: T | ((prev: T) => T)) => {
    setValueState((prev) => (typeof next === 'function' ? (next as (p: T) => T)(prev) : next));
  }, []);

  return { value, setValue, persistenceFailed };
}
