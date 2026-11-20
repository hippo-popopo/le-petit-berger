"""Author a continuous quad cage, refine its surface, and pack the game skin."""
import bpy
import bmesh
import base64
import colorsys
import json
from math import atan2, cos, exp, hypot, pi, sin, sqrt
from pathlib import Path
from struct import pack
from mathutils import Vector
from mathutils.noise import noise

ROOT = Path(__file__).resolve().parent
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
    (-.327,.805,.247,.312,.245),(-.187,.831,.229,.287,.211),
    (-.039,.846,.234,.293,.232),(.097,.867,.251,.323,.272),
    (.220,.889,.290,.359,.349),(.340,.905,.326,.381,.390),
    (.463,.956,.313,.378,.402),(.548,1.054,.266,.349,.365),
    (.615,1.169,.246,.302,.286),(.663,1.235,.287,.300,.269),
    (.709,1.240,.299,.274,.242),(.755,1.238,.297,.258,.238),
    (.808,1.223,.277,.234,.223),(.857,1.199,.248,.205,.201),
    (.904,1.154,.210,.171,.161),(.945,1.133,.173,.124,.124),
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
            x*=1+.08*cheek+.040*lid
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
            (side*.231,1.536,.751,.106,.068,.012,{b1:1}),
            (side*.260,1.590,.764,.084,.052,.009,{b1:1}),
            (side*.285,1.625 if side>0 else 1.590,.799 if side>0 else .819,.065,.040,.005,{b1:1}),
            (side*.308,1.621 if side>0 else 1.555,.834 if side>0 else .859,.042,.028,.002,{b1:1}),
            (side*.319,1.601 if side>0 else 1.532,.852 if side>0 else .876,.023,.017,0,{b1:1}),
            (side*.327,1.592 if side>0 else 1.523,.857 if side>0 else .882,.009,.009,0,{b1:1}),
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
retopo.ratio=.40
deps=bpy.context.evaluated_depsgraph_get()
evaluated=dog.evaluated_get(deps)
surface=evaluated.to_mesh(preserve_all_data_layers=True,depsgraph=deps)
surface.calc_loop_triangles()
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
ink=def_color('2e373b')
ink_hi=def_color('596873')
ivory=def_color('f0e5d1')
white=def_color('fff4df')
sand=def_color('a68a72')
ear_russet=def_color('aa837d')
red=def_color('b95c4d')
red_a=def_color('dc8b68')
def pigment(x,y,z):
    ax=abs(x)
    fur=float(noise(Vector((x*26+y*3,y*28,z*7.7)),noise_basis='PERLIN_ORIGINAL'))
    broad=float(noise(Vector((x*7,y*9,z*3.4)),noise_basis='PERLIN_ORIGINAL'))
    detail=.013*fur+.025*broad
    tint=smooth(-.56,.68,broad*.43+.42*(y-.66))
    color=lerp_color(ink,ink_hi,.16+.62*tint)
    fore=z>.11
    cuff=.29 if fore else .185
    socks=(1-smooth(cuff-.034,cuff+.044,y+detail))*(1-smooth(.29,.47,abs(z-(.39 if fore else -.50))))
    chest=exp(-((z-.484)/.215)**2)
    bib=smooth(.34,.66,chest)*smooth(.48,.66,y)*(1-smooth(1.067,1.265,y+ax*.41))
    forehead=(1-smooth(.029,.082,abs(x+.007*sin(z*5.0))))*smooth(.677,.862,z)*smooth(1.186,1.274,y)*(
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
    if y>1.49 and z<.93:
        inner=smooth(.765,.852,z+.08*(y-1.49))*smooth(1.492,1.577,y)*(1-smooth(.046,.108,abs(ax-mix(.22,.325,smooth(1.47,1.63,y)))))
        color=lerp_color(color,ear_russet,.64*inner)
    if .955<z<1.146 and y<1.16 and ax>.071:
        zw=smooth(.955,1.025,z)
        smile=1.091+.035*((z-1.044)/.11)**2+ax*.07
        slit=1-smooth(.004,.013,abs(y-smile))
        color=lerp_color(color,def_color('68524a'),slit*zw*(1-smooth(1.088,1.139,z))*.75)
        blush=exp(-((y-1.150)/.023)**2-((z-.962)/.056)**2)
        color=lerp_color(color,def_color('dcb09a'),blush*.27)
    if z>1.060:
        nose=smooth(1.096,1.126,z+clamp((y-1.09)*.30,-.028,.029))*(.77+.23*smooth(1.081,1.112,y))
        color=lerp_color(color,def_color('3d383a'),nose)
        bridge=exp(-((x+.026)/.048)**2-((y-1.171)/.023)**2-((z-1.124)/.044)**2)
        nostril=exp(-((ax-.040)/.019)**2-((y-1.139)/.015)**2-((z-1.153)/.038)**2)
        color=lerp_color(color,def_color('9f8791'),.65*bridge*nose)
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
    r=hypot(u*.94,(v+.07)*1.03)
    coverage=(1-smooth(.87,.99,r))*(1-smooth(.95,1,max(abs(u),abs(v))))
    rim=def_color('332a2c')
    iris=def_color('573b32')
    copper=def_color('a7795a')
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
result={'p':encoded(out_position,'h'),'n':encoded(out_normal,'b'),'c':encoded(out_color,'B'),
        'i':encoded(out_indices,'H'),'b':encoded(out_bone,'B'),'w':encoded(out_weight,'B'),'rig':bones,
        'count':len(surface.vertices),'faces':len(surface.loop_triangles),'eyeSize':size,'eyes':base64.b64encode(eyes).decode('ascii')}
(ROOT/'nuage.json').write_text(json.dumps(result,separators=(',',':')))
print('Surface soudée',len(surface.vertices),'sommets',len(surface.loop_triangles),'triangles',len(bones),'os')
