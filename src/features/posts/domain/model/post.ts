export type PostSource = 'remote' | 'written'

export interface Post {
  readonly id: number
  readonly userId: number
  readonly title: string
  readonly body: string
  readonly source: PostSource
}
