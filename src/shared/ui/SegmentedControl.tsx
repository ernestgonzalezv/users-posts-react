import type { KeyboardEvent, ReactNode } from 'react'
import styles from './SegmentedControl.module.css'

export interface SegmentedOption<T extends string> {
  readonly value: T
  readonly label: ReactNode
  readonly title: string
}

interface SegmentedControlProps<T extends string> {
  readonly label: string
  readonly value: T
  readonly options: readonly SegmentedOption<T>[]
  readonly onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  const moveSelection = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (delta === 0) {
      return
    }
    event.preventDefault()
    const index = options.findIndex((option) => option.value === value)
    const target = (index + delta + options.length) % options.length
    const radios = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    options.forEach((option, position) => {
      if (position === target) {
        onChange(option.value)
        radios[position]?.focus()
      }
    })
  }

  return (
    <div role="radiogroup" aria-label={label} className={styles.group} onKeyDown={moveSelection}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          aria-label={option.title}
          title={option.title}
          tabIndex={option.value === value ? 0 : -1}
          className={styles.option}
          onClick={() => {
            onChange(option.value)
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
