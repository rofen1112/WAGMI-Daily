"""Validate legacy mm scenes and compile model ORIGINAL IMAGE PIXELS exactly once.

Pure stdlib. Validation returns errors/warnings with stable paths; compilation never
loads examples, guesses a measured scale, calls a provider, or changes its input.
"""
from copy import deepcopy
import math
import re
from .geometry import check_polygon, triangulate, intersection_area, signed_area, bbox, bounds_overlap

MATERIALS = frozenset('wood walnut tile800 tile600 marble antislip terrazzo carpet'.split())
FURNITURE_TYPES = frozenset('bed crib nightstand wardrobe dresser desk chair bookshelf baycushion sofa cornersofa armchair beanbag coffeetable sidetable tvstand rug shoecab floorlamp plant table roundtable island barstool counter stove ksink fridge cabinet toilet vanity shower bathtub washer waterheater tv aircon acwall dishwasher ovencol dryer purifier officechair piano treadmill'.split())
ID = re.compile(r'^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$')
COLOR = re.compile(r'^#[0-9A-Fa-f]{6}$')
DANGEROUS_KEYS = {'__proto__', 'prototype', 'constructor'}
MAX_OBJECTS = 3000
FURNITURE_FIELDS = frozenset('id type name cx cy w d rot color outline tableShape role workstationRow workstationColumn workstationSide'.split())


def _result():
    return {'errors': [], 'warnings': [], 'counts': {}}


def _issue(v, path, message, code='invalid', warning=False):
    v['warnings' if warning else 'errors'].append({'path': path, 'code': code, 'message': message})


def _number(x):
    try:
        return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x)
    except (OverflowError,TypeError,ValueError):
        return False


def _positive(x):
    return _number(x) and x > 0


def _point(p):
    return isinstance(p, list) and len(p) == 2 and all(_number(n) for n in p)


def _identifier(x):
    return isinstance(x, str) and ID.fullmatch(x) is not None and x not in DANGEROUS_KEYS


def _text(x):
    return isinstance(x, str) and len(x) <= 4000


def _scan_json(value, v, path='$', depth=0):
    if depth > 40:
        _issue(v, path, 'JSON nesting exceeds 40 levels.'); return
    if isinstance(value, dict):
        for k, val in value.items():
            if not isinstance(k, str) or k in DANGEROUS_KEYS:
                _issue(v, path, 'Unsafe object key.', 'unsafe_key'); continue
            _scan_json(val, v, f'{path}.{k}', depth+1)
    elif isinstance(value, list):
        if len(value) > 10000:
            _issue(v, path, 'Array exceeds the geometry limit.'); return
        for i, val in enumerate(value):
            _scan_json(val, v, f'{path}[{i}]', depth+1)
    elif isinstance(value, (float,int)) and not isinstance(value,bool) and not _number(value):
        _issue(v, path, 'Number must be finite.', 'non_finite')
    elif not isinstance(value, (str, int, float, bool, type(None))):
        _issue(v, path, 'Value must be JSON data.')


def _furniture(items, v, path='$.furniture', bounds=None):
    ids=set()
    if not isinstance(items, list):
        _issue(v,path,'Furniture must be an array.'); return
    if len(items)>MAX_OBJECTS:
        _issue(v,path,'Too many furniture items.'); return
    for i,f in enumerate(items):
        p=f'{path}[{i}]'
        if not isinstance(f,dict): _issue(v,p,'Furniture must be an object.'); continue
        if not _identifier(f.get('id')) or f.get('id') in ids: _issue(v,p+'.id','ID must be safe and unique.','invalid_id')
        ids.add(f.get('id') if isinstance(f.get('id'),str) else None)
        if not isinstance(f.get('type'),str) or f.get('type') not in FURNITURE_TYPES: _issue(v,p+'.type','Unsupported furniture type.','unsupported_type')
        if not _text(f.get('name')): _issue(v,p+'.name','Name must be text.')
        if not isinstance(f.get('color'),str) or COLOR.fullmatch(f['color']) is None: _issue(v,p+'.color','Color must be #RRGGBB.','invalid_color')
        for key in ('cx','cy','rot'):
            if not _number(f.get(key)): _issue(v,p+'.'+key,'Value must be finite.','non_finite')
        for key in ('w','d'):
            if not _positive(f.get(key)): _issue(v,p+'.'+key,'Dimension must be positive.','nonpositive')
        if 'outline' in f:
            outline=f['outline']
            if not isinstance(outline,list) or len(outline)>100 or not all(_point(q) and all(abs(n)<=1 for n in q) for q in outline):
                _issue(v,p+'.outline','Outline must contain normalized finite polygon points.')
            else:
                try: check_polygon([[x*1000,y*1000] for x,y in outline],p+'.outline')
                except (AssertionError,TypeError,ValueError,IndexError): _issue(v,p+'.outline','Outline must be a simple polygon.')
        if 'tableShape' in f and (not isinstance(f['tableShape'],str) or f['tableShape'] not in ('rectangle','circle','polygon','rect','ellipse','oval','round')):
            _issue(v,p+'.tableShape','Unsupported table shape.')
        if bounds and all(_number(f.get(k)) for k in ('cx','cy','rot','w','d')):
            a=math.radians(f['rot']); dx=(abs(math.cos(a))*f['w']+abs(math.sin(a))*f['d'])/2; dy=(abs(math.sin(a))*f['w']+abs(math.cos(a))*f['d'])/2
            if f['cx']-dx < bounds[0]-1 or f['cy']-dy < bounds[1]-1 or f['cx']+dx > bounds[2]+1 or f['cy']+dy > bounds[3]+1:
                _issue(v,p,'Furniture footprint is outside scene bounds.','out_of_bounds')


def validate_scene(scene):
    """Validate a complete legacy scene in mm; never rescales or mutates it."""
    v=_result()
    if not isinstance(scene,dict): _issue(v,'$','Scene must be an object.'); return v
    _scan_json(scene,v)
    for key in ('walls','windows','doors','slides','rooms','furniture'):
        if not isinstance(scene.get(key),list): _issue(v,'$.'+key,'Required array is missing.')
    for key in ('polygonWalls','columns','steps','dimensions','annotations','extraLintels'):
        if key in scene and not isinstance(scene[key],list): _issue(v,'$.'+key,'Expected an array.')
    if v['errors']: return v
    if sum(len(scene.get(k,[])) for k in ('walls','windows','doors','slides','rooms','furniture','polygonWalls','columns','steps'))>MAX_OBJECTS:
        _issue(v,'$','Scene exceeds the object limit.'); return v
    if not scene['rooms']: _issue(v,'$.rooms','At least one room is required.','empty_scene')
    if not _identifier(scene.get('id')): _issue(v,'$.id','Scene ID must be safe.','invalid_id')
    for key in ('title','titleEn'):
        if key in scene and not _text(scene[key]): _issue(v,'$.'+key,'Title must be text.')
    metadata=scene.get('metadata',{})
    if not isinstance(metadata,dict): _issue(v,'$.metadata','Metadata must be an object.'); metadata={}
    for key in ('areaLabel','areaLabelEn','dimensionNote'):
        if key in metadata and not _text(metadata[key]):
            _issue(v,'$.metadata.'+key,'Renderer metadata text must be a string.')
    scale=metadata.get('mmPerPixel')
    if not _positive(scale): _issue(v,'$.metadata.mmPerPixel','An explicit positive mm/pixel scale is required.','invalid_scale')
    ceiling=metadata.get('ceilingHeightMm',2800)
    if not _positive(ceiling): _issue(v,'$.metadata.ceilingHeightMm','Ceiling height must be positive.'); ceiling=2800
    b=scene.get('bounds',{})
    bounds=None
    if not isinstance(b,dict) or not all(_number(b.get(k)) for k in ('x','y','w','h')) or not _positive(b.get('w')) or not _positive(b.get('h')):
        _issue(v,'$.bounds','Bounds need finite x/y and positive width/height.')
    else: bounds=(b['x'],b['y'],b['x']+b['w'],b['y']+b['h'])
    if 'center' in scene and not _point(scene['center']): _issue(v,'$.center','Center must be a finite point.')
    if 'camera' in scene and (not isinstance(scene['camera'],dict) or not all(_positive(scene['camera'].get(k)) for k in ('extent','maxDistance'))): _issue(v,'$.camera','Camera extent and maximum distance must be positive.')
    def points_inside(points,p):
        if bounds and any(x<bounds[0]-1 or x>bounds[2]+1 or y<bounds[1]-1 or y>bounds[3]+1 for x,y in points): _issue(v,p,'Geometry is outside scene bounds.','out_of_bounds')
    def rectangle(r,p):
        if not isinstance(r,list) or len(r)<4 or not all(_number(n) for n in r[:4]): _issue(v,p,'Rectangle requires four finite coordinates.'); return False
        if r[2]<=r[0] or r[3]<=r[1]: _issue(v,p,'Rectangle is a filled positive area, not centerline endpoints.','nonpositive'); return False
        points_inside([[r[0],r[1]],[r[2],r[3]]],p); return True
    for key in ('walls','windows'):
        for i,r in enumerate(scene[key]):
            rectangle(r,f'$.{key}[{i}]')
            if key=='walls' and (not isinstance(r,list) or len(r)!=5 or r[4] not in ('e','i','n','b','low')): _issue(v,f'$.walls[{i}][4]','Unsupported wall classification.')
    for key in ('doors','slides'):
        for i,d in enumerate(scene[key]):
            p=f'$.{key}[{i}]'
            if not isinstance(d,dict): _issue(v,p,'Opening must be an object.'); continue
            rectangle(d.get('rect'),p+'.rect')
            if key=='doors':
                if not _positive(d.get('len')): _issue(v,p+'.len','Door length must be positive.')
                if not _point(d.get('h')): _issue(v,p+'.h','Hinge must be a finite point.')
                for k in ('c','o'):
                    if not _point(d.get(k)) or abs(math.hypot(*d[k])-1)>1e-5: _issue(v,p+'.'+k,'Direction must be a unit vector.')
                if _point(d.get('c')) and _point(d.get('o')) and abs(sum(a*b for a,b in zip(d['c'],d['o'])))>1e-5: _issue(v,p,'Door directions must be perpendicular.')
            elif not isinstance(d.get('v'),bool): _issue(v,p+'.v','Slide orientation must be boolean.')
    sills=scene.get('windowSills',[]); heads=scene.get('windowHeads',[2400]*len(scene['windows']))
    for key,values in (('windowSills',sills),('windowHeads',heads)):
        if not isinstance(values,list) or len(values)!=len(scene['windows']): _issue(v,'$.'+key,'Window height count must equal window count.')
    if isinstance(sills,list) and isinstance(heads,list):
        for i,(s,h) in enumerate(zip(sills,heads)):
            if not _number(s) or not _positive(h) or not 0<=s<h<=ceiling: _issue(v,f'$.windowSills[{i}]','Window sill/head must satisfy 0 <= sill < head <= ceiling.')
    ids=set(); room_triangles=[]
    def polygon(poly,p):
        if not isinstance(poly,list) or len(poly)>1000 or not all(_point(q) for q in poly): _issue(v,p,'Polygon must be an array with at most 1000 vertices.'); return None
        try:
            check_polygon(poly,p); points_inside(poly,p); return triangulate(poly)
        except (AssertionError,TypeError,ValueError,IndexError) as exc:
            _issue(v,p,str(exc) or 'Invalid polygon.','invalid_polygon'); return None
    for key in ('rooms','polygonWalls','columns','steps'):
        values=scene.get(key,[])
        if not isinstance(values,list): _issue(v,'$.'+key,'Expected an array.'); continue
        for i,r in enumerate(values):
            p=f'$.{key}[{i}]'
            if not isinstance(r,dict): _issue(v,p,'Feature must be an object.'); continue
            ident=r.get('id')
            if not _identifier(ident) or ident in ids: _issue(v,p+'.id','ID must be safe and unique across rooms/features.','invalid_id')
            if isinstance(ident,str): ids.add(ident)
            triangles=polygon(r.get('poly'),p+'.poly')
            if key=='rooms':
                if not isinstance(r.get('mat'),str) or r.get('mat') not in MATERIALS: _issue(v,p+'.mat','Unsupported floor material.','invalid_material')
                if not _text(r.get('name')): _issue(v,p+'.name','Room name must be text.')
                if 'at' in r and not _point(r['at']): _issue(v,p+'.at','Label anchor must be a finite point.')
                if triangles: room_triangles.append((i,r,triangles))
            else:
                if not _positive(r.get('height')): _issue(v,p+'.height','Feature height must be positive mm.')
                for color in ('color','capColor'):
                    if color in r and (not isinstance(r[color],str) or COLOR.fullmatch(r[color]) is None): _issue(v,p+'.'+color,'Color must be #RRGGBB.')
                if 'opacity' in r and (not _number(r['opacity']) or not 0<=r['opacity']<=1): _issue(v,p+'.opacity','Opacity must be between zero and one.')
    if 'labelRooms3D' in scene:
        labels=scene['labelRooms3D']
        known_room_ids={r['id'] for r in scene['rooms'] if isinstance(r,dict) and _identifier(r.get('id'))}
        if not isinstance(labels,list):
            _issue(v,'$.labelRooms3D','3D room labels must be an array of known room IDs.','invalid_reference')
        else:
            for i,room_id in enumerate(labels):
                if not isinstance(room_id,str) or room_id not in known_room_ids:
                    _issue(v,f'$.labelRooms3D[{i}]','3D room label must reference an existing room ID.','invalid_reference')
    outer=polygon(scene['outerBoundary'],'$.outerBoundary') if 'outerBoundary' in scene else None
    for n,(i,a,ta) in enumerate(room_triangles):
        if outer:
            outside=max(0,abs(signed_area(a['poly']))-intersection_area(ta,outer))
            if outside>1: _issue(v,f'$.rooms[{i}].poly',f'Room extends outside outer boundary by {outside:.2f} mm².','outside_boundary')
        for j,b,tb in room_triangles[n+1:]:
            if bounds_overlap(bbox(a['poly']),bbox(b['poly'])):
                overlap=intersection_area(ta,tb)
                if overlap>1: _issue(v,f'$.rooms[{j}].poly',f'Room overlaps $.rooms[{i}] by {overlap:.2f} mm².','room_overlap')
    _furniture(scene['furniture'],v,bounds=bounds)
    for i,d in enumerate(scene.get('dimensions',[])):
        if not isinstance(d,dict) or not isinstance(d.get('horizontal'),bool) or not all(_number(d.get(k)) for k in ('at','start')) or not isinstance(d.get('segments'),list) or not all(_positive(n) for n in d['segments']): _issue(v,f'$.dimensions[{i}]','Dimension chain requires finite anchor and positive segments.')
    for i,a in enumerate(scene.get('annotations',[])):
        if not isinstance(a,dict) or not _point(a.get('at')) or not _text(a.get('text')) or ('textEn' in a and not _text(a['textEn'])): _issue(v,f'$.annotations[{i}]','Annotation requires a finite point and text.')
    for i,item in enumerate(scene.get('extraLintels',[])):
        if not isinstance(item,list) or len(item)!=2 or not _positive(item[1]): _issue(v,f'$.extraLintels[{i}]','Lintel requires rectangle and positive height in meters.')
        else: rectangle(item[0],f'$.extraLintels[{i}][0]')
    for key in ('walkStart','walkLook'):
        if key in scene and not _point(scene[key]): _issue(v,'$.'+key,'Walk position must be a finite point.')
    if 'labelFontSize' in scene and not _positive(scene['labelFontSize']): _issue(v,'$.labelFontSize','Label font size must be positive.')
    for k in ('rooms','walls','windows','doors','slides','furniture','polygonWalls','columns','steps'): v['counts'][k]=len(scene.get(k,[])) if isinstance(scene.get(k,[]),list) else 0
    _issue(v,'$.metadata.mmPerPixel','Scale and areas are illustrative estimates, not measured precision.','estimated_scale',True)
    return v


def compile_pixel_scene(candidate,image_width,image_height,mm_per_pixel,project_id,title=''):
    """Compile original-image pixel plan coordinates; vertical mm and vectors stay unchanged."""
    v=_result()
    for key,value in (('image_width',image_width),('image_height',image_height),('mm_per_pixel',mm_per_pixel)):
        if not _positive(value): _issue(v,'$.'+key,'Parameter must be finite and positive.','invalid_parameter')
    if not _identifier(project_id): _issue(v,'$.project_id','Project ID must be a safe opaque ID.','invalid_parameter')
    if not isinstance(candidate,dict): _issue(v,'$','Model output must be an object.')
    if not _text(title): _issue(v,'$.title','Title must be text.')
    if v['errors']: return {},v
    _scan_json(candidate,v)
    if v['errors']: return {},v
    source_meta=candidate.get('metadata',{})
    if not isinstance(source_meta,dict): _issue(v,'$.metadata','Metadata must be an object.'); return {},v
    if source_meta.get('coordinateUnits') in ('mm','millimeters') or source_meta.get('compiledBy'):
        _issue(v,'$.metadata.coordinateUnits','Already compiled mm scene cannot be compiled again.','already_compiled'); return {},v
    for key in ('walls','windows','doors','slides','rooms','furniture','polygonWalls','columns','steps','dimensions','annotations','extraLintels'):
        if key in candidate and not isinstance(candidate[key],list): _issue(v,'$.'+key,'Expected an array.')
    if v['errors']: return {},v
    s=deepcopy(candidate); scale=mm_per_pixel
    def point(p):
        return [p[0]*scale,p[1]*scale] if _point(p) else p
    def rect(r):
        return [n*scale for n in r[:4]]+r[4:] if isinstance(r,list) and len(r)>=4 and all(_number(n) for n in r[:4]) else r
    for key in ('walls','windows'):
        if key not in s:s[key]=[]
        if isinstance(s[key],list):s[key]=[rect(r) for r in s[key]]
    if isinstance(s.get('walls'),list):
        for wall in s['walls']:
            if isinstance(wall,list) and len(wall)==5 and wall[4]=='i': wall[4]='n'
    for key in ('rooms','polygonWalls','columns','steps'):
        if key not in s:s[key]=[]
        if not isinstance(s[key],list):continue
        for i,r in enumerate(s[key]):
            if not isinstance(r,dict):continue
            r.setdefault('id',f'{key}-{i+1:03d}')
            if isinstance(r.get('poly'),list):r['poly']=[point(p) for p in r['poly']]
            if 'at'in r:r['at']=point(r['at'])
            if key=='rooms':
                r.setdefault('name',f'Room {i+1}');r.setdefault('mat','wood')
                if 'at'not in r and isinstance(r.get('poly'),list) and r['poly'] and all(_point(p)for p in r['poly']):r['at']=[sum(p[j]for p in r['poly'])/len(r['poly'])for j in (0,1)]
            else:r.setdefault('color','#cbd0d1');r.setdefault('height',source_meta.get('ceilingHeightMm',2800))
    for key in ('doors','slides'):
        s.setdefault(key,[])
        if not isinstance(s[key],list):continue
        for d in s[key]:
            if not isinstance(d,dict):continue
            d['rect']=rect(d.get('rect'))
            if key=='doors':
                d['h']=point(d.get('h'))
                if _number(d.get('len')):d['len']*=scale
                d.setdefault('name','Door')
            else:d.setdefault('v',False)
    s.setdefault('furniture',[])
    if isinstance(s['furniture'],list):
        for i,f in enumerate(s['furniture']):
            if not isinstance(f,dict):continue
            f.setdefault('id',f'f-{i+1:03d}');f.setdefault('name',str(f.get('type','Furniture')));f.setdefault('color','#d8c2a2');f.setdefault('rot',0)
            for key in ('cx','cy','w','d'):
                if _number(f.get(key)):f[key]*=scale
    for key in ('outerBoundary',):
        if isinstance(s.get(key),list):s[key]=[point(p)for p in s[key]]
    for key in ('walkStart','walkLook','center'):
        if key in s:s[key]=point(s[key])
    for a in s.get('annotations',[]):
        if isinstance(a,dict):a['at']=point(a.get('at'))
    for d in s.get('dimensions',[]):
        if not isinstance(d,dict):continue
        for key in ('at','start'):
            if _number(d.get(key)):d[key]*=scale
        if isinstance(d.get('segments'),list):d['segments']=[n*scale if _number(n)else n for n in d['segments']]
    for item in s.get('extraLintels',[]):
        if isinstance(item,list)and len(item)==2:item[0]=rect(item[0])
    if _number(s.get('labelFontSize')):s['labelFontSize']*=scale
    w=image_width*scale;h=image_height*scale
    s.update(id=project_id,version=1,title=title or s.get('title') or 'AI generated scene')
    s.setdefault('titleEn',s['title']);s['bounds']={'x':0,'y':0,'w':w,'h':h};s.setdefault('center',[w/2,h/2])
    extent=max(w,h)/1000;s['camera']={'extent':extent,'maxDistance':max(20,extent*4)}
    s.setdefault('labelFontSize',max(w,h)*.018)
    s.setdefault('walkStart',[w/2,h/2]);s.setdefault('walkLook',[w/2,h/2+min(1000,h/4)])
    s.setdefault('dimensions',[]);s.setdefault('extraLintels',[]);s.setdefault('annotations',[])
    s.setdefault('windowSills',[900]*len(s['windows']) if isinstance(s['windows'],list)else [])
    s.setdefault('windowHeads',[2400]*len(s['windows']) if isinstance(s['windows'],list)else [])
    s['metadata']={**source_meta,'sourcePixels':[image_width,image_height],'originPixels':[0,0],'mmPerPixel':scale,'coordinateUnits':'mm','compiledBy':'ai-lab-pixel-compiler-v1','ceilingHeightMm':source_meta.get('ceilingHeightMm',2800),'dimensionNote':'Scale supplied or assumed by the user; dimensions and areas are estimates, not measured.','method':'Model output compiled from original image pixels; geometry validation does not verify image fidelity.'}
    return s,validate_scene(s)


def default_state(scene):
    return {'furniture':deepcopy(scene.get('furniture',[])),'rooms':{r['id']:{'name':r['name'],'mat':r['mat']}for r in scene.get('rooms',[])},'demolished':[],'measures':[]}


def validate_state(scene,state):
    v=_result()
    if not isinstance(state,dict):_issue(v,'$.state','State must be an object.');return v
    _scan_json(state,v,'$.state')
    allowed={'furniture','rooms','demolished','measures'}
    if set(state)!=allowed:_issue(v,'$.state','State must contain only furniture, rooms, demolished and measures.','unsupported_field')
    _furniture(state.get('furniture'),v,'$.state.furniture')
    for i,f in enumerate(state.get('furniture',[])if isinstance(state.get('furniture'),list)else []):
        if isinstance(f,dict)and set(f)-FURNITURE_FIELDS:_issue(v,f'$.state.furniture[{i}]','Unsupported furniture fields.','unsupported_field')
    rooms=state.get('rooms');expected={r['id']for r in scene.get('rooms',[])}
    if not isinstance(rooms,dict)or set(rooms)!=expected:_issue(v,'$.state.rooms','Room IDs must exactly match the scene.')
    elif isinstance(rooms,dict):
        for key,r in rooms.items():
            if not isinstance(r,dict)or set(r)!={'name','mat'}or not _text(r.get('name'))or not isinstance(r.get('mat'),str)or r.get('mat')not in MATERIALS:_issue(v,'$.state.rooms.'+key,'Room state requires text name and supported mat.')
    dem=state.get('demolished')
    if not isinstance(dem,list)or any(not isinstance(w,str)or not re.fullmatch(r'w\d+',w)or int(w[1:])>=len(scene.get('walls',[]))for w in dem):_issue(v,'$.state.demolished','Demolished IDs must refer to existing walls.')
    measures=state.get('measures')
    if not isinstance(measures,list)or len(measures)>1000:_issue(v,'$.state.measures','Measures must be a bounded array.')
    else:
        for i,m in enumerate(measures):
            if not isinstance(m,dict)or set(m)!={'a','b'}or any(not isinstance(m.get(k),dict)or set(m[k])!={'x','y'}or not all(_number(m[k][axis])for axis in ('x','y'))for k in ('a','b')):_issue(v,f'$.state.measures[{i}]','Measure requires finite a/b x/y points.')
    return v


def apply_scene_patch(scene,patch):
    """Apply only update_furniture/update_room operations in existing mm units.

    Reject unknown operations/fields/IDs, and validate the complete result. No
    arbitrary JSON Patch paths, scripts, geometry replacement, or metadata edits.
    """
    if not isinstance(patch,dict)or set(patch)!={'operations'}or not isinstance(patch['operations'],list)or not 1<=len(patch['operations'])<=100:raise ValueError('Patch requires 1..100 operations.')
    result=deepcopy(scene)
    for op in patch['operations']:
        if not isinstance(op,dict)or set(op)!={'op','id','changes'}or op.get('op')not in ('update_furniture','update_room'):raise ValueError('Unsupported patch operation.')
        allowed={'cx','cy','w','d','rot','color','name'}if op['op']=='update_furniture'else {'name','mat'}
        changes=op['changes']
        if not isinstance(changes,dict)or not changes or set(changes)-allowed:raise ValueError('Unsupported patch fields.')
        collection=result['furniture'if op['op']=='update_furniture'else 'rooms']
        target=next((x for x in collection if x['id']==op['id']),None)
        if target is None:raise ValueError('Unknown patch target ID.')
        target.update(deepcopy(changes))
    validation=validate_scene(result)
    if validation['errors']:raise ValueError('Invalid patched scene: '+validation['errors'][0]['path']+' '+validation['errors'][0]['message'])
    return result
