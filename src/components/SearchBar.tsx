import { Icon } from './Icon'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Ara…' }: Props) {
  return (
    <div className="quickadd">
      <div className="field">
        <span className="field__ic">
          <Icon name="search" size={18} />
        </span>
        <input
          type="search"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button className="field__clear" onClick={() => onChange('')} aria-label="Temizle">
            <Icon name="x" size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
