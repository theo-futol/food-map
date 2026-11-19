# MoumouneFood

A personal map of every restaurant, snack and hotel I've tried in La Réunion, with ratings, comments and souvenir photos.

## Features

- **Map**: Leaflet + OpenStreetMap, one coloured marker per place (🟠 restaurant, 🟡 snack, 🔵 hotel)
- **Filters**: by city and category. Filters are kept in the URL (`?city=Saint-Leu&cat=snack,hotel`), so a filtered view can be bookmarked.
- **Add / edit / delete places**: click the map or search an address ("Find on map", via Nominatim) to set the position
- **Move a place**: open its details, then drag its (highlighted) marker
- **Visits**: date, 1–5 stars, comment, and any number of souvenir photos (JPEG, PNG, WebP or GIF, 10 MB max each)
- **Initial data**: 53 places loaded from `db/seed.sql` on first start. Their positions are approximate (city centre + random offset) and shown with a dashed marker until moved.

## Quick start (Docker)

```bash
docker compose up -d --build
```

Open http://localhost:3000.

The PostgreSQL data lives in the Docker volume `food-db` and the photos in `food-data`, so both survive rebuilds and restarts.

> ⚠️ `docker compose down -v` deletes the volumes and **all your data**. Use plain `docker compose down` instead.

## Local development

Requires Node.js 22+ and a PostgreSQL server, e.g. the one from compose:

```bash
docker compose up -d db   # then expose it: add `ports: ["5432:5432"]` to the db service
export DATABASE_URL=postgres://food:food@localhost:5432/food
npm install
npm run dev      # http://localhost:3000
npm test         # validation tests
npm run build    # production build (also type-checks)
```

In development the photos are stored in `./data/uploads/` (git-ignored).

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | none (set in `docker-compose.yml`) | PostgreSQL connection string |
| `DATA_DIR` | `./data` (`/data` in Docker) | Where `uploads/` lives when Supabase Storage is not configured |
| `SUPABASE_URL` | none | e.g. `https://xyz.supabase.co`. When set, photos go to Supabase Storage instead of `DATA_DIR`. Required on Vercel, which has no persistent disk. |
| `SUPABASE_SERVICE_ROLE_KEY` | none | Supabase secret (service role) key, server-side only. Never expose it to the browser. |
| `PORT` | `3000` | HTTP port |
| `APP_PASSWORD` | none (required, set in `.env`) | The single password for the login page. If it is not set, nobody can log in. Changing it logs everyone out. |

## Photos

Photos are shrunk in the browser before upload: longest side 1600 px, re-encoded as WebP at 70% quality (JPEG on Safari, which can't encode WebP). This keeps each photo to a few hundred KB, under Vercel's 4.5 MB request limit, and removes EXIF metadata such as GPS position. The server rejects files over 2 MB.

On Vercel, photos are stored in a **private** Supabase Storage bucket named `photos` and served through `/api/photos/[id]`, behind the login. Create the bucket once (Storage → New bucket, keep it private), or run this in the Supabase SQL editor:

```sql
insert into storage.buckets (id, name, public) values ('photos', 'photos', false) on conflict do nothing;
```

## Backup and restore

```bash
# Backup
docker compose exec -T db pg_dump -U food --clean food > food-map-backup.sql
docker compose stop app
docker compose run --rm -T app tar -C /data -cf - . > food-map-photos.tar
docker compose start app

# Restore
docker compose exec -T db psql -U food food < food-map-backup.sql
docker compose stop app
docker compose run --rm -T app tar -C /data -xf - < food-map-photos.tar
docker compose start app
```

## Seed data

`db/seed.sql` holds the initial list of places. It runs **only when the `places` table is empty**, i.e. on the very first start. To change the starting list, edit the file before the first start. To re-seed later, delete the volume (this erases everything): `docker compose down -v && docker compose up -d --build`.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript): UI and API in one app
- [PostgreSQL](https://www.postgresql.org) via [node-postgres](https://node-postgres.com) with plain SQL, no ORM
- [Leaflet](https://leafletjs.com) via [react-leaflet](https://react-leaflet.js.org), OpenStreetMap tiles
- Docker multi-stage build with Next.js `standalone` output, running as a non-root user

## Project layout

```
app/
  page.tsx                     # entry page
  globals.css
  api/
    places/route.ts            # GET list, POST create
    places/[id]/route.ts       # GET detail, PATCH update, DELETE
    places/[id]/visits/route.ts# POST visit (multipart, with photos)
    visits/[id]/route.ts       # DELETE visit
    photos/[id]/route.ts       # GET photo file, DELETE photo
components/
  App.tsx                      # state, filters, panels
  Map.tsx                      # Leaflet map (client only)
  Filters.tsx                  # header bar
  PlaceForm.tsx                # add / edit place
  PlacePanel.tsx               # details, visits, photo upload
lib/
  db.ts                        # PostgreSQL pool, schema, seeding
  validate.ts                  # input validation (+ validate.test.ts)
db/
  schema.sql                   # tables, created on every start if missing
  seed.sql                     # initial places
Dockerfile
docker-compose.yml
PLAN.md                        # feature plan
```

## API

| Method | Route | Body | Purpose |
|---|---|---|---|
| GET | `/api/places` | | All places, with `avg_stars` and `visit_count` |
| POST | `/api/places` | JSON `{name, category, city, address?, lat, lng}` | Create a place |
| GET | `/api/places/:id` | | A place with its visits and photo ids |
| PATCH | `/api/places/:id` | JSON, any subset of the fields above | Update; changing `lat`/`lng` clears the approximate flag |
| DELETE | `/api/places/:id` | | Delete a place, its visits and photo files |
| POST | `/api/places/:id/visits` | multipart: `visited_on?`, `stars?`, `comment?`, `photos*` | Add a visit |
| DELETE | `/api/visits/:id` | | Delete a visit and its photos |
| GET | `/api/photos/:id` | | Serve a photo |
| DELETE | `/api/photos/:id` | | Delete one photo |

`category` is one of `restaurant`, `snack`, `hotel`. Errors return `{ "error": "..." }` with status 400 or 404.

## Data model

- `places`: name, category, city, address, lat/lng, `approx_position`
- `visits`: belongs to a place; date, stars (1–5, optional), comment
- `photos`: belongs to a visit; random filename in `uploads/`

Deleting a place cascades to its visits and photos. The schema is created at startup with `CREATE TABLE IF NOT EXISTS`, so there is no migration step.

## Limitations

- **No authentication.** Anyone who can reach the app can edit or delete data. Run it locally or on a private network only.
- Photos are stored as uploaded (no resizing or thumbnails).
- Address search uses the public Nominatim service, which is rate-limited and meant for light use.
