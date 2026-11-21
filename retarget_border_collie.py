"""Export animation tracks from the supplied GLB onto the game's full Border Collie.

Run Blender in background with --python retarget_border_collie.py -- INPUT.glb OUTPUT_DIR.
Only skeletal animation data is read from the GLB. The game model is loaded separately.
"""
from bisect import bisect_right
from math import ceil
from pathlib import Path
import array
import gzip
import json
import struct
import sys

from mathutils import Matrix, Quaternion, Vector

source, output = (Path(arg) for arg in sys.argv[sys.argv.index('--') + 1:])
with source.open('rb') as stream:
    magic, version, _, size, kind = struct.unpack('<4sIII4s', stream.read(20))
    assert (magic, version, kind) == (b'glTF', 2, b'JSON')
    gltf = json.loads(stream.read(size))
    size, kind = struct.unpack('<I4s', stream.read(8))
    assert kind == b'BIN\0'
    binary = stream.read(size)

nodes = gltf['nodes']
by_name = {node['name']: index for index, node in enumerate(nodes)}
parents = {child: index for index, node in enumerate(nodes) for child in node.get('children', [])}
joints = gltf['skins'][0]['joints']
assert all(parents[i] not in joints or joints.index(parents[i]) < joints.index(i) for i in joints)

# Spatial order of the four original paws in the game's coordinate system.
paws = [by_name[name] for name in ('FR_Patte', 'HR_Patte', 'FL_Patte', 'HL_Patte')]
root, hips, chest, head = [by_name[name] for name in ('Root', 'Bassin', 'Thorax', 'Crane')]
ear_d, ear_g, tail_base, tail_tip = [by_name[name] for name in ('Oreille_D', 'Oreille_G', 'Queue_1', 'Queue_3')]

clips = {
    # id: (source name, looping, horizontal step scale)
    'idle': ('Attente (capture)', True, .65),
    'watch': ('Écouter et regarder', True, .60),
    'wag': ('Remuer la queue', True, .60),
    'walk': ('Marche (capture)', True, .90),
    'trot': ('Trot (capture)', True, .97),
    'canter': ('Galop lent – trois temps', True, .93),
    'sprint': ('Galop (capture)', True, .89),
    'stalk': ('Approche basse – conduite du troupeau', True, .81),
    'left': ('Trot en virage à gauche', True, .83),
    'right': ('Trot en virage à droite', True, .83),
    'bark': ('Aboyer', False, .60),
    'play': ('Invitation au jeu', False, .70),
}

def accessor(index):
    desc = gltf['accessors'][index]
    view = gltf['bufferViews'][desc['bufferView']]
    assert desc['componentType'] == 5126 and 'sparse' not in desc
    fmt = struct.Struct('<' + 'f' * {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}[desc['type']])
    offset = view.get('byteOffset', 0) + desc.get('byteOffset', 0)
    stride = view.get('byteStride', fmt.size)
    return [fmt.unpack_from(binary, offset + i*stride) for i in range(desc['count'])]

def quaternion(value):
    return Quaternion((value[3], *value[:3])).normalized()

def build_track(sampler, path):
    times = [value[0] for value in accessor(sampler['input'])]
    mode = sampler.get('interpolation', 'LINEAR')
    assert mode in ('LINEAR', 'STEP')
    cast = quaternion if path == 'rotation' else Vector
    return times, [cast(value) for value in accessor(sampler['output'])], mode

def sample(track, time, path):
    times, values, mode = track
    index = bisect_right(times, time)
    if index == 0:
        return values[0]
    if index == len(times) or mode == 'STEP':
        return values[index-1]
    weight = (time - times[index-1]) / (times[index] - times[index-1])
    before, after = values[index-1], values[index]
    return (before.slerp if path == 'rotation' else before.lerp)(after, weight)

def poses(tracks=None, time=0):
    world = {}
    for index in joints:
        node = nodes[index]
        parts = {
            'translation': Vector(node.get('translation', (0,0,0))),
            'rotation': quaternion(node.get('rotation', (0,0,0,1))),
            'scale': Vector(node.get('scale', (1,1,1))),
        }
        if tracks:
            for path in parts:
                track = tracks.get((index, path))
                if track:
                    parts[path] = sample(track, time, path)
        local = Matrix.LocRotScale(parts['translation'], parts['rotation'], parts['scale'])
        world[index] = world[parents[index]] @ local if parents[index] in world else local
    return world

rest = poses()
rest_rotation = {i: matrix.to_quaternion().inverted() for i, matrix in rest.items()}
unit = Quaternion()
scale = 2.24
body_rotations = [hips, chest, head, ear_d, ear_g, tail_base, tail_tip]
gaits = {'walk', 'trot', 'canter', 'sprint', 'stalk', 'left', 'right'}

def vector_data(value):
    return (value.x,value.y,value.z)

def rotation_data(value):
    if value.w < 0:
        value.negate()
    return (*vector_data(value),value.w)

def animation(clip_id, clip, loop, step):
    samplers = clip['samplers']
    tracks = {(c['target']['node'], c['target']['path']): build_track(samplers[c['sampler']], c['target']['path'])
              for c in clip['channels']}
    duration = max(times[-1] for times, _, _ in tracks.values())
    frame_count = ceil(round(duration*60, 3)) + 1
    frames = []
    for frame in range(frame_count):
        pose = poses(tracks, duration*frame/(frame_count-1))
        delta = [pose[i].to_quaternion() @ rest_rotation[i] for i in body_rotations]
        pelvis, thorax, skull, left, right, tail, tip = delta
        # The full game mesh has a single trunk bone. Keep the genuine pitch and
        # roll, while steering and horizontal motion remain under player control.
        body = pelvis.slerp(thorax,.54).to_euler('YXZ')
        body.x *= .75
        body.y *= .36
        body.z *= .77
        trunk = body.to_quaternion()
        center = pose[root].to_translation() - rest[root].to_translation()
        center = Vector((center.x*.36, center.y*.78, center.z*.36))
        # Head is turned in the original portrait. The captured forward gaze
        # unwinds it during movement, with damped angles on the simplified neck.
        head_delta = unit.slerp(skull, .68 if clip_id in gaits else .78)
        frames.append([
            *(center*scale),
            *rotation_data(trunk),
            *rotation_data(trunk.inverted() @ head_delta),
            *rotation_data(unit.slerp(skull.inverted() @ left,.72)),
            *rotation_data(unit.slerp(skull.inverted() @ right,.72)),
            *rotation_data(trunk.inverted() @ unit.slerp(tail,.75)),
            *rotation_data(tail.inverted() @ unit.slerp(tip,.85)),
        ])
        for i in paws:
            position = pose[i].to_translation() - rest[i].to_translation()
            lift = max(0, position.y*scale)
            contact = 1 - min(1, max(0, (lift-.014)/.041))
            frames[-1].extend((position.x*scale*.72, lift*.87, position.z*scale*step, contact))
    phase = 0
    if clip_id in gaits:
        # Match the leading forepaw contact when blending between the loops.
        contacts = [row[30] for row in frames]
        strikes = [i for i in range(1, len(frames)-1) if contacts[i-1]<.5<=contacts[i]]
        if strikes:
            phase = strikes[0]/(len(frames)-1)
    if loop:
        for index,(first,last) in enumerate(zip(frames[0], frames[-1])):
            assert abs(first-last)<.08,(clip_id,index,first,last)
        frames[-1][:] = frames[0]
    return frames, duration, phase

by_clip = {clip['name']: clip for clip in gltf['animations']}
packed = array.array('f')
manifest = {'stride': 43, 'clips': {}}
for clip_id, (name, loop, step) in clips.items():
    frames, duration, phase = animation(clip_id, by_clip[name], loop, step)
    manifest['clips'][clip_id] = dict(name=name, start=len(packed), frames=len(frames),
                                      duration=round(duration,6), phase=round(phase,6), loop=loop)
    for frame in frames:
        assert len(frame)==manifest['stride']
        packed.extend(frame)
manifest['bytes'] = len(packed)*packed.itemsize
manifest['file'] = 'collie-mouvements.bin.gz'
if sys.byteorder != 'little':
    packed.byteswap()
output.mkdir(parents=True, exist_ok=True)
(output/manifest['file']).write_bytes(gzip.compress(packed.tobytes(), compresslevel=8, mtime=0))
(output/'mouvements.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')))
print(json.dumps(manifest, ensure_ascii=False))
