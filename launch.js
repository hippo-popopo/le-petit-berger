(() => {
  let installRequest=null;
  const install=document.getElementById('install');
  const update=document.getElementById('update-game');
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();installRequest=event;install.hidden=false;
  });
  install.addEventListener('click',async()=>{
    const request=installRequest;
    if(!request)return;
    installRequest=null;install.hidden=true;
    try{await request.prompt();}catch{}
  });
  window.addEventListener('appinstalled',()=>{installRequest=null;install.hidden=true;});
  update.addEventListener('click',()=>location.reload());
  if('serviceWorker' in navigator&&window.isSecureContext&&location.protocol!=='file:'){
    const version=document.querySelector('meta[name="berger-version"]')?.content;
    navigator.serviceWorker.addEventListener('message',event=>{
      if(event.source===navigator.serviceWorker.controller&&event.data?.type==='berger-version'){
        update.hidden=event.data.version===version;
      }
    });
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      navigator.serviceWorker.controller?.postMessage('berger-version');
    });
    navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>{});
  }
})();
