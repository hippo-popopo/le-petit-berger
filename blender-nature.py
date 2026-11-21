"""Model the rocks, leaves and wool used in the mobile landscapes.

blender --background --python blender-nature.py -- nature.json
"""
import json
from math import cos, sin, tau, exp, floor
from pathlib import Path
import random
import sys

import bmesh
import bpy
from mathutils import Vector
from mathutils import noise


def round_list(values):
    return [round(x, 5) for x in values]


def save_mesh(name, positions, faces, uv, shades=None):
    mesh=bpy.data.meshes.new(name)
    # Store Z-up in Blender, then return to the game's right-handed Y-up space.
    mesh.from_pydata([(x, -z, y) for x,y,z in positions], [], faces)
    mesh.update()
    mesh.calc_loop_triangles()
    normals=[]
    for vertex in mesh.vertices:
        x,z,y=vertex.normal
        normals.extend((x,y,-z))
    data=dict(position=round_list(v for point in positions for v in point),normal=round_list(normals),
              uv=round_list(v for point in uv for v in point),
              index=[i for face in mesh.loop_triangles for i in face.vertices])
    if shades:
        data['color']=round_list(v for value in shades for v in (value,value*.995,value*.976))
    bpy.data.meshes.remove(mesh)
    return data


def sphere(name, subdivisions, deform):
    bm=bmesh.new()
    bmesh.ops.create_icosphere(bm,subdivisions=subdivisions,radius=1)
    bm.verts.index_update()
    points=[]
    for vertex in bm.verts:
        x,y,z=vertex.co
        points.append(deform(x,y,z))
    faces=[tuple(v.index for v in face.verts) for face in bm.faces]
    bm.free()
    return save_mesh(name,points,faces,[(.5+x*.43+z*.10,.5+y*.43+z*.10) for x,y,z in points])


def granite(x,y,z):
    n=noise.fractal(Vector((x*2.7+.3,y*2.4,z*2.7)),.82,2.1,3)
    layering=sin(y*11.8+x*4+z*.71)*.031
    r=1+.22*n+layering
    return (x*r+y*.14, max(-.80,y*r)*.93+.09*x*z, z*r+x*.072)


def foliage():
    rng=random.Random(92052)
    points,faces,uv=[],[],[]
    for i in range(34):
        turn=i*tau*.381966
        height=(i/33-.5)*1.99
        spread=(max(.09,1-height*height)**.5)*(.35+.57*rng.random())
        x,y,z=cos(turn)*spread,height*.62,sin(turn)*spread
        dx,dz=cos(turn+.6*rng.random()),sin(turn+.6*rng.random())
        length=.28+rng.random()*.38
        width=length*(.23+.14*rng.random())
        slope=(rng.random()-.42)*length
        ring=[(0,0,0),(.21,-.74,.02),(.52,-1,.12),(.83,-.59,.04),(1,0,-.12),
              (.79,.54,.065),(.53,.97,.12),(.21,.67,.05),(.48,0,.49)]
        offset=len(points)
        for t,w,h in ring:
            points.append((x+dx*t*length-dz*w*width,y+t*slope+h*width,z+dz*t*length+dx*w*width))
            uv.append((.5+w*.46,t))
        faces.extend((offset+j,offset+(j+1)%8,offset+8) for j in range(8))
    return save_mesh('Feuilles de chêne',points,faces,uv)


def canopy(x,y,z):
    n=noise.fractal(Vector((x*3.1,y*3.1+.4,z*3.1)),.73,2,3)
    mass=1+n*.18+.083*cos(x*8.6+y*5.2)*sin(z*8.8-y*2.9)
    return x*mass,y*mass,z*mass


sections=[
    (-.82,.83,.015,.065),(-.75,.80,.215,.28),(-.60,.82,.365,.374),
    (-.40,.82,.452,.437),(-.13,.83,.481,.449),(.14,.85,.474,.443),
    (.34,.89,.394,.413),(.50,.955,.295,.360),(.59,1.006,.225,.292),
    (.65,1.061,.146,.184),(.689,1.055,.010,.029)
]


def fleece(rows,sides,relief):
    points,uv,colors,faces=[],[],[],[]
    last=len(sections)-1
    for row in range(rows+1):
        t=row/rows*last
        index=min(last-1,floor(t))
        progress=t-index
        a,b=sections[index:index+2]
        before,after=sections[max(0,index-1)],sections[min(last,index+2)]
        values=[]
        for i in range(1,4):
            value,end=a[i],b[i]
            p,q=(end-before[i])*.5,(after[i]-value)*.5
            values.append(value+progress*(p+progress*(3*(end-value)-2*p-q+progress*(2*(value-end)+p+q))))
        cy,rx,ry=values
        z=a[0]+(b[0]-a[0])*progress
        for col in range(sides+1):
            angle=col%sides/sides*tau
            c,s=cos(angle),sin(angle)
            phase=angle+.13*sin(z*9.4)
            cell=noise.voronoi(Vector((cos(phase)*5.5,sin(phase)*5.5,z*13.2+.63)))[0][0]
            soft=exp(-cell*cell*2.3)
            locks=.5+.5*sin(6.7*z+5*angle)*cos(z*19.1-9*angle)
            depth=1+relief*(.108*soft+.085*locks-.071)
            points.append((c*rx*depth,cy+s*ry*depth,z))
            colors.append(1-relief*(.09*(1-s)*.5+.15*(1-soft)))
            uv.append((col/sides,row/rows))
            if row and col:
                i=len(points)-1
                j=i-sides-1
                faces.extend(((j-1,j,i-1),(j,i,i-1)))
    for col in range(1,sides-1):
        end=rows*(sides+1)
        faces.extend(((0,col+1,col),(end,end+col,end+col+1)))
    result=save_mesh('Toison',points,faces,uv,colors)
    normals=result['normal']
    for row in range(rows+1):
        a,b=row*(sides+1)*3,(row*(sides+1)+sides)*3
        merged=Vector(normals[a:a+3])+Vector(normals[b:b+3])
        normals[a:a+3]=normals[b:b+3]=round_list(merged.normalized())
    return result


def duck(x,y,z):
    breast=1+.14*exp(-((z-.58)**2)*7)
    taper=1-.19*max(0,-z)
    return x*breast*taper,y*(1+.07*z)+.12*z*z-.043*z,z


def goat(x,y,z):
    flank=1-.14*exp(-((z-.02)**2)*9)+.12*abs(z)
    return x*flank,y+.09*z*z-.045*z,z


def pig(x,y,z):
    width=1+.14*exp(-((z+.55)**2)*7.1)+.09*exp(-((z-.29)**2)*7.1)
    return x*width,y+.06*(1-z*z)*(1-2*y*y)-.07*z,z


data=dict(rock=sphere('Affleurement de granite',3,granite),stone=sphere('Pierre des murets',2,granite),
          canopy=sphere('Cime feuillue',3,canopy),spray=foliage(),
          fleeceNear=fleece(56,60,1),fleeceFar=fleece(20,24,.65),
          duck=sphere('Corps du canard',3,duck),goat=sphere('Corps de la chèvre',3,goat),
          pig=sphere('Corps du cochon',3,pig))
output=Path(sys.argv[sys.argv.index('--')+1])
output.write_text(json.dumps(data,separators=(',',':')))
