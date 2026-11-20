import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  readonly icon: ReactNode
  readonly title: string
  readonly hint: string
}

export function EmptyState({ icon, title, hint }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.hint}>{hint}</p>
    </div>
  )
}
