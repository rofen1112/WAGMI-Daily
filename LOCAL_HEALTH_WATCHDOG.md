# ark.insight Local Health Watchdog

The watchdog keeps the local admin site, public main site, main data endpoint,
and configured public website monitored while this Windows user is signed in.

The public server also has a separate startup task installed by
`npm.cmd run server:install`; it serves the current built website before user
sign-in. The watchdog and Codex collection tasks still have their own login/app
requirements. In local publication mode recovery starts the local stack only
and does not attempt to restore the expired CloudBase site or create a tunnel.

## Runtime contract

- Windows task: `ark.insight Local Health Watchdog`
- Trigger: user sign-in
- Process mode: hidden, unlimited runtime, restart after failure
- Health endpoint: `http://127.0.0.1:43127/health`
- Liveness endpoint: `http://127.0.0.1:43127/live`
- Probe interval: 30 seconds
- Local probes always connect directly, even when a system proxy is configured.
- Remote probes refresh the system proxy each cycle and release replaced agents,
  including when the proxy is disabled after watchdog startup.
- Recovery cooldown: 60 seconds
- Public health: page and main data must pass three consecutive probes
- Public data must match local main generatedAt, channel dates and major counts;
  HTTP 200 with yesterday's data is degraded, not healthy.
- A cloud publication mismatch is reported for deployment recovery; restarting
  local servers cannot repair it and is not attempted for that mismatch.
- Paper freshness follows the discovery run status, including successful empty feeds.
- Local or supported Quick Tunnel recovery requires three consecutive failures.
- CloudBase or other hosted-site failures are reported, never routed to local
  tunnel recovery. This monitor does not authorize or perform cloud deployments.
- Log: `.tmp-local-watchdog.log`

Port `43127` is reserved only for the watchdog and binds to `127.0.0.1`. The
admin and public applications continue to use ports `5174` and `8080`.

## Commands

```powershell
npm.cmd run health:install
npm.cmd run status:local
npm.cmd run health:uninstall
```

The installer refuses to replace an unrelated process already using port
`43127`. The health response contains endpoint states and recovery history, but
never exposes the DingTalk webhook or signing secret.
