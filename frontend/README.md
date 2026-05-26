# Frontend Documentation

Frontend Amara Bali Villa dibangun dengan React, Tailwind CSS, dan CRACO.
Aplikasi ini menggunakan API backend untuk katalog villa, pengalaman, blog, booking, dan admin.

## Persyaratan

- Node.js 18+ atau versi yang kompatibel
- Yarn 1.x
- Backend FastAPI berjalan dan dapat diakses dari frontend

## Setup

1. Masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Instal dependensi:
   ```bash
   yarn install
   ```
3. Buat file `.env` pada `frontend/`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

`REACT_APP_BACKEND_URL` harus menunjuk ke host backend tanpa path `/api`.

## Menjalankan Frontend

Jalankan development server:

```bash
yarn start
```

Buka aplikasi di:

```text
http://localhost:3000
```

## Build Produksi

Untuk membuat bundle produksi:

```bash
yarn build
```

## Struktur Folder Utama

- `src/pages/` - halaman aplikasi seperti Home, Villas, Booking, Admin, Blog, dan Experience.
- `src/components/` - komponen UI reusable.
- `src/lib/api.js` - konfigurasi axios dan endpoint API.
- `src/hooks/` - custom hooks aplikasi.
- `public/` - aset statis dan `index.html`.

## Integrasi API

Frontend menghubungi backend melalui `src/lib/api.js`.
Beberapa fungsi API utama:

- `fetchVillas`, `fetchVilla`, `fetchRelatedVillas`
- `fetchCategories`, `fetchDestinations`
- `fetchExperiences`, `fetchExperience`
- `fetchTestimonials`
- `fetchBlog`, `fetchBlogPost`
- `createBookingRequest`, `getBooking`
- `fetchPayInfo`, `startPayCheckout`, `getCheckoutStatus`
- `adminLogin`, `adminMe`, `adminListBookings`, `adminUpdateBooking`, `adminCreatePaymentLink`
- `adminListExperiences`, `adminCreateExperience`, `adminUpdateExperience`, `adminDeleteExperience`
- `adminListTestimonials`, `adminCreateTestimonial`, `adminUpdateTestimonial`, `adminDeleteTestimonial`
- `adminListBlogPosts`, `adminCreateBlogPost`, `adminUpdateBlogPost`, `adminDeleteBlogPost`
- `sendContact`, `subscribeNewsletter`

## Autentikasi Admin

Token admin disimpan di `localStorage` menggunakan kunci `amara_admin_token`.
Interceptor axios di `src/lib/api.js` menambahkan header `Authorization: Bearer <token>` secara otomatis bila token tersedia.

## Catatan Pengembangan

- Halaman login admin ada di `src/pages/AdminLogin.jsx`.
- Dashboard admin ada di `src/pages/AdminDashboard.jsx`.
- `src/components/` berisi komponen UI yang bisa disesuaikan untuk tema dan tampilan.

## Troubleshooting

- Jika frontend belum terhubung ke backend, periksa nilai `REACT_APP_BACKEND_URL`.
- Restart frontend setelah mengubah `.env`.
- Pastikan backend berjalan dan CORS diizinkan jika host berbeda.
