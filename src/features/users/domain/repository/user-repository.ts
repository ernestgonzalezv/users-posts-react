import type { Result } from '../../../../core/result'
import type { User } from '../model/user'

export interface UserRepository {
  getAll(signal?: AbortSignal): Promise<Result<readonly User[]>>
}
