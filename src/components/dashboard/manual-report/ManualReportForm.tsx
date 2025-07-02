import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { ManualReportData } from '@/types/manualReport';
import { ManualReportBasicFields } from './ManualReportBasicFields';
import { ManualReportMetricsFields } from './ManualReportMetricsFields';
import { ManualReportObservations } from './ManualReportObservations';

interface ManualReportFormProps {
  formData: ManualReportData;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof ManualReportData, value: string) => void;
  onCancel: () => void;
}

export const ManualReportForm: React.FC<ManualReportFormProps> = ({
  formData,
  isLoading,
  onSubmit,
  onChange,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ManualReportBasicFields
        formData={formData}
        onChange={onChange}
      />

      <ManualReportMetricsFields
        formData={formData}
        onChange={onChange}
      />

      <ManualReportObservations
        formData={formData}
        onChange={onChange}
      />

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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};