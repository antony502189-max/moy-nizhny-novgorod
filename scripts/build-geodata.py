"""Compile OSM Overpass JSON extracts into local basemaps and walking paths.
Usage: python3 scripts/build-geodata.py CENTER MAJOR STREETS SHAPES DISTRICTS FONT
Needs Pillow. The queries and attribution are in maps/README.md.
"""
import heapq
import json
import math
import re
import sys
import subprocess
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CITY = (56.14, 43.57, 56.44, 44.21)
CENTER = (56.300, 43.935, 56.350, 44.075)
WALK = {'footway', 'pedestrian', 'path', 'steps', 'living_street', 'residential',
        'unclassified', 'service', 'tertiary', 'secondary', 'primary', 'track'}
MAJOR = {'primary', 'secondary', 'tertiary', 'motorway', 'trunk'}
LAND = '#f4f1e9'


def extract(path):
    data = json.loads(Path(path).read_text())
    if data.get('remark') or not data.get('elements'):
        raise ValueError(f'Incomplete extract: {path}')
    return data['elements']


def write_json(path, data):
    (ROOT / path).write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')


def coords(geometry):
    return [(p['lat'], p['lon']) for p in geometry]


def rings(members, role):
    pieces = [coords(m['geometry']) for m in members
              if m['type'] == 'way' and (m['role'] or 'outer') == role and m.get('geometry')]
    while pieces:
        chain = pieces.pop()
        while chain[0] != chain[-1]:
            for i, part in enumerate(pieces):
                if part[0] == chain[-1] or part[-1] == chain[-1]:
                    if part[0] != chain[-1]:
                        part.reverse()
                    chain.extend(part[1:])
                    pieces.pop(i)
                    break
            else:
                break
        if len(chain) >= 4 and chain[0] == chain[-1]:
            yield chain


def mercator(lat):
    return math.asinh(math.tan(math.radians(lat)))


def draw_map(name, bbox, width, roads, shapes, font_path):
    south, west, north, east = bbox
    scale = width / math.radians(east - west)
    top = mercator(north)
    height = round(scale * (top - mercator(south)))
    def project(p):
        return (round(scale * math.radians(p[1] - west)), round(scale * (top - mercator(p[0]))))
    image = Image.new('RGB', (width, height), LAND)
    draw = ImageDraw.Draw(image)
    for shape in shapes:
        color = '#b4d9e8' if shape['tags'].get('natural') == 'water' else '#cfe3bf'
        if shape['type'] == 'way':
            pts = coords(shape['geometry'])
            if len(pts) > 3 and pts[0] == pts[-1]:
                draw.polygon([project(p) for p in pts], fill=color)
        else:
            for role, fill in [('outer', color), ('inner', LAND)]:
                for ring in rings(shape['members'], role):
                    draw.polygon([project(p) for p in ring], fill=fill)
    labels = []
    detailed = name == 'center'
    ways = sorted(roads.values(), key=lambda e: e['tags'].get('highway') in MAJOR)
    for way in ways:
        b = way['bounds']
        if b['maxlat'] < south or b['minlat'] > north or b['maxlon'] < west or b['minlon'] > east:
            continue
        t = way['tags']
        h = t.get('highway')
        if not h or h not in WALK | MAJOR or t.get('area') == 'yes':
            continue
        pts = [project(p) for p in coords(way['geometry'])]
        major = h in MAJOR
        path = h in {'footway', 'steps', 'path', 'track'}
        if not detailed and path:
            continue
        w = (7 if major else 2 if path else 4) if detailed else (3 if major else 1)
        draw.line(pts, fill='#d1a863' if major else '#ccc5b5', width=w + 2 if detailed else w)
        if w > 1:
            draw.line(pts, fill='#ffdf9f' if major else '#fdfbf6', width=w)
        if t.get('name') and (major or (detailed and not path)):
            labels.append((not major, -len(pts), t['name'], pts[len(pts)//2]))
    font = ImageFont.truetype(font_path, 19 if detailed else 15)
    placed = []
    for _, _, title, (x, y) in sorted(labels):
        if not (10 < x < width-10 and 12 < y < height-12):
            continue
        half = int(draw.textlength(title, font=font)/2)+8
        if any(abs(x-a) < half+w and abs(y-b) < 30 or (title == n and abs(x-a)+abs(y-b) < 420)
               for a,b,w,n in placed):
            continue
        draw.text((x,y), title, font=font, anchor='mm', fill='#434b50', stroke_width=2, stroke_fill='#fffdf7')
        placed.append((x,y,half,title))
    image.save(ROOT / 'maps' / (name+'.webp'), quality=87, method=5)


def meters(a, b):
    return math.hypot((a[0]-b[0])*111200, (a[1]-b[1])*61650)


def build_paths(ways, places, required=None, target='src/data/walking.json'):
    positions, graph = {}, defaultdict(list)
    for way in ways:
        t = way['tags']
        if t.get('highway') not in WALK or t.get('foot', t.get('access')) in {'private','no','customers','permit'}:
            continue
        if t.get('area') == 'yes' or t.get('foot') == 'use_sidepath' or t.get('sidewalk') == 'separate':
            continue
        if t['highway'] in {'primary','secondary','tertiary'} and t.get('sidewalk') not in {'yes','both','left','right'}:
            continue
        restricted = t['highway'] == 'steps' or t.get('wheelchair') == 'no'
        nodes = way['nodes']
        positions.update(zip(nodes, coords(way['geometry'])))
        for a,b in zip(nodes,nodes[1:]):
            d = meters(positions[a],positions[b])
            if t.get('oneway:foot') != '-1':
                graph[a].append((b,d,restricted))
            if t.get('oneway:foot') != 'yes':
                graph[b].append((a,d,restricted))
    # Catalogue points are sometimes the centre of a building. Snap to connected public paths nearby.
    result, geometry, indices = {}, [], {}
    for profile in (['walk','noSteps'] if required is None else ['walk']):
        allowed = {n for n, edges in graph.items() if any(not r or profile=='walk' for _,_,r in edges)}
        remaining = allowed.copy()
        largest = set()
        while remaining:
            component, stack = set(), [remaining.pop()]
            while stack:
                n = stack.pop()
                component.add(n)
                for other, _, restricted in graph[n]:
                    if other in remaining and (profile == 'walk' or not restricted):
                        remaining.remove(other)
                        stack.append(other)
            if len(component) > len(largest):
                largest = component
        allowed = largest
        anchors = {}
        for key, point in places.items():
            anchors[key] = sorted((meters(point,positions[n]), n) for n in allowed if meters(point,positions[n]) <= 90)[:5]
        paths = {}
        for start, candidates in anchors.items():
            if not candidates:
                continue
            # Use the nearest node. Disconnected or missing segments stay unavailable.
            gap, source = candidates[0]
            queue, dist, prev = [(gap, source)], {source:gap}, {}
            while queue:
                cost, u = heapq.heappop(queue)
                if cost != dist[u]:
                    continue
                for v, length, restricted in graph[u]:
                    if profile == 'noSteps' and restricted:
                        continue
                    new = cost + length
                    if new < dist.get(v, math.inf):
                        dist[v], prev[v] = new, u
                        heapq.heappush(queue,(new,v))
            for end, targets in anchors.items():
                if required is not None and (start,end) not in required:
                    continue
                if start == end or not targets or targets[0][1] not in dist:
                    continue
                target_gap, n = targets[0]
                length = round(dist[n] + target_gap)
                path = [positions[n]]
                while n != source:
                    n = prev[n]
                    path.append(positions[n])
                # Quantized delta coordinates share well in compressed bundles.
                points = list(reversed(path))
                quantized = tuple((round(y*1e5), round(x*1e5)) for y,x in points)
                ref = indices.get(quantized)
                if ref is None:
                    last = quantized[0]
                    deltas = list(last)
                    for xy in quantized[1:]:
                        if xy != last:
                            deltas.extend([xy[0]-last[0], xy[1]-last[1]])
                            last = xy
                    geometry.append(deltas)
                    ref = len(geometry)
                    indices[quantized] = ref
                    indices[quantized[::-1]] = -ref
                paths[start+'>'+end] = [length,ref]
        result[profile] = paths
        print(profile, len(paths), 'of',len(places)*(len(places)-1))
    write_json(target, {'profiles':result, 'geometry':geometry})


def build_curated(center):
    module = """import {walks,places} from './resident/domain/data.ts';
import {PLACES} from './src/data/places.ts';
console.log(JSON.stringify({walks:walks.map(w=>w.placeIds),places:[...places,...PLACES].map(p=>[p.id,p.lat,p.lon])}));"""
    catalog = json.loads(subprocess.check_output(['node','--experimental-strip-types','--input-type=module','-e',module],cwd=ROOT))
    legs = {(a,b) for ids in catalog['walks'] for a,b in zip(ids,ids[1:])}
    ids = {p for pair in legs for p in pair}
    points = {key:(lat,lon) for key,lat,lon in catalog['places'] if key in ids}
    # The stadium catalogue marker is the centre of the pitch. End at the mapped approach.
    # https://www.openstreetmap.org/node/5135589469
    points['stadium'] = (56.3363568, 43.9650337)
    build_paths(center, points, legs, 'src/data/curated-walking.json')


def main():
    center, major, streets, shapes, districts = [extract(p) for p in sys.argv[1:6]]
    font = sys.argv[6]
    roads = {w['id']: w for w in [*major,*streets,*center]}
    draw_map('city', CITY, 3800, roads, shapes, font)
    draw_map('center', CENTER, 4000, roads, shapes, font)
    places = {p:(float(lat),float(lon)) for p,lat,lon in re.findall(
        r"id: '([\w-]+)', lat: ([\d.]+), lon: ([\d.]+)", (ROOT/'src/data/places.ts').read_text())}
    build_paths(center, places)
    build_curated(center)
    polygons = {d['tags']['name'].split()[0]: {role:[[[round(y,5),round(x,5)] for y,x in ring]
                for ring in rings(d['members'],role)] for role in ['outer','inner']} for d in districts}
    if len(polygons) != 8 or not all(p['outer'] for p in polygons.values()):
        raise ValueError('Expected eight district boundaries')
    write_json('src/data/districts.json', polygons)


if __name__ == '__main__':
    main()
