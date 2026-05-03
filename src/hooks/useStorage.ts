import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../lib/AuthContext';

export function useStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const { user } = useAuth();
  
  // Create a user-specific key if logged in
  const storageKey = useMemo(() => {
    return user ? `templo_${user.id}_${key}` : `templo_guest_${key}`;
  }, [user?.id, key]);

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Update state when storageKey changes (login/logout)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      console.error(error);
      setStoredValue(initialValue);
    }
  }, [storageKey]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
      // Notifica outras instâncias do hook na mesma janela
      window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: storageKey, value: valueToStore } }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail.key === storageKey) {
        setStoredValue(e.detail.value);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('local-storage-sync', handleSync);
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('local-storage-sync', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [storageKey]);

  return [storedValue, setValue];
}
