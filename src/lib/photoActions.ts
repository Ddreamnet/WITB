import { capturePhotos } from './camera'
import { processImage } from './image'
import { savePhoto } from '../db/photosRepo'

/**
 * Fotoğraf(lar) yakalar, küçültüp kaydeder ve node'a EKLER (mevcutları silmez).
 * Web'de aynı anda birden fazla seçilebilir. Hiç seçilmezse 0 döner.
 */
export async function captureAndAdd(
  nodeId: string,
  addPhotos: (id: string, photoIds: string[]) => Promise<void>,
): Promise<number> {
  const blobs = await capturePhotos()
  if (!blobs.length) return 0

  const ids: string[] = []
  for (const blob of blobs) {
    const { full, thumb } = await processImage(blob)
    ids.push(await savePhoto(full, thumb))
  }
  await addPhotos(nodeId, ids)
  return ids.length
}
