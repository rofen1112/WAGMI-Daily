import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  ConfigProvider,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  Layout,
  List,
  Menu,
  message,
  Progress,
  Result,
  Row,
  Segmented,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Globe from 'react-globe.gl';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type PageKey = 'daily' | 'radar' | 'map' | 'search' | 'following' | 'account';
type Recommendation = 'A' | 'B' | 'C' | 'Skip';

type Project = {
  key: string;
  name: string;
  repo: string;
  category: string;
  stars: number;
  forks: number;
  watchers: number;
  growth24h: number;
  growth7d: number;
  region: string;
  recommendation: Recommendation;
  risk: 'Low' | 'Medium' | 'High';
  lat: number;
  lng: number;
  license: string;
  lastActive: string;
  demoUrl: string;
  summary: string;
  audience: string[];
  techStack: string[];
  useCases: string[];
  demoJudgment: string;
  techAnalysis: string[];
  risks: string[];
  nextSteps: string[];
  conclusion: string;
  evaluation: string[];
  updates: string[];
  mediaRefs: { source: string; summary: string }[];
};

const projects: Project[] = [
  {
    key: 'room-agent',
    name: 'RoomAgent Studio',
    repo: 'github.com/example/room-agent-studio',
    category: '室内设计 · Agent',
    stars: 6420,
    forks: 482,
    watchers: 218,
    growth24h: 328,
    growth7d: 1210,
    region: 'US / Germany / China',
    recommendation: 'A',
    risk: 'Medium',
    lat: 37.7749,
    lng: -122.4194,
    license: 'MIT',
    lastActive: '8 小时前',
    demoUrl: 'https://room-agent.demo',
    summary: '面向室内设计工作流的多 Agent 协同规划 Demo，可生成方案、材料清单与空间说明。',
    audience: ['室内设计师', 'Agent 开发者', '独立开发者', '产品经理'],
    techStack: ['Python', 'LangGraph', 'OpenAI API', 'FastAPI', 'React'],
    useCases: ['室内设计自动化流程', 'Agent 工作流验证', '设计方案快速生成', '家具材料清单生成'],
    demoJudgment: '项目提供在线 Demo，但依赖外部 OpenAI API Key，需要本地配置后才能稳定体验。README 中有完整的输入格式说明，样例数据较为详细。',
    techAnalysis: [
      '采用 LangGraph 作为多 Agent 协作框架，通过 DAG 定义任务流，技术路径成熟。',
      '核心链路：用户输入空间需求 → Planner Agent 拆分任务 → Designer Agent 生成方案 → Reporter Agent 输出说明。',
      '接入 OpenAI API 实现自然语言理解，具备替换其他 LLM 的扩展能力。',
      '项目更接近有完整 Demo 的技术验证，但真实业务场景中的稳定性和格式统一性仍待验证。',
    ],
    risks: [
      'Demo 依赖外部 API，网络不稳定时体验降级明显。',
      '输出格式有时不一致，方案的结构化程度依赖 Prompt 质量。',
      '室内设计专业知识库较薄弱，生成内容偏通用，专业场景需自行调教。',
      'License 为 MIT，可商用，但贡献者仍为小团队，长期维护有不确定性。',
    ],
    nextSteps: ['先运行官方 Demo 验证基本链路', '检查输出格式是否可接入设计工具', '对比 LangGraph 官方示例差异'],
    conclusion: '项目具备清晰的技术路径和可体验的 Demo，对室内设计 × Agent 领域有一定探索价值。推荐等级 A，建议先验证输入输出格式的稳定性，再决定是否深入改造。',
    evaluation: [
      '项目价值在于把空间方案生成、任务拆解和设计说明放入一个可协作的 Agent 流程中。',
      '适合优先验证其输入格式、输出稳定性，以及是否能接入真实设计素材。',
      '主要风险是 Demo 可能偏概念化，仍需确认是否具备完整样例和可复现数据。',
    ],
    updates: ['作者 8 小时前更新 Prompt pipeline', '24 小时新增 328 stars', '新增一个 furniture-layout 示例'],
    mediaRefs: [
      { source: 'Hacker News', summary: '多位开发者评价其 LangGraph 的用法较规范，但 Prompt 调教成本较高。' },
      { source: 'X / Twitter', summary: '设计师群体转发量高，评价集中在「终于有工具把 AI 和室内设计连起来了」。' },
    ],
  },
  {
    key: 'spline-tools',
    name: 'SplatMap Viewer',
    repo: 'github.com/example/splatmap-viewer',
    category: '3D / BIM / AEC',
    stars: 2890,
    forks: 174,
    watchers: 93,
    growth24h: 146,
    growth7d: 804,
    region: 'France / Japan / Singapore',
    recommendation: 'B',
    risk: 'High',
    lat: 35.6762,
    lng: 139.6503,
    license: 'Apache 2.0',
    lastActive: '2 天前',
    demoUrl: '',
    summary: '将 3D Gaussian Splatting 数据叠加到建筑模型中的可视化工具。',
    audience: ['AEC 用户', '3D 工具开发者', '可视化工程师', '建筑设计师'],
    techStack: ['TypeScript', 'Three.js', 'WebGL', '3DGS Runtime'],
    useCases: ['建筑模型 3DGS 可视化', 'BIM 数据叠加展示', '空间扫描数据预览'],
    demoJudgment: '目前没有在线 Demo，需本地运行。README 提供了安装步骤但未附带完整样例数据，需要用户自行准备 .splat 文件，复现门槛较高。',
    techAnalysis: [
      '核心路径：加载 .splat 格式的 3DGS 文件，与 Three.js 场景融合渲染。',
      '使用 WebGL 实现实时渲染，浏览器端免安装，但对显卡要求较高。',
      '坐标配准是当前最大技术难点，3DGS 与 BIM 模型的坐标系统差异尚未完全解决。',
      '整体更接近技术路径验证，尚未形成完整工具闭环。',
    ],
    risks: [
      '没有在线 Demo，本地运行依赖特定硬件和数据格式。',
      '样例数据缺失，用户需要自备 .splat 文件，无法快速体验效果。',
      '坐标配准功能不完整，在实际 AEC 场景中适用性有限。',
      'Issue 中存在多条未解决的模型配准问题，维护响应较慢。',
    ],
    nextSteps: ['准备一个小型 .splat 文件先验证基础加载', '检查 Issue 中的坐标配准解决方案', '对比 Luma AI 和 Polycam 的 3DGS 导出格式'],
    conclusion: '技术路径有价值，但当前成熟度偏低，缺乏完整样例和可用 Demo。推荐等级 B，仅建议作为技术参考观察，不适合直接投入业务改造。',
    evaluation: [
      '项目技术路径值得关注，能验证 3DGS 与建筑模型叠加展示的可能性。',
      '公开资料显示它更接近技术验证，而不是完整业务工具。',
      '需要重点检查样例数据、坐标配准能力、格式转换和 Demo 稳定性。',
    ],
    updates: ['新增 LCC loader 说明', 'Issue 中有 3 条关于模型配准的讨论', '7 日增长 804 stars'],
    mediaRefs: [
      { source: 'Reddit (r/architecture)', summary: '少量 AEC 从业者关注，但评价集中在「需要配准功能才有实用价值」。' },
    ],
  },
  {
    key: 'designer-cli',
    name: 'Designer CLI',
    repo: 'github.com/example/designer-cli',
    category: '设计师工具',
    stars: 1580,
    forks: 96,
    watchers: 54,
    growth24h: 88,
    growth7d: 330,
    region: 'India / Korea / US',
    recommendation: 'B',
    risk: 'Low',
    lat: 28.6139,
    lng: 77.209,
    license: 'MIT',
    lastActive: '3 天前',
    demoUrl: 'https://designer-cli.docs',
    summary: '给设计师使用的命令行素材整理工具，支持批量命名、导出和 AI 标注。',
    audience: ['设计师', '内容创作者', '前端开发者', '独立开发者'],
    techStack: ['Node.js', 'TypeScript', 'OpenAI Vision', 'Sharp', 'Commander.js'],
    useCases: ['设计素材批量整理', 'AI 自动标注图片', 'Figma 资产批量导出', '文件夹命名规范化'],
    demoJudgment: '文档完整，README 中有清晰的命令示例。支持 macOS / Linux / Windows，安装体验良好。AI 标注功能需要配置 API Key，基础命令无需联网即可使用。',
    techAnalysis: [
      '基于 Commander.js 构建 CLI 框架，命令结构清晰，扩展性好。',
      '使用 Sharp 处理图片批量操作，性能稳定。',
      'AI 标注功能调用 OpenAI Vision API，对图片自动生成描述和标签。',
      '整体技术成熟，是可用工具而非技术验证。',
    ],
    risks: [
      'AI 标注功能依赖 OpenAI API，费用随使用量增长。',
      '部分格式（如 .sketch）支持有限，Figma 导出需额外配置。',
      '对非程序员的设计师来说，CLI 使用门槛略高。',
    ],
    nextSteps: ['安装并运行基础命令验证效果', '测试 AI 标注准确率', '检查是否支持 Figma Token 方式导出'],
    conclusion: '工具定位明确，技术成熟，使用门槛低，适合有一定 CLI 基础的设计师和前端开发者。推荐等级 B，可作为常用工具纳入工作流。',
    evaluation: [
      '项目切入点明确，解决设计资产整理和批量处理的实际问题。',
      '技术复杂度不高，但使用频次可能较高，适合作为轻量工具观察。',
      '建议先检查安装体验、文件格式支持和跨平台稳定性。',
    ],
    updates: ['发布 v0.4.0', '新增 Figma export helper', 'README 补充 Windows 用法'],
    mediaRefs: [
      { source: 'Product Hunt', summary: '上线时获得 280 upvotes，设计师群体反馈积极，评价集中在「节省了大量整理时间」。' },
      { source: 'GitHub Discussions', summary: '作者积极响应 Issue，社区氛围良好。' },
    ],
  },
  {
    key: 'agent-runtime',
    name: 'Agent Runtime Kit',
    repo: 'github.com/example/agent-runtime-kit',
    category: 'Agent 智能体开发',
    stars: 9400,
    forks: 610,
    watchers: 384,
    growth24h: 512,
    growth7d: 2190,
    region: 'US / Canada / UK',
    recommendation: 'A',
    risk: 'Medium',
    lat: 43.6532,
    lng: -79.3832,
    license: 'MIT',
    lastActive: '4 小时前',
    demoUrl: 'https://agent-runtime.docs',
    summary: '用于构建工具调用、记忆、任务队列和多 Agent 协作的运行时框架。',
    audience: ['Agent 开发者', '开源维护者', '创业者', '产品经理', '高影响力 GitHub 用户'],
    techStack: ['Python', 'AsyncIO', 'Redis', 'Pydantic', 'FastAPI', 'WebSocket'],
    useCases: ['多 Agent 任务协作', '工具调用框架', '持久化 Agent 记忆', '任务队列管理', 'AI 工作流编排'],
    demoJudgment: '提供完整示例集，文档覆盖从快速入门到高级用法，质量高。本地运行依赖 Redis，安装步骤清晰。建议先跑官方提供的 multi-agent-demo 示例。',
    techAnalysis: [
      '核心架构：Agent Manager 管理 Agent 生命周期，Memory Adapter 支持多种持久化后端。',
      '任务队列基于 AsyncIO + Redis，支持分布式部署，可扩展性强。',
      '与 LangGraph 定位不同：LangGraph 侧重有向图编排，Agent Runtime Kit 更侧重运行时基础设施。',
      '工具调用接口设计规范，支持 Function Calling 和自定义 Tool Schema。',
    ],
    risks: [
      '依赖 Redis 作为任务队列，增加了基础设施复杂度。',
      '与 LangGraph、CrewAI 功能有重叠，需评估是否存在重复建设。',
      '生态尚处于快速迭代阶段，API 存在 Breaking Change 风险。',
      '部分高级功能文档缺失，需阅读源码理解。',
    ],
    nextSteps: ['运行 multi-agent-demo 验证基础链路', '对比 LangGraph 任务编排能力', '确认 Memory Adapter 支持的数据库类型'],
    conclusion: '项目覆盖 Agent 开发核心基础设施，文档质量高，社区活跃，增长迅速。推荐等级 A，是当前值得优先关注和本地评测的框架之一。',
    evaluation: [
      '项目覆盖 Agent 开发的核心基础设施，具备较强通用性。',
      '需要重点判断它与 LangGraph、CrewAI 等方案相比的差异。',
      '如果文档和示例完整，值得优先进入本地评测。',
    ],
    updates: ['作者新增 memory adapter', '新 Release 包含 task queue', '高影响力用户关注明显增加'],
    mediaRefs: [
      { source: 'Hacker News', summary: '在 Agent 基础设施讨论帖中多次被提及，被认为是目前最完整的运行时框架之一。' },
      { source: 'X / Twitter', summary: '多位高影响力 AI 开发者转发，评价为「解决了 Agent 持久化和调度的核心痛点」。' },
      { source: 'Reddit (r/MachineLearning)', summary: '收到详细技术对比讨论，与 LangGraph 的差异分析获得大量点赞。' },
    ],
  },
];

type MapPoint = {
  city: string;
  country: string;
  lat: number;
  lng: number;
  count: number;
  influence: '5k+' | '1k+' | '500+' | '100-500' | '<100';
  project: string;
};

/** 用 Canvas 生成与 starmapper 风格一致的地球纹理：米白海洋 + 灰棕大洲 */
function buildGlobeTexture(): string {
  const W = 2048, H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // 海洋底色：米白
  ctx.fillStyle = '#e4ddd0';
  ctx.fillRect(0, 0, W, H);

  // 经纬度 → 像素坐标（等矩形投影）
  const px = (lng: number) => ((lng + 180) / 360) * W;
  const py = (lat: number) => ((90 - lat) / 180) * H;

  ctx.fillStyle = '#b5b09c';

  const poly = (pts: [number, number][]) => {
    ctx.beginPath();
    pts.forEach(([lng, lat], i) => i === 0 ? ctx.moveTo(px(lng), py(lat)) : ctx.lineTo(px(lng), py(lat)));
    ctx.closePath();
    ctx.fill();
  };

  // 北美洲（含阿拉斯加）
  poly([[-168,72],[-150,70],[-130,68],[-110,70],[-90,72],[-80,78],[-90,83],[-110,83],[-130,80],[-150,76],[-168,72]]);
  poly([[-138,60],[-122,48],[-118,34],[-115,28],[-100,20],[-88,14],[-80,9],[-78,10],[-76,20],[-78,30],[-80,38],[-82,44],[-78,52],[-70,46],[-60,46],[-65,50],[-70,58],[-75,62],[-82,68],[-90,68],[-100,64],[-110,62],[-120,60],[-130,60],[-138,60]]);
  // 格陵兰
  poly([[-56,76],[-42,78],[-26,82],[-20,76],[-26,70],[-36,67],[-50,68],[-56,72],[-56,76]]);
  // 中美洲
  poly([[-92,18],[-86,14],[-80,8],[-78,8],[-78,12],[-84,16],[-90,18],[-92,18]]);
  // 加勒比
  poly([[-76,20],[-72,18],[-68,18],[-68,20],[-72,22],[-76,20]]);
  // 南美洲
  poly([[-78,12],[-78,2],[-72,-8],[-68,-20],[-65,-32],[-68,-44],[-70,-54],[-62,-54],[-52,-30],[-44,-20],[-36,-10],[-36,-2],[-42,2],[-52,4],[-60,4],[-66,0],[-72,2],[-78,8],[-78,12]]);

  // 欧洲（西欧）
  poly([[-10,36],[0,36],[8,44],[18,46],[22,48],[28,52],[26,58],[20,58],[14,54],[8,52],[2,48],[-4,44],[-10,36]]);
  // 斯堪的纳维亚
  poly([[5,58],[12,56],[18,58],[22,62],[26,68],[22,70],[18,68],[14,65],[8,62],[5,58]]);
  poly([[18,62],[22,60],[28,60],[30,64],[26,65],[18,62]]);
  // 英国
  poly([[-4,50],[0,52],[0,54],[-2,56],[-4,58],[-6,56],[-8,54],[-6,50],[-4,50]]);
  // 冰岛
  poly([[-24,64],[-16,64],[-13,65],[-16,66],[-22,66],[-24,64]]);

  // 非洲
  poly([[-18,16],[0,14],[8,10],[14,4],[20,-2],[26,-10],[32,-20],[34,-28],[30,-34],[22,-36],[16,-28],[8,-20],[2,-12],[-4,-2],[-8,6],[-14,12],[-18,16]]);
  poly([[36,12],[42,20],[46,28],[42,30],[36,22],[36,12]]);
  // 马达加斯加
  poly([[44,-12],[48,-16],[50,-22],[48,-26],[44,-24],[42,-16],[44,-12]]);

  // 阿拉伯半岛
  poly([[32,28],[38,28],[48,24],[56,20],[58,14],[52,12],[44,14],[38,22],[34,26],[32,28]]);

  // 中东/安纳托利亚
  poly([[26,40],[32,38],[38,38],[44,36],[46,40],[42,42],[36,42],[28,42],[26,40]]);

  // 亚洲（主体 - 中亚/西伯利亚）
  poly([[40,58],[50,58],[60,62],[70,70],[80,72],[100,72],[120,70],[135,68],[140,62],[135,56],[120,52],[100,52],[80,62],[70,58],[60,56],[50,54],[40,58]]);
  poly([[40,38],[50,46],[60,50],[70,54],[80,50],[90,50],[100,52],[110,50],[120,48],[130,52],[140,50],[145,44],[138,40],[130,38],[120,34],[110,26],[104,22],[96,20],[88,22],[80,28],[75,32],[68,38],[60,42],[50,44],[40,38]]);

  // 印度
  poly([[62,22],[68,22],[76,20],[80,20],[86,18],[88,22],[80,28],[74,32],[68,26],[62,22]]);
  poly([[68,22],[76,20],[80,14],[78,8],[72,8],[66,10],[62,14],[68,22]]);
  // 斯里兰卡
  poly([[80,8],[82,8],[82,6],[80,6],[80,8]]);

  // 东南亚（缅甸/泰国/越南）
  poly([[96,20],[100,14],[104,10],[105,6],[102,2],[98,2],[94,6],[96,14],[96,20]]);
  poly([[100,14],[104,10],[108,6],[112,2],[116,2],[120,2],[118,6],[112,10],[106,12],[100,14]]);

  // 中国
  poly([[80,48],[88,50],[100,52],[110,50],[120,48],[130,52],[135,48],[135,40],[128,38],[120,34],[114,28],[108,24],[104,22],[96,20],[90,26],[84,30],[80,38],[78,42],[80,48]]);
  // 朝鲜/韩国
  poly([[126,34],[128,36],[130,38],[128,40],[126,40],[124,38],[124,36],[126,34]]);
  // 日本本州
  poly([[130,32],[132,34],[134,36],[136,36],[138,38],[140,38],[140,36],[136,34],[132,32],[130,32]]);
  poly([[130,40],[132,42],[136,44],[140,40],[140,36],[136,36],[132,38],[130,40]]);
  poly([[142,44],[144,44],[146,44],[146,42],[144,40],[142,44]]);

  // 马来西亚/印尼
  poly([[100,6],[104,4],[108,2],[116,2],[120,2],[124,2],[126,4],[122,6],[114,6],[106,6],[100,6]]);
  poly([[108,-2],[112,-5],[118,-6],[122,-8],[126,-8],[128,-6],[124,-4],[118,-4],[112,-4],[108,-2]]);
  poly([[132,-4],[136,-5],[140,-5],[146,-6],[150,-5],[148,-3],[142,-3],[136,-4],[132,-4]]);
  poly([[120,-8],[126,-10],[130,-12],[134,-12],[136,-10],[132,-8],[126,-8],[120,-8]]);
  // 菲律宾
  poly([[118,10],[120,14],[124,18],[122,20],[118,18],[116,14],[118,10]]);

  // 澳大利亚
  poly([[114,-22],[120,-18],[128,-14],[136,-12],[140,-16],[144,-22],[146,-28],[146,-32],[142,-36],[136,-38],[130,-34],[124,-30],[118,-26],[114,-22]]);
  // 塔斯马尼亚
  poly([[145,-40],[148,-42],[150,-42],[149,-40],[145,-40]]);
  // 新西兰北岛
  poly([[174,-38],[178,-40],[178,-36],[174,-36],[172,-38],[174,-38]]);
  // 新西兰南岛
  poly([[168,-44],[172,-46],[174,-44],[172,-42],[168,-42],[168,-44]]);

  // 南极洲
  poly([[-180,-70],[0,-70],[180,-70],[180,-90],[-180,-90],[-180,-70]]);
  // 南极洲颜色略浅
  ctx.fillStyle = '#cac5b4';
  poly([[-180,-70],[0,-70],[180,-70],[180,-90],[-180,-90],[-180,-70]]);
  ctx.fillStyle = '#b5b09c';

  return canvas.toDataURL('image/png');
}

const mapPoints: MapPoint[] = [
  { city: 'San Francisco', country: 'US', lat: 37.7749, lng: -122.4194, count: 24, influence: '5k+', project: 'RoomAgent Studio' },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, count: 17, influence: '1k+', project: 'Agent Runtime Kit' },
  { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405, count: 7, influence: '500+', project: 'RoomAgent Studio' },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, count: 3, influence: '100-500', project: 'SplatMap Viewer' },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, count: 24, influence: '1k+', project: 'SplatMap Viewer' },
  { city: 'Seoul', country: 'Korea', lat: 37.5665, lng: 126.978, count: 10, influence: '500+', project: 'Designer CLI' },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, count: 7, influence: '100-500', project: 'SplatMap Viewer' },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, count: 2, influence: '<100', project: 'Designer CLI' },
  { city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, count: 2, influence: '<100', project: 'RoomAgent Studio' },
  { city: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.209, count: 8, influence: '100-500', project: 'Designer CLI' },
];

const menuItems = [
  { key: 'daily', label: 'Daily Briefing' },
  { key: 'radar', label: 'Repository Radar' },
  { key: 'map', label: 'Global Map' },
  { key: 'search', label: 'Search & Fetch' },
  { key: 'following', label: '我的关注' },
  { key: 'account', label: '账号' },
];

function recommendationTag(value: Recommendation) {
  const color = value === 'A' ? 'green' : value === 'B' ? 'blue' : value === 'C' ? 'gold' : 'default';
  const label = value === 'A' ? '强烈建议研究' : value === 'B' ? '值得观察' : value === 'C' ? '记录即可' : '暂不建议';
  return <Tag color={color}>{label}</Tag>;
}

function riskTag(value: Project['risk']) {
  const color = value === 'Low' ? 'green' : value === 'Medium' ? 'orange' : 'red';
  return <Tag color={color}>{value} Risk</Tag>;
}

export default function App() {
  const [page, setPage] = useState<PageKey>('daily');
  const [following, setFollowing] = useState<string[]>(['room-agent', 'agent-runtime']);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const followingProjects = useMemo(
    () => projects.filter((project) => following.includes(project.key)),
    [following],
  );

  const toggleFollow = (project: Project) => {
    const isFollowing = following.includes(project.key);
    setFollowing((current) =>
      isFollowing ? current.filter((key) => key !== project.key) : [...current, project.key],
    );
    message.success(isFollowing ? '已取消关注' : '已关注项目，后续更新会出现在我的关注页');
  };

  const columns: ColumnsType<Project> = [
    {
      title: '项目',
      dataIndex: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.name}</Text>
          <Text type="secondary">{record.repo}</Text>
        </Space>
      ),
    },
    {
      title: '方向',
      dataIndex: 'category',
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: 'Stars',
      dataIndex: 'stars',
      sorter: (a, b) => a.stars - b.stars,
      render: (value) => value.toLocaleString(),
    },
    {
      title: '24h 增长',
      dataIndex: 'growth24h',
      sorter: (a, b) => a.growth24h - b.growth24h,
      render: (value) => <Text type="success">+{value}</Text>,
    },
    {
      title: '推荐',
      dataIndex: 'recommendation',
      render: recommendationTag,
    },
    {
      title: '风险',
      dataIndex: 'risk',
      render: riskTag,
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => setSelectedProject(record)}>
            查看详情
          </Button>
          <Button onClick={() => toggleFollow(record)}>
            {following.includes(record.key) ? '取消关注' : '关注项目'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 10,
          colorBgLayout: '#f7f8fa',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
        },
      }}
    >
      <Layout className="app-shell">
        <Header className="app-header">
          <div className="brand" onClick={() => setPage('daily')}>
            <span className="brand-mark">W</span>
            <span>WAGMI Daily</span>
          </div>
          <Menu
            className="top-menu"
            mode="horizontal"
            selectedKeys={[page]}
            items={menuItems}
            onClick={({ key }) => setPage(key as PageKey)}
          />
          <Button type="primary" onClick={() => setPage('search')}>
            搜索项目
          </Button>
        </Header>
        <Content className={page === 'map' ? 'app-content map-content' : 'app-content'}>
          {page === 'daily' && (
            <DailyPage
              projects={projects}
              following={following}
              onView={setSelectedProject}
              onFollow={toggleFollow}
              onNavigate={setPage}
            />
          )}
          {page === 'radar' && <RadarPage projects={projects} columns={columns} />}
          {page === 'map' && <MapPage projects={projects} onView={setSelectedProject} />}
          {page === 'search' && <SearchPage onView={setSelectedProject} onFollow={toggleFollow} />}
          {page === 'following' && (
            <FollowingPage projects={followingProjects} onView={setSelectedProject} onFollow={toggleFollow} />
          )}
          {page === 'account' && <AccountPage followingCount={followingProjects.length} />}
        </Content>
      </Layout>

      <Drawer
        width={720}
        title="Project Intelligence"
        open={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            isFollowing={following.includes(selectedProject.key)}
            onFollow={() => toggleFollow(selectedProject)}
          />
        )}
      </Drawer>
    </ConfigProvider>
  );
}

function DailyPage({
  projects,
  following,
  onView,
  onFollow,
  onNavigate,
}: {
  projects: Project[];
  following: string[];
  onView: (project: Project) => void;
  onFollow: (project: Project) => void;
  onNavigate: (page: PageKey) => void;
}) {
  const topProjects = [...projects].sort((a, b) => b.growth24h - a.growth24h).slice(0, 3);
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const lastUpdated = '02:14';
  const nextUpdate = '08:00';

  return (
    <Space direction="vertical" size={24} className="page-stack">
      <section className="hero-panel">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={14}>
            <Space size={8} style={{ marginBottom: 10 }}>
              <Tag color="blue">Daily Repository Intelligence</Tag>
              <Tag color="default">{dateStr}</Tag>
            </Space>
            <Title level={1} style={{ marginTop: 0 }}>每日 GitHub 项目情报雷达</Title>
            <Paragraph>
              自动采集室内设计、Agent 智能体开发、设计师工具和 3D / BIM / AEC 项目，结合热度、用户分布和详细评估，帮助少量用户快速判断哪些项目值得继续研究。
            </Paragraph>
            <Space wrap style={{ marginBottom: 16 }}>
              <Text type="secondary">最近更新：{lastUpdated}</Text>
              <Divider type="vertical" />
              <Text type="secondary">下次更新：{nextUpdate}</Text>
            </Space>
            <br />
            <Space wrap>
              <Button type="primary" size="large" onClick={() => onNavigate('radar')}>
                查看今日项目
              </Button>
              <Button size="large" onClick={() => onNavigate('map')}>
                打开全球地图
              </Button>
              <Button size="large" onClick={() => onNavigate('following')}>
                我的关注
              </Button>
            </Space>
          </Col>
          <Col xs={24} lg={10}>
            <GlobeCard />
          </Col>
        </Row>
      </section>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="今日扫描" value={126} suffix="repos" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="今日入库" value={18} suffix="repos" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="正在升温" value={5} suffix="repos" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="我的关注" value={following.length} suffix="repos" />
          </Card>
        </Col>
      </Row>

      <Card title="今日重点项目" extra={<Button onClick={() => onNavigate('radar')}>查看全部</Button>}>
        <Row gutter={[16, 16]}>
          {topProjects.map((project) => (
            <Col xs={24} lg={8} key={project.key}>
              <ProjectCard
                project={project}
                isFollowing={following.includes(project.key)}
                onView={() => onView(project)}
                onFollow={() => onFollow(project)}
              />
            </Col>
          ))}
        </Row>
      </Card>

      <Alert
        type="info"
        showIcon
        message="今日趋势摘要"
        description="Agent 运行时与 3D / BIM 可视化工具增长明显。建议优先查看 RoomAgent Studio 与 Agent Runtime Kit，同时谨慎评估 SplatMap Viewer 的样例数据完整性和复现风险。室内设计 × Agent 方向出现跨区域关注，US / Germany / China 用户同时增长。"
      />
    </Space>
  );
}

function ProjectCard({
  project,
  isFollowing,
  onView,
  onFollow,
}: {
  project: Project;
  isFollowing: boolean;
  onView: () => void;
  onFollow: () => void;
}) {
  return (
    <Card className="project-card">
      <Space direction="vertical" size={12} className="full-width">
        <Space wrap>
          <Tag>{project.category}</Tag>
          {recommendationTag(project.recommendation)}
          {riskTag(project.risk)}
        </Space>
        <Title level={4}>{project.name}</Title>
        <Paragraph type="secondary">{project.summary}</Paragraph>
        <Row gutter={12}>
          <Col span={8}>
            <Statistic title="Stars" value={project.stars} valueStyle={{ fontSize: 18 }} />
          </Col>
          <Col span={8}>
            <Statistic title="24h" value={project.growth24h} prefix="+" valueStyle={{ fontSize: 18, color: '#1f9d55' }} />
          </Col>
          <Col span={8}>
            <Statistic title="7d" value={project.growth7d} prefix="+" valueStyle={{ fontSize: 18, color: '#1677ff' }} />
          </Col>
        </Row>
        <Text type="secondary">用户分布：{project.region}</Text>
        <Space>
          <Button type="primary" onClick={onView}>
            查看详情
          </Button>
          <Button onClick={onFollow}>{isFollowing ? '取消关注' : '关注项目'}</Button>
        </Space>
      </Space>
    </Card>
  );
}

function RadarPage({ projects, columns }: { projects: Project[]; columns: ColumnsType<Project> }) {
  return (
    <Space direction="vertical" size={16} className="page-stack">
      <PageHeader title="Repository Radar" subtitle="筛选、排序并比较已入库项目。" />
      <Card>
        <Space wrap className="toolbar">
          <Input.Search placeholder="搜索项目、方向或 GitHub URL" allowClear style={{ width: 320 }} />
          <Segmented options={['全部', '室内设计', 'Agent', '设计师工具', '3D / BIM']} />
          <Button>手动更新库存</Button>
        </Space>
      </Card>
      <Table columns={columns} dataSource={projects} pagination={{ pageSize: 5 }} />
    </Space>
  );
}

function MapPage({ projects, onView }: { projects: Project[]; onView: (project: Project) => void }) {
  const [mode, setMode] = useState<string | number>('Clusters');
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>('all');

  const activeProject = selectedProjectKey === 'all' ? null : projects.find((p) => p.key === selectedProjectKey) ?? null;
  const activeStars = activeProject ? activeProject.stars : projects.reduce((sum, p) => sum + p.stars, 0);
  const activeMapped = selectedProjectKey === 'all' ? (mode === 'Heatmap' ? 126 : 80) : (mode === 'Heatmap' ? 24 : 17);
  const activeCountries = selectedProjectKey === 'all' ? (mode === 'Heatmap' ? 12 : 10) : 6;

  return (
    <div className="starmapper-shell">
      <div className="repo-pill">
        {activeProject ? activeProject.repo : 'WAGMI Daily · All Projects'}
      </div>

      <div className="map-top-card">
        <Space size={8} className="repo-search-row" style={{ width: '100%' }}>
          <Select
            size="small"
            value={selectedProjectKey}
            onChange={setSelectedProjectKey}
            style={{ flex: 1, minWidth: 0 }}
            options={[
              { value: 'all', label: '全部项目' },
              ...projects.map((p) => ({ value: p.key, label: p.name })),
            ]}
          />
        </Space>
        <Row gutter={0} className="map-stat-row">
          <Col span={8}>
            <Statistic title="MAPPED" value={activeMapped} />
          </Col>
          <Col span={8}>
            <Statistic title="STARS" value={activeStars.toLocaleString()} />
          </Col>
          <Col span={8}>
            <Statistic title="COUNTRIES" value={activeCountries} />
          </Col>
        </Row>
        <Progress percent={mode === 'Heatmap' ? 74 : 66} showInfo={false} strokeColor="#d96c24" />
        {activeProject && (
          <Space direction="vertical" size={4} style={{ width: '100%', marginTop: 8 }}>
            <Space wrap>
              <Tag>{activeProject.category}</Tag>
              {recommendationTag(activeProject.recommendation)}
              {riskTag(activeProject.risk)}
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>{activeProject.region}</Text>
          </Space>
        )}
        <Input.Search size="middle" placeholder="Find a stargazer..." enterButton="Find" style={{ marginTop: 8 }} />
      </div>

      <div className="map-right-toolbar">
        <Button>Leaderboard</Button>
        <Button>Faster scan</Button>
        <Button type={mode === '3D Globe' ? 'primary' : 'default'} onClick={() => setMode('3D Globe')}>
          3D
        </Button>
        <Button>?</Button>
      </div>

      <div className="map-left-panel">
        <Segmented value={mode} onChange={setMode} options={['Clusters', 'Heatmap', '3D Globe']} />
        <div className="map-panel-card">
          <Text type="secondary">MAP CONTROLS</Text>
          <Divider className="compact-divider" />
          <Text type="secondary">DENSITY</Text>
          <div className="density-bar" />
          <Space direction="vertical" size={6} className="full-width mt-12">
            <Tag>All</Tag>
            <Tag color="blue">5k+ followers</Tag>
            <Tag color="purple">1k+ followers</Tag>
            <Tag color="orange">500+ followers</Tag>
            <Tag color="red">100-500</Tag>
            <Tag>&lt;100</Tag>
          </Space>
        </div>
        {['Stats', `Stargazers ${activeStars.toLocaleString()}`, 'Growth', 'Watch', 'History', 'Timelapse'].map((item) => (
          <Button block key={item} className="side-nav-button">
            {item}
          </Button>
        ))}
        <Button block type="primary" className="share-button">
          Share
        </Button>
      </div>

      <div className="map-stage-real">
        {mode === '3D Globe'
          ? <RealGlobe height={760} width={1180} />
          : <StarDistributionMap mode={mode} projects={projects} onView={onView} filterKey={selectedProjectKey} />
        }
      </div>
    </div>
  );
}

const JAWG_ACCESS_TOKEN = 'Qg8uUqGJJLkn6ZP6fh7Y5buzR8olTadzouiKhgOJa5i4duSFU8fByHgSNYqFtXNG';
const JAWG_TILE_URL = `https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=${JAWG_ACCESS_TOKEN}`;
const JAWG_ATTRIBUTION = '&copy; <a href="https://www.jawg.io" target="_blank">Jawg Maps</a> &copy; <a href="https://www.openstreetmap.org" target="_blank">OpenStreetMap</a>';

function StarDistributionMap({
  mode,
  projects,
  onView,
  filterKey = 'all',
}: {
  mode: string | number;
  projects: Project[];
  onView: (project: Project) => void;
  filterKey?: string;
}) {
  const filteredPoints = filterKey === 'all'
    ? mapPoints
    : mapPoints.filter((point) => {
        const project = projects.find((p) => p.key === filterKey);
        return project ? point.project === project.name : true;
      });

  const isHeatmap = mode === 'Heatmap';

  return (
    <MapContainer center={[22, 20]} zoom={2} minZoom={2} maxZoom={6} zoomControl={false} className="leaflet-stage">
      <TileLayer attribution={JAWG_ATTRIBUTION} url={JAWG_TILE_URL} />
      {filteredPoints.map((point) => {
        const project = projects.find((item) => item.name === point.project) ?? projects[0];
        const isHeatmapMode = isHeatmap;
        return (
          <CircleMarker
            key={`${point.city}-${point.project}`}
            center={[point.lat, point.lng]}
            radius={isHeatmapMode ? Math.max(12, point.count * 1.25) : Math.max(5, point.count * 0.55)}
            pathOptions={{
              color: isHeatmapMode ? '#374151' : '#6aa8ff',
              fillColor: isHeatmapMode ? '#18204f' : '#69a7ff',
              fillOpacity: isHeatmapMode ? 0.28 : 0.82,
              opacity: isHeatmapMode ? 0.12 : 0.92,
              weight: isHeatmapMode ? 1 : 2,
            }}
          >
            <Popup>
              <Space direction="vertical" size={4}>
                <Text strong>{point.city}, {point.country}</Text>
                <Text>{point.count} mapped stargazers</Text>
                <Text type="secondary">{point.influence} followers · {point.project}</Text>
                <Button size="small" type="primary" onClick={() => onView(project)}>
                  查看项目
                </Button>
              </Space>
            </Popup>
          </CircleMarker>
        );
      })}
      <MapZoomControls />
    </MapContainer>
  );
}

function MapZoomControls() {
  const map = useMap();
  return (
    <div className="antd-map-zoom">
      <Button onClick={() => map.zoomIn()}>+</Button>
      <Button onClick={() => map.zoomOut()}>−</Button>
    </div>
  );
}

function RealGlobe({ height, width = 560 }: { height: number; width?: number }) {
  const globeRef = useRef<any>(null);
  const [textureUrl, setTextureUrl] = useState<string>('');

  useEffect(() => {
    // 首次渲染后生成纹理（需要 DOM canvas）
    setTextureUrl(buildGlobeTexture());
  }, []);

  useEffect(() => {
    if (!globeRef.current || !textureUrl) return;
    // 初始视角：俯视亚太区（与参考图一致）
    globeRef.current.pointOfView({ lat: 15, lng: 100, altitude: 2 }, 0);
    // 开启慢速自转
    globeRef.current.controls().autoRotate = true;
    globeRef.current.controls().autoRotateSpeed = 0.35;
    globeRef.current.controls().enableZoom = false;
  }, [textureUrl]);

  if (!textureUrl) return <div className="real-globe-stage" style={{ height }} />;

  return (
    <div className="real-globe-stage" style={{ height }}>
      <Globe
        ref={globeRef}
        width={width}
        height={height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={textureUrl}
        showAtmosphere={false}
        showGraticules={false}
        pointsData={mapPoints}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.008}
        pointRadius={(point: MapPoint) => 0.28 + point.count * 0.018}
        pointColor={(point: MapPoint) =>
          point.count >= 20 ? '#c0392b' : point.count >= 8 ? '#e05a2b' : '#8b5e3c'
        }
        pointsMerge={false}
        labelsData={mapPoints.filter((p) => p.count >= 15)}
        labelLat="lat"
        labelLng="lng"
        labelText="city"
        labelSize={0.9}
        labelDotRadius={0}
        labelColor={() => 'rgba(30,20,10,0.72)'}
        labelAltitude={0.012}
      />
    </div>
  );
}


function SearchPage({ onView, onFollow }: { onView: (project: Project) => void; onFollow: (project: Project) => void }) {
  const [query, setQuery] = useState('');
  const [progress, setProgress] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<Project | null>(null);

  const startFetch = () => {
    setFetching(true);
    setProgress(0);
    setResult(null);
    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = value + 20;
        if (next >= 100) {
          window.clearInterval(timer);
          setFetching(false);
          const generated: Project = {
            ...projects[2],
            key: 'live-fetch',
            name: query || 'Live Fetched Repository',
            repo: query.includes('github.com') ? query : `github.com/search/${query || 'live-repo'}`,
            summary: '这是一次实时抓取生成的项目样例，已写入库存候选区并生成初步 PROJECT_EVALUATION。',
          };
          setResult(generated);
        }
        return Math.min(next, 100);
      });
    }, 420);
  };

  return (
    <Space direction="vertical" size={16} className="page-stack">
      <PageHeader title="Search & Fetch" subtitle="搜索库存；如果没有结果，立即抓取 GitHub 信息并生成项目评估。" />
      <Card>
        <Input.Search
          size="large"
          placeholder="输入 GitHub URL、项目名或行业关键词"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          enterButton="搜索"
        />
      </Card>

      {!fetching && !result && (
        <Result
          status="404"
          title="当前库存中还没有这个项目"
          subTitle="WAGMI Daily 可以立即为你抓取 GitHub 信息、分析热度与用户分布，并生成初步 PROJECT_EVALUATION。"
          extra={
            <Space>
              <Button type="primary" onClick={startFetch}>
                立即抓取
              </Button>
              <Button>加入待更新队列</Button>
            </Space>
          }
        />
      )}

      {fetching && (
        <Card>
          <Space direction="vertical" size={16} className="full-width">
            <Skeleton active paragraph={{ rows: 3 }} />
            <Progress percent={progress} />
            <Timeline
              items={[
                { children: '正在检索 GitHub 仓库' },
                { children: '正在读取 README' },
                { children: '正在分析 Star / Fork / Issue 活跃度' },
                { children: '正在生成 PROJECT_EVALUATION' },
                { children: '正在写入项目库存' },
              ]}
            />
          </Space>
        </Card>
      )}

      {result && (
        <Card title="实时抓取结果" extra={<Badge status="success" text="已写入候选库存" />}>
          <ProjectCard project={result} isFollowing={false} onView={() => onView(result)} onFollow={() => onFollow(result)} />
        </Card>
      )}
    </Space>
  );
}

function FollowingPage({
  projects,
  onView,
  onFollow,
}: {
  projects: Project[];
  onView: (project: Project) => void;
  onFollow: (project: Project) => void;
}) {
  if (!projects.length) {
    return (
      <Result
        status="info"
        title="还没有关注项目"
        subTitle="关注项目后，原作者 / 仓库更新提醒会只展示给关注该项目的用户。"
        extra={<Button type="primary">去项目库看看</Button>}
      />
    );
  }

  return (
    <Space direction="vertical" size={16} className="page-stack">
      <PageHeader title="我的关注" subtitle="只追踪你关注的项目，更新提醒不会全站广播。" />
      <Alert type="success" showIcon message="今日有 3 个关注项目出现更新" description="提醒只展示给关注对应项目的用户。第一版先使用站内提醒，不做邮件、短信或私信。" />
      <Row gutter={[16, 16]}>
        {projects.map((project) => (
          <Col xs={24} lg={12} key={project.key}>
            <Card
              title={project.name}
              extra={<Badge count={project.updates.length} style={{ backgroundColor: '#1677ff' }} />}
              actions={[
                <Button type="link" onClick={() => onView(project)} key="detail">
                  查看详情
                </Button>,
                <Button type="link" onClick={() => onFollow(project)} key="unfollow">
                  取消关注
                </Button>,
              ]}
            >
              <Timeline items={project.updates.map((update) => ({ children: update }))} />
            </Card>
          </Col>
        ))}
      </Row>
      <Button type="primary">一键更新关注项目</Button>
    </Space>
  );
}

function AccountPage({ followingCount }: { followingCount: number }) {
  return (
    <Space direction="vertical" size={16} className="page-stack narrow-page">
      <PageHeader title="账号" subtitle="第一版先满足约 10 人注册和使用，账号只用于小范围访问与个人关注项目。" />
      <Card title="登录 / 注册 Demo">
        <Form layout="vertical">
          <Form.Item label="邮箱">
            <Input placeholder="name@example.com" />
          </Form.Item>
          <Form.Item label="密码">
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Space>
            <Button type="primary">登录</Button>
            <Button>注册</Button>
          </Space>
        </Form>
      </Card>
      <Card title="当前账号状态">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="访问范围">小范围内测用户</Descriptions.Item>
          <Descriptions.Item label="关注项目">{followingCount} 个</Descriptions.Item>
          <Descriptions.Item label="社交功能">不启用评论、私信、动态流</Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
}

function ProjectDetail({ project, isFollowing, onFollow }: { project: Project; isFollowing: boolean; onFollow: () => void }) {
  return (
    <Space direction="vertical" size={16} className="full-width">
      {/* 头部信息 */}
      <Space wrap>
        <Tag>{project.category}</Tag>
        {recommendationTag(project.recommendation)}
        {riskTag(project.risk)}
        {project.license && <Tag color="geekblue">{project.license}</Tag>}
      </Space>
      <Title level={2} style={{ marginBottom: 4 }}>{project.name}</Title>
      <Text type="secondary">{project.repo}</Text>
      <Paragraph>{project.summary}</Paragraph>

      <Space wrap>
        <Button type="primary" onClick={onFollow}>
          {isFollowing ? '取消关注' : '关注项目'}
        </Button>
        <Button>更新项目数据</Button>
        <Button type="link" href={`https://${project.repo}`} target="_blank">打开 GitHub</Button>
        {project.demoUrl && (
          <Button type="link" href={project.demoUrl} target="_blank">在线 Demo</Button>
        )}
      </Space>

      {/* 核心数据 */}
      <Row gutter={[12, 12]}>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic title="Stars" value={project.stars} valueStyle={{ fontSize: 20 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic title="Forks" value={project.forks} valueStyle={{ fontSize: 20 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic title="24h +" value={project.growth24h} valueStyle={{ fontSize: 20, color: '#1f9d55' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic title="7d +" value={project.growth7d} valueStyle={{ fontSize: 20, color: '#1677ff' }} />
          </Card>
        </Col>
      </Row>

      {/* PROJECT_EVALUATION Tabs */}
      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: 'overview',
            label: '基本信息',
            children: (
              <Space direction="vertical" size={16} className="full-width">
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="GitHub">{project.repo}</Descriptions.Item>
                  <Descriptions.Item label="项目方向">{project.category}</Descriptions.Item>
                  <Descriptions.Item label="技术栈">
                    <Space wrap>{project.techStack.map((t) => <Tag key={t}>{t}</Tag>)}</Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Stars / Forks / Watchers">
                    {project.stars.toLocaleString()} / {project.forks.toLocaleString()} / {project.watchers.toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="用户分布">{project.region}</Descriptions.Item>
                  <Descriptions.Item label="License">{project.license}</Descriptions.Item>
                  <Descriptions.Item label="最近活跃">{project.lastActive}</Descriptions.Item>
                  {project.demoUrl && <Descriptions.Item label="Demo">{project.demoUrl}</Descriptions.Item>}
                </Descriptions>
                <div>
                  <Title level={5}>目标用户群体</Title>
                  <Space wrap>{project.audience.map((a) => <Tag key={a} color="cyan">{a}</Tag>)}</Space>
                </div>
              </Space>
            ),
          },
          {
            key: 'evaluation',
            label: 'PROJECT_EVALUATION',
            children: (
              <Space direction="vertical" size={20} className="full-width">
                <div>
                  <Title level={5}>科普说明</Title>
                  <Paragraph>{project.summary}</Paragraph>
                </div>
                <div>
                  <Title level={5}>使用场景</Title>
                  <List
                    size="small"
                    dataSource={project.useCases}
                    renderItem={(item) => <List.Item>· {item}</List.Item>}
                  />
                </div>
                <div>
                  <Title level={5}>Demo / 可体验性判断</Title>
                  <Alert
                    type={project.demoUrl ? 'success' : 'warning'}
                    showIcon
                    message={project.demoUrl ? '有在线 Demo' : '需本地运行'}
                    description={project.demoJudgment}
                  />
                </div>
                <div>
                  <Title level={5}>技术路径评价</Title>
                  <List
                    size="small"
                    dataSource={project.techAnalysis}
                    renderItem={(item) => <List.Item>· {item}</List.Item>}
                  />
                </div>
                <div>
                  <Title level={5}>关键风险</Title>
                  <List
                    size="small"
                    dataSource={project.risks}
                    renderItem={(item) => (
                      <List.Item>
                        <Text type="danger">⚠ {item}</Text>
                      </List.Item>
                    )}
                  />
                </div>
                <div>
                  <Title level={5}>是否建议继续调研</Title>
                  <Alert
                    type={project.recommendation === 'A' ? 'success' : project.recommendation === 'B' ? 'info' : 'warning'}
                    showIcon
                    message={project.recommendation === 'A' ? '强烈建议研究' : project.recommendation === 'B' ? '值得观察' : '记录即可'}
                    description={
                      <div>
                        <Text>下一步建议：</Text>
                        <List
                          size="small"
                          dataSource={project.nextSteps}
                          renderItem={(item) => <List.Item>→ {item}</List.Item>}
                        />
                      </div>
                    }
                  />
                </div>
                <Card style={{ background: '#f9fafb' }}>
                  <Title level={5}>最终结论</Title>
                  <Paragraph>{project.conclusion}</Paragraph>
                </Card>
              </Space>
            ),
          },
          {
            key: 'updates',
            label: '原作者更新',
            children: (
              <Space direction="vertical" size={16} className="full-width">
                <Alert type="info" showIcon message="以下为最近仓库动态，仅展示公开信息。" />
                <Timeline items={project.updates.map((update) => ({ children: update }))} />
              </Space>
            ),
          },
          {
            key: 'media',
            label: '公开讨论',
            children: (
              <Space direction="vertical" size={12} className="full-width">
                <Alert type="info" showIcon message="仅展示公开平台讨论摘要，不包含私密聊天或封闭社群内容。" />
                {project.mediaRefs.length === 0 ? (
                  <Empty description="暂无公开讨论记录" />
                ) : (
                  project.mediaRefs.map((ref, idx) => (
                    <Card key={idx} size="small" title={<Tag color="blue">{ref.source}</Tag>}>
                      <Paragraph style={{ marginBottom: 0 }}>{ref.summary}</Paragraph>
                    </Card>
                  ))
                )}
              </Space>
            ),
          },
        ]}
      />
    </Space>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="page-header">
      <Title level={2}>{title}</Title>
      <Text type="secondary">{subtitle}</Text>
    </div>
  );
}

function GlobeCard() {
  return (
    <Card className="globe-card">
      <div className="home-globe-wrap">
        <RealGlobe height={320} width={380} />
      </div>
      <Divider />
      <Space wrap>
        <Tag color="green">Rising</Tag>
        <Tag color="blue">New</Tag>
        <Tag>Stable</Tag>
        <Tag color="orange">Declining</Tag>
      </Space>
    </Card>
  );
}

