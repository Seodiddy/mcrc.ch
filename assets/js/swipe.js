// Mobile: swipe left/right on a product page to move to the next/previous product.
// Uses cross-document View Transitions where supported (old and new page slide together);
// otherwise a quick fade, so no empty strip is ever shown.
(()=>{
  const order=['coolzoone','performance-concierge','energylounger','smart-touch','hydration-h2','human-regenerator'];
  const cur=order.indexOf(location.pathname.split('/').pop().replace('.html',''));
  const get=()=>{try{return sessionStorage.getItem('mcrcSwipe')}catch(e){return null}};
  const set=v=>{try{v?sessionStorage.setItem('mcrcSwipe',v):sessionStorage.removeItem('mcrcSwipe')}catch(e){}};
  const vt='onpageswap' in window;
  addEventListener('pagereveal',e=>{const d=get();if(d&&e.viewTransition)e.viewTransition.types.add(d);set(null)});
  addEventListener('pageswap',e=>{const d=get();if(d&&e.viewTransition)e.viewTransition.types.add(d)});
  if(cur<0||!matchMedia('(hover:none)').matches)return;
  let x0=0,y0=0,t0=0,ok=false;
  addEventListener('touchstart',e=>{if(e.touches.length>1){ok=false;return}
    ok=!e.target.closest('.car-band,.pc-hero-visual,input,textarea,select,[data-noswipe]');
    const p=e.touches[0];x0=p.clientX;y0=p.clientY;t0=Date.now()},{passive:true});
  addEventListener('touchend',e=>{if(!ok)return;ok=false;
    const p=e.changedTouches[0],dx=p.clientX-x0,dy=p.clientY-y0;
    if(Math.abs(dx)<70||Math.abs(dy)>Math.abs(dx)*.55||Date.now()-t0>800)return;
    const dir=dx<0?'next':'prev',n=(cur+(dir==='next'?1:-1)+order.length)%order.length,url=order[n]+'.html';
    set(dir);
    if(vt||matchMedia('(prefers-reduced-motion:reduce)').matches){location.href=url;return}
    const b=document.body;b.style.transition='opacity .16s ease';b.style.opacity='0';setTimeout(()=>{location.href=url},140)},{passive:true});
  addEventListener('pageshow',e=>{if(e.persisted)document.body.style.opacity=''});
})();
