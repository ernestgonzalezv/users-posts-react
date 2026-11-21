import type { CSSProperties } from 'react'
import { useState } from 'react'
import { useT } from '../../../i18n/locale-context'
import { DEBOUNCE_MS, useDebouncedValue } from '../../../shared/presentation/use-debounced-value'
import type { Resource } from '../../../shared/presentation/use-resource'
import { Avatar } from '../../../shared/ui/Avatar'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { ErrorBox } from '../../../shared/ui/ErrorBox'
import { ChevronRightIcon, CloseIcon, SearchIcon, UsersIcon } from '../../../shared/ui/icons'
import { SearchField } from '../../../shared/ui/SearchField'
import { Spinner } from '../../../shared/ui/Spinner'
import type { User } from '../domain/model/user'
import { initialsOf } from '../domain/model/user'
import { searchUsers } from '../domain/usecase/search-users'
import styles from './UserList.module.css'

const isBlank = (value: string): boolean => value.trim() === ''

interface UserListProps {
  readonly users: Resource<readonly User[]>
  readonly selectedId: number | null
  readonly onSelect: (user: User) => void
}

export function UserList({ users, selectedId, onSelect }: UserListProps) {
  const t = useT()
  const { state, reload } = users
  const [query, setQuery] = useState('')
  const settledQuery = useDebouncedValue(query, DEBOUNCE_MS, isBlank)
  const loaded = state.status === 'success' ? state.data : null
  const matches = loaded === null ? null : searchUsers(loaded, settledQuery)
  const clearSearch = () => {
    setQuery('')
  }

  return (
    <section className={styles.panel} aria-labelledby="users-title" aria-busy={state.status === 'loading'}>
      <div className={styles.header}>
        <h2 id="users-title" className={styles.title}>
          {t('users.title')}
        </h2>
        {loaded !== null && matches !== null && (
          <span className={styles.count} aria-live="polite">
            {settledQuery.trim() === ''
              ? t('users.count', { count: loaded.length })
              : t('users.count.filtered', {
                  count: matches.length,
                  total: loaded.length,
                })}
          </span>
        )}
      </div>
      {loaded !== null && (
        <div className={styles.search}>
          <SearchField
            value={query}
            onChange={setQuery}
            label={t('users.search.label')}
            placeholder={t('users.search.placeholder')}
          />
        </div>
      )}
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
      {state.status === 'empty' && (
        <EmptyState icon={<UsersIcon />} title={t('users.empty.title')} hint={t('users.empty.hint')} />
      )}
      {matches !== null && matches.length === 0 && (
        <EmptyState
          icon={<SearchIcon />}
          title={t('users.nomatch.title', { query: settledQuery.trim() })}
          hint={t('users.nomatch.hint')}
          action={
            <button type="button" onClick={clearSearch}>
              <CloseIcon />
              {t('action.clearSearch')}
            </button>
          }
        />
      )}
      {matches !== null && matches.length > 0 && (
        <ul className={styles.list}>
          {matches.map((user, index) => (
            <li key={user.id} style={{ '--i': index } as CSSProperties}>
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
