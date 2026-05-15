import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

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
    const {
      to,
      protocol,
      nome,
      fazenda,
      cursos,
      vagas,
      vagas_homens,
      vagas_mulheres,
      is_submitter,
    } = data

    console.log('=== EMAIL NOTIFICATION ===')
    console.log(`To: ${to}`)
    if (is_submitter) {
      console.log(`Subject: Extrato da sua solicitação de Mapeamento - Protocolo: ${protocol}`)
      console.log(`Olá ${nome}, recebemos sua solicitação com sucesso!`)
      console.log(`Abaixo está o resumo dos treinamentos solicitados para: ${fazenda}`)
    } else {
      console.log(`Subject: Novo Mapeamento de Treinamento - Protocolo: ${protocol}`)
      console.log(`Solicitante: ${nome}`)
      console.log(`Fazenda/Empresa: ${fazenda}`)
    }
    console.log(`Cursos Solicitados:`, cursos)
    console.log(`Vagas Mapeadas:`, vagas)
    console.log(`Vagas Homens:`, vagas_homens)
    console.log(`Vagas Mulheres:`, vagas_mulheres)
    console.log('==========================')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notificação de email processada com sucesso',
        protocol,
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    })
  }
})
