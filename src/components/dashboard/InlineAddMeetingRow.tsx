import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface InlineAddMeetingRowProps {
  reports: any[];
  onMeetingAdded: () => void;
  onCancel: () => void;
}

interface MeetingFormData {
  nome_lead: string;
  data_agendamento: string;
  horario_agendamento: string;
  status: string;
  vendedor_responsavel: string;
  report_id: string;
}

export const InlineAddMeetingRow: React.FC<InlineAddMeetingRowProps> = ({ 
  reports, 
  onMeetingAdded, 
  onCancel 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>({
    nome_lead: '',
    data_agendamento: '',
    horario_agendamento: '',
    status: 'Agendada',
    vendedor_responsavel: '',
    report_id: ''
  });

  const handleSubmit = async () => {
    if (!formData.nome_lead || !formData.data_agendamento || !formData.horario_agendamento) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

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
        return;
      }

      toast({
        title: "✅ Reunião adicionada",
        description: "Nova reunião foi adicionada com sucesso.",
      });

      onMeetingAdded();
    } catch (error) {
      console.error('Error adding meeting:', error);
      toast({
        title: "❌ Erro inesperado",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TableRow className="bg-blue-50/50 border-blue-200">
      <TableCell>
        <Input
          value={formData.nome_lead}
          onChange={(e) => setFormData({ ...formData, nome_lead: e.target.value })}
          placeholder="Nome do lead *"
          disabled={isLoading}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Input
          type="date"
          value={formData.data_agendamento}
          onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
          disabled={isLoading}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Input
          type="time"
          value={formData.horario_agendamento}
          onChange={(e) => setFormData({ ...formData, horario_agendamento: e.target.value })}
          disabled={isLoading}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Select 
          value={formData.status} 
          onValueChange={(value) => setFormData({ ...formData, status: value })}
          disabled={isLoading}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Agendada">Agendada</SelectItem>
            <SelectItem value="Realizada">Realizada</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
            <SelectItem value="Reagendada">Reagendada</SelectItem>
            <SelectItem value="No Show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select 
          value={formData.report_id} 
          onValueChange={(value) => setFormData({ ...formData, report_id: value })}
          disabled={isLoading}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="SDR" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum SDR</SelectItem>
            {reports.map((report) => (
              <SelectItem key={report.id} value={report.id}>
                {report.vendedor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          value={formData.vendedor_responsavel}
          onChange={(e) => setFormData({ ...formData, vendedor_responsavel: e.target.value })}
          placeholder="Vendedor"
          disabled={isLoading}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={isLoading}
            className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};