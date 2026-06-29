import { db } from './db'
import type { PhotoRow } from './types'
import { newId } from '../lib/id'

export async function savePhoto(blob: Blob, thumbBlob: Blob): Promise<string> {
  const id = newId()
  const row: PhotoRow = { id, blob, thumbBlob }
  await db.photos.add(row)
  return id
}

export async function getPhoto(id: string): Promise<PhotoRow | undefined> {
  return db.photos.get(id)
}

export async function deletePhotos(ids: string[]): Promise<void> {
  if (ids.length) await db.photos.bulkDelete(ids)
}
