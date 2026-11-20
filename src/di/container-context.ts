import { createContext, useContext } from 'react'
import type { Container } from './container'

export const ContainerContext = createContext<Container | null>(null)

export const useContainer = (): Container => {
  const container = useContext(ContainerContext)
  if (container === null) {
    throw new Error('useContainer must be used inside a ContainerProvider')
  }
  return container
}
