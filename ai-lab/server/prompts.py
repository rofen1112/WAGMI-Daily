"""Versioned, deterministic generation instructions. Model output is data only."""
import json

PROMPT_VERSION = "pixel-scene-v2"
SYSTEM_PROMPT = """You reconstruct a floorplan image into JSON data, never code. Return exactly one JSON object with no markdown. All plan coordinates MUST be in ORIGINAL IMAGE PIXELS, not millimetres, normalized 0..1, resized image coordinates, or cropped coordinates. The server multiplies coordinates by mmPerPixel exactly once. Vertical heights are already millimetres. Do not claim surveyed accuracy. Do not copy coordinates from examples or invent a reference plan.
Supported schema: {walls:[[left,top,right,bottom,'e'|'i']], windows:[[left,top,right,bottom]], windowSills:[millimetres], windowHeads:[millimetres], doors:[{rect:[left,top,right,bottom],h:[hingeX,hingeY],len:doorLeafLength,c:[closedUnitX,closedUnitY],o:[openUnitX,openUnitY]}], slides:[{rect:[left,top,right,bottom],v:boolean}], polygonWalls:[{id,poly:[[x,y],...],height}], columns:[{id,poly:[[x,y],...],height}], steps:[{id,poly:[[x,y],...],height}], rooms:[{id,name,mat,poly:[[x,y],...]}], furniture:[{id,type,cx,cy,w,d,rot,name}], outerBoundary:[[x,y],...], metadata:{ceilingHeightMm:2800}}. All omitted structure collections may be empty arrays. At least one room is required. Walls and windows are FILLED AXIS-ALIGNED RECTANGLES with right>left,bottom>top; never centerline endpoints. Door rect,h,len are pixels; c and o are perpendicular unit vectors and never scaled. Rooms and polygons need at least 3 non-self-intersecting points, stay in the image bounds, and rooms must not overlap. Furniture rot is degrees, w and d are positive pixel lengths. Floor mat must be wood, walnut, tile800, tile600, marble, antislip, terrazzo or carpet. Furniture type must be one of bed crib nightstand wardrobe dresser desk chair bookshelf baycushion sofa cornersofa armchair beanbag coffeetable sidetable tvstand rug shoecab floorlamp plant table roundtable island barstool counter stove ksink fridge cabinet toilet vanity shower bathtub washer waterheater tv aircon acwall dishwasher ovencol dryer purifier officechair piano treadmill. Use only visible supported furniture, avoid HTML/scripts/URLs, and leave uncertain geometry out with an explicit warnings array. Give stable unique IDs. Preserve meaningful free space. Only include supported structures that are visible. Unknown image details are uncertainty, not a reason to make up a building."""

SYSTEM_PROMPT += """
Mandatory geometry checks before returning the JSON:
1. Axis bounds use the ORIGINAL image dimensions: every planar x coordinate must satisfy 0 <= x <= original image width; every planar y coordinate must satisfy 0 <= y <= original image height. Check rectangle edges, polygon vertices, door hinges and furniture footprints separately on each axis. Unit direction vectors c/o are vectors, not planar positions. Never use image width as the y limit or image height as the x limit. Do not enlarge the image bounds to fit guessed geometry.
2. Every filled rectangle (walls, windows, doors.rect, slides.rect) must satisfy 0 <= left < right <= original image width AND 0 <= top < bottom <= original image height. Both dimensions must be strictly positive; no zero-area rectangles or endpoint-only lines.
3. Every polygon must have at least 3 distinct vertices, no self-intersection and no zero-length edges. Do not repeat the first vertex at the end: polygons close implicitly. Do not put identical adjacent vertices anywhere, including the last-to-first closing edge. Check rooms, polygonWalls, columns, steps and outerBoundary.
4. windowSills and windowHeads are OPTIONAL vertical millimetre arrays. Prefer omitting BOTH and let the compiler supply defaults. If either array is provided, its length MUST equal windows.length, and every sill/head must satisfy 0 <= sill < head <= ceilingHeightMm. Never emit [] for either height array when windows is non-empty. Windows themselves remain pixel rectangles.
5. outerBoundary is OPTIONAL. Include it only if you can trace a reliable containing exterior outline, with every vertex inside the original image bounds. If uncertain, omit outerBoundary entirely. A supplied outline must contain ALL valid room polygons; do not crop out a legitimate room, move a room, or shrink a valid room just to fit an incorrectly traced outerBoundary. Recheck the image and correct or omit the uncertain outline instead.
These checks constrain the model's own returned data; the server will reject invalid geometry rather than silently repair or clamp coordinates."""


def generation_messages(asset, data_url, mm_per_pixel, prompt):
    text = f"Original image dimensions: {asset['width']} x {asset['height']} pixels. Explicit original-pixel limits: 0 <= x <= {asset['width']}; 0 <= y <= {asset['height']}. For each rectangle: 0 <= left < right <= {asset['width']} and 0 <= top < bottom <= {asset['height']}. Assumed scale supplied by user: {mm_per_pixel} mm/pixel. Return ALL plan coordinates in original pixels; DO NOT apply scale. User requirements: {prompt or 'Reconstruct the visible floorplan.'}"
    return [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": [{"type": "text", "text": text}, {"type": "image_url", "image_url": {"url": data_url}}]}]


def repair_messages(messages, raw, validation):
    errors = validation.get("errors", [])[:12]
    # Exactly one targeted repair; no tools, no model-generated executable code.
    instruction = "Fix ONLY these validation errors while retaining the original image pixel coordinate contract. The diagnostics below refer to the COMPILED scene in millimetres (mm), and reported overlap/outside areas are in square millimetres (mm²). These diagnostic lengths/areas are NOT original-pixel coordinates: never copy a reported mm value or mm² area into an x/y coordinate. Your previous JSON and your complete corrected JSON MUST still use ORIGINAL IMAGE PIXELS; do not apply mmPerPixel to the output. Re-read the original width and height in the initial user message and enforce 0 <= x <= original width and 0 <= y <= original height, with strictly positive rectangles. Remove repeated closing/adjacent polygon vertices without inventing geometry. Omit windowSills/windowHeads for compiler defaults, or ensure each provided array exactly matches windows.length; never [] with non-empty windows. If outerBoundary is uncertain or incorrectly excludes a valid room, recheck/correct it or omit that optional outline; do not crop/move valid rooms merely to fit it. Return the complete corrected JSON object, not a patch. Validation errors: "
    return messages + [{"role": "assistant", "content": raw[:500000]}, {"role": "user", "content": instruction + json.dumps(errors, ensure_ascii=False)}]


def parse_json(content):
    content = content.strip()
    if content.startswith("```"):
        lines = content.splitlines()
        if lines[-1].strip() == "```":
            content = "\n".join(lines[1:-1])
    result = json.loads(content)
    if not isinstance(result, dict):
        raise ValueError("Model scene must be an object")
    return result
