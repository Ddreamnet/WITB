import { create } from 'zustand'
import { useMemo } from 'react'
import type { NodeRow } from '../db/types'
import * as nodesRepo from '../db/nodesRepo'
import { deletePhotos } from '../db/photosRepo'
import { invalidateThumb } from '../lib/photoUrl'
import { normalizeText } from '../lib/text'
import { markDirty, markDeleted, markPhotoDeleted } from '../lib/sync'

interface NodesState {
  nodes: NodeRow[]
  loaded: boolean
  /** Uzaktan fotoğraf indirilince artar; thumbnail/görsel hook'larını yeniler. */
  photoTick: number
  init: () => Promise<void>

  createBox: (name: string) => Promise<NodeRow>
  addItem: (parentId: string, name: string) => Promise<NodeRow>
  /** Aynı isim varsa adetini artırır, yoksa ekler (öneri çipleri için). */
  addOrIncrement: (parentId: string, name: string) => Promise<NodeRow>
  rename: (id: string, name: string) => Promise<void>
  increment: (id: string) => Promise<void>
  decrement: (id: string) => Promise<void>
  addPhotos: (id: string, photoIds: string[]) => Promise<void>
  removePhoto: (id: string, photoId: string) => Promise<void>
  setSkip: (boxId: string, value: boolean) => Promise<void>
  moveTo: (id: string, newParentId: string | null) => Promise<void>
  remove: (id: string) => Promise<void>
}

/** Yeni eklenen/taşınan node'u en üste koymak için en küçük order - 1. */
function topOrder(siblings: NodeRow[]): number {
  if (!siblings.length) return 0
  return Math.min(...siblings.map((s) => s.order)) - 1
}

export const useNodesStore = create<NodesState>((set, get) => ({
  nodes: [],
  loaded: false,
  photoTick: 0,

  async init() {
    const nodes = await nodesRepo.loadAllNodes()
    set({ nodes, loaded: true })
  },

  async createBox(name) {
    const siblings = get().nodes.filter((n) => n.parentId === null)
    const node = await nodesRepo.createNode({ name, parentId: null, order: topOrder(siblings) })
    set((s) => ({ nodes: [...s.nodes, node] }))
    void markDirty(node.id)
    return node
  },

  async addItem(parentId, name) {
    const siblings = get().nodes.filter((n) => n.parentId === parentId)
    const node = await nodesRepo.createNode({ name, parentId, order: topOrder(siblings) })
    set((s) => ({ nodes: [...s.nodes, node] }))
    void markDirty(node.id)
    return node
  },

  async addOrIncrement(parentId, name) {
    const key = normalizeText(name)
    const existing = get().nodes.find((n) => n.parentId === parentId && n.nameLower === key)
    if (existing) {
      const q = existing.quantity + 1
      set((s) => ({ nodes: s.nodes.map((n) => (n.id === existing.id ? { ...n, quantity: q } : n)) }))
      await nodesRepo.setQuantity(existing.id, q)
      void markDirty(existing.id)
      return { ...existing, quantity: q }
    }
    return get().addItem(parentId, name)
  },

  async rename(id, name) {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, name: name.trim(), nameLower: normalizeText(name) } : n,
      ),
    }))
    await nodesRepo.renameNode(id, name)
    void markDirty(id)
  },

  async increment(id) {
    const node = get().nodes.find((n) => n.id === id)
    if (!node) return
    const q = node.quantity + 1
    set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, quantity: q } : n)) }))
    await nodesRepo.setQuantity(id, q)
    void markDirty(id)
  },

  async decrement(id) {
    const node = get().nodes.find((n) => n.id === id)
    if (!node || node.quantity <= 1) return
    const q = node.quantity - 1
    set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, quantity: q } : n)) }))
    await nodesRepo.setQuantity(id, q)
    void markDirty(id)
  },

  async addPhotos(id, photoIds) {
    if (!photoIds.length) return
    const node = get().nodes.find((n) => n.id === id)
    const ids = [...(node?.photoIds ?? []), ...photoIds]
    set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, photoIds: ids } : n)) }))
    await nodesRepo.setPhotos(id, ids)
    void markDirty(id)
  },

  async removePhoto(id, photoId) {
    const node = get().nodes.find((n) => n.id === id)
    const ids = (node?.photoIds ?? []).filter((p) => p !== photoId)
    set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, photoIds: ids } : n)) }))
    await nodesRepo.setPhotos(id, ids)
    void markDirty(id)
    invalidateThumb(photoId)
    await deletePhotos([photoId])
    void markPhotoDeleted(photoId)
  },

  async setSkip(boxId, value) {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === boxId ? { ...n, skipDeleteConfirm: value } : n)),
    }))
    await nodesRepo.setSkipDeleteConfirm(boxId, value)
    void markDirty(boxId)
  },

  async moveTo(id, newParentId) {
    const siblings = get().nodes.filter((n) => n.parentId === newParentId)
    const order = topOrder(siblings)
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, parentId: newParentId, order } : n)),
    }))
    await nodesRepo.setParent(id, newParentId, order)
    void markDirty(id)
  },

  async remove(id) {
    const all = get().nodes
    const photoIds = await nodesRepo.deleteSubtree(id, all)
    // Silinen alt ağacın tüm id'lerini bellekten de çıkar.
    const removed = new Set<string>()
    const childrenByParent = new Map<string | null, NodeRow[]>()
    for (const n of all) {
      const arr = childrenByParent.get(n.parentId) ?? []
      arr.push(n)
      childrenByParent.set(n.parentId, arr)
    }
    const stack = [id]
    while (stack.length) {
      const cur = stack.pop()!
      removed.add(cur)
      for (const child of childrenByParent.get(cur) ?? []) stack.push(child.id)
    }
    set((s) => ({ nodes: s.nodes.filter((n) => !removed.has(n.id)) }))
    removed.forEach((rid) => void markDeleted(rid))
    await deletePhotos(photoIds)
    photoIds.forEach((pid) => void markPhotoDeleted(pid))
  },
}))

// ---- Türetilmiş seçiciler (bellekten anlık) ----

export function useChildren(parentId: string | null): NodeRow[] {
  const nodes = useNodesStore((s) => s.nodes)
  return useMemo(
    () =>
      nodes
        .filter((n) => n.parentId === parentId)
        .sort((a, b) => a.order - b.order),
    [nodes, parentId],
  )
}

export function useNode(id: string | undefined): NodeRow | undefined {
  const nodes = useNodesStore((s) => s.nodes)
  return useMemo(() => (id ? nodes.find((n) => n.id === id) : undefined), [nodes, id])
}

/** Verilen node'un kaç çocuğu olduğunu döndürür (kap mı, kaç item var). */
export function useChildCount(id: string): number {
  const nodes = useNodesStore((s) => s.nodes)
  return useMemo(() => nodes.filter((n) => n.parentId === id).length, [nodes, id])
}

/** Kökten node'a kadar olan ata zincirini döndürür (node dahil). */
export function usePath(id: string | undefined): NodeRow[] {
  const nodes = useNodesStore((s) => s.nodes)
  return useMemo(() => {
    if (!id) return []
    const byId = new Map(nodes.map((n) => [n.id, n]))
    const chain: NodeRow[] = []
    let cur = byId.get(id)
    let guard = 0
    while (cur && guard++ < 1000) {
      chain.unshift(cur)
      cur = cur.parentId ? byId.get(cur.parentId) : undefined
    }
    return chain
  }, [nodes, id])
}
