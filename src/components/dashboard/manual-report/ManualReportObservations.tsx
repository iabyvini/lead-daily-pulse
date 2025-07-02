import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ManualReportData } from '@/types/manualReport';

interface ManualReportObservationsProps {
  formData: ManualReportData;
  onChange: (field: keyof ManualReportData, value: string) => void;
}

export const ManualReportObservations: React.FC<ManualReportObservationsProps> = ({
  formData,
  onChange
}) => {
  return (
    <div>
      <Label htmlFor="observacoes">Observações</Label>
      <Input
        id="observacoes"
        placeholder="Motivo da entrada manual, observações, etc..."
        value={formData.observacoes}
        onChange={(e) => onChange('observacoes', e.target.value)}
      />
    </div>
  );
};