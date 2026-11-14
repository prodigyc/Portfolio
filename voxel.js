/* Interactive volumetric A: a second hero mode built from original 3D voxel geometry. */
(()=>{
 'use strict';
 const canvas=document.querySelector('#voxel-canvas');const button=document.querySelector('#voxel-toggle');
 const globe=document.querySelector('#orb-canvas');if(!canvas||!button||!globe)return;
 const surface=canvas.closest('.hero-orbit');const ctx=canvas.getContext('2d');if(!ctx)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const clamp=(x,a,b)=>Math.max(a,Math.min(x,b));
 let active=false,w=0,h=0,dpr=1,last=0,raf=0,inside=false;
 let mouse={x:-9999,y:-9999,tx:0,ty:0},spin=.10,velocity=.002,pitch=.13;
 const voxels=[];const size=220;
 const mask=document.createElement('canvas');mask.width=mask.height=size;
 const m=mask.getContext('2d',{willReadFrequently:true});m.fillStyle='#fff';
 m.textAlign='center';m.textBaseline='middle';m.font='900 226px Arial Black, Arial, sans-serif';m.fillText('A',110,113);
 const bitmap=m.getImageData(0,0,size,size).data;
 for(let y=14;y<size-14;y+=5.5){for(let x=14;x<size-14;x+=5.5){
  let idx=((Math.floor(y)*size+Math.floor(x))*4)+3;
  if(bitmap[idx]<150)continue;
  // A deliberately heterogeneous sculpture: solid face and scattered deep columns.
  const front=Math.sin(x*.6+y*.45)*.12;
  for(let layer=0;layer<3;layer++){
   if(layer===2&&Math.sin(x*.91+y*.33)<.25)continue;
   const xx=(x-110)/17,yy=(y-118)/17,zz=-1.3+layer*1.20+front;
   voxels.push({ox:xx,oy:yy,oz:zz,x:xx,y:yy,z:zz,vx:0,vy:0,vz:0,size:3.1+layer*.5,shade:layer,id:voxels.length});
  }
 }}
 function resize(){const b=canvas.getBoundingClientRect();w=b.width;h=b.height;dpr=Math.min(devicePixelRatio||1,1.4);canvas.width=Math.ceil(w*dpr);canvas.height=Math.ceil(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
 new ResizeObserver(resize).observe(canvas);
 function project(p){
  const co=Math.cos(spin),si=Math.sin(spin),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const xx=p.x*co-p.z*si,zz=p.x*si+p.z*co;
  const yy=p.y*cp-zz*sp,z2=p.y*sp+zz*cp;
  const sc=Math.min(w*.58,h*.72)/(13.6+z2);
  return{x:w*.5+xx*sc,y:h*.51+yy*sc,z:z2,s:sc};
 }
 function render(now){raf=0;if(!active)return;
  const dt=clamp((now-last)/16.7,.2,2);last=now;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  ctx.save();const grd=ctx.createRadialGradient(w*.5,h*.5,20,w*.5,h*.5,w*.55);
  grd.addColorStop(0,'rgba(21,102,110,.2)');grd.addColorStop(1,'rgba(2,14,22,0)');ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);ctx.restore();
  if(!reduced.matches){spin+=velocity*dt;velocity=.003+ (velocity-.003)*.966;pitch+=(.11+mouse.ty*.26-pitch)*.035;}
  const items=[];
  const origin=project({x:0,y:0,z:0});
  for(const v of voxels){
    v.vx+=(v.ox-v.x)*.031*dt;v.vy+=(v.oy-v.y)*.031*dt;v.vz+=(v.oz-v.z)*.026*dt;
    v.vx*=Math.pow(.85,dt);v.vy*=Math.pow(.85,dt);v.vz*=Math.pow(.84,dt);
    v.x+=v.vx*dt;v.y+=v.vy*dt;v.z+=v.vz*dt;
    const pt=project(v);items.push({p:pt,v});
  }
  items.sort((a,b)=>b.p.z-a.p.z);
  for(const {p,v} of items){
   const r=clamp(p.s*.08,1,5.3);
   const diff=Math.abs(v.x-v.ox)+Math.abs(v.y-v.oy);
   ctx.fillStyle=diff>.25?'rgba(200,255,100,.94)':v.shade===0?'rgba(97,225,230,.79)':v.shade===1?'rgba(235,255,250,.85)':'rgba(59,145,171,.70)';
   ctx.fillRect(p.x-r/2,p.y-r/2,r,r);
   if(v.id%3===0&&r>1.5){ctx.fillStyle='rgba(0,37,43,.35)';ctx.fillRect(p.x+r*.3,p.y-r*.2,r*.37,r*.9);}
  }
  ctx.strokeStyle='rgba(133,238,224,.12)';ctx.lineWidth=.8;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(w*.5,h*.5,w*(.19+i*.045),h*(.08+i*.03),-.4,0,Math.PI*2);ctx.stroke();}
  ctx.fillStyle='rgba(201,255,100,.73)';ctx.font='10px monospace';ctx.fillText('IDENTITY // 0xA4',w*.19,h*.20);
  if(!reduced.matches)raf=requestAnimationFrame(render);
 }
 function impulse(x,y,force=1){
  if(reduced.matches)return;
  for(const v of voxels){const p=project(v);const dx=p.x-x,dy=p.y-y,dist=Math.hypot(dx,dy);
    if(dist>155)continue;const f=(1-dist/155)*force;
    v.vx+=(dx/(dist+1))*f*.70+(Math.random()-.5)*f*.23;
    v.vy+=(dy/(dist+1))*f*.76+(Math.random()-.5)*f*.23;
    v.vz+=(Math.random()-.5)*f*.48;
  }
 }
 canvas.addEventListener('pointermove',(e)=>{const b=canvas.getBoundingClientRect();const x=e.clientX-b.left,y=e.clientY-b.top;mouse.tx=(x/w-.5)*2;mouse.ty=(y/h-.5)*2;spin+=mouse.tx*.0007;impulse(x,y,.65);},{passive:true});
 canvas.addEventListener('pointerdown',(e)=>{const b=canvas.getBoundingClientRect();impulse(e.clientX-b.left,e.clientY-b.top,7);velocity=.022;});
 button.addEventListener('click',()=>{
  active=!active;button.setAttribute('aria-pressed',String(active));button.innerHTML=active?'<span>◎</span> ORBIT MODE':'<span>◈</span> VOXEL MODE';
  surface.classList.toggle('voxel-active',active);globe.hidden=active;canvas.hidden=!active;
  document.querySelector('#orb-prompt').textContent=active?'MOVE TO DISTORT · CLICK TO SHATTER':'DRAG TO ROTATE · CLICK TO PULSE';
  if(active){resize();last=performance.now();if(!raf)raf=requestAnimationFrame(render);}else if(raf){cancelAnimationFrame(raf);raf=0;}
 });
 reduced.addEventListener('change',()=>{if(active){if(reduced.matches){cancelAnimationFrame(raf);render(performance.now());}else if(!raf){raf=requestAnimationFrame(render);}}});
})();
