export interface NewPost {
  readonly userId: number
  readonly title: string
  readonly body: string
}

export const TITLE_MAX = 100
export const BODY_MAX = 1000
