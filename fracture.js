/* Reactive background fractures for the original V4 neon contact environment.
   The headline remains normal DOM text and never changes or disappears. */
(() => {
  'use strict';
  const section=document.querySelector('#contact');
  const canvas=document.querySelector('#contact-fracture');
  if(!section||!canvas)return;
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)return;
  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  const coarse=matchMedia('(pointer:coarse)');
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const random=(seed)=>{const t=Math.sin(seed*178.13+12.84)*43758.5453;return t-Math.floor(t);};
  let w=0,h=0,dpr=1,visible=false,raf=0,last=0;
  let mouse={x:-9999,y:-9999,active:false,vx:0,vy:0};
  let oldX=0,oldY=0,shards=[],impacts=[];
  function build(){
    const r=canvas.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);
    dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    shards=[];
    const cols=Math.max(9,Math.ceil(w/98)),rows=Math.max(11,Math.ceil(h/92));
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const i=r*cols+c,wx=w*(c+.4+random(i*8.4)*.2)/cols,wy=h*(r+.45+random(i*9.7)*.24)/rows;
      const size=18+random(i*29)*54;
      shards.push({ox:wx,oy:wy,x:wx,y:wy,vx:0,vy:0,rot:random(i+2)*6.28,vr:0,size,side:random(i+13)>.5,alpha:.055+random(i+29)*.14});
    }
  }
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(visible&&!raf)raf=requestAnimationFrame(frame);
  },{rootMargin:'100px 0px 100px 0px'});
  observer.observe(section);
  new ResizeObserver(build).observe(canvas);
  function position(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  section.addEventListener('pointermove',e=>{
    if(coarse.matches||reduce.matches)return;
    const p=position(e);mouse.vx=clamp(p.x-oldX,-36,36);mouse.vy=clamp(p.y-oldY,-36,36);
    mouse.x=p.x;mouse.y=p.y;oldX=p.x;oldY=p.y;mouse.active=true;
  },{passive:true});
  section.addEventListener('pointerleave',()=>{mouse.active=false;mouse.x=-9999;mouse.y=-9999;});
  section.addEventListener('pointerdown',e=>{
    if(reduce.matches)return;
    const p=position(e);
    impacts.push({x:p.x,y:p.y,r:0,energy:1});
    if(impacts.length>5)impacts.shift();
    // A little immediate displacement ensures taps work without hover on mobile.
    for(const s of shards){
      const dx=s.x-p.x,dy=s.y-p.y,dist=Math.hypot(dx,dy);
      if(dist<270){const f=(1-dist/270)*20;s.vx+=(dx/(dist||1))*f;s.vy+=(dy/(dist||1))*f;s.vr+=(random(s.ox+s.oy)-.5)*.16;}
    }
  },{passive:true});
  function frame(time){
    raf=0;if(!visible)return;
    if(time-last<19&&!reduce.matches){raf=requestAnimationFrame(frame);return;}
    last=time;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);
    // Large shard fragments are an overlay on the existing alley, not on the type.
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=0;i<shards.length;i++){
      const s=shards[i];
      let force=0;
      if(mouse.active){
        const dx=s.x-mouse.x,dy=s.y-mouse.y,dist=Math.hypot(dx,dy);
        if(dist<205){force=Math.pow(1-dist/205,1.5);s.vx+=dx/(dist||1)*(3.7+Math.abs(mouse.vx)*.18)*force+mouse.vx*.08*force;s.vy+=dy/(dist||1)*(3.7+Math.abs(mouse.vy)*.18)*force+mouse.vy*.08*force;s.vr+=(s.side?1:-1)*.012*force;}
      }
      for(const impact of impacts){
        const dx=s.x-impact.x,dy=s.y-impact.y,dist=Math.hypot(dx,dy);
        if(Math.abs(dist-impact.r)<120){const push=(1-Math.abs(dist-impact.r)/120)*impact.energy*1.7;s.vx+=dx/(dist||1)*push;s.vy+=dy/(dist||1)*push;}
      }
      s.vx+=(s.ox-s.x)*.014;s.vy+=(s.oy-s.y)*.014;
      s.vx*=.887;s.vy*=.887;s.vr*=.89;
      s.x+=s.vx;s.y+=s.vy;s.rot+=s.vr;
      ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);
      const glint=clamp(Math.hypot(s.vx,s.vy)/16,0,1);
      const alpha=Math.min(.89,(s.alpha+force*.42+glint*.52));
      const color=i%5===0?'252,167,139':i%3===0?'255,88,121':'123,177,229';
      ctx.strokeStyle=`rgba(${color},${alpha})`;
      ctx.lineWidth=glint>.2?1.5:.7;
      ctx.beginPath();ctx.moveTo(0,-s.size*.68);ctx.lineTo(s.size*.7,s.size*.48);ctx.lineTo(-s.size*.62,s.size*.42);ctx.closePath();ctx.stroke();
      if(glint>.12){ctx.fillStyle=`rgba(${color},${glint*.09})`;ctx.fill();}
      ctx.restore();
    }
    ctx.restore();
    for(let i=impacts.length-1;i>=0;i--){
      const burst=impacts[i];
      ctx.save();ctx.strokeStyle=`rgba(255,143,126,${burst.energy*.67})`;ctx.shadowColor='#fa678b';ctx.shadowBlur=24;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(burst.x,burst.y,burst.r,0,Math.PI*2);ctx.stroke();ctx.restore();
      burst.r+=14;burst.energy*=.94;
      if(burst.energy<.025)impacts.splice(i,1);
    }
    mouse.vx*=.68;mouse.vy*=.68;
    if(!reduce.matches)raf=requestAnimationFrame(frame);
  }
  build();
})();
