import { useState } from 'react'
import { useT } from '../../../i18n/locale-context'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { ErrorBox } from '../../../shared/ui/ErrorBox'
import { FileTextIcon } from '../../../shared/ui/icons'
import { Spinner } from '../../../shared/ui/Spinner'
import { Toast } from '../../../shared/ui/Toast'
import type { User } from '../../users/domain/model/user'
import type { Post } from '../domain/model/post'
import { NewPostForm } from './NewPostForm'
import styles from './PostList.module.css'
import { useUserPosts } from './use-user-posts'

interface PostListProps {
  readonly user: User
}

export function PostList({ user }: PostListProps) {
  const t = useT()
  const { state, reload } = useUserPosts(user.id)
  const [written, setWritten] = useState<readonly Post[]>([])
  const [toast, setToast] = useState<{
    readonly id: number
    readonly message: string
  } | null>(null)
  const fetched = state.status === 'success' ? state.data : state.status === 'empty' ? [] : null
  const posts = fetched === null ? null : [...written, ...fetched]

  const addWritten = (post: Post) => {
    setWritten((current) => [{ ...post, id: -(current.length + 1) }, ...current])
    setToast((current) => ({
      id: (current?.id ?? 0) + 1,
      message: t('form.success'),
    }))
  }

  return (
    <>
      <NewPostForm userId={user.id} onCreated={addWritten} />
      <section className={styles.panel} aria-labelledby="posts-title" aria-busy={state.status === 'loading'}>
        <div className={styles.header}>
          <h3 id="posts-title" className={styles.title}>
            {t('posts.title')}
          </h3>
          {posts !== null && posts.length > 0 && (
            <span className={styles.count}>{t('posts.count', { count: posts.length })}</span>
          )}
        </div>
        {state.status === 'loading' && <Spinner label={t('posts.loading')} />}
        {state.status === 'error' && <ErrorBox error={state.error} onRetry={reload} />}
        {posts !== null && posts.length === 0 && (
          <EmptyState icon={<FileTextIcon />} title={t('posts.empty.title')} hint={t('posts.empty.hint', { name: user.name })} />
        )}
        {posts !== null && posts.length > 0 && (
          <ol className={styles.list}>
            {posts.map((post, index) => (
              <li key={post.id} className={styles.post}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <article className={styles.article}>
                  <h4 className={styles.postTitle}>
                    {post.title}
                    {post.id < 0 && <span className={styles.badge}>{t('post.new')}</span>}
                  </h4>
                  <p className={styles.body}>{post.body}</p>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
      {toast !== null && (
        <Toast
          key={toast.id}
          message={toast.message}
          onDone={() => {
            setToast(null)
          }}
        />
      )}
    </>
  )
}
