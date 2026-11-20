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
from mathutils.bvhtree import BVHTree
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
    (-.327,.831,.244,.286,.198),(-.187,.856,.229,.268,.185),
    (-.039,.846,.244,.293,.232),(.097,.867,.259,.323,.272),
    (.220,.906,.275,.340,.363),(.340,.915,.303,.376,.396),
    (.463,.971,.308,.388,.416),(.548,1.067,.275,.355,.399),
    (.615,1.173,.262,.293,.276),(.663,1.231,.270,.260,.252),
    (.709,1.238,.281,.263,.237),(.755,1.235,.277,.255,.220),
    (.808,1.218,.266,.241,.225),(.857,1.191,.252,.230,.204),
    (.902,1.172,.226,.188,.179),(.936,1.150,.201,.128,.154),
    (.980,1.142,.176,.097,.129),(1.024,1.136,.156,.082,.109),
    (1.073,1.136,.139,.077,.090),(1.104,1.137,.123,.075,.077),
    (1.127,1.144,.098,.064,.064),(1.145,1.148,.074,.052,.050),
    (1.159,1.149,.054,.045,.040),(1.165,1.147,.023,.024,.023)
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
            cheek=exp(-((yy-1.167)/.096)**2-((z-.865)/.115)**2)
            orbit=exp(-((yy-1.323)/.048)**2-((z-.882)/.050)**2)
            brow=exp(-((yy-1.375)/.036)**2-((z-.850)/.076)**2)
            x*=1+.09*cheek-.074*orbit+.052*brow
            zz-=.008*orbit*max(.2,abs(sin(theta)))
        if .923<z<1.119:
            lip=1.084+.027*(1-smooth(.898,.975,z))
            tuck=exp(-((yy-lip)/.014)**2)*smooth(.929,.973,z)*(1-smooth(1.065,1.118,z))
            x*=1-.056*tuck
        if z>=1.104:
            x*=.85+.15*smooth(1.109,1.171,yy)
            nostril=exp(-((abs(x)-.056)/.020)**2-((yy-1.150)/.017)**2)
            zz-=.015*nostril*smooth(1.104,1.157,z)
            yy+=.008*cos(theta*3)*smooth(1.104,1.16,z)
        t=smooth(.434,.723,z)
        opening=smooth(.865,1.049,z)*(1-smooth(1.049,1.085,yy))*.96
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
            toe=1+.022*cos(a*9)*smooth(.091,.019,y) if y<.091 else 1
            ring.append(vertex(x+c*rx,y+bend*s,z+s*rz*toe,skin.copy()))
        join(surface,ring)
        surface=ring
    faces.append(tuple(surface))
def ear_flap(socket, side, bone_index):
    # A cross section following the ear cartilage rotates as the soft tip folds.
    # The flaps taper and are pitched differently, even in the rest pose.
    top=1.555 if side==1 else 1.522
    bend=.006 if side==1 else .047
    sections=[
        (.175,1.440,.728,.080,.061),
        (.206,1.483,.744,.093,.047),
        (.229,1.524,.765,.087,.035),
        (.254,top,.788,.065,.026),
        (.285,top-.006,.814+bend,.051,.021),
        (.311,top-.037,.849+bend,.040,.015),
        (.333,top-.069,.871+bend,.022,.010),
        (.338,top-.088,.875+bend,.007,.004),
    ]
    path=[Vector((side*x,y,z)) for x,y,z,*_ in sections]
    angles=ring_fit(socket)
    for i,(center,section) in enumerate(zip(path,sections)):
        tangent=(path[min(i+1,len(path)-1)]-path[max(0,i-1)]).normalized()
        front=Vector((-.16*side,0,1))
        across=tangent.cross(front).normalized()
        forward=across.cross(tangent).normalized()
        radius,depth=section[-2:]
        ring=[]
        for a in angles:
            hollow=.008*(sin(a)>.25)*sin(i*pi/(len(path)-1))
            vertex_point=center+across*cos(a)*radius+forward*(sin(a)*depth-hollow)
            attach=smooth(0,2.5,i)*.32+.68
            ring.append(vertex(*vertex_point,{head:1-attach,bone_index:attach}))
        join(socket,ring)
        socket=ring
    faces.append(tuple(socket))

for lo,hi,l,r,kind,side,fore,b1,b2 in sockets:
    surface=socket_loop(lo,hi,l,r)
    if kind=='ear':
        for v in surface:
            merge_weights(v,b1,.22)
        ear_flap(surface,side,b1)
        continue
    if kind=='leg':
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
    (-1.290,.683,-.054,.127,.144,.49),(-1.417,.673,-.067,.119,.148,.82),
    (-1.535,.686,-.085,.102,.140,1),(-1.634,.707,-.105,.079,.109,1),
    (-1.724,.743,-.133,.051,.069,1),(-1.791,.789,-.157,.014,.028,1)
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
ink=def_color('1e2530')
ink_hi=def_color('485367')
ivory=def_color('ddd0b9')
white=def_color('f8edda')
sand=def_color('a68a72')
ear_russet=def_color('aa837d')
red=def_color('b95c4d')
red_a=def_color('dc8b68')
def pigment(x,y,z):
    ax=abs(x)
    fur=float(noise(Vector((x*26+y*3,y*28,z*7.7)),noise_basis='PERLIN_ORIGINAL'))
    broad=float(noise(Vector((x*7,y*9,z*3.4)),noise_basis='PERLIN_ORIGINAL'))
    strokes=float(noise(Vector((x*81+y*17,y*57+z*19,z*21)),noise_basis='PERLIN_ORIGINAL'))
    detail=.023*fur+.023*broad+.018*strokes
    tint=smooth(-.56,.68,broad*.43+.42*(y-.66))
    color=lerp_color(ink,ink_hi,.16+.62*tint)
    fore=z>.11
    cuff=.29 if fore else .185
    socks=(1-smooth(cuff-.034,cuff+.044,y+detail))*(1-smooth(.29,.47,abs(z-(.39 if fore else -.50))))
    chest=exp(-((z-.484)/.215)**2)
    bib=smooth(.30,.67,chest)*smooth(.45,.63,y)*(1-smooth(1.085,1.328,y+ax*.54+detail))
    ridge=.047+.025*exp(-((y-1.251)/.092)**2)
    line=x+.009*sin(y*18+.42)+.004*fur+.003*sin(y*104)
    forehead=(1-smooth(ridge*.45,ridge,abs(line)))*smooth(.694,.867,z)*smooth(1.177,1.263,y)*(1-smooth(1.474,1.521,y))
    muzzle=smooth(.912,1.001,z-.19*ax)*(1-smooth(1.219,1.300,y+.08*ax))+.72*smooth(1.009,1.100,z)
    jaw_white=smooth(.895,1.012,z)*(1-smooth(1.079,1.124,y))*.89
    mouth_white=max(clamp(muzzle),jaw_white)
    nape=(1-smooth(.105,.194,abs(z-.43+(y-1.116)*.28+detail)))*smooth(1.001,1.156,y-.13*ax)
    tail_white=1-smooth(-1.637,-1.463,z+.07*fur+.036*broad)
    cream=max(socks,bib,forehead,mouth_white,nape,tail_white)
    color=lerp_color(color,lerp_color(ivory,white,.35+.50*tint),cream)
    if .27<z<.87 and y>.64:
        tan_mask=exp(-((ax-.222)/.136)**2-((y-.884)/.126)**2-((z-.605)/.189)**2)
        color=lerp_color(color,sand,tan_mask*.24)
    brow=exp(-((y-1.374-.17*(z-.86))/.031)**2-((z-.86)/.079)**2-((ax-.172)/.070)**2)
    color=lerp_color(color,def_color('927c66'),brow*.27)
    if y>1.453 and .747<z<.979:
        inner=smooth(.755,.831,z)*smooth(1.450,1.506,y)*(1-smooth(.085,.175,abs(ax-.273)))
        liner=inner*(.74+.21*strokes)
        color=lerp_color(color,def_color('5e4a50'),liner*.74)
        color=lerp_color(color,ear_russet,liner*.24*smooth(.815,.906,z))
    if .887<z<1.156 and y<1.147:
        jaw=.076*smooth(.941,1.05,z)
        lip=1.081+.026*(1-smooth(.889,.987,z))+.007*ax
        weight=smooth(.890,.938,z)*(1-smooth(1.103,1.146,z))
        slit=(1-smooth(.004,.014,abs(y-lip+jaw*.04)))*weight
        undershadow=exp(-((y-lip+.010)/.021)**2)*weight*.18
        color=lerp_color(color,def_color('382d35'),max(slit*.83,undershadow))
        corner=exp(-((z-.929)/.021)**2-((y-1.094)/.017)**2)*smooth(.106,.174,ax)
        color=lerp_color(color,def_color('605052'),corner*.46)
        pad=smooth(.943,1.033,z)*(1-smooth(1.125,1.161,y))
        freckles=1-smooth(.065,.135,hypot(sin(z*387+y*47),sin(y*354-z*21)))
        color=lerp_color(color,def_color('76685f'),freckles*pad*.26)
    if z>1.084:
        nose_start=1.114-.15*(y-1.132)-.21*ax
        nose=smooth(nose_start-.012,nose_start+.015,z)*(1-smooth(1.21,1.23,y))
        color=lerp_color(color,def_color('2a2631'),nose)
        bridge=exp(-((x+.021)/.049)**2-((y-1.189)/.017)**2-((z-1.122)/.032)**2)
        nostril=exp(-((ax-.044)/.019)**2-((y-1.151)/.013)**2-((z-1.153)/.050)**2)
        separation=exp(-(ax/.008)**2-((y-1.110)/.037)**2)*smooth(1.12,1.163,z)
        color=lerp_color(color,def_color('a08e95'),.34*bridge*nose)
        color=lerp_color(color,def_color('1a161d'),max(nostril,separation*.74)*nose*.90)
    if y<.110:
        foot_center=.258 if fore else .263
        toe_gap=1-smooth(.003,.011,abs(abs(ax-foot_center)-.029))
        toe_cap=smooth(.450,.509,z) if fore else smooth(-.440,-.381,z)
        color=lerp_color(color,def_color('9a887d'),.38*toe_gap*toe_cap*smooth(.104,.044,y))
    return tuple(clamp(c+detail) for c in color)

out_position=[];out_normal=[];out_color=[];out_indices=[];out_bone=[];out_weight=[]
for v in surface.vertices:
    point=v.co.copy()
    x,y,z=point
    n=v.normal
    if .45<y<1.52 and -1.76<z<1.102:
        # Fine sculpture of the ruff, spine and tail, within the same skin.
        f=float(noise(Vector((x*43+y*5,y*32,z*10)),noise_basis='PERLIN_ORIGINAL'))
        coat=.002+.008*(z<-.87 or .20<z<.63)+.003*(z>.72)
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
surface_index=BVHTree.FromPolygons(
    [v.co.copy() for v in surface.vertices],
    [tuple(f.vertices) for f in surface.loop_triangles],
    all_triangles=True,
)
neck_axis=Vector((0,.60,.80))
neck_up=Vector((0,.80,-.60))
neck_width=Vector((1,0,0))
neck_center=Vector((0,1.065,.526))
neck_socket=Vector(bones[head][2:])+Vector((0,.01,-.026))
def neck_surface(angle,along,clearance):
    radial=neck_width*sin(angle)+neck_up*cos(angle)
    section=neck_center+neck_axis*along
    location,n,_,_=surface_index.ray_cast(section+radial*.82,-radial,1.09)
    assert location is not None, (angle,along)
    return [round(c,5) for c in location+radial*clearance-neck_socket]
band=[]
for row,t in enumerate((.049,.009,-.035)):
    for i in range(43):
        angle=TAU*i/42
        band.append(neck_surface(angle,t,.020+.002*(row==1)))
bib=[]
for j in range(9):
    t=j/8
    for i in range(9):
        u=i/8
        angle=pi+(u*2-1)*(.82*(1-t)+.022)
        fold=.005*cos(u*TAU*2+.9*t)*sin(t*pi)
        bib.append(neck_surface(angle,.014-.278*t,.029+fold))
eye_positions=[]
eye_closed=[]
eye_colors=[]
eye_opacity=[]
eye_faces=[]
eye_rings=(.12,.20,.26,.31,.35,.39,.44,.49,.54,.59,.65,.71,.77,.83,.88,.92,.95,.98,1.015,1.062,1.12,1.19,1.24)
eye_segments=60

def iris_color(u,v):
    side_shift=.14
    r=hypot((u-side_shift)*.90,(v+.023)*.91)
    az=atan2(v+.023,u-side_shift)
    base=def_color('35231c')
    iris=def_color('725033')
    honey=def_color('a98254')
    pupil=def_color('181618')
    grain=.5+.25*sin(az*33+r*12)+.24*sin(az*58-r*17)
    amber=(1-smooth(.59,.88,r))*(.34+.38*grain)
    color=lerp_color(base,iris,amber)
    low_light=exp(-((v+.40)/.35)**2-((u-.10)/.50)**2)
    color=lerp_color(color,honey,low_light*.70*(1-smooth(.61,.89,r)))
    color=lerp_color(color,pupil,1-smooth(.50,.63,r))
    near_glint=hypot((u-.04)/.9,(v-.31)*.80)
    far_glint=hypot((u-.34)*.91,(v-.10)*1.4)
    reflection=max(.97*(1-smooth(.068,.121,near_glint)),.50*(1-smooth(.025,.069,far_glint)))
    return lerp_color(color,def_color('fff4df'),reflection)

def sculpt_eye(side):
    normal=Vector((side*.78,.098,.623)).normalized()
    horizontal=Vector((-side*.62,0,.78)).normalized()
    vertical=Vector((0,1,0))
    focus=Vector((side*.193,1.318,.883))
    hit,_,_,_=surface_index.ray_cast(focus+normal*.85,-normal,1.2)
    assert hit is not None
    print('Orbite',side,tuple(round(v,4) for v in hit))
    origin=len(eye_positions)
    def sample(u,v,r):
        # The almond follows the skull. The lens protrudes a few millimeters.
        aperture=(.77+.23*(1-abs(u)))*(.93 if v<0 else 1)
        arc=.088*u+.023*(1-u*u)
        open_y=arc+v*aperture
        point=hit+horizontal*(u*.067)+vertical*(open_y*.044)
        cast,n,_,_=surface_index.ray_cast(point+normal*.25,-normal,.5)
        assert cast is not None, (side,u,v)
        dome=max(0,1-r*r)
        waterline=(.0038+.0033*max(0,v))*exp(-((r-1.02)/.088)**2)
        position=cast+normal*(.0014+.010*dome+waterline)
        close_target=hit+horizontal*(u*.067)+vertical*((arc-.12)*.044)
        closed,_,_,_=surface_index.ray_cast(close_target+normal*.25,-normal,.5)
        assert closed is not None
        closed=closed+normal*.0021+vertical*(open_y-arc)*.0012
        tint=iris_color(u,v)
        if r>.92:
            edge_color=def_color('4b393d' if v<-.19 else '24232e')
            coat=pigment(*cast)
            tint=lerp_color(tint,edge_color,smooth(.92,1.015,r))
            tint=lerp_color(tint,coat,smooth(1.032,1.188,r))
        eye_positions.append(tuple(position))
        eye_closed.append(tuple(closed))
        eye_colors.append(tint)
        eye_opacity.append(1-smooth(1.045,1.24,r))
    sample(0,0,0)
    for layer,radius in enumerate(eye_rings):
        for i in range(eye_segments):
            angle=i*TAU/eye_segments
            sample(cos(angle)*radius,sin(angle)*radius,radius)
            first=origin+1+layer*eye_segments
            a=first+i
            b=first+(i+1)%eye_segments
            if layer:
                eye_faces.extend([(a-eye_segments,a,b),(a-eye_segments,b,b-eye_segments)])
            else:
                eye_faces.append((origin,a,b))
    if side<0:
        count=(len(eye_rings)*2-1)*eye_segments
        eye_faces[-count:]=[tuple(reversed(face)) for face in eye_faces[-count:]]
for side in (-1,1):
    sculpt_eye(side)

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
    plume=smooth(.83,1.53,-z)
    flank=smooth(.39,.66,y)*(1-smooth(.80,1.03,y))*smooth(.12,.23,abs(x))*(1-smooth(.25,.62,z))
    crown=smooth(.62,.75,z)*(1-smooth(.83,.92,z))*smooth(1.40,1.50,y)
    ears=smooth(1.430,1.549,y)*smooth(.13,.22,abs(x))*(1-smooth(.888,.969,z))
    temple=smooth(.64,.80,z)*(1-smooth(.87,.96,z))*smooth(.15,.21,abs(x))*(1-smooth(1.225,1.280,y))
    short=max(ears,crown*.65,temple*.72)
    fleece=max(ruff,plume,flank*.65,short*.83)
    if fleece<.11:
        continue
    total_area+=tri.area*fleece
    areas.append((total_area,v,ruff,plume,flank,short))
from bisect import bisect_left
cumulative=[row[0] for row in areas]
for _ in range(3500):
    _,vs,ruff,plume,flank,short=areas[bisect_left(cumulative,rng.random()*total_area)]
    a,b=rng.random(),rng.random()
    if a+b>1:
        a,b=1-a,1-b
    bary=(1-a-b,a,b)
    center=sum((v.co*w for v,w in zip(vs,bary)),Vector())
    x,y,z=center
    n=sum((v.normal*w for v,w in zip(vs,bary)),Vector()).normalized()
    flow=Vector((x*.42,-.36-.36*ruff-.12*short,-.66-.34*plume))
    if y>1.45:
        flow=Vector((x*.9,.37,-.13))
    gust=Vector((rng.uniform(-.16,.16),rng.uniform(-.13,.13),rng.uniform(-.10,.10)))
    grow=(flow+gust-n*flow.dot(n)*.88).normalized()
    cross=grow.cross(n).normalized()
    if short>max(ruff,plume,flank):
        length=rng.uniform(.009,.029)*(.58+short*.58)
        width=rng.uniform(.0012,.0033)
    else:
        length=rng.uniform(.027,.146)*(.49+max(ruff*.73,plume,flank*.62)*.76)
        width=rng.uniform(.0019,.0059)
    bound=defaultdict(float)
    for v,w in zip(vs,bary):
        for g in v.groups: bound[g.group]+=w*g.weight
    top=sorted(bound.items(),key=lambda pair:-pair[1])[:4]
    total=sum(w for _,w in top)
    weights4=[round(255*w/total) for _,w in top]+[0]*(4-len(top))
    weights4[0]+=255-sum(weights4)
    indices4=[j for j,_ in top]+[0]*(4-len(top))
    shaded=(n+grow*.086).normalized()
    tint=pigment(x,y,z)
    variation=rng.uniform(.965,1.052)
    index=len(out_position)//3
    for t,offset,value in [(0,-1,.981),(0,1,.981),(.51,.61,1.004),(.51,-.61,1.004),(1,0,1.04)]:
        point=center+grow*length*t+n*(-.0025+length*.21*sin(t*pi*.76))+cross*width*(offset+.28*t*t)
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
rig.show_in_front=False
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
# The corneas and eyelid folds are on their own topology for the blink pose.
eye_mesh=bpy.data.meshes.new('Iris, cornées et paupières')
eye_mesh.from_pydata(eye_positions,[],eye_faces)
eye_model=bpy.data.objects.new('Regard de Nuage',eye_mesh)
bpy.context.collection.objects.link(eye_model)
eye_layer=eye_mesh.color_attributes.new(name='Pigment',type='BYTE_COLOR',domain='POINT')
for pixel,color,alpha in zip(eye_layer.data,eye_colors,eye_opacity):
    pixel.color_srgb=(*color,alpha)
for face in eye_mesh.polygons:
    face.use_smooth=True
eye_model.shape_key_add(name='Repos')
blink=eye_model.shape_key_add(name='Clignement')
for vertex,location in zip(blink.data,eye_closed):
    vertex.co=location
head_weight=eye_model.vertex_groups.new(name=bones[head][0])
head_weight.add(list(range(len(eye_positions))),1,'REPLACE')
eye_armature=eye_model.modifiers.new('Armature','ARMATURE')
eye_armature.object=rig
eye_model.parent=rig
eye_mat=coat.copy()
eye_mat.name='Iris ambré et reflets'
eye_shader=eye_mat.node_tree.nodes.get('Principled BSDF')
eye_shader.inputs['Roughness'].default_value=.47
eye_layer_node=eye_mat.node_tree.nodes.get(attribute.name)
eye_mat.node_tree.links.new(eye_layer_node.outputs['Color'],eye_shader.inputs['Emission Color'])
eye_shader.inputs['Emission Strength'].default_value=.28
eye_mesh.materials.append(eye_mat)
rig.rotation_euler.x=pi/2
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_distance=4.25
        area.spaces.active.region_3d.view_location=(0,0,.75)
        area.spaces.active.shading.color_type='VERTEX'
        area.spaces.active.region_3d.view_rotation=Vector((-.63,.78,-.22)).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'Nuage.blend'))

result={'p':encoded(out_position,'h'),'n':encoded(out_normal,'b'),'c':encoded(out_color,'B'),
        'i':encoded(out_indices,'H'),'fur':encoded(hair_faces,'H'),'b':encoded(out_bone,'B'),'w':encoded(out_weight,'B'),'rig':bones,
        'count':len(out_position)//3,'faces':body_triangles,'bodyVertices':fur_start,
        'neck':{'band':band,'bib':bib},
        'eyes':{
            'p':encoded([round(c*8192) for v in eye_positions for c in v],'h'),
            'closed':encoded([round(c*8192) for v in eye_closed for c in v],'h'),
            'c':encoded([round(c*255) for color,alpha in zip(eye_colors,eye_opacity) for c in (*color,alpha)],'B'),
            'i':encoded([i for face in eye_faces for i in face],'H'),
        }}
(ROOT/'nuage.json').write_text(json.dumps(result,separators=(',',':')))
print('Maillage soudé',body_triangles,'triangles · groom',len(hair_faces)//3,'triangles ·',len(bones),'os')
