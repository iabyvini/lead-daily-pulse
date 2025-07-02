import { supabase } from '@/integrations/supabase/client';

export interface SubmissionData {
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

export const logSubmissionAttempt = async (
  userEmail: string,
  submissionData: SubmissionData,
  status: 'success' | 'error' | 'retry',
  errorMessage?: string
) => {
  try {
    const { error } = await supabase
      .from('submission_audit')
      .insert({
        user_email: userEmail,
        submission_data: submissionData,
        status,
        error_message: errorMessage || null,
        user_agent: navigator.userAgent,
        ip_address: null // Will be filled by server if needed
      });

    if (error) {
      console.error('Failed to log submission attempt:', error);
    }
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

export const validateSubmissionData = (data: SubmissionData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.vendedor) errors.push('Nome do SDR é obrigatório');
  if (!data.dataRegistro) errors.push('Data do registro é obrigatória');
  if (!data.reunioesAgendadas && data.reunioesAgendadas !== 0) errors.push('Reuniões agendadas é obrigatório');
  if (!data.reunioesRealizadas && data.reunioesRealizadas !== 0) errors.push('Reuniões realizadas é obrigatório');

  // Validate meeting details if provided
  data.reunioes.forEach((reuniao, index) => {
    if (reuniao.nomeLead && !reuniao.dataAgendamento) {
      errors.push(`Reunião ${index + 1}: Data de agendamento é obrigatória quando nome do lead é preenchido`);
    }
    if (reuniao.nomeLead && !reuniao.horarioAgendamento) {
      errors.push(`Reunião ${index + 1}: Horário é obrigatório quando nome do lead é preenchido`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const checkConnectivity = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};