Ini merupakan Struktur bucket pada storage Supabase.

### **Struktur Baru (Bucket):**

```
manga-data/                     (nama Bucket)
├── piquant/                    (Folder judul Manhwa)
│   ├── metadata.json           (info komik tanpa chapters)
│   └── chapters.json           (SEMUA chapters dalam 1 file)
```

**SEMUA** chapters dalam 1 file:

## 📄 Format File

### **1. metadata.json**

Info dasar komik **tanpa** data chapters:

```json
{
  "slug": "piquant",
  "title": "PIQUANT",
  "total_chapters": 50,
  "chapters": [
    {
      "slug": "chapter-01",
      "title": "Chapter 01",
      "url": "https://...",
      "total_images": 25,
      "images": [
        "https://image1.jpg",
        "https://image2.jpg",
        ...
      ]
    },
    ...
  ]
}
```

### **2. chapters.json**

**SEMUA** chapters dalam 1 file:

```json
{
  "slug": "piquant",
  "title": "PIQUANT",
  "total_chapters": 50,
  "chapters": [
    {
      "slug": "chapter-01",
      "title": "Chapter 01",
      "url": "https://...",
      "total_images": 25,
      "images": [
        "https://image1.jpg",
        "https://image2.jpg",
        ...
      ]
    },
    {
      "slug": "chapter-02",
      "title": "Chapter 02",
      "url": "https://...",
      "total_images": 23,
      "images": [...]
    },
    ...
  ]
}
```

## 📄 Format File

### **3. comics-list.json**

Info dasar Daftar Komik komik data chapters:

```json
[
  "a-disaster-class-hero-has-returned",
  "academys-genius-swordmaster",
  "chronicles-of-the-demon-faction",
  "dungeon-reset",
  "eleceed",
  "gosu",
  "i-am-player-who-suck-alone-solo-bug-player",
  "legend-of-the-northern-blade",
  "leveling-up,-by-only-eating",
  "leveling-with-the-gods",
  "martial-god-regressed-to-level-2",
  "medical-return",
  "mercenary-enrollment",
  "murim-login"
]
```