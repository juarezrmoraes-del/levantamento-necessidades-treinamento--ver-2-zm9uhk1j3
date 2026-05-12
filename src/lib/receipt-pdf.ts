export function generateReceiptPDF(receiptData: {
  protocol: string
  date: string
  records: any[]
}) {
  const win = window.open('', '_blank')
  if (!win) return

  const dateStr = new Date(receiptData.date).toLocaleString('pt-BR')
  const protocol = receiptData.protocol
  const firstRecord = receiptData.records[0]

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Comprovante - ${protocol}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; color: #18181b; padding: 40px; margin: 0; max-width: 800px; margin: 0 auto; }
        .header { display: flex; align-items: center; border-bottom: 2px solid #166534; padding-bottom: 20px; margin-bottom: 30px; gap: 20px; }
        .logo { width: 60px; height: 60px; background: #166534; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; text-align: center; }
        .header h1 { margin: 0; color: #18181b; font-size: 22px; }
        .header p { margin: 5px 0 0; color: #52525b; font-size: 14px; }
        .receipt-card { background: #f4f4f5; padding: 30px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e4e4e7; text-align: center; }
        .receipt-card h2 { margin: 0 0 10px; color: #166534; font-size: 22px; }
        .receipt-card p { margin: 5px 0; font-size: 15px; color: #3f3f46; }
        .protocol { font-size: 22px; font-weight: bold; color: #18181b; padding: 12px 24px; background: #fff; border-radius: 8px; display: inline-block; margin-top: 15px; border: 2px dashed #a1a1aa; font-family: monospace; letter-spacing: 1px; }
        h3.section-title { font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #27272a; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e4e4e7; }
        th { background: #fafafa; font-weight: 600; color: #52525b; width: 35%; }
        .course-card { background: #fff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .course-card h4 { margin: 0 0 12px; color: #166534; font-size: 16px; border-bottom: 1px solid #f4f4f5; padding-bottom: 8px; }
        .course-card p { margin: 6px 0; font-size: 14px; color: #3f3f46; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
          .receipt-card { border: 1px solid #d4d4d8; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #166534; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px;">Imprimir Comprovante</button>
      </div>
      
      <div class="header">
        <div class="logo">ABAPA</div>
        <div>
          <h1>Centro de Treinamento & Tecnologia / ABAPA</h1>
          <p>Comprovante Oficial de Levantamento de Necessidades de Treinamento (LNT)</p>
        </div>
      </div>

      <div class="receipt-card">
        <h2>Solicitação Finalizada com Sucesso!</h2>
        <p>Abaixo estão os detalhes da sua solicitação. Guarde este número de protocolo para referência futura.</p>
        <p style="margin-top: 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; font-weight: bold;">Número de Protocolo</p>
        <div class="protocol">${protocol}</div>
        <p style="margin-top: 20px;"><strong>Data e Hora da Solicitação:</strong> ${dateStr}</p>
      </div>

      <h3 class="section-title">Dados do Solicitante e Operação</h3>
      <table>
        <tr><th>Nome Completo</th><td>${firstRecord.nome || '-'}</td></tr>
        <tr><th>Função</th><td>${firstRecord.funcao || '-'}</td></tr>
        <tr><th>Fazenda/Grupo</th><td>${firstRecord.fazenda_grupo || '-'}</td></tr>
        <tr><th>Localização</th><td>${firstRecord.localizacao || '-'}</td></tr>
        <tr><th>Tamanho da Operação</th><td>${firstRecord.tamanho || '-'}</td></tr>
        <tr><th>Celular</th><td>${firstRecord.celular || '-'}</td></tr>
        <tr><th>E-mail</th><td>${firstRecord.email || 'Não informado'}</td></tr>
      </table>

      <h3 class="section-title">Contexto Produtivo</h3>
      <table>
        <tr><th>Cultura Foco</th><td>${firstRecord.cultura || '-'}</td></tr>
        <tr><th>Sistema da Cultura</th><td>${firstRecord.sistema || '-'}</td></tr>
        <tr><th>Principal Gargalo</th><td>${firstRecord.gargalo || '-'}</td></tr>
        <tr><th>Desafio Estratégico</th><td>${firstRecord.desafio_roi || '-'}</td></tr>
        <tr><th>Infraestrutura Local</th><td>${firstRecord.infraestrutura || '-'}</td></tr>
        <tr><th>Demanda por Inovação</th><td>${firstRecord.inovacao || '-'}</td></tr>
      </table>

      <h3 class="section-title">Treinamentos Solicitados (${receiptData.records.length})</h3>
      ${receiptData.records
        .map(
          (r, i) => `
        <div class="course-card">
          <h4>${i + 1}. ${r.curso_solicitado}</h4>
          <p><strong>Área de Foco:</strong> ${r.area_foco}</p>
          <p><strong>Quantidade de Vagas:</strong> ${r.quantidade_colaboradores} (Homens: ${r.vagas_homens || '0'} / Mulheres: ${r.vagas_mulheres || '0'})</p>
          <p><strong>Época Ideal:</strong> ${r.mes_previsto}</p>
          <p><strong>Modalidade Preferencial:</strong> ${r.local_realizacao}</p>
        </div>
      `,
        )
        .join('')}

      <div style="margin-top: 40px; text-align: center; color: #a1a1aa; font-size: 12px; padding-top: 20px; border-top: 1px solid #e4e4e7;">
        <p>Este é um documento digital gerado automaticamente pelo sistema de LNT da ABAPA.</p>
        <p>Em caso de dúvidas, entre em contato com a equipe de treinamentos.</p>
      </div>
    </body>
    </html>
  `

  win.document.write(html)
  win.document.close()
}
