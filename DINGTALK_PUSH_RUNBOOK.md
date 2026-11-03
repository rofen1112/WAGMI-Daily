# DingTalk Daily Publication Runbook

This runbook is the source of truth for the daily main publication, DingTalk
digest, and 09:00 follow-up audit. Sites is a separate personal copy and is
never part of these automatic flows.

## Completion contract (user instruction, 2026-10-26)

Every discovered publication failure starts a repair-and-completion loop in
the same task. Diagnose the failed source/data/code/build/hosting/delivery
stage, perform the authorized repair, recheck that stage, and continue through
publication, full public verification, and the current day's single DingTalk
delivery. Do not finish merely with a diagnosis, a blocked gate, or a local
build. A failed preflight is actionable repair input, not a normal endpoint.

Use the normal sequence after repair: `ai:discovery:check`,
`data:validate-dev`, `data:daily:check`,
`data:daily:publish` when needed, `publication:deploy` when needed,
`publication:verify`, then `notify:dingtalk`. If dev/main are identical,
continue public verification and any still-missing delivery. Read source
frameworks and repair factual evidence rather than bypassing it. Treat
documented historical Skill notices through `skills-source-policy.mjs` while
retaining the real warning and historical records.

A daily batch is complete only when public data matches today's validated
main, DingTalk returns `errcode=0`, and `dingtalk-last-send.json` records that
Shanghai date. A same-day existing success or explicit user suppression is
the only normal reason to skip sending; content changes never authorize a
second automatic message. Do not backdate or fabricate successful records.

For transient failures, diagnose and retry with bounded backoff; repeated
attempts must follow the actual failure rather than blindly rebuild or resend.
If a send's outcome is uncertain, reconcile recorded evidence before retrying
to prevent duplicates. Stop short of completion only for explicit suppression
or a demonstrated external blocker outside existing authorization. Record the
failed stage, actual error, attempted repairs and results, and the smallest
external action needed. Carry that unfinished state into the next scheduled
audit; never describe it as a successful daily run.

## 1. Daily collection gate

1. Use the current Asia/Shanghai date for every freshness decision.
2. AI and GitHub must have today's `asOf`, the `07:30` schedule contract, and
   `run.status=success`.
3. Skill must have today's `asOf` and the `07:40` schedule contract. A successful
   run passes normally. A `skills-review-source-identities` historical warning
   may pass only through `scripts/skills-source-policy.mjs`: all five current
   sources and every current trend detail must pass; dated review evidence must
   account for the unresolved historical identities, whose last-seen dates are
   earlier and whose IDs do not overlap today's active shortlist. Preserve the
   original `warning`, historical entries, and publication notices. Missing or
   inconsistent evidence, current-source failures, and other warnings still block.
4. Check multiple official/original sources independently. Memene is an optional
   discovery and cross-check source: a missing same-day record, weekend pause,
   or unavailable page is a source-level notice and never a publication blocker
   by itself. Keep its actual source date; never relabel prior records. When
   available, use structured history/detail and the exact record-ID page.
5. GitHub official Trending daily/weekly rankings are required primary sources.
   OSS Insight failures are optional notices when required sources and all mandatory
   repository evidence pass. Missing current official sources, failed active searches
   and incomplete mandatory verification still block publication.
   GitHub discovery must start with `npm.cmd run github:discover`; use trend
   candidates, forced AI-report candidates, and industry priorities instead of
   scanning GitHub indiscriminately.
6. Skill discovery must verify the catalog pagination, `/trending`, and
   `/official` source states. Stale heat data is not a successful run.
7. Run `npm.cmd run ai:media:discover` on every collection and follow-up audit.
   Read the current `ai-media-sources.json` checklist, including 极客公园、
   数字生命卡兹克、量子位、橘鸦 Juya and 有新 Newin, and inspect the actual new
   articles in `ai-media-latest.json`, rather than only checking its exit code.
   Preserve article dates and record whether each source has a same-day push,
   only older articles, or an access/identity restriction. A public mirror or
   third-party RSS is a discovery route, not proof that all WeChat pushes were
   retrieved. A failed route must not be described as no new articles.
   Candidates need factual review of the actual article before acceptance.
   Verified Chinese media reporting and the creator's own original work are
   eligible: factual evidence may use `trusted_media` as well as official and
   research sources. Retain attribution and distinguish reporting, opinion,
   and reported rumors. Add verified Chinese reading links to `readingSources`
   alongside factual `sources`; an aggregator reading link cannot substitute
   for independent evidence. Prefer useful Chinese reading entrances where
   available, without labelling an English source as Chinese.
   Run `npm.cmd run ai:reconcile`, then `npm.cmd run data:validate-dev`.
   AI sourceStatus notices are advisory when current original-source coverage
   and the full daily report pass. Batch failures, stale channel dates, missing
   reports, unverified accepted events and other validation blockers still stop
   automatic publication.

After editorial/source reviews, run `node scripts/select-daily-paper-events.mjs`
and `npm.cmd run ai:reconcile` to bind the three catalog recommendations,
verified original evidence, JSON, and daily report. Write factual evidence to
`data/dev/ai-editorial-repairs-YYYY-MM-DD.json` in `verifiedSources`: each entry
needs url, actual checkedAt, success=true, verification=verified, sourceClass
(official/original_research/trusted_media), method, and the exact eventIds it
supports. HTTP success or a page title alone does not verify a claim. A quiet
day requires noNewEvents=true plus a current original review marked
discoveryChecked=true. The reconciler records optional source notices while
marking the overall AI batch successful only when this evidence is complete. The private
editorial manifest is date-specific; original publication dates stay unchanged.
GitHub HTML metadata uses structured counters and fails when counters are
missing. Never replace missing metrics with zero. The one-off
`--refresh-all --rebase-from-main` repairs the 2026-10-08 bad counter baseline;
normal runs retain their existing snapshot baseline and comparison interval.

## 1a. Mandatory candidate coverage and Chinese reading preflight

This is the standing daily workflow authorized on 2026-10-29. Apply it during
07:30 collection, before 08:30 publication, and again during the 09:00 and
12:00 audits. Existing schedules, source-fact checks, historical Skill notices
and once-per-day DingTalk delivery rules remain in force.

1. Refresh the sources independently with
   `npm.cmd run memene:discover -- --date=YYYY-MM-DD --days=7` and
   `npm.cmd run ai:media:discover -- --date=YYYY-MM-DD`. Read both snapshots,
   not just exit codes. Memene records the actual run date/time and source
   error on an unsuccessful request, archives earlier observations, and keeps
   an unavailable source distinct from no same-day record. A nonzero optional
   source command requires inspection of its recorded failure; it does not
   justify skipping the other source checks. Never overwrite today's
   checkpoint with a historical replay.
2. Run `npm.cmd run ai:discovery:prepare -- --date=YYYY-MM-DD`. Review the
   current `data/dev/ai-discovery-review-YYYY-MM-DD.json`, every actual Memene
   candidate and every candidate in `ai-media-latest.json`. All enabled media
   entrances must have dated checks, including blocked/partial results.
   Account title/identity and original article dates must be verified. Public
   mirrors may lag; no observed article is not proof that the account did not
   publish.
3. Give each candidate an importance, disposition, concrete reason, event IDs
   when covered/added/duplicated, and actual `checkedAt`. Inspect both today's
   accepted set and previously published events to avoid duplicate news.
   Do not hardcode a candidate count or automatically dismiss unfamiliar
   titles. New candidates and changed candidate fingerprints invalidate their
   old decisions. Unchanged candidates may retain their genuine prior
   same-day decision; do not relabel its review timestamp.
4. For important missing facts, read the original publisher/creator or trusted
   media article, preserve its date and attribution, add the verified event
   and `verifiedSources` to the current editorial manifest, then run
   `npm.cmd run ai:reconcile`. A known important verified omission must be
   added before publication. Pending claims must state the real attempted
   source/error and the smallest next verification action. Source outages,
   unsupported rumors and conflicting figures do not authorize fabrication.
5. Review every current event's Chinese reading access. Put an actually read,
   relevant Chinese article or specific aggregator section in `readingSources`
   while preserving factual `sources`. Prefer Chinese originals and useful
   Chinese explanation over an English-only destination. If none is found,
   record the actual checked sources/search result and reason in
   `readingReviews`; do not invent a translation link or treat an aggregator
   as independent evidence.
   Memene (`memene.cn`, `memenews.cn` and their subdomains) is an internal
   discovery/cross-check source and never a public reading entrance. Keep
   its original observations and historical evidence privately, and use
   `scripts/public-source-policy.mjs` for public JSON/report projections.
   Internal links cannot count as `provided` in `readingReviews`. Public
   accounts, creator Chinese articles (including 橘鸦 Juya) and official
   Chinese pages remain eligible. When no eligible entry was found, retain
   the actual source/search scope and result, not a Memene fallback.
6. Run `npm.cmd run ai:discovery:check -- --date=YYYY-MM-DD`. Resolve missing
   decisions, changed-content decisions, missing source checks and reading
   review gaps, then repeat the check. The actual result is saved in
   `data/dev/ai-discovery-audit-YYYY-MM-DD.json` and its latest checkpoint;
   the public comparison/coverage report is
   `reports/ai-discovery-audit-YYYY-MM-DD.md` with a `public/reports/` mirror.
   Explicit optional-source and properly documented unverified-claim notices
   remain visible. They do not weaken the factual acceptance gate.
7. Continue `data:validate-dev`, `data:daily:check`, publication when required,
   `publication:verify`, and the existing current-day send/duplicate rules.
   Do not finish on a repairable failed preflight or wait for the user to ask
   for missing stories. At a later audit, new source material starts this
   review loop again even if today's initial digest already succeeded; update
   the website after verification and retain the original send record.

## 2. Publish main

Run `npm.cmd run data:daily:publish`. It performs the strict three-channel gate
before writing main. If dev and main are semantically identical it exits as a
no-op; otherwise it updates `data/main` and the public data mirrors.

The active hosting mode is configured in `.env.publication.local`. Since
2026-09-30 the production origin is this Windows machine (`local` mode).
Run `npm.cmd run publication:deploy` to build and validate the local origin.
This does not mean the website is reachable from the Internet.

Then run `npm.cmd run publication:verify`, which reads the configured fixed
public URL's `/data/main/index.json` with cache disabled. Its AI, GitHub, and
Skill dates and main content counts must match the publication result. Do not
continue when deployment fails or the public response is stale or unreachable.
Record the distinct local and public states in `data/dev/publication-run.json`.
The fixed URL is `https://wagmii.cn`, connected and verified on 2026-09-30.
If its domain or tunnel becomes unavailable, retain the local publication and
report public verification as blocked. Do not upload to the expired CloudBase
service, create a temporary Quick Tunnel, or invent/replace the public URL.

## 3. Send once

Run `npm.cmd run notify:dingtalk` only after the collection and public checks
pass. The complete verified public report link must be the first prominent action
under the digest title. The digest must also contain the three-channel status,
one-sentence overview, and at most three hot-item titles. Do not include hot-item
summaries in the DingTalk message.

The scheduled workflow never uses `notify:dingtalk:run`, `--supplement`, or
`--force`. If a digest was already sent for the current date, keep the existing
send record and do not send a second message. Never print or return DingTalk
credentials.

Formal sends reserve `data/dev/dingtalk-send-YYYY-MM-DD.lock.json` atomically
before re-reading suppression and successful-send records. Concurrent runs
must not delete a reservation or bypass it. A completed receipt releases the
reservation; an interrupted request keeps its `request-started` marker because
delivery may already have happened. Reconcile the official response and local
receipt before recovery; never expire a reservation by age or blindly resend.
Reservations are date-specific and do not turn an older missed day into a new
day's batch. Same-day content changes update the website and skip another
automatic message.

## 4. Follow-up audit

At the follow-up audit, recheck whether priority sources published new
same-day material after the first collection. Update dev only for newly
verified content. Repeat section 1a, including Memene/media collection,
candidate coverage and Chinese reading review, then run `data:validate-dev`
and `data:daily:check`. The 12:00 fallback uses the same review loop.

- If dev and main are identical, do not rewrite main, but still verify the
  configured public `/data/main/index.json` date and `generatedAt`. Run
  `publication:check` for the local origin and `publication:verify` for public
  access. Rebuild via `publication:deploy` only when the local origin is stale.
  A failed domain or tunnel is an ingress issue, not a reason to rebuild repeatedly.
- If verified content was added and the strict gate passes, run
  `data:daily:publish`, run `publication:deploy`, then `publication:verify`.
- If the initial daily digest has not been sent, send it only after the public
  snapshot is current. Never send a second same-day digest from this audit.
- Never prepare or deploy Sites from either automatic workflow.

## 5. Manual operations

Manual dev edits may be published from the local Operations page after its
preflight. Manual publication does not trigger DingTalk.

The Operations page's `准备 Sites 更新` button builds and validates a separate
Sites package. It records a pending request but does not claim cloud deployment;
the authenticated Sites deployment is completed separately through Codex.

The previous CloudBase scripts remain available only as an explicitly selected
fallback. `cloudbase:deploy` is not part of automatic publication in local mode.

## 6. Date-specific send suppression

Before every send mode, the script reads `data/dev/dingtalk-send-control.json`.
A date in `suppressedDates` blocks all sends for that Asia/Shanghai calendar day,
including fallback, supplement and test sends. It does not create a sent record
and does not affect the next day. Add a date only when the user requests no send.
