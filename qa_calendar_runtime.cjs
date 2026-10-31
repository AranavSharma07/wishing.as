/* Runtime regression checks for the production calendar render/select functions. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('app.js', 'utf8');

function extractFunction(name, nextName) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf(`function ${nextName}(`, start + 1);
  assert.notEqual(start, -1, `${name} should exist`);
  assert.notEqual(end, -1, `${nextName} should follow ${name}`);
  return source.slice(start, end).trim();
}

class Element {
  constructor() { this.innerHTML = ''; this.textContent = ''; }
}
const elements = {
  calendarMonth: new Element(),
  calendarGrid: new Element(),
  calendarSelection: new Element(),
};
const diwali = { name: 'Diwali', short: 'Festival of lights' };
const context = {
  $: id => elements[id],
  dayNames: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  calendarDate: new Date(2026, 10, 1),
  today: new Date(2026, 9, 31),
  selectedDateKey: '',
  eventDates: { '2026-11-08': [diwali] },
  catalog: { diwali },
  activeId: 'diwali',
  getLocalDateKey: d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
  parseDateKey: key => { const [y,m,d] = key.split('-').map(Number); return new Date(y,m-1,d); },
  escapeHtml: value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  toast: message => { context.lastToast = message; },
};
context.setTheme = id => { context.activeId = id; context.renderCalendar(); };
vm.createContext(context);
vm.runInContext([
  extractFunction('renderCalendar', 'renderCalendarSelection'),
  extractFunction('renderCalendarSelection', 'upcomingItems'),
  extractFunction('handleCalendarDate', 'getDateForAutomaticTheme'),
].join('\n'), context, { filename: 'app.js calendar functions' });

context.renderCalendar();
assert.match(elements.calendarMonth.textContent, /November 2026/);
assert.match(elements.calendarGrid.innerHTML, /data-date="2026-11-08"/);
assert.match(elements.calendarGrid.innerHTML, /aria-label="November 8, 2026 — Diwali"/);
assert.match(elements.calendarGrid.innerHTML, /class="day-cell has-event/);

context.handleCalendarDate('2026-11-08');
assert.equal(context.selectedDateKey, '2026-11-08');
assert.equal(context.activeId, 'diwali');
assert.match(elements.calendarGrid.innerHTML, /data-date="2026-11-08"[^>]*aria-pressed="true"/);
assert.match(elements.calendarSelection.innerHTML, /Diwali/);
assert.match(elements.calendarSelection.innerHTML, /data-calendar-create="diwali"/);
assert.match(context.lastToast, /Create wish below/);

context.handleCalendarDate('2026-11-07');
assert.match(elements.calendarSelection.innerHTML, /No occasion listed for this date/);
assert.match(elements.calendarSelection.innerHTML, /data-calendar-explore/);

const previousSelection = context.selectedDateKey;
context.handleCalendarDate('2026-02-31');
assert.equal(context.selectedDateKey, previousSelection, 'invalid dates must not change selection');
console.log('PASS: calendar month render, event marking, accessible selected state, event details, create action, empty-date explore action and invalid-date guard.');
