import { useState } from 'react'
import styles from './App.module.css'
import type { Container } from './di/container'
import { ContainerProvider } from './di/ContainerProvider'
import type { User } from './features/users/domain/model/user'
import { UserHeader } from './features/users/presentation/UserHeader'
import { UserList } from './features/users/presentation/UserList'
import { LocaleProvider } from './i18n/LocaleProvider'
import { useT } from './i18n/locale-context'
import { AppBar } from './shared/ui/AppBar'
import { EmptyState } from './shared/ui/EmptyState'
import { InboxIcon } from './shared/ui/icons'

interface AppProps {
  readonly container: Container
}

function Workspace() {
  const t = useT()
  const [selected, setSelected] = useState<User | null>(null)
  return (
    <div className={styles.layout}>
      <aside className={styles.side}>
        <UserList selectedId={selected?.id ?? null} onSelect={setSelected} />
      </aside>
      <main className={styles.main}>
        {selected === null ? (
          <EmptyState icon={<InboxIcon />} title={t('posts.idle.title')} hint={t('posts.idle.hint')} />
        ) : (
          <UserHeader user={selected} />
        )}
      </main>
    </div>
  )
}

export function App({ container }: AppProps) {
  return (
    <ContainerProvider container={container}>
      <LocaleProvider>
        <div className={styles.shell}>
          <AppBar />
          <Workspace />
        </div>
      </LocaleProvider>
    </ContainerProvider>
  )
}
