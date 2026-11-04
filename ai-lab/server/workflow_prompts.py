"""Data-only staged migration of the actual tracing and browser-review workflow."""
import json
from .prompts import SYSTEM_PROMPT

WORKFLOW_PROMPT_VERSION = "codex-workflow-prompts-v3"
USER_LANGUAGE = "所有面向用户的 summary、evidence、assumptions、notes、warnings、reason、reasons、description、suggestedChange、limitations 必须使用简体中文，保持清楚简洁；原图房间名称、尺寸标注原文和 IDs 可以保留原文。不要翻译 JSON 字段名，也不要改变约定的结构、坐标、单位或检查结论。"
JSON_OUTPUT_CONTRACT = "输出必须是严格合法的 JSON 对象，可直接由标准 json.loads 解析。所有属性名和字符串值必须使用双引号；禁止 JavaScript 对象字面量、未加引号的键、单引号字符串、注释、尾逗号、NaN、Infinity、Markdown代码围栏或JSON以外的文字。前文如有字段/类型说明，它们只是契约描述，不能照抄成含未引号键或类型占位符的结果。返回实际JSON数据，不要返回JSON Schema本身。"

_POINT_SCHEMA = {"type": "array", "items": {"type": "number", "minimum": 0}, "minItems": 2, "maxItems": 2}
SCALE_ESTIMATION_SCHEMA = {
    "type": "object", "required": ["scale"], "additionalProperties": False,
    "properties": {"scale": {"oneOf": [
        {"type": "object", "maxProperties": 0},
        {"type": "object", "additionalProperties": False,
         "required": ["rangeMmPerPixel", "confidence", "evidence", "assumptions", "anchors"],
         "properties": {
             "mmPerPixel": {"type": "number", "exclusiveMinimum": 0},
             "rangeMmPerPixel": {"type": "array", "items": {"type": "number", "exclusiveMinimum": 0}, "minItems": 2, "maxItems": 2},
             "confidence": {"const": "low"},
             "evidence": {"type": "array", "items": {"type": "string", "minLength": 1}, "minItems": 1},
             "assumptions": {"type": "array", "items": {"type": "string", "minLength": 1}, "minItems": 1},
             "anchors": {"type": "array", "minItems": 1, "items": {
                 "type": "object", "additionalProperties": False,
                 "required": ["label", "p1", "p2", "lengthMm", "source"],
                 "properties": {"label": {"type": "string", "minLength": 1}, "p1": _POINT_SCHEMA, "p2": _POINT_SCHEMA, "lengthMm": {"type": "number", "exclusiveMinimum": 0}, "source": {"const": "object_prior"}}
             }}
         }}
    ]}}
}

PRIMITIVES = """To avoid large repeated coordinate dumps, explicitly supported OPTIONAL pixel primitives are:
wallSegments:[{id,start:[x,y],end:[x,y],thickness:number,kind:'e'|'i',height?:millimetres}];
furnitureRows:[{idPrefix,type,name?,start:[x,y],count,delta:[dx,dy],w,d,rot?,color?}];
stairRuns:[{idPrefix,start:[x,y],count,tread,width,direction:[unitX,unitY],riserMm,baseHeightMm?}].
wallSegments.start/end are the TWO ENDPOINTS OF THE WALL CENTERLINE. thickness is ORIGINAL IMAGE PIXELS; the filled wall extends half that thickness to each side of the centerline. Keep the resulting entire footprint in bounds.
furnitureRows.start is the CENTER of the first furniture item; delta is the difference between consecutive item centers, not an edge-to-edge gap.
stairRuns.start is the CENTER OF THE FIRST TREAD'S FRONT EDGE; direction is the forward unit vector; width is the full transverse width; tread is the forward pixel depth. Step index starts at zero; each step's vertical height in mm is baseHeightMm + (index+1)*riserMm.
These expand deterministically, never guess missing values, and must match visible repetition in this image. Use actual positive pixel thicknesses and lengths; risers/base heights are mm. Use unique stable prefixes. Never omit visible stairs, glass partitions, columns, service rooms or repeated office workstations merely to reduce output size. Report uncertainty and unsupported features explicitly rather than substituting a simpler reference building."""


def image(url):
    return {"type": "image_url", "image_url": {"url": url}}


def messages(system, text, image_urls):
    return [{"role": "system", "content": system + "\n" + JSON_OUTPUT_CONTRACT + "\n" + USER_LANGUAGE}, {"role": "user", "content": [{"type": "text", "text": text}] + [image(url) for url in image_urls]}]


def limits(asset):
    return f"ORIGINAL IMAGE {asset['width']} x {asset['height']} pixels; 0 <= x <= {asset['width']}, 0 <= y <= {asset['height']}. Every rectangle has left<right and top<bottom. Polygons close implicitly: never repeat the first vertex or adjacent vertices."


def analyze_messages(asset, original_url, payload):
    system = """Analyze a floorplan image before reconstruction. Output exactly JSON, no code, markdown or invented measurements. Required shape:
{summary:string,spaces:[string],notes:[string],observations:[{feature:string,evidence:string,confidence:'low'|'medium'|'high'}],scale:{mmPerPixel?:number,rangeMmPerPixel?:[low,high],confidence:'low'|'medium'|'high',evidence:[string],assumptions:[string],anchors:[{label:string,p1:[originalX,originalY],p2:[originalX,originalY],lengthMm:number,source:'dimension_annotation'|'object_prior'}]}}.
First distinguish observed image facts from assumptions. List main rooms, external shape, openings, curved/glass walls, stairs, columns, fixed facilities, visible furniture and repeated arrangements, plus meaningful empty areas. Enumerate identity-defining details to check later in the real renders. If readable dimension labels exist, read multiple independent anchors where possible, copy the visible label and mark dimension_annotation. Never fabricate labels, lengths or a user_measurement source. The server computes pixel distances and dimension ratios itself. If there are no reliable labels, use object_prior anchors only with explicit typical-size assumptions and a nonzero uncertainty range; never call that measured or exact. The service computes estimated mmPerPixel as the median of lengthMm / original-pixel distance across those anchors. You do not need to calculate or supply mmPerPixel yourself; any model-supplied value cannot override the anchor-derived calculation. The original range must cover every anchor ratio and the median; do not widen it just to hide contradictory evidence. Auto mode explicitly permits common-size priors for an illustrative reconstruction: inability to establish measured truth does NOT mean inability to estimate an approximate scale. When doors, beds or comparable recognizable objects are visible, actually inspect their original-pixel endpoints and supply defensible object_prior anchors, preferably at least two independent visible references, rather than leaving anchors empty merely because no measurement labels exist. State the assumed typical dimensions and uncertainty. If no identifiable reference has a defensible basis, leave scale unknown rather than supplying a familiar baseline's scale. Scale and areas are illustrative unless independently measured. Manual/calibrated inputs override scale but never skip visual analysis."""
    chosen = {key: payload[key] for key in ("scaleMode", "mmPerPixel", "calibration") if key in payload}
    return messages(system, limits(asset) + "\nUser scale input: " + json.dumps(chosen, ensure_ascii=False) + "\nRequirements: " + payload.get("prompt", ""), [original_url])


def scale_estimation_messages(asset, original_url, analysis):
    system = """Estimate ONLY the illustrative scale by looking again at visible reference objects in the original floorplan. Return one strictly valid JSON object matching the JSON Schema below, with the single double-quoted top-level key "scale". The schema describes data types; return actual JSON values, not the schema. Do not change the analysis, architecture, rooms or furniture, and do not output any other top-level key.
This is one bounded second look, not a demand for surveyed truth. Auto mode ALLOWS explicit common-size assumptions for an approximate visualization. Inability to know the true measured size is not a reason to refuse an illustrative estimate when recognizable doors, beds, furniture or fixtures provide a defensible size range. Select endpoints on the actual visible reference in ORIGINAL IMAGE PIXELS; lengthMm is an openly stated typical-size assumption, never a claimed label or measurement. If at least two independent reference objects are clear, use at least two and check their implied ratios. Explain which visible objects were chosen, the assumed typical length/range and why; use a low confidence estimate and a nonzero uncertainty interval covering all reference-derived ratios. The service calculates estimated mmPerPixel as the median of lengthMm / original-pixel distance, so mmPerPixel is optional and a supplied value cannot override the anchors. Do not widen the range or discard contradictory anchors just to force a pass. Never invent printed dimension labels, never use dimension_annotation or user_measurement here, never copy a known example's scale or use 22 mm/pixel as a fallback. If no reference is recognizable, return an empty scale object so the service can request input instead of inventing evidence."""
    system += "\nJSON Schema: " + json.dumps(SCALE_ESTIMATION_SCHEMA, ensure_ascii=False, separators=(",", ":"))
    text = limits(asset) + "\nPrior image analysis (observations, not measurement truth): " + json.dumps(analysis, ensure_ascii=False) + '\nReinspect the ORIGINAL source image. Return only the evidence-based JSON data. If no recognizable reference exists, the valid empty result is {"scale":{}}.'
    return messages(system, text, [original_url])


def structure_messages(asset, original_url, payload, analysis, provenance):
    text = limits(asset) + "\nAnalysis observations: " + json.dumps(analysis, ensure_ascii=False) + "\nServer-selected scale provenance (DO NOT APPLY TO OUTPUT COORDINATES): " + json.dumps(provenance, ensure_ascii=False) + "\nBuild architecture only: rooms, walls with real opening gaps, windows, doors, slides, polygonWalls, columns, steps, optional outerBoundary. Keep furniture empty for the next stage. Preserve stairs/glass/curves/core/service spaces/large intentional empty areas from the image, and make room polygons non-overlapping. Output complete pixel scene JSON. User requirements: " + payload.get("prompt", "")
    return messages(SYSTEM_PROMPT + "\n" + PRIMITIVES, text, [original_url])


def furnish_messages(asset, original_url, candidate, analysis, provenance):
    system = SYSTEM_PROMPT + "\n" + PRIMITIVES + "\nThis pass may ONLY return {furniture:[...],furnitureRows?:[...],notes?:[string]}. Do not replace or change architecture, scale, metadata or IDs. Include only furniture and fixed facilities visible in the original image, using supported types, original pixel positions/sizes and degrees. Fixed facilities (sanitary fixtures, cabinetry, kitchen equipment) belong in furniture with descriptive names. Preserve countable repeated arrangements using furnitureRows when appropriate. Do not fill intentional empty space or invent furnishing for unlabeled regions."
    text = limits(asset) + "\nExisting pixel architecture: " + json.dumps(candidate, ensure_ascii=False) + "\nAnalysis: " + json.dumps(analysis, ensure_ascii=False) + "\nScale provenance (do not scale coordinates): " + json.dumps(provenance, ensure_ascii=False)
    return messages(system, text, [original_url])


def repair_messages(asset, original_url, candidate, provenance, validation=None, review=None, capture_urls=None):
    text = limits(asset) + "\nCurrent ORIGINAL-PIXEL scene: " + json.dumps(candidate, ensure_ascii=False) + "\nFixed server scale provenance: " + json.dumps(provenance, ensure_ascii=False)
    if validation is not None:
        text += "\nGeometry diagnostics refer to the COMPILED MM scene; lengths are mm and overlap/outside areas are mm², NOT pixel coordinates. Never copy a reported mm or mm² number into x/y. Return complete corrected ORIGINAL-PIXEL data, do not multiply by mmPerPixel. Fix only the listed errors while preserving image evidence. Diagnostics: " + json.dumps(validation.get("errors", [])[:30], ensure_ascii=False)
    if review is not None:
        text += "\nActual-render review: " + json.dumps(review, ensure_ascii=False) + "\nImages after the original are the actual 2D and 3D render of this candidate. Make targeted data-only corrections to supported architecture/furniture/semantics. Preserve correct existing objects; do not conceal omissions by renaming or deleting legitimate spaces. Do not change scale or claim a reference case."
    return messages(SYSTEM_PROMPT + "\n" + PRIMITIVES, text, [original_url] + (capture_urls or []))


def review_messages(asset, original_url, captures, scene, analysis, provenance):
    system = """Review the reconstruction against real images, never assume valid geometry means visual fidelity. The three images are ORIGINAL FLOORPLAN, ACTUAL 2D RENDER, ACTUAL 3D RENDER in that order. Return exactly JSON: {pass:boolean,reason:string,issues:[{severity:'critical'|'major'|'minor',path:string,description:string,suggestedChange:string}],limitations:[string]}. Fail if visible defining features/rooms/walls/doors/windows/stairs/glass/columns/fixtures/repeated furniture are missing, misplaced, wrongly scaled or substituted, or if intentional empty space is filled. Check 2D relationships and 3D physical readability separately. Do not infer hidden geometry or assert surveyed dimensions. Inspect visible counts and major relationships, including service areas, repeated workstations, stairs and glass boundaries. If renders are unreadable, incomplete or show the wrong candidate, fail and say why. Use stable scene paths/IDs for concrete targeted issues. A pass means only this model review, not independent human acceptance. Major/critical unresolved issues forbid a pass."""
    text = limits(asset) + "\nObserved source features: " + json.dumps(analysis, ensure_ascii=False) + "\nSame candidate's full compiled-mm scene: " + json.dumps(scene, ensure_ascii=False) + "\nSame scale provenance: " + json.dumps(provenance, ensure_ascii=False)
    return messages(system, text, [original_url] + captures)
