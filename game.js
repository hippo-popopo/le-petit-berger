'use strict';
const $ = id => document.getElementById(id);
const stage = $('stage');
const canvas = $('world');
const TAU = 2 * Math.PI;
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const point = (x, z) => ({x, z});
const mix = (a, b, t) => a + (b - a) * t;
const prefersStill = matchMedia('(prefers-reduced-motion: reduce)').matches;
const regions = [
  {
    title:'Le pré des marguerites', place:'La ferme de Nuage', weather:'Matin clair', icon:'☀',
    description:'Six moutons se sont éparpillés entre le pré, le verger et les hauteurs. Ramène-les à la bergerie.',
    note:'Contourne le groupe, puis avance doucement derrière lui. Les moutons s’écartent de Nuage.',
    menu:'Le pré et ses trois pâturages', victory:'Tout le troupeau est rentré. Du bon travail, Nuage !',
    half:[64,54], start:[-2,41,3.035], house:[33,-22], seed:287, grass:['#a8b77a','#839e6c','#c1c48c','#759167'],
    dirt:'#d6b88f', horizon:'#ebedce', sky:'#a4c9cc', fog:127,
    pens:{sheep:[16,33,-14,2,-5.5,5.3]},
    hills:[[-38,-20,6.2,21,17],[30,-36,7.3,22,15],[48,21,7.4,17,22],[-34,19,2.7,18,22],[3,-31,2.1,19,12]],
    ponds:[[-30,25,10.5,7.1,-.68]],
    trails:[
      [[-1,53],[-3,34],[-1,16],[3,4],[11,-4],[16,-5.5],[26,-7],[32,-17]],
      [[3,4],[-9,-5],[-20,-13],[-33,-16],[-46,-25],[-57,-36]],
      [[11,-4],[7,-21],[20,-32],[34,-37],[51,-35]]
    ],
    groves:[[-35,-23,10,12,5],[-19,-33,10,13,7],[50,-16,12,16,7],[43,25,10,8,6],[-46,32,9,13,9]],
    walls:[[[-44,-33],[-38,-30],[-31,-31],[-26,-29]],[[25,17],[33,12],[43,12]],[[2,-34],[11,-39],[22,-39]]],
    landmarks:[[-32,-18,'Le vieux verger'],[34,-36,'La colline du levant'],[-30,25,'La mare aux joncs']],
    animals:[
      ['sheep',-5,22],['sheep',-1.6,24.8],['sheep',3.4,22.4],
      ['sheep',-36.5,-15.8],['sheep',-32.3,-13.8],['sheep',34.8,-35.2]
    ]
  },{
    title:'Les secrets du verger', place:'Le vallon des pommiers', weather:'Vent d’automne', icon:'≋',
    description:'Huit moutons à retrouver, dont deux à couvert dans le verger et près du vieux moulin.',
    note:'Aboie à proximité d’une cachette. Pour pousser le groupe, place-toi à l’opposé de sa destination.',
    menu:'Des vergers, des murets et un vieux moulin', victory:'Le moulin peut tourner tranquille. Même les moutons les plus discrets sont rentrés.',
    half:[86,69], start:[-8,53,Math.PI], house:[49,-43], mill:[-54,-41], seed:972,
    grass:['#b7b67a','#939d69','#d0bb83','#a0a16a'], dirt:'#d6ad7d',
    horizon:'#f8e8be', sky:'#adc6c3', fog:151,
    pens:{sheep:[30,48,-34,-16,-24.6,5.7]},
    hills:[[-52,-41,10,24,19],[-35,9,5.1,21,26],[25,-45,6,24,15],[61,-2,7.5,22,28],[45,43,7.8,23,19],[-65,35,6,19,19]],
    ponds:[[57,25,13,8,-.4]],
    trails:[
      [[-8,68],[-8,49],[-6,25],[-1,4],[10,-12],[21,-22],[30,-24.6],[41,-25],[49,-38]],
      [[-1,4],[-15,-5],[-31,-10],[-45,-20],[-53,-34],[-54,-41],[-69,-55]],
      [[-6,25],[-24,27],[-41,31],[-67,36]],
      [[21,-22],[15,-38],[14,-51],[26,-61],[46,-64]]
    ],
    groves:[[-51,-16,8,14,15],[-32,-15,12,13,11],[-54,31,15,14,15],[2,-50,18,10,11],[52,16,12,11,7],[67,-47,10,12,8]],
    walls:[[[-65,-3],[-51,-1],[-38,1],[-28,2]],[[-25,2],[-16,4],[-10,4]],[[12,21],[22,16],[35,14],[46,11]],[[16,-34],[10,-38],[4,-38]]],
    landmarks:[[-54,-41,'Le moulin'],[-52,-15,'Le grand verger'],[57,25,'La mare du vallon'],[-56,33,'Les pommiers bas']],
    hideouts:[[-40.7,-14.2,'bush'],[-50.1,-40.8,'hay']],
    animals:[
      ['sheep',-9.1,33],['sheep',-5.2,30.8],['sheep',-3.1,32.9],
      ['sheep',-53.6,26.6],['sheep',-49.4,24.4],['sheep',16.0,-49.2],
      ['sheep',-40.5,-12.0,'bush'],['sheep',-48.4,-39.2,'hay']
    ]
  },{
    title:'La bourrasque', place:'Les landes de la grande mare', weather:'Le vent se lève', icon:'≋',
    description:'Six moutons et quatre canards à mettre à l’abri. Chaque troupeau a son propre enclos.',
    note:'Resserre un groupe à la fois. Les canards se rabattent plus vite que les moutons.',
    menu:'Deux troupeaux et une bourrasque', victory:'Moutons et canards sont au sec. La ferme peut enfin s’endormir.',
    half:[94,77], start:[-5,57,-2.95], house:[48,-49], seed:832,
    grass:['#9eb096','#779a88','#adc19c','#7a9a80'], dirt:'#c4a885',
    horizon:'#dce5d8', sky:'#91b6c3', fog:140,
    pens:{sheep:[31,50,-39,-21,-29.5,5.6], duck:[22,40,22,38,30.8,5.0]},
    hills:[[-52,-39,9,26,23],[9,-56,5.5,25,19],[56,-46,8.3,22,21],[-63,39,6.7,24,19],[59,29,5.8,19,25],[-20,12,3.0,18,18]],
    ponds:[[-42,-2,15.2,9.4,-.85],[-34,43,12.8,8.6,-.66],[53,32,8.3,5.6,.6]],
    trails:[
      [[-5,76],[-5,54],[-8,35],[-5,13],[5,-4],[18,-18],[27,-27],[31,-29.5],[42,-30],[46,-44]],
      [[-8,35],[-1,30],[8,29],[15,30],[22,30.8],[32,32]],
      [[-5,13],[-18,12],[-31,15],[-47,16],[-60,13],[-71,4],[-79,-18]],
      [[5,-4],[1,-20],[-6,-33],[-14,-46],[-28,-55],[-42,-57],[-66,-53]]
    ],
    groves:[[-61,-25,10,17,15],[-56,22,9,14,13],[-54,52,14,14,15],[15,-58,14,11,12],[60,49,18,10,10],[66,-45,14,16,11]],
    walls:[[[-49,-35],[-39,-34],[-28,-29],[-17,-27]],[[20,11],[30,9],[38,8],[51,9]],[[4,-43],[15,-40],[26,-41]],[[2,61],[10,62],[19,60]]],
    landmarks:[[-42,-2,'La grande mare'],[-34,43,'Les roseaux'],[-31,-48,'Le chemin des landes'],[53,32,'La mare haute']],
    hideouts:[[-29,-46,'hay']],
    animals:[
      ['sheep',-14.7,7.5],['sheep',-10.5,9.0],['sheep',-8.8,5.2],
      ['sheep',-59.7,-23.3],['sheep',-56.7,-21.0],['sheep',-27.0,-44.5,'hay'],
      ['duck',-26.3,34.6],['duck',-23.5,36.0],['duck',-20.8,39.1],['duck',-10,52.1]
    ]
  }
];

const species = {
  sheep:{label:'Bergerie',singular:'mouton',plural:'moutons',title:'Moutons',radius:.31,flight:9.6,neighbours:15.3,spacing:1.11,trot:4.42,boost:2.29,max:5.85,cohesion:.92},
  duck:{label:'Canardier',singular:'canard',plural:'canards',title:'Canards',radius:.22,flight:7.5,neighbours:10.8,spacing:.73,trot:3.90,boost:2.68,max:5.20,cohesion:1.21},
  goat:{label:'Chèvrerie',singular:'cabri',plural:'chèvres',title:'Chèvres',radius:.29,flight:7.0,neighbours:10.1,spacing:1.28,trot:4.95,boost:2.61,max:6.15,cohesion:.41},
  pig:{label:'Porcherie',singular:'cochon',plural:'cochons',title:'Cochons',radius:.37,flight:7.4,neighbours:9.4,spacing:1.30,trot:3.16,boost:2.34,max:4.35,cohesion:.57}
};
const penSpecs=species;
const fieldDuck=[19,35,13,26,19.5,5];
const orchardGoat=[4,24,-50,-36,-43,5.7];
const orchardPig=[34,53,17,32,24.5,5.7];
const moorGoat=[33,49,-9,5,-2,5.1];
const levels=[
  {
    ...regions[0],region:0,id:'premier',title:'Le premier rassemblement',label:'Apprendre',seconds:105,
    description:'Rentre trois moutons à la bergerie.',
    note:'Contourne le groupe au pas. Place-toi ensuite derrière lui pour le pousser vers la porte.',
    challenge:'Aucun aboiement',bonus:'quiet',victory:'Le premier troupeau est à l’abri. Nuage a trouvé le bon rythme.',
    animals:[['sheep',-5,22],['sheep',-1.6,24.8],['sheep',3.4,22.4]]
  },{
    ...regions[0],region:0,id:'portillon',title:'Le portillon fermé',label:'Ouvrir un passage',seconds:180,
    description:'Ouvre le portillon et fais rentrer cinq moutons.',
    note:'Approche de la poignée de la bergerie et touche Ouvrir. Regroupe ensuite les deux petits troupeaux.',
    challenge:'Deux aboiements maximum',bonus:'twoBarks',victory:'Les deux groupes ont passé le portillon.',
    locks:['sheep'],animals:[['sheep',-3,12],['sheep',-.8,9.5],['sheep',-6,9],['sheep',-23,-12.9],['sheep',-20,-10.1]]
  },{
    ...regions[0],region:0,id:'tri',title:'Chacun chez soi',label:'Trier deux espèces',seconds:235,
    description:'Sépare quatre moutons et trois canards. Chacun a son enclos.',
    note:'Pousse un groupe sur le côté avant de conduire l’autre. Les canards se resserrent plus vite.',
    challenge:'Aucune erreur d’enclos',bonus:'correct',victory:'Les deux troupeaux sont rentrés au bon endroit.',
    pens:{...regions[0].pens,duck:fieldDuck},start:[-4,34,3.03],
    animals:[['sheep',-3.5,12.4],['sheep',-.8,12],['sheep',.5,8.6],['sheep',-4.8,7.2],['duck',-1.4,8.1],['duck',2.8,11.1],['duck',1.7,6.3]]
  },{
    ...regions[0],region:0,id:'ruisseau',title:'Le pont du ruisseau',label:'Franchir le ruisseau',seconds:230,
    description:'Fais traverser cinq moutons par le pont, puis guide-les à la bergerie.',
    note:'Le ruisseau coupe le pré. Resserre le troupeau avant le pont et avance droit derrière lui.',
    challenge:'Rentrer sans affoler le troupeau',bonus:'calm',victory:'Tout le troupeau a traversé le pont.',
    stream:{x:-11,width:8,z:12,gap:6.3},start:[1,32,-2.83],
    trails:[[[1,38],[2,23],[-1,15],[-6,12],[-16,12],[-27,13],[-42,19]],[[3,24],[7,11],[11,-4],[16,-5.5],[26,-7],[32,-17]]],
    animals:[['sheep',-25,13],['sheep',-23,15.1],['sheep',-27.5,11.8],['sheep',-33,-4],['sheep',-30.8,-5.1]]
  },{
    ...regions[1],region:1,id:'cabris',title:'Les cabris du moulin',label:'Rabattre les chèvres',seconds:255,
    description:'Quatre chèvres se faufilent entre le moulin et les murets.',
    note:'Les chèvres se regroupent peu. Coupe-leur la route en faisant un grand détour.',
    challenge:'Deux aboiements maximum',bonus:'twoBarks',victory:'Les cabris ont fini par rentrer à la chèvrerie.',
    pens:{goat:orchardGoat},start:[-21,31,-2.91],
    animals:[['goat',-28,8],['goat',-37,12],['goat',-51,-29],['goat',-47.5,-33]]
  },{
    ...regions[1],region:1,id:'empreintes',title:'Des traces dans le verger',label:'Suivre les indices',seconds:310,
    description:'Examine trois traces, retrouve les brebis cachées et ramène-les avec les agneaux.',
    note:'Les empreintes ambrées de la carte signalent les départs de piste. Approche et touche Examiner.',
    challenge:'Sans utiliser la boussole d’aide',bonus:'noHelp',victory:'Toutes les pistes mènent maintenant à la bergerie.',
    track:true,start:[-4,20,-2.46],hideouts:[[-40.7,-14.2,'bush'],[-50.1,-40.8,'hay'],[-55.3,28.8,'bush']],
    clues:[[-31.3,-5.0,0],[-46,-29.0,1],[-43.2,24.8,2]],
    animals:[['sheep',-40.5,-12,'bush'],['sheep',-48.4,-39.2,'hay'],['sheep',-54.8,31.5,'bush'],['sheep',-14.1,14.5,null,'lamb'],['sheep',-11.7,12.5,null,'lamb']]
  },{
    ...regions[1],region:1,id:'boue',title:'Les cochons prennent le bain',label:'Contourner la boue',seconds:245,
    description:'Éloigne quatre cochons des flaques et guide-les vers la porcherie.',
    note:'Nuage ralentit dans la boue et les cochons aiment y rester. Pousse-les par la rive la plus courte.',
    challenge:'Moins de 12 secondes dans la boue',bonus:'dry',victory:'Les cochons sont au sec pour le reste de la journée.',
    pens:{pig:orchardPig},start:[-17,42,3.1],
    mud:[[-13,18,6.3,4.5],[3,10,5.6,4.3],[21,24.5,5.2,3.0]],
    animals:[['pig',-13.2,18.7],['pig',-10.7,16.7],['pig',3.9,9.1],['pig',1.6,12.5]]
  },{
    ...regions[2],region:2,id:'rafale',title:'Une rafale au mauvais moment',label:'Réagir à un imprévu',seconds:330,
    description:'Rentre quatre moutons et trois canards. Garde un œil sur la bergerie quand le vent se lève.',
    note:'Rentre un groupe à la fois. Si un mouton ressort, laisse-le quitter l’entrée avant de le rabattre.',
    challenge:'Aucune erreur d’enclos',bonus:'correct',victory:'Le troupeau est rentré, même le champion de l’évasion.',
    gust:true,start:[-5,34,-2.85],hideouts:[],
    animals:[['sheep',-9.8,7.5],['sheep',-6.5,9],['sheep',-4,14],['sheep',-7.0,10.6],['duck',-21.6,36],['duck',-18.8,38.4],['duck',-17.2,32.0]]
  },{
    ...regions[2],region:2,id:'derniertour',title:'Le grand tour des landes',label:'Trier trois troupeaux',seconds:405,
    description:'Trois espèces, trois enclos. Sépare les groupes et ouvre la chèvrerie avant le dernier retour.',
    note:'Le pré est vaste. Choisis un enclos, termine un groupe et reviens chercher le suivant.',
    challenge:'Aucune erreur d’enclos',bonus:'correct',victory:'Les trois troupeaux sont rentrés. C’est la fin de la tournée de Nuage.',
    locks:['goat'],pens:{...regions[2].pens,goat:moorGoat},start:[-4,43,-2.96],
    animals:[['sheep',-12.1,10.7],['sheep',-9.0,11.9],['sheep',-13.9,14.2],['duck',-17.4,30.6],['duck',-13.9,33.1],['duck',-16.2,34.7],
    ['goat',-45.1,24.7],['goat',-46.6,22.4],['goat',-27.2,-24.5]]
  }
];
const regionNames=['Les prés', 'Le verger', 'Les landes'];

const keyVectors = {
  ArrowUp:[0,-1],KeyW:[0,-1],KeyZ:[0,-1],ArrowDown:[0,1],KeyS:[0,1],
  ArrowLeft:[-1,0],KeyA:[-1,0],KeyQ:[-1,0],ArrowRight:[1,0],KeyD:[1,0]
};
const keys = new Set();
const stick = {x:0,y:0,id:null};
let tap = null;
let renderer,scene,camera,map,decor,props,dog,animals,pens,colliders,grid,random,chapter=0;
let won=false, storm=false, gameTime=0, barkTime=-10, hintUntil=-1, hintObject=null, toastId;
let openDialogTrigger, soundEnabled=false, audio, returnCount=0, lastMapTime=-1;
function choose(list){return list[Math.floor(random()*list.length)];}
function seeded(seed){
  return () => {
    seed = (seed + 0x6D2B79F5)|0;
    let n = Math.imul(seed ^ seed >>> 15, seed | 1);
    n ^= n + Math.imul(n ^ n >>> 7, n | 61);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}
function paintIcon(canvas, name){
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,48,48);ctx.lineCap='round';ctx.lineJoin='round';
  ctx.lineWidth=2.8;ctx.strokeStyle='#385342';ctx.fillStyle='#385342';
  function line(coords){ctx.beginPath();ctx.moveTo(...coords[0]);for(const xy of coords.slice(1))ctx.lineTo(...xy);ctx.stroke();}
  function oval(x,y,w,h,angle=0,color){if(color)ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,w,h,angle,0,TAU);ctx.fill();}
  function arc(x,y,r,a,b){ctx.beginPath();ctx.arc(x,y,r,a,b);ctx.stroke();}
  if(name==='paw'){
    for(const [x,y,angle] of [[10,20,-.55],[19,12,-.2],[29,12,.2],[38,20,.55]])oval(x,y,4.2,6.1,angle);
    ctx.beginPath();ctx.moveTo(12,35);ctx.bezierCurveTo(13,30,17,23,24,23);ctx.bezierCurveTo(31,23,36,31,36,35);ctx.bezierCurveTo(37,43,29,39,24,39);ctx.bezierCurveTo(19,39,11,43,12,35);ctx.fill();
  }else if(name==='book'){
    line([[5,10],[16,10],[24,14],[32,10],[43,10],[43,36],[32,36],[24,40],[16,36],[5,36],[5,10]]);
    line([[24,14],[24,40]]);line([[11,18],[17,18],[20,20]]);line([[30,20],[33,18],[38,18]]);
  }else if(name==='compass'){
    arc(24,24,18,0,TAU);line([[19,19],[34,14],[29,29],[14,34],[19,19]]);line([[19,19],[29,29]]);
  }else if(name==='sound'||name==='mute'){
    line([[5,19],[12,19],[22,11],[22,37],[12,29],[5,29],[5,19]]);
    if(name==='sound'){arc(22,24,11,-.75,.75);arc(22,24,18,-.75,.75);}
    else{line([[30,18],[42,30]]);line([[42,18],[30,30]]);}
  }else if(name==='bark'){
    ctx.strokeStyle='#fff8e6';ctx.fillStyle='#fff8e6';
    line([[6,29],[13,23],[15,16],[20,11],[24,18],[31,22],[33,30],[25,34],[21,40],[12,41]]);
    oval(23,24,1.5,1.5);line([[34,20],[40,14]]);line([[36,25],[44,24]]);line([[36,30],[43,33]]);
  }else if(name==='sheep'){
    oval(17,35,2.1,5,0,'#474638');oval(27,35,2.1,5,0,'#474638');
    for(const [x,y,w,h] of [[20,25,14,10],[10,24,6,6],[16,18,7,6],[24,17,7,6],[28,23,7,7]])oval(x,y,w,h,0,'#fff8e7');
    oval(33,26,7,8,.18,'#574e43');oval(38,20,4.5,2.4,-.25,'#574e43');oval(35,25,1,1,0,'#fff8e7');
  }else if(name==='duck'){
    oval(20,30,14,8,-.1,'#fff5de');oval(29,21,6,10,-.3,'#ffe6a6');
    oval(33,17,7,6,0,'#f8d680');oval(40,19,4,2.4,.2,'#b77840');
    oval(35,16,1.2,1.2,0,'#413b2e');oval(18,31,8,4,-.15,'#f2d497');
  }
  // Extra species use the same layout as the existing portrait icons.
  if(name==='goat'||name==='pig')paintBarnIcon(ctx,name);
}
function icons(){document.querySelectorAll('canvas[data-icon]').forEach(c=>paintIcon(c,c.dataset.icon));}
icons();

const geo = {
  box:new THREE.BoxGeometry(1,1,1),ball:new THREE.SphereGeometry(1,16,12),
  lobe:new THREE.IcosahedronGeometry(1,2),rock:new THREE.IcosahedronGeometry(1,0),
  stone:new THREE.DodecahedronGeometry(1,0),cyl:new THREE.CylinderGeometry(1,1,1,10),
  taper:new THREE.CylinderGeometry(.63,1,1,8),cone:new THREE.ConeGeometry(1,1,12),
  blade:bladeGeometry(),flower:blossomGeometry(),fleece:fleeceGeometry(),horn:hornGeometry(),spray:leafSprayGeometry(),canopy:canopyGeometry(),plane:new THREE.PlaneGeometry(1,1),ring:new THREE.RingGeometry(.82,1,48)
};
let washTexture, shadeTexture;
const paintMaterials = new Map();
function textureFromCanvas(image, srgb = true){
  const tex = new THREE.CanvasTexture(image);
  if(srgb)tex.colorSpace=THREE.SRGBColorSpace;
  tex.anisotropy=4;
  return tex;
}
async function prepareTextures(){
  const c=document.createElement('canvas');c.width=c.height=128;
  const ctx=c.getContext('2d');const g=ctx.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(57,53,38,.66)');g.addColorStop(.38,'rgba(57,53,38,.42)');g.addColorStop(.7,'rgba(57,53,38,.21)');g.addColorStop(1,'rgba(57,53,38,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,128,128);shadeTexture=textureFromCanvas(c);
  if(MEADOW_URL.startsWith('data:')){
    try{
      terrainPaint=await new THREE.TextureLoader().loadAsync(MEADOW_URL);
      terrainPaint.colorSpace=THREE.SRGBColorSpace;
      terrainPaint.wrapS=terrainPaint.wrapT=THREE.MirroredRepeatWrapping;
      terrainPaint.anisotropy=4;
    }catch{}
  }
  if(WASH_URL.startsWith('data:')){
    try{washTexture=await new THREE.TextureLoader().loadAsync(WASH_URL);}
    catch{return;}
    washTexture.wrapS=washTexture.wrapT=THREE.RepeatWrapping;
    washTexture.colorSpace=THREE.SRGBColorSpace;
    washTexture.anisotropy=4;
    $('paper').style.backgroundImage='url("'+WASH_URL+'")';
  }
}
function paint(color){
  if(!paintMaterials.has(color))paintMaterials.set(color,new THREE.MeshLambertMaterial({color,map:washTexture||null}));
  return paintMaterials.get(color);
}
function mesh(parent,shape,color,x,y,z,sx,sy,sz){
  const object=new THREE.Mesh(geo[shape],typeof color==='string'?paint(color):color);
  object.position.set(x,y,z);object.scale.set(sx,sy,sz);parent.add(object);return object;
}
function group(parent,x=0,y=0,z=0){
  const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;
}
function rod(parent,shape,color,a,b,r){
  const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b);
  const direction=to.clone().sub(from);
  const middle=from.add(to).multiplyScalar(.5);
  const object=mesh(parent,shape,color,middle.x,middle.y,middle.z,r,direction.length(),r);
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
  return object;
}
let flattening = [], waterDetails = [], landmarks3D = [], windmillRotor = null;
let grassBatches = [], shadeDecor = null, shadowPaint;
const smooth = (a,b,n) => {
  const t=clamp((n-a)/(b-a),0,1);
  return t*t*(3-2*t);
};
function buildLandData(config){
  flattening=[];
  for(const [x,z,rx,rz,y] of config.ponds)flattening.push({x,z,rx:rx*1.06,rz:rz*1.08,y,inner:.98,outer:1.31});
  for(const [l,r,b,f] of Object.values(config.pens))flattening.push({x:(l+r)/2,z:(b+f)/2,rx:(r-l)*.82,rz:(f-b)*.83,y:rawHeight((l+r)/2,(b+f)/2),inner:.92,outer:1.55});
  for(const [x,z] of [config.house,config.mill].filter(Boolean))flattening.push({x,z,rx:6.5,rz:5.6,y:rawHeight(x,z),inner:.83,outer:1.74});
}
function rawHeight(x,z){
  const config=levels[chapter];
  let altitude=.45*Math.sin(x*.052+z*.064)+.72*Math.cos(z*.075-.4)*Math.sin(x*.068-.7)+.24*Math.sin(x*.17+z*.18);
  for(const [hx,hz,h,rx,rz] of config.hills)altitude+=h*Math.exp(-(((x-hx)/rx)**2+((z-hz)/rz)**2));
  const rim=Math.max(Math.abs(x)/config.half[0],Math.abs(z)/config.half[1]);
  altitude+=smooth(.79,1.55,rim)*(3.2+3*Math.sin(x*.029-z*.041)+2.1*Math.cos(z*.058+x*.044));
  return altitude;
}
function groundY(x,z){
  let y=rawHeight(x,z);
  for(const f of flattening){
    if(Math.abs(x-f.x)>f.rx*f.outer||Math.abs(z-f.z)>f.rz*f.outer)continue;
    const blend=1-smooth(f.inner,f.outer,Math.hypot((x-f.x)/f.rx,(z-f.z)/f.rz));
    y=mix(y,f.y,blend);
  }
  return creekHeight(x,z,y);
}
function polyline(ctx,trail,px,pz){
  ctx.beginPath();ctx.moveTo(px(trail[0][0]),pz(trail[0][1]));
  for(let i=1;i<trail.length-1;i++){
    const a=trail[i],b=trail[i+1];
    ctx.quadraticCurveTo(px(a[0]),pz(a[1]),px((a[0]+b[0])/2),pz((a[1]+b[1])/2));
  }
  ctx.lineTo(px(trail.at(-1)[0]),pz(trail.at(-1)[1]));
}
function meadowTexture(config,hx,hz){
  const c=document.createElement('canvas'),res=2048;
  c.width=c.height=res;
  const ctx=c.getContext('2d'),px=x=>(x+hx)*res/(2*hx),pz=z=>(z+hz)*res/(2*hz);
  ctx.fillStyle=config.grass[0];ctx.fillRect(0,0,res,res);
  for(let i=0;i<710;i++){
    const x=random()*res,z=random()*res,rx=24+random()*165,rz=17+random()*112;
    const g=ctx.createRadialGradient(0,0,0,0,0,1);
    const color=choose(config.grass.slice(1));
    g.addColorStop(0,color+'85');g.addColorStop(.65,color+'43');g.addColorStop(.91,color+'20');g.addColorStop(1,color+'00');
    ctx.save();ctx.translate(x,z);ctx.rotate(random()*TAU);ctx.scale(rx,rz);
    ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
  ctx.lineCap='round';ctx.lineJoin='round';
  config.trails.forEach((trail,i)=>{
    const scale=(i===0?1:.74)*res/(hx*2);
    polyline(ctx,trail,px,pz);ctx.strokeStyle=config.dirt+'53';ctx.lineWidth=5.1*scale;ctx.stroke();
    ctx.strokeStyle=config.dirt+'a4';ctx.lineWidth=4.30*scale;ctx.stroke();
    ctx.strokeStyle=config.dirt+'e9';ctx.lineWidth=3.03*scale;ctx.stroke();
  });
  for(const [l,r,b,f] of Object.values(config.pens)){
    ctx.fillStyle='#d8be8bb6';ctx.beginPath();
    ctx.roundRect(px(l+.3),pz(b+.3),px(r-.12)-px(l+.3),pz(f-.12)-pz(b+.3),9);ctx.fill();
  }
  for(const [x,z,rx,rz] of config.ponds){
    ctx.fillStyle='#8b9c7580';ctx.beginPath();
    ctx.ellipse(px(x),pz(z),rx*res/(2*hx)*1.12,rz*res/(2*hz)*1.17,0,0,TAU);ctx.fill();
  }
  for(let i=0;i<67000;i++){
    ctx.fillStyle=random()<.56?'#f5e0a71f':'#37533d13';
    ctx.fillRect(random()*res,random()*res,1+random()*2.9,1+random()*2.5);
  }
  if(washTexture?.image){
    ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.18;
    for(let z=0;z<4;z++)for(let x=0;x<4;x++)ctx.drawImage(washTexture.image,x*512,z*512,512,512);
  }
  return textureFromCanvas(c);
}
let terrainSegments;
function land(config){
  const hx=config.half[0]+75,hz=config.half[1]+75;
  const nx=180,nz=162;
  const terrain=new THREE.PlaneGeometry(hx*2,hz*2,nx,nz);
  terrain.rotateX(-Math.PI/2);
  const vertices=terrain.attributes.position;
  for(let i=0;i<vertices.count;i++)vertices.setY(i,groundY(vertices.getX(i),vertices.getZ(i)));
  terrain.computeVertexNormals();
  const ground=new THREE.Mesh(terrain,meadowMaterial(config,hx,hz));
  ground.receiveShadow=true;map.add(ground);terrainSegments=ground;
  buildSky(config);
  const palette=['#8ca697','#779b96','#a6b4a0','#a7b99b','#939ead'];
  for(let i=0;i<38;i++){
    const a=i*TAU/38+(random()-.5)*.14;
    const d=133+random()*48;
    const hill=mesh(decor,'lobe',choose(palette),Math.cos(a)*d,-5+random()*5,Math.sin(a)*d,19+random()*29,8+random()*16,14+random()*27);
    hill.rotation.y=random()*TAU;
  }
}
function bakeStatic(source,target){
  const batches=new Map();
  source.updateMatrixWorld(true);
  const box=32;
  const position=new THREE.Vector3();
  const paintBatches=[paintBatchMaterial(0),paintBatchMaterial(1),paintBatchMaterial(2)];
  const grassShapes=new Set([geo.blade,geo.flower,geo.spray]);
  for(const sourceGroup of [source,shadeDecor]){
    if(!sourceGroup)continue;
    sourceGroup.updateMatrixWorld(true);
    sourceGroup.traverse(m=>{
      if(!m.isMesh)return;
      position.setFromMatrixPosition(m.matrixWorld);
      const shadows=sourceGroup===shadeDecor;
      const wind=m.userData.wind||(m.geometry===geo.blade||m.geometry===geo.flower?1:0);
      const key=[Math.floor(position.x/box),Math.floor(position.z/box),m.geometry.id,shadows,wind].join(',');
      if(!batches.has(key))batches.set(key,{g:m.geometry,m:shadows?shadowPaint:paintBatches[wind],shadows,matrices:[],colors:[]});
      const batch=batches.get(key);
      batch.matrices.push(m.matrixWorld);
      if(!shadows)batch.colors.push(m.material.color);
    });
  }
  for(const {g,m,shadows,matrices,colors} of batches.values()){
    const batch=new THREE.InstancedMesh(g,m,matrices.length);
    for(let i=0;i<matrices.length;i++){
      batch.setMatrixAt(i,matrices[i]);
      if(colors.length)batch.setColorAt(i,colors[i]);
    }
    batch.computeBoundingSphere();
    if(!shadows){
      batch.receiveShadow=true;
      batch.castShadow=g===geo.canopy||g===geo.box||g===geo.taper||g===geo.stone||g===geo.lobe;
    }
    if(grassShapes.has(g))grassBatches.push(batch);
    target.add(batch);
  }
}
function shade(x,z,w,h,opacity=.8,y=groundY(x,z)+.046){
  const shadow=mesh(shadeDecor,'plane',shadowPaint,x,y,z,w,h,1);
  shadow.rotation.x=-Math.PI/2;
  shadow.renderOrder=1;
  return shadow;
}

function loaf(parent,x,y,z,scale,colors){
  for(let n=0;n<6;n++){
    const a=n*TAU/6;
    mesh(parent,'lobe',choose(colors),x+Math.cos(a)*scale*.59,y+random()*scale*.34,z+Math.sin(a)*scale*.61,scale*.61,scale*.58,scale*.58).rotation.y=random()*TAU;
  }
  mesh(parent,'lobe',colors[0],x,y+scale*.52,z,scale*.80,scale*.61,scale*.76);
}
function bush(x,z,size,block=true,ch=chapter){
  if(block&&aroundEntrance(x,z))return;
  const g=group(decor,x,groundY(x,z),z);
  const colors=ch===1?['#8d9b61','#9dad6d','#aebb79','#77895f']:['#749367','#87a373','#9bb57c','#64865f'];
  loaf(g,0,size*.41,0,size,colors);
  for(let i=0;i<14;i++){
    const a=random()*TAU,r=.5+random()*.44;
    mesh(g,'rock',choose(['#d8b477','#d89784','#acbd83','#e6c991']),Math.cos(a)*r*size,(.60+random()*.35)*size,Math.sin(a)*r*size,.07,.065,.09);
  }
  if(block)obstacle(x,z,size*.72);
  shade(x+.21,z+.12,size*2.7,size*2.22,.6);
}
function hay(x,z,size=1, block=true){
  const g=group(decor,x,groundY(x,z),z);
  const stack=(xx,yy,zz,s)=>{
    const straw=mesh(g,'cyl','#cdab62',xx,yy,zz,s,s*1.5,s);
    straw.rotation.z=Math.PI/2;
    for(const side of [-1,1]){
      const cap=mesh(g,'cyl','#e6c57b',xx+side*s*.76,yy,zz,s*.88,.025,s*.88);cap.rotation.z=Math.PI/2;
      const wrap=mesh(g,'cyl','#a98048',xx+side*s*.47,yy,zz,s*1.014,.045,s*1.014);wrap.rotation.z=Math.PI/2;
    }
    for(let i=0;i<18;i++){
      const a=random()*TAU;
      mesh(g,'box',choose(['#f1cc86','#c39855','#c5a36b']),xx+(random()-.5)*s*1.4,yy+Math.sin(a)*s,zz+Math.cos(a)*s,s*(.15+random()*.55),.027,.029).rotation.x=a;
    }
  };
  stack(0,.54*size,0,.54*size);stack(0,.44*size,.86*size,.44*size);
  if(size>.86)stack(0,1.39*size,.46*size,.44*size);
  if(block)obstacle(x,z+.31*size,.88*size);
  shade(x+.23,z+.31,size*2.5,size*2.2,.64);
}
function rocks(x,z,n=4,size=1,block=false){
  if(block&&aroundEntrance(x,z))return;
  for(let i=0;i<n;i++){
    const rx=x+(random()-.5)*size*2.2,rz=z+(random()-.5)*size*1.65,r=(.16+random()*.39)*size;
    const rock=mesh(decor,'stone',choose(['#989488','#aaa493','#b7b1a0','#8e9687']),rx,groundY(rx,rz)+r*.45,rz,r*1.12,r*.67,r*.81);
    rock.rotation.y=random()*TAU;
    if(block)obstacle(rx,rz,r*.83);
  }
  if(block)shade(x+.17,z+.09,size*3.3,size*2,.47);
}
function farmhouse(x,z){
  const y=groundY(x,z);
  const g=group(decor,x,y,z);
  mesh(g,'box','#a7a18b',0,.21,0,6.44,.49,4.67);
  mesh(g,'box','#f1dbb2',0,1.96,0,6.1,3.16,4.28);
  for(const side of [-1,1]){
    for(let i=0;i<7;i++){
      mesh(g,'box',i%3?'#edcf9f':'#e7c99c',0,.55+i*.43,side*2.147,6.1,.065,.032);
      mesh(g,'box',i%2?'#e8c99d':'#edd2a5',side*3.057,.55+i*.43,0,.026,.07,4.28);
    }
    for(const zz of [-1,1])mesh(g,'box','#b89167',side*2.94,1.93,zz*2.15,.18,3.02,.22);
  }
  const eave=3.62,ridge=5.45,depth=2.61;
  const slope=Math.atan2(ridge-eave,depth);
  for(const side of [-1,1]){
    const roof=mesh(g,'box',side===1?'#be7858':'#ae6e55',0,(eave+ridge)/2,side*depth/2,6.96,.20,Math.hypot(depth,ridge-eave)+.12);
    roof.rotation.x=side*slope;
    for(let row=0;row<8;row++)for(let i=0;i<15;i++){
      const along=(row+.51)/8;
      const xx=(i-7)*.455+(row%2?.053:-.053);
      const tile=mesh(g,'box',choose(['#c87f5e','#c48465','#b87555','#ce8966','#d1906d']),xx,mix(ridge,eave,along)+.133,side*depth*along,.459,.105,.423);
      tile.rotation.x=side*slope;
    }
    rod(g,'box','#987354',[-3.53,eave-.07,side*depth],[3.53,eave-.07,side*depth],.13);
    for(const end of [-1,1])rod(g,'box','#a97f60',[end*3.49,ridge,0],[end*3.49,eave-.1,side*(depth+.04)],.16);
  }
  const gable = new THREE.Shape();
  gable.moveTo(-2.17,3.47);gable.lineTo(2.17,3.47);gable.lineTo(0,5.04);gable.closePath();
  const geometry=new THREE.ShapeGeometry(gable);
  for(const side of [-1,1]){
    const triangle=new THREE.Mesh(geometry,paint('#e6c99f'));
    triangle.material.side=THREE.DoubleSide;
    triangle.rotation.y=Math.PI/2;
    triangle.position.x=side*3.02;g.add(triangle);
  }
  rod(g,'cyl','#b87755',[-3.45,5.55,0],[3.45,5.55,0],.105);
  mesh(g,'box','#9f866f',2.14,4.96,-.78,.67,1.53,.64);
  mesh(g,'box','#b2987c',2.14,5.71,-.78,.78,.15,.76);
  mesh(g,'box','#534b42',2.14,5.80,-.78,.48,.026,.46);
  mesh(g,'box','#86765a',.08,1.27,2.194,1.20,2.24,.12);
  mesh(g,'box','#567b6c',.08,1.29,2.27,1.00,2.04,.085);
  for(let i=0;i<5;i++)mesh(g,'box',i%2?'#648777':'#5d8271',-.31+i*.195,1.28,2.322,.152,2.0,.025);
  mesh(g,'box','#415b54',.08,1.83,2.346,.54,.52,.022);
  mesh(g,'box','#91a59a',.08,1.84,2.358,.40,.38,.02);
  mesh(g,'ball','#dbb776',.42,1.16,2.36,.063,.067,.053);
  mesh(g,'box','#b6ab8b',.08,.16,2.61,1.7,.24,.65);
  mesh(g,'box','#c3ae8d',.08,.055,2.88,1.94,.13,.42);
  function window(xw){
    mesh(g,'box','#a37b58',xw,1.97,2.212,1.27,1.20,.15);
    mesh(g,'box','#78968e',xw,1.97,2.298,.98,.90,.036);
    mesh(g,'box','#f3dcaf',xw,1.97,2.331,.067,.89,.041);
    mesh(g,'box','#f3dcaf',xw,1.97,2.331,.98,.063,.044);
    for(const side of [-1,1]){
      mesh(g,'box','#64806a',xw+side*.76,1.97,2.26,.29,1.12,.074);
      for(let j=0;j<4;j++)mesh(g,'box','#728e74',xw+side*.76,1.61+j*.23,2.306,.26,.08,.026);
    }
    mesh(g,'box','#ad824e',xw,1.36,2.394,1.12,.21,.35);
    for(let j=0;j<8;j++){
      const xx=xw-.44+j*.126;
      mesh(g,'lobe','#829863',xx,1.50,2.41,.115,.13,.085);
      mesh(g,'ball',choose(['#e3ac6c','#e5a490','#f7dbad']),xx,1.61+random()*.075,2.43,.057,.057,.056);
    }
  }
  window(-1.93);window(1.91);
  mesh(g,'box','#ab8966',3.10,1.86,-.47,.10,1.3,1.45);
  mesh(g,'box','#7c9a8e',3.164,1.86,-.47,.035,1.06,1.18);
  mesh(g,'box','#ebd5ad',3.192,1.86,-.47,.035,.075,1.18);
  mesh(g,'box','#ebd5ad',3.192,1.86,-.47,.035,1.06,.07);
  shade(x+.9,z+.65,9,7,.65);
  colliders.push({minX:x-3.15,maxX:x+3.15,minZ:z-2.27,maxZ:z+2.27,height:5.5});
}
function bladeGeometry(){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute([-.11,0,0,.11,0,0,.064,.53,.08,-.064,.53,.08,.014,1,.30],3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,.53,0,.53,.5,1],2));
  g.setIndex([0,1,2,0,2,3,3,2,4]);g.computeVertexNormals();return g;
}
function blossomGeometry(){
  const positions=[],uv=[],index=[];
  for(let i=0;i<8;i++){
    const a=i*TAU/8,cos=Math.cos(a),sin=Math.sin(a),start=positions.length/3;
    for(const [r,t,h] of [[.15,0,0],[.63,-.18,-.04],[1.00,0,.01],[.63,.18,-.02],[.58,0,.055]]){
      positions.push(cos*r-sin*t,h,sin*r+cos*t);uv.push((cos*r-sin*t+1)*.5,(sin*r+cos*t+1)*.5);
    }
    for(let j=0;j<4;j++)index.push(start+j,start+(j+1)%4,start+4);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(index);g.computeVertexNormals();return g;
}
function fence(x1,z1,x2,z2,solid=true){
  const d=Math.hypot(x2-x1,z2-z1),n=Math.ceil(d/2.12);
  const angle=Math.atan2(z1-z2,x2-x1);
  for(let i=0;i<=n;i++){
    const xx=mix(x1,x2,i/n),zz=mix(z1,z2,i/n),y=groundY(xx,zz);
    const post=mesh(decor,'box',i%2?'#aa8259':'#ad8d62',xx,y+.675,zz,.19,1.43,.20);
    post.rotation.y=angle+.055*Math.sin(i*4);
    mesh(decor,'box','#ca9f68',xx,y+1.407,zz,.25,.076,.24).rotation.y=angle;
    if(i===n)break;
    const nx=mix(x1,x2,(i+1)/n),nz=mix(z1,z2,(i+1)/n),ny=groundY(nx,nz);
    for(const height of [.43,.93]){
      const beam=mesh(decor,'box',choose(['#ba925f','#b68a57','#bc9869','#bf9b68']), (xx+nx)/2,(y+ny)/2+height,(zz+nz)/2,Math.hypot(d/n,ny-y)+.09,.16,.104);
      beam.rotation.order='YXZ';beam.rotation.y=angle;beam.rotation.z=Math.atan2(ny-y,d/n);
    }
  }
  if(solid)colliders.push({x1,z1,x2,z2,height:1.43,thickness:.125});
}
function signboard(x,z,text,species,angle=0){
  const y=groundY(x,z),g=group(decor,x,y,z);
  g.rotation.y=angle;
  mesh(g,'box','#987653',0,.97,0,.17,2.02,.16);
  mesh(g,'box','#9b7650',0,1.83,0,2.2,.68,.12);
  mesh(g,'box','#cea36a',0,1.84,.067,2.12,.58,.04);
  for(const x of [-.89,.89])mesh(g,'ball','#8b694e',x,1.84,.107,.039,.04,.029);
  const c=document.createElement('canvas');c.width=256;c.height=80;
  const ctx=c.getContext('2d');
  ctx.font=(species?'600 33px':'600 24px')+' Georgia';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#453e2e';ctx.fillText(text,128,42,207);
  const tex=textureFromCanvas(c);
  const label=mesh(props,'plane',new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide}),x+Math.sin(angle)*.101,y+1.84,z+Math.cos(angle)*.101,2.01,.63,1);
  label.rotation.y=angle;
  obstacle(x,z,.16,2.1);
}
function buildPens(config){
  return Object.fromEntries(Object.entries(config.pens).map(([species,arr])=>{
    const [left,right,back,front,z,opening]=arr;
    const x=(left+right)/2;
    fence(left,back,right,back);fence(right,back,right,front);fence(right,front,left,front);
    fence(left,back,left,z-opening/2);fence(left,z+opening/2,left,front);
    const postZ=z+opening/2;
    const gate=group(props,left,groundY(left,postZ),postZ);
    assembleGate(gate,opening);
    gate.rotation.y=-1.43;
    signboard(left-.46,z-opening/2-.58,penSpecs[species].label,species,-.77);
    const gateGround=groundY(left,z);
    for(const offset of [-1,1]){
      const post=group(decor,left,gateGround,z+offset*opening/2);
      mesh(post,'box','#987959',0,.87,0,.25,1.80,.26);
      const finial=mesh(post,'stone',species==='sheep'?'#e2b96f':'#9ab5a0',0,1.85,0,.22,.18,.22);finial.rotation.y=.41;
    }
    const hayArea=[right-2.04,back+1.88];
    hay(hayArea[0],hayArea[1],1.25,false);
    const trough=group(decor,right-2.3,groundY(right-2.3,front-2.3),front-2.3);
    mesh(trough,'box','#816f52',0,.29,0,3.16,.51,.97);
    mesh(trough,'box',species==='sheep'?'#c8aa67':'#85a8a1',0,.555,0,2.93,.065,.74);
    for(const ox of [-1.11,1.11])mesh(trough,'box','#a78b64',ox,.17,0,.22,.34,1.21);
    flowers(right-.66,front-.40,20,.65);
    const material=new THREE.MeshBasicMaterial({color:species==='sheep'?'#ffe4a5':'#d4f0d0',transparent:true,opacity:.71,side:THREE.DoubleSide,depthWrite:false});
    const marker=mesh(props,'ring',material,left-.22,gateGround+.071,z,.73,.73,1);
    marker.rotation.x=-Math.PI/2;
    const pen={...penSpecs[species],x,z,left,right,back,front,opening,gate,marker,
      inside:p=>p.x>left+.37&&p.x<right-.28&&p.z>back+.29&&p.z<front-.29};
    lockPen(pen,config,species);
    return [species,pen];
  }));
}
function assembleGate(g,length){
  for(const h of [.35,.84,1.26])mesh(g,'box','#aa835b',length*.5,h,0,length,.13,.106);
  for(const x of [.09,length-.09])mesh(g,'box','#8e7051',x,.81,0,.14,1.24,.15);
  const brace=mesh(g,'box','#bb956b',length*.5,.80,.075,Math.hypot(length-.14,.9),.1,.042);
  brace.rotation.z=Math.atan2(.9,length-.14);
}
function stoneWall(points){
  for(let i=0;i<points.length-1;i++){
    const [ax,az]=points[i],[bx,bz]=points[i+1],l=Math.hypot(bx-ax,bz-az),steps=Math.ceil(l/.63);
    const ang=Math.atan2(az-bz,bx-ax);
    for(let j=0;j<steps;j++){
      const x=mix(ax,bx,(j+.5)/steps),z=mix(az,bz,(j+.5)/steps),y=groundY(x,z);
      for(let layer=0;layer<2;layer++){
        const r=mesh(decor,'stone',choose(['#a29c86','#bab3a0','#938f7d','#b9b4a0','#a3a691']),x+(layer?.14:0),y+.18+layer*.24,z,.43,.21+random()*.07,.27+random()*.06);
        r.rotation.y=ang+(random()-.5)*.43;
      }
      if(random()<.4)grass(x+.36,z+.18,.84);
    }
    colliders.push({x1:ax,z1:az,x2:bx,z2:bz,height:.68,thickness:.29});
  }
}
function leafSprayGeometry(){
  const coords=[], uv=[], indices=[];
  const rng=seeded(240114);
  for(let i=0;i<34;i++){
    const az=rng()*TAU, tilt=(rng()-.5)*2.3, branch=.29+Math.sqrt(rng())*.66;
    const x=Math.cos(az)*branch,y=(rng()-.5)*.95,z=Math.sin(az)*branch;
    const heading=az+(rng()-.5)*1.8;
    const dx=Math.cos(heading),dz=Math.sin(heading);
    const length=.23+rng()*.29,w=length*(.29+rng()*.15),nr=coords.length/3;
    for(const [t,u,h] of [[0,0,0],[.41,-1,.09],[.77,-.66,.09],[1,0,.025],[.77,.69,.13],[.37,1,.08],[.51,0,.34]]){
      coords.push(x+dx*t*length-dz*u*w,y+tilt*t*length*.31+h*w,z+dz*t*length+dx*u*w);
      uv.push(.50+u*.39,t);
    }
    for(let j=0;j<6;j++)indices.push(nr+j,nr+(j+1)%6,nr+6);
  }
  const out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));
  out.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  out.setIndex(indices);out.computeVertexNormals();
  return out;
}
function canopyGeometry(){
  const g=new THREE.IcosahedronGeometry(1,3),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const swell=1+.095*Math.sin(x*17.5+y*3.17)*Math.cos(z*11.1-y*6.9)+.105*Math.cos(x*5.1-z*4.3+y*6.1);
    p.setXYZ(i,x*swell,y*swell,z*swell);
  }
  g.computeVertexNormals();
  return g;
}
function meadowMaterial(config,hx,hz){
  const m=new THREE.MeshLambertMaterial({map:meadowTexture(config,hx,hz)});
  if(washTexture&&terrainPaint){
    m.onBeforeCompile=shader=>{
      shader.uniforms.paper={value:washTexture};
      shader.uniforms.meadowPigment={value:terrainPaint};
      shader.uniforms.rainAmount=rainAmount;
      shader.vertexShader='varying vec3 meadowWorld;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nmeadowWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
      shader.fragmentShader='varying vec3 meadowWorld; uniform sampler2D paper; uniform sampler2D meadowPigment; uniform float rainAmount;\n'+shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        vec2 detailUV=meadowWorld.xz;
        vec3 smallPaint=texture2D(meadowPigment,detailUV*.3179).rgb;
        vec3 largePaint=texture2D(meadowPigment,vec2(detailUV.x*.107+detailUV.y*.033,detailUV.y*.107-detailUV.x*.033)).rgb;
        float grain=texture2D(paper,detailUV*.71).r;
        float grass=1.0-smoothstep(.012,.075,diffuseColor.r-diffuseColor.g);
        vec3 earthy=mix(vec3(.84+grain*.19),vec3(.75)+smallPaint*.45+largePaint*.35,grass*.83);
        diffuseColor.rgb*=earthy*(1.0-.22*rainAmount);
        diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.78,1.11,1.06),grass*rainAmount*.33);`);
    };
  }
  return m;
}
function paintBatchMaterial(wind){
  const p=new THREE.MeshLambertMaterial({map:washTexture||null,side:THREE.DoubleSide});
  if(wind===0)return p;
  p.onBeforeCompile=shader=>{
    shader.uniforms.windClock=windClock;
    shader.uniforms.breezeStrength=breezeStrength;
    shader.vertexShader='uniform float windClock,breezeStrength;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vec4 base=instanceMatrix*vec4(0.0,0.0,0.0,1.0);
      float ripple=sin(windClock*1.75+base.x*.30+base.z*.23);
      float gust=sin(windClock*.65+base.x*.17+base.z*.11);
      float amplitude=${wind===1?'max(position.y,0.0)*.42':'(.074+.032*max(position.y,0.0))'};
      transformed.x+=(ripple*.43+gust*.64)*amplitude*breezeStrength;
      transformed.z+=(ripple*.25-gust*.34)*amplitude*breezeStrength;
      ${wind===2?'transformed.y+=sin(windClock*1.5+base.x*.77+position.z*2.8)*amplitude*.34;':''}`);
  };
  p.customProgramCacheKey=()=>wind===1?'petit-berger-herbes':'petit-berger-feuilles';
  return p;
}
function aroundEntrance(x,z){
  return Object.values(pens||{}).some(p=>Math.abs(x-p.left)<5.4&&Math.abs(z-p.z)<p.opening*.5+2.1);
}
function tree(x,z,size,autumn,kind='oak'){
  if(aroundEntrance(x,z))return;
  const g=group(decor,x,groundY(x,z),z), s=size;
  const birch=kind==='birch',apple=kind==='apple';
  const bark=birch?'#b9ae98':'#735c42';
  const tones=autumn?['#98854c','#a98b48','#bc9652','#cd9d58','#d7ac69','#a99e59']:
    ['#426b49','#567e4e','#689357','#81a65b','#9cb475','#537b4d'];
  const height=(apple?2.72:birch?4.05:3.56)*s;
  const core=[[0,-.13,0],[.07*s,height*.25,-.09*s],[.21*s,height*.55,-.17*s],[.13*s,height*.82,-.10*s],[.29*s,height,0]];
  for(let j=1;j<core.length;j++){
    rod(g,'taper',bark,core[j-1],core[j],(.275-j*.035)*s);
  }
  for(let i=0;i<5;i++){
    const a=i*TAU/5+random()*.4,c=Math.cos(a),q=Math.sin(a);
    rod(g,'taper',bark,[.065*s,.28*s,-.04*s],[.52*c*s,-.035,.50*q*s],.102*s);
  }
  for(let i=0;i<13;i++){
    const a=i*2.39,h=(i*.23+.55)*s,r=(.227-.008*i)*s;
    const tint=birch?'#716a5c':i%2?'#9e7a54':'#5a4938';
    const knot=mesh(g,'box',tint,Math.cos(a)*r+.08*s,h,Math.sin(a)*r-.07*s,(.03+random()*.06)*s,(.1+random()*.14)*s,.013*s);
    knot.rotation.y=a+(Math.PI*.5);
    knot.rotation.z=(random()-.5)*1.1;
  }
  for(let j=0;j<6;j++){
    const a=j*TAU/6+(random()-.5)*.49, spread=(.63+random()*.93)*s;
    const bx=Math.cos(a)*spread,bz=Math.sin(a)*spread;
    const hy=height*(.67+random()*.34);
    const mid=[bx*.63,hy*.84,bz*.59];
    rod(g,'taper',bark,[.13*s,height*.45,-.09*s],mid,.103*s);
    rod(g,'taper',bark,mid,[bx,hy,bz],.062*s);
    const canopy=mesh(g,'canopy',tones[j%4],bx,hy+.27*s,bz,(.61+random()*.48)*s,(.47+random()*.76)*s,(.64+random()*.46)*s);
    canopy.rotation.y=a;canopy.userData.wind=2;
    for(let i=0;i<4;i++){
      const leafAngle=a+i*1.71;
      const xx=bx+Math.cos(leafAngle)*s*.49,zz=bz+Math.sin(leafAngle)*s*.43;
      const acc=mesh(g,'spray',choose(tones),xx,hy+(.22+random()*.63)*s,zz,(.57+random()*.40)*s,(.59+random()*.30)*s,(.61+random()*.34)*s);
      acc.rotation.y=random()*TAU;acc.rotation.z=.13*Math.sin(a+i);acc.userData.wind=2;
    }
    if(apple||autumn){
      for(let i=0;i<3;i++){
        const color=choose(['#b3533e','#d18a48','#d19a4b','#aa5942']);
        mesh(g,'ball',color,bx+(random()-.5)*s,hy-.16*s,bz+(random()-.5)*s,.088*s,.093*s,.084*s);
      }
    }
  }
  const topper=mesh(g,'canopy',tones[3],.13*s,height+.55*s,0,.91*s,.84*s,.94*s);topper.userData.wind=2;
  const tips=mesh(g,'spray',tones[4],.15*s,height+.98*s,-.14*s,1.01*s,.95*s,1.05*s);tips.userData.wind=2;
  obstacle(x,z,.49*s,height+1.7*s);
  shade(x+.42*s,z+.30*s,5.8*s,4.4*s,.50);
}
function paintSetDressing(config){
  if(config.region===0&&!config.stream){
    for(const [x,z,scale] of [[8.4,31.6,1.36],[-12.2,26.5,1.14],[12.9,13.9,1.24]]){
      if(!blocked(x,z,1.23))tree(x,z,scale,false,x<0?'birch':'oak');
    }
    for(const [x,z] of [[-8.8,35.7],[2.9,33.7],[5.5,28.6],[9.6,19.1],[-7.1,24.3]]){
      for(let j=0;j<24;j++){
        const xx=x+(random()-.5)*3.7,zz=z+(random()-.5)*2.5;
        if(blocked(xx,zz,.15))continue;
        const y=groundY(xx,zz),h=.28+random()*.48;
        const stem=mesh(decor,'cyl','#6d8650',xx,y+h*.5,zz,.019,h,.019);
        stem.rotation.z=(random()-.5)*.16;
        const petal=mesh(decor,'flower',choose(['#db7854','#e8ac69','#f5e6b6','#b47687']),xx,y+h,zz,.10,.09,.107);
        petal.rotation.y=random()*TAU;
        mesh(decor,'ball','#ad7432',xx,y+h+.019,zz,.028,.016,.027);
      }
    }
  }
  const [x,z]=config.house;
  for(const side of [-1,1]){
    const xx=x+side*1.57,zz=z+2.36,y=groundY(xx,zz);
    const lantern=group(decor,xx,y,zz);
    mesh(lantern,'box','#7d5c3d',0,2.39,.06,.20,.24,.16);
    mesh(lantern,'box','#f0bc66',0,2.39,.153,.15,.17,.040);
    mesh(lantern,'taper','#7c6245',0,2.56,.09,.125,.084,.105);
    for(const j of [-1,1])mesh(lantern,'box','#8c673e',j*.039,2.39,.181,.014,.18,.012);
  }
}

function grass(x,z,size){
  const colors=['#809b66','#8c9f66','#a6af74','#788f64','#aab17b','#839d6c'];
  for(let i=0;i<5;i++){
    const xx=x+(random()-.5)*.65,zz=z+(random()-.5)*.56,h=(.29+random()*.42)*size;
    const blade=mesh(decor,'blade',choose(colors),xx,groundY(xx,zz)+.02,zz,(.23+random()*.09)*size,h,.42*size);
    blade.rotation.y=random()*TAU;blade.rotation.z=(random()-.5)*.56;
  }
}
function flowers(x,z,n,size=1){
  const palette=['#fff3d6','#fff8e6','#e9cc9b','#d9b1a1','#ede3c2'];
  for(let i=0;i<n;i++){
    const xx=x+(random()-.5)*4.2*size,zz=z+(random()-.5)*2.2*size,y=groundY(xx,zz);
    const h=(.27+random()*.43)*size,w=(.10+random()*.06)*size;
    if(blocked(xx,zz,.12))continue;
    const stem=mesh(decor,'cyl','#718b58',xx,y+h/2,zz,.018*size,h,.017*size);
    stem.rotation.z=.10*Math.sin(i*3.41);
    mesh(decor,'lobe','#8b9e62',xx+.058*size,y+h*.40,zz,.099*size,.026*size,.034*size).rotation.z=.54;
    const petals=mesh(decor,'flower',choose(palette),xx,y+h,zz,w,w,w);
    petals.rotation.x=(random()-.5)*.57;petals.rotation.y=random()*TAU;
    mesh(decor,'ball','#d2a255',xx,y+h+.019*size,zz,w*.30,w*.17,w*.30);
  }
}
function pond(x,z,rx,rz,base){
  const shape=new THREE.Shape(), n=88;
  for(let i=0;i<=n;i++){
    const a=i*TAU/n,w=1+.035*Math.cos(a*3)+.028*Math.sin(a*5);
    const xx=Math.cos(a)*rx*w,zz=Math.sin(a)*rz*w;
    if(!i)shape.moveTo(xx,-zz);else shape.lineTo(xx,-zz);
  }
  const geometry=new THREE.ShapeGeometry(shape);
  const uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+rx)/(rx*2),(uv.getY(i)+rz)/(rz*2));
  const water=new THREE.MeshLambertMaterial({color:levels[chapter].region===2?'#75a7aa':'#86b0ae',map:washTexture||null});
  const clock={value:0};
  water.onBeforeCompile=s=>{
    s.uniforms.waterTime=clock;
    s.vertexShader='varying vec2 pondWorld;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npondWorld=position.xy;');
    s.fragmentShader='varying vec2 pondWorld; uniform float waterTime;\n'+s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float ripple=sin(pondWorld.y*5.8+sin(pondWorld.x*.46)*2.4-waterTime*1.5);
      float broken=.55+.45*sin(pondWorld.x*1.6+pondWorld.y*.32);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.66,.79,.72),smoothstep(.82,.998,ripple)*broken*.34);`);
  };
  const surface=new THREE.Mesh(geometry,water);
  surface.rotation.x=-Math.PI/2;surface.position.set(x,base+.14,z);map.add(surface);
  waterDetails.push(clock);
  colliders.push({x,z,rx:rx*.97,rz:rz*.97,height:0});
  for(let i=0;i<75;i++){
    const a=random()*TAU,r=.98+random()*.16;
    const xx=x+Math.cos(a)*rx*r,zz=z+Math.sin(a)*rz*r;
    if(i%8===0)rocks(xx,zz,4,1.1);
    if(i%3===0)grass(xx,zz,1.3);
    if(i%5===0){
      const y=groundY(xx,zz);
      for(let j=0;j<3;j++){
        const off=(random()-.5)*.45,h=.58+random()*.64;
        mesh(decor,'cyl','#77895d',xx+off,y+h*.5,zz+off,.021,h,.018).rotation.z=(random()-.5)*.16;
        mesh(decor,'ball','#9b7656',xx+off,y+h*.86,zz+off,.049,.153,.05);
      }
    }
  }
  for(let i=0;i<8;i++){
    const a=random()*TAU,r=.60+random()*.33;
    const xx=x+Math.cos(a)*rx*r,zz=z+Math.sin(a)*rz*r;
    mesh(decor,'cyl','#739469',xx,base+.169,zz,.29+random()*.16,.036,.28);
    if(i%3===0)mesh(decor,'flower','#f1c3bc',xx,base+.23,zz,.18,.18,.18);
  }
}
function mill(x,z){
  const y=groundY(x,z),g=group(decor,x,y,z);
  const body=mesh(g,'taper','#e3ccac',0,2.15,0,2.24,4.65,2.12);
  body.rotation.y=.24;
  mesh(g,'cyl','#ae9678',0,.29,0,2.33,.54,2.23);
  mesh(g,'cone','#8c7770',0,5.22,0,2.19,2.51,2.17);
  mesh(g,'cyl','#af8b73',0,3.81,0,1.74,.18,1.76);
  mesh(g,'box','#7c735b',-.36,.92,1.86,.72,1.63,.14);
  mesh(g,'box','#8da399',.58,2.79,1.64,.56,.57,.20);
  windmillRotor=group(map,x,y+4.10,z+1.82);
  const rotor=windmillRotor;
  for(let i=0;i<4;i++){
    const arm=group(rotor);arm.rotation.z=i*Math.PI*.5+.22;
    mesh(arm,'box','#9a805e',0,1.46,0,.095,2.95,.10);
    mesh(arm,'box','#eee1be',.236,2.03,0,.42,1.64,.083);
    for(let j=0;j<5;j++)mesh(arm,'box','#bb996f',.237,1.36+.28*j,.061,.46,.038,.058);
  }
  mesh(rotor,'ball','#967454',0,0,.10,.26,.26,.187);
  obstacle(x,z,2.34,6.6);
  shade(x+.7,z+.45,6.6,5.2,.62);
}
function strawShelter(x,z){
  const y=groundY(x,z),g=group(decor,x,y,z);
  for(const xx of [-2.24,2.24])for(const zz of [-1.82,1.82])mesh(g,'box','#86684d',xx,1.22,zz,.22,2.55,.22);
  for(let i=0;i<11;i++){
    const r=mesh(g,'box',choose(['#ae9062','#a08258','#b49a6e']),-2.39+i*.478,2.60,0,.55,.14,4.24);
    r.rotation.x=.13;
  }
  for(let i=0;i<3;i++)mesh(g,'box','#aa8b61',0,.43+i*.42,-1.83,4.48,.29,.13);
  hay(x-1.06,z,.98);hay(x+.72,z+.62,.93);
  shade(x,z,6.5,5.2,.6);
}
function decorate(config){
  farmhouse(...config.house);
  if(config.mill)mill(...config.mill);
  for(const p of config.ponds)pond(...p);
  for(const wall of config.walls)stoneWall(wall);
  for(const [x,z,kind] of config.hideouts||[]){
    if(kind==='bush'){bush(x,z,1.73);bush(x-1.82,z+.52,1.02);bush(x+.91,z-.3,.81);}
    else {hay(x,z,1.54);hay(x-.63,z-1.08,.89);}
  }
  for(const [x,z,rx,rz,n] of config.groves){
    for(let i=0;i<n;i++){
      const angle=random()*TAU,r=Math.sqrt(random()),xx=x+Math.cos(angle)*rx*r,zz=z+Math.sin(angle)*rz*r;
      if(!nearTrail(xx,zz,1.82)&&!blocked(xx,zz,1.50)&&!Object.values(pens).some(p=>p.inside({x:xx,z:zz}))&&!config.animals.some(([,ax,az])=>Math.hypot(xx-ax,zz-az)<2.3))
        tree(xx,zz,1.02+random()*.92,levels[chapter].region===1,i%6===0?'birch':i%3===0?'apple':'oak');
    }
  }
  const [hx,hz]=config.half;
  for(let i=0;i<63;i++){
    const a=random()*TAU, r=.84+random()*.15;
    const xx=Math.cos(a)*hx*r,zz=Math.sin(a)*hz*r;
    if(!blocked(xx,zz,1.6)&&!nearTrail(xx,zz,4))tree(xx,zz,1.1+random()*.89,levels[chapter].region===1,i%5===0?'birch':'oak');
  }
  for(let i=0;i<240;i++){
    const x=(random()*2-1)*hx*.96,z=(random()*2-1)*hz*.96;
    if(blocked(x,z,1.15)||nearTrail(x,z,1.67)||Object.values(pens).some(p=>p.inside({x,z}))||config.animals.some(([,xx,zz])=>Math.hypot(x-xx,z-zz)<2.4))continue;
    if(i%7===0)bush(x,z,.58+random()*.60);
    else if(i%13===0)rocks(x,z,4,.85+random()*.55,true);
    else flowers(x,z,3+Math.floor(random()*9),.67+random()*.38);
  }
  for(let i=0;i<2320;i++){
    const x=(random()*2-1)*hx*.99,z=(random()*2-1)*hz*.99;
    if(!blocked(x,z,.18)&&!nearTrail(x,z,1.29)&&!Object.values(pens).some(p=>p.inside({x,z})))grass(x,z,.45+random()*.64);
  }
  const [sx,sz]=config.start;
  for(const [dx,dz] of [[-4,-5],[3,-8],[-5,-9],[5,-2],[-5,-1],[2,-14],[-3,-18]])flowers(sx+dx,sz+dz,15,.72);
  for(let i=0;i<98;i++){
    const a=random()*TAU,r=Math.sqrt(random())*23;
    const x=sx+Math.cos(a)*r,z=sz+Math.sin(a)*r;
    if(!blocked(x,z,.22)&&!nearTrail(x,z,1.4))grass(x,z,.83);
  }
  if(levels[chapter].region===0&&!levels[chapter].stream)signboard(6.8,7.9,'Bergerie ↗',null,.11);
  const house=config.house;
  strawShelter(house[0]+7.7,house[1]+1.95);
  for(let i=0;i<8;i++){
    const x=house[0]-2.6+i*.61,z=house[1]+4.2;
    flowers(x,z,5,.37);
  }
  for(const [x,z,label] of config.landmarks)if(!blocked(x+1.5,z+2.9,.55)){
    signboard(x+1.5,z+2.9,label,null,-.22);
  }
  paintSetDressing(config);
}
function nearTrail(x,z,threshold){
  for(const trail of levels[chapter].trails){
    for(let i=1;i<trail.length;i++){
      if(segmentDistance(x,z,{x1:trail[i-1][0],z1:trail[i-1][1],x2:trail[i][0],z2:trail[i][1]})<threshold)return true;
    }
  }
  return false;
}

const eyeMaterial=new THREE.MeshBasicMaterial({color:'#2b342d'});
const eyeLight=new THREE.MeshBasicMaterial({color:'#fff2db'});
const coatColors={
  duck:{body:'#f6e6b6',neck:'#f5dfa2',light:'#fff0c9',shade:'#dac58d',beak:'#c8894c',toe:'#af794c'}
};
function fleeceGeometry(){
  const geo=new THREE.SphereGeometry(1,36,22);
  const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const curl=Math.sin(x*25.8+y*7.4)*Math.cos(z*22-y*11.2)+Math.sin(y*29.8+z*13.6)*Math.cos(x*26.1-z*8);
    const waves=Math.sin(z*8.1+x*5.1+y*6.4)*Math.sin(y*9.6-x*4.3);
    const radius=1+.021*curl+.039*waves;
    p.setXYZ(i,x*radius,y*radius,z*radius);

  }
  geo.computeVertexNormals();return geo;
}
function hornGeometry(){
  const v=[],uv=[],tri=[];
  const sides=9,length=12;
  for(let i=0;i<=length;i++){
    const u=i/length,rx=(1-u*.94)*.078;
    const baseX=u*.095,baseY=.253*Math.sin(u*1.46),baseZ=-.17*u*u+.023*Math.sin(u*Math.PI);
    for(let k=0;k<=sides;k++){
      const a=k*TAU/sides,r=rx*(1+.085*Math.sin(13*u*TAU));
      v.push(baseX+Math.cos(a)*r,baseY+Math.sin(a)*r*u*.47,baseZ+Math.sin(a)*r*(1-.48*u));
      uv.push(k/sides,u);
      if(i&&k){const j=i*(sides+1)+k;tri.push(j-sides-2,j-sides-1,j,j-sides-2,j,j-1);}
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(tri);g.computeVertexNormals();return g;
}
function wool(actor,variant){
  const palettes=[
    ['#f2e4c6','#ddcbac','#f7edcf'],
    ['#eee5d2','#d9ccb5','#f7edd8'],
    ['#bbaea0','#a99b8b','#d4c9b4'],
    ['#f7e9cd','#e8d7b8','#fbf0d7']
  ];
  const colors=palettes[variant%palettes.length],cream=colors[0];
  const flank=mesh(actor,'fleece',cream,0,.827,-.066,.494,.488,.720);flank.rotation.x=.075;
  const throat=mesh(actor,'fleece',colors[1],0,.849,.379,.342,.465,.352);throat.rotation.x=-.24;
  // A handful of irregular tufts interrupts the outline at the poll and shoulders.
  for(const [side,y,z,wide] of [[-1,.982,.351,.22],[1,.991,.30,.21],[-1,.871,-.50,.173],[1,1.166,-.26,.143]]){
    mesh(actor,'fleece',colors[2],side*.30,y,z,wide,wide*.83,wide*1.21).rotation.y=side*.18;
  }
  return [cream,colors[1],colors[2],cream];
}

function sheepModel(actor,variant){
  const coat=wool(actor,variant);
  const face=variant===2?'#706252':variant===3?'#8a7660':'#554c42';
  const inner=variant===2?'#997d70':'#8e7064';
  const hoof='#49443b';
  const legs=[];
  for(const side of [-1,1])for(const fore of [true,false]){
    const pivot=group(actor,side*.276,.665,fore?.392:-.421);
    const knee=group(pivot,0,-.272,fore?.016:.09);
    mesh(pivot,'ball',coat[2],0,-.085,0,.129,.191,.154);
    rod(pivot,'taper',face,[0,-.12,0],[0,-.302,fore?.016:.09],.067);
    rod(knee,'taper',face,[0,0,0],[0,-.27,fore?.015:-.070],.061);
    mesh(knee,'ball',hoof,0,-.297,fore?.045:-.037,.081,.065,.099);
    mesh(knee,'box','#736759',0,-.296,fore?.121:.036,.012,.042,.013);
    legs.push({pivot,knee,fore,side});
  }
  const tail=group(actor,0,.86,-.713);
  mesh(tail,'ball',coat[0],0,-.065,-.132,.119,.174,.207).rotation.x=.39;
  const head=group(actor,0,1.04,.515);
  mesh(head,'ball',coat[1],0,.035,-.156,.308,.311,.306);
  mesh(head,'ball',face,0,.034,.055,.256,.316,.309);
  mesh(head,'ball',face,0,-.094,.269,.204,.165,.259);
  mesh(head,'ball','#9c8170',0,-.103,.455,.103,.058,.044);
  mesh(head,'ball',face,0,-.168,.368,.146,.075,.108);
  const ears=[],eyes=[];
  for(const side of [-1,1]){
    const ear=group(head,side*.235,.137,.048);
    mesh(ear,'ball',face,side*.117,-.032,-.016,.187,.071,.112);
    mesh(ear,'ball',inner,side*.133,-.025,.059,.175,.050,.046);
    ear.rotation.z=side*.28;ears.push(ear);
    const lid=group(head,side*.207,.047,.245);
    mesh(lid,'ball','#a08766',0,0,0,.062,.055,.046);
    mesh(lid,'ball',eyeMaterial,side*.008,.001,.033,.047,.026,.022);
    mesh(lid,'ball',eyeLight,side*.021,.020,.043,.014,.015,.013);
    eyes.push(lid);
    mesh(head,'ball',hoof,side*.041,-.096,.490,.024,.013,.013);
  }
  mesh(head,'fleece',coat[2],0,.255,.103,.272,.143,.171);
  return {tail,head,legs,ears,eyes};
}
function duckModel(actor,variant){
  const k=variant===1?{body:'#b1aa91',neck:'#6f9190',light:'#dfcdb2',shade:'#8c8675',beak:'#cda354',toe:'#ab7850'}
    :{body:'#eee1c9',neck:'#f4ebd7',light:'#f7edd7',shade:'#cfbea4',beak:'#c38e50',toe:'#b28253'};
  mesh(actor,'ball',k.body,0,.51,-.123,.355,.268,.529);
  mesh(actor,'ball',k.light,0,.52,.183,.31,.245,.329);
  const tail=group(actor,0,.57,-.52);
  mesh(tail,'lobe',k.light,0,.031,-.104,.204,.123,.277).rotation.x=.38;
  const wings=[];
  for(const side of [-1,1]){
    const wing=group(actor,side*.282,.550,-.074);
    mesh(wing,'ball',k.shade,side*.006,0,-.085,.095,.176,.325).rotation.x=-.26;
    for(let j=0;j<4;j++){
      const feather=mesh(wing,'ball',j%2?k.light:k.body,side*(.038+.008*j),.062-j*.043,-.11-j*.026,.041,.048,.247-j*.012);
      feather.rotation.x=-.12+j*.057;
    }
    wings.push(wing);
  }
  mesh(actor,'ball',k.neck,0,.744,.206,.214,.305,.224).rotation.x=-.36;
  const head=group(actor,0,.997,.273);
  mesh(head,'ball',k.neck,0,0,.005,.237,.216,.241);
  mesh(head,'ball','#df9e5b',0,-.064,.219,.169,.059,.210);
  mesh(head,'ball',k.beak,0,-.102,.226,.143,.032,.184);
  const eyes=[],legs=[];
  for(const side of [-1,1]){
    mesh(head,'ball','#9a6745',side*.063,-.016,.305,.021,.013,.020);
    const eye=group(head,side*.174,.060,.144);
    mesh(eye,'ball',eyeMaterial,0,0,0,.043,.043,.035);
    mesh(eye,'ball',eyeLight,0,.018,.023,.013,.014,.013);
    eyes.push(eye);
    const pivot=group(actor,side*.145,.27,-.020);
    const knee=group(pivot,0,-.134,.02);
    mesh(pivot,'cyl',k.toe,0,-.073,0,.038,.169,.043);
    mesh(knee,'ball',k.beak,0,-.092,.055,.114,.038,.153);
    for(let i=-1;i<=1;i++)mesh(knee,'ball',k.beak,i*.061,-.089,.144-Math.abs(i)*.017,.048,.026,.074);
    legs.push({pivot,knee,fore:true,side});
  }
  return {tail,head,legs,ears:[],eyes,wings};
}
function barnLegs(actor,goat,coat,hooves){
  const legs=[];
  for(const side of [-1,1])for(const fore of [true,false]){
    const pivot=group(actor,side*(goat?.196:.253),goat?.642:.395,fore?(goat?.391:.425):(goat?-.409:-.416));
    const knee=group(pivot,0,goat?-.259:-.165,fore?-.012:.053);
    mesh(pivot,'ball',coat,0,goat?-.105:-.066,0,goat?.092:.131,goat?.175:.147,goat?.100:.137);
    const length=goat?.277:.149;
    rod(knee,'taper',coat,[0,0,0],[0,-length,.018],goat?.065:.083);
    mesh(knee,'ball',hooves,0,-length,.041,goat?.073:.099,.067,.103);
    legs.push({pivot,knee,fore,side});
  }
  return legs;
}
function goatModel(actor,variant){
  const tones=['#cfb392','#d4c4a4','#b8a387','#ede0c0'];
  const coat=tones[variant%4],neck='#e1d0ae',hoof='#5a5346';
  mesh(actor,'ball',coat,0,.783,-.054,.329,.336,.617);
  mesh(actor,'ball',neck,0,.822,.363,.238,.330,.299).rotation.x=-.31;
  const tail=group(actor,0,.882,-.588);
  mesh(tail,'ball',coat,0,.062,-.066,.068,.151,.071).rotation.x=.58;
  const head=group(actor,0,1.022,.413);
  mesh(head,'ball',coat,0,.019,.089,.231,.269,.263).rotation.x=-.29;
  mesh(head,'ball','#f0dfbc',0,-.055,.302,.161,.147,.165);
  mesh(head,'ball','#776453',0,-.025,.428,.077,.037,.036);
  mesh(head,'lobe',neck,0,-.248,.248,.076,.167,.066).rotation.x=-.29;
  const eyes=[],ears=[];
  for(const side of [-1,1]){
    const eye=group(head,side*.167,.079,.246);
    eye.rotation.y=side*.56;
    mesh(eye,'ball','#f3cf98',0,0,0,.066,.058,.032);
    mesh(eye,'ball',eyeMaterial,0,.003,.034,.045,.024,.014);
    mesh(eye,'ball',eyeLight,.015,.017,.047,.013,.013,.009);
    eyes.push(eye);
    const ear=group(head,side*.157,.110,-.012);
    mesh(ear,'ball',coat,side*.095,-.006,.033,.141,.065,.084).rotation.z=-side*.27;
    mesh(ear,'ball','#b78879',side*.101,-.016,.082,.106,.037,.038).rotation.z=-side*.27;
    ears.push(ear);
    const horn=mesh(head,'horn','#baa381',side*.098,.200,.014,side,1,1);
    horn.rotation.y=side*.25;
  }
  return {head,tail,eyes,ears,legs:barnLegs(actor,true,coat,hoof)};
}
function pigModel(actor,variant){
  const tones=['#d9a698','#e5b4a0','#d3a18e','#e8c0a8'];
  const coat=tones[variant%4],light='#eac2ad',hoof='#9b7367';
  mesh(actor,'ball',coat,0,.522,-.076,.414,.390,.688);
  mesh(actor,'ball',light,0,.458,.368,.329,.277,.377);
  const head=group(actor,0,.599,.356);
  mesh(head,'ball',coat,0,0,.111,.298,.262,.305);
  mesh(head,'ball',light,0,-.080,.323,.207,.159,.188);
  mesh(head,'ball','#d38e83',0,-.068,.464,.174,.104,.056);
  const tail=group(actor,0,.651,-.718);
  for(let i=0;i<9;i++){
    const a=i*.61;
    mesh(tail,'ball',coat,.064*Math.sin(a),.057+.057*Math.cos(a),-.022-i*.016,.034,.035,.044);
  }
  const eyes=[],ears=[];
  for(const side of [-1,1]){
    mesh(head,'ball','#926660',side*.057,-.060,.503,.025,.030,.017);
    const eye=group(head,side*.192,.068,.323);
    eye.rotation.y=side*.52;
    mesh(eye,'ball',eyeMaterial,0,0,0,.049,.049,.034);
    mesh(eye,'ball',eyeLight,side*.01,.017,.025,.013,.014,.011);
    eyes.push(eye);
    const ear=group(head,side*.183,.191,.040);
    mesh(ear,'lobe',coat,side*.038,.098,0,.114,.163,.071).rotation.z=-side*.28;
    mesh(ear,'ball','#c48a82',side*.043,.097,.035,.073,.101,.037).rotation.z=-side*.29;
    ears.push(ear);
  }
  return {head,tail,eyes,ears,legs:barnLegs(actor,false,coat,hoof)};
}
function paintBarnIcon(ctx,name){
  const oval=(x,y,rx,ry,color)=>{
    ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();
  };
  if(name==='goat'){
    ctx.strokeStyle='#a28a6d';ctx.lineWidth=3;
    for(const x of [18,30]){
      ctx.beginPath();ctx.moveTo(x,17);ctx.quadraticCurveTo(x+(x<24?-4:4),10,x+(x<24?-2:2),6);ctx.stroke();
    }
    oval(13,18,6,3,'#a98969');oval(35,18,6,3,'#a98969');
    oval(24,23,13,11,'#d6b38b');oval(24,31,8,7,'#ede1c5');oval(24,37,4,5,'#a2866c');
    for(const x of [18,30])oval(x,22,1.8,2.1,'#3c3a2f');
  }else{
    oval(14,14,7,6,'#c38e82');oval(34,14,7,6,'#c38e82');oval(24,26,15,14,'#edbeac');
    oval(24,29,9,6,'#ce8c84');
    for(const x of [20,28])oval(x,29,1.7,2.1,'#8a5c58');
    for(const x of [16,32])oval(x,21,1.8,2.3,'#40382f');
  }
}

let wovenGeometry,wovenMaterial;
function bandanaForNeck(neck){
  if(!wovenGeometry){
    const data=[],pigment=[],uv=[],triangles=[],size=42;
    const alpha=new THREE.Color('#9c452f'),edge=new THREE.Color('#d8a17a'),scarlet=new THREE.Color('#b75437');
    function put(x,y,z,u,v,color){
      const n=data.length/3;data.push(x,y,z);uv.push(u,v);pigment.push(color.r,color.g,color.b);return n;
    }
    for(let row=0;row<3;row++)for(let i=0;i<=size;i++){
      const a=i*TAU/size,s=Math.sin(a),c=Math.cos(a);
      const u=i/size,t=row*.5;
      const x=.278*s*(1-.04*t),y=-.035+c*(c>0?.362:.342);
      const z=.019+c*.071+(t-.5)*.109+.018*Math.sin(a*4);
      const color=row===0||row===2?edge:scarlet;
      put(x,y,z,u,t,color);
      if(i&&row){
        const id=row*(size+1)+i;triangles.push(id-size-2,id-size-1,id,id-size-2,id,id-1);
      }
    }
    // The tied triangle follows the slope of the ruff across the back.
    const f=8;
    const dirs=new THREE.Color();
    for(let j=0;j<=f;j++){
      const t=j/f,width=.199*(1-t)+.012;
      for(let i=0;i<=f;i++){
        const u=i/f,x=(u*2-1)*width;
        const y=.318-.166*t-.84*x*x+.017*Math.cos(u*TAU*2+t*3)*Math.sin(t*Math.PI);
        const z=.041-.365*t+.056*x*x;
        const rim=i===0||i===f||j===f;
        dirs.copy(rim?edge:scarlet).lerp(alpha,.12+.27*Math.sin(u*6+t*.5)**2);
        const id=put(x,y,z,u,t,dirs);
        if(i&&j)triangles.push(id-f-2,id-f-1,id,id-f-2,id,id-1);
      }
    }
    wovenGeometry=new THREE.BufferGeometry();
    wovenGeometry.setAttribute('position',new THREE.Float32BufferAttribute(data,3));
    wovenGeometry.setAttribute('color',new THREE.Float32BufferAttribute(pigment,3));
    wovenGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    wovenGeometry.setIndex(triangles);
    wovenGeometry.computeVertexNormals();
    wovenMaterial=new THREE.MeshLambertMaterial({vertexColors:true,map:washTexture||null,side:THREE.DoubleSide});
  }
  const scarf=new THREE.Mesh(wovenGeometry,wovenMaterial);
  scarf.name='Foulard de berger';scarf.castShadow=true;scarf.receiveShadow=true;
  neck.add(scarf);
  return scarf;
}


let dogSkinGeometry,dogSkinMaterial;
const dogEyeOpening={value:1};
function dogBytes(encoded){
  const decoded=atob(encoded),bytes=new Uint8Array(decoded.length);
  for(let i=0;i<decoded.length;i++)bytes[i]=decoded.charCodeAt(i);
  return bytes.buffer;
}
function buildDogSkin(){
  if(dogSkinGeometry)return;
  const data=sculptedDog;
  const pos=new Int16Array(dogBytes(data.p));
  const normals=new Int8Array(dogBytes(data.n));
  const color=new Uint8Array(dogBytes(data.c));
  const linear=new Float32Array(256);
  for(let i=0;i<256;i++){
    const value=i/255;
    linear[i]=value<=.04045?value/12.92:((value+.055)/1.055)**2.4;
  }
  dogSkinGeometry=new THREE.BufferGeometry();
  dogSkinGeometry.setAttribute('position',new THREE.BufferAttribute(Float32Array.from(pos,n=>n/8192),3));
  dogSkinGeometry.setAttribute('normal',new THREE.BufferAttribute(Float32Array.from(normals,n=>n/127),3));
  dogSkinGeometry.setAttribute('color',new THREE.BufferAttribute(Float32Array.from(color,n=>linear[n]),3));
  dogSkinGeometry.setAttribute('skinIndex',new THREE.BufferAttribute(new Uint8Array(dogBytes(data.b)),4));
  dogSkinGeometry.setAttribute('skinWeight',new THREE.BufferAttribute(Float32Array.from(new Uint8Array(dogBytes(data.w)),n=>n/255),4));
  dogSkinGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(dogBytes(data.i)),1));
  dogSkinGeometry.computeBoundingSphere();
  dogSkinMaterial=new THREE.MeshLambertMaterial({vertexColors:true,color:0xffffff});
  const eyePaint=new THREE.DataTexture(new Uint8Array(dogBytes(data.eyes)),data.eyeSize,data.eyeSize,THREE.RGBAFormat);
  eyePaint.colorSpace=THREE.SRGBColorSpace;
  eyePaint.magFilter=THREE.LinearFilter;eyePaint.minFilter=THREE.LinearFilter;
  eyePaint.needsUpdate=true;
  dogSkinMaterial.onBeforeCompile=shader=>{
    shader.uniforms.coatPaper={value:washTexture};
    shader.uniforms.irisPaint={value:eyePaint};
    shader.uniforms.lidOpening=dogEyeOpening;
    shader.vertexShader='varying vec3 paintedRest;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npaintedRest=position;');
    shader.fragmentShader='varying vec3 paintedRest; uniform sampler2D coatPaper; uniform sampler2D irisPaint; uniform float lidOpening;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      ${washTexture?`vec2 washUV=vec2(paintedRest.z+paintedRest.x*.35,paintedRest.y+paintedRest.x*.76);
      float granulation=texture2D(coatPaper,washUV*2.5).r;
      diffuseColor.rgb*=.954+granulation*.074;`:''}
      float front=(paintedRest.z-.878+(paintedRest.y-1.318)*.11)/.085;
      float height=(paintedRest.y-1.317-(paintedRest.z-.878)*.12)/(.068*lidOpening);
      vec4 pigment=texture2D(irisPaint,vec2(front,height)*.5+.5);
      float eyeSide=smoothstep(.135,.181,abs(paintedRest.x));
      diffuseColor.rgb=mix(diffuseColor.rgb,pigment.rgb,pigment.a*eyeSide);`);
  };
}
function makeDogModel(actor){
  buildDogSkin();
  const rig=sculptedDog.rig;
  const bones=rig.map(([name])=>{
    const b=new THREE.Bone();b.name=name;return b;
  });
  const skin=new THREE.SkinnedMesh(dogSkinGeometry,dogSkinMaterial);
  skin.name='Nuage';
  // The animated silhouette remains inside the model's small region of the view.
  skin.frustumCulled=false;
  rig.forEach(([,parent,x,y,z],i)=>{
    const bone=bones[i];
    if(parent<0){
      bone.position.set(x,y,z);skin.add(bone);
    }else{
      const p=rig[parent];
      bone.position.set(x-p[2],y-p[3],z-p[4]);bones[parent].add(bone);
    }
  });
  actor.add(skin);
  skin.updateWorldMatrix(true,true);
  skin.bind(new THREE.Skeleton(bones),skin.matrixWorld.clone());
  const legs=[];
  for(let i=0;i<4;i++)legs.push(gaitLeg(bones[6+2*i],bones[7+2*i],i%2===0,i<2?-1:1,rig[7+2*i]));
  const sockets={neck:group(bones[1],0,.01,-.026),back:group(bones[0],0,.31,-.23)};
  const scarf=bandanaForNeck(sockets.neck);
  return {skin,bones,legs,sockets,scarf};
}
const inverseHips=new THREE.Matrix4();
const candidateFoot=new THREE.Vector3(), solvedFoot=new THREE.Vector3();
const legDirection=new THREE.Vector3(), kneeDirection=new THREE.Vector3(), lowerDirection=new THREE.Vector3();
const localLowerRotation=new THREE.Quaternion();
const normalizedKnee=new THREE.Vector3();
function gaitLeg(pivot,joint,fore,side,rig){
  const point=fore?[.258,.047,.405]:[.263,.047,-.486];
  const toe=new THREE.Vector3(side*point[0],point[1],point[2]);
  const ankleVector=toe.clone().sub(new THREE.Vector3(rig[2],rig[3],rig[4]));
  return {pivot,joint,fore,side,toe,
    firstLength:joint.position.length(),secondLength:ankleVector.length(),
    restKnee:joint.position.clone().normalize(),restAnkle:ankleVector.normalize(),
    pole:new THREE.Vector3(side*.09,0,fore?-1:1),
    foot:new THREE.Vector3(),anchor:new THREE.Vector3(),departure:new THREE.Vector3(),
    initialized:false,isStance:true};
}
function putPawOnTarget(leg){
  const {pivot,joint,firstLength:a,secondLength:b,restKnee,restAnkle,pole}=leg;
  solvedFoot.copy(leg.foot).applyMatrix4(inverseHips).sub(pivot.position);
  const rawDistance=solvedFoot.length();
  const extension=clamp(rawDistance/(a+b-.013),1,1.085);
  pivot.scale.setScalar(extension);
  const reach=clamp(rawDistance/extension,Math.abs(a-b)+.026,a+b-.0045);
  legDirection.copy(solvedFoot).multiplyScalar(1/Math.max(.0001,rawDistance));
  const kneeAlong=(a*a-b*b+reach*reach)/(2*reach);
  const kneeAway=Math.sqrt(Math.max(.000002,a*a-kneeAlong*kneeAlong));
  kneeDirection.copy(pole).addScaledVector(legDirection,-pole.dot(legDirection)).normalize();
  kneeDirection.multiplyScalar(kneeAway).addScaledVector(legDirection,kneeAlong);
  pivot.quaternion.setFromUnitVectors(restKnee,normalizedKnee.copy(kneeDirection).normalize());
  localLowerRotation.copy(pivot.quaternion).invert();
  lowerDirection.copy(legDirection).multiplyScalar(reach).sub(kneeDirection).applyQuaternion(localLowerRotation).normalize();
  joint.quaternion.setFromUnitVectors(restAnkle,lowerDirection);
}
function placeDogFeet(dog,dt,wag,pace,galop){
  const angle=dog.heading,ss=Math.sin(angle),cc=Math.cos(angle);
  const moving=pace>.036;
  const angular=dog.turnRate||0;
  const vx=dog.motionX||0,vz=dog.motionZ||0;
  const scale=dog.root.scale.x;
  const stroke=.13+.35*pace;
  const rate=mix(.92+dog.speed*.57,3.86+dog.speed*.028,galop)+Math.abs(angular)*.18;
  if(moving)dog.cycle=(dog.cycle+dt*rate)%1;
  const duty=mix(.64,.265,galop);
  const settle=1-Math.exp(-dt*13.5);
  inverseHips.copy(dog.bones[0].matrixWorld).invert();
  for(const leg of dog.legs){
    const fx=leg.toe.x*scale,fz=leg.toe.z*scale;
    const x=cc*fx+ss*fz,z=-ss*fx+cc*fz;
    const standX=dog.x+x,standZ=dog.z+z;
    const lead=clamp(duty/rate*.57,.025,.24);
    const aimX=standX+clamp((vx+angular*z)*lead,-stroke,stroke);
    const aimZ=standZ+clamp((vz-angular*x)*lead,-stroke,stroke);
    const contact=.046*scale;
    const restY=groundY(standX,standZ)+contact;
    if(!leg.initialized){
      leg.initialized=true;leg.foot.set(standX,restY,standZ);
      leg.anchor.copy(leg.foot);leg.departure.copy(leg.foot);
    }
    if(!moving){
      candidateFoot.set(standX,restY,standZ);
      leg.foot.lerp(candidateFoot,settle);
      leg.anchor.copy(leg.foot);
      leg.isStance=true;
    }else{
      const pair=(leg.fore===(leg.side<0)?0:.5);
      const stride=(leg.fore?0:.53)+(leg.side>0?.126:0);
      const phase=(dog.cycle+mix(pair,stride,galop))%1;
      const stance=phase<duty;
      if(stance){
        if(!leg.isStance){
          leg.anchor.copy(leg.foot);
          leg.anchor.y=groundY(leg.anchor.x,leg.anchor.z)+contact;
        }
        const limit=mix(.36,.48,galop);
        const offsetX=leg.anchor.x-standX,offsetZ=leg.anchor.z-standZ;
        const offset=Math.hypot(offsetX,offsetZ);
        if(offset>limit&&dog.speed>2){
          const correction=(offset-limit)*(1-Math.exp(-dt*23));
          leg.anchor.x-=offsetX/offset*correction;
          leg.anchor.z-=offsetZ/offset*correction;
          leg.anchor.y=groundY(leg.anchor.x,leg.anchor.z)+contact;
        }
        leg.foot.copy(leg.anchor);
      }else{
        if(leg.isStance)leg.departure.copy(leg.foot);
        const swing=clamp((phase-duty)/(1-duty),0,1);
        const ease=swing*swing*(3-2*swing);
        const lift=Math.sin(Math.PI*swing)*(mix(.17,.32,galop)*pace+.030*Math.abs(angular))*wag;
        leg.foot.x=mix(leg.departure.x,aimX,ease);
        leg.foot.z=mix(leg.departure.z,aimZ,ease);
        const baseY=groundY(leg.foot.x,leg.foot.z)+contact;
        leg.foot.y=baseY+lift;
      }
      leg.isStance=stance;
    }
    putPawOnTarget(leg);
  }
}

function animateDog(dog,time,dt){
  const energy=prefersStill?.63:1;
  const angular=dog.turnRate||0;
  const pace=Math.max(smooth(.10,3.0,dog.speed),Math.min(.55,Math.abs(angular)*.24));
  const gallop=smooth(5.45,10.35,dog.speed);
  const rhythm=dog.cycle*TAU;
  dog.root.position.set(dog.x,groundY(dog.x,dog.z),dog.z);dog.root.rotation.y=dog.heading;
  const sx=Math.sin(dog.heading)*.57,sz=Math.cos(dog.heading)*.57;
  const grade=(groundY(dog.x+sx,dog.z+sz)-groundY(dog.x-sx,dog.z-sz))/1.14;
  const suspension=(1-Math.cos(rhythm*2))*.5;
  dog.actor.position.y=energy*(.006*Math.sin(time*3+dog.phase)+pace*(.014+.069*gallop)*suspension)-.034*pace-.013*gallop;
  dog.actor.rotation.x=-Math.atan(grade)*.81+gallop*.063*Math.sin(rhythm)*energy;
  dog.actor.rotation.z=clamp(angular*.047,-.076,.076)*pace*energy;
  const [spine,head,earLeft,earRight,tail,tailTip]=dog.bones;
  spine.rotation.x=gallop*.046*Math.sin(rhythm+.7)*energy;
  spine.rotation.z=pace*.018*Math.sin(rhythm)*energy;
  const barkAge=time-barkTime;
  const bark=barkAge>=0&&barkAge<.28?Math.sin(barkAge/.28*Math.PI):0;
  head.rotation.x=-.074*gallop+.043*Math.cos(rhythm)*pace-.14*bark;
  head.rotation.y=clamp(angular*.088,-.16,.16)+.035*Math.sin(time*1.72)*energy;
  head.rotation.z=.019*Math.sin(time*1.22+dog.phase)*energy;
  earLeft.rotation.x=.14*gallop+.061*Math.sin(rhythm+.25)*pace;
  earRight.rotation.x=.12*gallop+.054*Math.sin(rhythm+.78)*pace;
  earLeft.rotation.z=.036*Math.sin(time*2.8)*energy;
  earRight.rotation.z=.042*Math.cos(time*3.6)*energy;
  dog.wagPhase=((dog.wagPhase??dog.phase)+dt*(5.5-gallop*1.46))%TAU;
  const wag=dog.wagPhase;
  tail.rotation.y=Math.sin(wag)*(.285-.11*gallop)*energy;
  tail.rotation.x=-.049-.11*gallop+.041*Math.sin(rhythm)*pace;
  tailTip.rotation.y=.17*Math.sin(wag-.48)*energy;
  tailTip.rotation.x=.083*Math.cos(wag-.33)*energy;
  dog.bones[14].rotation.x=.16*bark+.058*gallop;
  dog.scarf.rotation.z=energy*.052*Math.sin(time*3.9+dog.phase)*(1+gallop*.5);
  const blink=(time+.84+dog.phase*.17)%5.35;
  dogEyeOpening.value=blink<.145?1-.91*Math.sin(blink/.145*Math.PI)**2:1;
  if(Math.hypot(dog.x-(dog.poseX??dog.x),dog.z-(dog.poseZ??dog.z))>1.75){
    for(const leg of dog.legs)leg.initialized=false;
  }
  dog.poseX=dog.x;dog.poseZ=dog.z;
  dog.skin.updateWorldMatrix(true,true);
  placeDogFeet(dog,dt,energy,pace,gallop);
}

let animalPaint;
function batchAnimalParts(parent){
  animalPaint??=new THREE.MeshLambertMaterial({map:washTexture||null});
  const batches=new Map();
  for(const child of [...parent.children]){
    if(child.isGroup){batchAnimalParts(child);continue;}
    if(!child.isMesh||!child.material.isMeshLambertMaterial)continue;
    if(!batches.has(child.geometry))batches.set(child.geometry,[]);
    batches.get(child.geometry).push(child);
  }
  for(const [geometry,parts] of batches){
    if(parts.length<3)continue;
    const batch=new THREE.InstancedMesh(geometry,animalPaint,parts.length);
    parts.forEach((part,i)=>{
      part.updateMatrix();batch.setMatrixAt(i,part.matrix);batch.setColorAt(i,part.material.color);
      parent.remove(part);
    });
    batch.computeBoundingSphere();parent.add(batch);
  }
}
function makeMover(type,x,z,hidden=false,variant=0){
  const root=group(map,x,groundY(x,z),z),actor=group(root);
  const shadowMat=new THREE.MeshBasicMaterial({map:shadeTexture,transparent:true,opacity:.64,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  const shadow=mesh(root,'plane',shadowMat,.15,.04,.028,type==='duck'?1.64:2.1,type==='dog'?2.63:1.91,1);
  shadow.rotation.x=-Math.PI/2;
  const parts=type==='dog'?makeDogModel(actor):type==='sheep'?sheepModel(actor,variant):type==='duck'?duckModel(actor,variant):type==='goat'?goatModel(actor,variant):pigModel(actor,variant);
  if(type!=='dog')batchAnimalParts(actor);
  actor.traverse(object=>{if(object.isMesh){object.castShadow=true;object.receiveShadow=true;}});
  const size=type==='dog'?.77:type==='duck'?.76:type==='goat'?.91:type==='pig'?.83:variant===3?.68:.81+(variant%3)*.048;
  root.scale.setScalar(size);root.visible=!hidden;
  return {root,actor,shadow,type,x,z,hidden,found:false,safe:false,speed:0,heading:random()*TAU,
    home:null,origin:point(x,z),phase:random()*TAU,cycle:0,react:0,stress:0,vx:0,vz:0,
    desiredX:0,desiredZ:0,path:null,between:null,...parts};
}
function animateMover(m,time,dt=0){
  if(m.type==='dog'){animateDog(m,time,dt);return;}
  const duck=m.type==='duck',moving=clamp(m.speed/2.7,0,1);
  const energy=prefersStill?.55:1;
  m.cycle=(m.cycle+dt*(2.0+Math.min(m.speed,13)*2.24))%TAU;
  const cycle=m.cycle,walk=Math.sin(cycle);
  m.root.position.set(m.x,groundY(m.x,m.z),m.z);m.root.rotation.y=m.heading;
  const forwardHeight=groundY(m.x+Math.sin(m.heading)*.57,m.z+Math.cos(m.heading)*.57)-groundY(m.x-Math.sin(m.heading)*.57,m.z-Math.cos(m.heading)*.57);
  const bound=m.type==='goat'&&m.speed>2.0?.106:.057;
  m.actor.position.y=energy*(moving*bound*(1-Math.cos(cycle*2))*.53+Math.sin(time*3+m.phase)*.014);
  m.actor.rotation.x=-Math.atan(forwardHeight/1.14)*.82;
  m.actor.rotation.z=(duck?.13:.046)*walk*moving*energy;
  m.legs.forEach(({pivot,knee,fore,side})=>{
    const stride=cycle+(side===1?Math.PI:0)+(fore?0:Math.PI);
    pivot.rotation.x=Math.sin(stride)*.49*moving*energy;
    knee.rotation.x=moving*energy*(fore?1:-1)*(.18+.36*Math.max(0,Math.cos(stride)));
  });
  m.tail.rotation.y=.19*Math.sin(time*4.8+m.phase)*energy;
  m.tail.rotation.x=.09*Math.sin(time*3.1+m.phase)*energy;
  const grazing=!m.safe&&!m.escape&&m.react<.40&&m.speed<.35;
  const headDown=grazing?smooth(-.5,.77,Math.sin(time*.57+m.phase))*.73:0;
  m.head.rotation.x=headDown+.047*Math.sin(time*3.4+m.phase)*energy;
  m.head.position.y=duck?.997-headDown*.16:m.type==='goat'?1.022-headDown*.16:m.type==='pig'?.599-headDown*.13:1.04-headDown*.21;
  m.ears.forEach((ear,index)=>{
    const side=index===0?-1:1;
    ear.rotation.x=.10*Math.sin(time*5.1+m.phase+index*.41)*energy;
    ear.rotation.z=side*.28+.12*Math.sin(time*2.2+m.phase+index*.82)*energy;
  });
  const blink=(time+m.phase*1.76)%5.9;
  const eyeScale=blink<.14?1-.90*Math.sin(blink/.14*Math.PI):1;
  for(const eye of m.eyes)eye.scale.y=eyeScale;
  if(m.wings)for(const wing of m.wings)wing.rotation.z=.036*walk*moving;
}
let collisionCells = null, gridShape = null;
const CELL=8;
function insideField(x,z,radius=0){
  const [hx,hz]=levels[chapter].half;
  const xx=Math.abs(x)/(hx-radius),zz=Math.abs(z)/(hz-radius);
  return xx**7+zz**7<1;
}
function obstacle(x,z,radius,height=radius*2){
  colliders.push({x,z,radius,height});
}
function segmentDistance(x,z,segment){
  const {x1,z1,x2,z2}=segment;
  const dx=x2-x1,dz=z2-z1;
  const t=clamp(((x-x1)*dx+(z-z1)*dz)/(dx*dx+dz*dz),0,1);
  return Math.hypot(x-x1-t*dx,z-z1-t*dz);
}
function bounds(c){
  if(c.radius!==undefined)return [c.x-c.radius,c.x+c.radius,c.z-c.radius,c.z+c.radius];
  if(c.rx)return [c.x-c.rx,c.x+c.rx,c.z-c.rz,c.z+c.rz];
  if(c.x1!==undefined)return [Math.min(c.x1,c.x2)-.34,Math.max(c.x1,c.x2)+.34,Math.min(c.z1,c.z2)-.34,Math.max(c.z1,c.z2)+.34];
  return [c.minX,c.maxX,c.minZ,c.maxZ];
}
function indexColliders(){
  collisionCells=new Map();
  for(const c of colliders){
    const [xmin,xmax,zmin,zmax]=bounds(c);
    for(let j=Math.floor((zmin-2)/CELL);j<=Math.floor((zmax+2)/CELL);j++){
      for(let i=Math.floor((xmin-2)/CELL);i<=Math.floor((xmax+2)/CELL);i++){
        const key=i+j*100;
        if(!collisionCells.has(key))collisionCells.set(key,[]);
        collisionCells.get(key).push(c);
      }
    }
  }
}
function colliderAt(x,z,radius,c){
  if(c.enabled===false)return false;
  if(c.stream){
    return Math.abs(x-c.stream.x)<c.stream.width*.5+radius&&Math.abs(z-c.stream.z)>c.stream.gap*.5-radius;
  }
  if(c.radius!==undefined)return (x-c.x)**2+(z-c.z)**2<(c.radius+radius)**2;
  if(c.rx)return ((x-c.x)/(c.rx+radius))**2+((z-c.z)/(c.rz+radius))**2<1;
  if(c.x1!==undefined)return segmentDistance(x,z,c)<radius+c.thickness;
  return x>c.minX-radius&&x<c.maxX+radius&&z>c.minZ-radius&&z<c.maxZ+radius;
}
const noColliders=[];
function candidatesAt(x,z){
  return collisionCells?(collisionCells.get(Math.floor(x/CELL)+Math.floor(z/CELL)*100)||noColliders):colliders;
}
function blocked(x,z,radius=.35){
  if(!insideField(x,z,radius))return true;
  return candidatesAt(x,z).some(c=>colliderAt(x,z,radius,c));
}
function travelClear(a,b,radius=.43){
  const length=distance(a,b),steps=Math.max(1,Math.ceil(length/.48));
  for(let i=1;i<=steps;i++)if(blocked(mix(a.x,b.x,i/steps),mix(a.z,b.z,i/steps),radius))return false;
  return true;
}
const navSpacing=1.28;
const navDirs=[[-1,0,1],[1,0,1],[0,-1,1],[0,1,1],[-1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[1,-1,Math.SQRT2],[1,1,Math.SQRT2]];
function createGrid(config){
  const [hx,hz]=config.half;
  const cols=Math.ceil(2*hx/navSpacing)+1,rows=Math.ceil(2*hz/navSpacing)+1;
  gridShape={cols,rows,hx,hz};
  const nodes=Array.from({length:cols*rows},(_,i)=>{
    const x=(i%cols)*navSpacing-hx,z=Math.floor(i/cols)*navSpacing-hz;
    return {x,z,open:!blocked(x,z,.46),neighbors:[],region:-1};
  });
  for(let i=0;i<nodes.length;i++){
    if(!nodes[i].open)continue;
    const col=i%cols,row=Math.floor(i/cols);
    for(const [dx,dz,cost] of navDirs){
      if(col+dx<0||col+dx>=cols||row+dz<0||row+dz>=rows)continue;
      const next=i+dx+dz*cols;
      if(!nodes[next].open||dx&&dz&&(!nodes[i+dx].open||!nodes[i+dz*cols].open))continue;
      if(!travelClear(nodes[i],nodes[next],.40))continue;
      nodes[i].neighbors.push([next,cost]);
    }
  }
  for(let start=0;start<nodes.length;start++){
    if(!nodes[start].open||nodes[start].region>=0)continue;
    const pending=[start];nodes[start].region=start;
    while(pending.length){
      for(const [neighbor] of nodes[pending.pop()].neighbors){
        if(nodes[neighbor].region>=0)continue;
        nodes[neighbor].region=start;pending.push(neighbor);
      }
    }
  }
  return nodes;
}
function nearestGrid(p,region=null,requireClear=false){
  const {cols,rows,hx,hz}=gridShape;
  const column=clamp(Math.round((p.x+hx)/navSpacing),0,cols-1);
  const row=clamp(Math.round((p.z+hz)/navSpacing),0,rows-1);
  let best=-1,dist=Infinity;
  for(let radius=0;radius<=6;radius++){
    for(let r=Math.max(row-radius,0);r<=Math.min(row+radius,rows-1);r++){
      for(let c=Math.max(column-radius,0);c<=Math.min(column+radius,cols-1);c++){
        const i=c+r*cols,q=grid[i];
        if(!q.open||(region!==null&&q.region!==region))continue;
        const d=distance(p,q);
        if(d<dist&&(!requireClear||travelClear(p,q,.36))){best=i;dist=d;}
      }
    }
    if(best!==-1)return best;
  }
  return -1;
}
function findPath(from,to){
  if(travelClear(from,to))return [point(to.x,to.z)];
  let start=nearestGrid(from,null,true);
  if(start<0)start=nearestGrid(from);
  if(start<0)return [];
  const end=nearestGrid(to,grid[start].region);
  if(end<0)return [];
  const heap=[],came=new Int32Array(grid.length).fill(-1);
  const costs=new Float32Array(grid.length).fill(Infinity),closed=new Uint8Array(grid.length);
  function push(id,score){
    let i=heap.length;
    heap.push([id,score]);
    while(i>0){
      const p=(i-1)>>1;
      if(heap[p][1]<=score)break;
      heap[i]=heap[p];i=p;
    }
    heap[i]=[id,score];
  }
  function pop(){
    const first=heap[0],last=heap.pop();
    if(heap.length){
      let i=0;
      while(i*2+1<heap.length){
        let child=i*2+1;
        if(child+1<heap.length&&heap[child+1][1]<heap[child][1])child++;
        if(last[1]<=heap[child][1])break;
        heap[i]=heap[child];i=child;
      }
      heap[i]=last;
    }
    return first[0];
  }
  costs[start]=0;push(start,distance(grid[start],grid[end])/navSpacing);
  while(heap.length){
    const current=pop();
    if(closed[current])continue;
    if(current===end){
      const raw=[];
      for(let id=current;id>=0;id=came[id])raw.push(grid[id]);
      raw.reverse();
      if(travelClear(grid[end],to))raw.push(point(to.x,to.z));
      let anchor=from;
      const route=[];
      while(raw.length){
        let visible=0;
        for(let i=raw.length-1;i>=1;i--)if(travelClear(anchor,raw[i])){visible=i;break;}
        anchor=raw[visible];route.push(anchor);raw.splice(0,visible+1);
      }
      return route;
    }
    closed[current]=1;
    for(const [next,weight] of grid[current].neighbors){
      const cost=costs[current]+weight;
      if(closed[next]||cost>=costs[next])continue;
      costs[next]=cost;came[next]=current;
      push(next,cost+distance(grid[next],grid[end])/navSpacing);
    }
  }
  return [];
}
const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
function updateHeading(m,dx,dz,dt,rate=9){
  if(Math.hypot(dx,dz)>dt*.16)m.heading+=wrapAngle(Math.atan2(dx,dz)-m.heading)*Math.min(1,dt*rate);
}
function step(m,dx,dz,dt,radius=species[m.type]?.radius??.284,faceMotion=true){
  const sx=m.x,sz=m.z;
  const segments=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.29));
  for(let i=0;i<segments;i++){
    const nx=m.x+dx/segments,nz=m.z+dz/segments;
    if(!blocked(nx,nz,radius)){m.x=nx;m.z=nz;}
    else{
      if(!blocked(nx,m.z,radius))m.x=nx;
      if(!blocked(m.x,nz,radius))m.z=nz;
    }
  }
  const actualX=m.x-sx,actualZ=m.z-sz;
  m.speed=Math.hypot(actualX,actualZ)/dt;
  if(faceMotion)updateHeading(m,actualX,actualZ,dt);
}
function followPath(m,path,speed,dt){
  while(path.length&&distance(m,path[0])<.23)path.shift();
  if(!path.length){m.speed=0;return false;}
  const p=path[0],d=distance(m,p),amount=Math.min(d,speed*dt)/d;
  step(m,(p.x-m.x)*amount,(p.z-m.z)*amount,dt);
  return true;
}
const cameraInput={id:null,startX:0,startY:0,x:0,y:0,dragged:false,yaw:0,elevation:.20,until:0};
let sprintPointer=null,phonePortrait=false;
function holdSprint(active){
  $('sprint').setAttribute('aria-pressed',String(active));
}
function releaseTouch(){
  cameraInput.id=null;cameraInput.dragged=false;cameraInput.until=0;cameraInput.elevation=.20;
  sprintPointer=null;
  holdSprint(false);
}
function updateOrientation(){
  const portrait=matchMedia('(orientation: portrait) and (any-pointer: coarse)').matches;
  if(portrait!==phonePortrait){phonePortrait=portrait;stopInput();}
  $('rotate-landscape').hidden=!phonePortrait||!$('home').hidden;
}
function bindTouchControls(){
  const controls=$('sprint');
  controls.addEventListener('pointerdown',event=>{
    if(playPaused()||sprintPointer!==null||event.pointerType==='mouse'&&event.button!==0)return;
    event.preventDefault();
    sprintPointer=event.pointerId;
    controls.setPointerCapture(event.pointerId);
    holdSprint(true);
  });
  function stopSprint(event){
    if(sprintPointer!==event.pointerId)return;
    sprintPointer=null;holdSprint(sprintToggled);
  }
  for(const type of ['pointerup','pointercancel','lostpointercapture'])controls.addEventListener(type,stopSprint);
  const barkButton=$('bark');
  barkButton.addEventListener('pointerdown',event=>{
    if(playPaused()||event.pointerType==='mouse'&&event.button!==0)return;
    event.preventDefault();
    bark();
  });
  canvas.addEventListener('pointerdown',event=>{
    if(playPaused()||cameraInput.id!==null||event.pointerType==='mouse'&&event.button!==0)return;
    const rect=canvas.getBoundingClientRect();
    const touch=event.pointerType==='touch';
    if(touch&&event.clientX<rect.left+rect.width*.45)return;
    event.preventDefault();
    if(!touch)canvas.focus({preventScroll:true});
    cameraInput.id=event.pointerId;
    cameraInput.startX=cameraInput.x=event.clientX;
    cameraInput.startY=cameraInput.y=event.clientY;
    cameraInput.dragged=false;cameraInput.yaw=cameraYaw;cameraInput.elevation=cameraElevation;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if(cameraInput.id!==event.pointerId)return;
    const x=event.clientX,y=event.clientY;
    if(!cameraInput.dragged&&Math.hypot(x-cameraInput.startX,y-cameraInput.startY)<5)return;
    cameraInput.dragged=true;
    const scale=event.pointerType==='touch'?.0081:.0052;
    cameraInput.yaw=wrapAngle(cameraInput.yaw+(x-cameraInput.x)*scale);
    cameraInput.elevation=clamp(cameraInput.elevation+(y-cameraInput.y)*scale*.61,.052,.66);
    cameraInput.x=x;cameraInput.y=y;
    cameraInput.until=gameTime+1.34;
  });
  function stopLooking(event){
    if(cameraInput.id!==event.pointerId)return;
    cameraInput.id=null;
    if(!cameraInput.dragged&&event.pointerType!=='touch'&&event.type==='pointerup')handleTap(event.clientX,event.clientY);
  }
  for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,stopLooking);
  const joy=$('joystick');
  function positionStick(event){
    const rect=joy.getBoundingClientRect();
    const x=event.clientX-rect.left-rect.width/2,y=event.clientY-rect.top-rect.height/2;
    const range=rect.width*.34,length=Math.max(range,Math.hypot(x,y));
    stick.x=x/length;stick.y=y/length;
    $('joystick-thumb').style.transform='translate('+(stick.x*range)+'px,'+(stick.y*range)+'px)';
  }
  joy.addEventListener('pointerdown',event=>{
    if(playPaused()||stick.id!==null||event.pointerType==='mouse'&&event.button!==0)return;
    event.preventDefault();stick.id=event.pointerId;
    joy.setPointerCapture(stick.id);positionStick(event);
  });
  joy.addEventListener('pointermove',event=>{if(stick.id===event.pointerId)positionStick(event);});
  function stopWalking(event){
    if(stick.id!==event.pointerId)return;
    stick.x=stick.y=0;stick.id=null;$('joystick-thumb').style.transform='';
  }
  for(const type of ['pointerup','pointercancel','lostpointercapture'])joy.addEventListener(type,stopWalking);
  $('rotate-back').onclick=showHome;
  window.addEventListener('resize',updateOrientation);
  updateOrientation();
}

let cameraYaw=0,cameraElevation=.20,cameraReady=false,sprintToggled=false,dogMoveSpeed=0;
let stageWidth=1,stageHeight=1,aspect=1;
const camForward=new THREE.Vector3();
const cameraCenter=new THREE.Vector3(),cameraTarget=new THREE.Vector3(),desiredCamera=new THREE.Vector3(),safeCamera=new THREE.Vector3(),cameraBoom=new THREE.Vector3();
let boomFraction=1,runCamera=0;
function boomObstructed(portion){
  safeCamera.copy(cameraCenter).addScaledVector(cameraBoom,portion);
  const ground=groundY(safeCamera.x,safeCamera.z);
  return safeCamera.y<ground+.44||candidatesAt(safeCamera.x,safeCamera.z).some(obstacle=>
    obstacle.height>0&&safeCamera.y<ground+obstacle.height+.19&&colliderAt(safeCamera.x,safeCamera.z,.19,obstacle));
}
function stopInput(){
  keys.clear();tap=null;stick.x=stick.y=0;stick.id=null;
  sprintToggled=false;dogMoveSpeed=0;
  releaseTouch();
  $('joystick-thumb').style.transform='';
  if(dog){dog.speed=0;dog.turnRate=0;dog.steeringRate=0;dog.motionX=dog.motionZ=0;}
}
function resize(){
  const {width,height}=stage.getBoundingClientRect();
  stageWidth=Math.max(1,width);stageHeight=Math.max(1,height);aspect=stageWidth/stageHeight;
  camera.fov=aspect<.9?65:aspect>1.90?48:53;
  camera.aspect=aspect;camera.updateProjectionMatrix();
  renderer.setSize(stageWidth,stageHeight,false);
  frameCamera(0);
}
function frameCamera(dt){
  const ground=groundY(dog.x,dog.z);
  if(!cameraReady){
    cameraCenter.set(dog.x,ground+1.32,dog.z);
    cameraYaw=dog.heading;cameraElevation=.20;boomFraction=1;runCamera=0;cameraReady=true;
  }
  const manual=cameraInput.dragged&&(cameraInput.id!==null||gameTime<cameraInput.until||dog.speed<.23);
  const heading=manual?cameraInput.yaw:dog.heading;
  const wantedElevation=manual?cameraInput.elevation:.20;
  if(!manual&&cameraInput.id===null&&dog.speed>.23)cameraInput.dragged=false;
  const error=wrapAngle(heading-cameraYaw);
  const rate=manual?14:5.8;
  const limit=manual?5.4:2.01;
  cameraYaw=wrapAngle(cameraYaw+clamp(error*(1-Math.exp(-dt*rate)),-dt*limit,dt*limit));
  cameraElevation=mix(cameraElevation,wantedElevation,1-Math.exp(-dt*(manual?12.4:4.1)));
  camForward.set(Math.sin(cameraYaw),0,Math.cos(cameraYaw));
  const follow=1-Math.exp(-dt*11);
  cameraCenter.x=mix(cameraCenter.x,dog.x,follow);
  cameraCenter.z=mix(cameraCenter.z,dog.z,follow);
  cameraCenter.y=mix(cameraCenter.y,ground+1.32,1-Math.exp(-dt*6));
  runCamera=mix(runCamera,clamp((dog.speed-5)/8,0,1),1-Math.exp(-dt*3.5));
  const boom=(aspect<.90?4.92:5.8)+runCamera*.56;
  desiredCamera.copy(cameraCenter).addScaledVector(camForward,-boom);
  desiredCamera.y+=1.89+runCamera*.17+(cameraElevation-.20)*4.55;
  cameraBoom.copy(desiredCamera).sub(cameraCenter);
  let clearance=1;
  for(let step=3;step<=15;step++){
    const t=step/15;
    if(!boomObstructed(t))continue;
    let inner=t,outer=(step-1)/15;
    for(let i=0;i<5;i++){
      const mid=(inner+outer)*.5;
      if(boomObstructed(mid))inner=mid;else outer=mid;
    }
    clearance=Math.max(.15,outer-.057);break;
  }
  boomFraction=clearance<boomFraction?clearance:mix(boomFraction,clearance,1-Math.exp(-dt*4.7));
  camera.position.copy(cameraCenter).addScaledVector(cameraBoom,boomFraction);
  camera.position.y=Math.max(camera.position.y,groundY(camera.position.x,camera.position.z)+.69);
  camera.up.set(0,1,0);
  cameraTarget.copy(camera.position).addScaledVector(camForward,13);
  cameraTarget.y-=Math.tan(cameraElevation)*13;
  camera.lookAt(cameraTarget);camera.updateMatrixWorld();
}

const raycaster=new THREE.Raycaster();
const cursor3=new THREE.Vector3();
const markerMat=new THREE.MeshBasicMaterial({color:'#fff7d0',transparent:true,opacity:.88,side:THREE.DoubleSide,depthWrite:false});
let tapMarker,barkRing,rain;
function getTerrainTarget(clientX,clientY){
  const rect=canvas.getBoundingClientRect();
  const coords=new THREE.Vector2((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(coords,camera);
  for(let t=2;t<=125;t+=.85){
    raycaster.ray.at(t,cursor3);
    if(cursor3.y>groundY(cursor3.x,cursor3.z)+.045)continue;
    let lo=t-.85,hi=t;
    for(let i=0;i<6;i++){
      const mid=(lo+hi)*.5;raycaster.ray.at(mid,cursor3);
      if(cursor3.y>groundY(cursor3.x,cursor3.z))lo=mid;else hi=mid;
    }
    return point(cursor3.x,cursor3.z);
  }
  return null;
}
function handleTap(x,y){
  if(playPaused())return;
  const p=getTerrainTarget(x,y);
  if(!p||!insideField(p.x,p.z)||distance(dog,p)<1.1)return;
  const path=findPath(dog,p);
  if(!path.length)return;
  const goal=path.at(-1);tap={path,goal};
  tapMarker.position.set(goal.x,groundY(goal.x,goal.z)+.074,goal.z);
}
function steer(dt){
  let turn=stick.x,drive=-stick.y;
  for(const key of keys){
    const vector=keyVectors[key];
    if(!vector)continue;
    turn+=vector[0];drive-=vector[1];
  }
  const input=value=>Math.sign(value)*Math.max(0,(clamp(Math.abs(value),0,1)-.085)/.915);
  turn=input(turn);drive=input(drive);
  const sprint=sprintPointer!==null||sprintToggled||keys.has('ShiftLeft')||keys.has('ShiftRight');
  const oldX=dog.x,oldZ=dog.z,oldHeading=dog.heading;
  const maxTurn=mix(1.83,1.27,smooth(2,12,Math.abs(dogMoveSpeed)));
  let desiredTurn=0,desiredSpeed=0,goal=null;
  if(drive||turn){
    tap=null;
    desiredTurn=-turn*maxTurn;
    const forwardSpeed=sprint?12.4:4.35;
    desiredSpeed=drive*(drive<0?2.42:forwardSpeed);
    if(drive>0)desiredSpeed*=1-.115*Math.abs(turn);
  }else if(tap){
    const path=tap.path;
    while(path.length&&distance(dog,path[0])<.28)path.shift();
    if(!path.length)tap=null;
    else{
      goal=path[0];
      const distanceToGoal=distance(dog,goal);
      const heading=Math.atan2(goal.x-dog.x,goal.z-dog.z);
      const error=wrapAngle(heading-dog.heading);
      desiredTurn=clamp(error*5.4,-1.83,1.83);
      const softenTurn=1-smooth(.38,1.18,Math.abs(error));
      const nearDestination=path.length===1?smooth(.23,2.9,distanceToGoal):1;
      desiredSpeed=(sprint?12.4:4.35)*softenTurn*nearDestination;
      if(path.length===1&&distanceToGoal>.30)desiredSpeed=Math.max(desiredSpeed,.7*softenTurn);
    }
  }
  if(mudAt(dog.x,dog.z)){
    if(Math.abs(dogMoveSpeed)>.38||drive)runStats.mud+=dt;
    desiredSpeed*=.55;
  }
  dog.steeringRate=mix(dog.steeringRate||0,desiredTurn,1-Math.exp(-dt*(desiredTurn?12.6:14)));
  dog.heading=wrapAngle(dog.heading+dog.steeringRate*dt);
  const slowing=Math.abs(desiredSpeed)<Math.abs(dogMoveSpeed)||desiredSpeed*dogMoveSpeed<0;
  const response=slowing?15.5:Math.abs(desiredSpeed)>5?6.8:11.7;
  dogMoveSpeed=mix(dogMoveSpeed,desiredSpeed,1-Math.exp(-dt*response));
  if(!desiredSpeed&&Math.abs(dogMoveSpeed)<.045)dogMoveSpeed=0;
  let sx=Math.sin(dog.heading),sz=Math.cos(dog.heading),stride=dogMoveSpeed*dt;
  if(goal&&stride>0){
    const d=distance(dog,goal);
    const facing=wrapAngle(Math.atan2(goal.x-dog.x,goal.z-dog.z)-dog.heading);
    const guidance=(1-smooth(.53,1.19,Math.abs(facing)))*.81;
    sx=mix(sx,(goal.x-dog.x)/d,guidance);
    sz=mix(sz,(goal.z-dog.z)/d,guidance);
    stride=Math.min(stride,d);
  }
  if(dogMoveSpeed){
    step(dog,sx*stride,sz*stride,dt,.284,false);
    if(dog.speed<Math.abs(dogMoveSpeed)*.35&&Math.abs(desiredTurn)<.1)dogMoveSpeed*=Math.exp(-dt*5);
  }else dog.speed=0;
  dog.motionX=(dog.x-oldX)/dt;dog.motionZ=(dog.z-oldZ)/dt;
  dog.turnRate=wrapAngle(dog.heading-oldHeading)/dt;
  dog.movingBackward=dogMoveSpeed<-.075;
  tapMarker.visible=Boolean(tap);
}

let clues=[],runStats;
let interactionTarget=null, lastInteractionUpdate=-1;
function emptyRun(){
  return {time:0,barks:0,help:0,wrong:0,panic:0,mud:0,clues:0,crossed:0};
}
function mudAt(x,z){
  for(const item of levels[chapter].mud||[]){
    const [mx,mz,rx,rz]=item;
    if(((x-mx)/rx)**2+((z-mz)/rz)**2<1)return item;
  }
  return null;
}
function creekHeight(x,z,y){
  const s=levels[chapter].stream;
  if(!s)return y;
  const b=1-smooth(s.width*.5,s.width*.5+2.2,Math.abs(x-s.x));
  if(b<=0)return y;
  const deck=1-smooth(s.gap*.5-.17,s.gap*.5+.75,Math.abs(z-s.z));
  return mix(y,mix(-.66,.26,deck),b);
}
function buildRules(config){
  if(config.stream){
    const s=config.stream,[,hz]=config.half,rx=s.width*.5;
    colliders.push({stream:s,minX:s.x-rx,maxX:s.x+rx,minZ:-hz-1,maxZ:hz+1,height:0});
    const waterMat=new THREE.MeshLambertMaterial({color:'#83acaa',map:washTexture||null});
    const water=mesh(props,'plane',waterMat,s.x,-.39,0,s.width,2*hz+6,1);water.rotation.x=-Math.PI/2;
    for(let i=0;i<25;i++){
      const x=s.x-mix(rx+.76,-rx-.76,(i+.5)/25);
      const y=groundY(x,s.z);
      mesh(decor,'box',i%3===0?'#c39a67':'#b68f60',x,y+.015,s.z,(s.width+1.7)/25+.017,.19,s.gap+.39);
      if(i%5===0)for(const side of [-1,1]){
        mesh(decor,'stone','#a9a089',x,groundY(x,s.z+side*(s.gap*.5+.35))+.23,s.z+side*(s.gap*.5+.35),.38,.29,.28);
      }
    }
    for(const side of [-1,1]){
      fence(s.x-rx-.74,s.z+side*s.gap*.5,s.x+rx+.74,s.z+side*s.gap*.5);
    }
    for(let i=0;i<53;i++){
      const side=i%2===0?1:-1;
      const x=s.x+side*(rx+.48+random()*.38),z=(2*random()-1)*hz;
      if(Math.abs(z-s.z)>s.gap*.5+1.1){grass(x,z,1.15);if(i%4===0)rocks(x,z,2,.62);}
    }
    signboard(s.x+rx+1.62,s.z-4.56,'Le pont',null,.27);
  }
  for(const [x,z,rx,rz] of config.mud||[]){
    const sections=49;
    const vertices=[x,groundY(x,z)+.038,z],indices=[];
    for(let i=0;i<sections;i++){
      const a=TAU*i/sections;
      const px=x+Math.cos(a)*rx,pz=z+Math.sin(a)*rz;
      vertices.push(px,groundY(px,pz)+.042,pz);
      indices.push(0,1+(i+1)%sections,1+i);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geometry.setIndex(indices);geometry.computeVertexNormals();
    const mud=new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({color:'#927d68',transparent:true,opacity:.76,depthWrite:false,side:THREE.DoubleSide}));
    props.add(mud);
    for(let i=0;i<14;i++){
      const a=random()*TAU,r=random()*.78;
      const xx=x+Math.cos(a)*rx*r,zz=z+Math.sin(a)*rz*r;
      mesh(decor,'stone',i%2?'#b2a38a':'#8b816c',xx,groundY(xx,zz)+.038,zz,.1+random()*.19,.034,.095+random()*.16);
    }
  }
  clues=(config.clues||[]).map(([x,z,num])=>{
    const y=groundY(x,z),g=group(props,x,y,z);
    const halo=mesh(g,'ring',new THREE.MeshBasicMaterial({color:'#eac27e',side:THREE.DoubleSide,transparent:true,opacity:.94,depthWrite:false}),0,.066,0,.85,.85,1);
    halo.rotation.x=-Math.PI/2;
    for(let j=0;j<5;j++){
      const stride=j*.32-.65,side=(j%2?.21:-.21);
      for(const offset of [-.037,.037]){
        const pad=mesh(g,'ball','#927053',side+offset,.035,stride,.043,.025,.083);
        pad.rotation.y=-.43;
      }
    }
    return {x,z,num,g,touched:false};
  });
}
function lockPen(pen,config,type){
  if(!config.locks?.includes(type))return;
  const block={x1:pen.left,z1:pen.z-pen.opening/2,x2:pen.left,z2:pen.z+pen.opening/2,height:1.42,thickness:.13,enabled:true};
  pen.gate.rotation.y=Math.PI*.5;
  pen.block=block;
  colliders.push(block);
  signboard(pen.left-.68,pen.z+pen.opening*.5+.85,'Portillon',null,-.74);
}
function nearestInteraction(){
  if(!dog)return null;
  const targets=[
    ...Object.values(pens).filter(p=>p.block?.enabled).map(p=>({x:p.left,z:p.z,range:4.9,kind:'gate',item:p})),
    ...clues.filter(c=>!c.touched).map(c=>({x:c.x,z:c.z,range:4.3,kind:'track',item:c}))
  ];
  return targets.map(t=>({...t,dist:distance(dog,t)})).filter(t=>t.dist<t.range).sort((a,b)=>a.dist-b.dist)[0]||null;
}
function updateInteraction(){
  interactionTarget=nearestInteraction();
  const b=$('interact');
  b.hidden=!interactionTarget;
  if(interactionTarget){
    const label=interactionTarget.kind==='gate'?'Ouvrir':'Examiner';
    if(b.textContent!==label)b.textContent=label;
  }
}
function interact(){
  if(playPaused())return false;
  const target=nearestInteraction();
  if(!target)return false;
  const item=target.item;
  if(target.kind==='gate'){
    item.block.enabled=false;
    grid=createGrid(levels[chapter]);
    tap=null;
    showMessage(item.label+' ouverte.');
    setNote('Le portillon est ouvert. Garde le groupe entre Nuage et la porte.');
    soundEffect('found');
  }else{
    const m=animals[item.num];
    item.touched=true;item.g.visible=false;runStats.clues++;
    m.tracked=true;
    hintObject={get x(){return m.x;},get z(){return m.z;},height:1.9,label:'La piste continue'};
    hintUntil=gameTime+26;
    setNote('Suis le repère et aboie près de la cachette.');
    showMessage('Piste trouvée · '+runStats.clues+' / '+clues.length);
    soundEffect('found');
  }
  updateInteraction();
  return true;
}
function updateGates(dt){
  for(const p of Object.values(pens)){
    if(p.block&&!p.block.enabled){
      const error=wrapAngle(-1.43-p.gate.rotation.y);
      p.gate.rotation.y+=error*(1-Math.exp(-dt*9.1));
    }
  }
}
function gateCrossing(m,x,z){
  for(const [type,pen] of Object.entries(pens)){
    const cross=pen.left+.40;
    if(x>cross||m.x<=cross||pen.block?.enabled)continue;
    const intersection=mix(z,m.z,(cross-x)/(m.x-x));
    if(Math.abs(intersection-pen.z)>=pen.opening*.5-.12)continue;
    if(type===m.type){markSafe(m);return;}
    if(!m.wrong){
      m.wrong=true;runStats.wrong++;
      showMessage('Mauvais enclos. Repasse par l’ouverture.');
    }
  }
}

function reveal(m){
  m.hidden=false;m.root.visible=true;m.found=true;m.startle=gameTime+.82;
  showMessage('Animal retrouvé.');
  soundEffect('found');
}
function bark(){
  if(playPaused()||gameTime-barkTime<.94)return;
  barkTime=gameTime;barkOrigin=point(dog.x,dog.z);runStats.barks++;
  soundEffect('bark');
  for(const m of animals){
    if(m.safe||m.escape)continue;
    const d=distance(dog,m);
    if(m.hidden&&d<9){
      if(!activeMission().track||m.tracked)reveal(m);
      else setNote('Une piste mène à cette cachette. Examine les empreintes ambrées.');
    }
    if(!m.hidden&&d<13.5){m.found=true;m.startle=gameTime+.95;}
  }
  renderCounts();
}
let barkOrigin=point(0,0),stormAt=-1,nextCoach=0;
function escapedMutton(){
  const sheep=animals.filter(a=>a.type==='sheep'&&a.safe);
  const m=sheep.sort((a,b)=>a.x-b.x)[0];
  if(!m)return;
  storm=true;stormAt=gameTime;
  $('weather').textContent='Une bourrasque !';$('weather-icon').textContent='≋';
  rain.visible=!prefersStill;
  const pen=pens.sheep;
  m.safe=false;m.vx=m.vz=0;
  const route=[
    point(pen.left+1.35,pen.z),point(pen.left-.85,pen.z),point(pen.left-8,pen.z+.3),point(pen.left-17,pen.z+7.3)
  ];
  m.escape=route;
  setNote('Un mouton est ressorti. Contourne-le pour le rabattre vers la porte.');
  showMessage('Une bourrasque ! Un mouton se sauve.',4400);
  soundEffect('wind');
  renderCounts();
}
function markSafe(m){
  m.safe=true;m.found=true;m.vx=m.vz=0;m.react=0;
  const pen=pens[m.type];
  const i=animals.indexOf(m);
  m.home=point(pen.left+4.1+(i%4)*2.15,clamp(pen.z+Math.sin(i*2.4)*5.5,pen.back+1.4,pen.front-1.4));
  renderCounts();
  returnCount++;
  const count=animals.filter(a=>a.safe).length;
  soundEffect('score');
  if(activeMission().gust&&!storm&&animals.filter(a=>a.safe&&a.type==='sheep').length===2){
    escapedMutton();return;
  }
  showMessage('Un '+pen.singular+' à l’abri · '+count+' / '+animals.length);
  if(count===animals.length)finish();
}
function flockIntent(m,dt){
  const dx=m.x-dog.x,dz=m.z-dog.z,d=Math.hypot(dx,dz),isDuck=m.type==='duck';
  const trait=species[m.type];
  const barkDX=m.x-barkOrigin.x,barkDZ=m.z-barkOrigin.z,barkDistance=Math.hypot(barkDX,barkDZ);
  const barking=m.startle>gameTime?Math.max(0,1-(gameTime-barkTime)/.96):0;
  const flight=smooth(5.5,12.4,dog.speed);
  const radius=trait.flight+flight*1.65;
  const pressure=1-smooth(2.5,radius,d);
  const barkPressure=barking*(1-smooth(4,13.5,barkDistance));
  const panic=clamp((1-smooth(1.15,3.3,d))*(.61+.37*flight)+barkPressure*.54,0,1);
  m.react=Math.max(pressure,barkPressure);
  m.stress=mix(m.stress,panic,1-Math.exp(-dt*(panic>m.stress?6.1:2.0)));
  let near=0,cx=0,cz=0,vx=0,vz=0,sx=0,sz=0;
  for(const other of animals){
    if(other===m||other.safe||other.hidden||other.escape||other.type!==m.type)continue;
    const ax=other.x-m.x,az=other.z-m.z,ad=Math.hypot(ax,az);
    if(ad<trait.neighbours){
      const weight=1-.56*ad/trait.neighbours;
      near+=weight;cx+=ax*weight;cz+=az*weight;
      vx+=other.vx*weight;vz+=other.vz*weight;
    }
    const margin=trait.spacing;
    if(ad<margin&&ad>.018){
      sx-=ax/ad*(margin-ad)*(isDuck?2.1:2.55);
      sz-=az/ad*(margin-ad)*(isDuck?2.1:2.55);
    }
  }
  const herding=m.react>.025||Math.hypot(vx,vz)>.26;
  const cohesion=(herding?1:.23)*trait.cohesion*(1-m.stress*.72);
  if(near){
    const midX=cx/near,midZ=cz/near,dist=Math.hypot(midX,midZ);
    const pull=Math.min(isDuck?1.86:2.12,Math.max(0,dist-(isDuck?.86:1.23))*.48)*cohesion;
    sx+=midX/Math.max(.1,dist)*pull+vx/near*(herding?.22:.05);
    sz+=midZ/Math.max(.1,dist)*pull+vz/near*(herding?.22:.05);
  }
  const trot=Math.pow(pressure,.83)*trait.trot;
  const flightSpeed=panic*(isDuck?1.4:1.35);
  const fly=trot+flightSpeed;
  const shake=(Math.sin(m.phase*4.16)+.35*Math.sin(gameTime*2.1+m.phase))*m.stress*(m.type==='goat'?2.66:1.64);
  sx+=(dx*fly-dz*shake)/Math.max(.18,d);sz+=(dz*fly+dx*shake)/Math.max(.18,d);
  const barkBoost=barkPressure*trait.boost;
  sx+=barkDX/Math.max(.2,barkDistance)*barkBoost;
  sz+=barkDZ/Math.max(.2,barkDistance)*barkBoost;
  if(!herding){
    const roam=smooth(.41,.93,Math.sin(gameTime*.52+m.phase*3.1))*.42;
    sx+=Math.sin(m.phase+gameTime*.042)*roam;
    sz+=Math.cos(m.phase+gameTime*.042)*roam;
  }
  const pen=pens[m.type];
  const approach=pen.left-m.x,offset=pen.z-m.z;
  if(approach>-.2&&approach<5.5&&Math.abs(offset)<pen.opening*.5+.95&&sx>.43){
    // A local nudge keeps a sheep that is already moving through the gate from brushing the post.
    const weight=(1-smooth(1.3,5.5,approach))*(1-smooth(pen.opening*.39,pen.opening*.5+.95,Math.abs(offset)));
    sz=mix(sz,clamp(offset*.75,-1.45,1.45),weight*.63);
  }
  if(m.type==='pig'){
    const wet=mudAt(m.x,m.z);
    if(wet){
      const drag=mix(.54,.95,smooth(.36,.91,m.react));
      sx*=drag;sz*=drag;
      if(m.react<.50){
        sx+=(wet[0]-m.x)*.18*(1-m.react*1.9);
        sz+=(wet[1]-m.z)*.18*(1-m.react*1.9);
      }
    }
  }
  const dest=Math.hypot(sx,sz),limit=Math.min(1,trait.max/Math.max(.01,dest));
  m.desiredX=sx*limit;m.desiredZ=sz*limit;
}
const avoidAngles=[0,.30,-.30,.65,-.65,1.01,-1.01,1.43,-1.43,1.79,-1.79];
function constrainedAnimalStep(m,dt){
  const pace=Math.hypot(m.vx,m.vz);
  if(pace<.045){m.speed=0;return;}
  const angle=Math.atan2(m.vx,m.vz),radius=species[m.type]?.radius??.284;
  const lead=.41+Math.min(1.15,pace*.22);
  let chosen=0,best=-Infinity;
  const d0=distance(m,dog);
  for(const offset of avoidAngles){
    const a=angle+offset,ax=Math.sin(a),az=Math.cos(a);
    if(blocked(m.x+ax*lead,m.z+az*lead,radius))continue;
    const turn=Math.cos(offset);
    const dogClear=(distance({x:m.x+ax*lead,z:m.z+az*lead},dog)-d0)/lead;
    const continuity=Math.cos(wrapAngle(a-m.heading));
    const score=turn+.20*continuity+(d0<4?.27:.08)*dogClear;
    if(score>best){chosen=offset;best=score;}
    if(offset===0)break;
  }
  const a=angle+chosen;
  const throttle=best===-Infinity?.41:1-.27*Math.abs(chosen)/1.79;
  step(m,Math.sin(a)*pace*dt*throttle,Math.cos(a)*pace*dt*throttle,dt,radius);
}
function handleFlock(dt){
  let discovery=false;
  for(const m of animals){
    if(m.safe||m.escape)continue;
    const d=distance(dog,m);
    if(m.hidden){
      if(d<7.9&&!m.rustled){
        m.rustled=true;
        setNote(activeMission().track&&!m.tracked?'Tu entends un bêlement. Cherche les empreintes près d’ici.':'Tu entends un bêlement. Aboie près de la cachette.');
        showMessage('Un bêlement tout près…');
        soundEffect('baa');
      }
      continue;
    }
    if(d<16.5&&!m.found){
      m.found=true;
      discovery=true;
      if(returnCount===0&&chapter===0&&gameTime>2){
        setNote('Fais un arc autour du groupe, puis avance derrière lui.');
      }
    }
    flockIntent(m,dt);
  }
  if(discovery)renderCounts();
  for(const m of animals){
    if(m.escape){
      if(!followPath(m,m.escape,5.72,dt)){m.escape=null;m.vx=m.vz=0;}
      continue;
    }
    if(m.hidden)continue;
    if(m.safe){
      if(m.home&&distance(m,m.home)>.32){
        const trail=[m.home];followPath(m,trail,1.95,dt);
      }else m.speed=0;
      continue;
    }
    const blend=1-Math.exp(-dt*(m.react>.1?6.2:3.0));
    m.vx=mix(m.vx,m.desiredX,blend);m.vz=mix(m.vz,m.desiredZ,blend);
    const beforeX=m.x,beforeZ=m.z;
    constrainedAnimalStep(m,dt);
    const creek=activeMission().stream;
    if(creek&&!m.crossed&&m.x>creek.x+creek.width*.5+.2){
      m.crossed=true;runStats.crossed++;renderCounts();
    }
    gateCrossing(m,beforeX,beforeZ);
    if(won)return;
    if(!m.scared&&m.stress>.66&&distance(m,dog)<2.6){
      m.scared=true;runStats.panic++;
    }
    if(m.stress>.74&&distance(m,dog)<2.65&&gameTime>nextCoach){
      nextCoach=gameTime+12;
      setNote('Le troupeau s’affole. Ralentis et prends un peu de recul.');
    }
  }
}

function makeRain(){
  const positions=new Float32Array(124*6),base=[];
  for(let i=0;i<124;i++)base.push([(random()-.5)*42,random()*15,(random()-.5)*39]);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const m=new THREE.LineBasicMaterial({color:'#e4eeea',transparent:true,opacity:.48,depthWrite:false});
  const lines=new THREE.LineSegments(g,m);lines.visible=false;lines.frustumCulled=false;map.add(lines);
  lines.userData.base=base;return lines;
}
function animateRain(time){
  const attr=rain.geometry.attributes.position;
  rain.userData.base.forEach(([x,y,z],i)=>{
    const rise=(y+15000-time*9)%15;
    const xx=dog.x+(x+12600+time*5.3)%42-21,zz=dog.z+z;
    const yy=groundY(xx,zz)+rise;
    attr.setXYZ(i*2,xx,yy,zz);attr.setXYZ(i*2+1,xx-.38,yy+.72,zz-.16);
  });
  attr.needsUpdate=true;
}
function updatePulse(){
  const t=gameTime-barkTime;
  barkRing.visible=t<.58&&!prefersStill;
  if(!barkRing.visible)return;
  const positions=barkRing.geometry.attributes.position;
  const original=geo.ring.attributes.position;
  const extent=.8+t*18;
  for(let i=0;i<positions.count;i++){
    const x=barkOrigin.x+original.getX(i)*extent,z=barkOrigin.z-original.getY(i)*extent;
    positions.setXYZ(i,x,groundY(x,z)+.069,z);
  }
  positions.needsUpdate=true;
  barkRing.material.opacity=(1-t/.58)*.46;
}
const hintVector=new THREE.Vector3();
function updateHint(){
  const label=$('map-label'), compass=$('hint-compass');
  if(!hintObject||gameTime>hintUntil){label.hidden=compass.hidden=true;return;}
  const o=hintObject;
  const depth=(o.x-camera.position.x)*camForward.x+(o.z-camera.position.z)*camForward.z;
  const v=hintVector.set(o.x,groundY(o.x,o.z)+o.height,o.z).project(camera);
  const x=v.x*.5+.5,y=.5-v.y*.5;
  label.style.left=(x*stageWidth)+'px';label.style.top=(y*stageHeight)+'px';
  const range=distance(o,dog);
  const readable=o.label+' · '+Math.round(range)+' m';
  label.textContent=readable;
  label.hidden=depth<.4||x<.14||x>.86||y<.10||y>.79;
  compass.hidden=!label.hidden;
  const angle=Math.atan2(o.x-dog.x,o.z-dog.z)-cameraYaw;
  $('compass-arrow').style.transform='rotate('+(-angle)+'rad)';
  $('compass-distance').textContent=readable;
}
function showHint(){
  if(playPaused())return;
  runStats.help++;
  const config=activeMission();
  const clue=clues.filter(c=>!c.touched).sort((a,b)=>distance(dog,a)-distance(dog,b))[0];
  const remaining=animals.filter(a=>!a.safe);
  const near=remaining.filter(a=>!a.hidden&&!a.escape).sort((a,b)=>distance(dog,a)-distance(dog,b))[0];
  const remote=remaining.slice().sort((a,b)=>distance(dog,a)-distance(dog,b))[0];
  if(clue){
    hintObject={...clue,height:1.61,label:'Empreintes'};
    setNote('Approche et touche Examiner pour suivre la piste.');
  }else if(config.stream&&remaining.some(m=>!m.crossed)){
    const s=config.stream;
    hintObject={x:s.x,z:s.z,height:1.81,label:'Le pont'};
    setNote('Place le groupe dans l’axe du pont avant de le pousser.');
  }else if(near&&distance(dog,near)<17){
    const pen=pens[near.type];
    hintObject={x:pen.left,z:pen.z,height:2.65,label:pen.block?.enabled?'Portillon':pen.label};
    setNote(pen.block?.enabled?'Approche de la poignée et ouvre le portillon.':'Garde les animaux entre Nuage et l’ouverture.');
  }else if(remote){
    hintObject={get x(){return remote.x;},get z(){return remote.z;},height:2.14,label:remote.hidden?'Une cachette':species[remote.type].title};
    setNote(remote.hidden?'Aboie près de la cachette.':'Suis le repère et approche au pas.');
  }
  hintUntil=gameTime+18;
  updateHint();
}
function renderCounts(){
  const target=$('counts');
  const result=Object.entries(pens).map(([type,pen])=>{
    const relevant=animals.filter(a=>a.type===type);
    const n=relevant.filter(a=>a.safe).length;
    return '<div class="counter '+type+'"><canvas data-icon="'+type+'" width="48" height="48" aria-hidden="true"></canvas><span>'+pen.title+'</span><span class="counter-value">'+n+'/'+relevant.length+'</span></div>';
  });
  if(clues.length)result.push('<div class="counter"><span>Pistes</span><span class="counter-value">'+runStats.clues+'/'+clues.length+'</span></div>');
  if(activeMission().stream)result.push('<div class="counter"><span>Pont</span><span class="counter-value">'+runStats.crossed+'/'+animals.length+'</span></div>');
  target.innerHTML=result.join('');
  target.querySelectorAll('canvas').forEach(c=>paintIcon(c,c.dataset.icon));
}

function drawMiniMap(){
  const c=$('mini-map'),ctx=c.getContext('2d');
  const config=levels[chapter],[hx,hz]=config.half;
  const scale=Math.min(185/(hx*2),115/(hz*2));
  const x=n=>110+n*scale,z=n=>76+n*scale;
  ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle='#c4cda6';ctx.beginPath();ctx.roundRect(x(-hx),z(-hz),hx*2*scale,hz*2*scale,15);ctx.fill();
  for(const [px,pz,rx,rz] of config.ponds){
    ctx.fillStyle='#91b3b0';ctx.beginPath();ctx.ellipse(x(px),z(pz),rx*scale,rz*scale,0,0,TAU);ctx.fill();
  }
  for(const [px,pz,rx,rz] of config.groves){
    ctx.fillStyle='#77966867';ctx.beginPath();ctx.ellipse(x(px),z(pz),rx*scale,rz*scale,0,0,TAU);ctx.fill();
  }
  ctx.strokeStyle='#d5bb8b';ctx.lineWidth=3.2;
  for(const trail of config.trails){polyline(ctx,trail,x,z);ctx.stroke();}
  if(config.stream){
    const s=config.stream;
    ctx.fillStyle='#7daca9';ctx.fillRect(x(s.x-s.width*.5),z(-hz),s.width*scale,hz*2*scale);
    ctx.fillStyle='#d7aa71';ctx.fillRect(x(s.x-s.width*.5)-1,z(s.z-s.gap*.5),s.width*scale+2,s.gap*scale);
  }
  for(const c of clues){
    if(c.touched)continue;
    ctx.fillStyle='#a66b3e';ctx.beginPath();ctx.arc(x(c.x),z(c.z),4.6,0,TAU);ctx.fill();
  }
  ctx.fillStyle='#af7861';
  ctx.fillRect(x(config.house[0])-4,z(config.house[1])-3,8,7);
  ctx.lineWidth=2.7;
  for(const [type,p] of Object.entries(pens)){
    ctx.fillStyle={sheep:'#eed49f',duck:'#aed1c1',goat:'#d4a57a',pig:'#dbb1a7'}[type];
    ctx.strokeStyle=type==='sheep'?'#96744e':'#587d71';
    ctx.fillRect(x(p.left),z(p.back),(p.right-p.left)*scale,(p.front-p.back)*scale);
    ctx.strokeRect(x(p.left),z(p.back),(p.right-p.left)*scale,(p.front-p.back)*scale);
  }
  if(hintObject&&gameTime<hintUntil){
    ctx.strokeStyle='#9f5535';ctx.lineWidth=2.8;
    ctx.beginPath();ctx.arc(x(hintObject.x),z(hintObject.z),7.8,0,TAU);ctx.stroke();
  }
  ctx.fillStyle='#244735';ctx.strokeStyle='#fff5de';ctx.lineWidth=2.4;
  const a=cameraYaw;
  ctx.beginPath();
  ctx.moveTo(x(dog.x)+Math.sin(a)*9,z(dog.z)+Math.cos(a)*9);
  ctx.lineTo(x(dog.x)+Math.sin(a+2.4)*6.5,z(dog.z)+Math.cos(a+2.4)*6.5);
  ctx.lineTo(x(dog.x)+Math.sin(a-2.4)*6.5,z(dog.z)+Math.cos(a-2.4)*6.5);
  ctx.closePath();ctx.stroke();ctx.fill();
  ctx.font='700 13px ui-sans-serif, sans-serif';ctx.fillStyle='#3c5a49';ctx.textAlign='center';ctx.fillText('N',201,30);
}

function showMessage(message,duration=2500){
  const node=$('toast');
  clearTimeout(toastId);
  node.textContent=message;node.hidden=false;
  toastId=setTimeout(()=>{node.hidden=true;},duration);
}
function soundEffect(name){
  if(!soundEnabled||!audio||audio.state!=='running')return;
  const t=audio.currentTime;
  const melodies={
    bark:[[155,92,0,.12,'triangle',.19],[170,107,.145,.12,'triangle',.13]],
    score:[[523,526,0,.17,'sine',.12],[659,662,.09,.2,'sine',.12],[784,787,.17,.26,'sine',.1]],
    found:[[440,440,0,.14,'sine',.1],[586,586,.105,.23,'sine',.125]],
    win:[[523,523,0,.19,'triangle',.085],[659,659,.15,.21,'triangle',.083],[784,784,.30,.24,'triangle',.082],[1046,1046,.46,.39,'triangle',.078]],
    baa:[[228,187,0,.26,'triangle',.10],[234,197,.08,.33,'sine',.10]],
    wind:[[180,45,0,.48,'triangle',.065],[103,54,.12,.32,'sine',.075]]
  };
  for(const [hz,end,delay,length,shape,volume] of melodies[name]){
    const oscillator=audio.createOscillator(), gain=audio.createGain(),start=t+delay;
    oscillator.type=shape;
    oscillator.frequency.setValueAtTime(hz,start);
    oscillator.frequency.exponentialRampToValueAtTime(end,start+length);
    gain.gain.setValueAtTime(.0001,start);
    gain.gain.exponentialRampToValueAtTime(volume,start+.018);
    gain.gain.exponentialRampToValueAtTime(.0001,start+length);
    oscillator.connect(gain);gain.connect(audio.destination);
    oscillator.start(start);oscillator.stop(start+length+.02);
  }
}
function openModal(dialog,trigger){
  stopInput();openDialogTrigger=trigger;
  if(!dialog.open)dialog.showModal();
}
const storeKey='petit-berger-mobile-v1';
let profile=readProfile();
let pendingMission=0,gameReady=false, missionEntered=false,noteUntil=0,lastTimer=-1;
function readProfile(){
  const value={last:null,records:{}};
  try{
    const stored=JSON.parse(localStorage.getItem(storeKey)||'null');
    if(!stored||typeof stored!=='object')return value;
    value.last=levels.some(l=>l.id===stored.last)?stored.last:null;
    for(const mission of levels){
      const r=stored.records?.[mission.id];
      if(r&&Number.isInteger(r.stars)&&r.stars>=1&&r.stars<=3&&Number.isFinite(r.time)&&r.time>=0){
        value.records[mission.id]={stars:r.stars,time:r.time};
      }
    }
  }catch{}
  return value;
}
function saveProfile(){
  try{localStorage.setItem(storeKey,JSON.stringify(profile));}catch{}
}
function timeLabel(n){
  const seconds=Math.max(0,Math.floor(n));
  return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
}
function activeMission(){
  return levels[chapter];
}
function recommendedMission(){
  const last=levels.findIndex(level=>level.id===profile.last);
  if(last>=0&&!profile.records[levels[last].id])return last;
  const next=levels.findIndex(level=>!profile.records[level.id]);
  return next<0?Math.max(0,last):next;
}
function playPaused(){
  return won||phonePortrait||!$('home').hidden||document.hidden||Boolean(document.querySelector('dialog[open]'));
}
function setNote(message,duration=8){
  $('mission-note').textContent=message;
  $('notes-wrap').hidden=false;
  noteUntil=gameTime+duration;
}
function refreshTimer(){
  const second=Math.floor(runStats.time);
  if(second===lastTimer)return;
  lastTimer=second;
  $('mission-timer').textContent=timeLabel(second);
  $('mission-timer').dataset.exceeded=String(runStats.time>activeMission().seconds);
}
function updateHome(){
  const records=Object.values(profile.records);
  const stars=records.reduce((total,r)=>total+r.stars,0);
  $('home-progress').textContent=records.length+' / '+levels.length+' missions terminées · '+stars+' / '+levels.length*3+' étoiles';
  $('play').textContent=missionEntered&&!won?'Reprendre la mission':records.length?'Continuer la tournée':'Jouer';
  $('chapters').textContent='Carnet · '+levels.length+' missions';
}
function showHome(){
  stopInput();
  $('home').hidden=false;
  $('stage').inert=true;$('stage').setAttribute('aria-hidden','true');updateOrientation();
  updateHome();
  $('home-title').focus({preventScroll:true});
}
function showField(){
  $('home').hidden=true;
  $('stage').inert=false;$('stage').removeAttribute('aria-hidden');updateOrientation();
  canvas.focus({preventScroll:true});
}
function openBook(trigger){
  populateChapters();
  openModal($('chapter-dialog'),trigger);
}
function openBrief(index,trigger){
  pendingMission=index;
  const config=levels[index];
  $('brief-title').textContent=config.title;
  $('brief-text').textContent=config.description;
  $('brief-note').textContent=config.note;
  $('brief-challenge').textContent='Étoiles bonus · '+timeLabel(config.seconds)+' ou moins · '+config.challenge;
  openModal($('brief-dialog'),trigger);
}
function startMission(index){
  if(!gameReady)return;
  loadLevel(index);
  missionEntered=true;
  profile.last=levels[index].id;saveProfile();
  showField();
}
function openPause(){
  if(playPaused())return;
  const config=activeMission();
  $('pause-goal').textContent=config.description+' '+config.note;
  $('pause-challenge').textContent='Étoiles bonus · '+timeLabel(config.seconds)+' ou moins · '+config.challenge;
  openModal($('pause-dialog'),$('pause'));
}
function extraStar(config,stats){
  switch(config.bonus){
    case 'quiet':return stats.barks===0;
    case 'twoBarks':return stats.barks<=2;
    case 'correct':return stats.wrong===0;
    case 'calm':return stats.panic===0;
    case 'noHelp':return stats.help===0;
    case 'dry':return stats.mud<12;
    default:return false;
  }
}
function finish(){
  won=true;stopInput();
  const config=activeMission();
  const record=profile.records[config.id];
  const elapsed=runStats.time;
  const timeStar=elapsed<=config.seconds,bonusStar=extraStar(config,runStats);
  const stars=1+Number(timeStar)+Number(bonusStar);
  profile.records[config.id]={stars:Math.max(stars,record?.stars||0),time:Math.min(elapsed,record?.time??Infinity)};
  profile.last=config.id;saveProfile();
  $('win-title').textContent='Mission réussie';
  $('win-text').textContent=config.victory+' · '+timeLabel(elapsed);
  $('win-awards').innerHTML='';
  for(const [label,earned] of [['Tous les animaux à l’abri',true],['Terminer en '+timeLabel(config.seconds)+' ou moins',timeStar],[config.challenge,bonusStar]]){
    const row=document.createElement('li'),star=document.createElement('b'),text=document.createElement('span');
    row.dataset.earned=String(earned);
    star.setAttribute('aria-label',earned?'Étoile gagnée':'Étoile non obtenue');star.textContent=earned?'★':'☆';
    text.textContent=label;row.append(star,text);$('win-awards').append(row);
  }
  $('next').textContent=chapter<levels.length-1?'Mission suivante':'Carnet des missions';
  setNote('Tous les animaux sont à l’abri.',4);
  soundEffect('win');openModal($('win-dialog'),canvas);
}
function populateChapters(){
  const container=$('chapter-list');
  container.innerHTML='';
  const records=Object.values(profile.records);
  $('book-progress').textContent=records.length+' missions terminées sur '+levels.length+'. Choisis la prochaine sortie.';
  let region=-1;
  levels.forEach((config,i)=>{
    if(config.region!==region){
      region=config.region;
      const separator=document.createElement('li');separator.className='region-label';separator.textContent=regionNames[region];container.append(separator);
    }
    const li=document.createElement('li'),button=document.createElement('button');
    button.type='button';
    if(i===chapter)button.setAttribute('aria-current','step');
    const record=profile.records[config.id];
    button.innerHTML='<span class="chapter-index" aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+config.title+'</strong><small>'+config.label+'</small></span>'+(record?'<span class="mission-stars" aria-label="'+record.stars+' étoiles sur 3">'+'★'.repeat(record.stars)+'☆'.repeat(3-record.stars)+'</span>':'');
    button.onclick=()=>{
      $('chapter-dialog').close();
      openBrief(i,$('home').hidden?$('pause'):$('chapters'));
    };
    li.append(button);container.append(li);
  });
}
function bindMenu(){
  $('play').onclick=()=>{if(missionEntered&&!won)showField();else openBrief(recommendedMission(),$('play'));};
  $('chapters').onclick=()=>openBook($('chapters'));
  $('pause').onclick=openPause;
  $('hint').onclick=showHint;
  $('interact').onclick=interact;
  $('sky-mode').onclick=changeWeather;
  $('bark').onclick=event=>{if(event.detail===0)bark();};
  $('sprint').onclick=event=>{
    if(playPaused()||event.detail!==0)return;
    sprintToggled=!sprintToggled;
    holdSprint(sprintToggled||sprintPointer!==null);
  };
  $('sound').onclick=async()=>{
    if(!soundEnabled){
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio){$('sound').textContent='Son indisponible';return;}
      try{audio??=new Audio();await audio.resume();}
      catch{$('sound').textContent='Son indisponible';return;}
    }
    soundEnabled=!soundEnabled;
    $('sound').setAttribute('aria-pressed',String(soundEnabled));
    $('sound').textContent=soundEnabled?'Son activé':'Son désactivé';
    if(soundEnabled)soundEffect('found');
  };
  $('start-mission').onclick=()=>{$('brief-dialog').close();startMission(pendingMission);};
  $('resume').onclick=()=>$('pause-dialog').close();
  $('pause-book').onclick=()=>{$('pause-dialog').close();openBook($('pause'));};
  $('restart').onclick=()=>{$('pause-dialog').close();startMission(chapter);};
  $('replay').onclick=()=>{$('win-dialog').close();startMission(chapter);};
  $('home-button').onclick=()=>{$('pause-dialog').close();showHome();};
  $('next').onclick=()=>{
    $('win-dialog').close();
    if(chapter<levels.length-1)openBrief(chapter+1,$('pause'));
    else showHome();
  };
  $('win-dialog').addEventListener('close',()=>{
    if(won&&!document.querySelector('dialog[open]'))showHome();
  });
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('[data-close]').onclick=()=>dialog.close();
    dialog.addEventListener('close',()=>{
      if(!document.querySelector('dialog[open]'))openDialogTrigger?.focus({preventScroll:true});
    });
  });
}

function disposeMap(){
  if(!map)return;
  const geometries=new Set([...Object.values(geo),dogSkinGeometry,wovenGeometry]);
  const materials=new Set([...paintMaterials.values(),eyeMaterial,eyeLight,markerMat,shadowPaint,animalPaint,dogSkinMaterial,wovenMaterial]);
  const textures=new Set([washTexture,shadeTexture]);
  map.traverse(object=>{
    if(object.isInstancedMesh)object.dispose();
    if(object.isSkinnedMesh)object.skeleton.dispose();
    if(object.geometry&&!geometries.has(object.geometry)){
      geometries.add(object.geometry);object.geometry.dispose();
    }
    const m=object.material;
    if(m&&!materials.has(m)){
      materials.add(m);
      if(m.map&&!textures.has(m.map)){textures.add(m.map);m.map.dispose();}
      m.dispose();
    }
  });
  scene.remove(map);
}
function loadLevel(i){
  chapter=i;won=storm=false;gameTime=returnCount=0;barkTime=-10;stormAt=-1;hintUntil=-1;hintObject=null;nextCoach=0;
  stopInput();clearTimeout(toastId);
  runStats=emptyRun();lastTimer=-1;lastInteractionUpdate=-1;
  $('toast').hidden=$('map-label').hidden=$('hint-compass').hidden=true;
  const config=levels[i];
  $('chapter-kicker').textContent='Mission '+String(i+1).padStart(2,'0')+' / '+levels.length;
  $('mission-title').textContent=config.title;
  setNote(config.note,10);
  $('weather').textContent=config.weather;$('weather-icon').textContent=config.icon;
  $('stage').dataset.level=String(chapter);
  random=seeded(config.seed);
  disposeMap();
  const [sx,sz,heading]=config.start;
  map=group(scene);decor=new THREE.Group();props=group(map);shadeDecor=new THREE.Group();
  colliders=[];collisionCells=null;grassBatches=[];waterDetails=[];windmillRotor=null;
  shadowPaint??=new THREE.MeshBasicMaterial({map:shadeTexture,transparent:true,depthWrite:false,opacity:.50,polygonOffset:true,polygonOffsetFactor:-1});
  buildLandData(config);
  land(config);
  pens=buildPens(config);
  buildRules(config);
  decorate(config);
  bakeStatic(decor,map);
  indexColliders();
  grid=createGrid(config);
  dog=makeMover('dog',sx,sz);
  dog.heading=heading;
  cameraReady=false;
  animals=config.animals.map(([type,x,z,hidden,kind],index)=>{
    const m=makeMover(type,x,z,hidden,kind==='lamb'?3:index%7===4?3:index%6===3?2:index%2);
    if(blocked(m.x,m.z,.43)){
      const node=grid[nearestGrid(m)];
      if(node){m.x=node.x;m.z=node.z;}
    }
    m.origin=point(m.x,m.z);
    m.found=!hidden&&distance(dog,m)<17;
    return m;
  });
  rain=makeRain();airborne=makeAirSeeds();shadowStamp=-1;animateWeather(0,true);
  tapMarker=mesh(props,'ring',markerMat,0,0,0,.45,.45,1);
  tapMarker.rotation.x=-Math.PI/2;tapMarker.visible=false;
  const pulseMaterial=new THREE.MeshBasicMaterial({color:'#fff0b1',transparent:true,opacity:.66,side:THREE.DoubleSide,depthWrite:false});
  barkRing=new THREE.Mesh(geo.ring.clone(),pulseMaterial);
  barkRing.frustumCulled=false;barkRing.visible=false;props.add(barkRing);
  animateMover(dog,0);animals.forEach(m=>animateMover(m,0));
  renderCounts();refreshTimer();lastMapTime=-1;resize();drawMiniMap();updateInteraction();
}

function bindInputs(){
  bindMenu();
  document.addEventListener('keydown',event=>{
    if(playPaused()||event.metaKey||event.ctrlKey||event.altKey)return;
    if(event.code==='KeyE'&&!event.repeat){if(interact())event.preventDefault();return;}
    if(event.code==='KeyP'&&!event.repeat){openPause();event.preventDefault();return;}
    if(event.code==='Space'&&!(event.target instanceof HTMLButtonElement)){
      event.preventDefault();if(!event.repeat)bark();
    }
    if(event.code in keyVectors||['ShiftLeft','ShiftRight'].includes(event.code)){
      keys.add(event.code);if(event.code!=='ShiftLeft'&&event.code!=='ShiftRight')event.preventDefault();
    }
  });
  document.addEventListener('keyup',event=>keys.delete(event.code));
  window.addEventListener('blur',stopInput);
  document.addEventListener('visibilitychange',()=>{frameAt=0;if(document.hidden)stopInput();});
  bindTouchControls();
  new ResizeObserver(resize).observe(stage);
}
let frameAt=0;
function frame(now){
  requestAnimationFrame(frame);
  const elapsed=frameAt?clamp((now-frameAt)/1000,0,.25):0;
  frameAt=now;
  if(playPaused())return;
  const dt=clamp(elapsed,.001,.049);
  {
    runStats.time+=elapsed;
    gameTime+=dt;
    steer(dt);handleFlock(dt);
    animateMover(dog,gameTime,dt);
    animals.forEach(m=>{if(!m.hidden)animateMover(m,gameTime,dt);});
    updatePulse();
    $('bark').dataset.cooling=String(gameTime-barkTime<.94);
    if(gameTime>noteUntil)$('notes-wrap').hidden=true;
    refreshTimer();updateGates(dt);
    if(gameTime-lastInteractionUpdate>.11){lastInteractionUpdate=gameTime;updateInteraction();}
  }
  animateWeather(dt);
  if(!prefersStill){
    for(const {marker} of Object.values(pens)){
      const s=.73+Math.sin(gameTime*2.8)*.12;
      marker.scale.set(s,s,1);
    }
    for(const time of waterDetails)time.value=gameTime;
    if(windmillRotor)windmillRotor.rotation.z=gameTime*.48;
    if(storm){
      const elapsed=gameTime-stormAt;
      if(elapsed<7)pens.sheep.gate.rotation.y=-1.43+Math.sin(elapsed*11)*Math.max(0,1-elapsed/4.3)*.28;
    }
  }
  frameCamera(dt);
  updateHint();
  if(gameTime-lastMapTime>.12){
    drawMiniMap();lastMapTime=gameTime;
    for(const b of grassBatches){
      const p=b.boundingSphere.center;
      b.visible=Math.hypot(p.x-dog.x,p.z-dog.z)<(b.geometry===geo.blade?82:114);
    }
  }
  renderer.render(scene,camera);
}

const climates=[
  {name:'Temps clair',icon:'☀',high:'#6d9fbb',low:'#ecdfa9',cloud:'#fff0d2',shade:'#a6b8bf',fog:'#e7dfba',sun:'#fff1d2',ambient:'#cededb',earth:'#ab996b',direction:[-.48,.55,-.67],power:3.35,tint:1.68,rain:0,wind:.53},
  {name:'Heure dorée',icon:'☀',high:'#799bb7',low:'#f7bf89',cloud:'#f8d1ad',shade:'#a197ba',fog:'#e3bc99',sun:'#ffd496',ambient:'#c2c7dd',earth:'#a59167',direction:[-.36,.183,-.90],power:3.05,tint:1.80,rain:0,wind:.70},
  {name:'Pluie de prairie',icon:'≋',high:'#687f99',low:'#b4c0bd',cloud:'#b2bebf',shade:'#6e8495',fog:'#b2bfb7',sun:'#e0e2d4',ambient:'#b6cadd',earth:'#809884',direction:[-.43,.39,-.79],power:.86,tint:2.35,rain:1,wind:1.68}
].map(c=>{
  const spec={...c,sunVector:new THREE.Vector3(...c.direction).normalize()};
  for(const key of ['high','low','cloud','shade','fog','sun','ambient','earth'])spec[key]=new THREE.Color(c[key]);
  return spec;
});
const windClock={value:0},breezeStrength={value:.7},rainAmount={value:0};
let sunLight,skyLight,weatherMode=0,skyUniforms,airborne,weatherName='',shadowStamp=-1,terrainPaint=null;
const shadeDirection=new THREE.Vector3();
function buildSky(config){
  scene.fog=new THREE.FogExp2(config.horizon,.0056*140/config.fog);
  skyUniforms={
    zenith:{value:new THREE.Color('#799bb7')},horizon:{value:new THREE.Color('#f7bf89')},
    cloudLight:{value:new THREE.Color('#f8d1ad')},cloudBase:{value:new THREE.Color('#a197ba')},
    sunDir:{value:new THREE.Vector3(-.36,.183,-.90).normalize()},windClock,breezeStrength,rainAmount
  };
  const material=new THREE.ShaderMaterial({
    uniforms:skyUniforms,side:THREE.BackSide,fog:false,depthWrite:false,
    vertexShader:`varying vec3 ray;
      void main(){
        ray=position;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }`,
    fragmentShader:`varying vec3 ray;
      uniform vec3 zenith,horizon,cloudLight,cloudBase,sunDir;
      uniform float windClock,breezeStrength,rainAmount;
      float grainHash(vec2 v){
        vec3 q=fract(vec3(v.xyx)*.1091);
        q+=dot(q,q.yzx+21.16);
        return fract((q.x+q.y)*q.z);
      }
      float pigment(vec2 v){
        vec2 origin=floor(v), f=fract(v);
        vec2 blend=f*f*(3.0-2.0*f);
        return mix(mix(grainHash(origin),grainHash(origin+vec2(1,0)),blend.x),
          mix(grainHash(origin+vec2(0,1)),grainHash(origin+vec2(1,1)),blend.x),blend.y);
      }
      float washCloud(vec2 p){
        return .53*pigment(p)+.27*pigment(p*2.03+vec2(7.1,13.8))
               +.13*pigment(p*4.18+vec2(17.7,3.6))+.07*pigment(p*8.4);
      }
      void main(){
        vec3 n=normalize(ray);
        float rise=smoothstep(-.065,.61,n.y);
        vec3 sky=mix(horizon,zenith,rise);
        float lightAngle=max(dot(n,sunDir),0.0);
        sky+=vec3(.31,.155,.057)*pow(lightAngle,11.0)*(1.0-rainAmount);
        vec2 drift=vec2(windClock*.015*breezeStrength,windClock*.003);
        vec2 q=n.xz/(max(n.y,.02)+.22)*3.23+drift;
        q+=vec2(.52*pigment(q*1.1),.37*pigment(q*.82+8.2));
        float cloud=washCloud(q);
        float contour=smoothstep(.40-.102*rainAmount,.64-.084*rainAmount,cloud);
        contour*=smoothstep(-.037,.126,n.y);
        vec3 wash=mix(cloudLight,cloudBase,smoothstep(.47,.72,cloud)*.67);
        wash+=vec3(.23,.105,.04)*pow(lightAngle,7.0)*(1.0-rainAmount);
        sky=mix(sky,wash,contour*(.82+.15*rainAmount));
        float sunDisk=smoothstep(.99927,.99962,lightAngle)*(1.0-rainAmount)*(.96-contour*.73);
        sky+=sunDisk*vec3(1.1,.72,.42);
        sky+=vec3(grainHash(gl_FragCoord.xy+2.4)-.5)*.017;
        gl_FragColor=vec4(sky,1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const geometry=new THREE.SphereGeometry(305,24,14);
  const dome=new THREE.Mesh(geometry,material);dome.renderOrder=-25;dome.frustumCulled=false;map.add(dome);
  return dome;
}
function initializeLights(){
  skyLight=new THREE.HemisphereLight('#c2c7dd','#a59167',1.83);
  sunLight=new THREE.DirectionalLight('#ffd496',3.25);
  sunLight.position.set(-20,26,-37);sunLight.castShadow=true;
  sunLight.shadow.mapSize.set(768,768);
  const bounds=sunLight.shadow.camera;
  bounds.left=bounds.bottom=-24.5;bounds.right=bounds.top=24.5;bounds.near=.9;bounds.far=104;bounds.updateProjectionMatrix();
  sunLight.shadow.normalBias=.06;sunLight.shadow.bias=-.00037;sunLight.shadow.radius=2.2;
  scene.add(skyLight,sunLight,sunLight.target);
}
function weatherTarget(){
  return storm&&gameTime-stormAt<26?2:weatherMode?weatherMode-1:levels[chapter].region===2?0:1;
}
function animateWeather(dt,cut=false){
  const preset=climates[weatherTarget()];
  const amount=cut?1:1-Math.exp(-dt*.92);
  if(!prefersStill)windClock.value+=dt;
  rainAmount.value=mix(rainAmount.value,preset.rain,amount);
  breezeStrength.value=mix(breezeStrength.value,preset.wind,amount);
  skyUniforms.zenith.value.lerp(preset.high,amount);
  skyUniforms.horizon.value.lerp(preset.low,amount);
  skyUniforms.cloudLight.value.lerp(preset.cloud,amount);
  skyUniforms.cloudBase.value.lerp(preset.shade,amount);
  skyUniforms.sunDir.value.lerp(preset.sunVector,amount).normalize();
  scene.fog.color.lerp(preset.fog,amount);
  scene.fog.density=mix(scene.fog.density,.00466+rainAmount.value*.0039,amount);
  sunLight.color.lerp(preset.sun,amount);sunLight.intensity=mix(sunLight.intensity,preset.power,amount);
  skyLight.color.lerp(preset.ambient,amount);skyLight.groundColor.lerp(preset.earth,amount);
  skyLight.intensity=mix(skyLight.intensity,preset.tint,amount);
  const condition=storm&&gameTime-stormAt<26?'Une bourrasque':preset.name;
  if(weatherName!==condition){
    weatherName=condition;$('weather').textContent=condition;$('weather-icon').textContent=preset.icon;
  }
  rain.visible=!prefersStill&&rainAmount.value>.30;
  if(rain.visible){rain.material.opacity=.52*rainAmount.value;animateRain(gameTime);}
  if(cut||gameTime-shadowStamp>.10){
    shadowStamp=gameTime;
    const x=Math.round(dog.x*4)*.25,z=Math.round(dog.z*4)*.25,y=groundY(x,z);
    sunLight.target.position.set(x,y,z);
    shadeDirection.copy(skyUniforms.sunDir.value);shadeDirection.y=Math.max(shadeDirection.y,.21);
    sunLight.position.copy(sunLight.target.position).addScaledVector(shadeDirection.normalize(),47);
    sunLight.target.updateMatrixWorld();
    renderer.shadowMap.needsUpdate=true;
  }
  if(airborne){
    airborne.visible=!prefersStill;
    airborne.position.set(dog.x,groundY(dog.x,dog.z),dog.z);
  }
}
function makeAirSeeds(){
  const size=94,points=new Float32Array(size*3),extras=new Float32Array(size);
  for(let i=0;i<size;i++){
    points[i*3]=(random()-.5)*48;points[i*3+1]=random()*8;points[i*3+2]=(random()-.5)*43;
    extras[i]=random();
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(points,3));
  g.setAttribute('seed',new THREE.BufferAttribute(extras,1));
  const m=new THREE.ShaderMaterial({
    uniforms:{windClock,breezeStrength,rainAmount},
    transparent:true,depthWrite:false,
    vertexShader:`attribute float seed; varying float flicker;
      uniform float windClock,breezeStrength;
      void main(){
        vec3 p=position;
        p.x=mod(p.x+24.0+windClock*1.1*breezeStrength,48.0)-24.0;
        p.y+=sin(windClock*(.67+seed)+seed*62.0)*.57;
        p.z+=cos(windClock*.61+seed*29.0)*.7;
        vec4 eye=modelViewMatrix*vec4(p,1.0);
        gl_Position=projectionMatrix*eye;
        gl_PointSize=clamp((32.0+seed*28.0)/max(-eye.z,.4),.9,4.6);
        flicker=(.47+.48*sin(windClock*1.6+seed*41.0))*smoothstep(3.0,9.0,-eye.z)*(1.0-smoothstep(26.0,40.0,-eye.z));
      }`,
    fragmentShader:`varying float flicker; uniform float rainAmount;
      void main(){
        vec2 p=gl_PointCoord-.5;
        float seed=1.0-smoothstep(.18,.50,length(p*vec2(1.1,.86)));
        gl_FragColor=vec4(1.0,.854,.55,seed*flicker*.73*(1.0-rainAmount));
      }`
  });
  const seeds=new THREE.Points(g,m);seeds.frustumCulled=false;map.add(seeds);
  return seeds;
}
function changeWeather(){
  weatherMode=(weatherMode+1)%4;
  $('sky-mode').textContent=weatherMode?climates[weatherMode-1].name:'Météo automatique';
}

async function start(){
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(any-pointer:coarse)').matches?1.25:1.60));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.19;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate=false;
    scene=new THREE.Scene();initializeLights();
    camera=new THREE.PerspectiveCamera(55,1,.07,445);
    await prepareTextures();
    loadLevel(recommendedMission());bindInputs();
    stage.setAttribute('aria-busy','false');
    gameReady=true;$('play').disabled=$('chapters').disabled=false;
    updateHome();
    canvas.addEventListener('webglcontextlost',event=>{
      event.preventDefault();
      $('error').textContent='L’affichage 3D a été interrompu. Recharge la page pour retrouver la ferme.';
      $('error').hidden=false;
    });
    canvas.addEventListener('webglcontextrestored',()=>{$('error').hidden=true;});
    requestAnimationFrame(frame);
  }catch(error){
    console.error(error);
    stage.setAttribute('aria-busy','false');
    $('error').textContent='La ferme 3D ne peut pas s’afficher sur cet appareil. Ouvre le jeu dans un navigateur avec WebGL activé.';
    $('error').hidden=false;
    $('play').textContent='Affichage 3D indisponible';
    $('home-progress').textContent='Ouvre le jeu dans un navigateur compatible WebGL.';
  }
}
$('home').style.setProperty('--cover','url("'+COVER_URL+'")');
stage.inert=true;stage.setAttribute('aria-hidden','true');
start();
