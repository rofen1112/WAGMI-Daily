"""Meaningful scene/compiler/security checks; private baselines remain external.
Run: python tests/ai-lab-engine-test.py -v
Set AI_LAB_LEGACY_FIXTURES to a private directory containing the three case folders.
"""
from copy import deepcopy
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'ai-lab'))
from engine.scene import compile_pixel_scene,validate_scene,apply_scene_patch,default_state,validate_state
from engine.viewer import render_viewer_html


def pixels():
    return {'rooms':[{'id':'room-a','name':'Living','poly':[[10,10],[90,10],[90,90],[10,90]],'mat':'wood'}],
      'walls':[[5,5,95,10,'e']], 'windows':[], 'doors':[], 'slides':[],
      'furniture':[{'id':'desk-a','type':'desk','name':'Desk','cx':50,'cy':50,'w':20,'d':10}],
      'columns':[{'id':'col-a','poly':[[15,15],[16,15],[16,16],[15,16]],'height':2800}],
      'metadata':{'ceilingHeightMm':3000}}


def compiled():
    scene,v=compile_pixel_scene(pixels(),100,100,20,'project-a','A scene')
    assert not v['errors'],v
    return scene


class EngineTests(unittest.TestCase):
    def test_original_pixels_converted_exactly_once(self):
        candidate=pixels();before=deepcopy(candidate)
        s,v=compile_pixel_scene(candidate,100,100,20,'project-a')
        self.assertEqual(candidate,before)
        self.assertEqual(s['rooms'][0]['poly'][0],[200,200])
        self.assertEqual(s['walls'][0],[100,100,1900,200,'e'])
        self.assertEqual(s['furniture'][0]['w'],400)
        self.assertEqual(s['columns'][0]['height'],2800)
        self.assertEqual(s['metadata']['ceilingHeightMm'],3000)
        before=deepcopy(s);self.assertFalse(validate_scene(s)['errors']);self.assertEqual(s,before)
        _,v=compile_pixel_scene(s,100,100,20,'project-a')
        self.assertEqual(v['errors'][0]['code'],'already_compiled')

    def test_self_intersections_and_touching_non_adjacent_edges_rejected(self):
        for poly in ([[10,10],[90,90],[10,90],[90,10]],[[10,10],[90,10],[50,10],[90,90],[10,90]]):
            c=pixels();c['rooms'][0]['poly']=poly
            _,v=compile_pixel_scene(c,100,100,20,'project-a')
            self.assertTrue(any(e['code']=='invalid_polygon'for e in v['errors']))

    def test_invalid_numeric_and_structural_parameters(self):
        for param in (0,-1,float('nan'),float('inf'),True,'20',None):
            _,v=compile_pixel_scene(pixels(),100,100,param,'project-a');self.assertTrue(v['errors'])
        for key,value in (('rooms',None),('columns',{}),('dimensions','oops'),('annotations',5)):
            c=pixels();c[key]=value;_,v=compile_pixel_scene(c,100,100,20,'project-a');self.assertTrue(v['errors'])
        c=pixels();c['furniture'][0]['type']=[]
        _,v=compile_pixel_scene(c,100,100,20,'project-a');self.assertTrue(v['errors'])
        c=pixels();c['rooms'][0]['mat']=[]
        _,v=compile_pixel_scene(c,100,100,20,'project-a');self.assertTrue(v['errors'])

    def test_room_overlap_outbounds_and_negative_rectangles(self):
        c=pixels();c['rooms'].append({**c['rooms'][0],'id':'room-b'})
        _,v=compile_pixel_scene(c,100,100,20,'project-a');self.assertTrue(any(e['code']=='room_overlap'for e in v['errors']))
        c=pixels();c['furniture'][0]['cx']=100
        _,v=compile_pixel_scene(c,100,100,20,'project-a');self.assertTrue(any(e['code']=='out_of_bounds'for e in v['errors']))
        c=pixels();c['walls'][0]=[10,10,10,90,'e']
        _,v=compile_pixel_scene(c,100,100,20,'project-a');self.assertTrue(any(e['code']=='nonpositive'for e in v['errors']))

    def test_identifiers_colors_materials_and_nonfinite_values_rejected(self):
        for key,value in (('id','x\" onclick=\"alert(1)'),('id','__proto__'),('color','red\" onload=\"x'),('type','unknown'),('rot',float('nan'))):
            c=pixels();c['furniture'][0][key]=value
            _,v=compile_pixel_scene(c,100,100,20,'project-a');self.assertTrue(v['errors'])
        c=pixels();c['rooms'].append({**c['rooms'][0]})
        _,v=compile_pixel_scene(c,100,100,20,'project-a');self.assertTrue(any(e['code']=='invalid_id'for e in v['errors']))

    def test_patch_allowlist_is_atomic_and_mm_stays_mm(self):
        s=compiled();before=deepcopy(s)
        updated=apply_scene_patch(s,{'operations':[{'op':'update_furniture','id':'desk-a','changes':{'cx':1100,'rot':90}},{'op':'update_room','id':'room-a','changes':{'name':'Renamed','mat':'carpet'}}]})
        self.assertEqual(updated['furniture'][0]['cx'],1100);self.assertEqual(s,before)
        bad=[{'op':'replace','id':'desk-a','changes':{'cx':20}}, {'op':'update_furniture','id':'desk-a','changes':{'type':'bed'}}, {'op':'update_furniture','id':'desk-a','changes':{'w':-5}}, {'op':'update_room','id':'room-a','changes':{'poly':[]}}, {'op':'update_room','id':'missing','changes':{'name':'x'}}]
        for op in bad:
            with self.assertRaises(ValueError):apply_scene_patch(s,{'operations':[op]})
        self.assertEqual(s,before)

    def test_state_strict_fields_and_renderer_script_injection(self):
        s=compiled();s['title']='</script><script>globalThis.INJECTED=1</script>'
        s['rooms'][0]['name']='"><img src=x onerror=alert(1)>'
        st=default_state(s);self.assertFalse(validate_state(s,st)['errors'])
        html=render_viewer_html(s,st,'project-a',3)
        self.assertNotIn('</script><script>globalThis.INJECTED',html)
        payload=re.search(r'<script id="ai-lab-payload" type="application/json">(.*?)</script>',html,re.S)[1]
        self.assertNotIn('<',payload);self.assertEqual(json.loads(payload)['scene']['title'],s['title'])
        self.assertIn("LAB_SCOPE + ':state'",html);self.assertNotIn('huxing-design-case-',html)
        self.assertIn('event.source !== window.parent',html);self.assertIn('event.origin !== window.location.origin',html)
        self.assertIn('renderer?.forceContextLoss()',html)
        bad=deepcopy(st);bad['script']='alert(1)';self.assertTrue(validate_state(s,bad)['errors'])
        bad=deepcopy(st);bad['furniture'][0]['color']='url(javascript:x)';self.assertTrue(validate_state(s,bad)['errors'])

    def test_renderer_contract_rejects_wrong_optional_schema(self):
        # These are malicious/error fixtures, not legitimate model-generated scenes.
        for labels in ({'includes':'room-a'}, 'room-a', None, [7], [{}], ['unknown-room'], ['<img onerror=alert(1)>']):
            s=compiled();s['labelRooms3D']=labels
            errors=validate_scene(s)['errors']
            self.assertTrue(any(e['path'].startswith('$.labelRooms3D') for e in errors),labels)
            with self.assertRaises(ValueError):render_viewer_html(s,None,'project-a',1)
        s=compiled();s['labelRooms3D']=['room-a']
        self.assertFalse(validate_scene(s)['errors'])
        s['labelRooms3D']=[];self.assertFalse(validate_scene(s)['errors'])
        for key in ('areaLabel','areaLabelEn','dimensionNote'):
            s=compiled();s['metadata'][key]={'replaceAll':'malicious'}
            self.assertTrue(any(e['path']=='$.metadata.'+key for e in validate_scene(s)['errors']))
            with self.assertRaises(ValueError):render_viewer_html(s,None,'project-a',1)
        s=compiled();s['metadata']=[]
        self.assertTrue(any(e['path']=='$.metadata' for e in validate_scene(s)['errors']))
        for key in ('polygonWalls','columns','steps','dimensions','annotations','extraLintels','windowSills','windowHeads'):
            s=compiled();s[key]={'map':'malicious'}
            self.assertTrue(any(e['path']=='$.'+key for e in validate_scene(s)['errors']),key)
            with self.assertRaises(ValueError):render_viewer_html(s,None,'project-a',1)

    def test_viewer_scripts_parse(self):
        html=render_viewer_html(compiled(),None,'project-a',1)
        for attrs,script in re.findall(r'<script([^>]*)>([\s\S]*?)</script>',html):
            if 'importmap'in attrs or 'application/json'in attrs:continue
            result=subprocess.run(['node','--check','--input-type=module'],input=script,text=True,encoding='utf-8',capture_output=True)
            self.assertEqual(result.returncode,0,result.stderr)

    def test_three_private_legacy_examples_read_only(self):
        fixtures=os.environ.get('AI_LAB_LEGACY_FIXTURES')
        if not fixtures:self.skipTest('Set AI_LAB_LEGACY_FIXTURES for private original baseline compatibility.')
        for name in ('user-floorplan','tugendhat-ground','office-rounded'):
            path=Path(fixtures)/name/'floorplan.json';raw=path.read_bytes();s=json.loads(raw)
            v=validate_scene(s);self.assertEqual(v['errors'],[],(name,v['errors']))
            state=default_state(s);self.assertEqual(validate_state(s,state)['errors'],[])
            html=render_viewer_html(s,state,'reference-'+name,1)
            self.assertNotIn('cases/'+name+'/source',html)
            self.assertEqual(path.read_bytes(),raw)
            self.assertEqual(json.loads(re.search(r'id="ai-lab-payload" type="application/json">(.*?)</script>',html,re.S)[1])['scene']['rooms'],s['rooms'])

if __name__=='__main__':unittest.main()
