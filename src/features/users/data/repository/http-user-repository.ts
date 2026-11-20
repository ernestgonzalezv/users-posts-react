import type { HttpClient } from '../../../../core/http-client'
import type { Result } from '../../../../core/result'
import { mapResult } from '../../../../core/result'
import type { User } from '../../domain/model/user'
import type { UserRepository } from '../../domain/repository/user-repository'
import { isUserDtoList } from '../dto/user-dto'
import { toUser } from '../mapper/user-mapper'

export class HttpUserRepository implements UserRepository {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  async getAll(signal?: AbortSignal): Promise<Result<readonly User[]>> {
    const result = await this.http.get('/users', isUserDtoList, { signal })
    return mapResult(result, (dtos) => dtos.map(toUser))
  }
}
