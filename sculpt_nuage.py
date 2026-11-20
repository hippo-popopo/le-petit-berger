"""Adapt the licensed imdjs GLB for Le Petit Berger.

Base model: border collie dog(mesh hair) by imdjs, CC BY 4.0.
Source: https://sketchfab.com/3d-models/border-collie-dogmesh-hair-516a1a06c6f248b6b8c28801eb1397ac
Run in Blender with --python adapt_nuage.py -- path/to/source.glb.
"""
import base64
import json
from math import cos, pi, sin
from pathlib import Path
from struct import unpack_from
import subprocess
import sys

import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import numpy as np

ROOT=Path(__file__).resolve().parent
SOURCE=Path(sys.argv[sys.argv.index('--')+1])
ASSET_URL='https://sketchfab.com/3d-models/border-collie-dogmesh-hair-516a1a06c6f248b6b8c28801eb1397ac'
LICENSE_URL='https://creativecommons.org/licenses/by/4.0/'
raw=SOURCE.read_bytes()
size,=unpack_from('<I',raw,12)
glb=json.loads(raw[20:20+size])
binary=raw[28+size:]

def read_accessor(index):
    accessor=glb['accessors'][index]
    buffer=glb['bufferViews'][accessor['bufferView']]
    length={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[accessor['type']]
    dtype=np.dtype({5121:'u1',5123:'<u2',5125:'<u4',5126:'<f4'}[accessor['componentType']])
    offset=buffer.get('byteOffset',0)+accessor.get('byteOffset',0)
    stride=buffer.get('byteStride',length*dtype.itemsize)
    return np.ndarray((accessor['count'],length),dtype=dtype,buffer=binary,offset=offset,
                      strides=(stride,dtype.itemsize)).copy()

def texture(name,index,size,quality=None):
    asset=glb['images'][index]
    buffer=glb['bufferViews'][asset['bufferView']]
    start=buffer.get('byteOffset',0)
    suffix='.png' if asset['mimeType']=='image/png' else '.jpg'
    extracted=ROOT/('source-'+str(index)+suffix)
    dest=ROOT/(name+suffix)
    extracted.write_bytes(binary[start:start+buffer['byteLength']])
    command=['sips','-Z',str(size)]
    if quality is not None:
        command+=['-s','format','jpeg','-s','formatOptions',str(quality)]
    subprocess.run([*command,str(extracted),'--out',str(dest)],check=True,stdout=subprocess.DEVNULL)
    return dest

maps={
    'body':texture('collie-body',4,1536,83),
    'face':texture('collie-face',1,1152,82),
    'fur':texture('collie-fur',7,1152),
    'normal':texture('collie-fur-normal',6,768,75),
}

# The source was exported standing in an asymmetric step. Keep its anatomy and
# store separate rest and contact targets for the animation solver.
origin=np.array([.01,.11194,.605],dtype=np.float32)
unit=.262
def normalized(p):
    return (np.asarray(p,dtype=np.float32)-origin)*unit

paw_source=[
    (-.193,.413,4.188),(-.428,.282,-3.653),(.143,.687,4.320),(.416,.767,-5.039),
]
paw_ground=(.239,.112,.530,.605)
raw_rig=[
    ('tronc',-1,(0,3.30,.48)),
    ('tête',0,(.045,4.19,3.20)),
    ('oreilleG',1,(-.36,4.86,4.27)),
    ('oreilleD',1,(.42,4.84,4.27)),
    ('queue',0,(.035,4.08,-3.31)),
    ('boutQueue',4,(.018,4.12,-5.26)),
    ('épauleG',0,(-.62,3.30,2.76)),
    ('coudeG',6,(-.46,1.95,2.90)),
    ('hancheG',0,(-.61,3.51,-2.61)),
    ('jarretG',8,(-.52,1.70,-2.72)),
    ('épauleD',0,(.60,3.29,2.74)),
    ('coudeD',10,(.40,1.96,2.88)),
    ('hancheD',0,(.61,3.48,-2.74)),
    ('jarretD',12,(.43,1.80,-4.03)),
    ('mâchoire',1,(.075,3.86,4.47)),
    *((name,7+2*i,paw_source[i]) for i,name in enumerate(
        ('patteAvantG','patteArrièreG','patteAvantD','patteArrièreD'))),
]
bones=[[name,parent,*[float(v) for v in normalized(pos)]] for name,parent,pos in raw_rig]
feet=[]
for index,(toe,sole) in enumerate(zip(paw_source,paw_ground)):
    x,y,z=toe
    # Both feet return to a slightly staggered support rather than the scan pose.
    landing=((-0.39,3.25),(-.49,-3.40),(.38,3.42),(.48,-3.80))[index]
    feet.append({
        'rest':normalized(toe).tolist(),
        'stance':[float(normalized((landing[0],y,landing[1]))[0]),
                  (y-sole)*unit,float(normalized((landing[0],y,landing[1]))[2])],
    })

def smooth(a,b,x):
    t=np.clip((x-a)/(b-a),0,1)
    return t*t*(3-2*t)

def split_weights(raw_pos,face=False,paw_labels=None):
    x,y,z=raw_pos.T
    weights=np.zeros((len(x),len(bones)),np.float32)
    front=smooth(1.02,1.98,z)
    back=smooth(-.69,-1.65,z)
    if face:
        jaw=(1-smooth(3.83,4.09,y+(4.99-z)*.095))*smooth(4.44,4.94,z)
        weights[:,14]=jaw
        weights[:,1]=1-jaw
        return weights
    neck=smooth(2.68,4.36,z+(y-3.68)*.55)*smooth(2.50,3.85,y)
    tail=smooth(-2.85,-4.13,z)*smooth(2.63,3.42,y)
    tip=smooth(-4.63,-6.20,z)
    ear=smooth(4.85,5.33,y)*smooth(.12,.31,abs(x))*smooth(3.76,4.24,z)
    jaw=smooth(4.49,5.07,z)*(1-smooth(3.84,4.10,y+(4.99-z)*.08))
    head_branch=np.maximum(ear,jaw)
    weights[:,2]=neck*ear*(x<0)
    weights[:,3]=neck*ear*(x>=0)
    weights[:,14]=neck*jaw
    weights[:,1]=neck*(1-head_branch)
    weights[:,4]=tail*(1-tip)
    weights[:,5]=tail*tip

    for i,(fore,side) in enumerate(((True,-1),(False,-1),(True,1),(False,1))):
        bone=6+2*i
        if fore:
            leg=front*(1-smooth(1.94,3.16,y)) 
            joint=1-smooth(1.51,2.30,y)
        else:
            leg=back*(1-smooth(1.82,3.31,y))*(1-tail)
            joint=1-smooth(1.42,2.20,y)
        # A narrow centre blend at the body, and independent paws below it.
        threshold=np.where((y<1.4)&(z>1.6),.022,0.)
        side_amount=smooth(-.15,.13,(x-threshold)*side)
        if paw_labels is not None:
            side_amount=np.where(paw_labels>=0,paw_labels==i,side_amount)
        weight=leg*side_amount*(1-neck)
        paw=1-smooth(paw_source[i][1]+.12,paw_source[i][1]+.55,y)
        weights[:,bone]=weight*(1-joint)
        weights[:,bone+1]=weight*joint*(1-paw)
        weights[:,15+i]=weight*joint*paw
    weights[:,0]=np.maximum(0,1-weights.sum(axis=1))
    return weights

def compact(primitive,kind):
    attrs=primitive['attributes']
    points=read_accessor(attrs['POSITION'])
    normal=read_accessor(attrs['NORMAL'])
    uv=read_accessor(attrs['TEXCOORD_0'])
    indices=read_accessor(primitive['indices']).ravel()
    rgb=read_accessor(attrs['COLOR_0']) if kind=='fur' else None
    quant_pos=np.rint(normalized(points)*8192).astype('<i2')
    quant_nrm=np.rint(np.clip(normal,-1,1)*127).astype('i1')
    assert np.all(np.isfinite(uv))
    assert uv.min()>-.04 and uv.max()<1.04, (kind,uv.min(),uv.max())
    quant_uv=np.rint(np.clip(uv,0,1)*65535).astype('<u2')
    rgb8=None if rgb is None else np.rint(np.clip(rgb,0,1)*255).astype('u1')
    fields=[a.astype('i4') for a in [quant_pos,quant_nrm,quant_uv]]
    if rgb8 is not None: fields.append(rgb8.astype('i4'))
    _,select,lookup=np.unique(np.column_stack(fields),axis=0,return_index=True,return_inverse=True)
    return {'kind':kind,'raw':points[select],'p':quant_pos[select],
            'n':quant_nrm[select],'uv':quant_uv[select],
            'c':None if rgb8 is None else rgb8[select],
            'i':lookup[indices].astype('<u4' if len(select)>65535 else '<u2')}

body=compact(glb['meshes'][2]['primitives'][0],'body')
face=compact(glb['meshes'][0]['primitives'][0],'face')
fur=compact(glb['meshes'][3]['primitives'][0],'fur')
parts=[body,face,fur]
triangles=body['i'].reshape(-1,3)
bvh=BVHTree.FromPolygons([Vector(p) for p in body['raw']],triangles.tolist(),all_triangles=True)

def separate_paws(points, faces):
    # Weld UV seams temporarily, then identify the legs by connectivity.
    # The original front paws partially overlap in X in the source step.
    joined,index=np.unique(np.rint(points*100000).astype(np.int32),axis=0,return_inverse=True)
    eligible=joined[:,1]<186000
    parents=list(range(len(joined)))
    def root(i):
        while parents[i]!=i:
            parents[i]=parents[parents[i]]
            i=parents[i]
        return i
    for face in index[faces]:
        low=[v for v in face if eligible[v]]
        for other in low[1:]:
            parents[root(other)]=root(low[0])
    groups={}
    for i in np.flatnonzero(eligible):
        groups.setdefault(root(i),[]).append(i)
    marks=np.full(len(joined),-1,dtype=np.int8)
    for group in groups.values():
        if len(group)<60:
            continue
        center=joined[group].mean(axis=0)
        leg=(0 if center[2]>0 else 1)+(0 if center[0]<0 else 2)
        marks[group]=leg
    assert set(marks.tolist())=={-1,0,1,2,3}
    return marks[index]

body_skin=split_weights(body['raw'],paw_labels=separate_paws(body['raw'],triangles))

def coat_weights():
    # Transfer surface weights with barycentric interpolation, so a card
    # crossing the silhouette never inherits the opposite leg by X alone.
    locations=[]
    faces=[]
    for p in fur['raw']:
        hit,_,face,_=bvh.find_nearest(Vector(p))
        assert hit is not None and face is not None
        locations.append(hit)
        faces.append(face)
    index=triangles[faces]
    anchors=body['raw'][index]
    b=anchors[:,1]-anchors[:,0]
    c=anchors[:,2]-anchors[:,0]
    d=np.asarray(locations)-anchors[:,0]
    dot=lambda u,v: np.einsum('ij,ij->i',u,v)
    bb,bc,cc=dot(b,b),dot(b,c),dot(c,c)
    db,dc=dot(d,b),dot(d,c)
    det=np.maximum(bb*cc-bc*bc,1e-15)
    s=np.clip((cc*db-bc*dc)/det,0,1)
    t=np.clip((bb*dc-bc*db)/det,0,1)
    coeff=np.column_stack([np.maximum(0,1-s-t),s,t])
    coeff/=coeff.sum(axis=1)[:,None]
    return np.einsum('ij,ijk->ik',coeff,body_skin[index])

values=[body_skin,split_weights(face['raw'],face=True),coat_weights()]
for part,weights in zip(parts,values):
    selected=np.argsort(-weights,axis=1)[:,:4]
    retained=np.take_along_axis(weights,selected,axis=1)
    retained/=retained.sum(axis=1)[:,None]
    weights8=np.rint(retained*255).astype(np.int16)
    weights8[:,0]+=255-weights8.sum(axis=1)
    part['b']=selected.astype('u1')
    part['w']=weights8.astype('u1')
    assert np.all(part['w'].sum(axis=1)==255)
    print(part['kind'],len(part['p']),'vertices',len(part['i'])//3,'triangles')

neck_axis=Vector((0,.62,.784)).normalized()
neck_up=Vector((0,neck_axis.z,-neck_axis.y))
neck_center=Vector((.018,3.69,2.92))
neck_origin=Vector(bones[1][2:])+Vector((0,.01,-.026))

def fit_neck(angle,along,clearance):
    radial=Vector((sin(angle),0,0))+neck_up*cos(angle)
    section=neck_center+neck_axis*along
    hit,_,_,_=bvh.ray_cast(section+radial*3.25,-radial,4.45)
    assert hit is not None, (angle,along)
    return [round(v,5) for v in Vector(normalized(hit))+radial*clearance-neck_origin]
band=[fit_neck(i*2*pi/42,row,.052)
      for row in (.23,.07,-.13) for i in range(43)]
bib=[]
for y in range(9):
    t=y/8
    for x in range(9):
        u=x/8
        angle=pi+(u*2-1)*(.81*(1-t)+.028)
        fold=.006*cos(u*4*pi+1.1*t)*sin(t*pi)
        bib.append(fit_neck(angle,.11-.63*t,.059+fold))

def packed(array):
    return base64.b64encode(array.tobytes()).decode()

def game_part(part):
    section={k:packed(part[k]) for k in ('p','n','uv','i','b','w')}
    if part['c'] is not None:
        section['c']=packed(part['c'])
    return {**section,'kind':part['kind'],'wide':part['i'].dtype.itemsize==4,
            'vertices':len(part['p']),'faces':len(part['i'])//3}

data={'rig':bones,'feet':feet,'neck':{'band':band,'bib':bib},
      'parts':[game_part(part) for part in parts],
      'textures':{kind: 'data:image/'+('png' if path.suffix=='.png' else 'jpeg')+';base64,'+
                         base64.b64encode(path.read_bytes()).decode() for kind,path in maps.items()}}
(ROOT/'nuage.json').write_text(json.dumps(data,separators=(',',':'),ensure_ascii=False))

# Publish an editable source with the fitted skeleton, UVs and packed maps.
bpy.ops.wm.read_factory_settings(use_empty=True)
armature=bpy.data.armatures.new('Squelette de Nuage')
rig=bpy.data.objects.new('Squelette de Nuage',armature)
bpy.context.scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active=rig
rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
for name,parent,x,y,z in bones:
    bone=armature.edit_bones.new(name)
    bone.head=(x,y,z)
    bone.tail=(x,y-.12,z)
    if parent>=0:
        bone.parent=armature.edit_bones[bones[parent][0]]
bpy.ops.object.mode_set(mode='OBJECT')
for part in parts:
    kind=part['kind']
    mesh=bpy.data.meshes.new(kind)
    mesh.from_pydata((part['p']/8192).tolist(),[],part['i'].reshape(-1,3).tolist())
    mesh.update()
    obj=bpy.data.objects.new({'body':'Nuage · corps','face':'Nuage · yeux et bouche','fur':'Nuage · pelage'}[kind],mesh)
    bpy.context.scene.collection.objects.link(obj)
    for polygon in mesh.polygons:
        polygon.use_smooth=True
    if hasattr(mesh,'normals_split_custom_set_from_vertices'):
        mesh.normals_split_custom_set_from_vertices((part['n']/127).tolist())
    indices=np.zeros(len(mesh.loops),dtype=np.int32)
    mesh.loops.foreach_get('vertex_index',indices)
    uv=part['uv'][indices].astype(np.float32)/65535
    uv[:,1]=1-uv[:,1]
    mesh.uv_layers.new(name='UV de l’artiste').uv.foreach_set('vector',uv.ravel())
    if part['c'] is not None:
        attr=mesh.color_attributes.new(name='Pigment du pelage',type='FLOAT_COLOR',domain='POINT')
        colors=np.ones((len(part['p']),4),dtype=np.float32)
        colors[:,:3]=part['c']/255
        attr.data.foreach_set('color',colors.ravel())
    for name,*_ in bones:
        obj.vertex_groups.new(name=name)
    for i,(joints,weights) in enumerate(zip(part['b'],part['w'])):
        for j,w in zip(joints,weights):
            if w:
                obj.vertex_groups[int(j)].add([i],int(w)/255,'REPLACE')
    deform=obj.modifiers.new('Squelette de Nuage','ARMATURE')
    deform.object=rig
    obj.parent=rig
    material=bpy.data.materials.new('Nuage · '+kind)
    material.use_nodes=True
    nodes=material.node_tree.nodes
    links=material.node_tree.links
    standard=nodes.get('Principled BSDF')
    standard.inputs['Roughness'].default_value={'body':.77,'face':.52,'fur':.84}[kind]
    texture_node=nodes.new('ShaderNodeTexImage')
    texture_node.image=bpy.data.images.load(str(maps[kind]),check_existing=True)
    texture_node.image.pack()
    color=texture_node.outputs['Color']
    if kind=='fur':
        pigment=nodes.new('ShaderNodeVertexColor')
        pigment.layer_name='Pigment du pelage'
        tint=nodes.new('ShaderNodeMixRGB')
        tint.blend_type='MULTIPLY'
        tint.inputs[0].default_value=1.0
        links.new(color,tint.inputs[1])
        links.new(pigment.outputs['Color'],tint.inputs[2])
        color=tint.outputs[0]
        links.new(texture_node.outputs['Alpha'],standard.inputs['Alpha'])
    links.new(color,standard.inputs['Base Color'])
    mesh.materials.append(material)
rig.rotation_euler.x=pi/2
rig.hide_set(True)
rig.hide_render=False
credit=bpy.data.texts.new('Crédits et licence')
credit.write(f'border collie dog(mesh hair) par imdjs. CC BY 4.0.\n{ASSET_URL}\n{LICENSE_URL}\n'
             'Adaptation pour Le Petit Berger · squelette, poses, attaches, textures adaptées au Web.\n')
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_distance=4.54
        area.spaces.active.region_3d.view_location=(0,0,.75)
        area.spaces.active.region_3d.view_rotation=Vector((-.67,.78,-.24)).to_track_quat('-Z','Y')
        area.spaces.active.shading.color_type='TEXTURE'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'Nuage.blend'))
