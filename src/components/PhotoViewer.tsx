import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFullUrl } from '../lib/photoUrl'
import { Icon } from './Icon'

function Slide({ photoId }: { photoId: string }) {
  const url = useFullUrl(photoId)
  return (
    <div className="viewer__slide">
      {url ? <img src={url} alt="" /> : <span className="viewer__loading">Yükleniyor…</span>}
    </div>
  )
}

interface Props {
  photoIds: string[]
  /** Açılışta gösterilecek başlangıç indeksi. */
  start?: number
  onClose: () => void
  /** Verilirse galeride "bu fotoğrafı sil" görünür. */
  onDelete?: (photoId: string) => void
  /** Verilirse galeride "fotoğraf ekle" görünür. */
  onAdd?: () => void
}

/**
 * Tam ekran, sağa-sola kaydırılabilir fotoğraf galerisi. Kaydırma yerel
 * scroll-snap ile yapılır (compositor → çok smooth, kasmaz).
 */
export function PhotoViewer({ photoIds, start = 0, onClose, onDelete, onAdd }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(start)

  // Başlangıç slaytına anında kaydır (yalnız mount).
  useLayoutEffect(() => {
    const el = trackRef.current
    if (el) el.scrollLeft = start * el.clientWidth
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fotoğraf silinince diziyi takip et: boşaldıysa kapat, indeks taşarsa sınırla.
  useEffect(() => {
    if (photoIds.length === 0) {
      onClose()
      return
    }
    if (index > photoIds.length - 1) {
      const ni = photoIds.length - 1
      setIndex(ni)
      const el = trackRef.current
      if (el) el.scrollLeft = ni * el.clientWidth
    }
  }, [photoIds.length, index, onClose])

  function onScroll() {
    const el = trackRef.current
    if (!el || el.clientWidth === 0) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== index) setIndex(i)
  }

  const current = photoIds[index]

  return createPortal(
    <div className="viewer">
      <div className="viewer__bar">
        <button className="viewer__btn" onClick={onClose} aria-label="Kapat">
          <Icon name="x" size={22} />
        </button>
        {photoIds.length > 0 && (
          <span className="viewer__count">
            {index + 1} / {photoIds.length}
          </span>
        )}
        <div className="viewer__bar-right">
          {onAdd && (
            <button className="viewer__btn" onClick={onAdd} aria-label="Fotoğraf ekle">
              <Icon name="plus" size={22} />
            </button>
          )}
          {onDelete && current && (
            <button
              className="viewer__btn viewer__btn--danger"
              onClick={() => onDelete(current)}
              aria-label="Bu fotoğrafı sil"
            >
              <Icon name="trash" size={20} />
            </button>
          )}
        </div>
      </div>
      <div className="viewer__track" ref={trackRef} onScroll={onScroll}>
        {photoIds.map((id) => (
          <Slide key={id} photoId={id} />
        ))}
      </div>
    </div>,
    document.body,
  )
}
