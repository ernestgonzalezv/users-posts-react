import type { HttpClient } from '../../../../core/http-client'
import type { Result } from '../../../../core/result'
import { mapResult } from '../../../../core/result'
import type { NewPost } from '../../domain/model/new-post'
import type { Post } from '../../domain/model/post'
import type { PostRepository } from '../../domain/repository/post-repository'
import type { WrittenPostStore } from '../../domain/repository/written-post-store'
import { isPostDto, isPostDtoList } from '../dto/post-dto'
import { toPost } from '../mapper/post-mapper'

export class HttpPostRepository implements PostRepository {
  private readonly http: HttpClient
  private readonly written: WrittenPostStore

  constructor(http: HttpClient, written: WrittenPostStore) {
    this.http = http
    this.written = written
  }

  async getByUser(userId: number, signal?: AbortSignal): Promise<Result<readonly Post[]>> {
    const result = await this.http.get(`/posts?userId=${String(userId)}`, isPostDtoList, { signal })
    return mapResult(result, (dtos) => [...this.written.list(userId), ...dtos.map((dto) => toPost(dto))])
  }

  async create(post: NewPost, signal?: AbortSignal): Promise<Result<Post>> {
    const result = await this.http.post('/posts', post, isPostDto, { signal })
    return mapResult(result, () => this.written.add(post))
  }
}
