
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Iniciando recuperação de meeting_details perdidos...');

    // Get all reports that might be missing meeting_details
    const { data: reports, error: reportsError } = await supabase
      .from('daily_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (reportsError) {
      throw new Error(`Erro ao buscar relatórios: ${reportsError.message}`);
    }

    console.log(`📊 Encontrados ${reports?.length || 0} relatórios`);

    const recoveryResults = [];

    for (const report of reports || []) {
      // Check if this report has meeting_details
      const { data: existingMeetings, error: meetingsError } = await supabase
        .from('meeting_details')
        .select('id')
        .eq('report_id', report.id);

      if (meetingsError) {
        console.error(`❌ Erro ao verificar meeting_details para relatório ${report.id}:`, meetingsError);
        continue;
      }

      const meetingCount = existingMeetings?.length || 0;
      console.log(`📋 Relatório ${report.id} (${report.vendedor} - ${report.data_registro}): ${meetingCount} meeting_details`);

      // If no meeting_details found, check audit data
      if (meetingCount === 0) {
        const { data: auditData, error: auditError } = await supabase
          .from('submission_audit')
          .select('submission_data')
          .eq('user_email', report.vendedor)
          .gte('created_at', report.created_at)
          .lte('created_at', new Date(new Date(report.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(1);

        if (auditError) {
          console.error(`❌ Erro ao buscar dados de auditoria:`, auditError);
          continue;
        }

        if (auditData && auditData.length > 0) {
          const submissionData = auditData[0].submission_data as any;
          console.log(`🔍 Dados de auditoria encontrados para ${report.vendedor}:`, JSON.stringify(submissionData, null, 2));

          if (submissionData.reunioes && Array.isArray(submissionData.reunioes)) {
            const validMeetings = submissionData.reunioes.filter((reuniao: any) => 
              reuniao.nomeLead && 
              typeof reuniao.nomeLead === 'string' && 
              reuniao.nomeLead.trim().length > 0
            );

            console.log(`📅 Encontradas ${validMeetings.length} reuniões válidas nos dados de auditoria`);

            if (validMeetings.length > 0) {
              const meetingDetails = validMeetings.map((reuniao: any) => ({
                report_id: report.id,
                nome_lead: reuniao.nomeLead.trim(),
                data_agendamento: reuniao.dataAgendamento || '',
                horario_agendamento: reuniao.horarioAgendamento || '',
                status: reuniao.status || 'Agendado',
                vendedor_responsavel: reuniao.nomeVendedor ? reuniao.nomeVendedor.trim() : null,
              }));

              console.log(`💾 Tentando recuperar ${meetingDetails.length} meeting_details...`);

              const { data: recoveredMeetings, error: recoveryError } = await supabase
                .from('meeting_details')
                .insert(meetingDetails)
                .select();

              if (recoveryError) {
                console.error(`❌ Erro ao recuperar meeting_details:`, recoveryError);
                recoveryResults.push({
                  reportId: report.id,
                  vendedor: report.vendedor,
                  data: report.data_registro,
                  status: 'error',
                  error: recoveryError.message,
                  expectedMeetings: validMeetings.length,
                  recoveredMeetings: 0
                });
              } else {
                console.log(`✅ ${recoveredMeetings?.length || 0} meeting_details recuperados com sucesso!`);
                recoveryResults.push({
                  reportId: report.id,
                  vendedor: report.vendedor,
                  data: report.data_registro,
                  status: 'success',
                  expectedMeetings: validMeetings.length,
                  recoveredMeetings: recoveredMeetings?.length || 0
                });
              }
            }
          }
        }
      }
    }

    console.log('🎯 Recuperação concluída:', recoveryResults);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Processo de recuperação concluído',
        results: recoveryResults
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Erro na recuperação:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
