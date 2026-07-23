import { parseProject } from '../domain/schemas'
import type { Project } from '../domain/types'

const STORAGE_KEY = 'plotline-board:project'

function getStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

/** Persist a project to localStorage. Returns false if storage is unavailable. */
export function saveProject(project: Project): boolean {
  const storage = getStorage()
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(project))
    return true
  } catch {
    return false
  }
}

/** Load + validate the persisted project, or null if none / invalid. */
export function loadProject(): Project | null {
  const storage = getStorage()
  if (!storage) return null
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const result = parseProject(JSON.parse(raw))
    return result.ok ? result.project! : null
  } catch {
    return null
  }
}

export function clearProject(): void {
  getStorage()?.removeItem(STORAGE_KEY)
}
