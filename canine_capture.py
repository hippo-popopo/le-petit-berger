"""Read the CC BY 4.0 dog motion archive from Figshare (doi:10.6084/m9.figshare.24968946)."""
from dataclasses import dataclass
from io import TextIOWrapper
from zipfile import ZipFile

import numpy as np


LEGS=('FR','HR','FL','HL')
LANDMARKS={
    'FR':('b_RightArm','b_RightForeArm','b_RightHand','b_RightFinger','Bip01_R_Finger0Nub'),
    'HR':('b_RightLegUpper','b_RightLeg','b_RightLeg1','b_RightAnkle','b_RightToe'),
    'FL':('b_LeftArm','b_LeftForeArm','b_LeftHand','b__LeftFinger','Bip01_L_Finger0Nub'),
    'HL':('b_LeftLegUpper','b_LeftLeg','b_LeftLeg1','b_LeftAnkle','b_LeftToe')
}
# Frame pairs include consecutive touchdowns of the right forepaw and one shared
# endpoint. The actual elapsed time and the other three contact windows are measured.
TAKES={
    'walk':('dog_quad_walk_002',8015,8098),
    'trot':('dog_quad_run_001',3531,3591),
    'canter':('dog_quad_run_002',1727,1773),
    'gallop':('dog_fast_run_02_005',1832,1876),
}


def bvh(archive,take,start=0,end=None):
    """Read the recorded joint positions in metres, with Y pointing up."""
    with ZipFile(archive) as files, TextIOWrapper(files.open('raw_bvh_data/'+take+'.bvh')) as stream:
        joints,parents,stack=[],[],[]
        for line in stream:
            words=line.split()
            verb=words[0]
            if verb in ('ROOT','JOINT','End'):
                stack.append(None if verb=='End' else len(joints))
                if verb!='End':
                    joints.append(words[1])
                    parents.append(stack[-2] if len(stack)>1 else None)
            elif verb=='}':
                stack.pop()
            elif verb=='CHANNELS':
                assert words[2:]==['Xposition','Yposition','Zposition','Zrotation','Xrotation','Yrotation'], line
            elif verb=='MOTION':
                frames=int(stream.readline().split()[-1])
                interval=float(stream.readline().split()[-1])
                break
        end=frames if end is None else end
        raw=[]
        for frame,line in enumerate(stream):
            if frame>=end:
                break
            if frame>=start:
                raw.append(np.fromstring(line,sep=' ').reshape(len(joints),6))
    rows=np.asarray(raw)
    rz,rx,ry=np.moveaxis(np.deg2rad(rows[:,:,3:]),2,0)
    cz,cx,cy=np.cos(rz),np.cos(rx),np.cos(ry)
    sz,sx,sy=np.sin(rz),np.sin(rx),np.sin(ry)
    r=np.stack((cz*cy-sz*sx*sy,-sz*cx,cz*sy+sz*sx*cy,
                sz*cy+cz*sx*sy,cz*cx,sz*sy-cz*sx*cy,
                -cx*sy,sx,cx*cy),axis=-1).reshape(len(rows),len(joints),3,3)
    p=rows[:,:,:3]*.01
    for i,parent in enumerate(parents):
        if parent is not None:
            p[:,i]=p[:,parent]+np.einsum('tij,tj->ti',r[:,parent],p[:,i])
            r[:,i]=r[:,parent]@r[:,i]
    return {name:p[:,i] for i,name in enumerate(joints)},interval


def paw_marks(points):
    return {tag:points[names[3]] if tag.startswith('F') else points[names[3]]*.74+points[names[4]]*.26
            for tag,names in LANDMARKS.items()}


def support(paw,interval,velocity=.95):
    # A paw in stance hovers around the ground and moves very little in world space.
    speed=np.linalg.norm(np.gradient(paw,interval,axis=0),axis=1)
    floor=np.quantile(paw[:,1],.09)
    return (paw[:,1]<floor+.042)&(speed<velocity)


def stride_contact(mark,dt,threshold):
    touching=support(mark,dt,threshold)[:-1]
    n=len(touching)
    starts=np.flatnonzero(touching&~np.roll(touching,1))
    if not len(starts):
        raise ValueError('A continuous stance could not be found in the capture')
    durations=[]
    for start in starts:
        duration=0
        while duration<n and touching[(start+duration)%n]:
            duration+=1
        durations.append(duration)
    start=int(starts[np.argmax(durations)])
    count=max(durations)
    phase=(np.arange(n+1)-start)%n
    active=phase<count
    envelope=np.clip(np.minimum(phase+1,count-phase)/4,0,1)*active
    return active,envelope, start/n, count/n


def pelvis_center(points):
    return .52*points['b_Hips']+.48*points['b_Spine3']


def planar_basis(heading):
    ahead=heading.copy()
    ahead[1]=0
    ahead/=np.linalg.norm(ahead)
    left=np.cross((0,1,0),ahead)
    return np.stack((left,(0,1,0),ahead),axis=1)


def closed_curve(values):
    """Remove the small mismatch between identical events on successive strides."""
    values=np.asarray(values)
    phase=np.linspace(0,1,len(values)).reshape((-1,)+(1,)*(values.ndim-1))
    result=values+(values[-1]-values[0])*(.5-phase)
    # A 3-frame cyclic Gaussian filters marker jitter without changing events.
    cycle=result[:-1]
    result=(np.roll(cycle,1,axis=0)+cycle*2+np.roll(cycle,-1,axis=0))*.25
    return np.concatenate((result,result[:1]))


@dataclass
class Stride:
    source: str
    frame_range: tuple
    duration: float
    distance: float
    feet: dict
    elbows: dict
    toes: dict
    wrists: dict
    shoulders: dict
    posture: np.ndarray
    support: dict
    contact: dict

    def frame(self,curve,t):
        i=(t%1)*(len(curve)-1)
        low=int(i)
        weight=i-low
        return curve[low]*(1-weight)+curve[low+1]*weight


def angle_pitch(v):
    return np.arctan2(-v[:,1],v[:,2])


def rear_angle(v):
    return np.arctan2(v[:,2],-v[:,1])


def read_stride(archive,style):
    take,start,end=TAKES[style]
    points,dt=bvh(archive,take,start,end+1)
    center=pelvis_center(points)
    basis=planar_basis(center[-1]-center[0])
    travel=float(((center[-1]-center[0])@basis)[2])
    marks=paw_marks(points)
    paws,elbows,toes,wrists,shoulders,contacts={},{},{},{},{},{}
    support_durations={}
    for tag,names in LANDMARKS.items():
        thigh,knee,wrist,foot,tip=[points[name] for name in names]
        marker=marks[tag]
        related=(marker-center)@basis
        touching,envelope,at,duration=stride_contact(marker,dt,1.8 if style=='gallop' else 1.05)
        support_durations[tag]=(round(at,4),round(duration,4))
        contacts[tag]=envelope
        floor=np.quantile(marker[touching,1],.35)
        shift=np.median(related[touching],axis=0)
        related[:,0]-=np.median(related[:,0])
        related[:,2]-=shift[2]
        related[:,1]=np.maximum(0,marker[:,1]-floor)
        related[touching,1]=0
        paws[tag]=closed_curve(related)
        shoulder=(thigh-center)@basis
        shoulders[tag]=closed_curve(shoulder-np.mean(shoulder,axis=0))
        axis=wrist-thigh
        axis/=np.linalg.norm(axis,axis=1,keepdims=True)
        pole=knee-thigh
        pole-=axis*np.sum(pole*axis,axis=1,keepdims=True)
        pole/=np.linalg.norm(pole,axis=1,keepdims=True)
        elbows[tag]=closed_curve(pole@basis)
        angle=rear_angle((foot-wrist)@basis)
        wrists[tag]=closed_curve(angle-np.median(angle[touching]))
        angle=angle_pitch((tip-foot)@basis) if tag.startswith('H') else -rear_angle((foot-wrist)@basis)
        toes[tag]=closed_curve(np.unwrap(angle)-np.median(angle[touching]))
    spine=(points['b_Spine3']-points['b_Hips'])@basis
    lumbar=(points['b_Spine1']-points['b_Hips'])@basis
    chest=(points['b_Spine3']-points['b_Spine1'])@basis
    shoulder=(points['b_LeftArm']-points['b_RightArm'])@basis
    pelvis=(points['b_LeftLegUpper']-points['b_RightLegUpper'])@basis
    neck=(points['b_Head']-points['b__Neck'])@basis
    head=(points['Bip01_HeadNub']-points['b_Head'])@basis
    tail=(points['b_Tail006']-points['b_Tail001'])@basis
    posture=np.stack(((center[:,1]-np.mean(center[:,1])),
        angle_pitch(spine),np.arctan2(shoulder[:,1],np.abs(shoulder[:,0])),
        np.arctan2(pelvis[:,1],np.abs(pelvis[:,0])),
        angle_pitch(lumbar)-angle_pitch(spine),angle_pitch(chest)-angle_pitch(spine),
        angle_pitch(neck)-angle_pitch(chest),angle_pitch(head)-angle_pitch(neck),
        np.unwrap(np.arctan2(tail[:,0],-tail[:,2]))),axis=1)
    posture[:,1:]-=np.mean(posture[:,1:],axis=0)
    return Stride(take,(start,end),(end-start)*dt,travel,paws,elbows,toes,wrists,shoulders,
                  closed_curve(posture),support_durations,contacts)
