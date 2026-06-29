import { useMemo, useState } from 'react'
import { Modal } from './Modal'
import { Icon } from './Icon'
import { containerTypeSuggestions } from '../lib/suggestions'
import { normalizeText } from '../lib/text'

/**
 * Yeni kutu/alan oluşturma. Manuel isim girilebilir VEYA hazır kap tipleri
 * tek bir butonun arkasındaki ARANABİLİR listeden seçilebilir (seçince ismi
 * doldurur). Şablon ismiyle açılan kutu, içine girince item önerilerini gösterir.
 */
export function NewBoxDialog({
  onCancel,
  onCreate,
}: {
  onCancel: () => void
  onCreate: (name: string) => void
}) {
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const trimmed = name.trim()

  const types = containerTypeSuggestions()
  const q = normalizeText(query)

  // Önerilerde arama: isim + aliases üzerinde normalize edilmiş eşleşme.
  const filtered = useMemo(() => {
    if (!q) return types
    return types.filter((t) => [t.name, ...t.aliases].some((s) => normalizeText(s).includes(q)))
  }, [q, types])

  const selectedTpl = types.find((t) => normalizeText(t.name) === normalizeText(name)) ?? null

  function choose(typeName: string) {
    setName(typeName)
    setOpen(false)
    setQuery('')
  }

  return (
    <Modal onClose={onCancel}>
      <h3>Yeni kutu / alan</h3>
      <input
        className="text-input"
        autoFocus
        value={name}
        placeholder="örn. 13. Koli"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && trimmed) onCreate(trimmed)
        }}
        style={{ marginBottom: 14 }}
      />

      {/* Öneriler tek bir butonun arkasında; açınca aranabilir liste olur. */}
      <button
        type="button"
        className="select-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="select-toggle__label">
          {selectedTpl ? `${selectedTpl.icon}  ${selectedTpl.name}` : 'Hazır tiplerden seç'}
        </span>
        <span className={'select-toggle__chev' + (open ? ' select-toggle__chev--open' : '')}>
          <Icon name="chevronDown" size={18} />
        </span>
      </button>

      {open && (
        <div className="select-panel">
          <div className="field" style={{ marginBottom: 10 }}>
            <span className="field__ic">
              <Icon name="search" size={18} />
            </span>
            <input
              autoFocus
              value={query}
              placeholder="Önerilerde ara…"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="optlist" style={{ maxHeight: '38vh', marginBottom: 4 }}>
            {filtered.map((t) => (
              <button
                key={t.id}
                className={'opt' + (selectedTpl?.id === t.id ? ' opt--sel' : '')}
                onClick={() => choose(t.name)}
              >
                <span className="opt__ic">{t.icon}</span>
                <span>{t.name}</span>
              </button>
            ))}
            {filtered.length === 0 && <div className="select-empty">Eşleşen tip yok</div>}
          </div>
        </div>
      )}

      <div className="modal__row">
        <button className="btn" onClick={onCancel}>
          Vazgeç
        </button>
        <button className="btn btn--primary" disabled={!trimmed} onClick={() => onCreate(trimmed)}>
          Oluştur
        </button>
      </div>
    </Modal>
  )
}
