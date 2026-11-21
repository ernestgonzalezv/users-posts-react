import { describe, expect, it } from 'vitest'
import { firstGrapheme, graphemes, stripControls, textLength } from './text'

describe('graphemes and textLength', () => {
  it('counts user-perceived characters', () => {
    expect(textLength('')).toBe(0)
    expect(textLength('abc')).toBe(3)
    expect(textLength('🇪🇸')).toBe(1)
    expect(textLength('👩‍👩‍👧‍👦')).toBe(1)
    expect(textLength('é')).toBe(1)
    expect(graphemes('a🇪🇸b')).toEqual(['a', '🇪🇸', 'b'])
  })

  it('takes the first grapheme whole', () => {
    expect(firstGrapheme('🇪🇸x')).toBe('🇪🇸')
    expect(firstGrapheme('')).toBe('')
  })
})

describe('stripControls', () => {
  it('removes control and zero-width characters and normalises line endings', () => {
    expect(stripControls('a\u0000b​c﻿d\u0007', false)).toBe('abcd')
    expect(stripControls('a\r\nb\rc\n', true)).toBe('a\nb\nc\n')
    expect(stripControls('a\r\nb\tc', false)).toBe('abc')
    expect(stripControls('a\nb\tc', true)).toBe('a\nb\tc')
  })

  it('keeps letters of every script, emoji and joiners', () => {
    expect(stripControls('日本語 العربية 👩‍👩‍👧‍👦 ‌فارسی', false)).toBe('日本語 العربية 👩‍👩‍👧‍👦 ‌فارسی')
  })
})
