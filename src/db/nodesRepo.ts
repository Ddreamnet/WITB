import { db } from './db'
import type { NodeRow } from './types'
import { newId } from '../lib/id'
import { normalizeText } from '../lib/text'

const now = () => Date.now()

/** Tüm node'ları belleğe yüklemek için (açılışta). */
export async function loadAllNodes(): Promise<NodeRow[]> {
  return db.nodes.toArray()
}

export interface CreateNodeInput {
  name: string
  parentId: string | null
  quantity?: number
  order: number
}

export async function createNode(input: CreateNodeInput): Promise<NodeRow> {
  const t = now()
  const node: NodeRow = {
    id: newId(),
    name: input.name.trim(),
    nameLower: normalizeText(input.name),
    parentId: input.parentId,
    quantity: input.quantity ?? 1,
    order: input.order,
    createdAt: t,
    updatedAt: t,
  }
  await db.nodes.add(node)
  return node
}

export async function renameNode(id: string, name: string): Promise<void> {
  await db.nodes.update(id, {
    name: name.trim(),
    nameLower: normalizeText(name),
    updatedAt: now(),
  })
}

export async function setQuantity(id: string, quantity: number): Promise<void> {
  await db.nodes.update(id, { quantity, updatedAt: now() })
}

export async function setPhotos(id: string, photoIds: string[]): Promise<void> {
  await db.nodes.update(id, { photoIds, updatedAt: now() })
}

export async function setSkipDeleteConfirm(id: string, value: boolean): Promise<void> {
  await db.nodes.update(id, { skipDeleteConfirm: value, updatedAt: now() })
}

export async function setParent(id: string, parentId: string | null, order: number): Promise<void> {
  await db.nodes.update(id, { parentId, order, updatedAt: now() })
}

/**
 * Bir node'u ve tüm alt ağacını siler. İlişkili fotoğrafların id'lerini döndürür
 * ki çağıran taraf onları photos tablosundan da temizleyebilsin.
 */
export async function deleteSubtree(rootId: string, all: NodeRow[]): Promise<string[]> {
  const childrenByParent = new Map<string | null, NodeRow[]>()
  for (const n of all) {
    const arr = childrenByParent.get(n.parentId) ?? []
    arr.push(n)
    childrenByParent.set(n.parentId, arr)
  }

  const toDelete: string[] = []
  const photoIds: string[] = []
  const stack = [rootId]
  while (stack.length) {
    const id = stack.pop()!
    toDelete.push(id)
    const node = all.find((n) => n.id === id)
    if (node?.photoIds?.length) photoIds.push(...node.photoIds)
    for (const child of childrenByParent.get(id) ?? []) stack.push(child.id)
  }

  await db.nodes.bulkDelete(toDelete)
  return photoIds
}
