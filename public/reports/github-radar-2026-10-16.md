# GitHub Radar 2026-10-16

- 运行状态：**success**
- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。
- 候选池：676 条同日重评分输入，372 个候选，10 个 surging，24 个 hot。
- 核验范围：全部 10 个 surging、全部 24 个 hot、全部 14 个 AI 强制候选；正式跟踪项目按每日策略选择 45 项（刷新 25、复用 20），库存总数 261，未做全量刷新；另核验 5 个 watch 轮换样本。
- 核验覆盖：46/46 个强制仓库可访问；README 46，提交 46，Issue 46，PR 46，Releases 46。
- 核验模式：`official-github-pages-fallback`。
- AI 日报：2026-10-16 / success；最新已完成周报：2026-10-14T03:47:25.410Z / success。
- 上游状态：`upstreamStale=false`。

## 热门阈值

- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。
- 累计 Stars 仅作背景；结论综合 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性、许可、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试 | 错误 |
| --- | --- | ---: | ---: | --- |
| github-trending-weekly-all | success | 11 | 1 |  |
| github-trending-24h-python | success | 14 | 1 |  |
| github-trending-24h-all | success | 12 | 1 |  |
| github-ai-active | success | 50 | 1 |  |
| github-trending-24h-typescript | success | 18 | 1 |  |
| ossinsight-weekly-all | failed | 0 | 1 | fetch failed |
| ossinsight-24h-all | failed | 0 | 1 | fetch failed |
| ossinsight-24h-python | failed | 0 | 1 | fetch failed |
| github-agent-active | success | 50 | 1 |  |
| ossinsight-24h-typescript | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| github-ai-new | success | 1 | 2 |  |
| github-aec-design-active | success | 50 | 1 |  |
| github-interior-design-active | success | 50 | 1 |  |
| github-3d-active | success | 50 | 1 |  |
| github-3d-generation-active | success | 50 | 1 |  |
| github-3dgs-active | success | 50 | 1 |  |
| github-simready-active | success | 41 | 1 |  |
| github-open-model-new | success | 5 | 1 |  |
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

主趋势 `github-trending-24h-all`：**success**。
- 可选 OSS Insight 来源提示：ossinsight-weekly-all / failed；fetch failed。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-24h-all / failed；fetch failed。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-24h-python / failed；fetch failed。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-24h-typescript / unavailable；This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories.。官方来源与必核证据通过时不阻断发布。

## 强制核验结论

| 仓库 | 队列 | Stars / Forks | 最近提交 | Release | License | README / Demo | Issue / PR | 状态 | 结论 |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 69781 / 12258 | 2026-10-15 | v2026.10.3 | MIT | 是 / 是 | 是 / 是 | 可访问 | **拒绝**：作者维护的课程和练习集合；README 仍围绕 542 课，新增文档和教学站点功能不足以重开原创产品准入。 |
| [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) | surging | 69112 / 7566 | 2026-10-15 | v0.5.6 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问 | **观察**：具有 backend/frontend/native 实现和 v0.5.6 发布，语音与配音工作流继续观察；AGPL-3.0，底层模型与可选服务另有条件。 |
| [lexmount/moli](https://github.com/lexmount/moli) | surging | 18672 / 498 | 2026-10-15 | v1.1.17 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问 | **观察**：Rust 浏览器运行时、DOM/布局与协议实现已公开，v1.1.17 与近期渲染修复可核验；继续观察浏览器兼容性和实际稳定性。 |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | surging | 64438 / 5622 | 2026-10-16 | v3.28.0 | MIT | 是 / 是 | 是 / 是 | 可访问 | **观察**：具有多来源研究技能、MCP、测试及 v3.28.0；原创价值在来源编排和研究工作流，接口覆盖与稳定性继续观察。 |
| [feder-cr/invisible_playwright_mcp](https://github.com/feder-cr/invisible_playwright_mcp) | surging | 2755 / 447 | 2026-10-13 | v0.72.2 | MIT | 是 / 是 | 是 / 是 | 可访问 | **观察**：src、tests 与 v0.72.2 可核验；浏览器编排实现存在，反检测效果仅为项目声明，本次未运行效果测试。 |
| [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view) | surging | 56932 / 11091 | 2026-10-16 | v0.2.1 | MIT source; third-party data separate | 是 / 是 | 是 / 是 | 可访问 | **观察**：3D 地球与实时公开数据整合具有实现和 v0.2.1；源码 MIT，部分数据为非商业或署名共享许可，须分别评估。 |
| [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) | surging | 30478 / 5607 | 2026-10-15 | v2.0.0 | MIT | 是 / 是 | 是 / 是 | 可访问 | **拒绝**：README 与实现仍以第三方模型 API 聚合前端及白标服务为主；本次 UI/模型接入更新没有改变既有准入结论。 |
| [ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender) | surging | 30971 / 2819 | 2026-10-06 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问 | **观察**：addon.py、src、tests 和安装流程可核验；README 明确为第三方 Blender 集成，维护与行业复用继续观察。 |
| [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | surging | 97774 / 8566 | 2026-10-07 | v1.5.0 | MIT | 是 / 是 | 是 / 是 | 可访问 | **观察**：agent_reach 实现、配置、测试和 v1.5.0 已核验；原创价值在接入与健康检查编排，各外部平台依赖继续观察。 |
| [amontlabs/lcu](https://github.com/amontlabs/lcu) | surging | 1114 / 59 | 2026-10-14 | v0.11.4 | MIT | 是 / 是 | 是 / 是 | 可访问 | **观察**：adapters/lcu 实现和 v0.11.4 已核验；依赖本地官方 ChatGPT 应用提供运行时，MIT 仅代表本仓库，兼容性继续观察。 |
| [jackwener/OpenCLI](https://github.com/jackwener/OpenCLI) | hot | 30306 / 2975 | 2026-10-13 | v1.8.8 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。将网页交互抽象为 Agent 可组合 CLI，是浏览器执行层近期高关注方向，按 A 级跟踪。 |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | hot | 68592 / 8791 | 2026-10-12 | 已检查 Releases，无 tag | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。实现了可运行的端到端自动视频生产链路，可补充大型研究模型缺少编排层的问题。 |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | hot | 118098 / 13097 | 2026-10-15 | 0.13.13 | MIT | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。是网页数据之外 Agent 执行链的代表项目，与 Firecrawl 的读取能力形成互补，按 A 级跟踪。 |
| [browserbase/stagehand](https://github.com/browserbase/stagehand) | hot | 25688 / 1758 | 2026-10-15 | stagehand-server-v3/v3.7.6 | MIT | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。把确定性浏览器控制与 Agent 语义操作结合，是 Firecrawl 关联生态的重要执行层，按 A 级跟踪。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot / AI 强制 | 37179 / 9599 | 2026-10-16 | v0.5.21 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。原创性、规模化可用性、开放模型 Day-0 支持、持续发布和活跃维护证据充分，正式纳入推理基础设施跟踪。 |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | hot | 191901 / 10146 | 2026-10-16 | v2.11.0 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。项目已形成 AI 网页数据基础设施的代表性产品形态，搜索、抓取、结构化与 Agent 接入链路完整，按 A+ 级正式跟踪。 |
| [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | hot | 32235 / 2699 | 2026-10-14 | chromium-v154.0.8037.57.2-pro | MIT | 是 / 是 | 是 / 是 | 可访问 | **观察**：Python/JS 包与发布可核验；包装代码为 MIT，BINARY-LICENSE.md 单独约束浏览器二进制，不将二进制视为同许可开源。 |
| [apify/crawlee](https://github.com/apify/crawlee) | hot | 26161 / 1708 | 2026-10-15 | v4.0.0-rc.1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。作为 Firecrawl 类产品下层的成熟抓取与浏览器执行基础，工程参考价值高，按 A 级跟踪。 |
| [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | hot | 87903 / 9033 | 2026-10-11 | v0.4.15 | BSD-3-Clause | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。在传统爬虫与 AI 数据采集之间形成清晰产品能力，且关注度和工程完整性突出，按 A 级跟踪。 |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | hot | 85622 / 8892 | 2026-10-15 | v0.9.5 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。开源、自托管和 LLM 友好能力突出，是 Firecrawl 之外重要的技术路线，按 A 级正式跟踪。 |
| [lightpanda-io/browser](https://github.com/lightpanda-io/browser) | hot | 36555 / 1751 | 2026-10-15 | 1.0.1 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。直接回应 AI 时代网页采集和浏览器 Agent 的基础设施成本问题，按 A 级跟踪。 |
| [Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern) | hot | 23210 / 2202 | 2026-10-14 | v1.0.56 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。代表浏览器 Agent 从工具库走向业务工作流平台的路线，按 A 级正式跟踪。 |
| [jo-inc/camofox-browser](https://github.com/jo-inc/camofox-browser) | hot | 11614 / 1163 | 2026-10-05 | v1.18.1 | MIT | 是 / 是 | 是 / 是 | 可访问 | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | hot | 17451 / 943 | 2026-09-17 | v2.0.0 | MIT | 是 / 是 | 是 / 是 | 可访问 | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [feder-cr/invisible_dots](https://github.com/feder-cr/invisible_dots) | hot | 32079 / 4750 | 2026-10-15 | golden-a92891c4ded8 | MIT | 是 / 是 | 是 / 是 | 可访问 | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [harry7557558/spirula-studio](https://github.com/harry7557558/spirula-studio) | hot | 1691 / 157 | 2026-10-14 | v2026.10.6 | GPL-3.0 | 是 / 是 | 是 / 是 | 可访问 | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Orchestra-Research/AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs) | hot | 13590 / 957 | 2026-06-16 | v1.7.2 | MIT | 是 / 是 | 是 / 是 | 可访问 | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [NVlabs/Sana](https://github.com/NVlabs/Sana) | hot | 9346 / 748 | 2026-10-11 | streamrender-h3-examples-v1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问 | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [dgtlmoon/changedetection.io](https://github.com/dgtlmoon/changedetection.io) | hot | 35040 / 2149 | 2026-10-15 | 0.60.9 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问 | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [scrapy/scrapy](https://github.com/scrapy/scrapy) | hot | 64837 / 12002 | 2026-10-15 | 2.19.0 | BSD-3-Clause | 是 / 是 | 是 / 是 | 可访问 | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [rxjfighting/SceneMosaic](https://github.com/rxjfighting/SceneMosaic) | watch / AI 强制 | 48 / 0 | 2026-09-03 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问 | **收录**：作者场景生成实现与安装脚本已公开；室内图片到可编辑 GLB，适配行业方向。最近提交 2026-09-03；依赖获批 SAM 模型、至少 32GB 显存且 README 报告峰值约 38GB，本次未安装。 |
| [kandinskylab/kandinsky-6](https://github.com/kandinskylab/kandinsky-6) | watch / AI 强制 | 347 / 27 | 2026-10-13 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。官方模型、许可、代码与集成说明可核验，符合视频模型主线，纳入正式持续跟踪。 |
| [InRobots/MoonBlender](https://github.com/InRobots/MoonBlender) | watch / AI 强制 | 2 / 1 | 2025-10-09 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问 | **观察**：README 标题为 MoonGS，安装指向 xiaoc57/MoonGS；最近提交 2025-10-09，根目录无 LICENSE。保留历史库存，官方关系与原创差异待复核。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 254116 / 55182 | 2026-10-15 | v0.22.2 | MIT | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。Existing approved project retained from the formal tracked inventory. |
| [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) | hot | 137708 / 16402 | 2026-10-16 | v0.41.0 | GPL-3.0 | 是 / 是 | 是 / 是 | 可访问 | **收录**：MiniMax H3 Day-0 支持提供新的官方活跃证据；原创内容生产引擎、可用工作流与持续维护均达到 A 级。 |
| [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) | hot | 62072 / 4919 | 2026-10-14 | v6.7.0 | MIT | 是 / 是 | 是 / 是 | 可访问 | **收录**：Existing approved project retained from the formal tracked inventory. |
| [usestrix/strix](https://github.com/usestrix/strix) | hot | 68606 / 7603 | 2026-10-15 | v1.7.0 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问 | **收录**：Existing approved project retained from the formal tracked inventory. |
| [openai/codex](https://github.com/openai/codex) | watch / AI 强制 | 129394 / 20358 | 2026-10-15 | rust-v0.163.0 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 28 / 11 | 2026-08-01 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问 | **收录**：遵循已有 approved 决策保留；作者 Azure 多代理示例、code 目录可核验，最近提交 2026-08-01，根目录未见 LICENSE，复用许可未明确。 |
| [openclaw/openclaw](https://github.com/openclaw/openclaw) | watch / AI 强制 | 392122 / 82458 | 2026-10-16 | v2026.10.10-beta.1 | MIT | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。同日 AI 强制候选；官方关系、原创实现、可安装性、持续发布和维护活跃度充分，综合质量达到 A。 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | watch / AI 强制 | 151066 / 26673 | 2026-10-15 | v2.1.301 | Anthropic Commercial Terms | 是 / 是 | 是 / 是 | 可访问 | **收录**：正式库存保留；当前 README、安装说明、提交与发布页已重新核验。Existing approved project retained from the formal tracked inventory. |
| [Fantasy-AMAP/LongForcing](https://github.com/Fantasy-AMAP/LongForcing) | watch / AI 强制 | 0 / 0 | 2026-10-14 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问 | **观察**：本轮根目录仍只有 README；无公开实现、权重和明确根许可。保留 AI 强制候选，不将论文标题视为可用工程。 |
| [fyting/ArtifactWorld](https://github.com/fyting/ArtifactWorld) | watch / AI 强制 | 0 / 0 | 2026-10-09 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问 | **观察**：README 声明官方实现并提供 stages 两阶段推理、LoRA 权重和标准化基准；训练代码与大规模训练集仍计划发布。Apache-2.0，第三方组件单独许可；保留行业候选。 |
| [modelscope/ms-swift](https://github.com/modelscope/ms-swift) | watch / AI 强制 | 0 / 0 | 2026-10-15 | v4.6.0 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问 | **观察**：ModelScope 社区微调部署框架，swift/tests 实现及 v4.6.0 发布可核验；作为新 AI 强制候选保留专题观察，不因累计 Stars 自动纳入正式库存。 |
| [QwenLM/Qwen-Image-2.1](https://github.com/QwenLM/Qwen-Image-2.1) | watch / AI 强制 | 0 / 0 | 2026-10-14 | 已检查 Releases，无 tag | Qwen Research License (non-commercial) | 是 / 是 | 是 / 是 | 可访问 | **观察**：Qwen 官方图像生成/编辑模型；研究许可仅允许非商业研究评估，商业使用需另取许可，保留观察并明确使用边界。 |
| [x10ngyx/MORCA](https://github.com/x10ngyx/MORCA) | watch / AI 强制 | 0 / 0 | 2026-10-13 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问 | **观察**：有 morca/models 与推理训练说明；根目录无 LICENSE，第三方 licenses 目录不能替代项目本身许可，部分模型资产可用性仍需补齐。 |

## 候选入选原因

- `rohitg00/ai-engineering-from-scratch`：行业优先：最新开放模型；本地快照新增 Stars 627；最近 1 天有推送；跨 3 个来源命中。
- `debpalash/VoiceStudio`：行业优先：最新开放模型；GitHub Trending 当日新增关注 3024；最近 0 天有推送；跨 3 个来源命中。
- `lexmount/moli`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 271；最近 1 天有推送；跨 2 个来源命中。
- `mvanhorn/last30days-skill`：行业优先：网页采集与检索、深度研究；本地快照新增 Stars 133；最近 3 天有推送；跨 2 个来源命中。
- `feder-cr/invisible_playwright_mcp`：行业优先：网页采集与检索、浏览器执行；新仓库 17 天；最近 3 天有推送；跨 2 个来源命中。
- `bilawalsidhu/gods-eye-view`：行业优先：3D / 三维生成；本地快照新增 Stars 454；最近 1 天有推送。
- `Anil-matcha/Open-Generative-AI`：行业优先：生成式图像模型、视频生成模型、视频生成 / 自动剪辑；本地快照新增 Stars 102；最近 1 天有推送。
- `ahujasid/mcp-for-blender`：行业优先：3D / 三维生成；GitHub Trending 当日新增关注 126。
- `Panniantong/Agent-Reach`：行业优先：网页采集与检索；本地快照新增 Stars 378；最近 1 天有推送。
- `amontlabs/lcu`：行业优先：浏览器执行；新仓库 24 天；最近 2 天有推送。
- `jackwener/OpenCLI`：行业优先：浏览器执行；最近 3 天有推送；跨 6 个来源命中。
- `calesthio/OpenMontage`：行业优先：视频生成模型、视频生成 / 自动剪辑；最近 4 天有推送；跨 5 个来源命中。
- `browser-use/browser-use`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 4 个来源命中。
- `browserbase/stagehand`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 4 个来源命中。
- `sgl-project/sglang`：行业优先：最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；AI 日报/周报强制候选；跨 4 个来源命中。
- `firecrawl/firecrawl`：行业优先：网页采集与检索；最近 1 天有推送；跨 4 个来源命中。
- `CloakHQ/CloakBrowser`：行业优先：网页采集与检索、浏览器执行；最近 2 天有推送；跨 3 个来源命中。
- `apify/crawlee`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `D4Vinci/Scrapling`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `unclecode/crawl4ai`：行业优先：网页采集与检索；最近 1 天有推送；跨 3 个来源命中。
- `lightpanda-io/browser`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `Skyvern-AI/skyvern`：行业优先：浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `jo-inc/camofox-browser`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 22；跨 2 个来源命中。
- `citrolabs/ego-lite`：行业优先：浏览器执行；本地快照新增 Stars 50；最近 1 天有推送；跨 2 个来源命中。
- `feder-cr/invisible_dots`：行业优先：浏览器执行；最近 1 天有推送；跨 2 个来源命中。
- `harry7557558/spirula-studio`：行业优先：3DGS / Gaussian Splatting、3D / 三维生成；本地快照新增 Stars 35；最近 2 天有推送。
- `Orchestra-Research/AI-Research-SKILLs`：行业优先：最新开放模型、深度研究；本地快照新增 Stars 27；最近 5 天有推送。
- `NVlabs/Sana`：行业优先：生成式图像模型、最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 4 天有推送。
- `dgtlmoon/changedetection.io`：行业优先：网页采集与检索；最近 0 天有推送。
- `scrapy/scrapy`：行业优先：网页采集与检索；最近 1 天有推送。
- `NousResearch/hermes-agent`：最近 1 天有推送；AI 日报/周报强制候选；跨 4 个来源命中。
- `Comfy-Org/ComfyUI`：最近 1 天有推送；跨 3 个来源命中。
- `hugohe3/ppt-master`：最近 2 天有推送；跨 2 个来源命中。
- `usestrix/strix`：最近 2 天有推送；跨 2 个来源命中。
- `rxjfighting/SceneMosaic`：行业优先：3D / 三维生成、物理一致 / SimReady、WAIC 物理 AI；AI 日报/周报强制候选；跨 4 个来源命中。
- `kandinskylab/kandinsky-6`：行业优先：视频生成模型、视频生成 / 自动剪辑；最近 3 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `InRobots/MoonBlender`：行业优先：3DGS / Gaussian Splatting、3D / 三维生成、WAIC 物理 AI；AI 日报/周报强制候选；跨 3 个来源命中。
- `openai/codex`：最近 1 天有推送；AI 日报/周报强制候选；跨 4 个来源命中。
- `kinfey/Multi-AI-Agents-Cloud-Native`：AI 日报/周报强制候选；跨 3 个来源命中。
- `openclaw/openclaw`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `anthropics/claude-code`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `Fantasy-AMAP/LongForcing`：AI 日报/周报强制候选；跨 2 个来源命中。
- `fyting/ArtifactWorld`：AI 日报/周报强制候选；跨 2 个来源命中。
- `modelscope/ms-swift`：AI 日报/周报强制候选。
- `QwenLM/Qwen-Image-2.1`：AI 日报/周报强制候选。
- `x10ngyx/MORCA`：AI 日报/周报强制候选。

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

- Tripo 本周展出 H3.1 与分部件打印流程，具体展示日待核验（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- GitHub Copilot cloud agent（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI Programmatic Tool Calling 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI multi-agent beta 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- AI floor-plan / room-design CAD export（ai-daily-forced）：保留待核验，不猜测 GitHub URL。

## Watch 轮换抽查

- [VAST-AI-Research/TripoSG](https://github.com/VAST-AI-Research/TripoSG)：可访问；行业优先：3D / 三维生成；跨 2 个来源命中。
- [VincentHancoder/REPARO](https://github.com/VincentHancoder/REPARO)：可访问；行业优先：3D / 三维生成；跨 2 个来源命中。
- [VITA-Group/VLM-3R](https://github.com/VITA-Group/VLM-3R)：可访问；行业优先：3D / 三维生成、最新开放模型；跨 2 个来源命中。
- [Wang-pengfei/One2Scene](https://github.com/Wang-pengfei/One2Scene)：可访问；行业优先：3DGS / Gaussian Splatting、3D / 三维生成；跨 2 个来源命中。
- [wangpuyi/SceneCode](https://github.com/wangpuyi/SceneCode)：可访问；行业优先：室内设计、3D / 三维生成；跨 2 个来源命中。

## 落盘边界

- 正式跟踪项目 261 个；保留既有项目字段并完成本轮刷新。
- 仅更新 `data/dev`、本报告和 `public/reports`；未写入 `data/main`。


## 09:00 独立复核

- 批次 wagmi-09-00:2026-10-16；重新运行官方趋势发现及当天 AI 强制合并；46 个强制候选的仓库、README、提交、Issues、PR、Releases 完整，另抽查5项。
- 官方元数据干跑刷新45项，失败0；未改变候选批准文件或新增正式仓库。
- 热度只决定核验次序，课程与资源集合继续拒绝；保留当天详细原创性、许可及实现限制。
- 新增 Meta 开放权重事件将 SGLang 纳入 AI 强制队列，原有同日官方证据完整。
- OSS Insight 失败和不可计算指标保持可选来源提示；未伪造活动分数。
- 核验模式：official-github-pages-fallback；本次未调用 GitHub 连接器，不沿用旧会话的连接器成功宣称。
