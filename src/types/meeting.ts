export interface MeetingDetail {
  id: string;
  nome_lead: string;
  data_agendamento: string;
  horario_agendamento: string;
  status: string;
  vendedor_responsavel: string;
  report_id?: string;
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
  'Agendada',
  'Realizada', 
  'Cancelada',
  'Reagendada',
  'No Show'
] as const;

export type MeetingStatus = typeof MEETING_STATUS_OPTIONS[number];