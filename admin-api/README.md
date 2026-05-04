# Las Veraneras Admin API

Tiny password-based admin API that keeps the GitHub write token on the server instead of in each browser.

## What it does

- accepts **password-only** admin logins
- stores the session in an `HttpOnly` cookie
- writes `data/*.json` changes to GitHub
- uploads and deletes files under `images/`
- lists repo-hosted images for the photo library tab

## Environment variables

You can set these in `admin-api/.env` or in the project-root `.env` for local development:

- `LV_ADMIN_PASSWORD` or `LV_ADMIN_PASSWORD_HASH`
- `LV_ADMIN_SESSION_SECRET`
- `LV_ADMIN_SESSION_TTL_HOURS`
- `LV_ADMIN_ALLOWED_ORIGIN`
- `LV_GITHUB_TOKEN`
- `LV_GITHUB_OWNER`
- `LV_GITHUB_REPO`
- `LV_GITHUB_BRANCH`
- `LV_PUBLIC_SITE_BASE`

## Local run

```bash
cd admin-api
npm start
```

The API listens on `http://localhost:8787` by default.

## Password hashing

For production, prefer a hash over a plaintext password:

```bash
cd admin-api
npm run hash:password -- Pierre
```

Then set the printed value as `LV_ADMIN_PASSWORD_HASH` and remove `LV_ADMIN_PASSWORD`.

## Routes

- `GET /api/health`
- `GET /api/session`
- `POST /api/session/login`
- `POST /api/session/logout`
- `POST /api/publish`
- `GET /api/images`
- `POST /api/images`
- `DELETE /api/images`

## Deployment notes

This service is intended to be deployed separately from GitHub Pages on any Node host (for example Railway, Render, Fly.io, or a small VPS).

Important bits:

- set `LV_ADMIN_ALLOWED_ORIGIN` to the exact public admin origin
- keep `LV_GITHUB_TOKEN` and `LV_ADMIN_SESSION_SECRET` only on the server
- when the admin site is on HTTPS and the API is on another origin, the cookie is sent as `SameSite=None; Secure`
