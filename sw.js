const scope=new URL(self.registration.scope);
const prefix='le-petit-berger:'+scope.pathname+':';
const cacheName=prefix+'19af6ce8ba73e';
const entries=["index.html", "manifest.webmanifest", "three-2d31b9c81aca6.min.js?v=19af6ce8ba73e", "assets-c1b904e2c9319.js?v=19af6ce8ba73e", "game-19af6ce8ba73e.js?v=19af6ce8ba73e", "launch-19af6ce8ba73e.js?v=19af6ce8ba73e", "Border_Collie-maillage-747618617e554.bin.gz", "Border_Collie-texture-2-b47b9d6aa2574.png", "Border_Collie-texture-0-15012d920597e.png", "Border_Collie-mouvements-58cc0df1ed0c6.bin.gz", "Border_Collie-noir_blanc-24cdf40ce647d.jpg", "01_collier_cuir-maillage-50153dc47bb61.bin.gz", "01_collier_cuir-texture-1-45be3ac264efd.png", "01_collier_cuir-texture-0-300330267b4ab.png", "01_collier_cuir-texture-2-d0ec5df4f3533.png", "02_collier_nylon-maillage-649c69536d0e4.bin.gz", "02_collier_nylon-texture-1-988e0eb46d9f3.png", "02_collier_nylon-texture-0-8ccae0490de50.png", "02_collier_nylon-texture-2-cbf46cd6ace34.png", "03_bandana-maillage-b3d6536aad9ff.bin.gz", "03_bandana-texture-1-355958442c264.png", "03_bandana-texture-0-47e92f959e575.png", "03_bandana-texture-3-6f283ac74a404.png", "03_bandana-texture-2-8ccae0490de50.png", "04_harnais_y-maillage-314421b425098.bin.gz", "04_harnais_y-texture-1-a9b1c1bc52c45.png", "04_harnais_y-texture-0-8ccae0490de50.png", "04_harnais_y-texture-3-d91c74ff85ec2.png", "04_harnais_y-texture-2-aab1f8e35fbd3.png", "10_impermeable-maillage-d17295364ca60.bin.gz", "10_impermeable-texture-1-3269baf70b74a.png", "10_impermeable-texture-0-e42252e42d38f.png", "10_impermeable-texture-2-0ad4e33f121fe.png", "11_sacoches-maillage-73be7c2064c3b.bin.gz", "11_sacoches-texture-1-d91c74ff85ec2.png", "11_sacoches-texture-0-aab1f8e35fbd3.png", "11_sacoches-texture-2-fd6317d0b4f4b.png", "11_sacoches-texture-4-59cf2bedeac45.png", "11_sacoches-texture-3-8ccae0490de50.png", "icon-180.png", "icon-192.png", "icon-512.png"].map(path=>new URL(path,scope).href);
const optional=new Set(["Berger_Australien-bleu_merle_cuivre-44f36156a2a68.jpg", "Berger_Australien-maillage-723c9502a0228.bin.gz", "Berger_Australien-mouvements-09d220f52bb5c.bin.gz", "Berger_Australien-noir_bicolore-41949d345925f.jpg", "Berger_Australien-noir_tricolore-3cdd3b735aaad.jpg", "Berger_Australien-rouge_merle-f29d926eb6487.jpg", "Berger_Australien-rouge_tricolore-762d8410789be.jpg", "Berger_Australien-texture-0-461c65f2c55b9.png", "Berger_Australien-texture-2-33c512f12dc9c.png", "Berger_des_Shetland-bi_bleu-3c5928b2f6519.jpg", "Berger_des_Shetland-bi_noir-5fa5bb834d5e5.jpg", "Berger_des_Shetland-bleu_merle_feu-5bebfecb7e043.jpg", "Berger_des_Shetland-maillage-16f40cef9dad2.bin.gz", "Berger_des_Shetland-mouvements-b65b4519368a6.bin.gz", "Berger_des_Shetland-noir_tricolore-5de3423a37484.jpg", "Berger_des_Shetland-sable_blanc-cf99f8f22137d.jpg", "Berger_des_Shetland-texture-0-8e8c3aef953e5.png", "Berger_des_Shetland-texture-2-0fe8c987c4304.png", "Border_Collie-bleu_merle-f3941508a6a2b.jpg", "Border_Collie-chocolat_blanc-ea6f9ffc09213.jpg", "Border_Collie-noir_tricolore-03de745ce19ff.jpg", "Border_Collie-rouge_merle-3e9f0ae54084c.jpg", "Border_Collie-rouge_tricolore-898089b7f6d94.jpg"].map(path=>new URL(path,scope).href));
const home=new URL('index.html',scope).href;
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(cacheName);
    await cache.addAll(entries.map(url=>new Request(url,{cache:'reload'})));
    const shell=await cache.match(home);
    if(!shell||(await shell.text()).includes('name="berger-version" content="19af6ce8ba73e"')===false)
      throw new Error('La page de cette version n’est pas encore disponible.');
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(prefix)&&key!==cacheName).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{
  if(event.data==='berger-version')event.source?.postMessage({type:'berger-version',version:'19af6ce8ba73e'});
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==scope.origin)return;
  const navigation=request.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===new URL(home).pathname);
  const sameAsset=entries.includes(url.href)||optional.has(url.href);
  if(!navigation&&!sameAsset)return;
  event.respondWith((async()=>{
    const cache=await caches.open(cacheName);
    if(sameAsset&&!navigation){
      const cached=await cache.match(request);
      if(cached)return cached;
    }
    try{
      const response=await fetch(request,{cache:'no-cache'});
      if(response.ok&&(!navigation||(await response.clone().text()).includes('name="berger-version" content="19af6ce8ba73e"'))){
        await cache.put(navigation?home:request,response.clone()).catch(()=>{});
        return response;
      }
      return await cache.match(navigation?home:request)||response;
    }catch{
      return await cache.match(navigation?home:request)||Response.error();
    }
  })());
});
