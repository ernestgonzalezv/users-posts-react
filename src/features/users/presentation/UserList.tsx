import { useT } from '../../../i18n/locale-context'
import { Avatar } from '../../../shared/ui/Avatar'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { ErrorBox } from '../../../shared/ui/ErrorBox'
import { ChevronRightIcon, UsersIcon } from '../../../shared/ui/icons'
import { Spinner } from '../../../shared/ui/Spinner'
import type { User } from '../domain/model/user'
import { initialsOf } from '../domain/model/user'
import styles from './UserList.module.css'
import { useUsers } from './use-users'

interface UserListProps {
  readonly selectedId: number | null
  readonly onSelect: (user: User) => void
}

export function UserList({ selectedId, onSelect }: UserListProps) {
  const t = useT()
  const { state, reload } = useUsers()

  return (
    <section className={styles.panel} aria-labelledby="users-title" aria-busy={state.status === 'loading'}>
      <div className={styles.header}>
        <h2 id="users-title" className={styles.title}>
          {t('users.title')}
        </h2>
        {state.status === 'success' && <span className={styles.count}>{t('users.count', { count: state.data.length })}</span>}
      </div>
      {state.status === 'loading' && (
        <div className={styles.state}>
          <Spinner label={t('users.loading')} />
        </div>
      )}
      {state.status === 'error' && (
        <div className={styles.state}>
          <ErrorBox error={state.error} onRetry={reload} />
        </div>
      )}
      {state.status === 'empty' && <EmptyState icon={<UsersIcon />} title={t('users.empty.title')} hint={t('users.empty.hint')} />}
      {state.status === 'success' && (
        <ul className={styles.list}>
          {state.data.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                className={styles.row}
                aria-pressed={user.id === selectedId}
                aria-label={t('users.select', { name: user.name })}
                onClick={() => {
                  onSelect(user)
                }}
              >
                <Avatar initials={initialsOf(user.name)} seed={user.id} />
                <span className={styles.text}>
                  <span className={styles.name}>{user.name}</span>
                  <span className={styles.meta}>
                    @{user.username} · {user.email}
                  </span>
                </span>
                <ChevronRightIcon className={styles.chevron} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
