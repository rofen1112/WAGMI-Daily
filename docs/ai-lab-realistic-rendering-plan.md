# 写实展示只读审计与一房间样板建议

审计日期：2026-11-05。未修改 viewer、engine、场景、数据库或任何渲染逻辑，未调用模型、付费工具或下载资产。actual 与 staging 的 `viewer/index.html`、`engine/scene.py`、`engine/viewer.py` 内容逐字节相同；审计时 viewer SHA-256 为 `b6ffa4c1d5d9f601546da2fa00ac85c51041c11df9c1022296d6e56e25fc8e32`。下列源码行号指 actual。

## 结论

可以规划写实展示，但它是通用渲染与资产管线升级，不能靠更换界面配色或一个灯光 preset 完成。当前已有 PBR 基础、环境反射、几何细节和真实阴影；主要差距是软装造型、表面微细节、统一材质资源、间接光与拍摄方式。改造应覆盖全部 **45 种通用家具的接入契约和质量分级**，并不意味着一次把 45 种都换成 glTF。

2D 应继续作为可量尺、可选择、可拖放的图纸视图；可以另外规划由同一 3D 场景生成的写实俯视预览。直接把 SVG 平面图改成照片风，会损失图纸阅读、尺寸与编辑的明确性。

## 当前为何偏插画

| 层面 | 代码事实与判断 |
| --- | --- |
| 2D 平面 | [buildDefs](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:530) 用 SVG repeat pattern 画木纹、砖缝、大理石曲线和水磨石圆点；[furnSVG](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:554) 用固定屏幕线宽、矩形、椭圆、纯色和虚线画家具符号。这本来就是图纸/示意表达，没有光照、体积或照片纹理。 |
| 3D 造型 | [几何辅助函数](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1745) 使用 Box/RoundedBox、旋转体、曲管、椭球和挤出；[床](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1846) 与[沙发](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1862) 已有床头软包、被子、坐垫、抱枕和腿，但主要由规则圆角块组合，缺少真实布料褶皱、缝线、软体不规则轮廓。不能称为“只有盒子”，也不能当成写实成品模型。 |
| 材质 | [mat](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1689) 默认 StandardMaterial/roughness=.7；[fabric/woodM 等](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1791) 主要是颜色与 roughness/metalness 标量。viewer 未设置 normalMap、bumpMap、roughnessMap、metalnessMap、aoMap 或 displacementMap。几何自身有法线，不等于存在布纹/木纹法线贴图。 |
| 地板纹理与 UV | [floorMat](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1701) 在 canvas 程序绘制色纹：木纹 1024×205，其他 512×512；只接入颜色 map 和 roughness 标量，没有配套 normal/roughness/AO。repeat 已按米定义，木板 1.8×.36m、砖 .8/.6/.3m；[房间地面](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:2378) 的 ShapeGeometry 基于已转为米的多边形，现有尺度映射可保留。家具 primitive 自带 UV，但没有统一真实纹理密度和木纹方向策略。 |
| 环境与光照 | [初始化](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1606) 有 HemisphereLight、DirectionalLight 和 PMREM(RoomEnvironment)；这是程序构造的室内环境，不是实拍 HDRI。envMap 只显式分配给 mat() 中金属/低 roughness 材质，未设置全局 scene.environment；独立构造的 floorMat/玻璃没有同样的显式 envMap 接入。不能把现有光滑表面反射说成没有环境光，也不能当成完整室内间接光。 |
| AO、阴影、玻璃与镜面 | 已有 [PCFSoftShadowMap、2048/4096 日光阴影](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1590)、模型 cast/receiveShadow，以及[透明背景阴影接收面](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1614)。未接 SSAO/GTAO、烘焙 AO/lightmap 或 GI 管线；[夜景 PointLight](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:2389) 未启逐灯阴影。玻璃为 PhysicalMaterial、opacity=.28、depthWrite=false，无 transmission/thickness；mirror() 是低 roughness 金属模拟，非实际房间平面反射。 |
| 色彩管理 | 已有 [ACESFilmicToneMapping](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1591)，floor CanvasTexture 已标 sRGB。本地 [Three r160](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/vendor/three/build/three.module.js:6) 的 renderer [默认输出 sRGB](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/vendor/three/build/three.module.js:28539)。因此不能把差距简单归为“没开色彩管理”；未来新增 baseColor 与 normal/roughness 数据贴图仍须分别设置正确颜色空间。 |
| 镜头与展示目标 | [默认 1.2m 剖切、鸟瞰、工作室光](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1571) 是便于核对布置的沙盘表达；全屋白底鸟瞰不等于室内摄影。写实样板需要额外验证全高墙、顶面、近景透视和接触阴影；保留现有鸟瞰与图纸作为编辑/检查视图。 |

## 家具数量与范围

从实际源码提取并比较集合：

- [LIB](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:416)：**60 个尺寸/名称预设，45 个唯一 type**，多个床/桌/柜/椅预设共用同一个构造分支。
- [schema FURNITURE_TYPES](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/engine/scene.py:12)：**45 种**。
- [furnSVG switch](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:561) 与 [buildFurniture switch](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1843)：各覆盖 **45 种**；三者集合相同。共享 case 不等于缺失类型。

完整 type 清单（45）：

```text
bed crib nightstand wardrobe dresser desk chair bookshelf baycushion
sofa cornersofa armchair beanbag coffeetable sidetable tvstand rug
shoecab floorlamp plant table roundtable island barstool counter stove
ksink fridge cabinet toilet vanity shower bathtub washer waterheater
tv aircon acwall dishwasher ovencol dryer purifier officechair piano treadmill
```

建议分级，而非一刀切：

| 路径 | 类型及工作 |
| --- | --- |
| 程序化优先保留 | nightstand、wardrobe、dresser、desk、bookshelf、coffeetable、sidetable、tvstand、shoecab、table、roundtable、island、counter、cabinet、vanity、shower、waterheater、tv、aircon、acwall。提升倒角、板厚、接缝和 PBR/UV；建筑墙、门窗、踢脚线也继续参数化，保证洞口与尺度可编辑。 |
| 近景需重新制作或优先高质量 glTF | bed、crib、chair、baycushion、sofa、cornersofa、armchair、beanbag、barstool、officechair、plant、toilet、bathtub、piano。软包、床品、弯曲椅背、植物和有辨识度的工业造型是优先级最高的部分；并非每个类型必须购买资产，也可离线重建并规范化。 |
| 混合、按样板曝光程度升级 | rug、floorlamp、stove、ksink、fridge、washer、dishwasher、ovencol、dryer、purifier、treadmill。地毯优先补纤维/法线与边缘；电器、灯具可保留参数外壳并升级关键部件，近景型号再引入资产。 |

全量治理包括共同的材质配置、资产尺寸/原点/朝向、footprint、LOD、资源释放和 fallback；不能只替换某个案例的沙发。现有 [buildFurn](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:2443) 在家具签名变化后整组重建，未来 glTF 必须缓存加载结果、按实例 clone/复用并明确纹理所有权，避免每次改名/旋转重新下载；重复办公家具还应单独评估实例化。此处未做性能实测。

## 已有资产：能用什么，不能据此声称什么

actual `wagmi-ai-lab` 源仓库（排除 node_modules、dist、.git、.local-ai-lab）未发现 glb/gltf/HDR/EXR/KTX/OBJ/FBX/BLEND/MTL 资源，也未发现可直接接入的配套 PBR 图片集合。`src/features/ai-lab/assets/ark-logo.png` 与 `public/brand/ark-ghost.png` 是界面品牌图，不是家具/材质资产。vendor 是渲染代码，不是素材库；当前 viewer 也未导入 GLTFLoader/HDR loader。

额外只读解析现有兄弟项目 CNB 子仓库中的 GLB JSON chunk；没有复制或改动资产，尚未进行写实质量的视觉验收：

- `G:/code-program/anything-work/20261030-html-floor3D/research/ark-3deditor/experiments/floorplan/furniture/models/*.glb`：16 个。
- `G:/code-program/anything-work/20261030-html-floor3D/research/ark-3deditor/apps/editor/public/furniture/local-prototypes/v1/*.glb`：16 个同名原型；15 对 SHA 相同，sofa-arc 两份二进制不同，但几何/材质统计相同。
- 实际墙画位置是 `G:/code-program/anything-work/20261030-html-floor3D/research/ark-3deditor/apps/editor/public/local-models/modern-wall-art.glb`，不是该仓根目录 public 下。

两套家具原型的 generator 均为 `ark floorplan isolated parametric prototype v1`；每文件 12–85 meshes、288–4272 顶点、144–1464 三角形、4–6 种纯色材质；所有文件 images=0、textures=0，normal/roughness/AO 贴图槽均缺失。例：sofa-straight-3 为 14 meshes/168 三角形；cabinet-base 为 63 meshes/756 三角形。其 [export.ts](G:/code-program/anything-work/20261030-html-floor3D/research/ark-3deditor/experiments/floorplan/furniture/export.ts:21) 只导 POSITION/NORMAL，未导 TEXCOORD_0；[材质](G:/code-program/anything-work/20261030-html-floor3D/research/ark-3deditor/experiments/floorplan/furniture/export.ts:27) 只导 baseColorFactor、roughnessFactor、metallicFactor，generator 见同文件第36行。

这些可参考模块拆分、部件角色、尺寸归一化和 GLB 容器接入方式，不能因扩展名是 GLB 就当写实沙发。直接替换很可能仍是块状/参数化观感；缺 UV 的原型还需 UV/材质制作，而非只挂几张贴图。

墙画为 generator `Ark modern wall art geometry generator`，11 meshes、969 顶点、1400 三角形、5 个纯色材质，images/textures=0。[生成脚本](G:/code-program/anything-work/20261030-html-floor3D/research/ark-3deditor/experiments/home-furnishings/modern-20261022/build-modern-wall-art.mjs:25) 明确用 Box/Torus 拼画框与抽象图案，[extras](G:/code-program/anything-work/20261030-html-floor3D/research/ark-3deditor/experiments/home-furnishings/modern-20261022/build-modern-wall-art.mjs:82) 明记无外部图像/纹理。可作为特定装饰几何候选，不能代替写实家具资产质量验收。

## 必须保留的契约

- **数据与单位**：保留 id/type/name/cx/cy/w/d/rot/color 与规范化 outline；[compiler](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/engine/scene.py:340) 像素→mm 一次，[Three](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1572) mm→m 一次。不得把资产米制尺寸再写回成像素。现 state 没有家具 h/assetUrl/materialId，[字段白名单](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/engine/scene.py:17) 和 [patch 白名单](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/engine/scene.py:407) 不接受任意新字段；最小样板可用 viewer 内 type→asset registry，不让模型输出 URL。未来需要 SKU/h 等再另立版本化 schema。
- **实例坐标与编辑**：模型底面 y=0、水平中心与 footprint 对齐、尺寸归一化；[现旋转](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:2340) 为 -rot 绕 Y；保留父 Group 的 userData.fid 供 [拾取](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:2647) 和 [拖动](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1639)。椅腿、沙发厚度不能盲目非等比拉伸；catalog 须规定可变形尺寸、标准规格和超范围策略。
- **2D/3D 同步与历史**：两视图继续读取同一 state；保持测量、贴墙吸附、宽深调整、旋转、撤销重做以及[项目/版本缓存](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:480)。渲染升级不能重建或覆盖用户历史 state。
- **碰撞边界**：当前 [blocked](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:2736) 是墙矩形/多边形与门的解析碰撞，没有通用家具碰撞；门碰撞线目前还固定 .9m，非逐门 len。换 glTF 不会自动补齐物理碰撞，不能宣称现有碰撞已是精确模型级。展示样板先保持既有行为，不把此限制隐去。
- **保存与导出**：现 [JSON 导出](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1499) 是 editor state；[PNG 导出](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:1410) 为 SVG raster 或 Three canvas，没有 glTF 场景导出。引入 glTF 是加载能力，不能混称已支持模型导出；未来完整可迁移包还须包含场景、catalog 版本、资产和授权清单。
- **安全与复核**：保留 [engine 安全注入](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/engine/viewer.py:12)、同源 bridge、源图叠加的单次坐标换算，以及 [固定 capture](G:/code-program/0-2026/wagmi-ai-lab/ai-lab/viewer/index.html:2877) 的日光/1280×960/截图后恢复。实验写实 profile 不悄悄替换正式 visual-review profile；若未来让复核使用新资产，须等待所有资产加载完成，失败时明确报错，不能拿未加载占位图通过复核。

## 最小样板批次（建议，尚未实施）

只选已有场景的一间客厅，保持原房间轮廓、门窗、家具 ID 与位置尺寸；不重跑模型、不做全屋替换。

1. 建一个通用 render catalog/材质层试验入口；45 种仍有既有程序化 fallback，本批只覆盖 sofa、armchair、coffeetable、tvstand、rug、floorlamp、plant 七类。优先两种软体家具和一株植物的合规高质量资产；桌柜保留参数化，地毯/木地板/墙面补统一 PBR 纹理与实际纹理尺度。
2. 固定一套室内日光环境和两张对比镜头（全房鸟瞰、全高室内近景），优先接触阴影/遮蔽、反射层次与材质微表面。HDRI 或 AO 仅在与现有材质/色彩管理正确配合并经实测后接入，不用强 bloom/调色掩饰几何问题。
3. 同 scene/state、同尺寸与同机位做前后图；记录资产许可、原点/尺寸、贴图、LOD、加载时间、draw calls、三角形和纹理内存。检查拖动/旋转/缩放、2D footprint、撤销重做、保存/重开、PNG/JSON 与 capture 恢复；先过人工近景质量，再决定其余类型的批次。

样板通过后才逐类扩展：先软装与常见椅类，再柜体/桌类共用表面，最后电器、卫浴、特殊物件。此备忘是技术规划，不代表写实质量或原型资产已验收。

## 官方能力依据

Three.js 的 [MeshStandardMaterial](https://threejs.org/docs/pages/MeshStandardMaterial.html) 提供基于物理的金属/粗糙度材质，以及 normal、roughness、AO 和环境贴图等接口。当前项目已用其基础能力，写实升级重点是补齐资产和表面数据，而不是只更换材质类名称。

新增颜色贴图与数据贴图应按 [Color Management](https://threejs.org/manual/pages/color-management.html) 区分颜色空间；采用后处理时也要保留正确的输出转换。现有场景已具备 ACES 和 sRGB 基础，不能用全局曝光替代这项管理。

[GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html) 支持接入 Draco、KTX2 和 Meshopt 解码器。后续资产管线应按本地固定的 Three.js r160 核对并打包对应版本的加载器和解码资源，不混用在线最新版文件；压缩方式需结合实际模型与浏览器能力评测。
