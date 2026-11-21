import { useEffect, useRef, useState } from 'react'
import styles from './App.module.css'
import type { Container } from './di/container'
import { ContainerProvider } from './di/ContainerProvider'
import { PostList } from './features/posts/presentation/PostList'
import type { User } from './features/users/domain/model/user'
import { UserHeader } from './features/users/presentation/UserHeader'
import { UserList } from './features/users/presentation/UserList'
import { LocaleProvider } from './i18n/LocaleProvider'
import { useT } from './i18n/locale-context'
import { AppBar } from './shared/ui/AppBar'
import { EmptyState } from './shared/ui/EmptyState'
import { InboxIcon } from './shared/ui/icons'
import { ThemeProvider } from './theme/ThemeProvider'

const STACKED_LAYOUT = '(max-width: 720px)'

const isStacked = (): boolean => typeof window.matchMedia === 'function' && window.matchMedia(STACKED_LAYOUT).matches

interface AppProps {
  readonly container: Container
}

function Workspace() {
  const t = useT()
  const [choice, setChoice] = useState<{
    readonly user: User
    readonly tap: number
  } | null>(null)
  const selected = choice?.user ?? null
  const main = useRef<HTMLElement>(null)

  useEffect(() => {
    if (choice !== null && isStacked()) {
      main.current?.scrollIntoView({ block: 'start' })
    }
  }, [choice])

  return (
    <div className={styles.layout}>
      <aside className={styles.side}>
        <UserList
          selectedId={selected?.id ?? null}
          onSelect={(user) => {
            setChoice((current) => ({ user, tap: (current?.tap ?? 0) + 1 }))
          }}
        />
      </aside>
      <main ref={main} className={styles.main}>
        {selected === null ? (
          <EmptyState icon={<InboxIcon />} title={t('posts.idle.title')} hint={t('posts.idle.hint')} />
        ) : (
          <>
            <UserHeader user={selected} />
            <PostList key={selected.id} user={selected} />
          </>
        )}
      </main>
    </div>
  )
}

export function App({ container }: AppProps) {
  return (
    <ContainerProvider container={container}>
      <LocaleProvider>
        <ThemeProvider>
          <div className={styles.shell}>
            <AppBar />
            <Workspace />
          </div>
        </ThemeProvider>
      </LocaleProvider>
    </ContainerProvider>
  )
}
