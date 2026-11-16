# QualityVision AI

Yapay zeka destekli web geliştirme proje yönergesi kapsamında hazırlanan endüstriyel kalite kontrol ve ölçüm yönetimi web uygulaması.

## Özellikler
- Ölçüm kayıtlarını listeleme, arama, ekleme ve silme
- Nominal değer ve tolerans sınırlarına göre PASS/FAIL değerlendirmesi
- Kalite göstergeleri ve grafikler
- CSV dışa aktarma
- LocalStorage ile tarayıcıda kayıt saklama
- Mobil uyumlu arayüz

## Teknolojiler
React 18, Vite 6, JavaScript, CSS, Recharts, Lucide React ve LocalStorage.

## Kurulum
Node.js LTS ve npm kurulu olmalıdır.

```bash
npm install
npm run dev
```

Varsayılan geliştirme adresi: http://localhost:5173

## Üretim derlemesi
```bash
npm run build
npm run preview
```

Build çıktısı `dist/` klasörüdür. Vercel/Netlify ayarları: Build command `npm run build`, output directory `dist`.

## Yapay zekâ kullanımı
Proje fikrinin kapsamlandırılması, ekran/bileşen planlaması, kod taslağı ve README dokümantasyonunda ChatGPT'den yararlanılmıştır. Kodun çalıştırılarak test edilmesi ve doğrulanması proje sahibinin sorumluluğundadır.

## Veri ve sınırlamalar
Bu proje demo amaçlıdır. Başlangıç kayıtları örnek veridir; gerçek ölçüm cihazı, sunucu, kullanıcı hesabı veya harici AI API bağlantısı içermez. Veriler tarayıcının LocalStorage alanında saklanır. Tolerans sınırları dahil edilerek kontrol edilir.

## Ekran görüntüsü
Uygulamayı çalıştırıp ekran görüntüsünü bu bölüme ekleyin.
