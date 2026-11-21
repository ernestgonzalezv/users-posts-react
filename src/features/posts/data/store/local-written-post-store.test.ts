import { describe, expect, it, vi } from 'vitest'
import { LocalWrittenPostStore, WRITTEN_POSTS_KEY } from './local-written-post-store'

const storeOver = (initial: string | null) => {
  let raw = initial
  const write = vi.fn((value: string) => {
    raw = value
  })
  return { store: new LocalWrittenPostStore(() => raw, write), write, current: () => raw }
}

describe('LocalWrittenPostStore', () => {
  it('starts empty and lists per user, newest first, with negative unique ids', () => {
    const { store, current } = storeOver(null)
    expect(store.list(3)).toEqual([])
    const first = store.add({ userId: 3, title: 'First', body: 'a' })
    const second = store.add({ userId: 3, title: 'Second', body: 'b' })
    const other = store.add({ userId: 4, title: 'Other', body: 'c' })
    expect([first.id, second.id, other.id]).toEqual([-1, -2, -3])
    expect(store.list(3).map((post) => post.title)).toEqual(['Second', 'First'])
    expect(store.list(4)).toEqual([other])
    expect(first.source).toBe('written')
    expect(JSON.parse(current() ?? '')).toEqual({
      '3': [
        { id: -2, userId: 3, title: 'Second', body: 'b' },
        { id: -1, userId: 3, title: 'First', body: 'a' },
      ],
      '4': [{ id: -3, userId: 4, title: 'Other', body: 'c' }],
    })
  })

  it('reads what a previous session wrote and continues the ids below it', () => {
    const { store } = storeOver(JSON.stringify({ '3': [{ id: -7, userId: 3, title: 'Old', body: 'x' }] }))
    expect(store.list(3)).toEqual([{ id: -7, userId: 3, title: 'Old', body: 'x', source: 'written' }])
    expect(store.add({ userId: 9, title: 'New', body: 'y' }).id).toBe(-8)
  })

  it.each(['not json', '[]', '{"3":"nope"}', '{"3":[{"id":"1"}]}', 'null', '42'])('ignores corrupt storage (%s)', (raw) => {
    const { store } = storeOver(raw)
    expect(store.list(3)).toEqual([])
    expect(store.add({ userId: 3, title: 'Fresh', body: 'z' }).id).toBe(-1)
  })

  it('keeps the posts in memory when the write fails', () => {
    const read = vi.fn(() => null)
    const store = new LocalWrittenPostStore(read, () => {
      throw new Error('quota')
    })
    expect(() => store.add({ userId: 3, title: 'Volatile', body: 'v' })).toThrow('quota')
    expect(store.list(3).map((post) => post.title)).toEqual(['Volatile'])
    expect(read).toHaveBeenCalledTimes(1)
  })

  it('uses local storage under its key by default', () => {
    window.localStorage.setItem(WRITTEN_POSTS_KEY, JSON.stringify({ '1': [{ id: -1, userId: 1, title: 'Stored', body: 's' }] }))
    const store = new LocalWrittenPostStore()
    expect(store.list(1).map((post) => post.title)).toEqual(['Stored'])
    store.add({ userId: 1, title: 'More', body: 'm' })
    expect(window.localStorage.getItem(WRITTEN_POSTS_KEY)).toContain('"More"')
  })
})
