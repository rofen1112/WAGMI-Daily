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
        functions='\n'.join(re.search(r'function '+name+r'\([^)]*\)\{[\s\S]*?\n}',html)[0] for name in ('captureRenderedBounds','captureFrameForBounds','interactiveGeometryFrame'))
        three=(ROOT/'ai-lab/vendor/three/build/three.module.js').resolve().as_uri()
        script="import assert from 'node:assert/strict'; import * as THREE from "+json.dumps(three)+";\n"+functions+r"""
const FOV=45;
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

// Interactive framing uses actual mesh vertices and the UI's safe viewport,
// including a circular office footprint whose world AABB has empty corners.
const office=new THREE.Group(),floor=new THREE.Mesh(new THREE.CircleGeometry(18,96),material);floor.rotation.x=-Math.PI/2;office.add(floor);
const core=new THREE.Mesh(new THREE.BoxGeometry(4,1.2,8),material);core.position.y=.6;office.add(core);
for(const [width,height] of [[1013,774],[415,900],[1600,900]])for(const direction of [[.68,1.18,.78],[0,1,.0001]]){
 const frame=interactiveGeometryFrame([office],width,height,direction),camera=new THREE.PerspectiveCamera(FOV,width/height,.01,1000);
 camera.position.fromArray(frame.position);camera.lookAt(new THREE.Vector3(...frame.target));camera.updateMatrixWorld(true);
 let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
 office.traverseVisible(object=>{const position=object.geometry?.getAttribute('position');if(!position)return;for(let i=0;i<position.count;i++){
  const point=new THREE.Vector3().fromBufferAttribute(position,i).applyMatrix4(object.matrixWorld).project(camera);
  const x=(point.x+1)*width/2,y=(1-point.y)*height/2;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
 }});
 const safe=frame.safeRect;
 assert.ok(left>=safe.left-.001&&right<=safe.right+.001&&top>=safe.top-.001&&bottom<=safe.bottom+.001,'interactive model must stay within floating-tool safe area');
 const occupancy=Math.max((right-left)/(safe.right-safe.left),(bottom-top)/(safe.bottom-safe.top));
 assert.ok(occupancy>.96,'one projected axis must fill the safe viewport instead of retaining AABB whitespace');
}
"""
        result=subprocess.run(['node','--input-type=module'],input=script,text=True,encoding='utf-8',capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_capture_restores_renderer_wall_camera_controls_and_storage(self):
        html=render_viewer_html(compiled(),None,'project-a',1)
        functions='\n'.join(re.search(r'function '+name+r'\([^)]*\)\{[\s\S]*?\n}',html)[0] for name in ('captureRenderedBounds','captureFrameForBounds','disposeCaptureArchitecture','captureSceneDataUrl'))
        three=(ROOT/'ai-lab/vendor/three/build/three.module.js').resolve().as_uri()
        script="import assert from 'node:assert/strict'; import * as THREE from "+json.dumps(three)+";\n"+r"""
let active=false,grow=.3,furnGrow=.4,anim=null,fly=null,switching=false,failImage=false,reviewBackdrop=false;
const H=2.8,opt={cut:2.8,furn:false,labels:true,night:true,hour:17,mode:'walk',lighting:'studio'};
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
 render(){records.push({size:size.toArray(),pixelRatio,aspect:camera.aspect,position:camera.position.toArray(),target:orbit.target.toArray(),cut:opt.cut,night:opt.night,lighting:opt.lighting,reviewBackdrop,visible:furnG.visible})}
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
 const captured=records[beforeCount];assert.deepEqual(captured.size,[1280,960]);assert.equal(captured.pixelRatio,1);assert.equal(captured.aspect,4/3);assert.equal(captured.cut,1.2);assert.equal(captured.night,false);assert.equal(captured.lighting,'daylight');assert.equal(captured.reviewBackdrop,true);assert.equal(captured.visible,true);
 if(expectedCamera)assert.deepEqual(captured.position,expectedCamera);else expectedCamera=captured.position;
 assert.deepEqual(size.toArray(),iframeSize);assert.equal(pixelRatio,2);assert.deepEqual(viewport.toArray(),oldViewport.toArray());
 assert.deepEqual(camera.toJSON(),oldCamera.toJSON());assert.deepEqual(camera.quaternion.toArray(),oldCamera.quaternion.toArray());assert.deepEqual(camera.projectionMatrix.toArray(),oldCamera.projectionMatrix.toArray());assert.deepEqual(orbit.target.toArray(),oldTarget.toArray());assert.equal(orbit.enabled,true);
 assert.equal(archFloor,oldFloor);assert.equal(archUp,oldUp);assert.equal(lampG,oldLamp);assert.equal(colliders,oldColliders);assert.equal(polyColliders,oldPoly);assert.equal(doors[0],originalDoor);assert.equal(doors[0].open,false);assert.equal(doors[0].cur,.2);
 assert.deepEqual(opt,oldOptions);assert.equal(reviewBackdrop,false);assert.equal(active,false);assert.equal(grow,.3);assert.equal(furnGrow,.4);assert.equal(furnG.visible,false);assert.equal(selHelper.visible,true);assert.equal(lighting,true);
}
active=true;const oldCamera=camera.clone();oldCamera.uuid=camera.uuid;failImage=true;assert.throws(()=>captureSceneDataUrl(),/image failed/);assert.deepEqual(camera.toJSON(),oldCamera.toJSON());assert.equal(active,true);assert.equal(opt.cut,2.8);assert.equal(opt.lighting,'studio');assert.equal(reviewBackdrop,false);assert.equal(doors[0],originalDoor);assert.equal(scene.children.length,4);assert.equal(disposed,9);
anim={};assert.throws(()=>captureSceneDataUrl(),/capture_busy/);
"""
        result=subprocess.run(['node','--input-type=module'],input=script,text=True,encoding='utf-8',capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_editor_drawers_are_real_left_docks_and_do_not_touch_saved_layout(self):
        html=render_viewer_html(compiled(),None,'project-a',1)
        self.assertIn('layers:{dims:true, labels:true',html)  # Keep 2D room labels.
        self.assertRegex(html,r'const opt = \{[^\n]*labels:false')
        self.assertIn('class="btn chip" data-t="labels" aria-pressed="false"',html)
        # The iframe suppresses only its duplicate heading, keeping scale evidence available.
        self.assertIn('.editor-topbar .brand{display:none!important}',html)
        self.assertIn('function scaleProvenancePanel()',html)
        self.assertIn('比例来源',html)
        self.assertNotIn('gradient(',html)
        controls=[('data-tool','select'),('data-tool','measure'),('data-tool','demolish'),('data-mode','orbit'),('data-mode','walk'),('data-cut','2.8'),('data-cut','1.2')]
        controls.extend(('id',name) for name in ('undo','redo','fit','zoomIn','zoomOut','vIso','vTop','fullscreen'))
        for attribute,value in controls:
            button=re.search(r'<button\b(?=[^>]*\b'+attribute+'="'+re.escape(value)+r'")[^>]*>[\s\S]*?</button>',html)[0]
            self.assertIn('<svg class="ui-icon"',button)
            self.assertRegex(button,r'aria-label="[^"]+"')
            self.assertRegex(button,r'title="[^"]+"')
            self.assertNotRegex(button,r'[↖↔↶↷＋−▥]')
        functions='\n'.join(re.search(r'function '+name+r'\([^)]*\)\{[\s\S]*?\n}',html)[0] for name in ('drawer','syncPaneBtns','syncLabDock','closeDrawers'))
        script=r"""
const assert=require('node:assert/strict');
function element(){const classes=new Set();return {inert:false,attrs:{},classList:{contains:key=>classes.has(key),toggle(key,on){if(on===undefined)on=!classes.has(key);on?classes.add(key):classes.delete(key)},remove:key=>classes.delete(key)},setAttribute(key,value){this.attrs[key]=value}}}
const dom=Object.fromEntries(['aside.lib','aside.right','#tgLib','#tgPanel','#stage','.app'].map(key=>[key,element()]));
const $=key=>dom[key],tr=zh=>zh;function publishLabViewState(){}
const document={body:element()};document.body.classList.toggle('external-controls',true);
let labDockFitFrame=0,nextFrame,fitCount=0,switching=false,labCapturePending=false,walking=false;const window={View3D:{walking:()=>walking}};
const requestAnimationFrame=callback=>{nextFrame=callback;return 1},cancelAnimationFrame=()=>{};function fitCanvas(){fitCount++}
const localStorage={getItem(){throw Error('must not read saved layout for a transient drawer')},setItem(){throw Error('must not overwrite saved layout')}};
"""+functions+r"""
drawer(null);assert.equal(dom['aside.lib'].inert,true);assert.equal(dom['aside.right'].inert,true);
drawer('lib');assert.equal(dom['.app'].classList.contains('has-left-dock'),true);nextFrame();assert.equal(fitCount,1);closeDrawers();assert.equal(dom['aside.lib'].inert,false);assert.equal(dom['aside.lib'].inert,false);assert.equal(dom['#tgLib'].attrs['aria-expanded'],'true');
drawer('panel');assert.equal(dom['aside.lib'].inert,true);assert.equal(dom['aside.right'].inert,false);
drawer('panel',false);assert.equal(dom['.app'].classList.contains('has-left-dock'),false);nextFrame();assert.equal(fitCount,2);assert.equal(dom['aside.right'].inert,true);assert.equal(dom['#tgPanel'].attrs['aria-expanded'],'false');
"""
        result=subprocess.run(['node'],input=script,text=True,encoding='utf-8',capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_studio_and_daylight_presets_change_real_lighting_only(self):
        html=render_viewer_html(compiled(),None,'project-a',1)
        light='\n'.join(re.search(r'function '+name+r'\([^)]*\)\{[\s\S]*?\n}',html)[0] for name in ('applyLight','setLightingPreset','setSunHour'))
        three=(ROOT/'ai-lab/vendor/three/build/three.module.js').resolve().as_uri()
        script="import assert from 'node:assert/strict'; import * as THREE from "+json.dumps(three)+";\n"+r"""
const opt={lighting:'studio',night:false,hour:10},sun=new THREE.DirectionalLight(),hemi=new THREE.HemisphereLight();
const scene=new THREE.Scene(),groundReviewMaterial=new THREE.MeshStandardMaterial(),groundShadowMaterial=new THREE.ShadowMaterial({opacity:.14}),ground=new THREE.Mesh(new THREE.PlaneGeometry(1,1),groundShadowMaterial);
let reviewBackdrop=false;
const lampG=new THREE.Group(),renderer={toneMappingExposure:0},matCache=new Map(),time={textContent:''};
const material=new THREE.MeshStandardMaterial();material.envMap={};material.userData.env=1;matCache.set('metal',material);
let envK=1,inited=true;const changes=[];const button=()=>({attrs:{},classList:{toggle(){},remove(){}},setAttribute(key,value){this.attrs[key]=value}}),nightButton=button(),presetButtons=['studio','daylight'].map(light=>({...button(),dataset:{light}}));
const document={querySelectorAll:()=>presetButtons},$=selector=>selector==='#sunT'?time:nightButton;function publishLabViewState(){changes.push({lighting:opt.lighting,night:opt.night,mode:opt.mode})}
const localStorage={setItem(){throw Error('view preset cannot save layout')}};
"""+light+r"""
applyLight();const studioIntensity=hemi.intensity;assert.equal(scene.background.getHex(),0xffffff);assert.equal(sun.shadow.radius,4);assert.equal(material.envMapIntensity,.85);
opt.lighting='daylight';applyLight();assert.equal(scene.background.getHex(),0xffffff);assert.equal(ground.material,groundShadowMaterial);assert.ok(hemi.intensity<studioIntensity);assert.equal(material.envMapIntensity,1);assert.equal(sun.shadow.radius,2);
opt.night=true;applyLight();assert.equal(scene.background.getHex(),0xffffff);assert.equal(renderer.toneMappingExposure,1.25);
opt.night=false;opt.lighting='studio';applyLight();assert.equal(scene.background.getHex(),0xffffff);assert.equal(hemi.intensity,studioIntensity);assert.equal(time.textContent,'10:00');
reviewBackdrop=true;opt.lighting='daylight';applyLight();assert.equal(scene.background.getHex(),0xf7f4ee);assert.equal(ground.material,groundReviewMaterial);assert.equal(groundReviewMaterial.color.getHex(),0xf2eee7);
reviewBackdrop=false;applyLight();assert.equal(scene.background.getHex(),0xffffff);assert.equal(ground.material,groundShadowMaterial);
const camera=new THREE.PerspectiveCamera();camera.position.set(2,3,4);const cameraBefore=camera.toJSON(),ui={sel:{kind:'furn',id:'f1'}},state={furniture:[{id:'f1',cx:100,w:500}],rooms:{r1:{mat:'wood'}}},stateBefore=JSON.stringify(state),selectionBefore={...ui.sel};
opt.mode='walk';opt.cut=2.8;opt.night=true;assert.equal(setLightingPreset('studio'),true);assert.equal(opt.night,false);assert.equal(opt.lighting,'studio');assert.equal(opt.mode,'walk');assert.equal(opt.cut,2.8);assert.deepEqual(camera.toJSON(),cameraBefore);assert.deepEqual(ui.sel,selectionBefore);assert.equal(JSON.stringify(state),stateBefore);
assert.equal(setSunHour(14.5),true);assert.equal(opt.lighting,'daylight');assert.equal(opt.hour,14.5);assert.equal(opt.mode,'walk');assert.deepEqual(camera.toJSON(),cameraBefore);assert.equal(JSON.stringify(state),stateBefore);assert.ok(changes.every(change=>change.mode==='walk'));assert.equal(changes.length,2);
const unchanged={...opt};assert.equal(setLightingPreset('hdr'),false);assert.equal(setLightingPreset(['studio']),false);assert.equal(setSunHour(Infinity),false);assert.equal(setSunHour(22),false);assert.deepEqual(opt,unchanged);assert.equal(changes.length,2);
"""
        result=subprocess.run(['node','--input-type=module'],input=script,text=True,encoding='utf-8',capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_linear_profile_keeps_legacy_capture_and_restores_after_failure(self):
        html=render_viewer_html(compiled(),None,'project-a',1)
        self.assertIn('id="plan" data-plan-profile="linear"',html)
        self.assertIn('#plan[data-plan-profile="linear"] #gRooms polygon{fill:#fff}',html)
        self.assertIn('#plan[data-plan-profile="linear"] #gFurn [stroke]{stroke:#737373}',html)
        self.assertIn('#plan[data-plan-profile="linear"] #gFurn text{display:none;',html)
        self.assertIn('${furnSVG(f.type,f.w,f.d,f.color,f)}${label}',html)  # Keep original labels for review/profile restoration.
        self.assertIn("const clone=withLegacyPlanProfile(()=>svg.cloneNode(true))",html)
        self.assertIn("fill=\"url(#m-${esc(state.rooms[r.id].mat)})\"",html)  # Original review paint still exists.
        function=re.search(r'function withLegacyPlanProfile\([^)]*\)\{[\s\S]*?\n}',html)[0]
        script=r"""
const assert=require('node:assert/strict');
const attrs=new Map([['data-plan-profile','linear']]);
const svg={getAttribute:key=>attrs.get(key)??null,removeAttribute:key=>attrs.delete(key),setAttribute:(key,value)=>attrs.set(key,value),cloneNode:()=>new Map(attrs)};
const localStorage={setItem(){throw Error('presentation must not save editor state')}};
"""+function+r"""
const clone=withLegacyPlanProfile(()=>svg.cloneNode(true));assert.equal(clone.has('data-plan-profile'),false);assert.equal(attrs.get('data-plan-profile'),'linear');
assert.throws(()=>withLegacyPlanProfile(()=>{assert.equal(attrs.has('data-plan-profile'),false);throw Error('clone failed')}),/clone failed/);
assert.equal(attrs.get('data-plan-profile'),'linear');attrs.delete('data-plan-profile');withLegacyPlanProfile(()=>{});assert.equal(attrs.has('data-plan-profile'),false);
"""
        result=subprocess.run(['node'],input=script,text=True,encoding='utf-8',capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_command_bridge_requires_same_origin_scope_and_allowlisted_parameters(self):
        html=render_viewer_html(compiled(),None,'project-a',7)
        names=('drawer','syncPaneBtns','syncLabDock','labViewState','labViewMessage','publishLabViewState','validateLabCommand','executeLabCommand','handleLabMessage')
        functions='\n'.join(re.search(r'(?:async )?function '+name+r'\([^)]*\)\{[\s\S]*?\n}',html)[0] for name in names)
        script=r"""
const assert=require('node:assert/strict');
const messages=[],actions=[];const parent={postMessage(message,origin){assert.equal(origin,'http://localhost:5186');messages.push(message)}};
const window={parent,location:{origin:'http://localhost:5186'},View3D:{flyToRoom:id=>actions.push(['room',id]),navigation:()=>navigation,walking:()=>navigation==='walk',lighting:()=>lighting,night:()=>night,setLighting(preset){lighting=preset;night=false;actions.push(['lighting',preset]);return true},setNavigation(mode){navigation=mode;actions.push(['navigation',mode]);return true}}};
const AI_LAB={context:{projectId:'project-a',version:7}},ROOMS=[{id:'r1'}],ui={sel:null},state={furniture:[],rooms:{r1:{name:'room',mat:'wood'}},demolished:[],measures:[]};
let viewMode='2d',navigation='orbit',lighting='studio',night=false,switching=false,labCapturePending=false,labBridgeReady=true,labDockFitFrame=0;
function element(action){const classes=new Set();return {inert:false,attrs:{},classList:{contains:key=>classes.has(key),toggle(key,on){if(on===undefined)on=!classes.has(key);on?classes.add(key):classes.delete(key)},remove:key=>classes.delete(key)},setAttribute(key,value){this.attrs[key]=value},click(){actions.push([action])}}}
const dom=Object.fromEntries(['aside.lib','aside.right','#tgLib','#tgPanel','#stage','#vTop','#vIso','#fileIn','.app'].map(key=>[key,element(key)]));
const $=key=>dom[key],tr=zh=>zh;const document={body:element()};document.body.classList.toggle('external-controls',true);
const requestAnimationFrame=()=>1,cancelAnimationFrame=()=>{};
async function setView(mode){actions.push(['mode',mode]);viewMode=mode}
function fitCanvas(){actions.push(['fit'])}
async function captureLabViews(){actions.push(['capture']);return {planDataUrl:'data:image/png;base64,plan',sceneDataUrl:'data:image/jpeg;base64,scene'}}
const localStorage={setItem(){throw Error('commands cannot directly mutate persisted editor state')}};
"""+functions+r"""
const base={type:'ai-lab:command',requestId:'req-1',projectId:'project-a',projectVersion:7};
async function command(fields,origin=window.location.origin,source=parent){await handleLabMessage({source,origin,data:{...base,...fields}})}
(async()=>{
 await command({command:'fit'},'https://other.example');await command({command:'fit'},window.location.origin,{});assert.equal(messages.length,0);assert.equal(actions.length,0);
 await command({command:'set-view-mode',mode:'3d'});assert.equal(viewMode,'3d');assert.equal(messages.at(-1).requestId,'req-1');assert.equal(messages.at(-1).projectId,'project-a');assert.equal(messages.at(-1).projectVersion,7);assert.equal(messages.at(-1).viewState.mode,'3d');
 await command({command:'open-panel',panel:'library',action:'open'});assert.equal(messages.at(-1).viewState.panes.library,true);assert.equal(dom['aside.lib'].inert,false);
 await command({command:'open-panel',panel:'panel',action:'toggle'});assert.equal(messages.at(-1).viewState.panes.library,false);assert.equal(messages.at(-1).viewState.panes.panel,true);
 await command({command:'open-panel',panel:'panel',action:'close'});assert.equal(messages.at(-1).viewState.panes.panel,false);
 await command({command:'set-camera',preset:'top'});assert.ok(actions.some(action=>action[0]==='#vTop'));
 await command({command:'focus-room',roomId:'r1'});assert.ok(actions.some(action=>action[0]==='room'&&action[1]==='r1'));
 await command({command:'import-state'});assert.ok(actions.some(action=>action[0]==='#fileIn'));
 await command({command:'set-navigation',mode:'walk'});assert.equal(messages.at(-1).viewState.navigation,'walk');
 await command({command:'set-lighting',preset:'daylight'});assert.equal(messages.at(-1).error,undefined);assert.equal(messages.at(-1).viewState.navigation,'walk');assert.equal(messages.at(-1).viewState.lighting,'daylight');assert.equal(messages.at(-1).viewState.night,false);assert.deepEqual(messages.at(-1).viewState.panes,{library:false,panel:false});
 await command({command:'open-panel',panel:'library',action:'open'});assert.equal(messages.at(-1).error.code,'view_busy');
 await command({command:'set-navigation',mode:'orbit'});assert.equal(messages.at(-1).viewState.navigation,'orbit');
 const actionCount=actions.length;
 for(const invalid of [{command:'eval',code:'globalThis.attacked=true'},{command:'__proto__'},{command:['fit']},{command:{name:'fit'}},{command:'set-view-mode',mode:'4d'},{command:'set-navigation',mode:'fly'},{command:'set-lighting',preset:'hdr'},{command:'set-lighting',preset:['studio']},{command:'set-lighting',preset:'studio',camera:{x:1}},{command:'set-camera',preset:'front'},{command:'open-panel',panel:'html',action:'open'},{command:'focus-room',roomId:'missing'},{command:'fit',code:'arbitrary'},{command:'fit',mode:'3d'}]){
  await command(invalid);assert.equal(messages.at(-1).error.code,'invalid_command');assert.equal(actions.length,actionCount);
 }
 await command({command:'fit',projectVersion:6});assert.equal(messages.at(-1).error.code,'stale_context');
 await command({command:'fit',projectId:'other-project'});assert.equal(messages.at(-1).error.code,'stale_context');assert.equal(actions.length,actionCount);
 labCapturePending=true;await command({command:'fit'});assert.equal(messages.at(-1).error.code,'view_busy');assert.equal(messages.at(-1).viewState.busy,true);assert.equal(actions.length,actionCount);await command({command:'set-lighting',preset:'studio'});assert.equal(messages.at(-1).error.code,'view_busy');assert.equal(actions.length,actionCount);labCapturePending=false;
 await command({command:'fit'});assert.equal(actions.at(-1)[0],'fit');
 const ready=labViewMessage('ai-lab:ready');assert.equal(ready.requestId,null);assert.equal(ready.projectId,'project-a');assert.equal(ready.projectVersion,7);assert.equal(ready.viewState.busy,false);
 await handleLabMessage({source:parent,origin:window.location.origin,data:{type:'ai-lab:get-state',requestId:'old-state'}});assert.equal(messages.at(-1).type,'ai-lab:state');assert.deepEqual(messages.at(-1).state,state);assert.equal(messages.at(-1).projectVersion,7);
 await handleLabMessage({source:parent,origin:window.location.origin,data:{type:'ai-lab:capture',requestId:'old-capture'}});assert.equal(messages.at(-1).type,'ai-lab:captures');assert.equal(messages.at(-1).sceneDataUrl,'data:image/jpeg;base64,scene');assert.equal(messages.at(-1).projectVersion,7);
})().catch(error=>{console.error(error);process.exitCode=1});
"""
        result=subprocess.run(['node'],input=script,text=True,encoding='utf-8',capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_embedded_controls_flag_is_presentation_only_and_explicit(self):
        scene=compiled();before=deepcopy(scene)
        for flag in (True,False):
            html=render_viewer_html(scene,None,'project-a',1,embedded_controls=flag)
            payload=json.loads(re.search(r'id="ai-lab-payload" type="application/json">(.*?)</script>',html,re.S)[1])
            self.assertEqual(payload['context']['embeddedControls'],flag)
            self.assertEqual(scene,before)
            self.assertIn('AI_LAB.context.embeddedControls !== false && window.parent !== window',html)
            self.assertIn('body.external-controls #viewSeg{display:none}',html)
        for invalid in ('yes',0,None):
            with self.assertRaises(ValueError):render_viewer_html(scene,None,'project-a',1,embedded_controls=invalid)

    def test_immersive_navigation_restores_cut_camera_selection_and_keeps_state(self):
        html=render_viewer_html(compiled(),None,'project-a',1)
        self.assertIn('body.external-controls .app>main{position:relative;inset:auto;grid-column:2',html)
        self.assertIn('body.external-controls .app.has-left-dock{--lab-dock-width:min(280px,42vw)}',html)
        self.assertRegex(html,r'body\.external-controls #paneBtns[^{}]*\{display:none!important\}')
        self.assertIn('body.external-controls.lab-walking #stage> :not(#view3d)',html)
        names=('resize3DViewport','clearWalkInput','touchMovement','setMode')
        functions='\n'.join(re.search(r'function '+name+r'\([^)]*\)\{[\s\S]*?\n}',html)[0] for name in names)
        three=(ROOT/'ai-lab/vendor/three/build/three.module.js').resolve().as_uri()
        script="import assert from 'node:assert/strict'; import * as THREE from "+json.dumps(three)+";\n"+r"""
const classes=new Set(['external-controls']),document={body:{classList:{contains:key=>classes.has(key),toggle(key,on){on?classes.add(key):classes.delete(key)},remove:key=>classes.delete(key)}},activeElement:{blur(){}}};
const ui={sel:{kind:'furn',id:'f1'}},state={furniture:[{id:'f1',cx:10,cy:20,w:800,d:600,rot:0}],rooms:{r1:{mat:'wood'}}},beforeState=JSON.stringify(state);
const opt={mode:'orbit',cut:1.2,labels:true},camera=new THREE.PerspectiveCamera(45,900/700,.05,300);camera.position.set(5,8,9);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
const orbit={target:new THREE.Vector3(1,0,2),enabled:true},sizes=[],renderer={setSize:(w,h)=>sizes.push([w,h]),domElement:{focus(){}}},labelRenderer={setSize(){}};
let inited=true,active=true,anim=null,fly={},walkReturnState=null,labDockFitFrame=1,resetCount=0,finishCount=0,touchWalk=false;
const resetWalkLook=()=>resetCount++,keys={KeyW:true},joy={x:.7,y:.5,id:4},H=2.8;
const SW=()=>classes.has('lab-walking')?1200:900,SH=()=>700,ROOMS=[{id:'r1',at:[2000,2000],poly:[[0,0],[4000,0],[4000,4000]]}],FLOORPLAN_CASE={walkStart:[1800,1800],walkLook:[2800,1800]},wx=value=>value/1000,wz=value=>value/1000;
const elements=Object.fromEntries(['#walkOverlay','#cross'].map(key=>[key,{style:{display:''}}])), $=key=>elements[key];
const walkCtl={unlock(){}},archUp=new THREE.Group();const edge=new THREE.Object3D();edge.userData.walkOnly=true;archUp.add(edge);
const messages=[];const window={select(value){ui.sel=value}};
function closeOperationHelp(){}function finishViewInteraction(){finishCount++}function cancelAnimationFrame(){}function syncCutBtns(){}function syncModeBtns(){}function syncHint3d(){}function sync(){}function showLabels(value){edge.userData.labels=value}
function startTouchWalk(){touchWalk=true}function stopTouchWalk(){touchWalk=false}function publishLabViewState(){messages.push({mode:opt.mode,walking:classes.has('lab-walking')})}
function flyTo(){throw Error('restored navigation must retain previous camera, not replace it with iso')}
const localStorage={setItem(){throw Error('navigation cannot write saved state')}};
"""+functions+r"""
const oldCamera=camera.clone(),oldTarget=orbit.target.clone(),oldSelection={...ui.sel};oldCamera.uuid=camera.uuid;
assert.equal(setMode('walk'),true);assert.equal(opt.mode,'walk');assert.equal(opt.cut,H);assert.equal(classes.has('lab-walking'),true);assert.equal(orbit.enabled,false);assert.equal(touchWalk,true);assert.equal(camera.position.y,1.6);assert.deepEqual(Object.keys(keys),[]);assert.equal(joy.id,null);assert.equal(ui.sel,null);assert.deepEqual(sizes.at(-1),[1200,700]);
assert.equal(setMode('orbit'),true);assert.equal(opt.mode,'orbit');assert.equal(opt.cut,1.2);assert.equal(classes.has('lab-walking'),false);assert.equal(orbit.enabled,true);assert.equal(touchWalk,false);assert.deepEqual(ui.sel,oldSelection);assert.deepEqual(camera.toJSON(),oldCamera.toJSON());assert.deepEqual(orbit.target.toArray(),oldTarget.toArray());assert.deepEqual(sizes.at(-1),[900,700]);assert.equal(JSON.stringify(state),beforeState);assert.equal(edge.visible,false);assert.equal(finishCount,2);assert.ok(resetCount>=2);assert.deepEqual(messages.at(-1),{mode:'orbit',walking:false});
assert.equal(setMode('fly'),false);assert.equal(opt.mode,'orbit');
assert.deepEqual(touchMovement(0,0),{x:0,y:0});const diagonal=touchMovement(200,-200);assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.y)-1)<1e-9);assert.ok(diagonal.x>0&&diagonal.y<0);
"""
        result=subprocess.run(['node','--input-type=module'],input=script,text=True,encoding='utf-8',capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_view_switch_finishes_pointer_gestures_before_hidden_editors(self):
        html=render_viewer_html(compiled(),None,'project-a',1)
        function=re.search(r'function finishViewInteraction\([^)]*\)\{[\s\S]*?\n}',html)[0]
        self.assertIn("if(is3D())return;\n  if (touches",html)
        self.assertIn("if (!fdrag || e.pointerId !== fdrag.pid || opt.mode!=='orbit') return;",html)
        self.assertIn("finishViewInteraction();clearWalkInput();",html)
        script=r"""
const assert=require('node:assert/strict');let drag={moved:true},pinch={},libDrag={id:7,el:{hasPointerCapture:()=>true,releasePointerCapture:id=>released.push(id)}},commits=0,finished3d=0;
const touches=new Map([[1,{}],[2,{}]]),planPointerIds=new Set([1,2]),released=[],svg={hasPointerCapture:()=>true,releasePointerCapture:id=>released.push(id)};
function endDrag(cancel){assert.equal(cancel,true);if(drag?.moved)commits++;drag=null}function endLibDrag(event,ok){assert.equal(event.pointerId,7);assert.equal(ok,false);libDrag=null}
const window={View3D:{finishDrag(){finished3d++}}};
"""+function+r"""
finishViewInteraction();assert.equal(drag,null);assert.equal(pinch,null);assert.equal(touches.size,0);assert.equal(planPointerIds.size,0);assert.equal(libDrag,null);assert.equal(commits,1);assert.equal(finished3d,1);assert.deepEqual(released,[1,2,7]);
finishViewInteraction();assert.equal(commits,1);
"""
        result=subprocess.run(['node'],input=script,text=True,encoding='utf-8',capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_dock_resize_fit_is_centered_for_both_observer_orders(self):
        html=render_viewer_html(compiled(),None,'project-a',1)
        functions='\n'.join(re.search(r'function '+name+r'\([^)]*\)\{[\s\S]*?\n}',html)[0] for name in ('fitView','resizePlanViewport'))
        script=r"""
const assert=require('node:assert/strict'),BOUNDS={x:-500,y:100,w:12000,h:9000};
const svg={clientWidth:334,clientHeight:600};let view={x0:0,y0:0,s:.06},lastW=0,lastH=0,applied=0;function applyView(){applied++}
"""+functions+r"""
for(const order of ['fit-first','observer-first']){
 svg.clientWidth=334;svg.clientHeight=600;lastW=lastH=0;fitView();
 svg.clientWidth=185;
 if(order==='fit-first'){
  fitView();const fitted={...view},count=applied;resizePlanViewport();assert.deepEqual(view,fitted);assert.equal(applied,count,'observer must not shift a viewport already fitted at the same size');
 }else{resizePlanViewport();fitView();const fitted={...view};resizePlanViewport();assert.deepEqual(view,fitted)}
 assert.equal(lastW,185);assert.equal(lastH,600);
 assert.ok(Math.abs(view.x0+svg.clientWidth/(2*view.s)-(BOUNDS.x+BOUNDS.w/2))<1e-7);
 assert.ok(Math.abs(view.y0+svg.clientHeight/(2*view.s)-(BOUNDS.y+BOUNDS.h/2))<1e-7);
 for(const x of [BOUNDS.x,BOUNDS.x+BOUNDS.w])assert.ok((x-view.x0)*view.s>=-1e-7&&(x-view.x0)*view.s<=svg.clientWidth+1e-7,'whole model must fit inside narrow stage');
 // A normal drag/zoom with unchanged stage size must remain untouched.
 view.x0+=125;view.s*=1.5;const dragged={...view},count=applied;resizePlanViewport();assert.deepEqual(view,dragged);assert.equal(applied,count);
 const center=view.x0+svg.clientWidth/(2*view.s);svg.clientWidth=250;const oldScale=view.s;resizePlanViewport();assert.equal(view.s,oldScale);assert.ok(Math.abs(view.x0+250/(2*view.s)-center)<1e-7);
 svg.clientWidth=0;const hidden={...view};fitView();resizePlanViewport();assert.deepEqual(view,hidden);
}
"""
        result=subprocess.run(['node'],input=script,text=True,encoding='utf-8',capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_help_is_separate_from_properties_and_blocks_editing_keys(self):
        html=render_viewer_html(compiled(),None,'project-a',1)
        names=('overviewPanel','furnPanel','operationHelpContent','openOperationHelp','closeOperationHelp','handleHelpKey','handleHelpClick','handleEditorKeydown')
        functions='\n'.join(re.search(r'function '+name+r'\([^)]*\)\{[\s\S]*?\n}',html)[0] for name in names)
        script=r"""
const assert=require('node:assert/strict');
let viewMode='2d',switching=false,labCapturePending=false,walking=false,finished=0,clearedInput=0;
const ui={sel:{kind:'furn',id:'f1'},mA:null,tool:'select'},state={furniture:[{id:'f1',name:'Desk',w:600,d:500,cx:100,cy:200,rot:0,color:'#999999'}],rooms:{},demolished:[],measures:[]},stateBefore=JSON.stringify(state),selected={...ui.sel};
const ROOMS=[],WALLS=[],MATS={},FLOORPLAN_CASE={metadata:{}},COARSE=true,tr=(zh,en)=>zh,esc=value=>String(value),nm=value=>value,fmt=value=>String(value),area=()=>0;
function scaleProvenancePanel(){return '<section>scale evidence</section>'}
const dialog={open:false,showModal(){this.open=true},close(){this.open=false},getBoundingClientRect(){return {left:10,right:100,top:20,bottom:150}}};
const toggle={attrs:{},setAttribute(key,value){this.attrs[key]=value}},content={innerHTML:''},title={textContent:''};
const dom={'#operationHelp':dialog,'#operationHelpToggle':toggle,'#operationHelpContent':content,'#operationHelpTitle':title};const $=key=>dom[key];
const document={body:{classList:{contains:key=>key==='external-controls'}},querySelectorAll:()=>[]};const is3D=()=>viewMode==='3d';
const window={View3D:{walking:()=>walking,clearInput(){clearedInput++}}};function finishViewInteraction(){finished++}
const fail=()=>{throw Error('help leaked an editing shortcut')};const rotateSel=fail,deleteSel=fail,duplicateSel=fail,undo=fail,redo=fail,mutate=fail,setView=fail,setTool=fail,fitCanvas=fail,zoomCenter=fail,toggleFullscreen=fail,drawer=fail,renderMeasure=fail;
function closeDrawers(){}function select(value){ui.sel=value}
"""+functions+r"""
const overview=overviewPanel(),properties=furnPanel(state.furniture[0]);assert.ok(overview.includes('scale evidence'));assert.ok(properties.includes('fW'));assert.equal(overview.includes('键盘快捷键'),false);assert.equal(overview.includes('触屏操作'),false);assert.equal(properties.includes('拖动家具移动'),false);
assert.ok(operationHelpContent().includes('2D 平面操作'));assert.ok(operationHelpContent().includes('上方圆点'));assert.ok(operationHelpContent().includes('V / M / X'));assert.equal(operationHelpContent().includes('Space'),false);
viewMode='3d';assert.ok(operationHelpContent().includes('3D 空间操作'));assert.equal(operationHelpContent().includes('上方圆点'),false);assert.equal(operationHelpContent().includes('V / M / X'),false);viewMode='2d';
openOperationHelp();assert.equal(dialog.open,true);assert.equal(toggle.attrs['aria-expanded'],'true');assert.equal(finished,1);assert.equal(clearedInput,1);
function key(value,extra={}){return {key:value,target:{matches:()=>false},stopPropagation(){this.stopped=true},preventDefault(){this.prevented=true},...extra}}
for(const event of [key('r'),key('Delete'),key('ArrowRight'),key('z',{ctrlKey:true}),key('d',{metaKey:true}),key('Tab')]){handleEditorKeydown(event);assert.equal(event.stopped,true);assert.equal(event.prevented,undefined);assert.deepEqual(ui.sel,selected)}
const escape=key('Escape',{target:{matches:()=>true}});handleEditorKeydown(escape);assert.equal(escape.prevented,true);assert.equal(escape.stopped,true);assert.equal(dialog.open,false);assert.equal(toggle.attrs['aria-expanded'],'false');assert.deepEqual(ui.sel,selected);assert.equal(JSON.stringify(state),stateBefore);
openOperationHelp();handleHelpClick({target:dialog,currentTarget:dialog,clientX:50,clientY:50});assert.equal(dialog.open,true);handleHelpClick({target:dialog,currentTarget:dialog,clientX:0,clientY:0});assert.equal(dialog.open,false);assert.deepEqual(ui.sel,selected);
walking=true;openOperationHelp();assert.equal(dialog.open,false);walking=false;labCapturePending=true;openOperationHelp();assert.equal(dialog.open,false);labCapturePending=false;
handleEditorKeydown(key('Escape'));assert.equal(ui.sel,null);assert.equal(JSON.stringify(state),stateBefore);
"""
        result=subprocess.run(['node'],input=script,text=True,encoding='utf-8',capture_output=True)
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
