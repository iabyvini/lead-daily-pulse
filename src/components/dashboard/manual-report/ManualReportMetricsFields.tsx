import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ManualReportData } from '@/types/manualReport';

interface ManualReportMetricsFieldsProps {
  formData: ManualReportData;
  onChange: (field: keyof ManualReportData, value: string) => void;
}

export const ManualReportMetricsFields: React.FC<ManualReportMetricsFieldsProps> = ({
  formData,
  onChange
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <Label htmlFor="reunioesAgendadas">Reuniões Agendadas</Label>
        <Input
          id="reunioesAgendadas"
          type="number"
          min="0"
          value={formData.reunioesAgendadas}
          onChange={(e) => onChange('reunioesAgendadas', e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="reunioesRealizadas">Reuniões Realizadas</Label>
        <Input
          id="reunioesRealizadas"
          type="number"
          min="0"
          value={formData.reunioesRealizadas}
          onChange={(e) => onChange('reunioesRealizadas', e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="ligacoesRealizadas">Ligações Realizadas</Label>
        <Input
          id="ligacoesRealizadas"
          type="number"
          min="0"
          value={formData.ligacoesRealizadas}
          onChange={(e) => onChange('ligacoesRealizadas', e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="contatosFalados">Contatos Falados</Label>
        <Input
          id="contatosFalados"
          type="number"
          min="0"
          value={formData.contatosFalados}
          onChange={(e) => onChange('contatosFalados', e.target.value)}
        />
      </div>
    </div>
  );
};