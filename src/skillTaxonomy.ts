import type { SkillCatalogItem, SkillTrend } from './types';

type SkillLike = SkillCatalogItem | SkillTrend;
type FocusTrack = 'automation' | 'video';

export interface SkillCategoryGroup { id: string; label: string }
export interface SkillTaxonomyResult {
  groupId: string;
  groupLabel: string;
  subgroupId: string;
  subgroupLabel: string;
}
export interface SkillShowcase {
  kind: 'official-video' | 'official-showcase' | 'source-examples';
  title: string;
  description: string;
  url: string;
  sourceLabel: string;
}
export interface SkillExperience {
  taxonomy: SkillTaxonomyResult;
  focusTracks: FocusTrack[];
  inputLabel: string;
  outputs: string[];
  showcase: SkillShowcase;
}

export const SKILL_CATEGORY_GROUPS: SkillCategoryGroup[] = [
  { id: 'automation-agent', label: '自动化与 Agent' },
  { id: 'content-media', label: '内容与媒体' },
  { id: 'design-product', label: '设计与产品' },
  { id: 'development', label: '开发与工程' },
  { id: 'data-research', label: '数据与研究' },
  { id: 'business-operations', label: '商业与运营' },
  { id: 'platform-security', label: '平台与安全' },
  { id: 'general-services', label: '综合与行业服务' },
];

const groupLabels = new Map(SKILL_CATEGORY_GROUPS.map((group) => [group.id, group.label]));

function result(groupId: string, subgroupId: string, subgroupLabel: string): SkillTaxonomyResult {
  return { groupId, groupLabel: groupLabels.get(groupId) ?? groupId, subgroupId, subgroupLabel };
}
function textOf(skill: SkillLike) {
  return [skill.name, skill.source, skill.skillId ?? '', skill.category, skill.descriptionZh, ...skill.useCases]
    .join(' ')
    .toLocaleLowerCase();
}
function any(value: string, pattern: RegExp) { return pattern.test(value) }

export function classifySkill(skill: SkillLike): SkillTaxonomyResult {
  const text = textOf(skill);
  const category = skill.category.toLocaleLowerCase();

  if (any(text, /video|remotion|hyperframes|视频|剪辑|字幕|caption|talking.head|screen.recording|motion.graphics/)) {
    return any(text, /text.to.video|image.to.video|video.generation|seedance|kling|wan[ -]?2|avatar.video|文生视频|图生视频|视频生成|换脸|lipsync/)
      ? result('content-media', 'video-generation-style', '视频生成与风格')
      : result('content-media', 'video-editing-motion', '视频剪辑与动效');
  }
  if (any(category, /浏览器自动化|桌面自动化|社交平台自动化|信息监测/) || any(text, /browser.automation|playwright|browser.use|agent.browser|computer.use|网页自动化|桌面自动化/)) {
    return result('automation-agent', 'browser-desktop-automation', '浏览器与桌面自动化');
  }
  if (any(category, /skill 管理/) || any(text, /skill.creator|writing.skills|find.skills|skill.forge|skill 管理|创建 skill/)) {
    return result('automation-agent', 'skill-building-management', 'Skill 构建与管理');
  }
  if (any(category, /agent|工作流诊断|上下文与记忆|上下文与知识/) || any(text, /multi.agent|subagent|orchestration|agent.workflow|handoff|agent 编排|工作流/)) {
    return result('automation-agent', 'agent-orchestration-workflows', 'Agent 编排与工作流');
  }
  if (any(text, /automation|automate|自动化|定时任务|workflow/) || any(category, /办公与效率|会议与协作/)) {
    return result('automation-agent', 'business-process-automation', '业务流程自动化');
  }

  if (any(category, /音频|语音|音乐/) || any(text, /audio|voice|speech|music|whisper|tts|音频|语音|音乐/)) {
    return result('content-media', 'audio-voice', '音频与语音');
  }
  if (any(text, /image|photo|illustration|thumbnail|inpainting|controlnet|flux|图像|图片|视觉生成/)) {
    return result('content-media', 'image-generation-editing', '图像生成与编辑');
  }
  if (any(category, /内容|写作|沟通与表达/) || any(text, /copywriting|writing|article|文案|写作|内容创作/)) {
    return result('content-media', 'writing-content', '内容写作与传播');
  }

  if (any(category, /品牌|视觉设计|设计系统/) || any(text, /brand|brandkit|品牌|视觉规范/)) {
    return result('design-product', 'brand-visual', '品牌与视觉');
  }
  if (any(category, /设计与前端|设计系统|flutter/) || any(text, /ui|ux|frontend|design.system|react|figma|界面|前端设计/)) {
    return result('design-product', 'ui-ux-frontend', 'UI/UX 与前端设计');
  }
  if (any(category, /产品|项目管理|决策与规划/) || any(text, /product.manager|product.spec|project.management|产品需求|项目管理/)) {
    return result('design-product', 'product-project', '产品与项目');
  }
  if (any(category, /演示文稿|沟通与可访问性/) || any(text, /presentation|slides|演示文稿|汇报/)) {
    return result('design-product', 'presentation-communication', '演示与沟通');
  }
  if (any(category, /3d|游戏设计/) || any(text, /three.js|3d|game design|三维|游戏体验/)) {
    return result('design-product', '3d-experience', '3D 与交互体验');
  }

  if (any(category, /测试|质量|代码审查|性能测试/) || any(text, /testing|testability|code.review|debug|测试|审查|调试/)) {
    return result('development', 'testing-quality', '测试与代码质量');
  }
  if (any(category, /数据库|后端|api|数据平台/) || any(text, /database|backend|api|sql|orm|数据库|后端/)) {
    return result('development', 'backend-database', '后端、API 与数据库');
  }
  if (any(category, /移动|游戏开发/) || any(text, /flutter|ios|android|unity|godot|移动开发|游戏开发/)) {
    return result('development', 'mobile-game-development', '移动与游戏开发');
  }
  if (any(category, /开发|工程|架构|代码执行|开发工具/) || any(text, /coding|developer|architecture|programming|开发|编程|架构/)) {
    return result('development', 'software-engineering', '软件开发与架构');
  }

  if (any(category, /搜索|信息检索|信息监测|网页搜索/) || any(text, /web.search|scrape|crawl|research.search|搜索|采集|抓取/)) {
    return result('data-research', 'search-collection', '搜索与信息采集');
  }
  if (any(category, /学术|研究与决策|市场与竞争研究|研究工程/) || any(text, /academic|paper|literature|market.research|论文|学术|行业研究/)) {
    return result('data-research', 'academic-market-research', '学术与市场研究');
  }
  if (any(category, /文档|知识/) || any(text, /document|knowledge|pdf|markdown|文档|知识库/)) {
    return result('data-research', 'documents-knowledge', '文档与知识');
  }
  if (any(category, /数据|研究|统计|可视化/) || any(text, /analytics|dataset|visualization|data.analysis|数据分析|可视化/)) {
    return result('data-research', 'data-analysis', '数据分析与研究');
  }

  if (any(category, /营销|增长|seo|实验与增长|社交内容/) || any(text, /marketing|growth|seo|campaign|营销|增长/)) {
    return result('business-operations', 'marketing-growth', '营销与增长');
  }
  if (any(category, /电商|销售|crm|商品研究/) || any(text, /ecommerce|sales|crm|commerce|电商|销售|商品/)) {
    return result('business-operations', 'commerce-sales', '电商与销售');
  }
  if (any(category, /金融|交易研究|支付与商业/) || any(text, /finance|trading|market.data|金融|交易|行情/)) {
    return result('business-operations', 'finance-trading', '金融与交易');
  }
  if (any(category, /办公|会议|协作|沟通/) || any(text, /office|calendar|gmail|notion|trello|办公|协作/)) {
    return result('business-operations', 'office-collaboration', '办公与协作');
  }

  if (any(category, /安全|身份|密钥|合规/) || any(text, /security|identity|auth|encryption|安全|身份|加密/)) {
    return result('platform-security', 'security-identity', '安全、身份与合规');
  }
  if (any(category, /可观测|性能/) || any(text, /observability|telemetry|monitoring|performance|可观测|性能/)) {
    return result('platform-security', 'performance-observability', '性能与可观测性');
  }
  if (any(category, /云平台|运维|发布|事故响应/) || any(text, /cloud|devops|deploy|kubernetes|docker|云平台|运维|部署/)) {
    return result('platform-security', 'cloud-devops', '云平台与运维');
  }
  if (any(category, /支付|区块链|通信与消息/) || any(text, /payment|billing|blockchain|支付|区块链/)) {
    return result('platform-security', 'platform-infrastructure', '平台基础设施');
  }

  if (any(category, /生活|旅行|智能家居|职业发展/) || any(text, /travel|weather|home|生活|旅行|家居/)) {
    return result('general-services', 'life-industry-services', '生活与行业服务');
  }
  return result('general-services', 'general-capabilities', '通用能力');
}

function curatedShowcase(skill: SkillLike): SkillShowcase | null {
  const id = skill.id.toLocaleLowerCase();
  if (id === 'heygen-com/hyperframes/pr-to-video') return {
    kind: 'official-video',
    title: '查看 PR-to-video 官方说明',
    description: '查看 skills.sh 公开的能力说明和来源，了解 PR 转视频的使用场景。',
    url: 'https://skills.sh/heygen-com/hyperframes/pr-to-video',
    sourceLabel: 'HyperFrames 公开来源',
  };
  if (id.startsWith('heygen-com/hyperframes/')) return {
    kind: 'official-video',
    title: '查看 HyperFrames 来源仓库',
    description: '查看来源仓库中的公开说明、制作流程和示例。',
    url: 'https://github.com/heygen-com/hyperframes',
    sourceLabel: 'HyperFrames 公开来源',
  };
  if (id === 'browser-use/video-use/video-use') return {
    kind: 'official-video',
    title: '查看 video-use 公开说明',
    description: '查看 skills.sh 的视频编辑能力说明与来源仓库。',
    url: 'https://skills.sh/browser-use/video-use/video-use',
    sourceLabel: 'Browser Use 公开来源',
  };
  if (id === 'browser-use/browser-use/browser-use') return {
    kind: 'official-video',
    title: '观看 Browser Use CLI 官方演示',
    description: '官方发布页包含浏览器自动化操作视频和对应安装方式。',
    url: 'https://github.com/browser-use/browser-use/releases/tag/0.12.3',
    sourceLabel: 'Browser Use 官方发布页',
  };
  if (id.startsWith('remotion-dev/skills/')) return {
    kind: 'official-showcase',
    title: '查看 Remotion Skill 来源仓库',
    description: '查看程序化视频相关 Skill 的公开说明、维护记录和适用范围。',
    url: 'https://github.com/remotion-dev/skills',
    sourceLabel: 'Remotion 官方仓库',
  };
  if (id === 'vercel-labs/agent-browser/agent-browser') return {
    kind: 'official-showcase',
    title: '查看 agent-browser 官方演示与示例',
    description: '官方仓库提供命令示例、可观察面板和可部署的浏览器自动化案例。',
    url: 'https://github.com/vercel-labs/agent-browser#readme',
    sourceLabel: 'Vercel Labs 官方仓库',
  };
  return null;
}

function fallbackShowcase(skill: SkillLike): SkillShowcase {
  const sourceUrl = skill.installUrl?.startsWith('https://') ? skill.installUrl : skill.url;
  const hasRepository = Boolean(skill.installUrl?.startsWith('https://github.com/'));
  return {
    kind: hasRepository ? 'source-examples' : 'official-showcase',
    title: hasRepository ? '查看来源仓库中的示例与素材' : '查看来源页的能力示例',
    description: hasRepository
      ? '优先检查 README、examples、assets 与 release，确认该 Skill 的真实输出和使用边界。'
      : '打开来源页查看发布方提供的完整说明、示例和最新状态。',
    url: sourceUrl,
    sourceLabel: hasRepository ? 'GitHub 来源仓库' : '公开来源页',
  };
}

function inputLabelFor(taxonomy: SkillTaxonomyResult) {
  if (taxonomy.subgroupId.startsWith('video-')) return '脚本、原始视频、音频或风格要求';
  if (taxonomy.subgroupId === 'browser-desktop-automation') return '目标网页或桌面应用，以及要完成的操作';
  if (taxonomy.groupId === 'automation-agent') return '任务目标、工具权限与流程约束';
  if (taxonomy.subgroupId === 'image-generation-editing') return '图片、参考素材或视觉提示';
  if (taxonomy.groupId === 'data-research') return '研究问题、数据或待分析的资料';
  if (taxonomy.groupId === 'development') return '代码、需求、错误信息或工程环境';
  return '任务目标、上下文与必要素材';
}

export function getSkillExperience(skill: SkillLike): SkillExperience {
  const taxonomy = classifySkill(skill);
  const focusTracks: FocusTrack[] = [];
  if (taxonomy.groupId === 'automation-agent') focusTracks.push('automation');
  if (taxonomy.subgroupId.startsWith('video-')) focusTracks.push('video');
  return {
    taxonomy,
    focusTracks,
    inputLabel: inputLabelFor(taxonomy),
    outputs: skill.useCases.filter(Boolean).slice(0, 4),
    showcase: curatedShowcase(skill) ?? fallbackShowcase(skill),
  };
}
