import { isRecord } from '../../../../core/guards'
import { readStorage, writeStorage } from '../../../../core/storage'
import type { NewPost } from '../../domain/model/new-post'
import type { Post } from '../../domain/model/post'
import type { WrittenPostStore } from '../../domain/repository/written-post-store'
import type { PostDto } from '../dto/post-dto'
import { isPostDtoList } from '../dto/post-dto'
import { toPost } from '../mapper/post-mapper'

export const WRITTEN_POSTS_KEY = 'written-posts'

type Shelf = Readonly<Record<string, readonly PostDto[]>>

const isShelf = (value: unknown): value is Shelf => isRecord(value) && Object.values(value).every(isPostDtoList)

const parseShelf = (raw: string | null): Shelf => {
  if (raw === null) {
    return {}
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    return isShelf(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

const lowestId = (shelf: Shelf): number => Math.min(0, ...Object.values(shelf).flatMap((posts) => posts.map((post) => post.id)))

export class LocalWrittenPostStore implements WrittenPostStore {
  private shelf: Shelf | null = null
  private readonly read: () => string | null
  private readonly write: (value: string) => void

  constructor(
    read: () => string | null = () => readStorage(WRITTEN_POSTS_KEY),
    write: (value: string) => void = (value) => {
      writeStorage(WRITTEN_POSTS_KEY, value)
    },
  ) {
    this.read = read
    this.write = write
  }

  list(userId: number): readonly Post[] {
    return (this.load()[String(userId)] ?? []).map((dto) => toPost(dto, 'written'))
  }

  add(post: NewPost): Post {
    const shelf = this.load()
    const dto: PostDto = { id: lowestId(shelf) - 1, userId: post.userId, title: post.title, body: post.body }
    const key = String(post.userId)
    this.shelf = { ...shelf, [key]: [dto, ...(shelf[key] ?? [])] }
    this.write(JSON.stringify(this.shelf))
    return toPost(dto, 'written')
  }

  private load(): Shelf {
    this.shelf ??= parseShelf(this.read())
    return this.shelf
  }
}
