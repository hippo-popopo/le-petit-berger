const scope=new URL(self.registration.scope);
const prefix='le-petit-berger:'+scope.pathname+':';
const cacheName=prefix+'daa290d6355a9';
const entries=["index.html", "manifest.webmanifest", "three.min.js", "assets.js", "game.js", "launch.js", "icon-180.png", "icon-192.png", "icon-512.png"].map(path=>new URL(path,scope).href);
const home=new URL('index.html',scope).href;
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(cacheName);
    await cache.addAll(entries);
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
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==scope.origin)return;
  const navigation=request.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===new URL(home).pathname);
  const sameAsset=entries.includes(url.href);
  if(!navigation&&!sameAsset)return;
  event.respondWith((async()=>{
    const cache=await caches.open(cacheName);
    try{
      const response=await fetch(request,{cache:'no-cache'});
      if(response.ok){
        await cache.put(navigation?home:request,response.clone()).catch(()=>{});
        return response;
      }
      return await cache.match(navigation?home:request)||response;
    }catch{
      return await cache.match(navigation?home:request)||Response.error();
    }
  })());
});
