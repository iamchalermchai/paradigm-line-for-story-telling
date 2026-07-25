import { useCallback, useSyncExternalStore } from 'react'

function read(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  return new URLSearchParams(window.location.search).get(key) ?? fallback
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener('popstate', onStoreChange)
  return () => window.removeEventListener('popstate', onStoreChange)
}

/** PROTOTYPE — shareable URL search param (e.g. ?variant=A / ?panel=B). */
export function useSearchParam(key: string, fallback: string) {
  const current = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  )

  const setValue = useCallback(
    (next: string) => {
      const url = new URL(window.location.href)
      url.searchParams.set(key, next)
      window.history.replaceState(null, '', url)
      window.dispatchEvent(new PopStateEvent('popstate'))
    },
    [key],
  )

  return [current, setValue] as const
}
