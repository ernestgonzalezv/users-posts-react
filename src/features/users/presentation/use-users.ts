import { useCallback } from 'react'
import { useContainer } from '../../../di/container-context'
import type { Resource } from '../../../shared/presentation/use-resource'
import { useResource } from '../../../shared/presentation/use-resource'
import type { User } from '../domain/model/user'

export const useUsers = (): Resource<readonly User[]> => {
  const { getUsers } = useContainer()
  const load = useCallback((signal: AbortSignal) => getUsers.execute(signal), [getUsers])
  return useResource(load)
}
