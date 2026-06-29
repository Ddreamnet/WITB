import Dexie, { type Table } from 'dexie'
import type { NodeRow, PhotoRow } from './types'

/** Buluta gönderilmeyi bekleyen yerel değişiklik. nodeId birincil anahtar => aynı
 *  node'un birden fazla değişikliği tek girişte birleşir (en son durum gönderilir). */
export interface OutboxRow {
  nodeId: string
  /** true => silme tombstone'u, false => oluştur/güncelle. */
  deleted: boolean
}

/** Buluta (Storage) gönderilmeyi bekleyen fotoğraf değişikliği. */
export interface PhotoOutboxRow {
  photoId: string
  deleted: boolean
}

export class WitbDB extends Dexie {
  nodes!: Table<NodeRow, string>
  photos!: Table<PhotoRow, string>
  outbox!: Table<OutboxRow, string>
  photoOutbox!: Table<PhotoOutboxRow, string>

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
    // v3: bulut senkronu için bekleyen-değişiklik kutusu (outbox).
    this.version(3).stores({
      nodes: 'id, parentId, nameLower, order, createdAt',
      photos: 'id',
      outbox: 'nodeId',
    })
    // v4: fotoğraf (Storage) senkronu için bekleyen-değişiklik kutusu.
    this.version(4).stores({
      nodes: 'id, parentId, nameLower, order, createdAt',
      photos: 'id',
      outbox: 'nodeId',
      photoOutbox: 'photoId',
    })
  }
}

export const db = new WitbDB()
