# Chat Services

Aplikasi Chat sederhana - Tugas Teknologi Sistem Terintegrasi

Created by Mudzaki Kaarzaqiel Hakim - 18223024

## Struktur Folder

```
chat-services/
├── chat-frontend/          # Source code Frontend (HTML, CSS, JS)
│   ├── index.html          # Halaman utama chat
│   ├── login.html          # Halaman login & register
│   ├── script.js           # Logic frontend (API calls, UI handling)
│   └── style.css           # Styling halaman
│
├── src/                    # Source code Backend (TypeScript)
│   ├── app.ts              # Entry point aplikasi Express
│   ├── routes.ts           # Definisi semua API routes
│   │
│   ├── domain/             # Domain layer
│   │   └── types.ts        # Type definitions (User, Message, dll)
│   │
│   ├── infrastructure/     # Infrastructure layer
│   │   └── db.ts           # Database handler (LowDB - JSON file)
│   │
│   ├── services/           # Business logic layer
│   │   ├── AuthService.ts  # Logic autentikasi (register, login, password)
│   │   └── ChatService.ts  # Logic chat (send message, get history)
│   │
│   └── swagger/            # API Documentation
│       └── swagger.ts      # Konfigurasi Swagger UI
│
├── data/                   # Database folder (JSON files)
├── Dockerfile              # Docker configuration
├── package.json            # Dependencies & scripts
└── tsconfig.json           # TypeScript configuration
```

## Cara Menjalankan

### Development (Lokal)
```bash
npm install
npm run dev
```

### Production (Docker)
```bash
docker build -t chat-service:v1 .
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data chat-service:v1
```

## Endpoints

| URL | Keterangan |
|-----|------------|
| `/` | Redirect ke halaman login |
| `/login.html` | Halaman login & register |
| `/index.html` | Halaman utama chat |
| `/api-docs` | Swagger UI - Dokumentasi API |
| `/api-docs.json` | OpenAPI spec dalam format JSON |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/change-password` - Ganti password

### Friends
- `POST /api/friends/add` - Tambah teman
- `GET /api/friends/:userId` - Ambil daftar teman

### Chat
- `POST /api/chat/send` - Kirim pesan
- `GET /api/chat/history` - Ambil history chat

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Database:** LowDB (JSON file-based)
- **Documentation:** Swagger UI
- **Deployment:** Docker
