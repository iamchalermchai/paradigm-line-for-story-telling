import { useSearchParam } from './useSearchParam'

/** PROTOTYPE — shareable ?variant= for board chrome studies. */
export function usePrototypeVariant() {
  return useSearchParam('variant', 'A')
}
