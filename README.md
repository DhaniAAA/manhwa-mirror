# 📚 Manhwa Mirror

> Platform modern untuk membaca manhwa dengan antarmuka yang nyaman dan intuitif.

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Storage-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)

Platform web untuk membaca manhwa dengan antarmuka modern, dark theme yang nyaman, dan performa optimal. Dibangun dengan Vue 3, TypeScript, dan Vite.

## 🆕 Recent Updates

### v11.0.0 - Image Proxy & UX Improvements
- 🖼️ **Image Proxy System** - Self-hosted image proxy dengan domain tersembunyi (ID mapping)
- 🔒 **Hidden Domain URLs** - URL menggunakan ID (1, 2, 3) bukan domain asli untuk security
- 🎯 **Clean URLs** - Path-based URLs tanpa encoding (`/api/image/1/path` bukan `?url=...`)
- 📱 **3-Column Chapter Grid** - Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column scrollable
- 📜 **Scrollable Chapter List** - Max-height 600px di mobile untuk mudah akses footer
- 🎛️ **Select Chapter Dropdown** - Quick jump ke chapter tertentu tanpa scroll
- 🎨 **Footer Optimization** - Reduced gap untuk tampilan lebih compact
- ⚡ **Vite Plugin Dev Proxy** - Development mode proxy untuk testing
- 🚀 **Serverless Functions** - Vercel & Netlify functions untuk production proxy
- 🔧 **Custom Scrollbar** - Stylish scrollbar dengan accent color di mobile


## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#️-teknologi)
- [Quick Start](#-quick-start)
- [Struktur Project](#-struktur-project)
- [Arsitektur Aplikasi](#️-arsitektur-aplikasi)
- [Fitur Design](#-fitur-design)
- [Struktur Data Supabase](#-struktur-data-supabase)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## ✨ Fitur Utama

- 🌙 **Dark Theme Modern** - Skema warna gelap yang nyaman untuk mata dengan pencahayaan ambient yang halus
- 🎨 **UI/UX Intuitif** - Antarmuka pengguna yang bersih dan mudah digunakan
- 📖 **Reader Mode** - Pengalaman membaca yang optimal dengan kontrol penuh
- 🎯 **Responsive Design** - Tampilan sempurna di semua perangkat
- ⚡ **Performance Optimization** - Loading cepat dengan lazy loading, preloading, dan caching
- 🖼️ **Image Proxy System** - Self-hosted proxy dengan domain tersembunyi untuk security & control
- 🔒 **Hidden Domain URLs** - URL menggunakan ID mapping (1, 2, 3) bukan domain asli
- 📱 **3-Column Chapter Grid** - Responsive grid layout: Desktop 3 cols, Tablet 2 cols, Mobile 1 col
- 📜 **Scrollable Chapter List** - Max-height container di mobile untuk easy footer access
- 🎛️ **Quick Chapter Jump** - Select dropdown untuk langsung ke chapter tertentu
- 🖼️ **Smart Image Loading** - Lazy loading dengan skeleton shimmer dan progressive preloading
- 🔖 **Bookmark System** - Simpan dan lanjutkan membaca manhwa favorit
- 🔍 **Search Function** - Cari manhwa dengan mudah
- 📊 **Progress Tracking** - Lacak progress bacaan Anda
- 🗺️ **Vue Router** - Navigasi SPA yang smooth dengan routing
- 💾 **Advanced Cache System** - Multi-layer caching untuk performa optimal
- 🔄 **SPA Routing** - No 404 errors on refresh dengan proper Vercel configuration

## 🛠️ Teknologi

- **Vue 3** - Progressive JavaScript Framework dengan Composition API
- **TypeScript** - Type-safe development
- **Vite** - Next generation frontend tooling
- **Vue Router** - Official routing library untuk Vue.js
- **Supabase** - Backend & Storage untuk data manhwa
- **CSS Variables** - Dynamic theming system

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 atau lebih tinggi)
- npm atau yarn

### Instalasi

```sh
# Clone repository
git clone https://github.com/DhaniAAA/manhwa-mirror.git

# Masuk ke direktori project
cd manhwa-mirror

# Install dependencies
npm install
```

### Konfigurasi Environment

Buat file `.env` di root project dengan konfigurasi Supabase:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Lihat `.env.example` untuk referensi.

### Development

```sh
# Jalankan development server
npm run dev
```

Buka browser dan akses `http://localhost:5173`

**Note**: Aplikasi sudah terhubung dengan Supabase Storage. Data manhwa akan dimuat otomatis dari bucket `manga-data`.

### Build untuk Production

```sh
# Type-check dan build
npm run build

# Preview production build
npm run preview
```

### Deployment

Aplikasi dapat di-deploy ke berbagai platform hosting:

**Vercel (Recommended):**
1. Connect repository GitHub
2. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_BUCKET_NAME` (optional, default: manga-data)
3. Build command: `npm run build`
4. Output directory: `dist`
5. Framework preset: Vite

**Important**: File `vercel.json` sudah dikonfigurasi untuk mengatasi 404 error pada refresh.

**Netlify:**
1. Connect repository GitHub
2. Set environment variables (sama seperti Vercel)
3. Build command: `npm run build`
4. Publish directory: `dist`

**Manual:**
```sh
npm run build
# Upload folder dist/ ke hosting
```

## 📁 Struktur Project

```
manhwa-mirror/
├── src/
│   ├── components/
│   │   ├── NavigationBar.vue      # Navigation bar dengan search
│   │   ├── HeroSection.vue        # Hero section dengan featured manhwa
│   │   ├── ManhwaCard.vue         # Card component untuk manhwa
│   │   ├── ManhwaSection.vue      # Section untuk koleksi manhwa
│   │   ├── ManhwaGrid.vue         # Grid layout untuk manhwa
│   │   ├── ManhwaDetail.vue       # Detail page dengan 3-col grid & select chapter
│   │   ├── ManhwaReader.vue       # Reader interface
│   │   └── LazyImage.vue          # Lazy loading image component
│   ├── views/
│   │   ├── HomePage.vue           # Home page view
│   │   ├── DetailPage.vue         # Detail page view
│   │   └── ReaderPage.vue         # Reader page view
│   ├── composables/
│   │   ├── useManhwa.ts           # State management composable
│   │   ├── useManhwaDetail.ts     # Detail page composable
│   │   └── useImageProxy.ts       # Image proxy composable
│   ├── services/
│   │   ├── manhwaService.ts       # Supabase data service dengan proxy
│   │   └── cacheService.ts        # Cache management service
│   ├── utils/
│   │   └── imageProxy.ts          # Image proxy utilities & domain mapping
│   ├── router/
│   │   └── index.ts               # Vue Router configuration
│   ├── lib/
│   │   └── supabase.ts            # Supabase client config
│   ├── types/
│   │   └── manhwa.ts              # TypeScript types & interfaces
│   ├── App.vue                    # Main app component
│   ├── AppRouter.vue              # Router wrapper component
│   ├── main.ts                    # Entry point
│   └── style.css                  # Global styles & theme
├── vite-plugins/
│   └── imageProxyPlugin.ts        # Vite plugin untuk dev proxy
├── api/
│   └── image-proxy.js             # Vercel serverless function
├── netlify/functions/
│   └── image-proxy.js             # Netlify serverless function
├── public/                        # Static assets
├── .env                           # Environment variables (Supabase)
├── .env.example                   # Environment variables template
├── vercel.json                    # Vercel deployment & routing config
├── Panduan.md                     # Panduan struktur data Supabase
└── index.html                     # HTML template
```

## 🏗️ Arsitektur Aplikasi

### Routing
Aplikasi menggunakan Vue Router dengan 3 halaman utama:
- **Home** (`/`) - Daftar semua manhwa
- **Detail** (`/detail/:slug`) - Detail manhwa dan daftar chapters
- **Reader** (`/baca/:slug/read/:chapterSlug`) - Halaman pembaca chapter

### State Management
Menggunakan Vue 3 Composition API dengan composables:
- `useManhwa` - Mengelola state daftar manhwa
- `useManhwaDetail` - Mengelola state detail manhwa dan chapters

### Image Proxy System
- **Development** - Vite plugin (`imageProxyPlugin.ts`) untuk proxy di dev mode
- **Production** - Serverless functions untuk Vercel & Netlify
- **Domain Mapping** - ID-based URLs (1, 2, 3) untuk hide external domains
- **Clean URLs** - Path-based routing tanpa encoding
- **Security** - Domain validation & whitelist protection

### Services
- **manhwaService** - Mengambil data dari Supabase Storage dengan caching & proxy
  - Metadata caching (5 menit)
  - Chapters caching (5 menit)
  - Chapter detail caching (10 menit)
  - Auto-apply image proxy ke semua URLs
  - CORS error detection & helpful logging
- **cacheService** - Mengelola caching data untuk performa optimal
- **imageProxy** - Utilities untuk URL transformation & domain mapping

### Components
- **ManhwaDetail** - 3-column grid layout dengan select chapter dropdown
- **Chapter List** - Responsive grid: Desktop 3 cols, Tablet 2 cols, Mobile 1 col scrollable
- **Smart Image Loading** - Lazy loading dengan priority loading untuk 3 gambar pertama
- **Progressive Preloading** - Otomatis preload 3 gambar berikutnya saat scroll
- **Loading Skeleton** - Shimmer animation untuk feedback visual
- **Reusable Components** - Card, Grid, Section untuk konsistensi UI

## 🎨 Fitur Design

### Color Palette

- **Primary Background**: `#0a0a0f`
- **Secondary Background**: `#13131a`
- **Accent Purple**: `#8b5cf6`
- **Text Primary**: `#f5f5f7`
- **Text Secondary**: `#a1a1aa`

### Ambient Lighting

Website menggunakan efek ambient lighting dengan gradient radial yang beranimasi untuk menciptakan suasana yang nyaman dan modern.

### Animations

- Fade in animations untuk content
- Smooth transitions pada hover states
- Ambient background animation
- Progress bar animations
- Skeleton shimmer untuk loading states
- Image fade-in transitions

## 🔧 Customization

Anda dapat mengkustomisasi tema dengan mengubah CSS variables di `src/style.css`:

```css
:root {
  --bg-primary: #0a0a0f;
  --accent-primary: #8b5cf6;
  /* ... dan lainnya */
}
```

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 📦 Struktur Data Supabase

Aplikasi ini menggunakan Supabase Storage dengan struktur bucket sebagai berikut:

```
manga-data/                     (Bucket)
├── comics-list.json            (Daftar semua manhwa)
└── [manhwa-slug]/              (Folder per manhwa)
    ├── metadata.json           (Info dasar manhwa)
    └── chapters.json           (Data semua chapters)
```

### Format File

**comics-list.json** - Array berisi slug semua manhwa:
```json
["manhwa-1", "manhwa-2", ...]
```

**metadata.json** - Info dasar manhwa tanpa chapters:
```json
{
  "slug": "manhwa-slug",
  "title": "Manhwa Title",
  "total_chapters": 50
}
```

**chapters.json** - Data lengkap semua chapters:
```json
{
  "slug": "manhwa-slug",
  "title": "Manhwa Title",
  "total_chapters": 50,
  "chapters": [
    {
      "slug": "chapter-01",
      "title": "Chapter 01",
      "url": "https://...",
      "total_images": 25,
      "images": ["https://image1.jpg", ...]
    }
  ]
}
```

Lihat `Panduan.md` untuk detail lengkap struktur data.

## 🔍 Troubleshooting

### CORS Error (Access-Control-Allow-Origin: Missing Header)
**Solusi**: Set Supabase Storage bucket menjadi **Public**
1. Buka Supabase Dashboard → Storage
2. Pilih bucket `manga-data`
3. Settings → Toggle **"Public bucket" ON**
4. Save

📖 **Lihat `SUPABASE_CORS_FIX.md` untuk panduan lengkap**

### 404 Error saat Refresh Halaman
**Solusi**: File `vercel.json` sudah dikonfigurasi untuk mengatasi ini.
- Pastikan file `vercel.json` ada di root project
- Deploy ulang ke Vercel
- Refresh halaman seharusnya tidak error lagi

### Data tidak muncul
- Pastikan file `.env` sudah dikonfigurasi dengan benar
- Cek koneksi ke Supabase Storage
- Pastikan bucket `manga-data` dapat diakses secara public
- Buka browser console untuk melihat error messages

### Build error
- Hapus folder `node_modules` dan `package-lock.json`
- Jalankan `npm install` ulang
- Pastikan menggunakan Node.js v16 atau lebih tinggi

### Image loading lambat
**Sudah dioptimasi dengan**:
- Lazy loading untuk gambar di bawah viewport
- Priority loading untuk 3 gambar pertama
- Progressive preloading saat scroll
- Multi-layer caching system

## 🤝 Contributing

Contributions, issues, dan feature requests sangat diterima!

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

MIT License - lihat file LICENSE untuk detail

## 📚 Documentation

### Core Documentation
- **Panduan.md** - Panduan struktur data Supabase


## 🔗 Links

- **Live Demo**: [manhwa-mirror.vercel.app](https://manhwa-mirror.vercel.app)
- **Repository**: [github.com/DhaniAAA/manhwa-mirror](https://github.com/DhaniAAA/manhwa-mirror)
- **Issues**: [Report Bug / Request Feature](https://github.com/DhaniAAA/manhwa-mirror/issues)

## 👨‍💻 Developer

Dibuat dengan ❤️ menggunakan Vue 3 + TypeScript

---

**Manhwa Mirror** - Baca manhwa favorit Anda dengan nyaman! 📚✨
