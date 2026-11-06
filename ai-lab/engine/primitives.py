"""Expand explicit pixel primitives into the legacy scene, without inferring data.

No coordinate snapping, minimum thickness, reference scene or executable model
code is used. The ordinary compiler still checks bounds and complete topology.
"""
from copy import deepcopy
import math
import re

LIMIT = 3000
IDENTIFIER = re.compile(r'^[A-Za-z0-9][A-Za-z0-9_.:-]{0,110}$')


def number(value, path, positive=False):
    try:
        valid = isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)
    except (ValueError, TypeError, OverflowError):
        valid = False
    if not valid or (positive and value <= 0):
        raise ValueError(f'{path}: expected a finite {"positive " if positive else ""}number')
    return value


def point(value, path):
    if not isinstance(value, list) or len(value) != 2:
        raise ValueError(f'{path}: expected [x,y]')
    return [number(v, path) for v in value]


def identifier(value, path):
    if not isinstance(value, str) or IDENTIFIER.fullmatch(value) is None or value in ('constructor', 'prototype', '__proto__'):
        raise ValueError(f'{path}: invalid ID')
    return value


def count(value, path):
    if not isinstance(value, int) or isinstance(value, bool) or not 1 <= value <= LIMIT:
        raise ValueError(f'{path}: count must be an integer from 1 to {LIMIT}')
    return value


def expand_primitives(candidate):
    """Return a new pixel-coordinate scene; untouched legacy input is compatible."""
    if not isinstance(candidate, dict):
        raise ValueError('Scene must be an object')
    result = deepcopy(candidate)

    def collection(key):
        values = result.get(key, [])
        if not isinstance(values, list) or len(values) > LIMIT:
            raise ValueError(f'$.{key}: expected at most {LIMIT} objects')
        return values

    def append(key, value):
        values = result.setdefault(key, [])
        if not isinstance(values, list) or len(values) >= LIMIT:
            raise ValueError(f'$.{key}: expanded object limit exceeded')
        values.append(value)

    for i, wall in enumerate(collection('wallSegments')):
        path = f'$.wallSegments[{i}]'
        if not isinstance(wall, dict):
            raise ValueError(f'{path}: expected an object')
        start, end = point(wall.get('start'), path+'.start'), point(wall.get('end'), path+'.end')
        thickness = number(wall.get('thickness'), path+'.thickness', True)
        dx, dy = end[0]-start[0], end[1]-start[1]
        length = math.hypot(dx, dy)
        if not math.isfinite(length) or length == 0:
            raise ValueError(f'{path}: wall endpoints must be distinct')
        kind = wall.get('kind', 'i')
        if kind not in ('e', 'i'):
            raise ValueError(f'{path}.kind: expected e or i')
        ident = identifier(wall.get('id', f'wallseg-{i+1:03d}'), path+'.id')
        nx, ny = -dy/length*thickness/2, dx/length*thickness/2
        poly = [[start[0]+nx, start[1]+ny], [end[0]+nx, end[1]+ny],
                [end[0]-nx, end[1]-ny], [start[0]-nx, start[1]-ny]]
        if (dx == 0 or dy == 0) and 'height' not in wall:
            append('walls', [min(p[0] for p in poly), min(p[1] for p in poly),
                             max(p[0] for p in poly), max(p[1] for p in poly), kind])
        else:
            height = number(wall.get('height', 2800), path+'.height', True)
            append('polygonWalls', {'id': ident, 'poly': poly, 'height': height, 'kind': kind})

    for i, row in enumerate(collection('furnitureRows')):
        path = f'$.furnitureRows[{i}]'
        if not isinstance(row, dict):
            raise ValueError(f'{path}: expected an object')
        prefix = identifier(row.get('idPrefix'), path+'.idPrefix')
        start, delta = point(row.get('start'), path+'.start'), point(row.get('delta'), path+'.delta')
        total = count(row.get('count'), path+'.count')
        width, depth = number(row.get('w'), path+'.w', True), number(row.get('d'), path+'.d', True)
        rotation = number(row.get('rot', 0), path+'.rot')
        kind = row.get('type')
        if not isinstance(kind, str) or not kind or len(kind) > 40:
            raise ValueError(f'{path}.type: expected a furniture type')
        if 'name' in row and (not isinstance(row['name'], str) or len(row['name']) > 4000):
            raise ValueError(f'{path}.name: invalid text')
        for index in range(total):
            item = {'id': f'{prefix}-{index+1:03d}', 'type': kind, 'name': row.get('name', kind),
                    'cx': start[0]+delta[0]*index, 'cy': start[1]+delta[1]*index,
                    'w': width, 'd': depth, 'rot': rotation}
            if 'color' in row:
                item['color'] = row['color']
            append('furniture', item)

    for i, run in enumerate(collection('stairRuns')):
        path = f'$.stairRuns[{i}]'
        if not isinstance(run, dict):
            raise ValueError(f'{path}: expected an object')
        prefix = identifier(run.get('idPrefix'), path+'.idPrefix')
        start, direction = point(run.get('start'), path+'.start'), point(run.get('direction'), path+'.direction')
        if abs(math.hypot(*direction)-1) > 1e-6:
            raise ValueError(f'{path}.direction: expected a unit vector')
        total = count(run.get('count'), path+'.count')
        tread, width = number(run.get('tread'), path+'.tread', True), number(run.get('width'), path+'.width', True)
        riser = number(run.get('riserMm'), path+'.riserMm', True)
        base = number(run.get('baseHeightMm', 0), path+'.baseHeightMm')
        if base < 0:
            raise ValueError(f'{path}.baseHeightMm: expected a nonnegative height')
        ux, uy = direction
        nx, ny = -uy*width/2, ux*width/2
        for index in range(total):
            x, y = start[0]+ux*tread*index, start[1]+uy*tread*index
            end_x, end_y = x+ux*tread, y+uy*tread
            append('steps', {'id': f'{prefix}-{index+1:03d}',
                            'poly': [[x+nx, y+ny], [end_x+nx, end_y+ny], [end_x-nx, end_y-ny], [x-nx, y-ny]],
                            'height': base+riser*(index+1)})

    for key in ('wallSegments', 'furnitureRows', 'stairRuns'):
        result.pop(key, None)
    return result
