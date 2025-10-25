# Forum API

RESTful API untuk aplikasi forum diskusi yang dibangun menggunakan Node.js, Hapi.js, dan PostgreSQL dengan menerapkan Clean Architecture.

## ✨ Fitur

### User Management
- ✅ Registrasi user baru
- ✅ Login user
- ✅ Logout user
- ✅ Refresh token authentication

### Thread Management
- 🚧 Membuat thread baru
- 🚧 Melihat detail thread
- 🚧 Menambahkan komentar pada thread
- 🚧 Menghapus komentar

### Security
- ✅ Password hashing menggunakan bcrypt
- ✅ JWT-based authentication
- ✅ Access token & refresh token mechanism

## 🛠 Teknologi

- **Runtime**: Node.js
- **Framework**: Hapi.js v20.1.5
- **Database**: PostgreSQL
- **Authentication**: JWT (@hapi/jwt v2.0.1)
- **Password Hashing**: bcrypt v5.0.1
- **Testing**: Jest v27.0.6
- **Migration Tool**: node-pg-migrate v5.10.0
- **Dependency Injection**: instances-container v2.0.3
- **Linting**: ESLint v7.30.0 (Airbnb Style Guide)

## 📦 Prasyarat

Pastikan Anda telah menginstal:

- **Node.js** (versi 14.x atau lebih tinggi)
- **npm** atau **yarn**
- **PostgreSQL** (versi 12.x atau lebih tinggi)
- **Git**

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/msidiqh991/forum-api.git
   cd forum-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## ⚙️ Konfigurasi

1. **Buat file `.env`** di root project:
   ```env
   # HTTP SERVER
   HOST=localhost
   PORT=5000

   # POSTGRES
   PGHOST=localhost
   PGUSER=postgres
   PGDATABASE=forumapi
   PGPASSWORD=your_password
   PGPORT=5432

   # POSTGRES TEST
   PGHOST_TEST=localhost
   PGUSER_TEST=postgres
   PGDATABASE_TEST=forumapi_test
   PGPASSWORD_TEST=your_password
   PGPORT_TEST=5432

   # TOKENIZE
   ACCESS_TOKEN_KEY=your_access_token_secret_key
   REFRESH_TOKEN_KEY=your_refresh_token_secret_key
   ```

2. **Generate secret keys** untuk token (opsional):
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Salin output untuk `ACCESS_TOKEN_KEY` dan `REFRESH_TOKEN_KEY`.

3. **Buat database PostgreSQL**:
   ```bash
   # Development database
   createdb -U postgres forumapi

   # Test database
   createdb -U postgres forumapi_test
   ```

## 🧪 Testing

### Menjalankan semua test
```bash
npm test
```

### Watch mode (re-run saat ada perubahan)
```bash
npm run test:watch:change
```

### Watch mode dengan coverage
```bash
npm run test:watch
```

### Melihat test coverage
Setelah menjalankan test, buka file `coverage/lcov-report/index.html` di browser.

## 📁 Struktur Proyek

```
forum-api-starter-project/
├── migrations/                          # Database migrations
│   ├── 1627983516963_create-table-users.js
│   └── 1627983555473_create-table-authentications.js
├── src/
│   ├── Applications/                    # Application business logic
│   │   ├── security/                    # Security interfaces
│   │   │   ├── AuthenticationTokenManager.js
│   │   │   └── PasswordHash.js
│   │   └── use_case/                    # Use cases
│   │       ├── AddUserUseCase.js
│   │       ├── LoginUserUseCase.js
│   │       ├── LogoutUserUseCase.js
│   │       └── RefreshAuthenticationUseCase.js
│   ├── Commons/                         # Common utilities
│   │   └── exceptions/                  # Custom exceptions
│   │       ├── ClientError.js
│   │       ├── InvariantError.js
│   │       ├── NotFoundError.js
│   │       └── AuthenticationError.js
│   ├── Domains/                         # Domain entities & repositories
│   │   ├── authentications/
│   │   │   ├── AuthenticationRepository.js
│   │   │   └── entities/
│   │   │       └── NewAuth.js
│   │   └── users/
│   │       ├── UserRepository.js
│   │       └── entities/
│   │           ├── RegisterUser.js
│   │           ├── RegisteredUser.js
│   │           └── UserLogin.js
│   ├── Infrastructures/                 # External implementations
│   │   ├── container.js                 # Dependency injection container
│   │   ├── database/
│   │   │   └── postgres/
│   │   │       └── pool.js              # PostgreSQL connection pool
│   │   ├── http/
│   │   │   └── createServer.js          # Hapi server configuration
│   │   ├── repository/                  # Repository implementations
│   │   │   ├── UserRepositoryPostgres.js
│   │   │   └── AuthenticationRepositoryPostgres.js
│   │   └── security/                    # Security implementations
│   │       ├── BcryptPasswordHash.js
│   │       └── JwtTokenManager.js
│   ├── Interfaces/                      # HTTP interfaces
│   │   └── http/
│   │       └── api/
│   │           ├── authentications/
│   │           │   ├── handler.js
│   │           │   ├── routes.js
│   │           │   └── index.js
│   │           ├── users/
│   │           │   ├── handler.js
│   │           │   ├── routes.js
│   │           │   └── index.js
│   │           └── threads/             # 🚧 Work in progress
│   │               ├── handler.js
│   │               ├── routes.js
│   │               └── index.js
│   └── app.js                           # Application entry point
├── tests/                               # Test helpers
│   └── UsersTableTestHelper.js
├── config/
│   └── database/
│       └── test.json                    # Test database configuration
├── .env                                 # Environment variables
├── .env.example                         # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🏛️ Clean Architecture

Proyek ini mengimplementasikan Clean Architecture dengan pembagian layer sebagai berikut:

### 1. **Domains** (Entities)
- Layer paling dalam yang berisi business entities dan repository interfaces
- Tidak bergantung pada layer lain
- Contoh: `RegisterUser`, `UserRepository`

### 2. **Applications** (Use Cases)
- Berisi application business rules
- Mengorkestrasikan alur data dari dan ke entities
- Contoh: `AddUserUseCase`, `LoginUserUseCase`

### 3. **Infrastructures** (Frameworks & Drivers)
- Implementasi konkret dari interfaces di layer Domains
- Database, HTTP server, external libraries
- Contoh: `UserRepositoryPostgres`, `BcryptPasswordHash`

### 4. **Interfaces** (Interface Adapters)
- Mengadaptasi data dari use cases ke format yang sesuai untuk external agencies
- HTTP handlers, routes
- Contoh: `UsersHandler`, `AuthenticationsHandler`

### Dependency Rule
- Dependency hanya mengarah ke dalam (ke arah Domains)
- Inner layers tidak boleh tahu tentang outer layers
- Komunikasi antar layer menggunakan Dependency Injection

## 🔒 Security Features

- **Password Hashing**: Menggunakan bcrypt dengan salt rounds yang aman
- **JWT Authentication**: Access token untuk autentikasi dan refresh token untuk regenerasi
- **Token Expiration**: Access token memiliki masa berlaku terbatas
- **Refresh Token Storage**: Refresh token disimpan di database untuk validasi
- **SQL Injection Prevention**: Menggunakan parameterized queries


## 🐛 Troubleshooting

### Error: "relation does not exist"
Jalankan migrasi database:
```bash
npx node-pg-migrate up --database-url "postgres://postgres:password@localhost:5432/forumapi_test"
```

### Error: "Cannot read properties of undefined (reading 'refreshToken')"
Pastikan endpoint authentication mengembalikan response dengan struktur yang benar.

### Database connection error
Periksa konfigurasi di `.env` dan pastikan PostgreSQL sudah running.

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Coding Standards

- Menggunakan **ESLint** dengan Airbnb style guide
- Gunakan **camelCase** untuk variable dan function names
- Gunakan **PascalCase** untuk class names
- Tulis **unit tests** untuk setiap use case dan repository

## 👨‍💻 Author

Dikembangkan sebagai starter project untuk Forum API menggunakan Clean Architecture.

## 🙏 Acknowledgments

- [Dicoding Indonesia](https://www.dicoding.com/) - Untuk referensi pembelajaran
- [Hapi.js](https://hapi.dev/) - Framework yang powerful dan extensible
- Node.js Community - Untuk ecosystem yang luar biasa

---

**Status Proyek**: Work in Progress

**Last Updated**: October 2024