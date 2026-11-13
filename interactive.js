/* Interactive motion surfaces: canvas orb physics, destructible type, and tactile gallery cards. */
(() => {
  'use strict';
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (selector) => document.querySelector(selector);
  const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
  const lerp = (a,b,t) => a+(b-a)*t;
  const distance = (x,y) => Math.hypot(x,y);
  const interact = () => !reducedMotion.matches;

  // The sphere runs on Canvas 2D: its dots, meridians, inertia and cursor deformation
  // are updated in a single animation loop, avoiding separate DOM animations.
  function mountInteractiveOrb() {
    const canvas = $('#orb-canvas');
    if (!canvas) return;
    const surface = canvas.closest('.hero-orbit');
    const ctx = canvas.getContext('2d',{alpha:true});
    if (!ctx) return;
    let w=0,h=0,dpr=1,visible=true,raf=0,last=0;
    let yaw=.32,pitch=-.16,velYaw=0,velPitch=0;
    let hover = false, dragging=false, pointerId=null, moved=false;
    let mouse={x:-9999,y:-9999,px:-9999,py:-9999,strength:0};
    let lastPointer={x:0,y:0};
    const pulses=[];
    const points=[];
    const rows=23,columns=44;
    for(let j=0;j<=rows;j++) {
      const lat=-Math.PI/2+j*Math.PI/rows;
      for(let i=0;i<columns;i++) {
        const lon=i*Math.PI*2/columns;
        points.push({x:Math.cos(lat)*Math.cos(lon),y:Math.sin(lat),z:Math.cos(lat)*Math.sin(lon),i,j});
      }
    }
    function resize() {
      const bounds = canvas.getBoundingClientRect();
      w=bounds.width;h=bounds.height;
      dpr=Math.min(window.devicePixelRatio||1,1.8);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    const sizeObserver=new ResizeObserver(()=>{resize();if(reducedMotion.matches) requestAnimationFrame(t=>draw(t,1));});sizeObserver.observe(canvas);resize();
    const visibilityObserver=new IntersectionObserver((entries)=>{
      visible=entries[0].isIntersecting;
      if(visible && !raf) raf=requestAnimationFrame(loop);
    },{rootMargin:'160px'});
    visibilityObserver.observe(surface);
    function local(event) {
      const r=canvas.getBoundingClientRect();
      return {x:event.clientX-r.left,y:event.clientY-r.top};
    }
    function pointInSphere(x,y) {
      const r=Math.min(w,h)*.355;
      return distance(x-w*.515,y-h*.5)<r*1.16;
    }
    function setHover(active) {
      hover=active;
      surface.classList.toggle('orb-hovered',active);
      if (!active) mouse.strength=0;
    }
    function pulse(x,y,power=1) {
      pulses.push({x,y,r:10,life:1,power});
      if(pulses.length>7) pulses.shift();
      surface.classList.remove('orb-pulsed');
      void surface.offsetWidth;
      surface.classList.add('orb-pulsed');
    }
    if (interact()) {
      canvas.addEventListener('pointerenter',(event)=> {
        const p=local(event);
        mouse.x=p.x;mouse.y=p.y;
        setHover(pointInSphere(p.x,p.y));
      });
      canvas.addEventListener('pointermove',(event)=>{
        const p=local(event);
        mouse.px=mouse.x;mouse.py=mouse.y;
        mouse.x=p.x;mouse.y=p.y;
        setHover(dragging || pointInSphere(p.x,p.y));
        mouse.strength=hover ? lerp(mouse.strength,1,.3) : 0;
        if(dragging && event.pointerId===pointerId) {
          const dx=p.x-lastPointer.x;
          const dy=p.y-lastPointer.y;
          if(Math.abs(dx)+Math.abs(dy)>1.5) moved=true;
          yaw+=dx*.0075;
          pitch=clamp(pitch+dy*.0075,-1.25,1.25);
          velYaw=clamp(dx*.006,-.2,.2);
          velPitch=clamp(dy*.006,-.2,.2);
        }
        lastPointer=p;
      },{passive:true});
      canvas.addEventListener('pointerdown',(event)=>{
        const p=local(event);
        if(!pointInSphere(p.x,p.y)) return;
        dragging=true;pointerId=event.pointerId;moved=false;
        lastPointer=p;
        mouse.x=p.x;mouse.y=p.y;
        surface.classList.add('orb-dragging');
        canvas.setPointerCapture(event.pointerId);
      });
      const release=(event)=>{
        if(event.pointerId!==pointerId) return;
        if(!moved) pulse(mouse.x,mouse.y,1.35);
        dragging=false;pointerId=null;
        surface.classList.remove('orb-dragging');
        if(canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      };
      canvas.addEventListener('pointerup',release);
      canvas.addEventListener('pointercancel',release);
      canvas.addEventListener('pointerleave',()=> {if(!dragging) setHover(false);});
      canvas.addEventListener('dblclick',(event)=> {const p=local(event);pulse(p.x,p.y,2.2);});
    }
    function draw(time,dt) {
      if(!w || !h) return;
      ctx.clearRect(0,0,w,h);
      if(!reducedMotion.matches) {
        if(!dragging) {
          yaw+=(velYaw+.0027)*dt;
          pitch=clamp(pitch+velPitch*dt,-1.25,1.25);
          velYaw*=Math.pow(.96,dt);
          velPitch*=Math.pow(.95,dt);
          pitch=lerp(pitch,-.16,.0018*dt);
        }
        mouse.strength=lerp(mouse.strength,hover?1:0,clamp(.09*dt,0,1));
      }
      const r=Math.min(w,h)*.355;
      const cx=w*.515,cy=h*.5;
      const cY=Math.cos(yaw),sY=Math.sin(yaw),cX=Math.cos(pitch),sX=Math.sin(pitch);
      const projection=new Array(points.length);
      for (let n=0;n<points.length;n++) {
        const dot=points[n];
        const rx=dot.x*cY-dot.z*sY;
        const rz=dot.x*sY+dot.z*cY;
        const ry=dot.y*cX-rz*sX;
        const depth=dot.y*sX+rz*cX;
        const perspective=2.55/(2.55-depth*.26);
        let px=cx+rx*r*perspective,py=cy+ry*r*perspective;
        // The mesh flexes away from the cursor and ripples after clicks.
        if(interact()) {
          const dx=px-mouse.x,dy=py-mouse.y;
          const dist=distance(dx,dy);
          const field=r*.36;
          if(dist<field && mouse.strength>.01) {
            const falloff=Math.pow(1-dist/field,2);
            const wave=Math.sin(dist*.055-time*.012)*5;
            const deform=(31+wave)*falloff*mouse.strength;
            const inv=1/Math.max(1,dist);
            px+=dx*inv*deform;
            py+=dy*inv*deform;
          }
          for(const impact of pulses) {
            const from=distance(px-impact.x,py-impact.y);
            const ring=from-impact.r;
            if(Math.abs(ring)<70) {
              const force=Math.sin((ring/70+1)*Math.PI)*18*impact.life*impact.power;
              px+=(px-impact.x)/Math.max(from,1)*force;
              py+=(py-impact.y)/Math.max(from,1)*force;
            }
          }
        }
        projection[n]={x:px,y:py,z:depth};
      }
      const bloom=ctx.createRadialGradient(cx,cy,0,cx,cy,r*1.48);
      bloom.addColorStop(0,hover?'rgba(17,181,162,.19)':'rgba(27,195,188,.085)');
      bloom.addColorStop(.65,'rgba(24,183,171,.022)');bloom.addColorStop(1,'rgba(27,195,188,0)');
      ctx.fillStyle=bloom;ctx.beginPath();ctx.arc(cx,cy,r*1.48,0,Math.PI*2);ctx.fill();
      ctx.lineWidth=hover?1.0:.72;
      for(let n=0;n<points.length;n++) {
        const p=projection[n],dot=points[n];
        const alpha=(.09+Math.max(0,p.z)*.32)*(hover?1.55:1);
        ctx.strokeStyle=`rgba(98,235,224,${Math.min(.88,alpha).toFixed(3)})`;
        // Connect the last longitude to the first for a seamless globe.
        if(dot.j>0) {
          const prev=projection[n-columns];
          ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(p.x,p.y);ctx.stroke();
        }
        const neighbor=projection[n-dot.i+(dot.i+1)%columns];
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(neighbor.x,neighbor.y);ctx.stroke();
        if(dot.j%2===0 && dot.i%2===0) {
          const size=p.z>.2?1.7:1.0;
          ctx.fillStyle=`rgba(181,255,231,${(.25+Math.max(0,p.z)*.63).toFixed(2)})`;
          ctx.beginPath();ctx.arc(p.x,p.y,size,0,Math.PI*2);ctx.fill();
        }
      }
      ctx.strokeStyle=hover?'rgba(137,249,224,.33)':'rgba(118,246,232,.16)';
      ctx.lineWidth=1;
      for(let i=0;i<3;i++) {
        ctx.beginPath();ctx.ellipse(cx,cy,r*(1.02+i*.23),r*(.22+i*.12),(48+i*28)*Math.PI/180,0,2*Math.PI);ctx.stroke();
      }
      for(let i=0;i<8;i++) {
        const phi=time*.00020+i*Math.PI*2/8;
        const px=cx+Math.cos(phi+i)*r*(1.13+(i%3)*.12);
        const py=cy+Math.sin(phi+i)*r*.36;
        ctx.fillStyle=i%3===0?'rgba(197,255,79,.87)':'rgba(129,238,237,.74)';
        ctx.beginPath();ctx.arc(px,py,i%3===0?3.2:1.8,0,Math.PI*2);ctx.fill();
      }
      if(hover && !reducedMotion.matches) {
        const radius=62+5*Math.sin(time*.005);
        const halo=ctx.createRadialGradient(mouse.x,mouse.y,3,mouse.x,mouse.y,radius*1.6);
        halo.addColorStop(0,'rgba(197,255,79,.16)');halo.addColorStop(.45,'rgba(108,244,221,.08)');halo.addColorStop(1,'rgba(108,244,221,0)');
        ctx.fillStyle=halo;ctx.beginPath();ctx.arc(mouse.x,mouse.y,radius*1.6,0,2*Math.PI);ctx.fill();
        ctx.strokeStyle='rgba(197,255,79,.4)';ctx.setLineDash([4,8]);
        ctx.beginPath();ctx.arc(mouse.x,mouse.y,29,0,2*Math.PI);ctx.stroke();ctx.setLineDash([]);
      }
      for(let i=pulses.length-1;i>=0;i--) {
        const wave=pulses[i];
        ctx.strokeStyle=`rgba(197,255,79,${Math.max(0,wave.life*.57)})`;
        ctx.lineWidth=1.5*wave.life;
        ctx.beginPath();ctx.arc(wave.x,wave.y,wave.r,0,2*Math.PI);ctx.stroke();
        wave.r+=12*dt;wave.life-=.018*dt;
        if(wave.life<=0) pulses.splice(i,1);
      }
    }
    function loop(time) {
      raf=0;
      if(!visible) return;
      const dt=clamp((time-last)/16.7,.3,2.3);
      if(time-last>=22 || reducedMotion.matches) {draw(time,dt);last=time;}
      if(!reducedMotion.matches) raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
    reducedMotion.addEventListener('change',()=>{
      if(!raf) raf=requestAnimationFrame(loop);
    });
  }

  // Rasterize the real headline's glyph positions into thousands of particles.
  // We leave the original DOM heading in place for accessibility and no-JS users.
  function mountShatterType() {
    const heading=$('.contact-heading');
    const stage=$('.contact-shatter-stage');
    const canvas=$('#contact-particles');
    if(!heading || !stage || !canvas) return;
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx) return;
    let particles=[],w=0,h=0,dpr=1,active=false,inside=false,raf=0,last=0;
    let hoverX=-10000,hoverY=-10000,speed=0,returnDelay=0;
    let lastPointer={x:0,y:0};
    let hits=[];
    const random=(min,max) => min+Math.random()*(max-min);
    let canInteract=fine.matches && interact();
    function createParticles() {
      const rect=heading.getBoundingClientRect();
      if(!rect.width || !rect.height) return;
      w=rect.width;h=rect.height;
      dpr=Math.min(window.devicePixelRatio||1,1.7);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      // Draw text at glyph-by-glyph DOM positions to respect line breaks and mobile width.
      const mask=document.createElement('canvas');
      mask.width=Math.ceil(w);mask.height=Math.ceil(h);
      const mc=mask.getContext('2d',{willReadFrequently:true});
      mc.textBaseline='top';
      const range=document.createRange();
      const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
      const segments=[];
      let node;
      while((node=walker.nextNode())) {
        const style=getComputedStyle(node.parentElement);
        const fontSize=parseFloat(style.fontSize);
        if(!fontSize || !node.textContent.trim()) continue;
        const color=node.parentElement.closest('i')?'#ff9b77':'#f3eee7';
        mc.fillStyle=color;
        mc.font=`${style.fontWeight || '700'} ${fontSize}px ${style.fontFamily}`;
        for(let i=0;i<node.length;i++) {
          const char=node.textContent[i];
          if(!char.trim()) continue;
          range.setStart(node,i);range.setEnd(node,i+1);
          const r=range.getBoundingClientRect();
          if(r.width<=0||r.height<=0) continue;
          // Range bounds originate from the precise HTML line/glyph placement.
          const x=r.left-rect.left;
          const y=r.top-rect.top-fontSize*.12;
          mc.fillText(char,x,y);
          segments.push({x:x+r.width*.5,color});
        }
      }
      range.detach?.();
      const data=mc.getImageData(0,0,mask.width,mask.height).data;
      const spacing=w<560?3:4;
      const result=[];
      for(let y=0;y<mask.height;y+=spacing) {
        for(let x=0;x<mask.width;x+=spacing) {
          const offset=(y*mask.width+x)*4;
          if(data[offset+3]<98) continue;
          // Deterministic checker sampling prevents flickering on resize.
          if(((x/spacing+y/spacing)|0)%5===0) continue;
          const red=data[offset],green=data[offset+1],blue=data[offset+2];
          const color=(red>green*1.08 && red>blue*1.08)?'255,160,115':'242,240,232';
          result.push({ox:x,oy:y,x,y,vx:0,vy:0,energy:0,r:random(1.1,2.1),color});
        }
      }
      particles=result;
      if(!active) ctx.clearRect(0,0,w,h);
    }
    let resizeScheduled=0;
    const ro=new ResizeObserver(()=>{
      cancelAnimationFrame(resizeScheduled);
      resizeScheduled=requestAnimationFrame(createParticles);
    });
    ro.observe(heading);
    document.fonts?.ready?.then(createParticles);
    createParticles();
    const revealObserver=new IntersectionObserver((entries)=>{
      if(entries.some(e=>e.isIntersecting)) {
        window.setTimeout(createParticles,1500);
        revealObserver.disconnect();
      }
    },{threshold:.12});
    revealObserver.observe(heading);
    function position(event) {
      const rect=heading.getBoundingClientRect();
      return {x:event.clientX-rect.left,y:event.clientY-rect.top};
    }
    function activate() {
      if(!canInteract || !particles.length) return;
      if(!active) {
        active=true;
        stage.classList.add('is-shattering');
        if(!raf) raf=requestAnimationFrame(loop);
      }
    }
    function hit(x,y,force=1,rad=110) {
      if(!canInteract) return;
      for(const p of particles) {
        const dx=p.x-x,dy=p.y-y;
        const distanceSquared=dx*dx+dy*dy;
        if(distanceSquared>rad*rad) continue;
        const dist=Math.sqrt(distanceSquared);
        const falloff=Math.pow(1-dist/rad,1.55);
        const inv=1/Math.max(dist,1);
        const shake=force*falloff;
        // Momentum inherits cursor direction, with randomized shards.
        p.vx+=(dx*inv*random(4,12)+random(-3,3)+lastPointer.vx*.32)*shake;
        p.vy+=(dy*inv*random(4,12)+random(-3,3)+lastPointer.vy*.32)*shake;
        p.energy=1;
      }
      hits.push({x,y,rad:8,life:1});
      if(hits.length>12) hits.shift();
    }
    stage.addEventListener('pointerenter',(event)=>{
      if(!canInteract) return;
      const p=position(event);
      if(p.x<0||p.y<0||p.x>w||p.y>h) return;
      inside=true;activate();
      hoverX=p.x;hoverY=p.y;
      lastPointer={x:p.x,y:p.y,vx:0,vy:0};
      hit(p.x,p.y,.8,105);
    });
    stage.addEventListener('pointermove',(event)=> {
      if(!canInteract) return;
      const p=position(event);
      const within=p.x>=0&&p.y>=0&&p.x<=w&&p.y<=h;
      if(!within) return;
      inside=true;activate();
      const dx=p.x-lastPointer.x,dy=p.y-lastPointer.y;
      speed=clamp(Math.hypot(dx,dy),0,75);
      const steps=Math.max(1,Math.ceil(speed/22));
      const fromX=lastPointer.x,fromY=lastPointer.y;
      lastPointer={x:p.x,y:p.y,vx:dx,vy:dy};
      hoverX=p.x;hoverY=p.y;
      for(let i=1;i<=steps;i++) hit(lerp(fromX,p.x,i/steps),lerp(fromY,p.y,i/steps),.45+speed*.019,105+Math.min(42,speed));
    },{passive:true});
    stage.addEventListener('pointerleave',()=> {
      inside=false;hoverX=-10000;hoverY=-10000;
      returnDelay=0;
    });
    stage.addEventListener('pointerdown',(event)=>{
      if(!canInteract) return;
      const p=position(event);
      activate();
      lastPointer={x:p.x,y:p.y,vx:0,vy:0};
      hit(p.x,p.y,3.6,300);
      hits.push({x:p.x,y:p.y,rad:20,life:1,major:true});
    });
    function loop(now) {
      raf=0;
      if(!active || !particles.length) return;
      const dt=clamp((now-last)/16.7,.35,2.3);last=now;
      ctx.clearRect(0,0,w,h);
      let motion=0;
      const baseSpring=0.029,friction=.88;
      for(let i=0;i<particles.length;i++) {
        const p=particles[i];
        p.vx+=(p.ox-p.x)*baseSpring*dt;
        p.vy+=(p.oy-p.y)*baseSpring*dt;
        p.vx*=Math.pow(friction,dt);
        p.vy*=Math.pow(friction,dt);
        p.x+=p.vx*dt;
        p.y+=p.vy*dt;
        const displacement=Math.abs(p.ox-p.x)+Math.abs(p.oy-p.y);
        motion+=Math.min(displacement,20);
        p.energy=Math.max(0,p.energy-.016*dt);
        const intense=displacement>3;
        ctx.fillStyle=`rgba(${p.color},${intense?1:.82})`;
        const radius=intense?p.r*1.45:p.r;
        ctx.fillRect(p.x-radius*.5,p.y-radius*.5,radius,radius);
        if(intense&&p.energy>.3&&i%7===0){
          ctx.strokeStyle=`rgba(255,160,115,${p.energy*.26})`;
          ctx.lineWidth=.7;
          ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*2,p.y-p.vy*2);ctx.stroke();
        }
      }
      for(let i=hits.length-1;i>=0;i--) {
        const h=hits[i];
        h.rad+= (h.major?23:10)*dt;
        h.life-= (h.major?.018:.04)*dt;
        ctx.strokeStyle=`rgba(255,161,109,${clamp(h.life*.42,0,1)})`;
        ctx.lineWidth=h.major?1.6:1;
        ctx.beginPath();ctx.arc(h.x,h.y,h.rad,0,Math.PI*2);ctx.stroke();
        if(h.life<=0) hits.splice(i,1);
      }
      if(!inside) {
        returnDelay+=dt;
        // Don't jump back to DOM text until shards have almost returned home.
        if(returnDelay>65 && motion/Math.max(particles.length,1)<.85) {
          active=false;
          stage.classList.remove('is-shattering');
          setTimeout(()=>ctx.clearRect(0,0,w,h),300);
        }
      } else returnDelay=0;
      if(active) raf=requestAnimationFrame(loop);
    }
    function onSettingChange() {
      canInteract=fine.matches && interact();
      if(!canInteract) {
        active=false;inside=false;stage.classList.remove('is-shattering');
        ctx.clearRect(0,0,w,h);
      }
    }
    fine.addEventListener('change',onSettingChange);
    reducedMotion.addEventListener('change',onSettingChange);
  }

  // Motion polish on existing cards; only pointer-fine screens get 3D tilt.
  function mountTactileSurfaces() {
    if(!fine.matches || !interact()) return;
    document.querySelectorAll('.cert-card, .showcase-visual').forEach((node)=>{
      let scheduled=0,px=0,py=0;
      node.addEventListener('pointermove',(ev)=>{
        const r=node.getBoundingClientRect();
        px=clamp((ev.clientX-r.left)/r.width,0,1);
        py=clamp((ev.clientY-r.top)/r.height,0,1);
        if(scheduled) return;
        scheduled=requestAnimationFrame(()=>{
          scheduled=0;
          node.style.setProperty('--spot-x',`${(px*100).toFixed(1)}%`);
          node.style.setProperty('--spot-y',`${(py*100).toFixed(1)}%`);
          node.style.setProperty('--tilt-x',`${((.5-py)*6).toFixed(2)}deg`);
          node.style.setProperty('--tilt-y',`${((px-.5)*6).toFixed(2)}deg`);
        });
      },{passive:true});
      node.addEventListener('pointerenter',()=>node.classList.add('pointer-reactive'));
      node.addEventListener('pointerleave',()=>{
        node.classList.remove('pointer-reactive');
        node.style.removeProperty('--tilt-x');node.style.removeProperty('--tilt-y');
      });
    });
  }

  mountInteractiveOrb();
  mountShatterType();
  mountTactileSurfaces();
})();
