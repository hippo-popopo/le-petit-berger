"""Export every face, texture and groom guide of Border-Collie.blend for the game.

Run Blender with --background --disable-autoexec SOURCE --python this-file -- OUTPUT.
The source is read-only. Files are compressed losslessly.
"""
import gzip
from hashlib import sha256
import json
from math import cos, sin, tau
from pathlib import Path
import sys

import bpy
import numpy as np
from mathutils import Vector

output = Path(sys.argv[sys.argv.index('--') + 1])
output.mkdir(parents=True, exist_ok=True)
dog = bpy.data.objects['Chien · maillage texturé']
mesh = dog.data
scale = 2.24
source_rig = [
    ('tronc', -1, (0, .023, .396)),
    ('tête', 0, (.014, -.383, .473)),
    ('oreilleG', 1, (-.021, -.479, .586)),
    ('oreilleD', 1, (.087, -.347, .591)),
    ('queue', 0, (-.005, .291, .384)),
    ('boutQueue', 4, (-.034, .430, .207)),
    ('épauleG', 0, (-.089, -.196, .344)),
    ('coudeG', 6, (-.124, -.253, .191)),
    ('hancheG', 0, (-.085, .202, .390)),
    ('jarretG', 8, (-.084, .276, .197)),
    ('épauleD', 0, (.064, -.182, .346)),
    ('coudeD', 10, (.061, -.237, .191)),
    ('hancheD', 0, (.089, .190, .390)),
    ('jarretD', 12, (.088, .255, .192)),
    ('mâchoire', 1, (.068, -.432, .450)),
    ('patteAvantG', 7, (-.144, -.313, .040)),
    ('patteArrièreG', 9, (-.151, .261, .037)),
    ('patteAvantD', 11, (.097, -.288, .039)),
    ('patteArrièreD', 13, (.150, .249, .036)),
]

def game_space(p, multiplier=scale):
    points = np.asarray(p)
    return (points[..., [0, 2, 1]] * np.array([multiplier, multiplier, -multiplier])).astype('<f4')

def smooth(a, b, values):
    f = np.clip((values - a)/(b - a), 0, 1)
    return f*f*(3 - 2*f)

def skin(points):
    """Fit the game's fixed hip, knee and foot hierarchy to the original pose."""
    x, y, h = points.T
    weights = np.zeros((len(x), len(source_rig)), np.float32)
    tail = smooth(.269,.385,y) * (1-smooth(.095,.165,np.abs(x+.019)))
    tail = np.maximum(tail, smooth(.326,.402,y))
    tail_tip = smooth(.392,.480,y)
    neck = smooth(.217,.394,-y+.29*(h-.43))*smooth(.257,.464,h)
    head_will = np.maximum(neck, smooth(.335,.442,-y)*smooth(.290,.393,h))
    front = smooth(.075,.208,-y)*(1-smooth(.220,.378,h))*(1-head_will)
    rear = smooth(.105,.190,y)*(1-smooth(.218,.395,h))*(1-tail)
    left = 1-smooth(-.065,.033,x)
    ear = smooth(.567,.645,h)*smooth(.27,.341,-y)
    ear_side = 1-smooth(-.107,-.059,y + x*.87 + .36)
    weights[:,1] = head_will*(1-ear)
    weights[:,2] = head_will*ear*ear_side
    weights[:,3] = head_will*ear*(1-ear_side)
    weights[:,4] = tail*(1-tail_tip)
    weights[:,5] = tail*tail_tip
    for i, (fore, side_is_left) in enumerate(((True,True),(False,True),(True,False),(False,False))):
        leg = (front if fore else rear)*(left if side_is_left else 1-left)
        joint = 1-smooth(.147,.257,h)
        foot = 1-smooth(.040,.089,h)
        weights[:,6+i*2] = leg*(1-joint)
        weights[:,7+i*2] = leg*joint*(1-foot)
        weights[:,15+i] = leg*joint*foot
    weights[:,0] = np.maximum(0,1-weights.sum(axis=1))
    # Keep four influences of the generated skeleton per vertex.
    ids = np.argsort(-weights, axis=1, kind='stable')[:,:4]
    retained = np.take_along_axis(weights, ids, axis=1)
    retained /= retained.sum(axis=1)[:,None]
    quantized = np.rint(retained*255).astype(np.int16)
    quantized[:,0] += 255-quantized.sum(axis=1)
    return ids.astype('u1'), quantized.astype('u1')

def buffer(name, arrays):
    path = output/(name+'.bin.gz')
    sections = {}
    offset = 0
    with path.open('wb') as stream:
        with gzip.GzipFile(filename='',mode='wb',fileobj=stream,compresslevel=5,mtime=0) as writer:
            for label, item in arrays:
                data = np.ascontiguousarray(item)
                sections[label] = [offset, int(data.size)]
                writer.write(memoryview(data).cast('B'))
                offset += data.nbytes
    return {'file': path.name, 'bytes': offset, 'sections': sections}

def geometry():
    print('Exporting the full source mesh', flush=True)
    mesh.calc_loop_triangles()
    source_positions = np.empty(len(mesh.vertices)*3, '<f4')
    mesh.vertices.foreach_get('co', source_positions)
    source_positions = source_positions.reshape((-1,3))
    loops = len(mesh.loops)
    vertex = np.empty(loops, '<u4')
    mesh.loops.foreach_get('vertex_index',vertex)
    uv = np.empty((loops, 2), '<f4')
    mesh.uv_layers.active.uv.foreach_get('vector',uv.ravel())
    normals = np.empty((loops,3), '<f4')
    mesh.corner_normals.foreach_get('vector',normals.ravel())
    # Remove identical corner records only. UV seams and authored normals remain separate.
    keys = np.empty((loops,6), '<u4')
    keys[:,0] = vertex
    keys[:,1:3] = uv.view('<u4')
    keys[:,3:] = normals.view('<u4')
    del vertex
    record = keys.view([(f'key{i}', '<u4') for i in range(6)]).ravel()
    _, pick, inverse = np.unique(record,return_index=True,return_inverse=True)
    p = game_space(source_positions[keys[pick,0]])
    n = game_space(normals[pick],1)
    uv = uv[pick]
    tri = np.empty(3*len(mesh.loop_triangles), '<u4')
    mesh.loop_triangles.foreach_get('loops', tri)
    indices = inverse[tri].astype('<u4')
    del keys, record, inverse, tri, normals
    assert len(indices)//3 == len(mesh.loop_triangles)
    source_bones,source_weights=skin(source_positions)
    source_ids=np.empty(loops, '<u4')
    mesh.loops.foreach_get('vertex_index',source_ids)
    picked=source_ids[pick]
    data = buffer('collie-corps', [('positions',p),('normals',n),('uv',uv),('indices',indices),
                                    ('bones',source_bones[picked]),('weights',source_weights[picked])])
    print('Mesh:',len(mesh.vertices),len(p),len(indices)//3,flush=True)
    return {**data,'vertices':len(p),'triangles':len(indices)//3,'sourceVertices':len(mesh.vertices)}

def grooming():
    groups=[]
    values=[]
    for obj in bpy.data.objects:
        if obj.type!='CURVES':
            continue
        data = obj.data
        count = len(data.curves)
        offsets=np.fromiter((c.first_point_index for c in data.curves),dtype=np.int32,count=count)
        lengths=np.diff(np.append(offsets,len(data.points)))
        assert np.all(lengths==5), 'Unexpected point count in the source groom'
        p = np.empty((count,5,3), '<f4')
        radii = np.empty((count,5), '<f4')
        data.attributes['position'].data.foreach_get('vector',p.ravel())
        data.attributes['radius'].data.foreach_get('value',radii.ravel())
        bones,weights = skin(p[:,0,:])
        points = np.empty((count,5,4), '<f4')
        points[:,:,:3] = game_space(p)
        points[:,:,3] = radii*scale
        mat=data.materials[0]
        color=list(mat.node_tree.nodes.get('Principled Hair BSDF').inputs['Color'].default_value[:3])
        start=sum(g['count'] for g in groups)
        groups.append({'name':obj.name,'count':count,'start':start,'color':color})
        values.append((points,bones,weights))
        print(obj.name,count,flush=True)
    paths,ids,weights=[np.concatenate(items,axis=0) for items in zip(*values)]
    return {**buffer('collie-poils',[('points',paths),('bones',ids),('weights',weights)]),
            'groups':groups,'strands':len(paths),'pointsPerStrand':5}

def fit_neck(rig):
    bias=np.array(rig[1][2:])+[0,.01,-.026]
    axis=Vector((.085,.675,.735)).normalized()
    side=Vector((1,0,0));side=(side-axis*side.dot(axis)).normalized()
    up=side.cross(axis).normalized()
    center=Vector((-.043,.885,.753))
    def inverse(p):
        return Vector((p.x,-p.z,p.y))/scale
    def at(angle,along,gap):
        radial=side*sin(angle)+up*cos(angle)
        position=center+axis*along
        hit,vertex,_,_=dog.ray_cast(inverse(position+radial*.82),inverse(-radial).normalized(),distance=1.02/scale)
        if hit:
            position=Vector(game_space(vertex))
        else:
            position+=radial*.24
        return [round(float(c),6) for c in np.array(position+radial*gap)-bias]
    band=[at(i*tau/42,row,.034) for row in (.09,.030,-.030) for i in range(43)]
    bib=[at(tau*.5+(i/4-1)*(.78*(1-j/8)+.06), -.015-j*.039,.043)
         for j in range(9) for i in range(9)]
    return {'band':band,'bib':bib}

def textures():
    material=mesh.materials[0]
    values={}
    for role, name in [('body','Image Texture'),('roughness','Image Texture.001'),('normal','Image Texture.002')]:
        image=material.node_tree.nodes[name].image
        suffix='jpg' if image.file_format=='JPEG' else 'png'
        path=output/('collie-'+role+'.'+suffix)
        raw=image.packed_file.data
        path.write_bytes(raw)
        values[role]={'file':path.name,'size':list(image.size),'sha256':sha256(raw).hexdigest()}
    return values

armature=[[name,parent,*game_space(position).tolist()] for name,parent,position in source_rig]
feet=[{'rest':joint[2:],'stance':joint[2:]} for joint in armature[15:]]
data={'rig':armature,'feet':feet,'neck':fit_neck(armature),'body':geometry(),'groom':grooming(),'textures':textures()}
(output/'collie.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
print(json.dumps({k:data[k] for k in ['body','groom','textures']},ensure_ascii=False),flush=True)
