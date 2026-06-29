import { supabase } from './supabase'

/**
 * Anonim oturum garantiler. Oturum yoksa anonim giriş yapar (e-posta/şifre yok).
 * Her cihaz kalıcı bir anonim kimlik (auth.uid) alır; bu kimlik RLS'in temelidir.
 * Bulut kapalıysa (anahtar yok) null döner.
 */
export async function ensureSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session.user
  const { data: signed, error } = await supabase.auth.signInAnonymously()
  if (error) {
    console.warn('[auth] anonim giriş başarısız:', error.message)
    return null
  }
  return signed.user ?? null
}

/** Mevcut kullanıcı id'si (oturum yoksa null). */
export async function currentUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}
