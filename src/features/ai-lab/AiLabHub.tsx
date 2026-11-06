import StudioIcon from './StudioIcon';
import arkLogo from './assets/ark-logo.png';
import './ai-lab-hub.css';

const applications = [{
  id: 'floorplan3d', name: 'Floorplan-Editor', category: '空间设计',
  description: '上传平面图，生成可编辑的 2D / 3D 空间，再通过对话与画布工具完善方案。',
}];

function PlanPreview() {
  return <svg viewBox="0 0 400 210" fill="none" aria-hidden="true">
    <path d="M83 34h233v142H83zM83 98h105V34M188 98v78M188 122h128M253 34v88" stroke="currentColor" strokeWidth="3"/>
    <path d="M111 98h28M188 140v22M217 122h24M253 59v28" stroke="#f2f3f4" strokeWidth="6"/>
    <path d="M111 98V73a25 25 0 0 1 25 25M188 140h23a23 23 0 0 1-23 23M217 122V99a23 23 0 0 1 23 23M253 59h25a25 25 0 0 1-25 25" stroke="currentColor" strokeWidth="1.2" opacity=".5"/>
    <rect x="102" y="48" width="63" height="28" rx="2" stroke="currentColor" opacity=".4"/><rect x="268" y="135" width="36" height="26" rx="2" stroke="currentColor" opacity=".4"/>
    <path d="M97 150h60M97 155h60M97 160h60M97 165h60M212 48h21v46h-21z" stroke="currentColor" opacity=".3"/>
    <path d="M84 194h232M83 189v10M316 189v10" stroke="currentColor" opacity=".3"/>
  </svg>;
}

export default function AiLabHub() {
  return <section className="lab-hub" aria-label="AI 实验室应用目录">
    <div className="lab-hub-heading">
      <div><span className="lab-hub-eyebrow">ARK.INSIGHT / EXPERIMENTS</span><h1>AI 实验室</h1><p>选择一个应用，开始新的项目。</p></div>
      <span className="lab-hub-count">{applications.length} 个应用</span>
    </div>
    <div className="lab-hub-section"><h2>全部应用</h2><span>从想法到工作空间</span></div>
    <div className="lab-hub-grid">
      {applications.map((app) => <a className="lab-app-card" href={`#/ai-lab?tool=${app.id}`} key={app.id} aria-label={`打开 ${app.name} · 3D 平面图`}>
        <div className="lab-app-preview"><PlanPreview/><span><StudioIcon name="plan" size={14}/>2D / 3D</span></div>
        <div className="lab-app-content"><div className="lab-app-identity"><img src={arkLogo} alt=""/><div><span>{app.category}</span><h3>{app.name}</h3></div><StudioIcon name="arrow" size={21}/></div><p>{app.description}</p><div className="lab-app-capabilities"><span>平面图重建</span><span>尺寸校准</span><span>空间编辑</span></div></div>
      </a>)}
    </div>
  </section>;
}
