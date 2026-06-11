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

const STORAGE_KEY = "wc26-iphoel-auto-v6";
const OLD_KEYS = ["wc26-iphoel-bracket-v5", "wc26-iphoel-bracket-v3"];

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
    .replaceAll("\\","\\\\")
    .replaceAll("'","\\'");
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

function makeMatches(){
  const pairs = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]];
  const matches = [];
  let n = 0;
  const base = new Date("2026-06-11T20:00:00+09:00");

  Object.entries(groups).forEach(([group, teams]) => {
    pairs.forEach((pair, i) => {
      const d = new Date(base.getTime() + n * 6 * 3600000);
      matches.push({
        id:`G${group}-${i+1}`,
        stage:"Fase Grup",
        group,
        date:d.toISOString(),
        home:teams[pair[0]],
        away:teams[pair[1]],
        hs:"",
        as:""
      });
      n++;
    });
  });

  return matches;
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
  const byId = Object.fromEntries(state.matches.map(m => [m.id, m]));
  state.matches = freshMatches.map(m => ({...m, hs:cleanScoreValue(byId[m.id]?.hs ?? ""), as:cleanScoreValue(byId[m.id]?.as ?? "")}));

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
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  const page = el(id);
  if (page) page.classList.add("active");
  document.querySelectorAll(".nav, .nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.page === id));
  const title = el("title") || el("pageTitle");
  if (title) title.textContent = pageName[id] || "Dashboard";
}

document.querySelectorAll(".nav, .nav-btn").forEach(btn => { btn.onclick = () => jump(btn.dataset.page); });

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
          <span>${match.stage} • Grup ${match.group}</span>
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

  parts.push(tableHtml("Jadwal dan Skor Fase Grup", ["ID", "Grup", "Tanggal WIT", "Tim Kandang", "Skor", "Tim Tandang", "Skor"],
    state.matches.map(match => [match.id, match.group, wit(match.date), match.home, match.hs, match.away, match.as])
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
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif} table{border-collapse:collapse;margin-bottom:18px} th{background:#d9eaf7;font-weight:bold} th,td{padding:6px 8px;border:1px solid #333}</style></head><body><h1>Data Nobar World Cup 2026</h1>${buildExportTables()}</body></html>`;
  const blob = new Blob([html], {type:"application/vnd.ms-excel;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data-nobar-worldcup-2026.xls";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function printStyles(){
  return `
    body{font-family:Segoe UI,Arial,sans-serif;margin:20px;color:#111;background:#fff}
    h1,h2,h3{margin:0 0 10px}.print-note{margin:0 0 18px;color:#555}
    table{border-collapse:collapse;width:100%;margin:0 0 18px;font-size:12px}th,td{border:1px solid #999;padding:6px 8px;text-align:left}th{background:#eef3f8}
    .bracket-board{min-width:1450px;background:#fff;border:1px solid #ddd;border-radius:14px;padding:16px}.bracket-title{display:grid;grid-template-columns:1fr 250px 1fr;align-items:center;gap:12px}.bracket-title h3{text-align:center}.right{text-align:right}
    .bracket-grid{display:grid;grid-template-columns:210px 210px 210px 210px 250px 210px 210px 210px 210px;gap:12px;align-items:stretch}.round-col,.final-col{display:flex;flex-direction:column;gap:10px;justify-content:center}.round-col h4{text-align:center}.round-stack{display:flex;flex-direction:column;gap:10px;justify-content:space-around;flex:1}.ko-card{border:1px solid #777;border-radius:10px;padding:8px;break-inside:avoid}.ko-label{font-size:10px;font-weight:bold;margin-bottom:5px;display:flex;justify-content:space-between;gap:6px}.ko-row{display:grid;grid-template-columns:1fr 36px;gap:4px;margin-top:4px}.ko-team{background:#f2f2f2;border-radius:6px;padding:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ko-score{border:1px solid #888;border-radius:6px;text-align:center;padding:4px}.ko-auto{font-size:10px;margin-top:6px}.flag-img{width:22px;height:15px;object-fit:cover;vertical-align:middle;margin-right:4px}.team-display{display:inline-flex;align-items:center;gap:5px}.trophy-box{text-align:center;border:1px solid #aaa;border-radius:10px;padding:10px}.big{font-size:42px}
    @page{size:landscape;margin:10mm}
  `;
}

function openPrintWindow(title, bodyHtml){
  const win = window.open("", "_blank");
  if (!win){
    alert("Popup cetak diblokir browser. Izinkan popup, lalu coba lagi.");
    return;
  }
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeText(title)}</title><style>${printStyles()}</style></head><body>${bodyHtml}<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},400)}<\/script></body></html>`);
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

render();
