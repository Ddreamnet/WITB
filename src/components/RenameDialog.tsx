import { useState } from 'react'
import { Modal } from './Modal'

interface Props {
  initial: string
  title?: string
  onCancel: () => void
  onSave: (name: string) => void
}

export function RenameDialog({ initial, title = 'Yeniden adlandır', onCancel, onSave }: Props) {
  const [name, setName] = useState(initial)
  const trimmed = name.trim()
  return (
    <Modal onClose={onCancel}>
      <h3>{title}</h3>
      <input
        className="text-input"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && trimmed) onSave(trimmed)
        }}
        style={{ marginBottom: 16 }}
      />
      <div className="modal__row">
        <button className="btn" onClick={onCancel}>
          Vazgeç
        </button>
        <button className="btn btn--primary" disabled={!trimmed} onClick={() => onSave(trimmed)}>
          Kaydet
        </button>
      </div>
    </Modal>
  )
}
