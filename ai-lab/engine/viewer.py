"""Safe same-origin HTML renderer for a separately validated legacy scene."""
import json
import re
from copy import deepcopy
from pathlib import Path
from .scene import validate_scene, validate_state, default_state

TEMPLATE = Path(__file__).resolve().parents[1] / 'viewer' / 'index.html'
PLACEHOLDER = '__AI_LAB_SCENE_JSON__'


def render_viewer_html(scene, state, project_id, version, source_asset_url=None):
    """Return isolated HTML; the only injection is an inert safely escaped JSON blob.

    Preserve stored scene and state. Renderer-only optional presentation defaults
    never invent rooms or walls, and are not persisted back as a generated result.
    """
    validation=validate_scene(scene)
    if validation['errors']:
        raise ValueError('Viewer requires a valid complete scene: '+validation['errors'][0]['path'])
    state=default_state(scene) if state is None else deepcopy(state)
    validation=validate_state(scene,state)
    if validation['errors']:
        raise ValueError('Viewer requires valid editor state: '+validation['errors'][0]['path'])
    if not isinstance(project_id,str) or not project_id or len(project_id)>128:
        raise ValueError('Invalid viewer project ID.')
    if not isinstance(version,int) or isinstance(version,bool) or version<1:
        raise ValueError('Invalid viewer version.')
    normalized=deepcopy(scene)
    normalized.setdefault('center',[scene['bounds']['x']+scene['bounds']['w']/2,scene['bounds']['y']+scene['bounds']['h']/2])
    extent=max(scene['bounds']['w'],scene['bounds']['h'])/1000
    normalized.setdefault('camera',{'extent':extent,'maxDistance':max(20,extent*4)})
    normalized.setdefault('titleEn',normalized.get('title','AI Lab'))
    for key in ('dimensions','extraLintels','annotations','polygonWalls','columns','steps'):normalized.setdefault(key,[])
    normalized.setdefault('windowHeads',[2400]*len(scene['windows']))
    context={'projectId':project_id,'version':version}
    if source_asset_url is not None:
        if not isinstance(source_asset_url,str) or re.fullmatch(r'/api/ai-lab/v1/assets/[a-f0-9]{32}',source_asset_url) is None:
            raise ValueError('Source overlay requires an allowlisted same-origin asset URL.')
        context['sourceAssetUrl']=source_asset_url
    payload={'scene':normalized,'state':state,'context':context}
    serialized=json.dumps(payload,ensure_ascii=False,separators=(',',':'),allow_nan=False)
    serialized=serialized.replace('&','\\u0026').replace('<','\\u003c').replace('>','\\u003e').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
    template=TEMPLATE.read_text(encoding='utf-8')
    if template.count(PLACEHOLDER)!=1:raise RuntimeError('Viewer template must contain exactly one JSON injection point.')
    return template.replace(PLACEHOLDER,serialized)
