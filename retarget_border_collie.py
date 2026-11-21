"""Bake the supplied GLB's authored bone motion for the full-resolution mesh.

Run Blender in background with --python retarget_border_collie.py -- INPUT.glb OUTPUT_DIR.
Bone indices in the manifest are also used by export_collie_weights.py.
"""
from bisect import bisect_right
from math import ceil
from pathlib import Path
import array
import gzip
import json
import re
import unicodedata
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
joints = gltf['skins'][0]['joints']
indices = {node: index for index,node in enumerate(joints)}
joint_names = {nodes[node]['name']: node for node in joints}
parents = {child: index for index, node in enumerate(nodes) for child in node.get('children', [])}
assert all(parents[i] not in indices or indices[parents[i]] < indices[i] for i in joints)

# Spatial order FR, HR, FL, HL matches the rest pose in the game. Hind hips stay fixed to the pelvis.
paws = [joint_names[name] for name in ('FR_Patte', 'HR_Patte', 'FL_Patte', 'HL_Patte')]
root = joint_names['Root']
moving_joints = [root,*[joint_names[name] for name in ('Thorax','FR_Proximal','FL_Proximal')]]
scale = 2.24
height_ratio = nodes[root]['translation'][1]/.425


clips = {
    # id: (source name, looping, nominal stride distance in game units)
    'idle': ('Attente (capture)', True, 0),
    'watch': ('Écouter et regarder', True, 0),
    'wag': ('Remuer la queue', True, 0),
    'walk': ('Marche (capture)', True, 1.65),
    'trot': ('Trot (capture)', True, 2.25),
    'canter': ('Galop lent – trois temps', True, 3.05),
    'sprint': ('Galop (capture)', True, 3.65),
    'stalk': ('Approche basse – conduite du troupeau', True, 1.80),
    'left': ('Trot en virage à gauche', True, 2.20),
    'right': ('Trot en virage à droite', True, 2.20),
    'bark': ('Aboyer', False, 0),
    'play': ('Invitation au jeu', False, 0),
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

def rotation_data(value):
    return (value.x,value.y,value.z,value.w)

rest_local = {i: (Vector(nodes[i].get('translation',(0,0,0)))*scale,
                  quaternion(nodes[i].get('rotation',(0,0,0,1)))) for i in joints}

def build_track(sampler, path):
    times = [value[0] for value in accessor(sampler['input'])]
    mode = sampler.get('interpolation', 'LINEAR')
    assert mode in ('LINEAR', 'STEP')
    values = accessor(sampler['output'])
    cast = quaternion if path=='rotation' else lambda value: Vector(value)*scale
    return times,[cast(value) for value in values],mode

def sample(track, time, rotation):
    times, values, mode = track
    index = bisect_right(times,time)
    if index==0:
        return values[0]
    if index==len(times) or mode=='STEP':
        return values[index-1]
    weight = (time-times[index-1])/(times[index]-times[index-1])
    before, after = values[index-1],values[index]
    return (before.slerp if rotation else before.lerp)(after,weight)

def pose(tracks,time):
    world = {}
    local = {}
    for i in joints:
        rest_position,rest_rotation=rest_local[i]
        position_track=tracks.get((i,'translation'))
        rotation_track=tracks.get((i,'rotation'))
        position=sample(position_track,time,False) if position_track else rest_position
        rotation=sample(rotation_track,time,True) if rotation_track else rest_rotation
        local[i]=(position,rotation)
        matrix=Matrix.LocRotScale(position,rotation,Vector((1,1,1)))
        world[i]=world[parents[i]]@matrix if parents[i] in world else matrix
    return local,world

_,rest=pose({},0)
# The distal paw pivot lies above the sole. Keep a marker embedded in the
# underside, slightly in front of the pivot, for ankle height and contacts.
skin_extras=gltf['skins'][0].get('extras',{})
source_soles=skin_extras.get('pawSoles',{})
supports=skin_extras.get('pawSupports',{})
soles={}
for i in paws:
    tag=nodes[i]['name'][:2]
    soles[i]=(Vector(source_soles[tag])*scale if tag in source_soles else
              rest[i].inverted()@(rest[i].translation+Vector((0,-.021*scale*height_ratio,.017*scale*height_ratio))))

stride = len(moving_joints)*3+len(joints)*4+len(paws)
manifest = {
    'rig':[[nodes[i]['name'],indices.get(parents[i],-1),*rest_local[i][0],*rotation_data(rest_local[i][1])] for i in joints],
    'paws':[{'bone':indices[i],'sole':list(soles[i]),
             'supports':[list(Vector(point)*scale) for point in supports.get(nodes[i]['name'][:2],[])]} for i in paws],
    'translations':[indices[i] for i in moving_joints],
    'clips':{}, 'stride':stride
}
packed=array.array('f')

def animation(clip_id,clip,loop):
    tracks = {}
    for channel in clip['channels']:
        target = channel['target']
        joint,path=target['node'],target['path']
        if path=='rotation' or (path=='translation' and joint in moving_joints):
            tracks[joint,path]=build_track(clip['samplers'][channel['sampler']],path)
    duration = max(times[-1] for times,_,_ in tracks.values())
    frame_count = ceil(round(duration*60,3))+1
    frames=[]
    contacts=[]
    for frame_index in range(frame_count):
        local,world = pose(tracks,duration*frame_index/(frame_count-1))
        origin=local[root][0]-rest_local[root][0]
        if clip_id not in ('left','right'):
            origin.x *= .55
        # Travel in-game comes from the controls. Vertical weight shift and
        # small offsets within the recorded stride keep the original posture.
        row=[origin.x,origin.y,origin.z*.42]
        for i in moving_joints[1:]:
            row.extend(local[i][0]-rest_local[i][0])
        for i in joints:
            delta=rest_local[i][1].inverted() @ local[i][1]
            if delta.w<0:
                delta.negate()
            row.extend(rotation_data(delta))
        contacts.append([(world[i]@soles[i]).y for i in paws])
        frames.append(row)
    threshold=min(min(cont) for cont in contacts)
    floor = min(.017, max(-.025,threshold))
    gait=clip.get('extras',{})
    entry=0
    if gait.get('locomotion'):
        duty=gait['duty']
        for index,frame in enumerate(frames):
            cycle=index/(frame_count-1)
            for strike in gait['strikes']:
                phase=(cycle-strike)%1
                fade=.083
                value=min(1.,(duty-phase)/fade) if phase<duty else 0
                value*=min(1.,phase/fade)
                frame.append(value*value*(3-2*value))
    else:
        for frame,heights in zip(frames,contacts):
            frame.extend(1-min(1,max(0,(height-floor-.026)/.048)) for height in heights)
    if clips[clip_id][2] and not gait.get('locomotion'):
        strikes=[i for i in range(1,len(frames)-1) if frames[i-1][-4]<.5<=frames[i][-4]]
        if strikes:
            entry=strikes[0]/(len(frames)-1)
    if loop:
        for i,(first,last) in enumerate(zip(frames[0],frames[-1])):
            assert abs(first-last)<.10,(clip_id,i,first,last)
        frames[-1][:]=frames[0]
    return frames,duration,entry

def engine_name(name):
    letters=unicodedata.normalize("NFKD",name).encode("ascii","ignore").decode("ascii")
    # The long dash separates words in the naming convention of the import.
    return re.sub(r"[^A-Za-z0-9]+","_",letters).strip("_")

by_clip={clip['name']:clip for clip in gltf['animations']}
for clip_id,(name,loop,step) in clips.items():
    source_clip=by_clip.get(name) or by_clip[engine_name(name)]
    frames,duration,entry=animation(clip_id,source_clip,loop)
    stride_length=source_clip.get('extras',{}).get('stride',round(step*height_ratio,4))
    manifest['clips'][clip_id]=dict(name=name,start=len(packed),frames=len(frames),
                                   duration=round(duration,6),phase=round(entry,6),loop=loop,step=stride_length)
    for frame in frames:
        assert len(frame)==stride
        packed.extend(frame)
manifest['bytes']=len(packed)*packed.itemsize
manifest['file']=f'{source.stem}-mouvements.bin.gz'
if sys.byteorder!='little':
    packed.byteswap()
output.mkdir(parents=True,exist_ok=True)
(output/manifest['file']).write_bytes(gzip.compress(packed.tobytes(),compresslevel=8,mtime=0))
(output/'mouvements.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')))
print(f'{len(joints)} os, {len(clips)} clips')
