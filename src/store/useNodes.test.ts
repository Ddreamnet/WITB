import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db/db'
import { useNodesStore } from './useNodes'

const store = () => useNodesStore.getState()

beforeEach(async () => {
  await db.nodes.clear()
  await db.photos.clear()
  useNodesStore.setState({ nodes: [], loaded: false })
})

describe('node store', () => {
  it('kutu ve item oluşturur, bellekte tutar', async () => {
    const box = await store().createBox('13. Koli')
    await store().addItem(box.id, 'Sargı bezi')
    expect(store().nodes).toHaveLength(2)
    // Kalıcı: yeniden yükleyince de var
    useNodesStore.setState({ nodes: [] })
    await store().init()
    expect(store().nodes).toHaveLength(2)
  })

  it('adet 1’in altına inmez; artırınca azalt aktifleşir', async () => {
    const box = await store().createBox('X')
    const item = await store().addItem(box.id, 'A')
    const q = () => store().nodes.find((n) => n.id === item.id)!.quantity

    await store().decrement(item.id)
    expect(q()).toBe(1) // 1'in altına inmez
    await store().increment(item.id)
    expect(q()).toBe(2)
    await store().decrement(item.id)
    expect(q()).toBe(1)
  })

  it('item’e alt-liste eklenince kap rolüne geçer', async () => {
    const box = await store().createBox('Kutu')
    const item = await store().addItem(box.id, 'Çanta')
    await store().addItem(item.id, 'Cüzdan')
    const children = store().nodes.filter((n) => n.parentId === item.id)
    expect(children).toHaveLength(1)
  })

  it('silme tüm alt ağacı temizler', async () => {
    const box = await store().createBox('Kutu')
    const item = await store().addItem(box.id, 'Çanta')
    await store().addItem(item.id, 'Cüzdan')
    await store().remove(box.id)
    expect(store().nodes).toHaveLength(0)
    expect(await db.nodes.count()).toBe(0)
  })

  it('addOrIncrement: aynı isim varsa adet artar, yoksa yeni ekler', async () => {
    const box = await store().createBox('Buzdolabı')
    await store().addOrIncrement(box.id, 'Süt') // yeni
    await store().addOrIncrement(box.id, 'süt') // aynı (normalize) → adet 2
    const sut = store().nodes.filter((n) => n.parentId === box.id)
    expect(sut).toHaveLength(1)
    expect(sut[0].quantity).toBe(2)
  })

  it('taşıma parentId’yi değiştirir', async () => {
    const a = await store().createBox('A')
    const b = await store().createBox('B')
    const item = await store().addItem(a.id, 'X')
    await store().moveTo(item.id, b.id)
    expect(store().nodes.find((n) => n.id === item.id)!.parentId).toBe(b.id)
  })
})
