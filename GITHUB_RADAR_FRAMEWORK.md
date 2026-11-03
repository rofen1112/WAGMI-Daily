# GitHub Radar Framework

GitHub Radar is a trend-driven discovery and verification pipeline. It must not
scan a manually maintained universe of repositories every day.

## 1. Daily schedule

- AI daily collection: every day at 07:30.
- GitHub trend discovery and radar: every day at 07:30.
- On Monday, AI weekly synthesis remains at 07:50.
- The AI daily and GitHub jobs are independent at startup. Before GitHub writes
  its final artifact, it re-reads the AI daily file and waits until 07:55 when
  necessary so same-day repository mentions can enter the candidate queue.

## 2. Discovery sources

Run `npm.cmd run github:discover` before reviewing repositories. It writes
`data/dev/github-trend-candidates.json` from the following source classes:

1. Official GitHub Trending daily rankings for all languages, Python, and TypeScript.
2. Official GitHub Trending weekly ranking as a stability signal; OSS Insight is an optional, quality-checked cross-check source.
3. GitHub repository search for active AI, LLM, agent, and fast-growing new
   repositories.
4. AI daily/weekly forced candidates and the existing tracked inventory.
5. Priority-domain GitHub searches covering architecture/AEC, interior design,
   3D and 3DGS, AI-assisted design tools, and newly released open-weight or
   open-source model projects.
6. `github-industry-watchlist.json`, the AI-approved core inventory that must be
   refreshed even when a repository has no daily heat signal.

Official GitHub Trending supplies the required trend discovery. OSS Insight can add event-based signals only when its metric is available. The installed GitHub
connector/MCP and official repository metadata are the verification layer.
Neither source is sufficient alone.

### Upstream quality and recovery (2026-10-08 audit)

- HTTP 200 with `data_quality.status=unavailable` is not a successful empty OSS
  ranking. Preserve its quality payload and reason.
- Use official GitHub Trending daily all-language/Python/TypeScript and weekly
  rankings as required primary sources. Record actual `github-trending-*` source
  IDs, official URLs, checkedAt, metric periods and counts. Keep OSS Insight
  failures and data-quality explanations as optional source notices, including
  existing `upstream` diagnostics. Never invent OSS activity scores from GitHub rankings.
- `npm.cmd run github:discover -- --retry-failed` retries failed endpoints while
  retaining same-day successful source evidence. Never reuse previous dates.
- Verify all retained surging/hot and AI-forced candidates, not only twelve hot
  candidates. Failed required active sources block publication despite a success label.

## 3. Hotness definition

Popularity is momentum plus quality, not accumulated Stars alone.

The discovery score combines:

- Stars and activity recorded in the last 24 hours.
- Star changes between local daily snapshots.
- Multiple independent trend-source hits.
- Repository age and recent pushes.
- AI relevance and same-day AI report mentions.
- Penalties for archived, stale, list-like, or low-information repositories.

Classification:

- `surging`: top 5 in the all-language 24-hour trend, at least 50 Stars in 24
  hours, at least 100 observed snapshot growth, or a repository younger than 30
  days that already has at least 500 Stars.
- `hot`: top 20 in the all-language 24-hour trend, top 5 in the Python or
  TypeScript 24-hour trend, at least 15 Stars in 24 hours, at least 20 observed
  snapshot growth, a recently pushed top-10 GitHub search result, or a strong
  AI-forced candidate that also appears in an external trend source.
- `watch`: relevant but not yet above the hot threshold.

These thresholds generate a review order. They do not determine whether a
project is eligible for the main inventory. After scoring, at most 24
non-surging repositories remain in the daily `hot` review queue; lower-ranked
matches move to the rotating `watch` queue. Up to 100 new qualified discovery
candidates are retained each day. Priority-domain searches inspect up to 50
results per query and use a 45-day activity window so low-heat research releases
are not lost. A relevant and original project may be admitted without any heat
signal.

## 3.1 Industry intake priority

The following directions are `P0` and must be reviewed before generic hot
repositories, even when their Stars and trend deltas are low or zero:

- Architecture design, AEC, BIM, CAD, Revit, IFC, floor-plan generation, and
  computational/parametric building design.
- Interior design, room layout, space planning, furniture layout, and related
  generative workflows.
- 3D generation, reconstruction, NeRF, point clouds, meshes, world models,
  3DGS/4DGS, and Gaussian Splatting.
- AI-assisted design tools, generative design, product/UI/UX/graphic design
  systems, and design automation.
- Newly released open-source or open-weight models, model weights,
  checkpoints, inference projects, and official engineering repositories.

Heat affects reading and verification order only. It is never a required field
for `P0`, AI-forced, or otherwise clearly industry-aligned candidates.

## 4. Verification and quality gate

Prefer the GitHub connector/MCP for every `surging` and `hot` candidate and
every AI-forced candidate. If the connector is unavailable in an automation
context, use official GitHub repository pages, search results, commit feeds,
Issues, Pull Requests, Releases, and repository metadata as the fallback.
Connector unavailability alone is not a warning when every mandatory
repository and required evidence field is verified through those official
surfaces. Verify:

- Exact `owner/repo`, ownership, archived/fork status, license, and official
  relationship.
- Current Stars and forks, recent commits, releases, issue/PR activity, README,
  demo, and installability.
- Whether attention reflects a real product/research release rather than a
  copied list, giveaway, spam campaign, or temporary controversy.
- Whether the repository contains original implementation or research value.
  Forks, mirrors, copied demo repositories, resource lists, thin wrappers, and
  tutorial-only copies are rejected unless the AI review finds specific,
  verifiable original work.

The discovery surface runs every day across all configured sources. Metadata
refresh uses priority tiers so API limits cannot hide sudden growth:

- Every tracked `surging`, `hot`, or AI-forced repository is refreshed first.
- Up to 25 additional formal projects with the oldest metadata are refreshed
  in a rotating long-tail batch.
- A targeted `--repo=owner/name` refresh is available for immediate checks.
- `--refresh-all` remains available when authenticated API capacity permits.

Formal projects outside the daily batch remain in the inventory; they are not
deleted or treated as current metadata. `watch` candidates are rotated for
verification instead of all being fully re-audited every day.

## 5. Intake decisions

- AI daily/weekly repository mentions are mandatory candidates, even when they
  are not present in trend sources.
- The AI model makes the final intake decision after GitHub metadata and README
  verification. Each decision must record `industryFit`, `priorityDomains`,
  `originality`, `maintenanceEvidence`, `intakeDecision`, and
  `decisionReason`.
- Approve a repository when it is directionally relevant, original, usable,
  and sufficiently maintained or officially released. Do not require heat.
- After approving an exact repository, add its review record to
  `github-industry-watchlist.json`, then run `npm.cmd run github:sync-industry`
  so official GitHub metadata and daily star deltas are refreshed in
  `data/dev/github-radar-latest.json`.
- Reject arbitrary copies, forks without meaningful changes, copied showcases,
  spam, empty shells, and unrelated repositories even if they are trending.
- `candidate-decisions.json` remains authoritative: `approved` is verified
  first, `observe` remains in evidence collection, and `rejected` stays out
  unless new official evidence appears.
- A trend signal can promote a candidate to review; it cannot bypass source,
  quality, security, or usefulness checks.
- Do not guess unresolved project names into GitHub URLs.

## 6. Failure behavior

- When both the official GitHub repository API and canonical repository page confirm HTTP 404/410, retain the historical project and its last available metrics, set `trackingStatus=delisted`, and record `delistedAt` using the current Asia/Shanghai date. A confirmed delisting is a lifecycle state, not a daily collection failure, and must not block unrelated repositories, publication, deployment, or notification.
- Delisted projects remain visible as historical records, are excluded from normal active refresh and hot-signal calculations, and may be reactivated only after a targeted official-page check confirms that the repository is public again. Reactivation clears the delisted marker; it does not erase history.
- Required-source timeouts, DNS failures, HTTP 403/429, incomplete fallbacks, and ambiguous repository moves remain warnings. Optional OSS Insight failures remain source-level notices. Never guess a replacement repository or treat a cached search listing as proof that a repository is active.

- Mark the run as `warning` when the connector is unavailable and the official
  GitHub fallback cannot fully verify any mandatory repository or a required
  evidence field. Record the verification mode either way.
- If all external trend sources fail, do not replace the candidate list with a
  local-only scan and do not report success.
- If any required official Trending ranking is missing, stale, empty because parsing
  failed, or unavailable, mark the GitHub run as `warning` even when repository
  search or OSS Insight succeeds.
- An unavailable optional OSS Insight metric alone must not mark the overall run
  warning or block publication. Preserve its true source status and diagnostics.
- All retained surging/hot and AI-forced repositories must have exact, current
  official-page evidence for accessibility, README, commits, Issues, PRs and
  Releases. Missing mandatory evidence, failed active searches and tracked metadata
  refresh failures still block; a success label or summary count cannot override this.
- Both finalization commands use the same reviewer and source policy; promotion
  independently validates source URLs, current dates and mandatory repository evidence.
- Record each source status and candidate reason in the report so later audits
  can explain why a repository was reviewed.
