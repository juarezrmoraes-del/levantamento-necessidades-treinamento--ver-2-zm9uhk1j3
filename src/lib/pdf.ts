import { SurveyRecord } from '@/stores/main'
import { DateRange } from 'react-day-picker'

export function generatePDF(data: SurveyRecord[], dateRange?: DateRange) {
  const win = window.open('', '_blank')
  if (!win) return

  const dateStr = dateRange?.from
    ? `${dateRange.from.toLocaleDateString('pt-BR')} até ${dateRange.to ? dateRange.to.toLocaleDateString('pt-BR') : 'Hoje'}`
    : 'Todo o período'

  const areaCounts = data.reduce(
    (acc, curr) => {
      acc[curr.area_foco] = (acc[curr.area_foco] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const farmCounts = data.reduce(
    (acc, curr) => {
      acc[curr.fazenda_grupo] = (acc[curr.fazenda_grupo] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relatório LNT - ABAPA</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; color: #18181b; padding: 40px; margin: 0; }
        .header { display: flex; align-items: center; border-bottom: 2px solid #166534; padding-bottom: 20px; margin-bottom: 30px; gap: 20px; }
        .logo { width: 60px; height: 60px; background: #166534; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; text-align: center; }
        .header h1 { margin: 0; color: #18181b; font-size: 22px; }
        .header h2 { margin: 4px 0 0; color: #166534; font-size: 16px; border: none; padding: 0; }
        .header p { margin: 5px 0 0; color: #52525b; font-size: 13px; }
        .summary { display: flex; gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f4f4f5; padding: 15px 20px; border-radius: 8px; flex: 1; border-left: 4px solid #166534; }
        .summary-card h3 { margin: 0 0 10px; font-size: 12px; text-transform: uppercase; color: #71717a; }
        .summary-card p { margin: 0; font-size: 24px; font-weight: bold; color: #18181b; }
        h3.section-title { font-size: 16px; margin-top: 30px; margin-bottom: 15px; color: #27272a; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e4e4e7; }
        th { background: #f4f4f5; font-weight: 600; color: #52525b; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #166534; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Imprimir Relatório</button>
      </div>
      
      <div class="header">
        <div class="logo">ABAPA</div>
        <div>
          <h1>Centro de Treinamento & Tecnologia / ABAPA</h1>
          <h2>Relatório Consolidado de Treinamentos (LNT)</h2>
          <p>Filtro de Data: ${dateStr} &nbsp;|&nbsp; Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div class="summary">
        <div class="summary-card">
          <h3>Total de Solicitações</h3>
          <p>${data.length}</p>
        </div>
        <div class="summary-card" style="border-left-color: #0ea5e9;">
          <h3>Fazendas / Grupos Distintos</h3>
          <p>${Object.keys(farmCounts).length}</p>
        </div>
        <div class="summary-card" style="border-left-color: #f59e0b;">
          <h3>Áreas Demandadas</h3>
          <p>${Object.keys(areaCounts).length}</p>
        </div>
      </div>

      <div style="display: flex; gap: 40px;">
        <div style="flex: 1;">
          <h3 class="section-title">Demandas por Área</h3>
          <table>
            <tr><th>Área de Foco</th><th>Volume</th></tr>
            ${Object.entries(areaCounts)
              .sort((a, b) => b[1] - a[1])
              .map(
                ([area, count]) => `
              <tr><td>${area}</td><td>${count}</td></tr>
            `,
              )
              .join('')}
          </table>
        </div>
        <div style="flex: 1;">
          <h3 class="section-title">Demandas por Fazenda/Grupo</h3>
          <table>
            <tr><th>Fazenda/Grupo</th><th>Volume</th></tr>
            ${Object.entries(farmCounts)
              .sort((a, b) => b[1] - a[1])
              .map(
                ([farm, count]) => `
              <tr><td>${farm}</td><td>${count}</td></tr>
            `,
              )
              .join('')}
          </table>
        </div>
      </div>

      <h3 class="section-title">Lista de Solicitações Detalhada</h3>
      <div style="overflow-x: auto;">
        <table style="min-width: 1600px;">
          <tr>
            <th>Data</th>
            <th>Protocolo</th>
            <th>Solicitante</th>
            <th>Contato</th>
            <th>Função</th>
            <th>Fazenda/Grupo</th>
            <th>Local / Tamanho</th>
            <th>Cultura / Sistema</th>
            <th>Gargalo</th>
            <th>Área</th>
            <th>Curso Solicitado</th>
            <th>Marcas / Fabricantes</th>
            <th>Vagas (H/M)</th>
            <th>Modalidade / Época</th>
            <th>Infraestrutura</th>
            <th>Desafio / Inovação</th>
            <th>Status</th>
          </tr>
          ${data
            .map(
              (s: any) => `
            <tr>
              <td>${new Date(s.created_at || s.date || new Date()).toLocaleDateString('pt-BR')}</td>
              <td>${s.protocol || '-'}</td>
              <td>${s.nome || '-'}<br/><small>${s.email || '-'}</small></td>
              <td>${s.celular || '-'}</td>
              <td>${s.funcao || '-'}</td>
              <td>${s.fazenda_grupo || '-'}</td>
              <td>${s.localizacao || '-'}<br/>${s.tamanho || '-'}</td>
              <td>${s.cultura || '-'}<br/>${s.sistema || '-'}</td>
              <td>${s.gargalo || '-'}</td>
              <td>${s.area_foco || '-'}</td>
              <td>${s.curso_solicitado || '-'}</td>
              <td>${s.marcas || s.detalhes_cursos?.marcas || '-'}<br/>${s.fabricantes || s.detalhes_cursos?.fabricantes || '-'}</td>
              <td>${s.quantidade_colaboradores || '-'} (H:${s.vagas_homens || '0'} M:${s.vagas_mulheres || '0'})</td>
              <td>${s.local_realizacao || '-'}<br/>${s.mes_previsto || '-'}</td>
              <td>${s.infraestrutura || '-'}</td>
              <td>${s.desafio_roi || '-'}<br/>${s.inovacao || '-'}</td>
              <td>${s.status || '-'}</td>
            </tr>
          `,
            )
            .join('')}
        </table>
      </div>
    </body>
    </html>
  `

  win.document.write(html)
  win.document.close()
}

export function generateHRBatchPDF(data: SurveyRecord[], dateRange?: DateRange) {
  const win = window.open('', '_blank')
  if (!win) return

  const dateStr = dateRange?.from
    ? `${dateRange.from.toLocaleDateString('pt-BR')} até ${dateRange.to ? dateRange.to.toLocaleDateString('pt-BR') : 'Hoje'}`
    : 'Todo o período'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Exportação RH - Comprovantes LNT</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; color: #18181b; padding: 40px; margin: 0; }
        .header { text-align: center; border-bottom: 2px solid #166534; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #166534; font-size: 24px; }
        .header p { margin: 5px 0 0; color: #52525b; font-size: 14px; }
        .record { page-break-inside: avoid; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .record-header { display: flex; justify-content: space-between; border-bottom: 1px solid #e4e4e7; padding-bottom: 10px; margin-bottom: 10px; }
        .protocol { font-family: monospace; font-size: 16px; font-weight: bold; color: #18181b; }
        .date { color: #52525b; font-size: 14px; }
        .detail-row { display: flex; margin-bottom: 8px; font-size: 14px; }
        .detail-label { width: 150px; font-weight: 600; color: #52525b; }
        .detail-value { flex: 1; color: #18181b; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #166534; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Imprimir / Salvar PDF</button>
      </div>
      <div class="header">
        <h1>LNT - Exportação em Lote (RH)</h1>
        <p>Período: ${dateStr} | Total de Registros: ${data.length}</p>
      </div>
      ${data
        .map(
          (s: any) => `
        <div class="record">
          <div class="record-header">
            <span class="protocol">Protocolo: ${s.protocol || s.id}</span>
            <span class="date">Data Req: ${new Date(s.created_at || s.date || new Date()).toLocaleString('pt-BR')}</span>
          </div>
          <div class="detail-row"><div class="detail-label">Solicitante:</div><div class="detail-value">${s.nome}</div></div>
          <div class="detail-row"><div class="detail-label">Email:</div><div class="detail-value">${s.email}</div></div>
          <div class="detail-row"><div class="detail-label">Fazenda/Grupo:</div><div class="detail-value">${s.fazenda_grupo}</div></div>
          <div class="detail-row"><div class="detail-label">Função:</div><div class="detail-value">${s.funcao || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Localização:</div><div class="detail-value">${s.localizacao || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Tamanho:</div><div class="detail-value">${s.tamanho || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Celular:</div><div class="detail-value">${s.celular || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Cultura/Sistema:</div><div class="detail-value">${s.cultura || '-'} / ${s.sistema || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Gargalo:</div><div class="detail-value">${s.gargalo || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Área de Foco:</div><div class="detail-value">${s.area_foco}</div></div>
          <div class="detail-row"><div class="detail-label">Curso Solicitado:</div><div class="detail-value">${s.curso_solicitado} (${s.quantidade_colaboradores} vagas - ${s.vagas_homens || '0'} Homens / ${s.vagas_mulheres || '0'} Mulheres)</div></div>
          <div class="detail-row"><div class="detail-label">Marcas:</div><div class="detail-value">${s.marcas || s.detalhes_cursos?.marcas || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Fabricantes:</div><div class="detail-value">${s.fabricantes || s.detalhes_cursos?.fabricantes || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Modalidade:</div><div class="detail-value">${s.local_realizacao || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Época:</div><div class="detail-value">${s.mes_previsto || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Infraestrutura:</div><div class="detail-value">${s.infraestrutura || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Desafio Estratégico:</div><div class="detail-value">${s.desafio_roi || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Inovação:</div><div class="detail-value">${s.inovacao || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Sugestão Futura:</div><div class="detail-value">${s.sugestao_futura || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">Status LNT:</div><div class="detail-value">${s.status} ${s.data_agendada ? `(Agendado para: ${new Date(s.data_agendada).toLocaleString('pt-BR')})` : ''}</div></div>
        </div>
      `,
        )
        .join('')}
    </body>
    </html>
  `

  win.document.write(html)
  win.document.close()
}
