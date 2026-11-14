/* AMER // Immersive interactive environments. Original Canvas 2D 3D-projection scenes.
   Each scene remains accessible if animation, WebGL or network access is unavailable. */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const mobile = matchMedia('(pointer:coarse)');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  const clamp = (n,a,b) => Math.min(b,Math.max(a,n));
  const mix = (a,b,t) => a+(b-a)*t;
  const smooth = (t) => t*t*(3-2*t);
  const TAU = Math.PI*2;
  const rnd = (n) => {const x=Math.sin(n*127.1+17.4)*43758.5453;return x-Math.floor(x);};
  const strokeLine = (ctx,a,b,color,width=1,glow=0) => {
    if (!a || !b) return;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
    ctx.strokeStyle=color;ctx.lineWidth=width;
    if(glow){ctx.shadowBlur=glow;ctx.shadowColor=color;}
    ctx.stroke();ctx.shadowBlur=0;
  };
  const polygon = (ctx,pts,fill,stroke,width=1) => {
    if(pts.some(p=>!p)) return;
    ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
    pts.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
  };
  function makeSurface(canvas,section) {
    const ctx=canvas?.getContext('2d',{alpha:false});if(!ctx)return null;
    let w=0,h=0,pr=1,isVisible=false,mouse={x:0,y:0},targetMouse={x:0,y:0},progress=0,targetProgress=0;
    function resize(){const rect=canvas.getBoundingClientRect();w=Math.max(1,rect.width);h=Math.max(1,rect.height);pr=Math.min(devicePixelRatio||1,1.55);canvas.width=Math.ceil(w*pr);canvas.height=Math.ceil(h*pr);ctx.setTransform(pr,0,0,pr,0,0);}
    function measure(){const r=section.getBoundingClientRect();targetProgress=clamp(-r.top/Math.max(1,r.height-innerHeight),0,1);}
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([e])=>{isVisible=e.isIntersecting; if(isVisible) {measure();render(performance.now());}}, {rootMargin:'220px 0px 220px 0px'}).observe(section);
    section.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();targetMouse={x:clamp((e.clientX-r.left)/r.width*2-1,-1,1),y:clamp((e.clientY-r.top)/r.height*2-1,-1,1)};},{passive:true});
    section.addEventListener('pointerleave',()=>{targetMouse.x=0;targetMouse.y=0;});
    addEventListener('scroll',measure,{passive:true});addEventListener('resize',measure,{passive:true});
    let drawer=()=>{};let previous=0;let raf=0;
    function render(now){
      if(!isVisible && !reduce.matches)return;
      if(now-previous>=16 || reduce.matches){
        progress=mix(progress,targetProgress,reduce.matches?1:.082);
        mouse.x=mix(mouse.x,targetMouse.x,.065);mouse.y=mix(mouse.y,targetMouse.y,.065);
        ctx.setTransform(pr,0,0,pr,0,0);
        drawer({ctx,w,h,mouse,progress,time:now,reduce:reduce.matches});previous=now;
      }
      if(isVisible&&!reduce.matches)raf=requestAnimationFrame(render);
    }
    function start(fn){drawer=fn;resize();measure(); if(raf)cancelAnimationFrame(raf);render(performance.now());}
    return {start,get dims(){return {w,h}},get progress(){return progress},get targetProgress(){return targetProgress},get mouse(){return mouse}};
  }

  // 01 / AN ARCHIVE DESIGNED AS A 3D CORRIDOR, NOT A STATIC IMAGE CAROUSEL.
  function archive() {
    const section=$('#experience'),canvas=$('#archive-canvas');if(!section||!canvas)return;
    const surface=makeSurface(canvas,section);if(!surface)return;
    const projData=Array.isArray(window.projects)?window.projects:typeof projects!=='undefined'?projects:[];
    const images=projData.map(project=>{const img=new Image();img.src=project.image;return img;});
    const hover=$('#archive-hover'),hoverName=$('#archive-hover-title');
    let rects=[],point={x:-1000,y:-1000},hovered=-1;
    const chapter=$('#archive-chapter'),coords=$('#archive-coords'),meter=$('#archive-progress'),title=$('.experience-heading'),hint=$('#archive-hint');
    function screenPoint(x,y,z,camera,f) {
      const dz=z-camera.z;
      if(dz<1.9)return null;
      const scale=f/dz;
      return {x:camera.sx+(x-camera.x)*scale,y:camera.sy+(y-camera.y)*scale,scale,depth:dz};
    }
    function line3(ctx,x1,y1,z1,x2,y2,z2,camera,f,color,width=1,glow=0) {
      const a=screenPoint(x1,y1,z1,camera,f),b=screenPoint(x2,y2,z2,camera,f);
      strokeLine(ctx,a,b,color,width,glow);
    }
    function fillWorld(ctx,w,h,time) {
      ctx.fillStyle='#040c14';ctx.fillRect(0,0,w,h);
      const grad=ctx.createRadialGradient(w*.53,h*.46,20,w*.53,h*.55,w*.72);
      grad.addColorStop(0,'rgba(14,64,84,.38)');grad.addColorStop(.5,'rgba(4,24,43,.26)');grad.addColorStop(1,'rgba(0,2,6,.95)');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
      for(let i=0;i<120;i++){
        const x=rnd(i+1)*w,y=rnd(i+300)*h;
        const pulse=.35+.45*Math.sin(time*.0007+i*1.3);
        ctx.fillStyle=`rgba(133,226,240,${pulse*.18})`;
        ctx.fillRect(x,y,1.4,1.4);
      }
    }
    function drawWorld({ctx,w,h,mouse,progress,time,reduce}) {
      fillWorld(ctx,w,h,time);
      const p=progress;const z=-7+p*95;
      const camera={z,x:mouse.x*.52,y:mouse.y*.24,sx:w*.52+mouse.x*19,sy:h*.52+mouse.y*12};
      const focal=Math.min(w*1.07,h*1.45);
      const left=-8,right=8,up=-3.65,down=3.65;
      // Ambient depth stripes and the floor/ceiling converge at the same 3D vanishing point.
      for(const [a,b] of [[left,up],[right,up],[left,down],[right,down]])
        line3(ctx,a,b,z+3,a,b,z+120,camera,focal,'rgba(24,124,167,.19)');
      const first=Math.floor((z+4)/7)*7;
      for(let i=18;i>=0;i--) {
        const depth=first+i*7;
        if(depth-z<3||depth-z>128)continue;
        const alpha=clamp(1-(depth-z)/145,.12,.77);
        const c=`rgba(30,164,216,${(alpha*.34).toFixed(3)})`;
        const corners=[[left,up],[right,up],[right,down],[left,down]].map(pt=>screenPoint(pt[0],pt[1],depth,camera,focal));
        polygon(ctx,corners,null,c,.85);
        const a=screenPoint(left,down,depth,camera,focal),b=screenPoint(right,down,depth,camera,focal);
        strokeLine(ctx,a,b,`rgba(89,218,240,${alpha*.38})`,1.0,3);
        if(i%2===0) {
          const midA=screenPoint(-8,-3.65,depth,camera,focal),midB=screenPoint(8,-3.65,depth,camera,focal);
          strokeLine(ctx,midA,midB,`rgba(60,149,206,${alpha*.3})`,1);
        }
        // LED rails close to the ground.
        for(const side of [-1,1])line3(ctx,side*6.2,3.59,depth,side*6.2,3.59,depth+7,camera,focal,`rgba(42,218,236,${alpha*.47})`,1.2,3);
      }
      for(let x=-8;x<=8;x+=2)line3(ctx,x,down,z+3,x,down,z+135,camera,focal,'rgba(29,129,174,.18)',.8);
      for(let x=-8;x<=8;x+=4)line3(ctx,x,up,z+3,x,up,z+135,camera,focal,'rgba(29,129,174,.12)',.7);
      // Moving cinematic light-scanner slices.
      for(let i=0;i<4;i++){
        const zz=z+14+i*19+((time*.003)%19);
        line3(ctx,-8,3.6,zz,8,3.6,zz,camera,focal,'rgba(129,253,240,.15)',1.6,11);
      }
      rects=[];
      for(let i=projData.length-1;i>=0;i--){
        const project=projData[i];const zS=14+i*10.9;
        const d=zS-z;if(d<2.7||d>115)continue;
        const side=i%2===0?-1:1;
        const cx=side*3.8;
        const cy=-.28+Math.sin(i*1.87)*.36;
        const sw=3.45,sh=2.42;
        const tilt=side===-1?.14:-.14;
        const points=[[-sw/2,-sh/2],[sw/2,-sh/2],[sw/2,sh/2],[-sw/2,sh/2]].map(([x,y])=>screenPoint(cx+x,cy+y,zS+x*tilt,camera,focal));
        if(points.some(q=>!q))continue;
        const minX=Math.min(...points.map(o=>o.x)),maxX=Math.max(...points.map(o=>o.x));
        const minY=Math.min(...points.map(o=>o.y)),maxY=Math.max(...points.map(o=>o.y));
        if(maxX<0||minX>w||maxY<0||minY>h)continue;
        const width=maxX-minX,height=maxY-minY;
        const isHot=hovered===i;
        ctx.save();ctx.shadowColor=isHot?'#bfff4b':'#33caff';ctx.shadowBlur=isHot?35:18;
        polygon(ctx,points,`rgba(6,23,37,${clamp(.83+d/600,.7,.96)})`,isHot?'rgba(194,255,79,.9)':'rgba(73,217,238,.65)',isHot?2.3:1.5);
        ctx.restore();
        ctx.save();ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);points.slice(1).forEach(pt=>ctx.lineTo(pt.x,pt.y));ctx.closePath();ctx.clip();
        ctx.fillStyle='#091c2a';ctx.fillRect(minX,minY,width,height);
        if(images[i]?.complete&&images[i]?.naturalWidth){ctx.globalAlpha=.85;ctx.drawImage(images[i],minX,minY,width,height);ctx.globalAlpha=1;}
        const shade=ctx.createLinearGradient(0,minY,0,maxY);shade.addColorStop(0,'rgba(1,6,10,.83)');shade.addColorStop(.25,'rgba(2,8,14,.08)');shade.addColorStop(.6,'rgba(2,8,14,.05)');shade.addColorStop(1,'rgba(0,4,9,.88)');ctx.fillStyle=shade;ctx.fillRect(minX,minY,width,height);
        const fz=clamp(width*.067,8,17);
        ctx.fillStyle=isHot?'#c5ff4f':'#8aebf0';ctx.font=`500 ${Math.max(7,fz*.71)}px "DM Mono", monospace`;
        ctx.fillText(`CASE FILE / ${String(i+1).padStart(2,'0')}`,minX+clamp(width*.055,7,23),minY+clamp(height*.09,10,25));
        if(width>100){
          ctx.fillStyle='#f5fffa';ctx.font=`700 ${clamp(fz,10,21)}px "Space Grotesk", sans-serif`;
          const safeTitle=project.title.split(' — ')[0].toUpperCase();
          ctx.fillText(safeTitle.slice(0,22),minX+clamp(width*.06,7,23),maxY-clamp(height*.12,13,32),Math.max(30,width-18));
        }
        // Animated telemetry bars make each piece of the corridor read as a working monitor.
        if(width>66){
          ctx.fillStyle='rgba(31,194,216,.20)';ctx.fillRect(minX+width*.055,minY+height*.18,width*.36,Math.max(2,height*.014));
          for(let v=0;v<9;v++){
            const lineHeight=height*(.06+.16*rnd(i*17+v))*(.7+.3*Math.sin(time*.002+v));
            ctx.fillStyle=v===4?'rgba(197,255,79,.60)':'rgba(67,206,235,.47)';
            ctx.fillRect(minX+width*(.09+v*.037),minY+height*.66-lineHeight,Math.max(1,width*.012),lineHeight);
          }
        }
        ctx.restore();
        polygon(ctx,points,null,isHot?'#c5ff4f':'rgba(107,237,255,.82)',isHot?2.3:1.2);
        const corner=points[0];if(width>48){
          ctx.fillStyle=isHot?'#c5ff4f':'#60dcec';ctx.fillRect(corner.x-5,corner.y-5,10,10);
          ctx.fillRect(points[2].x-4,points[2].y-4,8,8);
        }
        rects.push({i,minX,minY,maxX,maxY,depth:d});
      }
      // Local depth fog and chromatic vignette.
      const fog=ctx.createLinearGradient(0,0,0,h);fog.addColorStop(0,'rgba(0,5,13,.68)');fog.addColorStop(.43,'transparent');fog.addColorStop(1,'rgba(0,4,10,.74)');ctx.fillStyle=fog;ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='rgba(99,206,236,.22)';ctx.lineWidth=.65;
      ctx.strokeRect(24,24,w-48,h-48);
      const idx=clamp(Math.floor(p*8),0,7);
      if(chapter)chapter.textContent=String(idx+1).padStart(2,'0');
      if(coords)coords.textContent=`SYS://ARCHIVE/${String(Math.floor(p*8192)).padStart(4,'0')}`;
      if(meter)meter.style.transform=`scaleX(${p})`;
      if(title)title.style.opacity=String(1-smooth(clamp((p-.035)/.27,0,1)));
      if(hint)hint.textContent=mobile.matches?'SELECT A NUMBER TO OPEN A CASE FILE':p>.67?'↑ SCROLL BACK · CLICK A CASE TO EXPAND':'↓ SCROLL TO TRAVEL · CLICK TO EXPAND';
    }
    surface.start(drawWorld);
    const getRect=()=>canvas.getBoundingClientRect();
    function move(e){
      if(mobile.matches||reduce.matches)return;
      const bound=getRect();point.x=e.clientX-bound.left;point.y=e.clientY-bound.top;
      hovered=-1;
      // Closest on-screen screen wins; rectangles are in 3D scene space.
      let best=Infinity;
      for(const r of rects){if(point.x>=r.minX&&point.x<=r.maxX&&point.y>=r.minY&&point.y<=r.maxY&&r.depth<best){hovered=r.i;best=r.depth;}}
      if(hovered>=0){hoverName.textContent=projData[hovered].title;hover.classList.add('is-visible');hover.style.left=`${clamp(point.x+25,10,bound.width-225)}px`;hover.style.top=`${clamp(point.y+20,10,bound.height-86)}px`;canvas.style.cursor='pointer';}
      else{hover.classList.remove('is-visible');canvas.style.cursor='crosshair';}
    }
    canvas.addEventListener('pointermove',move,{passive:true});
    canvas.addEventListener('pointerleave',()=>{hovered=-1;hover.classList.remove('is-visible');});
    canvas.addEventListener('click',()=>{
      if(hovered<0)return;
      openArchiveCase(hovered);
    });
    // Always available on touch devices and keyboard, not dependent on hovering
    const archiveIndex=$('#archive-index');
    if(archiveIndex) {
      projData.forEach((project,i)=>{
        const button=document.createElement('button');
        button.type='button';
        button.textContent=String(i+1).padStart(2,'0');
        button.title=project.title;
        button.setAttribute('aria-label',`Expand case ${i+1}: ${project.title}`);
        button.addEventListener('click',()=>openArchiveCase(i));
        archiveIndex.append(button);
      });
    }
    const modal=$('#archive-case-dialog');
    let activeCase=0;
    function openArchiveCase(index) {
      if(!projData[index] || !modal) return;
      activeCase=index;
      const project=projData[index];
      $('#archive-modal-number').textContent=`${String(index+1).padStart(2,'0')} / ${String(projData.length).padStart(2,'0')}`;
      $('#archive-modal-progress').textContent=`${String(index+1).padStart(2,'0')} / ${String(projData.length).padStart(2,'0')}`;
      const image=$('#archive-modal-image');
      image.src=project.image;
      image.alt=`Illustration for ${project.title}`;
      $('#archive-modal-meta').textContent=`${project.type.toUpperCase()} / ${project.year} / ${project.status.toUpperCase()}`;
      $('#archive-modal-title').textContent=project.title;
      $('#archive-modal-summary').textContent=project.summary;
      $('#archive-modal-description').textContent=project.description;
      const tools=$('#archive-modal-tools');tools.replaceChildren();
      project.tools.forEach(tool=>{const chip=document.createElement('span');chip.textContent=tool;tools.append(chip);});
      const outcomes=$('#archive-modal-outcomes');outcomes.replaceChildren();
      project.outcomes.forEach(outcome=>{const li=document.createElement('li');li.textContent=outcome;outcomes.append(li);});
      if(!modal.open){ modal.showModal(); }
      else { const body=modal.querySelector('.archive-case-body');body.scrollTop=0; }
      if(!reduce.matches && modal.animate){
        modal.querySelector('.archive-case-shell').animate([{opacity:.5,transform:'scale(.965) translateY(12px)'},{opacity:1,transform:'scale(1) translateY(0)'}],{duration:430,easing:'cubic-bezier(.16,1,.3,1)'});
      }
    }
    $('#archive-close')?.addEventListener('click',()=>modal.close());
    modal?.addEventListener('click',(event)=>{if(event.target===modal)modal.close();});
    $('#archive-back')?.addEventListener('click',()=>openArchiveCase((activeCase+projData.length-1)%projData.length));
    $('#archive-next')?.addEventListener('click',()=>openArchiveCase((activeCase+1)%projData.length));
    document.addEventListener('keydown',(event)=>{
      if(!modal?.open) return;
      if(event.key==='ArrowRight'){event.preventDefault();openArchiveCase((activeCase+1)%projData.length);}
      if(event.key==='ArrowLeft'){event.preventDefault();openArchiveCase((activeCase+projData.length-1)%projData.length);}
    });
  }

  // 03 / RED DATA-ALLEY WITH RESPONSIVE LUMINANCE AND PARTICLE WEATHER.
  function neonDistrict() {
    const canvas=$('#alley-canvas'),section=$('#contact');if(!canvas||!section)return;
    const surface=makeSurface(canvas,section);if(!surface)return;
    let sparks=[];let clickTime=-9999,clickPos={x:0,y:0};
    canvas.style.pointerEvents='none';
    section.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();clickPos={x:e.clientX-r.left,y:e.clientY-r.top};clickTime=performance.now();},{passive:true});
    function draw({ctx,w,h,mouse,progress,time,reduce}) {
      ctx.fillStyle='#07070b';ctx.fillRect(0,0,w,h);
      const vp={x:w*.52+mouse.x*28,y:h*(w<700?.40:.36)+mouse.y*12};
      const fog=ctx.createRadialGradient(vp.x,vp.y,0,vp.x,vp.y,w*.88);
      fog.addColorStop(0,'rgba(232,27,50,.38)');fog.addColorStop(.45,'rgba(70,13,35,.17)');fog.addColorStop(1,'rgba(2,1,6,.96)');ctx.fillStyle=fog;ctx.fillRect(0,0,w,h);
      // Rear-layer dystopian high-rise silhouettes and neon corridors.
      const vanishing=vp;const blocks=17;
      for(let n=blocks;n>0;n--){
        const q=n/blocks,z=1-q;const eased=Math.pow(q,1.8);
        const lane=w*(.12+eased*.34);
        const top=h*(-.65+q*.8);
        const bottom=h*(1.4-q*.96);
        const right=vanishing.x+lane,left=vanishing.x-lane;
        for(const side of [-1,1]){
          const edge=side<0?left:right;
          const outer=side<0?edge-w*(.1+eased*.40):edge+w*(.1+eased*.40);
          const hue=n%4===0?'rgba(85,14,38,.87)':'rgba(27,9,22,.90)';
          polygon(ctx,[{x:edge,y:top},{x:outer,y:top-h*.1},{x:outer,y:bottom+h*.05},{x:edge,y:bottom}],hue,`rgba(242,67,91,${.08+.18*eased})`,1);
          // Office window strips and erratic hot signs.
          for(let k=0;k<3;k++){
            const py=top+(k+1)*(bottom-top)/4;
            const ex=edge+side*(20+eased*65);
            const ww=14+eased*22;
            ctx.fillStyle=(n+k)%3===0?`rgba(255,72,99,${.24+.46*eased})`:`rgba(236,97,75,${.07+.16*eased})`;
            ctx.fillRect(ex-(side<0?ww:0),py,ww,1.5+eased*3);
          }
          if(n%3===0){
            ctx.save();ctx.shadowBlur=12+eased*20;ctx.shadowColor='#ff295c';
            strokeLine(ctx,{x:edge,y:top},{x:edge,y:bottom},`rgba(255,40,82,${(.17+.54*eased)})`,1.5+eased*3);ctx.restore();
          }
        }
      }
      // Perspective pathway with reflective center line and wet floor stripes.
      polygon(ctx,[{x:vanishing.x-25,y:vanishing.y},{x:vanishing.x+25,y:vanishing.y},{x:w*.97,y:h},{x:w*.03,y:h}], 'rgba(20,5,14,.84)');
      for(let i=0;i<32;i++){
        const p=i/32;const yy=vanishing.y+(h-vanishing.y)*p*p;
        const half=(w*.45)*p*p;
        const a={x:vanishing.x-half,y:yy},b={x:vanishing.x+half,y:yy};
        strokeLine(ctx,a,b,`rgba(220,25,65,${.035+p*.18})`,1);
      }
      for(const side of [-1,1])strokeLine(ctx,{x:vanishing.x+side*25,y:vanishing.y},{x:vanishing.x+side*w*.44,y:h},'rgba(241,52,87,.48)',1.3,10);
      // Floating red signal lights / lantern-like indicators, original technological treatment.
      for(let i=0;i<19;i++){
        const q=rnd(i*11.9),near=.25+.75*q,px=vanishing.x+(rnd(i*17.7)-.5)*w*(.15+near*.9),py=h*(.12+rnd(i*27.2)*.70);
        const float=Math.sin(time*.0009+i)*4*near;
        const rr=2+near*5.5;
        ctx.save();ctx.shadowColor=i%3?'#ff476a':'#ffbc79';ctx.shadowBlur=20+near*20;
        ctx.fillStyle=i%3?'rgba(255,53,101,.63)':'rgba(255,182,111,.75)';ctx.beginPath();ctx.arc(px,py+float,rr,0,TAU);ctx.fill();ctx.restore();
      }
      // High-speed digital rain, foreground gets greater parallax.
      for(let i=0;i<90;i++){
        const depth=rnd(i*27.3);const x=(rnd(i*11.1)*w+time*.003*(.2+depth)+mouse.x*depth*19)%w;
        const y=(rnd(i*19.9)*h+time*.018*(.2+depth))%h;
        ctx.fillStyle=`rgba(255,92,121,${(.035+depth*.18)})`;ctx.fillRect(x,y,1,4+depth*15);
      }
      if(time-clickTime<1200){const t=(time-clickTime)/1200;ctx.save();ctx.lineWidth=2;ctx.strokeStyle=`rgba(255,128,141,${1-t})`;ctx.shadowColor='#ff496a';ctx.shadowBlur=30;ctx.beginPath();ctx.arc(clickPos.x,clickPos.y,t*280,0,TAU);ctx.stroke();ctx.restore();}
      const curtain=ctx.createLinearGradient(0,0,0,h);curtain.addColorStop(0,'rgba(3,0,5,.62)');curtain.addColorStop(.3,'rgba(4,0,7,.25)');curtain.addColorStop(.7,'rgba(3,0,7,.46)');curtain.addColorStop(1,'rgba(3,0,7,.92)');ctx.fillStyle=curtain;ctx.fillRect(0,0,w,h);
    }
    surface.start(draw);
  }

  // Gentle cryptographic character scrambles for major calls to action.
  function scrambleLinks(){
    if(reduce.matches||mobile.matches)return;
    const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    document.querySelectorAll('.topbar-cta > span:first-child,.world-outline > span:first-child').forEach(el=>{
      const original=el.textContent;let raf=0;
      el.addEventListener('pointerenter',()=>{
        if(raf)cancelAnimationFrame(raf);const start=performance.now();
        function frame(now){const ratio=clamp((now-start)/650,0,1);const n=Math.floor(ratio*original.length);el.textContent=[...original].map((ch,i)=>ch===' '?ch:i<n?ch:alphabet[Math.floor(rnd(i*9+now/44)*alphabet.length)]).join('');if(ratio<1)raf=requestAnimationFrame(frame);else el.textContent=original;}
        raf=requestAnimationFrame(frame);
      });
      el.addEventListener('pointerleave',()=>{if(raf)cancelAnimationFrame(raf);el.textContent=original;});
    });
  }
  archive();neonDistrict();scrambleLinks();
})();
