
import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { prepareReportsData, prepareMeetingsData, convertToCSV } from '@/utils/exportDataUtils';

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

export const useCSVExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToCSV = async (reports: DailyReport[], meetings: MeetingDetail[]) => {
    if (meetings.length === 0) {
      toast({
        title: "⚠️ Aviso",
        description: "Não há reuniões para exportar",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      
      // Exportar apenas Detalhes das Reuniões
      const meetingsData = prepareMeetingsData(meetings, reports);
      const csvMeetings = convertToCSV(meetingsData);
      downloadCSV(csvMeetings, `reunioes_${timestamp}.csv`);
      
      toast({
        title: "✅ Sucesso",
        description: "Arquivo CSV de reuniões exportado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao exportar arquivos CSV",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToCSV, isExporting };
};
