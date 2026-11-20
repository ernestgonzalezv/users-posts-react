import type { ReactNode } from 'react'
import type { Container } from './container'
import { ContainerContext } from './container-context'

interface ContainerProviderProps {
  readonly container: Container
  readonly children: ReactNode
}

export function ContainerProvider({ container, children }: ContainerProviderProps) {
  return <ContainerContext value={container}>{children}</ContainerContext>
}
