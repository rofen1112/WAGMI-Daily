import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const sourcePath = path.join(
  rootDir,
  "data/local-reports/html/fysiverse-3d-simready-2026-07-19.html",
);
const outputPath = path.join(
  rootDir,
  "data/local-reports/html/fysiverse-3d-industry-value-external-2026-07-21.html",
);

const replaceRange = (document, startMarker, endMarker, replacement) => {
  const start = document.indexOf(startMarker);
  if (start < 0) throw new Error(`Start marker not found: ${startMarker}`);
  const end = document.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`End marker not found: ${endMarker}`);
  return `${document.slice(0, start)}${replacement}\n\n${document.slice(end)}`;
};

const replaceSection = (document, id, replacement) => {
  const marker = `<section class="section" id="${id}">`;
  const start = document.indexOf(marker);
  if (start < 0) throw new Error(`Section not found: ${id}`);

  const nextSection = document.indexOf(
    '<section class="section" id="',
    start + marker.length,
  );
  const articleEnd = document.indexOf("</article>", start);
  const end = nextSection >= 0 && nextSection < articleEnd ? nextSection : articleEnd;
  if (end < 0) throw new Error(`Section end not found: ${id}`);

  return `${document.slice(0, start)}${replacement.trim()}\n\n        ${document.slice(end)}`;
};

const topbar = `  <header class="topbar">
    <div class="brand">
      <span class="brand-mark">F3</span>
      <div>
        <div class="brand-name">Fysiverse-3D</div>
        <div class="brand-sub">项目评价与行业价值</div>
      </div>
    </div>
    <div class="toolbar">
      <button class="action secondary" id="copy-summary" type="button">复制结论</button>
      <button class="action" id="print-report" type="button">打印 / 导出 PDF</button>
    </div>
  </header>`;

const hero = `    <section class="hero">
      <div class="hero-inner">
        <p class="eyebrow">Technical review · Industry outlook · 2026.07.21</p>
        <h1>从可视化场景，走向可计算世界</h1>
        <p class="hero-deck">基于公开仓库、依赖链路与本地书房案例，对 Fysiverse-3D 的技术本质、当前成熟度和长期行业价值进行独立评估，并从 3D 智能空间、世界模型与物理 AI 的视角判断其位置。</p>
        <div class="hero-meta">
          <span><strong>研究对象</strong><br>Fysiverse-3D SimReady</span>
          <span><strong>分析视角</strong><br>3D 智能空间 / 世界模型</span>
          <span><strong>证据范围</strong><br>官方资料 + 本地实测</span>
          <span><strong>报告性质</strong><br>外部交流版 / 独立判断</span>
        </div>
      </div>
    </section>`;

const verdict = `    <div class="verdict-band">
      <div class="verdict-inner">
        <div class="verdict-label">一句话判断</div>
        <div class="verdict-text">当前公开的 Fysiverse-3D 是一条值得跟踪的“场景编译”工程链路：它还不是完整世界模型或 Physical AI 系统，但已经把二维视觉输入推进为对象级、可编辑、可碰撞、可仿真的三维状态，为可计算空间提供了关键中间层。</div>
      </div>
    </div>`;

const toc = `        <nav class="toc">
          <p class="toc-title">目录</p>
          <a href="#executive">01 核心结论</a>
          <a href="#open-source">02 开源内容</a>
          <a href="#model-or-engineering">03 工程还是模型</a>
          <a href="#problems">04 真正解决的问题</a>
          <a href="#local-test">05 本地案例实测</a>
          <a href="#interior">06 室内设计价值</a>
          <a href="#physical-ai">07 Physical AI 定位</a>
          <a href="#ark">08 3D 智能空间</a>
          <a href="#data">09 世界模型位置</a>
          <a href="#collaboration">10 行业价值</a>
          <a href="#roadmap">11 项目演进路线</a>
          <a href="#risks">12 风险与边界</a>
          <a href="#decision">13 最终判断</a>
          <a href="#sources">资料来源</a>
          <p class="toc-note">证据分层：<br>官方事实 / 本地实测 / 行业推断 / 待验证。</p>
        </nav>`;

const executive = `        <section class="section" id="executive">
          <span class="section-number">01</span>
          <h2>先给结论：项目值得关注，价值不止于“单图生成 3D”</h2>
          <p class="section-lead">真正重要的能力，是把图片中的视觉对象编译成可分离、可查询、可碰撞、可重新放置的场景节点。它连接了视觉生成与空间计算，也暴露出从演示原型走向可靠基础设施仍需跨越的工程门槛。</p>

          <div class="evidence-legend" aria-label="证据类型">
            <span class="evidence official">官方事实</span>
            <span class="evidence tested">本地实测</span>
            <span class="evidence inference">行业推断</span>
            <span class="evidence open-question">待验证</span>
          </div>

          <div class="answer-grid">
            <div class="answer-card">
              <span class="index">Q1 · 技术本质</span>
              <h3>当前是高价值工程集成</h3>
              <p>开源仓库将分割、单物体 3D、单目几何、碰撞体、物理稳定和 Web 导出组织为一条完整链路。难点不在单个模型，而在跨模型坐标、尺度、资产和交互的一致性。<span class="evidence official">官方事实</span></p>
            </div>
            <div class="answer-card">
              <span class="index">Q2 · 项目评价</span>
              <h3>早期，但具备真实方向价值</h3>
              <p>项目已经展示端到端可运行性，却仍依赖多项第三方能力，公开版本也未证明大规模场景稳定性。适合进入持续跟踪与基准验证，不宜按成熟平台估值。<span class="evidence inference">行业推断</span></p>
            </div>
            <div class="answer-card">
              <span class="index">Q3 · 行业价值</span>
              <h3>让视觉资产进入计算链路</h3>
              <p>它把“只能观看的图片或模型”转换成可编辑对象、碰撞代理和物理状态，为设计验证、交互提案、仿真初始化和机器人训练提供共同入口。<span class="evidence tested">本地实测</span></p>
            </div>
            <div class="answer-card">
              <span class="index">Q4 · 长期位置</span>
              <h3>更像世界初始化器</h3>
              <p>它位于感知与仿真之间，负责建立第一版世界状态；但当前没有时序预测、任务规划、控制策略和现实反馈，因此不是完整世界模型，也不是 Physical AI 闭环。<span class="evidence inference">行业推断</span></p>
            </div>
          </div>

          <div class="callout success">
            <strong>最值得关注的命题</strong>
            Fysiverse-3D 的长期机会，不是与通用 3D 生成模型竞争“谁更像”，而是成为视觉世界进入设计、仿真和智能体系统之前的标准化场景编译层。
          </div>
        </section>`;

const interior = `        <section class="section" id="interior">
          <span class="section-number">06</span>
          <h2>对室内设计真正有效的帮助</h2>
          <p class="section-lead">这条链路不会替代效果图、CAD 或 BIM。它更适合放在概念图之后、精确深化之前，为方案增加对象级编辑、空间关系检查和轻量交互能力。</p>

          <div class="table-wrap">
            <table>
              <thead><tr><th>设计环节</th><th>可提供的价值</th><th>成熟度判断</th><th>仍需补齐</th></tr></thead>
              <tbody>
                <tr><td><strong>概念方案拆解</strong></td><td>把参考图中的主要家具、陈设和空间关系转换为独立 3D 对象</td><td class="yes">可做原型</td><td>遮挡物、透明材质和小物体召回</td></tr>
                <tr><td><strong>快速三维提案</strong></td><td>导出 GLB / Web 场景，支持旋转、选择、拖动和方案沟通</td><td class="yes">展示价值高</td><td>模型减面、材质一致性和加载性能</td></tr>
                <tr><td><strong>空间问题预检</strong></td><td>发现明显穿透、悬浮、倾倒和支撑异常</td><td class="partial">适合辅助判断</td><td>真实尺寸、质量、摩擦、重心和连接关系</td></tr>
                <tr><td><strong>真实商品替换</strong></td><td>用带规格的 SKU 替换生成对象，形成可采购、可追踪资产</td><td class="partial">方向成立</td><td>商品库、尺寸映射、版本和授权</td></tr>
                <tr><td><strong>施工与安全交付</strong></td><td>当前不能直接输出施工级结论</td><td class="no">不可替代专业流程</td><td>测量、构造、机电、规范与人工签核</td></tr>
              </tbody>
            </table>
          </div>

          <div class="callout">
            <strong>正确的产品位置</strong>
            它应当被理解为“设计意图的空间编译与预检层”。对用户隐藏底层模型和物理工具，只呈现问题对象、原因、置信度、修正建议与可交互结果，才能真正进入设计工作流。
          </div>
        </section>`;

const physicalAi = `        <section class="section" id="physical-ai">
          <span class="section-number">07</span>
          <h2>它算得上 Physical AI 吗</h2>
          <p class="section-lead">更准确的说法是：它已经具备 Physical AI 的场景初始化入口，但尚未形成从感知、预测、规划、控制到真实反馈的完整闭环。</p>

          <div class="answer-grid">
            <div class="answer-card"><span class="index">01 · 感知</span><h3>已覆盖</h3><p>从 RGB 图像识别对象、掩码、深度、法线与相机几何，形成场景初始观察。<span class="evidence official">官方事实</span></p></div>
            <div class="answer-card"><span class="index">02 · 世界状态</span><h3>部分覆盖</h3><p>生成对象网格、姿态、碰撞体和场景图，使环境从像素变成可查询状态。<span class="evidence tested">本地实测</span></p></div>
            <div class="answer-card"><span class="index">03 · 物理仿真</span><h3>基础覆盖</h3><p>可进行重力沉降与碰撞测试，但默认物理参数不等于真实产品参数。<span class="evidence tested">本地实测</span></p></div>
            <div class="answer-card"><span class="index">04 · 行动闭环</span><h3>尚未覆盖</h3><p>缺少任务规划、控制策略、真实执行器、传感反馈和 sim-to-real 评估。<span class="evidence open-question">待验证</span></p></div>
          </div>

          <div class="callout warning">
            <strong>概念边界</strong>
            “场景可以在物理引擎中运行”不等于“系统理解物理世界”。只有当场景状态能够支持任务预测、动作选择、真实执行与结果回流时，才构成更完整的 Physical AI 系统。
          </div>
        </section>`;

const intelligentSpace = `        <section class="section" id="ark">
          <span class="section-number">08</span>
          <h2>从 3D 智能空间看：从还原外观到表达状态</h2>
          <p class="section-lead">传统 3D 资产主要描述几何与材质；智能空间还需要对象身份、空间关系、可交互能力、物理属性、规则约束与持续更新。Fysiverse-3D 的意义在于向这种“状态化空间”迈出第一步。</p>

          <div class="pipeline" aria-label="3D 智能空间演进路径">
            <div class="pipe-step"><small>01</small><strong>视觉输入</strong><span>照片 / 效果图 / 视频</span></div>
            <div class="pipe-step"><small>02</small><strong>对象资产</strong><span>网格 / 材质 / 身份</span></div>
            <div class="pipe-step"><small>03</small><strong>空间状态</strong><span>姿态 / 支撑 / 邻接</span></div>
            <div class="pipe-step"><small>04</small><strong>物理属性</strong><span>碰撞 / 质量 / 稳定</span></div>
            <div class="pipe-step"><small>05</small><strong>任务语义</strong><span>可达 / 可操作 / 规则</span></div>
            <div class="pipe-step"><small>06</small><strong>持续更新</strong><span>传感 / 行为 / 反馈</span></div>
          </div>

          <div class="split">
            <div class="panel">
              <span class="kicker">当前公开能力</span>
              <h3>建立对象化、可碰撞的第一版空间</h3>
              <p>项目已经覆盖对象拆分、单体重建、相对放置、碰撞代理、重力稳定和 Web 交互，适合生成智能空间的初始快照。</p>
            </div>
            <div class="panel dark">
              <span class="kicker">下一阶段能力</span>
              <h3>把静态快照升级为可维护状态</h3>
              <p>需要增加真实尺度、语义本体、商品与构件身份、事件日志、版本差异，以及来自扫描、传感器或用户操作的持续校正。</p>
            </div>
          </div>
        </section>`;

const worldModel = `        <section class="section" id="data">
          <span class="section-number">09</span>
          <h2>从世界模型看：它是世界初始化器，不是预测模型</h2>
          <p class="section-lead">世界模型不仅要表示当前环境，还要学习状态如何随动作和时间变化。Fysiverse-3D 当前的优势是快速构建初始世界状态，未来价值取决于能否与时序数据、任务和现实反馈连接。</p>

          <div class="table-wrap">
            <table>
              <thead><tr><th>世界模型能力</th><th>当前公开表现</th><th>判断</th><th>下一步证据</th></tr></thead>
              <tbody>
                <tr><td><strong>空间表征</strong></td><td>对象网格、相对姿态、场景包</td><td class="yes">已经形成入口</td><td>多视图一致性与尺度基准</td></tr>
                <tr><td><strong>对象与关系</strong></td><td>对象独立、碰撞和基础场景关系</td><td class="partial">可继续扩展</td><td>统一语义本体和关系图</td></tr>
                <tr><td><strong>状态转移</strong></td><td>物理引擎可模拟局部运动</td><td class="partial">规则驱动为主</td><td>学习式动力学与长时预测</td></tr>
                <tr><td><strong>任务条件预测</strong></td><td>公开仓库未展示</td><td class="no">尚未证明</td><td>动作、目标、奖励与任务基准</td></tr>
                <tr><td><strong>现实反馈更新</strong></td><td>公开仓库未形成闭环</td><td class="no">关键缺口</td><td>传感器、执行日志和 sim-to-real 对照</td></tr>
              </tbody>
            </table>
          </div>

          <div class="callout success">
            <strong>长期战略位置</strong>
            如果它能稳定生成带语义、物理和版本信息的场景状态，就有机会成为世界模型的数据入口与初始化层：上游接收照片、视频或生成内容，下游服务仿真器、设计系统、机器人策略和空间智能体。
          </div>
        </section>`;

const industryValue = `        <section class="section" id="collaboration">
          <span class="section-number">10</span>
          <h2>这个项目在行业中的价值</h2>
          <p class="section-lead">3D 行业正在从“资产生成”转向“可计算场景”。真正稀缺的不是更多孤立网格，而是能够进入设计、仿真、训练和运营系统的结构化空间状态。</p>

          <div class="answer-grid">
            <div class="answer-card"><span class="index">VALUE 01</span><h3>降低场景初始化成本</h3><p>将照片快速转为对象级三维场景，为后续人工修正、规则检查和仿真提供起点，减少从零建模的成本。</p></div>
            <div class="answer-card"><span class="index">VALUE 02</span><h3>连接生成式 3D 与仿真</h3><p>为视觉模型的输出补充碰撞代理、稳定状态和场景结构，使“生成出来”进一步变成“可以运行和检查”。</p></div>
            <div class="answer-card"><span class="index">VALUE 03</span><h3>形成跨行业中间层</h3><p>同一场景表示可服务室内设计、数字孪生、游戏关卡、机器人训练、具身智能与空间运营。</p></div>
            <div class="answer-card"><span class="index">VALUE 04</span><h3>积累高价值修正数据</h3><p>每次人工调整对象、尺度、碰撞和物理参数，都会产生比单纯图片更有价值的场景对齐与失败样本。</p></div>
          </div>

          <div class="callout">
            <strong>潜在壁垒</strong>
            长期壁垒不会来自某一个第三方模型，而会来自跨模型稳定性、场景本体、物理参数治理、人工修正效率、行业基准以及持续积累的高质量场景状态数据。
          </div>
        </section>`;

const roadmap = `        <section class="section" id="roadmap">
          <span class="section-number">11</span>
          <h2>项目演进路线：从可运行，走向可验证、可扩展</h2>
          <p class="section-lead">建议用公开基准和真实场景逐层证明能力，不以单个演示视频替代产品成熟度。每一阶段都应有可以复测的质量、效率和开放性指标。</p>

          <div class="timeline">
            <div class="phase">
              <div class="phase-time">PHASE 1 · 基准化</div>
              <div><h3>建立场景级质量基准</h3><p>覆盖住宅、办公、商业、复杂遮挡和多材质场景，统一评估对象召回、几何质量、相对姿态、碰撞代理、稳定性与处理时延。</p></div>
              <div class="phase-gate"><strong>通过标准</strong>结果可重复；失败可分类；指标可与人工流程及其他开源链路直接比较。</div>
            </div>
            <div class="phase">
              <div class="phase-time">PHASE 2 · 输入扩展</div>
              <div><h3>从单图扩展到多图与视频</h3><p>利用多视角和时序约束减少不可见面猜测，提高尺度、结构和对象一致性，并保留来源与置信度。</p></div>
              <div class="phase-gate"><strong>通过标准</strong>多视图场景在几何一致性、人工修正时间和对象身份保持上显著优于单图。</div>
            </div>
            <div class="phase">
              <div class="phase-time">PHASE 3 · 标准化</div>
              <div><h3>建立语义、物理和资产标准</h3><p>支持 OpenUSD / GLB 等可迁移格式，定义对象身份、关系、材料、质量、摩擦、关节和版本元数据。</p></div>
              <div class="phase-gate"><strong>通过标准</strong>场景可被多个下游引擎读取；参数可追溯；资产替换后行为可验证。</div>
            </div>
            <div class="phase">
              <div class="phase-time">PHASE 4 · 任务证明</div>
              <div><h3>证明下游任务收益</h3><p>选择设计预检、交互提案、机器人操作或仿真训练中的明确任务，比较场景初始化前后的效率与成功率。</p></div>
              <div class="phase-gate"><strong>通过标准</strong>至少一个真实任务的时间、质量或成功率出现稳定、可归因的提升。</div>
            </div>
            <div class="phase">
              <div class="phase-time">PHASE 5 · 现实闭环</div>
              <div><h3>接入反馈并持续更新世界状态</h3><p>将扫描、传感器、用户修改或执行器结果回流到场景，形成状态更新、误差诊断和 sim-to-real 对照。</p></div>
              <div class="phase-gate"><strong>通过标准</strong>有真实反馈、有状态差异、有任务指标，不以概念演示替代闭环证据。</div>
            </div>
          </div>
        </section>`;

const risks = `        <section class="section" id="risks">
          <span class="section-number">12</span>
          <h2>必须明确的风险与边界</h2>
          <p class="section-lead">当前阶段最大的风险不是链路无法运行，而是把视觉合理误认为几何真实、把仿真稳定误认为现实可靠，或忽略第三方模型与数据的使用边界。</p>

          <div class="risk-grid">
            <div class="risk"><h3>单视图不确定性</h3><p>不可见面来自生成推断，不能当作测量事实。应保留置信度、来源和人工替换路径。</p></div>
            <div class="risk"><h3>尺度与物理参数</h3><p>单图缺少绝对尺度，默认质量、摩擦、重心和连接关系可能误导。工程判断前必须绑定真实来源。</p></div>
            <div class="risk"><h3>第三方许可证</h3><p>仓库 MIT 不等于模型权重和所有依赖可自由商用。每项模型、代码和数据都需要独立审查。</p></div>
            <div class="risk"><h3>数据与隐私</h3><p>室内照片、设计文件和场景资产可能包含隐私、版权及保密信息，需要脱敏、授权、分域和审计。</p></div>
            <div class="risk"><h3>质量责任</h3><p>物理检查应定位为辅助判断，保留版本、置信度与人工签核，不直接承担施工、安全或合规结论。</p></div>
            <div class="risk"><h3>技术锁定</h3><p>场景本体、资产格式和测试基准应尽量标准化，保留 GLB / OpenUSD 等可迁移输出与替代依赖。</p></div>
          </div>

          <div class="callout warning">
            <strong>评价底线</strong>
            所有关于“大规模稳定性”“自研模型优势”“工业级物理精度”和“完整 Physical AI 能力”的判断，都必须由论文、代码、基准或可复现实验支持。未公开部分只作为待验证路线，不作为当前能力。
          </div>
        </section>`;

const decision = `        <section class="section" id="decision">
          <span class="section-number">13</span>
          <h2>最终判断</h2>
          <p class="section-lead">Fysiverse-3D 目前是一项早期但方向明确的开源工程：它将视觉输入转换为对象化、可碰撞、可仿真的场景状态，已经展示出真实行业价值，但尚未证明大规模稳定性，也不应被描述为完整世界模型或 Physical AI 平台。</p>

          <div class="decision">
            <h3>建议持续跟踪，并把评价中心放在“场景编译质量”</h3>
            <p id="copy-target">Fysiverse-3D 的核心价值，是把二维视觉内容推进为可编辑、可碰撞、可仿真的三维世界状态。当前开源版本证明了端到端工程可行性，但仍需要在多视图一致性、真实尺度、物理参数、开放标准、大规模基准和现实反馈闭环上继续验证。长期看，它更有机会成为 3D 智能空间、世界模型和 Physical AI 系统的场景初始化与编译层，而不是独立完成全部智能闭环。</p>
            <div class="decision-grid">
              <div class="decision-item"><strong>现在可确认</strong><span>端到端链路、对象化场景、碰撞与交互原型</span></div>
              <div class="decision-item"><strong>下一步验证</strong><span>跨场景稳定性、多图视频、尺度与任务收益</span></div>
              <div class="decision-item"><strong>暂不下结论</strong><span>自研模型壁垒、工业级精度、完整智能闭环</span></div>
            </div>
          </div>
        </section>`;

const sources = `        <section class="section" id="sources">
          <span class="section-number">SOURCES</span>
          <h2>资料来源与方法说明</h2>
          <p class="section-lead">报告优先采用官方仓库、官方项目页、依赖项目与行业规范，并用本地书房案例验证公开链路是否能够端到端运行。公司愿景与媒体描述不替代可复现技术证据。</p>

          <ol class="source-list">
            <li><div><a href="https://github.com/Fysics-AI/Fysiverse-3D-SimReady" target="_blank" rel="noreferrer">Fysiverse-3D-SimReady 官方仓库</a><div class="source-note">开源子集、依赖、流程、导出格式、TODO 与 MIT 许可。</div></div><div class="source-type">Primary</div></li>
            <li><div><a href="https://fysics-ai.github.io/Fysiverse-3D-project-page/" target="_blank" rel="noreferrer">Fysiverse-3D 官方项目页</a><div class="source-note">项目定位、开发状态和浏览器演示说明。</div></div><div class="source-type">Primary</div></li>
            <li><div><a href="https://github.com/facebookresearch/sam-3d-objects" target="_blank" rel="noreferrer">Meta SAM 3D Objects</a><div class="source-note">单图对象 3D 重建基础模型能力与独立许可证。</div></div><div class="source-type">Primary</div></li>
            <li><div><a href="https://github.com/microsoft/MoGe" target="_blank" rel="noreferrer">Microsoft MoGe</a><div class="source-note">单目几何、深度、法线、点图与视场估计。</div></div><div class="source-type">Primary</div></li>
            <li><div><a href="https://github.com/IDEA-Research/Grounded-SAM-2" target="_blank" rel="noreferrer">Grounded-SAM-2</a><div class="source-note">开放词汇检测与图像分割依赖。</div></div><div class="source-type">Primary</div></li>
            <li><div><a href="https://github.com/SarahWeiii/CoACD" target="_blank" rel="noreferrer">CoACD</a><div class="source-note">碰撞网格凸分解工具。</div></div><div class="source-type">Primary</div></li>
            <li><div><a href="https://sapien.ucsd.edu/" target="_blank" rel="noreferrer">SAPIEN</a><div class="source-note">机器人与物理仿真平台，本地稳定性测试使用。</div></div><div class="source-type">Primary</div></li>
            <li><div><a href="https://docs.omniverse.nvidia.com/simready/latest/overview/simready-spec.html" target="_blank" rel="noreferrer">NVIDIA SimReady Specification</a><div class="source-note">仿真资产的物理、语义、传感器与质量元数据要求。</div></div><div class="source-type">Standard</div></li>
            <li><div><a href="https://openusd.org/release/index.html" target="_blank" rel="noreferrer">OpenUSD Documentation</a><div class="source-note">可组合、可扩展三维场景描述与资产交换基础。</div></div><div class="source-type">Standard</div></li>
            <li><div><strong>本地书房案例测试产物</strong><div class="source-note">对象分割、SAM 3D、MoGe、CoACD、SAPIEN、GLB 回读和浏览器鼠标碰撞；指标与图片完整保留在本报告第五章。</div></div><div class="source-type">Local Test</div></li>
          </ol>

          <h3>方法与限制</h3>
          <p>本报告是独立技术与行业分析，不构成法律、投资、施工、安全或合规意见。对未公开的自研模型、物理引擎、商业转化和未来产品能力只给出条件式判断；任何面向真实业务的质量结论，都应通过代表性数据集和下游任务重新验证。</p>
        </section>`;

const footer = `  <footer class="footnote">
    <strong>Fysiverse-3D 项目评价与行业价值分析</strong><br>
    版本 2.1 · 2026-07-21 · 外部交流 HTML 版。报告保留本地案例图片与测试指标，用于说明公开链路的可运行性；原始室内照片与测试产物的使用仍应遵守其授权范围。
  </footer>`;

let html = fs.readFileSync(sourcePath, "utf8");

html = html.replace(
  /<meta name="description" content="[^"]*">/,
  '<meta name="description" content="Fysiverse-3D 项目评价、行业价值及其在 3D 智能空间、世界模型与物理 AI 中的长期位置。">',
);
html = html.replace(
  /<title>[^<]*<\/title>/,
  "<title>Fysiverse-3D｜项目评价与行业价值</title>",
);
html = replaceRange(html, '  <header class="topbar">', "  <main>", topbar);
html = replaceRange(html, '    <section class="hero">', '    <div class="verdict-band">', hero);
html = replaceRange(html, '    <div class="verdict-band">', '    <div class="layout">', verdict);
html = replaceRange(html, '        <nav class="toc">', "        </nav>", `${toc.slice(0, -6)}`);

html = replaceSection(html, "executive", executive);
html = replaceSection(html, "interior", interior);
html = replaceSection(html, "physical-ai", physicalAi);
html = replaceSection(html, "ark", intelligentSpace);
html = replaceSection(html, "data", worldModel);
html = replaceSection(html, "collaboration", industryValue);
html = replaceSection(html, "roadmap", roadmap);
html = replaceSection(html, "risks", risks);
html = replaceSection(html, "decision", decision);
html = replaceSection(html, "sources", sources);
html = replaceRange(html, '  <footer class="footnote">', "  <script>", footer);

const forbiddenTerms = ["暗壳", "Ark.art", "ark.art", "矩阵股份", "双方合作", "合作路线"];
const leakedTerms = forbiddenTerms.filter((term) => html.includes(term));
if (leakedTerms.length > 0) {
  throw new Error(`External report contains forbidden terms: ${leakedTerms.join(", ")}`);
}

for (const required of [
  "本地实测：一张书房照片走完整条链路",
  "data:image/jpeg;base64,",
  "copy-summary",
  "print-report",
  "reading-progress",
]) {
  if (!html.includes(required)) throw new Error(`Required report element missing: ${required}`);
}

fs.writeFileSync(outputPath, html, "utf8");
console.log(`Built ${path.relative(rootDir, outputPath)} (${Buffer.byteLength(html)} bytes)`);
