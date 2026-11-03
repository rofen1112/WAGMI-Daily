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

**日常实验室开发仅使用 `dev:lab` / `build:lab` 或上述启动脚本。** 原项目 `npm run build`、日报、通知与发布脚本不属于本分支工作流。

## 模型与数据

后端固定调用用户指定网关 `https://etc.seedance-api.net/server/api/call` 和模型 `deepseek-v4-1-flash-260910`。该网关的实际可用请求为 Responses `input`，文档示例中的 `messages` 在实测中被拒绝，不能直接视为官方 DeepSeek API 的等价实现。密钥只从后端私有配置读取，不进入浏览器、Git、导出文件和错误正文。

`AI_LAB_GATEWAY_IMAGE_VERIFIED=1` 只应在该网关/模型完成图像探测后设置。`AI_LAB_REASONING_EFFORT` 可显式指定 `none|low|high|max`，不填则保留供应商默认；`AI_LAB_MAX_OUTPUT_TOKENS` 同时限制推理和可见输出。上游规则、网关探测与实际完整生成结果须分别记录，参见 [参数证据](ai-lab/server/reasoning-notes.md)。

图片、SQLite、不可变场景版本和参考案例均保存在忽略的 `.local-ai-lab/`，不复用主项目 `data/dev`、`data/main` 或其发布目录。既有三例可作为私有参考导入，界面会标注“历史参考”及其修改来源；不会将参考场景当作新模型生成结果。原 floorplan 工程、图片和浏览器布置均保留。

## 已实现的产品链路

- PNG/JPG 上传、显式比例、要求输入、单队列生成、进度、取消、重启中断处理和幂等提交。
- 图像与规则交给模型，生成原图像素 JSON；确定性编译器仅进行一次像素到毫米转换，检查边界、房间相交、合法对象和门窗参数。最多一次针对校验错误的模型修复；仍失败则不提交新场景。
- 复用 floorplan 的 2D/3D、家具库、测量与编辑器，iframe 样式隔离，缓存按项目和版本分开；完整 scene 与当前 state 一并保存、导出。
- 聊天支持明确对象的移动、旋转、尺寸及房间名称/材质修改。明确语法本地执行，其他语言最多一次模型调用转为受限 patch。当前不能通过聊天增删墙、自动重构房间或任意执行代码。
- 供应商返回的 usage 逐调用保存，包括失败和一次修复。缺失用量明确显示未知；无已确认单价时费用为空，不捏造价格。

所有尺寸和面积基于用户比例。几何校验通过不代表识图准确、施工精度或与原图一致。当前尚无自动多视角视觉复核，仍需人工核对原图和 3D。

## 验收与隔离

```powershell
python tests/ai-lab-engine-test.py
python tests/ai-lab-server.test.py
node --test tests/ai-lab-isolation.test.mjs
npm run typecheck
npm run build:lab
node scripts/verify-ai-lab-isolation.mjs
```

可选 `AI_LAB_LEGACY_FIXTURES` 指向私有原案例父目录，以只读方式执行三例兼容检查。隔离脚本在内存构建 public/admin/lab，禁止载入原 Vite 配置、私有 env、发布插件和 public 数据，不写构建文件；public/admin 均不包含实验室模块、导航和 API。

2026-11-03：实验室引擎 10 项（含三例）、后端 24 项、前端 9 项通过，类型检查与 lab 构建通过。全库 `npm test` 曾为 235/236；`data-contract.test.mjs` 因鲜克隆缺少忽略的 `data/dev/papers-catalog.json` 在注册内部子测试前退出。因此全库数据契约验收未完成；没有补造历史数据或绕过既有测试。独立技术审查见 [审查记录](docs/ai-lab-review.md)。真实模型验收另行记录，不以离线 mock 或参考兼容代替。

## 交接与发布边界

前端改动集中在 `src/features/ai-lab/`，仅对 App、router、package 增加模式门控和懒加载。后端、编译器、viewer 和本地 Three.js 依赖位于 `ai-lab/`，保留上游许可。实验室独立 Vite 配置不包含原管理写入或 Sites 发布插件。

本阶段仅本机单用户，未提供公开访问认证、配额、多人隔离、生产备份或网关账单核对。正式发布前需要主项目审核接入路径和功能开关，并补齐这些能力及三例生成质量评测。提交仅面向 `codex/ai-lab` 的审阅，不合并或发布 main，不自动调用日报、通知或部署。
