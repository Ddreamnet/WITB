// Fotoğrafı hızlı görüntüleme için küçültür/sıkıştırır.
// Kalite önemli değil (spec): tam görsel ~1280px, thumbnail ~96px.

const FULL_MAX = 1280
const THUMB_MAX = 96
const QUALITY = 0.6

export interface ProcessedImage {
  full: Blob
  thumb: Blob
}

export async function processImage(source: Blob): Promise<ProcessedImage> {
  const bitmap = await toBitmap(source)
  try {
    const full = await resize(bitmap, FULL_MAX)
    const thumb = await resize(bitmap, THUMB_MAX)
    return { full, thumb }
  } finally {
    if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close()
  }
}

type Drawable = ImageBitmap | HTMLImageElement

async function toBitmap(source: Blob): Promise<Drawable> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(source)
  }
  // Yedek: HTMLImageElement
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(source)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

function dims(d: Drawable): { w: number; h: number } {
  if (d instanceof HTMLImageElement) return { w: d.naturalWidth, h: d.naturalHeight }
  return { w: d.width, h: d.height }
}

async function resize(d: Drawable, maxDim: number): Promise<Blob> {
  const { w, h } = dims(d)
  const scale = Math.min(1, maxDim / Math.max(w, h))
  const tw = Math.max(1, Math.round(w * scale))
  const th = Math.max(1, Math.round(h * scale))

  const canvas = document.createElement('canvas')
  canvas.width = tw
  canvas.height = th
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(d, 0, 0, tw, th)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob başarısız'))),
      'image/jpeg',
      QUALITY,
    )
  })
}
