import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('URL configurada:', !!supabaseUrl);
console.log('Key configurada:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('=== ERRO CRÍTICO ===');
  console.error('As variáveis do Supabase não estão definidas na inicialização!');
  console.error('URL:', supabaseUrl ? 'Definida' : 'Indefinida');
  console.error('Key:', supabaseAnonKey ? 'Definida' : 'Indefinida');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    global: {
      headers: {
        apikey: supabaseAnonKey || 'placeholder-key',
      },
    },
  }
);
