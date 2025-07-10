
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
    nomeVendedor: string;
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
      if (reuniao.nomeLead && typeof reuniao.nomeLead !== 'string') {
        errors.push(`Nome do lead deve ser texto na reunião ${index + 1}`);
      }
      if (reuniao.dataAgendamento && typeof reuniao.dataAgendamento !== 'string') {
        errors.push(`Data de agendamento deve ser texto na reunião ${index + 1}`);
      }
      if (reuniao.horarioAgendamento && typeof reuniao.horarioAgendamento !== 'string') {
        errors.push(`Horário de agendamento deve ser texto na reunião ${index + 1}`);
      }
      if (reuniao.status && typeof reuniao.status !== 'string') {
        errors.push(`Status deve ser texto na reunião ${index + 1}`);
      }
      if (reuniao.nomeVendedor && typeof reuniao.nomeVendedor !== 'string') {
        errors.push(`Nome do vendedor deve ser texto na reunião ${index + 1}`);
      }
    });
  }
  
  return { isValid: errors.length === 0, errors };
}

// Enhanced meeting validation function
function validateAndFilterMeetings(reunioes: any[]): any[] {
  if (!Array.isArray(reunioes)) {
    console.log('⚠️ Reuniões não é um array:', typeof reunioes);
    return [];
  }

  console.log(`🔍 Validando ${reunioes.length} reuniões recebidas...`);
  
  const validMeetings = reunioes.filter((reuniao, index) => {
    // Log each meeting for debugging
    console.log(`📋 Reunião ${index + 1}:`, JSON.stringify(reuniao, null, 2));
    
    // Check if nomeLead exists and is not empty after trimming
    const hasValidLead = reuniao.nomeLead && 
                        typeof reuniao.nomeLead === 'string' && 
                        reuniao.nomeLead.trim().length > 0;
    
    if (!hasValidLead) {
      console.log(`❌ Reunião ${index + 1} rejeitada: nome do lead inválido`);
      return false;
    }
    
    // Additional validation for required fields
    const hasValidDate = reuniao.dataAgendamento && 
                        typeof reuniao.dataAgendamento === 'string' && 
                        reuniao.dataAgendamento.trim().length > 0;
    
    const hasValidTime = reuniao.horarioAgendamento && 
                        typeof reuniao.horarioAgendamento === 'string' && 
                        reuniao.horarioAgendamento.trim().length > 0;
    
    if (!hasValidDate || !hasValidTime) {
      console.log(`⚠️ Reunião ${index + 1}: dados incompletos mas será mantida`);
    }
    
    console.log(`✅ Reunião ${index + 1} aprovada`);
    return true;
  });

  console.log(`✅ ${validMeetings.length} reuniões válidas de ${reunioes.length} total`);
  return validMeetings;
}

// Function to verify meeting details were saved
async function verifyMeetingDetailsSaved(supabase: any, reportId: string, expectedCount: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('meeting_details')
      .select('id')
      .eq('report_id', reportId);

    if (error) {
      console.error('❌ Erro ao verificar meeting_details salvos:', error);
      return false;
    }

    const actualCount = data?.length || 0;
    console.log(`🔍 Verificação: esperado ${expectedCount}, encontrado ${actualCount} meeting_details`);
    
    return actualCount === expectedCount;
  } catch (error) {
    console.error('❌ Erro na verificação de meeting_details:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Iniciando processamento de relatório');

    // Parse and validate request data
    const reportData: ReportData = await req.json();
    console.log('📊 Dados recebidos:', JSON.stringify(reportData, null, 2));

    // Validate input data
    const validation = validateReportData(reportData);
    if (!validation.isValid) {
      console.error('❌ Erros de validação:', validation.errors);
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

    // Save report to database using service role (bypasses RLS)
    console.log('💾 Salvando relatório na database...');
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
      console.error('❌ Erro ao salvar relatório:', reportError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao salvar relatório: ' + reportError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✅ Relatório salvo com ID:', reportRecord.id);

    // Process meeting details with enhanced validation and error handling
    let meetingDetailsSuccess = true;
    let meetingDetailsError = null;

    if (reportData.reunioes && reportData.reunioes.length > 0) {
      console.log(`📅 Processando ${reportData.reunioes.length} reuniões...`);
      
      // Enhanced meeting validation
      const validMeetings = validateAndFilterMeetings(reportData.reunioes);
      
      if (validMeetings.length > 0) {
        console.log(`💾 Preparando para salvar ${validMeetings.length} meeting_details...`);
        
        const meetingDetails = validMeetings.map((reuniao, index) => {
          const meetingDetail = {
            report_id: reportRecord.id,
            nome_lead: reuniao.nomeLead.trim(),
            data_agendamento: reuniao.dataAgendamento || '',
            horario_agendamento: reuniao.horarioAgendamento || '',
            status: reuniao.status || 'Agendado',
            vendedor_responsavel: reuniao.nomeVendedor ? reuniao.nomeVendedor.trim() : null,
          };
          
          console.log(`📋 Meeting detail ${index + 1}:`, JSON.stringify(meetingDetail, null, 2));
          return meetingDetail;
        });

        console.log('💾 Inserindo meeting_details na database...');
        
        try {
          const { data: meetingsData, error: meetingsError } = await supabase
            .from('meeting_details')
            .insert(meetingDetails)
            .select();

          if (meetingsError) {
            console.error('❌ Erro ao salvar meeting_details:', meetingsError);
            meetingDetailsSuccess = false;
            meetingDetailsError = meetingsError.message;
            
            // Try to insert one by one to identify problematic records
            console.log('🔄 Tentativa de inserção individual...');
            for (let i = 0; i < meetingDetails.length; i++) {
              try {
                const { error: individualError } = await supabase
                  .from('meeting_details')
                  .insert(meetingDetails[i]);
                
                if (individualError) {
                  console.error(`❌ Erro na reunião ${i + 1}:`, individualError);
                } else {
                  console.log(`✅ Reunião ${i + 1} salva individualmente`);
                }
              } catch (err) {
                console.error(`❌ Erro fatal na reunião ${i + 1}:`, err);
              }
            }
          } else {
            console.log(`✅ ${meetingsData?.length || 0} meeting_details salvos com sucesso!`);
            
            // Verify the data was actually saved
            const verificationSuccess = await verifyMeetingDetailsSaved(
              supabase, 
              reportRecord.id, 
              validMeetings.length
            );
            
            if (!verificationSuccess) {
              console.error('❌ Verificação falhou: meeting_details não foram salvos corretamente');
              meetingDetailsSuccess = false;
              meetingDetailsError = 'Verificação pós-inserção falhou';
            }
          }
        } catch (err: any) {
          console.error('❌ Erro fatal ao inserir meeting_details:', err);
          meetingDetailsSuccess = false;
          meetingDetailsError = err.message;
        }
      } else {
        console.log('⚠️ Nenhuma reunião válida encontrada após filtragem');
      }
    } else {
      console.log('ℹ️ Nenhuma reunião fornecida');
    }

    // Log audit - try but don't fail if this fails
    try {
      await supabase
        .from('submission_audit')
        .insert({
          user_email: reportData.vendedor,
          submission_data: reportData as any,
          status: meetingDetailsSuccess ? 'success' : 'partial_success',
          error_message: meetingDetailsError,
          user_agent: req.headers.get('user-agent') || 'Unknown'
        });
      console.log('✅ Auditoria registrada');
    } catch (auditError) {
      console.warn('⚠️ Falha ao registrar auditoria (não crítico):', auditError);
    }

    // Prepare email content with sanitized data
    const reunioesText = reportData.reunioes && reportData.reunioes.length > 0 
      ? reportData.reunioes
          .filter(r => r.nomeLead && r.nomeLead.trim().length > 0)
          .map(r => 
            `- ${r.nomeLead.trim()} | ${r.dataAgendamento} ${r.horarioAgendamento} | Status: ${r.status} | Responsável: ${r.nomeVendedor ? r.nomeVendedor.trim() : 'N/A'}`
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
          <p><strong>Enviado via:</strong> Sistema LigueLead</p>
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
          ${!meetingDetailsSuccess ? `<div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 10px; border-radius: 4px; margin-top: 10px;"><strong style="color: #dc2626;">⚠️ Aviso:</strong> Houve um problema ao salvar alguns detalhes das reuniões no sistema.</div>` : ''}
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Relatório gerado automaticamente pelo sistema LigueLead<br>
            Data de envio: ${new Date().toLocaleString('pt-BR')}<br>
            ID do Relatório: ${reportRecord.id}
            ${!meetingDetailsSuccess ? '<br><span style="color: #dc2626;">Status: Detalhes das reuniões parcialmente salvos</span>' : ''}
          </p>
        </div>
      </div>
    `;

    // Send email
    console.log('📧 Enviando email...');
    const emailResult = await resend.emails.send({
      from: "LigueLead <onboarding@resend.dev>",
      to: ["viniciusrodrigues@liguelead.com.br"],
      subject: `📊 Relatório Diário - ${reportData.vendedor.trim()} - ${new Date(reportData.dataRegistro).toLocaleDateString('pt-BR')}${!meetingDetailsSuccess ? ' (Detalhes Parciais)' : ''}`,
      html: emailHtml,
    });

    console.log('📧 Resultado do email:', emailResult);

    if (emailResult.error) {
      console.error('❌ Erro no Resend:', emailResult.error);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Relatório salvo com sucesso, mas houve um problema ao enviar o email',
          reportId: reportRecord.id,
          emailError: 'Erro no envio do email',
          meetingDetailsStatus: meetingDetailsSuccess ? 'success' : 'partial_failure'
        }), 
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const responseMessage = meetingDetailsSuccess 
      ? 'Relatório salvo e email enviado com sucesso!'
      : 'Relatório salvo e email enviado, mas alguns detalhes das reuniões podem não ter sido salvos corretamente.';

    console.log('✅ Processamento concluído:', responseMessage);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: responseMessage,
        reportId: reportRecord.id,
        emailId: emailResult.data?.id,
        meetingDetailsStatus: meetingDetailsSuccess ? 'success' : 'partial_failure'
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Erro fatal na função send-report-email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor: ' + error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
