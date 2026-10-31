/* Lightweight DOM harness for deterministic WishingASR tools.js interaction tests. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...items) { items.forEach(item => this.values.add(item)); }
  remove(...items) { items.forEach(item => this.values.delete(item)); }
  toggle(item, force) {
    const shouldAdd = force === undefined ? !this.values.has(item) : !!force;
    if (shouldAdd) this.values.add(item); else this.values.delete(item);
    return shouldAdd;
  }
  contains(item) { return this.values.has(item); }
}
class FakeElement {
  constructor(id = '') {
    this.id = id; this.value = ''; this.textContent = ''; this.innerHTML = '';
    this.style = {}; this.dataset = {}; this.attributes = {}; this.listeners = {};
    this.classList = new FakeClassList(); this.children = []; this.hidden = false;
  }
  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  dispatch(type, event = {}) { for (const fn of this.listeners[type] || []) fn(event); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  appendChild(child) { this.children.push(child); return child; }
  remove() { this.removed = true; }
  select() { this.selected = true; }
  click() { this.dispatch('click'); }
}

const ids = [
  'captionName','captionOccasion','captionOutput','captionStatus','captionTone','clearFavorites','contrastToggle',
  'copyCaption','copyInvite','copyWish','displayStatus','downloadCelebrationPage','downloadQuoteCard','downloadReminder',
  'exportFavorites','favoriteList','favoriteStatus','generateWish','inviteDate','inviteEvent','inviteHost','inviteOutput',
  'invitePlace','inviteStatus','inviteTime','mainNav','makeCaption','makeInvite','menuToggle','pageFrom','pageMessage',
  'pageStatus','pageTheme','pageTitle','quoteBy','quoteFormat','quotePalette','quoteStatus','quoteText','reminderDate',
  'reminderName','reminderNotes','reminderOffset','reminderStatus','resetDisplay','saveWish','textLarger','textSmaller',
  'toolYear','wishExtra','wishLang','wishName','wishOccasion','wishOutput','wishStatus','wishTone'
];
const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id)]));
Object.assign(elements.wishOccasion, { value: 'Birthday' });
Object.assign(elements.wishLang, { value: 'en' });
Object.assign(elements.wishTone, { value: 'heartfelt' });
Object.assign(elements.wishName, { value: 'QA Recipient' });
Object.assign(elements.captionOccasion, { value: 'Birthday' });
Object.assign(elements.captionTone, { value: 'warm' });
Object.assign(elements.reminderOffset, { value: '1' });
Object.assign(elements.pageTheme, { value: 'gold' });
Object.assign(elements.quotePalette, { value: 'gold' });
Object.assign(elements.quoteFormat, { value: 'story' });

const storage = new Map();
const localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); }
};
let copyAllowed = true;
const document = {
  getElementById(id) { return elements[id] ||= new FakeElement(id); },
  querySelectorAll() { return []; },
  createElement(tag) { return new FakeElement(tag); },
  execCommand(command) { assert.equal(command, 'copy'); return copyAllowed; },
  documentElement: new FakeElement('documentElement'),
  body: new FakeElement('body')
};
const context = {
  document, localStorage, window: { isSecureContext: false }, navigator: {},
  Intl, Date, Math, JSON, String, Number, Array, Object, RegExp, Promise,
  Blob, URL, console, confirm: () => true, setTimeout: () => 1, clearTimeout: () => {},
  encodeURIComponent, decodeURIComponent
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('tools.js', 'utf8'), context, { filename: 'tools.js' });

// Copy actions must never copy untouched placeholder instructions.
elements.copyInvite.click();
assert.match(elements.inviteStatus.textContent, /Create an invitation first/i);
elements.copyCaption.click();
assert.match(elements.captionStatus.textContent, /Create a caption first/i);

// Wish generation, copy and persistence.
elements.generateWish.click();
assert.ok(elements.wishOutput.textContent.length > 20, 'wish generator should create meaningful content');
elements.copyWish.click();
assert.equal(elements.wishStatus.textContent, 'Copied to clipboard.');
elements.saveWish.click();
let saved = JSON.parse(localStorage.getItem('wishingasr-favorites'));
assert.equal(saved.length, 1);
assert.match(saved[0].text, /QA Recipient/);

// Invitation and caption must be created before copy becomes available.
elements.inviteEvent.value = 'Product launch';
elements.makeInvite.click();
assert.match(elements.inviteOutput.textContent, /Product launch/);
elements.copyInvite.click();
assert.equal(elements.inviteStatus.textContent, 'Copied to clipboard.');
elements.makeCaption.click();
assert.ok(elements.captionOutput.textContent.length > 5);
elements.copyCaption.click();
assert.equal(elements.captionStatus.textContent, 'Copied to clipboard.');

// A failed legacy copy command must not report a false success.
copyAllowed = false;
elements.copyWish.click();
assert.match(elements.wishStatus.textContent, /Copy unavailable/i);
copyAllowed = true;

// Invalid localStorage data must not crash saving or rendering favourites.
localStorage.setItem('wishingasr-favorites', '{"not":"an array"}');
elements.saveWish.click();
assert.match(elements.favoriteList.innerHTML, /favorite-item|No saved wishes/);

console.log('PASS: wish generation/copy/save, placeholder guards, invitation/caption copy, failed-copy feedback, corrupt storage recovery.');
