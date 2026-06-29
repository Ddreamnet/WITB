import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useChildren, useNode, useNodesStore, usePath } from '../store/useNodes'
import { NodeCard } from '../components/NodeCard'
import { QuickAddBar } from '../components/QuickAddBar'
import { RenameDialog } from '../components/RenameDialog'
import { MoveDialog } from '../components/MoveDialog'
import { DeleteDialog } from '../components/DeleteDialog'
import { PhotoViewer } from '../components/PhotoViewer'
import { NodeMenu } from '../components/NodeMenu'
import { SuggestionStrip } from '../components/SuggestionStrip'
import { Icon } from '../components/Icon'
import { useThumbUrl } from '../lib/photoUrl'
import { captureAndAdd } from '../lib/photoActions'
import { categoryIconForName } from '../lib/suggestions'

const ROW = 84 // kart 72 + 12 boşluk (--card-h ile uyumlu olmalı)

export function BoxView() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const node = useNode(id)
  const children = useChildren(id)
  const path = usePath(id)

  const addItem = useNodesStore((s) => s.addItem)
  const rename = useNodesStore((s) => s.rename)
  const remove = useNodesStore((s) => s.remove)
  const addPhotos = useNodesStore((s) => s.addPhotos)
  const removePhoto = useNodesStore((s) => s.removePhoto)

  const thumb = useThumbUrl(node?.photoIds?.[0])
  const [dialog, setDialog] = useState<null | 'menu' | 'rename' | 'move' | 'delete'>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: children.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW,
    overscan: 8,
  })

  // Geçersiz id → ana ekrana dön.
  if (!node) {
    return (
      <div className="app">
        <header className="header">
          <button className="iconbtn" onClick={() => navigate('/')} aria-label="Geri">
            <Icon name="chevronLeft" size={22} />
          </button>
          <span className="header__title">Bulunamadı</span>
        </header>
        <div className="empty">
          <span className="empty__icon">
            <Icon name="package" size={34} />
          </span>
          Bu kutu artık yok.
        </div>
      </div>
    )
  }

  const catIcon = categoryIconForName(node.name)
  const photoIds = node.photoIds ?? []

  const ancestors = path.slice(0, -1).map((n) => n.name).join(' › ')
  const parentNode = node.parentId ? path[path.length - 2] ?? null : null

  async function boxPhoto() {
    setDialog(null)
    await captureAndAdd(node!.id, addPhotos)
  }

  function deleteBox() {
    void remove(node!.id)
    navigate(node!.parentId ? `/box/${node!.parentId}` : '/')
  }

  return (
    <div className="app">
      <header className="header">
        <button className="iconbtn" onClick={() => navigate(-1)} aria-label="Geri">
          <Icon name="chevronLeft" size={22} />
        </button>
        <button
          className="card__thumb"
          style={{ width: 38, height: 38 }}
          onClick={() => (photoIds.length > 0 ? setViewerOpen(true) : boxPhoto())}
          aria-label="Kutu fotoğrafı"
        >
          {thumb ? (
            <img src={thumb} alt="" />
          ) : catIcon ? (
            <span style={{ fontSize: 20 }}>{catIcon}</span>
          ) : (
            <Icon name="package" size={20} />
          )}
        </button>
        <div className="header__title">
          {node.name}
          {ancestors && <div className="header__sub">{ancestors}</div>}
        </div>
        <button
          className="iconbtn iconbtn--accent"
          onClick={() => void boxPhoto()}
          aria-label="Fotoğraf"
        >
          <Icon name="camera" size={20} />
        </button>
        <button className="iconbtn" onClick={() => setDialog('menu')} aria-label="Menü">
          <Icon name="more" size={18} />
        </button>
      </header>

      <QuickAddBar placeholder="Ekle… (örn. sargı bezi)" onAdd={(name) => void addItem(node.id, name)} />

      <SuggestionStrip containerId={node.id} />

      {children.length === 0 ? (
        <div className="empty">
          <span className="empty__icon">
            <Icon name="boxOpen" size={38} />
          </span>
        </div>
      ) : (
        <div className="scroll" ref={parentRef}>
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative', padding: '8px 0' }}>
            {virtualizer.getVirtualItems().map((vi) => {
              const child = children[vi.index]
              return (
                <div
                  key={child.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 8,
                    right: 8,
                    transform: `translateY(${vi.start}px)`,
                    height: vi.size,
                  }}
                >
                  <NodeCard node={child} parent={node} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {dialog === 'menu' && (
        <NodeMenu
          name={node.name}
          isContainer={children.length > 0}
          onEnter={() => setDialog(null)}
          onRename={() => setDialog('rename')}
          onMove={() => setDialog('move')}
          onPhoto={() => void boxPhoto()}
          onDelete={() => setDialog('delete')}
          onClose={() => setDialog(null)}
        />
      )}
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
      {dialog === 'move' && <MoveDialog nodeId={node.id} onClose={() => setDialog(null)} />}
      {dialog === 'delete' && (
        <DeleteDialog
          itemName={node.name}
          boxName={parentNode?.name ?? 'ana ekran'}
          allowDontAsk={false}
          onCancel={() => setDialog(null)}
          onConfirm={deleteBox}
        />
      )}
      {viewerOpen && (
        <PhotoViewer
          photoIds={photoIds}
          onClose={() => setViewerOpen(false)}
          onDelete={(pid) => void removePhoto(node.id, pid)}
          onAdd={() => void boxPhoto()}
        />
      )}
    </div>
  )
}
