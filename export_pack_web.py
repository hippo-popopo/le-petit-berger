"""Pack the Blender glTF geometry and motion into immutable browser resources.

Run with Blender's Python: blender -b --python export_pack_web.py -- STAGE PACK NECK_REFERENCE.
The stage is the same normalized glTF import directory used by Unreal.
"""
import gzip
import json
from pathlib import Path
import struct
import sys
from shutil import copyfile

import numpy as np

stage, output, neck_ref = map(Path, sys.argv[sys.argv.index('--')+1:])
catalogue = json.loads((stage/'import.json').read_text())
scale = 2.24
types = {5121:'u1', 5123:'<u2', 5125:'<u4', 5126:'<f4'}
widths = {'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}

def unpack(path):
    raw = path.read_bytes()
    magic, version, _, size, kind = struct.unpack_from('<4sIII4s', raw)
    assert (magic, version, kind) == (b'glTF', 2, b'JSON')
    return json.loads(raw[20:20+size]), memoryview(raw)[28+size:]

def accessor(data, binary, index):
    descriptor = data['accessors'][index]
    view = data['bufferViews'][descriptor['bufferView']]
    dtype = np.dtype(types[descriptor['componentType']])
    width = widths[descriptor['type']]
    start = view.get('byteOffset', 0) + descriptor.get('byteOffset', 0)
    return np.ndarray((descriptor['count'], width), dtype, binary, start,
                      (view.get('byteStride', width*dtype.itemsize), dtype.itemsize))

def pack_mesh(path, target):
    data, binary = unpack(path)
    blob = bytearray()

    def save(values):
        start = (len(blob)+3)&~3
        blob.extend(bytes(start-len(blob)))
        blob.extend(values.tobytes())
        return [start, values.size]

    def image(ref):
        index = data['textures'][ref['index']]['source']
        desc = data['images'][index]
        view = data['bufferViews'][desc['bufferView']]
        start = view.get('byteOffset', 0)
        suffix = 'png' if desc['mimeType']=='image/png' else 'jpg'
        file = f'{path.stem}-texture-{index}.{suffix}'
        (target/file).write_bytes(binary[start:start+view['byteLength']])
        return {'file': file}

    materials = []
    for material in data['materials']:
        pbr = material['pbrMetallicRoughness']
        color = pbr.get('baseColorFactor', [1,1,1,1])
        entry = dict(color=color[:3],opacity=color[3],roughness=pbr.get('roughnessFactor',1),
                     metalness=pbr.get('metallicFactor',1),double=material.get('doubleSided',False),
                     alphaMode=material.get('alphaMode','OPAQUE'),alphaCutoff=material.get('alphaCutoff',.5))
        for spec, field in ((pbr,'baseColorTexture'),(pbr,'metallicRoughnessTexture'),(material,'normalTexture')):
            if field in spec:
                entry[field] = image(spec[field])
        materials.append(entry)

    parts = []
    for primitive in data['meshes'][0]['primitives']:
        material = primitive['material']
        if materials[material]['alphaMode']=='MASK' and materials[material]['opacity']==0 and 'baseColorTexture' not in materials[material]:
            continue
        attributes = primitive['attributes']
        read = lambda field: accessor(data, binary, attributes[field])
        positions = read('POSITION')*scale
        sections = {'position':save(positions), 'normal':save(read('NORMAL'))}
        if 'TEXCOORD_0' in attributes:
            sections['uv'] = save(read('TEXCOORD_0'))
        if 'TANGENT' in attributes:
            sections['tangent'] = save(read('TANGENT'))
        if 'JOINTS_0' in attributes:
            joints = read('JOINTS_0')
            weights = read('WEIGHTS_0').astype(np.float64)
            assert joints.max() < 32 and weights.sum(axis=1).min() > .99
            weights = np.rint(weights*65535/weights.sum(axis=1)[:,None]).astype(np.int32)
            weights[np.arange(len(weights)),weights.argmax(axis=1)] += 65535-weights.sum(axis=1)
            sections['skinIndex'] = save(joints.astype('u1'))
            sections['skinWeight'] = save(weights.astype('<u2'))
        index = accessor(data, binary, primitive['indices'])
        index_type = 'u16' if len(positions) <= 65536 else 'u32'
        sections['index'] = save(index.astype('<u2' if index_type=='u16' else '<u4'))
        parts.append(dict(material=material,sections=sections,indexType=index_type))
    bounds = [np.min([accessor(data,binary,p['attributes']['POSITION']).min(axis=0) for p in data['meshes'][0]['primitives']],axis=0)*scale,
              np.max([accessor(data,binary,p['attributes']['POSITION']).max(axis=0) for p in data['meshes'][0]['primitives']],axis=0)*scale]
    file = f'{path.stem}-maillage.bin.gz'
    (target/file).write_bytes(gzip.compress(blob, compresslevel=7, mtime=0))
    return dict(model={'file':file,'bytes':len(blob),'parts':parts},materials=materials,
                bounds=[point.tolist() for point in bounds])

def qualify(item, directory):
    if isinstance(item, list):
        for value in item:
            qualify(value,directory)
    elif isinstance(item, dict):
        if 'file' in item:
            item['file'] = f"{directory}/{item['file']}"
        for value in item.values():
            qualify(value,directory)

breeds = {}
for race in catalogue['breeds']:
    name = race['id']
    target = output/name
    asset = pack_mesh(stage/name/race['file'],target)
    motion = json.loads((target/'mouvements.json').read_text())
    coats = []
    for coat in race['coats']:
        file = coat['texture']
        copyfile(stage/name/file,target/file)
        coats.append(dict(id=coat['id'],label=coat['label'],asset={'file':file}))
    # The selectable base coat takes the place of the texture from the GLB.
    asset['materials'][0].pop('baseColorTexture',None)
    asset.update(id=name,label=race['label'],height=race['height'],mounts=race['mounts'],motion=motion,coats=coats)
    qualify(asset,name)
    breeds[name] = asset

gear = {}
used_gear = {'01_collier_cuir','02_collier_nylon','03_bandana','04_harnais_y','10_impermeable','11_sacoches'}
target = output/'Accessoires'
target.mkdir(exist_ok=True)
for item in catalogue['gear']:
    name = item['id']
    if name in used_gear:
        asset = pack_mesh(stage/'Accessoires'/item['file'],target)
        asset['mount'] = item['mount']
        qualify(asset,'Accessoires')
        gear[name] = asset
manifest = dict(default='Border_Collie',breeds=breeds,gear=gear,neck=json.loads(neck_ref.read_text())['neck'])
(output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')))
