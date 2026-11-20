import styles from './Spinner.module.css'

interface SpinnerProps {
  readonly label: string
}

export function Spinner({ label }: SpinnerProps) {
  return (
    <div role="status" aria-live="polite" className={styles.status}>
      <span className={styles.ring} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
