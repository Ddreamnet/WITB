import { useMemo } from 'react'
import { Modal } from './Modal'
import { Icon } from './Icon'
import { useNodesStore } from '../store/useNodes'
import { categoryIconForName } from '../lib/suggestions'
import type { NodeRow } from '../db/types'

/**
 * Bir node'u başka bir kabın içine ya da en üst seviyeye taşır.
 * Kendisi ve tüm alt ağacı hedef olamaz (döngü engeli).
 */
export function MoveDialog({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const nodes = useNodesStore((s) => s.nodes)
  const moveTo = useNodesStore((s) => s.moveTo)
  const node = nodes.find((n) => n.id === nodeId)

  const { destinations, byId } = useMemo(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]))
    // Yasak hedefler: kendisi + tüm torunları
    const blocked = new Set<string>([nodeId])
    const childrenByParent = new Map<string | null, NodeRow[]>()
    for (const n of nodes) {
      const arr = childrenByParent.get(n.parentId) ?? []
      arr.push(n)
      childrenByParent.set(n.parentId, arr)
    }
    const stack = [nodeId]
    while (stack.length) {
      const cur = stack.pop()!
      for (const c of childrenByParent.get(cur) ?? []) {
        blocked.add(c.id)
        stack.push(c.id)
      }
    }
    const destinations = nodes
      .filter((n) => !blocked.has(n.id) && n.id !== node?.parentId)
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    return { destinations, byId }
  }, [nodes, nodeId, node?.parentId])

  function pathOf(n: NodeRow): string {
    const names: string[] = []
    let cur: NodeRow | undefined = n.parentId ? byId.get(n.parentId) : undefined
    let guard = 0
    while (cur && guard++ < 1000) {
      names.unshift(cur.name)
      cur = cur.parentId ? byId.get(cur.parentId) : undefined
    }
    return names.join(' › ')
  }

  async function move(destId: string | null) {
    await moveTo(nodeId, destId)
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <h3>Nereye taşınsın?</h3>
      <div className="optlist">
        {node?.parentId !== null && (
          <button className="opt" onClick={() => move(null)}>
            <span className="opt__ic">
              <Icon name="move" size={18} />
            </span>
            <span>En üst seviye (ana ekran)</span>
          </button>
        )}
        {destinations.map((d) => {
          const cat = categoryIconForName(d.name)
          return (
            <button className="opt" key={d.id} onClick={() => move(d.id)}>
              <span className="opt__ic">
                {cat ? <span style={{ fontSize: 18 }}>{cat}</span> : <Icon name="package" size={18} />}
              </span>
              <span>
                {d.name}
                {pathOf(d) && <span className="opt__path"> · {pathOf(d)}</span>}
              </span>
            </button>
          )
        })}
        {destinations.length === 0 && node?.parentId === null && (
          <div className="searchhint">Taşınacak başka kap yok.</div>
        )}
      </div>
      <div className="modal__row">
        <button className="btn" onClick={onClose}>
          Vazgeç
        </button>
      </div>
    </Modal>
  )
}
