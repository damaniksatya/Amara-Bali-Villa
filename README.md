# Amara Bali Villa

Amara Bali Villa adalah aplikasi reservasi villa dan pengalaman liburan di Bali.
Proyek ini dibangun sebagai aplikasi full-stack dengan:
- Frontend React + Tailwind + CRACO
- Backend FastAPI + MongoDB + Stripe pembayaran
- Otentikasi admin untuk mengelola konten dan booking

## Struktur Proyek

- `frontend/` - aplikasi web React, komponen UI, halaman, dan integrasi API.
- `backend/` - API FastAPI dengan model villa, pengalaman, blog, testimonial, booking, dan admin.
- `frontend/README.md` - dokumentasi setup frontend khusus proyek.
- `backend/README.md` - dokumentasi setup backend dan konfigurasi lingkungan.
- `design_guidelines.json` - pedoman desain UI dan visual.
- `test_reports/` - hasil pengujian dan laporan otomatis.

## Fitur Utama

- Pencarian dan filter villa
- Halaman detail villa dan pengalaman
- Galeri blog dan artikel
- Permintaan booking concierge
- Dashboard admin untuk memanage booking, pengalaman, testimonial, dan blog
- Stripe checkout untuk pembayaran booking
- Seed data awal untuk konten villa, destination, kategori, pengalaman, testimonial, dan blog

## Persyaratan

- Node.js + Yarn (frontend)
- Python 3.11+ (backend)
- MongoDB yang dapat diakses oleh backend
- Stripe API key untuk pembayaran

## Setup Backend

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Instal dependensi:
   ```bash
   pip install -r requirements.txt
   ```
3. Siapkan file `.env` di `backend/` dengan variabel berikut:
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=amara
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=supersecret
   JWT_SECRET=your_jwt_secret
   STRIPE_API_KEY=sk_test_yourkey
   ```
4. Jalankan server FastAPI:
   ```bash
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

> Saat startup, backend akan otomatis membuat data seed jika koleksi masih kosong dan membuat pengguna admin berdasarkan `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Setup Frontend

1. Masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Instal dependensi:
   ```bash
   yarn install
   ```
3. Jalankan aplikasi frontend:
   ```bash
   yarn start
   ```
4. Buka browser di:
   ```
   http://localhost:3000
   ```

## Script yang Tersedia

### Frontend
- `yarn start` - menjalankan development server React
- `yarn build` - membangun bundle produksi
- `yarn test` - menjalankan test runner

### Backend
- Jalankan dengan `uvicorn server:app --reload --host 0.0.0.0 --port 8000`
- Atau gunakan tool lain yang mendukung FastAPI

## API Utama

Base URL backend default:
`http://localhost:8000/api`

### Autentikasi Admin
- `POST /api/auth/login` - login admin
  - payload: `email`, `password`
- `GET /api/auth/me` - ambil info admin (Bearer token required)

### Public Catalog
- `GET /api/villas` - daftar villa
- `GET /api/villas/{slug}` - detail villa
- `GET /api/villas/{slug}/related` - villa terkait
- `GET /api/categories` - daftar kategori villa
- `GET /api/destinations` - daftar destinasi
- `GET /api/experiences` - daftar pengalaman
- `GET /api/experiences/{experience_id}` - detail pengalaman
- `GET /api/testimonials` - daftar testimonial
- `GET /api/blog` - daftar blog
- `GET /api/blog/{slug}` - detail artikel blog
- `POST /api/bookings` - buat permintaan booking concierge
- `POST /api/contact` - kirim pesan kontak
- `POST /api/newsletter` - daftar newsletter

### Pembayaran
- `GET /api/pay/{booking_id}` - detail pembayaran booking
- `POST /api/pay/{booking_id}/checkout` - buat sesi checkout Stripe
- `GET /api/payments/checkout/status/{session_id}` - status checkout Stripe
- `POST /api/webhook/stripe` - webhook Stripe

### Admin Endpoints (Bearer token required)
- `GET /api/admin/bookings` - daftar booking
- `GET /api/bookings/{booking_id}` - detail booking
- `PATCH /api/admin/bookings/{booking_id}` - update status booking
- `POST /api/admin/bookings/{booking_id}/payment-link` - kirim link pembayaran
- `GET /api/admin/stats` - statistik admin
- `GET /api/admin/experiences` - daftar pengalaman admin
- `POST /api/admin/experiences` - buat pengalaman baru
- `PATCH /api/admin/experiences/{experience_id}` - update pengalaman
- `DELETE /api/admin/experiences/{experience_id}` - hapus pengalaman
- `GET /api/admin/testimonials` - daftar testimonial admin
- `POST /api/admin/testimonials` - buat testimonial
- `PATCH /api/admin/testimonials/{name}` - update testimonial
- `DELETE /api/admin/testimonials/{name}` - hapus testimonial
- `GET /api/admin/blog` - daftar blog admin
- `POST /api/admin/blog` - buat artikel blog
- `PATCH /api/admin/blog/{slug}` - update artikel blog
- `DELETE /api/admin/blog/{slug}` - hapus artikel blog

## Catatan Penting

- Backend menggunakan MongoDB dengan `motor` dan `pydantic` untuk validasi.
- Otentikasi admin menggunakan JWT dengan header `Authorization: Bearer <token>`.
- Data booking dan pembayaran disinkronisasi dengan Stripe melalui webhook.
- Frontend menyusun halaman menggunakan komponen UI custom dan Radix React.

## Pengembangan

- Untuk menyesuaikan UI, periksa `frontend/src/components` dan `frontend/src/pages`.
- Untuk memperbarui model backend, periksa `backend/server.py` dan `backend/auth.py`.
- Untuk seed data, periksa `backend/seed_data.py`.

## Referensi

- react-router-dom untuk routing frontend
- FastAPI untuk API backend
- Stripe untuk checkout pembayaran
- MongoDB sebagai database utama
