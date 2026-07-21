// ═══════════════════════════════════════════════════════════════════
// Board Academy — Painel Orion · Atividades & Taxa de Conexão (V1)
// >>> VERSAO: 2026-07-21-SLAREAL <<<  (roster lê coluna Subarea)
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
const HTML = "<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Board Academy — Orion · Atividades</title>\n<link href=\"https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap\" rel=\"stylesheet\">\n<style>\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n:root{\n  --paper:#FFFFFF;\n  --panel:#FAFBFC;\n  --ink:#10151C;\n  --ink-2:#3D4854;\n  --muted:#7A8694;\n  --rule:#D7DDE3;\n  --rule-strong:#10151C;\n  --navy:#14335C;\n  --red:#B3261E;\n  --green:#1B6E3C;\n  --accent:#C9A227;\n  --mono:'IBM Plex Mono',monospace;\n  --sans:'IBM Plex Sans',sans-serif;\n}\nhtml{font-size:14px}\nbody{font-family:var(--sans);background:var(--paper);color:var(--ink);min-height:100vh;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased}\n\n.dochead{border-bottom:3px solid var(--rule-strong);background:var(--paper)}\n.dochead-in{max-width:1300px;margin:0 auto;padding:18px 28px 14px;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap}\n.dh-org{font-family:var(--mono);font-size:.66rem;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}\n.dh-title{font-size:1.5rem;font-weight:700;letter-spacing:-.01em;line-height:1.1}\n.dh-title span{color:var(--muted);font-weight:300}\n.dh-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.dh-stamp{font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;border:1.5px solid var(--ink);padding:3px 10px;color:var(--ink)}\n.ctl-date{background:var(--paper);color:var(--ink);border:1px solid var(--ink);border-radius:0;padding:6px 10px;font-family:var(--mono);font-size:.72rem;cursor:pointer;outline:none}\n.tbtn{background:var(--paper);border:1px solid var(--ink);color:var(--ink);font-family:var(--mono);font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;padding:7px 16px;cursor:pointer;transition:all .12s}\n.tbtn:hover{background:var(--ink);color:var(--paper)}\n.tbtn:disabled{opacity:.4;cursor:default}\n.tbtn.primary{background:var(--ink);color:var(--paper)}\n.tbtn.primary:disabled{opacity:.3}\n\n.page{max-width:1300px;margin:0 auto;padding:26px 28px 40px;width:100%;flex:1}\n\n.sec{margin-bottom:14px}\n.sec-body{border-top:1px solid var(--rule);padding-top:8px;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}\n.sec-title{font-size:1.15rem;font-weight:600;letter-spacing:-.01em}\n.sec-note{font-family:var(--mono);font-size:.64rem;color:var(--muted);letter-spacing:.04em;text-transform:uppercase}\n\n.twrap{border:1px solid var(--rule)}\ntable{width:100%;border-collapse:collapse;font-size:.82rem;table-layout:fixed}\nthead th{font-family:var(--mono);font-size:.54rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#FFFFFF;padding:10px 6px;text-align:right;border-bottom:2px solid var(--rule-strong);white-space:normal;word-wrap:break-word;line-height:1.3;vertical-align:bottom;background:#2A323C}\nthead th:first-child{text-align:left;width:220px;padding-left:14px}\ntbody tr{border-bottom:1px solid var(--rule)}\ntbody tr:nth-child(even){background:var(--panel)}\ntbody tr:hover{background:#F1F4F7}\ntbody td{padding:9px 6px;text-align:right;font-variant-numeric:tabular-nums;font-family:var(--mono);font-size:.82rem}\ntbody td:first-child{text-align:left;padding-left:14px;font-family:var(--sans)}\ntd.zero{color:#C3CBD3}\ntd.tot{font-weight:700}\ntd.val-ok{color:var(--green);font-weight:600}\ntd.val-noshow{color:var(--red);font-weight:600}\ntfoot td{padding:11px 6px;text-align:right;font-weight:700;font-variant-numeric:tabular-nums;border-top:2px solid var(--rule-strong);background:var(--paper);font-family:var(--mono);font-size:.82rem}\ntfoot td:first-child{text-align:left;padding-left:14px;font-family:var(--mono);font-weight:600;font-size:.6rem;letter-spacing:.08em;text-transform:uppercase}\n\n.nome{font-weight:600;font-size:.84rem;line-height:1.2;color:var(--ink)}\n.cargo{display:block;font-family:var(--mono);font-size:.58rem;color:var(--muted);margin-top:2px}\n\n.inp-prop{width:62px;background:var(--paper);color:var(--ink);border:1px solid var(--rule);border-radius:0;padding:5px 8px;font-family:var(--mono);font-size:.8rem;text-align:right;outline:none;transition:border-color .12s}\n.inp-prop:focus{border-color:var(--ink)}\n.inp-prop.dirty{border-color:var(--accent);background:#FBF8EC}\n\n.state-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:340px;gap:14px;color:var(--muted)}\n.spinner{width:24px;height:24px;border:2px solid var(--rule);border-top-color:var(--ink);border-radius:50%;animation:spin .7s linear infinite}\n@keyframes spin{to{transform:rotate(360deg)}}\n.errbanner{background:#FDF3F2;border:1px solid #E8B4B0;color:var(--red);padding:12px 16px;font-size:.78rem;margin-bottom:20px;display:none;white-space:pre-wrap;font-family:var(--mono)}\n.errbanner.on{display:block}\n\n.pfooter{margin-top:auto;padding:14px 28px;border-top:2px solid var(--rule-strong);display:flex;justify-content:space-between;gap:12px;font-family:var(--mono);font-size:.62rem;color:var(--muted);letter-spacing:.04em;flex-wrap:wrap;max-width:1300px;margin-left:auto;margin-right:auto;width:100%}\n.gh-warn{color:var(--red)}\n.gh-warn.hidden{display:none}\n\n@media(max-width:900px){.dochead-in,.page{padding-left:12px;padding-right:12px}thead th:first-child{width:150px}}\n@media print{@page{size:A4 landscape;margin:10mm}.tbtn,.ctl-date{display:none}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}\n\n/* ── Barra de abas ── */\n.tabbar{position:sticky;top:0;z-index:99;background:var(--paper);border-bottom:2px solid var(--rule-strong)}\n.tabbar-in{max-width:1300px;margin:0 auto;padding:0 28px;display:flex;gap:26px;overflow-x:auto}\n.tab{font-family:var(--mono);font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:transparent;border:none;border-bottom:2px solid transparent;margin-bottom:-2px;padding:13px 2px;cursor:pointer;white-space:nowrap;transition:color .12s,border-color .12s}\n.tab:hover{color:var(--ink)}\n.tab.active{color:var(--ink);border-bottom-color:var(--ink);font-weight:600}\n.tabpane{display:none}\n.tabpane.active{display:block}\n/* ── Em construção ── */\n.construcao{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:440px;gap:12px;text-align:center;border:1px dashed var(--rule);background:var(--panel)}\n.construcao-t{font-family:var(--mono);font-size:.82rem;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-2)}\n.construcao-s{font-family:var(--mono);font-size:.64rem;color:var(--muted);letter-spacing:.05em}\n\n\n\n\n/* ── Comportamento remoto: faróis horários ── */\n.cp-intro{font-family:var(--mono);font-size:.62rem;color:var(--muted);letter-spacing:.02em;line-height:1.5;margin-bottom:14px;max-width:960px}\n.hz-legend{display:flex;gap:16px;align-items:center;margin-bottom:12px;flex-wrap:wrap}\n.hz-leg{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:.58rem;color:var(--ink-2);letter-spacing:.03em}\n.hz-sw{width:12px;height:12px;border:1px solid var(--rule)}\n.hz-table{width:100%;border-collapse:collapse;table-layout:fixed}\n.hz-table th{font-family:var(--mono);font-size:.5rem;font-weight:600;letter-spacing:.02em;color:#FFFFFF;background:#2A323C;padding:7px 2px;text-align:center;border-bottom:2px solid var(--rule-strong)}\n.hz-table th.hz-nome{text-align:left;padding-left:14px;width:170px}\n.hz-table td{padding:0;text-align:center;font-family:var(--mono);font-size:.72rem;font-variant-numeric:tabular-nums;border-right:1px solid #FFFFFF;height:38px;color:var(--ink)}\n.hz-table td.hz-nome{text-align:left;padding-left:14px;font-family:var(--sans);border-right:1px solid var(--rule)}\n.hz-table tr{border-bottom:1px solid var(--rule)}\n.hz-nome .nome{font-weight:600;font-size:.8rem}\n.hz-nome .cargo{font-family:var(--mono);font-size:.54rem;color:var(--muted)}\n.f-neutro{background:#F4F6F8;color:#8A94A0}\n.f-futuro{background:#EEF1F4;color:transparent}\n.hz-table th.hz-fora,.hz-table td.hz-fora{border-left:2px solid var(--rule-strong);background:var(--paper);color:var(--ink-2);font-weight:600;width:52px}\n.hz-table td.hz-fora.tem{color:var(--red)}\n.f-verde{background:#DFF3E4;color:#1B6E3C}\n.f-amarelo{background:#FBF3D6;color:#8A6D1B}\n.f-vermelho{background:#FBE1DF;color:#B3261E}\n\n\n/* ── Jornada e Impacto ── */\n.jr-savebar{display:flex;justify-content:flex-end;margin-bottom:14px}\n.inp-hora{width:74px;background:var(--paper);color:var(--ink);border:1px solid var(--rule);border-radius:0;padding:5px 8px;font-family:var(--mono);font-size:.8rem;text-align:center;outline:none}\n.inp-hora:focus{border-color:var(--ink)}\n.jr-auto{font-family:var(--mono);font-weight:600;font-variant-numeric:tabular-nums}\n.jr-imp{color:#B8860B}\n.jr-liq{color:var(--green)}\n.imp-table{width:100%;border-collapse:collapse;font-size:.82rem}\n.imp-table th{font-family:var(--mono);font-size:.54rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#FFFFFF;background:#2A323C;padding:9px 8px;text-align:left;border-bottom:2px solid var(--rule-strong)}\n.imp-table td{padding:7px 8px;border-bottom:1px solid var(--rule);vertical-align:middle}\n.imp-table tr:nth-child(even){background:var(--panel)}\n.imp-sel{background:var(--paper);color:var(--ink);border:1px solid var(--rule);border-radius:0;padding:5px 8px;font-family:var(--sans);font-size:.78rem;outline:none;width:100%;max-width:210px}\n.imp-sel:focus{border-color:var(--ink)}\n.imp-dur{font-family:var(--mono);font-weight:600;font-variant-numeric:tabular-nums}\n.imp-rm{background:none;border:none;color:var(--red);font-family:var(--mono);font-size:.68rem;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;padding:4px 6px}\n.imp-rm:hover{text-decoration:underline}\n.imp-add{background:var(--paper);border:1px solid var(--ink);color:var(--ink);font-family:var(--mono);font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;padding:8px 16px;cursor:pointer;margin-top:14px}\n.imp-add:hover{background:var(--ink);color:var(--paper)}\n.jr-status{font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-left:12px}\n\n\n/* ── SLA Real ── */\n.sla-resumo{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}\n.sla-card{border:1px solid var(--rule);padding:10px 14px;min-width:150px}\n.sla-card .o{font-weight:600;font-size:.82rem;margin-bottom:4px}\n.sla-card .m{font-family:var(--mono);font-size:.62rem;color:var(--ink-2)}\n.sla-card .m b{color:var(--green);font-weight:600}\n.sla-card .a{font-family:var(--mono);font-size:.62rem;color:var(--red)}\n.sla-deal-link{font-family:var(--mono);color:var(--navy);text-decoration:none;font-weight:600}\n.sla-deal-link:hover{text-decoration:underline}\n.sla-aguard{color:var(--red);font-weight:600}\n.sla-min-ok{color:var(--green);font-weight:600}\n.sla-min-med{color:#B8860B;font-weight:600}\n.sla-min-ruim{color:var(--red);font-weight:600}\n\n</style>\n</head>\n<body>\n\n<div class=\"dochead\">\n  <div class=\"dochead-in\">\n    <div>\n      <div class=\"dh-org\">Board Academy · Inteligência Comercial</div>\n      <div class=\"dh-title\">Atividades <span>· Equipe Orion</span></div>\n    </div>\n    <div class=\"dh-right\">\n      <input type=\"date\" class=\"ctl-date\" id=\"ctl-date\">\n      <button class=\"tbtn\" id=\"btn-hoje\">Hoje</button>\n      <button class=\"tbtn\" id=\"btn-refresh\">Atualizar</button>\n      <button class=\"tbtn primary\" id=\"btn-salvar\" disabled>Salvar Propostas</button>\n    </div>\n  </div>\n</div>\n\n<div class=\"tabbar\"><div class=\"tabbar-in\"><button class=\"tab active\" data-tab=\"qualidade\">Qualidade & Conversão</button><button class=\"tab\" data-tab=\"velocidade\">Velocidade e SLA</button><button class=\"tab\" data-tab=\"sla-real\">SLA Real</button><button class=\"tab\" data-tab=\"remoto\">Comportamento Remoto</button><button class=\"tab\" data-tab=\"jornada\">Jornada e Impacto</button><button class=\"tab\" data-tab=\"resultado\">Resultado</button><button class=\"tab\" data-tab=\"mensal\">Visão Mensal</button></div></div>\n\n<div class=\"page\">\n  <div class=\"errbanner\" id=\"err-banner\"></div>\n\n  <div class=\"tabpane active\" id=\"pane-qualidade\">\n    <div class=\"sec\">\n      <div class=\"sec-body\">\n        <span class=\"sec-title\">Acompanhamento Diário — Atividades por Closer</span>\n        <span class=\"sec-note\" id=\"sec-meta\">—</span>\n      </div>\n    </div>\n\n    <div id=\"content\">\n      <div class=\"state-wrap\"><div class=\"spinner\"></div><span>Consultando PipeDrive…</span></div>\n    </div>\n\n    <div id=\"conv-content\"></div>\n  </div>\n\n  <div class=\"tabpane\" id=\"pane-velocidade\"><div class=\"construcao\"><div class=\"construcao-t\">Em Construção</div><div class=\"construcao-s\">Velocidade e SLA</div></div></div>\n  <div class=\"tabpane\" id=\"pane-sla-real\">\n    <div class=\"sec\"><div class=\"sec-body\">\n      <span class=\"sec-title\">SLA Real — Lead a Lead</span>\n      <span class=\"sec-note\" id=\"sla-meta\">Entrada do lead → primeira atividade (call/wpp) concluída</span>\n    </div></div>\n    <div id=\"sla-resumo\"></div>\n    <div id=\"sla-content\"></div>\n  </div>\n  <div class=\"tabpane\" id=\"pane-remoto\">\n    <div class=\"sec\"><div class=\"sec-body\">\n      <span class=\"sec-title\">Comportamento Remoto — Ritmo Hora a Hora</span>\n      <span class=\"sec-note\">wpp + chamadas concluídas por hora · 08–20h</span>\n    </div></div>\n    <div class=\"cp-intro\">Cada célula = atividades concluídas naquela hora. O farol compara com a hora anterior. Coluna <b>Fora</b> = wpp+chamadas concluídas fora de 08–20h ou sem hora registrada (soma das horas + Fora = total da aba Qualidade &amp; Conversão).</div>\n    <div class=\"hz-legend\">\n      <span class=\"hz-leg\"><span class=\"hz-sw f-verde\"></span>Subiu +10</span>\n      <span class=\"hz-leg\"><span class=\"hz-sw f-amarelo\"></span>Estável (±10)</span>\n      <span class=\"hz-leg\"><span class=\"hz-sw f-vermelho\"></span>Caiu −10</span>\n      <span class=\"hz-leg\"><span class=\"hz-sw f-neutro\"></span>Primeira hora</span>\n      <span class=\"hz-leg\"><span class=\"hz-sw f-futuro\" style=\"border-color:var(--rule)\"></span>Ainda não chegou</span>\n    </div>\n    <div id=\"cp-content\"></div>\n  </div>\n  <div class=\"tabpane\" id=\"pane-jornada\">\n    <div class=\"jr-savebar\">\n      <button class=\"tbtn primary\" id=\"btn-salvar-jornada\" disabled>Salvar Jornada</button>\n      <span class=\"jr-status\" id=\"jr-status\"></span>\n    </div>\n\n    <div class=\"sec\"><div class=\"sec-body\">\n      <span class=\"sec-title\">Início e Fim do Expediente</span>\n      <span class=\"sec-note\">Horário de entrada e saída · controle interno de PJ</span>\n    </div></div>\n    <div id=\"jr-expediente\"></div>\n\n    <div class=\"sec\" style=\"margin-top:34px\"><div class=\"sec-body\">\n      <span class=\"sec-title\">Impactos do Dia</span>\n      <span class=\"sec-note\">Blocos que tiram tempo de venda · 'Todos' conta para o time inteiro</span>\n    </div></div>\n    <div id=\"jr-impactos\"></div>\n    <button class=\"imp-add\" id=\"btn-add-impacto\">+ Adicionar impacto</button>\n  </div>\n  <div class=\"tabpane\" id=\"pane-resultado\"><div class=\"construcao\"><div class=\"construcao-t\">Em Construção</div><div class=\"construcao-s\">Resultado</div></div></div>\n  <div class=\"tabpane\" id=\"pane-mensal\"><div class=\"construcao\"><div class=\"construcao-t\">Em Construção</div><div class=\"construcao-s\">Visão Mensal</div></div></div>\n</div>\n\n<footer class=\"pfooter\">\n  <span>Board Academy · Atividades Orion · Documento de trabalho</span>\n  <span class=\"gh-warn hidden\" id=\"gh-warn\">Propostas nao persistem (GITHUB_TOKEN/GITHUB_REPO ausentes)</span>\n  <span id=\"foot-src\">Fonte: PipeDrive</span>\n</footer>\n\n<script>\nlet appData=null;\nlet dirty={};\nlet carregando=false;\nconst $=(id)=>document.getElementById(id);\n\nfunction hojeBrt(){const d=new Date(Date.now()-3*3600*1000);return d.toISOString().slice(0,10);}\n\nconst COLS=[\n  {key:\"wpp\",         lbl:\"WhatsApp\"},\n  {key:\"call\",        lbl:\"Ligacoes\"},\n  {key:\"marcadas\",    lbl:\"Reun. Marcadas\"},\n  {key:\"realizadas\",  lbl:\"Reun. Realizadas\"},\n  {key:\"propostas\",   lbl:\"Propostas\"},\n  {key:\"fechamentos\", lbl:\"Fechamentos\"},\n  {key:\"no_show\",     lbl:\"No-Show\"},\n];\n\nfunction fmtCell(key,v){\n  if(key===\"no_show\"){\n    if(v>0)return `<td class=\"val-noshow\" title=\"Reuniao com due_date hoje nao concluida\">${v}</td>`;\n    return `<td class=\"zero\">—</td>`;\n  }\n  if(key===\"fechamentos\"&&v>0)return `<td class=\"val-ok\">${v}</td>`;\n  if(v===0)return `<td class=\"zero\">—</td>`;\n  return `<td>${v}</td>`;\n}\n\nasync function fetchDados(){\n  if(carregando)return;\n  carregando=true;\n  try{\n    const dia=$(\"ctl-date\").value||hojeBrt();\n    const r=await fetch(\"/api/dashboard?date=\"+dia);\n    const data=await r.json();\n    if(!r.ok||data.erro)throw new Error(data.erro||\"HTTP \"+r.status);\n    appData=data;\n    $(\"err-banner\").classList.remove(\"on\");\n    render(data);\n  }catch(err){\n    $(\"err-banner\").textContent=\"Erro ao carregar: \"+err.message;\n    $(\"err-banner\").classList.add(\"on\");\n    $(\"content\").innerHTML='<div class=\"state-wrap\"><span>Nao foi possivel carregar os dados.</span></div>';\n  }finally{\n    carregando=false;\n  }\n}\n\nfunction render(data){\n  $(\"sec-meta\").textContent=\"Ref \"+data.dia+\" · atualizado \"+data.atualizado_em+\" BRT\";\n  $(\"foot-src\").textContent=\"Fonte: PipeDrive · \"+data.atualizado_em;\n  $(\"gh-warn\").classList.toggle(\"hidden\",!!data.github_configurado);\n\n  if(!data.linhas.length){\n    $(\"content\").innerHTML='<div class=\"state-wrap\"><span>Nenhum colaborador Orion no roster do mes.</span></div>';\n    $(\"conv-content\").innerHTML=\"\";\n    const cpE=document.getElementById(\"cp-content\");if(cpE)cpE.innerHTML=\"\";\n    return;\n  }\n\n  const thead=`<thead><tr><th>Closer / Vendedor</th>${COLS.map(c=>`<th>${c.lbl}</th>`).join(\"\")}<th>Total Ativ.</th></tr></thead>`;\n\n  const rows=data.linhas.map(l=>{\n    const totalAtiv=l.wpp+l.call+l.realizadas;\n    const tds=COLS.map(c=>{\n      if(c.key===\"propostas\"){\n        return `<td><input type=\"number\" min=\"0\" step=\"1\" class=\"inp-prop\" data-nome=\"${l.nome.replace(/\"/g,\"&quot;\")}\" value=\"${l.propostas}\"></td>`;\n      }\n      return fmtCell(c.key,l[c.key]);\n    }).join(\"\");\n    return `<tr>\n      <td><span class=\"nome\">${l.nome}</span>${l.cargo?`<span class=\"cargo\">${l.cargo}</span>`:\"\"}</td>\n      ${tds}\n      <td class=\"tot\">${totalAtiv}</td>\n    </tr>`;\n  }).join(\"\");\n\n  const t=data.totais;\n  const totalGeral=t.wpp+t.call+t.realizadas;\n  const tfoot=`<tfoot><tr><td>Total Orion</td>${COLS.map(c=>`<td>${t[c.key]}</td>`).join(\"\")}<td>${totalGeral}</td></tr></tfoot>`;\n\n  $(\"content\").innerHTML=`<div class=\"twrap\"><table>${thead}<tbody>${rows}</tbody>${tfoot}</table></div>`;\n\n  // ── Taxas de conversão por etapa ──\n  const convEtapas=[\n    {key:\"marcacao\",      lbl:\"Marcação\"},\n    {key:\"comparecimento\",lbl:\"Comparecimento\"},\n    {key:\"proposta\",      lbl:\"Proposta\"},\n    {key:\"fechamento\",    lbl:\"Fechamento\"},\n  ];\n  const convHead=`<thead><tr><th>Closer / Vendedor</th>${convEtapas.map(e=>`<th>${e.lbl}</th>`).join(\"\")}</tr></thead>`;\n  const convBody=data.linhas.map(l=>{\n    const tds=convEtapas.map(e=>{\n      const v=l.taxas[e.key];\n      const txt=v.toFixed(2).replace(\".\",\",\")+\"%\";\n      return v===0?`<td class=\"zero\">${txt}</td>`:`<td>${txt}</td>`;\n    }).join(\"\");\n    return `<tr><td><span class=\"nome\">${l.nome}</span>${l.cargo?`<span class=\"cargo\">${l.cargo}</span>`:\"\"}</td>${tds}</tr>`;\n  }).join(\"\");\n  $(\"conv-content\").innerHTML=`\n    <div class=\"conv-sec\">\n      <div class=\"sec\"><div class=\"sec-body\">\n        <span class=\"sec-title\">Taxas de Conversão por Etapa</span>\n        <span class=\"sec-note\">Divisor zero = 0%</span>\n      </div></div>\n      <div class=\"twrap\"><table>${convHead}<tbody>${convBody}</tbody></table></div>\n    </div>`;\n\n  // ── Comportamento Remoto: faróis hora a hora ──\n  renderSla(data);\n  const cpEl=document.getElementById(\"cp-content\");\n  if(cpEl&&data.linhas.length){\n    const horasLabels=data.linhas[0].horas.map(x=>x.h);\n    const head=`<thead><tr><th class=\"hz-nome\">Closer</th>${horasLabels.map(h=>`<th>${String(h).padStart(2,\"0\")}h</th>`).join(\"\")}<th class=\"hz-fora\" title=\"wpp+chamadas concluídas fora de 08–20h ou sem hora registrada\">Fora</th></tr></thead>`;\n    const body=data.linhas.map(l=>{\n      const cells=l.horas.map(x=>{\n        const txt=x.futuro?\"\":x.v;   // futuro vazio; senão mostra número (0 inclusive)\n        return `<td class=\"f-${x.farol}\">${txt}</td>`;\n      }).join(\"\");\n      const fora=l.fora_janela||0;\n      return `<tr><td class=\"hz-nome\"><span class=\"nome\">${l.nome}</span>${l.cargo?`<span class=\"cargo\">${l.cargo}</span>`:\"\"}</td>${cells}<td class=\"hz-fora${fora>0?\" tem\":\"\"}\">${fora===0?\"0\":fora}</td></tr>`;\n    }).join(\"\");\n    cpEl.innerHTML=`<div class=\"twrap\"><table class=\"hz-table\">${head}<tbody>${body}</tbody></table></div>`;\n  }\n\n  document.querySelectorAll(\".inp-prop\").forEach(inp=>{\n    inp.addEventListener(\"input\",()=>{\n      dirty[inp.dataset.nome]=inp.value;\n      inp.classList.add(\"dirty\");\n      $(\"btn-salvar\").disabled=false;\n    });\n  });\n  dirty={};\n  $(\"btn-salvar\").disabled=true;\n}\n\n$(\"btn-salvar\").addEventListener(\"click\",async()=>{\n  const btn=$(\"btn-salvar\");\n  btn.disabled=true;btn.textContent=\"Salvando…\";\n  try{\n    const r=await fetch(\"/api/propostas\",{\n      method:\"POST\",headers:{\"Content-Type\":\"application/json\"},\n      body:JSON.stringify({date:$(\"ctl-date\").value||hojeBrt(),values:dirty}),\n    });\n    const data=await r.json();\n    if(!r.ok||data.erro)throw new Error(data.erro||\"HTTP \"+r.status);\n    dirty={};\n    btn.textContent=\"✓ Salvo\";\n    setTimeout(()=>{btn.textContent=\"Salvar Propostas\";},1600);\n    fetchDados();\n  }catch(err){\n    btn.disabled=false;btn.textContent=\"Salvar Propostas\";\n    $(\"err-banner\").textContent=\"Erro ao salvar propostas: \"+err.message;\n    $(\"err-banner\").classList.add(\"on\");\n  }\n});\n\n$(\"ctl-date\").value=hojeBrt();\n$(\"ctl-date\").addEventListener(\"change\",()=>{dirty={};fetchDados();if(document.getElementById(\"pane-jornada\").classList.contains(\"active\"))loadJornada();});\n$(\"btn-hoje\").addEventListener(\"click\",()=>{$(\"ctl-date\").value=hojeBrt();dirty={};fetchDados();});\n$(\"btn-refresh\").addEventListener(\"click\",()=>{\n  const btn=$(\"btn-refresh\");\n  btn.disabled=true;btn.textContent=\"Atualizando…\";\n  fetchDados().finally(()=>{btn.textContent=\"Atualizar\";btn.disabled=false;});\n});\n\n\n// ══ JORNADA E IMPACTO ══════════════════════════════════════════════\nconst TIPOS_IMPACTO=[\"Daily\",\"Treinamento\",\"Reunião com Gestão\",\"Almoço\",\"Reunião com Cliente\",\"Outro\"];\nlet jornadaData={expediente:{},impactos:[]};\nlet jornadaDirty=false;\n\nfunction rosterNomes(){return (appData&&appData.linhas?appData.linhas.map(l=>l.nome):[]);}\nfunction rosterCargo(nome){const l=(appData&&appData.linhas||[]).find(x=>x.nome===nome);return l?l.cargo:\"\";}\n\n// hora \"HH:MM\" -> minutos; diff em horas decimais\nfunction hm2min(s){if(!/^\\d{2}:\\d{2}$/.test(s||\"\"))return null;const[h,m]=s.split(\":\").map(Number);return h*60+m;}\nfunction durHoras(ini,fim){const a=hm2min(ini),b=hm2min(fim);if(a===null||b===null)return 0;const d=(b-a)/60;return d>0?d:0;}\nfunction fmtH(h){return h.toFixed(h<0.1&&h>0?2:1)+\"h\";}\n\n// horas impactadas de um closer = impactos \"dele\" + impactos \"Todos\"\nfunction impactadasDe(nome){\n  let total=0;\n  for(const imp of jornadaData.impactos){\n    if(imp.quem===nome||imp.quem===\"Todos\")total+=durHoras(imp.inicio,imp.fim);\n  }\n  return total;\n}\n\nfunction markJornadaDirty(){jornadaDirty=true;$(\"btn-salvar-jornada\").disabled=false;}\n\nfunction renderJornada(){\n  const nomes=rosterNomes();\n  // ── Parte 1: expediente ──\n  const expHead=`<thead><tr><th>Closer</th><th>Início</th><th>Fim</th><th>Jornada Total</th><th>Horas Impactadas</th><th>Horas Líquidas</th></tr></thead>`;\n  const expBody=nomes.map(nome=>{\n    const e=jornadaData.expediente[nome]||{inicio:\"\",fim:\"\"};\n    const jt=durHoras(e.inicio,e.fim);\n    const imp=impactadasDe(nome);\n    const liq=Math.max(0,jt-imp);\n    return `<tr>\n      <td><span class=\"nome\">${nome}</span>${rosterCargo(nome)?`<span class=\"cargo\">${rosterCargo(nome)}</span>`:\"\"}</td>\n      <td><input type=\"time\" class=\"inp-hora jr-exp-inp\" data-nome=\"${nome.replace(/\"/g,\"&quot;\")}\" data-campo=\"inicio\" value=\"${e.inicio||\"\"}\"></td>\n      <td><input type=\"time\" class=\"inp-hora jr-exp-inp\" data-nome=\"${nome.replace(/\"/g,\"&quot;\")}\" data-campo=\"fim\" value=\"${e.fim||\"\"}\"></td>\n      <td class=\"jr-auto\">${jt>0?fmtH(jt):\"—\"}</td>\n      <td class=\"jr-auto jr-imp\">${imp>0?fmtH(imp):\"—\"}</td>\n      <td class=\"jr-auto jr-liq\">${jt>0?fmtH(liq):\"—\"}</td>\n    </tr>`;\n  }).join(\"\");\n  document.getElementById(\"jr-expediente\").innerHTML=`<div class=\"twrap\"><table>${expHead}<tbody>${expBody}</tbody></table></div>`;\n\n  // ── Parte 2: impactos ──\n  const quemOpts=nome=>[\"Todos\",...nomes].map(n=>`<option value=\"${n.replace(/\"/g,\"&quot;\")}\" ${n===nome?\"selected\":\"\"}>${n}</option>`).join(\"\");\n  const tipoOpts=t=>TIPOS_IMPACTO.map(x=>`<option value=\"${x}\" ${x===t?\"selected\":\"\"}>${x}</option>`).join(\"\");\n  const impHead=`<thead><tr><th>Tipo</th><th>Quem</th><th>Início</th><th>Fim</th><th>Duração</th><th></th></tr></thead>`;\n  const impBody=jornadaData.impactos.map((imp,idx)=>{\n    const dur=durHoras(imp.inicio,imp.fim);\n    return `<tr>\n      <td><select class=\"imp-sel imp-f\" data-idx=\"${idx}\" data-campo=\"tipo\">${tipoOpts(imp.tipo)}</select></td>\n      <td><select class=\"imp-sel imp-f\" data-idx=\"${idx}\" data-campo=\"quem\">${quemOpts(imp.quem)}</select></td>\n      <td><input type=\"time\" class=\"inp-hora imp-f\" data-idx=\"${idx}\" data-campo=\"inicio\" value=\"${imp.inicio||\"\"}\"></td>\n      <td><input type=\"time\" class=\"inp-hora imp-f\" data-idx=\"${idx}\" data-campo=\"fim\" value=\"${imp.fim||\"\"}\"></td>\n      <td class=\"imp-dur\">${fmtH(dur)}</td>\n      <td><button class=\"imp-rm\" data-idx=\"${idx}\">Remover</button></td>\n    </tr>`;\n  }).join(\"\");\n  const impEmpty=jornadaData.impactos.length?\"\":'<tr><td colspan=\"6\" style=\"text-align:center;color:var(--muted);font-family:var(--mono);font-size:.7rem;padding:20px\">Nenhum impacto registrado</td></tr>';\n  document.getElementById(\"jr-impactos\").innerHTML=`<div class=\"twrap\"><table class=\"imp-table\">${impHead}<tbody>${impBody||impEmpty}</tbody></table></div>`;\n\n  // listeners expediente\n  document.querySelectorAll(\".jr-exp-inp\").forEach(inp=>{\n    inp.addEventListener(\"input\",()=>{\n      const n=inp.dataset.nome;\n      jornadaData.expediente[n]=jornadaData.expediente[n]||{inicio:\"\",fim:\"\"};\n      jornadaData.expediente[n][inp.dataset.campo]=inp.value;\n      markJornadaDirty();renderJornada();\n    });\n  });\n  // listeners impactos (edição inline)\n  document.querySelectorAll(\".imp-f\").forEach(el=>{\n    el.addEventListener(\"input\",()=>{\n      const i=+el.dataset.idx;\n      jornadaData.impactos[i][el.dataset.campo]=el.value;\n      markJornadaDirty();renderJornada();\n    });\n  });\n  document.querySelectorAll(\".imp-rm\").forEach(btn=>{\n    btn.addEventListener(\"click\",()=>{\n      jornadaData.impactos.splice(+btn.dataset.idx,1);\n      markJornadaDirty();renderJornada();\n    });\n  });\n}\n\nasync function loadJornada(){\n  try{\n    const dia=$(\"ctl-date\").value||hojeBrt();\n    const r=await fetch(\"/api/jornada?date=\"+dia);\n    const j=await r.json();\n    if(j.erro)throw new Error(j.erro);\n    jornadaData={expediente:j.expediente||{},impactos:j.impactos||[]};\n    jornadaDirty=false;\n    $(\"btn-salvar-jornada\").disabled=true;\n    $(\"jr-status\").textContent=\"\";\n    renderJornada();\n  }catch(e){\n    $(\"jr-status\").textContent=\"Erro ao carregar: \"+e.message;\n  }\n}\n\ndocument.getElementById(\"btn-add-impacto\").addEventListener(\"click\",()=>{\n  jornadaData.impactos.push({tipo:\"Daily\",quem:\"Todos\",inicio:\"\",fim:\"\"});\n  markJornadaDirty();renderJornada();\n});\n\n$(\"btn-salvar-jornada\").addEventListener(\"click\",async()=>{\n  const btn=$(\"btn-salvar-jornada\");\n  btn.disabled=true;btn.textContent=\"Salvando…\";\n  try{\n    const r=await fetch(\"/api/jornada\",{\n      method:\"POST\",headers:{\"Content-Type\":\"application/json\"},\n      body:JSON.stringify({date:$(\"ctl-date\").value||hojeBrt(),expediente:jornadaData.expediente,impactos:jornadaData.impactos}),\n    });\n    const j=await r.json();\n    if(!r.ok||j.erro)throw new Error(j.erro||\"HTTP \"+r.status);\n    jornadaDirty=false;\n    btn.textContent=\"✓ Salvo\";\n    setTimeout(()=>{btn.textContent=\"Salvar Jornada\";},1600);\n  }catch(e){\n    btn.disabled=false;btn.textContent=\"Salvar Jornada\";\n    $(\"jr-status\").textContent=\"Erro ao salvar: \"+e.message;\n  }\n});\n\n// ── Visibilidade do botão Salvar Propostas: só na aba qualidade ──\nfunction ajustaBotoesPorAba(tab){\n  document.getElementById(\"btn-salvar\").style.display = (tab===\"qualidade\")?\"\":\"none\";\n}\n\n\n\n// ══ SLA REAL ═══════════════════════════════════════════════════════\nconst PIPE_BASE=\"https://boardacademy.pipedrive.com/deal/\";\nfunction fmtSla(min){\n  if(min<60)return min+\" min\";\n  return Math.floor(min/60)+\"h\"+String(min%60).padStart(2,\"0\");\n}\nfunction slaClasse(min){ // faixas de cor (min) — ajustável\n  if(min<=30)return \"sla-min-ok\";\n  if(min<=120)return \"sla-min-med\";\n  return \"sla-min-ruim\";\n}\nfunction renderSla(data){\n  // resumo por owner\n  const resumo=data.sla_resumo||[];\n  document.getElementById(\"sla-resumo\").innerHTML='<div class=\"sla-resumo\">'+resumo.map(r=>`\n    <div class=\"sla-card\">\n      <div class=\"o\">${r.owner}</div>\n      <div class=\"m\">Média: <b>${r.media_min!=null?fmtSla(r.media_min):\"—\"}</b> · ${r.atendidos} atend.</div>\n      ${r.aguardando>0?`<div class=\"a\">${r.aguardando} aguardando</div>`:\"\"}\n    </div>`).join(\"\")+'</div>';\n\n  const leads=data.sla_leads||[];\n  if(!leads.length){\n    document.getElementById(\"sla-content\").innerHTML='<div class=\"state-wrap\"><span>Nenhum lead entrou neste dia.</span></div>';\n    return;\n  }\n  const head=`<thead><tr><th>Deal</th><th>Título</th><th>Owner</th><th>Entrada</th><th>1ª Atividade</th><th>SLA</th></tr></thead>`;\n  const body=leads.map(l=>{\n    const slaCell=l.aguardando\n      ? `<td class=\"sla-aguard\">aguardando · ${fmtSla(l.sla_min)}</td>`\n      : `<td class=\"${slaClasse(l.sla_min)}\">${fmtSla(l.sla_min)}</td>`;\n    return `<tr>\n      <td><a class=\"sla-deal-link\" href=\"${PIPE_BASE}${l.deal_id}\" target=\"_blank\" rel=\"noopener\">#${l.deal_id}</a></td>\n      <td>${l.titulo}</td>\n      <td>${l.owner}</td>\n      <td>${l.entrada_hm}</td>\n      <td>${l.atendimento_hm||\"—\"}</td>\n      ${slaCell}\n    </tr>`;\n  }).join(\"\");\n  document.getElementById(\"sla-content\").innerHTML=`<div class=\"twrap\"><table>${head}<tbody>${body}</tbody></table></div>`;\n}\n\n\n// ── Navegação por abas ──\ndocument.querySelectorAll(\".tab\").forEach(btn=>{\n  btn.addEventListener(\"click\",()=>{\n    document.querySelectorAll(\".tab\").forEach(b=>b.classList.remove(\"active\"));\n    document.querySelectorAll(\".tabpane\").forEach(p=>p.classList.remove(\"active\"));\n    btn.classList.add(\"active\");\n    document.getElementById(\"pane-\"+btn.dataset.tab).classList.add(\"active\");\n    ajustaBotoesPorAba(btn.dataset.tab);\n    if(btn.dataset.tab===\"jornada\")loadJornada();\n  });\n});\n\najustaBotoesPorAba(\"qualidade\");\nfetchDados();\n</script>\n</body>\n</html>\n";
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

// Converte timestamp UTC → { data: "YYYY-MM-DD", hora: number } em BRT
// hora é decimal: 9.5 = 09:30. Usado para janelas de checkpoint.
function utcToBrt(raw) {
  if (!raw) return null;
  const s = String(raw).trim().replace(" ", "T");
  const iso = s.endsWith("Z") ? s : s + "Z";
  const d = new Date(iso);
  if (isNaN(d)) return null;
  const brt = new Date(d.getTime() - TZ_OFFSET_H * 3600 * 1000);
  return {
    data: brt.toISOString().slice(0, 10),
    hora: brt.getUTCHours() + brt.getUTCMinutes() / 60,
  };
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

// ── GITHUB (persistência de propostas e jornada) ────────────────────
const GH_API = "https://api.github.com";
const GITHUB_FILE_JORNADA = process.env.GITHUB_FILE_JORNADA || "jornada_orion.json";

async function ghGetFile(arquivo) {
  const file = arquivo || GITHUB_FILE;
  if (!GITHUB_TOKEN || !GITHUB_REPO) return { json: {}, sha: null, configurado: false };
  const r = await fetch(`${GH_API}/repos/${GITHUB_REPO}/contents/${file}`, {
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

async function ghPutFile(json, sha, arquivo, msg) {
  const file = arquivo || GITHUB_FILE;
  const body = {
    message: (msg || "orion") + " · " + new Date().toISOString(),
    content: Buffer.from(JSON.stringify(json, null, 2)).toString("base64"),
  };
  if (sha) body.sha = sha;
  const r = await fetch(`${GH_API}/repos/${GITHUB_REPO}/contents/${file}`, {
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
      horas: {},   // { 8:0, 9:0, ... 20:0 } — wpp+call por hora de conclusão (BRT)
      fora_janela: 0,  // wpp+call do dia concluídas fora de 08-20h ou sem hora
    });
    const HORA_INI_CP = 8, HORA_FIM_CP = 21; // janelas 08-09 ... 20-21 (13 horas)
    const acc = {};
    for (const p of roster.nomes) {
      acc[p.nome] = zero();
      for (let h = HORA_INI_CP; h < HORA_FIM_CP; h++) acc[p.nome].horas[h] = 0;
    }

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

      // ── Comportamento Remoto: wpp+call por hora de conclusão (BRT) ──
      if ((tipo === "whatsapp_chat" || tipo === "call") && isDone(a)) {
        const md = utcToBrt(a.marked_as_done_time);
        if (md && md.data === dia) {
          const h = Math.floor(md.hora);
          if (h >= HORA_INI_CP && h < HORA_FIM_CP) acc[nome].horas[h]++;
          else acc[nome].fora_janela++;   // concluída fora de 08-20h
        } else {
          acc[nome].fora_janela++;        // sem hora de conclusão ou data divergente
        }
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
      // Série horária com farol vs hora anterior.
      // Determina a hora-limite: se o dia exibido é hoje, corta na hora atual BRT.
      const agoraBrt = new Date(Date.now() - TZ_OFFSET_H * 3600 * 1000);
      const hojeStr = agoraBrt.toISOString().slice(0, 10);
      const horaAtual = agoraBrt.getUTCHours();
      let limiteHora; // horas > limiteHora são futuro (cinza)
      if (dia < hojeStr) limiteHora = 23;        // dia passado: tudo já ocorreu
      else if (dia > hojeStr) limiteHora = -1;   // dia futuro: nada ocorreu
      else limiteHora = horaAtual;               // hoje: até a hora corrente (inclusive)

      const horasArr = [];
      let anterior = null;
      for (let h = HORA_INI_CP; h < HORA_FIM_CP; h++) {
        const futuro = h > limiteHora;
        const v = a.horas[h] || 0;
        let farol;
        if (futuro) farol = "futuro";                 // ainda não chegou → cinza vazio
        else if (anterior === null) farol = "neutro"; // 1ª hora do dia → cinza (mostra 0)
        else {
          const diff = v - anterior;
          if (diff > 10) farol = "verde";
          else if (diff < -10) farol = "vermelho";
          else farol = "amarelo";
        }
        horasArr.push({ h, v, farol, futuro });
        // só encadeia comparação entre horas já ocorridas
        if (!futuro) anterior = v;
      }
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
        horas: horasArr,
        fora_janela: a.fora_janela,
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

    // ── SLA Real: entrada do lead → primeira atividade call/wpp done ──
    const agoraMs = Date.now();
    // índice de primeira atividade done (call/wpp) por deal_id, pela hora de conclusão
    const primeiraAtivPorDeal = {};
    for (const a of ativGeral) {
      if (!(a.type === "call" || a.type === "whatsapp_chat")) continue;
      if (!(a.done === true || a.status === "done")) continue;
      const did = a.deal_id;
      if (!did || !a.marked_as_done_time) continue;
      const t = new Date(String(a.marked_as_done_time).replace(" ", "T").replace(/Z?$/, "Z")).getTime();
      if (!primeiraAtivPorDeal[did] || t < primeiraAtivPorDeal[did]) primeiraAtivPorDeal[did] = t;
    }
    const slaLeads = [];
    for (const d of dealsWon) {
      if (utcToBrtDateStr(d.add_time) !== dia) continue;
      const ownerObj = d.user_id;
      const ownerId = ownerObj && typeof ownerObj === "object" ? ownerObj.id : ownerObj;
      const ownerNomePd = users[ownerId];
      const ownerRoster = ownerNomePd ? rosterIdx[normName(ownerNomePd)] : null;
      const owner = ownerRoster || ownerNomePd || "—";
      const entradaMs = new Date(String(d.add_time).replace(" ", "T").replace(/Z?$/, "Z")).getTime();
      const primeira = primeiraAtivPorDeal[d.id] || null;
      let sla_min, aguardando;
      if (primeira) {
        sla_min = Math.round((primeira - entradaMs) / 60000);
        aguardando = false;
      } else {
        sla_min = Math.round((agoraMs - entradaMs) / 60000);
        aguardando = true;
      }
      slaLeads.push({
        deal_id: d.id,
        titulo: d.title || "—",
        owner,
        entrada_iso: d.add_time,
        entrada_hm: utcToBrt(d.add_time) ? String(Math.floor(utcToBrt(d.add_time).hora)).padStart(2, "0") + ":" + String(Math.round((utcToBrt(d.add_time).hora % 1) * 60)).padStart(2, "0") : "—",
        atendimento_hm: primeira ? (() => { const b = new Date(primeira - TZ_OFFSET_H * 3600000); return String(b.getUTCHours()).padStart(2, "0") + ":" + String(b.getUTCMinutes()).padStart(2, "0"); })() : null,
        sla_min: sla_min < 0 ? 0 : sla_min,
        aguardando,
      });
    }
    // ordena por entrada (mais cedo primeiro)
    slaLeads.sort((a, b) => String(a.entrada_iso).localeCompare(String(b.entrada_iso)));
    // resumo por owner: média dos atendidos + contagem aguardando
    const slaResumo = {};
    for (const l of slaLeads) {
      const r = slaResumo[l.owner] = slaResumo[l.owner] || { atendidos: [], aguardando: 0 };
      if (l.aguardando) r.aguardando++;
      else r.atendidos.push(l.sla_min);
    }
    const slaResumoArr = Object.entries(slaResumo).map(([owner, r]) => ({
      owner,
      media_min: r.atendidos.length ? Math.round(r.atendidos.reduce((a, b) => a + b, 0) / r.atendidos.length) : null,
      atendidos: r.atendidos.length,
      aguardando: r.aguardando,
    })).sort((a, b) => a.owner.localeCompare(b.owner));

    res.json({
      dia,
      linhas,
      totais,
      sla_leads: slaLeads,
      sla_resumo: slaResumoArr,
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
    await ghPutFile(json, sha, GITHUB_FILE, "propostas orion");
    res.json({ ok: true, date, values: json[date] });
  } catch (err) {
    res.status(500).json({ erro: String(err.message || err) });
  }
});


// ── JORNADA E IMPACTO: carregar ─────────────────────────────────────
app.get("/api/jornada", async (req, res) => {
  try {
    const dia = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || "") ? req.query.date : todayBrt();
    const { json, configurado } = await ghGetFile(GITHUB_FILE_JORNADA)
      .catch(() => ({ json: {}, configurado: false }));
    const doDia = (json && json[dia]) || { expediente: {}, impactos: [] };
    res.json({
      dia,
      expediente: doDia.expediente || {},
      impactos: doDia.impactos || [],
      github_configurado: configurado,
    });
  } catch (err) {
    res.status(500).json({ erro: String(err.message || err) });
  }
});

// ── JORNADA E IMPACTO: salvar ───────────────────────────────────────
app.post("/api/jornada", async (req, res) => {
  try {
    const { date, expediente, impactos } = req.body || {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
      return res.status(400).json({ erro: "payload invalido" });
    }
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      return res.status(500).json({ erro: "GITHUB_TOKEN / GITHUB_REPO nao configurados no Vercel" });
    }
    const hora = (x) => /^\d{2}:\d{2}$/.test(String(x || "")) ? x : "";
    const expLimpo = {};
    for (const [nome, v] of Object.entries(expediente || {})) {
      expLimpo[nome] = { inicio: hora(v && v.inicio), fim: hora(v && v.fim) };
    }
    const impLimpo = (Array.isArray(impactos) ? impactos : []).map((i) => ({
      tipo: String(i.tipo || ""),
      quem: String(i.quem || ""),
      inicio: hora(i.inicio),
      fim: hora(i.fim),
    }));
    const { json, sha } = await ghGetFile(GITHUB_FILE_JORNADA);
    json[date] = { expediente: expLimpo, impactos: impLimpo };
    await ghPutFile(json, sha, GITHUB_FILE_JORNADA, "jornada orion");
    res.json({ ok: true, date });
  } catch (err) {
    res.status(500).json({ erro: String(err.message || err) });
  }
});


// ── DEBUG: leads do dia (1670292) têm atividade no 1670288? ─────────
app.get("/api/sla_debug", async (req, res) => {
  try {
    const dia = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || "") ? req.query.date : todayBrt();
    const [dealsLeads, ativGeral, users] = await Promise.all([
      fetchDealsV1(FILTER_DEALS_WON),
      fetchActivitiesV2(FILTER_ATIV_GERAL),
      fetchUsers(),
    ]);
    // leads que entraram no dia
    const leadsDoDia = dealsLeads.filter(d => utcToBrtDateStr(d.add_time) === dia);
    // index de atividades wpp/call done por deal_id
    const ativPorDeal = {};
    for (const a of ativGeral) {
      if (!(a.type === "call" || a.type === "whatsapp_chat")) continue;
      if (!(a.done === true || a.status === "done")) continue;
      const did = a.deal_id;
      if (!did) continue;
      (ativPorDeal[did] = ativPorDeal[did] || []).push(a);
    }
    let comAtividade = 0, semAtividade = 0;
    const amostra = [];
    for (const d of leadsDoDia) {
      const ats = ativPorDeal[d.id] || [];
      if (ats.length) comAtividade++; else semAtividade++;
      if (amostra.length < 8) {
        amostra.push({
          deal_id: d.id,
          add_time: d.add_time,
          entrada_brt: utcToBrtDateStr(d.add_time),
          atividades_no_1670288: ats.length,
          primeira_done: ats.length ? ats.map(a=>a.marked_as_done_time).sort()[0] : null,
        });
      }
    }
    res.json({
      dia,
      total_leads_dia: leadsDoDia.length,
      leads_com_atividade_no_1670288: comAtividade,
      leads_sem_atividade_no_1670288: semAtividade,
      amostra,
    });
  } catch (err) {
    res.status(500).json({ erro: String(err.message || err) });
  }
});

app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    versao: "2026-07-21-SLAREAL",
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
