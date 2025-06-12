
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SDRReportFormProps {
  vendedor: string;
  onReportSubmitted: () => void;
}

export const SDRReportForm: React.FC<SDRReportFormProps> = ({ vendedor, onReportSubmitted }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [reunioesAgendadas, setReunioesAgendadas] = useState<number>(0);
  const [reunioesRealizadas, setReunioesRealizadas] = useState<number>(0);
  const [ligacoesRealizadas, setLigacoesRealizadas] = useState<number>(0);
  const [contatosFalados, setContatosFalados] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('daily_reports')
        .insert({
          vendedor,
          data_registro: format(date, 'yyyy-MM-dd'),
          reunioes_agendadas: reunioesAgendadas,
          reunioes_realizadas: reunioesRealizadas,
          ligacoes_realizadas: ligacoesRealizadas,
          contatos_falados: contatosFalados,
        });

      if (error) throw error;

      toast({
        title: "Relatório enviado!",
        description: "Seu relatório diário foi registrado com sucesso.",
      });

      // Reset form
      setReunioesAgendadas(0);
      setReunioesRealizadas(0);
      setLigacoesRealizadas(0);
      setContatosFalados(0);
      setDate(new Date());
      
      onReportSubmitted();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar relatório",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-emerald-200">
      <CardHeader className="bg-gradient-to-r from-[#1bccae] to-emerald-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Novo Relatório Diário - {vendedor}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">Data do Relatório</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reunioes_agendadas">Reuniões Agendadas</Label>
              <Input
                id="reunioes_agendadas"
                type="number"
                min="0"
                value={reunioesAgendadas}
                onChange={(e) => setReunioesAgendadas(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reunioes_realizadas">Reuniões Realizadas</Label>
              <Input
                id="reunioes_realizadas"
                type="number"
                min="0"
                value={reunioesRealizadas}
                onChange={(e) => setReunioesRealizadas(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ligacoes_realizadas">Ligações Realizadas</Label>
              <Input
                id="ligacoes_realizadas"
                type="number"
                min="0"
                value={ligacoesRealizadas}
                onChange={(e) => setLigacoesRealizadas(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contatos_falados">Contatos Falados</Label>
              <Input
                id="contatos_falados"
                type="number"
                min="0"
                value={contatosFalados}
                onChange={(e) => setContatosFalados(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#1bccae] hover:bg-emerald-600 text-white"
          >
            {isSubmitting ? "Enviando..." : "Enviar Relatório"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
