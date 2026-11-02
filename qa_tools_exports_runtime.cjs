/* Expanded runtime regression suite for every export tool on tools.html. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...items) { items.forEach(x => this.values.add(x)); }
  remove(...items) { items.forEach(x => this.values.delete(x)); }
  toggle(item, force) { const yes = force === undefined ? !this.values.has(item) : !!force; yes ? this.values.add(item) : this.values.delete(item); return yes; }
  contains(item) { return this.values.has(item); }
}
class FakeElement {
  constructor(tagOrId = '') {
    this.id = tagOrId; this.tagName = String(tagOrId).toUpperCase(); this.value = ''; this.textContent = ''; this.innerHTML = '';
    this.style = {}; this.dataset = {}; this.attributes = {}; this.listeners = {}; this.classList = new FakeClassList(); this.children = [];
    this.hidden = false; this.download = ''; this.href = '';
  }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  dispatch(type, event = {}) { return (this.listeners[type] || []).map(fn => fn(event)); }
  setAttribute(k,v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  appendChild(node) { this.children.push(node); node.parentNode = this; return node; }
  remove() { this.removed = true; }
  select() { this.selected = true; }
  click() { this.dispatch('click'); if (this.download) downloads.push({name:this.download, href:this.href}); }
  closest() { return null; }
}

const ids = [
  'captionName','captionOccasion','captionOutput','captionStatus','captionTone','clearFavorites','contrastToggle','copyCaption','copyInvite','copyWish','displayStatus','downloadCelebrationPage','downloadQuoteCard','downloadReminder','exportFavorites','favoriteList','favoriteStatus','generateWish','inviteDate','inviteEvent','inviteHost','inviteOutput','invitePlace','inviteStatus','inviteTime','mainNav','makeCaption','makeInvite','menuToggle','pageFrom','pageMessage','pageStatus','pageTheme','pageTitle','quoteBy','quoteFormat','quotePalette','quoteStatus','quoteText','quoteLettering','reminderDate','reminderName','reminderNotes','reminderOffset','reminderStatus','resetDisplay','saveWish','textLarger','textSmaller','toolYear','wishExtra','wishLang','wishName','wishOccasion','wishOutput','wishStatus','wishTone'
];
const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id)]));
Object.assign(elements.wishOccasion,{value:'Birthday'}); Object.assign(elements.wishLang,{value:'en'}); Object.assign(elements.wishTone,{value:'heartfelt'});
Object.assign(elements.captionOccasion,{value:'Birthday'}); Object.assign(elements.captionTone,{value:'warm'}); Object.assign(elements.reminderOffset,{value:'3'});
Object.assign(elements.pageTheme,{value:'rose'}); Object.assign(elements.quotePalette,{value:'emerald'}); Object.assign(elements.quoteFormat,{value:'story'}); Object.assign(elements.quoteLettering,{value:'classic'});
const storage = new Map();
const localStorage = {getItem(k){return storage.has(k)?storage.get(k):null;},setItem(k,v){storage.set(k,String(v));},removeItem(k){storage.delete(k);}};
const downloads=[]; const blobs=[]; let objectUrlId=0; let exportMode='null-blob';
const mockURL={createObjectURL(blob){blobs.push(blob);return `blob:qa-${++objectUrlId}`;},revokeObjectURL(){}};
function makeCanvas(){
  const gradient={addColorStop(){}};
  const ctx={measureText(text){return {width:String(text).length*18};},createLinearGradient(){return gradient;},createRadialGradient(){return gradient;},fillRect(){},strokeRect(){},fillText(){}};
  const canvas=new FakeElement('canvas'); canvas.width=0;canvas.height=0;canvas.getContext=()=>ctx;
  if(exportMode==='success')canvas.toBlob=cb=>cb(new Blob(['fake png'],{type:'image/png'}));
  if(exportMode==='null-blob')canvas.toBlob=cb=>cb(null);
  canvas.toDataURL=()=> 'data:image/png;base64,UE5H';
  return canvas;
}
const document={
  getElementById(id){return elements[id] ||= new FakeElement(id);}, querySelectorAll(){return [];},
  createElement(tag){return tag==='canvas'?makeCanvas():new FakeElement(tag);},
  execCommand(cmd){assert.equal(cmd,'copy');return true;},
  documentElement:new FakeElement('html'), body:new FakeElement('body'), fonts:{load(){return Promise.reject(new Error('font unavailable in offline test'));}}, addEventListener(){}
};
const context={document,localStorage,window:{isSecureContext:false},navigator:{},Intl,Date,Math,JSON,String,Number,Array,Object,RegExp,Promise,Blob,Uint8Array,URL:mockURL,console,confirm:()=>true,setTimeout:()=>1,clearTimeout(){},encodeURIComponent,decodeURIComponent,atob};
vm.createContext(context); vm.runInContext(fs.readFileSync('tools.js','utf8'),context,{filename:'tools.js'});

(async()=>{
  // Required-field guards and user-facing validation.
  elements.downloadReminder.click(); assert.match(elements.reminderStatus.textContent,/enter a title and date/i);
  elements.downloadCelebrationPage.click(); assert.match(elements.pageStatus.textContent,/add a title and personal message/i);
  // Reminder .ics export: correct date, alarm offset and escaped multi-line description.
  elements.reminderName.value='Family reminder'; elements.reminderDate.value='2026-12-25'; elements.reminderNotes.value='Line one\r\nLine two, with; punctuation';
  elements.downloadReminder.click(); assert.match(elements.reminderStatus.textContent,/Calendar file downloaded/i);
  let ics=await blobs.at(-1).text(); assert.match(ics,/DTSTART;VALUE=DATE:20261225/); assert.match(ics,/TRIGGER:-P3D/); assert.match(ics,/Line one\\nLine two\\, with\\; punctuation/);
  // User-generated HTML is escaped before it is included in the standalone celebration page.
  elements.pageTitle.value='<img src=x onerror=alert(1)>'; elements.pageMessage.value='Hello <script>alert(1)</script>'; elements.pageFrom.value='A&B';
  elements.downloadCelebrationPage.click(); assert.match(elements.pageStatus.textContent,/standalone celebration page is downloading/i);
  const html=await blobs.at(-1).text(); assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/); assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/); assert.match(html,/A&amp;B/);
  // Quote-card PNG works with failed remote fonts and both native/fallback canvas exporters.
  elements.quoteText.value='A small thought,\nwith a second line.'; elements.quoteBy.value='WishingASR';
  await Promise.all(elements.downloadQuoteCard.dispatch('click')); assert.match(elements.quoteStatus.textContent,/Your quote card is downloading/i);
  assert.ok(downloads.some(x=>x.name==='wishingasr-quote-card.png'));
  exportMode='success'; await Promise.all(elements.downloadQuoteCard.dispatch('click')); assert.match(elements.quoteStatus.textContent,/Your quote card is downloading/i);
  assert.equal(downloads.filter(x=>x.name==='wishingasr-quote-card.png').length,2);
  // Preferences remain bounded and persist; restore resets the saved state.
  for(let i=0;i<10;i++)elements.textLarger.click(); assert.equal(JSON.parse(localStorage.getItem('wishingasr-display')).scale,1.25);
  for(let i=0;i<20;i++)elements.textSmaller.click(); assert.equal(JSON.parse(localStorage.getItem('wishingasr-display')).scale,.9);
  elements.contrastToggle.click(); assert.equal(elements.contrastToggle.getAttribute('aria-pressed'),'true');
  elements.resetDisplay.click(); assert.deepEqual(JSON.parse(localStorage.getItem('wishingasr-display')),{scale:1,contrast:false});
  // Export a saved wish and confirm the download is initiated.
  elements.generateWish.click(); elements.saveWish.click(); elements.exportFavorites.click(); assert.ok(downloads.some(x=>x.name==='wishingasr-saved-wishes.txt'));
  console.log('PASS: reminder ICS export/validation, CRLF escaping, standalone page HTML escaping, quote PNG fallback, saved-wish export, display preference bounds and reset.');
})().catch(error=>{console.error(error);process.exitCode=1;});
