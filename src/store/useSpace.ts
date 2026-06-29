import { create } from 'zustand'
import { supabase, isCloudEnabled } from '../lib/supabase'
import { ensureSession } from '../lib/auth'
import { startSync, stopSync, pushAllLocal, setActiveSpaceId } from '../lib/sync'

const STORAGE_KEY = 'witb.space'

interface PersistedSpace {
  id: string
  name: string
  joinKey: string
}

function load(): PersistedSpace | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistedSpace) : null
  } catch {
    return null
  }
}

function save(s: PersistedSpace | null) {
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* yoksay */
  }
}

interface SpaceState {
  ready: boolean
  cloudEnabled: boolean
  space: PersistedSpace | null
  busy: boolean
  error: string | null

  init: () => Promise<void>
  createSpace: (name: string) => Promise<void>
  joinSpace: (key: string) => Promise<void>
  leaveSpace: () => Promise<void>
  clearError: () => void
}

export const useSpaceStore = create<SpaceState>((set, get) => ({
  ready: false,
  cloudEnabled: isCloudEnabled,
  space: null,
  busy: false,
  error: null,

  async init() {
    if (!isCloudEnabled) {
      set({ ready: true })
      return
    }
    const persisted = load()
    if (!persisted) {
      set({ ready: true })
      return
    }
    // Oturumu garantile ve senkronu başlat.
    await ensureSession()
    setActiveSpaceId(persisted.id)
    set({ space: persisted, ready: true })
    void startSync()
  },

  async createSpace(name) {
    if (!supabase) return
    set({ busy: true, error: null })
    try {
      const user = await ensureSession()
      if (!user) throw new Error('Giriş yapılamadı')
      const { data, error } = await supabase.rpc('create_space', { p_name: name })
      if (error) throw error
      const space: PersistedSpace = { id: data.id, name: data.name, joinKey: data.join_key }
      save(space)
      setActiveSpaceId(space.id)
      set({ space, busy: false })
      // Mevcut yerel envanteri buluta yükle, sonra canlı senkronu başlat.
      await pushAllLocal()
      void startSync()
    } catch (e) {
      set({ busy: false, error: (e as Error).message })
    }
  },

  async joinSpace(key) {
    if (!supabase) return
    set({ busy: true, error: null })
    try {
      const user = await ensureSession()
      if (!user) throw new Error('Giriş yapılamadı')
      const { data, error } = await supabase.rpc('join_space', { p_key: key.trim().toUpperCase() })
      if (error) throw error
      const space: PersistedSpace = { id: data.id, name: data.name, joinKey: data.join_key }
      save(space)
      setActiveSpaceId(space.id)
      set({ space, busy: false })
      // Yereldeki kayıtları da paylaşıma kat, sonra uzaktakileri çek + canlı dinle.
      await pushAllLocal()
      void startSync()
    } catch (e) {
      const msg = (e as Error).message
      set({ busy: false, error: msg === 'invalid key' ? 'Anahtar geçersiz' : msg })
    }
  },

  async leaveSpace() {
    stopSync()
    setActiveSpaceId(null)
    save(null)
    set({ space: null })
    // Yerel veri (Dexie) korunur; sadece bulut bağlantısı kesilir.
    void get()
  },

  clearError() {
    set({ error: null })
  },
}))
