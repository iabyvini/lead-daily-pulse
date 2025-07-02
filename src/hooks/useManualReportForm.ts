import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ManualReportData, initialFormData } from '@/types/manualReport';

export const useManualReportForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ManualReportData>(initialFormData);

  const handleChange = (field: keyof ManualReportData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const submitReport = async (): Promise<boolean> => {
    if (!formData.vendedor || !formData.dataRegistro) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Vendedor e Data do registro são obrigatórios.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Insert into daily_reports table
      const { error: reportError } = await supabase
        .from('daily_reports')
        .insert({
          vendedor: formData.vendedor,
          data_registro: formData.dataRegistro,
          reunioes_agendadas: parseInt(formData.reunioesAgendadas) || 0,
          reunioes_realizadas: parseInt(formData.reunioesRealizadas) || 0,
          ligacoes_realizadas: parseInt(formData.ligacoesRealizadas) || 0,
          contatos_falados: parseInt(formData.contatosFalados) || 0
        });

      if (reportError) {
        throw reportError;
      }

      // Log the manual entry in audit table
      try {
        await supabase
          .from('submission_audit')
          .insert({
            user_email: `admin_manual_entry_for_${formData.vendedor}`,
            submission_data: formData as any,
            status: 'success',
            error_message: `Manual entry by admin - ${formData.observacoes || 'No observations'}`,
            user_agent: navigator.userAgent
          });
      } catch (err) {
        console.warn('Failed to log manual entry audit:', err);
      }

      toast({
        title: "✅ Relatório adicionado manualmente",
        description: `Relatório para ${formData.vendedor} em ${formData.dataRegistro} foi adicionado com sucesso.`,
      });

      return true;
    } catch (error: any) {
      console.error('Error adding manual report:', error);
      toast({
        title: "❌ Erro ao adicionar relatório",
        description: error.message || "Ocorreu um erro ao adicionar o relatório manualmente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleChange,
    resetForm,
    submitReport
  };
};