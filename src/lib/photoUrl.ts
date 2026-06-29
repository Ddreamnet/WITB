import { useEffect, useState } from 'react'
import { getPhoto } from '../db/photosRepo'

// Thumbnail object URL'leri önbelleklenir; kaydırma sırasında tekrar yüklenmez.
const thumbCache = new Map<string, string>()

async function loadThumbUrl(photoId: string): Promise<string | null> {
  const cached = thumbCache.get(photoId)
  if (cached) return cached
  const row = await getPhoto(photoId)
  if (!row) return null
  const url = URL.createObjectURL(row.thumbBlob)
  thumbCache.set(photoId, url)
  return url
}

/** Liste kartı için küçük thumbnail URL'i (önbellekli). */
export function useThumbUrl(photoId: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(() =>
    photoId ? thumbCache.get(photoId) ?? null : null,
  )
  useEffect(() => {
    let alive = true
    if (!photoId) {
      setUrl(null)
      return
    }
    loadThumbUrl(photoId).then((u) => {
      if (alive) setUrl(u)
    })
    return () => {
      alive = false
    }
  }, [photoId])
  return url
}

/** Tam görsel URL'i (görüntüleyici için); kapanınca serbest bırakılır. */
export function useFullUrl(photoId: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    let created: string | null = null
    if (!photoId) {
      setUrl(null)
      return
    }
    getPhoto(photoId).then((row) => {
      if (!alive || !row) return
      created = URL.createObjectURL(row.blob)
      setUrl(created)
    })
    return () => {
      alive = false
      if (created) URL.revokeObjectURL(created)
    }
  }, [photoId])
  return url
}

/** Bir thumbnail önbellek girdisini temizler (fotoğraf değişince/silinince). */
export function invalidateThumb(photoId: string): void {
  const u = thumbCache.get(photoId)
  if (u) {
    URL.revokeObjectURL(u)
    thumbCache.delete(photoId)
  }
}
