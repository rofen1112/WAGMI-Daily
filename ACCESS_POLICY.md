# Access policy

## Public visitor mode

- Runtime: `npm run preview:public`
- Data track: `main`
- Pages: Today, AI Events, and GitHub Radar
- Access: read-only; no password prompt
- Hidden data: candidates, creator watchlist, and all `data/dev` files
- Hidden actions: candidate decisions, publication, and task operations

The public bundle is the only runtime that may be shared through LAN, a public tunnel, Cloudflare Pages, Vercel, or Netlify.

## Local administrator mode

- Runtime: `npm run dev:admin`
- Binding: `127.0.0.1` only
- Data track: merged `dev` and `main`
- Pages: public pages plus Watchlist and Operations
- Write actions: candidate decisions and validated `dev` to `main` publication

The admin endpoints require a local browser origin. They must not be exposed through a public tunnel.

## Authentication boundary

No account password is needed while all write operations remain localhost-only. Add server-side authentication only if remote administration becomes a requirement. A frontend-only password is not a security control.
