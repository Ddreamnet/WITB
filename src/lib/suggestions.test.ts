import { describe, expect, it } from 'vitest'
import {
  findTemplateByName,
  templatesForItem,
  suggestItemsForContainer,
} from './suggestions'

describe('findTemplateByName (bulanık isim eşleştirme)', () => {
  it('tam ve ekli isimleri eşler', () => {
    expect(findTemplateByName('Buzdolabı')?.id).toBe('buzdolabi')
    expect(findTemplateByName('buzdolabım')?.id).toBe('buzdolabi')
    expect(findTemplateByName('Alet Çantası')?.id).toBe('alet-cantasi')
  })

  it('alias üzerinden eşler', () => {
    expect(findTemplateByName('ecza dolabı')?.id).toBe('ilk-yardim')
    expect(findTemplateByName('takım çantası')?.id).toBe('alet-cantasi')
  })

  it('alakasız isimde null döner', () => {
    expect(findTemplateByName('13. Koli')).toBeNull()
    expect(findTemplateByName('YÇ')).toBeNull()
  })
})

describe('templatesForItem (kategori çıkarımı)', () => {
  it('item’i doğru kategoriye bağlar', () => {
    const ids = templatesForItem('Sargı bezi').map((t) => t.id)
    expect(ids).toContain('ilk-yardim')
    expect(templatesForItem('Çekiç').map((t) => t.id)).toContain('alet-cantasi')
  })
})

describe('suggestItemsForContainer', () => {
  it('isim eşleşince o şablonun item’lerini önerir', () => {
    const s = suggestItemsForContainer('Buzdolabı', [])
    expect(s.template?.id).toBe('buzdolabi')
    expect(s.items).toContain('Süt')
  })

  it('SPEC örneği: "YÇ" kutusuna sargı bezi eklenince ilk yardım önerileri gelir', () => {
    const s = suggestItemsForContainer('YÇ', ['Sargı bezi'])
    expect(s.template?.id).toBe('ilk-yardim')
    expect(s.items).toContain('Yara bandı')
    expect(s.items).toContain('Makas')
  })

  it('isim de item de eşleşmezse boş döner', () => {
    expect(suggestItemsForContainer('13. Koli', []).items).toHaveLength(0)
  })
})
