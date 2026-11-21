const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const source = readFileSync(join(__dirname, '..', 'app.js'), 'utf8');
const storageKey = 'studyflow.workspace.v1';

// Run the actual application with isolated storage and a controllable clock.
// UI rendering is covered separately in a browser; this harness tests app behavior.
function workspace(options = {}) {
  let now = new Date('2026-11-21T12:00:00Z').getTime();
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const nodes = new Map(), documentEvents = {}, windowEvents = {};
  function node(selector) {
    if (!nodes.has(selector)) {
      const classes = new Set();
      const events = {};
      nodes.set(selector, {
        id: selector.startsWith('#') ? selector.slice(1) : '',
        innerHTML: '', textContent: '', value: '', hidden: true, open: false,
        classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c), toggle(c, value) { const next = value ?? !classes.has(c); next ? classes.add(c) : classes.delete(c); return next; } },
        setAttribute() {}, addEventListener: (name, fn) => { events[name] = fn; },
        showModal() { this.open = true; }, close() { this.open = false; },
        focus() { document.activeElement = this; }, events
      });
    }
    return nodes.get(selector);
  }
  const document = { activeElement: null, querySelector: node, querySelectorAll: () => [], body: node('body'),
    getElementById: id => node('#' + id),
    addEventListener: (name, fn) => { (documentEvents[name] ??= []).push(fn); } };
  const storage = new Map(options.raw === undefined ? [] : [[storageKey, options.raw]]);
  const context = vm.createContext({
    console, Date: Clock, crypto: webcrypto, Blob, URL,
    setTimeout: () => 0, clearTimeout() {}, setInterval() {},
    FormData: class { constructor(form) { return Object.entries(form.values)[Symbol.iterator](); } },
    document, window: { addEventListener: (name, fn) => { windowEvents[name] = fn; } },
    location: { hash: '' },
    localStorage: {
      getItem: key => { if (options.denyStorage) throw new Error('Storage blocked'); return storage.get(key) ?? null; },
      setItem: (key, value) => { if (options.denyStorage || options.fullStorage) throw new Error('Storage full'); storage.set(key, value); }
    }
  });
  vm.runInContext(source, context);
  const run = code => vm.runInContext(code, context);
  return {
    run, node, storage, document,
    advance: milliseconds => { now += milliseconds; },
    json: code => JSON.parse(run(`JSON.stringify(${code})`)),
    click(action, data = {}) {
      const button = { dataset: { action, ...data }, setAttribute() {} };
      const event = { target: { closest: selector => selector === '[data-action]' ? button : null } };
      for (const listener of documentEvents.click) listener(event);
    },
    async import(value) { context.importFile = { size: 100, text: async () => value }; await run('importData(importFile)'); },
    storageEvent(value) { windowEvents.storage({ key: storageKey, newValue: JSON.stringify(value) }); },
    save(values) { context.editorValues = values; run('saveEditor({preventDefault(){},target:{reportValidity:()=>true,values:editorValues}})'); }
  };
}

function taskValues(overrides = {}) {
  return { recordId: '', recordType: 'task', title: 'Review chapter 5', subject: 'Physics', date: '2026-11-21', priority: 'medium', kind: 'task', notes: '', ...overrides };
}

test('default workspace is valid and uses the requested profile name', () => {
  const app = workspace();
  assert.equal(app.run('validateData(state)'), true);
  assert.equal(app.run('state.profile.name'), 'Nafiz Sadik');
});

for (const [name, mutate] of [
  ['session crossing midnight', "x.sessions[0].time='23:30'; x.sessions[0].duration=60"],
  ['empty task identifier', "x.tasks[0].id=''"],
  ['duplicate task identifiers', 'x.tasks[1].id=x.tasks[0].id'],
  ['non-integer weekly goal', 'x.profile.goal=2.5'],
  ['completed task without completion date', 'x.tasks[0].done=true; x.tasks[0].completedAt=null'],
  ['duplicate focus-history identifiers', "x.focusLog=[{id:'same',date:'2026-11-21',minutes:25},{id:'same',date:'2026-11-21',minutes:25}]"],
  ['invalid session clock time', "x.sessions[0].time='25:00'"],
  ['impossible date', "x.tasks[0].date='2026-02-30'"],
  ['unsupported backup version', 'x.version=2']
]) {
  test(`backup rejects ${name}`, () => {
    const app = workspace();
    assert.equal(app.run(`(()=>{const x=JSON.parse(JSON.stringify(state));${mutate};return validateData(x)})()`), false);
  });
}

test('leap day and a session ending exactly at midnight are valid', () => {
  const app = workspace();
  assert.equal(app.run("validDate('2028-02-29')"), true);
  assert.equal(app.run("validDate('2028-02-29')"), true);
  assert.equal(app.run("(()=>{const x=JSON.parse(JSON.stringify(state));x.sessions[0].time='23:00';x.sessions[0].duration=60;return validateData(x)})()"), true);
});

test('malformed saved JSON stays available for recovery after an edit', () => {
  const raw = '{"tasks":["original unreadable data"]';
  const app = workspace({ raw });
  assert.notEqual(app.run('loadWarning'), '');
  assert.equal(app.run('storageAvailable'), true);
  app.save(taskValues());
  assert.equal(app.storage.get(storageKey + '.recovery'), raw);
});

test('storage full does not replace the only unreadable copy', () => {
  const raw = '{not valid JSON';
  const app = workspace({ raw, fullStorage: true });
  app.save(taskValues());
  assert.equal(app.storage.get(storageKey), raw);
  assert.equal(app.run('storageAvailable'), false);
});

test('blocked browser storage still allows an in-memory workspace', () => {
  const app = workspace({ denyStorage: true });
  app.save(taskValues());
  assert.equal(app.run('state.tasks.at(-1).title'), 'Review chapter 5');
  assert.equal(app.run('storageAvailable'), false);
});

test('pausing at the deadline credits the completed focus exactly once', () => {
  const app = workspace();
  app.run("timer={mode:'focus',total:60,remaining:60,running:true,endsAt:Date.now()}");
  app.click('timer-toggle');
  app.run('checkTimer()');
  assert.equal(app.run('state.focusLog.length'), 1);
  assert.equal(app.run('state.focusLog[0].minutes'), 1);
  assert.equal(app.run('timer.mode'), 'break');
  assert.equal(app.run('timer.running'), false);
});

test('completing a timer does not replace unsaved settings', () => {
  const app = workspace();
  app.run("view='settings';let pageReplaced=false;render=()=>{pageReplaced=true};timer={mode:'focus',total:60,remaining:60,running:true,endsAt:Date.now()-1};checkTimer()");
  assert.equal(app.run('pageReplaced'), false);
  assert.equal(app.run('state.focusLog.length'), 1);
});

test('another tab updating the workspace does not replace unsaved settings', () => {
  const app = workspace();
  app.run("view='settings';let pageReplaced=false;render=()=>{pageReplaced=true}");
  const incoming = app.json('state');
  incoming.tasks[0].title = 'Edited in the other tab';
  app.storageEvent(incoming);
  assert.equal(app.run('pageReplaced'), false);
  assert.equal(app.run('state.tasks[0].title'), 'Edited in the other tab');
});

test('expired timers use their completion date and break time is excluded', () => {
  const app = workspace();
  app.run("timer={mode:'focus',total:60,remaining:60,running:true,endsAt:new Date('2026-11-20T12:00:00Z').getTime()};checkTimer();timer={mode:'break',total:60,remaining:60,running:true,endsAt:Date.now()-1};checkTimer()");
  assert.equal(app.run('state.focusLog.length'), 1);
  assert.equal(app.run('state.focusLog[0].date'), '2026-11-20');
});

test('paused timer does not drift and reload retains a running countdown', () => {
  const app = workspace();
  app.run("timer=makeTimer('focus');timer.remaining=600");
  app.advance(30000);
  assert.equal(app.run('timerSeconds()'), 600);
  app.click('timer-toggle');
  app.advance(30000);
  assert.equal(app.run('timerSeconds()'), 570);
  assert.equal(app.run('validTimer(JSON.parse(localStorage.getItem(STORAGE_KEY)).timer)'), true);
});

test('a timer with remaining time beyond its total is not restored', () => {
  const app = workspace();
  assert.equal(app.run("validTimer({mode:'focus',remaining:120,total:60,running:false,endsAt:null})"), false);
});

test('saving an editor for an item deleted in another tab does not recreate it', () => {
  const app = workspace();
  const id = app.run('state.tasks[0].id');
  const incoming = app.json('state');
  incoming.tasks = incoming.tasks.filter(task => task.id !== id);
  app.storageEvent(incoming);
  const count = app.run('state.tasks.length');
  app.save(taskValues({ recordId: id }));
  assert.equal(app.run('state.tasks.length'), count);
  assert.match(app.node('#editor-error').textContent, /no longer exists/i);
});

test('new tasks are trimmed and completed task edits retain completion history', () => {
  const app = workspace();
  app.save(taskValues({ title: '  A new task  ', notes: '  Start small  ' }));
  assert.equal(app.run('state.tasks.at(-1).title'), 'A new task');
  assert.equal(app.run('state.tasks.at(-1).notes'), 'Start small');
  const complete = app.json('state.tasks.find(t=>t.done)');
  app.save(taskValues({ recordId: complete.id, title: 'Updated completed task' }));
  assert.equal(app.run(`state.tasks.find(t=>t.id===${JSON.stringify(complete.id)}).completedAt`), complete.completedAt);
  assert.equal(app.run('validateData(state)'), true);
});

test('overlapping sessions are rejected but adjacent sessions are allowed', () => {
  const app = workspace();
  const count = app.run('state.sessions.length');
  const values = taskValues({ recordType: 'session', time: '14:30', duration: '60' });
  app.save(values);
  assert.equal(app.run('state.sessions.length'), count);
  assert.match(app.node('#editor-error').textContent, /overlaps/);
  app.save({ ...values, time: '15:00' });
  assert.equal(app.run('state.sessions.length'), count + 1);
});

test('invalid imported JSON leaves the current workspace untouched', async () => {
  const app = workspace();
  const before = app.run('JSON.stringify(state)');
  await app.import('{not JSON');
  assert.equal(app.run('JSON.stringify(state)'), before);
  assert.match(app.node('#toast').textContent, /not a valid StudyFlow backup/);
});

test('valid backup restoration replaces records only after confirmation', async () => {
  const app = workspace();
  const incoming = app.json('state');
  incoming.tasks = [];
  await app.import(JSON.stringify(incoming));
  assert.notEqual(app.run('state.tasks.length'), 0);
  app.node('#confirm-button').events.click();
  assert.equal(app.run('state.tasks.length'), 0);
  assert.equal(app.run('timer.running'), false);
});

test('record titles are escaped before they enter markup', () => {
  const app = workspace();
  assert.equal(app.run(`esc('<img src=x onerror="alert(1)">')`), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});

test('a null record is rejected without throwing', () => {
  const app = workspace();
  assert.equal(app.run('(()=>{const x=seedData();x.tasks=[null];return validateData(x)})()'), false);
});

test('whole-minute sessions are editable even when duration is not a multiple of five', () => {
  const app = workspace();
  app.save(taskValues({ recordType: 'session', time: '19:00', duration: '7' }));
  const session = app.json('state.sessions.at(-1)');
  app.save(taskValues({ recordId: session.id, recordType: 'session', time: '19:00', duration: '7', title: 'Updated seven-minute session' }));
  assert.equal(app.run('state.sessions.at(-1).duration'), 7);
  assert.equal(app.run('state.sessions.at(-1).title'), 'Updated seven-minute session');
  assert.equal(app.run('validateData(state)'), true);
});

test('reset at the deadline preserves finished focus time', () => {
  const app = workspace();
  app.run("timer={mode:'focus',total:60,remaining:60,running:true,endsAt:Date.now()}");
  app.click('timer-reset');
  assert.equal(app.run('state.focusLog.length'), 1);
  assert.equal(app.run('timer.mode'), 'break');
});

test('switching to break at the deadline does not discard the completed focus', () => {
  const app = workspace();
  app.run("timer={mode:'focus',total:60,remaining:60,running:true,endsAt:Date.now()};switchTimerMode('break')");
  assert.equal(app.run('state.focusLog.length'), 1);
  assert.equal(app.run('timer.mode'), 'break');
});

test('leaving the dashboard open across a date change refreshes deadlines once', () => {
  const app = workspace();
  app.run("let refreshes=0;render=()=>{refreshes++}");
  app.advance(24 * 60 * 60 * 1000);
  app.run('checkTimer();checkTimer()');
  assert.equal(app.run('refreshes'), 1);
});

test('recovery download uses the original unreadable bytes, not the sample workspace', () => {
  const app = workspace({ raw: '{original broken data' });
  app.run('let downloadedContent;downloadFile=(content)=>{downloadedContent=content}');
  app.click('export-recovery');
  assert.equal(app.run('downloadedContent'), '{original broken data');
});

test('recovery copy remains accessible after saving and reloading', () => {
  const raw = '{original broken data';
  const app = workspace({ raw });
  app.save(taskValues());
  app.run("recoveryData=null;state=loadData()");
  assert.equal(app.run('recoveryData'), raw);
  assert.equal(app.run('state.tasks.at(-1).title'), 'Review chapter 5');
});

test('a saved workspace with an invalid schema is preserved before replacement', () => {
  const raw = JSON.stringify({ version: 1, tasks: [null] });
  const app = workspace({ raw });
  app.save(taskValues());
  assert.equal(app.storage.get('studyflow.workspace.v1.recovery'), raw);
});
