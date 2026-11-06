"""Generic polygon checks extracted from the MIT floorplan local extensions.
No case constants, source images, or fixed counts.
"""
import math
EPS=1e-7
AREA_TOLERANCE_MM2=1.0

def signed_area(poly):
    return sum(a[0]*b[1]-b[0]*a[1] for a, b in zip(poly, poly[1:]+poly[:1]))/2


def cross(a, b, c):
    return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])


def on_segment(a, b, p):
    return (abs(cross(a, b, p)) <= EPS and
            min(a[0], b[0])-EPS <= p[0] <= max(a[0], b[0])+EPS and
            min(a[1], b[1])-EPS <= p[1] <= max(a[1], b[1])+EPS)


def segments_intersect(a, b, c, d):
    values = [cross(a,b,c), cross(a,b,d), cross(c,d,a), cross(c,d,b)]
    if values[0]*values[1] < -EPS and values[2]*values[3] < -EPS:
        return True
    return any(on_segment(x,y,p) for x,y,p in ((a,b,c),(a,b,d),(c,d,a),(c,d,b)))


def check_polygon(poly, label):
    assert len(poly) >= 3, f"Too few vertices: {label}"
    assert all(len(p) == 2 and all(isinstance(v,(int,float)) and math.isfinite(v) for v in p) for p in poly), label
    assert abs(signed_area(poly)) > AREA_TOLERANCE_MM2, f"Degenerate polygon: {label}"
    edges = list(zip(poly, poly[1:]+poly[:1]))
    assert all(a != b for a,b in edges), f"Zero-length edge: {label}"
    for i,(a,b) in enumerate(edges):
        for j,(c,d) in enumerate(edges[i+1:],i+1):
            if j == i+1 or (i == 0 and j == len(edges)-1):
                continue
            assert not segments_intersect(a,b,c,d), f"Self-intersection: {label} edges {i}/{j}"


def clean_polygon(poly):
    vertices = [list(p) for p in poly]
    while len(vertices) > 3:
        remove = next((i for i in range(len(vertices))
                       if abs(cross(vertices[i-1],vertices[i],vertices[(i+1)%len(vertices)])) <= EPS), None)
        if remove is None:
            break
        vertices.pop(remove)
    if signed_area(vertices) < 0:
        vertices.reverse()
    return vertices


def inside_triangle(p, a, b, c):
    return cross(a,b,p) >= -EPS and cross(b,c,p) >= -EPS and cross(c,a,p) >= -EPS


def triangulate(poly):
    vertices = clean_polygon(poly)
    triangles = []
    while len(vertices) > 3:
        for i in range(len(vertices)):
            a,b,c = vertices[i-1], vertices[i], vertices[(i+1)%len(vertices)]
            if cross(a,b,c) <= EPS:
                continue
            if any(inside_triangle(p,a,b,c) for j,p in enumerate(vertices)
                   if j not in ((i-1)%len(vertices), i, (i+1)%len(vertices))):
                continue
            triangles.append([a,b,c])
            vertices.pop(i)
            break
        else:
            raise AssertionError("Ear clipping failed: non-simple or numerically degenerate polygon")
    triangles.append(vertices)
    assert abs(sum(abs(signed_area(t)) for t in triangles)-abs(signed_area(poly))) <= AREA_TOLERANCE_MM2
    return triangles


def convex_intersection(subject, clip):
    points = subject[:]
    for a,b in zip(clip,clip[1:]+clip[:1]):
        if not points:
            break
        output=[]
        prev=points[-1]
        prev_side=cross(a,b,prev)
        for curr in points:
            curr_side=cross(a,b,curr)
            if (curr_side >= -EPS) != (prev_side >= -EPS):
                denominator=prev_side-curr_side
                if abs(denominator) > EPS:
                    t=prev_side/denominator
                    output.append([prev[0]+(curr[0]-prev[0])*t,prev[1]+(curr[1]-prev[1])*t])
            if curr_side >= -EPS:
                output.append(curr)
            prev,prev_side=curr,curr_side
        points=output
    return points


def bbox(poly):
    return min(p[0] for p in poly), min(p[1] for p in poly), max(p[0] for p in poly), max(p[1] for p in poly)


def bounds_overlap(a,b):
    return not (a[2] <= b[0] or b[2] <= a[0] or a[3] <= b[1] or b[3] <= a[1])


def intersection_area(triangles_a, triangles_b):
    result=0.0
    for a in triangles_a:
        ba=bbox(a)
        for b in triangles_b:
            if bounds_overlap(ba,bbox(b)):
                result += abs(signed_area(convex_intersection(a,b)))
    return result
