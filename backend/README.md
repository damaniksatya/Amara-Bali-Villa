# Backend Documentation

Backend Amara Bali Villa dibangun dengan FastAPI dan MongoDB.
API ini menyediakan katalog villa, pengalaman, blog, testimonial, booking, pembayaran, dan admin.

## Persyaratan

- Python 3.11+
- MongoDB berjalan dan dapat diakses
- Stripe API key untuk pembayaran checkout

## Setup

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Install dependensi:
   ```bash
   pip install -r requirements.txt
   ```
3. Siapkan file `.env` di direktori `backend/` dengan variabel berikut:
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=amara
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=supersecret
   JWT_SECRET=supersecretjwt
   STRIPE_API_KEY=sk_test_yourkey
   ```

## Menjalankan Server

Jalankan server development:

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Server akan tersedia di `http://localhost:8000`.

## Data Seed dan Admin

Saat startup, backend otomatis melakukan seed data apabila koleksi kosong:
- `villas`
- `categories`
- `destinations`
- `experiences`
- `testimonials`
- `blog_posts`

Admin user juga dibuat otomatis berdasarkan `ADMIN_EMAIL` dan `ADMIN_PASSWORD`.

## Struktur Utama

- `server.py` - definisi semua endpoint FastAPI dan model data.
- `auth.py` - helper otentikasi JWT, hash password, verifikasi, dan middleware admin.
- `seed_data.py` - data awal untuk villas, categories, destinations, experiences, testimonials, dan blog.

## Konfigurasi JWT

- `JWT_SECRET` dibutuhkan untuk membuat dan memverifikasi token JWT.
- Token akses berlaku selama 12 jam.
- Admin dikontrol melalui `require_admin()` yang memeriksa header `Authorization: Bearer <token>`.

## Stripe dan Pembayaran

- `STRIPE_API_KEY` digunakan untuk membuat sesi checkout Stripe.
- Endpoint webhook: `/api/webhook/stripe`
- Frontend mengarahkan user ke `success_url` dan `cancel_url` berdasarkan `origin_url` yang dikirim saat checkout.

## Endpoint Utama

Base URL API: `http://localhost:8000/api`

### Autentikasi
- `POST /api/auth/login` - login admin
- `GET /api/auth/me` - info admin

### Catalog Publik
- `GET /api/villas`
- `GET /api/villas/{slug}`
- `GET /api/villas/{slug}/related`
- `GET /api/categories`
- `GET /api/destinations`
- `GET /api/experiences`
- `GET /api/experiences/{experience_id}`
- `GET /api/testimonials`
- `GET /api/blog`
- `GET /api/blog/{slug}`

### Booking & Contact
- `POST /api/bookings`
- `GET /api/bookings/{booking_id}`
- `POST /api/contact`
- `POST /api/newsletter`

### Pembayaran
- `GET /api/pay/{booking_id}`
- `POST /api/pay/{booking_id}/checkout`
- `GET /api/payments/checkout/status/{session_id}`
- `POST /api/webhook/stripe`

### Admin Konten
- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/{booking_id}`
- `POST /api/admin/bookings/{booking_id}/payment-link`
- `GET /api/admin/stats`
- `GET /api/admin/experiences`
- `POST /api/admin/experiences`
- `PATCH /api/admin/experiences/{experience_id}`
- `DELETE /api/admin/experiences/{experience_id}`
- `GET /api/admin/testimonials`
- `POST /api/admin/testimonials`
- `PATCH /api/admin/testimonials/{name}`
- `DELETE /api/admin/testimonials/{name}`
- `GET /api/admin/blog`
- `POST /api/admin/blog`
- `PATCH /api/admin/blog/{slug}`
- `DELETE /api/admin/blog/{slug}`

## Catatan Penting

- Semua admin endpoint memerlukan JWT Bearer token.
- Booking public dapat di-fetch oleh `GET /api/bookings/{booking_id}` namun hanya data publik yang ditampilkan.
- Sistem pembayaran mendukung staging demo fallback untuk kunci Stripe `sk_test_emergent`.
