import { Capacitor } from '@capacitor/core'

/**
 * Fotoğraf yakalar ve Blob döndürür. İptal edilirse null.
 * - Native (Android): Capacitor Camera (kamera veya galeri seçimi).
 * - Web (geliştirme): gizli <input type="file" capture> ile.
 */
export async function capturePhoto(): Promise<Blob | null> {
  if (Capacitor.isNativePlatform()) {
    return captureNative()
  }
  return captureWeb()
}

/** Çoklu fotoğraf yakalar. Native: tek (kamera/galeri prompt). Web: çoklu seçim. */
export async function capturePhotos(): Promise<Blob[]> {
  if (Capacitor.isNativePlatform()) {
    const blob = await captureNative()
    return blob ? [blob] : []
  }
  return captureWebMultiple()
}

function captureWebMultiple(): Promise<Blob[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = () => resolve(input.files ? Array.from(input.files) : [])
    input.click()
  })
}

async function captureNative(): Promise<Blob | null> {
  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      quality: 70,
      correctOrientation: true,
      promptLabelHeader: 'Fotoğraf',
      promptLabelPhoto: 'Galeriden seç',
      promptLabelPicture: 'Fotoğraf çek',
      promptLabelCancel: 'İptal',
    })
    if (!photo.webPath) return null
    const res = await fetch(photo.webPath)
    return await res.blob()
  } catch {
    // Kullanıcı iptal etti veya izin yok.
    return null
  }
}

function captureWeb(): Promise<Blob | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.setAttribute('capture', 'environment')
    input.onchange = () => {
      const file = input.files?.[0] ?? null
      resolve(file)
    }
    // Bazı tarayıcılarda iptal olayı yok; basit tutuyoruz.
    input.click()
  })
}
