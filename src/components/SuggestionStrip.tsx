import { useMemo } from 'react'
import { useChildren, useNode, useNodesStore } from '../store/useNodes'
import { suggestItemsForContainer } from '../lib/suggestions'
import { normalizeText } from '../lib/text'
import { Icon } from './Icon'

/**
 * Kabın altında yatay öneri çipleri. Spec:
 * - Eklenen item çipten KAYBOLMAZ, "eklendi" (✓) olarak işaretlenir.
 * - Tekrar dokununca adet artar ve çipte rozet olarak görünür.
 * Öneriler kap ismine (şablon) veya içindeki item'lere (kategori çıkarımı) göre gelir.
 */
export function SuggestionStrip({ containerId }: { containerId: string }) {
  const node = useNode(containerId)
  const children = useChildren(containerId)
  const addOrIncrement = useNodesStore((s) => s.addOrIncrement)

  const childNames = useMemo(() => children.map((c) => c.name), [children])
  const qtyByName = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of children) m.set(c.nameLower, c.quantity)
    return m
  }, [children])

  const suggestion = useMemo(
    () =>
      node ? suggestItemsForContainer(node.name, childNames) : { template: null, items: [] },
    [node, childNames],
  )

  if (!node || suggestion.items.length === 0) return null

  return (
    <div className="suggest">
      <div className="suggest__head">
        {suggestion.template ? (
          <>
            <span style={{ fontSize: 14 }}>{suggestion.template.icon}</span>
            {suggestion.template.name} önerileri
          </>
        ) : (
          <>
            <Icon name="layers" size={13} />
            Öneriler
          </>
        )}
      </div>
      <div className="suggest__chips">
        {suggestion.items.map((name) => {
          const qty = qtyByName.get(normalizeText(name)) ?? 0
          return (
            <button
              key={name}
              className={'chip' + (qty > 0 ? ' chip--added' : '')}
              onClick={() => void addOrIncrement(containerId, name)}
            >
              {qty > 0 && (
                <span className="chip__check">
                  <Icon name="check" size={14} strokeWidth={2.4} />
                </span>
              )}
              {name}
              {qty > 1 && <span className="chip__qty">{qty}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
