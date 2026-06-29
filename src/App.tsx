import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { useNodesStore } from './store/useNodes'
import { useSpaceStore } from './store/useSpace'
import { Home } from './screens/Home'
import { BoxView } from './screens/BoxView'
import { Icon } from './components/Icon'

export function App() {
  const loaded = useNodesStore((s) => s.loaded)
  const init = useNodesStore((s) => s.init)
  const spaceInit = useSpaceStore((s) => s.init)

  useEffect(() => {
    // Önce yerel veriyi yükle, sonra (varsa) aktif space'i bağlayıp senkronu başlat.
    void (async () => {
      await init()
      await spaceInit()
    })()
  }, [init, spaceInit])

  // Android donanım geri tuşu: geçmiş varsa geri git, yoksa uygulamadan çık.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    let remove: (() => void) | undefined
    import('@capacitor/app').then(({ App: CapApp }) => {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack || window.location.hash.replace(/^#/, '') !== '/') {
          window.history.back()
        } else {
          CapApp.exitApp()
        }
      }).then((handle) => {
        remove = () => void handle.remove()
      })
    })
    return () => remove?.()
  }, [])

  if (!loaded) {
    return (
      <div className="brand-splash">
        <div className="brand-splash__logo">
          <Icon name="package" size={34} />
        </div>
        <div>Yükleniyor…</div>
      </div>
    )
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/box/:id" element={<BoxView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
