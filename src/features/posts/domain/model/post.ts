export type PostSource = 'remote' | 'written' | 'pending'

export interface Post {
  readonly id: number
  readonly userId: number
  readonly title: string
  readonly body: string
  readonly source: PostSource
}
