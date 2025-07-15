
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { prepareReportsData, prepareMeetingsData } from '@/utils/exportDataUtils';

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

export const useXLSXExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToXLSX = async (reports: DailyReport[], meetings: MeetingDetail[]) => {
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
      const wb = XLSX.utils.book_new();
      
      // Aba de Detalhes das Reuniões
      const meetingsData = prepareMeetingsData(meetings, reports);
      const wsMeetings = XLSX.utils.json_to_sheet(meetingsData);
      
      // Ajustar largura das colunas para reuniões
      const meetingsColWidths = [
        { wch: 25 }, // Lead
        { wch: 12 }, // Data
        { wch: 10 }, // Horário
        { wch: 12 }, // Status
        { wch: 20 }, // SDR Responsável
        { wch: 20 }  // Vendedor Responsável
      ];
      wsMeetings['!cols'] = meetingsColWidths;
      
      XLSX.utils.book_append_sheet(wb, wsMeetings, "Detalhes das Reuniões");
      
      // Gerar arquivo
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const fileName = `reunioes_${timestamp}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: "✅ Sucesso",
        description: "Arquivo XLSX exportado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao exportar arquivo XLSX",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToXLSX, isExporting };
};
