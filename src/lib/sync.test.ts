import { describe, it, expect } from 'vitest'
import { nodeToRow, rowToNode, isRemoteNewer } from './sync'
import type { NodeRow } from '../db/types'
import type { Database } from '../db/database.types'

type Row = Database['public']['Tables']['nodes']['Row']

describe('sync dönüştürücüler', () => {
  const node: NodeRow = {
    id: 'n1',
    name: 'Mutfak Kutusu',
    nameLower: 'mutfak kutusu',
    parentId: null,
    quantity: 2,
    photoIds: ['p1', 'p2'],
    order: -3,
    skipDeleteConfirm: true,
    createdAt: 1000,
    updatedAt: 2000,
  }

  it('nodeToRow ↔ rowToNode tam tur (round-trip) korunur', () => {
    const row = nodeToRow(node, 'space-1')
    expect(row.space_id).toBe('space-1')
    expect(row.name_lower).toBe('mutfak kutusu')
    expect(row.parent_id).toBeNull()
    expect(row.photo_ids).toEqual(['p1', 'p2'])
    expect(row.skip_delete_confirm).toBe(true)
    expect(row.deleted).toBe(false)

    const back = rowToNode({ ...(row as Row), deleted: false })
    expect(back).toEqual(node)
  })

  it('boş photoIds ve falsy skip undefined olur; parentId korunur', () => {
    const minimal: NodeRow = {
      id: 'n2',
      name: 'X',
      nameLower: 'x',
      parentId: 'p',
      quantity: 1,
      order: 0,
      createdAt: 1,
      updatedAt: 1,
    }
    const row = nodeToRow(minimal, 's')
    expect(row.photo_ids).toEqual([])
    expect(row.skip_delete_confirm).toBe(false)

    const back = rowToNode({ ...(row as Row), deleted: false })
    expect(back.photoIds).toBeUndefined()
    expect(back.skipDeleteConfirm).toBeUndefined()
    expect(back.parentId).toBe('p')
  })
})

describe('isRemoteNewer (son-yazan-kazanır)', () => {
  it('yerel yoksa uzaktaki kazanır', () => expect(isRemoteNewer(undefined, 1)).toBe(true))
  it('eşit zamanda uzaktaki uygulanır (idempotent)', () => expect(isRemoteNewer(5, 5)).toBe(true))
  it('uzaktaki daha yeniyse kazanır', () => expect(isRemoteNewer(5, 6)).toBe(true))
  it('yerel daha yeniyse korunur', () => expect(isRemoteNewer(7, 6)).toBe(false))
})
