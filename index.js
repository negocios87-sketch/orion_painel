// ═══════════════════════════════════════════════════════════════════
// Board Academy — Painel Orion · Atividades & Taxa de Conexão (V1)
// >>> VERSAO: 2026-07-20-ABAS <<<  (roster lê coluna Subarea)
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
const HTML = "<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Board Academy — Orion · Atividades</title>\n<link href=\"https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap\" rel=\"stylesheet\">\n<style>\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n:root{\n  --paper:#FFFFFF;\n  --panel:#FAFBFC;\n  --ink:#10151C;\n  --ink-2:#3D4854;\n  --muted:#7A8694;\n  --rule:#D7DDE3;\n  --rule-strong:#10151C;\n  --navy:#14335C;\n  --red:#B3261E;\n  --green:#1B6E3C;\n  --accent:#C9A227;\n  --mono:'IBM Plex Mono',monospace;\n  --sans:'IBM Plex Sans',sans-serif;\n}\nhtml{font-size:14px}\nbody{font-family:var(--sans);background:var(--paper);color:var(--ink);min-height:100vh;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased}\n\n.dochead{border-bottom:3px solid var(--rule-strong);background:var(--paper)}\n.dochead-in{max-width:1300px;margin:0 auto;padding:18px 28px 14px;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap}\n.dh-org{font-family:var(--mono);font-size:.66rem;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}\n.dh-title{font-size:1.5rem;font-weight:700;letter-spacing:-.01em;line-height:1.1}\n.dh-title span{color:var(--muted);font-weight:300}\n.dh-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.dh-stamp{font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;border:1.5px solid var(--ink);padding:3px 10px;color:var(--ink)}\n.ctl-date{background:var(--paper);color:var(--ink);border:1px solid var(--ink);border-radius:0;padding:6px 10px;font-family:var(--mono);font-size:.72rem;cursor:pointer;outline:none}\n.tbtn{background:var(--paper);border:1px solid var(--ink);color:var(--ink);font-family:var(--mono);font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;padding:7px 16px;cursor:pointer;transition:all .12s}\n.tbtn:hover{background:var(--ink);color:var(--paper)}\n.tbtn:disabled{opacity:.4;cursor:default}\n.tbtn.primary{background:var(--ink);color:var(--paper)}\n.tbtn.primary:disabled{opacity:.3}\n\n.page{max-width:1300px;margin:0 auto;padding:26px 28px 40px;width:100%;flex:1}\n\n.sec{margin-bottom:14px}\n.sec-body{border-top:1px solid var(--rule);padding-top:8px;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}\n.sec-title{font-size:1.15rem;font-weight:600;letter-spacing:-.01em}\n.sec-note{font-family:var(--mono);font-size:.64rem;color:var(--muted);letter-spacing:.04em;text-transform:uppercase}\n\n.twrap{border:1px solid var(--rule)}\ntable{width:100%;border-collapse:collapse;font-size:.82rem;table-layout:fixed}\nthead th{font-family:var(--mono);font-size:.54rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--ink);padding:10px 6px;text-align:right;border-bottom:2px solid var(--rule-strong);white-space:normal;word-wrap:break-word;line-height:1.3;vertical-align:bottom;background:var(--paper)}\nthead th:first-child{text-align:left;width:220px;padding-left:14px}\ntbody tr{border-bottom:1px solid var(--rule)}\ntbody tr:nth-child(even){background:var(--panel)}\ntbody tr:hover{background:#F1F4F7}\ntbody td{padding:9px 6px;text-align:right;font-variant-numeric:tabular-nums;font-family:var(--mono);font-size:.82rem}\ntbody td:first-child{text-align:left;padding-left:14px;font-family:var(--sans)}\ntd.zero{color:#C3CBD3}\ntd.tot{font-weight:700}\ntd.val-ok{color:var(--green);font-weight:600}\ntd.val-noshow{color:var(--red);font-weight:600}\ntfoot td{padding:11px 6px;text-align:right;font-weight:700;font-variant-numeric:tabular-nums;border-top:2px solid var(--rule-strong);background:var(--paper);font-family:var(--mono);font-size:.82rem}\ntfoot td:first-child{text-align:left;padding-left:14px;font-family:var(--mono);font-weight:600;font-size:.6rem;letter-spacing:.08em;text-transform:uppercase}\n\n.nome{font-weight:600;font-size:.84rem;line-height:1.2;color:var(--ink)}\n.cargo{display:block;font-family:var(--mono);font-size:.58rem;color:var(--muted);margin-top:2px}\n\n.inp-prop{width:62px;background:var(--paper);color:var(--ink);border:1px solid var(--rule);border-radius:0;padding:5px 8px;font-family:var(--mono);font-size:.8rem;text-align:right;outline:none;transition:border-color .12s}\n.inp-prop:focus{border-color:var(--ink)}\n.inp-prop.dirty{border-color:var(--accent);background:#FBF8EC}\n\n.state-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:340px;gap:14px;color:var(--muted)}\n.spinner{width:24px;height:24px;border:2px solid var(--rule);border-top-color:var(--ink);border-radius:50%;animation:spin .7s linear infinite}\n@keyframes spin{to{transform:rotate(360deg)}}\n.errbanner{background:#FDF3F2;border:1px solid #E8B4B0;color:var(--red);padding:12px 16px;font-size:.78rem;margin-bottom:20px;display:none;white-space:pre-wrap;font-family:var(--mono)}\n.errbanner.on{display:block}\n\n.pfooter{margin-top:auto;padding:14px 28px;border-top:2px solid var(--rule-strong);display:flex;justify-content:space-between;gap:12px;font-family:var(--mono);font-size:.62rem;color:var(--muted);letter-spacing:.04em;flex-wrap:wrap;max-width:1300px;margin-left:auto;margin-right:auto;width:100%}\n.gh-warn{color:var(--red)}\n.gh-warn.hidden{display:none}\n\n@media(max-width:900px){.dochead-in,.page{padding-left:12px;padding-right:12px}thead th:first-child{width:150px}}\n@media print{@page{size:A4 landscape;margin:10mm}.tbtn,.ctl-date{display:none}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}\n</style>\n</head>\n<body>\n\n<div class=\"dochead\">\n  <div class=\"dochead-in\">\n    <div>\n      <div class=\"dh-org\">Board Academy · Inteligência Comercial</div>\n      <div class=\"dh-title\">Atividades <span>· Equipe Orion</span></div>\n    </div>\n    <div class=\"dh-right\">\n      <div class=\"dh-stamp\">Uso Interno</div>\n      <input type=\"date\" class=\"ctl-date\" id=\"ctl-date\">\n      <button class=\"tbtn\" id=\"btn-hoje\">Hoje</button>\n      <button class=\"tbtn\" id=\"btn-refresh\">Atualizar</button>\n      <button class=\"tbtn primary\" id=\"btn-salvar\" disabled>Salvar Propostas</button>\n    </div>\n  </div>\n</div>\n\n<div class=\"tabbar\">\n      <button class=\"tab active\" data-tab=\"qualidade\">Qualidade & Conversão</button>\n      <button class=\"tab\" data-tab=\"velocidade\">Velocidade e SLA</button>\n      <button class=\"tab\" data-tab=\"sla-real\">SLA Real</button>\n      <button class=\"tab\" data-tab=\"remoto\">Comportamento Remoto</button>\n      <button class=\"tab\" data-tab=\"jornada\">Jornada e Impacto</button>\n      <button class=\"tab\" data-tab=\"resultado\">Resultado</button>\n      <button class=\"tab\" data-tab=\"mensal\">Visão Mensal</button>\n</div>\n\n<div class=\"page\">\n  <div class=\"errbanner\" id=\"err-banner\"></div>\n\n  <div class=\"tabpane active\" id=\"pane-qualidade\">\n    <div class=\"sec\">\n      <div class=\"sec-body\">\n        <span class=\"sec-title\">Acompanhamento Diário — Atividades por Closer</span>\n        <span class=\"sec-note\" id=\"sec-meta\">—</span>\n      </div>\n    </div>\n\n    <div id=\"content\">\n      <div class=\"state-wrap\"><div class=\"spinner\"></div><span>Consultando PipeDrive…</span></div>\n    </div>\n\n    <div id=\"conv-content\"></div>\n  </div>\n\n  <div class=\"tabpane\" id=\"pane-velocidade\"><div class=\"construcao\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7A8694\" stroke-width=\"1.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"4.5\" r=\"2\"/><path d=\"M9 9l3-1 3 1\"/><path d=\"M12 8v6\"/><path d=\"M12 14l-3 5\"/><path d=\"M12 14l3 5\"/><path d=\"M6 11l3-2\"/><path d=\"M18 11l-3-2\"/><path d=\"M4 21h16\"/><path d=\"M14.5 6.5l5 3-1 1.7-5-3z\" fill=\"#C9A227\" stroke=\"#C9A227\"/></svg><div class=\"construcao-t\">Em Construção</div><div class=\"construcao-s\">Velocidade e SLA</div></div></div>\n  <div class=\"tabpane\" id=\"pane-sla-real\"><div class=\"construcao\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7A8694\" stroke-width=\"1.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"4.5\" r=\"2\"/><path d=\"M9 9l3-1 3 1\"/><path d=\"M12 8v6\"/><path d=\"M12 14l-3 5\"/><path d=\"M12 14l3 5\"/><path d=\"M6 11l3-2\"/><path d=\"M18 11l-3-2\"/><path d=\"M4 21h16\"/><path d=\"M14.5 6.5l5 3-1 1.7-5-3z\" fill=\"#C9A227\" stroke=\"#C9A227\"/></svg><div class=\"construcao-t\">Em Construção</div><div class=\"construcao-s\">SLA Real</div></div></div>\n  <div class=\"tabpane\" id=\"pane-remoto\"><div class=\"construcao\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7A8694\" stroke-width=\"1.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"4.5\" r=\"2\"/><path d=\"M9 9l3-1 3 1\"/><path d=\"M12 8v6\"/><path d=\"M12 14l-3 5\"/><path d=\"M12 14l3 5\"/><path d=\"M6 11l3-2\"/><path d=\"M18 11l-3-2\"/><path d=\"M4 21h16\"/><path d=\"M14.5 6.5l5 3-1 1.7-5-3z\" fill=\"#C9A227\" stroke=\"#C9A227\"/></svg><div class=\"construcao-t\">Em Construção</div><div class=\"construcao-s\">Comportamento Remoto</div></div></div>\n  <div class=\"tabpane\" id=\"pane-jornada\"><div class=\"construcao\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7A8694\" stroke-width=\"1.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"4.5\" r=\"2\"/><path d=\"M9 9l3-1 3 1\"/><path d=\"M12 8v6\"/><path d=\"M12 14l-3 5\"/><path d=\"M12 14l3 5\"/><path d=\"M6 11l3-2\"/><path d=\"M18 11l-3-2\"/><path d=\"M4 21h16\"/><path d=\"M14.5 6.5l5 3-1 1.7-5-3z\" fill=\"#C9A227\" stroke=\"#C9A227\"/></svg><div class=\"construcao-t\">Em Construção</div><div class=\"construcao-s\">Jornada e Impacto</div></div></div>\n  <div class=\"tabpane\" id=\"pane-resultado\"><div class=\"construcao\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7A8694\" stroke-width=\"1.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"4.5\" r=\"2\"/><path d=\"M9 9l3-1 3 1\"/><path d=\"M12 8v6\"/><path d=\"M12 14l-3 5\"/><path d=\"M12 14l3 5\"/><path d=\"M6 11l3-2\"/><path d=\"M18 11l-3-2\"/><path d=\"M4 21h16\"/><path d=\"M14.5 6.5l5 3-1 1.7-5-3z\" fill=\"#C9A227\" stroke=\"#C9A227\"/></svg><div class=\"construcao-t\">Em Construção</div><div class=\"construcao-s\">Resultado</div></div></div>\n  <div class=\"tabpane\" id=\"pane-mensal\"><div class=\"construcao\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7A8694\" stroke-width=\"1.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"4.5\" r=\"2\"/><path d=\"M9 9l3-1 3 1\"/><path d=\"M12 8v6\"/><path d=\"M12 14l-3 5\"/><path d=\"M12 14l3 5\"/><path d=\"M6 11l3-2\"/><path d=\"M18 11l-3-2\"/><path d=\"M4 21h16\"/><path d=\"M14.5 6.5l5 3-1 1.7-5-3z\" fill=\"#C9A227\" stroke=\"#C9A227\"/></svg><div class=\"construcao-t\">Em Construção</div><div class=\"construcao-s\">Visão Mensal</div></div></div>\n</div>\n\n<footer class=\"pfooter\">\n  <span>Board Academy · Atividades Orion · Documento de trabalho</span>\n  <span class=\"gh-warn hidden\" id=\"gh-warn\">Propostas nao persistem (GITHUB_TOKEN/GITHUB_REPO ausentes)</span>\n  <span id=\"foot-src\">Fonte: PipeDrive</span>\n</footer>\n\n<script>\nlet appData=null;\nlet dirty={};\nlet carregando=false;\nconst $=(id)=>document.getElementById(id);\n\nfunction hojeBrt(){const d=new Date(Date.now()-3*3600*1000);return d.toISOString().slice(0,10);}\n\nconst COLS=[\n  {key:\"wpp\",         lbl:\"WhatsApp\"},\n  {key:\"call\",        lbl:\"Ligacoes\"},\n  {key:\"marcadas\",    lbl:\"Reun. Marcadas\"},\n  {key:\"realizadas\",  lbl:\"Reun. Realizadas\"},\n  {key:\"propostas\",   lbl:\"Propostas\"},\n  {key:\"fechamentos\", lbl:\"Fechamentos\"},\n  {key:\"no_show\",     lbl:\"No-Show\"},\n];\n\nfunction fmtCell(key,v){\n  if(key===\"no_show\"){\n    if(v>0)return `<td class=\"val-noshow\" title=\"Reuniao com due_date hoje nao concluida\">${v}</td>`;\n    return `<td class=\"zero\">—</td>`;\n  }\n  if(key===\"fechamentos\"&&v>0)return `<td class=\"val-ok\">${v}</td>`;\n  if(v===0)return `<td class=\"zero\">—</td>`;\n  return `<td>${v}</td>`;\n}\n\nasync function fetchDados(){\n  if(carregando)return;\n  carregando=true;\n  try{\n    const dia=$(\"ctl-date\").value||hojeBrt();\n    const r=await fetch(\"/api/dashboard?date=\"+dia);\n    const data=await r.json();\n    if(!r.ok||data.erro)throw new Error(data.erro||\"HTTP \"+r.status);\n    appData=data;\n    $(\"err-banner\").classList.remove(\"on\");\n    render(data);\n  }catch(err){\n    $(\"err-banner\").textContent=\"Erro ao carregar: \"+err.message;\n    $(\"err-banner\").classList.add(\"on\");\n    $(\"content\").innerHTML='<div class=\"state-wrap\"><span>Nao foi possivel carregar os dados.</span></div>';\n  }finally{\n    carregando=false;\n  }\n}\n\nfunction render(data){\n  $(\"sec-meta\").textContent=\"Ref \"+data.dia+\" · atualizado \"+data.atualizado_em+\" BRT\";\n  $(\"foot-src\").textContent=\"Fonte: PipeDrive · \"+data.atualizado_em;\n  $(\"gh-warn\").classList.toggle(\"hidden\",!!data.github_configurado);\n\n  if(!data.linhas.length){\n    $(\"content\").innerHTML='<div class=\"state-wrap\"><span>Nenhum colaborador Orion no roster do mes.</span></div>';\n    $(\"conv-content\").innerHTML=\"\";\n    return;\n  }\n\n  const thead=`<thead><tr><th>Closer / Vendedor</th>${COLS.map(c=>`<th>${c.lbl}</th>`).join(\"\")}<th>Total Ativ.</th></tr></thead>`;\n\n  const rows=data.linhas.map(l=>{\n    const totalAtiv=l.wpp+l.call+l.realizadas;\n    const tds=COLS.map(c=>{\n      if(c.key===\"propostas\"){\n        return `<td><input type=\"number\" min=\"0\" step=\"1\" class=\"inp-prop\" data-nome=\"${l.nome.replace(/\"/g,\"&quot;\")}\" value=\"${l.propostas}\"></td>`;\n      }\n      return fmtCell(c.key,l[c.key]);\n    }).join(\"\");\n    return `<tr>\n      <td><span class=\"nome\">${l.nome}</span>${l.cargo?`<span class=\"cargo\">${l.cargo}</span>`:\"\"}</td>\n      ${tds}\n      <td class=\"tot\">${totalAtiv}</td>\n    </tr>`;\n  }).join(\"\");\n\n  const t=data.totais;\n  const totalGeral=t.wpp+t.call+t.realizadas;\n  const tfoot=`<tfoot><tr><td>Total Orion</td>${COLS.map(c=>`<td>${t[c.key]}</td>`).join(\"\")}<td>${totalGeral}</td></tr></tfoot>`;\n\n  $(\"content\").innerHTML=`<div class=\"twrap\"><table>${thead}<tbody>${rows}</tbody>${tfoot}</table></div>`;\n\n  // ── Taxas de conversão por etapa ──\n  const convEtapas=[\n    {key:\"marcacao\",      lbl:\"Marcação\"},\n    {key:\"comparecimento\",lbl:\"Comparecimento\"},\n    {key:\"proposta\",      lbl:\"Proposta\"},\n    {key:\"fechamento\",    lbl:\"Fechamento\"},\n  ];\n  const convHead=`<thead><tr><th>Closer / Vendedor</th>${convEtapas.map(e=>`<th>${e.lbl}</th>`).join(\"\")}</tr></thead>`;\n  const convBody=data.linhas.map(l=>{\n    const tds=convEtapas.map(e=>{\n      const v=l.taxas[e.key];\n      const txt=v.toFixed(2).replace(\".\",\",\")+\"%\";\n      return v===0?`<td class=\"zero\">${txt}</td>`:`<td>${txt}</td>`;\n    }).join(\"\");\n    return `<tr><td><span class=\"nome\">${l.nome}</span>${l.cargo?`<span class=\"cargo\">${l.cargo}</span>`:\"\"}</td>${tds}</tr>`;\n  }).join(\"\");\n  $(\"conv-content\").innerHTML=`\n    <div class=\"conv-sec\">\n      <div class=\"sec\"><div class=\"sec-body\">\n        <span class=\"sec-title\">Taxas de Conversão por Etapa</span>\n        <span class=\"sec-note\">Divisor zero = 0%</span>\n      </div></div>\n      <div class=\"conv-intro\">Marcação = Reun. Marcadas ÷ (Ligações + WhatsApp) · Comparecimento = Realizadas ÷ Marcadas · Proposta = Propostas ÷ Realizadas · Fechamento = Fechamentos ÷ Propostas</div>\n      <div class=\"twrap\"><table>${convHead}<tbody>${convBody}</tbody></table></div>\n    </div>`;\n\n  document.querySelectorAll(\".inp-prop\").forEach(inp=>{\n    inp.addEventListener(\"input\",()=>{\n      dirty[inp.dataset.nome]=inp.value;\n      inp.classList.add(\"dirty\");\n      $(\"btn-salvar\").disabled=false;\n    });\n  });\n  dirty={};\n  $(\"btn-salvar\").disabled=true;\n}\n\n$(\"btn-salvar\").addEventListener(\"click\",async()=>{\n  const btn=$(\"btn-salvar\");\n  btn.disabled=true;btn.textContent=\"Salvando…\";\n  try{\n    const r=await fetch(\"/api/propostas\",{\n      method:\"POST\",headers:{\"Content-Type\":\"application/json\"},\n      body:JSON.stringify({date:$(\"ctl-date\").value||hojeBrt(),values:dirty}),\n    });\n    const data=await r.json();\n    if(!r.ok||data.erro)throw new Error(data.erro||\"HTTP \"+r.status);\n    dirty={};\n    btn.textContent=\"✓ Salvo\";\n    setTimeout(()=>{btn.textContent=\"Salvar Propostas\";},1600);\n    fetchDados();\n  }catch(err){\n    btn.disabled=false;btn.textContent=\"Salvar Propostas\";\n    $(\"err-banner\").textContent=\"Erro ao salvar propostas: \"+err.message;\n    $(\"err-banner\").classList.add(\"on\");\n  }\n});\n\n$(\"ctl-date\").value=hojeBrt();\n$(\"ctl-date\").addEventListener(\"change\",()=>{dirty={};fetchDados();});\n$(\"btn-hoje\").addEventListener(\"click\",()=>{$(\"ctl-date\").value=hojeBrt();dirty={};fetchDados();});\n$(\"btn-refresh\").addEventListener(\"click\",()=>{\n  const btn=$(\"btn-refresh\");\n  btn.disabled=true;btn.textContent=\"Atualizando…\";\n  fetchDados().finally(()=>{btn.textContent=\"Atualizar\";btn.disabled=false;});\n});\n\n// ── Navegação por abas ──\ndocument.querySelectorAll(\".tab\").forEach(btn=>{\n  btn.addEventListener(\"click\",()=>{\n    document.querySelectorAll(\".tab\").forEach(b=>b.classList.remove(\"active\"));\n    document.querySelectorAll(\".tabpane\").forEach(p=>p.classList.remove(\"active\"));\n    btn.classList.add(\"active\");\n    document.getElementById(\"pane-\"+btn.dataset.tab).classList.add(\"active\");\n  });\n});\n\nfetchDados();\n</script>\n</body>\n</html>\n";
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

  // Detecta colunas pelo header.
  // IMPORTANTE: o squad mora em "Subarea" — "Equipe (Nivel Head)" é o nome da head, não usar.
  const header = rows[0].map(normName);
  const idx = (names, fallback) => {
    for (const n of names) {
      const i = header.findIndex((h) => h === n || h.includes(n));
      if (i >= 0) return i;
    }
    return fallback;
  };
  const iNome   = idx(["nome"], 0);
  const iTime   = idx(["subarea", "sub area", "squad"], 2);
  const iMes    = idx(["mes"], -1);
  const iAno    = idx(["ano"], -1);
  const iCargo  = idx(["cargo", "funcao"], 3);
  const iStatus = idx(["status"], -1);

  const hoje = new Date(Date.now() - TZ_OFFSET_H * 3600 * 1000);
  const mesAtual = hoje.getUTCMonth() + 1;
  const anoAtual = hoje.getUTCFullYear();

  // 1ª passada: coleta TODAS as linhas do squad alvo (ativas), com mês/ano parseado
  const candidatos = [];
  for (let li = 1; li < rows.length; li++) {
    const row = rows[li];
    if (!row || row.length <= Math.max(iNome, iTime)) continue;
    const nome = (row[iNome] || "").trim();
    if (!nome || normName(nome) === "nome") continue;
    if (!normName(row[iTime]).includes(TIME_ALVO)) continue;
    if (iStatus >= 0 && !normName(row[iStatus]).includes("ativo")) continue;

    let mes = null, ano = null;
    if (iMes >= 0) {
      const pm = parseMesAno(row[iMes]);
      mes = pm.mes;
      ano = pm.ano;
    }
    if (ano === null && iAno >= 0) {
      const pa = parseMesAno(row[iAno]);
      ano = pa.ano !== null ? pa.ano : pa.mes;
    }
    const cargo = iCargo >= 0 ? (row[iCargo] || "").trim() : "";
    candidatos.push({ nome, cargo, mes, ano });
  }

  if (!candidatos.length) {
    return { nomes: [], aviso: `nenhuma linha com subarea "${TIME_ALVO}" (ativa) na planilha` };
  }

  // 2ª passada: tenta mês/ano atual; se vazio, cai pro mês mais recente disponível
  const doPeriodo = (m, a) =>
    candidatos.filter(
      (c) => (c.mes === null || c.mes === m) && (c.ano === null || c.ano === a)
    );

  let selecionados = doPeriodo(mesAtual, anoAtual);
  let aviso = null;

  if (!selecionados.length) {
    // mês mais recente entre os candidatos (ano*100+mes)
    const comPeriodo = candidatos.filter((c) => c.mes !== null && c.ano !== null);
    if (comPeriodo.length) {
      const melhor = comPeriodo.reduce((acc, c) =>
        c.ano * 100 + c.mes > acc.ano * 100 + acc.mes ? c : acc
      );
      selecionados = doPeriodo(melhor.mes, melhor.ano);
      aviso = `planilha sem linhas de ${String(mesAtual).padStart(2, "0")}/${anoAtual} — usando roster de ${String(melhor.mes).padStart(2, "0")}/${melhor.ano}`;
    } else {
      selecionados = candidatos;
      aviso = "coluna mês/ano não parseável — roster sem recorte mensal";
    }
  }

  // Dedup por nome
  const nomes = [];
  for (const c of selecionados) {
    if (!nomes.some((n) => normName(n.nome) === normName(c.nome))) {
      nomes.push({ nome: c.nome, cargo: c.cargo });
    }
  }

  return { nomes, aviso };
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
    const p = new URLSearchParams({ filter_id: filterId, limit: "500" });
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
    const iTime = idx(["subarea", "sub area", "squad"], 2);
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
      wpp: 0, call: 0, marcadas: 0,
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

    // ── Filtro 1670288 (ativGeral): wpp / call / realizadas / no-show ──
    //    Eixo: due_date = hoje para todas.
    for (const a of ativGeral) {
      const nome = resolve(a.owner_id || a.user_id);
      if (!nome) continue;
      const tipo = a.type;
      const due = pureDate(a.due_date);
      if (due !== dia) continue;

      if (tipo === "whatsapp_chat" && isDone(a)) acc[nome].wpp++;
      if (tipo === "call" && isDone(a)) acc[nome].call++;
      if (tipo === "meeting") {
        if (isDone(a)) acc[nome].realizadas++;   // realizada = meeting done
        else acc[nome].no_show++;                // no-show = due hoje e NÃO done
      }
    }

    // ── Filtro 1670289 (ativRealizadas): Reuniões Marcadas ──
    //    Eixo: add_time (BRT) = hoje. type=meeting, status independe.
    for (const a of ativRealizadas) {
      if (a.type !== "meeting") continue;
      const nome = resolve(a.owner_id || a.user_id);
      if (!nome) continue;
      if (utcToBrtDateStr(a.add_time) === dia) acc[nome].marcadas++;
    }

    // ── Filtro 1670292: fechamentos (won, eixo won_time BRT) ──
    for (const d of dealsWon) {
      if (String(d.status).toLowerCase() !== "won") continue;
      const uid = d.user_id && typeof d.user_id === "object" ? d.user_id.id : d.user_id;
      const nome = resolve(uid);
      if (!nome) continue;
      if (utcToBrtDateStr(d.won_time) === dia) acc[nome].fechamentos++;
    }

    // ── Propostas (GitHub) ──
    const propostasDia = (gh.json && gh.json[dia]) || {};
    for (const nome of Object.keys(acc)) {
      const key = Object.keys(propostasDia).find(
        (k) => normName(k) === normName(nome)
      );
      acc[nome].propostas = key ? Number(propostasDia[key]) || 0 : 0;
    }

    const linhas = roster.nomes.map((p) => {
      const a = acc[p.nome];
      const pct = (num, den) => (den > 0 ? Math.round((num / den) * 10000) / 100 : 0);
      return {
        nome: p.nome,
        cargo: p.cargo,
        ...a,
        taxas: {
          marcacao: pct(a.marcadas, a.call + a.wpp),      // Marcadas / (Ligações + WhatsApp)
          comparecimento: pct(a.realizadas, a.marcadas),   // Realizadas / Marcadas
          proposta: pct(a.propostas, a.realizadas),        // Propostas / Realizadas
          fechamento: pct(a.fechamentos, a.propostas),     // Fechamentos / Propostas
        },
      };
    });
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
    versao: "2026-07-20-ABAS",
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
