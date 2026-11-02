'use strict';
const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync(__dirname + '/site-ui.js', 'utf8');

function makeClassList(initial = []) {
  const values = new Set(initial);
  return {
    add: (name) => values.add(name),
    remove: (name) => values.delete(name),
    contains: (name) => values.has(name),
    toggle(name) {
      if (values.has(name)) { values.delete(name); return false; }
      values.add(name); return true;
    }
  };
}
function element(initial = {}) {
  const listeners = {};
  return {
    ...initial,
    textContent: initial.textContent || '',
    value: initial.value || '',
    attributes: {},
    listeners,
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
    setAttribute(key, value) { this.attributes[key] = value; },
    dispatch(type, event = {}) { (listeners[type] || []).forEach((fn) => fn(event)); },
    querySelectorAll() { return this.links || []; },
    contains(target) { return this === target || (this.children || []).includes(target); },
    reportValidity() { this.reportedValidity = true; }
  };
}

const yearNow = element(), y = element(), aaYear = element(), errorYear = element();
const link = element();
const nav = element({ classList: makeClassList(), links: [link] });
const toggle = element({ textContent: '☰' });
const name = element({ value: 'Asha' });
const email = element({ value: 'asha@example.com' });
const message = element({ value: 'A safe test message' });
const contact = element();
const ids = { yearNow, y, aaYear, errorYear, menuToggle: toggle, mainNav: nav, name, email, message, contactForm: contact };
const documentListeners = {};
const document = {
  documentElement: { scrollLeft: 0 },
  body: { scrollLeft: 0 },
  getElementById(id) { return ids[id] || null; },
  addEventListener(type, fn) { (documentListeners[type] ||= []).push(fn); }
};
const windowListeners = {};
const scrollCalls = [];
const window = {
  location: { pathname: '/tools', href: '' },
  scrollX: 10,
  scrollY: 40,
  scrollTo(x, y) { scrollCalls.push([x, y]); this.scrollX = x; this.scrollY = y; },
  addEventListener(type, fn) { (windowListeners[type] ||= []).push(fn); }
};
vm.runInNewContext(source, { document, window, Date, encodeURIComponent, String });

const year = String(new Date().getFullYear());
for (const id of ['yearNow', 'y', 'aaYear', 'errorYear']) {
  if (ids[id].textContent !== year) throw new Error(`${id} year was not updated`);
}
toggle.dispatch('click');
if (!nav.classList.contains('open') || toggle.attributes['aria-expanded'] !== 'true' || toggle.textContent !== '×') {
  throw new Error('Menu open state did not synchronize');
}
link.dispatch('click');
if (nav.classList.contains('open') || toggle.attributes['aria-expanded'] !== 'false') {
  throw new Error('Menu link did not close the menu');
}
toggle.dispatch('click');
(documentListeners.keydown || []).forEach((fn) => fn({ key: 'Escape' }));
if (nav.classList.contains('open')) throw new Error('Escape did not close the menu');
toggle.dispatch('click');
(documentListeners.click || []).forEach((fn) => fn({ target: {} }));
if (nav.classList.contains('open')) throw new Error('Outside click did not close the menu');

let prevented = false;
contact.dispatch('submit', { preventDefault() { prevented = true; } });
if (!prevented || !window.location.href.startsWith('mailto:asarnavsharma04@gmail.com?')) {
  throw new Error('Contact form did not prepare the expected mailto action');
}
if (!window.location.href.includes(encodeURIComponent('A safe test message'))) {
  throw new Error('Contact form did not encode message content');
}

document.documentElement.scrollLeft = 4;
document.body.scrollLeft = 5;
(windowListeners.pageshow || []).forEach((fn) => fn());
if (scrollCalls.length !== 1 || document.documentElement.scrollLeft !== 0 || document.body.scrollLeft !== 0) {
  throw new Error('Tools horizontal-position guard failed');
}

// On the homepage, app.js already owns navigation; the shared script must not add duplicate listeners.
const homeMenuListeners = {};
const homeToggle = element({ textContent: '☰' });
const homeNav = element({ classList: makeClassList(), links: [] });
const homeDoc = {
  documentElement: { scrollLeft: 0 }, body: { scrollLeft: 0 },
  getElementById(id) {
    return ({ wishForm: element(), menuToggle: homeToggle, mainNav: homeNav })[id] || null;
  },
  addEventListener(type, fn) { (homeMenuListeners[type] ||= []).push(fn); }
};
const homeWindow = {
  location: { pathname: '/' }, scrollX: 0, scrollY: 0,
  scrollTo() {}, addEventListener() {}
};
vm.runInNewContext(source, { document: homeDoc, window: homeWindow, Date, encodeURIComponent, String });
if ((homeToggle.listeners.click || []).length !== 0) {
  throw new Error('Shared script attached a duplicate homepage menu toggle');
}

console.log('PASS: shared page script year labels, secondary-page mobile menu, Escape/outside close, contact mailto encoding, Tools scroll guard and no duplicate homepage menu listener.');
