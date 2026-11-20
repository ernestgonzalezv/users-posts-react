export interface UserDto {
  readonly id: number
  readonly name: string
  readonly username: string
  readonly email: string
  readonly website?: string
  readonly company?: { readonly name?: string }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

export const isUserDto = (value: unknown): value is UserDto =>
  isRecord(value) &&
  typeof value.id === 'number' &&
  typeof value.name === 'string' &&
  typeof value.username === 'string' &&
  typeof value.email === 'string' &&
  (value.website === undefined || typeof value.website === 'string') &&
  (value.company === undefined || (isRecord(value.company) && (value.company.name === undefined || typeof value.company.name === 'string')))

export const isUserDtoList = (value: unknown): value is UserDto[] => Array.isArray(value) && value.every(isUserDto)
