import type { CSSProperties } from 'react'
import { useRef, useState } from 'react'
import type { Result } from '../../../core/result'
import { useContainer } from '../../../di/container-context'
import { usePaged } from '../../../shared/presentation/use-paged'
import { useT } from '../../../i18n/locale-context'
import { counted } from '../../../i18n/translate'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { ErrorBox } from '../../../shared/ui/ErrorBox'
import { ChevronDownIcon, FileTextIcon } from '../../../shared/ui/icons'
import { Spinner } from '../../../shared/ui/Spinner'
import { Toast } from '../../../shared/ui/Toast'
import type { User } from '../../users/domain/model/user'
import type { NewPost } from '../domain/model/new-post'
import type { Post } from '../domain/model/post'
import { normalizeDraft } from '../domain/usecase/create-post'
import { NewPostForm } from './NewPostForm'
import styles from './PostList.module.css'
import { useUserPosts } from './use-user-posts'

const PAGE_SIZE = 20
const NO_POSTS: readonly Post[] = []

interface PostListProps {
  readonly user: User
}

const classOf = (post: Post): string | undefined => {
  switch (post.source) {
    case 'remote':
      return styles.post
    case 'written':
      return `${styles.post} ${styles.fresh}`
    case 'pending':
      return `${styles.post} ${styles.pending}`
  }
}

export function PostList({ user }: PostListProps) {
  const t = useT()
  const { createPost } = useContainer()
  const { state, reload, mutate } = useUserPosts(user.id)
  const pendingCount = useRef(0)
  const [toast, setToast] = useState<{
    readonly id: number
    readonly message: string
  } | null>(null)
  const posts = state.status === 'success' ? state.data : state.status === 'empty' ? [] : null
  const page = usePaged(posts ?? NO_POSTS, PAGE_SIZE)

  const publish = async (draft: NewPost): Promise<Result<Post>> => {
    pendingCount.current += 1
    const pending: Post = { ...normalizeDraft(draft), id: Number.MIN_SAFE_INTEGER + pendingCount.current, source: 'pending' }
    mutate((current) => [pending, ...current])
    const result = await createPost.execute(draft)
    mutate((current) =>
      result.ok
        ? current.map((post) => (post.id === pending.id ? result.value : post))
        : current.filter((post) => post.id !== pending.id),
    )
    if (result.ok) {
      setToast((current) => ({
        id: (current?.id ?? 0) + 1,
        message: t('form.success'),
      }))
    }
    return result
  }

  return (
    <>
      <NewPostForm userId={user.id} onSubmit={publish} />
      <section className={styles.panel} aria-labelledby="posts-title" aria-busy={state.status === 'loading'}>
        <div className={styles.header}>
          <h3 id="posts-title" className={styles.title}>
            {t('posts.title')}
          </h3>
          {posts !== null && posts.length > 0 && <span className={styles.count}>{counted(t, 'posts.count', posts.length)}</span>}
        </div>
        {state.status === 'loading' && <Spinner label={t('posts.loading')} />}
        {state.status === 'error' && <ErrorBox error={state.error} onRetry={reload} />}
        {posts !== null && posts.length === 0 && (
          <EmptyState icon={<FileTextIcon />} title={t('posts.empty.title')} hint={t('posts.empty.hint', { name: user.name })} />
        )}
        {posts !== null && posts.length > 0 && (
          <ol className={styles.list}>
            {page.shown.map((post, index) => (
              <li key={post.id} className={classOf(post)} style={{ '--i': index } as CSSProperties}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <article className={styles.article}>
                  <h4 className={styles.postTitle}>
                    {post.title}
                    {post.source === 'written' && <span className={styles.badge}>{t('post.new')}</span>}
                    {post.source === 'pending' && <span className={styles.sending}>{t('post.sending')}</span>}
                  </h4>
                  <p className={styles.body}>{post.body}</p>
                </article>
              </li>
            ))}
          </ol>
        )}
        {page.hidden > 0 && (
          <div className={styles.more}>
            <button type="button" onClick={page.showMore}>
              <ChevronDownIcon />
              {t('action.showMore', { count: Math.min(page.hidden, PAGE_SIZE) })}
            </button>
          </div>
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
