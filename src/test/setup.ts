// Dexie'nin testlerde çalışması için bellek-içi IndexedDB.
import 'fake-indexeddb/auto'

// React act(...) ortam bayrağı (render testleri için).
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true
