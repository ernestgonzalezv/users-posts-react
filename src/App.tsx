import { Fragment, useEffect, useRef, useState } from 'react'
import styles from './App.module.css'
import type { Container } from './di/container'
import { ContainerProvider } from './di/ContainerProvider'
import { PostList } from './features/posts/presentation/PostList'
import type { User } from './features/users/domain/model/user'
import { UserHeader } from './features/users/presentation/UserHeader'
import { UserList } from './features/users/presentation/UserList'
import { LocaleProvider } from './i18n/LocaleProvider'
import { useUsers } from './features/users/presentation/use-users'
import type { ResourceStatus } from './shared/presentation/use-resource'
import { useT } from './i18n/locale-context'
import type { Route } from './shared/presentation/route'
import { useRoute } from './shared/presentation/use-route'
import { AppBar } from './shared/ui/AppBar'
import { EmptyState } from './shared/ui/EmptyState'
import { ArrowLeftIcon, InboxIcon, UsersIcon } from './shared/ui/icons'
import { Spinner } from './shared/ui/Spinner'
import { ThemeProvider } from './theme/ThemeProvider'

const STACKED_LAYOUT = '(max-width: 720px)'

const isStacked = (): boolean => typeof window.matchMedia === 'function' && window.matchMedia(STACKED_LAYOUT).matches

interface AppProps {
  readonly container: Container
}

type Detail =
  | { readonly kind: 'idle' }
  | { readonly kind: 'waiting' }
  | { readonly kind: 'missing' }
  | { readonly kind: 'user'; readonly user: User }

function Workspace() {
  const t = useT()
  const users = useUsers()
  const { route, navigate } = useRoute()
  const [tap, setTap] = useState(0)
  const main = useRef<HTMLElement>(null)
  const loaded = users.state.status === 'success' ? users.state.data : null
  const detail = resolveDetail(route, users.state.status, loaded)
  const selected = detail.kind === 'user' ? detail.user : null

  useEffect(() => {
    if (selected !== null && isStacked()) {
      main.current?.scrollIntoView({ block: 'start' })
    }
  }, [selected, tap])

  return (
    <div className={styles.layout}>
      <aside className={styles.side}>
        <UserList
          users={users}
          selectedId={selected?.id ?? null}
          onSelect={(user) => {
            navigate({ kind: 'user', id: user.id })
            setTap((current) => current + 1)
          }}
        />
      </aside>
      <main ref={main} className={styles.main}>
        {detail.kind === 'idle' && <EmptyState icon={<InboxIcon />} title={t('posts.idle.title')} hint={t('posts.idle.hint')} />}
        {detail.kind === 'waiting' && <Spinner label={t('users.loading')} />}
        {detail.kind === 'missing' && (
          <EmptyState
            icon={<UsersIcon />}
            title={t('user.missing.title')}
            hint={t('user.missing.hint')}
            action={
              <button
                type="button"
                onClick={() => {
                  navigate({ kind: 'home' }, { replace: true })
                }}
              >
                <ArrowLeftIcon />
                {t('action.backToList')}
              </button>
            }
          />
        )}
        {detail.kind === 'user' && (
          <Fragment key={detail.user.id}>
            <UserHeader user={detail.user} />
            <PostList user={detail.user} />
          </Fragment>
        )}
      </main>
    </div>
  )
}

const resolveDetail = (route: Route, status: ResourceStatus, loaded: readonly User[] | null): Detail => {
  if (route.kind === 'home') {
    return { kind: 'idle' }
  }
  if (route.kind === 'unknown') {
    return { kind: 'missing' }
  }
  if (loaded !== null) {
    const user = loaded.find((candidate) => candidate.id === route.id)
    return user === undefined ? { kind: 'missing' } : { kind: 'user', user }
  }
  return status === 'loading' ? { kind: 'waiting' } : { kind: 'idle' }
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
