import { useState, useEffect } from 'react';

export function useStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
      // Notifica outras instâncias do hook na mesma janela
      window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key, value } }));
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
