const http = require("http");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Aswin's Planner</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
  <style>
    :root {
      --bg:       #1a1108;
      --surface:  #241a0e;
      --card:     #2e2110;
      --border:   #4a3520;
      --accent:   #e8833a;
      --accent2:  #d4a843;
      --accent3:  #c0574a;
      --text:     #f0e6d3;
      --muted:    #9a7f60;
    }
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

    body {
      background: var(--bg);
      font-family: 'DM Sans', sans-serif;
      color: var(--text);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 40px 16px 80px;
    }

    body::after {
      content:'';
      position:fixed;
      inset:0;
      pointer-events:none;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      background-size:180px 180px;
      z-index:999;
      opacity:.45;
    }

    .app {
      width:100%;
      max-width:780px;
      display:grid;
      grid-template-columns:255px 1fr;
      gap:22px;
      animation: rise .7s cubic-bezier(.22,1,.36,1) both;
    }

    @keyframes rise {
      from { opacity:0; transform:translateY(26px); }
      to   { opacity:1; transform:translateY(0); }
    }

    /* ── SIDEBAR ── */
    .sidebar { display:flex; flex-direction:column; gap:16px; }

    .profile-card {
      background:var(--card);
      border:1px solid var(--border);
      border-radius:14px;
      padding:24px 20px;
      position:relative;
      overflow:hidden;
    }
    .profile-card::before {
      content:'';
      position:absolute;
      top:0;left:0;right:0;
      height:3px;
      background:linear-gradient(90deg,var(--accent3),var(--accent),var(--accent2));
    }

    .avatar {
      width:50px; height:50px;
      border-radius:50%;
      background:linear-gradient(135deg,var(--accent),var(--accent2));
      display:flex; align-items:center; justify-content:center;
      font-family:'Playfair Display',serif;
      font-size:1.35rem; font-weight:700;
      color:var(--bg);
      margin-bottom:13px;
      box-shadow:0 4px 18px rgba(232,131,58,.3);
    }

    .profile-name {
      font-family:'Playfair Display',serif;
      font-size:1.3rem; font-weight:700;
      margin-bottom:2px;
    }

    .profile-sub {
      font-size:10px; letter-spacing:2.5px;
      color:var(--accent);
      font-family:'DM Mono',monospace;
      text-transform:uppercase;
      margin-bottom:16px;
    }

    .prow {
      display:flex; justify-content:space-between; align-items:center;
      padding:7px 0;
      border-top:1px solid var(--border);
      font-size:12px;
    }
    .prow .k { color:var(--muted); font-family:'DM Mono',monospace; font-size:9.5px; letter-spacing:1px; text-transform:uppercase; }
    .prow .v { color:var(--text); font-weight:500; }
    .prow .v.gold { color:var(--accent2); font-family:'Playfair Display',serif; font-style:italic; font-size:1rem; }

    .mini-stats { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .mstat {
      background:var(--card);
      border:1px solid var(--border);
      border-radius:10px;
      padding:14px 10px;
      text-align:center;
    }
    .mstat .n { font-family:'Playfair Display',serif; font-size:1.65rem; font-weight:700; color:var(--accent); line-height:1; }
    .mstat:nth-child(2) .n { color:var(--accent2); }
    .mstat .l { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-top:4px; font-family:'DM Mono',monospace; }

    .events-panel {
      background:var(--card);
      border:1px solid var(--border);
      border-radius:14px;
      padding:18px;
      flex:1;
      min-height:160px;
    }
    .ep-title { font-family:'Playfair Display',serif; font-size:.9rem; font-style:italic; color:var(--muted); margin-bottom:12px; }

    .eitem {
      display:flex; gap:8px; align-items:flex-start;
      padding:8px 0;
      border-bottom:1px solid var(--border);
      animation:fadeIn .3s ease both;
    }
    @keyframes fadeIn {
      from { opacity:0; transform:translateX(-6px); }
      to   { opacity:1; transform:translateX(0); }
    }
    .eitem:last-child { border-bottom:none; }
    .edot { width:6px; height:6px; border-radius:50%; background:var(--accent); margin-top:5px; flex-shrink:0; }
    .edate { font-family:'DM Mono',monospace; font-size:10px; color:var(--muted); min-width:30px; }
    .etxt { font-size:12px; color:var(--text); line-height:1.4; flex:1; }
    .edel { background:none; border:none; color:var(--muted); cursor:pointer; font-size:12px; opacity:.5; transition:opacity .2s; padding:0 2px; }
    .edel:hover { opacity:1; color:var(--accent3); }
    .no-ev { color:var(--muted); font-size:12px; font-style:italic; text-align:center; padding:18px 0; }

    /* ── MAIN ── */
    .main { display:flex; flex-direction:column; gap:18px; }

    .cal-card { background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; }

    .cal-header {
      padding:20px 24px 14px;
      display:flex; align-items:center; justify-content:space-between;
      border-bottom:1px solid var(--border);
    }
    .cal-month { font-family:'Playfair Display',serif; font-size:1.75rem; font-weight:700; }
    .cal-year  { font-family:'DM Mono',monospace; font-size:.82rem; color:var(--accent); margin-left:9px; }

    .cal-nav { display:flex; gap:7px; }
    .nbtn {
      width:33px; height:33px;
      background:var(--surface);
      border:1px solid var(--border);
      color:var(--text);
      border-radius:8px;
      cursor:pointer;
      font-size:14px;
      display:flex; align-items:center; justify-content:center;
      transition:all .15s;
    }
    .nbtn:hover { background:var(--accent); color:var(--bg); border-color:var(--accent); }
    .tbtn {
      background:none; border:1px solid var(--border);
      color:var(--muted);
      font-family:'DM Mono',monospace; font-size:10px; letter-spacing:2px;
      padding:0 12px; border-radius:8px; cursor:pointer; text-transform:uppercase;
      transition:all .15s;
    }
    .tbtn:hover { border-color:var(--accent); color:var(--accent); }

    .cal-grid { padding:16px 14px 20px; }
    .wdays { display:grid; grid-template-columns:repeat(7,1fr); margin-bottom:6px; }
    .wday  { text-align:center; font-family:'DM Mono',monospace; font-size:9.5px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); padding:4px 0; }
    .wday:first-child,.wday:last-child { color:var(--accent3); }

    .dgrid { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }

    .day {
      aspect-ratio:1;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      border-radius:9px;
      cursor:pointer;
      font-size:13px; font-weight:500;
      position:relative;
      transition:background .15s, transform .15s;
      color:var(--text);
      user-select:none;
    }
    .day:hover { background:rgba(232,131,58,.15); transform:scale(1.07); }
    .day.empty { cursor:default; pointer-events:none; }
    .day.other-month { color:var(--border); }
    .day.today {
      background:var(--accent);
      color:var(--bg);
      font-weight:700;
      box-shadow:0 4px 14px rgba(232,131,58,.4);
    }
    .day.today:hover { transform:scale(1.07); }
    .day.has-event::after {
      content:'';
      position:absolute;
      bottom:5px;
      width:4px; height:4px;
      background:var(--accent2);
      border-radius:50%;
    }
    .day.today.has-event::after { background:var(--bg); }
    .day.selected:not(.today) {
      background:rgba(212,168,67,.18);
      border:1px solid var(--accent2);
      color:var(--accent2);
    }

    /* Add panel */
    .add-panel {
      background:var(--card); border:1px solid var(--border);
      border-radius:14px; padding:20px 22px;
      display:none; flex-direction:column; gap:12px;
    }
    .add-panel.open { display:flex; }
    .ap-title { font-family:'Playfair Display',serif; font-size:.95rem; }
    .ap-title span { color:var(--accent); font-style:italic; }
    .ap-row { display:flex; gap:10px; }
    .ap-input {
      flex:1; background:var(--surface); border:1px solid var(--border);
      border-radius:8px; padding:9px 13px; color:var(--text);
      font-family:'DM Sans',sans-serif; font-size:13px; outline:none;
      transition:border-color .15s;
    }
    .ap-input:focus { border-color:var(--accent); }
    .ap-input::placeholder { color:var(--muted); }
    .ap-save {
      background:var(--accent); color:var(--bg);
      border:none; border-radius:8px; padding:9px 20px;
      font-family:'DM Mono',monospace; font-size:10px; letter-spacing:2px;
      text-transform:uppercase; cursor:pointer; transition:background .15s;
    }
    .ap-save:hover { background:var(--accent2); }

    /* Quote */
    .qstrip {
      background:var(--surface); border:1px solid var(--border);
      border-radius:10px; padding:13px 18px;
      display:flex; align-items:center; gap:10px;
    }
    .qmark { font-family:'Playfair Display',serif; font-size:2.8rem; line-height:1; color:var(--border); flex-shrink:0; margin-top:-6px; }
    .qtxt  { font-family:'Playfair Display',serif; font-style:italic; font-size:.8rem; color:var(--muted); line-height:1.55; }

    @media (max-width:620px) {
      .app { grid-template-columns:1fr; }
      .mini-stats { grid-template-columns:repeat(4,1fr); }
    }
  </style>
</head>
<body>
<div class="app">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="profile-card">
      <div class="avatar">A</div>
      <div class="profile-name">Aswin M</div>
      <div class="profile-sub">2023BCS0012</div>
      <div class="prow"><span class="k">Institute</span><span class="v">IIIT Kottayam</span></div>
      <div class="prow"><span class="k">Program</span><span class="v">B.Tech CSE</span></div>
      <div class="prow"><span class="k">Batch</span><span class="v">2023 – 2027</span></div>
    </div>

    <div class="mini-stats">
      <div class="mstat">
        <div class="n" id="dayNum">—</div>
        <div class="l">Day</div>
      </div>
      <div class="mstat">
        <div class="n" id="evtCount">0</div>
        <div class="l">Notes</div>
      </div>
    </div>

    <div class="events-panel">
      <div class="ep-title">— your notes —</div>
      <div id="eventList"></div>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="main">
    <div class="cal-card">
      <div class="cal-header">
        <div>
          <span class="cal-month" id="calMonth"></span>
          <span class="cal-year"  id="calYear"></span>
        </div>
        <div class="cal-nav">
          <button class="nbtn" onclick="changeMonth(-1)">&#8249;</button>
          <button class="tbtn" onclick="goToday()">Today</button>
          <button class="nbtn" onclick="changeMonth(1)">&#8250;</button>
        </div>
      </div>
      <div class="cal-grid">
        <div class="wdays">
          <div class="wday">Sun</div><div class="wday">Mon</div><div class="wday">Tue</div>
          <div class="wday">Wed</div><div class="wday">Thu</div><div class="wday">Fri</div><div class="wday">Sat</div>
        </div>
        <div class="dgrid" id="calDays"></div>
      </div>
    </div>

    <div class="add-panel" id="addPanel">
      <div class="ap-title">Note for <span id="addLabel">—</span></div>
      <div class="ap-row">
        <input class="ap-input" id="addInput" placeholder="What's on your mind?" maxlength="80"
               onkeydown="if(event.key==='Enter')saveEvent()"/>
        <button class="ap-save" onclick="saveEvent()">Save</button>
      </div>
    </div>

    <div class="qstrip">
      <div class="qmark">"</div>
      <div class="qtxt" id="quoteText"></div>
    </div>
  </main>
</div>

<script>
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const today = new Date();
  let cur = { y: today.getFullYear(), m: today.getMonth() };
  let sel = null;
  let events = {};
  try { events = JSON.parse(localStorage.getItem('aswin_cal') || '{}'); } catch(e) {}

  function key(y,m,d){ return y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'); }
  function save(){ try{ localStorage.setItem('aswin_cal', JSON.stringify(events)); }catch(e){} }

  function render(){
    const {y,m} = cur;
    document.getElementById('calMonth').textContent = MONTHS[m];
    document.getElementById('calYear').textContent  = y;

    const first = new Date(y,m,1).getDay();
    const total = new Date(y,m+1,0).getDate();
    const grid  = document.getElementById('calDays');
    grid.innerHTML = '';

    for(let i=0;i<first;i++){
      const e=document.createElement('div'); e.className='day empty'; grid.appendChild(e);
    }
    for(let d=1;d<=total;d++){
      const e=document.createElement('div'); e.className='day';
      e.textContent=d;
      const k=key(y,m,d);
      const isToday = y===today.getFullYear()&&m===today.getMonth()&&d===today.getDate();
      if(isToday){ e.classList.add('today'); document.getElementById('dayNum').textContent=d; }
      if(events[k]&&events[k].length) e.classList.add('has-event');
      if(sel===k) e.classList.add('selected');
      e.onclick=()=>pick(y,m,d);
      grid.appendChild(e);
    }
    renderList();
  }

  function pick(y,m,d){
    sel=key(y,m,d);
    document.getElementById('addLabel').textContent=d+' '+MONTHS[m]+' '+y;
    document.getElementById('addPanel').classList.add('open');
    document.getElementById('addInput').focus();
    render();
  }

  function saveEvent(){
    const inp=document.getElementById('addInput');
    const txt=inp.value.trim();
    if(!txt||!sel) return;
    if(!events[sel]) events[sel]=[];
    events[sel].push(txt);
    save(); inp.value='';
    document.getElementById('addPanel').classList.remove('open');
    sel=null; render();
  }

  function renderList(){
    const list=document.getElementById('eventList');
    const all=[];
    for(const [k,arr] of Object.entries(events))
      arr.forEach((t,i)=>all.push({k,t,i}));
    all.sort((a,b)=>a.k.localeCompare(b.k));
    document.getElementById('evtCount').textContent=all.length;
    if(!all.length){
      list.innerHTML='<div class="no-ev">No notes yet.<br/>Click a date to add one.</div>';
      return;
    }
    list.innerHTML='';
    all.slice(0,8).forEach(({k,t,i})=>{
      const [,mo,dd]=k.split('-');
      const el=document.createElement('div'); el.className='eitem';
      el.innerHTML='<div class="edot"></div><div class="edate">'+dd+'/'+mo+'</div>'+
        '<div class="etxt">'+t+'</div>'+
        '<button class="edel" onclick="del(\''+k+'\','+i+')">✕</button>';
      list.appendChild(el);
    });
  }

  function del(k,i){
    events[k].splice(i,1);
    if(!events[k].length) delete events[k];
    save(); render();
  }

  function changeMonth(d){
    cur.m+=d;
    if(cur.m<0){cur.m=11;cur.y--;}
    if(cur.m>11){cur.m=0;cur.y++;}
    document.getElementById('addPanel').classList.remove('open');
    sel=null; render();
  }

  function goToday(){
    cur={y:today.getFullYear(),m:today.getMonth()};
    document.getElementById('addPanel').classList.remove('open');
    sel=null; render();
  }

  const quotes=[
    "First year is for learning how things work. Every year after is for building.",
    "A 7.77 today is the floor — not the ceiling.",
    "The best time to start was last semester. Second best time is now.",
    "Systems thinking is just pattern recognition at scale.",
    "An ML model is only as good as the pipeline feeding it.",
    "Research is the art of being wrong faster than everyone else.",
    "DSA fluency comes from speaking it daily.",
    "Every commit is a time capsule. Make them worth reading.",
  ];
  document.getElementById('quoteText').textContent=quotes[Math.floor(Math.random()*quotes.length)];

  render();
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(html);
  res.end();
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
