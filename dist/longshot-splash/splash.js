/* Long Shot Studios Splash Screen. Copy this folder intact into your project. */
(function () {
'use strict';
const assetBase = new URL('./', document.currentScript.src);
// The opening is a constant-width slot around the arrow, so both rings clear it evenly.
function longshotOpenRingPath(radius){
 const angle=Math.atan2(35-129,367-260),halfAngle=Math.asin(10/radius);
 const point=angle=>[(260+radius*Math.cos(angle)).toFixed(2),(129+radius*Math.sin(angle)).toFixed(2)];
 const [startX,startY]=point(angle-halfAngle),[endX,endY]=point(angle+halfAngle);
 return `M${startX} ${startY} A${radius} ${radius} 0 1 0 ${endX} ${endY}`;
}

function longshotClosedRing(radius){
 const angle=Math.atan2(35-129,367-260),halfAngle=Math.asin(10/radius);
 const circumference=(2*Math.PI*radius).toFixed(3),gap=(2*radius*halfAngle).toFixed(3);
 const visible=(Number(circumference)-Number(gap)).toFixed(3);
 const rotation=((angle+halfAngle)*180/Math.PI).toFixed(3);
 return `<circle class="longshot-ring" cx="260" cy="129" r="${radius}" transform="rotate(${rotation} 260 129)" style="--ring-length:${circumference};--ring-visible:${visible};--ring-gap:${gap}"/>`;
}


function brandArt(id,style='original'){
 return '<div class="brand-art ink-light'+(style==='silhouette'?' brand-silhouette':'')+' longshot-art"><img class="longshot-wordmark" src="'+new URL('assets/studios/longshot-wordmark.svg',assetBase).href+'" alt="Longshot Studios" decoding="async"><svg class="longshot-target" viewBox="0 0 554 331" aria-hidden="true"><g class="longshot-target-before">'+longshotClosedRing(75)+longshotClosedRing(38)+'<circle class="longshot-bullseye" cx="260" cy="129" r="10"/></g><g class="longshot-target-after"><path d="'+longshotOpenRingPath(75)+'"/><path d="'+longshotOpenRingPath(38)+'"/><circle class="longshot-bullseye" cx="260" cy="129" r="10"/></g></svg><svg class="longshot-projectile" viewBox="0 0 554 331" aria-hidden="true"><g class="longshot-fletching"><path d="M329 42 367 11 369 12 369 35 330 69Z"/><path d="M334 69 369 35 393 39 359 70Z"/></g><path class="longshot-shaft" d="M260 129 369 34"/><path class="longshot-nock" d="M369 34 379 25"/></svg><i class="longshot-impact" aria-hidden="true"></i></div>';
}
function playSplash(id='longshot',style='original',{ready=Promise.resolve(),sound:enabledSound=true,soundVolume=.8,darkMode=document.documentElement.dataset.darkMode==='true',onReveal}={}){
 const b=['longshot','LONGSHOT',false];
 document.querySelector('.studio-splash')?.dispatchEvent(new Event('dismiss'));
 return new Promise(resolve=>{
   const oldFocus=document.activeElement;
   const root=document.documentElement;
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||root.dataset.motion==='off';
   const dialog=document.createElement('dialog');
   dialog.className='studio-splash '+(style==='silhouette'?'splash-mono':darkMode?'splash-dark':'splash-light');
   dialog.setAttribute('aria-label',b[1]+' Studios opening');
   dialog.innerHTML='<div class="splash-stage">'+brandArt(id,style)+'</div>';
   document.body.append(dialog);
   const timers=new Set(),animations=new Set(),frames=new Set();
   let done=false,revealed=false;
   let splashAudioContext;
   const decodedSounds=new Map();
   const sound=(file,volume)=>{
     if(!enabledSound||id!=='longshot'||typeof Audio!=='function')return null;
     try{
       const url=new URL('./assets/'+file,assetBase).href;
       // Native splash effects use Web Audio's ambient routing, never a media
       // element that could switch the web view into silent-switch bypass.
       if(window.Capacitor?.isNativePlatform?.()) {
         splashAudioContext ||= new (window.AudioContext||window.webkitAudioContext)();
         const context=splashAudioContext;
         const level=Math.min(1,volume*Math.max(0,Math.min(1,Number.isFinite(soundVolume)?soundVolume:.8))*1.5);
         if(!decodedSounds.has(url))decodedSounds.set(url,fetch(url).then(r=>r.arrayBuffer()).then(data=>context.decodeAudioData(data)).catch(()=>null));
         const buffer=decodedSounds.get(url);
         let source;
         return {ready:buffer,currentTime:0,async play(){
           if(context.state!=='running')await context.resume();
           const decoded=await buffer;if(!decoded||done||context.state!=='running')return;
           source=context.createBufferSource();const gain=context.createGain();
           source.buffer=decoded;gain.gain.value=level;source.connect(gain);gain.connect(context.destination);
           source.onended=()=>{source.disconnect();gain.disconnect();};source.start();
         },pause(){try{source?.stop();}catch{}}};
       }
       const audio=new Audio(url);
       audio.preload='auto';audio.volume=Math.min(1,volume*Math.max(0,Math.min(1,Number.isFinite(soundVolume)?soundVolume:.8))*1.5);audio.load?.();
       return audio;
     }catch{return null;}
   };
   const swishes=[.36,.41,.48].map(volume=>sound('longshot-arrow-swish.mp3',volume));
   const impact=sound('longshot-arrow-impact.mp3',.58);
   function playSound(audio){
     if(done||!audio)return;
     try{audio.currentTime=0;audio.play()?.catch?.(()=>{});}catch{}
   }
   const wait=ms=>new Promise(next=>{const timer=setTimeout(()=>{timers.delete(timer);next();},ms);timers.add(timer);});
   const frame=()=>new Promise(next=>{const id=requestAnimationFrame(()=>{frames.delete(id);next();});frames.add(id);});
   function revealPage(){
     if(!revealed){revealed=true;onReveal?.();}
     clearTimeout(window.splashStartupTimeout);
     root.removeAttribute('data-splash-pending');
   }
   function close(){
     if(done)return;done=true;
     timers.forEach(clearTimeout);frames.forEach(cancelAnimationFrame);animations.forEach(animation=>animation.cancel());
     for(const audio of [...swishes,impact])if(audio)try{audio.pause();audio.currentTime=0;}catch{}
     splashAudioContext?.close().catch(()=>{});
     revealPage();dialog.close();dialog.remove();
     if(oldFocus?.isConnected)oldFocus.focus({preventScroll:true});
     resolve();
   }
   async function fade(element,from,to,duration){
     element.style.opacity=String(to);
     if(reduced||!element.animate)return;
     const animation=element.animate([{opacity:from},{opacity:to}],{duration,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'});
     animations.add(animation);
     try{await animation.finished;}catch{}
     animations.delete(animation);animation.cancel();
   }
   dialog.addEventListener('dismiss',close);
   dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
   dialog.showModal();
   // Keep a solid screen from first paint; only the decoded artwork fades in.
   const art=dialog.querySelector('.brand-art'),img=dialog.querySelector('img');
   async function strikeLongshot(){
     if(reduced){art.classList.add('longshot-static');return;}
     const projectile=art.querySelector('.longshot-projectile');
     if(!projectile?.animate){art.classList.add('longshot-static');return;}
     // Leave the logo area without allocating an oversized offscreen SVG layer.
     const exit=Math.min(520,Math.max(300,art.clientWidth*1.4));
     for(const [index,offset] of [-125,145,-90].entries()){
       const miss=projectile.cloneNode(true);
       miss.classList.add('longshot-miss');art.append(miss);
       playSound(swishes[index]);
       const flight=miss.animate([
         {opacity:0,transform:`translate3d(230px,${-220+offset}px,0)`,offset:0},
         {opacity:1,transform:`translate3d(205px,${-198+offset}px,0)`,offset:.06},
         {opacity:0,transform:`translate3d(${-exit}px,${Math.round(exit*.85+offset)}px,0)`,offset:1}
       ],{duration:330,easing:'linear',fill:'forwards'});
       animations.add(flight);
       try{await flight.finished;}catch{}
       animations.delete(flight);flight.cancel();miss.remove();
       if(done)return;
     }
     const shot=projectile.animate([
       {opacity:0,transform:'translate3d(230px,-220px,0)',offset:0},
       {opacity:1,transform:'translate3d(208px,-199px,0)',offset:.08},
       {opacity:1,transform:'translate3d(0,0,0)',offset:1}
     ],{duration:260,easing:'cubic-bezier(.3,0,.8,.65)',fill:'forwards'});
     animations.add(shot);
     try{await shot.finished;}catch{}
     animations.delete(shot);
     if(done)return;
     projectile.style.opacity='1';projectile.style.transform='translate(0,0)';
     shot.cancel();
     playSound(impact);
     art.classList.add('longshot-hit');
     await wait(390);
     if(done)return;
     // Replace the dashed rings with the exact final paths once the opening finishes.
     art.classList.add('longshot-open','longshot-landed');
   }
   const loadTimeout=setTimeout(close,6000);timers.add(loadTimeout);
   async function begin(){
     if(done)return;
     clearTimeout(loadTimeout);timers.delete(loadTimeout);
     // Decode each native effect once, ahead of the moving arrows.
     await Promise.race([Promise.all([...swishes,impact].map(audio=>audio?.ready)),wait(400)]);
     if(done)return;
     await frame();await frame();
     if(done)return;
     await fade(art,0,1,id==='longshot'?180:450);
     if(done)return;
     if(id==='longshot')await strikeLongshot();
     if(done)return;
     await Promise.all([wait(reduced?1200:id==='longshot'?1250:1550),Promise.race([Promise.resolve(ready).catch(()=>{}),wait(4000)])]);
     if(done)return;
     // Unhide the finished page while the splash is still completely opaque.
     revealPage();
     await frame();await frame();
     if(done)return;
     await fade(dialog,1,0,600);
     close();
   }
   if(img.decode)img.decode().then(begin,close);
   else if(img.complete){if(img.naturalWidth)begin();else close();}
   else{img.addEventListener('load',begin,{once:true});img.addEventListener('error',close,{once:true});}
 });
}
window.LongShotStudiosSplash = Object.freeze({
  play({style='original', ready=Promise.resolve(),sound=true,soundVolume=.8,darkMode=document.documentElement.dataset.darkMode==='true',onReveal}={}) {
    return playSplash('longshot', style, {ready,sound,soundVolume,darkMode,onReveal});
  },
  dismiss() {
    document.querySelector('.studio-splash')?.dispatchEvent(new Event('dismiss'));
  }
});
})();
