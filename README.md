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
- Docker (for PostgreSQL)

### Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL
docker compose up -d

# Run database migrations
psql $DATABASE_URL -f db/schema.sql
psql $DATABASE_URL -f db/seed.sql

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

- **Schema:** `db/schema.sql`
- **Seed data:** `db/seed.sql` (81 realistic entries across NYC, SF, Chicago, Austin)
- **Docker Compose:** PostGIS on port 5433, pgAdmin on port 5050

### Environment Variables

Copy `.env.example` to `.env.local` and update:

```
DATABASE_URL=postgresql://rentmap:rentmap@localhost:5433/rentmap
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check |

## Architecture

- **H3 Grid:** Hexagonal cells computed in Node.js via `h3-js`. No PostGIS H3 extension required.
- **Map:** MapLibre GL JS with CartoDB raster basemap (voyager).
- **Stats:** PostGIS spatial queries with IQR outlier filtering, confidence scoring, and breakdown by bedrooms/property type.
- **Submissions:** Anonymous rent submissions with rate limiting and H3 index precomputation.
