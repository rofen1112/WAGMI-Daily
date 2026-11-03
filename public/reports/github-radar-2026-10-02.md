# GitHub Radar 2026-10-02

- 运行状态：**success**
- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。
- 候选池：1555 条原始观察，369 个候选，3 个 surging，20 个 hot。
- 核验范围：全部 3 个 surging、前 12 个 hot、全部 11 个 AI 强制候选；正式跟踪项目按每日策略选择 41 项（刷新 25、复用 16），库存总数 255，未做全量刷新；另核验 5 个 watch 轮换样本。
- 核验覆盖：26/26 个强制仓库可访问；README 26，提交 26，Issue 26，PR 26，Releases 26。
- 核验模式：`official-github-pages-fallback`。
- AI 日报：2026-10-02 / success；最新已完成周报：2026-09-21T00:48:12.978Z / warning。
- 上游状态：`upstreamStale=false`。

## 热门阈值

- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。
- 累计 Stars 仅作背景；结论综合 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性、许可、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试 | 错误 |
| --- | --- | ---: | ---: | --- |
| ossinsight-24h-typescript | success | 0 | 1 |  |
| ossinsight-24h-all | success | 0 | 1 |  |
| github-ai-active | success | 50 | 1 |  |
| ossinsight-24h-python | success | 0 | 1 |  |
| ossinsight-weekly-all | success | 0 | 1 |  |
| github-agent-active | success | 50 | 1 |  |
| github-ai-new | success | 1 | 1 |  |
| github-aec-design-active | success | 50 | 1 |  |
| github-interior-design-active | success | 50 | 1 |  |
| github-3d-active | success | 50 | 1 |  |
| github-3d-generation-active | success | 50 | 1 |  |
| github-3dgs-active | success | 50 | 1 |  |
| github-simready-active | success | 40 | 1 |  |
| github-open-model-new | success | 4 | 1 |  |
| github-image-generation-active | success | 50 | 1 |  |
| github-video-intelligence-active | success | 50 | 1 |  |
| github-video-generation-active | success | 50 | 1 |  |
| github-video-editing-active | success | 50 | 1 |  |
| github-video-3d-stage-active | success | 50 | 1 |  |
| github-video-2026-new | success | 50 | 1 |  |
| github-web-data-active | success | 50 | 1 |  |
| github-browser-automation-active | success | 50 | 1 |  |
| github-deep-research-active | success | 50 | 1 |  |
| github-document-processing-active | success | 50 | 1 |  |
| github-physical-ai-active | success | 50 | 1 |  |
| github-vla-robotics-active | success | 50 | 1 |  |
| github-robot-simulation-active | success | 50 | 1 |  |

主趋势 `ossinsight-24h-all`：**success**。

## 强制核验结论

| 仓库 | 队列 | Stars / Forks | 最近提交 | Release | License | README / Demo | Issue / PR | 状态 | 结论 |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 62,422 / 10,680 | 2026-09-29 | v2026.10 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：课程与教程集合；新增关注和文档提交不构成新的原创产品或研究实现证据。 |
| [lexmount/moli](https://github.com/lexmount/moli) | surging | 3,096 / 181 | 2026-10-01 | v1.1.12 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [feder-cr/dots](https://github.com/feder-cr/dots) | surging | 2,371 / 416 | 2026-09-29 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [browserbase/stagehand](https://github.com/browserbase/stagehand) | hot | 25,512 / 1,753 | 2026-10-01 | stagehand-server-v3/v3.7.6 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：把确定性浏览器控制与 Agent 语义操作结合，是 Firecrawl 关联生态的重要执行层，按 A 级跟踪。 |
| [getmaxun/maxun](https://github.com/getmaxun/maxun) | hot | 17,620 / 1,523 | 2026-10-01 | v0.0.48 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：代表网页采集从开发库走向可视化产品的路线，适合观察产品化和企业应用，按 B+ 级跟踪。 |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | hot | 187,587 / 10,005 | 2026-10-01 | v2.11.0 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：项目已形成 AI 网页数据基础设施的代表性产品形态，搜索、抓取、结构化与 Agent 接入链路完整，按 A+ 级正式跟踪。 |
| [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | hot | 31,853 / 2,648 | 2026-09-29 | chromium-v152.0.7977.82.1-pro | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | hot | 63,348 / 5,517 | 2026-10-01 | v3.26.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [vladmandic/sdnext](https://github.com/vladmandic/sdnext) | hot | 7,354 / 585 | 2026-10-01 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：命中 AI 图像/视频生成与设计工具 P0 方向；原创性、可安装性、许可、成熟度和持续维护均通过质量门槛。 |
| [apify/crawlee](https://github.com/apify/crawlee) | hot | 25,965 / 1,686 | 2026-10-01 | v3.18.2 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：作为 Firecrawl 类产品下层的成熟抓取与浏览器执行基础，工程参考价值高，按 A 级跟踪。 |
| [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | hot | 85,013 / 8,705 | 2026-09-30 | v0.4.15 | BSD-3-Clause | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：在传统爬虫与 AI 数据采集之间形成清晰产品能力，且关注度和工程完整性突出，按 A 级跟踪。 |
| [ScrapeGraphAI/Scrapegraph-ai](https://github.com/ScrapeGraphAI/Scrapegraph-ai) | hot | 31,484 / 3,186 | 2026-09-25 | v2.3.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：自然语言驱动结构化抽取与 Firecrawl 形成互补，具备明确的 Agent 数据入口价值，按 A 级跟踪。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot | 36,702 / 9,260 | 2026-10-01 | v0.5.20 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：原创性、规模化可用性、开放模型 Day-0 支持、持续发布和活跃维护证据充分，正式纳入推理基础设施跟踪。 |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | hot | 84,617 / 8,756 | 2026-09-25 | v0.9.4 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：开源、自托管和 LLM 友好能力突出，是 Firecrawl 之外重要的技术路线，按 A 级正式跟踪。 |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | hot | 116,951 / 12,904 | 2026-09-26 | 0.13.10 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：是网页数据之外 Agent 执行链的代表项目，与 Firecrawl 的读取能力形成互补，按 A 级跟踪。 |
| [zju3dv/habitat-gs](https://github.com/zju3dv/habitat-gs) | hot / AI 强制 | 309 / 17 | 2026-09-17 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 250,606 / 53,633 | 2026-10-01 | v2026.9.24 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：Existing approved project retained from the formal tracked inventory. |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 28 / 11 | 2026-08-01 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | watch / AI 强制 | 148,862 / 25,133 | 2026-10-01 | v2.1.287 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：Existing approved project retained from the formal tracked inventory. |
| [fyting/ArtifactWorld](https://github.com/fyting/ArtifactWorld) | watch / AI 强制 | 0 / 0 | 2026-08-10 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [AutodeskAILab/floora](https://github.com/AutodeskAILab/floora) | watch / AI 强制 | 0 / 0 | 2026-09-28 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [BootLoops-ai/bootloops](https://github.com/BootLoops-ai/bootloops) | watch / AI 强制 | 0 / 0 | 2026-10-01 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Mosi-AI/FaithEyes](https://github.com/Mosi-AI/FaithEyes) | watch / AI 强制 | 0 / 0 | 2026-09-29 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [agent-substrate/substrate](https://github.com/agent-substrate/substrate) | watch / AI 强制 | 0 / 0 | 2026-10-01 | v0.3.0 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [anthropics/uplifting-biomolecular-modeling](https://github.com/anthropics/uplifting-biomolecular-modeling) | watch / AI 强制 | 0 / 0 | 2026-09-17 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [RCL-Robotics/Awesome-World-Action-Models](https://github.com/RCL-Robotics/Awesome-World-Action-Models) | watch / AI 强制 | 0 / 0 | 2026-09-16 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |

## 候选入选原因

- `rohitg00/ai-engineering-from-scratch`：行业优先：最新开放模型；本地快照新增 Stars 280；最近 2 天有推送；跨 3 个来源命中。
- `lexmount/moli`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 414；最近 1 天有推送；跨 2 个来源命中。
- `feder-cr/dots`：行业优先：浏览器执行；新仓库 3 天；最近 3 天有推送。
- `browserbase/stagehand`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 4 个来源命中；本地快照新增 Stars 17。
- `getmaxun/maxun`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 4 个来源命中；本地快照新增 Stars 11。
- `firecrawl/firecrawl`：行业优先：网页采集与检索；最近 1 天有推送；跨 4 个来源命中；本地快照新增 Stars 422。
- `CloakHQ/CloakBrowser`：行业优先：网页采集与检索、浏览器执行；最近 3 天有推送；跨 3 个来源命中。
- `mvanhorn/last30days-skill`：行业优先：网页采集与检索、深度研究；本地快照新增 Stars 64；最近 1 天有推送；跨 2 个来源命中。
- `vladmandic/sdnext`：行业优先：生成式图像模型、最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 2。
- `apify/crawlee`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 10。
- `D4Vinci/Scrapling`：行业优先：网页采集与检索、浏览器执行；最近 2 天有推送；跨 3 个来源命中；本地快照新增 Stars 288。
- `ScrapeGraphAI/Scrapegraph-ai`：行业优先：网页采集与检索；最近 7 天有推送；跨 3 个来源命中；本地快照新增 Stars 29。
- `sgl-project/sglang`：行业优先：最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 25。
- `unclecode/crawl4ai`：行业优先：网页采集与检索；最近 7 天有推送；跨 3 个来源命中；本地快照新增 Stars 37。
- `browser-use/browser-use`：行业优先：浏览器执行；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 108。
- `zju3dv/habitat-gs`：行业优先：3DGS / Gaussian Splatting、WAIC 物理 AI；AI 日报/周报强制候选；跨 2 个来源命中。
- `NousResearch/hermes-agent`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 263。
- `kinfey/Multi-AI-Agents-Cloud-Native`：AI 日报/周报强制候选；跨 3 个来源命中。
- `anthropics/claude-code`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 133。
- `fyting/ArtifactWorld`：AI 日报/周报强制候选；跨 2 个来源命中。
- `AutodeskAILab/floora`：AI 日报/周报强制候选。
- `BootLoops-ai/bootloops`：AI 日报/周报强制候选。
- `Mosi-AI/FaithEyes`：AI 日报/周报强制候选。
- `agent-substrate/substrate`：AI 日报/周报强制候选。
- `anthropics/uplifting-biomolecular-modeling`：AI 日报/周报强制候选。
- `RCL-Robotics/Awesome-World-Action-Models`：AI 日报/周报强制候选。

## candidate-decisions 处理

- `ai-cad-workflows`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `alibaba-damo-rynnworld-teleop`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `anthropics-claude-code`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `copilot-cloud-agent`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `cosmos-coalition`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `genebench-v1`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `kinfey-multi-agents`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `nous-hermes-agent`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `openai-codex-security-plugin`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `openai-gpt-red-assets`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `openai-multi-agent-beta`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `programmatic-tool-calling`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `runway-agent-2`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `the-kotlin-benchmark`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `thinking-machines-tinker-cookbook`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `xai-org-grok-build`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。

## 未解析 AI 候选

- GitHub Copilot cloud agent（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI Programmatic Tool Calling 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI multi-agent beta 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- AI floor-plan / room-design CAD export（ai-daily-forced）：保留待核验，不猜测 GitHub URL。

## Watch 轮换抽查

- [assafelovic/gpt-researcher](https://github.com/assafelovic/gpt-researcher)：可访问；行业优先：网页采集与检索、深度研究；最近 6 天有推送；跨 3 个来源命中。
- [FreeCAD/FreeCAD](https://github.com/FreeCAD/FreeCAD)：可访问；行业优先：建筑设计 / AEC、3D / 三维生成、AI 设计工具；最近 2 天有推送；跨 3 个来源命中。
- [hypar-io/Elements](https://github.com/hypar-io/Elements)：可访问；行业优先：建筑设计 / AEC、3D / 三维生成；最近 2 天有推送；跨 3 个来源命中。
- [pascalorg/editor](https://github.com/pascalorg/editor)：可访问；行业优先：建筑设计 / AEC、3D / 三维生成、AI 设计工具；最近 2 天有推送；跨 3 个来源命中。
- [Robbyant/lingbot-video](https://github.com/Robbyant/lingbot-video)：可访问；行业优先：WAIC 物理 AI、最新开放模型、视频生成模型、视频生成 / 自动剪辑；跨 3 个来源命中。

## 落盘边界

- 正式跟踪项目 255 个；保留既有项目字段并完成本轮刷新。
- 仅更新 `data/dev`、本报告和 `public/reports`；未写入 `data/main`。

