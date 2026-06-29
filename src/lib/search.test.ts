import { describe, expect, it } from 'vitest'
import { searchNodes } from './search'
import type { NodeRow } from '../db/types'
import { normalizeText } from './text'

function n(id: string, name: string, parentId: string | null): NodeRow {
  return {
    id,
    name,
    nameLower: normalizeText(name),
    parentId,
    quantity: 1,
    order: 0,
    createdAt: 0,
    updatedAt: 0,
  }
}

const nodes: NodeRow[] = [
  n('koli', '13. Koli', null),
  n('ilk', 'İlk Yardım Çantası', null),
  n('sargi', 'Sargı bezi', 'ilk'),
  n('makas', 'Makas', 'koli'),
]

describe('searchNodes', () => {
  it('aksan duyarsız eşleşir ve konum yolunu verir', () => {
    const hits = searchNodes(nodes, 'sargi')
    expect(hits).toHaveLength(1)
    expect(hits[0].node.id).toBe('sargi')
    expect(hits[0].locationPath).toBe('İlk Yardım Çantası')
  })

  it('boş sorguda sonuç dönmez', () => {
    expect(searchNodes(nodes, '   ')).toHaveLength(0)
  })

  it('birden çok kelimenin hepsi geçmeli', () => {
    expect(searchNodes(nodes, 'ilk yardim')).toHaveLength(1)
    expect(searchNodes(nodes, 'ilk makas')).toHaveLength(0)
  })
})
