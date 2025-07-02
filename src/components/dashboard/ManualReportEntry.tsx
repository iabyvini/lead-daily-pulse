import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Save } from 'lucide-react';

interface ManualReportData {
  vendedor: string;
  dataRegistro: string;
  reunioesAgendadas: string;
  reunioesRealizadas: string;
  ligacoesRealizadas: string;
  contatosFalados: string;
  observacoes: string;
}

const ManualReportEntry = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ManualReportData>({
    vendedor: '',
    dataRegistro: '',
    reunioesAgendadas: '0',
    reunioesRealizadas: '0',
    ligacoesRealizadas: '0',
    contatosFalados: '0',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendedor || !formData.dataRegistro) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Vendedor e Data do registro são obrigatórios.",
        variant: "destructive",
      });
      return;
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
      await supabase
        .from('submission_audit')
        .insert({
          user_email: `admin_manual_entry_for_${formData.vendedor}`,
          submission_data: formData,
          status: 'success',
          error_message: `Manual entry by admin - ${formData.observacoes || 'No observations'}`,
          user_agent: navigator.userAgent
        })
        .catch(err => console.warn('Failed to log manual entry audit:', err));

      toast({
        title: "✅ Relatório adicionado manualmente",
        description: `Relatório para ${formData.vendedor} em ${formData.dataRegistro} foi adicionado com sucesso.`,
      });

      // Reset form and close dialog
      setFormData({
        vendedor: '',
        dataRegistro: '',
        reunioesAgendadas: '0',
        reunioesRealizadas: '0',
        ligacoesRealizadas: '0',
        contatosFalados: '0',
        observacoes: ''
      });
      setIsOpen(false);

    } catch (error: any) {
      console.error('Error adding manual report:', error);
      toast({
        title: "❌ Erro ao adicionar relatório",
        description: error.message || "Ocorreu um erro ao adicionar o relatório manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ManualReportData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Adicionar Relatório Manualmente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Relatório Manual</DialogTitle>
          <DialogDescription>
            Use esta funcionalidade para adicionar relatórios em nome de SDRs quando necessário.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendedor">Nome do SDR *</Label>
              <Select value={formData.vendedor} onValueChange={(value) => handleChange('vendedor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um SDR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nathalia">Nathalia</SelectItem>
                  <SelectItem value="Taynara">Taynara</SelectItem>
                  <SelectItem value="Francisco">Francisco</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dataRegistro">Data do Registro *</Label>
              <Input
                id="dataRegistro"
                type="date"
                value={formData.dataRegistro}
                onChange={(e) => handleChange('dataRegistro', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="reunioesAgendadas">Reuniões Agendadas</Label>
              <Input
                id="reunioesAgendadas"
                type="number"
                min="0"
                value={formData.reunioesAgendadas}
                onChange={(e) => handleChange('reunioesAgendadas', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="reunioesRealizadas">Reuniões Realizadas</Label>
              <Input
                id="reunioesRealizadas"
                type="number"
                min="0"
                value={formData.reunioesRealizadas}
                onChange={(e) => handleChange('reunioesRealizadas', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="ligacoesRealizadas">Ligações Realizadas</Label>
              <Input
                id="ligacoesRealizadas"
                type="number"
                min="0"
                value={formData.ligacoesRealizadas}
                onChange={(e) => handleChange('ligacoesRealizadas', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="contatosFalados">Contatos Falados</Label>
              <Input
                id="contatosFalados"
                type="number"
                min="0"
                value={formData.contatosFalados}
                onChange={(e) => handleChange('contatosFalados', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Input
              id="observacoes"
              placeholder="Motivo da entrada manual, observações, etc..."
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Relatório
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualReportEntry;