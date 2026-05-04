# Las Veraneras Menu

Digital trilingual menu for **Las Veraneras**, a tropical French-Tico bistro in Las Vueltas de Tucurrique, Costa Rica.

Built as a static, deployable restaurant site with Spanish/English/French content, colones pricing, WhatsApp cart checkout, dish detail panels, allergen/use-case filters, data-driven combos, richer restaurant/menu schema, and offline support.

## Validation

```bash
npm run check:all
```

The validator checks menu/config/combo JSON shape, translations, prices, image URLs, duplicate IDs, and combo item references.

## Password-only admin publishing

The admin panel now supports a token-free browser experience:

- admins sign in with a password only
- the real GitHub write token stays on a small backend service
- `admin.html` talks to that backend for publish, image upload, image listing, and image delete operations

The backend lives in `admin-api/`.

### Local setup

1. Fill in the root `.env` placeholders or create `admin-api/.env`
2. Start the API from `admin-api/`
3. Point the admin page to that API using either:
   - the one-time `Admin API URL` field on the login screen, or
   - `admin-config.js` for a deployed environment

### Important

- Keep `LV_GITHUB_TOKEN` and `LV_ADMIN_SESSION_SECRET` **server-side only**
- Set `LV_ADMIN_ALLOWED_ORIGIN` to the exact public origin of the admin page
- For production, use `LV_ADMIN_PASSWORD_HASH` instead of a plaintext password
