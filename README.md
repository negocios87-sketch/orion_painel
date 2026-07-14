# Board Academy — Painel Orion · Atividades (V1)

## Estrutura
```
api/index.js        → backend (Express serverless no Vercel)
public/index.html   → frontend
vercel.json         → rewrite /api/* para a função
package.json        → dependência: express
```

## Deploy
1. Sobe tudo num repo do GitHub
2. Importa no Vercel (framework: Other)
3. Configura as env vars:

| Variável | Valor |
|---|---|
| `PIPEDRIVE_TOKEN` | token da API do Pipedrive |
| `GITHUB_TOKEN` | token com permissão **Contents: Read and write** no repo das propostas |
| `GITHUB_REPO` | `owner/repo` onde o arquivo de propostas será gravado (ex: `negocios87-sketch/gerente_comercial`) |
| `GITHUB_FILE` | (opcional) caminho do JSON — default `propostas_orion.json` |

> Token do GitHub: se for fine-grained, dar acesso só ao repo escolhido com
> permissão Contents read/write. Se for classic, escopo `repo`.

## Regras implementadas
| Coluna | Filtro | Eixo | Critério |
|---|---|---|---|
| WhatsApp | 1670288 | add_time (BRT) | done + type=whatsapp |
| Ligações | 1670288 | add_time (BRT) | done + type=call |
| Reun. Marcadas | 1670288 | add_time (BRT) | type=meeting, status independe |
| Agend. p/ o Dia | 1670288 | due_date | type=meeting, status independe |
| Realizadas | 1670289 | due_date | done + type=meeting |
| Propostas | manual | — | gravado via GitHub API por dia+pessoa |
| Fechamentos | 1670292 | won_time (BRT) | status=won, owner da deal |
| No-Show | — | — | Agendadas p/ o Dia − Realizadas (negativo aparece em vermelho) |

- Owner = `owner_id` da **atividade** (fechamentos usam owner da deal)
- Roster: URL_COLAB filtrando time=ORION + mês/ano atual (detecção de coluna
  por header; se não achar coluna de mês, mostra aviso e usa todos)
- Nomes normalizados (acento/caixa/espaço) para casar planilha × Pipedrive;
  nomes do Pipedrive fora do roster aparecem num aviso amarelo no painel
- UTC→BRT (-3h) em add_time e won_time; due_date fica como data pura
- Refresh a cada 2 min, pausado se houver edição de proposta não salva

## Endpoints
- `GET /api/dashboard?date=YYYY-MM-DD` — dados da tabela (default: hoje BRT)
- `POST /api/propostas` — `{ "date": "YYYY-MM-DD", "values": { "Nome": 3 } }`
- `GET /api/health` — checa env vars
