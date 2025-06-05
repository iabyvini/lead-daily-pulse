
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
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
    vendedorResponsavel: string;
  }>;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// Input validation function
function validateReportData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!data.vendedor || typeof data.vendedor !== 'string' || data.vendedor.trim().length === 0) {
    errors.push('Vendedor é obrigatório');
  }
  
  if (!data.dataRegistro || typeof data.dataRegistro !== 'string') {
    errors.push('Data de registro é obrigatória');
  }
  
  if (typeof data.reunioesAgendadas !== 'number' || data.reunioesAgendadas < 0) {
    errors.push('Reuniões agendadas deve ser um número válido');
  }
  
  if (typeof data.reunioesRealizadas !== 'number' || data.reunioesRealizadas < 0) {
    errors.push('Reuniões realizadas deve ser um número válido');
  }
  
  // Validate date format
  if (data.dataRegistro && !data.dataRegistro.match(/^\d{4}-\d{2}-\d{2}$/)) {
    errors.push('Formato de data inválido');
  }
  
  // Validate meetings array
  if (data.reunioes && Array.isArray(data.reunioes)) {
    data.reunioes.forEach((reuniao: any, index: number) => {
      if (!reuniao.nomeLead || typeof reuniao.nomeLead !== 'string' || reuniao.nomeLead.trim().length === 0) {
        errors.push(`Nome do lead é obrigatório na reunião ${index + 1}`);
      }
      if (!reuniao.dataAgendamento || typeof reuniao.dataAgendamento !== 'string') {
        errors.push(`Data de agendamento é obrigatória na reunião ${index + 1}`);
      }
      if (!reuniao.horarioAgendamento || typeof reuniao.horarioAgendamento !== 'string') {
        errors.push(`Horário de agendamento é obrigatório na reunião ${index + 1}`);
      }
      if (!reuniao.status || typeof reuniao.status !== 'string') {
        errors.push(`Status é obrigatório na reunião ${index + 1}`);
      }
      if (!reuniao.vendedorResponsavel || typeof reuniao.vendedorResponsavel !== 'string') {
        errors.push(`Vendedor responsável é obrigatório na reunião ${index + 1}`);
      }
    });
  }
  
  return { isValid: errors.length === 0, errors };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized: No authorization header' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized: Invalid token' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Authenticated user:', user.email);

    // Parse and validate request data
    const reportData: ReportData = await req.json();
    console.log('Dados recebidos:', reportData);

    // Validate input data
    const validation = validateReportData(reportData);
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dados inválidos: ' + validation.errors.join(', ')
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Save report to database with authenticated context
    const { data: reportRecord, error: reportError } = await supabase
      .from('daily_reports')
      .insert({
        vendedor: reportData.vendedor.trim(),
        data_registro: reportData.dataRegistro,
        reunioes_agendadas: reportData.reunioesAgendadas,
        reunioes_realizadas: reportData.reunioesRealizadas,
      })
      .select()
      .single();

    if (reportError) {
      console.error('Erro ao salvar relatório:', reportError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro interno do servidor' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Relatório salvo:', reportRecord);

    // Save meeting details if any
    if (reportData.reunioes && reportData.reunioes.length > 0) {
      const meetingDetails = reportData.reunioes.map(reuniao => ({
        report_id: reportRecord.id,
        nome_lead: reuniao.nomeLead.trim(),
        data_agendamento: reuniao.dataAgendamento,
        horario_agendamento: reuniao.horarioAgendamento,
        status: reuniao.status,
        vendedor_responsavel: reuniao.vendedorResponsavel.trim(),
      }));

      const { error: meetingsError } = await supabase
        .from('meeting_details')
        .insert(meetingDetails);

      if (meetingsError) {
        console.error('Erro ao salvar detalhes das reuniões:', meetingsError);
        // Don't fail the entire operation if meeting details fail
      }
    }

    // Prepare email content with sanitized data
    const reunioesText = reportData.reunioes && reportData.reunioes.length > 0 
      ? reportData.reunioes.map(r => 
          `- ${r.nomeLead.trim()} | ${r.dataAgendamento} ${r.horarioAgendamento} | Status: ${r.status} | Responsável: ${r.vendedorResponsavel.trim()}`
        ).join('\n')
      : 'Nenhuma reunião registrada.';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1bccae; border-bottom: 2px solid #1bccae; padding-bottom: 10px;">
          📊 Relatório Diário de Atividades de Vendas
        </h2>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #047857; margin-top: 0;">Informações Gerais</h3>
          <p><strong>SDR:</strong> ${reportData.vendedor.trim()}</p>
          <p><strong>Data:</strong> ${new Date(reportData.dataRegistro).toLocaleDateString('pt-BR')}</p>
          <p><strong>Enviado por:</strong> ${user.email}</p>
        </div>

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #047857; margin-top: 0;">📈 Métricas do Dia</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <p><strong>📅 Reuniões Agendadas:</strong> ${reportData.reunioesAgendadas}</p>
            <p><strong>✅ Reuniões Realizadas:</strong> ${reportData.reunioesRealizadas}</p>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #047857; margin-top: 0;">🤝 Detalhes das Reuniões</h3>
          <pre style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #1bccae; font-family: monospace; white-space: pre-wrap;">${reunioesText}</pre>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Relatório gerado automaticamente pelo sistema LigueLead<br>
            Data de envio: ${new Date().toLocaleString('pt-BR')}<br>
            ID do Relatório: ${reportRecord.id}
          </p>
        </div>
      </div>
    `;

    // Send email
    const emailResult = await resend.emails.send({
      from: "LigueLead <onboarding@resend.dev>",
      to: ["viniciusrodrigues@liguelead.com.br"],
      subject: `📊 Relatório Diário - ${reportData.vendedor.trim()} - ${new Date(reportData.dataRegistro).toLocaleDateString('pt-BR')}`,
      html: emailHtml,
    });

    console.log('Resultado do envio de email:', emailResult);

    if (emailResult.error) {
      console.error('Erro no Resend:', emailResult.error);
      // Don't fail the entire operation if email fails
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Relatório salvo com sucesso, mas houve um problema ao enviar o email',
          reportId: reportRecord.id,
          emailError: 'Erro no envio do email'
        }), 
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
        error: 'Erro interno do servidor' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
