import { useState } from 'react'
import { Modal } from './Modal'

interface Props {
  itemName: string
  boxName: string
  /** Üst seviye kutularda parent kap olmadığı için "bir daha sorma" gizlenir. */
  allowDontAsk?: boolean
  onCancel: () => void
  /** dontAskAgain: bu kutu için bir daha sorma seçildi mi. */
  onConfirm: (dontAskAgain: boolean) => void
}

export function DeleteDialog({
  itemName,
  boxName,
  allowDontAsk = true,
  onCancel,
  onConfirm,
}: Props) {
  const [dontAsk, setDontAsk] = useState(false)
  return (
    <Modal onClose={onCancel}>
      <h3>Silinsin mi?</h3>
      <p>
        <b>{itemName}</b> ögesini <b>{boxName}</b> içinden çıkarmak istediğinize emin misiniz?
        {' '}İçindeki her şey de silinir.
      </p>
      {allowDontAsk && (
        <label className="modal__check">
          <input type="checkbox" checked={dontAsk} onChange={(e) => setDontAsk(e.target.checked)} />
          Bu kutu için bir daha sorma
        </label>
      )}
      <div className="modal__row">
        <button className="btn" onClick={onCancel}>
          Vazgeç
        </button>
        <button className="btn btn--danger" onClick={() => onConfirm(dontAsk)}>
          Sil
        </button>
      </div>
    </Modal>
  )
}
