const STORAGE_KEY_V2 = 'ddia_progress_v2'
const STORAGE_KEY_V1 = 'ddia_progress_v1'

export const defaultProgress = () => ({
  completedDays: [],
  labItems: {},
  quizAnswers: {},
  currentView: 'day-1',
  notes: {},
  questionNotes: {},
})

function migrateFromV1() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const merged = { ...defaultProgress(), ...parsed }
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(merged))
    return merged
  } catch {
    return null
  }
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2)
    if (raw) return { ...defaultProgress(), ...JSON.parse(raw) }
    const migrated = migrateFromV1()
    if (migrated) return migrated
    return defaultProgress()
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(p) {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(p))
  } catch {
    // localStorage full or disabled — fail silently, this is a personal tool
  }
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY_V2)
}
