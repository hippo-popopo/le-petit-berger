"""Author a continuous quad cage, refine its surface, and pack the game skin."""
import bpy
import bmesh
import base64
from random import Random
import json
from math import atan2, cos, exp, hypot, pi, sin, sqrt
from pathlib import Path
from struct import pack
from mathutils import Vector
from mathutils.noise import noise

ROOT = Path(__file__).resolve().parent
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj,do_unlink=True)
TAU = 2 * pi
N = 36
vertices = []
faces = []
weights = []
bones = []
def clamp(x, a=0, b=1):
    return max(a, min(b, x))
def smooth(a, b, x):
    t = clamp((x-a)/(b-a))
    return t*t*(3-2*t)
def mix(a, b, t):
    return a + (b-a)*t
def bone(name, parent, x, y, z):
    bones.append([name, parent, x, y, z])
    return len(bones)-1
body = bone('tronc', -1, 0, .82, -.1)
head = bone('tête', body, 0, 1.091, .505)
ear_left = bone('oreilleG', head, -.186, 1.464, .740)
ear_right = bone('oreilleD', head, .186, 1.464, .740)
tail = bone('queue', body, 0, .877, -.808)
tail_end = bone('boutQueue', tail, -.037, .743, -1.290)
joints = []
for sign in (-1, 1):
    for fore in (True, False):
        x, y, z = (.236, .687, .389) if fore else (.238, .671, -.506)
        root = bone(('épaule' if fore else 'hanche') + ('G' if sign<0 else 'D'), body, sign*x,y,z)
        x, y, z = (.254,.346,.356) if fore else (.275,.354,-.432)
        end = bone(('coude' if fore else 'jarret') + ('G' if sign<0 else 'D'), root, sign*x,y,z)
        joints.append((sign, fore, root, end))
jaw=bone('mâchoire',head,0,1.059,.813)
def vertex(x, y, z, skin):
    i = len(vertices)
    vertices.append((x, y, z))
    weights.append(skin)
    return i
def merge_weights(i, j, value):
    row = weights[i]
    if j in row:
        row[j] = max(value, row[j])
    else:
        weights[i] = {**{k:w*(1-value) for k,w in row.items()},j:value}
def join(a,b):
    assert len(a)==len(b)
    for j in range(len(a)):
        k=(j+1)%len(a)
        faces.append((a[j],a[k],b[k],b[j]))
# The silhouette runs from the tail root to the tip of the muzzle.
# Each row gives height, width, and different upper / lower curves.
spine = [
    (-.855,.850,.099,.113,.112),(-.807,.835,.156,.158,.214),
    (-.754,.813,.207,.216,.264),(-.678,.807,.249,.265,.307),
    (-.564,.798,.281,.315,.305),(-.455,.788,.289,.331,.290),
    (-.327,.831,.244,.286,.198),(-.187,.856,.220,.268,.172),
    (-.039,.846,.234,.293,.232),(.097,.867,.251,.323,.272),
    (.220,.906,.267,.340,.363),(.340,.915,.295,.376,.396),
    (.463,.971,.296,.388,.416),(.548,1.067,.260,.355,.399),
    (.615,1.169,.246,.302,.286),(.663,1.230,.263,.267,.267),
    (.709,1.233,.271,.258,.231),(.755,1.229,.269,.244,.225),
    (.808,1.209,.248,.219,.209),(.857,1.189,.223,.192,.178),
    (.904,1.152,.193,.162,.146),(.945,1.132,.161,.124,.119),
    (1.001,1.123,.143,.101,.100),(1.059,1.132,.129,.086,.092),
    (1.106,1.141,.107,.073,.079),(1.136,1.143,.089,.055,.061),
    (1.148,1.143,.054,.040,.045),(1.155,1.142,.019,.020,.021)
]
sockets = []
for side,fore,b1,b2 in joints:
    lo,hi=(10,13) if fore else (3,6)
    l,r=(10,16) if side>0 else (20,26)
    sockets.append((lo,hi,l,r,'leg',side,fore,b1,b2))
sockets.extend([(15,19,2,7,'ear',1,False,ear_right,head),(15,19,29,34,'ear',-1,False,ear_left,head)])
ring_ids = []
for j,(z,y,rx,up,down) in enumerate(spine):
    ring=[]
    for i in range(N):
        theta=TAU*i/N
        c=cos(theta)
        x=rx*sin(theta)*(1+.035*cos(2*theta+.27))
        yy=y+c*(up if c>=0 else down)
        zz=z
        if .26<z<.64:
            zz+=.067*sin(theta)**2*(1-smooth(.41,.66,z))
        if .66<z<1.057:
            cheek=exp(-((yy-1.167)/.104)**2-((z-.865)/.095)**2)
            lid=exp(-((yy-1.337)/.067)**2-((z-.879)/.067)**2)
            x*=1+.10*cheek-.037*lid
            zz+=.010*lid*max(.2,abs(sin(theta)))
        t=smooth(.434,.723,z)
        opening=smooth(.895,1.058,z)*(1-smooth(1.055,1.100,yy))*.92
        ring.append(vertex(x,yy,zz,{body:1-t,head:t*(1-opening),jaw:t*opening}))
    ring_ids.append(ring)
for row in range(len(spine)-1):
    for column in range(N):
        if any(u<=row<v and l<=column<r for u,v,l,r,*_ in sockets):
            continue
        j=(column+1)%N
        faces.append((ring_ids[row][column],ring_ids[row][j],ring_ids[row+1][j],ring_ids[row+1][column]))
faces.append(tuple(reversed(ring_ids[-1])))
def socket_loop(lo, hi, l, r):
    return ([ring_ids[lo][i] for i in range(l,r)]+
            [ring_ids[j][r] for j in range(lo,hi)]+
            [ring_ids[hi][i] for i in range(r,l,-1)]+
            [ring_ids[j][l] for j in range(hi,lo,-1)])
def ring_fit(ids):
    n=len(ids)
    x0=sum(vertices[k][0] for k in ids)/n
    z0=sum(vertices[k][2] for k in ids)/n
    a=[atan2(vertices[k][2]-z0, vertices[k][0]-x0) for k in ids]
    winding=sum(sin(a[(i+1)%n]-a[i]) for i in range(n))
    sign=1 if winding>0 else -1
    offset=atan2(sum(sin(v-sign*TAU*i/n) for i,v in enumerate(a)),
                 sum(cos(v-sign*TAU*i/n) for i,v in enumerate(a)))
    return [offset+sign*TAU*i/n for i in range(n)]
def branch(surface, profiles):
    angles=ring_fit(surface)
    for x,y,z,rx,rz,bend,skin in profiles:
        ring=[]
        for a in angles:
            c,s=cos(a),sin(a)
            ring.append(vertex(x+c*rx,y+bend*s,z+s*rz,skin.copy()))
        join(surface,ring)
        surface=ring
    faces.append(tuple(surface))
for lo,hi,l,r,kind,side,fore,b1,b2 in sockets:
    surface=socket_loop(lo,hi,l,r)
    if kind=='ear':
        for v in surface:
            merge_weights(v,b1,.20)
        profiles=[
            (side*.192,1.476,.746,.103,.078,.015,{head:.34,b1:.66}),
            (side*.229,1.520,.766,.098,.074,.010,{b1:1}),
            (side*.249,1.564,.784,.087,.060,.006,{b1:1}),
            (side*.278,1.581 if side>0 else 1.561,.821,.076,.052,.002,{b1:1}),
            (side*.319,1.557 if side>0 else 1.527,.856,.068,.036,0,{b1:1}),
            (side*.357,1.517 if side>0 else 1.485,.873,.049,.024,0,{b1:1}),
            (side*.376,1.489 if side>0 else 1.469,.876,.014,.009,0,{b1:1}),
        ]
    else:
        shapes=(
            [(.239,.566,.388,.101,.148,-.036,0),(.247,.454,.368,.069,.101,-.022,.06),
             (.252,.358,.345,.057,.080,-.007,.37),(.254,.302,.348,.049,.056,0,.87),
             (.257,.194,.356,.043,.050,0,1),(.257,.107,.378,.052,.071,.005,1),
             (.258,.067,.396,.075,.102,.003,1),(.258,.032,.404,.075,.112,0,1),(.258,.014,.405,.066,.101,0,1)]
            if fore else
            [(.250,.581,-.489,.128,.178,.034,0),(.276,.507,-.421,.102,.163,.043,.10),
             (.282,.412,-.386,.070,.102,.039,.30),(.280,.343,-.447,.057,.077,.028,.67),
             (.277,.269,-.534,.050,.056,.012,.95),(.267,.177,-.547,.050,.050,0,1),
             (.263,.102,-.523,.059,.070,0,1),(.263,.064,-.494,.076,.108,.011,1),
             (.263,.029,-.488,.075,.110,0,1),(.263,.014,-.486,.065,.101,0,1)]
        )
        for v in surface:
            merge_weights(v,b1,.27 if fore else .28)
        profiles=[(side*x,y,z,rx,rz,bend,{b1:1-t,b2:t}) for x,y,z,rx,rz,bend,t in shapes]
    branch(surface,profiles)
# The long feathered tail continues directly from the trunk's first ring.
tail_shapes=[
    (-.905,.837,-.008,.087,.110,0),(-.965,.785,-.014,.095,.117,0),
    (-1.049,.746,-.023,.111,.121,.08),(-1.169,.715,-.042,.124,.135,.20),
    (-1.290,.716,-.054,.122,.139,.49),(-1.417,.746,-.070,.100,.131,.82),
    (-1.521,.791,-.091,.074,.103,1),(-1.599,.841,-.114,.049,.072,1),
    (-1.653,.837,-.133,.035,.047,1),(-1.688,.866,-.148,.010,.022,1)
]
root_ring=ring_ids[0]
for k in root_ring:
    merge_weights(k,tail,.24)
for z,y,x,rx,ry,t in tail_shapes:
    ids=[]
    for i in range(N):
        a=TAU*i/N
        curve=1+.035*sin(a*5+z*8)
        ids.append(vertex(x+rx*sin(a)*curve,y+ry*cos(a)*curve,z,{tail:1-t,tail_end:t}))
    join(root_ring,ids)
    root_ring=ids
faces.append(tuple(root_ring))

# Discard cage vertices that were inside an opening, then refine the welded surface.
used=sorted({i for face in faces for i in face})
reindex={i:j for j,i in enumerate(used)}
mesh=bpy.data.meshes.new('Nuage · surface continue')
mesh.from_pydata([vertices[i] for i in used],[],[tuple(reindex[i] for i in f) for f in faces])
dog=bpy.data.objects.new('Nuage',mesh)
bpy.context.collection.objects.link(dog)
for name,*_ in bones:
    dog.vertex_groups.new(name=name)
for i,source in enumerate(used):
    row=weights[source]
    total=sum(max(0,v) for v in row.values())
    for j,v in row.items():
        if v>0:
            dog.vertex_groups[j].add([i],v/total,'REPLACE')
cage=bmesh.new()
cage.from_mesh(mesh)
bmesh.ops.recalc_face_normals(cage,faces=list(cage.faces))
assert all(e.is_manifold for e in cage.edges)
cage.to_mesh(mesh)
cage.free()
for face in mesh.polygons:
    face.use_smooth=True
modifier=dog.modifiers.new('Peau','SUBSURF')
modifier.levels=2
modifier.render_levels=2
retopo=dog.modifiers.new('Maillage mobile','DECIMATE')
retopo.ratio=.34
deps=bpy.context.evaluated_depsgraph_get()
evaluated=dog.evaluated_get(deps)
surface=evaluated.to_mesh(preserve_all_data_layers=True,depsgraph=deps)
surface.calc_loop_triangles()
body_triangles=len(surface.loop_triangles)
from collections import defaultdict
neighbors=defaultdict(set)
for e in surface.edges:
    a,b=e.vertices
    neighbors[a].add(b);neighbors[b].add(a)
seen={0}
stack=[0]
while stack:
    for other in neighbors[stack.pop()]:
        if other not in seen:
            stack.append(other);seen.add(other)
assert len(seen)==len(surface.vertices), 'Disconnected surface'
assert max(len(v.groups) for v in surface.vertices)>1, 'Subdivision lost envelope weights'

def lerp_color(a,b,t):
    return tuple(mix(x,y,clamp(t)) for x,y in zip(a,b))
def def_color(hex):
    return tuple(int(hex[i:i+2],16)/255 for i in (0,2,4))
ink=def_color('20262d')
ink_hi=def_color('4c555e')
ivory=def_color('e8e1d5')
white=def_color('fff4df')
sand=def_color('a68a72')
ear_russet=def_color('aa837d')
red=def_color('b95c4d')
red_a=def_color('dc8b68')
def pigment(x,y,z):
    ax=abs(x)
    fur=float(noise(Vector((x*26+y*3,y*28,z*7.7)),noise_basis='PERLIN_ORIGINAL'))
    broad=float(noise(Vector((x*7,y*9,z*3.4)),noise_basis='PERLIN_ORIGINAL'))
    strokes=float(noise(Vector((x*81+y*17,y*57+z*19,z*21)),noise_basis='PERLIN_ORIGINAL'))
    detail=.019*fur+.019*broad+.021*strokes
    tint=smooth(-.56,.68,broad*.43+.42*(y-.66))
    color=lerp_color(ink,ink_hi,.16+.62*tint)
    fore=z>.11
    cuff=.29 if fore else .185
    socks=(1-smooth(cuff-.034,cuff+.044,y+detail))*(1-smooth(.29,.47,abs(z-(.39 if fore else -.50))))
    chest=exp(-((z-.484)/.215)**2)
    bib=smooth(.30,.67,chest)*smooth(.45,.63,y)*(1-smooth(1.085,1.328,y+ax*.54+detail))
    forehead=(1-smooth(.029,.082,abs(x+.012*sin(z*5.0)+.003*sin(y*76))))*smooth(.677,.862,z)*smooth(1.186,1.274,y)*(
        1-smooth(1.473,1.555,y))
    muzzle=(smooth(.906,.990,z-.12*ax)*(1-smooth(1.214,1.281,y)))+smooth(.955,1.057,z)
    mouth_white=clamp(muzzle)
    nape=(1-smooth(.105,.194,abs(z-.43+(y-1.116)*.28+detail)))*smooth(1.001,1.156,y-.13*ax)
    tail_white=1-smooth(-1.515,-1.382,z+detail)
    cream=max(socks,bib,forehead,mouth_white,nape,tail_white)
    color=lerp_color(color,lerp_color(ivory,white,.35+.50*tint),cream)
    if .27<z<.87 and y>.64:
        tan_mask=exp(-((ax-.222)/.136)**2-((y-.884)/.126)**2-((z-.605)/.189)**2)
        color=lerp_color(color,sand,tan_mask*.24)
    if y>1.463 and z<.93:
        inner=smooth(.765,.852,z+.08*(y-1.49))*smooth(1.456,1.555,y)*(1-smooth(.046,.108,abs(ax-mix(.22,.325,smooth(1.47,1.63,y)))))
        color=lerp_color(color,ear_russet,.64*inner)
    if .955<z<1.146 and y<1.16 and ax>.071:
        zw=smooth(.955,1.025,z)
        smile=1.091+.035*((z-1.044)/.11)**2+ax*.07
        slit=1-smooth(.005,.017,abs(y-smile))
        color=lerp_color(color,def_color('443938'),slit*(.45+.55*zw)*(1-smooth(1.101,1.162,z))*.68)
        blush=exp(-((y-1.150)/.023)**2-((z-.962)/.056)**2)
        color=lerp_color(color,def_color('dcb09a'),blush*.27)
    if z>1.060:
        nose=smooth(1.096,1.126,z+clamp((y-1.09)*.30,-.028,.029))*(.77+.23*smooth(1.081,1.112,y))
        color=lerp_color(color,def_color('25242a'),nose)
        bridge=exp(-((x+.026)/.048)**2-((y-1.171)/.023)**2-((z-1.124)/.044)**2)
        nostril=exp(-((ax-.040)/.019)**2-((y-1.139)/.015)**2-((z-1.153)/.038)**2)
        color=lerp_color(color,def_color('796e73'),.65*bridge*nose)
        color=lerp_color(color,def_color('302c33'),nostril*nose*.68)
    return tuple(clamp(c+detail) for c in color)

out_position=[];out_normal=[];out_color=[];out_indices=[];out_bone=[];out_weight=[]
for v in surface.vertices:
    point=v.co.copy()
    x,y,z=point
    n=v.normal
    if .45<y<1.36 and -1.65<z<.64:
        # Fine sculpture of the ruff, spine and tail, within the same skin.
        f=float(noise(Vector((x*43+y*5,y*32,z*10)),noise_basis='PERLIN_ORIGINAL'))
        coat=.002+.011*(z<-.87 or .20<z<.57)
        point+=n*f*coat*smooth(.47,.74,y)
    out_position.extend(round(c*8192) for c in point)
    out_normal.extend(round(clamp(c,-1,1)*127) for c in n)
    out_color.extend(round(c*255) for c in pigment(x,y,z))
    w=sorted(((g.group,g.weight) for g in v.groups if g.weight>0),key=lambda g:-g[1])[:4]
    assert w
    sumw=sum(b for _,b in w)
    ids=[b for b,_ in w]+[0]*(4-len(w))
    values=[round(255*b/sumw) for _,b in w]+[0]*(4-len(w))
    values[0]+=255-sum(values)
    out_bone.extend(ids);out_weight.extend(values)
for tri in surface.loop_triangles:
    out_indices.extend(tri.vertices)
assert len(surface.vertices)<65536
def encoded(data,fmt):
    return base64.b64encode(pack('<'+str(len(data))+fmt,*data)).decode('ascii')
def eye_texel(u,v):
    r=hypot(u*.94,(v+.07)*1.18)
    coverage=(1-smooth(.87,.99,r))*(1-smooth(.95,1,max(abs(u),abs(v))))
    rim=def_color('231e20')
    iris=def_color('513728')
    copper=def_color('a7824f')
    dark=def_color('211f23')
    scale=hypot((u-.103)*1.02,(v+.025)*1.07)
    color=lerp_color(rim,iris,1-smooth(.66,.84,scale))
    warm=exp(-((v+.45)/.29)**2-((u-.02)/.51)**2)*.61
    color=lerp_color(color,copper,warm*(1-smooth(.64,.73,scale)))
    color=lerp_color(color,dark,1-smooth(.30,.49,hypot(u-.14,v-.04)))
    high=1-smooth(.082,.161,hypot((u-.20)/1.09,(v-.345)*1.11))
    low=.48*(1-smooth(.030,.066,hypot(u+.14,v+.28)))
    color=lerp_color(color,def_color('fff3d9'),max(high,low))
    return [round(255*c) for c in (*color,coverage)]

size=96
eyes=bytes(b for j in range(size) for i in range(size) for b in eye_texel((i+.5)/size*2-1,(j+.5)/size*2-1))
from zlib import compress, crc32
def png_chunk(tag,payload):
    return pack('>I',len(payload))+tag+payload+pack('>I',crc32(tag+payload)&0xFFFFFFFF)
pixels=b''.join(bytes([0])+eyes[j*size*4:(j+1)*size*4] for j in reversed(range(size)))
png=(bytes([137,80,78,71,13,10,26,10])+png_chunk(b'IHDR',pack('>IIBBBBB',size,size,8,6,0,0,0))
     +png_chunk(b'IDAT',compress(pixels,9))+png_chunk(b'IEND',b''))
(ROOT/'eye-paint.png').write_bytes(png)
# Grow tapered, skinned guard hairs in the direction of the coat.
# The ribbons model the visible silhouette of the ruff and feathering.
rng=Random(334117)
fur_start=len(out_position)//3
hair_faces=[]
areas=[]
total_area=0
for tri in surface.loop_triangles:
    v=[surface.vertices[i] for i in tri.vertices]
    x,y,z=sum((p.co for p in v),Vector())/3
    ruff=smooth(.57,.96,y)*(1-smooth(1.30,1.47,y))*smooth(.08,.36,z)*(1-smooth(.59,.72,z))
    plume=smooth(.85,1.48,-z)
    flank=smooth(.39,.67,y)*(1-smooth(.80,1.03,y))*smooth(.12,.23,abs(x))*(1-smooth(.25,.62,z))
    fleece=max(ruff,plume,flank*.66)
    if fleece<.11:
        continue
    total_area+=tri.area*fleece
    areas.append((total_area,v,ruff,plume,flank))
from bisect import bisect_left
cumulative=[row[0] for row in areas]
for _ in range(2850):
    _,vs,ruff,plume,flank=areas[bisect_left(cumulative,rng.random()*total_area)]
    a,b=rng.random(),rng.random()
    if a+b>1:
        a,b=1-a,1-b
    bary=(1-a-b,a,b)
    center=sum((v.co*w for v,w in zip(vs,bary)),Vector())
    x,y,z=center
    n=sum((v.normal*w for v,w in zip(vs,bary)),Vector()).normalized()
    grow=Vector((x*.28,-.36-.45*ruff,-.59-.27*plume))
    grow=(grow-n*grow.dot(n)*.77).normalized()
    tip_dir=(grow+n*.24).normalized()
    cross=tip_dir.cross(n).normalized()
    length=rng.uniform(.032,.114)*(.58+max(ruff,plume,flank*.6)*.86)
    width=rng.uniform(.003,.011)
    bound=defaultdict(float)
    for v,w in zip(vs,bary):
        for g in v.groups: bound[g.group]+=w*g.weight
    top=sorted(bound.items(),key=lambda pair:-pair[1])[:4]
    total=sum(w for _,w in top)
    weights4=[round(255*w/total) for _,w in top]+[0]*(4-len(top))
    weights4[0]+=255-sum(weights4)
    indices4=[j for j,_ in top]+[0]*(4-len(top))
    shaded=(n+grow*.13).normalized()
    tint=pigment(x,y,z)
    variation=rng.uniform(.87,1.12)
    index=len(out_position)//3
    for t,offset,value in [(0,-1,.86),(0,1,.86),(.54,.58,1.0),(.54,-.58,1.0),(1,0,1.09)]:
        point=center+grow*length*t+n*(.001+length*.33*sin(t*pi*.78))+cross*width*offset
        out_position.extend(round(c*8192) for c in point)
        out_normal.extend(round(c*127) for c in shaded)
        out_color.extend(round(255*clamp(c*value*variation)) for c in tint)
        out_bone.extend(indices4)
        out_weight.extend(weights4)
    hair_faces.extend((index,index+1,index+2,index,index+2,index+3,index+3,index+2,index+4))

# Save the editable model with its live quad cage, rig and independent groom.
arm=bpy.data.armatures.new('Squelette de Nuage')
rig=bpy.data.objects.new('Squelette de Nuage',arm)
bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active=rig
rig.select_set(True)
rig.show_in_front=True
bpy.ops.object.mode_set(mode='EDIT')
for name,parent,x,y,z in bones:
    edit=arm.edit_bones.new(name)
    edit.head=(x,y,z)
    edit.tail=(x,y+.11,z) if name not in ('queue','boutQueue') else (x,y-.04,z-.19)
    if parent>=0: edit.parent=arm.edit_bones[bones[parent][0]]
bpy.ops.object.mode_set(mode='OBJECT')
groom_mesh=bpy.data.meshes.new('Mèches peintes')
groom_mesh.from_pydata([tuple(n/8192 for n in out_position[i:i+3])
                       for i in range(fur_start*3,len(out_position),3)],[],
                      [tuple(j-fur_start for j in hair_faces[i:i+3]) for i in range(0,len(hair_faces),3)])
groom=bpy.data.objects.new('Ruff, franges et queue',groom_mesh)
bpy.context.collection.objects.link(groom)
for name,*_ in bones:
    groom.vertex_groups.new(name=name)
for i in range(len(groom_mesh.vertices)):
    for j,w in zip(out_bone[4*(fur_start+i):4*(fur_start+i+1)],out_weight[4*(fur_start+i):4*(fur_start+i+1)]):
        if w: groom.vertex_groups[j].add([i],w/255,'REPLACE')
coat=bpy.data.materials.new('Pelage peint')
coat.use_nodes=True
coat.diffuse_color=(.12,.13,.15,1)
shader=coat.node_tree.nodes.get('Principled BSDF')
shader.inputs['Roughness'].default_value=.82
attribute=coat.node_tree.nodes.new('ShaderNodeVertexColor')
attribute.layer_name='Pigment'
coat.node_tree.links.new(attribute.outputs['Color'],shader.inputs['Base Color'])
for obj,colors in [(dog,[pigment(*co) for co in (vertices[i] for i in used)]),
                   (groom,[tuple(v/255 for v in out_color[i:i+3]) for i in range(fur_start*3,len(out_color),3)])]:
    obj.data.materials.append(coat)
    pigment_layer=obj.data.color_attributes.new(name='Pigment',type='BYTE_COLOR',domain='POINT')
    for pixel,color in zip(pigment_layer.data,colors): pixel.color_srgb=(*color,1)
    deform=obj.modifiers.new('Armature','ARMATURE')
    deform.object=rig
    obj.parent=rig
skin_mat=coat.copy()
skin_mat.name='Pelage et iris'
dog.data.materials[0]=skin_mat
nodes=skin_mat.node_tree.nodes
links=skin_mat.node_tree.links
surface_position=nodes.new('ShaderNodeTexCoord').outputs['Object']
split=nodes.new('ShaderNodeSeparateXYZ')
links.new(surface_position,split.inputs[0])
def math_node(op,a,b):
    math=nodes.new('ShaderNodeMath')
    math.operation=op
    for i,value in enumerate((a,b)):
        if isinstance(value,(float,int)): math.inputs[i].default_value=value
        else: links.new(value,math.inputs[i])
    return math.outputs[0]
z=math_node('SUBTRACT',split.outputs['Z'],.873)
y=math_node('SUBTRACT',split.outputs['Y'],1.299)
front=math_node('ADD',z,math_node('MULTIPLY',y,.17))
height=math_node('SUBTRACT',y,math_node('MULTIPLY',z,.125))
uv=nodes.new('ShaderNodeCombineXYZ')
links.new(math_node('ADD',math_node('MULTIPLY',front,.5/.071),.5),uv.inputs[0])
links.new(math_node('ADD',math_node('MULTIPLY',height,.5/.064),.5),uv.inputs[1])
iris=nodes.new('ShaderNodeTexImage')
iris.image=bpy.data.images.load(str(ROOT/'eye-paint.png'),check_existing=True)
iris.image.pack()
iris.extension='CLIP'
links.new(uv.outputs[0],iris.inputs['Vector'])
side=math_node('ABSOLUTE',split.outputs['X'],0)
mask=nodes.new('ShaderNodeMapRange')
mask.inputs['From Min'].default_value=.126
mask.inputs['From Max'].default_value=.160
mask.interpolation_type='SMOOTHSTEP'
links.new(side,mask.inputs['Value'])
eye_paint=nodes.new('ShaderNodeMixRGB')
links.new(math_node('MULTIPLY',iris.outputs['Alpha'],mask.outputs[0]),eye_paint.inputs[0])
links.new(nodes.get(attribute.name).outputs['Color'],eye_paint.inputs[1])
links.new(iris.outputs['Color'],eye_paint.inputs[2])
links.new(eye_paint.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
rig.rotation_euler.x=pi/2
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_distance=4.7
        area.spaces.active.region_3d.view_location=(0,0,.75)
        area.spaces.active.shading.color_type='VERTEX'
        area.spaces.active.region_3d.view_rotation=Vector((-.81,-.56,-.34)).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'Nuage.blend'))

result={'p':encoded(out_position,'h'),'n':encoded(out_normal,'b'),'c':encoded(out_color,'B'),
        'i':encoded(out_indices,'H'),'fur':encoded(hair_faces,'H'),'b':encoded(out_bone,'B'),'w':encoded(out_weight,'B'),'rig':bones,
        'count':len(out_position)//3,'faces':body_triangles,'eyeSize':size,'eyes':base64.b64encode(eyes).decode('ascii')}
(ROOT/'nuage.json').write_text(json.dumps(result,separators=(',',':')))
print('Maillage soudé',body_triangles,'triangles · groom',len(hair_faces)//3,'triangles ·',len(bones),'os')
