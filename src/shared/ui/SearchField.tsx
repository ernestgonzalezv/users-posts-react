import { useRef } from 'react'
import { useT } from '../../i18n/locale-context'
import { CloseIcon, SearchIcon } from './icons'
import styles from './SearchField.module.css'

interface SearchFieldProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly label: string
  readonly placeholder: string
}

export function SearchField({ value, onChange, label, placeholder }: SearchFieldProps) {
  const t = useT()
  const input = useRef<HTMLInputElement>(null)
  const clear = () => {
    onChange('')
    input.current?.focus()
  }

  return (
    <div className={styles.field}>
      <SearchIcon className={styles.icon} />
      <input
        ref={input}
        type="search"
        className={styles.input}
        value={value}
        aria-label={label}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        onChange={(event) => {
          onChange(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value !== '') {
            event.preventDefault()
            clear()
          }
        }}
      />
      {value !== '' && (
        <button type="button" className={styles.clear} aria-label={t('action.clear')} onClick={clear}>
          <CloseIcon />
        </button>
      )}
    </div>
  )
}
