
import { format } from 'date-fns';

interface DailyReport {
  id: string;
  vendedor: string;
  data_registro: string;
  reunioes_agendadas: number;
  reunioes_realizadas: number;
  created_at: string;
}

interface MeetingDetail {
  id: string;
  nome_lead: string;
  data_agendamento: string;
  horario_agendamento: string;
  status: string;
  vendedor_responsavel: string | null;
  report_id?: string | null;
}

export const prepareReportsData = (reports: DailyReport[]) => {
  return reports.map(report => ({
    'SDR': report.vendedor,
    'Data': format(new Date(report.data_registro), 'dd/MM/yyyy'),
    'Reuniões Agendadas': report.reunioes_agendadas,
    'Reuniões Realizadas': report.reunioes_realizadas,
    'Data de Envio': format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')
  }));
};

export const prepareMeetingsData = (meetings: MeetingDetail[], reports: DailyReport[]) => {
  console.log('Preparing meetings data for export:', meetings);
  
  const getSDRFromReportId = (reportId: string | null | undefined) => {
    if (!reportId) return 'N/A';
    const report = reports.find(r => r.id === reportId);
    return report?.vendedor || 'N/A';
  };
  
  return meetings.map(meeting => {
    console.log('Processing meeting:', meeting);
    
    return {
      'Lead': meeting.nome_lead,
      'Data': format(new Date(meeting.data_agendamento + 'T12:00:00'), 'dd/MM/yyyy'),
      'Horário': meeting.horario_agendamento,
      'Status': meeting.status,
      'SDR Responsável': getSDRFromReportId(meeting.report_id),
      'Vendedor Responsável': meeting.vendedor_responsavel || 'N/A'
    };
  });
};

export const convertToCSV = (data: any[]) => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar aspas e adicionar aspas se necessário
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};
