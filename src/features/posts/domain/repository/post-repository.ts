import type { Result } from '../../../../core/result'
import type { Post } from '../model/post'

export interface PostRepository {
  getByUser(userId: number, signal?: AbortSignal): Promise<Result<readonly Post[]>>
}
