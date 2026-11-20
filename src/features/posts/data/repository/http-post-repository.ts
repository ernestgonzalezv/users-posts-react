import type { HttpClient } from '../../../../core/http-client'
import type { Result } from '../../../../core/result'
import { mapResult } from '../../../../core/result'
import type { Post } from '../../domain/model/post'
import type { PostRepository } from '../../domain/repository/post-repository'
import { isPostDtoList } from '../dto/post-dto'
import { toPost } from '../mapper/post-mapper'

export class HttpPostRepository implements PostRepository {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  async getByUser(userId: number, signal?: AbortSignal): Promise<Result<readonly Post[]>> {
    const result = await this.http.get(`/posts?userId=${String(userId)}`, isPostDtoList, { signal })
    return mapResult(result, (dtos) => dtos.map(toPost))
  }
}
