export const uniqueById = <T extends { readonly id: number }>(items: readonly T[]): readonly T[] => {
  const seen = new Set<number>()
  return items.filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)))
}
