# SafeLease

**SafeLease** helps renters **see a clearer picture before they sign**, starting with **Norfolk, Virginia**. The product surfaces **community-reported** signals—anonymous issue reports (optional photo), **resident pulse** votes, and **lease / management snapshot** context on each property—and combines them into a **composite risk-style score** (weighted issues × severity) you can iterate on as the model improves.

The web app uses a **neighborhood hub** layout: feed, listings, map, and sidebar stats. A separate **Expo** client targets phones via Expo Go.

Deployments may still ship with **sample or seeded data** for development and onboarding; treat scores and copy as **informational**, not legal or investment advice. Always read your lease, inspect the unit, and verify what matters to you in person.

## What’s in the repo

| Area | Stack | Role |
|------|--------|------|
| `backend/` | Django 5 + Django REST Framework, SQLite | Models, API, `seed_demo` command, CORS |
| `frontend/` | Vite 5 + React + React Router | Hub UI, property detail, report/pulse forms, mock map fallback |
| `mobile/` | Expo (SDK ~55) + TypeScript | List + detail against the same API |

## Backend setup

From the repository root (or `backend/` as noted):

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r ../requirements.txt
python manage.py migrate
python manage.py seed_demo    # optional: add --clear to reset demo rows
python manage.py runserver 0.0.0.0:8000
```

For a **phone on the same Wi‑Fi**, set `DJANGO_ALLOWED_HOSTS` to your Mac’s LAN IP and use that host in the mobile app’s API URL (see `mobile/src/api.ts`).

## Web frontend setup

```bash
cd frontend
npm install
npm run dev
```

By default the dev server proxies `/api` to `http://127.0.0.1:8000` (see `vite.config.js`). If Django runs on another host or port, set `VITE_API_URL` (for example in `.env.local`) to your API base, e.g. `http://127.0.0.1:8000/api`.

If the API is unreachable, the UI falls back to embedded **Norfolk sample listings** so the hub and map still work offline from the backend.

**Node:** use a current LTS (e.g. **20.x or 22.x**). Older Node versions may not run this Vite toolchain.

## Mobile (Expo)

```bash
cd mobile
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` to your machine’s reachable API URL when testing on a physical device (see comments in `mobile/src/api.ts`).

## Map attribution

The static basemap tiles used in the web mock map are from **OpenStreetMap** contributors. See the in-app link to [OpenStreetMap copyright](https://www.openstreetmap.org/copyright).

## API overview (high level)

- `GET /api/properties/` — list (optional `search` query)
- `GET /api/properties/<id>/` — detail with reports, pulses, lease snapshot fields
- `POST /api/reports/` — create report (JSON or multipart with image)
- `POST /api/pulses/` — resident pulse vote

Exact routes match `backend/api/urls.py`.

## License

See the `LICENSE` file in this repository (as on the default GitHub branch).
