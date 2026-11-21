"""Fit the paw pivots, protect the paw meshes and retarget captured canine gaits.

Run in Blender: blender -b --python rebuild_locomotion.py -- INPUT_STAGE OUTPUT_STAGE FIGSHARE_ZIP
"""
from dataclasses import dataclass
import json
from math import acos, atan2, cos, radians, sin, sqrt
from pathlib import Path
from shutil import copyfile
import sys

import numpy as np
from mathutils import Matrix, Quaternion, Vector

sys.path.insert(0,str(Path(__file__).parent))
from prepare_pack import read_glb, write_glb
from refine_hindquarters import values, smooth
from canine_capture import LEGS, TAKES, read_stride

X=Vector((1,0,0))
Y=Vector((0,1,0))
Z=Vector((0,0,1))
ONE=Vector((1,1,1))
JOINTS=('Proximal','Intermediaire','Distal','Patte')


@dataclass(frozen=True)
class Gait:
    take: str
    reach: float
    lower: float
    lift: float
    bend: float = 0
    pace: float = 1


GAITS={
    'Marche_capture':Gait('walk',.128,.016,.063),
    'Trot_capture':Gait('trot',.179,.029,.105),
    'Galop_lent_trois_temps':Gait('canter',.200,.040,.140),
    'Galop_capture':Gait('gallop',.223,.049,.183),
    'Approche_basse_conduite_du_troupeau':Gait('walk',.117,.045,.054,pace=.82),
    'Trot_en_virage_a_gauche':Gait('trot',.154,.035,.092,1,.92),
    'Trot_en_virage_a_droite':Gait('trot',.154,.035,.092,-1,.92),
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


def clamp(value,low,high):
    return min(high,max(low,value))


class CanineRig:
    def __init__(self,data,binary,captures):
        self.data,self.binary=data,binary
        self.captures=captures
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

    def body(self,gait,stride,t,drop):
        height,pitch,roll,hips,lumbar,chest,neck,head,tail=stride.frame(stride.posture,t)
        local={i:transform.copy() for i,transform in self.local.items()}
        root=self.named['Root']
        sway=clamp(roll*.053,-.017,.017)
        local[root].translation+=Vector((sway,(-gait.lower+height*.78-drop)*self.ratio,0))
        roll=clamp(roll,-.15,.15)
        orientation=Quaternion(Z,-roll*.56)@Quaternion(X,clamp(pitch*.86,-.18,.18))
        local[root]=matrix(local[root].translation,orientation@self.local[root].to_quaternion())
        tuck_gain=1.48 if gait.take=='gallop' else 1.15
        lowered=-.15 if gait.take=='walk' and gait.lower>.040 else -.04
        oscillations={
            'Bassin':((Z,-.60*(hips-roll)),(X,clamp(lumbar*tuck_gain,-.23,.23)),(Y,gait.bend*.065)),
            'Dos':((X,clamp(lumbar*.65,-.13,.13)),(Y,gait.bend*.024)),
            'Thorax':((X,clamp(chest*tuck_gain-lumbar*.32,-.21,.21)),(Y,gait.bend*.09)),
            'Encolure':((Y,radians(-10)),(X,clamp(neck*.64+lowered,-.21,.18))),
            'Crane':((Y,radians(-32)),(X,clamp(head*.60,-.12,.12))),
            'Queue_1':((Y,clamp(tail*.21,-.19,.19)),(X,-lumbar*.54)),
            'Queue_2':((Y,clamp(tail*.13,-.11,.11)),),
        }
        worlds={}
        for i in self.ids:
            parent=worlds.get(self.parents.get(i))
            transform=parent@local[i] if parent is not None else local[i]
            for axis,angle in oscillations.get(self.nodes[i]['name'],()):
                transform=matrix(transform.translation,Quaternion(axis,angle)@transform.to_quaternion())
            worlds[i]=transform
        return worlds

    def path(self,tag,gait,stride,gain,t):
        x,lift,z=stride.frame(stride.feet[tag],t)
        support=float(stride.frame(stride.contact[tag],t))
        toe=float(stride.frame(stride.toes[tag],t))
        ankle=float(stride.frame(stride.wrists[tag],t))
        side_sign=1 if tag.endswith('L') else -1
        toe=clamp(toe*.53,-.32,.42)
        ankle=clamp(ankle*.64,-.51,.45)
        marker,toe_limit,heel_limit=self.foot_floor[tag]
        foot_rotation=Quaternion(X,toe)
        neutral=self.reference[self.chains[tag][-1]]
        contact=marker.copy()
        contact.z=toe_limit if toe>=0 else heel_limit
        neutral_offset=contact-neutral.translation
        lowest=(foot_rotation@neutral_offset).y
        target=neutral.translation.copy()
        target.y=max(0,marker.y)+clamp(lift*.81,0,gait.lift)*self.ratio-lowest
        step_factor=gain*(1-gait.bend*side_sign*.18)
        target.z+=z*step_factor*self.ratio
        target.x+=clamp(x*.57,-.026,.026)*self.ratio+gait.bend*.013*self.ratio
        return target,foot_rotation,ankle,support

    def solve_leg(self,worlds,tag,gait,stride,gain,t):
        chain=self.chains[tag]
        a,b,c,d=self.points(chain)
        hip=worlds[chain[0]].translation
        parent=self.parents[chain[0]]
        body_rotation=(worlds[parent]@self.reference[parent].inverted()).to_quaternion()
        foot,foot_turn,ankle,support=self.path(tag,gait,stride,gain,t)
        if tag.startswith('F'):
            measured=stride.frame(stride.shoulders[tag],t)
            hip+=Vector((clamp(measured[0]*.23,-.014,.014),
                         clamp(measured[1]*.46,-.022,.022),
                         clamp(measured[2]*.57,-.040,.040)))*self.ratio
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
        captured=Vector(stride.frame(stride.elbows[tag],t))
        captured-=direction*captured.dot(direction)
        if captured.length>.18 and captured.dot(flex)>0:
            flex=flex.lerp(captured.normalized(),.55)
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
        return support,sole,extension

    def sample(self,gait,stride,gain,t):
        def solve(drop):
            worlds=self.body(gait,stride,t,drop)
            contact={tag:self.solve_leg(worlds,tag,gait,stride,gain,t) for tag in LEGS}
            return worlds,contact

        worlds,contact=solve(0)
        reach=max(extension*weight for weight,_,extension in contact.values())
        if reach>.002:
            worlds,contact=solve(min(.040,reach*1.25/self.ratio))
        return worlds,contact

    def bake(self):
        reports={}
        for animation in self.data['animations']:
            name=animation['name']
            if name not in GAITS:
                continue
            gait=GAITS[name]
            stride=self.captures[gait.take]
            distance=max(float(np.max(np.abs(points[:,2]))) for points in stride.feet.values())
            gain=gait.reach/distance
            duration=stride.duration/gait.pace
            count=round(duration*60)+1
            samples=[self.sample(gait,stride,gain,i/(count-1)) for i in range(count)]
            data=self.data
            times=attribute(data,self.binary,np.linspace(0,duration,count),'SCALAR')
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
                if ref==root or self.nodes[ref]['name'] in ('FR_Proximal','FL_Proximal'):
                    paths.append(('translation',locations,'VEC3'))
                for kind,rows,dimension in paths:
                    index=attribute(data,self.binary,rows,dimension)
                    animation['channels'].append(dict(sampler=len(animation['samplers']),target=dict(node=ref,path=kind)))
                    animation['samplers'].append(dict(input=times,output=index,interpolation='LINEAR'))
            contacts=[[round(contact[tag][0],5) for tag in LEGS] for _,contact in samples]
            animation['extras']={'locomotion':True,'contacts':contacts,'take':stride.source,
                                 'stride':round(stride.distance*gain*self.ratio*2.24,4)}
            supported=[float(sole.y) for _, contact in samples for weight,sole,_ in contact.values() if weight>.7]
            clearance=[float(sole.y) for _, contact in samples for _,sole,_ in contact.values()]
            worst=max(gap for _,contact in samples for _,_,gap in contact.values())
            reports[name]={'samples':count,'source':stride.source,'frames':stride.frame_range,
                           'duty':stride.support,'stance_min_mm':round(min(supported)*1000,1),
                           'stance_max_mm':round(max(supported)*1000,1),
                           'minimum_mm':round(min(clearance)*1000,1),'unreachable_mm':round(max(0,worst)*1000,1)}
        return reports


def main():
    source,output,archive=map(Path,sys.argv[sys.argv.index('--')+1:])
    captures={style:read_stride(archive,style) for style in TAKES}
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
        rig=CanineRig(data,binary,captures)
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
