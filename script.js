
const teamsData = {
  "Meksiko":["mx","A"], "Afrika Selatan":["za","A"], "Korea Selatan":["kr","A"], "Ceko":["cz","A"],
  "Kanada":["ca","B"], "Bosnia dan Herzegovina":["ba","B"], "Qatar":["qa","B"], "Swiss":["ch","B"],
  "Brasil":["br","C"], "Maroko":["ma","C"], "Haiti":["ht","C"], "Skotlandia":["gb-sct","C"],
  "Amerika Serikat":["us","D"], "Paraguay":["py","D"], "Australia":["au","D"], "Turki":["tr","D"],
  "Jerman":["de","E"], "Curaçao":["cw","E"], "Pantai Gading":["ci","E"], "Ekuador":["ec","E"],
  "Belanda":["nl","F"], "Jepang":["jp","F"], "Swedia":["se","F"], "Tunisia":["tn","F"],
  "Belgia":["be","G"], "Mesir":["eg","G"], "Iran":["ir","G"], "Selandia Baru":["nz","G"],
  "Spanyol":["es","H"], "Cape Verde":["cv","H"], "Arab Saudi":["sa","H"], "Uruguay":["uy","H"],
  "Prancis":["fr","I"], "Senegal":["sn","I"], "Irak":["iq","I"], "Norwegia":["no","I"],
  "Argentina":["ar","J"], "Aljazair":["dz","J"], "Austria":["at","J"], "Yordania":["jo","J"],
  "Portugal":["pt","K"], "RD Kongo":["cd","K"], "Uzbekistan":["uz","K"], "Kolombia":["co","K"],
  "Inggris":["gb-eng","L"], "Kroasia":["hr","L"], "Ghana":["gh","L"], "Panama":["pa","L"]
};

const groups = {};
Object.entries(teamsData).forEach(([team, data]) => {
  const group = data[1];
  if (!groups[group]) groups[group] = [];
  groups[group].push(team);
});

const pageName = {
  home:"Dashboard", dashboard:"Dashboard",
  groups:"Grup & Klasemen", matches:"Jadwal & Skor",
  bracket:"Bagan Gugur", knockout:"Bagan Gugur",
  watch:"Jadwal Nobar", nobar:"Jadwal Nobar",
  data:"Data", settings:"Data"
};

const STORAGE_KEY = "wc26-iphoel-auto-v7-official-schedule";
const OLD_KEYS = ["wc26-iphoel-auto-v6", "wc26-iphoel-bracket-v5", "wc26-iphoel-bracket-v3"];

function el(id){ return document.getElementById(id); }

function safeText(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function jsSafe(value){
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'");
}

function flag(team){
  const code = teamsData[team]?.[0];
  if (!code) return "";
  return `<img class="flag-img" src="https://flagcdn.com/w80/${code}.png" alt="${safeText(team)}" loading="lazy" onerror="this.style.display='none'">`;
}

function fmt(team){
  if (!team) return "Menunggu";
  if (teamsData[team]) return `<span class="team-display">${flag(team)}<span>${safeText(team)}</span></span>`;
  return safeText(team);
}

function cleanScoreValue(value){
  if (value === "" || value === null || value === undefined) return "";
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "";
  return String(Math.floor(n));
}

function officialDate(localDate, localTime, utcOffset){
  return `${localDate}T${localTime}:00${utcOffset}`;
}

function makeOfficialMatch(matchNo, group, localDate, localTime, utcOffset, home, away, venue=""){
  return {
    id:`M${matchNo}`,
    matchNo,
    stage:"Fase Grup",
    group,
    date:officialDate(localDate, localTime, utcOffset),
    home,
    away,
    venue,
    hs:"",
    as:""
  };
}

function makeMatches(){
  const matches = [
    makeOfficialMatch(1,"A","2026-06-11","13:00","-06:00","Meksiko","Afrika Selatan","Mexico City Stadium"),
    makeOfficialMatch(2,"A","2026-06-11","20:00","-06:00","Korea Selatan","Ceko","Guadalajara Stadium"),
    makeOfficialMatch(3,"B","2026-06-12","15:00","-04:00","Kanada","Bosnia dan Herzegovina","Toronto Stadium"),
    makeOfficialMatch(4,"D","2026-06-12","18:00","-07:00","Amerika Serikat","Paraguay","Los Angeles Stadium"),
    makeOfficialMatch(5,"C","2026-06-13","21:00","-04:00","Haiti","Skotlandia","Boston Stadium"),
    makeOfficialMatch(6,"D","2026-06-13","21:00","-07:00","Australia","Turki","Vancouver Stadium"),
    makeOfficialMatch(7,"C","2026-06-13","18:00","-04:00","Brasil","Maroko","New York New Jersey Stadium"),
    makeOfficialMatch(8,"B","2026-06-13","12:00","-07:00","Qatar","Swiss","San Francisco Bay Area Stadium"),
    makeOfficialMatch(9,"E","2026-06-14","19:00","-04:00","Pantai Gading","Ekuador","Philadelphia Stadium"),
    makeOfficialMatch(10,"E","2026-06-14","12:00","-05:00","Jerman","Curaçao","Houston Stadium"),
    makeOfficialMatch(11,"F","2026-06-14","15:00","-05:00","Belanda","Jepang","Dallas Stadium"),
    makeOfficialMatch(12,"F","2026-06-14","20:00","-06:00","Swedia","Tunisia","Monterrey Stadium"),
    makeOfficialMatch(13,"H","2026-06-15","18:00","-04:00","Arab Saudi","Uruguay","Miami Stadium"),
    makeOfficialMatch(14,"H","2026-06-15","12:00","-04:00","Spanyol","Cape Verde","Atlanta Stadium"),
    makeOfficialMatch(15,"G","2026-06-15","18:00","-07:00","Iran","Selandia Baru","Los Angeles Stadium"),
    makeOfficialMatch(16,"G","2026-06-15","12:00","-07:00","Belgia","Mesir","Seattle Stadium"),
    makeOfficialMatch(17,"I","2026-06-16","15:00","-04:00","Prancis","Senegal","New York New Jersey Stadium"),
    makeOfficialMatch(18,"I","2026-06-16","18:00","-04:00","Irak","Norwegia","Boston Stadium"),
    makeOfficialMatch(19,"J","2026-06-16","20:00","-05:00","Argentina","Aljazair","Kansas City Stadium"),
    makeOfficialMatch(20,"J","2026-06-16","21:00","-07:00","Austria","Yordania","San Francisco Bay Area Stadium"),
    makeOfficialMatch(21,"L","2026-06-17","19:00","-04:00","Ghana","Panama","Toronto Stadium"),
    makeOfficialMatch(22,"L","2026-06-17","15:00","-05:00","Inggris","Kroasia","Dallas Stadium"),
    makeOfficialMatch(23,"K","2026-06-17","12:00","-05:00","Portugal","RD Kongo","Houston Stadium"),
    makeOfficialMatch(24,"K","2026-06-17","20:00","-06:00","Uzbekistan","Kolombia","Mexico City Stadium"),
    makeOfficialMatch(25,"A","2026-06-18","12:00","-04:00","Ceko","Afrika Selatan","Atlanta Stadium"),
    makeOfficialMatch(26,"B","2026-06-18","12:00","-07:00","Swiss","Bosnia dan Herzegovina","Los Angeles Stadium"),
    makeOfficialMatch(27,"B","2026-06-18","15:00","-07:00","Kanada","Qatar","Vancouver Stadium"),
    makeOfficialMatch(28,"A","2026-06-18","19:00","-06:00","Meksiko","Korea Selatan","Guadalajara Stadium"),
    makeOfficialMatch(29,"C","2026-06-19","20:30","-04:00","Brasil","Haiti","Philadelphia Stadium"),
    makeOfficialMatch(30,"C","2026-06-19","18:00","-04:00","Skotlandia","Maroko","Boston Stadium"),
    makeOfficialMatch(31,"D","2026-06-19","20:00","-07:00","Turki","Paraguay","San Francisco Bay Area Stadium"),
    makeOfficialMatch(32,"D","2026-06-19","12:00","-07:00","Amerika Serikat","Australia","Seattle Stadium"),
    makeOfficialMatch(33,"E","2026-06-20","16:00","-04:00","Jerman","Pantai Gading","Toronto Stadium"),
    makeOfficialMatch(34,"E","2026-06-20","19:00","-05:00","Ekuador","Curaçao","Kansas City Stadium"),
    makeOfficialMatch(35,"F","2026-06-20","12:00","-05:00","Belanda","Swedia","Houston Stadium"),
    makeOfficialMatch(36,"F","2026-06-20","22:00","-06:00","Tunisia","Jepang","Monterrey Stadium"),
    makeOfficialMatch(37,"H","2026-06-21","18:00","-04:00","Uruguay","Cape Verde","Miami Stadium"),
    makeOfficialMatch(38,"H","2026-06-21","12:00","-04:00","Spanyol","Arab Saudi","Atlanta Stadium"),
    makeOfficialMatch(39,"G","2026-06-21","12:00","-07:00","Belgia","Iran","Los Angeles Stadium"),
    makeOfficialMatch(40,"G","2026-06-21","18:00","-07:00","Selandia Baru","Mesir","Vancouver Stadium"),
    makeOfficialMatch(41,"I","2026-06-22","20:00","-04:00","Norwegia","Senegal","New York New Jersey Stadium"),
    makeOfficialMatch(42,"I","2026-06-22","17:00","-04:00","Prancis","Irak","Philadelphia Stadium"),
    makeOfficialMatch(43,"J","2026-06-22","12:00","-05:00","Argentina","Austria","Dallas Stadium"),
    makeOfficialMatch(44,"J","2026-06-22","20:00","-07:00","Yordania","Aljazair","San Francisco Bay Area Stadium"),
    makeOfficialMatch(45,"L","2026-06-23","16:00","-04:00","Inggris","Ghana","Boston Stadium"),
    makeOfficialMatch(46,"L","2026-06-23","19:00","-04:00","Panama","Kroasia","Toronto Stadium"),
    makeOfficialMatch(47,"K","2026-06-23","12:00","-05:00","Portugal","Uzbekistan","Houston Stadium"),
    makeOfficialMatch(48,"K","2026-06-23","20:00","-06:00","Kolombia","RD Kongo","Guadalajara Stadium"),
    makeOfficialMatch(49,"C","2026-06-24","18:00","-04:00","Skotlandia","Brasil","Miami Stadium"),
    makeOfficialMatch(50,"C","2026-06-24","18:00","-04:00","Maroko","Haiti","Atlanta Stadium"),
    makeOfficialMatch(51,"B","2026-06-24","12:00","-07:00","Swiss","Kanada","Vancouver Stadium"),
    makeOfficialMatch(52,"B","2026-06-24","12:00","-07:00","Bosnia dan Herzegovina","Qatar","Seattle Stadium"),
    makeOfficialMatch(53,"A","2026-06-24","19:00","-06:00","Ceko","Meksiko","Mexico City Stadium"),
    makeOfficialMatch(54,"A","2026-06-24","19:00","-06:00","Afrika Selatan","Korea Selatan","Monterrey Stadium"),
    makeOfficialMatch(55,"E","2026-06-25","16:00","-04:00","Curaçao","Pantai Gading","Philadelphia Stadium"),
    makeOfficialMatch(56,"E","2026-06-25","16:00","-04:00","Ekuador","Jerman","New York New Jersey Stadium"),
    makeOfficialMatch(57,"F","2026-06-25","18:00","-05:00","Jepang","Swedia","Dallas Stadium"),
    makeOfficialMatch(58,"F","2026-06-25","18:00","-05:00","Tunisia","Belanda","Kansas City Stadium"),
    makeOfficialMatch(59,"D","2026-06-25","19:00","-07:00","Turki","Amerika Serikat","Los Angeles Stadium"),
    makeOfficialMatch(60,"D","2026-06-25","19:00","-07:00","Paraguay","Australia","San Francisco Bay Area Stadium"),
    makeOfficialMatch(61,"I","2026-06-26","15:00","-04:00","Norwegia","Prancis","Boston Stadium"),
    makeOfficialMatch(62,"I","2026-06-26","15:00","-04:00","Senegal","Irak","Toronto Stadium"),
    makeOfficialMatch(63,"G","2026-06-26","20:00","-07:00","Mesir","Iran","Seattle Stadium"),
    makeOfficialMatch(64,"G","2026-06-26","20:00","-07:00","Selandia Baru","Belgia","Vancouver Stadium"),
    makeOfficialMatch(65,"H","2026-06-26","19:00","-05:00","Cape Verde","Arab Saudi","Houston Stadium"),
    makeOfficialMatch(66,"H","2026-06-26","18:00","-06:00","Uruguay","Spanyol","Guadalajara Stadium"),
    makeOfficialMatch(67,"L","2026-06-27","17:00","-04:00","Panama","Inggris","New York New Jersey Stadium"),
    makeOfficialMatch(68,"L","2026-06-27","17:00","-04:00","Kroasia","Ghana","Philadelphia Stadium"),
    makeOfficialMatch(69,"J","2026-06-27","21:00","-05:00","Aljazair","Austria","Kansas City Stadium"),
    makeOfficialMatch(70,"J","2026-06-27","21:00","-05:00","Yordania","Argentina","Dallas Stadium"),
    makeOfficialMatch(71,"K","2026-06-27","19:30","-04:00","Kolombia","Portugal","Miami Stadium"),
    makeOfficialMatch(72,"K","2026-06-27","19:30","-04:00","RD Kongo","Uzbekistan","Atlanta Stadium")
  ];

  return matches.sort((a,b) => new Date(a.date) - new Date(b.date) || a.matchNo - b.matchNo);
}

function makeKOIds(){
  return Array.from({length:32}, (_,i) => `M${73+i}`);
}

function newState(){
  const state = {teams:{}, matches:makeMatches(), knockout:{}, watch:[]};
  Object.keys(teamsData).forEach(team => { state.teams[team] = {favorite:false}; });
  makeKOIds().forEach(id => { state.knockout[id] = {a:"", b:"", as:"", bs:"", winner:"", loser:""}; });
  return state;
}

function normalizeState(raw){
  const fresh = newState();
  if (!raw || typeof raw !== "object") return fresh;

  const state = {
    teams: raw.teams && typeof raw.teams === "object" ? raw.teams : fresh.teams,
    matches: Array.isArray(raw.matches) && raw.matches.length ? raw.matches : fresh.matches,
    knockout: raw.knockout && typeof raw.knockout === "object" ? raw.knockout : fresh.knockout,
    watch: Array.isArray(raw.watch) ? raw.watch : (Array.isArray(raw.nobar) ? raw.nobar : [])
  };

  Object.keys(fresh.teams).forEach(team => {
    if (!state.teams[team]) state.teams[team] = {favorite:false};
    state.teams[team].favorite = Boolean(state.teams[team].favorite);
    delete state.teams[team].status;
  });

  const freshMatches = makeMatches();
  const oldMatches = Array.isArray(state.matches) ? state.matches : [];
  const byId = Object.fromEntries(oldMatches.map(m => [m.id, m]));
  const byPair = new Map();
  const byReversePair = new Map();

  oldMatches.forEach(m => {
    if (!m || !m.group || !m.home || !m.away) return;
    byPair.set(`${m.group}|${m.home}|${m.away}`, m);
    byReversePair.set(`${m.group}|${m.away}|${m.home}`, m);
  });

  state.matches = freshMatches.map(m => {
    const same = byId[m.id] || byPair.get(`${m.group}|${m.home}|${m.away}`);
    if (same) return {...m, hs:cleanScoreValue(same.hs ?? ""), as:cleanScoreValue(same.as ?? "")};

    const reversed = byReversePair.get(`${m.group}|${m.home}|${m.away}`);
    if (reversed) return {...m, hs:cleanScoreValue(reversed.as ?? ""), as:cleanScoreValue(reversed.hs ?? "")};

    return m;
  });

  makeKOIds().forEach(id => {
    if (!state.knockout[id]) state.knockout[id] = {a:"", b:"", as:"", bs:"", winner:"", loser:""};
    state.knockout[id].as = cleanScoreValue(state.knockout[id].as ?? "");
    state.knockout[id].bs = cleanScoreValue(state.knockout[id].bs ?? "");
  });

  return state;
}

function loadState(){
  const keys = [STORAGE_KEY, ...OLD_KEYS];
  for (const key of keys){
    try{
      const raw = localStorage.getItem(key);
      if (raw) return normalizeState(JSON.parse(raw));
    }catch{}
  }
  return newState();
}

let state = loadState();

function save(skipRender=false){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (!skipRender) render();
}

function wit(iso){
  return new Intl.DateTimeFormat("id-ID", {timeZone:"Asia/Jayapura", dateStyle:"medium", timeStyle:"short"}).format(new Date(iso)) + " WIT";
}

function jump(id){
  const aliases = {
    dashboard:"home",
    knockout:"bracket",
    nobar:"watch",
    settings:"data"
  };

  const pageId = aliases[id] || id || "home";
  const target = el(pageId);
  if (!target) return false;

  document.querySelectorAll(".page").forEach(page => {
    const active = page.id === pageId;
    page.classList.toggle("active", active);
    page.hidden = !active;
    page.setAttribute("aria-hidden", active ? "false" : "true");
    page.style.display = active ? "block" : "none";
  });

  document.querySelectorAll(".nav, .nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === pageId || aliases[btn.dataset.page] === pageId);
    if (btn.tagName === "BUTTON") btn.type = "button";
  });

  const title = el("title") || el("pageTitle");
  if (title) title.textContent = pageName[pageId] || pageName[id] || "Dashboard";

  try{
    sessionStorage.setItem("wc26-active-page", pageId);
  }catch{}

  window.scrollTo(0, 0);
  return false;
}

function bindNavigation(){
  document.querySelectorAll(".nav, .nav-btn").forEach(btn => {
    if (btn.tagName === "BUTTON") btn.type = "button";
    btn.onclick = function(event){
      if (event){
        event.preventDefault();
        event.stopPropagation();
      }
      return jump(btn.dataset.page || "home");
    };
  });
}

bindNavigation();

document.addEventListener("click", function(event){
  const btn = event.target.closest(".nav, .nav-btn");
  if (!btn) return;
  event.preventDefault();
  event.stopPropagation();
  jump(btn.dataset.page || "home");
}, true);

function groupMatches(group){ return state.matches.filter(match => match.group === group); }
function groupComplete(group){ return groupMatches(group).every(match => match.hs !== "" && match.as !== ""); }
function allGroupMatchesComplete(){ return state.matches.every(match => match.hs !== "" && match.as !== ""); }
function completedGroupMatchCount(){ return state.matches.filter(match => match.hs !== "" && match.as !== "").length; }

function h2hStats(group, teams){
  const map = {};
  teams.forEach(team => { map[team] = {pts:0, gd:0, gf:0}; });
  state.matches.forEach(match => {
    if (match.group !== group || match.hs === "" || match.as === "") return;
    if (!teams.includes(match.home) || !teams.includes(match.away)) return;
    const hs = Number(match.hs);
    const as = Number(match.as);
    map[match.home].gf += hs; map[match.home].gd += hs - as;
    map[match.away].gf += as; map[match.away].gd += as - hs;
    if (hs > as) map[match.home].pts += 3;
    else if (as > hs) map[match.away].pts += 3;
    else { map[match.home].pts++; map[match.away].pts++; }
  });
  return map;
}

function standings(){
  const table = {};
  Object.keys(groups).forEach(group => {
    table[group] = groups[group].map(team => ({team, group, p:0, w:0, d:0, l:0, gf:0, ga:0, gd:0, pts:0}));
  });

  const find = (group, team) => table[group].find(x => x.team === team);

  state.matches.forEach(match => {
    if (match.hs === "" || match.as === "") return;
    const home = find(match.group, match.home);
    const away = find(match.group, match.away);
    if (!home || !away) return;
    const hs = Number(match.hs);
    const as = Number(match.as);

    home.p++; away.p++;
    home.gf += hs; home.ga += as;
    away.gf += as; away.ga += hs;
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;

    if (hs > as){ home.w++; away.l++; home.pts += 3; }
    else if (hs < as){ away.w++; home.l++; away.pts += 3; }
    else { home.d++; away.d++; home.pts++; away.pts++; }
  });

  Object.keys(table).forEach(group => {
    table[group].sort((a,b) => {
      const basic = b.pts - a.pts || b.gd - a.gd || b.gf - a.gf;
      if (basic) return basic;
      const tied = table[group].filter(x => x.pts === a.pts && x.gd === a.gd && x.gf === a.gf).map(x => x.team);
      if (tied.length > 1){
        const h = h2hStats(group, tied);
        const hh = h[b.team].pts - h[a.team].pts || h[b.team].gd - h[a.team].gd || h[b.team].gf - h[a.team].gf;
        if (hh) return hh;
      }
      return a.team.localeCompare(b.team);
    });
  });

  return table;
}

function qualifiers(){
  const st = standings();
  const first = {}, second = {}, thirdByGroup = {};
  Object.keys(st).forEach(group => {
    first[group] = st[group][0]?.team || "";
    second[group] = st[group][1]?.team || "";
    thirdByGroup[group] = st[group][2] || null;
  });

  const third = Object.keys(st).map(group => st[group][2]).filter(Boolean).sort((a,b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.group.localeCompare(b.group)
  );

  return {first, second, thirdByGroup, third, qualifiedThirds: third.slice(0,8)};
}

const THIRD_SLOT_CANDIDATES = {
  "1A":["C","E","F","H","I"],
  "1B":["E","F","G","I","J"],
  "1D":["B","E","F","I","J"],
  "1E":["A","B","C","D","F"],
  "1G":["A","E","H","I","J"],
  "1I":["C","D","F","G","H"],
  "1K":["D","E","I","J","L"],
  "1L":["E","H","I","J","K"]
};

function assignThirdSlots(qualifiedThirds){
  const groupsRanked = qualifiedThirds.map(row => row.group);
  if (groupsRanked.length < 8) return {};

  const result = {};
  const rankIndex = Object.fromEntries(groupsRanked.map((g,i) => [g,i]));
  const slots = Object.keys(THIRD_SLOT_CANDIDATES).sort((a,b) => {
    const ac = THIRD_SLOT_CANDIDATES[a].filter(g => groupsRanked.includes(g)).length;
    const bc = THIRD_SLOT_CANDIDATES[b].filter(g => groupsRanked.includes(g)).length;
    return ac - bc || a.localeCompare(b);
  });

  function backtrack(index, used){
    if (index === slots.length) return true;
    const slot = slots[index];
    const options = THIRD_SLOT_CANDIDATES[slot]
      .filter(group => groupsRanked.includes(group) && !used.has(group))
      .sort((a,b) => rankIndex[a] - rankIndex[b]);

    for (const group of options){
      result[slot] = group;
      used.add(group);
      if (backtrack(index + 1, used)) return true;
      used.delete(group);
      delete result[slot];
    }
    return false;
  }

  backtrack(0, new Set());
  return result;
}

const R32 = [
  {id:"M73", a:{kind:"rank", group:"A", pos:2}, b:{kind:"rank", group:"B", pos:2}, label:"2A vs 2B"},
  {id:"M74", a:{kind:"rank", group:"E", pos:1}, b:{kind:"third", slot:"1E"}, label:"1E vs 3A/B/C/D/F"},
  {id:"M75", a:{kind:"rank", group:"F", pos:1}, b:{kind:"rank", group:"C", pos:2}, label:"1F vs 2C"},
  {id:"M76", a:{kind:"rank", group:"C", pos:1}, b:{kind:"rank", group:"F", pos:2}, label:"1C vs 2F"},
  {id:"M77", a:{kind:"rank", group:"I", pos:1}, b:{kind:"third", slot:"1I"}, label:"1I vs 3C/D/F/G/H"},
  {id:"M78", a:{kind:"rank", group:"E", pos:2}, b:{kind:"rank", group:"I", pos:2}, label:"2E vs 2I"},
  {id:"M79", a:{kind:"rank", group:"A", pos:1}, b:{kind:"third", slot:"1A"}, label:"1A vs 3C/E/F/H/I"},
  {id:"M80", a:{kind:"rank", group:"L", pos:1}, b:{kind:"third", slot:"1L"}, label:"1L vs 3E/H/I/J/K"},
  {id:"M81", a:{kind:"rank", group:"D", pos:1}, b:{kind:"third", slot:"1D"}, label:"1D vs 3B/E/F/I/J"},
  {id:"M82", a:{kind:"rank", group:"G", pos:1}, b:{kind:"third", slot:"1G"}, label:"1G vs 3A/E/H/I/J"},
  {id:"M83", a:{kind:"rank", group:"K", pos:2}, b:{kind:"rank", group:"L", pos:2}, label:"2K vs 2L"},
  {id:"M84", a:{kind:"rank", group:"H", pos:1}, b:{kind:"rank", group:"J", pos:2}, label:"1H vs 2J"},
  {id:"M85", a:{kind:"rank", group:"B", pos:1}, b:{kind:"third", slot:"1B"}, label:"1B vs 3E/F/G/I/J"},
  {id:"M86", a:{kind:"rank", group:"J", pos:1}, b:{kind:"rank", group:"H", pos:2}, label:"1J vs 2H"},
  {id:"M87", a:{kind:"rank", group:"K", pos:1}, b:{kind:"third", slot:"1K"}, label:"1K vs 3D/E/I/J/L"},
  {id:"M88", a:{kind:"rank", group:"D", pos:2}, b:{kind:"rank", group:"G", pos:2}, label:"2D vs 2G"}
];

const KO_LINKS = {
  M89:["M74","M77"], M90:["M73","M75"], M91:["M76","M78"], M92:["M79","M80"],
  M93:["M83","M84"], M94:["M81","M82"], M95:["M86","M88"], M96:["M85","M87"],
  M97:["M89","M90"], M98:["M93","M94"], M99:["M91","M92"], M100:["M95","M96"],
  M101:["M97","M98"], M102:["M99","M100"], M104:["M101","M102"]
};

function matchLabel(id){
  const r32 = R32.find(m => m.id === id);
  if (r32) return r32.label;
  const link = KO_LINKS[id];
  if (link) return `Pemenang ${link[0]} vs ${link[1]}`;
  if (id === "M103") return "Kalah M101 vs Kalah M102";
  return id;
}

function ensureKO(id){
  if (!state.knockout[id]) state.knockout[id] = {a:"", b:"", as:"", bs:"", winner:"", loser:""};
  return state.knockout[id];
}

function resolvedRankTeam(q, group, pos){
  if (!groupComplete(group)) return pos === 1 ? `Juara Grup ${group}` : `Runner-up Grup ${group}`;
  return pos === 1 ? q.first[group] : q.second[group];
}

function resolvedThirdTeam(q, slot){
  if (!allGroupMatchesComplete()) return `Peringkat 3 ${THIRD_SLOT_CANDIDATES[slot].join("/")}`;
  const assignment = assignThirdSlots(q.qualifiedThirds);
  const group = assignment[slot];
  if (!group) return `Peringkat 3 ${THIRD_SLOT_CANDIDATES[slot].join("/")}`;
  return q.thirdByGroup[group]?.team || `Peringkat 3 Grup ${group}`;
}

function resolveSource(source, q){
  if (source.kind === "rank") return resolvedRankTeam(q, source.group, source.pos);
  if (source.kind === "third") return resolvedThirdTeam(q, source.slot);
  return "Menunggu";
}

function isActualTeam(team){ return Boolean(teamsData[team]); }
function scoreReady(k){ return k && k.as !== "" && k.bs !== ""; }

function matchWinner(match){
  if (!match || !scoreReady(match) || !isActualTeam(match.a) || !isActualTeam(match.b)) return "";
  const a = Number(match.as);
  const b = Number(match.bs);
  if (a > b) return match.a;
  if (b > a) return match.b;
  return "";
}

function matchLoser(match){
  if (!match || !scoreReady(match) || !isActualTeam(match.a) || !isActualTeam(match.b)) return "";
  const a = Number(match.as);
  const b = Number(match.bs);
  if (a > b) return match.b;
  if (b > a) return match.a;
  return "";
}

function setEntrants(id, a, b){
  const k = ensureKO(id);
  if (k.a !== a || k.b !== b){
    k.a = a;
    k.b = b;
    k.as = "";
    k.bs = "";
    k.winner = "";
    k.loser = "";
  }
}

function updateKO(){
  const q = qualifiers();
  R32.forEach(match => setEntrants(match.id, resolveSource(match.a, q), resolveSource(match.b, q)));

  const order = makeKOIds();
  order.forEach(id => {
    if (KO_LINKS[id]){
      const [fromA, fromB] = KO_LINKS[id];
      setEntrants(id, ensureKO(fromA).winner || `Pemenang ${fromA}`, ensureKO(fromB).winner || `Pemenang ${fromB}`);
    }

    if (id === "M103"){
      setEntrants(id, ensureKO("M101").loser || "Kalah M101", ensureKO("M102").loser || "Kalah M102");
    }

    const k = ensureKO(id);
    k.winner = matchWinner(k);
    k.loser = matchLoser(k);
  });
}

function render(){
  updateKO();
  renderHome();
  renderGroups();
  renderMatches();
  renderBracket();
  renderWatch();
}

function updateCardLabels(labels){
  ["stTeams","stQ","stE","stN"].forEach((id, index) => {
    const node = el(id);
    const label = node?.parentElement?.querySelector("span");
    if (label && labels[index]) label.textContent = labels[index];
  });
}

function renderHome(){
  const teams = Object.keys(state.teams);
  const favorites = teams.filter(t => state.teams[t].favorite).length;
  updateCardLabels(["Total Negara", "Skor Terisi", "Tim Favorit", "Agenda Nobar"]);

  const stTeams = el("stTeams") || el("statTeams");
  const stQ = el("stQ") || el("statQualified");
  const stE = el("stE") || el("statEliminated");
  const stN = el("stN") || el("statNobar");

  if (stTeams) stTeams.textContent = teams.length;
  if (stQ) stQ.textContent = `${completedGroupMatchCount()}/${state.matches.length}`;
  if (stE) stE.textContent = favorites;
  if (stN) stN.textContent = state.watch.length;

  const favList = el("favList") || el("favoriteTeams");
  if (!favList) return;
  const favs = teams.filter(t => state.teams[t].favorite);
  favList.innerHTML = favs.length ? favs.map(team => `<span class="chip team-chip">${fmt(team)}</span>`).join("") : `<span class="mini">Belum ada favorit.</span>`;
}

function renderGroups(){
  const groupGrid = el("groupGrid");
  if (!groupGrid) return;

  const searchInput = el("searchTeam") || el("teamSearch");
  const statusInput = el("filterStatus") || el("statusFilter");
  if (statusInput) statusInput.classList.add("hidden-control");

  const keyword = searchInput ? searchInput.value.toLowerCase() : "";
  const st = standings();

  groupGrid.innerHTML = Object.keys(groups).map(group => {
    const rows = st[group].filter(row => row.team.toLowerCase().includes(keyword));
    if (!rows.length) return "";
    const complete = groupComplete(group);
    return `
      <div class="group group-card">
        <div class="ghead group-title">
          <h3>Grup ${group}</h3>
          <b>${complete ? "Klasemen Final" : "Klasemen Sementara"}</b>
        </div>
        <div class="standings-head">
          <span>Tim</span><span>MJ</span><span>M</span><span>S</span><span>K</span><span>GM</span><span>GK</span><span>SG</span><span>Poin</span><span>Fav</span>
        </div>
        ${rows.map((row,i) => teamRow(row,i+1)).join("")}
      </div>
    `;
  }).join("");
}

function teamRow(row, pos){
  const fav = Boolean(state.teams[row.team]?.favorite);
  return `
    <div class="standing-row ${fav ? "favorite" : ""}">
      <div class="standing-team">${pos}. ${fmt(row.team)}</div>
      <div class="standing-cell">${row.p}</div>
      <div class="standing-cell">${row.w}</div>
      <div class="standing-cell">${row.d}</div>
      <div class="standing-cell">${row.l}</div>
      <div class="standing-cell">${row.gf}</div>
      <div class="standing-cell">${row.ga}</div>
      <div class="standing-cell">${row.gd}</div>
      <div class="standing-cell points-cell">${row.pts}</div>
      <button class="favorite-btn ${fav ? "active" : ""}" onclick="fav('${jsSafe(row.team)}')" title="Tandai favorit">⭐</button>
    </div>
  `;
}

window.setStatus = function(){ render(); };
window.fav = function(team){
  if (!state.teams[team]) return;
  state.teams[team].favorite = !state.teams[team].favorite;
  save();
};

function renderMatches(){
  const filterGroup = el("filterGroup") || el("matchGroupFilter");
  const filterMatch = el("filterMatch") || el("matchStatusFilter");
  const matchList = el("matchList");
  if (!matchList) return;

  if (filterGroup && filterGroup.options.length < 2){
    Object.keys(groups).forEach(group => filterGroup.add(new Option("Grup " + group, group)));
  }

  const fg = filterGroup ? filterGroup.value : "all";
  const fm = filterMatch ? filterMatch.value : "all";

  matchList.innerHTML = state.matches
    .filter(match => fg === "all" || match.group === fg)
    .filter(match => fm === "all" || (fm === "done" && match.hs !== "" && match.as !== "") || (fm === "pending" && (match.hs === "" || match.as === "")))
    .map(match => `
      <div class="match match-card">
        <div class="meta match-meta">
          <span>Match ${match.matchNo || match.id} • ${match.stage} • Grup ${match.group}${match.venue ? " • " + safeText(match.venue) : ""}</span>
          <span>${wit(match.date)}</span>
        </div>
        <div class="vs match-teams">
          <div class="sideTeam match-side"><h4>${fmt(match.home)}</h4></div>
          <div class="score score-box">
            <input type="number" inputmode="numeric" min="0" value="${safeText(match.hs)}" onchange="score('${match.id}','hs',this.value)" aria-label="Skor ${safeText(match.home)}">
            <span class="vst vsText">VS</span>
            <input type="number" inputmode="numeric" min="0" value="${safeText(match.as)}" onchange="score('${match.id}','as',this.value)" aria-label="Skor ${safeText(match.away)}">
          </div>
          <div class="sideTeam match-side"><h4>${fmt(match.away)}</h4></div>
        </div>
      </div>
    `).join("");
}

window.score = function(id, key, value){
  const match = state.matches.find(x => x.id === id);
  if (!match) return;
  match[key] = cleanScoreValue(value);
  updateKO();
  save();
};

function koStageClass(id){
  const n = Number(id.replace("M", ""));
  if (n >= 73 && n <= 88) return "r32";
  if (n >= 89 && n <= 96) return "r16";
  if (n >= 97 && n <= 100) return "qf";
  if (n >= 101 && n <= 102) return "sf";
  if (n === 103) return "bronze";
  if (n === 104) return "final";
  return "";
}

function koCard(id){
  const k = ensureKO(id);
  const ready = isActualTeam(k.a) && isActualTeam(k.b);
  const tied = ready && k.as !== "" && k.bs !== "" && Number(k.as) === Number(k.bs);
  const statusClass = k.winner ? "ok" : (tied ? "warn" : "");
  const statusText = k.winner ? `Pemenang otomatis: ${fmt(k.winner)}` : (tied ? "Skor imbang. Isi skor akhir yang menghasilkan pemenang." : "Pemenang otomatis dari skor.");

  return `
    <div class="ko-card ${koStageClass(id)}">
      <div class="ko-label"><span>${id}</span><span>${matchLabel(id)}</span></div>
      <div class="ko-row">
        <div class="ko-team">${fmt(k.a)}</div>
        <input class="ko-score" type="number" inputmode="numeric" min="0" value="${safeText(k.as)}" onchange="koScore('${id}','as',this.value)" ${ready ? "" : "disabled"}>
      </div>
      <div class="ko-row">
        <div class="ko-team">${fmt(k.b)}</div>
        <input class="ko-score" type="number" inputmode="numeric" min="0" value="${safeText(k.bs)}" onchange="koScore('${id}','bs',this.value)" ${ready ? "" : "disabled"}>
      </div>
      <div class="ko-auto ${statusClass}">${statusText}</div>
    </div>
  `;
}

function bracketColumn(title, ids, side){
  return `
    <div class="round-col clean path-${side}">
      <h4>${title}</h4>
      <div class="round-stack cards-${ids.length}">${ids.map(id => koCard(id)).join("")}</div>
    </div>
  `;
}

function renderBracket(){
  const bracketBox = el("bracketBox") || el("bracketWrap");
  if (!bracketBox) return;
  updateKO();

  bracketBox.className = "bracket-stage";
  bracketBox.innerHTML = `
    <div class="bracket-board">
      <div class="bracket-title">
        <div class="path">PATHWAY 1</div>
        <h3>🏆 BAGAN GUGUR</h3>
        <div class="path right">PATHWAY 2</div>
      </div>
      <div class="bracket-grid bracket-grid-clean">
        ${bracketColumn("R32", ["M74","M77","M73","M75","M76","M78","M79","M80"], "left")}
        ${bracketColumn("R16", ["M89","M90","M91","M92"], "left")}
        ${bracketColumn("QF", ["M97","M99"], "left")}
        ${bracketColumn("SF", ["M101"], "left")}
        <div class="final-col clean">
          <div class="trophy-box"><div class="big">🏆</div><b>FIFA WORLD CUP 2026</b><span>IPHOEL EDUMATH</span></div>
          ${koCard("M104")}
          ${koCard("M103")}
        </div>
        ${bracketColumn("SF", ["M102"], "right")}
        ${bracketColumn("QF", ["M98","M100"], "right")}
        ${bracketColumn("R16", ["M93","M94","M95","M96"], "right")}
        ${bracketColumn("R32", ["M83","M84","M81","M82","M86","M88","M85","M87"], "right")}
      </div>
    </div>
  `;
}

window.koScore = function(id, key, value){
  const match = ensureKO(id);
  match[key] = cleanScoreValue(value);
  updateKO();
  save();
};

window.pickWinner = function(){ updateKO(); save(); };

function renderWatch(){
  const watchList = el("watchList") || el("nobarList");
  if (!watchList) return;
  watchList.innerHTML = state.watch.length
    ? state.watch.map((item, index) => `
      <div class="watchItem nobar-item">
        <h4>${safeText(item.title)}</h4>
        <p>🕒 ${item.date ? new Date(item.date).toLocaleString("id-ID") : "-"} WIT</p>
        <p>📍 ${safeText(item.place || "-")}</p>
        <p>📝 ${safeText(item.note || "-")}</p>
        <button onclick="delWatch(${index})">Hapus</button>
      </div>`).join("")
    : "<p class='mini'>Belum ada agenda nobar.</p>";
}

const watchForm = el("watchForm") || el("nobarForm");
if (watchForm){
  watchForm.onsubmit = function(e){
    e.preventDefault();
    const titleInput = el("watchTitle") || el("nobarTitle");
    const dateInput = el("watchDate") || el("nobarDate");
    const placeInput = el("watchPlace") || el("nobarPlace");
    const noteInput = el("watchNote") || el("nobarNote");
    state.watch.push({title:titleInput?.value || "Agenda Nobar", date:dateInput?.value || "", place:placeInput?.value || "", note:noteInput?.value || ""});
    e.target.reset();
    save();
  };
}

window.delWatch = function(index){ state.watch.splice(index,1); save(); };


function resetMatchesByGroup(groupValue){
  const label = groupValue && groupValue !== "all" ? `Grup ${groupValue}` : "semua fase grup";
  if (!confirm(`Reset skor ${label}? Bagan gugur juga akan dikosongkan supaya tetap sesuai klasemen terbaru.`)) return;

  state.matches.forEach(match => {
    if (!groupValue || groupValue === "all" || match.group === groupValue){
      match.hs = "";
      match.as = "";
    }
  });

  clearKnockoutFrom(73);
  updateKO();
  save();
}

function resetCurrentGroupMatches(){
  const filterGroup = el("filterGroup") || el("matchGroupFilter");
  resetMatchesByGroup(filterGroup ? filterGroup.value : "all");
}

function clearKnockoutFrom(startNumber){
  makeKOIds().forEach(id => {
    const number = Number(id.replace("M", ""));
    if (number >= startNumber){
      const k = ensureKO(id);
      k.as = "";
      k.bs = "";
      k.winner = "";
      k.loser = "";
    }
  });
}

function resetKnockoutStage(stage){
  const config = {
    r32:{start:73, label:"32 Besar"},
    r16:{start:89, label:"16 Besar"},
    qf:{start:97, label:"Perempat Final"},
    sf:{start:101, label:"Semifinal"},
    finals:{start:103, label:"Final dan perebutan tempat ketiga"},
    knockout:{start:73, label:"seluruh bagan gugur"}
  }[stage];

  if (!config) return;
  if (!confirm(`Reset skor ${config.label}? Babak setelahnya juga dikosongkan agar alur pemenang tetap benar.`)) return;

  clearKnockoutFrom(config.start);
  updateKO();
  save();
}

function resetAllData(){
  if (confirm("Reset semua data skor, favorit, bagan, dan agenda nobar?")){
    state = newState();
    save();
  }
}

function plainTeam(team){ return String(team || "").replace(/<[^>]*>/g, ""); }

function htmlCell(value){ return safeText(value === undefined || value === null ? "" : value); }

function tableHtml(title, headers, rows){
  return `
    <h2>${htmlCell(title)}</h2>
    <table border="1">
      <thead><tr>${headers.map(h => `<th>${htmlCell(h)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${htmlCell(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table><br>`;
}

function buildExportTables(){
  updateKO();
  const st = standings();
  const parts = [];

  Object.keys(groups).forEach(group => {
    parts.push(tableHtml(`Klasemen Grup ${group}`, ["Pos", "Tim", "Main", "Menang", "Seri", "Kalah", "Gol Masuk", "Gol Kemasukan", "Selisih", "Poin"],
      st[group].map((row, i) => [i+1, row.team, row.p, row.w, row.d, row.l, row.gf, row.ga, row.gd, row.pts])
    ));
  });

  parts.push(tableHtml("Jadwal dan Skor Fase Grup", ["Match", "Grup", "Tanggal WIT", "Venue", "Tim Kandang", "Skor", "Tim Tandang", "Skor"],
    state.matches.map(match => [match.matchNo || match.id, match.group, wit(match.date), match.venue || "", match.home, match.hs, match.away, match.as])
  ));

  parts.push(tableHtml("Bagan Gugur", ["Match", "Label", "Tim A", "Skor A", "Tim B", "Skor B", "Pemenang"],
    makeKOIds().map(id => {
      const k = ensureKO(id);
      return [id, matchLabel(id), k.a, k.as, k.b, k.bs, k.winner];
    })
  ));

  parts.push(tableHtml("Agenda Nobar", ["Judul", "Tanggal/Jam", "Lokasi", "Catatan"],
    state.watch.map(item => [item.title, item.date ? new Date(item.date).toLocaleString("id-ID") + " WIT" : "", item.place, item.note])
  ));

  return parts.join("\n");
}

function exportExcel(){
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif} table{border-collapse:collapse;margin-bottom:18px} th{background:#d9eaf7;font-weight:bold} th,td{padding:6px 8px;border:1px solid #333}</style></head><body><h1>Data Nobar World Cup 2026</h1>${buildExportTables()}<script>
(function(){
  const KO_MATCH_INFO_PATCH = {
    M73:{date:"2026-06-28T12:00:00-07:00", venue:"Los Angeles Stadium"},
    M74:{date:"2026-06-29T16:30:00-04:00", venue:"Boston Stadium"},
    M75:{date:"2026-06-29T19:00:00-06:00", venue:"Monterrey Stadium"},
    M76:{date:"2026-06-29T12:00:00-05:00", venue:"Houston Stadium"},
    M77:{date:"2026-06-30T17:00:00-04:00", venue:"New York New Jersey Stadium"},
    M78:{date:"2026-06-30T12:00:00-05:00", venue:"Dallas Stadium"},
    M79:{date:"2026-06-30T19:00:00-06:00", venue:"Mexico City Stadium"},
    M80:{date:"2026-07-01T12:00:00-04:00", venue:"Atlanta Stadium"},
    M81:{date:"2026-07-01T17:00:00-07:00", venue:"San Francisco Bay Area Stadium"},
    M82:{date:"2026-07-01T13:00:00-07:00", venue:"Seattle Stadium"},
    M83:{date:"2026-07-02T19:00:00-04:00", venue:"Toronto Stadium"},
    M84:{date:"2026-07-02T12:00:00-07:00", venue:"Los Angeles Stadium"},
    M85:{date:"2026-07-02T20:00:00-07:00", venue:"Vancouver Stadium"},
    M86:{date:"2026-07-03T18:00:00-04:00", venue:"Miami Stadium"},
    M87:{date:"2026-07-03T20:30:00-05:00", venue:"Kansas City Stadium"},
    M88:{date:"2026-07-03T13:00:00-05:00", venue:"Dallas Stadium"},
    M89:{date:"2026-07-04T17:00:00-04:00", venue:"16 Besar"},
    M90:{date:"2026-07-04T13:00:00-04:00", venue:"16 Besar"},
    M91:{date:"2026-07-05T16:00:00-04:00", venue:"16 Besar"},
    M92:{date:"2026-07-05T20:00:00-04:00", venue:"16 Besar"},
    M93:{date:"2026-07-06T15:00:00-04:00", venue:"16 Besar"},
    M94:{date:"2026-07-06T20:00:00-04:00", venue:"16 Besar"},
    M95:{date:"2026-07-07T12:00:00-04:00", venue:"16 Besar"},
    M96:{date:"2026-07-07T16:00:00-04:00", venue:"16 Besar"},
    M97:{date:"2026-07-09T16:00:00-04:00", venue:"Perempat final"},
    M98:{date:"2026-07-10T15:00:00-04:00", venue:"Perempat final"},
    M99:{date:"2026-07-11T17:00:00-04:00", venue:"Perempat final"},
    M100:{date:"2026-07-11T21:00:00-04:00", venue:"Perempat final"},
    M101:{date:"2026-07-14T15:00:00-04:00", venue:"Semifinal"},
    M102:{date:"2026-07-15T15:00:00-04:00", venue:"Semifinal"},
    M103:{date:"2026-07-18T17:00:00-04:00", venue:"Perebutan juara 3"},
    M104:{date:"2026-07-19T15:00:00-04:00", venue:"Final"}
  };

  function shortWitPatch(iso){
    return new Intl.DateTimeFormat("id-ID", {
      timeZone:"Asia/Jayapura",
      weekday:"short",
      day:"2-digit",
      month:"short",
      hour:"2-digit",
      minute:"2-digit"
    }).format(new Date(iso)).replaceAll(".", ":") + " WIT";
  }

  function koSchedulePatch(id){
    const info = KO_MATCH_INFO_PATCH[id];
    if (!info) return "Jadwal resmi FIFA";
    return `${shortWitPatch(info.date)}${info.venue ? " • " + info.venue : ""}`;
  }

  function initIconButtonsPatch(){
    const mobile = el("mobileModeToggle");
    if (mobile) {
      mobile.textContent = "📱";
      mobile.title = "Mode HP Anak";
      mobile.setAttribute("aria-label", "Mode HP Anak");
      mobile.classList.add("icon-btn");
    }
    const print = el("printBtn") || el("print");
    if (print) {
      print.textContent = "🖨️";
      print.title = "Cetak/PDF";
      print.setAttribute("aria-label", "Cetak atau simpan PDF");
      print.classList.add("icon-btn");
    }
    document.querySelectorAll("header.top button, header.topbar button").forEach(btn => {
      if ((btn.textContent || "").trim().toLowerCase() === "refresh") {
        btn.textContent = "🔄";
        btn.title = "Refresh";
        btn.setAttribute("aria-label", "Refresh");
        btn.classList.add("icon-btn");
      }
    });
    const headerActions = document.querySelector("header.top > div:last-child, header.topbar > div:last-child");
    if (headerActions) headerActions.classList.add("top-actions");
  }

  scoreDraft = function(id, key, value){
    const match = state.matches.find(x => x.id === id);
    if (!match) return;
    match[key] = cleanScoreValue(value);
  };

  saveMatchScore = function(id){
    const match = state.matches.find(x => x.id === id);
    if (!match) return;
    const homeInput = document.querySelector(`[data-score-id="${id}"][data-score-key="hs"]`);
    const awayInput = document.querySelector(`[data-score-id="${id}"][data-score-key="as"]`);
    if (homeInput) match.hs = cleanScoreValue(homeInput.value);
    if (awayInput) match.as = cleanScoreValue(awayInput.value);
    updateKO();
    save();
    const btn = document.querySelector(`[data-save-match="${id}"]`);
    if (btn) {
      const old = btn.textContent;
      btn.textContent = "✅";
      setTimeout(() => { btn.textContent = old || "💾"; }, 900);
    }
  };

  score = function(id, key, value){
    scoreDraft(id, key, value);
    updateKO();
    save();
  };

  renderMatches = function(){
    const filterGroup = el("filterGroup") || el("matchGroupFilter");
    const filterMatch = el("filterMatch") || el("matchStatusFilter");
    const matchList = el("matchList");
    if (!matchList) return;

    if (filterGroup && filterGroup.options.length < 2){
      Object.keys(groups).forEach(group => filterGroup.add(new Option("Grup " + group, group)));
    }

    const fg = filterGroup ? filterGroup.value : "all";
    const fm = filterMatch ? filterMatch.value : "all";

    matchList.innerHTML = state.matches
      .filter(match => fg === "all" || match.group === fg)
      .filter(match =>
        fm === "all" ||
        (fm === "done" && match.hs !== "" && match.as !== "") ||
        (fm === "pending" && (match.hs === "" || match.as === ""))
      )
      .map(match => `
        <div class="match match-card">
          <div class="meta match-meta">
            <span>Match ${match.matchNo || match.id} • ${match.stage} • Grup ${match.group}${match.venue ? " • " + safeText(match.venue) : ""}</span>
            <span>${wit(match.date)}</span>
          </div>
          <div class="vs match-teams">
            <div class="sideTeam match-side"><h4>${fmt(match.home)}</h4></div>
            <div class="score score-box score-box-save">
              <input data-score-id="${match.id}" data-score-key="hs" type="number" inputmode="numeric" min="0" value="${safeText(match.hs)}" oninput="scoreDraft('${match.id}','hs',this.value)" aria-label="Skor ${safeText(match.home)}">
              <span class="vst vsText">VS</span>
              <button class="score-save" data-save-match="${match.id}" onclick="saveMatchScore('${match.id}')" title="Simpan skor" aria-label="Simpan skor">💾</button>
              <input data-score-id="${match.id}" data-score-key="as" type="number" inputmode="numeric" min="0" value="${safeText(match.as)}" oninput="scoreDraft('${match.id}','as',this.value)" aria-label="Skor ${safeText(match.away)}">
            </div>
            <div class="sideTeam match-side"><h4>${fmt(match.away)}</h4></div>
          </div>
        </div>
      `).join("");
  };

  koCard = function(id){
    const k = ensureKO(id);
    const ready = isActualTeam(k.a) && isActualTeam(k.b);
    const tied = ready && k.as !== "" && k.bs !== "" && Number(k.as) === Number(k.bs);
    const statusClass = k.winner ? "ok" : (tied ? "warn" : "");
    const statusText = k.winner ? `Lolos: ${fmt(k.winner)}` : koSchedulePatch(id);

    return `
      <div class="ko-card ${koStageClass(id)}">
        <div class="ko-label"><span>${id}</span><span>${matchLabel(id)}</span></div>
        <div class="ko-row">
          <div class="ko-team">${fmt(k.a)}</div>
          <input class="ko-score" type="number" inputmode="numeric" min="0" value="${safeText(k.as)}" onchange="koScore('${id}','as',this.value)" ${ready ? "" : "disabled"}>
        </div>
        <div class="ko-row">
          <div class="ko-team">${fmt(k.b)}</div>
          <input class="ko-score" type="number" inputmode="numeric" min="0" value="${safeText(k.bs)}" onchange="koScore('${id}','bs',this.value)" ${ready ? "" : "disabled"}>
        </div>
        <div class="ko-auto ${statusClass}">${tied ? "Skor imbang. Isi skor akhir yang menghasilkan pemenang." : statusText}</div>
      </div>
    `;
  };

  const previousJump = jump;
  jump = function(id){
    previousJump(id);
    document.querySelectorAll(".page").forEach(page => {
      const active = page.id === id;
      page.classList.toggle("active", active);
      page.hidden = !active;
      page.style.display = active ? "block" : "none";
    });
    setTimeout(() => window.scrollTo({top:0, behavior:"smooth"}), 20);
  };

  window.scoreDraft = scoreDraft;
  window.saveMatchScore = saveMatchScore;
  window.koCard = koCard;
  window.renderMatches = renderMatches;
  window.jump = jump;

  initIconButtonsPatch();
  document.querySelectorAll(".page").forEach(page => {
    const active = page.classList.contains("active");
    page.hidden = !active;
    page.style.display = active ? "block" : "none";
  });
  render();
})();



window.onload=function(){setTimeout(function(){window.focus();window.print();},400)}<\/script></body></html>`);
  win.document.close();
}

function printReport(){
  const body = `<h1>Data Nobar World Cup 2026</h1><p class="print-note">Gunakan menu Print lalu pilih Save as PDF bila ingin menyimpan sebagai PDF.</p>${buildExportTables()}`;
  openPrintWindow("Data Nobar World Cup 2026", body);
}

function printBracket(){
  updateKO();
  renderBracket();
  const bracketBox = el("bracketBox") || el("bracketWrap");
  const body = `<h1>Bagan Gugur World Cup 2026</h1><p class="print-note">Mode cetak bagan. Pilih Save as PDF pada dialog print bila ingin ekspor PDF.</p>${bracketBox ? bracketBox.innerHTML : ""}`;
  openPrintWindow("Bagan Gugur World Cup 2026", body);
}

function toggleKidMode(){
  document.body.classList.toggle("kid-mode");
  localStorage.setItem("wc26-iphoel-kid-mode", document.body.classList.contains("kid-mode") ? "1" : "0");
  updateKidModeButton();
}

function updateKidModeButton(){
  [el("mobileModeToggle"), el("kidModeBtn")].filter(Boolean).forEach(btn => {
    btn.textContent = document.body.classList.contains("kid-mode") ? "Mode HP: ON" : "Mode HP Anak";
  });
}

if (localStorage.getItem("wc26-iphoel-kid-mode") === "1") document.body.classList.add("kid-mode");

window.resetCurrentGroupMatches = resetCurrentGroupMatches;
window.resetKnockoutStage = resetKnockoutStage;
window.resetAllData = resetAllData;
window.exportExcel = exportExcel;
window.printReport = printReport;
window.printBracket = printBracket;
window.toggleKidMode = toggleKidMode;

const backupBtn = el("backup") || el("downloadJson");
if (backupBtn){
  backupBtn.onclick = function(){
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(state,null,2)], {type:"application/json"}));
    a.download = "backup-nobar-worldcup-2026.json";
    a.click();
  };
}

const restoreInput = el("restore") || el("importJson");
if (restoreInput){
  restoreInput.onchange = function(e){
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(){
      try{ state = normalizeState(JSON.parse(reader.result)); save(); alert("Import berhasil"); }
      catch{ alert("File tidak valid"); }
    };
    reader.readAsText(file);
  };
}

const resetBtn = el("resetAll");
if (resetBtn) resetBtn.onclick = resetAllData;

const resetVisibleGroupBtn = el("resetVisibleGroup");
if (resetVisibleGroupBtn) resetVisibleGroupBtn.onclick = resetCurrentGroupMatches;

const resetGroupScoresBtn = el("resetGroupScores");
if (resetGroupScoresBtn) resetGroupScoresBtn.onclick = () => resetMatchesByGroup("all");

const resetR32Btn = el("resetR32");
if (resetR32Btn) resetR32Btn.onclick = () => resetKnockoutStage("r32");

const resetR16Btn = el("resetR16");
if (resetR16Btn) resetR16Btn.onclick = () => resetKnockoutStage("r16");

const resetQFBtn = el("resetQF");
if (resetQFBtn) resetQFBtn.onclick = () => resetKnockoutStage("qf");

const resetSFBtn = el("resetSF");
if (resetSFBtn) resetSFBtn.onclick = () => resetKnockoutStage("sf");

const resetFinalsBtn = el("resetFinals");
if (resetFinalsBtn) resetFinalsBtn.onclick = () => resetKnockoutStage("finals");

const resetKnockoutTopBtn = el("resetKnockoutTop");
if (resetKnockoutTopBtn) resetKnockoutTopBtn.onclick = () => resetKnockoutStage("knockout");

const exportExcelBtn = el("exportExcel");
if (exportExcelBtn) exportExcelBtn.onclick = exportExcel;

const printReportBtn = el("printReportBtn");
if (printReportBtn) printReportBtn.onclick = printReport;

const printBracketBtn = el("printBracketBtn");
if (printBracketBtn) printBracketBtn.onclick = printBracket;

const printBracketTopBtn = el("printBracketTop");
if (printBracketTopBtn) printBracketTopBtn.onclick = printBracket;

[el("mobileModeToggle"), el("kidModeBtn")].filter(Boolean).forEach(btn => {
  btn.onclick = toggleKidMode;
});
updateKidModeButton();

const searchTeam = el("searchTeam") || el("teamSearch");
if (searchTeam) searchTeam.oninput = renderGroups;
const filterStatus = el("filterStatus") || el("statusFilter");
if (filterStatus) filterStatus.classList.add("hidden-control");
const filterGroup = el("filterGroup") || el("matchGroupFilter");
if (filterGroup) filterGroup.onchange = renderMatches;
const filterMatch = el("filterMatch") || el("matchStatusFilter");
if (filterMatch) filterMatch.onchange = renderMatches;
const printBtn = el("print") || el("printBtn");
if (printBtn) printBtn.onclick = printReport;


const initialActivePage = (() => {
  try{
    const saved = sessionStorage.getItem("wc26-active-page");
    if (saved && el(saved)) return saved;
  }catch{}
  return document.querySelector(".page.active")?.id || "home";
})();

render();
bindNavigation();
jump(initialActivePage);


