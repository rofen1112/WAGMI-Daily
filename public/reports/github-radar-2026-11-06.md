# GitHub Radar 2026-11-06

- 批次：wagmi-github:2026-11-06；run.id=wagmi-github；channel=github；计划：每天 07:30。
- 状态：**success**；耗时 26.99 / 45 分钟。
- 早间批次将可选OSS Insight故障误列整批warning；当前按统一source policy纠正，原始故障与早间记录保留。
- 当前候选池414；所有surging/hot/AI强制候选完整核验82/82，不沿用早间冻结子集。
- 正式库存278；原早间刷新50项，发布复核新增2项行业仓库定向刷新，失败0；保留5个watch样本。
- verificationMode=github-connector-rest；AI asOf=2026-11-06；upstreamStale=false；最终复读 2026-11-05T23:55:38.390Z。
- 本批所有写入限于dev/报告；候选决策文件保持不变；正式库存只按每日轮换策略刷新。
- 热门依据：24小时实际来源指标、本地快照增量、趋势排名、跨来源、新鲜度和质量；累计Stars不单独决定结论。
- 仅更新开发数据和报告镜像；本批次未执行正式发布或钉钉发送。

## 本轮重点

- TimesFM：Apache代码及2.5前权重与3.0非商业/非生产权重严格区分。
- SimReady、ArtifactWorld、Houdini MCP和USD Content Agents具有具体工程入口；参考实现、第三方素材与平台限制保留。
- ovrtx/ovstage为专有运行时，ovui为预发布；不统称完整开源Omniverse。
- 3DGen4Robot是综述资源清单；NVIDIA/skills是官方镜像分发目录，未因强制候选自动入库。
- 早间冻结hot子集不足以覆盖最终候选池，本轮已通过官方REST补齐当前全部必核项。
- 原始失败及恢复均保留：一条连接器传输错误重试成功；五个PR404由官方has_pull_requests=false解释。
- 新approved仅暂存在data/dev intake，不扩大根watchlist和本轮正式刷新。

## 来源状态

| 来源 | 状态 | 数量 | 实际错误 |
|---|---|---:|---|
| github-trending-24h-all | success | 15 |  |
| github-trending-24h-typescript | success | 13 |  |
| github-ai-active | success | 50 |  |
| github-trending-weekly-all | success | 16 |  |
| github-trending-24h-python | success | 18 |  |
| ossinsight-24h-all | unavailable | 0 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| ossinsight-24h-typescript | unavailable | 0 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| ossinsight-weekly-all | unavailable | 0 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| ossinsight-24h-python | unavailable | 0 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| github-agent-active | success | 50 |  |
| github-ai-new | success | 0 |  |
| github-aec-design-active | success | 50 |  |
| github-interior-design-active | success | 50 |  |
| github-3d-active | success | 50 |  |
| github-3d-generation-active | success | 50 |  |
| github-3dgs-active | success | 50 |  |
| github-simready-active | success | 50 |  |
| github-open-model-new | success | 4 |  |
| github-image-generation-active | success | 50 |  |
| github-video-intelligence-active | success | 50 |  |
| github-video-generation-active | success | 50 |  |
| github-video-editing-active | success | 50 |  |
| github-video-3d-stage-active | success | 50 |  |
| github-video-2026-new | success | 50 |  |
| github-web-data-active | success | 50 |  |
| github-browser-automation-active | success | 50 |  |
| github-deep-research-active | success | 50 |  |
| github-document-processing-active | success | 50 |  |
| github-physical-ai-active | success | 50 |  |
| github-vla-robotics-active | success | 50 |  |
| github-robot-simulation-active | success | 50 |  |

## 必核仓库

| 仓库 | 队列 | Stars / Forks | 最近提交 | Release | License | 完整核验 | 决策与限制 |
|---|---|---:|---|---|---|---|---|
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI forced | 28 / 11 | 2026-08-01T08:40:52Z | No releases returned | README claims MIT; referenced root LICENSE absent | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：保留人工approved。Azure多Agent样例与部署结构可见；README声明MIT，但当前根目录没有对应LICENSE文件。；示例与云资源部署，不能作为独立基础模型或已测生产系统；许可文件缺失明确保留。 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | watch / AI forced | 154667 / 25573 | 2026-11-04T00:02:42Z | v2.1.318 | Anthropic commercial terms / custom LICENSE.md | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：人工approved保留；官方工具分发、插件和示例可核验；核心商业分发与仓库可见材料分别判断。；README提供原生安装和包管理入口；npm安装已弃用；不认定核心完整开源。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI forced | 260862 / 57603 | 2026-11-05T23:29:48Z | v0.23.0 | MIT | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。；仅核对官方源码/文档与演示入口；未安装、运行或复现性能。 |
| [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | surging | 97920 / 10252 | 2026-11-05T18:01:44Z | v0.5.1 | BSD-3-Clause | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：继续保留原创Python抓取、解析与并发爬虫框架；本次README变化为赞助文案，不作为新增技术能力证据。；仅安装基础包不含fetcher/spider依赖，需额外浏览器组件；未运行或复现反检测与性能宣传。 |
| [scenario-labs/skills](https://github.com/scenario-labs/skills) | surging | 3027 / 266 | 2026-11-05T23:21:02Z | skills-v0.60.1 | MIT | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：Scenario素材生成与DCC工作流仍有具体脚本和测试结构；本次README补充Python/TypeScript测试依赖，不把测试说明当实测通过。；生成服务、MCP及本机DCC能力另有账户/依赖；未安装或执行仓库Skill。 |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | hot | 77133 / 10245 | 2026-11-03T17:41:59Z | No releases returned | AGPL-3.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：实际视频生产编排、Remotion及Python模块可见；本次README新增早期用户邀请，仍按原创视频工作流保留。；外部生成服务费用与AGPL义务分别保留；本地LLM全流程支持仍标coming soon；未复现宣传效果。 |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 77002 / 13634 | 2026-11-05T12:16:57Z | v2026.11.1 | MIT | verified | rejected：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：当前仍是542课课程、练习与教程；热度和新增课程不足以证明新的独立原创产品。；保留教育参考，不以课程数量或累计Stars作为产品质量。 |
| [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | surging | 45852 / 3147 | 2026-11-05T21:14:16Z | v0.41.2 | Apache-2.0 | verified | approved：原创浏览器Agent执行CLI，以可访问性快照与元素引用组织交互；实现、安装入口与近期活动可核验。；首次运行需下载Chrome及平台依赖；未安装、执行或复现基准，不将厂商组织归属等同于生产保障。 |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | hot | 120132 / 13403 | 2026-10-30T04:28:48Z | 0.13.14 | MIT | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：是网页数据之外 Agent 执行链的代表项目，与 Firecrawl 的读取能力形成互补，按 A 级跟踪。；仅核对官方源码/文档与演示入口；未安装、运行或复现性能。 |
| [browserbase/stagehand](https://github.com/browserbase/stagehand) | hot | 25957 / 1811 | 2026-11-05T20:24:24Z | stagehand-server-v3/v3.7.7 | MIT | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：继续保留原创浏览器交互与结构化抽取SDK；本次README主要新增Star引导，热门判断仍采用实际趋势与活动。；仅核对官方源码/文档与演示入口；未安装、运行或复现性能。 |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | hot | 198967 / 10489 | 2026-11-05T15:12:49Z | v2.11.0 | AGPL-3.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：项目已形成 AI 网页数据基础设施的代表性产品形态，搜索、抓取、结构化与 Agent 接入链路完整，按 A+ 级正式跟踪。；仅核对官方源码/文档与演示入口；未安装、运行或复现性能。 |
| [vercel-labs/agent-desktop](https://github.com/vercel-labs/agent-desktop) | surging | 16789 / 1182 | 2026-11-05T06:30:44Z | v1.2.0 | Apache-2.0 | verified | approved：原创桌面可访问性/执行CLI继续保留；当前README强调快照限定引用、窗口选择与行动后等待，不把作者文档当本机交互验证。；README已明确macOS/Linux可用Homebrew；Scoop仍未有官方包。npm内含平台二进制，各系统权限和支持面未实测。 |
| [lexmount/moli](https://github.com/lexmount/moli) | hot | 22718 / 630 | 2026-11-05T19:17:03Z | v1.1.21 | Apache-2.0 OR MIT; third-party terms | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：Rust工作区与moli/src/app.rs包含CLI、运行时和抓取请求实现，具备独立浏览器工程。；性能/兼容性为作者陈述，未跑浏览器基准；第三方组件单独条款。 |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | surging | 66738 / 5847 | 2026-11-05T21:24:09Z | v3.31.0 | MIT | verified | approved：继续保留已有跨来源检索与综合工作流；本日README仅新增语言入口，没有将翻译变化视为新技术。；Python3.12及来源凭证/工具决定覆盖，未安装Skill或运行搜索。 |
| [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | surging | 55432 / 6795 | 2026-10-31T16:50:27Z | v1.7.1 | Apache-2.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：前后端与chat-engine等实现可见，个性化学习/研究工作流有运行和模块说明。；外部模型、索引与服务成本另计；未执行教学效果验证。 |
| [NVlabs/Sana](https://github.com/NVlabs/Sana) | hot | 9775 / 799 | 2026-11-05T07:21:15Z | streamrender-h3-examples-v1 | Apache-2.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：NVIDIA 官方原创图像、视频和世界模型实现，公开推理代码与Apache-2.0明确，近期持续维护；直接符合设计素材、视频和空间模型方向。；仅核对官方源码/文档与演示入口；未安装、运行或复现性能。 |
| [apify/crawlee](https://github.com/apify/crawlee) | hot | 26352 / 1747 | 2026-11-05T22:45:03Z | v4.0.0-rc.1 | Apache-2.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：作为 Firecrawl 类产品下层的成熟抓取与浏览器执行基础，工程参考价值高，按 A 级跟踪。；仅核对官方源码/文档与演示入口；未安装、运行或复现性能。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot | 38506 / 10187 | 2026-11-05T23:08:23Z | v0.5.23 | Apache-2.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：原创性、规模化可用性、开放模型 Day-0 支持、持续发布和活跃维护证据充分，正式纳入推理基础设施跟踪。；仅核对官方源码/文档与演示入口；未安装、运行或复现性能。 |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | hot | 86955 / 9052 | 2026-11-04T12:13:39Z | v0.9.5 | Apache-2.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：实际Python爬虫与自托管工程仍可核对；README现突出Cloud搜索/抓取API，同时明确本库是其Apache-2.0底层爬虫。；托管Cloud需API密钥，与本地Python/Docker自托管分开；免费额度为作者当日说明，未调用或测量服务。 |
| [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | hot | 21786 / 1233 | 2026-11-04T09:11:51Z | v2.2.0 | MIT repository; separate browser distribution | verified | observe：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：仓库提供自动化接入插件与规范；README明确浏览器为独立下载，不能据此称完整浏览器源码已开放。；31任务的作者基准没有复现；可复用Skills仍标coming soon。 |
| [lightpanda-io/browser](https://github.com/lightpanda-io/browser) | hot | 41406 / 2042 | 2026-11-05T15:31:00Z | 1.0.3 | AGPL-3.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：直接回应 AI 时代网页采集和浏览器 Agent 的基础设施成本问题，按 A 级跟踪。；仅核对官方源码/文档与演示入口；未安装、运行或复现性能。 |
| [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) | surging | 32580 / 6191 | 2026-11-05T16:36:27Z | v2.0.0 | MIT application; remote models/provider terms separate | verified | rejected：本次新增的是另一项目Open Duet及视频推广；本库仍为第三方模型服务聚合，未出现足以重开既有拒绝的原创核心证据。；免费应用不等于模型调用免费；未把600+第三方模型包装认定为自研基础模型，未注册或调用服务。 |
| [Manavarya09/design-extract](https://github.com/Manavarya09/design-extract) | surging | 4780 / 402 | 2026-11-05T08:50:20Z | v13.3.2 | MIT | verified | approved：实际DOM设计系统采集与输出模块继续保留；README改用designlang入口并补充verify-ui/studio等命令，未运行复现评分。；浏览器现在需单独install-browser，不再由npm install自动下载；Node/Playwright环境、保真和无障碍宣称未测试。 |
| [OpenBMB/MiniCPM-OCR](https://github.com/OpenBMB/MiniCPM-OCR) | watch / AI forced | 823 / 60 | 2026-11-05T07:34:24Z | sdk-v1.0.4 | Apache-2.0 | verified | approved：官方OCR工程保留；README新增2026-11-05发布的打包权重/SDK/vLLM Docker入口，保留真实发布日期。；Docker方案要求Linux x86-64、NVIDIA GPU、CUDA12.9兼容驱动及NVIDIA Container Toolkit；手动两环境部署仍存在，未拉镜像或验证。 |
| [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view) | surging | 63004 / 12374 | 2026-11-05T22:11:28Z | v0.3.0 | MIT first-party per README/LICENSE; third-party media terms | verified | approved：实际3D空间数据工程继续保留；README扩展真实公交数据接入范围，具体馈送与时延未本机核验。；供应商密钥、会话与成本面板支持不同；反向代理403和非商业洪水数据限制仍保留，未调用模型或部署。 |
| [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) | surging | 101887 / 11296 | 2026-11-04T21:38:06Z | v0.5.7 | AGPL-3.0 application; per-model and voice licenses | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：语音生成/克隆、配音与桌面源码可核验；README新增Star里程碑、赞助与Cloud入口，不能以里程碑代替质量判断。；AGPL应用与模型、声音、输出授权分开；646语言及速度未复现。 |
| [ConardLi/garden-skills](https://github.com/ConardLi/garden-skills) | surging | 14113 / 1647 | 2026-10-25T13:45:10Z | motion-showreel-v0.1.0 | MIT | verified | observe：包含设计、视频和知识检索等实际Skill目录，按工作流资产继续观察；热度不使指令集合自动成为原创产品。；不安装或执行上游Skill；生成效果、依赖和可复现性尚未实测。 |
| [PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored) | surging | 3415 / 557 | 2026-11-05T19:34:03Z | v3.0.10 | AGPL-3.0; downloaded model licenses separate | verified | approved：本地AI工作站有具体应用实现和持续发布，按工具工程收录；不把集成的第三方模型认定为自研模型。；本地模式与可选LU Cloud分开；模型体积与硬件依赖存在，部分模型禁止商业使用；未安装、下载模型或验证隐私/无审查宣传。 |
| [southleft/figma-console-mcp](https://github.com/southleft/figma-console-mcp) | surging | 3137 / 286 | 2026-10-29T06:01:03Z | v1.46.0 | MIT | verified | approved：AI设计P0；源码入口、Desktop Bridge及具体设计系统工具可核对，具备工程复用价值。；Local/Cloud/Remote能力与权限不同；版本功能、0漏洞与质量评分为作者报告，未连接Figma、安装或写入设计文件。 |
| [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | surging | 109202 / 9763 | 2026-11-05T11:07:56Z | v1.6.1 | MIT | verified | approved：继续保留实际agent_reach包、CLI与渠道适配；当前README明确同名PyPI包不是本项目，不能误用。；只读官方安装说明，不执行外部安装；站点登录、Cookie和第三方工具依赖分别核对，零API费用不等于所有渠道无需账户。 |
| [islandmed/SculptForge](https://github.com/islandmed/SculptForge) | surging | 580 / 73 | 2026-11-05T23:05:22Z | v0.11.1 | GPL-3.0-or-later; third-party and model terms separate | verified | approved：原创雕刻工程继续保留；本次README增加会员/工作室支持条款与UI描述，不将付费支持等同于主应用收费或质量实测。；功能和性能为作者描述；未构建、安装、调用模型或复现高面数性能。 |
| [deepopen-com/deepopen-3d-webs](https://github.com/deepopen-com/deepopen-3d-webs) | surging | 1123 / 108 | 2026-11-05T03:06:08Z | No releases returned | No root LICENSE found | verified | observe：场景生成、Docker与点云演示入口仍可见；本次说明变化未补齐根许可证，继续observe。；缺少根LICENSE；完整模式需GPU和约30GB模型缓存，依赖缺失会自动退回demo。 |
| [hi3d-official/Hi3Dv1.0](https://github.com/hi3d-official/Hi3Dv1.0) | surging | 667 / 63 | 2026-10-23T16:02:17Z | v1.0 | Hi3D Open License Agreement 1.0; third-party Apache/MIT | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：sparc3d_pipeline.py有真实batch-1网格细化实现，属于明确署名的Sparc3D衍生工程。；不是完整端到端生成源代码；自定义Hi3D协议按已列发布资产生效，第三方Apache/MIT继续适用。 |
| [google-research/timesfm](https://github.com/google-research/timesfm) | surging | 35241 / 3451 | 2026-09-29T19:36:24Z | v3.0.0 | Apache-2.0 source and weights through 2.5; TimesFM 3.0 weights: timesfm-non-commercial-license-v1.0 | verified | approved：原创时序基础模型研究工程保留；以真实许可区别代码、旧权重及3.0权重，不因大Stars省略用途限制。；README明确3.0下载/自托管权重仅限非商业、非生产用途；云服务另有规则，未下载、调用或复现预测性能。 |
| [bytedance/axion1_0](https://github.com/bytedance/axion1_0) | watch / AI forced | 56 / 4 | 2026-11-04T05:02:48Z | No releases returned | Apache-2.0; third-party dependencies separate | verified | approved：官方Agent模型训练、数据构造与评测代码已公开，具备原创工程价值；不把论文分数当本机复现。；122B/35B结果是作者报告；模型权重可用性及训练硬件未实测，未训练、下载或运行。 |
| [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | watch / AI forced | 273761 / 33406 | 2026-11-04T08:40:00Z | dsh-v0.2.2-rc.1 | MIT | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：该项目由 AI 当日二次审计触发，直接命中编码智能体、可组合 Agent 运行时与沙箱基础设施方向；官方关系、原创实现、可运行性与行业影响均通过门槛，按 A 级正式跟踪。；仅核对官方源码/文档与演示入口；未安装、运行或复现性能。 |
| [MiniMax-AI/mcode-stack](https://github.com/MiniMax-AI/mcode-stack) | watch / AI forced | 540 / 41 | 2026-11-04T02:43:29Z | No releases returned | MIT | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：MiniMax Code官方工作流/Skill工程和脚本保留；新增agent-brief、evidence-first-review等条目仅为上游工作流资料，不在本机安装或执行。；仅核对官方源码/文档与演示入口；未安装、运行或复现性能。 |
| [openai/codex](https://github.com/openai/codex) | watch / AI forced | 133341 / 21128 | 2026-11-05T23:10:43Z | rust-v0.168.0-alpha.7 | Apache-2.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。；仅核对官方源码/文档与演示入口；未安装、运行或复现性能。 |
| [Tencent-Hunyuan/Hy-Nomas](https://github.com/Tencent-Hunyuan/Hy-Nomas) | watch / AI forced | 502 / 48 | 2026-11-05T21:21:57Z | No releases returned | Apache-2.0 first-party code/weights; third-party original terms | verified | approved：官方交互世界模型工程保留；当前推理预设明确SP=1、TP=8，不能沿用此前单卡可用性的泛化描述。；八rank张量并行预设与可选拓扑分开；SGLang支持在main/nightly，尚非稳定版；未部署或复现。 |
| [ViBench/vibench-public](https://github.com/ViBench/vibench-public) | watch / AI forced | 45 / 14 | 2026-11-03T20:26:41Z | No releases returned | Apache-2.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：原创逐阶段软件交付基准，公开PRD、测试计划和Harbor运行器；能用于评估设计画布等产品任务，但9个保留应用未公开、自动grader有误差且复现有成本。；当前新增Muse Wonder1.0设置说明；不同模型的edit工具及采样参数有例外，保留9个未公开应用、grader误差和复现费用限制。 |
| [IDSCETHZurich/klask_rl](https://github.com/IDSCETHZurich/klask_rl) | watch / AI forced | 1 / 0 | 2026-06-03T12:02:41Z | No releases returned | README claims AGPL-3.0 software / CC-BY-4.0 docs; linked root license files absent | verified | observe：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：Physical AI P0，原创机器人强化学习训练栈可见；但README所链AGPL/CC-BY根许可证文件缺失，先保留观察并记录许可文件补齐项。；需NVIDIA GPU、Isaac Lab容器与机器人任务环境；未训练或部署，未因关联库有许可证而补造本库许可。 |
| [IDSCETHZurich/klask_software](https://github.com/IDSCETHZurich/klask_software) | watch / AI forced | 0 / 0 | 2026-06-03T08:13:34Z | No releases returned | AGPL-3.0 software / CC-BY-4.0 documentation; both root license files verified | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：Physical AI P0，机器人策略部署与对局管理工程可核验；与RL训练栈分开收录，不扩展扫描硬件库。；需真实机械平台、外部模型权重与关联硬件节点；README开头状态估计描述与架构分工不同，采用详细架构说明，未硬件验证。 |
| [yuntaeJ/VLSplat](https://github.com/yuntaeJ/VLSplat) | watch / AI forced | 5 / 1 | 2026-11-01T13:41:46Z | No releases returned | No root LICENSE; README inherits non-commercial research 3DGS terms | verified | observe：3DGS P0原创实现可读，但根目录未发现LICENSE，README还声明继承3DGS非商业研究限制；先保留许可核验观察。；SAM3/SAM2与PyTorch/CUDA环境分开；优化的是特征而非几何，未训练、下载模型或复现结果。 |
| [google-antigravity/antigravity-cli](https://github.com/google-antigravity/antigravity-cli) | watch / AI forced | 2730 / 273 | 2026-11-05T07:33:00Z | 1.5.1 | No root LICENSE found | verified | observe：产品及安装说明可读，作为AI强制候选完整核验；核心源码与根许可证缺失，暂不作为开源CLI正式收录。；不执行远程安装脚本；CLI实际行为、服务条款和免费额度未验证。 |
| [datasette/datasette-apps](https://github.com/datasette/datasette-apps) | watch / AI forced | 35 / 2 | 2026-11-05T22:57:39Z | 0.3a0 | Apache-2.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：原创数据应用托管与受控Agent数据访问插件，可为交互式业务应用提供可检查权限边界，具备工程复用价值。；HTML/JS沙箱应用与不受同等限制的Python插件要区分；依赖Datasette环境，未安装或复现沙箱隔离。 |
| [datasette/datasette-llm](https://github.com/datasette/datasette-llm) | watch / AI forced | 20 / 2 | 2026-11-04T15:25:02Z | 0.1a10 | Apache-2.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：为Datasette插件提供统一模型、密钥和策略接口，作为原创数据/Agent基础组件收录，不宣称新模型。；依赖llm、模型插件、Datasette与可能付费的外部推理服务；未安装、调用或测试安全性。 |
| [deepseek-ai/deepseek-recipe](https://github.com/deepseek-ai/deepseek-recipe) | watch / AI forced | 2777 / 436 | 2026-10-19T17:51:02Z | No releases returned | MIT | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：Rust/Python格式适配和Prompt字节区间实现可见，为原创推理服务基础组件。；仅转换请求、提示词与响应；推理、工具执行、HTTP传输由调用方实现。 |
| [Fantasy-AMAP/TriFold](https://github.com/Fantasy-AMAP/TriFold) | watch / AI forced | 8 / 0 | 2026-10-15T08:44:33Z | No releases returned | No root LICENSE found | verified | observe：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：当前仓库仅README和项目页链接，未见模型/训练/推理源码。；研究预告保留；没有可运行发布或明确根LICENSE。 |
| [google/three-live](https://github.com/google/three-live) | watch / AI forced | 88 / 13 | 2026-11-05T22:23:53Z | v1.3.0 | Apache-2.0 | verified | approved：实际TypeScript/Rust/移动空间运行时继续保留；README状态已由Alpha变为Beta，保留这是作者阶段标注。；Beta；README仍明确不是Google官方支持产品；功能完备/包大小为作者报告，未构建或实测。 |
| [KKKKhazix/agent-autoloop](https://github.com/KKKKhazix/agent-autoloop) | watch / AI forced | 3221 / 595 | 2026-11-05T17:37:46Z | v1.4.1 | MIT | verified | approved：原创CLI Agent持续调度内核保留；README补充正式Release安装、回执与会话重试机制。；Windows原生仍不可用，11月7/8日是计划；WSL2另有注意事项，需Node24，未安装、调用Agent或发送通知。 |
| [ku-autoai/MAGE](https://github.com/ku-autoai/MAGE) | watch / AI forced | 2 / 0 | 2026-10-16T04:22:34Z | No releases returned | MIT first-party; third-party assets separate | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：手册检索与GUI策略适配研究有实际OSWorld运行代码和组件，抽查run_local_model.py。；论文链接仍coming soon；轨迹与LoRA在匿名外部入口，需基础模型、环境及单独资产检查。 |
| [openai/MultiLangBench](https://github.com/openai/MultiLangBench) | watch / AI forced | 42 / 6 | 2026-10-19T21:00:34Z | No releases returned | Apache-2.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：官方SQLite重实现评测和测试脚本可见，原创评测资产明确。；约24k转化测试与建议272题子集要区分；隔离评测要求不是本机执行指令，未运行删除脚本。 |
| [pengpeng-yu/CodecSplat](https://github.com/pengpeng-yu/CodecSplat) | watch / AI forced | 6 / 0 | 2026-10-27T08:57:05Z | No releases returned | MIT | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：实际训练/测试入口和3DGS特征编码结构可见，原创压缩研究方向明确。；双视图/8视图配置不同；8张48GB GPU是训练描述，不是单图推理最低配置；未下载权重或复现码率。 |
| [pierrecomputer/pierre](https://github.com/pierrecomputer/pierre) | watch / AI forced | 6497 / 273 | 2026-11-05T05:29:33Z | highlights-v0.4.0 | Apache-2.0 | verified | approved：README虽简短，但packages/diffs等实现目录可核验，属于原创代码审阅/界面基础组件，非仅项目链接集合。；包和应用的各自API、平台与性能未运行验证；未将公司整个产品矩阵都视为本库开放源码。 |
| [RISE-X-Lab/Agentic-Soft-Token](https://github.com/RISE-X-Lab/Agentic-Soft-Token) | watch / AI forced | 5 / 0 | 2026-11-02T04:23:02Z | No releases returned | MIT original code/calibration; model and AppWorld licenses separate | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：作者论文实现包含实际ASTC上下文压缩Python包、校准和AppWorld评测入口；MIT代码与冻结骨干推理路径明确，按Agent效率研究工程保留。；限定混合GDN-attention骨干与具体Qwen3.5-9B修订；需CUDA/PyTorch/Triton及外部AppWorld数据，未跑评测，节省和效果为作者报告。 |
| [RUCAIBox/Agentic-ImageGen-Wild](https://github.com/RUCAIBox/Agentic-ImageGen-Wild) | watch / AI forced | 3 / 0 | 2026-10-23T09:05:02Z | No releases returned | No root LICENSE found | verified | rejected：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：仓库为fork且目前只有论文说明/素材；未验证原创实现，未通过产品入库门槛；保留论文发现证据。；代码、Savanna、Ranger数据和权重仍待内部审核；不因官方署名豁免fork质量门槛。 |
| [tsinghua-fib-lab/LLM_for_Polarization](https://github.com/tsinghua-fib-lab/LLM_for_Polarization) | watch / AI forced | 9 / 2 | 2026-08-16T01:26:06Z | v1.0.2 | MIT | verified | observe：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：实验室作者仓库有真实模拟/去偏代码、源数据和图表；保留多Agent社会模拟研究参考，尚非通用产品或直接空间设计工具。；README措辞为Nature Communications原则上接收，未写成已正式发表；LLM后端、实验费用和社会效应外推均未复现。 |
| [VAST-AI-Research/EdenLive](https://github.com/VAST-AI-Research/EdenLive) | watch / AI forced | 420 / 28 | 2026-10-21T05:24:37Z | No releases returned | Apache-2.0 first-party; DINOv3 and FLUX Non-Commercial model terms | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：实时参考视频渲染有实际InferenceEngine和运行服务代码，作为生成式渲染工程收录。；24FPS/5090为作者展示，环境表列80GBGPU；FLUX首帧工作台非商业/非生产，DINOv3等模型另有条款。 |
| [2hiTee/VidEdit3D](https://github.com/2hiTee/VidEdit3D) | watch / AI forced | 3 / 0 | 2026-10-27T02:53:23Z | No releases returned | Apache-2.0 intended first-party; inherited BSD/other terms | verified | observe：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：3DGS视频编辑研究相关，但README仍写代码将发布，当前根目录无实现。；根Apache与上游BSD声明不等于实际代码已公开；保留预告。 |
| [deepseek-ai/DeepInfer](https://github.com/deepseek-ai/DeepInfer) | watch / AI forced | 25467 / 3115 | 2026-11-03T07:31:40Z | No releases returned | Apache-2.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：官方离线推理框架有内核、调度、模型运行时与实例，作为推理基础工程保留。；当前支持型号和NVIDIA/Ascend依赖需对照；4卡prefill/64卡decode是作者基准配置，非普遍最低需求。 |
| [deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype) | watch / AI forced | 19466 / 2220 | 2026-10-31T12:06:31Z | No releases returned | MIT | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：有真实事件准入/任务处理源码，按研究型自主编码Agent收录。；README明确非DeepSeek正式产品、与内部系统及文章设计不完全一致；不适合直接视为生产软件。 |
| [gaojh0333/PanoGraphGS](https://github.com/gaojh0333/PanoGraphGS) | watch / AI forced | 0 / 0 | 2026-10-21T02:31:10Z | No releases returned | No root LICENSE found | verified | observe：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：当前为README/素材的全景分割与3D场景图研究预告，缺少实现及根LICENSE。；论文指标保留为作者报告，不认定可部署发布。 |
| [google-research/CLASHarness](https://github.com/google-research/CLASHarness) | watch / AI forced | 13 / 1 | 2026-10-15T05:48:16Z | No releases returned | Apache-2.0 code; CC-BY-4.0 dataset | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：真实多Agent环境和受控冲突生成harness源码可读，官方研究关系明确。；代码Apache、基准数据CC-BY4；外部API和GUI环境配置另计，未复现冲突评测。 |
| [molence/Mol-1](https://github.com/molence/Mol-1) | watch / AI forced | 277 / 31 | 2026-10-30T14:06:32Z | No releases returned | Apache-2.0; upstream notices | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：实际分子模型/采样实现与推理微调脚本可见，并保留ByteDance衍生署名。；生物分子方向关联较低；部分资源仍coming soon，外部模型/数据和第三方条款另查。 |
| [openai/math](https://github.com/openai/math) | watch / AI forced | 17346 / 1960 | 2026-10-30T00:35:35Z | No releases returned | Apache-2.0 | verified | observe：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：官方研究手稿/推理轨迹和部分Lean材料有价值，但不是可部署模型或独立通用工具。；作者明确原始研究数据、部分结果未形式化且可能有问题，不当作已验证定理集。 |
| [privacypreserving3dgs/PrinGS](https://github.com/privacypreserving3dgs/PrinGS) | watch / AI forced | 1 / 0 | 2026-10-18T12:02:37Z | No releases returned | No root LICENSE found | verified | observe：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：当前只有一行研究名称，未见代码、模型、演示或许可证。；隐私3DGS方向保留候选，不臆造研究结果或可用性。 |
| [SegerEnd/sprongmotion-blender](https://github.com/SegerEnd/sprongmotion-blender) | watch / AI forced | 0 / 0 | 2026-10-26T00:16:08Z | v1.1.0 | GPL-3.0-or-later add-on; Apache-2.0 runtime/model per README | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：Blender动作生成、重定向/时间线更新有真实Python实现，具备直接3D创作价值。；CPU速度是作者测量未复现；插件GPL、运行库/模型Apache分别保留。 |
| [SegerEnd/sprongmotion-runtime](https://github.com/SegerEnd/sprongmotion-runtime) | watch / AI forced | 1 / 0 | 2026-10-26T00:09:33Z | v1.1.0 | Apache-2.0 runtime; model package terms separate | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：C11模型绑定、文本编码/生成实现真实可读，22关节动作/BVH与WASM接口明确。；14M模型需单独下载，M4/WASM速度和动作质量未复现。 |
| [simonw/battledrones](https://github.com/simonw/battledrones) | watch / AI forced | 61 / 10 | 2026-10-24T03:57:44Z | v14 | Apache-2.0 | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：有真实TypeScript游戏、relay及测试，作为AI编程交互产物参考保留。；不是新的Agent/模型框架；作者说明README部分由Claude撰写，未实际运行联机。 |
| [superdesigndev/treg](https://github.com/superdesigndev/treg) | watch / AI forced | 7224 / 652 | 2026-11-05T22:27:39Z | No releases returned | Apache-2.0 plus hosted/embedded third-party service restriction | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：工具目录、凭证与计费/API/CLI实现保留；当前LICENSE变化为Superdesign Dev Pty Ltd版权署名，托管/嵌入服务附加限制仍保留。；自定义附加条款禁止未经许可向第三方提供托管/嵌入服务；不是无条件Apache2。 |
| [XingChen-AGI/Xing4.0-29B-Intent](https://github.com/XingChen-AGI/Xing4.0-29B-Intent) | watch / AI forced | 38 / 6 | 2026-10-27T01:38:31Z | No releases returned | Apache-2.0 code/data/model per LICENSE/README | verified | approved：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：官方意图识别模型说明、Python SDK与数据入口明确，作为开放模型/结构化抽取候选保留。；29B总参/4B激活区分；模型权重外部下载，指标不是业务准确率或已复现结果。 |
| [NVIDIA/simready-foundation](https://github.com/NVIDIA/simready-foundation) | watch / AI forced | 173 / 29 | 2026-10-27T20:18:15Z | No releases returned | Apache-2.0 NVIDIA-authored content; third-party assets retain separate MIT/BSD/Spot SDK terms | verified | approved：Physical AI/3D P0；仿真内容规格、扩展与样例支持资产合规结构化工作流，按官方工程收录。；Git LFS必需，否则取得的是指针；不接受贡献是当前维护政策，不能描述为无人维护；第三方机器人素材不统一套用Apache，未下载LFS资产。 |
| [fyting/ArtifactWorld](https://github.com/fyting/ArtifactWorld) | watch / AI forced | 31 / 3 | 2026-10-29T12:47:18Z | No releases returned | Apache-2.0 code; upstream video model/checkpoint terms separate | verified | approved：3DGS P0；原创伪影热图预测与修复推理工程已经公开，具备研究复用价值。；依赖CUDA、视频模型、外部权重及部分ffmpeg工具；训练/复现覆盖不能由runnable inference推定，未下载、训练或评测。 |
| [hitcslj/3DGen4Robot](https://github.com/hitcslj/3DGen4Robot) | watch / AI forced | 67 / 1 | 2026-10-24T08:35:12Z | No releases returned | No root LICENSE found | verified | rejected：保留AI强制候选和综述线索，但资源清单/表格脚本未构成原创3D生成或机器人系统，不进入正式项目库存。；不能把综述所收集的外部成果当成本仓库已发布模型。 |
| [nscrdev/nscr-houdini-mcp](https://github.com/nscrdev/nscr-houdini-mcp) | watch / AI forced | 0 / 0 | 2026-09-25T16:48:26Z | No releases returned | MIT | verified | approved：AI设计/3D P0；十一工具的小型Houdini22桥接有实际源码与安装入口，适合可修改DCC工作流。；0.1.0早期接口；作者只在macOS真实Houdini验证，Windows/Linux仅单元CI，实际Houdini未试；需Houdini22与uv，未安装或启动DCC。 |
| [NVIDIA-Omniverse/ovrtx](https://github.com/NVIDIA-Omniverse/ovrtx) | watch / AI forced | 262 / 42 | 2026-10-15T06:18:46Z | v0.6.0 | NVIDIA proprietary software agreement and product-specific AI terms | verified | observe：Physical AI传感仿真价值明确，但预发布、专有运行时与源码边界需保留观察，不标成完整开源RTX引擎。；预发布；需支持的GPU/驱动和Python版本，未安装轮子、下载运行时或复现实时间传感效果。 |
| [nvidia-omniverse/ovstage](https://github.com/nvidia-omniverse/ovstage) | watch / AI forced | 23 / 7 | 2026-10-15T05:21:38Z | v0.3.0 | NVIDIA Software License Agreement and Product Specific Terms for NVIDIA AI Products | verified | observe：OpenUSD/Physical AI P0基础设施，公开接口可读；专有核心与预发布边界保留观察，不声称整体开源。；CUDA设备放置仍为实验功能；CPU默认路径不等于所有数据零拷贝，未构建、运行或验证吞吐。 |
| [NVIDIA-omniverse/ovui](https://github.com/NVIDIA-omniverse/ovui) | watch / AI forced | 55 / 9 | 2026-10-13T20:38:20Z | v0.3.0 | Apache-2.0; bundled components and external renderer terms separate | verified | approved：AI设计/3D P0；独立Python UI与OpenUSD场景工具链有实际源码，Apache主许可与模块边界可核验。；预发布且无企业支持；与ovrtx等外部渲染器许可分开，源码构建需CMake/平台C++工具链，未编译或运行。 |
| [NVIDIA-Omniverse/PhysX](https://github.com/NVIDIA-Omniverse/PhysX) | watch / AI forced | 4832 / 684 | 2026-10-15T11:12:53Z | 110.3-omni-and-physx-5.9.1 | BSD-3-Clause root; subfolder component licenses separate | verified | approved：Physical AI P0原生物理模拟基础设施；真实SDK与USD Python接口方向相关，不以今日热度为收录前提。；不同子库构建、CUDA与平台要求需分别检查；未构建或验证机器人仿真精度。 |
| [NVIDIA-Omniverse/usd-content-agents](https://github.com/NVIDIA-Omniverse/usd-content-agents) | watch / AI forced | 239 / 26 | 2026-10-21T03:24:23Z | v0.6.2 | Apache-2.0 code; asset/provider/ovphysx terms separate | verified | approved：3D/Physical AI P0；具备可检查产物与typed Omniverse工具的参考实现，不是纯提示词目录。；README明确是供修改的参考实现，不能当稳定SDK或直接生产部署；Geometry Agent为Research Preview，外部模型/供应商与WSL渲染限制保留，未执行工作流。 |
| [NVIDIA/skills](https://github.com/NVIDIA/skills) | watch / AI forced | 3872 / 492 | 2026-11-05T18:29:09Z | No releases returned | Apache-2.0 code AND CC-BY-4.0 documentation; both root licenses captured | verified | observe：保留官方Physical AI/CUDA工作流发现与AI强制候选；镜像目录不自动作为独立原创产品入库。；不安装或执行Skill；Verified为NVIDIA声明，不代表本轮已测安全性、效果或产品依赖。 |

## 热门依据

- kinfey/Multi-AI-Agents-Cloud-Native：AI 日报/周报强制候选；跨 3 个来源命中
- anthropics/claude-code：最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 118
- NousResearch/hermes-agent：最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 312
- D4Vinci/Scrapling：行业优先：网页采集与检索、浏览器执行；GitHub Trending 当日新增关注 1661；最近 2 天有推送；跨 5 个来源命中；本地快照新增 Stars 1451
- scenario-labs/skills：行业优先：3D / 三维生成；GitHub Trending 当日新增关注 674；本地快照新增 Stars 482；最近 1 天有推送
- calesthio/OpenMontage：行业优先：视频生成模型、视频生成 / 自动剪辑；最近 3 天有推送；跨 6 个来源命中；本地快照新增 Stars 631
- rohitg00/ai-engineering-from-scratch：行业优先：最新开放模型；本地快照新增 Stars 114；最近 1 天有推送；跨 3 个来源命中
- vercel-labs/agent-browser：行业优先：浏览器执行；GitHub Trending 当日新增关注 181；最近 5 天有推送；跨 3 个来源命中；本地快照新增 Stars 680
- browser-use/browser-use：行业优先：网页采集与检索、浏览器执行；最近 4 天有推送；跨 4 个来源命中；本地快照新增 Stars 95
- browserbase/stagehand：行业优先：网页采集与检索、浏览器执行；最近 2 天有推送；跨 4 个来源命中；本地快照新增 Stars 10
- firecrawl/firecrawl：行业优先：网页采集与检索；最近 2 天有推送；跨 4 个来源命中；本地快照新增 Stars 320
- vercel-labs/agent-desktop：行业优先：浏览器执行；GitHub Trending 当日新增关注 2173；本地快照新增 Stars 1319
- lexmount/moli：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 95；最近 1 天有推送；跨 2 个来源命中
- mvanhorn/last30days-skill：行业优先：网页采集与检索、深度研究；本地快照新增 Stars 101；最近 1 天有推送；跨 2 个来源命中
- HKUDS/DeepTutor：行业优先：深度研究；本地快照新增 Stars 320；最近 1 天有推送；跨 2 个来源命中
- NVlabs/Sana：行业优先：3D / 三维生成、生成式图像模型、最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 3 天有推送；跨 3 个来源命中；本地快照新增 Stars 10
- apify/crawlee：行业优先：网页采集与检索、浏览器执行；最近 2 天有推送；跨 3 个来源命中；本地快照新增 Stars 15
- sgl-project/sglang：行业优先：最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 2 天有推送；跨 3 个来源命中；本地快照新增 Stars 46
- unclecode/crawl4ai：行业优先：网页采集与检索；最近 2 天有推送；跨 3 个来源命中；本地快照新增 Stars 49
- citrolabs/ego-lite：行业优先：浏览器执行；本地快照新增 Stars 99；最近 1 天有推送；跨 2 个来源命中
- lightpanda-io/browser：行业优先：网页采集与检索、浏览器执行；最近 2 天有推送；跨 3 个来源命中；本地快照新增 Stars 127
- Anil-matcha/Open-Generative-AI：行业优先：生成式图像模型、视频生成模型、视频生成 / 自动剪辑；本地快照新增 Stars 284；最近 1 天有推送
- Manavarya09/design-extract：行业优先：AI 设计工具、网页采集与检索；本地快照新增 Stars 122；最近 1 天有推送
- OpenBMB/MiniCPM-OCR：行业优先：文档解析与转换；最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 12
- bilawalsidhu/gods-eye-view：行业优先：3D / 三维生成；本地快照新增 Stars 183；最近 1 天有推送
- debpalash/VoiceStudio：行业优先：最新开放模型；本地快照新增 Stars 740；最近 1 天有推送
- ConardLi/garden-skills：行业优先：生成式图像模型；GitHub Trending 当日新增关注 241
- PurpleDoubleD/locally-uncensored：行业优先：视频生成模型、视频生成 / 自动剪辑；本地快照新增 Stars 106；最近 1 天有推送
- southleft/figma-console-mcp：行业优先：AI 设计工具；GitHub Trending 当日新增关注 242
- Panniantong/Agent-Reach：行业优先：网页采集与检索；本地快照新增 Stars 322；最近 1 天有推送
- islandmed/SculptForge：行业优先：3DGS / Gaussian Splatting、3D / 三维生成；本地快照新增 Stars 19；新仓库 16 天；最近 1 天有推送
- deepopen-com/deepopen-3d-webs：行业优先：3D / 三维生成、视频 3D 舞台 / 虚拟制作；本地快照新增 Stars 1；新仓库 11 天；最近 1 天有推送
- hi3d-official/Hi3Dv1.0：行业优先：3D / 三维生成、最新开放模型；本地快照新增 Stars 3；新仓库 21 天
- google-research/timesfm：行业优先：最新开放模型；GitHub Trending 当日新增关注 55
- bytedance/axion1_0：最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 9
- deepseek-ai/deepseek-harness：最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 1251
- MiniMax-AI/mcode-stack：最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 4
- openai/codex：最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 157
- Tencent-Hunyuan/Hy-Nomas：最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 16
- ViBench/vibench-public：最近 3 天有推送；AI 日报/周报强制候选；跨 3 个来源命中
- IDSCETHZurich/klask_rl：AI 日报/周报强制候选；跨 2 个来源命中
- IDSCETHZurich/klask_software：AI 日报/周报强制候选；跨 2 个来源命中
- yuntaeJ/VLSplat：AI 日报/周报强制候选；跨 2 个来源命中
- google-antigravity/antigravity-cli：最近 2 天有推送；AI 日报/周报强制候选；跨 2 个来源命中；本地快照新增 Stars 10
- datasette/datasette-apps：AI 日报/周报强制候选
- datasette/datasette-llm：AI 日报/周报强制候选
- deepseek-ai/deepseek-recipe：AI 日报/周报强制候选
- Fantasy-AMAP/TriFold：AI 日报/周报强制候选
- google/three-live：AI 日报/周报强制候选
- KKKKhazix/agent-autoloop：AI 日报/周报强制候选
- ku-autoai/MAGE：AI 日报/周报强制候选
- openai/MultiLangBench：AI 日报/周报强制候选
- pengpeng-yu/CodecSplat：AI 日报/周报强制候选
- pierrecomputer/pierre：AI 日报/周报强制候选
- RISE-X-Lab/Agentic-Soft-Token：AI 日报/周报强制候选
- RUCAIBox/Agentic-ImageGen-Wild：AI 日报/周报强制候选
- tsinghua-fib-lab/LLM_for_Polarization：AI 日报/周报强制候选
- VAST-AI-Research/EdenLive：AI 日报/周报强制候选
- 2hiTee/VidEdit3D：AI 日报/周报强制候选
- deepseek-ai/DeepInfer：
- deepseek-ai/dsh-superagent-prototype：AI 日报/周报强制候选
- gaojh0333/PanoGraphGS：
- google-research/CLASHarness：AI 日报/周报强制候选
- molence/Mol-1：AI 日报/周报强制候选
- openai/math：AI 日报/周报强制候选
- privacypreserving3dgs/PrinGS：AI 日报/周报强制候选
- SegerEnd/sprongmotion-blender：AI 日报/周报强制候选
- SegerEnd/sprongmotion-runtime：AI 日报/周报强制候选
- simonw/battledrones：
- superdesigndev/treg：AI 日报/周报强制候选
- XingChen-AGI/Xing4.0-29B-Intent：
- NVIDIA/simready-foundation：行业优先：物理一致 / SimReady；跨 2 个来源命中
- fyting/ArtifactWorld：
- hitcslj/3DGen4Robot：
- nscrdev/nscr-houdini-mcp：
- NVIDIA-Omniverse/ovrtx：
- nvidia-omniverse/ovstage：
- NVIDIA-omniverse/ovui：
- NVIDIA-Omniverse/PhysX：
- NVIDIA-Omniverse/usd-content-agents：
- NVIDIA/skills：

## Watch轮换

- cvg/NoPoSplat：verified；approved；3DGS P0，原创研究实现和checkpoint入口可核验；watch轮换保留研究价值，不当作2026新发布。；ICLR2025成果日期保留；需要CUDA/PyTorch和外部模型/数据，未下载或复现。
- cvg/resplat：verified；approved；沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：3DGS P0；以渲染误差反馈迭代细化Gaussian并提供模型/训练/评测入口，作为低热度研究工程保留。；Python3.12/PyTorch2.7/CUDA12.8、gsplat与pointops依赖；压缩倍数和适配效果为作者报告，未训练或评测。
- DAMO-NLP-SG/VideoLLaMA2：verified；approved；沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：视频理解与多模态开源工程可核对，保留为可复用研究资产；watch轮换检查不把2024成果当今日新品。；CUDA/PyTorch/FlashAttention与外部checkpoint依赖；README指向更晚VideoLLaMA3但不扩大本轮扫描，未运行或复现基准。
- datawhalechina/every-embodied：verified；rejected；新增的是MotionBricks、MANO重定向和带球复现教学内容；未证明独立原创产品核心，维持教学资源拒绝。；学习资源不等于原创世界模型；新增教程和公开复现不据此认定性能突破，未安装运行。
- DAXIAORobotics/kairos：verified；approved；沿用既有内容审阅意见（本日重新核对官方元数据与活动，README/许可内容未变）：Physical AI/世界模型P0；可核对视频状态与动作预测研究实现，按研究工程保留，不需要每日热度门槛。；最新新闻仍保留2026-07-02等真实日期；GPU、模型权重与可执行动作效果未下载或复现，不能宣称今日新发布。

## 未完成与保留项

- 超出12-hot限额（强制候选仍核验）：Skyvern-AI/skyvern、CloakHQ/CloakBrowser、CopilotKit/OpenBot、kalil0321/reverse-api-engineer、feder-cr/Jobs_Applier_AI_Agent、dgtlmoon/changedetection.io、Evil0ctal/Douyin_TikTok_Download_API、Comfy-Org/ComfyUI
- deepseek-ai/deepseek-recipe \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- inclusionAI/Ming-3.0-tts \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- inclusionAI/Ming-3.0-audio-flash \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- inclusionAI/Ming-3.0-asr \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- nvidia/Cosmos \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- NVIDIA/kumo-engine \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- NVIDIA/auto-ontology \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- openai/php2shell-checker \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- jinlabneurogenomics/distributed_agent \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- NVIDIA-NeMo/Automodel \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- NVIDIA-NeMo/RL \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- menufactory43/panache \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- agentskills/agentskills \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- datasette/datasette-mcp \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- MoonshotAI/kimi-code \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。：保留待确认，不猜测URL。
- MiniMax M3.1 Flash 权重 / 运行代码 \| pending \| repo URL 待核验 \| API 发布已核验；权重开放时间与仓库未确认，不把预告当已开源。：保留待确认，不猜测URL。
- Tenstorrent 推理软件栈 \| pending \| repo URL 待核验 \| 融资公告涉及软件栈，但原始仓库 URL 待核验。：保留待确认，不猜测URL。
- NVIDIA FOX 工厂智能体蓝图 \| pending \| repo URL 待核验 \| 早期访问受申请审批；尚未确认稳定代码仓库 URL。：保留待确认，不猜测URL。
- NVIDIA cuDSS 示例 / 接口 \| pending \| repo URL 待核验 \| 工程库正式可用不等于开源；示例仓库及许可待核验。：保留待确认，不猜测URL。
- Kimi K3.1 Pro 权重 / 三维与 CAD 运行资产 \| pending \| repo URL 待核验 \| 产品与 API 上线已核验；完整权重计划 11 月 4 日发布，仓库与许可待核验。：保留待确认，不猜测URL。
- Quick Study 画笔工具代码 \| pending \| repo URL 待核验 \| 作者成品及生成会话可回查，独立仓库 URL 尚未确认。：保留待确认，不猜测URL。
- Redmine Agent MCP / 插件代码 \| pending \| repo URL 待核验 \| 官方插件目录未给代码仓库；商业产品的 MCP 功能不代表已开源，URL 待核验。：保留待确认，不猜测URL。
- GitHub Copilot cloud agent：保留待确认，不猜测URL。
- OpenAI Programmatic Tool Calling 示例工程：保留待确认，不猜测URL。
- OpenAI multi-agent beta 示例工程：保留待确认，不猜测URL。
- AI floor-plan / room-design CAD export：保留待确认，不猜测URL。
- Edit4D 官方代码：保留待确认，不猜测URL。
- MiniMax M3.1 Flash 官方权重：保留待确认，不猜测URL。
- Tenstorrent 官方软件栈：保留待确认，不猜测URL。
- APM Dependabot integration：保留待确认，不猜测URL。
- CodeQL 2.27.3 AI threat model：保留待确认，不猜测URL。
- NVIDIA fab cuDSS PhysicsNeMo cuLitho integration：保留待确认，不猜测URL。
- tencent-connect dsh-qqbot plugin：保留待确认，不猜测URL。
- candidate-decisions.json 保持不变；approved优先，observe保留，rejected无新原创证据不重开。
- 校验：passed；data/dev/github-validation-2026-11-06.log。

## 行业重点收录

保留 278 个正式项目记录，其中 276 个处于活跃跟踪，2 个已下架并保留历史信息。热度只用于排序，不是收录门槛。

### 3D / 空间推理评测

- [RoTA-Bench](https://github.com/MAC-AutoML/RoTA-Bench)：作者研究与公开可复现实现适配空间控制方向，保留测试设置和第三方素材限制；不以低stars为拒绝理由。

### 模型推理 / 基础设施

- [IQuestRT](https://github.com/IQuestLab/IQuestRT)：方向相关的原创推理引擎、公开代码与基准条件完整；热度6stars不影响收录，尚未在本机运行。
- [vLLM](https://github.com/vllm-project/vllm)：同日 AI 强制候选；基础设施影响力、原创实现、维护活跃度与可用性均达到 A+。

### 仿真标准与验证

- [SimReady Foundation](https://github.com/NVIDIA/simready-foundation)：NVIDIA 官方 Apache-2.0 项目，可作为判断 AI 生成资产是否真正达到 SimReady 的工程基准。

### 视频自动剪辑 / Agent

- [OpenMontage](https://github.com/calesthio/OpenMontage)：实现了可运行的端到端自动视频生产链路，可补充大型研究模型缺少编排层的问题。
- [ViMax](https://github.com/HKUDS/ViMax)：香港大学团队官方开源视频生产智能体，适合作为自动编导和多 Agent 协作的观察样本。

### Agent 工程 / 云原生

- [Multi AI Agents Cloud Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native)：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。

### 编码 Agent / 开发工具

- [OpenAI Codex](https://github.com/openai/codex)：同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。

### 模型推理 / Agent 基础设施

- [SGLang](https://github.com/sgl-project/sglang)：原创性、规模化可用性、开放模型 Day-0 支持、持续发布和活跃维护证据充分，正式纳入推理基础设施跟踪。

### 生成式设计 / 节点工作流

- [ComfyUI](https://github.com/Comfy-Org/ComfyUI)：MiniMax H3 Day-0 支持提供新的官方活跃证据；原创内容生产引擎、可用工作流与持续维护均达到 A 级。

### Agent 数据基础设施 / 网页采集与检索

- [Firecrawl](https://github.com/firecrawl/firecrawl)：项目已形成 AI 网页数据基础设施的代表性产品形态，搜索、抓取、结构化与 Agent 接入链路完整，按 A+ 级正式跟踪。
- [Crawl4AI](https://github.com/unclecode/crawl4ai)：开源、自托管和 LLM 友好能力突出，是 Firecrawl 之外重要的技术路线，按 A 级正式跟踪。
- [Crawlee](https://github.com/apify/crawlee)：作为 Firecrawl 类产品下层的成熟抓取与浏览器执行基础，工程参考价值高，按 A 级跟踪。
- [Scrapling](https://github.com/D4Vinci/Scrapling)：在传统爬虫与 AI 数据采集之间形成清晰产品能力，且关注度和工程完整性突出，按 A 级跟踪。
- [Firecrawl MCP Server](https://github.com/firecrawl/firecrawl-mcp-server)：它是 Firecrawl 进入 Agent 工具生态的官方桥梁，直接命中本类目，按 A 级正式跟踪。
- [Maxun](https://github.com/getmaxun/maxun)：代表网页采集从开发库走向可视化产品的路线，适合观察产品化和企业应用，按 B+ 级跟踪。
- [Bright Data MCP](https://github.com/brightdata/brightdata-mcp)：代表商业网页数据平台通过 MCP 进入 Agent 基础设施的路线，按 B+ 级跟踪。
- [Ferret](https://github.com/MontFerret/ferret)：提供与 API 型、无代码型不同的声明式网页数据工程路线，按 B+ 级跟踪。
- [ScrapeGraphAI](https://github.com/ScrapeGraphAI/Scrapegraph-ai)：自然语言驱动结构化抽取与 Firecrawl 形成互补，具备明确的 Agent 数据入口价值，按 A 级跟踪。

### Agent 数据基础设施 / 浏览器执行

- [Browser Use](https://github.com/browser-use/browser-use)：是网页数据之外 Agent 执行链的代表项目，与 Firecrawl 的读取能力形成互补，按 A 级跟踪。
- [Stagehand](https://github.com/browserbase/stagehand)：把确定性浏览器控制与 Agent 语义操作结合，是 Firecrawl 关联生态的重要执行层，按 A 级跟踪。
- [Skyvern](https://github.com/Skyvern-AI/skyvern)：代表浏览器 Agent 从工具库走向业务工作流平台的路线，按 A 级正式跟踪。
- [Lightpanda](https://github.com/lightpanda-io/browser)：直接回应 AI 时代网页采集和浏览器 Agent 的基础设施成本问题，按 A 级跟踪。
- [Agent Browser](https://github.com/vercel-labs/agent-browser)：结构化浏览器 CLI 是 Agent 执行层的新形态，热度与生态关联度较高，按 A 级跟踪。
- [OpenCLI](https://github.com/jackwener/OpenCLI)：将网页交互抽象为 Agent 可组合 CLI，是浏览器执行层近期高关注方向，按 A 级跟踪。
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)：MCP 已成为 Agent 接入浏览器的重要标准路径，官方实现具备强参考价值，按 A 级跟踪。

### Agent 工程基础设施 / 可组合运行时

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)：该项目由 AI 当日二次审计触发，直接命中编码智能体、可组合 Agent 运行时与沙箱基础设施方向；官方关系、原创实现、可运行性与行业影响均通过门槛，按 A 级正式跟踪。

### 生成式图像 / 视频与世界模型

- [SANA](https://github.com/NVlabs/Sana)：NVIDIA 官方原创图像、视频和世界模型实现，公开推理代码与Apache-2.0明确，近期持续维护；直接符合设计素材、视频和空间模型方向。

### Agent 工程 / 工作流与技能

- [MCode Stack](https://github.com/MiniMax-AI/mcode-stack)：官方团队把真实工作流制作成可安装Skills和插件，并提供manifest、版本与marketplace校验脚本，具有可复用工程价值；未冒称为MiniMax Code本体代码。

### Agent 评测 / 软件交付

- [ViBench](https://github.com/ViBench/vibench-public)：原创逐阶段软件交付基准，公开PRD、测试计划和Harbor运行器；能用于评估设计画布等产品任务，但9个保留应用未公开、自动grader有误差且复现有成本。

### 文档智能 / OCR质量判断

- [MiniCPM-OCR / Jev](https://github.com/OpenBMB/MiniCPM-OCR)：官方README、中文说明、Apache许可与实际SDK CLI/配置实现可核验；文档解析加区域级质量评分有明确复用价值，按作者实测边界以B级收录。

### 世界模型 / 交互生成

- [Hy-Nomas](https://github.com/Tencent-Hunyuan/Hy-Nomas)：已核对官方关系、README、实际实现目录、安装/评测入口、许可及当前维护元数据；具有可用的原创研究或官方工程实现，不以热度作为收录前提。

### 开放Agent训练配方

- [Axion 1.0](https://github.com/bytedance/axion1_0)：可检查的数据构造、验证答案与完整训练/评测工程符合Agent基础设施方向；代码与社区权重身份分别保留。

### AI Coding

- [Google Antigravity CLI](https://github.com/google-antigravity/antigravity-cli)：Existing approved project retained from the formal tracked inventory.
- [Claude Code](https://github.com/anthropics/claude-code)：人工 approved 保留；当前 v2.1.312，官方分发、插件及示例可核验，商业 LICENSE 不表示完整核心开源。
- [GitHub Copilot CLI](https://github.com/github/copilot-cli)：Existing approved project retained from the formal tracked inventory.
- [Grok Build](https://github.com/xai-org/grok-build)：Existing approved project retained from the formal tracked inventory.

### AI Agents

- [Hermes Agent](https://github.com/NousResearch/hermes-agent)：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。
- [Vibe Trading](https://github.com/HKUDS/Vibe-Trading)：保留既有正式跟踪；当前 README、根目录、README 安装或使用说明及最近提交、Issue/PR 与发布入口已核验；Stars 不单独决定质量，未安装外部代码或复测性能。

### WAIC 物理 AI / 世界模型与空间智能

- [Genie Envisioner](https://github.com/AgibotTech/Genie-Envisioner-V1)：智元机器人官方具身世界模型主线，可与 Genie Sim、EVAC 和 EWMBench 形成完整观察链路。
- [AgiBot World Model Baseline](https://github.com/AgibotTech/AgiBotWorldChallengeICRA2026-WorldModelBaseline)：智元机器人官方世界模型基线，直接反映物理 AI 从感知预测走向闭环行动的发展。
- [V-JEPA 2](https://github.com/facebookresearch/vjepa2)：Meta 官方世界模型研究主线，把大规模视频学习与真实机器人规划直接连接起来。
- [EWMBench](https://github.com/AgibotTech/EWMBench)：世界模型进入机器人控制前必须有可比较的评测体系，该项目是智元官方关键基础设施。
- [World-in-World](https://github.com/World-In-World/world-in-world)：ICLR 2026 Oral 官方项目，解决传统世界模型只看离线视频指标、忽略行动反馈的问题。
- [Cosmos Predict 2.5](https://github.com/nvidia-cosmos/cosmos-predict2.5)：物理 AI 世界模型的核心开放平台，可服务机器人、自动驾驶和工业数字孪生的数据生成。
- [JEPA World Models](https://github.com/facebookresearch/jepa-wms)：Meta 官方将世界模型落到机器人规划的研究代码，适合持续观察预测表征的实用边界。
- [ARTDECO](https://github.com/InternRobotics/ARTDECO)：上海 AI Lab ICLR 2026 官方项目，直接补齐物理 AI 从视觉输入到结构化空间状态的环节。

### 模型推理 / GPU Kernels

- [Hugging Face Kernels](https://github.com/huggingface/kernels)：同日 AI 强制候选；官方关系、原创性、可用性和近期维护证据充分，综合质量达到 A。

### 生成模型 / 原生多模态理解与生成

- [SenseNova-U1](https://github.com/OpenSenseNova/SenseNova-U1)：统一多模态理解与生成、中文高密度信息图、图文交错内容和开放训练链路均具有直接产品价值，列为生成式模型 A+ 重点跟踪项目。

### 3D 地理空间 / Agent 工具

- [Cesium AI Integrations](https://github.com/CesiumGS/cesium-ai-integrations)：同日 AI 强制候选；官方关系明确，可运行集成与 3D/设计自动化方向高度相关。

### 设计系统 / AI 辅助设计

- [Astryx](https://github.com/meta/astryx)：P0 AI 设计工具候选；官方关系、原创实现、可安装性、Demo、release 和维护证据充分，综合质量达到 A。

### AI for Science / 科研 Agent

- [Microsoft Discovery](https://github.com/microsoft/discovery)：同日 AI 强制候选；Microsoft 官方关系、可安装应用、科研 Agent 目录、starter kits 和协作维护均已核验，综合质量达到 A。

### Agent 协议 / 兼容性测试

- [MCP Conformance](https://github.com/modelcontextprotocol/conformance)：同日 AI 强制候选；官方关系、协议价值、原创实现和维护证据充分，综合质量达到 A。

### 生成模型 / 模型压缩

- [Diffuse Compressor](https://github.com/rootonchair/diffuse-compressor)：同日 AI 强制候选；原创性和可用性证据充分，但生态与长期维护证据较短，定为 B+。

### 图像生成 / 开放模型

- [FLUX](https://github.com/black-forest-labs/flux)：同日 AI 强制候选；精确官方仓库可验证，但对 FLUX 3 权重开放状态保持审慎，不作超出证据的推断。

### 开放模型 / 多模态 Agent

- [Kimi K3](https://github.com/MoonshotAI/Kimi-K3)：同日 AI 强制候选；官方关系、开放权重、技术新鲜度和行业影响显著，综合质量达到 A+。

### Agent 工程 / MCP

- [GitHub MCP Server](https://github.com/github/github-mcp-server)：同日 AI 强制候选；官方关系、协议实现、可部署性与维护活跃度均达到 A+。

### 医疗仿真 / 世界模型

- [Cosmos-H-Dreams](https://github.com/isaac-for-healthcare/Cosmos-H-Dreams)：同日 AI 强制候选；物理 AI 与医疗仿真价值明确、实现可运行，但官方关系和临床证据边界需持续提示，定为 B+。

### 世界模型 / 视频生成推理

- [FlashDreams](https://github.com/NVIDIA/flashdreams)：同日 AI 强制候选；官方实现、世界模型方向、可运行性与工程价值充分，综合质量达到 A。

### 生成模型 / 图像编辑 / ComfyUI

- [ComfyUI Krea2 Edit](https://github.com/lbouaraba/comfyui-krea2edit)：为 Krea 2 身份保持图像编辑提供可复现的原始运行实现，直接服务生成式设计和可控视觉内容生产，因此纳入正式跟踪。

### Agent 安全 / 端点可观测

- [Numbat](https://github.com/perplexityai/numbat)：最新已完成周报强制候选；官方关系、原创 Agent 安全实现、跨平台可安装性和近期维护证据均通过质量门槛。

### Agent 数据语义 / 查询基础设施

- [Malloy](https://github.com/malloydata/malloy)：同日 AI 强制候选；官方关系、原创语义层实现、可安装性和持续维护证据充分，综合质量达到 A。

### 世界模型 / 物理 AI

- [Kairos](https://github.com/DAXIAORobotics/kairos)：官方项目仓库，Apache-2.0 许可，具备原创论文、完整代码结构和明确维护证据。
- [NVIDIA Cosmos](https://github.com/NVIDIA/cosmos)：同日 AI 日报强制候选；NVIDIA 官方组织仓库，原创实现、README、活跃 issue/PR 与近期提交均已核验。

### AI SDK / Agent 工程

- [Google Gen AI JS SDK](https://github.com/googleapis/js-genai)：最新已完成周报强制候选；官方身份、可安装 SDK、持续维护与 Agent/多模态工程价值均通过质量门槛。

### AEC / 3D 建筑设计

- [Pascal Editor](https://github.com/pascalorg/editor)：命中 AEC/3D P0 方向；官方关系、原创实现、安装与演示入口、近期发布及维护活跃度均通过质量门槛。

### AI 计算基础设施 / GPU

- [AMD ROCm](https://github.com/ROCm/legacy-rocm-build)：同日 AI 强制候选；AMD 官方基础设施、稳定公开仓库、活跃维护和模型训练实用性充分，综合质量达到 A+。

### 生成模型 / 高效推理

- [Nunchaku](https://github.com/nunchux-ai/nunchaku)：同日 AI 强制候选；原创实现、可安装性、模型生成价值和维护活跃度均已核验，综合质量达到 A。

### 物理 AI / 世界模型与智能空间

- [Gemini Robotics Samples](https://github.com/google-gemini/robotics-samples)：7 月 31 日 AI 日报强制候选；仓库直接对应 Gemini Robotics 2/ER 2 的物理 Agent、连续视频理解、任务编排和多机器人协作，符合 ark.insight 物理 AI 与智能空间最高优先方向。

### 端侧 AI / 模型推理

- [MNN](https://github.com/alibaba/MNN)：官方身份、成熟原创实现、Apache-2.0 许可、端侧多模态价值、近期发布与维护活跃度均通过质量门槛。

### 浏览器 AI / 模型推理

- [Transformers.js](https://github.com/huggingface/transformers.js)：官方关系、原创浏览器推理实现、Apache-2.0 许可、可安装性、近期发布和持续协作均通过质量门槛。

### 视频生成 / 物理 AI

- [LingBot-Video](https://github.com/Robbyant/lingbot-video)：连续观察后出现新的持续维护证据，且仓库具备原创模型、开放权重、可运行安装路径和物理 AI 视频生成价值，因此由 observe 转为正式跟踪。

### WAIC 物理 AI / 仿真、合成数据与 Sim2Real

- [Habitat Lab](https://github.com/facebookresearch/habitat-lab)：Meta 官方具身 AI 任务层基础设施，覆盖空间导航到移动操作的关键研究路径。
- [ManiSkill](https://github.com/mani-skill/ManiSkill)：操作学习领域的成熟开放平台，适合统一验证 VLA、模仿学习和强化学习策略。
- [RoboTwin](https://github.com/RoboTwin-Platform/RoboTwin)：覆盖数字孪生、合成数据和双臂操作，是制造业物理 AI 需要长期关注的工程平台。
- [Unitree MuJoCo](https://github.com/unitreerobotics/unitree_mujoco)：连接国内主流机器人硬件与开放物理仿真的官方项目，对 WAIC 人形机器人方向具有直接价值。
- [Genesis](https://github.com/Genesis-Embodied-AI/genesis-world)：新一代开放物理仿真平台，能够补充传统机器人模拟器在速度和生成式场景上的能力。
- [BEHAVIOR-1K / OmniGibson](https://github.com/StanfordVL/BEHAVIOR-1K)：Stanford 官方大规模交互式任务基准，适合检验机器人是否真正理解并改变物理环境。
- [RoboCasa](https://github.com/robocasa/robocasa)：把高质量室内场景生成与机器人操作结合，适合关注空间设计和具身任务的交叉方向。
- [Habitat Sim](https://github.com/facebookresearch/habitat-sim)：Meta 官方具身仿真底座，与 Habitat Lab 共同构成空间智能研究的核心平台。
- [Isaac Lab](https://github.com/isaac-sim/IsaacLab)：当前物理 AI 仿真和合成数据的重要工业底座，机器人研究与产品验证均应持续关注。
- [MuJoCo](https://github.com/google-deepmind/mujoco)：Google DeepMind 官方基础设施，是机器人算法比较和可复现实验的长期核心基线。
- [Cosmos Transfer 2.5](https://github.com/nvidia-cosmos/cosmos-transfer2.5)：NVIDIA 官方物理 AI 数据生成主线，直接服务 Sim2Real、机器人感知和世界仿真。
- [MolmoSpaces](https://github.com/allenai/molmospaces)：Ai2 官方 simulation-first 物理 AI 栈，覆盖场景、数据、训练和 Sim2Real 的完整链路。

### WAIC 物理 AI / 机器人学习、控制与数据

- [RoboInter](https://github.com/InternRobotics/RoboInter)：上海 AI Lab ICLR 2026 官方完整套件，覆盖数据、推理、规划和执行，是物理 AI 核心项目。
- [InternNav](https://github.com/InternRobotics/InternNav)：上海 AI Lab 官方导航主线，连接空间理解、语言指令和真实机器人移动控制。
- [Unitree RL Gym](https://github.com/unitreerobotics/unitree_rl_gym)：国内人形机器人运动控制的重要官方基线，适合持续跟踪物理 AI 从策略到硬件的落地。
- [InternManip](https://github.com/InternRobotics/InternManip)：上海 AI Lab 官方操作学习基础设施，可降低不同数据集和模型之间的工程割裂。
- [RoboSplat](https://github.com/InternRobotics/RoboSplat)：把 3DGS 与机器人策略训练直接结合，和平台现有 3D 重建主线具有高协同价值。
- [UltraDexGrasp](https://github.com/InternRobotics/UltraDexGrasp)：上海 AI Lab ICRA 2026 官方项目，命中制造和服务机器人最关键的灵巧操作能力。
- [NavDP](https://github.com/InternRobotics/NavDP)：ICRA 2026 官方 Sim2Real 导航项目，直接体现用高效仿真数据驱动真实机器人决策。

### 视频生成 / 音视频联合模型

- [Kandinsky 6.0](https://github.com/kandinskylab/kandinsky-6)：官方模型、许可、代码与集成说明可核验，符合视频模型主线，纳入正式持续跟踪。
- [Prism](https://github.com/Tencent-Hunyuan/Prism)：作者论文、腾讯混元官方代码和模型卡相互链接，原创研究方向明确；先进入观察库存，不宣称生产成熟。

### 世界模型 / 机器人遥操作

- [RynnWorld-Teleop](https://github.com/alibaba-damo-academy/RynnWorld-Teleop)：candidate-decisions 已批准；官方组织下的精确仓库已核验，含训练、推理、配置和示例代码。

### 3DGS / 三维工具

- [Godot Gaussian Splatting](https://github.com/ReconWorldLab/godot-gaussian-splatting)：进入 OSS Insight 24 小时前 20，且与 3DGS/设计工具主线高度一致；可运行性、许可和近期发行均已核验。

### 开放模型 / 训练效率

- [Modded-NanoGPT](https://github.com/KellerJordan/modded-nanogpt)：同日 AI 日报强制候选，OpenAI 官方报告直接链接；MIT 许可、2,000 余次提交、完整 README 与可运行训练流程均已核验。

### Agent Skills / 音频生成

- [ElevenLabs Skills](https://github.com/elevenlabs/skills)：同日 AI 强制候选；官方、可安装、有测试且对多媒体 Agent 工作流有直接实用价值。

### 3D / OpenUSD 实验

- [Omniverse Labs](https://github.com/NVIDIA-Omniverse/omniverse-labs)：同日 AI 强制候选；与 OpenUSD/3D 工具链高度相关，但因实验性质和较短历史定为 B。

### 模型后训练 / Agentic RL

- [Tunix](https://github.com/google/tunix)：同日 AI 强制候选；官方 Agentic RL 更新直接对应仓库，原创性、维护和可复现性证据充分。

### Agent Skills / Gemini 开发

- [Gemini Skills](https://github.com/google-gemini/gemini-skills)：同日 AI 强制候选；精确官方仓库、可安装性和维护证据均已核验，同时保留非正式支持风险。

### 生成模型 / 推理基础设施

- [Hugging Face Diffusers](https://github.com/huggingface/diffusers)：同日 AI 强制候选；精确官方仓库、原创实现、可安装性和活跃维护均已核验，综合质量达到 A+。

### 3D 场景描述 / 设计基础设施

- [OpenUSD](https://github.com/PixarAnimationStudios/OpenUSD)：同日 AI 强制候选；官方 release 与精确仓库已核验，对 3D/AEC/设计互操作具有基础设施级价值。

### 3D物理资产修复 / Agent

- [GenesisWorkbenchEnv](https://github.com/earakely-scale/agentenv-genesis-plugin)：面向VLM-to-CAD和扫描模型的物理错误修复、真实尺度反馈与多引擎检查，符合3D/物理AI及生成资产验收方向；仅作为待复现原型跟踪。

### Agent 协作协议

- [MiniMax BYOB Agent Table](https://github.com/MiniMax-AI/mcode-agent-table)：主人签名与执行/核验回执为跨人员Agent协作提供可检查实现；适合原型评估并保留单机和未复现实测限制。

### 视频 3D 舞台 / 文生三维

- [VIST3A](https://github.com/gohyojun15/VIST3A)：ICLR 2026 Oral 作者官方实现，代表利用视频先验构建 3D 资产和舞台的新方法。

### 视频 3D 舞台 / 空间理解

- [VLM-3R](https://github.com/VITA-Group/VLM-3R)：CVPR 2026 官方实现，训练、评测和模型权重已开放，是视频空间理解连接多模态 Agent 的重要组件。

### WAIC 物理 AI / VLA 与机器人基础模型

- [InternVLA-M1](https://github.com/InternRobotics/InternVLA-M1)：上海 AI Lab 官方通用操作策略，和 WAIC 空间智能、具身交互主题高度一致。
- [UniVLA](https://github.com/OpenDriveLab/UniVLA)：OpenDriveLab 官方通用机器人策略项目，代表用统一动作表示降低本体碎片化的关键方向。
- [OpenVLA](https://github.com/openvla/openvla)：开放 VLA 领域的核心项目，可作为新模型、数据集和机器人策略的长期比较基线。
- [OpenPI](https://github.com/Physical-Intelligence/openpi)：当前开放 VLA 体系的重要基线，模型、训练和部署链路对通用机器人研究具有高参考价值。
- [LeRobot](https://github.com/huggingface/lerobot)：Hugging Face 官方机器人生态底座，适合持续跟踪模型从研究代码走向真实设备部署。
- [starVLA](https://github.com/starVLA/starVLA)：提供可比较、可扩展的 VLA 工程底座，适合跟踪 PhysBrain、NeuroVLA 等新策略。
- [InternVLA-A Series](https://github.com/InternRobotics/InternVLA-A-series)：上海 AI Lab 官方 VLA 主线项目，体现理解、生成和行动统一建模的发展趋势。
- [ACoT-VLA](https://github.com/AgibotTech/ACoT-VLA)：智元机器人官方 VLA 基线，直接覆盖物理 AI 的感知、认知、决策与执行闭环。
- [MolmoAct 2](https://github.com/allenai/molmoact2)：Ai2 官方开放物理 AI 模型，强调空间理解和动作生成，是多模态模型走向机器人执行的重要路线。

### 视频自动剪辑 / 程序化制作

- [Remotion](https://github.com/remotion-dev/remotion)：成熟的程序化视频生产工具，可把 AI 生成的脚本、素材和结构稳定转成可重复渲染的成片。

### 3D 重建

- [LingBot-Map](https://github.com/Robbyant/lingbot-map)：官方团队仓库，提供模型权重、推理代码、基准脚本和长视频示例，直接符合 3D 重建主线。
- [FLARE](https://github.com/robbyant-research/FLARE)：蚂蚁研究官方原创实现，属于前馈重建与快速场景建模的重点候选。
- [FineRecon](https://github.com/apple-aiml-research/ml-finerecon)：Apple 官方机器学习研究仓库，论文与实现关系明确，适合补齐高精度室内重建路线。
- [Neuralangelo](https://github.com/NVlabs/neuralangelo)：NVIDIA 官方 CVPR 2023 实现，原创性和高精度表面重建价值明确。
- [NeuralRecon](https://github.com/zju3dv/NeuralRecon)：CVPR 2021 Oral 论文作者官方代码，Apache-2.0 许可，作为实时单目重建基线仍有价值。
- [VGG-T3](https://github.com/nv-dvl/vgg-ttt)：NVIDIA Deep Vision Lab 官方论文代码，属于 LingBot-Map 同类前馈重建新路线。
- [MapAnything](https://github.com/facebookresearch/map-anything)：Meta 官方研究仓库，Apache-2.0 许可、原创模型与完整任务范围明确，属于 LingBot-Map 同类核心底座。
- [WorldMirror](https://github.com/Tencent-Hunyuan/HunyuanWorld-Mirror)：腾讯混元官方 ICML 2026 项目，原创模型、代码和世界模型方向均清晰。
- [Stable Fast 3D](https://github.com/Stability-AI/stable-fast-3d)：Stability AI 官方原创实现，具有清晰的图像到 3D 应用价值。
- [VGGT](https://github.com/facebookresearch/vggt)：Meta 官方研究仓库，包含原创实现和模型资源，行业适配度高。
- [Nerfstudio](https://github.com/nerfstudio-project/nerfstudio)：成熟原创工具链，长期被 3D 重建研究与工程流程采用；高质量实景扫描优先验证 Splatfacto-big。
- [MoGe](https://github.com/microsoft/MoGe)：Microsoft 官方研究实现，原创论文与代码关系明确。

### 3D 世界生成

- [SceneMosaic](https://github.com/rxjfighting/SceneMosaic)：直接连接室内空间生成、仿真数据和具身智能训练，是 3D 智能空间与物理 AI 的关键上游能力，按 A 级正式跟踪。
- [HunyuanWorld Voyager](https://github.com/Tencent-Hunyuan/HunyuanWorld-Voyager)：腾讯混元官方原创项目，把可控世界生成与实时 3D 重建连接在同一工作流中。
- [CraftsMan](https://github.com/HKUST-SAIL/CraftsMan3D)：HKUST SAIL 官方原创模型代码，方向清晰且具备可编辑几何价值。
- [Matrix-3D](https://github.com/SkyworkAI/Matrix-3D)：官方原创项目，MIT 许可，明确覆盖 3D 场景生成、重建、全景合成与世界模型。
- [EmbodiedGen](https://github.com/HorizonRobotics/EmbodiedGen)：企业官方原创项目，2026 年仍持续更新，覆盖生成式场景和具身仿真的关键交叉方向。
- [HY-World 2.0](https://github.com/Tencent-Hunyuan/HY-World-2.0)：腾讯混元官方项目，2026 年发布并获得持续关注，完整覆盖本次扩充的三个核心方向。
- [MesaTask](https://github.com/InternRobotics/MesaTask)：NeurIPS 2025 Spotlight 官方实现，MIT 许可，原创任务驱动场景生成路线明确。
- [PartCrafter](https://github.com/wgsxm/PartCrafter)：NeurIPS 2025 官方实现，MIT 许可，提供结构化而非单体式 3D 资产生成能力。
- [Diffusion as Shader](https://github.com/IGL-HKUST/DiffusionAsShader)：SIGGRAPH 2025 官方项目，Apache-2.0 许可，提供 3D 控制与生成式视觉设计的新路线。
- [One2Scene](https://github.com/Wang-pengfei/One2Scene)：ICLR 2026 作者官方代码与模型已公开，是单图生成可探索 360 度 AI 世界的代表项目。
- [DiffSplat](https://github.com/chenguolin/DiffSplat)：ICLR 2025 作者官方实现与模型公开，补足单图 3DGS 生成和快速资产原型方向。
- [TripoSG](https://github.com/VAST-AI-Research/TripoSG)：Tripo 团队官方原创项目，MIT 许可、模型路线和图像到 3D 用途明确。

### 视频生成 / 基础模型

- [HunyuanVideo](https://github.com/Tencent-Hunyuan/HunyuanVideo)：腾讯官方高影响力开源视频模型，是自建视频生成能力和第三方工作流适配的核心基线。

### 视频自动剪辑 / 内容生产

- [Vidi](https://github.com/bytedance/vidi)：字节跳动官方项目，直接命中“视频理解后自动剪辑”的完整工作流，而非单一视觉模型。

### 视频算法 / 人体 4D

- [ActionMesh](https://github.com/facebookresearch/actionmesh)：Meta 官方视频到可动画网格项目，直接连接算法研究与 3D 角色舞台生产。

### 视频自动剪辑 / 指令编辑

- [Kiwi-Edit](https://github.com/showlab/Kiwi-Edit)：作者团队官方 2026 项目，代码、数据和编辑范式较完整，可用于自动视频修改能力评估。

### AI 图像与视频生成工具

- [SD.Next](https://github.com/vladmandic/sdnext)：命中 AI 图像/视频生成与设计工具 P0 方向；原创性、可安装性、许可、成熟度和持续维护均通过质量门槛。

### 视频生成 / 语义控制

- [Video-As-Prompt](https://github.com/bytedance/Video-As-Prompt)：字节跳动官方 ICLR 2026 项目，已提供低显存训练与推理路径，适合镜头运动和动效复用。

### 视频生成 / RGBA 合成

- [Wan-Alpha](https://github.com/WeChatCV/Wan-Alpha)：微信视觉团队 CVPR 2026 Highlight 官方实现，直接解决视频生成进入专业合成流程的关键格式问题。

### 视频生成 / 轻量模型

- [HunyuanVideo 1.5](https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5)：腾讯混元官方 2026 迭代，能持续反映开放视频模型向更轻量部署发展的进度。

### 视频编辑 / 实时控制

- [EditCtrl](https://github.com/yehonathanlitman/EditCtrl)：CVPR 2026 作者官方代码，适合跟踪视频编辑从离线生成走向交互式创作的进展。

### 物理一致 3D

- [TelePhysics](https://github.com/xinzhang007/PhysOmni)：ACM MM 2026 作者官方代码，直接处理物体穿透、空间错位、碰撞响应和多材料动力学。
- [SAM3D-Phys](https://github.com/CHNxindong/SAM3D-Phys_code)：项目页直链的作者官方仓库，研究主题高度匹配；作为代码发布观察项收录，不将其标记为已可用。
- [REST3D](https://github.com/ShirleyMaxx/REST3D)：论文作者官方仓库且已发布完整代码，直接覆盖场景图、支撑关系、碰撞修正与重力稳定这一前沿方向。

### 视频编辑 / 评测基准

- [IVEBench](https://github.com/RyanChenYN/IVEBench)：ICLR 2026 官方基准，可用于统一比较不同视频编辑模型，避免仅凭演示视频判断质量。

### 视频编辑 / 分层分解

- [EasyOmnimatte](https://github.com/GVCLab/EasyOmnimatte)：CVPR 2026 官方实现，提供从单层视频走向结构化可编辑素材的重要能力。

### 视频编辑 / 稀疏控制

- [NOVA](https://github.com/WeChatCV/NovaEdit)：微信视觉团队 CVPR 2026 官方仓库，代表低标注成本视频编辑的新方向。

### 视频 3D 舞台 / 全景生成

- [OmniRoam](https://github.com/yuhengliu02/OmniRoam)：SIGGRAPH 2026 作者官方项目，直接覆盖全景视频、三维重建和沉浸式舞台内容。

### 视频编辑 / 区域控制

- [ReCo](https://github.com/HiDream-ai/ReCo)：ICML 2026 官方实现，模型、数据和编辑评测链路较完整，工程可验证性较强。

### 视频自动剪辑 / 时间线

- [OpenTimelineIO](https://github.com/AcademySoftwareFoundation/OpenTimelineIO)：Academy Software Foundation 核心项目，是 AI 自动剪辑结果进入专业后期软件的可靠基础设施。

### 视频 3D 舞台 / 重拍

- [Vista4D](https://github.com/Eyeline-Labs/Vista4D)：CVPR 2026 Highlight 官方代码、模型和数据已发布，直接对应视频 3D 舞台与虚拟摄影。

### 视频 3D 舞台 / 世界生成

- [WorldStereo](https://github.com/FuchengSu/WorldStereo)：腾讯混元与浙大团队 CVPR 2026 官方项目，代码和模型权重已发布，是视频生成与 3D 场景融合的核心路线。

### 视频 3D 舞台 / 虚拟摄影机

- [Stable Virtual Camera](https://github.com/Stability-AI/stable-virtual-camera)：Stability AI 官方开放项目，为产品化的虚拟摄影机、镜头预演和空间视频生成提供基线。

### 视频 3D 舞台 / 几何一致生成

- [World-R1](https://github.com/microsoft/World-R1)：微软 ICML 2026 官方仓库，明确解决视频生成缺乏 3D 一致性和镜头控制的问题。

### 视频 3D 舞台 / 视差动画

- [DepthFlow](https://github.com/BrokenSource/DepthFlow)：工程化程度较高，可作为低成本图片转 3D 镜头、舞台背景和短视频动效工具。

### AI Security

- [Strix](https://github.com/usestrix/strix)：保留既有正式跟踪；当前 README、根目录、README 安装或使用说明及最近提交、Issue/PR 与发布入口已核验；Stars 不单独决定质量，未安装外部代码或复测性能。

### 个人 AI 助手 / Agent 平台

- [OpenClaw](https://github.com/openclaw/openclaw)：同日 AI 强制候选；官方关系、原创实现、可安装性、持续发布和维护活跃度充分，综合质量达到 A。

### 物理场景生成

- [SceneWeaver](https://github.com/Scene-Weaver/SceneWeaver)：NeurIPS 2025 官方实现，具备碰撞规避、边界约束和可交互室内场景输出能力。
- [PhyScene](https://github.com/PhyScene/PhyScene)：CVPR 2024 Highlight 官方完整实现，是物理约束室内场景生成的重要公开基线。

### 3D 场景重建

- [Gen3DSR](https://github.com/AndreeaDogaru/Gen3DSR)：3DV 2025 作者官方实现，是 REST3D、PhyMix 等方法使用和比较的单图场景重建基础路线。
- [REPARO](https://github.com/VincentHancoder/REPARO)：论文作者官方实现，可作为从多对象视觉重建走向场景级物理修正的关键上游组件。

### 仿真就绪 3D

- [SceneCode](https://github.com/wangpuyi/SceneCode)：论文作者官方开源仓库，MIT 许可，连接了空间设计、程序化建模、可编辑资产和物理仿真。
- [Lightwheel SimReady Assets](https://github.com/LightwheelAI/Lightwheel-simready-asset)：Lightwheel 官方资产库，定位清晰且直接补足 SimReady 数据与场景资产层。
- [Genie Sim](https://github.com/AgibotTech/genie_sim)：企业官方主仓库、近期持续维护且已有稳定关注度，是生成式仿真基础设施的重要样本。
- [SimArt](https://github.com/ByteDance-Seed/SimArt)：字节 Seed 官方 SIGGRAPH 2026 项目，Apache-2.0 许可，原创性和 SimReady 方向高度明确。
- [REACT3D](https://github.com/troyehuang/REACT3D)：ETH Zurich 与 Microsoft 作者官方 RA-L 2026 代码，直接解决静态重建无法物理交互的问题。
- [SceneSmith](https://github.com/nepfaff/scenesmith)：MIT 与 Toyota Research Institute 的 ICML 2026 Spotlight 官方代码，MIT 许可且工程链条完整。
- [Fysiverse 3D SimReady](https://github.com/Fysics-AI/Fysiverse-3D-SimReady)（已下架：2026-09-08，保留历史记录）：只有 5 Stars 仍按 P0 审查。实读 SAM3D 调用、仿真入口和 assistance 实现，有分割/几何对齐/SAPIEN settling、场景导出和可选 3DGS 流程，批准。安装须另配模型和 Blender；场景图、补图及 Agent 仿真可依赖外部 API。不是完整自有模型/引擎开源，未复现。

### 3DGS 物理仿真

- [PhySimGS](https://github.com/PhySimGS/PhySimGS)：官方项目页直链仓库，补充了 3DGS 从静态视觉表示走向对象级物理模拟的重要路线。

### 视频算法 / 分割

- [SAM 2](https://github.com/facebookresearch/sam2)：视频抠像、目标替换、特效跟踪和自动剪辑的通用基础组件，官方代码与权重生态成熟。

### WAICA 2026 / 数据智能

- [AIDABench](https://github.com/MichaelYang-lyx/AIDABench)：WAICA 2026 主会议录用项目，论文标题、作者与官方仓库可相互核验。

### 3D 场景评测

- [SceneEval](https://github.com/3dlg-hcvc/SceneEval)：WACV 2026 Oral 作者官方代码，可作为物理场景生成质量核验和自动回归测试基础。

### 视频算法 / 跟踪

- [CoTracker](https://github.com/facebookresearch/co-tracker)：Meta 官方点跟踪基线，可直接支撑视频稳像、运动分析、3D 重建和虚拟摄影。

### 视频算法 / 动作识别

- [MMAction2](https://github.com/open-mmlab/mmaction2)：视频内容分类、片段检索和自动摘要的成熟工程底座，维护周期长且生态完整。

### 视频算法 / 表征学习

- [VideoMAE](https://github.com/MCG-NJU/VideoMAE)：视频基础表征的高影响力官方实现，适合作为自有行业视频模型训练基线。

### WAICA 2026 / Agent 训练

- [InternBootcamp](https://github.com/InternLM/InternBootcamp)：官方仓库明确标注 InternBootcamp 技术报告被 WAICA 2026 接收，并提供对应代码版本。

### 视频生成 / 编辑模型

- [Bernini](https://github.com/bytedance/Bernini)：字节跳动 2026 官方开源项目，代码与权重完整，是生成和编辑统一化的重要新路线。

### 视频算法 / 多模态理解

- [VideoLLaMA 2](https://github.com/DAMO-NLP-SG/VideoLLaMA2)：阿里达摩院团队官方实现，覆盖视频内容理解向自然语言检索与摘要的关键链路。

### 视频算法 / 基础模型

- [InternVideo](https://github.com/OpenGVLab/InternVideo)：上海人工智能实验室官方视频基础模型项目，适合长期跟踪开放模型与评测进展。
- [VideoChat-Flash](https://github.com/OpenGVLab/VideoChat-Flash)：OpenGVLab 官方仓库，原 InternVideo2 地址已重定向至该 canonical 项目，可持续跟踪长视频理解能力。

### 视频生成 / 多模态模型

- [Lance](https://github.com/bytedance/Lance)：字节跳动 2026 官方研究仓库，方向同时覆盖视频理解、生成和编辑，适合列为前沿跟踪。

### 视频算法 / 4D 轨迹

- [TraceAnything](https://github.com/ByteDance-Seed/TraceAnything)：字节跳动 Seed 官方 ICLR 2026 项目，是视频运动理解连接 4D 场景与虚拟制作的重要底层能力。

### 视频生成 / 长视频

- [Stable Video Infinity](https://github.com/vita-epfl/Stable-Video-Infinity)：EPFL 团队 ICLR 2026 Oral 官方实现，是长视频生成与连续舞台背景的重要研究方向。

### 3DGS

- [SHARP](https://github.com/apple-aiml-research/ml-sharp)：Apple 官方论文代码、模型权重与命令行流程完整，是单图快速试验的首选基线。
- [StreamSplat](https://github.com/DSL-Lab/StreamSplat)：论文作者官方实现，聚焦在线动态重建，和 LingBot-Map 的流式空间理解路线直接相关。
- [3DGRUT](https://github.com/nv-tlabs/3dgrut)：NVIDIA 研究团队官方原创实现，Apache-2.0 许可、近期维护活跃且直接服务 3DGS 工程。
- [MVSplat](https://github.com/donydchen/mvsplat)：ECCV 2024 Oral 作者官方代码与预训练模型完整，被多项后续稀疏视图方法作为基础。
- [StructSplat](https://github.com/J-C-Zhao/StructSplat)：ECCV 2026 作者官方训练、评测代码与权重已公开，属于未标定稀疏视图的最新 SOTA 路线。
- [MVSplat360](https://github.com/donydchen/mvsplat360)：NeurIPS 2024 作者官方代码与模型公开，补足稀疏多图到 360 度场景合成路线。
- [DepthSplat](https://github.com/cvg/depthsplat)：CVPR 2025 作者官方代码、模型与多视图配置齐全，是多图产品原型和高质量重建的重要基线。
- [pixelSplat](https://github.com/dcharatan/pixelsplat)：CVPR 2024 Oral 与最佳论文候选作者代码，是后续 MVSplat、NoPoSplat 等方法的基础参照。
- [VolSplat](https://github.com/ziplab/VolSplat)：ECCV 2026 作者官方训练、评测代码与模型已公开，是体素对齐前馈 3DGS 的最新路线。
- [FastGS](https://github.com/fastgs/FastGS)：CVPR 2026 官方代码、模型和多任务分支已发布，适合评估高质量扫描的吞吐与成本。
- [NoPoSplat](https://github.com/cvg/NoPoSplat)：ICLR 2025 Oral 作者官方代码和多组预训练权重可用，是无位姿稀疏多图的关键基线。
- [Spark](https://github.com/sparkjsdev/spark)：由 World Labs 团队推动的原创渲染项目，仓库活跃且使用路径清晰。
- [ReSplat](https://github.com/cvg/resplat)：ECCV 2026 作者官方代码和模型已公开，提供比一次性前馈模型更可控的测试时质量提升路径。
- [SuperSplat](https://github.com/playcanvas/supersplat)：PlayCanvas 官方原创编辑器，产品完成度和近期维护状态均较好。
- [gsplat](https://github.com/nerfstudio-project/gsplat)：Nerfstudio 团队维护的原创基础设施，近期仍持续更新；MCMC 是高质量实景扫描的重要实验路线。
- [Depth Anything 3](https://github.com/ByteDance-Seed/Depth-Anything-3)：ByteDance Seed 官方代码和模型齐全，输入形态与导出链路完整，适合作为产品原型的统一几何底座。
- [AnySplat](https://github.com/InternRobotics/AnySplat)：作者团队公开训练、推理、模型与 Gradio 演示，直接覆盖随手拍稀疏多图重建。
- [3D Gaussian Splatting](https://github.com/graphdeco-inria/gaussian-splatting)：论文作者官方原创实现，属于 3DGS 必收录的基础仓库。
- [AdaptSplat](https://github.com/xmw666/AdaptSplat)：解决前馈 3DGS 跨域迁移这一实际落地瓶颈，适合作为快速重建产品的模型适配层持续观察，按 B+ 级正式跟踪。
- [InstantHDR](https://github.com/Bugjudger/InstantHDR)：将 HDR 成像与前馈 3DGS 初始化直接结合，补足高光、暗部和曝光变化场景的实景重建能力，按 A 级正式跟踪。
- [FreeSplatter](https://github.com/TencentARC/FreeSplatter)：腾讯 ARC 官方 ICCV 2025 实现，原创论文与代码对应，直接补充无位姿 3DGS 重建路线。

### 建筑 / AEC

- [Speckle](https://github.com/specklesystems/speckle-server)：Speckle 官方主仓库，属于建筑数据协作与自动化的核心基础设施。
- [FreeCAD](https://github.com/FreeCAD/FreeCAD)：官方主仓库、持续维护且行业覆盖完整，是 CAD/AEC 基础项目。
- [Hypar Elements](https://github.com/hypar-io/Elements)：Hypar 官方原创 BIM 库，活跃且定位清晰。
- [Text2BIM](https://github.com/dcy0577/Text2BIM)：论文对应的原创实现，方向高度匹配，即使热度较低也应纳入观察库。
- [IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell)：长期维护的原创 IFC 基础设施，建筑与 BIM 方向必须收录。
- [COMPAS](https://github.com/compas-dev/compas)：计算建筑领域的原创基础框架，近期仍在维护。

### 设计工具

- [OpenPencil](https://github.com/open-pencil/open-pencil)：官方原创实现、近期持续推送，符合 AI 设计工具方向。
- [Penpot](https://github.com/penpot/penpot)：官方主仓库、长期维护、非复刻演示，具备真实团队使用价值。
- [CADAM](https://github.com/Adam-CAD/CADAM)：原创开源产品，具备完整交互、导出和近期发布记录。

### 开放模型

- [GPT-OSS](https://github.com/openai/gpt-oss)：模型发布方官方仓库，开放权重、代码和使用路径完整。
- [Qwen3](https://github.com/QwenLM/Qwen3)：官方主仓库，属于开放模型生态的核心长期跟踪对象。
- [Isaac GR00T](https://github.com/NVIDIA/Isaac-GR00T)：NVIDIA 官方模型仓库，2026 年持续发布新版本，适合作为空间智能前沿观察项。
- [Cube 3D](https://github.com/Roblox/cube)：Roblox 官方模型与代码仓库，2026 年继续发布 CubePart 更新。
- [WorldEngine](https://github.com/OpenDriveLab/WorldEngine)：OpenDriveLab 官方原创项目，2026 年创建并持续维护。
- [TRELLIS](https://github.com/microsoft/TRELLIS)：Microsoft 官方 CVPR 2025 Spotlight 项目，MIT 许可且工程生态成熟，是 3D 生成基础模型核心仓库。

### 室内与空间

- [Lightwheel Kitchen](https://github.com/LightwheelAI/Lightwheel_Kitchen)：官方原创室内仿真场景，直接连接厨房空间、可交互资产与机器人训练。
- [SpatialLM](https://github.com/manycore-research/SpatialLM)：官方论文代码与模型方向明确，直接服务室内空间理解和结构化建模。
- [InteriorGS](https://github.com/manycore-research/InteriorGS)：官方数据仓库，覆盖室内设计与 3DGS 的交叉重点方向。
- [RoomFormer](https://github.com/ywyue/RoomFormer)：CVPR 2023 官方原创实现，是户型重建方向的有效基础项目。
- [SpatialGen](https://github.com/manycore-research/SpatialGen)：3DV 2026 官方实现，原创训练代码与室内生成任务高度相关。
- [SceneScript](https://github.com/facebookresearch/scenescript)：Meta 官方研究代码，面向室内空间结构化表达，非第三方复刻。
- [HouseCrafter](https://github.com/neu-3dvi/houseCrafter)：ICCV 2025 Highlight 官方代码与预训练模型，原创性和场景价值明确。

### 3D 生成 / 设计工具

- [img2threejs](https://github.com/img2threejs/img2threejs)：2026-07-21 首次收录后持续进入 surging 队列，仓库已迁移到官方组织并发布 v1.5.0；Apache-2.0 许可、原创程序化 3D 流程、浏览器 Demo、近期提交和社区增长均已核验，继续正式跟踪。
- [Text-To-3D-Generation](https://github.com/Lidong1793/Text-To-3D-Generation)：仓库包含可运行的流程编排、参数消融、结果记录和网页演示，适合 3D AI 学习与产品原型；但它不是原创 Text-to-3D 模型，且许可证与几何质量边界尚未解决，因此作为设计工具观察收录。

### 开放模型 / 模型训练

- [LLaMA Factory](https://github.com/hiyouga/LlamaFactory)：本地快照新增 Stars 25 且近期持续维护；成熟度、原创性、可安装性和开放模型方向价值均通过质量门槛。

### 视频生成 / 自动剪辑

- [Toonflow](https://github.com/HBAI-Ltd/Toonflow-app)：命中 OSS Insight 24 小时趋势且产品实现完整；在明确记录非标准许可风险的前提下纳入持续跟踪。

### 具身智能 / Agentic RL

- [RLinf](https://github.com/RLinf/RLinf)：P0 物理 AI 候选；原创实现、近期提交、README、安装文档和社区协作证据充分，综合质量达到 A。

### 文档智能 / 长文档解析

- [Unlimited OCR 2](https://github.com/baidu/Unlimited-OCR)：百度官方仓库的推理实现、文档批处理和后处理路径真实可读，部署方法与显存约束明确；长文档解析有实用价值，以B级收录并保留未复现与许可边界。

### AI Productivity

- [PPT Master](https://github.com/hugohe3/ppt-master)：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。

### Agent Infrastructure

- [GitHub Copilot SDK](https://github.com/github/copilot-sdk)：Existing approved project retained from the formal tracked inventory.
- [NitroStack](https://github.com/nitrocloudofficial/nitrostack)：Existing approved project retained from the formal tracked inventory.

### World Models

- [RynnWorld-4D](https://github.com/alibaba-damo-academy/RynnWorld-4D)：Existing approved project retained from the formal tracked inventory.
- [MIRA World Model](https://github.com/mira-wm/mira)：Existing approved project retained from the formal tracked inventory.

### AI 3D

- [Meshy 3D Agent](https://github.com/meshy-dev/meshy-3d-agent)：Existing approved project retained from the formal tracked inventory.
- [TripoSR](https://github.com/VAST-AI-Research/TripoSR)：Existing approved project retained from the formal tracked inventory.

### AI Visualization

- [Flint Chart](https://github.com/microsoft/flint-chart)：Existing approved project retained from the formal tracked inventory.

### CAD / Agent Skills

- [CAD Skills](https://github.com/earthtojake/text-to-cad)：P0 CAD/设计自动化候选；精确仓库、原创性、可运行工作流、活跃维护和交付格式覆盖均已核验，综合质量达到 A。

### AI 安全 / 开发者工具

- [Codex Security](https://github.com/openai/codex-security)：candidate-decisions 已批准 openai-codex-security-plugin；精确官方仓库、可安装实现、当日发布与维护证据均已核验。

### 空间智能 / 智能体评测

- [Geospatial Reasoning Benchmarks](https://github.com/google-research/geospatial-reasoning-benchmarks)：Google Research 官方原创地理空间智能体基准与可运行评分实现，支持选址和基础设施分析评测，符合行业研究价值门槛；热度不是准入条件。

### 3DGS / 机器人地形重建

- [MoonGS / MoonBlender](https://github.com/InRobots/MoonBlender)：论文摘要明确给出该仓库，存在代码与数据流程；记录实现缺口，作为观察项目而非完整可复现方案。

### 物理 AI / VLA 世界模型

- [ForeAct3D](https://github.com/anthonytao80-crypto/ForeAct3D)：论文明确引用该作者仓库，MIT 与原创研究可确认；复现资料尚需持续复核，作为高优先级研究观察。

### 室内重建 / SimReady 数字孪生

- [LiteReality-Agent](https://github.com/LiteReality/LiteReality-Agent)：官方项目、论文和可运行工具链相互对应，直接覆盖室内设计、真实扫描与仿真资产主线。

### 具身智能 / 机器人操作系统

- [Robonix](https://github.com/syswonder/robonix)：命中物理 AI P0；具备原创实现、MulanPSL-2.0 许可、可运行安装与 Webots Demo、七类机器人部署和持续维护证据，按 B 级正式跟踪。

### 实时 Agent / WebRTC 基础设施

- [Pion WebRTC](https://github.com/pion/webrtc)：虽然不是 AI 模型仓库，但它是 GPT-Live/WARP 事件直接指向的成熟实时 Agent 传输基础设施，质量和维护证据充分，按 B 级跟踪。

### AI CAD / 生成式设计

- [Multi-Agent CAD](https://github.com/Pan-Chera/Multi-Agent-CAD)：直接命中 CAD、3D 生成和 AI 设计工具 P0；原创性、可运行性、许可、Demo 与近期维护证据通过质量门槛，按 B 级新项目正式跟踪。

### 开放模型 / 模型分发基础设施

- [Hugging Face Hub Python SDK](https://github.com/huggingface/huggingface_hub)：官方关系、原创基础设施实现、明确许可、可安装性与持续维护证据充分，按 A 级正式跟踪。

### 大模型训练 / MoE 系统内核

- [Mixture-of-Kittens](https://github.com/cursor/mixture-of-kittens)：官方关系、原创系统实现、明确许可、可安装性、公开基准与生产维护证据充分，符合新发布开放工程仓库优先方向，按 A 级正式跟踪。

### 开放模型 / JavaScript SDK

- [Hugging Face JavaScript Libraries](https://github.com/huggingface/huggingface.js)：官方身份、原创 SDK 实现、明确许可、安装路径与维护活跃度通过质量门槛，按 A 级正式跟踪。

### 视频生成 / 实时视频编辑

- [JoyAI-Video-Edit](https://github.com/jd-opensource/JoyAI-Video-Edit)：命中视频生成、视频编辑和开放模型 P0；官方关系、原创实现、明确许可、可运行发布、Demo 与近期维护证据均通过质量门槛，按 A 级正式跟踪。

### 具身智能 / VLA 工具箱

- [Dexbotic](https://github.com/dexmal/dexbotic)：命中物理 AI 与机器人仿真 P0；原创工程实现、明确许可、完整安装路径、模型与硬件覆盖以及近期维护证据充分，按 B 级正式跟踪。

### Agent 数据基础设施 / 深度研究

- [GPT Researcher](https://github.com/assafelovic/gpt-researcher)：展示网页采集数据如何进入完整研究产物，是 Firecrawl 上层应用链的重要代表，按 A 级跟踪。

### 3DGS / 多传感器 SLAM

- [Gaussian-LIC2](https://github.com/APRIL-ZJU/Gaussian-LIC)：命中 3DGS、物理 AI 与机器人建图方向；官方关系、原创研究实现、明确许可、可复现路径和近期更新通过质量门槛，按 B 级正式跟踪。

### AI 设计工具 / 无限画布

- [Infinite Canvas](https://github.com/basketikun/infinite-canvas)：直接命中 AI 辅助设计工具 P0；原创性、可运行性、许可、Demo、Agent/MCP 集成与近期维护证据通过质量门槛，按 B 级早期项目正式跟踪。

### Agent 数据基础设施 / 文档解析与转换

- [PDF Inspector](https://github.com/firecrawl/pdf-inspector)：它解决 AI 数据管线中 PDF 是否需要 OCR、如何保留阅读顺序和表格结构的关键前置问题，并与 Firecrawl 网页采集形成完整文档入口，按 A 级正式跟踪。

### Agent 工程基础设施 / 编码智能体

- [nac](https://github.com/arcee-ai/nac)：该项目直接命中开源编码智能体、长程工程执行与本地安全沙箱方向，且由 AI 大事件的一手来源触发，按 B+ 级正式跟踪。

### Agent 工程 / GitHub 自动化

- [GitHub Agentic Workflows](https://github.com/github/gh-aw)：同日 AI 强制候选；官方关系、可安装实现、文档和活跃维护均已核验，综合质量达到 A。

### Agent 安全 / 插件

- [Claude Code 官方插件（security-guidance）](https://github.com/anthropics/claude-plugins-official)：Anthropic内部security-guidance插件有实际Python hooks、配置与测试，支持模式告警、diff复核及提交前Agent审阅；不把外部插件目录当作统一安全保证。

### 生成式设计 / 官方工作流

- [ComfyUI Workflow Templates](https://github.com/Comfy-Org/workflow_templates)：官方仓库直接承载 H3 Day-0 可复现制作流程，具备原创模板、可安装分发和持续维护证据，因此正式收录。

### Agent 工程 / 持久终端

- [Herdr Core](https://github.com/herdrdev/herdr-core)：已核对官方关系、README、实际实现目录、安装/评测入口、许可及当前维护元数据；具有可用的原创研究或官方工程实现，不以热度作为收录前提。

### Agent 工程 / 桌面工作区

- [Herdr App](https://github.com/herdrdev/herdr-app)：已核对官方关系、README、实际实现目录、安装/评测入口、许可及当前维护元数据；具有可用的原创研究或官方工程实现，不以热度作为收录前提。

### Agent 工程 / 官方 SDK 样例

- [Droid SDK 工程样例](https://github.com/Factory-AI/droid-sdk-typescript)：实际package.json将本库标为@factory/droid-sdk-examples，依赖@factory/droid-sdk；examples与scripts提供官方原创集成和校验工程，按工程参考B级收录，不宣称SDK本体源码仓库。

### 多模态模型 / 视觉推理

- [Zooming without Zooming v2](https://github.com/inclusionAI/Zooming-without-Zooming-v2)：已核对官方关系、README、实际实现目录、安装/评测入口、许可及当前维护元数据；具有可用的原创研究或官方工程实现，不以热度作为收录前提。

### 世界模型 / 机器人动作

- [E0.5](https://github.com/X-EraAI/e05)：已核对官方关系、README、实际实现目录、安装/评测入口、许可及当前维护元数据；具有可用的原创研究或官方工程实现，不以热度作为收录前提。

### 模型训练 / Agent 工程

- [Tinker Cookbook](https://github.com/thinking-machines-lab/tinker-cookbook)：candidate-decisions 已批准；官方仓库、Apache-2.0 许可、持续提交、正式 release 和完整教程均已核验。

### WAICA 2026 / 视频理解

- [RoboFAC](https://github.com/MINT-SJTU/RoboFAC)：WAICA 2026 主会议录用，上海交大团队官方仓库提供完整的视频诊断与纠错实现。

### AI Apps

- [Gemini Starter Applets](https://github.com/google-gemini/starter-applets)（已下架：2026-10-01，保留历史记录）：Existing approved project retained from the formal tracked inventory.


## 08:30发布复核追加的官方证据与决策

|仓库|Stars/Forks|许可|决策与边界|
|---|---:|---|---|
|[Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern)|23341/2236|AGPL-3.0|observe：原创浏览器工作流与SDK，AGPL-3.0许可、活跃维护；本轮完整补证，尚未做真实业务运行验证。|
|[CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser)|32739/2722|MIT|observe：Chromium源码指纹修改与Playwright接口，属于通用浏览器基础设施；README的全部检测通过是作者主张，未独立复测。|
|[CopilotKit/OpenBot](https://github.com/CopilotKit/OpenBot)|10254/1272|MIT|observe：MIT的AG-UI自托管AI同事与独立浏览器/权限机制，原创工程方向相关，仍beta，需验证真实部署边界。|
|[kalil0321/reverse-api-engineer](https://github.com/kalil0321/reverse-api-engineer)|2709/281|MIT|observe：浏览器请求到类型化客户端的工作流有代码与安装说明；保留授权范围、站点变动与客户端可靠性待验证。|
|[feder-cr/Jobs_Applier_AI_Agent](https://github.com/feder-cr/Jobs_Applier_AI_Agent)|32370/4742|MIT|observe：可运行的求职Agent实现，维护活跃；领域与主线较弱，不能把自动提交营销语等同准确或获准的业务结果。|
|[Evil0ctal/Douyin_TikTok_Download_API](https://github.com/Evil0ctal/Douyin_TikTok_Download_API)|21187/2949|Apache-2.0|observe：自托管数据API、MCP与离线语音工具工程完整，第三方平台稳定性与素材权利仍需场景核对。|
|[Lightricks/LTX-Video](https://github.com/Lightricks/LTX-Video)|11318/1218|Apache-2.0|observe：官方视频生成实现及权重入口，工程与设计方向相关；具体检查点权重许可与算力要求需另核，不与代码许可混同。|
|[dgtlmoon/changedetection.io](https://github.com/dgtlmoon/changedetection.io)|35565/2217|Apache-2.0|observe：原创网站变化监控服务，存在LLM摘要集成；是持续维护的基础设施，不把每次热榜当新AI模型发布。|
|[scrapy/scrapy](https://github.com/scrapy/scrapy)|65250/12099|BSD-3-Clause|observe：BSD-3-Clause爬取框架，README实际为rst且已恢复读取；通用基础设施，保留技术相关性，不宣称新AI能力。|
|[Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI)|145230/17286|GPL-3.0|approved：官方模块化生成图工作流与执行后端，维护活跃、GPL-3.0；保留自定义节点与模型各自许可及可信边界。|
|[hugohe3/ppt-master](https://github.com/hugohe3/ppt-master)|73940/5793|MIT|observe：原生PowerPoint生成工具与模板工作流，MIT且维护活跃；尚未实际导出/渲染验收，不把说明宣称当兼容性保证。|
|[usestrix/strix](https://github.com/usestrix/strix)|73961/8348|Apache-2.0|observe：原创安全Agent工具与安装/测试入口，Apache-2.0且活跃；效果与授权资产边界需真实评估。|
|[IQuestLab/IQuestRT](https://github.com/IQuestLab/IQuestRT)|6/0|Apache-2.0|approved：官方原创八卡专用推理引擎及基准工具，Apache-2.0；硬件限制与模型条款独立保留，低热度不影响行业收录。|
|[MAC-AutoML/RoTA-Bench](https://github.com/MAC-AutoML/RoTA-Bench)|6/0|Apache-2.0|approved：作者原创闭环空间推理基准和674任务，Apache-2.0代码与第三方图标条件独立保留；直接适配3D交互。|
|[alibaba/MNN](https://github.com/alibaba/MNN)|16360/2503|Apache-2.0|approved：阿里官方原创端侧推理/训练引擎及模型工程，当前官方README确认Pocket发布，保留量化版本和指定设备性能口径。|

全部追加仓库的metadata、README、commits、Issues、PRs、Releases均保留真实连接器回执；Scrapy的README.md 404及README.rst恢复并存。未安装或执行第三方仓库代码。

## 09:00二次复核

- 实际时间2026-11-06T01:12:43.344Z；候选414，surging19/hot20；当前77个必核均有同日完整官方证据，原核验时间保留。
- 新行业候选hongbo-miao/hongbomiao.com的README与全部活动证据已读；个人多领域实验室暂留observe，不按新官方模型入库。
- 通过GitHub连接器另查IQuestRT、RoTA-Bench、simready-foundation元数据；未把低热度研究排除，代码许可与模型条件保持分开。
- 4项OSS Insight指标不可用保留为可选notice，其他必需来源均通过。
