import type { Character } from './types'

/** Look up a roster colour for a character name, or undefined if not in the roster. */
export function colorForName(
  name: string,
  characters: Character[],
): string | undefined {
  return characters.find((c) => c.name === name)?.color
}
