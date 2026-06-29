import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NodeRow } from '../db/types'
import { useChildCount, useNodesStore } from '../store/useNodes'
import { useThumbUrl } from '../lib/photoUrl'
import { captureAndAdd } from '../lib/photoActions'
import { DeleteDialog } from './DeleteDialog'
import { MoveDialog } from './MoveDialog'
import { RenameDialog } from './RenameDialog'
import { NodeMenu } from './NodeMenu'
import { PhotoViewer } from './PhotoViewer'
import { Icon } from './Icon'
import { categoryIconForName } from '../lib/suggestions'

interface Props {
  node: NodeRow
  /** İçinde bulunduğu kap (silme onayı ve "bir daha sorma" için). Üst seviyede null. */
  parent: NodeRow | null
}

export function NodeCard({ node, parent }: Props) {
  const navigate = useNavigate()
  const childCount = useChildCount(node.id)
  const photoIds = node.photoIds ?? []
  const thumb = useThumbUrl(photoIds[0])

  const increment = useNodesStore((s) => s.increment)
  const decrement = useNodesStore((s) => s.decrement)
  const remove = useNodesStore((s) => s.remove)
  const setSkip = useNodesStore((s) => s.setSkip)
  const addPhotos = useNodesStore((s) => s.addPhotos)
  const removePhoto = useNodesStore((s) => s.removePhoto)
  const rename = useNodesStore((s) => s.rename)

  const [dialog, setDialog] = useState<null | 'delete' | 'move' | 'rename' | 'menu'>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [busyPhoto, setBusyPhoto] = useState(false)

  const isContainer = childCount > 0
  const catIcon = categoryIconForName(node.name)

  function enter() {
    navigate(`/box/${node.id}`)
  }

  function requestDelete() {
    if (parent?.skipDeleteConfirm) {
      void remove(node.id)
    } else {
      setDialog('delete')
    }
  }

  function confirmDelete(dontAsk: boolean) {
    if (dontAsk && parent) void setSkip(parent.id, true)
    void remove(node.id)
    setDialog(null)
  }

  async function takePhoto() {
    setDialog(null)
    if (busyPhoto) return
    setBusyPhoto(true)
    try {
      await captureAndAdd(node.id, addPhotos)
    } finally {
      setBusyPhoto(false)
    }
  }

  return (
    <div className="card">
      {/* Sol: yalnızca fotoğraf varsa çerçeveli küçük resim (dokununca büyür).
          Fotoğraf yoksa kutusuz, hizayı koruyan ince simge alanı — placeholder yok.
          Fotoğraf eklemek/değiştirmek artık üç-nokta menüsünden. */}
      {photoIds.length > 0 ? (
        <button
          className="card__thumb"
          onClick={() => setViewerOpen(true)}
          aria-label="Fotoğrafları gör"
        >
          {thumb ? <img src={thumb} alt="" /> : '…'}
          {photoIds.length > 1 && <span className="card__thumb-badge">{photoIds.length}</span>}
        </button>
      ) : busyPhoto ? (
        <span className="card__lead" aria-hidden="true">
          …
        </span>
      ) : catIcon ? (
        <span className="card__lead" aria-hidden="true">
          <span className="card__lead-emoji">{catIcon}</span>
        </span>
      ) : isContainer ? (
        <span className="card__lead" aria-hidden="true">
          <Icon name="package" size={22} />
        </span>
      ) : null}

      {/* Gövde: dokununca içine gir (kap ise) / alt liste oluştur. */}
      <button className="card__body" onClick={enter}>
        <span className="card__name">{node.name}</span>
        {isContainer && (
          <span className="card__meta">
            <Icon name="layers" size={13} />
            {childCount} öğe
          </span>
        )}
      </button>

      {/* Sağ: aksiyonlar */}
      <div className="card__actions">
        <div className="qty">
          {node.quantity > 1 && (
            <button className="iconbtn" onClick={() => decrement(node.id)} aria-label="Azalt">
              <Icon name="minus" size={17} />
            </button>
          )}
          <span className="qty__num">{node.quantity}</span>
          <button className="iconbtn" onClick={() => increment(node.id)} aria-label="Artır">
            <Icon name="plus" size={17} />
          </button>
        </div>

        <button className="iconbtn" onClick={() => setDialog('menu')} aria-label="Menü">
          <Icon name="more" size={18} />
        </button>
        <button className="iconbtn iconbtn--danger" onClick={requestDelete} aria-label="Sil">
          <Icon name="trash" size={18} />
        </button>
      </div>

      {dialog === 'delete' && (
        <DeleteDialog
          itemName={node.name}
          boxName={parent?.name ?? 'ana ekran'}
          allowDontAsk={!!parent}
          onCancel={() => setDialog(null)}
          onConfirm={confirmDelete}
        />
      )}
      {dialog === 'move' && <MoveDialog nodeId={node.id} onClose={() => setDialog(null)} />}
      {dialog === 'rename' && (
        <RenameDialog
          initial={node.name}
          onCancel={() => setDialog(null)}
          onSave={(name) => {
            void rename(node.id, name)
            setDialog(null)
          }}
        />
      )}
      {dialog === 'menu' && (
        <NodeMenu
          name={node.name}
          isContainer={isContainer}
          onEnter={() => {
            setDialog(null)
            enter()
          }}
          onRename={() => setDialog('rename')}
          onMove={() => setDialog('move')}
          onPhoto={() => void takePhoto()}
          onClose={() => setDialog(null)}
        />
      )}
      {viewerOpen && (
        <PhotoViewer
          photoIds={photoIds}
          onClose={() => setViewerOpen(false)}
          onDelete={(pid) => void removePhoto(node.id, pid)}
          onAdd={() => void takePhoto()}
        />
      )}
    </div>
  )
}
