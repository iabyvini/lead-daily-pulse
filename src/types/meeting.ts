export interface MeetingDetail {
  id: string;
  nome_lead: string;
  data_agendamento: string;
  horario_agendamento: string;
  status: string;
  vendedor_responsavel: string | null;
  report_id?: string | null;
}

export interface MeetingFormData {
  nome_lead: string;
  data_agendamento: string;
  horario_agendamento: string;
  status: string;
  vendedor_responsavel: string;
  report_id: string;
}

export const MEETING_STATUS_OPTIONS = [
  'Agendado',
  'Realizado', 
  'Cancelado',
  'Reagendado',
  'No Show'
] as const;

export type MeetingStatus = typeof MEETING_STATUS_OPTIONS[number];
