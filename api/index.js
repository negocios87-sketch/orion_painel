// ═══════════════════════════════════════════════════════════════════
// Board Academy — Painel Orion · Atividades & Taxa de Conexão (V1)
// Backend Node/Express — deploy Vercel (serverless)
//
// Env vars obrigatórias (configurar no Vercel):
//   PIPEDRIVE_TOKEN  = token da API do Pipedrive
//   GITHUB_TOKEN     = token com permissão de escrita em "contents" no repo
//   GITHUB_REPO      = "owner/repo" onde as propostas serão gravadas
// Opcional:
//   GITHUB_FILE      = caminho do arquivo JSON (default: propostas_orion.json)
// ═══════════════════════════════════════════════════════════════════

const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());

// ── FRONTEND servido pelo próprio Express (à prova de config do Vercel) ──
let HTML_CACHE = null;
function loadHtml() {
  if (HTML_CACHE) return HTML_CACHE;
  const candidatos = [
    path.join(process.cwd(), "public", "index.html"),
    path.join(__dirname, "..", "public", "index.html"),
    path.join(__dirname, "public", "index.html"),
    "/var/task/public/index.html",
    "/var/task/api/public/index.html",
  ];
  for (const p of candidatos) {
    try {
      HTML_CACHE = fs.readFileSync(p, "utf-8");
      return HTML_CACHE;
    } catch (e) { /* tenta o próximo */ }
  }
  throw new Error(
    "index.html não encontrado. Caminhos testados: " + candidatos.join(" | ") +
    " · cwd=" + process.cwd() + " · __dirname=" + __dirname
  );
}
app.get("/", (req, res) => {
  try {
    res.type("html").send(loadHtml());
  } catch (e) {
    res.status(500).send(String(e.message));
  }
});

// ── CONFIG ──────────────────────────────────────────────────────────
const PIPEDRIVE_TOKEN = process.env.PIPEDRIVE_TOKEN || "";
const GITHUB_TOKEN    = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO     = process.env.GITHUB_REPO || "";
const GITHUB_FILE     = process.env.GITHUB_FILE || "propostas_orion.json";

const FILTER_ATIV_GERAL     = 1670288; // wpp / call / meetings marcadas+agendadas
const FILTER_REU_REALIZADAS = 1670289; // meetings realizadas (done, eixo due_date)
const FILTER_DEALS_WON      = 1670292; // deals ganhas (eixo won_time)

const URL_COLAB =
  "https://docs.google.com/spreadsheets/d/e/" +
  "2PACX-1vSvwO3Ag2f2cbkVgR1pJZp6fANQcbualGKlAG50fmOljuEGKZ1gJBbSAjRdO3SomXUEVQOWnTvlfHRd" +
  "/pub?gid=1782440078&single=true&output=csv";

const TIME_ALVO   = "orion";
const TZ_OFFSET_H = 3; // Pipedrive devolve UTC; BRT = UTC-3 (sem horário de verão)

// ── HELPERS DE DATA ─────────────────────────────────────────────────
// Converte timestamp UTC do Pipedrive → string "YYYY-MM-DD" em BRT
function utcToBrtDateStr(raw) {
  if (!raw) return null;
  const s = String(raw).trim().replace(" ", "T");
  const iso = s.endsWith("Z") ? s : s + "Z";
  const d = new Date(iso);
  if (isNaN(d)) return null;
  const brt = new Date(d.getTime() - TZ_OFFSET_H * 3600 * 1000);
  return brt.toISOString().slice(0, 10);
}

// Data de hoje em BRT
function todayBrt() {
  const now = new Date(Date.now() - TZ_OFFSET_H * 3600 * 1000);
  return now.toISOString().slice(0, 10);
}

// due_date já vem como data pura "YYYY-MM-DD" — NUNCA converter
function pureDate(raw) {
  if (!raw) return null;
  return String(raw).slice(0, 10);
}

// ── NORMALIZAÇÃO DE NOMES (planilha × Pipedrive) ────────────────────
function normName(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// ── CSV PARSER (com aspas) ──────────────────────────────────────────
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c !== "\r") field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// ── ROSTER (URL_COLAB · time=ORION · mês/ano atual) ─────────────────
const MESES_PT = {
  janeiro: 1, fevereiro: 2, marco: 3, março: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
  jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
};

function parseMesAno(val) {
  // Aceita: "7", "07", "julho", "jul", "07/2026", "2026-07", "jul/2026"
  const v = normName(val);
  if (!v) return { mes: null, ano: null };
  let m = v.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (m) return { mes: +m[1], ano: +m[2] };
  m = v.match(/^(\d{4})[\/\-](\d{1,2})$/);
  if (m) return { mes: +m[2], ano: +m[1] };
  m = v.match(/^([a-z]+)[\/\-](\d{4})$/);
  if (m && MESES_PT[m[1]]) return { mes: MESES_PT[m[1]], ano: +m[2] };
  if (/^\d{1,2}$/.test(v)) return { mes: +v, ano: null };
  if (/^\d{4}$/.test(v)) return { mes: null, ano: +v };
  if (MESES_PT[v]) return { mes: MESES_PT[v], ano: null };
  return { mes: null, ano: null };
}

async function fetchRoster() {
  const r = await fetch(URL_COLAB);
  if (!r.ok) throw new Error("Falha ao ler URL_COLAB: HTTP " + r.status);
  const rows = parseCsv(await r.text());
  if (!rows.length) return { nomes: [], aviso: "planilha vazia" };

  // Detecta colunas pelo header; fallback posicional (0=nome, 2=time, 3=cargo)
  const header = rows[0].map(normName);
  const idx = (names, fallback) => {
    for (const n of names) {
      const i = header.findIndex((h) => h === n || h.includes(n));
      if (i >= 0) return i;
    }
    return fallback;
  };
  const iNome  = idx(["nome"], 0);
  const iTime  = idx(["time", "equipe", "squad"], 2);
  const iMes   = idx(["mes"], -1);
  const iAno   = idx(["ano"], -1);
  const iCargo = idx(["cargo", "funcao"], 3);

  const hoje = new Date(Date.now() - TZ_OFFSET_H * 3600 * 1000);
  const mesAtual = hoje.getUTCMonth() + 1;
  const anoAtual = hoje.getUTCFullYear();

  const nomes = [];
  let temColunaMes = iMes >= 0;

  for (let li = 1; li < rows.length; li++) {
    const row = rows[li];
    if (!row || row.length <= Math.max(iNome, iTime)) continue;
    const nome = (row[iNome] || "").trim();
    if (!nome || normName(nome) === "nome") continue;
    if (normName(row[iTime]) !== TIME_ALVO) continue;

    // Filtro de mês/ano atual (se as colunas existirem)
    if (temColunaMes) {
      const pm = parseMesAno(row[iMes]);
      let mes = pm.mes, ano = pm.ano;
      if (ano === null && iAno >= 0) {
        const pa = parseMesAno(row[iAno]);
        ano = pa.ano !== null ? pa.ano : pa.mes; // coluna ano pode vir só "2026"
      }
      if (mes !== null && mes !== mesAtual) continue;
      if (ano !== null && ano !== anoAtual) continue;
    }

    const cargo = iCargo >= 0 ? (row[iCargo] || "").trim() : "";
    if (!nomes.some((n) => normName(n.nome) === normName(nome))) {
      nomes.push({ nome, cargo });
    }
  }

  return {
    nomes,
    aviso: temColunaMes ? null : "coluna mês não encontrada na planilha — roster sem recorte mensal",
  };
}

// ── PIPEDRIVE ───────────────────────────────────────────────────────
async function pipeFetch(url, opts = {}, tentativas = 3) {
  for (let t = 0; t < tentativas; t++) {
    try {
      const r = await fetch(url, opts);
      if (r.status < 500) return r;
    } catch (e) { /* retry */ }
    if (t < tentativas - 1) await new Promise((res) => setTimeout(res, 1500));
  }
  throw new Error("Pipedrive 5xx persistente: " + url.split("?")[0]);
}

// v2 activities — cursor pagination
async function fetchActivitiesV2(filterId) {
  const out = [];
  let cursor = null;
  while (true) {
    const p = new URLSearchParams({ filter_id: filterId, limit: "200" });
    if (cursor) p.set("cursor", cursor);
    const r = await pipeFetch(
      "https://api.pipedrive.com/api/v2/activities?" + p.toString(),
      { headers: { "x-api-token": PIPEDRIVE_TOKEN } }
    );
    if (!r.ok) throw new Error("Atividades filtro " + filterId + ": HTTP " + r.status);
    const data = await r.json();
    out.push(...(data.data || []));
    cursor = data.additional_data && data.additional_data.next_cursor;
    if (!cursor) break;
  }
  return out;
}

// v1 deals — start pagination
async function fetchDealsV1(filterId) {
  const out = [];
  let start = 0;
  while (true) {
    const p = new URLSearchParams({
      filter_id: filterId,
      api_token: PIPEDRIVE_TOKEN,
      status: "all_not_deleted",
      limit: "500",
      start: String(start),
    });
    const r = await pipeFetch("https://api.pipedrive.com/v1/deals?" + p.toString());
    if (!r.ok) throw new Error("Deals filtro " + filterId + ": HTTP " + r.status);
    const data = await r.json();
    out.push(...(data.data || []));
    const pag = data.additional_data && data.additional_data.pagination;
    if (!pag || !pag.more_items_in_collection) break;
    start += 500;
  }
  return out;
}

async function fetchUsers() {
  const r = await pipeFetch(
    "https://api.pipedrive.com/v1/users?api_token=" + PIPEDRIVE_TOKEN + "&limit=500"
  );
  if (!r.ok) throw new Error("Users: HTTP " + r.status);
  const data = await r.json();
  const map = {};
  for (const u of data.data || []) map[u.id] = u.name;
  return map;
}

// ── GITHUB (persistência das propostas) ─────────────────────────────
const GH_API = "https://api.github.com";

async function ghGetFile() {
  if (!GITHUB_TOKEN || !GITHUB_REPO) return { json: {}, sha: null, configurado: false };
  const r = await fetch(`${GH_API}/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`, {
    headers: {
      Authorization: "Bearer " + GITHUB_TOKEN,
      Accept: "application/vnd.github+json",
      "User-Agent": "orion-dashboard",
    },
  });
  if (r.status === 404) return { json: {}, sha: null, configurado: true };
  if (!r.ok) throw new Error("GitHub GET: HTTP " + r.status);
  const data = await r.json();
  const content = Buffer.from(data.content || "", "base64").toString("utf-8");
  let json = {};
  try { json = JSON.parse(content); } catch (e) { json = {}; }
  return { json, sha: data.sha, configurado: true };
}

async function ghPutFile(json, sha) {
  const body = {
    message: "propostas orion · " + new Date().toISOString(),
    content: Buffer.from(JSON.stringify(json, null, 2)).toString("base64"),
  };
  if (sha) body.sha = sha;
  const r = await fetch(`${GH_API}/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + GITHUB_TOKEN,
      Accept: "application/vnd.github+json",
      "User-Agent": "orion-dashboard",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error("GitHub PUT: HTTP " + r.status + " · " + txt.slice(0, 200));
  }
}

// ── ENDPOINT PRINCIPAL ──────────────────────────────────────────────
app.get("/api/dashboard", async (req, res) => {
  try {
    const dia = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || "")
      ? req.query.date
      : todayBrt();

    const [roster, users, ativGeral, ativRealizadas, dealsWon, gh] =
      await Promise.all([
        fetchRoster(),
        fetchUsers(),
        fetchActivitiesV2(FILTER_ATIV_GERAL),
        fetchActivitiesV2(FILTER_REU_REALIZADAS),
        fetchDealsV1(FILTER_DEALS_WON),
        ghGetFile().catch(() => ({ json: {}, sha: null, configurado: false })),
      ]);

    // Índice do roster por nome normalizado
    const rosterIdx = {};
    for (const p of roster.nomes) rosterIdx[normName(p.nome)] = p.nome;

    const zero = () => ({
      wpp: 0, call: 0, marcadas: 0, agendadas_hoje: 0,
      realizadas: 0, propostas: 0, fechamentos: 0, no_show: 0,
    });
    const acc = {};
    for (const p of roster.nomes) acc[p.nome] = zero();

    const naoMapeados = new Set(); // nomes do Pipedrive fora do roster (debug)
    const resolve = (ownerId) => {
      const nomePd = users[ownerId];
      if (!nomePd) return null;
      const nomeRoster = rosterIdx[normName(nomePd)];
      if (!nomeRoster) { naoMapeados.add(nomePd); return null; }
      return nomeRoster;
    };

    const isDone = (a) => a.done === true || a.status === "done";

    // ── Filtro 1670288: wpp / call / marcadas / agendadas ──
    for (const a of ativGeral) {
      const nome = resolve(a.owner_id || a.user_id);
      if (!nome) continue;
      const tipo = a.type;
      const addBrt = utcToBrtDateStr(a.add_time);
      const due = pureDate(a.due_date);

      if (tipo === "whatsapp" && isDone(a) && addBrt === dia) acc[nome].wpp++;
      if (tipo === "call" && isDone(a) && addBrt === dia) acc[nome].call++;
      if (tipo === "meeting") {
        if (addBrt === dia) acc[nome].marcadas++;          // status independe
        if (due === dia) acc[nome].agendadas_hoje++;       // status independe
      }
    }

    // ── Filtro 1670289: realizadas (done, eixo due_date) ──
    for (const a of ativRealizadas) {
      if (a.type !== "meeting" || !isDone(a)) continue;
      const nome = resolve(a.owner_id || a.user_id);
      if (!nome) continue;
      if (pureDate(a.due_date) === dia) acc[nome].realizadas++;
    }

    // ── Filtro 1670292: fechamentos (won, eixo won_time BRT) ──
    for (const d of dealsWon) {
      if (String(d.status).toLowerCase() !== "won") continue;
      const uid = d.user_id && typeof d.user_id === "object" ? d.user_id.id : d.user_id;
      const nome = resolve(uid);
      if (!nome) continue;
      if (utcToBrtDateStr(d.won_time) === dia) acc[nome].fechamentos++;
    }

    // ── Propostas (GitHub) + No-Show ──
    const propostasDia = (gh.json && gh.json[dia]) || {};
    for (const nome of Object.keys(acc)) {
      const key = Object.keys(propostasDia).find(
        (k) => normName(k) === normName(nome)
      );
      acc[nome].propostas = key ? Number(propostasDia[key]) || 0 : 0;
      acc[nome].no_show = acc[nome].agendadas_hoje - acc[nome].realizadas;
    }

    const linhas = roster.nomes.map((p) => ({
      nome: p.nome,
      cargo: p.cargo,
      ...acc[p.nome],
    }));
    // Ordena por volume total de atividades (desc), depois nome
    linhas.sort(
      (a, b) =>
        b.wpp + b.call + b.realizadas - (a.wpp + a.call + a.realizadas) ||
        a.nome.localeCompare(b.nome)
    );

    const totais = zero();
    for (const l of linhas)
      for (const k of Object.keys(totais)) totais[k] += l[k];

    res.json({
      dia,
      linhas,
      totais,
      roster_aviso: roster.aviso,
      nao_mapeados: [...naoMapeados].sort(),
      github_configurado: gh.configurado,
      atualizado_em: new Date(Date.now() - TZ_OFFSET_H * 3600 * 1000)
        .toISOString().slice(0, 19).replace("T", " "),
    });
  } catch (err) {
    res.status(500).json({ erro: String(err.message || err) });
  }
});

// ── PROPOSTAS: salvar ───────────────────────────────────────────────
app.post("/api/propostas", async (req, res) => {
  try {
    const { date, values } = req.body || {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || typeof values !== "object") {
      return res.status(400).json({ erro: "payload inválido: { date, values }" });
    }
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      return res.status(500).json({
        erro: "GITHUB_TOKEN / GITHUB_REPO não configurados no Vercel",
      });
    }
    const { json, sha } = await ghGetFile();
    json[date] = json[date] || {};
    for (const [nome, val] of Object.entries(values)) {
      const n = Number(val);
      json[date][nome] = isNaN(n) || n < 0 ? 0 : Math.floor(n);
    }
    await ghPutFile(json, sha);
    res.json({ ok: true, date, values: json[date] });
  } catch (err) {
    res.status(500).json({ erro: String(err.message || err) });
  }
});

app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    pipedrive: !!PIPEDRIVE_TOKEN,
    github: !!(GITHUB_TOKEN && GITHUB_REPO),
  })
);

module.exports = app;
