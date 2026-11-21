"""Prepare the supplied shepherd pack for Unreal without changing its source files."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import unicodedata

def safe_name(name):
    value=unicodedata.normalize("NFKD",name).encode("ascii","ignore").decode("ascii")
    return re.sub(r"[^a-zA-Z0-9]+","_",value).strip("_")

def read_glb(path):
    with path.open("rb") as stream:
        magic,version,total,length,kind=struct.unpack("<4sIII4s",stream.read(20))
        if (magic,version,kind)!=(b"glTF",2,b"JSON") or total!=path.stat().st_size:
            raise ValueError(f"{path} : GLB invalide")
        data=json.loads(stream.read(length))
        length,kind=struct.unpack("<I4s",stream.read(8))
        if kind!=b"BIN\0":
            raise ValueError(f"{path} : bloc binaire manquant")
        return data,stream.read(length)

def buffer(data,binary,index):
    view=data["bufferViews"][index]
    offset=view.get("byteOffset",0)
    return binary[offset:offset+view["byteLength"]]

def payload(data,binary,accessors):
    h=hashlib.sha256()
    for i in accessors:
        accessor=data["accessors"][i]
        h.update(repr((accessor["count"],accessor["type"],accessor["componentType"])).encode())
        h.update(buffer(data,binary,accessor["bufferView"]))
    return h.hexdigest()

def write_glb(path,data,binary):
    encoded=json.dumps(data,ensure_ascii=False,separators=(",",":")).encode()
    encoded+=b" "*(-len(encoded)%4)
    header=struct.pack("<4sIII4s",b"glTF",2,28+len(encoded)+len(binary),len(encoded),b"JSON")
    path.write_bytes(header+encoded+struct.pack("<I4s",len(binary),b"BIN\0")+binary)

def texture(data,binary,role):
    source=data["textures"][role["index"]]["source"]
    image=data["images"][source]
    ext={"image/png":"png","image/jpeg":"jpg"}[image["mimeType"]]
    return buffer(data,binary,image["bufferView"]),ext

def remove_extras(value):
    if isinstance(value,dict):
        value.pop("extras",None)
        for child in value.values():
            remove_extras(child)
    elif isinstance(value,list):
        for child in value:
            remove_extras(child)

def flatten_dog(data,binary):
    nodes=data["nodes"]
    scene=data["scenes"][data.get("scene",0)]
    container=nodes[scene["nodes"][0]]
    scale=container.get("scale",[1,1,1])
    if len(set(scale))!=1 or "rotation" in container or "translation" in container:
        raise ValueError("Le repère du squelette doit être aligné et d’échelle uniforme")
    scale=scale[0]
    skin_nodes=[index for index in container["children"] if "mesh" in nodes[index]]
    joints=data["skins"][0]["joints"]
    assert all(nodes[i].get("skin")==0 and not any(k in nodes[i] for k in ("rotation","scale","translation","matrix")) for i in skin_nodes)
    mesh=data["meshes"][0]
    mesh["primitives"]=[p for original in data["meshes"] for p in original["primitives"]]
    data["meshes"]=[mesh]
    for index in skin_nodes[1:]:
        nodes[index].pop("mesh")
        nodes[index].pop("skin")
    scene["nodes"]=[index for index in container["children"] if index not in skin_nodes[1:]]
    if scale==1:
        return binary
    binary=bytearray(binary)
    for index in joints:
        node=nodes[index]
        if "translation" in node:
            node["translation"]=[value*scale for value in node["translation"]]
    translations={a["samplers"][c["sampler"]]["output"] for a in data["animations"] for c in a["channels"]
                  if c["target"]["path"]=="translation"}
    positions={p["attributes"]["POSITION"] for p in mesh["primitives"]}
    def scale_accessor(index,components):
        accessor=data["accessors"][index]
        view=data["bufferViews"][accessor["bufferView"]]
        count={"VEC3":3,"MAT4":16}[accessor["type"]]
        assert accessor["componentType"]==5126 and view.get("byteStride",4*count)==4*count
        base=view.get("byteOffset",0)+accessor.get("byteOffset",0)
        for i in range(accessor["count"]):
            for element in components:
                offset=base+(i*count+element)*4
                value=struct.unpack_from("<f",binary,offset)[0]
                struct.pack_into("<f",binary,offset,value*scale)
        for key in ("min","max"):
            if key in accessor:
                accessor[key]=[value*scale if i in components else value for i,value in enumerate(accessor[key])]
    for index in positions|translations:
        scale_accessor(index,range(3))
    scale_accessor(data["skins"][0]["inverseBindMatrices"],(12,13,14))
    return binary

def prepare(source,output):
    output.mkdir(parents=True,exist_ok=True)
    metadata=json.loads((source/"Catalogue.json").read_text())
    attachments=json.loads((source/metadata["points_d_attache"]).read_text())
    catalogue={"breeds":[],"gear":[]}
    written=0
    for race in metadata["races"]:
        breed=safe_name(race["nom"])
        folder=output/breed
        folder.mkdir(exist_ok=True)
        reference=None
        row={"id":breed,"label":race["nom"],"height":race["garrot_de_reference_m"],"coats":[],"clips":{}}
        row["mounts"]=attachments["profils_de_depart"][race["nom"]]["positions"]
        if breed=="Berger_des_Shetland":
            # The imported rest mesh puts the furry neck below the starting
            # mount in the catalogue. Fit the shared geometry to its silhouette.
            row["mounts"]["neck"].update(gltf_world_xyz_m=[0,.247,.118],gltf_scale_xyz=[.79,.65,.66],rotation_gltf_x_deg=-30)
            row["mounts"]["thorax"].update(gltf_world_xyz_m=[0,.224,.069],gltf_scale_xyz=[.67,.66,.72])
            row["mounts"]["collar-front"].update(gltf_world_xyz_m=[0,.184,.221])
            row["mounts"]["leash-clip"].update(gltf_world_xyz_m=[0,.350,.143])

        for index,variant in enumerate(race["robes"]):
            data,binary=read_glb(source/variant["fichier"])
            primitives=[p for mesh in data["meshes"] for p in mesh["primitives"]]
            geometry=payload(data,binary,(i for p in primitives for i in [*p["attributes"].values(),p["indices"]]))
            animations=payload(data,binary,(s[attr] for a in data["animations"] for s in a["samplers"] for attr in ("input","output")))
            role=data["materials"][0]["pbrMetallicRoughness"]["baseColorTexture"]
            paint,ext=texture(data,binary,role)
            coat=safe_name(variant["id"])
            paint_path=folder/f"T_{coat}.{ext}"
            paint_path.write_bytes(paint)
            written+=len(paint)
            row["coats"].append({"id":coat,"label":variant["nom"],"texture":paint_path.name})
            if index:
                if reference!=(geometry,animations):
                    raise ValueError(f"Vérifier la géométrie ou les actions de {variant['fichier']}")
                continue
            reference=geometry,animations
            row["file"]=f"{breed}.glb"
            row["triangles"]=sum(data["accessors"][p["indices"]]["count"]//3 for p in primitives)
            binary=flatten_dog(data,binary)
            remove_extras(data)
            for i,mesh in enumerate(data["meshes"]):
                mesh["name"]="Corps" if i==0 else f"Visage_{i:02d}"
            for node in data["nodes"]:
                if "mesh" in node:
                    node["name"]=data["meshes"][node["mesh"]]["name"]
            for i,material in enumerate(data["materials"]):
                material["name"]="M_Robe" if i==0 else f"M_Visage_{i:02d}"
            for i,image in enumerate(data["images"]):
                image["name"]=f"T_Source_{i:02d}"
            for item in data["animations"]:
                clip=safe_name(item["name"])
                row["clips"][clip]=item["name"]
                item["name"]=clip
            write_glb(folder/row["file"],data,binary)
            written+=(folder/row["file"]).stat().st_size
        catalogue["breeds"].append(row)
    gear_dir=output/"Accessoires"
    gear_dir.mkdir(exist_ok=True)
    for gear in attachments["accessoires"]:
        asset=safe_name(gear["id"])
        data,binary=read_glb(source/"Accessoires"/gear["file"])
        remove_extras(data)
        for i,mesh in enumerate(data["meshes"]):
            mesh["name"]=f"SM_{asset}" if i==0 else f"SM_{asset}_{i:02d}"
        for node in data["nodes"]:
            if "mesh" in node:
                node["name"]=data["meshes"][node["mesh"]]["name"]
        for item in ("materials","images"):
            for i,entry in enumerate(data.get(item,[])):
                entry["name"]=f"{'M' if item=='materials' else 'T'}_{asset}_{i:02d}"
        file=f"{asset}.glb"
        write_glb(gear_dir/file,data,binary)
        written+=(gear_dir/file).stat().st_size
        catalogue["gear"].append({"id":asset,"label":gear["name"],"mount":gear["mount"],"file":file,"triangles":gear["triangles"]})
    (output/"import.json").write_text(json.dumps(catalogue,indent=2,ensure_ascii=False))
    count=sum(len(r["coats"]) for r in catalogue["breeds"])
    print(f"{len(catalogue['breeds'])} maillages principaux, {count} robes, {len(catalogue['gear'])} accessoires, {written/1e6:.1f} Mo d’import")
    return catalogue

if __name__=="__main__":
    cli=argparse.ArgumentParser()
    cli.add_argument("source",type=Path)
    cli.add_argument("staging",type=Path)
    args=cli.parse_args()
    prepare(args.source,args.staging)
