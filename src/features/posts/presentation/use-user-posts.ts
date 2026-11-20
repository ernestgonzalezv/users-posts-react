import { useCallback } from 'react'
import { useContainer } from '../../../di/container-context'
import type { Resource } from '../../../shared/presentation/use-resource'
import { useResource } from '../../../shared/presentation/use-resource'
import type { Post } from '../domain/model/post'

export const useUserPosts = (userId: number): Resource<readonly Post[]> => {
  const { getUserPosts } = useContainer()
  const load = useCallback((signal: AbortSignal) => getUserPosts.execute(userId, signal), [getUserPosts, userId])
  return useResource(load)
}
