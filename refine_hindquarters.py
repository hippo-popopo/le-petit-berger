"""Rebind and paint the hip-to-thigh transition on the three supplied dogs.

Run in Blender: blender -b --python refine_hindquarters.py -- NORMALIZED_GLB_DIR OUTPUT_DIR
"""
import json
from pathlib import Path
from shutil import copyfile
import sys

import numpy as np
from mathutils import Matrix, Quaternion, Vector

sys.path.insert(0,str(Path(__file__).parent))
from prepare_pack import read_glb, write_glb

source, output = map(Path,sys.argv[sys.argv.index('--')+1:])
catalogue = json.loads((source/'import.json').read_text())
components={5121:'u1',5123:'<u2',5125:'<u4',5126:'<f4'}
width={'SCALAR':1,'VEC3':3,'VEC4':4,'MAT4':16}

def values(data,binary,index):
    accessor=data['accessors'][index]
    view=data['bufferViews'][accessor['bufferView']]
    dtype=np.dtype(components[accessor['componentType']])
    stride=width[accessor['type']]*dtype.itemsize
    start=accessor.get('byteOffset',0)+view.get('byteOffset',0)
    return np.ndarray((accessor['count'],width[accessor['type']]),dtype,binary,start,
                      (view.get('byteStride',stride),dtype.itemsize))

def append_translation(data,binary,original,position):
    count=data['accessors'][original]['count']
    assert len(binary)%4==0
    values=np.tile(np.array(position,dtype='<f4'),(count,1))
    view=len(data['bufferViews'])
    data['bufferViews'].append(dict(buffer=0,byteOffset=len(binary),byteLength=values.nbytes))
    binary.extend(values.tobytes())
    index=len(data['accessors'])
    data['accessors'].append(dict(bufferView=view,componentType=5126,count=count,type='VEC3'))
    return index

def smooth(a,b,values):
    t=np.clip((values-a)/(b-a),0,1)
    return t*t*(3-2*t)

def bind(data,binary):
    nodes=data['nodes']
    joint_ids=data['skins'][0]['joints']
    parents={child:i for i,node in enumerate(nodes) for child in node.get('children',[])}
    names=[nodes[i]['name'] for i in joint_ids]
    world={}
    inverses=values(data,binary,data['skins'][0]['inverseBindMatrices'])
    for row,i in enumerate(joint_ids):
        node=nodes[i]
        x,y,z,w=node.get('rotation',(0,0,0,1))
        transform=Matrix.LocRotScale(Vector(node.get('translation',(0,0,0))),
                                     Quaternion((w,x,y,z)).normalized(),Vector((1,1,1)))
        parent=world.get(parents.get(i))
        world[i]=parent@transform if parent is not None else transform
        inverses[row]=np.asarray(world[i].inverted()).T.ravel()
    return names, np.asarray([tuple(world[i].translation) for i in joint_ids])

def transfer_thighs(data,binary,names,rest):
    attributes=data['meshes'][0]['primitives'][0]['attributes']
    xyz=values(data,binary,attributes['POSITION'])
    joints=values(data,binary,attributes['JOINTS_0'])
    weights=values(data,binary,attributes['WEIGHTS_0'])
    dense=np.zeros((len(xyz),len(names)),dtype=np.float32)
    rows=np.arange(len(xyz))[:,None]
    np.add.at(dense,(rows,joints),weights)
    donors=[names.index(bone) for bone in ('Bassin','Dos','Root')]
    modified=np.zeros(len(xyz),dtype=bool)
    report={}
    for side,sign in (('HL',1),('HR',-1)):
        thigh=names.index(side+'_Proximal')
        knee=names.index(side+'_Intermediaire')
        hip=rest[thigh]
        axis=rest[knee]-hip
        length=np.linalg.norm(axis)
        along=(xyz-hip)@axis/(length*length)
        outer=smooth(.43,.88,sign*xyz[:,0]/abs(hip[0]))
        forward=np.abs(xyz[:,2]-hip[2]-np.clip(along,0,1)*axis[2])/length
        behind_haunch=1-smooth(.34,.80,forward)
        thigh_band=smooth(-.23,.42,along)*(1-smooth(.83,1.22,along))
        target=.71*outer*behind_haunch*thigh_band
        available=dense[:,donors].sum(axis=1)
        transfer=np.minimum(np.maximum(0,target-dense[:,thigh]),available*.89)
        ratio=np.divide(transfer,available,out=np.zeros_like(transfer),where=available>0)
        dense[:,donors]*=1-ratio[:,None]
        dense[:,thigh]+=transfer
        modified|=transfer>.0001
        report[side]={'vertices':int(np.count_nonzero(transfer>.0001)),
                      'average_weight_gain':round(float(transfer[transfer>.0001].mean()),3)}
        assert report[side]['vertices']>100,side
    # Export into the original four skin slots. Away from the hips every byte is preserved.
    changed=dense[modified]
    order=np.argsort(-changed,axis=1)[:,:4]
    new=np.take_along_axis(changed,order,axis=1)
    joints[modified]=order.astype(joints.dtype)
    weights[modified]=new/new.sum(axis=1)[:,None]
    return report

def anchor_hips(data,binary):
    hips={i for i,node in enumerate(data['nodes']) if node['name'] in ('HL_Proximal','HR_Proximal')}
    assert len(hips)==2
    corrected={}
    for animation in data['animations']:
        for channel in animation['channels']:
            target=channel['target']
            if target['node'] not in hips or target['path']!='translation':
                continue
            original=animation['samplers'][channel['sampler']]
            position=tuple(data['nodes'][target['node']]['translation'])
            key=(original['output'],position)
            if key not in corrected:
                corrected[key]=append_translation(data,binary,original['output'],position)
            channel['sampler']=len(animation['samplers'])
            animation['samplers'].append({**original,'output':corrected[key]})
    data['buffers'][0]['byteLength']=len(binary)
    return len(corrected)

report={}
for race in catalogue['breeds']:
    label=race['id']
    folder=output/label
    folder.mkdir(parents=True,exist_ok=True)
    file=race['file']
    data,original=read_glb(source/label/file)
    binary=bytearray(original)
    names,rest=bind(data,binary)
    weights=transfer_thighs(data,binary,names,rest)
    tracks=anchor_hips(data,binary)
    write_glb(folder/file,data,binary)
    for coat in race['coats']:
        file=coat['texture']
        copyfile(source/label/file,folder/file)
    report[label]={'weights':weights,'hip_translation_tracks':tracks}
gear=output/'Accessoires'
gear.mkdir(exist_ok=True)
for item in catalogue['gear']:
    name=item['file']
    copyfile(source/'Accessoires'/name,gear/name)
copyfile(source/'import.json',output/'import.json')
(output/'bilan-articulations.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
