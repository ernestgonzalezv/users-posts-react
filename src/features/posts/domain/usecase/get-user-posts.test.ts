import { describe, expect, it, vi } from 'vitest'
import type { PostRepository } from '../repository/post-repository'
import { GetUserPosts } from './get-user-posts'

describe('GetUserPosts', () => {
  it('asks the repository for the posts of that user with the signal', async () => {
    const getByUser = vi.fn<PostRepository['getByUser']>().mockResolvedValue({ ok: true, value: [] })
    const repository: PostRepository = { getByUser }
    const controller = new AbortController()
    const result = await new GetUserPosts(repository).execute(7, controller.signal)
    expect(getByUser).toHaveBeenCalledWith(7, controller.signal)
    expect(result).toEqual({ ok: true, value: [] })
  })
})
