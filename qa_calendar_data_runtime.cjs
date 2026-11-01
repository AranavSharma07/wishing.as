/* Regression tests for real catalog dates, multi-day festivals and annual rollover. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('app.js', 'utf8');

const catalogStart = source.indexOf('const catalog = {');
const catalogEnd = source.indexOf('const themes =', catalogStart);
assert.notEqual(catalogStart, -1, 'catalog declaration exists');
assert.notEqual(catalogEnd, -1, 'catalog declaration has a closing boundary');
const annualStart = source.indexOf('const annualFixedOccasionIds=', catalogEnd);
const annualEnd = source.indexOf('function occasionDateKeys(', annualStart);
const helperStart = annualEnd;
const helperEnd = source.indexOf('const eventDates=buildEventDates(catalog);', helperStart) + 'const eventDates=buildEventDates(catalog);'.length;
assert.ok(annualStart > 0 && annualEnd > annualStart && helperEnd > helperStart, 'date helper boundaries are present');
const annualBlock = source.slice(annualStart, annualEnd);
const helperBlock = source.slice(helperStart, helperEnd);

function makeContext(todayIso) {
  const [y,m,d] = todayIso.split('-').map(Number);
  const context = {
    today: new Date(y, m - 1, d),
    getLocalDateKey: date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,
    parseDateKey: key => { const [yy,mm,dd] = key.split('-').map(Number); return new Date(yy,mm-1,dd); },
  };
  vm.createContext(context);
  vm.runInContext(source.slice(catalogStart, catalogEnd) + '\nglobalThis.catalogData = catalog; globalThis.nationalData = nationalOccasions;', context);
  vm.runInContext(annualBlock, context);
  vm.runInContext(helperBlock + '\nglobalThis.eventDateData = eventDates;', context);
  return context;
}

const current = makeContext('2026-10-31');
const catalog = current.catalogData;
const events = current.eventDateData;
assert.equal(Object.keys(catalog).length, 32, 'the curated occasion count remains 32');
assert.ok(events['2026-11-08']?.some(item => item.name === 'Diwali'));
assert.ok(events['2027-10-29']?.some(item => item.name === 'Diwali'), 'Diwali must remain visible next year');
for (const date of ['2026-11-13','2026-11-14','2026-11-15','2026-11-16','2027-11-02','2027-11-03','2027-11-04','2027-11-05']) {
  assert.ok(events[date]?.some(item => item.name === 'Chhath Puja'), `Chhath must be listed on ${date}`);
}
assert.equal(catalog.pongal.date, '2027-01-15');
for (const [id,item] of Object.entries(catalog)) {
  for (const date of current.occasionDateKeys(item)) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(current.getLocalDateKey(current.parseDateKey(date)), date, `${id} has a valid date ${date}`);
  }
}

const afterNewYear = makeContext('2027-12-26');
assert.equal(afterNewYear.catalogData.christmas.date, '2028-12-25', 'Christmas rolls to the next year');
assert.equal(afterNewYear.catalogData.newyear.date, '2028-01-01', 'New Year rolls to the next year');
assert.equal(afterNewYear.catalogData.valentine.date, '2028-02-14', 'Valentine date rolls forward');
assert.equal(afterNewYear.catalogData.republicday.date, '2028-01-26', 'national day rolls forward');

console.log('PASS: 32 real catalog records, valid date keys, 2026/2027 Diwali and Chhath calendar entries, and annual fixed-date rollover.');
