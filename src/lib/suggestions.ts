import { TEMPLATES, type Template } from '../data/templates'
import { normalizeText } from './text'

// Şablonların normalize edilmiş hâlini bir kez hesapla (performans).
interface IndexedTemplate {
  template: Template
  nameLower: string
  candidates: string[] // name + aliases (normalize)
  itemsLower: string[]
}

const INDEX: IndexedTemplate[] = TEMPLATES.map((t) => ({
  template: t,
  nameLower: normalizeText(t.name),
  candidates: [t.name, ...t.aliases].map(normalizeText),
  itemsLower: t.items.map(normalizeText),
}))

/**
 * Bir kap ismini şablonlarla bulanık eşleştirir (örn. "buzdolabım" → Buzdolabı,
 * "ecza dolabı" → İlk Yardım Çantası). Eşleşme yoksa null.
 */
export function findTemplateByName(name: string): Template | null {
  const q = normalizeText(name)
  if (q.length < 2) return null

  let best: Template | null = null
  let bestScore = 0
  const qTokens = new Set(q.split(/\s+/).filter((t) => t.length >= 3))

  for (const it of INDEX) {
    for (const c of it.candidates) {
      let score = 0
      if (q === c) score = 100 + c.length
      else if (c.length >= 3 && q.includes(c)) score = 60 + c.length
      else if (q.length >= 3 && c.includes(q)) score = 45 + q.length
      else {
        // Kelime örtüşmesi (örn. "ilk yardım kutusu" → "ilk yardım çantası")
        const cTokens = c.split(/\s+/)
        const overlap = cTokens.filter((x) => x.length >= 3 && qTokens.has(x)).length
        if (overlap) score = 20 + overlap * 8
      }
      if (score > bestScore) {
        bestScore = score
        best = it.template
      }
    }
  }
  return bestScore >= 20 ? best : null
}

/**
 * Bir item'in hangi şablon(lar)a (kategorilere) ait olduğunu bulur.
 * Örn. "sargı bezi" → [İlk Yardım Çantası].
 */
export function templatesForItem(itemName: string): Template[] {
  const q = normalizeText(itemName)
  if (q.length < 2) return []
  const result: Template[] = []
  for (const it of INDEX) {
    const hit = it.itemsLower.some(
      (i) => i === q || (q.length >= 3 && i.includes(q)) || (i.length >= 4 && q.includes(i)),
    )
    if (hit) result.push(it.template)
  }
  return result
}

export interface SuggestionSource {
  /** Önerilerin geldiği şablon (varsa) — başlıkta gösterilebilir. */
  template: Template | null
  /** Önerilen item isimleri (zaten eklenmiş olanlar dahil — UI'da adet gösterilir). */
  items: string[]
}

/**
 * Bir kap için öneri item listesini üretir:
 *  1) Kap ismi bir şablona benziyorsa → o şablonun item'leri.
 *  2) Değilse → içindeki mevcut item'lerden kategori çıkarımı yapıp
 *     en çok eşleşen şablon(lar)ın diğer item'lerini önerir.
 */
export function suggestItemsForContainer(
  containerName: string,
  childNames: string[],
  limit = 30,
): SuggestionSource {
  const byName = findTemplateByName(containerName)
  if (byName) {
    return { template: byName, items: byName.items.slice(0, limit) }
  }

  // Kategori çıkarımı: mevcut item'lerden şablon oyla.
  const votes = new Map<string, number>()
  const tplById = new Map<string, Template>()
  for (const child of childNames) {
    for (const t of templatesForItem(child)) {
      votes.set(t.id, (votes.get(t.id) ?? 0) + 1)
      tplById.set(t.id, t)
    }
  }
  if (votes.size === 0) return { template: null, items: [] }

  const ranked = [...votes.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => tplById.get(id)!)

  const seen = new Set<string>()
  const items: string[] = []
  for (const t of ranked) {
    for (const item of t.items) {
      const key = normalizeText(item)
      if (!seen.has(key)) {
        seen.add(key)
        items.push(item)
      }
      if (items.length >= limit) break
    }
    if (items.length >= limit) break
  }
  // En çok oy alan şablonu kaynak olarak göster.
  return { template: ranked[0] ?? null, items }
}

/** Kutu oluştururken gösterilecek kap tipi önerileri (tüm şablonlar). */
export function containerTypeSuggestions(): Template[] {
  return TEMPLATES
}

/** İsmi bir şablona uyan kabın kategori emojisi (yoksa null) — placeholder ikon için. */
export function categoryIconForName(name: string): string | null {
  return findTemplateByName(name)?.icon ?? null
}
