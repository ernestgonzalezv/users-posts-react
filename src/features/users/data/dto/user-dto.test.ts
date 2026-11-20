import { describe, expect, it } from 'vitest'
import { isUserDto, isUserDtoList } from './user-dto'

const valid = { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz', website: 'hildegard.org', company: { name: 'Romaguera-Crona' } }

describe('isUserDto', () => {
  it('accepts the shape JSONPlaceholder returns, with extra fields', () => {
    expect(isUserDto({ ...valid, address: { city: 'Gwenborough' }, phone: '1-770' })).toBe(true)
  })

  it('accepts a user without website or company', () => {
    expect(isUserDto({ id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' })).toBe(true)
  })

  it('rejects a missing or mistyped required field', () => {
    expect(isUserDto({ ...valid, id: '1' })).toBe(false)
    expect(isUserDto({ ...valid, email: undefined })).toBe(false)
    expect(isUserDto(null)).toBe(false)
    expect(isUserDto('user')).toBe(false)
  })

  it('rejects a company that is not an object with an optional string name', () => {
    expect(isUserDto({ ...valid, company: 'Romaguera' })).toBe(false)
    expect(isUserDto({ ...valid, company: { name: 3 } })).toBe(false)
  })
})

describe('isUserDtoList', () => {
  it('accepts only an array where every item is a user', () => {
    expect(isUserDtoList([valid, valid])).toBe(true)
    expect(isUserDtoList([])).toBe(true)
    expect(isUserDtoList([valid, { id: 2 }])).toBe(false)
    expect(isUserDtoList(valid)).toBe(false)
  })
})
