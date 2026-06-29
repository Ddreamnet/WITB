# Uygulama ikonu / açılış ekranı

Buraya **`icon.png`** dosyanı koy (kare, en az **1024×1024** px).
İstersen ayrıca **`splash.png`** (2732×2732 px) koyabilirsin; koymazsan
ikon kullanılarak basit bir açılış ekranı üretilir.

Sonra proje kökünde şunu çalıştır:

```bash
npm run cap:assets
```

Bu komut `icon.png`'den tüm Android ikon boyutlarını (mipmap'ler, adaptive
icon) ve açılış ekranlarını otomatik üretip `android/` içine yerleştirir.

> Not: Dosya adı tam olarak `icon.png` olmalı.
