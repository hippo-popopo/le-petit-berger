"""Fit the four paw pivots, protect the paw meshes and bake new quadruped gaits.

Run in Blender: blender -b --python rebuild_locomotion.py -- INPUT_STAGE OUTPUT_STAGE
"""
from dataclasses import dataclass
import json
from math import acos, atan2, cos, pi, radians, sin, sqrt, tau
from pathlib import Path
from shutil import copyfile
import sys

import numpy as np
from mathutils import Matrix, Quaternion, Vector

sys.path.insert(0,str(Path(__file__).parent))
from prepare_pack import read_glb, write_glb
from refine_hindquarters import values, smooth

X=Vector((1,0,0))
Y=Vector((0,1,0))
Z=Vector((0,0,1))
ONE=Vector((1,1,1))
LEGS=('FR','HR','FL','HL')
JOINTS=('Proximal','Intermediaire','Distal','Patte')


@dataclass(frozen=True)
class Gait:
    duration: float
    duty: float
    shifts: tuple
    reach: float
    lift: float
    lower: float
    bounce: float
    pitch: float
    bend: float = 0


TROT=(0,.50,.50,0)
GAITS={
    'Marche_capture':Gait(.79,.65,(0,.73,.50,.23),.114,.042,.019,.009,1.3),
    'Trot_capture':Gait(.53,.49,TROT,.154,.074,.032,.016,2.4),
    'Galop_lent_trois_temps':Gait(.47,.37,(0,.52,.86,.37),.170,.105,.050,.021,4.0),
    'Galop_capture':Gait(.40,.27,(0,.57,.89,.45),.184,.135,.067,.028,5.1),
    'Approche_basse_conduite_du_troupeau':Gait(.92,.68,(0,.76,.50,.26),.113,.048,.045,.009,1.8),
    'Trot_en_virage_a_gauche':Gait(.61,.53,TROT,.128,.071,.032,.016,2.7,1),
    'Trot_en_virage_a_droite':Gait(.61,.53,TROT,.128,.071,.032,.016,2.7,-1),
}


def matrix(position,rotation):
    return Matrix.LocRotScale(position,rotation,ONE)


def trs(transform):
    p,q,_=transform.decompose()
    return list(p),[q.x,q.y,q.z,q.w]


def node_matrix(node):
    x,y,z,w=node.get('rotation',(0,0,0,1))
    return matrix(Vector(node.get('translation',(0,0,0))),Quaternion((w,x,y,z)).normalized())


def attribute(data,binary,rows,kind):
    rows=np.asarray(rows,dtype='<f4')
    assert len(binary)%4==0
    view=len(data['bufferViews'])
    data['bufferViews'].append(dict(buffer=0,byteOffset=len(binary),byteLength=rows.nbytes))
    binary.extend(rows.tobytes())
    index=len(data['accessors'])
    data['accessors'].append(dict(bufferView=view,componentType=5126,count=len(rows),type=kind))
    return index


def ease(t):
    t=min(1.,max(0.,t))
    return t*t*(3-2*t)


class CanineRig:
    def __init__(self,data,binary):
        self.data,self.binary=data,binary
        self.nodes=data['nodes']
        self.ids=data['skins'][0]['joints']
        self.parents={child:i for i,node in enumerate(self.nodes) for child in node.get('children',[])}
        self.named={self.nodes[i]['name']:i for i in self.ids}
        self.slots={i:n for n,i in enumerate(self.ids)}
        self.source_pose={i:node_matrix(self.nodes[i]) for i in self.ids}
        self.reference=self.worlds(self.source_pose)
        self.ratio=self.reference[self.named['Root']].translation.y/.425
        self.chains={tag:[self.named[tag+'_'+name] for name in JOINTS] for tag in LEGS}
        self.sole={}
        self.foot_floor={}
        self.paw_audit=self.fit_paws()
        self.local={i:(self.reference[self.parents[i]].inverted()@self.reference[i] if self.parents.get(i) in self.reference
                       else self.reference[i]) for i in self.ids}
        self.bind()
        self.poles={}
        for tag,chain in self.chains.items():
            a,b,c,_=self.points(chain)
            line=(c-a).normalized()
            pole=b-a-line*line.dot(b-a)
            self.poles[tag]=pole.normalized()

    def worlds(self,local):
        result={}
        for i in self.ids:
            transform=local[i]
            parent=result.get(self.parents.get(i))
            result[i]=parent@transform if parent is not None else transform.copy()
        return result

    def points(self,chain):
        return [self.reference[i].translation for i in chain]

    def fit_paws(self):
        primitive=self.data['meshes'][0]['primitives'][0]['attributes']
        xyz=values(self.data,self.binary,primitive['POSITION'])
        joints=values(self.data,self.binary,primitive['JOINTS_0'])
        weights=values(self.data,self.binary,primitive['WEIGHTS_0'])
        dense=np.zeros((len(xyz),len(self.ids)),dtype=np.float32)
        np.add.at(dense,(np.arange(len(xyz))[:,None],joints),weights)
        report={}
        for tag,chain in self.chains.items():
            _,knee,distal,paw=self.points(chain)
            _,_,i_distal,i_paw=(self.slots[i] for i in chain)
            influence=dense[:,i_distal]+dense[:,i_paw]
            feet=(influence>.72)&(xyz[:,1]<.040*self.ratio)
            assert np.count_nonzero(feet)>100,tag
            cloud=xyz[feet]
            x,y,z=np.median(cloud,axis=0)
            offsets=Vector((float(x)-paw.x,0,float(z)-paw.z))
            paw+=offsets
            ankle=(influence>.57)&(np.abs(xyz[:,1]-distal.y)<.019*self.ratio)
            if np.count_nonzero(ankle)>30:
                center=np.median(xyz[ankle],axis=0)
                reach=Vector((float(center[0])-distal.x,0,float(center[2])-distal.z))
                distal+=reach*.70
            self.reference[chain[2]].translation=distal
            self.reference[chain[3]].translation=paw

            sole_y=float(np.quantile(cloud[:,1],.008))
            low=cloud[cloud[:,1]<sole_y+.008*self.ratio]
            sole_x,_,sole_z=np.median(low,axis=0)
            toe=float(np.quantile(low[:,2],.94))
            heel=float(np.quantile(low[:,2],.06))
            self.foot_floor[tag]=(Vector((float(sole_x),sole_y,float(sole_z))),toe,heel)
            self.sole[tag]=self.reference[chain[3]].inverted()@self.foot_floor[tag][0]
            below=1-smooth(.036*self.ratio,.085*self.ratio,xyz[:,1])
            lower=below*smooth(.37,.79,influence)
            lower[feet&(xyz[:,1]<.028*self.ratio)]=1
            distal_share=smooth(.030*self.ratio,.088*self.ratio,xyz[:,1])
            dense*=1-lower[:,None]
            dense[:,i_distal]+=lower*distal_share
            dense[:,i_paw]+=lower*(1-distal_share)
            report[tag]={'sole':list(self.sole[tag]),'points_stabilized':int(np.count_nonzero(lower>.015)),
                         'rigid_foot_vertices':int(np.count_nonzero(lower==1))}
        slots=np.argsort(-dense,axis=1)[:,:4]
        values4=np.take_along_axis(dense,slots,axis=1)
        joints[:]=slots
        weights[:]=values4/values4.sum(axis=1)[:,None]
        return report

    def bind(self):
        changes={i for chain in self.chains.values() for i in chain[2:]}
        for i in changes:
            self.nodes[i]['translation']=trs(self.local[i])[0]
        inverse=values(self.data,self.binary,self.data['skins'][0]['inverseBindMatrices'])
        for index,i in enumerate(self.ids):
            inverse[index]=np.asarray(self.reference[i].inverted()).T.ravel()

    def body(self,gait,t):
        local={i:transform.copy() for i,transform in self.local.items()}
        root=self.named['Root']
        rhythm=cos(t*tau*2)
        swing=sin(t*tau)
        rotation=Quaternion(X,radians(gait.pitch)*sin((t+.07)*tau*2))
        if gait.duty<.4:
            rotation=Quaternion(X,radians(gait.pitch)*sin((t+.06)*tau))
            rhythm=cos((t+.10)*tau*2)
        local[root].translation+=Vector((.008*swing,(-gait.lower+gait.bounce*rhythm)*self.ratio,0))
        local[root]=matrix(local[root].translation,rotation@self.local[root].to_quaternion())
        oscillations={
            'Bassin':((Y,2.8*swing+gait.bend*2.7),(X,.62*gait.pitch*cos(t*tau))),
            'Dos':((Y,-1.7*swing+gait.bend*.9),),
            'Thorax':((Y,-2.0*swing+gait.bend*2.2),(X,-.34*gait.pitch*cos(t*tau))),
            'Encolure':((Y,-10),(X,(-7.3 if gait.duty>.6 and gait.lower>.040 else -1.7)-gait.pitch*.37*cos(t*tau))),
            'Crane':((Y,-32),(X,gait.pitch*.27*cos(t*tau))),
            'Queue_1':((Y,4.2*swing),(X,-gait.pitch*.5)),
            'Queue_2':((Y,3.8*sin((t-.10)*tau)),),
        }
        worlds={}
        for i in self.ids:
            parent=worlds.get(self.parents.get(i))
            transform=parent@local[i] if parent is not None else local[i]
            for axis,angle in oscillations.get(self.nodes[i]['name'],()):
                transform=matrix(transform.translation,Quaternion(axis,radians(angle))@transform.to_quaternion())
            worlds[i]=transform
        return worlds

    def path(self,tag,gait,t):
        index=LEGS.index(tag)
        p=(t-gait.shifts[index]+1)%1
        resting=p<gait.duty
        front=tag.startswith('F')
        same_side=tag.endswith('L')
        magnitude=gait.reach*self.ratio*(1.0 if front else .94)
        magnitude*=1+gait.bend*(-.18 if same_side else .18)
        if resting:
            u=p/gait.duty
            z=1-2*u
            lift=0
            toe=-.056*(1-ease(u/.26))+.125*ease((u-.77)/.23)
            ankle=.11*(1-u)-.15*u
        else:
            u=(p-gait.duty)/(1-gait.duty)
            slope=-2*(1-gait.duty)/gait.duty
            # Hermite preserves ground-relative velocity at lift-off and landing.
            # The end slopes are capped in flight so the paw keeps its reach envelope.
            z=-1+2*ease(u)+max(-1.6,slope)*(2*u**3-3*u*u+u)
            lift=gait.lift*self.ratio*sin(pi*u)**1.65
            toe=.125*(1-ease(u))+.30*sin(pi*u)**1.8-.056*ease(u)
            ankle=-.15*(1-ease(u))+.11*ease(u)-(.34 if front else .21)*sin(pi*u)
        marker,toe_limit,heel_limit=self.foot_floor[tag]
        foot_rotation=Quaternion(X,toe)
        neutral=self.reference[self.chains[tag][-1]]
        contact=marker.copy()
        contact.z=toe_limit if toe>=0 else heel_limit
        neutral_offset=contact-neutral.translation
        support=(foot_rotation@neutral_offset).y
        target=neutral.translation.copy()
        target.y=max(0,marker.y)+lift-support
        target.z+=magnitude*z
        side_sign=1 if same_side else -1
        target.x+=side_sign*.011*self.ratio*(sin(pi*u) if not resting else 0)+gait.bend*.014*self.ratio
        return target,foot_rotation,ankle,resting

    def solve_leg(self,worlds,tag,gait,t):
        chain=self.chains[tag]
        a,b,c,d=self.points(chain)
        hip=worlds[chain[0]].translation
        parent=self.parents[chain[0]]
        body_rotation=(worlds[parent]@self.reference[parent].inverted()).to_quaternion()
        foot,foot_turn,ankle,planted=self.path(tag,gait,t)
        first,second,lower=(b-a).length,(c-b).length,(d-c).length
        # Side spacing is folded into the target. Flexion stays in the anatomical plane.
        z_base=atan2((d-c).z,-(d-c).y)
        target_axis=foot-hip
        towards=atan2(target_axis.z,-target_axis.y)
        desired=z_base+ankle
        if tag.startswith('F'):
            bounds=(-.56,.86)
        else:
            bounds=(-.15,.88)
        desired=max(bounds[0],min(bounds[1],desired))
        toward_side=(d-c).x*.48
        radius=sqrt(max(0,lower*lower-toward_side*toward_side))
        sagittal=sqrt(target_axis.y**2+target_axis.z**2)
        reach_limit=first+second-.0015*self.ratio
        required_dot=(target_axis.length_squared+lower*lower-reach_limit*reach_limit)*.5
        allowed=(required_dot-target_axis.x*toward_side)/max(.000001,radius*sagittal)
        arc=acos(max(-1,min(1,allowed)))
        angle=max(towards-arc,min(towards+arc,desired))
        angle=max(bounds[0],min(bounds[1],angle))
        lower_link=Vector((toward_side,-radius*cos(angle),radius*sin(angle)))
        span=foot-lower_link-hip
        extension=span.length-reach_limit
        direction=span.normalized()
        reach=min(first+second-.0015*self.ratio,max(abs(first-second)+.003*self.ratio,span.length))
        wrist=hip+direction*reach
        flex=body_rotation@self.poles[tag]
        flex-=direction*flex.dot(direction)
        if flex.length<.05:
            flex=Z*(1 if tag.startswith('H') else -1)
            flex-=direction*direction.dot(flex)
        knee_axis=(first*first-second*second+reach*reach)/(2*reach)
        knee=hip+direction*knee_axis+flex.normalized()*sqrt(max(0,first*first-knee_axis*knee_axis))
        points=[hip,knee,wrist,wrist+lower_link]
        for j,i in enumerate(chain):
            rest=self.reference[i].to_quaternion()
            if j<3:
                start=(b-a,c-b,d-c)[j]
                delta=start.rotation_difference(points[j+1]-points[j])
            else:
                delta=foot_turn
            worlds[i]=matrix(points[j],delta@rest)
        sole=worlds[chain[-1]]@self.sole[tag]
        return planted,sole,extension

    def sample(self,gait,t):
        worlds=self.body(gait,t)
        contact={tag:self.solve_leg(worlds,tag,gait,t) for tag in LEGS}
        return worlds,contact

    def bake(self):
        reports={}
        for animation in self.data['animations']:
            name=animation['name']
            if name not in GAITS:
                continue
            gait=GAITS[name]
            count=round(gait.duration*60)+1
            samples=[self.sample(gait,i/(count-1)) for i in range(count)]
            data=self.data
            times=attribute(data,self.binary,np.linspace(0,gait.duration,count),'SCALAR')
            animation['samplers'],animation['channels']=[],[]
            for ref in self.ids:
                root=self.named['Root']
                locations,rotations=[],[]
                parent=self.parents.get(ref)
                for worlds,_ in samples:
                    world=worlds[ref]
                    local=worlds[parent].inverted()@world if parent in worlds else world
                    location,rotation=trs(local)
                    if rotations and sum(a*b for a,b in zip(rotations[-1],rotation))<0:
                        rotation=[-value for value in rotation]
                    locations.append(location)
                    rotations.append(rotation)
                paths=[('rotation',rotations,'VEC4')]
                if ref==root:
                    paths.append(('translation',locations,'VEC3'))
                for kind,rows,dimension in paths:
                    index=attribute(data,self.binary,rows,dimension)
                    animation['channels'].append(dict(sampler=len(animation['samplers']),target=dict(node=ref,path=kind)))
                    animation['samplers'].append(dict(input=times,output=index,interpolation='LINEAR'))
            animation['extras']={'locomotion':True,'duty':gait.duty,'strikes':gait.shifts,
                                 'stride':round(gait.reach*2*self.ratio/gait.duty*2.24,4)}
            supported=[float(sole.y) for _, contact in samples for planted,sole,_ in contact.values() if planted]
            clearance=[float(sole.y) for _, contact in samples for _,sole,_ in contact.values()]
            worst=max(gap for _,contact in samples for _,_,gap in contact.values())
            reports[name]={'samples':count,'stance_min_mm':round(min(supported)*1000,1),
                           'stance_max_mm':round(max(supported)*1000,1),
                           'minimum_mm':round(min(clearance)*1000,1),'unreachable_mm':round(max(0,worst)*1000,1)}
        return reports


def main():
    source,output=map(Path,sys.argv[sys.argv.index('--')+1:])
    catalogue=json.loads((source/'import.json').read_text())
    output.mkdir(parents=True,exist_ok=True)
    results={}
    for race in catalogue['breeds']:
        label=race['id']
        folder=output/label
        folder.mkdir(exist_ok=True)
        f=race['file']
        data,original=read_glb(source/label/f)
        binary=bytearray(original)
        rig=CanineRig(data,binary)
        gait_report=rig.bake()
        support={}
        for tag in LEGS:
            marker,toe,heel=rig.foot_floor[tag]
            inverse=rig.reference[rig.chains[tag][-1]].inverted()
            support[tag]=[list(inverse@Vector((marker.x,marker.y,z))) for z in (heel,toe)]
        data['skins'][0]['extras']={'pawSoles':{tag:list(rig.sole[tag]) for tag in LEGS},'pawSupports':support}
        data['buffers'][0]['byteLength']=len(binary)
        write_glb(folder/f,data,binary)
        for coat in race['coats']:
            name=coat['texture']
            copyfile(source/label/name,folder/name)
        results[label]={'paws':rig.paw_audit,'gaits':gait_report}
    gear=output/'Accessoires'
    gear.mkdir(exist_ok=True)
    for item in catalogue['gear']:
        name=item['file']
        copyfile(source/'Accessoires'/name,gear/name)
    copyfile(source/'import.json',output/'import.json')
    (output/'bilan-foulees.json').write_text(json.dumps(results,indent=2))
    print(json.dumps(results,indent=2))


if __name__=='__main__':
    main()
