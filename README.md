# Asset Management CRUD System

Sistem manajemen aset full-stack sederhana berbasis **PostgreSQL**, **NestJS**, dan **Vue.js 3** untuk melakukan operasi CRUD (Create, Read, Update, Delete) data aset secara efisien, terstruktur, dan tervalidasi.

---

## 1. Teknologi yang Digunakan

- **Database:** PostgreSQL 18.6
- **Backend:**
  - NestJS v12
  - TypeScript
  - TypeORM
  - PostgreSQL Driver (`pg`)
  - `@nestjs/config`
  - `class-validator` & `class-transformer`
  - `@nestjs/observe`
- **Frontend:**
  - Vue.js 3 (Composition API / `<script setup>`)
  - Vite
  - Vanilla CSS (Responsive & Modern)
  - Native Fetch API

---

## 2. Struktur Proyek

```text
asset-fumindo-project/
├── .gitignore
├── README.md
├── Backend/
│   ├── .env                    # Konfigurasi environment backend (tidak di-commit)
│   ├── .env.example            # Template konfigurasi environment
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts             # Entry point, CORS & Global ValidationPipe
│       ├── app.module.ts       # Root module, TypeOrm & ConfigModule setup
│       ├── app.controller.ts
│       ├── app.service.ts
│       └── asset/
│           ├── asset.module.ts
│           ├── asset.controller.ts
│           ├── asset.service.ts
│           ├── entities/
│           │   └── asset.entity.ts
│           └── dto/
│               ├── create-asset.dto.ts
│               └── update-asset.dto.ts
└── frontend/
    ├── .env                    # Konfigurasi environment frontend
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.js             # Entry point Vue.js
        └── App.vue             # Komponen utama CRUD Asset Management
```

---

## 3. Database PostgreSQL

- **Database Name:** `asset_fumindo`
- **Table Name:** `public.asset`
- **Skema Kolom:**
  - `asset_id` (Integer, Primary Key, Identity)
  - `asset_name` (Varchar 255, NOT NULL)
  - `stock_quantity` (Integer, NOT NULL, CHECK: `>= 0`)
  - `category` (Varchar 20, NOT NULL, CHECK: `'Consumable'` atau `'Non-Consumable'`)

### Menjalankan PostgreSQL Lokal di Windows
Pastikan service PostgreSQL berjalan melalui Services (`services.msc`) atau PowerShell:

```powershell
Get-Service -Name postgresql*
# Jika belum berjalan:
Start-Service -Name "postgresql-x64-18"
```

---

## 4. Penyiapan Environment Variables

### Backend (`Backend/.env`)
Salin file `.env.example` ke `.env`:

```powershell
cd Backend
Copy-Item .env.example .env
```

Pastikan isi `Backend/.env` sesuai konfigurasi PostgreSQL lokal Anda:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=asset_fumindo
PORT=3000
```

### Frontend (`frontend/.env`)
Salin file `.env.example` ke `.env`:

```powershell
cd ../frontend
Copy-Item .env.example .env
```

Isi `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 5. Menjalankan Backend NestJS

Buka terminal PowerShell pada direktori `Backend`:

```powershell
cd Backend

# Instal dependensi (jika belum)
npm install

# Build TypeScript
npm run build

# Menjalankan server dalam mode development
npm run start:dev

# Atau mode production
npm run start:prod
```

Server backend akan aktif di: **`http://localhost:3000`**

---

## 6. Menjalankan Frontend Vue.js

Buka terminal PowerShell baru pada direktori `frontend`:

```powershell
cd frontend

# Instal dependensi (jika belum)
npm install

# Menjalankan dev server Vite
npm run dev
```

Aplikasi frontend akan aktif di: **`http://localhost:5173`**

---

## 7. Daftar REST API Endpoints

| HTTP Method | Endpoint | Deskripsi | Status Code |
|---|---|---|---|
| `GET` | `/assets` | Mengambil seluruh data aset | `200 OK` |
| `GET` | `/assets/:id` | Mengambil detail aset berdasarkan ID | `200 OK` / `404 Not Found` |
| `POST` | `/assets` | Membuat aset baru | `201 Created` / `400 Bad Request` |
| `PATCH` | `/assets/:id` | Memperbarui field aset | `200 OK` / `404 Not Found` / `400 Bad Request` |
| `DELETE` | `/assets/:id` | Menghapus aset | `200 OK` / `404 Not Found` |

### Validasi Request:
- `asset_name`: Wajib diisi, string tidak boleh kosong.
- `stock_quantity`: Bilangan bulat (integer), nilai minimum `0`.
- `category`: Hanya menerima nilai `'Consumable'` atau `'Non-Consumable'`.
- `asset_id`: Otomatis di-generate oleh PostgreSQL database, tidak dapat diisi manual.

---

## 8. Panduan Menguji CRUD

### Melalui UI Web (Rekomendasi)
1. Buka browser dan arahkan ke `http://localhost:5173`.
2. **Lihat Data:** Seluruh aset di database akan langsung ditampilkan pada tabel.
3. **Tambah Aset:**
   - Klik tombol **"+ Tambah Asset"**.
   - Masukkan Nama Asset (misal: `Spidol Papan Tulis`), Jumlah Stok (`25`), dan pilih Kategori (`Consumable`).
   - Klik **"Simpan Asset"**. Data baru akan muncul pada tabel secara otomatis.
4. **Edit Aset:**
   - Klik tombol **"Edit"** pada baris aset yang diinginkan.
   - Ubah Nama, Stok, atau Kategori.
   - Klik **"Perbarui Asset"**.
5. **Hapus Aset:**
   - Klik tombol **"Hapus"** pada baris aset.
   - Konfirmasi pada modal popup. Aset akan dihapus dari database dan tabel diperbarui.

### Melalui PowerShell / cURL (API Testing)

```powershell
# 1. GET all assets
Invoke-RestMethod -Uri "http://localhost:3000/assets" -Method GET

# 2. GET asset by ID
Invoke-RestMethod -Uri "http://localhost:3000/assets/1" -Method GET

# 3. POST new asset
$body = @{ asset_name = "Kabel HDMI"; stock_quantity = 15; category = "Non-Consumable" } | ConvertTo-Json
$newAsset = Invoke-RestMethod -Uri "http://localhost:3000/assets" -Method POST -Body $body -ContentType "application/json"

# 4. PATCH asset
$patchBody = @{ stock_quantity = 20 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/assets/$($newAsset.asset_id)" -Method PATCH -Body $patchBody -ContentType "application/json"

# 5. DELETE asset
Invoke-RestMethod -Uri "http://localhost:3000/assets/$($newAsset.asset_id)" -Method DELETE
```

---

## 9. Cara Menghentikan Server

- Di terminal aktif: Tekan `Ctrl + C` lalu ketik `Y`.
- Atau melalui PowerShell:
```powershell
# Menghentikan proses yang mendengarkan port 3000 (Backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Menghentikan proses yang mendengarkan port 5173 (Frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```
