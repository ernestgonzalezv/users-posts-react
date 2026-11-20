import { useT } from '../../i18n/locale-context'
import styles from './AppBar.module.css'
import { LogoIcon } from './icons'
import { LanguageSwitch } from './LanguageSwitch'

export function AppBar() {
  const t = useT()
  return (
    <header className={styles.bar}>
      <h1 className={styles.brand}>
        <span className={styles.mark}>
          <LogoIcon />
        </span>
        {t('app.title')}
      </h1>
      <div className={styles.tools}>
        <LanguageSwitch />
      </div>
    </header>
  )
}
