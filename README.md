## Penanggung Jawab

1. **Muhammad Kevin Alvarel - Fullstack Engineer**
2. **Muhammad Sahrul Ramadhan - Fullstack Engineer**

---

## 📚 Repository & Sumber Proyek

Tenantify dikembangkan dalam beberapa repository yang saling terintegrasi untuk membangun satu ekosistem digital. Berikut adalah repository resmi yang dapat diakses untuk melihat implementasi dan dokumentasi setiap komponen.

| Komponen | Repository | Deskripsi |
|---|---|---|
| **Organization** | [tenantify-hackathon](https://github.com/tenantify-hackathon) | Halaman utama organisasi dan pusat seluruh pengembangan proyek Tenantify. |
| **Web Application** | [tenantify-web-app](https://github.com/tenantify-hackathon/tenantify-web-app) | Aplikasi utama Tenantify yang mencakup pengelolaan Association, Seller, dan Consumer. |
| **Machine Learning** | [tenantify-ml-models](https://github.com/tenantify-hackathon/tenantify-ml-models) | Backend AI untuk rekomendasi produk UMKM dan moderasi komentar berbasis NLU. |

### Tautan Aplikasi

| Platform | URL |
|---|---|
| Customer Application | [tenantify.store](https://tenantify.store) |
| Seller & Association Dashboard | [seller.tenantify.store](https://seller.tenantify.store) |

Seluruh repository merupakan bagian dari pengembangan **Tenantify — Ekosistem Digital untuk Pengelolaan Bazaar dan Food Court**.

---

# Tenantify

Platform digital untuk mendigitalisasi dan mengelola aktivitas penjualan UMKM di area komersial seperti **Bazaar**, **Food Court**, dan tempat serupa. Tenantify menghubungkan tiga peran — **Association**, **Seller**, dan **Consumer** — dalam satu ekosistem: pengelolaan tenant, penjualan produk, pemetaan lokasi, hingga pengalaman berbelanja.

## 🔑 Akun Demo untuk Juri

Untuk memudahkan proses pengujian dan eksplorasi fitur Tenantify, berikut akun demo yang dapat digunakan oleh juri berdasarkan masing-masing role.

| Role | Email | Password |
|---|---|---|
| Consumer | `juri@tenantify.store` | `password123` |
| Seller | `admin@kopikita.com` | `password123` |
| Association | `cilegonjuare@gmail.com` | `cilegonjuare` |

### Panduan Login

Tenantify menyediakan dua alamat aplikasi berdasarkan kebutuhan pengguna:

| Alamat Website | Pengguna |
|---|---|
| [https://tenantify.store](https://tenantify.store) | Customer |
| [https://seller.tenantify.store](https://seller.tenantify.store) | Seller & Association |

**Langkah Pengujian:**

1. Buka alamat website sesuai role yang ingin diuji.
2. Pilih menu **Masuk / Login**.
3. Masukkan email dan password menggunakan akun demo yang telah disediakan.
4. Setelah berhasil login, sistem akan mengarahkan pengguna ke halaman sesuai role dan hak akses masing-masing.

**Catatan:** Gunakan akun demo di atas untuk keperluan pengujian dan eksplorasi fitur selama proses penilaian hackathon.

---

## Fitur Utama

- **Multi-role** — dashboard terpisah untuk Association (pengelola area), Seller (pemilik tenant), dan Consumer (pembeli).
- **Cross-tenant product recommendation** — rekomendasi produk dari tenant lain berbasis layanan AI (semantic + complementary scoring).
- **Tenant map & floor plan** — layout zona dan lokasi booth/tenant yang bisa dilihat Consumer dan diatur Association.
- **Dua jalur pemesanan** — online ordering lewat aplikasi dan transaksi langsung di tenant melalui POS kasir.
- **Manajemen katalog & stok** — Seller mengelola produk, stok, promosi, ulasan, dan statistik penjualan.
- **Invoice sewa tenant** — Association menerbitkan tagihan sewa bulanan beserta status pembayaran.
- **Autentikasi & otorisasi** — Better Auth dengan email/password, sesi, role, dan kode unik association.

## Tech Stack

| Lapisan         | Teknologi                                                       |
| --------------- | --------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack, Server Actions), React 19    |
| Bahasa          | TypeScript                                                      |
| Database        | PostgreSQL (Neon) + Drizzle ORM                                 |
| Auth            | Better Auth                                                     |
| UI              | Tailwind CSS v4, Base UI, shadcn/ui, Lucide & Hugeicons, Motion |
| Form & validasi | React Hook Form + Zod                                           |
| Cache           | Upstash Redis                                                   |
| Storage         | Vercel Blob                                                     |
| AI service      | Layanan rekomendasi eksternal (Hugging Face Space)              |

## Struktur Proyek

```
app/                  Route & halaman (landing, customer, dashboard admin, API)
components/           Komponen UI yang dipakai ulang
context/              React context
data/                 Data demo/seed statis
db/                   Skema Drizzle & modul query
hooks/                Custom React hooks
lib/                  Utilitas: auth, cache, AI client, analytics, slug
migrations/           Migrasi SQL Drizzle
servers/              Server actions per domain (auth, seller, association, dll.)
types/                Definisi tipe TypeScript
validations/          Skema validasi Zod
```

## Prasyarat

- Node.js 20+ (disarankan 24)
- npm
- Database Serverless PostgreSQL (Neon)
- Akun Upstash Redis (opsional, untuk cache)
- Vercel Blob token (untuk upload gambar produk)

## Menjalankan Proyek

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Variabel Lingkungan

Buat file `.env` di root project:

```env
# Database
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Upstash Redis (opsional)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=...

# AI service (opsional, ada default)
AI_SERVICE_URL=https://s4usan-tenantify-models.hf.space
```

### Perintah Tersedia

| Perintah              | Deskripsi                        |
| --------------------- | -------------------------------- |
| `npm run dev`         | Menjalankan server development   |
| `npm run build`       | Build produksi                   |
| `npm start`           | Menjalankan hasil build          |
| `npm run lint`        | Menjalankan ESLint               |
| `npm run db:generate` | Generate file migrasi dari skema |
| `npm run db:migrate`  | Jalankan migrasi ke database     |
| `npm run db:push`     | Push skema langsung ke database  |
| `npm run db:studio`   | Buka Drizzle Studio              |

Dibuat untuk hackathon.
