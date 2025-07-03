
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import { useXLSXExport } from '@/hooks/useXLSXExport';
import { useCSVExport } from '@/hooks/useCSVExport';

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

interface ExportButtonsProps {
  reports: DailyReport[];
  meetings: MeetingDetail[];
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ reports, meetings }) => {
  const { exportToXLSX, isExporting: isExportingXLSX } = useXLSXExport();
  const { exportToCSV, isExporting: isExportingCSV } = useCSVExport();

  const isExporting = isExportingXLSX || isExportingCSV;

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => exportToXLSX(reports, meetings)}
        disabled={isExporting}
        variant="outline"
        className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
      >
        {isExportingXLSX ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 mr-2" />
        )}
        Exportar XLSX
      </Button>
      
      <Button
        onClick={() => exportToCSV(reports, meetings)}
        disabled={isExporting}
        variant="outline"
        className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
      >
        {isExportingCSV ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Exportar CSV
      </Button>
    </div>
  );
};
