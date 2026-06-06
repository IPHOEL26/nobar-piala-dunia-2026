const teamsData = {
  "Meksiko":["mx","A"],
  "Afrika Selatan":["za","A"],
  "Korea Selatan":["kr","A"],
  "Ceko":["cz","A"],

  "Kanada":["ca","B"],
  "Bosnia dan Herzegovina":["ba","B"],
  "Qatar":["qa","B"],
  "Swiss":["ch","B"],

  "Brasil":["br","C"],
  "Maroko":["ma","C"],
  "Haiti":["ht","C"],
  "Skotlandia":["gb-sct","C"],

  "Amerika Serikat":["us","D"],
  "Paraguay":["py","D"],
  "Australia":["au","D"],
  "Turki":["tr","D"],

  "Jerman":["de","E"],
  "Curaçao":["cw","E"],
  "Pantai Gading":["ci","E"],
  "Ekuador":["ec","E"],

  "Belanda":["nl","F"],
  "Jepang":["jp","F"],
  "Swedia":["se","F"],
  "Tunisia":["tn","F"],

  "Belgia":["be","G"],
  "Mesir":["eg","G"],
  "Iran":["ir","G"],
  "Selandia Baru":["nz","G"],

  "Spanyol":["es","H"],
  "Cape Verde":["cv","H"],
  "Arab Saudi":["sa","H"],
  "Uruguay":["uy","H"],

  "Prancis":["fr","I"],
  "Senegal":["sn","I"],
  "Irak":["iq","I"],
  "Norwegia":["no","I"],

  "Argentina":["ar","J"],
  "Aljazair":["dz","J"],
  "Austria":["at","J"],
  "Yordania":["jo","J"],

  "Portugal":["pt","K"],
  "RD Kongo":["cd","K"],
  "Uzbekistan":["uz","K"],
  "Kolombia":["co","K"],

  "Inggris":["gb-eng","L"],
  "Kroasia":["hr","L"],
  "Ghana":["gh","L"],
  "Panama":["pa","L"]
};

const groups = {};

Object.entries(teamsData).forEach(([team, data]) => {
  const group = data[1];
  if (!groups[group]) groups[group] = [];
  groups[group].push(team);
});

const pageName = {
  home:"Dashboard",
  dashboard:"Dashboard",
  groups:"Grup & Klasemen",
  matches:"Jadwal & Skor",
  bracket:"Bagan Gugur",
  knockout:"Bagan Gugur",
  watch:"Jadwal Nobar",
  nobar:"Jadwal Nobar",
  data:"Data",
  settings:"Data"
};

function el(id){
  return document.getElementById(id);
}

function safeText(value){
  return String(value || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function jsSafe(value){
  return String(value || "")
    .replaceAll("\\","\\\\")
    .replaceAll("'","\\'");
}

function flag(team){
  const code = teamsData[team]?.[0];
  if (!code) return "";

  return `<img class="flag-img" src="https://flagcdn.com/w40/${code}.png" alt="${safeText(team)}" loading="lazy" onerror="this.style.display='none'">`;
}

function fmt(team){
  if (!team) return "Menunggu";

  if (teamsData[team]) {
    return `<span class="team-display">${flag(team)}<span>${safeText(team)}</span></span>`;
  }

  return safeText(team);
}

function newState(){
  const state = {
    teams:{},
    matches:[],
    knockout:{},
    watch:[]
  };

  Object.keys(teamsData).forEach(team => {
    state.teams[team] = {
      status:"active",
      favorite:false
    };
  });

  state.matches = makeMatches();

  makeKOIds().forEach(id => {
    state.knockout[id] = {
      a:"",
      b:"",
      as:"",
      bs:"",
      winner:""
    };
  });

  return state;
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
        group:group,
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
  return []
    .concat([...Array(16)].map((_,i)=>`R32-${i+1}`))
    .concat([...Array(8)].map((_,i)=>`R16-${i+1}`))
    .concat([...Array(4)].map((_,i)=>`QF-${i+1}`))
    .concat(["SF-1","SF-2","FINAL","BRONZE"]);
}

function normalizeState(raw){
  const fresh = newState();

  if (!raw || typeof raw !== "object") return fresh;

  const state = {
    teams: raw.teams || fresh.teams,
    matches: Array.isArray(raw.matches) && raw.matches.length ? raw.matches : fresh.matches,
    knockout: raw.knockout || fresh.knockout,
    watch: raw.watch || raw.nobar || []
  };

  Object.keys(fresh.teams).forEach(team => {
    if (!state.teams[team]) state.teams[team] = fresh.teams[team];
  });

  makeKOIds().forEach(id => {
    if (!state.knockout[id]) {
      state.knockout[id] = {
        a:"",
        b:"",
        as:"",
        bs:"",
        winner:""
      };
    }
  });

  return state;
}

let state;

try{
  state = normalizeState(JSON.parse(localStorage.getItem("wc26-iphoel-bracket-v5")));
}catch{
  state = newState();
}

function save(){
  localStorage.setItem("wc26-iphoel-bracket-v5", JSON.stringify(state));
  render();
}

function wit(iso){
  return new Intl.DateTimeFormat("id-ID", {
    timeZone:"Asia/Jayapura",
    dateStyle:"medium",
    timeStyle:"short"
  }).format(new Date(iso)) + " WIT";
}

function jump(id){
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const page = el(id);
  if (page) page.classList.add("active");

  document.querySelectorAll(".nav, .nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === id);
  });

  const title = el("title") || el("pageTitle");
  if (title) title.textContent = pageName[id] || "Dashboard";
}

document.querySelectorAll(".nav, .nav-btn").forEach(btn => {
  btn.onclick = () => jump(btn.dataset.page);
});

function standings(){
  const table = {};

  Object.keys(groups).forEach(group => {
    table[group] = groups[group].map(team => ({
      team:team,
      p:0,
      w:0,
      d:0,
      l:0,
      gf:0,
      ga:0,
      gd:0,
      pts:0
    }));
  });

  const find = (group, team) => table[group].find(x => x.team === team);

  state.matches.forEach(match => {
    if (match.hs === "" || match.as === "") return;

    const home = find(match.group, match.home);
    const away = find(match.group, match.away);

    if (!home || !away) return;

    const homeScore = Number(match.hs);
    const awayScore = Number(match.as);

    home.p++;
    away.p++;

    home.gf += homeScore;
    home.ga += awayScore;

    away.gf += awayScore;
    away.ga += homeScore;

    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;

    if (homeScore > awayScore){
      home.w++;
      away.l++;
      home.pts += 3;
    }else if (homeScore < awayScore){
      away.w++;
      home.l++;
      away.pts += 3;
    }else{
      home.d++;
      away.d++;
      home.pts++;
      away.pts++;
    }
  });

  Object.keys(table).forEach(group => {
    table[group].sort((a,b) =>
      b.pts - a.pts ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      a.team.localeCompare(b.team)
    );
  });

  return table;
}

function autoQualify(){
  const st = standings();

  Object.keys(state.teams).forEach(team => {
    if (state.teams[team].status !== "eliminated") {
      state.teams[team].status = "active";
    }
  });

  Object.keys(st).forEach(group => {
    st[group].slice(0,2).forEach(row => {
      state.teams[row.team].status = "qualified";
    });
  });

  Object.keys(st)
    .map(group => st[group][2])
    .sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf)
    .slice(0,8)
    .forEach(row => {
      state.teams[row.team].status = "qualified";
    });

  localStorage.setItem("wc26-iphoel-bracket-v5", JSON.stringify(state));
}

function qualifiers(){
  const st = standings();
  const first = {};
  const second = {};

  Object.keys(st).forEach(group => {
    first[group] = st[group][0]?.team || "";
    second[group] = st[group][1]?.team || "";
  });

  const third = Object.keys(st)
    .map(group => st[group][2])
    .sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf)
    .slice(0,8)
    .map(row => row.team);

  return {first, second, third};
}

function fillR32(){
  const q = qualifiers();

  const pairList = [
    [q.first.A, q.second.B],
    [q.first.C, q.second.D],
    [q.first.E, q.second.F],
    [q.first.G, q.second.H],

    [q.first.I, q.second.J],
    [q.first.K, q.second.L],
    [q.first.B, q.second.A],
    [q.first.D, q.second.C],

    [q.first.F, q.second.E],
    [q.first.H, q.second.G],
    [q.first.J, q.second.I],
    [q.first.L, q.second.K],

    [q.third[0] || "Peringkat 3 terbaik", q.third[1] || "Peringkat 3 terbaik"],
    [q.third[2] || "Peringkat 3 terbaik", q.third[3] || "Peringkat 3 terbaik"],
    [q.third[4] || "Peringkat 3 terbaik", q.third[5] || "Peringkat 3 terbaik"],
    [q.third[6] || "Peringkat 3 terbaik", q.third[7] || "Peringkat 3 terbaik"]
  ];

  pairList.forEach((pair, index) => {
    const id = `R32-${index+1}`;

    if (!state.knockout[id]) {
      state.knockout[id] = {a:"", b:"", as:"", bs:"", winner:""};
    }

    const match = state.knockout[id];

    if (!match.winner){
      match.a = pair[0] || "";
      match.b = pair[1] || "";
    }
  });

  propagateKO();
}

function propagateKO(){
  const map = [
    ["R16-1","R32-1","R32-2"],
    ["R16-2","R32-3","R32-4"],
    ["R16-3","R32-5","R32-6"],
    ["R16-4","R32-7","R32-8"],

    ["R16-5","R32-9","R32-10"],
    ["R16-6","R32-11","R32-12"],
    ["R16-7","R32-13","R32-14"],
    ["R16-8","R32-15","R32-16"],

    ["QF-1","R16-1","R16-2"],
    ["QF-2","R16-3","R16-4"],
    ["QF-3","R16-5","R16-6"],
    ["QF-4","R16-7","R16-8"],

    ["SF-1","QF-1","QF-2"],
    ["SF-2","QF-3","QF-4"],

    ["FINAL","SF-1","SF-2"],
    ["BRONZE","SF-1","SF-2"]
  ];

  map.forEach(([to, fromA, fromB]) => {
    if (!state.knockout[to]) {
      state.knockout[to] = {a:"", b:"", as:"", bs:"", winner:""};
    }

    const target = state.knockout[to];

    if (!target.winner){
      target.a = state.knockout[fromA]?.winner || `Pemenang ${fromA}`;
      target.b = state.knockout[fromB]?.winner || `Pemenang ${fromB}`;
    }
  });
}

function matchWinner(match){
  if (!match) return "";
  if (match.as === "" || match.bs === "") return "";

  const scoreA = Number(match.as);
  const scoreB = Number(match.bs);

  if (scoreA > scoreB) return match.a;
  if (scoreB > scoreA) return match.b;

  return "";
}

function render(){
  renderHome();
  renderGroups();
  renderMatches();
  renderBracket();
  renderWatch();
}

function renderHome(){
  const teams = Object.keys(state.teams);

  const stTeams = el("stTeams") || el("statTeams");
  const stQ = el("stQ") || el("statQualified");
  const stE = el("stE") || el("statEliminated");
  const stN = el("stN") || el("statNobar");

  if (stTeams) stTeams.textContent = teams.length;
  if (stQ) stQ.textContent = teams.filter(t => state.teams[t].status === "qualified").length;
  if (stE) stE.textContent = teams.filter(t => state.teams[t].status === "eliminated").length;
  if (stN) stN.textContent = state.watch.length;

  const favList = el("favList") || el("favoriteTeams");
  if (!favList) return;

  const favs = teams.filter(t => state.teams[t].favorite);

  favList.innerHTML = favs.length
    ? favs.map(team => `<span class="chip team-chip">${fmt(team)}</span>`).join("")
    : `<span class="mini">Belum ada favorit.</span>`;
}

function renderGroups(){
  const groupGrid = el("groupGrid");
  if (!groupGrid) return;

  const searchInput = el("searchTeam") || el("teamSearch");
  const statusInput = el("filterStatus") || el("statusFilter");

  const keyword = searchInput ? searchInput.value.toLowerCase() : "";
  const filter = statusInput ? statusInput.value : "all";

  const st = standings();

  groupGrid.innerHTML = Object.keys(groups).map(group => {
    const rows = st[group]
      .filter(row => row.team.toLowerCase().includes(keyword))
      .filter(row =>
        filter === "all" ||
        state.teams[row.team].status === filter ||
        (filter === "favorite" && state.teams[row.team].favorite)
      );

    if (!rows.length) return "";

    return `
      <div class="group group-card">
        <div class="ghead group-title">
          <h3>Grup ${group}</h3>
          <b>Klasemen</b>
        </div>
        ${rows.map((row,i) => teamRow(row,i+1)).join("")}
      </div>
    `;
  }).join("");
}

function teamRow(row, pos){
  const status = state.teams[row.team];

  return `
    <div class="team team-row ${status.status} ${status.favorite ? "favorite" : ""}">
      <div>
        <div class="name team-name">${pos}. ${fmt(row.team)}</div>
        <div class="mini">${row.p} main • ${row.pts} poin • GD ${row.gd} • ${status.status}</div>
      </div>
      <div class="btns team-actions">
        <button class="b f status-btn star" onclick="fav('${jsSafe(row.team)}')">⭐</button>
        <button class="b q status-btn qual" onclick="setStatus('${jsSafe(row.team)}','qualified')">Lolos</button>
        <button class="b e status-btn elim" onclick="setStatus('${jsSafe(row.team)}','eliminated')">Gugur</button>
        <button class="b a status-btn neutral" onclick="setStatus('${jsSafe(row.team)}','active')">Aktif</button>
      </div>
    </div>
  `;
}

window.setStatus = function(team, status){
  if (!state.teams[team]) return;
  state.teams[team].status = status;
  save();
};

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
    Object.keys(groups).forEach(group => {
      filterGroup.add(new Option("Grup " + group, group));
    });
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
          <span>${match.stage} • Grup ${match.group}</span>
          <span>${wit(match.date)}</span>
        </div>

        <div class="vs match-teams">
          <div class="sideTeam match-side">
            <h4>${fmt(match.home)}</h4>
            <div class="btns match-actions">
              <button class="b q status-btn qual" onclick="setStatus('${jsSafe(match.home)}','qualified')">Lolos</button>
              <button class="b e status-btn elim" onclick="setStatus('${jsSafe(match.home)}','eliminated')">Gugur</button>
            </div>
          </div>

          <div class="score score-box">
            <input type="number" min="0" value="${safeText(match.hs)}" onchange="score('${match.id}','hs',this.value)">
            <span class="vst vsText">VS</span>
            <input type="number" min="0" value="${safeText(match.as)}" onchange="score('${match.id}','as',this.value)">
          </div>

          <div class="sideTeam match-side">
            <h4>${fmt(match.away)}</h4>
            <div class="btns match-actions">
              <button class="b q status-btn qual" onclick="setStatus('${jsSafe(match.away)}','qualified')">Lolos</button>
              <button class="b e status-btn elim" onclick="setStatus('${jsSafe(match.away)}','eliminated')">Gugur</button>
            </div>
          </div>
        </div>
      </div>
    `).join("");
}

window.score = function(id, key, value){
  const match = state.matches.find(x => x.id === id);
  if (!match) return;

  match[key] = value;

  autoQualify();
  fillR32();
  save();
};

function koCard(id, cls){
  const k = state.knockout[id];

  return `
    <div class="ko-card ${cls}">
      <div class="ko-label">${id}</div>

      <div class="ko-row">
        <div class="ko-team">${fmt(k.a)}</div>
        <input class="ko-score" value="${safeText(k.as)}" onchange="koScore('${id}','as',this.value)">
      </div>

      <div class="ko-row">
        <div class="ko-team">${fmt(k.b)}</div>
        <input class="ko-score" value="${safeText(k.bs)}" onchange="koScore('${id}','bs',this.value)">
      </div>

      <button class="ko-win" onclick="pickWinner('${id}')">
        ${k.winner ? "✅ " + fmt(k.winner) : "Pilih pemenang"}
      </button>
    </div>
  `;
}

function renderBracket(){
  const bracketBox = el("bracketBox") || el("bracketWrap");
  if (!bracketBox) return;

  fillR32();

  bracketBox.className = "bracket-stage";

  bracketBox.innerHTML = `
    <div class="bracket-board">
      <div class="bracket-title">
        <div class="path">PATHWAY 1</div>
        <h3>🏆 BAGAN GUGUR</h3>
        <div class="path right">PATHWAY 2</div>
      </div>

      <div class="bracket-grid">
        <div class="round-col path-left">
          <h4>R32</h4>
          ${[1,2,3,4].map(n => koCard("R32-"+n,"r32")).join("")}
          <span class="connector-line"></span>
        </div>

        <div class="round-col path-left">
          <h4>R16</h4>
          ${[1,2].map(n => koCard("R16-"+n,"r16")).join("")}
          <span class="connector-line"></span>
        </div>

        <div class="round-col path-left">
          <h4>QF</h4>
          ${koCard("QF-1","qf")}
          <span class="connector-line"></span>
        </div>

        <div class="round-col path-left">
          <h4>SF</h4>
          ${koCard("SF-1","sf")}
        </div>

        <div class="final-col">
          <div class="trophy-box">
            <div class="big">🏆</div>
            <b>FIFA WORLD CUP 2026</b>
            <span>IPHOEL EDUMATH</span>
          </div>
          ${koCard("FINAL","final")}
          ${koCard("BRONZE","bronze")}
        </div>

        <div class="round-col path-right">
          <h4>SF</h4>
          ${koCard("SF-2","sf")}
        </div>

        <div class="round-col path-right">
          <h4>QF</h4>
          ${koCard("QF-4","qf")}
          <span class="connector-line"></span>
        </div>

        <div class="round-col path-right">
          <h4>R16</h4>
          ${[7,8].map(n => koCard("R16-"+n,"r16")).join("")}
          <span class="connector-line"></span>
        </div>

        <div class="round-col path-right">
          <h4>R32</h4>
          ${[13,14,15,16].map(n => koCard("R32-"+n,"r32")).join("")}
          <span class="connector-line"></span>
        </div>
      </div>

      <div class="bracket-grid" style="margin-top:18px;">
        <div class="round-col path-left">
          <h4>R32</h4>
          ${[5,6,7,8].map(n => koCard("R32-"+n,"r32")).join("")}
          <span class="connector-line"></span>
        </div>

        <div class="round-col path-left">
          <h4>R16</h4>
          ${[3,4].map(n => koCard("R16-"+n,"r16")).join("")}
          <span class="connector-line"></span>
        </div>

        <div class="round-col path-left">
          <h4>QF</h4>
          ${koCard("QF-2","qf")}
          <span class="connector-line"></span>
        </div>

        <div class="round-col"></div>
        <div class="final-col"></div>
        <div class="round-col"></div>

        <div class="round-col path-right">
          <h4>QF</h4>
          ${koCard("QF-3","qf")}
          <span class="connector-line"></span>
        </div>

        <div class="round-col path-right">
          <h4>R16</h4>
          ${[5,6].map(n => koCard("R16-"+n,"r16")).join("")}
          <span class="connector-line"></span>
        </div>

        <div class="round-col path-right">
          <h4>R32</h4>
          ${[9,10,11,12].map(n => koCard("R32-"+n,"r32")).join("")}
          <span class="connector-line"></span>
        </div>
      </div>
    </div>
  `;
}

window.koScore = function(id, key, value){
  if (!state.knockout[id]) return;

  state.knockout[id][key] = value;

  const win = matchWinner(state.knockout[id]);
  if (win) state.knockout[id].winner = win;

  propagateKO();
  save();
};

window.pickWinner = function(id){
  const match = state.knockout[id];
  if (!match) return;

  let win = matchWinner(match);

  if (!win){
    win = prompt("Ketik nama pemenang:", match.a || "");
  }

  if (win){
    match.winner = win;

    if (state.teams[win]){
      state.teams[win].status = "qualified";
    }

    propagateKO();
    save();
  }
};

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
      </div>
    `).join("")
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

    state.watch.push({
      title:titleInput?.value || "Agenda Nobar",
      date:dateInput?.value || "",
      place:placeInput?.value || "",
      note:noteInput?.value || ""
    });

    e.target.reset();
    save();
  };
}

window.delWatch = function(index){
  state.watch.splice(index,1);
  save();
};

const backupBtn = el("backup") || el("downloadJson");

if (backupBtn){
  backupBtn.onclick = function(){
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(state,null,2)], {type:"application/json"})
    );
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
      try{
        state = normalizeState(JSON.parse(reader.result));
        save();
        alert("Import berhasil");
      }catch{
        alert("File tidak valid");
      }
    };

    reader.readAsText(file);
  };
}

const resetBtn = el("resetAll");

if (resetBtn){
  resetBtn.onclick = function(){
    if (confirm("Reset semua data?")){
      state = newState();
      save();
    }
  };
}

const searchTeam = el("searchTeam") || el("teamSearch");
if (searchTeam) searchTeam.oninput = renderGroups;

const filterStatus = el("filterStatus") || el("statusFilter");
if (filterStatus) filterStatus.onchange = renderGroups;

const filterGroup = el("filterGroup") || el("matchGroupFilter");
if (filterGroup) filterGroup.onchange = renderMatches;

const filterMatch = el("filterMatch") || el("matchStatusFilter");
if (filterMatch) filterMatch.onchange = renderMatches;

const printBtn = el("print") || el("printBtn");
if (printBtn) printBtn.onclick = () => window.print();

render();
