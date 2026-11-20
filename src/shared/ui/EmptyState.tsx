import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  readonly icon: ReactNode
  readonly title: string
  readonly hint: string
  readonly action?: ReactNode
}

export function EmptyState({ icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.hint}>{hint}</p>
      {action !== undefined && <div className={styles.action}>{action}</div>}
    </div>
  )
}
