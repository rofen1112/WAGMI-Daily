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
from engine.scene import compile_pixel_scene,validate_scene,apply_scene_patch,default_state,validate_state,validate_scale_provenance
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

    def test_scale_provenance_is_explicit_and_model_cannot_upgrade_it(self):
        provenance={'mode':'measured','mmPerPixel':20,'confidence':'high','evidence':['用户提供 1000 mm 参考长度'],'assumptions':['校尺不代表现场测绘。'],'anchors':[{'label':'已知墙长','p1':[0,0],'p2':[50,0],'lengthMm':1000,'source':'user_measurement'}]}
        self.assertFalse(validate_scale_provenance(provenance,20,100,100)['errors'])
        candidate=pixels();candidate['metadata']['scaleProvenance']={**provenance,'mode':'estimated'}
        scene,v=compile_pixel_scene(candidate,100,100,20,'project-a',scale_provenance=provenance)
        self.assertFalse(v['errors']);self.assertEqual(scene['metadata']['scaleProvenance'],provenance)
        self.assertEqual(scene['columns'][0]['height'],2800)
        scene,v=compile_pixel_scene(candidate,100,100,20,'project-a')
        self.assertEqual(scene['metadata']['scaleProvenance']['mode'],'manual')
        for change in ({'mode':'automatic'},{'confidence':.9},{'mmPerPixel':0},{'mmPerPixel':21},{'evidence':[]},{'evidence':[{}]},{'assumptions':['x'*1001]},{'anchors':[]},{'rangeMmPerPixel':[30,40]}):
            bad={**provenance,**change};self.assertTrue(validate_scale_provenance(bad,20,100,100)['errors'],change)
        for change in ({'p2':[0,0]},{'p2':[101,0]},{'lengthMm':-1},{'source':'object_prior'},{'lengthMm':2000}):
            bad={**provenance,'anchors':[{**provenance['anchors'][0],**change}]}
            self.assertTrue(validate_scale_provenance(bad,20,100,100)['errors'],change)
        estimated={'mode':'estimated','mmPerPixel':20,'rangeMmPerPixel':[16,24],'confidence':'low','evidence':['按可辨认家具尺度估算'],'assumptions':['参照物尺寸可能不同。']}
        self.assertFalse(validate_scale_provenance(estimated,20,100,100)['errors'])

    def test_invalid_primitive_returns_validation_instead_of_partial_scene(self):
        candidate=pixels();candidate['wallSegments']=[{'id':'wall-1','start':[10,10],'end':[20,10],'thickness':0,'kind':'e'}]
        scene,v=compile_pixel_scene(candidate,100,100,20,'project-a')
        self.assertEqual(scene,{})
        self.assertEqual(v['errors'][0]['code'],'invalid_primitive')
        self.assertEqual(candidate['wallSegments'][0]['thickness'],0)

    def test_optional_pixel_mapping_metadata_rejects_wrong_units(self):
        for key,value in (('sourcePixels',{}),('tracingPixels',[0,100]),('originPixels',['0',0])):
            scene=compiled();scene['metadata'][key]=value
            self.assertTrue(any(e['path']=='$.metadata.'+key for e in validate_scene(scene)['errors']))
        candidate=pixels();candidate['metadata']['tracingPixels']=[10,10]
        scene,v=compile_pixel_scene(candidate,100,100,20,'project-a')
        self.assertEqual(scene['metadata']['tracingPixels'],[100,100])

    def test_capture_landscape_frame_is_tight_and_independent_of_iframe(self):
        html=render_viewer_html(compiled(),None,'project-a',1)
        functions='\n'.join(re.search(r'function '+name+r'\([^)]*\)\{[\s\S]*?\n}',html)[0] for name in ('captureRenderedBounds','captureFrameForBounds'))
        three=(ROOT/'ai-lab/vendor/three/build/three.module.js').resolve().as_uri()
        script="import assert from 'node:assert/strict'; import * as THREE from "+json.dumps(three)+";\n"+functions+r"""
const architecture=new THREE.Group();
const material=new THREE.MeshBasicMaterial();
const room=new THREE.Mesh(new THREE.BoxGeometry(4,.02,3),material);room.position.set(22,0,-30);architecture.add(room);
const wall=new THREE.Mesh(new THREE.BoxGeometry(4,1.2,.2),material);wall.position.set(22,.6,-31.4);architecture.add(wall);
const hiddenCeiling=new THREE.Mesh(new THREE.BoxGeometry(1000,1000,1000),material);hiddenCeiling.position.set(10000,10000,10000);hiddenCeiling.visible=false;architecture.add(hiddenCeiling);
// The huge background/empty image bounds is deliberately outside the model groups.
const ground=new THREE.Mesh(new THREE.PlaneGeometry(10000,10000),material);
const bounds=captureRenderedBounds([architecture]);
assert.ok(bounds.max.x<25&&bounds.min.x>19&&bounds.max.y<1.21);
let expected;
for(const iframe of [[415,1280],[659,1280],[1600,900]]){
 const frame=captureFrameForBounds(bounds);
 assert.equal(frame.width,1280);assert.equal(frame.height,960);assert.equal(frame.aspect,4/3);
 assert.ok(Math.abs(frame.target[0]-22)<1e-6&&Math.abs(frame.target[2]+30)<1e-6);
 if(expected)assert.deepEqual(frame,expected);else expected=frame;
 const camera=new THREE.PerspectiveCamera(frame.fov,frame.aspect,frame.near,frame.far);
 camera.position.fromArray(frame.position);camera.lookAt(new THREE.Vector3(...frame.target));camera.updateMatrixWorld(true);
 let largest=0;
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
  const projected=new THREE.Vector3(x,y,z).project(camera);
  assert.ok(Math.abs(projected.x)<=.91&&Math.abs(projected.y)<=.91,'model must fit inside landscape frustum');
  largest=Math.max(largest,Math.abs(projected.x),Math.abs(projected.y));
 }
 assert.ok(largest>.85,'actual structure should fill the image rather than retain image whitespace');
}
"""
        result=subprocess.run(['node','--input-type=module'],input=script,text=True,encoding='utf-8',capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_capture_restores_renderer_wall_camera_controls_and_storage(self):
        html=render_viewer_html(compiled(),None,'project-a',1)
        functions='\n'.join(re.search(r'function '+name+r'\([^)]*\)\{[\s\S]*?\n}',html)[0] for name in ('captureRenderedBounds','captureFrameForBounds','disposeCaptureArchitecture','captureSceneDataUrl'))
        three=(ROOT/'ai-lab/vendor/three/build/three.module.js').resolve().as_uri()
        script="import assert from 'node:assert/strict'; import * as THREE from "+json.dumps(three)+";\n"+r"""
let active=false,grow=.3,furnGrow=.4,anim=null,fly=null,switching=false,failImage=false;
const H=2.8,opt={cut:2.8,furn:false,labels:true,night:true,hour:17,mode:'walk'};
const camera=new THREE.PerspectiveCamera(45,415/1280,.05,300);camera.position.set(5,8,9);camera.lookAt(0,0,0);
const orbit={enabled:true,target:new THREE.Vector3(0,0,0)};
let archFloor=new THREE.Group(),archUp=new THREE.Group(),lampG=new THREE.Group(),colliders=['original'],polyColliders=['original'];
const furnG=new THREE.Group();furnG.add(new THREE.Mesh(new THREE.BoxGeometry(.5,.9,.5),new THREE.MeshBasicMaterial()));furnG.visible=false;
const scene=new THREE.Scene();scene.add(archFloor,archUp,lampG,furnG);
const originalDoor={open:false,cur:.2,pivot:new THREE.Group()};const doors=[originalDoor];const selHelper={visible:true};
const matCache=new Map(),floorMats={},glassMat={},wallMat={},capMat={},frameMat={},edgeMat={},skirtMat={};
const sharedMaterial=new THREE.MeshBasicMaterial();matCache.set('shared',sharedMaterial);
const localStorage={setItem(){throw Error('storage mutation')}};
const records=[];let size=new THREE.Vector2(415,1280),pixelRatio=2,viewport=new THREE.Vector4(2,3,415,1280),lighting=true,disposed=0;
const renderer={
 domElement:{width:830,height:2560,toDataURL(type,quality){assert.equal(type,'image/jpeg');assert.equal(quality,.88);assert.equal(this.width,1280);assert.equal(this.height,960);if(failImage)throw Error('image failed');return 'data:image/jpeg;base64,actual-renderer-canvas'}},
 getSize(value){return value.copy(size)},getPixelRatio(){return pixelRatio},getViewport(value){return value.copy(viewport)},
 setPixelRatio(value){pixelRatio=value;this.domElement.width=size.x*value;this.domElement.height=size.y*value},
 setSize(width,height,updateStyle){assert.equal(updateStyle,false);size.set(width,height);viewport.set(0,0,width,height);this.domElement.width=width*pixelRatio;this.domElement.height=height*pixelRatio},
 setViewport(value){viewport.copy(value)},
 render(){records.push({size:size.toArray(),pixelRatio,aspect:camera.aspect,position:camera.position.toArray(),target:orbit.target.toArray(),cut:opt.cut,night:opt.night,visible:furnG.visible})}
};
function init(){} function sync(force){assert.equal(force,false);assert.equal(active,true)}
function applyGrow(){archUp.scale.y=Math.max(grow,.001);furnG.scale.y=Math.max(furnGrow,.001);lampG.visible=grow>.99}
function applyLight(){lighting=opt.night}
function buildArch(){
 assert.equal(opt.cut,1.2);assert.equal(opt.mode,'orbit');assert.equal(opt.night,false);
 doors.length=0;doors.push({open:true,cur:1,pivot:new THREE.Group()});colliders=['temporary'];polyColliders=['temporary'];
 const wall=new THREE.Mesh(new THREE.BoxGeometry(4,opt.cut,3),sharedMaterial);wall.position.y=opt.cut/2;archUp.add(wall);
 const floor=new THREE.Mesh(new THREE.BoxGeometry(4,.02,3),sharedMaterial);archFloor.add(floor);
 const light=new THREE.Mesh(new THREE.BoxGeometry(.2,.02,.2),new THREE.MeshBasicMaterial());lampG.add(light);
 for(const mesh of [wall,floor,light])mesh.geometry.addEventListener('dispose',()=>disposed++);
 applyLight();applyGrow();
}
applyGrow();
"""+functions+r"""
let expectedCamera;
for(const iframeSize of [[415,1280],[1600,900]]){
 size.fromArray(iframeSize);pixelRatio=2;viewport.set(2,3,...iframeSize);renderer.domElement.width=size.x*2;renderer.domElement.height=size.y*2;
 camera.aspect=size.x/size.y;camera.updateProjectionMatrix();
 const oldCamera=camera.clone(),oldTarget=orbit.target.clone(),oldViewport=viewport.clone(),oldOptions={...opt},oldFloor=archFloor,oldUp=archUp,oldLamp=lampG,oldColliders=colliders,oldPoly=polyColliders;oldCamera.uuid=camera.uuid;
 const beforeCount=records.length;
 assert.equal(captureSceneDataUrl(),'data:image/jpeg;base64,actual-renderer-canvas');
 const captured=records[beforeCount];assert.deepEqual(captured.size,[1280,960]);assert.equal(captured.pixelRatio,1);assert.equal(captured.aspect,4/3);assert.equal(captured.cut,1.2);assert.equal(captured.night,false);assert.equal(captured.visible,true);
 if(expectedCamera)assert.deepEqual(captured.position,expectedCamera);else expectedCamera=captured.position;
 assert.deepEqual(size.toArray(),iframeSize);assert.equal(pixelRatio,2);assert.deepEqual(viewport.toArray(),oldViewport.toArray());
 assert.deepEqual(camera.toJSON(),oldCamera.toJSON());assert.deepEqual(camera.quaternion.toArray(),oldCamera.quaternion.toArray());assert.deepEqual(camera.projectionMatrix.toArray(),oldCamera.projectionMatrix.toArray());assert.deepEqual(orbit.target.toArray(),oldTarget.toArray());assert.equal(orbit.enabled,true);
 assert.equal(archFloor,oldFloor);assert.equal(archUp,oldUp);assert.equal(lampG,oldLamp);assert.equal(colliders,oldColliders);assert.equal(polyColliders,oldPoly);assert.equal(doors[0],originalDoor);assert.equal(doors[0].open,false);assert.equal(doors[0].cur,.2);
 assert.deepEqual(opt,oldOptions);assert.equal(active,false);assert.equal(grow,.3);assert.equal(furnGrow,.4);assert.equal(furnG.visible,false);assert.equal(selHelper.visible,true);assert.equal(lighting,true);
}
active=true;const oldCamera=camera.clone();oldCamera.uuid=camera.uuid;failImage=true;assert.throws(()=>captureSceneDataUrl(),/image failed/);assert.deepEqual(camera.toJSON(),oldCamera.toJSON());assert.equal(active,true);assert.equal(opt.cut,2.8);assert.equal(doors[0],originalDoor);assert.equal(scene.children.length,4);assert.equal(disposed,9);
anim={};assert.throws(()=>captureSceneDataUrl(),/capture_busy/);
"""
        result=subprocess.run(['node','--input-type=module'],input=script,text=True,encoding='utf-8',capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_overlay_mapping_and_capture_size_are_single_transform(self):
        html=render_viewer_html(compiled(),None,'project-a',1)
        functions=[]
        for name in ('sourceOverlayMapping','captureCanvasSize'):
            match=re.search(r'function '+name+r'\([^)]*\)\{[\s\S]*?\n}',html)
            self.assertIsNotNone(match,name);functions.append(match[0])
        script="const assert=require('node:assert/strict'); const FLOORPLAN_CASE={metadata:{sourcePixels:[2000,1295],tracingPixels:[1976,1279],originPixels:[325,290],mmPerPixel:25}};\n"+'\n'.join(functions)+"\nassert.deepEqual(sourceOverlayMapping(),{x:-8125,y:-7250,width:49400,height:31975});assert.deepEqual(captureCanvasSize(3200,1600),{width:1280,height:640});assert.deepEqual(captureCanvasSize(500,1000),{width:500,height:1000});FLOORPLAN_CASE.metadata.originPixels=[0,0];FLOORPLAN_CASE.metadata.sourcePixels=[100,100];delete FLOORPLAN_CASE.metadata.tracingPixels;FLOORPLAN_CASE.metadata.mmPerPixel=20;assert.deepEqual(sourceOverlayMapping(),{x:0,y:0,width:2000,height:2000});"
        result=subprocess.run(['node'],input=script,text=True,encoding='utf-8',capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_overlay_url_is_server_bound(self):
        scene=compiled()
        html=render_viewer_html(scene,None,'project-a',1,'/api/ai-lab/v1/assets/'+'b'*32)
        context=json.loads(re.search(r'id="ai-lab-payload" type="application/json">(.*?)</script>',html,re.S)[1])['context']
        self.assertEqual(context['sourceAssetUrl'],'/api/ai-lab/v1/assets/'+'b'*32)
        for url in ('https://example.com/image.png','//example.com/x','data:image/png;base64,AA==','/viewer-assets/../../private'):
            with self.assertRaises(ValueError):render_viewer_html(scene,None,'project-a',1,url)
        self.assertIn("clone.querySelector('#gSource')?.remove()",html)

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
