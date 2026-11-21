import { describe, expect, it, vi } from 'vitest'
import type { PostRepository } from '../repository/post-repository'
import { CreatePost, normalizeDraft, validateDraft } from './create-post'

const repositoryWith = (create: PostRepository['create']): PostRepository => ({
  getByUser: vi.fn<PostRepository['getByUser']>(),
  create,
})

describe('validateDraft', () => {
  it('requires a title and a body after trimming', () => {
    expect(validateDraft({ userId: 1, title: '   ', body: '\n\t' })).toEqual({ title: 'required', body: 'required' })
  })

  it('caps the title at 100 and the body at 1000 characters', () => {
    expect(validateDraft({ userId: 1, title: 'a'.repeat(101), body: 'b'.repeat(1001) })).toEqual({
      title: 'too-long',
      body: 'too-long',
    })
    expect(validateDraft({ userId: 1, title: 'a'.repeat(100), body: 'b'.repeat(1000) })).toEqual({})
  })

  it('counts graphemes, not code units, so emoji and accents are not penalised', () => {
    expect(validateDraft({ userId: 1, title: '👩‍👩‍👧‍👦'.repeat(100), body: 'é'.normalize('NFD').repeat(1000) })).toEqual({})
    expect(validateDraft({ userId: 1, title: '🇪🇸'.repeat(101), body: 'ok' })).toEqual({ title: 'too-long' })
  })

  it('strips control characters and tidies line breaks in the body', () => {
    expect(normalizeDraft({ userId: 1, title: 'A\u0000B\u200Bc\tD', body: ' one \r\n\r\n\r\n\r\ntwo\u0007 \t\n' })).toEqual({
      userId: 1,
      title: 'ABc D',
      body: 'one\n\ntwo',
    })
    expect(validateDraft({ userId: 1, title: '\u0000\u200B', body: '\u0007' })).toEqual({ title: 'required', body: 'required' })
  })

  it('reports only the faulty field', () => {
    expect(validateDraft({ userId: 1, title: 'Fine', body: '' })).toEqual({ body: 'required' })
  })
})

describe('CreatePost', () => {
  it('never reaches the repository with an invalid draft', async () => {
    const create = vi.fn<PostRepository['create']>()
    const result = await new CreatePost(repositoryWith(create)).execute({ userId: 1, title: '', body: 'x' })
    expect(result).toEqual({ ok: false, error: { kind: 'validation', fields: { title: 'required' } } })
    expect(create).not.toHaveBeenCalled()
  })

  it('sends the normalized draft and returns the created post', async () => {
    const created = { id: 101, userId: 1, title: 'Hello world', body: 'Body', source: 'remote' as const }
    const create = vi.fn<PostRepository['create']>().mockResolvedValue({ ok: true, value: created })
    const controller = new AbortController()
    const result = await new CreatePost(repositoryWith(create)).execute(
      { userId: 1, title: '  Hello   world ', body: '\nBody\n' },
      controller.signal,
    )
    expect(create).toHaveBeenCalledWith({ userId: 1, title: 'Hello world', body: 'Body' }, controller.signal)
    expect(result).toEqual({ ok: true, value: created })
  })
})
