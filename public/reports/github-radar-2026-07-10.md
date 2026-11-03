# WAGMI GitHub Radar - 2026-07-10

Run time: 2026-07-10 07:38:48 +08:00

Recovery status:

- Same-day files `reports/github-radar-2026-07-10.md` and `public/reports/github-radar-2026-07-10.md` were missing at run start.
- `C:\Users\Administrator\.codex\automations\wagmi-github\memory.md` did not contain a completed `2026-07-10` record.
- Per recovery rule, this run re-executed the full radar collection instead of doing a duplicate no-op check.

Scope:

- Re-check followed projects in the app inventory.
- Refresh the main watched repos for stars, forks, recent commits, releases, issue activity, README touchpoints, and demo/homepage status.
- Process every forced-ingest GitHub name carried by the latest AI daily report and the June weekly summary.

## Followed Projects Status

Current app inventory still includes placeholder URLs under `github.com/example/...`, so these cannot be treated as real tracked repos.

| Project | Repo in app | 2026-07-10 status | Recommendation impact | Risk |
| --- | --- | --- | --- | --- |
| RoomAgent Studio | `github.com/example/room-agent-studio` | Not a real verified repo | Keep `待核验` | Placeholder stats are unusable |
| SplatMap Viewer | `github.com/example/splatmap-viewer` | Not a real verified repo | Keep `待核验` | Placeholder stats are unusable |
| Designer CLI | `github.com/example/designer-cli` | Not a real verified repo | Keep `待核验` | Placeholder stats are unusable |
| Agent Runtime Kit | `github.com/example/agent-runtime-kit` | Not a real verified repo | Keep `待核验` | Placeholder stats are unusable |

## Watched Repo Changes Since 2026-07-09

| Repo | Stars / Forks | Recent commit / release | Issue activity | README / Demo change | Level change | Risk note |
| --- | --- | --- | --- | --- | --- | --- |
| [github/copilot-cli](https://github.com/github/copilot-cli) | `10,927 / 1,740`; up from `10,924 / 1.7k+` | Push `2026-07-09`; new release [`v1.0.70-0`](https://github.com/github/copilot-cli/releases/tag/v1.0.70-0) on `2026-07-09` | Open issues `1,849`, back up from `1,816` in the prior report | README touchpoint still `2026-02-25`; no homepage/demo field | `A` -> `A+` | Official and shipping fast, but support noise is high |
| [github/copilot-sdk](https://github.com/github/copilot-sdk) | `9,496 / 1,297`; up from `9,491 / 1.3k` | Push `2026-07-09`; new release [`v1.0.7-preview.0`](https://github.com/github/copilot-sdk/releases/tag/v1.0.7-preview.0) on `2026-07-09` | Open issues `238`, up from `192` in the prior report | README touchpoint still `2026-07-01`; no homepage/demo field | `A+` stays | Strongest coding-agent infra signal, but preview cadence implies API churn |
| [google-antigravity/antigravity-cli](https://github.com/google-antigravity/antigravity-cli) | `1,536 / 116`; up from app baseline `1,517 / 115` | Push `2026-07-08`; latest release [`1.1.0`](https://github.com/google-antigravity/antigravity-cli/releases/tag/1.1.0) on `2026-07-08` | Open issues `458` | README touchpoint still `2026-06-07`; no homepage field | `A` stays | Large issue surface for a young product line |
| [mira-wm/mira](https://github.com/mira-wm/mira) | `338 / 16`; up from `299 / 16` | Push `2026-07-06`; release [`v1.0`](https://github.com/mira-wm/mira/releases/tag/v1.0) on `2026-07-05` | Open issues `1` | README changed `2026-07-06`; homepage remains [mira-wm.com](https://mira-wm.com/) | `B+` stays | Early momentum is real, but the maintainer/community surface is still tiny |
| [alibaba-damo-academy/RynnWorld-4D](https://github.com/alibaba-damo-academy/RynnWorld-4D) | `36 / 2`; up from `27 / 2` | Push `2026-07-08`; no release | Open issues `1` | README changed `2026-07-08`; no demo/homepage field | `B` stays | Fresh and credible, but still research-stage |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | `137,072 / 22,042`; up from `136,929 / 22k` | Push `2026-07-09`; latest release [`v2.1.205`](https://github.com/anthropics/claude-code/releases/tag/v2.1.205) on `2026-07-08` | Open issues `10,815` | README touchpoint still `2026-01-12`; homepage stays [code.claude.com/docs/en/overview](https://code.claude.com/docs/en/overview) | `A` stays | Extremely high operational noise; do not equate issue volume with weakness |
| [meshy-dev/meshy-3d-agent](https://github.com/meshy-dev/meshy-3d-agent) | `47 / 7`; up from `46 / 7` | Last push `2026-06-24`; latest release [`v0.4.0`](https://github.com/meshy-dev/meshy-3d-agent/releases/tag/v0.4.0) on `2026-06-24` | Open issues `1` | README touchpoint still `2026-06-24`; no homepage/demo field | `B` stays | Official but still too early for promotion |
| [VAST-AI-Research/TripoSR](https://github.com/VAST-AI-Research/TripoSR) | `6,705 / 857`; up from `6,702 / 857` | Last push still `2026-06-04`; no release | Open issues `102` | README touchpoint still `2026-06-04`; no homepage/demo field | `B` stays | Good anchor repo, but code freshness is weak |
| [VAST-AI-Research/UniRig](https://github.com/VAST-AI-Research/UniRig) | `1,643 / 157`; up from `1,642 / 156` | Last push still `2026-06-04`; no release | Open issues `28` | README touchpoint still `2026-06-04`; homepage stays [zjp-shadow.github.io/works/UniRig/](https://zjp-shadow.github.io/works/UniRig/) | `B` stays | Useful workflow relevance, still no packaging/release discipline |

## Today's Search Additions

These are the most relevant newly confirmed or newly added repos from today's forced-candidate pass.

| Repo | Why add now | Initial level |
| --- | --- | --- |
| [alibaba-damo-academy/RynnWorld-Teleop](https://github.com/alibaba-damo-academy/RynnWorld-Teleop) | Official DAMO companion repo to `RynnWorld-4D`; public code confirms teleoperation angle from the AI daily | `B` |
| [AlayaLab/AlayaWorld](https://github.com/AlayaLab/AlayaWorld) | Official playable-world framework repo; stronger than paper-only world-model drops | `B` |
| [a2aproject/A2A](https://github.com/a2aproject/A2A) | Exact public repo confirmed for the June A2A standard signal | `A` |
| [google/adk-python](https://github.com/google/adk-python) | Exact official Google ADK repo confirmed; fresh release `v2.4.0` on `2026-07-07` | `A` |
| [google/adk-samples](https://github.com/google/adk-samples) | Official ADK sample repo; useful companion inventory for implementation tracking | `B+` |
| [genkit-ai/genkit](https://github.com/genkit-ai/genkit) | Exact Genkit repo confirmed; still active in July | `B+` |
| [github/agentfinder-catalog](https://github.com/github/agentfinder-catalog) | Exact public repo confirmed for Copilot Agent Finder catalog | `B` |
| [ards-project/ard-spec](https://github.com/ards-project/ard-spec) | Exact repo confirmed for ARD specification work | `B` |
| [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | Exact official repo confirmed for the `NVIDIA Cosmos 3` signal; release `Cosmos3` exists | `A` |
| [amazon-science/SWE-PolyBench](https://github.com/amazon-science/SWE-PolyBench) | Exact repo URL confirmed from search results during the eval-benchmark pass | `B` |
| [RUCKBReasoning/SpreadsheetBench](https://github.com/RUCKBReasoning/SpreadsheetBench) | Exact repo URL confirmed from search results during the eval-benchmark pass | `B` |

## Forced Candidate Verification

Every GitHub name marked as forced from the latest AI daily report or the June weekly summary appears below.

| Candidate name | Repo URL verification result | Recommendation | Notes |
| --- | --- | --- | --- |
| `github/copilot-cli` / `Copilot CLI` | Confirmed: [github/copilot-cli](https://github.com/github/copilot-cli) | `A+` | New `v1.0.70-0` release on `2026-07-09` |
| `github/copilot-sdk` | Confirmed: [github/copilot-sdk](https://github.com/github/copilot-sdk) | `A+` | New preview release and fresh push on `2026-07-09` |
| `Copilot cloud agent` | No exact standalone public repo confirmed | `待核验` | Product capability; keep related official surfaces as context only |
| `The Kotlin Benchmark` | No exact official GitHub repo confirmed in this run | `待核验` | Official surface is [kotlinlang.org/benchmark](https://kotlinlang.org/benchmark/); search results were generic or mismatched |
| `SWE-Lancer Diamond` | No exact public repo confirmed in this run | `待核验` | Keep as benchmark name until an owner/repo is confirmed |
| `SWE-PolyBench` | Confirmed from search results: [amazon-science/SWE-PolyBench](https://github.com/amazon-science/SWE-PolyBench) | `B` | Exact URL confirmed after API limit fallback |
| `DesignArena` | No exact official repo confirmed in this run | `待核验` | Search results were low-signal mirrors or wrappers, not an official source |
| `SpreadsheetBench` | Confirmed from search results: [RUCKBReasoning/SpreadsheetBench](https://github.com/RUCKBReasoning/SpreadsheetBench) | `B` | Exact URL confirmed after API limit fallback |
| `alibaba-damo-academy/RynnWorld-4D` | Confirmed: [alibaba-damo-academy/RynnWorld-4D](https://github.com/alibaba-damo-academy/RynnWorld-4D) | `B` | Strong research-to-repo signal with fresh README commit |
| `alibaba-damo-academy/RynnWorld-Teleop` | Confirmed: [alibaba-damo-academy/RynnWorld-Teleop](https://github.com/alibaba-damo-academy/RynnWorld-Teleop) | `B` | Companion teleoperation repo, very early but real |
| `AlayaLab/AlayaWorld` | Confirmed: [AlayaLab/AlayaWorld](https://github.com/AlayaLab/AlayaWorld) | `B` | Full-stack playable-world framing is stronger than a single model repo |
| `Antigravity CLI` | Confirmed: [google-antigravity/antigravity-cli](https://github.com/google-antigravity/antigravity-cli) | `A` | Official Google CLI anchor repo |
| `A2A` | Confirmed: [a2aproject/A2A](https://github.com/a2aproject/A2A) | `A` | Large and active protocol repo |
| `Agent Development Kit` | Confirmed primary repo: [google/adk-python](https://github.com/google/adk-python); companion: [google/adk-samples](https://github.com/google/adk-samples) | `A` / `B+` | Treat `adk-python` as the main official anchor |
| `Genkit` | Confirmed: [genkit-ai/genkit](https://github.com/genkit-ai/genkit) | `B+` | Exact framework repo exists and is active |
| `Agent Finder` | Confirmed related official catalog repo: [github/agentfinder-catalog](https://github.com/github/agentfinder-catalog) | `B` | Exact product UI repo is not exposed, but the public catalog repo is real |
| `ARD specification` | Confirmed: [ards-project/ard-spec](https://github.com/ards-project/ard-spec) | `B` | Spec repo exists and is active enough to track |
| `NVIDIA Cosmos 3` | Confirmed: [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | `A` | Official repo and `Cosmos3` release map cleanly to the weekly signal |
| `physical AI agent skills` | No exact standalone repo confirmed | `待核验` | Use [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) as related official context only |
| `Cosmos Coalition` | No public exact repo confirmed | `待核验` | Ecosystem/program name rather than repo name |
| `VRING:ON` | No exact public repo confirmed | `待核验` | Product launch signal, not repo-confirmed |
| `design-to-manufacturing agent` | No exact public repo confirmed | `待核验` | Theme-level name, not an exact repo |

## Recommendation Changes

| Item | 2026-07-09 | 2026-07-10 | Reason |
| --- | --- | --- | --- |
| `github/copilot-cli` | `A` | `A+` | Fresh `2026-07-09` release plus same-day code push |
| `alibaba-damo-academy/RynnWorld-Teleop` | not tracked | `B` | New exact repo confirmed from the AI daily |
| `AlayaLab/AlayaWorld` | not tracked | `B` | New exact repo confirmed from the AI daily |
| `A2A` | pending from weekly queue | `A` | Exact protocol repo confirmed and already substantial |
| `Agent Development Kit` | pending from weekly queue | `A` for main repo | Exact official Google repo confirmed with fresh release |
| `Genkit` | pending from weekly queue | `B+` | Exact framework repo confirmed and still active |
| `Agent Finder` | pending from weekly queue | `B` | Public catalog repo confirmed; product UI repo still not exposed |
| `ARD specification` | pending from weekly queue | `B` | Exact spec repo confirmed |
| `NVIDIA Cosmos 3` | pending from weekly queue | `A` | Exact official repo confirmed with matching release lineage |

## Risk Notes

- App-level followed projects still point to placeholder repos, so they must stay excluded from recommendation logic.
- GitHub API core rate limiting was hit late in the run after exact repo pulls; final benchmark-candidate checks for `SWE-PolyBench` and `SpreadsheetBench` used public search results instead of API detail payloads.
- `The Kotlin Benchmark`, `SWE-Lancer Diamond`, `DesignArena`, `Copilot cloud agent`, `physical AI agent skills`, `Cosmos Coalition`, `VRING:ON`, and `design-to-manufacturing agent` still behave like benchmark/product/program names rather than confirmed owner/repo identifiers.
- `claude-code`, `copilot-cli`, `copilot-sdk`, `adk-python`, and `genkit` all have enough issue volume that support traffic can distort raw activity readings.
- Most world-model and 3D research repos still lack mature release discipline, so recommendation upgrades should stay conservative until reproducibility is clearer.

## Source Links

Primary GitHub repo sources used in this run:

- https://github.com/github/copilot-cli
- https://github.com/github/copilot-cli/releases/tag/v1.0.70-0
- https://github.com/github/copilot-sdk
- https://github.com/github/copilot-sdk/releases/tag/v1.0.7-preview.0
- https://github.com/google-antigravity/antigravity-cli
- https://github.com/google-antigravity/antigravity-sdk-python
- https://github.com/google-gemini/starter-applets
- https://github.com/mira-wm/mira
- https://github.com/alibaba-damo-academy/RynnWorld-4D
- https://github.com/alibaba-damo-academy/RynnWorld-Teleop
- https://github.com/AlayaLab/AlayaWorld
- https://github.com/anthropics/claude-code
- https://github.com/anthropics/claude-code/releases/tag/v2.1.205
- https://github.com/meshy-dev/meshy-3d-agent
- https://github.com/VAST-AI-Research/TripoSR
- https://github.com/VAST-AI-Research/UniRig
- https://github.com/a2aproject/A2A
- https://github.com/google/adk-python
- https://github.com/google/adk-samples
- https://github.com/genkit-ai/genkit
- https://github.com/github/agentfinder-catalog
- https://github.com/ards-project/ard-spec
- https://github.com/NVIDIA/cosmos
- https://github.com/amazon-science/SWE-PolyBench
- https://github.com/RUCKBReasoning/SpreadsheetBench

Upstream AI daily / weekly source links retained for candidate provenance:

- https://github.blog/changelog/2026-07-08-github-copilot-in-visual-studio-code-june-2026-releases/
- https://github.blog/changelog/2026-07-08-github-mobile-live-notifications-for-copilot-cli-sessions/
- https://github.blog/changelog/2026-07-08-github-mobile-fix-merge-conflicts-with-copilot-cloud-agent
- https://github.blog/changelog/2026-07-08-deploy-managed-copilot-settings-via-mdm-in-vs-code-and-cli/
- https://blog.jetbrains.com/kotlin/2026/07/introducing-the-kotlin-benchmark-evaluate-ai-coding-agents-on-real-world-kotlin-tasks/
- https://kotlinlang.org/benchmark/
- https://openai.com/index/separating-signal-from-noise-coding-evaluations/
- https://arxiv.org/abs/2607.06559
- https://arxiv.org/abs/2607.06558
- https://arxiv.org/abs/2607.06291
- https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/
- https://developers.googleblog.com/how-a2a-is-building-a-world-of-collaborative-agents/
- https://github.blog/changelog/2026-06-17-agent-finder-for-github-copilot-now-available/
- https://blogs.nvidia.com/blog/cvpr-physical-ai-research-agent-skills/
- https://runwayml.com/news/introducing-cosmos-coalition
- https://www.businesswire.com/news/home/20260619342189/en/RebuilderAI-Unveils-Brand-Exclusive-3D-CAD-Design-Generation-AI-at-VivaTech-2026-Recreating-Heritage-with-a-Humanoid
