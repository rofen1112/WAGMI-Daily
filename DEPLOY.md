# ark.insight deployment

## Active deployment: local Windows origin (2026-09-30)

The user selected this always-on computer as the public website origin after
the CloudBase service expired. `.env.publication.local` sets
`WAGMI_PUBLICATION_MODE=local`. The commands are:

```powershell
npm.cmd run publication:deploy
npm.cmd run publication:check
npm.cmd run publication:verify
```

`deploy` builds the visitor bundle and validates the local server;
`check` validates without rebuilding. `verify` additionally requires the fixed
public HTTPS URL to match local main, including dates and counts. Local success
does not imply public readiness. Records are stored separately in
`data/dev/publication-run.json`. The fixed public endpoint is
`https://wagmii.cn`, connected through the local named Cloudflare tunnel and
verified on 2026-09-30, including a mainland mobile-network check by the owner.
Each publication must still pass public verification before DingTalk can send.

The public static service can run at Windows startup under LocalService via
`npm.cmd run server:install`. See `LOCAL_SERVER.md` for installation, access
boundaries, recovery and domain handoff. The Codex data-collection automations
continue to run in this user's Codex app; installing the website service does
not turn those tasks into system services.

WAGMI Daily has two deliberately separate runtimes. The public runtime is a static, read-only `main` build. The local admin runtime merges `main` with `data/dev` and exposes review and publication controls.

## Current local topology

| Runtime | Address | Binding | Data | Access |
| --- | --- | --- | --- | --- |
| Local admin | `http://127.0.0.1:5174/` | localhost only | `dev` + `main` | local administrator |
| Public preview | `http://127.0.0.1:8080/` | `0.0.0.0` | `main` only | read-only visitor |
| Production origin | `http://127.0.0.1:8080/` | Local Windows static server | `main` only | read-only visitor |
| Fixed public website | `https://wagmii.cn` | Named Cloudflare tunnel to port `8080` | `main` only | anonymous read-only visitor |
| Previous public website | Existing CloudBase URL | Expired CloudBase service | previous uploaded `main` | unavailable |
| Personal sync site | `https://wagmi-daily.tamtambb414.chatgpt.site/` | OpenAI Sites | deployed `main` snapshot | owner reference |

Port `8080` is reachable from the same LAN by using `http://<computer-lan-ip>:8080/`. It is not an Internet URL by itself.

## Start and check

Start both runtimes and rebuild the public site:

```bash
npm run start:local
```

Skip the public rebuild when only restoring stopped processes:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-local.ps1 -SkipBuild
```

Check the two pages and the public data endpoint:

```bash
npm run status:local
```

Install the separate public startup task with `npm.cmd run server:install`.
`start:local` restores the signed-in admin and visitor stack. In local hosting
mode it does not create a temporary tunnel or try to recover CloudBase.

## Data and publication flow

1. AI daily collection writes `data/dev` at 07:30.
2. The Monday AI weekly job writes `data/dev` at 07:50.
3. GitHub Radar starts trend discovery at 07:30, then re-reads AI output and candidate decisions before writing `data/dev`.
4. Review candidates and preflight in the local admin pages.
5. Publish `dev` to `main` from `#/operations`; the operation validates data, creates a backup, writes atomically, and refreshes `public/` and `dist/client/` mirrors.
6. Port `8080` immediately serves the new `main` snapshot.
7. Run `npm run publication:deploy` to build and validate `dist/client` on the local production origin, then `npm run publication:verify` to verify the configured public website.
8. Redeploy the validated public build to Sites only when the personal copy should receive the new `main` snapshot.

Candidate decisions are stored in `data/dev/candidate-decisions.json`. Approved items are mandatory inputs for the next GitHub run, observed items remain in review, and rejected items stay excluded unless new evidence appears.

## Legacy Tencent CloudBase deployment (inactive fallback)

CloudBase is no longer the active public host. The following instructions are
retained only for an explicit future switch back. It receives only
`dist/client`, which contains the read-only `main` snapshot. The local admin
server, `data/dev`, candidate decisions and local reports are not uploaded.

Install the official CloudBase CLI and authorize the Tencent Cloud account:

```bash
npm install -g @cloudbase/cli
tcb login
```

Create a CloudBase environment and enable static website hosting in the Tencent Cloud console. Then create the ignored local configuration file:

```dotenv
CLOUDBASE_ENV_ID=your-environment-id
CLOUDBASE_PUBLIC_URL=https://insight.example.com
```

Preflight and deploy:

```bash
npm run cloudbase:check
npm run cloudbase:deploy
```

`CLOUDBASE_PUBLIC_URL` is optional before the custom domain is bound. Once configured, deployment also verifies the public page, JavaScript bundle and `main` data endpoints.

Use the CloudBase default domain until the ICP-filed custom domain is ready. Keep it as `WAGMI_PUBLIC_URL` so DingTalk links remain stable; replace it once with the verified custom HTTPS domain after备案.

## Other Internet URLs

The DingTalk report uses the verified `WAGMI_PUBLIC_URL` value. The stored legacy
CloudBase URL is not a valid fallback while that service is unavailable. Update
it only after the selected fixed domain routes to this machine's `8080` and
passes `publication:verify`. Do not use a temporary Quick Tunnel as the daily link.

The Sites address is retained as a personal synchronization copy. It contains only the `main` snapshot packaged at deployment time. Publishing from `#/operations` updates `main` and the Cloudflare origin immediately, but Sites must still be rebuilt and redeployed separately.

The DingTalk job must keep using a public URL that passes `npm run notify:dingtalk:check`. Do not switch it to Sites unless anonymous access has been verified from the intended visitor network.

Cloudflare Pages and Vercel remain optional fallback hosts:

Cloudflare Pages:

```bash
npm run deploy:cloudflare
```

Vercel:

```bash
npm run deploy:vercel
```

Both commands require an authenticated provider account. The local Quick Tunnel is now a fallback preview path only. Its address can change after a restart and should target only `8080`, never `5174`.

## Security boundary

- Public visitors do not need a password.
- Public builds contain no candidate queue, creator watchlist, publication controls, or admin navigation.
- Admin is bound to `127.0.0.1` and accepts local origins only.
- Remote administrator sign-in is not enabled; CloudBase and Sites host only the visitor build.
- Do not expose port `5174` through LAN forwarding, a tunnel, or public hosting.

See `ACCESS_POLICY.md` for the full boundary.
