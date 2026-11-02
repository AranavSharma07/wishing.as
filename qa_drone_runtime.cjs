const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const app = fs.readFileSync(__dirname + '/app.js', 'utf8');
const start = app.indexOf('function renderOccasionDroneShow(id){');
const end = app.indexOf('\nfunction applyFestivalMotion(id)', start);
assert(start >= 0 && end > start, 'drone renderer function must exist');
const rendererSource = app.slice(start, end);
const motifBlock = app.match(/const motifs=\{([\s\S]*?)\};\s*const set=/);
const shapeBlock = app.match(/const shapes=\{([\s\S]*?)\n \};/);
assert(motifBlock && shapeBlock, 'occasion motif and drone shape maps must exist');
const motifKeys = [...motifBlock[1].matchAll(/([A-Za-z][\w]*):\[/g)].map(m=>m[1]);
const shapeEntries = [...shapeBlock[1].matchAll(/([A-Za-z][\w]*):([A-Za-z][\w]*)/g)];
const shapeKeys = new Set(shapeEntries.map(m=>m[1]));
assert(new Set(shapeEntries.map(m=>m[2])).size===shapeEntries.length, 'each occasion must have a distinct visual formation function');
for (const key of motifKeys) assert(shapeKeys.has(key), `${key}: each occasion particle theme must have a drone formation`);

const occasionIds = [
  'diwali','christmas','holi','eid','newyear','rakhi','birthday','wedding','anniversary',
  'valentine','rose','propose','chocolate','teddy','promise','hug','kiss','pongal','ganesh',
  'navratri','dussehra','janmashtami','baisakhi','buddha','chhath','republicday',
  'independenceday','gandhijayanti','constitutionday','nationalunityday','nationalyouthday',
  'votersday','scienceday','technologyday','kargilvijaydiwas','sportsday','teachersday',
  'hindidiwas','airforceday','educationday','childrensday','armyday','navyday',
  'ambedkarjayanti','girlchildday'
];

function makeContext(width) {
  const svg = { innerHTML: '', attrs: {}, dataset:{}, setAttribute(k,v){ this.attrs[k]=v; } };
  const caption = { textContent: '', dataset: {} };
  const listeners = {};
  const stage = {
    dataset: {},
    attrs:{},setAttribute(k,v){this.attrs[k]=v;},
    classList: { values:new Set(), toggle(name,on){ if(on)this.values.add(name); else this.values.delete(name); }, add(name){this.values.add(name);} },
    addEventListener(){},
    getBoundingClientRect(){return {width:window.innerWidth};}
  };
  class FakeObserver {
    constructor(cb){this.cb=cb;}
    observe(target){this.cb([{isIntersecting:true,target}]);}
  }
  const window = {
    innerWidth: width,
    matchMedia(query){return {matches: query.includes('max-width:600px') ? this.innerWidth<=600 : query.includes('max-width:1000px') ? this.innerWidth<=1000 : false};},
    IntersectionObserver: FakeObserver,
    addEventListener(name,fn){listeners[name]=fn;},
  };
  const context = {
    window,
    IntersectionObserver: FakeObserver,
    $:(id)=>id==='occasionDroneShow'?svg:id==='heroIllustration'?stage:id==='droneShowCaption'?caption:null,
    Math, Array, String, Number, Object, parseInt, console,
  };
  vm.createContext(context);
  vm.runInContext(rendererSource,context);
  context.renderOccasionDroneShow = vm.runInContext('renderOccasionDroneShow',context);
  return {context,svg,caption,stage,listeners,window};
}

// All supported festival and national-day IDs must yield a valid, non-empty drone formation.
const desktop = makeContext(1440);
const choreographyModes=new Set();
for (const id of occasionIds) {
  desktop.context.renderOccasionDroneShow(id);
  const matches = desktop.svg.innerHTML.match(/class="drone-unit"/g) || [];
  assert(matches.length > 0, `${id}: formation should not be empty`);
  assert(matches.length <= 52, `${id}: desktop point limit exceeded`);
  assert(!/A sky full of Celebration magic/.test(desktop.caption.textContent), `${id}: friendly caption is required`);
  assert(desktop.svg.attrs['aria-hidden']==='true', `${id}: decorative SVG should be hidden from duplicate announcement`);
  assert(desktop.svg.attrs['data-occasion']===id, `${id}: SVG must expose its occasion-specific animation theme`);
  assert(desktop.svg.attrs['data-choreography'], `${id}: distinct choreography profile should be exposed`);
  choreographyModes.add(desktop.svg.attrs['data-choreography']);
  assert(desktop.svg.innerHTML.includes(`--drone-animation:drone-${id}-enter`), `${id}: each occasion must use its own named drone flight animation`);
  assert(/--drone-offset-x:[-0-9.]+px/.test(desktop.svg.innerHTML), `${id}: drone units need flight-in offsets`);
  assert(/--drone-delay:[0-9.]+s/.test(desktop.svg.innerHTML), `${id}: drone units need staggered entry timing`);
  assert(desktop.stage.dataset.occasion===id, `${id}: stage occasion state should be updated`);
  assert(desktop.stage.attrs['aria-label'].includes('drone light show'), `${id}: stage must have a friendly accessible name`);
  assert(desktop.stage.classList.values.has('is-visible'), `${id}: visible hero should start its light animation`);
  const pointCoords = [...desktop.svg.innerHTML.matchAll(/cx=\"([0-9.]+)\" cy=\"([0-9.]+)\"/g)];
  for (const [,x,y] of pointCoords) { assert(+x>=0 && +x<=800 && +y>=0 && +y<=460, `${id}: drone coordinate outside viewBox`); }
}

assert(choreographyModes.size===occasionIds.length, 'every supported occasion must have a distinct choreography mode');

// Dense fireworks layout must be capped more tightly on a phone than on desktop.
const mobile = makeContext(390);
mobile.context.renderOccasionDroneShow('newyear');
const mobileCount = (mobile.svg.innerHTML.match(/class="drone-unit"/g) || []).length;
assert(mobileCount <= 24, 'mobile drone point limit exceeded');
desktop.context.renderOccasionDroneShow('newyear');
const desktopCount = (desktop.svg.innerHTML.match(/class="drone-unit"/g) || []).length;
assert(desktopCount <= 52, 'desktop drone point limit exceeded');
assert(mobileCount < desktopCount, 'mobile should render fewer drone points than desktop');
assert(mobile.stage.dataset.droneBucket==='mobile', 'mobile responsive bucket should be set');
mobile.window.innerWidth=1440;
mobile.listeners.resize();
const resizedCount=(mobile.svg.innerHTML.match(/class="drone-unit"/g)||[]).length;
assert(mobile.stage.dataset.droneBucket==='desktop' && resizedCount<=52 && resizedCount>mobileCount, 'resize listener should rebuild at the new viewport limit');

const stylesheet=fs.readFileSync(__dirname + '/styles.css','utf8');
assert(app.includes('@keyframes drone-formation-enter') || stylesheet.includes('@keyframes drone-formation-enter'), 'staggered formation entrance animation must be present');
for(const id of occasionIds) assert(stylesheet.includes(`@keyframes drone-${id}-enter`), `${id}: unique CSS flight animation must exist`);
const profileBlock=app.match(/const flightProfiles=\{([\s\S]*?)\n \};\n const baseFlight=/);
assert(profileBlock, 'complete occasion flight profile map must exist');
const profileKeys=[...profileBlock[1].matchAll(/^\s*([a-z][a-z0-9]*):\{/gm)].map(m=>m[1]);
for(const id of occasionIds) assert(profileKeys.includes(id), `${id}: unique event flight profile must exist`);
assert(new Set(profileKeys).size===occasionIds.length, 'each occasion profile key must be unique');
assert(stylesheet.includes('@keyframes drone-twinkle'), 'light twinkle animation must be present');
assert(stylesheet.includes('.drone-show-stage.is-visible .drone-light'), 'all light animations must pause offscreen and resume when visible');
assert(stylesheet.includes('opacity:1!important;transform:none!important'), 'reduced-motion mode must still show every drone light');
console.log(`PASS: ${occasionIds.length} occasion IDs, 45 distinct drone motifs, 45 choreography modes, unique flight profiles and named keyframes, occasion data attributes, flight offsets/delays, accessible labels, coordinate bounds, resize behaviour, and responsive point caps (${mobileCount} mobile / ${desktopCount} desktop).`);
