# ark.insight project instructions

## Daily publication and delivery

The user explicitly authorized this completion standard on 2026-10-26:
whenever publication fails, diagnose and repair it, finish publishing the
current Shanghai-day report, verify the public website, and complete that
day's DingTalk delivery. A diagnosis, `blocked` record, successful local
build, or published website alone does not complete an unsent daily batch.

Read `DINGTALK_PUSH_RUNBOOK.md` and the applicable collection frameworks.
Continue the same task through repair, validation, publication, public
verification, and delivery; do not wait for another user request to fix a
routine recoverable failure. Repair source collection, data, scripts,
builds, and already-authorized local hosting as appropriate. Recheck the
failed stage after each targeted change, then continue downstream. Preserve
real source dates and factual evidence, and run relevant regression checks.

Use `scripts/skills-source-policy.mjs` to distinguish documented historical
Skill maintenance notices from failures affecting today's verified content.
Do not erase warnings, manufacture evidence, relabel stale data, remove
historical records, or weaken required factual/source checks to obtain a pass.

Completion requires today's channel dates and a successful complete
`publication:verify`, plus a real DingTalk success response and today's
`dingtalk-last-send.json`. Read the suppression and send records before
sending: a user-suppressed day is an explicit exception, and an already
successful day must not be sent again, even when content changes. Never use
automatic `--supplement`, `--force`, or connection-test messages. Do not send
older missed days as though they were today's report.

Only stop short of delivery for a demonstrated external blocker that cannot
be repaired within existing authorization, or an explicit user suppression.
For external blockers, record the exact failed stage, actual errors,
attempted repairs and results, and the smallest required user/external action.
Keep recovery state for the next scheduled audit. Never claim completion
without successful publication and delivery evidence.

## Daily editorial coverage and Chinese reading (2026-10-29)

Every 07:30 AI collection, 08:30 publication preflight, 09:00 audit and 12:00
fallback audit must check the actual current Memene record and every enabled
Chinese media/public-account entry in `ai-media-sources.json`. Run
`memene:discover` and `ai:media:discover` independently, inspect their dated
observations, then run `ai:discovery:prepare`. A source's genuine failed check
is different from not checking it. Retain real optional-source failures and
continue independent sources; never use an old checkpoint as today's check.

Review every current Memene candidate and every candidate in the media
snapshot; the count is whatever the source returns, not a hardcoded 22.
Maintain `data/dev/ai-discovery-review-YYYY-MM-DD.json` with importance,
disposition, concrete reason, linked event IDs and actual review time. Added
or changed candidates require new review; a matching content fingerprint may
reuse the existing same-day decision without inventing a fresh review time.
Read original facts for important omissions, repair the current editorial
manifest and source evidence, then reconcile. Do not mark an important
verified omission irrelevant or pending merely to obtain a pass. Unconfirmed
items retain actual attempted sources/errors and the next verification step.

Prioritize real Chinese reading links in `readingSources` alongside factual
`sources`. For each current event, record either the available Chinese entry
or the concrete search/check result explaining why none was found. Aggregator
reading links cannot replace independent factual evidence; English source
labels must not pretend that the destination is Chinese.

Memene and its `memene.cn` / `memenews.cn` subdomains are internal discovery
and cross-check sources, not public reading resources. Retain their original
observations, provenance and historical evidence privately; exclude their
links from public navigation, event reading links, JSON and report mirrors
through `scripts/public-source-policy.mjs`. An internal link never satisfies
a `readingReviews` result of `provided`. Prefer verified public-account or
creator Chinese articles and official Chinese pages. Public sources such as
橘鸦 Juya remain eligible even when used for discovery. When no public Chinese
entry was found, record the actual checked sources/search scope and reason
instead of substituting Memene or inventing a Chinese destination.

Run `ai:discovery:check` before the normal daily publication gate. Missing
candidate decisions, important verified omissions, missing account checks,
changed candidate content and undocumented reading gaps must be repaired in
the same task. The dated audit and public report must reflect the actual
review. Continue through publication, public verification and the existing
once-per-day delivery contract; no extra user reminder is required.

## AI laboratory development boundary

As of 2026-11-06 the user explicitly authorized merging codex/ai-lab into main and publishing the AI laboratory for all visitors, using the existing GPT-6.1 Sol API on this computer. Preserve and push recent news before integration; never replace main news with the development worktree's older snapshot. Main owns production publication. Keep 5186/8786 and their private data local; production uses the isolated 8787 backend through the existing 8080 public server. Follow docs/ai-lab-production.md. Daily collection and DingTalk remain a separate dated workflow; a code deployment must not relabel old news or trigger an extra daily send.
