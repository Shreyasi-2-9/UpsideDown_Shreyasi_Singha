const PREFIX = "hc360_"
const STORAGE_VERSION = "v2_20261025"
const VERSION_KEY = PREFIX + "storage_version"

// Ensure storage version is up to date; reset gracefully if obsolete or corrupted
function initStorageVersion() {
  if (typeof window === "undefined" || !window.localStorage) return
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY)
    if (!storedVersion) {
      // First-time user or clean storage
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION)
    } else if (storedVersion !== STORAGE_VERSION) {
      // Outdated schema: gracefully clear outdated keys and set new version
      console.info(
        `[Storage] Migrating localStorage from ${storedVersion} to ${STORAGE_VERSION}`,
      )
      storage.clearAll()
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION)
    }
  } catch (err) {
    console.warn("[Storage] Failed to verify storage version:", err)
  }
}

initStorageVersion()

export const storage = {
  get<T,>(key: string, defaultValue: T): T {
    if (typeof window === "undefined" || !window.localStorage)
      return defaultValue
    try {
      const item = localStorage.getItem(PREFIX + key)
      if (item === null || item === undefined || item === "")
        return defaultValue
      const parsed = JSON.parse(item)
      return parsed as T
    } catch (e) {
      console.warn(
        `[Storage] Corrupted localStorage key "${key}", resetting to default:`,
        e,
      )
      // Auto-heal by removing the corrupted key
      try {
        localStorage.removeItem(PREFIX + key)
      } catch {
        // ignore
      }
      return defaultValue
    }
  },

  set<T,>(key: string, value: T): void {
    if (typeof window === "undefined" || !window.localStorage) return
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.warn(`[Storage] Error saving to localStorage key "${key}":`, e)
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined" || !window.localStorage) return
    try {
      localStorage.removeItem(PREFIX + key)
    } catch (e) {
      console.warn(`[Storage] Error removing localStorage key "${key}":`, e)
    }
  },

  clearAll(): void {
    if (typeof window === "undefined" || !window.localStorage) return
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(PREFIX)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
    } catch (e) {
      console.warn("[Storage] Error clearing localStorage:", e)
    }
  },
}
