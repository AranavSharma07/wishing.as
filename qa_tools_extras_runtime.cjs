/* Runtime regression checks for saved-wish backup/restore, personal date planner and invitation card export. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

class FakeElement {
  constructor(id='') { this.id=id; this.value=''; this.textContent=''; this.innerHTML=''; this.listeners={}; this.attributes={}; this.dataset={}; this.children=[]; this.files=[]; this.disabled=false; this.style={}; this.download=''; this.href=''; this.parentNode=null; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  async dispatch(type, event={}) { const e={currentTarget:this,target:this,...event}; for (const fn of (this.listeners[type]||[])) await fn(e); }
  setAttribute(k,v) { this.attributes[k]=String(v); }
  removeAttribute(k) { delete this.attributes[k]; }
  appendChild(n) { this.children.push(n); n.parentNode=this; return n; }
  remove() { this.removed=true; if(this.parentNode) this.parentNode.children=this.parentNode.children.filter(x=>x!==this); }
  click() { this.clicked=true; for(const fn of (this.listeners.click||[])) fn({currentTarget:this,target:this}); if(this.download) downloads.push({name:this.download,href:this.href}); }
  querySelectorAll(sel) { if(sel==='.favorite-item p') { const count=(this.innerHTML.match(/class="favorite-item"/g)||[]).length; return Array.from({length:count},()=>new FakeElement('p')); } return []; }
}
const ids=['backupFavorites','favoriteStatus','importFavorites','favoritesImportFile','favoriteList','personalReminderList','personalReminderName','personalReminderType','personalReminderDate','addPersonalReminder','personalReminderStatus','exportPersonalReminders','inviteEvent','inviteDate','inviteTime','invitePlace','inviteHost','inviteCardTheme','inviteCardFormat','downloadInviteText','inviteStatus','downloadInviteCard'];
const elements=Object.fromEntries(ids.map(id=>[id,new FakeElement(id)]));
Object.assign(elements.personalReminderType,{value:'Birthday'}); Object.assign(elements.inviteCardTheme,{value:'gold'}); Object.assign(elements.inviteCardFormat,{value:'square'});
const store=new Map(); const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const downloads=[]; const blobs=[]; let blobCount=0;
const mockURL={createObjectURL(blob){blobs.push(blob);return `blob:qa-${++blobCount}`;},revokeObjectURL(){}};
function fakeCanvas(){const gradient={addColorStop(){}};const ctx={imageSmoothingEnabled:false,measureText(t){return {width:String(t).length*18};},createLinearGradient(){return gradient;},createRadialGradient(){return gradient;},fillRect(){},strokeRect(){},fillText(){}};const c=new FakeElement('canvas');c.getContext=()=>ctx;c.toBlob=cb=>cb(new Blob(['fake-png'],{type:'image/png'}));c.toDataURL=()=> 'data:image/png;base64,UE5H';return c;}
const document={getElementById:id=>elements[id]||(elements[id]=new FakeElement(id)),createElement:tag=>tag==='canvas'?fakeCanvas():new FakeElement(tag),body:new FakeElement('body'),fonts:{ready:Promise.resolve()},};
const context={document,localStorage,window:{setTimeout,clearTimeout},URL:mockURL,Blob,Uint8Array,Date,Math,Intl,Promise,JSON,String,Number,Array,Object,RegExp,Error,console,atob, setTimeout,clearTimeout};
vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/tools-extras.js','utf8'),context,{filename:'tools-extras.js'});
(async()=>{
  // Backup exports the supported schema and never loses the current wishes.
  store.set('wishingasr-favorites',JSON.stringify([{text:'Namaste family',created:'2026-01-01T00:00:00.000Z'}]));
  await elements.backupFavorites.dispatch('click');
  assert.equal(downloads.at(-1).name,'wishingasr-saved-wishes-backup.json');
  const backup=JSON.parse(await blobs.at(-1).text()); assert.equal(backup.product,'WishingASR'); assert.equal(backup.items[0].text,'Namaste family');
  // Restore accepts a valid backup, de-duplicates existing messages and reports the result.
  elements.favoritesImportFile.files=[{size:100,text:async()=>JSON.stringify({product:'WishingASR',schemaVersion:1,items:[{text:'Namaste family'},{text:'A new wish'},{text:'A new wish'}]})}];
  await elements.favoritesImportFile.dispatch('change');
  const restored=JSON.parse(localStorage.getItem('wishingasr-favorites')); assert.deepEqual(restored.map(x=>x.text),['Namaste family','A new wish']); assert.match(elements.favoriteStatus.textContent,/1 wish restored/i);
  // Invalid/unsupported content is rejected without damaging existing data.
  elements.favoritesImportFile.files=[{size:30,text:async()=>'{bad json'}]; await elements.favoritesImportFile.dispatch('change');
  assert.match(elements.favoriteStatus.textContent,/could not restore|property name|unexpected token/i); assert.equal(JSON.parse(localStorage.getItem('wishingasr-favorites')).length,2);
  // Birthday planner validates dates, stores locally and exports recurring ICS.
  elements.personalReminderName.value='Asha'; elements.personalReminderType.value='Birthday'; elements.personalReminderDate.value='2026-02-30';
  await elements.addPersonalReminder.dispatch('click'); assert.match(elements.personalReminderStatus.textContent,/valid calendar date/i); assert.equal(localStorage.getItem('wishingasr-personal-dates-v1'),null);
  elements.personalReminderDate.value='1995-04-05'; await elements.addPersonalReminder.dispatch('click');
  const dates=JSON.parse(localStorage.getItem('wishingasr-personal-dates-v1')); assert.equal(dates.length,1); assert.equal(dates[0].name,'Asha');
  await elements.exportPersonalReminders.dispatch('click'); assert.equal(downloads.at(-1).name,'wishingasr-birthdays-anniversaries.ics');
  const ics=await blobs.at(-1).text(); assert.match(ics,/BEGIN:VCALENDAR/); assert.match(ics,/RRULE:FREQ=YEARLY/); assert.match(ics,/BEGIN:VALARM/); assert.match(ics,/TRIGGER:-P1D/);
  // Invitation text and PNG downloads produce the expected files and success state.
  elements.inviteEvent.value='Family Celebration'; elements.inviteDate.value='2026-12-20'; elements.inviteTime.value='18:30'; elements.invitePlace.value='Patna'; elements.inviteHost.value='Asha';
  await elements.downloadInviteText.dispatch('click'); assert.equal(downloads.at(-1).name,'wishingasr-invitation.txt'); assert.match(await blobs.at(-1).text(),/Family Celebration/);
  await elements.downloadInviteCard.dispatch('click'); assert.equal(downloads.at(-1).name,'wishingasr-invitation-square.png'); assert.match(elements.inviteStatus.textContent,/downloaded/i); assert.equal(elements.downloadInviteCard.disabled,false);
  console.log('PASS: saved-wish JSON backup/restore/deduplication and malformed-file safety; date validation/local planner/recurring ICS alarm; invitation TXT and PNG exports.');
})().catch(error=>{console.error(error);process.exitCode=1;});
