import '@testing-library/jest-dom/vitest'

// --- Globals required by @xyflow/react under jsdom ---
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

if (typeof globalThis.DOMMatrixReadOnly === 'undefined') {
  // Minimal stub — React Flow only reads m22 (scale) in jsdom paths.
  class DOMMatrixReadOnlyStub {
    m22 = 1
    constructor(_t?: string) {}
  }
  ;(globalThis as unknown as Record<string, unknown>).DOMMatrixReadOnly =
    DOMMatrixReadOnlyStub
}

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false
      },
    }) as unknown as MediaQueryList
}


// jsdom in this toolchain does not ship a Storage implementation, so provide a
// minimal in-memory localStorage for persistence tests.
if (typeof globalThis.localStorage === 'undefined') {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>()
    get length() {
      return this.store.size
    }
    clear() {
      this.store.clear()
    }
    getItem(key: string) {
      return this.store.has(key) ? this.store.get(key)! : null
    }
    key(index: number) {
      return Array.from(this.store.keys())[index] ?? null
    }
    removeItem(key: string) {
      this.store.delete(key)
    }
    setItem(key: string, value: string) {
      this.store.set(key, String(value))
    }
  }
  const storage = new MemoryStorage()
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
  })
}
