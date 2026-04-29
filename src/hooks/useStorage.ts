import { useState, useEffect } from 'react';

export function useStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      // Notifica outras instâncias do hook na mesma janela
      window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key, value: valueToStore } }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('local-storage-sync', handleSync);
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('local-storage-sync', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [key]);

  return [storedValue, setValue];
}
