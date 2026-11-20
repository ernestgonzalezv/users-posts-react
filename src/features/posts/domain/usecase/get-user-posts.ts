import type { Result } from '../../../../core/result'
import type { Post } from '../model/post'
import type { PostRepository } from '../repository/post-repository'

export class GetUserPosts {
  private readonly repository: PostRepository

  constructor(repository: PostRepository) {
    this.repository = repository
  }

  execute(userId: number, signal?: AbortSignal): Promise<Result<readonly Post[]>> {
    return this.repository.getByUser(userId, signal)
  }
}
