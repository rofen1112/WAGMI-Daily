"""Conservative pixel-space aperture audit, before unit conversion.

The legacy renderer does not subtract doors/windows from filled wall rectangles.
Only nearly complete overlap is a blocking defect; junctions remain warnings.
This is a deterministic geometric gate, not a claim about source-image fidelity.
"""
import math


def _rect(value):
    if not isinstance(value,(list,tuple)) or len(value)<4:
        return None
    coords=value[:4]
    if not all(isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v) for v in coords):
        return None
    x0,y0,x1,y1=coords
    return coords if x1>x0 and y1>y0 else None


def _coverage(aperture,walls):
    x0,y0,x1,y1=aperture
    clips=[]
    indices=[]
    for index,wall in walls:
        a,b,c,d=wall
        clip=max(x0,a),max(y0,b),min(x1,c),min(y1,d)
        if clip[0]<clip[2] and clip[1]<clip[3]:
            clips.append(clip)
            indices.append(index)
    if not clips:return 0,[]
    xs=sorted(set(x for c in clips for x in (c[0],c[2])))
    area=0
    for a,b in zip(xs,xs[1:]):
        intervals=sorted((c[1],c[3]) for c in clips if c[0]<=a and c[2]>=b)
        if not intervals:continue
        start,end=intervals[0]
        height=0
        for lo,hi in intervals[1:]:
            if lo>end:
                height+=end-start
                start,end=lo,hi
            else:end=max(end,hi)
        area+=(b-a)*(height+end-start)
    return area/((x1-x0)*(y1-y0)),indices


def audit_pixel_topology(candidate):
    result={'errors':[],'warnings':[]}
    if not isinstance(candidate,dict):return result
    raw_walls=candidate.get('walls',[])
    if not isinstance(raw_walls,list):return result
    walls=[(i,r) for i,v in enumerate(raw_walls[:4096]) if (r:=_rect(v))]
    for kind in ('windows','doors','slides'):
        values=candidate.get(kind,[])
        if not isinstance(values,list):continue
        for i,item in enumerate(values[:1024]):
            aperture=_rect(item.get('rect') if isinstance(item,dict) else item)
            if not aperture:continue
            coverage,indices=_coverage(aperture,walls)
            if coverage<0.2:continue
            blocking=coverage>=0.95
            result['errors' if blocking else 'warnings'].append({
                'path':f'$.{kind}[{i}]',
                'code':'aperture_blocked_by_wall' if blocking else 'aperture_wall_overlap',
                'message':f'Filled full-height wall rectangles cover {coverage:.1%} of this aperture; renderer does not cut openings automatically. Split wall rectangles around the opening; do not delete the opening or change scale.',
                'wallIndices':indices[:20],
            })
    return result
