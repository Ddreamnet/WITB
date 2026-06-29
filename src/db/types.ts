// Birleşik ağaç modeli: kutu / alan / item / alt-item hepsi aynı tip.
// Çocuğu olan herhangi bir node otomatik olarak "kap" rolüne sahiptir.

export interface NodeRow {
  id: string
  name: string
  /** Arama için küçük harfe çevrilmiş ve normalize edilmiş isim (indeksli). */
  nameLower: string
  /** null => en üst seviye (ana ekrandaki kutu/alan). */
  parentId: string | null
  /** Adet (varsayılan 1). */
  quantity: number
  /** photos tablosundaki fotoğraf id'leri; kapak = ilk eleman. */
  photoIds?: string[]
  /** Aynı kap içindeki sıralama; küçük olan üstte. */
  order: number
  /** "Bu kutu için bir daha sorma" işaretlenince true olur (kap node'unda). */
  skipDeleteConfirm?: boolean
  createdAt: number
  updatedAt: number
}

export interface PhotoRow {
  id: string
  /** Görüntüleme için tam (küçültülmüş) görsel. */
  blob: Blob
  /** Listede hızlı gösterim için küçük thumbnail. */
  thumbBlob: Blob
}
