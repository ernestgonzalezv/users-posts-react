import type { AppError } from '../../core/app-error'
import { useT } from '../../i18n/locale-context'
import { errorMessage } from '../presentation/error-message'
import styles from './ErrorBox.module.css'
import { AlertIcon, RefreshIcon, WifiOffIcon } from './icons'

interface ErrorBoxProps {
  readonly error: AppError
  readonly onRetry: () => void
}

export function ErrorBox({ error, onRetry }: ErrorBoxProps) {
  const t = useT()
  return (
    <div role="alert" className={styles.box}>
      <span className={styles.icon}>{error.kind === 'network' ? <WifiOffIcon /> : <AlertIcon />}</span>
      <p className={styles.message}>{errorMessage(t, error)}</p>
      <button type="button" className={styles.retry} onClick={onRetry}>
        <RefreshIcon />
        {t('action.retry')}
      </button>
    </div>
  )
}
