import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ManualReportData } from '@/types/manualReport';

interface ManualReportBasicFieldsProps {
  formData: ManualReportData;
  onChange: (field: keyof ManualReportData, value: string) => void;
}

export const ManualReportBasicFields: React.FC<ManualReportBasicFieldsProps> = ({
  formData,
  onChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="vendedor">Nome do SDR *</Label>
        <Select value={formData.vendedor} onValueChange={(value) => onChange('vendedor', value)}>
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
          onChange={(e) => onChange('dataRegistro', e.target.value)}
          required
        />
      </div>
    </div>
  );
};