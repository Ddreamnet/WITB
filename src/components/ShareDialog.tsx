import { useState } from 'react'
import { Modal } from './Modal'
import { Icon } from './Icon'
import { useSpaceStore } from '../store/useSpace'

/**
 * Ortak ev (space) paylaşımı. Login YOK — anonim misafir kimliği arka planda.
 * Üç durum: bulut kapalı / aktif ev yok (oluştur|katıl) / aktif ev (anahtarı göster|ayrıl).
 */
export function ShareDialog({ onClose }: { onClose: () => void }) {
  const cloudEnabled = useSpaceStore((s) => s.cloudEnabled)
  const space = useSpaceStore((s) => s.space)
  const busy = useSpaceStore((s) => s.busy)
  const error = useSpaceStore((s) => s.error)
  const createSpace = useSpaceStore((s) => s.createSpace)
  const joinSpace = useSpaceStore((s) => s.joinSpace)
  const leaveSpace = useSpaceStore((s) => s.leaveSpace)
  const clearError = useSpaceStore((s) => s.clearError)

  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [name, setName] = useState('Evim')
  const [key, setKey] = useState('')
  const [copied, setCopied] = useState(false)

  async function copyKey(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* pano yoksa elle kopyalar */
    }
  }

  // --- Bulut kapalı ---
  if (!cloudEnabled) {
    return (
      <Modal onClose={onClose}>
        <h3>Paylaşım</h3>
        <p>Bulut bağlantısı bu sürümde yapılandırılmamış. Uygulama yerel (offline) çalışıyor.</p>
        <div className="modal__row">
          <button className="btn" onClick={onClose}>
            Kapat
          </button>
        </div>
      </Modal>
    )
  }

  // --- Aktif ev var: anahtarı göster + ayrıl ---
  if (space) {
    return (
      <Modal onClose={onClose}>
        <h3>{space.name}</h3>
        <p>Bu anahtarı verdiğin kişi aynı evi görür ve birlikte düzenlersiniz.</p>

        <button className="sharekey" onClick={() => copyKey(space.joinKey)} title="Kopyala">
          <span className="sharekey__code">{space.joinKey}</span>
          <span className="sharekey__copy">
            <Icon name={copied ? 'check' : 'copy'} size={18} />
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </span>
        </button>

        <div className="modal__row" style={{ justifyContent: 'space-between' }}>
          <button
            className="btn btn--danger"
            disabled={busy}
            onClick={async () => {
              await leaveSpace()
              onClose()
            }}
          >
            Ayrıl
          </button>
          <button className="btn btn--primary" onClick={onClose}>
            Tamam
          </button>
        </div>
      </Modal>
    )
  }

  // --- Ev oluştur ---
  if (mode === 'create') {
    return (
      <Modal onClose={onClose}>
        <h3>Yeni ortak ev</h3>
        <p>Mevcut tüm kolilerin ve eşyaların bu eve aktarılır, sonra anahtarı paylaşırsın.</p>
        <input
          className="text-input"
          autoFocus
          value={name}
          placeholder="örn. Bizim Ev"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) void createSpace(name.trim())
          }}
        />
        {error && <p className="share-error">{error}</p>}
        <div className="modal__row">
          <button
            className="btn"
            disabled={busy}
            onClick={() => {
              clearError()
              setMode('menu')
            }}
          >
            Geri
          </button>
          <button
            className="btn btn--primary"
            disabled={busy || !name.trim()}
            onClick={() => void createSpace(name.trim())}
          >
            {busy ? 'Oluşturuluyor…' : 'Oluştur'}
          </button>
        </div>
      </Modal>
    )
  }

  // --- Anahtarla katıl ---
  if (mode === 'join') {
    return (
      <Modal onClose={onClose}>
        <h3>Anahtarla katıl</h3>
        <p>Sana verilen 6 haneli anahtarı gir; o evin tüm içeriğini görürsün.</p>
        <input
          className="text-input keyinput"
          autoFocus
          value={key}
          maxLength={6}
          placeholder="ABC123"
          onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && key.length === 6) void joinSpace(key)
          }}
        />
        {error && <p className="share-error">{error}</p>}
        <div className="modal__row">
          <button
            className="btn"
            disabled={busy}
            onClick={() => {
              clearError()
              setMode('menu')
            }}
          >
            Geri
          </button>
          <button
            className="btn btn--primary"
            disabled={busy || key.length < 6}
            onClick={() => void joinSpace(key)}
          >
            {busy ? 'Katılınıyor…' : 'Katıl'}
          </button>
        </div>
      </Modal>
    )
  }

  // --- Menü: oluştur veya katıl ---
  return (
    <Modal onClose={onClose}>
      <h3>Paylaş</h3>
      <p>Aynı evi başka biriyle paylaş; ikiniz de aynı kolileri ve eşyaları görüp düzenlersiniz.</p>
      <div className="sharemenu">
        <button className="sharemenu__opt" onClick={() => setMode('create')}>
          <Icon name="users" size={22} />
          <span>
            <strong>Yeni ortak ev oluştur</strong>
            <small>Eşyaların buluta gider, bir anahtar alırsın</small>
          </span>
        </button>
        <button className="sharemenu__opt" onClick={() => setMode('join')}>
          <Icon name="enter" size={22} />
          <span>
            <strong>Anahtarla katıl</strong>
            <small>Birinin evine 6 haneli anahtarla gir</small>
          </span>
        </button>
      </div>
      <div className="modal__row">
        <button className="btn" onClick={onClose}>
          Kapat
        </button>
      </div>
    </Modal>
  )
}
