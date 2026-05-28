import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

const TABLE_MAP: Record<string, string> = {
  'templo_events': 'eventos',
  'templo_baths': 'banhos',
  'templo_pontos': 'pontos',
  'templo_folders': 'folders',
  'templo_notes': 'notas',
  'templo_herb_stock': 'estoques',
  'templo_bichos': 'bichos',
  'templo_simulation_history': 'simulacoes',
  'templo_offerings': 'oferendas',
  'templo_candles': 'velas',
  'templo_study_docs': 'conteudos',
  'templo_glossary': 'glossario',
  'templo_greetings': 'saudacoes',
  'templo_finance': 'financeiro',
  'templo_history': 'notificacoes',
  'templo_settings': 'configuracoes',
};

export function useStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const { user } = useAuth();
  const table = TABLE_MAP[key];
  
  // Create a user-specific key for local fallback/cache
  const storageKey = useMemo(() => {
    return user ? `templo_${user.id}_${key}` : `templo_guest_${key}`;
  }, [user?.id, key]);

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      let parsed = item ? JSON.parse(item) : initialValue;
      if (key === 'templo_settings' && parsed) {
        parsed.darkMode = true;
      }
      return parsed;
    } catch (error) {
      console.error(error);
      let val = initialValue;
      if (key === 'templo_settings' && val) {
        (val as any).darkMode = true;
      }
      return val;
    }
  });

  // Fetch from Supabase on mount/auth change
  useEffect(() => {
    let isMounted = true;
    
    async function loadFromSupabase() {
      if (!user || !table) return;
      try {
        if (key === 'templo_settings') {
          const { data, error } = await supabase.from(table).select('*').eq('user_id', user.id).single();
          if (data && !error && isMounted) {
            const sData = data.settings_data || data as unknown as T;
            if (sData) {
              (sData as any).darkMode = true;
            }
            setStoredValue(sData);
            window.localStorage.setItem(storageKey, JSON.stringify(sData));
          }
        } else {
          const { data, error } = await supabase.from(table).select('*').eq('user_id', user.id);
          if (data && !error && isMounted) {
            setStoredValue(data as unknown as T);
            window.localStorage.setItem(storageKey, JSON.stringify(data));
          }
        }
      } catch(e) {
        console.error('Supabase load error:', e);
      }
    }
    
    // Load local first (already done in useState), then sync from remote
    loadFromSupabase();

    return () => { isMounted = false; };
  }, [user, table, key, storageKey]);

  // Sync to Supabase when value changes
  const setValue = useCallback(async (value: T | ((val: T) => T)) => {
    try {
      let valueToStore = value instanceof Function ? value(storedValue) : value;
      if (key === 'templo_settings' && valueToStore) {
        (valueToStore as any).darkMode = true;
      }
      setStoredValue(valueToStore);
      window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
      window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: storageKey, value: valueToStore } }));

      if (user && table) {
         if (key === 'templo_settings') {
           await supabase.from(table).upsert({ 
             id: user.id, // Or setting specific unique key
             user_id: user.id, 
             settings_data: valueToStore,
             updated_at: new Date().toISOString()
           });
         } else if (Array.isArray(valueToStore)) {
            // Very naive full sync: upsert everything. It requires elements to have an id!
            const toUpsert = valueToStore.map(item => ({
              ...item,
              user_id: user.id
            }));
            
            // Delete removed items (diff against current storedValue)
            if (Array.isArray(storedValue)) {
               const newIds = new Set(valueToStore.map(i => i.id));
               const toDelete = storedValue.filter(i => !newIds.has(i.id)).map(i => i.id);
               if (toDelete.length > 0) {
                 await supabase.from(table).delete().in('id', toDelete).eq('user_id', user.id);
               }
            }
            
            if (toUpsert.length > 0) {
               await supabase.from(table).upsert(toUpsert);
            }
         }
      }
      
    } catch (error) {
      console.error(error);
    }
  }, [user, table, storedValue, storageKey, key]);

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail.key === storageKey) {
        setStoredValue(e.detail.value);
      }
    };
    window.addEventListener('local-storage-sync', handleSync);
    return () => window.removeEventListener('local-storage-sync', handleSync);
  }, [storageKey]);

  return [storedValue, setValue];
}
