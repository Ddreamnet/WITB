import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChildren, useNodesStore } from '../store/useNodes'
import { NodeCard } from '../components/NodeCard'
import { SearchBar } from '../components/SearchBar'
import { NewBoxDialog } from '../components/NewBoxDialog'
import { Icon } from '../components/Icon'
import { searchNodes } from '../lib/search'
import { categoryIconForName } from '../lib/suggestions'

export function Home() {
  const navigate = useNavigate()
  const boxes = useChildren(null)
  const allNodes = useNodesStore((s) => s.nodes)
  const createBox = useNodesStore((s) => s.createBox)

  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const hits = useMemo(
    () => (query.trim() ? searchNodes(allNodes, query) : []),
    [allNodes, query],
  )

  function openHit(nodeId: string, hasChildren: boolean, parentId: string | null) {
    // Kap ise içine gir; yaprak ise içinde bulunduğu kutuyu aç.
    const target = hasChildren ? nodeId : parentId ?? nodeId
    navigate(`/box/${target}`)
  }

  const childCountOf = (id: string) => allNodes.filter((n) => n.parentId === id).length

  return (
    <div className="app">
      <header className="masthead">
        <h1 className="wordmark">WITB?</h1>
      </header>

      <SearchBar value={query} onChange={setQuery} placeholder="Her şeyde ara…" />

      <div className="scroll">
        {query.trim() ? (
          <div className="list">
            <div className="searchhint">
              {hits.length} sonuç{hits.length === 0 ? ' — bulunamadı' : ''}
            </div>
            {hits.map(({ node, locationPath }) => {
              const isContainer = childCountOf(node.id) > 0
              const cat = categoryIconForName(node.name)
              return (
                <button
                  key={node.id}
                  className="card"
                  onClick={() => openHit(node.id, isContainer, node.parentId)}
                >
                  <span className="card__thumb">
                    {cat ? (
                      <span style={{ fontSize: 24 }}>{cat}</span>
                    ) : (
                      <Icon name={isContainer ? 'package' : 'image'} size={isContainer ? 22 : 20} />
                    )}
                  </span>
                  <span className="card__body" style={{ pointerEvents: 'none' }}>
                    <span className="card__name">{node.name}</span>
                    <span className="card__meta">
                      <Icon name="search" size={13} />
                      {locationPath || 'En üst seviye'}
                      {node.quantity > 1 ? ` · ${node.quantity} adet` : ''}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        ) : boxes.length === 0 ? (
          <div className="empty">
            <span className="empty__icon">
              <Icon name="boxOpen" size={38} />
            </span>
          </div>
        ) : (
          <div className="list">
            {boxes.map((node) => (
              <NodeCard key={node.id} node={node} parent={null} />
            ))}
          </div>
        )}
      </div>

      {!query.trim() && (
        <button className="fab" onClick={() => setCreating(true)} aria-label="Yeni kutu">
          <span className="fab__core">
            <Icon name="plus" size={28} strokeWidth={2.2} />
          </span>
        </button>
      )}

      {creating && (
        <NewBoxDialog
          onCancel={() => setCreating(false)}
          onCreate={async (name) => {
            // Oluşturup ana ekranda kal; kullanıcı listeden istediği kutuya girsin.
            await createBox(name)
            setCreating(false)
          }}
        />
      )}
    </div>
  )
}
