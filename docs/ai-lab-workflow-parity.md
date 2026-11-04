# 原 Codex 执行流程与产品迁移对应记录

更新：2026-11-04。本文记录 engine / viewer 层的迁移范围。源码来源为原 floorplan 展示器、`LOCAL-SETUP.md`、三个案例 `TEST-RESULTS.md`、`scripts/build_case.py`、`build_tugendhat_case.py`、`build_office_case.py` 和 `office_furniture.py`。原项目没有 `SKILL.md`；不能把实际 Agent 工作步骤描述成仓库内置的自动识图技能。本轮没有执行原构建脚本，没有改写旧案例、图片、浏览器布置或私有 CNB 源码。

## 实际旧流程与迁移

| 原流程及本地证据 | 产品可复用能力 | 验收边界 |
| --- | --- | --- |
| Agent 读原图并划分结构、家具与留白；`LOCAL-SETUP.md`、各案例测试记录 | backend 分析、结构、家具阶段；engine 接收声明式像素数据 | 模型对图片的实际理解须单独评测，不能用旧参考 JSON 替代 |
| `build_case.py:3–15` 明确无尺寸图假定22mm/px；其它案例另用25或35 | 显式 `scaleProvenance`，记录来源、证据、置信度、假设及可选校尺点/区间 | 不为新图默用22；`measured` 只表示按给定/可读长度校准，不等于现场测绘 |
| `point()` / `rect()` / `furn()` 把手写像素转换到mm | `compile_pixel_scene(...,scale_provenance=...)` 一次转换，原像素元数据独立保留 | 方向、角度、竖向mm及归一化家具轮廓不重复缩放 |
| 办公工位与会议椅循环、楼梯踏步循环、墙体构造 | root 提供 `expand_primitives()`；compiler 在缩放前展开 wallSegments / furnitureRows / stairRuns | 只展开显式参数；不猜厚度、补数量、夹紧越界点或执行模型代码 |
| 旧案例的简单性、重叠、轮廓容纳与ID检查 | 通用 scene/schema/geometry 校验，primitive错误转 `invalid_primitive` | 代码有效不证明与原图一致 |
| 实际打开2D/3D，截图对照，发现错误再修正 | 可开关原图叠加；真实SVG与Three画布截图bridge，供backend视觉复核 | 本轮离线测试不冒充浏览器截图验证；自动模型复核不等于独立人工验收 |
| 编辑、保存、重开、导出并保护旧例 | 保留完整scene和独立state、项目/版本隔离及既有持久化接口 | 历史baseline与generated来源继续分开 |

## 比例来源契约

`metadata.mmPerPixel` 仍是几何计算唯一使用的数值尺度。可选 `metadata.scaleProvenance` 的新标准如下；新编译结果总会写入该对象，缺少该字段的旧legacy案例继续兼容。

```json
{
  "mode": "measured",
  "mmPerPixel": 20,
  "confidence": "high",
  "evidence": ["用户提供2000mm已知长度，并在原图选择两个端点。"],
  "assumptions": ["图像未经过透视校正；校尺不代表现场测绘。"],
  "anchors": [{"label":"参考墙长","p1":[100,100],"p2":[200,100],"lengthMm":2000,"source":"user_measurement"}]
}
```

模式为 `manual / measured / estimated`；置信度为 `low / medium / high`。`evidence` 至少一条，`assumptions` 可为空，均为有数量和长度上限的文本数组。`rangeMmPerPixel:[low,high]` 可选，要求正数、顺序正确并包含所选尺度。`anchors` 可选，每项仅允许 `label,p1,p2,lengthMm,source`；source为 `dimension_annotation / user_measurement / object_prior`。

measured要求至少一条非object-prior的有效锚点；点须位于原始图像内且不同，真实长度为正；各实尺度锚点的 `lengthMm / pixelDistance` 与所选尺度差异不超过2%。这是输入一致性门禁，不是图像识别误差或实测精度保证。backend可先调用 `validate_scale_provenance(provenance,mm_per_pixel,image_width,image_height)`；最终仍由完整scene校验。compiler接收backend显式传入的来源对象，覆盖模型JSON自行携带的来源，模型不能把手动或估算升级为已校准。

legacy六参数调用继续可用，默认记录“手动提供数值，未记录校尺锚点”，而不伪造来源。新结果强制 `sourcePixels=tracingPixels=原图宽高`、`originPixels=[0,0]`。顶栏和概览使用中文区分手动、已知长度校准、图像估算与历史估算；显示证据、置信度、区间和假设，并明确面积非测绘。1:60/1:100仅为视图缩放，不作为校尺证据。

## 原图叠加

服务调用 `render_viewer_html(scene,state,project_id,version,source_asset_url=None)`。只允许 `/api/ai-lab/v1/assets/<32位小写hex ID>` 的同源地址；外域、data URL、协议相对地址和任意文件路径均被拒绝。模型字段不能指定图片来源。

viewer的“原图叠加”和透明度滑块只控制当前SVG图层，默认关闭，不写入scene、state、撤销栈或localStorage。新结果映射为 `(sourcePixel-originPixels)*mmPerPixel`。旧案例若 `tracingPixels` 与原始 `sourcePixels` 不同，先按两个栅格尺寸之比映射到参考像素，再执行同一原点/尺度转换；例如旧Tugendhat使用1976×1279参考坐标而原件为2000×1295，不会误当原件每像素25mm。

## 真实画布截图bridge

父iframe发送 `{type:'ai-lab:capture',requestId}`；子回复 `{type:'ai-lab:captures',requestId,planDataUrl,sceneDataUrl}`。来源仍严格校验parent Window、同源及非空有界requestId。draftId由父端/后端绑定，子不自造候选版本身份。

2D为当前SVG克隆后按场景bounds栅格化的PNG；移除选择辅助层和原图叠加，保留当前生成几何。3D为实际Three renderer canvas生成的JPEG，固定1280×960、DPR1，按实际可见几何包围盒取高位斜视，临时使用1.2米剖切墙；不依赖页面预览框宽窄或当前相机。完成后恢复renderer尺寸/DPR、相机投影和朝向、controls、原墙门/碰撞对象及显示状态，不切换viewMode、不保存或写localStorage。截图不含浏览器/编辑器UI、原始图像、桌面或其它应用。图像只有通过既定消息送给同源父页面；没有独立网络上传路径。

模块提供capture能力后才发ready，避免父页面在3D模块尚未加载时自动截图。切换/飞行/动画尚未完成、重复截图或引擎/栅格失败时，回复同type的 `error` 和null图片字段，不返回空白占位图冒充成功；父端可对同draft重试捕获。供视觉复核的draft应在父页面限制编辑，避免自动捕获前用户改变尚未提交候选。

## 本层验证与交接

`python tests/ai-lab-engine-test.py -v`：17组通过；设置私有 `AI_LAB_LEGACY_FIXTURES` 后包括三个原案例的完整只读兼容。新增覆盖比例来源/锚点/范围/来源不能被模型升级、原图与参考像素映射、非法source URL、primitive错误门禁、capture成功/失败时相机状态恢复及storage不写、两段JS语法检查。`python tests/ai-lab-primitives-test.py -v`：root提供的5组规则与编译集成检查通过。

交付前调用了 Codex Design MCP 的 `get_design_rules(verification_handoff)` 与 `design_review_checklist`。新增控件沿用原renderer的字体、颜色、按钮、分组和密度；没有重做视觉系统。实际窄屏控件换行、SVG PNG/Three JPEG解码、WebGL非空画面与完整自动复核链，需由主任务在隔离服务上继续浏览器验收，不能由离线mock结果替代。公平比较必须同时固定工作流版本、尺度来源、调用/修复预算和输入图像；历史案例兼容、自动生成、模型自评与人工benchmark分别留证。
