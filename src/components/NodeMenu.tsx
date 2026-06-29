import { Modal } from './Modal'
import { Icon } from './Icon'

interface Props {
  name: string
  isContainer: boolean
  onEnter: () => void
  onRename: () => void
  onMove: () => void
  onPhoto: () => void
  onClose: () => void
  /** Verilirse menüde kırmızı "Sil" seçeneği görünür (örn. kutu başlığı menüsü). */
  onDelete?: () => void
}

/** Bir node için aksiyon menüsü (kebab ⋮). */
export function NodeMenu({
  name,
  isContainer,
  onEnter,
  onRename,
  onMove,
  onPhoto,
  onClose,
  onDelete,
}: Props) {
  return (
    <Modal onClose={onClose}>
      <h3
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </h3>
      <div className="optlist">
        <button className="opt" onClick={onEnter}>
          <span className="opt__ic">
            <Icon name={isContainer ? 'enter' : 'layers'} size={19} />
          </span>
          <span>{isContainer ? 'İçine gir' : 'Alt liste oluştur'}</span>
        </button>
        <button className="opt" onClick={onPhoto}>
          <span className="opt__ic">
            <Icon name="camera" size={19} />
          </span>
          <span>Fotoğraf ekle</span>
        </button>
        <button className="opt" onClick={onRename}>
          <span className="opt__ic">
            <Icon name="pencil" size={19} />
          </span>
          <span>Yeniden adlandır</span>
        </button>
        <button className="opt" onClick={onMove}>
          <span className="opt__ic">
            <Icon name="move" size={19} />
          </span>
          <span>Taşı / dışarı çıkar</span>
        </button>
        {onDelete && (
          <button className="opt opt--danger" onClick={onDelete}>
            <span className="opt__ic">
              <Icon name="trash" size={19} />
            </span>
            <span>Sil</span>
          </button>
        )}
      </div>
      <div className="modal__row">
        <button className="btn" onClick={onClose}>
          Kapat
        </button>
      </div>
    </Modal>
  )
}
