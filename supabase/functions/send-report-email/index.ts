
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportData {
  vendedor: string;
  dataRegistro: string;
  reunioesAgendadas: number;
  reunioesRealizadas: number;
  reunioes: Array<{
    nomeLead: string;
    dataAgendamento: string;
    horarioAgendamento: string;
    status: string;
    vendedorResponsavel?: string;
  }>;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reportData: ReportData = await req.json();
    console.log('Dados recebidos:', reportData);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save report to database
    const { data: reportRecord, error: reportError } = await supabase
      .from('daily_reports')
      .insert({
        vendedor: reportData.vendedor,
        data_registro: reportData.dataRegistro,
        reunioes_agendadas: reportData.reunioesAgendadas,
        reunioes_realizadas: reportData.reunioesRealizadas,
      })
      .select()
      .single();

    if (reportError) {
      console.error('Erro ao salvar relatório:', reportError);
      throw new Error('Erro ao salvar relatório no banco de dados');
    }

    console.log('Relatório salvo:', reportRecord);

    // Save meeting details if any
    if (reportData.reunioes && reportData.reunioes.length > 0) {
      const meetingDetails = reportData.reunioes.map(reuniao => ({
        report_id: reportRecord.id,
        nome_lead: reuniao.nomeLead,
        data_agendamento: reuniao.dataAgendamento,
        horario_agendamento: reuniao.horarioAgendamento,
        status: reuniao.status,
        vendedor_responsavel: reuniao.vendedorResponsavel || null,
      }));

      const { error: meetingsError } = await supabase
        .from('meeting_details')
        .insert(meetingDetails);

      if (meetingsError) {
        console.error('Erro ao salvar detalhes das reuniões:', meetingsError);
      }
    }

    // Prepare email content
    const reunioesText = reportData.reunioes.length > 0 
      ? reportData.reunioes.map(r => 
          `- ${r.nomeLead} | ${r.dataAgendamento} ${r.horarioAgendamento} | Status: ${r.status} | Vendedor: ${r.vendedorResponsavel || 'Não especificado'}`
        ).join('\n')
      : 'Nenhuma reunião registrada.';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1bccae; border-bottom: 2px solid #1bccae; padding-bottom: 10px;">
          📊 Relatório Diário de Atividades de Vendas
        </h2>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #16a085; margin-top: 0;">Informações Gerais</h3>
          <p><strong>SDR:</strong> ${reportData.vendedor}</p>
          <p><strong>Data:</strong> ${new Date(reportData.dataRegistro).toLocaleDateString('pt-BR')}</p>
        </div>

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #16a085; margin-top: 0;">📈 Métricas do Dia</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <p><strong>📅 Reuniões Agendadas:</strong> ${reportData.reunioesAgendadas}</p>
            <p><strong>✅ Reuniões Realizadas:</strong> ${reportData.reunioesRealizadas}</p>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #16a085; margin-top: 0;">🤝 Detalhes das Reuniões</h3>
          <pre style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #1bccae; font-family: monospace; white-space: pre-wrap;">${reunioesText}</pre>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Relatório gerado automaticamente pelo sistema LigueLead<br>
            Data de envio: ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    `;

    // Send email
    const emailResult = await resend.emails.send({
      from: "LigueLead <onboarding@resend.dev>",
      to: ["viniciusrodrigues@liguelead.com.br"],
      subject: `📊 Relatório Diário - ${reportData.vendedor} - ${new Date(reportData.dataRegistro).toLocaleDateString('pt-BR')}`,
      html: emailHtml,
    });

    console.log('Resultado do envio de email:', emailResult);

    if (emailResult.error) {
      console.error('Erro no Resend:', emailResult.error);
      throw new Error(`Erro ao enviar email: ${emailResult.error.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Relatório salvo e email enviado com sucesso!',
        reportId: reportRecord.id,
        emailId: emailResult.data?.id
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Erro na função send-report-email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
