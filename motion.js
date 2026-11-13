// Cinema-style movement. Anime.js 4.5 WAAPI is preferred; native Element.animate is its offline fallback.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const $ = (s) => document.querySelector(s);
let animeWaapi = null;
let stagger = null;

// The import is asynchronous on purpose: a blocked CDN must never prevent opening the site.
import('https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm')
  .then((module) => { animeWaapi = module.waapi; stagger = module.stagger; document.documentElement.dataset.motionEngine = 'animejs-waapi'; })
  .catch(() => { document.documentElement.dataset.motionEngine = 'native-waapi'; });

const easing = 'cubic-bezier(.16,1,.3,1)';
function play(el, properties, {duration = 850, delay = 0, ease = 'out(4)', fill = 'both'} = {}) {
  if (!el || reduced.matches || !Element.prototype.animate) return null;
  if (animeWaapi) {
    try { return animeWaapi.animate(el,{...properties,duration,delay,ease}); } catch (_) { /* native fallback below */ }
  }
  const frames = [{},{}];
  for (const [key,values] of Object.entries(properties)) {
    frames[0][key] = Array.isArray(values) ? values[0] : values;
    frames[1][key] = Array.isArray(values) ? values[values.length-1] : values;
  }
  return el.animate(frames,{duration,delay,easing:easing,fill});
}
function translateIn(el, {distance=52,delay=0,duration=850,x=0} = {}) {
  return play(el,{
    opacity:[0,1],
    translate:[`${x}px ${distance}px`,'0px 0px']
  },{duration,delay});
}
function linesIn(selector,{delay=0,step=120,duration=1080}={}) {
  document.querySelectorAll(selector).forEach((el,index) => play(el,{
    transform:['translate3d(0,112%,0)','translate3d(0,0,0)'],
    opacity:[.9,1]
  },{duration,delay:delay+index*step}));
}

// Loading counter + full-screen vertical shutter transition, then kinetic hero typography.
const intro = $('#intro');
const counter = $('#intro-counter');
const bar = $('#intro-bar');
let introDone = false;
let introRaf = 0;
function heroEntrance() {
  document.documentElement.classList.add('hero-live');
  linesIn('.hero-title .mask-line > span',{delay:40,step:145,duration:1400});
  translateIn($('.hero-eyebrow'),{delay:80,distance:24,duration:850});
  translateIn($('.hero-bottom-row'),{delay:650,distance:42,duration:1100});
  play($('.hero-orbit'),{opacity:[0,.98]}, {duration:1800,delay:180});
  play($('.hero-hud'),{opacity:[0,1]}, {duration:1000,delay:900});
}
function finishIntro() {
  if (introDone) return;
  introDone = true;
  cancelAnimationFrame(introRaf);
  counter.textContent = '100%';
  bar.style.transform = 'scaleX(1)';
  intro.classList.add('is-closing');
  window.setTimeout(() => {
    intro.classList.add('is-done');
    intro.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    heroEntrance();
  },reduced.matches ? 0 : 1170);
}
function runIntro() {
  if (reduced.matches || (window.location.hash && window.location.hash !== '#home')) {
    introDone = true;
    intro.classList.add('is-done');
    intro.setAttribute('aria-hidden','true');
    heroEntrance();
    return;
  }
  document.body.style.overflow = 'hidden';
  const start = performance.now();
  const duration = 1700;
  function tick(now) {
    if (introDone) return;
    const t = Math.min(1,(now-start)/duration);
    const eased = 1-Math.pow(1-t,2.5);
    const val = Math.round(eased*100);
    counter.textContent = `${String(val).padStart(3,'0')}%`;
    bar.style.transform = `scaleX(${eased})`;
    if (t < 1) introRaf=requestAnimationFrame(tick);
    else finishIntro();
  }
  introRaf = requestAnimationFrame(tick);
}
$('#intro-skip').addEventListener('click',finishIntro);
if (!reduced.matches) document.documentElement.classList.add('motion-ready');
runIntro();

// Reveal typography by actual masked movement; reveal secondary elements with stagger.
if ('IntersectionObserver' in window && !reduced.matches) {
  const once = new WeakSet();
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || once.has(entry.target)) return;
      once.add(entry.target);
      revealObserver.unobserve(entry.target);
      const el = entry.target;
      if (el.matches('.about-heading,.work-heading,.credentials-heading,.contact-heading')) {
        el.querySelectorAll('.mask-line > span').forEach((line,i) => play(line,{transform:['translate3d(0,115%,0)','translate3d(0,0,0)']},{duration:1200,delay:i*140}));
      } else {
        el.classList.add('in-view');
        const within = el.closest('.cert-grid');
        const idx = within ? [...within.children].indexOf(el) : 0;
        translateIn(el,{distance:within?75:46,delay:within?idx*125:0,duration:900});
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -55px 0px'});
  document.querySelectorAll('.reveal-scene,.about-heading,.work-heading,.credentials-heading,.contact-heading').forEach((el) => revealObserver.observe(el));
  const stageObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    stageObserver.disconnect();
    play($('#showcase-image'),{transform:['scale(1.16)','scale(1)'],opacity:[.4,1]},{duration:1400});
    translateIn($('.showcase-info'),{distance:60,duration:1050,delay:160});
    document.querySelectorAll('.film-tile').forEach((tile,i) => translateIn(tile,{distance:28,duration:700,delay:i*55}));
  },{threshold:.19});
  stageObserver.observe($('#showcase'));
}

// Project transitions are two-stage wipes. The image is replaced under the cover, never flashed.
let wiping = false;
document.addEventListener('portfolio:project-request', (event) => {
  if (reduced.matches || !Element.prototype.animate || wiping) return;
  event.preventDefault();
  wiping = true;
  const {commit,done} = event.detail;
  const wipe = $('#visual-wipe');
  const cover = wipe.animate([
    {transform:'translateX(-101%)'},{transform:'translateX(0%)'}
  ],{duration:370,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});
  cover.finished.then(() => {
    commit();
    const reveal = wipe.animate([
      {transform:'translateX(0%)'},{transform:'translateX(101%)'}
    ],{duration:455,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});
    translateIn($('#showcase-image'),{distance:0,duration:650});
    play($('#showcase-image'),{transform:['scale(1.10)','scale(1)']},{duration:950});
    $('#showcase-copy').querySelectorAll('h3,p,.showcase-kicker,.showcase-tech').forEach((el,i) => translateIn(el,{distance:30,delay:i*90,duration:680}));
    reveal.finished.then(() => { cover.cancel(); reveal.cancel(); wiping=false; done(); }).catch(() => {wiping=false;done();});
  }).catch(() => {commit();wiping=false;done();});
});

// Pointer-based light & tactile interaction.
if (finePointer.matches && !reduced.matches) {
  const cursor = $('#custom-cursor');
  let x=-100,y=-100,cx=-100,cy=-100;
  let active = false;
  window.addEventListener('pointermove',(e) => { x=e.clientX;y=e.clientY;if (!active) {active=true;cursor.style.opacity='1';} },{passive:true});
  document.addEventListener('pointerover',(e) => {cursor.classList.toggle('hovering',!!e.target.closest('a,button,.film-tile'));});
  document.addEventListener('pointerout',(e) => {if (!e.relatedTarget) cursor.classList.remove('hovering');});
  function follow() { cx+=(x-cx)*.19;cy+=(y-cy)*.19;cursor.style.transform=`translate3d(${cx-15}px,${cy-15}px,0)`;requestAnimationFrame(follow); }
  requestAnimationFrame(follow);
  document.querySelectorAll('.magnetic').forEach((el) => {
    let raf=0;
    el.addEventListener('pointermove',(ev) => {
      if (raf) return;
      raf=requestAnimationFrame(() => {
        const b=el.getBoundingClientRect();
        const dx=(ev.clientX-(b.left+b.width/2))*.12;
        const dy=(ev.clientY-(b.top+b.height/2))*.12;
        el.style.transform=`translate3d(${dx}px,${dy}px,0)`;
        raf=0;
      });
    },{passive:true});
    el.addEventListener('pointerleave',() => {el.style.transform='translate3d(0,0,0)';});
  });
}

