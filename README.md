# Food Map

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

The database and photos are stored in the Docker volume `food-data`, so they survive rebuilds and restarts.

> ⚠️ `docker compose down -v` deletes the volume and **all your data**. Use plain `docker compose down` instead.

## Local development

Requires Node.js 22+.

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # validation tests
npm run build    # production build (also type-checks)
```

In development the data is stored in `./data/` (git-ignored).

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `DATA_DIR` | `./data` (`/data` in Docker) | Where `food-map.db` and `uploads/` live |
| `PORT` | `3000` | HTTP port |

## Backup and restore

The app must be stopped so the SQLite files are consistent.

```bash
# Backup
docker compose stop
docker compose run --rm -T app tar -C /data -cf - . > food-map-backup.tar
docker compose start

# Restore
docker compose stop
docker compose run --rm -T app tar -C /data -xf - < food-map-backup.tar
docker compose start
```

## Seed data

`db/seed.sql` holds the initial list of places. It runs **only when the `places` table is empty**, i.e. on the very first start. To change the starting list, edit the file before the first start. To re-seed later, delete the volume (this erases everything): `docker compose down -v && docker compose up -d --build`.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript): UI and API in one app
- [SQLite](https://sqlite.org) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) with plain SQL, no ORM
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
  db.ts                        # SQLite connection, schema, seeding
  validate.ts                  # input validation (+ validate.test.ts)
db/
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
