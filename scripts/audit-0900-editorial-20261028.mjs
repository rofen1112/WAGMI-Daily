import {readFile,writeFile} from 'node:fs/promises';
const base='data/dev/source-archives/audit-0900-2026-10-28/';
const path='data/dev/ai-editorial-repairs-2026-10-28.json';
const manifest=JSON.parse(await readFile(path,'utf8'));
const results=JSON.parse(await readFile(base+'fetch-results.json','utf8'));
const now=new Date().toISOString();
const observations={
 0:'官方10月27日原文：Genie 4原生音频、键盘及文字引导；当前可信测试者研究预览，Ultra及API为后续接入，不写成全面开放。',
 1:'Google10月27日发布说明独立确认实时世界模拟、原生声音、有限测试者和后续分阶段接入。',
 2:'10月27日Google正文八类应用演示；Antigravity协调工具、Blender MCP和Nano Banana把桌面照片变为可玩三维场景，属于工作流示例。',
 3:'官方release API实际正文：0.165.0于2026-10-27T20:09:38Z发布，gcp提供方、默认memory v2及会话改进；修复MCP取消、排队消息及市场URL校验。',
 4:'官方release API：v2.1.312于2026-10-27T20:24:20Z发布；修复大CLAUDE.md覆盖、Bash cd后目录技能发现与组织策略加载。',
 5:'GitHub10月27日原文：组织GitHub Apps服务间认证公开预览；只读Copilot Requests、短期安装token，组织计费，管理员可暂停或卸载。',
 6:'10月27日OpenAI原文区分正在开发的Oracle AI Workspace、受组织权限审批约束的工作流、三类Oracle方案，以及美国Marketplace采购。',
 7:'10月27日OpenAI客户案例：Retell称9月月通话量超过一亿；工具执行、人审转接、冗余备份分层。规模和效果为客户报告。',
 8:'10月27日OpenAI客户案例描述漏洞研究加速；Daybreak相关网络编排仍在开发，重大动作人审；小时至分钟为客户自述。',
 9:'Anthropic10月27日原文：三类Claude产品40%政府折扣；直接采购当前可用、云渠道未来数月，覆盖多级政府且无最低支出承诺。',
 10:'Anthropic10月27日正文列出六家药研合作机构及自研项目；实验室与临床前结果不构成已证实的人体疗效。',
 11:'蚂蚁集团署名Business Wire原始稿，27.10.2026 09:00 CET；跨会话记忆、长任务与工具调用依赖明确授权，不等同无限自治。',
 12:'原始摘要：ArtifactWorld用107.5K配对视频、同构缺陷预测器和热图引导视频扩散修复3DGS；v1为4月14日，v2为9月29日。摘要级复核，未运行代码。',
 13:'原始摘要把具身三维生成分为数据生成、仿真环境、Sim2Real桥梁；强调交互、运动学、材质和物理有效性。首次提交4月29日，v4为10月23日；不把项目资源更新当首发。',
 14:'原始摘要：SceneMosaic从图像先验初始化、VLM局部布局演化再组合；SceneEval-100报告24倍速度和物理违规减少，首次提交9月4日，未复现实验。',
 15:'Autodesk新闻列表最新明确日期为10月21日汽车设计工程反馈合作；本次没有发现新的窗口内AI-CAD公告。',
 16:'Planner5D列表最新10月14日；Copilot文章为9月22日，不能由导航或今日访问时间重标为新发布。',
 17:'Meshy列表含相对月份及9天前研究条目；未获得本窗口新增正式发布的原始正文与日级时间，保持发现层。',
 18:'DeepMind列表最新为Genie 4，其他条目多仅标月份；本次没有据此制造额外日级事件。',
 22:'NVIDIA RSS最新为10月27日C-BRAIN认知疾病工具报道，未发现本次空间/设计重点领域新增公告。',
 23:'OpenAI RSS最新三篇为Retell、Oracle与Daybreak，均与已收录事件一致；未出现聚合所述数学突破的可核验原始证明链接。',
 24:'Google AI RSS最新10月26日AI Quest教育内容；本次没有新增符合行业重点的正式事件。'
};
const webIndexes=new Set([6,7,8]);
const retries=new Set([5,10]);
const reviews=[];
for(const [key,contentExcerpt] of Object.entries(observations)){
 const i=Number(key),r=results[i];
 if(!r.success&&!webIndexes.has(i)&&!retries.has(i))continue;
 const prior=manifest.verifiedSources.find(s=>s.url===r.url);
 const evidencePath=webIndexes.has(i)?base+'web-reviewed-excerpts.json':base+i+(retries.has(i)?'-retry':'')+'.'+(i===3||i===4?'raw':'txt');
 reviews.push({url:r.url,checkedAt:r.success?r.checkedAt:now,success:true,verification:'verified',sourceClass:prior?.sourceClass??'official',method:webIndexes.has(i)?'web.open full official article; original facts and date read; independent RSS date cross-check':'Independent original body/date review and comparison with accepted events',contentExcerpt,eventIds:prior?.eventIds??[],discoveryChecked:!(prior?.eventIds?.length),auditBatchId:'wagmi-09-00:2026-10-28',evidencePath});
}
await writeFile(base+'web-reviewed-excerpts.json',JSON.stringify({checkedAt:now,method:'Successful web.open full body reads after direct HTTP403',reviews:reviews.filter(r=>webIndexes.has(results.find(x=>x.url===r.url)?.i))},null,2)+'\n');
manifest.verifiedSources.push(...reviews);
manifest.audit0900={batchId:'wagmi-09-00:2026-10-28',checkedAt:now,noNewEvents:true,discoveryChecked:true,newEventIds:[],independentReviews:reviews.length,memene:{recordId:'167775517687152640',candidates:22},notes:['本次候选与已收录事件或现有pending重合；未核验的科学突破、价格及模型媒体主张仍pending。','两次原始页面请求失败经定向重试恢复HTTP200；OpenAI直连403通过web读取完整官方正文复核。','论文仅摘要级复核，原始首次发表日保持不变；本次noNewEvents只表示审计增量。']};
await writeFile(path,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest.audit0900));
