import { useT } from '../../../i18n/locale-context'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { ErrorBox } from '../../../shared/ui/ErrorBox'
import { FileTextIcon } from '../../../shared/ui/icons'
import { Spinner } from '../../../shared/ui/Spinner'
import type { User } from '../../users/domain/model/user'
import styles from './PostList.module.css'
import { useUserPosts } from './use-user-posts'

interface PostListProps {
  readonly user: User
}

export function PostList({ user }: PostListProps) {
  const t = useT()
  const { state, reload } = useUserPosts(user.id)

  return (
    <section className={styles.panel} aria-labelledby="posts-title" aria-busy={state.status === 'loading'}>
      <div className={styles.header}>
        <h3 id="posts-title" className={styles.title}>
          {t('posts.title')}
        </h3>
        {state.status === 'success' && <span className={styles.count}>{t('posts.count', { count: state.data.length })}</span>}
      </div>
      {state.status === 'loading' && <Spinner label={t('posts.loading')} />}
      {state.status === 'error' && <ErrorBox error={state.error} onRetry={reload} />}
      {state.status === 'empty' && (
        <EmptyState icon={<FileTextIcon />} title={t('posts.empty.title')} hint={t('posts.empty.hint', { name: user.name })} />
      )}
      {state.status === 'success' && (
        <ol className={styles.list}>
          {state.data.map((post, index) => (
            <li key={post.id} className={styles.post}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <article className={styles.article}>
                <h4 className={styles.postTitle}>{post.title}</h4>
                <p className={styles.body}>{post.body}</p>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
