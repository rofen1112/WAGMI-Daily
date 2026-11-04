# AI 实验室（独立开发版）

从 Wagmi Daily 的 `57ce332bd5b69195e11fe7d4d14595e42f3ae86f` 创建 `codex/ai-lab`。本分支为户型图生成可编辑 3D 空间的本地产品原型；主项目审核后决定接入和发布。

## 启动

需要 Node.js 22、Python 3.13 和本仓库 lockfile 对应依赖。在独立 checkout 内执行：

```powershell
npm ci --ignore-scripts --no-audit --no-fund
# 将 .env.ai-lab.example 复制为 .env.ai-lab.local，在私有文件中设置 Key。
powershell -NoProfile -File scripts/start-ai-lab-dev.ps1
```

浏览器入口 `http://127.0.0.1:5186/#/ai-lab?tool=floorplan3d`。API 仅监听 `127.0.0.1:8786`，通过 Vite 同源代理访问 `/api/ai-lab/v1`。进程日志位于 `.local-ai-lab/runtime/`。构建使用 `npm run build:lab`，输出 `dist/ai-lab/`，不执行原项目的数据同步、管理写入或发布插件。停止实验室使用 `scripts/stop-ai-lab-dev.ps1`，不会删除方案或图片。

界面现名为 **Floorplan-Editor**。`#/ai-lab`为应用目录，选择应用后进入上述项目管理页；选择项目或新建才进入编辑器。原projectId深链接继续可用。开发版`#/today`导航已增加AI实验室入口，只读读取本机8080公开JSON用于入口演示；正式站接入仍由主项目审核。[入口与项目管理说明](docs/ai-lab-floorplan-editor.md)。

**日常实验室开发仅使用 `dev:lab` / `build:lab` 或上述启动脚本。** 原项目 `npm run build`、日报、通知与发布脚本不属于本分支工作流。

## 模型与数据

后端固定调用用户指定网关 `https://etc.seedance-api.net/server/api/call` 和模型 `deepseek-v4-1-flash-260910`。该网关的实际可用请求为 Responses `input`，文档示例中的 `messages` 在实测中被拒绝，不能直接视为官方 DeepSeek API 的等价实现。密钥只从后端私有配置读取，不进入浏览器、Git、导出文件和错误正文。

`AI_LAB_GATEWAY_IMAGE_VERIFIED=1` 只应在该网关/模型完成图像探测后设置。`AI_LAB_REASONING_EFFORT` 可显式指定 `none|low|high|max`，不填则保留供应商默认；`AI_LAB_MAX_OUTPUT_TOKENS` 同时限制推理和可见输出。上游规则、网关探测与实际完整生成结果须分别记录，参见 [参数证据](ai-lab/server/reasoning-notes.md)。

图片、SQLite、不可变场景版本和参考案例均保存在忽略的 `.local-ai-lab/`，不复用主项目 `data/dev`、`data/main` 或其发布目录。既有三例可作为私有参考导入，界面会标注“历史参考”及其修改来源；不会将参考场景当作新模型生成结果。原 floorplan 工程、图片和浏览器布置均保留。

## 已实现的产品链路

- PNG/JPG 上传、自动估算/图上两点已知长度校准/手动比例、要求输入、单队列生成、进度、取消、重启中断处理和幂等提交。尺度记录来源、锚点、依据、范围和置信度；无依据时要求补充，不套用参考比例。
- 新界面显式提交 `codex-workflow-v1`：图纸分析及尺度选择→结构→可见家具/设施→结构与编辑状态校验→候选预览→浏览器真实2D/3D截图→原图视觉复核→限定修正与再次截图复核→版本保存。候选始终标记未提交；等待截图时释放worker，重新打开项目可继续，取消不会保存。历史未指定版本的API请求仍走 `legacy-single-v1`，历史结果不能冒充完整工作流结果。
- 确定性编译器仅进行一次像素到毫米转换，检查边界、房间相交、合法对象和门窗参数。显式 `wallSegments`、`furnitureRows`、`stairRuns` 展开为同一legacy几何，不执行模型代码，不补猜测厚度或夹紧越界坐标。
- 复用 floorplan 的 2D/3D、家具库、测量与编辑器，iframe 样式隔离，缓存按项目和版本分开；完整 scene 与当前 state 一并保存、导出。
- 聊天支持明确对象的移动、旋转、尺寸及房间名称/材质修改。明确语法本地执行，其他语言最多一次模型调用转为受限 patch。当前不能通过聊天增删墙、自动重构房间或任意执行代码。
- 供应商返回的usage、参数、每阶段输入/输出哈希、尺度和复核结果逐调用保存，包括失败及修复。阶段产物和截图留在私有目录，缺失用量明确显示未知；无已确认单价时费用为空。

尺度可以来自图纸标注、用户已知长度或模型估算；均不代表现场实测。几何通过、模型视觉复核通过和独立人工验收分别记录。模型复核不能替代人工还原质量判断。原图叠加可在viewer内开关，自动复核图排除叠加层，避免把原图当成生成结果。

默认调用/修复/视觉复核上限为8/2/2。私有配置 `AI_LAB_WORKFLOW_MAX_CALLS`、`AI_LAB_WORKFLOW_MAX_REPAIRS`、`AI_LAB_WORKFLOW_MAX_REVIEWS` 可设置有界预算，新job创建时即固定快照；旧任务重启不扩额。比较模型应固定同一流程、输入、尺度策略、推理档位和预算，并保留所有失败及人工修改记录。此前Codex会话的历史参考结果与新API测试不构成同条件模型排名。迁移范围见 [流程记录](docs/ai-lab-workflow-parity.md)。

## 验收与隔离

```powershell
python tests/ai-lab-engine-test.py
python tests/ai-lab-primitives-test.py
python tests/ai-lab-server.test.py
python tests/ai-lab-server-workflow.test.py
node --test tests/ai-lab-isolation.test.mjs
node --test tests/ai-lab-layout.test.mjs
npm run typecheck
npm run build:lab
node scripts/verify-ai-lab-isolation.mjs
```

可选 `AI_LAB_LEGACY_FIXTURES` 指向私有原案例父目录，以只读方式执行三例兼容检查。隔离脚本在内存构建 public/admin/lab，禁止载入原 Vite 配置、私有 env、发布插件和 public 数据，不写构建文件；public/admin 均不包含实验室模块、导航和 API。

2026-11-03：实验室引擎 10 项（含三例）、后端 24 项、前端 9 项通过，类型检查与 lab 构建通过。全库 `npm test` 曾为 235/236；`data-contract.test.mjs` 因鲜克隆缺少忽略的 `data/dev/papers-catalog.json` 在注册内部子测试前退出。因此全库数据契约验收未完成；没有补造历史数据或绕过既有测试。独立技术审查见 [审查记录](docs/ai-lab-review.md)。真实模型验收另行记录，不以离线 mock 或参考兼容代替。

2026-11-04：分阶段工作流、自动/两点校尺、真实截图回传与有界复核已在真实网关贯通。三张真实图的原始失败、重复响应修复后的定点复验及尺度证据均见 [迁移验收](docs/ai-lab-workflow-acceptance.md)，不能用功能链路通过替代还原质量通过。失败/需补输入的项目重新打开时恢复原图和原提交输入；终态候选明确任务已停止。

## 交接与发布边界

前端改动集中在 `src/features/ai-lab/`，仅对 App、router、package 增加模式门控和懒加载。后端、编译器、viewer 和本地 Three.js 依赖位于 `ai-lab/`，保留上游许可。实验室独立 Vite 配置不包含原管理写入或 Sites 发布插件。

本阶段仅本机单用户，未提供公开访问认证、配额、多人隔离、生产备份或网关账单核对。正式发布前需要主项目审核接入路径和功能开关，并补齐这些能力及三例生成质量评测。提交仅面向 `codex/ai-lab` 的审阅，不合并或发布 main，不自动调用日报、通知或部署。
