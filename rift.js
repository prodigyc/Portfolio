/* V4 archive follow-up: a scroll-responsive architectural data rift.
   Entirely procedural artwork, not the reference site's 3D assets. */
(() => {
  'use strict';
  const section=document.querySelector('#lab');
  const canvas=document.querySelector('#rift-canvas');
  const button=document.querySelector('#rift-pulse');
  const depthText=document.querySelector('#rift-depth');
  if(!section||!canvas)return;
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const coarse=matchMedia('(pointer: coarse)');
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const rand=(n)=>{const x=Math.sin(n*128.71+72.7)*43758.5453;return x-Math.floor(x)};
  let w=1,h=1,dpr=1,visible=false,raf=0,last=0;
  let pointer={x:0,y:0,tx:0,ty:0},pos=0,target=0;
  let pulse=0,pulseX=.52,pulseY=.45;
  const structures=[];
  for(let i=0;i<164;i++){
    const side=i%2===0?-1:1;
    const row=Math.floor(i/2);
    const lane=1+(row%5);
    structures.push({
      x:side*(3+lane*.74+rand(i+7)*1.1),
      y:-1.6-rand(i+11)*1.8,
      z:9+row*2.15+rand(i+19)*1.9,
      wx:.46+rand(i+23)*1.55,
      wy:1.4+rand(i+37)*3.3,
      wz:.55+rand(i+41)*1.6,
      hue:rand(i+1),
      windows:3+Math.floor(rand(i+73)*5),
    });
  }
  structures.sort((a,b)=>b.z-a.z);
  function resize(){
    const r=canvas.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);
    dpr=Math.min(window.devicePixelRatio||1,1.5);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function measure(){
    const r=section.getBoundingClientRect();target=clamp(-r.top/Math.max(1,r.height-innerHeight),0,1);
  }
  const ro=new ResizeObserver(resize);ro.observe(canvas);
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(visible&&!raf)raf=requestAnimationFrame(frame);
  },{rootMargin:'160px 0px 160px 0px'});
  observer.observe(section);
  section.addEventListener('pointermove',(e)=>{
    if(coarse.matches||reduce.matches)return;
    const r=canvas.getBoundingClientRect();
    pointer.tx=clamp((e.clientX-r.left)/Math.max(1,r.width)*2-1,-1,1);
    pointer.ty=clamp((e.clientY-r.top)/Math.max(1,r.height)*2-1,-1,1);
  },{passive:true});
  section.addEventListener('pointerleave',()=>{pointer.tx=0;pointer.ty=0;});
  addEventListener('scroll',measure,{passive:true});
  addEventListener('resize',measure,{passive:true});
  const shock=()=>{pulse=1;pulseX=(pointer.x+1)/2;pulseY=(pointer.y+1)/2;};
  button?.addEventListener('click',shock);
  canvas.addEventListener('pointerdown',()=>{if(!coarse.matches)shock();});
  function polygon(points,fill,stroke,width=1){
    if(points.some(v=>!v))return;
    ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
    ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
  }
  function line(a,b,color,width=1){if(!a||!b)return;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function render(time){
    const horizon=h*(w<700?.51:.49);
    const focus=Math.min(w*1.08,h*1.65);
    const cameraZ=pos*94;
    const sway=pulse*Math.sin(time*.035)*.22;
    const cx=w*(w<700?.52:.55)+pointer.x*(w<700?6:33)+sway*65;
    const cy=horizon+pointer.y*18;
    const camera={z:cameraZ,x:pointer.x*.35+sway,y:pointer.y*.17};
    const projected=(x,y,z)=>{
      const dz=z-camera.z;
      if(dz<1.8)return null;
      const s=focus/dz;
      return {x:cx+(x-camera.x)*s,y:cy+(y-camera.y)*s,s};
    };
    ctx.fillStyle='#020914';ctx.fillRect(0,0,w,h);
    const glow=ctx.createRadialGradient(cx,cy,8,cx,cy,w*.74);
    glow.addColorStop(0,'rgba(93,170,230,.46)');glow.addColorStop(.24,'rgba(23,68,125,.27)');glow.addColorStop(.56,'rgba(5,31,66,.36)');glow.addColorStop(1,'rgba(1,6,15,.96)');
    ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    // Distant architectural vault and converging blue beams.
    for(let i=25;i>=0;i--){
      const z=cameraZ+4+i*6.8;
      const pts=[[-12,-8],[12,-8],[12,5],[-12,5]].map(([x,y])=>projected(x,y,z));
      const fade=1-i/34;
      polygon(pts,null,`rgba(75,171,235,${(.035+fade*.13).toFixed(3)})`,.75);
      if(i%4===0){
        line(projected(-12,-8,z),projected(12,-8,z),`rgba(123,221,255,${fade*.17})`,1.2);
      }
    }
    // Angular slabs of an inverted city, including white reflective window strips.
    ctx.save();ctx.beginPath();ctx.rect(0,0,w,horizon+18);ctx.clip();
    for(const o of structures){
      const dz=o.z-cameraZ;
      if(dz<2||dz>130)continue;
      const left=o.x-o.wx/2,right=o.x+o.wx/2,top=o.y-o.wy/2,bottom=o.y+o.wy/2;
      const p=[projected(left,top,o.z),projected(right,top,o.z),projected(right,bottom,o.z),projected(left,bottom,o.z)];
      if(p.some(q=>!q))continue;
      const back=[projected(left,top,o.z+o.wz),projected(right,top,o.z+o.wz),projected(right,bottom,o.z+o.wz),projected(left,bottom,o.z+o.wz)];
      const f=clamp(1-dz/142,.08,1);
      const alive=o.hue>.31;
      const frontFill=alive?`rgba(11,39,69,${.60*f+.25})`:`rgba(4,22,50,${.45*f+.3})`;
      const edgeColor=`rgba(89,188,249,${(.07+f*.35).toFixed(3)})`;
      polygon([p[1],back[1],back[2],p[2]],`rgba(13,45,78,${.32+f*.38})`,edgeColor,.8);
      polygon([p[0],p[1],back[1],back[0]],`rgba(18,60,94,${.34+f*.32})`,edgeColor,.8);
      polygon(p,frontFill,edgeColor,.75);
      const screenWidth=Math.abs(p[1].x-p[0].x),screenHeight=Math.abs(p[3].y-p[0].y);
      if(screenWidth<3||screenHeight<8)continue;
      // Windows: white alternating horizontal slashes, scaled with perspective.
      for(let r=0;r<o.windows;r++){
        const rowY=top+(r+1)*o.wy/(o.windows+1);
        const gaps=2+Math.floor(o.wx/.4);
        for(let c=0;c<gaps;c++){
          if(rand(o.z*17+r*9+c*3)<.37)continue;
          const xx=left+(c+.2)*o.wx/gaps;
          const a=projected(xx,rowY,o.z-0.008),b=projected(xx+o.wx/gaps*.52,rowY,o.z-0.008);
          if(!a||!b)continue;
          const alpha=(o.hue>.56? .72:.48)*f;
          line(a,b,`rgba(${o.hue>.67?'240,250,255':'99,193,249'},${alpha.toFixed(3)})`,clamp(f*3,1,4));
        }
      }
    }
    ctx.restore();
    // Inverted reflection in the digital water: fractured rows and scan slices.
    ctx.save();
    ctx.translate(0,horizon*2+17);ctx.scale(1,-.94);
    ctx.globalAlpha=.34;
    ctx.drawImage(canvas,0,0,canvas.width,Math.round(horizon*dpr),0,0,w,horizon);
    ctx.restore();
    const water=ctx.createLinearGradient(0,horizon,0,h);
    water.addColorStop(0,'rgba(26,89,142,.26)');water.addColorStop(.4,'rgba(2,18,43,.54)');water.addColorStop(1,'rgba(0,4,14,.92)');
    ctx.fillStyle=water;ctx.fillRect(0,horizon,w,h-horizon);
    for(let i=0;i<95;i++){
      const r=rand(i*23+7);
      const y=horizon+(h-horizon)*r;
      const x=rand(i*33+13)*w;
      const drift=Math.sin(time*.0013+i)*14;
      ctx.fillStyle=`rgba(${i%5===0?'229,246,255':'71,174,235'},${.025+.14*(1-r)})`;
      ctx.fillRect(x+drift,y,6+38*rand(i*12+3),.5+(1-r)*.8);
    }
    // Deep-blue bloom and subtle glitch distortion pulse; the scene keeps its geometry.
    if(pulse>.02){
      ctx.save();ctx.globalCompositeOperation='screen';
      for(let k=0;k<8;k++){
        const y=h*(rand(k*18+Math.floor(time/80)*2));
        const alpha=.13*pulse;
        ctx.fillStyle=`rgba(104,218,255,${alpha})`;
        ctx.fillRect(0,y,w,2+Math.ceil(pulse*3));
      }
      ctx.strokeStyle=`rgba(183,245,255,${pulse*.74})`;
      ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(w*pulseX,h*pulseY,pulse*w*.42,pulse*h*.27,0,0,Math.PI*2);ctx.stroke();
      ctx.restore();
      pulse*=.94;
    }
    // Film scratches and central bloom.
    for(let i=0;i<18;i++){
      const x=(rand(i*43+4)*w+time*.008*(i%3+1))%w;
      const y=rand(i*37+17)*h;
      ctx.fillStyle=`rgba(201,238,255,${.04+rand(i+1)*.10})`;
      ctx.fillRect(x,y,.8,3+rand(i+31)*26);
    }
  }
  function frame(now){
    raf=0;if(!visible)return;
    if(now-last>=20||reduce.matches){
      pointer.x=lerp(pointer.x,pointer.tx,.09);
      pointer.y=lerp(pointer.y,pointer.ty,.09);
      pos=lerp(pos,target,reduce.matches?1:.072);
      if(depthText)depthText.textContent=`DEPTH / ${(pos*100).toFixed(1)}%`;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      render(now);last=now;
    }
    if(!reduce.matches)raf=requestAnimationFrame(frame);
  }
  resize();measure();
})();
