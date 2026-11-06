import { useEffect, useRef, useState } from 'react';
import { projectPath, request, type LabProject, type LabScene } from './api';
import StudioIcon from './StudioIcon';

type Rectangle = { x: number; y: number; w: number; h: number };
export interface ThumbnailGeometry { viewBox: string; rooms: string[]; features: string[]; walls: Rectangle[]; windows: Rectangle[]; furniture: Array<{ cx: number; cy: number; w: number; d: number; rot: number }>; source?: string }
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 1e9;
const records = (value: unknown, limit: number) => Array.isArray(value) ? value.slice(0, limit).filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object' && !Array.isArray(item))) : [];

export function thumbnailGeometry(value: Pick<LabScene, 'scene' | 'state'> & { source?: string }): ThumbnailGeometry | null {
  const scene = value.scene;
  if (!scene || typeof scene !== 'object') return null;
  const coordinates: Array<[number, number]> = [];
  const polygon = (value: unknown) => {
    if (!Array.isArray(value) || value.length < 3 || value.length > 1000 || !value.every((point) => Array.isArray(point) && point.length === 2 && point.every(number))) return '';
    const points = value as Array<[number, number]>;
    if (coordinates.length + points.length > 12000) return '';
    coordinates.push(...points);
    return points.map((point) => point.join(',')).join(' ');
  };
  const rooms = records(scene.rooms, 300).map((room) => polygon(room.poly)).filter(Boolean);
  const features = ['polygonWalls', 'columns', 'steps'].flatMap((key) => records(scene[key], 300).map((item) => polygon(item.poly)).filter(Boolean));
  const rectangles = (value: unknown, demolished = new Set<string>()) => Array.isArray(value) ? value.slice(0, 1500).flatMap((item, index) => {
    if (demolished.has(`w${index}`) || !Array.isArray(item) || item.length < 4 || !item.slice(0, 4).every(number) || item[2] <= item[0] || item[3] <= item[1]) return [];
    coordinates.push([item[0], item[1]], [item[2], item[3]]);
    return [{ x: item[0], y: item[1], w: item[2] - item[0], h: item[3] - item[1] }];
  }) : [];
  const demolished = new Set(Array.isArray(value.state?.demolished) ? value.state.demolished.filter((id): id is string => typeof id === 'string') : []);
  const walls = rectangles(scene.walls, demolished);
  const windows = rectangles(scene.windows);
  const furniture = records(value.state?.furniture ?? scene.furniture, 500).flatMap((item) => {
    if (![item.cx, item.cy, item.w, item.d].every(number) || (item.w as number) <= 0 || (item.d as number) <= 0) return [];
    const { cx, cy, w, d } = item as { cx: number; cy: number; w: number; d: number };
    const radius = Math.hypot(w, d) / 2;
    coordinates.push([cx - radius, cy - radius], [cx + radius, cy + radius]);
    return [{ cx, cy, w, d, rot: number(item.rot) ? item.rot : 0 }];
  });
  if (coordinates.length === 0) return null;
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const [x, y] of coordinates) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
  const width = right - left, height = bottom - top;
  if (!number(width) || !number(height) || width <= 0 || height <= 0) return null;
  const pad = Math.max(width, height) * .08;
  return { viewBox: [left - pad, top - pad, width + pad * 2, height + pad * 2].join(' '), rooms, features, walls, windows, furniture, source: value.source };
}

const cache = new Map<string, Promise<ThumbnailGeometry | null>>();
const queue: Array<() => void> = [];
let running = 0;
function pump() { while (running < 3 && queue.length > 0) { running += 1; queue.shift()!(); } }

export function loadThumbnail(project: LabProject): Promise<ThumbnailGeometry | null> {
  if (project.sceneVersion <= 0) return Promise.resolve(null);
  const key = `${project.id}:${project.sceneVersion}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const result = new Promise<ThumbnailGeometry | null>((resolve, reject) => {
    queue.push(() => { request<LabScene>(`${projectPath(project.id)}/scene`).then((scene) => resolve(thumbnailGeometry(scene))).catch((reason) => { cache.delete(key); reject(reason); }).finally(() => { running -= 1; pump(); }); });
    pump();
  });
  cache.set(key, result);
  if (cache.size > 64) cache.delete(cache.keys().next().value!);
  return result;
}

export function ThumbnailSvg({ geometry, title }: { geometry: ThumbnailGeometry; title: string }) {
  return <svg className="lab-thumbnail-svg" viewBox={geometry.viewBox} role="img" aria-label={title + '的已保存平面简图'}><title>{title + ' · 已保存方案简化平面预览'}</title>{geometry.rooms.map((points, index) => <polygon key={'room-' + index} points={points} className={'lab-thumb-room room-' + index % 4}/>)}{geometry.features.map((points, index) => <polygon key={'feature-' + index} points={points} className="lab-thumb-feature"/>)}{geometry.furniture.map((item, index) => <rect key={'furniture-' + index} x={item.cx - item.w / 2} y={item.cy - item.d / 2} width={item.w} height={item.d} rx={Math.min(item.w, item.d) * .08} transform={'rotate(' + item.rot + ' ' + item.cx + ' ' + item.cy + ')'} className="lab-thumb-furniture"/>)}{geometry.walls.map((item, index) => <rect key={'wall-' + index} x={item.x} y={item.y} width={item.w} height={item.h} className="lab-thumb-wall"/>)}{geometry.windows.map((item, index) => <rect key={'window-' + index} x={item.x} y={item.y} width={item.w} height={item.h} className="lab-thumb-window"/>)}</svg>;
}

export default function SceneThumbnail({ project }: { project: LabProject }) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [geometry, setGeometry] = useState<ThumbnailGeometry | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!container.current || project.sceneVersion <= 0) return;
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) { setVisible(true); observer.disconnect(); } }, { rootMargin: '160px' });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [project.id, project.sceneVersion]);
  useEffect(() => {
    if (!visible || project.sceneVersion <= 0) return;
    let disposed = false;
    setFailed(false); setGeometry(null);
    loadThumbnail(project).then((result) => { if (!disposed) setGeometry(result); }).catch(() => { if (!disposed) setFailed(true); });
    return () => { disposed = true; };
  }, [project.id, project.sceneVersion, visible]);
  return <div className={'lab-scene-thumbnail' + (geometry ? ' has-preview' : '')} ref={container}>{geometry ? <><ThumbnailSvg geometry={geometry} title={project.title}/>{['baseline_reference', 'baseline_reference_modified'].includes(geometry.source || '') && <span className="lab-thumbnail-source">{geometry.source === 'baseline_reference' ? '历史参考' : '参考方案修改版'}</span>}</> : <div className="lab-thumbnail-placeholder"><StudioIcon name="plan" size={34}/><span>{project.sceneVersion <= 0 ? '尚无已保存方案' : failed ? '平面预览暂不可用' : '载入已保存平面预览'}</span></div>}</div>;
}
