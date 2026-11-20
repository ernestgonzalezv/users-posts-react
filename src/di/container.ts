import { API_BASE_URL } from '../core/config'
import type { FetchFunction } from '../core/http-client'
import { HttpClient } from '../core/http-client'
import { HttpPostRepository } from '../features/posts/data/repository/http-post-repository'
import { CreatePost } from '../features/posts/domain/usecase/create-post'
import { GetUserPosts } from '../features/posts/domain/usecase/get-user-posts'
import { HttpUserRepository } from '../features/users/data/repository/http-user-repository'
import { GetUsers } from '../features/users/domain/usecase/get-users'

export interface Container {
  readonly getUsers: GetUsers
  readonly getUserPosts: GetUserPosts
  readonly createPost: CreatePost
}

interface ContainerConfig {
  readonly baseUrl?: string
  readonly fetchFunction?: FetchFunction
  readonly timeoutMs?: number
}

export const createContainer = (config: ContainerConfig = {}): Container => {
  const http = new HttpClient({
    baseUrl: config.baseUrl ?? API_BASE_URL,
    ...(config.fetchFunction === undefined ? {} : { fetchFunction: config.fetchFunction }),
    ...(config.timeoutMs === undefined ? {} : { timeoutMs: config.timeoutMs }),
  })
  const users = new HttpUserRepository(http)
  const posts = new HttpPostRepository(http)
  return { getUsers: new GetUsers(users), getUserPosts: new GetUserPosts(posts), createPost: new CreatePost(posts) }
}
