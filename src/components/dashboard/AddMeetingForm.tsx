import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AddMeetingFormProps {
  reports: any[];
  onMeetingAdded: () => void;
}

interface MeetingFormData {
  nome_lead: string;
  data_agendamento: string;
  horario_agendamento: string;
  status: string;
  vendedor_responsavel: string;
  report_id: string;
}

export const AddMeetingForm: React.FC<AddMeetingFormProps> = ({ reports, onMeetingAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>({
    nome_lead: '',
    data_agendamento: '',
    horario_agendamento: '',
    status: 'Agendada',
    vendedor_responsavel: '',
    report_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
          report_id: formData.report_id || null
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

      // Reset form
      setFormData({
        nome_lead: '',
        data_agendamento: '',
        horario_agendamento: '',
        status: 'Agendada',
        vendedor_responsavel: '',
        report_id: ''
      });

      setIsOpen(false);
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

  const handleCancel = () => {
    setFormData({
      nome_lead: '',
      data_agendamento: '',
      horario_agendamento: '',
      status: 'Agendada',
      vendedor_responsavel: '',
      report_id: ''
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Reunião
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Reunião</DialogTitle>
          <DialogDescription>
            Adicione um novo registro de reunião ao sistema.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome_lead">Nome do Lead *</Label>
            <Input
              id="nome_lead"
              value={formData.nome_lead}
              onChange={(e) => setFormData({ ...formData, nome_lead: e.target.value })}
              placeholder="Digite o nome do lead"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="data_agendamento">Data do Agendamento *</Label>
            <Input
              id="data_agendamento"
              type="date"
              value={formData.data_agendamento}
              onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="horario_agendamento">Horário *</Label>
            <Input
              id="horario_agendamento"
              type="time"
              value={formData.horario_agendamento}
              onChange={(e) => setFormData({ ...formData, horario_agendamento: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Agendada">Agendada</SelectItem>
                <SelectItem value="Realizada">Realizada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
                <SelectItem value="Reagendada">Reagendada</SelectItem>
                <SelectItem value="No Show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="vendedor_responsavel">Vendedor Responsável</Label>
            <Input
              id="vendedor_responsavel"
              value={formData.vendedor_responsavel}
              onChange={(e) => setFormData({ ...formData, vendedor_responsavel: e.target.value })}
              placeholder="Digite o nome do vendedor"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="report_id">Relatório Origem (SDR)</Label>
            <Select 
              value={formData.report_id} 
              onValueChange={(value) => setFormData({ ...formData, report_id: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o relatório de origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum relatório específico</SelectItem>
                {reports.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.vendedor} - {new Date(report.data_registro + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Reunião'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};