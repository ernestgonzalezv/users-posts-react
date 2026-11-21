import { validationError } from '../../../../core/app-error'
import { stripControls, textLength } from '../../../../core/text'
import type { Result } from '../../../../core/result'
import { failure } from '../../../../core/result'
import type { NewPost } from '../model/new-post'
import { BODY_MAX, TITLE_MAX } from '../model/new-post'
import type { Post } from '../model/post'
import type { PostRepository } from '../repository/post-repository'

export type FieldName = 'title' | 'body'
export type FieldFault = 'required' | 'too-long'
export type DraftFaults = Partial<Readonly<Record<FieldName, FieldFault>>>
export type Publish = (draft: NewPost) => Promise<Result<Post>>

const faultOf = (value: string, max: number): FieldFault | null =>
  value === '' ? 'required' : textLength(value) > max ? 'too-long' : null

export const normalizeTitle = (title: string): string => stripControls(title, true).trim().replace(/\s+/g, ' ')

export const normalizeBody = (body: string): string =>
  stripControls(body, true)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

export const normalizeDraft = (draft: NewPost): NewPost => ({
  userId: draft.userId,
  title: normalizeTitle(draft.title),
  body: normalizeBody(draft.body),
})

export const validateDraft = (draft: NewPost): DraftFaults => {
  const clean = normalizeDraft(draft)
  const title = faultOf(clean.title, TITLE_MAX)
  const body = faultOf(clean.body, BODY_MAX)
  return { ...(title === null ? {} : { title }), ...(body === null ? {} : { body }) }
}

export class CreatePost {
  private readonly repository: PostRepository

  constructor(repository: PostRepository) {
    this.repository = repository
  }

  execute(draft: NewPost, signal?: AbortSignal): Promise<Result<Post>> {
    const faults = validateDraft(draft)
    if (Object.keys(faults).length > 0) {
      return Promise.resolve(failure(validationError(faults)))
    }
    return this.repository.create(normalizeDraft(draft), signal)
  }
}
