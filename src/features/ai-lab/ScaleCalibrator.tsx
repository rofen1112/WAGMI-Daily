import { useRef } from 'react';
import { calibratedScale, imagePixelPoint, type LabAsset, type PixelPoint } from './api';

export default function ScaleCalibrator({ asset, imageUrl, points, lengthMm, disabled, onPoints, onLength, compact = false }: {
  asset: LabAsset; imageUrl: string; points: PixelPoint[]; lengthMm: string; disabled: boolean;
  onPoints: (points: PixelPoint[]) => void; onLength: (length: string) => void; compact?: boolean;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const ratio = calibratedScale(points, Number(lengthMm), asset.width, asset.height);
  const setCoordinate = (index: number, axis: number, value: string) => {
    const coordinate = Number(value);
    if (!Number.isFinite(coordinate)) return;
    const next = points.map((point) => [...point] as PixelPoint);
    while (next.length <= index) next.push([0, 0]);
    next[index][axis] = coordinate;
    onPoints(next);
  };
  const coordinates = <div className="lab-calibration-points">{[0, 1].map((index) => <fieldset disabled={disabled} key={index}><legend>点 {index + 1}（px）</legend>{[0, 1].map((axis) => <label key={axis}>{axis === 0 ? 'X' : 'Y'}<input type="number" inputMode="decimal" min="0" max={axis === 0 ? asset.width : asset.height} step="any" value={points[index]?.[axis] ?? ''} onChange={(event) => setCoordinate(index, axis, event.target.value)} aria-label={`点${index + 1}${axis === 0 ? 'X' : 'Y'}像素坐标`}/></label>)}</fieldset>)}</div>;
  return <div className={'lab-calibrator' + (compact ? ' is-compact' : '')}>
    <div className="lab-calibration-title"><strong>在已知长度两端各选一点</strong><button className="lab-button" type="button" disabled={disabled || points.length === 0} onClick={() => onPoints([])}>重新选点</button></div>
    <p>点位按原始图片像素记录。已选 {points.length}/2 个点；{compact ? '在比例尺浮层填写已知长度。' : '也可在下方输入坐标。'}</p>
    <div className={`lab-calibration-image ${disabled ? 'is-disabled' : ''}`}>
      <img ref={imageRef} src={imageUrl} alt={`待校准平面图：${asset.name}`} draggable={false} onPointerUp={(event) => {
        if (disabled || !imageRef.current) return;
        const point = imagePixelPoint(event.clientX, event.clientY, imageRef.current.getBoundingClientRect(), asset.width, asset.height);
        if (point) onPoints(points.length >= 2 ? [point] : [...points, point]);
      }}/>
      <svg viewBox={`0 0 ${asset.width} ${asset.height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {points.length === 2 && <line x1={points[0][0]} y1={points[0][1]} x2={points[1][0]} y2={points[1][1]} stroke="var(--color-accent)" strokeWidth="2" vectorEffect="non-scaling-stroke"/>}
        {points.map((point, index) => <g key={index}><circle cx={point[0]} cy={point[1]} r={Math.max(asset.width, asset.height) * .009} fill="var(--color-accent)" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke"/><text x={point[0]} y={point[1]} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={Math.max(asset.width, asset.height) * .012}>{index + 1}</text></g>)}
      </svg>
    </div>
    {compact ? <details className="lab-calibration-advanced"><summary>高级：输入像素坐标</summary>{coordinates}</details> : coordinates}
    {!compact && <>
    <label className="lab-field-label" htmlFor="lab-known-length">两点间已知长度 <span>毫米</span></label>
    <input id="lab-known-length" className="lab-input" type="number" inputMode="decimal" min="0.001" step="any" placeholder="例如 3000" value={lengthMm} disabled={disabled} onChange={(event) => onLength(event.target.value)}/>
    <p className="lab-field-help">{ratio !== null ? `校准换算：${Number(ratio.toPrecision(5))} mm / px。` : '选取两个不同点并填写真实已知长度后计算比例。'}校准依据来自你提供的长度，未经现场核验。</p>
    </>}
  </div>;
}
