import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell } from '@/components/ui/table';
import { MeetingFormData, MEETING_STATUS_OPTIONS } from '@/types/meeting';

interface MeetingFormFieldsProps {
  formData: MeetingFormData;
  onFormDataChange: (data: MeetingFormData) => void;
  reports: any[];
  disabled?: boolean;
  compact?: boolean;
}

export const MeetingFormFields: React.FC<MeetingFormFieldsProps> = ({
  formData,
  onFormDataChange,
  reports,
  disabled = false,
  compact = false
}) => {
  const fieldHeight = compact ? 'h-8' : '';

  return (
    <>
      <TableCell>
        <Input
          value={formData.nome_lead}
          onChange={(e) => onFormDataChange({ ...formData, nome_lead: e.target.value })}
          placeholder="Nome do lead *"
          disabled={disabled}
          className={fieldHeight}
        />
      </TableCell>
      
      <TableCell>
        <Input
          type="date"
          value={formData.data_agendamento}
          onChange={(e) => onFormDataChange({ ...formData, data_agendamento: e.target.value })}
          disabled={disabled}
          className={fieldHeight}
        />
      </TableCell>
      
      <TableCell>
        <Input
          type="time"
          value={formData.horario_agendamento}
          onChange={(e) => onFormDataChange({ ...formData, horario_agendamento: e.target.value })}
          disabled={disabled}
          className={fieldHeight}
        />
      </TableCell>
      
      <TableCell>
        <Select 
          value={formData.status} 
          onValueChange={(value) => onFormDataChange({ ...formData, status: value })}
          disabled={disabled}
        >
          <SelectTrigger className={fieldHeight}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEETING_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell>
        <Select 
          value={formData.report_id} 
          onValueChange={(value) => onFormDataChange({ ...formData, report_id: value })}
          disabled={disabled}
        >
          <SelectTrigger className={fieldHeight}>
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
          onChange={(e) => onFormDataChange({ ...formData, vendedor_responsavel: e.target.value })}
          placeholder="Vendedor"
          disabled={disabled}
          className={fieldHeight}
        />
      </TableCell>
    </>
  );
};