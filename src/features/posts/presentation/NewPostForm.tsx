import { useId, useRef, useState } from 'react'
import { textLength } from '../../../core/text'
import type { AppError } from '../../../core/app-error'
import { useT } from '../../../i18n/locale-context'
import { ErrorBox } from '../../../shared/ui/ErrorBox'
import { SendIcon } from '../../../shared/ui/icons'
import { Spinner } from '../../../shared/ui/Spinner'
import type { NewPost } from '../domain/model/new-post'
import { BODY_MAX, TITLE_MAX } from '../domain/model/new-post'
import type { DraftFaults, FieldFault, Publish } from '../domain/usecase/create-post'
import { normalizeBody, normalizeTitle, validateDraft } from '../domain/usecase/create-post'
import styles from './NewPostForm.module.css'

const HARD_CAP = 20

interface NewPostFormProps {
  readonly userId: number
  readonly onSubmit: Publish
}

type Submission =
  | { readonly status: 'idle' }
  | { readonly status: 'submitting' }
  | { readonly status: 'failed'; readonly error: AppError; readonly draft: NewPost }

export function NewPostForm({ userId, onSubmit }: NewPostFormProps) {
  const t = useT()
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

  const send = async (draft: NewPost) => {
    setSubmission({ status: 'submitting' })
    setTitle('')
    setBody('')
    const result = await onSubmit(draft)
    if (result.ok) {
      setSubmission({ status: 'idle' })
      return
    }
    setTitle((current) => (current === '' ? draft.title : current))
    setBody((current) => (current === '' ? draft.body : current))
    setSubmission({ status: 'failed', error: result.error, draft })
  }

  const submit = (event: { preventDefault: () => void }) => {
    event.preventDefault()
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
    void send(draft)
  }

  const titleLength = textLength(normalizeTitle(title))
  const bodyLength = textLength(normalizeBody(body))
  const titleFault = faultText(faults.title, TITLE_MAX)
  const bodyFault = faultText(faults.body, BODY_MAX)

  return (
    <form className={styles.form} aria-labelledby={`${id}-heading`} aria-busy={busy} noValidate onSubmit={submit}>
      <h3 id={`${id}-heading`} className={styles.heading}>
        {t('form.heading')}
      </h3>
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor={`${id}-title`}>{t('form.title.label')}</label>
          <span className={titleLength > TITLE_MAX ? styles.counterOver : styles.counter}>
            {t('form.counter', { count: titleLength, max: TITLE_MAX })}
          </span>
        </div>
        <input
          ref={titleRef}
          id={`${id}-title`}
          className={styles.input}
          value={title}
          maxLength={TITLE_MAX * HARD_CAP}
          placeholder={t('form.title.placeholder')}
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
          <span className={bodyLength > BODY_MAX ? styles.counterOver : styles.counter}>
            {t('form.counter', { count: bodyLength, max: BODY_MAX })}
          </span>
        </div>
        <textarea
          ref={bodyRef}
          id={`${id}-body`}
          className={styles.textarea}
          value={body}
          rows={4}
          maxLength={BODY_MAX * HARD_CAP}
          placeholder={t('form.body.placeholder')}
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
            void send(submission.draft)
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
