import type { StoryScene } from './types'

// Telling order: scenes carry an optional chapter letter (A/B/C…). Scenes that
// share a letter are narrated together; sorting the letters gives the order the
// story is told, which may differ from chronological order on the paradigm line.

export const TELLING_LETTERS = 'ABCDEFGHIJ'.split('')

export interface TellingChapter {
  letter: string
  scenes: StoryScene[]
}

/** Group scenes into their telling chapters, ordered A→B→C. Unassigned scenes are dropped. */
export function tellingChapters(scenes: StoryScene[]): TellingChapter[] {
  const map = new Map<string, StoryScene[]>()
  for (const s of scenes) {
    if (!s.tellingChapter) continue
    const arr = map.get(s.tellingChapter) ?? []
    arr.push(s)
    map.set(s.tellingChapter, arr)
  }
  return [...map.keys()]
    .sort()
    .map((letter) => ({ letter, scenes: map.get(letter)! }))
}

/** Whether any scene has a telling chapter assigned. */
export function hasTellingOrder(scenes: StoryScene[]): boolean {
  return scenes.some((s) => !!s.tellingChapter)
}
