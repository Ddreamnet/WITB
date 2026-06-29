import { describe, expect, it } from 'vitest'
import { normalizeText } from './text'

describe('normalizeText', () => {
  it('Türkçe karakterleri ASCII yakınına indirger', () => {
    expect(normalizeText('Sargı Bezi')).toBe('sargi bezi')
    expect(normalizeText('İlk Yardım')).toBe('ilk yardim')
    expect(normalizeText('ÇÖĞÜŞ')).toBe('cogus')
  })

  it('aksan duyarsız arama sağlar', () => {
    // "sargi" yazınca "Sargı" eşleşmeli
    expect(normalizeText('sargi')).toBe(normalizeText('Sargı'))
  })
})
