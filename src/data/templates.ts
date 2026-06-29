// Geniş öneri bilgi tabanı.
// Her şablon hem "kap tipi önerisi" (kutu oluştururken) hem de "kategori"dir
// (içine eklenen item bir şablonun listesindeyse o şablonun diğerleri önerilir).
//
// aliases: bulanık isim eşleştirme için (örn. "buzdolabım" → buzdolabı).
// items: o kap için tipik öğeler (öneri çipleri).

export interface Template {
  id: string
  name: string
  icon: string
  aliases: string[]
  items: string[]
}

export const TEMPLATES: Template[] = [
  {
    id: 'buzdolabi',
    name: 'Buzdolabı',
    icon: '🧊',
    aliases: ['dolap', 'fridge', 'frigo', 'soğutucu', 'buz dolabı', 'buzdolabım'],
    items: [
      'Süt', 'Yumurta', 'Tereyağı', 'Beyaz peynir', 'Kaşar peyniri', 'Yoğurt',
      'Ayran', 'Zeytin', 'Reçel', 'Bal', 'Ketçap', 'Mayonez', 'Hardal', 'Salça',
      'Turşu', 'Domates', 'Salatalık', 'Biber', 'Patlıcan', 'Marul', 'Maydanoz',
      'Soğan', 'Limon', 'Elma', 'Portakal', 'Üzüm', 'Çilek', 'Karpuz',
      'Su', 'Meyve suyu', 'Kola', 'Soda', 'Et', 'Kıyma', 'Tavuk', 'Balık',
      'Sucuk', 'Salam', 'Sosis', 'Krema', 'Çikolata', 'Yeşil soğan', 'Havuç',
    ],
  },
  {
    id: 'dondurucu',
    name: 'Dondurucu / Buzluk',
    icon: '❄️',
    aliases: ['buzluk', 'derin dondurucu', 'deep freeze', 'dondurucu'],
    items: [
      'Dondurulmuş bezelye', 'Dondurulmuş mısır', 'Dondurulmuş sebze',
      'Dondurulmuş et', 'Dondurulmuş tavuk', 'Dondurulmuş balık', 'Dondurma',
      'Mantı', 'Börek', 'Yufka', 'Pizza', 'Patates kızartması', 'Buz', 'Buz kalıbı',
      'Dondurulmuş meyve', 'Köfte', 'Ekmek', 'Bamya', 'Ispanak', 'Karışık sebze',
    ],
  },
  {
    id: 'ilk-yardim',
    name: 'İlk Yardım Çantası',
    icon: '🩹',
    aliases: ['ecza', 'eczane', 'ecza dolabı', 'ilkyardım', 'first aid', 'medikal', 'sağlık', 'ilaç'],
    items: [
      'Sargı bezi', 'Yara bandı', 'Steril gazlı bez', 'Pamuk', 'Flaster',
      'Antiseptik', 'Betadin', 'Oksijenli su', 'Alkol', 'Kolonya', 'Makas',
      'Cımbız', 'Termometre', 'Tansiyon aleti', 'Ağrı kesici', 'Parol', 'Aspirin',
      'Mide ilacı', 'Antibiyotik krem', 'Yara kremi', 'Yanık kremi', 'Eldiven',
      'Maske', 'Turnike', 'Soğuk kompres', 'Elastik bandaj', 'Şeker', 'El dezenfektanı',
      'Burun spreyi', 'Öksürük şurubu', 'C vitamini', 'Ateş düşürücü',
    ],
  },
  {
    id: 'alet-cantasi',
    name: 'Alet Çantası',
    icon: '🧰',
    aliases: ['takım çantası', 'tamir', 'alet', 'toolbox', 'avadanlık', 'alet edevat'],
    items: [
      'Çekiç', 'Düz tornavida', 'Yıldız tornavida', 'Pense', 'Kargaburun',
      'Yan keski', 'İngiliz anahtarı', 'Somun anahtarı', 'Alyan takımı',
      'Şerit metre', 'Su terazisi', 'Testere', 'El testeresi', 'Maket bıçağı',
      'Matkap', 'Matkap ucu', 'Tornavida ucu', 'Vida', 'Çivi', 'Dübel',
      'İzole bant', 'Koli bandı', 'Çift taraflı bant', 'Eldiven', 'Zımpara',
      'Keski', 'Mengene', 'Cırcır', 'Lokma takımı', 'El feneri', 'Pil', 'Tutkal',
    ],
  },
  {
    id: 'mutfak',
    name: 'Mutfak',
    icon: '🍽️',
    aliases: ['mutfak dolabı', 'kitchen', 'mutfak eşyaları'],
    items: [
      'Tencere', 'Tava', 'Düdüklü tencere', 'Tencere kapağı', 'Kepçe', 'Kevgir',
      'Spatula', 'Bıçak', 'Ekmek bıçağı', 'Doğrama tahtası', 'Rende', 'Süzgeç',
      'Ölçü kabı', 'El blenderı', 'Çırpıcı', 'Açacak', 'Konserve açacağı',
      'Tabak', 'Çukur tabak', 'Kase', 'Bardak', 'Su bardağı', 'Çatal', 'Kaşık',
      'Çay kaşığı', 'Fincan', 'Çaydanlık', 'Tencere altlığı', 'Servis tabağı',
      'Streç film', 'Alüminyum folyo', 'Pişirme kağıdı', 'Peçete', 'Kürdan',
      'Saklama kabı', 'Termos', 'Tuzluk', 'Yağlık',
    ],
  },
  {
    id: 'banyo',
    name: 'Banyo',
    icon: '🛁',
    aliases: ['banyo dolabı', 'bathroom', 'lavabo', 'duş'],
    items: [
      'Şampuan', 'Saç kremi', 'Duş jeli', 'Sabun', 'Diş fırçası', 'Diş macunu',
      'Diş ipi', 'Havlu', 'El havlusu', 'Tarak', 'Saç fırçası', 'Jilet',
      'Tıraş köpüğü', 'Tıraş makinesi', 'Kolonya', 'Deodorant', 'Parfüm',
      'Nemlendirici', 'El kremi', 'Vücut losyonu', 'Kulak çubuğu', 'Tırnak makası',
      'Tuvalet kağıdı', 'Islak mendil', 'Banyo lifi', 'Terlik', 'Bornoz',
      'Saç kurutma makinesi', 'Saç bandı', 'Toka',
    ],
  },
  {
    id: 'temizlik',
    name: 'Temizlik Malzemeleri',
    icon: '🧽',
    aliases: ['temizlik', 'temizlik dolabı', 'deterjan', 'temizlik malzemesi'],
    items: [
      'Çamaşır suyu', 'Çamaşır deterjanı', 'Yumuşatıcı', 'Bulaşık deterjanı',
      'Bulaşık makinesi tableti', 'Bulaşık süngeri', 'Cam temizleyici',
      'Yüzey temizleyici', 'Yer temizleyici', 'Banyo temizleyici', 'Kireç sökücü',
      'Ovma tozu', 'Fırça', 'Tuvalet fırçası', 'Paspas', 'Mikrofiber bez',
      'Kova', 'Faraş', 'Süpürge', 'Çöp poşeti', 'Eldiven', 'Oda spreyi',
      'Çamaşır mandalı', 'Leke çıkarıcı', 'Tuz ruhu',
    ],
  },
  {
    id: 'valiz',
    name: 'Valiz / Seyahat',
    icon: '🧳',
    aliases: ['bavul', 'seyahat çantası', 'tatil', 'suitcase', 'valizim', 'seyahat'],
    items: [
      'Pasaport', 'Kimlik', 'Bilet', 'Cüzdan', 'Para', 'Telefon şarjı', 'Powerbank',
      'Kulaklık', 'Tişört', 'Gömlek', 'Pantolon', 'İç çamaşırı', 'Çorap', 'Pijama',
      'Mont', 'Ayakkabı', 'Terlik', 'Diş fırçası', 'Diş macunu', 'Şampuan',
      'Havlu', 'Güneş gözlüğü', 'Güneş kremi', 'Şapka', 'İlaçlar', 'Adaptör',
      'Kitap', 'Şarj kablosu', 'Mayo', 'Makyaj çantası', 'Tarak',
    ],
  },
  {
    id: 'bebek',
    name: 'Bebek Çantası',
    icon: '🍼',
    aliases: ['bebek', 'bebek bakım', 'baby', 'çocuk çantası'],
    items: [
      'Bebek bezi', 'Islak mendil', 'Biberon', 'Mama', 'Emzik', 'Zıbın', 'Body',
      'Battaniye', 'Pişik kremi', 'Yedek kıyafet', 'Oyuncak', 'Mama önlüğü',
      'Termos', 'Bebek şampuanı', 'Bebek pudrası', 'Alt açma örtüsü', 'Çıngırak',
      'Bebek bezi torbası', 'Burun aspiratörü', 'Diş kaşıyıcı',
    ],
  },
  {
    id: 'kirtasiye',
    name: 'Kırtasiye / Ofis',
    icon: '🖊️',
    aliases: ['kalem kutusu', 'ofis', 'masa çekmecesi', 'kırtasiye', 'büro', 'çalışma masası'],
    items: [
      'Tükenmez kalem', 'Kurşun kalem', 'Silgi', 'Kalemtıraş', 'Cetvel', 'Defter',
      'Kağıt', 'Post-it', 'Ataç', 'Zımba', 'Zımba teli', 'Makas', 'Yapıştırıcı',
      'Bant', 'Klasör', 'Dosya', 'Marker', 'Fosforlu kalem', 'Hesap makinesi',
      'Zarf', 'Pul', 'Delgeç', 'Kalem kutusu', 'Lastik', 'Raptiye',
    ],
  },
  {
    id: 'elektronik',
    name: 'Elektronik / Kablolar',
    icon: '🔌',
    aliases: ['kablo', 'elektronik', 'teknoloji', 'şarj', 'kablo kutusu'],
    items: [
      'Şarj kablosu', 'USB kablo', 'Type-C kablo', 'HDMI kablo', 'Adaptör',
      'Powerbank', 'Kulaklık', 'Bluetooth kulaklık', 'Fare', 'Klavye',
      'Flash bellek', 'Harici disk', 'Pil', 'Şarj aleti', 'Uzatma kablosu',
      'Çoklu priz', 'Priz', 'SD kart', 'Kart okuyucu', 'Modem', 'Router',
      'Kumanda', 'Webcam', 'Hoparlör',
    ],
  },
  {
    id: 'gardirop',
    name: 'Gardırop / Giysi',
    icon: '👕',
    aliases: ['gardrop', 'giysi', 'kıyafet', 'elbise dolabı', 'giyim', 'dolabı'],
    items: [
      'Tişört', 'Gömlek', 'Pantolon', 'Kot pantolon', 'Elbise', 'Etek', 'Kazak',
      'Hırka', 'Mont', 'Ceket', 'İç çamaşırı', 'Çorap', 'Atlet', 'Pijama',
      'Eşofman', 'Şort', 'Kemer', 'Şal', 'Atkı', 'Bere', 'Eldiven', 'Sweatshirt',
      'Yelek', 'Tayt', 'Sütyen',
    ],
  },
  {
    id: 'kiler',
    name: 'Baharatlık / Kiler',
    icon: '🧂',
    aliases: ['baharat', 'kiler', 'erzak', 'bakliyat', 'baharatlık', 'kuru gıda'],
    items: [
      'Tuz', 'Karabiber', 'Kırmızı biber', 'Pul biber', 'Kimyon', 'Kekik', 'Nane',
      'Sumak', 'Tarçın', 'Zerdeçal', 'Köri', 'Defne yaprağı', 'Susam', 'Çörek otu',
      'Şeker', 'Un', 'Pirinç', 'Bulgur', 'Mercimek', 'Nohut', 'Kuru fasulye',
      'Makarna', 'Salça', 'Sıvı yağ', 'Zeytinyağı', 'Sirke', 'Bal', 'Çay',
      'Kahve', 'Kakao', 'Nişasta', 'Kabartma tozu', 'Vanilya', 'İrmik',
    ],
  },
  {
    id: 'makyaj',
    name: 'Makyaj Çantası',
    icon: '💄',
    aliases: ['makyaj', 'kozmetik', 'güzellik', 'makeup'],
    items: [
      'Fondöten', 'Kapatıcı', 'Pudra', 'Allık', 'Far', 'Far paleti', 'Eyeliner',
      'Maskara', 'Ruj', 'Dudak kalemi', 'Dudak parlatıcısı', 'Kaş kalemi',
      'Kaş jeli', 'Makyaj fırçası', 'Pudra fırçası', 'Oje', 'Oje çıkarıcı',
      'Makyaj temizleme suyu', 'Makyaj süngeri', 'Aydınlatıcı', 'Bronzer',
      'Cımbız', 'Kirpik kıvırıcı', 'Ayna',
    ],
  },
  {
    id: 'kamp',
    name: 'Kamp Çantası',
    icon: '⛺',
    aliases: ['kamp', 'outdoor', 'doğa', 'çadır', 'kampçı'],
    items: [
      'Çadır', 'Uyku tulumu', 'Mat', 'Kamp sandalyesi', 'Kamp masası', 'Fener',
      'El feneri', 'Kafa lambası', 'Çakı', 'İp', 'Gaz ocağı', 'Gaz tüpü', 'Matara',
      'İlk yardım çantası', 'Yağmurluk', 'Pusula', 'Kibrit', 'Çakmak', 'Termos',
      'Sırt çantası', 'Battaniye', 'Düdük', 'Powerbank', 'Sineklik',
    ],
  },
  {
    id: 'oto',
    name: 'Oto / Garaj',
    icon: '🚗',
    aliases: ['araba', 'araç', 'garaj', 'oto', 'bagaj', 'araç çantası'],
    items: [
      'Kriko', 'Bijon anahtarı', 'Stepne', 'Takviye kablosu', 'Antifriz',
      'Cam suyu', 'Motor yağı', 'Yedek ampul', 'Üçgen reflektör', 'Yangın söndürücü',
      'Çekme halatı', 'Hava pompası', 'Yedek sigorta', 'Buz kazıyıcı', 'Eldiven',
      'El feneri', 'Yağ hunisi', 'Bez', 'İlk yardım çantası', 'Zincir',
    ],
  },
  {
    id: 'oyuncak',
    name: 'Oyuncak Kutusu',
    icon: '🧸',
    aliases: ['oyuncak', 'çocuk', 'oyun', 'oyuncaklar'],
    items: [
      'Lego', 'Oyuncak araba', 'Bebek', 'Puzzle', 'Top', 'Peluş oyuncak', 'Blok',
      'Boyama kitabı', 'Oyun hamuru', 'Kukla', 'Tahta blok', 'Yapboz', 'Tren seti',
      'Kale', 'Robot', 'Boya kalemi', 'Kart oyunu', 'Müzikli oyuncak',
    ],
  },
  {
    id: 'dikis',
    name: 'Dikiş Kutusu',
    icon: '🧵',
    aliases: ['dikiş', 'nakış', 'el işi', 'iğne kutusu', 'dikiş seti'],
    items: [
      'İğne', 'İplik', 'Makas', 'Yüksük', 'Toplu iğne', 'Düğme', 'Fermuar',
      'Mezura', 'Dikiş makinesi', 'Kumaş', 'Tığ', 'Yün', 'Çıtçıt', 'Kopça',
      'Terzi tebeşiri', 'İğne yastığı', 'Lastik', 'Şerit', 'Dantel',
    ],
  },
  {
    id: 'hirdavat',
    name: 'Hırdavat / Vida Kutusu',
    icon: '🔩',
    aliases: ['hırdavat', 'vida', 'civata', 'nalbur', 'vida kutusu'],
    items: [
      'Vida', 'Ahşap vida', 'Sunta vida', 'Çivi', 'Dübel', 'Somun', 'Civata',
      'Pul', 'Rondela', 'Kanca', 'Menteşe', 'Kelepçe', 'Kablo bağı', 'Sigorta',
      'Ampul', 'Priz', 'Anahtar', 'Fiş', 'Zincir', 'Halka', 'Kilit', 'Asma kilit',
    ],
  },
  {
    id: 'kisisel-bakim',
    name: 'Kişisel Bakım',
    icon: '🧴',
    aliases: ['kişisel bakım', 'bakım', 'hijyen', 'kozmetik dolabı'],
    items: [
      'Şampuan', 'Saç kremi', 'Saç jölesi', 'Saç spreyi', 'Nemlendirici',
      'Güneş kremi', 'El kremi', 'Yüz temizleme jeli', 'Tonik', 'Serum',
      'Deodorant', 'Parfüm', 'Vücut losyonu', 'Dudak balsamı', 'Tırnak makası',
      'Cımbız', 'Pamuk', 'Kulak çubuğu', 'Ağda', 'Tıraş bıçağı',
    ],
  },
  {
    id: 'camasir',
    name: 'Çamaşır / Çamaşırhane',
    icon: '🧺',
    aliases: ['çamaşır', 'çamaşırhane', 'leğen', 'çamaşır odası'],
    items: [
      'Çamaşır deterjanı', 'Yumuşatıcı', 'Çamaşır suyu', 'Leke çıkarıcı',
      'Çamaşır mandalı', 'Çamaşır ipi', 'Kurutma askısı', 'Leğen', 'Sepet',
      'Ütü', 'Ütü masası', 'Kola spreyi', 'Çorap filesi', 'Toz deterjan',
      'Renk koruyucu mendil', 'Tüy toplayıcı',
    ],
  },
  {
    id: 'cay-kahve',
    name: 'Çay / Kahve Köşesi',
    icon: '☕',
    aliases: ['kahve', 'çay', 'içecek', 'kahvaltılık', 'çay kahve'],
    items: [
      'Çay', 'Yeşil çay', 'Bitki çayı', 'Türk kahvesi', 'Filtre kahve',
      'Granül kahve', 'Şeker', 'Küp şeker', 'Bal', 'Süt', 'Kakao', 'Çaydanlık',
      'Cezve', 'Fincan', 'Çay bardağı', 'Kaşık', 'Çay kaşığı', 'Filtre kağıdı',
      'Bisküvi', 'Kraker',
    ],
  },
  {
    id: 'spor',
    name: 'Spor Çantası',
    icon: '🏋️',
    aliases: ['spor', 'gym', 'antrenman', 'fitness', 'spor çantası'],
    items: [
      'Spor ayakkabı', 'Tişört', 'Şort', 'Tayt', 'Eşofman', 'Çorap', 'Havlu',
      'Su matarası', 'Eldiven', 'Kulaklık', 'Ter bandı', 'Yedek tişört',
      'Duş jeli', 'Deodorant', 'Protein bar', 'Direnç bandı', 'İp', 'Kilit',
    ],
  },
  {
    id: 'belgeler',
    name: 'Evrak / Belgeler',
    icon: '📄',
    aliases: ['evrak', 'belge', 'dosya', 'kağıt', 'fatura', 'belgeler', 'resmi evrak'],
    items: [
      'Kimlik', 'Pasaport', 'Ehliyet', 'Tapu', 'Ruhsat', 'Sigorta poliçesi',
      'Fatura', 'Sözleşme', 'Diploma', 'Sağlık raporu', 'Garanti belgesi',
      'Banka evrakı', 'Kira kontratı', 'Vergi belgesi', 'Nüfus cüzdanı',
      'Aşı kartı', 'Fotoğraf', 'Klasör', 'Dosya', 'Zarf',
    ],
  },
]
