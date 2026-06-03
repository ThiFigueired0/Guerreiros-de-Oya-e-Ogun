import { useState, useEffect, useMemo, useCallback } from 'react';
import { get, set } from 'idb-keyval';
import { useAuth } from '../lib/AuthContext';

export function useIdbStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const { user } = useAuth();
  
  // Create a user-specific key if logged in
  const storageKey = useMemo(() => {
    return user ? `templo_${user.id}_${key}` : `templo_guest_${key}`;
  }, [user?.id, key]);

  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const item = await get(storageKey);
        if (item !== undefined) {
          setStoredValue(item);
        } else {
          // Migration from localStorage (only for guest or first time)
          try {
            const legacyItem = window.localStorage.getItem(storageKey);
            if (legacyItem) {
              const parsed = JSON.parse(legacyItem);
              setStoredValue(parsed);
              await set(storageKey, parsed);
              window.localStorage.removeItem(storageKey);
            } else {
              setStoredValue(initialValue);
            }
          } catch (lsError) {
            console.error('Error migrating from localStorage:', lsError);
            setStoredValue(initialValue);
          }
        }
      } catch (error) {
        console.error('Error loading from IndexedDB:', error);
        setStoredValue(initialValue);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [storageKey]);

  const setValue = useCallback(async (value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prevStoredValue) => {
        const valueToStore = value instanceof Function ? value(prevStoredValue) : value;
        
        // Execute side effect asynchronously
        setTimeout(() => {
          set(storageKey, valueToStore).catch(err => console.error('Error saving to IndexedDB:', err));
          window.dispatchEvent(new CustomEvent('idb-storage-sync', { detail: { key: storageKey, value: valueToStore } }));
        }, 0);
        
        return valueToStore;
      });
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
    }
  }, [storageKey]);

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail.key === storageKey) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener('idb-storage-sync', handleSync);
    return () => window.removeEventListener('idb-storage-sync', handleSync);
  }, [storageKey]);

  return [storedValue, setValue, isLoading];
}
