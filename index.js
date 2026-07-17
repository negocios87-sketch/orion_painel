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
const app = express();
app.use(express.json());

// ── FRONTEND EMBUTIDO (sem dependência de arquivos no bundle) ──────
const HTML = "<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Board Academy — Orion · Atividades</title>\n<link href=\"https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap\" rel=\"stylesheet\">\n<style>\n:root {\n  --bg:#0B1120; --surface:#111827; --surf2:#162032; --border:#1F2D45;\n  --gold:#C9A84C; --goldd:#6B5523; --text:#F1F5F9; --muted:#64748B;\n  --ok:#34D399; --warn:#FBBF24; --crit:#F87171;\n  --mono:'Space Mono',monospace; --sans:'DM Sans',sans-serif;\n}\n*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}\nbody{background:var(--bg);color:var(--text);font-family:var(--sans);min-height:100vh;display:flex;flex-direction:column}\n\n/* ── HEADER ── */\n.header{background:#080E1A;border-bottom:1px solid var(--border);padding:14px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}\n.brand-name{font-family:var(--mono);font-size:.95rem;font-weight:700;color:var(--gold);letter-spacing:4px;text-transform:uppercase}\n.brand-sub{font-size:.58rem;color:var(--muted);letter-spacing:2px;margin-top:3px}\n.controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.ctl-date{background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:7px;padding:7px 12px;font-family:var(--mono);font-size:.8rem;cursor:pointer;outline:none;color-scheme:dark}\n.btn{background:var(--surface);color:var(--gold);border:1px solid var(--border);border-radius:7px;padding:7px 16px;font-family:var(--sans);font-size:.75rem;font-weight:700;cursor:pointer;letter-spacing:1px;transition:all .15s}\n.btn:hover{border-color:var(--gold)}\n.btn.primary{background:var(--gold);color:#000;border-color:var(--gold)}\n.btn.primary:disabled{opacity:.35;cursor:default}\n.refresh-ts{font-family:var(--mono);font-size:.62rem;color:var(--muted)}\n.refresh-ts b{color:var(--gold);font-weight:400}\n\n/* ── KPIs ── */\n.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:10px;padding:16px 28px 0}\n.kpi{background:var(--surface);border:1px solid var(--border);border-radius:9px;padding:12px 14px;text-align:center}\n.kpi-lbl{font-size:.52rem;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;display:block;margin-bottom:5px}\n.kpi-val{font-family:var(--mono);font-size:1.45rem;font-weight:700;color:var(--gold)}\n.kpi.neg .kpi-val{color:var(--crit)}\n\n/* ── AVISOS ── */\n.aviso{margin:12px 28px 0;padding:9px 14px;border-radius:7px;font-size:.68rem;display:none}\n.aviso.on{display:block}\n.aviso.amarelo{background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.35);color:var(--warn)}\n.aviso.vermelho{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.35);color:var(--crit)}\n\n/* ── TABELA ── */\n.tbl-wrap{flex:1;overflow:auto;padding:16px 28px 28px}\ntable{width:100%;border-collapse:separate;border-spacing:0 3px}\nthead th{font-family:var(--mono);font-size:.54rem;font-weight:700;color:var(--goldd);letter-spacing:1.8px;text-transform:uppercase;padding:6px 10px 10px;text-align:right;white-space:nowrap;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg);z-index:5}\nthead th:first-child{text-align:left}\ntbody tr{background:var(--surface);animation:rowIn .25s ease both}\ntbody tr:hover{filter:brightness(1.15)}\ntbody td{padding:10px;font-family:var(--mono);font-size:.85rem;text-align:right;border-top:1px solid #0F1929;border-bottom:1px solid #0F1929;white-space:nowrap}\ntbody td:first-child{border-radius:6px 0 0 6px;text-align:left;font-family:var(--sans)}\ntbody td:last-child{border-radius:0 6px 6px 0}\n.nome{font-weight:700;font-size:.82rem}\n.cargo{display:block;font-size:.6rem;color:var(--muted);margin-top:1px}\n.v-zero{color:#334155}\n.v-gold{color:var(--gold);font-weight:700}\n.v-ok{color:var(--ok);font-weight:700}\n.v-neg{color:var(--crit);font-weight:700;background:rgba(248,113,113,.1);border-radius:4px;padding:2px 7px}\n.v-pos{color:var(--warn);font-weight:700}\n\n.inp-prop{width:64px;background:var(--surf2);color:var(--text);border:1px solid var(--border);border-radius:5px;padding:5px 8px;font-family:var(--mono);font-size:.82rem;text-align:right;outline:none;transition:border-color .15s}\n.inp-prop:focus{border-color:var(--gold)}\n.inp-prop.dirty{border-color:var(--warn);background:rgba(251,191,36,.07)}\n\ntfoot td{padding:11px 10px;font-family:var(--mono);font-size:.85rem;font-weight:700;text-align:right;color:var(--gold);border-top:2px solid var(--border);white-space:nowrap}\ntfoot td:first-child{text-align:left;font-family:var(--sans);letter-spacing:2px;text-transform:uppercase;font-size:.68rem}\n\n.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:70px 0;gap:10px;color:var(--muted)}\n.empty-txt{font-family:var(--mono);font-size:.7rem;letter-spacing:3px;text-transform:uppercase}\n\n.footer{background:#080E1A;border-top:1px solid var(--border);padding:9px 28px;display:flex;justify-content:space-between;font-size:.56rem;color:var(--muted);letter-spacing:1px;flex-wrap:wrap;gap:6px}\n\n@keyframes rowIn{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:translateY(0)}}\n@media(max-width:900px){.tbl-wrap{padding:12px 10px 20px}.header,.kpis{padding-left:12px;padding-right:12px}}\n</style>\n</head>\n<body>\n\n<header class=\"header\">\n  <div>\n    <div class=\"brand-name\">Board Academy · Orion</div>\n    <div class=\"brand-sub\">ATIVIDADES & ACOMPANHAMENTO DIÁRIO</div>\n  </div>\n  <div class=\"controls\">\n    <input type=\"date\" class=\"ctl-date\" id=\"ctl-date\">\n    <button class=\"btn\" id=\"btn-hoje\">Hoje</button>\n    <button class=\"btn primary\" id=\"btn-salvar\" disabled>Salvar Propostas</button>\n    <span class=\"refresh-ts\">Atualizado: <b id=\"r-ts\">—</b></span>\n  </div>\n</header>\n\n<div class=\"kpis\" id=\"kpis\"></div>\n\n<div class=\"aviso amarelo\" id=\"aviso-roster\"></div>\n<div class=\"aviso amarelo\" id=\"aviso-mapa\"></div>\n<div class=\"aviso vermelho\" id=\"aviso-erro\"></div>\n\n<div class=\"tbl-wrap\" id=\"tbl-wrap\">\n  <div class=\"empty\"><span class=\"empty-txt\">Carregando…</span></div>\n</div>\n\n<footer class=\"footer\">\n  <span>ORION · WPP/LIG/MARCADAS: add_time BRT · AGENDADAS/REALIZADAS: due_date · FECHAMENTOS: won_time BRT</span>\n  <span>NO-SHOW = Agendadas p/ o dia − Realizadas · negativo = due_date não atualizado (erro de processo)</span>\n  <span>Refresh automático a cada 2 min (pausa se houver edição pendente)</span>\n</footer>\n\n<script>\nconst REFRESH_S = 120;\nlet appData = null;\nlet dirty = {};      // {nome: valor} edições pendentes de propostas\nlet carregando = false;\n\nconst $ = (id) => document.getElementById(id);\n\nfunction hojeBrt() {\n  const d = new Date(Date.now() - 3 * 3600 * 1000);\n  return d.toISOString().slice(0, 10);\n}\n\n// ── FETCH ────────────────────────────────────────────────────────────\nasync function fetchDados() {\n  if (Object.keys(dirty).length > 0) return; // não sobrescreve edição pendente\n  if (carregando) return;\n  carregando = true;\n  try {\n    const dia = $(\"ctl-date\").value || hojeBrt();\n    const r = await fetch(\"/api/dashboard?date=\" + dia);\n    const data = await r.json();\n    if (!r.ok || data.erro) throw new Error(data.erro || \"HTTP \" + r.status);\n    appData = data;\n    $(\"aviso-erro\").classList.remove(\"on\");\n    render(data);\n  } catch (err) {\n    $(\"aviso-erro\").textContent = \"⚠ Erro ao carregar: \" + err.message;\n    $(\"aviso-erro\").classList.add(\"on\");\n  } finally {\n    carregando = false;\n  }\n}\n\n// ── RENDER ───────────────────────────────────────────────────────────\nconst COLS = [\n  { key: \"wpp\",            lbl: \"WhatsApp\" },\n  { key: \"call\",           lbl: \"Ligações\" },\n  { key: \"marcadas\",       lbl: \"Reun. Marcadas\" },\n  { key: \"agendadas_hoje\", lbl: \"Agend. p/ o Dia\" },\n  { key: \"realizadas\",     lbl: \"Realizadas\" },\n  { key: \"propostas\",      lbl: \"Propostas ✎\" },\n  { key: \"fechamentos\",    lbl: \"Fechamentos\" },\n  { key: \"no_show\",        lbl: \"No-Show\" },\n];\n\nfunction fmtVal(key, v) {\n  if (key === \"no_show\") {\n    if (v < 0) return `<span class=\"v-neg\" title=\"Negativo = reunião realizada sem due_date atualizado. Erro de processo.\">${v}</span>`;\n    if (v > 0) return `<span class=\"v-pos\">${v}</span>`;\n    return `<span class=\"v-zero\">0</span>`;\n  }\n  if (key === \"fechamentos\" && v > 0) return `<span class=\"v-ok\">${v}</span>`;\n  if (v === 0) return `<span class=\"v-zero\">0</span>`;\n  return `<span class=\"v-gold\">${v}</span>`;\n}\n\nfunction render(data) {\n  $(\"r-ts\").textContent = data.atualizado_em + \" BRT\";\n\n  // KPIs (totais do dia)\n  const t = data.totais;\n  $(\"kpis\").innerHTML = COLS.map((c) => `\n    <div class=\"kpi ${c.key === \"no_show\" && t[c.key] < 0 ? \"neg\" : \"\"}\">\n      <span class=\"kpi-lbl\">${c.lbl.replace(\" ✎\", \"\")}</span>\n      <span class=\"kpi-val\">${t[c.key]}</span>\n    </div>`).join(\"\");\n\n  // Avisos\n  const avR = $(\"aviso-roster\");\n  if (data.roster_aviso) {\n    avR.textContent = \"⚠ \" + data.roster_aviso;\n    avR.classList.add(\"on\");\n  } else avR.classList.remove(\"on\");\n\n  const avM = $(\"aviso-mapa\");\n  if (data.nao_mapeados && data.nao_mapeados.length) {\n    avM.textContent =\n      \"⚠ Atividades/deals de pessoas fora do roster Orion (ignoradas): \" +\n      data.nao_mapeados.join(\", \");\n    avM.classList.add(\"on\");\n  } else avM.classList.remove(\"on\");\n\n  if (!data.github_configurado) {\n    $(\"aviso-erro\").textContent =\n      \"⚠ GITHUB_TOKEN / GITHUB_REPO não configurados — propostas não vão persistir.\";\n    $(\"aviso-erro\").classList.add(\"on\");\n  }\n\n  // Tabela\n  if (!data.linhas.length) {\n    $(\"tbl-wrap\").innerHTML =\n      '<div class=\"empty\"><span class=\"empty-txt\">Nenhum colaborador Orion no roster do mês</span></div>';\n    return;\n  }\n\n  const thead = `<thead><tr><th>Closer / Vendedor</th>${COLS.map(\n    (c) => `<th>${c.lbl}</th>`).join(\"\")}</tr></thead>`;\n\n  const rows = data.linhas.map((l, i) => {\n    const tds = COLS.map((c) => {\n      if (c.key === \"propostas\") {\n        return `<td><input type=\"number\" min=\"0\" step=\"1\" class=\"inp-prop\"\n          data-nome=\"${l.nome.replace(/\"/g, \"&quot;\")}\" value=\"${l.propostas}\"></td>`;\n      }\n      return `<td>${fmtVal(c.key, l[c.key])}</td>`;\n    }).join(\"\");\n    return `<tr style=\"animation-delay:${i * 20}ms\">\n      <td><span class=\"nome\">${l.nome}</span>${l.cargo ? `<span class=\"cargo\">${l.cargo}</span>` : \"\"}</td>\n      ${tds}</tr>`;\n  }).join(\"\");\n\n  const tfoot = `<tfoot><tr><td>Total Orion</td>${COLS.map(\n    (c) => `<td>${data.totais[c.key]}</td>`).join(\"\")}</tr></tfoot>`;\n\n  $(\"tbl-wrap\").innerHTML = `<table>${thead}<tbody>${rows}</tbody>${tfoot}</table>`;\n\n  // Listeners de edição\n  document.querySelectorAll(\".inp-prop\").forEach((inp) => {\n    inp.addEventListener(\"input\", () => {\n      dirty[inp.dataset.nome] = inp.value;\n      inp.classList.add(\"dirty\");\n      $(\"btn-salvar\").disabled = false;\n    });\n  });\n  dirty = {};\n  $(\"btn-salvar\").disabled = true;\n}\n\n// ── SALVAR PROPOSTAS ────────────────────────────────────────────────\n$(\"btn-salvar\").addEventListener(\"click\", async () => {\n  const btn = $(\"btn-salvar\");\n  btn.disabled = true;\n  btn.textContent = \"Salvando…\";\n  try {\n    const r = await fetch(\"/api/propostas\", {\n      method: \"POST\",\n      headers: { \"Content-Type\": \"application/json\" },\n      body: JSON.stringify({ date: $(\"ctl-date\").value || hojeBrt(), values: dirty }),\n    });\n    const data = await r.json();\n    if (!r.ok || data.erro) throw new Error(data.erro || \"HTTP \" + r.status);\n    dirty = {};\n    btn.textContent = \"✓ Salvo\";\n    setTimeout(() => { btn.textContent = \"Salvar Propostas\"; }, 1600);\n    fetchDados();\n  } catch (err) {\n    btn.disabled = false;\n    btn.textContent = \"Salvar Propostas\";\n    $(\"aviso-erro\").textContent = \"⚠ Erro ao salvar propostas: \" + err.message;\n    $(\"aviso-erro\").classList.add(\"on\");\n  }\n});\n\n// ── CONTROLES ───────────────────────────────────────────────────────\n$(\"ctl-date\").value = hojeBrt();\n$(\"ctl-date\").addEventListener(\"change\", () => { dirty = {}; fetchDados(); });\n$(\"btn-hoje\").addEventListener(\"click\", () => {\n  $(\"ctl-date\").value = hojeBrt();\n  dirty = {};\n  fetchDados();\n});\n\nfetchDados();\nsetInterval(fetchDados, REFRESH_S * 1000);\n</script>\n</body>\n</html>\n";
app.get("/", (req, res) => res.type("html").send(HTML));

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
  const r = await fetch(URL_COLAB, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
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
    if (!normName(row[iTime]).includes(TIME_ALVO)) continue;

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
const FETCH_TIMEOUT_MS = 45000; // nenhum fetch pode pendurar > 45s (filtros pesados demoram)
const MAX_PAGINAS      = 60;    // trava de segurança contra paginação infinita

async function pipeFetch(url, opts = {}, tentativas = 3) {
  for (let t = 0; t < tentativas; t++) {
    try {
      const r = await fetch(url, {
        ...opts,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (r.status < 500) return r;
    } catch (e) { /* timeout ou rede — retry */ }
    if (t < tentativas - 1) await new Promise((res) => setTimeout(res, 1500));
  }
  throw new Error("Pipedrive sem resposta (timeout/5xx): " + url.split("?")[0]);
}

// v2 activities — cursor pagination (com trava de segurança)
async function fetchActivitiesV2(filterId) {
  const out = [];
  let cursor = null, paginas = 0;
  while (true) {
    paginas++;
    if (paginas > MAX_PAGINAS) {
      throw new Error(
        `Filtro ${filterId} estourou ${MAX_PAGINAS} páginas (${out.length}+ atividades). ` +
        `Ou o filtro está gigante, ou a API ignorou o filter_id. Verificar filtro no Pipedrive.`
      );
    }
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
  out._paginas = paginas;
  return out;
}

// v1 deals — start pagination (com trava de segurança)
async function fetchDealsV1(filterId) {
  const out = [];
  let start = 0, paginas = 0;
  while (true) {
    paginas++;
    if (paginas > MAX_PAGINAS) {
      throw new Error(
        `Filtro de deals ${filterId} estourou ${MAX_PAGINAS} páginas (${out.length}+ deals). Verificar filtro.`
      );
    }
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
  out._paginas = paginas;
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
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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

// ── DEBUG DO ROSTER: raio-X da planilha ─────────────────────────────
app.get("/api/roster_debug", async (req, res) => {
  try {
    const r = await fetch(URL_COLAB, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    const rows = parseCsv(await r.text());
    const header = rows[0] || [];
    const headerNorm = header.map(normName);
    const idx = (names, fallback) => {
      for (const n of names) {
        const i = headerNorm.findIndex((h) => h === n || h.includes(n));
        if (i >= 0) return i;
      }
      return fallback;
    };
    const iNome = idx(["nome"], 0);
    const iTime = idx(["time", "equipe", "squad"], 2);
    const iMes  = idx(["mes"], -1);
    const iAno  = idx(["ano"], -1);

    // Valores distintos da coluna time + amostra de linhas
    const timesDistintos = {};
    for (let li = 1; li < rows.length; li++) {
      const t = normName((rows[li] || [])[iTime]);
      if (t) timesDistintos[t] = (timesDistintos[t] || 0) + 1;
    }
    const amostraMes = [];
    if (iMes >= 0) {
      for (let li = 1; li < Math.min(rows.length, 12); li++) {
        amostraMes.push((rows[li] || [])[iMes]);
      }
    }

    const roster = await fetchRoster();

    res.json({
      total_linhas: rows.length - 1,
      cabecalho: header,
      colunas_detectadas: { nome: iNome, time: iTime, mes: iMes, ano: iAno },
      valores_distintos_coluna_time: timesDistintos,
      amostra_coluna_mes: amostraMes,
      primeiras_3_linhas: rows.slice(1, 4),
      roster_final: roster.nomes,
      roster_aviso: roster.aviso,
    });
  } catch (err) {
    res.status(500).json({ erro: String(err.message || err) });
  }
});

// ── DEBUG: cronometra cada fonte isoladamente ───────────────────────
app.get("/api/debug", async (req, res) => {
  const resultado = {};
  async function medir(nome, fn) {
    const t0 = Date.now();
    try {
      const data = await fn();
      resultado[nome] = {
        ok: true,
        ms: Date.now() - t0,
        itens: Array.isArray(data) ? data.length
             : data && data.nomes ? data.nomes.length
             : data ? Object.keys(data).length : 0,
        paginas: (data && data._paginas) || undefined,
      };
    } catch (e) {
      resultado[nome] = { ok: false, ms: Date.now() - t0, erro: String(e.message || e) };
    }
  }
  await medir("roster_planilha", fetchRoster);
  await medir("users", fetchUsers);
  await medir("ativ_geral_1670288", () => fetchActivitiesV2(FILTER_ATIV_GERAL));
  await medir("ativ_realizadas_1670289", () => fetchActivitiesV2(FILTER_REU_REALIZADAS));
  await medir("deals_won_1670292", () => fetchDealsV1(FILTER_DEALS_WON));
  await medir("github_propostas", ghGetFile);
  res.json(resultado);
});

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

// ── EXECUÇÃO DIRETA (local ou runtime que usa PORT) ─────────────────
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log("Painel Orion rodando em http://localhost:" + port)
  );
}
