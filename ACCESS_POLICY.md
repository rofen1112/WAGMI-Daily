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

No account password is needed for public news reading. Remote administration remains unavailable. A frontend-only password is not a security control.

## AI laboratory public access extension (2026-11-06)

The user explicitly authorized anonymous AI laboratory use on the formal website. Only the production 8787 backend is available through the 8080 proxy, with signed visitor cookies, separate persistent stores and the GPT-6.1 Sol API workflow. Development projects, 8786, operator handoff endpoints, reference imports and admin controls remain private. The news data and static reports remain read-only. See [production boundaries](docs/ai-lab-production.md). The preceding policy continues to apply to the news and local admin runtimes.
