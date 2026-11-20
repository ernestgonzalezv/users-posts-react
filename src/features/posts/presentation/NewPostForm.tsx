import { useId, useRef, useState } from 'react'
import type { AppError } from '../../../core/app-error'
import { useContainer } from '../../../di/container-context'
import { useT } from '../../../i18n/locale-context'
import { ErrorBox } from '../../../shared/ui/ErrorBox'
import { SendIcon } from '../../../shared/ui/icons'
import { Spinner } from '../../../shared/ui/Spinner'
import { BODY_MAX, TITLE_MAX } from '../domain/model/new-post'
import type { Post } from '../domain/model/post'
import type { DraftFaults, FieldFault } from '../domain/usecase/create-post'
import { validateDraft } from '../domain/usecase/create-post'
import styles from './NewPostForm.module.css'

interface NewPostFormProps {
  readonly userId: number
  readonly onCreated: (post: Post) => void
}

type Submission = { readonly status: 'idle' } | { readonly status: 'submitting' } | { readonly status: 'failed'; readonly error: AppError }

export function NewPostForm({ userId, onCreated }: NewPostFormProps) {
  const t = useT()
  const { createPost } = useContainer()
  const id = useId()
  const titleRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [faults, setFaults] = useState<DraftFaults>({})
  const [submission, setSubmission] = useState<Submission>({ status: 'idle' })
  const busy = submission.status === 'submitting'

  const faultText = (fault: FieldFault | undefined, max: number): string | null =>
    fault === undefined ? null : fault === 'required' ? t('form.fault.required') : t('form.fault.too-long', { max })

  const submit = async (event?: { preventDefault: () => void }) => {
    event?.preventDefault()
    if (busy) {
      return
    }
    const draft = { userId, title, body }
    const nextFaults = validateDraft(draft)
    setFaults(nextFaults)
    if (nextFaults.title !== undefined) {
      titleRef.current?.focus()
      return
    }
    if (nextFaults.body !== undefined) {
      bodyRef.current?.focus()
      return
    }
    setSubmission({ status: 'submitting' })
    const result = await createPost.execute(draft)
    if (result.ok) {
      setTitle('')
      setBody('')
      setSubmission({ status: 'idle' })
      onCreated(result.value)
      return
    }
    setSubmission({ status: 'failed', error: result.error })
  }

  const titleFault = faultText(faults.title, TITLE_MAX)
  const bodyFault = faultText(faults.body, BODY_MAX)

  return (
    <form
      className={styles.form}
      aria-labelledby={`${id}-heading`}
      aria-busy={busy}
      noValidate
      onSubmit={(event) => {
        void submit(event)
      }}
    >
      <h3 id={`${id}-heading`} className={styles.heading}>
        {t('form.heading')}
      </h3>
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor={`${id}-title`}>{t('form.title.label')}</label>
          <span className={title.length > TITLE_MAX ? styles.counterOver : styles.counter}>
            {t('form.counter', { count: title.length, max: TITLE_MAX })}
          </span>
        </div>
        <input
          ref={titleRef}
          id={`${id}-title`}
          className={styles.input}
          value={title}
          placeholder={t('form.title.placeholder')}
          disabled={busy}
          aria-invalid={titleFault !== null}
          aria-describedby={titleFault === null ? undefined : `${id}-title-fault`}
          onChange={(event) => {
            setTitle(event.target.value)
          }}
        />
        {titleFault !== null && (
          <p id={`${id}-title-fault`} className={styles.fault}>
            {titleFault}
          </p>
        )}
      </div>
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor={`${id}-body`}>{t('form.body.label')}</label>
          <span className={body.length > BODY_MAX ? styles.counterOver : styles.counter}>
            {t('form.counter', { count: body.length, max: BODY_MAX })}
          </span>
        </div>
        <textarea
          ref={bodyRef}
          id={`${id}-body`}
          className={styles.textarea}
          value={body}
          rows={4}
          placeholder={t('form.body.placeholder')}
          disabled={busy}
          aria-invalid={bodyFault !== null}
          aria-describedby={bodyFault === null ? undefined : `${id}-body-fault`}
          onChange={(event) => {
            setBody(event.target.value)
          }}
        />
        {bodyFault !== null && (
          <p id={`${id}-body-fault`} className={styles.fault}>
            {bodyFault}
          </p>
        )}
      </div>
      {submission.status === 'failed' && (
        <ErrorBox
          error={submission.error}
          onRetry={() => {
            void submit()
          }}
        />
      )}
      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={busy}>
          <SendIcon />
          {t('form.submit')}
        </button>
        {busy && <Spinner label={t('form.submitting')} />}
      </div>
    </form>
  )
}
