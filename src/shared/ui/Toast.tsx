import type { CSSProperties } from 'react'
import { useEffect, useEffectEvent } from 'react'
import { CheckIcon } from './icons'
import styles from './Toast.module.css'

interface ToastProps {
  readonly message: string
  readonly onDone: () => void
  readonly durationMs?: number
}

export function Toast({ message, onDone, durationMs = 4000 }: ToastProps) {
  const finish = useEffectEvent(onDone)

  useEffect(() => {
    const timer = setTimeout(() => {
      finish()
    }, durationMs)
    return () => {
      clearTimeout(timer)
    }
  }, [message, durationMs])

  return (
    <div role="status" className={styles.toast} style={{ '--toast-ms': `${String(durationMs)}ms` } as CSSProperties}>
      <CheckIcon className={styles.icon} />
      <span>{message}</span>
    </div>
  )
}
