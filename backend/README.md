# QuickWish backend (Express API)

The API is deployed separately from the Next.js storefront. The storefront is
served at `https://www.quickwish.shop` (Vercel) and this API is expected at
`https://api.quickwish.shop`.

## Local development

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, SECRET, QUICKWISH_UPI_ID, ...
npm run dev
```

The server refuses to start without `SECRET`, `MONGO_URI` and a valid UPI
configuration.

## Production build and start

```bash
npm ci
npm run build     # tsc -> dist/
npm start         # node dist/index.js, binds to $PORT
```

`PORT` comes from the host. `docs/connector.openapi.json` must be present next
to `dist/`; the Dockerfile and the repository layout both satisfy this.

Health probe: `GET /api/v1/health`.

MCP discovery, OAuth, plugin packaging and backend-only deployment:
[Auth0 MCP resource-server guide](docs/auth0-mcp.md).

## Deployment

Any Node host works. The two shortest paths:

### Render

- New → Web Service → this repository
- **Root Directory:** `backend`
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/v1/health`
- Add the environment variables from `.env.example`, then add the custom domain
  `api.quickwish.shop`.

### Railway

- New Project → Deploy from repo
- **Root Directory:** `backend`
- Build `npm ci && npm run build`, Start `npm start` (Railway injects `PORT`)
- Settings → Networking → Custom Domain → `api.quickwish.shop`

### Docker (any container host)

```bash
docker build -t quickwish-api backend
docker run --rm -p 5000:5000 --env-file backend/.env quickwish-api
```

## DNS for api.quickwish.shop

1. Create a `CNAME` record: `api` → the hostname provided by the platform
   (for example `quickwish-api.onrender.com` or `quickwish-api.up.railway.app`).
2. Wait for DNS propagation, then add the domain in the platform dashboard so it
   issues a TLS certificate for `api.quickwish.shop`.
3. Confirm HTTPS works: `curl -s https://api.quickwish.shop/api/v1/health`.

## Verifying a deployment

```bash
# Public docs (no key required) — must be 200 JSON and list the production server
curl -s https://api.quickwish.shop/api/v1/connector/openapi.json | head -c 200

# Protected route without a key — must be 401 CONNECTOR_UNAUTHENTICATED
curl -s -o /dev/null -w "%{http_code}\n" https://api.quickwish.shop/api/v1/connector/products

# Protected route with a connector key
curl -s -H "Authorization: Bearer $CONNECTOR_KEY" \
  https://api.quickwish.shop/api/v1/connector/categories
```

## Notes

- Connector keys are sent as `Authorization: Bearer <key>` or `X-API-Key: <key>`
  and are stored as SHA-256 hashes in `CONNECTOR_API_KEYS`.
- The storefront calls this API cross-origin with cookies, so `www.quickwish.shop`
  is in the CORS allow-list. Add extra origins via `CORS_ALLOWED_ORIGINS`.
