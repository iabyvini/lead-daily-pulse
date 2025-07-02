import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { useManualReportForm } from '@/hooks/useManualReportForm';
import { ManualReportForm } from './manual-report/ManualReportForm';

const ManualReportEntry = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, isLoading, handleChange, resetForm, submitReport } = useManualReportForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitReport();
    if (success) {
      resetForm();
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
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
        
        <ManualReportForm
          formData={formData}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ManualReportEntry;