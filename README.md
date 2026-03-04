# Roomify - Floor Plan to Photorealistic 3D

Transform 2D floor plans into photorealistic renders using AI. React client + Node.js backend + Neon (PostgreSQL).

## Setup

### 1. Database (Neon)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string

### 2. OpenAI

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Models used: `gpt-4o` (vision/analysis), `gpt-image-1.5` (image-to-image)

### 3. Server

```bash
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL and OPENAI_API_KEY
npm install
npx prisma migrate deploy   # or: npx prisma db push
npm run dev
```

### 4. Client

```bash
cd client
npm install
npm run dev
```

### 5. Run both (from root)

```bash
npm install
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001

## Project structure

- `client/` - React SPA (Vite, Tailwind)
- `server/` - Node.js + Express + Prisma + Neon
