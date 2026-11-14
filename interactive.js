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
  // Contact headline stays solid; reactive environment uses fracture.js instead.
  mountTactileSurfaces();
})();
