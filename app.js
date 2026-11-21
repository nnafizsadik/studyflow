'use strict';

// StudyFlow is intentionally dependency-free. All workspace data stays in this browser.
const STORAGE_KEY = 'studyflow.workspace.v1';
const RECOVERY_KEY = `${STORAGE_KEY}.recovery`;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const paths = {
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  check:'<path d="m5 12 4 4L19 6"/>', tasks:'<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M9 3h6v4H9zM8 12l1 1 2-2m2 1h3m-8 5h8"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-13 4h2m4 0h2m-8 3h2"/>',
  book:'<path d="M12 5v16m0-16C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-2-1-6-2-10 1Z"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8m-8 4h6"/>',
  chart:'<path d="M4 3v17h17M8 15v-4m5 4V7m5 8V4"/>',
  settings:'<path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>', bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  chevron:'<path d="m8 10 4 4 4-4"/>', left:'<path d="m14 7-5 5 5 5"/>', right:'<path d="m10 7 5 5-5 5"/>',
  edit:'<path d="m15 4 5 5M4 16l-1 5 5-1L21 7a2 2 0 0 0-5-5Z"/>', trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  play:'<path d="m9 5 11 7-11 7Z"/>', pause:'<path d="M8 5v14M16 5v14"/>', reset:'<path d="M3 10a9 9 0 1 1 1 8M3 4v6h6"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6"/>', upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 15v6h16v-6"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>', spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', cup:'<path d="M7 3h10v7a5 5 0 0 1-10 0ZM7 5H3v3a4 4 0 0 0 5 4m9-7h4v3a4 4 0 0 1-5 4M12 15v6m-4 0h8"/>'
};
function icon(name, extra='') { return `<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}>${paths[name] || paths.file}</svg>`; }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function dateKey(value = new Date()) { const d = new Date(value); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function dayOffset(offset, base = new Date()) { const d = new Date(base); d.setDate(d.getDate()+offset); return dateKey(d); }
function parseDate(key) { return new Date(`${key}T12:00:00`); }
function formatDate(key, options={month:'short',day:'numeric'}) { return parseDate(key).toLocaleDateString('en-US', options); }
function today() { return dateKey(); }
function uid() { return globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; }
function relativeDate(key) { if(key===today()) return 'Today'; if(key===dayOffset(1)) return 'Tomorrow'; if(key===dayOffset(-1)) return 'Yesterday'; return formatDate(key); }
const subjects = ['Computer Science','Mathematics','Design','Physics','Literature','General'];
function seedData() {
  const tasks = [
    ['Build a responsive portfolio','Design',0,'high','assignment',false],
    ['Practice integration problems','Mathematics',0,'medium','task',false],
    ['Read chapter 04: Data structures','Computer Science',0,'low','task',true],
    ['Prepare physics lab report','Physics',1,'high','assignment',false],
    ['Review typography fundamentals','Design',1,'medium','task',false],
    ['Finish algorithm problem set','Computer Science',2,'high','assignment',false],
    ['Read The Great Gatsby, chapter 3','Literature',3,'low','task',false],
    ['Sketch dashboard wireframes','Design',-1,'medium','task',true],
    ['Submit calculus worksheet','Mathematics',-2,'medium','assignment',true],
    ['Revise Newton’s laws','Physics',-3,'low','task',true],
    ['Complete CSS grid exercises','Computer Science',-4,'medium','assignment',true],
    ['Outline literature essay','Literature',-5,'low','task',true]
  ].map(([title,subject,offset,priority,kind,done])=>({id:uid(),title,subject,date:dayOffset(offset),priority,kind,done,notes:'',createdAt:new Date().toISOString(),completedAt:done?dayOffset(offset):null}));
  const sessions = [
    ['Deep dive into JavaScript','Computer Science',0,'14:00',60,false],
    ['Calculus practice','Mathematics',0,'16:30',45,false],
    ['Design studio: portfolio','Design',1,'10:00',90,false],
    ['Physics revision','Physics',2,'15:00',60,false],
    ['Data structures revision','Computer Science',-1,'10:00',60,true]
  ].map(([title,subject,offset,time,duration,done])=>({id:uid(),title,subject,date:dayOffset(offset),time,duration,done,notes:''}));
  return {version:1,profile:{name:'Nafiz Sadik',course:'Computer Science',goal:10,focusMinutes:25,breakMinutes:5,theme:'light',reminders:true,compact:false},tasks,sessions,focusLog:[],timer:null,demo:true};
}
function validDate(s) { return typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(parseDate(s).getTime()) && dateKey(parseDate(s))===s; }
function validId(value) { return typeof value==='string' && value.trim().length>0 && value.length<100; }
function validSessionTime(time, duration) {
  if(typeof time!=='string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || !Number.isInteger(duration) || duration<5 || duration>480) return false;
  const [hours,minutes]=time.split(':').map(Number);
  return hours*60+minutes+duration<=1440;
}
function validateData(data) {
  if(!data || data.version!==1 || !Array.isArray(data.tasks) || !Array.isArray(data.sessions) || !Array.isArray(data.focusLog) || !data.profile) return false;
  if(data.tasks.length>10000 || data.sessions.length>10000 || data.focusLog.length>10000) return false;
  const recordOK=r=>r && validId(r.id) && typeof r.title==='string' && r.title.trim().length>0 && r.title.length<=120 && subjects.includes(r.subject) && validDate(r.date) && typeof r.done==='boolean' && typeof r.notes==='string' && r.notes.length<=1000;
  const taskOK=data.tasks.every(t=>recordOK(t) && ['task','assignment'].includes(t.kind) && ['high','medium','low'].includes(t.priority) && (t.done?validDate(t.completedAt):t.completedAt===null));
  const sessionOK=data.sessions.every(s=>recordOK(s) && validSessionTime(s.time,s.duration));
  const p=data.profile;
  const profileOK=typeof p.name==='string' && p.name.trim().length>0 && p.name.length<=60 && typeof p.course==='string' && p.course.length<=80 && Number.isInteger(p.goal) && p.goal>=1 && p.goal<=100 && Number.isInteger(p.focusMinutes) && p.focusMinutes>=1 && p.focusMinutes<=120 && Number.isInteger(p.breakMinutes) && p.breakMinutes>=1 && p.breakMinutes<=30 && ['light','dark'].includes(p.theme) && typeof p.reminders==='boolean' && typeof p.compact==='boolean';
  if(!taskOK || !sessionOK || !profileOK) return false;
  const ids=[...data.tasks,...data.sessions].map(r=>r.id);
  return taskOK && sessionOK && profileOK && new Set(ids).size===ids.length && new Set(data.focusLog.map(l=>l?.id)).size===data.focusLog.length && data.focusLog.every(l=>l && validId(l.id) && validDate(l.date) && Number.isFinite(l.minutes) && l.minutes>0 && l.minutes<=480);
}
let storageAvailable=true, loadWarning='', recoveryData=null, recoveryPending=false;
function loadData() {
  let raw;
  try {
    raw=localStorage.getItem(STORAGE_KEY);
    recoveryData=localStorage.getItem(RECOVERY_KEY);
  } catch {
    storageAvailable=false;
    loadWarning='Browser storage is unavailable. Changes will last only for this visit; use Export backup to keep your work.';
    return seedData();
  }
  if(raw!==null) {
    try {
      const value=JSON.parse(raw);
      if(validateData(value)) {
        // Update the original demo profile while preserving personalized account names.
        if(value.demo && value.profile.name==='Rayhan Ahmed') value.profile.name='Nafiz Sadik';
        return value;
      }
    } catch { /* Invalid saved JSON is a recovery problem, not a storage-permission error. */ }
    recoveryData=raw;
    recoveryPending=true;
    loadWarning='Your saved workspace could not be read. A sample workspace is shown. Download the original data in Settings before restoring a backup or starting over.';
  }
  return seedData();
}
let state=loadData();
let view=['dashboard','tasks','calendar','planner','assignments','analytics','settings'].includes(location.hash.slice(1))?location.hash.slice(1):'dashboard';
let selectedDate=today(), calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);
let taskTab='all', search='', filterStatus='all', filterSubject='all', filterPriority='all', sortBy='date', chartPeriod=7;
let timer=validTimer(state.timer)?state.timer:makeTimer('focus');
let confirmCallback=null, toastTimeout, renderedDate=today();
function validTimer(t) { return t && ['focus','break'].includes(t.mode) && Number.isInteger(t.total) && t.total>=60 && t.total<=7200 && t.total%60===0 && Number.isInteger(t.remaining) && t.remaining>=0 && t.remaining<=t.total && typeof t.running==='boolean' && (!t.running || (Number.isFinite(t.endsAt) && t.endsAt>0)); }
function makeTimer(mode) { const seconds=(mode==='focus'?state.profile.focusMinutes:state.profile.breakMinutes)*60; return {mode,remaining:seconds,total:seconds,running:false,endsAt:null}; }
function persist() {
  state.timer=timer;
  try {
    // Never overwrite unreadable saved data unless its original bytes are preserved first.
    if(recoveryPending) {
      localStorage.setItem(RECOVERY_KEY,recoveryData);
      recoveryPending=false;
    }
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    storageAvailable=true;
  } catch {
    if(storageAvailable) toast('Storage is full or unavailable. Export a backup to keep your changes.');
    storageAvailable=false;
  }
  updateSavedStatus();
}
function updateSavedStatus() { const el=$('.local-status'); el.innerHTML=`<span></span>${!storageAvailable?'Changes not saved':recoveryPending?'Recovery needed':'Saved on this device'}`; }
function toast(message) { const el=$('#toast'); el.textContent=message;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),4200); }
function applyPreferences() { document.body.classList.toggle('dark',state.profile.theme==='dark');document.body.classList.toggle('compact-view',state.profile.compact); const initials=state.profile.name.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();$('#profile-avatar').textContent=initials;$('#profile-name').textContent=state.profile.name;$('.workspace-avatar').textContent=initials[0]; }
const navItems=[['dashboard','grid','Overview'],['tasks','tasks','My tasks'],['calendar','calendar','Calendar'],['planner','book','Study planner'],['assignments','file','Assignments'],['analytics','chart','Analytics']];
function renderNav() { $('#navigation').innerHTML=navItems.map(([key,ico,label])=>`<a href="#${key}" class="nav-link ${view===key?'active':''}" ${view===key?'aria-current="page"':''}>${icon(ico)}<span>${label}</span>${key==='tasks'?`<span class="nav-count">${state.tasks.filter(t=>!t.done).length}</span>`:''}</a>`).join('');$('#settings-nav').innerHTML=`${icon('settings')}<span>Settings</span>`;$('#settings-nav').classList.toggle('active',view==='settings'); $('#breadcrumb').textContent=view==='settings'?'Settings':navItems.find(n=>n[0]===view)[2]; }
function heading(title,subtitle,action='task') { return `<div class="page-heading"><div><p class="eyebrow">YOUR SPACE TO MAKE PROGRESS</p><h1>${title}</h1><p>${subtitle}</p></div><div class="heading-actions">${view==='dashboard'?`<button class="button secondary date-button" data-action="navigate" data-view="calendar">${icon('calendar')}${formatDate(today(),{month:'short',day:'numeric',year:'numeric'})}</button>`:''}${action?`<button class="button primary" data-action="new" data-type="${action}">${icon('plus')}${action==='session'?'Plan session':action==='assignment'?'New assignment':'New task'}</button>`:''}</div></div>`; }
function weekStart() { const d=new Date(); d.setDate(d.getDate()-((d.getDay()+6)%7));return dateKey(d); }
function weekMinutes() { const start=weekStart(),end=dayOffset(6,parseDate(start));return state.focusLog.filter(l=>l.date>=start&&l.date<=end).reduce((n,l)=>n+l.minutes,0)+state.sessions.filter(s=>s.done&&s.date>=start&&s.date<=end).reduce((n,s)=>n+s.duration,0); }
function completionPercent() { return state.tasks.length?Math.round(state.tasks.filter(t=>t.done).length/state.tasks.length*100):0; }
function stats() { const pending=state.tasks.filter(t=>!t.done),due=pending.filter(t=>t.date===today()).length, minutes=weekMinutes();const cards=[['tasks','Tasks completed',String(state.tasks.filter(t=>t.done).length),`of ${state.tasks.length} tasks in your workspace`],['clock','Study time',`${(minutes/60).toFixed(1)} <small>hrs</small>`,`<strong>${Math.round(minutes/(state.profile.goal*60)*100)}%</strong> of your weekly goal`],['calendar','Due today',String(due),due?'A little focus goes a long way':'You’re all caught up today'],['target','Completion rate',`${completionPercent()}<small>%</small>`,'One step closer to your goals']]; return `<div class="stats-grid">${cards.map(([ico,label,value,sub],i)=>`<div class="stat-card"><div class="stat-top"><span class="stat-icon">${icon(ico)}</span>${label}</div><div class="stat-number">${value}</div><div class="stat-bottom">${sub}</div><svg class="sparkline" viewBox="0 0 80 40" aria-hidden="true"><path d="${['M2 31Q10 31 15 24T29 26T43 15T59 20T77 5','M2 29Q14 33 20 20T37 22T52 9T77 10','M2 30L15 23L29 28L43 13L55 18L68 8L77 12','M2 30Q15 30 20 22T38 20T50 11T77 6'][i]}"/></svg></div>`).join('')}</div>`; }
function activityChart() {
  const dates=Array.from({length:chartPeriod},(_,i)=>dayOffset(i-chartPeriod+1));const buckets=dates.map(date=>({date,planned:state.tasks.filter(t=>t.date===date).length,completed:state.tasks.filter(t=>t.done&&t.completedAt===date).length}));const max=Math.max(4,...buckets.map(b=>Math.max(b.planned,b.completed)));const completed=buckets.reduce((n,b)=>n+b.completed,0);
  return `<section class="panel"><div class="panel-header"><div><h2 class="panel-title">Your progress, at a glance</h2><p class="panel-subtitle">Good things happen one task at a time.</p></div><select class="period-select" id="chart-period" aria-label="Activity period"><option value="7" ${chartPeriod===7?'selected':''}>Last 7 days</option><option value="14" ${chartPeriod===14?'selected':''}>Last 14 days</option></select></div><div class="chart-summary"><strong>${completed}</strong><span>tasks completed in ${chartPeriod} days</span></div><div class="chart-wrap"><div class="chart-legend"><span><i class="legend-square pale"></i>Tasks due</span><span><i class="legend-square"></i>Completed</span></div><div class="activity-chart" role="img" aria-label="${esc(buckets.map(b=>`${formatDate(b.date)}: ${b.planned} due, ${b.completed} completed`).join('; '))}"><div class="chart-grid">${[max,Math.round(max*.75),Math.round(max*.5),Math.round(max*.25),0].map(n=>`<div><span>${n}</span></div>`).join('')}</div><div class="bars">${buckets.map(b=>`<div class="bar-group" title="${formatDate(b.date)}: ${b.planned} due, ${b.completed} completed"><div class="bar" style="height:${b.planned/max*100}%"></div><div class="bar completed-bar" style="height:${b.completed/max*100}%"></div></div>`).join('')}</div></div><div class="chart-labels">${buckets.map((b,i)=>`<span>${chartPeriod===14?(i%2===0?formatDate(b.date,{day:'numeric'}):''):formatDate(b.date,{weekday:'short'})}</span>`).join('')}</div></div></section>`;
}
function empty(title,description,action='task') { return `<div class="empty-state"><div class="empty-icon">${icon('spark')}</div><h3>${esc(title)}</h3><p>${esc(description)}</p>${action?`<button class="button secondary" data-action="new" data-type="${action}">${icon('plus')}${action==='session'?'Plan a session':'Create a task'}</button>`:''}</div>`; }
function taskRow(t,notes=false) { return `<article class="task-row ${t.done?'done':''}"><button class="check-button ${t.done?'checked':''}" data-action="toggle-task" data-id="${esc(t.id)}" aria-label="${t.done?'Mark incomplete':'Complete'}: ${esc(t.title)}" aria-pressed="${t.done}">${t.done?icon('check'):''}</button><div class="task-info"><button class="task-title" data-action="edit-task" data-id="${esc(t.id)}">${esc(t.title)}</button><div class="task-meta"><span><i class="subject-dot"></i>${esc(t.subject)}</span><span>·</span><span>${t.kind==='assignment'?(t.done?'Submitted':'Assignment'):'Task'}</span><span class="task-meta-date ${!t.done&&t.date<today()?'overdue':''}">· ${relativeDate(t.date)}${!t.done&&t.date<today()?' (overdue)':''}</span></div>${notes&&t.notes?`<div class="task-note">${esc(t.notes)}</div>`:''}</div><span class="priority ${t.priority}">${t.priority.charAt(0).toUpperCase()+t.priority.slice(1)}</span><span class="task-due ${!t.done&&t.date<today()?'overdue':''}">${relativeDate(t.date)}</span><div class="task-actions"><button class="icon-button" data-action="edit-task" data-id="${esc(t.id)}" aria-label="Edit ${esc(t.title)}">${icon('edit')}</button><button class="icon-button" data-action="delete-task" data-id="${esc(t.id)}" aria-label="Delete ${esc(t.title)}">${icon('trash')}</button></div></article>`; }
function sortedTasks(tasks) { const ranks={high:0,medium:1,low:2}; return [...tasks].sort((a,b)=>sortBy==='priority'?ranks[a.priority]-ranks[b.priority]||a.date.localeCompare(b.date):sortBy==='title'?a.title.localeCompare(b.title):a.date.localeCompare(b.date)||ranks[a.priority]-ranks[b.priority]); }
function dashboardTasks() { const list=state.tasks.filter(t=>taskTab==='today'?t.date===today():taskTab==='completed'?t.done:!t.done);const shown=sortedTasks(list).slice(0,4);return `<section class="panel"><div class="panel-header"><div><h2 class="panel-title">On your to-do list</h2><p class="panel-subtitle">A clear plan for a lighter mind.</p></div><button class="text-button" data-action="navigate" data-view="tasks">View all tasks</button></div><div class="task-tabs" role="tablist" aria-label="Dashboard task filters">${[['all','Upcoming',state.tasks.filter(t=>!t.done).length],['today','Today',state.tasks.filter(t=>t.date===today()).length],['completed','Completed',state.tasks.filter(t=>t.done).length]].map(([value,label,count])=>`<button class="tab ${taskTab===value?'active':''}" role="tab" aria-selected="${taskTab===value}" data-action="task-tab" data-value="${value}">${label}<span class="tab-count">${count}</span></button>`).join('')}</div><div class="task-list">${shown.length?shown.map(t=>taskRow(t)).join(''):empty('A little breathing room','No tasks here. Plan something new, or enjoy your progress.')}</div><div class="panel-bottom"><span>${shown.length} of ${list.length} tasks</span><button class="add-inline" data-action="new" data-type="task">${icon('plus')}Add a task</button></div></section>`; }
function calendarMarkup(full=false) { const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth(),first=new Date(year,month,1),start=new Date(year,month,1-((first.getDay()+6)%7));const count=full?42:Math.ceil((((first.getDay()+6)%7)+new Date(year,month+1,0).getDate())/7)*7;return `<section class="panel ${full?'full-calendar':'calendar-panel'}"><div class="calendar-header"><h3>${calendarMonth.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</h3><div class="calendar-nav">${full?'<button class="text-button" data-action="calendar-today">Today</button>':''}<button class="icon-button" data-action="calendar-prev" aria-label="Previous month">${icon('left')}</button><button class="icon-button" data-action="calendar-next" aria-label="Next month">${icon('right')}</button></div></div><div class="calendar-weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<span>${full?d:d[0]}</span>`).join('')}</div><div class="calendar-grid">${Array.from({length:count},(_,i)=>{const date=dayOffset(i,start),d=parseDate(date),events=state.tasks.filter(t=>t.date===date).length+state.sessions.filter(s=>s.date===date).length;return `<button class="day ${d.getMonth()!==month?'outside':''} ${date===today()?'today':''} ${date===selectedDate?'selected':''} ${events?'has-event':''}" data-action="select-date" data-date="${date}" aria-label="${formatDate(date,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}${events?`, ${events} items`:''}" aria-pressed="${date===selectedDate}" ${date===today()?'aria-current="date"':''}>${d.getDate()}${full&&events?`<span class="event-count">${events} ${events===1?'item':'items'}</span>`:''}</button>`;}).join('')}</div><div class="calendar-key"><i></i>Task deadline or study session</div></section>`; }
function focusPanel() { return `<section class="panel focus-panel"><div class="focus-title"><h3>A moment of focus</h3>${icon('spark')}</div><p>One thing at a time. You’ve got this.</p><div class="timer-mode" aria-label="Timer mode"><button class="${timer.mode==='focus'?'active':''}" data-action="timer-mode" data-mode="focus" aria-pressed="${timer.mode==='focus'}">Focus</button><button class="${timer.mode==='break'?'active':''}" data-action="timer-mode" data-mode="break" aria-pressed="${timer.mode==='break'}">Short break</button></div><div class="timer-digits" id="timer-digits" role="timer" aria-label="Time remaining">${timerDisplay()}</div><div class="timer-caption" id="timer-caption">${timer.running?'Stay with it. This time is yours.':timer.mode==='focus'?'A fresh start, whenever you’re ready.':'Rest is part of the process.'}</div><div class="timer-controls"><button class="button" data-action="timer-toggle" id="timer-toggle">${icon(timer.running?'pause':'play')}${timer.running?'Pause':'Start '+(timer.mode==='focus'?'focus':'break')}</button><button class="icon-button" data-action="timer-reset" aria-label="Reset timer">${icon('reset')}</button></div></section>`; }
function timeText(time) {const [h,m]=time.split(':').map(Number);return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;}
function sessionRow(s,full=false) { return `<article class="session-row"><div class="session-icon">${icon('book')}</div><div class="task-info"><button class="task-title" data-action="edit-session" data-id="${esc(s.id)}">${esc(s.title)}</button><p class="task-meta">${full?`${relativeDate(s.date)} · `:''}${timeText(s.time)} <span>·</span> ${s.duration} min <span>·</span> ${esc(s.subject)}</p>${full&&s.notes?`<div class="task-note">${esc(s.notes)}</div>`:''}</div><div class="session-actions">${s.done?'<span class="session-status">Completed</span>':`<button class="session-finish" data-action="complete-session" data-id="${esc(s.id)}" aria-label="Complete session: ${esc(s.title)}">Done</button>`}${full?`<button class="icon-button" data-action="edit-session" data-id="${esc(s.id)}" aria-label="Edit session ${esc(s.title)}">${icon('edit')}</button><button class="icon-button" data-action="delete-session" data-id="${esc(s.id)}" aria-label="Delete session ${esc(s.title)}">${icon('trash')}</button>`:''}</div></article>`; }
function upcomingSessions() { const sessions=state.sessions.filter(s=>!s.done&&s.date>=today()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,2);return `<section class="panel"><div class="panel-header"><div><h2 class="panel-title">Your next study sessions</h2><p class="panel-subtitle">A little time set aside for your future.</p></div><button class="text-button" data-action="navigate" data-view="planner">View planner</button></div><div class="session-list">${sessions.length?sessions.map(s=>sessionRow(s,true)).join(''):empty('Make time for learning','Your next chapter starts with a little planning.','session')}</div></section>`; }
function renderDashboard() { const first=esc(state.profile.name.trim().split(/\s+/)[0]);return heading(`Let’s make today count, ${first} <span style="font-size:.8em" aria-hidden="true">✦</span>`,'A little structure. A lot more possibility.')+stats()+`<div class="dashboard-columns"><div class="left-column">${activityChart()}${dashboardTasks()}${upcomingSessions()}</div><div class="right-column">${calendarMarkup()}${focusPanel()}</div></div>${state.demo?'<span class="demo-label">Sample workspace · Make it yours in Settings</span>':''}`; }
function renderTasks(assignment=false) { let tasks=state.tasks.filter(t=>(!assignment||t.kind==='assignment')&&(!search||`${t.title} ${t.subject} ${t.notes}`.toLowerCase().includes(search.toLowerCase()))&&(filterStatus==='all'||(filterStatus==='completed'?t.done:filterStatus==='pending'?!t.done:!t.done&&t.date<today()))&&(filterSubject==='all'||t.subject===filterSubject)&&(filterPriority==='all'||t.priority===filterPriority));tasks=sortedTasks(tasks);return heading(assignment?'Assignments, under control.':'A clear mind starts here.',assignment?'Track your deadlines from first draft to submitted.':'Everything you need to do, in one thoughtful place.',assignment?'assignment':'task')+(search?`<div class="search-notice"><span>Results for “${esc(search)}”</span><button data-action="clear-search">Clear search</button></div>`:'')+`<section class="panel"><div class="toolbar"><div class="filters"><select id="filter-status" aria-label="Filter by status">${[['all','All statuses'],['pending',assignment?'Not submitted':'To do'],['completed',assignment?'Submitted':'Completed'],['overdue','Overdue']].map(([v,l])=>`<option value="${v}" ${filterStatus===v?'selected':''}>${l}</option>`).join('')}</select><select id="filter-subject" aria-label="Filter by subject"><option value="all">All subjects</option>${subjects.map(s=>`<option ${filterSubject===s?'selected':''}>${s}</option>`).join('')}</select><select id="filter-priority" aria-label="Filter by priority">${[['all','All priorities'],['high','High priority'],['medium','Medium priority'],['low','Low priority']].map(([v,l])=>`<option value="${v}" ${filterPriority===v?'selected':''}>${l}</option>`).join('')}</select><select id="sort-tasks" aria-label="Sort tasks">${[['date','Due date'],['priority','Priority'],['title','Title A–Z']].map(([v,l])=>`<option value="${v}" ${sortBy===v?'selected':''}>Sort: ${l}</option>`).join('')}</select></div><span class="result-count">${tasks.length} ${assignment?'assignments':'tasks'}</span></div><div class="task-list">${tasks.length?tasks.map(t=>taskRow(t,true)).join(''):empty('Nothing here just yet',search||filterStatus!=='all'||filterSubject!=='all'||filterPriority!=='all'?'Try another search or change your filters.':'Create your first item and give it a little direction.',search?null:assignment?'assignment':'task')}</div><div class="panel-bottom"><span>${assignment?'Use the checkbox to mark an assignment submitted.':'Check off a task to celebrate a little progress.'}</span>${filterStatus!=='all'||filterSubject!=='all'||filterPriority!=='all'?'<button class="text-button" data-action="reset-filters">Reset filters</button>':''}</div></section>`; }
function renderCalendar() {const tasks=sortedTasks(state.tasks.filter(t=>t.date===selectedDate)),sessions=state.sessions.filter(s=>s.date===selectedDate).sort((a,b)=>a.time.localeCompare(b.time));return heading('A little perspective.','Your deadlines and study plans, all in view.')+`<div class="calendar-layout">${calendarMarkup(true)}<section class="panel day-detail"><div class="panel-header"><div><h2 class="panel-title">${formatDate(selectedDate,{weekday:'long',month:'short',day:'numeric'})}</h2><p class="panel-subtitle">${tasks.length+sessions.length} items planned</p></div><button class="icon-button" data-action="new" data-type="task" aria-label="Add a task for selected date">${icon('plus')}</button></div><div class="task-list">${tasks.map(t=>taskRow(t,true)).join('')}${sessions.map(s=>sessionRow(s,true)).join('')}${!tasks.length&&!sessions.length?empty('A little open space','Add a task or plan a session for this day.'):''}</div><div class="panel-bottom"><button class="add-inline" data-action="new" data-type="session">${icon('plus')}Plan a study session</button></div></section></div>`; }
function renderPlanner() {const sessions=[...state.sessions].sort((a,b)=>Number(a.done)-Number(b.done)||(a.date+a.time).localeCompare(b.date+b.time));const minutes=weekMinutes(),percent=Math.min(100,Math.round(minutes/(state.profile.goal*60)*100));return heading('Make time for your future.','Turn a little intention into a steady study rhythm.','session')+`<div class="planner-banner"><div><p class="eyebrow">THIS WEEK’S STUDY GOAL</p><h3>${(minutes/60).toFixed(1)} of ${state.profile.goal} hours. Every bit counts.</h3><p>${percent>=100?'You reached your weekly goal. Take a moment to celebrate.':`${percent}% of the way there. Your next session makes a difference.`}</p></div>${icon('book','style="width:52px;height:52px;color:#8fa880"')}</div><div class="planner-grid"><section class="panel"><div class="panel-header"><div><h2 class="panel-title">Your study schedule</h2><p class="panel-subtitle">Mark a session done to add it to your study time.</p></div></div><div class="session-list">${sessions.length?sessions.map(s=>sessionRow(s,true)).join(''):empty('Create a little study rhythm','Give your most important subject some time.','session')}</div></section><div>${focusPanel()}<div class="help-line">Focus sessions are recorded after the full timer finishes. Planned sessions count when you mark them done. Track each study block with one method to avoid counting it twice.</div></div></div>`; }
function renderAnalytics() { const percent=completionPercent();return heading('Look how far you’ve come.','Small, consistent steps make a meaningful difference.',null)+stats()+`<div class="analytics-grid"><div class="left-column">${activityChart()}<section class="panel"><div class="panel-header"><div><h2 class="panel-title">Progress by subject</h2><p class="panel-subtitle">Completed tasks and submitted assignments.</p></div></div><div class="subject-list">${subjects.filter(s=>state.tasks.some(t=>t.subject===s)).map(s=>{const all=state.tasks.filter(t=>t.subject===s),done=all.filter(t=>t.done).length;return `<div class="subject-item"><div>${s}<span>${done} of ${all.length} · ${Math.round(done/all.length*100)}%</span></div><div class="progress-track" role="progressbar" aria-label="${s} completion" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${all.length}"><div class="progress-fill" style="width:${done/all.length*100}%"></div></div></div>`;}).join('')||'<p class="help-line">Your subject progress will appear after you add tasks.</p>'}</div></section></div><div class="right-column"><section class="panel"><div class="panel-header"><h2 class="panel-title">Your overall progress</h2>${icon('cup')}</div><div class="progress-donut" style="--percent:${percent}"><div class="donut-label"><strong>${percent}%</strong><span>completed</span></div></div><p class="analytics-note">${state.tasks.filter(t=>t.done).length} tasks done. ${state.tasks.filter(t=>!t.done).length} opportunities to keep moving.<br>Progress is a practice, not a race.</p></section><section class="panel"><div class="panel-header"><h2 class="panel-title">Study time this week</h2></div><div class="subject-list"><div class="subject-item"><div>${(weekMinutes()/60).toFixed(1)} hours<span>Goal: ${state.profile.goal} hours</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100,weekMinutes()/(state.profile.goal*60)*100)}%"></div></div></div><p class="panel-subtitle">${state.sessions.filter(s=>s.done&&s.date>=weekStart()&&s.date<=dayOffset(6,parseDate(weekStart()))).length} planned sessions completed this week.</p><p class="panel-subtitle">${state.focusLog.filter(l=>l.date>=weekStart()&&l.date<=dayOffset(6,parseDate(weekStart()))).length} focus timers finished this week.</p></div></section></div></div>`; }
function renderSettings() {const p=state.profile;return heading('Your space. Your pace.','A few little details to make StudyFlow feel like you.',null)+`<div class="settings-grid"><section class="panel"><div class="panel-header"><div><h2 class="panel-title">Profile & preferences</h2><p class="panel-subtitle">Make your workspace a little more personal.</p></div></div><form id="settings-form" class="settings-form"><div class="form-grid"><label>Your name<input name="name" value="${esc(p.name)}" maxlength="60" required></label><label>Course / major<input name="course" value="${esc(p.course)}" maxlength="80"></label><label>Weekly study goal (hours)<input type="number" name="goal" min="1" max="100" value="${p.goal}" required></label><label>Appearance<select name="theme"><option value="light" ${p.theme==='light'?'selected':''}>Light</option><option value="dark" ${p.theme==='dark'?'selected':''}>Dark</option></select></label><label>Focus duration (minutes)<input type="number" name="focusMinutes" min="1" max="120" value="${p.focusMinutes}" required></label><label>Break duration (minutes)<input type="number" name="breakMinutes" min="1" max="30" value="${p.breakMinutes}" required></label></div><label class="toggle-line">Show deadline reminders<input name="reminders" type="checkbox" ${p.reminders?'checked':''}></label><label class="toggle-line" style="margin:20px 0">Compact task spacing<input name="compact" type="checkbox" ${p.compact?'checked':''}></label><p class="note-box">Your workspace is saved in this browser on this device. Export a backup to move it to another browser or keep a safe copy. No account is needed.</p><div class="dialog-footer"><button class="button primary" type="submit">Save preferences</button></div></form></section><section class="panel">${recoveryData!==null?`<div class="settings-section"><h3>Recover your original data</h3><p>A previous saved workspace could not be read. Download its original contents before attempting a repair. This file may need correction before StudyFlow can import it.</p><button class="button secondary" data-action="export-recovery">${icon('download')}Download original data</button></div>`:''}<div class="settings-section"><h3>A little peace of mind</h3><p>Download your tasks, sessions, preferences, and focus history as a backup. Import a StudyFlow backup to restore your workspace.</p><button class="button secondary" data-action="export">${icon('download')}Export backup</button><button class="button secondary" data-action="import">${icon('upload')}Import</button></div><div class="settings-section"><h3>A fresh start</h3><p>Ready to make this space yours? Clear the sample tasks and sessions while keeping your profile and preferences.</p><button class="button danger-outline" data-action="clear-data">Clear workspace</button></div><div class="settings-section"><h3>StudyFlow, simply.</h3><p>Made with HTML, CSS, and JavaScript. No installs. No distractions. Just a little more space for what matters.</p><div class="note-box">Shortcuts: <strong>/</strong> to search · <strong>N</strong> for a new task · <strong>Esc</strong> to close a dialog.<br>Reminders appear inside StudyFlow while you use it.</div></div></section></div>`; }
function render() {
  const activeId=document.activeElement?.id;
  applyPreferences();
  renderNav();
  const renderers={dashboard:renderDashboard,tasks:()=>renderTasks(),assignments:()=>renderTasks(true),calendar:renderCalendar,planner:renderPlanner,analytics:renderAnalytics,settings:renderSettings};
  $('#main').innerHTML=(loadWarning?`<div class="storage-warning">${esc(loadWarning)}</div>`:'')+renderers[view]();
  $('#global-search').value=search;
  renderNotifications();
  updateSavedStatus();
  if(activeId) document.getElementById(activeId)?.focus({preventScroll:true});
}
function refreshBackground() {
  // Timer and cross-tab updates must not replace an unfinished settings form.
  if(view==='settings') {
    applyPreferences();
    renderNav();
    renderNotifications();
    updateSavedStatus();
  } else render();
}
function navigate(next) { if(!['dashboard','tasks','calendar','planner','assignments','analytics','settings'].includes(next)) return;if(next!==view){filterStatus='all';filterSubject='all';filterPriority='all';}view=next;location.hash=next;document.body.classList.remove('menu-open');$('#menu-button').setAttribute('aria-expanded','false');$('#notifications').hidden=true;$('#notification-button').setAttribute('aria-expanded','false');render(); }
function renderNotifications() {const due=state.profile.reminders?sortedTasks(state.tasks.filter(t=>!t.done&&t.date<=dayOffset(2))):[];$('#notification-button').classList.toggle('has-items',due.length>0);$('#notification-button').setAttribute('aria-label',`Deadline reminders${due.length?`, ${due.length} upcoming`:''}`);$('#notifications').innerHTML=`<h3>A little heads-up</h3>${!state.profile.reminders?'<p>Reminders are turned off. You can enable them in Settings.</p>':due.length?due.slice(0,8).map(t=>`<button class="notification-item" data-action="edit-task" data-id="${esc(t.id)}"><strong>${esc(t.title)}</strong><small>${t.date<today()?'Overdue · ':''}${relativeDate(t.date)} · ${esc(t.subject)}</small></button>`).join(''):'<p>You’re all caught up. No deadlines in the next two days.</p>'}`;}
function openEditor(type='task',id=null) { const session=type==='session',record=id?(session?state.sessions:state.tasks).find(t=>t.id===id):null;if(id&&!record)return;const form=$('#editor-form');form.reset();$('#editor-error').textContent='';form.elements.recordId.value=id||'';form.elements.recordType.value=session?'session':'task';form.elements.title.value=record?.title||'';form.elements.subject.value=record?.subject||'Computer Science';form.elements.kind.value=record?.kind||(type==='assignment'?'assignment':'task');form.elements.date.value=record?.date||(view==='calendar'?selectedDate:today());form.elements.priority.value=record?.priority||'medium';form.elements.time.value=record?.time||'09:00';form.elements.duration.value=record?.duration||60;form.elements.notes.value=record?.notes||'';form.elements.time.required=session;form.elements.duration.required=session;$('#time-field').hidden=!session;$('#duration-field').hidden=!session;$('#kind-field').hidden=session;$('#priority-field').hidden=session;const label=session?'study session':type==='assignment'||record?.kind==='assignment'?'assignment':'task';$('#editor-title').textContent=`${id?'Edit':'Create a'} ${label}`;$('#editor-submit').textContent=id?'Save changes':session?'Plan session':`Create ${label}`;$('#notifications').hidden=true;$('#notification-button').setAttribute('aria-expanded','false');if(!$('#editor-dialog').open)$('#editor-dialog').showModal();setTimeout(()=>form.elements.title.focus(),40);}
function saveEditor(event) {
  event.preventDefault();
  const form=event.target;
  if(!form.reportValidity()) return;
  const f=Object.fromEntries(new FormData(form)),session=f.recordType==='session',title=f.title.trim();
  $('#editor-error').textContent='';
  if(!title) { $('#editor-error').textContent='Give this item a title so you can find it later.'; return; }
  if(!validDate(f.date)) { $('#editor-error').textContent='Please choose a valid date.'; return; }
  const list=session?state.sessions:state.tasks,existing=list.find(t=>t.id===f.recordId);
  if(f.recordId && !existing) {
    $('#editor-error').textContent='This item no longer exists. It may have been deleted in another tab. Close this editor and create a new item if needed.';
    return;
  }
  if(session) {
    const duration=Number(f.duration),time=f.time,minutes=Number(time.slice(0,2))*60+Number(time.slice(3));
    if(!validSessionTime(time,duration)) {
      $('#editor-error').textContent='Choose a valid time and a whole-minute duration from 5 to 480 minutes within the selected day.';
      return;
    }
    const overlap=state.sessions.find(s=>s.id!==f.recordId&&!s.done&&s.date===f.date&&minutes<Number(s.time.slice(0,2))*60+Number(s.time.slice(3))+s.duration&&minutes+duration>Number(s.time.slice(0,2))*60+Number(s.time.slice(3)));
    if(overlap) { $('#editor-error').textContent=`This overlaps with “${overlap.title}” at ${timeText(overlap.time)}. Please choose another time.`; return; }
  }
  const record={...(existing||{id:uid(),done:false}),title,subject:f.subject,date:f.date,notes:f.notes.trim()};
  if(session) { record.time=f.time; record.duration=Number(f.duration); }
  else { record.kind=f.kind; record.priority=f.priority; record.createdAt=existing?.createdAt||new Date().toISOString(); record.completedAt=existing?.completedAt||null; }
  if(existing) list[list.indexOf(existing)]=record;
  else list.push(record);
  persist();
  $('#editor-dialog').close();
  render();
  toast(existing?'Changes saved. A little more clarity.':session?'Study session planned. Your future self thanks you.':'Added to your list. One step at a time.');
}
function confirmAction(title,description,label,callback) { $('#confirm-title').textContent=title;$('#confirm-description').textContent=description;$('#confirm-button').textContent=label;confirmCallback=callback;$('#confirm-dialog').showModal(); }
function deleteRecord(kind,id) {const list=kind==='session'?state.sessions:state.tasks,record=list.find(r=>r.id===id);if(!record)return;confirmAction(`Delete this ${kind==='session'?'session':'task'}?`,`“${record.title}” will be removed. This cannot be undone.`,'Delete',()=>{if(kind==='session')state.sessions=state.sessions.filter(r=>r.id!==id);else state.tasks=state.tasks.filter(r=>r.id!==id);persist();render();toast('Item removed from your workspace.');});}
function timerSeconds() {return timer.running?Math.max(0,Math.ceil((timer.endsAt-Date.now())/1000)):timer.remaining;}
function timerDisplay() {const seconds=timerSeconds();return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
function updateTimerUI() {const digits=$('#timer-digits');if(digits)digits.textContent=timerDisplay();const button=$('#timer-toggle');if(button)button.innerHTML=`${icon(timer.running?'pause':'play')}${timer.running?'Pause':'Start '+(timer.mode==='focus'?'focus':'break')}`;const caption=$('#timer-caption');if(caption)caption.textContent=timer.running?'Stay with it. This time is yours.':timer.mode==='focus'?'A fresh start, whenever you’re ready.':'Rest is part of the process.';}
function checkTimer() {
  const completed=timer.running&&timerSeconds()===0;
  if(completed) {
    const mode=timer.mode;
    if(mode==='focus') state.focusLog.push({id:uid(),date:dateKey(new Date(timer.endsAt)),minutes:timer.total/60});
    timer=makeTimer(mode==='focus'?'break':'focus');
    persist();
    toast(mode==='focus'?'Focus complete. Your study time is saved. Take a little break.':'Break complete. Ready for a fresh start?');
  }
  const dayChanged=renderedDate!==today();
  renderedDate=today();
  if(completed||dayChanged) refreshBackground();
  updateTimerUI();
  return completed;
}
function switchTimerMode(mode) {checkTimer();if(timer.mode===mode)return;const go=()=>{timer=makeTimer(mode);persist();render();};if(timer.running||timer.remaining<timer.total)confirmAction('Switch timer mode?','This will discard the current timer’s progress. Completed focus sessions remain saved.','Switch mode',go);else go();}
function saveSettings(event) {event.preventDefault();const form=event.target;if(!form.reportValidity())return;const f=Object.fromEntries(new FormData(form));if(!f.name.trim()){toast('Please enter your name.');return;}const changed=state.profile.focusMinutes!==Number(f.focusMinutes)||state.profile.breakMinutes!==Number(f.breakMinutes);state.profile={name:f.name.trim(),course:f.course.trim(),goal:Number(f.goal),focusMinutes:Number(f.focusMinutes),breakMinutes:Number(f.breakMinutes),theme:f.theme,reminders:f.reminders==='on',compact:f.compact==='on'};if(changed&&!timer.running&&timer.remaining===timer.total)timer=makeTimer(timer.mode);persist();render();toast(changed&&timer.running?'Preferences saved. New timer durations apply after this session.':'Preferences saved. This space is yours.');}
function downloadFile(content,filename) {
  const blob=new Blob([content],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;
  a.download=filename;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportData() {
  state.timer=timer;
  downloadFile(JSON.stringify(state,null,2),`studyflow-backup-${today()}.json`);
  toast('Backup downloaded. A little peace of mind.');
}
async function importData(file) {if(!file)return;if(file.size>5*1024*1024){toast('Please choose a StudyFlow backup smaller than 5 MB.');return;}try {const value=JSON.parse(await file.text());if(!validateData(value))throw new Error('invalid');confirmAction('Restore this workspace?',`This backup has ${value.tasks.length} tasks and ${value.sessions.length} study sessions. It will replace your current workspace. Export a backup first if you want to keep it.`,'Restore backup',()=>{state=value;state.timer=null;timer=makeTimer('focus');loadWarning='';search='';filterStatus=filterSubject=filterPriority='all';persist();render();toast('Workspace restored. Welcome back.');});}catch{toast('This file is not a valid StudyFlow backup. Your workspace is unchanged.');}}
document.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(!button)return;const {action,id,type,value,mode}=button.dataset;switch(action){
  case 'navigate':navigate(button.dataset.view);break;
  case 'new':openEditor(type);break;
  case 'edit-task':openEditor('task',id);break;
  case 'edit-session':openEditor('session',id);break;
  case 'close-editor':$('#editor-dialog').close();break;
  case 'toggle-task':{const t=state.tasks.find(t=>t.id===id);if(!t)break;t.done=!t.done;t.completedAt=t.done?today():null;persist();render();toast(t.done?(t.kind==='assignment'?'Assignment marked submitted. Nicely done.':'One more thing done. Look at you go.'):'Task moved back to your to-do list.');break;}
  case 'delete-task':deleteRecord('task',id);break;
  case 'delete-session':deleteRecord('session',id);break;
  case 'complete-session':{const s=state.sessions.find(s=>s.id===id);if(!s||s.done)break;if(s.date>today()){toast('You can complete this session on its scheduled day.');break;}s.done=true;persist();render();toast(`${s.duration} minutes of progress. Session completed.`);break;}
  case 'task-tab':taskTab=value;render();break;
  case 'calendar-prev':calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);render();break;
  case 'calendar-next':calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);render();break;
  case 'calendar-today':selectedDate=today();calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);render();break;
  case 'select-date':selectedDate=button.dataset.date;calendarMonth=new Date(parseDate(selectedDate).getFullYear(),parseDate(selectedDate).getMonth(),1);if(view!=='calendar')navigate('calendar');else render();break;
  case 'timer-toggle':if(checkTimer())break;if(timer.running){timer.remaining=timerSeconds();timer.running=false;timer.endsAt=null;}else{timer.running=true;timer.endsAt=Date.now()+timer.remaining*1000;}persist();updateTimerUI();break;
  case 'timer-mode':switchTimerMode(mode);break;
  case 'timer-reset':{if(checkTimer())break;const reset=()=>{timer=makeTimer(timer.mode);persist();updateTimerUI();toast('Timer reset. A fresh start.');};if(timer.running||timer.remaining<timer.total)confirmAction('Reset your timer?','The current timer’s progress will be discarded. Completed sessions remain saved.','Reset timer',reset);else reset();break;}
  case 'notifications':{const panel=$('#notifications');panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));break;}
  case 'menu':document.body.classList.toggle('menu-open');button.setAttribute('aria-expanded',String(document.body.classList.contains('menu-open')));break;
  case 'close-menu':document.body.classList.remove('menu-open');$('#menu-button').setAttribute('aria-expanded','false');break;
  case 'clear-search':search='';$('#global-search').value='';render();break;
  case 'reset-filters':filterStatus=filterSubject=filterPriority='all';render();break;
  case 'export':exportData();break;
  case 'export-recovery':if(recoveryData!==null)downloadFile(recoveryData,`studyflow-original-data-${today()}.json`);break;
  case 'import':$('#import-input').click();break;
  case 'clear-data':confirmAction('Make room for a fresh start?','All tasks, study sessions, and focus history will be removed. Your profile and preferences will stay. Export a backup first if you need one.','Clear workspace',()=>{state.tasks=[];state.sessions=[];state.focusLog=[];state.demo=false;timer=makeTimer('focus');loadWarning='';persist();render();toast('A fresh canvas. Make it yours.');});break;
  case 'cancel-confirm':$('#confirm-dialog').close();confirmCallback=null;break;
}});
$('#confirm-button').addEventListener('click',()=>{const callback=confirmCallback;confirmCallback=null;$('#confirm-dialog').close();callback?.();});
$('#confirm-dialog').addEventListener('cancel',()=>{confirmCallback=null;});
$('#editor-form').addEventListener('submit',saveEditor);
document.addEventListener('submit',event=>{if(event.target.id==='settings-form')saveSettings(event);});
$('#global-search').addEventListener('input',event=>{search=event.target.value;if(view!=='tasks'&&view!=='assignments'){view='tasks';location.hash='tasks';filterStatus=filterSubject=filterPriority='all';}render();});
document.addEventListener('change',event=>{const bindings={'filter-status':v=>filterStatus=v,'filter-subject':v=>filterSubject=v,'filter-priority':v=>filterPriority=v,'sort-tasks':v=>sortBy=v,'chart-period':v=>chartPeriod=Number(v)};if(bindings[event.target.id]){bindings[event.target.id](event.target.value);render();}});
$('#import-input').addEventListener('change',event=>{importData(event.target.files[0]);event.target.value='';});
document.addEventListener('click',event=>{if(!event.target.closest('.notification-wrap')){$('#notifications').hidden=true;$('#notification-button').setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',event=>{const typing=event.target.matches('input,textarea,select')||event.target.isContentEditable;if(event.key==='Escape'){document.body.classList.remove('menu-open');$('#menu-button').setAttribute('aria-expanded','false');$('#notifications').hidden=true;$('#notification-button').setAttribute('aria-expanded','false');}if(typing||event.ctrlKey||event.metaKey||event.altKey||$('dialog[open]'))return;if(event.key==='/'){event.preventDefault();$('#global-search').focus();}if(event.key.toLowerCase()==='n'){event.preventDefault();openEditor('task');}});
window.addEventListener('hashchange',()=>{const next=location.hash.slice(1);if(next!==view&&['dashboard','tasks','calendar','planner','assignments','analytics','settings'].includes(next))navigate(next);});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkTimer();});
// Avoid keeping a stale in-memory copy if this workspace is edited in another tab.
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY&&event.newValue){try{const incoming=JSON.parse(event.newValue);if(validateData(incoming)){state=incoming;timer=validTimer(state.timer)?state.timer:makeTimer('focus');refreshBackground();updateTimerUI();toast('Workspace updated from another tab.');}}catch{/* Ignore invalid external writes. */}}});
$('#search-icon').innerHTML=icon('search');$('#notification-button').innerHTML=icon('bell');$('#profile-chevron').innerHTML=icon('chevron');$('#menu-button').innerHTML=icon('menu');
applyPreferences();render();checkTimer();if(storageAvailable&&!loadWarning)persist();setInterval(checkTimer,1000);
