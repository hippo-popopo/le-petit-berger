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
const woodland={
  region:3,biome:'wood',climate:3,place:'La forêt des brumes',weather:'Brume matinale',icon:'≋',
  half:[75,62],start:[1,25,Math.PI],house:[34,-17],seed:1907,
  grass:['#6f8b69','#4f6a50','#94a27c','#537863'],dirt:'#a98865',horizon:'#c7ddd1',sky:'#87aaac',fog:106,
  hills:[[-42,-28,9,19,16],[15,-38,8,25,14],[46,24,9,17,25],[-43,38,5,11,16]],
  ponds:[[-39,13,7,6,-.71]],pens:{sheep:[18,34,-18,-3,-10,5.6],goat:[27,45,15,31,23,5.8]},
  trails:[[[0,61],[0,37],[-2,20],[-1,8],[5,-2],[12,-9],[18,-10],[31,-12]],[[0,11],[-16,0],[-31,-5],[-44,-16],[-59,-31]],[[3,5],[9,14],[18,22],[27,23],[39,22]]],
  groves:[[-26,-24,16,14,17],[-48,-32,10,18,20],[32,-32,11,14,18],[49,29,15,10,15],[-22,34,14,12,14],[-48,0,10,9,12]],
  walls:[[[-30,6],[-24,5],[-18,5]],[[8,-25],[17,-24],[24,-29]]],
  landmarks:[[-39,13,'La mare des fées'],[-43,-29,'Les grands sapins'],[9,-16,'La clairière']]
};
const coast={
  region:4,biome:'coast',climate:4,place:'La côte des salines',weather:'Brise marine',icon:'☀',
  half:[76,57],start:[-26,24,Math.PI],house:[46,-17],seed:2036,
  grass:['#bfc197','#b7bd87','#dbcd9d','#91ab85'],dirt:'#e2cb9e',horizon:'#ddebd9',sky:'#7fbbce',fog:174,
  hills:[[-57,-31,9.5,14,21],[-57,34,5.6,15,23],[46,42,9,20,19],[29,-39,5.3,21,13]],
  ponds:[[-48,-10,10,5.8,-.77],[43,9,8,4.5,-.57]],
  pens:{sheep:[22,39,-15,-1,-8.1,5.7],duck:[25,41,24,37,30,5.9],pig:[28,45,-38,-22,-30.5,5.6]},
  trails:[[[-27,51],[-25,24],[-24,10],[-17,1],[-10,0],[5,0],[19,-7],[22,-8.1],[38,-8],[44,-15]],[[19,-7],[22,12],[23,24],[25,30],[36,30]],[[-24,11],[-41,7],[-51,7],[-60,-15]]],
  groves:[[-54,-31,10,10,6],[46,40,10,8,5],[49,-35,14,8,5],[-38,43,11,5,4]],
  walls:[[[-60,-22],[-53,-25],[-47,-24]],[[7,25],[12,21],[16,20]],[[6,-32],[15,-34],[21,-32]]],
  landmarks:[[-48,-10,'Les salines'],[-58,-34,'Le phare'],[8,24,'Les dunes basses']]
};
const alpine={
  region:5,biome:'snow',climate:5,place:'Le col des neiges',weather:'Neige légère',icon:'❄',
  half:[80,62],start:[-6,28,Math.PI],house:[47,-14],seed:4139,
  grass:['#e4e6de','#bbcdd0','#f3eee2','#ccdbd8'],dirt:'#c4b8a5',horizon:'#dde7ed',sky:'#9ab9d1',fog:131,
  hills:[[-58,-49,25,22,20],[-18,-56,20,22,16],[55,-43,19,23,16],[57,24,11,18,18],[-47,38,10,20,19]],
  ponds:[[-34,-5,8.5,7,-.54]],pens:{sheep:[26,43,-21,-5,-13,6],goat:[22,40,13,29,21,5.7]},
  trails:[[[-6,59],[-6,32],[-5,17],[-6,5],[3,-4],[15,-12],[26,-13],[43,-13]],[[3,-4],[-14,-7],[-24,-16],[-37,-25],[-55,-38]],[[1,11],[11,17],[22,21],[36,22]]],
  groves:[[-28,-28,14,9,11],[40,-36,10,10,9],[-49,25,10,13,10],[49,37,14,9,8]],
  walls:[[[-18,12],[-12,9],[-9,8]],[[2,-23],[9,-27],[16,-31]],[[12,38],[19,35],[26,36]]],
  landmarks:[[-34,-5,'Le lac gelé'],[-43,-29,'Les hauts alpages'],[12,-16,'Le col']]
};
const worldNames=[
  {name:'Les prés',summary:'Du hameau de pierre à la mare aux saules et au val du ruisseau.',terrain:'Prairie'},
  {name:'Le verger',summary:'Un moulin, des pommiers en terrasses et des terres basses boueuses.',terrain:'Verger d’automne'},
  {name:'Les landes',summary:'Une bergerie exposée au vent et trois fermes sur le plateau.',terrain:'Lande humide'},
  {name:'La forêt',summary:'De grandes sapinières, une grotte traversante et deux clairières.',terrain:'Forêt de conifères'},
  {name:'Les salines',summary:'Deux ponts sur le chenal, des levées et des vasières entre les dunes.',terrain:'Littoral atlantique'},
  {name:'Le col',summary:'Un lac gelé, un tunnel sous les Roches Blanches et un col balayé par le vent.',terrain:'Alpage enneigé'}
];
const regionNames=worldNames.map(world=>world.name);
function outing(base,id,title,label,description,note,animals,changes={}){
  return {...base,id,title,label,description,note,animals,seconds:260,challenge:'Aucun aboiement',bonus:'quiet',
    victory:'Tout le troupeau est rentré.',...changes};
}
levels.push(
  outing(woodland,'lisiere','Les brebis de la lisière','Regrouper',
    'Rassemble quatre moutons qui broutent dans deux clairières.',
    'Remonte le sentier pour te placer derrière chaque groupe.',
    [['sheep',-5,7],['sheep',-2,7.8],['sheep',-25,-6],['sheep',-22,-4.8]],
    {pens:{sheep:woodland.pens.sheep},seconds:210}),
  outing(woodland,'sous-bois','Des traces sous les sapins','Pister',
    'Examine deux empreintes et ramène les brebis cachées auprès du troupeau.',
    'Les empreintes sont marquées en ambre sur la carte.',
    [['sheep',-28,-12,'bush'],['sheep',-38,14,'hay'],['sheep',-10,9],['sheep',-8,10]],
    {pens:{sheep:woodland.pens.sheep},track:true,clues:[[-15,-3,0],[-27,18,1]],hideouts:[[-29,-14,'bush'],[-39,16,'hay']],
     challenge:'Sans indice de la boussole',bonus:'noHelp',seconds:300}),
  outing(woodland,'clairiere','La chèvre de la clairière','Séparer',
    'Conduis trois chèvres et trois moutons dans leurs enclos respectifs.',
    'Les chèvres se dispersent vite. Traite un enclos à la fois.',
    [['sheep',1,2],['sheep',-1.8,3.5],['sheep',2.5,5],['goat',1.3,8],['goat',-3,11],['goat',-8,13]],
    {locks:['goat'],challenge:'Aucune erreur d’enclos',bonus:'correct',seconds:330}),
  outing(coast,'maree','Le pont du chenal','Traverser',
    'Fais traverser le chenal à cinq canards et ramène-les au canardier.',
    'Le pont est le seul passage. Aligne le groupe avec son entrée.',
    [['duck',-26,-2],['duck',-30,1],['duck',-22,2],['duck',-36,11],['duck',-32,8]],
    {pens:{duck:coast.pens.duck},stream:{x:-10,width:8,z:0,gap:6.4},seconds:310,challenge:'Sans affoler le troupeau',bonus:'calm'}),
  outing(coast,'roseaux','La cache des roseaux','Explorer',
    'Retrouve deux canards à couvert et rentre le reste de la bande.',
    'Aboie doucement près des roseaux ou approche-toi pour débusquer un canard.',
    [['duck',-6,9],['duck',-2,9.5],['duck',2,11],['duck',-46,-4,'bush'],['duck',9,20,'bush']],
    {pens:{duck:coast.pens.duck},hideouts:[[-47,-6,'bush'],[10,21,'bush']],challenge:'Deux aboiements maximum',bonus:'twoBarks',seconds:310}),
  outing(coast,'dunes','Marais et dunes','Éviter les flaques',
    'Conduis quatre cochons hors des vasières et trois canards au canardier.',
    'Dans la vase, ton chien et les cochons ralentissent. Prends la rive.',
    [['pig',3,-8],['pig',6,-10],['pig',-11,-17],['pig',-8,-17],['duck',2,17],['duck',5,16],['duck',6,19]],
    {pens:{duck:coast.pens.duck,pig:coast.pens.pig},mud:[[4,-10,6,4],[-9,-17,5,3.7]],challenge:'Moins de 12 secondes dans la vase',bonus:'dry',seconds:330}),
  outing(alpine,'gel','Les plaques de gel','Garder son appui',
    'Rentre quatre moutons près du lac gelé.',
    'Sur la glace, anticipe tes virages et relâche le sprint.',
    [['sheep',-13,-6],['sheep',-15,-7],['sheep',-12,-3],['sheep',-19,6]],
    {pens:{sheep:alpine.pens.sheep},ice:[[-12,0,8.5,5.4],[6,-2,5.5,3.8]],seconds:260,challenge:'Moins de 10 secondes sur la glace',bonus:'ice'}),
  outing(alpine,'refuge','Le refuge des cabris','Ouvrir le refuge',
    'Ouvre le refuge et ramène cinq chèvres des hauts pâturages.',
    'Suis les murets et échappe aux pentes les plus raides.',
    [['goat',-24,-24],['goat',-21,-20],['goat',10,-9],['goat',12,-11],['goat',-8,17]],
    {pens:{goat:alpine.pens.goat},locks:['goat'],seconds:325,challenge:'Deux aboiements maximum',bonus:'twoBarks'}),
  outing(alpine,'col','Le dernier passage','Protéger deux troupeaux',
    'Rentre cinq moutons et quatre chèvres avant de quitter le col.',
    'Reste près de la bergerie. Une rafale pourrait faire ressortir une brebis.',
    [['sheep',1,-14],['sheep',4,-12],['sheep',4,-16],['sheep',-15,9],['sheep',-12,8],['goat',-10,-3],['goat',-8,-3],['goat',5,16],['goat',7,16]],
    {gust:true,ice:[[9,7,6.4,3.4],[-19,2,5.9,4]],bonus:'correct',challenge:'Aucune erreur d’enclos',seconds:415})
);
// Each mission has a fixed layout. Regions supply the climate and vegetation palette.
const missionMaps={
  portillon:{
    place:'Le hameau des pierres claires',half:[57,48],seed:71103,start:[-22,27,2.77],house:[36,10],
    hills:[[-36,-25,7,18,16],[22,-33,6,16,14],[-4,34,4,19,10]],
    ponds:[[-37,18,6.8,5.7,-.52]],pens:{sheep:[20,33,-7,8,.6,6.3]},
    trails:[[[-22,36],[-22,19],[-21,4],[-14,-8],[-1,-5],[12,.6],[20,.6],[29,.6],[35,8]]],
    groves:[[-39,-17,9,12,10],[40,-18,8,13,9],[7,32,14,9,9]],
    walls:[[[-38,-4],[-32,-6],[-25,-6]],[[-10,9],[-6,13],[2,13]],[[14,-18],[21,-16],[28,-16]]],
    landmarks:[[-32,-14,'Le hameau'],[8,-12,'Les murs de pierre sèche']],
    animals:[['sheep',-18,3],['sheep',-20.4,6],['sheep',-16.5,5],['sheep',-23,-13],['sheep',-19,-12]]
  },
  tri:{
    place:'La mare aux saules',half:[68,55],seed:71111,start:[-28,19,2.27],house:[45,21],
    hills:[[-46,-34,5.8,18,18],[36,-37,6.5,21,17],[-12,41,4.7,18,14],[45,39,4.2,17,14]],
    ponds:[[0,0,9.3,6.2,-.81],[43,-28,7.2,4.5,-.65]],pens:{sheep:[24,40,-23,-10,-16.5,6.3],duck:[26,42,18,32,25,6.2]},
    trails:[[[-32,28],[-25,12],[-16,2],[-9,-9],[5,-12],[24,-16.5],[35,-17]],[[-16,2],[-10,11],[9,17],[26,25],[40,24]]],
    groves:[[-30,-20,12,10,10],[43,-9,10,8,8],[-38,39,12,10,10]],
    walls:[[[-10,-29],[1,-28],[12,-25]],[[13,30],[17,34],[26,37]]],
    landmarks:[[-4,7,'La mare aux saules'],[32,-30,'La prairie sèche']],
    animals:[['sheep',-23,-4],['sheep',-20,-6],['sheep',-22,0],['sheep',-18,-1],['duck',-20,5],['duck',-18,6],['duck',-15,4]]
  },
  ruisseau:{
    place:'Le val du ruisseau',half:[73,51],seed:71141,start:[-47,32,2.83],house:[48,-31],
    hills:[[-49,-24,8.5,14,12],[-47,37,5.4,16,14],[32,-34,5.6,20,17],[37,32,7.5,23,14]],
    ponds:[[47,20,8.4,5.6,-.62]],pens:{sheep:[29,45,-25,-10,-17.5,6.1]},
    stream:{x:1,width:9,z:5,gap:6.8},
    trails:[[[-48,36],[-41,17],[-28,8],[-16,5],[-5,5],[7,5],[17,-3],[29,-17.5],[43,-21]]],
    groves:[[-38,-33,11,10,9],[-36,33,13,10,10],[43,32,7,9,8],[24,-34,10,10,8]],
    walls:[[[-49,5],[-43,7],[-34,7]],[[12,-27],[19,-27],[25,-29]]],
    landmarks:[[-32,-13,'La berge ouest'],[17,12,'Le val']],
    animals:[['sheep',-27,3],['sheep',-24,6],['sheep',-30,7],['sheep',-38,-1],['sheep',-34,-4]]
  },
  empreintes:{
    place:'Le verger en terrasses',half:[75,56],seed:71229,start:[-52,16,2.85],house:[49,23],mill:[-26,-40],
    hills:[[-45,-36,10,24,16],[-16,-24,5.2,17,15],[25,-39,8,17,15],[42,36,6.4,20,16]],
    ponds:[[35,5,8,5.5,-.65]],pens:{sheep:[27,46,-12,4,-3.5,6.5]},
    trails:[[[-55,36],[-52,17],[-50,2],[-43,-10],[-33,-18],[-18,-20],[-5,-14],[8,-13],[19,-7],[27,-3.5],[41,-3]],
      [[-18,-20],[-20,-34],[-26,-39]],[[-6,-14],[-3,5],[-15,18],[-26,24]]],
    groves:[[-48,-21,12,10,17],[-29,-16,10,10,12],[-7,-31,10,11,12],[25,-31,10,10,9],[48,28,12,10,12]],
    walls:[[[-57,-1],[-48,-2],[-40,-4]],[[-37,-9],[-30,-11],[-20,-12]],[[-16,-16],[-11,-18],[-4,-17]],[[1,8],[12,8],[17,12]]],
    landmarks:[[-36,-17,'Les pommiers en terrasses'],[-26,-40,'Le moulin des hauteurs']],
    hideouts:[[-43,-20,'bush'],[-26,-32,'hay'],[-21,25,'bush']],
    clues:[[-44,-10,0],[-19,-24,1],[-11,14,2]],
    description:'Suis les empreintes des trois brebis éparpillées dans le verger, puis ramène-les avec les agneaux.',
    note:'Les moutons sont marqués en blanc sur la carte. Examine les traces ambrées si tu veux un repère de direction.',
    animals:[['sheep',-42,-17],['sheep',-24,-29],['sheep',-19,25],['sheep',-17,5,null,'lamb'],['sheep',-14,6,null,'lamb']]
  },
  boue:{
    place:'Les terres basses',half:[61,49],seed:71263,start:[-37,26,2.94],house:[34,-30],mill:null,
    hills:[[-46,-29,6,17,15],[44,-34,5.2,18,13],[-42,30,4.8,14,13],[39,32,4,18,15]],
    ponds:[[-11,-9,7.5,5,-.67],[9,17,5.2,7,-.63]],pens:{pig:[26,44,1,16,8.2,6]},
    trails:[[[-39,35],[-36,18],[-30,8],[-23,3],[-13,3],[-5,-2],[7,-2],[18,4],[26,8.2],[42,9]]],
    groves:[[-37,-26,13,12,11],[-5,-32,14,10,10],[39,30,10,9,9],[38,-37,10,9,8]],
    walls:[[[-31,-8],[-26,-12],[-21,-13]],[[19,-19],[21,-12],[24,-8]]],
    landmarks:[[-20,8,'Les terres basses'],[5,-21,'Le sentier sec']],
    mud:[[-26,8,6.2,4.1],[-7,1,5.4,3.8],[13,3,5.5,4.1]],
    animals:[['pig',-26,9],['pig',-23,7],['pig',-10,.6],['pig',-6,1.3]]
  },
  derniertour:{
    place:'Le plateau des trois fermes',half:[88,67],seed:71352,start:[-48,26,2.71],house:[57,-9],
    hills:[[-47,-42,10,22,18],[-5,-38,5.4,16,14],[45,-53,7.2,23,15],[-52,47,5.4,22,14],[50,41,8,22,14]],
    ponds:[[-30,1,9.9,7.4,-.79],[26,23,7.7,6.4,-.62]],
    pens:{sheep:[26,45,-32,-17,-24.5,6.0],duck:[35,53,24,42,33,6.2],goat:[26,46,-3,13,5,6.2]},
    trails:[[[-51,38],[-46,16],[-40,-5],[-24,-16],[-6,-14],[10,-20],[26,-24.5],[44,-26]],
      [[-6,-14],[1,1],[12,3],[26,5],[42,6]],[[1,1],[4,21],[14,34],[35,33],[51,34]]],
    groves:[[-56,-22,13,14,11],[-17,-36,11,14,10],[-32,43,15,12,12],[55,38,10,12,10],[45,-49,12,12,10]],
    walls:[[[-26,-24],[-17,-22],[-10,-23]],[[2,13],[11,12],[18,10]],[[-6,33],[-5,40],[5,46]]],
    landmarks:[[-25,-28,'La lande haute'],[5,29,'Les fermes du plateau']],
    animals:[['sheep',-30,-14],['sheep',-26,-12],['sheep',-24,-18],['sheep',-20,-16],
      ['duck',-22,22],['duck',-20,24],['duck',-19,20],['goat',-32,9],['goat',-35,12],['goat',-37,9]]
  },
  'sous-bois':{
    title:'Les brebis sous la roche',place:'Le vallon de la Grotte',half:[77,63],seed:71478,start:[-43,17,2.42],house:[46,28],
    label:'Traverser une grotte',
    description:'Deux brebis se tiennent sous une arche rocheuse. Passe sous la montagne et ramène-les avec le reste du troupeau.',
    note:'La grotte a deux ouvertures. Approche par l’entrée ouest et pousse les brebis vers la lumière.',
    hills:[[-47,-35,12,17,18],[-11,-30,10,22,14],[17,41,7,19,12],[49,-25,10,15,18]],
    ponds:[[-30,29,8.5,6,-.62]],pens:{sheep:[27,43,6,21,13.3,6.4]},
    trails:[[[-43,35],[-43,16],[-40,1],[-36,-9],[-27,-10],[-17,-10],[-5,-9],[10,-1],[27,13.3],[42,14]],
      [[-6,-9],[5,-21],[21,-26],[35,-28]]],
    groves:[[-47,-26,11,12,18],[-21,-35,13,12,17],[-16,28,13,12,19],[38,-22,14,13,15],[48,39,11,10,16]],
    walls:[[[-48,-12],[-43,-15],[-39,-16]],[[5,15],[12,16],[19,19]]],
    landmarks:[[-29,-17,'La grotte des sapins'],[11,-16,'Le sentier forestier']],
    cave:{x:-22,z:-10,length:16,width:7.8,height:5.15},
    clues:[[-40,-7,0],[-34,-10,1]],hideouts:[],
    animals:[['sheep',-25,-11.2],['sheep',-20,-8.7],['sheep',2,-1],['sheep',5,1.3]]
  },
  clairiere:{
    place:'Les deux clairières',half:[76,56],seed:71499,start:[-41,-1,1.31],house:[50,18],
    hills:[[-48,-35,10,17,15],[-5,-37,7,17,15],[31,34,10,19,17],[-37,34,7,16,16]],
    ponds:[[2,-5,9,6.5,-.69]],pens:{sheep:[20,38,-30,-15,-22.5,6],goat:[31,48,13,30,21.5,6.5]},
    trails:[[[-52,1],[-39,0],[-23,-7],[-16,-16],[-.5,-21],[20,-22.5],[35,-22]],
      [[-24,-7],[-17,4],[-8,13],[9,16],[31,21.5],[45,22]]],
    groves:[[-49,-29,12,12,14],[-33,25,12,14,17],[12,31,16,13,14],[41,-40,14,9,15],[53,3,9,13,15]],
    walls:[[[-18,-27],[-7,-24],[4,-23]],[[12,21],[19,19],[25,19]]],
    landmarks:[[-26,-21,'La clairière haute'],[-20,17,'La clairière des chèvres']],
    animals:[['sheep',-22,-12],['sheep',-20,-10],['sheep',-25,-14],['goat',-22,7],['goat',-19,9],['goat',-24,8]]
  },
  maree:{
    place:'Le chenal aux deux ponts',label:'Choisir la traversée',
    description:'Fais traverser le chenal à cinq canards. Choisis l’un des deux ponts et ramène-les au canardier.',
    note:'La passerelle sud est plus large. Aligne les canards avec l’entrée avant de les pousser.',
    stream:{x:-10,width:8,z:0,gap:6.4,alternate:{z:19,gap:8.8}},
    trails:[[[-31,-16],[-28,-4],[-17,0],[-5,0],[12,6],[25,30],[36,30]],
      [[-32,42],[-24,26],[-16,19],[-5,19],[11,23],[25,30]]]
  },
  roseaux:{
    place:'Les îlots des roseaux',half:[72,61],seed:71522,start:[-45,4,1.75],house:[47,-28],
    hills:[[-56,-35,8,18,14],[-54,40,5.6,14,18],[43,40,6.9,18,15],[42,-43,5.5,22,14]],
    ponds:[[-20,-13,12.5,8.2,-.81],[-18,9,11.1,8.1,-.72],[13,12,9.9,7.5,-.70]],
    pens:{duck:[25,42,-19,-4,-11.5,6.4]},
    trails:[[[-49,1],[-34,-1],[-19,-1],[-4,-1],[8,-2],[25,-11.5],[37,-11]],
      [[-32,-4],[-34,-19],[-26,-27],[-12,-26],[4,-16]]],
    groves:[[-49,-27,10,11,6],[-49,28,11,10,5],[37,26,12,12,7],[59,-4,9,17,8]],
    walls:[[[-30,-30],[-24,-30],[-19,-30]],[[1,-9],[9,-12],[15,-14]]],
    landmarks:[[-12,-2,'La levée des roseaux'],[14,17,'La mare des dunes']],
    hideouts:[[-28,-26,'bush'],[-1,20,'bush']],
    label:'Suivre une levée',description:'Rassemble cinq canards séparés par des mares. Guide-les le long de la levée de terre.',
    note:'Entre les deux mares, resserre le groupe sur le sentier et avance dans son axe.',
    animals:[['duck',-40,-1],['duck',-37,-2],['duck',-34,-.5],['duck',-26,-24],['duck',-4,9]]
  },
  dunes:{
    place:'La dune et les vasières',half:[81,62],seed:71555,start:[-48,29,2.7],house:[51,7],
    hills:[[-52,-32,12.5,17,19],[-17,-42,8,20,15],[27,-42,6.8,19,18],[42,41,9,22,15],[-43,41,4,14,13]],
    ponds:[[-33,14,9.9,6.3,-.74],[1,-2,7.6,5.5,-.76]],
    pens:{duck:[26,42,25,41,33,6.5],pig:[31,49,-29,-14,-21.5,6.2]},
    trails:[[[-49,37],[-43,29],[-28,26],[-15,17],[-7,9],[9,9],[19,24],[26,33],[42,34]],
      [[9,9],[13,-7],[19,-17],[31,-21.5],[46,-20]]],
    groves:[[-53,-35,10,11,5],[-7,-34,11,9,6],[40,-31,13,12,8],[56,24,10,10,7]],
    walls:[[[-20,-19],[-11,-19],[-7,-17]],[[9,37],[17,39],[25,42]]],
    landmarks:[[-37,-13,'Le versant des dunes'],[-11,16,'Les vasières']],
    mud:[[-20,5,6,4.7],[-7,-16,5.8,3.7],[19,-10,4.4,4.2]],
    animals:[['pig',-21,6],['pig',-18,4],['pig',-9,-15],['pig',-5,-16],['duck',-23,26],['duck',-20,24],['duck',-17,24]]
  },
  refuge:{
    place:'Le refuge des Roches Blanches',half:[72,57],seed:71646,start:[-42,14,2.21],house:[46,-25],
    hills:[[-46,-40,22,19,16],[7,-35,13,19,16],[48,-35,17,16,16],[-34,37,11,16,16],[39,35,12,17,14]],
    ponds:[[1,23,7.5,5.5,-.68]],pens:{goat:[26,45,-17,0,-8.5,6.7]},
    trails:[[[-49,26],[-42,14],[-36,7],[-28,2],[-18,2],[-8,2],[5,1],[15,-5],[26,-8.5],[43,-9]]],
    groves:[[-46,-22,10,13,12],[-41,33,10,9,10],[17,-31,10,9,9],[37,28,15,10,10]],
    walls:[[[-38,16],[-29,19],[-20,19]],[[5,-21],[13,-20],[18,-20]]],
    landmarks:[[-26,-5,'Les Roches Blanches'],[26,-21,'Le refuge']],
    cave:{x:-17,z:2,length:14,width:6.8,height:4.7},
    note:'Traverse le tunnel des Roches Blanches, puis ouvre le portillon du refuge.',
    animals:[['goat',-21,.5],['goat',-16,3.1],['goat',-12,1],['goat',2,-9],['goat',7,-11]]
  },
  col:{
    place:'La traversée du grand col',half:[89,69],seed:71676,start:[-52,31,2.66],house:[52,-28],
    hills:[[-52,-44,27,21,18],[-17,-58,17,22,15],[28,-46,24,21,20],[57,-31,13,16,19],[-45,42,11,19,15],[51,38,13,21,17]],
    ponds:[[-25,-4,10,7.1,-.79],[16,21,7.4,5.5,-.67]],pens:{sheep:[29,49,-24,-8,-16,6.3],goat:[35,53,24,41,32.5,6.8]},
    trails:[[[-56,40],[-50,25],[-39,11],[-24,12],[-13,6],[-7,-6],[10,-12],[29,-16],[44,-16]],
      [[-13,6],[-6,20],[1,31],[16,33],[35,32.5],[53,33]]],
    groves:[[-47,-21,12,10,14],[-37,39,14,11,12],[44,-39,13,10,11],[53,43,9,11,12]],
    walls:[[[-30,24],[-22,23],[-14,21]],[[10,-31],[17,-30],[23,-31]]],
    landmarks:[[-25,8,'Le lac des crêtes'],[-4,-21,'Le passage du vent']],
    ice:[[-12,5,6.6,4.1],[12,-10,6.7,4.5]],
    animals:[['sheep',-30,10],['sheep',-27,12],['sheep',-24,11],['sheep',-11,-9],['sheep',-8,-10],
      ['goat',-24,22],['goat',-21,21],['goat',-22,25],['goat',-17,21]]
  }
};
for(const level of levels)Object.assign(level,missionMaps[level.id]);

const bonusRoutes=[
  {id:'bonus-pres',title:'La grande prairie',count:32,meeting:[-28,2],to:[47,1],half:[66,45],seed:72017,
    groups:[[-28,2],[-39,-13],[-43,15]]},
  {id:'bonus-verger',title:'La récolte des brebis',count:40,meeting:[-38,-7],to:[60,-3],half:[83,53],seed:72043,
    groups:[[-38,-7],[-50,-23],[-57,-5],[-45,11]]},
  {id:'bonus-landes',title:'La longue lande',count:44,meeting:[-44,5],to:[64,-3],half:[87,61],seed:72083,
    groups:[[-44,5],[-54,-15],[-61,19]]},
  {id:'bonus-foret',title:'La clairière sans fin',count:48,meeting:[-49,-12],to:[68,-1],half:[94,60],seed:72109,
    groups:[[-49,-12],[-59,-31],[-71,-16],[-61,6]]},
  {id:'bonus-salines',title:'La plaine des marées',count:56,meeting:[-40,1],to:[72,9],half:[100,56],seed:72149,
    groups:[[-40,1],[-51,-16],[-56,6],[-46,21]]},
  {id:'bonus-col',title:'La grande descente',count:64,meeting:[-56,0],to:[79,-5],half:[105,64],seed:72161,
    groups:[[-56,0],[-60,-24],[-72,-13],[-78,6],[-62,21]]}
];
function bigFlockMission(base,region,route){
  const [x,z]=route.meeting,[tx,tz]=route.to,[hx,hz]=route.half;
  const count=route.count;
  const spread=seeded(route.seed);
  const animals=route.groups.flatMap(([gx,gz],groupId)=>{
    const size=Math.floor(count/route.groups.length)+Number(groupId<count%route.groups.length);
    const columns=Math.ceil(Math.sqrt(size*1.28)),rows=Math.ceil(size/columns);
    return Array.from({length:size},(_,i)=>['sheep',
      gx+(i%columns-(columns-1)/2)*1.46+(spread()-.5)*.49,
      gz+(Math.floor(i/columns)-(rows-1)/2)*1.5+(spread()-.5)*.53,null,null,groupId
    ]);
  });
  const opening=13+region*1.4;
  return outing(base,route.id,route.title,'Grand rassemblement',
    'Depuis l’enclos, va chercher les '+route.groups.length+' groupes. Réunis les '+count+' moutons, puis ramène le troupeau.',
    'Repère les groupes sur la carte. Contourne-les pour les pousser les uns vers les autres.',
    animals,{
      region,place:route.title,half:route.half,seed:route.seed,bigFlock:true,bonus:'calm',challenge:'Sans affoler le troupeau',
      victory:'Les '+count+' moutons sont à l’abri.',start:[tx-3.4,tz,-Math.PI/2],house:[tx+6,tz-24],mill:null,
      gathering:{count:route.groups.length,meeting:{x,z}},
      hills:[[-hx*.63,-hz*.73,5+region*1.21,21,12],[hx*.20,-hz*.79,5.4+region*1.3,28,16],
        [-hx*.30,hz*.77,4.1+region*.77,23,16],[hx*.53,hz*.74,5.8+region*1.40,26,16]],
      ponds:[],pens:{sheep:[tx,tx+18,tz-opening*.5-5,tz+opening*.5+5,tz,opening]},
      trails:[[[x,z],[mix(x,tx,.34),mix(z,tz,.34)],[mix(x,tx,.68),mix(z,tz,.68)],[tx,tz],[tx+14,tz]],
        ...route.groups.slice(1).map(([gx,gz])=>[[gx,gz],[mix(gx,x,.5),mix(gz,z,.5)],[x,z]])],
      groves:[[-hx*.35,-hz*.77,22,11,10],[hx*.36,-hz*.72,25,11,12],[hx*.06,hz*.78,28,11,12]],
      walls:[],landmarks:[[mix(x,tx,.62),mix(z,tz,.62)-16,'Grand enclos →']],
      hideouts:[],locks:['sheep'],clues:[],stream:null,cave:null,mud:[],ice:[],gust:false,track:false
    });
}
for(const [region,route] of bonusRoutes.entries()){
  const base=[...regions,woodland,coast,alpine][region];
  const last=levels.findLastIndex(level=>level.region===region);
  levels.splice(last+1,0,bigFlockMission(base,region,route));
}

const newBiomes=[
  {name:'Le bocage',terrain:'Haies et chemins creux',biome:'bocage',climate:3,grass:['#96a06c','#b2bc86','#7e956e','#a6ad78'],dirt:'#b59772',horizon:'#d9ddbf',sky:'#91adb0',fog:96},
  {name:'Les marais',terrain:'Canaux et roselières',biome:'marsh',climate:4,grass:['#9ca875','#bdc28b','#829c80','#aeb688'],dirt:'#c4b58b',horizon:'#dce4bd',sky:'#93b9bd',fog:122},
  {name:'La garrigue',terrain:'Terrasses de calcaire',biome:'garrigue',climate:1,grass:['#b8ab70','#d4c491','#a0a57b','#c4b680'],dirt:'#c39369',horizon:'#f2d5a5',sky:'#a5bbc4',fog:148}
];
const sheepAt=points=>points.map(([x,z,lamb])=>['sheep',x,z,null,lamb?'lamb':null]);
const newValleys=[
  [
    {id:'bergerie-des-haies',title:'Derrière les haies',label:'Approcher au pas',
      description:'Ramène trois brebis et deux agneaux.',note:'Approche les agneaux au pas et attends près d’eux. Ils te suivront si tu restes calme.',
      half:[56,44],seed:83301,start:[-31,22,2.1],house:[36,17],pen:[22,39,-15,2,-6.5,7.4],
      hills:[[-32,-32,7,17,14],[-4,-27,4,18,12],[39,-27,9,16,14],[-39,35,5,14,12]],
      ponds:[[-18,23,5.2,3.8,.15]],groves:[[-40,-15,11,14,13],[25,-28,14,11,14],[7,32,14,9,15]],
      walls:[[[-25,3],[-21,-1],[-13,-4]],[[6,13],[11,12],[17,11]]],
      trails:[[[-43,28],[-31,22],[-27,11],[-20,6],[-8,4],[5,-2],[22,-6.5],[35,-6.5]], [[-8,4],[-11,-6],[-12,-18]]],
      animals:sheepAt([[-19,7],[-16,6],[-13,8],[-11,-12,true],[-9,-10,true]]),
      features:[[3,22,'hedge'],[-33,-3,'hedge'],[11,-17,'trough']], seconds:250},
    {id:'loup-chemin-creux',title:'Le loup du chemin creux',label:'Protéger le troupeau',
      description:'Rentre six brebis en surveillant la lisière.',note:'Un loup attend avant de charger. Approche et aboie pour le faire reculer.',
      half:[64,50],seed:83327,start:[-37,16,1.9],house:[45,7],pen:[29,47,-21,-3,-12,8.2],
      hills:[[-46,-29,10,19,17],[-14,-35,7,16,15],[11,32,11,28,12],[43,-39,8,18,14]],
      ponds:[[16,20,7.0,4.0,-.35]],groves:[[-43,-22,14,13,16],[-16,39,13,7,12],[12,-33,17,9,15],[49,31,9,12,9]],
      walls:[[[-33,-9],[-27,-10],[-21,-9]],[[0,14],[7,14],[11,11]]],
      trails:[[[-53,23],[-36,15],[-21,9],[-13,2],[-1,-5],[13,-11],[29,-12],[44,-12]], [[-13,2],[-14,-11],[-10,-21]]],
      animals:sheepAt([[-22,6],[-19,7],[-15,5],[-8,4],[-6,1],[-3,2]]),wolves:[[-14,-19]],
      features:[[-38,-14,'hedge'],[22,-22,'trough'],[-10,27,'hedge']],bonus:'guard',challenge:'Aucune charge au milieu du troupeau',seconds:315},
    {id:'bergerie-des-deux-haies',title:'Les deux lisières',label:'Garder les agneaux près de soi',
      description:'Protège quatre brebis et quatre agneaux sur le chemin de la bergerie.',note:'Les agneaux suivent au pas. Place-toi entre les loups et le troupeau pour aboyer à portée.',
      half:[69,55],seed:83359,start:[-35,25,2.0],house:[44,26],pen:[34,52,-2,18,8,9.3],
      hills:[[-48,-25,9,20,17],[-17,-36,10,18,16],[39,-39,10,19,20],[22,40,5,18,12],[-48,38,7,13,14]],
      ponds:[[-2,29,6,6,.45]],groves:[[-44,-22,13,12,17],[2,-37,18,11,17],[43,-24,14,12,13],[-38,42,12,9,8]],
      walls:[[[-30,15],[-24,14],[-17,10]],[[-7,-6],[2,-7],[8,-6]],[[21,19],[27,19],[30,18]]],
      trails:[[[-51,27],[-35,25],[-25,19],[-21,7],[-9,1],[9,0],[20,5],[34,8],[50,8]], [[-21,7],[-25,-8],[-28,-24]],[[20,5],[18,-8],[16,-22]]],
      animals:sheepAt([[-26,4],[-24,6],[-19,4],[-16,3],[-28,-6,true],[-26,-7,true],[-1,3,true],[2,4,true]]),
      wolves:[[-13,-23],[20,-19]],features:[[-43,7,'hedge'],[15,32,'hedge'],[8,12,'trough']],
      bonus:'guard',challenge:'Aucune charge au milieu du troupeau',seconds:415}
  ],
  [
    {id:'vanne-des-saules',title:'La vanne des saules',label:'Ouvrir un raccourci',
      description:'Ouvre la vanne et ramène six brebis de l’autre rive.',note:'Actionne le levier au bord du passage. Le grand pont reste ouvert au sud.',
      half:[63,49],seed:83513,start:[-38,1,1.55],house:[48,-23],pen:[29,45,-11,6,-2.5,8],
      hills:[[-41,-35,4,18,15],[39,-35,5,24,14],[37,32,4,17,15],[-41,35,3.6,13,12]],
      ponds:[[-32,-24,6.5,3.7,.45],[26,24,6.5,5,-.4]],groves:[[-41,-23,10,13,11],[26,-26,13,11,11],[41,34,11,8,7]],
      walls:[[[-40,16],[-34,19],[-27,19]],[[18,-20],[23,-21],[29,-21]]],
      trails:[[[-48,1],[-28,1],[-17,-3],[-5,-3],[9,-3],[29,-2.5],[43,-2.5]], [[-27,3],[-16,23],[-5,24],[9,24],[18,16],[22,2]]],
      animals:sheepAt([[-28,-4],[-25,-4],[-22,-4],[-20,0],[-24,1],[-26,3]]),
      stream:{x:1,width:8,z:24,gap:9,alternate:{z:-3,gap:9}},ford:true,requireFord:true,features:[[-13,-14,'reeds'],[14,11,'reeds'],[-18,26,'shelter']],
      bonus:'calm',challenge:'Sans affoler le troupeau',seconds:330},
    {id:'halte-roseliere',title:'La halte de la roselière',label:'Passer par une halte',
      description:'Fais passer les moutons par la halte avant de rentrer.',note:'La zone balisée sur la carte doit accueillir toutes les brebis. La bergerie s’ouvrira ensuite.',
      half:[70,52],seed:83549,start:[-41,-19,1.25],house:[51,18],pen:[31,50,-15,7,-4,9],
      hills:[[-48,-31,5,19,13],[-4,-39,5,21,11],[35,-32,6,19,14],[-23,38,3,19,10]],
      ponds:[[-17,-2,8.8,5.6,.19],[23,19,9.5,4.4,-.33]],groves:[[-33,31,13,9,8],[41,29,12,9,8],[-35,-32,13,10,12]],
      walls:[[[-24,24],[-17,25],[-9,24]],[[14,-14],[23,-16],[26,-15]]],
      trails:[[[-48,-20],[-30,-20],[-27,-11],[-30,5],[-20,14],[-4,13],[10,10],[21,2],[31,-4],[48,-4]]],
      animals:sheepAt([[-34,-15],[-31,-15],[-30,-12],[-28,-10],[-33,-11],[-29,-15],[-26,-13]]),
      relay:[[-7,13,9,'La roselière']],features:[[-21,11,'reeds'],[5,25,'reeds'],[7,-18,'shelter']],
      bonus:'calm',challenge:'Sans affoler le troupeau',seconds:370},
    {id:'canaux-du-soir',title:'Les canaux du soir',label:'Choisir la traversée',
      description:'Conduis huit brebis au-delà des canaux et fais halte sur la levée.',note:'Passe par le grand pont au nord ou ouvre le raccourci au sud. La halte est rive est.',
      half:[77,58],seed:83587,start:[-57,26,1.9],house:[52,-31],pen:[39,56,8,26,17,9],
      hills:[[-53,-35,5,18,16],[-39,40,4,20,13],[26,-37,6,22,16],[57,38,6,17,13]],
      ponds:[[-33,26,6.1,5.1,.4],[18,-21,6.2,5.6,-.3]],groves:[[-54,40,13,9,10],[31,-39,14,10,13],[55,-5,10,14,8]],
      walls:[[[-45,3],[-38,0],[-30,0]],[[26,33],[33,33],[36,29]]],
      trails:[[[-58,28],[-50,17],[-32,14],[-19,12],[-12,14],[-2,14],[18,14],[39,17],[54,17]], [[-32,14],[-24,-8],[-15,-24],[-2,-24],[13,-24],[18,-5],[18,14]]],
      animals:sheepAt([[-44,11],[-42,12],[-40,10],[-38,11],[-33,12],[-31,11],[-29,13],[-26,11]]),
      stream:{x:-7,width:8,z:-24,gap:8.5,alternate:{z:14,gap:9.5}},ford:true,relay:[[18,14,9,'La levée']],
      features:[[-18,30,'reeds'],[11,28,'reeds'],[25,-27,'shelter']],bonus:'calm',challenge:'Sans affoler le troupeau',seconds:455}
  ],
  [
    {id:'terrasses-chaudes',title:'Les terrasses chaudes',label:'Contourner les murets',
      description:'Rassemble six brebis dispersées entre les terrasses.',note:'Les murets ont deux ouvertures. Repère-les sur la carte avant de rabattre le troupeau.',
      half:[62,48],seed:83811,start:[-36,-18,1.05],house:[45,20],pen:[28,44,-13,4,-4.5,8.4],
      hills:[[-44,26,9,16,15],[-16,-35,9,21,14],[18,-35,8,15,12],[37,30,7,19,18]],ponds:[],
      groves:[[-39,28,13,8,10],[8,-32,16,9,13],[53,-15,7,12,8]],
      walls:[[[-32,-8],[-25,-6],[-17,-6],[-11,-6]],[[-4,-6],[3,-5],[10,-5],[17,-3]],[[-25,13],[-16,13],[-7,14]],[[0,14],[9,15],[20,15]]],
      trails:[[[-51,-24],[-36,-19],[-20,-16],[-8,-10],[-7,2],[4,2],[17,-1],[28,-4.5],[41,-4.5]], [[-7,2],[-4,11],[-4,20],[3,23]]],
      animals:sheepAt([[-24,-13],[-21,-13],[-18,-14],[-9,6],[-6,7],[-5,8]]),
      features:[[-12,26,'cairn'],[4,-22,'cairn'],[20,-21,'trough']],bonus:'calm',challenge:'Sans affoler le troupeau',seconds:325},
    {id:'grande-arche',title:'Sous la grande arche',label:'Traverser le défilé',
      description:'Sors cinq brebis du défilé et ramène les deux agneaux du versant est.',note:'La gorge traverse la roche. Ralentis près des agneaux pour qu’ils te suivent.',
      half:[74,54],seed:83849,start:[-34,11,2.36],house:[55,-19],pen:[36,52,-7,14,3.5,9.1],
      hills:[[-48,-29,13,17,16],[-8,-32,9,21,15],[35,-33,12,17,14],[-30,40,9,18,13],[44,34,6,15,12]],
      ponds:[[9,30,5.8,4.1,.28]],groves:[[-47,25,11,9,10],[31,-40,15,12,12],[-35,-39,15,12,12]],
      walls:[[[-36,-11],[-31,-15],[-26,-15]],[[19,13],[25,12],[32,13]]],
      trails:[[[-50,20],[-39,17],[-34,11],[-30,4],[-19,-1],[-5,-1],[7,-1],[21,0],[36,3.5],[50,3.5]], [[17,0],[19,-13],[22,-21]]],
      animals:sheepAt([[-28,-1],[-25,-1],[-22,0],[-20,1],[-17,0],[19,-15,true],[22,-17,true]]),
      cave:{x:-6,z:-1,length:18,width:8.2,height:6.5},
      features:[[-18,19,'cairn'],[29,-18,'trough'],[6,10,'cairn']],bonus:'calm',challenge:'Sans affoler le troupeau',seconds:400},
    {id:'transhumance-des-cretes',title:'La transhumance des crêtes',label:'Relier deux refuges',
      description:'Conduis neuf brebis par les deux haltes jusqu’à la bergerie.',note:'Commence à l’abreuvoir, puis passe sous l’arche. Défends le troupeau dès qu’un loup s’approche.',
      half:[84,63],seed:83903,start:[-64,18,1.85],house:[60,33],pen:[44,62,7,29,18,9.9],
      hills:[[-58,-32,10,20,17],[-15,-41,15,19,18],[42,-38,12,18,16],[-57,40,10,18,16],[30,48,9,20,15]],
      ponds:[[-25,25,7,4.8,.3],[23,-26,6.5,4.1,-.28]],groves:[[-59,-31,12,13,12],[31,-47,13,8,11],[57,42,11,10,12]],
      walls:[[[-54,0],[-49,-5],[-43,-5]],[[19,1],[25,2],[32,5]],[[5,32],[17,36],[23,36]]],
      trails:[[[-65,21],[-50,15],[-38,14],[-30,10],[-16,7],[-3,9],[9,9],[24,12],[44,18],[59,18]], [[-30,10],[-27,-7],[-20,-24]],[[24,12],[29,-1],[33,-15]]],
      animals:sheepAt([[-54,14],[-51,15],[-49,13],[-46,12],[-43,12],[-41,15],[-56,8],[-54,8,true],[-51,7,true]]),
      relay:[[-31,10,8.9,'L’abreuvoir'],[10,9,9.6,'La sortie de l’arche']],
      cave:{x:-4,z:9,length:14,width:8.7,height:6.0},wolves:[[-35,-14],[29,-10]],
      features:[[-32,20,'trough'],[-36,-11,'cairn'],[18,28,'cairn'],[48,-17,'cairn']],
      bonus:'guard',challenge:'Aucune charge au milieu du troupeau',seconds:515}
  ]
];
const valleyBonuses=[
  {id:'bonus-bocage',title:'Le grand pré des haies',count:64,meeting:[-50,3],to:[73,-8],half:[102,63],seed:83911,groups:[[-50,3],[-54,-18],[-66,-5],[-66,14],[-56,22]]},
  {id:'bonus-marais',title:'Les prés de la digue',count:72,meeting:[-49,-3],to:[76,10],half:[104,62],seed:83933,groups:[[-49,-3],[-57,-23],[-64,-9],[-65,11],[-52,21]]},
  {id:'bonus-garrigue',title:'La dernière transhumance',count:80,meeting:[-60,1],to:[83,-5],half:[112,67],seed:83969,groups:[[-60,1],[-64,-23],[-76,-11],[-77,10],[-62,24]]}
];
for(const [offset,biome] of newBiomes.entries()){
  const region=worldNames.length;
  worldNames.push(biome);
  regionNames.push(biome.name);
  const base={...biome,region,weather:['Brume légère','Vent des marais','Soleil bas'][offset],icon:['≋','≋','☀'][offset]};
  for(const entry of newValleys[offset]){
    const {id,title,label,description,note,animals,pen,...details}=entry;
    levels.push(outing(base,id,title,label,description,note,animals,{
      place:biome.name,pens:{sheep:pen},landmarks:[],bonus:'calm',challenge:'Sans affoler le troupeau',...details
    }));
  }
  levels.push(bigFlockMission(base,region,valleyBonuses[offset]));
}
const routeById=id=>levels.find(level=>level.id===id);
const atlasNames=['Les prés','Verger','Landes','Forêt','Salines','Le col','Bocage','Marais','Garrigue','Les îles','Volcan'];
const grazingAreas={
  portillon:[[-36,-16],[-16,22],[6,-24]],
  tri:[[-40,-25],[-31,18],[-13,-28],[6,9]],
  ruisseau:[[-58,-21],[-48,28],[-28,-7],[-19,27]],
  cabris:[[-57,-22],[-33,23],[-12,-26],[4,23]],
  boue:[[-47,-19],[-31,15],[-9,-22],[8,14]],
  rafale:[[-49,-24],[-32,24],[-14,-18],[6,24]],
  derniertour:[[-64,-38],[-51,38],[-29,-16],[-6,37],[10,-40]],
  lisiere:[[-43,-17],[-31,22],[-7,-23]],
  clairiere:[[-52,-32],[-42,30],[-16,-24],[-4,22],[12,-12]],
  maree:[[-43,-29],[-50,28],[-29,3],[-25,-24]],
  dunes:[[-57,-21],[-42,30],[-20,-30],[-8,21],[14,-10]],
  gel:[[-48,-17],[-29,24],[-10,-27],[1,15]],
  refuge:[[-47,-23],[-35,24],[-12,-28],[12,17]],
  col:[[-63,-24],[-49,34],[-28,-30],[-14,29],[12,-27]],
  'bergerie-des-haies':[[-39,-17],[-32,16],[-12,-17],[-6,17]],
  'loup-chemin-creux':[[-37,9],[-21,-9],[-3,5],[9,-19]],
  'bergerie-des-deux-haies':[[-46,-12],[-34,21],[-21,-13],[-4,17],[12,-18]],
  'vanne-des-saules':[[-45,-23],[-36,12],[-25,-11],[-19,17]],
  'canaux-du-soir':[[-52,-24],[-46,21],[-29,-12],[-27,15]],
  'terrasses-chaudes':[[-48,-27],[-39,23],[-21,-18],[-5,20],[10,-17]],
  'grande-arche':[[-42,-13],[-29,5],[-11,-1],[17,-13],[24,21]],
  'transhumance-des-cretes':[[-58,-19],[-47,14],[-36,-13],[-25,27],[-8,5]]
};
function assignPastures(config,areas){
  const n=config.animals.length,total=Math.min(n,areas.length),base=Math.floor(n/total);
  let index=0;
  config.pastures=total;
  config.animals=areas.slice(0,total).flatMap(([x,z],i)=>{
    const count=base+Number(i<n%total);
    return Array.from({length:count},(_,slot)=>{
      const [type,,,hidden,kind,pack]=config.animals[index++];
      return [type,x+(slot%3-.7)*1.78,z+Math.floor(slot/3)*1.8+(slot%2)*1.30,hidden,kind,pack];
    });
  });
}
for(const [id,areas] of Object.entries(grazingAreas))assignPastures(routeById(id),areas);

function extendWorld(region,mission){
  const before=levels.findIndex(level=>level.region===region&&level.bigFlock);
  levels.splice(before,0,mission);
}
const brooks=routeById('canaux-du-soir');
extendWorld(7,outing(brooks,'crue-des-marais','La crue des marais','Choisir une rive',
  'Rassemble quinze brebis en trois pâtures. Traverse le canal et fais halte sur la levée.',
  'Le pont nord reste praticable. La vanne donne un raccourci, mais le passage prend l’eau quand la pluie arrive.',
  sheepAt([[-53,-30],[-51,-31],[-49,-29],[-52,-27],[-47,-29],
    [-52,4],[-49,5],[-47,6],[-46,4],[-43,7,true],[-32,22],[-30,23],[-29,21],[-26,22,true],[-29,24,true]]),{
    place:'Les marais de la Haute Levée',dispatch:'Lise, la bergère des marais, t’attend sur la grande levée.',seed:98201,pastures:3,start:[-59,20,2.38],house:[53,-29],
    stream:{x:-7,width:8,z:-24,gap:9.6,alternate:{z:14,gap:10.4}},
    relay:[[22,14,10.5,'La levée des Saules']],requireFord:false,ford:true,eventWeather:'flood',
    dangers:[['flood',-7,14,7.1,4.6,35]],fieldOrders:['gather','hold'],bonus:'calm',challenge:'Sans affoler les brebis',seconds:525,
    features:[[-20,31,'reeds'],[12,-8,'reeds'],[22,26,'shelter'],[-22,-32,'trough']]
  }));
const hedges=routeById('bergerie-des-deux-haies');
extendWorld(6,outing(hedges,'la-garde-des-lisieres','La garde des trois lisières','Repousser la meute',
  'Rentre douze brebis et agneaux dispersés avant que la meute puisse les isoler.',
  'Deux loups peuvent attaquer de côtés différents. Le point rouge sur la carte signale une brebis à sauver. Aboie à portée.',
  sheepAt([[-54,27],[-51,26],[-48,27,true],[-34,-16],[-31,-15],[-28,-16,true],
    [-8,18],[-6,17],[-3,18,true],[10,-11],[13,-13],[15,-11]]),{
    place:'Les prés de la Haute Haie',dispatch:'La meute rôde depuis l’aube. Lise te confie le troupeau pendant qu’elle ouvre la bergerie.',half:[77,63],seed:98209,pastures:4,start:[-58,12,.73],
    house:[53,32],pens:{sheep:[38,58,-1,22,10,9.4]},
    trails:[[[-60,14],[-44,16],[-30,22],[-12,19],[15,11],[38,10],[54,10]],[[-44,16],[-37,-2],[-29,-19],[-19,-35]],[[15,11],[17,-6],[13,-16],[9,-30]]],
    wolves:[[-46,3],[-25,27],[-16,-26]],lethalPack:true,fieldOrders:['gather','hold'],seconds:550,
    bonus:'guard',challenge:'Aucune charge au milieu du troupeau'
  }));
const ridges=routeById('transhumance-des-cretes');
extendWorld(8,outing(ridges,'deux-troupeaux-aux-cretes','Deux troupeaux aux crêtes','Apprendre le tri',
  'Sépare sept brebis et six chèvres réparties dans quatre pâtures.',
  'Ouvre les enclos puis utilise le sifflet. « Trier » tient une espèce à distance pendant que tu pousses l’autre.',
  [...sheepAt([[-54,17],[-50,17],[-36,-15],[-16,30],[2,-22],[6,-24],[9,-24]]),
   ['goat',-52,14],['goat',-37,-17],['goat',-34,-16],['goat',-16,26],['goat',-11,28],['goat',8,-21]],{
    seed:98213,place:'Le partage des Crêtes',dispatch:'Lise t’a préparé deux enclos. Elle t’offre son foulard si chaque animal trouve le bon.',pastures:4,start:[-59,9,1.10],house:[57,28],
    pens:{sheep:[41,59,7,28,17,9.9],goat:[39,56,-31,-14,-22.5,8.5]},
    relay:null,cave:{x:-6,z:10,length:16,width:8.7,height:6},wolves:null,locks:['goat'],
    fieldOrders:['gather','hold','sort'],seconds:520,bonus:'correct',challenge:'Aucune erreur d’enclos'
  }));

const dreamWorlds=[
  {name:'Les îles de brume',terrain:'Pâturages suspendus',biome:'cloud',climate:6,grass:['#96b9aa','#b9cebb','#a4b9bc','#d5d9bb'],dirt:'#c5c6bb',horizon:'#e1eded',sky:'#8ec2d4',fog:137,
    weather:'Voiles de brume',icon:'≋'},
  {name:'Le volcan des braises',terrain:'Vallée de basalte',biome:'ember',climate:7,grass:['#837d70','#aa9080','#6c7564','#ad9b80'],dirt:'#a7735f',horizon:'#eac2ac',sky:'#9c92b8',fog:151,
    weather:'Cendres au couchant',icon:'☀'}
];
const dreamRoutes=[
  [
    {id:'brume-premiere-ile',title:'Le pré au-dessus du ciel',label:'Traverser la brume',half:[64,50],seed:98311,start:[-49,17,1.99],house:[47,-17],pen:[31,48,-10,8,-1,9.2],
      hills:[[-51,-32,7,14,16],[-23,-33,6,17,14],[18,37,8,18,16],[50,29,6,12,16]],
      trails:[[[-54,19],[-39,11],[-22,6],[-6,-1],[14,-2],[31,-1],[45,-1]],[[-22,6],[-29,-12],[-25,-27]],[[13,-2],[9,17],[10,25]]],
      groves:[[-46,-33,9,8,8],[42,30,9,11,8]],walls:[[[-43,2],[-36,0],[-30,1]],[[8,28],[16,28],[24,25]]],
      animals:sheepAt([[-45,11],[-42,10],[-33,-18],[-29,-20],[-23,-20],[4,18],[7,20,true],[10,21,true]]),
      description:'Ramène huit brebis et agneaux sur la première île.',note:'Les moutons s’enfoncent dans les bancs de nuages. Ils restent visibles sur la carte.',
      dangers:[['cloud',-26,-11,11,8,0],['cloud',2,16,10,9,13]],pastures:3,seconds:360},
    {id:'brume-la-passerelle',title:'La passerelle des alizés',label:'Rassembler sur deux rives',half:[76,56],seed:98333,start:[-51,25,2.63],house:[49,27],pen:[36,54,-8,12,2,9.6],
      hills:[[-55,-35,7,18,14],[-36,43,9,16,12],[44,-40,12,18,13],[60,31,9,13,16]],
      trails:[[[-57,27],[-42,21],[-24,22],[-8,21],[10,21],[23,14],[36,2],[50,2]],[[-42,21],[-36,-4],[-23,-19],[-8,-17],[7,-17],[21,-16],[23,14]]],
      groves:[[-53,-29,13,12,9],[42,-31,11,12,10]],walls:[[[-55,-4],[-47,-4],[-39,-1]],[[16,7],[21,8],[26,6]]],
      animals:sheepAt([[-51,15],[-48,14],[-45,16],[-46,-20],[-43,-20],[-40,-22],[-24,-17],[-21,-15],[17,24],[20,25,true]]),
      description:'Rentre dix brebis en choisissant une des deux passerelles.',note:'Les bancs de nuages dérivent. Immobilise le groupe d’un côté du pont le temps d’aller chercher les retardataires.',
      stream:{x:-1,width:10,z:21,gap:9.4,alternate:{z:-17,gap:8.6}},dangers:[['cloud',-22,18,10,7,0],['cloud',14,-17,9,7,17]],
      fieldOrders:['gather','hold'],pastures:4,seconds:440},
    {id:'brume-les-trois-plateaux',title:'Au-dessus des trois plateaux',label:'Escorter dans les nuages',half:[85,64],seed:98357,start:[-68,24,2.03],house:[57,-19],pen:[42,62,7,27,17,10.6],
      hills:[[-64,-38,11,15,17],[-25,-52,10,20,15],[23,-47,13,19,17],[49,45,11,22,15],[-62,44,7,18,11]],
      trails:[[[-72,24],[-57,23],[-39,18],[-24,10],[-10,9],[7,10],[24,16],[42,17],[58,17]],
        [[-39,18],[-41,-8],[-36,-30]],[[-24,10],[-28,30],[-18,40]],[[7,10],[5,-12],[14,-28]]],
      groves:[[-53,-36,12,12,10],[-38,39,12,9,12],[41,-38,13,8,9]],walls:[[[-48,-13],[-41,-13],[-34,-10]],[[19,25],[28,24],[34,21]]],
      animals:sheepAt([[-61,15],[-59,15],[-55,15],[-49,-25],[-46,-27],[-43,-28],
        [-25,31],[-22,33],[-21,31],[-27,33,true],[-3,-20],[-1,-23],[5,-22,true],[7,-21,true]]),
      description:'Fais passer les quatorze brebis par les deux haltes, puis rejoins le refuge.',note:'Amène les groupes à la première halte avant de traverser le tunnel de brume.',
      relay:[[-29,11,10.8,'Le cairn des alizés'],[20,13,11.3,'La prairie blanche']],cave:{x:-2,z:10,length:14,width:9.2,height:6.4},
      dangers:[['cloud',-40,9,11,8,13],['cloud',10,0,11,9,0],['cloud',-18,27,10,7,26]],fieldOrders:['gather','hold'],pastures:4,seconds:620}
  ],
  [
    {id:'braises-le-refuge',title:'Le refuge des braises',label:'Lire les signes du volcan',half:[68,55],seed:98413,start:[-50,18,2.4],house:[45,22],pen:[32,51,-11,10,-.5,9.6],
      hills:[[-49,-35,10,17,15],[-17,-41,18,19,16],[33,-35,12,19,15],[48,37,11,17,13]],
      trails:[[[-55,20],[-40,12],[-27,7],[-10,17],[10,15],[23,7],[32,-.5],[46,-.5]],[[-27,7],[-24,-4],[-16,-13],[-3,-15],[15,-12],[23,7]]],
      groves:[],walls:[[[-46,-2],[-39,-3],[-33,-3]],[[4,24],[14,23],[21,20]]],
      animals:sheepAt([[-45,11],[-41,10],[-38,9],[-40,-23],[-37,-22],[-33,-25],[-16,26],[-13,27,true],[-10,28,true]]),
      description:'Abandonne les zones chaudes à temps et ramène neuf brebis au refuge.',note:'Les évents grondent avant d’entrer en éruption. Contourne les zones orange quand elles s’allument.',
      dangers:[['lava',-9,-1,12,6,0],['vent',-25,10,6.8,5.0,12],['vent',19,-12,7,6,19]],pastures:3,seconds:410},
    {id:'braises-deux-vallees',title:'Deux vallées de cendre',label:'Protéger et trier',half:[77,62],seed:98431,start:[-65,26,2.16],house:[56,7],
      pen:[39,58,14,32,23,9.2],pens:{sheep:[39,58,14,32,23,9.2],goat:[38,57,-30,-12,-21,8.4]},
      hills:[[-58,-31,11,17,17],[-30,-50,21,24,15],[22,-47,15,22,17],[42,47,10,20,16]],
      trails:[[[-69,30],[-50,17],[-28,11],[-17,18],[4,23],[21,22],[39,23],[54,23]],
        [[-28,11],[-18,-9],[-4,-26],[12,-25],[25,-22],[38,-21],[56,-21]]],
      groves:[],walls:[[[-53,9],[-48,7],[-43,7]],[[13,9],[22,9],[27,8]],[[10,-33],[19,-33],[24,-31]]],
      animals:[...sheepAt([[-57,18],[-54,18],[-51,19],[-48,-15],[-44,-15],[-40,-12],[1,26,true]]),
        ['goat',-31,13],['goat',-28,15],['goat',-16,-20],['goat',-13,-21],['goat',9,-29],['goat',11,-27]],
      description:'Mets les brebis et les chèvres à l’abri dans deux vallées.',note:'Les deux sentiers entourent le cœur chaud. Siffle pour garder une espèce en place pendant le tri.',
      dangers:[['lava',1,-1,13,11,0],['vent',-19,-8,7.7,5.5,18],['vent',15,22,7.5,5.5,27]],fieldOrders:['gather','hold','sort'],pastures:5,
      seconds:525,bonus:'correct',challenge:'Aucune erreur d’enclos'},
    {id:'braises-derniere-traversee',title:'La dernière traversée',label:'Mener la grande évacuation',half:[91,66],seed:98457,start:[-72,27,2.29],house:[67,-26],pen:[51,70,-3,20,8.5,11.4],
      hills:[[-64,-37,14,17,17],[-26,-47,21,20,16],[18,-47,20,20,16],[51,43,13,20,15],[-55,44,10,22,14]],
      trails:[[[-76,29],[-55,19],[-41,17],[-26,23],[-9,24],[7,20],[26,11],[51,8.5],[66,8.5]],
        [[-41,17],[-38,-5],[-24,-22],[-5,-23],[10,-21],[18,-12],[26,11]],[[26,11],[30,-7],[39,-24]]],
      groves:[],walls:[[[-61,-8],[-53,-8],[-45,-11]],[[11,29],[18,28],[25,24]],[[38,23],[45,22],[49,20]]],
      animals:sheepAt([[-65,16],[-62,16],[-58,17],[-57,20],[-51,-23],[-48,-24],[-45,-24],[-43,-22,true],
        [-35,35],[-32,35],[-29,34],[-25,35],[-8,-20],[-5,-21],[-1,-23,true],[20,15],[24,14],[27,14,true]]),
      description:'Évacue dix-huit brebis par les deux abris de basalte.',note:'Les éruptions sont brèves. Tu peux mettre un groupe en attente près d’un abri et aller chercher le suivant.',
      relay:[[-37,16,12,'L’abri bas'],[30,10,12,'L’abri haut']],dangers:[['lava',-12,-1,18,11,0],['vent',-22,25,8,5.8,18],['vent',13,-20,7.5,6.2,28],['vent',40,4,8.4,5.1,37]],
      fieldOrders:['gather','hold'],pastures:5,seconds:660}
  ]
];
const dreamBonuses=[
  {id:'bonus-brume',title:'Les quatre prés du ciel',count:72,meeting:[-47,5],to:[76,-6],half:[104,63],seed:98491,groups:[[-47,5],[-60,-12],[-64,8],[-59,23]]},
  {id:'bonus-braises',title:'La plaine de basalte',count:96,meeting:[-54,2],to:[86,0],half:[115,68],seed:98501,groups:[[-54,2],[-62,-18],[-74,-6],[-71,13],[-53,24]]}
];
for(const [i,biome] of dreamWorlds.entries()){
  const region=worldNames.length,base={...biome,region};
  worldNames.push(biome);regionNames.push(biome.name);
  for(const entry of dreamRoutes[i]){
    const {id,title,label,description,note,animals,pen,...rest}=entry;
    levels.push(outing(base,id,title,label,description,note,animals,{
      place:biome.name,pens:{sheep:pen},ponds:[],landmarks:[],bonus:'park',challenge:'Garder les brebis hors des zones dangereuses',...rest
    }));
  }
  levels.push(bigFlockMission(base,region,dreamBonuses[i]));
}

const repairs=[
  {id:'bergerie',count:3,title:'Une bergerie remise en état',hint:'Sifflet de rassemblement disponible.'},
  {id:'clos',count:7,title:'Le clos d’entraînement',hint:'Ordre Tenir et sortie d’entraînement débloqués.'},
  {id:'grenier',count:12,title:'Le grenier des bergers',hint:'Ordre Trier et contrat de transhumance débloqués.'}
];
const contractPlans=[
  {id:'clos-entrainement',base:'tri',title:'Le clos d’entraînement',label:'Atelier · Rassembler et trier',gate:7,seed:98513,
    description:'Sépare les moutons et les canards au sifflet dans ce parcours d’entraînement.',
    note:'Approche du troupeau et entraîne-toi à tenir une espèce pendant que tu guides l’autre.',fieldOrders:['gather','hold','sort'],climate:0,
    animals:[...sheepAt([[-13,-6],[-10,-5],[-7,-6],[-6,-2]]),['duck',-12,-3],['duck',-9,-2],['duck',-7,-3]],
    locks:[],pastures:1,bonus:'correct',challenge:'Aucune erreur d’enclos'},
  {id:'contrat-aurore',base:'refuge',title:'Les cabris à l’aurore',label:'Alpage · Ciel clair',gate:0,seed:98521,climate:1,
    description:'Retrouve les chèvres dispersées aux deux entrées du tunnel et au pied des crêtes.',note:'Le portail du refuge est fermé au départ.',
    animals:[['goat',-47,-27],['goat',-44,-26],['goat',-18,2],['goat',-15,2],['goat',4,24],['goat',6,25]],pastures:3},
  {id:'contrat-brume',base:'brume-la-passerelle',title:'Le pont dans les nuages',label:'Îles · Pont fermé',gate:0,seed:98533,ford:true,
    description:'Rassemble sept brebis et ouvre la passerelle nord si tu veux éviter le détour.',
    note:'Le pont sud reste ouvert. Repère les nuages sur la carte.',fieldOrders:['gather','hold'],
    animals:sheepAt([[-52,22],[-49,20],[-46,20],[-36,-26],[-33,-26],[-26,-7],[-23,-8,true]]),pastures:3},
  {id:'contrat-pluie',base:'crue-des-marais',title:'Le fossé sous la pluie',label:'Marais · Crue et halte',gate:0,seed:98543,climate:2,
    description:'Conduis deux groupes dans la pluie. Fais passer les moutons sur la levée avant le retour.',
    note:'Le pont nord reste ouvert pendant la crue.',animals:sheepAt([[-47,-26],[-44,-24],[-42,-25],[-39,-23],[-38,15],[-36,16],[-32,17],[-29,18,true]]),pastures:2},
  {id:'contrat-meute',base:'la-garde-des-lisieres',title:'Les loups au crépuscule',label:'Bocage · Meute',gate:3,seed:98563,climate:1,
    description:'Protège dix brebis dispersées à la tombée du jour.',note:'Une prise laisse quelques secondes pour repousser le loup.',
    animals:sheepAt([[-54,18],[-51,17],[-49,17],[-43,-9],[-39,-9],[-34,-8],[-9,14],[-7,14],[-4,15],[10,-13,true]]),pastures:4},
  {id:'contrat-transhumance',base:'braises-derniere-traversee',title:'La transhumance des cendres',label:'Volcan · Longue traversée',gate:12,seed:98611,climate:7,
    dispatch:'Depuis le grenier des bergers, Lise te confie la traversée des cendres.',description:'Collecte les brebis dans quatre pâtures et conduis-les par les deux abris.',note:'Les abris balisés restent sûrs. Les évents se rallument après chaque accalmie.',
    animals:sheepAt([[-68,-24],[-65,-25],[-62,-24],[-60,-23],[-56,-22],[-53,-21],[-49,22],[-46,23],[-42,24],[-40,24],[-36,24],[-32,34],
      [-9,-22],[-7,-22],[-4,-22],[-2,-21],[1,-23],[3,-24],[13,17],[16,17],[18,18],[20,17,true],[22,17,true],[25,18,true]]),pastures:4,seconds:750}
];
for(const plan of contractPlans){
  const {base,...details}=plan;
  levels.push({...routeById(base),...details,side:true,place:'Carnet de sorties',bigFlock:false,gathering:null});
}
// Coordinates are fractions of the playable width or depth. Each named place
// owns one terrain; its second outing can change livestock and field rules.
const terrainPatterns={
  valley:{
    route:[[-.88,.37],[-.65,.21],[-.34,.10],[-.08,-.06],[.20,-.11],[.44,-.13]],
    pens:[.50,-.13],groups:[[-.71,.14],[-.47,-.40],[-.39,.45],[-.13,.13]],
    knolls:[[-.65,-.66,6,.22,.24],[.14,-.70,8,.27,.25],[-.34,.69,4,.29,.21],[.53,.61,6,.24,.21]],
    ponds:[[-.09,-.45,.12,.10,.27]],walls:[[[-.56,.36],[-.45,.30],[-.33,.29]],[[.08,.27],[.22,.28],[.29,.34]]]
  },
  lake:{
    route:[[-.85,.45],[-.64,.40],[-.43,.34],[-.16,.33],[.12,.41],[.38,.29]],
    pens:[.46,.26],groups:[[-.67,.24],[-.51,-.47],[-.19,.47],[.13,-.41]],
    knolls:[[-.68,-.70,8,.26,.23],[.21,-.61,7,.21,.23],[.65,.55,5,.25,.24]],
    ponds:[[-.18,-.045,.23,.22,-.37]],walls:[[[-.69,-.10],[-.62,-.13],[-.49,-.13]],[[.21,-.16],[.27,-.20],[.34,-.23]]],
    sideRoute:[[-.65,.36],[-.56,-.44],[-.21,-.45],[.22,-.46],[.38,.29]]
  },
  terraces:{
    route:[[-.83,.48],[-.61,.39],[-.40,.33],[-.28,.13],[-.03,.15],[.19,-.12],[.45,-.28]],
    pens:[.51,-.28],groups:[[-.69,.13],[-.47,-.43],[-.27,.36],[.12,-.36]],
    knolls:[[-.62,-.64,9,.22,.26],[-.03,-.52,7,.22,.25],[.43,.68,5,.21,.22]],
    ponds:[],walls:[[[-.65,.23],[-.55,.18],[-.39,.18]],[[-.22,.18],[-.03,.21],[.05,.21]],[[-.52,-.19],[-.31,-.23],[-.16,-.25]],[[.06,-.31],[.20,-.31],[.34,-.36]]]
  },
  gorge:{
    route:[[-.86,.46],[-.60,.31],[-.38,.05],[-.20,0],[.12,0],[.29,.11],[.48,.20]],
    pens:[.54,.20],groups:[[-.66,.25],[-.55,-.39],[-.26,.11],[.17,-.37]],
    knolls:[[-.54,-.58,10,.21,.24],[-.05,-.62,13,.23,.25],[-.24,.66,9,.28,.19],[.59,.66,7,.25,.20]],
    ponds:[],walls:[[[-.59,-.18],[-.49,-.16],[-.40,-.14]],[[.24,.36],[.33,.37],[.37,.35]]],
    cave:{x:-.045,length:.25,width:.16,height:5.7},
    sideRoute:[[-.60,.31],[-.46,.48],[-.12,.52],[.25,.46],[.48,.20]]
  },
  canal:{
    route:[[-.86,.57],[-.67,.33],[-.43,.29],[-.27,.29],[.08,.29],[.30,.26],[.46,.26]],
    pens:[.51,.26],groups:[[-.71,.27],[-.60,-.41],[-.38,.44],[-.47,-.24]],
    knolls:[[-.68,-.65,6,.24,.22],[-.56,.70,4,.22,.20],[.47,-.67,7,.27,.22],[.69,.62,5,.24,.24]],
    ponds:[],walls:[[[-.59,-.08],[-.49,-.10],[-.40,-.12]],[[.22,.03],[.32,.08],[.38,.09]]],
    stream:{x:-.12,north:-.34,south:.29},
    sideRoute:[[-.67,.33],[-.63,-.31],[-.36,-.34],[-.12,-.34],[.13,-.34],[.24,-.11],[.30,.26]]
  },
  arc:{
    route:[[-.86,.41],[-.67,.32],[-.49,.08],[-.36,-.26],[-.09,-.38],[.22,-.30],[.47,-.04]],
    pens:[.53,-.01],groups:[[-.71,.03],[-.58,-.38],[-.31,.31],[.05,-.48]],
    knolls:[[-.53,-.60,9,.23,.21],[-.17,.16,9,.22,.28],[.28,.63,7,.25,.20],[.59,-.51,7,.23,.25]],
    ponds:[[-.06,.47,.12,.10,.34]],walls:[[[-.47,.54],[-.31,.57],[-.26,.55]],[[.08,-.57],[.21,-.53],[.32,-.54]]],
    sideRoute:[[-.67,.32],[-.48,.52],[-.25,.66],[.12,.62],[.40,.33],[.47,-.04]]
  }
};
const legacyExpansions=[
  [
    ['le-pre-des-marguerites','Le pré des marguerites','valley',45,36,1],
    ['paturage-du-saule','Le pâturage du saule','lake',48,37,-1],
    ['les-murets-du-village','Les murets du village','terraces',50,38,1]
  ],
  [
    ['verger-des-reinettes','Le verger des reinettes','terraces',62,47,-1],
    ['la-mare-du-pressoir','La mare du pressoir','lake',65,51,1],
    ['la-haie-des-cueilleurs','La haie des cueilleurs','arc',59,48,1]
  ],
  [
    ['la-lande-des-bruyeres','La lande des bruyères','arc',70,54,-1],
    ['la-croupe-des-vents','La croupe des vents','valley',68,58,1],
    ['les-deux-drailles','Les deux drailles','terraces',77,59,-1]
  ],
  [
    ['la-trouee-aux-fougeres','La trouée aux fougères','valley',66,51,-1],
    ['le-pont-des-epiceas','Le pont des épicéas','canal',70,58,1],
    ['passage-des-racines','Le passage des racines','gorge',74,57,-1]
  ],
  [
    ['la-digue-des-enrochements','La digue des enrochements','canal',64,51,-1],
    ['entre-les-vives-eaux','Entre les vives-eaux','lake',63,54,1],
    ['le-cordon-du-phare','Le cordon du phare','arc',65,58,-1]
  ],
  [
    ['la-combe-gelee','La combe gelée','lake',71,57,-1],
    ['le-col-des-marmottes','Le col des marmottes','gorge',77,61,1],
    ['la-creste-du-refuge','La crête du refuge','terraces',72,56,-1]
  ],
  [
    ['le-chemin-du-chataignier','Le chemin du châtaignier','arc',70,58,1],
    ['les-prairies-cousues','Les prairies cousues','terraces',79,56,1],
    ['le-refuge-sous-les-haies','Le refuge sous les haies','gorge',74,62,-1]
  ],
  [
    ['le-chenal-aux-libellules','Le chenal aux libellules','canal',71,58,1],
    ['les-levades-basses','Les levées basses','lake',69,55,1],
    ['le-pont-des-saules-gris','Le pont des saules gris','canal',77,63,-1]
  ],
  [
    ['le-clos-des-oliviers','Le clos des oliviers','terraces',75,57,1],
    ['la-voute-du-thym','La voûte du thym','gorge',81,60,-1],
    ['combes-des-cigales','La combe des cigales','arc',79,55,-1]
  ],
  [
    ['les-cinq-cotons','Les cinq cotons','lake',74,59,1],
    ['le-detroit-blanc','Le détroit blanc','canal',80,56,1],
    ['les-falaises-laiteuses','Les falaises laiteuses','gorge',82,61,-1]
  ],
  [
    ['la-vallee-de-ponce','La vallée de ponce','valley',77,57,-1],
    ['le-pont-de-lobsidienne','Le pont de l’obsidienne','canal',87,65,1],
    ['les-bouches-rouges','Les bouches rouges','arc',81,66,-1]
  ]
];
const fantasyWorlds=[
  {
    name:'La chambre des jouets',short:'Jouets',terrain:'Une chambre à hauteur de jouet',biome:'toy',climate:8,
    grass:['#84a285','#b0bc8d','#9cae91','#a3b19d'],dirt:'#d1ba98',horizon:'#e4cbaa',sky:'#f0ddba',fog:161,
    maps:[
      ['le-tapis-des-cubes','Le tapis des cubes','valley',55,40,1],
      ['la-desserte-du-petit-train','La desserte du petit train','terraces',62,48,-1],
      ['la-cabane-sous-le-lit','La cabane sous le lit','gorge',67,52,1],
      ['le-chateau-des-briques','Le château des briques','arc',71,54,-1],
      ['le-ruban-des-jouets','Le ruban des jouets','terraces',50,42,1]
    ]
  },
  {
    name:'Les jardins célestes',short:'Jardins',terrain:'Prairies, ailes et carillons',biome:'angel',climate:9,
    grass:['#a6bda8','#c6ceac','#c3c4cf','#d6cfad'],dirt:'#d6c6b0',horizon:'#deddeb',sky:'#a6badf',fog:139,
    maps:[
      ['le-verger-des-ailes','Le verger des ailes','valley',54,43,1],
      ['les-passerelles-du-carillon','Les passerelles du carillon','canal',64,50,-1],
      ['le-refuge-des-nuages-roses','Le refuge des nuages roses','lake',66,56,1],
      ['les-arches-daube','Les arches d’aube','gorge',73,54,-1],
      ['le-tour-des-cloches','Le tour des cloches','arc',55,43,-1]
    ]
  },
  {
    name:'L’atelier de papier',short:'Papier',terrain:'Vallée pliée et moulins de papier',biome:'paper',climate:10,
    grass:['#b8b68c','#d4c396','#b3bd9e','#c5a799'],dirt:'#c7ac82',horizon:'#ead3bc',sky:'#c3cfbd',fog:154,
    maps:[
      ['les-plis-du-moulin','Les plis du moulin','terraces',58,47,1],
      ['le-trait-des-cerfs-volants','Le trait des cerfs-volants','valley',66,52,-1],
      ['le-pont-des-livres','Le pont des livres','canal',67,50,1],
      ['la-gorge-pliee','La gorge pliée','gorge',73,57,1],
      ['les-accordeons-de-vent','Les accordéons de vent','arc',59,49,-1]
    ]
  },
  {
    name:'L’observatoire des lucioles',short:'Lucioles',terrain:'Sentiers nocturnes et lanternes',biome:'night',climate:11,
    grass:['#777d8a','#8e948d','#736f87','#a0a092'],dirt:'#aca29f',horizon:'#b0a7c7',sky:'#555e91',fog:142,
    maps:[
      ['les-lueurs-du-parvis','Les lueurs du parvis','valley',58,46,-1],
      ['le-lac-des-reflets','Le lac des reflets','lake',66,53,1],
      ['la-terrasse-des-etoiles','La terrasse des étoiles','terraces',72,54,1],
      ['le-tunnel-des-lucioles','Le tunnel des lucioles','gorge',76,59,-1],
      ['la-grand-couronne','La grande couronne','arc',61,46,1]
    ]
  }
];
const finalePlans=[
  ['Beagle','beagle','La boucle des pommiers','terraces',49,40,1,105],
  ['Shetland','Berger_des_Shetland','Le retour par la lande','arc',50,38,-1,72],
  ['Berger australien','Berger_Australien','L’allée des grands sapins','gorge',56,44,1,78],
  ['Labrador','labrador-retriever','La course des levées','canal',54,46,1,86],
  ['Husky','husky-siberien','Le versant des neiges','lake',51,42,-1,74],
  ['Malinois','berger-malinois','La percée des haies','terraces',52,42,-1,100],
  ['Golden retriever','golden-retriever','Le tour du grand chenal','canal',58,45,-1,91],
  ['Greyhound','greyhound','La descente de calcaire','arc',53,43,1,81],
  ['Corgi','corgi-pembroke','La cavalcade blanche','canal',58,47,1,97],
  ['Rottweiler','rottweiler','Le tour des évents','valley',55,43,-1,105],
  ['Teckel','teckel','En piste, les jouets','terraces',50,42,1,106],
  ['Grand caniche','caniche','Le dernier carillon','arc',55,43,-1,92],
  ['Dalmatien','dalmatien','Le sprint de papier','arc',59,49,-1,94],
  ['Shiba inu','shiba-inu','La ronde des lanternes','arc',61,46,1,110]
];

function campaignTerrain(base,entry,seed){
  const [mapId,place,shape,hx,hz,reflection]=entry;
  const pattern=terrainPatterns[shape];
  const x=v=>v*hx,z=v=>v*hz*reflection;
  const point=([a,b])=>[x(a),z(b)];
  const [penX,penZ]=point(pattern.pens);
  const primary=pattern.route.map(point);
  const [sx,sz]=primary[0], [toX,toZ]=primary[1];
  const route=primary.concat([[penX,penZ],[penX+13,penZ]]);
  const low=base.biome==='toy'?.25:base.biome==='paper'?.65:base.biome==='snow'?1.5:1;
  const shapeStream=pattern.stream;
  const stream=shapeStream?{
    x:x(shapeStream.x),width:8.6,z:z(shapeStream.south),gap:9.1,
    alternate:{z:z(shapeStream.north),gap:8.6}
  }:null;
  const house=point([.73,pattern.pens[1]>.10?-.50:.49]);
  const foliage=base.biome==='toy'||base.biome==='paper'||base.biome==='ember'?0:base.biome==='night'?5:10;
  return {...base,mapId,place,terrainSeed:seed,half:[hx,hz],start:[sx,sz,Math.atan2(toX-sx,toZ-sz)],house,
    pens:{sheep:[penX,penX+16,penZ-9,penZ+9,penZ,8.4]}, stream,
    hills:pattern.knolls.map(([a,b,h,rx,rz])=>[x(a),z(b),h*low,rx*hx,rz*hz]),
    ponds:pattern.ponds.map(([a,b,rx,rz,rot])=>[x(a),z(b),hx*rx,hz*rz,-.52,rot*reflection]),
    walls:pattern.walls.map(path=>path.map(point)),
    groves:foliage?[[x(-.57),z(-.70),hx*.17,hz*.15,foliage],[x(.37),z(-.64),hx*.18,hz*.13,foliage],[x(.06),z(.71),hx*.18,hz*.13,foliage]]:[],
    trails:[route,...(pattern.sideRoute?[pattern.sideRoute.map(point)]:[]),
      ...pattern.groups.map(([gx,gz],i)=>[point([gx,gz]),point([(gx+pattern.route[2][0])*.5,(gz+pattern.route[2][1])*.5]),primary[i%2+1]])],
    landmarks:[],cave:pattern.cave?{x:x(pattern.cave.x),z:0,length:hx*pattern.cave.length,width:Math.max(7.5,hz*pattern.cave.width),height:pattern.cave.height}:null,
    campaignPatches:pattern.groups.map(point),campaignLine:primary,
    features:base.biome==='marsh'?[[x(-.31),z(.63),'reeds'],[x(.11),z(-.65),'reeds'],[x(.26),z(.63),'shelter']]:
      base.biome==='bocage'?[[x(-.51),z(-.56),'hedge'],[x(-.19),z(.61),'hedge']]:
      base.biome==='garrigue'?[[x(-.33),z(.67),'cairn'],[x(.28),z(-.64),'cairn']]:[],
    locks:[],hideouts:[],mud:[],ice:[],wolves:[],clues:[],gust:false,track:false,ford:false,
    requireFord:false,bigFlock:false,gathering:null,relay:null,dangers:[],eventWeather:null
  };
}
function spawnCampaignFlock(areas,count,speciesFor,hasLambs){
  return Array.from({length:count},(_,i)=>{
    const [x,z]=areas[i%areas.length],offset=Math.floor(i/areas.length),type=speciesFor(i);
    return [type,x+(offset%3)*1.66,z+(offset%2?1:-1)*offset*.85,null,hasLambs&&type==='sheep'&&i%4===3?'lamb':null];
  });
}
function terrainIncident(terrain,edition,selection){
  const {biome,half,stream,campaignPatches:p,campaignLine:line}=terrain;
  const [hx,hz]=half;
  if(biome==='toy'){
    return {mode:'Ressorts',note:'Les plaques à ressort poussent dans le sens de leur flèche. Place-toi sur le côté si tu veux les éviter.',
      springs:[...line.slice(2,edition?5:4).map(([x,z],i)=>[x,z,2.1,Math.PI*.5+i*.38])]};
  }
  if(biome==='angel'){
    return {mode:'Carillons',note:'Fais sonner les cloches à portée. Les moutons ailés marchent vers elles avant de reprendre leur route.',
      beacons:[['chime',...line[2]],['chime',...line[4]]],dangers:[['cloud',line[3][0]+2,line[3][1]+4,6.8,5.9,0]],
      ...(edition?{relay:[[...line[4],10.5,'La clairière du carillon']]}:{})};
  }
  if(biome==='paper'){
    return {mode:'Rafales',note:'Les rafales déportent les animaux dans les zones rubanées. Utilise le moulin pour suspendre le vent.',
      beacons:[['mill',line[2][0]-2,line[2][1]+5]],gustLanes:line.slice(2,5).map(([x,z],i)=>[x,z,7.3,5.1,i%2?1:-1]),
      ...(edition?{mode:'Halte sous le vent',relay:[[...line[4],10.4,'Le pli à l’abri']],
        note:'Mène le troupeau jusqu’à la halte pour ouvrir la bergerie. Le moulin coupe les rafales pendant 24 secondes.'}:{})};
  }
  if(biome==='night'){
    return {mode:'Lanternes',note:'Allume les lanternes marquées sur la carte pour ouvrir la bergerie. Leurs halos indiquent la route.',
      beacons:(edition?[line[1],line[3],line[4]]:[line[2],line[3]]).map(point=>['lamp',...point]),requiresLights:true};
  }
  if(biome==='cloud'){
    return {mode:'Brume',note:'Les nuages ralentissent la marche. Repère les brebis qui s’y enfoncent sur la carte.',
      dangers:[['cloud',...line[2],8.3,7,0],['cloud',...line[4],9.5,6,16]],
      ...(edition?{relay:[[...line[4],10.1,'La halte blanche']]}:{})};
  }
  if(biome==='ember'){
    const [a,b]=line[3];
    return {mode:'Éruptions',note:'Quitte les cercles orange avant l’éruption. La carte montre quels évents sont actifs.',
      dangers:[['vent',a,b,6.1,4.7,16],['vent',line[4][0]-3,line[4][1]+hz*.25,6.6,5.1,28]],
      ...(edition?{relay:[[...line[4],11,'L’abri de ponce']]}:{})};
  }
  if((biome==='marsh'||biome==='coast')&&stream){
    const choices={mode:'Ouvrir une traversée',ford:true,note:'La vanne ouvre le raccourci. L’autre pont reste praticable.'};
    if(edition&&biome==='marsh')Object.assign(choices,{dangers:[['flood',stream.x,stream.alternate.z,7.1,4.1,38]],note:'Ouvre la vanne ou contourne le passage. Le raccourci ralentit quand la crue arrive.'});
    return choices;
  }
  if(biome==='snow'){
    return {mode:'Glace',note:'Relâche le sprint sur la glace et place-toi en amont des brebis.',
      ice:[[...line[2],7.9,6.1],[line[4][0]-4,line[4][1]+5,6.3,4.1]],
      ...(edition?{relay:[[...line[4],10,'L’abri du col']]}:{})};
  }
  if((biome==='bocage'||biome==='wood')&&edition){
    return {mode:'Protéger',note:'Place-toi entre les brebis et le loup. Aboie avant qu’il ne charge.',
      wolves:[[p[1][0]+4,p[1][1]-Math.sign(p[1][1])*10]],bonus:'guard',challenge:'Aucune charge au milieu du troupeau'};
  }
  if(!edition&&selection===0){
    return {mode:'Rassembler',note:'Repère chaque groupe sur la carte avant de le rabattre vers les autres.'};
  }
  if(!edition&&selection===1){
    return {mode:'Portillon',note:'Ouvre la bergerie à l’arrivée. Elle est fermée au départ.',locks:['sheep']};
  }
  return {mode:'Faire halte',note:'Chaque brebis doit passer dans le cercle de la halte avant l’ouverture de la bergerie.',
    relay:[[...line[4],10.1,'La halte du berger']]};
}
function campaignEdition(terrain,ordinal,edition,seed){
  const found=terrainIncident(terrain,edition,ordinal%3);
  const {mode,note,...rules}=found;
  const count=terrain.region===0?4+Number(Boolean(edition)):6+(ordinal%3)+edition*2;
  const sort=edition&&ordinal%3===1&&terrain.region>0&&terrain.region!==13;
  const type=terrain.region%3===0?'duck':'goat';
  const pens={...terrain.pens};
  if(sort){
    const [left,right,, ,center]=pens.sheep;
    const goal=center>0?-Math.abs(center)-17:Math.abs(center)+17;
    pens[type]=[left+1,right+1,goal-7,goal+7,goal,7.0];
  }
  const areas=terrain.campaignPatches;
  const spawns=edition?[areas[1],areas[3],areas[2],areas[0]]:areas.slice(0,terrain.region===0?2:3);
  const animals=spawnCampaignFlock(spawns,count,i=>sort&&i%3===1?type:'sheep',terrain.region>=6);
  const title=edition?terrain.place+' · Retour':terrain.place;
  const description=sort?'Rentre les deux espèces dans leurs enclos respectifs.':'Ramène '+count+' brebis'+(rules.relay?' en passant par la halte.':'.');
  const instructions=sort?`Garde une espèce en place au sifflet pendant que tu pousses l’autre.${terrain.region>=11?' '+note:''}`:note;
  return outing(terrain,terrain.mapId+(edition?'-retour':'-aller'),title,sort?'Trier les espèces':mode,
    description,instructions,animals,{...rules,
      ...(sort?{relay:null}:{}),pens,seed,pastures:spawns.length,seconds:terrain.region===0?240:380+ordinal*19+edition*55,
      bonus:rules.bonus||'calm',challenge:rules.challenge||'Sans affoler les bêtes',
      fieldOrders:sort?['gather','hold','sort']:terrain.region>0?['gather','hold']:[]});
}
function timedFinale(terrain,region,seed){
  const [label,dogId,title,,,,,seconds]=finalePlans[region-1];
  const {mode,note,...rules}=terrainIncident(terrain,0,1);
  const instructions=rules.locks?'La bergerie est ouverte. Contourne le troupeau et rabats-le ensemble pour gagner du temps.':note;
  // A single flock and a legible route make the time trial about handling
  // and taking a useful line across the map.
  const [x,z]=terrain.campaignLine[2];
  const spawns=terrain.biome==='night'?spawnCampaignFlock([[x,z]],6,()=> 'sheep',false):Array.from({length:region>9?6:5},(_,i)=>
    ['sheep',x+(i%3)*1.7,z+(i<3?-1.35:1.35)+(i%3)*.65]);
  const pen=terrain.pens.sheep;
  const pens={sheep:[...pen.slice(0,5),terrain.biome==='night'?pen[5]:10.4]};
  return outing(terrain,'finale-'+String(region+1),title,'Contre-la-montre',
    'Rentre le troupeau en moins de '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' pour adopter le '+label+'.',
    instructions,spawns,{...rules,pens,relay:null,locks:[],pastures:1,seed,seconds,trial:{dogId,seconds},fieldOrders:['gather','hold'],bonus:'calm',challenge:'Sans affoler le troupeau'});
}
for(const [offset,world] of fantasyWorlds.entries()){
  const region=worldNames.length;
  const climateNames=['Lumière de la chambre','Aube des nuages','Soleil de papier','Nuit des lucioles'];
  const {maps,...palette}=world;
  worldNames.push({...palette,region,weather:climateNames[offset],icon:offset===3?'☾':'☀'});
  regionNames.push(world.name);
  atlasNames.push(world.short);
}
const trailsByWorld=Array.from({length:15},()=>[]);
const preservedContracts=levels.filter(level=>level.side);
for(const level of levels){
  if(level.side)continue;
  level.mapId=level.id;
  trailsByWorld[level.region].push(level);
}
for(const plan of contractPlans){
  const level=preservedContracts.find(level=>level.id===plan.id);
  level.mapId=plan.base;
}
for(const [region,chapterRoutes] of trailsByWorld.entries()){
  const legacy=region<11;
  const base=legacy?chapterRoutes[0]:worldNames[region];
  const lastBonus=chapterRoutes.find(level=>level.bigFlock);
  const fresh=(legacy?legacyExpansions[region]:fantasyWorlds[region-11].maps).map((entry,i)=>
    campaignTerrain(base,entry,110000+region*100+i));
  const order=chapterRoutes.filter(level=>!level.bigFlock);
  const count=10-Number(Boolean(lastBonus))-Number(region>0)-order.length;
  const newRoutes=[];
  if(legacy){
    for(let i=0;i<count;i++){
      const index=i%fresh.length,edition=Number(i>=fresh.length);
      newRoutes.push(campaignEdition(fresh[index],index,edition,120000+region*100+i));
    }
  }else{
    for(let i=0;i<count;i++){
      const index=Math.floor(i/2),edition=i%2;
      newRoutes.push(campaignEdition(fresh[index],index,edition,120000+region*100+i));
    }
  }
  if(region===0)order.splice(2,0,...newRoutes.slice(0,3)),order.push(...newRoutes.slice(3));
  else order.push(...newRoutes);
  if(lastBonus)order.push(lastBonus);
  if(region>0){
    const [, ,title,shape,hx,hz,sign]=finalePlans[region-1];
    const terrain=legacy?campaignTerrain(base,['circuit-'+(region+1),title,shape,hx,hz,sign],130000+region):fresh.at(-1);
    order.push(timedFinale(terrain,region,140000+region));
  }
  chapterRoutes.splice(0,chapterRoutes.length,...order);
}
levels.splice(0,levels.length,...trailsByWorld.flat(),...preservedContracts);
const lesson={
  ...regions[0],id:'lecon',region:0,title:'Premier pas',start:[-3,13,Math.PI],house:[25,-12],half:[27,25],seed:716,
  pens:{sheep:[4,14,-6,5,-.4,5.9]},description:'Accompagne un mouton jusqu’à la bergerie.',
  note:'Déplace ton chien avec le joystick ou les flèches.',seconds:Infinity,
  hills:[[-20,-20,3,14,16]],ponds:[],trails:[[[-4,23],[-4,13],[-4,4],[-3,-1],[4,-.4],[12,0]]],
  groves:[[-17,-9,5,7,4],[17,14,5,4,3]],walls:[],landmarks:[],animals:[['sheep',-2,-.7]]
};


const keyVectors = {
  ArrowUp:[0,-1],KeyW:[0,-1],KeyZ:[0,-1],ArrowDown:[0,1],KeyS:[0,1],
  ArrowLeft:[-1,0],KeyA:[-1,0],KeyQ:[-1,0],ArrowRight:[1,0],KeyD:[1,0]
};
const keys = new Set();
const stick = {x:0,y:0,id:null};
let tap = null;
let renderer,scene,camera,map,decor,props,dog,animals,pens,colliders,grid,random,chapter=0;
let won=false, storm=false, gameTime=0, barkTime=-10, hintUntil=-1, hintObject=null, toastId;
let openDialogTrigger, soundEnabled=false, audio, lastMapTime=-1;
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
  if(name==='farm'){
    line([[5,23],[24,7],[43,23]]);line([[10,21],[10,41],[38,41],[38,21]]);line([[20,40],[20,28],[28,28],[28,40]]);
  }else if(name==='shop'){
    line([[11,16],[37,16],[41,41],[7,41],[11,16]]);arc(24,17,8,Math.PI,TAU);line([[18,29],[30,29]]);
  }else if(name==='settings'){
    arc(24,24,14,0,TAU);arc(24,24,5,0,TAU);
    for(let j=0;j<8;j++){
      const a=j*TAU/8;line([[24+14*Math.cos(a),24+14*Math.sin(a)],[24+19*Math.cos(a),24+19*Math.sin(a)]]);
    }
  }else if(name==='rotate'){
    arc(24,25,15,-.92,TAU-.13);line([[35,12],[41,12],[41,4]]);
  }else if(name==='star'){
    const path=[];
    for(let i=0;i<=10;i++){
      const a=i*TAU/10-Math.PI/2,r=i%2?8.5:18;path.push([24+Math.cos(a)*r,24+Math.sin(a)*r]);
    }
    line(path);
  }else if(name==='paw'){
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

// Geometry exported by blender-pen.py. Each modulus remains centered on its old pivot.
const penKitData={"rail":{"position":[-0.49151,-0.5,0.33019,-0.49151,-0.46705,0.45026,-0.49641,-0.45245,0.42823,-0.49751,-0.46705,0.33019,-0.49151,-0.3875,0.5,-0.49751,-0.3875,0.45026,-0.5,-0.3875,0.33019,-0.49151,0.3875,0.5,-0.49151,0.46705,0.45026,-0.49641,0.45245,0.42823,-0.49751,0.3875,0.45026,-0.49151,0.5,0.33019,-0.49751,0.46705,0.33019,-0.5,0.3875,0.33019,-0.49151,-0.5,-0.33019,-0.49751,-0.46705,-0.33019,-0.49641,-0.45245,-0.42823,-0.49151,-0.46705,-0.45026,-0.5,-0.3875,-0.33019,-0.49751,-0.3875,-0.45026,-0.49151,-0.3875,-0.5,-0.49151,0.5,-0.33019,-0.49151,0.46705,-0.45026,-0.49641,0.45245,-0.42823,-0.49751,0.46705,-0.33019,-0.49151,0.3875,-0.5,-0.49751,0.3875,-0.45026,-0.5,0.3875,-0.33019,0.49151,-0.5,0.33019,0.49751,-0.46705,0.33019,0.49641,-0.45245,0.42823,0.49151,-0.46705,0.45026,0.5,-0.3875,0.33019,0.49751,-0.3875,0.45026,0.49151,-0.3875,0.5,0.49151,0.5,0.33019,0.49151,0.46705,0.45026,0.49641,0.45245,0.42823,0.49751,0.46705,0.33019,0.49151,0.3875,0.5,0.49751,0.3875,0.45026,0.5,0.3875,0.33019,0.49151,-0.5,-0.33019,0.49151,-0.46705,-0.45026,0.49641,-0.45245,-0.42823,0.49751,-0.46705,-0.33019,0.49151,-0.3875,-0.5,0.49751,-0.3875,-0.45026,0.5,-0.3875,-0.33019,0.49151,0.5,-0.33019,0.49751,0.46705,-0.33019,0.49641,0.45245,-0.42823,0.49151,0.46705,-0.45026,0.5,0.3875,-0.33019,0.49751,0.3875,-0.45026,0.49151,0.3875,-0.5],"normal":[-0.00244,-0.99798,0.06354,-0.00184,-0.70709,0.70712,-0.57735,-0.57735,0.57735,-0.70631,-0.70631,0.0475,-0.00248,-0.03846,0.99926,-0.70683,-0.02841,0.70681,-0.99738,-0.03697,0.06211,-0.00245,0.03849,0.99926,-0.00184,0.70712,0.70709,-0.57735,0.57735,0.57735,-0.70682,0.02841,0.70682,-0.00244,0.99798,0.06354,-0.70632,0.7063,0.04751,-0.99738,0.03694,0.06214,-0.00244,-0.99798,-0.06355,-0.70627,-0.70635,-0.04751,-0.57735,-0.57735,-0.57735,-0.00184,-0.7071,-0.70711,-0.99739,-0.0369,-0.0621,-0.70681,-0.02842,-0.70683,-0.00246,-0.03849,-0.99926,-0.00244,0.99798,-0.06354,-0.00184,0.70709,-0.70712,-0.57735,0.57735,-0.57735,-0.70631,0.70631,-0.0475,-0.00248,0.03846,-0.99926,-0.70685,0.02841,-0.70679,-0.99739,0.03692,-0.06208,0.00244,-0.99798,0.06355,0.70627,-0.70635,0.04751,0.57735,-0.57735,0.57735,0.00184,-0.7071,0.70711,0.99739,-0.0369,0.0621,0.70681,-0.02842,0.70683,0.00246,-0.03849,0.99926,0.00244,0.99798,0.06354,0.00184,0.70709,0.70712,0.57735,0.57735,0.57735,0.70631,0.70631,0.0475,0.00248,0.03846,0.99926,0.70685,0.02841,0.70679,0.99739,0.03693,0.06208,0.00244,-0.99798,-0.06354,0.00184,-0.70709,-0.70712,0.57735,-0.57735,-0.57735,0.70631,-0.70631,-0.0475,0.00248,-0.03846,-0.99926,0.70685,-0.02841,-0.70679,0.99739,-0.03693,-0.06208,0.00244,0.99798,-0.06355,0.70627,0.70635,-0.04751,0.57735,0.57735,-0.57735,0.00184,0.7071,-0.70711,0.99739,0.0369,-0.0621,0.70681,0.02842,-0.70683,0.00246,0.03849,-0.99926],"uv":[0.00849,0.83019,0.00849,0.03295,0.00359,0.04755,0.00249,0.83019,0.00849,0.1125,0.00249,0.1125,0.0,0.1125,0.00849,0.8875,0.00849,0.95026,0.00359,0.95245,0.00249,0.8875,0.00849,0.83019,0.00249,0.83019,0.0,0.8875,0.00849,0.16981,0.00249,0.16981,0.00359,0.04755,0.00849,0.03295,0.0,0.1125,0.00249,0.1125,0.00849,0.1125,0.00849,0.16981,0.00849,0.96705,0.00359,0.95245,0.00249,0.16981,0.00849,0.8875,0.00249,0.8875,0.0,0.8875,0.99151,0.83019,0.99751,0.83019,0.99641,0.04755,0.99151,0.03295,1.0,0.1125,0.99751,0.1125,0.99151,0.1125,0.99151,0.83019,0.99151,0.96705,0.99641,0.95245,0.99751,0.83019,0.99151,0.8875,0.99751,0.8875,1.0,0.8875,0.99151,0.16981,0.99151,0.03295,0.99641,0.04755,0.99751,0.16981,0.99151,0.1125,0.99751,0.1125,1.0,0.1125,0.99151,0.16981,0.99751,0.16981,0.99641,0.95245,0.99151,0.96705,1.0,0.8875,0.99751,0.8875,0.99151,0.8875],"index":[0,1,2,0,2,3,4,5,2,4,2,1,6,3,2,6,2,5,7,8,9,7,9,10,11,12,9,11,9,8,13,10,9,13,9,12,14,15,16,14,16,17,18,19,16,18,16,15,20,17,16,20,16,19,21,22,23,21,23,24,25,26,23,25,23,22,27,24,23,27,23,26,28,29,30,28,30,31,32,33,30,32,30,29,34,31,30,34,30,33,35,36,37,35,37,38,39,40,37,39,37,36,41,38,37,41,37,40,42,43,44,42,44,45,46,47,44,46,44,43,48,45,44,48,44,47,49,50,51,49,51,52,53,54,51,53,51,50,55,52,51,55,51,54,14,0,3,14,3,15,15,3,6,15,6,18,4,7,10,4,10,5,5,10,13,5,13,6,11,21,24,11,24,12,12,24,27,12,27,13,25,20,19,25,19,26,26,19,18,26,18,27,42,14,17,42,17,43,43,17,20,43,20,46,21,49,52,21,52,22,22,52,55,22,55,25,53,48,47,53,47,54,54,47,46,54,46,55,28,42,45,28,45,29,29,45,48,29,48,32,49,35,38,49,38,50,50,38,41,50,41,53,39,34,33,39,33,40,40,33,32,40,32,41,0,28,31,0,31,1,1,31,34,1,34,4,35,11,8,35,8,36,36,8,7,36,7,39,14,42,28,14,28,0,6,13,27,6,27,18,34,39,7,34,7,4,49,21,11,49,11,35,20,25,55,20,55,46,48,53,41,48,41,32]},"post":{"position":[-0.39,-0.5,0.39524,-0.39,-0.49565,0.46932,-0.45351,-0.49372,0.45572,-0.46778,-0.49565,0.39524,-0.39,-0.48514,0.5,-0.46778,-0.48514,0.46932,-0.5,-0.48514,0.39524,-0.39,0.48514,0.5,-0.39,0.49565,0.46932,-0.45351,0.49372,0.45572,-0.46778,0.48514,0.46932,-0.39,0.5,0.39524,-0.46778,0.49565,0.39524,-0.5,0.48514,0.39524,-0.39,-0.5,-0.39524,-0.46778,-0.49565,-0.39524,-0.45351,-0.49372,-0.45572,-0.39,-0.49565,-0.46932,-0.5,-0.48514,-0.39524,-0.46778,-0.48514,-0.46932,-0.39,-0.48514,-0.5,-0.39,0.5,-0.39524,-0.39,0.49565,-0.46932,-0.45351,0.49372,-0.45572,-0.46778,0.49565,-0.39524,-0.39,0.48514,-0.5,-0.46778,0.48514,-0.46932,-0.5,0.48514,-0.39524,0.39,-0.5,0.39524,0.46778,-0.49565,0.39524,0.45351,-0.49372,0.45572,0.39,-0.49565,0.46932,0.5,-0.48514,0.39524,0.46778,-0.48514,0.46932,0.39,-0.48514,0.5,0.39,0.5,0.39524,0.39,0.49565,0.46932,0.45351,0.49372,0.45572,0.46778,0.49565,0.39524,0.39,0.48514,0.5,0.46778,0.48514,0.46932,0.5,0.48514,0.39524,0.39,-0.5,-0.39524,0.39,-0.49565,-0.46932,0.45351,-0.49372,-0.45572,0.46778,-0.49565,-0.39524,0.39,-0.48514,-0.5,0.46778,-0.48514,-0.46932,0.5,-0.48514,-0.39524,0.39,0.5,-0.39524,0.46778,0.49565,-0.39524,0.45351,0.49372,-0.45572,0.39,0.49565,-0.46932,0.5,0.48514,-0.39524,0.46778,0.48514,-0.46932,0.39,0.48514,-0.5],"normal":[-0.03669,-0.99873,0.03464,-0.02763,-0.70689,0.70679,-0.57735,-0.57735,0.57735,-0.70687,-0.70686,0.02611,-0.03745,-0.00434,0.99929,-0.70711,-0.00325,0.70709,-0.99936,-0.00436,0.03539,-0.03745,0.00434,0.99929,-0.02763,0.70687,0.70681,-0.57735,0.57735,0.57735,-0.70711,0.00325,0.7071,-0.03672,0.99873,0.03461,-0.70688,0.70685,0.02611,-0.99936,0.00436,0.03539,-0.03672,-0.99873,-0.03461,-0.70688,-0.70685,-0.02611,-0.57735,-0.57735,-0.57735,-0.02763,-0.70683,-0.70684,-0.99936,-0.00436,-0.03539,-0.70709,-0.00325,-0.70711,-0.03745,-0.00434,-0.99929,-0.03669,0.99873,-0.03464,-0.02763,0.70689,-0.70679,-0.57735,0.57735,-0.57735,-0.70687,0.70686,-0.02611,-0.03745,0.00434,-0.99929,-0.70711,0.00325,-0.70709,-0.99936,0.00436,-0.03539,0.03672,-0.99873,0.03461,0.70688,-0.70685,0.02611,0.57735,-0.57735,0.57735,0.02763,-0.70683,0.70684,0.99936,-0.00436,0.03539,0.70709,-0.00325,0.70711,0.03745,-0.00434,0.99929,0.03669,0.99873,0.03464,0.02763,0.70689,0.70679,0.57735,0.57735,0.57735,0.70687,0.70686,0.02611,0.03745,0.00434,0.99929,0.70711,0.00325,0.70709,0.99936,0.00436,0.03539,0.03669,-0.99873,-0.03464,0.02763,-0.70689,-0.70679,0.57735,-0.57735,-0.57735,0.70687,-0.70686,-0.02611,0.03745,-0.00434,-0.99929,0.70711,-0.00325,-0.70709,0.99936,-0.00436,-0.03539,0.03672,0.99873,-0.03461,0.70688,0.70685,-0.02611,0.57735,0.57735,-0.57735,0.02763,0.70683,-0.70684,0.99936,0.00436,-0.03539,0.70709,0.00325,-0.70711,0.03745,0.00434,-0.99929],"uv":[0.0,0.89524,0.00435,0.11,0.00628,0.95572,0.00435,0.89524,0.01486,0.11,0.01486,0.96932,0.01486,0.89524,0.98514,0.11,0.99565,0.11,0.99372,0.95572,0.98514,0.96932,1.0,0.89524,0.99565,0.89524,0.98514,0.89524,0.0,0.10476,0.00435,0.10476,0.00628,0.04428,0.00435,0.11,0.01486,0.10476,0.01486,0.03222,0.01486,0.11,1.0,0.10476,0.99565,0.11,0.99372,0.04428,0.99565,0.10476,0.98514,0.11,0.98514,0.03068,0.98514,0.10476,0.0,0.89524,0.00435,0.89524,0.00628,0.95572,0.00435,0.89,0.01486,0.89524,0.01486,0.96778,0.01486,0.89,1.0,0.89524,0.99565,0.89,0.99372,0.95572,0.99565,0.89524,0.98514,0.89,0.98514,0.96932,0.98514,0.89524,0.0,0.10476,0.00435,0.89,0.00628,0.04428,0.00435,0.10476,0.01486,0.89,0.01486,0.03068,0.01486,0.10476,1.0,0.10476,0.99565,0.10476,0.99372,0.04428,0.99565,0.89,0.98514,0.10476,0.98514,0.96778,0.98514,0.89],"index":[0,1,2,0,2,3,4,5,2,4,2,1,6,3,2,6,2,5,7,8,9,7,9,10,11,12,9,11,9,8,13,10,9,13,9,12,14,15,16,14,16,17,18,19,16,18,16,15,20,17,16,20,16,19,21,22,23,21,23,24,25,26,23,25,23,22,27,24,23,27,23,26,28,29,30,28,30,31,32,33,30,32,30,29,34,31,30,34,30,33,35,36,37,35,37,38,39,40,37,39,37,36,41,38,37,41,37,40,42,43,44,42,44,45,46,47,44,46,44,43,48,45,44,48,44,47,49,50,51,49,51,52,53,54,51,53,51,50,55,52,51,55,51,54,14,0,3,14,3,15,15,3,6,15,6,18,4,7,10,4,10,5,5,10,13,5,13,6,11,21,24,11,24,12,12,24,27,12,27,13,25,20,19,25,19,26,26,19,18,26,18,27,42,14,17,42,17,43,43,17,20,43,20,46,21,49,52,21,52,22,22,52,55,22,55,25,53,48,47,53,47,54,54,47,46,54,46,55,28,42,45,28,45,29,29,45,48,29,48,32,49,35,38,49,38,50,50,38,41,50,41,53,39,34,33,39,33,40,40,33,32,40,32,41,0,28,31,0,31,1,1,31,34,1,34,4,35,11,8,35,8,36,36,8,7,36,7,39,14,42,28,14,28,0,6,13,27,6,27,18,34,39,7,34,7,4,49,21,11,49,11,35,20,25,55,20,55,46,48,53,41,48,41,32]},"cap":{"position":[-0.42713,-0.5,0.42562,-0.42713,-0.44331,0.47821,-0.4692,-0.4182,0.46856,-0.47866,-0.44331,0.42562,-0.42713,-0.30645,0.5,-0.47866,-0.30645,0.47821,-0.5,-0.30645,0.42562,-0.42713,0.30645,0.5,-0.42713,0.44331,0.47821,-0.4692,0.4182,0.46856,-0.47866,0.30645,0.47821,-0.42713,0.5,0.42562,-0.47866,0.44331,0.42562,-0.5,0.30645,0.42562,-0.42713,-0.5,-0.42562,-0.47866,-0.44331,-0.42562,-0.4692,-0.4182,-0.46856,-0.42713,-0.44331,-0.47821,-0.5,-0.30645,-0.42562,-0.47866,-0.30645,-0.47821,-0.42713,-0.30645,-0.5,-0.42713,0.5,-0.42562,-0.42713,0.44331,-0.47821,-0.4692,0.4182,-0.46856,-0.47866,0.44331,-0.42562,-0.42713,0.30645,-0.5,-0.47866,0.30645,-0.47821,-0.5,0.30645,-0.42562,0.42713,-0.5,0.42562,0.47866,-0.44331,0.42562,0.4692,-0.4182,0.46856,0.42713,-0.44331,0.47821,0.5,-0.30645,0.42562,0.47866,-0.30645,0.47821,0.42713,-0.30645,0.5,0.42713,0.5,0.42562,0.42713,0.44331,0.47821,0.4692,0.4182,0.46856,0.47866,0.44331,0.42562,0.42713,0.30645,0.5,0.47866,0.30645,0.47821,0.5,0.30645,0.42562,0.42713,-0.5,-0.42562,0.42713,-0.44331,-0.47821,0.4692,-0.4182,-0.46856,0.47866,-0.44331,-0.42562,0.42713,-0.30645,-0.5,0.47866,-0.30645,-0.47821,0.5,-0.30645,-0.42562,0.42713,0.5,-0.42562,0.47866,0.44331,-0.42562,0.4692,0.4182,-0.46856,0.42713,0.44331,-0.47821,0.5,0.30645,-0.42562,0.47866,0.30645,-0.47821,0.42713,0.30645,-0.5],"normal":[-0.02322,-0.99945,0.02376,-0.01724,-0.70699,0.70701,-0.57735,-0.57735,0.57735,-0.707,-0.70699,0.01763,-0.02239,-0.07434,0.99698,-0.70595,-0.05671,0.70599,-0.99697,-0.07434,0.02291,-0.02237,0.07437,0.99698,-0.01724,0.70701,0.70699,-0.57735,0.57735,0.57735,-0.70597,0.05671,0.70597,-0.02322,0.99945,0.02376,-0.70697,0.70703,0.01763,-0.99697,0.07434,0.02291,-0.02322,-0.99945,-0.02376,-0.70697,-0.70703,-0.01763,-0.57735,-0.57735,-0.57735,-0.01724,-0.707,-0.707,-0.99697,-0.07431,-0.02286,-0.70593,-0.05671,-0.70601,-0.02237,-0.07437,-0.99698,-0.02322,0.99945,-0.02376,-0.01724,0.70699,-0.70701,-0.57735,0.57735,-0.57735,-0.707,0.70699,-0.01763,-0.02239,0.07434,-0.99698,-0.70595,0.05671,-0.70599,-0.99697,0.07434,-0.02291,0.02322,-0.99945,0.02376,0.70697,-0.70703,0.01763,0.57735,-0.57735,0.57735,0.01724,-0.707,0.707,0.99697,-0.07431,0.02286,0.70593,-0.05671,0.70601,0.02237,-0.07437,0.99698,0.02322,0.99945,0.02376,0.01724,0.70703,0.70697,0.57735,0.57735,0.57735,0.707,0.70699,0.01763,0.02239,0.07434,0.99698,0.70595,0.05671,0.70599,0.99697,0.07434,0.02291,0.02322,-0.99945,-0.02376,0.01724,-0.70699,-0.70701,0.57735,-0.57735,-0.57735,0.707,-0.70699,-0.01763,0.02239,-0.07434,-0.99698,0.70595,-0.05671,-0.70599,0.99697,-0.07434,-0.02291,0.02322,0.99945,-0.02376,0.70697,0.70703,-0.01763,0.57735,0.57735,-0.57735,0.01724,0.707,-0.707,0.99697,0.07431,-0.02286,0.70593,0.05671,-0.70601,0.02237,0.07437,-0.99698],"uv":[0.07287,0.92562,0.07287,0.05669,0.0308,0.96856,0.02134,0.92562,0.07287,0.19355,0.02134,0.19355,0.0,0.92562,0.07287,0.80645,0.07287,0.97821,0.0308,0.9182,0.02134,0.80645,0.07287,0.92562,0.02134,0.92562,0.0,0.92562,0.07287,0.07438,0.02134,0.07438,0.0308,0.03144,0.07287,0.05669,0.0,0.07438,0.02134,0.19355,0.07287,0.19355,0.07287,0.07438,0.07287,0.94331,0.0308,0.03144,0.02134,0.07438,0.07287,0.80645,0.02134,0.80645,0.0,0.07438,0.92713,0.92562,0.97866,0.92562,0.9692,0.96856,0.92713,0.05669,1.0,0.92562,0.97866,0.19355,0.92713,0.19355,0.92713,0.92562,0.92713,0.97821,0.9692,0.96856,0.97866,0.92562,0.92713,0.80645,0.97866,0.80645,1.0,0.92562,0.92713,0.07438,0.92713,0.05669,0.9692,0.03144,0.97866,0.07438,0.92713,0.19355,0.97866,0.19355,1.0,0.07438,0.92713,0.07438,0.97866,0.07438,0.9692,0.03144,0.92713,0.94331,1.0,0.07438,0.97866,0.80645,0.92713,0.80645],"index":[0,1,2,0,2,3,4,5,2,4,2,1,6,3,2,6,2,5,7,8,9,7,9,10,11,12,9,11,9,8,13,10,9,13,9,12,14,15,16,14,16,17,18,19,16,18,16,15,20,17,16,20,16,19,21,22,23,21,23,24,25,26,23,25,23,22,27,24,23,27,23,26,28,29,30,28,30,31,32,33,30,32,30,29,34,31,30,34,30,33,35,36,37,35,37,38,39,40,37,39,37,36,41,38,37,41,37,40,42,43,44,42,44,45,46,47,44,46,44,43,48,45,44,48,44,47,49,50,51,49,51,52,53,54,51,53,51,50,55,52,51,55,51,54,14,0,3,14,3,15,15,3,6,15,6,18,4,7,10,4,10,5,5,10,13,5,13,6,11,21,24,11,24,12,12,24,27,12,27,13,25,20,19,25,19,26,26,19,18,26,18,27,42,14,17,42,17,43,43,17,20,43,20,46,21,49,52,21,52,22,22,52,55,22,55,25,53,48,47,53,47,54,54,47,46,54,46,55,28,42,45,28,45,29,29,45,48,29,48,32,49,35,38,49,38,50,50,38,41,50,41,53,39,34,33,39,33,40,40,33,32,40,32,41,0,28,31,0,31,1,1,31,34,1,34,4,35,11,8,35,8,36,36,8,7,36,7,39,14,42,28,14,28,0,6,13,27,6,27,18,34,39,7,34,7,4,49,21,11,49,11,35,20,25,55,20,55,46,48,53,41,48,41,32]}};
function penKitGeometry(part){
  const data=penKitData[part],geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(data.position,3));
  geometry.setAttribute('normal',new THREE.Float32BufferAttribute(data.normal,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(data.uv,2));
  geometry.setIndex(data.index);
  return geometry;
}

let penGrain,penBatch;
const timberMaterials=new Map();
function chestnutGrain(){
  if(penGrain)return penGrain;
  const c=document.createElement('canvas');c.width=256;c.height=128;
  const ctx=c.getContext('2d'),rng=seeded(39012);
  ctx.fillStyle='#f5f1e7';ctx.fillRect(0,0,256,128);
  const knots=[[57,32],[174,73],[219,109]];
  for(let i=0;i<185;i++){
    const y=rng()*128,frequency=.021+rng()*.041,drift=(rng()-.5)*6,a=rng()*.20+.02;
    ctx.strokeStyle=i%5===0?'rgba(91,68,47,'+(a*.85)+')':'rgba(143,116,87,'+a+')';
    ctx.lineWidth=.30+rng()*1.15;ctx.beginPath();
    for(let x=0;x<=256;x+=4){
      let grain=y+Math.sin(x*frequency+y*.083)*drift+Math.sin(y*.23+x*.012)*2.2;
      for(const [cx,cy] of knots){
        const dist=Math.abs(y-cy);
        const lift=(y>=cy?1:-1)*(8.5-.33*dist)*Math.exp(-(((x-cx)/19)**2));
        if(dist<25)grain+=lift;
      }
      if(x===0)ctx.moveTo(x,grain);else ctx.lineTo(x,grain);
    }
    ctx.stroke();
  }
  for(const [x,y] of knots){
    for(let i=0;i<4;i++){
      ctx.strokeStyle='rgba(87,61,46,.20)';ctx.lineWidth=1.1;
      ctx.beginPath();ctx.ellipse(x,y,3.1+i*2.1,.68+i*1.25,-.081,0,TAU);ctx.stroke();
    }
  }
  for(let i=0;i<560;i++){
    ctx.fillStyle=i%3?'rgba(71,65,53,.10)':'rgba(255,250,229,.27)';
    ctx.fillRect(rng()*256,rng()*128,1+rng()*5,.40+rng()*.55);
  }
  penGrain=textureFromCanvas(c);
  return penGrain;
}

function timber(color){
  if(!timberMaterials.has(color)){
    timberMaterials.set(color,new THREE.MeshStandardMaterial({color,map:chestnutGrain(),roughness:.87}));
  }
  return timberMaterials.get(color);
}
function woodBatch(){
  return penBatch??=new THREE.MeshStandardMaterial({map:chestnutGrain(),roughness:.87});
}
function chestnut(parent,part,color,x,y,z,sx,sy,sz){
  const board=mesh(parent,part,timber(color),x,y,z,sx,sy,sz);
  board.userData.timber=true;return board;
}
function fence(x1,z1,x2,z2,solid=true){
  const d=Math.hypot(x2-x1,z2-z1),n=Math.ceil(d/2.12);
  if(!n)return;
  const angle=Math.atan2(z1-z2,x2-x1);
  for(let i=0;i<=n;i++){
    const xx=mix(x1,x2,i/n),zz=mix(z1,z2,i/n),y=groundY(xx,zz);
    const tilt=angle+.055*Math.sin(i*4);
    const post=chestnut(decor,'penPost',i%2?'#9f7954':'#ad8b64',xx,y+.675,zz,.21,1.43,.205);
    post.rotation.y=tilt;
    chestnut(decor,'penCap','#c3a17a',xx,y+1.407,zz,.25,.085,.24).rotation.y=tilt;
    if(i===n)break;
    const nx=mix(x1,x2,(i+1)/n),nz=mix(z1,z2,(i+1)/n),ny=groundY(nx,nz);
    for(const height of [.43,.93]){
      const color=choose(['#c1a17a','#b19471','#bc9b74','#d1ab7a']);
      const beam=chestnut(decor,'penRail',color,(xx+nx)/2,(y+ny)/2+height,(zz+nz)/2,Math.hypot(d/n,ny-y)+.09,.16,.106);
      beam.rotation.order='YXZ';beam.rotation.y=angle;beam.rotation.z=Math.atan2(ny-y,d/n);
    }
  }
  if(solid)colliders.push({x1,z1,x2,z2,height:1.43,thickness:.125});
}
let blackIron;
function ironForGate(){
  return blackIron??=new THREE.MeshStandardMaterial({color:'#645850',roughness:.76,metalness:.26});
}
function assembleGate(g,length){
  const plank=['#ad8b65','#bc9974','#bc9b7b'];
  for(const [i,h] of [.35,.84,1.26].entries()){
    chestnut(g,'penRail',plank[i],length*.5,h,0,length,.13,.109);
  }
  for(const x of [.09,length-.09])chestnut(g,'penPost','#997b60',x,.81,0,.14,1.24,.15);
  const brace=chestnut(g,'penRail','#c5a477',length*.5,.80,.075,Math.hypot(length-.14,.9),.105,.055);
  brace.rotation.z=Math.atan2(.9,length-.14);
  const iron=ironForGate();
  for(const y of [.35,1.26]){
    const hinge=mesh(g,'penRail',iron,.255,y,.081,.55,.075,.031);
    hinge.castShadow=true;
    mesh(g,'cyl',iron,-.024,y,0,.045,.183,.052);
    for(const x of [.11,.31,.46])mesh(g,'ball',iron,x,y,.103,.025,.023,.017);
  }
  mesh(g,'penRail',iron,length-.15,.86,.068,.43,.104,.039).rotation.z=.093;
  mesh(g,'ball',iron,length-.28,.86,.103,.055,.042,.034);
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
}

const troughColors=['#998d74','#b4aa91','#b9ab8e','#a1957d'];
function stoneTrough(parent,species){
  const [bottom,rim,wall,pier]=troughColors;
  mesh(parent,'penRail',bottom,0,.278,0,3.14,.36,.98);
  for(const z of [-.418,.418]){
    const board=mesh(parent,'penRail',wall,0,.491,z,3.18,.28,.18);
    board.rotation.x=z*.22;
    mesh(parent,'penRail',rim,0,.627,z*1.08,3.21,.087,.17);
  }
  for(const x of [-1.52,1.52])mesh(parent,'penCap',rim,x,.49,0,.215,.32,.97);
  const water=mesh(parent,'plane',new THREE.MeshStandardMaterial({
    color:species==='sheep'?'#83836b':'#71a4a4',roughness:.46,metalness:.14,side:THREE.DoubleSide
  }),0,.463,0,2.85,.67,1);
  water.rotation.x=-Math.PI/2;
  for(const x of [-1.04,1.04])mesh(parent,'penCap',pier,x,.16,0,.28,.31,1.13);
  const dirt=mesh(parent,'stone','#7d8063',1.31,.412,-.49,.26,.094,.083);
  dirt.rotation.y=.22;
}

const natureModels={"rock":{"position":[0.0,0.0,-1.00317,0.68706,-0.54309,-0.41802,-0.41902,-0.73288,-0.50521,-0.82234,0.036,-0.47557,-0.17254,0.84585,-0.49178,0.84703,0.49346,-0.42591,0.12034,-0.67419,0.40732,-0.82525,-0.537,0.41245,-0.59579,0.42316,0.36161,0.39106,0.78957,0.45996,0.83193,0.036,0.48037,0.0,0.0,1.08764,-0.34891,-0.69777,-0.71882,-0.23958,-0.47295,-0.89965,-0.11322,-0.2216,-1.00066,0.16711,-0.14458,-0.87996,0.36865,-0.31088,-0.79321,0.50249,-0.41749,-0.56503,0.40396,-0.61926,-0.43327,0.12313,-0.68904,-0.45386,-0.15177,-0.74266,-0.52382,0.85974,0.23975,-0.4473,0.93428,-0.04025,-0.51618,0.79589,-0.31959,-0.45892,0.21704,0.11498,-0.92088,0.40245,0.21014,-0.68777,0.68532,0.38509,-0.62849,-0.77531,0.04459,-0.73085,-0.485,0.04025,-0.8226,-0.22478,0.02188,-0.88442,-0.57089,-0.62607,-0.52323,-0.745,-0.42352,-0.56521,-0.77798,-0.16144,-0.50984,-0.14571,0.71798,-0.71157,-0.10432,0.51139,-0.92446,-0.0469,0.23671,-1.0076,-0.70077,0.23382,-0.5036,-0.59166,0.47964,-0.55502,-0.35456,0.64822,-0.50695,0.09437,0.72298,-0.45315,0.3637,0.70436,-0.48194,0.64987,0.63675,-0.48524,0.97151,-0.12076,0.32936,0.99695,-0.31432,0.06848,0.83586,-0.4491,-0.20003,0.89646,0.37985,-0.18152,1.01533,0.29373,0.06848,0.92712,0.15171,0.30685,0.03243,-0.74049,0.28009,-0.14,-0.744,-0.0,-0.27724,-0.74049,-0.24335,0.54534,-0.60674,-0.18473,0.4491,-0.71984,0.04232,0.35723,-0.73414,0.30686,-0.86847,-0.40536,0.17336,-0.94682,-0.27303,-0.06848,-1.01247,-0.12071,-0.32926,-0.58268,-0.73414,-0.29734,-0.66394,-0.70488,-0.04232,-0.84243,-0.70473,0.22354,-0.62653,0.65058,0.2144,-0.48135,0.76113,-0.04232,-0.3755,0.92503,-0.31738,-0.92176,0.15687,-0.3163,-1.0147,0.31969,-0.06848,-0.70251,0.34638,0.16111,0.54645,0.79412,0.27647,0.72083,0.7777,0.04232,0.68251,0.52611,-0.16509,-0.02594,0.91775,-0.26959,0.14,0.96246,0.0,0.29356,0.91832,0.26975,0.82913,-0.19299,0.58119,0.6604,-0.46096,0.60754,0.41672,-0.69006,0.57147,-0.08896,-0.74266,0.54495,-0.38073,-0.75644,0.516,-0.6149,-0.64317,0.45222,-0.77393,-0.28424,0.39426,-0.81836,-0.04025,0.44454,-0.95681,0.30047,0.55838,-0.51927,0.70859,0.54216,-0.14522,0.7274,0.49804,0.15054,0.80283,0.50306,0.60253,0.7134,0.55608,0.68407,0.44748,0.51866,0.83464,0.25172,0.54409,0.0394,-0.20172,0.91404,0.1007,-0.47616,0.90552,0.10582,-0.57626,0.59894,0.65168,0.04459,0.62295,0.54562,0.04025,0.92068,0.2731,0.02188,1.07064,-0.2306,-0.15954,0.98547,-0.55746,-0.38,0.99779,-0.6282,-0.41864,0.56687,-0.21099,0.13882,1.08898,-0.38474,0.25663,0.82539,-0.55804,0.38288,0.62495,0.11036,0.22692,0.96494,0.20448,0.39736,0.71586,0.30214,0.59145,0.58673,0.39931,0.27407,0.92224,0.76735,0.3214,0.87428,0.52661,0.5244,0.7652,-0.08687,0.40793,0.93763,0.034,0.75245,0.85083,-0.31562,0.57762,0.76977,-0.48904,-0.036,0.94588,-0.60716,0.09818,0.63118,-0.7114,-0.19879,0.69456,-0.20317,-0.4222,0.9196,-0.41357,-0.52407,0.63651,-0.14748,-0.62342,0.69717,0.30783,-0.20374,0.87803,0.39381,-0.48189,0.78849,0.58471,-0.19651,0.75065,0.81696,0.36908,0.30497,0.85119,0.51953,0.05825,0.80191,0.68985,0.33901,-0.00814,0.90079,0.27262,-0.17579,0.88425,-0.02225,-0.319,0.76383,0.23856,-0.99168,0.13824,0.22781,-0.93499,-0.0,-0.072,-0.8425,-0.15432,0.17101,-0.58715,-0.75512,0.25708,-0.49576,-0.744,-0.02225,-0.27251,-0.74744,0.26877,0.52333,-0.57453,0.30362,0.76646,-0.57348,0.05825,0.80308,-0.37449,0.33871,0.44836,0.90221,0.02225,0.55587,0.76151,-0.23775,0.26812,0.86039,-0.25999,-0.73904,0.55496,-0.05825,-0.5101,0.59529,-0.29817,-0.96937,0.49369,-0.39204,-0.85064,-0.51916,-0.05825,-0.94459,-0.38478,-0.3459,-0.73482,-0.59246,-0.31137,0.17004,-0.744,0.02225,0.00456,-0.74744,-0.26546,0.31352,-0.75512,-0.23517,0.95978,0.0,0.072,0.9519,-0.17902,-0.2162,0.8818,0.11346,-0.18247,0.44078,0.51806,-0.69093,0.21176,0.42455,-0.97521,0.15616,0.72177,-0.81613,-0.32009,0.45954,-0.66921,-0.36634,0.30152,-1.02269,-0.66849,0.31173,-0.84564,-0.67101,-0.20137,-0.76504,-0.4421,-0.24473,-1.028,-0.504,-0.44142,-0.7286,0.64805,0.09715,-0.62622,0.72542,-0.21219,-0.75874,0.42177,-0.036,-0.81134,-0.04209,-0.66126,-0.73995,0.09528,-0.45425,-0.99206,0.25919,-0.53949,-0.65691],"normal":[0.06204,-0.0675,-0.99579,0.50897,-0.72887,-0.45792,-0.25767,-0.94557,-0.19878,-0.83184,0.19427,-0.51991,-0.04527,0.82514,-0.56311,0.81247,0.52408,-0.25543,0.11177,-0.92233,0.36989,-0.78176,-0.21071,0.5869,-0.80518,0.55566,0.20718,0.16215,0.79098,0.58996,0.77304,0.06906,0.63059,0.07192,-0.17238,0.9824,-0.29942,-0.76486,-0.57039,-0.21841,-0.55227,-0.80454,0.03517,0.01561,-0.99926,0.40734,-0.04811,-0.91201,0.44787,-0.38506,-0.80693,0.39923,-0.66593,-0.6302,0.35914,-0.81114,-0.4616,0.23175,-0.91778,-0.32245,0.08216,-0.98399,-0.15815,0.88931,0.12451,-0.44002,0.89578,0.05234,-0.4414,0.73004,-0.52901,-0.43266,0.51011,-0.05699,-0.85822,0.55108,0.11604,-0.82635,0.51484,0.15795,-0.84261,-0.83714,0.01943,-0.54665,-0.39459,-0.0323,-0.91829,-0.2352,0.01445,-0.97184,-0.58538,-0.65895,-0.47235,-0.69995,-0.40337,-0.58937,-0.8302,-0.09948,-0.54852,-0.36917,0.76931,-0.52142,-0.28247,0.54784,-0.78746,0.0174,-0.01351,-0.99976,-0.83066,0.24257,-0.50116,-0.44696,0.72765,-0.52034,-0.60808,0.55205,-0.5705,0.17338,0.91052,-0.37537,0.24717,0.87461,-0.41708,0.51498,0.75513,-0.40567,0.94155,-0.07818,0.32767,0.93613,-0.34741,0.05436,0.73743,-0.63123,-0.2403,0.89414,0.40504,-0.19095,0.97463,0.22031,0.03952,0.92571,0.1666,0.33958,0.07954,-0.99076,0.10989,-0.00032,-1.0,-0.00077,-0.01878,-0.99974,-0.01264,0.45746,-0.87116,-0.17835,0.36033,-0.93239,0.0286,0.28653,-0.9496,0.12712,-0.97941,-0.0174,0.20114,-0.96343,-0.13792,0.22974,-0.95068,0.03277,-0.30843,-0.38584,-0.90747,-0.16622,-0.44357,-0.88401,-0.14753,-0.71642,-0.68819,0.11462,-0.77269,0.59959,0.20844,-0.58125,0.81292,0.03614,-0.51369,0.82323,-0.24169,-0.89427,0.01375,-0.44731,-0.93685,0.29863,0.18204,-0.71805,0.63649,0.28159,0.35623,0.90478,0.23339,0.67642,0.71292,-0.18495,0.74872,0.63661,-0.18478,0.10492,0.95168,-0.2886,0.0092,0.99902,-0.04323,0.17782,0.9401,0.29084,0.77135,-0.11424,0.62607,0.67183,-0.57683,0.46466,0.26409,-0.88724,0.37824,0.21571,-0.89853,0.38224,-0.22489,-0.86024,0.45761,-0.42534,-0.63219,0.64762,-0.92813,-0.07015,0.36558,-0.85609,-0.26644,0.44286,-0.7686,0.37418,0.51889,-0.58527,0.70748,0.39616,-0.24326,0.92272,0.29902,0.10948,0.87135,0.47828,0.40057,0.68549,0.60798,0.8291,0.41095,0.37909,0.92769,0.14956,0.34209,0.12075,-0.35423,0.92733,0.15382,-0.55081,0.82033,0.13575,-0.87068,0.47274,0.7934,-0.1657,0.58572,0.58932,-0.24889,0.76861,0.23635,-0.09644,0.96687,-0.0034,-0.25847,0.96601,-0.48091,-0.43249,0.76268,-0.69169,-0.47979,0.53977,-0.25452,0.23779,0.93738,-0.63317,0.37549,0.67684,-0.64842,0.36995,0.66535,0.18148,0.5624,0.8067,0.2272,0.53591,0.81313,0.18198,0.60848,0.77242,0.04145,0.50116,0.86436,0.7378,0.20312,0.64373,0.14451,0.71978,0.679,0.0101,0.41424,0.91011,0.16429,0.69712,0.69787,-0.46073,0.54156,0.70317,-0.59246,0.25954,0.76265,-0.64838,0.17289,0.74142,-0.90888,-0.03897,0.41524,-0.00417,-0.55438,0.83225,-0.39353,-0.69964,0.59635,-0.04148,-0.7736,0.63232,0.30887,-0.36684,0.87751,0.31862,-0.53259,0.78411,0.60605,-0.18591,0.77339,0.87289,0.33549,0.35427,0.86252,0.49329,-0.11286,0.79697,0.51551,0.31478,-0.23371,0.92377,0.30337,-0.27536,0.94742,0.16299,-0.32091,0.92946,0.18201,-0.9875,0.0563,0.14722,-0.99021,-0.09791,0.09952,-0.94866,-0.16016,0.27274,-0.17773,-0.9757,0.12816,-0.08807,-0.99563,-0.03102,0.02388,-0.99962,-0.01375,0.59589,-0.78329,0.17714,0.57008,-0.81621,0.09385,0.70503,-0.63305,0.31967,0.33777,0.93861,-0.07017,0.56208,0.75923,-0.32809,0.20838,0.87573,-0.43552,-0.63195,0.7573,0.16473,-0.58745,0.7474,-0.31032,-0.74216,0.49814,-0.44839,-0.85584,-0.51155,-0.07654,-0.85615,-0.39448,-0.33376,-0.66127,-0.70449,-0.25771,0.02548,-0.99936,0.02528,0.02885,-0.99675,-0.07524,0.25712,-0.9472,-0.19158,0.99685,0.04261,-0.06693,0.97337,-0.11535,-0.19811,0.98164,0.07856,-0.17379,0.55148,0.39757,-0.73335,0.4215,0.18517,-0.88772,0.20416,0.82286,-0.53031,-0.46405,0.69554,-0.54852,-0.32147,0.21118,-0.92307,-0.67371,0.3982,-0.62253,-0.7355,-0.19178,-0.64982,-0.38738,-0.09341,-0.91718,-0.56746,-0.51557,-0.64201,0.4556,0.25634,-0.85247,0.54678,-0.25743,-0.79672,0.39029,0.15019,-0.90836,0.18611,-0.85408,-0.48571,0.29347,-0.39066,-0.8725,0.47967,-0.73487,-0.47947],"uv":[0.39968,0.39968,0.75363,0.22467,0.2693,0.13434,0.09884,0.46792,0.37663,0.81454,0.82163,0.6696,0.59248,0.25083,0.18639,0.31034,0.27997,0.71812,0.71415,0.88551,0.90577,0.56352,0.60876,0.60876,0.27809,0.12808,0.30702,0.20667,0.35125,0.30465,0.48386,0.34984,0.5792,0.287,0.65957,0.26398,0.63038,0.19039,0.50756,0.15833,0.38236,0.12827,0.82496,0.55836,0.85012,0.43108,0.79634,0.31669,0.50124,0.45735,0.60428,0.52158,0.73184,0.60274,0.09353,0.44609,0.20919,0.43505,0.3149,0.42097,0.2022,0.17847,0.12313,0.26137,0.11449,0.3796,0.36619,0.73757,0.3627,0.62745,0.37907,0.50103,0.14831,0.55018,0.19008,0.65074,0.29685,0.72804,0.49527,0.76556,0.6082,0.75468,0.73092,0.72528,0.95068,0.48101,0.93554,0.37169,0.83942,0.28689,0.86732,0.64518,0.94344,0.63315,0.92935,0.59592,0.54195,0.2096,0.4398,0.18008,0.35645,0.15725,0.71603,0.22063,0.69734,0.1947,0.6843,0.215,0.1439,0.34303,0.08602,0.37575,0.03171,0.41517,0.21971,0.15458,0.21027,0.19267,0.16011,0.21932,0.25203,0.80119,0.28879,0.82305,0.3068,0.86602,0.07201,0.53582,0.05683,0.63062,0.21403,0.66505,0.76262,0.86912,0.81419,0.83864,0.77697,0.70972,0.46188,0.86767,0.5602,0.91386,0.65321,0.92185,0.91465,0.47513,0.84473,0.36254,0.73634,0.26042,0.51624,0.23515,0.38789,0.22633,0.28081,0.26866,0.20664,0.4172,0.19256,0.52715,0.14441,0.68504,0.33093,0.85891,0.48736,0.86259,0.61504,0.89552,0.8147,0.86237,0.84602,0.74428,0.91331,0.66265,0.60834,0.50467,0.63385,0.38581,0.6054,0.3121,0.84252,0.58147,0.82668,0.60938,0.7245,0.61647,0.49939,0.52994,0.36007,0.43638,0.28656,0.37667,0.51817,0.66859,0.4171,0.69289,0.32254,0.72713,0.64395,0.69407,0.65951,0.74245,0.68859,0.813,0.76393,0.71007,0.91739,0.72563,0.80296,0.80201,0.55641,0.76917,0.5997,0.90864,0.44126,0.82535,0.3843,0.57911,0.30204,0.60534,0.26355,0.48398,0.5046,0.41041,0.38582,0.3383,0.5063,0.30165,0.72017,0.5002,0.74819,0.37164,0.82649,0.49056,0.88179,0.6892,0.87184,0.72922,0.87872,0.83053,0.52376,0.9146,0.42219,0.878,0.38669,0.8523,0.09636,0.58223,0.09076,0.4928,0.15483,0.45074,0.27323,0.201,0.2846,0.17785,0.4097,0.20548,0.75539,0.28331,0.8354,0.25923,0.8792,0.37284,0.69502,0.89017,0.71525,0.80368,0.58929,0.84397,0.17639,0.73281,0.25084,0.72616,0.04397,0.67308,0.1284,0.27094,0.05924,0.29995,0.15289,0.2141,0.57534,0.1823,0.47541,0.15206,0.6113,0.15178,0.91991,0.5072,0.8877,0.4014,0.86093,0.53054,0.62044,0.65367,0.49354,0.58503,0.48554,0.72875,0.29544,0.63068,0.2402,0.52739,0.12799,0.54948,0.13496,0.33691,0.2071,0.29197,0.21042,0.23733,0.71604,0.47915,0.73606,0.33288,0.60023,0.40339,0.40791,0.14166,0.44176,0.20547,0.54576,0.20233],"index":[0,15,14,1,17,23,0,14,29,0,29,35,0,35,24,1,23,44,2,20,50,3,32,56,4,38,62,5,41,68,1,44,51,2,50,57,3,56,63,4,62,69,5,68,45,6,74,89,7,77,95,8,80,98,9,83,101,10,86,90,92,99,11,91,102,92,90,103,91,92,102,99,102,100,99,91,103,102,103,104,102,102,104,100,104,101,100,90,86,103,86,85,103,103,85,104,85,84,104,104,84,101,84,9,101,99,96,11,100,105,99,101,106,100,99,105,96,105,97,96,100,106,105,106,107,105,105,107,97,107,98,97,101,83,106,83,82,106,106,82,107,82,81,107,107,81,98,81,8,98,96,93,11,97,108,96,98,109,97,96,108,93,108,94,93,97,109,108,109,110,108,108,110,94,110,95,94,98,80,109,80,79,109,109,79,110,79,78,110,110,78,95,78,7,95,93,87,11,94,111,93,95,112,94,93,111,87,111,88,87,94,112,111,112,113,111,111,113,88,113,89,88,95,77,112,77,76,112,112,76,113,76,75,113,113,75,89,75,6,89,87,92,11,88,114,87,89,115,88,87,114,92,114,91,92,88,115,114,115,116,114,114,116,91,116,90,91,89,74,115,74,73,115,115,73,116,73,72,116,116,72,90,72,10,90,47,86,10,46,117,47,45,118,46,47,117,86,117,85,86,46,118,117,118,119,117,117,119,85,119,84,85,45,68,118,68,67,118,118,67,119,67,66,119,119,66,84,66,9,84,71,83,9,70,120,71,69,121,70,71,120,83,120,82,83,70,121,120,121,122,120,120,122,82,122,81,82,69,62,121,62,61,121,121,61,122,61,60,122,122,60,81,60,8,81,65,80,8,64,123,65,63,124,64,65,123,80,123,79,80,64,124,123,124,125,123,123,125,79,125,78,79,63,56,124,56,55,124,124,55,125,55,54,125,125,54,78,54,7,78,59,77,7,58,126,59,57,127,58,59,126,77,126,76,77,58,127,126,127,128,126,126,128,76,128,75,76,57,50,127,50,49,127,127,49,128,49,48,128,128,48,75,48,6,75,53,74,6,52,129,53,51,130,52,53,129,74,129,73,74,52,130,129,130,131,129,129,131,73,131,72,73,51,44,130,44,43,130,130,43,131,43,42,131,131,42,72,42,10,72,66,71,9,67,132,66,68,133,67,66,132,71,132,70,71,67,133,132,133,134,132,132,134,70,134,69,70,68,41,133,41,40,133,133,40,134,40,39,134,134,39,69,39,4,69,60,65,8,61,135,60,62,136,61,60,135,65,135,64,65,61,136,135,136,137,135,135,137,64,137,63,64,62,38,136,38,37,136,136,37,137,37,36,137,137,36,63,36,3,63,54,59,7,55,138,54,56,139,55,54,138,59,138,58,59,55,139,138,139,140,138,138,140,58,140,57,58,56,32,139,32,31,139,139,31,140,31,30,140,140,30,57,30,2,57,48,53,6,49,141,48,50,142,49,48,141,53,141,52,53,49,142,141,142,143,141,141,143,52,143,51,52,50,20,142,20,19,142,142,19,143,19,18,143,143,18,51,18,1,51,42,47,10,43,144,42,44,145,43,42,144,47,144,46,47,43,145,144,145,146,144,144,146,46,146,45,46,44,23,145,23,22,145,145,22,146,22,21,146,146,21,45,21,5,45,26,41,5,25,147,26,24,148,25,26,147,41,147,40,41,25,148,147,148,149,147,147,149,40,149,39,40,24,35,148,35,34,148,148,34,149,34,33,149,149,33,39,33,4,39,33,38,4,34,150,33,35,151,34,33,150,38,150,37,38,34,151,150,151,152,150,150,152,37,152,36,37,35,29,151,29,28,151,151,28,152,28,27,152,152,27,36,27,3,36,27,32,3,28,153,27,29,154,28,27,153,32,153,31,32,28,154,153,154,155,153,153,155,31,155,30,31,29,14,154,14,13,154,154,13,155,13,12,155,155,12,30,12,2,30,21,26,5,22,156,21,23,157,22,21,156,26,156,25,26,22,157,156,157,158,156,156,158,25,158,24,25,23,17,157,17,16,157,157,16,158,16,15,158,158,15,24,15,0,24,12,20,2,13,159,12,14,160,13,12,159,20,159,19,20,13,160,159,160,161,159,159,161,19,161,18,19,14,15,160,15,16,160,160,16,161,16,17,161,161,17,18,17,1,18]},"stone":{"position":[0.0,0.0,-1.00317,0.68706,-0.54309,-0.41802,-0.41902,-0.73288,-0.50521,-0.82234,0.036,-0.47557,-0.17254,0.84585,-0.49178,0.84703,0.49346,-0.42591,0.12034,-0.67419,0.40732,-0.82525,-0.537,0.41245,-0.59579,0.42316,0.36161,0.39106,0.78957,0.45996,0.83193,0.036,0.48037,0.0,0.0,1.08764,-0.23958,-0.47295,-0.89965,0.36865,-0.31088,-0.79321,0.12313,-0.68904,-0.45386,0.93428,-0.04025,-0.51618,0.40245,0.21014,-0.68777,-0.485,0.04025,-0.8226,-0.745,-0.42352,-0.56521,-0.10432,0.51139,-0.92446,-0.59166,0.47964,-0.55502,0.3637,0.70436,-0.48195,0.99695,-0.31432,0.06848,1.01533,0.29373,0.06848,-0.14,-0.744,0.0,0.4491,-0.71984,0.04232,-0.94682,-0.27303,-0.06848,-0.66394,-0.70488,-0.04232,-0.48135,0.76113,-0.04232,-1.0147,0.31969,-0.06848,0.72083,0.7777,0.04232,0.14,0.96246,0.0,0.6604,-0.46096,0.60754,-0.38073,-0.75644,0.516,-0.81836,-0.04025,0.44454,-0.14522,0.7274,0.49804,0.68407,0.44748,0.51866,0.1007,-0.47616,0.90552,0.54562,0.04025,0.92068,-0.55746,-0.38,0.99779,-0.38474,0.25663,0.82539,0.20448,0.39736,0.71586],"normal":[0.13647,0.01292,-0.99056,0.54952,-0.72347,-0.41788,-0.24697,-0.9003,-0.35843,-0.83064,0.0783,-0.55127,-0.2012,0.89061,-0.40784,0.67161,0.49051,-0.55528,0.17982,-0.94886,0.25948,-0.82173,-0.50112,0.27135,-0.64981,0.58715,0.4827,0.2586,0.7613,0.5946,0.86305,0.03422,0.50396,0.04221,0.20265,0.97834,-0.13883,-0.51203,-0.84767,0.414,-0.35172,-0.83958,0.18015,-0.91326,-0.36537,0.78978,-0.06937,-0.60945,0.45384,0.2494,-0.85547,-0.55793,0.08452,-0.82557,-0.75389,-0.38103,-0.53522,-0.02984,0.48343,-0.87488,-0.65121,0.52923,-0.54392,0.35678,0.72291,-0.5917,0.90123,-0.42088,0.10316,0.95608,0.25158,0.1504,0.02989,-0.99954,-0.00424,0.31479,-0.94756,0.05504,-0.96282,-0.26101,-0.06971,-0.5205,-0.85068,-0.07363,-0.53573,0.84064,0.07947,-0.9252,0.37946,0.0042,0.60908,0.79165,0.04797,0.03084,0.99946,0.01101,0.6049,-0.60927,0.51273,-0.13456,-0.94495,0.29828,-0.87353,0.18745,0.44924,-0.2674,0.76983,0.57953,0.63032,0.46684,0.62029,0.21687,-0.64682,0.73116,0.53217,0.14198,0.83465,-0.50549,-0.28223,0.81537,-0.44305,0.53759,0.71742,0.11994,0.58903,0.79916],"uv":[0.39968,0.39968,0.75363,0.22467,0.2693,0.13434,0.09884,0.46792,0.37663,0.81454,0.82163,0.6696,0.59248,0.25083,0.18639,0.31034,0.27997,0.71812,0.71415,0.88551,0.90577,0.56352,0.60876,0.60876,0.30702,0.20667,0.5792,0.287,0.50756,0.15833,0.85012,0.43108,0.60428,0.52158,0.20919,0.43505,0.12313,0.26137,0.3627,0.62745,0.19008,0.65074,0.6082,0.75468,0.93554,0.37169,0.94344,0.63315,0.4398,0.18008,0.69734,0.1947,0.08602,0.37575,0.21027,0.19267,0.28879,0.82305,0.05683,0.63062,0.81419,0.83864,0.5602,0.91386,0.84473,0.36254,0.38789,0.22633,0.19256,0.52715,0.48736,0.86259,0.84602,0.74428,0.63385,0.38581,0.82668,0.60938,0.36007,0.43638,0.4171,0.69289,0.65951,0.74245],"index":[0,13,12,1,13,15,0,12,17,0,17,19,0,19,16,1,15,22,2,14,24,3,18,26,4,20,28,5,21,30,1,22,25,2,24,27,3,26,29,4,28,31,5,30,23,6,32,37,7,33,39,8,34,40,9,35,41,10,36,38,38,41,11,38,36,41,36,9,41,41,40,11,41,35,40,35,8,40,40,39,11,40,34,39,34,7,39,39,37,11,39,33,37,33,6,37,37,38,11,37,32,38,32,10,38,23,36,10,23,30,36,30,9,36,31,35,9,31,28,35,28,8,35,29,34,8,29,26,34,26,7,34,27,33,7,27,24,33,24,6,33,25,32,6,25,22,32,22,10,32,30,31,9,30,21,31,21,4,31,28,29,8,28,20,29,20,3,29,26,27,7,26,18,27,18,2,27,24,25,6,24,14,25,14,1,25,22,23,10,22,15,23,15,5,23,16,21,5,16,19,21,19,4,21,19,20,4,19,17,20,17,3,20,17,18,3,17,12,18,12,2,18,15,16,5,15,13,16,13,0,16,12,14,2,12,13,14,13,1,14]},"canopy":{"position":[0.0,0.0,-0.90281,0.72736,-0.52846,-0.44954,-0.26698,-0.8217,-0.432,-0.88084,0.0,-0.44042,-0.27584,0.84897,-0.44634,0.67308,0.48902,-0.41599,0.24504,-0.75417,0.3965,-0.85928,-0.62429,0.53107,-0.74279,0.53966,0.45908,0.29641,0.91226,0.47961,0.86285,0.0,0.43143,0.0,0.0,1.05448,-0.24365,-0.7499,-0.68811,-0.17488,-0.53825,-0.91573,-0.07977,-0.2455,-0.9949,0.21317,-0.15487,-1.01554,0.42842,-0.31126,-0.85686,0.53161,-0.38624,-0.57345,0.48417,-0.62049,-0.45719,0.26269,-0.80847,-0.52539,-0.02666,-0.7772,-0.45174,0.83287,0.30256,-0.51475,0.96499,0.0,-0.59641,0.89579,-0.32541,-0.55364,0.19591,0.14234,-0.93333,0.4268,0.31008,-0.8536,0.64061,0.46543,-0.69103,-0.81332,0.0,-0.70977,-0.47713,0.0,-0.77201,-0.25531,0.0,-0.984,-0.42138,-0.62389,-0.43734,-0.6857,-0.49819,-0.52384,-0.77248,-0.22202,-0.4669,-0.23619,0.72692,-0.66702,-0.15746,0.48462,-0.82449,-0.07584,0.23342,-0.94594,-0.88135,0.25331,-0.5327,-0.74107,0.53842,-0.56614,-0.45176,0.66887,-0.46887,-0.0312,0.90978,-0.5288,0.27414,0.84371,-0.54828,0.5675,0.72728,-0.53588,0.96545,-0.14898,0.25347,1.11026,-0.36074,-0.0,0.86951,-0.44739,-0.25372,0.76402,0.39311,-0.22294,1.00524,0.32662,0.0,0.80325,0.12395,0.21088,0.17678,-1.08818,0.28605,0.0,-0.98703,-0.0,-0.15541,-0.95664,-0.25147,0.6294,-0.62442,-0.23004,0.63397,-0.87258,0.0,0.45285,-0.89757,0.26085,-0.84038,-0.4324,0.24522,-0.88728,-0.28829,-0.0,-1.02115,-0.15757,-0.26809,-0.3873,-0.76766,-0.2231,-0.54849,-0.75493,0.0,-0.72812,-0.72235,0.26612,-0.65208,0.64692,0.23833,-0.61024,0.83992,-0.0,-0.44453,0.88107,-0.25606,-0.94248,0.14544,-0.24744,-0.867,0.2817,0.0,-0.89244,0.45919,0.26041,0.46809,0.92778,0.26963,0.59083,0.81321,-0.0,0.61363,0.60877,-0.22428,-0.13838,0.8518,-0.22391,0.0,0.98006,0.0,0.15264,0.93956,0.24698,0.69756,-0.20049,0.42162,0.70955,-0.51552,0.54205,0.49133,-0.72746,0.50994,0.02877,-0.83871,0.4875,-0.24805,-0.76342,0.49611,-0.59823,-0.76667,0.5649,-0.78925,-0.28671,0.48779,-0.81621,0.0,0.50445,-0.8165,0.29661,0.50463,-0.55949,0.71702,0.52831,-0.24471,0.75313,0.48943,0.02718,0.7925,0.46064,0.44997,0.66623,0.46702,0.62596,0.45478,0.4782,0.86916,0.24981,0.52533,0.08099,-0.24925,1.0101,0.18207,-0.56035,0.95333,0.22975,-0.7071,0.64884,0.80658,0.0,0.70389,0.57913,0.0,0.93706,0.22061,0.0,0.85026,-0.20002,-0.14532,0.95287,-0.46962,-0.34119,0.93924,-0.63418,-0.46075,0.68409,-0.19526,0.14186,0.9302,-0.42303,0.30734,0.84606,-0.6062,0.44043,0.65391,0.07926,0.24394,0.98856,0.16641,0.51216,0.87135,0.23375,0.71943,0.66015,0.34134,0.248,0.84384,0.61498,0.2533,0.69729,0.43096,0.50663,0.69732,-0.13443,0.41372,0.87003,-0.05605,0.73067,0.76829,-0.32029,0.52033,0.64058,-0.43524,0.0,0.8705,-0.69904,0.16929,0.75405,-0.72387,-0.17531,0.78084,-0.13649,-0.42008,0.8834,-0.45424,-0.73794,0.90848,-0.05315,-0.69284,0.72851,0.37493,-0.2724,0.92689,0.43664,-0.51331,0.70651,0.5656,-0.23297,0.6413,0.88631,0.43742,0.28426,0.84721,0.61553,0.0,0.60558,0.62126,0.24952,-0.15038,1.03491,0.30077,-0.33638,1.03526,-0.0,-0.49373,0.93913,0.30515,-1.01301,0.17374,0.2956,-1.0657,-0.0,0.0,-0.89426,-0.15338,0.26094,-0.46394,-0.88246,0.28673,-0.30962,-0.9529,-0.0,-0.13272,-0.91338,0.26545,0.67339,-0.69083,0.27746,0.76309,-0.55441,-0.0,0.89502,-0.44172,0.28705,0.32263,0.99294,-0.0,0.42902,0.81603,-0.26515,0.15785,1.08627,-0.31569,-0.87094,0.63277,-0.0,-0.61928,0.63532,-0.25516,-0.82179,0.40558,-0.26356,-0.71189,-0.51722,0.0,-0.86421,-0.42651,-0.27717,-0.66982,-0.68717,-0.27599,0.28981,-0.89196,0.0,0.11198,-0.77063,-0.22396,0.47936,-0.9118,-0.29627,1.01646,0.0,0.0,0.91106,-0.15626,-0.26585,0.88723,0.15217,-0.25889,0.34174,0.55518,-0.68348,0.1638,0.50412,-1.06014,0.05222,0.68078,-0.71582,-0.45658,0.53674,-0.73877,-0.33327,0.24213,-0.8239,-0.6969,0.28704,-0.79017,-0.64279,-0.26476,-0.72882,-0.36735,-0.2669,-0.90816,-0.45455,-0.53436,-0.73548,0.62589,0.15158,-0.67514,0.65446,-0.1585,-0.70596,0.45303,-0.0,-0.90606,0.05626,-0.73341,-0.77116,0.13849,-0.42621,-0.8963,0.39633,-0.64386,-0.79265],"normal":[0.01586,0.12679,-0.9918,0.43564,-0.74894,-0.4993,-0.41886,-0.83592,-0.35468,-0.90687,-0.12295,-0.40307,-0.3494,0.87902,-0.32441,0.83686,0.54238,-0.07417,0.24514,-0.77329,0.58474,-0.84417,-0.35845,0.39862,-0.7292,0.54453,0.41443,0.17499,0.81141,0.55767,0.966,-0.15825,0.20447,0.07106,0.05305,0.99606,-0.34521,-0.8426,-0.41335,-0.17829,-0.44801,-0.87607,-0.0412,-0.08293,-0.9957,0.1353,-0.04581,-0.98975,0.58255,-0.30778,-0.75227,0.58797,-0.48884,-0.64446,0.6634,-0.56373,-0.49204,0.15791,-0.94498,-0.28649,0.11,-0.96525,-0.23706,0.81258,0.46306,-0.35398,0.84974,0.10531,-0.51658,0.71839,-0.44821,-0.532,0.10128,-0.02109,-0.99463,0.55204,0.21982,-0.80432,0.61814,0.39086,-0.68201,-0.71731,-0.19399,-0.66921,-0.41316,0.02666,-0.91027,-0.28275,0.14466,-0.94822,-0.49338,-0.79014,-0.36367,-0.66069,-0.55365,-0.50691,-0.80786,-0.30916,-0.50178,-0.29743,0.67268,-0.67752,-0.33479,0.42691,-0.84003,-0.22918,0.05918,-0.97158,-0.93026,0.21916,-0.29425,-0.64779,0.68098,-0.34152,-0.51417,0.7511,-0.4141,-0.19712,0.83819,-0.50851,0.33417,0.69441,-0.63728,0.62107,0.67809,-0.39302,0.82121,0.12078,0.55769,0.94084,-0.33477,-0.0524,0.75284,-0.6149,-0.2348,0.78204,0.50977,-0.35853,0.97742,0.20574,-0.04822,0.95719,0.09752,0.27254,0.14709,-0.94421,0.29467,0.0661,-0.96599,-0.24999,-0.0324,-0.92451,-0.37978,0.72493,-0.61144,-0.31721,0.6516,-0.75738,-0.0424,0.39825,-0.85035,0.34396,-0.9634,-0.25957,-0.06692,-0.85762,-0.49982,0.12112,-0.92016,-0.22275,-0.32199,-0.50755,-0.79637,-0.32893,-0.62452,-0.75669,-0.19337,-0.70957,-0.6774,-0.194,-0.71636,0.64761,0.25968,-0.6956,0.71177,-0.09763,-0.42853,0.79179,-0.43524,-0.92668,0.33177,-0.17662,-0.93639,0.32276,-0.13785,-0.86462,0.46313,0.19478,0.57217,0.76674,0.29109,0.68659,0.71938,-0.10526,0.75628,0.58506,-0.29281,-0.20644,0.94995,-0.23447,-0.03578,0.99797,-0.05264,0.04806,0.96153,0.27048,0.76998,-0.24396,0.58958,0.71397,-0.28263,0.6406,0.34567,-0.76791,0.53928,0.02038,-0.82442,0.56562,-0.03036,-0.93322,0.35803,-0.40772,-0.83432,0.37103,-0.93306,-0.06166,0.35439,-0.89479,-0.08321,0.43866,-0.78894,0.24588,0.56314,-0.4356,0.62908,0.64383,-0.17344,0.70154,0.6912,-0.06614,0.85286,0.51793,0.6992,0.49812,0.51284,0.57267,0.63972,0.51264,0.86754,0.30979,0.38911,0.06414,-0.0775,0.99493,0.16547,-0.561,0.81111,0.2698,-0.85243,0.44784,0.81154,-0.20591,0.54681,0.42545,0.00732,0.90495,0.27349,0.09925,0.95674,-0.24182,-0.06591,0.96808,-0.34707,-0.06597,0.93552,-0.75342,-0.21756,0.6205,-0.30804,0.1845,0.93331,-0.31585,0.40964,0.85582,-0.46589,0.48908,0.7374,0.16783,0.2027,0.96475,0.25848,0.42925,0.86541,0.32201,0.71341,0.62238,0.3548,0.23712,0.90437,0.5182,0.51204,0.68504,0.58162,0.49048,0.64896,-0.29722,0.41421,0.86029,-0.20151,0.74232,0.63903,-0.32461,0.58785,0.74099,-0.31523,0.13166,0.93984,-0.66749,0.20899,0.71469,-0.7623,-0.091,0.64079,-0.05324,-0.31381,0.94799,-0.26504,-0.63782,0.72315,0.04498,-0.81511,0.57756,0.48681,-0.14926,0.86066,0.58713,-0.44268,0.67772,0.74558,-0.36537,0.55732,0.82328,0.39989,0.40286,0.72659,0.67435,-0.13163,0.65841,0.60794,0.44375,0.05877,0.90138,0.42903,-0.18868,0.95536,-0.22733,-0.52395,0.76024,0.38407,-0.95005,0.12575,0.28565,-0.99931,0.00563,0.03679,-0.90435,-0.29192,0.31134,-0.30089,-0.94067,0.15689,-0.38078,-0.91991,-0.09362,-0.24502,-0.90837,0.33887,0.7266,-0.64013,0.24958,0.7201,-0.68761,-0.09299,0.78361,-0.40944,0.46723,0.32092,0.94675,0.02589,0.65029,0.73304,-0.19944,0.06344,0.97281,-0.22273,-0.83955,0.53748,-0.07921,-0.64924,0.67291,-0.35452,-0.88991,0.43695,-0.13092,-0.82855,-0.55757,-0.05121,-0.84631,-0.49884,-0.18684,-0.5556,-0.80207,-0.21908,0.12044,-0.9504,-0.28676,0.10056,-0.95282,-0.2864,0.34581,-0.85742,-0.38112,0.97568,0.21512,0.042,0.97521,-0.0136,-0.22088,0.94275,0.26426,-0.20346,0.3482,0.61436,-0.70804,0.13103,0.41685,-0.89948,0.05177,0.70055,-0.71172,-0.29918,0.56692,-0.76753,-0.32349,0.21152,-0.92229,-0.45853,0.1893,-0.86828,-0.64745,-0.24206,-0.72264,-0.48255,-0.12643,-0.86669,-0.56653,-0.59111,-0.57413,0.58589,0.11645,-0.80198,0.51328,-0.2403,-0.82389,0.53107,0.07342,-0.84414,0.03386,-0.79533,-0.60523,0.16497,-0.3664,-0.91571,0.56076,-0.54048,-0.62724],"uv":[0.40972,0.40972,0.76781,0.22781,0.342,0.10347,0.0772,0.45596,0.33675,0.82043,0.74783,0.66868,0.64502,0.21536,0.18362,0.28466,0.22651,0.77796,0.67542,0.94023,0.91417,0.54314,0.60545,0.60545,0.32642,0.10873,0.33323,0.17698,0.36621,0.29494,0.49011,0.33185,0.59854,0.28047,0.67125,0.27657,0.66247,0.18747,0.56042,0.09982,0.44336,0.12063,0.80666,0.57862,0.85531,0.44036,0.82983,0.30471,0.49091,0.46787,0.59816,0.54797,0.70636,0.63103,0.07929,0.42902,0.21763,0.4228,0.29182,0.4016,0.27507,0.188,0.15276,0.2334,0.12115,0.35784,0.33174,0.74587,0.34984,0.62594,0.37279,0.50578,0.06775,0.55565,0.12472,0.67491,0.25886,0.74073,0.4337,0.83833,0.56305,0.80797,0.69044,0.75914,0.94049,0.46129,0.97741,0.34488,0.84852,0.28225,0.80623,0.64674,0.93225,0.64044,0.86648,0.57439,0.60462,0.06069,0.5,0.07558,0.40803,0.0635,0.74764,0.2085,0.77261,0.12479,0.72081,0.14013,0.16316,0.33859,0.11847,0.37603,0.0341,0.40543,0.31115,0.1476,0.26415,0.17538,0.21352,0.216,0.24344,0.80201,0.2376,0.86117,0.28325,0.85326,0.06999,0.53779,0.12719,0.62113,0.14229,0.72349,0.72824,0.92591,0.75406,0.84968,0.74143,0.73934,0.41811,0.84388,0.5,0.92142,0.59033,0.92871,0.84211,0.45595,0.85931,0.33253,0.76227,0.23819,0.56112,0.1881,0.44295,0.22134,0.29925,0.22682,0.2094,0.42549,0.19948,0.55044,0.19937,0.678,0.31225,0.86115,0.44372,0.87279,0.55775,0.88684,0.74019,0.83318,0.81698,0.74338,0.92627,0.65995,0.63583,0.49383,0.67362,0.35438,0.66368,0.26083,0.91722,0.57039,0.84273,0.59371,0.67989,0.58503,0.50928,0.5328,0.39199,0.44721,0.29571,0.37029,0.50906,0.65402,0.4027,0.71676,0.30472,0.75478,0.63294,0.70375,0.65869,0.80736,0.66653,0.87537,0.73116,0.69102,0.83417,0.67865,0.75505,0.78758,0.5292,0.7649,0.55273,0.89102,0.42633,0.7878,0.39989,0.58705,0.27482,0.6482,0.26682,0.5027,0.52965,0.40771,0.39553,0.27353,0.55,0.27493,0.75391,0.47556,0.75841,0.34993,0.80734,0.46396,0.90954,0.71652,0.8643,0.76468,0.78535,0.79209,0.46541,0.97509,0.35536,0.94516,0.31821,0.93434,0.09396,0.60427,0.04175,0.5,0.14156,0.46014,0.32918,0.14922,0.36687,0.09025,0.46947,0.13379,0.8173,0.23069,0.82813,0.2616,0.91356,0.33877,0.63873,0.92697,0.65796,0.82438,0.5363,0.93553,0.1255,0.77209,0.20819,0.74767,0.12027,0.64804,0.19389,0.2776,0.10067,0.28888,0.18438,0.17692,0.62462,0.11646,0.52576,0.14623,0.6765,0.0783,0.93708,0.5,0.86517,0.40622,0.85562,0.53954,0.5786,0.67038,0.46442,0.61076,0.45087,0.72115,0.22979,0.65692,0.2743,0.52173,0.12132,0.54441,0.15072,0.31327,0.25122,0.29442,0.231,0.19668,0.70162,0.49766,0.71082,0.36125,0.6042,0.40939,0.44708,0.10752,0.46992,0.2271,0.59116,0.14387],"index":[0,15,14,1,17,23,0,14,29,0,29,35,0,35,24,1,23,44,2,20,50,3,32,56,4,38,62,5,41,68,1,44,51,2,50,57,3,56,63,4,62,69,5,68,45,6,74,89,7,77,95,8,80,98,9,83,101,10,86,90,92,99,11,91,102,92,90,103,91,92,102,99,102,100,99,91,103,102,103,104,102,102,104,100,104,101,100,90,86,103,86,85,103,103,85,104,85,84,104,104,84,101,84,9,101,99,96,11,100,105,99,101,106,100,99,105,96,105,97,96,100,106,105,106,107,105,105,107,97,107,98,97,101,83,106,83,82,106,106,82,107,82,81,107,107,81,98,81,8,98,96,93,11,97,108,96,98,109,97,96,108,93,108,94,93,97,109,108,109,110,108,108,110,94,110,95,94,98,80,109,80,79,109,109,79,110,79,78,110,110,78,95,78,7,95,93,87,11,94,111,93,95,112,94,93,111,87,111,88,87,94,112,111,112,113,111,111,113,88,113,89,88,95,77,112,77,76,112,112,76,113,76,75,113,113,75,89,75,6,89,87,92,11,88,114,87,89,115,88,87,114,92,114,91,92,88,115,114,115,116,114,114,116,91,116,90,91,89,74,115,74,73,115,115,73,116,73,72,116,116,72,90,72,10,90,47,86,10,46,117,47,45,118,46,47,117,86,117,85,86,46,118,117,118,119,117,117,119,85,119,84,85,45,68,118,68,67,118,118,67,119,67,66,119,119,66,84,66,9,84,71,83,9,70,120,71,69,121,70,71,120,83,120,82,83,70,121,120,121,122,120,120,122,82,122,81,82,69,62,121,62,61,121,121,61,122,61,60,122,122,60,81,60,8,81,65,80,8,64,123,65,63,124,64,65,123,80,123,79,80,64,124,123,124,125,123,123,125,79,125,78,79,63,56,124,56,55,124,124,55,125,55,54,125,125,54,78,54,7,78,59,77,7,58,126,59,57,127,58,59,126,77,126,76,77,58,127,126,127,128,126,126,128,76,128,75,76,57,50,127,50,49,127,127,49,128,49,48,128,128,48,75,48,6,75,53,74,6,52,129,53,51,130,52,53,129,74,129,73,74,52,130,129,130,131,129,129,131,73,131,72,73,51,44,130,44,43,130,130,43,131,43,42,131,131,42,72,42,10,72,66,71,9,67,132,66,68,133,67,66,132,71,132,70,71,67,133,132,133,134,132,132,134,70,134,69,70,68,41,133,41,40,133,133,40,134,40,39,134,134,39,69,39,4,69,60,65,8,61,135,60,62,136,61,60,135,65,135,64,65,61,136,135,136,137,135,135,137,64,137,63,64,62,38,136,38,37,136,136,37,137,37,36,137,137,36,63,36,3,63,54,59,7,55,138,54,56,139,55,54,138,59,138,58,59,55,139,138,139,140,138,138,140,58,140,57,58,56,32,139,32,31,139,139,31,140,31,30,140,140,30,57,30,2,57,48,53,6,49,141,48,50,142,49,48,141,53,141,52,53,49,142,141,142,143,141,141,143,52,143,51,52,50,20,142,20,19,142,142,19,143,19,18,143,143,18,51,18,1,51,42,47,10,43,144,42,44,145,43,42,144,47,144,46,47,43,145,144,145,146,144,144,146,46,146,45,46,44,23,145,23,22,145,145,22,146,22,21,146,146,21,45,21,5,45,26,41,5,25,147,26,24,148,25,26,147,41,147,40,41,25,148,147,148,149,147,147,149,40,149,39,40,24,35,148,35,34,148,148,34,149,34,33,149,149,33,39,33,4,39,33,38,4,34,150,33,35,151,34,33,150,38,150,37,38,34,151,150,151,152,150,150,152,37,152,36,37,35,29,151,29,28,151,151,28,152,28,27,152,152,27,36,27,3,36,27,32,3,28,153,27,29,154,28,27,153,32,153,31,32,28,154,153,154,155,153,153,155,31,155,30,31,29,14,154,14,13,154,154,13,155,13,12,155,155,12,30,12,2,30,21,26,5,22,156,21,23,157,22,21,156,26,156,25,26,22,157,156,157,158,156,156,158,25,158,24,25,23,17,157,17,16,157,157,16,158,16,15,158,158,15,24,15,0,24,12,20,2,13,159,12,14,160,13,12,159,20,159,19,20,13,160,159,160,161,159,159,161,19,161,18,19,14,15,160,15,16,160,160,16,161,16,17,161,161,17,18,17,1,18]},"spray":{"position":[0.1655,-0.6169,0.0,0.284,-0.60002,-0.05761,0.4217,-0.5662,-0.04225,0.52944,-0.55512,0.05395,0.57219,-0.56371,0.15076,0.46263,-0.55469,0.18425,0.33766,-0.56551,0.19693,0.22094,-0.59623,0.11249,0.36071,-0.52219,0.07237,-0.23815,-0.57951,0.21817,-0.26409,-0.59514,0.31974,-0.34647,-0.61198,0.40677,-0.46433,-0.64471,0.44317,-0.54831,-0.67291,0.43552,-0.51178,-0.63919,0.34906,-0.45391,-0.6128,0.26005,-0.33877,-0.59249,0.21317,-0.38703,-0.576,0.3225,0.02554,-0.54212,-0.29099,-0.01818,-0.54642,-0.38888,-0.00179,-0.5458,-0.49981,0.07973,-0.56294,-0.58372,0.15994,-0.5838,-0.61501,0.18421,-0.55928,-0.52519,0.19107,-0.5461,-0.4236,0.1189,-0.54346,-0.33202,0.09005,-0.5081,-0.44652,0.24631,-0.50474,0.32126,0.3919,-0.49959,0.39114,0.48696,-0.4816,0.5375,0.48554,-0.49018,0.71864,0.43219,-0.51202,0.83693,0.3154,-0.4869,0.75667,0.20515,-0.4815,0.64491,0.18887,-0.49517,0.46433,0.33553,-0.4274,0.56878,-0.4561,-0.46735,-0.08068,-0.56066,-0.48623,-0.02911,-0.67588,-0.50517,-0.04455,-0.7596,-0.54695,-0.13367,-0.78834,-0.58459,-0.22271,-0.69318,-0.53969,-0.25228,-0.58658,-0.50619,-0.26264,-0.49437,-0.48243,-0.1842,-0.61557,-0.45413,-0.14885,0.4029,-0.42996,-0.25629,0.47513,-0.46852,-0.40868,0.63264,-0.51599,-0.52298,0.83111,-0.58758,-0.54824,0.96227,-0.6424,-0.51355,0.87781,-0.57637,-0.38775,0.75866,-0.51795,-0.26371,0.56133,-0.4645,-0.22126,0.6714,-0.45856,-0.37978,-0.12385,-0.39257,0.46071,-0.09477,-0.36723,0.59012,-0.14097,-0.32157,0.72477,-0.25891,-0.29698,0.81404,-0.36269,-0.29708,0.83826,-0.37035,-0.29843,0.7224,-0.35429,-0.32047,0.59511,-0.24574,-0.36372,0.49461,-0.23849,-0.28264,0.64193,-0.34567,-0.35518,-0.66557,-0.48641,-0.30376,-0.7338,-0.56482,-0.21552,-0.86838,-0.53912,-0.15875,-1.03023,-0.4683,-0.14792,-1.13384,-0.35864,-0.16351,-1.05748,-0.25994,-0.21324,-0.95322,-0.26732,-0.29851,-0.79117,-0.40453,-0.15998,-0.89034,0.56849,-0.3178,0.20761,0.75863,-0.35385,0.18683,0.93351,-0.39587,0.27541,1.02322,-0.46648,0.45998,1.026,-0.52364,0.61352,0.86128,-0.45503,0.60565,0.68767,-0.39774,0.56172,0.5794,-0.34908,0.38885,0.7881,-0.32964,0.40245,-0.31857,-0.28041,0.1315,-0.36072,-0.2771,0.24173,-0.45304,-0.26368,0.30359,-0.56959,-0.27208,0.28427,-0.64671,-0.29075,0.22943,-0.59732,-0.26921,0.14344,-0.52756,-0.26364,0.06588,-0.41171,-0.27347,0.07089,-0.47608,-0.21901,0.17851,0.32316,-0.24302,-0.69058,0.31339,-0.26059,-0.78229,0.3547,-0.28125,-0.87898,0.44088,-0.31538,-0.94452,0.5126,-0.34279,-0.96349,0.50899,-0.30988,-0.88108,0.48853,-0.28216,-0.79013,0.40782,-0.25835,-0.71674,0.41409,-0.24993,-0.82158,0.22258,-0.20563,0.70961,0.35636,-0.17176,0.79402,0.43073,-0.11133,0.94613,0.40602,-0.07755,1.12039,0.33846,-0.07623,1.22802,0.23426,-0.07974,1.13701,0.14053,-0.10986,1.01644,0.14782,-0.16732,0.84063,0.2782,-0.06242,0.95845,-0.5185,-0.16825,-0.30048,-0.62343,-0.15272,-0.28823,-0.71851,-0.1215,-0.33644,-0.76545,-0.11146,-0.43802,-0.76495,-0.11962,-0.52282,-0.67439,-0.11103,-0.51914,-0.57941,-0.12087,-0.49558,-0.52211,-0.14918,-0.40054,-0.63679,-0.08046,-0.4072,0.80006,-0.13086,-0.17589,0.88524,-0.14871,-0.2527,0.99469,-0.16657,-0.26666,1.09104,-0.20613,-0.20059,1.13672,-0.24181,-0.12074,1.05546,-0.19925,-0.06782,0.95951,-0.16754,-0.0308,0.85765,-0.1451,-0.08428,0.96166,-0.11813,-0.14942,-0.20443,-0.09347,0.29078,-0.23518,-0.10586,0.42619,-0.34132,-0.11642,0.54724,-0.49638,-0.14675,0.60482,-0.60806,-0.17615,0.60181,-0.56271,-0.14122,0.48534,-0.48916,-0.11711,0.36374,-0.3381,-0.10257,0.29263,-0.39817,-0.07298,0.44007,-0.07257,-0.05608,-0.56003,-0.17073,0.0131,-0.73429,-0.15873,0.1286,-0.94158,-0.02042,0.20992,-1.10866,0.12426,0.23245,-1.17837,0.18472,0.20221,-1.01611,0.2146,0.13171,-0.82954,0.09506,0.01879,-0.64968,0.02191,0.18643,-0.85683,0.44353,-0.01869,0.37381,0.57116,-0.0396,0.38709,0.67775,-0.06123,0.4707,0.71849,-0.10646,0.60581,0.70495,-0.14649,0.70798,0.59698,-0.0987,0.67932,0.48675,-0.06235,0.6255,0.43258,-0.03567,0.4955,0.56901,-0.00822,0.53421,-0.86036,0.01869,0.03558,-0.94086,0.04505,0.10532,-1.05963,0.09103,0.12977,-1.17836,0.11896,0.09102,-1.24345,0.12262,0.03533,-1.16297,0.11683,-0.01555,-1.06334,0.09219,-0.05604,-0.94077,0.04806,-0.02766,-1.04424,0.12351,0.03546,0.45857,0.05608,-0.45634,0.51707,0.07424,-0.61681,0.65049,0.11451,-0.71022,0.8218,0.12037,-0.68816,0.9364,0.10139,-0.61313,0.8666,0.12242,-0.48714,0.76668,0.11519,-0.37226,0.59681,0.07997,-0.37379,0.68793,0.1825,-0.5316,-0.02592,0.09347,0.56063,0.02419,0.07589,0.63593,0.0261,0.05708,0.73045,-0.03002,0.02005,0.81158,-0.09241,-0.012,0.84877,-0.12521,0.02631,0.77748,-0.14516,0.05614,0.69397,-0.0979,0.07893,0.60776,-0.05784,0.09824,0.69894,-0.26354,0.13086,-0.31581,-0.39006,0.1925,-0.38765,-0.47401,0.29239,-0.52877,-0.4752,0.36955,-0.69809,-0.43074,0.39721,-0.80632,-0.32893,0.36145,-0.72605,-0.23234,0.2952,-0.61662,-0.21589,0.19629,-0.44702,-0.3438,0.32784,-0.55125,0.69839,0.16825,0.09397,0.77741,0.18623,0.05335,0.86871,0.21929,0.06241,0.9396,0.23574,0.12704,0.96735,0.23403,0.19276,0.89442,0.23497,0.21679,0.81139,0.22006,0.22676,0.73447,0.189,0.17027,0.82749,0.25037,0.14139,-0.37124,0.20563,0.2583,-0.49155,0.21901,0.40312,-0.68463,0.2512,0.46989,-0.89017,0.2516,0.41833,-1.00969,0.2313,0.32556,-0.88566,0.25414,0.21606,-0.72767,0.25167,0.12263,-0.51778,0.22431,0.15409,-0.6777,0.31469,0.29058,0.17339,0.24302,-0.77074,0.15022,0.28561,-0.90024,0.2028,0.35686,-1.02441,0.32523,0.40672,-1.09466,0.43045,0.42027,-1.1038,0.43277,0.40203,-0.99041,0.41077,0.35877,-0.86921,0.29723,0.28918,-0.78677,0.29678,0.39315,-0.93061,0.35494,0.28041,0.61942,0.49763,0.25128,0.72226,0.55944,0.22121,0.88753,0.50146,0.1581,1.06363,0.40438,0.10217,1.1661,0.29745,0.16894,1.06003,0.20771,0.21965,0.92484,0.24553,0.25678,0.74506,0.37867,0.29539,0.88183,-0.52713,0.3178,-0.16817,-0.68565,0.34936,-0.12003,-0.83671,0.40986,-0.16902,-0.92101,0.43483,-0.31463,-0.93084,0.4256,-0.44713,-0.79225,0.43451,-0.46643,-0.64444,0.41117,-0.45591,-0.54515,0.35528,-0.32337,-0.72091,0.47764,-0.30207,0.26386,0.35518,-0.12191,0.33685,0.40075,-0.2879,0.49078,0.48155,-0.38673,0.68187,0.52779,-0.36788,0.80692,0.53086,-0.29339,0.72282,0.52464,-0.16253,0.60548,0.48354,-0.04242,0.41506,0.40651,-0.04024,0.52452,0.54462,-0.20422,-0.12846,0.39257,0.30696,-0.09698,0.35867,0.48502,-0.16991,0.32345,0.6474,-0.33895,0.25037,0.7289,-0.48403,0.18589,0.72952,-0.48683,0.26289,0.5756,-0.45606,0.32163,0.41383,-0.29924,0.36498,0.31482,-0.29914,0.4085,0.50979,-0.15435,0.42996,-0.42913,-0.25673,0.44318,-0.52462,-0.3013,0.47173,-0.67352,-0.26012,0.47721,-0.82883,-0.19079,0.46533,-0.91749,-0.11402,0.47838,-0.82009,-0.0495,0.47223,-0.69722,-0.07624,0.44702,-0.53808,-0.17184,0.51711,-0.66354,0.32407,0.46735,0.17032,0.51978,0.45086,0.11632,0.70265,0.44152,0.18109,0.80015,0.39385,0.36216,0.8071,0.34299,0.52484,0.63687,0.40313,0.54412,0.4565,0.44053,0.52659,0.34015,0.45724,0.36107,0.55593,0.52424,0.34049,-0.24831,0.50474,0.06546,-0.297,0.52025,0.15888,-0.38642,0.55097,0.20563,-0.48997,0.56172,0.17899,-0.55445,0.55473,0.12439,-0.50155,0.56196,0.05287,-0.43102,0.55161,-0.00955,-0.32673,0.52358,0.00445,-0.39526,0.5895,0.09374,0.1712,0.54212,-0.26625,0.16534,0.52368,-0.42437,0.24722,0.50927,-0.55131,0.40199,0.4621,-0.59253,0.52658,0.4151,-0.56842,0.51069,0.47086,-0.43588,0.46506,0.50822,-0.30231,0.31871,0.52914,-0.24399,0.34178,0.58083,-0.41129,0.02426,0.57951,0.14118,0.11157,0.53322,0.27913,0.11475,0.4759,0.4558,0.01674,0.39046,0.61077,-0.09216,0.32546,0.68392,-0.14927,0.40377,0.55245,-0.18394,0.47355,0.39741,-0.10137,0.53791,0.23345,-0.03162,0.54312,0.40169,-0.10591,0.6169,-0.08202,-0.18704,0.61559,-0.12511,-0.23985,0.61983,-0.21153,-0.23877,0.6083,-0.31633,-0.20881,0.59179,-0.38381,-0.14377,0.61107,-0.33525,-0.08243,0.61969,-0.26857,-0.07363,0.61822,-0.16377,-0.1553,0.65285,-0.22688],"normal":[0.38269,-0.91012,0.15882,0.25482,-0.8885,0.38162,0.00698,-0.93227,0.36168,-0.18147,-0.97941,0.08841,-0.16496,-0.98338,-0.0758,-0.07262,-0.97354,-0.21665,0.22682,-0.93214,-0.28225,0.43823,-0.89111,-0.11778,0.13869,-0.98926,0.04623,-0.02537,-0.99967,-0.00259,-0.15463,-0.96025,-0.23241,-0.00255,-0.92016,-0.39153,0.27772,-0.90045,-0.33475,0.36794,-0.89721,-0.24419,0.42789,-0.8957,-0.12099,0.38145,-0.9151,0.13072,0.16229,-0.96264,0.21677,0.15881,-0.98159,-0.1061,0.09017,-0.98008,-0.17698,0.31561,-0.94814,-0.0376,0.26164,-0.94098,0.21471,-0.01264,-0.92817,0.37195,-0.15814,-0.92356,0.34933,-0.28206,-0.92273,0.26269,-0.34808,-0.93726,-0.01952,-0.19129,-0.9504,-0.24524,-0.03067,-0.99755,0.06285,0.08037,-0.95928,0.27076,-0.1778,-0.93004,0.32157,-0.31386,-0.94261,0.11395,-0.21211,-0.95874,-0.1893,-0.08444,-0.95856,-0.27208,0.07148,-0.95307,-0.29419,0.31391,-0.94042,-0.13066,0.33485,-0.93257,0.13488,0.01257,-0.99969,0.0214,-0.06326,-0.99697,-0.04533,0.10441,-0.94759,-0.30194,0.39118,-0.89556,-0.21203,0.54611,-0.83319,0.08701,0.51952,-0.82134,0.2356,0.43001,-0.82721,0.36169,0.13274,-0.88808,0.44011,-0.14021,-0.94982,0.27961,0.20993,-0.97318,0.0941,-0.08088,-0.99522,0.05465,0.00597,-0.95726,0.28915,-0.15504,-0.90173,0.40355,-0.393,-0.87109,0.29454,-0.45663,-0.86716,0.19881,-0.49182,-0.86707,0.07936,-0.42047,-0.89607,-0.14238,-0.21371,-0.95935,-0.18432,-0.25541,-0.9602,0.11304,-0.25652,-0.88977,0.37749,-0.43326,-0.87308,0.22363,-0.37988,-0.92495,0.01251,-0.10039,-0.99046,-0.09444,0.04406,-0.99799,-0.04557,0.1569,-0.98556,0.06365,0.16559,-0.92616,0.33884,-0.02139,-0.87543,0.48287,-0.11646,-0.97429,0.19288,-0.14778,-0.76555,-0.62617,0.09171,-0.75682,-0.64716,0.23178,-0.85338,-0.46692,0.13774,-0.98037,-0.14108,-0.02752,-0.99873,-0.04222,-0.22056,-0.97456,-0.03993,-0.4353,-0.85737,-0.27466,-0.39113,-0.75949,-0.5198,-0.10261,-0.92362,-0.36931,-0.03901,-0.9991,-0.01675,-0.22202,-0.96513,0.13869,-0.40707,-0.91334,0.0102,-0.4409,-0.86231,-0.24904,-0.38293,-0.85367,-0.353,-0.2847,-0.85823,-0.42707,-0.04669,-0.9075,-0.41744,0.1053,-0.96646,-0.23425,-0.19571,-0.96433,-0.17824,-0.33943,-0.93669,0.08607,-0.35911,-0.91473,-0.18524,-0.09234,-0.94299,-0.31976,0.2633,-0.93529,-0.23643,0.36192,-0.92748,-0.09383,0.36223,-0.92888,0.07726,0.11875,-0.9405,0.31836,-0.19669,-0.91722,0.34644,-0.01307,-0.99988,0.0086,-0.01161,-0.99894,0.04459,0.18262,-0.96109,0.20724,0.09742,-0.91256,0.39718,-0.17011,-0.88472,0.43397,-0.27862,-0.88075,0.38296,-0.37189,-0.88045,0.29411,-0.4169,-0.90716,0.05696,-0.25232,-0.96322,-0.09247,-0.14005,-0.97082,0.19467,0.09152,-0.87177,0.48129,-0.15022,-0.85468,0.49695,-0.26822,-0.91349,0.30593,-0.14241,-0.98961,0.01989,0.00242,-0.99866,-0.05172,0.16856,-0.98421,-0.054,0.3764,-0.91504,0.14499,0.34073,-0.85719,0.38617,0.05934,-0.96825,0.24284,-0.34684,-0.87573,-0.33586,-0.12417,-0.85425,-0.50482,0.12984,-0.91545,-0.3809,0.23734,-0.97133,-0.01388,0.15374,-0.9751,0.15986,-0.00808,-0.96396,0.26592,-0.35586,-0.91553,0.1875,-0.50934,-0.8573,-0.07493,-0.1264,-0.98622,-0.10677,0.07394,-0.99688,0.02776,-0.02811,-0.95263,0.30282,-0.32625,-0.90256,0.28098,-0.55027,-0.8339,0.04264,-0.56239,-0.82028,-0.10421,-0.50552,-0.82814,-0.24215,-0.23707,-0.89529,-0.37717,0.06509,-0.95447,-0.29114,-0.22755,-0.9729,-0.04109,-0.07605,-0.99638,0.03804,-0.20906,-0.9619,-0.1762,-0.07584,-0.93746,-0.33974,0.20086,-0.93316,-0.29811,0.29414,-0.93181,-0.21264,0.35937,-0.9285,-0.09347,0.32327,-0.93362,0.15445,0.11319,-0.96425,0.23961,0.0965,-0.99294,-0.06895,0.19996,-0.78896,-0.58099,0.39366,-0.78067,-0.48537,0.4132,-0.86248,-0.29223,0.18657,-0.9748,-0.12229,0.0282,-0.99074,-0.13283,-0.11346,-0.97062,-0.21217,-0.18001,-0.86637,-0.46584,-0.03498,-0.78289,-0.62117,0.11808,-0.91439,-0.38724,0.01802,-0.99853,0.05113,-0.2395,-0.95024,0.19924,-0.43455,-0.90061,0.00772,-0.41127,-0.85536,-0.31499,-0.31754,-0.84727,-0.4258,-0.18276,-0.8497,-0.49458,0.10434,-0.89386,-0.43603,0.24337,-0.95269,-0.18208,-0.13275,-0.97531,-0.1765,-0.49514,-0.86863,-0.01804,-0.45966,-0.84607,-0.26995,-0.25814,-0.89972,-0.35196,-0.02613,-0.98921,-0.14415,0.00446,-0.99989,0.01408,-0.02291,-0.983,0.18216,-0.24231,-0.90131,0.35907,-0.45965,-0.84884,0.26112,-0.27489,-0.96146,0.00502,0.4457,-0.88575,-0.12956,0.47541,-0.86714,0.14848,0.21857,-0.92633,0.30681,-0.17028,-0.95715,0.23424,-0.28625,-0.95499,0.07776,-0.29101,-0.94988,-0.11422,-0.0278,-0.92567,-0.37731,0.29374,-0.87013,-0.39572,0.11001,-0.99306,-0.04155,-0.02559,-0.99926,0.02855,-0.32409,-0.94194,-0.08786,-0.28892,-0.87916,-0.37895,-0.00712,-0.82228,-0.56904,0.14338,-0.81265,-0.56484,0.28709,-0.81625,-0.50131,0.43316,-0.87117,-0.23117,0.32293,-0.94464,0.05816,0.06185,-0.96646,-0.24927,-0.18608,-0.78388,-0.59238,0.01807,-0.77289,-0.63428,0.1396,-0.84264,-0.52007,0.02938,-0.9543,-0.29742,-0.09197,-0.96835,-0.23202,-0.23609,-0.95033,-0.20283,-0.43099,-0.84663,-0.31219,-0.39477,-0.77492,-0.49362,-0.15267,-0.8882,-0.43335,0.47557,-0.85846,0.19204,0.34632,-0.84099,0.41569,0.09601,-0.90814,0.4075,-0.11219,-0.98535,0.12845,-0.09714,-0.99393,-0.05163,0.00435,-0.979,-0.20384,0.32256,-0.90954,-0.26209,0.52956,-0.84378,-0.08719,0.22295,-0.97184,0.07627,-0.33351,-0.94257,0.01837,-0.32064,-0.9144,-0.24711,-0.0874,-0.93797,-0.33551,0.19042,-0.96832,-0.16156,0.24242,-0.9701,-0.01209,0.22615,-0.96234,0.15088,0.00256,-0.9365,0.35065,-0.26129,-0.91707,0.30117,-0.07216,-0.99732,0.01239,0.37513,-0.80245,-0.46405,0.51876,-0.79547,-0.31324,0.46721,-0.87458,-0.1297,0.20517,-0.97768,-0.04525,0.06502,-0.99233,-0.10515,-0.03486,-0.974,-0.22383,-0.00734,-0.87826,-0.47812,0.17557,-0.79758,-0.57709,0.23383,-0.92131,-0.31067,-0.0111,-0.99826,0.058,-0.30589,-0.95142,0.03499,-0.36118,-0.89915,-0.24713,-0.17711,-0.83922,-0.51414,-0.0385,-0.82804,-0.55934,0.11002,-0.83356,-0.54136,0.31312,-0.89197,-0.32612,0.30046,-0.95351,-0.02334,-0.01723,-0.97204,-0.23417,-0.4525,-0.82735,-0.33277,-0.25327,-0.8132,-0.52399,0.02373,-0.89901,-0.43729,0.21315,-0.97406,-0.07604,0.1548,-0.9797,0.12741,-0.00829,-0.96633,0.25719,-0.38855,-0.90038,0.19583,-0.57492,-0.81638,-0.05463,-0.18481,-0.97533,-0.12069,0.54782,-0.82182,-0.15655,0.58053,-0.80931,0.08948,0.38856,-0.89069,0.23599,0.05391,-0.9867,0.15332,-0.04886,-0.99881,-0.00054,-0.05971,-0.98072,-0.18608,0.16321,-0.89325,-0.41889,0.42445,-0.81202,-0.40058,0.28165,-0.95484,-0.0946,-0.05204,-0.99805,0.03458,-0.25847,-0.9418,-0.21497,-0.07418,-0.87795,-0.47298,0.26765,-0.80373,-0.53139,0.4041,-0.79028,-0.46061,0.50082,-0.79755,-0.33629,0.49373,-0.86938,-0.0204,0.25361,-0.9441,0.2106,0.17107,-0.96533,-0.19716,-0.00895,-0.9375,-0.34786,0.25287,-0.90965,-0.32955,0.3362,-0.93583,-0.10579,0.1506,-0.97633,0.15526,0.00156,-0.97986,0.19967,-0.15979,-0.97041,0.18104,-0.35314,-0.93483,-0.03724,-0.29128,-0.91235,-0.28769,-0.01237,-0.99481,-0.10103,0.14734,-0.98088,0.12717,-0.06888,-0.94478,0.32038,-0.33732,-0.92591,0.17003,-0.45402,-0.87677,-0.15856,-0.39781,-0.86431,-0.30775,-0.27413,-0.8705,-0.40876,0.0482,-0.92031,-0.38822,0.27875,-0.94694,-0.16002,-0.10592,-0.99092,-0.08279,-0.48672,-0.87002,0.07854,-0.48394,-0.85632,-0.18031,-0.23638,-0.92432,-0.29959,0.11672,-0.9752,-0.18807,0.20869,-0.97766,-0.02508,0.19002,-0.96889,0.15854,-0.08796,-0.92496,0.36975,-0.38088,-0.8591,0.34187,-0.17155,-0.98443,0.03822,0.1406,-0.98525,-0.09756,0.29086,-0.93944,0.18127,0.06153,-0.90499,0.42096,-0.30341,-0.84014,0.44956,-0.43829,-0.82561,0.35534,-0.5124,-0.83337,0.2072,-0.42416,-0.89782,-0.11836,-0.13194,-0.9418,-0.3092,-0.13898,-0.98385,0.11277,0.01224,-0.99066,-0.13577,-0.25354,-0.94194,-0.22016,-0.23003,-0.86298,-0.44984,0.01323,-0.80608,-0.59165,0.13673,-0.79839,-0.58642,0.25938,-0.80166,-0.53857,0.39993,-0.85529,-0.32943,0.31411,-0.944,-0.101,0.07782,-0.93564,-0.34427,-0.0571,-0.97335,-0.22212,0.21958,-0.93623,-0.27433,0.35457,-0.93341,-0.05503,0.23149,-0.93962,0.25204,0.09906,-0.9383,0.33132,-0.06086,-0.93348,0.35344,-0.31369,-0.93,0.19155,-0.33342,-0.93904,-0.08387,0.00631,-0.99943,0.03303],"uv":[0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48,0.5,0,0.1596,0.21,0.04,0.52,0.2286,0.83,0.5,1,0.7484,0.79,0.9462,0.53,0.8082,0.21,0.5,0.48],"index":[0,1,8,1,2,8,2,3,8,3,4,8,4,5,8,5,6,8,6,7,8,7,0,8,9,10,17,10,11,17,11,12,17,12,13,17,13,14,17,14,15,17,15,16,17,16,9,17,18,19,26,19,20,26,20,21,26,21,22,26,22,23,26,23,24,26,24,25,26,25,18,26,27,28,35,28,29,35,29,30,35,30,31,35,31,32,35,32,33,35,33,34,35,34,27,35,36,37,44,37,38,44,38,39,44,39,40,44,40,41,44,41,42,44,42,43,44,43,36,44,45,46,53,46,47,53,47,48,53,48,49,53,49,50,53,50,51,53,51,52,53,52,45,53,54,55,62,55,56,62,56,57,62,57,58,62,58,59,62,59,60,62,60,61,62,61,54,62,63,64,71,64,65,71,65,66,71,66,67,71,67,68,71,68,69,71,69,70,71,70,63,71,72,73,80,73,74,80,74,75,80,75,76,80,76,77,80,77,78,80,78,79,80,79,72,80,81,82,89,82,83,89,83,84,89,84,85,89,85,86,89,86,87,89,87,88,89,88,81,89,90,91,98,91,92,98,92,93,98,93,94,98,94,95,98,95,96,98,96,97,98,97,90,98,99,100,107,100,101,107,101,102,107,102,103,107,103,104,107,104,105,107,105,106,107,106,99,107,108,109,116,109,110,116,110,111,116,111,112,116,112,113,116,113,114,116,114,115,116,115,108,116,117,118,125,118,119,125,119,120,125,120,121,125,121,122,125,122,123,125,123,124,125,124,117,125,126,127,134,127,128,134,128,129,134,129,130,134,130,131,134,131,132,134,132,133,134,133,126,134,135,136,143,136,137,143,137,138,143,138,139,143,139,140,143,140,141,143,141,142,143,142,135,143,144,145,152,145,146,152,146,147,152,147,148,152,148,149,152,149,150,152,150,151,152,151,144,152,153,154,161,154,155,161,155,156,161,156,157,161,157,158,161,158,159,161,159,160,161,160,153,161,162,163,170,163,164,170,164,165,170,165,166,170,166,167,170,167,168,170,168,169,170,169,162,170,171,172,179,172,173,179,173,174,179,174,175,179,175,176,179,176,177,179,177,178,179,178,171,179,180,181,188,181,182,188,182,183,188,183,184,188,184,185,188,185,186,188,186,187,188,187,180,188,189,190,197,190,191,197,191,192,197,192,193,197,193,194,197,194,195,197,195,196,197,196,189,197,198,199,206,199,200,206,200,201,206,201,202,206,202,203,206,203,204,206,204,205,206,205,198,206,207,208,215,208,209,215,209,210,215,210,211,215,211,212,215,212,213,215,213,214,215,214,207,215,216,217,224,217,218,224,218,219,224,219,220,224,220,221,224,221,222,224,222,223,224,223,216,224,225,226,233,226,227,233,227,228,233,228,229,233,229,230,233,230,231,233,231,232,233,232,225,233,234,235,242,235,236,242,236,237,242,237,238,242,238,239,242,239,240,242,240,241,242,241,234,242,243,244,251,244,245,251,245,246,251,246,247,251,247,248,251,248,249,251,249,250,251,250,243,251,252,253,260,253,254,260,254,255,260,255,256,260,256,257,260,257,258,260,258,259,260,259,252,260,261,262,269,262,263,269,263,264,269,264,265,269,265,266,269,266,267,269,267,268,269,268,261,269,270,271,278,271,272,278,272,273,278,273,274,278,274,275,278,275,276,278,276,277,278,277,270,278,279,280,287,280,281,287,281,282,287,282,283,287,283,284,287,284,285,287,285,286,287,286,279,287,288,289,296,289,290,296,290,291,296,291,292,296,292,293,296,293,294,296,294,295,296,295,288,296,297,298,305,298,299,305,299,300,305,300,301,305,301,302,305,302,303,305,303,304,305,304,297,305]},"fleeceNear":{"position":[0.01518,0.83,-0.82,0.01499,0.83683,-0.82,0.01517,0.84397,-0.82,0.01509,0.85124,-0.82,0.01473,0.85843,-0.82,0.01387,0.86471,-0.82,0.01315,0.8714,-0.82,0.01211,0.87725,-0.82,0.01037,0.8799,-0.82,0.00891,0.88317,-0.82,0.00762,0.88723,-0.82,0.00642,0.89246,-0.82,0.00479,0.89394,-0.82,0.00307,0.89268,-0.82,0.00156,0.89442,-0.82,0.0,0.89607,-0.82,-0.00166,0.89864,-0.82,-0.00324,0.89614,-0.82,-0.00474,0.89315,-0.82,-0.00635,0.89184,-0.82,-0.00814,0.89113,-0.82,-0.00924,0.88513,-0.82,-0.01053,0.88069,-0.82,-0.01164,0.87541,-0.82,-0.01223,0.8685,-0.82,-0.01317,0.86295,-0.82,-0.01426,0.85751,-0.82,-0.01445,0.85035,-0.82,-0.01557,0.84435,-0.82,-0.01562,0.83712,-0.82,-0.01496,0.83,-0.82,-0.01542,0.82298,-0.82,-0.01574,0.8155,-0.82,-0.01535,0.80838,-0.82,-0.01397,0.80304,-0.82,-0.01351,0.79619,-0.82,-0.01275,0.78984,-0.82,-0.01169,0.78438,-0.82,-0.01049,0.77952,-0.82,-0.00914,0.77549,-0.82,-0.00784,0.77113,-0.82,-0.00631,0.76861,-0.82,-0.00483,0.76558,-0.82,-0.00316,0.76563,-0.82,-0.00153,0.76697,-0.82,-0.0,0.76201,-0.82,0.00161,0.76374,-0.82,0.00318,0.76516,-0.82,0.00478,0.76631,-0.82,0.00663,0.76551,-0.82,0.00788,0.77082,-0.82,0.00933,0.77435,-0.82,0.0106,0.77898,-0.82,0.01172,0.78427,-0.82,0.0125,0.79064,-0.82,0.01303,0.7974,-0.82,0.01402,0.80294,-0.82,0.01477,0.80921,-0.82,0.01474,0.81642,-0.82,0.01518,0.82309,-0.82,0.01518,0.83,-0.82,0.04023,0.8258,-0.8075,0.03928,0.83546,-0.8075,0.03867,0.84503,-0.8075,0.03919,0.85559,-0.8075,0.03816,0.86556,-0.8075,0.03632,0.87488,-0.8075,0.03447,0.88441,-0.8075,0.0318,0.89281,-0.8075,0.02696,0.89588,-0.8075,0.02369,0.9021,-0.8075,0.02013,0.90741,-0.8075,0.01662,0.91315,-0.8075,0.01289,0.91866,-0.8075,0.00813,0.9153,-0.8075,0.00411,0.91721,-0.8075,0.0,0.91792,-0.8075,-0.00432,0.9221,-0.8075,-0.00848,0.91918,-0.8075,-0.0123,0.91437,-0.8075,-0.01675,0.91385,-0.8075,-0.02166,0.91358,-0.8075,-0.02394,0.9029,-0.8075,-0.0281,0.89883,-0.8075,-0.03082,0.89074,-0.8075,-0.03231,0.88073,-0.8075,-0.03485,0.87288,-0.8075,-0.03744,0.86481,-0.8075,-0.03773,0.85449,-0.8075,-0.04051,0.84595,-0.8075,-0.04118,0.83593,-0.8075,-0.0386,0.8258,-0.8075,-0.04005,0.81594,-0.8075,-0.04066,0.80557,-0.8075,-0.04024,0.79519,-0.8075,-0.03629,0.78798,-0.8075,-0.03465,0.77897,-0.8075,-0.03278,0.77005,-0.8075,-0.03087,0.76074,-0.8075,-0.02818,0.75255,-0.8075,-0.02385,0.74895,-0.8075,-0.02033,0.74338,-0.8075,-0.01673,0.73787,-0.8075,-0.01274,0.73405,-0.8075,-0.00812,0.73638,-0.8075,-0.00396,0.73762,-0.8075,-0.0,0.72939,-0.8075,0.00421,0.73214,-0.8075,0.00827,0.73479,-0.8075,0.0124,0.73645,-0.8075,0.01713,0.73573,-0.8075,0.02085,0.74128,-0.8075,0.02455,0.7467,-0.8075,0.0277,0.7538,-0.8075,0.03026,0.76203,-0.8075,0.03337,0.76905,-0.8075,0.03508,0.7784,-0.8075,0.03697,0.78728,-0.8075,0.03854,0.79649,-0.8075,0.03829,0.80675,-0.8075,0.03953,0.81607,-0.8075,0.04023,0.8258,-0.8075,0.07578,0.81945,-0.795,0.07309,0.83309,-0.795,0.07097,0.84623,-0.795,0.07435,0.86234,-0.795,0.07024,0.87497,-0.795,0.0672,0.88833,-0.795,0.06388,0.90185,-0.795,0.06037,0.91595,-0.795,0.05121,0.92041,-0.795,0.04469,0.92865,-0.795,0.03772,0.93543,-0.795,0.03077,0.94215,-0.795,0.02463,0.95402,-0.795,0.01538,0.94794,-0.795,0.00782,0.95162,-0.795,0.0,0.95074,-0.795,-0.00821,0.95816,-0.795,-0.01573,0.95083,-0.795,-0.02267,0.94332,-0.795,-0.03143,0.94479,-0.795,-0.04073,0.9447,-0.795,-0.04492,0.92922,-0.795,-0.05302,0.924,-0.795,-0.05773,0.91174,-0.795,-0.06098,0.89811,-0.795,-0.06566,0.88676,-0.795,-0.06971,0.87455,-0.795,-0.07017,0.85993,-0.795,-0.07595,0.84811,-0.795,-0.07691,0.8338,-0.795,-0.07173,0.81945,-0.795,-0.07387,0.80567,-0.795,-0.07524,0.79105,-0.795,-0.07462,0.7764,-0.795,-0.06726,0.76629,-0.795,-0.06365,0.7542,-0.795,-0.06178,0.73976,-0.795,-0.05839,0.7261,-0.795,-0.05369,0.71359,-0.795,-0.04429,0.71121,-0.795,-0.03752,0.70408,-0.795,-0.03175,0.69282,-0.795,-0.02416,0.68743,-0.795,-0.015,0.69418,-0.795,-0.00743,0.69395,-0.795,-0.0,0.68322,-0.795,0.00783,0.68722,-0.795,0.01529,0.69178,-0.795,0.02289,0.69437,-0.795,0.03135,0.69443,-0.795,0.03967,0.69745,-0.795,0.04574,0.70767,-0.795,0.05124,0.71842,-0.795,0.05629,0.72947,-0.795,0.06348,0.73757,-0.795,0.06758,0.75018,-0.795,0.0693,0.76467,-0.795,0.07137,0.77828,-0.795,0.0724,0.79213,-0.795,0.074,0.80564,-0.795,0.07578,0.81945,-0.795,0.11679,0.81233,-0.7825,0.11143,0.8304,-0.7825,0.11058,0.84861,-0.7825,0.11611,0.87055,-0.7825,0.10907,0.88728,-0.7825,0.10153,0.90279,-0.7825,0.0966,0.92065,-0.7825,0.09422,0.94326,-0.7825,0.07958,0.94874,-0.7825,0.06894,0.95878,-0.7825,0.05783,0.96693,-0.7825,0.04869,0.98112,-0.7825,0.03836,0.99453,-0.7825,0.02383,0.98537,-0.7825,0.01222,0.99184,-0.7825,0.0,0.98832,-0.7825,-0.01276,0.99963,-0.7825,-0.02422,0.98818,-0.7825,-0.03462,0.97679,-0.7825,-0.04827,0.97964,-0.7825,-0.06229,0.97884,-0.7825,-0.06914,0.95921,-0.7825,-0.08141,0.95187,-0.7825,-0.08819,0.93488,-0.7825,-0.09538,0.91928,-0.7825,-0.1016,0.90286,-0.7825,-0.10644,0.88547,-0.7825,-0.11003,0.86751,-0.7825,-0.1165,0.85055,-0.7825,-0.11836,0.83153,-0.7825,-0.11232,0.81233,-0.7825,-0.11189,0.79418,-0.7825,-0.11441,0.7748,-0.7825,-0.11305,0.75564,-0.7825,-0.10458,0.74047,-0.7825,-0.09835,0.72469,-0.7825,-0.09535,0.70542,-0.7825,-0.09042,0.68668,-0.7825,-0.08329,0.66957,-0.7825,-0.06767,0.66859,-0.7825,-0.05708,0.65976,-0.7825,-0.04931,0.64139,-0.7825,-0.0374,0.63467,-0.7825,-0.02354,0.64144,-0.7825,-0.01148,0.64371,-0.7825,-0.0,0.63181,-0.7825,0.01197,0.63663,-0.7825,0.02339,0.64251,-0.7825,0.03577,0.64244,-0.7825,0.0473,0.64836,-0.7825,0.06188,0.64692,-0.7825,0.0697,0.66428,-0.7825,0.07767,0.6792,-0.7825,0.08696,0.69148,-0.7825,0.09879,0.70156,-0.7825,0.10691,0.71707,-0.7825,0.10911,0.73736,-0.7825,0.10854,0.7579,-0.7825,0.11351,0.77509,-0.7825,0.11658,0.79342,-0.7825,0.11679,0.81233,-0.7825,0.15818,0.8058,-0.77,0.14986,0.82817,-0.77,0.15326,0.85207,-0.77,0.1591,0.87923,-0.77,0.14826,0.89956,-0.77,0.13507,0.91657,-0.77,0.13031,0.94029,-0.77,0.12824,0.96982,-0.77,0.10847,0.97692,-0.77,0.09345,0.9885,-0.77,0.07811,0.99798,-0.77,0.06805,1.02291,-0.77,0.05221,1.03404,-0.77,0.03248,1.02283,-0.77,0.01673,1.03196,-0.77,0.0,1.02734,-0.77,-0.01735,1.04024,-0.77,-0.03275,1.02463,-0.77,-0.0469,1.01082,-0.77,-0.065,1.01318,-0.77,-0.08322,1.01055,-0.77,-0.09356,0.98871,-0.77,-0.10926,0.97817,-0.77,-0.1182,0.95698,-0.77,-0.13168,0.94169,-0.77,-0.13859,0.91946,-0.77,-0.14448,0.89717,-0.77,-0.15316,0.87649,-0.77,-0.15993,0.85409,-0.77,-0.16269,0.83009,-0.77,-0.15665,0.8058,-0.77,-0.14997,0.78341,-0.77,-0.15307,0.75959,-0.77,-0.15087,0.73617,-0.77,-0.1453,0.71391,-0.77,-0.1341,0.69583,-0.77,-0.12903,0.67265,-0.77,-0.12276,0.64879,-0.77,-0.11279,0.62786,-0.77,-0.09297,0.62404,-0.77,-0.07805,0.61377,-0.77,-0.06712,0.59166,-0.77,-0.05224,0.5774,-0.77,-0.03259,0.588,-0.77,-0.01569,0.59379,-0.77,-0.0,0.58276,-0.77,0.01641,0.58408,-0.77,0.03244,0.58902,-0.77,0.04947,0.58953,-0.77,0.06476,0.59919,-0.77,0.08445,0.59802,-0.77,0.09445,0.62115,-0.77,0.10402,0.64171,-0.77,0.11787,0.65504,-0.77,0.13463,0.66686,-0.77,0.14817,0.68428,-0.77,0.15016,0.71084,-0.77,0.15002,0.73656,-0.77,0.15741,0.75827,-0.77,0.16289,0.78148,-0.77,0.15818,0.8058,-0.77,0.19569,0.80123,-0.7575,0.19034,0.82806,-0.7575,0.1947,0.85672,-0.7575,0.19747,0.88726,-0.7575,0.1828,0.91036,-0.7575,0.16475,0.92877,-0.7575,0.1616,0.95866,-0.7575,0.15746,0.99133,-0.7575,0.13442,1.0014,-0.7575,0.11554,1.01446,-0.7575,0.09734,1.02729,-0.7575,0.08644,1.06154,-0.7575,0.06494,1.06919,-0.7575,0.04099,1.05978,-0.7575,0.02077,1.06623,-0.7575,0.0,1.06565,-0.7575,-0.0214,1.07429,-0.7575,-0.04038,1.05598,-0.7575,-0.05801,1.04061,-0.7575,-0.07961,1.04098,-0.7575,-0.10109,1.036,-0.7575,-0.11579,1.01493,-0.7575,-0.13333,0.99978,-0.7575,-0.14929,0.98146,-0.7575,-0.16554,0.9625,-0.7575,-0.17273,0.93495,-0.7575,-0.18457,0.91141,-0.7575,-0.19338,0.88548,-0.7575,-0.20072,0.85844,-0.7575,-0.20291,0.82983,-0.7575,-0.19934,0.80123,-0.7575,-0.18492,0.77517,-0.7575,-0.18736,0.74784,-0.7575,-0.18971,0.71858,-0.7575,-0.18516,0.6907,-0.7575,-0.16723,0.67178,-0.7575,-0.15858,0.64676,-0.7575,-0.15134,0.61853,-0.7575,-0.13851,0.59498,-0.7575,-0.11635,0.5865,-0.7575,-0.09797,0.57372,-0.7575,-0.0839,0.54858,-0.7575,-0.06651,0.52679,-0.7575,-0.04108,0.54211,-0.7575,-0.01963,0.55075,-0.7575,-0.0,0.54236,-0.7575,0.02087,0.53503,-0.7575,0.04112,0.54186,-0.7575,0.06211,0.54494,-0.7575,0.0807,0.55821,-0.7575,0.10419,0.55927,-0.7575,0.11981,0.58013,-0.7575,0.1291,0.60898,-0.7575,0.14531,0.62581,-0.7575,0.16636,0.63918,-0.7575,0.18565,0.65752,-0.7575,0.18891,0.68846,-0.7575,0.1902,0.71837,-0.7575,0.20098,0.74395,-0.7575,0.20695,0.77207,-0.7575,0.19569,0.80123,-0.7575,0.23113,0.79994,-0.73929,0.22998,0.83082,-0.73929,0.23039,0.8625,-0.73929,0.22457,0.89315,-0.73929,0.2079,0.91819,-0.73929,0.18904,0.93937,-0.73929,0.18403,0.97075,-0.73929,0.17711,1.00367,-0.73929,0.1555,1.02057,-0.73929,0.13487,1.03709,-0.73929,0.11426,1.05277,-0.73929,0.101,1.08973,-0.73929,0.07535,1.09621,-0.73929,0.04811,1.08908,-0.73929,0.02474,1.10059,-0.73929,0.0,1.09561,-0.73929,-0.02437,1.09615,-0.73929,-0.04644,1.07908,-0.73929,-0.06741,1.06499,-0.73929,-0.0909,1.06076,-0.73929,-0.1134,1.05087,-0.73929,-0.13341,1.03452,-0.73929,-0.15057,1.01358,-0.73929,-0.17546,1.00176,-0.73929,-0.19198,0.97812,-0.73929,-0.20198,0.94891,-0.73929,-0.22047,0.92534,-0.73929,-0.22668,0.89403,-0.73929,-0.23186,0.8629,-0.73929,-0.24081,0.83227,-0.73929,-0.23559,0.79994,-0.73929,-0.21811,0.77065,-0.73929,-0.21454,0.74168,-0.73929,-0.22788,0.70534,-0.73929,-0.22059,0.67447,-0.73929,-0.19965,0.65268,-0.73929,-0.18049,0.63241,-0.73929,-0.17447,0.59925,-0.73929,-0.15856,0.57497,-0.73929,-0.13594,0.56091,-0.73929,-0.1173,0.54039,-0.73929,-0.09888,0.51622,-0.73929,-0.0777,0.49443,-0.73929,-0.04807,0.51102,-0.73929,-0.02317,0.51829,-0.73929,-0.0,0.50835,-0.73929,0.0249,0.49732,-0.73929,0.04845,0.50873,-0.73929,0.0716,0.51843,-0.73929,0.09262,0.53418,-0.73929,0.11875,0.53718,-0.73929,0.14163,0.5509,-0.73929,0.14888,0.5887,-0.73929,0.16642,0.6085,-0.73929,0.19077,0.62287,-0.73929,0.21287,0.64293,-0.73929,0.22106,0.6742,-0.73929,0.22312,0.70732,-0.73929,0.2386,0.73514,-0.73929,0.24258,0.76736,-0.73929,0.23113,0.79994,-0.73929,0.27493,0.80195,-0.7125,0.26647,0.83597,-0.7125,0.25576,0.86798,-0.7125,0.25866,0.90403,-0.7125,0.23711,0.93017,-0.7125,0.21591,0.95335,-0.7125,0.20527,0.98309,-0.7125,0.19414,1.01426,-0.7125,0.1737,1.03625,-0.7125,0.15599,1.06271,-0.7125,0.12838,1.07202,-0.7125,0.10916,1.09974,-0.7125,0.08291,1.11188,-0.7125,0.05536,1.11826,-0.7125,0.02803,1.1259,-0.7125,0.0,1.13458,-0.7125,-0.02749,1.11963,-0.7125,-0.05479,1.11503,-0.7125,-0.07927,1.09827,-0.7125,-0.10623,1.09174,-0.7125,-0.12707,1.06926,-0.7125,-0.1519,1.05587,-0.7125,-0.17034,1.03173,-0.7125,-0.19303,1.01305,-0.7125,-0.21086,0.98802,-0.7125,-0.22775,0.96166,-0.7125,-0.24878,0.93648,-0.7125,-0.26147,0.90514,-0.7125,-0.25707,0.86832,-0.7125,-0.27149,0.83661,-0.7125,-0.27134,0.80195,-0.7125,-0.25904,0.76889,-0.7125,-0.24836,0.73784,-0.7125,-0.26218,0.69849,-0.7125,-0.24995,0.66679,-0.7125,-0.2278,0.64222,-0.7125,-0.20015,0.62534,-0.7125,-0.19049,0.59364,-0.7125,-0.17428,0.56687,-0.7125,-0.15901,0.53614,-0.7125,-0.13463,0.51875,-0.7125,-0.11055,0.50039,-0.7125,-0.08436,0.4866,-0.7125,-0.05583,0.48296,-0.7125,-0.02722,0.48739,-0.7125,-0.0,0.48107,-0.7125,0.02824,0.47559,-0.7125,0.05563,0.48408,-0.7125,0.07817,0.50974,-0.7125,0.10129,0.52563,-0.7125,0.13534,0.51725,-0.7125,0.15713,0.53928,-0.7125,0.17036,0.57215,-0.7125,0.18977,0.59443,-0.7125,0.21446,0.61271,-0.7125,0.23122,0.63982,-0.7125,0.24858,0.66754,-0.7125,0.25942,0.69958,-0.7125,0.26444,0.73369,-0.7125,0.27448,0.76691,-0.7125,0.27493,0.80195,-0.7125,0.30616,0.80612,-0.68571,0.29626,0.84208,-0.68571,0.28523,0.87614,-0.68571,0.28477,0.91297,-0.68571,0.26747,0.94364,-0.68571,0.24978,0.97266,-0.68571,0.23104,0.99997,-0.68571,0.21495,1.02963,-0.68571,0.1968,1.05853,-0.68571,0.17913,1.09084,-0.68571,0.14234,1.09083,-0.68571,0.11851,1.1135,-0.68571,0.09397,1.14012,-0.68571,0.06264,1.14642,-0.68571,0.0318,1.15551,-0.68571,0.0,1.15616,-0.68571,-0.03197,1.15743,-0.68571,-0.06352,1.1512,-0.68571,-0.093,1.13664,-0.68571,-0.11952,1.11614,-0.68571,-0.14168,1.0895,-0.68571,-0.16953,1.07558,-0.68571,-0.19479,1.05594,-0.68571,-0.2135,1.02812,-0.68571,-0.22832,0.99769,-0.68571,-0.25056,0.97318,-0.68571,-0.2792,0.94967,-0.68571,-0.28783,0.91412,-0.68571,-0.28117,0.87514,-0.68571,-0.29689,0.84216,-0.68571,-0.31242,0.80612,-0.68571,-0.30376,0.76925,-0.68571,-0.27815,0.73785,-0.68571,-0.28197,0.70032,-0.68571,-0.27717,0.66361,-0.68571,-0.24646,0.6418,-0.68571,-0.22077,0.62089,-0.68571,-0.21401,0.5836,-0.68571,-0.19316,0.55839,-0.68571,-0.17618,0.52609,-0.68571,-0.14887,0.50836,-0.68571,-0.12243,0.48857,-0.68571,-0.09437,0.47071,-0.68571,-0.06287,0.46456,-0.68571,-0.03088,0.46686,-0.68571,-0.0,0.47184,-0.68571,0.03124,0.4629,-0.68571,0.06437,0.45639,-0.68571,0.09005,0.48609,-0.68571,0.11453,0.50906,-0.68571,0.14512,0.51586,-0.68571,0.17652,0.52554,-0.68571,0.19341,0.55806,-0.68571,0.20872,0.58909,-0.68571,0.23238,0.61115,-0.68571,0.2503,0.63924,-0.68571,0.28121,0.66153,-0.68571,0.28395,0.69958,-0.68571,0.29561,0.73356,-0.68571,0.31039,0.76845,-0.68571,0.30616,0.80612,-0.68571,0.33391,0.81125,-0.65893,0.32205,0.84856,-0.65893,0.31934,0.88607,-0.65893,0.3031,0.9198,-0.65893,0.30882,0.96281,-0.65893,0.28504,0.99265,-0.65893,0.25432,1.01492,-0.65893,0.22799,1.03753,-0.65893,0.21808,1.07822,-0.65893,0.1933,1.10451,-0.65893,0.1543,1.10584,-0.65893,0.1312,1.13607,-0.65893,0.10098,1.15383,-0.65893,0.06795,1.16365,-0.65893,0.03399,1.16774,-0.65893,0.0,1.17633,-0.65893,-0.03557,1.18431,-0.65893,-0.06925,1.17038,-0.65893,-0.10231,1.15833,-0.65893,-0.12751,1.12694,-0.65893,-0.16033,1.11736,-0.65893,-0.19102,1.10105,-0.65893,-0.21961,1.08009,-0.65893,-0.23598,1.04545,-0.65893,-0.24195,1.00502,-0.65893,-0.27148,0.98402,-0.65893,-0.29675,0.95688,-0.65893,-0.30615,0.9209,-0.65893,-0.30941,0.88374,-0.65893,-0.33571,0.85014,-0.65893,-0.34241,0.81125,-0.65893,-0.33099,0.7729,-0.65893,-0.31042,0.73852,-0.65893,-0.31254,0.69931,-0.65893,-0.30019,0.66393,-0.65893,-0.27725,0.63481,-0.65893,-0.24749,0.61305,-0.65893,-0.23361,0.57939,-0.65893,-0.21016,0.55397,-0.65893,-0.19018,0.52272,-0.65893,-0.16051,0.5048,-0.65893,-0.1275,0.4956,-0.65893,-0.10176,0.46604,-0.65893,-0.06699,0.46386,-0.65893,-0.03324,0.46267,-0.65893,-0.0,0.47025,-0.65893,0.03478,0.44655,-0.65893,0.06988,0.44887,-0.65893,0.10022,0.47126,-0.65893,0.13324,0.48139,-0.65893,0.1579,0.50979,-0.65893,0.19772,0.51127,-0.65893,0.21281,0.55072,-0.65893,0.23819,0.57484,-0.65893,0.25235,0.60915,-0.65893,0.26987,0.63951,-0.65893,0.29696,0.66551,-0.65893,0.30536,0.70188,-0.65893,0.31769,0.73681,-0.65893,0.32688,0.77338,-0.65893,0.33391,0.81125,-0.65893,0.34991,0.81614,-0.63214,0.36406,0.85668,-0.63214,0.34836,0.8946,-0.63214,0.32705,0.92874,-0.63214,0.3359,0.97461,-0.63214,0.31977,1.01177,-0.63214,0.2744,1.0274,-0.63214,0.24398,1.04893,-0.63214,0.23022,1.08707,-0.63214,0.20571,1.11617,-0.63214,0.16754,1.12364,-0.63214,0.13723,1.14276,-0.63214,0.10712,1.1655,-0.63214,0.07168,1.17349,-0.63214,0.03686,1.1878,-0.63214,0.0,1.19739,-0.63214,-0.03679,1.18705,-0.63214,-0.07466,1.18836,-0.63214,-0.11097,1.17803,-0.63214,-0.14612,1.16392,-0.63214,-0.17702,1.14104,-0.63214,-0.2118,1.12504,-0.63214,-0.23921,1.09766,-0.63214,-0.24943,1.05412,-0.63214,-0.26115,1.01719,-0.63214,-0.29491,0.99656,-0.63214,-0.31371,0.96414,-0.63214,-0.32141,0.9268,-0.63214,-0.33083,0.89065,-0.63214,-0.36106,0.85635,-0.63214,-0.36198,0.81614,-0.63214,-0.3443,0.77779,-0.63214,-0.3389,0.7398,-0.63214,-0.33915,0.69936,-0.63214,-0.33768,0.65682,-0.63214,-0.30355,0.63042,-0.63214,-0.27767,0.60236,-0.63214,-0.24611,0.58131,-0.63214,-0.23226,0.5428,-0.63214,-0.20728,0.51382,-0.63214,-0.16539,0.51258,-0.63214,-0.13944,0.48427,-0.63214,-0.10759,0.46526,-0.63214,-0.07086,0.46285,-0.63214,-0.03566,0.45658,-0.63214,-0.0,0.46302,-0.63214,0.03736,0.43949,-0.63214,0.07431,0.44566,-0.63214,0.11445,0.44289,-0.63214,0.14612,0.46837,-0.63214,0.17781,0.48979,-0.63214,0.21356,0.50465,-0.63214,0.23136,0.54386,-0.63214,0.25793,0.57004,-0.63214,0.26432,0.61263,-0.63214,0.29228,0.63732,-0.63214,0.33024,0.66033,-0.63214,0.32389,0.70462,-0.63214,0.32454,0.74304,-0.63214,0.35312,0.77681,-0.63214,0.34991,0.81614,-0.63214,0.376,0.81959,-0.60536,0.39182,0.86197,-0.60536,0.35743,0.89778,-0.60536,0.34377,0.93454,-0.60536,0.34689,0.97853,-0.60536,0.33415,1.01813,-0.60536,0.28996,1.0364,-0.60536,0.27259,1.07218,-0.60536,0.25124,1.10675,-0.60536,0.21728,1.12736,-0.60536,0.1835,1.14669,-0.60536,0.14502,1.15481,-0.60536,0.11682,1.18961,-0.60536,0.07654,1.19018,-0.60536,0.03997,1.21092,-0.60536,0.0,1.19459,-0.60536,-0.03991,1.2104,-0.60536,-0.07966,1.20529,-0.60536,-0.12213,1.20642,-0.60536,-0.15685,1.18213,-0.60536,-0.1866,1.15221,-0.60536,-0.22379,1.13659,-0.60536,-0.26573,1.12331,-0.60536,-0.27243,1.07203,-0.60536,-0.28154,1.0301,-0.60536,-0.31093,1.00433,-0.60536,-0.33048,0.97101,-0.60536,-0.34123,0.93369,-0.60536,-0.34045,0.89406,-0.60536,-0.36321,0.85887,-0.60536,-0.37485,0.81959,-0.60536,-0.36018,0.78063,-0.60536,-0.35214,0.74256,-0.60536,-0.36569,0.69731,-0.60536,-0.35541,0.65674,-0.60536,-0.33777,0.61889,-0.60536,-0.30876,0.58872,-0.60536,-0.26241,0.57643,-0.60536,-0.24678,0.53752,-0.60536,-0.22127,0.50616,-0.60536,-0.17994,0.49884,-0.60536,-0.14564,0.48295,-0.60536,-0.11515,0.45486,-0.60536,-0.07659,0.44875,-0.60536,-0.03931,0.43464,-0.60536,-0.0,0.456,-0.60536,0.03818,0.44572,-0.60536,0.08007,0.43191,-0.60536,0.12197,0.43325,-0.60536,0.15334,0.46515,-0.60536,0.19262,0.47623,-0.60536,0.22495,0.50094,-0.60536,0.24826,0.53584,-0.60536,0.26796,0.57128,-0.60536,0.29206,0.60121,-0.60536,0.31854,0.63032,-0.60536,0.35241,0.65811,-0.60536,0.33898,0.70623,-0.60536,0.34288,0.74458,-0.60536,0.36068,0.78057,-0.60536,0.376,0.81959,-0.60536,0.39052,0.82096,-0.57143,0.39652,0.86306,-0.57143,0.37566,0.90161,-0.57143,0.35633,0.9379,-0.57143,0.35499,0.9806,-0.57143,0.34782,1.02379,-0.57143,0.31746,1.05393,-0.57143,0.29399,1.08833,-0.57143,0.27136,1.12536,-0.57143,0.24267,1.15832,-0.57143,0.19276,1.15819,-0.57143,0.15607,1.17503,-0.57143,0.1195,1.19244,-0.57143,0.08206,1.21089,-0.57143,0.04235,1.22798,-0.57143,0.0,1.20456,-0.57143,-0.04038,1.209,-0.57143,-0.08219,1.21153,-0.57143,-0.12398,1.20637,-0.57143,-0.1567,1.17645,-0.57143,-0.19081,1.15478,-0.57143,-0.23727,1.15082,-0.57143,-0.27751,1.13227,-0.57143,-0.28681,1.0818,-0.57143,-0.30056,1.04153,-0.57143,-0.3331,1.01521,-0.57143,-0.35974,0.98274,-0.57143,-0.35452,0.93731,-0.57143,-0.35314,0.89678,-0.57143,-0.36491,0.8597,-0.57143,-0.38459,0.82096,-0.57143,-0.3816,0.78045,-0.57143,-0.36858,0.74183,-0.57143,-0.38027,0.69616,-0.57143,-0.37841,0.65079,-0.57143,-0.35712,0.61271,-0.57143,-0.32077,0.58557,-0.57143,-0.28298,0.56361,-0.57143,-0.25912,0.53029,-0.57143,-0.2371,0.49134,-0.57143,-0.19949,0.47196,-0.57143,-0.15728,0.46415,-0.57143,-0.11852,0.45254,-0.57143,-0.08232,0.42977,-0.57143,-0.04146,0.42253,-0.57143,-0.0,0.44725,-0.57143,0.03921,0.4442,-0.57143,0.08054,0.43822,-0.57143,0.12136,0.44369,-0.57143,0.16312,0.4509,-0.57143,0.19271,0.48383,-0.57143,0.23221,0.49815,-0.57143,0.26597,0.52261,-0.57143,0.29751,0.55039,-0.57143,0.32602,0.58171,-0.57143,0.34016,0.6226,-0.57143,0.35497,0.66133,-0.57143,0.36244,0.70201,-0.57143,0.36045,0.74358,-0.57143,0.3894,0.77962,-0.57143,0.39052,0.82096,-0.57143,0.39685,0.82113,-0.53571,0.40432,0.86348,-0.53571,0.39874,0.9056,-0.53571,0.3832,0.94522,-0.53571,0.37334,0.9868,-0.53571,0.37085,1.03453,-0.53571,0.33665,1.06491,-0.53571,0.30376,1.09372,-0.53571,0.28546,1.13711,-0.53571,0.25109,1.16558,-0.53571,0.21091,1.18523,-0.53571,0.17279,1.20793,-0.53571,0.12723,1.21139,-0.53571,0.08555,1.22227,-0.53571,0.0434,1.23265,-0.53571,0.0,1.21463,-0.53571,-0.04218,1.22108,-0.53571,-0.08586,1.22373,-0.53571,-0.12709,1.21098,-0.53571,-0.16677,1.19446,-0.53571,-0.20846,1.18099,-0.53571,-0.23677,1.14593,-0.53571,-0.28414,1.13565,-0.53571,-0.316,1.10471,-0.53571,-0.33136,1.06108,-0.53571,-0.36952,1.03377,-0.53571,-0.39308,0.99556,-0.53571,-0.38159,0.9447,-0.53571,-0.39414,0.90463,-0.53571,-0.40142,0.86318,-0.53571,-0.41945,0.82113,-0.53571,-0.39751,0.77949,-0.53571,-0.38283,0.74003,-0.53571,-0.38639,0.696,-0.53571,-0.37345,0.65541,-0.53571,-0.35887,0.61462,-0.53571,-0.33283,0.58011,-0.53571,-0.2986,0.55316,-0.53571,-0.26775,0.52475,-0.53571,-0.24716,0.48207,-0.53571,-0.21344,0.45267,-0.53571,-0.16958,0.4415,-0.53571,-0.12828,0.42762,-0.53571,-0.08656,0.41526,-0.53571,-0.04188,0.424,-0.53571,-0.0,0.41251,-0.53571,0.042,0.42284,-0.53571,0.08506,0.42228,-0.53571,0.12725,0.4308,-0.53571,0.17095,0.43844,-0.53571,0.20872,0.46081,-0.53571,0.24845,0.4803,-0.53571,0.28966,0.5005,-0.53571,0.31241,0.54077,-0.53571,0.33374,0.57946,-0.53571,0.36109,0.61335,-0.53571,0.38736,0.64924,-0.53571,0.38357,0.69691,-0.53571,0.39637,0.73716,-0.53571,0.40174,0.77905,-0.53571,0.39685,0.82113,-0.53571,0.40841,0.82062,-0.5,0.4132,0.86349,-0.5,0.42559,0.9099,-0.5,0.40094,0.9492,-0.5,0.37643,0.98603,-0.5,0.37232,1.03277,-0.5,0.34366,1.06704,-0.5,0.31652,1.1019,-0.5,0.29487,1.14383,-0.5,0.25577,1.16806,-0.5,0.2203,1.1972,-0.5,0.17861,1.21656,-0.5,0.13059,1.2173,-0.5,0.08972,1.23721,-0.5,0.04625,1.25487,-0.5,0.0,1.24765,-0.5,-0.04403,1.23402,-0.5,-0.09028,1.23979,-0.5,-0.13335,1.22568,-0.5,-0.17412,1.20659,-0.5,-0.21477,1.18776,-0.5,-0.24811,1.15765,-0.5,-0.2876,1.13586,-0.5,-0.33409,1.11751,-0.5,-0.34952,1.07125,-0.5,-0.37368,1.03355,-0.5,-0.39895,0.99593,-0.5,-0.41218,0.9528,-0.5,-0.42655,0.91011,-0.5,-0.43176,0.86541,-0.5,-0.43302,0.82062,-0.5,-0.41255,0.77783,-0.5,-0.39978,0.73676,-0.5,-0.37734,0.69962,-0.5,-0.37855,0.65429,-0.5,-0.37965,0.6043,-0.5,-0.34755,0.57141,-0.5,-0.30764,0.54725,-0.5,-0.28228,0.51121,-0.5,-0.24908,0.48228,-0.5,-0.227,0.43259,-0.5,-0.18085,0.41973,-0.5,-0.13554,0.40892,-0.5,-0.09062,0.39986,-0.5,-0.04638,0.38512,-0.5,-0.0,0.395,-0.5,0.04318,0.41512,-0.5,0.09046,0.40059,-0.5,0.13303,0.41655,-0.5,0.17677,0.42878,-0.5,0.21159,0.45893,-0.5,0.2478,0.48401,-0.5,0.29266,0.49984,-0.5,0.33071,0.52674,-0.5,0.35202,0.56821,-0.5,0.38382,0.60192,-0.5,0.4099,0.64051,-0.5,0.4087,0.68957,-0.5,0.42777,0.73089,-0.5,0.41621,0.77745,-0.5,0.40841,0.82062,-0.5,0.44518,0.81996,-0.46429,0.4363,0.86487,-0.46429,0.42794,0.90904,-0.46429,0.41629,0.95242,-0.46429,0.38673,0.98858,-0.46429,0.38911,1.03996,-0.46429,0.36122,1.07696,-0.46429,0.31474,1.09748,-0.46429,0.29669,1.14264,-0.46429,0.26917,1.18276,-0.46429,0.23339,1.21582,-0.46429,0.18978,1.23738,-0.46429,0.1352,1.22742,-0.46429,0.09556,1.26022,-0.46429,0.04886,1.27518,-0.46429,0.0,1.25954,-0.46429,-0.04729,1.26058,-0.46429,-0.09184,1.24306,-0.46429,-0.13456,1.2255,-0.46429,-0.18165,1.2195,-0.46429,-0.21838,1.19037,-0.46429,-0.25404,1.16236,-0.46429,-0.28963,1.13496,-0.46429,-0.34918,1.12784,-0.46429,-0.36848,1.08213,-0.46429,-0.37519,1.03208,-0.46429,-0.42056,1.00333,-0.46429,-0.44393,0.96121,-0.46429,-0.44629,0.91286,-0.46429,-0.4386,0.8651,-0.46429,-0.43,0.81996,-0.46429,-0.43647,0.77504,-0.46429,-0.44145,0.72807,-0.46429,-0.40496,0.69111,-0.46429,-0.38927,0.65024,-0.46429,-0.39117,0.5988,-0.46429,-0.37408,0.55381,-0.46429,-0.32422,0.53408,-0.46429,-0.29646,0.49753,-0.46429,-0.2531,0.47882,-0.46429,-0.22377,0.44042,-0.46429,-0.18571,0.4115,-0.46429,-0.13347,0.4177,-0.46429,-0.09414,0.38623,-0.46429,-0.04864,0.36678,-0.46429,-0.0,0.36782,-0.46429,0.04512,0.39959,-0.46429,0.09009,0.40489,-0.46429,0.13861,0.4022,-0.46429,0.18578,0.41135,-0.46429,0.21741,0.4512,-0.46429,0.24088,0.4953,-0.46429,0.294,0.50021,-0.46429,0.34555,0.51527,-0.46429,0.35804,0.56522,-0.46429,0.3884,0.60037,-0.46429,0.41705,0.63813,-0.46429,0.44411,0.67865,-0.46429,0.45138,0.72601,-0.46429,0.43001,0.7757,-0.46429,0.44518,0.81996,-0.46429,0.46354,0.81965,-0.42857,0.45909,0.86657,-0.42857,0.4689,0.91657,-0.42857,0.4289,0.95517,-0.42857,0.40056,0.99308,-0.42857,0.38927,1.0382,-0.42857,0.37364,1.08363,-0.42857,0.33183,1.11019,-0.42857,0.28985,1.13269,-0.42857,0.26416,1.17321,-0.42857,0.22985,1.20679,-0.42857,0.18678,1.2276,-0.42857,0.13848,1.23411,-0.42857,0.09323,1.24617,-0.42857,0.05072,1.28892,-0.42857,0.0,1.27664,-0.42857,-0.04711,1.25551,-0.42857,-0.09259,1.24322,-0.42857,-0.13805,1.23281,-0.42857,-0.18736,1.22886,-0.42857,-0.21983,1.18991,-0.42857,-0.25332,1.1587,-0.42857,-0.30237,1.1462,-0.42857,-0.34071,1.11797,-0.42857,-0.37858,1.08712,-0.42857,-0.39096,1.03915,-0.42857,-0.42801,1.00496,-0.42857,-0.45309,0.96281,-0.42857,-0.4735,0.91752,-0.42857,-0.44693,0.86533,-0.42857,-0.44263,0.81965,-0.42857,-0.45268,0.77338,-0.42857,-0.47531,0.7214,-0.42857,-0.44413,0.67932,-0.42857,-0.40345,0.64498,-0.42857,-0.38263,0.60483,-0.42857,-0.37332,0.5559,-0.42857,-0.33245,0.52856,-0.42857,-0.30229,0.49318,-0.42857,-0.25643,0.47644,-0.42857,-0.22599,0.43902,-0.42857,-0.19473,0.39433,-0.42857,-0.13966,0.40167,-0.42857,-0.09778,0.37232,-0.42857,-0.04895,0.36677,-0.42857,-0.0,0.37001,-0.42857,0.04786,0.37681,-0.42857,0.09513,0.38444,-0.42857,0.13953,0.40205,-0.42857,0.18414,0.41746,-0.42857,0.21998,0.44914,-0.42857,0.24686,0.48925,-0.42857,0.2871,0.50958,-0.42857,0.33542,0.52596,-0.42857,0.35293,0.5703,-0.42857,0.37279,0.61036,-0.42857,0.41668,0.63925,-0.42857,0.45831,0.67484,-0.42857,0.47136,0.72222,-0.42857,0.45389,0.77326,-0.42857,0.46354,0.81965,-0.42857,0.46372,0.82018,-0.39036,0.47084,0.86796,-0.39036,0.48564,0.91983,-0.39036,0.46512,0.96607,-0.39036,0.41861,1.0001,-0.39036,0.39035,1.03774,-0.39036,0.39706,1.09867,-0.39036,0.35779,1.13118,-0.39036,0.29694,1.13854,-0.39036,0.26405,1.17102,-0.39036,0.2379,1.21796,-0.39036,0.19628,1.24576,-0.39036,0.14092,1.23887,-0.39036,0.0973,1.26206,-0.39036,0.04907,1.27085,-0.39036,0.0,1.28191,-0.39036,-0.04895,1.26974,-0.39036,-0.09514,1.25228,-0.39036,-0.14412,1.24837,-0.39036,-0.20138,1.25681,-0.39036,-0.23878,1.21944,-0.39036,-0.27567,1.18647,-0.39036,-0.31855,1.16171,-0.39036,-0.34409,1.11927,-0.39036,-0.36544,1.07649,-0.39036,-0.39434,1.03997,-0.39036,-0.41257,0.99751,-0.39036,-0.45276,0.9622,-0.39036,-0.46248,0.91508,-0.39036,-0.47468,0.86835,-0.39036,-0.47639,0.82018,-0.39036,-0.464,0.77311,-0.39036,-0.48107,0.72147,-0.39036,-0.45984,0.67595,-0.39036,-0.41683,0.64103,-0.39036,-0.39055,0.60252,-0.39036,-0.38775,0.54823,-0.39036,-0.34204,0.52288,-0.39036,-0.29729,0.50145,-0.39036,-0.26933,0.46233,-0.39036,-0.22916,0.43703,-0.39036,-0.19133,0.40535,-0.39036,-0.14545,0.38805,-0.39036,-0.09475,0.38987,-0.39036,-0.04907,0.36948,-0.39036,-0.0,0.35374,-0.39036,0.05082,0.3534,-0.39036,0.10066,0.36302,-0.39036,0.14513,0.38901,-0.39036,0.1947,0.39805,-0.39036,0.23781,0.42256,-0.39036,0.26735,0.46496,-0.39036,0.3062,0.4919,-0.39036,0.34263,0.52237,-0.39036,0.37759,0.55536,-0.39036,0.38921,0.60326,-0.39036,0.4026,0.64715,-0.39036,0.44788,0.6797,-0.39036,0.46728,0.7243,-0.39036,0.46276,0.77323,-0.39036,0.46372,0.82018,-0.39036,0.44996,0.8213,-0.34214,0.45921,0.86754,-0.34214,0.46329,0.91564,-0.34214,0.47152,0.96807,-0.34214,0.45063,1.01351,-0.34214,0.42079,1.05404,-0.34214,0.3922,1.09429,-0.34214,0.36483,1.136,-0.34214,0.319,1.16071,-0.34214,0.27286,1.18108,-0.34214,0.24064,1.2206,-0.34214,0.1949,1.24067,-0.34214,0.14033,1.23506,-0.34214,0.09636,1.2556,-0.34214,0.0487,1.26521,-0.34214,0.0,1.27092,-0.34214,-0.04899,1.26783,-0.34214,-0.09908,1.26788,-0.34214,-0.1499,1.26327,-0.34214,-0.20695,1.26659,-0.34214,-0.2457,1.22899,-0.34214,-0.27685,1.18634,-0.34214,-0.32186,1.16375,-0.34214,-0.36951,1.14003,-0.34214,-0.38644,1.09028,-0.34214,-0.4122,1.04929,-0.34214,-0.40576,0.99437,-0.34214,-0.43586,0.95697,-0.34214,-0.46775,0.91655,-0.34214,-0.4635,0.86797,-0.34214,-0.4651,0.8213,-0.34214,-0.45582,0.7754,-0.34214,-0.49309,0.72089,-0.34214,-0.47192,0.6744,-0.34214,-0.42087,0.64179,-0.34214,-0.39668,0.60189,-0.34214,-0.3852,0.55319,-0.34214,-0.36165,0.50935,-0.34214,-0.31716,0.48386,-0.34214,-0.26726,0.46889,-0.34214,-0.2328,0.43501,-0.34214,-0.18995,0.41259,-0.34214,-0.141,0.40557,-0.34214,-0.09289,0.40263,-0.34214,-0.04923,0.37259,-0.34214,-0.0,0.34556,-0.34214,0.04994,0.36612,-0.34214,0.10227,0.36037,-0.34214,0.14482,0.39431,-0.34214,0.19843,0.39434,-0.34214,0.23897,0.42477,-0.34214,0.27697,0.4561,-0.34214,0.31206,0.48928,-0.34214,0.36406,0.50727,-0.34214,0.38508,0.55327,-0.34214,0.40753,0.5959,-0.34214,0.42689,0.63922,-0.34214,0.43785,0.68501,-0.34214,0.46751,0.7261,-0.34214,0.47532,0.77344,-0.34214,0.44996,0.8213,-0.34214,0.46466,0.82274,-0.29393,0.4827,0.87098,-0.29393,0.47204,0.91815,-0.29393,0.47709,0.97015,-0.29393,0.44223,1.00997,-0.29393,0.40861,1.04707,-0.29393,0.4084,1.1049,-0.29393,0.37845,1.14677,-0.29393,0.33223,1.17361,-0.29393,0.28265,1.19268,-0.29393,0.25315,1.23969,-0.29393,0.19829,1.24624,-0.29393,0.14996,1.26163,-0.29393,0.09932,1.26706,-0.29393,0.05005,1.27559,-0.29393,0.0,1.27579,-0.29393,-0.05144,1.28818,-0.29393,-0.10024,1.27117,-0.29393,-0.14109,1.23566,-0.29393,-0.1946,1.23837,-0.29393,-0.24848,1.23199,-0.29393,-0.28799,1.19966,-0.29393,-0.3291,1.1703,-0.29393,-0.35977,1.13078,-0.29393,-0.40131,1.1,-0.29393,-0.43405,1.06104,-0.29393,-0.43292,1.00602,-0.29393,-0.44592,0.96051,-0.29393,-0.48097,0.91995,-0.29393,-0.4984,0.87255,-0.29393,-0.47839,0.82274,-0.29393,-0.47744,0.77502,-0.29393,-0.46926,0.72789,-0.29393,-0.45961,0.68073,-0.29393,-0.42595,0.6424,-0.29393,-0.41479,0.59501,-0.29393,-0.40304,0.54428,-0.29393,-0.36936,0.50648,-0.29393,-0.33153,0.4726,-0.29393,-0.28148,0.45432,-0.29393,-0.23637,0.43343,-0.29393,-0.19523,0.40576,-0.29393,-0.14638,0.39434,-0.29393,-0.0963,0.3919,-0.29393,-0.04685,0.39885,-0.29393,-0.0,0.36472,-0.29393,0.05083,0.36289,-0.29393,0.10028,0.37412,-0.29393,0.14335,0.40319,-0.29393,0.19578,0.4046,-0.29393,0.25047,0.4102,-0.29393,0.29171,0.44094,-0.29393,0.33195,0.47216,-0.29393,0.35669,0.51733,-0.29393,0.39823,0.5476,-0.29393,0.43382,0.58456,-0.29393,0.44218,0.63552,-0.29393,0.44568,0.68503,-0.29393,0.46242,0.72927,-0.29393,0.49268,0.77349,-0.29393,0.46466,0.82274,-0.29393,0.48256,0.82449,-0.24571,0.49041,0.87317,-0.24571,0.4729,0.91942,-0.24571,0.46413,0.96692,-0.24571,0.44214,1.01041,-0.24571,0.40964,1.04785,-0.24571,0.38133,1.08615,-0.24571,0.36151,1.13191,-0.24571,0.33569,1.17659,-0.24571,0.28341,1.1929,-0.24571,0.24787,1.22996,-0.24571,0.20229,1.2536,-0.24571,0.15171,1.26547,-0.24571,0.10176,1.27665,-0.24571,0.04972,1.27124,-0.24571,0.0,1.29315,-0.24571,-0.05261,1.29723,-0.24571,-0.10201,1.27775,-0.24571,-0.14128,1.23515,-0.24571,-0.19373,1.23545,-0.24571,-0.24176,1.21997,-0.24571,-0.29261,1.20485,-0.24571,-0.31917,1.15927,-0.24571,-0.34939,1.1216,-0.24571,-0.40598,1.10306,-0.24571,-0.43116,1.05959,-0.24571,-0.45569,1.0161,-0.24571,-0.4657,0.9674,-0.24571,-0.48183,0.92122,-0.24571,-0.49657,0.87378,-0.24571,-0.50384,0.82449,-0.24571,-0.46311,0.77852,-0.24571,-0.47996,0.72814,-0.24571,-0.46294,0.68243,-0.24571,-0.42998,0.64369,-0.24571,-0.3978,0.60758,-0.24571,-0.39303,0.5548,-0.24571,-0.3613,0.51725,-0.24571,-0.3471,0.46041,-0.24571,-0.28555,0.4533,-0.24571,-0.23961,0.43253,-0.24571,-0.20397,0.39181,-0.24571,-0.15394,0.37703,-0.24571,-0.10086,0.37636,-0.24571,-0.04812,0.39207,-0.24571,-0.0,0.37346,-0.24571,0.05145,0.36221,-0.24571,0.10074,0.37688,-0.24571,0.1481,0.394,-0.24571,0.18799,0.42572,-0.24571,0.2396,0.43255,-0.24571,0.29578,0.44,-0.24571,0.32343,0.48524,-0.24571,0.36148,0.51709,-0.24571,0.41123,0.54231,-0.24571,0.4512,0.57846,-0.24571,0.44556,0.63713,-0.24571,0.45995,0.68335,-0.24571,0.46906,0.73033,-0.24571,0.49903,0.77495,-0.24571,0.48256,0.82449,-0.24571,0.51756,0.82656,-0.1975,0.49505,0.87542,-0.1975,0.46558,0.91948,-0.1975,0.48698,0.97512,-0.1975,0.45979,1.01877,-0.1975,0.4201,1.05429,-0.1975,0.385,1.08919,-0.1975,0.35588,1.12743,-0.1975,0.32404,1.16446,-0.1975,0.28038,1.18889,-0.1975,0.24229,1.22058,-0.1975,0.20619,1.26139,-0.1975,0.15242,1.267,-0.1975,0.10225,1.2782,-0.1975,0.05201,1.29121,-0.1975,0.0,1.2784,-0.1975,-0.05226,1.29342,-0.1975,-0.10262,1.27984,-0.1975,-0.1468,1.25077,-0.1975,-0.20055,1.24949,-0.1975,-0.24871,1.23103,-0.1975,-0.29574,1.20874,-0.1975,-0.32462,1.16507,-0.1975,-0.35528,1.12691,-0.1975,-0.39648,1.09702,-0.1975,-0.42801,1.05858,-0.1975,-0.45386,1.01629,-0.1975,-0.47603,0.97178,-0.1975,-0.50555,0.92746,-0.1975,-0.49908,0.87581,-0.1975,-0.51374,0.82656,-0.1975,-0.48095,0.7791,-0.1975,-0.47911,0.73095,-0.1975,-0.47275,0.68234,-0.1975,-0.43687,0.64394,-0.1975,-0.39956,0.60997,-0.1975,-0.37748,0.56906,-0.1975,-0.35499,0.52646,-0.1975,-0.31884,0.49408,-0.1975,-0.28014,0.46453,-0.1975,-0.23372,0.44649,-0.1975,-0.20533,0.39356,-0.1975,-0.16099,0.36135,-0.1975,-0.10857,0.34698,-0.1975,-0.05081,0.37266,-0.1975,-0.0,0.36925,-0.1975,0.05257,0.35697,-0.1975,0.10454,0.36478,-0.1975,0.15279,0.38506,-0.1975,0.19827,0.40845,-0.1975,0.2504,0.41935,-0.1975,0.28609,0.45685,-0.1975,0.32118,0.49165,-0.1975,0.36319,0.51952,-0.1975,0.4013,0.55281,-0.1975,0.43113,0.59285,-0.1975,0.44033,0.64249,-0.1975,0.45857,0.68667,-0.1975,0.4674,0.73328,-0.1975,0.50787,0.77644,-0.1975,0.51756,0.82656,-0.1975,0.51645,0.82895,-0.14929,0.49048,0.87714,-0.14929,0.50557,0.9294,-0.14929,0.48094,0.97502,-0.14929,0.47461,1.02647,-0.14929,0.43938,1.06606,-0.14929,0.40393,1.10326,-0.14929,0.35497,1.1277,-0.14929,0.32722,1.16864,-0.14929,0.28092,1.19036,-0.14929,0.24,1.2175,-0.14929,0.19919,1.24714,-0.14929,0.15043,1.26169,-0.14929,0.10092,1.27273,-0.14929,0.05131,1.28527,-0.14929,0.0,1.27468,-0.14929,-0.05321,1.30217,-0.14929,-0.10907,1.30856,-0.14929,-0.15882,1.28584,-0.14929,-0.20015,1.24913,-0.14929,-0.24538,1.22621,-0.14929,-0.29025,1.20237,-0.14929,-0.3316,1.17319,-0.14929,-0.34526,1.11953,-0.14929,-0.3879,1.09237,-0.14929,-0.42527,1.05845,-0.14929,-0.43573,1.01028,-0.14929,-0.46201,0.96927,-0.14929,-0.48322,0.92496,-0.14929,-0.51538,0.87959,-0.14929,-0.52114,0.82895,-0.14929,-0.4967,0.78016,-0.14929,-0.49625,0.73036,-0.14929,-0.49522,0.67856,-0.14929,-0.46977,0.63346,-0.14929,-0.42846,0.59774,-0.14929,-0.40402,0.55458,-0.14929,-0.36978,0.51775,-0.14929,-0.32072,0.49602,-0.14929,-0.29364,0.45119,-0.14929,-0.24776,0.42784,-0.14929,-0.20033,0.40839,-0.14929,-0.15171,0.39253,-0.14929,-0.10568,0.36424,-0.14929,-0.05252,0.36188,-0.14929,-0.0,0.35682,-0.14929,0.05339,0.35418,-0.14929,0.10831,0.35266,-0.14929,0.15131,0.39368,-0.14929,0.19571,0.41809,-0.14929,0.24259,0.43621,-0.14929,0.29241,0.45277,-0.14929,0.324,0.49261,-0.14929,0.35352,0.53143,-0.14929,0.38017,0.57078,-0.14929,0.42686,0.5986,-0.14929,0.44031,0.64572,-0.14929,0.468,0.68682,-0.14929,0.46553,0.73646,-0.14929,0.49193,0.78063,-0.14929,0.51645,0.82895,-0.14929,0.50796,0.83161,-0.10107,0.49624,0.88021,-0.10107,0.47751,0.92618,-0.10107,0.47326,0.97489,-0.10107,0.46605,1.02495,-0.10107,0.4446,1.07078,-0.10107,0.41016,1.10927,-0.10107,0.36349,1.13656,-0.10107,0.35212,1.19598,-0.10107,0.30243,1.21946,-0.10107,0.23964,1.21835,-0.10107,0.1971,1.24408,-0.10107,0.1547,1.27524,-0.10107,0.10333,1.28455,-0.10107,0.04956,1.27092,-0.10107,0.0,1.28386,-0.10107,-0.05086,1.2825,-0.10107,-0.10877,1.30841,-0.10107,-0.15674,1.28107,-0.10107,-0.19998,1.25012,-0.10107,-0.24939,1.23409,-0.10107,-0.29105,1.20486,-0.10107,-0.3337,1.17692,-0.10107,-0.37591,1.14698,-0.10107,-0.39317,1.09777,-0.10107,-0.42974,1.06279,-0.10107,-0.4406,1.01439,-0.10107,-0.45688,0.96993,-0.10107,-0.47054,0.9248,-0.10107,-0.50402,0.88097,-0.10107,-0.51436,0.83161,-0.10107,-0.4888,0.78375,-0.10107,-0.47634,0.73728,-0.10107,-0.47514,0.68777,-0.10107,-0.46835,0.63733,-0.10107,-0.44574,0.59183,-0.10107,-0.4202,0.54716,-0.10107,-0.3727,0.51894,-0.10107,-0.34704,0.4725,-0.10107,-0.2989,0.44829,-0.10107,-0.24416,0.43758,-0.10107,-0.20352,0.4057,-0.10107,-0.15508,0.38691,-0.10107,-0.10525,0.37025,-0.10107,-0.05148,0.37527,-0.10107,-0.0,0.36642,-0.10107,0.05022,0.38646,-0.10107,0.10255,0.38208,-0.10107,0.15505,0.38699,-0.10107,0.21168,0.38862,-0.10107,0.24935,0.42921,-0.10107,0.29181,0.45739,-0.10107,0.33619,0.48372,-0.10107,0.37356,0.51822,-0.10107,0.38512,0.57091,-0.10107,0.41955,0.60592,-0.10107,0.45557,0.64263,-0.10107,0.46591,0.69056,-0.10107,0.48369,0.73582,-0.10107,0.47443,0.78515,-0.10107,0.50796,0.83161,-0.10107,0.50596,0.8344,-0.05286,0.50071,0.88328,-0.05286,0.47606,0.92838,-0.05286,0.46214,0.97387,-0.05286,0.44146,1.01696,-0.05286,0.4276,1.06369,-0.05286,0.39002,1.09759,-0.05286,0.37234,1.14578,-0.05286,0.35014,1.19558,-0.05286,0.29924,1.21693,-0.05286,0.24917,1.23523,-0.05286,0.19528,1.24177,-0.05286,0.14754,1.25615,-0.05286,0.10155,1.27811,-0.05286,0.05087,1.2839,-0.05286,0.0,1.28452,-0.05286,-0.0497,1.27362,-0.05286,-0.10443,1.29073,-0.05286,-0.15621,1.28093,-0.05286,-0.20745,1.26715,-0.05286,-0.24285,1.22507,-0.05286,-0.28689,1.20114,-0.05286,-0.33965,1.18476,-0.05286,-0.38529,1.15661,-0.05286,-0.39143,1.09854,-0.05286,-0.43754,1.06903,-0.05286,-0.47579,1.03115,-0.05286,-0.46515,0.97478,-0.05286,-0.46082,0.92538,-0.05286,-0.47135,0.88041,-0.05286,-0.48542,0.8344,-0.05286,-0.4945,0.78613,-0.05286,-0.48875,0.73791,-0.05286,-0.45711,0.69646,-0.05286,-0.46368,0.64266,-0.05286,-0.4326,0.60243,-0.05286,-0.39806,0.5658,-0.05286,-0.36855,0.5262,-0.05286,-0.34552,0.47799,-0.05286,-0.30469,0.4449,-0.05286,-0.24831,0.43494,-0.05286,-0.20151,0.41403,-0.05286,-0.14878,0.40911,-0.05286,-0.10415,0.3793,-0.05286,-0.05191,0.37569,-0.05286,-0.0,0.39555,-0.05286,0.04887,0.40257,-0.05286,0.10381,0.38081,-0.05286,0.15524,0.39065,-0.05286,0.19759,0.42222,-0.05286,0.24924,0.43345,-0.05286,0.29489,0.45744,-0.05286,0.34709,0.47638,-0.05286,0.39059,0.50776,-0.05286,0.39978,0.56463,-0.05286,0.42829,0.60474,-0.05286,0.48239,0.63492,-0.05286,0.48979,0.68659,-0.05286,0.48743,0.73818,-0.05286,0.47476,0.78806,-0.05286,0.50596,0.8344,-0.05286,0.48196,0.83746,-0.00464,0.4918,0.88536,-0.00464,0.5001,0.93596,-0.00464,0.46083,0.9762,-0.00464,0.44969,1.02298,-0.00464,0.42542,1.06505,-0.00464,0.3856,1.09705,-0.00464,0.3613,1.1389,-0.00464,0.33084,1.17793,-0.00464,0.31476,1.23888,-0.00464,0.25933,1.25366,-0.00464,0.19836,1.25027,-0.00464,0.15086,1.26766,-0.00464,0.10281,1.28564,-0.00464,0.05282,1.30315,-0.00464,0.0,1.31082,-0.00464,-0.05057,1.28329,-0.00464,-0.1055,1.29738,-0.00464,-0.15112,1.26842,-0.00464,-0.20266,1.25922,-0.00464,-0.25087,1.24008,-0.00464,-0.29635,1.2154,-0.00464,-0.33152,1.17862,-0.00464,-0.37973,1.15427,-0.00464,-0.40364,1.1092,-0.00464,-0.43236,1.06876,-0.00464,-0.46892,1.03091,-0.00464,-0.51267,0.99181,-0.00464,-0.49119,0.9342,-0.00464,-0.49477,0.88565,-0.00464,-0.50035,0.83746,-0.00464,-0.49645,0.78912,-0.00464,-0.48666,0.74162,-0.00464,-0.46242,0.69825,-0.00464,-0.45499,0.64976,-0.00464,-0.42533,0.60993,-0.00464,-0.39622,0.57073,-0.00464,-0.3661,0.53203,-0.00464,-0.33591,0.49179,-0.00464,-0.29153,0.46567,-0.00464,-0.26172,0.41744,-0.00464,-0.21018,0.40005,-0.00464,-0.15837,0.38585,-0.00464,-0.10694,0.37131,-0.00464,-0.05548,0.3484,-0.00464,-0.0,0.39008,-0.00464,0.05065,0.39097,-0.00464,0.10232,0.39142,-0.00464,0.15666,0.39071,-0.00464,0.19478,0.43211,-0.00464,0.24624,0.44228,-0.00464,0.28513,0.47384,-0.00464,0.32827,0.49965,-0.00464,0.38946,0.51254,-0.00464,0.40476,0.56498,-0.00464,0.42966,0.60761,-0.00464,0.48257,0.63839,-0.00464,0.50252,0.68618,-0.00464,0.49477,0.74002,-0.00464,0.48842,0.7899,-0.00464,0.48196,0.83746,-0.00464,0.5122,0.84097,0.04357,0.50841,0.89046,0.04357,0.49384,0.93818,0.04357,0.47329,0.98339,0.04357,0.4529,1.02772,0.04357,0.42576,1.06862,0.04357,0.40157,1.11117,0.04357,0.35662,1.13835,0.04357,0.31757,1.16761,0.04357,0.29422,1.21601,0.04357,0.25274,1.24639,0.04357,0.19954,1.25604,0.04357,0.14939,1.26678,0.04357,0.10931,1.31725,0.04357,0.05455,1.32166,0.04357,0.0,1.3171,0.04357,-0.0523,1.30183,0.04357,-0.10415,1.29476,0.04357,-0.15604,1.28572,0.04357,-0.21219,1.28235,0.04357,-0.24413,1.23257,0.04357,-0.28119,1.1994,0.04357,-0.32946,1.17984,0.04357,-0.37696,1.15531,0.04357,-0.40521,1.11362,0.04357,-0.41532,1.06304,0.04357,-0.45096,1.02692,0.04357,-0.48042,0.98554,0.04357,-0.49738,0.93888,0.04357,-0.49007,0.88867,0.04357,-0.4934,0.84097,0.04357,-0.53289,0.7891,0.04357,-0.49788,0.74296,0.04357,-0.4831,0.6956,0.04357,-0.43111,0.66321,0.04357,-0.41765,0.61765,0.04357,-0.39452,0.57551,0.04357,-0.37078,0.53179,0.04357,-0.32835,0.50324,0.04357,-0.29713,0.46222,0.04357,-0.25289,0.43532,0.04357,-0.20776,0.40881,0.04357,-0.15787,0.391,0.04357,-0.10163,0.39818,0.04357,-0.05423,0.3631,0.04357,-0.0,0.36479,0.04357,0.05297,0.37426,0.04357,0.10243,0.39467,0.04357,0.15469,0.40005,0.04357,0.20789,0.40854,0.04357,0.25319,0.43483,0.04357,0.27898,0.48536,0.04357,0.31513,0.51684,0.04357,0.35906,0.54156,0.04357,0.38556,0.58154,0.04357,0.42683,0.61275,0.04357,0.45768,0.65225,0.04357,0.49531,0.69193,0.04357,0.49489,0.74355,0.04357,0.48829,0.79344,0.04357,0.5122,0.84097,0.04357,0.48418,0.84509,0.09179,0.50828,0.89469,0.09179,0.49563,0.9429,0.09179,0.47896,0.98958,0.09179,0.45942,1.035,0.09179,0.43435,1.07791,0.09179,0.42085,1.12897,0.09179,0.36582,1.1509,0.09179,0.32943,1.18477,0.09179,0.27462,1.19601,0.09179,0.252,1.25033,0.09179,0.19861,1.25925,0.09179,0.14781,1.26745,0.09179,0.09903,1.27763,0.09179,0.05153,1.30026,0.09179,0.0,1.31298,0.09179,-0.05175,1.30225,0.09179,-0.10016,1.28258,0.09179,-0.15448,1.28649,0.09179,-0.20256,1.26748,0.09179,-0.24035,1.2316,0.09179,-0.27522,1.19679,0.09179,-0.31576,1.17067,0.09179,-0.3645,1.1498,0.09179,-0.41383,1.12423,0.09179,-0.41382,1.06691,0.09179,-0.42228,1.01965,0.09179,-0.46256,0.98463,0.09179,-0.4995,0.94367,0.09179,-0.48301,0.89222,0.09179,-0.50589,0.84509,0.09179,-0.50724,0.7956,0.09179,-0.5039,0.74565,0.09179,-0.48896,0.69759,0.09179,-0.46175,0.65423,0.09179,-0.43859,0.61,0.09179,-0.41926,0.56229,0.09179,-0.36342,0.54129,0.09179,-0.32004,0.51509,0.09179,-0.28342,0.48293,0.09179,-0.2418,0.45627,0.09179,-0.20093,0.4261,0.09179,-0.14384,0.43409,0.09179,-0.10013,0.40774,0.09179,-0.05392,0.36884,0.09179,-0.0,0.3775,0.09179,0.0524,0.38221,0.09179,0.10677,0.37874,0.09179,0.1588,0.39133,0.09179,0.21074,0.40565,0.09179,0.25267,0.43879,0.09179,0.27425,0.49464,0.09179,0.31627,0.51898,0.09179,0.37729,0.5297,0.09179,0.39448,0.579,0.09179,0.40929,0.62571,0.09179,0.43228,0.66641,0.09179,0.47953,0.70044,0.09179,0.4835,0.74968,0.09179,0.50088,0.79622,0.09179,0.48418,0.84509,0.09179,0.48763,0.85,0.14,0.47767,0.89692,0.14,0.50292,0.94991,0.14,0.49487,1.00028,0.14,0.43929,1.03279,0.14,0.42765,1.08076,0.14,0.42473,1.1384,0.14,0.3806,1.17028,0.14,0.33691,1.19971,0.14,0.273,1.20117,0.14,0.23654,1.2329,0.14,0.20274,1.27558,0.14,0.1467,1.27197,0.14,0.09677,1.27548,0.14,0.05078,1.30154,0.14,0.0,1.31336,0.14,-0.05094,1.30294,0.14,-0.09853,1.28323,0.14,-0.15728,1.3024,0.14,-0.20378,1.27775,0.14,-0.25789,1.26746,0.14,-0.29076,1.22403,0.14,-0.31536,1.17733,0.14,-0.3802,1.16995,0.14,-0.40412,1.12441,0.14,-0.4084,1.07037,0.14,-0.42471,1.02673,0.14,-0.46127,0.99007,0.14,-0.48879,0.9471,0.14,-0.47312,0.89648,0.14,-0.47654,0.85,0.14,-0.494,0.80147,0.14,-0.4853,0.75359,0.14,-0.47203,0.70666,0.14,-0.46606,0.65607,0.14,-0.42209,0.62224,0.14,-0.41548,0.56788,0.14,-0.37826,0.53169,0.14,-0.33801,0.49915,0.14,-0.27343,0.49828,0.14,-0.24411,0.45484,0.14,-0.19959,0.43104,0.14,-0.14383,0.43629,0.14,-0.09837,0.41745,0.14,-0.05136,0.39326,0.14,-0.0,0.40046,0.14,0.0511,0.39565,0.14,0.10193,0.40184,0.14,0.15709,0.39814,0.14,0.21004,0.4091,0.14,0.25624,0.4352,0.14,0.28595,0.48216,0.14,0.32994,0.50753,0.14,0.38059,0.52973,0.14,0.40177,0.57719,0.14,0.40106,0.63359,0.14,0.43529,0.66887,0.14,0.47133,0.70687,0.14,0.48796,0.75306,0.14,0.481,0.80275,0.14,0.48763,0.85,0.14,0.45533,0.85561,0.17571,0.45464,0.90083,0.17571,0.47378,0.9509,0.17571,0.45725,0.99619,0.17571,0.41993,1.03252,0.17571,0.41828,1.08412,0.17571,0.4038,1.13321,0.17571,0.36879,1.16981,0.17571,0.32704,1.1993,0.17571,0.28552,1.22746,0.17571,0.2451,1.2573,0.17571,0.20289,1.28681,0.17571,0.14677,1.28303,0.17571,0.0964,1.28477,0.17571,0.04962,1.30235,0.17571,0.0,1.31225,0.17571,-0.04944,1.30067,0.17571,-0.09965,1.29923,0.17571,-0.144,1.27495,0.17571,-0.19455,1.26908,0.17571,-0.24643,1.25948,0.17571,-0.28067,1.22115,0.17571,-0.30742,1.17868,0.17571,-0.35645,1.1593,0.17571,-0.40254,1.13235,0.17571,-0.41511,1.08239,0.17571,-0.42608,1.03511,0.17571,-0.44562,0.99261,0.17571,-0.47931,0.95201,0.17571,-0.45647,0.90101,0.17571,-0.44076,0.85561,0.17571,-0.4475,0.81111,0.17571,-0.44915,0.76528,0.17571,-0.45181,0.7167,0.17571,-0.44039,0.67008,0.17571,-0.41642,0.62812,0.17571,-0.38275,0.59248,0.17571,-0.36336,0.54603,0.17571,-0.33628,0.50222,0.17571,-0.27968,0.49137,0.17571,-0.24976,0.44628,0.17571,-0.19502,0.44113,0.17571,-0.1414,0.44382,0.17571,-0.09753,0.42146,0.17571,-0.04973,0.40793,0.17571,-0.0,0.40157,0.17571,0.04894,0.41504,0.17571,0.09672,0.42506,0.17571,0.14628,0.42962,0.17571,0.19197,0.44762,0.17571,0.248,0.44916,0.17571,0.29671,0.46919,0.17571,0.33149,0.50725,0.17571,0.37402,0.53695,0.17571,0.40841,0.57484,0.17571,0.42507,0.62339,0.17571,0.43163,0.67377,0.17571,0.44585,0.71854,0.17571,0.48714,0.75763,0.17571,0.46856,0.80901,0.17571,0.45533,0.85561,0.17571,0.45259,0.86178,0.21143,0.4469,0.90703,0.21143,0.44089,0.95205,0.21143,0.44457,1.00093,0.21143,0.41525,1.03987,0.21143,0.39822,1.08325,0.21143,0.38792,1.13327,0.21143,0.35967,1.17373,0.21143,0.32676,1.21136,0.21143,0.27715,1.22924,0.21143,0.23965,1.26162,0.21143,0.19555,1.28485,0.21143,0.14901,1.30352,0.21143,0.09462,1.29059,0.21143,0.04803,1.302,0.21143,0.0,1.29406,0.21143,-0.04795,1.30128,0.21143,-0.09755,1.30388,0.21143,-0.13641,1.26619,0.21143,-0.18575,1.26365,0.21143,-0.234,1.2522,0.21143,-0.27056,1.22049,0.21143,-0.30103,1.18382,0.21143,-0.33813,1.15505,0.21143,-0.38129,1.12863,0.21143,-0.40542,1.08725,0.21143,-0.41569,1.04006,0.21143,-0.43956,0.99936,0.21143,-0.46989,0.95799,0.21143,-0.47046,0.90941,0.21143,-0.44304,0.86178,0.21143,-0.42677,0.81858,0.21143,-0.43953,0.77179,0.21143,-0.43693,0.72503,0.21143,-0.4211,0.68119,0.21143,-0.40378,0.63723,0.21143,-0.36452,0.60668,0.21143,-0.34742,0.56047,0.21143,-0.32702,0.51194,0.21143,-0.27526,0.49685,0.21143,-0.23549,0.46889,0.21143,-0.19792,0.43358,0.21143,-0.14817,0.42251,0.21143,-0.09584,0.42747,0.21143,-0.04636,0.43691,0.21143,-0.0,0.3994,0.21143,0.04861,0.41627,0.21143,0.09593,0.42707,0.21143,0.13759,0.4539,0.21143,0.17993,0.4725,0.21143,0.23463,0.47033,0.21143,0.27937,0.49139,0.21143,0.31968,0.51979,0.21143,0.35207,0.55643,0.21143,0.39468,0.58557,0.21143,0.42237,0.62689,0.21143,0.43381,0.67574,0.21143,0.43214,0.72653,0.21143,0.46753,0.76606,0.21143,0.46274,0.81494,0.21143,0.45259,0.86178,0.21143,0.45005,0.86861,0.24714,0.42992,0.91309,0.24714,0.41971,0.95644,0.24714,0.43718,1.00845,0.24714,0.41438,1.05024,0.24714,0.36359,1.07527,0.24714,0.34743,1.11711,0.24714,0.32997,1.16111,0.24714,0.30685,1.20411,0.24714,0.25651,1.21618,0.24714,0.22664,1.25506,0.24714,0.1917,1.2925,0.24714,0.14871,1.31918,0.24714,0.09386,1.30333,0.24714,0.04863,1.32412,0.24714,0.0,1.31565,0.24714,-0.04589,1.29843,0.24714,-0.0904,1.28732,0.24714,-0.12891,1.25919,0.24714,-0.17446,1.25437,0.24714,-0.22224,1.24757,0.24714,-0.26796,1.2317,0.24714,-0.29089,1.18666,0.24714,-0.32261,1.15458,0.24714,-0.35637,1.12351,0.24714,-0.38975,1.09014,0.24714,-0.40449,1.04591,0.24714,-0.42822,1.00559,0.24714,-0.44969,0.96271,0.24714,-0.45996,0.9162,0.24714,-0.44243,0.86861,0.24714,-0.42207,0.82494,0.24714,-0.43211,0.77819,0.24714,-0.43216,0.73037,0.24714,-0.41054,0.68866,0.24714,-0.36841,0.65921,0.24714,-0.34007,0.62537,0.24714,-0.32628,0.57938,0.24714,-0.3155,0.52364,0.24714,-0.26821,0.50518,0.24714,-0.22095,0.49186,0.24714,-0.18989,0.44873,0.24714,-0.14992,0.41436,0.24714,-0.09594,0.42427,0.24714,-0.0451,0.44618,0.24714,-0.0,0.42903,0.24714,0.04779,0.42097,0.24714,0.09332,0.43641,0.24714,0.1358,0.45714,0.24714,0.17403,0.48379,0.24714,0.21754,0.49767,0.24714,0.26386,0.51107,0.24714,0.30617,0.53385,0.24714,0.32315,0.58216,0.24714,0.36461,0.60781,0.24714,0.41894,0.63049,0.24714,0.41577,0.68637,0.24714,0.43967,0.72797,0.24714,0.44101,0.77632,0.24714,0.46889,0.82009,0.24714,0.45005,0.86861,0.24714,0.46047,0.87617,0.28286,0.43041,0.92179,0.28286,0.41068,0.9642,0.28286,0.42281,1.01471,0.28286,0.40558,1.05828,0.28286,0.35327,1.08186,0.28286,0.33692,1.12304,0.28286,0.31904,1.16587,0.28286,0.28491,1.19528,0.28286,0.24675,1.21868,0.28286,0.21097,1.24469,0.28286,0.18505,1.29533,0.28286,0.13645,1.29969,0.28286,0.09057,1.30589,0.28286,0.04521,1.30999,0.28286,0.0,1.31927,0.28286,-0.04541,1.31191,0.28286,-0.08953,1.30094,0.28286,-0.12746,1.27179,0.28286,-0.17436,1.27111,0.28286,-0.21971,1.25996,0.28286,-0.25931,1.23611,0.28286,-0.28307,1.19323,0.28286,-0.3094,1.15712,0.28286,-0.34847,1.1315,0.28286,-0.37518,1.09462,0.28286,-0.39486,1.05347,0.28286,-0.40199,1.00789,0.28286,-0.42113,0.96644,0.28286,-0.44446,0.92328,0.28286,-0.44197,0.87617,0.28286,-0.42253,0.83138,0.28286,-0.41088,0.78809,0.28286,-0.41186,0.74121,0.28286,-0.40615,0.6938,0.28286,-0.35879,0.66725,0.28286,-0.32497,0.63805,0.28286,-0.30787,0.5966,0.28286,-0.28512,0.55681,0.28286,-0.24696,0.53336,0.28286,-0.21166,0.50644,0.28286,-0.1802,0.46799,0.28286,-0.14329,0.43142,0.28286,-0.09528,0.42408,0.28286,-0.04451,0.44906,0.28286,-0.0,0.4459,0.28286,0.04675,0.42763,0.28286,0.09349,0.4326,0.28286,0.13089,0.46991,0.28286,0.17072,0.48946,0.28286,0.21558,0.4996,0.28286,0.24807,0.53183,0.28286,0.28867,0.55284,0.28286,0.30848,0.59604,0.28286,0.35157,0.61856,0.28286,0.37849,0.65578,0.28286,0.3939,0.6993,0.28286,0.42387,0.73727,0.28286,0.44162,0.7815,0.28286,0.43884,0.82965,0.28286,0.46047,0.87617,0.28286,0.42536,0.88454,0.31857,0.41648,0.92979,0.31857,0.40416,0.97334,0.31857,0.39163,1.01607,0.31857,0.38561,1.06199,0.31857,0.34348,1.08952,0.31857,0.32514,1.12871,0.31857,0.31836,1.18083,0.31857,0.27497,1.20019,0.31857,0.2344,1.218,0.31857,0.19218,1.22858,0.31857,0.163,1.26294,0.31857,0.12908,1.29516,0.31857,0.08991,1.32176,0.31857,0.04409,1.31814,0.31857,0.0,1.32783,0.31857,-0.04405,1.31777,0.31857,-0.08794,1.31215,0.31857,-0.12954,1.29662,0.31857,-0.16532,1.26833,0.31857,-0.2153,1.26999,0.31857,-0.24205,1.22889,0.31857,-0.27216,1.19697,0.31857,-0.30625,1.16955,0.31857,-0.33964,1.1396,0.31857,-0.37002,1.10535,0.31857,-0.37854,1.05874,0.31857,-0.40269,1.01978,0.31857,-0.40432,0.97337,0.31857,-0.41957,0.93012,0.31857,-0.42526,0.88454,0.31857,-0.41121,0.83987,0.31857,-0.40906,0.79468,0.31857,-0.39467,0.752,0.31857,-0.38863,0.7057,0.31857,-0.3629,0.66799,0.31857,-0.32245,0.6424,0.31857,-0.31202,0.59416,0.31857,-0.28302,0.55966,0.31857,-0.24177,0.5406,0.31857,-0.19512,0.53524,0.31857,-0.171,0.48758,0.31857,-0.13166,0.46573,0.31857,-0.08883,0.45259,0.31857,-0.04213,0.47021,0.31857,-0.0,0.44887,0.31857,0.04582,0.434,0.31857,0.09012,0.44631,0.31857,0.13223,0.46393,0.31857,0.1629,0.50637,0.31857,0.21503,0.49959,0.31857,0.25472,0.52218,0.31857,0.2741,0.5699,0.31857,0.29162,0.61315,0.31857,0.32603,0.63972,0.31857,0.35261,0.67413,0.31857,0.36282,0.71758,0.31857,0.37658,0.75807,0.31857,0.4174,0.79284,0.31857,0.42928,0.83791,0.31857,0.42536,0.88454,0.31857,0.40395,0.89391,0.35143,0.41003,0.93951,0.35143,0.38573,0.98066,0.35143,0.37474,1.02274,0.35143,0.37907,1.07249,0.35143,0.34629,1.10545,0.35143,0.31054,1.13264,0.35143,0.30266,1.18225,0.35143,0.27362,1.21545,0.35143,0.2269,1.22436,0.35143,0.18444,1.23192,0.35143,0.1498,1.24991,0.35143,0.12232,1.29225,0.35143,0.08607,1.32235,0.35143,0.04215,1.31821,0.35143,0.0,1.30239,0.35143,-0.04198,1.31655,0.35143,-0.08341,1.3091,0.35143,-0.12669,1.30649,0.35143,-0.16307,1.28145,0.35143,-0.20197,1.26405,0.35143,-0.23319,1.23351,0.35143,-0.26165,1.20138,0.35143,-0.28465,1.16509,0.35143,-0.3133,1.13476,0.35143,-0.34988,1.10765,0.35143,-0.3538,1.06058,0.35143,-0.37389,1.02245,0.35143,-0.38623,0.98077,0.35143,-0.40259,0.93868,0.35143,-0.40584,0.89391,0.35143,-0.40698,0.84865,0.35143,-0.39653,0.80472,0.35143,-0.38449,0.76172,0.35143,-0.39061,0.70989,0.35143,-0.34734,0.68172,0.35143,-0.31277,0.65346,0.35143,-0.30432,0.60398,0.35143,-0.2727,0.57344,0.35143,-0.23601,0.55019,0.35143,-0.19004,0.54562,0.35143,-0.15409,0.5277,0.35143,-0.12324,0.49257,0.35143,-0.08358,0.47784,0.35143,-0.04114,0.47976,0.35143,-0.0,0.48325,0.35143,0.04372,0.45377,0.35143,0.08823,0.4547,0.35143,0.12401,0.49006,0.35143,0.16002,0.51361,0.35143,0.20345,0.52104,0.35143,0.24376,0.53891,0.35143,0.275,0.57074,0.35143,0.2793,0.62781,0.35143,0.3155,0.65136,0.35143,0.34737,0.6817,0.35143,0.35921,0.72468,0.35143,0.35291,0.77258,0.35143,0.37043,0.81059,0.35143,0.40758,0.84858,0.35143,0.40395,0.89391,0.35143,0.38056,0.90482,0.38,0.39059,0.9494,0.38,0.37637,0.9917,0.38,0.35689,1.03075,0.38,0.36138,1.07956,0.38,0.33913,1.11745,0.38,0.30832,1.14809,0.38,0.29224,1.19058,0.38,0.26907,1.22936,0.38,0.2279,1.24548,0.38,0.18073,1.24477,0.38,0.14478,1.25798,0.38,0.1124,1.2805,0.38,0.08012,1.31416,0.38,0.03961,1.31408,0.38,0.0,1.29551,0.38,-0.04038,1.32202,0.38,-0.08076,1.31742,0.38,-0.11929,1.30354,0.38,-0.1563,1.28607,0.38,-0.19997,1.28096,0.38,-0.22916,1.24735,0.38,-0.26142,1.22013,0.38,-0.28143,1.18002,0.38,-0.30067,1.14206,0.38,-0.34086,1.11854,0.38,-0.35166,1.07485,0.38,-0.34222,1.02558,0.38,-0.35124,0.9859,0.38,-0.37648,0.94779,0.38,-0.37904,0.90482,0.38,-0.39414,0.85983,0.38,-0.37581,0.81807,0.38,-0.3751,0.77246,0.38,-0.36581,0.72794,0.38,-0.34004,0.69162,0.38,-0.30717,0.66245,0.38,-0.28173,0.62933,0.38,-0.25846,0.59309,0.38,-0.22078,0.57481,0.38,-0.18174,0.56296,0.38,-0.14882,0.54182,0.38,-0.11453,0.522,0.38,-0.08211,0.48529,0.38,-0.03933,0.49842,0.38,-0.0,0.49669,0.38,0.03906,0.50127,0.38,0.08153,0.48827,0.38,0.11801,0.51039,0.38,0.15645,0.5232,0.38,0.18661,0.55381,0.38,0.22718,0.56525,0.38,0.25831,0.59327,0.38,0.28063,0.63041,0.38,0.29376,0.67304,0.38,0.32787,0.69925,0.38,0.3491,0.73602,0.38,0.34071,0.7846,0.38,0.36106,0.82147,0.38,0.37099,0.86247,0.38,0.38056,0.90482,0.38,0.36766,0.91684,0.40857,0.3546,0.95849,0.40857,0.34616,0.99907,0.40857,0.32985,1.03662,0.40857,0.34179,1.0869,0.40857,0.31892,1.12262,0.40857,0.29392,1.15549,0.40857,0.278,1.19658,0.40857,0.24961,1.22665,0.40857,0.21908,1.25382,0.40857,0.17408,1.25379,0.40857,0.13913,1.26607,0.40857,0.11068,1.29752,0.40857,0.07424,1.30718,0.40857,0.03638,1.30361,0.40857,0.0,1.29175,0.40857,-0.03691,1.30929,0.40857,-0.07594,1.31609,0.40857,-0.1138,1.30824,0.40857,-0.14284,1.27537,0.40857,-0.18514,1.27522,0.40857,-0.22464,1.26238,0.40857,-0.24907,1.22598,0.40857,-0.27731,1.19588,0.40857,-0.28795,1.15064,0.40857,-0.31635,1.12095,0.40857,-0.34903,1.0905,0.40857,-0.34226,1.04112,0.40857,-0.32928,0.99506,0.40857,-0.34065,0.95686,0.40857,-0.3512,0.91684,0.40857,-0.3582,0.87477,0.40857,-0.35205,0.83321,0.40857,-0.3425,0.79248,0.40857,-0.34319,0.74608,0.40857,-0.32533,0.70694,0.40857,-0.29751,0.67528,0.40857,-0.26631,0.64887,0.40857,-0.24065,0.61815,0.40857,-0.2151,0.58598,0.40857,-0.18129,0.56593,0.40857,-0.14647,0.54918,0.40857,-0.11051,0.53673,0.40857,-0.07623,0.51607,0.40857,-0.03684,0.5251,0.40857,-0.0,0.52727,0.40857,0.0358,0.53619,0.40857,0.07375,0.5291,0.40857,0.11026,0.53761,0.40857,0.14452,0.55409,0.40857,0.17569,0.57676,0.40857,0.21559,0.58523,0.40857,0.24394,0.61408,0.40857,0.27841,0.6367,0.40857,0.29282,0.67909,0.40857,0.31076,0.71634,0.40857,0.33132,0.75199,0.40857,0.34359,0.79208,0.40857,0.34675,0.83447,0.40857,0.35358,0.87531,0.40857,0.36766,0.91684,0.40857,0.35206,0.92931,0.43714,0.34691,0.97128,0.43714,0.31335,1.00598,0.43714,0.30564,1.04363,0.43714,0.31975,1.09319,0.43714,0.3067,1.13316,0.43714,0.28436,1.16714,0.43714,0.25132,1.18981,0.43714,0.23647,1.23164,0.43714,0.2054,1.25477,0.43714,0.17322,1.27469,0.43714,0.13796,1.28601,0.43714,0.10751,1.31023,0.43714,0.07344,1.32707,0.43714,0.0358,1.32137,0.43714,0.0,1.30773,0.43714,-0.03325,1.29352,0.43714,-0.06951,1.30577,0.43714,-0.10624,1.30573,0.43714,-0.13778,1.28555,0.43714,-0.17037,1.26901,0.43714,-0.21152,1.26446,0.43714,-0.2328,1.22695,0.43714,-0.26447,1.20344,0.43714,-0.28618,1.16866,0.43714,-0.29733,1.12693,0.43714,-0.32598,1.09639,0.43714,-0.33099,1.05311,0.43714,-0.31829,1.00719,0.43714,-0.32412,0.96852,0.43714,-0.34391,0.92931,0.43714,-0.33085,0.88927,0.43714,-0.3344,0.84748,0.43714,-0.31206,0.81258,0.43714,-0.31802,0.7663,0.43714,-0.31264,0.72151,0.43714,-0.28694,0.68931,0.43714,-0.26099,0.65878,0.43714,-0.23707,0.6262,0.43714,-0.20693,0.60143,0.43714,-0.18144,0.56752,0.43714,-0.13763,0.57344,0.43714,-0.10542,0.55582,0.43714,-0.07206,0.53902,0.43714,-0.03462,0.55011,0.43714,-0.0,0.54282,0.43714,0.0343,0.5536,0.43714,0.07033,0.54838,0.43714,0.10813,0.54619,0.43714,0.13721,0.57452,0.43714,0.16965,0.59103,0.43714,0.20131,0.61034,0.43714,0.23876,0.62404,0.43714,0.26001,0.6598,0.43714,0.27954,0.6955,0.43714,0.30268,0.72813,0.43714,0.32228,0.76412,0.43714,0.34082,0.80182,0.43714,0.32284,0.85031,0.43714,0.33696,0.88854,0.43714,0.35206,0.92931,0.43714,0.32362,0.94155,0.46571,0.32537,0.98206,0.46571,0.30586,1.01857,0.46571,0.28629,1.05175,0.46571,0.30217,1.10093,0.46571,0.29002,1.13992,0.46571,0.27161,1.17534,0.46571,0.23594,1.19324,0.46571,0.2252,1.23786,0.46571,0.19529,1.26,0.46571,0.17016,1.29071,0.46571,0.13616,1.30387,0.46571,0.10125,1.31074,0.46571,0.07102,1.3374,0.46571,0.03451,1.33059,0.46571,0.0,1.32075,0.46571,-0.0313,1.29433,0.46571,-0.06693,1.31462,0.46571,-0.1029,1.31673,0.46571,-0.13117,1.29057,0.46571,-0.16201,1.274,0.46571,-0.19068,1.25248,0.46571,-0.22796,1.2415,0.46571,-0.24446,1.20232,0.46571,-0.26741,1.17172,0.46571,-0.27964,1.13282,0.46571,-0.30081,1.10022,0.46571,-0.31375,1.06232,0.46571,-0.32226,1.0227,0.46571,-0.31215,0.98042,0.46571,-0.33878,0.94155,0.46571,-0.32137,0.90153,0.46571,-0.30573,0.86456,0.46571,-0.29403,0.82836,0.46571,-0.30154,0.78249,0.46571,-0.28358,0.74758,0.46571,-0.26869,0.71027,0.46571,-0.24325,0.68206,0.46571,-0.22428,0.64644,0.46571,-0.19248,0.62768,0.46571,-0.17122,0.5902,0.46571,-0.13106,0.59279,0.46571,-0.09737,0.5865,0.46571,-0.0707,0.54747,0.46571,-0.0344,0.55382,0.46571,-0.0,0.56836,0.46571,0.03222,0.57838,0.46571,0.06604,0.57348,0.46571,0.10398,0.56241,0.46571,0.13047,0.59436,0.46571,0.1631,0.60685,0.46571,0.18429,0.64103,0.46571,0.22543,0.64492,0.46571,0.24528,0.67989,0.46571,0.26356,0.71468,0.46571,0.2872,0.7451,0.46571,0.31275,0.77658,0.46571,0.31919,0.81868,0.46571,0.31062,0.86332,0.46571,0.32527,0.90104,0.46571,0.32362,0.94155,0.46571,0.31612,0.9529,0.49429,0.31146,0.99267,0.49429,0.29512,1.02911,0.49429,0.2753,1.06158,0.49429,0.28507,1.10711,0.49429,0.27081,1.14287,0.49429,0.25654,1.17936,0.49429,0.22312,1.19699,0.49429,0.20336,1.22731,0.49429,0.17991,1.25376,0.49429,0.15855,1.28656,0.49429,0.12755,1.30097,0.49429,0.09537,1.30953,0.49429,0.06798,1.34147,0.49429,0.03299,1.3343,0.49429,0.0,1.32776,0.49429,-0.03011,1.30096,0.49429,-0.06326,1.31452,0.49429,-0.09815,1.31993,0.49429,-0.12327,1.28931,0.49429,-0.14885,1.26614,0.49429,-0.1777,1.25006,0.49429,-0.21533,1.24346,0.49429,-0.22827,1.20263,0.49429,-0.25307,1.1763,0.49429,-0.26009,1.13534,0.49429,-0.28747,1.10841,0.49429,-0.2998,1.07125,0.49429,-0.31615,1.03455,0.49429,-0.2996,0.99116,0.49429,-0.31751,0.9529,0.49429,-0.31081,0.9132,0.49429,-0.29693,0.87621,0.49429,-0.27873,0.84286,0.49429,-0.28441,0.79904,0.49429,-0.2719,0.76216,0.49429,-0.24744,0.73446,0.49429,-0.21892,0.71339,0.49429,-0.20212,0.68016,0.49429,-0.18342,0.64616,0.49429,-0.16472,0.60624,0.49429,-0.12694,0.60648,0.49429,-0.09331,0.60397,0.49429,-0.06602,0.5755,0.49429,-0.03419,0.55769,0.49429,-0.0,0.57351,0.49429,0.03017,0.60412,0.49429,0.06215,0.59763,0.49429,0.09589,0.59431,0.49429,0.12245,0.61873,0.49429,0.14964,0.63798,0.49429,0.17096,0.66699,0.49429,0.20734,0.67311,0.49429,0.23075,0.70045,0.49429,0.24607,0.73567,0.49429,0.26367,0.76793,0.49429,0.28729,0.79748,0.49429,0.30181,0.83374,0.49429,0.29413,0.87693,0.49429,0.301,0.91446,0.49429,0.31612,0.9529,0.49429,0.30665,0.96299,0.51286,0.30249,1.00239,0.51286,0.29215,1.03995,0.51286,0.26386,1.06924,0.51286,0.27009,1.11202,0.51286,0.25395,1.14469,0.51286,0.24031,1.17937,0.51286,0.21258,1.2002,0.51286,0.19161,1.22672,0.51286,0.1681,1.24972,0.51286,0.15045,1.28595,0.51286,0.12043,1.29821,0.51286,0.08847,1.30045,0.51286,0.06295,1.33001,0.51286,0.03157,1.33522,0.51286,0.0,1.3278,0.51286,-0.02944,1.31013,0.51286,-0.0594,1.30932,0.51286,-0.09156,1.31224,0.51286,-0.11898,1.29419,0.51286,-0.14548,1.27526,0.51286,-0.16497,1.2444,0.51286,-0.19837,1.23603,0.51286,-0.2167,1.2048,0.51286,-0.24104,1.18002,0.51286,-0.24549,1.13864,0.51286,-0.27851,1.11666,0.51286,-0.28882,1.07929,0.51286,-0.29729,1.0413,0.51286,-0.28397,0.99997,0.51286,-0.29398,0.96299,0.51286,-0.29815,0.92415,0.51286,-0.29436,0.88544,0.51286,-0.26375,0.85678,0.51286,-0.26336,0.81766,0.51286,-0.26234,0.77527,0.51286,-0.23814,0.74855,0.51286,-0.20413,0.7352,0.51286,-0.18806,0.70414,0.51286,-0.17425,0.66575,0.51286,-0.15307,0.63441,0.51286,-0.11911,0.63144,0.51286,-0.08965,0.62102,0.51286,-0.0624,0.59913,0.51286,-0.03264,0.57812,0.51286,-0.0,0.59106,0.51286,0.02941,0.61624,0.51286,0.06134,0.60533,0.51286,0.09244,0.61038,0.51286,0.12042,0.62779,0.51286,0.14448,0.65284,0.51286,0.16414,0.68299,0.51286,0.19311,0.69718,0.51286,0.21596,0.722,0.51286,0.23332,0.7529,0.51286,0.24607,0.78691,0.51286,0.26558,0.81644,0.51286,0.29274,0.8451,0.51286,0.28461,0.88801,0.51286,0.28285,0.92614,0.51286,0.30665,0.96299,0.51286,0.2918,0.97229,0.52893,0.28859,1.01046,0.52893,0.28821,1.04939,0.52893,0.25635,1.07712,0.52893,0.25316,1.11415,0.52893,0.23966,1.14643,0.52893,0.22408,1.17718,0.52893,0.20128,1.20038,0.52893,0.17942,1.22307,0.52893,0.16205,1.25301,0.52893,0.14505,1.28848,0.52893,0.11618,1.30069,0.52893,0.08319,1.29454,0.52893,0.0587,1.31987,0.52893,0.03049,1.33743,0.52893,0.0,1.3323,0.52893,-0.02868,1.31568,0.52893,-0.05748,1.31263,0.52893,-0.08899,1.31701,0.52893,-0.11541,1.29852,0.52893,-0.14023,1.27797,0.52893,-0.15638,1.24319,0.52893,-0.18291,1.22796,0.52893,-0.20492,1.20451,0.52893,-0.22787,1.18065,0.52893,-0.23464,1.14279,0.52893,-0.26678,1.12178,0.52893,-0.27652,1.08537,0.52893,-0.2772,1.04645,0.52893,-0.26797,1.00774,0.52893,-0.27804,0.97229,0.52893,-0.28527,0.93455,0.52893,-0.28719,0.89546,0.52893,-0.25384,0.86849,0.52893,-0.24497,0.83502,0.52893,-0.24963,0.7909,0.52893,-0.22646,0.76521,0.52893,-0.1946,0.75177,0.52893,-0.17524,0.72734,0.52893,-0.16397,0.68825,0.52893,-0.14149,0.66385,0.52893,-0.1112,0.65795,0.52893,-0.08635,0.6378,0.52893,-0.06,0.61702,0.52893,-0.03067,0.60498,0.52893,-0.0,0.60418,0.52893,0.02869,0.62875,0.52893,0.06008,0.61654,0.52893,0.08978,0.62452,0.52893,0.11691,0.64181,0.52893,0.14128,0.66431,0.52893,0.15804,0.69852,0.52893,0.18027,0.72032,0.52893,0.20202,0.74336,0.52893,0.22744,0.76432,0.52893,0.23626,0.80061,0.52893,0.25402,0.82995,0.52893,0.27953,0.85798,0.52893,0.27249,0.89939,0.52893,0.27162,0.93636,0.52893,0.2918,0.97229,0.52893,0.27322,0.98113,0.545,0.2741,1.0178,0.545,0.27942,1.05674,0.545,0.24727,1.08342,0.545,0.24098,1.11772,0.545,0.23046,1.15053,0.545,0.21017,1.17554,0.545,0.18993,1.19885,0.545,0.17377,1.22684,0.545,0.15766,1.25741,0.545,0.13827,1.28604,0.545,0.11034,1.29665,0.545,0.08001,1.29463,0.545,0.05714,1.3234,0.545,0.02908,1.33343,0.545,0.0,1.34028,0.545,-0.02767,1.31633,0.545,-0.0556,1.31417,0.545,-0.08578,1.31724,0.545,-0.11085,1.29813,0.545,-0.13319,1.27485,0.545,-0.1498,1.24363,0.545,-0.17,1.2215,0.545,-0.19498,1.20465,0.545,-0.22132,1.18585,0.545,-0.2236,1.14548,0.545,-0.25133,1.1236,0.545,-0.26628,1.09128,0.545,-0.25909,1.05124,0.545,-0.25832,1.01569,0.545,-0.26309,0.98113,0.545,-0.27362,0.94451,0.545,-0.27505,0.90669,0.545,-0.24717,0.87887,0.545,-0.2384,0.84599,0.545,-0.23469,0.80861,0.545,-0.21363,0.78351,0.545,-0.18559,0.76837,0.545,-0.1657,0.74683,0.545,-0.15298,0.71305,0.545,-0.13275,0.68837,0.545,-0.10591,0.67827,0.545,-0.08232,0.65857,0.545,-0.05673,0.64135,0.545,-0.02906,0.62905,0.545,-0.0,0.61985,0.545,0.02796,0.64237,0.545,0.05788,0.63443,0.545,0.08604,0.64397,0.545,0.11175,0.66155,0.545,0.13618,0.68081,0.545,0.1538,0.7116,0.545,0.16962,0.74128,0.545,0.19538,0.75714,0.545,0.22022,0.77742,0.545,0.2249,0.81581,0.545,0.24586,0.84175,0.545,0.26432,0.87178,0.545,0.25986,0.9108,0.545,0.26151,0.94613,0.545,0.27322,0.98113,0.545,0.25654,0.9898,0.56107,0.2611,1.02504,0.56107,0.26474,1.06206,0.56107,0.23608,1.08829,0.56107,0.23647,1.12499,0.56107,0.22283,1.15499,0.56107,0.20465,1.18072,0.56107,0.18329,1.20171,0.56107,0.16733,1.22842,0.56107,0.15272,1.25971,0.56107,0.12981,1.27849,0.56107,0.10314,1.28726,0.56107,0.07766,1.2967,0.56107,0.05503,1.32223,0.56107,0.02776,1.32898,0.56107,0.0,1.34098,0.56107,-0.02633,1.31151,0.56107,-0.05307,1.31039,0.56107,-0.08118,1.31059,0.56107,-0.10532,1.29355,0.56107,-0.12663,1.27142,0.56107,-0.14231,1.2413,0.56107,-0.16139,1.21995,0.56107,-0.18728,1.20633,0.56107,-0.21125,1.18687,0.56107,-0.21477,1.14902,0.56107,-0.23274,1.12285,0.56107,-0.25565,1.09646,0.56107,-0.24724,1.05728,0.56107,-0.25109,1.02369,0.56107,-0.25357,0.9898,0.56107,-0.25899,0.95485,0.56107,-0.25886,0.91915,0.56107,-0.244,0.888,0.56107,-0.23358,0.85627,0.56107,-0.21923,0.82728,0.56107,-0.20348,0.79998,0.56107,-0.17817,0.78381,0.56107,-0.1568,0.7662,0.56107,-0.14228,0.73834,0.56107,-0.12763,0.70596,0.56107,-0.10122,0.69788,0.56107,-0.07737,0.68407,0.56107,-0.0527,0.67144,0.56107,-0.02763,0.65229,0.56107,-0.0,0.64435,0.56107,0.02739,0.65517,0.56107,0.05466,0.6596,0.56107,0.08229,0.66461,0.56107,0.10543,0.68574,0.56107,0.12897,0.70298,0.56107,0.14784,0.72852,0.56107,0.16353,0.75661,0.56107,0.18938,0.77085,0.56107,0.20974,0.79414,0.56107,0.2113,0.83316,0.56107,0.23666,0.85451,0.56107,0.25248,0.88447,0.56107,0.24804,0.92211,0.56107,0.24974,0.9561,0.56107,0.25654,0.9898,0.56107,0.24245,0.99863,0.57714,0.24795,1.0323,0.57714,0.24623,1.06626,0.57714,0.22738,1.09409,0.57714,0.22764,1.12959,0.57714,0.21158,1.15648,0.57714,0.19755,1.18409,0.57714,0.17599,1.20339,0.57714,0.15865,1.22631,0.57714,0.14527,1.25699,0.57714,0.12035,1.26798,0.57714,0.09931,1.28686,0.57714,0.07458,1.29522,0.57714,0.05181,1.31361,0.57714,0.02629,1.32186,0.57714,0.0,1.33206,0.57714,-0.02483,1.30384,0.57714,-0.04986,1.30176,0.57714,-0.07613,1.30137,0.57714,-0.09924,1.28664,0.57714,-0.12,1.2672,0.57714,-0.13845,1.24487,0.57714,-0.15535,1.22158,0.57714,-0.17823,1.206,0.57714,-0.20119,1.1875,0.57714,-0.20421,1.15098,0.57714,-0.21787,1.12397,0.57714,-0.23976,1.09929,0.57714,-0.2382,1.06405,0.57714,-0.24161,1.03144,0.57714,-0.24107,0.99863,0.57714,-0.2454,0.9653,0.57714,-0.2434,0.93177,0.57714,-0.23796,0.89872,0.57714,-0.22464,0.86939,0.57714,-0.21394,0.83902,0.57714,-0.19501,0.81555,0.57714,-0.17318,0.79714,0.57714,-0.15271,0.77947,0.57714,-0.13394,0.7604,0.57714,-0.12132,0.72709,0.57714,-0.09564,0.72105,0.57714,-0.07184,0.71291,0.57714,-0.04941,0.69823,0.57714,-0.02579,0.6815,0.57714,-0.0,0.6758,0.57714,0.02632,0.675,0.57714,0.05171,0.68427,0.57714,0.07799,0.68847,0.57714,0.0993,0.71044,0.57714,0.12173,0.72617,0.57714,0.13964,0.75027,0.57714,0.15784,0.77211,0.57714,0.18219,0.78665,0.57714,0.1962,0.81443,0.57714,0.19855,0.8505,0.57714,0.22394,0.86979,0.57714,0.23589,0.89959,0.57714,0.23603,0.9338,0.57714,0.23736,0.96639,0.57714,0.24245,0.99863,0.57714,0.22488,1.00794,0.59214,0.23859,1.04051,0.59214,0.22851,1.07103,0.59214,0.21869,1.10024,0.59214,0.21604,1.13288,0.59214,0.19823,1.1566,0.59214,0.18755,1.18493,0.59214,0.16657,1.20275,0.59214,0.14951,1.22361,0.59214,0.13505,1.24939,0.59214,0.11174,1.25934,0.59214,0.09501,1.28512,0.59214,0.07012,1.28824,0.59214,0.04764,1.29908,0.59214,0.02442,1.30976,0.59214,0.0,1.31662,0.59214,-0.02353,1.29877,0.59214,-0.04786,1.30039,0.59214,-0.07321,1.30063,0.59214,-0.09492,1.28485,0.59214,-0.11402,1.26445,0.59214,-0.13467,1.2487,0.59214,-0.15013,1.22451,0.59214,-0.17221,1.20934,0.59214,-0.19113,1.18831,0.59214,-0.19074,1.15098,0.59214,-0.20497,1.12648,0.59214,-0.22016,1.10086,0.59214,-0.22841,1.071,0.59214,-0.2289,1.03919,0.59214,-0.22491,1.00794,0.59214,-0.23184,0.97628,0.59214,-0.23215,0.94384,0.59214,-0.22653,0.91233,0.59214,-0.21077,0.88604,0.59214,-0.20714,0.85259,0.59214,-0.18552,0.83285,0.59214,-0.16902,0.81025,0.59214,-0.14923,0.79265,0.59214,-0.12773,0.77957,0.59214,-0.11354,0.75249,0.59214,-0.0909,0.74274,0.59214,-0.0685,0.73409,0.59214,-0.04679,0.72198,0.59214,-0.02405,0.71066,0.59214,-0.0,0.70561,0.59214,0.02466,0.70322,0.59214,0.04779,0.7159,0.59214,0.07231,0.71884,0.59214,0.09539,0.72964,0.59214,0.1152,0.74875,0.59214,0.13385,0.76863,0.59214,0.1515,0.78938,0.59214,0.17722,0.80067,0.59214,0.18554,0.83283,0.59214,0.19312,0.86311,0.59214,0.20749,0.88794,0.59214,0.21661,0.91652,0.59214,0.22578,0.9456,0.59214,0.22241,0.97757,0.59214,0.22488,1.00794,0.59214,0.21091,1.01862,0.60286,0.22631,1.04951,0.60286,0.21638,1.07836,0.60286,0.20767,1.10626,0.60286,0.20329,1.13618,0.60286,0.18906,1.16039,0.60286,0.17647,1.18514,0.60286,0.1575,1.20281,0.60286,0.14001,1.22058,0.60286,0.12509,1.24223,0.60286,0.10682,1.25891,0.60286,0.08968,1.28022,0.60286,0.06533,1.27977,0.60286,0.04379,1.28618,0.60286,0.02259,1.29779,0.60286,0.0,1.30297,0.60286,-0.02229,1.29403,0.60286,-0.04579,1.29841,0.60286,-0.06935,1.29583,0.60286,-0.08969,1.28027,0.60286,-0.10946,1.26485,0.60286,-0.12873,1.24875,0.60286,-0.14453,1.2271,0.60286,-0.16453,1.21103,0.60286,-0.17916,1.18768,0.60286,-0.17888,1.15275,0.60286,-0.19423,1.13093,0.60286,-0.20267,1.10415,0.60286,-0.21727,1.0786,0.60286,-0.21542,1.04803,0.60286,-0.21076,1.01862,0.60286,-0.21679,0.98903,0.60286,-0.21846,0.95831,0.60286,-0.21244,0.92897,0.60286,-0.19908,0.9035,0.60286,-0.19675,0.87109,0.60286,-0.17698,0.85162,0.60286,-0.16293,0.82809,0.60286,-0.14418,0.81065,0.60286,-0.12104,0.80225,0.60286,-0.10593,0.78033,0.60286,-0.08687,0.76521,0.60286,-0.06516,0.75815,0.60286,-0.0439,0.75038,0.60286,-0.02293,0.73524,0.60286,-0.0,0.73501,0.60286,0.02289,0.73573,0.60286,0.04418,0.74866,0.60286,0.06695,0.75101,0.60286,0.09099,0.7532,0.60286,0.10974,0.77175,0.60286,0.12863,0.78869,0.60286,0.14359,0.81151,0.60286,0.16939,0.82053,0.60286,0.17549,0.85302,0.60286,0.18585,0.87926,0.60286,0.1918,0.90771,0.60286,0.202,0.93338,0.60286,0.21651,0.95885,0.60286,0.21016,0.98993,0.60286,0.21091,1.01862,0.60286,0.19938,1.03018,0.61357,0.2121,1.05895,0.61357,0.20687,1.08694,0.61357,0.19748,1.113,0.61357,0.18908,1.13885,0.61357,0.18098,1.16505,0.61357,0.16516,1.18508,0.61357,0.14866,1.20296,0.61357,0.1307,1.21755,0.61357,0.11554,1.23546,0.61357,0.10232,1.25894,0.61357,0.08387,1.27335,0.61357,0.06146,1.27434,0.61357,0.04016,1.27404,0.61357,0.0208,1.28563,0.61357,0.0,1.29436,0.61357,-0.02097,1.28775,0.61357,-0.04345,1.29407,0.61357,-0.06493,1.28814,0.61357,-0.08534,1.27759,0.61357,-0.10436,1.2635,0.61357,-0.12169,1.24639,0.61357,-0.13849,1.22872,0.61357,-0.1558,1.21126,0.61357,-0.16668,1.1865,0.61357,-0.17268,1.15887,0.61357,-0.18251,1.13507,0.61357,-0.18653,1.10841,0.61357,-0.20489,1.08639,0.61357,-0.20073,1.05741,0.61357,-0.19723,1.03018,0.61357,-0.20134,1.00286,0.61357,-0.20364,0.9743,0.61357,-0.19739,0.94738,0.61357,-0.1907,0.92058,0.61357,-0.18442,0.89273,0.61357,-0.16932,0.87137,0.61357,-0.15588,0.84899,0.61357,-0.13827,0.83194,0.61357,-0.1141,0.82745,0.61357,-0.09857,0.80978,0.61357,-0.08267,0.79048,0.61357,-0.06159,0.7855,0.61357,-0.04085,0.78211,0.61357,-0.02177,0.76284,0.61357,-0.0,0.76719,0.61357,0.02112,0.77074,0.61357,0.04093,0.78162,0.61357,0.06195,0.78407,0.61357,0.08609,0.78059,0.61357,0.10356,0.79863,0.61357,0.12239,0.81272,0.61357,0.13492,0.83675,0.61357,0.16001,0.84419,0.61357,0.16464,0.87577,0.61357,0.17748,0.8979,0.61357,0.17682,0.92855,0.61357,0.18875,0.95101,0.61357,0.20654,0.9735,0.61357,0.19756,1.00337,0.61357,0.19938,1.03018,0.61357,0.18637,1.04149,0.62429,0.1953,1.06773,0.62429,0.19608,1.09478,0.62429,0.18558,1.11859,0.62429,0.17446,1.1408,0.62429,0.17102,1.16774,0.62429,0.15424,1.18477,0.62429,0.14119,1.20404,0.62429,0.12348,1.21683,0.62429,0.10953,1.23425,0.62429,0.09709,1.25652,0.62429,0.07871,1.26754,0.62429,0.05773,1.26865,0.62429,0.03717,1.26507,0.62429,0.01913,1.27416,0.62429,0.0,1.28769,0.62429,-0.01951,1.2788,0.62429,-0.04057,1.28555,0.62429,-0.05997,1.27749,0.62429,-0.08101,1.27413,0.62429,-0.09812,1.25879,0.62429,-0.11321,1.24072,0.62429,-0.13089,1.22736,0.62429,-0.14536,1.20884,0.62429,-0.15709,1.18742,0.62429,-0.16545,1.16363,0.62429,-0.16923,1.13782,0.62429,-0.17324,1.11346,0.62429,-0.19039,1.09323,0.62429,-0.18476,1.06632,0.62429,-0.1824,1.04149,0.62429,-0.1861,1.01648,0.62429,-0.1875,0.99053,0.62429,-0.18146,0.9661,0.62429,-0.18014,0.93894,0.62429,-0.16993,0.91605,0.62429,-0.16022,0.89265,0.62429,-0.14691,0.87235,0.62429,-0.13051,0.85616,0.62429,-0.10648,0.8541,0.62429,-0.09184,0.8381,0.62429,-0.07778,0.81811,0.62429,-0.05749,0.81527,0.62429,-0.03774,0.81447,0.62429,-0.02039,0.7934,0.62429,-0.0,0.79988,0.62429,0.01947,0.80458,0.62429,0.03763,0.81514,0.62429,0.05848,0.81137,0.62429,0.08029,0.81092,0.62429,0.09641,0.82797,0.62429,0.11454,0.8399,0.62429,0.12522,0.86367,0.62429,0.1486,0.87041,0.62429,0.15637,0.89622,0.62429,0.16685,0.91832,0.62429,0.16493,0.9476,0.62429,0.17697,0.96796,0.62429,0.19428,0.98868,0.62429,0.18348,1.01683,0.62429,0.18637,1.04149,0.62429,0.17093,1.05145,0.635,0.17594,1.07486,0.635,0.18237,1.10053,0.635,0.17071,1.12169,0.635,0.16322,1.14347,0.635,0.15801,1.16697,0.635,0.14425,1.18417,0.635,0.13219,1.20217,0.635,0.11638,1.21513,0.635,0.10354,1.23192,0.635,0.09036,1.24963,0.635,0.07358,1.26072,0.635,0.05318,1.25871,0.635,0.03488,1.25928,0.635,0.01769,1.26453,0.635,0.0,1.27686,0.635,-0.01806,1.26899,0.635,-0.03713,1.27268,0.635,-0.05476,1.26487,0.635,-0.07555,1.26634,0.635,-0.09035,1.24961,0.635,-0.10404,1.23279,0.635,-0.12126,1.22199,0.635,-0.13297,1.20307,0.635,-0.14679,1.1865,0.635,-0.15558,1.16519,0.635,-0.15431,1.13845,0.635,-0.1596,1.11711,0.635,-0.17345,1.09813,0.635,-0.1676,1.07375,0.635,-0.16765,1.05145,0.635,-0.16906,1.02894,0.635,-0.16999,1.00569,0.635,-0.16556,0.98332,0.635,-0.1662,0.95774,0.635,-0.15373,0.93905,0.635,-0.14858,0.91474,0.635,-0.13686,0.8954,0.635,-0.12033,0.8822,0.635,-0.09788,0.88084,0.635,-0.08587,0.8631,0.635,-0.07182,0.84717,0.635,-0.05271,0.846,0.635,-0.03509,0.8424,0.635,-0.01869,0.82623,0.635,-0.0,0.83324,0.635,0.0182,0.83222,0.635,0.03447,0.84606,0.635,0.05458,0.83873,0.635,0.0736,0.84211,0.635,0.08873,0.85683,0.635,0.10484,0.8687,0.635,0.11551,0.88899,0.635,0.13514,0.89735,0.635,0.1459,0.91721,0.635,0.15341,0.93928,0.635,0.15446,0.96436,0.635,0.16431,0.98384,0.635,0.17867,1.00335,0.635,0.17048,1.02875,0.635,0.17093,1.05145,0.635,0.15256,1.05894,0.64571,0.15447,1.07939,0.64571,0.16443,1.10297,0.64571,0.1525,1.12136,0.64571,0.14841,1.14217,0.64571,0.14133,1.16173,0.64571,0.13192,1.17967,0.64571,0.12051,1.19563,0.64571,0.10696,1.20858,0.64571,0.09541,1.22435,0.64571,0.08158,1.23694,0.64571,0.06677,1.24785,0.64571,0.04772,1.24393,0.64571,0.03211,1.24924,0.64571,0.01603,1.25107,0.64571,0.0,1.26144,0.64571,-0.01635,1.25492,0.64571,-0.0334,1.25688,0.64571,-0.04889,1.24848,0.64571,-0.06839,1.25243,0.64571,-0.08087,1.23538,0.64571,-0.09547,1.22446,0.64571,-0.10974,1.21247,0.64571,-0.12051,1.19562,0.64571,-0.1334,1.18103,0.64571,-0.14182,1.16208,0.64571,-0.13862,1.13669,0.64571,-0.14368,1.11775,0.64571,-0.15413,1.10021,0.64571,-0.14918,1.07869,0.64571,-0.15312,1.05894,0.64571,-0.15192,1.03883,0.64571,-0.15091,1.01853,0.64571,-0.14953,0.99774,0.64571,-0.14843,0.97569,0.64571,-0.14058,0.9567,0.64571,-0.13413,0.93618,0.64571,-0.12507,0.91709,0.64571,-0.10768,0.90829,0.64571,-0.08878,0.90501,0.64571,-0.07878,0.88706,0.64571,-0.06507,0.87483,0.64571,-0.0472,0.87594,0.64571,-0.0318,0.87046,0.64571,-0.01662,0.85971,0.64571,-0.0,0.86077,0.64571,0.01662,0.85977,0.64571,0.03119,0.87408,0.64571,0.04977,0.86598,0.64571,0.06713,0.86902,0.64571,0.07988,0.88465,0.64571,0.09334,0.89711,0.64571,0.10377,0.91376,0.64571,0.11985,0.92301,0.64571,0.13224,0.93791,0.64571,0.13716,0.95919,0.64571,0.14218,0.9792,0.64571,0.1487,0.99808,0.64571,0.15939,1.01626,0.64571,0.15561,1.03834,0.64571,0.15256,1.05894,0.64571,0.13089,1.06293,0.65418,0.13258,1.08057,0.65418,0.14148,1.10101,0.65418,0.13078,1.11673,0.65418,0.12867,1.13546,0.65418,0.12097,1.15136,0.65418,0.11535,1.16904,0.65418,0.10492,1.18254,0.65418,0.09369,1.19468,0.65418,0.08364,1.20869,0.65418,0.0704,1.21733,0.65418,0.05785,1.22744,0.65418,0.04141,1.22429,0.65418,0.02826,1.23124,0.65418,0.01393,1.23078,0.65418,0.0,1.24135,0.65418,-0.01418,1.23375,0.65418,-0.02871,1.23394,0.65418,-0.04255,1.22873,0.65418,-0.05905,1.23086,0.65418,-0.06957,1.21551,0.65418,-0.08347,1.20839,0.65418,-0.09471,1.19611,0.65418,-0.10493,1.18255,0.65418,-0.11624,1.16986,0.65418,-0.12311,1.15293,0.65418,-0.11966,1.13039,0.65418,-0.12436,1.11409,0.65418,-0.13215,1.0985,0.65418,-0.13064,1.08032,0.65418,-0.13391,1.06293,0.65418,-0.13108,1.04549,0.65418,-0.13057,1.02779,0.65418,-0.12944,1.00968,0.65418,-0.12695,0.99137,0.65418,-0.12319,0.97288,0.65418,-0.11739,0.95495,0.65418,-0.10879,0.9389,0.65418,-0.0925,0.93285,0.65418,-0.07816,0.92672,0.65418,-0.06916,0.91126,0.65418,-0.05685,0.90126,0.65418,-0.04111,0.90272,0.65418,-0.02759,0.89857,0.65418,-0.0142,0.89187,0.65418,-0.0,0.8881,0.65418,0.01451,0.88812,0.65418,0.02723,0.90073,0.65418,0.04338,0.8939,0.65418,0.0585,0.89658,0.65418,0.06921,0.91116,0.65418,0.07999,0.92354,0.65418,0.09089,0.93512,0.65418,0.10397,0.9444,0.65418,0.11456,0.95755,0.65418,0.11854,0.97628,0.65418,0.12492,0.99251,0.65418,0.12885,1.00992,0.65418,0.13651,1.02619,0.65418,0.13578,1.04486,0.65418,0.13089,1.06293,0.65418,0.10446,1.06356,0.66114,0.10617,1.07797,0.66114,0.11268,1.09449,0.66114,0.10425,1.1073,0.66114,0.10311,1.12285,0.66114,0.09608,1.1352,0.66114,0.09324,1.15105,0.66114,0.08448,1.1618,0.66114,0.07577,1.17224,0.66114,0.06761,1.18374,0.66114,0.0563,1.1895,0.66114,0.0464,1.19814,0.66114,0.0337,1.19751,0.66114,0.02296,1.20308,0.66114,0.01122,1.20143,0.66114,0.0,1.21102,0.66114,-0.01139,1.20354,0.66114,-0.02287,1.20251,0.66114,-0.03426,1.19975,0.66114,-0.04716,1.20035,0.66114,-0.05637,1.18965,0.66114,-0.06736,1.18329,0.66114,-0.07563,1.17204,0.66114,-0.08448,1.1618,0.66114,-0.09359,1.15138,0.66114,-0.09881,1.13724,0.66114,-0.09601,1.11876,0.66114,-0.10033,1.10566,0.66114,-0.1056,1.09255,0.66114,-0.10619,1.07797,0.66114,-0.10834,1.06356,0.66114,-0.10496,1.04931,0.66114,-0.10543,1.03461,0.66114,-0.10438,1.01975,0.66114,-0.10083,1.00558,0.66114,-0.09967,0.98924,0.66114,-0.09487,0.97454,0.66114,-0.0874,0.96192,0.66114,-0.0739,0.95756,0.66114,-0.06376,0.95021,0.66114,-0.05614,0.93797,0.66114,-0.04592,0.93035,0.66114,-0.03374,0.92944,0.66114,-0.02218,0.9288,0.66114,-0.01128,0.92491,0.66114,-0.0,0.9186,0.66114,0.01172,0.9196,0.66114,0.02205,0.92957,0.66114,0.03494,0.92469,0.66114,0.04711,0.92689,0.66114,0.05558,0.93923,0.66114,0.06461,0.94871,0.66114,0.0738,0.9577,0.66114,0.08423,0.96561,0.66114,0.09229,0.97696,0.66114,0.09661,0.99152,0.66114,0.10133,1.00529,0.66114,0.10347,1.02014,0.66114,0.10872,1.03371,0.66114,0.10959,1.04868,0.66114,0.10446,1.06356,0.66114,0.07598,1.06193,0.66811,0.07762,1.07293,0.66811,0.08149,1.08528,0.66811,0.0767,1.09552,0.66811,0.07498,1.10693,0.66811,0.06942,1.11596,0.66811,0.0684,1.12892,0.66811,0.0618,1.13693,0.66811,0.0556,1.14516,0.66811,0.04953,1.15382,0.66811,0.04094,1.15752,0.66811,0.03383,1.16434,0.66811,0.02493,1.16535,0.66811,0.01694,1.16934,0.66811,0.00821,1.16728,0.66811,0.0,1.17513,0.66811,-0.00832,1.16865,0.66811,-0.01656,1.16693,0.66811,-0.02505,1.16585,0.66811,-0.03418,1.16539,0.66811,-0.04152,1.15886,0.66811,-0.04929,1.15338,0.66811,-0.05486,1.14405,0.66811,-0.06176,1.13689,0.66811,-0.06842,1.12893,0.66811,-0.07203,1.11799,0.66811,-0.07026,1.1041,0.66811,-0.07408,1.09438,0.66811,-0.0777,1.08419,0.66811,-0.0786,1.07307,0.66811,-0.07962,1.06193,0.66811,-0.07679,1.05105,0.66811,-0.0776,1.0397,0.66811,-0.07667,1.02835,0.66811,-0.07289,1.01819,0.66811,-0.07311,1.00504,0.66811,-0.06952,0.99385,0.66811,-0.0637,0.98462,0.66811,-0.05416,0.98085,0.66811,-0.04736,0.97407,0.66811,-0.04139,0.96531,0.66811,-0.0337,0.95992,0.66811,-0.02524,0.95722,0.66811,-0.01621,0.95913,0.66811,-0.0082,0.95674,0.66811,-0.0,0.95012,0.66811,0.00859,0.9518,0.66811,0.01626,0.95885,0.66811,0.02552,0.95606,0.66811,0.03442,0.95771,0.66811,0.04087,0.96652,0.66811,0.048,0.97288,0.66811,0.05447,0.98039,0.66811,0.06196,0.98673,0.66811,0.06871,0.99464,0.66811,0.07152,1.00627,0.66811,0.07458,1.01717,0.66811,0.07557,1.02883,0.66811,0.08014,1.03897,0.66811,0.08036,1.05055,0.66811,0.07598,1.06193,0.66811,0.04867,1.0592,0.67507,0.04982,1.0669,0.67507,0.05172,1.07538,0.67507,0.04955,1.08289,0.67507,0.0478,1.09051,0.67507,0.0441,1.09666,0.67507,0.04395,1.10618,0.67507,0.0402,1.11246,0.67507,0.03575,1.11762,0.67507,0.03176,1.12351,0.67507,0.02617,1.12588,0.67507,0.02166,1.13079,0.67507,0.01625,1.13278,0.67507,0.01094,1.13494,0.67507,0.00528,1.1331,0.67507,0.0,1.13879,0.67507,-0.00541,1.1349,0.67507,-0.01053,1.13212,0.67507,-0.01605,1.13188,0.67507,-0.02172,1.13098,0.67507,-0.02682,1.12754,0.67507,-0.03159,1.12317,0.67507,-0.03493,1.11627,0.67507,-0.03959,1.11164,0.67507,-0.04387,1.10609,0.67507,-0.0461,1.09836,0.67507,-0.04528,1.08886,0.67507,-0.04806,1.08218,0.67507,-0.05024,1.07491,0.67507,-0.05109,1.0671,0.67507,-0.05141,1.0592,0.67507,-0.04954,1.05154,0.67507,-0.05023,1.04349,0.67507,-0.04942,1.03558,0.67507,-0.04687,1.0285,0.67507,-0.04692,1.01934,0.67507,-0.0446,1.01153,0.67507,-0.0407,1.00528,0.67507,-0.03547,1.00125,0.67507,-0.03088,0.99667,0.67507,-0.02674,0.99106,0.67507,-0.02169,0.98752,0.67507,-0.01659,0.98408,0.67507,-0.01058,0.98595,0.67507,-0.00533,0.98462,0.67507,-0.0,0.98011,0.67507,0.00552,0.98195,0.67507,0.01052,0.98638,0.67507,0.01632,0.98529,0.67507,0.02203,0.98641,0.67507,0.02661,0.9914,0.67507,0.03133,0.99575,0.67507,0.03525,1.00161,0.67507,0.03994,1.00629,0.67507,0.04489,1.01122,0.67507,0.0464,1.01979,0.67507,0.04809,1.0277,0.67507,0.0486,1.03597,0.67507,0.05195,1.04296,0.67507,0.05171,1.05121,0.67507,0.04867,1.0592,0.67507,0.02561,1.05651,0.68204,0.0261,1.06141,0.68204,0.02682,1.0667,0.68204,0.02611,1.07167,0.68204,0.02487,1.07629,0.68204,0.02291,1.08015,0.68204,0.02299,1.08635,0.68204,0.02138,1.09091,0.68204,0.01894,1.0941,0.68204,0.01658,1.09729,0.68204,0.01367,1.09882,0.68204,0.01134,1.10202,0.68204,0.00864,1.10403,0.68204,0.00576,1.10489,0.68204,0.00279,1.10389,0.68204,0.0,1.10721,0.68204,-0.00289,1.10559,0.68204,-0.00548,1.10258,0.68204,-0.00838,1.10259,0.68204,-0.0113,1.10185,0.68204,-0.01412,1.10019,0.68204,-0.01649,1.09707,0.68204,-0.01817,1.09256,0.68204,-0.0207,1.0898,0.68204,-0.02295,1.0863,0.68204,-0.02417,1.08144,0.68204,-0.02386,1.07549,0.68204,-0.02545,1.07129,0.68204,-0.02652,1.06658,0.68204,-0.0271,1.0616,0.68204,-0.02748,1.05651,0.68204,-0.02609,1.05161,0.68204,-0.02656,1.04642,0.68204,-0.02619,1.0413,0.68204,-0.02474,1.03682,0.68204,-0.02449,1.03124,0.68204,-0.02328,1.02629,0.68204,-0.02121,1.02238,0.68204,-0.01897,1.01886,0.68204,-0.01641,1.01615,0.68204,-0.01407,1.01296,0.68204,-0.01139,1.01078,0.68204,-0.00889,1.00762,0.68204,-0.00568,1.00878,0.68204,-0.00282,1.0085,0.68204,-0.0,1.00581,0.68204,0.00289,1.00736,0.68204,0.00555,1.00982,0.68204,0.0085,1.00975,0.68204,0.01148,1.01043,0.68204,0.01416,1.0127,0.68204,0.01668,1.01548,0.68204,0.01858,1.01965,0.68204,0.02097,1.02277,0.68204,0.02388,1.02551,0.68204,0.02451,1.03122,0.68204,0.02526,1.03641,0.68204,0.02579,1.04153,0.68204,0.02745,1.04608,0.68204,0.02715,1.05141,0.68204,0.02561,1.05651,0.68204,0.00966,1.055,0.689,0.00965,1.05794,0.689,0.00984,1.06106,0.689,0.0097,1.06414,0.689,0.00913,1.06679,0.689,0.0085,1.06924,0.689,0.00847,1.07284,0.689,0.00801,1.07592,0.689,0.00716,1.07805,0.689,0.0061,1.07936,0.689,0.00505,1.08036,0.689,0.0042,1.08233,0.689,0.00324,1.08388,0.689,0.00213,1.08409,0.689,0.00104,1.08371,0.689,0.0,1.08539,0.689,-0.00109,1.085,0.689,-0.00203,1.08263,0.689,-0.00309,1.08259,0.689,-0.00421,1.08239,0.689,-0.00523,1.08128,0.689,-0.00607,1.07922,0.689,-0.00668,1.07651,0.689,-0.00763,1.07493,0.689,-0.00862,1.07317,0.689,-0.0091,1.07024,0.689,-0.00892,1.06651,0.689,-0.00951,1.06396,0.689,-0.00988,1.06109,0.689,-0.01016,1.0581,0.689,-0.01035,1.055,0.689,-0.00969,1.05205,0.689,-0.00991,1.04889,0.689,-0.00979,1.04577,0.689,-0.0092,1.04312,0.689,-0.009,1.03994,0.689,-0.00855,1.03698,0.689,-0.0078,1.03463,0.689,-0.00716,1.03195,0.689,-0.00614,1.0305,0.689,-0.00521,1.02881,0.689,-0.00426,1.02724,0.689,-0.00335,1.02508,0.689,-0.00215,1.02568,0.689,-0.00105,1.0259,0.689,-0.0,1.02444,0.689,0.00107,1.02552,0.689,0.00207,1.0268,0.689,0.00312,1.02715,0.689,0.00422,1.02754,0.689,0.00531,1.02831,0.689,0.00625,1.03004,0.689,0.00689,1.03281,0.689,0.00786,1.03448,0.689,0.00894,1.03617,0.689,0.00912,1.03973,0.689,0.00935,1.04293,0.689,0.00968,1.04588,0.689,0.01021,1.0487,0.689,0.01007,1.05193,0.689,0.00966,1.055,0.689],"normal":[0.31283,-0.00135,-0.94981,0.97318,0.00745,0.22992,0.24168,0.00057,-0.97036,0.2411,0.00505,-0.97049,0.24102,0.02264,-0.97026,0.23504,0.03091,-0.97149,0.24545,0.03546,-0.96876,0.24588,0.09121,-0.965,0.19707,0.11745,-0.97333,0.23723,0.09601,-0.9667,0.26696,0.08313,-0.96012,0.29918,0.14102,-0.94372,-0.04153,0.33991,-0.93954,0.01821,0.13041,-0.99129,0.2172,0.20142,-0.95512,0.22731,0.20349,-0.95232,0.04194,0.36037,-0.93187,-0.30211,0.16735,-0.93847,-0.18059,0.16592,-0.96946,-0.10564,0.19492,-0.97511,-0.27332,0.16853,-0.94705,-0.27436,0.07046,-0.95904,-0.26431,0.07027,-0.96187,-0.27413,0.03764,-0.96096,-0.25202,0.03607,-0.96705,-0.24137,0.0482,-0.96923,-0.25243,0.02871,-0.96719,-0.22847,0.02498,-0.97323,-0.24488,0.02744,-0.96917,-0.23373,-0.00838,-0.97227,-0.22276,-0.00845,-0.97484,-0.24116,0.0158,-0.97036,-0.23835,0.00168,-0.97118,-0.23097,-0.03045,-0.97249,-0.20598,-0.0419,-0.97766,-0.24665,-0.02351,-0.96882,-0.24684,-0.0374,-0.96833,-0.23849,-0.05045,-0.96983,-0.22912,-0.06374,-0.97131,-0.21749,-0.07628,-0.97308,-0.24681,-0.09718,-0.96418,-0.19711,-0.11327,-0.97382,-0.16371,-0.19882,-0.96627,0.14031,-0.25017,-0.95798,-0.01909,-0.07794,-0.99678,-0.20597,-0.2678,-0.9412,0.15532,-0.16587,-0.97384,0.12751,-0.1651,-0.978,0.01712,-0.1315,-0.99117,0.18122,-0.22698,-0.95689,0.22776,-0.08594,-0.96992,0.24644,-0.07896,-0.96594,0.25136,-0.05959,-0.96606,0.26369,-0.04051,-0.96376,0.25262,-0.02715,-0.96718,0.22498,-0.0342,-0.97376,0.23268,-0.03334,-0.97198,0.24456,-0.01116,-0.96957,0.97174,-0.03462,0.23349,0.23922,-0.00821,-0.97093,0.31283,-0.00135,-0.94981,0.3899,0.00289,-0.92085,0.40487,0.03283,-0.91379,0.41375,0.00599,-0.91037,0.40133,0.00543,-0.91592,0.39574,0.06286,-0.91621,0.40357,0.07804,-0.91161,0.39796,0.101,-0.91182,0.30262,0.22649,-0.92581,0.30861,0.28439,-0.90768,0.36683,0.2192,-0.90409,0.38157,0.24131,-0.89228,0.38341,0.25405,-0.88795,0.03527,0.36013,-0.93223,-0.07406,0.45654,-0.88661,0.13026,0.39749,-0.90831,0.24307,0.42524,-0.87183,0.05942,0.37117,-0.92666,-0.32083,0.33031,-0.88767,-0.23121,0.38243,-0.89459,-0.03379,0.42691,-0.90366,-0.25482,0.2626,-0.93065,-0.40485,0.19725,-0.89285,-0.3325,0.20831,-0.91981,-0.41754,0.10022,-0.90312,-0.41941,0.09607,-0.9027,-0.38863,0.12508,-0.91286,-0.39599,0.06775,-0.91575,-0.40838,0.06779,-0.91029,-0.38416,0.07696,-0.92005,-0.38172,-0.03257,-0.92371,-0.40936,-0.02274,-0.91209,-0.4087,0.04188,-0.91171,-0.39557,0.0042,-0.91843,-0.34903,-0.09191,-0.93259,-0.36472,-0.12492,-0.9227,-0.39801,-0.07868,-0.914,-0.40087,-0.08147,-0.91251,-0.37816,-0.10101,-0.92021,-0.27935,-0.1807,-0.94303,-0.26957,-0.23013,-0.93508,-0.31869,-0.20746,-0.92488,-0.27964,-0.22742,-0.93278,-0.03075,-0.28562,-0.95785,0.14821,-0.35595,-0.92268,-0.24821,-0.33644,-0.9084,-0.14904,-0.27307,-0.95038,0.19428,-0.29809,-0.93456,0.16093,-0.30416,-0.93893,0.03336,-0.33874,-0.94029,0.13316,-0.2715,-0.95318,0.29624,-0.20398,-0.93308,0.32121,-0.17664,-0.93039,0.36872,-0.13835,-0.91919,0.36527,-0.13347,-0.92129,0.35229,-0.11022,-0.92938,0.37492,-0.07506,-0.92401,0.3761,-0.07037,-0.9239,0.39556,-0.02817,-0.91801,0.40338,-0.02065,-0.9148,0.38718,-0.03824,-0.92121,0.3899,0.00289,-0.92085,0.31063,0.01289,-0.95044,0.33139,0.05984,-0.9416,0.33336,-0.00655,-0.94278,0.31021,0.01086,-0.95061,0.3097,0.08651,-0.94689,0.32216,0.08035,-0.94327,0.32834,0.08284,-0.94092,0.2367,0.18295,-0.9542,0.20364,0.25332,-0.94571,0.24411,0.22156,-0.9441,0.23911,0.24588,-0.93935,0.29994,0.21453,-0.92952,0.04065,0.28403,-0.95795,-0.05255,0.35345,-0.93398,0.0575,0.31275,-0.94809,0.13046,0.33581,-0.93285,0.0134,0.30127,-0.95345,-0.27914,0.27057,-0.92134,-0.11856,0.33597,-0.93438,0.0307,0.36877,-0.92901,-0.19908,0.23152,-0.95224,-0.28767,0.19203,-0.93828,-0.24542,0.19735,-0.94912,-0.33002,0.10116,-0.93854,-0.3176,0.10422,-0.94248,-0.30424,0.11221,-0.94596,-0.32348,0.05572,-0.94459,-0.32,0.0808,-0.94397,-0.30331,0.08032,-0.9495,-0.30674,-0.0422,-0.95086,-0.32408,-0.02853,-0.9456,-0.33234,0.03669,-0.94244,-0.32625,0.00961,-0.94524,-0.27643,-0.09304,-0.95652,-0.27137,-0.12884,-0.95381,-0.31307,-0.06731,-0.94734,-0.3173,-0.05971,-0.94644,-0.28974,-0.08981,-0.95288,-0.16876,-0.17748,-0.96955,-0.1363,-0.22979,-0.96365,-0.24871,-0.17355,-0.9529,-0.22006,-0.17698,-0.9593,0.03308,-0.24614,-0.96867,0.10643,-0.27706,-0.95494,-0.17691,-0.24812,-0.95244,-0.09266,-0.2353,-0.9675,0.1347,-0.24185,-0.96092,0.11557,-0.24468,-0.96269,0.03969,-0.2575,-0.96546,0.05156,-0.24505,-0.96814,0.15961,-0.19171,-0.96839,0.26342,-0.14341,-0.95396,0.27682,-0.13305,-0.95167,0.23887,-0.15195,-0.95909,0.23203,-0.13157,-0.96377,0.28283,-0.06443,-0.957,0.30491,-0.04107,-0.95149,0.31634,-0.03161,-0.94812,0.30913,-0.03295,-0.95045,0.30138,-0.0373,-0.95277,0.31063,0.01289,-0.95044,0.29359,0.04647,-0.9548,0.30896,0.05659,-0.94939,0.29792,-0.0336,-0.954,0.27872,0.01857,-0.96019,0.27001,0.12099,-0.95523,0.29535,0.11535,-0.9484,0.31919,0.06087,-0.94573,0.22333,0.16917,-0.95995,0.16165,0.2604,-0.95187,0.19631,0.23691,-0.95149,0.23059,0.22077,-0.94767,0.27396,0.18175,-0.94441,0.00113,0.28869,-0.95742,-0.03429,0.32341,-0.94564,0.03533,0.29561,-0.95466,0.09101,0.31119,-0.94598,0.00154,0.28797,-0.95764,-0.26562,0.25378,-0.93008,-0.09945,0.31514,-0.94382,0.02741,0.35296,-0.93524,-0.19286,0.23534,-0.95258,-0.25091,0.1958,-0.948,-0.23414,0.19526,-0.95239,-0.29508,0.12388,-0.94741,-0.27195,0.12097,-0.95468,-0.28469,0.09253,-0.95414,-0.29431,0.06736,-0.95333,-0.27929,0.08654,-0.9563,-0.27748,0.06325,-0.95865,-0.2775,-0.02988,-0.96026,-0.28249,-0.04203,-0.95835,-0.30574,0.01045,-0.95206,-0.31042,0.01053,-0.95054,-0.26971,-0.08001,-0.95961,-0.24557,-0.10954,-0.96317,-0.27368,-0.07472,-0.95891,-0.29036,-0.06182,-0.95492,-0.26667,-0.08918,-0.95965,-0.13494,-0.19201,-0.97207,-0.09187,-0.23173,-0.96843,-0.22818,-0.16037,-0.96032,-0.20481,-0.16531,-0.96474,0.00128,-0.22314,-0.97479,0.08184,-0.2421,-0.96679,-0.09609,-0.23587,-0.96702,-0.06312,-0.2355,-0.96982,0.1019,-0.22945,-0.96797,0.05693,-0.22786,-0.97203,0.05115,-0.22175,-0.97376,0.04687,-0.23289,-0.97137,0.1226,-0.19043,-0.97401,0.26241,-0.12826,-0.95639,0.23584,-0.14663,-0.96067,0.18404,-0.17404,-0.96739,0.19018,-0.15188,-0.96993,0.24283,-0.074,-0.96724,0.28915,-0.01224,-0.95721,0.28727,-0.03078,-0.95736,0.25999,-0.05954,-0.96377,0.26697,-0.02625,-0.96335,0.29359,0.04647,-0.9548,0.30976,0.0922,-0.94633,0.30392,0.03853,-0.95192,0.29053,-0.05302,-0.9554,0.2857,0.04313,-0.95735,0.27016,0.17485,-0.9468,0.30373,0.14509,-0.94165,0.34005,0.04286,-0.93943,0.24051,0.19155,-0.95156,0.15924,0.28707,-0.94458,0.18625,0.27029,-0.94459,0.25686,0.21335,-0.94261,0.26749,0.18422,-0.94579,-0.03349,0.32473,-0.94521,-0.0177,0.32431,-0.94578,0.02992,0.31354,-0.9491,0.07929,0.31551,-0.9456,-0.04071,0.31058,-0.94968,-0.27419,0.27548,-0.92137,-0.10414,0.32951,-0.93839,-0.00322,0.37652,-0.9264,-0.21255,0.27269,-0.93833,-0.25152,0.21866,-0.94283,-0.26311,0.20777,-0.94213,-0.26464,0.1663,-0.9499,-0.25522,0.14318,-0.95622,-0.29589,0.08383,-0.95153,-0.27603,0.09503,-0.95644,-0.26698,0.09519,-0.95899,-0.27856,0.0565,-0.95876,-0.28278,-0.02132,-0.95895,-0.27586,-0.06791,-0.9588,-0.30952,-0.02702,-0.95051,-0.32661,0.00555,-0.94514,-0.28998,-0.04647,-0.95591,-0.2461,-0.09859,-0.96422,-0.26155,-0.10553,-0.9594,-0.30007,-0.0764,-0.95085,-0.28372,-0.10135,-0.95354,-0.15885,-0.21325,-0.964,-0.10322,-0.23744,-0.9659,-0.21842,-0.17651,-0.95976,-0.2307,-0.16687,-0.95861,-0.02121,-0.23123,-0.97267,0.11481,-0.26215,-0.95817,-0.04519,-0.25583,-0.96567,-0.07138,-0.264,-0.96188,0.03939,-0.2438,-0.96903,0.03892,-0.234,-0.97146,0.07347,-0.23163,-0.97003,0.06109,-0.24267,-0.96818,0.14848,-0.21266,-0.96578,0.27219,-0.12694,-0.95383,0.23733,-0.15971,-0.95821,0.17509,-0.20832,-0.96226,0.18273,-0.19284,-0.96407,0.24523,-0.09366,-0.96493,0.29387,-0.01038,-0.95579,0.27399,-0.04197,-0.96082,0.25083,-0.07315,-0.96526,0.26862,-0.00522,-0.96323,0.30976,0.0922,-0.94633,0.38725,0.11496,-0.91478,0.35694,0.00424,-0.93412,0.37557,-0.04222,-0.92583,0.41844,0.12719,-0.89929,0.37887,0.30353,-0.87426,0.40258,0.19537,-0.89429,0.48161,0.05806,-0.87446,0.39391,0.32718,-0.85895,0.2365,0.39413,-0.88811,0.25294,0.35822,-0.89872,0.35018,0.25029,-0.90262,0.34282,0.29063,-0.89332,-0.04295,0.47606,-0.87836,-0.0089,0.41927,-0.90782,0.06325,0.40817,-0.91071,0.07901,0.40605,-0.91043,-0.15201,0.49312,-0.85658,-0.35815,0.39866,-0.84427,-0.14791,0.43763,-0.88691,-0.06601,0.52074,-0.85116,-0.32324,0.44315,-0.83614,-0.33664,0.32926,-0.88219,-0.36042,0.33103,-0.87207,-0.30028,0.29362,-0.90754,-0.37351,0.18697,-0.90859,-0.37367,0.13882,-0.91711,-0.33742,0.15412,-0.92865,-0.36241,0.10425,-0.92617,-0.39526,0.0625,-0.91644,-0.37689,-0.0012,-0.92626,-0.36912,-0.12535,-0.92089,-0.38457,-0.07735,-0.91985,-0.43606,0.01731,-0.89975,-0.39268,0.00818,-0.91964,-0.31923,-0.16367,-0.93344,-0.31162,-0.18152,-0.93271,-0.40352,-0.14601,-0.90325,-0.4202,-0.15356,-0.89435,-0.27465,-0.33872,-0.89991,-0.18928,-0.33752,-0.92209,-0.28708,-0.24131,-0.92702,-0.32609,-0.23037,-0.91684,-0.01788,-0.40747,-0.91304,0.19945,-0.40921,-0.89037,-0.01181,-0.37088,-0.92861,-0.139,-0.37343,-0.91719,-0.01483,-0.36741,-0.92994,0.08613,-0.34552,-0.93445,0.17006,-0.37709,-0.91043,0.13106,-0.37944,-0.91588,0.21193,-0.40165,-0.89093,0.35976,-0.20041,-0.91127,0.36376,-0.20563,-0.90851,0.27107,-0.3228,-0.90682,0.26149,-0.34125,-0.90287,0.37178,-0.18519,-0.90966,0.39532,-0.0353,-0.91787,0.35609,-0.07685,-0.93129,0.33894,-0.11432,-0.93384,0.38417,0.04097,-0.92235,0.38725,0.11496,-0.91478,0.49501,0.08706,-0.86452,0.49858,0.01191,-0.86676,0.58464,0.06564,-0.80863,0.56266,0.20116,-0.80184,0.48774,0.38767,-0.78219,0.5533,0.26065,-0.79115,0.66066,0.13172,-0.73904,0.58466,0.39878,-0.70651,0.41664,0.51096,-0.75188,0.38164,0.45494,-0.8046,0.50327,0.36914,-0.78132,0.46747,0.58939,-0.65886,0.00271,0.75307,-0.65793,0.06885,0.59719,-0.79914,0.06397,0.61196,-0.7883,-0.00401,0.58418,-0.81161,-0.2699,0.62298,-0.7342,-0.35809,0.52604,-0.7714,-0.21019,0.5595,-0.80173,-0.17752,0.60933,-0.77279,-0.40347,0.55363,-0.72849,-0.44406,0.47859,-0.75747,-0.42194,0.48634,-0.76514,-0.43895,0.49201,-0.75183,-0.59297,0.29934,-0.74751,-0.5141,0.28515,-0.80895,-0.51561,0.24637,-0.82064,-0.53518,0.11429,-0.83697,-0.57686,0.09897,-0.81083,-0.57056,0.04737,-0.81989,-0.53561,-0.19261,-0.82221,-0.51198,-0.15428,-0.84503,-0.55891,0.03847,-0.82834,-0.54718,0.04028,-0.83605,-0.4862,-0.2926,-0.8234,-0.44165,-0.39307,-0.8065,-0.57777,-0.30716,-0.7562,-0.65719,-0.28352,-0.69837,-0.49354,-0.52793,-0.69116,-0.39142,-0.42386,-0.81679,-0.43801,-0.37206,-0.81836,-0.48049,-0.44418,-0.7562,-0.01766,-0.80393,-0.59446,0.23539,-0.6433,-0.72853,-0.03857,-0.56288,-0.82564,-0.22483,-0.55904,-0.79808,0.02839,-0.63619,-0.77101,0.23767,-0.57757,-0.78098,0.41624,-0.61873,-0.66627,0.27779,-0.70917,-0.648,0.1748,-0.68176,-0.71039,0.56087,-0.36297,-0.7441,0.57789,-0.28609,-0.76433,0.40806,-0.48738,-0.77198,0.39771,-0.52682,-0.75119,0.59467,-0.32831,-0.73388,0.59717,-0.12599,-0.79215,0.5073,-0.15237,-0.84819,0.55399,-0.15213,-0.81851,0.57589,0.04714,-0.81617,0.49501,0.08706,-0.86452,0.58646,0.07026,-0.80692,0.62076,0.16204,-0.76707,0.66794,0.10643,-0.73656,0.62271,0.20243,-0.75581,0.50896,0.42544,-0.7483,0.5617,0.30952,-0.76726,0.6574,0.23951,-0.71446,0.61948,0.40384,-0.67316,0.53552,0.43607,-0.72323,0.3981,0.48567,-0.77823,0.47105,0.58816,-0.6574,0.51884,0.6765,-0.52264,0.24971,0.70921,-0.65929,0.17833,0.65587,-0.7335,0.16226,0.65344,-0.73938,-0.09218,0.69101,-0.71695,-0.23053,0.63636,-0.73614,-0.22435,0.54487,-0.80795,-0.23195,0.54169,-0.80794,-0.34816,0.54926,-0.75967,-0.46455,0.56752,-0.67979,-0.45316,0.54001,-0.70925,-0.47208,0.50838,-0.7202,-0.56007,0.4842,-0.67221,-0.65655,0.39923,-0.63997,-0.57115,0.43487,-0.69619,-0.55359,0.34332,-0.75873,-0.65461,0.08078,-0.75164,-0.7089,0.09237,-0.69923,-0.66969,0.13537,-0.7302,-0.58754,-0.08811,-0.80438,-0.53408,-0.17494,-0.82714,-0.62382,-0.00412,-0.78156,-0.71877,-0.05182,-0.69331,-0.61872,-0.3668,-0.69472,-0.51918,-0.65118,-0.55355,-0.65804,-0.48812,-0.57334,-0.72593,-0.31263,-0.61261,-0.6537,-0.42259,-0.62777,-0.56009,-0.48355,-0.67267,-0.48245,-0.6227,-0.61602,-0.47864,-0.69947,-0.5307,-0.21162,-0.83701,-0.50461,0.01385,-0.76622,-0.64243,-0.04662,-0.73206,-0.67965,-0.14581,-0.82319,-0.54872,0.03836,-0.84872,-0.52745,0.3489,-0.67191,-0.6533,0.5598,-0.62765,-0.541,0.20187,-0.82829,-0.52267,0.27556,-0.8486,-0.4516,0.64253,-0.47961,-0.5976,0.60376,-0.37495,-0.70348,0.53224,-0.54903,-0.64443,0.6001,-0.57551,-0.55558,0.71574,-0.41011,-0.56526,0.6087,-0.32582,-0.72341,0.65154,-0.15495,-0.74263,0.67834,-0.15112,-0.71904,0.60708,-0.08812,-0.78974,0.58646,0.07026,-0.80692,0.6847,0.0982,-0.72218,0.65405,0.20006,-0.72952,0.653,0.08089,-0.75302,0.67627,0.24553,-0.69453,0.53234,0.26881,-0.80272,0.47908,0.30127,-0.82445,0.56152,0.35658,-0.74669,0.63478,0.43245,-0.64034,0.61199,0.32456,-0.7212,0.32748,0.66024,-0.67589,0.31496,0.74033,-0.59389,0.54343,0.56428,-0.62151,0.33716,0.68877,-0.6418,0.19187,0.73833,-0.64657,0.11966,0.80199,-0.58524,0.00848,0.77565,-0.63111,-0.02941,0.66034,-0.75039,-0.24694,0.64326,-0.72473,-0.33831,0.59712,-0.72732,-0.57448,0.55922,-0.5977,-0.41441,0.58035,-0.70104,-0.36429,0.54322,-0.75644,-0.44762,0.44183,-0.77745,-0.61474,0.35406,-0.70479,-0.6921,0.40916,-0.59463,-0.51954,0.5554,-0.64932,-0.63157,0.38742,-0.67159,-0.77584,0.02784,-0.63032,-0.71229,0.10861,-0.69343,-0.5845,0.25213,-0.77122,-0.59462,0.01794,-0.80381,-0.61213,-0.31191,-0.72664,-0.67097,-0.17951,-0.71943,-0.71483,-0.03164,-0.69859,-0.64859,-0.44376,-0.61839,-0.51574,-0.66769,-0.53685,-0.63437,-0.41123,-0.65457,-0.68569,-0.34605,-0.64037,-0.68287,-0.45566,-0.57102,-0.62435,-0.59809,-0.50247,-0.51303,-0.73824,-0.43794,-0.50373,-0.82567,-0.25402,-0.3694,-0.84507,-0.38651,-0.03163,-0.94373,-0.3292,0.05969,-0.93781,-0.34198,-0.03865,-0.9753,-0.21748,-0.21547,-0.86568,-0.45184,0.3004,-0.7838,-0.54352,0.55606,-0.58033,-0.59499,0.26649,-0.75392,-0.60049,0.37346,-0.81495,-0.44315,0.44636,-0.63638,-0.62911,0.67016,-0.34781,-0.65568,0.59629,-0.50474,-0.62424,0.66465,-0.48149,-0.57132,0.64764,-0.53545,-0.54208,0.70617,-0.42671,-0.56501,0.75306,-0.15022,-0.64057,0.69207,-0.25541,-0.67514,0.74548,-0.10282,-0.65855,0.6847,0.0982,-0.72218,0.76163,0.08106,-0.64292,0.64183,0.09827,-0.76053,0.61757,0.16564,-0.76887,0.69454,0.19103,-0.69363,0.60839,0.14444,-0.78039,0.43423,0.40856,-0.80282,0.46496,0.58065,-0.66832,0.66643,0.47187,-0.57725,0.70815,0.38518,-0.59174,0.3422,0.77767,-0.52738,0.34701,0.72059,-0.60028,0.54581,0.66124,-0.51464,0.35996,0.80938,-0.46405,0.18815,0.87184,-0.45222,0.16108,0.8454,-0.50926,0.16655,0.7704,-0.61542,-0.14497,0.87538,-0.46119,-0.26146,0.78974,-0.55493,-0.44189,0.6536,-0.61444,-0.44939,0.58429,-0.67576,-0.26598,0.57751,-0.77184,-0.33835,0.54683,-0.76583,-0.52007,0.41694,-0.74544,-0.76446,0.22603,-0.60375,-0.70506,0.4128,-0.57662,-0.49019,0.5968,-0.63525,-0.71922,0.36005,-0.59421,-0.81417,0.11117,-0.56988,-0.66455,0.25444,-0.70259,-0.60902,0.29766,-0.73518,-0.74471,-0.06501,-0.66421,-0.76742,-0.36964,-0.52385,-0.67914,-0.14452,-0.71964,-0.69118,-0.09254,-0.71674,-0.61293,-0.32881,-0.71847,-0.50126,-0.55131,-0.66693,-0.57408,-0.42483,-0.69996,-0.6978,-0.52603,-0.48618,-0.68227,-0.469,-0.56084,-0.5932,-0.62647,-0.50561,-0.37131,-0.92611,-0.06669,-0.53773,-0.82794,-0.15924,-0.39813,-0.89271,-0.21109,-0.03611,-0.9981,-0.04986,0.06636,-0.98537,-0.15696,-0.13697,-0.97151,-0.1934,-0.26985,-0.90886,-0.31805,0.36701,-0.88521,-0.28585,0.32715,-0.68692,-0.64893,0.41295,-0.62011,-0.66703,0.36209,-0.75535,-0.54621,0.4828,-0.63445,-0.60364,0.66875,-0.40596,-0.62287,0.6104,-0.46184,-0.64352,0.79452,-0.354,-0.49338,0.65586,-0.60638,-0.44961,0.67946,-0.41103,-0.60777,0.76952,-0.17868,-0.61311,0.87131,-0.22721,-0.43497,0.79874,-0.21105,-0.56345,0.76163,0.08106,-0.64292,0.7827,-0.06996,-0.61846,0.65017,-0.00692,-0.75976,0.7002,0.41286,-0.58246,0.77843,0.12561,-0.61503,0.79835,0.12649,-0.58876,0.54208,0.57317,-0.61451,0.39285,0.74309,-0.54174,0.62632,0.42021,-0.65662,0.65108,0.40244,-0.64354,0.36956,0.75091,-0.54731,0.34761,0.69913,-0.62481,0.46308,0.76749,-0.4433,0.39198,0.73474,-0.55363,0.20602,0.84013,-0.50173,0.26582,0.74485,-0.612,-0.06808,0.95002,-0.30469,-0.09476,0.92062,-0.37878,-0.12674,0.80422,-0.58066,-0.23834,0.66646,-0.70642,-0.337,0.58729,-0.73588,-0.41298,0.65037,-0.63755,-0.42918,0.64997,-0.62717,-0.57531,0.38701,-0.72059,-0.76098,0.18345,-0.6223,-0.59341,0.44894,-0.66807,-0.57015,0.55236,-0.60814,-0.77287,0.30115,-0.55856,-0.79958,0.17584,-0.57424,-0.75302,0.36083,-0.55024,-0.86163,0.30712,-0.40407,-0.88364,-0.13403,-0.44857,-0.84339,-0.29077,-0.45182,-0.79955,-0.05631,-0.59795,-0.71536,0.0027,-0.69875,-0.65618,-0.39471,-0.64314,-0.50388,-0.53127,-0.68107,-0.47783,-0.50418,-0.71936,-0.64035,-0.62547,-0.4458,-0.70689,-0.4097,-0.57659,-0.41345,-0.80373,-0.42787,-0.33763,-0.91437,-0.22346,-0.57341,-0.73646,-0.35892,-0.32005,-0.91603,-0.24178,-0.10742,-0.95438,-0.2786,-0.01555,-0.89878,-0.43812,-0.15116,-0.94411,-0.29293,-0.15148,-0.98805,-0.02848,0.07118,-0.94057,-0.33205,0.23377,-0.79868,-0.55449,0.56722,-0.68465,-0.45773,0.30677,-0.76785,-0.56241,0.64176,-0.59637,-0.48217,0.66733,-0.49703,-0.55464,0.79941,-0.38748,-0.45913,0.73804,-0.41565,-0.53153,0.50103,-0.61184,-0.61207,0.66088,-0.33707,-0.67054,0.85899,0.02502,-0.51138,0.87252,-0.26303,-0.41174,0.85708,-0.2561,-0.44703,0.7827,-0.06996,-0.61846,0.78839,-0.25005,-0.56206,0.88682,0.19519,-0.41886,0.77949,0.48789,-0.39289,0.88272,0.11499,-0.45561,0.92995,0.14277,-0.33884,0.67453,0.60992,-0.41595,0.50585,0.60365,-0.61622,0.61547,0.33698,-0.71249,0.54769,0.51858,-0.65659,0.37994,0.66183,-0.64624,0.25465,0.77792,-0.57444,0.42751,0.74007,-0.51916,0.33512,0.83826,-0.43013,0.25099,0.82221,-0.51086,0.0882,0.85946,-0.50354,-0.12219,0.97325,-0.19456,0.08425,0.94167,-0.32582,-0.05503,0.92202,-0.38322,-0.27069,0.87888,-0.39281,-0.62118,0.73778,-0.26423,-0.51295,0.80768,-0.29074,-0.30947,0.81128,-0.49604,-0.62411,0.50653,-0.59491,-0.81486,0.15335,-0.559,-0.677,0.43738,-0.59192,-0.63606,0.53414,-0.55689,-0.71784,0.3184,-0.61914,-0.85614,0.0893,-0.50897,-0.89944,0.27777,-0.33743,-0.92553,0.34692,-0.15177,-0.94297,-0.0084,-0.33278,-0.85652,-0.21492,-0.46923,-0.87698,-0.02297,-0.47997,-0.84652,0.0299,-0.53151,-0.77159,-0.28936,-0.5665,-0.62006,-0.4367,-0.65178,-0.43767,-0.75402,-0.4898,-0.57155,-0.66464,-0.48123,-0.74576,-0.47444,-0.46771,-0.45197,-0.74509,-0.49046,-0.30336,-0.76193,-0.57222,-0.45827,-0.79442,-0.39859,-0.34501,-0.88115,-0.32333,-0.24939,-0.84443,-0.47408,0.06707,-0.88169,-0.46704,0.06678,-0.97549,-0.20968,-0.19105,-0.98156,0.00579,-0.11902,-0.98386,-0.13359,0.39764,-0.91553,-0.06072,0.45487,-0.83244,-0.31646,0.4883,-0.83604,-0.25021,0.68644,-0.67528,-0.26979,0.69953,-0.51701,-0.49332,0.70674,-0.41475,-0.57315,0.51181,-0.46019,-0.72545,0.55592,-0.56395,-0.61067,0.89623,-0.20992,-0.39077,0.86373,0.03675,-0.50261,0.83566,-0.27957,-0.47278,0.82372,-0.32201,-0.46668,0.78839,-0.25005,-0.56206,0.95744,-0.0934,-0.2731,0.95541,0.20617,-0.21138,0.80573,0.37367,-0.45953,0.8635,0.20385,-0.46131,0.9076,0.13162,-0.39867,0.74597,0.40738,-0.52685,0.61607,0.50234,-0.60672,0.71312,0.49746,-0.49396,0.67164,0.49662,-0.54978,0.35354,0.79464,-0.49352,0.19052,0.84797,-0.49461,0.39741,0.69735,-0.59647,0.31124,0.86342,-0.39703,0.36495,0.8233,-0.43473,-0.05903,0.95533,-0.28958,-0.13937,0.96461,-0.22384,0.06379,0.98525,-0.15877,-0.00817,0.97203,-0.23471,-0.42527,0.90015,-0.09415,-0.58952,0.78583,-0.18693,-0.3192,0.8591,-0.40007,-0.35275,0.89911,-0.25918,-0.73701,0.62215,-0.26408,-0.80108,0.24651,-0.54543,-0.63948,0.44351,-0.62798,-0.52944,0.5235,-0.66757,-0.69992,0.21029,-0.68257,-0.87151,-0.07229,-0.48502,-0.83845,0.17844,-0.51494,-0.84938,0.30263,-0.4324,-0.82068,0.13549,-0.5551,-0.8438,-0.20878,-0.49438,-0.9136,-0.03287,-0.40529,-0.94444,0.04919,-0.32499,-0.92575,-0.29935,-0.23104,-0.76412,-0.60942,-0.21151,-0.53332,-0.79865,-0.27879,-0.61573,-0.62169,-0.48413,-0.75638,-0.53623,-0.37462,-0.60607,-0.64902,-0.45983,-0.30462,-0.75594,-0.57945,-0.25668,-0.82116,-0.50972,-0.32904,-0.85667,-0.3973,-0.30419,-0.83618,-0.45636,0.21683,-0.95873,-0.18391,0.1169,-0.91482,-0.38656,-0.09806,-0.95087,-0.29366,-0.00616,-0.9921,-0.12527,0.25313,-0.9574,-0.13894,0.39852,-0.84874,-0.34759,0.55035,-0.79888,-0.24269,0.47352,-0.76345,-0.43923,0.50062,-0.60323,-0.62088,0.57857,-0.52303,-0.62585,0.7498,-0.438,-0.49594,0.79125,-0.40248,-0.46035,0.86987,-0.19334,-0.45381,0.8328,-0.03894,-0.5522,0.78122,-0.25198,-0.57114,0.8307,-0.25037,-0.49724,0.95744,-0.0934,-0.2731,0.96757,-0.01609,-0.25208,0.95916,0.03255,-0.281,0.81739,0.16985,-0.55047,0.80536,0.24982,-0.53757,0.92008,0.19007,-0.34252,0.85819,0.42285,-0.29106,0.66302,0.68221,-0.30821,0.76265,0.55142,-0.33807,0.74741,0.55086,-0.3714,0.46042,0.84538,-0.27082,0.42373,0.73855,-0.5244,0.27185,0.83288,-0.48209,0.16971,0.92948,-0.32753,0.2794,0.907,-0.31508,-0.07371,0.93591,-0.34445,-0.0943,0.88375,-0.45836,0.04108,0.92336,-0.38172,-0.07995,0.93456,-0.3467,-0.36656,0.86994,-0.3299,-0.33728,0.81963,-0.46308,-0.46768,0.79274,-0.39094,-0.53209,0.83302,-0.15148,-0.5626,0.78815,-0.2496,-0.6502,0.49291,-0.57817,-0.62414,0.45966,-0.63179,-0.68319,0.56291,-0.46517,-0.89323,0.17459,-0.41433,-0.78504,0.03562,-0.61843,-0.68214,0.1772,-0.70943,-0.70529,0.21245,-0.67634,-0.84507,-0.06778,-0.53034,-0.8498,-0.37201,-0.37344,-0.92183,-0.097,-0.37525,-0.98702,-0.16057,0.00332,-0.95467,-0.29508,0.03905,-0.85104,-0.43821,-0.2893,-0.63249,-0.66219,-0.40182,-0.60995,-0.70488,-0.36209,-0.75538,-0.54681,-0.3611,-0.7083,-0.65071,-0.27366,-0.45428,-0.72788,-0.51364,-0.23181,-0.7894,-0.56843,-0.27254,-0.80282,-0.53029,-0.0706,-0.92855,-0.36443,0.04962,-0.90022,-0.43261,0.03136,-0.80681,-0.58998,0.11431,-0.9161,-0.38431,0.03353,-0.90298,-0.42838,0.18948,-0.89956,-0.39356,0.36464,-0.84864,-0.3832,0.45252,-0.80666,-0.38017,0.46038,-0.84361,-0.27637,0.61152,-0.72065,-0.32664,0.74693,-0.51069,-0.42579,0.78308,-0.46579,-0.41211,0.66201,-0.48718,-0.56956,0.76208,-0.22314,-0.60782,0.8168,-0.06041,-0.57375,0.73452,-0.22931,-0.63867,0.9265,0.02488,-0.37546,0.96757,-0.01609,-0.25208,0.88093,-0.02453,-0.47261,0.88048,-0.08018,-0.46725,0.90935,0.19897,-0.36536,0.82673,0.44323,-0.34649,0.92457,0.33358,-0.18409,0.89695,0.36146,-0.25462,0.71522,0.60128,-0.35626,0.79198,0.57587,-0.20286,0.74715,0.65183,-0.12992,0.57328,0.7653,-0.2927,0.49125,0.74466,-0.45183,0.21033,0.8905,-0.40344,0.17165,0.94441,-0.2804,0.37655,0.80378,-0.4606,0.06604,0.83846,-0.54095,-0.17984,0.85732,-0.48234,-0.0557,0.89355,-0.4455,-0.16644,0.93227,-0.32119,-0.36469,0.9057,-0.2161,-0.34401,0.88264,-0.32031,-0.58167,0.7787,-0.23513,-0.51508,0.81735,-0.25813,-0.49439,0.86268,-0.10656,-0.6078,0.66193,-0.43866,-0.77089,0.43696,-0.46347,-0.86695,0.48236,-0.12539,-0.83814,0.39841,-0.37254,-0.71333,0.24963,-0.65486,-0.78331,0.14552,-0.60436,-0.90103,0.0651,-0.42885,-0.95707,-0.23468,-0.1701,-0.86534,-0.27633,-0.41813,-0.81028,-0.24228,-0.53362,-0.91412,-0.31853,-0.25085,-0.94588,-0.07636,-0.31539,-0.85012,-0.32116,-0.41732,-0.58019,-0.64314,-0.49975,-0.58242,-0.69129,-0.42767,-0.69522,-0.56496,-0.44441,-0.72302,-0.66452,-0.18881,-0.59966,-0.77563,-0.19699,-0.29473,-0.88578,-0.35852,-0.16583,-0.97132,-0.17042,-0.24935,-0.88959,-0.38269,-0.09041,-0.826,-0.55637,0.24123,-0.84412,-0.47882,0.12658,-0.92411,-0.36055,0.08569,-0.96782,-0.23658,0.22327,-0.9172,-0.33001,0.41164,-0.83419,-0.367,0.60524,-0.77567,-0.17894,0.52692,-0.83741,0.14528,0.47978,-0.87531,-0.0604,0.63107,-0.62907,-0.45389,0.77202,-0.49529,-0.39833,0.73152,-0.58078,-0.35717,0.8878,-0.26685,-0.37498,0.75967,-0.1929,-0.62104,0.79309,-0.0604,-0.6061,0.90836,0.20766,-0.36298,0.88093,-0.02453,-0.47261,0.8162,-0.05858,-0.57479,0.86729,0.0996,-0.48773,0.86816,0.20331,-0.45273,0.78253,0.47237,-0.40561,0.88672,0.31361,-0.33968,0.90361,0.34106,-0.25916,0.65819,0.67879,-0.32563,0.70687,0.68188,-0.18808,0.80021,0.59971,0.00179,0.7462,0.6557,-0.11512,0.55962,0.81551,-0.14758,0.1753,0.9775,-0.11735,0.24661,0.93882,-0.24042,0.41796,0.89816,-0.13646,0.10348,0.93397,-0.34204,-0.16522,0.90299,-0.39663,-0.18582,0.94991,-0.25128,-0.34764,0.93712,-0.03093,-0.27487,0.95245,-0.1315,-0.33659,0.8931,-0.29847,-0.64828,0.75384,-0.10703,-0.60551,0.79454,-0.04537,-0.36387,0.9165,-0.16621,-0.67456,0.72784,-0.12334,-0.87884,0.36799,-0.30368,-0.83925,0.47578,-0.26322,-0.70528,0.58973,-0.39344,-0.85611,0.27456,-0.43782,-0.87134,0.02531,-0.49003,-0.95888,-0.18371,-0.21633,-0.97539,-0.09775,-0.19761,-0.85644,0.07824,-0.51029,-0.70251,-0.19028,-0.68577,-0.67158,-0.37015,-0.64184,-0.89199,-0.20493,-0.40293,-0.94645,-0.28879,-0.14433,-0.71911,-0.6421,-0.26566,-0.58442,-0.7272,-0.36004,-0.60432,-0.7342,-0.30945,-0.63556,-0.76539,-0.10121,-0.66576,-0.74587,0.0211,-0.33554,-0.8964,-0.28962,-0.2048,-0.96633,-0.1558,-0.45864,-0.80463,-0.37712,-0.11465,-0.95057,-0.28856,0.27981,-0.92423,-0.25982,0.22423,-0.90215,-0.36858,0.0998,-0.96116,-0.25731,0.14422,-0.95319,-0.26577,0.50714,-0.84775,-0.15536,0.78001,-0.61916,-0.09074,0.57114,-0.81987,0.0401,0.28605,-0.95658,0.05603,0.7086,-0.70538,-0.01799,0.87638,-0.48077,0.02853,0.79487,-0.59098,0.13754,0.82474,-0.55202,-0.12279,0.78294,-0.38219,-0.49085,0.87163,0.08459,-0.48281,0.86407,0.09807,-0.49372,0.8162,-0.05858,-0.57479,0.96352,-0.01359,-0.26731,0.90098,-0.03523,-0.43243,0.82318,0.21444,-0.52573,0.67631,0.56174,-0.47649,0.83119,0.37938,-0.40643,0.92168,0.37536,-0.09804,0.73709,0.50338,-0.45089,0.5173,0.69587,-0.49816,0.63736,0.77053,-0.00774,0.75069,0.64901,0.12351,0.61517,0.78839,-0.00231,0.24715,0.95887,-0.13959,0.22137,0.96465,-0.14296,0.45652,0.88904,-0.03457,0.17268,0.98392,-0.04561,-0.19888,0.96524,-0.16958,-0.3259,0.93975,-0.10321,-0.27525,0.94792,-0.16028,-0.13345,0.94784,-0.28946,-0.35871,0.82391,-0.43874,-0.66477,0.66316,-0.34396,-0.50691,0.7872,-0.35123,-0.3475,0.84861,-0.39888,-0.71103,0.70309,0.0099,-0.87826,0.4778,-0.01894,-0.79198,0.58175,-0.1853,-0.81436,0.57733,0.05927,-0.8823,0.45435,-0.12293,-0.98553,-0.00694,-0.16935,-0.91657,-0.20057,-0.34593,-0.86659,0.05304,-0.4962,-0.88249,0.18342,-0.43309,-0.89261,-0.13568,-0.42993,-0.67155,-0.54877,-0.49786,-0.79209,-0.53681,-0.29057,-0.93019,-0.36705,-0.00445,-0.81207,-0.54892,-0.19805,-0.63924,-0.72149,-0.26612,-0.53126,-0.84696,-0.02062,-0.62822,-0.75115,-0.20277,-0.73028,-0.66213,-0.16818,-0.36631,-0.92241,-0.12239,-0.28604,-0.8976,-0.33539,-0.30407,-0.95257,-0.01256,-0.07295,-0.99395,0.08206,0.12282,-0.97345,-0.19314,0.10636,-0.85072,-0.51475,0.18721,-0.86655,-0.46265,0.34028,-0.9226,-0.1817,0.50393,-0.84185,-0.19326,0.69524,-0.60902,-0.38176,0.5572,-0.73811,-0.38043,0.399,-0.90662,-0.13723,0.73919,-0.67311,0.02305,0.86278,-0.48423,-0.14535,0.80266,-0.59513,-0.03946,0.69687,-0.71173,0.08833,0.85166,-0.52204,-0.04641,0.98412,0.003,-0.17745,0.93095,0.01744,-0.36473,0.96352,-0.01359,-0.26731,0.99917,0.0188,0.03603,0.97762,-0.20742,-0.03509,0.988,0.14456,-0.0544,0.80238,0.50103,-0.32427,0.69971,0.57885,-0.41873,0.87936,0.32433,-0.34861,0.82326,0.46899,-0.31982,0.44341,0.83396,-0.32847,0.47287,0.82522,-0.30888,0.72679,0.65941,-0.19224,0.68208,0.68944,-0.24381,0.24054,0.95523,-0.17229,0.14842,0.98745,-0.05401,0.40924,0.91116,-0.04814,0.1345,0.96582,0.22157,-0.04832,0.99881,0.00606,-0.26036,0.95764,-0.12308,-0.18963,0.94872,-0.25293,-0.0013,0.92988,-0.36786,-0.30239,0.84856,-0.43418,-0.60712,0.64175,-0.46858,-0.5389,0.75254,-0.37851,-0.6417,0.72903,-0.23819,-0.78612,0.57573,-0.22484,-0.8777,0.46779,-0.10398,-0.81578,0.54411,-0.19609,-0.8578,0.48371,0.17382,-0.84446,0.5019,0.18706,-0.98423,0.17278,0.03801,-0.96563,0.08139,-0.24687,-0.9795,-0.05857,-0.19276,-0.99732,0.0599,-0.04206,-0.98259,-0.03601,-0.18224,-0.75947,-0.58772,-0.2789,-0.72025,-0.66837,-0.1858,-0.92772,-0.32649,-0.18094,-0.82738,-0.54041,-0.15295,-0.5427,-0.80739,-0.2315,-0.56868,-0.8004,-0.18963,-0.63568,-0.74536,-0.20088,-0.64033,-0.76772,-0.02403,-0.41124,-0.90309,0.12372,-0.2306,-0.9718,0.04929,-0.15836,-0.93598,0.31444,-0.32884,-0.94373,0.03508,-0.16174,-0.9498,-0.26782,0.14259,-0.97112,-0.1913,0.28457,-0.93094,-0.22885,0.38161,-0.90886,-0.16839,0.32152,-0.89934,-0.29633,0.6438,-0.68828,-0.33435,0.60652,-0.67013,-0.42785,0.55218,-0.77162,-0.31576,0.62983,-0.69631,-0.34418,0.80616,-0.43191,-0.40443,0.88138,-0.37358,-0.28914,0.8208,-0.57052,-0.02818,0.82649,-0.54117,0.1551,0.98769,-0.14789,0.05086,0.98253,-0.02131,-0.18488,0.99917,0.0188,0.03603,0.98777,0.15442,-0.02142,0.98013,-0.18934,-0.05915,0.99958,-0.01307,0.02579,0.95832,0.19966,-0.20432,0.81375,0.5253,-0.24873,0.85207,0.5147,-0.09517,0.8482,0.52385,-0.07832,0.6051,0.73487,-0.30629,0.43387,0.80504,-0.40456,0.5994,0.75498,-0.26595,0.62311,0.74906,-0.22503,0.10764,0.99307,-0.04722,0.21567,0.96213,-0.16669,0.27088,0.95765,-0.09765,0.16706,0.98516,-0.0395,-0.01083,0.99963,0.02489,-0.03928,0.9816,-0.18687,-0.0863,0.96872,-0.23267,-0.07221,0.99549,0.06153,-0.35403,0.92268,0.15272,-0.67588,0.73542,-0.0484,-0.62117,0.76863,-0.15282,-0.51308,0.82912,-0.22206,-0.77002,0.60888,-0.19063,-0.81399,0.47957,-0.32776,-0.89841,0.26407,-0.3509,-0.93786,0.31257,-0.15075,-0.84057,0.54044,-0.03699,-0.93282,0.32934,-0.1462,-0.98768,0.02036,-0.15517,-0.98739,-0.14164,-0.0707,-0.97833,0.16048,-0.13082,-0.99958,-0.01479,0.02493,-0.78867,-0.61092,0.06912,-0.73464,-0.6777,-0.03204,-0.92911,-0.31761,-0.18939,-0.88661,-0.40498,-0.22342,-0.65039,-0.6869,-0.32429,-0.45312,-0.83555,-0.31069,-0.48946,-0.86068,-0.1402,-0.57315,-0.81462,-0.08884,-0.34374,-0.93854,0.03148,-0.09781,-0.99366,0.05551,-0.30004,-0.95389,-0.00848,-0.42655,-0.88927,0.16508,-0.11699,-0.97955,0.16368,0.11892,-0.98676,0.11025,0.2943,-0.95233,0.0803,0.33865,-0.93171,0.13129,0.30646,-0.9492,0.07138,0.58364,-0.80001,-0.13912,0.61162,-0.72838,-0.30885,0.52596,-0.78811,-0.31978,0.71128,-0.68404,-0.16176,0.86557,-0.46498,-0.18598,0.80364,-0.41247,-0.42898,0.87214,-0.35777,-0.33371,0.92864,-0.37089,-0.00765,0.94661,-0.32236,-0.0036,0.98283,0.04398,-0.17917,0.98777,0.15442,-0.02142,0.94512,0.07821,-0.31722,0.95738,-0.06702,-0.28093,0.99119,0.07084,-0.11192,0.9515,0.29878,0.07332,0.76905,0.62547,0.13172,0.9024,0.42747,0.05422,0.92463,0.37725,0.05238,0.68951,0.72145,0.06387,0.49287,0.85773,-0.14624,0.60494,0.77369,-0.18827,0.53514,0.83966,-0.09276,0.20227,0.96744,-0.15216,0.22077,0.93537,-0.2763,0.15297,0.96736,-0.20201,0.06485,0.99444,-0.08301,0.13119,0.9706,-0.20182,-0.03537,0.96309,-0.26685,-0.43811,0.89843,-0.02987,-0.33187,0.91167,0.24234,-0.10674,0.96648,0.2335,-0.44554,0.89442,0.03896,-0.53947,0.82426,-0.17194,-0.68769,0.72398,0.05416,-0.73572,0.64724,0.19949,-0.64872,0.73512,-0.19685,-0.92789,0.30008,-0.22128,-0.89223,0.21111,-0.39919,-0.84166,0.43803,-0.3158,-0.881,0.40535,-0.24397,-0.96945,0.01421,-0.24489,-0.93238,-0.15749,-0.32536,-0.99526,-0.08316,-0.05046,-0.9752,-0.14389,0.16815,-0.86232,-0.50277,0.06013,-0.86668,-0.48689,-0.10869,-0.95835,-0.28185,-0.04616,-0.90377,-0.42779,-0.01409,-0.69202,-0.72092,0.03715,-0.55456,-0.78129,-0.28646,-0.37792,-0.90216,-0.20805,-0.47683,-0.87614,-0.0708,-0.41143,-0.88272,-0.22701,-0.13999,-0.94657,-0.29053,-0.04149,-0.98289,-0.17947,-0.20076,-0.97053,0.13332,-0.24353,-0.95209,0.18498,0.02576,-0.99933,0.02615,0.41398,-0.8994,0.14035,0.27297,-0.96174,0.02308,0.20523,-0.96172,0.18157,0.38107,-0.92332,0.0475,0.54482,-0.81991,-0.17587,0.72861,-0.68278,-0.05416,0.76016,-0.64646,0.0652,0.6389,-0.72117,-0.2678,0.80538,-0.44285,-0.394,0.97379,-0.09646,-0.20596,0.9493,-0.2733,-0.15536,0.91769,-0.39043,-0.07363,0.97329,-0.04676,-0.22476,0.94512,0.07821,-0.31722,0.91834,-0.00096,-0.39579,0.96799,0.16079,-0.19272,0.96232,0.26372,0.0663,0.96001,0.27449,-0.0552,0.80342,0.55868,-0.20593,0.8208,0.5672,-0.06762,0.82594,0.52546,0.20425,0.83037,0.52033,0.19935,0.61625,0.78104,0.10109,0.56774,0.81699,0.10101,0.54024,0.82584,0.16163,0.40013,0.90906,-0.11621,0.19211,0.97725,-0.08984,0.09234,0.99229,-0.08266,0.13845,0.97803,-0.15588,0.17375,0.98165,-0.07851,-0.11679,0.99292,-0.02157,-0.53864,0.84044,-0.05935,-0.36216,0.92444,-0.11937,-0.12479,0.98717,-0.09965,-0.34999,0.93564,-0.04569,-0.59154,0.80149,-0.08771,-0.81792,0.57114,0.06936,-0.60667,0.79472,0.01929,-0.64827,0.7603,0.0412,-0.89211,0.45152,0.01635,-0.91278,0.35463,-0.20265,-0.91145,0.33436,-0.23971,-0.91609,0.34226,-0.20889,-0.986,0.10165,-0.13217,-0.95322,-0.19685,-0.22939,-0.96989,-0.23349,-0.06924,-0.99144,-0.04947,-0.12082,-0.87093,-0.48395,-0.08527,-0.78748,-0.61586,-0.02445,-0.89385,-0.41845,0.16104,-0.86942,-0.40526,0.28263,-0.85585,-0.484,0.18238,-0.65086,-0.74843,0.12739,-0.31887,-0.93205,0.17203,-0.56342,-0.8217,0.08585,-0.55286,-0.82317,-0.12935,-0.18968,-0.93525,-0.29889,0.08947,-0.92457,-0.37036,-0.06486,-0.97038,-0.2327,-0.23006,-0.97304,-0.01638,0.02578,-0.99834,-0.05143,0.3248,-0.93827,-0.11894,0.41659,-0.89945,-0.13209,0.36778,-0.92869,0.04772,0.19983,-0.97963,0.0197,0.5683,-0.81425,0.11846,0.75321,-0.6297,0.19014,0.55566,-0.831,-0.02585,0.60484,-0.79621,-0.01513,0.92304,-0.38131,0.05096,0.99362,-0.10679,0.03626,0.95761,-0.27468,-0.08686,0.92291,-0.38376,-0.03098,0.97855,-0.1379,-0.15307,0.91834,-0.00096,-0.39579,0.98127,0.01621,-0.19194,0.88291,0.46954,-0.00112,0.96845,0.11037,-0.22345,0.94309,0.20975,-0.25804,0.77738,0.56244,-0.28168,0.67629,0.67268,-0.30022,0.75328,0.61297,-0.2384,0.75237,0.6574,0.04207,0.61728,0.78015,0.10161,0.56983,0.82074,0.041,0.64919,0.75521,0.09062,0.44864,0.89192,0.05649,0.18398,0.98078,0.06494,0.18927,0.98192,-0.00406,0.08827,0.99464,-0.05381,0.0004,0.98653,0.16361,0.02537,0.999,-0.0369,-0.38403,0.87737,-0.28765,-0.25103,0.85927,-0.44568,-0.2767,0.93347,-0.22817,-0.38678,0.92001,-0.06313,-0.66448,0.74701,0.02102,-0.77157,0.61989,-0.14289,-0.69663,0.71666,0.03313,-0.68266,0.70473,0.19319,-0.8052,0.58887,0.06986,-0.89981,0.41571,0.13236,-0.87354,0.48675,0.00167,-0.96633,0.25688,0.0147,-0.98096,0.15521,-0.1167,-0.96,-0.19336,-0.20251,-0.93448,-0.24741,-0.256,-0.97753,-0.10592,-0.18225,-0.87141,-0.39573,-0.28992,-0.69229,-0.65606,-0.30053,-0.79971,-0.55631,-0.22581,-0.86378,-0.49324,-0.1029,-0.81523,-0.57854,-0.02614,-0.52576,-0.80579,0.27254,-0.53307,-0.84605,-0.00622,-0.63728,-0.76579,-0.08628,-0.66356,-0.74765,0.02661,-0.37073,-0.92669,0.06166,0.00598,-0.99882,-0.04826,0.08253,-0.97545,-0.20417,-0.1469,-0.97536,-0.16462,0.00266,-0.99222,-0.12449,0.23367,-0.94582,-0.22546,0.48969,-0.86685,-0.09366,0.32422,-0.94192,-0.08756,0.41926,-0.90315,0.09247,0.68262,-0.71671,0.14266,0.65479,-0.75545,0.02329,0.60386,-0.78134,0.15764,0.67594,-0.62446,0.39135,0.87109,-0.38061,0.31039,0.95572,-0.28389,0.0775,0.94946,-0.31131,-0.0401,0.9143,-0.40501,0.00434,0.9319,-0.36251,-0.01227,0.98127,0.01621,-0.19194,0.99161,-0.01501,0.12835,0.97624,0.18868,-0.10654,0.99483,0.09138,-0.04424,0.94292,0.30632,0.13066,0.90199,0.4218,-0.09214,0.73578,0.62911,-0.2507,0.61651,0.74514,-0.25432,0.64989,0.7497,-0.12491,0.66183,0.67361,-0.32899,0.47985,0.81983,-0.31245,0.52354,0.85174,-0.02113,0.40505,0.89961,0.16323,0.29484,0.95465,-0.04145,0.22664,0.97157,-0.06847,-0.04645,0.99018,0.13189,0.16402,0.98629,-0.01831,0.17892,0.98386,-0.00327,-0.12103,0.96518,-0.23191,-0.48059,0.85155,-0.2095,-0.53949,0.84164,0.02453,-0.43719,0.89936,-0.00522,-0.57737,0.81647,-0.00342,-0.78855,0.60841,-0.08959,-0.76502,0.62585,-0.15187,-0.67811,0.73007,-0.08471,-0.84605,0.5331,0.00118,-0.92227,0.37024,0.11112,-0.8652,0.47194,0.16943,-0.88573,0.4063,0.22448,-0.92859,0.36961,-0.03322,-0.98419,-0.1771,-0.00289,-0.9668,-0.24514,-0.07211,-0.99836,-0.05618,-0.01083,-0.95676,-0.28935,-0.02985,-0.79333,-0.57376,-0.20353,-0.73382,-0.54758,-0.40208,-0.74824,-0.51986,-0.41218,-0.57077,-0.8041,-0.16628,-0.64191,-0.71532,-0.27616,-0.58048,-0.75117,-0.31429,-0.46384,-0.88324,-0.06883,-0.40602,-0.8942,0.18855,-0.38999,-0.89861,0.20103,-0.19531,-0.97041,0.14197,-0.04803,-0.99884,0.0039,-0.10592,-0.99436,0.00481,0.0349,-0.97978,0.19702,0.29283,-0.93847,0.18311,0.5103,-0.85505,0.09211,0.34445,-0.93102,-0.12064,0.45151,-0.89175,-0.03031,0.59005,-0.80588,-0.04894,0.72809,-0.68138,-0.07482,0.77887,-0.62656,-0.0279,0.75097,-0.6486,0.12392,0.813,-0.56846,0.12608,0.88627,-0.45363,-0.09352,0.96546,-0.24722,-0.08234,0.94641,-0.31777,-0.05774,0.90499,-0.36391,0.22037,0.99161,-0.01501,0.12835,0.98592,-0.15081,0.07225,0.97896,0.20383,-0.00993,0.93616,0.2895,0.19947,0.97634,0.13576,0.16833,0.90283,0.34593,0.25539,0.83608,0.53551,0.11914,0.61898,0.77919,0.09866,0.81333,0.54213,-0.21117,0.72591,0.61559,-0.30675,0.2638,0.93867,-0.22207,0.31459,0.93909,-0.13833,0.46852,0.88287,-0.03198,0.36086,0.93237,0.02169,0.06548,0.99705,0.03995,-0.00673,0.99997,-0.00482,0.15233,0.98648,-0.06036,0.13063,0.96789,0.21478,-0.05416,0.98398,0.16985,-0.51387,0.8536,0.08548,-0.42437,0.89018,-0.16582,-0.49833,0.86636,-0.03304,-0.55265,0.83249,0.03923,-0.59006,0.78318,-0.19611,-0.69712,0.59985,-0.39269,-0.85172,0.51563,-0.09322,-0.84914,0.50967,-0.13853,-0.88455,0.34794,-0.31066,-0.95825,0.27054,-0.09252,-0.90169,0.40396,0.15418,-0.87842,0.35008,0.32531,-0.93475,-0.11669,0.33561,-0.95513,-0.25713,0.14703,-0.98776,-0.12502,0.09324,-0.94011,-0.18921,0.28353,-0.94741,-0.31249,0.069,-0.87028,-0.49138,-0.03422,-0.72404,-0.68278,0.09782,-0.69352,-0.71932,0.04006,-0.72167,-0.66661,-0.18661,-0.37989,-0.92404,-0.04289,-0.38538,-0.9224,0.02566,-0.46151,-0.88709,0.00839,-0.33343,-0.93033,0.15266,-0.16177,-0.96544,0.20436,-0.05145,-0.98745,0.14931,0.0942,-0.93425,0.34395,0.10584,-0.88401,0.45532,0.04706,-0.97256,0.22783,0.13168,-0.9852,-0.10977,0.43077,-0.90246,0.00231,0.55549,-0.82976,0.05402,0.56062,-0.82803,-0.00868,0.5702,-0.7785,-0.26232,0.78139,-0.50917,-0.3608,0.85038,-0.49879,-0.16752,0.76866,-0.63729,-0.05498,0.78839,-0.53355,-0.30622,0.94055,-0.21671,-0.26155,0.97644,-0.12322,-0.17713,0.97207,-0.18388,0.14584,0.98592,-0.15081,0.07225,0.9781,-0.14375,0.15054,0.9658,0.24497,0.08495,0.95064,0.28342,-0.12635,0.9173,0.38866,0.0866,0.92581,0.3452,0.15401,0.82322,0.53882,0.17882,0.76291,0.62618,0.16082,0.93097,0.36404,0.02768,0.66864,0.70695,0.23051,0.42274,0.89292,-0.15486,0.25246,0.90457,-0.34353,0.22709,0.97302,-0.04071,0.33601,0.94034,0.0534,0.21674,0.97361,-0.07149,0.1185,0.95741,-0.26331,-0.06036,0.97378,-0.21933,0.01942,0.99937,-0.02973,0.01686,0.998,0.06099,-0.3153,0.94789,0.04573,-0.46727,0.88406,-0.01014,-0.59349,0.80477,-0.01092,-0.42022,0.89552,-0.14645,-0.48004,0.87447,-0.0698,-0.82269,0.56769,-0.02998,-0.8352,0.53578,-0.124,-0.69961,0.69271,-0.17521,-0.92277,0.32806,-0.20216,-0.94129,0.007,-0.33751,-0.98269,0.10323,-0.15384,-0.97201,0.23219,0.03585,-0.98999,0.1401,0.01737,-0.99179,-0.01627,-0.12686,-0.94892,-0.31476,-0.02184,-0.95519,-0.26692,0.12791,-0.95145,-0.26463,0.15721,-0.74393,-0.59704,0.30017,-0.71567,-0.64009,0.27948,-0.845,-0.52142,0.11873,-0.74293,-0.65022,0.15896,-0.40761,-0.90015,0.15357,-0.41609,-0.9013,-0.12057,-0.27247,-0.96104,-0.04641,-0.32293,-0.94605,-0.02651,-0.26404,-0.96277,-0.05802,0.04058,-0.98835,-0.14666,0.31207,-0.93993,0.13834,-0.08894,-0.99569,0.02633,-0.05397,-0.99669,0.0608,0.29531,-0.94481,0.14187,0.47399,-0.82152,0.31693,0.35091,-0.92806,0.12473,0.44364,-0.88715,0.1271,0.50336,-0.85617,0.11658,0.80671,-0.58531,-0.08144,0.89832,-0.40496,-0.17039,0.69792,-0.70712,-0.11354,0.80771,-0.55054,-0.21099,0.95244,-0.1258,-0.27755,0.98073,0.15117,-0.12372,0.97667,-0.18723,-0.10515,0.9781,-0.14375,0.15054,0.99736,-0.07238,-0.00512,0.97965,-0.05832,-0.19207,0.93428,0.30304,-0.18786,0.87635,0.46429,-0.12827,0.92082,0.36207,-0.14491,0.75882,0.65101,-0.01956,0.79757,0.59525,-0.09773,0.80021,0.58405,0.13621,0.7929,0.54469,0.27316,0.69093,0.72266,0.01947,0.18211,0.98252,-0.03852,0.16666,0.9776,-0.12855,0.33789,0.93414,-0.11494,0.36943,0.87448,-0.31434,0.17264,0.89673,-0.40753,-0.17173,0.93881,-0.29856,-0.08911,0.96588,-0.24316,-0.16128,0.98611,-0.0398,-0.32624,0.94528,-0.00486,-0.31387,0.92869,-0.19755,-0.49636,0.85532,-0.14854,-0.57212,0.81623,0.08031,-0.55408,0.82028,0.14189,-0.73785,0.67475,0.01687,-0.80773,0.57282,-0.13943,-0.78681,0.59356,0.16918,-0.77439,0.62669,0.08706,-0.96705,0.23866,-0.08866,-0.96851,-0.04915,-0.24407,-0.9781,0.08499,-0.18997,-0.99763,0.04235,-0.05419,-0.97012,-0.02851,-0.24096,-0.89958,-0.41574,-0.13384,-0.94605,-0.26387,-0.18802,-0.84773,-0.46626,0.25287,-0.79357,-0.55991,0.23821,-0.8026,-0.58676,0.10745,-0.81965,-0.5699,0.05811,-0.6253,-0.72843,0.27998,-0.65666,-0.74558,0.1136,-0.57822,-0.81376,-0.05883,-0.29836,-0.95265,-0.05869,-0.31085,-0.93973,-0.14238,-0.24739,-0.96537,0.08277,0.03527,-0.99849,-0.04206,0.26607,-0.93547,-0.23258,-0.02396,-0.96836,-0.2484,0.07465,-0.99494,0.06723,0.38207,-0.9188,0.09913,0.41811,-0.90584,-0.0681,0.43832,-0.89848,-0.02454,0.58195,-0.76389,0.27895,0.38868,-0.82842,0.40329,0.68263,-0.65811,0.31765,0.87391,-0.42295,0.23956,0.65872,-0.74169,0.12645,0.79038,-0.57917,0.19964,0.98179,-0.18904,0.01866,0.98813,0.13131,-0.07979,0.99862,0.0322,-0.04156,0.99736,-0.07238,-0.00512,0.99069,-0.12,-0.06431,0.99797,0.05234,-0.03627,0.91806,0.39527,-0.03049,0.90756,0.37643,-0.1861,0.87102,0.47222,-0.1354,0.81347,0.5498,-0.18972,0.72542,0.58526,-0.36227,0.56907,0.81544,-0.10593,0.79085,0.61196,0.00761,0.6052,0.69686,0.38486,0.42565,0.8983,0.10895,0.20905,0.97498,-0.07563,0.45671,0.88741,-0.06258,0.41298,0.91021,0.03119,0.07051,0.99328,0.09177,-0.16799,0.98577,-0.00606,-0.14571,0.98088,-0.12903,-0.23495,0.96891,0.07756,-0.09488,0.98123,-0.16788,-0.47525,0.87941,-0.02761,-0.70544,0.68141,0.19501,-0.56018,0.80106,0.21094,-0.43276,0.89309,0.1229,-0.66533,0.7353,0.12915,-0.87277,0.48553,-0.05035,-0.8856,0.4427,0.14048,-0.72703,0.5718,0.38009,-0.84248,0.36732,0.39408,-0.98437,0.1744,-0.02457,-0.9926,-0.05296,0.10931,-0.94686,0.30437,-0.10399,-0.99533,-0.04801,-0.0837,-0.90327,-0.41784,-0.09757,-0.83638,-0.53188,-0.13257,-0.81273,-0.58204,-0.0264,-0.89764,-0.41371,-0.15194,-0.85082,-0.47328,-0.22828,-0.70332,-0.71029,0.02882,-0.62932,-0.74273,0.2287,-0.68797,-0.69648,0.20397,-0.45236,-0.80125,0.39162,-0.40845,-0.87108,0.27275,-0.11902,-0.91086,0.39517,-0.29796,-0.86971,0.39347,-0.21261,-0.96974,0.12,0.10191,-0.98859,-0.11091,0.22136,-0.97473,-0.03001,0.1708,-0.98368,-0.05655,0.23578,-0.96589,-0.10709,0.30655,-0.91702,-0.25514,0.69974,-0.71333,-0.03888,0.76541,-0.60336,0.22384,0.50664,-0.81727,0.27456,0.64344,-0.74042,0.19435,0.78046,-0.62068,0.07504,0.69032,-0.67876,0.25048,0.70383,-0.53849,0.46331,0.90003,-0.34885,0.26123,0.99107,0.05609,0.12099,0.981,-0.14673,-0.12692,0.99069,-0.12,-0.06431,0.97193,-0.07055,0.22443,0.98011,-0.01819,0.19763,0.97821,0.20643,-0.02222,0.91099,0.33614,-0.23898,0.83833,0.54449,-0.02697,0.92397,0.37784,-0.05938,0.76129,0.58949,-0.27006,0.50916,0.78005,-0.36371,0.51586,0.81078,-0.27663,0.55871,0.8205,0.12095,0.57667,0.80618,0.13241,0.26243,0.96029,-0.09478,0.24804,0.9685,0.02196,0.25051,0.91529,0.31541,0.30498,0.93673,0.17184,0.00627,0.99963,0.02633,-0.25944,0.96543,0.025,-0.18536,0.97829,0.09272,-0.06881,0.99314,-0.09458,-0.58337,0.81134,0.03752,-0.62928,0.73748,-0.24521,-0.60415,0.76864,-0.21022,-0.53094,0.84707,0.0241,-0.43206,0.89115,-0.13844,-0.87925,0.46758,-0.09101,-0.97606,0.16551,0.14111,-0.85223,0.48541,0.19513,-0.73218,0.67832,0.06164,-0.97534,0.21012,0.06751,-0.99148,0.03268,0.12608,-0.94227,0.28385,0.17765,-0.93729,-0.0578,0.34372,-0.97321,-0.19336,0.12436,-0.88077,-0.46462,0.09148,-0.87427,-0.4168,-0.24885,-0.87261,-0.48161,-0.08126,-0.77312,-0.62959,-0.07689,-0.48892,-0.87225,0.01195,-0.62342,-0.78066,-0.04383,-0.48391,-0.8154,0.31773,-0.58437,-0.77554,0.23886,-0.27698,-0.91748,0.28552,-0.1468,-0.94115,0.30445,-0.55352,-0.81806,0.15616,-0.25244,-0.92907,0.27036,0.12617,-0.93416,0.3338,0.04991,-0.98225,0.1808,0.09418,-0.99374,0.06015,0.19714,-0.97996,0.02866,0.42741,-0.90376,0.02313,0.78706,-0.61674,0.01288,0.75156,-0.65585,-0.07085,0.38487,-0.90492,-0.18164,0.64604,-0.73143,-0.21829,0.91317,-0.39996,-0.07846,0.89249,-0.35308,0.2807,0.71325,-0.64761,0.2681,0.85822,-0.44963,0.24757,0.98039,-0.1886,0.05706,0.99143,-0.06771,0.11174,0.97193,-0.07055,0.22443,0.93229,-0.0212,0.36108,0.86209,-0.06209,0.50294,0.97195,-0.08441,0.21952,0.8553,0.46874,0.22076,0.74052,0.55646,0.3768,0.97247,0.13825,0.18761,0.84065,0.53266,0.09789,0.61166,0.78687,-0.08195,0.35062,0.93279,-0.08345,0.48114,0.84565,-0.23104,0.62565,0.76216,-0.16633,0.3687,0.87255,-0.32049,0.02082,0.98389,-0.17754,0.26997,0.95705,-0.1057,0.34295,0.93868,-0.03552,0.0083,0.99994,0.00674,-0.29601,0.95474,0.02915,-0.03164,0.98094,-0.19171,-0.17751,0.97786,0.1108,-0.3459,0.938,0.02258,-0.52182,0.84103,-0.14271,-0.80551,0.58763,-0.07651,-0.5727,0.81872,-0.04144,-0.55288,0.82803,0.09327,-0.93652,0.32212,0.13849,-0.97146,0.22139,-0.08514,-0.83374,0.53275,-0.14512,-0.78941,0.60367,0.1114,-0.96201,0.13965,0.2346,-0.93198,-0.08393,0.35267,-0.82214,0.10994,0.55857,-0.84523,0.07914,0.52851,-0.8003,-0.17305,0.57409,-0.8834,-0.19164,0.42765,-0.85188,-0.41426,0.32046,-0.84262,-0.43466,0.3179,-0.78372,-0.51441,0.34809,-0.68334,-0.71997,0.12122,-0.46731,-0.88288,-0.04644,-0.46839,-0.88317,0.02483,-0.68008,-0.71808,-0.14781,-0.13445,-0.98244,0.12935,-0.16923,-0.97293,0.15736,-0.44889,-0.8734,0.18887,-0.12933,-0.90902,0.39617,0.0009,-0.96883,0.24774,0.03518,-0.93413,0.3552,0.06609,-0.88619,0.45858,0.08948,-0.9131,0.39779,0.35627,-0.83939,0.41048,0.65268,-0.73435,0.18641,0.59694,-0.74192,-0.30531,0.45052,-0.87386,-0.18277,0.73316,-0.67681,0.0664,0.95413,-0.28595,-0.08869,0.9073,-0.37647,-0.18728,0.76924,-0.63889,0.00989,0.84304,-0.41699,0.3397,0.9613,-0.24266,0.13045,0.96306,0.09905,0.25043,0.93229,-0.0212,0.36108,0.92414,0.14833,0.35207,0.91374,-0.14259,0.38046,0.77303,0.00521,0.63435,0.72262,0.46921,0.5076,0.88582,0.4016,0.23249,0.92107,0.15364,0.3578,0.77424,0.47313,0.42036,0.65877,0.73057,0.17967,0.50528,0.85306,-0.13033,0.51452,0.79244,-0.32759,0.61159,0.75252,-0.24425,0.25826,0.95987,-0.10931,0.04839,0.93714,-0.34558,0.17674,0.96035,-0.21563,0.26206,0.96502,-0.00839,-0.05669,0.97766,0.20239,-0.12853,0.99129,0.02881,-0.12928,0.98156,-0.14081,-0.34699,0.8449,0.4071,-0.13764,0.96294,0.23193,-0.4779,0.81902,0.31752,-0.77088,0.58496,0.25212,-0.58966,0.80174,0.09756,-0.48509,0.80001,0.35309,-0.80181,0.57421,0.16551,-0.95884,0.28305,0.02256,-0.92642,0.36485,0.09287,-0.83342,0.5231,0.17828,-0.95824,0.15107,0.24281,-0.95037,-0.26366,0.16517,-0.93727,-0.08846,0.3372,-0.79117,0.00232,0.61159,-0.86628,0.04059,0.4979,-0.88601,-0.07833,0.45699,-0.75733,-0.37135,0.53716,-0.79461,-0.45751,0.3991,-0.63661,-0.4749,0.60762,-0.76772,-0.43844,0.46731,-0.54816,-0.809,0.21225,-0.55995,-0.82836,-0.01659,-0.52869,-0.83045,0.17562,-0.10767,-0.9873,0.11682,-0.23072,-0.96246,-0.14299,-0.31109,-0.94603,0.09086,-0.08905,-0.89543,0.43621,-0.07266,-0.98997,0.12118,0.22601,-0.93776,0.26368,0.12622,-0.93648,0.32722,0.21705,-0.76264,0.60932,0.18776,-0.73579,0.65066,0.2797,-0.86848,0.40928,0.53536,-0.83275,0.14114,0.58839,-0.7646,0.26303,0.66363,-0.63675,0.39262,0.86818,-0.48483,0.10582,0.92567,-0.34681,-0.1512,0.94637,-0.29682,0.12757,0.81836,-0.38849,0.42351,0.92663,-0.23712,0.29178,0.93263,0.19566,0.30319,0.92414,0.14833,0.35207,0.9835,0.17804,0.03197,0.93756,0.09337,0.33505,0.83605,0.08371,0.54222,0.93366,0.26938,0.23602,0.90888,0.41459,0.04531,0.78688,0.36146,0.50016,0.74909,0.37663,0.54498,0.70932,0.58833,0.38824,0.61589,0.76983,0.16746,0.45456,0.84681,0.27621,0.5899,0.77801,0.21615,0.40028,0.91597,-0.02782,0.13177,0.90953,-0.3942,0.01942,0.97199,-0.2342,0.12114,0.97235,-0.19966,-0.06491,0.99439,-0.08352,0.01637,0.9987,-0.04832,-0.32873,0.92922,0.16877,-0.36617,0.88673,0.2822,-0.13763,0.96192,0.23616,-0.44225,0.84976,0.28693,-0.69477,0.7178,0.04523,-0.68584,0.72252,0.08711,-0.55183,0.77881,0.29822,-0.6701,0.59407,0.44502,-0.87854,0.37374,0.29746,-0.90714,0.35854,0.22034,-0.82589,0.55339,0.108,-0.93766,0.23342,0.2575,-0.98074,-0.19209,0.03541,-0.92955,-0.34656,0.12582,-0.95435,-0.07046,0.29026,-0.9695,0.11133,0.21837,-0.93618,-0.16899,0.30822,-0.84343,-0.35446,0.40371,-0.65702,-0.51792,0.5478,-0.64589,-0.44792,0.61822,-0.77975,-0.32153,0.53722,-0.61401,-0.68524,0.39172,-0.46909,-0.82982,0.30225,-0.44081,-0.74016,0.50779,-0.44846,-0.88892,0.09325,-0.2086,-0.94487,-0.2524,0.08743,-0.99197,0.09135,-0.13715,-0.92573,0.35243,-0.13988,-0.95442,0.26367,0.20173,-0.96731,0.1537,0.32347,-0.92239,0.21108,0.41856,-0.82994,0.3688,0.20214,-0.87847,0.43292,0.17613,-0.79659,0.57829,0.41588,-0.6933,0.58854,0.54732,-0.67699,0.49207,0.55147,-0.5294,0.64469,0.61823,-0.55808,0.55348,0.87204,-0.4509,0.19034,0.9707,-0.10976,0.21378,0.88293,-0.42157,0.20668,0.8762,-0.16026,0.45453,0.99509,0.05785,0.08026,0.9835,0.17804,0.03197,0.97662,0.2134,0.02614,0.9343,0.3326,0.12831,0.95065,0.03504,0.30829,0.9661,0.13578,0.21957,0.78927,0.60783,0.08719,0.67394,0.63696,0.37429,0.79687,0.33443,0.50314,0.80415,0.40176,0.43809,0.52322,0.73333,0.43413,0.53096,0.77926,0.33293,0.65778,0.67644,0.33129,0.64906,0.76074,-0.0006,0.09697,0.99526,-0.00709,0.10066,0.98034,-0.16971,0.07997,0.98949,-0.12045,-0.13986,0.96818,-0.20751,-0.22909,0.97122,-0.06518,-0.45472,0.88878,0.05749,-0.35382,0.93505,-0.02207,-0.12076,0.99011,-0.07145,-0.28756,0.95239,-0.10128,-0.65791,0.75099,-0.0563,-0.78951,0.59799,0.1381,-0.66832,0.6995,0.25306,-0.6738,0.69334,0.25548,-0.83228,0.48275,0.27252,-0.88668,0.42021,0.19295,-0.82909,0.43377,0.35278,-0.82685,0.26798,0.49448,-0.93369,-0.05788,0.35337,-0.93238,-0.33813,0.12783,-0.99155,-0.09785,0.08513,-0.9524,0.04655,0.30126,-0.91197,-0.19853,0.35902,-0.7675,-0.51575,0.38071,-0.55546,-0.65315,0.51464,-0.72903,-0.42041,0.54016,-0.81524,-0.22946,0.53173,-0.61794,-0.55551,0.55639,-0.32652,-0.76868,0.55002,-0.51325,-0.67019,0.53611,-0.62219,-0.6741,0.39808,-0.28271,-0.95019,0.13122,0.20907,-0.97747,0.02894,-0.01228,-0.97963,0.20042,-0.14247,-0.87615,0.46051,0.03557,-0.97949,0.19832,0.36738,-0.92529,0.0942,0.51345,-0.83272,0.20724,0.36129,-0.87703,0.31668,0.27136,-0.88393,0.38082,0.37979,-0.76379,0.52191,0.58518,-0.57737,0.56939,0.61071,-0.50291,0.61165,0.42419,-0.73836,0.52429,0.73995,-0.49043,0.46038,0.84451,-0.17516,0.50608,0.88192,-0.39113,0.26311,0.91627,-0.25617,0.30794,0.97877,-0.04999,0.19879,0.97662,0.2134,0.02614,0.97976,0.11019,0.16714,0.90158,0.39814,0.16925,0.96996,0.06487,0.23445,0.89126,0.14843,0.42851,0.72658,0.64947,0.22422,0.73633,0.66876,0.10292,0.90227,0.37425,0.21413,0.86781,0.48255,0.11852,0.49247,0.85697,0.15193,0.56693,0.80411,0.17888,0.62199,0.64459,0.44456,0.53861,0.71695,0.44258,0.12503,0.92308,0.36373,0.23501,0.96557,-0.11159,0.06434,0.99791,0.00585,-0.00493,0.98103,-0.1938,-0.20262,0.9452,-0.256,-0.40367,0.87402,-0.27043,-0.29443,0.86265,-0.41127,-0.1988,0.95786,-0.20734,-0.31902,0.92691,-0.19762,-0.73361,0.64549,0.2125,-0.80508,0.56666,0.17536,-0.68163,0.73155,0.01429,-0.69009,0.72373,0.00078,-0.85485,0.50386,0.12396,-0.90996,0.30058,0.2857,-0.90459,0.33412,0.26474,-0.84778,0.34968,0.39874,-0.90032,0.1563,0.4062,-0.94225,-0.20008,0.26858,-0.93139,-0.25098,0.26368,-0.94274,-0.08568,0.32234,-0.89788,-0.1202,0.42351,-0.79314,-0.50126,0.34592,-0.63184,-0.74599,0.21044,-0.76902,-0.56747,0.29426,-0.88939,-0.36073,0.28083,-0.60333,-0.64423,0.47008,-0.46124,-0.77205,0.43726,-0.55453,-0.64458,0.52632,-0.64977,-0.57266,0.49985,-0.31197,-0.795,0.52024,0.11011,-0.9394,0.32467,0.13564,-0.9238,0.35804,-0.24121,-0.92915,0.28016,-0.09157,-0.98618,0.13808,0.38986,-0.90863,0.14971,0.543,-0.8308,0.12213,0.40204,-0.87992,0.2532,0.36105,-0.91901,0.15832,0.5481,-0.81658,0.18109,0.70446,-0.53305,0.46861,0.63153,-0.5778,0.51702,0.48118,-0.65282,0.58506,0.64099,-0.28871,0.71118,0.69125,-0.35159,0.63131,0.73006,-0.33409,0.59614,0.84579,-0.28787,0.44919,0.89612,-0.11833,0.42774,0.97976,0.11019,0.16714,0.81698,0.17264,0.55021,0.94635,0.19836,0.2551,0.91969,0.22342,0.32288,0.83554,0.20217,0.51089,0.82164,0.52782,0.21522,0.78335,0.6153,-0.0881,0.90255,0.39664,0.16755,0.81507,0.5703,0.10209,0.48796,0.86845,-0.08772,0.34236,0.93863,0.04204,0.4988,0.81235,0.30213,0.53001,0.65552,0.53794,0.58945,0.78907,0.17299,0.29123,0.9455,-0.14566,0.06333,0.99131,-0.11532,-0.06327,0.98766,0.14324,-0.11586,0.99326,0.00058,-0.27955,0.95305,-0.11638,-0.37494,0.87788,-0.2979,-0.34288,0.93298,-0.10949,-0.45382,0.88822,0.07151,-0.75326,0.59447,0.28143,-0.6987,0.70847,0.09939,-0.65336,0.74566,0.13078,-0.692,0.66343,0.28458,-0.84016,0.47686,0.25832,-0.85901,0.27639,0.43094,-0.89807,0.33264,0.2878,-0.86973,0.20976,0.44674,-0.86488,0.1881,0.4654,-0.87972,-0.09555,0.46579,-0.95404,-0.14998,0.25946,-0.95337,-0.1551,0.25889,-0.88921,-0.19612,0.41334,-0.89338,-0.38093,0.23824,-0.66311,-0.72026,0.20375,-0.79207,-0.54972,0.2654,-0.89974,-0.41824,0.1247,-0.58689,-0.75831,0.28378,-0.33788,-0.86972,0.35975,-0.49409,-0.73033,0.47169,-0.5683,-0.53491,0.62523,-0.29271,-0.65899,0.69286,0.04822,-0.79471,0.60507,-0.06278,-0.91983,0.38727,-0.31604,-0.86839,0.38212,-0.07068,-0.91988,0.38578,0.34098,-0.89495,0.28773,0.56839,-0.78677,0.24066,0.34753,-0.86976,0.35033,0.26477,-0.93575,0.23298,0.64455,-0.73824,0.19891,0.85508,-0.41789,0.30693,0.72556,-0.48303,0.49014,0.57338,-0.58615,0.57242,0.76259,-0.40109,0.50753,0.83138,-0.27295,0.48406,0.66857,-0.33028,0.66628,0.6622,-0.33883,0.66834,0.80923,-0.19694,0.5535,0.81698,0.17264,0.55021,0.80821,-0.01176,0.58878,0.9128,0.13361,0.38594,0.88658,0.3344,0.3196,0.90159,0.15058,0.40554,0.90069,0.3855,0.20036,0.74967,0.65349,-0.10463,0.85951,0.50585,0.0732,0.84182,0.51564,0.15955,0.55698,0.79348,-0.24527,0.20609,0.91563,-0.34518,0.35621,0.92298,-0.14568,0.608,0.7817,0.13889,0.66886,0.68742,0.28298,0.30263,0.93544,0.18267,-0.11882,0.9808,0.15466,-0.08487,0.93275,0.35039,0.12517,0.99142,-0.03768,-0.15031,0.98281,-0.1072,-0.37078,0.92625,-0.06762,-0.41421,0.90367,-0.10872,-0.56275,0.82621,-0.02618,-0.72723,0.68316,-0.06655,-0.76769,0.63781,-0.06208,-0.77819,0.61023,0.14848,-0.66646,0.68408,0.29642,-0.81981,0.47943,0.31314,-0.91241,0.31432,0.26212,-0.75699,0.21968,0.61539,-0.76952,0.25457,0.5857,-0.82008,0.20954,0.53251,-0.8219,0.0028,0.56963,-0.94195,-0.0453,0.33267,-0.82722,-0.23873,0.50864,-0.94479,-0.06377,0.3214,-0.86387,-0.33888,0.37267,-0.54332,-0.68402,0.48675,-0.81636,-0.46227,0.34621,-0.74966,-0.40987,0.51963,-0.51304,-0.65109,0.55935,-0.27695,-0.81994,0.501,-0.32151,-0.77305,0.54684,-0.47823,-0.62586,0.61611,-0.41122,-0.63681,0.65221,-0.14674,-0.86498,0.47988,0.02133,-0.89223,0.45108,-0.21368,-0.80603,0.55196,-0.16445,-0.76414,0.62373,0.23971,-0.78738,0.56796,0.53237,-0.62666,0.56911,0.26876,-0.89477,0.35659,0.27513,-0.70929,0.64901,0.50593,-0.62744,0.59191,0.80935,-0.45282,0.37404,0.77723,-0.55112,0.30362,0.60247,-0.60954,0.51526,0.76344,-0.45384,0.45955,0.91371,-0.17565,0.36645,0.82356,-0.13093,0.55191,0.65417,-0.41643,0.63138,0.71989,-0.21876,0.65872,0.80821,-0.01176,0.58878,0.79697,-0.18342,0.5755,0.81066,0.15004,0.56597,0.82564,0.2877,0.48532,0.78879,0.1443,0.59748,0.85234,0.24884,0.46,0.76165,0.6345,0.13156,0.86926,0.47703,0.12972,0.86067,0.46019,0.2179,0.59355,0.80468,0.01358,0.27926,0.91248,-0.299,0.18089,0.93496,-0.30517,0.52634,0.84685,-0.07625,0.65817,0.74813,0.08437,0.29527,0.93148,0.21252,-0.2095,0.9536,0.21622,0.05486,0.98526,0.16203,0.18912,0.97937,0.07119,-0.15209,0.98806,-0.02472,-0.38759,0.92024,0.05422,-0.35651,0.92588,0.12513,-0.45188,0.89202,-0.01042,-0.65513,0.72162,-0.22377,-0.7958,0.59775,-0.09689,-0.86254,0.49713,-0.09433,-0.74491,0.65907,0.10362,-0.78858,0.56647,0.23926,-0.97748,0.1511,0.14729,-0.92573,0.06089,0.37325,-0.76968,0.27167,0.57775,-0.71654,0.24559,0.65288,-0.74942,0.1415,0.6468,-0.80501,0.01229,0.59314,-0.74039,-0.15517,0.65402,-0.80963,-0.05942,0.58393,-0.64092,-0.31448,0.70023,-0.65242,-0.56705,0.50279,-0.69222,-0.5443,0.47389,-0.57906,-0.45401,0.67718,-0.48952,-0.53852,0.68583,-0.31565,-0.74149,0.59207,-0.41644,-0.8385,0.35143,-0.50074,-0.77908,0.37722,-0.48723,-0.69198,0.53271,-0.26712,-0.82895,0.49142,0.1085,-0.78688,0.60749,-0.05362,-0.76102,0.64651,-0.03259,-0.60492,0.79562,0.11494,-0.62715,0.77037,0.32218,-0.68908,0.64913,0.34435,-0.7171,0.60596,0.34154,-0.59522,0.72737,0.34936,-0.63423,0.68972,0.67582,-0.43062,0.59819,0.79219,-0.54946,0.26555,0.74773,-0.50434,0.4319,0.6549,-0.46345,0.59693,0.86391,-0.14856,0.48123,0.93337,-0.23205,0.27383,0.80589,-0.33548,0.48785,0.73269,-0.13335,0.66738,0.79697,-0.18342,0.5755,0.83107,-0.09388,0.54819,0.84294,0.19804,0.50023,0.73106,0.32769,0.59847,0.74466,0.06105,0.66465,0.81245,0.15176,0.56294,0.78735,0.52563,0.32218,0.85761,0.46811,0.21301,0.73195,0.51139,0.45025,0.65247,0.66901,0.35597,0.34616,0.93766,-0.03093,0.23672,0.90868,-0.3439,0.48304,0.8002,-0.35546,0.55337,0.78158,-0.28795,0.12174,0.98283,-0.13868,-0.2399,0.9598,-0.14571,0.07725,0.98367,-0.16257,0.16406,0.93775,0.30611,-0.01957,0.98086,0.19371,-0.42203,0.89673,0.13333,-0.37778,0.91785,0.12179,-0.25507,0.94322,0.21278,-0.56043,0.82809,-0.01327,-0.77667,0.56515,0.27817,-0.85246,0.51676,0.07918,-0.84406,0.53542,0.02995,-0.72598,0.59656,0.34216,-0.91276,0.3568,0.1989,-0.94359,-0.11659,0.30991,-0.87321,0.05269,0.48449,-0.79151,0.19508,0.57918,-0.86912,0.21973,0.44311,-0.69809,-0.04729,0.71445,-0.75414,-0.10779,0.6478,-0.66161,-0.1062,0.74229,-0.71414,-0.15344,0.68298,-0.69135,-0.43245,0.57882,-0.61712,-0.58496,0.52629,-0.62472,-0.57319,0.53025,-0.6555,-0.57605,0.48834,-0.55688,-0.72454,0.4061,-0.53224,-0.83492,0.14011,-0.30132,-0.84617,0.43956,-0.39864,-0.72962,0.55565,-0.09708,-0.72207,0.68498,0.10496,-0.74036,0.66396,0.07694,-0.7587,0.64688,0.02403,-0.76246,0.64659,0.04424,-0.71636,0.69633,0.22903,-0.79423,0.56279,0.44501,-0.63213,0.63434,0.31851,-0.7512,0.57814,0.37759,-0.65933,0.65015,0.53609,-0.66408,0.52115,0.75645,-0.52088,0.39555,0.78884,-0.42553,0.44346,0.7305,-0.41299,0.54389,0.85393,-0.27303,0.44301,0.94197,-0.28422,0.17865,0.85716,-0.03534,0.51383,0.78887,-0.20884,0.57799,0.83107,-0.09388,0.54819,0.84615,-0.01385,0.53276,0.85715,0.28206,0.43097,0.8261,0.41103,0.3855,0.83692,0.04236,0.54569,0.84298,0.06389,0.53414,0.85614,0.43174,0.28396,0.77972,0.57957,0.23692,0.66564,0.63404,0.39358,0.79106,0.55062,0.26653,0.46849,0.88342,-0.00885,0.44272,0.79661,-0.41159,0.4584,0.76848,-0.44644,0.42722,0.87537,-0.22631,0.20341,0.89897,-0.38791,-0.22958,0.88131,-0.41302,-0.23754,0.91156,-0.33561,-0.09957,0.97971,0.17392,0.17812,0.984,0.00416,-0.30835,0.9446,-0.11246,-0.46278,0.88034,-0.10405,-0.30789,0.94473,0.11266,-0.50699,0.79311,0.33754,-0.69592,0.70871,0.11586,-0.76282,0.59578,0.25129,-0.87238,0.45656,0.17465,-0.78348,0.45822,0.41974,-0.77326,0.33882,0.53597,-0.88308,-0.0394,0.46756,-0.98659,0.01647,0.1624,-0.92638,0.23708,0.2926,-0.96349,0.15467,0.21856,-0.85198,-0.11277,0.51128,-0.74375,-0.1561,0.64998,-0.7308,-0.11692,0.67251,-0.81787,-0.01468,0.57521,-0.71015,-0.3089,0.63266,-0.61323,-0.50185,0.61,-0.65888,-0.53393,0.52991,-0.66285,-0.57072,0.48466,-0.55091,-0.60232,0.57767,-0.45265,-0.78407,0.42466,-0.1397,-0.77882,0.61149,-0.34351,-0.68701,0.64033,-0.13059,-0.82075,0.55616,0.03923,-0.92252,0.38395,0.08913,-0.84929,0.52035,0.05994,-0.79728,0.60062,-0.05011,-0.81241,0.58094,0.24231,-0.85615,0.4564,0.51471,-0.65781,0.54988,0.36501,-0.75956,0.53837,0.39218,-0.61184,0.68691,0.45295,-0.683,0.57301,0.6823,-0.36125,0.63559,0.70043,-0.4095,0.58455,0.71865,-0.45725,0.5239,0.79895,-0.41213,0.43798,0.91055,-0.09063,0.40335,0.85797,0.00526,0.51367,0.7991,-0.29411,0.52435,0.84615,-0.01385,0.53276,0.83354,-0.04625,0.55052,0.88775,0.30225,0.3472,0.88888,0.41715,0.18941,0.90417,0.13833,0.40416,0.86449,0.02154,0.5022,0.82636,0.37545,0.41971,0.70128,0.67253,0.23643,0.73808,0.61784,0.27112,0.73412,0.56956,0.36969,0.64853,0.71592,0.25857,0.58445,0.81131,-0.0139,0.35964,0.93017,-0.07382,0.41421,0.90767,0.06765,0.29227,0.94055,-0.17307,-0.2353,0.94292,-0.23566,-0.41322,0.8736,-0.25705,-0.12773,0.98057,-0.14892,0.24597,0.95075,-0.18859,-0.3054,0.94059,-0.14841,-0.59413,0.80004,0.08331,-0.48702,0.83819,0.24547,-0.46092,0.80059,0.3829,-0.60549,0.79533,0.02901,-0.77342,0.42455,0.47072,-0.80446,0.42195,0.4181,-0.79869,0.37634,0.46954,-0.8031,0.38877,0.45155,-0.90675,0.19535,0.37368,-0.99605,0.05658,0.06848,-0.93773,0.16171,0.30742,-0.93712,0.13191,0.32313,-0.82721,-0.27622,0.48931,-0.76203,-0.298,0.57489,-0.8567,-0.0762,0.51016,-0.82144,-0.07706,0.56506,-0.68643,-0.31552,0.65517,-0.604,-0.39436,0.69257,-0.53708,-0.40323,0.74091,-0.51597,-0.45873,0.72342,-0.57523,-0.49123,0.65407,-0.37823,-0.70367,0.60149,-0.08747,-0.83689,0.54033,-0.42091,-0.70277,0.57354,-0.32073,-0.83609,0.44508,0.10558,-0.94831,0.29925,0.31662,-0.85435,0.41212,0.139,-0.77706,0.61389,-0.15305,-0.76835,0.62146,0.22128,-0.75771,0.61394,0.45566,-0.63776,0.62099,0.44445,-0.61347,0.65278,0.36609,-0.57411,0.73238,0.38975,-0.60158,0.69728,0.66162,-0.38547,0.64317,0.64954,-0.40154,0.64565,0.60849,-0.43785,0.66184,0.69552,-0.35215,0.6263,0.8332,0.03495,0.55187,0.87604,-0.07089,0.477,0.78764,-0.1694,0.59239,0.83354,-0.04625,0.55052,0.87273,-0.16175,0.46063,0.91101,0.26138,0.31897,0.9009,0.4278,0.07329,0.91327,0.22951,0.33655,0.82801,0.07229,0.55603,0.77187,0.33498,0.54037,0.66714,0.63035,0.39696,0.68575,0.64475,0.3377,0.65647,0.54774,0.51867,0.67674,0.54946,0.49002,0.62375,0.70358,0.34045,0.31564,0.92637,0.20545,0.46557,0.83211,0.30139,0.29915,0.92837,0.22056,-0.14623,0.98785,-0.05265,-0.4377,0.89236,-0.11002,-0.12212,0.95331,-0.27621,0.19824,0.97921,0.04291,-0.3241,0.92392,0.2033,-0.66501,0.73146,0.15077,-0.57558,0.81422,0.07587,-0.37864,0.87289,0.30772,-0.5523,0.71929,0.42141,-0.76201,0.48116,0.43339,-0.80708,0.43046,0.40414,-0.77733,0.40359,0.48257,-0.8179,0.53011,0.22368,-0.88858,0.31891,0.32974,-0.90122,0.06629,0.42826,-0.83856,0.07631,0.53944,-0.76733,0.08866,0.63509,-0.81896,-0.1996,0.53802,-0.85272,-0.3382,0.3981,-0.78676,-0.16243,0.5955,-0.75854,-0.08431,0.64615,-0.71635,-0.34101,0.60873,-0.47729,-0.50214,0.72115,-0.45079,-0.40643,0.79474,-0.54989,-0.326,0.76899,-0.72,-0.3603,0.59312,-0.40399,-0.64366,0.65,-0.04684,-0.74924,0.66064,-0.37913,-0.66913,0.63917,-0.39789,-0.63058,0.66637,-0.04904,-0.89616,0.44101,0.43457,-0.7727,0.46269,0.23199,-0.76803,0.59691,-0.15977,-0.83042,0.53374,0.27343,-0.67531,0.68497,0.47052,-0.66482,0.58019,0.5587,-0.51633,0.64904,0.39388,-0.60626,0.69088,0.34489,-0.53903,0.76844,0.58235,-0.37575,0.72089,0.6162,-0.33141,0.71447,0.54258,-0.34065,0.76783,0.56792,-0.29046,0.77013,0.8079,-0.11208,0.57856,0.86755,-0.00777,0.49729,0.74901,-0.12802,0.65007,0.87273,-0.16175,0.46063,0.7844,-0.15603,0.60031,0.87548,0.20573,0.43727,0.91882,0.3906,0.05656,0.88743,0.34729,0.30307,0.75577,0.14663,0.63821,0.71813,0.30669,0.62469,0.61643,0.55961,0.55395,0.66965,0.6172,0.41308,0.63711,0.57819,0.5097,0.75963,0.51075,0.40261,0.67339,0.70213,0.23143,0.26357,0.9576,0.11636,0.34266,0.83911,0.42247,0.35326,0.78404,0.51037,0.0467,0.99869,-0.02115,-0.39761,0.90534,-0.1492,-0.19888,0.92744,-0.31671,0.02695,0.99926,0.02738,-0.28432,0.95514,0.08283,-0.57791,0.80959,-0.10287,-0.68934,0.72422,-0.01761,-0.52056,0.73981,0.42627,-0.47407,0.60305,0.64155,-0.68939,0.55485,0.4657,-0.76569,0.40147,0.50253,-0.75734,0.49981,0.42028,-0.77019,0.59157,0.23845,-0.83816,0.22949,0.49479,-0.67748,-0.04159,0.73436,-0.7215,0.01561,0.69224,-0.70439,0.11146,0.70101,-0.81207,-0.01419,0.58339,-0.83147,-0.31596,0.45699,-0.6866,-0.26902,0.67544,-0.66492,-0.04434,0.7456,-0.71199,-0.24542,0.65791,-0.40839,-0.52993,0.74323,-0.43014,-0.45076,0.78217,-0.57084,-0.26913,0.7757,-0.62192,-0.29205,0.72658,-0.2551,-0.44297,0.85947,-0.10466,-0.54239,0.83358,-0.38051,-0.58941,0.71261,-0.4097,-0.55764,0.72193,-0.05957,-0.62641,0.77721,0.38455,-0.66941,0.63562,0.17665,-0.80202,0.57057,-0.11843,-0.85821,0.49946,0.31352,-0.711,0.62943,0.50146,-0.66955,0.54794,0.63235,-0.52572,0.56899,0.49067,-0.5334,0.689,0.35781,-0.43711,0.82517,0.48831,-0.33697,0.80498,0.61713,-0.36015,0.69961,0.62171,-0.29362,0.72613,0.52775,-0.36895,0.76508,0.77798,-0.18284,0.6011,0.84032,0.05669,0.53912,0.7273,-0.16033,0.66733,0.7844,-0.15603,0.60031,0.67873,-0.11531,0.72527,0.77939,0.06849,0.62278,0.90237,0.38804,0.18749,0.85456,0.41757,0.3088,0.75642,0.21159,0.61892,0.78106,0.32384,0.53392,0.62162,0.52583,0.58059,0.63924,0.58175,0.50293,0.73893,0.55249,0.38567,0.87296,0.45325,0.18027,0.63851,0.74299,0.20068,0.15345,0.9802,0.12513,0.31365,0.91446,0.25571,0.5937,0.77401,0.22005,0.1422,0.98962,0.02087,-0.26863,0.91495,-0.30116,-0.32852,0.92721,-0.17991,0.01248,0.98809,-0.15335,-0.2357,0.96621,-0.10435,-0.60087,0.79742,0.05553,-0.74738,0.60385,0.2771,-0.65395,0.66508,0.36059,-0.51361,0.56825,0.64288,-0.6283,0.63077,0.45538,-0.80031,0.41636,0.43145,-0.76298,0.50896,0.39852,-0.70538,0.55621,0.43939,-0.81393,0.15488,0.55993,-0.64426,-0.09668,0.75867,-0.7968,0.06184,0.60107,-0.76766,0.1644,0.61942,-0.82211,0.09378,0.56155,-0.74671,-0.27463,0.60581,-0.67468,-0.37567,0.63535,-0.80611,-0.05355,0.58933,-0.6643,-0.18073,0.72529,-0.34918,-0.49265,0.7971,-0.40551,-0.48814,0.77284,-0.57844,-0.29304,0.76127,-0.54847,-0.28323,0.78674,-0.2367,-0.42941,0.87154,-0.24631,-0.51871,0.8187,-0.43193,-0.53733,0.72437,-0.3375,-0.53814,0.77233,-0.07747,-0.55282,0.82969,0.24717,-0.70841,0.66111,0.13721,-0.76311,0.63154,-0.05383,-0.75755,0.65055,0.28997,-0.6444,0.70758,0.45531,-0.56641,0.68693,0.61661,-0.49565,0.61165,0.58892,-0.46895,0.65822,0.44979,-0.39031,0.80334,0.44809,-0.47073,0.76002,0.66238,-0.42902,0.61417,0.69159,-0.25985,0.67393,0.55621,-0.43972,0.70518,0.70294,-0.14299,0.69672,0.81123,0.07201,0.58028,0.74614,-0.19547,0.63645,0.67873,-0.11531,0.72527,0.66623,-0.08513,0.74087,0.75057,-0.05368,0.6586,0.82563,0.38623,0.4113,0.80281,0.45658,0.38346,0.89075,0.19364,0.41118,0.83608,0.42849,0.34258,0.72261,0.60012,0.34306,0.73399,0.6009,0.31651,0.84684,0.48033,0.22834,0.86363,0.46807,0.18724,0.52642,0.73588,0.42587,0.09551,0.9213,0.37693,0.45579,0.88712,0.07261,0.5987,0.80008,0.0378,0.1927,0.9621,0.19296,-0.16949,0.96839,-0.18302,-0.42127,0.89881,0.12113,0.02426,0.99691,0.07468,-0.25761,0.94037,0.22212,-0.61187,0.72413,0.3182,-0.74155,0.52811,0.41377,-0.73267,0.55635,0.39201,-0.58042,0.64367,0.4988,-0.55874,0.79009,0.25213,-0.80825,0.50552,0.30197,-0.78959,0.45921,0.40704,-0.64385,0.48316,0.5933,-0.82664,0.1752,0.53476,-0.73734,-0.09605,0.66866,-0.88693,0.08191,0.45458,-0.83971,0.1666,0.51684,-0.81412,0.12788,0.56644,-0.65522,-0.24708,0.71389,-0.77796,-0.38021,0.50021,-0.89189,-0.14576,0.42812,-0.57515,-0.24681,0.77993,-0.3844,-0.47084,0.79407,-0.42177,-0.51691,0.74493,-0.5733,-0.34815,0.7417,-0.51772,-0.30051,0.80104,-0.35454,-0.48253,0.80091,-0.31817,-0.55083,0.77159,-0.36416,-0.48928,0.79246,-0.25762,-0.47653,0.84057,-0.199,-0.54599,0.81382,0.14925,-0.65147,0.74385,0.10087,-0.7344,0.67118,0.03163,-0.62686,0.77849,0.26613,-0.56065,0.78412,0.39272,-0.49544,0.77479,0.54403,-0.44132,0.71363,0.62646,-0.41689,0.6586,0.52647,-0.45268,0.71966,0.41956,-0.59801,0.6829,0.66023,-0.34892,0.66509,0.6628,-0.23087,0.71232,0.55431,-0.45025,0.70001,0.71692,-0.11904,0.68692,0.81629,0.04215,0.5761,0.74752,-0.16364,0.64377,0.66623,-0.08513,0.74087,0.70524,-0.0963,0.70239,0.74481,-0.09519,0.66046,0.72552,0.37124,0.57948,0.83947,0.36149,0.40572,0.92761,0.1819,0.32628,0.79742,0.50258,0.33396,0.77738,0.6017,0.1834,0.75906,0.60544,0.23933,0.81111,0.45911,0.36238,0.7721,0.53094,0.34923,0.36859,0.72914,0.57663,0.30883,0.88231,0.35518,0.57252,0.8151,0.08849,0.48107,0.82203,0.3047,0.28516,0.89971,0.33047,-0.17389,0.95939,0.22211,-0.41432,0.83633,0.35901,-0.00735,0.93167,0.36324,-0.26358,0.83916,0.47575,-0.57479,0.68082,0.45398,-0.72621,0.53404,0.43292,-0.77169,0.57945,0.26218,-0.61362,0.75113,0.24345,-0.53711,0.80928,0.23788,-0.77661,0.43306,0.45752,-0.81525,0.32922,0.47643,-0.64603,0.45744,0.61105,-0.79054,0.26331,0.55291,-0.83488,-0.02685,0.54977,-0.8994,0.09075,0.4276,-0.84383,0.10004,0.52721,-0.76789,0.06053,0.63772,-0.65344,-0.18463,0.73412,-0.83565,-0.29807,0.46135,-0.77614,-0.28385,0.56307,-0.638,-0.34368,0.68909,-0.48098,-0.48069,0.73321,-0.44012,-0.56226,0.70012,-0.58787,-0.44852,0.67323,-0.58161,-0.31516,0.74994,-0.47524,-0.47518,0.74051,-0.24222,-0.5383,0.80719,-0.24871,-0.4606,0.85205,-0.28104,-0.45146,0.84687,-0.25964,-0.49991,0.82624,0.07881,-0.53841,0.83899,0.1,-0.64232,0.75988,0.11911,-0.54811,0.82788,0.24887,-0.52879,0.81145,0.37893,-0.44702,0.8103,0.45432,-0.42534,0.78274,0.59702,-0.37951,0.70678,0.49291,-0.51544,0.70098,0.4282,-0.56146,0.7081,0.6567,-0.2308,0.71796,0.61268,-0.25304,0.74872,0.52147,-0.43187,0.7359,0.72048,-0.10044,0.68617,0.79403,0.00669,0.60785,0.75054,-0.10836,0.65188,0.70524,-0.0963,0.70239,0.6796,-0.09598,0.72727,0.74737,-0.10054,0.65676,0.70381,0.34713,0.6198,0.86376,0.21219,0.45704,0.83993,0.22946,0.4918,0.73058,0.45387,0.51016,0.75214,0.55283,0.35869,0.69364,0.61792,0.37019,0.74701,0.44922,0.49007,0.61211,0.57011,0.54799,0.38948,0.70393,0.59396,0.52915,0.81395,0.23975,0.45285,0.82509,0.33788,0.36161,0.73374,0.57521,0.29986,0.79,0.53477,-0.21593,0.79657,0.56467,-0.3695,0.83566,0.40637,-0.02152,0.95005,0.31135,-0.27658,0.89821,0.34164,-0.58427,0.72071,0.3731,-0.70343,0.60118,0.37916,-0.76247,0.64266,0.07503,-0.68164,0.71706,0.14556,-0.58491,0.78644,0.19847,-0.77924,0.41816,0.46683,-0.77414,0.21823,0.59421,-0.68254,0.47684,0.55386,-0.68962,0.24339,0.68205,-0.84803,0.05788,0.52679,-0.82386,0.03938,0.56543,-0.74952,0.03574,0.66102,-0.75779,0.03911,0.65132,-0.72912,-0.10065,0.67694,-0.7728,-0.21629,0.59666,-0.64776,-0.28079,0.70821,-0.71408,-0.35269,0.60474,-0.46339,-0.48469,0.74185,-0.50554,-0.56376,0.65315,-0.54819,-0.54473,0.63463,-0.5754,-0.37618,0.72622,-0.43468,-0.42018,0.79655,-0.17115,-0.51395,0.84057,-0.24172,-0.4924,0.83613,-0.3189,-0.47131,0.8223,-0.20522,-0.45389,0.8671,-0.03195,-0.47431,0.87978,0.06669,-0.53943,0.83939,0.13488,-0.47724,0.86836,0.2424,-0.45596,0.85636,0.35348,-0.46235,0.81319,0.43653,-0.42483,0.79307,0.53071,-0.40528,0.74438,0.44292,-0.51977,0.73052,0.47233,-0.49756,0.72755,0.7086,-0.15057,0.68936,0.64786,-0.33991,0.68172,0.49413,-0.35504,0.79359,0.63379,-0.08388,0.76895,0.75787,-0.0625,0.6494,0.74048,-0.05522,0.6698,0.6796,-0.09598,0.72727,0.6037,-0.11236,0.78925,0.71615,-0.06895,0.69453,0.71694,0.29156,0.63323,0.8,0.1472,0.58167,0.72783,0.27367,0.62878,0.72508,0.40052,0.56022,0.68248,0.50389,0.52944,0.63066,0.60184,0.48996,0.66197,0.45308,0.59709,0.48049,0.55327,0.68045,0.57452,0.64866,0.49917,0.49862,0.76616,0.40543,0.23145,0.77794,0.58416,0.26791,0.63042,0.72856,0.26487,0.67014,0.69337,-0.20107,0.67652,0.70845,-0.23399,0.8887,0.3943,0.05129,0.98884,0.13986,-0.2921,0.91463,0.27951,-0.59661,0.68956,0.41056,-0.64424,0.70392,0.29908,-0.71773,0.66888,0.19354,-0.69731,0.69981,0.15497,-0.63498,0.73891,0.22539,-0.73437,0.30141,0.60815,-0.70344,0.19721,0.68285,-0.70244,0.44038,0.55914,-0.60369,0.21249,0.76838,-0.78507,0.14232,0.60283,-0.68304,-0.03209,0.72967,-0.66176,0.033,0.74899,-0.70367,0.07741,0.7063,-0.68757,-0.05046,0.72436,-0.57397,-0.19529,0.79525,-0.5686,-0.18567,0.80139,-0.63377,-0.25764,0.72935,-0.41524,-0.38939,0.82216,-0.50598,-0.45055,0.73552,-0.40377,-0.5019,0.76489,-0.40978,-0.3716,0.83306,-0.34025,-0.35243,0.87179,-0.19451,-0.45497,0.869,-0.2147,-0.45348,0.86502,-0.22221,-0.41281,0.8833,-0.15196,-0.4129,0.89801,-0.05282,-0.40706,0.91187,0.07651,-0.39513,0.91543,0.11867,-0.35287,0.92812,0.14419,-0.38445,0.91181,0.26977,-0.43743,0.85784,0.40178,-0.37608,0.83494,0.43951,-0.40017,0.80417,0.35391,-0.42883,0.83118,0.47356,-0.41606,0.7763,0.69441,-0.13091,0.70757,0.59208,-0.30546,0.74574,0.48697,-0.19495,0.85139,0.52813,-0.13631,0.83815,0.69276,-0.11146,0.71251,0.7035,0.02637,0.7102,0.6037,-0.11236,0.78925,0.57346,-0.13315,0.80834,0.63791,0.00019,0.77011,0.7521,0.21965,0.62137,0.75037,0.17381,0.63776,0.66179,0.29295,0.69009,0.76511,0.3387,0.54762,0.614,0.52287,0.59127,0.61134,0.58202,0.53621,0.58343,0.49186,0.64629,0.48956,0.51046,0.70694,0.72329,0.56435,0.39795,0.33767,0.75066,0.56788,0.1353,0.79585,0.59019,0.21646,0.62529,0.74977,0.24487,0.61736,0.7476,-0.0937,0.69913,0.70883,-0.08946,0.88248,0.46175,0.0676,0.95429,0.29113,-0.31527,0.77944,0.54137,-0.53785,0.69669,0.4747,-0.59034,0.74673,0.30641,-0.66418,0.60538,0.4386,-0.68085,0.6837,0.26265,-0.65554,0.60762,0.4484,-0.65177,0.18086,0.73654,-0.80393,0.32361,0.49898,-0.71194,0.36605,0.5993,-0.58176,0.23163,0.77969,-0.72121,0.21855,0.65733,-0.58052,-0.06574,0.81159,-0.62634,0.02921,0.779,-0.62135,0.077,0.77974,-0.5753,-0.03404,0.81723,-0.4566,-0.16265,0.87468,-0.60512,-0.13603,0.78443,-0.49436,-0.19123,0.84796,-0.40406,-0.30599,0.86204,-0.41748,-0.33224,0.84577,-0.26521,-0.39705,0.87864,-0.26613,-0.33011,0.90565,-0.28833,-0.28078,0.91544,-0.20966,-0.36339,0.90774,-0.12928,-0.36404,0.92237,-0.16369,-0.32649,0.93092,-0.14491,-0.36105,0.92122,0.00556,-0.33157,0.94341,0.09399,-0.30016,0.94925,0.10185,-0.29743,0.9493,0.04394,-0.31815,0.94702,0.16983,-0.35261,0.92023,0.31375,-0.32106,0.89358,0.35235,-0.321,0.87909,0.28578,-0.3201,0.90325,0.39072,-0.27823,0.87745,0.5789,-0.14092,0.80313,0.52426,-0.2134,0.82439,0.5069,-0.11034,0.85491,0.44006,-0.19956,0.87552,0.6504,-0.09281,0.7539,0.7068,0.08455,0.70234,0.57346,-0.13315,0.80834,0.55996,-0.1439,0.81593,0.59744,-0.00607,0.80189,0.75652,0.16852,0.63188,0.73089,0.23121,0.64214,0.63595,0.26109,0.72622,0.7494,0.32868,0.57477,0.59213,0.55108,0.58796,0.631,0.59789,0.49433,0.58449,0.59965,0.54662,0.64528,0.49431,0.58247,0.71401,0.55905,0.42149,0.24936,0.78607,0.56562,0.06413,0.85356,0.51703,0.15548,0.70701,0.6899,0.29519,0.6332,0.71549,0.04605,0.80114,0.5967,-0.03982,0.82449,0.56447,0.039,0.86038,0.50816,-0.30538,0.68281,0.66371,-0.4446,0.77984,0.44066,-0.56908,0.6699,0.47684,-0.59324,0.54455,0.5929,-0.62973,0.65324,0.42039,-0.64353,0.46179,0.61043,-0.69364,0.2015,0.69156,-0.85391,0.30022,0.4251,-0.67733,0.18866,0.71108,-0.63828,0.31161,0.70392,-0.69313,0.28188,0.66341,-0.54415,-0.08,0.83517,-0.60488,0.01522,0.79617,-0.61357,0.0698,0.78655,-0.5494,-0.03038,0.83501,-0.47218,-0.12502,0.87259,-0.6095,-0.12873,0.78226,-0.4245,-0.1907,0.88512,-0.42567,-0.26737,0.86448,-0.37752,-0.29559,0.87755,-0.20844,-0.36215,0.90851,-0.19276,-0.32669,0.92527,-0.30817,-0.27052,0.91206,-0.23145,-0.32901,0.91552,-0.07165,-0.33897,0.93806,-0.16318,-0.30593,0.93796,-0.14075,-0.33087,0.93312,0.05712,-0.31257,0.94817,0.10829,-0.29421,0.94959,0.09804,-0.29686,0.94987,-0.00974,-0.33663,0.94159,0.12639,-0.33201,0.93477,0.26618,-0.29349,0.91816,0.329,-0.27876,0.90225,0.27254,-0.28635,0.91855,0.36891,-0.23729,0.89867,0.52706,-0.17988,0.83057,0.56083,-0.15382,0.81352,0.56676,-0.08786,0.81919,0.41002,-0.25716,0.87507,0.6455,-0.06107,0.76132,0.70179,0.11542,0.70297,0.55996,-0.1439,0.81593,0.5389,-0.11724,0.83417,0.5224,-0.05229,0.85109,0.68094,0.12481,0.72163,0.64925,0.2911,0.70266,0.65415,0.20322,0.72855,0.66793,0.34473,0.65957,0.60998,0.50985,0.60661,0.6235,0.60359,0.49692,0.60814,0.62883,0.4845,0.72602,0.48294,0.48955,0.5926,0.57746,0.56157,0.23299,0.7847,0.57442,-0.04134,0.82184,0.56822,0.15366,0.78501,0.60013,0.35769,0.66527,0.65534,0.10487,0.78012,0.61678,-0.04102,0.74805,0.66238,-0.00451,0.72144,0.69246,-0.21438,0.63362,0.74335,-0.31424,0.77067,0.55437,-0.53437,0.52088,0.66569,-0.50199,0.49833,0.70688,-0.53297,0.58391,0.61237,-0.58448,0.3666,0.72386,-0.69395,0.31508,0.64743,-0.78399,0.23268,0.57551,-0.62358,0.07795,0.77786,-0.64335,0.32317,0.69402,-0.62156,0.23949,0.74586,-0.51533,-0.08247,0.85301,-0.59213,0.02399,0.80549,-0.58928,0.05916,0.80576,-0.51286,-0.0395,0.85757,-0.50188,-0.07657,0.86154,-0.55958,-0.10179,0.8225,-0.38531,-0.17989,0.90508,-0.43567,-0.21732,0.87348,-0.34145,-0.27484,0.89882,-0.168,-0.33823,0.92595,-0.16504,-0.3235,0.93172,-0.34949,-0.27571,0.89546,-0.22121,-0.31003,0.92463,-0.03145,-0.32818,0.94409,-0.19116,-0.31601,0.9293,-0.13291,-0.31333,0.9403,0.08531,-0.30685,0.94793,0.11762,-0.31056,0.94325,0.07736,-0.32704,0.94184,-0.04572,-0.36059,0.9316,0.14368,-0.30562,0.94125,0.23871,-0.28196,0.92926,0.31772,-0.25121,0.9143,0.26408,-0.27728,0.92378,0.33911,-0.23899,0.90988,0.46533,-0.20424,0.86125,0.59448,-0.08246,0.79987,0.57017,-0.12093,0.81258,0.40467,-0.27679,0.87157,0.61243,-0.01439,0.79039,0.671,0.09971,0.73472,0.5389,-0.11724,0.83417,0.5168,-0.05196,0.85453,0.46452,-0.0847,0.8815,0.57697,0.09126,0.81165,0.55988,0.2723,0.78255,0.62045,0.14659,0.77043,0.55111,0.31107,0.77428,0.57921,0.39983,0.71039,0.53395,0.5189,0.66756,0.56394,0.53075,0.63267,0.63208,0.44774,0.63246,0.45258,0.51032,0.73127,0.18313,0.6838,0.70631,-0.06349,0.70065,0.71067,0.17577,0.7426,0.64625,0.29828,0.63791,0.71,0.07095,0.65638,0.75109,-0.05931,0.64879,0.75865,-0.0618,0.59803,0.79909,-0.12053,0.57602,0.8085,-0.21134,0.64233,0.73672,-0.47432,0.39466,0.78693,-0.42356,0.50261,0.75365,-0.45608,0.47538,0.75234,-0.5113,0.34825,0.78568,-0.58831,0.36229,0.72294,-0.66061,0.15656,0.73422,-0.58164,0.04009,0.81246,-0.58214,0.2786,0.76387,-0.54002,0.15659,0.82696,-0.50148,-0.06473,0.86275,-0.58936,0.03361,0.80717,-0.54692,0.02339,0.83686,-0.49144,-0.03761,0.8701,-0.52505,-0.04004,0.85013,-0.48469,-0.0986,0.86911,-0.42719,-0.16637,0.88872,-0.45291,-0.17067,0.87507,-0.32569,-0.26757,0.90683,-0.12752,-0.33556,0.93335,-0.20104,-0.32173,0.92524,-0.37464,-0.28014,0.88384,-0.17078,-0.31408,0.93391,-0.03574,-0.33681,0.94089,-0.19333,-0.32499,0.92574,-0.08451,-0.30429,0.94882,0.04811,-0.3349,0.94102,0.11579,-0.34377,0.93189,0.07776,-0.34711,0.93459,-0.04593,-0.36203,0.93103,0.1689,-0.30718,0.93654,0.24531,-0.28287,0.92726,0.31196,-0.24157,0.91887,0.2547,-0.27351,0.92754,0.2781,-0.25159,0.92702,0.41167,-0.19603,0.89,0.55603,-0.06719,0.82844,0.51821,-0.15623,0.84086,0.40872,-0.24629,0.8788,0.55819,0.00337,0.82971,0.61089,0.06386,0.78914,0.5168,-0.05196,0.85453,0.42957,0.01235,0.90295,0.39619,-0.09538,0.9132,0.44985,0.05708,0.89128,0.41618,0.17639,0.89201,0.46418,0.11539,0.87819,0.41202,0.20627,0.88752,0.44562,0.26566,0.8549,0.39117,0.3573,0.84813,0.41219,0.35731,0.83811,0.42159,0.35247,0.83548,0.29563,0.37483,0.87869,0.10249,0.49557,0.8625,0.01043,0.49768,0.8673,0.14724,0.5462,0.82461,0.16863,0.47507,0.86364,0.0571,0.50479,0.86135,-0.06589,0.47055,0.87991,-0.07988,0.45702,0.88586,-0.06,0.44115,0.89543,-0.14676,0.46627,0.87239,-0.34627,0.31241,0.88459,-0.31121,0.42287,0.85107,-0.3699,0.32032,0.87211,-0.38962,0.29348,0.87296,-0.42508,0.2765,0.86189,-0.50443,0.08652,0.85911,-0.4792,0.0225,0.87742,-0.45016,0.19239,0.87198,-0.44214,0.08919,0.8925,-0.45383,-0.01043,0.89103,-0.51764,0.05283,0.85396,-0.44559,-0.02384,0.89492,-0.42865,-0.02931,0.90299,-0.45636,-0.02357,0.88948,-0.39787,-0.08797,0.91321,-0.40229,-0.13776,0.90509,-0.37933,-0.14967,0.91307,-0.28199,-0.23829,0.92936,-0.0964,-0.31696,0.94353,-0.21741,-0.2781,0.93563,-0.33514,-0.24958,0.90851,-0.11879,-0.30542,0.94478,-0.03879,-0.31461,0.94843,-0.15667,-0.29337,0.94308,-0.07708,-0.29191,0.95333,-0.0062,-0.32069,0.94717,0.13556,-0.31974,0.93776,0.06255,-0.31397,0.94737,-0.04982,-0.34286,0.93806,0.17552,-0.28643,0.94189,0.24838,-0.23636,0.93938,0.27798,-0.21466,0.93629,0.22555,-0.24875,0.94194,0.23086,-0.249,0.94059,0.35339,-0.16787,0.92029,0.43492,-0.08606,0.89635,0.42106,-0.14381,0.89556,0.3637,-0.17071,0.91574,0.44154,-0.02522,0.89688,0.48599,0.05319,0.87234,0.42957,0.01235,0.90295,0.30794,0.02895,0.95097,0.30429,-0.08204,0.94904,0.30337,0.02972,0.95241,0.27615,0.10213,0.95567,0.30036,0.0813,0.95036,0.27221,0.11596,0.95522,0.28947,0.14704,0.94582,0.23801,0.20616,0.94913,0.24932,0.20254,0.94701,0.22823,0.22449,0.94737,0.167,0.23488,0.95757,0.06109,0.30476,0.95047,0.04305,0.30012,0.95293,0.08437,0.32491,0.94197,0.09193,0.28813,0.95317,0.04785,0.32697,0.94382,-0.06924,0.27933,0.9577,-0.05697,0.28558,0.95666,-0.02932,0.2901,0.95655,-0.11883,0.26978,0.95556,-0.19727,0.21717,0.95599,-0.18411,0.25302,0.94978,-0.23536,0.18844,0.95347,-0.23685,0.19522,0.95173,-0.26596,0.16857,0.94913,-0.33775,0.03266,0.94067,-0.33406,0.01539,0.94243,-0.30292,0.12051,0.94536,-0.31727,0.05597,0.94668,-0.3358,0.01863,0.94175,-0.33999,0.01418,0.94032,-0.31024,-0.03301,0.95008,-0.32123,-0.01319,0.94691,-0.31489,-0.02745,0.94873,-0.28876,-0.05511,0.95581,-0.30565,-0.0759,0.94911,-0.27549,-0.11246,0.9547,-0.18048,-0.1923,0.9646,-0.09139,-0.25032,0.96384,-0.19198,-0.20668,0.95939,-0.23793,-0.19186,0.95214,-0.07832,-0.25208,0.96453,-0.02979,-0.26169,0.96469,-0.0952,-0.2394,0.96624,-0.08096,-0.23316,0.96906,-0.03856,-0.2571,0.96562,0.12125,-0.24962,0.96072,0.04748,-0.24805,0.96758,-0.03946,-0.2704,0.96194,0.14587,-0.21645,0.96534,0.21278,-0.17393,0.96149,0.20746,-0.18044,0.96146,0.17768,-0.21054,0.9613,0.18787,-0.19733,0.96217,0.26908,-0.11739,0.95594,0.29744,-0.08728,0.95074,0.30226,-0.09603,0.94838,0.27636,-0.0978,0.95606,0.29782,-0.04331,0.95364,0.33039,0.04547,0.94275,0.30794,0.02895,0.95097,0.24554,0.02846,0.96897,0.25269,-0.06714,0.96522,0.22564,0.01832,0.97404,0.22009,0.07078,0.97291,0.22006,0.06425,0.97337,0.21296,0.07752,0.97398,0.21227,0.09167,0.9729,0.16928,0.14091,0.97544,0.17868,0.13709,0.97431,0.14386,0.16001,0.97658,0.11559,0.1722,0.97826,0.06279,0.20068,0.97764,0.0482,0.21295,0.97587,0.03927,0.21516,0.97579,0.06622,0.20729,0.97604,0.02541,0.21039,0.97729,-0.07321,0.20081,0.97689,-0.03607,0.2017,0.97878,-0.01761,0.20887,0.97778,-0.08653,0.1847,0.97898,-0.13761,0.16772,0.97618,-0.14246,0.16028,0.97674,-0.17194,0.13408,0.97594,-0.16361,0.14314,0.97608,-0.18999,0.11273,0.97529,-0.25469,0.01727,0.96687,-0.26319,0.01573,0.96462,-0.23144,0.0871,0.96894,-0.24105,0.04781,0.96934,-0.25386,0.02523,0.96691,-0.24967,-0.00821,0.9683,-0.24721,-0.02737,0.96858,-0.25374,-0.00364,0.96727,-0.24211,-0.03524,0.96961,-0.23404,-0.04097,0.97136,-0.242,-0.0439,0.96928,-0.2088,-0.09203,0.97362,-0.13293,-0.16649,0.97704,-0.10063,-0.20687,0.97318,-0.18065,-0.16327,0.9699,-0.17921,-0.15909,0.97086,-0.07316,-0.20841,0.9753,-0.02184,-0.23236,0.97238,-0.04182,-0.21854,0.97493,-0.09013,-0.20516,0.97457,-0.05418,-0.21622,0.97484,0.10544,-0.20561,0.97294,0.04501,-0.22282,0.97382,-0.02646,-0.22646,0.97366,0.12139,-0.17489,0.97708,0.18571,-0.14973,0.97113,0.16736,-0.16549,0.97191,0.1529,-0.17679,0.9723,0.16315,-0.15837,0.97381,0.21634,-0.1005,0.97113,0.23811,-0.07653,0.96822,0.23929,-0.05827,0.9692,0.23094,-0.06131,0.97103,0.23189,-0.04681,0.97161,0.24774,0.03575,0.96817,0.24554,0.02846,0.96897,0.24134,0.02724,0.97006,0.24963,-0.05941,0.96652,0.22165,0.01249,0.97505,0.21702,0.06195,0.9742,0.20293,0.07295,0.97647,0.21482,0.06599,0.97442,0.20613,0.07508,0.97564,0.16379,0.12841,0.9781,0.17091,0.12472,0.97736,0.1263,0.15035,0.98053,0.1093,0.16377,0.98042,0.08122,0.17537,0.98115,0.05909,0.19247,0.97952,0.02256,0.19555,0.98043,0.06254,0.19553,0.9787,0.01944,0.18746,0.98208,-0.09074,0.18891,0.97779,-0.03478,0.1917,0.98084,-0.01591,0.19524,0.98063,-0.07468,0.1728,0.98212,-0.12332,0.15801,0.97971,-0.14915,0.13687,0.9793,-0.16744,0.12495,0.97793,-0.15085,0.13609,0.97914,-0.18188,0.10028,0.97819,-0.24542,0.01613,0.96928,-0.25229,0.02415,0.96735,-0.22029,0.08338,0.97186,-0.23078,0.04814,0.97181,-0.23931,0.02191,0.9707,-0.23888,-0.01993,0.97085,-0.2438,-0.02367,0.96954,-0.24416,-0.00049,0.96974,-0.23005,-0.04852,0.97197,-0.23637,-0.04004,0.97084,-0.23801,-0.03251,0.97072,-0.20127,-0.0922,0.97519,-0.13511,-0.16856,0.97639,-0.12877,-0.19713,0.97188,-0.18939,-0.15595,0.96944,-0.16753,-0.16184,0.97249,-0.09584,-0.20094,0.9749,-0.0154,-0.23233,0.97251,-0.00595,-0.23941,0.9709,-0.11798,-0.21923,0.96851,-0.06763,-0.21706,0.97381,0.11339,-0.20701,0.97175,0.05291,-0.22863,0.97207,-0.01603,-0.22838,0.97344,0.11951,-0.17789,0.97677,0.17825,-0.16095,0.97073,0.16796,-0.16664,0.97161,0.16451,-0.16531,0.97242,0.16253,-0.16008,0.97363,0.20702,-0.10484,0.9727,0.23421,-0.06141,0.97025,0.2353,-0.04266,0.97099,0.23152,-0.0594,0.97101,0.22842,-0.05234,0.97216,0.2351,0.0432,0.97101,0.24134,0.02724,0.97006,0.26739,0.02779,0.96319,0.27256,-0.05187,0.96074,0.2463,0.00687,0.96917,0.23781,0.05952,0.96949,0.21684,0.08742,0.97228,0.24793,0.06243,0.96676,0.23892,0.06223,0.96904,0.18405,0.13041,0.97423,0.18102,0.13785,0.97377,0.13488,0.16052,0.97777,0.12724,0.17647,0.97605,0.11857,0.17643,0.97715,0.07902,0.19942,0.97672,0.00536,0.20741,0.97824,0.07196,0.2157,0.97381,0.0325,0.19615,0.98003,-0.12389,0.20048,0.97183,-0.06232,0.20856,0.97602,-0.02006,0.20924,0.97766,-0.07644,0.18842,0.97911,-0.13115,0.16864,0.97691,-0.18217,0.13357,0.97415,-0.19202,0.13222,0.97244,-0.16454,0.14546,0.97559,-0.20242,0.10118,0.97406,-0.26613,0.02078,0.96371,-0.27153,0.03487,0.9618,-0.23674,0.08513,0.96784,-0.24801,0.04926,0.9675,-0.25645,0.01999,0.96635,-0.26027,-0.02659,0.96517,-0.2686,-0.02207,0.963,-0.26288,-0.00151,0.96483,-0.25183,-0.057,0.96609,-0.2654,-0.04338,0.96316,-0.25783,-0.036,0.96552,-0.22205,-0.0991,0.96999,-0.17656,-0.16511,0.97034,-0.172,-0.19221,0.96616,-0.20159,-0.17236,0.96418,-0.1778,-0.18026,0.96741,-0.14026,-0.20857,0.9679,-0.03174,-0.24822,0.96818,0.01328,-0.27766,0.96059,-0.13426,-0.24961,0.95899,-0.06087,-0.23543,0.96998,0.13721,-0.2288,0.96376,0.0738,-0.25438,0.96429,-0.00038,-0.25125,0.96792,0.12018,-0.20474,0.97141,0.1841,-0.18482,0.96537,0.19639,-0.16917,0.96582,0.2008,-0.16373,0.96585,0.17876,-0.17671,0.96789,0.21874,-0.11276,0.96925,0.25993,-0.05086,0.96429,0.25974,-0.03522,0.96503,0.25695,-0.06749,0.96407,0.24702,-0.05338,0.96754,0.2536,0.05194,0.96591,0.26739,0.02779,0.96319,0.34542,0.03067,0.93795,0.34456,-0.04123,0.93786,0.32231,0.00249,0.94663,0.30829,0.06212,0.94926,0.28397,0.10927,0.95259,0.33727,0.06555,0.93912,0.32796,0.05301,0.9432,0.25963,0.13848,0.95573,0.23542,0.17442,0.95612,0.17606,0.20463,0.96287,0.19665,0.21833,0.95586,0.20746,0.20552,0.95641,0.12417,0.24098,0.96255,-0.00759,0.26467,0.96431,0.10739,0.2865,0.95204,0.06691,0.24164,0.96806,-0.19649,0.24289,0.94995,-0.14967,0.27168,0.95068,-0.03231,0.26804,0.96287,-0.1016,0.24565,0.96402,-0.183,0.20557,0.96138,-0.2723,0.14866,0.95066,-0.27413,0.15828,0.94858,-0.22647,0.17503,0.95816,-0.27307,0.11746,0.9548,-0.34005,0.02982,0.93994,-0.34743,0.04708,0.93653,-0.30632,0.09211,0.94746,-0.31761,0.05331,0.94672,-0.32431,0.03032,0.94547,-0.32559,-0.03371,0.94491,-0.34258,-0.03176,0.93895,-0.33302,0.00219,0.94292,-0.32075,-0.06295,0.94507,-0.33743,-0.05712,0.93962,-0.32797,-0.04816,0.94346,-0.29368,-0.11195,0.94933,-0.27201,-0.16121,0.9487,-0.25463,-0.19634,0.9469,-0.25591,-0.21144,0.94329,-0.23268,-0.22108,0.94709,-0.24323,-0.23716,0.94053,-0.07828,-0.28407,0.9556,0.05088,-0.3504,0.93522,-0.15986,-0.31821,0.93445,-0.05926,-0.28495,0.95671,0.20435,-0.28456,0.93663,0.13072,-0.31625,0.93963,0.03202,-0.31139,0.94974,0.13648,-0.26759,0.95382,0.22222,-0.23243,0.94689,0.27633,-0.1826,0.94356,0.29279,-0.17171,0.94063,0.2397,-0.21516,0.94671,0.27267,-0.13338,0.95282,0.33812,-0.04294,0.94012,0.33421,-0.04025,0.94164,0.32867,-0.07637,0.94135,0.31352,-0.04619,0.94846,0.32369,0.05834,0.94436,0.34542,0.03067,0.93795,0.26278,0.02564,0.96451,0.98034,-0.0298,-0.19506,0.20175,-0.00218,0.97944,0.20082,0.02317,0.97935,0.18783,0.04628,0.98111,0.96873,0.15979,-0.18981,0.22306,0.01335,0.97471,0.21068,0.04979,0.97629,0.17719,0.09377,0.9797,0.13037,0.12017,0.98416,0.12602,0.10039,0.98694,0.20322,0.10093,0.97392,0.14896,0.16445,0.97507,-0.02358,0.19046,0.98141,0.02605,0.09371,0.99526,0.15091,0.21476,0.96494,-0.24183,0.15856,0.95727,-0.05465,0.09625,0.99386,-0.0176,0.16997,0.98529,-0.09539,0.16662,0.9814,-0.18079,0.10133,0.97829,-0.21439,0.06011,0.9749,-0.15222,0.07138,0.98577,-0.15278,0.08942,0.98421,-0.19663,0.05994,0.97864,-0.22625,0.00361,0.97406,-0.18183,0.02384,0.98304,-0.19372,0.03478,0.98044,-0.19182,0.02156,0.98119,-0.19295,0.01494,0.9811,-0.21107,-0.02143,0.97724,-0.18106,-0.01253,0.98339,-0.20434,0.0037,0.97889,-0.20583,-0.02645,0.97823,-0.18844,-0.02856,0.98167,-0.20602,-0.0214,0.97831,-0.20348,-0.0455,0.97802,-0.19041,-0.05909,0.97993,-0.21468,-0.08561,0.97293,-0.16308,-0.10571,0.98093,-0.18487,-0.10876,0.97673,-0.19058,-0.1072,0.9758,-0.11094,-0.24166,0.964,0.05284,-0.18219,0.98184,-0.03781,-0.1195,0.99211,-0.06241,-0.2601,0.96356,0.18616,-0.15738,0.96983,0.08222,-0.13571,0.98733,0.05781,-0.17215,0.98337,0.09138,-0.17219,0.98082,0.16699,-0.13889,0.97613,0.21972,-0.07423,0.97274,0.16627,-0.07397,0.9833,0.15445,-0.09775,0.98315,0.21227,-0.05568,0.97562,0.20033,-0.01414,0.97963,0.19576,-0.01859,0.98048,0.18666,-0.03103,0.98193,0.20284,-0.01289,0.97913,0.20203,0.02192,0.97913,0.26278,0.02564,0.96451],"uv":[0.0,0.0,0.01667,0.0,0.03333,0.0,0.05,0.0,0.06667,0.0,0.08333,0.0,0.1,0.0,0.11667,0.0,0.13333,0.0,0.15,0.0,0.16667,0.0,0.18333,0.0,0.2,0.0,0.21667,0.0,0.23333,0.0,0.25,0.0,0.26667,0.0,0.28333,0.0,0.3,0.0,0.31667,0.0,0.33333,0.0,0.35,0.0,0.36667,0.0,0.38333,0.0,0.4,0.0,0.41667,0.0,0.43333,0.0,0.45,0.0,0.46667,0.0,0.48333,0.0,0.5,0.0,0.51667,0.0,0.53333,0.0,0.55,0.0,0.56667,0.0,0.58333,0.0,0.6,0.0,0.61667,0.0,0.63333,0.0,0.65,0.0,0.66667,0.0,0.68333,0.0,0.7,0.0,0.71667,0.0,0.73333,0.0,0.75,0.0,0.76667,0.0,0.78333,0.0,0.8,0.0,0.81667,0.0,0.83333,0.0,0.85,0.0,0.86667,0.0,0.88333,0.0,0.9,0.0,0.91667,0.0,0.93333,0.0,0.95,0.0,0.96667,0.0,0.98333,0.0,1.0,0.0,0.0,0.01786,0.01667,0.01786,0.03333,0.01786,0.05,0.01786,0.06667,0.01786,0.08333,0.01786,0.1,0.01786,0.11667,0.01786,0.13333,0.01786,0.15,0.01786,0.16667,0.01786,0.18333,0.01786,0.2,0.01786,0.21667,0.01786,0.23333,0.01786,0.25,0.01786,0.26667,0.01786,0.28333,0.01786,0.3,0.01786,0.31667,0.01786,0.33333,0.01786,0.35,0.01786,0.36667,0.01786,0.38333,0.01786,0.4,0.01786,0.41667,0.01786,0.43333,0.01786,0.45,0.01786,0.46667,0.01786,0.48333,0.01786,0.5,0.01786,0.51667,0.01786,0.53333,0.01786,0.55,0.01786,0.56667,0.01786,0.58333,0.01786,0.6,0.01786,0.61667,0.01786,0.63333,0.01786,0.65,0.01786,0.66667,0.01786,0.68333,0.01786,0.7,0.01786,0.71667,0.01786,0.73333,0.01786,0.75,0.01786,0.76667,0.01786,0.78333,0.01786,0.8,0.01786,0.81667,0.01786,0.83333,0.01786,0.85,0.01786,0.86667,0.01786,0.88333,0.01786,0.9,0.01786,0.91667,0.01786,0.93333,0.01786,0.95,0.01786,0.96667,0.01786,0.98333,0.01786,1.0,0.01786,0.0,0.03571,0.01667,0.03571,0.03333,0.03571,0.05,0.03571,0.06667,0.03571,0.08333,0.03571,0.1,0.03571,0.11667,0.03571,0.13333,0.03571,0.15,0.03571,0.16667,0.03571,0.18333,0.03571,0.2,0.03571,0.21667,0.03571,0.23333,0.03571,0.25,0.03571,0.26667,0.03571,0.28333,0.03571,0.3,0.03571,0.31667,0.03571,0.33333,0.03571,0.35,0.03571,0.36667,0.03571,0.38333,0.03571,0.4,0.03571,0.41667,0.03571,0.43333,0.03571,0.45,0.03571,0.46667,0.03571,0.48333,0.03571,0.5,0.03571,0.51667,0.03571,0.53333,0.03571,0.55,0.03571,0.56667,0.03571,0.58333,0.03571,0.6,0.03571,0.61667,0.03571,0.63333,0.03571,0.65,0.03571,0.66667,0.03571,0.68333,0.03571,0.7,0.03571,0.71667,0.03571,0.73333,0.03571,0.75,0.03571,0.76667,0.03571,0.78333,0.03571,0.8,0.03571,0.81667,0.03571,0.83333,0.03571,0.85,0.03571,0.86667,0.03571,0.88333,0.03571,0.9,0.03571,0.91667,0.03571,0.93333,0.03571,0.95,0.03571,0.96667,0.03571,0.98333,0.03571,1.0,0.03571,0.0,0.05357,0.01667,0.05357,0.03333,0.05357,0.05,0.05357,0.06667,0.05357,0.08333,0.05357,0.1,0.05357,0.11667,0.05357,0.13333,0.05357,0.15,0.05357,0.16667,0.05357,0.18333,0.05357,0.2,0.05357,0.21667,0.05357,0.23333,0.05357,0.25,0.05357,0.26667,0.05357,0.28333,0.05357,0.3,0.05357,0.31667,0.05357,0.33333,0.05357,0.35,0.05357,0.36667,0.05357,0.38333,0.05357,0.4,0.05357,0.41667,0.05357,0.43333,0.05357,0.45,0.05357,0.46667,0.05357,0.48333,0.05357,0.5,0.05357,0.51667,0.05357,0.53333,0.05357,0.55,0.05357,0.56667,0.05357,0.58333,0.05357,0.6,0.05357,0.61667,0.05357,0.63333,0.05357,0.65,0.05357,0.66667,0.05357,0.68333,0.05357,0.7,0.05357,0.71667,0.05357,0.73333,0.05357,0.75,0.05357,0.76667,0.05357,0.78333,0.05357,0.8,0.05357,0.81667,0.05357,0.83333,0.05357,0.85,0.05357,0.86667,0.05357,0.88333,0.05357,0.9,0.05357,0.91667,0.05357,0.93333,0.05357,0.95,0.05357,0.96667,0.05357,0.98333,0.05357,1.0,0.05357,0.0,0.07143,0.01667,0.07143,0.03333,0.07143,0.05,0.07143,0.06667,0.07143,0.08333,0.07143,0.1,0.07143,0.11667,0.07143,0.13333,0.07143,0.15,0.07143,0.16667,0.07143,0.18333,0.07143,0.2,0.07143,0.21667,0.07143,0.23333,0.07143,0.25,0.07143,0.26667,0.07143,0.28333,0.07143,0.3,0.07143,0.31667,0.07143,0.33333,0.07143,0.35,0.07143,0.36667,0.07143,0.38333,0.07143,0.4,0.07143,0.41667,0.07143,0.43333,0.07143,0.45,0.07143,0.46667,0.07143,0.48333,0.07143,0.5,0.07143,0.51667,0.07143,0.53333,0.07143,0.55,0.07143,0.56667,0.07143,0.58333,0.07143,0.6,0.07143,0.61667,0.07143,0.63333,0.07143,0.65,0.07143,0.66667,0.07143,0.68333,0.07143,0.7,0.07143,0.71667,0.07143,0.73333,0.07143,0.75,0.07143,0.76667,0.07143,0.78333,0.07143,0.8,0.07143,0.81667,0.07143,0.83333,0.07143,0.85,0.07143,0.86667,0.07143,0.88333,0.07143,0.9,0.07143,0.91667,0.07143,0.93333,0.07143,0.95,0.07143,0.96667,0.07143,0.98333,0.07143,1.0,0.07143,0.0,0.08929,0.01667,0.08929,0.03333,0.08929,0.05,0.08929,0.06667,0.08929,0.08333,0.08929,0.1,0.08929,0.11667,0.08929,0.13333,0.08929,0.15,0.08929,0.16667,0.08929,0.18333,0.08929,0.2,0.08929,0.21667,0.08929,0.23333,0.08929,0.25,0.08929,0.26667,0.08929,0.28333,0.08929,0.3,0.08929,0.31667,0.08929,0.33333,0.08929,0.35,0.08929,0.36667,0.08929,0.38333,0.08929,0.4,0.08929,0.41667,0.08929,0.43333,0.08929,0.45,0.08929,0.46667,0.08929,0.48333,0.08929,0.5,0.08929,0.51667,0.08929,0.53333,0.08929,0.55,0.08929,0.56667,0.08929,0.58333,0.08929,0.6,0.08929,0.61667,0.08929,0.63333,0.08929,0.65,0.08929,0.66667,0.08929,0.68333,0.08929,0.7,0.08929,0.71667,0.08929,0.73333,0.08929,0.75,0.08929,0.76667,0.08929,0.78333,0.08929,0.8,0.08929,0.81667,0.08929,0.83333,0.08929,0.85,0.08929,0.86667,0.08929,0.88333,0.08929,0.9,0.08929,0.91667,0.08929,0.93333,0.08929,0.95,0.08929,0.96667,0.08929,0.98333,0.08929,1.0,0.08929,0.0,0.10714,0.01667,0.10714,0.03333,0.10714,0.05,0.10714,0.06667,0.10714,0.08333,0.10714,0.1,0.10714,0.11667,0.10714,0.13333,0.10714,0.15,0.10714,0.16667,0.10714,0.18333,0.10714,0.2,0.10714,0.21667,0.10714,0.23333,0.10714,0.25,0.10714,0.26667,0.10714,0.28333,0.10714,0.3,0.10714,0.31667,0.10714,0.33333,0.10714,0.35,0.10714,0.36667,0.10714,0.38333,0.10714,0.4,0.10714,0.41667,0.10714,0.43333,0.10714,0.45,0.10714,0.46667,0.10714,0.48333,0.10714,0.5,0.10714,0.51667,0.10714,0.53333,0.10714,0.55,0.10714,0.56667,0.10714,0.58333,0.10714,0.6,0.10714,0.61667,0.10714,0.63333,0.10714,0.65,0.10714,0.66667,0.10714,0.68333,0.10714,0.7,0.10714,0.71667,0.10714,0.73333,0.10714,0.75,0.10714,0.76667,0.10714,0.78333,0.10714,0.8,0.10714,0.81667,0.10714,0.83333,0.10714,0.85,0.10714,0.86667,0.10714,0.88333,0.10714,0.9,0.10714,0.91667,0.10714,0.93333,0.10714,0.95,0.10714,0.96667,0.10714,0.98333,0.10714,1.0,0.10714,0.0,0.125,0.01667,0.125,0.03333,0.125,0.05,0.125,0.06667,0.125,0.08333,0.125,0.1,0.125,0.11667,0.125,0.13333,0.125,0.15,0.125,0.16667,0.125,0.18333,0.125,0.2,0.125,0.21667,0.125,0.23333,0.125,0.25,0.125,0.26667,0.125,0.28333,0.125,0.3,0.125,0.31667,0.125,0.33333,0.125,0.35,0.125,0.36667,0.125,0.38333,0.125,0.4,0.125,0.41667,0.125,0.43333,0.125,0.45,0.125,0.46667,0.125,0.48333,0.125,0.5,0.125,0.51667,0.125,0.53333,0.125,0.55,0.125,0.56667,0.125,0.58333,0.125,0.6,0.125,0.61667,0.125,0.63333,0.125,0.65,0.125,0.66667,0.125,0.68333,0.125,0.7,0.125,0.71667,0.125,0.73333,0.125,0.75,0.125,0.76667,0.125,0.78333,0.125,0.8,0.125,0.81667,0.125,0.83333,0.125,0.85,0.125,0.86667,0.125,0.88333,0.125,0.9,0.125,0.91667,0.125,0.93333,0.125,0.95,0.125,0.96667,0.125,0.98333,0.125,1.0,0.125,0.0,0.14286,0.01667,0.14286,0.03333,0.14286,0.05,0.14286,0.06667,0.14286,0.08333,0.14286,0.1,0.14286,0.11667,0.14286,0.13333,0.14286,0.15,0.14286,0.16667,0.14286,0.18333,0.14286,0.2,0.14286,0.21667,0.14286,0.23333,0.14286,0.25,0.14286,0.26667,0.14286,0.28333,0.14286,0.3,0.14286,0.31667,0.14286,0.33333,0.14286,0.35,0.14286,0.36667,0.14286,0.38333,0.14286,0.4,0.14286,0.41667,0.14286,0.43333,0.14286,0.45,0.14286,0.46667,0.14286,0.48333,0.14286,0.5,0.14286,0.51667,0.14286,0.53333,0.14286,0.55,0.14286,0.56667,0.14286,0.58333,0.14286,0.6,0.14286,0.61667,0.14286,0.63333,0.14286,0.65,0.14286,0.66667,0.14286,0.68333,0.14286,0.7,0.14286,0.71667,0.14286,0.73333,0.14286,0.75,0.14286,0.76667,0.14286,0.78333,0.14286,0.8,0.14286,0.81667,0.14286,0.83333,0.14286,0.85,0.14286,0.86667,0.14286,0.88333,0.14286,0.9,0.14286,0.91667,0.14286,0.93333,0.14286,0.95,0.14286,0.96667,0.14286,0.98333,0.14286,1.0,0.14286,0.0,0.16071,0.01667,0.16071,0.03333,0.16071,0.05,0.16071,0.06667,0.16071,0.08333,0.16071,0.1,0.16071,0.11667,0.16071,0.13333,0.16071,0.15,0.16071,0.16667,0.16071,0.18333,0.16071,0.2,0.16071,0.21667,0.16071,0.23333,0.16071,0.25,0.16071,0.26667,0.16071,0.28333,0.16071,0.3,0.16071,0.31667,0.16071,0.33333,0.16071,0.35,0.16071,0.36667,0.16071,0.38333,0.16071,0.4,0.16071,0.41667,0.16071,0.43333,0.16071,0.45,0.16071,0.46667,0.16071,0.48333,0.16071,0.5,0.16071,0.51667,0.16071,0.53333,0.16071,0.55,0.16071,0.56667,0.16071,0.58333,0.16071,0.6,0.16071,0.61667,0.16071,0.63333,0.16071,0.65,0.16071,0.66667,0.16071,0.68333,0.16071,0.7,0.16071,0.71667,0.16071,0.73333,0.16071,0.75,0.16071,0.76667,0.16071,0.78333,0.16071,0.8,0.16071,0.81667,0.16071,0.83333,0.16071,0.85,0.16071,0.86667,0.16071,0.88333,0.16071,0.9,0.16071,0.91667,0.16071,0.93333,0.16071,0.95,0.16071,0.96667,0.16071,0.98333,0.16071,1.0,0.16071,0.0,0.17857,0.01667,0.17857,0.03333,0.17857,0.05,0.17857,0.06667,0.17857,0.08333,0.17857,0.1,0.17857,0.11667,0.17857,0.13333,0.17857,0.15,0.17857,0.16667,0.17857,0.18333,0.17857,0.2,0.17857,0.21667,0.17857,0.23333,0.17857,0.25,0.17857,0.26667,0.17857,0.28333,0.17857,0.3,0.17857,0.31667,0.17857,0.33333,0.17857,0.35,0.17857,0.36667,0.17857,0.38333,0.17857,0.4,0.17857,0.41667,0.17857,0.43333,0.17857,0.45,0.17857,0.46667,0.17857,0.48333,0.17857,0.5,0.17857,0.51667,0.17857,0.53333,0.17857,0.55,0.17857,0.56667,0.17857,0.58333,0.17857,0.6,0.17857,0.61667,0.17857,0.63333,0.17857,0.65,0.17857,0.66667,0.17857,0.68333,0.17857,0.7,0.17857,0.71667,0.17857,0.73333,0.17857,0.75,0.17857,0.76667,0.17857,0.78333,0.17857,0.8,0.17857,0.81667,0.17857,0.83333,0.17857,0.85,0.17857,0.86667,0.17857,0.88333,0.17857,0.9,0.17857,0.91667,0.17857,0.93333,0.17857,0.95,0.17857,0.96667,0.17857,0.98333,0.17857,1.0,0.17857,0.0,0.19643,0.01667,0.19643,0.03333,0.19643,0.05,0.19643,0.06667,0.19643,0.08333,0.19643,0.1,0.19643,0.11667,0.19643,0.13333,0.19643,0.15,0.19643,0.16667,0.19643,0.18333,0.19643,0.2,0.19643,0.21667,0.19643,0.23333,0.19643,0.25,0.19643,0.26667,0.19643,0.28333,0.19643,0.3,0.19643,0.31667,0.19643,0.33333,0.19643,0.35,0.19643,0.36667,0.19643,0.38333,0.19643,0.4,0.19643,0.41667,0.19643,0.43333,0.19643,0.45,0.19643,0.46667,0.19643,0.48333,0.19643,0.5,0.19643,0.51667,0.19643,0.53333,0.19643,0.55,0.19643,0.56667,0.19643,0.58333,0.19643,0.6,0.19643,0.61667,0.19643,0.63333,0.19643,0.65,0.19643,0.66667,0.19643,0.68333,0.19643,0.7,0.19643,0.71667,0.19643,0.73333,0.19643,0.75,0.19643,0.76667,0.19643,0.78333,0.19643,0.8,0.19643,0.81667,0.19643,0.83333,0.19643,0.85,0.19643,0.86667,0.19643,0.88333,0.19643,0.9,0.19643,0.91667,0.19643,0.93333,0.19643,0.95,0.19643,0.96667,0.19643,0.98333,0.19643,1.0,0.19643,0.0,0.21429,0.01667,0.21429,0.03333,0.21429,0.05,0.21429,0.06667,0.21429,0.08333,0.21429,0.1,0.21429,0.11667,0.21429,0.13333,0.21429,0.15,0.21429,0.16667,0.21429,0.18333,0.21429,0.2,0.21429,0.21667,0.21429,0.23333,0.21429,0.25,0.21429,0.26667,0.21429,0.28333,0.21429,0.3,0.21429,0.31667,0.21429,0.33333,0.21429,0.35,0.21429,0.36667,0.21429,0.38333,0.21429,0.4,0.21429,0.41667,0.21429,0.43333,0.21429,0.45,0.21429,0.46667,0.21429,0.48333,0.21429,0.5,0.21429,0.51667,0.21429,0.53333,0.21429,0.55,0.21429,0.56667,0.21429,0.58333,0.21429,0.6,0.21429,0.61667,0.21429,0.63333,0.21429,0.65,0.21429,0.66667,0.21429,0.68333,0.21429,0.7,0.21429,0.71667,0.21429,0.73333,0.21429,0.75,0.21429,0.76667,0.21429,0.78333,0.21429,0.8,0.21429,0.81667,0.21429,0.83333,0.21429,0.85,0.21429,0.86667,0.21429,0.88333,0.21429,0.9,0.21429,0.91667,0.21429,0.93333,0.21429,0.95,0.21429,0.96667,0.21429,0.98333,0.21429,1.0,0.21429,0.0,0.23214,0.01667,0.23214,0.03333,0.23214,0.05,0.23214,0.06667,0.23214,0.08333,0.23214,0.1,0.23214,0.11667,0.23214,0.13333,0.23214,0.15,0.23214,0.16667,0.23214,0.18333,0.23214,0.2,0.23214,0.21667,0.23214,0.23333,0.23214,0.25,0.23214,0.26667,0.23214,0.28333,0.23214,0.3,0.23214,0.31667,0.23214,0.33333,0.23214,0.35,0.23214,0.36667,0.23214,0.38333,0.23214,0.4,0.23214,0.41667,0.23214,0.43333,0.23214,0.45,0.23214,0.46667,0.23214,0.48333,0.23214,0.5,0.23214,0.51667,0.23214,0.53333,0.23214,0.55,0.23214,0.56667,0.23214,0.58333,0.23214,0.6,0.23214,0.61667,0.23214,0.63333,0.23214,0.65,0.23214,0.66667,0.23214,0.68333,0.23214,0.7,0.23214,0.71667,0.23214,0.73333,0.23214,0.75,0.23214,0.76667,0.23214,0.78333,0.23214,0.8,0.23214,0.81667,0.23214,0.83333,0.23214,0.85,0.23214,0.86667,0.23214,0.88333,0.23214,0.9,0.23214,0.91667,0.23214,0.93333,0.23214,0.95,0.23214,0.96667,0.23214,0.98333,0.23214,1.0,0.23214,0.0,0.25,0.01667,0.25,0.03333,0.25,0.05,0.25,0.06667,0.25,0.08333,0.25,0.1,0.25,0.11667,0.25,0.13333,0.25,0.15,0.25,0.16667,0.25,0.18333,0.25,0.2,0.25,0.21667,0.25,0.23333,0.25,0.25,0.25,0.26667,0.25,0.28333,0.25,0.3,0.25,0.31667,0.25,0.33333,0.25,0.35,0.25,0.36667,0.25,0.38333,0.25,0.4,0.25,0.41667,0.25,0.43333,0.25,0.45,0.25,0.46667,0.25,0.48333,0.25,0.5,0.25,0.51667,0.25,0.53333,0.25,0.55,0.25,0.56667,0.25,0.58333,0.25,0.6,0.25,0.61667,0.25,0.63333,0.25,0.65,0.25,0.66667,0.25,0.68333,0.25,0.7,0.25,0.71667,0.25,0.73333,0.25,0.75,0.25,0.76667,0.25,0.78333,0.25,0.8,0.25,0.81667,0.25,0.83333,0.25,0.85,0.25,0.86667,0.25,0.88333,0.25,0.9,0.25,0.91667,0.25,0.93333,0.25,0.95,0.25,0.96667,0.25,0.98333,0.25,1.0,0.25,0.0,0.26786,0.01667,0.26786,0.03333,0.26786,0.05,0.26786,0.06667,0.26786,0.08333,0.26786,0.1,0.26786,0.11667,0.26786,0.13333,0.26786,0.15,0.26786,0.16667,0.26786,0.18333,0.26786,0.2,0.26786,0.21667,0.26786,0.23333,0.26786,0.25,0.26786,0.26667,0.26786,0.28333,0.26786,0.3,0.26786,0.31667,0.26786,0.33333,0.26786,0.35,0.26786,0.36667,0.26786,0.38333,0.26786,0.4,0.26786,0.41667,0.26786,0.43333,0.26786,0.45,0.26786,0.46667,0.26786,0.48333,0.26786,0.5,0.26786,0.51667,0.26786,0.53333,0.26786,0.55,0.26786,0.56667,0.26786,0.58333,0.26786,0.6,0.26786,0.61667,0.26786,0.63333,0.26786,0.65,0.26786,0.66667,0.26786,0.68333,0.26786,0.7,0.26786,0.71667,0.26786,0.73333,0.26786,0.75,0.26786,0.76667,0.26786,0.78333,0.26786,0.8,0.26786,0.81667,0.26786,0.83333,0.26786,0.85,0.26786,0.86667,0.26786,0.88333,0.26786,0.9,0.26786,0.91667,0.26786,0.93333,0.26786,0.95,0.26786,0.96667,0.26786,0.98333,0.26786,1.0,0.26786,0.0,0.28571,0.01667,0.28571,0.03333,0.28571,0.05,0.28571,0.06667,0.28571,0.08333,0.28571,0.1,0.28571,0.11667,0.28571,0.13333,0.28571,0.15,0.28571,0.16667,0.28571,0.18333,0.28571,0.2,0.28571,0.21667,0.28571,0.23333,0.28571,0.25,0.28571,0.26667,0.28571,0.28333,0.28571,0.3,0.28571,0.31667,0.28571,0.33333,0.28571,0.35,0.28571,0.36667,0.28571,0.38333,0.28571,0.4,0.28571,0.41667,0.28571,0.43333,0.28571,0.45,0.28571,0.46667,0.28571,0.48333,0.28571,0.5,0.28571,0.51667,0.28571,0.53333,0.28571,0.55,0.28571,0.56667,0.28571,0.58333,0.28571,0.6,0.28571,0.61667,0.28571,0.63333,0.28571,0.65,0.28571,0.66667,0.28571,0.68333,0.28571,0.7,0.28571,0.71667,0.28571,0.73333,0.28571,0.75,0.28571,0.76667,0.28571,0.78333,0.28571,0.8,0.28571,0.81667,0.28571,0.83333,0.28571,0.85,0.28571,0.86667,0.28571,0.88333,0.28571,0.9,0.28571,0.91667,0.28571,0.93333,0.28571,0.95,0.28571,0.96667,0.28571,0.98333,0.28571,1.0,0.28571,0.0,0.30357,0.01667,0.30357,0.03333,0.30357,0.05,0.30357,0.06667,0.30357,0.08333,0.30357,0.1,0.30357,0.11667,0.30357,0.13333,0.30357,0.15,0.30357,0.16667,0.30357,0.18333,0.30357,0.2,0.30357,0.21667,0.30357,0.23333,0.30357,0.25,0.30357,0.26667,0.30357,0.28333,0.30357,0.3,0.30357,0.31667,0.30357,0.33333,0.30357,0.35,0.30357,0.36667,0.30357,0.38333,0.30357,0.4,0.30357,0.41667,0.30357,0.43333,0.30357,0.45,0.30357,0.46667,0.30357,0.48333,0.30357,0.5,0.30357,0.51667,0.30357,0.53333,0.30357,0.55,0.30357,0.56667,0.30357,0.58333,0.30357,0.6,0.30357,0.61667,0.30357,0.63333,0.30357,0.65,0.30357,0.66667,0.30357,0.68333,0.30357,0.7,0.30357,0.71667,0.30357,0.73333,0.30357,0.75,0.30357,0.76667,0.30357,0.78333,0.30357,0.8,0.30357,0.81667,0.30357,0.83333,0.30357,0.85,0.30357,0.86667,0.30357,0.88333,0.30357,0.9,0.30357,0.91667,0.30357,0.93333,0.30357,0.95,0.30357,0.96667,0.30357,0.98333,0.30357,1.0,0.30357,0.0,0.32143,0.01667,0.32143,0.03333,0.32143,0.05,0.32143,0.06667,0.32143,0.08333,0.32143,0.1,0.32143,0.11667,0.32143,0.13333,0.32143,0.15,0.32143,0.16667,0.32143,0.18333,0.32143,0.2,0.32143,0.21667,0.32143,0.23333,0.32143,0.25,0.32143,0.26667,0.32143,0.28333,0.32143,0.3,0.32143,0.31667,0.32143,0.33333,0.32143,0.35,0.32143,0.36667,0.32143,0.38333,0.32143,0.4,0.32143,0.41667,0.32143,0.43333,0.32143,0.45,0.32143,0.46667,0.32143,0.48333,0.32143,0.5,0.32143,0.51667,0.32143,0.53333,0.32143,0.55,0.32143,0.56667,0.32143,0.58333,0.32143,0.6,0.32143,0.61667,0.32143,0.63333,0.32143,0.65,0.32143,0.66667,0.32143,0.68333,0.32143,0.7,0.32143,0.71667,0.32143,0.73333,0.32143,0.75,0.32143,0.76667,0.32143,0.78333,0.32143,0.8,0.32143,0.81667,0.32143,0.83333,0.32143,0.85,0.32143,0.86667,0.32143,0.88333,0.32143,0.9,0.32143,0.91667,0.32143,0.93333,0.32143,0.95,0.32143,0.96667,0.32143,0.98333,0.32143,1.0,0.32143,0.0,0.33929,0.01667,0.33929,0.03333,0.33929,0.05,0.33929,0.06667,0.33929,0.08333,0.33929,0.1,0.33929,0.11667,0.33929,0.13333,0.33929,0.15,0.33929,0.16667,0.33929,0.18333,0.33929,0.2,0.33929,0.21667,0.33929,0.23333,0.33929,0.25,0.33929,0.26667,0.33929,0.28333,0.33929,0.3,0.33929,0.31667,0.33929,0.33333,0.33929,0.35,0.33929,0.36667,0.33929,0.38333,0.33929,0.4,0.33929,0.41667,0.33929,0.43333,0.33929,0.45,0.33929,0.46667,0.33929,0.48333,0.33929,0.5,0.33929,0.51667,0.33929,0.53333,0.33929,0.55,0.33929,0.56667,0.33929,0.58333,0.33929,0.6,0.33929,0.61667,0.33929,0.63333,0.33929,0.65,0.33929,0.66667,0.33929,0.68333,0.33929,0.7,0.33929,0.71667,0.33929,0.73333,0.33929,0.75,0.33929,0.76667,0.33929,0.78333,0.33929,0.8,0.33929,0.81667,0.33929,0.83333,0.33929,0.85,0.33929,0.86667,0.33929,0.88333,0.33929,0.9,0.33929,0.91667,0.33929,0.93333,0.33929,0.95,0.33929,0.96667,0.33929,0.98333,0.33929,1.0,0.33929,0.0,0.35714,0.01667,0.35714,0.03333,0.35714,0.05,0.35714,0.06667,0.35714,0.08333,0.35714,0.1,0.35714,0.11667,0.35714,0.13333,0.35714,0.15,0.35714,0.16667,0.35714,0.18333,0.35714,0.2,0.35714,0.21667,0.35714,0.23333,0.35714,0.25,0.35714,0.26667,0.35714,0.28333,0.35714,0.3,0.35714,0.31667,0.35714,0.33333,0.35714,0.35,0.35714,0.36667,0.35714,0.38333,0.35714,0.4,0.35714,0.41667,0.35714,0.43333,0.35714,0.45,0.35714,0.46667,0.35714,0.48333,0.35714,0.5,0.35714,0.51667,0.35714,0.53333,0.35714,0.55,0.35714,0.56667,0.35714,0.58333,0.35714,0.6,0.35714,0.61667,0.35714,0.63333,0.35714,0.65,0.35714,0.66667,0.35714,0.68333,0.35714,0.7,0.35714,0.71667,0.35714,0.73333,0.35714,0.75,0.35714,0.76667,0.35714,0.78333,0.35714,0.8,0.35714,0.81667,0.35714,0.83333,0.35714,0.85,0.35714,0.86667,0.35714,0.88333,0.35714,0.9,0.35714,0.91667,0.35714,0.93333,0.35714,0.95,0.35714,0.96667,0.35714,0.98333,0.35714,1.0,0.35714,0.0,0.375,0.01667,0.375,0.03333,0.375,0.05,0.375,0.06667,0.375,0.08333,0.375,0.1,0.375,0.11667,0.375,0.13333,0.375,0.15,0.375,0.16667,0.375,0.18333,0.375,0.2,0.375,0.21667,0.375,0.23333,0.375,0.25,0.375,0.26667,0.375,0.28333,0.375,0.3,0.375,0.31667,0.375,0.33333,0.375,0.35,0.375,0.36667,0.375,0.38333,0.375,0.4,0.375,0.41667,0.375,0.43333,0.375,0.45,0.375,0.46667,0.375,0.48333,0.375,0.5,0.375,0.51667,0.375,0.53333,0.375,0.55,0.375,0.56667,0.375,0.58333,0.375,0.6,0.375,0.61667,0.375,0.63333,0.375,0.65,0.375,0.66667,0.375,0.68333,0.375,0.7,0.375,0.71667,0.375,0.73333,0.375,0.75,0.375,0.76667,0.375,0.78333,0.375,0.8,0.375,0.81667,0.375,0.83333,0.375,0.85,0.375,0.86667,0.375,0.88333,0.375,0.9,0.375,0.91667,0.375,0.93333,0.375,0.95,0.375,0.96667,0.375,0.98333,0.375,1.0,0.375,0.0,0.39286,0.01667,0.39286,0.03333,0.39286,0.05,0.39286,0.06667,0.39286,0.08333,0.39286,0.1,0.39286,0.11667,0.39286,0.13333,0.39286,0.15,0.39286,0.16667,0.39286,0.18333,0.39286,0.2,0.39286,0.21667,0.39286,0.23333,0.39286,0.25,0.39286,0.26667,0.39286,0.28333,0.39286,0.3,0.39286,0.31667,0.39286,0.33333,0.39286,0.35,0.39286,0.36667,0.39286,0.38333,0.39286,0.4,0.39286,0.41667,0.39286,0.43333,0.39286,0.45,0.39286,0.46667,0.39286,0.48333,0.39286,0.5,0.39286,0.51667,0.39286,0.53333,0.39286,0.55,0.39286,0.56667,0.39286,0.58333,0.39286,0.6,0.39286,0.61667,0.39286,0.63333,0.39286,0.65,0.39286,0.66667,0.39286,0.68333,0.39286,0.7,0.39286,0.71667,0.39286,0.73333,0.39286,0.75,0.39286,0.76667,0.39286,0.78333,0.39286,0.8,0.39286,0.81667,0.39286,0.83333,0.39286,0.85,0.39286,0.86667,0.39286,0.88333,0.39286,0.9,0.39286,0.91667,0.39286,0.93333,0.39286,0.95,0.39286,0.96667,0.39286,0.98333,0.39286,1.0,0.39286,0.0,0.41071,0.01667,0.41071,0.03333,0.41071,0.05,0.41071,0.06667,0.41071,0.08333,0.41071,0.1,0.41071,0.11667,0.41071,0.13333,0.41071,0.15,0.41071,0.16667,0.41071,0.18333,0.41071,0.2,0.41071,0.21667,0.41071,0.23333,0.41071,0.25,0.41071,0.26667,0.41071,0.28333,0.41071,0.3,0.41071,0.31667,0.41071,0.33333,0.41071,0.35,0.41071,0.36667,0.41071,0.38333,0.41071,0.4,0.41071,0.41667,0.41071,0.43333,0.41071,0.45,0.41071,0.46667,0.41071,0.48333,0.41071,0.5,0.41071,0.51667,0.41071,0.53333,0.41071,0.55,0.41071,0.56667,0.41071,0.58333,0.41071,0.6,0.41071,0.61667,0.41071,0.63333,0.41071,0.65,0.41071,0.66667,0.41071,0.68333,0.41071,0.7,0.41071,0.71667,0.41071,0.73333,0.41071,0.75,0.41071,0.76667,0.41071,0.78333,0.41071,0.8,0.41071,0.81667,0.41071,0.83333,0.41071,0.85,0.41071,0.86667,0.41071,0.88333,0.41071,0.9,0.41071,0.91667,0.41071,0.93333,0.41071,0.95,0.41071,0.96667,0.41071,0.98333,0.41071,1.0,0.41071,0.0,0.42857,0.01667,0.42857,0.03333,0.42857,0.05,0.42857,0.06667,0.42857,0.08333,0.42857,0.1,0.42857,0.11667,0.42857,0.13333,0.42857,0.15,0.42857,0.16667,0.42857,0.18333,0.42857,0.2,0.42857,0.21667,0.42857,0.23333,0.42857,0.25,0.42857,0.26667,0.42857,0.28333,0.42857,0.3,0.42857,0.31667,0.42857,0.33333,0.42857,0.35,0.42857,0.36667,0.42857,0.38333,0.42857,0.4,0.42857,0.41667,0.42857,0.43333,0.42857,0.45,0.42857,0.46667,0.42857,0.48333,0.42857,0.5,0.42857,0.51667,0.42857,0.53333,0.42857,0.55,0.42857,0.56667,0.42857,0.58333,0.42857,0.6,0.42857,0.61667,0.42857,0.63333,0.42857,0.65,0.42857,0.66667,0.42857,0.68333,0.42857,0.7,0.42857,0.71667,0.42857,0.73333,0.42857,0.75,0.42857,0.76667,0.42857,0.78333,0.42857,0.8,0.42857,0.81667,0.42857,0.83333,0.42857,0.85,0.42857,0.86667,0.42857,0.88333,0.42857,0.9,0.42857,0.91667,0.42857,0.93333,0.42857,0.95,0.42857,0.96667,0.42857,0.98333,0.42857,1.0,0.42857,0.0,0.44643,0.01667,0.44643,0.03333,0.44643,0.05,0.44643,0.06667,0.44643,0.08333,0.44643,0.1,0.44643,0.11667,0.44643,0.13333,0.44643,0.15,0.44643,0.16667,0.44643,0.18333,0.44643,0.2,0.44643,0.21667,0.44643,0.23333,0.44643,0.25,0.44643,0.26667,0.44643,0.28333,0.44643,0.3,0.44643,0.31667,0.44643,0.33333,0.44643,0.35,0.44643,0.36667,0.44643,0.38333,0.44643,0.4,0.44643,0.41667,0.44643,0.43333,0.44643,0.45,0.44643,0.46667,0.44643,0.48333,0.44643,0.5,0.44643,0.51667,0.44643,0.53333,0.44643,0.55,0.44643,0.56667,0.44643,0.58333,0.44643,0.6,0.44643,0.61667,0.44643,0.63333,0.44643,0.65,0.44643,0.66667,0.44643,0.68333,0.44643,0.7,0.44643,0.71667,0.44643,0.73333,0.44643,0.75,0.44643,0.76667,0.44643,0.78333,0.44643,0.8,0.44643,0.81667,0.44643,0.83333,0.44643,0.85,0.44643,0.86667,0.44643,0.88333,0.44643,0.9,0.44643,0.91667,0.44643,0.93333,0.44643,0.95,0.44643,0.96667,0.44643,0.98333,0.44643,1.0,0.44643,0.0,0.46429,0.01667,0.46429,0.03333,0.46429,0.05,0.46429,0.06667,0.46429,0.08333,0.46429,0.1,0.46429,0.11667,0.46429,0.13333,0.46429,0.15,0.46429,0.16667,0.46429,0.18333,0.46429,0.2,0.46429,0.21667,0.46429,0.23333,0.46429,0.25,0.46429,0.26667,0.46429,0.28333,0.46429,0.3,0.46429,0.31667,0.46429,0.33333,0.46429,0.35,0.46429,0.36667,0.46429,0.38333,0.46429,0.4,0.46429,0.41667,0.46429,0.43333,0.46429,0.45,0.46429,0.46667,0.46429,0.48333,0.46429,0.5,0.46429,0.51667,0.46429,0.53333,0.46429,0.55,0.46429,0.56667,0.46429,0.58333,0.46429,0.6,0.46429,0.61667,0.46429,0.63333,0.46429,0.65,0.46429,0.66667,0.46429,0.68333,0.46429,0.7,0.46429,0.71667,0.46429,0.73333,0.46429,0.75,0.46429,0.76667,0.46429,0.78333,0.46429,0.8,0.46429,0.81667,0.46429,0.83333,0.46429,0.85,0.46429,0.86667,0.46429,0.88333,0.46429,0.9,0.46429,0.91667,0.46429,0.93333,0.46429,0.95,0.46429,0.96667,0.46429,0.98333,0.46429,1.0,0.46429,0.0,0.48214,0.01667,0.48214,0.03333,0.48214,0.05,0.48214,0.06667,0.48214,0.08333,0.48214,0.1,0.48214,0.11667,0.48214,0.13333,0.48214,0.15,0.48214,0.16667,0.48214,0.18333,0.48214,0.2,0.48214,0.21667,0.48214,0.23333,0.48214,0.25,0.48214,0.26667,0.48214,0.28333,0.48214,0.3,0.48214,0.31667,0.48214,0.33333,0.48214,0.35,0.48214,0.36667,0.48214,0.38333,0.48214,0.4,0.48214,0.41667,0.48214,0.43333,0.48214,0.45,0.48214,0.46667,0.48214,0.48333,0.48214,0.5,0.48214,0.51667,0.48214,0.53333,0.48214,0.55,0.48214,0.56667,0.48214,0.58333,0.48214,0.6,0.48214,0.61667,0.48214,0.63333,0.48214,0.65,0.48214,0.66667,0.48214,0.68333,0.48214,0.7,0.48214,0.71667,0.48214,0.73333,0.48214,0.75,0.48214,0.76667,0.48214,0.78333,0.48214,0.8,0.48214,0.81667,0.48214,0.83333,0.48214,0.85,0.48214,0.86667,0.48214,0.88333,0.48214,0.9,0.48214,0.91667,0.48214,0.93333,0.48214,0.95,0.48214,0.96667,0.48214,0.98333,0.48214,1.0,0.48214,0.0,0.5,0.01667,0.5,0.03333,0.5,0.05,0.5,0.06667,0.5,0.08333,0.5,0.1,0.5,0.11667,0.5,0.13333,0.5,0.15,0.5,0.16667,0.5,0.18333,0.5,0.2,0.5,0.21667,0.5,0.23333,0.5,0.25,0.5,0.26667,0.5,0.28333,0.5,0.3,0.5,0.31667,0.5,0.33333,0.5,0.35,0.5,0.36667,0.5,0.38333,0.5,0.4,0.5,0.41667,0.5,0.43333,0.5,0.45,0.5,0.46667,0.5,0.48333,0.5,0.5,0.5,0.51667,0.5,0.53333,0.5,0.55,0.5,0.56667,0.5,0.58333,0.5,0.6,0.5,0.61667,0.5,0.63333,0.5,0.65,0.5,0.66667,0.5,0.68333,0.5,0.7,0.5,0.71667,0.5,0.73333,0.5,0.75,0.5,0.76667,0.5,0.78333,0.5,0.8,0.5,0.81667,0.5,0.83333,0.5,0.85,0.5,0.86667,0.5,0.88333,0.5,0.9,0.5,0.91667,0.5,0.93333,0.5,0.95,0.5,0.96667,0.5,0.98333,0.5,1.0,0.5,0.0,0.51786,0.01667,0.51786,0.03333,0.51786,0.05,0.51786,0.06667,0.51786,0.08333,0.51786,0.1,0.51786,0.11667,0.51786,0.13333,0.51786,0.15,0.51786,0.16667,0.51786,0.18333,0.51786,0.2,0.51786,0.21667,0.51786,0.23333,0.51786,0.25,0.51786,0.26667,0.51786,0.28333,0.51786,0.3,0.51786,0.31667,0.51786,0.33333,0.51786,0.35,0.51786,0.36667,0.51786,0.38333,0.51786,0.4,0.51786,0.41667,0.51786,0.43333,0.51786,0.45,0.51786,0.46667,0.51786,0.48333,0.51786,0.5,0.51786,0.51667,0.51786,0.53333,0.51786,0.55,0.51786,0.56667,0.51786,0.58333,0.51786,0.6,0.51786,0.61667,0.51786,0.63333,0.51786,0.65,0.51786,0.66667,0.51786,0.68333,0.51786,0.7,0.51786,0.71667,0.51786,0.73333,0.51786,0.75,0.51786,0.76667,0.51786,0.78333,0.51786,0.8,0.51786,0.81667,0.51786,0.83333,0.51786,0.85,0.51786,0.86667,0.51786,0.88333,0.51786,0.9,0.51786,0.91667,0.51786,0.93333,0.51786,0.95,0.51786,0.96667,0.51786,0.98333,0.51786,1.0,0.51786,0.0,0.53571,0.01667,0.53571,0.03333,0.53571,0.05,0.53571,0.06667,0.53571,0.08333,0.53571,0.1,0.53571,0.11667,0.53571,0.13333,0.53571,0.15,0.53571,0.16667,0.53571,0.18333,0.53571,0.2,0.53571,0.21667,0.53571,0.23333,0.53571,0.25,0.53571,0.26667,0.53571,0.28333,0.53571,0.3,0.53571,0.31667,0.53571,0.33333,0.53571,0.35,0.53571,0.36667,0.53571,0.38333,0.53571,0.4,0.53571,0.41667,0.53571,0.43333,0.53571,0.45,0.53571,0.46667,0.53571,0.48333,0.53571,0.5,0.53571,0.51667,0.53571,0.53333,0.53571,0.55,0.53571,0.56667,0.53571,0.58333,0.53571,0.6,0.53571,0.61667,0.53571,0.63333,0.53571,0.65,0.53571,0.66667,0.53571,0.68333,0.53571,0.7,0.53571,0.71667,0.53571,0.73333,0.53571,0.75,0.53571,0.76667,0.53571,0.78333,0.53571,0.8,0.53571,0.81667,0.53571,0.83333,0.53571,0.85,0.53571,0.86667,0.53571,0.88333,0.53571,0.9,0.53571,0.91667,0.53571,0.93333,0.53571,0.95,0.53571,0.96667,0.53571,0.98333,0.53571,1.0,0.53571,0.0,0.55357,0.01667,0.55357,0.03333,0.55357,0.05,0.55357,0.06667,0.55357,0.08333,0.55357,0.1,0.55357,0.11667,0.55357,0.13333,0.55357,0.15,0.55357,0.16667,0.55357,0.18333,0.55357,0.2,0.55357,0.21667,0.55357,0.23333,0.55357,0.25,0.55357,0.26667,0.55357,0.28333,0.55357,0.3,0.55357,0.31667,0.55357,0.33333,0.55357,0.35,0.55357,0.36667,0.55357,0.38333,0.55357,0.4,0.55357,0.41667,0.55357,0.43333,0.55357,0.45,0.55357,0.46667,0.55357,0.48333,0.55357,0.5,0.55357,0.51667,0.55357,0.53333,0.55357,0.55,0.55357,0.56667,0.55357,0.58333,0.55357,0.6,0.55357,0.61667,0.55357,0.63333,0.55357,0.65,0.55357,0.66667,0.55357,0.68333,0.55357,0.7,0.55357,0.71667,0.55357,0.73333,0.55357,0.75,0.55357,0.76667,0.55357,0.78333,0.55357,0.8,0.55357,0.81667,0.55357,0.83333,0.55357,0.85,0.55357,0.86667,0.55357,0.88333,0.55357,0.9,0.55357,0.91667,0.55357,0.93333,0.55357,0.95,0.55357,0.96667,0.55357,0.98333,0.55357,1.0,0.55357,0.0,0.57143,0.01667,0.57143,0.03333,0.57143,0.05,0.57143,0.06667,0.57143,0.08333,0.57143,0.1,0.57143,0.11667,0.57143,0.13333,0.57143,0.15,0.57143,0.16667,0.57143,0.18333,0.57143,0.2,0.57143,0.21667,0.57143,0.23333,0.57143,0.25,0.57143,0.26667,0.57143,0.28333,0.57143,0.3,0.57143,0.31667,0.57143,0.33333,0.57143,0.35,0.57143,0.36667,0.57143,0.38333,0.57143,0.4,0.57143,0.41667,0.57143,0.43333,0.57143,0.45,0.57143,0.46667,0.57143,0.48333,0.57143,0.5,0.57143,0.51667,0.57143,0.53333,0.57143,0.55,0.57143,0.56667,0.57143,0.58333,0.57143,0.6,0.57143,0.61667,0.57143,0.63333,0.57143,0.65,0.57143,0.66667,0.57143,0.68333,0.57143,0.7,0.57143,0.71667,0.57143,0.73333,0.57143,0.75,0.57143,0.76667,0.57143,0.78333,0.57143,0.8,0.57143,0.81667,0.57143,0.83333,0.57143,0.85,0.57143,0.86667,0.57143,0.88333,0.57143,0.9,0.57143,0.91667,0.57143,0.93333,0.57143,0.95,0.57143,0.96667,0.57143,0.98333,0.57143,1.0,0.57143,0.0,0.58929,0.01667,0.58929,0.03333,0.58929,0.05,0.58929,0.06667,0.58929,0.08333,0.58929,0.1,0.58929,0.11667,0.58929,0.13333,0.58929,0.15,0.58929,0.16667,0.58929,0.18333,0.58929,0.2,0.58929,0.21667,0.58929,0.23333,0.58929,0.25,0.58929,0.26667,0.58929,0.28333,0.58929,0.3,0.58929,0.31667,0.58929,0.33333,0.58929,0.35,0.58929,0.36667,0.58929,0.38333,0.58929,0.4,0.58929,0.41667,0.58929,0.43333,0.58929,0.45,0.58929,0.46667,0.58929,0.48333,0.58929,0.5,0.58929,0.51667,0.58929,0.53333,0.58929,0.55,0.58929,0.56667,0.58929,0.58333,0.58929,0.6,0.58929,0.61667,0.58929,0.63333,0.58929,0.65,0.58929,0.66667,0.58929,0.68333,0.58929,0.7,0.58929,0.71667,0.58929,0.73333,0.58929,0.75,0.58929,0.76667,0.58929,0.78333,0.58929,0.8,0.58929,0.81667,0.58929,0.83333,0.58929,0.85,0.58929,0.86667,0.58929,0.88333,0.58929,0.9,0.58929,0.91667,0.58929,0.93333,0.58929,0.95,0.58929,0.96667,0.58929,0.98333,0.58929,1.0,0.58929,0.0,0.60714,0.01667,0.60714,0.03333,0.60714,0.05,0.60714,0.06667,0.60714,0.08333,0.60714,0.1,0.60714,0.11667,0.60714,0.13333,0.60714,0.15,0.60714,0.16667,0.60714,0.18333,0.60714,0.2,0.60714,0.21667,0.60714,0.23333,0.60714,0.25,0.60714,0.26667,0.60714,0.28333,0.60714,0.3,0.60714,0.31667,0.60714,0.33333,0.60714,0.35,0.60714,0.36667,0.60714,0.38333,0.60714,0.4,0.60714,0.41667,0.60714,0.43333,0.60714,0.45,0.60714,0.46667,0.60714,0.48333,0.60714,0.5,0.60714,0.51667,0.60714,0.53333,0.60714,0.55,0.60714,0.56667,0.60714,0.58333,0.60714,0.6,0.60714,0.61667,0.60714,0.63333,0.60714,0.65,0.60714,0.66667,0.60714,0.68333,0.60714,0.7,0.60714,0.71667,0.60714,0.73333,0.60714,0.75,0.60714,0.76667,0.60714,0.78333,0.60714,0.8,0.60714,0.81667,0.60714,0.83333,0.60714,0.85,0.60714,0.86667,0.60714,0.88333,0.60714,0.9,0.60714,0.91667,0.60714,0.93333,0.60714,0.95,0.60714,0.96667,0.60714,0.98333,0.60714,1.0,0.60714,0.0,0.625,0.01667,0.625,0.03333,0.625,0.05,0.625,0.06667,0.625,0.08333,0.625,0.1,0.625,0.11667,0.625,0.13333,0.625,0.15,0.625,0.16667,0.625,0.18333,0.625,0.2,0.625,0.21667,0.625,0.23333,0.625,0.25,0.625,0.26667,0.625,0.28333,0.625,0.3,0.625,0.31667,0.625,0.33333,0.625,0.35,0.625,0.36667,0.625,0.38333,0.625,0.4,0.625,0.41667,0.625,0.43333,0.625,0.45,0.625,0.46667,0.625,0.48333,0.625,0.5,0.625,0.51667,0.625,0.53333,0.625,0.55,0.625,0.56667,0.625,0.58333,0.625,0.6,0.625,0.61667,0.625,0.63333,0.625,0.65,0.625,0.66667,0.625,0.68333,0.625,0.7,0.625,0.71667,0.625,0.73333,0.625,0.75,0.625,0.76667,0.625,0.78333,0.625,0.8,0.625,0.81667,0.625,0.83333,0.625,0.85,0.625,0.86667,0.625,0.88333,0.625,0.9,0.625,0.91667,0.625,0.93333,0.625,0.95,0.625,0.96667,0.625,0.98333,0.625,1.0,0.625,0.0,0.64286,0.01667,0.64286,0.03333,0.64286,0.05,0.64286,0.06667,0.64286,0.08333,0.64286,0.1,0.64286,0.11667,0.64286,0.13333,0.64286,0.15,0.64286,0.16667,0.64286,0.18333,0.64286,0.2,0.64286,0.21667,0.64286,0.23333,0.64286,0.25,0.64286,0.26667,0.64286,0.28333,0.64286,0.3,0.64286,0.31667,0.64286,0.33333,0.64286,0.35,0.64286,0.36667,0.64286,0.38333,0.64286,0.4,0.64286,0.41667,0.64286,0.43333,0.64286,0.45,0.64286,0.46667,0.64286,0.48333,0.64286,0.5,0.64286,0.51667,0.64286,0.53333,0.64286,0.55,0.64286,0.56667,0.64286,0.58333,0.64286,0.6,0.64286,0.61667,0.64286,0.63333,0.64286,0.65,0.64286,0.66667,0.64286,0.68333,0.64286,0.7,0.64286,0.71667,0.64286,0.73333,0.64286,0.75,0.64286,0.76667,0.64286,0.78333,0.64286,0.8,0.64286,0.81667,0.64286,0.83333,0.64286,0.85,0.64286,0.86667,0.64286,0.88333,0.64286,0.9,0.64286,0.91667,0.64286,0.93333,0.64286,0.95,0.64286,0.96667,0.64286,0.98333,0.64286,1.0,0.64286,0.0,0.66071,0.01667,0.66071,0.03333,0.66071,0.05,0.66071,0.06667,0.66071,0.08333,0.66071,0.1,0.66071,0.11667,0.66071,0.13333,0.66071,0.15,0.66071,0.16667,0.66071,0.18333,0.66071,0.2,0.66071,0.21667,0.66071,0.23333,0.66071,0.25,0.66071,0.26667,0.66071,0.28333,0.66071,0.3,0.66071,0.31667,0.66071,0.33333,0.66071,0.35,0.66071,0.36667,0.66071,0.38333,0.66071,0.4,0.66071,0.41667,0.66071,0.43333,0.66071,0.45,0.66071,0.46667,0.66071,0.48333,0.66071,0.5,0.66071,0.51667,0.66071,0.53333,0.66071,0.55,0.66071,0.56667,0.66071,0.58333,0.66071,0.6,0.66071,0.61667,0.66071,0.63333,0.66071,0.65,0.66071,0.66667,0.66071,0.68333,0.66071,0.7,0.66071,0.71667,0.66071,0.73333,0.66071,0.75,0.66071,0.76667,0.66071,0.78333,0.66071,0.8,0.66071,0.81667,0.66071,0.83333,0.66071,0.85,0.66071,0.86667,0.66071,0.88333,0.66071,0.9,0.66071,0.91667,0.66071,0.93333,0.66071,0.95,0.66071,0.96667,0.66071,0.98333,0.66071,1.0,0.66071,0.0,0.67857,0.01667,0.67857,0.03333,0.67857,0.05,0.67857,0.06667,0.67857,0.08333,0.67857,0.1,0.67857,0.11667,0.67857,0.13333,0.67857,0.15,0.67857,0.16667,0.67857,0.18333,0.67857,0.2,0.67857,0.21667,0.67857,0.23333,0.67857,0.25,0.67857,0.26667,0.67857,0.28333,0.67857,0.3,0.67857,0.31667,0.67857,0.33333,0.67857,0.35,0.67857,0.36667,0.67857,0.38333,0.67857,0.4,0.67857,0.41667,0.67857,0.43333,0.67857,0.45,0.67857,0.46667,0.67857,0.48333,0.67857,0.5,0.67857,0.51667,0.67857,0.53333,0.67857,0.55,0.67857,0.56667,0.67857,0.58333,0.67857,0.6,0.67857,0.61667,0.67857,0.63333,0.67857,0.65,0.67857,0.66667,0.67857,0.68333,0.67857,0.7,0.67857,0.71667,0.67857,0.73333,0.67857,0.75,0.67857,0.76667,0.67857,0.78333,0.67857,0.8,0.67857,0.81667,0.67857,0.83333,0.67857,0.85,0.67857,0.86667,0.67857,0.88333,0.67857,0.9,0.67857,0.91667,0.67857,0.93333,0.67857,0.95,0.67857,0.96667,0.67857,0.98333,0.67857,1.0,0.67857,0.0,0.69643,0.01667,0.69643,0.03333,0.69643,0.05,0.69643,0.06667,0.69643,0.08333,0.69643,0.1,0.69643,0.11667,0.69643,0.13333,0.69643,0.15,0.69643,0.16667,0.69643,0.18333,0.69643,0.2,0.69643,0.21667,0.69643,0.23333,0.69643,0.25,0.69643,0.26667,0.69643,0.28333,0.69643,0.3,0.69643,0.31667,0.69643,0.33333,0.69643,0.35,0.69643,0.36667,0.69643,0.38333,0.69643,0.4,0.69643,0.41667,0.69643,0.43333,0.69643,0.45,0.69643,0.46667,0.69643,0.48333,0.69643,0.5,0.69643,0.51667,0.69643,0.53333,0.69643,0.55,0.69643,0.56667,0.69643,0.58333,0.69643,0.6,0.69643,0.61667,0.69643,0.63333,0.69643,0.65,0.69643,0.66667,0.69643,0.68333,0.69643,0.7,0.69643,0.71667,0.69643,0.73333,0.69643,0.75,0.69643,0.76667,0.69643,0.78333,0.69643,0.8,0.69643,0.81667,0.69643,0.83333,0.69643,0.85,0.69643,0.86667,0.69643,0.88333,0.69643,0.9,0.69643,0.91667,0.69643,0.93333,0.69643,0.95,0.69643,0.96667,0.69643,0.98333,0.69643,1.0,0.69643,0.0,0.71429,0.01667,0.71429,0.03333,0.71429,0.05,0.71429,0.06667,0.71429,0.08333,0.71429,0.1,0.71429,0.11667,0.71429,0.13333,0.71429,0.15,0.71429,0.16667,0.71429,0.18333,0.71429,0.2,0.71429,0.21667,0.71429,0.23333,0.71429,0.25,0.71429,0.26667,0.71429,0.28333,0.71429,0.3,0.71429,0.31667,0.71429,0.33333,0.71429,0.35,0.71429,0.36667,0.71429,0.38333,0.71429,0.4,0.71429,0.41667,0.71429,0.43333,0.71429,0.45,0.71429,0.46667,0.71429,0.48333,0.71429,0.5,0.71429,0.51667,0.71429,0.53333,0.71429,0.55,0.71429,0.56667,0.71429,0.58333,0.71429,0.6,0.71429,0.61667,0.71429,0.63333,0.71429,0.65,0.71429,0.66667,0.71429,0.68333,0.71429,0.7,0.71429,0.71667,0.71429,0.73333,0.71429,0.75,0.71429,0.76667,0.71429,0.78333,0.71429,0.8,0.71429,0.81667,0.71429,0.83333,0.71429,0.85,0.71429,0.86667,0.71429,0.88333,0.71429,0.9,0.71429,0.91667,0.71429,0.93333,0.71429,0.95,0.71429,0.96667,0.71429,0.98333,0.71429,1.0,0.71429,0.0,0.73214,0.01667,0.73214,0.03333,0.73214,0.05,0.73214,0.06667,0.73214,0.08333,0.73214,0.1,0.73214,0.11667,0.73214,0.13333,0.73214,0.15,0.73214,0.16667,0.73214,0.18333,0.73214,0.2,0.73214,0.21667,0.73214,0.23333,0.73214,0.25,0.73214,0.26667,0.73214,0.28333,0.73214,0.3,0.73214,0.31667,0.73214,0.33333,0.73214,0.35,0.73214,0.36667,0.73214,0.38333,0.73214,0.4,0.73214,0.41667,0.73214,0.43333,0.73214,0.45,0.73214,0.46667,0.73214,0.48333,0.73214,0.5,0.73214,0.51667,0.73214,0.53333,0.73214,0.55,0.73214,0.56667,0.73214,0.58333,0.73214,0.6,0.73214,0.61667,0.73214,0.63333,0.73214,0.65,0.73214,0.66667,0.73214,0.68333,0.73214,0.7,0.73214,0.71667,0.73214,0.73333,0.73214,0.75,0.73214,0.76667,0.73214,0.78333,0.73214,0.8,0.73214,0.81667,0.73214,0.83333,0.73214,0.85,0.73214,0.86667,0.73214,0.88333,0.73214,0.9,0.73214,0.91667,0.73214,0.93333,0.73214,0.95,0.73214,0.96667,0.73214,0.98333,0.73214,1.0,0.73214,0.0,0.75,0.01667,0.75,0.03333,0.75,0.05,0.75,0.06667,0.75,0.08333,0.75,0.1,0.75,0.11667,0.75,0.13333,0.75,0.15,0.75,0.16667,0.75,0.18333,0.75,0.2,0.75,0.21667,0.75,0.23333,0.75,0.25,0.75,0.26667,0.75,0.28333,0.75,0.3,0.75,0.31667,0.75,0.33333,0.75,0.35,0.75,0.36667,0.75,0.38333,0.75,0.4,0.75,0.41667,0.75,0.43333,0.75,0.45,0.75,0.46667,0.75,0.48333,0.75,0.5,0.75,0.51667,0.75,0.53333,0.75,0.55,0.75,0.56667,0.75,0.58333,0.75,0.6,0.75,0.61667,0.75,0.63333,0.75,0.65,0.75,0.66667,0.75,0.68333,0.75,0.7,0.75,0.71667,0.75,0.73333,0.75,0.75,0.75,0.76667,0.75,0.78333,0.75,0.8,0.75,0.81667,0.75,0.83333,0.75,0.85,0.75,0.86667,0.75,0.88333,0.75,0.9,0.75,0.91667,0.75,0.93333,0.75,0.95,0.75,0.96667,0.75,0.98333,0.75,1.0,0.75,0.0,0.76786,0.01667,0.76786,0.03333,0.76786,0.05,0.76786,0.06667,0.76786,0.08333,0.76786,0.1,0.76786,0.11667,0.76786,0.13333,0.76786,0.15,0.76786,0.16667,0.76786,0.18333,0.76786,0.2,0.76786,0.21667,0.76786,0.23333,0.76786,0.25,0.76786,0.26667,0.76786,0.28333,0.76786,0.3,0.76786,0.31667,0.76786,0.33333,0.76786,0.35,0.76786,0.36667,0.76786,0.38333,0.76786,0.4,0.76786,0.41667,0.76786,0.43333,0.76786,0.45,0.76786,0.46667,0.76786,0.48333,0.76786,0.5,0.76786,0.51667,0.76786,0.53333,0.76786,0.55,0.76786,0.56667,0.76786,0.58333,0.76786,0.6,0.76786,0.61667,0.76786,0.63333,0.76786,0.65,0.76786,0.66667,0.76786,0.68333,0.76786,0.7,0.76786,0.71667,0.76786,0.73333,0.76786,0.75,0.76786,0.76667,0.76786,0.78333,0.76786,0.8,0.76786,0.81667,0.76786,0.83333,0.76786,0.85,0.76786,0.86667,0.76786,0.88333,0.76786,0.9,0.76786,0.91667,0.76786,0.93333,0.76786,0.95,0.76786,0.96667,0.76786,0.98333,0.76786,1.0,0.76786,0.0,0.78571,0.01667,0.78571,0.03333,0.78571,0.05,0.78571,0.06667,0.78571,0.08333,0.78571,0.1,0.78571,0.11667,0.78571,0.13333,0.78571,0.15,0.78571,0.16667,0.78571,0.18333,0.78571,0.2,0.78571,0.21667,0.78571,0.23333,0.78571,0.25,0.78571,0.26667,0.78571,0.28333,0.78571,0.3,0.78571,0.31667,0.78571,0.33333,0.78571,0.35,0.78571,0.36667,0.78571,0.38333,0.78571,0.4,0.78571,0.41667,0.78571,0.43333,0.78571,0.45,0.78571,0.46667,0.78571,0.48333,0.78571,0.5,0.78571,0.51667,0.78571,0.53333,0.78571,0.55,0.78571,0.56667,0.78571,0.58333,0.78571,0.6,0.78571,0.61667,0.78571,0.63333,0.78571,0.65,0.78571,0.66667,0.78571,0.68333,0.78571,0.7,0.78571,0.71667,0.78571,0.73333,0.78571,0.75,0.78571,0.76667,0.78571,0.78333,0.78571,0.8,0.78571,0.81667,0.78571,0.83333,0.78571,0.85,0.78571,0.86667,0.78571,0.88333,0.78571,0.9,0.78571,0.91667,0.78571,0.93333,0.78571,0.95,0.78571,0.96667,0.78571,0.98333,0.78571,1.0,0.78571,0.0,0.80357,0.01667,0.80357,0.03333,0.80357,0.05,0.80357,0.06667,0.80357,0.08333,0.80357,0.1,0.80357,0.11667,0.80357,0.13333,0.80357,0.15,0.80357,0.16667,0.80357,0.18333,0.80357,0.2,0.80357,0.21667,0.80357,0.23333,0.80357,0.25,0.80357,0.26667,0.80357,0.28333,0.80357,0.3,0.80357,0.31667,0.80357,0.33333,0.80357,0.35,0.80357,0.36667,0.80357,0.38333,0.80357,0.4,0.80357,0.41667,0.80357,0.43333,0.80357,0.45,0.80357,0.46667,0.80357,0.48333,0.80357,0.5,0.80357,0.51667,0.80357,0.53333,0.80357,0.55,0.80357,0.56667,0.80357,0.58333,0.80357,0.6,0.80357,0.61667,0.80357,0.63333,0.80357,0.65,0.80357,0.66667,0.80357,0.68333,0.80357,0.7,0.80357,0.71667,0.80357,0.73333,0.80357,0.75,0.80357,0.76667,0.80357,0.78333,0.80357,0.8,0.80357,0.81667,0.80357,0.83333,0.80357,0.85,0.80357,0.86667,0.80357,0.88333,0.80357,0.9,0.80357,0.91667,0.80357,0.93333,0.80357,0.95,0.80357,0.96667,0.80357,0.98333,0.80357,1.0,0.80357,0.0,0.82143,0.01667,0.82143,0.03333,0.82143,0.05,0.82143,0.06667,0.82143,0.08333,0.82143,0.1,0.82143,0.11667,0.82143,0.13333,0.82143,0.15,0.82143,0.16667,0.82143,0.18333,0.82143,0.2,0.82143,0.21667,0.82143,0.23333,0.82143,0.25,0.82143,0.26667,0.82143,0.28333,0.82143,0.3,0.82143,0.31667,0.82143,0.33333,0.82143,0.35,0.82143,0.36667,0.82143,0.38333,0.82143,0.4,0.82143,0.41667,0.82143,0.43333,0.82143,0.45,0.82143,0.46667,0.82143,0.48333,0.82143,0.5,0.82143,0.51667,0.82143,0.53333,0.82143,0.55,0.82143,0.56667,0.82143,0.58333,0.82143,0.6,0.82143,0.61667,0.82143,0.63333,0.82143,0.65,0.82143,0.66667,0.82143,0.68333,0.82143,0.7,0.82143,0.71667,0.82143,0.73333,0.82143,0.75,0.82143,0.76667,0.82143,0.78333,0.82143,0.8,0.82143,0.81667,0.82143,0.83333,0.82143,0.85,0.82143,0.86667,0.82143,0.88333,0.82143,0.9,0.82143,0.91667,0.82143,0.93333,0.82143,0.95,0.82143,0.96667,0.82143,0.98333,0.82143,1.0,0.82143,0.0,0.83929,0.01667,0.83929,0.03333,0.83929,0.05,0.83929,0.06667,0.83929,0.08333,0.83929,0.1,0.83929,0.11667,0.83929,0.13333,0.83929,0.15,0.83929,0.16667,0.83929,0.18333,0.83929,0.2,0.83929,0.21667,0.83929,0.23333,0.83929,0.25,0.83929,0.26667,0.83929,0.28333,0.83929,0.3,0.83929,0.31667,0.83929,0.33333,0.83929,0.35,0.83929,0.36667,0.83929,0.38333,0.83929,0.4,0.83929,0.41667,0.83929,0.43333,0.83929,0.45,0.83929,0.46667,0.83929,0.48333,0.83929,0.5,0.83929,0.51667,0.83929,0.53333,0.83929,0.55,0.83929,0.56667,0.83929,0.58333,0.83929,0.6,0.83929,0.61667,0.83929,0.63333,0.83929,0.65,0.83929,0.66667,0.83929,0.68333,0.83929,0.7,0.83929,0.71667,0.83929,0.73333,0.83929,0.75,0.83929,0.76667,0.83929,0.78333,0.83929,0.8,0.83929,0.81667,0.83929,0.83333,0.83929,0.85,0.83929,0.86667,0.83929,0.88333,0.83929,0.9,0.83929,0.91667,0.83929,0.93333,0.83929,0.95,0.83929,0.96667,0.83929,0.98333,0.83929,1.0,0.83929,0.0,0.85714,0.01667,0.85714,0.03333,0.85714,0.05,0.85714,0.06667,0.85714,0.08333,0.85714,0.1,0.85714,0.11667,0.85714,0.13333,0.85714,0.15,0.85714,0.16667,0.85714,0.18333,0.85714,0.2,0.85714,0.21667,0.85714,0.23333,0.85714,0.25,0.85714,0.26667,0.85714,0.28333,0.85714,0.3,0.85714,0.31667,0.85714,0.33333,0.85714,0.35,0.85714,0.36667,0.85714,0.38333,0.85714,0.4,0.85714,0.41667,0.85714,0.43333,0.85714,0.45,0.85714,0.46667,0.85714,0.48333,0.85714,0.5,0.85714,0.51667,0.85714,0.53333,0.85714,0.55,0.85714,0.56667,0.85714,0.58333,0.85714,0.6,0.85714,0.61667,0.85714,0.63333,0.85714,0.65,0.85714,0.66667,0.85714,0.68333,0.85714,0.7,0.85714,0.71667,0.85714,0.73333,0.85714,0.75,0.85714,0.76667,0.85714,0.78333,0.85714,0.8,0.85714,0.81667,0.85714,0.83333,0.85714,0.85,0.85714,0.86667,0.85714,0.88333,0.85714,0.9,0.85714,0.91667,0.85714,0.93333,0.85714,0.95,0.85714,0.96667,0.85714,0.98333,0.85714,1.0,0.85714,0.0,0.875,0.01667,0.875,0.03333,0.875,0.05,0.875,0.06667,0.875,0.08333,0.875,0.1,0.875,0.11667,0.875,0.13333,0.875,0.15,0.875,0.16667,0.875,0.18333,0.875,0.2,0.875,0.21667,0.875,0.23333,0.875,0.25,0.875,0.26667,0.875,0.28333,0.875,0.3,0.875,0.31667,0.875,0.33333,0.875,0.35,0.875,0.36667,0.875,0.38333,0.875,0.4,0.875,0.41667,0.875,0.43333,0.875,0.45,0.875,0.46667,0.875,0.48333,0.875,0.5,0.875,0.51667,0.875,0.53333,0.875,0.55,0.875,0.56667,0.875,0.58333,0.875,0.6,0.875,0.61667,0.875,0.63333,0.875,0.65,0.875,0.66667,0.875,0.68333,0.875,0.7,0.875,0.71667,0.875,0.73333,0.875,0.75,0.875,0.76667,0.875,0.78333,0.875,0.8,0.875,0.81667,0.875,0.83333,0.875,0.85,0.875,0.86667,0.875,0.88333,0.875,0.9,0.875,0.91667,0.875,0.93333,0.875,0.95,0.875,0.96667,0.875,0.98333,0.875,1.0,0.875,0.0,0.89286,0.01667,0.89286,0.03333,0.89286,0.05,0.89286,0.06667,0.89286,0.08333,0.89286,0.1,0.89286,0.11667,0.89286,0.13333,0.89286,0.15,0.89286,0.16667,0.89286,0.18333,0.89286,0.2,0.89286,0.21667,0.89286,0.23333,0.89286,0.25,0.89286,0.26667,0.89286,0.28333,0.89286,0.3,0.89286,0.31667,0.89286,0.33333,0.89286,0.35,0.89286,0.36667,0.89286,0.38333,0.89286,0.4,0.89286,0.41667,0.89286,0.43333,0.89286,0.45,0.89286,0.46667,0.89286,0.48333,0.89286,0.5,0.89286,0.51667,0.89286,0.53333,0.89286,0.55,0.89286,0.56667,0.89286,0.58333,0.89286,0.6,0.89286,0.61667,0.89286,0.63333,0.89286,0.65,0.89286,0.66667,0.89286,0.68333,0.89286,0.7,0.89286,0.71667,0.89286,0.73333,0.89286,0.75,0.89286,0.76667,0.89286,0.78333,0.89286,0.8,0.89286,0.81667,0.89286,0.83333,0.89286,0.85,0.89286,0.86667,0.89286,0.88333,0.89286,0.9,0.89286,0.91667,0.89286,0.93333,0.89286,0.95,0.89286,0.96667,0.89286,0.98333,0.89286,1.0,0.89286,0.0,0.91071,0.01667,0.91071,0.03333,0.91071,0.05,0.91071,0.06667,0.91071,0.08333,0.91071,0.1,0.91071,0.11667,0.91071,0.13333,0.91071,0.15,0.91071,0.16667,0.91071,0.18333,0.91071,0.2,0.91071,0.21667,0.91071,0.23333,0.91071,0.25,0.91071,0.26667,0.91071,0.28333,0.91071,0.3,0.91071,0.31667,0.91071,0.33333,0.91071,0.35,0.91071,0.36667,0.91071,0.38333,0.91071,0.4,0.91071,0.41667,0.91071,0.43333,0.91071,0.45,0.91071,0.46667,0.91071,0.48333,0.91071,0.5,0.91071,0.51667,0.91071,0.53333,0.91071,0.55,0.91071,0.56667,0.91071,0.58333,0.91071,0.6,0.91071,0.61667,0.91071,0.63333,0.91071,0.65,0.91071,0.66667,0.91071,0.68333,0.91071,0.7,0.91071,0.71667,0.91071,0.73333,0.91071,0.75,0.91071,0.76667,0.91071,0.78333,0.91071,0.8,0.91071,0.81667,0.91071,0.83333,0.91071,0.85,0.91071,0.86667,0.91071,0.88333,0.91071,0.9,0.91071,0.91667,0.91071,0.93333,0.91071,0.95,0.91071,0.96667,0.91071,0.98333,0.91071,1.0,0.91071,0.0,0.92857,0.01667,0.92857,0.03333,0.92857,0.05,0.92857,0.06667,0.92857,0.08333,0.92857,0.1,0.92857,0.11667,0.92857,0.13333,0.92857,0.15,0.92857,0.16667,0.92857,0.18333,0.92857,0.2,0.92857,0.21667,0.92857,0.23333,0.92857,0.25,0.92857,0.26667,0.92857,0.28333,0.92857,0.3,0.92857,0.31667,0.92857,0.33333,0.92857,0.35,0.92857,0.36667,0.92857,0.38333,0.92857,0.4,0.92857,0.41667,0.92857,0.43333,0.92857,0.45,0.92857,0.46667,0.92857,0.48333,0.92857,0.5,0.92857,0.51667,0.92857,0.53333,0.92857,0.55,0.92857,0.56667,0.92857,0.58333,0.92857,0.6,0.92857,0.61667,0.92857,0.63333,0.92857,0.65,0.92857,0.66667,0.92857,0.68333,0.92857,0.7,0.92857,0.71667,0.92857,0.73333,0.92857,0.75,0.92857,0.76667,0.92857,0.78333,0.92857,0.8,0.92857,0.81667,0.92857,0.83333,0.92857,0.85,0.92857,0.86667,0.92857,0.88333,0.92857,0.9,0.92857,0.91667,0.92857,0.93333,0.92857,0.95,0.92857,0.96667,0.92857,0.98333,0.92857,1.0,0.92857,0.0,0.94643,0.01667,0.94643,0.03333,0.94643,0.05,0.94643,0.06667,0.94643,0.08333,0.94643,0.1,0.94643,0.11667,0.94643,0.13333,0.94643,0.15,0.94643,0.16667,0.94643,0.18333,0.94643,0.2,0.94643,0.21667,0.94643,0.23333,0.94643,0.25,0.94643,0.26667,0.94643,0.28333,0.94643,0.3,0.94643,0.31667,0.94643,0.33333,0.94643,0.35,0.94643,0.36667,0.94643,0.38333,0.94643,0.4,0.94643,0.41667,0.94643,0.43333,0.94643,0.45,0.94643,0.46667,0.94643,0.48333,0.94643,0.5,0.94643,0.51667,0.94643,0.53333,0.94643,0.55,0.94643,0.56667,0.94643,0.58333,0.94643,0.6,0.94643,0.61667,0.94643,0.63333,0.94643,0.65,0.94643,0.66667,0.94643,0.68333,0.94643,0.7,0.94643,0.71667,0.94643,0.73333,0.94643,0.75,0.94643,0.76667,0.94643,0.78333,0.94643,0.8,0.94643,0.81667,0.94643,0.83333,0.94643,0.85,0.94643,0.86667,0.94643,0.88333,0.94643,0.9,0.94643,0.91667,0.94643,0.93333,0.94643,0.95,0.94643,0.96667,0.94643,0.98333,0.94643,1.0,0.94643,0.0,0.96429,0.01667,0.96429,0.03333,0.96429,0.05,0.96429,0.06667,0.96429,0.08333,0.96429,0.1,0.96429,0.11667,0.96429,0.13333,0.96429,0.15,0.96429,0.16667,0.96429,0.18333,0.96429,0.2,0.96429,0.21667,0.96429,0.23333,0.96429,0.25,0.96429,0.26667,0.96429,0.28333,0.96429,0.3,0.96429,0.31667,0.96429,0.33333,0.96429,0.35,0.96429,0.36667,0.96429,0.38333,0.96429,0.4,0.96429,0.41667,0.96429,0.43333,0.96429,0.45,0.96429,0.46667,0.96429,0.48333,0.96429,0.5,0.96429,0.51667,0.96429,0.53333,0.96429,0.55,0.96429,0.56667,0.96429,0.58333,0.96429,0.6,0.96429,0.61667,0.96429,0.63333,0.96429,0.65,0.96429,0.66667,0.96429,0.68333,0.96429,0.7,0.96429,0.71667,0.96429,0.73333,0.96429,0.75,0.96429,0.76667,0.96429,0.78333,0.96429,0.8,0.96429,0.81667,0.96429,0.83333,0.96429,0.85,0.96429,0.86667,0.96429,0.88333,0.96429,0.9,0.96429,0.91667,0.96429,0.93333,0.96429,0.95,0.96429,0.96667,0.96429,0.98333,0.96429,1.0,0.96429,0.0,0.98214,0.01667,0.98214,0.03333,0.98214,0.05,0.98214,0.06667,0.98214,0.08333,0.98214,0.1,0.98214,0.11667,0.98214,0.13333,0.98214,0.15,0.98214,0.16667,0.98214,0.18333,0.98214,0.2,0.98214,0.21667,0.98214,0.23333,0.98214,0.25,0.98214,0.26667,0.98214,0.28333,0.98214,0.3,0.98214,0.31667,0.98214,0.33333,0.98214,0.35,0.98214,0.36667,0.98214,0.38333,0.98214,0.4,0.98214,0.41667,0.98214,0.43333,0.98214,0.45,0.98214,0.46667,0.98214,0.48333,0.98214,0.5,0.98214,0.51667,0.98214,0.53333,0.98214,0.55,0.98214,0.56667,0.98214,0.58333,0.98214,0.6,0.98214,0.61667,0.98214,0.63333,0.98214,0.65,0.98214,0.66667,0.98214,0.68333,0.98214,0.7,0.98214,0.71667,0.98214,0.73333,0.98214,0.75,0.98214,0.76667,0.98214,0.78333,0.98214,0.8,0.98214,0.81667,0.98214,0.83333,0.98214,0.85,0.98214,0.86667,0.98214,0.88333,0.98214,0.9,0.98214,0.91667,0.98214,0.93333,0.98214,0.95,0.98214,0.96667,0.98214,0.98333,0.98214,1.0,0.98214,0.0,1.0,0.01667,1.0,0.03333,1.0,0.05,1.0,0.06667,1.0,0.08333,1.0,0.1,1.0,0.11667,1.0,0.13333,1.0,0.15,1.0,0.16667,1.0,0.18333,1.0,0.2,1.0,0.21667,1.0,0.23333,1.0,0.25,1.0,0.26667,1.0,0.28333,1.0,0.3,1.0,0.31667,1.0,0.33333,1.0,0.35,1.0,0.36667,1.0,0.38333,1.0,0.4,1.0,0.41667,1.0,0.43333,1.0,0.45,1.0,0.46667,1.0,0.48333,1.0,0.5,1.0,0.51667,1.0,0.53333,1.0,0.55,1.0,0.56667,1.0,0.58333,1.0,0.6,1.0,0.61667,1.0,0.63333,1.0,0.65,1.0,0.66667,1.0,0.68333,1.0,0.7,1.0,0.71667,1.0,0.73333,1.0,0.75,1.0,0.76667,1.0,0.78333,1.0,0.8,1.0,0.81667,1.0,0.83333,1.0,0.85,1.0,0.86667,1.0,0.88333,1.0,0.9,1.0,0.91667,1.0,0.93333,1.0,0.95,1.0,0.96667,1.0,0.98333,1.0,1.0,1.0],"index":[0,1,61,1,62,61,1,2,62,2,63,62,2,3,63,3,64,63,3,4,64,4,65,64,4,5,65,5,66,65,5,6,66,6,67,66,6,7,67,7,68,67,7,8,68,8,69,68,8,9,69,9,70,69,9,10,70,10,71,70,10,11,71,11,72,71,11,12,72,12,73,72,12,13,73,13,74,73,13,14,74,14,75,74,14,15,75,15,76,75,15,16,76,16,77,76,16,17,77,17,78,77,17,18,78,18,79,78,18,19,79,19,80,79,19,20,80,20,81,80,20,21,81,21,82,81,21,22,82,22,83,82,22,23,83,23,84,83,23,24,84,24,85,84,24,25,85,25,86,85,25,26,86,26,87,86,26,27,87,27,88,87,27,28,88,28,89,88,28,29,89,29,90,89,29,30,90,30,91,90,30,31,91,31,92,91,31,32,92,32,93,92,32,33,93,33,94,93,33,34,94,34,95,94,34,35,95,35,96,95,35,36,96,36,97,96,36,37,97,37,98,97,37,38,98,38,99,98,38,39,99,39,100,99,39,40,100,40,101,100,40,41,101,41,102,101,41,42,102,42,103,102,42,43,103,43,104,103,43,44,104,44,105,104,44,45,105,45,106,105,45,46,106,46,107,106,46,47,107,47,108,107,47,48,108,48,109,108,48,49,109,49,110,109,49,50,110,50,111,110,50,51,111,51,112,111,51,52,112,52,113,112,52,53,113,53,114,113,53,54,114,54,115,114,54,55,115,55,116,115,55,56,116,56,117,116,56,57,117,57,118,117,57,58,118,58,119,118,58,59,119,59,120,119,59,60,120,60,121,120,61,62,122,62,123,122,62,63,123,63,124,123,63,64,124,64,125,124,64,65,125,65,126,125,65,66,126,66,127,126,66,67,127,67,128,127,67,68,128,68,129,128,68,69,129,69,130,129,69,70,130,70,131,130,70,71,131,71,132,131,71,72,132,72,133,132,72,73,133,73,134,133,73,74,134,74,135,134,74,75,135,75,136,135,75,76,136,76,137,136,76,77,137,77,138,137,77,78,138,78,139,138,78,79,139,79,140,139,79,80,140,80,141,140,80,81,141,81,142,141,81,82,142,82,143,142,82,83,143,83,144,143,83,84,144,84,145,144,84,85,145,85,146,145,85,86,146,86,147,146,86,87,147,87,148,147,87,88,148,88,149,148,88,89,149,89,150,149,89,90,150,90,151,150,90,91,151,91,152,151,91,92,152,92,153,152,92,93,153,93,154,153,93,94,154,94,155,154,94,95,155,95,156,155,95,96,156,96,157,156,96,97,157,97,158,157,97,98,158,98,159,158,98,99,159,99,160,159,99,100,160,100,161,160,100,101,161,101,162,161,101,102,162,102,163,162,102,103,163,103,164,163,103,104,164,104,165,164,104,105,165,105,166,165,105,106,166,106,167,166,106,107,167,107,168,167,107,108,168,108,169,168,108,109,169,109,170,169,109,110,170,110,171,170,110,111,171,111,172,171,111,112,172,112,173,172,112,113,173,113,174,173,113,114,174,114,175,174,114,115,175,115,176,175,115,116,176,116,177,176,116,117,177,117,178,177,117,118,178,118,179,178,118,119,179,119,180,179,119,120,180,120,181,180,120,121,181,121,182,181,122,123,183,123,184,183,123,124,184,124,185,184,124,125,185,125,186,185,125,126,186,126,187,186,126,127,187,127,188,187,127,128,188,128,189,188,128,129,189,129,190,189,129,130,190,130,191,190,130,131,191,131,192,191,131,132,192,132,193,192,132,133,193,133,194,193,133,134,194,134,195,194,134,135,195,135,196,195,135,136,196,136,197,196,136,137,197,137,198,197,137,138,198,138,199,198,138,139,199,139,200,199,139,140,200,140,201,200,140,141,201,141,202,201,141,142,202,142,203,202,142,143,203,143,204,203,143,144,204,144,205,204,144,145,205,145,206,205,145,146,206,146,207,206,146,147,207,147,208,207,147,148,208,148,209,208,148,149,209,149,210,209,149,150,210,150,211,210,150,151,211,151,212,211,151,152,212,152,213,212,152,153,213,153,214,213,153,154,214,154,215,214,154,155,215,155,216,215,155,156,216,156,217,216,156,157,217,157,218,217,157,158,218,158,219,218,158,159,219,159,220,219,159,160,220,160,221,220,160,161,221,161,222,221,161,162,222,162,223,222,162,163,223,163,224,223,163,164,224,164,225,224,164,165,225,165,226,225,165,166,226,166,227,226,166,167,227,167,228,227,167,168,228,168,229,228,168,169,229,169,230,229,169,170,230,170,231,230,170,171,231,171,232,231,171,172,232,172,233,232,172,173,233,173,234,233,173,174,234,174,235,234,174,175,235,175,236,235,175,176,236,176,237,236,176,177,237,177,238,237,177,178,238,178,239,238,178,179,239,179,240,239,179,180,240,180,241,240,180,181,241,181,242,241,181,182,242,182,243,242,183,184,244,184,245,244,184,185,245,185,246,245,185,186,246,186,247,246,186,187,247,187,248,247,187,188,248,188,249,248,188,189,249,189,250,249,189,190,250,190,251,250,190,191,251,191,252,251,191,192,252,192,253,252,192,193,253,193,254,253,193,194,254,194,255,254,194,195,255,195,256,255,195,196,256,196,257,256,196,197,257,197,258,257,197,198,258,198,259,258,198,199,259,199,260,259,199,200,260,200,261,260,200,201,261,201,262,261,201,202,262,202,263,262,202,203,263,203,264,263,203,204,264,204,265,264,204,205,265,205,266,265,205,206,266,206,267,266,206,207,267,207,268,267,207,208,268,208,269,268,208,209,269,209,270,269,209,210,270,210,271,270,210,211,271,211,272,271,211,212,272,212,273,272,212,213,273,213,274,273,213,214,274,214,275,274,214,215,275,215,276,275,215,216,276,216,277,276,216,217,277,217,278,277,217,218,278,218,279,278,218,219,279,219,280,279,219,220,280,220,281,280,220,221,281,221,282,281,221,222,282,222,283,282,222,223,283,223,284,283,223,224,284,224,285,284,224,225,285,225,286,285,225,226,286,226,287,286,226,227,287,227,288,287,227,228,288,228,289,288,228,229,289,229,290,289,229,230,290,230,291,290,230,231,291,231,292,291,231,232,292,232,293,292,232,233,293,233,294,293,233,234,294,234,295,294,234,235,295,235,296,295,235,236,296,236,297,296,236,237,297,237,298,297,237,238,298,238,299,298,238,239,299,239,300,299,239,240,300,240,301,300,240,241,301,241,302,301,241,242,302,242,303,302,242,243,303,243,304,303,244,245,305,245,306,305,245,246,306,246,307,306,246,247,307,247,308,307,247,248,308,248,309,308,248,249,309,249,310,309,249,250,310,250,311,310,250,251,311,251,312,311,251,252,312,252,313,312,252,253,313,253,314,313,253,254,314,254,315,314,254,255,315,255,316,315,255,256,316,256,317,316,256,257,317,257,318,317,257,258,318,258,319,318,258,259,319,259,320,319,259,260,320,260,321,320,260,261,321,261,322,321,261,262,322,262,323,322,262,263,323,263,324,323,263,264,324,264,325,324,264,265,325,265,326,325,265,266,326,266,327,326,266,267,327,267,328,327,267,268,328,268,329,328,268,269,329,269,330,329,269,270,330,270,331,330,270,271,331,271,332,331,271,272,332,272,333,332,272,273,333,273,334,333,273,274,334,274,335,334,274,275,335,275,336,335,275,276,336,276,337,336,276,277,337,277,338,337,277,278,338,278,339,338,278,279,339,279,340,339,279,280,340,280,341,340,280,281,341,281,342,341,281,282,342,282,343,342,282,283,343,283,344,343,283,284,344,284,345,344,284,285,345,285,346,345,285,286,346,286,347,346,286,287,347,287,348,347,287,288,348,288,349,348,288,289,349,289,350,349,289,290,350,290,351,350,290,291,351,291,352,351,291,292,352,292,353,352,292,293,353,293,354,353,293,294,354,294,355,354,294,295,355,295,356,355,295,296,356,296,357,356,296,297,357,297,358,357,297,298,358,298,359,358,298,299,359,299,360,359,299,300,360,300,361,360,300,301,361,301,362,361,301,302,362,302,363,362,302,303,363,303,364,363,303,304,364,304,365,364,305,306,366,306,367,366,306,307,367,307,368,367,307,308,368,308,369,368,308,309,369,309,370,369,309,310,370,310,371,370,310,311,371,311,372,371,311,312,372,312,373,372,312,313,373,313,374,373,313,314,374,314,375,374,314,315,375,315,376,375,315,316,376,316,377,376,316,317,377,317,378,377,317,318,378,318,379,378,318,319,379,319,380,379,319,320,380,320,381,380,320,321,381,321,382,381,321,322,382,322,383,382,322,323,383,323,384,383,323,324,384,324,385,384,324,325,385,325,386,385,325,326,386,326,387,386,326,327,387,327,388,387,327,328,388,328,389,388,328,329,389,329,390,389,329,330,390,330,391,390,330,331,391,331,392,391,331,332,392,332,393,392,332,333,393,333,394,393,333,334,394,334,395,394,334,335,395,335,396,395,335,336,396,336,397,396,336,337,397,337,398,397,337,338,398,338,399,398,338,339,399,339,400,399,339,340,400,340,401,400,340,341,401,341,402,401,341,342,402,342,403,402,342,343,403,343,404,403,343,344,404,344,405,404,344,345,405,345,406,405,345,346,406,346,407,406,346,347,407,347,408,407,347,348,408,348,409,408,348,349,409,349,410,409,349,350,410,350,411,410,350,351,411,351,412,411,351,352,412,352,413,412,352,353,413,353,414,413,353,354,414,354,415,414,354,355,415,355,416,415,355,356,416,356,417,416,356,357,417,357,418,417,357,358,418,358,419,418,358,359,419,359,420,419,359,360,420,360,421,420,360,361,421,361,422,421,361,362,422,362,423,422,362,363,423,363,424,423,363,364,424,364,425,424,364,365,425,365,426,425,366,367,427,367,428,427,367,368,428,368,429,428,368,369,429,369,430,429,369,370,430,370,431,430,370,371,431,371,432,431,371,372,432,372,433,432,372,373,433,373,434,433,373,374,434,374,435,434,374,375,435,375,436,435,375,376,436,376,437,436,376,377,437,377,438,437,377,378,438,378,439,438,378,379,439,379,440,439,379,380,440,380,441,440,380,381,441,381,442,441,381,382,442,382,443,442,382,383,443,383,444,443,383,384,444,384,445,444,384,385,445,385,446,445,385,386,446,386,447,446,386,387,447,387,448,447,387,388,448,388,449,448,388,389,449,389,450,449,389,390,450,390,451,450,390,391,451,391,452,451,391,392,452,392,453,452,392,393,453,393,454,453,393,394,454,394,455,454,394,395,455,395,456,455,395,396,456,396,457,456,396,397,457,397,458,457,397,398,458,398,459,458,398,399,459,399,460,459,399,400,460,400,461,460,400,401,461,401,462,461,401,402,462,402,463,462,402,403,463,403,464,463,403,404,464,404,465,464,404,405,465,405,466,465,405,406,466,406,467,466,406,407,467,407,468,467,407,408,468,408,469,468,408,409,469,409,470,469,409,410,470,410,471,470,410,411,471,411,472,471,411,412,472,412,473,472,412,413,473,413,474,473,413,414,474,414,475,474,414,415,475,415,476,475,415,416,476,416,477,476,416,417,477,417,478,477,417,418,478,418,479,478,418,419,479,419,480,479,419,420,480,420,481,480,420,421,481,421,482,481,421,422,482,422,483,482,422,423,483,423,484,483,423,424,484,424,485,484,424,425,485,425,486,485,425,426,486,426,487,486,427,428,488,428,489,488,428,429,489,429,490,489,429,430,490,430,491,490,430,431,491,431,492,491,431,432,492,432,493,492,432,433,493,433,494,493,433,434,494,434,495,494,434,435,495,435,496,495,435,436,496,436,497,496,436,437,497,437,498,497,437,438,498,438,499,498,438,439,499,439,500,499,439,440,500,440,501,500,440,441,501,441,502,501,441,442,502,442,503,502,442,443,503,443,504,503,443,444,504,444,505,504,444,445,505,445,506,505,445,446,506,446,507,506,446,447,507,447,508,507,447,448,508,448,509,508,448,449,509,449,510,509,449,450,510,450,511,510,450,451,511,451,512,511,451,452,512,452,513,512,452,453,513,453,514,513,453,454,514,454,515,514,454,455,515,455,516,515,455,456,516,456,517,516,456,457,517,457,518,517,457,458,518,458,519,518,458,459,519,459,520,519,459,460,520,460,521,520,460,461,521,461,522,521,461,462,522,462,523,522,462,463,523,463,524,523,463,464,524,464,525,524,464,465,525,465,526,525,465,466,526,466,527,526,466,467,527,467,528,527,467,468,528,468,529,528,468,469,529,469,530,529,469,470,530,470,531,530,470,471,531,471,532,531,471,472,532,472,533,532,472,473,533,473,534,533,473,474,534,474,535,534,474,475,535,475,536,535,475,476,536,476,537,536,476,477,537,477,538,537,477,478,538,478,539,538,478,479,539,479,540,539,479,480,540,480,541,540,480,481,541,481,542,541,481,482,542,482,543,542,482,483,543,483,544,543,483,484,544,484,545,544,484,485,545,485,546,545,485,486,546,486,547,546,486,487,547,487,548,547,488,489,549,489,550,549,489,490,550,490,551,550,490,491,551,491,552,551,491,492,552,492,553,552,492,493,553,493,554,553,493,494,554,494,555,554,494,495,555,495,556,555,495,496,556,496,557,556,496,497,557,497,558,557,497,498,558,498,559,558,498,499,559,499,560,559,499,500,560,500,561,560,500,501,561,501,562,561,501,502,562,502,563,562,502,503,563,503,564,563,503,504,564,504,565,564,504,505,565,505,566,565,505,506,566,506,567,566,506,507,567,507,568,567,507,508,568,508,569,568,508,509,569,509,570,569,509,510,570,510,571,570,510,511,571,511,572,571,511,512,572,512,573,572,512,513,573,513,574,573,513,514,574,514,575,574,514,515,575,515,576,575,515,516,576,516,577,576,516,517,577,517,578,577,517,518,578,518,579,578,518,519,579,519,580,579,519,520,580,520,581,580,520,521,581,521,582,581,521,522,582,522,583,582,522,523,583,523,584,583,523,524,584,524,585,584,524,525,585,525,586,585,525,526,586,526,587,586,526,527,587,527,588,587,527,528,588,528,589,588,528,529,589,529,590,589,529,530,590,530,591,590,530,531,591,531,592,591,531,532,592,532,593,592,532,533,593,533,594,593,533,534,594,534,595,594,534,535,595,535,596,595,535,536,596,536,597,596,536,537,597,537,598,597,537,538,598,538,599,598,538,539,599,539,600,599,539,540,600,540,601,600,540,541,601,541,602,601,541,542,602,542,603,602,542,543,603,543,604,603,543,544,604,544,605,604,544,545,605,545,606,605,545,546,606,546,607,606,546,547,607,547,608,607,547,548,608,548,609,608,549,550,610,550,611,610,550,551,611,551,612,611,551,552,612,552,613,612,552,553,613,553,614,613,553,554,614,554,615,614,554,555,615,555,616,615,555,556,616,556,617,616,556,557,617,557,618,617,557,558,618,558,619,618,558,559,619,559,620,619,559,560,620,560,621,620,560,561,621,561,622,621,561,562,622,562,623,622,562,563,623,563,624,623,563,564,624,564,625,624,564,565,625,565,626,625,565,566,626,566,627,626,566,567,627,567,628,627,567,568,628,568,629,628,568,569,629,569,630,629,569,570,630,570,631,630,570,571,631,571,632,631,571,572,632,572,633,632,572,573,633,573,634,633,573,574,634,574,635,634,574,575,635,575,636,635,575,576,636,576,637,636,576,577,637,577,638,637,577,578,638,578,639,638,578,579,639,579,640,639,579,580,640,580,641,640,580,581,641,581,642,641,581,582,642,582,643,642,582,583,643,583,644,643,583,584,644,584,645,644,584,585,645,585,646,645,585,586,646,586,647,646,586,587,647,587,648,647,587,588,648,588,649,648,588,589,649,589,650,649,589,590,650,590,651,650,590,591,651,591,652,651,591,592,652,592,653,652,592,593,653,593,654,653,593,594,654,594,655,654,594,595,655,595,656,655,595,596,656,596,657,656,596,597,657,597,658,657,597,598,658,598,659,658,598,599,659,599,660,659,599,600,660,600,661,660,600,601,661,601,662,661,601,602,662,602,663,662,602,603,663,603,664,663,603,604,664,604,665,664,604,605,665,605,666,665,605,606,666,606,667,666,606,607,667,607,668,667,607,608,668,608,669,668,608,609,669,609,670,669,610,611,671,611,672,671,611,612,672,612,673,672,612,613,673,613,674,673,613,614,674,614,675,674,614,615,675,615,676,675,615,616,676,616,677,676,616,617,677,617,678,677,617,618,678,618,679,678,618,619,679,619,680,679,619,620,680,620,681,680,620,621,681,621,682,681,621,622,682,622,683,682,622,623,683,623,684,683,623,624,684,624,685,684,624,625,685,625,686,685,625,626,686,626,687,686,626,627,687,627,688,687,627,628,688,628,689,688,628,629,689,629,690,689,629,630,690,630,691,690,630,631,691,631,692,691,631,632,692,632,693,692,632,633,693,633,694,693,633,634,694,634,695,694,634,635,695,635,696,695,635,636,696,636,697,696,636,637,697,637,698,697,637,638,698,638,699,698,638,639,699,639,700,699,639,640,700,640,701,700,640,641,701,641,702,701,641,642,702,642,703,702,642,643,703,643,704,703,643,644,704,644,705,704,644,645,705,645,706,705,645,646,706,646,707,706,646,647,707,647,708,707,647,648,708,648,709,708,648,649,709,649,710,709,649,650,710,650,711,710,650,651,711,651,712,711,651,652,712,652,713,712,652,653,713,653,714,713,653,654,714,654,715,714,654,655,715,655,716,715,655,656,716,656,717,716,656,657,717,657,718,717,657,658,718,658,719,718,658,659,719,659,720,719,659,660,720,660,721,720,660,661,721,661,722,721,661,662,722,662,723,722,662,663,723,663,724,723,663,664,724,664,725,724,664,665,725,665,726,725,665,666,726,666,727,726,666,667,727,667,728,727,667,668,728,668,729,728,668,669,729,669,730,729,669,670,730,670,731,730,671,672,732,672,733,732,672,673,733,673,734,733,673,674,734,674,735,734,674,675,735,675,736,735,675,676,736,676,737,736,676,677,737,677,738,737,677,678,738,678,739,738,678,679,739,679,740,739,679,680,740,680,741,740,680,681,741,681,742,741,681,682,742,682,743,742,682,683,743,683,744,743,683,684,744,684,745,744,684,685,745,685,746,745,685,686,746,686,747,746,686,687,747,687,748,747,687,688,748,688,749,748,688,689,749,689,750,749,689,690,750,690,751,750,690,691,751,691,752,751,691,692,752,692,753,752,692,693,753,693,754,753,693,694,754,694,755,754,694,695,755,695,756,755,695,696,756,696,757,756,696,697,757,697,758,757,697,698,758,698,759,758,698,699,759,699,760,759,699,700,760,700,761,760,700,701,761,701,762,761,701,702,762,702,763,762,702,703,763,703,764,763,703,704,764,704,765,764,704,705,765,705,766,765,705,706,766,706,767,766,706,707,767,707,768,767,707,708,768,708,769,768,708,709,769,709,770,769,709,710,770,710,771,770,710,711,771,711,772,771,711,712,772,712,773,772,712,713,773,713,774,773,713,714,774,714,775,774,714,715,775,715,776,775,715,716,776,716,777,776,716,717,777,717,778,777,717,718,778,718,779,778,718,719,779,719,780,779,719,720,780,720,781,780,720,721,781,721,782,781,721,722,782,722,783,782,722,723,783,723,784,783,723,724,784,724,785,784,724,725,785,725,786,785,725,726,786,726,787,786,726,727,787,727,788,787,727,728,788,728,789,788,728,729,789,729,790,789,729,730,790,730,791,790,730,731,791,731,792,791,732,733,793,733,794,793,733,734,794,734,795,794,734,735,795,735,796,795,735,736,796,736,797,796,736,737,797,737,798,797,737,738,798,738,799,798,738,739,799,739,800,799,739,740,800,740,801,800,740,741,801,741,802,801,741,742,802,742,803,802,742,743,803,743,804,803,743,744,804,744,805,804,744,745,805,745,806,805,745,746,806,746,807,806,746,747,807,747,808,807,747,748,808,748,809,808,748,749,809,749,810,809,749,750,810,750,811,810,750,751,811,751,812,811,751,752,812,752,813,812,752,753,813,753,814,813,753,754,814,754,815,814,754,755,815,755,816,815,755,756,816,756,817,816,756,757,817,757,818,817,757,758,818,758,819,818,758,759,819,759,820,819,759,760,820,760,821,820,760,761,821,761,822,821,761,762,822,762,823,822,762,763,823,763,824,823,763,764,824,764,825,824,764,765,825,765,826,825,765,766,826,766,827,826,766,767,827,767,828,827,767,768,828,768,829,828,768,769,829,769,830,829,769,770,830,770,831,830,770,771,831,771,832,831,771,772,832,772,833,832,772,773,833,773,834,833,773,774,834,774,835,834,774,775,835,775,836,835,775,776,836,776,837,836,776,777,837,777,838,837,777,778,838,778,839,838,778,779,839,779,840,839,779,780,840,780,841,840,780,781,841,781,842,841,781,782,842,782,843,842,782,783,843,783,844,843,783,784,844,784,845,844,784,785,845,785,846,845,785,786,846,786,847,846,786,787,847,787,848,847,787,788,848,788,849,848,788,789,849,789,850,849,789,790,850,790,851,850,790,791,851,791,852,851,791,792,852,792,853,852,793,794,854,794,855,854,794,795,855,795,856,855,795,796,856,796,857,856,796,797,857,797,858,857,797,798,858,798,859,858,798,799,859,799,860,859,799,800,860,800,861,860,800,801,861,801,862,861,801,802,862,802,863,862,802,803,863,803,864,863,803,804,864,804,865,864,804,805,865,805,866,865,805,806,866,806,867,866,806,807,867,807,868,867,807,808,868,808,869,868,808,809,869,809,870,869,809,810,870,810,871,870,810,811,871,811,872,871,811,812,872,812,873,872,812,813,873,813,874,873,813,814,874,814,875,874,814,815,875,815,876,875,815,816,876,816,877,876,816,817,877,817,878,877,817,818,878,818,879,878,818,819,879,819,880,879,819,820,880,820,881,880,820,821,881,821,882,881,821,822,882,822,883,882,822,823,883,823,884,883,823,824,884,824,885,884,824,825,885,825,886,885,825,826,886,826,887,886,826,827,887,827,888,887,827,828,888,828,889,888,828,829,889,829,890,889,829,830,890,830,891,890,830,831,891,831,892,891,831,832,892,832,893,892,832,833,893,833,894,893,833,834,894,834,895,894,834,835,895,835,896,895,835,836,896,836,897,896,836,837,897,837,898,897,837,838,898,838,899,898,838,839,899,839,900,899,839,840,900,840,901,900,840,841,901,841,902,901,841,842,902,842,903,902,842,843,903,843,904,903,843,844,904,844,905,904,844,845,905,845,906,905,845,846,906,846,907,906,846,847,907,847,908,907,847,848,908,848,909,908,848,849,909,849,910,909,849,850,910,850,911,910,850,851,911,851,912,911,851,852,912,852,913,912,852,853,913,853,914,913,854,855,915,855,916,915,855,856,916,856,917,916,856,857,917,857,918,917,857,858,918,858,919,918,858,859,919,859,920,919,859,860,920,860,921,920,860,861,921,861,922,921,861,862,922,862,923,922,862,863,923,863,924,923,863,864,924,864,925,924,864,865,925,865,926,925,865,866,926,866,927,926,866,867,927,867,928,927,867,868,928,868,929,928,868,869,929,869,930,929,869,870,930,870,931,930,870,871,931,871,932,931,871,872,932,872,933,932,872,873,933,873,934,933,873,874,934,874,935,934,874,875,935,875,936,935,875,876,936,876,937,936,876,877,937,877,938,937,877,878,938,878,939,938,878,879,939,879,940,939,879,880,940,880,941,940,880,881,941,881,942,941,881,882,942,882,943,942,882,883,943,883,944,943,883,884,944,884,945,944,884,885,945,885,946,945,885,886,946,886,947,946,886,887,947,887,948,947,887,888,948,888,949,948,888,889,949,889,950,949,889,890,950,890,951,950,890,891,951,891,952,951,891,892,952,892,953,952,892,893,953,893,954,953,893,894,954,894,955,954,894,895,955,895,956,955,895,896,956,896,957,956,896,897,957,897,958,957,897,898,958,898,959,958,898,899,959,899,960,959,899,900,960,900,961,960,900,901,961,901,962,961,901,902,962,902,963,962,902,903,963,903,964,963,903,904,964,904,965,964,904,905,965,905,966,965,905,906,966,906,967,966,906,907,967,907,968,967,907,908,968,908,969,968,908,909,969,909,970,969,909,910,970,910,971,970,910,911,971,911,972,971,911,912,972,912,973,972,912,913,973,913,974,973,913,914,974,914,975,974,915,916,976,916,977,976,916,917,977,917,978,977,917,918,978,918,979,978,918,919,979,919,980,979,919,920,980,920,981,980,920,921,981,921,982,981,921,922,982,922,983,982,922,923,983,923,984,983,923,924,984,924,985,984,924,925,985,925,986,985,925,926,986,926,987,986,926,927,987,927,988,987,927,928,988,928,989,988,928,929,989,929,990,989,929,930,990,930,991,990,930,931,991,931,992,991,931,932,992,932,993,992,932,933,993,933,994,993,933,934,994,934,995,994,934,935,995,935,996,995,935,936,996,936,997,996,936,937,997,937,998,997,937,938,998,938,999,998,938,939,999,939,1000,999,939,940,1000,940,1001,1000,940,941,1001,941,1002,1001,941,942,1002,942,1003,1002,942,943,1003,943,1004,1003,943,944,1004,944,1005,1004,944,945,1005,945,1006,1005,945,946,1006,946,1007,1006,946,947,1007,947,1008,1007,947,948,1008,948,1009,1008,948,949,1009,949,1010,1009,949,950,1010,950,1011,1010,950,951,1011,951,1012,1011,951,952,1012,952,1013,1012,952,953,1013,953,1014,1013,953,954,1014,954,1015,1014,954,955,1015,955,1016,1015,955,956,1016,956,1017,1016,956,957,1017,957,1018,1017,957,958,1018,958,1019,1018,958,959,1019,959,1020,1019,959,960,1020,960,1021,1020,960,961,1021,961,1022,1021,961,962,1022,962,1023,1022,962,963,1023,963,1024,1023,963,964,1024,964,1025,1024,964,965,1025,965,1026,1025,965,966,1026,966,1027,1026,966,967,1027,967,1028,1027,967,968,1028,968,1029,1028,968,969,1029,969,1030,1029,969,970,1030,970,1031,1030,970,971,1031,971,1032,1031,971,972,1032,972,1033,1032,972,973,1033,973,1034,1033,973,974,1034,974,1035,1034,974,975,1035,975,1036,1035,976,977,1037,977,1038,1037,977,978,1038,978,1039,1038,978,979,1039,979,1040,1039,979,980,1040,980,1041,1040,980,981,1041,981,1042,1041,981,982,1042,982,1043,1042,982,983,1043,983,1044,1043,983,984,1044,984,1045,1044,984,985,1045,985,1046,1045,985,986,1046,986,1047,1046,986,987,1047,987,1048,1047,987,988,1048,988,1049,1048,988,989,1049,989,1050,1049,989,990,1050,990,1051,1050,990,991,1051,991,1052,1051,991,992,1052,992,1053,1052,992,993,1053,993,1054,1053,993,994,1054,994,1055,1054,994,995,1055,995,1056,1055,995,996,1056,996,1057,1056,996,997,1057,997,1058,1057,997,998,1058,998,1059,1058,998,999,1059,999,1060,1059,999,1000,1060,1000,1061,1060,1000,1001,1061,1001,1062,1061,1001,1002,1062,1002,1063,1062,1002,1003,1063,1003,1064,1063,1003,1004,1064,1004,1065,1064,1004,1005,1065,1005,1066,1065,1005,1006,1066,1006,1067,1066,1006,1007,1067,1007,1068,1067,1007,1008,1068,1008,1069,1068,1008,1009,1069,1009,1070,1069,1009,1010,1070,1010,1071,1070,1010,1011,1071,1011,1072,1071,1011,1012,1072,1012,1073,1072,1012,1013,1073,1013,1074,1073,1013,1014,1074,1014,1075,1074,1014,1015,1075,1015,1076,1075,1015,1016,1076,1016,1077,1076,1016,1017,1077,1017,1078,1077,1017,1018,1078,1018,1079,1078,1018,1019,1079,1019,1080,1079,1019,1020,1080,1020,1081,1080,1020,1021,1081,1021,1082,1081,1021,1022,1082,1022,1083,1082,1022,1023,1083,1023,1084,1083,1023,1024,1084,1024,1085,1084,1024,1025,1085,1025,1086,1085,1025,1026,1086,1026,1087,1086,1026,1027,1087,1027,1088,1087,1027,1028,1088,1028,1089,1088,1028,1029,1089,1029,1090,1089,1029,1030,1090,1030,1091,1090,1030,1031,1091,1031,1092,1091,1031,1032,1092,1032,1093,1092,1032,1033,1093,1033,1094,1093,1033,1034,1094,1034,1095,1094,1034,1035,1095,1035,1096,1095,1035,1036,1096,1036,1097,1096,1037,1038,1098,1038,1099,1098,1038,1039,1099,1039,1100,1099,1039,1040,1100,1040,1101,1100,1040,1041,1101,1041,1102,1101,1041,1042,1102,1042,1103,1102,1042,1043,1103,1043,1104,1103,1043,1044,1104,1044,1105,1104,1044,1045,1105,1045,1106,1105,1045,1046,1106,1046,1107,1106,1046,1047,1107,1047,1108,1107,1047,1048,1108,1048,1109,1108,1048,1049,1109,1049,1110,1109,1049,1050,1110,1050,1111,1110,1050,1051,1111,1051,1112,1111,1051,1052,1112,1052,1113,1112,1052,1053,1113,1053,1114,1113,1053,1054,1114,1054,1115,1114,1054,1055,1115,1055,1116,1115,1055,1056,1116,1056,1117,1116,1056,1057,1117,1057,1118,1117,1057,1058,1118,1058,1119,1118,1058,1059,1119,1059,1120,1119,1059,1060,1120,1060,1121,1120,1060,1061,1121,1061,1122,1121,1061,1062,1122,1062,1123,1122,1062,1063,1123,1063,1124,1123,1063,1064,1124,1064,1125,1124,1064,1065,1125,1065,1126,1125,1065,1066,1126,1066,1127,1126,1066,1067,1127,1067,1128,1127,1067,1068,1128,1068,1129,1128,1068,1069,1129,1069,1130,1129,1069,1070,1130,1070,1131,1130,1070,1071,1131,1071,1132,1131,1071,1072,1132,1072,1133,1132,1072,1073,1133,1073,1134,1133,1073,1074,1134,1074,1135,1134,1074,1075,1135,1075,1136,1135,1075,1076,1136,1076,1137,1136,1076,1077,1137,1077,1138,1137,1077,1078,1138,1078,1139,1138,1078,1079,1139,1079,1140,1139,1079,1080,1140,1080,1141,1140,1080,1081,1141,1081,1142,1141,1081,1082,1142,1082,1143,1142,1082,1083,1143,1083,1144,1143,1083,1084,1144,1084,1145,1144,1084,1085,1145,1085,1146,1145,1085,1086,1146,1086,1147,1146,1086,1087,1147,1087,1148,1147,1087,1088,1148,1088,1149,1148,1088,1089,1149,1089,1150,1149,1089,1090,1150,1090,1151,1150,1090,1091,1151,1091,1152,1151,1091,1092,1152,1092,1153,1152,1092,1093,1153,1093,1154,1153,1093,1094,1154,1094,1155,1154,1094,1095,1155,1095,1156,1155,1095,1096,1156,1096,1157,1156,1096,1097,1157,1097,1158,1157,1098,1099,1159,1099,1160,1159,1099,1100,1160,1100,1161,1160,1100,1101,1161,1101,1162,1161,1101,1102,1162,1102,1163,1162,1102,1103,1163,1103,1164,1163,1103,1104,1164,1104,1165,1164,1104,1105,1165,1105,1166,1165,1105,1106,1166,1106,1167,1166,1106,1107,1167,1107,1168,1167,1107,1108,1168,1108,1169,1168,1108,1109,1169,1109,1170,1169,1109,1110,1170,1110,1171,1170,1110,1111,1171,1111,1172,1171,1111,1112,1172,1112,1173,1172,1112,1113,1173,1113,1174,1173,1113,1114,1174,1114,1175,1174,1114,1115,1175,1115,1176,1175,1115,1116,1176,1116,1177,1176,1116,1117,1177,1117,1178,1177,1117,1118,1178,1118,1179,1178,1118,1119,1179,1119,1180,1179,1119,1120,1180,1120,1181,1180,1120,1121,1181,1121,1182,1181,1121,1122,1182,1122,1183,1182,1122,1123,1183,1123,1184,1183,1123,1124,1184,1124,1185,1184,1124,1125,1185,1125,1186,1185,1125,1126,1186,1126,1187,1186,1126,1127,1187,1127,1188,1187,1127,1128,1188,1128,1189,1188,1128,1129,1189,1129,1190,1189,1129,1130,1190,1130,1191,1190,1130,1131,1191,1131,1192,1191,1131,1132,1192,1132,1193,1192,1132,1133,1193,1133,1194,1193,1133,1134,1194,1134,1195,1194,1134,1135,1195,1135,1196,1195,1135,1136,1196,1136,1197,1196,1136,1137,1197,1137,1198,1197,1137,1138,1198,1138,1199,1198,1138,1139,1199,1139,1200,1199,1139,1140,1200,1140,1201,1200,1140,1141,1201,1141,1202,1201,1141,1142,1202,1142,1203,1202,1142,1143,1203,1143,1204,1203,1143,1144,1204,1144,1205,1204,1144,1145,1205,1145,1206,1205,1145,1146,1206,1146,1207,1206,1146,1147,1207,1147,1208,1207,1147,1148,1208,1148,1209,1208,1148,1149,1209,1149,1210,1209,1149,1150,1210,1150,1211,1210,1150,1151,1211,1151,1212,1211,1151,1152,1212,1152,1213,1212,1152,1153,1213,1153,1214,1213,1153,1154,1214,1154,1215,1214,1154,1155,1215,1155,1216,1215,1155,1156,1216,1156,1217,1216,1156,1157,1217,1157,1218,1217,1157,1158,1218,1158,1219,1218,1159,1160,1220,1160,1221,1220,1160,1161,1221,1161,1222,1221,1161,1162,1222,1162,1223,1222,1162,1163,1223,1163,1224,1223,1163,1164,1224,1164,1225,1224,1164,1165,1225,1165,1226,1225,1165,1166,1226,1166,1227,1226,1166,1167,1227,1167,1228,1227,1167,1168,1228,1168,1229,1228,1168,1169,1229,1169,1230,1229,1169,1170,1230,1170,1231,1230,1170,1171,1231,1171,1232,1231,1171,1172,1232,1172,1233,1232,1172,1173,1233,1173,1234,1233,1173,1174,1234,1174,1235,1234,1174,1175,1235,1175,1236,1235,1175,1176,1236,1176,1237,1236,1176,1177,1237,1177,1238,1237,1177,1178,1238,1178,1239,1238,1178,1179,1239,1179,1240,1239,1179,1180,1240,1180,1241,1240,1180,1181,1241,1181,1242,1241,1181,1182,1242,1182,1243,1242,1182,1183,1243,1183,1244,1243,1183,1184,1244,1184,1245,1244,1184,1185,1245,1185,1246,1245,1185,1186,1246,1186,1247,1246,1186,1187,1247,1187,1248,1247,1187,1188,1248,1188,1249,1248,1188,1189,1249,1189,1250,1249,1189,1190,1250,1190,1251,1250,1190,1191,1251,1191,1252,1251,1191,1192,1252,1192,1253,1252,1192,1193,1253,1193,1254,1253,1193,1194,1254,1194,1255,1254,1194,1195,1255,1195,1256,1255,1195,1196,1256,1196,1257,1256,1196,1197,1257,1197,1258,1257,1197,1198,1258,1198,1259,1258,1198,1199,1259,1199,1260,1259,1199,1200,1260,1200,1261,1260,1200,1201,1261,1201,1262,1261,1201,1202,1262,1202,1263,1262,1202,1203,1263,1203,1264,1263,1203,1204,1264,1204,1265,1264,1204,1205,1265,1205,1266,1265,1205,1206,1266,1206,1267,1266,1206,1207,1267,1207,1268,1267,1207,1208,1268,1208,1269,1268,1208,1209,1269,1209,1270,1269,1209,1210,1270,1210,1271,1270,1210,1211,1271,1211,1272,1271,1211,1212,1272,1212,1273,1272,1212,1213,1273,1213,1274,1273,1213,1214,1274,1214,1275,1274,1214,1215,1275,1215,1276,1275,1215,1216,1276,1216,1277,1276,1216,1217,1277,1217,1278,1277,1217,1218,1278,1218,1279,1278,1218,1219,1279,1219,1280,1279,1220,1221,1281,1221,1282,1281,1221,1222,1282,1222,1283,1282,1222,1223,1283,1223,1284,1283,1223,1224,1284,1224,1285,1284,1224,1225,1285,1225,1286,1285,1225,1226,1286,1226,1287,1286,1226,1227,1287,1227,1288,1287,1227,1228,1288,1228,1289,1288,1228,1229,1289,1229,1290,1289,1229,1230,1290,1230,1291,1290,1230,1231,1291,1231,1292,1291,1231,1232,1292,1232,1293,1292,1232,1233,1293,1233,1294,1293,1233,1234,1294,1234,1295,1294,1234,1235,1295,1235,1296,1295,1235,1236,1296,1236,1297,1296,1236,1237,1297,1237,1298,1297,1237,1238,1298,1238,1299,1298,1238,1239,1299,1239,1300,1299,1239,1240,1300,1240,1301,1300,1240,1241,1301,1241,1302,1301,1241,1242,1302,1242,1303,1302,1242,1243,1303,1243,1304,1303,1243,1244,1304,1244,1305,1304,1244,1245,1305,1245,1306,1305,1245,1246,1306,1246,1307,1306,1246,1247,1307,1247,1308,1307,1247,1248,1308,1248,1309,1308,1248,1249,1309,1249,1310,1309,1249,1250,1310,1250,1311,1310,1250,1251,1311,1251,1312,1311,1251,1252,1312,1252,1313,1312,1252,1253,1313,1253,1314,1313,1253,1254,1314,1254,1315,1314,1254,1255,1315,1255,1316,1315,1255,1256,1316,1256,1317,1316,1256,1257,1317,1257,1318,1317,1257,1258,1318,1258,1319,1318,1258,1259,1319,1259,1320,1319,1259,1260,1320,1260,1321,1320,1260,1261,1321,1261,1322,1321,1261,1262,1322,1262,1323,1322,1262,1263,1323,1263,1324,1323,1263,1264,1324,1264,1325,1324,1264,1265,1325,1265,1326,1325,1265,1266,1326,1266,1327,1326,1266,1267,1327,1267,1328,1327,1267,1268,1328,1268,1329,1328,1268,1269,1329,1269,1330,1329,1269,1270,1330,1270,1331,1330,1270,1271,1331,1271,1332,1331,1271,1272,1332,1272,1333,1332,1272,1273,1333,1273,1334,1333,1273,1274,1334,1274,1335,1334,1274,1275,1335,1275,1336,1335,1275,1276,1336,1276,1337,1336,1276,1277,1337,1277,1338,1337,1277,1278,1338,1278,1339,1338,1278,1279,1339,1279,1340,1339,1279,1280,1340,1280,1341,1340,1281,1282,1342,1282,1343,1342,1282,1283,1343,1283,1344,1343,1283,1284,1344,1284,1345,1344,1284,1285,1345,1285,1346,1345,1285,1286,1346,1286,1347,1346,1286,1287,1347,1287,1348,1347,1287,1288,1348,1288,1349,1348,1288,1289,1349,1289,1350,1349,1289,1290,1350,1290,1351,1350,1290,1291,1351,1291,1352,1351,1291,1292,1352,1292,1353,1352,1292,1293,1353,1293,1354,1353,1293,1294,1354,1294,1355,1354,1294,1295,1355,1295,1356,1355,1295,1296,1356,1296,1357,1356,1296,1297,1357,1297,1358,1357,1297,1298,1358,1298,1359,1358,1298,1299,1359,1299,1360,1359,1299,1300,1360,1300,1361,1360,1300,1301,1361,1301,1362,1361,1301,1302,1362,1302,1363,1362,1302,1303,1363,1303,1364,1363,1303,1304,1364,1304,1365,1364,1304,1305,1365,1305,1366,1365,1305,1306,1366,1306,1367,1366,1306,1307,1367,1307,1368,1367,1307,1308,1368,1308,1369,1368,1308,1309,1369,1309,1370,1369,1309,1310,1370,1310,1371,1370,1310,1311,1371,1311,1372,1371,1311,1312,1372,1312,1373,1372,1312,1313,1373,1313,1374,1373,1313,1314,1374,1314,1375,1374,1314,1315,1375,1315,1376,1375,1315,1316,1376,1316,1377,1376,1316,1317,1377,1317,1378,1377,1317,1318,1378,1318,1379,1378,1318,1319,1379,1319,1380,1379,1319,1320,1380,1320,1381,1380,1320,1321,1381,1321,1382,1381,1321,1322,1382,1322,1383,1382,1322,1323,1383,1323,1384,1383,1323,1324,1384,1324,1385,1384,1324,1325,1385,1325,1386,1385,1325,1326,1386,1326,1387,1386,1326,1327,1387,1327,1388,1387,1327,1328,1388,1328,1389,1388,1328,1329,1389,1329,1390,1389,1329,1330,1390,1330,1391,1390,1330,1331,1391,1331,1392,1391,1331,1332,1392,1332,1393,1392,1332,1333,1393,1333,1394,1393,1333,1334,1394,1334,1395,1394,1334,1335,1395,1335,1396,1395,1335,1336,1396,1336,1397,1396,1336,1337,1397,1337,1398,1397,1337,1338,1398,1338,1399,1398,1338,1339,1399,1339,1400,1399,1339,1340,1400,1340,1401,1400,1340,1341,1401,1341,1402,1401,1342,1343,1403,1343,1404,1403,1343,1344,1404,1344,1405,1404,1344,1345,1405,1345,1406,1405,1345,1346,1406,1346,1407,1406,1346,1347,1407,1347,1408,1407,1347,1348,1408,1348,1409,1408,1348,1349,1409,1349,1410,1409,1349,1350,1410,1350,1411,1410,1350,1351,1411,1351,1412,1411,1351,1352,1412,1352,1413,1412,1352,1353,1413,1353,1414,1413,1353,1354,1414,1354,1415,1414,1354,1355,1415,1355,1416,1415,1355,1356,1416,1356,1417,1416,1356,1357,1417,1357,1418,1417,1357,1358,1418,1358,1419,1418,1358,1359,1419,1359,1420,1419,1359,1360,1420,1360,1421,1420,1360,1361,1421,1361,1422,1421,1361,1362,1422,1362,1423,1422,1362,1363,1423,1363,1424,1423,1363,1364,1424,1364,1425,1424,1364,1365,1425,1365,1426,1425,1365,1366,1426,1366,1427,1426,1366,1367,1427,1367,1428,1427,1367,1368,1428,1368,1429,1428,1368,1369,1429,1369,1430,1429,1369,1370,1430,1370,1431,1430,1370,1371,1431,1371,1432,1431,1371,1372,1432,1372,1433,1432,1372,1373,1433,1373,1434,1433,1373,1374,1434,1374,1435,1434,1374,1375,1435,1375,1436,1435,1375,1376,1436,1376,1437,1436,1376,1377,1437,1377,1438,1437,1377,1378,1438,1378,1439,1438,1378,1379,1439,1379,1440,1439,1379,1380,1440,1380,1441,1440,1380,1381,1441,1381,1442,1441,1381,1382,1442,1382,1443,1442,1382,1383,1443,1383,1444,1443,1383,1384,1444,1384,1445,1444,1384,1385,1445,1385,1446,1445,1385,1386,1446,1386,1447,1446,1386,1387,1447,1387,1448,1447,1387,1388,1448,1388,1449,1448,1388,1389,1449,1389,1450,1449,1389,1390,1450,1390,1451,1450,1390,1391,1451,1391,1452,1451,1391,1392,1452,1392,1453,1452,1392,1393,1453,1393,1454,1453,1393,1394,1454,1394,1455,1454,1394,1395,1455,1395,1456,1455,1395,1396,1456,1396,1457,1456,1396,1397,1457,1397,1458,1457,1397,1398,1458,1398,1459,1458,1398,1399,1459,1399,1460,1459,1399,1400,1460,1400,1461,1460,1400,1401,1461,1401,1462,1461,1401,1402,1462,1402,1463,1462,1403,1404,1464,1404,1465,1464,1404,1405,1465,1405,1466,1465,1405,1406,1466,1406,1467,1466,1406,1407,1467,1407,1468,1467,1407,1408,1468,1408,1469,1468,1408,1409,1469,1409,1470,1469,1409,1410,1470,1410,1471,1470,1410,1411,1471,1411,1472,1471,1411,1412,1472,1412,1473,1472,1412,1413,1473,1413,1474,1473,1413,1414,1474,1414,1475,1474,1414,1415,1475,1415,1476,1475,1415,1416,1476,1416,1477,1476,1416,1417,1477,1417,1478,1477,1417,1418,1478,1418,1479,1478,1418,1419,1479,1419,1480,1479,1419,1420,1480,1420,1481,1480,1420,1421,1481,1421,1482,1481,1421,1422,1482,1422,1483,1482,1422,1423,1483,1423,1484,1483,1423,1424,1484,1424,1485,1484,1424,1425,1485,1425,1486,1485,1425,1426,1486,1426,1487,1486,1426,1427,1487,1427,1488,1487,1427,1428,1488,1428,1489,1488,1428,1429,1489,1429,1490,1489,1429,1430,1490,1430,1491,1490,1430,1431,1491,1431,1492,1491,1431,1432,1492,1432,1493,1492,1432,1433,1493,1433,1494,1493,1433,1434,1494,1434,1495,1494,1434,1435,1495,1435,1496,1495,1435,1436,1496,1436,1497,1496,1436,1437,1497,1437,1498,1497,1437,1438,1498,1438,1499,1498,1438,1439,1499,1439,1500,1499,1439,1440,1500,1440,1501,1500,1440,1441,1501,1441,1502,1501,1441,1442,1502,1442,1503,1502,1442,1443,1503,1443,1504,1503,1443,1444,1504,1444,1505,1504,1444,1445,1505,1445,1506,1505,1445,1446,1506,1446,1507,1506,1446,1447,1507,1447,1508,1507,1447,1448,1508,1448,1509,1508,1448,1449,1509,1449,1510,1509,1449,1450,1510,1450,1511,1510,1450,1451,1511,1451,1512,1511,1451,1452,1512,1452,1513,1512,1452,1453,1513,1453,1514,1513,1453,1454,1514,1454,1515,1514,1454,1455,1515,1455,1516,1515,1455,1456,1516,1456,1517,1516,1456,1457,1517,1457,1518,1517,1457,1458,1518,1458,1519,1518,1458,1459,1519,1459,1520,1519,1459,1460,1520,1460,1521,1520,1460,1461,1521,1461,1522,1521,1461,1462,1522,1462,1523,1522,1462,1463,1523,1463,1524,1523,1464,1465,1525,1465,1526,1525,1465,1466,1526,1466,1527,1526,1466,1467,1527,1467,1528,1527,1467,1468,1528,1468,1529,1528,1468,1469,1529,1469,1530,1529,1469,1470,1530,1470,1531,1530,1470,1471,1531,1471,1532,1531,1471,1472,1532,1472,1533,1532,1472,1473,1533,1473,1534,1533,1473,1474,1534,1474,1535,1534,1474,1475,1535,1475,1536,1535,1475,1476,1536,1476,1537,1536,1476,1477,1537,1477,1538,1537,1477,1478,1538,1478,1539,1538,1478,1479,1539,1479,1540,1539,1479,1480,1540,1480,1541,1540,1480,1481,1541,1481,1542,1541,1481,1482,1542,1482,1543,1542,1482,1483,1543,1483,1544,1543,1483,1484,1544,1484,1545,1544,1484,1485,1545,1485,1546,1545,1485,1486,1546,1486,1547,1546,1486,1487,1547,1487,1548,1547,1487,1488,1548,1488,1549,1548,1488,1489,1549,1489,1550,1549,1489,1490,1550,1490,1551,1550,1490,1491,1551,1491,1552,1551,1491,1492,1552,1492,1553,1552,1492,1493,1553,1493,1554,1553,1493,1494,1554,1494,1555,1554,1494,1495,1555,1495,1556,1555,1495,1496,1556,1496,1557,1556,1496,1497,1557,1497,1558,1557,1497,1498,1558,1498,1559,1558,1498,1499,1559,1499,1560,1559,1499,1500,1560,1500,1561,1560,1500,1501,1561,1501,1562,1561,1501,1502,1562,1502,1563,1562,1502,1503,1563,1503,1564,1563,1503,1504,1564,1504,1565,1564,1504,1505,1565,1505,1566,1565,1505,1506,1566,1506,1567,1566,1506,1507,1567,1507,1568,1567,1507,1508,1568,1508,1569,1568,1508,1509,1569,1509,1570,1569,1509,1510,1570,1510,1571,1570,1510,1511,1571,1511,1572,1571,1511,1512,1572,1512,1573,1572,1512,1513,1573,1513,1574,1573,1513,1514,1574,1514,1575,1574,1514,1515,1575,1515,1576,1575,1515,1516,1576,1516,1577,1576,1516,1517,1577,1517,1578,1577,1517,1518,1578,1518,1579,1578,1518,1519,1579,1519,1580,1579,1519,1520,1580,1520,1581,1580,1520,1521,1581,1521,1582,1581,1521,1522,1582,1522,1583,1582,1522,1523,1583,1523,1584,1583,1523,1524,1584,1524,1585,1584,1525,1526,1586,1526,1587,1586,1526,1527,1587,1527,1588,1587,1527,1528,1588,1528,1589,1588,1528,1529,1589,1529,1590,1589,1529,1530,1590,1530,1591,1590,1530,1531,1591,1531,1592,1591,1531,1532,1592,1532,1593,1592,1532,1533,1593,1533,1594,1593,1533,1534,1594,1534,1595,1594,1534,1535,1595,1535,1596,1595,1535,1536,1596,1536,1597,1596,1536,1537,1597,1537,1598,1597,1537,1538,1598,1538,1599,1598,1538,1539,1599,1539,1600,1599,1539,1540,1600,1540,1601,1600,1540,1541,1601,1541,1602,1601,1541,1542,1602,1542,1603,1602,1542,1543,1603,1543,1604,1603,1543,1544,1604,1544,1605,1604,1544,1545,1605,1545,1606,1605,1545,1546,1606,1546,1607,1606,1546,1547,1607,1547,1608,1607,1547,1548,1608,1548,1609,1608,1548,1549,1609,1549,1610,1609,1549,1550,1610,1550,1611,1610,1550,1551,1611,1551,1612,1611,1551,1552,1612,1552,1613,1612,1552,1553,1613,1553,1614,1613,1553,1554,1614,1554,1615,1614,1554,1555,1615,1555,1616,1615,1555,1556,1616,1556,1617,1616,1556,1557,1617,1557,1618,1617,1557,1558,1618,1558,1619,1618,1558,1559,1619,1559,1620,1619,1559,1560,1620,1560,1621,1620,1560,1561,1621,1561,1622,1621,1561,1562,1622,1562,1623,1622,1562,1563,1623,1563,1624,1623,1563,1564,1624,1564,1625,1624,1564,1565,1625,1565,1626,1625,1565,1566,1626,1566,1627,1626,1566,1567,1627,1567,1628,1627,1567,1568,1628,1568,1629,1628,1568,1569,1629,1569,1630,1629,1569,1570,1630,1570,1631,1630,1570,1571,1631,1571,1632,1631,1571,1572,1632,1572,1633,1632,1572,1573,1633,1573,1634,1633,1573,1574,1634,1574,1635,1634,1574,1575,1635,1575,1636,1635,1575,1576,1636,1576,1637,1636,1576,1577,1637,1577,1638,1637,1577,1578,1638,1578,1639,1638,1578,1579,1639,1579,1640,1639,1579,1580,1640,1580,1641,1640,1580,1581,1641,1581,1642,1641,1581,1582,1642,1582,1643,1642,1582,1583,1643,1583,1644,1643,1583,1584,1644,1584,1645,1644,1584,1585,1645,1585,1646,1645,1586,1587,1647,1587,1648,1647,1587,1588,1648,1588,1649,1648,1588,1589,1649,1589,1650,1649,1589,1590,1650,1590,1651,1650,1590,1591,1651,1591,1652,1651,1591,1592,1652,1592,1653,1652,1592,1593,1653,1593,1654,1653,1593,1594,1654,1594,1655,1654,1594,1595,1655,1595,1656,1655,1595,1596,1656,1596,1657,1656,1596,1597,1657,1597,1658,1657,1597,1598,1658,1598,1659,1658,1598,1599,1659,1599,1660,1659,1599,1600,1660,1600,1661,1660,1600,1601,1661,1601,1662,1661,1601,1602,1662,1602,1663,1662,1602,1603,1663,1603,1664,1663,1603,1604,1664,1604,1665,1664,1604,1605,1665,1605,1666,1665,1605,1606,1666,1606,1667,1666,1606,1607,1667,1607,1668,1667,1607,1608,1668,1608,1669,1668,1608,1609,1669,1609,1670,1669,1609,1610,1670,1610,1671,1670,1610,1611,1671,1611,1672,1671,1611,1612,1672,1612,1673,1672,1612,1613,1673,1613,1674,1673,1613,1614,1674,1614,1675,1674,1614,1615,1675,1615,1676,1675,1615,1616,1676,1616,1677,1676,1616,1617,1677,1617,1678,1677,1617,1618,1678,1618,1679,1678,1618,1619,1679,1619,1680,1679,1619,1620,1680,1620,1681,1680,1620,1621,1681,1621,1682,1681,1621,1622,1682,1622,1683,1682,1622,1623,1683,1623,1684,1683,1623,1624,1684,1624,1685,1684,1624,1625,1685,1625,1686,1685,1625,1626,1686,1626,1687,1686,1626,1627,1687,1627,1688,1687,1627,1628,1688,1628,1689,1688,1628,1629,1689,1629,1690,1689,1629,1630,1690,1630,1691,1690,1630,1631,1691,1631,1692,1691,1631,1632,1692,1632,1693,1692,1632,1633,1693,1633,1694,1693,1633,1634,1694,1634,1695,1694,1634,1635,1695,1635,1696,1695,1635,1636,1696,1636,1697,1696,1636,1637,1697,1637,1698,1697,1637,1638,1698,1638,1699,1698,1638,1639,1699,1639,1700,1699,1639,1640,1700,1640,1701,1700,1640,1641,1701,1641,1702,1701,1641,1642,1702,1642,1703,1702,1642,1643,1703,1643,1704,1703,1643,1644,1704,1644,1705,1704,1644,1645,1705,1645,1706,1705,1645,1646,1706,1646,1707,1706,1647,1648,1708,1648,1709,1708,1648,1649,1709,1649,1710,1709,1649,1650,1710,1650,1711,1710,1650,1651,1711,1651,1712,1711,1651,1652,1712,1652,1713,1712,1652,1653,1713,1653,1714,1713,1653,1654,1714,1654,1715,1714,1654,1655,1715,1655,1716,1715,1655,1656,1716,1656,1717,1716,1656,1657,1717,1657,1718,1717,1657,1658,1718,1658,1719,1718,1658,1659,1719,1659,1720,1719,1659,1660,1720,1660,1721,1720,1660,1661,1721,1661,1722,1721,1661,1662,1722,1662,1723,1722,1662,1663,1723,1663,1724,1723,1663,1664,1724,1664,1725,1724,1664,1665,1725,1665,1726,1725,1665,1666,1726,1666,1727,1726,1666,1667,1727,1667,1728,1727,1667,1668,1728,1668,1729,1728,1668,1669,1729,1669,1730,1729,1669,1670,1730,1670,1731,1730,1670,1671,1731,1671,1732,1731,1671,1672,1732,1672,1733,1732,1672,1673,1733,1673,1734,1733,1673,1674,1734,1674,1735,1734,1674,1675,1735,1675,1736,1735,1675,1676,1736,1676,1737,1736,1676,1677,1737,1677,1738,1737,1677,1678,1738,1678,1739,1738,1678,1679,1739,1679,1740,1739,1679,1680,1740,1680,1741,1740,1680,1681,1741,1681,1742,1741,1681,1682,1742,1682,1743,1742,1682,1683,1743,1683,1744,1743,1683,1684,1744,1684,1745,1744,1684,1685,1745,1685,1746,1745,1685,1686,1746,1686,1747,1746,1686,1687,1747,1687,1748,1747,1687,1688,1748,1688,1749,1748,1688,1689,1749,1689,1750,1749,1689,1690,1750,1690,1751,1750,1690,1691,1751,1691,1752,1751,1691,1692,1752,1692,1753,1752,1692,1693,1753,1693,1754,1753,1693,1694,1754,1694,1755,1754,1694,1695,1755,1695,1756,1755,1695,1696,1756,1696,1757,1756,1696,1697,1757,1697,1758,1757,1697,1698,1758,1698,1759,1758,1698,1699,1759,1699,1760,1759,1699,1700,1760,1700,1761,1760,1700,1701,1761,1701,1762,1761,1701,1702,1762,1702,1763,1762,1702,1703,1763,1703,1764,1763,1703,1704,1764,1704,1765,1764,1704,1705,1765,1705,1766,1765,1705,1706,1766,1706,1767,1766,1706,1707,1767,1707,1768,1767,1708,1709,1769,1709,1770,1769,1709,1710,1770,1710,1771,1770,1710,1711,1771,1711,1772,1771,1711,1712,1772,1712,1773,1772,1712,1713,1773,1713,1774,1773,1713,1714,1774,1714,1775,1774,1714,1715,1775,1715,1776,1775,1715,1716,1776,1716,1777,1776,1716,1717,1777,1717,1778,1777,1717,1718,1778,1718,1779,1778,1718,1719,1779,1719,1780,1779,1719,1720,1780,1720,1781,1780,1720,1721,1781,1721,1782,1781,1721,1722,1782,1722,1783,1782,1722,1723,1783,1723,1784,1783,1723,1724,1784,1724,1785,1784,1724,1725,1785,1725,1786,1785,1725,1726,1786,1726,1787,1786,1726,1727,1787,1727,1788,1787,1727,1728,1788,1728,1789,1788,1728,1729,1789,1729,1790,1789,1729,1730,1790,1730,1791,1790,1730,1731,1791,1731,1792,1791,1731,1732,1792,1732,1793,1792,1732,1733,1793,1733,1794,1793,1733,1734,1794,1734,1795,1794,1734,1735,1795,1735,1796,1795,1735,1736,1796,1736,1797,1796,1736,1737,1797,1737,1798,1797,1737,1738,1798,1738,1799,1798,1738,1739,1799,1739,1800,1799,1739,1740,1800,1740,1801,1800,1740,1741,1801,1741,1802,1801,1741,1742,1802,1742,1803,1802,1742,1743,1803,1743,1804,1803,1743,1744,1804,1744,1805,1804,1744,1745,1805,1745,1806,1805,1745,1746,1806,1746,1807,1806,1746,1747,1807,1747,1808,1807,1747,1748,1808,1748,1809,1808,1748,1749,1809,1749,1810,1809,1749,1750,1810,1750,1811,1810,1750,1751,1811,1751,1812,1811,1751,1752,1812,1752,1813,1812,1752,1753,1813,1753,1814,1813,1753,1754,1814,1754,1815,1814,1754,1755,1815,1755,1816,1815,1755,1756,1816,1756,1817,1816,1756,1757,1817,1757,1818,1817,1757,1758,1818,1758,1819,1818,1758,1759,1819,1759,1820,1819,1759,1760,1820,1760,1821,1820,1760,1761,1821,1761,1822,1821,1761,1762,1822,1762,1823,1822,1762,1763,1823,1763,1824,1823,1763,1764,1824,1764,1825,1824,1764,1765,1825,1765,1826,1825,1765,1766,1826,1766,1827,1826,1766,1767,1827,1767,1828,1827,1767,1768,1828,1768,1829,1828,1769,1770,1830,1770,1831,1830,1770,1771,1831,1771,1832,1831,1771,1772,1832,1772,1833,1832,1772,1773,1833,1773,1834,1833,1773,1774,1834,1774,1835,1834,1774,1775,1835,1775,1836,1835,1775,1776,1836,1776,1837,1836,1776,1777,1837,1777,1838,1837,1777,1778,1838,1778,1839,1838,1778,1779,1839,1779,1840,1839,1779,1780,1840,1780,1841,1840,1780,1781,1841,1781,1842,1841,1781,1782,1842,1782,1843,1842,1782,1783,1843,1783,1844,1843,1783,1784,1844,1784,1845,1844,1784,1785,1845,1785,1846,1845,1785,1786,1846,1786,1847,1846,1786,1787,1847,1787,1848,1847,1787,1788,1848,1788,1849,1848,1788,1789,1849,1789,1850,1849,1789,1790,1850,1790,1851,1850,1790,1791,1851,1791,1852,1851,1791,1792,1852,1792,1853,1852,1792,1793,1853,1793,1854,1853,1793,1794,1854,1794,1855,1854,1794,1795,1855,1795,1856,1855,1795,1796,1856,1796,1857,1856,1796,1797,1857,1797,1858,1857,1797,1798,1858,1798,1859,1858,1798,1799,1859,1799,1860,1859,1799,1800,1860,1800,1861,1860,1800,1801,1861,1801,1862,1861,1801,1802,1862,1802,1863,1862,1802,1803,1863,1803,1864,1863,1803,1804,1864,1804,1865,1864,1804,1805,1865,1805,1866,1865,1805,1806,1866,1806,1867,1866,1806,1807,1867,1807,1868,1867,1807,1808,1868,1808,1869,1868,1808,1809,1869,1809,1870,1869,1809,1810,1870,1810,1871,1870,1810,1811,1871,1811,1872,1871,1811,1812,1872,1812,1873,1872,1812,1813,1873,1813,1874,1873,1813,1814,1874,1814,1875,1874,1814,1815,1875,1815,1876,1875,1815,1816,1876,1816,1877,1876,1816,1817,1877,1817,1878,1877,1817,1818,1878,1818,1879,1878,1818,1819,1879,1819,1880,1879,1819,1820,1880,1820,1881,1880,1820,1821,1881,1821,1882,1881,1821,1822,1882,1822,1883,1882,1822,1823,1883,1823,1884,1883,1823,1824,1884,1824,1885,1884,1824,1825,1885,1825,1886,1885,1825,1826,1886,1826,1887,1886,1826,1827,1887,1827,1888,1887,1827,1828,1888,1828,1889,1888,1828,1829,1889,1829,1890,1889,1830,1831,1891,1831,1892,1891,1831,1832,1892,1832,1893,1892,1832,1833,1893,1833,1894,1893,1833,1834,1894,1834,1895,1894,1834,1835,1895,1835,1896,1895,1835,1836,1896,1836,1897,1896,1836,1837,1897,1837,1898,1897,1837,1838,1898,1838,1899,1898,1838,1839,1899,1839,1900,1899,1839,1840,1900,1840,1901,1900,1840,1841,1901,1841,1902,1901,1841,1842,1902,1842,1903,1902,1842,1843,1903,1843,1904,1903,1843,1844,1904,1844,1905,1904,1844,1845,1905,1845,1906,1905,1845,1846,1906,1846,1907,1906,1846,1847,1907,1847,1908,1907,1847,1848,1908,1848,1909,1908,1848,1849,1909,1849,1910,1909,1849,1850,1910,1850,1911,1910,1850,1851,1911,1851,1912,1911,1851,1852,1912,1852,1913,1912,1852,1853,1913,1853,1914,1913,1853,1854,1914,1854,1915,1914,1854,1855,1915,1855,1916,1915,1855,1856,1916,1856,1917,1916,1856,1857,1917,1857,1918,1917,1857,1858,1918,1858,1919,1918,1858,1859,1919,1859,1920,1919,1859,1860,1920,1860,1921,1920,1860,1861,1921,1861,1922,1921,1861,1862,1922,1862,1923,1922,1862,1863,1923,1863,1924,1923,1863,1864,1924,1864,1925,1924,1864,1865,1925,1865,1926,1925,1865,1866,1926,1866,1927,1926,1866,1867,1927,1867,1928,1927,1867,1868,1928,1868,1929,1928,1868,1869,1929,1869,1930,1929,1869,1870,1930,1870,1931,1930,1870,1871,1931,1871,1932,1931,1871,1872,1932,1872,1933,1932,1872,1873,1933,1873,1934,1933,1873,1874,1934,1874,1935,1934,1874,1875,1935,1875,1936,1935,1875,1876,1936,1876,1937,1936,1876,1877,1937,1877,1938,1937,1877,1878,1938,1878,1939,1938,1878,1879,1939,1879,1940,1939,1879,1880,1940,1880,1941,1940,1880,1881,1941,1881,1942,1941,1881,1882,1942,1882,1943,1942,1882,1883,1943,1883,1944,1943,1883,1884,1944,1884,1945,1944,1884,1885,1945,1885,1946,1945,1885,1886,1946,1886,1947,1946,1886,1887,1947,1887,1948,1947,1887,1888,1948,1888,1949,1948,1888,1889,1949,1889,1950,1949,1889,1890,1950,1890,1951,1950,1891,1892,1952,1892,1953,1952,1892,1893,1953,1893,1954,1953,1893,1894,1954,1894,1955,1954,1894,1895,1955,1895,1956,1955,1895,1896,1956,1896,1957,1956,1896,1897,1957,1897,1958,1957,1897,1898,1958,1898,1959,1958,1898,1899,1959,1899,1960,1959,1899,1900,1960,1900,1961,1960,1900,1901,1961,1901,1962,1961,1901,1902,1962,1902,1963,1962,1902,1903,1963,1903,1964,1963,1903,1904,1964,1904,1965,1964,1904,1905,1965,1905,1966,1965,1905,1906,1966,1906,1967,1966,1906,1907,1967,1907,1968,1967,1907,1908,1968,1908,1969,1968,1908,1909,1969,1909,1970,1969,1909,1910,1970,1910,1971,1970,1910,1911,1971,1911,1972,1971,1911,1912,1972,1912,1973,1972,1912,1913,1973,1913,1974,1973,1913,1914,1974,1914,1975,1974,1914,1915,1975,1915,1976,1975,1915,1916,1976,1916,1977,1976,1916,1917,1977,1917,1978,1977,1917,1918,1978,1918,1979,1978,1918,1919,1979,1919,1980,1979,1919,1920,1980,1920,1981,1980,1920,1921,1981,1921,1982,1981,1921,1922,1982,1922,1983,1982,1922,1923,1983,1923,1984,1983,1923,1924,1984,1924,1985,1984,1924,1925,1985,1925,1986,1985,1925,1926,1986,1926,1987,1986,1926,1927,1987,1927,1988,1987,1927,1928,1988,1928,1989,1988,1928,1929,1989,1929,1990,1989,1929,1930,1990,1930,1991,1990,1930,1931,1991,1931,1992,1991,1931,1932,1992,1932,1993,1992,1932,1933,1993,1933,1994,1993,1933,1934,1994,1934,1995,1994,1934,1935,1995,1935,1996,1995,1935,1936,1996,1936,1997,1996,1936,1937,1997,1937,1998,1997,1937,1938,1998,1938,1999,1998,1938,1939,1999,1939,2000,1999,1939,1940,2000,1940,2001,2000,1940,1941,2001,1941,2002,2001,1941,1942,2002,1942,2003,2002,1942,1943,2003,1943,2004,2003,1943,1944,2004,1944,2005,2004,1944,1945,2005,1945,2006,2005,1945,1946,2006,1946,2007,2006,1946,1947,2007,1947,2008,2007,1947,1948,2008,1948,2009,2008,1948,1949,2009,1949,2010,2009,1949,1950,2010,1950,2011,2010,1950,1951,2011,1951,2012,2011,1952,1953,2013,1953,2014,2013,1953,1954,2014,1954,2015,2014,1954,1955,2015,1955,2016,2015,1955,1956,2016,1956,2017,2016,1956,1957,2017,1957,2018,2017,1957,1958,2018,1958,2019,2018,1958,1959,2019,1959,2020,2019,1959,1960,2020,1960,2021,2020,1960,1961,2021,1961,2022,2021,1961,1962,2022,1962,2023,2022,1962,1963,2023,1963,2024,2023,1963,1964,2024,1964,2025,2024,1964,1965,2025,1965,2026,2025,1965,1966,2026,1966,2027,2026,1966,1967,2027,1967,2028,2027,1967,1968,2028,1968,2029,2028,1968,1969,2029,1969,2030,2029,1969,1970,2030,1970,2031,2030,1970,1971,2031,1971,2032,2031,1971,1972,2032,1972,2033,2032,1972,1973,2033,1973,2034,2033,1973,1974,2034,1974,2035,2034,1974,1975,2035,1975,2036,2035,1975,1976,2036,1976,2037,2036,1976,1977,2037,1977,2038,2037,1977,1978,2038,1978,2039,2038,1978,1979,2039,1979,2040,2039,1979,1980,2040,1980,2041,2040,1980,1981,2041,1981,2042,2041,1981,1982,2042,1982,2043,2042,1982,1983,2043,1983,2044,2043,1983,1984,2044,1984,2045,2044,1984,1985,2045,1985,2046,2045,1985,1986,2046,1986,2047,2046,1986,1987,2047,1987,2048,2047,1987,1988,2048,1988,2049,2048,1988,1989,2049,1989,2050,2049,1989,1990,2050,1990,2051,2050,1990,1991,2051,1991,2052,2051,1991,1992,2052,1992,2053,2052,1992,1993,2053,1993,2054,2053,1993,1994,2054,1994,2055,2054,1994,1995,2055,1995,2056,2055,1995,1996,2056,1996,2057,2056,1996,1997,2057,1997,2058,2057,1997,1998,2058,1998,2059,2058,1998,1999,2059,1999,2060,2059,1999,2000,2060,2000,2061,2060,2000,2001,2061,2001,2062,2061,2001,2002,2062,2002,2063,2062,2002,2003,2063,2003,2064,2063,2003,2004,2064,2004,2065,2064,2004,2005,2065,2005,2066,2065,2005,2006,2066,2006,2067,2066,2006,2007,2067,2007,2068,2067,2007,2008,2068,2008,2069,2068,2008,2009,2069,2009,2070,2069,2009,2010,2070,2010,2071,2070,2010,2011,2071,2011,2072,2071,2011,2012,2072,2012,2073,2072,2013,2014,2074,2014,2075,2074,2014,2015,2075,2015,2076,2075,2015,2016,2076,2016,2077,2076,2016,2017,2077,2017,2078,2077,2017,2018,2078,2018,2079,2078,2018,2019,2079,2019,2080,2079,2019,2020,2080,2020,2081,2080,2020,2021,2081,2021,2082,2081,2021,2022,2082,2022,2083,2082,2022,2023,2083,2023,2084,2083,2023,2024,2084,2024,2085,2084,2024,2025,2085,2025,2086,2085,2025,2026,2086,2026,2087,2086,2026,2027,2087,2027,2088,2087,2027,2028,2088,2028,2089,2088,2028,2029,2089,2029,2090,2089,2029,2030,2090,2030,2091,2090,2030,2031,2091,2031,2092,2091,2031,2032,2092,2032,2093,2092,2032,2033,2093,2033,2094,2093,2033,2034,2094,2034,2095,2094,2034,2035,2095,2035,2096,2095,2035,2036,2096,2036,2097,2096,2036,2037,2097,2037,2098,2097,2037,2038,2098,2038,2099,2098,2038,2039,2099,2039,2100,2099,2039,2040,2100,2040,2101,2100,2040,2041,2101,2041,2102,2101,2041,2042,2102,2042,2103,2102,2042,2043,2103,2043,2104,2103,2043,2044,2104,2044,2105,2104,2044,2045,2105,2045,2106,2105,2045,2046,2106,2046,2107,2106,2046,2047,2107,2047,2108,2107,2047,2048,2108,2048,2109,2108,2048,2049,2109,2049,2110,2109,2049,2050,2110,2050,2111,2110,2050,2051,2111,2051,2112,2111,2051,2052,2112,2052,2113,2112,2052,2053,2113,2053,2114,2113,2053,2054,2114,2054,2115,2114,2054,2055,2115,2055,2116,2115,2055,2056,2116,2056,2117,2116,2056,2057,2117,2057,2118,2117,2057,2058,2118,2058,2119,2118,2058,2059,2119,2059,2120,2119,2059,2060,2120,2060,2121,2120,2060,2061,2121,2061,2122,2121,2061,2062,2122,2062,2123,2122,2062,2063,2123,2063,2124,2123,2063,2064,2124,2064,2125,2124,2064,2065,2125,2065,2126,2125,2065,2066,2126,2066,2127,2126,2066,2067,2127,2067,2128,2127,2067,2068,2128,2068,2129,2128,2068,2069,2129,2069,2130,2129,2069,2070,2130,2070,2131,2130,2070,2071,2131,2071,2132,2131,2071,2072,2132,2072,2133,2132,2072,2073,2133,2073,2134,2133,2074,2075,2135,2075,2136,2135,2075,2076,2136,2076,2137,2136,2076,2077,2137,2077,2138,2137,2077,2078,2138,2078,2139,2138,2078,2079,2139,2079,2140,2139,2079,2080,2140,2080,2141,2140,2080,2081,2141,2081,2142,2141,2081,2082,2142,2082,2143,2142,2082,2083,2143,2083,2144,2143,2083,2084,2144,2084,2145,2144,2084,2085,2145,2085,2146,2145,2085,2086,2146,2086,2147,2146,2086,2087,2147,2087,2148,2147,2087,2088,2148,2088,2149,2148,2088,2089,2149,2089,2150,2149,2089,2090,2150,2090,2151,2150,2090,2091,2151,2091,2152,2151,2091,2092,2152,2092,2153,2152,2092,2093,2153,2093,2154,2153,2093,2094,2154,2094,2155,2154,2094,2095,2155,2095,2156,2155,2095,2096,2156,2096,2157,2156,2096,2097,2157,2097,2158,2157,2097,2098,2158,2098,2159,2158,2098,2099,2159,2099,2160,2159,2099,2100,2160,2100,2161,2160,2100,2101,2161,2101,2162,2161,2101,2102,2162,2102,2163,2162,2102,2103,2163,2103,2164,2163,2103,2104,2164,2104,2165,2164,2104,2105,2165,2105,2166,2165,2105,2106,2166,2106,2167,2166,2106,2107,2167,2107,2168,2167,2107,2108,2168,2108,2169,2168,2108,2109,2169,2109,2170,2169,2109,2110,2170,2110,2171,2170,2110,2111,2171,2111,2172,2171,2111,2112,2172,2112,2173,2172,2112,2113,2173,2113,2174,2173,2113,2114,2174,2114,2175,2174,2114,2115,2175,2115,2176,2175,2115,2116,2176,2116,2177,2176,2116,2117,2177,2117,2178,2177,2117,2118,2178,2118,2179,2178,2118,2119,2179,2119,2180,2179,2119,2120,2180,2120,2181,2180,2120,2121,2181,2121,2182,2181,2121,2122,2182,2122,2183,2182,2122,2123,2183,2123,2184,2183,2123,2124,2184,2124,2185,2184,2124,2125,2185,2125,2186,2185,2125,2126,2186,2126,2187,2186,2126,2127,2187,2127,2188,2187,2127,2128,2188,2128,2189,2188,2128,2129,2189,2129,2190,2189,2129,2130,2190,2130,2191,2190,2130,2131,2191,2131,2192,2191,2131,2132,2192,2132,2193,2192,2132,2133,2193,2133,2194,2193,2133,2134,2194,2134,2195,2194,2135,2136,2196,2136,2197,2196,2136,2137,2197,2137,2198,2197,2137,2138,2198,2138,2199,2198,2138,2139,2199,2139,2200,2199,2139,2140,2200,2140,2201,2200,2140,2141,2201,2141,2202,2201,2141,2142,2202,2142,2203,2202,2142,2143,2203,2143,2204,2203,2143,2144,2204,2144,2205,2204,2144,2145,2205,2145,2206,2205,2145,2146,2206,2146,2207,2206,2146,2147,2207,2147,2208,2207,2147,2148,2208,2148,2209,2208,2148,2149,2209,2149,2210,2209,2149,2150,2210,2150,2211,2210,2150,2151,2211,2151,2212,2211,2151,2152,2212,2152,2213,2212,2152,2153,2213,2153,2214,2213,2153,2154,2214,2154,2215,2214,2154,2155,2215,2155,2216,2215,2155,2156,2216,2156,2217,2216,2156,2157,2217,2157,2218,2217,2157,2158,2218,2158,2219,2218,2158,2159,2219,2159,2220,2219,2159,2160,2220,2160,2221,2220,2160,2161,2221,2161,2222,2221,2161,2162,2222,2162,2223,2222,2162,2163,2223,2163,2224,2223,2163,2164,2224,2164,2225,2224,2164,2165,2225,2165,2226,2225,2165,2166,2226,2166,2227,2226,2166,2167,2227,2167,2228,2227,2167,2168,2228,2168,2229,2228,2168,2169,2229,2169,2230,2229,2169,2170,2230,2170,2231,2230,2170,2171,2231,2171,2232,2231,2171,2172,2232,2172,2233,2232,2172,2173,2233,2173,2234,2233,2173,2174,2234,2174,2235,2234,2174,2175,2235,2175,2236,2235,2175,2176,2236,2176,2237,2236,2176,2177,2237,2177,2238,2237,2177,2178,2238,2178,2239,2238,2178,2179,2239,2179,2240,2239,2179,2180,2240,2180,2241,2240,2180,2181,2241,2181,2242,2241,2181,2182,2242,2182,2243,2242,2182,2183,2243,2183,2244,2243,2183,2184,2244,2184,2245,2244,2184,2185,2245,2185,2246,2245,2185,2186,2246,2186,2247,2246,2186,2187,2247,2187,2248,2247,2187,2188,2248,2188,2249,2248,2188,2189,2249,2189,2250,2249,2189,2190,2250,2190,2251,2250,2190,2191,2251,2191,2252,2251,2191,2192,2252,2192,2253,2252,2192,2193,2253,2193,2254,2253,2193,2194,2254,2194,2255,2254,2194,2195,2255,2195,2256,2255,2196,2197,2257,2197,2258,2257,2197,2198,2258,2198,2259,2258,2198,2199,2259,2199,2260,2259,2199,2200,2260,2200,2261,2260,2200,2201,2261,2201,2262,2261,2201,2202,2262,2202,2263,2262,2202,2203,2263,2203,2264,2263,2203,2204,2264,2204,2265,2264,2204,2205,2265,2205,2266,2265,2205,2206,2266,2206,2267,2266,2206,2207,2267,2207,2268,2267,2207,2208,2268,2208,2269,2268,2208,2209,2269,2209,2270,2269,2209,2210,2270,2210,2271,2270,2210,2211,2271,2211,2272,2271,2211,2212,2272,2212,2273,2272,2212,2213,2273,2213,2274,2273,2213,2214,2274,2214,2275,2274,2214,2215,2275,2215,2276,2275,2215,2216,2276,2216,2277,2276,2216,2217,2277,2217,2278,2277,2217,2218,2278,2218,2279,2278,2218,2219,2279,2219,2280,2279,2219,2220,2280,2220,2281,2280,2220,2221,2281,2221,2282,2281,2221,2222,2282,2222,2283,2282,2222,2223,2283,2223,2284,2283,2223,2224,2284,2224,2285,2284,2224,2225,2285,2225,2286,2285,2225,2226,2286,2226,2287,2286,2226,2227,2287,2227,2288,2287,2227,2228,2288,2228,2289,2288,2228,2229,2289,2229,2290,2289,2229,2230,2290,2230,2291,2290,2230,2231,2291,2231,2292,2291,2231,2232,2292,2232,2293,2292,2232,2233,2293,2233,2294,2293,2233,2234,2294,2234,2295,2294,2234,2235,2295,2235,2296,2295,2235,2236,2296,2236,2297,2296,2236,2237,2297,2237,2298,2297,2237,2238,2298,2238,2299,2298,2238,2239,2299,2239,2300,2299,2239,2240,2300,2240,2301,2300,2240,2241,2301,2241,2302,2301,2241,2242,2302,2242,2303,2302,2242,2243,2303,2243,2304,2303,2243,2244,2304,2244,2305,2304,2244,2245,2305,2245,2306,2305,2245,2246,2306,2246,2307,2306,2246,2247,2307,2247,2308,2307,2247,2248,2308,2248,2309,2308,2248,2249,2309,2249,2310,2309,2249,2250,2310,2250,2311,2310,2250,2251,2311,2251,2312,2311,2251,2252,2312,2252,2313,2312,2252,2253,2313,2253,2314,2313,2253,2254,2314,2254,2315,2314,2254,2255,2315,2255,2316,2315,2255,2256,2316,2256,2317,2316,2257,2258,2318,2258,2319,2318,2258,2259,2319,2259,2320,2319,2259,2260,2320,2260,2321,2320,2260,2261,2321,2261,2322,2321,2261,2262,2322,2262,2323,2322,2262,2263,2323,2263,2324,2323,2263,2264,2324,2264,2325,2324,2264,2265,2325,2265,2326,2325,2265,2266,2326,2266,2327,2326,2266,2267,2327,2267,2328,2327,2267,2268,2328,2268,2329,2328,2268,2269,2329,2269,2330,2329,2269,2270,2330,2270,2331,2330,2270,2271,2331,2271,2332,2331,2271,2272,2332,2272,2333,2332,2272,2273,2333,2273,2334,2333,2273,2274,2334,2274,2335,2334,2274,2275,2335,2275,2336,2335,2275,2276,2336,2276,2337,2336,2276,2277,2337,2277,2338,2337,2277,2278,2338,2278,2339,2338,2278,2279,2339,2279,2340,2339,2279,2280,2340,2280,2341,2340,2280,2281,2341,2281,2342,2341,2281,2282,2342,2282,2343,2342,2282,2283,2343,2283,2344,2343,2283,2284,2344,2284,2345,2344,2284,2285,2345,2285,2346,2345,2285,2286,2346,2286,2347,2346,2286,2287,2347,2287,2348,2347,2287,2288,2348,2288,2349,2348,2288,2289,2349,2289,2350,2349,2289,2290,2350,2290,2351,2350,2290,2291,2351,2291,2352,2351,2291,2292,2352,2292,2353,2352,2292,2293,2353,2293,2354,2353,2293,2294,2354,2294,2355,2354,2294,2295,2355,2295,2356,2355,2295,2296,2356,2296,2357,2356,2296,2297,2357,2297,2358,2357,2297,2298,2358,2298,2359,2358,2298,2299,2359,2299,2360,2359,2299,2300,2360,2300,2361,2360,2300,2301,2361,2301,2362,2361,2301,2302,2362,2302,2363,2362,2302,2303,2363,2303,2364,2363,2303,2304,2364,2304,2365,2364,2304,2305,2365,2305,2366,2365,2305,2306,2366,2306,2367,2366,2306,2307,2367,2307,2368,2367,2307,2308,2368,2308,2369,2368,2308,2309,2369,2309,2370,2369,2309,2310,2370,2310,2371,2370,2310,2311,2371,2311,2372,2371,2311,2312,2372,2312,2373,2372,2312,2313,2373,2313,2374,2373,2313,2314,2374,2314,2375,2374,2314,2315,2375,2315,2376,2375,2315,2316,2376,2316,2377,2376,2316,2317,2377,2317,2378,2377,2318,2319,2379,2319,2380,2379,2319,2320,2380,2320,2381,2380,2320,2321,2381,2321,2382,2381,2321,2322,2382,2322,2383,2382,2322,2323,2383,2323,2384,2383,2323,2324,2384,2324,2385,2384,2324,2325,2385,2325,2386,2385,2325,2326,2386,2326,2387,2386,2326,2327,2387,2327,2388,2387,2327,2328,2388,2328,2389,2388,2328,2329,2389,2329,2390,2389,2329,2330,2390,2330,2391,2390,2330,2331,2391,2331,2392,2391,2331,2332,2392,2332,2393,2392,2332,2333,2393,2333,2394,2393,2333,2334,2394,2334,2395,2394,2334,2335,2395,2335,2396,2395,2335,2336,2396,2336,2397,2396,2336,2337,2397,2337,2398,2397,2337,2338,2398,2338,2399,2398,2338,2339,2399,2339,2400,2399,2339,2340,2400,2340,2401,2400,2340,2341,2401,2341,2402,2401,2341,2342,2402,2342,2403,2402,2342,2343,2403,2343,2404,2403,2343,2344,2404,2344,2405,2404,2344,2345,2405,2345,2406,2405,2345,2346,2406,2346,2407,2406,2346,2347,2407,2347,2408,2407,2347,2348,2408,2348,2409,2408,2348,2349,2409,2349,2410,2409,2349,2350,2410,2350,2411,2410,2350,2351,2411,2351,2412,2411,2351,2352,2412,2352,2413,2412,2352,2353,2413,2353,2414,2413,2353,2354,2414,2354,2415,2414,2354,2355,2415,2355,2416,2415,2355,2356,2416,2356,2417,2416,2356,2357,2417,2357,2418,2417,2357,2358,2418,2358,2419,2418,2358,2359,2419,2359,2420,2419,2359,2360,2420,2360,2421,2420,2360,2361,2421,2361,2422,2421,2361,2362,2422,2362,2423,2422,2362,2363,2423,2363,2424,2423,2363,2364,2424,2364,2425,2424,2364,2365,2425,2365,2426,2425,2365,2366,2426,2366,2427,2426,2366,2367,2427,2367,2428,2427,2367,2368,2428,2368,2429,2428,2368,2369,2429,2369,2430,2429,2369,2370,2430,2370,2431,2430,2370,2371,2431,2371,2432,2431,2371,2372,2432,2372,2433,2432,2372,2373,2433,2373,2434,2433,2373,2374,2434,2374,2435,2434,2374,2375,2435,2375,2436,2435,2375,2376,2436,2376,2437,2436,2376,2377,2437,2377,2438,2437,2377,2378,2438,2378,2439,2438,2379,2380,2440,2380,2441,2440,2380,2381,2441,2381,2442,2441,2381,2382,2442,2382,2443,2442,2382,2383,2443,2383,2444,2443,2383,2384,2444,2384,2445,2444,2384,2385,2445,2385,2446,2445,2385,2386,2446,2386,2447,2446,2386,2387,2447,2387,2448,2447,2387,2388,2448,2388,2449,2448,2388,2389,2449,2389,2450,2449,2389,2390,2450,2390,2451,2450,2390,2391,2451,2391,2452,2451,2391,2392,2452,2392,2453,2452,2392,2393,2453,2393,2454,2453,2393,2394,2454,2394,2455,2454,2394,2395,2455,2395,2456,2455,2395,2396,2456,2396,2457,2456,2396,2397,2457,2397,2458,2457,2397,2398,2458,2398,2459,2458,2398,2399,2459,2399,2460,2459,2399,2400,2460,2400,2461,2460,2400,2401,2461,2401,2462,2461,2401,2402,2462,2402,2463,2462,2402,2403,2463,2403,2464,2463,2403,2404,2464,2404,2465,2464,2404,2405,2465,2405,2466,2465,2405,2406,2466,2406,2467,2466,2406,2407,2467,2407,2468,2467,2407,2408,2468,2408,2469,2468,2408,2409,2469,2409,2470,2469,2409,2410,2470,2410,2471,2470,2410,2411,2471,2411,2472,2471,2411,2412,2472,2412,2473,2472,2412,2413,2473,2413,2474,2473,2413,2414,2474,2414,2475,2474,2414,2415,2475,2415,2476,2475,2415,2416,2476,2416,2477,2476,2416,2417,2477,2417,2478,2477,2417,2418,2478,2418,2479,2478,2418,2419,2479,2419,2480,2479,2419,2420,2480,2420,2481,2480,2420,2421,2481,2421,2482,2481,2421,2422,2482,2422,2483,2482,2422,2423,2483,2423,2484,2483,2423,2424,2484,2424,2485,2484,2424,2425,2485,2425,2486,2485,2425,2426,2486,2426,2487,2486,2426,2427,2487,2427,2488,2487,2427,2428,2488,2428,2489,2488,2428,2429,2489,2429,2490,2489,2429,2430,2490,2430,2491,2490,2430,2431,2491,2431,2492,2491,2431,2432,2492,2432,2493,2492,2432,2433,2493,2433,2494,2493,2433,2434,2494,2434,2495,2494,2434,2435,2495,2435,2496,2495,2435,2436,2496,2436,2497,2496,2436,2437,2497,2437,2498,2497,2437,2438,2498,2438,2499,2498,2438,2439,2499,2439,2500,2499,2440,2441,2501,2441,2502,2501,2441,2442,2502,2442,2503,2502,2442,2443,2503,2443,2504,2503,2443,2444,2504,2444,2505,2504,2444,2445,2505,2445,2506,2505,2445,2446,2506,2446,2507,2506,2446,2447,2507,2447,2508,2507,2447,2448,2508,2448,2509,2508,2448,2449,2509,2449,2510,2509,2449,2450,2510,2450,2511,2510,2450,2451,2511,2451,2512,2511,2451,2452,2512,2452,2513,2512,2452,2453,2513,2453,2514,2513,2453,2454,2514,2454,2515,2514,2454,2455,2515,2455,2516,2515,2455,2456,2516,2456,2517,2516,2456,2457,2517,2457,2518,2517,2457,2458,2518,2458,2519,2518,2458,2459,2519,2459,2520,2519,2459,2460,2520,2460,2521,2520,2460,2461,2521,2461,2522,2521,2461,2462,2522,2462,2523,2522,2462,2463,2523,2463,2524,2523,2463,2464,2524,2464,2525,2524,2464,2465,2525,2465,2526,2525,2465,2466,2526,2466,2527,2526,2466,2467,2527,2467,2528,2527,2467,2468,2528,2468,2529,2528,2468,2469,2529,2469,2530,2529,2469,2470,2530,2470,2531,2530,2470,2471,2531,2471,2532,2531,2471,2472,2532,2472,2533,2532,2472,2473,2533,2473,2534,2533,2473,2474,2534,2474,2535,2534,2474,2475,2535,2475,2536,2535,2475,2476,2536,2476,2537,2536,2476,2477,2537,2477,2538,2537,2477,2478,2538,2478,2539,2538,2478,2479,2539,2479,2540,2539,2479,2480,2540,2480,2541,2540,2480,2481,2541,2481,2542,2541,2481,2482,2542,2482,2543,2542,2482,2483,2543,2483,2544,2543,2483,2484,2544,2484,2545,2544,2484,2485,2545,2485,2546,2545,2485,2486,2546,2486,2547,2546,2486,2487,2547,2487,2548,2547,2487,2488,2548,2488,2549,2548,2488,2489,2549,2489,2550,2549,2489,2490,2550,2490,2551,2550,2490,2491,2551,2491,2552,2551,2491,2492,2552,2492,2553,2552,2492,2493,2553,2493,2554,2553,2493,2494,2554,2494,2555,2554,2494,2495,2555,2495,2556,2555,2495,2496,2556,2496,2557,2556,2496,2497,2557,2497,2558,2557,2497,2498,2558,2498,2559,2558,2498,2499,2559,2499,2560,2559,2499,2500,2560,2500,2561,2560,2501,2502,2562,2502,2563,2562,2502,2503,2563,2503,2564,2563,2503,2504,2564,2504,2565,2564,2504,2505,2565,2505,2566,2565,2505,2506,2566,2506,2567,2566,2506,2507,2567,2507,2568,2567,2507,2508,2568,2508,2569,2568,2508,2509,2569,2509,2570,2569,2509,2510,2570,2510,2571,2570,2510,2511,2571,2511,2572,2571,2511,2512,2572,2512,2573,2572,2512,2513,2573,2513,2574,2573,2513,2514,2574,2514,2575,2574,2514,2515,2575,2515,2576,2575,2515,2516,2576,2516,2577,2576,2516,2517,2577,2517,2578,2577,2517,2518,2578,2518,2579,2578,2518,2519,2579,2519,2580,2579,2519,2520,2580,2520,2581,2580,2520,2521,2581,2521,2582,2581,2521,2522,2582,2522,2583,2582,2522,2523,2583,2523,2584,2583,2523,2524,2584,2524,2585,2584,2524,2525,2585,2525,2586,2585,2525,2526,2586,2526,2587,2586,2526,2527,2587,2527,2588,2587,2527,2528,2588,2528,2589,2588,2528,2529,2589,2529,2590,2589,2529,2530,2590,2530,2591,2590,2530,2531,2591,2531,2592,2591,2531,2532,2592,2532,2593,2592,2532,2533,2593,2533,2594,2593,2533,2534,2594,2534,2595,2594,2534,2535,2595,2535,2596,2595,2535,2536,2596,2536,2597,2596,2536,2537,2597,2537,2598,2597,2537,2538,2598,2538,2599,2598,2538,2539,2599,2539,2600,2599,2539,2540,2600,2540,2601,2600,2540,2541,2601,2541,2602,2601,2541,2542,2602,2542,2603,2602,2542,2543,2603,2543,2604,2603,2543,2544,2604,2544,2605,2604,2544,2545,2605,2545,2606,2605,2545,2546,2606,2546,2607,2606,2546,2547,2607,2547,2608,2607,2547,2548,2608,2548,2609,2608,2548,2549,2609,2549,2610,2609,2549,2550,2610,2550,2611,2610,2550,2551,2611,2551,2612,2611,2551,2552,2612,2552,2613,2612,2552,2553,2613,2553,2614,2613,2553,2554,2614,2554,2615,2614,2554,2555,2615,2555,2616,2615,2555,2556,2616,2556,2617,2616,2556,2557,2617,2557,2618,2617,2557,2558,2618,2558,2619,2618,2558,2559,2619,2559,2620,2619,2559,2560,2620,2560,2621,2620,2560,2561,2621,2561,2622,2621,2562,2563,2623,2563,2624,2623,2563,2564,2624,2564,2625,2624,2564,2565,2625,2565,2626,2625,2565,2566,2626,2566,2627,2626,2566,2567,2627,2567,2628,2627,2567,2568,2628,2568,2629,2628,2568,2569,2629,2569,2630,2629,2569,2570,2630,2570,2631,2630,2570,2571,2631,2571,2632,2631,2571,2572,2632,2572,2633,2632,2572,2573,2633,2573,2634,2633,2573,2574,2634,2574,2635,2634,2574,2575,2635,2575,2636,2635,2575,2576,2636,2576,2637,2636,2576,2577,2637,2577,2638,2637,2577,2578,2638,2578,2639,2638,2578,2579,2639,2579,2640,2639,2579,2580,2640,2580,2641,2640,2580,2581,2641,2581,2642,2641,2581,2582,2642,2582,2643,2642,2582,2583,2643,2583,2644,2643,2583,2584,2644,2584,2645,2644,2584,2585,2645,2585,2646,2645,2585,2586,2646,2586,2647,2646,2586,2587,2647,2587,2648,2647,2587,2588,2648,2588,2649,2648,2588,2589,2649,2589,2650,2649,2589,2590,2650,2590,2651,2650,2590,2591,2651,2591,2652,2651,2591,2592,2652,2592,2653,2652,2592,2593,2653,2593,2654,2653,2593,2594,2654,2594,2655,2654,2594,2595,2655,2595,2656,2655,2595,2596,2656,2596,2657,2656,2596,2597,2657,2597,2658,2657,2597,2598,2658,2598,2659,2658,2598,2599,2659,2599,2660,2659,2599,2600,2660,2600,2661,2660,2600,2601,2661,2601,2662,2661,2601,2602,2662,2602,2663,2662,2602,2603,2663,2603,2664,2663,2603,2604,2664,2604,2665,2664,2604,2605,2665,2605,2666,2665,2605,2606,2666,2606,2667,2666,2606,2607,2667,2607,2668,2667,2607,2608,2668,2608,2669,2668,2608,2609,2669,2609,2670,2669,2609,2610,2670,2610,2671,2670,2610,2611,2671,2611,2672,2671,2611,2612,2672,2612,2673,2672,2612,2613,2673,2613,2674,2673,2613,2614,2674,2614,2675,2674,2614,2615,2675,2615,2676,2675,2615,2616,2676,2616,2677,2676,2616,2617,2677,2617,2678,2677,2617,2618,2678,2618,2679,2678,2618,2619,2679,2619,2680,2679,2619,2620,2680,2620,2681,2680,2620,2621,2681,2621,2682,2681,2621,2622,2682,2622,2683,2682,2623,2624,2684,2624,2685,2684,2624,2625,2685,2625,2686,2685,2625,2626,2686,2626,2687,2686,2626,2627,2687,2627,2688,2687,2627,2628,2688,2628,2689,2688,2628,2629,2689,2629,2690,2689,2629,2630,2690,2630,2691,2690,2630,2631,2691,2631,2692,2691,2631,2632,2692,2632,2693,2692,2632,2633,2693,2633,2694,2693,2633,2634,2694,2634,2695,2694,2634,2635,2695,2635,2696,2695,2635,2636,2696,2636,2697,2696,2636,2637,2697,2637,2698,2697,2637,2638,2698,2638,2699,2698,2638,2639,2699,2639,2700,2699,2639,2640,2700,2640,2701,2700,2640,2641,2701,2641,2702,2701,2641,2642,2702,2642,2703,2702,2642,2643,2703,2643,2704,2703,2643,2644,2704,2644,2705,2704,2644,2645,2705,2645,2706,2705,2645,2646,2706,2646,2707,2706,2646,2647,2707,2647,2708,2707,2647,2648,2708,2648,2709,2708,2648,2649,2709,2649,2710,2709,2649,2650,2710,2650,2711,2710,2650,2651,2711,2651,2712,2711,2651,2652,2712,2652,2713,2712,2652,2653,2713,2653,2714,2713,2653,2654,2714,2654,2715,2714,2654,2655,2715,2655,2716,2715,2655,2656,2716,2656,2717,2716,2656,2657,2717,2657,2718,2717,2657,2658,2718,2658,2719,2718,2658,2659,2719,2659,2720,2719,2659,2660,2720,2660,2721,2720,2660,2661,2721,2661,2722,2721,2661,2662,2722,2662,2723,2722,2662,2663,2723,2663,2724,2723,2663,2664,2724,2664,2725,2724,2664,2665,2725,2665,2726,2725,2665,2666,2726,2666,2727,2726,2666,2667,2727,2667,2728,2727,2667,2668,2728,2668,2729,2728,2668,2669,2729,2669,2730,2729,2669,2670,2730,2670,2731,2730,2670,2671,2731,2671,2732,2731,2671,2672,2732,2672,2733,2732,2672,2673,2733,2673,2734,2733,2673,2674,2734,2674,2735,2734,2674,2675,2735,2675,2736,2735,2675,2676,2736,2676,2737,2736,2676,2677,2737,2677,2738,2737,2677,2678,2738,2678,2739,2738,2678,2679,2739,2679,2740,2739,2679,2680,2740,2680,2741,2740,2680,2681,2741,2681,2742,2741,2681,2682,2742,2682,2743,2742,2682,2683,2743,2683,2744,2743,2684,2685,2745,2685,2746,2745,2685,2686,2746,2686,2747,2746,2686,2687,2747,2687,2748,2747,2687,2688,2748,2688,2749,2748,2688,2689,2749,2689,2750,2749,2689,2690,2750,2690,2751,2750,2690,2691,2751,2691,2752,2751,2691,2692,2752,2692,2753,2752,2692,2693,2753,2693,2754,2753,2693,2694,2754,2694,2755,2754,2694,2695,2755,2695,2756,2755,2695,2696,2756,2696,2757,2756,2696,2697,2757,2697,2758,2757,2697,2698,2758,2698,2759,2758,2698,2699,2759,2699,2760,2759,2699,2700,2760,2700,2761,2760,2700,2701,2761,2701,2762,2761,2701,2702,2762,2702,2763,2762,2702,2703,2763,2703,2764,2763,2703,2704,2764,2704,2765,2764,2704,2705,2765,2705,2766,2765,2705,2706,2766,2706,2767,2766,2706,2707,2767,2707,2768,2767,2707,2708,2768,2708,2769,2768,2708,2709,2769,2709,2770,2769,2709,2710,2770,2710,2771,2770,2710,2711,2771,2711,2772,2771,2711,2712,2772,2712,2773,2772,2712,2713,2773,2713,2774,2773,2713,2714,2774,2714,2775,2774,2714,2715,2775,2715,2776,2775,2715,2716,2776,2716,2777,2776,2716,2717,2777,2717,2778,2777,2717,2718,2778,2718,2779,2778,2718,2719,2779,2719,2780,2779,2719,2720,2780,2720,2781,2780,2720,2721,2781,2721,2782,2781,2721,2722,2782,2722,2783,2782,2722,2723,2783,2723,2784,2783,2723,2724,2784,2724,2785,2784,2724,2725,2785,2725,2786,2785,2725,2726,2786,2726,2787,2786,2726,2727,2787,2727,2788,2787,2727,2728,2788,2728,2789,2788,2728,2729,2789,2729,2790,2789,2729,2730,2790,2730,2791,2790,2730,2731,2791,2731,2792,2791,2731,2732,2792,2732,2793,2792,2732,2733,2793,2733,2794,2793,2733,2734,2794,2734,2795,2794,2734,2735,2795,2735,2796,2795,2735,2736,2796,2736,2797,2796,2736,2737,2797,2737,2798,2797,2737,2738,2798,2738,2799,2798,2738,2739,2799,2739,2800,2799,2739,2740,2800,2740,2801,2800,2740,2741,2801,2741,2802,2801,2741,2742,2802,2742,2803,2802,2742,2743,2803,2743,2804,2803,2743,2744,2804,2744,2805,2804,2745,2746,2806,2746,2807,2806,2746,2747,2807,2747,2808,2807,2747,2748,2808,2748,2809,2808,2748,2749,2809,2749,2810,2809,2749,2750,2810,2750,2811,2810,2750,2751,2811,2751,2812,2811,2751,2752,2812,2752,2813,2812,2752,2753,2813,2753,2814,2813,2753,2754,2814,2754,2815,2814,2754,2755,2815,2755,2816,2815,2755,2756,2816,2756,2817,2816,2756,2757,2817,2757,2818,2817,2757,2758,2818,2758,2819,2818,2758,2759,2819,2759,2820,2819,2759,2760,2820,2760,2821,2820,2760,2761,2821,2761,2822,2821,2761,2762,2822,2762,2823,2822,2762,2763,2823,2763,2824,2823,2763,2764,2824,2764,2825,2824,2764,2765,2825,2765,2826,2825,2765,2766,2826,2766,2827,2826,2766,2767,2827,2767,2828,2827,2767,2768,2828,2768,2829,2828,2768,2769,2829,2769,2830,2829,2769,2770,2830,2770,2831,2830,2770,2771,2831,2771,2832,2831,2771,2772,2832,2772,2833,2832,2772,2773,2833,2773,2834,2833,2773,2774,2834,2774,2835,2834,2774,2775,2835,2775,2836,2835,2775,2776,2836,2776,2837,2836,2776,2777,2837,2777,2838,2837,2777,2778,2838,2778,2839,2838,2778,2779,2839,2779,2840,2839,2779,2780,2840,2780,2841,2840,2780,2781,2841,2781,2842,2841,2781,2782,2842,2782,2843,2842,2782,2783,2843,2783,2844,2843,2783,2784,2844,2784,2845,2844,2784,2785,2845,2785,2846,2845,2785,2786,2846,2786,2847,2846,2786,2787,2847,2787,2848,2847,2787,2788,2848,2788,2849,2848,2788,2789,2849,2789,2850,2849,2789,2790,2850,2790,2851,2850,2790,2791,2851,2791,2852,2851,2791,2792,2852,2792,2853,2852,2792,2793,2853,2793,2854,2853,2793,2794,2854,2794,2855,2854,2794,2795,2855,2795,2856,2855,2795,2796,2856,2796,2857,2856,2796,2797,2857,2797,2858,2857,2797,2798,2858,2798,2859,2858,2798,2799,2859,2799,2860,2859,2799,2800,2860,2800,2861,2860,2800,2801,2861,2801,2862,2861,2801,2802,2862,2802,2863,2862,2802,2803,2863,2803,2864,2863,2803,2804,2864,2804,2865,2864,2804,2805,2865,2805,2866,2865,2806,2807,2867,2807,2868,2867,2807,2808,2868,2808,2869,2868,2808,2809,2869,2809,2870,2869,2809,2810,2870,2810,2871,2870,2810,2811,2871,2811,2872,2871,2811,2812,2872,2812,2873,2872,2812,2813,2873,2813,2874,2873,2813,2814,2874,2814,2875,2874,2814,2815,2875,2815,2876,2875,2815,2816,2876,2816,2877,2876,2816,2817,2877,2817,2878,2877,2817,2818,2878,2818,2879,2878,2818,2819,2879,2819,2880,2879,2819,2820,2880,2820,2881,2880,2820,2821,2881,2821,2882,2881,2821,2822,2882,2822,2883,2882,2822,2823,2883,2823,2884,2883,2823,2824,2884,2824,2885,2884,2824,2825,2885,2825,2886,2885,2825,2826,2886,2826,2887,2886,2826,2827,2887,2827,2888,2887,2827,2828,2888,2828,2889,2888,2828,2829,2889,2829,2890,2889,2829,2830,2890,2830,2891,2890,2830,2831,2891,2831,2892,2891,2831,2832,2892,2832,2893,2892,2832,2833,2893,2833,2894,2893,2833,2834,2894,2834,2895,2894,2834,2835,2895,2835,2896,2895,2835,2836,2896,2836,2897,2896,2836,2837,2897,2837,2898,2897,2837,2838,2898,2838,2899,2898,2838,2839,2899,2839,2900,2899,2839,2840,2900,2840,2901,2900,2840,2841,2901,2841,2902,2901,2841,2842,2902,2842,2903,2902,2842,2843,2903,2843,2904,2903,2843,2844,2904,2844,2905,2904,2844,2845,2905,2845,2906,2905,2845,2846,2906,2846,2907,2906,2846,2847,2907,2847,2908,2907,2847,2848,2908,2848,2909,2908,2848,2849,2909,2849,2910,2909,2849,2850,2910,2850,2911,2910,2850,2851,2911,2851,2912,2911,2851,2852,2912,2852,2913,2912,2852,2853,2913,2853,2914,2913,2853,2854,2914,2854,2915,2914,2854,2855,2915,2855,2916,2915,2855,2856,2916,2856,2917,2916,2856,2857,2917,2857,2918,2917,2857,2858,2918,2858,2919,2918,2858,2859,2919,2859,2920,2919,2859,2860,2920,2860,2921,2920,2860,2861,2921,2861,2922,2921,2861,2862,2922,2862,2923,2922,2862,2863,2923,2863,2924,2923,2863,2864,2924,2864,2925,2924,2864,2865,2925,2865,2926,2925,2865,2866,2926,2866,2927,2926,2867,2868,2928,2868,2929,2928,2868,2869,2929,2869,2930,2929,2869,2870,2930,2870,2931,2930,2870,2871,2931,2871,2932,2931,2871,2872,2932,2872,2933,2932,2872,2873,2933,2873,2934,2933,2873,2874,2934,2874,2935,2934,2874,2875,2935,2875,2936,2935,2875,2876,2936,2876,2937,2936,2876,2877,2937,2877,2938,2937,2877,2878,2938,2878,2939,2938,2878,2879,2939,2879,2940,2939,2879,2880,2940,2880,2941,2940,2880,2881,2941,2881,2942,2941,2881,2882,2942,2882,2943,2942,2882,2883,2943,2883,2944,2943,2883,2884,2944,2884,2945,2944,2884,2885,2945,2885,2946,2945,2885,2886,2946,2886,2947,2946,2886,2887,2947,2887,2948,2947,2887,2888,2948,2888,2949,2948,2888,2889,2949,2889,2950,2949,2889,2890,2950,2890,2951,2950,2890,2891,2951,2891,2952,2951,2891,2892,2952,2892,2953,2952,2892,2893,2953,2893,2954,2953,2893,2894,2954,2894,2955,2954,2894,2895,2955,2895,2956,2955,2895,2896,2956,2896,2957,2956,2896,2897,2957,2897,2958,2957,2897,2898,2958,2898,2959,2958,2898,2899,2959,2899,2960,2959,2899,2900,2960,2900,2961,2960,2900,2901,2961,2901,2962,2961,2901,2902,2962,2902,2963,2962,2902,2903,2963,2903,2964,2963,2903,2904,2964,2904,2965,2964,2904,2905,2965,2905,2966,2965,2905,2906,2966,2906,2967,2966,2906,2907,2967,2907,2968,2967,2907,2908,2968,2908,2969,2968,2908,2909,2969,2909,2970,2969,2909,2910,2970,2910,2971,2970,2910,2911,2971,2911,2972,2971,2911,2912,2972,2912,2973,2972,2912,2913,2973,2913,2974,2973,2913,2914,2974,2914,2975,2974,2914,2915,2975,2915,2976,2975,2915,2916,2976,2916,2977,2976,2916,2917,2977,2917,2978,2977,2917,2918,2978,2918,2979,2978,2918,2919,2979,2919,2980,2979,2919,2920,2980,2920,2981,2980,2920,2921,2981,2921,2982,2981,2921,2922,2982,2922,2983,2982,2922,2923,2983,2923,2984,2983,2923,2924,2984,2924,2985,2984,2924,2925,2985,2925,2986,2985,2925,2926,2986,2926,2987,2986,2926,2927,2987,2927,2988,2987,2928,2929,2989,2929,2990,2989,2929,2930,2990,2930,2991,2990,2930,2931,2991,2931,2992,2991,2931,2932,2992,2932,2993,2992,2932,2933,2993,2933,2994,2993,2933,2934,2994,2934,2995,2994,2934,2935,2995,2935,2996,2995,2935,2936,2996,2936,2997,2996,2936,2937,2997,2937,2998,2997,2937,2938,2998,2938,2999,2998,2938,2939,2999,2939,3000,2999,2939,2940,3000,2940,3001,3000,2940,2941,3001,2941,3002,3001,2941,2942,3002,2942,3003,3002,2942,2943,3003,2943,3004,3003,2943,2944,3004,2944,3005,3004,2944,2945,3005,2945,3006,3005,2945,2946,3006,2946,3007,3006,2946,2947,3007,2947,3008,3007,2947,2948,3008,2948,3009,3008,2948,2949,3009,2949,3010,3009,2949,2950,3010,2950,3011,3010,2950,2951,3011,2951,3012,3011,2951,2952,3012,2952,3013,3012,2952,2953,3013,2953,3014,3013,2953,2954,3014,2954,3015,3014,2954,2955,3015,2955,3016,3015,2955,2956,3016,2956,3017,3016,2956,2957,3017,2957,3018,3017,2957,2958,3018,2958,3019,3018,2958,2959,3019,2959,3020,3019,2959,2960,3020,2960,3021,3020,2960,2961,3021,2961,3022,3021,2961,2962,3022,2962,3023,3022,2962,2963,3023,2963,3024,3023,2963,2964,3024,2964,3025,3024,2964,2965,3025,2965,3026,3025,2965,2966,3026,2966,3027,3026,2966,2967,3027,2967,3028,3027,2967,2968,3028,2968,3029,3028,2968,2969,3029,2969,3030,3029,2969,2970,3030,2970,3031,3030,2970,2971,3031,2971,3032,3031,2971,2972,3032,2972,3033,3032,2972,2973,3033,2973,3034,3033,2973,2974,3034,2974,3035,3034,2974,2975,3035,2975,3036,3035,2975,2976,3036,2976,3037,3036,2976,2977,3037,2977,3038,3037,2977,2978,3038,2978,3039,3038,2978,2979,3039,2979,3040,3039,2979,2980,3040,2980,3041,3040,2980,2981,3041,2981,3042,3041,2981,2982,3042,2982,3043,3042,2982,2983,3043,2983,3044,3043,2983,2984,3044,2984,3045,3044,2984,2985,3045,2985,3046,3045,2985,2986,3046,2986,3047,3046,2986,2987,3047,2987,3048,3047,2987,2988,3048,2988,3049,3048,2989,2990,3050,2990,3051,3050,2990,2991,3051,2991,3052,3051,2991,2992,3052,2992,3053,3052,2992,2993,3053,2993,3054,3053,2993,2994,3054,2994,3055,3054,2994,2995,3055,2995,3056,3055,2995,2996,3056,2996,3057,3056,2996,2997,3057,2997,3058,3057,2997,2998,3058,2998,3059,3058,2998,2999,3059,2999,3060,3059,2999,3000,3060,3000,3061,3060,3000,3001,3061,3001,3062,3061,3001,3002,3062,3002,3063,3062,3002,3003,3063,3003,3064,3063,3003,3004,3064,3004,3065,3064,3004,3005,3065,3005,3066,3065,3005,3006,3066,3006,3067,3066,3006,3007,3067,3007,3068,3067,3007,3008,3068,3008,3069,3068,3008,3009,3069,3009,3070,3069,3009,3010,3070,3010,3071,3070,3010,3011,3071,3011,3072,3071,3011,3012,3072,3012,3073,3072,3012,3013,3073,3013,3074,3073,3013,3014,3074,3014,3075,3074,3014,3015,3075,3015,3076,3075,3015,3016,3076,3016,3077,3076,3016,3017,3077,3017,3078,3077,3017,3018,3078,3018,3079,3078,3018,3019,3079,3019,3080,3079,3019,3020,3080,3020,3081,3080,3020,3021,3081,3021,3082,3081,3021,3022,3082,3022,3083,3082,3022,3023,3083,3023,3084,3083,3023,3024,3084,3024,3085,3084,3024,3025,3085,3025,3086,3085,3025,3026,3086,3026,3087,3086,3026,3027,3087,3027,3088,3087,3027,3028,3088,3028,3089,3088,3028,3029,3089,3029,3090,3089,3029,3030,3090,3030,3091,3090,3030,3031,3091,3031,3092,3091,3031,3032,3092,3032,3093,3092,3032,3033,3093,3033,3094,3093,3033,3034,3094,3034,3095,3094,3034,3035,3095,3035,3096,3095,3035,3036,3096,3036,3097,3096,3036,3037,3097,3037,3098,3097,3037,3038,3098,3038,3099,3098,3038,3039,3099,3039,3100,3099,3039,3040,3100,3040,3101,3100,3040,3041,3101,3041,3102,3101,3041,3042,3102,3042,3103,3102,3042,3043,3103,3043,3104,3103,3043,3044,3104,3044,3105,3104,3044,3045,3105,3045,3106,3105,3045,3046,3106,3046,3107,3106,3046,3047,3107,3047,3108,3107,3047,3048,3108,3048,3109,3108,3048,3049,3109,3049,3110,3109,3050,3051,3111,3051,3112,3111,3051,3052,3112,3052,3113,3112,3052,3053,3113,3053,3114,3113,3053,3054,3114,3054,3115,3114,3054,3055,3115,3055,3116,3115,3055,3056,3116,3056,3117,3116,3056,3057,3117,3057,3118,3117,3057,3058,3118,3058,3119,3118,3058,3059,3119,3059,3120,3119,3059,3060,3120,3060,3121,3120,3060,3061,3121,3061,3122,3121,3061,3062,3122,3062,3123,3122,3062,3063,3123,3063,3124,3123,3063,3064,3124,3064,3125,3124,3064,3065,3125,3065,3126,3125,3065,3066,3126,3066,3127,3126,3066,3067,3127,3067,3128,3127,3067,3068,3128,3068,3129,3128,3068,3069,3129,3069,3130,3129,3069,3070,3130,3070,3131,3130,3070,3071,3131,3071,3132,3131,3071,3072,3132,3072,3133,3132,3072,3073,3133,3073,3134,3133,3073,3074,3134,3074,3135,3134,3074,3075,3135,3075,3136,3135,3075,3076,3136,3076,3137,3136,3076,3077,3137,3077,3138,3137,3077,3078,3138,3078,3139,3138,3078,3079,3139,3079,3140,3139,3079,3080,3140,3080,3141,3140,3080,3081,3141,3081,3142,3141,3081,3082,3142,3082,3143,3142,3082,3083,3143,3083,3144,3143,3083,3084,3144,3084,3145,3144,3084,3085,3145,3085,3146,3145,3085,3086,3146,3086,3147,3146,3086,3087,3147,3087,3148,3147,3087,3088,3148,3088,3149,3148,3088,3089,3149,3089,3150,3149,3089,3090,3150,3090,3151,3150,3090,3091,3151,3091,3152,3151,3091,3092,3152,3092,3153,3152,3092,3093,3153,3093,3154,3153,3093,3094,3154,3094,3155,3154,3094,3095,3155,3095,3156,3155,3095,3096,3156,3096,3157,3156,3096,3097,3157,3097,3158,3157,3097,3098,3158,3098,3159,3158,3098,3099,3159,3099,3160,3159,3099,3100,3160,3100,3161,3160,3100,3101,3161,3101,3162,3161,3101,3102,3162,3102,3163,3162,3102,3103,3163,3103,3164,3163,3103,3104,3164,3104,3165,3164,3104,3105,3165,3105,3166,3165,3105,3106,3166,3106,3167,3166,3106,3107,3167,3107,3168,3167,3107,3108,3168,3108,3169,3168,3108,3109,3169,3109,3170,3169,3109,3110,3170,3110,3171,3170,3111,3112,3172,3112,3173,3172,3112,3113,3173,3113,3174,3173,3113,3114,3174,3114,3175,3174,3114,3115,3175,3115,3176,3175,3115,3116,3176,3116,3177,3176,3116,3117,3177,3117,3178,3177,3117,3118,3178,3118,3179,3178,3118,3119,3179,3119,3180,3179,3119,3120,3180,3120,3181,3180,3120,3121,3181,3121,3182,3181,3121,3122,3182,3122,3183,3182,3122,3123,3183,3123,3184,3183,3123,3124,3184,3124,3185,3184,3124,3125,3185,3125,3186,3185,3125,3126,3186,3126,3187,3186,3126,3127,3187,3127,3188,3187,3127,3128,3188,3128,3189,3188,3128,3129,3189,3129,3190,3189,3129,3130,3190,3130,3191,3190,3130,3131,3191,3131,3192,3191,3131,3132,3192,3132,3193,3192,3132,3133,3193,3133,3194,3193,3133,3134,3194,3134,3195,3194,3134,3135,3195,3135,3196,3195,3135,3136,3196,3136,3197,3196,3136,3137,3197,3137,3198,3197,3137,3138,3198,3138,3199,3198,3138,3139,3199,3139,3200,3199,3139,3140,3200,3140,3201,3200,3140,3141,3201,3141,3202,3201,3141,3142,3202,3142,3203,3202,3142,3143,3203,3143,3204,3203,3143,3144,3204,3144,3205,3204,3144,3145,3205,3145,3206,3205,3145,3146,3206,3146,3207,3206,3146,3147,3207,3147,3208,3207,3147,3148,3208,3148,3209,3208,3148,3149,3209,3149,3210,3209,3149,3150,3210,3150,3211,3210,3150,3151,3211,3151,3212,3211,3151,3152,3212,3152,3213,3212,3152,3153,3213,3153,3214,3213,3153,3154,3214,3154,3215,3214,3154,3155,3215,3155,3216,3215,3155,3156,3216,3156,3217,3216,3156,3157,3217,3157,3218,3217,3157,3158,3218,3158,3219,3218,3158,3159,3219,3159,3220,3219,3159,3160,3220,3160,3221,3220,3160,3161,3221,3161,3222,3221,3161,3162,3222,3162,3223,3222,3162,3163,3223,3163,3224,3223,3163,3164,3224,3164,3225,3224,3164,3165,3225,3165,3226,3225,3165,3166,3226,3166,3227,3226,3166,3167,3227,3167,3228,3227,3167,3168,3228,3168,3229,3228,3168,3169,3229,3169,3230,3229,3169,3170,3230,3170,3231,3230,3170,3171,3231,3171,3232,3231,3172,3173,3233,3173,3234,3233,3173,3174,3234,3174,3235,3234,3174,3175,3235,3175,3236,3235,3175,3176,3236,3176,3237,3236,3176,3177,3237,3177,3238,3237,3177,3178,3238,3178,3239,3238,3178,3179,3239,3179,3240,3239,3179,3180,3240,3180,3241,3240,3180,3181,3241,3181,3242,3241,3181,3182,3242,3182,3243,3242,3182,3183,3243,3183,3244,3243,3183,3184,3244,3184,3245,3244,3184,3185,3245,3185,3246,3245,3185,3186,3246,3186,3247,3246,3186,3187,3247,3187,3248,3247,3187,3188,3248,3188,3249,3248,3188,3189,3249,3189,3250,3249,3189,3190,3250,3190,3251,3250,3190,3191,3251,3191,3252,3251,3191,3192,3252,3192,3253,3252,3192,3193,3253,3193,3254,3253,3193,3194,3254,3194,3255,3254,3194,3195,3255,3195,3256,3255,3195,3196,3256,3196,3257,3256,3196,3197,3257,3197,3258,3257,3197,3198,3258,3198,3259,3258,3198,3199,3259,3199,3260,3259,3199,3200,3260,3200,3261,3260,3200,3201,3261,3201,3262,3261,3201,3202,3262,3202,3263,3262,3202,3203,3263,3203,3264,3263,3203,3204,3264,3204,3265,3264,3204,3205,3265,3205,3266,3265,3205,3206,3266,3206,3267,3266,3206,3207,3267,3207,3268,3267,3207,3208,3268,3208,3269,3268,3208,3209,3269,3209,3270,3269,3209,3210,3270,3210,3271,3270,3210,3211,3271,3211,3272,3271,3211,3212,3272,3212,3273,3272,3212,3213,3273,3213,3274,3273,3213,3214,3274,3214,3275,3274,3214,3215,3275,3215,3276,3275,3215,3216,3276,3216,3277,3276,3216,3217,3277,3217,3278,3277,3217,3218,3278,3218,3279,3278,3218,3219,3279,3219,3280,3279,3219,3220,3280,3220,3281,3280,3220,3221,3281,3221,3282,3281,3221,3222,3282,3222,3283,3282,3222,3223,3283,3223,3284,3283,3223,3224,3284,3224,3285,3284,3224,3225,3285,3225,3286,3285,3225,3226,3286,3226,3287,3286,3226,3227,3287,3227,3288,3287,3227,3228,3288,3228,3289,3288,3228,3229,3289,3229,3290,3289,3229,3230,3290,3230,3291,3290,3230,3231,3291,3231,3292,3291,3231,3232,3292,3232,3293,3292,3233,3234,3294,3234,3295,3294,3234,3235,3295,3235,3296,3295,3235,3236,3296,3236,3297,3296,3236,3237,3297,3237,3298,3297,3237,3238,3298,3238,3299,3298,3238,3239,3299,3239,3300,3299,3239,3240,3300,3240,3301,3300,3240,3241,3301,3241,3302,3301,3241,3242,3302,3242,3303,3302,3242,3243,3303,3243,3304,3303,3243,3244,3304,3244,3305,3304,3244,3245,3305,3245,3306,3305,3245,3246,3306,3246,3307,3306,3246,3247,3307,3247,3308,3307,3247,3248,3308,3248,3309,3308,3248,3249,3309,3249,3310,3309,3249,3250,3310,3250,3311,3310,3250,3251,3311,3251,3312,3311,3251,3252,3312,3252,3313,3312,3252,3253,3313,3253,3314,3313,3253,3254,3314,3254,3315,3314,3254,3255,3315,3255,3316,3315,3255,3256,3316,3256,3317,3316,3256,3257,3317,3257,3318,3317,3257,3258,3318,3258,3319,3318,3258,3259,3319,3259,3320,3319,3259,3260,3320,3260,3321,3320,3260,3261,3321,3261,3322,3321,3261,3262,3322,3262,3323,3322,3262,3263,3323,3263,3324,3323,3263,3264,3324,3264,3325,3324,3264,3265,3325,3265,3326,3325,3265,3266,3326,3266,3327,3326,3266,3267,3327,3267,3328,3327,3267,3268,3328,3268,3329,3328,3268,3269,3329,3269,3330,3329,3269,3270,3330,3270,3331,3330,3270,3271,3331,3271,3332,3331,3271,3272,3332,3272,3333,3332,3272,3273,3333,3273,3334,3333,3273,3274,3334,3274,3335,3334,3274,3275,3335,3275,3336,3335,3275,3276,3336,3276,3337,3336,3276,3277,3337,3277,3338,3337,3277,3278,3338,3278,3339,3338,3278,3279,3339,3279,3340,3339,3279,3280,3340,3280,3341,3340,3280,3281,3341,3281,3342,3341,3281,3282,3342,3282,3343,3342,3282,3283,3343,3283,3344,3343,3283,3284,3344,3284,3345,3344,3284,3285,3345,3285,3346,3345,3285,3286,3346,3286,3347,3346,3286,3287,3347,3287,3348,3347,3287,3288,3348,3288,3349,3348,3288,3289,3349,3289,3350,3349,3289,3290,3350,3290,3351,3350,3290,3291,3351,3291,3352,3351,3291,3292,3352,3292,3353,3352,3292,3293,3353,3293,3354,3353,3294,3295,3355,3295,3356,3355,3295,3296,3356,3296,3357,3356,3296,3297,3357,3297,3358,3357,3297,3298,3358,3298,3359,3358,3298,3299,3359,3299,3360,3359,3299,3300,3360,3300,3361,3360,3300,3301,3361,3301,3362,3361,3301,3302,3362,3302,3363,3362,3302,3303,3363,3303,3364,3363,3303,3304,3364,3304,3365,3364,3304,3305,3365,3305,3366,3365,3305,3306,3366,3306,3367,3366,3306,3307,3367,3307,3368,3367,3307,3308,3368,3308,3369,3368,3308,3309,3369,3309,3370,3369,3309,3310,3370,3310,3371,3370,3310,3311,3371,3311,3372,3371,3311,3312,3372,3312,3373,3372,3312,3313,3373,3313,3374,3373,3313,3314,3374,3314,3375,3374,3314,3315,3375,3315,3376,3375,3315,3316,3376,3316,3377,3376,3316,3317,3377,3317,3378,3377,3317,3318,3378,3318,3379,3378,3318,3319,3379,3319,3380,3379,3319,3320,3380,3320,3381,3380,3320,3321,3381,3321,3382,3381,3321,3322,3382,3322,3383,3382,3322,3323,3383,3323,3384,3383,3323,3324,3384,3324,3385,3384,3324,3325,3385,3325,3386,3385,3325,3326,3386,3326,3387,3386,3326,3327,3387,3327,3388,3387,3327,3328,3388,3328,3389,3388,3328,3329,3389,3329,3390,3389,3329,3330,3390,3330,3391,3390,3330,3331,3391,3331,3392,3391,3331,3332,3392,3332,3393,3392,3332,3333,3393,3333,3394,3393,3333,3334,3394,3334,3395,3394,3334,3335,3395,3335,3396,3395,3335,3336,3396,3336,3397,3396,3336,3337,3397,3337,3398,3397,3337,3338,3398,3338,3399,3398,3338,3339,3399,3339,3400,3399,3339,3340,3400,3340,3401,3400,3340,3341,3401,3341,3402,3401,3341,3342,3402,3342,3403,3402,3342,3343,3403,3343,3404,3403,3343,3344,3404,3344,3405,3404,3344,3345,3405,3345,3406,3405,3345,3346,3406,3346,3407,3406,3346,3347,3407,3347,3408,3407,3347,3348,3408,3348,3409,3408,3348,3349,3409,3349,3410,3409,3349,3350,3410,3350,3411,3410,3350,3351,3411,3351,3412,3411,3351,3352,3412,3352,3413,3412,3352,3353,3413,3353,3414,3413,3353,3354,3414,3354,3415,3414,3355,3356,3416,3356,3417,3416,3356,3357,3417,3357,3418,3417,3357,3358,3418,3358,3419,3418,3358,3359,3419,3359,3420,3419,3359,3360,3420,3360,3421,3420,3360,3361,3421,3361,3422,3421,3361,3362,3422,3362,3423,3422,3362,3363,3423,3363,3424,3423,3363,3364,3424,3364,3425,3424,3364,3365,3425,3365,3426,3425,3365,3366,3426,3366,3427,3426,3366,3367,3427,3367,3428,3427,3367,3368,3428,3368,3429,3428,3368,3369,3429,3369,3430,3429,3369,3370,3430,3370,3431,3430,3370,3371,3431,3371,3432,3431,3371,3372,3432,3372,3433,3432,3372,3373,3433,3373,3434,3433,3373,3374,3434,3374,3435,3434,3374,3375,3435,3375,3436,3435,3375,3376,3436,3376,3437,3436,3376,3377,3437,3377,3438,3437,3377,3378,3438,3378,3439,3438,3378,3379,3439,3379,3440,3439,3379,3380,3440,3380,3441,3440,3380,3381,3441,3381,3442,3441,3381,3382,3442,3382,3443,3442,3382,3383,3443,3383,3444,3443,3383,3384,3444,3384,3445,3444,3384,3385,3445,3385,3446,3445,3385,3386,3446,3386,3447,3446,3386,3387,3447,3387,3448,3447,3387,3388,3448,3388,3449,3448,3388,3389,3449,3389,3450,3449,3389,3390,3450,3390,3451,3450,3390,3391,3451,3391,3452,3451,3391,3392,3452,3392,3453,3452,3392,3393,3453,3393,3454,3453,3393,3394,3454,3394,3455,3454,3394,3395,3455,3395,3456,3455,3395,3396,3456,3396,3457,3456,3396,3397,3457,3397,3458,3457,3397,3398,3458,3398,3459,3458,3398,3399,3459,3399,3460,3459,3399,3400,3460,3400,3461,3460,3400,3401,3461,3401,3462,3461,3401,3402,3462,3402,3463,3462,3402,3403,3463,3403,3464,3463,3403,3404,3464,3404,3465,3464,3404,3405,3465,3405,3466,3465,3405,3406,3466,3406,3467,3466,3406,3407,3467,3407,3468,3467,3407,3408,3468,3408,3469,3468,3408,3409,3469,3409,3470,3469,3409,3410,3470,3410,3471,3470,3410,3411,3471,3411,3472,3471,3411,3412,3472,3412,3473,3472,3412,3413,3473,3413,3474,3473,3413,3414,3474,3414,3475,3474,3414,3415,3475,3415,3476,3475,0,2,1,3416,3417,3418,0,3,2,3416,3418,3419,0,4,3,3416,3419,3420,0,5,4,3416,3420,3421,0,6,5,3416,3421,3422,0,7,6,3416,3422,3423,0,8,7,3416,3423,3424,0,9,8,3416,3424,3425,0,10,9,3416,3425,3426,0,11,10,3416,3426,3427,0,12,11,3416,3427,3428,0,13,12,3416,3428,3429,0,14,13,3416,3429,3430,0,15,14,3416,3430,3431,0,16,15,3416,3431,3432,0,17,16,3416,3432,3433,0,18,17,3416,3433,3434,0,19,18,3416,3434,3435,0,20,19,3416,3435,3436,0,21,20,3416,3436,3437,0,22,21,3416,3437,3438,0,23,22,3416,3438,3439,0,24,23,3416,3439,3440,0,25,24,3416,3440,3441,0,26,25,3416,3441,3442,0,27,26,3416,3442,3443,0,28,27,3416,3443,3444,0,29,28,3416,3444,3445,0,30,29,3416,3445,3446,0,31,30,3416,3446,3447,0,32,31,3416,3447,3448,0,33,32,3416,3448,3449,0,34,33,3416,3449,3450,0,35,34,3416,3450,3451,0,36,35,3416,3451,3452,0,37,36,3416,3452,3453,0,38,37,3416,3453,3454,0,39,38,3416,3454,3455,0,40,39,3416,3455,3456,0,41,40,3416,3456,3457,0,42,41,3416,3457,3458,0,43,42,3416,3458,3459,0,44,43,3416,3459,3460,0,45,44,3416,3460,3461,0,46,45,3416,3461,3462,0,47,46,3416,3462,3463,0,48,47,3416,3463,3464,0,49,48,3416,3464,3465,0,50,49,3416,3465,3466,0,51,50,3416,3466,3467,0,52,51,3416,3467,3468,0,53,52,3416,3468,3469,0,54,53,3416,3469,3470,0,55,54,3416,3470,3471,0,56,55,3416,3471,3472,0,57,56,3416,3472,3473,0,58,57,3416,3473,3474,0,59,58,3416,3474,3475],"color":[0.90273,0.89821,0.88106,0.89141,0.88695,0.87001,0.88573,0.8813,0.86447,0.89938,0.89488,0.87779,0.95487,0.9501,0.93195,0.96233,0.95752,0.93923,0.95439,0.94962,0.93149,0.93977,0.93508,0.91722,0.90393,0.89941,0.88224,0.91926,0.91466,0.8972,0.9217,0.91709,0.89958,0.94802,0.94328,0.92527,0.94608,0.94135,0.92337,0.92226,0.91764,0.90012,0.932,0.92734,0.90963,0.91432,0.90975,0.89238,0.96345,0.95864,0.94033,0.95944,0.95464,0.93641,0.93214,0.92748,0.90977,0.91182,0.90726,0.88993,0.9461,0.94136,0.92339,0.9223,0.91769,0.90016,0.95049,0.94574,0.92768,0.92137,0.91677,0.89926,0.84682,0.84258,0.82649,0.88385,0.87943,0.86264,0.96352,0.95871,0.9404,0.91688,0.91229,0.89487,0.94463,0.93991,0.92196,0.92345,0.91883,0.90128,0.88302,0.87861,0.86183,0.9222,0.91759,0.90007,0.9213,0.91669,0.89919,0.89757,0.89308,0.87603,0.84097,0.83676,0.82078,0.87859,0.8742,0.8575,0.85632,0.85204,0.83577,0.82719,0.82305,0.80734,0.85352,0.84925,0.83303,0.88178,0.87737,0.86061,0.88426,0.87984,0.86304,0.8409,0.8367,0.82072,0.87125,0.86689,0.85034,0.87122,0.86686,0.85031,0.81278,0.80872,0.79327,0.86544,0.86111,0.84466,0.8227,0.81859,0.80296,0.84299,0.83878,0.82276,0.85853,0.85424,0.83793,0.89169,0.88723,0.87029,0.81999,0.81589,0.80031,0.86309,0.85877,0.84238,0.8932,0.88873,0.87176,0.8713,0.86694,0.85038,0.82494,0.82081,0.80514,0.82377,0.81966,0.804,0.90326,0.89874,0.88158,0.91958,0.91498,0.89751,0.84707,0.84283,0.82674,0.8724,0.86804,0.85146,0.90273,0.89821,0.88106,0.92,0.9154,0.89792,0.90142,0.89691,0.87978,0.85993,0.85563,0.83929,0.89363,0.88916,0.87219,0.93989,0.93519,0.91733,0.96542,0.9606,0.94225,0.95958,0.95478,0.93655,0.93925,0.93455,0.91671,0.88122,0.87681,0.86007,0.92842,0.92378,0.90614,0.92674,0.9221,0.9045,0.92396,0.91934,0.90179,0.97349,0.96862,0.95012,0.92879,0.92415,0.9065,0.94,0.9353,0.91744,0.90178,0.89727,0.88014,0.95568,0.9509,0.93274,0.96078,0.95598,0.93772,0.9296,0.92495,0.90729,0.9319,0.92724,0.90953,0.97137,0.96652,0.94806,0.90046,0.89596,0.87885,0.97264,0.96778,0.9493,0.93388,0.92921,0.91146,0.85016,0.84591,0.82975,0.8832,0.87879,0.86201,0.95562,0.95084,0.93268,0.90888,0.90434,0.88707,0.93354,0.92887,0.91113,0.92989,0.92524,0.90757,0.86251,0.8582,0.84181,0.91947,0.91487,0.8974,0.91305,0.90848,0.89114,0.90512,0.9006,0.8834,0.83099,0.82684,0.81105,0.85222,0.84795,0.83176,0.83288,0.82872,0.81289,0.83493,0.83076,0.81489,0.8785,0.87411,0.85742,0.86556,0.86123,0.84478,0.86291,0.8586,0.8422,0.85112,0.84686,0.83069,0.87015,0.86579,0.84926,0.83942,0.83523,0.81928,0.8013,0.79729,0.78207,0.8763,0.87192,0.85527,0.82593,0.8218,0.80611,0.83609,0.83191,0.81603,0.85626,0.85198,0.83571,0.88298,0.87857,0.86179,0.83646,0.83228,0.81639,0.86487,0.86054,0.84411,0.88481,0.88038,0.86357,0.84708,0.84284,0.82675,0.84366,0.83944,0.82341,0.84751,0.84328,0.82717,0.90063,0.89613,0.87902,0.9112,0.90664,0.88933,0.83485,0.83068,0.81482,0.86171,0.8574,0.84103,0.92,0.9154,0.89792,0.92524,0.92062,0.90304,0.8988,0.8943,0.87723,0.84321,0.83899,0.82297,0.91969,0.91509,0.89761,0.91729,0.91271,0.89528,0.95251,0.94774,0.92965,0.95011,0.94536,0.92731,0.9587,0.9539,0.93569,0.89108,0.88663,0.8697,0.9281,0.92346,0.90583,0.92043,0.91583,0.89834,0.89951,0.89501,0.87792,0.99004,0.98509,0.96628,0.93306,0.92839,0.91066,0.964,0.95918,0.94086,0.91089,0.90634,0.88903,0.97839,0.97349,0.9549,0.94928,0.94453,0.9265,0.91647,0.91189,0.89447,0.94662,0.94189,0.9239,0.98302,0.9781,0.95943,0.90085,0.89635,0.87923,0.98099,0.97609,0.95745,0.93291,0.92825,0.91052,0.85432,0.85004,0.83381,0.87731,0.87292,0.85625,0.93335,0.92868,0.91095,0.89288,0.88841,0.87145,0.93196,0.9273,0.90959,0.92007,0.91547,0.89799,0.84897,0.84473,0.8286,0.90412,0.8996,0.88242,0.90677,0.90224,0.88501,0.89723,0.89275,0.8757,0.81914,0.81505,0.79948,0.83035,0.82619,0.81042,0.8483,0.84405,0.82794,0.84846,0.84422,0.8281,0.89411,0.88964,0.87265,0.84263,0.83842,0.82241,0.83506,0.83088,0.81501,0.86287,0.85855,0.84216,0.876,0.87162,0.85497,0.8101,0.80605,0.79065,0.80334,0.79933,0.78406,0.87336,0.86899,0.8524,0.81967,0.81557,0.8,0.82102,0.81691,0.80131,0.84442,0.8402,0.82416,0.86068,0.85638,0.84002,0.86525,0.86093,0.84449,0.85448,0.85021,0.83397,0.86382,0.8595,0.84309,0.83599,0.83181,0.81592,0.85951,0.85521,0.83888,0.87407,0.8697,0.8531,0.88848,0.88403,0.86715,0.88879,0.88435,0.86746,0.84488,0.84065,0.8246,0.85545,0.85118,0.83492,0.92524,0.92062,0.90304,0.91627,0.91169,0.89428,0.88439,0.87997,0.86317,0.86556,0.86123,0.84478,0.9438,0.93908,0.92115,0.92912,0.92448,0.90682,0.92752,0.92288,0.90526,0.92873,0.92409,0.90644,0.97826,0.97337,0.95478,0.89389,0.88942,0.87244,0.91808,0.91349,0.89605,0.90507,0.90054,0.88335,0.92757,0.92293,0.9053,0.98974,0.98479,0.96599,0.92517,0.92055,0.90297,0.97709,0.9722,0.95364,0.91147,0.90691,0.8896,0.98807,0.98313,0.96436,0.94614,0.94141,0.92344,0.90931,0.90477,0.88749,0.95135,0.94659,0.92851,0.97631,0.97143,0.95288,0.89682,0.89234,0.8753,0.97224,0.96738,0.94891,0.91865,0.91406,0.8966,0.86893,0.86459,0.84808,0.8676,0.86326,0.84678,0.90368,0.89916,0.88199,0.90698,0.90244,0.88521,0.91743,0.91284,0.89541,0.90743,0.90289,0.88565,0.86182,0.85751,0.84114,0.8806,0.8762,0.85946,0.89451,0.89003,0.87304,0.87671,0.87232,0.85566,0.83259,0.82843,0.81261,0.83783,0.83364,0.81772,0.85689,0.85261,0.83633,0.85565,0.85138,0.83512,0.8945,0.89003,0.87303,0.81879,0.81469,0.79914,0.80866,0.80462,0.78926,0.86398,0.85966,0.84325,0.86644,0.86211,0.84565,0.81971,0.81561,0.80004,0.80111,0.79711,0.78188,0.85726,0.85297,0.83668,0.80638,0.80235,0.78702,0.80936,0.80531,0.78993,0.86881,0.86446,0.84796,0.8403,0.8361,0.82013,0.88835,0.88391,0.86703,0.83545,0.83128,0.8154,0.83714,0.83295,0.81705,0.83836,0.83417,0.81824,0.86744,0.86311,0.84662,0.89737,0.89288,0.87583,0.90266,0.89815,0.881,0.86005,0.85575,0.83941,0.86143,0.85712,0.84076,0.87619,0.87181,0.85516,0.91627,0.91169,0.89428,0.89568,0.8912,0.87419,0.86354,0.85922,0.84282,0.89381,0.88935,0.87236,0.95569,0.95091,0.93275,0.92616,0.92153,0.90394,0.89781,0.89332,0.87626,0.92238,0.91777,0.90025,0.9799,0.97501,0.95639,0.8883,0.88385,0.86698,0.90129,0.89678,0.87966,0.88604,0.88161,0.86477,0.95622,0.95144,0.93327,0.9721,0.96724,0.94877,0.90819,0.90365,0.8864,0.97413,0.96926,0.95075,0.91363,0.90907,0.89171,0.98081,0.97591,0.95727,0.93067,0.92602,0.90834,0.90401,0.89949,0.88232,0.94405,0.93933,0.9214,0.95338,0.94861,0.9305,0.88675,0.88232,0.86547,0.94891,0.94416,0.92613,0.89646,0.89197,0.87494,0.8847,0.88028,0.86347,0.8564,0.85212,0.83585,0.88216,0.87775,0.86099,0.92615,0.92152,0.90393,0.91946,0.91486,0.89739,0.9078,0.90326,0.88601,0.88208,0.87767,0.86091,0.85517,0.85089,0.83464,0.8734,0.86903,0.85244,0.85071,0.84645,0.83029,0.86064,0.85633,0.83998,0.84279,0.83857,0.82256,0.85527,0.85099,0.83474,0.85391,0.84964,0.83342,0.87911,0.87471,0.85801,0.82118,0.81707,0.80147,0.80705,0.80302,0.78768,0.85363,0.84936,0.83314,0.88756,0.88312,0.86625,0.82514,0.82101,0.80533,0.79532,0.79134,0.77623,0.83311,0.82895,0.81312,0.81097,0.80692,0.79151,0.82949,0.82535,0.80959,0.89271,0.88825,0.87129,0.85655,0.85226,0.83599,0.89744,0.89295,0.8759,0.82747,0.82333,0.80761,0.81207,0.80801,0.79258,0.83232,0.82816,0.81234,0.86437,0.86005,0.84362,0.91017,0.90562,0.88833,0.90107,0.89656,0.87944,0.86885,0.8645,0.84799,0.87775,0.87336,0.85668,0.90014,0.89564,0.87854,0.89568,0.8912,0.87419,0.86972,0.86537,0.84884,0.8815,0.87709,0.86034,0.92168,0.91707,0.89956,0.95052,0.94577,0.92771,0.90927,0.90473,0.88745,0.87069,0.86634,0.8498,0.92335,0.91874,0.90119,0.96239,0.95758,0.93929,0.87657,0.87219,0.85554,0.88245,0.87804,0.86128,0.88049,0.87609,0.85936,0.97727,0.97238,0.95381,0.95355,0.94878,0.93066,0.90712,0.90259,0.88535,0.95565,0.95087,0.93271,0.92744,0.92281,0.90518,0.95858,0.95378,0.93557,0.90788,0.90334,0.88609,0.89289,0.88842,0.87146,0.92664,0.92201,0.9044,0.92218,0.91757,0.90005,0.87751,0.87312,0.85645,0.91823,0.91364,0.89619,0.91833,0.91374,0.89629,0.89678,0.8923,0.87526,0.84603,0.8418,0.82572,0.90195,0.89744,0.8803,0.93277,0.92811,0.91039,0.91957,0.91497,0.8975,0.89455,0.89008,0.87308,0.89578,0.8913,0.87428,0.83323,0.82907,0.81323,0.84939,0.84514,0.829,0.86451,0.86018,0.84376,0.89113,0.88668,0.86975,0.84605,0.84182,0.82575,0.84377,0.83956,0.82352,0.84339,0.83917,0.82315,0.85324,0.84897,0.83276,0.8195,0.8154,0.79983,0.81146,0.80741,0.79199,0.85045,0.8462,0.83004,0.90418,0.89966,0.88248,0.82223,0.81812,0.8025,0.78849,0.78455,0.76957,0.80789,0.80385,0.7885,0.83237,0.82821,0.8124,0.84501,0.84078,0.82473,0.90192,0.89741,0.88027,0.86349,0.85917,0.84277,0.88845,0.884,0.86712,0.85343,0.84917,0.83295,0.80628,0.80225,0.78693,0.81992,0.81582,0.80024,0.85105,0.84679,0.83062,0.90748,0.90294,0.8857,0.89923,0.89474,0.87765,0.8811,0.8767,0.85996,0.90275,0.89823,0.88108,0.91411,0.90954,0.89217,0.86972,0.86537,0.84884,0.86639,0.86206,0.8456,0.91807,0.91348,0.89603,0.9427,0.93799,0.92008,0.91636,0.91178,0.89437,0.87339,0.86902,0.85243,0.854,0.84973,0.8335,0.90591,0.90138,0.88417,0.92481,0.92018,0.90261,0.86988,0.86553,0.84901,0.882,0.87759,0.86083,0.89071,0.88625,0.86933,0.97933,0.97443,0.95582,0.93298,0.92831,0.91059,0.89453,0.89006,0.87306,0.96918,0.96433,0.94592,0.92832,0.92368,0.90604,0.91448,0.90991,0.89253,0.87655,0.87216,0.85551,0.88508,0.88065,0.86384,0.90819,0.90365,0.8864,0.88059,0.87619,0.85945,0.86711,0.86278,0.8463,0.87927,0.87488,0.85817,0.94167,0.93697,0.91907,0.89854,0.89405,0.87698,0.84594,0.84171,0.82564,0.92339,0.91878,0.90123,0.92947,0.92482,0.90716,0.89725,0.89276,0.87571,0.90442,0.8999,0.88271,0.89363,0.88917,0.87219,0.83577,0.83159,0.81571,0.825,0.82088,0.8052,0.90981,0.90526,0.88797,0.92164,0.91703,0.89952,0.88382,0.8794,0.86261,0.82632,0.82219,0.80649,0.84283,0.83862,0.82261,0.83089,0.82673,0.81094,0.82028,0.81618,0.8006,0.84979,0.84555,0.8294,0.86529,0.86096,0.84452,0.89382,0.88935,0.87237,0.80539,0.80136,0.78606,0.78829,0.78434,0.76937,0.81881,0.81471,0.79915,0.85578,0.8515,0.83524,0.84748,0.84325,0.82714,0.8822,0.87779,0.86103,0.85178,0.84752,0.83134,0.86792,0.86358,0.84709,0.87969,0.87529,0.85858,0.79693,0.79294,0.7778,0.80717,0.80314,0.7878,0.83654,0.83236,0.81647,0.87776,0.87337,0.85669,0.89074,0.88629,0.86937,0.8788,0.8744,0.8577,0.92062,0.91601,0.89852,0.90585,0.90132,0.88411,0.86639,0.86206,0.8456,0.90893,0.90438,0.88711,0.9269,0.92227,0.90466,0.90728,0.90274,0.8855,0.9393,0.9346,0.91675,0.87661,0.87222,0.85557,0.86545,0.86112,0.84468,0.90468,0.90016,0.88297,0.90613,0.9016,0.88439,0.86762,0.86328,0.8468,0.91994,0.91534,0.89786,0.89287,0.88841,0.87145,0.92466,0.92003,0.90247,0.88817,0.88373,0.86685,0.89644,0.89195,0.87492,0.95033,0.94558,0.92752,0.98107,0.97616,0.95752,0.89497,0.8905,0.87349,0.91072,0.90616,0.88886,0.92142,0.91681,0.89931,0.95816,0.95337,0.93516,0.88189,0.87748,0.86072,0.88455,0.88013,0.86332,0.88802,0.88358,0.8667,0.92361,0.91899,0.90144,0.88215,0.87774,0.86098,0.85109,0.84683,0.83066,0.91305,0.90849,0.89114,0.95177,0.94701,0.92893,0.86514,0.86082,0.84438,0.88389,0.87947,0.86268,0.88957,0.88512,0.86822,0.87721,0.87282,0.85615,0.84772,0.84348,0.82738,0.93146,0.92681,0.90911,0.91582,0.91124,0.89384,0.89449,0.89002,0.87302,0.81765,0.81356,0.79802,0.81943,0.81533,0.79976,0.80542,0.80139,0.78609,0.8749,0.87052,0.8539,0.88232,0.87791,0.86115,0.86083,0.85652,0.84017,0.82792,0.82378,0.80805,0.8206,0.8165,0.80091,0.81889,0.8148,0.79924,0.83892,0.83472,0.81878,0.84425,0.84003,0.82399,0.84445,0.84023,0.82418,0.81664,0.81256,0.79704,0.81046,0.8064,0.791,0.89314,0.88867,0.8717,0.85979,0.85549,0.83915,0.8213,0.81719,0.80158,0.83968,0.83548,0.81953,0.85322,0.84896,0.83275,0.82766,0.82352,0.80779,0.87524,0.87086,0.85423,0.91234,0.90778,0.89045,0.88706,0.88262,0.86577,0.89069,0.88624,0.86932,0.90893,0.90438,0.88711,0.89144,0.88699,0.87005,0.90198,0.89747,0.88033,0.89811,0.89361,0.87655,0.91642,0.91184,0.89443,0.88122,0.87681,0.86007,0.90585,0.90132,0.88411,0.92692,0.92229,0.90467,0.92142,0.91682,0.89931,0.91196,0.9074,0.89008,0.97795,0.97306,0.95448,0.90719,0.90266,0.88542,0.91655,0.91197,0.89455,0.93099,0.92634,0.90865,0.91608,0.9115,0.89409,0.96804,0.9632,0.94481,0.9687,0.96385,0.94545,0.95029,0.94554,0.92749,0.94681,0.94207,0.92408,0.97207,0.96721,0.94874,0.96675,0.96191,0.94354,0.89036,0.88591,0.86899,0.89163,0.88717,0.87023,0.92878,0.92414,0.90649,0.93349,0.92882,0.91108,0.87569,0.87131,0.85467,0.85885,0.85456,0.83824,0.93453,0.92986,0.9121,0.94347,0.93875,0.92082,0.85297,0.84871,0.8325,0.85996,0.85566,0.83932,0.92186,0.91725,0.89973,0.92918,0.92453,0.90688,0.84428,0.84006,0.82402,0.87433,0.86996,0.85334,0.8962,0.89171,0.87469,0.84224,0.83803,0.82203,0.81236,0.8083,0.79287,0.85501,0.85074,0.83449,0.81867,0.81458,0.79902,0.88079,0.87638,0.85965,0.89262,0.88816,0.8712,0.88118,0.87677,0.86003,0.85166,0.8474,0.83122,0.83347,0.8293,0.81347,0.8357,0.83152,0.81564,0.81245,0.80839,0.79296,0.8266,0.82247,0.80677,0.87878,0.87439,0.85769,0.84013,0.83593,0.81996,0.82493,0.8208,0.80513,0.84582,0.8416,0.82552,0.87659,0.87221,0.85555,0.85195,0.84769,0.83151,0.84208,0.83787,0.82187,0.84717,0.84293,0.82684,0.81238,0.80832,0.79288,0.90864,0.90409,0.88683,0.89585,0.89137,0.87435,0.90593,0.9014,0.88419,0.91646,0.91188,0.89447,0.89144,0.88699,0.87005,0.88108,0.87667,0.85993,0.8744,0.87002,0.85341,0.91818,0.91359,0.89614,0.86731,0.86298,0.8465,0.93968,0.93498,0.91713,0.93989,0.93519,0.91733,0.92343,0.91882,0.90127,0.88527,0.88085,0.86403,0.93931,0.93461,0.91676,0.9619,0.95709,0.93881,0.90735,0.90282,0.88558,0.96118,0.95638,0.93811,0.9302,0.92555,0.90788,0.91165,0.90709,0.88977,0.93303,0.92836,0.91064,0.97015,0.9653,0.94687,0.97521,0.97034,0.95181,0.92348,0.91886,0.90131,0.95134,0.94658,0.9285,0.91231,0.90774,0.89041,0.93091,0.92626,0.90857,0.92436,0.91973,0.90217,0.95972,0.95492,0.93669,0.94998,0.94523,0.92718,0.85433,0.85006,0.83383,0.86854,0.8642,0.84769,0.90465,0.90012,0.88294,0.91447,0.9099,0.89252,0.88135,0.87695,0.8602,0.92369,0.91908,0.90153,0.91876,0.91417,0.89671,0.90488,0.90036,0.88317,0.85899,0.85469,0.83837,0.88358,0.87916,0.86238,0.86113,0.85682,0.84046,0.85496,0.85069,0.83444,0.83308,0.82892,0.81309,0.85862,0.85432,0.83801,0.81991,0.81581,0.80023,0.86553,0.8612,0.84476,0.88451,0.88009,0.86328,0.83856,0.83437,0.81844,0.85572,0.85145,0.83519,0.80301,0.79899,0.78374,0.81149,0.80743,0.79201,0.78319,0.77927,0.76439,0.85187,0.84761,0.83142,0.84884,0.8446,0.82847,0.83572,0.83154,0.81566,0.89252,0.88806,0.8711,0.83137,0.82721,0.81142,0.90217,0.89766,0.88052,0.84777,0.84353,0.82742,0.90299,0.89848,0.88132,0.85847,0.85418,0.83787,0.81527,0.81119,0.7957,0.86906,0.86472,0.84821,0.88298,0.87856,0.86178,0.90023,0.89572,0.87862,0.87488,0.8705,0.85388,0.88108,0.87667,0.85993,0.84762,0.84338,0.82728,0.93625,0.93157,0.91378,0.9283,0.92366,0.90602,0.86419,0.85987,0.84345,0.936,0.93132,0.91353,0.96792,0.96308,0.94469,0.899,0.8945,0.87742,0.86653,0.8622,0.84573,0.90518,0.90066,0.88346,0.9342,0.92953,0.91178,0.91567,0.91109,0.89369,0.93663,0.93195,0.91415,0.93256,0.92789,0.91017,0.89465,0.89018,0.87318,0.94722,0.94249,0.92449,0.99226,0.9873,0.96844,0.92539,0.92076,0.90318,0.91763,0.91304,0.8956,0.93652,0.93184,0.91404,0.97769,0.9728,0.95422,0.95221,0.94745,0.92936,0.94866,0.94392,0.92589,0.94966,0.94491,0.92687,0.90611,0.90158,0.88436,0.86081,0.85651,0.84015,0.89288,0.88842,0.87145,0.88417,0.87975,0.86295,0.88528,0.88085,0.86403,0.89104,0.88658,0.86965,0.94456,0.93984,0.92189,0.89724,0.89276,0.87571,0.84517,0.84094,0.82488,0.86988,0.86553,0.849,0.88867,0.88423,0.86734,0.90738,0.90285,0.88561,0.84591,0.84168,0.82561,0.86271,0.8584,0.84201,0.8181,0.81401,0.79846,0.85084,0.84659,0.83042,0.87233,0.86797,0.8514,0.82004,0.81594,0.80036,0.87667,0.87228,0.85563,0.85313,0.84887,0.83266,0.79049,0.78654,0.77152,0.81049,0.80644,0.79104,0.79312,0.78915,0.77408,0.85824,0.85395,0.83764,0.82268,0.81856,0.80293,0.8972,0.89271,0.87567,0.89541,0.89094,0.87392,0.88074,0.87634,0.8596,0.8882,0.88376,0.86688,0.83451,0.83034,0.81448,0.89288,0.88842,0.87145,0.82404,0.81992,0.80426,0.83539,0.83122,0.81534,0.92194,0.91733,0.89981,0.86815,0.86381,0.84731,0.84589,0.84166,0.82559,0.90234,0.89783,0.88069,0.84762,0.84338,0.82728,0.8783,0.87391,0.85722,0.9549,0.95013,0.93199,0.87701,0.87262,0.85596,0.85233,0.84807,0.83187,0.88526,0.88083,0.86401,0.91447,0.9099,0.89252,0.85928,0.85498,0.83865,0.91545,0.91087,0.89348,0.92726,0.92262,0.90501,0.90219,0.89768,0.88054,0.93707,0.93238,0.91458,0.92805,0.92341,0.90578,0.98386,0.97894,0.96025,0.91156,0.907,0.88968,0.97988,0.97498,0.95637,0.93408,0.92941,0.91166,0.97401,0.96914,0.95063,0.92986,0.92521,0.90755,0.97495,0.97008,0.95156,0.97331,0.96845,0.94995,0.92741,0.92278,0.90515,0.92211,0.9175,0.89998,0.98346,0.97854,0.95986,0.91192,0.90736,0.89003,0.86556,0.86123,0.84478,0.87954,0.87514,0.85843,0.86638,0.86205,0.84559,0.87886,0.87447,0.85777,0.85801,0.85372,0.83742,0.88807,0.88363,0.86675,0.87388,0.86951,0.85291,0.82302,0.81891,0.80327,0.83744,0.83325,0.81734,0.91326,0.90869,0.89134,0.88455,0.88013,0.86332,0.88553,0.8811,0.86428,0.89583,0.89135,0.87433,0.80249,0.79848,0.78323,0.83472,0.83054,0.81468,0.85553,0.85125,0.83499,0.83167,0.82751,0.81171,0.85165,0.84739,0.83121,0.87745,0.87306,0.85639,0.82448,0.82036,0.80469,0.86636,0.86203,0.84557,0.80138,0.79738,0.78215,0.82075,0.81665,0.80105,0.84935,0.8451,0.82897,0.88742,0.88298,0.86612,0.8579,0.85361,0.83731,0.89584,0.89136,0.87434,0.85689,0.85261,0.83633,0.81603,0.81195,0.79645,0.82856,0.82442,0.80868,0.86274,0.85842,0.84203,0.86838,0.86404,0.84754,0.92221,0.9176,0.90007,0.84195,0.83774,0.82174,0.84887,0.84463,0.8285,0.86883,0.86448,0.84798,0.8783,0.87391,0.85722,0.88142,0.87701,0.86027,0.9056,0.90108,0.88387,0.88443,0.88001,0.8632,0.85212,0.84786,0.83167,0.85932,0.85503,0.8387,0.88628,0.88185,0.86501,0.88732,0.88288,0.86602,0.92921,0.92456,0.90691,0.94732,0.94259,0.92459,0.95717,0.95239,0.9342,0.89443,0.88996,0.87296,0.93664,0.93195,0.91416,0.94372,0.939,0.92107,0.94124,0.93653,0.91865,0.98738,0.98244,0.96368,0.92975,0.9251,0.90744,0.9457,0.94097,0.923,0.92715,0.92251,0.90489,0.9256,0.92097,0.90338,0.89212,0.88766,0.87071,0.88664,0.88221,0.86537,0.92806,0.92342,0.90578,0.94337,0.93865,0.92072,0.87052,0.86617,0.84963,0.85507,0.8508,0.83455,0.88898,0.88453,0.86764,0.89502,0.89054,0.87354,0.83813,0.83394,0.81801,0.83404,0.82987,0.81402,0.84428,0.84005,0.82401,0.85984,0.85554,0.8392,0.84155,0.83734,0.82135,0.83933,0.83513,0.81919,0.91603,0.91145,0.89404,0.91613,0.91155,0.89414,0.88041,0.87601,0.85928,0.84931,0.84506,0.82892,0.81502,0.81095,0.79546,0.81384,0.80977,0.79431,0.84984,0.84559,0.82945,0.86553,0.86121,0.84476,0.86523,0.86091,0.84447,0.84654,0.84231,0.82622,0.85787,0.85359,0.83729,0.86674,0.86241,0.84594,0.80409,0.80007,0.78479,0.81528,0.81121,0.79572,0.81024,0.80619,0.79079,0.80912,0.80508,0.7897,0.86746,0.86312,0.84664,0.82249,0.81838,0.80275,0.82387,0.81975,0.80409,0.81365,0.80958,0.79412,0.86278,0.85847,0.84207,0.91682,0.91224,0.89482,0.87371,0.86934,0.85274,0.83941,0.83522,0.81927,0.84067,0.83647,0.8205,0.84258,0.83836,0.82235,0.92458,0.91996,0.90239,0.88142,0.87701,0.86027,0.8525,0.84824,0.83204,0.87402,0.86965,0.85304,0.91171,0.90715,0.88983,0.91668,0.91209,0.89468,0.90213,0.89762,0.88048,0.93112,0.92646,0.90877,0.90309,0.89857,0.88142,0.90821,0.90367,0.88641,0.95591,0.95113,0.93296,0.92392,0.9193,0.90175,0.91988,0.91528,0.8978,0.98179,0.97688,0.95823,0.95228,0.94752,0.92943,0.92571,0.92108,0.90349,0.93875,0.93406,0.91622,0.91119,0.90663,0.88932,0.96057,0.95576,0.93751,0.95601,0.95123,0.93307,0.91568,0.9111,0.8937,0.92613,0.9215,0.90391,0.96655,0.96172,0.94335,0.88247,0.87805,0.86129,0.91183,0.90727,0.88994,0.92058,0.91598,0.89849,0.90208,0.89757,0.88043,0.95778,0.95299,0.9348,0.93652,0.93184,0.91404,0.84083,0.83662,0.82065,0.89324,0.88877,0.8718,0.91139,0.90683,0.88951,0.93104,0.92638,0.90869,0.84083,0.83663,0.82065,0.83646,0.83228,0.81638,0.90055,0.89605,0.87894,0.86594,0.86161,0.84516,0.83807,0.83388,0.81795,0.83381,0.82964,0.8138,0.82387,0.81975,0.8041,0.79709,0.7931,0.77796,0.82787,0.82373,0.808,0.8595,0.8552,0.83887,0.87219,0.86783,0.85126,0.87859,0.8742,0.85751,0.85454,0.85027,0.83403,0.79879,0.7948,0.77962,0.8739,0.86953,0.85293,0.86525,0.86092,0.84449,0.85459,0.85032,0.83408,0.83183,0.82767,0.81187,0.87966,0.87526,0.85855,0.89044,0.88599,0.86907,0.87876,0.87437,0.85767,0.8736,0.86923,0.85264,0.84358,0.83937,0.82334,0.8594,0.8551,0.83877,0.87893,0.87453,0.85783,0.87816,0.87377,0.85708,0.82024,0.81614,0.80056,0.88243,0.87802,0.86125,0.90308,0.89856,0.8814,0.8525,0.84824,0.83204,0.83116,0.827,0.81121,0.8385,0.8343,0.81837,0.93615,0.93147,0.91369,0.93362,0.92895,0.91121,0.89045,0.886,0.86908,0.90841,0.90386,0.8866,0.88945,0.885,0.86811,0.92418,0.91956,0.902,0.96845,0.96361,0.94521,0.90518,0.90065,0.88346,0.90976,0.90521,0.88792,0.94371,0.93899,0.92106,0.91443,0.90986,0.89249,0.92228,0.91766,0.90014,0.94529,0.94056,0.9226,0.95228,0.94752,0.92942,0.95559,0.95081,0.93266,0.98487,0.97994,0.96123,0.94134,0.93664,0.91875,0.93836,0.93367,0.91584,0.97213,0.96727,0.9488,0.92901,0.92437,0.90672,0.90006,0.89556,0.87846,0.94776,0.94302,0.92501,0.91544,0.91087,0.89347,0.91627,0.91169,0.89428,0.89334,0.88887,0.8719,0.86406,0.85974,0.84332,0.91023,0.90568,0.88839,0.93661,0.93193,0.91413,0.91331,0.90874,0.89139,0.82693,0.8228,0.80709,0.82935,0.8252,0.80945,0.82296,0.81884,0.80321,0.86157,0.85726,0.84089,0.89167,0.88721,0.87027,0.85262,0.84836,0.83216,0.82403,0.81991,0.80425,0.83876,0.83457,0.81863,0.79436,0.79039,0.7753,0.87655,0.87217,0.85551,0.87987,0.87547,0.85875,0.88229,0.87788,0.86111,0.84869,0.84445,0.82832,0.86007,0.85577,0.83942,0.85753,0.85324,0.83695,0.83924,0.83504,0.8191,0.89985,0.89535,0.87826,0.85227,0.848,0.83181,0.87789,0.8735,0.85682,0.87292,0.86855,0.85197,0.85446,0.85019,0.83396,0.85841,0.85411,0.8378,0.87237,0.86801,0.85144,0.87283,0.86847,0.85188,0.9104,0.90584,0.88855,0.89674,0.89225,0.87521,0.82403,0.81991,0.80425,0.89566,0.89118,0.87417,0.87501,0.87064,0.85401,0.83116,0.827,0.81121,0.89028,0.88583,0.86891,0.84683,0.84259,0.8265,0.86391,0.85959,0.84318,0.91963,0.91503,0.89756,0.88971,0.88526,0.86835,0.9424,0.93769,0.91978,0.92319,0.91858,0.90104,0.88226,0.87785,0.86108,0.95931,0.95451,0.93628,0.96516,0.96033,0.94199,0.95786,0.95307,0.93487,0.97615,0.97127,0.95273,0.91029,0.90574,0.88844,0.96242,0.95761,0.93932,0.95642,0.95164,0.93347,0.91759,0.913,0.89557,0.97882,0.97392,0.95533,0.95173,0.94697,0.92889,0.90181,0.8973,0.88016,0.93977,0.93507,0.91722,0.9478,0.94306,0.92505,0.941,0.93629,0.91841,0.89756,0.89307,0.87602,0.98358,0.97866,0.95997,0.95327,0.94851,0.93039,0.89219,0.88773,0.87078,0.93955,0.93485,0.917,0.91811,0.91352,0.89608,0.89855,0.89405,0.87698,0.88509,0.88066,0.86385,0.84131,0.83711,0.82112,0.83798,0.83379,0.81787,0.88975,0.8853,0.86839,0.85339,0.84912,0.83291,0.86206,0.85775,0.84137,0.90507,0.90055,0.88335,0.92158,0.91697,0.89946,0.86317,0.85885,0.84245,0.89132,0.88686,0.86993,0.80417,0.80015,0.78487,0.81786,0.81378,0.79824,0.86162,0.85732,0.84094,0.80669,0.80266,0.78733,0.85241,0.84815,0.83195,0.86019,0.85589,0.83954,0.86897,0.86463,0.84812,0.82226,0.81815,0.80252,0.83666,0.83248,0.81658,0.85854,0.85425,0.83794,0.89027,0.88582,0.8689,0.86359,0.85927,0.84286,0.79596,0.79198,0.77686,0.8517,0.84745,0.83126,0.90763,0.90309,0.88584,0.85873,0.85444,0.83812,0.89641,0.89193,0.8749,0.89053,0.88608,0.86916,0.89092,0.88647,0.86954,0.89661,0.89212,0.87509,0.8478,0.84357,0.82746,0.89028,0.88583,0.86891,0.90329,0.89877,0.88161,0.86687,0.86253,0.84606,0.92178,0.91718,0.89966,0.88395,0.87953,0.86274,0.88208,0.87767,0.86091,0.9009,0.8964,0.87928,0.92495,0.92033,0.90275,0.91054,0.90599,0.88869,0.90386,0.89934,0.88217,0.93321,0.92855,0.91082,0.9219,0.91729,0.89977,0.92185,0.91724,0.89972,0.91557,0.91099,0.89359,0.90431,0.89979,0.88261,0.97435,0.96948,0.95097,0.91972,0.91512,0.89765,0.90082,0.89631,0.8792,0.90423,0.89971,0.88253,0.88284,0.87842,0.86165,0.91632,0.91174,0.89433,0.89118,0.88672,0.86979,0.89716,0.89267,0.87563,0.93839,0.9337,0.91587,0.92238,0.91777,0.90025,0.96161,0.9568,0.93853,0.93281,0.92814,0.91042,0.95902,0.95423,0.936,0.92844,0.92379,0.90615,0.94078,0.93608,0.9182,0.8603,0.856,0.83965,0.83777,0.83358,0.81766,0.83725,0.83306,0.81715,0.92363,0.91901,0.90146,0.90633,0.9018,0.88458,0.85536,0.85108,0.83483,0.83188,0.82772,0.81192,0.87082,0.86647,0.84992,0.85295,0.84869,0.83248,0.89521,0.89074,0.87373,0.81917,0.81507,0.79951,0.81974,0.81564,0.80007,0.90089,0.89638,0.87927,0.8419,0.83769,0.8217,0.88483,0.88041,0.8636,0.83173,0.82757,0.81177,0.80604,0.80201,0.7867,0.83393,0.82977,0.81392,0.85455,0.85028,0.83404,0.81226,0.8082,0.79277,0.80932,0.80527,0.78989,0.81418,0.81011,0.79464,0.78991,0.78597,0.77096,0.8,0.796,0.7808,0.83988,0.83568,0.81972,0.80934,0.80529,0.78991,0.82204,0.81793,0.80231,0.88355,0.87913,0.86235,0.91783,0.91324,0.8958,0.9152,0.91062,0.89324,0.87284,0.86848,0.8519,0.90329,0.89877,0.88161,0.88575,0.88132,0.86449,0.88215,0.87774,0.86098,0.92502,0.9204,0.90282,0.93229,0.92763,0.90991,0.88244,0.87803,0.86126,0.85689,0.8526,0.83632,0.95815,0.95336,0.93516,0.95433,0.94956,0.93143,0.89134,0.88688,0.86995,0.91602,0.91144,0.89403,0.96158,0.95678,0.93851,0.97313,0.96827,0.94978,0.92308,0.91847,0.90093,0.96471,0.95989,0.94156,0.92296,0.91835,0.90081,0.91681,0.91222,0.8948,0.90775,0.90321,0.88597,0.89957,0.89507,0.87798,0.90276,0.89824,0.88109,0.96152,0.95672,0.93845,0.9327,0.92804,0.91032,0.95325,0.94849,0.93037,0.97475,0.96988,0.95136,0.90214,0.89763,0.88049,0.87072,0.86636,0.84982,0.91834,0.91375,0.8963,0.90601,0.90148,0.88427,0.93019,0.92554,0.90787,0.88918,0.88473,0.86784,0.92064,0.91604,0.89855,0.9245,0.91987,0.90231,0.85173,0.84747,0.83128,0.89202,0.88756,0.87061,0.8875,0.88306,0.8662,0.83987,0.83568,0.81972,0.81259,0.80853,0.79309,0.87007,0.86572,0.84919,0.82926,0.82511,0.80936,0.82607,0.82194,0.80625,0.87071,0.86636,0.84981,0.83015,0.826,0.81022,0.85363,0.84936,0.83314,0.8823,0.87789,0.86113,0.83923,0.83503,0.81909,0.83357,0.8294,0.81357,0.84178,0.83757,0.82157,0.87316,0.86879,0.8522,0.89277,0.88831,0.87135,0.82713,0.823,0.80728,0.82905,0.8249,0.80915,0.8488,0.84456,0.82843,0.83714,0.83296,0.81705,0.85138,0.84712,0.83094,0.8359,0.83172,0.81584,0.86377,0.85945,0.84304,0.85519,0.85091,0.83466,0.83603,0.83185,0.81597,0.8867,0.88226,0.86542,0.88548,0.88105,0.86423,0.87455,0.87017,0.85356,0.88575,0.88132,0.86449,0.84925,0.845,0.82887,0.86769,0.86335,0.84686,0.85678,0.85249,0.83622,0.9189,0.91431,0.89685,0.94728,0.94254,0.92454,0.93199,0.92733,0.90962,0.89612,0.89164,0.87462,0.91058,0.90603,0.88873,0.91666,0.91208,0.89466,0.91558,0.911,0.89361,0.95056,0.94581,0.92775,0.92823,0.92359,0.90595,0.88539,0.88097,0.86414,0.94867,0.94392,0.9259,0.93463,0.92995,0.9122,0.89977,0.89527,0.87818,0.89646,0.89198,0.87495,0.94618,0.94144,0.92347,0.95733,0.95254,0.93435,0.97945,0.97455,0.95594,0.91552,0.91094,0.89355,0.89156,0.8871,0.87016,0.93922,0.93452,0.91668,0.95947,0.95467,0.93644,0.88773,0.8833,0.86643,0.92133,0.91672,0.89921,0.85923,0.85493,0.8386,0.87815,0.87376,0.85708,0.90118,0.89668,0.87956,0.8739,0.86953,0.85293,0.89471,0.89023,0.87323,0.84804,0.8438,0.82769,0.92954,0.92489,0.90723,0.89234,0.88788,0.87093,0.81286,0.8088,0.79336,0.80342,0.79941,0.78414,0.81724,0.81316,0.79763,0.83749,0.8333,0.81739,0.84152,0.83731,0.82132,0.8142,0.81013,0.79466,0.82557,0.82144,0.80575,0.80943,0.80538,0.79,0.80628,0.80225,0.78693,0.81056,0.80651,0.79111,0.86027,0.85597,0.83962,0.89161,0.88716,0.87021,0.83422,0.83005,0.8142,0.90412,0.8996,0.88242,0.82238,0.81827,0.80265,0.83438,0.83021,0.81436,0.79721,0.79322,0.77808,0.81937,0.81527,0.79971,0.82836,0.82422,0.80848,0.87723,0.87284,0.85617,0.82979,0.82564,0.80987,0.86012,0.85582,0.83948,0.89208,0.88762,0.87067,0.85664,0.85236,0.83608,0.88173,0.87733,0.86057,0.90017,0.89567,0.87857,0.84925,0.845,0.82887,0.87357,0.8692,0.8526,0.95326,0.94849,0.93038,0.90967,0.90512,0.88784,0.94159,0.93688,0.91899,0.91406,0.90949,0.89212,0.89671,0.89223,0.87519,0.96151,0.9567,0.93844,0.9381,0.93341,0.91559,0.91948,0.91489,0.89742,0.91436,0.90979,0.89241,0.98736,0.98242,0.96366,0.90529,0.90077,0.88357,0.91587,0.91129,0.89389,0.94597,0.94124,0.92327,0.96467,0.95984,0.94151,0.92496,0.92034,0.90276,0.95904,0.95424,0.93602,0.96002,0.95522,0.93698,0.89508,0.89061,0.8736,0.91521,0.91063,0.89324,0.92857,0.92392,0.90628,0.92011,0.91551,0.89803,0.94732,0.94259,0.92459,0.89884,0.89434,0.87726,0.89589,0.89142,0.87439,0.92521,0.92058,0.903,0.88922,0.88477,0.86788,0.87875,0.87435,0.85766,0.91422,0.90965,0.89228,0.94215,0.93744,0.91954,0.91422,0.90965,0.89228,0.92822,0.92358,0.90594,0.88254,0.87813,0.86136,0.85937,0.85507,0.83875,0.82469,0.82057,0.8049,0.87285,0.86849,0.8519,0.889,0.88455,0.86766,0.84167,0.83746,0.82147,0.84951,0.84526,0.82912,0.83567,0.8315,0.81562,0.81005,0.806,0.79061,0.80085,0.79684,0.78163,0.79594,0.79196,0.77683,0.81501,0.81094,0.79545,0.7845,0.78058,0.76567,0.8504,0.84615,0.82999,0.85201,0.84775,0.83156,0.87257,0.86821,0.85163,0.83116,0.82701,0.81121,0.84153,0.83733,0.82134,0.86243,0.85811,0.84173,0.86604,0.86171,0.84525,0.89306,0.88859,0.87163,0.82636,0.82223,0.80653,0.83173,0.82757,0.81177,0.87944,0.87504,0.85833,0.88264,0.87822,0.86145,0.85019,0.84594,0.82978,0.83937,0.83518,0.81923,0.91572,0.91114,0.89374,0.87357,0.8692,0.8526,0.86812,0.86378,0.84729,0.94732,0.94258,0.92458,0.91312,0.90856,0.89121,0.90061,0.89611,0.87899,0.90638,0.90184,0.88462,0.91252,0.90796,0.89062,0.89839,0.8939,0.87683,0.89534,0.89086,0.87385,0.92725,0.92261,0.905,0.90088,0.89637,0.87926,0.94733,0.94259,0.92459,0.91483,0.91026,0.89287,0.88031,0.87591,0.85918,0.91605,0.91147,0.89407,0.91277,0.9082,0.89086,0.95877,0.95397,0.93576,0.95936,0.95456,0.93633,0.95113,0.94638,0.9283,0.89337,0.88891,0.87193,0.93571,0.93104,0.91326,0.9117,0.90714,0.88982,0.94679,0.94206,0.92407,0.91088,0.90632,0.88902,0.87898,0.87459,0.85788,0.91846,0.91387,0.89642,0.88338,0.87896,0.86218,0.91509,0.91052,0.89313,0.90527,0.90074,0.88354,0.88385,0.87943,0.86264,0.88304,0.87863,0.86185,0.93047,0.92582,0.90814,0.8575,0.85321,0.83692,0.91555,0.91097,0.89357,0.86914,0.8648,0.84828,0.83076,0.82661,0.81082,0.8275,0.82336,0.80764,0.88784,0.8834,0.86653,0.83428,0.83011,0.81426,0.91033,0.90578,0.88849,0.83872,0.83453,0.81859,0.82102,0.81691,0.80131,0.84472,0.8405,0.82445,0.81585,0.81177,0.79627,0.81525,0.81118,0.79569,0.77858,0.77469,0.75989,0.81406,0.80999,0.79452,0.83724,0.83305,0.81714,0.84519,0.84097,0.82491,0.87245,0.86809,0.85151,0.8121,0.80804,0.79261,0.82107,0.81696,0.80136,0.88981,0.88537,0.86846,0.86263,0.85832,0.84193,0.86643,0.86209,0.84563,0.88456,0.88014,0.86333,0.90617,0.90164,0.88443,0.84603,0.8418,0.82573,0.85975,0.85545,0.83912,0.82689,0.82275,0.80704,0.88088,0.87648,0.85974,0.86812,0.86378,0.84729,0.91445,0.90987,0.8925,0.90793,0.90339,0.88614,0.86214,0.85783,0.84145,0.94476,0.94004,0.92209,0.92489,0.92027,0.90269,0.92224,0.91762,0.9001,0.92317,0.91855,0.90101,0.90313,0.89861,0.88145,0.89229,0.88783,0.87087,0.89291,0.88844,0.87148,0.93694,0.93225,0.91445,0.97077,0.96592,0.94747,0.88635,0.88192,0.86508,0.88947,0.88502,0.86812,0.94245,0.93774,0.91983,0.8915,0.88704,0.8701,0.91313,0.90856,0.89121,0.90159,0.89709,0.87996,0.8977,0.89321,0.87615,0.97087,0.96602,0.94757,0.95408,0.94931,0.93119,0.95517,0.95039,0.93225,0.93318,0.92851,0.91078,0.92992,0.92527,0.9076,0.92474,0.92011,0.90254,0.89035,0.8859,0.86899,0.90256,0.89805,0.8809,0.93351,0.92884,0.9111,0.95512,0.95035,0.9322,0.86557,0.86124,0.8448,0.90332,0.89881,0.88164,0.8573,0.85301,0.83672,0.88368,0.87926,0.86247,0.87346,0.86909,0.8525,0.81533,0.81125,0.79576,0.80828,0.80424,0.78888,0.84322,0.839,0.82298,0.83939,0.8352,0.81925,0.80283,0.79881,0.78356,0.81894,0.81485,0.79929,0.80915,0.80511,0.78973,0.88236,0.87795,0.86119,0.88144,0.87704,0.86029,0.88991,0.88546,0.86855,0.81948,0.81539,0.79982,0.81846,0.81437,0.79882,0.83215,0.82799,0.81218,0.8405,0.8363,0.82033,0.86842,0.86408,0.84758,0.87233,0.86797,0.85139,0.88597,0.88154,0.86471,0.83464,0.83047,0.81461,0.85133,0.84707,0.8309,0.90065,0.89615,0.87904,0.88917,0.88473,0.86783,0.85583,0.85155,0.83529,0.82286,0.81874,0.80311,0.85231,0.84805,0.83185,0.823,0.81888,0.80324,0.88187,0.87746,0.8607,0.91445,0.90987,0.8925,0.90191,0.8974,0.88026,0.86538,0.86105,0.84461,0.95998,0.95518,0.93694,0.90607,0.90154,0.88433,0.92723,0.92259,0.90497,0.92881,0.92417,0.90652,0.95647,0.95168,0.93351,0.89451,0.89003,0.87304,0.90205,0.89754,0.8804,0.88509,0.88067,0.86385,0.93332,0.92865,0.91092,0.96022,0.95542,0.93717,0.90533,0.90081,0.88361,0.88141,0.877,0.86026,0.92294,0.91833,0.90079,0.88914,0.88469,0.8678,0.94106,0.93635,0.91847,0.95808,0.95329,0.93509,0.95687,0.95208,0.9339,0.92911,0.92446,0.90681,0.91152,0.90696,0.88964,0.89509,0.89061,0.87361,0.92382,0.9192,0.90165,0.87814,0.87375,0.85706,0.91585,0.91127,0.89387,0.90633,0.90179,0.88457,0.85528,0.85101,0.83476,0.90659,0.90206,0.88483,0.92378,0.91916,0.90161,0.93978,0.93508,0.91722,0.91546,0.91089,0.89349,0.87406,0.86969,0.85308,0.91372,0.90915,0.89179,0.92168,0.91707,0.89956,0.87531,0.87093,0.8543,0.84735,0.84312,0.82702,0.9039,0.89938,0.88221,0.8919,0.88744,0.8705,0.80705,0.80301,0.78768,0.87485,0.87047,0.85385,0.90027,0.89577,0.87866,0.88606,0.88163,0.86479,0.83175,0.82759,0.81178,0.85959,0.85529,0.83896,0.8669,0.86257,0.84609,0.88087,0.87646,0.85973,0.85641,0.85213,0.83585,0.85958,0.85528,0.83895,0.80097,0.79696,0.78174,0.81532,0.81124,0.79575,0.81746,0.81337,0.79784,0.83287,0.8287,0.81288,0.82407,0.81995,0.80429,0.85005,0.8458,0.82965,0.83533,0.83116,0.81528,0.86662,0.86229,0.84582,0.8332,0.82903,0.8132,0.89701,0.89252,0.87548,0.85276,0.8485,0.8323,0.86217,0.85786,0.84148,0.90191,0.8974,0.88026,0.90587,0.90134,0.88413,0.88901,0.88456,0.86767,0.88795,0.88351,0.86664,0.90092,0.89641,0.87929,0.89482,0.89035,0.87334,0.90551,0.90098,0.88377,0.93273,0.92807,0.91035,0.90039,0.89589,0.87878,0.98364,0.97872,0.96003,0.94889,0.94414,0.92611,0.8958,0.89132,0.8743,0.94572,0.94099,0.92302,0.96948,0.96463,0.94621,0.93087,0.92622,0.90853,0.88391,0.87949,0.8627,0.94193,0.93722,0.91932,0.91757,0.91298,0.89555,0.97235,0.96749,0.94902,0.92259,0.91797,0.90044,0.90812,0.90358,0.88633,0.92393,0.91931,0.90175,0.87409,0.86972,0.85311,0.88009,0.87569,0.85897,0.94539,0.94066,0.9227,0.91292,0.90836,0.89101,0.91605,0.91147,0.89406,0.85762,0.85333,0.83703,0.88211,0.8777,0.86094,0.90902,0.90448,0.88721,0.95053,0.94578,0.92772,0.9243,0.91968,0.90212,0.85804,0.85375,0.83745,0.86579,0.86146,0.84501,0.8788,0.8744,0.85771,0.86545,0.86113,0.84468,0.86428,0.85996,0.84354,0.91556,0.91098,0.89358,0.87587,0.87149,0.85485,0.89491,0.89043,0.87343,0.85879,0.85449,0.83817,0.84389,0.83967,0.82364,0.90899,0.90445,0.88718,0.8874,0.88296,0.8661,0.86948,0.86513,0.84861,0.84737,0.84313,0.82703,0.89194,0.88748,0.87053,0.81024,0.80619,0.79079,0.79814,0.79415,0.77899,0.82128,0.81718,0.80157,0.90878,0.90423,0.88697,0.84574,0.84151,0.82544,0.805,0.80098,0.78568,0.82394,0.81982,0.80416,0.87607,0.87169,0.85504,0.83136,0.8272,0.81141,0.83715,0.83297,0.81706,0.8682,0.86386,0.84736,0.88165,0.87724,0.86049,0.92903,0.92439,0.90674,0.85544,0.85116,0.83491,0.90587,0.90134,0.88413,0.91924,0.91464,0.89717,0.90959,0.90505,0.88776,0.89895,0.89445,0.87737,0.90723,0.90269,0.88545,0.85753,0.85324,0.83694,0.85733,0.85305,0.83676,0.84728,0.84304,0.82694,0.92673,0.92209,0.90448,0.96734,0.9625,0.94412,0.8985,0.89401,0.87694,0.89445,0.88998,0.87298,0.89214,0.88768,0.87073,0.88915,0.88471,0.86781,0.89431,0.88984,0.87285,0.90013,0.89563,0.87852,0.93899,0.93429,0.91645,0.91965,0.91505,0.89758,0.95294,0.94818,0.93007,0.93675,0.93206,0.91427,0.97106,0.96621,0.94776,0.90921,0.90467,0.88739,0.87282,0.86845,0.85187,0.89009,0.88564,0.86873,0.93947,0.93478,0.91693,0.87265,0.86829,0.85171,0.92032,0.91572,0.89824,0.93431,0.92964,0.91188,0.86028,0.85598,0.83963,0.85492,0.85065,0.83441,0.86643,0.8621,0.84564,0.86026,0.85596,0.83961,0.88225,0.87784,0.86108,0.9175,0.91291,0.89548,0.86423,0.85991,0.84349,0.89072,0.88627,0.86934,0.8289,0.82476,0.80901,0.82288,0.81876,0.80313,0.85186,0.8476,0.83142,0.88064,0.87624,0.8595,0.85233,0.84807,0.83187,0.81162,0.80756,0.79214,0.85393,0.84966,0.83344,0.81509,0.81102,0.79553,0.8423,0.83809,0.82209,0.83928,0.83509,0.81914,0.81418,0.81011,0.79464,0.80721,0.80318,0.78784,0.85628,0.852,0.83573,0.84212,0.83791,0.82191,0.81926,0.81516,0.7996,0.86799,0.86365,0.84716,0.83908,0.83488,0.81894,0.85511,0.85083,0.83458,0.89973,0.89523,0.87814,0.84937,0.84512,0.82899,0.84464,0.84042,0.82437,0.91845,0.91386,0.8964,0.90685,0.90232,0.88509,0.91432,0.90975,0.89238,0.86689,0.86256,0.84608,0.91924,0.91464,0.89717,0.83952,0.83533,0.81937,0.86403,0.85971,0.8433,0.95077,0.94601,0.92795,0.91651,0.91193,0.89451,0.92469,0.92007,0.9025,0.88402,0.8796,0.8628,0.84729,0.84305,0.82695,0.90558,0.90105,0.88384,0.91814,0.91354,0.8961,0.98884,0.9839,0.96511,0.93008,0.92543,0.90776,0.87923,0.87483,0.85813,0.89905,0.89455,0.87747,0.89046,0.88601,0.86909,0.9117,0.90714,0.88982,0.97081,0.96596,0.94751,0.93234,0.92768,0.90997,0.9834,0.97848,0.9598,0.90122,0.89671,0.87959,0.94385,0.93913,0.9212,0.98337,0.97845,0.95977,0.96812,0.96328,0.94489,0.88941,0.88496,0.86806,0.92069,0.91608,0.89859,0.91142,0.90686,0.88954,0.90727,0.90274,0.8855,0.90281,0.8983,0.88114,0.96104,0.95624,0.93798,0.89336,0.88889,0.87192,0.90738,0.90284,0.8856,0.89224,0.88778,0.87083,0.86804,0.8637,0.84721,0.89265,0.88819,0.87123,0.89349,0.88902,0.87204,0.90473,0.90021,0.88302,0.83873,0.83453,0.8186,0.832,0.82784,0.81204,0.86386,0.85954,0.84313,0.87296,0.8686,0.85201,0.80273,0.79872,0.78347,0.86585,0.86152,0.84507,0.88038,0.87598,0.85925,0.88313,0.87871,0.86193,0.85931,0.85501,0.83869,0.89494,0.89047,0.87346,0.80042,0.79642,0.78121,0.84493,0.84071,0.82465,0.85149,0.84723,0.83105,0.86702,0.86268,0.84621,0.80608,0.80205,0.78674,0.87887,0.87448,0.85778,0.84056,0.83636,0.82039,0.80861,0.80457,0.7892,0.89805,0.89356,0.87649,0.86249,0.85818,0.84179,0.85336,0.84909,0.83288,0.90903,0.90449,0.88721,0.90261,0.8981,0.88095,0.88514,0.88071,0.8639,0.87965,0.87525,0.85853,0.83952,0.83533,0.81937,0.91602,0.91144,0.89403,0.88659,0.88216,0.86531,0.88728,0.88285,0.86599,0.9228,0.91819,0.90065,0.93814,0.93344,0.91562,0.90084,0.89634,0.87922,0.91027,0.90572,0.88843,0.90204,0.89753,0.88039,0.9052,0.90067,0.88347,0.94183,0.93712,0.91923,0.91987,0.91527,0.8978,0.893,0.88854,0.87157,0.89602,0.89154,0.87452,0.99274,0.98778,0.96892,0.9438,0.93908,0.92115,0.93612,0.93144,0.91366,0.94265,0.93794,0.92003,0.95087,0.94611,0.92804,0.93391,0.92924,0.9115,0.98714,0.9822,0.96345,0.93628,0.9316,0.91381,0.92287,0.91826,0.90073,0.92392,0.9193,0.90175,0.93775,0.93306,0.91525,0.93795,0.93327,0.91544,0.88795,0.88351,0.86664,0.88608,0.88165,0.86482,0.87195,0.86759,0.85102,0.88926,0.88481,0.86791,0.87356,0.8692,0.8526,0.86199,0.85768,0.8413,0.94792,0.94318,0.92517,0.88045,0.87605,0.85932,0.92465,0.92002,0.90246,0.83299,0.82882,0.813,0.82895,0.8248,0.80905,0.83234,0.82818,0.81236,0.89655,0.89206,0.87503,0.88462,0.88019,0.86338,0.88327,0.87885,0.86207,0.84276,0.83855,0.82253,0.86882,0.86447,0.84797,0.88923,0.88478,0.86789,0.79849,0.79449,0.77932,0.84548,0.84125,0.82519,0.84629,0.84206,0.82598,0.87139,0.86703,0.85047,0.83908,0.83489,0.81894,0.83581,0.83163,0.81575,0.87452,0.87015,0.85353,0.91043,0.90588,0.88858,0.83926,0.83507,0.81912,0.79553,0.79155,0.77644,0.80832,0.80428,0.78892,0.81526,0.81118,0.79569,0.88114,0.87673,0.85999,0.87063,0.86628,0.84973,0.88912,0.88467,0.86778,0.86324,0.85892,0.84252,0.85902,0.85472,0.8384,0.91602,0.91144,0.89403,0.86249,0.85818,0.84179,0.90192,0.89741,0.88028,0.87258,0.86822,0.85164,0.90346,0.89894,0.88178,0.93944,0.93474,0.91689,0.92376,0.91914,0.90159,0.96228,0.95747,0.93919,0.91684,0.91226,0.89484,0.96502,0.96019,0.94186,0.88712,0.88269,0.86583,0.95714,0.95235,0.93416,0.91308,0.90852,0.89117,0.91596,0.91138,0.89398,0.90307,0.89855,0.88139,0.90113,0.89662,0.8795,0.91114,0.90658,0.88927,0.91479,0.91022,0.89284,0.89258,0.88812,0.87116,0.91466,0.91009,0.89271,0.88907,0.88462,0.86773,0.87458,0.87021,0.85359,0.87984,0.87544,0.85873,0.87874,0.87434,0.85765,0.9021,0.89759,0.88045,0.97656,0.97167,0.95312,0.91319,0.90862,0.89127,0.85378,0.84951,0.83329,0.87023,0.86588,0.84935,0.92055,0.91595,0.89846,0.87019,0.86584,0.84931,0.92529,0.92067,0.90309,0.88948,0.88503,0.86813,0.8783,0.87391,0.85723,0.90607,0.90154,0.88432,0.91021,0.90566,0.88836,0.89294,0.88847,0.87151,0.90369,0.89918,0.88201,0.84731,0.84308,0.82698,0.85756,0.85327,0.83697,0.85763,0.85334,0.83705,0.82014,0.81604,0.80046,0.84735,0.84311,0.82701,0.79317,0.78921,0.77414,0.83038,0.82623,0.81045,0.87768,0.87329,0.85662,0.82021,0.81611,0.80053,0.84322,0.839,0.82298,0.89649,0.89201,0.87498,0.86956,0.86522,0.84869,0.86503,0.86071,0.84427,0.86789,0.86355,0.84706,0.80222,0.79821,0.78297,0.81407,0.80999,0.79453,0.89166,0.88721,0.87026,0.85448,0.85021,0.83397,0.85305,0.84878,0.83258,0.84882,0.84458,0.82845,0.89403,0.88956,0.87257,0.85452,0.85025,0.83402,0.91277,0.90821,0.89086,0.86249,0.85818,0.84179,0.927,0.92237,0.90476,0.87713,0.87275,0.85608,0.93353,0.92887,0.91113,0.95976,0.95496,0.93673,0.88005,0.87565,0.85893,0.91442,0.90985,0.89247,0.97347,0.9686,0.95011,0.94483,0.94011,0.92215,0.97275,0.96789,0.94941,0.88405,0.87963,0.86283,0.8866,0.88217,0.86532,0.95355,0.94879,0.93067,0.92307,0.91845,0.90091,0.92146,0.91685,0.89934,0.94861,0.94387,0.92584,0.93769,0.933,0.91519,0.92199,0.91738,0.89986,0.90517,0.90064,0.88344,0.98257,0.97766,0.95899,0.91263,0.90806,0.89072,0.95774,0.95295,0.93475,0.93598,0.9313,0.91352,0.87462,0.87025,0.85363,0.96142,0.95662,0.93835,0.92403,0.91941,0.90185,0.88642,0.88199,0.86515,0.88958,0.88513,0.86823,0.91551,0.91093,0.89354,0.9283,0.92366,0.90602,0.87549,0.87111,0.85448,0.89451,0.89003,0.87304,0.91585,0.91127,0.89387,0.86205,0.85774,0.84136,0.86158,0.85728,0.8409,0.92933,0.92468,0.90702,0.85061,0.84636,0.8302,0.88707,0.88263,0.86578,0.8754,0.87102,0.85439,0.91069,0.90613,0.88883,0.81338,0.80931,0.79385,0.85304,0.84877,0.83257,0.84861,0.84436,0.82824,0.81024,0.80619,0.79079,0.85608,0.8518,0.83554,0.87551,0.87113,0.8545,0.80434,0.80032,0.78504,0.83692,0.83273,0.81683,0.86502,0.86069,0.84426,0.89518,0.8907,0.87369,0.87552,0.87114,0.85451,0.87014,0.86579,0.84926,0.8392,0.835,0.81906,0.8716,0.86724,0.85068,0.90273,0.89822,0.88106,0.86262,0.8583,0.84191,0.81662,0.81254,0.79702,0.8869,0.88247,0.86561,0.9187,0.91411,0.89665,0.90708,0.90255,0.88531,0.88929,0.88485,0.86795,0.927,0.92237,0.90476,0.87085,0.86649,0.84995,0.8714,0.86704,0.85048,0.90912,0.90458,0.8873,0.88805,0.88361,0.86674,0.85586,0.85158,0.83532,0.93045,0.9258,0.90812,0.93874,0.93404,0.91621,0.91183,0.90727,0.88995,0.92736,0.92273,0.90511,0.95407,0.9493,0.93117,0.95334,0.94858,0.93046,0.962,0.95719,0.93891,0.92448,0.91985,0.90229,0.9371,0.93241,0.91461,0.96326,0.95844,0.94014,0.94892,0.94418,0.92615,0.92009,0.91549,0.89801,0.96903,0.96418,0.94577,0.91972,0.91512,0.89764,0.90392,0.8994,0.88222,0.92298,0.91837,0.90083,0.90342,0.8989,0.88174,0.86254,0.85823,0.84184,0.88942,0.88497,0.86807,0.92045,0.91584,0.89835,0.89938,0.89489,0.8778,0.90018,0.89568,0.87857,0.89354,0.88908,0.8721,0.92682,0.92219,0.90458,0.84763,0.84339,0.82729,0.82727,0.82313,0.80741,0.84052,0.83632,0.82035,0.81507,0.811,0.79551,0.84313,0.83892,0.8229,0.88624,0.88181,0.86497,0.87903,0.87464,0.85793,0.80802,0.80398,0.78863,0.82978,0.82563,0.80986,0.90177,0.89726,0.88013,0.85155,0.84729,0.83111,0.90327,0.89875,0.88159,0.82192,0.81781,0.80219,0.78696,0.78303,0.76807,0.86521,0.86088,0.84445,0.87672,0.87234,0.85568,0.85072,0.84646,0.8303,0.81634,0.81226,0.79675,0.83875,0.83456,0.81862,0.85622,0.85194,0.83567,0.80275,0.79873,0.78348,0.85446,0.85019,0.83395,0.9122,0.90764,0.89031,0.90324,0.89873,0.88157,0.89991,0.89541,0.87831,0.88922,0.88477,0.86788,0.88878,0.88433,0.86745,0.88175,0.87734,0.86058,0.86646,0.86212,0.84566,0.93205,0.92739,0.90968,0.87458,0.8702,0.85359,0.87085,0.86649,0.84995,0.88404,0.87962,0.86282,0.89741,0.89293,0.87587,0.87167,0.86731,0.85075,0.90406,0.89954,0.88236,0.89252,0.88805,0.8711,0.92831,0.92367,0.90603,0.95416,0.94939,0.93126,0.92833,0.92369,0.90605,0.95639,0.95161,0.93344,0.93988,0.93518,0.91732,0.95548,0.9507,0.93254,0.92948,0.92483,0.90717,0.94939,0.94464,0.92661,0.91881,0.91421,0.89676,0.94942,0.94468,0.92664,0.88797,0.88353,0.86666,0.91239,0.90783,0.89049,0.98117,0.97626,0.95762,0.91074,0.90619,0.88889,0.91591,0.91133,0.89393,0.91092,0.90637,0.88906,0.89871,0.89421,0.87714,0.88446,0.88004,0.86323,0.86897,0.86463,0.84812,0.87538,0.87101,0.85437,0.87497,0.8706,0.85397,0.87514,0.87076,0.85414,0.89862,0.89412,0.87705,0.92253,0.91792,0.90039,0.90308,0.89856,0.8814,0.85467,0.8504,0.83416,0.82576,0.82163,0.80594,0.84867,0.84443,0.8283,0.85155,0.84729,0.83111,0.87559,0.87121,0.85458,0.90304,0.89853,0.88137,0.81232,0.80825,0.79282,0.8174,0.81332,0.79779,0.89067,0.88622,0.8693,0.85713,0.85284,0.83656,0.85193,0.84767,0.83148,0.86522,0.8609,0.84446,0.85553,0.85125,0.835,0.84874,0.84449,0.82837,0.81067,0.80661,0.79121,0.89409,0.88962,0.87263,0.8422,0.83799,0.82199,0.86905,0.8647,0.84819,0.83683,0.83264,0.81674,0.78975,0.7858,0.77079,0.83682,0.83264,0.81674,0.87202,0.86766,0.85109,0.90332,0.8988,0.88164,0.86643,0.86209,0.84563,0.8734,0.86904,0.85244,0.89014,0.88569,0.86878,0.89953,0.89504,0.87794,0.84682,0.84258,0.82649,0.89641,0.89193,0.8749,0.86982,0.86547,0.84894,0.88404,0.87962,0.86282,0.88682,0.88238,0.86553,0.87445,0.87008,0.85346,0.85385,0.84959,0.83336,0.93023,0.92558,0.90791,0.93648,0.9318,0.91401,0.86712,0.86278,0.84631,0.88315,0.87874,0.86196,0.88364,0.87922,0.86243,0.92408,0.91946,0.9019,0.88436,0.87993,0.86313,0.9368,0.93211,0.91432,0.95308,0.94831,0.9302,0.97318,0.96831,0.94982,0.92038,0.91578,0.89829,0.99493,0.98996,0.97105,0.94014,0.93544,0.91758,0.87684,0.87246,0.8558,0.89896,0.89447,0.87739,0.88124,0.87683,0.86009,0.90062,0.89611,0.879,0.90876,0.90421,0.88695,0.94628,0.94155,0.92357,0.90418,0.89966,0.88248,0.88364,0.87922,0.86243,0.84916,0.84492,0.82878,0.86136,0.85706,0.84069,0.86756,0.86322,0.84673,0.90036,0.89586,0.87875,0.89546,0.89098,0.87397,0.88809,0.88365,0.86677,0.86257,0.85825,0.84186,0.83992,0.83572,0.81976,0.87547,0.8711,0.85446,0.88565,0.88122,0.86439,0.88652,0.88208,0.86524,0.83984,0.83564,0.81968,0.80132,0.79731,0.78209,0.80761,0.80357,0.78823,0.89835,0.89386,0.87679,0.87487,0.8705,0.85388,0.82264,0.81852,0.80289,0.85667,0.85239,0.83611,0.90008,0.89557,0.87847,0.86415,0.85982,0.84341,0.79795,0.79396,0.7788,0.82602,0.82189,0.80619,0.84522,0.841,0.82494,0.85548,0.8512,0.83495,0.8666,0.86227,0.8458,0.81506,0.81099,0.7955,0.80087,0.79687,0.78165,0.85129,0.84704,0.83086,0.90993,0.90538,0.88809,0.82573,0.8216,0.80591,0.82867,0.82453,0.80879,0.92355,0.91893,0.90138,0.8702,0.86585,0.84931,0.91083,0.90627,0.88897,0.84852,0.84427,0.82815,0.90723,0.9027,0.88546,0.88682,0.88238,0.86553,0.94146,0.93675,0.91886,0.90004,0.89554,0.87844,0.86309,0.85877,0.84237,0.92257,0.91796,0.90043,0.9381,0.93341,0.91559,0.87056,0.8662,0.84966,0.91228,0.90772,0.89038,0.91857,0.91397,0.89652,0.88966,0.88521,0.86831,0.89786,0.89337,0.87631,0.91692,0.91234,0.89492,0.98553,0.9806,0.96188,0.90535,0.90082,0.88362,0.90603,0.9015,0.88428,0.9288,0.92415,0.90651,0.93783,0.93315,0.91533,0.893,0.88853,0.87156,0.90114,0.89664,0.87952,0.89132,0.88686,0.86993,0.95211,0.94735,0.92926,0.95395,0.94918,0.93106,0.95436,0.94959,0.93146,0.92805,0.92341,0.90577,0.91018,0.90563,0.88834,0.90872,0.90418,0.88691,0.87941,0.87502,0.85831,0.89075,0.8863,0.86937,0.87303,0.86866,0.85208,0.86377,0.85946,0.84304,0.87921,0.87481,0.85811,0.88033,0.87593,0.8592,0.86446,0.86014,0.84371,0.84507,0.84084,0.82479,0.8567,0.85242,0.83614,0.90356,0.89904,0.88188,0.84665,0.84241,0.82633,0.81058,0.80652,0.79112,0.80869,0.80464,0.78928,0.82384,0.81972,0.80407,0.82623,0.8221,0.80641,0.84355,0.83933,0.8233,0.86392,0.8596,0.84319,0.89288,0.88841,0.87145,0.8929,0.88844,0.87147,0.81716,0.81308,0.79755,0.80577,0.80174,0.78643,0.84561,0.84139,0.82532,0.87604,0.87166,0.85502,0.84235,0.83814,0.82214,0.84032,0.83612,0.82015,0.84868,0.84444,0.82831,0.81838,0.81429,0.79874,0.88877,0.88432,0.86744,0.84589,0.84166,0.82559,0.8685,0.86416,0.84765,0.84707,0.84284,0.82674,0.85066,0.84641,0.83024,0.92121,0.9166,0.8991,0.91426,0.90969,0.89232,0.85115,0.84689,0.83072,0.94146,0.93675,0.91886,0.86999,0.86564,0.84911,0.88949,0.88505,0.86815,0.88524,0.88082,0.864,0.85477,0.8505,0.83426,0.89059,0.88613,0.86921,0.85417,0.8499,0.83367,0.91,0.90545,0.88816,0.98337,0.97845,0.95977,0.90244,0.89793,0.88079,0.88707,0.88264,0.86578,0.86804,0.8637,0.8472,0.89989,0.89539,0.87829,0.91091,0.90636,0.88905,0.96006,0.95526,0.93702,0.95305,0.94829,0.93018,0.9698,0.96495,0.94652,0.90271,0.8982,0.88105,0.90322,0.89871,0.88155,0.93473,0.93006,0.9123,0.91515,0.91057,0.89318,0.97361,0.96874,0.95024,0.89551,0.89104,0.87402,0.91393,0.90936,0.89199,0.96196,0.95715,0.93887,0.96007,0.95527,0.93703,0.94255,0.93784,0.91993,0.90151,0.897,0.87987,0.95358,0.94881,0.93069,0.89298,0.88852,0.87155,0.86824,0.86389,0.8474,0.86964,0.86529,0.84876,0.86186,0.85755,0.84117,0.88373,0.87932,0.86252,0.83796,0.83377,0.81785,0.86537,0.86105,0.8446,0.88629,0.88186,0.86502,0.84565,0.84143,0.82536,0.89382,0.88935,0.87237,0.87696,0.87258,0.85592,0.85739,0.8531,0.83681,0.81032,0.80627,0.79087,0.88533,0.8809,0.86408,0.85401,0.84974,0.83352,0.85411,0.84984,0.83362,0.79909,0.7951,0.77992,0.85445,0.85018,0.83395,0.87116,0.86681,0.85025,0.85134,0.84709,0.83091,0.87905,0.87465,0.85795,0.81248,0.80842,0.79298,0.89377,0.8893,0.87232,0.89685,0.89237,0.87533,0.85701,0.85272,0.83644,0.83402,0.82985,0.814,0.84929,0.84505,0.82891,0.82836,0.82422,0.80848,0.80573,0.8017,0.78639,0.83135,0.8272,0.8114,0.92026,0.91566,0.89817,0.89242,0.88796,0.87101,0.86999,0.86564,0.84911,0.86573,0.8614,0.84495,0.92496,0.92033,0.90276,0.88044,0.87604,0.85931,0.85141,0.84715,0.83097,0.90559,0.90107,0.88386,0.88785,0.88341,0.86654,0.87869,0.87429,0.8576,0.96101,0.9562,0.93794,0.94472,0.93999,0.92204,0.88417,0.87975,0.86295,0.86881,0.86447,0.84796,0.86674,0.8624,0.84594,0.92226,0.91765,0.90013,0.97233,0.96747,0.949,0.96076,0.95595,0.9377,0.90193,0.89742,0.88029,0.91223,0.90767,0.89033,0.88109,0.87669,0.85995,0.93991,0.93521,0.91735,0.93706,0.93237,0.91457,0.92885,0.92421,0.90656,0.87794,0.87355,0.85687,0.88433,0.87991,0.8631,0.90086,0.89636,0.87924,0.91135,0.90679,0.88948,0.93286,0.92819,0.91047,0.86976,0.86541,0.84889,0.92025,0.91565,0.89817,0.91907,0.91447,0.89701,0.90023,0.89573,0.87862,0.8725,0.86813,0.85156,0.90455,0.90003,0.88284,0.90128,0.89677,0.87965,0.86034,0.85603,0.83969,0.91426,0.90969,0.89232,0.84719,0.84295,0.82686,0.83567,0.83149,0.81561,0.90879,0.90425,0.88698,0.87293,0.86856,0.85198,0.86689,0.86256,0.84609,0.83103,0.82688,0.81109,0.82234,0.81823,0.8026,0.84733,0.84309,0.82699,0.84142,0.83722,0.82123,0.83663,0.83245,0.81655,0.81929,0.8152,0.79963,0.8823,0.87789,0.86112,0.87623,0.87184,0.8552,0.8232,0.81908,0.80344,0.82794,0.8238,0.80807,0.86154,0.85724,0.84087,0.8696,0.86525,0.84873,0.88897,0.88452,0.86763,0.81484,0.81076,0.79528,0.86821,0.86387,0.84737,0.87746,0.87307,0.8564,0.85439,0.85012,0.83389,0.81338,0.80932,0.79386,0.84245,0.83824,0.82223,0.90882,0.90428,0.88701,0.86573,0.8614,0.84495,0.866,0.86167,0.84522,0.93077,0.92612,0.90844,0.92558,0.92095,0.90337,0.86497,0.86064,0.84421,0.90392,0.8994,0.88223,0.90455,0.90003,0.88284,0.91199,0.90743,0.8901,0.96569,0.96086,0.94251,0.97424,0.96937,0.95086,0.93131,0.92666,0.90896,0.88488,0.88046,0.86365,0.88643,0.882,0.86515,0.88453,0.88011,0.8633,0.94537,0.94065,0.92268,0.94743,0.94269,0.92469,0.89188,0.88743,0.87048,0.9527,0.94794,0.92984,0.91615,0.91157,0.89417,0.91615,0.91157,0.89417,0.93821,0.93352,0.91569,0.98185,0.97695,0.95829,0.90708,0.90254,0.88531,0.91992,0.91533,0.89785,0.9225,0.91789,0.90036,0.90874,0.9042,0.88693,0.95951,0.95472,0.93649,0.9185,0.91391,0.89645,0.85926,0.85496,0.83864,0.86987,0.86552,0.849,0.89978,0.89528,0.87818,0.86028,0.85598,0.83963,0.93479,0.93012,0.91236,0.90473,0.9002,0.88301,0.90905,0.90451,0.88724,0.8855,0.88108,0.86425,0.86349,0.85917,0.84276,0.85379,0.84952,0.8333,0.85237,0.8481,0.83191,0.84781,0.84357,0.82746,0.813,0.80893,0.79349,0.81455,0.81047,0.795,0.84146,0.83725,0.82127,0.82486,0.82074,0.80507,0.89338,0.88891,0.87194,0.84797,0.84373,0.82762,0.8622,0.85789,0.84151,0.81575,0.81167,0.79617,0.84209,0.83788,0.82188,0.81496,0.81089,0.7954,0.85741,0.85312,0.83683,0.80356,0.79954,0.78428,0.82163,0.81752,0.80191,0.83558,0.8314,0.81553,0.85823,0.85394,0.83763,0.82373,0.81961,0.80396,0.85819,0.8539,0.8376,0.87139,0.86703,0.85047,0.82548,0.82136,0.80567,0.88885,0.88441,0.86752,0.86967,0.86532,0.84879,0.866,0.86167,0.84522,0.90776,0.90322,0.88597,0.87565,0.87127,0.85463,0.89696,0.89247,0.87543,0.85465,0.85038,0.83414,0.91605,0.91147,0.89406,0.88662,0.88219,0.86534,0.90551,0.90099,0.88378,0.96193,0.95712,0.93885,0.92945,0.9248,0.90714,0.92307,0.91845,0.90091,0.87375,0.86939,0.85278,0.88845,0.88401,0.86713,0.93591,0.93123,0.91345,0.9093,0.90476,0.88748,0.89817,0.89368,0.87661,0.88092,0.87652,0.85978,0.92817,0.92353,0.90589,0.92652,0.92189,0.90429,0.93166,0.927,0.9093,0.89038,0.88593,0.86902,0.95651,0.95173,0.93356,0.95727,0.95249,0.9343,0.90567,0.90114,0.88393,0.94845,0.94371,0.92569,0.90355,0.89903,0.88187,0.91503,0.91045,0.89307,0.9648,0.95998,0.94165,0.91141,0.90685,0.88953,0.85226,0.848,0.8318,0.85108,0.84682,0.83065,0.84271,0.83849,0.82248,0.88053,0.87613,0.8594,0.90206,0.89755,0.88041,0.87941,0.87501,0.8583,0.88549,0.88107,0.86424,0.87087,0.86651,0.84996,0.87014,0.86579,0.84926,0.83956,0.83537,0.81941,0.80967,0.80562,0.79023,0.82354,0.81943,0.80378,0.85282,0.84856,0.83235,0.87759,0.87321,0.85653,0.84819,0.84395,0.82784,0.859,0.85471,0.83838,0.82634,0.82221,0.80651,0.84278,0.83857,0.82255,0.79672,0.79274,0.7776,0.79691,0.79292,0.77778,0.80085,0.79684,0.78163,0.82452,0.8204,0.80473,0.80387,0.79985,0.78458,0.8236,0.81949,0.80384,0.80848,0.80444,0.78908,0.89406,0.88959,0.8726,0.87449,0.87012,0.8535,0.84451,0.84029,0.82424,0.85159,0.84734,0.83116,0.88914,0.88469,0.8678,0.90415,0.89963,0.88245,0.89306,0.8886,0.87163,0.90776,0.90322,0.88597,0.93141,0.92675,0.90906,0.92447,0.91985,0.90229,0.84545,0.84123,0.82516,0.85303,0.84877,0.83256,0.92778,0.92314,0.90551,0.92183,0.91722,0.89971,0.93829,0.9336,0.91577,0.90093,0.89643,0.87931,0.93435,0.92968,0.91192,0.89381,0.88934,0.87236,0.91425,0.90967,0.8923,0.92994,0.92529,0.90762,0.96325,0.95843,0.94013,0.96134,0.95654,0.93827,0.93589,0.93121,0.91343,0.92381,0.91919,0.90163,0.87921,0.87482,0.85811,0.90261,0.89809,0.88094,0.92526,0.92063,0.90305,0.92887,0.92422,0.90657,0.93795,0.93326,0.91544,0.9695,0.96466,0.94624,0.88635,0.88192,0.86508,0.94282,0.93811,0.92019,0.96057,0.95577,0.93751,0.89564,0.89116,0.87414,0.92427,0.91965,0.90209,0.91211,0.90755,0.89022,0.86229,0.85798,0.8416,0.86027,0.85597,0.83962,0.89738,0.89289,0.87584,0.84766,0.84342,0.82731,0.91662,0.91203,0.89462,0.85341,0.84914,0.83293,0.88329,0.87887,0.86209,0.90544,0.90091,0.88371,0.89873,0.89423,0.87716,0.89503,0.89055,0.87355,0.8712,0.86684,0.85029,0.83183,0.82767,0.81187,0.90498,0.90046,0.88326,0.8444,0.84018,0.82414,0.84932,0.84507,0.82893,0.84558,0.84135,0.82529,0.79946,0.79546,0.78027,0.86305,0.85873,0.84234,0.83161,0.82746,0.81165,0.83113,0.82697,0.81118,0.86516,0.86084,0.8444,0.84087,0.83666,0.82068,0.85404,0.84977,0.83355,0.82416,0.82004,0.80438,0.85666,0.85237,0.8361,0.85755,0.85326,0.83697,0.87343,0.86906,0.85246,0.87641,0.87202,0.85537,0.87075,0.8664,0.84985,0.92749,0.92285,0.90523,0.86303,0.85871,0.84232,0.90476,0.90023,0.88304,0.93141,0.92675,0.90906,0.88531,0.88089,0.86407,0.90178,0.89727,0.88014,0.88309,0.87867,0.86189,0.85604,0.85176,0.8355,0.95483,0.95005,0.93191,0.94099,0.93628,0.9184,0.9629,0.95809,0.93979,0.90618,0.90165,0.88444,0.96395,0.95913,0.94082,0.90466,0.90014,0.88295,0.95225,0.94749,0.92939,0.97153,0.96667,0.94821,0.94582,0.94109,0.92312,0.97983,0.97493,0.95631,0.93772,0.93303,0.91521,0.94339,0.93867,0.92074,0.87362,0.86925,0.85265,0.94116,0.93645,0.91857,0.96808,0.96324,0.94485,0.94636,0.94162,0.92364,0.96854,0.9637,0.94529,0.92989,0.92524,0.90758,0.95435,0.94958,0.93144,0.90798,0.90344,0.88618,0.94071,0.93601,0.91813,0.88919,0.88475,0.86785,0.87729,0.8729,0.85623,0.8866,0.88216,0.86532,0.93044,0.92579,0.90811,0.8739,0.86953,0.85293,0.95221,0.94745,0.92936,0.8746,0.87022,0.85361,0.86378,0.85946,0.84305,0.86416,0.85984,0.84342,0.91518,0.91061,0.89322,0.86316,0.85884,0.84244,0.89404,0.88957,0.87258,0.88938,0.88494,0.86804,0.89106,0.8866,0.86967,0.81075,0.8067,0.79129,0.88367,0.87925,0.86246,0.83397,0.8298,0.81395,0.80479,0.80077,0.78548,0.88502,0.8806,0.86378,0.84327,0.83905,0.82303,0.83097,0.82682,0.81103,0.82301,0.8189,0.80326,0.83405,0.82988,0.81404,0.89798,0.89349,0.87642,0.85663,0.85235,0.83607,0.90025,0.89575,0.87864,0.80912,0.80507,0.7897,0.87077,0.86642,0.84988,0.85267,0.84841,0.83221,0.86682,0.86249,0.84602,0.88275,0.87833,0.86156,0.89836,0.89386,0.8768,0.88406,0.87964,0.86284,0.85919,0.85489,0.83857,0.92274,0.91813,0.9006,0.88531,0.88089,0.86407,0.91872,0.91413,0.89667,0.89702,0.89253,0.87549,0.88718,0.88275,0.86589,0.87347,0.8691,0.8525,0.96516,0.96034,0.942,0.93564,0.93096,0.91318,0.96772,0.96288,0.94449,0.92088,0.91627,0.89877,0.92321,0.9186,0.90106,0.8849,0.88047,0.86366,0.92687,0.92224,0.90463,0.94575,0.94102,0.92305,0.93364,0.92897,0.91123,0.98751,0.98257,0.96381,0.92589,0.92126,0.90367,0.93739,0.9327,0.91489,0.87895,0.87455,0.85785,0.93708,0.9324,0.91459,0.97527,0.97039,0.95186,0.93074,0.92609,0.9084,0.93719,0.93251,0.9147,0.93573,0.93105,0.91327,0.97529,0.97042,0.95189,0.89778,0.89329,0.87623,0.94791,0.94317,0.92516,0.8782,0.87381,0.85712,0.89602,0.89154,0.87451,0.88286,0.87845,0.86167,0.95641,0.95163,0.93346,0.87588,0.8715,0.85486,0.92522,0.92059,0.90301,0.88458,0.88015,0.86335,0.87712,0.87273,0.85607,0.86245,0.85813,0.84175,0.92521,0.92059,0.90301,0.8965,0.89202,0.87499,0.86243,0.85812,0.84173,0.83436,0.83018,0.81433,0.84771,0.84347,0.82736,0.83988,0.83568,0.81973,0.90646,0.90193,0.88471,0.85655,0.85227,0.83599,0.81698,0.81289,0.79737,0.85563,0.85136,0.8351,0.8896,0.88515,0.86825,0.86474,0.86042,0.84399,0.79218,0.78821,0.77316,0.8241,0.81998,0.80432,0.85564,0.85136,0.8351,0.83908,0.83488,0.81894,0.86663,0.86229,0.84583,0.80953,0.80548,0.7901,0.8528,0.84853,0.83233,0.85312,0.84885,0.83264,0.85471,0.85044,0.8342,0.85248,0.84821,0.83202,0.85846,0.85417,0.83786,0.86491,0.86059,0.84415,0.8328,0.82863,0.81281,0.87304,0.86868,0.85209,0.91872,0.91413,0.89667,0.9417,0.93699,0.9191,0.91394,0.90937,0.892,0.92474,0.92011,0.90254,0.87228,0.86792,0.85135,0.96114,0.95634,0.93808,0.91933,0.91473,0.89726,0.94636,0.94163,0.92364,0.92992,0.92527,0.9076,0.92809,0.92344,0.90581,0.87849,0.87409,0.8574,0.93093,0.92628,0.90859,0.93578,0.9311,0.91332,0.90182,0.89731,0.88018,0.94929,0.94454,0.9265,0.92412,0.9195,0.90194,0.92204,0.91743,0.89991,0.9018,0.89729,0.88016,0.91247,0.90791,0.89057,0.93899,0.93429,0.91645,0.94064,0.93594,0.91807,0.97335,0.96849,0.94999,0.91435,0.90978,0.8924,0.94352,0.9388,0.92088,0.90369,0.89917,0.882,0.95806,0.95327,0.93506,0.88225,0.87784,0.86107,0.93616,0.93148,0.91369,0.90067,0.89617,0.87905,0.92823,0.92359,0.90596,0.86237,0.85806,0.84168,0.87965,0.87525,0.85854,0.88315,0.87873,0.86195,0.91709,0.9125,0.89508,0.84388,0.83966,0.82363,0.88848,0.88403,0.86715,0.92181,0.9172,0.89969,0.88033,0.87593,0.8592,0.81403,0.80996,0.79449,0.83521,0.83103,0.81516,0.85696,0.85268,0.83639,0.87862,0.87423,0.85753,0.83765,0.83347,0.81755,0.83492,0.83075,0.81488,0.84844,0.8442,0.82808,0.88479,0.88037,0.86356,0.86014,0.85583,0.83949,0.81071,0.80666,0.79125,0.87016,0.86581,0.84928,0.86732,0.86298,0.8465,0.87569,0.87131,0.85467,0.88567,0.88124,0.86441,0.83463,0.83046,0.8146,0.83814,0.83395,0.81802,0.83859,0.8344,0.81846,0.85841,0.85412,0.83781,0.84055,0.83635,0.82038,0.83024,0.82609,0.81032,0.89304,0.88857,0.87161,0.84598,0.84175,0.82567,0.84744,0.8432,0.8271,0.9417,0.93699,0.9191,0.93502,0.93034,0.91258,0.90386,0.89934,0.88216,0.95615,0.95137,0.9332,0.88242,0.87801,0.86124,0.93143,0.92677,0.90907,0.9027,0.89819,0.88104,0.90943,0.90488,0.8876,0.91967,0.91507,0.8976,0.91407,0.9095,0.89213,0.90949,0.90494,0.88766,0.9556,0.95082,0.93267,0.95556,0.95078,0.93262,0.88816,0.88372,0.86685,0.92267,0.91806,0.90053,0.93884,0.93415,0.91631,0.93444,0.92977,0.91202,0.91747,0.91289,0.89545,0.92501,0.92039,0.90281,0.95693,0.95215,0.93397,0.95045,0.9457,0.92764,0.97941,0.97451,0.9559,0.90975,0.9052,0.88791,0.90445,0.89992,0.88274,0.89683,0.89234,0.8753,0.9505,0.94574,0.92768,0.89805,0.89356,0.8765,0.95712,0.95234,0.93415,0.91078,0.90623,0.88892,0.88955,0.8851,0.8682,0.84267,0.83846,0.82245,0.86441,0.86009,0.84367,0.87735,0.87297,0.8563,0.93209,0.92743,0.90972,0.84107,0.83686,0.82088,0.84883,0.84459,0.82846,0.91677,0.91219,0.89477,0.87164,0.86728,0.85072,0.81335,0.80928,0.79383,0.81518,0.8111,0.79561,0.85341,0.84915,0.83293,0.84115,0.83694,0.82096,0.81057,0.80652,0.79111,0.85505,0.85078,0.83453,0.86668,0.86235,0.84588,0.85823,0.85394,0.83763,0.87745,0.87306,0.85639,0.82858,0.82444,0.80869,0.90119,0.89669,0.87956,0.8844,0.87998,0.86317,0.88717,0.88273,0.86587,0.9123,0.90774,0.8904,0.8514,0.84714,0.83097,0.81726,0.81317,0.79765,0.81656,0.81248,0.79697,0.89489,0.89041,0.87341,0.86266,0.85835,0.84196,0.84887,0.84462,0.8285,0.89919,0.89469,0.87761,0.84612,0.84189,0.82581,0.85207,0.84781,0.83162,0.93502,0.93034,0.91258,0.90634,0.90181,0.88459,0.8891,0.88466,0.86777,0.9617,0.95689,0.93862,0.87903,0.87464,0.85794,0.9182,0.91361,0.89617,0.90731,0.90277,0.88553,0.8754,0.87102,0.85439,0.89736,0.89287,0.87582,0.93997,0.93527,0.91741,0.94985,0.9451,0.92705,0.96234,0.95753,0.93925,0.9521,0.94734,0.92925,0.90612,0.90159,0.88437,0.96135,0.95654,0.93828,0.93862,0.93393,0.9161,0.97196,0.9671,0.94863,0.92015,0.91555,0.89806,0.93579,0.93111,0.91333,0.96068,0.95588,0.93763,0.94205,0.93734,0.91944,0.95719,0.95241,0.93422,0.91152,0.90697,0.88965,0.8716,0.86724,0.85068,0.89392,0.88945,0.87247,0.97753,0.97265,0.95407,0.9063,0.90177,0.88455,0.95324,0.94848,0.93037,0.93208,0.92742,0.90971,0.85772,0.85343,0.83714,0.85433,0.85006,0.83383,0.85195,0.84769,0.8315,0.8771,0.87271,0.85604,0.91905,0.91445,0.89699,0.85066,0.84641,0.83024,0.86646,0.86213,0.84566,0.88846,0.88402,0.86714,0.8454,0.84118,0.82511,0.80581,0.80178,0.78647,0.80831,0.80427,0.78891,0.83425,0.83008,0.81423,0.82517,0.82105,0.80537,0.81141,0.80735,0.79194,0.86068,0.85637,0.84002,0.86254,0.85823,0.84184,0.84814,0.8439,0.82778,0.89089,0.88644,0.86951,0.84568,0.84145,0.82539,0.90659,0.90206,0.88483,0.87973,0.87533,0.85861,0.87171,0.86736,0.85079,0.91133,0.90677,0.88945,0.87528,0.87091,0.85428,0.80167,0.79766,0.78243,0.83658,0.8324,0.81651,0.91734,0.91276,0.89533,0.86937,0.86502,0.8485,0.8845,0.88008,0.86327,0.89325,0.88879,0.87182,0.84326,0.83904,0.82302,0.86215,0.85784,0.84146,0.90634,0.90181,0.88459,0.88793,0.88349,0.86662,0.88535,0.88093,0.86411,0.93731,0.93262,0.91482,0.86286,0.85855,0.84215,0.94798,0.94324,0.92523,0.91884,0.91425,0.89679,0.89202,0.88756,0.87062,0.90187,0.89736,0.88022,0.95314,0.94838,0.93027,0.98188,0.97697,0.95831,0.94682,0.94208,0.92409,0.92707,0.92243,0.90482,0.93913,0.93444,0.91659,0.98898,0.98404,0.96525,0.94676,0.94202,0.92403,0.9914,0.98644,0.9676,0.90778,0.90324,0.88599,0.93107,0.92642,0.90873,0.94055,0.93585,0.91798,0.91895,0.91436,0.8969,0.93407,0.9294,0.91165,0.89787,0.89338,0.87632,0.86493,0.86061,0.84417,0.90184,0.89733,0.88019,0.97647,0.97159,0.95303,0.92343,0.91881,0.90127,0.92579,0.92116,0.90357,0.95331,0.94855,0.93043,0.86091,0.85661,0.84025,0.88264,0.87823,0.86146,0.87126,0.8669,0.85035,0.86402,0.8597,0.84328,0.88484,0.88041,0.8636,0.88188,0.87747,0.86071,0.8936,0.88913,0.87215,0.85043,0.84618,0.83002,0.83094,0.82679,0.811,0.8029,0.79888,0.78363,0.79787,0.79388,0.77872,0.80926,0.80521,0.78984,0.84441,0.84018,0.82414,0.81835,0.81426,0.79871,0.84817,0.84393,0.82782,0.83804,0.83385,0.81793,0.84994,0.84569,0.82955,0.87635,0.87196,0.85531,0.87515,0.87077,0.85414,0.88606,0.88162,0.86479,0.87524,0.87086,0.85423,0.83822,0.83403,0.8181,0.88242,0.87801,0.86124,0.87801,0.87362,0.85694,0.816,0.81192,0.79641,0.8575,0.85322,0.83692,0.91305,0.90849,0.89114,0.85593,0.85165,0.83539,0.91332,0.90875,0.8914,0.90676,0.90223,0.885,0.84679,0.84255,0.82647,0.86559,0.86126,0.84482,0.88793,0.88349,0.86662,0.88839,0.88394,0.86707,0.88813,0.88369,0.86682,0.89598,0.8915,0.87448,0.86648,0.86215,0.84569,0.95589,0.95111,0.93295,0.90899,0.90444,0.88717,0.90007,0.89557,0.87847,0.89995,0.89545,0.87835,0.94365,0.93893,0.921,0.98786,0.98292,0.96415,0.91641,0.91182,0.89441,0.94792,0.94318,0.92517,0.96111,0.9563,0.93804,0.98997,0.98502,0.96621,0.95294,0.94817,0.93007,0.98016,0.97526,0.95664,0.89143,0.88697,0.87004,0.91248,0.90792,0.89058,0.91621,0.91163,0.89422,0.89124,0.88679,0.86985,0.91016,0.90561,0.88831,0.91796,0.91337,0.89593,0.87795,0.87356,0.85688,0.898,0.89351,0.87644,0.97264,0.96778,0.9493,0.92652,0.92189,0.90429,0.91747,0.91289,0.89545,0.94569,0.94097,0.923,0.88538,0.88095,0.86413,0.90464,0.90012,0.88293,0.8802,0.8758,0.85908,0.86359,0.85928,0.84287,0.86019,0.85589,0.83955,0.90435,0.89982,0.88264,0.89991,0.89542,0.87832,0.88004,0.87564,0.85892,0.82865,0.8245,0.80876,0.81739,0.8133,0.79777,0.82429,0.82017,0.80451,0.80129,0.79728,0.78206,0.85001,0.84576,0.82961,0.81239,0.80832,0.79289,0.82325,0.81913,0.80349,0.83382,0.82965,0.81381,0.83536,0.83119,0.81532,0.84171,0.8375,0.82151,0.8865,0.88207,0.86522,0.8769,0.87251,0.85585,0.86621,0.86188,0.84542,0.80987,0.80582,0.79044,0.8527,0.84844,0.83223,0.85707,0.85278,0.8365,0.83299,0.82883,0.813,0.86925,0.86491,0.84839,0.88331,0.8789,0.86211,0.84294,0.83872,0.82271,0.92007,0.91547,0.89799,0.89382,0.88935,0.87237,0.85355,0.84928,0.83306,0.87,0.86565,0.84912,0.88839,0.88394,0.86707,0.87372,0.86935,0.85275,0.92504,0.92041,0.90284,0.86787,0.86353,0.84704,0.88233,0.87792,0.86116,0.95511,0.95034,0.93219,0.89119,0.88673,0.8698,0.89502,0.89054,0.87354,0.88577,0.88134,0.86451,0.93029,0.92564,0.90796,0.9653,0.96048,0.94214,0.8946,0.89013,0.87313,0.96613,0.9613,0.94294,0.95913,0.95433,0.93611,0.96486,0.96003,0.9417,0.94238,0.93767,0.91976,0.94696,0.94223,0.92424,0.89614,0.89166,0.87463,0.93743,0.93274,0.91493,0.94325,0.93853,0.92061,0.89961,0.89511,0.87802,0.90154,0.89703,0.8799,0.94665,0.94191,0.92393,0.90347,0.89896,0.88179,0.92285,0.91824,0.9007,0.97116,0.96631,0.94785,0.90863,0.90409,0.88682,0.92102,0.91641,0.89891,0.91553,0.91095,0.89355,0.91311,0.90854,0.89119,0.91469,0.91011,0.89273,0.87388,0.86951,0.85291,0.8732,0.86884,0.85224,0.87241,0.86805,0.85148,0.90596,0.90143,0.88422,0.88249,0.87808,0.86131,0.91048,0.90593,0.88863,0.82646,0.82233,0.80663,0.84618,0.84195,0.82588,0.86086,0.85655,0.8402,0.81467,0.8106,0.79512,0.83909,0.8349,0.81896,0.82082,0.81672,0.80113,0.84084,0.83664,0.82066,0.85129,0.84703,0.83086,0.8309,0.82674,0.81096,0.82638,0.82225,0.80655,0.87378,0.86942,0.85281,0.84731,0.84308,0.82698,0.83945,0.83525,0.8193,0.82467,0.82054,0.80487,0.83843,0.83424,0.81831,0.86515,0.86082,0.84439,0.84942,0.84517,0.82903,0.90473,0.90021,0.88302,0.87515,0.87077,0.85414,0.8808,0.8764,0.85966,0.90161,0.8971,0.87997,0.86436,0.86004,0.84362,0.8776,0.87321,0.85654,0.86454,0.86022,0.84379,0.87372,0.86935,0.85275,0.87553,0.87115,0.85451,0.94359,0.93887,0.92094,0.87641,0.87202,0.85537,0.88864,0.88419,0.86731,0.94888,0.94414,0.92611,0.90542,0.90089,0.88369,0.88483,0.88041,0.8636,0.87767,0.87328,0.8566,0.91199,0.90743,0.8901,0.93821,0.93352,0.91569,0.91398,0.90941,0.89205,0.96597,0.96114,0.94278,0.94398,0.93926,0.92132,0.93782,0.93314,0.91532,0.92597,0.92134,0.90375,0.91878,0.91419,0.89673,0.90462,0.9001,0.88291,0.9628,0.95799,0.93969,0.95386,0.94909,0.93097,0.89935,0.89486,0.87777,0.91734,0.91275,0.89532,0.95782,0.95303,0.93483,0.92841,0.92377,0.90613,0.93628,0.9316,0.91381,0.95396,0.94919,0.93106,0.89693,0.89244,0.8754,0.93227,0.9276,0.90989,0.88854,0.8841,0.86722,0.93035,0.9257,0.90803,0.91648,0.91189,0.89448,0.87454,0.87017,0.85355,0.87083,0.86647,0.84993,0.87181,0.86745,0.85088,0.89401,0.88954,0.87256,0.88172,0.87731,0.86056,0.9192,0.9146,0.89714,0.83611,0.83193,0.81605,0.8658,0.86147,0.84502,0.88638,0.88195,0.86511,0.81979,0.81569,0.80011,0.82431,0.82019,0.80452,0.83802,0.83383,0.81791,0.85474,0.85046,0.83422,0.85336,0.84909,0.83288,0.85805,0.85376,0.83746,0.82506,0.82094,0.80526,0.85348,0.84922,0.833,0.82353,0.81941,0.80377,0.81679,0.81271,0.79719,0.8382,0.83401,0.81808,0.84319,0.83897,0.82295,0.88382,0.8794,0.8626,0.85215,0.84789,0.8317,0.91934,0.91474,0.89727,0.871,0.86664,0.85009,0.90526,0.90074,0.88354,0.87806,0.87366,0.85698,0.85605,0.85177,0.8355,0.90648,0.90194,0.88472,0.87205,0.86769,0.85113,0.87553,0.87115,0.85451,0.89154,0.88708,0.87014,0.94904,0.94429,0.92626,0.90508,0.90055,0.88336,0.90265,0.89813,0.88098,0.93068,0.92602,0.90834,0.93029,0.92564,0.90797,0.87185,0.86749,0.85093,0.87064,0.86628,0.84974,0.89131,0.88685,0.86992,0.90918,0.90463,0.88736,0.93834,0.93365,0.91582,0.95403,0.94926,0.93113,0.94324,0.93852,0.9206,0.9101,0.90554,0.88825,0.90634,0.90181,0.88459,0.91646,0.91188,0.89447,0.90846,0.90392,0.88666,0.98117,0.97626,0.95762,0.95301,0.94825,0.93014,0.91526,0.91069,0.8933,0.92872,0.92407,0.90643,0.95689,0.9521,0.93392,0.95042,0.94567,0.92761,0.93982,0.93512,0.91727,0.92793,0.92329,0.90566,0.92603,0.9214,0.9038,0.93241,0.92775,0.91003,0.86367,0.85935,0.84294,0.93734,0.93265,0.91484,0.90668,0.90214,0.88492,0.87644,0.87206,0.85541,0.86342,0.85911,0.8427,0.86309,0.85878,0.84238,0.87418,0.86981,0.8532,0.90652,0.90198,0.88476,0.91326,0.90869,0.89134,0.85517,0.85089,0.83465,0.87886,0.87447,0.85777,0.90409,0.89957,0.8824,0.81911,0.81502,0.79945,0.80768,0.80364,0.78829,0.85102,0.84677,0.8306,0.86057,0.85626,0.83991,0.84547,0.84124,0.82518,0.88202,0.87761,0.86085,0.81991,0.81581,0.80023,0.82915,0.82501,0.80925,0.80765,0.80361,0.78826,0.7994,0.7954,0.78021,0.846,0.84177,0.8257,0.83959,0.8354,0.81944,0.89246,0.888,0.87104,0.84592,0.84169,0.82562,0.91948,0.91488,0.89741,0.85728,0.85299,0.83671,0.92004,0.91544,0.89796,0.85198,0.84772,0.83153,0.8523,0.84804,0.83184,0.93054,0.92589,0.90821,0.87482,0.87045,0.85383,0.89154,0.88708,0.87014,0.90083,0.89633,0.87921,0.93929,0.9346,0.91675,0.93368,0.92901,0.91127,0.91172,0.90716,0.88984,0.91288,0.90831,0.89097,0.94879,0.94404,0.92601,0.8678,0.86346,0.84697,0.88341,0.879,0.86221,0.89618,0.89169,0.87467,0.9248,0.92017,0.9026,0.95821,0.95342,0.93522,0.95547,0.95069,0.93254,0.94777,0.94303,0.92502,0.90268,0.89817,0.88102,0.89435,0.88988,0.87289,0.93374,0.92907,0.91133,0.90635,0.90182,0.8846,0.987,0.98207,0.96331,0.94449,0.93976,0.92182,0.9412,0.9365,0.91861,0.93231,0.92765,0.90994,0.94387,0.93915,0.92121,0.96341,0.9586,0.94029,0.93213,0.92747,0.90975,0.93026,0.92561,0.90793,0.95319,0.94842,0.93031,0.92113,0.91653,0.89903,0.85935,0.85505,0.83873,0.9316,0.92694,0.90924,0.88819,0.88374,0.86687,0.87092,0.86656,0.85001,0.86022,0.85592,0.83958,0.84881,0.84457,0.82844,0.85131,0.84706,0.83088,0.92312,0.91851,0.90097,0.89421,0.88974,0.87275,0.87059,0.86623,0.84969,0.88125,0.87684,0.8601,0.90847,0.90393,0.88667,0.8128,0.80874,0.7933,0.80107,0.79706,0.78184,0.85601,0.85173,0.83547,0.85631,0.85203,0.83576,0.83533,0.83115,0.81528,0.89617,0.89169,0.87466,0.8167,0.81262,0.7971,0.81444,0.81037,0.7949,0.79224,0.78828,0.77322,0.82241,0.8183,0.80267,0.84559,0.84137,0.8253,0.82864,0.8245,0.80875,0.88815,0.88371,0.86683,0.83266,0.8285,0.81268,0.90466,0.90014,0.88295,0.87063,0.86628,0.84974,0.92032,0.91572,0.89823,0.84909,0.84484,0.82871,0.86115,0.85684,0.84048,0.94291,0.9382,0.92028,0.86908,0.86474,0.84822,0.90083,0.89633,0.87921,0.90037,0.89587,0.87876,0.91716,0.91257,0.89514,0.95503,0.95025,0.93211,0.91041,0.90585,0.88856,0.93582,0.93114,0.91336,0.95518,0.9504,0.93225,0.88716,0.88272,0.86587,0.89628,0.8918,0.87477,0.91643,0.91185,0.89444,0.9544,0.94962,0.93149,0.96782,0.96299,0.9446,0.96874,0.9639,0.94549,0.94093,0.93623,0.91835,0.92918,0.92453,0.90688,0.90669,0.90215,0.88493,0.94414,0.93942,0.92148,0.91574,0.91116,0.89376,0.98313,0.97822,0.95954,0.93999,0.93529,0.91743,0.9631,0.95828,0.93999,0.92676,0.92213,0.90452,0.93352,0.92885,0.91111,0.96735,0.96251,0.94413,0.91539,0.91082,0.89342,0.93917,0.93448,0.91663,0.97114,0.96629,0.94783,0.90241,0.8979,0.88075,0.8599,0.8556,0.83927,0.91454,0.90996,0.89259,0.86621,0.86188,0.84543,0.87362,0.86925,0.85265,0.85125,0.84699,0.83082,0.83287,0.82871,0.81288,0.83834,0.83415,0.81822,0.92589,0.92126,0.90367,0.86978,0.86543,0.8489,0.87795,0.87356,0.85688,0.8874,0.88297,0.86611,0.89783,0.89334,0.87628,0.80288,0.79887,0.78361,0.81652,0.81244,0.79693,0.85123,0.84697,0.8308,0.84297,0.83876,0.82274,0.84914,0.8449,0.82876,0.89588,0.8914,0.87438,0.80763,0.80359,0.78825,0.83716,0.83297,0.81707,0.7905,0.78655,0.77153,0.84956,0.84531,0.82917,0.84164,0.83744,0.82144,0.82232,0.81821,0.80258,0.8719,0.86754,0.85097,0.83018,0.82603,0.81026,0.87901,0.87462,0.85791,0.8773,0.87291,0.85624,0.90568,0.90115,0.88394,0.86718,0.86285,0.84637,0.87261,0.86825,0.85167,0.93942,0.93472,0.91688,0.88047,0.87606,0.85934,0.90037,0.89587,0.87876,0.88998,0.88553,0.86862,0.88899,0.88455,0.86766,0.96258,0.95777,0.93948,0.89906,0.89456,0.87748,0.94993,0.94518,0.92713,0.94721,0.94247,0.92448,0.90782,0.90328,0.88604,0.90396,0.89944,0.88227,0.93246,0.9278,0.91008,0.97837,0.97348,0.95489,0.96394,0.95912,0.9408,0.96901,0.96417,0.94576,0.92487,0.92025,0.90267,0.95615,0.95137,0.9332,0.91917,0.91458,0.89711,0.95088,0.94612,0.92805,0.92416,0.91954,0.90198,0.98497,0.98004,0.96133,0.93519,0.93052,0.91275,0.9746,0.96973,0.95121,0.91351,0.90894,0.89159,0.95388,0.94912,0.93099,0.96966,0.96481,0.94639,0.91766,0.91307,0.89564,0.93927,0.93458,0.91673,0.97418,0.96931,0.9508,0.89071,0.88626,0.86933,0.85628,0.85199,0.83572,0.89088,0.88643,0.8695,0.84588,0.84165,0.82558,0.89505,0.89057,0.87357,0.85641,0.85213,0.83586,0.81877,0.81467,0.79912,0.84299,0.83877,0.82276,0.91358,0.90901,0.89165,0.89438,0.8899,0.87291,0.8797,0.8753,0.85859,0.89919,0.89469,0.87761,0.87534,0.87097,0.85433,0.80355,0.79953,0.78427,0.8352,0.83102,0.81515,0.849,0.84475,0.82862,0.82423,0.82011,0.80445,0.8548,0.85052,0.83428,0.88101,0.8766,0.85987,0.8298,0.82565,0.80988,0.85767,0.85338,0.83709,0.80086,0.79685,0.78163,0.87546,0.87108,0.85444,0.86429,0.85997,0.84355,0.81777,0.81368,0.79814,0.84833,0.84408,0.82797,0.82203,0.81792,0.8023,0.8494,0.84515,0.82902,0.87341,0.86904,0.85245,0.88052,0.87611,0.85938,0.88936,0.88491,0.86802,0.87624,0.87186,0.85521,0.9209,0.91629,0.89879,0.89494,0.89047,0.87346,0.88998,0.88553,0.86862,0.87661,0.87223,0.85557,0.88137,0.87697,0.86022,0.95684,0.95206,0.93388,0.8853,0.88087,0.86405,0.95169,0.94693,0.92885,0.93226,0.9276,0.90989,0.92184,0.91723,0.89972,0.90462,0.9001,0.88291,0.93883,0.93414,0.9163,0.98856,0.98362,0.96484,0.95189,0.94713,0.92904,0.95964,0.95484,0.93661,0.91709,0.91251,0.89508,0.97336,0.96849,0.95,0.92471,0.92008,0.90251,0.96902,0.96417,0.94576,0.92499,0.92036,0.90279,0.97585,0.97097,0.95243,0.94795,0.94321,0.9252,0.97369,0.96882,0.95032,0.90161,0.8971,0.87997,0.9631,0.95828,0.93999,0.96104,0.95623,0.93797,0.92075,0.91614,0.89865,0.93799,0.9333,0.91548,0.96504,0.96022,0.94188,0.87793,0.87354,0.85686,0.85105,0.84679,0.83062,0.87143,0.86708,0.85052,0.85543,0.85116,0.8349,0.90808,0.90354,0.88629,0.85623,0.85195,0.83568,0.82183,0.81772,0.8021,0.84279,0.83857,0.82256,0.89545,0.89097,0.87396,0.91402,0.90945,0.89208,0.89518,0.8907,0.87369,0.89881,0.89431,0.87723,0.85344,0.84918,0.83296,0.81847,0.81438,0.79883,0.84806,0.84382,0.82771,0.85184,0.84758,0.8314,0.82158,0.81747,0.80186,0.85207,0.84781,0.83162,0.8618,0.85749,0.84112,0.84948,0.84523,0.82909,0.86851,0.86417,0.84767,0.81361,0.80954,0.79409,0.8904,0.88594,0.86903,0.8773,0.87291,0.85624,0.816,0.81192,0.79642,0.82853,0.82439,0.80864,0.83473,0.83056,0.8147,0.84709,0.84285,0.82676,0.8634,0.85908,0.84268,0.86489,0.86056,0.84413,0.90134,0.89684,0.87971,0.87256,0.8682,0.85162,0.89917,0.89467,0.87759,0.89991,0.89542,0.87832,0.87661,0.87223,0.85557,0.86394,0.85962,0.84321,0.87832,0.87393,0.85724,0.94503,0.94031,0.92235,0.87271,0.86835,0.85176,0.9464,0.94167,0.92369,0.91638,0.9118,0.89439,0.92979,0.92514,0.90748,0.90137,0.89687,0.87974,0.93875,0.93406,0.91622,0.98934,0.9844,0.9656,0.93771,0.93302,0.91521,0.94685,0.94211,0.92412,0.92381,0.91919,0.90164,0.98224,0.97733,0.95867,0.92539,0.92076,0.90318,0.97918,0.97428,0.95568,0.92158,0.91698,0.89947,0.96255,0.95773,0.93945,0.95406,0.94929,0.93117,0.96628,0.96145,0.94309,0.91099,0.90643,0.88912,0.96451,0.95969,0.94137,0.94823,0.94348,0.92547,0.91885,0.91426,0.8968,0.93134,0.92668,0.90899,0.9511,0.94634,0.92827,0.8668,0.86246,0.84599,0.85067,0.84642,0.83026,0.85685,0.85257,0.83629,0.86407,0.85975,0.84334,0.91425,0.90967,0.8923,0.85313,0.84886,0.83265,0.83043,0.82628,0.8105,0.84669,0.84246,0.82637,0.87744,0.87305,0.85638,0.92491,0.92028,0.90271,0.90289,0.89838,0.88122,0.89196,0.8875,0.87055,0.83574,0.83156,0.81568,0.83192,0.82776,0.81195,0.85558,0.85131,0.83505,0.84952,0.84528,0.82914,0.84002,0.83582,0.81986,0.8453,0.84108,0.82502,0.84367,0.83945,0.82342,0.86412,0.8598,0.84339,0.87213,0.86777,0.8512,0.82371,0.81959,0.80394,0.89665,0.89217,0.87513,0.88272,0.87831,0.86154,0.81263,0.80857,0.79313,0.8312,0.82704,0.81125,0.84598,0.84175,0.82568,0.8542,0.84993,0.8337,0.85756,0.85327,0.83698,0.87327,0.86891,0.85232,0.90556,0.90104,0.88383,0.86559,0.86127,0.84482,0.87948,0.87508,0.85837,0.89881,0.89431,0.87724,0.86394,0.85962,0.84321,0.8512,0.84694,0.83077,0.87756,0.87317,0.85649,0.92847,0.92383,0.90619,0.87889,0.87449,0.8578,0.93572,0.93104,0.91327,0.89929,0.89479,0.87771,0.93328,0.92861,0.91088,0.8952,0.89072,0.87371,0.93381,0.92914,0.91139,0.98305,0.97813,0.95945,0.92154,0.91693,0.89942,0.9312,0.92654,0.90885,0.92728,0.92265,0.90503,0.985,0.98007,0.96136,0.92241,0.9178,0.90027,0.98347,0.97856,0.95987,0.915,0.91043,0.89304,0.94582,0.94109,0.92312,0.95525,0.95047,0.93232,0.95391,0.94914,0.93102,0.91823,0.91363,0.89619,0.96005,0.95525,0.937,0.93204,0.92738,0.90967,0.91316,0.90859,0.89124,0.92057,0.91597,0.89848,0.93327,0.92861,0.91088,0.85725,0.85297,0.83668,0.85616,0.85188,0.83561,0.85703,0.85275,0.83646,0.87134,0.86698,0.85043,0.91532,0.91075,0.89336,0.85334,0.84908,0.83286,0.83973,0.83553,0.81957,0.85058,0.84633,0.83017,0.85878,0.85449,0.83817,0.92938,0.92473,0.90707,0.90485,0.90032,0.88313,0.8802,0.8758,0.85908,0.82914,0.82499,0.80924,0.84516,0.84094,0.82488,0.85922,0.85493,0.8386,0.84333,0.83911,0.82309,0.85937,0.85508,0.83875,0.83536,0.83118,0.81531,0.83087,0.82672,0.81093,0.87546,0.87109,0.85445,0.87036,0.86601,0.84947,0.83219,0.82802,0.81221,0.89643,0.89195,0.87492,0.88252,0.87811,0.86134,0.81742,0.81333,0.7978,0.84845,0.84421,0.82808,0.85501,0.85073,0.83449,0.85778,0.85349,0.83719,0.87414,0.86977,0.85316,0.87783,0.87344,0.85677,0.90398,0.89946,0.88229,0.85601,0.85173,0.83546,0.8822,0.87779,0.86103,0.89312,0.88866,0.87169,0.8512,0.84694,0.83077,0.83947,0.83528,0.81933,0.8736,0.86923,0.85263,0.90925,0.9047,0.88742,0.88316,0.87874,0.86196,0.92108,0.91647,0.89897,0.88272,0.8783,0.86153,0.93179,0.92713,0.90942,0.90698,0.90244,0.88521,0.92471,0.92009,0.90252,0.97056,0.9657,0.94726,0.90512,0.9006,0.8834,0.91452,0.90994,0.89257,0.93329,0.92863,0.91089,0.98123,0.97632,0.95768,0.91616,0.91158,0.89417,0.98127,0.97637,0.95772,0.92412,0.9195,0.90194,0.92764,0.923,0.90538,0.95129,0.94653,0.92846,0.93823,0.93354,0.91571,0.92238,0.91777,0.90024,0.95029,0.94554,0.92748,0.91444,0.90987,0.8925,0.90442,0.8999,0.88272,0.90712,0.90258,0.88535,0.91371,0.90914,0.89178,0.84944,0.84519,0.82905,0.86046,0.85615,0.8398,0.85577,0.85149,0.83523,0.87628,0.8719,0.85525,0.91414,0.90957,0.8922,0.85653,0.85225,0.83598,0.84889,0.84464,0.82851,0.85164,0.84738,0.8312,0.85674,0.85246,0.83618,0.92677,0.92214,0.90453,0.90073,0.89623,0.87912,0.86512,0.86079,0.84436,0.84632,0.84209,0.82601,0.85679,0.85251,0.83623,0.85845,0.85415,0.83784,0.83411,0.82994,0.81409,0.87777,0.87338,0.8567,0.84598,0.84175,0.82568,0.83947,0.83528,0.81933,0.88197,0.87756,0.8608,0.86348,0.85916,0.84276,0.83793,0.83374,0.81782,0.88976,0.88531,0.86841,0.87672,0.87234,0.85568,0.83303,0.82886,0.81304,0.86555,0.86122,0.84478,0.86062,0.85631,0.83996,0.8573,0.85302,0.83673,0.88865,0.8842,0.86732,0.87792,0.87353,0.85685,0.89684,0.89236,0.87532,0.84799,0.84375,0.82764,0.88475,0.88033,0.86352,0.88365,0.87924,0.86245,0.83947,0.83528,0.81933,0.83308,0.82892,0.81309,0.86698,0.86264,0.84617,0.8895,0.88505,0.86815,0.88452,0.88009,0.86329,0.90428,0.89976,0.88258,0.86804,0.8637,0.8472,0.92552,0.92089,0.90331,0.9204,0.91579,0.89831,0.92853,0.92388,0.90624,0.95356,0.94879,0.93068,0.88992,0.88547,0.86856,0.89846,0.89397,0.8769,0.937,0.93231,0.91451,0.97148,0.96663,0.94817,0.91627,0.91169,0.89428,0.9729,0.96803,0.94955,0.93983,0.93513,0.91727,0.90985,0.9053,0.88801,0.94274,0.93802,0.92011,0.92524,0.92061,0.90303,0.92289,0.91828,0.90074,0.93657,0.93189,0.91409,0.89724,0.89275,0.8757,0.89376,0.88929,0.87231,0.89259,0.88813,0.87117,0.89812,0.89363,0.87657,0.84245,0.83824,0.82223,0.86297,0.85865,0.84226,0.85259,0.84832,0.83212,0.87821,0.87382,0.85714,0.92995,0.9253,0.90763,0.85709,0.85281,0.83652,0.85693,0.85265,0.83637,0.8609,0.8566,0.84024,0.86067,0.85637,0.84002,0.91748,0.91289,0.89546,0.89112,0.88666,0.86973,0.84855,0.84431,0.82818,0.864,0.85968,0.84326,0.86539,0.86106,0.84462,0.85335,0.84909,0.83287,0.82306,0.81895,0.80331,0.8931,0.88863,0.87166,0.86412,0.8598,0.84338,0.84488,0.84066,0.8246,0.88272,0.8783,0.86153,0.85248,0.84821,0.83202,0.8401,0.8359,0.81994,0.87761,0.87322,0.85655,0.86616,0.86183,0.84537,0.84925,0.84501,0.82887,0.88062,0.87622,0.85949,0.86206,0.85775,0.84137,0.85286,0.84859,0.83239,0.89927,0.89478,0.87769,0.87351,0.86914,0.85255,0.88516,0.88074,0.86392,0.8536,0.84933,0.83311,0.88308,0.87866,0.86188,0.87164,0.86729,0.85072,0.83308,0.82892,0.81309,0.84573,0.8415,0.82543,0.85856,0.85427,0.83796,0.87105,0.86669,0.85014,0.88279,0.87837,0.8616,0.88718,0.88275,0.86589,0.86873,0.86439,0.84788,0.91539,0.91081,0.89342,0.93156,0.92691,0.90921,0.94764,0.94291,0.9249,0.9342,0.92953,0.91178,0.87688,0.8725,0.85584,0.88427,0.87984,0.86304,0.9364,0.93172,0.91393,0.95713,0.95234,0.93416,0.91709,0.91251,0.89508,0.95955,0.95475,0.93652,0.95371,0.94894,0.93082,0.89882,0.89433,0.87725,0.93412,0.92945,0.9117,0.93111,0.92645,0.90876,0.91973,0.91513,0.89765,0.92061,0.91601,0.89852,0.88181,0.8774,0.86064,0.88239,0.87798,0.86121,0.90378,0.89926,0.88209,0.90765,0.90311,0.88587,0.84133,0.83712,0.82114,0.86333,0.85902,0.84261,0.84795,0.84371,0.8276,0.88162,0.87721,0.86046,0.94122,0.93651,0.91863,0.85498,0.8507,0.83446,0.86287,0.85856,0.84216,0.86848,0.86414,0.84763,0.86106,0.85675,0.84039,0.9028,0.89829,0.88113,0.87732,0.87293,0.85626,0.83222,0.82806,0.81224,0.8804,0.876,0.85927,0.86985,0.8655,0.84897,0.84465,0.84043,0.82438,0.8247,0.82058,0.80491,0.90341,0.8989,0.88173,0.88009,0.87569,0.85897,0.84639,0.84215,0.82607,0.8776,0.87321,0.85654,0.83881,0.83461,0.81868,0.83838,0.83418,0.81825,0.86163,0.85732,0.84095,0.85225,0.84799,0.8318,0.86452,0.8602,0.84377,0.89178,0.88732,0.87038,0.85918,0.85488,0.83856,0.86459,0.86027,0.84384,0.90461,0.90009,0.8829,0.86555,0.86122,0.84477,0.87052,0.86617,0.84963,0.86096,0.85665,0.8403,0.87744,0.87305,0.85638,0.85853,0.85423,0.83792,0.84573,0.8415,0.82543]},"fleeceFar":{"position":[0.01511,0.83,-0.82,0.01484,0.84723,-0.82,0.01357,0.86394,-0.82,0.01089,0.8772,-0.82,0.00758,0.8869,-0.82,0.00392,0.89347,-0.82,0.0,0.89569,-0.82,-0.00398,0.89437,-0.82,-0.00792,0.88944,-0.82,-0.011,0.87767,-0.82,-0.01311,0.86279,-0.82,-0.01501,0.84742,-0.82,-0.01498,0.83,-0.82,-0.0153,0.81223,-0.82,-0.01333,0.79665,-0.82,-0.01101,0.78229,-0.82,-0.00772,0.77203,-0.82,-0.00391,0.76674,-0.82,-0.0,0.76305,-0.82,0.00387,0.76747,-0.82,0.00775,0.77183,-0.82,0.0109,0.78276,-0.82,0.01302,0.79743,-0.82,0.01459,0.81306,-0.82,0.01511,0.83,-0.82,0.10743,0.81375,-0.785,0.10375,0.85761,-0.785,0.09351,0.89892,-0.785,0.07904,0.93844,-0.785,0.05341,0.95967,-0.785,0.02843,0.98113,-0.785,0.0,0.98056,-0.785,-0.02734,0.97471,-0.785,-0.05614,0.96715,-0.785,-0.07796,0.93673,-0.785,-0.09324,0.89867,-0.785,-0.10288,0.85724,-0.785,-0.10446,0.81375,-0.785,-0.10587,0.769,-0.785,-0.09128,0.73061,-0.785,-0.07948,0.68837,-0.785,-0.05298,0.66898,-0.785,-0.02774,0.65043,-0.785,-0.0,0.64388,-0.785,0.02726,0.65326,-0.785,0.05573,0.66147,-0.785,0.07541,0.69479,-0.785,0.09618,0.72615,-0.785,0.1028,0.7703,-0.785,0.10743,0.81375,-0.785,0.2151,0.8,-0.75,0.21058,0.87348,-0.75,0.18199,0.93684,-0.75,0.15725,1.00479,-0.75,0.10772,1.04299,-0.75,0.05694,1.07677,-0.75,0.0,1.08309,-0.75,-0.05432,1.06399,-0.75,-0.10891,1.04568,-0.75,-0.15283,0.99903,-0.75,-0.18893,0.94206,-0.75,-0.21117,0.87369,-0.75,-0.21936,0.8,-0.75,-0.20711,0.72773,-0.75,-0.18633,0.6599,-0.75,-0.15797,0.59427,-0.75,-0.10868,0.55486,-0.75,-0.05806,0.51779,-0.75,-0.0,0.52188,-0.75,0.05667,0.52457,-0.75,0.11142,0.54867,-0.75,0.15108,0.60324,-0.75,0.19778,0.65129,-0.75,0.2132,0.7256,-0.75,0.2151,0.8,-0.75,0.30971,0.80812,-0.675,0.29281,0.897,-0.675,0.26152,0.97916,-0.675,0.20875,1.04459,-0.675,0.14803,1.09856,-0.675,0.07991,1.14596,-0.675,0.0,1.15361,-0.675,-0.07927,1.14325,-0.675,-0.14827,1.09902,-0.675,-0.21398,1.05051,-0.675,-0.25798,0.97684,-0.675,-0.28979,0.89608,-0.675,-0.3143,0.80812,-0.675,-0.29049,0.71996,-0.675,-0.25709,0.63999,-0.675,-0.21203,0.56795,-0.675,-0.15258,0.50877,-0.675,-0.08063,0.46725,-0.675,-0.0,0.4708,-0.675,0.07924,0.47315,-0.675,0.14847,0.51683,-0.675,0.20988,0.57038,-0.675,0.25829,0.6392,-0.675,0.29569,0.71838,-0.675,0.30971,0.80812,-0.675,0.37452,0.82,-0.6,0.3504,0.9162,-0.6,0.32873,1.01447,-0.6,0.26593,1.09249,-0.6,0.18473,1.14785,-0.6,0.09645,1.18881,-0.6,0.0,1.19359,-0.6,-0.10061,1.20473,-0.6,-0.18601,1.15012,-0.6,-0.27069,1.09737,-0.6,-0.3148,1.00623,-0.6,-0.34744,0.91539,-0.6,-0.37196,0.82,-0.6,-0.35728,0.72191,-0.6,-0.33423,0.62227,-0.6,-0.25758,0.55606,-0.6,-0.18341,0.49449,-0.6,-0.09539,0.45521,-0.6,-0.0,0.45162,-0.6,0.10031,0.4364,-0.6,0.18994,0.4829,-0.6,0.26145,0.5521,-0.6,0.32124,0.62996,-0.6,0.34448,0.72542,-0.6,0.37452,0.82,-0.6,0.41109,0.82062,-0.5,0.41311,0.92987,-0.5,0.36812,1.03038,-0.5,0.3039,1.12055,-0.5,0.216,1.18986,-0.5,0.10804,1.21858,-0.5,0.0,1.24191,-0.5,-0.11177,1.2323,-0.5,-0.21241,1.18373,-0.5,-0.30399,1.12064,-0.5,-0.369,1.03088,-0.5,-0.41164,0.92948,-0.5,-0.42708,0.82062,-0.5,-0.39184,0.717,-0.5,-0.37289,0.60815,-0.5,-0.29494,0.52954,-0.5,-0.22036,0.44394,-0.5,-0.11205,0.40792,-0.5,-0.0,0.40025,-0.5,0.11005,0.41526,-0.5,0.21034,0.46106,-0.5,0.30759,0.51705,-0.5,0.3756,0.60661,-0.5,0.41397,0.71115,-0.5,0.41109,0.82062,-0.5,0.45877,0.82,-0.4,0.46776,0.94118,-0.4,0.39125,1.03839,-0.4,0.32173,1.13106,-0.4,0.23344,1.21092,-0.4,0.11933,1.25058,-0.4,0.0,1.27499,-0.4,-0.11788,1.24535,-0.4,-0.23135,1.20742,-0.4,-0.32578,1.13497,-0.4,-0.39504,1.04051,-0.4,-0.45599,0.93813,-0.4,-0.46298,0.82,-0.4,-0.46359,0.6999,-0.4,-0.39074,0.60189,-0.4,-0.3153,0.51517,-0.4,-0.22631,0.44102,-0.4,-0.11664,0.39913,-0.4,-0.0,0.36889,-0.4,0.12077,0.38424,-0.4,0.23123,0.43279,-0.4,0.32087,0.50978,-0.4,0.38552,0.60481,-0.4,0.45769,0.70143,-0.4,0.45877,0.82,-0.4,0.47189,0.82375,-0.265,0.45608,0.93947,-0.265,0.40668,1.04609,-0.265,0.34345,1.14897,-0.265,0.24645,1.22796,-0.265,0.12519,1.26619,-0.265,0.0,1.28607,-0.265,-0.12288,1.25803,-0.265,-0.23689,1.21228,-0.265,-0.33992,1.14563,-0.265,-0.42293,1.05497,-0.265,-0.46205,0.94099,-0.265,-0.4827,0.82375,-0.265,-0.46026,0.70697,-0.265,-0.40801,0.60068,-0.265,-0.35494,0.48764,-0.265,-0.23987,0.43033,-0.265,-0.12352,0.38722,-0.265,-0.0,0.3784,-0.265,0.12282,0.38969,-0.265,0.24318,0.4249,-0.265,0.33762,0.50404,-0.265,0.42765,0.58994,-0.265,0.45418,0.70851,-0.265,0.47189,0.82375,-0.265,0.49258,0.83,-0.13,0.48318,0.95085,-0.13,0.43844,1.06629,-0.13,0.34569,1.15269,-0.13,0.24104,1.21972,-0.13,0.12655,1.27088,-0.13,0.0,1.27335,-0.13,-0.13148,1.28804,-0.13,-0.2439,1.22435,-0.13,-0.3397,1.1471,-0.13,-0.42698,1.06012,-0.13,-0.472,0.94806,-0.13,-0.51224,0.83,-0.13,-0.47864,0.71028,-0.13,-0.43101,0.59771,-0.13,-0.34449,0.50843,-0.13,-0.24512,0.43368,-0.13,-0.12887,0.38104,-0.13,-0.0,0.37302,-0.13,0.12737,0.38626,-0.13,0.24457,0.43458,-0.13,0.33972,0.51289,-0.13,0.4238,0.6016,-0.13,0.46858,0.7128,-0.13,0.49258,0.83,-0.13,0.48669,0.83813,0.005,0.47726,0.95658,0.005,0.42269,1.06418,0.005,0.34025,1.1533,0.005,0.25479,1.24692,0.005,0.12635,1.27493,0.005,0.0,1.30668,0.005,-0.12738,1.27847,0.005,-0.24677,1.23405,0.005,-0.34934,1.16172,0.005,-0.42305,1.06437,0.005,-0.48925,0.95956,0.005,-0.49295,0.83813,0.005,-0.47025,0.72141,0.005,-0.42389,0.61143,0.005,-0.35249,0.51161,0.005,-0.25397,0.43065,0.005,-0.13053,0.38689,0.005,-0.0,0.38799,0.005,0.12837,0.39435,0.005,0.24495,0.44512,0.005,0.35364,0.51055,0.005,0.42535,0.61064,0.005,0.48388,0.71802,0.005,0.48669,0.83813,0.005,0.48286,0.85,0.14,0.48562,0.97161,0.14,0.42165,1.07752,0.14,0.35484,1.18164,0.14,0.2367,1.23316,0.14,0.1194,1.26648,0.14,0.0,1.30624,0.14,-0.12583,1.28889,0.14,-0.25058,1.25563,0.14,-0.34318,1.17073,0.14,-0.40913,1.07076,0.14,-0.4715,0.96808,0.14,-0.47565,0.85,0.14,-0.47541,0.73095,0.14,-0.41804,0.62443,0.14,-0.35429,0.51888,0.14,-0.24162,0.45887,0.14,-0.12148,0.42628,0.14,-0.0,0.40275,0.14,0.12794,0.40376,0.14,0.24951,0.4461,0.14,0.34766,0.52508,0.14,0.40437,0.63181,0.14,0.46568,0.73338,0.14,0.48286,0.85,0.14,0.44443,0.86719,0.24,0.42769,0.97949,0.24,0.37208,1.0777,0.24,0.32342,1.18412,0.24,0.22483,1.2488,0.24,0.11858,1.30088,0.24,0.0,1.30665,0.24,-0.11263,1.2791,0.24,-0.22197,1.24394,0.24,-0.30788,1.1689,0.24,-0.38739,1.08636,0.24,-0.43663,0.98184,0.24,-0.44248,0.86719,0.24,-0.4296,0.75438,0.24,-0.37702,0.65387,0.24,-0.32257,0.55108,0.24,-0.2232,0.48834,0.24,-0.11962,0.42969,0.24,-0.0,0.42696,0.24,0.11428,0.44922,0.24,0.21884,0.49574,0.24,0.31407,0.55941,0.24,0.40804,0.63633,0.24,0.43533,0.75288,0.24,0.44443,0.86719,0.24,0.40366,0.89,0.34,0.38566,0.99832,0.34,0.34373,1.09802,0.34,0.28687,1.19071,0.34,0.18981,1.23462,0.34,0.10626,1.3057,0.34,0.0,1.309,0.34,-0.1054,1.30233,0.34,-0.20152,1.25587,0.34,-0.27681,1.18016,0.34,-0.35386,1.10415,0.34,-0.39125,0.99989,0.34,-0.40782,0.89,0.34,-0.38913,0.7807,0.34,-0.34901,0.67878,0.34,-0.29095,0.58502,0.34,-0.19365,0.53841,0.34,-0.10394,0.48337,0.34,-0.0,0.47098,0.34,0.10564,0.47674,0.34,0.20533,0.5172,0.34,0.27796,0.59863,0.34,0.34753,0.67968,0.34,0.37311,0.78521,0.34,0.40366,0.89,0.34,0.35653,0.92181,0.42,0.32644,1.02073,0.42,0.30825,1.12307,0.42,0.25308,1.20802,0.42,0.17259,1.25986,0.42,0.09205,1.31032,0.42,0.0,1.30154,0.42,-0.09209,1.31047,0.42,-0.17716,1.26882,0.42,-0.25356,1.20856,0.42,-0.30232,1.1192,0.42,-0.32847,1.02134,0.42,-0.34498,0.92181,0.42,-0.33486,0.82034,0.42,-0.31383,0.71691,0.42,-0.25064,0.63837,0.42,-0.17874,0.57171,0.42,-0.08926,0.54508,0.42,-0.0,0.53317,0.42,0.0909,0.53816,0.42,0.17206,0.58479,0.42,0.25081,0.63819,0.42,0.30307,0.72394,0.42,0.33466,0.8204,0.42,0.35653,0.92181,0.42,0.30829,0.955,0.5,0.2835,1.0477,0.5,0.26308,1.14036,0.5,0.21154,1.21315,0.5,0.15278,1.27792,0.5,0.07961,1.31758,0.5,0.0,1.32387,0.5,-0.07912,1.31535,0.5,-0.14827,1.26839,0.5,-0.21525,1.21768,0.5,-0.25659,1.13578,0.5,-0.30005,1.05311,0.5,-0.30596,0.955,0.5,-0.28449,0.86198,0.5,-0.26538,0.76803,0.5,-0.20711,0.70225,0.5,-0.15709,0.62296,0.5,-0.07805,0.59952,0.5,-0.0,0.58246,0.5,0.07713,0.60374,0.5,0.147,0.64429,0.5,0.21564,0.69185,0.5,0.25775,0.7734,0.5,0.29491,0.85857,0.5,0.30829,0.955,0.5,0.26816,0.98113,0.545,0.25993,1.0698,0.545,0.22823,1.14889,0.545,0.18068,1.21116,0.545,0.13516,1.27918,0.545,0.06772,1.3029,0.545,0.0,1.32988,0.545,-0.06997,1.31357,0.545,-0.13186,1.2719,0.545,-0.18113,1.21174,0.545,-0.22377,1.14561,0.545,-0.26012,1.06987,0.545,-0.26157,0.98113,0.545,-0.25676,0.89353,0.545,-0.23097,0.81134,0.545,-0.17738,0.75528,0.545,-0.13157,0.69098,0.545,-0.0693,0.65182,0.545,-0.0,0.63099,0.545,0.06966,0.65011,0.545,0.1338,0.68607,0.545,0.18373,0.7472,0.545,0.22461,0.81602,0.545,0.25881,0.89283,0.545,0.26816,0.98113,0.545,0.22715,1.006,0.59,0.2226,1.08341,0.59,0.19867,1.15486,0.59,0.1599,1.21352,0.59,0.11306,1.26015,0.59,0.05856,1.28963,0.59,0.0,1.31194,0.59,-0.06044,1.29875,0.59,-0.11408,1.26242,0.59,-0.16151,1.2156,0.59,-0.19392,1.1513,0.59,-0.22085,1.0828,0.59,-0.22705,1.006,0.59,-0.22512,0.92772,0.59,-0.20409,0.85308,0.59,-0.1589,0.79978,0.59,-0.11419,0.74931,0.59,-0.05858,0.72226,0.59,-0.0,0.70507,0.59,0.06022,0.71433,0.59,0.11503,0.74743,0.59,0.16251,0.7951,0.59,0.19467,0.86014,0.59,0.21998,0.9295,0.59,0.22715,1.006,0.59,0.19105,1.03706,0.62,0.19373,1.1037,0.62,0.17143,1.16413,0.62,0.13447,1.20969,0.62,0.09775,1.25441,0.62,0.04812,1.26764,0.62,0.0,1.28717,0.62,-0.05134,1.28306,0.62,-0.09869,1.25651,0.62,-0.13898,1.21548,0.62,-0.16705,1.16088,0.62,-0.18676,1.10131,0.62,-0.18891,1.03706,0.62,-0.18804,0.97238,0.62,-0.17186,0.90968,0.62,-0.14019,0.85709,0.62,-0.09443,0.82708,0.62,-0.04923,0.8012,0.62,-0.0,0.78908,0.62,0.04896,0.80248,0.62,0.09779,0.81961,0.62,0.13935,0.85817,0.62,0.1689,0.91187,0.62,0.18962,0.97184,0.62,0.19105,1.03706,0.62,0.14493,1.061,0.65,0.14853,1.11116,0.65,0.13111,1.1564,0.65,0.10664,1.1954,0.65,0.0759,1.22667,0.65,0.03786,1.23906,0.65,0.0,1.25139,0.65,-0.03864,1.24276,0.65,-0.07533,1.22544,0.65,-0.10593,1.19451,0.65,-0.13206,1.15709,0.65,-0.14201,1.10896,0.65,-0.14621,1.061,0.65,-0.14234,1.01293,0.65,-0.13168,0.96519,0.65,-0.10846,0.92431,0.65,-0.07458,0.89821,0.65,-0.03732,0.88549,0.65,-0.0,0.87326,0.65,0.0382,0.88132,0.65,0.07492,0.89745,0.65,0.10543,0.92812,0.65,0.1287,0.96735,0.65,0.14601,1.01169,0.65,0.14493,1.061,0.65,0.07129,1.06144,0.6695,0.07238,1.08792,0.6695,0.06385,1.11176,0.6695,0.05391,1.13504,0.6695,0.03741,1.14991,0.6695,0.01939,1.16022,0.6695,0.0,1.16544,0.6695,-0.01878,1.15715,0.6695,-0.03781,1.15086,0.6695,-0.05228,1.13281,0.6695,-0.06549,1.11306,0.6695,-0.07097,1.0874,0.6695,-0.07355,1.06144,0.6695,-0.07167,1.03522,0.6695,-0.06617,1.00928,0.6695,-0.05333,0.98863,0.6695,-0.03774,0.97219,0.6695,-0.0192,0.9636,0.6695,-0.0,0.9582,0.6695,0.01923,0.96345,0.6695,0.03746,0.97286,0.6695,0.0529,0.98922,0.6695,0.0653,1.00996,0.6695,0.07195,1.03512,0.6695,0.07129,1.06144,0.6695,0.00978,1.055,0.689,0.00977,1.06259,0.689,0.00856,1.06933,0.689,0.00732,1.07624,0.689,0.00503,1.08027,0.689,0.00267,1.08389,0.689,0.0,1.08491,0.689,-0.00257,1.08282,0.689,-0.00515,1.08087,0.689,-0.00708,1.07553,0.689,-0.00895,1.06998,0.689,-0.00974,1.06257,0.689,-0.01022,1.055,0.689,-0.00987,1.04733,0.689,-0.00888,1.04013,0.689,-0.0073,1.03382,0.689,-0.00514,1.02919,0.689,-0.00268,1.02604,0.689,-0.0,1.02498,0.689,0.0026,1.02682,0.689,0.0052,1.02886,0.689,0.00726,1.03394,0.689,0.00896,1.04,0.689,0.00992,1.04729,0.689,0.00978,1.055,0.689],"normal":[0.2468,-0.00825,-0.96903,0.18664,0.01017,-0.98238,0.19418,0.02977,-0.98051,0.19446,0.05327,-0.97946,0.18955,0.09122,-0.97762,0.17235,0.15294,-0.97309,0.01347,0.22713,-0.97377,-0.15472,0.1957,-0.96838,-0.22969,0.10724,-0.96734,-0.22024,0.04821,-0.97425,-0.19939,0.03201,-0.9794,-0.19731,0.01455,-0.98023,-0.18586,0.00234,-0.98257,-0.18923,-0.0064,-0.98191,-0.17854,-0.02989,-0.98348,-0.18861,-0.04113,-0.98119,-0.16867,-0.08161,-0.98229,-0.1357,-0.11543,-0.984,0.04155,-0.19897,-0.97912,0.13228,-0.12414,-0.98341,0.19921,-0.09079,-0.97574,0.21264,-0.04263,-0.9762,0.18735,-0.02809,-0.98189,0.18777,-0.01178,-0.98214,0.2468,-0.00825,-0.96903,0.32872,-0.00175,-0.94443,0.33383,0.05253,-0.94117,0.33655,0.10815,-0.93543,0.28243,0.19533,-0.93919,0.23207,0.27394,-0.93333,0.11138,0.3203,-0.94075,-0.03763,0.35374,-0.93459,-0.08958,0.34979,-0.93254,-0.1997,0.2825,-0.93825,-0.31333,0.17471,-0.93344,-0.33055,0.10913,-0.93746,-0.33355,0.04652,-0.94158,-0.33187,0.01322,-0.94323,-0.31331,-0.05794,-0.94788,-0.31251,-0.09927,-0.94471,-0.23965,-0.16384,-0.95694,-0.17259,-0.23246,-0.95717,-0.11591,-0.24581,-0.96236,0.02285,-0.26972,-0.96267,0.08019,-0.2651,-0.96088,0.17809,-0.21148,-0.96102,0.26425,-0.16429,-0.95036,0.27816,-0.10981,-0.95424,0.31902,-0.04179,-0.94683,0.32872,-0.00175,-0.94443,0.48492,6e-05,-0.87456,0.4893,0.12722,-0.86279,0.46473,0.18535,-0.86584,0.43445,0.36074,-0.8253,0.33414,0.45248,-0.82681,0.19341,0.52782,-0.82704,-0.06812,0.56389,-0.82304,-0.15811,0.50977,-0.84566,-0.32734,0.46529,-0.82241,-0.41915,0.3402,-0.84177,-0.48021,0.22099,-0.84886,-0.50337,0.11087,-0.85693,-0.49019,-0.00238,-0.87161,-0.48433,-0.12547,-0.86584,-0.48908,-0.18826,-0.85168,-0.44342,-0.37652,-0.8134,-0.34258,-0.43232,-0.83411,-0.14374,-0.58641,-0.79716,0.03452,-0.5832,-0.81159,0.12582,-0.57804,-0.80625,0.39381,-0.47469,-0.78714,0.41015,-0.36439,-0.83606,0.50874,-0.26774,-0.81823,0.51458,-0.08494,-0.85322,0.48492,6e-05,-0.87456,0.71633,-0.01653,-0.69757,0.68709,0.20357,-0.69747,0.6221,0.31991,-0.7146,0.52577,0.50623,-0.68359,0.45118,0.59553,-0.66467,0.24728,0.74487,-0.61969,-0.03013,0.80468,-0.59295,-0.2149,0.71464,-0.66566,-0.4331,0.60955,-0.66398,-0.51681,0.48403,-0.70614,-0.65342,0.30718,-0.69187,-0.68656,0.21686,-0.69397,-0.72446,-0.004,-0.6893,-0.69944,-0.22479,-0.67842,-0.65369,-0.31269,-0.68914,-0.61114,-0.5395,-0.57918,-0.51512,-0.68981,-0.50873,-0.19333,-0.8963,-0.39909,0.02362,-0.91474,-0.40335,0.20818,-0.84149,-0.49856,0.49815,-0.65945,-0.563,0.5883,-0.54075,-0.60124,0.67562,-0.3808,-0.63129,0.73089,-0.19378,-0.6544,0.71633,-0.01653,-0.69757,0.85126,0.01421,-0.52455,0.80022,0.17307,-0.57418,0.72878,0.38262,-0.56787,0.57708,0.60355,-0.55019,0.43855,0.72693,-0.52844,0.19922,0.88394,-0.42303,0.06537,0.88658,-0.45792,-0.22703,0.8447,-0.4847,-0.44966,0.72772,-0.51791,-0.62879,0.56758,-0.53149,-0.75299,0.34142,-0.56252,-0.77448,0.24684,-0.58246,-0.82574,0.02548,-0.56348,-0.82812,-0.19056,-0.52717,-0.74718,-0.41728,-0.5173,-0.59949,-0.68167,-0.41945,-0.50795,-0.74876,-0.42585,-0.19748,-0.91642,-0.34809,-0.06808,-0.92664,-0.36974,0.20503,-0.89863,-0.38784,0.52457,-0.74342,-0.41491,0.62658,-0.59022,-0.50896,0.75005,-0.37047,-0.54789,0.80233,-0.21925,-0.55515,0.85126,0.01421,-0.52455,0.91152,0.02755,-0.41033,0.85931,0.15025,-0.48889,0.79535,0.49935,-0.34361,0.67941,0.66073,-0.31911,0.44417,0.83181,-0.33286,0.21461,0.9232,-0.31883,0.07777,0.93228,-0.35328,-0.29152,0.92427,-0.24645,-0.4567,0.83151,-0.31627,-0.67637,0.65639,-0.33419,-0.80366,0.44809,-0.3916,-0.8513,0.26562,-0.45248,-0.91305,-0.08062,-0.39981,-0.87755,-0.19602,-0.43758,-0.79937,-0.4945,-0.3413,-0.68441,-0.64704,-0.33603,-0.51431,-0.80249,-0.3025,-0.19073,-0.94439,-0.26788,-0.02413,-0.94504,-0.32607,0.27258,-0.92224,-0.27417,0.45501,-0.82678,-0.33075,0.64265,-0.68605,-0.34107,0.83941,-0.43894,-0.32051,0.87689,-0.21434,-0.43027,0.91152,0.02755,-0.41033,0.96508,-0.05032,-0.25707,0.93847,0.28299,-0.19797,0.80161,0.57955,-0.14677,0.72639,0.65802,-0.1984,0.48534,0.84578,-0.22158,0.25629,0.94035,-0.22374,-0.00844,0.98313,-0.18273,-0.2916,0.94706,-0.13435,-0.46482,0.86927,-0.16829,-0.69775,0.69367,-0.17879,-0.81045,0.5307,-0.24806,-0.93302,0.26606,-0.24224,-0.96372,0.00689,-0.26684,-0.92341,-0.28583,-0.25614,-0.78006,-0.61238,-0.1284,-0.71437,-0.65779,-0.23871,-0.47241,-0.87335,-0.11871,-0.27816,-0.95271,-0.12231,-0.03868,-0.98986,-0.13666,0.2617,-0.95557,-0.13563,0.49026,-0.85427,-0.17279,0.73375,-0.66798,-0.12418,0.80419,-0.55629,-0.20935,0.93666,-0.25736,-0.23756,0.96508,-0.05032,-0.25707,0.99507,-0.03874,-0.09134,0.95021,0.29934,-0.08663,0.86212,0.46508,-0.20111,0.72664,0.6717,-0.14429,0.46634,0.8831,-0.0516,0.24751,0.96704,-0.05972,-0.05194,0.99856,-0.01357,-0.25019,0.96137,-0.11479,-0.48033,0.871,-0.10318,-0.66231,0.7435,-0.09245,-0.84154,0.52984,-0.10528,-0.9675,0.24177,-0.07406,-0.98965,0.03068,-0.14018,-0.93537,-0.34655,-0.07057,-0.87924,-0.44773,-0.16269,-0.7,-0.70738,-0.09804,-0.4174,-0.90821,-0.03073,-0.23939,-0.96985,-0.04567,0.01541,-0.99983,0.00994,0.2032,-0.97902,-0.01503,0.48433,-0.87427,-0.03279,0.68212,-0.7285,-0.06321,0.84771,-0.5252,-0.07451,0.9818,-0.18767,-0.02901,0.99507,-0.03874,-0.09134,0.99614,-0.03382,-0.08098,0.96919,0.22699,-0.09561,0.83801,0.54193,-0.06357,0.63107,0.77552,0.018,0.48974,0.87001,-0.05684,0.2096,0.9769,-0.04169,0.05195,0.99491,-0.0863,-0.22819,0.96869,-0.09781,-0.53571,0.84257,-0.05559,-0.66475,0.74421,-0.06528,-0.84598,0.53161,-0.04131,-0.9301,0.34906,-0.11431,-0.99819,0.00045,-0.06006,-0.94467,-0.32772,-0.01417,-0.8541,-0.52003,0.00914,-0.65616,-0.7516,0.06744,-0.50712,-0.8614,-0.02868,-0.23262,-0.97243,-0.01649,0.02773,-0.99923,0.02793,0.22602,-0.97359,0.03206,0.51631,-0.8545,0.05699,0.66368,-0.74801,0.00394,0.86045,-0.50948,0.00807,0.95145,-0.29573,-0.08535,0.99614,-0.03382,-0.08098,0.99862,0.0133,0.05075,0.96961,0.24466,-0.00126,0.8109,0.58514,0.00702,0.72537,0.68027,-0.10522,0.47711,0.87644,-0.0649,0.20904,0.97791,0.00185,0.0611,0.99582,-0.06796,-0.29294,0.9561,-0.00717,-0.46119,0.88045,-0.11001,-0.69461,0.71611,-0.06859,-0.83781,0.54595,0.00511,-0.94778,0.31865,0.01333,-0.98727,-0.08989,0.13123,-0.96087,-0.27171,0.05381,-0.85727,-0.51097,0.06321,-0.73333,-0.67987,0.00383,-0.48102,-0.87381,0.0713,-0.16573,-0.97272,0.16234,0.01239,-0.99189,0.12651,0.22084,-0.97278,0.07018,0.46594,-0.88458,0.02037,0.67924,-0.7338,0.0135,0.85934,-0.5041,0.0861,0.95725,-0.28331,0.05837,0.99862,0.0133,0.05075,0.98162,-0.06123,0.18077,0.94934,0.25709,0.18074,0.82908,0.53696,0.15587,0.71034,0.70097,0.06367,0.35519,0.93403,0.0377,0.30775,0.9459,-0.10276,0.04423,0.99789,-0.04751,-0.22264,0.9749,0.00198,-0.48032,0.87556,0.05195,-0.7497,0.64664,0.14075,-0.82919,0.55025,0.09831,-0.94652,0.26359,0.18606,-0.97931,-0.00319,0.20233,-0.94713,-0.23991,0.21306,-0.83391,-0.4846,0.26413,-0.69174,-0.67882,0.24639,-0.37076,-0.88212,0.29053,-0.23296,-0.95686,0.17361,-0.06331,-0.98735,0.14536,0.19863,-0.95521,0.21938,0.46311,-0.84794,0.25793,0.72114,-0.62842,0.29164,0.83319,-0.53172,0.15187,0.94205,-0.27886,0.18647,0.98162,-0.06123,0.18077,0.90922,-0.01552,0.41603,0.86931,0.30513,0.38883,0.85292,0.43994,0.28105,0.71833,0.67513,0.1679,0.45178,0.89086,0.04751,0.32226,0.94291,-0.08413,-0.08312,0.99654,-0.00204,-0.24558,0.9693,-0.01211,-0.50736,0.85523,0.10563,-0.70028,0.69328,0.17021,-0.80782,0.57165,0.1437,-0.92112,0.2199,0.3212,-0.93881,-0.00757,0.34434,-0.85995,-0.27204,0.43183,-0.81352,-0.42226,0.39986,-0.65997,-0.63583,0.40019,-0.43463,-0.81875,0.37517,-0.28214,-0.91546,0.28692,0.04271,-0.93536,0.35111,0.25308,-0.88939,0.38069,0.45347,-0.80842,0.37526,0.61103,-0.69294,0.38273,0.78657,-0.52764,0.32078,0.88305,-0.14843,0.44519,0.90922,-0.01552,0.41603,0.89478,-0.04258,0.44448,0.87429,0.28815,0.39063,0.87853,0.38853,0.2779,0.67117,0.71688,0.18874,0.51877,0.85294,0.05812,0.34656,0.93787,-0.0172,-0.05719,0.99835,-0.00503,-0.22208,0.97019,-0.09702,-0.57775,0.81513,0.04204,-0.69827,0.71401,0.05121,-0.81564,0.50297,0.28591,-0.86515,0.20037,0.45975,-0.87737,-0.00041,0.47981,-0.82381,-0.23857,0.51422,-0.80865,-0.38076,0.44844,-0.5699,-0.6291,0.52863,-0.44557,-0.75357,0.48333,-0.24655,-0.8166,0.5219,-0.01091,-0.86834,0.49585,0.19911,-0.87321,0.44481,0.47992,-0.73315,0.48183,0.60677,-0.5926,0.52977,0.73161,-0.35995,0.57895,0.82807,-0.20683,0.52108,0.89478,-0.04258,0.44448,0.85847,0.02996,0.51199,0.86467,0.23577,0.44357,0.87181,0.35396,0.33862,0.66598,0.72594,0.1717,0.59092,0.8066,-0.0148,0.24049,0.97041,-0.02156,-0.00239,0.99599,-0.08947,-0.1998,0.97734,-0.06996,-0.55201,0.82917,0.08813,-0.729,0.66772,0.15068,-0.82947,0.3392,0.44376,-0.87508,0.20581,0.43804,-0.85495,0.01212,0.51858,-0.80748,-0.14806,0.57101,-0.74637,-0.32893,0.57857,-0.53809,-0.55146,0.63745,-0.46617,-0.70736,0.53135,-0.16624,-0.78583,0.59569,-0.03891,-0.81546,0.5775,0.21945,-0.74802,0.62634,0.43352,-0.64173,0.63265,0.57682,-0.57927,0.57596,0.74453,-0.32306,0.58422,0.81179,-0.24103,0.53188,0.85847,0.02996,0.51199,0.82728,0.07169,0.55719,0.88269,0.17539,0.43601,0.81241,0.38567,0.43733,0.69621,0.62356,0.35561,0.63812,0.75737,0.13853,0.23048,0.96758,0.10333,0.06202,0.98931,-0.13202,-0.34321,0.93774,0.05343,-0.57528,0.79835,0.178,-0.70864,0.5829,0.39756,-0.80962,0.40455,0.42526,-0.87133,0.26358,0.41389,-0.8027,-0.052,0.59411,-0.78416,-0.15493,0.60091,-0.65331,-0.32169,0.68535,-0.54533,-0.43422,0.71698,-0.44215,-0.57288,0.69015,-0.19296,-0.7096,0.67767,-0.01083,-0.76168,0.64786,0.28587,-0.68205,0.67312,0.40183,-0.63848,0.65641,0.55339,-0.46746,0.68938,0.67269,-0.31439,0.66981,0.75226,-0.22235,0.62021,0.82728,0.07169,0.55719,0.76905,0.03141,0.63841,0.83678,0.17054,0.5203,0.76141,0.4206,0.4933,0.73634,0.54449,0.40165,0.559,0.74123,0.3716,0.30369,0.89649,0.32261,0.09026,0.987,0.13297,-0.38033,0.89401,0.23684,-0.61161,0.73187,0.30051,-0.72804,0.52833,0.43684,-0.77788,0.43006,0.4582,-0.76961,0.19378,0.60839,-0.75259,-0.0247,0.65802,-0.77702,-0.12478,0.61699,-0.5901,-0.33721,0.73353,-0.52616,-0.42122,0.73874,-0.40133,-0.4567,0.79395,-0.2464,-0.56586,0.78683,-0.0074,-0.61409,0.7892,0.241,-0.59454,0.7671,0.39424,-0.52141,0.75678,0.53672,-0.37778,0.75446,0.62022,-0.31073,0.72026,0.68606,-0.1786,0.70528,0.76905,0.03141,0.63841,0.70346,0.00369,0.71072,0.76358,0.14313,0.62965,0.77186,0.39506,0.49815,0.69497,0.53996,0.47482,0.5201,0.70946,0.47557,0.34434,0.81605,0.46421,0.06428,0.86547,0.49682,-0.33781,0.82789,0.44776,-0.58576,0.70299,0.40335,-0.72849,0.54864,0.41023,-0.77026,0.3526,0.53138,-0.73965,0.16061,0.65355,-0.72188,0.01528,0.69185,-0.67945,-0.09999,0.72688,-0.55293,-0.28685,0.7823,-0.47123,-0.38914,0.79153,-0.32037,-0.40656,0.85561,-0.1681,-0.42613,0.88891,-0.02137,-0.44942,0.89307,0.16419,-0.44221,0.88175,0.32492,-0.39976,0.8571,0.47754,-0.3498,0.80597,0.5681,-0.25708,0.78177,0.64085,-0.14435,0.75398,0.70346,0.00369,0.71072,0.60557,-0.00178,0.79579,0.67409,0.12387,0.72819,0.6409,0.36365,0.67602,0.58441,0.48552,0.65019,0.4474,0.65844,0.60522,0.2376,0.70026,0.67319,0.08971,0.72742,0.68031,-0.23407,0.72435,0.64849,-0.46303,0.63595,0.61739,-0.60354,0.45457,0.65506,-0.67897,0.3078,0.66653,-0.64297,0.12635,0.75539,-0.59933,0.00872,0.80046,-0.54874,-0.06818,0.83321,-0.45226,-0.18748,0.87196,-0.34374,-0.29149,0.89268,-0.19682,-0.32118,0.92634,-0.13264,-0.33069,0.93437,-0.00188,-0.32993,0.944,0.11031,-0.33034,0.93739,0.20701,-0.32315,0.92343,0.36148,-0.26362,0.89433,0.46404,-0.20409,0.86198,0.55849,-0.09974,0.82349,0.60557,-0.00178,0.79579,0.39961,-0.00813,0.91665,0.42532,0.07776,0.9017,0.397,0.22137,0.89072,0.38891,0.29735,0.87197,0.24186,0.41885,0.87525,0.15678,0.45265,0.8778,0.03981,0.46422,0.88483,-0.14526,0.39964,0.90509,-0.25636,0.36713,0.89414,-0.35465,0.28067,0.89188,-0.43617,0.21673,0.87338,-0.42371,0.06203,0.90367,-0.43231,0.01316,0.90163,-0.38982,-0.05459,0.91927,-0.35289,-0.12365,0.92746,-0.25753,-0.21243,0.94263,-0.15796,-0.26688,0.9507,-0.09063,-0.27404,0.95744,-0.01463,-0.29161,0.95643,0.08916,-0.28021,0.95579,0.17609,-0.24749,0.95275,0.26737,-0.19577,0.9435,0.32766,-0.15073,0.9327,0.40146,-0.05496,0.91423,0.39961,-0.00813,0.91665,0.27896,-0.00301,0.9603,0.25715,0.04005,0.96554,0.24227,0.09776,0.96527,0.20487,0.14177,0.96847,0.13773,0.1952,0.97105,0.09324,0.22027,0.97097,-0.01377,0.22206,0.97494,-0.08812,0.222,0.97106,-0.13349,0.19337,0.972,-0.20457,0.1495,0.96737,-0.23701,0.09872,0.96648,-0.27067,0.04182,0.96176,-0.27618,0.00412,0.9611,-0.27377,-0.03805,0.96104,-0.24616,-0.09535,0.96453,-0.20466,-0.15921,0.9658,-0.15033,-0.20863,0.96637,-0.09238,-0.2439,0.96539,-0.00245,-0.24592,0.96929,0.09244,-0.23789,0.96688,0.15564,-0.20482,0.96635,0.21519,-0.16001,0.96338,0.24752,-0.10498,0.96318,0.26926,-0.02931,0.96262,0.27896,-0.00301,0.9603,0.19992,0.00229,0.97981,0.15638,0.01408,0.9876,0.15116,0.03018,0.98805,0.16455,0.05144,0.98503,0.13025,0.08286,0.98801,0.12331,0.12191,0.98485,-0.03222,0.15116,0.98798,-0.07629,0.10368,0.99168,-0.1361,0.08562,0.98699,-0.1353,0.0505,0.98952,-0.15133,0.0302,0.98802,-0.14971,0.01285,0.98865,-0.15449,0.00033,0.98799,-0.15524,-0.01519,0.98776,-0.15785,-0.03408,0.98688,-0.16515,-0.05895,0.9845,-0.1548,-0.09494,0.98337,-0.12358,-0.14343,0.98191,0.02198,-0.17584,0.98417,0.08916,-0.12294,0.9884,0.14147,-0.1,0.98488,0.1493,-0.05363,0.98734,0.15325,-0.03199,0.98767,0.15748,-0.00768,0.98749,0.19992,0.00229,0.97981],"uv":[0.0,0.0,0.04167,0.0,0.08333,0.0,0.125,0.0,0.16667,0.0,0.20833,0.0,0.25,0.0,0.29167,0.0,0.33333,0.0,0.375,0.0,0.41667,0.0,0.45833,0.0,0.5,0.0,0.54167,0.0,0.58333,0.0,0.625,0.0,0.66667,0.0,0.70833,0.0,0.75,0.0,0.79167,0.0,0.83333,0.0,0.875,0.0,0.91667,0.0,0.95833,0.0,1.0,0.0,0.0,0.05,0.04167,0.05,0.08333,0.05,0.125,0.05,0.16667,0.05,0.20833,0.05,0.25,0.05,0.29167,0.05,0.33333,0.05,0.375,0.05,0.41667,0.05,0.45833,0.05,0.5,0.05,0.54167,0.05,0.58333,0.05,0.625,0.05,0.66667,0.05,0.70833,0.05,0.75,0.05,0.79167,0.05,0.83333,0.05,0.875,0.05,0.91667,0.05,0.95833,0.05,1.0,0.05,0.0,0.1,0.04167,0.1,0.08333,0.1,0.125,0.1,0.16667,0.1,0.20833,0.1,0.25,0.1,0.29167,0.1,0.33333,0.1,0.375,0.1,0.41667,0.1,0.45833,0.1,0.5,0.1,0.54167,0.1,0.58333,0.1,0.625,0.1,0.66667,0.1,0.70833,0.1,0.75,0.1,0.79167,0.1,0.83333,0.1,0.875,0.1,0.91667,0.1,0.95833,0.1,1.0,0.1,0.0,0.15,0.04167,0.15,0.08333,0.15,0.125,0.15,0.16667,0.15,0.20833,0.15,0.25,0.15,0.29167,0.15,0.33333,0.15,0.375,0.15,0.41667,0.15,0.45833,0.15,0.5,0.15,0.54167,0.15,0.58333,0.15,0.625,0.15,0.66667,0.15,0.70833,0.15,0.75,0.15,0.79167,0.15,0.83333,0.15,0.875,0.15,0.91667,0.15,0.95833,0.15,1.0,0.15,0.0,0.2,0.04167,0.2,0.08333,0.2,0.125,0.2,0.16667,0.2,0.20833,0.2,0.25,0.2,0.29167,0.2,0.33333,0.2,0.375,0.2,0.41667,0.2,0.45833,0.2,0.5,0.2,0.54167,0.2,0.58333,0.2,0.625,0.2,0.66667,0.2,0.70833,0.2,0.75,0.2,0.79167,0.2,0.83333,0.2,0.875,0.2,0.91667,0.2,0.95833,0.2,1.0,0.2,0.0,0.25,0.04167,0.25,0.08333,0.25,0.125,0.25,0.16667,0.25,0.20833,0.25,0.25,0.25,0.29167,0.25,0.33333,0.25,0.375,0.25,0.41667,0.25,0.45833,0.25,0.5,0.25,0.54167,0.25,0.58333,0.25,0.625,0.25,0.66667,0.25,0.70833,0.25,0.75,0.25,0.79167,0.25,0.83333,0.25,0.875,0.25,0.91667,0.25,0.95833,0.25,1.0,0.25,0.0,0.3,0.04167,0.3,0.08333,0.3,0.125,0.3,0.16667,0.3,0.20833,0.3,0.25,0.3,0.29167,0.3,0.33333,0.3,0.375,0.3,0.41667,0.3,0.45833,0.3,0.5,0.3,0.54167,0.3,0.58333,0.3,0.625,0.3,0.66667,0.3,0.70833,0.3,0.75,0.3,0.79167,0.3,0.83333,0.3,0.875,0.3,0.91667,0.3,0.95833,0.3,1.0,0.3,0.0,0.35,0.04167,0.35,0.08333,0.35,0.125,0.35,0.16667,0.35,0.20833,0.35,0.25,0.35,0.29167,0.35,0.33333,0.35,0.375,0.35,0.41667,0.35,0.45833,0.35,0.5,0.35,0.54167,0.35,0.58333,0.35,0.625,0.35,0.66667,0.35,0.70833,0.35,0.75,0.35,0.79167,0.35,0.83333,0.35,0.875,0.35,0.91667,0.35,0.95833,0.35,1.0,0.35,0.0,0.4,0.04167,0.4,0.08333,0.4,0.125,0.4,0.16667,0.4,0.20833,0.4,0.25,0.4,0.29167,0.4,0.33333,0.4,0.375,0.4,0.41667,0.4,0.45833,0.4,0.5,0.4,0.54167,0.4,0.58333,0.4,0.625,0.4,0.66667,0.4,0.70833,0.4,0.75,0.4,0.79167,0.4,0.83333,0.4,0.875,0.4,0.91667,0.4,0.95833,0.4,1.0,0.4,0.0,0.45,0.04167,0.45,0.08333,0.45,0.125,0.45,0.16667,0.45,0.20833,0.45,0.25,0.45,0.29167,0.45,0.33333,0.45,0.375,0.45,0.41667,0.45,0.45833,0.45,0.5,0.45,0.54167,0.45,0.58333,0.45,0.625,0.45,0.66667,0.45,0.70833,0.45,0.75,0.45,0.79167,0.45,0.83333,0.45,0.875,0.45,0.91667,0.45,0.95833,0.45,1.0,0.45,0.0,0.5,0.04167,0.5,0.08333,0.5,0.125,0.5,0.16667,0.5,0.20833,0.5,0.25,0.5,0.29167,0.5,0.33333,0.5,0.375,0.5,0.41667,0.5,0.45833,0.5,0.5,0.5,0.54167,0.5,0.58333,0.5,0.625,0.5,0.66667,0.5,0.70833,0.5,0.75,0.5,0.79167,0.5,0.83333,0.5,0.875,0.5,0.91667,0.5,0.95833,0.5,1.0,0.5,0.0,0.55,0.04167,0.55,0.08333,0.55,0.125,0.55,0.16667,0.55,0.20833,0.55,0.25,0.55,0.29167,0.55,0.33333,0.55,0.375,0.55,0.41667,0.55,0.45833,0.55,0.5,0.55,0.54167,0.55,0.58333,0.55,0.625,0.55,0.66667,0.55,0.70833,0.55,0.75,0.55,0.79167,0.55,0.83333,0.55,0.875,0.55,0.91667,0.55,0.95833,0.55,1.0,0.55,0.0,0.6,0.04167,0.6,0.08333,0.6,0.125,0.6,0.16667,0.6,0.20833,0.6,0.25,0.6,0.29167,0.6,0.33333,0.6,0.375,0.6,0.41667,0.6,0.45833,0.6,0.5,0.6,0.54167,0.6,0.58333,0.6,0.625,0.6,0.66667,0.6,0.70833,0.6,0.75,0.6,0.79167,0.6,0.83333,0.6,0.875,0.6,0.91667,0.6,0.95833,0.6,1.0,0.6,0.0,0.65,0.04167,0.65,0.08333,0.65,0.125,0.65,0.16667,0.65,0.20833,0.65,0.25,0.65,0.29167,0.65,0.33333,0.65,0.375,0.65,0.41667,0.65,0.45833,0.65,0.5,0.65,0.54167,0.65,0.58333,0.65,0.625,0.65,0.66667,0.65,0.70833,0.65,0.75,0.65,0.79167,0.65,0.83333,0.65,0.875,0.65,0.91667,0.65,0.95833,0.65,1.0,0.65,0.0,0.7,0.04167,0.7,0.08333,0.7,0.125,0.7,0.16667,0.7,0.20833,0.7,0.25,0.7,0.29167,0.7,0.33333,0.7,0.375,0.7,0.41667,0.7,0.45833,0.7,0.5,0.7,0.54167,0.7,0.58333,0.7,0.625,0.7,0.66667,0.7,0.70833,0.7,0.75,0.7,0.79167,0.7,0.83333,0.7,0.875,0.7,0.91667,0.7,0.95833,0.7,1.0,0.7,0.0,0.75,0.04167,0.75,0.08333,0.75,0.125,0.75,0.16667,0.75,0.20833,0.75,0.25,0.75,0.29167,0.75,0.33333,0.75,0.375,0.75,0.41667,0.75,0.45833,0.75,0.5,0.75,0.54167,0.75,0.58333,0.75,0.625,0.75,0.66667,0.75,0.70833,0.75,0.75,0.75,0.79167,0.75,0.83333,0.75,0.875,0.75,0.91667,0.75,0.95833,0.75,1.0,0.75,0.0,0.8,0.04167,0.8,0.08333,0.8,0.125,0.8,0.16667,0.8,0.20833,0.8,0.25,0.8,0.29167,0.8,0.33333,0.8,0.375,0.8,0.41667,0.8,0.45833,0.8,0.5,0.8,0.54167,0.8,0.58333,0.8,0.625,0.8,0.66667,0.8,0.70833,0.8,0.75,0.8,0.79167,0.8,0.83333,0.8,0.875,0.8,0.91667,0.8,0.95833,0.8,1.0,0.8,0.0,0.85,0.04167,0.85,0.08333,0.85,0.125,0.85,0.16667,0.85,0.20833,0.85,0.25,0.85,0.29167,0.85,0.33333,0.85,0.375,0.85,0.41667,0.85,0.45833,0.85,0.5,0.85,0.54167,0.85,0.58333,0.85,0.625,0.85,0.66667,0.85,0.70833,0.85,0.75,0.85,0.79167,0.85,0.83333,0.85,0.875,0.85,0.91667,0.85,0.95833,0.85,1.0,0.85,0.0,0.9,0.04167,0.9,0.08333,0.9,0.125,0.9,0.16667,0.9,0.20833,0.9,0.25,0.9,0.29167,0.9,0.33333,0.9,0.375,0.9,0.41667,0.9,0.45833,0.9,0.5,0.9,0.54167,0.9,0.58333,0.9,0.625,0.9,0.66667,0.9,0.70833,0.9,0.75,0.9,0.79167,0.9,0.83333,0.9,0.875,0.9,0.91667,0.9,0.95833,0.9,1.0,0.9,0.0,0.95,0.04167,0.95,0.08333,0.95,0.125,0.95,0.16667,0.95,0.20833,0.95,0.25,0.95,0.29167,0.95,0.33333,0.95,0.375,0.95,0.41667,0.95,0.45833,0.95,0.5,0.95,0.54167,0.95,0.58333,0.95,0.625,0.95,0.66667,0.95,0.70833,0.95,0.75,0.95,0.79167,0.95,0.83333,0.95,0.875,0.95,0.91667,0.95,0.95833,0.95,1.0,0.95,0.0,1.0,0.04167,1.0,0.08333,1.0,0.125,1.0,0.16667,1.0,0.20833,1.0,0.25,1.0,0.29167,1.0,0.33333,1.0,0.375,1.0,0.41667,1.0,0.45833,1.0,0.5,1.0,0.54167,1.0,0.58333,1.0,0.625,1.0,0.66667,1.0,0.70833,1.0,0.75,1.0,0.79167,1.0,0.83333,1.0,0.875,1.0,0.91667,1.0,0.95833,1.0,1.0,1.0],"index":[0,1,25,1,26,25,1,2,26,2,27,26,2,3,27,3,28,27,3,4,28,4,29,28,4,5,29,5,30,29,5,6,30,6,31,30,6,7,31,7,32,31,7,8,32,8,33,32,8,9,33,9,34,33,9,10,34,10,35,34,10,11,35,11,36,35,11,12,36,12,37,36,12,13,37,13,38,37,13,14,38,14,39,38,14,15,39,15,40,39,15,16,40,16,41,40,16,17,41,17,42,41,17,18,42,18,43,42,18,19,43,19,44,43,19,20,44,20,45,44,20,21,45,21,46,45,21,22,46,22,47,46,22,23,47,23,48,47,23,24,48,24,49,48,25,26,50,26,51,50,26,27,51,27,52,51,27,28,52,28,53,52,28,29,53,29,54,53,29,30,54,30,55,54,30,31,55,31,56,55,31,32,56,32,57,56,32,33,57,33,58,57,33,34,58,34,59,58,34,35,59,35,60,59,35,36,60,36,61,60,36,37,61,37,62,61,37,38,62,38,63,62,38,39,63,39,64,63,39,40,64,40,65,64,40,41,65,41,66,65,41,42,66,42,67,66,42,43,67,43,68,67,43,44,68,44,69,68,44,45,69,45,70,69,45,46,70,46,71,70,46,47,71,47,72,71,47,48,72,48,73,72,48,49,73,49,74,73,50,51,75,51,76,75,51,52,76,52,77,76,52,53,77,53,78,77,53,54,78,54,79,78,54,55,79,55,80,79,55,56,80,56,81,80,56,57,81,57,82,81,57,58,82,58,83,82,58,59,83,59,84,83,59,60,84,60,85,84,60,61,85,61,86,85,61,62,86,62,87,86,62,63,87,63,88,87,63,64,88,64,89,88,64,65,89,65,90,89,65,66,90,66,91,90,66,67,91,67,92,91,67,68,92,68,93,92,68,69,93,69,94,93,69,70,94,70,95,94,70,71,95,71,96,95,71,72,96,72,97,96,72,73,97,73,98,97,73,74,98,74,99,98,75,76,100,76,101,100,76,77,101,77,102,101,77,78,102,78,103,102,78,79,103,79,104,103,79,80,104,80,105,104,80,81,105,81,106,105,81,82,106,82,107,106,82,83,107,83,108,107,83,84,108,84,109,108,84,85,109,85,110,109,85,86,110,86,111,110,86,87,111,87,112,111,87,88,112,88,113,112,88,89,113,89,114,113,89,90,114,90,115,114,90,91,115,91,116,115,91,92,116,92,117,116,92,93,117,93,118,117,93,94,118,94,119,118,94,95,119,95,120,119,95,96,120,96,121,120,96,97,121,97,122,121,97,98,122,98,123,122,98,99,123,99,124,123,100,101,125,101,126,125,101,102,126,102,127,126,102,103,127,103,128,127,103,104,128,104,129,128,104,105,129,105,130,129,105,106,130,106,131,130,106,107,131,107,132,131,107,108,132,108,133,132,108,109,133,109,134,133,109,110,134,110,135,134,110,111,135,111,136,135,111,112,136,112,137,136,112,113,137,113,138,137,113,114,138,114,139,138,114,115,139,115,140,139,115,116,140,116,141,140,116,117,141,117,142,141,117,118,142,118,143,142,118,119,143,119,144,143,119,120,144,120,145,144,120,121,145,121,146,145,121,122,146,122,147,146,122,123,147,123,148,147,123,124,148,124,149,148,125,126,150,126,151,150,126,127,151,127,152,151,127,128,152,128,153,152,128,129,153,129,154,153,129,130,154,130,155,154,130,131,155,131,156,155,131,132,156,132,157,156,132,133,157,133,158,157,133,134,158,134,159,158,134,135,159,135,160,159,135,136,160,136,161,160,136,137,161,137,162,161,137,138,162,138,163,162,138,139,163,139,164,163,139,140,164,140,165,164,140,141,165,141,166,165,141,142,166,142,167,166,142,143,167,143,168,167,143,144,168,144,169,168,144,145,169,145,170,169,145,146,170,146,171,170,146,147,171,147,172,171,147,148,172,148,173,172,148,149,173,149,174,173,150,151,175,151,176,175,151,152,176,152,177,176,152,153,177,153,178,177,153,154,178,154,179,178,154,155,179,155,180,179,155,156,180,156,181,180,156,157,181,157,182,181,157,158,182,158,183,182,158,159,183,159,184,183,159,160,184,160,185,184,160,161,185,161,186,185,161,162,186,162,187,186,162,163,187,163,188,187,163,164,188,164,189,188,164,165,189,165,190,189,165,166,190,166,191,190,166,167,191,167,192,191,167,168,192,168,193,192,168,169,193,169,194,193,169,170,194,170,195,194,170,171,195,171,196,195,171,172,196,172,197,196,172,173,197,173,198,197,173,174,198,174,199,198,175,176,200,176,201,200,176,177,201,177,202,201,177,178,202,178,203,202,178,179,203,179,204,203,179,180,204,180,205,204,180,181,205,181,206,205,181,182,206,182,207,206,182,183,207,183,208,207,183,184,208,184,209,208,184,185,209,185,210,209,185,186,210,186,211,210,186,187,211,187,212,211,187,188,212,188,213,212,188,189,213,189,214,213,189,190,214,190,215,214,190,191,215,191,216,215,191,192,216,192,217,216,192,193,217,193,218,217,193,194,218,194,219,218,194,195,219,195,220,219,195,196,220,196,221,220,196,197,221,197,222,221,197,198,222,198,223,222,198,199,223,199,224,223,200,201,225,201,226,225,201,202,226,202,227,226,202,203,227,203,228,227,203,204,228,204,229,228,204,205,229,205,230,229,205,206,230,206,231,230,206,207,231,207,232,231,207,208,232,208,233,232,208,209,233,209,234,233,209,210,234,210,235,234,210,211,235,211,236,235,211,212,236,212,237,236,212,213,237,213,238,237,213,214,238,214,239,238,214,215,239,215,240,239,215,216,240,216,241,240,216,217,241,217,242,241,217,218,242,218,243,242,218,219,243,219,244,243,219,220,244,220,245,244,220,221,245,221,246,245,221,222,246,222,247,246,222,223,247,223,248,247,223,224,248,224,249,248,225,226,250,226,251,250,226,227,251,227,252,251,227,228,252,228,253,252,228,229,253,229,254,253,229,230,254,230,255,254,230,231,255,231,256,255,231,232,256,232,257,256,232,233,257,233,258,257,233,234,258,234,259,258,234,235,259,235,260,259,235,236,260,236,261,260,236,237,261,237,262,261,237,238,262,238,263,262,238,239,263,239,264,263,239,240,264,240,265,264,240,241,265,241,266,265,241,242,266,242,267,266,242,243,267,243,268,267,243,244,268,244,269,268,244,245,269,245,270,269,245,246,270,246,271,270,246,247,271,247,272,271,247,248,272,248,273,272,248,249,273,249,274,273,250,251,275,251,276,275,251,252,276,252,277,276,252,253,277,253,278,277,253,254,278,254,279,278,254,255,279,255,280,279,255,256,280,256,281,280,256,257,281,257,282,281,257,258,282,258,283,282,258,259,283,259,284,283,259,260,284,260,285,284,260,261,285,261,286,285,261,262,286,262,287,286,262,263,287,263,288,287,263,264,288,264,289,288,264,265,289,265,290,289,265,266,290,266,291,290,266,267,291,267,292,291,267,268,292,268,293,292,268,269,293,269,294,293,269,270,294,270,295,294,270,271,295,271,296,295,271,272,296,272,297,296,272,273,297,273,298,297,273,274,298,274,299,298,275,276,300,276,301,300,276,277,301,277,302,301,277,278,302,278,303,302,278,279,303,279,304,303,279,280,304,280,305,304,280,281,305,281,306,305,281,282,306,282,307,306,282,283,307,283,308,307,283,284,308,284,309,308,284,285,309,285,310,309,285,286,310,286,311,310,286,287,311,287,312,311,287,288,312,288,313,312,288,289,313,289,314,313,289,290,314,290,315,314,290,291,315,291,316,315,291,292,316,292,317,316,292,293,317,293,318,317,293,294,318,294,319,318,294,295,319,295,320,319,295,296,320,296,321,320,296,297,321,297,322,321,297,298,322,298,323,322,298,299,323,299,324,323,300,301,325,301,326,325,301,302,326,302,327,326,302,303,327,303,328,327,303,304,328,304,329,328,304,305,329,305,330,329,305,306,330,306,331,330,306,307,331,307,332,331,307,308,332,308,333,332,308,309,333,309,334,333,309,310,334,310,335,334,310,311,335,311,336,335,311,312,336,312,337,336,312,313,337,313,338,337,313,314,338,314,339,338,314,315,339,315,340,339,315,316,340,316,341,340,316,317,341,317,342,341,317,318,342,318,343,342,318,319,343,319,344,343,319,320,344,320,345,344,320,321,345,321,346,345,321,322,346,322,347,346,322,323,347,323,348,347,323,324,348,324,349,348,325,326,350,326,351,350,326,327,351,327,352,351,327,328,352,328,353,352,328,329,353,329,354,353,329,330,354,330,355,354,330,331,355,331,356,355,331,332,356,332,357,356,332,333,357,333,358,357,333,334,358,334,359,358,334,335,359,335,360,359,335,336,360,336,361,360,336,337,361,337,362,361,337,338,362,338,363,362,338,339,363,339,364,363,339,340,364,340,365,364,340,341,365,341,366,365,341,342,366,342,367,366,342,343,367,343,368,367,343,344,368,344,369,368,344,345,369,345,370,369,345,346,370,346,371,370,346,347,371,347,372,371,347,348,372,348,373,372,348,349,373,349,374,373,350,351,375,351,376,375,351,352,376,352,377,376,352,353,377,353,378,377,353,354,378,354,379,378,354,355,379,355,380,379,355,356,380,356,381,380,356,357,381,357,382,381,357,358,382,358,383,382,358,359,383,359,384,383,359,360,384,360,385,384,360,361,385,361,386,385,361,362,386,362,387,386,362,363,387,363,388,387,363,364,388,364,389,388,364,365,389,365,390,389,365,366,390,366,391,390,366,367,391,367,392,391,367,368,392,368,393,392,368,369,393,369,394,393,369,370,394,370,395,394,370,371,395,371,396,395,371,372,396,372,397,396,372,373,397,373,398,397,373,374,398,374,399,398,375,376,400,376,401,400,376,377,401,377,402,401,377,378,402,378,403,402,378,379,403,379,404,403,379,380,404,380,405,404,380,381,405,381,406,405,381,382,406,382,407,406,382,383,407,383,408,407,383,384,408,384,409,408,384,385,409,385,410,409,385,386,410,386,411,410,386,387,411,387,412,411,387,388,412,388,413,412,388,389,413,389,414,413,389,390,414,390,415,414,390,391,415,391,416,415,391,392,416,392,417,416,392,393,417,393,418,417,393,394,418,394,419,418,394,395,419,395,420,419,395,396,420,396,421,420,396,397,421,397,422,421,397,398,422,398,423,422,398,399,423,399,424,423,400,401,425,401,426,425,401,402,426,402,427,426,402,403,427,403,428,427,403,404,428,404,429,428,404,405,429,405,430,429,405,406,430,406,431,430,406,407,431,407,432,431,407,408,432,408,433,432,408,409,433,409,434,433,409,410,434,410,435,434,410,411,435,411,436,435,411,412,436,412,437,436,412,413,437,413,438,437,413,414,438,414,439,438,414,415,439,415,440,439,415,416,440,416,441,440,416,417,441,417,442,441,417,418,442,418,443,442,418,419,443,419,444,443,419,420,444,420,445,444,420,421,445,421,446,445,421,422,446,422,447,446,422,423,447,423,448,447,423,424,448,424,449,448,425,426,450,426,451,450,426,427,451,427,452,451,427,428,452,428,453,452,428,429,453,429,454,453,429,430,454,430,455,454,430,431,455,431,456,455,431,432,456,432,457,456,432,433,457,433,458,457,433,434,458,434,459,458,434,435,459,435,460,459,435,436,460,436,461,460,436,437,461,437,462,461,437,438,462,438,463,462,438,439,463,439,464,463,439,440,464,440,465,464,440,441,465,441,466,465,441,442,466,442,467,466,442,443,467,443,468,467,443,444,468,444,469,468,444,445,469,445,470,469,445,446,470,446,471,470,446,447,471,447,472,471,447,448,472,448,473,472,448,449,473,449,474,473,450,451,475,451,476,475,451,452,476,452,477,476,452,453,477,453,478,477,453,454,478,454,479,478,454,455,479,455,480,479,455,456,480,456,481,480,456,457,481,457,482,481,457,458,482,458,483,482,458,459,483,459,484,483,459,460,484,460,485,484,460,461,485,461,486,485,461,462,486,462,487,486,462,463,487,463,488,487,463,464,488,464,489,488,464,465,489,465,490,489,465,466,490,466,491,490,466,467,491,467,492,491,467,468,492,468,493,492,468,469,493,469,494,493,469,470,494,470,495,494,470,471,495,471,496,495,471,472,496,472,497,496,472,473,497,473,498,497,473,474,498,474,499,498,475,476,500,476,501,500,476,477,501,477,502,501,477,478,502,478,503,502,478,479,503,479,504,503,479,480,504,480,505,504,480,481,505,481,506,505,481,482,506,482,507,506,482,483,507,483,508,507,483,484,508,484,509,508,484,485,509,485,510,509,485,486,510,486,511,510,486,487,511,487,512,511,487,488,512,488,513,512,488,489,513,489,514,513,489,490,514,490,515,514,490,491,515,491,516,515,491,492,516,492,517,516,492,493,517,493,518,517,493,494,518,494,519,518,494,495,519,495,520,519,495,496,520,496,521,520,496,497,521,497,522,521,497,498,522,498,523,522,498,499,523,499,524,523,0,2,1,500,501,502,0,3,2,500,502,503,0,4,3,500,503,504,0,5,4,500,504,505,0,6,5,500,505,506,0,7,6,500,506,507,0,8,7,500,507,508,0,9,8,500,508,509,0,10,9,500,509,510,0,11,10,500,510,511,0,12,11,500,511,512,0,13,12,500,512,513,0,14,13,500,513,514,0,15,14,500,514,515,0,16,15,500,515,516,0,17,16,500,516,517,0,18,17,500,517,518,0,19,18,500,518,519,0,20,19,500,519,520,0,21,20,500,520,521,0,22,21,500,521,522,0,23,22,500,522,523],"color":[0.93677,0.93209,0.91429,0.918,0.91341,0.89596,0.97552,0.97064,0.9521,0.92887,0.92422,0.90657,0.9491,0.94436,0.92632,0.96474,0.95992,0.94159,0.94431,0.93959,0.92165,0.9766,0.97171,0.95316,0.96496,0.96014,0.9418,0.97121,0.96636,0.9479,0.9245,0.91988,0.90232,0.97014,0.96528,0.94685,0.92397,0.91935,0.90179,0.94694,0.94221,0.92422,0.92108,0.91648,0.89898,0.90279,0.89827,0.88112,0.92477,0.92015,0.90258,0.90366,0.89914,0.88197,0.91253,0.90797,0.89063,0.87942,0.87503,0.85832,0.883,0.87858,0.8618,0.91678,0.91219,0.89477,0.88545,0.88103,0.8642,0.91554,0.91096,0.89357,0.93677,0.93209,0.91429,0.94744,0.94271,0.92471,0.92809,0.92345,0.90582,0.95655,0.95176,0.93359,0.96347,0.95865,0.94035,0.94061,0.93591,0.91804,0.98533,0.9804,0.96168,0.94288,0.93816,0.92025,0.95379,0.94902,0.9309,0.98643,0.9815,0.96276,0.97983,0.97493,0.95632,0.91533,0.91075,0.89336,0.929,0.92435,0.9067,0.90844,0.9039,0.88664,0.9418,0.93709,0.91919,0.89348,0.88901,0.87204,0.93025,0.9256,0.90792,0.87879,0.8744,0.8577,0.89382,0.88935,0.87237,0.90987,0.90532,0.88803,0.89318,0.88871,0.87174,0.925,0.92038,0.9028,0.89107,0.88662,0.86969,0.93066,0.92601,0.90833,0.91268,0.90812,0.89078,0.94744,0.94271,0.92471,0.90642,0.90189,0.88467,0.93771,0.93302,0.91521,0.90747,0.90294,0.8857,0.93911,0.93441,0.91657,0.92567,0.92105,0.90346,0.93809,0.9334,0.91558,0.95514,0.95037,0.93222,0.92066,0.91605,0.89856,0.93727,0.93258,0.91477,0.93682,0.93214,0.91434,0.89714,0.89265,0.87561,0.93153,0.92687,0.90917,0.93396,0.92929,0.91155,0.89936,0.89486,0.87777,0.91061,0.90606,0.88876,0.90433,0.89981,0.88263,0.88734,0.8829,0.86604,0.90951,0.90496,0.88768,0.87201,0.86765,0.85108,0.92286,0.91824,0.90071,0.91898,0.91439,0.89693,0.87948,0.87508,0.85837,0.93388,0.92922,0.91147,0.92997,0.92532,0.90765,0.90642,0.90189,0.88467,0.92241,0.9178,0.90028,0.93742,0.93273,0.91492,0.94818,0.94344,0.92542,0.92061,0.916,0.89851,0.94342,0.9387,0.92078,0.95098,0.94623,0.92816,0.963,0.95818,0.93989,0.95339,0.94863,0.93051,0.93373,0.92906,0.91132,0.97406,0.96919,0.95068,0.90819,0.90365,0.88639,0.92777,0.92313,0.9055,0.94387,0.93915,0.92122,0.91104,0.90649,0.88918,0.89501,0.89054,0.87353,0.90088,0.89638,0.87926,0.93528,0.9306,0.91283,0.90748,0.90294,0.8857,0.87079,0.86644,0.84989,0.89624,0.89175,0.87473,0.88496,0.88054,0.86372,0.90563,0.9011,0.88389,0.88059,0.87619,0.85946,0.9412,0.93649,0.91861,0.92241,0.9178,0.90028,0.92199,0.91738,0.89986,0.90306,0.89855,0.88139,0.93527,0.93059,0.91282,0.96522,0.9604,0.94206,0.95738,0.95259,0.9344,0.96329,0.95847,0.94017,0.9486,0.94386,0.92584,0.98438,0.97946,0.96076,0.94814,0.9434,0.92539,0.97541,0.97053,0.952,0.9198,0.91521,0.89773,0.91607,0.91149,0.89409,0.91225,0.90769,0.89035,0.91505,0.91047,0.89309,0.93021,0.92556,0.90788,0.87893,0.87454,0.85784,0.8967,0.89222,0.87518,0.89131,0.88686,0.86992,0.87075,0.8664,0.84985,0.92356,0.91894,0.9014,0.92738,0.92275,0.90513,0.88433,0.87991,0.8631,0.91884,0.91425,0.89679,0.88926,0.88481,0.86792,0.92199,0.91738,0.89986,0.89025,0.8858,0.86888,0.97236,0.96749,0.94902,0.94046,0.93576,0.91789,0.97827,0.97338,0.95479,0.94134,0.93664,0.91875,0.93024,0.92559,0.90792,0.96898,0.96414,0.94572,0.99057,0.98562,0.9668,0.98188,0.97697,0.95832,0.94046,0.93576,0.91789,0.94558,0.94085,0.92288,0.91677,0.91219,0.89477,0.94365,0.93893,0.921,0.88373,0.87931,0.86252,0.92959,0.92494,0.90728,0.89464,0.89017,0.87317,0.91976,0.91516,0.89768,0.92538,0.92076,0.90318,0.9074,0.90286,0.88562,0.91195,0.90739,0.89006,0.9174,0.91281,0.89538,0.91612,0.91154,0.89413,0.94176,0.93705,0.91915,0.90966,0.90511,0.88783,0.89025,0.8858,0.86888,0.92341,0.9188,0.90125,0.97406,0.96919,0.95068,0.91524,0.91067,0.89328,0.94855,0.9438,0.92578,0.97455,0.96968,0.95116,0.97646,0.97158,0.95302,0.95184,0.94708,0.929,0.93378,0.92911,0.91137,0.94907,0.94433,0.9263,0.95673,0.95195,0.93377,0.95763,0.95284,0.93464,0.95269,0.94792,0.92982,0.93636,0.93168,0.91389,0.94564,0.94092,0.92295,0.88418,0.87976,0.86296,0.87922,0.87482,0.85812,0.88007,0.87567,0.85895,0.888,0.88356,0.86669,0.881,0.87659,0.85985,0.91151,0.90696,0.88964,0.89764,0.89315,0.8761,0.89404,0.88957,0.87258,0.89459,0.89011,0.87312,0.94294,0.93822,0.92031,0.92341,0.9188,0.90125,0.91042,0.90587,0.88857,0.91325,0.90868,0.89133,0.93232,0.92766,0.90995,0.92978,0.92513,0.90747,0.98052,0.97562,0.95699,0.94437,0.93964,0.9217,0.98215,0.97724,0.95858,0.96539,0.96057,0.94222,0.91969,0.9151,0.89762,0.95307,0.94831,0.9302,0.92635,0.92172,0.90411,0.92214,0.91753,0.90001,0.9422,0.93749,0.91958,0.91083,0.90628,0.88897,0.90761,0.90307,0.88583,0.93622,0.93153,0.91375,0.89116,0.88671,0.86978,0.86889,0.86454,0.84803,0.87097,0.86661,0.85006,0.90819,0.90365,0.88639,0.90604,0.90151,0.88429,0.90218,0.89766,0.88052,0.91314,0.90858,0.89123,0.88302,0.87861,0.86183,0.91042,0.90587,0.88857,0.9092,0.90466,0.88738,0.95999,0.95519,0.93695,0.96344,0.95862,0.94032,0.94567,0.94094,0.92298,0.95597,0.95119,0.93303,0.94746,0.94272,0.92472,0.92588,0.92125,0.90366,0.97072,0.96586,0.94742,0.93864,0.93395,0.91611,0.92278,0.91817,0.90064,0.95636,0.95158,0.93341,0.95986,0.95506,0.93682,0.96599,0.96116,0.9428,0.9313,0.92664,0.90895,0.90941,0.90486,0.88758,0.89941,0.89492,0.87783,0.92888,0.92423,0.90658,0.9168,0.91222,0.8948,0.90955,0.905,0.88772,0.86841,0.86407,0.84757,0.89183,0.88737,0.87042,0.88149,0.87708,0.86033,0.91651,0.91192,0.89451,0.93448,0.92981,0.91205,0.9092,0.90466,0.88738,0.90452,0.89999,0.88281,0.95839,0.9536,0.93539,0.92612,0.92148,0.90389,0.93231,0.92764,0.90993,0.96435,0.95953,0.94121,0.93125,0.92659,0.9089,0.98626,0.98133,0.96259,0.95639,0.95161,0.93344,0.98449,0.97957,0.96086,0.93088,0.92622,0.90854,0.92752,0.92288,0.90526,0.94189,0.93718,0.91929,0.92247,0.91786,0.90033,0.92244,0.91783,0.9003,0.90084,0.89634,0.87922,0.94059,0.93589,0.91802,0.90901,0.90446,0.88719,0.92097,0.91637,0.89887,0.87074,0.86639,0.84985,0.91088,0.90633,0.88902,0.92337,0.91875,0.90121,0.90694,0.90241,0.88518,0.90591,0.90139,0.88417,0.9108,0.90624,0.88894,0.90452,0.89999,0.88281,0.95255,0.94779,0.92969,0.96238,0.95757,0.93928,0.94437,0.93965,0.92171,0.98934,0.98439,0.9656,0.92629,0.92166,0.90406,0.92411,0.91949,0.90193,0.9595,0.9547,0.93647,0.9704,0.96554,0.94711,0.97253,0.96767,0.94919,0.94732,0.94258,0.92458,0.92618,0.92154,0.90395,0.95232,0.94756,0.92946,0.93143,0.92677,0.90907,0.91625,0.91167,0.89426,0.9029,0.89838,0.88123,0.94569,0.94096,0.92299,0.90448,0.89995,0.88277,0.89111,0.88666,0.86973,0.87282,0.86846,0.85187,0.93776,0.93307,0.91525,0.91559,0.91102,0.89362,0.92451,0.91988,0.90232,0.8808,0.8764,0.85966,0.91952,0.91492,0.89745,0.95255,0.94779,0.92969,0.91868,0.91409,0.89663,0.92134,0.91674,0.89923,0.91531,0.91074,0.89335,0.95468,0.94991,0.93177,0.95298,0.94822,0.93011,0.96304,0.95822,0.93992,0.95428,0.94951,0.93138,0.94235,0.93764,0.91973,0.93523,0.93056,0.91279,0.92312,0.91851,0.90097,0.90528,0.90075,0.88355,0.9364,0.93172,0.91393,0.91252,0.90796,0.89062,0.91242,0.90786,0.89052,0.9041,0.89958,0.8824,0.90954,0.90499,0.88771,0.89204,0.88758,0.87063,0.91921,0.91461,0.89715,0.89824,0.89375,0.87668,0.90607,0.90154,0.88432,0.86481,0.86048,0.84405,0.90943,0.90488,0.8876,0.95136,0.9466,0.92852,0.917,0.91242,0.895,0.91868,0.91409,0.89663,0.90452,0.9,0.88281,0.91613,0.91155,0.89414,0.91594,0.91137,0.89396,0.96343,0.95861,0.94031,0.90901,0.90447,0.8872,0.97383,0.96896,0.95045,0.95363,0.94887,0.93075,0.94484,0.94011,0.92216,0.94931,0.94456,0.92652,0.93153,0.92688,0.90918,0.96775,0.96291,0.94452,0.97206,0.9672,0.94873,0.91917,0.91458,0.89711,0.91365,0.90909,0.89173,0.90821,0.90367,0.88641,0.9424,0.93768,0.91978,0.8854,0.88097,0.86415,0.88575,0.88132,0.86449,0.8952,0.89072,0.87371,0.89155,0.88709,0.87015,0.92555,0.92092,0.90334,0.8959,0.89142,0.8744,0.91274,0.90817,0.89083,0.8907,0.88624,0.86932,0.90452,0.9,0.88281,0.95217,0.94741,0.92932,0.90865,0.90411,0.88685,0.93386,0.92919,0.91144,0.96655,0.96172,0.94335,0.92325,0.91863,0.90109,0.97694,0.97205,0.95349,0.93138,0.92672,0.90903,0.96306,0.95824,0.93995,0.97072,0.96586,0.94742,0.95104,0.94628,0.92821,0.92732,0.92268,0.90506,0.91328,0.90871,0.89136,0.9055,0.90097,0.88377,0.92872,0.92408,0.90643,0.93063,0.92597,0.90829,0.91125,0.90669,0.88938,0.92232,0.91771,0.90019,0.87688,0.8725,0.85584,0.90472,0.90019,0.883,0.88806,0.88362,0.86675,0.87889,0.87449,0.85779,0.89393,0.88946,0.87248,0.90153,0.89703,0.8799,0.92405,0.91943,0.90187,0.95217,0.94741,0.92932,0.95366,0.94889,0.93077,0.92301,0.91839,0.90086,0.95644,0.95166,0.93349,0.96465,0.95982,0.9415,0.94569,0.94096,0.92299,0.97586,0.97098,0.95244,0.95775,0.95296,0.93476,0.97925,0.97435,0.95574,0.96773,0.9629,0.94451,0.95113,0.94638,0.92831,0.92284,0.91823,0.9007,0.95312,0.94835,0.93024,0.9427,0.93799,0.92008,0.91265,0.90809,0.89075,0.93965,0.93495,0.9171,0.8938,0.88934,0.87235,0.93562,0.93094,0.91317,0.89101,0.88655,0.86962,0.91343,0.90886,0.89151,0.88641,0.88198,0.86514,0.90512,0.90059,0.88339,0.91234,0.90777,0.89044,0.89992,0.89542,0.87832,0.91293,0.90837,0.89102,0.95366,0.94889,0.93077,0.93912,0.93443,0.91658,0.95474,0.94996,0.93182,0.93975,0.93505,0.91719,0.93852,0.93382,0.91599,0.97552,0.97064,0.95211,0.94807,0.94333,0.92531,0.98177,0.97686,0.95821,0.98013,0.97523,0.95661,0.97218,0.96731,0.94884,0.90782,0.90328,0.88603,0.9391,0.9344,0.91656,0.93621,0.93153,0.91374,0.90376,0.89925,0.88207,0.92198,0.91737,0.89985,0.9275,0.92286,0.90524,0.87211,0.86775,0.85118,0.88636,0.88193,0.86509,0.92443,0.9198,0.90224,0.92908,0.92444,0.90678,0.91738,0.91279,0.89536,0.94236,0.93765,0.91975,0.8862,0.88177,0.86493,0.91509,0.91051,0.89313,0.9138,0.90923,0.89187,0.93912,0.93443,0.91658,0.91979,0.91519,0.89771,0.91168,0.90712,0.8898,0.93029,0.92563,0.90796,0.94545,0.94072,0.92276,0.93368,0.92902,0.91128,0.9644,0.95958,0.94126,0.96911,0.96426,0.94585,0.97008,0.96523,0.9468,0.93382,0.92916,0.91141,0.93981,0.93511,0.91725,0.94289,0.93817,0.92026,0.92008,0.91548,0.898,0.91916,0.91456,0.8971,0.91264,0.90807,0.89073,0.93966,0.93497,0.91711,0.89538,0.8909,0.87389,0.89697,0.89249,0.87545,0.90846,0.90391,0.88665,0.88675,0.88232,0.86547,0.90826,0.90372,0.88647,0.89499,0.89052,0.87351,0.90718,0.90265,0.88541,0.91897,0.91438,0.89692,0.89937,0.89487,0.87778,0.91979,0.91519,0.89771,0.93381,0.92914,0.9114,0.95869,0.9539,0.93568,0.96267,0.95786,0.93957,0.92136,0.91675,0.89925,0.96828,0.96344,0.94504,0.93687,0.93218,0.91438,0.9528,0.94804,0.92994,0.99292,0.98795,0.96909,0.95577,0.95099,0.93283,0.96175,0.95694,0.93867,0.96296,0.95815,0.93985,0.9345,0.92983,0.91207,0.91808,0.91349,0.89605,0.9004,0.8959,0.87879,0.93703,0.93234,0.91454,0.93928,0.93458,0.91674,0.8691,0.86475,0.84824,0.91162,0.90706,0.88974,0.88222,0.87781,0.86104,0.86904,0.86469,0.84818,0.89193,0.88747,0.87052,0.9242,0.91958,0.90202,0.94936,0.94461,0.92658,0.94101,0.93631,0.91843,0.93381,0.92914,0.9114,0.92435,0.91973,0.90217,0.96254,0.95773,0.93944,0.96127,0.95646,0.9382,0.9448,0.94008,0.92212,0.97315,0.96829,0.9498,0.96059,0.95579,0.93754,0.97444,0.96957,0.95105,0.97723,0.97234,0.95378,0.93944,0.93474,0.91689,0.94311,0.93839,0.92047,0.98099,0.97609,0.95745,0.91846,0.91387,0.89642,0.93648,0.9318,0.91401,0.88638,0.88195,0.86511,0.93826,0.93356,0.91574,0.92785,0.92321,0.90559,0.89736,0.89288,0.87583,0.88414,0.87972,0.86292,0.8959,0.89142,0.8744,0.90444,0.89991,0.88273,0.881,0.87659,0.85985,0.89502,0.89054,0.87354,0.91489,0.91032,0.89294,0.94271,0.93799,0.92008,0.92435,0.91973,0.90217,0.90168,0.89718,0.88004,0.93257,0.9279,0.91019,0.93232,0.92766,0.90995,0.95253,0.94777,0.92967,0.94685,0.94211,0.92412,0.9828,0.97789,0.95922,0.98931,0.98437,0.96557,0.94659,0.94186,0.92387,0.94756,0.94282,0.92482,0.92538,0.92075,0.90317,0.95413,0.94936,0.93123,0.91332,0.90875,0.8914,0.94469,0.93996,0.92201,0.90342,0.8989,0.88174,0.95413,0.94936,0.93123,0.89553,0.89106,0.87404,0.90863,0.90408,0.88682,0.91268,0.90811,0.89077,0.92017,0.91557,0.89809,0.92295,0.91834,0.9008,0.88328,0.87886,0.86208,0.90063,0.89613,0.87902,0.92084,0.91624,0.89874,0.91733,0.91275,0.89532,0.90168,0.89718,0.88004,0.89972,0.89522,0.87813,0.91969,0.91509,0.89762,0.91468,0.9101,0.89272,0.94044,0.93574,0.91787,0.91997,0.91537,0.8979,0.97797,0.97308,0.9545,0.97371,0.96884,0.95034,0.9529,0.94813,0.93003,0.94782,0.94308,0.92508,0.91676,0.91218,0.89476,0.93997,0.93527,0.91741,0.91193,0.90737,0.89005,0.96179,0.95698,0.93871,0.91867,0.91408,0.89663,0.93682,0.93214,0.91434,0.89477,0.8903,0.8733,0.89902,0.89453,0.87745,0.92494,0.92031,0.90274,0.92044,0.91584,0.89835,0.9145,0.90992,0.89255,0.91194,0.90738,0.89005,0.91091,0.90636,0.88905,0.9126,0.90804,0.8907,0.92229,0.91768,0.90016,0.89972,0.89522,0.87813]},"duck":{"position":[0.0,0.163,-1.0,0.66218,-0.46604,-0.44722,-0.25292,-0.78079,-0.44722,-0.8185,0.04323,-0.44722,-0.25292,0.86725,-0.44722,0.66218,0.5525,-0.44722,0.31059,-0.87251,0.44722,-0.81315,-0.53741,0.44722,-0.81315,0.54695,0.44722,0.31059,0.88205,0.44722,1.00511,0.00477,0.44722,0.0,0.077,1.0,-0.20374,-0.60343,-0.65752,-0.1362,-0.34681,-0.85065,-0.06333,-0.06862,-0.96795,0.16581,0.01644,-0.96795,0.35658,-0.1672,-0.85065,0.5334,-0.34232,-0.65752,0.48119,-0.60587,-0.5023,0.23662,-0.72346,-0.52574,-0.02681,-0.78192,-0.5023,0.73519,0.33673,-0.5023,0.7657,0.05577,-0.52574,0.73519,-0.23298,-0.5023,0.16581,0.29167,-0.96795,0.35658,0.41402,-0.85065,0.5334,0.50263,-0.65752,-0.65932,0.08015,-0.65751,-0.44076,0.12341,-0.85065,-0.20496,0.15405,-0.96795,-0.4378,-0.63949,-0.5023,-0.61946,-0.42582,-0.52574,-0.75177,-0.17858,-0.5023,-0.20374,0.76374,-0.65752,-0.1362,0.59363,-0.85065,-0.06333,0.37672,-0.96795,-0.75177,0.28233,-0.5023,-0.61946,0.53737,-0.52574,-0.4378,0.74325,-0.5023,-0.02681,0.88567,-0.5023,0.23662,0.83501,-0.52574,0.48119,0.70962,-0.5023,1.01945,-0.15344,0.25115,0.9637,-0.30901,-0.0,0.82054,-0.4167,-0.25115,0.82054,0.45344,-0.25115,0.9637,0.30901,0.0,1.01945,0.14698,0.25115,0.16541,-0.97545,0.25115,0.0,-1.0,-0.0,-0.14797,-0.92026,-0.25115,0.6551,-0.65136,-0.25115,0.5956,-0.80902,0.0,0.46464,-0.88261,0.25115,-0.91722,-0.45387,0.25115,-0.9637,-0.30901,-0.0,-0.91199,-0.12665,-0.25115,-0.41566,-0.83063,-0.25115,-0.5956,-0.80902,0.0,-0.73228,-0.69693,0.25115,-0.73228,0.69047,0.25115,-0.5956,0.80902,-0.0,-0.41566,0.86736,-0.25115,-0.91199,0.16339,-0.25115,-0.9637,0.30901,0.0,-0.91722,0.44741,0.25115,0.46464,0.87615,0.25115,0.5956,0.80902,-0.0,0.6551,0.6881,-0.25115,-0.14797,0.95699,-0.25115,0.0,1.0,0.0,0.16541,0.96899,0.25115,0.94258,-0.23857,0.5023,0.78257,-0.50784,0.52574,0.54892,-0.73308,0.5023,0.03362,-0.88589,0.5023,-0.29892,-0.82822,0.52574,-0.60333,-0.697,0.5023,-0.9218,-0.29694,0.5023,-0.96731,0.01056,0.52574,-0.9218,0.3143,0.5023,-0.60333,0.71436,0.5023,-0.29892,0.84935,0.52574,0.03362,0.90325,0.5023,0.54892,0.75044,0.5023,0.78257,0.52896,0.52574,0.94258,0.25593,0.5023,0.0814,-0.18423,0.96795,0.17608,-0.47951,0.85065,0.26407,-0.72594,0.65752,0.85458,0.02361,0.65751,0.56981,0.05025,0.85065,0.26341,0.07081,0.96795,-0.2131,-0.08681,0.96795,-0.46098,-0.27716,0.85065,-0.69137,-0.43963,0.65752,-0.2131,0.22843,0.96795,-0.46098,0.37767,0.85065,-0.69137,0.48685,0.65752,0.0814,0.32585,0.96795,0.17608,0.58002,0.85065,0.26407,0.77315,0.65752,0.38715,0.33686,0.89443,0.71553,0.3079,0.72361,0.5014,0.58408,0.72361,-0.14788,0.50949,0.89443,-0.05919,0.75476,0.72361,-0.40565,0.64927,0.72361,-0.47855,0.05754,0.89443,-0.75211,0.2024,0.72361,-0.75211,-0.13897,0.72361,-0.14788,-0.39441,0.89443,-0.40565,-0.58583,0.72361,-0.05919,-0.69133,0.72361,0.38715,-0.22178,0.89443,0.5014,-0.52064,0.72361,0.71553,-0.24446,0.72361,0.92509,0.43083,0.2764,0.81977,0.58778,0.0,0.72008,0.69879,0.2764,-0.14835,0.96674,0.2764,-0.31312,0.95106,-0.0,-0.48006,0.86439,0.2764,-1.01677,0.16288,0.2764,-1.01329,-0.0,0.0,-1.01677,-0.16832,0.2764,-0.48006,-0.86982,0.2764,-0.31312,-0.95106,-0.0,-0.14835,-0.97217,0.2764,0.72008,-0.70422,0.2764,0.81977,-0.58778,-0.0,0.92509,-0.43627,0.27639,0.31312,0.95106,-0.0,0.42408,0.85524,-0.2764,0.13105,0.95371,-0.2764,-0.81977,0.58778,-0.0,-0.63612,0.69593,-0.2764,-0.81722,0.43815,-0.2764,-0.81977,-0.58778,0.0,-0.81722,-0.39604,-0.2764,-0.63612,-0.65382,-0.2764,0.31312,-0.95106,0.0,0.13105,-0.9116,-0.2764,0.42408,-0.81314,-0.2764,1.01329,0.0,0.0,0.89821,-0.13826,-0.2764,0.89821,0.18037,-0.2764,0.31206,0.65196,-0.72361,0.11471,0.53315,-0.89443,0.04553,0.74728,-0.72361,-0.38573,0.59305,-0.72361,-0.30032,0.38087,-0.89443,-0.55045,0.3435,-0.72361,-0.55045,-0.1556,-0.72361,-0.30032,-0.11195,-0.89443,-0.38573,-0.40515,-0.72361,0.57859,0.24818,-0.72361,0.57859,-0.06028,-0.72361,0.37121,0.13446,-0.89443,0.04553,-0.55938,-0.72361,0.11471,-0.26423,-0.89443,0.31206,-0.46406,-0.72361],"normal":[0.00015,0.00686,-0.99998,0.67967,-0.46936,-0.56369,-0.26614,-0.77871,-0.56813,-0.8469,-0.00019,-0.53176,-0.29861,0.87281,-0.38605,0.73082,0.50416,-0.46014,0.26002,-0.85545,0.44788,-0.72489,-0.56228,0.39796,-0.74253,0.57517,0.34325,0.27128,0.89141,0.36303,0.93782,-0.00037,0.34712,-0.0,0.00363,0.99999,-0.22408,-0.63798,-0.73673,-0.16539,-0.45764,-0.87362,-0.08876,-0.23855,-0.96707,0.23655,-0.14755,-0.96035,0.43537,-0.28262,-0.85474,0.57941,-0.38856,-0.71646,0.49671,-0.61667,-0.61073,0.25267,-0.73366,-0.63079,-0.01832,-0.78865,-0.61457,0.80121,0.26598,-0.53602,0.81214,0.00061,-0.58347,0.76531,-0.25326,-0.59174,0.2544,0.17383,-0.95135,0.48689,0.32755,-0.80972,0.64299,0.43608,-0.6296,-0.73377,0.00201,-0.67939,-0.55846,0.0048,-0.82952,-0.30216,0.00705,-0.95323,-0.46826,-0.63848,-0.6108,-0.64812,-0.44381,-0.61885,-0.77739,-0.21998,-0.5893,-0.2662,0.76418,-0.58751,-0.19897,0.56509,-0.80068,-0.09998,0.28522,-0.95323,-0.80852,0.2286,-0.54226,-0.70481,0.48376,-0.51885,-0.52345,0.71617,-0.46163,-0.02284,0.90479,-0.42524,0.28956,0.84165,-0.45583,0.55525,0.68722,-0.46843,0.98406,-0.16965,0.05338,0.92969,-0.30782,-0.20231,0.81314,-0.40596,-0.41713,0.83892,0.41708,-0.34967,0.93511,0.30523,-0.18001,0.98507,0.16561,0.04706,0.14375,-0.9702,0.19508,-0.00033,-0.99428,-0.1068,-0.14594,-0.91353,-0.3797,0.65149,-0.64011,-0.4072,0.57603,-0.80416,-0.1467,0.43316,-0.88505,0.17047,-0.88008,-0.46745,0.08336,-0.92945,-0.30804,-0.20305,-0.89918,-0.14046,-0.41442,-0.42572,-0.81618,-0.39065,-0.5758,-0.80448,-0.14583,-0.68127,-0.72051,0.12935,-0.6855,0.71997,0.10826,-0.58262,0.80855,-0.08245,-0.44887,0.85923,-0.24545,-0.90976,0.13987,-0.39085,-0.93499,0.30565,-0.17992,-0.88216,0.46569,0.07024,0.43464,0.88848,0.14724,0.58263,0.80851,-0.08271,0.68357,0.66731,-0.29569,-0.156,0.96426,-0.21417,-0.00013,0.99968,-0.0253,0.14642,0.9745,0.17005,0.84067,-0.27185,0.46838,0.67374,-0.52227,0.52278,0.46908,-0.72277,0.50752,0.01799,-0.85321,0.52126,-0.24429,-0.80271,0.54404,-0.50009,-0.70351,0.50495,-0.82677,-0.30714,0.47129,-0.87115,-0.00017,0.49102,-0.84175,0.3125,0.44023,-0.52452,0.73441,0.43072,-0.25964,0.85175,0.45508,0.02052,0.90344,0.42823,0.49102,0.75734,0.4305,0.69878,0.54085,0.46817,0.85421,0.27489,0.44132,0.07272,-0.22285,0.97214,0.14162,-0.4557,0.8788,0.20575,-0.6793,0.70443,0.69752,0.00143,0.71656,0.46208,0.00276,0.88683,0.24028,0.00389,0.9707,-0.19116,-0.13685,0.97197,-0.36759,-0.27806,0.88745,-0.5474,-0.42605,0.7203,-0.20022,0.15156,0.96796,-0.39555,0.30548,0.86615,-0.58282,0.45596,0.67263,0.07841,0.24913,0.96529,0.15933,0.52008,0.83912,0.22712,0.75101,0.62,0.34401,0.2637,0.90118,0.58739,0.2688,0.76336,0.43342,0.53613,0.72437,-0.13807,0.44672,0.88396,-0.05852,0.7247,0.68657,-0.3445,0.61387,0.71027,-0.4037,0.00326,0.91489,-0.61424,0.15345,0.77406,-0.59771,-0.14595,0.78832,-0.12341,-0.39182,0.91173,-0.31118,-0.55289,0.77296,-0.0524,-0.64341,0.76372,0.32109,-0.23932,0.91631,0.39667,-0.48751,0.77781,0.56047,-0.25367,0.78837,0.87997,0.4625,0.10835,0.79989,0.58625,-0.12839,0.68051,0.71835,0.1445,-0.14206,0.96972,0.19865,-0.30638,0.95131,-0.03365,-0.4354,0.88277,0.17647,-0.98194,0.16564,0.09147,-0.9802,-0.00204,-0.19798,-0.98059,-0.16985,0.09798,-0.43074,-0.8782,0.20791,-0.3032,-0.9468,-0.1079,-0.14132,-0.96242,0.23191,0.67608,-0.71667,0.17115,0.79242,-0.58536,-0.17151,0.87612,-0.46509,0.12689,0.3066,0.95062,-0.04818,0.45099,0.85104,-0.26896,0.15099,0.95951,-0.23781,-0.79897,0.58472,-0.14053,-0.67628,0.66548,-0.31587,-0.83456,0.40843,-0.36973,-0.79065,-0.58317,-0.18651,-0.80622,-0.39715,-0.4385,-0.64245,-0.63442,-0.42985,0.30289,-0.94448,-0.12732,0.14203,-0.90229,-0.40707,0.42352,-0.80409,-0.41722,0.97785,-0.002,-0.2093,0.88983,-0.1432,-0.43325,0.90117,0.14315,-0.40914,0.40729,0.62736,-0.66373,0.17406,0.49346,-0.85217,0.0702,0.75595,-0.65085,-0.5053,0.54107,-0.67224,-0.42911,0.28874,-0.85586,-0.66388,0.26168,-0.70057,-0.61741,-0.23819,-0.74972,-0.38591,-0.24796,-0.88859,-0.43782,-0.46239,-0.77105,0.68641,0.14961,-0.71166,0.65821,-0.13813,-0.74005,0.49519,0.00564,-0.86877,0.05815,-0.61583,-0.78573,0.14606,-0.40082,-0.90444,0.34534,-0.52602,-0.7772],"uv":[0.4,0.47009,0.74001,0.25488,0.34652,0.11954,0.10332,0.47387,0.34652,0.8282,0.74001,0.69285,0.67828,0.16954,0.19507,0.31363,0.19507,0.77991,0.67828,0.924,0.97692,0.54677,0.6,0.63311,0.34664,0.17477,0.35637,0.26581,0.37597,0.3737,0.4745,0.41027,0.56826,0.34304,0.66361,0.28705,0.65668,0.18925,0.54917,0.13634,0.43824,0.11354,0.7659,0.59456,0.77668,0.47141,0.7659,0.34959,0.4745,0.52862,0.56826,0.59296,0.66361,0.65038,0.15074,0.46871,0.22541,0.468,0.31507,0.46945,0.26152,0.17479,0.18106,0.26432,0.12651,0.37298,0.34664,0.76265,0.35637,0.6702,0.37597,0.5652,0.12651,0.57117,0.18106,0.6785,0.26152,0.76937,0.43824,0.83061,0.54917,0.80648,0.65668,0.75491,0.96348,0.45913,0.91439,0.36712,0.82772,0.2957,0.82772,0.66986,0.91439,0.63288,0.96348,0.58832,0.59624,0.10567,0.5,0.07,0.41126,0.07917,0.75658,0.1948,0.75611,0.15212,0.72491,0.14559,0.13071,0.32995,0.08561,0.36712,0.08273,0.42042,0.29615,0.11772,0.24389,0.15212,0.21023,0.22544,0.21023,0.82202,0.24389,0.84788,0.29615,0.84785,0.08273,0.54514,0.08561,0.63288,0.13071,0.7175,0.72491,0.90186,0.75611,0.84788,0.75658,0.77077,0.41126,0.88639,0.5,0.93,0.59624,0.94178,0.95554,0.44764,0.88908,0.3342,0.78627,0.235,0.56469,0.1693,0.42404,0.19644,0.2908,0.25052,0.15385,0.42255,0.13663,0.55711,0.15385,0.68538,0.2908,0.8574,0.42404,0.91779,0.56469,0.93863,0.78627,0.87292,0.88908,0.78003,0.95554,0.66028,0.63179,0.51758,0.66078,0.37888,0.6793,0.2536,0.93322,0.5759,0.83008,0.60667,0.71006,0.62724,0.50516,0.55947,0.38684,0.46589,0.26846,0.37671,0.50516,0.69502,0.38684,0.74746,0.26846,0.7751,0.63179,0.73691,0.66078,0.83448,0.6793,0.89821,0.75592,0.73429,0.88004,0.70476,0.78796,0.82351,0.52585,0.80852,0.54691,0.89691,0.39793,0.85155,0.38367,0.61419,0.24896,0.65939,0.24896,0.5126,0.52585,0.41985,0.39793,0.32045,0.54691,0.27509,0.75592,0.49408,0.78796,0.34849,0.88004,0.46724,0.92543,0.7129,0.8525,0.75275,0.83728,0.82812,0.46385,0.94334,0.36536,0.90895,0.32122,0.89933,0.09043,0.59768,0.06429,0.5,0.09043,0.45526,0.32121,0.15362,0.36536,0.09105,0.46385,0.10961,0.83728,0.22482,0.8525,0.24725,0.92543,0.34004,0.63464,0.90895,0.65471,0.84011,0.52871,0.88245,0.1475,0.75275,0.19883,0.77161,0.12096,0.66076,0.1475,0.24725,0.12096,0.30206,0.19883,0.19122,0.63464,0.09105,0.52871,0.08037,0.65471,0.12271,0.93571,0.5,0.85859,0.41291,0.85859,0.54992,0.56182,0.70798,0.45988,0.63981,0.44722,0.74897,0.26178,0.68265,0.28142,0.57433,0.19094,0.57534,0.19094,0.36073,0.28142,0.36242,0.26178,0.25342,0.67643,0.53435,0.67643,0.40172,0.57018,0.46837,0.44722,0.18711,0.45988,0.29694,0.56183,0.22809],"index":[0,15,14,1,17,23,0,14,29,0,29,35,0,35,24,1,23,44,2,20,50,3,32,56,4,38,62,5,41,68,1,44,51,2,50,57,3,56,63,4,62,69,5,68,45,6,74,89,7,77,95,8,80,98,9,83,101,10,86,90,92,99,11,91,102,92,90,103,91,92,102,99,102,100,99,91,103,102,103,104,102,102,104,100,104,101,100,90,86,103,86,85,103,103,85,104,85,84,104,104,84,101,84,9,101,99,96,11,100,105,99,101,106,100,99,105,96,105,97,96,100,106,105,106,107,105,105,107,97,107,98,97,101,83,106,83,82,106,106,82,107,82,81,107,107,81,98,81,8,98,96,93,11,97,108,96,98,109,97,96,108,93,108,94,93,97,109,108,109,110,108,108,110,94,110,95,94,98,80,109,80,79,109,109,79,110,79,78,110,110,78,95,78,7,95,93,87,11,94,111,93,95,112,94,93,111,87,111,88,87,94,112,111,112,113,111,111,113,88,113,89,88,95,77,112,77,76,112,112,76,113,76,75,113,113,75,89,75,6,89,87,92,11,88,114,87,89,115,88,87,114,92,114,91,92,88,115,114,115,116,114,114,116,91,116,90,91,89,74,115,74,73,115,115,73,116,73,72,116,116,72,90,72,10,90,47,86,10,46,117,47,45,118,46,47,117,86,117,85,86,46,118,117,118,119,117,117,119,85,119,84,85,45,68,118,68,67,118,118,67,119,67,66,119,119,66,84,66,9,84,71,83,9,70,120,71,69,121,70,71,120,83,120,82,83,70,121,120,121,122,120,120,122,82,122,81,82,69,62,121,62,61,121,121,61,122,61,60,122,122,60,81,60,8,81,65,80,8,64,123,65,63,124,64,65,123,80,123,79,80,64,124,123,124,125,123,123,125,79,125,78,79,63,56,124,56,55,124,124,55,125,55,54,125,125,54,78,54,7,78,59,77,7,58,126,59,57,127,58,59,126,77,126,76,77,58,127,126,127,128,126,126,128,76,128,75,76,57,50,127,50,49,127,127,49,128,49,48,128,128,48,75,48,6,75,53,74,6,52,129,53,51,130,52,53,129,74,129,73,74,52,130,129,130,131,129,129,131,73,131,72,73,51,44,130,44,43,130,130,43,131,43,42,131,131,42,72,42,10,72,66,71,9,67,132,66,68,133,67,66,132,71,132,70,71,67,133,132,133,134,132,132,134,70,134,69,70,68,41,133,41,40,133,133,40,134,40,39,134,134,39,69,39,4,69,60,65,8,61,135,60,62,136,61,60,135,65,135,64,65,61,136,135,136,137,135,135,137,64,137,63,64,62,38,136,38,37,136,136,37,137,37,36,137,137,36,63,36,3,63,54,59,7,55,138,54,56,139,55,54,138,59,138,58,59,55,139,138,139,140,138,138,140,58,140,57,58,56,32,139,32,31,139,139,31,140,31,30,140,140,30,57,30,2,57,48,53,6,49,141,48,50,142,49,48,141,53,141,52,53,49,142,141,142,143,141,141,143,52,143,51,52,50,20,142,20,19,142,142,19,143,19,18,143,143,18,51,18,1,51,42,47,10,43,144,42,44,145,43,42,144,47,144,46,47,43,145,144,145,146,144,144,146,46,146,45,46,44,23,145,23,22,145,145,22,146,22,21,146,146,21,45,21,5,45,26,41,5,25,147,26,24,148,25,26,147,41,147,40,41,25,148,147,148,149,147,147,149,40,149,39,40,24,35,148,35,34,148,148,34,149,34,33,149,149,33,39,33,4,39,33,38,4,34,150,33,35,151,34,33,150,38,150,37,38,34,151,150,151,152,150,150,152,37,152,36,37,35,29,151,29,28,151,151,28,152,28,27,152,152,27,36,27,3,36,27,32,3,28,153,27,29,154,28,27,153,32,153,31,32,28,154,153,154,155,153,153,155,31,155,30,31,29,14,154,14,13,154,154,13,155,13,12,155,155,12,30,12,2,30,21,26,5,22,156,21,23,157,22,21,156,26,156,25,26,22,157,156,157,158,156,156,158,25,158,24,25,23,17,157,17,16,157,157,16,158,16,15,158,158,15,24,15,0,24,12,20,2,13,159,12,14,160,13,12,159,20,159,19,20,13,160,159,160,161,159,159,161,19,161,18,19,14,15,160,15,16,160,160,16,161,16,17,161,161,17,18,17,1,18]},"goat":{"position":[0.0,0.135,-1.0,0.74824,-0.4876,-0.44722,-0.2858,-0.81252,-0.44722,-0.92487,0.03812,-0.44722,-0.2858,0.88877,-0.44722,0.74824,0.56385,-0.44722,0.28373,-0.85277,0.44722,-0.74284,-0.52785,0.44722,-0.74284,0.5236,0.44722,0.28373,0.84852,0.44722,0.9182,-0.00212,0.44722,0.0,0.045,1.0,-0.25067,-0.64806,-0.65752,-0.17901,-0.39659,-0.85065,-0.08662,-0.11097,-0.96795,0.22678,-0.01974,-0.96795,0.46867,-0.20561,-0.85065,0.65627,-0.37436,-0.65752,0.55761,-0.6364,-0.5023,0.27693,-0.76048,-0.52574,-0.03107,-0.81887,-0.5023,0.85195,0.34055,-0.5023,0.89615,0.04853,-0.52574,0.85195,-0.24993,-0.5023,0.22678,0.2755,-0.96795,0.46867,0.41242,-0.85065,0.65627,0.51135,-0.65752,-0.8112,0.0685,-0.65751,-0.57932,0.1034,-0.85065,-0.28031,0.12788,-0.96795,-0.50733,-0.67125,-0.5023,-0.725,-0.45146,-0.52574,-0.87115,-0.19354,-0.5023,-0.25067,0.78506,-0.65752,-0.17901,0.6034,-0.85065,-0.08662,0.36673,-0.96795,-0.87115,0.28416,-0.5023,-0.725,0.54853,-0.52574,-0.50733,0.76188,-0.5023,-0.03107,0.9095,-0.5023,0.27693,0.85755,-0.52574,0.55761,0.72702,-0.5023,0.90266,-0.15324,0.25115,0.81839,-0.30901,-0.0,0.82446,-0.42588,-0.25115,0.82446,0.45984,-0.25115,0.81839,0.30901,0.0,0.90266,0.14199,0.25115,0.14646,-0.96105,0.25115,0.0,-1.0,-0.0,-0.14868,-0.93844,-0.25115,0.65823,-0.66474,-0.25115,0.50579,-0.80902,0.0,0.41141,-0.86981,0.25115,-0.81214,-0.44848,0.25115,-0.81839,-0.30901,-0.0,-0.91635,-0.13064,-0.25115,-0.41765,-0.84721,-0.25115,-0.50579,-0.80902,0.0,-0.64839,-0.68734,0.25115,-0.64839,0.67609,0.25115,-0.50579,0.80902,-0.0,-0.41765,0.88117,-0.25115,-0.91635,0.1646,-0.25115,-0.81839,0.30901,0.0,-0.81214,0.43723,0.25115,0.41141,0.85856,0.25115,0.50579,0.80902,-0.0,0.65823,0.69869,-0.25115,-0.14868,0.9724,-0.25115,0.0,1.0,0.0,0.14646,0.9498,0.25115,0.8668,-0.23875,0.5023,0.72197,-0.49878,0.52574,0.50479,-0.71646,0.5023,0.03091,-0.86408,0.5023,-0.27577,-0.80779,0.52574,-0.55483,-0.68161,0.5023,-0.84769,-0.29513,0.5023,-0.8924,0.00122,0.52574,-0.84769,0.29534,0.5023,-0.55483,0.68182,0.5023,-0.27577,0.81023,0.52574,0.03091,0.86429,0.5023,0.50479,0.71667,0.5023,0.72197,0.50121,0.52574,0.8668,0.23896,0.5023,0.08662,-0.19809,0.96795,0.17899,-0.47315,0.85065,0.25035,-0.70724,0.65752,0.81017,0.00932,0.65751,0.57925,0.02685,0.85065,0.28031,0.04077,0.96795,-0.22677,-0.10685,0.96795,-0.46862,-0.28217,0.85065,-0.65544,-0.43353,0.65752,-0.22677,0.18838,0.96795,-0.46862,0.33586,0.85065,-0.65544,0.45218,0.65752,0.08662,0.27962,0.96795,0.17899,0.52684,0.85065,0.25035,0.72588,0.65752,0.40058,0.29461,0.89443,0.69257,0.27743,0.72361,0.48531,0.54029,0.72361,-0.15301,0.45707,0.89443,-0.05729,0.70275,0.72361,-0.39263,0.60234,0.72361,-0.49515,0.03175,0.89443,-0.72798,0.17702,0.72361,-0.72798,-0.14789,0.72361,-0.15301,-0.39357,0.89443,-0.39263,-0.57322,0.72361,-0.05729,-0.67362,0.72361,0.40058,-0.23111,0.89443,0.48531,-0.51117,0.72361,0.69257,-0.2483,0.72361,0.82362,0.41976,0.2764,0.69616,0.58778,0.0,0.6411,0.68263,0.2764,-0.13207,0.94549,0.2764,-0.26591,0.95106,-0.0,-0.4274,0.84509,0.2764,-0.90524,0.1569,0.2764,-0.8605,-0.0,0.0,-0.90524,-0.16802,0.2764,-0.4274,-0.85621,0.2764,-0.26591,-0.95106,-0.0,-0.13208,-0.95662,0.2764,0.6411,-0.69375,0.2764,0.69616,-0.58778,-0.0,0.82362,-0.43089,0.27639,0.26591,0.95106,-0.0,0.43365,0.86996,-0.2764,0.13401,0.97037,-0.2764,-0.69616,0.58778,-0.0,-0.65047,0.7075,-0.2764,-0.83567,0.44464,-0.2764,-0.69616,-0.58778,0.0,-0.83567,-0.40601,-0.2764,-0.65047,-0.66888,-0.2764,0.26591,-0.95106,0.0,0.13401,-0.93174,-0.2764,0.43365,-0.83133,-0.2764,0.8605,0.0,0.0,0.91849,-0.14314,-0.2764,0.91849,0.18177,-0.2764,0.39287,0.66747,-0.72361,0.15302,0.53757,-0.89443,0.05732,0.76787,-0.72361,-0.48561,0.60541,-0.72361,-0.40061,0.37511,-0.89443,-0.69299,0.34255,-0.72361,-0.69299,-0.18318,-0.72361,-0.40061,-0.15061,-0.89443,-0.48561,-0.44604,-0.72361,0.72842,0.24214,-0.72361,0.72842,-0.08277,-0.72361,0.49518,0.11225,-0.89443,0.05732,-0.6085,-0.72361,0.15302,-0.31307,-0.89443,0.39287,-0.50809,-0.72361],"normal":[0.0001,0.00475,-0.99999,0.7513,-0.54845,-0.36708,-0.26497,-0.82119,-0.50541,-0.97214,0.00066,-0.23438,-0.28824,0.89607,-0.3376,0.78084,0.57245,-0.25018,0.27644,-0.85127,0.44601,-0.76973,-0.55939,0.30757,-0.77789,0.56453,0.27605,0.28273,0.87092,0.40194,0.97855,-0.00083,0.206,-0.0001,0.00283,1.0,-0.20497,-0.66501,-0.71815,-0.13972,-0.46267,-0.87545,-0.07035,-0.23276,-0.96999,0.18819,-0.14484,-0.97139,0.38618,-0.29962,-0.8724,0.57989,-0.44258,-0.684,0.51151,-0.68846,-0.51418,0.24533,-0.77342,-0.5845,-0.01775,-0.81587,-0.57796,0.88908,0.31668,-0.33051,0.92203,0.00057,-0.38712,0.86521,-0.30694,-0.39649,0.1998,0.16486,-0.96587,0.42564,0.34014,-0.83853,0.63346,0.48881,-0.59983,-0.77388,0.00287,-0.63333,-0.50942,0.00519,-0.8605,-0.24011,0.0055,-0.97073,-0.47882,-0.70413,-0.52433,-0.69993,-0.5204,-0.48917,-0.88118,-0.27285,-0.38611,-0.23623,0.7709,-0.59153,-0.16293,0.54824,-0.82029,-0.07736,0.26697,-0.9606,-0.90208,0.27887,-0.32936,-0.74118,0.55311,-0.38042,-0.51879,0.76699,-0.3776,-0.02119,0.91066,-0.41262,0.27258,0.86196,-0.42746,0.55425,0.74512,-0.37094,0.98435,-0.1536,-0.08643,0.95802,-0.28652,0.01021,0.90016,-0.43557,-0.0015,0.89845,0.43308,0.07233,0.95833,0.2834,0.03586,0.98469,0.15073,-0.08752,0.15904,-0.96027,0.2293,-8e-05,-0.99907,-0.04305,-0.15511,-0.93938,-0.3058,0.7159,-0.68686,-0.12534,0.6185,-0.78526,-0.02886,0.46889,-0.86696,0.1689,-0.90069,-0.43353,-0.02852,-0.95757,-0.28808,0.00864,-0.98463,-0.15529,0.07989,-0.46059,-0.85521,-0.23763,-0.61898,-0.785,-0.02525,-0.72145,-0.68868,0.07232,-0.72335,0.68665,0.07264,-0.62028,0.78303,0.04604,-0.47066,0.87719,-0.09498,-0.98233,0.15225,0.10885,-0.95788,0.28503,0.03511,-0.9015,0.43186,-0.02833,0.46854,0.86641,0.17267,0.61977,0.78357,0.04361,0.72175,0.69212,-0.00651,-0.16145,0.97516,-0.15167,9e-05,0.99901,0.04438,0.16046,0.95884,0.23427,0.89678,-0.27671,0.34526,0.72143,-0.53423,0.4406,0.49795,-0.72844,0.47055,0.01872,-0.84995,0.52653,-0.25671,-0.80497,0.5349,-0.53151,-0.71126,0.46001,-0.88193,-0.31189,0.35346,-0.93094,-0.0007,0.36517,-0.88938,0.31352,0.33272,-0.54558,0.72777,0.41557,-0.26593,0.8337,0.48396,0.02046,0.87933,0.47576,0.51031,0.74758,0.42511,0.73521,0.54364,0.40487,0.90343,0.27683,0.32739,0.07172,-0.23929,0.9683,0.14481,-0.48111,0.86462,0.21441,-0.69465,0.68665,0.7807,0.0007,0.62491,0.50993,0.00253,0.86021,0.23997,0.00316,0.97078,-0.19047,-0.14873,0.97036,-0.39534,-0.3088,0.86507,-0.59912,-0.45747,0.6571,-0.19709,0.16018,0.96721,-0.4161,0.32972,0.84743,-0.6225,0.47661,0.62076,0.07573,0.25882,0.96295,0.15703,0.52577,0.83601,0.22815,0.74019,0.63251,0.35565,0.28402,0.89042,0.64665,0.29284,0.70434,0.45031,0.55346,0.70064,-0.13497,0.45489,0.88026,-0.05766,0.71137,0.70045,-0.35082,0.62175,0.70025,-0.4346,0.00285,0.90062,-0.68596,0.16997,0.70751,-0.67416,-0.16467,0.72,-0.12477,-0.41606,0.90074,-0.32863,-0.58125,0.74441,-0.05377,-0.65872,0.75046,0.33847,-0.26518,0.90284,0.42538,-0.52071,0.74021,0.62751,-0.28217,0.72568,0.90228,0.43099,0.01167,0.83122,0.55387,0.04792,0.71686,0.68846,0.11013,-0.15418,0.95292,0.26111,-0.3325,0.94166,0.05215,-0.46877,0.86034,0.20016,-0.98728,0.15339,-0.04188,-0.99957,-0.00152,0.02917,-0.98684,-0.15661,-0.04034,-0.46678,-0.86067,0.20338,-0.33167,-0.94293,-0.0296,-0.15429,-0.95243,0.26283,0.71522,-0.68948,0.11436,0.83066,-0.55677,-0.00202,0.90083,-0.43387,0.016,0.33279,0.94226,0.03733,0.47108,0.8732,-0.12492,0.15569,0.97118,-0.18047,-0.83168,0.55405,0.03657,-0.71758,0.69486,-0.04745,-0.90036,0.43417,0.02911,-0.83065,-0.55656,-0.01618,-0.89866,-0.43584,-0.04941,-0.70829,-0.68562,-0.16808,0.33159,-0.94218,-0.04846,0.15,-0.92949,-0.33698,0.4573,-0.84704,-0.27093,0.99979,-0.00152,0.02021,0.98706,-0.15747,0.03029,0.98641,0.15377,0.05785,0.36279,0.64616,-0.67146,0.1397,0.47342,-0.86969,0.05999,0.74368,-0.66584,-0.46338,0.57285,-0.67611,-0.36331,0.29288,-0.88444,-0.65425,0.29907,-0.69464,-0.61332,-0.2743,-0.74068,-0.33152,-0.25764,-0.90759,-0.40999,-0.50134,-0.76195,0.68872,0.17341,-0.70398,0.66341,-0.16031,-0.73088,0.43451,0.00544,-0.90065,0.05141,-0.62989,-0.77498,0.12081,-0.40116,-0.90801,0.31568,-0.55794,-0.76749],"uv":[0.4,0.45805,0.77702,0.24561,0.33239,0.10589,0.05758,0.47167,0.33239,0.83745,0.77702,0.69773,0.66673,0.17803,0.2253,0.31775,0.2253,0.76987,0.66673,0.90959,0.93955,0.54381,0.6,0.61935,0.32646,0.15558,0.33796,0.2444,0.36596,0.35549,0.50072,0.39472,0.61646,0.32652,0.71644,0.27327,0.68954,0.17612,0.56651,0.12042,0.43641,0.09765,0.81611,0.59621,0.83277,0.4683,0.81611,0.3423,0.50072,0.52167,0.61646,0.59227,0.71644,0.65413,0.08543,0.4637,0.16583,0.4594,0.28267,0.45819,0.23162,0.16113,0.13567,0.2533,0.07517,0.36655,0.32646,0.77182,0.33796,0.6744,0.36596,0.5609,0.07517,0.57196,0.13567,0.68329,0.23162,0.77738,0.43641,0.84085,0.56651,0.81617,0.68954,0.76239,0.91326,0.45922,0.85191,0.36712,0.8294,0.29176,0.8294,0.67261,0.85191,0.63288,0.91326,0.58617,0.58809,0.11186,0.5,0.07,0.41095,0.07135,0.75792,0.18905,0.71749,0.15212,0.70202,0.1511,0.17589,0.33227,0.14809,0.36712,0.08085,0.41871,0.29529,0.11058,0.28251,0.15212,0.24631,0.22956,0.24631,0.81583,0.28251,0.84788,0.29529,0.85379,0.08085,0.54566,0.14809,0.63288,0.17589,0.71313,0.70202,0.8943,0.71749,0.84788,0.75792,0.77532,0.41095,0.89302,0.5,0.93,0.58809,0.93353,0.92296,0.44757,0.86302,0.3381,0.76729,0.24215,0.56352,0.17868,0.43399,0.20522,0.31166,0.25714,0.18572,0.42332,0.16884,0.5531,0.18572,0.67723,0.31166,0.84341,0.43399,0.90097,0.56352,0.92187,0.76729,0.8584,0.86302,0.7681,0.92296,0.65298,0.63404,0.51162,0.66203,0.38161,0.6734,0.26164,0.91412,0.56976,0.83414,0.59661,0.71733,0.61432,0.49928,0.55085,0.38356,0.46373,0.28391,0.37933,0.49928,0.6778,0.38356,0.72948,0.28391,0.76019,0.63404,0.71703,0.66203,0.81161,0.6734,0.87788,0.76169,0.71613,0.87017,0.69165,0.78105,0.80469,0.52365,0.78598,0.54773,0.87454,0.40353,0.83137,0.37653,0.6031,0.25933,0.64848,0.25933,0.50877,0.52365,0.42021,0.40353,0.32588,0.54773,0.2827,0.76169,0.49006,0.78105,0.35256,0.87017,0.46559,0.8818,0.70814,0.79935,0.75275,0.80331,0.82117,0.47085,0.9342,0.38566,0.90895,0.34386,0.89103,0.13839,0.5951,0.12998,0.5,0.13839,0.45539,0.34386,0.15947,0.38566,0.09105,0.47085,0.11629,0.80331,0.22933,0.79935,0.24725,0.88179,0.34236,0.61434,0.90895,0.65883,0.84644,0.52998,0.88962,0.20065,0.75275,0.19266,0.77659,0.11302,0.66355,0.20065,0.24725,0.11302,0.29778,0.19266,0.18474,0.61434,0.09105,0.52998,0.07171,0.65883,0.11489,0.87002,0.5,0.86731,0.41081,0.86731,0.55052,0.59657,0.71465,0.47636,0.64171,0.45229,0.75782,0.21883,0.68797,0.2383,0.57186,0.12965,0.57494,0.12965,0.34887,0.2383,0.34579,0.21883,0.23584,0.74086,0.53176,0.74086,0.39205,0.62348,0.45882,0.45229,0.16598,0.47636,0.27594,0.59657,0.20916],"index":[0,15,14,1,17,23,0,14,29,0,29,35,0,35,24,1,23,44,2,20,50,3,32,56,4,38,62,5,41,68,1,44,51,2,50,57,3,56,63,4,62,69,5,68,45,6,74,89,7,77,95,8,80,98,9,83,101,10,86,90,92,99,11,91,102,92,90,103,91,92,102,99,102,100,99,91,103,102,103,104,102,102,104,100,104,101,100,90,86,103,86,85,103,103,85,104,85,84,104,104,84,101,84,9,101,99,96,11,100,105,99,101,106,100,99,105,96,105,97,96,100,106,105,106,107,105,105,107,97,107,98,97,101,83,106,83,82,106,106,82,107,82,81,107,107,81,98,81,8,98,96,93,11,97,108,96,98,109,97,96,108,93,108,94,93,97,109,108,109,110,108,108,110,94,110,95,94,98,80,109,80,79,109,109,79,110,79,78,110,110,78,95,78,7,95,93,87,11,94,111,93,95,112,94,93,111,87,111,88,87,94,112,111,112,113,111,111,113,88,113,89,88,95,77,112,77,76,112,112,76,113,76,75,113,113,75,89,75,6,89,87,92,11,88,114,87,89,115,88,87,114,92,114,91,92,88,115,114,115,116,114,114,116,91,116,90,91,89,74,115,74,73,115,115,73,116,73,72,116,116,72,90,72,10,90,47,86,10,46,117,47,45,118,46,47,117,86,117,85,86,46,118,117,118,119,117,117,119,85,119,84,85,45,68,118,68,67,118,118,67,119,67,66,119,119,66,84,66,9,84,71,83,9,70,120,71,69,121,70,71,120,83,120,82,83,70,121,120,121,122,120,120,122,82,122,81,82,69,62,121,62,61,121,121,61,122,61,60,122,122,60,81,60,8,81,65,80,8,64,123,65,63,124,64,65,123,80,123,79,80,64,124,123,124,125,123,123,125,79,125,78,79,63,56,124,56,55,124,124,55,125,55,54,125,125,54,78,54,7,78,59,77,7,58,126,59,57,127,58,59,126,77,126,76,77,58,127,126,127,128,126,126,128,76,128,75,76,57,50,127,50,49,127,127,49,128,49,48,128,128,48,75,48,6,75,53,74,6,52,129,53,51,130,52,53,129,74,129,73,74,52,130,129,130,131,129,129,131,73,131,72,73,51,44,130,44,43,130,130,43,131,43,42,131,131,42,72,42,10,72,66,71,9,67,132,66,68,133,67,66,132,71,132,70,71,67,133,132,133,134,132,132,134,70,134,69,70,68,41,133,41,40,133,133,40,134,40,39,134,134,39,69,39,4,69,60,65,8,61,135,60,62,136,61,60,135,65,135,64,65,61,136,135,136,137,135,135,137,64,137,63,64,62,38,136,38,37,136,136,37,137,37,36,137,137,36,63,36,3,63,54,59,7,55,138,54,56,139,55,54,138,59,138,58,59,55,139,138,139,140,138,138,140,58,140,57,58,56,32,139,32,31,139,139,31,140,31,30,140,140,30,57,30,2,57,48,53,6,49,141,48,50,142,49,48,141,53,141,52,53,49,142,141,142,143,141,141,143,52,143,51,52,50,20,142,20,19,142,142,19,143,19,18,143,143,18,51,18,1,51,42,47,10,43,144,42,44,145,43,42,144,47,144,46,47,43,145,144,145,146,144,144,146,46,146,45,46,44,23,145,23,22,145,145,22,146,22,21,146,146,21,45,21,5,45,26,41,5,25,147,26,24,148,25,26,147,41,147,40,41,25,148,147,148,149,147,147,149,40,149,39,40,24,35,148,35,34,148,148,34,149,34,33,149,149,33,39,33,4,39,33,38,4,34,150,33,35,151,34,33,150,38,150,37,38,34,151,150,151,152,150,150,152,37,152,36,37,35,29,151,29,28,151,151,28,152,28,27,152,152,27,36,27,3,36,27,32,3,28,153,27,29,154,28,27,153,32,153,31,32,28,154,153,154,155,153,153,155,31,155,30,31,29,14,154,14,13,154,154,13,155,13,12,155,155,12,30,12,2,30,21,26,5,22,156,21,23,157,22,21,156,26,156,25,26,22,157,156,157,158,156,156,158,25,158,24,25,23,17,157,17,16,157,157,16,158,16,15,158,158,15,24,15,0,24,12,20,2,13,159,12,14,160,13,12,159,20,159,19,20,13,160,159,160,161,159,159,161,19,161,18,19,14,15,160,15,16,160,160,16,161,16,17,161,161,17,18,17,1,18]},"pig":{"position":[0.0,0.07,-1.0,0.81897,-0.47295,-0.44722,-0.31281,-0.84081,-0.44722,-1.01229,0.0793,-0.44722,-0.31281,0.86049,-0.44722,0.81897,0.5785,-0.44722,0.29729,-0.90342,0.44722,-0.77834,-0.53556,0.44722,-0.77834,0.51589,0.44722,0.29729,0.79788,0.44722,0.96208,0.01669,0.44722,0.0,-0.07,1.0,-0.26288,-0.67145,-0.65752,-0.17443,-0.43216,-0.85065,-0.08075,-0.16774,-0.96795,0.21141,-0.07624,-0.96795,0.45667,-0.23605,-0.85065,0.68825,-0.37613,-0.65752,0.60577,-0.64339,-0.5023,0.29973,-0.78563,-0.52574,-0.03375,-0.85117,-0.5023,0.92554,0.36744,-0.5023,0.96992,0.08022,-0.52574,0.92554,-0.22304,-0.5023,0.21141,0.21899,-0.96795,0.45667,0.38197,-0.85065,0.68825,0.50958,-0.65752,-0.85073,0.08009,-0.65751,-0.56448,0.07613,-0.85065,-0.26132,0.07154,-0.96795,-0.55115,-0.68261,-0.5023,-0.78468,-0.44149,-0.52574,-0.9464,-0.16395,-0.5023,-0.26288,0.76167,-0.65752,-0.17443,0.56783,-0.85065,-0.08075,0.30996,-0.96795,-0.9464,0.31376,-0.5023,-0.78468,0.55851,-0.52574,-0.55115,0.75052,-0.5023,-0.03375,0.8772,-0.5023,0.29973,0.8324,-0.52574,0.60577,0.72004,-0.5023,1.04321,-0.11143,0.25115,1.01371,-0.26047,-0.0,0.9343,-0.39111,-0.25115,0.9343,0.4946,-0.25115,1.01371,0.35755,0.0,1.04321,0.1838,0.25115,0.16926,-1.01942,0.25115,0.0,-1.06,-0.0,-0.16849,-0.98426,-0.25115,0.74592,-0.66017,-0.25115,0.62651,-0.82756,0.0,0.47547,-0.90952,0.25115,-0.9386,-0.42627,0.25115,-1.01371,-0.26047,-0.0,-1.03843,-0.07627,-0.25115,-0.47329,-0.87436,-0.25115,-0.62651,-0.82756,0.0,-0.74935,-0.69533,0.25115,-0.74935,0.6681,0.25115,-0.62651,0.79048,-0.0,-0.47329,0.85402,-0.25115,-1.03843,0.21896,-0.25115,-1.01371,0.35755,0.0,-0.9386,0.45944,0.25115,0.47547,0.81886,0.25115,0.62651,0.79048,-0.0,0.74592,0.70326,-0.25115,-0.16849,0.92659,-0.25115,0.0,0.94,0.0,0.16926,0.89143,0.25115,0.88541,-0.23427,0.5023,0.72996,-0.51509,0.52574,0.51563,-0.75293,0.5023,0.03158,-0.92149,0.5023,-0.27882,-0.85923,0.52574,-0.56673,-0.71371,0.5023,-0.86589,-0.29336,0.5023,-0.90228,0.00661,0.52574,-0.86589,0.29712,0.5023,-0.56673,0.64972,0.5023,-0.27882,0.75879,0.52574,0.03158,0.80688,0.5023,0.51563,0.6802,0.5023,0.72996,0.4849,0.52574,0.88541,0.24344,0.5023,0.07787,-0.30326,0.96795,0.16402,-0.55125,0.85065,0.24085,-0.76351,0.65752,0.77944,-0.01197,0.65751,0.53081,-0.04296,0.85065,0.25201,-0.06397,0.96795,-0.20388,-0.21175,0.96795,-0.42943,-0.35514,0.85065,-0.63058,-0.46818,0.65752,-0.20388,0.08348,0.96795,-0.42943,0.26288,0.85065,-0.63058,0.41753,0.65752,0.07787,0.17445,0.96795,0.16402,0.44874,0.85065,0.24085,0.66962,0.65752,0.36423,0.21059,0.89443,0.65331,0.23684,0.72361,0.4578,0.48786,0.72361,-0.13913,0.37037,0.89443,-0.05404,0.63904,0.72361,-0.37037,0.54596,0.72361,-0.45022,-0.05061,0.89443,-0.68671,0.13888,0.72361,-0.68671,-0.18604,0.72361,-0.13913,-0.48027,0.89443,-0.37037,-0.6296,0.72361,-0.05404,-0.73733,0.72361,0.36423,-0.31513,0.89443,0.4578,-0.5636,0.72361,0.65331,-0.28888,0.72361,0.94021,0.44134,0.2764,0.86232,0.60632,0.0,0.73185,0.67177,0.2764,-0.15077,0.88687,0.2764,-0.32937,0.90252,-0.0,-0.4879,0.80652,0.2764,-1.03339,0.1956,0.2764,-1.06588,0.06,0.0,-1.03339,-0.12931,0.2764,-0.4879,-0.89478,0.2764,-0.32938,-0.9996,-0.0,-0.15077,-1.01524,0.2764,0.73185,-0.70461,0.2764,0.86232,-0.56924,-0.0,0.94021,-0.4093,0.27639,0.32938,0.90252,-0.0,0.48814,0.84521,-0.2764,0.15085,0.92557,-0.2764,-0.86232,0.60632,-0.0,-0.7322,0.71046,-0.2764,-0.94066,0.48004,-0.2764,-0.86232,-0.56924,0.0,-0.94067,-0.37061,-0.2764,-0.7322,-0.66592,-0.2764,0.32938,-0.9996,0.0,0.15085,-0.97654,-0.2764,0.48814,-0.85608,-0.2764,1.06588,0.06,0.0,1.03389,-0.09062,-0.2764,1.03389,0.2343,-0.2764,0.40272,0.64727,-0.72361,0.14653,0.49559,-0.89443,0.05876,0.74035,-0.72361,-0.49779,0.58916,-0.72361,-0.38362,0.33581,-0.89443,-0.71037,0.33815,-0.72361,-0.71037,-0.18758,-0.72361,-0.38362,-0.18991,-0.89443,-0.49779,-0.46229,-0.72361,0.74668,0.24018,-0.72361,0.74668,-0.08473,-0.72361,0.47418,0.07461,-0.89443,0.05876,-0.63602,-0.72361,0.14653,-0.35505,-0.89443,0.40272,-0.52829,-0.72361],"normal":[1e-05,-0.00083,-1.0,0.72423,-0.52909,-0.44221,-0.27044,-0.79719,-0.53976,-0.92062,0.00427,-0.39043,-0.22732,0.91924,-0.32144,0.69198,0.61724,-0.37442,0.29235,-0.83217,0.47119,-0.71426,-0.50476,0.48481,-0.64391,0.55271,0.52905,0.22372,0.86977,0.43983,0.84375,0.00144,0.53673,0.0,-0.00382,0.99999,-0.21096,-0.65643,-0.72429,-0.14789,-0.47611,-0.86686,-0.07612,-0.24595,-0.96629,0.19756,-0.15151,-0.96851,0.38012,-0.29329,-0.8772,0.5517,-0.41877,-0.72129,0.50817,-0.6604,-0.55284,0.25124,-0.7532,-0.60792,-0.01954,-0.79776,-0.60266,0.81136,0.33222,-0.48096,0.85228,0.00448,-0.52307,0.81472,-0.29616,-0.49852,0.19599,0.15177,-0.96879,0.37717,0.31076,-0.87245,0.54475,0.47441,-0.69151,-0.68376,0.00311,-0.7297,-0.4625,0.00113,-0.88662,-0.24205,-0.00042,-0.97026,-0.4761,-0.67773,-0.56038,-0.67207,-0.49621,-0.54963,-0.82786,-0.26231,-0.49583,-0.20088,0.7697,-0.60598,-0.14669,0.52072,-0.84103,-0.07538,0.24871,-0.96564,-0.82541,0.2923,-0.48297,-0.65173,0.57411,-0.49562,-0.43539,0.79383,-0.42458,-0.01653,0.92481,-0.38006,0.22293,0.87787,-0.42385,0.46702,0.77128,-0.43246,0.96008,-0.15801,0.23082,0.95026,-0.31042,-0.02531,0.8772,-0.44114,-0.18951,0.84542,0.51708,-0.13377,0.93343,0.35809,0.02188,0.95043,0.17339,0.25812,0.16655,-0.95647,0.23966,-0.00024,-0.99778,-0.0666,-0.159,-0.92206,-0.35287,0.69888,-0.66981,-0.25084,0.62007,-0.78255,-0.05589,0.47623,-0.84931,0.22776,-0.875,-0.43308,0.21635,-0.95193,-0.30529,-0.02501,-0.97519,-0.16191,-0.15097,-0.45943,-0.83152,-0.31224,-0.61828,-0.78408,-0.05425,-0.70956,-0.67124,0.21439,-0.60031,0.75108,0.27479,-0.4859,0.87203,0.0589,-0.35823,0.92577,-0.12088,-0.97393,0.18183,-0.13562,-0.93531,0.35323,0.0207,-0.82446,0.49359,0.27684,0.35361,0.89832,0.26071,0.48731,0.87121,0.05924,0.61213,0.78036,-0.12779,-0.11331,0.98714,-0.11277,1e-05,0.99762,0.06889,0.11258,0.96287,0.24538,0.7871,-0.24005,0.56821,0.67378,-0.47912,0.56254,0.50057,-0.68596,0.52809,0.02157,-0.84987,0.52655,-0.27435,-0.79131,0.54641,-0.53072,-0.66211,0.52909,-0.77959,-0.27448,0.56294,-0.79207,0.00173,0.61043,-0.7446,0.29198,0.60027,-0.44709,0.70834,0.54624,-0.21845,0.82429,0.52233,0.01598,0.87628,0.48155,0.41934,0.73282,0.53585,0.61003,0.51503,0.60217,0.75668,0.25555,0.60178,0.08296,-0.25813,0.96254,0.16845,-0.50807,0.84468,0.2377,-0.69742,0.67609,0.68751,0.0003,0.72617,0.50609,-0.00241,0.86248,0.2582,-0.00394,0.96608,-0.21404,-0.15949,0.96372,-0.42769,-0.31059,0.84889,-0.58854,-0.42167,0.6898,-0.20428,0.14677,0.96785,-0.39617,0.29992,0.86781,-0.53683,0.43605,0.72227,0.07714,0.23828,0.96813,0.14945,0.4897,0.85899,0.20006,0.71737,0.66735,0.34708,0.25846,0.90152,0.57407,0.26013,0.77638,0.40226,0.51339,0.75803,-0.13096,0.42068,0.89771,-0.05267,0.68592,0.72577,-0.31507,0.58544,0.74699,-0.4426,-0.00298,0.89671,-0.61266,0.15015,0.77595,-0.6332,-0.15,0.75931,-0.14595,-0.44382,0.88415,-0.35983,-0.5785,0.73202,-0.06114,-0.67962,0.73101,0.37238,-0.2719,0.88736,0.45043,-0.50724,0.73472,0.60782,-0.25848,0.75083,0.81633,0.48365,0.31573,0.74349,0.66672,0.05198,0.59412,0.74246,0.30948,-0.11125,0.95601,0.27142,-0.23333,0.96962,0.07349,-0.35523,0.8888,0.28955,-0.93807,0.17302,0.30016,-0.99997,0.00605,0.00446,-0.94884,-0.15625,0.27438,-0.47325,-0.84097,0.26229,-0.33949,-0.93911,-0.05303,-0.16138,-0.94823,0.27354,0.70158,-0.66601,0.25341,0.8217,-0.56892,-0.0337,0.86678,-0.42786,0.25618,0.23318,0.9706,0.05973,0.36093,0.92039,-0.15038,0.11224,0.98361,-0.1411,-0.74342,0.66789,0.03531,-0.60852,0.77656,-0.16325,-0.84333,0.5097,-0.1703,-0.8207,-0.56908,-0.05102,-0.87128,-0.43658,-0.22423,-0.68952,-0.66604,-0.28451,0.33861,-0.93802,-0.07397,0.15288,-0.91126,-0.3824,0.45595,-0.82183,-0.34162,0.99991,0.00608,-0.01228,0.96841,-0.16217,-0.18943,0.96715,0.18446,-0.1749,0.31325,0.62811,-0.71228,0.12832,0.44538,-0.8861,0.05254,0.73563,-0.67534,-0.39992,0.55064,-0.73271,-0.33032,0.26692,-0.90534,-0.56221,0.27804,-0.77885,-0.56466,-0.25627,-0.78453,-0.33281,-0.25654,-0.90743,-0.40487,-0.48614,-0.77444,0.59603,0.15878,-0.7871,0.59719,-0.14822,-0.78829,0.40542,0.00062,-0.91413,0.05345,-0.63398,-0.7715,0.12927,-0.41714,-0.8996,0.31923,-0.54855,-0.77278],"uv":[0.4,0.4301,0.80743,0.25191,0.32077,0.09373,0.01999,0.48938,0.32077,0.82529,0.80743,0.70403,0.67256,0.15625,0.21004,0.31443,0.21004,0.76655,0.67256,0.88781,0.95841,0.5519,0.6,0.5699,0.32121,0.14552,0.33993,0.22911,0.36848,0.33108,0.49411,0.37042,0.6113,0.31343,0.7302,0.27251,0.71025,0.17311,0.57631,0.10961,0.43526,0.08377,0.84775,0.60777,0.86449,0.48192,0.84775,0.35386,0.49411,0.49737,0.6113,0.57918,0.7302,0.65337,0.06844,0.46869,0.17221,0.44767,0.29084,0.43397,0.21278,0.15625,0.11001,0.25759,0.04282,0.37927,0.32121,0.76177,0.33993,0.6591,0.36848,0.53649,0.04282,0.58469,0.11001,0.68758,0.21278,0.77249,0.43526,0.82697,0.57631,0.80536,0.71025,0.75939,0.9737,0.4772,0.9359,0.388,0.87663,0.30671,0.87663,0.68756,0.9359,0.65375,0.9737,0.60415,0.5979,0.08677,0.5,0.0442,0.40244,0.05165,0.79563,0.19101,0.7694,0.14415,0.72957,0.13402,0.12152,0.34182,0.0641,0.388,0.02836,0.44209,0.27137,0.09891,0.2306,0.14415,0.20289,0.22612,0.20289,0.8124,0.2306,0.8399,0.27137,0.84211,0.02836,0.56904,0.0641,0.65375,0.12152,0.72268,0.72957,0.87722,0.7694,0.8399,0.79563,0.77729,0.40244,0.87332,0.5,0.9042,0.5979,0.90843,0.93096,0.44949,0.86646,0.33108,0.77195,0.22647,0.56381,0.15399,0.43268,0.18311,0.30653,0.24334,0.1779,0.42409,0.16459,0.55542,0.1779,0.67799,0.30653,0.82961,0.43268,0.87886,0.56381,0.89719,0.77195,0.84271,0.86646,0.76108,0.93096,0.65491,0.63028,0.46639,0.6556,0.34803,0.66932,0.23744,0.90091,0.56061,0.81331,0.56659,0.70516,0.56929,0.50913,0.50574,0.40041,0.43235,0.2946,0.36443,0.50913,0.63269,0.40041,0.6981,0.2946,0.74529,0.63028,0.67181,0.6556,0.77802,0.66932,0.85369,0.74606,0.68,0.85328,0.6742,0.76922,0.78214,0.52962,0.7487,0.54912,0.84715,0.4131,0.80712,0.39585,0.56768,0.27708,0.63208,0.27708,0.49237,0.52962,0.38293,0.4131,0.30163,0.54912,0.25531,0.74606,0.45394,0.76922,0.33001,0.85328,0.44814,0.93193,0.71742,0.8708,0.76072,0.84234,0.8165,0.46281,0.909,0.35837,0.88808,0.31784,0.87444,0.08328,0.61175,0.04167,0.5258,0.08328,0.47203,0.31784,0.14288,0.35837,0.07017,0.46281,0.09109,0.84234,0.22466,0.8708,0.25523,0.93193,0.35164,0.64163,0.88808,0.68226,0.8358,0.53722,0.87036,0.1292,0.76072,0.15751,0.77786,0.06787,0.67878,0.1292,0.25523,0.06787,0.313,0.15751,0.18602,0.64163,0.07017,0.53722,0.05245,0.68226,0.10424,0.95833,0.5258,0.91693,0.43339,0.91693,0.57311,0.60081,0.70596,0.47357,0.62366,0.45291,0.74599,0.21359,0.68098,0.2456,0.55496,0.12218,0.57304,0.12218,0.34698,0.2456,0.32889,0.21359,0.22885,0.74871,0.53092,0.74871,0.3912,0.61445,0.44264,0.45291,0.15415,0.47357,0.25788,0.60081,0.20047],"index":[0,15,14,1,17,23,0,14,29,0,29,35,0,35,24,1,23,44,2,20,50,3,32,56,4,38,62,5,41,68,1,44,51,2,50,57,3,56,63,4,62,69,5,68,45,6,74,89,7,77,95,8,80,98,9,83,101,10,86,90,92,99,11,91,102,92,90,103,91,92,102,99,102,100,99,91,103,102,103,104,102,102,104,100,104,101,100,90,86,103,86,85,103,103,85,104,85,84,104,104,84,101,84,9,101,99,96,11,100,105,99,101,106,100,99,105,96,105,97,96,100,106,105,106,107,105,105,107,97,107,98,97,101,83,106,83,82,106,106,82,107,82,81,107,107,81,98,81,8,98,96,93,11,97,108,96,98,109,97,96,108,93,108,94,93,97,109,108,109,110,108,108,110,94,110,95,94,98,80,109,80,79,109,109,79,110,79,78,110,110,78,95,78,7,95,93,87,11,94,111,93,95,112,94,93,111,87,111,88,87,94,112,111,112,113,111,111,113,88,113,89,88,95,77,112,77,76,112,112,76,113,76,75,113,113,75,89,75,6,89,87,92,11,88,114,87,89,115,88,87,114,92,114,91,92,88,115,114,115,116,114,114,116,91,116,90,91,89,74,115,74,73,115,115,73,116,73,72,116,116,72,90,72,10,90,47,86,10,46,117,47,45,118,46,47,117,86,117,85,86,46,118,117,118,119,117,117,119,85,119,84,85,45,68,118,68,67,118,118,67,119,67,66,119,119,66,84,66,9,84,71,83,9,70,120,71,69,121,70,71,120,83,120,82,83,70,121,120,121,122,120,120,122,82,122,81,82,69,62,121,62,61,121,121,61,122,61,60,122,122,60,81,60,8,81,65,80,8,64,123,65,63,124,64,65,123,80,123,79,80,64,124,123,124,125,123,123,125,79,125,78,79,63,56,124,56,55,124,124,55,125,55,54,125,125,54,78,54,7,78,59,77,7,58,126,59,57,127,58,59,126,77,126,76,77,58,127,126,127,128,126,126,128,76,128,75,76,57,50,127,50,49,127,127,49,128,49,48,128,128,48,75,48,6,75,53,74,6,52,129,53,51,130,52,53,129,74,129,73,74,52,130,129,130,131,129,129,131,73,131,72,73,51,44,130,44,43,130,130,43,131,43,42,131,131,42,72,42,10,72,66,71,9,67,132,66,68,133,67,66,132,71,132,70,71,67,133,132,133,134,132,132,134,70,134,69,70,68,41,133,41,40,133,133,40,134,40,39,134,134,39,69,39,4,69,60,65,8,61,135,60,62,136,61,60,135,65,135,64,65,61,136,135,136,137,135,135,137,64,137,63,64,62,38,136,38,37,136,136,37,137,37,36,137,137,36,63,36,3,63,54,59,7,55,138,54,56,139,55,54,138,59,138,58,59,55,139,138,139,140,138,138,140,58,140,57,58,56,32,139,32,31,139,139,31,140,31,30,140,140,30,57,30,2,57,48,53,6,49,141,48,50,142,49,48,141,53,141,52,53,49,142,141,142,143,141,141,143,52,143,51,52,50,20,142,20,19,142,142,19,143,19,18,143,143,18,51,18,1,51,42,47,10,43,144,42,44,145,43,42,144,47,144,46,47,43,145,144,145,146,144,144,146,46,146,45,46,44,23,145,23,22,145,145,22,146,22,21,146,146,21,45,21,5,45,26,41,5,25,147,26,24,148,25,26,147,41,147,40,41,25,148,147,148,149,147,147,149,40,149,39,40,24,35,148,35,34,148,148,34,149,34,33,149,149,33,39,33,4,39,33,38,4,34,150,33,35,151,34,33,150,38,150,37,38,34,151,150,151,152,150,150,152,37,152,36,37,35,29,151,29,28,151,151,28,152,28,27,152,152,27,36,27,3,36,27,32,3,28,153,27,29,154,28,27,153,32,153,31,32,28,154,153,154,155,153,153,155,31,155,30,31,29,14,154,14,13,154,154,13,155,13,12,155,155,12,30,12,2,30,21,26,5,22,156,21,23,157,22,21,156,26,156,25,26,22,157,156,157,158,156,156,158,25,158,24,25,23,17,157,17,16,157,157,16,158,16,15,158,158,15,24,15,0,24,12,20,2,13,159,12,14,160,13,12,159,20,159,19,20,13,160,159,160,161,159,159,161,19,161,18,19,14,15,160,15,16,160,160,16,161,16,17,161,161,17,18,17,1,18]}};
function natureGeometry(name){
  const source=natureModels[name];
  const geometry=new THREE.BufferGeometry();
  for(const key of ['position','normal','uv','color']){
    if(source[key])geometry.setAttribute(key,new THREE.Float32BufferAttribute(source[key],key==='uv'?2:3));
  }
  geometry.setIndex(source.index);
  geometry.computeBoundingSphere();
  return geometry;
}

const geo = {
  penPost:penKitGeometry('post'),penCap:penKitGeometry('cap'),penRail:penKitGeometry('rail'),
  firBough:needleWhorlGeometry(false),firSnow:needleWhorlGeometry(true),
  box:new THREE.BoxGeometry(1,1,1),ball:new THREE.SphereGeometry(1,16,12),
  lobe:new THREE.IcosahedronGeometry(1,2),rock:natureGeometry('rock'),
  stone:natureGeometry('stone'),cyl:new THREE.CylinderGeometry(1,1,1,10),
  taper:new THREE.CylinderGeometry(.63,1,1,8),cone:new THREE.ConeGeometry(1,1,12),
  blade:bladeGeometry(),flower:blossomGeometry(),fleece:fleeceGeometry(),horn:hornGeometry(),sow:natureGeometry('pig'),doe:natureGeometry('goat'),drake:natureGeometry('duck'),pigEar:foldEarGeometry(),pigTail:curlyTailGeometry(),spray:natureGeometry('spray'),canopy:natureGeometry('canopy'),plane:new THREE.PlaneGeometry(1,1),ring:new THREE.RingGeometry(.82,1,48)
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
  if(config.cave){
    const {x,z,length,width}=config.cave;
    flattening.push({x,z,rx:length*.77,rz:width*1.1,y:rawHeight(x,z),inner:.86,outer:1.31});
  }
  for(const [x,z] of [config.house,config.mill].filter(Boolean))flattening.push({x,z,rx:6.5,rz:5.6,y:rawHeight(x,z),inner:.83,outer:1.74});
}
function rawHeight(x,z){
  const config=activeMission();
  let altitude=.45*Math.sin(x*.052+z*.064)+.72*Math.cos(z*.075-.4)*Math.sin(x*.068-.7)+.24*Math.sin(x*.17+z*.18);
  for(const [hx,hz,h,rx,rz] of config.hills)altitude+=h*Math.exp(-(((x-hx)/rx)**2+((z-hz)/rz)**2));
  const rim=Math.max(Math.abs(x)/config.half[0],Math.abs(z)/config.half[1]);
  altitude+=smooth(.79,1.55,rim)*(3.2+3*Math.sin(x*.029-z*.041)+2.1*Math.cos(z*.058+x*.044));
  if(config.biome==='toy')return altitude*.23;
  if(config.biome==='coast')return altitude-8.6*smooth(-62,-82,x);
  return config.biome==='cloud'?altitude-28*smooth(.92,1.30,rim):altitude;
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
  if(config.biome==='toy'){
    const fill=['#d0be83','#abbdad','#d5aa9a','#a4a9b5'];
    const [halfX,halfZ]=config.half;
    for(let i=0;i<4;i++){
      const x=(i%2?.47:-.44)*halfX,z=(i<2?-.48:.49)*halfZ;
      const rx=halfX*.34*res/(2*hx),rz=halfZ*.33*res/(2*hz);
      ctx.beginPath();ctx.ellipse(px(x),pz(z),rx,rz,(i%2?.20:-.26),0,TAU);
      ctx.fillStyle=fill[i]+'a8';ctx.fill();
      ctx.strokeStyle='#e7d8b8ba';ctx.lineWidth=2.2;
      ctx.setLineDash?.([5,4]);ctx.stroke();ctx.setLineDash?.([]);
    }
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
  if(['cloud','ember','toy','angel','paper','night'].includes(config.biome))return;
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
      const wood=Boolean(m.userData.timber);
      const key=[Math.floor(position.x/box),Math.floor(position.z/box),m.geometry.id,shadows,wind,wood].join(',');
      if(!batches.has(key))batches.set(key,{g:m.geometry,m:shadows?shadowPaint:wood?woodBatch():paintBatches[wind],shadows,matrices:[],colors:[]});
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
      batch.castShadow=g===geo.firBough||g===geo.firSnow||g===geo.penPost||g===geo.penRail||g===geo.penCap||g===geo.canopy||g===geo.box||g===geo.taper||g===geo.stone||g===geo.lobe;
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
  const colors=activeMission().biome==='snow'?['#5b706e','#7e9493','#96aaaa','#6a8989']:ch===1?['#8d9b61','#9dad6d','#aebb79','#77895f']:['#749367','#87a373','#9bb57c','#64865f'];
  loaf(g,0,size*.41,0,size,colors);
  for(let i=0;i<14;i++){
    const a=random()*TAU,r=.5+random()*.44;
    const berries=activeMission().biome==='snow'?['#bdc9c7','#c3d1d4','#c4cdd1','#cfd9dc']:['#d8b477','#d89784','#acbd83','#e6c991'];
    mesh(g,'rock',choose(berries),Math.cos(a)*r*size,(.60+random()*.35)*size,Math.sin(a)*r*size,.07,.065,.09);
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
  g.setAttribute('position',new THREE.Float32BufferAttribute([
    -.052,0,0,.052,0,0,-.061,.30,.043,.044,.30,.043,
    -.039,.62,.155,.037,.62,.155,-.016,.86,.286,.018,.86,.286,
    .008,1,.393
  ],3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,.3,1,.3,0,.62,1,.62,0,.86,1,.86,.5,1],2));
  g.setIndex([0,1,3,0,3,2,2,3,5,2,5,4,4,5,7,4,7,6,6,7,8]);
  g.computeVertexNormals();return g;
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
      chestnut(post,'penPost','#987959',0,.87,0,.25,1.80,.26);
      const finial=mesh(post,'stone',species==='sheep'?'#e2b96f':'#9ab5a0',0,1.85,0,.22,.18,.22);finial.rotation.y=.41;
    }
    const hayArea=[right-2.04,back+1.88];
    hay(hayArea[0],hayArea[1],1.25,false);
    const trough=group(decor,right-2.3,groundY(right-2.3,front-2.3),front-2.3);
    stoneTrough(trough,species);
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

function meadowMaterial(config,hx,hz){
  const m=new THREE.MeshLambertMaterial({map:meadowTexture(config,hx,hz)});
  if(washTexture&&terrainPaint){
    m.onBeforeCompile=shader=>{
      shader.uniforms.paper={value:washTexture};
      shader.uniforms.meadowPigment={value:terrainPaint};
      shader.uniforms.snowTerrain={value:config.biome==='snow'?1:0};
      shader.uniforms.rainAmount=rainAmount;
      shader.vertexShader='varying vec3 meadowWorld;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nmeadowWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
      shader.fragmentShader='varying vec3 meadowWorld; uniform sampler2D paper; uniform sampler2D meadowPigment; uniform float rainAmount, snowTerrain;\n'+shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        vec2 detailUV=meadowWorld.xz;
        vec3 smallPaint=texture2D(meadowPigment,detailUV*.3179).rgb;
        vec3 largePaint=texture2D(meadowPigment,vec2(detailUV.x*.107+detailUV.y*.033,detailUV.y*.107-detailUV.x*.033)).rgb;
        float grain=texture2D(paper,detailUV*.71).r;
        float edgeWisp=dot(smallPaint,vec3(.42,.51,.07));
        float trackGrain=dot(largePaint,vec3(.35,.51,.14));
        float grass=1.0-smoothstep(.012,.075,diffuseColor.r-diffuseColor.g);
        vec3 earthy=mix(vec3(.65+grain*.20+edgeWisp*.35+trackGrain*.23),vec3(.54)+smallPaint*.89+largePaint*.55,grass*.85);
        vec2 gravel=detailUV*24.0;
        vec2 gravelCell=floor(gravel);
        vec2 jitter=vec2(fract(sin(dot(gravelCell,vec2(17.1,92.6)))*7458.4),fract(sin(dot(gravelCell,vec2(51.8,12.7)))*6521.3));
        float grit=(1.0-smoothstep(.035,.18,length(fract(gravel)-(.25+jitter*.50))))*(jitter.x-.46);
        vec3 chroma=mix(vec3(.94,.86,.78)*(1.0+grit*.55),vec3(.86,1.04,.92),grass);
        float brush=smoothstep(.18,.55,trackGrain)*smoothstep(.16,.51,edgeWisp);
        vec3 snowColor=vec3(.88,1.0,1.075);
        float snowCover=smoothstep(0.01,.18,diffuseColor.b-diffuseColor.r+.12);
        vec3 snowPigment=mix(vec3(.86,.83,.81)*(1.0+grit*.22),snowColor*(.93+grain*.11),snowCover);
        diffuseColor.rgb*=mix(earthy*chroma*(.83+brush*.27),snowPigment,snowTerrain)*(1.0-.22*rainAmount);
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
      transformed.x+=(ripple*.27+gust*.42)*amplitude*breezeStrength;
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
    ['#50744a','#648c56','#789d5b','#91af69','#abbb7a','#668955'];
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
  if(config.id==='premier'||config.id==='lecon'){
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
  const biome=activeMission().biome;
  const colors=biome==='snow'?['#89968e','#c1c7ad','#a5b7ae']:
    biome==='coast'?['#7e9274','#b6a975','#57927b','#c9b88a']:
    biome==='marsh'?['#819263','#b5a576','#638772','#9daa75']:
    biome==='garrigue'?['#a38c53','#bbac69','#777f5a','#92955f']:
    biome==='cloud'?['#9bb39b','#89a698','#a9b5b2','#bdcca6']:
    biome==='ember'?['#885f4e','#9e8866','#767970','#b2a689']:
    ['#789154','#8c9f67','#b2b977','#6c865d','#9fac75','#8ba972'];
  for(let i=0;i<5;i++){
    const xx=x+(random()-.5)*.65,zz=z+(random()-.5)*.56,h=(.29+random()*.42)*size;
    const blade=mesh(decor,'blade',choose(colors),xx,groundY(xx,zz)+.015,zz,(.19+random()*.10)*size,h*.79,.54*size);
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
  const water=new THREE.MeshLambertMaterial({color:activeMission().region===2?'#75a7aa':'#86b0ae',map:washTexture||null});
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
function needleWhorlGeometry(snow){
  const rings=snow?[[.055,.69],[.26,.34],[.49,.12],[.70,-.053],[.62,-.065]]:
    [[.018,.73],[.25,.38],[.53,.12],[.78,-.10],[1,-.24],[.60,-.23],[.14,-.14],[.014,-.09]];
  const sides=42,points=[],uv=[],indices=[];
  for(let j=0;j<rings.length;j++){
    const [radius,height]=rings[j];
    for(let i=0;i<=sides;i++){
      const a=i%sides*TAU/sides;
      const tip=.66+.28*Math.pow(.5+.5*Math.cos(a*7.0),2.0)+.076*Math.cos(a*5.0+1);
      const r=radius*(j<2?1:tip);
      const sag=(Math.cos(a*7)*.055+.032*Math.sin(a*13))*(j<2?.2:radius);
      points.push(Math.cos(a)*r,height-sag,Math.sin(a)*r);uv.push(i/sides,j/(rings.length-1));
      if(j&&i){const n=points.length/3-1;indices.push(n-sides-2,n-sides-1,n,n-sides-2,n,n-1);}
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}
function fir(x,z,size,snow){
  if(aroundEntrance(x,z))return;
  const tree=group(decor,x,groundY(x,z),z),h=(4.7+random()*2.5)*size;
  rod(tree,'taper',snow?'#665c53':'#57493b',[0,0,0],[.076*size,h,0],.19*size);
  const needles=snow?['#3d5c60','#4d676b','#647e7c']:['#2a5449','#356451','#4f774f','#608259'];
  const powder=['#d1dce1','#b9cdd4','#e1e7e8'];
  const turn=(Math.sin(x*2.816+z*.44)+1)*Math.PI;
  for(let ring=0;ring<7;ring++){
    const lift=.25+.106*ring,r=(1.77-.217*ring)*size,wide=r*(1+.08*Math.sin(ring*3.2+turn));
    const color=needles[ring%needles.length];
    const whorl=mesh(tree,'firBough',color,.061*size*Math.sin(ring),h*lift,0,wide,1.33*r,wide*.93);
    whorl.rotation.y=turn+ring*.491;whorl.userData.wind=2;
    if(snow){
      const snowed=mesh(tree,'firSnow',powder[ring%3],whorl.position.x,h*lift+.093*size,0,wide*1.02,1.33*r,wide*.948);
      snowed.rotation.y=whorl.rotation.y;snowed.userData.wind=2;
    }
  }
  obstacle(x,z,.36*size,h);shade(x+.4*size,z+.25*size,3.9*size,4*size,.52);
}
function lighthouse(config){
  const [x,z]=config.id==='maree'?[-57,-34]:config.id==='roseaux'?[-58,-41]:config.id==='dunes'?[-56,-22]:[-56,-43];
  const g=group(decor,x,groundY(x,z),z);
  mesh(g,'cyl','#b5ad90',0,.39,0,2.14,.75,2.14);
  mesh(g,'taper','#f4e5ca',0,3.4,0,1.29,6.6,1.29);
  mesh(g,'cyl','#954c43',0,4.6,0,1.14,.85,1.14);
  mesh(g,'cyl','#e1d3b4',0,6.42,0,1.56,.24,1.56);
  mesh(g,'cyl','#769c99',0,6.96,0,.88,.92,.88);
  mesh(g,'taper','#91493b',0,7.78,0,1.45,.82,1.45);
  for(let n=0;n<10;n++){
    const a=TAU*n/10;
    mesh(g,'cyl','#74554b',Math.sin(a)*1.23,6.68,Math.cos(a)*1.23,.048,.48,.048);
  }
  obstacle(x,z,1.35,8);
  const sea=mesh(props,'plane',new THREE.MeshLambertMaterial({color:'#80b6bc'}),-160,-2.9,0,189,252,1);
  sea.rotation.x=-Math.PI/2;
}
function iceAt(x,z){
  return activeMission().ice?.some(([cx,cz,rx,rz])=>((x-cx)/rx)**2+((z-cz)/rz)**2<1);
}
function paintIce(config){
  for(const [x,z,rx,rz] of config.ice||[]){
    const n=32,coords=[x,groundY(x,z)+.052,z],idx=[];
    for(let i=0;i<n;i++){
      const a=TAU*i/n,r=1+.075*Math.sin(a*7);
      const px=x+Math.cos(a)*rx*r,pz=z+Math.sin(a)*rz*r;
      coords.push(px,groundY(px,pz)+.052,pz);idx.push(0,(i+1)%n+1,i+1);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));geometry.setIndex(idx);geometry.computeVertexNormals();
    props.add(new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({color:'#91bcc9',transparent:true,opacity:.81,side:THREE.DoubleSide,depthWrite:false})));
  }
}
function snowPeaks(config){
  const rng=seeded(config.seed+3281),points=[],pigment=[],indices=[];
  const slate=new THREE.Color('#8da1b1'),frost=new THREE.Color('#dae2e6'),brush=new THREE.Color();
  const sides=22,rows=14;
  for(let k=0;k<11;k++){
    const x=-153+30*k,z=-112-rng()*42,height=29+rng()*27,radius=20+rng()*24;
    const centerBias=(rng()-.5)*radius*.49,phase=rng()*TAU;
    const ridges=Array.from({length:sides},()=>.85+rng()*.32);
    for(let row=0;row<=rows;row++){
      const f=row/rows;
      for(let side=0;side<=sides;side++){
        const a=side%sides*TAU/sides,crest=Math.sin(a*5.0+phase);
        const base=ridges[side%sides]*(.92+.14*Math.cos(a*3.0+phase));
        const r=radius*(.014+Math.pow(1-f,.98)*base)*(1+.07*Math.sin(f*21.0+a*3));
        const altitude=3+height*f+4*r/radius*(.64*crest+.36*Math.cos(a*7+f*17));
        points.push(x+centerBias*f+Math.cos(a)*r,altitude,z+.13*radius*f+Math.sin(a)*r*.87);
        const dust=smooth(.25,.73,f+.12*Math.sin(a*4+f*9+phase));
        brush.copy(slate).lerp(frost,dust).multiplyScalar(.98+.045*crest);
        pigment.push(brush.r,brush.g,brush.b);
        if(row&&side){const i=points.length/3-1;indices.push(i-sides-2,i-1,i,i-sides-2,i,i-sides-1);}
      }
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(pigment,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  props.add(new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})));
}
function regionalTree(config,x,z,size,rim){
  if(config.biome==='cloud'){tree(x,z,size*.72,false,'birch');return;}
  if(config.biome==='ember'){tree(x,z,size*.49,false,'oak');return;}
  if(config.biome==='wood'||config.biome==='snow'){fir(x,z,size,config.biome==='snow');return;}
  if(config.biome==='bocage'){
    tree(x,z,size*.88,false,rim?'oak':'birch');return;
  }
  if(config.biome==='marsh'||config.biome==='garrigue'&&(rim||Math.sin(x*.81+z*.55)>.28)){
    valleyTree(config,x,z,size*.92);return;
  }
  if(config.biome==='garrigue'){
    tree(x,z,size*.66,false,'oak');return;
  }
  tree(x,z,config.biome==='coast'?size*.68:size,config.region===1,
    rim?config.seed%6===0?'birch':'oak':'oak');
}

function decorate(config){
  if(config.biome!=='toy')farmhouse(...config.house);
  if(config.biome==='coast')lighthouse(config);
  if(config.biome==='snow')snowPeaks(config);
  paintIce(config);
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
      if(!nearTrail(xx,zz,config.bigFlock?15:1.82)&&!blocked(xx,zz,1.50)&&!Object.values(pens).some(p=>p.inside({x:xx,z:zz}))&&!config.animals.some(([,ax,az])=>Math.hypot(xx-ax,zz-az)<2.3))
        (config.biome?regionalTree(config,xx,zz,1.02+random()*.92,false):
          tree(xx,zz,1.02+random()*.92,config.region===1,i%6===0?'birch':i%3===0?'apple':'oak'));
    }
  }
  const [hx,hz]=config.half;
  for(let i=0;i<(config.biome==='toy'||config.biome==='paper'?0:config.biome==='ember'?19:config.biome==='cloud'?27:63);i++){
    const a=random()*TAU, r=.84+random()*.15;
    const xx=Math.cos(a)*hx*r,zz=Math.sin(a)*hz*r;
    if(!blocked(xx,zz,1.6)&&!nearTrail(xx,zz,4)){
      if(config.biome)regionalTree(config,xx,zz,1.1+random()*.89,true);
      else tree(xx,zz,1.1+random()*.89,config.region===1,i%5===0?'birch':'oak');
    }
  }
  for(let i=0;i<(config.biome==='toy'?0:config.bigFlock?58:240);i++){
    const x=(random()*2-1)*hx*.96,z=(random()*2-1)*hz*.96;
    if((config.bigFlock&&nearTrail(x,z,18))||blocked(x,z,1.15)||nearTrail(x,z,1.67)||Object.values(pens).some(p=>p.inside({x,z}))||config.animals.some(([,xx,zz])=>Math.hypot(x-xx,z-zz)<2.4))continue;
    if(i%7===0)bush(x,z,.58+random()*.60);
    else if(i%13===0)rocks(x,z,4,.85+random()*.55,true);
    else if(config.biome!=='snow')flowers(x,z,3+Math.floor(random()*9),.67+random()*.38);
  }
  for(let i=0;i<(config.biome==='toy'?0:config.biome==='paper'?500:config.biome==='ember'?610:config.biome==='snow'?530:config.biome==='wood'?1700:2320);i++){
    const x=(random()*2-1)*hx*.99,z=(random()*2-1)*hz*.99;
    if(!blocked(x,z,.18)&&!nearTrail(x,z,1.29)&&!Object.values(pens).some(p=>p.inside({x,z})))grass(x,z,.45+random()*.64);
  }
  const [sx,sz]=config.start;
  if(!['snow','toy','paper'].includes(config.biome))for(const [dx,dz] of [[-4,-5],[3,-8],[-5,-9],[5,-2],[-5,-1],[2,-14],[-3,-18]])flowers(sx+dx,sz+dz,15,.72);
  for(let i=0;i<(config.biome==='toy'?0:98);i++){
    const a=random()*TAU,r=Math.sqrt(random())*23;
    const x=sx+Math.cos(a)*r,z=sz+Math.sin(a)*r;
    if(!blocked(x,z,.22)&&!nearTrail(x,z,1.4))grass(x,z,.83);
  }
  if(config.id==='premier')signboard(6.8,7.9,'Bergerie ↗',null,.11);
  const house=config.house;
  if(config.biome!=='toy')strawShelter(house[0]+7.7,house[1]+1.95);
  for(let i=0;i<(config.biome==='toy'?0:8);i++){
    const x=house[0]-2.6+i*.61,z=house[1]+4.2;
    flowers(x,z,5,.37);
  }
  for(const [x,z,label] of config.landmarks)if(!blocked(x+1.5,z+2.9,.55)){
    signboard(x+1.5,z+2.9,label,null,-.22);
  }
  valleyFeatures(config);
  fantasyLand(config);
  decorateFantasyWorld(config);
  paintSetDressing(config);
}
function nearTrail(x,z,threshold){
  if(caveClearance(activeMission().cave,x,z))return true;
  for(const trail of activeMission().trails){
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
  const geo=new THREE.SphereGeometry(1,40,26);
  const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const curl=Math.sin(x*25.8+y*7.4)*Math.cos(z*22-y*11.2)+Math.sin(y*29.8+z*13.6)*Math.cos(x*26.1-z*8);
    const waves=Math.sin(z*8.1+x*5.1+y*6.4)*Math.sin(y*9.6-x*4.3);
    const ring=Math.sin(x*39.1+z*22.7+y*17.6)*Math.cos(y*35.1-z*12.3);
    const radius=1+.027*curl+.052*waves+.011*ring;
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


function foldEarGeometry(){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute([
    -.10,-.068,0,.067,-.06,.009,-.111,.125,.012,.079,.114,.024,
    -.133,.218,.069,-.013,.227,.065,-.086,.290,.104,-.049,.337,.091,.017,.282,.058,
    -.04,.069,.044,-.034,.193,.085
  ],3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute([.14,0,.82,0,.12,.42,.88,.37,.02,.63,.48,.66,.23,.86,.35,1,.64,.85,.39,.33,.47,.58],2));
  const front=[0,1,9,1,3,9,3,5,10,3,10,9,0,9,2,2,9,10,2,10,4,4,10,6,6,10,5,6,5,7,7,5,8];
  g.setIndex(front);
  g.computeVertexNormals();
  return g;
}
function curlyTailGeometry(){
  const rings=39,sides=8,positions=[],uv=[],indices=[];
  for(let n=0;n<=rings;n++){
    const t=n/rings,a=t*7.0,r=.049*(1-.24*t);
    const cx=Math.sin(a)*r,cy=.044+(1-Math.cos(a))*r,cz=-.18*t;
    const tube=.027*(1-.68*t);
    for(let i=0;i<=sides;i++){
      const u=i/sides,b=u*TAU;
      positions.push(cx+Math.cos(b)*tube,cy+Math.sin(b)*tube,cz+.009*Math.cos(b)*t);
      uv.push(u,t);
      if(n&&i){const j=n*(sides+1)+i;indices.push(j-sides-2,j-sides-1,j,j-sides-2,j,j-1);}
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(indices);g.computeVertexNormals();return g;
}

// Sections are [z, center height, half width, half depth]. The character looks along +Z.

const faceSections=[
  [-.25,.046,.02,.08],[-.20,.069,.156,.202],[-.12,.083,.224,.263],
  [.02,.046,.238,.271],[.154,-.007,.202,.238],[.25,-.069,.163,.184],
  [.35,-.093,.139,.128],[.438,-.102,.114,.068],[.484,-.106,.062,.029],
  [.495,-.105,.008,.012]
];
const sheepGeometry=new Map();
const sheepMaterials=new Map();

function livestockLoft(sections,rows,sides,roughness){
  const points=[],uv=[],pigment=[],indices=[];
  const last=sections.length-1;
  for(let row=0;row<=rows;row++){
    const t=row/rows*last,index=Math.min(last-1,Math.floor(t)),weight=t-index;
    const a=sections[index],b=sections[index+1],previous=sections[Math.max(0,index-1)],next=sections[Math.min(last,index+2)];
    const [z,cy,rx,ry]=a.map((value,i)=>{
      if(i===0)return mix(value,b[i],weight);
      const tangent=(b[i]-previous[i])*.5,end=(next[i]-value)*.5;
      return value+weight*(tangent+weight*(3*(b[i]-value)-2*tangent-end+weight*(2*(value-b[i])+tangent+end)));
    });
    for(let j=0;j<=sides;j++){
      const angle=j%sides/sides*TAU,c=Math.cos(angle),s=Math.sin(angle);
      const swirl=angle+.12*Math.sin(z*8.6);
      const curl=Math.sin(swirl*14+z*28)*Math.cos(swirl*7-z*18);
      const lock=Math.cos(swirl*8+z*15)*Math.sin(swirl*5-z*12);
      const tuft=1+roughness*(.072*lock+.044*curl+.021*Math.cos(swirl*19-z*39));
      const x=c*Math.max(.002,rx)*tuft,y=cy+s*Math.max(.002,ry)*tuft;
      points.push(x,y,z);uv.push(j/sides,row/rows);
      const value=1-roughness*(.092*(1-s)*.5+.053*(1-lock)*.5);
      pigment.push(value,value*.994,value*.985);
      if(row&&j){
        const p=points.length/3-1,q=p-sides-1;indices.push(q-1,q,p-1,q,p,p-1);
      }
    }
  }
  for(let j=1;j<sides-1;j++){
    const end=rows*(sides+1);indices.push(0,j+1,j,end,end+j,end+j+1);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  if(roughness)geometry.setAttribute('color',new THREE.Float32BufferAttribute(pigment,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  const normal=geometry.attributes.normal,join=new THREE.Vector3();
  for(let i=0;i<=rows;i++){
    const a=i*(sides+1),b=a+sides;
    join.set(normal.getX(a)+normal.getX(b),normal.getY(a)+normal.getY(b),normal.getZ(a)+normal.getZ(b)).normalize();
    normal.setXYZ(a,join.x,join.y,join.z);normal.setXYZ(b,join.x,join.y,join.z);
  }
  return geometry;
}

function sheepEarGeometry(){
  const positions=[],uv=[],indices=[];
  const shape=[[0,.045,-.057],[.075,.065,-.078],[.17,.062,-.064],[.25,.037,-.046],[.30,.004,-.025],[.314,-.012,-.022]];
  for(let k=0;k<shape.length;k++){
    const [x,width,fall]=shape[k];
    for(let j=0;j<7;j++){
      const u=(j-3)/3;
      positions.push(x,fall+width*u,.016+.039*(1-u*u)*Math.sin(k*Math.PI/5));
      uv.push(k/5,j/6);
      if(k&&j){const i=positions.length/3-1;indices.push(i-8,i-1,i,i-8,i,i-7);}
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}

let woolBump;
function woolHeight(){
  if(woolBump)return woolBump;
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d'),rng=seeded(77671);
  ctx.fillStyle='#777777';ctx.fillRect(0,0,128,128);
  const curls=Array.from({length:215},()=>[rng()*128,rng()*128,2.2+rng()*4.4,rng()*TAU,rng()]);
  for(const [x,y,r,a,v] of curls){
    for(const dx of [-128,0,128])for(const dy of [-128,0,128]){
      if(x+dx+r<0||x+dx-r>128||y+dy+r<0||y+dy-r>128)continue;
      ctx.lineWidth=1+v*1.8;
      ctx.strokeStyle=v<.3?'#636363':'#969696';
      ctx.beginPath();ctx.ellipse(x+dx,y+dy,r,r*.78,a,.4,5.2);ctx.stroke();
      ctx.strokeStyle='#b4b4b4';ctx.lineWidth=.85;
      ctx.beginPath();ctx.ellipse(x+dx-.45,y+dy-.6,r*.76,r*.55,a,1.1,4.9);ctx.stroke();
    }
  }
  woolBump=textureFromCanvas(canvas,false);
  woolBump.wrapS=woolBump.wrapT=THREE.RepeatWrapping;woolBump.repeat.set(3,2);
  return woolBump;
}

function sheepSurface(kind,color){
  const key=kind+color;
  if(sheepMaterials.has(key))return sheepMaterials.get(key);
  const body=kind==='fleece'||kind==='fleeceFar',microrelief=kind==='fleece'||kind==='tuft';
  const skin=kind==='skin',ear=kind==='ear';
  const material=new THREE.MeshStandardMaterial({color,roughness:(body||microrelief)? .98:skin?.87:ear?.91:.49,
    vertexColors:body,bumpMap:microrelief?woolHeight():null,bumpScale:microrelief?.015:0,side:ear?THREE.DoubleSide:THREE.FrontSide});
  if(microrelief){
    material.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',
        '#include <map_fragment>\n#ifdef USE_BUMPMAP\n float staple=texture2D(bumpMap,vBumpMapUv).x; diffuseColor.rgb*=.90+.19*staple;\n#endif');
    };
  }
  if(ear||skin){
    material.onBeforeCompile=shader=>{
      shader.vertexShader='varying vec2 skinUV;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nskinUV=uv;');
      shader.fragmentShader='varying vec2 skinUV;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        ${ear?'float cup=(1.0-smoothstep(.39,.53,length((skinUV-vec2(.54,.51))*vec2(.95,1.24))))*(gl_FrontFacing?1.0:.25); diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.75,1.23,1.18)+vec3(.034,.012,.009),cup*.68);':
        'float bridge=sin(skinUV.x*6.28318); diffuseColor.rgb*=.92+.16*bridge*bridge; diffuseColor.rgb*=1.0-smoothstep(.68,1.01,skinUV.y)*.43;'}`);
    };
    material.customProgramCacheKey=()=>kind;
  }
  sheepMaterials.set(key,material);
  return material;
}

function sheepModel(actor,variant){
  const tones=[
    ['#eee1c6','#615046','#615044'],['#efe7d5','#655345','#806554'],
    ['#d6c5ae','#3c3835','#514840'],['#f0dbb6','#796453','#897368']
  ];
  const [wool,face,earColor]=tones[variant%tones.length];
  const fleece=sheepSurface('fleece',wool),skin=sheepSurface('skin',face),earPaint=sheepSurface('ear',earColor);
  const distantWool=sheepSurface('fleeceFar',wool);
  const tuft=sheepSurface('tuft',wool);
  const hoof=sheepSurface('hoof','#39352f'),nose=sheepSurface('nose','#4b3935');
  if(!sheepGeometry.size){
    sheepGeometry.set('fleece',natureGeometry('fleeceNear'));
    sheepGeometry.set('bodyFar',natureGeometry('fleeceFar'));
    sheepGeometry.set('head',livestockLoft(faceSections,28,32,0));
    sheepGeometry.set('ear',sheepEarGeometry());
  }
  const body=new THREE.Mesh(sheepGeometry.get('fleece'),fleece);
  body.castShadow=true;actor.add(body);
  const legs=[];
  for(const side of [-1,1])for(const fore of [true,false]){
    const pivot=group(actor,side*.276,.665,fore?.392:-.421);
    const knee=group(pivot,0,-.272,fore?.016:.09);
    mesh(pivot,'ball',wool,0,-.083,0,.125,.195,.148);
    rod(pivot,'taper',face,[0,-.12,0],[0,-.302,fore?.016:.09],.064);
    rod(knee,'taper',face,[0,0,0],[0,-.269,fore?.015:-.070],.051);
    const toe=fore?.042:-.040;
    for(const digit of [-1,1])mesh(knee,'ball',hoof,digit*.033,-.294,toe,.034,.067,.087);
    legs.push({pivot,knee,fore,side});
  }
  const tail=group(actor,0,.84,-.716);
  mesh(tail,'fleece',tuft,0,-.07,-.092,.118,.166,.155).rotation.x=.28;
  const head=group(actor,0,1.04,.515);
  head.add(new THREE.Mesh(sheepGeometry.get('head'),skin));
  mesh(head,'fleece',tuft,0,.226,.043,.213,.118,.203).rotation.x=-.23;
  mesh(head,'ball',nose,0,-.108,.464,.099,.037,.037);
  const ears=[],eyes=[];
  for(const side of [-1,1]){
    const ear=group(head,side*.189,.152,.071);
    const pinna=new THREE.Mesh(sheepGeometry.get('ear'),earPaint);
    pinna.scale.x=side;pinna.rotation.y=side*-.47;
    ear.add(pinna);ear.rotation.z=side*.16;ears.push(ear);
    const eye=group(head,side*.183,.061,.212);
    eye.rotation.y=side*.77;
    mesh(eye,'ball','#342923',0,0,0,.058,.034,.027);
    mesh(eye,'ball','#927249',0,0,.019,.044,.024,.017);
    mesh(eye,'ball',eyeMaterial,0,0,.033,.037,.011,.009);
    mesh(eye,'ball',eyeLight,side*.014,.014,.04,.010,.008,.005);
    eyes.push(eye);
    mesh(head,'ball','#271f1d',side*.046,-.098,.493,.023,.011,.008);
  }
  return {tail,head,legs,ears,eyes,body,fleece,distantWool};
}

function duckModel(actor,variant){
  const k=variant===1?{body:'#b1aa91',neck:'#5b8070',light:'#dfcdb2',shade:'#8c8675',beak:'#cda354',toe:'#ab7850'}
    :{body:'#eee1c9',neck:'#f4ebd7',light:'#f7edd7',shade:'#cfbea4',beak:'#c38e50',toe:'#b28253'};
  mesh(actor,'drake',k.body,0,.51,-.066,.355,.268,.596);
  const tail=group(actor,0,.57,-.52);
  mesh(tail,'lobe',k.light,0,.031,-.104,.204,.123,.277).rotation.x=.38;
  const wings=[];
  for(const side of [-1,1]){
    const wing=group(actor,side*.282,.550,-.074);
    mesh(wing,'ball',k.shade,side*.006,0,-.085,.095,.176,.325).rotation.x=-.26;
    for(let j=0;j<6;j++){
      const feather=mesh(wing,'ball',j%2?k.light:k.body,side*(.038+.006*j),.088-j*.033,-.12-j*.023,.041,.041,.247-j*.012);
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
  const tones=['#ae8058','#b28a64','#a78060','#b99670'];
  const coat=tones[variant%4],neck='#e1d0ae',hoof='#5a5346';
  mesh(actor,'doe',coat,0,.783,-.054,.329,.336,.617);
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
  const tones=['#c8917d','#dba995','#c8967f','#e3b59a'];
  const coat=tones[variant%4],light='#eac2ad',hoof='#9b7367';
  mesh(actor,'sow',coat,0,.521,-.077,.401,.383,.697);
  const head=group(actor,0,.599,.356);
  mesh(head,'ball',coat,0,0,.111,.275,.249,.319).rotation.x=-.16;
  mesh(head,'ball',light,0,-.080,.323,.207,.159,.188);
  mesh(head,'ball','#d09385',0,-.068,.471,.171,.098,.052);
  const tail=group(actor,0,.651,-.718);
  mesh(tail,'pigTail',coat,0,0,-.012,1,1,1);
  const eyes=[],ears=[];
  for(const side of [-1,1]){
    mesh(head,'ball','#926660',side*.057,-.060,.503,.025,.030,.017);
    const eye=group(head,side*.192,.068,.323);
    eye.rotation.y=side*.52;
    mesh(eye,'ball',eyeMaterial,0,0,0,.049,.049,.034);
    mesh(eye,'ball',eyeLight,side*.01,.017,.025,.013,.014,.011);
    eyes.push(eye);
    const ear=group(head,side*.183,.191,.040);
    const flap=mesh(ear,'pigEar',coat,0,0,0,-side,1,1);flap.rotation.y=side*.54;flap.material.side=THREE.DoubleSide;
    mesh(ear,'ball','#c29585',side*.030,.091,.027,.041,.082,.021).rotation.z=-side*.21;
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
      const u=i/size,t=row*.5;
      const [x,y,z]=sculptedDog.neck.band[row*(size+1)+i];
      const color=row===0||row===2?edge:scarlet;
      put(x,y,z,u,t,color);
      if(i&&row){
        const id=row*(size+1)+i;triangles.push(id-size-2,id-size-1,id,id-size-2,id,id-1);
      }
    }
    // The point drapes over the ruff and curves back around the chest.
    const f=8;
    const dirs=new THREE.Color();
    for(let j=0;j<=f;j++){
      const t=j/f;
      for(let i=0;i<=f;i++){
        const u=i/f;
        const [x,y,z]=sculptedDog.neck.bib[j*(f+1)+i];
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


let dogParts=[];
async function dogAsset(file,signal){
  const element=document.getElementById(file);
  if(element){
    const encoded=element.textContent.trim();
    const padding=encoded.endsWith('==')?2:encoded.endsWith('=')?1:0;
    const bytes=new Uint8Array(encoded.length/4*3-padding);
    let offset=0;
    for(let i=0;i<encoded.length;i+=262144){
      const block=atob(encoded.slice(i,i+262144));
      for(let j=0;j<block.length;j++)bytes[offset++]=block.charCodeAt(j);
    }
    return new Response(bytes);
  }
  const response=await fetch('./'+file,{signal});
  if(!response.ok)throw new Error('Ressource du chien indisponible · '+file);
  return response;
}
async function readDogBuffer(asset,signal){
  const packed=await dogAsset(asset.file,signal);
  let bytes;
  if(typeof DecompressionStream==='function'&&packed.body){
    bytes=await new Response(packed.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }else bytes=inflateDogGzip(new Uint8Array(await packed.arrayBuffer())).buffer;
  if(bytes.byteLength!==asset.bytes)throw new Error('Ressource 3D incomplète · '+asset.file);
  return bytes;
}
function dogSection(asset,buffer,key,Type){
  const [offset,length]=asset.sections[key];
  return new Type(buffer,offset,length);
}
async function loadDogImage(loader,asset,srgb,signal){
  const inline=document.getElementById(asset.file);
  let path='./'+asset.file;
  if(inline||signal){
    const bytes=await (await dogAsset(asset.file,signal)).arrayBuffer();
    path=URL.createObjectURL(new Blob([bytes],{type:asset.file.endsWith('.png')?'image/png':'image/jpeg'}));
  }
  try{
    const texture=await loader.loadAsync(path);
    if(srgb)texture.colorSpace=THREE.SRGBColorSpace;
    texture.flipY=false;
    texture.anisotropy=4;
    return texture;
  }finally{
    if(inline||signal)URL.revokeObjectURL(path);
  }
}

const dogAttributeTypes={
  position:[Float32Array,3],normal:[Float32Array,3],uv:[Float32Array,2],tangent:[Float32Array,4],
  skinIndex:[Uint8Array,4],skinWeight:[Uint16Array,4,true]
};
const packGearItems={
  collar:'01_collier_cuir',moss:'02_collier_nylon',plaid:'03_bandana',harness:'04_harnais_y',
  raincoat:'10_impermeable',satchel:'11_sacoches'
};
const packGearModels=new Map();
let activeDogAsset;
let dogSelection=0,dogRequest;

async function buildPackModel(asset,coat=null,signal){
  const loader=new THREE.TextureLoader(),skinned=Boolean(asset.motion);
  const materials=[],geometries=[],textures=new Set(),pendingTextures=new Map();
  function load(ref,srgb){
    if(!ref)return null;
    const key=ref.file+':'+srgb;
    if(!pendingTextures.has(key)){
      pendingTextures.set(key,loadDogImage(loader,ref,srgb,signal).then(texture=>{
        textures.add(texture);return texture;
      }));
    }
    return pendingTextures.get(key);
  }
  const materialJobs=asset.materials.map(async(data,i)=>{
      const [map,normalMap,packed]=await Promise.all([
        load(i===0&&coat?coat.asset:data.baseColorTexture,true),
        load(data.normalTexture,false),load(data.metallicRoughnessTexture,false)
      ]);
      const material=new THREE.MeshStandardMaterial({
        color:new THREE.Color().setRGB(...data.color),map,normalMap,
        metalness:data.metalness,roughness:data.roughness,roughnessMap:packed,
        metalnessMap:packed,opacity:data.opacity,transparent:data.alphaMode==='BLEND',
        alphaTest:data.alphaMode==='MASK'?data.alphaCutoff:0,
        side:data.double?THREE.DoubleSide:THREE.FrontSide
      });
      if(skinned)material.onBeforeCompile=dogVolumeShader;
      materials[i]=material;
  });
  try{
    const [packed,motion]=await Promise.all([
      readDogBuffer(asset.model,signal),
      skinned?readDogBuffer(asset.motion,signal):null,
      Promise.all(materialJobs)
    ]);
    const parts=asset.model.parts.map(part=>{
      const geometry=new THREE.BufferGeometry();
      geometries.push(geometry);
      for(const [key,[Type,size,normalized]] of Object.entries(dogAttributeTypes)){
        if(part.sections[key])geometry.setAttribute(key,new THREE.BufferAttribute(dogSection(part,packed,key,Type),size,normalized));
      }
      const index=dogSection(part,packed,'index',part.indexType==='u16'?Uint16Array:Uint32Array);
      geometry.setIndex(new THREE.BufferAttribute(index,1));
      geometry.computeBoundingSphere();
      const material=materials[part.material];
      if(material.normalMap&&!geometry.hasAttribute('tangent'))material.normalScale.y=-1;
      return {geometry,material};
    });
    return {asset,parts,materials,motion:motion&&new Float32Array(motion),textures,dispose};
  }catch(error){
    await Promise.allSettled([...pendingTextures.values(),...materialJobs]);
    dispose();throw error;
  }

  function dispose(){
    geometries.forEach(geometry=>geometry.dispose());
    materials.forEach(material=>material.dispose());
    textures.forEach(texture=>texture.dispose());
  }
}
function coatFor(breed,id){
  return breed.coats.find(coat=>coat.id===id)||breed.coats[0];
}
function activateDogModel(model){
  activeDogAsset=model;
  dogParts=model.parts;
  motionRig=model.asset.motion;
  dogMotionFrames=model.motion;
}
async function prepareDogModel(){
  const breed=sculptedDog.breeds[profile.breed];
  try{
    activateDogModel(await buildPackModel(breed,coatFor(breed,profile.dogCoat)));
  }catch(error){
    const fallback=sculptedDog.breeds[sculptedDog.default];
    const coat=fallback.coats[0];
    if(breed===fallback&&profile.dogCoat===coat.id)throw error;
    activateDogModel(await buildPackModel(fallback,coat));
    // Keep the requested appearance in the save while its files are unavailable.
  }
  activeCoatCategory=coatFor(activeDogAsset.asset,profile.dogCoat).category||'naturel';
  await Promise.all(Object.entries(sculptedDog.gear).map(async([id,asset])=>{
    try{packGearModels.set(id,await buildPackModel(asset));}
    catch(error){console.warn('Accessoire 3D indisponible',id,error);}
  }));
}

async function changeDogAppearance(breedId,coatId){
  if(!Object.hasOwn(sculptedDog.breeds,breedId)||!raceUnlocked(breedId))return;
  displayedTrial=null;$('dog-trial-link').hidden=true;
  const selection=++dogSelection;
  dogRequest?.abort();
  dogRequest=typeof AbortController==='function'?new AbortController():null;
  const signal=dogRequest?.signal;
  const breed=sculptedDog.breeds[breedId],coat=coatFor(breed,coatId);
  const feedback=$('dog-model-feedback');
  if(breed===activeDogAsset.asset&&profile.dogCoat===coat.id&&profile.breed===breedId){
    dogLookLoading(breed,false);
    feedback.textContent='';
    dogRequest=null;
    return;
  }
  feedback.textContent='Chargement · '+breed.label;
  dogLookLoading(breed,true);
  let replacement;
  try{
    if(breed===activeDogAsset.asset){
      const texture=await loadDogImage(new THREE.TextureLoader(),coat.asset,true,signal);
      if(selection!==dogSelection){texture.dispose();return;}
      const material=activeDogAsset.materials[0];
      activeDogAsset.textures.delete(material.map);
      material.map?.dispose();
      material.map=texture;
      activeDogAsset.textures.add(texture);
      material.needsUpdate=true;
    }else{
      replacement=await buildPackModel(breed,coat,signal);
      if(selection!==dogSelection){replacement.dispose();return;}
      const previous=activeDogAsset;
      activateDogModel(replacement);
      for(const target of [companion,dog]){
        if(!target)continue;
        target.skin.skeleton.dispose();
        target.actor.clear();
        Object.assign(target,makeDogModel(target.actor));
      }
      if(companion)frameCompanion();
      previous.dispose();
    }
    profile.breedCoats??={};
    profile.breedCoats[profile.breed]=profile.dogCoat;
    profile.breed=breed.id;profile.dogCoat=coat.id;profile.breedCoats[breed.id]=coat.id;saveProfile();
    activeCoatCategory=coat.category||'naturel';
    syncName();
    dogLookLoading(breed,false);
    feedback.textContent='';
    renderDogChoices();
  }catch(error){
    if(selection!==dogSelection)return;
    console.warn(error);
    dogLookLoading(breed,false);
    feedback.textContent='Ce chien n’a pas pu être chargé. Touche sa vignette pour réessayer.';
    renderDogChoices();
  }finally{
    if(selection===dogSelection)dogRequest=null;
  }
}

const dogBindMatrix=new THREE.Matrix4(),dogBindRotation=new THREE.Quaternion();
const dogOffset=new THREE.Vector3();
const dogDepth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});
dogDepth.onBeforeCompile=dogVolumeShader;

function dogVolumeShader(shader){
  // The reference uses volume-preserving armature deformation. Blend rigid
  // transforms in the mesh's local space, with the same palette for the
  // body, the groom and the depth/shadow pass.
  const width=(motionRig.rig.length*2).toFixed(1);
  shader.vertexShader=shader.vertexShader
    .replace('#include <skinning_pars_vertex>',`
#ifdef USE_SKINNING
  uniform highp sampler2D boneTexture;
  vec4 dogBone(float joint,float part){
    return texture2D(boneTexture,vec2((joint*2.0+part+0.5)/${width},0.5));
  }
  vec3 dogRotate(vec3 v,vec4 q){
    return v+2.0*cross(q.xyz,cross(q.xyz,v)+q.w*v);
  }
  float dogSign(vec4 a,vec4 b){return dot(a,b)<0.0?-1.0:1.0;}
#endif
`)
    .replace('#include <skinbase_vertex>',`
#ifdef USE_SKINNING
  vec4 dogA=dogBone(skinIndex.x,0.0);
  vec4 dogB=dogBone(skinIndex.y,0.0);
  vec4 dogC=dogBone(skinIndex.z,0.0);
  vec4 dogD=dogBone(skinIndex.w,0.0);
  vec4 dogW=skinWeight*vec4(1.0,dogSign(dogA,dogB),dogSign(dogA,dogC),dogSign(dogA,dogD));
  vec4 dogQ=dogW.x*dogA+dogW.y*dogB+dogW.z*dogC+dogW.w*dogD;
  float dogInvLength=inversesqrt(max(0.00001,dot(dogQ,dogQ)));
  dogQ*=dogInvLength;
  vec4 dogT=dogInvLength*(dogW.x*dogBone(skinIndex.x,1.0)+dogW.y*dogBone(skinIndex.y,1.0)
                       +dogW.z*dogBone(skinIndex.z,1.0)+dogW.w*dogBone(skinIndex.w,1.0));
#endif
`)
    .replace('#include <skinnormal_vertex>',`
#ifdef USE_SKINNING
  objectNormal=dogRotate(objectNormal,dogQ);
  #ifdef USE_TANGENT
    objectTangent=dogRotate(objectTangent,dogQ);
  #endif
#endif
`)
    .replace('#include <skinning_vertex>',`
#ifdef USE_SKINNING
  transformed=dogRotate(transformed,dogQ)+2.0*(dogQ.w*dogT.xyz-dogT.w*dogQ.xyz+cross(dogQ.xyz,dogT.xyz));
#endif
`);
}

function createDogSkeleton(skin,bones){
  const skeleton=new THREE.Skeleton(bones);
  const inverseMesh=new THREE.Matrix4().copy(skin.matrixWorld).invert(),rotation=new THREE.Quaternion();
  const rest=bones.map(bone=>new THREE.Matrix4().multiplyMatrices(inverseMesh,bone.matrixWorld).invert());
  const palette=new Float32Array(bones.length*8);
  const texture=new THREE.DataTexture(palette,bones.length*2,1,THREE.RGBAFormat,THREE.FloatType);
  skeleton.boneTexture=texture;
  skeleton.update=()=>{
    inverseMesh.copy(skin.matrixWorld).invert();
    for(let i=0;i<bones.length;i++){
      dogBindMatrix.multiplyMatrices(inverseMesh,bones[i].matrixWorld).multiply(rest[i]);
      rotation.setFromRotationMatrix(dogBindMatrix).normalize();
      dogOffset.setFromMatrixPosition(dogBindMatrix).multiplyScalar(.5);
      const offset=i*8,{x,y,z,w}=rotation,{x:tx,y:ty,z:tz}=dogOffset;
      rotation.toArray(palette,offset);
      palette[offset+4]=tx*w+ty*z-tz*y;
      palette[offset+5]=ty*w+tz*x-tx*z;
      palette[offset+6]=tz*w+tx*y-ty*x;
      palette[offset+7]=-tx*x-ty*y-tz*z;
    }
    texture.needsUpdate=true;
  };
  return skeleton;
}

function dogSocket(skin,bone,x,y,z){
  const socket=group(bone);
  dogBindMatrix.copy(bone.matrixWorld).invert().multiply(skin.matrixWorld);
  socket.position.set(x,y,z).applyMatrix4(dogBindMatrix);
  socket.quaternion.copy(dogBindRotation.setFromRotationMatrix(dogBindMatrix));
  return socket;
}

function mountPackGear(skin,bones){
  const gear={};
  for(const [item,id] of Object.entries(packGearItems)){
    const prepared=packGearModels.get(id);
    if(!prepared)continue;
    const mount=activeDogAsset.asset.mounts[prepared.asset.mount];
    const socket=dogSocket(skin,bones[mount.bone],...mount.gltf_world_xyz_m.map(n=>n*2.24));
    socket.rotateX(THREE.MathUtils.degToRad(mount.rotation_gltf_x_deg));
    socket.scale.set(...mount.gltf_scale_xyz);
    for(const {geometry,material} of prepared.parts){
      const mesh=new THREE.Mesh(geometry,material);
      mesh.castShadow=mesh.receiveShadow=true;
      socket.add(mesh);
    }
    gear[item]=socket;
  }
  return gear;
}

function makeDogModel(actor){
  actor.scale.setScalar(activeDogAsset.asset.visualScale);
  const {rig,paws,translations}=motionRig;
  const bones=rig.map(([name,,x,y,z,qx,qy,qz,qw])=>{
    const bone=new THREE.Bone();
    bone.name=name;bone.position.set(x,y,z);bone.quaternion.set(qx,qy,qz,qw);
    return bone;
  });
  const meshes=dogParts.map(({geometry,material})=>{
    const mesh=new THREE.SkinnedMesh(geometry,material);
    mesh.name='Chien articulé';mesh.frustumCulled=false;mesh.castShadow=true;mesh.receiveShadow=true;
    mesh.customDepthMaterial=dogDepth;
    actor.add(mesh);
    return mesh;
  });
  const [skin]=meshes;
  rig.forEach(([,parent],i)=>(parent<0?skin:bones[parent]).add(bones[i]));
  actor.updateWorldMatrix(true,true);
  const skeleton=createDogSkeleton(skin,bones);
  meshes.forEach(mesh=>mesh.bind(skeleton,mesh.matrixWorld.clone()));
  const byName=Object.fromEntries(bones.map(bone=>[bone.name,bone]));
  const actorInverse=actor.getWorldQuaternion(new THREE.Quaternion()).invert();
  const legs=paws.map(({bone,sole,supports=[]})=>{
    const end=bones[bone],point=new THREE.Vector3(...sole);
    const neutralPaw=end.getWorldQuaternion(new THREE.Quaternion()).premultiply(actorInverse).normalize();
    return {end,point,neutralPaw,supports:supports.map(value=>new THREE.Vector3(...value)),anchor:new THREE.Vector3(),planted:false,
      joints:[end.parent,end.parent.parent,end.parent.parent.parent]};
  });
  const {mounts}=activeDogAsset.asset;
  const {neck,thorax}=mounts;
  const sockets={
    neck:dogSocket(skin,byName[neck.bone],...neck.gltf_world_xyz_m.map(value=>value*2.24)),
    back:dogSocket(skin,byName[thorax.bone],...thorax.gltf_world_xyz_m.map(value=>value*2.24))
  };
  sockets.neck.scale.set(...neck.gltf_scale_xyz);
  sockets.back.scale.set(...thorax.gltf_scale_xyz);
  const packGear=mountPackGear(skin,byName);
  const scarf=bandanaForNeck(sockets.neck),collar=collarForNeck(sockets.neck);
  const satchel=backpack(sockets.back),clochette=copperBell(sockets.neck);
  const harnais=exploringHarness(sockets.back),impermeable=rainCape(sockets.back);
  for(const item of [satchel,harnais,impermeable])item.scale.set(.84,.80,.85);
  const [,y,z]=sculptedDog.neck.band[64];
  clochette.position.set(0,y-.136,z+.037);clochette.scale.setScalar(.80);
  const model={skin,meshes,bones,legs,sockets,packGear,scarf,collar,satchel,clochette,harnais,impermeable,
    bindRotations:bones.map(bone=>bone.quaternion.clone()),
    movingBones:translations.map(i=>bones[i]),bindPositions:translations.map(i=>bones[i].position.clone()),
    barkBones:['Encolure','Crane','Oreille_D','Oreille_G','Mandibule'].map(name=>bones.indexOf(byName[name]))};
  dressDog(model);
  return model;
}

const dogMotion={offsets:[],rotations:[],contacts:new Float32Array(4)};
let motionRig=sculptedDog.breeds[sculptedDog.default].motion;
const nextRotation=new THREE.Quaternion(),sampleRotation=new THREE.Quaternion(),neutralRotation=new THREE.Quaternion();
const sampleOffset=new THREE.Vector3();
for(const _ of motionRig.rig)dogMotion.rotations.push(new THREE.Quaternion());
for(const _ of motionRig.translations)dogMotion.offsets.push(new THREE.Vector3());
const dogRotationStart=dogMotion.offsets.length*3;
const dogContactStart=dogRotationStart+dogMotion.rotations.length*4;
let dogMotionFrames;

function appendDogMotion(id,clock,weight,phase=false,total=0){
  if(weight<=.0001)return total;
  const {start,frames,duration,phase:entry,loop}=motionRig.clips[id];
  const progress=phase?clock+entry:clock/duration;
  const frame=(loop?((progress%1)+1)%1:clamp(progress,0,1))*(frames-1);
  const a=start+Math.floor(frame)*motionRig.stride;
  const b=Math.min(a+motionRig.stride,start+(frames-1)*motionRig.stride);
  const fraction=frame-Math.floor(frame),data=dogMotionFrames;
  const fade=weight/(total+weight);
  for(let i=0;i<dogMotion.offsets.length;i++){
    const o=a+i*3,p=b+i*3;
    sampleOffset.set(mix(data[o],data[p],fraction),mix(data[o+1],data[p+1],fraction),mix(data[o+2],data[p+2],fraction));
    dogMotion.offsets[i].lerp(sampleOffset,fade);
  }
  for(let i=0;i<dogMotion.rotations.length;i++){
    const offset=dogRotationStart+i*4;
    nextRotation.fromArray(data,b+offset);
    dogMotion.rotations[i].slerp(sampleRotation.fromArray(data,a+offset).slerp(nextRotation,fraction),fade);
  }
  for(let i=0;i<dogMotion.contacts.length;i++){
    const offset=dogContactStart+i;
    dogMotion.contacts[i]=mix(dogMotion.contacts[i],mix(data[a+offset],data[b+offset],fraction),fade);
  }
  return total+weight;
}

function applyDogMotion(dog){
  for(let i=0;i<dog.bones.length;i++){
    dog.bones[i].quaternion.copy(dog.bindRotations[i]).multiply(dogMotion.rotations[i]);
  }
  for(let i=0;i<dog.movingBones.length;i++){
    dog.movingBones[i].position.copy(dog.bindPositions[i]).add(dogMotion.offsets[i]);
  }
}

function overlayDogBark(dog,age,energy){
  if(age<0||age>=.56)return;
  const fade=smooth(0,.039,age)*(1-smooth(.34,.56,age))*energy;
  appendDogMotion('bark',.13+age*1.04,1);
  for(const i of dog.barkBones){
    dog.bones[i].quaternion.multiply(sampleRotation.copy(neutralRotation).slerp(dogMotion.rotations[i],fade));
  }
}

const authoredSole=new THREE.Vector3(),pawTarget=new THREE.Vector3(),pawSupport=new THREE.Vector3();
const jointOrigin=new THREE.Vector3(),towardsPaw=new THREE.Vector3(),towardsContact=new THREE.Vector3();
const localCorrection=new THREE.Quaternion(),inverseJoint=new THREE.Quaternion();

const hipPosition=new THREE.Vector3(),kneePosition=new THREE.Vector3(),hockPosition=new THREE.Vector3();
const hockTarget=new THREE.Vector3(),kneeTarget=new THREE.Vector3(),plantAxis=new THREE.Vector3();
const kneeBend=new THREE.Vector3(),plantDelta=new THREE.Vector3();
const hockRotation=new THREE.Quaternion();
const actorBasis=new THREE.Quaternion(),footRotation=new THREE.Quaternion(),levelFoot=new THREE.Quaternion();

function aimLegLink(joint,child,target){
  jointOrigin.setFromMatrixPosition(joint.matrixWorld);
  joint.getWorldQuaternion(inverseJoint).invert();
  towardsPaw.setFromMatrixPosition(child.matrixWorld).sub(jointOrigin).applyQuaternion(inverseJoint).normalize();
  towardsContact.copy(target).sub(jointOrigin).applyQuaternion(inverseJoint).normalize();
  joint.quaternion.multiply(localCorrection.setFromUnitVectors(towardsPaw,towardsContact)).normalize();
  joint.updateWorldMatrix(false,true);
}

function plantDogPaw(leg){
  // Solve the two upper links against the wrist or hock. Keep the authored
  // bend direction, the length of each link, and the orientation of the paw.
  const [hock,knee,hip]=leg.joints;
  hipPosition.setFromMatrixPosition(hip.matrixWorld);
  kneePosition.setFromMatrixPosition(knee.matrixWorld);
  hockPosition.setFromMatrixPosition(hock.matrixWorld);
  const thigh=hipPosition.distanceTo(kneePosition),shin=kneePosition.distanceTo(hockPosition);
  plantDelta.copy(pawTarget).sub(authoredSole).clampLength(0,Math.min(thigh,shin)*.61);
  hockTarget.copy(hockPosition).add(plantDelta);
  plantAxis.copy(hockTarget).sub(hipPosition);
  const reach=plantAxis.length();
  if(reach<.001)return;
  plantAxis.divideScalar(reach);
  const limit=clamp(reach,Math.abs(thigh-shin)+.003,thigh+shin-.003);
  const along=(thigh*thigh-shin*shin+limit*limit)/(2*limit);
  const height=Math.sqrt(Math.max(0,thigh*thigh-along*along));
  kneeBend.copy(kneePosition).sub(hipPosition);
  kneeBend.addScaledVector(plantAxis,-kneeBend.dot(plantAxis));
  if(kneeBend.lengthSq()<.00001)return;
  kneeTarget.copy(hipPosition).addScaledVector(plantAxis,along).addScaledVector(kneeBend.normalize(),height);
  hockTarget.copy(hipPosition).addScaledVector(plantAxis,limit);
  hock.getWorldQuaternion(hockRotation);
  aimLegLink(hip,knee,kneeTarget);
  aimLegLink(knee,hock,hockTarget);
  knee.getWorldQuaternion(inverseJoint).invert();
  hock.quaternion.copy(inverseJoint).multiply(hockRotation).normalize();
  hock.updateWorldMatrix(false,true);
}

function limitPawPitch(model){
  model.skin.updateWorldMatrix(true,true);
  model.actor.getWorldQuaternion(actorBasis);
  for(const leg of model.legs){
    leg.end.getWorldQuaternion(footRotation).normalize();
    levelFoot.copy(actorBasis).multiply(leg.neutralPaw).normalize();
    const angle=levelFoot.angleTo(footRotation);
    if(angle<=.49)continue;
    levelFoot.slerp(footRotation,.49/angle);
    leg.end.parent.getWorldQuaternion(inverseJoint).invert();
    leg.end.quaternion.copy(inverseJoint).multiply(levelFoot).normalize();
    leg.end.updateWorldMatrix(false,true);
  }
}

function groundDogPaws(dog,dt){
  limitPawPitch(dog);
  const teleported=Math.hypot(dog.x-(dog.poseX??dog.x),dog.z-(dog.poseZ??dog.z))>1.75;
  dog.poseX=dog.x;dog.poseZ=dog.z;
  for(let i=0;i<dog.legs.length;i++){
    const leg=dog.legs[i],contact=dogMotion.contacts[i];
    authoredSole.copy(leg.point).applyMatrix4(leg.end.matrixWorld);
    const planted=contact>(leg.planted?.20:.50);
    if(!planted){leg.planted=false;continue;}
    if(!leg.planted||teleported||!dt)leg.anchor.copy(authoredSole);
    leg.planted=true;

    const drift=Math.hypot(leg.anchor.x-authoredSole.x,leg.anchor.z-authoredSole.z);
    const stiffness=smooth(.20,.83,contact);
    const turning=smooth(2,7,Math.abs(dog.turnRate||0));
    // Keep a world-space foothold until the next swing. Release it smoothly
    // if a sharp turn or a collision takes the limb out of its reach.
    leg.anchor.lerp(authoredSole,smooth(.12,.33,drift)*Math.min(1,dt*12));
    pawTarget.copy(authoredSole).lerp(leg.anchor,stiffness*mix(.94,.38,turning));
    let clearance=authoredSole.y-groundY(pawTarget.x,pawTarget.z);
    const dx=pawTarget.x-authoredSole.x,dz=pawTarget.z-authoredSole.z;
    for(const support of leg.supports){
      pawSupport.copy(support).applyMatrix4(leg.end.matrixWorld);
      clearance=Math.min(clearance,pawSupport.y-groundY(pawSupport.x+dx,pawSupport.z+dz));
    }
    pawTarget.y=authoredSole.y+clamp(.006-clearance,-.13,.14)*stiffness;
    if(pawTarget.distanceToSquared(authoredSole)>.00017)plantDogPaw(leg);
  }
}

function animateDog(dog,time,dt){
  const energy=prefersStill?.63:1;
  const speed=dog.speed,angular=dog.turnRate||0;
  const pace=dog.poseSpeed=mix(dog.poseSpeed??speed,speed,1-Math.exp(-dt*14));
  const fast=smooth(8.0,9.0,pace),canter=smooth(5.10,5.92,pace),trot=smooth(2.38,3.04,pace);
  const traveling=Math.max(smooth(.12,.95,speed),smooth(.65,3.8,Math.abs(angular))*.48);
  const forwardX=Math.sin(dog.heading),forwardZ=Math.cos(dog.heading);
  const approach=smooth(.14,.66,speed)*(1-smooth(2.7,4.24,speed));
  const closeToFlock=approach>.005&&animals.some(animal=>{
    if(animal.safe)return false;
    const x=animal.x-dog.x,z=animal.z-dog.z;
    return x*x+z*z<108&&x*forwardX+z*forwardZ>.15;
  });
  const stalk=dog.stalkWeight=mix(dog.stalkWeight||0,closeToFlock?approach:0,1-Math.exp(-dt*5.5));
  const turn=dog.poseTurn=mix(dog.poseTurn||0,clamp(angular,-7,7),1-Math.exp(-dt*13));
  const turnWeight=smooth(.56,3.4,Math.abs(turn))*(1-canter)*(.40+.47*trot)*(1-stalk);
  const steps=motionRig.clips;
  const stride=mix(mix(mix(steps.walk.step,steps.trot.step,trot),mix(steps.canter.step,steps.sprint.step,fast),canter),steps.stalk.step,stalk);
  const duration=mix(mix(mix(steps.walk.duration,steps.trot.duration,trot),mix(steps.canter.duration,steps.sprint.duration,fast),canter),steps.stalk.duration,stalk);
  const modelScale=dog.root.scale.x*dog.actor.scale.x;
  const cadence=clamp(pace/(stride*modelScale)+Math.abs(angular)*.12,.38/duration,1.24/duration);
  dog.cycle=((dog.cycle||0)+dt*cadence*traveling)%1;
  const gait=traveling*(1-stalk)*(1-turnWeight);
  let weight=appendDogMotion('idle',time+dog.phase,1-traveling);
  weight=appendDogMotion('walk',dog.cycle,gait*(1-trot)*(1-canter),true,weight);
  weight=appendDogMotion('trot',dog.cycle,gait*trot*(1-canter),true,weight);
  weight=appendDogMotion('canter',dog.cycle,gait*canter*(1-fast),true,weight);
  weight=appendDogMotion('sprint',dog.cycle,gait*canter*fast,true,weight);
  weight=appendDogMotion('stalk',dog.cycle,traveling*stalk,true,weight);
  appendDogMotion(turn<0?'right':'left',dog.cycle,traveling*(1-stalk)*turnWeight,true,weight);
  applyDogMotion(dog);

  dog.root.position.set(dog.x,groundY(dog.x,dog.z)-(dog.sink??0),dog.z);
  dog.root.rotation.y=dog.heading;
  const x=dog.x,z=dog.z,dx=forwardX*.57,dz=forwardZ*.57;
  const grade=(groundY(x+dx,z+dz)-groundY(x-dx,z-dz))/1.14;
  const sideX=forwardZ*.34,sideZ=-forwardX*.34;
  const crossfall=(groundY(x+sideX,z+sideZ)-groundY(x-sideX,z-sideZ))/.68;
  dog.actor.rotation.x=-Math.atan(grade)*.88;
  dog.actor.rotation.z=Math.atan(crossfall)*.72+clamp(turn*.024,-.085,.085)*traveling*energy;
  groundDogPaws(dog,dt);
  overlayDogBark(dog,time-barkTime,energy);

  const rhythm=dog.cycle*TAU;
  if(dog.clochette.visible){
    dog.clochette.rotation.x=Math.sin(rhythm*2)*traveling*.16;
    dog.clochette.rotation.z=Math.sin(rhythm)*traveling*.21;
    if(dt&&speed>1.8&&time>(dog.lastBell??0)+mix(.74,.41,canter)){
      dog.lastBell=time;
      soundEffect('bell');
    }
  }
  dog.scarf.rotation.z=energy*.052*Math.sin(time*3.9+dog.phase)*(1+canter*.5);
}

function poseDogPortrait(dog,now){
  dog.root.rotation.y=prefersStill?companionAngle:
    dog.root.rotation.y+wrapAngle(companionAngle-dog.root.rotation.y)*.12;
  if(prefersStill)return;
  dog.portraitTime=(dog.portraitTime??0)+clamp((now-(dog.portraitLast??now))*.001,0,.08);
  dog.portraitLast=now;
  const time=dog.portraitTime,beat=time%24;
  const watch=smooth(4.6,5.3,beat)*(1-smooth(10.3,11,beat));
  const wag=smooth(11.9,12.5,beat)*(1-smooth(15.4,16,beat));
  const play=smooth(17,17.4,beat)*(1-smooth(19.05,19.5,beat))*.68;
  let weight=appendDogMotion('idle',time,1-watch-wag-play);
  weight=appendDogMotion('watch',beat-5.3,watch,false,weight);
  weight=appendDogMotion('wag',beat-12.5,wag,false,weight);
  appendDogMotion('play',beat-17.35,play,false,weight);
  applyDogMotion(dog);
  limitPawPitch(dog);
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
const flockTones=['#f0e2c4','#e7d8bd','#d3c4ae','#f3e7d0'];
const flockFaces=['#665244','#514640','#74665c','#786552'];

let herdParts=null,gathering=null;
const sheepMouth=new THREE.Object3D();
const sheepRootMatrix=new THREE.Object3D();
const partMatrix=new THREE.Matrix4();

function makeBonusBatches(count){
  const wool=new THREE.MeshLambertMaterial({color:'#fff8eb',map:washTexture||null,vertexColors:true});
  const plainWool=new THREE.MeshLambertMaterial({color:'#fff8eb',map:washTexture||null});
  const dark=new THREE.MeshLambertMaterial({color:'#fff8eb'});
  const contact=new THREE.MeshBasicMaterial({map:shadeTexture,transparent:true,opacity:.46,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  const body=natureGeometry('fleeceFar');
  const muzzle=livestockLoft(faceSections,12,16,0);
  const tuft=new THREE.IcosahedronGeometry(1,1);
  const leg=new THREE.CylinderGeometry(.74,1,1,6);
  return [
    ['body',body,wool],['face',muzzle,dark],['tuft',tuft,plainWool],
    ['ears',tuft,dark,2],['legs',leg,dark,4],['feet',tuft,dark,4],
    ['shade',geo.plane,contact]
  ].reduce((parts,[name,geometry,material,copies=1])=>{
    const mesh=new THREE.InstancedMesh(geometry,material,count*copies);
    mesh.name='Grand troupeau · '+name;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled=false;
    mesh.castShadow=name==='body';
    mesh.receiveShadow=name!=='shade';
    map.add(mesh);
    parts[name]=mesh;
    return parts;
  },{});
}
function setBonusColors(m){
  const color=new THREE.Color();
  herdParts.body.setColorAt(m.mass,color.set(flockTones[m.variant]));
  herdParts.tuft.setColorAt(m.mass,color);
  color.set(flockFaces[m.variant]);
  herdParts.face.setColorAt(m.mass,color);
  for(let i=0;i<2;i++)herdParts.ears.setColorAt(m.mass*2+i,color);
  for(let i=0;i<4;i++){
    herdParts.legs.setColorAt(m.mass*4+i,color);
    herdParts.feet.setColorAt(m.mass*4+i,color.clone().multiplyScalar(.69));
  }
}
function setSheepPart(name,index,x,y,z,sx,sy,sz,rx=0,rz=0){
  sheepMouth.position.set(x,y,z);
  sheepMouth.scale.set(sx,sy,sz);
  sheepMouth.rotation.set(rx,0,rz);
  sheepMouth.updateMatrix();
  partMatrix.multiplyMatrices(sheepRootMatrix.matrix,sheepMouth.matrix);
  herdParts[name].setMatrixAt(index,partMatrix);
}
function animateBonusSheep(m,time,dt){
  const pace=clamp(m.speed/2.7,0,1),still=prefersStill?.55:1;
  m.cycle=(m.cycle+dt*(2.0+Math.min(m.speed,8)*2.24))%TAU;
  const stride=m.cycle;
  const bob=still*(pace*.023*(1-Math.cos(stride*2))+.012*Math.sin(time*2.7+m.phase));
  const size=.82+m.variant*.041;
  const y=groundY(m.x,m.z);
  sheepRootMatrix.position.set(m.x,y+bob,m.z);
  sheepRootMatrix.rotation.y=m.heading;
  sheepRootMatrix.scale.setScalar(size);
  sheepRootMatrix.updateMatrix();
  const i=m.mass;
  setSheepPart('body',i,0,0,0,1,1,1);
  const grazing=!m.safe&&m.react<.22&&pace<.12;
  const nod=grazing?smooth(-.23,.86,Math.sin(time*.57+m.phase))*.56:0;
  setSheepPart('face',i,0,1.04-nod*.18,.515,1,1,1,nod);
  setSheepPart('tuft',i,0,1.255-nod*.23,.56,.211,.119,.201,nod);
  for(let j=0;j<2;j++){
    const side=j?1:-1;
    setSheepPart('ears',i*2+j,side*.305,1.145-nod*.26,.58,.181,.045,.080,.16+nod,-side*.22);
  }
  for(let j=0;j<4;j++){
    const side=j%2?1:-1,fore=j<2;
    const phase=stride+((j===0||j===3)?0:Math.PI);
    const swing=Math.sin(phase)*pace*.16*still;
    const lift=Math.max(0,Math.cos(phase))*pace*.13*still;
    const x=side*.273,z=fore?.40:-.408;
    setSheepPart('legs',i*4+j,x,.325+lift*.48,z+swing*.43,.065,.586-lift,.071,-swing*1.82);
    setSheepPart('feet',i*4+j,x,.081+lift,z+swing,.081,.070,.095);
  }
  setSheepPart('shade',i,.07,.040-bob,.02,1.50,1.64,1,-Math.PI/2);
}
function flushFlockBatches(){
  if(!herdParts)return;
  for(const part of Object.values(herdParts))part.instanceMatrix.needsUpdate=true;
}

function flockGroups(roster,range){
  const remaining=new Set(roster),groups=[];
  const max=range*range;
  while(remaining.size){
    const first=remaining.values().next().value;
    const group=[first];remaining.delete(first);
    for(let i=0;i<group.length;i++){
      const current=group[i];
      for(const nearby of remaining){
        if(nearby.safe!==current.safe||(nearby.x-current.x)**2+(nearby.z-current.z)**2>max)continue;
        group.push(nearby);remaining.delete(nearby);
      }
    }
    groups.push(group);
  }
  return groups;
}
function startGathering(config){
  gathering=config.bigFlock?{
    total:config.gathering.count,spotted:new Set(),stage:'search',largest:0,scanAt:-1,connectedSince:null,groups:[]
  }:null;
  if(gathering)scanGathering();
}
function scanGathering(){
  gathering.scanAt=gameTime+.16;
  const field=animals.filter(m=>!m.safe);
  gathering.groups=flockGroups(field,3.55);
  gathering.groups.forEach(group=>group.forEach(m=>{m.pack=group;}));
  if(gathering.stage==='return')return;
  const before=gathering.spotted.size;
  for(const m of field)if(distance(m,dog)<15)gathering.spotted.add(m.originGroup);
  if(gathering.spotted.size!==before){
    const found=gathering.spotted.size;
    if(found===gathering.total){
      gathering.stage='gather';
      showMessage('Groupes repérés · Réunis le troupeau',3200);
      setNote('Contourne un groupe, puis pousse-le vers les autres. Le portail s’ouvrira quand le troupeau sera réuni.',8);
    }else showMessage('Groupes repérés · '+found+' / '+gathering.total);
  }
  gathering.largest=Math.max(0,...gathering.groups.map(group=>group.length));
  if(gathering.stage==='gather'&&gathering.largest===field.length){
    const dx=Math.max(...field.map(m=>m.x))-Math.min(...field.map(m=>m.x));
    const dz=Math.max(...field.map(m=>m.z))-Math.min(...field.map(m=>m.z));
    if(Math.hypot(dx,dz)<Math.max(14,3.25*Math.sqrt(field.length))){
      gathering.connectedSince??=gameTime;
      if(gameTime-gathering.connectedSince>=.55){
        gathering.stage='return';
        const gate=pens.sheep;
        gate.block.enabled=false;
        grid=createGrid(activeMission());
        showMessage('Le troupeau est réuni. Enclos ouvert',4100);
        setNote('Place-toi derrière le troupeau et ramène-le maintenant à l’enclos.',10);
        soundEffect('found');
      }
    }else gathering.connectedSince=null;
  }else gathering.connectedSince=null;
}
function guideLargeFlock(){
  if(gameTime>=gathering.scanAt)scanGathering();
  for(const pack of gathering.groups){
    let cx=0,cz=0,count=0,nearest=Infinity;
    for(const m of pack){
      if(m.safe)continue;
      cx+=m.x;cz+=m.z;count++;
      nearest=Math.min(nearest,distance(m,dog));
    }
    pack.drive=null;
    if(!count||nearest>=14.8)continue;
    const dx=cx/count-dog.x,dz=cz/count-dog.z;
    const range=Math.hypot(dx,dz);
    if(range<.35)continue;
    const push=(1-smooth(5.3,14.8,nearest))*(1-smooth(19,31,range));
    pack.drive={x:dx/range,z:dz/range,push};
  }
}
function largeFlockInfluence(m,pen){
  const {x,z,push}=m.pack.drive;
  const dist=pen.left-m.x;
  const liningUp=gathering.stage==='return'?(1-smooth(4.5,19,dist))*smooth(.08,.72,x)*push:0;
  return [x*2.36*push,z*2.36*push*(1-.59*liningUp)+clamp((pen.z-m.z)*.26,-1.65,1.65)*liningUp];
}
function gatheringHint(){
  const gate=pens.sheep;
  if(gathering.stage==='return'){
    setNote('Le troupeau est réuni. Fais-le avancer en direction de la bergerie.');
    return {x:gate.left,z:gate.z,height:2.4,label:'Grand enclos'};
  }
  if(gathering.stage==='search'){
    const sheep=animals.filter(m=>!gathering.spotted.has(m.originGroup))
      .reduce((near,m)=>!near||distance(m,dog)<distance(near,dog)?m:near,null);
    if(sheep){
      setNote('Approche du prochain groupe. Après le repérage, contourne-le pour le regrouper.');
      return {get x(){return sheep.x;},get z(){return sheep.z;},height:1.75,label:'Groupe à repérer'};
    }
  }
  const largest=gathering.groups.reduce((big,pack)=>pack.length>big.length?pack:big,[]);
  if(largest.length){
    const sheep=largest[0];
    setNote('Amène les groupes plus petits vers le plus grand.');
    return {get x(){return sheep.x;},get z(){return sheep.z;},height:1.8,label:'Plus grand groupe'};
  }
  return null;
}
function flockStall(pen,index){
  const cols=9,rows=Math.ceil(animals.length/cols);
  const lane=(index%cols)/(cols-1);
  const rank=Math.floor(index/cols)/Math.max(1,rows-1);
  return point(mix(pen.left+3.1,pen.right-2.7,rank),mix(pen.back+3.1,pen.front-3.1,lane)
    +Math.sin(index*2.39)*.28);
}
function drawFlockCounts(ctx,mapX,mapZ){
  for(const group of flockGroups(animals,3.55)){
    const first=group[0];
    if(group.length<4)continue;
    const x=mapX(group.reduce((sum,m)=>sum+m.x,0)/group.length);
    const z=mapZ(group.reduce((sum,m)=>sum+m.z,0)/group.length)-9;
    ctx.fillStyle=first.safe?'#286b47':'#314b40';
    ctx.beginPath();ctx.roundRect(x-8,z-5,16,10,3);ctx.fill();
    ctx.fillStyle='#fffae7';ctx.font='700 7.7px ui-sans-serif, sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(group.length),x,z+.15);
  }
  ctx.textBaseline='alphabetic';
}

function makeMover(type,x,z,variant=0,mass=null){
  const state={type,x,z,mass,variant,safe:false,speed:0,heading:random()*TAU,
    home:null,origin:point(x,z),phase:random()*TAU,cycle:0,react:0,stress:0,vx:0,vz:0,
    desiredX:0,desiredZ:0,path:null,between:null};
  if(mass!==null){setBonusColors(state);return state;}
  const root=group(map,x,groundY(x,z),z),actor=group(root);
  const shadowMat=new THREE.MeshBasicMaterial({map:shadeTexture,transparent:true,opacity:.64,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  const shadow=mesh(root,'plane',shadowMat,.15,.04,.028,type==='duck'?1.64:2.1,type==='dog'?2.63:1.91,1);
  shadow.rotation.x=-Math.PI/2;
  const parts=type==='dog'?makeDogModel(actor):type==='sheep'?sheepModel(actor,variant):type==='duck'?duckModel(actor,variant):type==='goat'?goatModel(actor,variant):pigModel(actor,variant);
  if(type!=='dog')batchAnimalParts(actor);
  actor.traverse(object=>{if(object.isMesh){object.castShadow=type!=='dog'||object.castShadow;object.receiveShadow=true;}});
  const size=type==='dog'?.84:type==='duck'?.76:type==='goat'?.91:type==='pig'?.83:variant===3?.68:.81+(variant%3)*.048;
  root.scale.setScalar(size);
  return {root,actor,shadow,...state,...parts};
}
function animateMover(m,time,dt=0){
  if(m.type==='dog'){animateDog(m,time,dt);return;}
  if(m.mass!==null){animateBonusSheep(m,time,dt);return;}
  const duck=m.type==='duck',moving=clamp(m.speed/2.7,0,1);
  const energy=prefersStill?.55:1;
  if(m.type==='sheep'){
    const far=distance(m,dog)>(m.body.geometry===sheepGeometry.get('bodyFar')?13:16);
    m.body.geometry=sheepGeometry.get(far?'bodyFar':'fleece');
    m.body.material=far?m.distantWool:m.fleece;
  }
  m.cycle=(m.cycle+dt*(2.0+Math.min(m.speed,13)*2.24))%TAU;
  const cycle=m.cycle,walk=Math.sin(cycle);
  m.root.position.set(m.x,groundY(m.x,m.z)-(m.sink??0),m.z);m.root.rotation.y=m.heading;
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
  animateFantasySheep(m,time);
}
let collisionCells = null, gridShape = null;
const CELL=8;
function insideField(x,z,radius=0){
  const config=activeMission(),[hx,hz]=config.half;
  if(config.biome==='coast'&&x< -66+radius)return false;
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
    return Math.abs(x-c.stream.x)<c.stream.width*.5+radius&&bridgeCrossings(c.stream).every(span=>Math.abs(z-span.z)>span.gap*.5-radius);
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
  cameraInput.id=null;cameraInput.dragged=false;
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
    const touch=event.pointerType==='touch';
    const scale=touch?.0081:.0052;
    cameraInput.yaw=wrapAngle(cameraInput.yaw+(x-cameraInput.x)*scale*(touch?-1:1));
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
  const joy=$('joystick'),leftPad=$('move-zone');
  let originX=0,originY=0,range=43;
  function positionStick(event){
    const x=event.clientX-originX,y=event.clientY-originY;
    const length=Math.max(range,Math.hypot(x,y));
    stick.x=x/length;stick.y=y/length;
    $('joystick-thumb').style.transform='translate('+(stick.x*range)+'px,'+(stick.y*range)+'px)';
  }
  leftPad.addEventListener('pointerdown',event=>{
    if(playPaused()||stick.id!==null||event.pointerType==='mouse'&&event.button!==0)return;
    event.preventDefault();stick.id=event.pointerId;
    const rect=joy.getBoundingClientRect();
    const anchorX=rect.left+rect.width/2,anchorY=rect.top+rect.height/2;
    range=Math.max(23,rect.width*.34);
    const tight=Math.hypot(event.clientX-anchorX,event.clientY-anchorY)<rect.width*.53;
    originX=tight?anchorX:event.clientX;
    originY=tight?anchorY:event.clientY;
    joy.style.transform='translate('+(originX-anchorX)+'px,'+(originY-anchorY)+'px)';
    leftPad.setPointerCapture(stick.id);positionStick(event);
  });
  leftPad.addEventListener('pointermove',event=>{if(stick.id===event.pointerId)positionStick(event);});
  function stopWalking(event){
    if(stick.id!==event.pointerId)return;
    stick.x=stick.y=0;stick.id=null;
    $('joystick-thumb').style.transform='';joy.style.transform='';
  }
  for(const type of ['pointerup','pointercancel','lostpointercapture'])leftPad.addEventListener(type,stopWalking);
  $('rotate-back').onclick=showHome;
  window.addEventListener('resize',updateOrientation);
  updateOrientation();
}

let cameraYaw=0,cameraElevation=.20,cameraReady=false,sprintToggled=false,moveX=0,moveZ=0;
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
  sprintToggled=false;moveX=moveZ=0;
  releaseTouch();
  $('joystick-thumb').style.transform='';
  $('joystick').style.transform='';
  if(dog){dog.speed=0;dog.turnRate=0;dog.steeringRate=0;dog.motionX=dog.motionZ=0;}
}
function resize(){
  const {width,height}=stage.getBoundingClientRect();
  stageWidth=Math.max(1,width);stageHeight=Math.max(1,height);aspect=stageWidth/stageHeight;
  camera.fov=aspect<.9?65:aspect>1.90?48:53;
  camera.aspect=aspect;camera.updateProjectionMatrix();
  renderer.setSize(stageWidth,stageHeight,false);
  if(dog)frameCamera(0);
  resizeCompanion();
}
function frameCamera(dt){
  const ground=groundY(dog.x,dog.z),asset=activeDogAsset.asset;
  const framing=asset.coats[0].category?clamp(.65+.38*asset.height*asset.visualScale/.65,.78,1.10):1;
  if(!cameraReady){
    cameraCenter.set(dog.x,ground+1.09*framing,dog.z);
    cameraYaw=dog.heading;cameraElevation=.30;boomFraction=1;runCamera=0;cameraReady=true;
    cameraInput.yaw=cameraYaw;cameraInput.elevation=cameraElevation;
  }
  const error=wrapAngle(cameraInput.yaw-cameraYaw);
  cameraYaw=wrapAngle(cameraYaw+error*(1-Math.exp(-dt*19)));
  cameraElevation=mix(cameraElevation,cameraInput.elevation,1-Math.exp(-dt*17));
  camForward.set(Math.sin(cameraYaw),0,Math.cos(cameraYaw));
  const follow=1-Math.exp(-dt*11);
  cameraCenter.x=mix(cameraCenter.x,dog.x,follow);
  cameraCenter.z=mix(cameraCenter.z,dog.z,follow);
  cameraCenter.y=mix(cameraCenter.y,ground+1.09*framing,1-Math.exp(-dt*7));
  runCamera=mix(runCamera,clamp((dog.speed-5)/8,0,1),1-Math.exp(-dt*3.5));
  const boom=((aspect<.90?4.88:4.65)+runCamera*.51)*framing;
  desiredCamera.copy(cameraCenter).addScaledVector(camForward,-boom);
  desiredCamera.y+=(1.37+runCamera*.17+(cameraElevation-.30)*3.75)*framing;
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
  let sideways=stick.x,forward=-stick.y;
  for(const key of keys){
    const vector=keyVectors[key];
    if(!vector)continue;
    sideways+=vector[0];forward-=vector[1];
  }
  const inputLength=Math.hypot(sideways,forward);
  const inputStrength=clamp((inputLength-.095)/.905,0,1);
  const sprint=sprintPointer!==null||sprintToggled||keys.has('ShiftLeft')||keys.has('ShiftRight');
  const oldX=dog.x,oldZ=dog.z,oldHeading=dog.heading;
  let targetX=0,targetZ=0,maxSpeed=sprint?11.9:4.58,goal=null;
  if(gameTime<biscuitUntil)maxSpeed*=1.22;
  maxSpeed*=dog.zoneDrag??1;
  if(mudAt(dog.x,dog.z)){
    if(dog.speed>.38||inputStrength>0)runStats.mud+=dt;
    maxSpeed*=.57;
  }
  if(inputStrength){
    tap=null;
    const s=Math.sin(cameraYaw),c=Math.cos(cameraYaw);
    const drive=maxSpeed*inputStrength/inputLength;
    targetX=(s*forward-c*sideways)*drive;
    targetZ=(c*forward+s*sideways)*drive;
  }else if(tap){
    while(tap.path.length&&distance(dog,tap.path[0])<.29)tap.path.shift();
    if(!tap.path.length)tap=null;
    else{
      goal=tap.path[0];
      const gap=distance(dog,goal);
      const speed=tap.path.length>1?maxSpeed:Math.min(maxSpeed,Math.max(.84,gap*3.8));
      targetX=(goal.x-dog.x)*speed/gap;
      targetZ=(goal.z-dog.z)*speed/gap;
    }
  }
  if(paperLanes.length||springPlates.length){
    const [ex,ez]=fantasyForce(dog);
    targetX+=ex;targetZ+=ez;
  }
  const wantsMovement=Math.hypot(targetX,targetZ)>.01;
  const triesToReverse=targetX*moveX+targetZ*moveZ<0;
  const sliding=iceAt(dog.x,dog.z);
  if(sliding&&dog.speed>.4)runStats.ice+=dt;
  const traction=sliding?.22:1;
  const response=(!wantsMovement||triesToReverse?17.5:sprint?8.4:12.5)*traction;
  const blend=1-Math.exp(-dt*response);
  moveX=mix(moveX,targetX,blend);
  moveZ=mix(moveZ,targetZ,blend);
  if(!wantsMovement&&Math.hypot(moveX,moveZ)<.045)moveX=moveZ=0;
  const headingX=wantsMovement?mix(moveX,targetX,.32):moveX;
  const headingZ=wantsMovement?mix(moveZ,targetZ,.32):moveZ;
  if(Math.hypot(headingX,headingZ)>.17){
    const change=wrapAngle(Math.atan2(headingX,headingZ)-dog.heading);
    dog.heading=wrapAngle(dog.heading+change*(1-Math.exp(-dt*(sprint?10.8:14.6))));
  }
  let stride=dt;
  if(goal)stride=Math.min(stride,distance(dog,goal)/Math.max(.01,Math.hypot(moveX,moveZ)));
  step(dog,moveX*stride,moveZ*stride,dt,.284,false);
  dog.motionX=(dog.x-oldX)/dt;
  dog.motionZ=(dog.z-oldZ)/dt;
  const blockedAtFullSpeed=dog.speed<Math.hypot(moveX,moveZ)*.5;
  if(blockedAtFullSpeed){moveX=mix(moveX,dog.motionX,blend);moveZ=mix(moveZ,dog.motionZ,blend);}
  dog.turnRate=wrapAngle(dog.heading-oldHeading)/dt;
  dog.movingBackward=false;
  tapMarker.visible=Boolean(tap);
}

let clues=[],runStats;
let interactionTarget=null, lastInteractionUpdate=-1;
function emptyRun(){
  return {time:0,barks:0,help:0,wrong:0,panic:0,mud:0,clues:0,crossed:0,ice:0,raids:0,hazards:0,lost:0};
}
function mudAt(x,z){
  for(const item of activeMission().mud||[]){
    const [mx,mz,rx,rz]=item;
    if(((x-mx)/rx)**2+((z-mz)/rz)**2<1)return item;
  }
  return null;
}
function bridgeCrossings(stream){
  return stream.alternate?[stream,stream.alternate]:[stream];
}
function creekHeight(x,z,height){
  const stream=activeMission().stream;
  if(!stream)return height;
  const bank=1-smooth(stream.width*.5,stream.width*.5+2.2,Math.abs(x-stream.x));
  if(bank<=0)return height;
  const deck=Math.max(...bridgeCrossings(stream).map(span=>1-smooth(span.gap*.5-.17,span.gap*.5+.75,Math.abs(z-span.z))));
  const bed=activeMission().biome==='cloud'?-6.4:-.66;
  return mix(height,mix(bed,.26,deck),bank);
}
function bridgeChannel(config){
  const stream=config.stream;
  if(!stream)return;
  const [,hz]=config.half,rx=stream.width*.5,spans=bridgeCrossings(stream);
  colliders.push({stream,minX:stream.x-rx,maxX:stream.x+rx,minZ:-hz-1,maxZ:hz+1,height:0});
  const waterMat=new THREE.MeshLambertMaterial({color:config.biome==='cloud'?'#d1e5ea':'#83acaa',map:washTexture||null});
  const water=mesh(props,'plane',waterMat,stream.x,config.biome==='cloud'?-5.7:-.39,0,stream.width,2*hz+6,1);
  water.rotation.x=-Math.PI/2;
  if(config.biome==='cloud'){
    for(let i=0;i<18;i++){
      const offset=(i+.5)/18*(hz*2)-hz;
      if(spans.some(span=>Math.abs(span.z-offset)<span.gap*.5+2))continue;
      mesh(decor,'ball',i%2===0?'#dcecef':'#c6dce7',stream.x+Math.sin(i*2.7)*1.6,-4.2,offset,
        stream.width*.63,1.4+(i%3)*.51,4.2+(i%4)*.7);
    }
  }
  for(const [index,span] of spans.entries()){
    const width=stream.width+1.6,planks=Math.ceil(width/.42);
    for(let i=0;i<planks;i++){
      const x=stream.x-width*.5+(i+.5)*width/planks;
      const color=i%4===0?'#c9ab7f':i%3===0?'#bc9469':'#b28b60';
      chestnut(decor,'penRail',color,x,groundY(x,span.z)+.018,span.z,width/planks+.012,.175,span.gap+.41);
    }
    for(const side of [-1,1]){
      const z=span.z+side*span.gap*.5;
      fence(stream.x-rx-.78,z,stream.x+rx+.78,z);
      for(const bank of [-1,1]){
        const x=stream.x+bank*(rx+.6);
        mesh(decor,'stone','#b0a393',x,groundY(x,z)+.11,z,.58,.29,.45);
      }
    }
    const label=spans.length===1?'Le pont':index===0?'Passerelle nord':'Passerelle sud';
    signboard(stream.x+rx+1.6,span.z-span.gap*.5-1.6,label,null,.27);
  }
  for(let i=0;i<58;i++){
    const side=i%2===0?1:-1;
    const x=stream.x+side*(rx+.48+random()*.38),z=(random()*2-1)*hz;
    if(spans.every(span=>Math.abs(z-span.z)>span.gap*.5+1.35)){
      grass(x,z,1.15);
      if(i%4===0)rocks(x,z,2,.62);
    }
  }
}
function caveClearance(cave,x,z){
  return cave&&Math.abs(x-cave.x)<cave.length*.5+7&&Math.abs(z-cave.z)<cave.width*.5+3.4;
}
function buildCave(config){
  const cave=config.cave;
  if(!cave)return;
  const {x,z,length,width,height}=cave;
  const half=width*.5,rows=12,sides=20;
  const position=[],color=[],uv=[],indices=[];
  const snow=config.biome==='snow';
  const rock=new THREE.Color(snow?'#8f999c':'#80725d');
  const weathered=new THREE.Color(snow?'#dce4e2':'#a3a37b');
  const inside=new THREE.Color(snow?'#536771':'#514c43');
  const colorAt=new THREE.Color();
  const surface=(row,side,outer)=>{
    const progress=row/rows,angle=side/sides*Math.PI,section=Math.cos(angle);
    const arch=Math.sin(angle);
    const xx=x+(progress-.5)*length+(outer?.15:.21)*Math.sin(5.3*angle+progress*12);
    const jagged=.33*Math.sin(progress*22+angle*5.7)+.18*Math.cos(angle*11-progress*14);
    const cross=half+(outer?2.45:.05)+jagged*(outer?1.26:.45);
    const zz=z+cross*section;
    const base=groundY(xx,zz)-.19;
    const envelope=Math.pow(arch,.73);
    const roof=outer?height+(Math.sin(progress*Math.PI)*1.24)+jagged*.85:height*.77+jagged*.36;
    const y=base+envelope*roof;
    const spread=.48+.20*Math.sin(progress*18+angle*8)+.20*Math.cos(progress*43-angle*15);
    const frost=outer?smooth(.14,.83,arch)*spread:0;
    colorAt.copy(outer?rock:inside).lerp(weathered,frost).multiplyScalar(.88+.21*spread+(outer?.025:0));
    position.push(xx,y,zz);color.push(colorAt.r,colorAt.g,colorAt.b);uv.push(progress,side/sides);
  };
  const perFace=(rows+1)*(sides+1);
  for(const outer of [true,false]){
    for(let row=0;row<=rows;row++)for(let side=0;side<=sides;side++){
      surface(row,side,outer);
      if(row&&side){
        const i=position.length/3-1,q=i-sides-1;
        indices.push(q-1,i-1,q,q,i-1,i);
      }
    }
  }
  // Close the stone thickness around each mouth while leaving the tunnel open.
  for(const row of [0,rows]){
    const p=row*(sides+1);
    for(let i=0;i<sides;i++){
      const outer=p+i,inner=outer+perFace;
      indices.push(outer,outer+1,inner,inner,outer+1,inner+1);
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(position,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(color,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setIndex(indices);geo.computeVertexNormals();
  const stone=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({
    vertexColors:true,map:washTexture||null,side:THREE.DoubleSide
  }));
  stone.castShadow=stone.receiveShadow=true;props.add(stone);
  for(const side of [-1,1]){
    const wallZ=z+side*(half-.13);
    colliders.push({x1:x-length*.5,z1:wallZ,x2:x+length*.5,z2:wallZ,height:height+1,thickness:.31});
    for(let i=0;i<11;i++){
      const xx=x+length*(i/10-.5)+(random()-.5)*.8;
      const zz=z+side*(half+1.1+random()*1.08);
      const rock=mesh(decor,'stone',choose(snow?['#a8b7b9','#95a7aa','#c3cbca']:['#7c7b66','#8e8b70','#9d9178']),
        xx,groundY(xx,zz)+.56+random()*.82,zz,.57+random(),.77+random()*.90,.60+random()*.46);
      rock.rotation.y=random()*TAU;
    }
  }
  shade(x,z,length+1.3,width*.9,.77,groundY(x,z)+.049);
}

let wolves=[],fordCrossing=null,relayStops=[],relayIndex=0;
function buildFieldEvents(config){
  wolves=[];fordCrossing=null;relayIndex=0;
  relayStops=(config.relay||[]).map(([x,z,radius,name])=>{
    const markers=Array.from({length:12},(_,i)=>{
      const a=i/12*TAU,px=x+Math.sin(a)*radius,pz=z+Math.cos(a)*radius;
      const mark=mesh(props,'ball','#e9c57e',px,groundY(px,pz)+.145,pz,.26,.18,.26);
      mark.visible=false;return mark;
    });
    const pennant=group(props,x,groundY(x,z),z);
    mesh(pennant,'cyl','#826743',0,.94,0,.043,1.88,.043);
    mesh(pennant,'box','#e0ab59',.32,1.68,0,.64,.34,.08);
    return {x,z,radius,name,markers,pennant};
  });
  updateRelayMarkers();
  if(config.ford)buildFordGate(config.stream);
}
function relayPoint(){return relayStops[relayIndex]||null;}
function updateRelayMarkers(){
  for(const [index,stop] of relayStops.entries()){
    stop.pennant.visible=index===relayIndex;
    for(const peg of stop.markers)peg.visible=index===relayIndex;
  }
}
function checkRelay(){
  const stop=relayPoint();
  if(!stop)return;
  for(const m of animals){
    if(m.relayStage===relayIndex&&distance(m,stop)<=stop.radius)m.relayStage++;
  }
  if(!animals.every(m=>m.relayStage>relayIndex))return;
  relayIndex++;updateRelayMarkers();
  if(relayPoint()){
    showMessage('Halte '+relayIndex+'/'+relayStops.length+' validée');
    setNote('Prochaine halte · '+relayPoint().name);
    soundEffect('found');
  }else if(!unlockRoutePen())showMessage('Dernière halte passée');
  lastMapTime=-1;
}
function unlockRoutePen(){
  const pen=pens.sheep;
  if(!pen?.routeLocked||relayPoint()||lanternsPending()||activeMission().requireFord&&fordCrossing?.block.enabled)return false;
  pen.routeLocked=false;pen.block.enabled=false;
  grid=createGrid(activeMission());tap=null;
  showMessage('Bergerie ouverte');soundEffect('found');lastMapTime=-1;
  return true;
}
function buildFordGate(stream){
  const span=stream.alternate,width=span.gap-.05;
  const z=span.z+width*.5,x=stream.x;
  const g=group(props,x,groundY(x,z),z);
  // Hinge runs along the bridge, so the barrier lifts up without swinging into the flock.
  const gate=group(g,0,1.46,0);
  mesh(gate,'box','#9e5e3a',0,0,-width*.50,.20,.17,width);
  mesh(gate,'box','#b38555',0,-.48,-width*.50,.13,.12,width);
  for(let i=0;i<5;i++){
    const offset=-.25-(width-.5)*i/4;
    mesh(gate,'box','#815336',0,-.24,offset,.12,.64,.12);
  }
  mesh(g,'cyl','#71604d',0,.69,0,.22,1.54,.22);
  const block={x1:x,z1:z,x2:x,z2:z-width,height:1.55,thickness:.29,enabled:true};
  colliders.push(block);
  const levers=[-1,1].map(side=>{
    const px=x+side*(stream.width*.5+1.6),pz=span.z-span.gap*.5-1.10;
    const post=group(props,px,groundY(px,pz),pz);
    mesh(post,'box','#76583c',0,.50,0,.27,1,.33);
    mesh(post,'box','#ba905f',0,1,0,.49,.18,.41);
    const arm=group(post,0,1.04,0);
    mesh(arm,'cyl','#604c37',0,.22,0,.048,.52,.048);
    mesh(arm,'ball','#e0ae64',0,.51,0,.13,.10,.13);
    arm.rotation.z=-side*.38;
    signboard(px-.28,pz-1.12,'Vanne',null,side*.69);
    return {x:px,z:pz,arm,side};
  });
  fordCrossing={stream,span,gate,block,levers};
}
function openFord(){
  if(!fordCrossing?.block.enabled)return;
  fordCrossing.block.enabled=false;
  for(const lever of fordCrossing.levers)lever.arm.rotation.z=lever.side*.76;
  if(!unlockRoutePen()){
    grid=createGrid(activeMission());tap=null;
    showMessage('Vanne ouverte');soundEffect('found');
  }
  lastMapTime=-1;
}

function valleyTree(config,x,z,size){
  if(aroundEntrance(x,z))return;
  const g=group(decor,x,groundY(x,z),z);
  const a=random()*TAU;
  g.rotation.y=a;
  if(config.biome==='marsh'){
    const h=(3.9+random()*.8)*size,bark='#827258';
    rod(g,'taper',bark,[0,-.07,0],[.24*size,h*.65,.10*size],.255*size);
    rod(g,'taper',bark,[.24*size,h*.53,.10*size],[.11*size,h*.92,0],.14*size);
    for(let i=0;i<6;i++){
      const turn=i/6*TAU+random()*.4,spread=(1.34+.48*random())*size;
      const xx=Math.sin(turn)*spread,zz=Math.cos(turn)*spread,top=h*(.81+.12*random());
      rod(g,'taper',bark,[.20*size,h*.45,.09*size],[xx,top,zz],.09*size);
      const canopy=mesh(g,'canopy',i%2===0?'#69886a':'#879c67',xx*.84,top,zz*.84,1.10*size,.99*size,1.07*size);
      canopy.userData.wind=2;
      for(let j=0;j<3;j++){
        const color=['#6c8c68','#90a379','#a9ae78'][(i+j)%3];
        const branch=mesh(g,'spray',color,xx+(random()-.5)*size,top-(.42+j*.34)*size,zz+(random()-.5)*size,.51*size,(.90+.25*random())*size,.57*size);
        branch.rotation.y=turn+j*.37;branch.rotation.z=Math.sin(turn)*.23;branch.userData.wind=2;
      }
    }
    const crown=mesh(g,'canopy','#97a575',.1*size,h*.98,0,1.35*size,1.03*size,1.28*size);
    crown.userData.wind=2;
    shade(x+.4*size,z+.3*size,5.6*size,4.8*size,.44);
    obstacle(x,z,.44*size,h+1.4*size);
  }else{
    const h=(4.8+random()*1.25)*size;
    rod(g,'taper','#745f48',[0,-.09,0],[.09*size,h*.89,-.06*size],.159*size);
    for(let i=0;i<7;i++){
      const y=.32+i*.105,r=(.78-Math.pow(i/6,1.72)*.51)*size;
      const canopy=mesh(g,'canopy',['#546b50','#657657','#73805a'][i%3],.09*size*Math.sin(i),y*h,0,r,(.12+.043*(1-y))*h,r*.92);
      canopy.rotation.y=i*1.35;canopy.userData.wind=2;
    }
    shade(x+.45*size,z+.35*size,3.8*size,3.5*size,.42);
    obstacle(x,z,.34*size,h*1.04);
  }
}

function valleyFeatures(config){
  for(const [x,z,kind] of config.features||[]){
    if(kind==='hedge'){
      for(let i=0;i<8;i++){
        bush(x+i*1.03,z+Math.sin(i*.48)*1.1,.95+random()*.39);
        if(i%3===0)flowers(x+i*1.03,z+1.4,6,.63);
      }
    }else if(kind==='reeds'){
      for(let i=0;i<34;i++){
        const a=random()*TAU,d=Math.sqrt(random());
        const px=x+Math.cos(a)*7*d,pz=z+Math.sin(a)*4*d;
        if(!blocked(px,pz,.36)&&!nearTrail(px,pz,2.4))grass(px,pz,1.3+random()*.85);
      }
    }else{
      const g=group(decor,x,groundY(x,z),z);
      if(kind==='cairn'){
        rocks(x,z,3,.68);
        for(let i=0;i<6;i++)mesh(g,'stone',i%2===0?'#ab9578':'#c6af8e',
          Math.sin(i*12)*.19,i*.24,Math.cos(i*13)*.13,.77-i*.085,.23,.55-i*.063).rotation.y=i*.91;
        obstacle(x,z,.63,1.6);
      }else if(kind==='trough'){
        stoneTrough(g,'sheep');obstacle(x,z,.52,.6);
      }else if(kind==='shelter'){
        for(const px of [-1.4,1.4])for(const pz of [-.98,.98])
          mesh(g,'penPost','#907053',px,1.04,pz,.22,2.12,.22);
        for(const side of [-1,1]){
          const roof=mesh(g,'box','#a26e49',0,2.17,side*.64,3.54,.17,1.64);
          roof.rotation.x=side*-.27;
        }
        mesh(g,'box','#ba936c',0,.86,-.98,2.8,1.49,.18);
        obstacle(x,z,1.52,2.65);
      }
    }
  }
}

function wolfTorso(){
  const profile=[
    [-.86,.97,.014,.028],[-.71,.97,.24,.31],[-.36,1.0,.264,.363],[-.10,1.07,.23,.34],
    [.23,1.12,.334,.437],[.47,1.15,.301,.47],[.70,1.37,.234,.33],
    [.87,1.54,.236,.23],[1.04,1.56,.225,.21],[1.17,1.48,.148,.135],
    [1.32,1.43,.123,.105],[1.46,1.44,.093,.079],[1.49,1.44,.014,.017]
  ];
  const rings=20,positions=[],colors=[],uv=[],faces=[];
  const base=new THREE.Color('#857668'),chest=new THREE.Color('#b5a58e'),saddle=new THREE.Color('#4e493f'),pigment=new THREE.Color();
  for(const [row,[z,y,radius,vertical]] of profile.entries()){
    for(let i=0;i<=rings;i++){
      const a=i%rings/rings*TAU,c=Math.cos(a),s=Math.sin(a);
      const tuft=(1+.025*Math.cos(i*2.7+row*2));
      positions.push(radius*c*tuft,y+vertical*s*tuft,z);
      pigment.copy(base).lerp(s>=0?saddle:chest,Math.abs(s)*.90)
        .multiplyScalar(.92+.055*Math.sin(row*1.64+i*.63));
      colors.push(pigment.r,pigment.g,pigment.b);uv.push(i/rings,row/(profile.length-1));
      if(row&&i){
        const index=positions.length/3-1,previous=index-rings-1;
        faces.push(previous-1,previous,index,previous-1,index,index-1);
      }
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setIndex(faces);geo.computeVertexNormals();
  return new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));
}
function createWolf(den,i){
  const x=den.x,z=den.z,root=group(map,x,groundY(x,z),z),body=group(root);
  body.add(wolfTorso());
  const tail=group(body,0,1.07,-.69);
  mesh(tail,'lobe','#615447',0,-.24,-.35,.124,.143,.47).rotation.x=.64;
  mesh(tail,'ball','#4b4339',0,-.48,-.64,.090,.13,.22).rotation.x=.60;
  mesh(body,'ball','#302f2a',0,1.454,1.458,.102,.069,.069);
  for(const side of [-1,1]){
    mesh(body,'cone','#6a5a4d',side*.153,1.785,.89,.124,.34,.125).rotation.z=-side*.16;
    mesh(body,'lobe','#937967',side*.156,1.754,.977,.050,.105,.041).rotation.z=-side*.16;
    mesh(body,'ball','#392d24',side*.188,1.58,1.105,.036,.034,.045);
    mesh(body,'ball','#dba665',side*.209,1.588,1.122,.016,.018,.02);
  }
  const legs=[-1,1].flatMap((side)=>[true,false].map(front=>{
    const leg=group(body,side*(front?.217:.188),front?.99:.96,front?.39:-.56);
    mesh(leg,'ball',front?'#837563':'#786a5c',0,-.17,front?0:.065,.119,.32,front?.147:.246).rotation.x=front?-.11:-.22;
    const shin=group(leg,0,-.43,front?0:.13);
    rod(shin,'taper','#9b8a76',[0,.02,0],[0,-.32,front?0:-.14],.072);
    const toes=group(shin,0,-.34,front?0:-.14);
    mesh(toes,'ball','#776857',0,-.15,.037,.071,.087,.112);
    mesh(toes,'cyl','#918270',0,-.060,-.011,.052,.24,.053);
    return {leg,shin,toes,phase:side*(front?1:-1)>0?0:Math.PI};
  }));
  const material=new THREE.MeshBasicMaterial({color:'#e4ac65',transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false});
  const alert=mesh(root,'ring',material,0,.10,0,1.12,1.12,1);
  alert.rotation.x=-Math.PI*.5;alert.visible=false;
  const shadow=mesh(root,'plane',shadowPaint,0,.042,-.13,1.12,2.45,1);
  shadow.rotation.x=-Math.PI*.5;
  return {x,z,den,root,body,tail,alert,legs,heading:1.2+i*.55,speed:0,phase:0,mode:'watch',until:activeMission().lethalPack?5+i*.85:2+i*4,path:[],nextPath:0,repels:0,gone:false};
}
function placeWolves(config){
  wolves=(config.wolves||[]).map(([x,z],i)=>{
    const origin=point(x,z);
    if(blocked(x,z,.40)){
      const node=grid[nearestGrid(origin)];
      if(node)return createWolf(point(node.x,node.z),i);
    }
    return createWolf(origin,i);
  });
}
function wolfRetreat(wolf,repelled){
  if(wolf.target?.grabbed===wolf)wolf.target.grabbed=null;
  wolf.mode='retreat';wolf.until=gameTime+(repelled?32:22);
  wolf.path=[];wolf.nextPath=0;wolf.target=null;
  if(repelled){
    wolf.repels++;showMessage('Loup repoussé');
  }
}
function repelWolves(){
  for(const wolf of wolves){
    if(wolf.gone||wolf.mode==='retreat'||distance(dog,wolf)>16.5||!travelClear(dog,wolf,.15))continue;
    wolfRetreat(wolf,true);
  }
}
function nearestPrey(wolf){
  let prey=null,best=Infinity;
  for(const m of animals){
    if(m.safe||m.escape||m.grabbed||distance(m,dog)>32||m.x>pens[m.type].left-4)continue;
    if(activeMission().lethalPack&&wolves.some(other=>other!==wolf&&other.target===m))continue;
    const d=distance(m,wolf);
    if(d<best){best=d;prey=m;}
  }
  return best<36?prey:null;
}
function moveWolf(wolf,target,speed,dt){
  if(distance(wolf,target)<.38){wolf.speed=0;return;}
  if(gameTime>wolf.nextPath){
    wolf.nextPath=gameTime+.85;
    wolf.path=findPath(wolf,target);
  }
  followPath(wolf,wolf.path,speed,dt);
}
function alarmPack(wolf){
  let hit=0;
  for(const m of animals){
    if(m.safe||m.escape||distance(m,wolf)>7.8||!travelClear(wolf,m,.18))continue;
    m.wolfAlarm=gameTime+1.75;
    m.wolfSource=point(wolf.x,wolf.z);
    hit++;
  }
  if(hit){
    runStats.raids++;
    showMessage('Le troupeau se disperse');
  }
}
function updateWolves(dt){
  const lethal=activeMission().lethalPack;
  for(const wolf of wolves){
    if(wolf.gone)continue;
    wolf.speed=0;
    if(wolf.mode==='watch'&&gameTime>wolf.until){
      const prey=nearestPrey(wolf);
      if(prey){
        wolf.mode='warn';wolf.target=prey;wolf.until=gameTime+(lethal?5.0:3.4);wolf.nextPath=0;
        if(!wolves.some(other=>other.mode==='attack'))showMessage(lethal?'La meute approche':'Un loup approche');
        soundEffect('warning');
      }
    }else if(wolf.mode==='warn'){
      if(wolf.target.safe)wolfRetreat(wolf,false);
      else{
        if(distance(wolf,wolf.target)>10)moveWolf(wolf,wolf.target,3.4,dt);
        if(gameTime>wolf.until){wolf.mode='charge';wolf.until=gameTime+(lethal?8:5);}
      }
    }else if(wolf.mode==='charge'){
      const prey=wolf.target;
      if(prey?.safe||gameTime>wolf.until)wolfRetreat(wolf,false);
      else if(distance(wolf,dog)<1.9)wolfRetreat(wolf,true);
      else if(distance(wolf,prey)<3.7&&travelClear(wolf,prey,.18)){
        alarmPack(wolf);
        if(lethal){
          prey.grabbed=wolf;prey.speed=prey.vx=prey.vz=0;
          wolf.mode='attack';wolf.until=gameTime+8;
          showMessage('Une brebis est prise · Aboie à portée',3800);
          soundEffect('warning');
        }else wolfRetreat(wolf,false);
      }else moveWolf(wolf,prey,7.3,dt);
    }else if(wolf.mode==='attack'){
      if(wolf.target.safe||distance(wolf,dog)<1.9)wolfRetreat(wolf,true);
      else if(gameTime>wolf.until){
        failMission('La meute a pris une brebis.',
          'Aboie près du loup avant la fin du décompte. La carte montre les attaques en rouge.',wolf.target);
        return;
      }
    }else if(wolf.mode==='retreat'){
      if(distance(wolf,wolf.den)>1.0)moveWolf(wolf,wolf.den,5.9,dt);
      else if(wolf.repels>=2){wolf.gone=true;wolf.root.visible=false;continue;}
      else if(gameTime>wolf.until)wolf.mode='watch';
    }
    const looking=wolf.target||wolf.den;
    if(wolf.speed<.18&&wolf.mode!=='watch')updateHeading(wolf,looking.x-wolf.x,looking.z-wolf.z,dt,3);
    const drive=smooth(.3,5.4,wolf.speed);
    wolf.phase=(wolf.phase+dt*(2+wolf.speed*2.1))%TAU;
    for(const {leg,shin,toes,phase} of wolf.legs){
      const gait=wolf.phase+phase;
      leg.rotation.x=Math.sin(gait)*drive*.52;
      shin.rotation.x=-Math.max(0,Math.cos(gait))*drive*.55;
      toes.rotation.x=-leg.rotation.x-shin.rotation.x;
    }
    wolf.root.position.set(wolf.x,groundY(wolf.x,wolf.z),wolf.z);
    wolf.root.rotation.y=wolf.heading;
    wolf.body.position.y=Math.sin(wolf.phase*2)*drive*.047;
    wolf.tail.rotation.y=Math.sin(wolf.phase*.58)*(.12+drive*.21);
    wolf.alert.visible=wolf.mode==='warn'||wolf.mode==='charge'||wolf.mode==='attack';
    wolf.alert.material.color.set(wolf.mode==='attack'?'#f68e71':'#e4ac65');
    if(wolf.alert.visible){
      const radius=1.38+(!prefersStill?Math.sin(gameTime*5)*.24:0);
      wolf.alert.scale.set(radius,radius,1);
    }
  }
}
function updateFieldEvents(dt){
  updateWolves(dt);
  if(missionFailed)return;
  updateDangers(dt);
  if(missionFailed)return;
  if(wolves.length||fieldDangers.length)updateFieldRisk();
  checkRelay();
  if(fordCrossing&&!fordCrossing.block.enabled){
    fordCrossing.gate.rotation.x+=(1.37-fordCrossing.gate.rotation.x)*(1-Math.exp(-dt*7));
  }
}
const lambCalm=m=>dog.speed<5&&!(m.startle>gameTime);
function lambFollowing(m,d){
  if(!m.bonded||!lambCalm(m)||dog.speed<.35||d<3.2||d>13||m.wolfAlarm>gameTime)return false;
  const movingAway=(dog.x-m.x)*(dog.motionX||0)+(dog.z-m.z)*(dog.motionZ||0)>.20*d;
  return movingAway&&travelClear(m,dog,.31);
}
function animalEncounterInfluence(m,dt){
  let vx=0,vz=0;
  if(m.wolfAlarm>gameTime){
    const from=m.wolfSource,d=Math.max(.15,distance(m,from));
    const push=3.9*smooth(0,1.5,m.wolfAlarm-gameTime);
    vx+=(m.x-from.x)/d*push;vz+=(m.z-from.z)/d*push;
  }
  if(m.valleyLamb){
    const d=distance(m,dog),calm=lambCalm(m);
    if(calm&&d>=2.0&&d<=5.4&&travelClear(m,dog,.25)){
      m.trust=Math.min(1.35,m.trust+dt);
      if(m.trust>=1.35&&!m.bonded){
        m.bonded=true;showMessage('Un agneau te suit');soundEffect('found');
      }
    }else if(!m.bonded)m.trust=Math.max(0,m.trust-dt*.42);
    if(d>3.75&&lambFollowing(m,d)){
      const follow=Math.min(2.1,(d-3.75)*.68);
      vx+=(dog.x-m.x)/d*follow;vz+=(dog.z-m.z)/d*follow;
    }
  }
  return [vx,vz];
}
let fieldDangers=[],missionFailed=false,riskText='';
const inDanger=(zone,x,z)=>((x-zone.x)/zone.rx)**2+((z-zone.z)/zone.rz)**2<1;
const fieryDanger=zone=>zone.kind==='lava'||zone.kind==='vent';

function paintDangerSurface(zone){
  const vertices=[],uv=[],triangles=[],sides=48,rings=6;
  const {x,z,rx,rz}=zone;
  vertices.push(x,groundY(x,z)+.14,z);uv.push(.5,.5);
  for(let ring=1;ring<=rings;ring++){
    const scale=ring/rings,start=1+(ring-1)*sides;
    for(let i=0;i<sides;i++){
      const a=TAU*i/sides,u=scale*Math.cos(a),v=scale*Math.sin(a),px=x+rx*u,pz=z+rz*v;
      vertices.push(px,groundY(px,pz)+.14,pz);uv.push((u+1)*.5,(v+1)*.5);
      const here=start+i,next=start+(i+1)%sides;
      if(ring===1)triangles.push(0,next,here);
      else triangles.push(here-sides,next,here,here-sides,next-sides,next);
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geometry.setIndex(triangles);
  const surface=new THREE.ShaderMaterial({
    uniforms:{mist:{value:zone.kind==='cloud'?1:0},wet:{value:zone.kind==='flood'?1:0},
      time:{value:0},heat:{value:0}},
    transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,
    vertexShader:`varying vec2 p;
      void main(){p=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform float mist,wet,time,heat;varying vec2 p;
      void main(){
        vec2 q=p*2.0-1.0;
        float r=length(q);
        float ripples=sin(p.x*52.0+p.y*24.0+time*2.1)*sin(p.y*40.0-p.x*11.0+time*.72);
        float pools=sin(p.x*16.0+sin(p.y*20.0)+time*.35)*cos(p.y*17.0-p.x*8.0-time*.55);
        float line=exp(-abs(r-.87)*70.0);
        vec3 smoke=mix(vec3(.50,.68,.71),vec3(.87,.94,.96),.54+.34*pools);
        vec3 water=mix(vec3(.14,.28,.34),vec3(.39,.64,.65),.50+.33*pools+.12*ripples);
        vec3 ash=mix(vec3(.16,.095,.075),vec3(.65,.29,.12),.44+.42*pools);
        vec3 flame=mix(vec3(.36,.11,.065),vec3(1.0,.48,.12),.51+.45*pools+.08*ripples);
        vec3 color=mix(mix(ash,flame,heat),smoke,mist);
        color=mix(color,water,wet);
        color=mix(color,wet>.5?vec3(.69,.86,.89):vec3(1.0,.71,.29),line*(.36+.44*heat)*(1.0-mist));
        float opacity=(1.0-smoothstep(.92,1.0,r))*mix(.67+.29*heat,.40+.35*heat,mist);
        gl_FragColor=vec4(color,opacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const result=new THREE.Mesh(geometry,surface);
  result.renderOrder=2;props.add(result);return result;
}
function makeDrift(zone){
  const cloud=zone.kind==='cloud';
  const base=group(props,zone.x,groundY(zone.x,zone.z),zone.z);
  const material=new THREE.MeshBasicMaterial({
    color:cloud?'#e4f2ee':'#a37462',transparent:true,opacity:.18,depthWrite:false
  });
  const rng=seeded(activeMission().seed+Math.round(zone.x*12+zone.z*31));
  const parts=Array.from({length:cloud?7:4},(_,i)=>{
    const a=i/7*TAU,dx=Math.sin(a)*zone.rx*.51,dz=Math.cos(a)*zone.rz*.51;
    const plume=mesh(base,'ball',material,dx,.55,dz,zone.rx*(cloud?.42:.19),cloud?.56:1.04,zone.rz*(cloud?.42:.20));
    return {plume,dx,dz,phase:rng()*TAU};
  });
  return {base,material,parts};
}
function ventSparks(zone){
  const count=34,positions=new Float32Array(count*3);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const material=new THREE.PointsMaterial({color:'#ffad54',size:.18,transparent:true,opacity:.87,depthWrite:false});
  const sparks=new THREE.Points(geometry,material);
  sparks.frustumCulled=false;props.add(sparks);return sparks;
}
function buildDangers(config){
  fieldDangers=(config.dangers||[]).map(([kind,x,z,rx,rz,start])=>{
    const zone={kind,x,z,rx,rz,start,state:'quiet',heat:0};
    zone.surface=paintDangerSurface(zone);
    if(kind==='cloud'||kind==='vent')zone.drift=makeDrift(zone);
    if(kind==='vent')zone.sparks=ventSparks(zone);
    return zone;
  });
}
function dangerPhase(zone,time){
  if(zone.kind==='lava')return 'active';
  if(zone.kind==='cloud')return ((time+zone.start)%43)<24?'active':'quiet';
  if(time<zone.start)return 'quiet';
  const cycle=(time-zone.start)%(zone.kind==='flood'?86:33);
  return cycle<(zone.kind==='flood'?12:7)?'warning':cycle<(zone.kind==='flood'?45:13)?'active':'quiet';
}
function floodIsRising(){
  return fieldDangers.some(zone=>zone.kind==='flood'&&zone.state!=='quiet');
}
function updateDangers(dt){
  for(const zone of fieldDangers){
    const state=dangerPhase(zone,gameTime);
    if(state!==zone.state){
      zone.state=state;
      if(state==='warning'&&(zone.kind==='flood'||distance(zone,dog)<35)){
        showMessage(zone.kind==='flood'?'La crue monte · Pont nord conseillé':'Éruption imminente');
        soundEffect('warning');
      }
    }
    const charge=state==='active'?1:state==='warning'?.55:.10;
    zone.heat=mix(zone.heat,charge,1-Math.exp(-dt*3.2));
    zone.surface.visible=zone.kind!=='flood'||state!=='quiet';
    zone.surface.material.uniforms.heat.value=zone.heat;
    const time=prefersStill?0:gameTime;
    zone.surface.material.uniforms.time.value=time;
    if(zone.drift){
      const {parts,material}=zone.drift;
      material.opacity=zone.kind==='cloud'?.04+.28*zone.heat:.04+.13*zone.heat;
      for(const {plume,dx,dz,phase} of parts){
        const lift=.48+.31*Math.sin(time*.95+phase);
        plume.position.set(dx+Math.cos(time*.33+phase)*1.20,groundY(zone.x+dx,zone.z+dz)-zone.drift.base.position.y+lift,dz+Math.sin(time*.30+phase)*.64);
      }
    }
    if(zone.sparks){
      zone.sparks.visible=state==='active'&&!prefersStill&&distance(zone,dog)<58;
      if(zone.sparks.visible){
        const xyz=zone.sparks.geometry.attributes.position,y=groundY(zone.x,zone.z);
        for(let i=0;i<xyz.count;i++){
          const a=i*2.4,t=(gameTime*.55+i*.119)%1;
          xyz.setXYZ(i,zone.x+Math.sin(a)*t*zone.rx*.7,y+.22+4.0*Math.sin(Math.PI*t)+t,zone.z+Math.cos(a)*t*zone.rz*.7);
        }
        xyz.needsUpdate=true;
      }
    }
  }
  if(!fieldDangers.length)return;
  trackDanger(dog,dt);
  if(missionFailed)return;
  for(const m of animals){
    if(!m.safe)trackDanger(m,dt);
    if(missionFailed)return;
  }
}
function trackDanger(m,dt){
  let drag=1,sink=0,heat=0;
  for(const zone of fieldDangers){
    if(zone.state!=='active'||!inDanger(zone,m.x,m.z))continue;
    if(zone.kind==='cloud'){drag=Math.min(drag,.64);sink=Math.max(sink,m===dog?.16:.53);}
    if(zone.kind==='flood'){drag=Math.min(drag,.53);sink=Math.max(sink,.12);}
    if(fieryDanger(zone))heat++;
  }
  m.zoneDrag=drag;
  m.sink=mix(m.sink??0,sink,1-Math.exp(-dt*7));
  if(heat){
    m.exposure=(m.exposure??0)+dt;
    if(!m.traversedHot){m.traversedHot=true;runStats.hazards++;}
    if(m.exposure>(m===dog?1.65:2.05)){
      failMission('Une éruption a coupé la traversée.',
        m===dog?'Reste sur les sentiers sûrs quand les évents s’illuminent.':'Une brebis a péri dans une zone brûlante. Fais le tour des évents au prochain passage.',m===dog?null:m);
    }
  }else{
    m.exposure=0;m.traversedHot=false;
  }
}
function repulsionFromHeat(m){
  let vx=0,vz=0;
  for(const zone of fieldDangers){
    if(!fieryDanger(zone)||zone.state==='quiet')continue;
    const dx=m.x-zone.x,dz=m.z-zone.z;
    const gap=Math.hypot(dx/zone.rx,dz/zone.rz);
    if(gap>1.3)continue;
    const factor=(1-smooth(.84,1.30,gap))*(zone.state==='active'?3.15:1.90)/Math.max(.15,Math.hypot(dx,dz));
    vx+=dx*factor;vz+=dz*factor;
  }
  return [vx,vz];
}
function failMission(title,help,lost=null){
  if(won||missionFailed)return;
  missionFailed=true;missionEntered=false;
  if(lost){lost.lost=true;if(lost.root)lost.root.visible=false;runStats.lost++;}
  $('failure-title').textContent=title;
  $('failure-help').textContent=help;
  $('failure-tally').textContent=animals.filter(m=>m.safe).length+' sur '+animals.length+' à l’abri';
  setFieldRisk('');
  soundEffect('warning');
  openModal($('failure-dialog'),canvas);
}
function setFieldRisk(text){
  if(riskText===text)return;
  riskText=text;
  const status=$('field-risk');
  status.textContent=text;status.hidden=!text;
}
function updateFieldRisk(){
  const urgent=wolves.filter(wolf=>wolf.mode==='attack').sort((a,b)=>a.until-b.until)[0];
  const hot=[dog,...animals].some(m=>!m.safe&&(m.exposure??0)>.12);
  setFieldRisk(urgent?'Brebis en danger · '+Math.max(1,Math.ceil(urgent.until-gameTime))+' s':hot?'Zone brûlante':'');
}
function fantasyLand(config){
  if(config.biome==='cloud'){
    const [hx,hz]=config.half;
    for(let i=0;i<42;i++){
      const a=i/42*TAU;
      const x=Math.cos(a)*(hx+10),z=Math.sin(a)*(hz+11);
      const colors=['#d9ebec','#cee1ea','#e6efeb','#ebeee4','#bedbe5'];
      for(let j=0;j<3;j++){
        const spread=6+random()*15;
        const puff=mesh(decor,'ball',colors[(i+j)%colors.length],x+Math.sin(a)*j*4,-6.5+j*1.3+random()*3,z-Math.cos(a)*j*5,
          spread,4+random()*4,7+random()*13);
        puff.rotation.y=a;
      }
      if(i%7===0){
        const island=mesh(decor,'rock','#8ca7a7',x*1.31,-8,z*1.31,8.5,12,10);
        island.rotation.y=a;
        const cap=mesh(decor,'lobe','#99b29d',x*1.31,1.5,z*1.31,8.2,3.8,9.3);
        cap.rotation.y=a+.48;
      }
    }
  }else if(config.biome==='ember'){
    const north=-config.half[1]-33;
    const mountain=mesh(decor,'rock','#7a6a6d',18,3,north,35,31,31);
    mountain.rotation.y=.62;
    mesh(decor,'lobe','#56494c',17,23,north,16,6.1,14);
    for(let i=0;i<12;i++){
      const a=i/12*TAU;
      const plume=mesh(decor,'lobe',i%3===0?'#ab9896':'#9e8e94',17+Math.sin(a)*5+i*.82,27+i*1.67,north+Math.cos(a)*4,
        4+i*.44,2.1+i*.36,4.2+i*.38);
      plume.rotation.z=i*.67;
    }
    for(let i=0;i<27;i++){
      const a=i/27*TAU,r=.88+random()*.14;
      const x=Math.cos(a)*config.half[0]*r,z=Math.sin(a)*config.half[1]*r;
      if(nearTrail(x,z,3)||blocked(x,z,1.3))continue;
      for(let j=0;j<4;j++){
        const px=x+(j-1.5)*.8,pz=z+Math.sin(j*2.7)*1.1,h=1.5+random()*4.6;
        const stone=mesh(decor,'taper',j%3===0?'#665b59':'#564d4d',px,groundY(px,pz)+h*.43,pz,.59+random()*.57,h,.70+random()*.46);
        stone.rotation.z=(random()-.5)*.17;stone.rotation.y=i*1.38;
        obstacle(px,pz,.56,h);
      }
    }
  }
}

function accessibleSpawn(x,z,occupied,component){
  const at=point(x,z);
  const avoid=p=>Object.values(pens).some(pen=>pen.inside(p))||
    fieldDangers.some(zone=>fieryDanger(zone)&&inDanger(zone,p.x,p.z))||
    occupied.some(m=>distance(m,p)<.96);
  const node=grid[nearestGrid(at,component,true)];
  if(!blocked(x,z,.43)&&!avoid(at)&&node&&distance(node,at)<2.7)return at;
  let choice=null,near=Infinity;
  for(const candidate of grid){
    if(candidate.region!==component)continue;
    const d=distance(at,candidate);
    if(d>=near||avoid(candidate))continue;
    near=d;choice=candidate;
  }
  return choice||at;
}
let fieldBeacons=[],springPlates=[],paperLanes=[],paperStoppedUntil=-1,campaignRotors=[];
const newFieldKinds={chime:'Faire sonner',mill:'Couper le vent',lamp:'Allumer'};
function lanternsPending(){
  return activeMission().requiresLights&&fieldBeacons.some(beacon=>beacon.kind==='lamp'&&!beacon.lit);
}
function makeFieldDevices(config){
  paperStoppedUntil=-1;campaignRotors=[];
  springPlates=(config.springs||[]).map(([x,z,radius,angle])=>{
    const node=group(props,x,groundY(x,z),z);
    node.rotation.y=angle;
    mesh(node,'cyl','#99754f',0,.055,0,radius,.14,radius);
    const plate=mesh(node,'cyl','#c28b56',0,.14,0,radius*.92,.13,radius*.92);
    for(const side of [-1,1]){
      const arm=mesh(node,'box','#f5e1a9',side*.29,.22,.21,.115,.045,.58);
      arm.rotation.y=side*.65;
    }
    mesh(node,'box','#f5e1a9',0,.22,-.31,.14,.045,.65);
    return {x,z,radius,angle,plate,react:-1};
  });
  fieldBeacons=(config.beacons||[]).map(([kind,x,z])=>{
    const stand=group(props,x,groundY(x,z),z);
    const brass='#ae814f',iron='#605863';
    const glow=new THREE.MeshBasicMaterial({color:'#e4b782'});
    const halo=mesh(stand,'ring',new THREE.MeshBasicMaterial({color:'#fff1ab',transparent:true,opacity:.48,depthWrite:false,side:THREE.DoubleSide}),0,.081,0,2.1,2.1,1);
    halo.rotation.x=-Math.PI*.5;halo.visible=false;
    const post=kind==='chime'?brass:kind==='lamp'?iron:'#a88b60';
    mesh(stand,'cyl',post,0,.91,0,.12,1.82,.12);
    mesh(stand,'stone','#b5a087',0,.15,0,.52,.24,.53);
    let timepiece=null;
    if(kind==='chime'){
      mesh(stand,'box',brass,.28,1.85,0,.70,.105,.12);
      timepiece=group(stand,.55,1.70,0);
      mesh(timepiece,'taper','#ccb06c',0,-.17,0,.27,.39,.27);
      mesh(timepiece,'ball','#d9a158',0,-.37,0,.079,.075,.082);
    }else if(kind==='lamp'){
      mesh(stand,'box',glow,0,1.84,0,.36,.38,.35);
      mesh(stand,'cone',iron,0,2.15,0,.32,.28,.32);
      for(const i of [-1,1])for(const j of [-1,1])mesh(stand,'box',iron,i*.18,1.85,j*.17,.037,.39,.037);
    }else{
      timepiece=group(stand,0,1.59,.18);
      for(let j=0;j<5;j++){
        const arm=group(timepiece);
        arm.rotation.z=TAU*j/5;
        mesh(arm,'box',['#cda573','#ebc789','#ad847c','#b2b68e','#cb9f78'][j],.13,.37,0,.34,.53,.065).rotation.z=-.49;
      }
    }
    return {kind,x,z,halo,glow,timepiece,lit:false,sounding:-1};
  });
  paperLanes=(config.gustLanes||[]).map(([x,z,rx,rz,dir],i)=>{
    const ribbons=[];
    for(let k=0;k<8;k++){
      const tx=x+Math.sin(k*2.35)*rx*.8,tz=z+Math.cos(k*1.72)*rz*.81;
      const strip=mesh(props,'box',k%2?'#eedba7':'#d0a6a0',tx,groundY(tx,tz)+.39,tz,.07,.07,.52);
      ribbons.push({strip,x:tx,z:tz,phase:k*1.26});
    }
    return {x,z,rx,rz,dir,i,ribbons};
  });
}
function reachableBeacons(){
  return fieldBeacons.filter(beacon=>beacon.kind==='lamp'?!beacon.lit:beacon.kind==='mill'?gameTime>=paperStoppedUntil:gameTime>=beacon.sounding)
    .map(item=>({x:item.x,z:item.z,kind:item.kind,item,range:4.0}));
}
function useFieldBeacon(beacon){
  if(beacon.kind==='lamp'){
    beacon.lit=true;beacon.halo.visible=true;beacon.glow.color.set('#fff0ac');
    if(!unlockRoutePen())showMessage('Lanterne allumée');
  }else if(beacon.kind==='chime'){
    beacon.sounding=gameTime+14;beacon.halo.visible=true;
    showMessage('Le carillon rappelle les brebis');
  }else{
    paperStoppedUntil=gameTime+24;
    showMessage('Vent coupé · 24 s');
  }
  soundEffect(beacon.kind==='chime'?'bell':'found');lastMapTime=-1;
}
const paperGust=lane=>gameTime>=paperStoppedUntil&&(gameTime+lane.i*1.4)%16>=10.3;
function paintFieldDevices(dt){
  for(const pad of springPlates)pad.plate.position.y=pad.react>gameTime?.10:.14;
  for(const beacon of fieldBeacons){
    if(beacon.kind==='lamp')continue;
    if(beacon.kind==='chime'){
      beacon.halo.visible=beacon.sounding>gameTime;
      if(!prefersStill)beacon.timepiece.rotation.z=beacon.halo.visible?.34*Math.sin(gameTime*9):0;
    }else if(!prefersStill&&gameTime>=paperStoppedUntil)beacon.timepiece.rotation.z+=dt*1.45;
  }
  if(!prefersStill)for(const rotor of campaignRotors)rotor.rotation.z+=dt*.42;
  for(const lane of paperLanes){
    const gust=paperGust(lane);
    for(const {strip,x,z,phase} of lane.ribbons){
      strip.position.x=x+(gust&&!prefersStill?.75*Math.sin(gameTime*3+phase):0);
      strip.position.y=groundY(strip.position.x,z)+.35+(gust?.62:0);
      strip.rotation.y=gust?lane.dir*Math.PI*.19:.14;
    }
  }
}
function fantasyForce(m){
  let x=0,z=0;
  if(springPlates.length){
    if(gameTime>=(m.springReady??0)){
      const pad=springPlates.find(item=>distance(m,item)<item.radius*.82);
      if(pad){
        pad.react=gameTime+.24;m.springReady=gameTime+1.6;m.springUntil=gameTime+.62;
        m.springAngle=pad.angle;
        if(m===dog)soundEffect('found');
      }
    }
    if(m.springUntil>gameTime){
      const impulse=smooth(0,.62,m.springUntil-gameTime)*6.0;
      x+=Math.sin(m.springAngle)*impulse;z+=Math.cos(m.springAngle)*impulse;
    }
  }
  for(const lane of paperLanes){
    const gap=Math.hypot((m.x-lane.x)/lane.rx,(m.z-lane.z)/lane.rz);
    if(gap<1&&paperGust(lane))z+=lane.dir*(1-smooth(.70,1.0,gap))*(m===dog?2.45:3.40);
  }
  if(m.type==='sheep'){
    for(const beacon of fieldBeacons){
      if(beacon.kind!=='chime'||beacon.sounding<=gameTime)continue;
      const dx=beacon.x-m.x,dz=beacon.z-m.z,d=Math.hypot(dx,dz);
      if(d<3.2||d>27||!travelClear(m,beacon,.25))continue;
      const pull=mix(.3,2.4,1-smooth(8,27,d));
      x+=dx/d*pull;z+=dz/d*pull;
    }
  }
  return [x,z];
}
function dressFantasySheep(m,style,index){
  if(m.type!=='sheep'||!m.actor)return;
  if(style==='toy'){
    const fleeces=['#edbd8a','#efd0b1','#c4d3ae','#dec5ce'];
    m.fleece=m.distantWool=paint(fleeces[index%4]);
    const tag=mesh(m.actor,'stone','#a76952',.05,.78,.62,.22,.13,.091);
    tag.rotation.y=-.12;
    for(const side of [-1,1]){
      const button=mesh(m.actor,'cyl','#ae7c59',side*.47,.88,.04,.118,.043,.118);
      button.rotation.z=Math.PI*.5;
    }
  }
  if(style==='angel'){
    m.fantasyWings=[-1,1].map(side=>{
      const wing=group(m.actor,side*.35,1.02,-.08);
      for(let i=0;i<5;i++){
        const feather=mesh(wing,'lobe',i%2===0?'#fff5df':'#eadfed',side*(.13+i*.074),.095+i*.081,-.12-i*.066,
          .095+i*.009,.046,.255+i*.025);
        feather.rotation.y=-side*(.28+i*.15);feather.rotation.z=side*.51;
      }
      return wing;
    });
  }
}
function animateFantasySheep(m,time){
  if(!m.fantasyWings||prefersStill)return;
  m.fantasyWings.forEach((wing,index)=>wing.rotation.z=(index?1:-1)*(.13+.12*Math.sin(time*(2+m.speed*.26)+m.phase)));
}
function smallSceneObject(kind,x,z,index){
  const y=groundY(x,z),bucket=group(decor,x,y,z),paintBox=(t,a,b,c,d,e,f)=>mesh(bucket,'box',t,a,b,c,d,e,f);
  if(kind==='blocks'){
    const shades=['#c68369','#78918b','#d5a862','#8698a6','#a18cac'];
    for(let i=0;i<4;i++){
      const size=2.8+random()*3.2,px=(i%2)*2.5,pz=Math.floor(i*.5)*2.4;
      const block=paintBox(shades[(index+i)%shades.length],px,size*.45,pz,size,size*.90,size*.89);
      block.rotation.y=(random()-.5)*.51;
      mesh(bucket,'cyl','#ebca97',px,size*.91,pz,size*.22,.25,size*.22);
      obstacle(x+px,z+pz,size*.42,size);
    }
  }else if(kind==='train'){
    const vehicle=group(bucket);
    mesh(vehicle,'box','#876251',0,.88,0,5.4,.51,2.45);
    mesh(vehicle,'box','#a66755',-1.11,2,0,2.05,2.08,2.1);
    mesh(vehicle,'box','#c49662',-1.12,3.10,0,2.38,.29,2.36);
    const boiler=mesh(vehicle,'cyl','#688f87',.90,1.55,0,.85,2.85,.85);
    boiler.rotation.z=Math.PI*.5;
    mesh(vehicle,'cyl','#a56a53',1.73,2.44,0,.34,1.23,.34);
    for(const tx of [-1.77,1.4])for(const side of [-1,1]){
      const wheel=mesh(vehicle,'cyl','#554640',tx,.65,side*1.08,.64,.26,.64);
      wheel.rotation.x=Math.PI*.5;
      const hub=mesh(vehicle,'cyl','#d8bc82',tx,.65,side*1.24,.23,.09,.23);
      hub.rotation.x=Math.PI*.5;
    }
    obstacle(x,z,2.0,3.4);
  }else if(kind==='arch'){
    for(const px of [-2.7,2.7]){
      mesh(bucket,'cyl','#d1c3ba',px,2.0,0,.28,3.96,.28);
      mesh(bucket,'stone','#b7a89d',px,.25,0,.63,.36,.51);
      obstacle(x+px,z,.36,4.0);
    }
    for(let i=0;i<=10;i++){
      const a=i/10*Math.PI,stone=mesh(bucket,'stone','#e1d2c3',2.7*Math.cos(a),3.94+2.7*Math.sin(a),0,.41,.42,.46);
      stone.rotation.z=a;
    }
  }else if(kind==='origami'){
    for(let i=0;i<4;i++){
      const layer=mesh(bucket,'taper',['#c3a78a','#e1c497','#a6b69b','#ad9494'][(i+index)%4],i*.73,1.35+i*.21,Math.sin(i*.89)*2,
        2.4-i*.38,2.8+i*.38,2.28-i*.25);
      layer.rotation.z=(i-1.5)*.19;layer.rotation.y=i*.91;
    }
    obstacle(x,z,1.21,3.3);
    const rotor=group(props,x+1.5,y+4.1,z+.10);
    for(let i=0;i<4;i++){
      const leaf=group(rotor);leaf.rotation.z=i*TAU*.25;
      mesh(leaf,'box',i%2===0?'#e1ba76':'#b3878c',.16,.65,0,.48,1.19,.07).rotation.z=.34;
    }
    campaignRotors.push(rotor);
  }else if(kind==='observatory'){
    mesh(bucket,'cyl','#817b88',0,2.75,0,2.52,5.37,2.52);
    mesh(bucket,'ball','#b1a7be',0,4.91,0,2.59,2.13,2.59);
    for(let i=0;i<6;i++){
      const theta=i*TAU/6;
      mesh(bucket,'box','#ddba78',Math.sin(theta)*2.49,3.15,Math.cos(theta)*2.49,.22,.57,.18).rotation.y=theta;
    }
    const spyglass=mesh(bucket,'taper','#b5a299',0,6.42,.27,.31,3.5,.31);spyglass.rotation.x=.88;
    obstacle(x,z,2.49,7.2);
  }
}
function makeNightSky(config){
  const list=[],rng=seeded(config.terrainSeed||config.seed);
  for(let i=0;i<195;i++){
    const a=TAU*rng(),y=.18+rng()*.82,r=Math.sqrt(1-y*y)*184;
    list.push(Math.sin(a)*r,y*184,Math.cos(a)*r);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(list,3));
  props.add(new THREE.Points(geometry,new THREE.PointsMaterial({color:'#f9edcb',size:.59,opacity:.79,transparent:true,sizeAttenuation:true,fog:false})));
}
function decorateFantasyWorld(config){
  const [hx,hz]=config.half,theme=config.biome;
  if(!['toy','angel','paper','night'].includes(theme))return;
  const placements=[[-.61,-.58],[-.34,.66],[.03,-.68],[.35,.59],[.64,-.63]];
  const kinds={toy:['blocks','train'],angel:['arch'],paper:['origami'],night:['observatory']};
  placements.forEach(([a,b],i)=>{
    const x=a*hx,z=b*hz;
    if(!nearTrail(x,z,5)&&!blocked(x,z,2.55))smallSceneObject(kinds[theme][i%kinds[theme].length],x,z,i);
  });
  if(theme==='toy'){
    const [houseX,houseZ]=config.house;
    const barn=group(decor,houseX,groundY(houseX,houseZ),houseZ);
    mesh(barn,'box','#b88167',0,1.50,0,4.2,3.0,3.2);
    mesh(barn,'box','#e0b583',0,1.18,1.63,1.35,2.25,.12);
    mesh(barn,'box','#815a4e',0,1.11,1.71,1.06,2.15,.10);
    mesh(barn,'box','#d6ae88',0,2.5,1.68,.64,.48,.12);
    for(const side of [-1,1]){
      mesh(barn,'box','#a9665a',side*1.12,3.56,0,2.78,.26,3.66).rotation.z=-side*.46;
      mesh(barn,'box','#e9c78e',side*1.88,.8,1.7,.16,1.7,.18);
    }
    obstacle(houseX,houseZ,1.59,3.5);
    for(const side of [-1,1]){
      const x=side*(hx+3),z=side*(hz+3);
      mesh(props,'box',side===1?'#d5a58e':'#d1b4a1',x,13,0,.45,27,hz*2+9).castShadow=false;
      mesh(props,'box',side===1?'#d6b49b':'#c6b8a2',0,13,z,hx*2+8,27,.45).castShadow=false;
      mesh(decor,'box','#e0c3a8',0,1.9,z,hx*2+8,.42,.7);
    }
    for(let i=0;i<12;i++){
      const x=i*7-38,z=-hz-2;
      if(i%2!==0)mesh(decor,'box','#e8c693',x,13,z,6.5,11,.48);
    }
    const window=group(decor,hx+2.6,15,hz*.18);
    mesh(window,'box','#a37d64',0,0,0,.7,17,30);
    mesh(window,'box',new THREE.MeshBasicMaterial({color:'#fff0c2'}),-.39,0,0,.13,15.2,28.2);
    for(const z of [-7,7])mesh(window,'box','#d5ac84',-.57,0,z,.23,16.3,.55);
    mesh(window,'box','#d5ac84',-.59,-.3,0,.28,.59,29.3);
    mesh(window,'box','#dec1a1',-.89,-8.25,0,2.1,.72,31.0);
    const bed=group(decor,hx+1,0,-hz*.67);
    mesh(bed,'box','#947e73',-.52,4.7,0,4.8,1.3,25.9);
    mesh(bed,'box','#bd8b7b',-1.11,5.98,0,5.7,1.32,25.5);
    mesh(bed,'box','#e0c3a9',-1.45,7,-8.54,5.5,.9,6.1);
    mesh(bed,'box','#a78a7b',-.27,5.0,-13.6,5.6,10.5,1.1);
    for(const z of [-11.4,11.4])mesh(bed,'box','#947e73',-2.2,2.3,z,.9,4.6,.88);
  }else if(theme==='angel'){
    for(let i=0;i<30;i++){
      const angle=i*TAU/30,dx=Math.sin(angle),dz=Math.cos(angle);
      const edge=1/Math.max(Math.abs(dx),Math.abs(dz));
      const x=dx*edge*(hx+28),z=dz*edge*(hz+28);
      mesh(decor,'ball',i%2?'#e4dedf':'#e3e5e9',x,-3+random()*4,z,
        9+random()*11,3.8+random()*2,9+random()*9);
      mesh(decor,'ball','#ece8ed',x*1.35,1+random()*4,z*1.35,
        11+random()*15,4+random()*3,9+random()*12);
    }
  }else if(theme==='paper'){
    for(let i=0;i<14;i++){
      const angle=i*TAU/14,x=Math.sin(angle)*(hx+13),z=Math.cos(angle)*(hz+13);
      const cliff=mesh(decor,'cone',['#b89f8b','#b8bd94','#d5ba95','#ba9e97'][i%4],x,-1,z,9+random()*9,16+random()*20,9+random()*8);
      cliff.rotation.y=i*.72;
    }
  }else makeNightSky(config);
}
function buildRules(config){
  makeFieldDevices(config);
  buildDangers(config);
  buildFieldEvents(config);
  bridgeChannel(config);
  buildCave(config);
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
  const routeLocked=type==='sheep'&&Boolean(config.relay||config.requireFord||config.requiresLights);
  if(!routeLocked&&!config.locks?.includes(type))return;
  pen.routeLocked=routeLocked;
  const block={x1:pen.left,z1:pen.z-pen.opening/2,x2:pen.left,z2:pen.z+pen.opening/2,height:1.42,thickness:.13,enabled:true};
  pen.gate.rotation.y=Math.PI*.5;
  pen.block=block;
  colliders.push(block);
  if(!config.bigFlock&&!routeLocked)signboard(pen.left-.68,pen.z+pen.opening*.5+.85,'Portillon',null,-.74);
}
function nearestInteraction(){
  if(!dog)return null;
  const targets=[
    ...Object.values(pens).filter(p=>p.block?.enabled&&!p.routeLocked&&!gathering).map(p=>({x:p.left,z:p.z,range:4.9,kind:'gate',item:p})),
    ...clues.filter(c=>!c.touched).map(c=>({x:c.x,z:c.z,range:4.3,kind:'track',item:c})),
    ...(!fordCrossing?.block.enabled?[]:fordCrossing.levers.map(lever=>({...lever,range:4.0,kind:'ford'}))),
    ...reachableBeacons()
  ];
  return targets.map(t=>({...t,dist:distance(dog,t)})).filter(t=>t.dist<t.range).sort((a,b)=>a.dist-b.dist)[0]||null;
}
function updateInteraction(){
  interactionTarget=nearestInteraction();
  const b=$('interact');
  b.hidden=!interactionTarget;
  if(interactionTarget){
    const label=Object.hasOwn(newFieldKinds,interactionTarget.kind)?newFieldKinds[interactionTarget.kind]:interactionTarget.kind==='ford'?'Ouvrir la vanne':interactionTarget.kind==='gate'?'Ouvrir':'Examiner';
    if(b.textContent!==label)b.textContent=label;
  }
}
function interact(){
  if(playPaused())return false;
  const target=nearestInteraction();
  if(!target)return false;
  const item=target.item;
  if(Object.hasOwn(newFieldKinds,target.kind)){
    useFieldBeacon(item);
  }else if(target.kind==='ford'){
    openFord();
  }else if(target.kind==='gate'){
    item.block.enabled=false;
    grid=createGrid(activeMission());
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
    setNote('Le repère te montre où se trouve la brebis. Contourne-la pour la guider.');
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


function bark(){
  if(playPaused()||gameTime-barkTime<.94)return;
  barkTime=gameTime;barkOrigin=point(dog.x,dog.z);runStats.barks++;
  soundEffect('bark');
  repelWolves();
  for(const m of animals){
    if(m.safe||m.escape)continue;
    const d=distance(dog,m);
    if(d<13.5)m.startle=gameTime+.95;
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
  m.safe=true;m.vx=m.vz=0;m.react=0;
  const pen=pens[m.type];
  const i=animals.indexOf(m);
  m.home=activeMission().bigFlock?flockStall(pen,i):point(pen.left+4.1+(i%4)*2.15,clamp(pen.z+Math.sin(i*2.4)*5.5,pen.back+1.4,pen.front-1.4));
  renderCounts();
  const count=animals.filter(a=>a.safe).length;
  if(!activeMission().bigFlock||count%5===0||count===animals.length)soundEffect('score');
  if(activeMission().gust&&!storm&&animals.filter(a=>a.safe&&a.type==='sheep').length===2){
    escapedMutton();return;
  }
  if(activeMission().bigFlock){
    if(count%5===0||count===animals.length)showMessage(count+' / '+animals.length+' moutons à l’abri');
  }
  if(count===animals.length)finish();
}
function flockIntent(m,dt){
  const dx=m.x-dog.x,dz=m.z-dog.z,d=Math.hypot(dx,dz),isDuck=m.type==='duck';
  const trait=species[m.type];
  const barkDX=m.x-barkOrigin.x,barkDZ=m.z-barkOrigin.z,barkDistance=Math.hypot(barkDX,barkDZ);
  const barking=m.startle>gameTime?Math.max(0,1-(gameTime-barkTime)/.96):0;
  const flight=smooth(5.5,12.4,dog.speed);
  const radius=trait.flight+flight*1.65;
  const friendly=m.valleyLamb&&lambFollowing(m,d);
  const pressure=(1-smooth(2.5,radius,d))*(friendly?.25:1);
  const barkPressure=barking*(1-smooth(4,13.5,barkDistance));
  const crowd=m.mass!==null;
  const panic=clamp((1-smooth(1.15,3.3,d))*(.61+.37*flight)+barkPressure*.54,0,1)*(crowd?.79:1);
  m.react=Math.max(pressure,barkPressure);
  m.stress=mix(m.stress,panic,1-Math.exp(-dt*(panic>m.stress?6.1:2.0)));
  let near=0,cx=0,cz=0,vx=0,vz=0,sx=0,sz=0;
  for(const other of animals){
    if(other===m||other.safe||other.escape||other.type!==m.type)continue;
    const ax=other.x-m.x,az=other.z-m.z,ad=Math.hypot(ax,az);
    const neighbourhood=crowd&&m.pack!==other.pack?5.4:trait.neighbours;
    if(ad<neighbourhood){
      const weight=1-.56*ad/neighbourhood;
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
  const trot=Math.pow(pressure,.83)*trait.trot*(crowd?.61:1);
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
  if(crowd&&m.pack?.drive){
    const [pushX,pushZ]=largeFlockInfluence(m,pen);
    sx+=pushX;sz+=pushZ;
  }
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
  if(whistleGroup?.members.has(m)&&gameTime<whistleGroup.until){
    const tx=whistleGroup.x-m.x,tz=whistleGroup.z-m.z;
    const remaining=whistleGroup.until-gameTime;
    const pull=Math.min(1.95,Math.max(0,Math.hypot(tx,tz)-1.1)*.49)*Math.min(1,remaining*1.8)*(1-m.stress*.61);
    const d=Math.max(.12,Math.hypot(tx,tz));
    sx+=tx/d*pull;sz+=tz/d*pull;
  }
  if(m.valleyLamb||m.wolfAlarm>gameTime){
    const [ex,ez]=animalEncounterInfluence(m,dt);
    sx+=ex;sz+=ez;
  }
  if(fieldDangers.length){
    const [ex,ez]=repulsionFromHeat(m);
    sx+=ex;sz+=ez;
  }
  if(fieldBeacons.length||paperLanes.length||springPlates.length){
    const [ex,ez]=fantasyForce(m);
    sx+=ex;sz+=ez;
  }
  if(shepherdOrder)[sx,sz]=orderMotion(m,sx,sz);
  const dest=Math.hypot(sx,sz),limit=Math.min(1,trait.max/Math.max(.01,dest));
  m.desiredX=sx*limit;m.desiredZ=sz*limit;
}
const avoidAngles=[0,.30,-.30,.65,-.65,1.01,-1.01,1.43,-1.43,1.79,-1.79];
function constrainedAnimalStep(m,dt){
  const pace=Math.hypot(m.vx,m.vz)*(m.zoneDrag??1);
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
  if(gathering)guideLargeFlock();
  paintFieldDevices(dt);updateFieldEvents(dt);
  if(missionFailed)return;
  for(const m of animals){
    if(!m.safe&&!m.escape&&!m.grabbed)flockIntent(m,dt);
  }
  for(const m of animals){
    if(m.grabbed)continue;
    if(m.escape){
      if(!followPath(m,m.escape,5.72,dt)){m.escape=null;m.vx=m.vz=0;}
      continue;
    }
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
  const near=remaining.filter(a=>!a.escape).sort((a,b)=>distance(dog,a)-distance(dog,b))[0];
  const remote=remaining.slice().sort((a,b)=>distance(dog,a)-distance(dog,b))[0];
  if(relayPoint()){
    const stop=relayPoint();
    hintObject={x:stop.x,z:stop.z,height:1.75,label:stop.name};
    setNote('Fais passer chaque brebis dans la halte.');
  }else if(fordCrossing?.block.enabled&&config.requireFord){
    const lever=fordCrossing.levers.slice().sort((a,b)=>distance(a,dog)-distance(b,dog))[0];
    hintObject={x:lever.x,z:lever.z,height:1.65,label:'Vanne'};
    setNote('Approche du levier pour ouvrir la vanne.');
  }else if(gathering){
    hintObject=gatheringHint();
  }else if(clue){
    hintObject={...clue,height:1.61,label:'Empreintes'};
    setNote('Approche et touche Examiner pour suivre la piste.');
  }else if(config.stream&&remaining.some(m=>!m.crossed)){
    const s=config.stream;
    const span=bridgeCrossings(s).slice().sort((a,b)=>Math.abs(a.z-dog.z)-Math.abs(b.z-dog.z))[0];
    hintObject={x:s.x,z:span.z,height:1.81,label:'Le pont'};
    setNote('Place le groupe dans l’axe du pont avant de le pousser.');
  }else if(near&&distance(dog,near)<17){
    const pen=pens[near.type];
    hintObject={x:pen.left,z:pen.z,height:2.65,label:pen.block?.enabled?'Portillon':pen.label};
    setNote(pen.block?.enabled?'Approche de la poignée et ouvre le portillon.':'Garde les animaux entre Nuage et l’ouverture.');
  }else if(remote){
    hintObject={get x(){return remote.x;},get z(){return remote.z;},height:2.14,label:species[remote.type].title};
    setNote('Suis le repère et approche au pas.');
  }
  hintUntil=gameTime+18;
  updateHint();
}
function renderCounts(){
  const target=$('counts');
  const result=Object.entries(pens).map(([type,pen])=>{
    const relevant=animals.filter(a=>a.type===type);
    const n=relevant.filter(a=>a.safe).length;
    return '<div class="counter '+type+'"><canvas data-icon="'+type+'" width="48" height="48" aria-hidden="true"></canvas><span class="counter-name">'+pen.title+'</span><span class="counter-value">'+n+'/'+relevant.length+'</span></div>';
  });

  const html=result.join('');
  if(target.dataset.counts===html)return;
  target.dataset.counts=html;target.innerHTML=html;
  target.querySelectorAll('canvas').forEach(c=>paintIcon(c,c.dataset.icon));
}

let fieldMapLocal=false;
const mapPalettes=[
  ['#ccd3ac','#9fad82','#70916b'],['#ddd0a6','#bba373','#9a9d67'],
  ['#c5c6a9','#a8a78d','#829582'],['#b9c9ae','#8fa389','#66896f'],
  ['#d4d7ae','#abc2a0','#86a28a'],['#e1e6e1','#bbcbc9','#879fa1'],
  ['#bcc9a4','#8f9b74','#62816a'],['#c9d6ad','#9bb9a4','#759e83'],
  ['#e5d1a7','#c6ab7f','#92936b'],['#c4d9da','#a0babf','#7d9da3'],['#c5b29d','#a48f87','#806d69'],
  ['#decca4','#b69d79','#879b83'],['#d7dcd4','#a2b3be','#8093ad'],
  ['#dfc99e','#b9ac8c','#9c9370'],['#bcbad0','#8c8fad','#76758e']
];
function drawMiniMap(canvas=$('mini-map')){
  const ctx=canvas.getContext('2d'),large=canvas.id==='flock-map';
  const config=activeMission(),[hx,hz]=config.half;
  const local=large&&fieldMapLocal;
  const scale=Math.min(206/(hx*2),136/(hz*2))*(local?2.45:1);
  const x=n=>110+(n-(local?dog.x:0))*scale;
  const z=n=>76+(n-(local?dog.z:0))*scale;
  const [paper,relief,wood]=mapPalettes[config.region];
  const dot=(px,pz,r,fill,outline)=>{
    ctx.beginPath();ctx.arc(px,pz,r,0,TAU);ctx.fillStyle=fill;ctx.fill();
    if(outline){ctx.strokeStyle=outline;ctx.lineWidth=.65;ctx.stroke();}
  };
  ctx.save();
  ctx.scale(canvas.width/220,canvas.height/152);
  ctx.fillStyle='#efe9d4';ctx.fillRect(0,0,220,152);
  ctx.save();
  ctx.beginPath();ctx.rect(x(-hx),z(-hz),hx*2*scale,hz*2*scale);ctx.clip();
  ctx.fillStyle=paper;ctx.fillRect(0,0,220,152);
  for(const [px,pz,height,rx,rz] of config.hills){
    if(height<1.6)continue;
    ctx.strokeStyle=relief;ctx.lineWidth=.55;
    ctx.globalAlpha=.60;
    for(const fraction of [.45,.65,.90,1.18]){
      ctx.beginPath();ctx.ellipse(x(px),z(pz),rx*scale*fraction,rz*scale*fraction,0,0,TAU);ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  ctx.globalAlpha=.54;
  for(const [px,pz,rx,rz] of config.groves){
    ctx.fillStyle=wood;ctx.beginPath();ctx.ellipse(x(px),z(pz),rx*scale,rz*scale,0,0,TAU);ctx.fill();
  }
  ctx.globalAlpha=1;
  for(const [px,pz,rx,rz] of config.ponds){
    ctx.fillStyle='#87b1ae';ctx.beginPath();ctx.ellipse(x(px),z(pz),rx*scale,rz*scale,0,0,TAU);ctx.fill();
  }
  for(const [px,pz,rx,rz] of config.mud||[]){
    ctx.fillStyle='#ab8d695e';ctx.beginPath();ctx.ellipse(x(px),z(pz),rx*scale,rz*scale,0,0,TAU);ctx.fill();
  }
  for(const [px,pz,rx,rz] of config.ice||[]){
    ctx.fillStyle='#9ac2ce99';ctx.beginPath();ctx.ellipse(x(px),z(pz),rx*scale,rz*scale,0,0,TAU);ctx.fill();
  }
  ctx.lineCap=ctx.lineJoin='round';
  ctx.strokeStyle='#ac9066';ctx.lineWidth=large?1.41:2.6;
  for(const trail of config.trails){polyline(ctx,trail,x,z);ctx.stroke();}
  ctx.strokeStyle='#f2dfb5';ctx.lineWidth=large?.87:1.55;
  for(const trail of config.trails){polyline(ctx,trail,x,z);ctx.stroke();}
  if(large){
    ctx.strokeStyle='#877e65';ctx.lineWidth=.8;
    for(const wall of config.walls){polyline(ctx,wall,x,z);ctx.stroke();}
  }
  if(config.stream){
    const s=config.stream,left=x(s.x-s.width*.5);
    ctx.fillStyle='#77a5a3';ctx.fillRect(left,z(-hz),s.width*scale,hz*2*scale);
    for(const span of bridgeCrossings(s)){
      ctx.fillStyle=fordCrossing?.span===span&&fordCrossing.block.enabled?'#795949':'#ecd1a3';
      ctx.fillRect(left-.8,z(span.z-span.gap*.5),s.width*scale+1.6,span.gap*scale);
    }
  }
  if(config.cave){
    const {x:cx,z:cz,length,width}=config.cave;
    ctx.fillStyle='#8c7e6a';ctx.fillRect(x(cx-length*.5),z(cz-width*.5),length*scale,width*scale);
    ctx.strokeStyle='#e7d4a9';ctx.lineWidth=.8;
    polyline(ctx,[[cx-length*.5,cz],[cx+length*.5,cz]],x,z);ctx.stroke();
  }
  ctx.fillStyle='#ab705a';
  ctx.fillRect(x(config.house[0])-2.4,z(config.house[1])-1.9,4.8,3.8);
  for(const [type,p] of Object.entries(pens)){
    ctx.fillStyle={sheep:'#e5b97c',duck:'#abd1ce',goat:'#ceaa88',pig:'#d6aaa2'}[type];
    ctx.strokeStyle='#765e46';ctx.lineWidth=large?.9:1.7;
    const rect=[x(p.left),z(p.back),(p.right-p.left)*scale,(p.front-p.back)*scale];
    ctx.fillRect(...rect);ctx.strokeRect(...rect);
    ctx.strokeStyle=p.block?.enabled?'#a76042':'#fff3d4';
    ctx.beginPath();ctx.moveTo(x(p.left),z(p.z-p.opening*.5));ctx.lineTo(x(p.left),z(p.z+p.opening*.5));ctx.stroke();
  }
  for(const zone of fieldDangers){
    if(zone.kind==='flood'&&zone.state==='quiet')continue;
    ctx.fillStyle=zone.kind==='cloud'?'#f1faf3ab':zone.kind==='flood'?'#618caaa8':
      zone.state==='active'?'#c16b4dc4':zone.state==='warning'?'#edbe78c9':'#a386748a';
    ctx.beginPath();ctx.ellipse(x(zone.x),z(zone.z),zone.rx*scale,zone.rz*scale,0,0,TAU);ctx.fill();
    if(large&&zone.state==='warning'){ctx.strokeStyle='#733f37';ctx.lineWidth=.72;ctx.stroke();}
  }
  for(const lane of paperLanes){
    ctx.fillStyle=paperGust(lane)?'#bd795e99':'#d69f6040';
    ctx.beginPath();ctx.ellipse(x(lane.x),z(lane.z),lane.rx*scale,lane.rz*scale,0,0,TAU);ctx.fill();
  }
  for(const pad of springPlates)dot(x(pad.x),z(pad.z),large?2.65:3.5,'#ac7551','#fff1ce');
  for(const beacon of fieldBeacons){
    const color=beacon.kind==='lamp'?(beacon.lit?'#f2cd7a':'#5f5272'):beacon.kind==='mill'?'#ad795f':'#a48346';
    dot(x(beacon.x),z(beacon.z),large?2.65:3.5,color,'#fff1ce');
  }
  const palette={sheep:'#fff7dd',duck:'#f6c55c',goat:'#b67a50',pig:'#e4aeab'};
  for(const m of animals){
    const radius=config.bigFlock?(large?.86:1.13):large?1.55:2.35;
    dot(x(m.x),z(m.z),radius,m.grabbed?'#b84235':m.safe?'#477e53':palette[m.type],config.bigFlock?null:'#544c40');
  }
  if(large&&config.bigFlock)drawFlockCounts(ctx,x,z);
  for(const clue of clues)if(!clue.touched)dot(x(clue.x),z(clue.z),large?2.6:4,'#a96a37','#fdf0cd');
  for(const wolf of wolves){
    if(wolf.gone)continue;
    dot(x(wolf.x),z(wolf.z),large?2.85:4.15,wolf.mode==='attack'?'#a23c33':wolf.mode==='retreat'?'#806f62':'#98452e','#fff0d6');
  }
  if(fordCrossing){
    const {stream,span,block}=fordCrossing;
    dot(x(stream.x),z(span.z),large?2.25:3.1,block.enabled?'#a76d37':'#407c55','#fff0d6');
  }
  if(relayPoint()){
    const stop=relayPoint(),px=x(stop.x),pz=z(stop.z);
    ctx.strokeStyle='#8f5628';ctx.lineWidth=1.15;
    ctx.beginPath();ctx.arc(px,pz,stop.radius*scale,0,TAU);ctx.stroke();
    dot(px,pz,large?2.0:2.6,'#ac7436','#fff0d6');
  }
  if(hintObject&&gameTime<hintUntil){
    ctx.strokeStyle='#9f5535';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.arc(x(hintObject.x),z(hintObject.z),6.2,0,TAU);ctx.stroke();
  }
  ctx.restore();
  const a=dog.heading,s=large?5.5:8,px=x(dog.x),pz=z(dog.z);
  ctx.beginPath();ctx.moveTo(px+Math.sin(a)*s,pz+Math.cos(a)*s);
  ctx.lineTo(px+Math.sin(a+2.42)*s*.73,pz+Math.cos(a+2.42)*s*.73);
  ctx.lineTo(px+Math.sin(a-2.42)*s*.73,pz+Math.cos(a-2.42)*s*.73);
  ctx.closePath();ctx.fillStyle='#224b39';ctx.strokeStyle='#fff4d9';ctx.lineWidth=large?1.2:1.7;
  ctx.stroke();ctx.fill();
  ctx.fillStyle='#294a3a';ctx.textAlign='center';ctx.font=(large?'700 8px':'800 16px')+' ui-sans-serif, sans-serif';
  ctx.fillText('N',large?12:16,large?12:21);
  if(large){
    const length=20*scale;
    ctx.strokeStyle='#294a3a';ctx.lineWidth=.65;
    ctx.beginPath();ctx.moveTo(12,143);ctx.lineTo(12+length,143);ctx.stroke();
    ctx.font='600 5px ui-sans-serif, sans-serif';ctx.fillText('20 m',12+length*.5,149);
  }
  ctx.restore();
}

function fieldSituation(){
  const config=activeMission(),notes=[];
  if(gathering){
    if(gathering.stage==='search')notes.push('Groupes repérés '+gathering.spotted.size+'/'+gathering.total);
    if(gathering.stage==='gather')notes.push('Réunis '+gathering.largest+'/'+animals.length);
    if(gathering.stage==='return')notes.push('Troupeau réuni');
  }
  if(clues.length)notes.push('Pistes '+runStats.clues+'/'+clues.length);
  if(wolves.some(wolf=>!wolf.gone))notes.push('Loup'+(wolves.length>1?'s':'')+' en brun');
  if(fieldDangers.some(zone=>zone.kind==='cloud'))notes.push('Nuages en blanc bleuté');
  if(fieldDangers.some(fieryDanger))notes.push('Zones chaudes en orange');
  if(floodIsRising())notes.push('Crue au sud · Pont nord ouvert');
  if(wolves.some(wolf=>wolf.mode==='attack'))notes.push('Brebis à sauver en rouge');
  if(fordCrossing)notes.push(fordCrossing.block.enabled?'Vanne fermée':'Vanne ouverte');
  if(springPlates.length)notes.push('Ressorts en orange');
  const lamps=fieldBeacons.filter(beacon=>beacon.kind==='lamp');
  if(lamps.length)notes.push('Lanternes '+lamps.filter(beacon=>beacon.lit).length+'/'+lamps.length);
  if(fieldBeacons.some(beacon=>beacon.kind==='chime'))notes.push('Carillons en ocre');
  if(paperLanes.length)notes.push(gameTime<paperStoppedUntil?'Vent coupé':'Rafales en orange');
  const stop=relayPoint();
  if(stop){
    const checked=animals.filter(m=>m.relayStage>relayIndex).length;
    notes.push(stop.name+' · '+checked+'/'+animals.length);
  }else if(config.relay)notes.push('Haltes terminées');
  return notes.join(' · ');
}

function openFieldMap(){
  if(playPaused())return;
  fieldMapLocal=false;
  $('map-focus').setAttribute('aria-pressed','false');
  $('map-focus').textContent='Autour du chien';
  drawMiniMap($('flock-map'));
  const ready=animals.filter(animal=>animal.safe).length;
  $('flock-map-caption').textContent=ready+' sur '+animals.length+' à l’abri';
  const status=fieldSituation();
  $('map-encounters').textContent=status;
  $('map-encounters').hidden=!status;
  openModal($('flock-map-dialog'),$('open-flock-map'));
}
function showMessage(message,duration=2500){
  const node=$('toast');
  clearTimeout(toastId);
  node.textContent=dogText(message);node.hidden=false;
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
    bell:[[831,755,0,.18,'sine',.048],[1380,1360,.028,.12,'sine',.028]],
    wind:[[180,45,0,.48,'triangle',.065],[103,54,.12,.32,'sine',.075]],
    warning:[[124,90,0,.53,'triangle',.13],[178,112,.2,.39,'sine',.10]],
    whistle:[[1290,1540,0,.17,'sine',.08],[1210,970,.18,.22,'sine',.06]]
  };
  for(const [hz,end,delay,length,shape,volume] of melodies[name]){
    const oscillator=audio.createOscillator(), gain=audio.createGain(),start=t+delay;
    oscillator.type=shape;
    oscillator.frequency.setValueAtTime(hz,start);
    oscillator.frequency.exponentialRampToValueAtTime(end,start+length);
    gain.gain.setValueAtTime(.0001,start);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*profile.volume),start+.018);
    gain.gain.exponentialRampToValueAtTime(.0001,start+length);
    oscillator.connect(gain);gain.connect(audio.destination);
    oscillator.start(start);oscillator.stop(start+length+.02);
  }
}
function openModal(dialog,trigger){
  stopInput();openDialogTrigger=trigger;
  if(!dialog.open)dialog.showModal();
}

const gearItems={bare:'Nu',rust:'Foulard terracotta',sage:'Foulard sauge',navy:'Foulard indigo',berry:'Foulard mûre',
  collar:'Collier en cuir',moss:'Collier mousse',satchel:'Sacoche du berger',
  plaid:'Foulard à carreaux',bell:'Clochette de cuivre',harness:'Harnais d’exploration',raincoat:'Imperméable ciré'};
const wardrobeModes=['identite','robe','equipement'];
let wardrobeMode='identite';
function cleanDogName(value){
  return Array.from(String(value??'').replace(/[\x00-\x1F\x7F]/g,' ').replace(/\s+/g,' ').trim()).slice(0,18).join('')||'Nuage';
}
function dogText(copy){return copy?.replace(/Nuage/g,profile.dogName)??'';}

function syncName(){
  const name=profile.dogName;
  $('dog-name-display').textContent=name;
  $('dog-breed-display').textContent=(activeDogAsset?.asset||sculptedDog.breeds[profile.breed]).label;
  $('farm-hero').setAttribute('aria-label','Aperçu 3D de '+name);
  $('rotate-dog').setAttribute('aria-label','Tourner '+name);
  $('start-mission').textContent='Partir avec '+name;
}

const breedCardNames={
  'Berger_Australien':'Berger australien','Berger_des_Shetland':'Shetland',
  'berger-malinois':'Malinois','golden-retriever':'Golden retriever','labrador-retriever':'Labrador',
  'husky-siberien':'Husky sibérien',teckel:'Teckel','corgi-pembroke':'Corgi Pembroke',caniche:'Grand caniche',greyhound:'Greyhound'
};
let activeCoatCategory='naturel',galleryCoatKey='';
const breedCards=new Map(),coatCards=new Map();

function wardrobePortrait(data){
  const photo=document.createElement('span');
  photo.className='dog-thumbnail';photo.setAttribute('aria-hidden','true');
  if(!data)return photo;
  const source=document.getElementById(data.file);
  const url=source?'data:image/jpeg;base64,'+source.textContent.trim():'./'+data.file;
  if(data.region){
    const [x,y,w,h]=data.region,width=2480,height=1428;
    photo.style.backgroundImage='url("'+url+'")';
    photo.style.backgroundSize=width/w*100+'% '+height/h*100+'%';
    photo.style.backgroundPosition=x/(width-w)*100+'% '+y/(height-h)*100+'%';
  }else{
    const img=document.createElement('img');
    img.src=url;img.alt='';img.loading='lazy';img.decoding='async';
    photo.append(img);
  }
  return photo;
}
function addGalleryCard(host,label,name,media,action){
  const row=document.createElement('li'),button=document.createElement('button');
  button.type='button';button.className='dog-gallery-card';
  button.setAttribute('aria-label',name);
  const caption=document.createElement('span');
  caption.className='dog-gallery-caption';caption.textContent=label;
  if(host.id==='breed-gallery'){
    const lock=document.createElement('span');
    lock.className='race-lock-symbol';lock.setAttribute('aria-hidden','true');
    lock.innerHTML='<svg class="race-lock" viewBox="0 0 16 16"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 1 1 6 0v2"/></svg>';
    caption.append(lock);
  }
  button.append(wardrobePortrait(media),caption);
  button.onclick=action;row.append(button);host.append(row);
  return button;
}
function renderDogChoices(){
  const breed=sculptedDog.breeds[profile.breed],host=$('breed-gallery');
  if(!breedCards.size){
    const breeds=Object.values(sculptedDog.breeds).sort((a,b)=>{
      if(a.id===sculptedDog.default)return -1;
      if(b.id===sculptedDog.default)return 1;
      return (breedCardNames[a.id]||a.label).localeCompare(breedCardNames[b.id]||b.label,'fr');
    });
    for(const choice of breeds){
      breedCards.set(choice.id,addGalleryCard(host,breedCardNames[choice.id]||choice.label,choice.label,choice.thumbnail,()=>{
        if(!raceUnlocked(choice.id)){browseTrial(choice.id);return;}
        changeDogAppearance(choice.id,profile.breedCoats?.[choice.id]??choice.coats[0].id);
      }));
    }
  }
  for(const [id,button] of breedCards){
    const locked=!raceUnlocked(id),label=sculptedDog.breeds[id].label;
    button.dataset.locked=String(locked);
    button.setAttribute('aria-label',label+(locked?' · À débloquer':''));
    button.setAttribute('aria-pressed',String(id===breed.id));
  }
  const categories=breed.coats.some(coat=>coat.category==='fantaisie');
  $('coat-filters').hidden=!categories;
  $('natural-coats').setAttribute('aria-pressed',String(activeCoatCategory==='naturel'));
  $('fantasy-coats').setAttribute('aria-pressed',String(activeCoatCategory==='fantaisie'));
  const robeKey=breed.id+':'+(categories?activeCoatCategory:'toutes');
  if(galleryCoatKey!==robeKey){
    galleryCoatKey=robeKey;
    const robes=$('coat-gallery');
    robes.innerHTML='';coatCards.clear();
    for(const coat of breed.coats){
      if(categories&&coat.category!==activeCoatCategory)continue;
      coatCards.set(coat.id,addGalleryCard(robes,coat.label,coat.label,coat.thumbnail,()=>changeDogAppearance(breed.id,coat.id)));
    }
  }
  for(const [id,button] of coatCards)button.setAttribute('aria-pressed',String(id===profile.dogCoat));
  const shown=activeDogAsset?.asset??breed;
  $('dog-look-coat').textContent=coatFor(shown,shown===breed?profile.dogCoat:null).label;
  if(activeDogAsset&&shown!==breed&&!$('dog-model-feedback').textContent){
    $('dog-model-feedback').textContent='Reconnecte-toi pour recharger ton chien choisi.';
  }
}
function setCoatCategory(category){
  activeCoatCategory=category;
  renderDogChoices();
}
function dogLookLoading(breed,loading){
  for(const host of [$('breed-gallery'),$('coat-gallery')])host.setAttribute('aria-busy',String(loading));
  $('farm-hero').dataset.changing=String(loading);
  for(const [id,button] of breedCards){
    if(loading&&id===breed.id)button.dataset.loading='true';
    else delete button.dataset.loading;
  }
}
function toggleDogName(open){
  const form=$('dog-name-form'),trigger=$('edit-dog-name');
  form.hidden=!open;trigger.setAttribute('aria-expanded',String(open));
  if(open){
    $('dog-name').value=profile.dogName;
    $('dog-name').focus();$('dog-name').select?.();
  }else trigger.focus();
}

function wardrobeButton(name,value,selected){
  const button=document.createElement('button');
  button.type='button';button.className='wardrobe-option';
  button.dataset.variant=value;button.setAttribute('aria-pressed',String(selected));
  button.textContent=name;
  return button;
}
function selectWardrobe(mode){
  if(wardrobeMode!==mode)$('farm-scroll').scrollTop=0;
  wardrobeMode=mode;
  for(const panel of document.querySelectorAll('[data-wardrobe-panel]'))panel.hidden=panel.dataset.wardrobePanel!==mode;
  for(const button of document.querySelectorAll('[data-wardrobe-tab]'))button.setAttribute('aria-pressed',String(button.dataset.wardrobeTab===mode));
}
function renderWardrobe(){
  if(displayedTrial){
    displayedTrial=null;$('dog-trial-link').hidden=true;$('dog-model-feedback').textContent='';
  }
  const gearHost=$('gear-options');
  $('dog-name').value=profile.dogName;
  gearHost.innerHTML='';
  renderDogChoices();
  for(const [id,label] of Object.entries(gearItems)){
    if(!profile.owned.includes(id))continue;
    const button=wardrobeButton(id==='bare'?'Sans accessoire':label,id,profile.gear===id);
    button.onclick=()=>{
      equipItem(id);
      [...gearHost.querySelectorAll('button')].forEach(element=>element.setAttribute('aria-pressed',String(element===button)));
    };
    gearHost.append(button);
  }
  const count=profile.owned.filter(id=>id!=='bare'&&Object.hasOwn(gearItems,id)).length;
  $('wardrobe-stock').textContent=count+' accessoire'+(count>1?'s':'');
  selectWardrobe(wardrobeMode);
}
function equipItem(id){
  if(!Object.hasOwn(gearItems,id)||!profile.owned.includes(id))return false;
  profile.gear=id;saveProfile();
  if(companion)dressDog(companion);
  if(dog)dressDog(dog);
  return true;
}
let fabricPalette=new Map();
const fieldGearGeometry=new Map();
const fieldGearMaterial=new Map();

function gearSurface(name,color,roughness=.86,metalness=0,painted=true){
  if(!fieldGearMaterial.has(name))fieldGearMaterial.set(name,new THREE.MeshStandardMaterial({
    color,roughness,metalness,map:painted?washTexture||null:null,side:THREE.DoubleSide
  }));
  return fieldGearMaterial.get(name);
}
function gearMesh(parent,name,geometry,material){
  if(!fieldGearGeometry.has(name))fieldGearGeometry.set(name,geometry());
  const part=new THREE.Mesh(fieldGearGeometry.get(name),material);
  part.name=name;part.castShadow=part.receiveShadow=true;parent.add(part);
  return part;
}
function plaidMaterial(){
  if(!fabricPalette.has('plaid')){
    const material=wovenMaterial.clone();
    material.customProgramCacheKey=()=>'petit-berger-foulard-carreaux';
    material.onBeforeCompile=shader=>{
      shader.vertexShader='varying vec2 plaidUV;\n'+shader.vertexShader
        .replace('#include <begin_vertex>','#include <begin_vertex>\nplaidUV=uv;');
      shader.fragmentShader='varying vec2 plaidUV;\n'+shader.fragmentShader
        .replace('#include <color_fragment>',`#include <color_fragment>
          vec2 crossings=abs(fract(plaidUV*vec2(6.0,5.0))-.5);
          float broad=step(.24,crossings.x)+step(.24,crossings.y);
          vec3 fern=vec3(.16,.29,.23),sand=vec3(.79,.62,.40);
          float stitch=step(.43,crossings.x)*step(.45,crossings.y);
          float weave=dot(diffuseColor.rgb,vec3(.43,.39,.18));
          diffuseColor.rgb=mix(fern,sand,broad*.38+stitch*.12)*(.76+.33*weave);
        `);
    };
    fabricPalette.set('plaid',material);
  }
  return fabricPalette.get('plaid');
}
function copperBell(neck){
  const bell=group(neck,0,-.344,.188);
  const copper=gearSurface('Cuivre patiné','#bd7449',.48,.46,false);
  const rim=gearSurface('Bord cuivré','#d19462',.44,.42,false);
  const dark=gearSurface('Intérieur de clochette','#69503b',.64,.29,false);
  gearMesh(bell,'Clochette creuse',()=>new THREE.LatheGeometry([
    [.0001,.065],[.037,.063],[.054,.035],[.058,-.014],[.076,-.049],[.089,-.055],
    [.089,-.066],[.075,-.076],[.067,-.072],[.070,-.057],[.048,-.032],
    [.041,.030],[.017,.044],[.0001,.046]
  ].map(([x,y])=>new THREE.Vector2(x,y)),28),copper);
  const edge=gearMesh(bell,'Jonc de la clochette',()=>new THREE.TorusGeometry(.081,.008,7,27),rim);
  edge.rotation.x=Math.PI/2;edge.position.y=-.058;
  const loop=gearMesh(bell,'Attache de la clochette',()=>new THREE.TorusGeometry(.026,.007,7,17),rim);
  loop.position.y=.095;
  mesh(bell,'ball',dark,0,-.052,0,.026,.027,.026);
  return bell;
}
function clothingPatch(sections,rows,columns,angle,pleat=.015){
  const pts=[],uv=[],faces=[],colors=[];
  for(let i=0;i<=rows;i++){
    const t=i/rows,s=t*(sections.length-1),k=Math.min(sections.length-2,Math.floor(s));
    const [z,width,depth,top]=sections[k].map((v,j)=>mix(v,sections[k+1][j],s-k));
    for(let j=0;j<=columns;j++){
      const u=j/columns,a=(2*u-1)*angle;
      const crease=Math.sin(t*21+u*5*.73)*Math.sin(u*19.1+t*4.8)*pleat;
      pts.push(width*Math.sin(a),top+depth*(Math.cos(a)-1)+crease,z);
      uv.push(u,t);
      const edge=1-.20*Math.pow(Math.abs(2*u-1),3)-.08*Math.sin(u*22+t*6)**2;
      colors.push(edge,edge*.991,edge*.98);
      if(i&&j){
        const p=pts.length/3-1,q=p-columns-1;faces.push(q-1,p-1,q,q,p-1,p);
      }
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geo.setIndex(faces);geo.computeVertexNormals();
  return geo;
}
function exploringHarness(back){
  const harness=group(back,0,-.016,0);
  const strap=gearSurface('Sangle en toile verte','#40695a',.91);
  const padding=gearSurface('Remplissage cuir','#826342',.81);
  const metal=gearSurface('Boucles de laiton','#c19b59',.52,.46,false);
  const fixtures=[['Bande de poitrail',.42,.392,.332,.192],['Bande ventrale',-.19,.347,.31,.130]];
  for(const [name,z,radius,depth,top] of fixtures){
    gearMesh(harness,name,()=>clothingPatch([[z-.055,radius,depth,top],[z+.055,radius,depth,top+.011]],2,34,2.38,.006),strap);
    for(const side of [-1,1]){
      const buckle=mesh(harness,'box',metal,side*radius*.994,top-depth,z,.030,.091,.132);
      buckle.rotation.x=.12;
      mesh(harness,'box',padding,side*radius*1.022,top-depth,z,.021,.051,.081);
    }
  }
  const pad=mesh(harness,'lobe',padding,0,.166,.13,.220,.048,.39);
  pad.rotation.x=.035;
  gearMesh(harness,'Pont du harnais',()=>clothingPatch([[-.235,.133,.091,.163],[.09,.169,.13,.170],[.485,.157,.11,.249]],8,18,1.24,.006),strap);
  const buckle=gearMesh(harness,'Anneau du harnais',()=>new THREE.TorusGeometry(.073,.013,8,21),metal);
  buckle.position.set(0,.228,.215);buckle.rotation.x=Math.PI/2;
  return harness;
}
function rainCape(back){
  const cape=group(back,0,.048,0);
  const oilskin=gearSurface('Toile cirée dorée','#dcab4d',.59);
  oilskin.vertexColors=true;
  const trim=gearSurface('Bord cousu de la cape','#996b3d',.86);
  const fastener=gearSurface('Boutons de cape','#ce9e59',.53,.39,false);
  const seams=[[-.61,.287,.29,.135],[-.47,.402,.36,.158],[-.04,.370,.39,.100],[.32,.398,.415,.111],[.52,.374,.363,.142],[.65,.294,.292,.150]];
  gearMesh(cape,'Toile de l’imperméable',()=>clothingPatch(seams,24,34,1.44,.019),oilskin);
  for(const side of [-1,1]){
    for(let n=0;n<seams.length-1;n++){
      const [za,wa,da,ha]=seams[n],[zb,wb,db,hb]=seams[n+1];
      rod(cape,'cyl',trim,[side*.991*wa,ha-.87*da,za],[side*.991*wb,hb-.87*db,zb],.017);
    }
    for(const z of [.23,.34,.45])mesh(cape,'ball',fastener,side*.386,-.178,z,.016,.029,.028);
  }
  return cape;
}

function paintGearIcon(canvas,kind){
  const ctx=canvas.getContext('2d');
  ctx.lineCap=ctx.lineJoin='round';
  function shape(points,color,edge){
    ctx.beginPath();ctx.moveTo(...points[0]);points.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();
    ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=1.5;ctx.stroke();
  }
  if(kind==='plaid'){
    shape([[6,12],[42,12],[41,19],[25,40],[17,34],[9,21]],'#778759','#43574a');
    ctx.strokeStyle='#e3c18a';ctx.lineWidth=2.8;
    for(const [x,y,z] of [[11,16,38],[15,23,36],[19,30,31]]){
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(z,y);ctx.stroke();
    }
    for(const [x,y,z] of [[20,33,12],[28,31,12],[34,23,12]]){
      ctx.beginPath();ctx.moveTo(x,z);ctx.lineTo(x,y);ctx.stroke();
    }
  }else if(kind==='bell'){
    shape([[19,10],[28,10],[31,22],[38,31],[38,35],[12,35],[11,32],[17,24]],'#b8734b','#73442e');
    ctx.strokeStyle='#e1a56f';ctx.lineWidth=3.0;ctx.beginPath();ctx.moveTo(14,32);ctx.lineTo(35,32);ctx.stroke();
    ctx.beginPath();ctx.arc(23,8,4.0,0,TAU);ctx.stroke();
    ctx.fillStyle='#75533b';ctx.fillRect(22,35,5,5);
  }else if(kind==='harness'){
    shape([[8,10],[20,12],[24,18],[31,11],[40,11],[43,18],[40,22],[33,20],[28,27],[31,39],[25,42],[19,37],[16,23],[7,19]],'#547965','#345048');
    for(const [x,y] of [[11,14],[33,14],[23,31]]){
      ctx.strokeStyle='#d5ad6b';ctx.lineWidth=2;ctx.strokeRect(x,y,6,6);
    }
  }else{
    shape([[7,13],[15,9],[26,13],[37,12],[41,17],[40,36],[29,40],[25,33],[10,36]],'#daa74b','#926b3e');
    shape([[15,9],[20,7],[27,11],[29,17],[25,22],[20,16],[15,15]],'#eec06b','#9c733c');
    ctx.fillStyle='#774d35';
    for(const [x,y] of [[18,22],[19,27],[20,31]]){ctx.beginPath();ctx.arc(x,y,1.35,0,TAU);ctx.fill();}
  }
}

function scarfShade(gear){
  if(gear==='plaid')return plaidMaterial();
  if(!['sage','navy','berry'].includes(gear))return wovenMaterial;
  if(fabricPalette.has(gear))return fabricPalette.get(gear);
  const color={sage:[.25,.49,.36],navy:[.13,.30,.53],berry:[.44,.19,.29]}[gear];
  const material=wovenMaterial.clone();material.customProgramCacheKey=()=>gear+'-lin';
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',
      '#include <color_fragment>\nfloat thread=dot(diffuseColor.rgb,vec3(.51,.32,.17)); diffuseColor.rgb=vec3('+color.join(',')+')*(thread+.37);');
  };
  fabricPalette.set(gear,material);return material;
}
let mossLeather,satchelPaint;
function backpack(socket){
  satchelPaint??=new THREE.MeshLambertMaterial({color:'#776445',map:washTexture||null});
  const pouch=group(socket,0,.13,.04);
  mesh(pouch,'lobe',satchelPaint,0,0,0,.24,.18,.24);
  mesh(pouch,'lobe','#b29963',0,.10,-.032,.24,.105,.22);
  mesh(pouch,'box','#5f4e36',0,.085,-.19,.044,.12,.051);
  mesh(pouch,'box','#bf9462',0,.072,-.213,.071,.050,.026);
  return pouch;
}
function dressDog(model){
  if(!model)return;
  const gear=profile.gear;
  model.scarf.visible=['rust','sage','navy','berry','plaid'].includes(gear);
  model.scarf.material=scarfShade(gear);
  model.collar.visible=gear==='collar'||gear==='moss'||gear==='bell';
  if(gear==='moss')mossLeather??=new THREE.MeshLambertMaterial({color:'#535c37',side:THREE.DoubleSide});
  model.collar.children[0].material=gear==='moss'?mossLeather:collarMaterial;
  model.collar.children[2].visible=gear!=='bell';
  model.satchel.visible=gear==='satchel';
  model.clochette.visible=gear==='bell';
  model.harnais.visible=gear==='harness';
  model.impermeable.visible=gear==='raincoat';
  const fallback={collar:model.collar,moss:model.collar,plaid:model.scarf,harness:model.harnais,
    raincoat:model.impermeable,satchel:model.satchel};
  for(const [id,piece] of Object.entries(model.packGear)){
    piece.visible=gear===id;
    if(piece.visible)fallback[id].visible=false;
  }
}

const inCampaign=level=>!level.side;
function completedCampaign(){
  return levels.filter(level=>inCampaign(level)&&Boolean(profile.records[level.id])).length;
}
function farmStage(count=completedCampaign()){
  return repairs.filter(repair=>count>=repair.count).length;
}
let shepherdOrder=null,farmPieces=[];
function availableOrders(config=activeMission()){
  if(chapter<0)return [];
  if(config.bigFlock)return profile.whistle?['gather']:[];
  const orders=['gather','hold','sort'].slice(0,farmStage());
  const known=new Set([...orders,...config.fieldOrders||[]]);
  if(profile.whistle)known.add('gather');
  return Array.from(known);
}
function commandable(){
  return animals.filter(m=>!m.safe&&!m.escape&&!m.lost&&distance(m,dog)<(profile.whistle?29:22)&&travelClear(m,dog,.20));
}
const orderLabels={gather:'Rassembler',hold:'Tenir',sort:'Trier'};
function applyShepherdOrder(kind,type=null){
  if(playPaused()||!availableOrders().includes(kind))return false;
  const nearby=commandable();
  const closest=nearby.slice().sort((a,b)=>distance(a,dog)-distance(b,dog))[0];
  const members=kind==='gather'?nearby.filter(m=>m.type===closest?.type):
    kind==='sort'?nearby.filter(m=>m.type!==type):nearby;
  const valid=kind==='gather'?members.length>=2:kind==='sort'?members.length>0&&nearby.some(m=>m.type===type):members.length>0;
  if(!valid){
    showMessage(kind==='sort'?'Approche-toi de deux espèces.':kind==='gather'?'Approche deux animaux du même troupeau.':'Approche-toi du troupeau.');
    return false;
  }
  const center=kind==='gather'?point(members.reduce((x,m)=>x+m.x,0)/members.length,members.reduce((z,m)=>z+m.z,0)/members.length):null;
  shepherdOrder={kind,type,until:gameTime+(kind==='gather'?(profile.whistle?7:5):23),
    locations:new Map(members.map(m=>[m,center||point(m.x,m.z)]))};
  soundEffect('whistle');
  const label=kind==='gather'?'Regroupement au sifflet':kind==='sort'?species[type].title+' à guider':'Troupeau en attente';
  showMessage(label);
  refreshOrder();
  return true;
}
function orderMotion(m,sx,sz){
  if(!shepherdOrder||shepherdOrder.until<=gameTime||m.wolfAlarm>gameTime||m.grabbed||m.exposure>0)return [sx,sz];
  const target=shepherdOrder.locations.get(m);
  if(!target)return [sx,sz];
  const dx=target.x-m.x,dz=target.z-m.z,d=Math.hypot(dx,dz);
  if(!travelClear(m,target,.24))return [sx,sz];
  const force=shepherdOrder.kind==='gather'?Math.min(3.2,Math.max(0,d-1.6)*.50):
    Math.min(3,Math.max(0,d-.5)*.8);
  const fraction=shepherdOrder.kind==='gather'?.72:.064;
  return [sx*fraction+dx*force/Math.max(.15,d),sz*fraction+dz*force/Math.max(.15,d)];
}
function refreshOrder(){
  const trigger=$('open-orders');
  trigger.hidden=availableOrders().length===0;
  if(shepherdOrder&&gameTime>=shepherdOrder.until)shepherdOrder=null;
  trigger.dataset.active=String(Boolean(shepherdOrder));
}
function orderButton(host,label,detail,action,disabled=false){
  const button=document.createElement('button');
  button.type='button';button.className='order-option';button.disabled=disabled;
  const title=document.createElement('strong'),hint=document.createElement('small');
  title.textContent=label;hint.textContent=detail;
  button.append(title,hint);button.onclick=action;host.append(button);
}
function openOrders(){
  const orders=availableOrders();
  if(playPaused()||!orders.length)return;
  const trigger=$('open-orders');
  const dialog=$('orders-dialog'),host=$('orders-list');
  host.innerHTML='';
  const nearby=commandable();
  const types=[...new Set(nearby.map(m=>m.type))];
  const choose=(kind,type=null)=>()=>{
    dialog.close();
    applyShepherdOrder(kind,type);
  };
  if(orders.includes('gather')){
    const closest=nearby.slice().sort((a,b)=>distance(a,dog)-distance(b,dog))[0];
    orderButton(host,'Rassembler','Resserre le groupe proche.',choose('gather'),nearby.filter(m=>m.type===closest?.type).length<2);
  }
  if(orders.includes('hold'))orderButton(host,'Tenir','Garde les animaux proches en place pendant 23 s.',choose('hold'),!nearby.length);
  if(orders.includes('sort')&&Object.keys(pens).length>1){
    for(const type of Object.keys(pens)){
      orderButton(host,'Trier · '+species[type].title,'Les autres espèces proches attendent.',choose('sort',type),types.length<2||!types.includes(type));
    }
  }
  if(shepherdOrder){
    orderButton(host,'Libérer le groupe','Met fin à l’ordre en cours.',()=>{
      shepherdOrder=null;dialog.close();refreshOrder();showMessage('Troupeau libéré');
    });
  }
  $('orders-context').textContent=!nearby.length?'Approche-toi du troupeau pour lui donner un ordre.':'Animaux à portée · '+nearby.length;
  openModal(dialog,trigger);
}
function makeFarmPieces(){
  const peg=(parent,x,y,z,sx,sy,sz,color)=>mesh(parent,'box',color,x,y,z,sx,sy,sz);
  const fold=group(companionScene,-.82,0,-1.34);
  for(const x of [-.54,-.15,.24,.63]){
    peg(fold,x,.28,0,.06,.57,.07,'#997752');
  }
  for(const y of [.23,.43])peg(fold,.04,y,0,1.3,.069,.056,'#bb9560');
  const trough=group(companionScene,.92,0,-1.05);
  mesh(trough,'stone','#a69983',0,.104,0,.45,.12,.17);
  peg(trough,0,.199,0,.67,.085,.24,'#917658');
  peg(trough,0,.249,0,.49,.032,.17,'#799f9d');
  for(const x of [-.34,.34])peg(trough,x,.177,0,.065,.30,.21,'#aa8c66');
  const store=group(companionScene,1.38,0,-1.86);
  for(const x of [-.42,.42])for(const z of [-.28,.28])peg(store,x,.44,z,.062,.88,.062,'#9b7955');
  for(const side of [-1,1]){
    const roof=peg(store,0,.93,side*.205,1.06,.07,.49,'#ae7757');
    roof.rotation.x=-side*.29;
  }
  peg(store,0,.49,-.28,.82,.59,.056,'#bb9268');
  for(const x of [-.23,.20])mesh(store,'taper','#cbaf70',x,.26,.02,.151,.30,.13).rotation.x=.22;
  farmPieces=[fold,trough,store];
}
function refreshFarmRepairs(){
  const stage=farmStage(),current=repairs[stage-1],next=repairs[stage];
  $('farm-repairs').textContent=current?'Ma ferme · '+stage+'/'+repairs.length:'Ma ferme';
  $('farm-landmark').textContent=current?.title||'';
  $('farm-landmark').hidden=!current;
  for(const [index,piece] of farmPieces.entries())piece.visible=index<stage&&$('home').dataset.screen==='farm';
  $('farm-upgrade-summary').textContent=next?Math.max(0,next.count-completedCampaign())+' missions de campagne avant le prochain aménagement.':'Les trois aménagements sont terminés.';
}
function openFarmRepairs(){
  const count=completedCampaign(),host=$('farm-repair-list');
  host.innerHTML='';
  for(const repair of repairs){
    const row=document.createElement('li');
    const label=document.createElement('strong'),hint=document.createElement('small'),state=document.createElement('span');
    label.textContent=repair.title;hint.textContent=repair.hint;
    state.textContent=count>=repair.count?'Construit':count+'/'+repair.count;
    row.append(label,hint,state);host.append(row);
  }
  refreshFarmRepairs();
  openModal($('farm-repairs-dialog'),$('farm-repairs'));
}
function contractReady(config){return !config.side||completedCampaign()>=config.gate;}
function renderContracts(){
  const rows=$('contract-list');
  rows.innerHTML='';
  const unlocked=levels.filter(level=>level.side&&level.id!=='clos-entrainement'&&contractReady(level));
  const week=Math.floor(Date.now()/604800000),featured=unlocked[week%unlocked.length];
  const ordered=levels.filter(level=>level.side&&level!==featured);
  if(featured)ordered.unshift(featured);
  for(const config of ordered){
    const index=levels.indexOf(config);
    const li=document.createElement('li'),button=document.createElement('button');
    button.type='button';button.className='outing-row';button.disabled=!contractReady(config);
    const stack=document.createElement('span'),title=document.createElement('strong'),note=document.createElement('small'),state=document.createElement('span');
    title.textContent=config.title;note.textContent=config===featured?'Cette semaine · '+config.label:config.label;
    state.className='outing-status';
    state.textContent=button.disabled?'À '+config.gate+' missions':profile.records[config.id]?'Rejouer':'Jouer';
    stack.append(title,note);button.append(stack,state);
    button.onclick=()=>{pendingMode='contract';openBrief(index,button);};
    li.append(button);rows.append(li);
  }
}
const championshipForDog=new Map(levels.filter(level=>level.trial).map(level=>[level.trial.dogId,level]));
function raceUnlocked(id,save=profile){
  if(id===sculptedDog.default||id===save.legacyBreed)return true;
  const finale=championshipForDog.get(id);
  return Boolean(finale&&(save.records[finale.id]?.time??Infinity)<finale.trial.seconds);
}
function worldTrail(region){return trailsByWorld[region]||[];}
function beforeFinale(config){
  return worldTrail(config.region).every(level=>level.id===config.id||Boolean(profile.records[level.id]));
}
function canOpenMission(config,mode){
  if(!config||!contractReady(config))return false;
  if(config.trial)return beforeFinale(config);
  if(config.bigFlock)return bonusUnlocked(config);
  return config.side||mode!=='story'||Boolean(profile.records[config.id])||levels.indexOf(config)===storyMission();
}
function trialDuration(seconds){
  const tenths=Math.floor(Math.max(0,seconds)*10);
  return timeLabel(tenths/10)+','+tenths%10;
}
function trialName(config){return sculptedDog.breeds[config.trial.dogId].label;}
function trialDetails(config){
  return 'Moins de '+timeLabel(config.trial.seconds)+' · '+trialName(config)+' à débloquer';
}
let displayedTrial=null;
function browseTrial(id){
  const finale=championshipForDog.get(id);
  if(!finale)return;
  displayedTrial=finale;
  $('dog-model-feedback').textContent=trialDetails(finale);
  $('dog-trial-link').hidden=false;
}
function showChampionship(){
  if(!displayedTrial)return;
  selectedWorld=displayedTrial.region;missionView='story';
  showFarmPanel('missions');
  const row=document.querySelector('#map-missions [data-finale]');
  row?.scrollIntoView?.({block:'end',inline:'nearest'});
  $('missions-title').focus({preventScroll:true});
}
function updateTrialClock(){
  const target=$('field-time'),trial=activeMission().trial;
  if(!trial){target.hidden=true;return;}
  const remaining=Math.max(0,Math.ceil(trial.seconds-runStats.time));
  const copy=remaining?timeLabel(remaining):'Temps écoulé';
  if(target.textContent!==copy)target.textContent=copy;
  target.dataset.urgent=String(remaining<=12);
  target.hidden=false;
}
const storeKey='petit-berger-mobile-v1';
let profile=readProfile();
let pendingMission=0,gameReady=false, missionEntered=false,lastTimer=-1;
function readProfile(){
  const value={last:null,records:{},coins:18,biscuits:1,whistle:false,owned:['bare'],gear:'bare',sound:false,volume:.65,quality:'auto',
    dogName:'Nuage',breed:sculptedDog.default,legacyBreed:null,raceRules:1,breedCoats:{},dogCoat:sculptedDog.breeds[sculptedDog.default].coats[0].id,tutorial:null};
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
    const integer=(n,fallback,cap)=>Number.isSafeInteger(n)&&n>=0?Math.min(cap,n):fallback;
    value.coins=integer(stored.coins,value.coins+Object.keys(value.records).length*8,999999);
    value.biscuits=integer(stored.biscuits,value.biscuits,99);
    value.whistle=stored.whistle===true;
    value.owned.push(...(Array.isArray(stored.owned)?Object.keys(gearItems).filter(item=>item!=='bare'&&stored.owned.includes(item)):[]));
    value.dogName=cleanDogName(stored.dogName);
    const previousBreed=stored.raceRules===1?stored.legacyBreed:stored.breed;
    if(previousBreed!==sculptedDog.default&&typeof previousBreed==='string'&&Object.hasOwn(sculptedDog.breeds,previousBreed)){
      value.legacyBreed=previousBreed;
    }
    if(typeof stored.breed==='string'&&Object.hasOwn(sculptedDog.breeds,stored.breed)&&raceUnlocked(stored.breed,value)){
      value.breed=stored.breed;
    }
    for(const breed of Object.values(sculptedDog.breeds)){
      const style=stored.breedCoats?.[breed.id];
      if(breed.coats.some(coat=>coat.id===style))value.breedCoats[breed.id]=style;
    }
    value.dogCoat=coatFor(sculptedDog.breeds[value.breed],stored.dogCoat).id;
    value.breedCoats[value.breed]=value.dogCoat;
    if(['done','skipped'].includes(stored.tutorial))value.tutorial=stored.tutorial;

    if(Object.hasOwn(gearItems,stored.gear)&&value.owned.includes(stored.gear))value.gear=stored.gear;
    value.sound=stored.sound===true;
    value.volume=typeof stored.volume==='number'?clamp(stored.volume,0,1):value.volume;
    value.quality=['auto','smooth','detail'].includes(stored.quality)?stored.quality:value.quality;
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
  return chapter<0?lesson:levels[chapter];
}
function recommendedMission(){
  const last=levels.findIndex(level=>level.id===profile.last);
  if(last>=0&&!profile.records[levels[last].id])return last;
  const next=levels.findIndex(level=>!profile.records[level.id]);
  return next<0?Math.max(0,last):next;
}
function playPaused(){
  return won||missionFailed||phonePortrait||!$('home').hidden||document.hidden||Boolean(document.querySelector('dialog[open]'));
}
function setNote(message){
  $('mission-note').textContent=dogText(message);
}
function refreshTimer(){
  updateTrialClock();
  const second=Math.floor(runStats.time);
  if(second===lastTimer)return;
  lastTimer=second;
  $('mission-timer').textContent=timeLabel(second);
  $('mission-timer').dataset.exceeded=String(runStats.time>activeMission().seconds);
}
const shopItems=[
  {id:'biscuits',name:'Croquette tonique',label:'22 % de vitesse en plus pendant 12 secondes.',price:8,mark:'biscuit',group:'terrain'},
  {id:'whistle',name:'Sifflet de berger',label:'Resserre un troupeau à portée. Recharge en 18 secondes.',price:36,mark:'whistle',group:'terrain'},
  {id:'rust',name:'Foulard terracotta',label:'Lin chaud, couleur de terre cuite.',price:12,mark:'scarf',group:'accessoires'},
  {id:'sage',name:'Foulard sauge',label:'Lin vert doux.',price:12,mark:'scarf',group:'accessoires'},
  {id:'navy',name:'Foulard indigo',label:'Lin bleu profond.',price:16,mark:'scarf',group:'accessoires'},
  {id:'berry',name:'Foulard mûre',label:'Lin couleur baie.',price:16,mark:'scarf',group:'accessoires'},
  {id:'collar',name:'Collier en cuir',label:'Cuir brun et médaillon en laiton.',price:17,mark:'collar',group:'accessoires'},
  {id:'moss',name:'Collier mousse',label:'Cuir vert et boucle en laiton.',price:21,mark:'collar',group:'accessoires'},
  {id:'satchel',name:'Sacoche du berger',label:'Une petite sacoche de toile portée sur le dos.',price:31,mark:'pack',group:'accessoires'},
  {id:'plaid',name:'Foulard à carreaux',label:'Motif tissé vert fougère et lin.',price:14,mark:'plaid',group:'accessoires',illustrated:true},
  {id:'bell',name:'Clochette de cuivre',label:'Clochette patinée suspendue au collier.',price:18,mark:'bell',group:'accessoires',illustrated:true},
  {id:'harness',name:'Harnais d’exploration',label:'Sangles de toile et boucles en laiton.',price:26,mark:'harness',group:'accessoires',illustrated:true},
  {id:'raincoat',name:'Imperméable ciré',label:'Cape ocre en toile cirée à bord cousu.',price:34,mark:'raincoat',group:'accessoires',illustrated:true},
];
let selectedWorld=null,missionView='story',shopFilter='terrain';
function enterStory(trigger){
  wakeAudio();
  if(missionEntered&&!won){showField();return;}
  pendingMode='story';openBrief(storyMission(),trigger);
}
function farmSummary(){
  const completed=completedCampaign(),total=levels.filter(inCampaign).length;
  $('farm-seeds').textContent=profile.coins;
  $('home-progress').textContent=completed+' sur '+total+' missions terminées';
  $('farm-progress').max=total;
  $('farm-progress').value=completed;
  refreshFarmRepairs();
  const mission=missionEntered&&!won?activeMission():levels[storyMission()];
  $('farm-next').textContent=mission.title;
  $('farm-region').textContent=worldNames[mission.region].name;
  $('farm-next-picture').dataset.biome=String(mission.region);
  $('farm-continue').textContent=missionEntered&&!won?'Reprendre':'Jouer';
  syncName();
}
function updateHome(){
  farmSummary();refreshSettings();if(companion)dressDog(companion);
}
function showFarmPanel(id,focus=false){
  $('home').dataset.screen=id;
  for(const panel of document.querySelectorAll('[data-farm-panel]'))panel.hidden=panel.dataset.farmPanel!==id;
  for(const nav of document.querySelectorAll('[data-farm-nav]')){
    if(nav.dataset.farmNav===id)nav.setAttribute('aria-current','page');
    else nav.removeAttribute('aria-current');
  }
  if(id==='shop')renderShop();
  if(id==='dog')renderWardrobe();
  if(id==='missions')renderMissionMap();
  $('farm-scroll').scrollTop=0;
  if(id==='farm'||id==='dog')resizeCompanion();
  else portraitRect=null;
  updateHome();
  if(focus)$({farm:'farm-title',missions:'missions-title',dog:'dog-title',shop:'shop-title',settings:'settings-title'}[id]).focus({preventScroll:true});
}
function worldPicture(index){
  const image=document.createElement('span');
  image.className='biome-art';image.dataset.biome=index;image.setAttribute('aria-hidden','true');
  return image;
}
function missionNumber(config){return worldTrail(config.region).indexOf(config)+1;}
function renderMissionMap(){
  const contracts=missionView==='contract',opened=!contracts&&selectedWorld!==null;
  $('campaign-atlas').hidden=contracts;$('contract-atlas').hidden=!contracts;
  $('world-gallery').hidden=opened;
  $('world-detail').hidden=!opened;
  $('mission-mode-story').setAttribute('aria-pressed',String(missionView==='story'));
  $('mission-mode-free').setAttribute('aria-pressed',String(missionView==='mission'));
  $('mission-mode-contract').setAttribute('aria-pressed',String(contracts));
  if(contracts){renderContracts();return;}
  if(opened){renderWorldTrail(selectedWorld);return;}
  const gallery=$('world-gallery');
  gallery.innerHTML='';
  for(const [index,world] of worldNames.entries()){
    const n=worldTrail(index).filter(level=>profile.records[level.id]).length;
    const li=document.createElement('li'),button=document.createElement('button');
    button.type='button';button.className='world-card';
    const title=document.createElement('strong'),count=document.createElement('span');
    const caption=document.createElement('span');
    caption.className='world-card-caption';count.className='world-card-tally';
    title.textContent=world.name;count.textContent=n+'/'+worldTrail(index).length;
    if(levels[storyMission()].region===index&&missionView==='story')button.dataset.recommended='true';
    caption.append(title,count);button.append(worldPicture(index),caption);li.append(button);gallery.append(li);
    button.onclick=()=>{
      selectedWorld=index;
      renderMissionMap();
      $('farm-scroll').scrollTop=0;
      $('atlas-region').focus({preventScroll:true});
    };
  }
}
function renderWorldTrail(region){
  const levelsHere=worldTrail(region),world=worldNames[region],last=levelsHere.at(-1);
  const album=$('map-missions'),prize=$('atlas-prize');
  album.innerHTML='';
  $('atlas-region').textContent=world.name;
  $('atlas-picture').dataset.biome=region;
  $('atlas-bio').textContent=world.terrain;
  $('atlas-completed').textContent=levelsHere.filter(level=>Boolean(profile.records[level.id])).length+' / '+levelsHere.length+' terminés';
  prize.hidden=!last.trial;
  if(last.trial)prize.textContent=raceUnlocked(last.trial.dogId)?'Chien disponible · '+trialName(last):'À gagner · '+trialName(last);
  for(const [offset,level] of levelsHere.entries()){
    const record=profile.records[level.id],ready=canOpenMission(level,missionView);
    const li=document.createElement('li'),button=document.createElement('button');
    button.type='button';button.className='mission-line';button.disabled=!ready;
    if(level.trial)button.dataset.finale='true';
    if(level.bigFlock)button.dataset.bonus='true';
    const step=document.createElement('span'),stack=document.createElement('span'),title=document.createElement('strong');
    const label=document.createElement('small'),result=document.createElement('span');
    step.className='mission-line-step';step.textContent=String(offset+1).padStart(2,'0');
    stack.className='mission-line-copy';title.textContent=level.title;
    label.textContent=level.trial?(record?'Record '+trialDuration(record.time)+' · ':'')+'Objectif '+timeLabel(level.trial.seconds):
      level.bigFlock?'Grand troupeau · '+level.animals.length+' moutons':level.label;
    result.className='mission-line-status';
    result.textContent=!ready?(level.trial?'Après les 9 niveaux':'Verrouillé'):level.trial?
      (record&&record.time<level.trial.seconds?'Réussi':'Chrono'):record?'✓':'Jouer';
    stack.append(title,label);button.append(step,stack,result);li.append(button);album.append(li);
    button.onclick=()=>{pendingMode=missionView;openBrief(levels.indexOf(level),button);};
  }
}
function browseWorlds(){
  selectedWorld=null;
  renderMissionMap();$('farm-scroll').scrollTop=0;
  $('missions-title').focus({preventScroll:true});
}
function canBuy(item){
  if(item.id==='biscuits')return profile.biscuits<99;
  if(item.id==='whistle')return !profile.whistle;
  return !profile.owned.includes(item.id);
}
function buyItem(id){
  const item=shopItems.find(item=>item.id===id);
  if(!item||!canBuy(item)||profile.coins<item.price)return false;
  profile.coins-=item.price;
  if(id==='biscuits')profile.biscuits++;
  else if(id==='whistle')profile.whistle=true;
  else profile.owned.push(id);
  saveProfile();return true;
}
function renderShop(){
  const host=$('shop-list');
  host.innerHTML='';
  $('shop-stock').textContent=shopFilter==='terrain'?profile.biscuits+' croquette'+(profile.biscuits===1?'':'s')+' en réserve':'';
  for(const filter of document.querySelectorAll('[data-shop-filter]'))filter.setAttribute('aria-pressed',String(filter.dataset.shopFilter===shopFilter));
  for(const item of shopItems){
    if(item.group!==shopFilter)continue;
    const row=document.createElement('li'),mark=document.createElement('span'),body=document.createElement('div');
    mark.className='item-mark';mark.dataset.kind=item.mark;mark.dataset.detail=item.id;mark.setAttribute('aria-hidden','true');
    if(item.illustrated){
      const icon=document.createElement('canvas');icon.width=icon.height=48;
      paintGearIcon(icon,item.mark);mark.append(icon);
    }
    const title=document.createElement('strong'),copy=document.createElement('small');
    title.textContent=item.name;copy.textContent=item.label;body.append(title,copy);
    const button=document.createElement('button');
    button.type='button';button.className='item-buy';button.dataset.item=item.id;
    const available=canBuy(item),equippable=item.group==='accessoires'&&!available;
    const equipped=equippable&&profile.gear===item.id;
    button.disabled=equipped||(!available&&!equippable)||(available&&profile.coins<item.price);
    button.textContent=available?String(item.price):equipped?'Équipé':equippable?'Équiper':item.id==='biscuits'?'Sac plein':'Dans le sac';
    if(available){
      const seed=document.createElement('i');
      seed.className='seed-icon';seed.setAttribute('aria-hidden','true');
      button.append(seed);
      button.setAttribute('aria-label','Acheter '+item.name+' pour '+item.price+' graines');
    }
    else if(equippable)button.setAttribute('aria-label',button.textContent+' · '+item.name);
    button.onclick=()=>{
      if(equippable){
        if(!equipItem(item.id))return;
        renderShop();$('shop-feedback').textContent=item.name+' équipé.';$('shop-feedback').focus();
        return;
      }
      if(!buyItem(item.id))return;
      wakeAudio();soundEffect('found');renderShop();farmSummary();
      $('shop-feedback').textContent=item.name+' ajouté à ton inventaire.';
      const next=host.querySelector('[data-item="'+item.id+'"]');
      if(next&&!next.disabled)next.focus();
      else $('shop-feedback').focus();
    };
    row.append(mark,body,button);host.append(row);
  }
}
function bindJournal(){
  $('open-missions').onclick=()=>{selectedWorld=null;showFarmPanel('missions',true);};
  $('back-to-worlds').onclick=browseWorlds;
  $('dog-trial-link').onclick=showChampionship;
  $('mission-mode-story').onclick=()=>{missionView='story';renderMissionMap();};
  $('mission-mode-free').onclick=()=>{missionView='mission';renderMissionMap();};
  $('mission-mode-contract').onclick=()=>{missionView='contract';renderMissionMap();};
  $('farm-repairs').onclick=openFarmRepairs;
  $('open-farm-contracts').onclick=()=>{
    $('farm-repairs-dialog').close();missionView='contract';showFarmPanel('missions',true);
  };
  $('to-shop').onclick=()=>{shopFilter='accessoires';showFarmPanel('shop',true);};
  $('edit-dog-name').onclick=()=>toggleDogName($('dog-name-form').hidden);
  $('natural-coats').onclick=()=>setCoatCategory('naturel');
  $('fantasy-coats').onclick=()=>setCoatCategory('fantaisie');
  $('dog-name-form').onsubmit=event=>{
    event.preventDefault();
    profile.dogName=cleanDogName($('dog-name').value);$('dog-name').value=profile.dogName;
    saveProfile();syncName();farmSummary();toggleDogName(false);
  };
  document.querySelectorAll('[data-wardrobe-tab]').forEach(button=>button.onclick=()=>selectWardrobe(button.dataset.wardrobeTab));
  document.querySelectorAll('[data-shop-filter]').forEach(button=>button.onclick=()=>{shopFilter=button.dataset.shopFilter;renderShop();});
}

let pendingMode='story',runMode='story',companionScene,companionCamera,companion,portraitRect,companionAngle=-1.05;
let sampleMs=0,sampleFrames=0,qualityLimit=1.85,autoQuality=1.85;
let biscuitUntil=-1,whistleReady=-1,whistleGroup=null,gearState='';

function recenterCamera(){
  if(playPaused())return;
  cameraInput.yaw=dog.heading;
  cameraInput.elevation=.30;
}
function storyMission(){
  const first=levels.findIndex(level=>inCampaign(level)&&!profile.records[level.id]);
  return first<0?levels.findLastIndex(inCampaign):first;
}

let collarGeometry,collarMaterial,collarTag,collarMetal;
function collarForNeck(neck){
  if(!collarGeometry){
    const positions=[],faces=[],steps=42;
    const band=sculptedDog.neck.band;
    for(let i=0;i<steps;i++){
      positions.push(...band[i],...band[43+i]);
      const j=i*2,k=((i+1)%steps)*2;
      faces.push(j,k,j+1,j+1,k,k+1);
    }
    collarGeometry=new THREE.BufferGeometry();
    collarGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));collarGeometry.setIndex(faces);collarGeometry.computeVertexNormals();
    collarMaterial=new THREE.MeshLambertMaterial({color:'#69402d',side:THREE.DoubleSide});
    collarMetal=new THREE.MeshStandardMaterial({color:'#b78746',metalness:.42,roughness:.39});
    collarTag=new THREE.CylinderGeometry(.051,.051,.017,18);
  }
  const collar=group(neck),strap=new THREE.Mesh(collarGeometry,collarMaterial);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.048,.009,6,16),collarMetal);
  const id=new THREE.Mesh(collarTag,collarMetal);
  const [,y,z]=sculptedDog.neck.band[64];
  ring.position.set(.006,y-.027,z+.009);
  id.position.set(.006,y-.093,z+.018);id.rotation.x=Math.PI/2;
  collar.add(strap,ring,id);
  return collar;
}
function refreshSettings(){
  soundEnabled=profile.sound;
  for(const id of ['sound','farm-sound']){
    $(id).setAttribute('aria-pressed',String(soundEnabled));
    $(id).textContent=(id==='sound'?'Son ':'')+(soundEnabled?'Activé':'Désactivé');
  }
  $('farm-volume').value=Math.round(profile.volume*100);
  $('volume-value').textContent=Math.round(profile.volume*100)+' %';
  $('quality-setting').value=profile.quality;
}
async function wakeAudio(force=false){
  if(!profile.sound&&!force)return false;
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)return false;
  try{audio??=new Audio();if(audio.state!=='running')await audio.resume();return audio.state==='running';}
  catch{return false;}
}
async function toggleSound(){
  if(profile.sound)profile.sound=false;
  else{
    if(!await wakeAudio(true)){$('sound-feedback').textContent='Le son est indisponible sur cet appareil.';return;}
    profile.sound=true;
  }
  saveProfile();refreshSettings();meadowAmbience();if(profile.sound)soundEffect('found');
}
function applyQuality(mode){
  qualityLimit=Math.min(devicePixelRatio,mode==='smooth'?1.12:mode==='detail'?2.25:1.85);
  autoQuality=qualityLimit;
  renderer.setPixelRatio(autoQuality);
  sampleMs=sampleFrames=0;
}
function updateAdaptiveQuality(elapsed){
  if(profile.quality!=='auto'||elapsed<=0||elapsed>.14)return;
  sampleMs+=elapsed;sampleFrames++;
  if(sampleFrames<100)return;
  const average=sampleMs/sampleFrames;
  if(average>.027&&autoQuality>1.13){
    autoQuality=Math.max(1.12,autoQuality-.16);renderer.setPixelRatio(autoQuality);
  }else if(average<.019&&autoQuality<qualityLimit){
    autoQuality=Math.min(qualityLimit,autoQuality+.08);renderer.setPixelRatio(autoQuality);
  }
  sampleMs=sampleFrames=0;
}
function loadingState(label,fraction){
  $('boot-status').textContent=label;
  $('boot-progress').value=fraction;
}
function resetGear(){
  biscuitUntil=whistleReady=-1;whistleGroup=null;gearState='';
}
function updateGear(force=false){
  const biscuitLeft=Math.max(0,Math.ceil(biscuitUntil-gameTime));
  const whistleLeft=Math.max(0,Math.ceil(whistleReady-gameTime));
  const state=[biscuitLeft,whistleLeft,profile.biscuits,profile.whistle].join(':');
  if(!force&&state===gearState)return;
  gearState=state;
  const food=$('use-biscuit'),whistle=$('use-whistle');
  food.hidden=!profile.biscuits&&!biscuitLeft;
  food.disabled=Boolean(biscuitLeft);
  $('biscuit-state').textContent=biscuitLeft?biscuitLeft+' s':profile.biscuits;
  whistle.hidden=!profile.whistle;
  whistle.disabled=Boolean(whistleLeft);
  $('whistle-state').textContent=whistleLeft?whistleLeft+' s':'Prêt';
}
function useBiscuit(){
  if(playPaused()||!profile.biscuits||gameTime<biscuitUntil)return;
  profile.biscuits--;biscuitUntil=gameTime+12;
  saveProfile();updateGear(true);soundEffect('found');showMessage('Nuage a de l’énergie pour 12 secondes.');
}
function useWhistle(){
  if(playPaused()||!profile.whistle||gameTime<whistleReady)return;
  const nearby=animals.filter(m=>!m.safe&&!m.escape&&distance(dog,m)<17);
  nearby.sort((a,b)=>distance(dog,a)-distance(dog,b));
  const chosen=nearby[0];
  const members=nearby.filter(m=>chosen&&m.type===chosen.type&&distance(m,chosen)<13);
  if(members.length<2){showMessage('Approche-toi d’au moins deux animaux du même troupeau.');return;}
  const center=members.reduce((all,m)=>point(all.x+m.x,all.z+m.z),point(0,0));
  whistleGroup={members:new Set(members),x:center.x/members.length,z:center.z/members.length,until:gameTime+3};
  whistleReady=gameTime+18;updateGear(true);soundEffect('whistle');showMessage('Le troupeau se resserre.');
}
function bindFarm(){
  document.querySelectorAll('[data-farm-nav]').forEach(el=>el.onclick=()=>showFarmPanel(el.dataset.farmNav,true));
  bindJournal();bindTutorial();
  $('farm-continue').onclick=()=>{enterStory($('farm-continue'));};
  $('farm-sound').onclick=toggleSound;
  $('farm-volume').oninput=event=>{
    profile.volume=Number(event.target.value)/100;
    $('volume-value').textContent=event.target.value+' %';
    saveProfile();meadowAmbience();
  };
  $('quality-setting').onchange=event=>{
    profile.quality=event.target.value;applyQuality(profile.quality);saveProfile();
  };
  $('rotate-dog').onclick=()=>{companionAngle=wrapAngle(companionAngle+.74);};
  let dragId=null,lastX=0;
  const portrait=$('farm-hero');
  portrait.addEventListener('pointerdown',event=>{
    if(event.target.closest('button')||dragId!==null)return;
    dragId=event.pointerId;lastX=event.clientX;portrait.setPointerCapture(dragId);
  });
  portrait.addEventListener('pointermove',event=>{
    if(dragId!==event.pointerId)return;
    companionAngle=wrapAngle(companionAngle+(event.clientX-lastX)*.014);lastX=event.clientX;
  });
  for(const event of ['pointerup','pointercancel','lostpointercapture'])portrait.addEventListener(event,e=>{if(dragId===e.pointerId)dragId=null;});
}
function resizeCompanion(){
  if(!companionCamera||$('home').hidden)return;
  const stageBox=stage.getBoundingClientRect(),r=$('farm-hero').getBoundingClientRect();
  if(!r.width||!r.height)return;
  portraitRect={x:r.left-stageBox.left,y:stageBox.bottom-r.bottom,w:r.width,h:r.height};
  companionCamera.aspect=r.width/r.height;
  companionCamera.fov=companionCamera.aspect<1.4?39:33;companionCamera.updateProjectionMatrix();
}
const portraitBackdrop=new THREE.Color('#dce0cf');
let portraitShadow;
function buildCompanion(){
  companionScene=new THREE.Scene();
  companionCamera=new THREE.PerspectiveCamera(33,1,.1,40);
  frameCompanion();
  companionScene.add(new THREE.HemisphereLight('#e0ebfa','#a37d49',2.16));
  const key=new THREE.DirectionalLight('#ffe4c0',2.52);key.position.set(-3,5,3);companionScene.add(key);
  const rim=new THREE.DirectionalLight('#ffedce',1.65);rim.position.set(3,2,-4);companionScene.add(rim);
  const base=group(companionScene),actor=group(base);
  const shadeMat=new THREE.MeshBasicMaterial({map:shadeTexture,transparent:true,opacity:.62,depthWrite:false});
  const contact=mesh(companionScene,'plane',shadeMat,.02,.01,-.21,1.82,2.8,1);
  contact.rotation.x=-Math.PI/2;portraitShadow=contact;
  companion={root:base,actor,...makeDogModel(actor)};
  base.rotation.y=companionAngle;
  makeFarmPieces();
}
function frameCompanion(){
  const {bounds,visualScale}=activeDogAsset.asset;
  const height=bounds[1][1]*visualScale,length=(bounds[1][2]-bounds[0][2])*visualScale;
  const distance=Math.max(2.4*height,1.45*length);
  companionCamera.position.set(0,height*.85,distance);
  companionCamera.lookAt(0,height*.44,0);
  if(portraitShadow){
    const width=(bounds[1][0]-bounds[0][0])*visualScale;
    portraitShadow.scale.set(Math.max(.68,width*2.17),length*1.11,1);
  }
}
function renderCompanion(now){
  if(!companion||!portraitRect)return;
  const dressing=$('home').dataset.screen==='dog';
  companionScene.background=dressing?portraitBackdrop:null;
  poseDogPortrait(companion,now);
  const d=portraitRect;
  renderer.setScissorTest(false);renderer.setViewport(0,0,stageWidth,stageHeight);renderer.clear();
  renderer.setViewport(d.x,d.y,d.w,d.h);
  renderer.setScissor(d.x,d.y,d.w,d.h);renderer.setScissorTest(true);
  renderer.render(companionScene,companionCamera);
  renderer.setScissorTest(false);renderer.setViewport(0,0,stageWidth,stageHeight);
}
let meadowAudio;
function meadowAmbience(){
  if(!audio||audio.state!=='running'||typeof audio.createBuffer!=='function')return;
  if(!meadowAudio){
    const samples=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate);
    const channel=samples.getChannelData(0),rng=seeded(564927);
    let low=0;
    for(let i=0;i<channel.length;i++){
      low=low*.965+(rng()-.5)*.035;
      channel[i]=low;
    }
    const wind=audio.createBufferSource(),filter=audio.createBiquadFilter(),level=audio.createGain();
    wind.buffer=samples;wind.loop=true;
    filter.type='lowpass';filter.frequency.value=460;
    level.gain.value=0;
    wind.connect(filter);filter.connect(level);level.connect(audio.destination);wind.start();
    meadowAudio={level,filter};
  }
  const outdoors=$('home').hidden&&!playPaused();
  const audible=profile.sound&&!document.hidden;
  const rain=outdoors?rainAmount.value:0;
  meadowAudio.filter.frequency.setTargetAtTime(470+rain*830,audio.currentTime,.4);
  const sway=.91+Math.sin(audio.currentTime*.64)*.09;
  const volume=audible?profile.volume*sway*(outdoors?.18+.17*rain:.09):0;
  meadowAudio.level.gain.setTargetAtTime(volume,audio.currentTime,.17);
}

function showHome(){
  stopInput();setGuide(-1);
  $('home').hidden=false;
  stage.dataset.farm='true';
  showFarmPanel('farm');resizeCompanion();if(dog) dressDog(dog);
  $('stage').inert=true;$('stage').setAttribute('aria-hidden','true');updateOrientation();
  updateHome();
  $('home-title').focus({preventScroll:true});
}
function showField(){
  $('home').hidden=true;
  stage.dataset.farm='false';updateGear(true);
  $('stage').inert=false;$('stage').removeAttribute('aria-hidden');updateOrientation();
  canvas.focus({preventScroll:true});
}
function openBook(trigger){
  populateChapters();
  openModal($('chapter-dialog'),trigger);
}
function bonusUnlocked(config){
  return Boolean(profile.records[config.id])||worldTrail(config.region).every(level=>level.bigFlock||level.trial||profile.records[level.id]);
}
function nextCampaignStep(){
  if(runMode!=='story')return -1;
  return levels.findIndex(level=>inCampaign(level)&&!profile.records[level.id]);
}

function missionChallenge(config){
  if(config.trial)return trialDetails(config);
  return config.bigFlock?'Sans chrono imposé · Une étoile sans aboyer, une autre sans affoler le troupeau.':
    'Étoiles bonus · '+timeLabel(config.seconds)+' ou moins · '+config.challenge;
}
function openBrief(index,trigger){
  const config=levels[index];
  if(!canOpenMission(config,pendingMode))return;
  pendingMission=index;
  $('brief-title').textContent=config.title;
  $('brief-place').textContent=config.trial?worldNames[config.region].name+' · Finale':config.bigFlock?worldNames[config.region].name+' · Grand troupeau':config.place;
  $('brief-text').textContent=config.description;
  $('brief-note').textContent=dogText(config.note);
  $('brief-challenge').textContent=missionChallenge(config);
  const alert=[config.lethalPack?'Chaque brebis doit survivre.':null,config.pastures>1?config.pastures+' pâtures':null].filter(Boolean).join(' · ');
  $('brief-risk').textContent=alert;$('brief-risk').hidden=!alert;
  $('brief-letter').textContent=config.dispatch||'';$('brief-letter').hidden=!config.dispatch;
  openModal($('brief-dialog'),trigger);
}
function startMission(index,mode=pendingMode){
  if(!gameReady||!canOpenMission(levels[index],mode))return;
  loadLevel(index);
  runMode=mode;missionEntered=true;
  if(inCampaign(levels[index]))profile.last=levels[index].id;
  saveProfile();
  wakeAudio();
  showField();
}
function openPause(){
  if(playPaused())return;
  const config=activeMission();
  $('pause-goal').textContent=dogText(config.description);
  const status=fieldSituation();
  $('pause-status').textContent=status;
  $('pause-status').hidden=!status;
  $('pause-challenge').hidden=chapter<0;
  $('pause-challenge').textContent=chapter<0?'':missionChallenge(config);
  $('pause-book').hidden=chapter<0;
  openModal($('pause-dialog'),$('pause'));
}
function extraStar(config,stats){
  switch(config.bonus){
    case 'park':return stats.hazards===0;
    case 'guard':return stats.raids===0;
    case 'quiet':return stats.barks===0;
    case 'twoBarks':return stats.barks<=2;
    case 'correct':return stats.wrong===0;
    case 'calm':return stats.panic===0;
    case 'noHelp':return stats.help===0;
    case 'dry':return stats.mud<12;
    case 'ice':return stats.ice<10;
    default:return false;
  }
}
function finish(){
  if(won||missionFailed)return;
  if(chapter<0){finishGuide();return;}
  won=true;stopInput();
  const config=activeMission();
  const record=profile.records[config.id],previousRepair=farmStage();
  const elapsed=runStats.time;
  const timeStar=config.trial?elapsed<config.trial.seconds:config.bigFlock?runStats.barks===0:elapsed<=config.seconds;
  const already=config.trial&&raceUnlocked(config.trial.dogId);
  const bonusStar=extraStar(config,runStats);
  const stars=1+Number(timeStar)+Number(bonusStar);
  profile.records[config.id]={stars:Math.max(stars,record?.stars||0),time:Math.min(elapsed,record?.time??Infinity)};
  const reward=(record?3:config.bigFlock?24:12)+Math.max(0,stars-(record?.stars||0))*4;
  profile.coins=Math.min(999999,profile.coins+reward);
  const plaid=config.id==='deux-troupeaux-aux-cretes'&&runStats.wrong===0&&!profile.owned.includes('plaid');
  if(plaid)profile.owned.push('plaid');
  if(inCampaign(config))profile.last=config.id;
  saveProfile();
  $('win-reward').textContent='+'+reward+' graines · '+profile.coins+' en réserve';
  $('win-title').textContent=config.trial?(timeStar?'Chrono battu':'Chrono dépassé'):config.bigFlock?'Grand troupeau à l’abri':'Mission réussie';
  $('win-text').textContent=config.trial?'Ton temps '+trialDuration(elapsed)+' · Objectif '+timeLabel(config.trial.seconds):
    dogText(config.victory)+' · '+timeLabel(elapsed);
  $('win-awards').innerHTML='';
  for(const [label,earned] of [['Tous les animaux à l’abri',true],[config.trial?'Terminer avant '+timeLabel(config.trial.seconds):config.bigFlock?'Aucun aboiement':'Terminer en '+timeLabel(config.seconds)+' ou moins',timeStar],[config.challenge,bonusStar]]){
    const row=document.createElement('li'),star=document.createElement('b'),text=document.createElement('span');
    row.dataset.earned=String(earned);
    star.setAttribute('aria-label',earned?'Étoile gagnée':'Étoile non obtenue');star.textContent=earned?'★':'☆';
    text.textContent=label;row.append(star,text);$('win-awards').append(row);
  }
  const next=nextCampaignStep();
  $('next').textContent=next<0?'Retour à la ferme':levels[next].trial?'Jouer la finale':levels[next].bigFlock?'Grand troupeau':'Mission suivante';
  $('replay').textContent=config.trial?'Réessayer le chrono':'Rejouer';
  const itinerary=$('win-unlock');
  const repair=farmStage()>previousRepair?repairs[farmStage()-1]:null;
  const rewards=[];
  if(repair)rewards.push(repair.title);
  if(plaid)rewards.push('Foulard à carreaux offert');
  if(config.trial&&timeStar&&!already)rewards.push(trialName(config)+' débloqué dans Chien');
  if(config.trial&&!timeStar&&!already)rewards.push('Bats le chrono pour débloquer le '+trialName(config)+'.');
  if(!rewards.length&&next>=0&&!record)rewards.push('À suivre · '+levels[next].title);
  itinerary.hidden=rewards.length===0;itinerary.textContent=rewards.join(' · ');
  setNote('Tous les animaux sont à l’abri.',4);
  soundEffect('win');openModal($('win-dialog'),canvas);
}
function populateChapters(){
  const container=$('chapter-list');
  container.innerHTML='';
  $('book-progress').textContent=completedCampaign()+' missions terminées sur '+levels.filter(inCampaign).length+'. Choisis la prochaine sortie.';
  let region=-1;
  levels.forEach((config,i)=>{
    if(config.side)return;
    if(config.region!==region){
      region=config.region;
      const separator=document.createElement('li');separator.className='region-label';separator.textContent=regionNames[region];container.append(separator);
    }
    const li=document.createElement('li'),button=document.createElement('button');
    button.type='button';
    if(i===chapter)button.setAttribute('aria-current','step');
    if(!canOpenMission(config,'mission'))button.disabled=true;
    const record=profile.records[config.id];
    button.innerHTML='<span class="chapter-index" aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+config.title+'</strong><small>'+config.label+(button.disabled?' · Termine ce biome':'')+'</small></span>'+(record?'<span class="mission-stars" aria-label="'+record.stars+' étoiles sur 3">'+'★'.repeat(record.stars)+'☆'.repeat(3-record.stars)+'</span>':'');
    button.onclick=()=>{
      $('chapter-dialog').close();
      openBrief(i,$('home').hidden?$('pause'):$('chapters'));
    };
    li.append(button);container.append(li);
  });
}
function bindMenu(){
  bindFarm();
  $('chapters').onclick=()=>{pendingMode='mission';openBook($('chapters'));};
  $('pause').onclick=openPause;
  $('hint').onclick=()=>{
    $('pause-dialog').close();
    showHint();
  };
  $('open-flock-map').onclick=openFieldMap;
  $('map-focus').onclick=()=>{
    fieldMapLocal=!fieldMapLocal;
    $('map-focus').setAttribute('aria-pressed',String(fieldMapLocal));
    $('map-focus').textContent=fieldMapLocal?'Toute la carte':'Autour du chien';
    drawMiniMap($('flock-map'));
  };
  $('interact').onclick=interact;
  $('sky-mode').onclick=changeWeather;
  $('bark').onclick=event=>{if(event.detail===0)bark();};
  $('sprint').onclick=event=>{
    if(playPaused()||event.detail!==0)return;
    sprintToggled=!sprintToggled;
    holdSprint(sprintToggled||sprintPointer!==null);
  };
  $('sound').onclick=toggleSound;
  $('recenter').onclick=recenterCamera;
  $('use-biscuit').onclick=useBiscuit;
  $('open-orders').onclick=openOrders;
  $('use-whistle').onclick=()=>{$('orders-dialog').close();useWhistle();};
  $('retry-after-loss').onclick=()=>{
    $('failure-dialog').close();startMission(chapter,runMode);
  };
  $('leave-after-loss').onclick=()=>$('failure-dialog').close();
  $('failure-dialog').addEventListener('close',()=>{if(missionFailed)showHome();});
  $('start-mission').onclick=()=>{$('brief-dialog').close();startMission(pendingMission);};
  $('resume').onclick=()=>$('pause-dialog').close();
  $('pause-book').onclick=()=>{
    $('pause-dialog').close();selectedWorld=activeMission().region;missionView='story';
    showHome();showFarmPanel('missions',true);
  };
  $('restart').onclick=()=>{$('pause-dialog').close();if(chapter<0)startLesson();else startMission(chapter,runMode);};
  $('replay').onclick=()=>{$('win-dialog').close();startMission(chapter,runMode);};
  $('home-button').onclick=()=>{$('pause-dialog').close();showHome();};
  $('next').onclick=()=>{
    $('win-dialog').close();
    const next=nextCampaignStep();
    showHome();
    if(next>=0){pendingMode='story';openBrief(next,$('farm-continue'));}
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
  const importedGear=Array.from(packGearModels.values()).flatMap(model=>model.parts);
  const geometries=new Set([...importedGear.map(part=>part.geometry),...Object.values(geo),...fieldGearGeometry.values(),...sheepGeometry.values(),...dogParts.map(part=>part.geometry),wovenGeometry,collarGeometry,collarTag]);
  const materials=new Set([...importedGear.map(part=>part.material),...paintMaterials.values(),...dogParts.map(part=>part.material),
    eyeMaterial,eyeLight,markerMat,shadowPaint,animalPaint,penBatch,blackIron,...timberMaterials.values(),...sheepMaterials.values(),...fieldGearMaterial.values(),wovenMaterial,...fabricPalette.values(),mossLeather,satchelPaint,collarMaterial,collarMetal]);
  const textures=new Set([washTexture,shadeTexture,penGrain,woolBump]);
  const skeletons=new Set();
  map.traverse(object=>{
    if(object.isInstancedMesh)object.dispose();
    if(object.isSkinnedMesh&&!skeletons.has(object.skeleton)){
      skeletons.add(object.skeleton);object.skeleton.dispose();
    }
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
  missionFailed=false;shepherdOrder=null;setFieldRisk('');
  chapter=i;guideMarker=null;setGuide(-1);weatherMode=0;won=storm=false;gameTime=0;barkTime=-10;stormAt=-1;hintUntil=-1;hintObject=null;nextCoach=0;
  stopInput();clearTimeout(toastId);
  resetGear();runStats=emptyRun();lastTimer=-1;lastInteractionUpdate=-1;
  $('toast').hidden=$('map-label').hidden=$('hint-compass').hidden=true;
  const config=activeMission();
  $('chapter-kicker').textContent=i<0?'Tutoriel':!config.side?worldNames[config.region].name+' · '+missionNumber(config)+' / '+worldTrail(config.region).length:worldNames[config.region].name+' · '+(config.bigFlock?'Bonus':levels.filter((level,index)=>level.region===config.region&&!level.bigFlock&&inCampaign(level)&&index<=i).length+' / '+levels.filter(level=>level.region===config.region&&!level.bigFlock&&inCampaign(level)).length);
  $('mission-title').textContent=config.title;
  setNote(config.note,10);
  $('weather').textContent=config.weather;$('weather-icon').textContent=config.icon;
  $('stage').dataset.level=String(chapter);
  $('stage').dataset.flock=String(Boolean(config.bigFlock));
  random=seeded(config.terrainSeed||config.seed);
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
  const spawn=blocked(sx,sz,.30)?grid[nearestGrid({x:sx,z:sz})]:null;
  dog=makeMover('dog',spawn?.x??sx,spawn?.z??sz);
  dog.heading=heading;
  cameraReady=false;
  herdParts=config.bigFlock?makeBonusBatches(config.animals.length):null;
  if(config.terrainSeed)random=seeded(config.seed);
  const placed=[];
  const component=grid[nearestGrid(dog)]?.region;
  animals=config.animals.map(([type,x,z,,kind,originGroup],index)=>{
    if(config.pastures||config.dangers){
      ({x,z}=accessibleSpawn(x,z,placed,component));
      placed.push(point(x,z));
    }
    const variant=kind==='lamb'?3:index%7===4?3:index%6===3?2:index%2;
    const m=makeMover(type,x,z,variant,config.bigFlock?index:null);
    if(config.bigFlock)m.originGroup=originGroup;
    if(config.region>=11)dressFantasySheep(m,config.biome,index);
    m.relayStage=0;
    m.valleyLamb=config.region>=6&&kind==='lamb';
    if(m.valleyLamb){m.trust=0;m.bonded=false;}
    if(blocked(m.x,m.z,.43)){
      const node=grid[nearestGrid(m)];
      if(node){m.x=node.x;m.z=node.z;}
    }
    m.origin=point(m.x,m.z);
    m.crossed=Boolean(config.stream&&m.x>config.stream.x+config.stream.width*.5+.2);
    if(m.crossed)runStats.crossed++;
    return m;
  });
  rain=makeRain();airborne=makeAirSeeds();shadowStamp=-1;weatherName='';animateWeather(0,true);
  tapMarker=mesh(props,'ring',markerMat,0,0,0,.45,.45,1);
  tapMarker.rotation.x=-Math.PI/2;tapMarker.visible=false;
  const pulseMaterial=new THREE.MeshBasicMaterial({color:'#fff0b1',transparent:true,opacity:.66,side:THREE.DoubleSide,depthWrite:false});
  barkRing=new THREE.Mesh(geo.ring.clone(),pulseMaterial);
  barkRing.frustumCulled=false;barkRing.visible=false;props.add(barkRing);
  startGathering(config);
  placeWolves(config);
  updateDangers(.35);refreshOrder();
  animateMover(dog,0);animals.forEach(m=>animateMover(m,0));flushFlockBatches();
  renderCounts();refreshTimer();lastMapTime=-1;resize();drawMiniMap();updateInteraction();
}

function bindInputs(){
  bindMenu();
  document.addEventListener('keydown',event=>{
    if(playPaused()||event.metaKey||event.ctrlKey||event.altKey)return;
    if(event.code==='KeyE'&&!event.repeat){if(interact())event.preventDefault();return;}
    if(event.code==='KeyJ'||event.code==='KeyL'){
      cameraInput.yaw=wrapAngle(cameraInput.yaw+(event.code==='KeyJ'?.27:-.27));event.preventDefault();return;
    }
    if(event.code==='KeyF'&&!event.repeat){openOrders();event.preventDefault();return;}
    if(event.code==='KeyR'&&!event.repeat){recenterCamera();event.preventDefault();return;}
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
  document.addEventListener('visibilitychange',()=>{frameAt=0;if(document.hidden)stopInput();meadowAmbience();});
  bindTouchControls();
  new ResizeObserver(resize).observe(stage);
}
let frameAt=0;
function frame(now){
  requestAnimationFrame(frame);
  const elapsed=frameAt?clamp((now-frameAt)/1000,0,.25):0;
  frameAt=now;
  if(document.hidden)return;
  if(Math.floor(now/240)!==Math.floor((now-elapsed*1000)/240))meadowAmbience();
  if(!$('home').hidden){
    renderCompanion(now);
    return;
  }
  if(playPaused())return;
  const dt=clamp(elapsed,.001,.049);
  {
    runStats.time+=elapsed;
    gameTime+=dt;
    steer(dt);handleFlock(dt);
    if(missionFailed)return;
    animateMover(dog,gameTime,dt);
    animals.forEach(m=>animateMover(m,gameTime,dt));
    flushFlockBatches();
    updatePulse();
    $('bark').dataset.cooling=String(gameTime-barkTime<.94);

    refreshTimer();updateGates(dt);updateGear();
    if(gameTime-lastInteractionUpdate>.11){lastInteractionUpdate=gameTime;updateInteraction();refreshOrder();}
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
  advanceGuide();updateHint();
  if(gameTime-lastMapTime>.12){
    drawMiniMap();lastMapTime=gameTime;
    for(const b of grassBatches){
      const p=b.boundingSphere.center;
      b.visible=Math.hypot(p.x-dog.x,p.z-dog.z)<(b.geometry===geo.blade?82:114);
    }
  }
  updateAdaptiveQuality(elapsed);
  renderer.render(scene,camera);
}

const climates=[
  {name:'Temps clair',icon:'☀',high:'#6d9fbb',low:'#ecdfa9',cloud:'#fff0d2',shade:'#a6b8bf',fog:'#e7dfba',sun:'#fff1d2',ambient:'#cededb',earth:'#ab996b',direction:[-.48,.55,-.67],power:3.35,tint:1.68,rain:0,wind:.53},
  {name:'Heure dorée',icon:'☀',high:'#6497b6',low:'#ffba7b',cloud:'#ffdec4',shade:'#9a86ad',fog:'#e4b997',sun:'#ffd3a3',ambient:'#d3dde1',earth:'#a79c78',direction:[-.36,.183,-.90],power:3.39,tint:2.03,rain:0,wind:.70},
  {name:'Pluie de prairie',icon:'≋',high:'#687f99',low:'#b4c0bd',cloud:'#b2bebf',shade:'#6e8495',fog:'#b2bfb7',sun:'#e0e2d4',ambient:'#b6cadd',earth:'#809884',direction:[-.43,.39,-.79],power:.86,tint:2.35,rain:1,wind:1.68}
  ,{name:'Brume de forêt',icon:'≋',high:'#88a9ad',low:'#c7dcc9',cloud:'#f0e8d1',shade:'#89a6a1',fog:'#b8cdbf',sun:'#f6e5b8',ambient:'#c1dad0',earth:'#7f8761',direction:[-.61,.33,-.70],power:2.15,tint:1.75,rain:0,wind:.36,mist:.0031}
  ,{name:'Brise marine',icon:'☀',high:'#609bb9',low:'#dfead0',cloud:'#f9eacc',shade:'#a3b9bf',fog:'#d9ddbe',sun:'#fff1c4',ambient:'#c7dfde',earth:'#bbac76',direction:[-.49,.59,-.69],power:3.72,tint:1.65,rain:0,wind:1.13}
  ,{name:'Neige légère',icon:'❄',high:'#799cb9',low:'#dbe6ec',cloud:'#f9efe2',shade:'#a8b9cf',fog:'#d4e4eb',sun:'#eef3ff',ambient:'#c1d5ed',earth:'#a7bcc6',direction:[-.39,.36,-.84],power:2.75,tint:1.64,rain:0,wind:.58,mist:.0019}
, {name:'Voiles de brume',icon:'≋',high:'#8bbad6',low:'#dce4ee',cloud:'#f6f5eb',shade:'#adc7da',fog:'#d9e8e9',sun:'#fff5da',ambient:'#d5eef5',earth:'#a0b7ad',direction:[-.41,.52,-.72],power:2.55,tint:1.75,rain:0,wind:.79,mist:.0018}
  , {name:'Cendres au couchant',icon:'☀',high:'#807a9c',low:'#e7ae8d',cloud:'#ebc6ae',shade:'#998491',fog:'#c0a99e',sun:'#ffd4a2',ambient:'#d2c8e8',earth:'#a18174',direction:[-.35,.25,-.89],power:3.05,tint:1.92,rain:0,wind:.71,mist:.0007}
, {name:'Lumière de la chambre',icon:'☀',high:'#dbcfbe',low:'#f0d7b4',cloud:'#f6e1bb',shade:'#b6ad98',fog:'#d6c3a6',sun:'#ffe2b7',ambient:'#ead7c0',earth:'#a89272',direction:[-.48,.74,-.45],power:2.55,tint:1.75,rain:0,wind:.23}
  , {name:'Aube des nuages',icon:'☀',high:'#a1b6d6',low:'#e9c9b9',cloud:'#f8e7d4',shade:'#aea9c5',fog:'#d4d7de',sun:'#ffe2ba',ambient:'#dfe3f4',earth:'#a9baa1',direction:[-.45,.45,-.76],power:2.86,tint:1.68,rain:0,wind:.55,mist:.0012}
  , {name:'Soleil de papier',icon:'☀',high:'#94b1ad',low:'#e9ccb0',cloud:'#f6ddbb',shade:'#afa5a6',fog:'#dfceb8',sun:'#f5d493',ambient:'#e6dfc7',earth:'#ad9678',direction:[-.48,.48,-.70],power:2.92,tint:1.62,rain:0,wind:1.0}
  , {name:'Nuit des lucioles',icon:'☾',high:'#283353',low:'#747794',cloud:'#818aa8',shade:'#363e5b',fog:'#777289',sun:'#b4c6ea',ambient:'#929ab9',earth:'#6d6478',direction:[-.24,.54,-.74],power:1.65,tint:1.9,rain:0,wind:.38}
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
    uniforms:skyUniforms,side:THREE.BackSide,fog:false,depthWrite:false,toneMapped:false,
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
        float rise=smoothstep(-.08,.54,n.y);
        vec3 sky=mix(horizon,zenith,rise);
        float horizonLayer=exp(-pow((n.y-.045)*13.0,2.0));
        sky=mix(sky,mix(horizon,cloudLight,.34),horizonLayer*.50);
        float lightAngle=max(dot(n,sunDir),0.0);
        sky+=vec3(.31,.155,.057)*pow(lightAngle,11.0)*(1.0-rainAmount);
        vec2 drift=vec2(windClock*.015*breezeStrength,windClock*.003);
        vec2 q=n.xz/(max(n.y,.02)+.24)*3.08+drift;
        q=vec2(q.x*.90+q.y*.16,q.y*1.14);
        q+=vec2(.52*pigment(q*1.1),.37*pigment(q*.82+8.2));
        float cloud=washCloud(q);
        float contour=smoothstep(.422-.090*rainAmount,.597-.078*rainAmount,cloud);
        contour*=smoothstep(-.037,.126,n.y);
        vec3 wash=mix(cloudLight,cloudBase,smoothstep(.47,.72,cloud)*.67);
        wash+=vec3(.23,.105,.04)*pow(lightAngle,8.0)*(1.0-rainAmount);
        float cloudEdge=smoothstep(.33,.56,cloud)-smoothstep(.56,.73,cloud);
        wash=mix(wash,cloudLight,cloudEdge*.27*(1.0-rainAmount));
        sky=mix(sky,wash,contour*(.78+.17*rainAmount));
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
  if(floodIsRising())return 2;
  return weatherMode?weatherMode-1:storm&&gameTime-stormAt<26?activeMission().biome==='snow'?5:2:activeMission().climate??(activeMission().region===2?0:1);
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
  scene.fog.density=mix(scene.fog.density,.00466+rainAmount.value*.0039+(preset.mist||0),amount);
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
  const snow=activeMission().biome==='snow';
  const size=snow?320:94,points=new Float32Array(size*3),extras=new Float32Array(size);
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
        p.y=${snow?'mod(p.y-windClock*(.28+seed*.37),8.0)':'p.y+sin(windClock*(.67+seed)+seed*62.0)*.57'};
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
        gl_FragColor=vec4(${snow?'0.96,0.98,1.0':'1.0,.854,.55'},seed*flicker*${snow?'.96':'.73'}*(1.0-rainAmount));
      }`
  });
  const seeds=new THREE.Points(g,m);seeds.frustumCulled=false;map.add(seeds);
  return seeds;
}
function changeWeather(){
  weatherMode=(weatherMode+1)%(climates.length+1);
  $('sky-mode').textContent=weatherMode?climates[weatherMode-1].name:'Météo automatique';
}

let guideStep=-1,guideOrigin,guideYaw,guidePitch,guideMarker;
const instructions=[
  ['Avance de quelques pas','Sur téléphone, pousse le joystick. Au clavier, utilise les flèches.'],
  ['Regarde autour de toi','Glisse sur la moitié droite de l’écran, ou utilise J et L au clavier.'],
  ['Ramène le mouton','Contourne-le. Place-toi derrière lui et avance au pas vers la bergerie.']
];
function showLessonIntro(){
  if(!profile.tutorial)openModal($('lesson-intro'),$('farm-continue'));
}
function setGuide(step){
  guideStep=step;
  $('tutorial-coach').hidden=step<0;
  stage.dataset.tutorial=step<0?'':String(step);
  if(guideMarker)guideMarker.visible=step===2;
  if(step<0)return;
  $('tutorial-step').textContent=(step+1)+' / '+instructions.length;
  $('tutorial-title').textContent=instructions[step][0];
  $('tutorial-help').textContent=instructions[step][1];
  if(step===1){guideYaw=cameraYaw;guidePitch=cameraElevation;}
}
function startLesson(){
  if(!gameReady)return;
  $('lesson-intro').close();
  missionEntered=false;runMode='tutorial';
  loadLevel(-1);
  guideOrigin=point(dog.x,dog.z);
  const pen=pens.sheep;
  guideMarker=mesh(props,'ring',new THREE.MeshBasicMaterial({color:'#faedbd',transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false}),
    pen.left-.14,groundY(pen.left,pen.z)+.046,pen.z,.94,.94,1);
  guideMarker.rotation.x=-Math.PI/2;
  setGuide(0);showField();
}
function advanceGuide(){
  if(chapter!==-1)return;
  if(guideMarker&&guideMarker.visible)guideMarker.material.opacity=.58+Math.sin(gameTime*3.1)*.21;
  if(guideStep===0&&distance(dog,guideOrigin)>2.2)setGuide(1);
  else if(guideStep===1&&(Math.abs(wrapAngle(cameraYaw-guideYaw))>.24||Math.abs(cameraElevation-guidePitch)>.13))setGuide(2);
}
function finishGuide(){
  won=true;setGuide(-1);
  if(profile.tutorial!=='done'){
    profile.coins=Math.min(999999,profile.coins+8);
    profile.tutorial='done';saveProfile();
    $('lesson-bonus').textContent='+8 graines';
  }else $('lesson-bonus').textContent='';
  soundEffect('win');openModal($('lesson-done'),canvas);
}
function skipLesson(){
  if(!profile.tutorial){profile.tutorial='skipped';saveProfile();}
  $('lesson-intro').close();
}
function bindTutorial(){
  $('lesson-start').onclick=startLesson;
  $('lesson-skip').onclick=skipLesson;
  $('repeat-lesson').onclick=startLesson;
  $('lesson-home').onclick=()=>$('lesson-done').close();
  $('lesson-done').addEventListener('close',()=>{showHome();showFarmPanel('missions',true);});
  $('lesson-intro').addEventListener('cancel',event=>{event.preventDefault();skipLesson();});
  $('lesson-intro').querySelector('[data-close]').addEventListener('click',skipLesson);
}

async function start(){
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    applyQuality(profile.quality);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.19;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate=false;
    scene=new THREE.Scene();initializeLights();
    camera=new THREE.PerspectiveCamera(55,1,.07,445);
    loadingState('Chargement du chien et de ses textures',.35);
    await Promise.all([prepareTextures(),prepareDogModel()]);
    buildCompanion();
    loadingState('Ouverture de la ferme',.72);
    bindInputs();resize();
    stage.setAttribute('aria-busy','false');
    gameReady=true;$('farm-continue').disabled=false;
    showHome();loadingState('La ferme est prête',1);
    const revealFarm=()=>{$('boot').hidden=true;$('home').inert=false;$('home-title').focus({preventScroll:true});showLessonIntro();};
    setTimeout(revealFarm,prefersStill?0:Math.max(0,630-performance.now()));
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
    $('farm-continue').textContent='Affichage 3D indisponible';
    $('home-progress').textContent='Ouvre le jeu dans un navigateur compatible WebGL.';
    loadingState('Affichage 3D indisponible sur cet appareil',0);
  }
}
$('lesson-intro').style.setProperty('--atlas','url("'+WORLDS_URL+'")');
$('home').style.setProperty('--atlas','url("'+WORLDS_URL+'")');
$('home').style.setProperty('--valley-atlas','url("'+VALLEYS_URL+'")');
$('home').style.setProperty('--dream-atlas','url("'+DREAMS_URL+'")');
$('home').style.setProperty('--fantasy-atlas','url("'+FANTASY_URL+'")');
$('home').style.setProperty('--cover','url("'+COVER_URL+'")');
$('boot').style.setProperty('--cover','url("'+COVER_URL+'")');
$('home').style.setProperty('--items','url("'+ITEMS_URL+'")');
stage.style.setProperty('--cover','url("'+COVER_URL+'")');stage.dataset.farm='true';
stage.inert=true;stage.setAttribute('aria-hidden','true');
start();
