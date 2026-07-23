import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

export function Modal({ title, onClose, children, wide }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,22,25,0.45)' }}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={[
          'flex max-h-[85vh] w-full flex-col overflow-hidden rounded-lg bg-cream shadow-2xl',
          wide ? 'max-w-3xl' : 'max-w-md',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid rgba(20,22,25,0.15)' }}
        >
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          <button
            type="button"
            className="rounded p-1 text-ink/40 hover:bg-sand/30 hover:text-ink"
            aria-label="ปิด"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  )
}
