import { useRef, useState } from 'react'
import { Icon } from './Icon'

/**
 * Üstte textbox + onay butonu. Ekledikten sonra input temizlenir ama ODAK kalır,
 * böylece arka arkaya çok hızlı ekleme yapılabilir. Enter da çalışır.
 */
export function QuickAddBar({
  placeholder,
  onAdd,
}: {
  placeholder: string
  onAdd: (name: string) => void
}) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const trimmed = value.trim()

  function submit() {
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
    // Odağı koru
    inputRef.current?.focus()
  }

  return (
    <div className="quickadd">
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="sentences"
        enterKeyHint="done"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
        }}
      />
      <button className="btn-confirm" onClick={submit} disabled={!trimmed} aria-label="Ekle">
        <Icon name="plus" size={22} strokeWidth={2.2} />
      </button>
    </div>
  )
}
