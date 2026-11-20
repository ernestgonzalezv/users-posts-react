import type { Result } from '../../../../core/result'
import type { User } from '../model/user'
import type { UserRepository } from '../repository/user-repository'

export class GetUsers {
  private readonly repository: UserRepository

  constructor(repository: UserRepository) {
    this.repository = repository
  }

  execute(signal?: AbortSignal): Promise<Result<readonly User[]>> {
    return this.repository.getAll(signal)
  }
}
