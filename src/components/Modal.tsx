import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function Modal({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  // body'ye portal: kart sanal-liste satırının transform'u, position:fixed'i
  // o satıra hapsedip modal'ı ekran dışına taşıyordu. Portal viewport'a sabitler.
  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  )
}
