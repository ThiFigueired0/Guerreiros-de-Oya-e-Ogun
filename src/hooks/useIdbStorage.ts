import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';

export function useIdbStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const item = await get(key);
        if (item !== undefined) {
          setStoredValue(item);
        } else {
          // Migration from localStorage
          try {
            const legacyItem = window.localStorage.getItem(key);
            if (legacyItem) {
              const parsed = JSON.parse(legacyItem);
              setStoredValue(parsed);
              await set(key, parsed);
              // Clean up localStorage to free up quota
              window.localStorage.removeItem(key);
            }
          } catch (lsError) {
            console.error('Error migrating from localStorage:', lsError);
          }
        }
      } catch (error) {
        console.error('Error loading from IndexedDB:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [key]);

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await set(key, valueToStore);
      // Sync across tabs/instances
      window.dispatchEvent(new CustomEvent('idb-storage-sync', { detail: { key, value: valueToStore } }));
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
    }
  };

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener('idb-storage-sync', handleSync);
    return () => window.removeEventListener('idb-storage-sync', handleSync);
  }, [key]);

  return [storedValue, setValue, isLoading];
}
