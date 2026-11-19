# Food Map — Plan

A personal map (La Réunion) of every place I've eaten at, with filters, ratings, comments and souvenir photos.

## Stack

- **Next.js** (App Router, TypeScript): UI and API route handlers in one app
- **PostgreSQL** via `pg` with raw SQL. No ORM.
- **Leaflet** via `react-leaflet` with OpenStreetMap tiles (free, no API key)
- **Docker**: multi-stage build with Next.js `output: "standalone"`. A `postgres` service holds the data (volume `food-db`); a named volume mounted at `/data` holds the photos.

## Features

### 1. Map
- Full-screen Leaflet map centred on La Réunion
- One marker per place, with a colour/icon per category (restaurant / snack / hotel)
- Clicking a marker opens a popup showing the name, category, city, average stars and a "Details" link

### 2. Filters
- **City**: dropdown built from the cities in the DB
- **Category**: toggles for `restaurant`, `snack`, `hotel` (several can be on at once)
- Filters apply client-side on the loaded list and are stored in the URL query string so a filtered view can be shared or bookmarked
- A counter shows how many places are visible

### 3. Add / edit a place
- "Add place" button, then click the map to set the position (or type an address and use Nominatim geocoding)
- Form fields: name, category, city (pick an existing one or type a new one), optional address
- Edit any field, drag the marker to fix its position, delete the place (asks for confirmation)

### 4. Visits: comments, stars, photos
- Place detail panel: info, list of visits, photo gallery
- Add a visit with a date, 1–5 stars, a comment and 0..n souvenir photos
- The place rating is the average of its visits' stars
- Photos are uploaded to `/data/uploads`, limited to images up to 10 MB, and served by a route handler
- Delete a visit or a single photo

### 5. Initial data import
- The list from `README.md` is written as plain SQL in `db/seed.sql` (53 places). Edit that file to fix names, categories or cities before the first start.
- On startup, `lib/db.ts` runs `db/seed.sql` once, only when the `places` table is empty
- Positions are approximate: each place gets its city centre plus a random offset of up to about 500 m so markers don't stack. They can be fixed later by dragging (feature 3). Seeded places are flagged `approx_position = 1` and shown with a dashed marker until moved.
- Assumed categories (all editable later):
  - **snack**: McDo, OTacos, Brioche Dorée, Choose and Eat, Sergio Burger, Mamzelle Pizza, Pizza Uno, Pizza Nlove, Vidda Pizza, LGM (Leroy Merlin), Géant, Coco Canelle
  - **hotel**: Diana Dea Lodge, Palmerais, Boucan Canot
  - **restaurant**: everything else
- "Mcdo : sainte marie" and "Leroy merlin : lgm : sainte marie" go under the city **Sainte-Marie**

## Data model

```sql
CREATE TABLE places (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('restaurant','snack','hotel')),
  city TEXT NOT NULL,
  address TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  approx_position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE visits (
  id INTEGER PRIMARY KEY,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  visited_on TEXT,
  stars INTEGER CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE photos (
  id INTEGER PRIMARY KEY,
  visit_id INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

The schema is applied at startup with `CREATE TABLE IF NOT EXISTS`, so no migration tool is needed.

## API (route handlers)

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/places` | List places with their average stars |
| POST | `/api/places` | Create a place |
| GET | `/api/places/:id` | Get a place with its visits and photos |
| PATCH | `/api/places/:id` | Update a place (fields or position) |
| DELETE | `/api/places/:id` | Delete a place, its visits and its photo files |
| POST | `/api/places/:id/visits` | Add a visit (multipart form: stars, comment, date, photos) |
| DELETE | `/api/visits/:id` | Delete a visit and its photos |
| DELETE | `/api/photos/:id` | Delete one photo |
| GET | `/api/photos/:id` | Serve a photo file |

All input is validated on the server: category enum, stars from 1 to 5, lat/lng ranges, image MIME type and size. Uploaded files get random filenames, never the client's filename.

## Project layout

```
app/
  page.tsx              # map + filters + side panel
  api/...               # route handlers above
components/
  Map.tsx               # react-leaflet, loaded with dynamic(ssr:false)
  Filters.tsx
  PlaceForm.tsx
  PlacePanel.tsx        # details, visits, photo upload
lib/
  db.ts                 # pg pool, schema, runs seed.sql on an empty DB
db/
  seed.sql              # initial places from README
Dockerfile
docker-compose.yml      # one service, named volume food-data:/data, port 3000
```

## Docker

- `docker compose up -d --build` builds the image and starts the app on `http://localhost:3000`
- Build stage: `node:22-alpine`
- Runtime stage: standalone output plus `db/seed.sql`, runs as a non-root user, `DATA_DIR=/data`
- PostgreSQL in the `db` service (volume `food-db`), photos in `/data/uploads/`, in the named volume `food-data` (a named volume avoids root-owned bind mounts on Linux). Backup and restore commands are in the README.

## Out of scope (for now)

- Authentication: single-user app meant to run locally or on a private network
- Multiple users, sharing, social features
- Exact geocoding of the seeded places (they're fixed by hand by dragging the markers)
- Image resizing/thumbnails

## Implementation order

1. Next.js scaffold, `lib/db.ts`, schema
2. Load `db/seed.sql` on an empty DB
3. Map with markers and filters
4. Add/edit/delete place
5. Visits with stars, comments and photo upload
6. Dockerfile + compose, then check that data survives a restart
