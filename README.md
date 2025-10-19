# 📚 Manhwa Mirror

Platform modern untuk membaca manhwa dengan antarmuka yang nyaman dan intuitif. Dibangun dengan Vue 3, TypeScript, dan Vite.

## ✨ Fitur Utama

- 🌙 **Dark Theme Modern** - Skema warna gelap yang nyaman untuk mata dengan pencahayaan ambient yang halus
- 🎨 **UI/UX Intuitif** - Antarmuka pengguna yang bersih dan mudah digunakan
- 📖 **Reader Mode** - Pengalaman membaca yang optimal dengan kontrol penuh
- 🎯 **Responsive Design** - Tampilan sempurna di semua perangkat
- ⚡ **Performance** - Loading cepat dan animasi yang smooth
- 🔖 **Bookmark System** - Simpan dan lanjutkan membaca manhwa favorit
- 🔍 **Search Function** - Cari manhwa dengan mudah
- 📊 **Progress Tracking** - Lacak progress bacaan Anda

## 🛠️ Teknologi

- **Vue 3** - Progressive JavaScript Framework
- **TypeScript** - Type-safe development
- **Vite** - Next generation frontend tooling
- **Supabase** - Backend & Storage untuk data manhwa
- **CSS Variables** - Dynamic theming system

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 atau lebih tinggi)
- npm atau yarn

### Instalasi

```sh
# Clone repository
git clone <repository-url>

# Masuk ke direktori project
cd manhwa-mirror

# Install dependencies
npm install
```

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

## 📁 Struktur Project

```
manhwa-mirror/
├── src/
│   ├── components/
│   │   ├── NavigationBar.vue      # Navigation bar dengan search
│   │   ├── HeroSection.vue        # Hero section dengan featured manhwa
│   │   ├── ManhwaCard.vue         # Card component untuk manhwa
│   │   ├── ManhwaSection.vue      # Section untuk koleksi manhwa
│   │   └── ManhwaReader.vue       # Reader interface
│   ├── composables/
│   │   └── useManhwa.ts           # State management composable
│   ├── services/
│   │   └── manhwaService.ts       # Supabase data service
│   ├── lib/
│   │   └── supabase.ts            # Supabase client config
│   ├── types/
│   │   └── manhwa.ts              # TypeScript types
│   ├── App.vue                    # Main app component
│   ├── main.ts                    # Entry point
│   └── style.css                  # Global styles & theme
├── public/                        # Static assets
├── .env                           # Environment variables (Supabase)
└── index.html                     # HTML template
```

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

## 🤝 Contributing

Contributions, issues, dan feature requests sangat diterima!

## 📝 License

MIT License - lihat file LICENSE untuk detail

## 👨‍💻 Developer

Dibuat dengan ❤️ menggunakan Vue 3 + TypeScript

---
