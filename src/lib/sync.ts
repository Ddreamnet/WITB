import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { db } from '../db/db'
import type { NodeRow } from '../db/types'
import type { Database } from '../db/database.types'
import { useNodesStore } from '../store/useNodes'
import { deletePhotos } from '../db/photosRepo'
import { invalidateThumb } from './photoUrl'

type Row = Database['public']['Tables']['nodes']['Row']
type Insert = Database['public']['Tables']['nodes']['Insert']
type PhotoMetaRow = Database['public']['Tables']['photos']['Row']
type PhotoMetaInsert = Database['public']['Tables']['photos']['Insert']

const PHOTO_BUCKET = 'photos'
const fullPath = (sid: string, id: string) => `${sid}/${id}`
const thumbPath = (sid: string, id: string) => `${sid}/${id}_thumb`

// ---- Modül durumu ----
let activeSpaceId: string | null = null
let channel: RealtimeChannel | null = null
let photoChannel: RealtimeChannel | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null
let flushing = false
let flushQueued = false
let photoFlushTimer: ReturnType<typeof setTimeout> | null = null
let photoFlushing = false
let photoFlushQueued = false

export function setActiveSpaceId(id: string | null) {
  activeSpaceId = id
}

// ---- Saf dönüştürücüler (test edilebilir) ----

/** Yerel NodeRow -> Supabase satırı. */
export function nodeToRow(n: NodeRow, spaceId: string): Insert {
  return {
    id: n.id,
    space_id: spaceId,
    name: n.name,
    name_lower: n.nameLower,
    parent_id: n.parentId,
    quantity: n.quantity,
    photo_ids: n.photoIds ?? [],
    order: n.order,
    skip_delete_confirm: n.skipDeleteConfirm ?? false,
    deleted: false,
    created_at: n.createdAt,
    updated_at: n.updatedAt,
  }
}

/** Supabase satırı -> yerel NodeRow. */
export function rowToNode(r: Row): NodeRow {
  return {
    id: r.id,
    name: r.name,
    nameLower: r.name_lower,
    parentId: r.parent_id,
    quantity: r.quantity,
    photoIds: r.photo_ids && r.photo_ids.length ? r.photo_ids : undefined,
    order: r.order,
    skipDeleteConfirm: r.skip_delete_confirm || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

/** Son-yazan-kazanır: uzaktaki satır yereli geçersiz kılmalı mı? */
export function isRemoteNewer(localUpdatedAt: number | undefined, remoteUpdatedAt: number): boolean {
  return localUpdatedAt === undefined || remoteUpdatedAt >= localUpdatedAt
}

// ---- Yerel değişiklik kaydı (store aksiyonlarından çağrılır) ----

/** Bir node oluşturuldu/güncellendi: push kuyruğuna al. Space yoksa no-op. */
export async function markDirty(id: string) {
  if (!activeSpaceId || !supabase) return
  await db.outbox.put({ nodeId: id, deleted: false })
  scheduleFlush()
}

/** Bir node silindi: tombstone olarak push kuyruğuna al. Space yoksa no-op. */
export async function markDeleted(id: string) {
  if (!activeSpaceId || !supabase) return
  await db.outbox.put({ nodeId: id, deleted: true })
  scheduleFlush()
}

function scheduleFlush(delay = 400) {
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flushOutbox()
  }, delay)
}

// ---- Push (outbox -> Supabase) ----

export async function flushOutbox(): Promise<void> {
  if (!supabase || !activeSpaceId) return
  if (flushing) {
    flushQueued = true
    return
  }
  flushing = true
  try {
    const entries = await db.outbox.toArray()
    if (!entries.length) return

    const deleteIds: string[] = []
    const upsertRows: Insert[] = []
    for (const e of entries) {
      if (e.deleted) {
        deleteIds.push(e.nodeId)
        continue
      }
      const node = await db.nodes.get(e.nodeId)
      if (node) upsertRows.push(nodeToRow(node, activeSpaceId))
      else deleteIds.push(e.nodeId) // arada silinmiş
    }

    const done: string[] = []

    if (upsertRows.length) {
      const { error } = await supabase.from('nodes').upsert(upsertRows)
      if (error) throw error
      for (const r of upsertRows) done.push(r.id)
    }

    if (deleteIds.length) {
      // Mevcut uzaktaki satırı tombstone yap (NOT NULL alanları korur).
      const { error } = await supabase
        .from('nodes')
        .update({ deleted: true, updated_at: Date.now() })
        .in('id', deleteIds)
        .eq('space_id', activeSpaceId)
      if (error) throw error
      done.push(...deleteIds)
    }

    if (done.length) await db.outbox.bulkDelete(done)
  } catch (e) {
    console.warn('[sync] flush hatası, sonra tekrar denenecek:', (e as Error).message)
    scheduleFlush(5000) // geri çekil ve tekrar dene
  } finally {
    flushing = false
    if (flushQueued) {
      flushQueued = false
      scheduleFlush(0)
    }
  }
}

/** Tüm yerel node'ları push kuyruğuna alıp gönderir (space oluşturma/katılmada). */
export async function pushAllLocal(): Promise<void> {
  if (!supabase || !activeSpaceId) return
  const ids = await db.nodes.toCollection().primaryKeys()
  if (ids.length) {
    await db.outbox.bulkPut(ids.map((nodeId) => ({ nodeId: nodeId as string, deleted: false })))
  }
  await flushOutbox()
  await pushAllLocalPhotos()
}

// ---- Pull (Supabase -> yerel, son-yazan-kazanır) ----

function pulledKey(spaceId: string) {
  return `witb.pulledAt.${spaceId}`
}
function getLastPulledAt(spaceId: string): number {
  const v = Number(localStorage.getItem(pulledKey(spaceId)))
  return Number.isFinite(v) ? v : 0
}
function setLastPulledAt(spaceId: string, v: number) {
  try {
    localStorage.setItem(pulledKey(spaceId), String(v))
  } catch {
    /* yoksay */
  }
}

export async function pullChanges(): Promise<void> {
  if (!supabase || !activeSpaceId) return
  const spaceId = activeSpaceId
  const since = getLastPulledAt(spaceId)
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('space_id', spaceId)
    .gt('updated_at', since)
    .order('updated_at', { ascending: true })
  if (error) {
    console.warn('[sync] pull hatası:', error.message)
    return
  }
  if (!data || !data.length) return
  applyRemoteRows(data)
  const maxUpdated = data.reduce((m, r) => Math.max(m, r.updated_at), since)
  setLastPulledAt(spaceId, maxUpdated)
}

/** Uzaktaki satırları yerele uygular (Dexie + bellek), LWW kuralıyla. */
export function applyRemoteRows(rows: Row[]) {
  const state = useNodesStore.getState()
  const byId = new Map(state.nodes.map((n) => [n.id, n]))
  const dexieUpserts: NodeRow[] = []
  const dexieDeletes: string[] = []
  const orphanPhotoIds: string[] = []

  for (const row of rows) {
    const local = byId.get(row.id)
    if (!isRemoteNewer(local?.updatedAt, row.updated_at)) continue // yerel daha yeni
    if (row.deleted) {
      if (local) {
        byId.delete(row.id)
        dexieDeletes.push(row.id)
        if (local.photoIds?.length) orphanPhotoIds.push(...local.photoIds)
      }
    } else {
      const node = rowToNode(row)
      byId.set(row.id, node)
      dexieUpserts.push(node)
    }
  }

  if (!dexieUpserts.length && !dexieDeletes.length) return

  // Dexie'ye yaz (bu yazılar outbox tetiklemez; sadece store aksiyonları tetikler).
  void (async () => {
    if (dexieUpserts.length) await db.nodes.bulkPut(dexieUpserts)
    if (dexieDeletes.length) await db.nodes.bulkDelete(dexieDeletes)
    if (orphanPhotoIds.length) {
      orphanPhotoIds.forEach(invalidateThumb)
      await deletePhotos(orphanPhotoIds)
    }
  })()

  useNodesStore.setState({ nodes: Array.from(byId.values()) })
}

// ---- Fotoğraf senkronu (Storage) ----

export async function markPhotoDirty(id: string) {
  if (!activeSpaceId || !supabase) return
  await db.photoOutbox.put({ photoId: id, deleted: false })
  schedulePhotoFlush()
}

export async function markPhotoDeleted(id: string) {
  if (!activeSpaceId || !supabase) return
  await db.photoOutbox.put({ photoId: id, deleted: true })
  schedulePhotoFlush()
}

function schedulePhotoFlush(delay = 600) {
  if (photoFlushTimer) clearTimeout(photoFlushTimer)
  photoFlushTimer = setTimeout(() => {
    photoFlushTimer = null
    void flushPhotoOutbox()
  }, delay)
}

export async function flushPhotoOutbox(): Promise<void> {
  if (!supabase || !activeSpaceId) return
  if (photoFlushing) {
    photoFlushQueued = true
    return
  }
  photoFlushing = true
  const sid = activeSpaceId
  try {
    const entries = await db.photoOutbox.toArray()
    for (const e of entries) {
      try {
        if (e.deleted) {
          await supabase.storage
            .from(PHOTO_BUCKET)
            .remove([fullPath(sid, e.photoId), thumbPath(sid, e.photoId)])
          await supabase
            .from('photos')
            .update({ deleted: true, updated_at: Date.now() })
            .eq('id', e.photoId)
            .eq('space_id', sid)
        } else {
          const row = await db.photos.get(e.photoId)
          if (!row) {
            await db.photoOutbox.delete(e.photoId) // arada silinmiş
            continue
          }
          const up1 = await supabase.storage
            .from(PHOTO_BUCKET)
            .upload(fullPath(sid, e.photoId), row.blob, {
              upsert: true,
              contentType: row.blob.type || 'image/jpeg',
            })
          if (up1.error) throw up1.error
          const up2 = await supabase.storage
            .from(PHOTO_BUCKET)
            .upload(thumbPath(sid, e.photoId), row.thumbBlob, {
              upsert: true,
              contentType: row.thumbBlob.type || 'image/jpeg',
            })
          if (up2.error) throw up2.error
          const meta: PhotoMetaInsert = {
            id: e.photoId,
            space_id: sid,
            storage_path: fullPath(sid, e.photoId),
            thumb_path: thumbPath(sid, e.photoId),
            deleted: false,
            created_at: Date.now(),
            updated_at: Date.now(),
          }
          const { error } = await supabase.from('photos').upsert(meta)
          if (error) throw error
        }
        await db.photoOutbox.delete(e.photoId)
      } catch (err) {
        console.warn('[sync] foto flush hatası, sonra denenecek:', (err as Error).message)
        schedulePhotoFlush(8000)
        break // kalanları sonraki denemeye bırak
      }
    }
  } finally {
    photoFlushing = false
    if (photoFlushQueued) {
      photoFlushQueued = false
      schedulePhotoFlush(0)
    }
  }
}

/** Tüm yerel fotoğrafları yükleme kuyruğuna alıp gönderir (space oluşturma/katılmada). */
export async function pushAllLocalPhotos(): Promise<void> {
  if (!supabase || !activeSpaceId) return
  const ids = await db.photos.toCollection().primaryKeys()
  if (ids.length) {
    await db.photoOutbox.bulkPut(ids.map((photoId) => ({ photoId: photoId as string, deleted: false })))
  }
  await flushPhotoOutbox()
}

function photoPulledKey(sid: string) {
  return `witb.photoPulledAt.${sid}`
}
function getPhotoPulledAt(sid: string): number {
  const v = Number(localStorage.getItem(photoPulledKey(sid)))
  return Number.isFinite(v) ? v : 0
}
function setPhotoPulledAt(sid: string, v: number) {
  try {
    localStorage.setItem(photoPulledKey(sid), String(v))
  } catch {
    /* yoksay */
  }
}

export async function pullPhotos(): Promise<void> {
  if (!supabase || !activeSpaceId) return
  const sid = activeSpaceId
  const since = getPhotoPulledAt(sid)
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('space_id', sid)
    .gt('updated_at', since)
    .order('updated_at', { ascending: true })
  if (error) {
    console.warn('[sync] foto pull hatası:', error.message)
    return
  }
  if (!data || !data.length) return
  let lastOk = since
  for (const meta of data) {
    const ok = await applyRemotePhoto(meta)
    if (!ok) break // indirme başarısız: imleci ilerletme, sonra tekrar dene
    lastOk = Math.max(lastOk, meta.updated_at)
  }
  if (lastOk > since) setPhotoPulledAt(sid, lastOk)
}

/** Tek foto metadata satırını uygular: yoksa indir, silindiyse yerelden kaldır. */
async function applyRemotePhoto(meta: PhotoMetaRow): Promise<boolean> {
  if (!supabase) return false
  try {
    if (meta.deleted) {
      const existing = await db.photos.get(meta.id)
      if (existing) {
        invalidateThumb(meta.id)
        await db.photos.delete(meta.id)
        bumpPhotoTick()
      }
      return true
    }
    if (await db.photos.get(meta.id)) return true // zaten yerelde
    if (!meta.storage_path || !meta.thumb_path) return true
    const full = await supabase.storage.from(PHOTO_BUCKET).download(meta.storage_path)
    if (full.error || !full.data) throw full.error ?? new Error('indirme boş')
    const thumb = await supabase.storage.from(PHOTO_BUCKET).download(meta.thumb_path)
    if (thumb.error || !thumb.data) throw thumb.error ?? new Error('thumb indirme boş')
    await db.photos.put({ id: meta.id, blob: full.data, thumbBlob: thumb.data })
    bumpPhotoTick()
    return true
  } catch (err) {
    console.warn('[sync] foto indirilemedi, sonra denenecek:', (err as Error).message)
    return false
  }
}

function bumpPhotoTick() {
  useNodesStore.setState((s) => ({ photoTick: s.photoTick + 1 }))
}

function subscribePhotosRealtime(sid: string) {
  if (!supabase) return
  photoChannel = supabase
    .channel(`photos:${sid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'photos', filter: `space_id=eq.${sid}` },
      (payload) => {
        const row = payload.new as PhotoMetaRow
        if (row && row.id) void applyRemotePhoto(row)
      },
    )
    .subscribe()
}

// ---- Realtime ----

function subscribeRealtime(spaceId: string) {
  if (!supabase) return
  channel = supabase
    .channel(`nodes:${spaceId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'nodes', filter: `space_id=eq.${spaceId}` },
      (payload) => {
        const row = payload.new as Row
        if (row && row.id) applyRemoteRows([row])
      },
    )
    .subscribe()
}

// ---- Yaşam döngüsü ----

let onlineHandler: (() => void) | null = null

export async function startSync(): Promise<void> {
  if (!supabase || !activeSpaceId) return
  const sid = activeSpaceId
  await flushOutbox() // bekleyen yerel düğüm değişikliklerini gönder
  await pullChanges() // uzaktaki düğümleri yakala
  subscribeRealtime(sid)
  // Fotoğraflar (Storage)
  await flushPhotoOutbox()
  await pullPhotos()
  subscribePhotosRealtime(sid)

  // Çevrimiçi olunca tekrar senkronla.
  onlineHandler = () => {
    void flushOutbox()
    void pullChanges()
    void flushPhotoOutbox()
    void pullPhotos()
  }
  window.addEventListener('online', onlineHandler)
}

export function stopSync() {
  if (channel) {
    void supabase?.removeChannel(channel)
    channel = null
  }
  if (photoChannel) {
    void supabase?.removeChannel(photoChannel)
    photoChannel = null
  }
  if (onlineHandler) {
    window.removeEventListener('online', onlineHandler)
    onlineHandler = null
  }
}
