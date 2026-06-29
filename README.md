# Kutuda Ne Var? 📦

Taşınma kolileri, buzdolabı, seyahat çantası, baza altı... her türlü "kap"ın
içinde ne olduğunu hızlıca **kaydet** ve sonradan **ara**. Tamamen offline çalışır,
veri telefonun içinde (IndexedDB) durur. Capacitor ile Android'e paketlenir.

## Özellikler (Phase 1 — tamamlandı)

- **Kutu/alan oluşturma** ve içine girme (sınırsız iç içe — kutu içinde kutu).
- **Tek tuşla hızlı ekleme**: yaz → ＋ (veya Enter), odak kalır, arka arkaya ekle.
- **Adet**: ＋ ile artır, − ile azalt (− yalnız adet > 1 iken görünür).
- **Silme onayı**: "X'i Y'den çıkar?" + "bu kutu için bir daha sorma".
- **İç içe geçme**: bir item'in altına ekleyince o item kaba dönüşür; **taşı /
  dışarı çıkar** ile kutular arası taşıma.
- **Fotoğraf**: item ve kutulara foto çek/seç (otomatik küçültülür); kartta küçük
  görsel, dokununca büyür. Kart boyutu sabit.
- **Anlık arama**: her şeyde isimle ara, sonucun **hangi kutuda** olduğunu gösterir
  (Türkçe, aksan duyarsız: "sargi" → "Sargı bezi").

## Akıllı öneriler (Phase 2 — tamamlandı)

- **Hazır kap tipleri**: yeni kutu oluştururken 25+ şablon (buzdolabı, ilk yardım
  çantası, alet çantası, valiz, kiler, makyaj, kamp...) — dokun, ismi dolsun.
- **Hızlı ekleme çipleri**: kabın altında o tipe ait tipik öğeler. Dokun → eklenir;
  çip **kaybolmaz**, ✓ ile "eklendi" olur; tekrar dokununca **adet** rozeti artar.
- **Bulanık isim eşleştirme**: "buzdolabım", "ecza dolabı" gibi isimler doğru
  şablona bağlanır ve önerileri gelir.
- **Kategori çıkarımı**: kap ismi şablona uymasa bile, içine eklediğin bir öğe bir
  kategoriye aitse o kategorinin diğer öğeleri önerilir. Örn. "YÇ" kutusuna *sargı
  bezi* eklersin → ilk yardım çantası öğeleri önerilir.

Öneri verisi `src/data/templates.ts` içinde — kendi sık kullandıklarını ekleyebilirsin.

Sonraki aşama (Phase 3): key ile ortak kullanım (senkron), notepad, yedekleme/export.

## Geliştirme (tarayıcıda)

```bash
npm install      # ilk kez
npm run dev      # http://localhost:5173
```

Tarayıcıda kamera, dosya seçiciye düşer (gerçek kamera testi cihazda yapılır).

```bash
npm run test     # birim testler (veri katmanı + arama)
npm run build    # tip kontrolü + üretim derlemesi (dist/)
```

## Android APK (kendi telefonun)

> Bu projede web tarafı hazır; Android platformu da eklendi (`android/`).
> Derleme için **Windows tarafında Android Studio** kullan.

1. **İkonu ekle**: `assets/icon.png` (1024×1024) koy, sonra:
   ```bash
   npm run cap:assets
   ```
2. **Web'i derle + native'e kopyala**:
   ```bash
   npm run cap:sync          # = npm run build && npx cap sync android
   ```
3. **Android Studio'da aç** (Windows):
   `C:\Users\Fatih\Desktop\Work\What's in the box\android` klasörünü aç.
   (WSL'den `npx cap open android` çalışmayabilir; klasörü doğrudan Android
   Studio'da açman en kolayı.)
4. Telefonu USB ile bağla (USB hata ayıklama açık) → **Run ▶**. Veya
   `Build > Build APK(s)` ile APK üretip telefona at.

Web tarafında bir değişiklik yaptıktan sonra her seferinde `npm run cap:sync`
çalıştırıp Android Studio'da tekrar Run yeterli.

## ⚠️ Önemli: klasör yolu uyarısı

Bu projenin yolunda **boşluk ve kesme işareti** var:
`...\What's in the box\`. Android'in Gradle aracı bu tür yollarda bazen hata
verir. Eğer Android Studio'da derleme `'` veya boşluk yüzünden hata verirse,
projeyi **özel karakter içermeyen** bir yola taşı, örn:

```
C:\dev\whats-in-the-box
```

(Web geliştirmesi bu yoldan etkilenmez; sorun yalnızca Android derlemesinde
çıkabilir.)

## ⚠️ npm'i tek ortamda çalıştır (WSL vs Windows)

`npm install` / `npm run ...` komutlarını **hep aynı ortamda** çalıştır. Bu proje
`node_modules`'ı paylaştığı için, hem WSL (Linux) hem de Windows'tan `npm install`
yaparsan platforma özel ikililer (rollup/esbuild) çakışır ve şu hatayı alırsın:

```
Cannot find module @rollup/rollup-linux-x64-gnu (npm optional deps bug)
```

Geliştirme WSL'de yapıldığı için **npm komutlarını WSL terminalinde** çalıştır.
Bozulursa düzeltme: `rm -rf node_modules package-lock.json && npm install` (WSL'de).
Android derlemesi için web tarafını WSL'de `npm run cap:sync` ile hazırla, sonra
Android Studio'yu (Windows) sadece native derleme için aç — Android Studio
`node_modules`'a ihtiyaç duymaz.

## Mimari (kısa)

- **Birleşik ağaç**: kutu / alan / item / alt-item hepsi tek tip `Node`
  (`parentId` ile ağaç). Çocuğu olan node otomatik "kap" olur.
- **Depolama**: Dexie (IndexedDB). Fotoğraflar blob olarak `photos` tablosunda.
- **State**: Zustand — tüm node'lar bellekte → arama/render anlık; yazmalar
  iyimser (önce UI, arka planda DB).
- **Liste**: `@tanstack/react-virtual` ile sanal liste (binlerce öğede akıcı).

Kaynak haritası: `src/db` (veri), `src/store` (state), `src/lib` (yardımcılar:
arama, görsel, kamera), `src/components`, `src/screens`.
