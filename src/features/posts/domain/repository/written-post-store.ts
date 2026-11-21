import type { NewPost } from '../model/new-post'
import type { Post } from '../model/post'

export interface WrittenPostStore {
  list(userId: number): readonly Post[]
  add(post: NewPost): Post
}
