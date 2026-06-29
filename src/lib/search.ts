import type { NodeRow } from '../db/types'
import { normalizeText } from './text'

export interface SearchHit {
  node: NodeRow
  /** Atalar zinciri, örn. "Ev › 13. Koli" (node'un kendisi hariç). Boşsa en üst seviye. */
  locationPath: string
}

/**
 * Bellekteki tüm node'larda isimle arama. Tüm sorgu kelimeleri (token) isimde
 * geçmeli. Sıralama: tam ön-ek eşleşmeleri önce, sonra kısa isimler.
 */
export function searchNodes(nodes: NodeRow[], query: string, limit = 50): SearchHit[] {
  const q = normalizeText(query)
  if (!q) return []
  const tokens = q.split(/\s+/).filter(Boolean)
  const byId = new Map(nodes.map((n) => [n.id, n]))

  const scored: { node: NodeRow; score: number }[] = []
  for (const node of nodes) {
    const name = node.nameLower
    if (!tokens.every((t) => name.includes(t))) continue
    let score = 0
    if (name.startsWith(q)) score += 100
    if (name === q) score += 50
    score -= name.length * 0.1 // kısa isimler biraz önde
    scored.push({ node, score })
  }

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(({ node }) => ({
    node,
    locationPath: ancestorPath(node, byId),
  }))
}

function ancestorPath(node: NodeRow, byId: Map<string, NodeRow>): string {
  const names: string[] = []
  let cur = node.parentId ? byId.get(node.parentId) : undefined
  let guard = 0
  while (cur && guard++ < 1000) {
    names.unshift(cur.name)
    cur = cur.parentId ? byId.get(cur.parentId) : undefined
  }
  return names.join(' › ')
}
