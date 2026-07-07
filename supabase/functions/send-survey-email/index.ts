import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data = await req.json()
    console.log('=== EMAIL NOTIFICATION REQUEST ===', JSON.stringify(data))

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''
    
    let supabase: any = null;
    if (supabaseUrl && supabaseKey) {
        supabase = createClient(supabaseUrl, supabaseKey)
    }

    const targets: any[] = []

    // Check if it's a Supabase Database Webhook (INSERT on survey_leads)
    if (data.type === 'INSERT' && data.record) {
      const record = data.record
      const protocol = record.id ? record.id.split('-')[0].toUpperCase() : 'NO-ID'
      
      // Submitter
      if (record.email) {
        targets.push({
          to: record.email,
          protocol,
          nome: record.nome,
          grupo: record.grupo,
          fazenda: record.fazenda,
          cursos: record.cursos,
          is_submitter: true,
        })
      }

      // Admin
      if (supabase) {
        try {
          const { data: settings } = await supabase
            .from('system_settings')
            .select('notification_email')
            .limit(1)
            .single()
          
          if (settings && settings.notification_email) {
            targets.push({
              to: settings.notification_email,
              protocol,
              nome: record.nome,
              grupo: record.grupo,
              fazenda: record.fazenda,
              cursos: record.cursos,
              is_submitter: false,
            })
          }
        } catch (err) {
          console.error('Erro ao buscar system_settings:', err)
        }
      }
    } else {
      // Direct call (for backward compatibility if the frontend calls it directly)
      targets.push(data)
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const hasResend = !!(resendApiKey && resendApiKey.length > 0)

    const results = []

    for (const target of targets) {
      const { to, protocol, nome, grupo, fazenda, cursos, is_submitter } = target
      
      if (!to) continue

      console.log(`Sending email to: ${to} (Submitter: ${is_submitter})`)
      
      let subject = ''
      let html = ''

      const cursosFormatados = Array.isArray(cursos) ? cursos.join(', ') : (cursos || 'Nenhum curso especificado')

      if (is_submitter) {
        subject = `Extrato da sua solicitação de Mapeamento - Protocolo: ${protocol}`
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #f8fafc; padding: 20px; border-bottom: 1px solid #e2e8f0;">
              <h2 style="color: #0f172a; margin: 0;">Olá ${nome || 'Solicitante'},</h2>
              <p style="color: #475569; margin-top: 5px; margin-bottom: 0;">Recebemos sua solicitação com sucesso!</p>
            </div>
            <div style="padding: 20px;">
              <p>Abaixo está o resumo dos treinamentos solicitados para: <strong>${fazenda || 'Não informada'}</strong></p>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <p style="margin: 0 0 10px 0;"><strong>Protocolo:</strong> ${protocol}</p>
                <p style="margin: 0 0 10px 0;"><strong>Grupo:</strong> ${grupo || 'Não informado'}</p>
                <p style="margin: 0 0 10px 0;"><strong>Cursos Solicitados:</strong> ${cursosFormatados}</p>
              </div>
              <p style="margin-top: 20px; color: #64748b; font-size: 14px;">A equipe do Centro de Treinamento entrará em contato em breve.</p>
            </div>
          </div>
        `
      } else {
        subject = `Novo Mapeamento de Treinamento - Protocolo: ${protocol}`
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #f8fafc; padding: 20px; border-bottom: 1px solid #e2e8f0;">
              <h2 style="color: #0f172a; margin: 0;">Novo Mapeamento Recebido</h2>
            </div>
            <div style="padding: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Solicitante:</strong> ${nome || 'Não informado'}</p>
              <p style="margin: 0 0 10px 0;"><strong>Grupo:</strong> ${grupo || 'Não informado'}</p>
              <p style="margin: 0 0 10px 0;"><strong>Fazenda/Empresa:</strong> ${fazenda || 'Não informada'}</p>
              <p style="margin: 0 0 10px 0;"><strong>Protocolo:</strong> ${protocol}</p>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <p style="margin: 0 0 10px 0;"><strong>Cursos Solicitados:</strong> ${cursosFormatados}</p>
              </div>
            </div>
          </div>
        `
      }

      // Save to sent_emails table as log/fallback
      if (supabase) {
        try {
          await supabase.from('sent_emails').insert({
            to: to,
            subject,
            body: html,
            status: hasResend ? 'sent' : 'logged_only'
          })
          console.log('Registrado na tabela sent_emails')
        } catch (err: any) {
          console.error('Falha ao registrar em sent_emails:', err.message)
        }
      }

      if (hasResend) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'Centro de Treinamento ABAPA <onboarding@resend.dev>', 
              to: [to],
              subject,
              html,
            }),
          })
          
          const resData = await res.json()
          if (!res.ok) {
            console.error('Erro na API do Resend:', resData)
            throw new Error(resData.message || 'Falha ao enviar e-mail pelo Resend')
          }
          console.log('E-mail enviado com sucesso via Resend')
          results.push({ to, status: 'success' })
        } catch (err: any) {
          console.error('Falha na requisição ao Resend:', err)
          results.push({ to, status: 'error', error: err.message })
        }
      } else {
        console.log('Sem RESEND_API_KEY - E-mail apenas registrado no banco/log')
        results.push({ to, status: 'logged_only' })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Processamento de notificação de e-mail concluído',
        results
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Erro no Edge Function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    })
  }
})
