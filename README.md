# Asset Management CRUD

A simple full-stack asset management application built with **PostgreSQL, NestJS, and Vue.js** to manage inventory data through CRUD operations.

## Tech Stack

- **Database:** PostgreSQL
- **Backend:** NestJS, TypeScript, TypeORM
- **Frontend:** Vue.js 3, Vite, CSS
- **API:** RESTful API

## Features

- Add new assets
- View asset inventory
- Edit asset information
- Delete assets
- Input validation and asset categorization

## Getting Started

**1. Database**

Set up PostgreSQL with database `asset_fumindo` and table `asset` containing `asset_id`, `asset_name`, `stock_quantity`, and `category`.

**2. Backend**

```bash
cd Backend
npm install
npm run start:dev
```

Configure `Backend/.env` using `.env.example` and your local PostgreSQL credentials before starting.

Backend: `http://localhost:3000`

**3. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Configure `frontend/.env` using `.env.example` if needed.

Frontend: `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/assets` | Get all assets |
| GET | `/assets/:id` | Get asset by ID |
| POST | `/assets` | Create asset |
| PATCH | `/assets/:id` | Update asset |
| DELETE | `/assets/:id` | Delete asset |

---

**Project:** Full-Stack Asset Management CRUD using PostgreSQL, NestJS, and Vue.js.
