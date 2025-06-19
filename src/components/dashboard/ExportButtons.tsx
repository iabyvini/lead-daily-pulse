
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

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
  vendedor_responsavel: string;
}

interface ExportButtonsProps {
  reports: DailyReport[];
  meetings: MeetingDetail[];
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ reports, meetings }) => {
  const [isExporting, setIsExporting] = useState(false);

  const prepareReportsData = () => {
    return reports.map(report => ({
      'SDR': report.vendedor,
      'Data': format(new Date(report.data_registro), 'dd/MM/yyyy'),
      'Reuniões Agendadas': report.reunioes_agendadas,
      'Reuniões Realizadas': report.reunioes_realizadas,
      'Data de Envio': format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')
    }));
  };

  const prepareMeetingsData = () => {
    return meetings.map(meeting => ({
      'Lead': meeting.nome_lead,
      'Data': format(new Date(meeting.data_agendamento), 'dd/MM/yyyy'),
      'Horário': meeting.horario_agendamento,
      'Status': meeting.status,
      'Vendedor Responsável': meeting.vendedor_responsavel || 'N/A'
    }));
  };

  const exportToXLSX = async () => {
    if (reports.length === 0 && meetings.length === 0) {
      toast({
        title: "⚠️ Aviso",
        description: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      
      // Aba de Relatórios Diários
      const reportsData = prepareReportsData();
      const wsReports = XLSX.utils.json_to_sheet(reportsData);
      
      // Ajustar largura das colunas para relatórios
      const reportsColWidths = [
        { wch: 20 }, // SDR
        { wch: 12 }, // Data
        { wch: 18 }, // Reuniões Agendadas
        { wch: 18 }, // Reuniões Realizadas
        { wch: 18 }  // Data de Envio
      ];
      wsReports['!cols'] = reportsColWidths;
      
      XLSX.utils.book_append_sheet(wb, wsReports, "Relatórios Diários");
      
      // Aba de Detalhes das Reuniões
      const meetingsData = prepareMeetingsData();
      const wsMeetings = XLSX.utils.json_to_sheet(meetingsData);
      
      // Ajustar largura das colunas para reuniões
      const meetingsColWidths = [
        { wch: 25 }, // Lead
        { wch: 12 }, // Data
        { wch: 10 }, // Horário
        { wch: 12 }, // Status
        { wch: 20 }  // Vendedor Responsável
      ];
      wsMeetings['!cols'] = meetingsColWidths;
      
      XLSX.utils.book_append_sheet(wb, wsMeetings, "Detalhes das Reuniões");
      
      // Gerar arquivo
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const fileName = `relatorios_${timestamp}.xlsx`;
      
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

  const exportToCSV = async () => {
    if (reports.length === 0 && meetings.length === 0) {
      toast({
        title: "⚠️ Aviso",
        description: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      
      // Exportar Relatórios Diários
      if (reports.length > 0) {
        const reportsData = prepareReportsData();
        const csvReports = convertToCSV(reportsData);
        const blobReports = new Blob(['\uFEFF' + csvReports], { type: 'text/csv;charset=utf-8;' });
        saveAs(blobReports, `relatorios_diarios_${timestamp}.csv`);
      }
      
      // Exportar Detalhes das Reuniões
      if (meetings.length > 0) {
        const meetingsData = prepareMeetingsData();
        const csvMeetings = convertToCSV(meetingsData);
        const blobMeetings = new Blob(['\uFEFF' + csvMeetings], { type: 'text/csv;charset=utf-8;' });
        saveAs(blobMeetings, `detalhes_reunioes_${timestamp}.csv`);
      }
      
      toast({
        title: "✅ Sucesso",
        description: "Arquivos CSV exportados com sucesso!",
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

  const convertToCSV = (data: any[]) => {
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

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportToXLSX}
        disabled={isExporting}
        variant="outline"
        className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 mr-2" />
        )}
        Exportar XLSX
      </Button>
      
      <Button
        onClick={exportToCSV}
        disabled={isExporting}
        variant="outline"
        className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Exportar CSV
      </Button>
    </div>
  );
};
