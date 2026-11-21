import { describe, expect, it } from 'vitest'
import { toUser } from './user-mapper'

describe('toUser', () => {
  it('flattens the company name and keeps the identity fields', () => {
    expect(
      toUser({
        id: 1,
        name: 'Leanne Graham',
        username: 'Bret',
        email: 'Sincere@april.biz',
        website: 'hildegard.org',
        company: { name: 'Romaguera-Crona' },
      }),
    ).toEqual({
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      website: 'hildegard.org',
      company: 'Romaguera-Crona',
    })
  })

  it('trims, collapses spaces and strips control characters from every text', () => {
    const user = toUser({
      id: 3,
      name: '  Clementine\u0000  Bauch\t',
      username: ' Sam\u200B ',
      email: '\nNathan@yesenia.net ',
      website: ' ramiro.info\r\n',
      company: { name: ' Romaguera \n Jacobson ' },
    })
    expect(user).toEqual({
      id: 3,
      name: 'Clementine Bauch',
      username: 'Sam',
      email: 'Nathan@yesenia.net',
      website: 'ramiro.info',
      company: 'Romaguera Jacobson',
    })
  })

  it('names a user by username, then by id, when the name is blank', () => {
    expect(toUser({ id: 4, name: '   ', username: 'Karianne', email: 'x@y.z' }).name).toBe('Karianne')
    expect(toUser({ id: 5, name: '', username: '\t', email: 'x@y.z' }).name).toBe('#5')
  })

  it('maps missing optional fields to empty strings', () => {
    const user = toUser({ id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' })
    expect(user.website).toBe('')
    expect(user.company).toBe('')
  })
})
