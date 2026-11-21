const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null

export const graphemes = (text: string): readonly string[] =>
  segmenter === null ? Array.from(text) : Array.from(segmenter.segment(text), (segment) => segment.segment)

export const textLength = (text: string): number => graphemes(text).length

export const firstGrapheme = (text: string): string => graphemes(text)[0] ?? ''

const CONTROLS = /[\p{Cc}\u200B\uFEFF]/gu
const KEPT_CONTROLS = new Set(['\n', '\t'])

export const stripControls = (text: string, keepLineBreaks: boolean): string =>
  text.replace(/\r\n?/g, '\n').replace(CONTROLS, (match) => (keepLineBreaks && KEPT_CONTROLS.has(match) ? match : ''))
