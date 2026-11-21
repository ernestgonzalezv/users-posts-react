import { isRecord } from '../../../../core/guards'

export interface PostDto {
  readonly id: number
  readonly userId: number
  readonly title: string
  readonly body: string
}

export const isPostDto = (value: unknown): value is PostDto =>
  isRecord(value) &&
  typeof value.id === 'number' &&
  typeof value.userId === 'number' &&
  typeof value.title === 'string' &&
  typeof value.body === 'string'

export const isPostDtoList = (value: unknown): value is PostDto[] => Array.isArray(value) && value.every(isPostDto)
