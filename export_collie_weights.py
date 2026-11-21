"""Transfer the rigged Blender reference's skin to the unchanged game mesh and groom.

Open Border-Collie-Animations.blend with Blender in background and run this script
with -- GAME_ASSET_DIR. Generate mouvements.json with retarget_border_collie.py first.
"""
import gzip
import json
from pathlib import Path
import sys

import bpy
import numpy as np
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

directory = Path(sys.argv[sys.argv.index('--')+1])
asset = json.loads((directory/'collie.json').read_text())
motion = json.loads((directory/'mouvements.json').read_text())
names = {bone[0]: i for i,bone in enumerate(motion['rig'])}
dog = bpy.data.objects['Chien · maillage texturé']
mesh = dog.data
scale = 2.24

positions = np.empty((len(mesh.vertices),3),'<f4')
mesh.vertices.foreach_get('co', positions.ravel())
group_mapping = [names[group.name] for group in dog.vertex_groups]
bone_ids = np.zeros((len(positions),4),dtype='u1')
bone_weights = np.zeros((len(positions),4),dtype='<f4')
for vertex in mesh.vertices:
    assert len(vertex.groups) in (1,2,3,4)
    for channel, group in enumerate(sorted(vertex.groups,key=lambda value:-value.weight)):
        bone_ids[vertex.index,channel] = group_mapping[group.group]
        bone_weights[vertex.index,channel] = group.weight

def read_section(spec, key):
    offset, count = spec['sections'][key]
    with gzip.open(directory/spec['file'],'rb') as stream:
        stream.seek(offset)
        return np.frombuffer(stream.read(count*4),dtype='<f4')

def position_key(coords):
    coords = np.array(coords, dtype='<f4', order='C', copy=True)
    coords[coords==0] = 0
    return coords.view([('x','<f4'),('y','<f4'),('z','<f4')]).ravel()

def blender_positions(coords):
    return coords[..., [0,2,1]] * np.array([1,-1,1])/scale

game_positions = read_section(asset['body'],'positions').reshape((-1,3))
reference_positions = positions[:,[0,2,1]] * np.array([scale,scale,-scale])
source_keys, index = np.unique(position_key(reference_positions),return_index=True)
wanted = position_key(game_positions)
found = np.searchsorted(source_keys,wanted).clip(max=len(source_keys)-1)
matches = source_keys[found]==wanted
mapping = index[found]
print('Correspondance exacte du corps', int(matches.sum()), len(found),flush=True)
assert matches.mean()>.99, 'The meshes are not from the same reference'
if not matches.all():
    tree = KDTree(len(positions))
    for i,coords in enumerate(positions):
        tree.insert(coords,i)
    tree.balance()
    furthest = 0
    unmatched = np.flatnonzero(~matches)
    for j,point in zip(unmatched,blender_positions(game_positions[unmatched])):
        _,mapping[j],distance = tree.find(point)
        furthest=max(furthest,distance)
    print('Écart maximal des raccords',furthest,flush=True)
    assert furthest<.00015
    del tree

mesh.calc_loop_triangles()
assert len(mesh.loop_triangles)==asset['body']['triangles']
triangles = np.empty((len(mesh.loop_triangles),3),'<i4')
mesh.loop_triangles.foreach_get('vertices',triangles.ravel())
tree = BVHTree.FromPolygons(positions,triangles,all_triangles=True)
groom = asset['groom']
roots = blender_positions(read_section(groom,'points').reshape((-1,groom['pointsPerStrand'],4))[:,0,:3])
nearest = np.empty_like(roots)
faces = np.empty(len(roots),'<i4')
furthest = 0
for i,root in enumerate(roots):
    point,_,face,distance = tree.find_nearest(root)
    assert face is not None
    nearest[i],faces[i] = point,face
    furthest=max(furthest,distance)
print('Brins associés à la peau',len(roots),'écart maximal',furthest,flush=True)
assert furthest<.015

corners = triangles[faces]
a,b,c = positions[corners].transpose(1,0,2)
u,v,p = b-a,c-a,nearest-a
dot = lambda a,b: np.einsum('ij,ij->i',a,b)
uu,vv,uv,pu,pv = dot(u,u),dot(v,v),dot(u,v),dot(p,u),dot(p,v)
denominator = np.maximum(uu*vv-uv*uv,1e-27)
beta = (vv*pu-uv*pv)/denominator
gamma = (uu*pv-uv*pu)/denominator
barycentric = np.clip(np.stack((1-beta-gamma,beta,gamma),axis=1),0,1)
barycentric /= barycentric.sum(axis=1)[:,None]
scores = np.zeros((len(roots),len(names)),'<f4')
np.add.at(scores, (np.arange(len(roots))[:,None,None],bone_ids[corners]),bone_weights[corners]*barycentric[:,:,None])
groom_ids = np.argsort(-scores,axis=1)[:,:4].astype('u1')
groom_weights = np.take_along_axis(scores,groom_ids,axis=1)

def normalize(weights):
    quantized = np.rint(weights/weights.sum(axis=1)[:,None]*65535).astype('<i4')
    quantized[:,0] += 65535 - quantized.sum(axis=1)
    assert np.min(quantized)>=0 and np.max(quantized)<=65535
    return quantized.astype('<u2')

parts = [
    ('bodyBones',bone_ids[mapping]),
    ('bodyWeights',normalize(bone_weights[mapping])),
    ('groomBones',groom_ids),
    ('groomWeights',normalize(groom_weights))
]
spec = {'file':'collie-articulations.bin.gz','sections':{},'bytes':0}
with (directory/spec['file']).open('wb') as stream:
    with gzip.GzipFile(filename='',mode='wb',fileobj=stream,compresslevel=7,mtime=0) as writer:
        for label,values in parts:
            spec['sections'][label]=[spec['bytes'],int(values.size)]
            spec['bytes']+=values.nbytes
            writer.write(memoryview(values).cast('B'))
(directory/'articulations.json').write_text(json.dumps(spec,separators=(',',':')))
print(spec)
