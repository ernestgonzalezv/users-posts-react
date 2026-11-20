import { describe, expect, it } from 'vitest'
import { toUser } from './user-mapper'

describe('toUser', () => {
  it('flattens the company name and keeps the identity fields', () => {
    expect(toUser({ id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz', website: 'hildegard.org', company: { name: 'Romaguera-Crona' } })).toEqual({
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      website: 'hildegard.org',
      company: 'Romaguera-Crona',
    })
  })

  it('maps missing optional fields to empty strings', () => {
    const user = toUser({ id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' })
    expect(user.website).toBe('')
    expect(user.company).toBe('')
  })
})
