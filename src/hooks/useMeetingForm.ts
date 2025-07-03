import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { MeetingFormData } from '@/types/meeting';

export const useMeetingForm = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>({
    nome_lead: '',
    data_agendamento: '',
    horario_agendamento: '',
    status: 'Agendado',
    vendedor_responsavel: '',
    report_id: ''
  });

  const resetForm = () => {
    setFormData({
      nome_lead: '',
      data_agendamento: '',
      horario_agendamento: '',
      status: 'Agendado',
      vendedor_responsavel: '',
      report_id: ''
    });
  };

  const validateForm = () => {
    if (!formData.nome_lead || !formData.data_agendamento || !formData.horario_agendamento) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const submitForm = async () => {
    if (!validateForm()) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('meeting_details')
        .insert({
          nome_lead: formData.nome_lead,
          data_agendamento: formData.data_agendamento,
          horario_agendamento: formData.horario_agendamento,
          status: formData.status,
          vendedor_responsavel: formData.vendedor_responsavel || null,
          report_id: formData.report_id === 'none' ? null : formData.report_id || null
        });

      if (error) {
        console.error('Error adding meeting:', error);
        toast({
          title: "❌ Erro ao adicionar",
          description: "Não foi possível adicionar a reunião.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "✅ Reunião adicionada",
        description: "Nova reunião foi adicionada com sucesso.",
      });

      resetForm();
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('Error adding meeting:', error);
      toast({
        title: "❌ Erro inesperado",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    isLoading,
    resetForm,
    submitForm
  };
};