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
    const controlled=Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(controlled)update.hidden=false;
    });
    navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>{});
  }
})();
