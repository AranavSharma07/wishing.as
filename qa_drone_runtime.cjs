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
const shapeKeys = new Set([...shapeBlock[1].matchAll(/([A-Za-z][\w]*):/g)].map(m=>m[1]));
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
  const svg = { innerHTML: '', attrs: {}, setAttribute(k,v){ this.attrs[k]=v; } };
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
for (const id of occasionIds) {
  desktop.context.renderOccasionDroneShow(id);
  const matches = desktop.svg.innerHTML.match(/class="drone-unit"/g) || [];
  assert(matches.length > 0, `${id}: formation should not be empty`);
  assert(matches.length <= 52, `${id}: desktop point limit exceeded`);
  assert(!/A sky full of Celebration magic/.test(desktop.caption.textContent), `${id}: friendly caption is required`);
  assert(desktop.svg.attrs['aria-hidden']==='true', `${id}: decorative SVG should be hidden from duplicate announcement`);
  assert(desktop.stage.dataset.occasion===id, `${id}: stage occasion state should be updated`);
  assert(desktop.stage.attrs['aria-label'].includes('drone light show'), `${id}: stage must have a friendly accessible name`);
  assert(desktop.stage.classList.values.has('is-visible'), `${id}: visible hero should start its light animation`);
  const pointCoords = [...desktop.svg.innerHTML.matchAll(/cx=\"([0-9.]+)\" cy=\"([0-9.]+)\"/g)];
  for (const [,x,y] of pointCoords) { assert(+x>=0 && +x<=800 && +y>=0 && +y<=460, `${id}: drone coordinate outside viewBox`); }
}

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

console.log(`PASS: ${occasionIds.length} occasion IDs, ${motifKeys.length} particle-theme mappings, friendly captions, accessible labels, coordinate bounds, resize behaviour, and responsive point caps (${mobileCount} mobile / ${desktopCount} desktop).`);
