# AI Events Capture Framework

This framework separates the GitHub radar pipeline from the AI events pipeline.

## 1. Pipeline Boundary

### GitHub Radar

Repository-centric.

- Primary object: GitHub repository.
- Main signals: stars, forks, releases, commits, issues, README, demo, license, activity.
- Output: repository inventory, recommendation, risk, follow status.
- Discovery and popularity rules: follow `GITHUB_RADAR_FRAMEWORK.md`.

### AI Events

Object-centric and signal-centric.

- Primary objects: companies, labs, products, models, people, creators, events, papers, tutorials, product launches, funding events.
- Main signals: release, financing, partnership, demo, benchmark, creator traction, workflow usefulness, product direction, market change.
- Output: daily event feed, weekly trend report, core object watchlist, GitHub intake candidates.
- Rule: if an AI event mentions a GitHub project, SDK, CLI, model repo, paper code, or open-source tool, it must be passed into GitHub Radar as a forced intake candidate.

## 2. Core Attention Objects

AI events should not be broad news crawling. Each item should connect to at least one attention object.

The current seed list is maintained in:

- `ai博主清单.md`: human-readable source list.
- `ai-events-attention-sources.json`: structured source configuration used by the app and automation prompts.

### Object Types

1. Company / Lab
   - Examples: AI labs, AI product companies, CAD/AEC companies, 3D tool companies.

2. Product / Tool
   - Examples: AI design tool, AI coding tool, AI 3D generator, AI-CAD plugin, agent platform.

3. Model / Framework
   - Examples: world model, spatial model, coding model, multimodal model, 3D generation model.

4. Person / Creator / Channel
   - Examples: YouTube creators, technical bloggers, founders, researchers, product demo channels.

5. Event / Conference / Report
   - Examples: launch event, industry report, AI conference, funding announcement.

6. GitHub Bridge Object
   - Any repo, SDK, CLI, plugin, benchmark, demo project, or paper code mentioned by AI event sources.

7. Frontier Paper
   - A research paper connected to product direction, 3D/spatial intelligence, physical AI, design workflows, video, agents, or open-model engineering.
   - Follow `AI_PAPERS_CAPTURE_FRAMEWORK.md`; do not publish raw English abstracts or bulk conference lists.

## 3. Content Channels

### Tier 1: Official Sources

Highest authority. Always check first.

- Company blog
- Product changelog
- Docs / release notes
- Official YouTube channel
- Official GitHub organization
- Paper/project page

### Tier 2: Technical and Product Media

Use for context and comparison.

- Trusted technical media
- Industry media for CAD/AEC/interior design/3D
- Product Hunt / launch platforms
- Funding press releases
- Market reports

### Tier 3: Creator and Community Sources

Use for usefulness and traction.

- YouTube videos
- Technical blogs
- Newsletter posts
- X / LinkedIn public discussion
- Reddit / forum discussions

Creator signals should be marked as `official`, `followed`, or `observe_new`.

### Daily Aggregation References

Daily aggregation pages are core candidate-discovery inputs, but they are not authoritative sources.

- Optional discovery reference: Memene 每日AI history and detail records. Plan ID: `cm3y1uwk40004tcv987dja7le`.
- Run `npm.cmd run memene:discover -- --date={YYYY-MM-DD} --days=7` with the current Asia/Shanghai date before collecting daily events.
- The discovery command queries the Memene history and detail endpoints, writes `data/dev/memene-daily-latest.json`, and checks the current date plus the preceding six calendar days.
- Determine a report's date only from `historyRecords[].date` and the matching detail `data.date`. Never infer the date from a numeric daily ID, request time, URL date, or page title alone.
- The corresponding detail page is `https://memene.cn/daily/{historyRecord.id}?ref=website`. A date-shaped `/daily/YYYY-MM-DD` can return HTTP 200 with “内容未找到”; it is not a required primary source and must not invalidate matching successful history/detail records.
- Archive collection snapshots before replacing latest. Historical replay must not replace today's checkpoint. `npm.cmd run ai:reconcile` reconciles independently reviewed original-source evidence and generates report/JSON from one array; unreadable or unreviewed originals remain pending, not published.
- Extract candidate titles, categories, tracked entities, summaries, referenced source links, and official social posts from the exact-date detail record.
- Secondary cross-check: AI风向标 / Memene at `https://memene.cn/model/{YYYY-MM-DD}`. It may lag behind the date in its URL and must pass the same embedded-date check.
- If Memene has no current-date record (including the user-reported weekend publishing pause), record only this optional source as stale and retain its true prior source date. Continue official blogs, release notes, model announcements, papers and official repositories. A single discovery source never decides the overall batch status. Recheck late updates when useful; do not wait indefinitely or relabel stale items.
- Open and verify the original reference links before publication. Prefer official blogs, changelogs, documentation, paper/project pages, official GitHub repositories, or trusted media.
- Store Memene as a private discovery source when used, while retaining original verified factual links in `sources`. Memene (`memene.cn`, `memenews.cn` and their subdomains) is internal provenance, never a public navigation or Chinese reading entrance. Preserve original collection records and historical evidence privately; use `scripts/public-source-policy.mjs` for public JSON and report projections instead of removing private evidence.
- Do not publish an event supported only by an aggregator summary.
- Run `npm.cmd run ai:media:discover` on every collection and follow-up audit to check every enabled account in `ai-media-sources.json`. The standing Chinese reading/discovery list includes 极客公园、数字生命卡兹克（Rockhazix）、量子位、橘鸦Juya、有新Newin（NewinData）、新智元 and 机器之心. Use publisher/creator RSS first; verified public WeChat RSS mirrors retain the original WeChat article URL, explicit publication date and account identity. Never guess domains or bind a similarly named author without identity evidence.
- Chinese media and known public-account originals are valid reading and factual-review sources (user instruction, 2026-10-29); English official sources are not the only permitted inputs. Read the original article, date, author and supported claim before accepting `trusted_media` evidence. Prefer a readable Chinese `readingSources` link in the event alongside its factual evidence. A creator's first-person experiment may support that experiment, not an unqualified industry benchmark. Mark reporting, commentary, allegations and unannounced plans explicitly; cross-check official evidence when available. Public AI-assisted aggregation summaries, including 橘鸦早报 summaries, may remain discovery/Chinese reading links but are not stand-alone proof of a claim. Memene remains private discovery only and cannot satisfy public Chinese reading coverage.
- RSS mirrors are public supplemental access, not authenticated WeChat access. Check expected feed title and fixed WeChat `__biz` identity where configured. Save real per-source `checkedAt`, latest source date, `sameDayCandidateCount` and `sameDayStatus`; no same-day item observed in a mirror does not establish that the account did not publish. Preserve late-mirror and inaccessible-source notices. Captcha/login/empty/unparseable/wrong-account sources keep their own partial/blocked/failed status while other sources continue. Never use feed-build time, request time, relative labels or a URL's date to relabel an article as today's push.
- Before reconciliation, write `data/dev/ai-editorial-repairs-YYYY-MM-DD.json` with current `verifiedSources` reviews: url, actual checkedAt, success=true, verification=verified, sourceClass (official/original_research/trusted_media), method, contentExcerpt and supported eventIds. Read the facts and original date; HTTP 200/title alone is insufficient.
- Optional source failures are retained in sourceStatus/run.sourceWarnings and in the report. A current AI batch can be success when accepted events have original factual reviews and the report/JSON agree. Zero-news days require an explicit noNewEvents review of original sources (discoveryChecked=true), never an empty failed response.
- Generate report files under reports/ and public/reports/ as well as data/dev snapshots. Normal reconciliation does not rerun date-specific historical recovery.

### Required daily coverage review (2026-10-29)

Source collection and factual verification of selected events do not alone
establish that important news was covered. Every 07:30 collection, 08:30
publication preflight and 09:00/12:00 follow-up performs the coverage loop in
`DINGTALK_PUSH_RUNBOOK.md` section 1a:

- Refresh Memene and all enabled Chinese media/public-account entrances on
  every run. Save actual dated source checks even when an optional source is
  unavailable. The Memene collector preserves previous observations under
  `data/dev/source-archives/memene-observations/` before replacing a checkpoint;
  failed requests produce `target:null`, a failed source status and the real
  error, never a successful empty candidate list. Historical replay cannot
  replace today's checkpoint.
- Run `npm.cmd run ai:discovery:prepare -- --date=YYYY-MM-DD` and maintain
  `data/dev/ai-discovery-review-YYYY-MM-DD.json`. Review all current Memene
  candidates and all media snapshot candidates, rather than only the few
  already chosen for the report. The record stores per-candidate importance,
  disposition (`covered`, `added`, `duplicate`, `pending`, `out_of_scope`),
  concrete reason, actual review time, candidate content fingerprint and
  linked event identities where applicable. `needs_review` is an unfinished
  state, not a publishable decision. Candidate count varies by source/day;
  22 was only the 2026-10-29 example.
- Review novelty against both today's events and the historical published
  set. A repeated story may point to its earlier verified event; it must not
  be rewritten as a new occurrence. Changed or newly discovered content
  requires a fresh decision; unchanged same-day content may keep its genuine
  existing review timestamp. Neither script success nor title similarity
  alone proves that a candidate is covered.
- Important verified omissions must be read, added with original facts/date
  and source evidence, then reconciled into the report and JSON. Pending
  candidates require actual source attempts/errors and a next verification
  step. High-importance items must not be dismissed as out of scope just to
  pass. Keep conflicting figures, rumors and inaccessible originals pending
  with attribution and evidence limits rather than manufacturing certainty.
- For every current event, `readingReviews` records a real relevant Chinese
  link present in `readingSources`/`sources`, or the actual checks and reason
  why none was found. Prefer public-account/creator Chinese originals,
  explanation and official Chinese pages. A specific public 橘鸦 reading
  section may aid reading but does not replace independent factual evidence;
  known English destinations are not labelled Chinese. Internal Memene links
  never count as `provided`. Record the actual checked source/search scope
  and reason when no public Chinese reading entry was found.
- Run `npm.cmd run ai:discovery:check -- --date=YYYY-MM-DD` before the existing
  daily publish gate. It records the actual dated private audit and public
  `ai-discovery-audit-YYYY-MM-DD.md` report. Missing decisions/checks, changed
  candidate content and undocumented Chinese reading gaps require repair in
  the same task. A genuine optional-source outage remains a source notice,
  not grounds to pause an otherwise complete independently verified batch.
- Reconcile additions, validate, publish, verify the fixed public site and
  complete the day's single delivery as required by the runbook. Later audits
  update verified website content and retain the original successful daily
  DingTalk send record. This is standing authorized work, not a step waiting
  for another manual reminder.

### Open Model Release Sources

- Treat Hugging Face Models, model trees, and official publisher organizations
  as a first-class discovery source for generative and multimodal model
  releases.
- Review trending and recently updated models in image generation/editing,
  video, 3D/3DGS, world models, spatial intelligence, design, and physical AI.
- A model-hub page is a discovery and metadata source, not proof that a model is
  fully open source. Verify the exact publisher, upstream model, license,
  public or gated access, intended use, paper, and original runtime repository.
- Write approved records to `model-industry-watchlist.json`. Pass related
  official or original code repositories into GitHub Radar as forced intake.
- Use `MODEL_RADAR_FRAMEWORK.md` for the open-source versus open-weight,
  official versus community, quality, and safety classification rules.

## 4. Target Boards

Each event should belong to one or more boards:

- Financing / Investment
- AI Product / Model Launch
- AI Agent
- AI Security / Governance
- AI Coding
- AI 3D / World Models
- AI-CAD / AEC
- Interior Design AI
- Workflow / Tutorial / Usage Tips
- YouTube / Creator Watch
- Market / Business Model
- Frontier Paper / Research

## 5. Signal Types

Each captured item should identify its strongest signal:

- Product launch
- Feature update
- Funding / acquisition
- Partnership / ecosystem move
- Model release
- Paper / benchmark
- Demo / tutorial
- High-traction creator content
- GitHub project mention
- Market report
- Pricing / API / business change

## 6. Scoring

AI event priority should be scored before display.

### Suggested Score Fields

- Relevance: does it match our target domains?
- Authority: official source, trusted media, or creator/community only?
- Recency: how new is it?
- Actionability: can we test, follow, integrate, or compare it?
- Novelty: is this genuinely new or just repeated commentary?
- GitHub bridge: does it produce a repo/project candidate?
- Business impact: does it affect product direction, customer need, workflow, or strategy?

### Priority Levels

- `A`: must read, must track, likely affects project direction.
- `B`: worth watching, may produce future candidate projects.
- `C`: archive only, useful context but low actionability.
- `Noise`: ignore or suppress.

## 7. Watchlist Lifecycle

Attention objects should have a lifecycle:

1. `candidate`
   - Newly discovered object.
   - Not enough evidence yet.

2. `observe_new`
   - One strong signal or several weak signals.
   - Continue watching.

3. `followed`
   - Repeatedly relevant, high-signal, or useful.
   - Included in daily checks.

4. `core`
   - Must-watch object.
   - Included in every daily and weekly scan.

5. `downgraded`
   - Low relevance for several cycles.

6. `archived`
   - Kept for historical reference only.

## 8. Daily Output Format

Daily AI events should output:

- Exact event date. A daily item must stay bound to that calendar date and must never be relabeled to fill a newer day.
- Chinese event title. Brand names and model names may remain in English, but a fully English title is forbidden.
- Chinese summary, importance judgment, and action recommendation. Translate English source material before writing the event payload.
- Board
- Source type
- Source links
- Involved objects
- Why it matters
- Action recommendation
- GitHub forced intake candidates
- Priority
- Whether it should appear in weekly report

Before daily editorial selection, run `npm.cmd run papers:discover` and then `npm.cmd run papers:catalog`. Use `data/dev/ai-papers-latest.json` only for discovery and scoring; use the cumulative `data/dev/papers-catalog.json` for reading queues, GitHub evidence links and daily recommendations. Deep-read at most the configured daily budget and merge no more than three qualified paper events into the same AI daily report. Daily paper events must come from `dailyRecommendations`, have completed Chinese interpretation, use `contentKind: "paper"`, include structured `paper` metadata, and contain both `Frontier Paper / Research` and a relevant domain board.

`scripts/data-contract.mjs` enforces the Chinese reader-facing fields during daily validation and main publication. Use `npm.cmd run ai:localize` only for audited historical corrections; new collection runs must produce Chinese directly.

## 9. Weekly Output Format

Weekly AI events should output:

- A `wagmi-ai-2` run record in `data/dev/ai-weekly-latest.json`, including the schedule, status, last successful time, report path, and a concise result summary.

- Top trends
- Board statistics
- Repeated companies/products/models/creators
- New core/followed/observe objects
- Downgraded objects
- GitHub forced intake summary
- Recommended next actions

## 10. User Input Needed

The next step is to provide attention directions in this structure:

```text
1. Must-watch companies/labs/products:

2. Must-watch domains:

3. Must-watch creators/channels:

4. Topics to prioritize:

5. Topics to suppress as noise:

6. Output style preference:
   - short daily digest
   - detailed daily report
   - weekly strategy report
   - project-intake-first report

7. Decision criteria:
   - what makes an event worth reading?
   - what makes a GitHub candidate worth intake?
```

## 11. Practical Rule

AI Events should answer:

> What changed in the AI world that affects our product direction, technical options, workflow, or GitHub project intake?

If an event cannot answer this, it should be downgraded or excluded.
