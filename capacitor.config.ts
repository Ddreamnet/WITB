import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.whatsinthebox.app',
  appName: 'WITB',
  webDir: 'dist',
  android: {
    // Geri tuşu yönetimini biz yapıyoruz (App.tsx).
    allowMixedContent: false,
  },
}

export default config
