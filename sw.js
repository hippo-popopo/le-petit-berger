const scope=new URL(self.registration.scope);
const prefix='le-petit-berger:'+scope.pathname+':';
const cacheName=prefix+'ffebba83ab8e2';
const entries=["index.html", "manifest.webmanifest", "three-9ecebf89689fb.min.js?v=ffebba83ab8e2", "assets-2e7b3962e7699.js?v=ffebba83ab8e2", "game-ffebba83ab8e2.js?v=ffebba83ab8e2", "launch-ffebba83ab8e2.js?v=ffebba83ab8e2", "icon-180.png", "icon-192.png", "icon-512.png"].map(path=>new URL(path,scope).href);
const home=new URL('index.html',scope).href;
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(cacheName);
    await cache.addAll(entries.map(url=>new Request(url,{cache:'reload'})));
    const shell=await cache.match(home);
    if(!shell||(await shell.text()).includes('name="berger-version" content="ffebba83ab8e2"')===false)
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
  if(event.data==='berger-version')event.source?.postMessage({type:'berger-version',version:'ffebba83ab8e2'});
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
    if(sameAsset&&!navigation){
      const cached=await cache.match(request);
      if(cached)return cached;
    }
    try{
      const response=await fetch(request,{cache:'no-cache'});
      if(response.ok&&(!navigation||(await response.clone().text()).includes('name="berger-version" content="ffebba83ab8e2"'))){
        await cache.put(navigation?home:request,response.clone()).catch(()=>{});
        return response;
      }
      return await cache.match(navigation?home:request)||response;
    }catch{
      return await cache.match(navigation?home:request)||Response.error();
    }
  })());
});
