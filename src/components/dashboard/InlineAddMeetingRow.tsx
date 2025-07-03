import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';
import { useMeetingForm } from '@/hooks/useMeetingForm';
import { MeetingFormFields } from './MeetingFormFields';

interface InlineAddMeetingRowProps {
  reports: any[];
  onMeetingAdded: () => void;
  onCancel: () => void;
}

export const InlineAddMeetingRow: React.FC<InlineAddMeetingRowProps> = ({ 
  reports, 
  onMeetingAdded, 
  onCancel 
}) => {
  const { formData, setFormData, isLoading, submitForm } = useMeetingForm(() => {
    onMeetingAdded();
  });

  const handleSubmit = async () => {
    const success = await submitForm();
    // O callback onMeetingAdded já é chamado no hook
  };

  return (
    <TableRow className="bg-blue-50/50 border-blue-200">
      <MeetingFormFields
        formData={formData}
        onFormDataChange={setFormData}
        reports={reports}
        disabled={isLoading}
        compact={true}
      />
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