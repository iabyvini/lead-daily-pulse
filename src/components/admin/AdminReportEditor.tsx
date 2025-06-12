
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DailyReport {
  id: string;
  vendedor: string;
  data_registro: string;
  reunioes_agendadas: number;
  reunioes_realizadas: number;
  created_at: string;
}

interface AdminReportEditorProps {
  report: DailyReport;
  onReportUpdated: () => void;
}

export const AdminReportEditor: React.FC<AdminReportEditorProps> = ({ report, onReportUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReport, setEditedReport] = useState({
    reunioes_agendadas: report.reunioes_agendadas,
    reunioes_realizadas: report.reunioes_realizadas,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('daily_reports')
        .update({
          reunioes_agendadas: editedReport.reunioes_agendadas,
          reunioes_realizadas: editedReport.reunioes_realizadas,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.id);

      if (error) throw error;

      toast({
        title: "✅ Relatório atualizado",
        description: "Os dados foram salvos com sucesso.",
      });

      setIsEditing(false);
      onReportUpdated();
    } catch (error: any) {
      toast({
        title: "❌ Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedReport({
      reunioes_agendadas: report.reunioes_agendadas,
      reunioes_realizadas: report.reunioes_realizadas,
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span>{report.reunioes_agendadas}</span>
        <span>/</span>
        <span>{report.reunioes_realizadas}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-6 w-6 p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={editedReport.reunioes_agendadas}
        onChange={(e) => setEditedReport(prev => ({
          ...prev,
          reunioes_agendadas: parseInt(e.target.value) || 0
        }))}
        className="w-16 h-8 text-sm"
        min="0"
      />
      <span>/</span>
      <Input
        type="number"
        value={editedReport.reunioes_realizadas}
        onChange={(e) => setEditedReport(prev => ({
          ...prev,
          reunioes_realizadas: parseInt(e.target.value) || 0
        }))}
        className="w-16 h-8 text-sm"
        min="0"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={isLoading}
        className="h-6 w-6 p-0 text-green-600"
      >
        <Save className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        disabled={isLoading}
        className="h-6 w-6 p-0 text-red-600"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
