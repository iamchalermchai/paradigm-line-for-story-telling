import type { StoryScene } from './types'

// Telling order: scenes carry an optional chapter key. Scenes sharing a key are
// narrated together; the project's `tellingChapterOrder` sequences the keys, and
// the displayed letter (A, B, … Z, AA, AB, …) is derived from a key's position,
// so reordering the list relabels chapters automatically. If no explicit order
// is stored yet, one is derived from the sorted keys — so older data just works.

/** Spreadsheet-style letter for a 0-based index: 0→A, 25→Z, 26→AA, 27→AB… */
export function chapterLetter(index: number): string {
  let n = index
  let s = ''
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  }
  return s
}

/** The effective ordered list of chapter keys: the stored order plus any keys
 *  used by scenes but not yet listed; sorted keys when no order is stored. */
export function tellingOrderKeys(
  scenes: StoryScene[],
  storedOrder: string[],
): string[] {
  const sceneKeys = [
    ...new Set(
      scenes.map((s) => s.tellingChapter).filter((k): k is string => !!k),
    ),
  ]
  if (storedOrder.length === 0) return sceneKeys.sort()
  const result: string[] = []
  for (const k of storedOrder) if (!result.includes(k)) result.push(k)
  for (const k of sceneKeys) if (!result.includes(k)) result.push(k)
  return result
}

export interface TellingChapter {
  key: string
  letter: string
  scenes: StoryScene[]
}

/** Chapters in telling order, each with its derived letter and member scenes
 *  (empty chapters — keys with no scenes yet — are kept so they can be filled). */
export function tellingChapters(
  scenes: StoryScene[],
  storedOrder: string[],
): TellingChapter[] {
  return tellingOrderKeys(scenes, storedOrder).map((key, i) => ({
    key,
    letter: chapterLetter(i),
    scenes: scenes.filter((s) => s.tellingChapter === key),
  }))
}

/** Derived display letter for one scene's chapter, or undefined if unassigned. */
export function chapterLetterForScene(
  scene: StoryScene,
  scenes: StoryScene[],
  storedOrder: string[],
): string | undefined {
  if (!scene.tellingChapter) return undefined
  const i = tellingOrderKeys(scenes, storedOrder).indexOf(scene.tellingChapter)
  return i < 0 ? undefined : chapterLetter(i)
}

/** Whether any scene has a telling chapter assigned. */
export function hasTellingOrder(scenes: StoryScene[]): boolean {
  return scenes.some((s) => !!s.tellingChapter)
}
