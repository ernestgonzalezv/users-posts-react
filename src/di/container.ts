import { API_BASE_URL } from '../core/config'
import type { FetchFunction } from '../core/http-client'
import { HttpClient } from '../core/http-client'
import { HttpUserRepository } from '../features/users/data/repository/http-user-repository'
import { GetUsers } from '../features/users/domain/usecase/get-users'

export interface Container {
  readonly getUsers: GetUsers
}

interface ContainerConfig {
  readonly baseUrl?: string
  readonly fetchFunction?: FetchFunction
}

export const createContainer = (config: ContainerConfig = {}): Container => {
  const http = new HttpClient({
    baseUrl: config.baseUrl ?? API_BASE_URL,
    ...(config.fetchFunction === undefined ? {} : { fetchFunction: config.fetchFunction }),
  })
  const users = new HttpUserRepository(http)
  return { getUsers: new GetUsers(users) }
}
