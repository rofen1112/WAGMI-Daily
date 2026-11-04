import { useMemo, useState } from 'react';
import { projectStatusLabel, type LabBaseline, type LabProject } from './api';
import SceneThumbnail from './SceneThumbnail';
import StudioIcon from './StudioIcon';

export function sortGalleryProjects(projects: LabProject[], query: string, order: string) {
  const search = query.trim().toLocaleLowerCase();
  return projects.filter((project) => !search || (project.title || '').toLocaleLowerCase().includes(search)).slice().sort((a, b) => order === 'title' ? (a.title || '').localeCompare(b.title || '', 'zh-CN') : (Date.parse(b.updatedAt || '') || 0) - (Date.parse(a.updatedAt || '') || 0));
}

function editedAt(value: string | undefined) {
  const time = value ? new Date(value) : null;
  return time && Number.isFinite(time.getTime()) ? time.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '更新时间未记录';
}

function CubeMark() {
  return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="m24 8 14 8v16l-14 8-14-8V16l14-8Z"/><path d="m10 16 14 8 14-8M24 24v16"/></svg>;
}

export default function ProjectsGallery({ projects, baselines, loading, busy, error, onOpen, onNew, onBaseline, onRetry }: {
  projects: LabProject[]; baselines: LabBaseline[]; loading: boolean; busy: boolean; error: string;
  onOpen: (project: LabProject) => void; onNew: () => void; onBaseline: (baseline: LabBaseline) => void; onRetry: () => void;
}) {
  const [tab, setTab] = useState<'projects' | 'baselines'>('projects');
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState('recent');
  const visible = useMemo(() => sortGalleryProjects(projects, query, order), [projects, query, order]);
  const references = baselines.filter((baseline) => !query.trim() || baseline.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <section className="lab-gallery" aria-label="Floorplan-Editor 项目管理">
    <section className="lab-gallery-hero"><div className="lab-gallery-hero-copy"><h1>你的3D项目</h1><p>上传平面图，生成并持续编辑你的 3D 空间。<br/>保存空间方案，也可从历史参考开始。</p></div><div className="lab-gallery-hero-deck" aria-hidden="true"><span className="lab-gallery-floating-card card-back"><CubeMark/></span><span className="lab-gallery-floating-card card-middle"><CubeMark/></span><span className="lab-gallery-floating-card card-front"><CubeMark/></span></div></section>
    <div className="lab-gallery-toolbar"><div className="lab-gallery-tabs" role="tablist" aria-label="项目分类"><button type="button" role="tab" aria-selected={tab === 'projects'} onClick={() => setTab('projects')}>项目 <span>{projects.length}</span></button><button type="button" role="tab" aria-selected={tab === 'baselines'} onClick={() => setTab('baselines')}>参考案例 <span>{baselines.length}</span></button></div><div className="lab-gallery-filters"><label className="lab-gallery-search"><StudioIcon name="search" size={16}/><input aria-label="搜索3D项目" value={query} placeholder={tab === 'projects' ? '搜索项目名称' : '搜索参考案例'} onChange={(event) => setQuery(event.target.value)}/></label>{tab === 'projects' && <select aria-label="项目排序" value={order} onChange={(event) => setOrder(event.target.value)}><option value="recent">最近编辑</option><option value="title">项目名称</option></select>}<button className="lab-gallery-new-button" type="button" aria-label="新建项目" disabled={busy} onClick={onNew}><StudioIcon name="plus" size={14}/>新建项目</button></div></div>
    {error && <div className="lab-alert lab-error" role="alert">{error} <button type="button" onClick={onRetry}>重新读取</button></div>}
    {tab === 'projects' ? <div className="lab-gallery-grid" role="tabpanel" aria-label="项目">
      <button className="lab-new-card" type="button" disabled={busy} onClick={onNew}><span className="lab-new-card-preview"><span><StudioIcon name="plus" size={25}/></span></span><div className="lab-project-card-body"><strong>新建3D项目</strong><small>上传平面图，开始构建空间</small></div></button>
      {visible.map((project) => <button className="lab-project-card" type="button" key={project.id} onClick={() => onOpen(project)} disabled={busy} aria-label={'打开项目 ' + (project.title || '未命名空间')}><div className="lab-project-card-preview"><SceneThumbnail project={project}/><span className={'lab-card-status ' + (project.latestJob?.status || (project.sceneVersion > 0 ? 'succeeded' : 'new'))}><i/>{projectStatusLabel(project)}</span></div><div className="lab-project-card-body"><h2>{project.title || '未命名空间'}</h2><div className="lab-project-card-foot"><span>{editedAt(project.updatedAt)}</span></div></div></button>)}
      {loading && <p className="lab-gallery-empty" role="status">正在读取你的项目…</p>}{!loading && query.trim() && visible.length === 0 && <p className="lab-gallery-empty">没有找到匹配的项目</p>}
    </div> : <><p className="lab-gallery-reference-note">已整理的历史参考，载入后会创建独立项目，不代表本次 AI 生成。</p><div className="lab-baseline-grid" role="tabpanel" aria-label="参考案例">{references.map((baseline, index) => <button className="lab-baseline-card" type="button" key={baseline.id} onClick={() => onBaseline(baseline)} disabled={busy}><span className="lab-baseline-preview"><StudioIcon name="plan" size={42}/><small>REFERENCE {String(index + 1).padStart(2, '0')}</small></span><div><h2>{baseline.title}</h2><p>历史参考 · 可编辑方案</p><span>载入参考空间 <StudioIcon name="arrow" size={15}/></span></div></button>)}{!loading && references.length === 0 && <p className="lab-gallery-empty">没有匹配的参考案例</p>}</div></>}
  </section>;
}
