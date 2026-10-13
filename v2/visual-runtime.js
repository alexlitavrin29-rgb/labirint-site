(() => {
 const desktop=matchMedia('(min-width:761px) and (min-height:600px) and (prefers-reduced-motion:no-preference)');
 const connection=navigator.connection;
 let loaded=false;
 const versioned=name=>{
  const url=new URL(name,document.baseURI),revision=document.documentElement.dataset.release;
  if(revision)url.searchParams.set('v',revision);
  return url.href;
 };
 function sync(){
  const light=!desktop.matches||connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType);
  const mode=light?'light':'full';
  if(document.documentElement.dataset.renderMode!==mode){
   document.documentElement.dataset.renderMode=mode;
   window.dispatchEvent(new Event('visualmodechange'));
  }
  if(light||loaded)return;
  loaded=true;
  // Phones keep the volume's lightweight visual without fetching a 3D engine or model.
  Promise.allSettled([import(versioned('./hero-object.js')),import(versioned('./profile-volume.js'))]);
 }
 desktop.addEventListener('change',sync);connection?.addEventListener('change',sync);sync();
})();
