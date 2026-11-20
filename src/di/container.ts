import { API_BASE_URL } from '../core/config'
import type { FetchFunction } from '../core/http-client'
import { HttpClient } from '../core/http-client'
import { HttpPostRepository } from '../features/posts/data/repository/http-post-repository'
import { GetUserPosts } from '../features/posts/domain/usecase/get-user-posts'
import { HttpUserRepository } from '../features/users/data/repository/http-user-repository'
import { GetUsers } from '../features/users/domain/usecase/get-users'

export interface Container {
  readonly getUsers: GetUsers
  readonly getUserPosts: GetUserPosts
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
  const posts = new HttpPostRepository(http)
  return { getUsers: new GetUsers(users), getUserPosts: new GetUserPosts(posts) }
}
