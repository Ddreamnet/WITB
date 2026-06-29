import { createClient } from '@supabase/supabase-js'

// Bağlantı bilgileri .env.local'dan gelir (Vite, VITE_ önekli değişkenleri pakete gömer).
// publishable/anon anahtarı herkese açık olacak şekilde tasarlıdır; gizli DEĞİLDİR.
// Asıl güvenlik Postgres tarafındaki Row Level Security (RLS) ile sağlanır.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  // Offline-first uygulama: anahtar yoksa bulut özellikleri devre dışı kalır,
  // uygulama yerel (Dexie) modda çalışmaya devam eder.
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY tanımsız — bulut senkronu kapalı.',
  )
}

/** Bağlantı bilgileri varsa Supabase istemcisi, yoksa null. */
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null

/** Bulut özellikleri kullanılabilir mi? */
export const isCloudEnabled = supabase !== null
