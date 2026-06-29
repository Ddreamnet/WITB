import { describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '../App'

// Tüm uygulamayı (router + store init + ana ekran) gerçekten render edip
// çalışma zamanı hatası olmadığını doğrular.
describe('App render', () => {
  it('çökmeden render olur ve ana ekranı gösterir', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<App />)
    })
    // init() asenkron; veriyi yüklemesi için kısa bekle.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 80))
    })

    expect(container.textContent).toContain('WITB')

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })
})
