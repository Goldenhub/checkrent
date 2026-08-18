# checkRent

Crowdsourced spatial rent analytics web application. Explore rental cost data on an interactive map — crowdsourced, anonymized, and visualized for transparency.

## Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, shadcn/ui, MapLibre GL JS
- **Backend:** PostgreSQL + PostGIS, H3 hexagonal grid (app-layer via h3-js)
- **Geocoding:** Nominatim/OSM (server-side proxy)
- **Font:** Manrope

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL)

### Local Development

```bash
# Install dependencies
npm install

# Start PostgreSQL
docker compose up -d

# Open SQL editor and run schema + seed
psql $DATABASE_URL -f db/schema.sql
psql $DATABASE_URL -f db/seed.sql

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description | Local | Production (Supabase) |
|----------|-------------|-------|------------------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://rentmap:rentmap@localhost:5433/rentmap` | Supabase pooled URL (port 6543) |

---

## Deployment (Supabase + Vercel)

### 1. Set up Supabase Database

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project (choose a region close to your users)
3. Go to **Database → Extensions** and enable **PostGIS**
4. Go to **SQL Editor** and run `db/schema.sql`
5. Copy the **pooled connection string** (Settings → Database → Connection string → URI, port **6543**, mode **Transaction**)

### 2. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Vercel auto-detects Next.js — keep the default settings
3. Go to **Settings → Environment Variables** and add:
   - `DATABASE_URL` = your Supabase pooled connection string (from step 1)
4. Click **Deploy**

### 4. Verify

- Visit your Vercel URL
- Click on the map to check that stats load
- Submit a test rent entry

---

## Architecture

- **H3 Grid:** Hexagonal cells computed in Node.js via `h3-js`. No PostGIS H3 extension required.
- **Map:** MapLibre GL JS with CartoDB raster basemap (voyager).
- **Stats:** PostGIS spatial queries with IQR outlier filtering, confidence scoring, and breakdown by bedrooms/property type.
- **Submissions:** Anonymous rent submissions with rate limiting and H3 index precomputation.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Database

- **Schema:** `db/schema.sql`
- **Seed data:** `db/seed.sql` (81 realistic entries across NYC, SF, Chicago, Austin)
- **Local DB:** Docker Compose — PostGIS on port 5433, pgAdmin on port 5050
- **Production DB:** Supabase free plan (500 MB, PostGIS included)
