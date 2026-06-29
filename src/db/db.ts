import Dexie, { type Table } from 'dexie'
import type { NodeRow, PhotoRow } from './types'

export class WitbDB extends Dexie {
  nodes!: Table<NodeRow, string>
  photos!: Table<PhotoRow, string>

  constructor() {
    super('whats-in-the-box')
    // parentId => bir kabın çocuklarını hızlı çekme.
    // nameLower => isimle hızlı arama (prefix indeksli).
    this.version(1).stores({
      nodes: 'id, parentId, nameLower, order, createdAt',
      photos: 'id',
    })
    // v2: tek photoId → çoklu photoIds[]. Mevcut fotoğrafı diziye taşı.
    this.version(2)
      .stores({
        nodes: 'id, parentId, nameLower, order, createdAt',
        photos: 'id',
      })
      .upgrade(async (tx) => {
        await tx
          .table('nodes')
          .toCollection()
          .modify((n: { photoId?: string; photoIds?: string[] }) => {
            if (n.photoId) n.photoIds = [n.photoId]
            delete n.photoId
          })
      })
  }
}

export const db = new WitbDB()
