import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EditableStatusCellProps {
  meetingId: string;
  currentValue: string;
  onUpdate: (newValue: string) => void;
}

export const EditableStatusCell: React.FC<EditableStatusCellProps> = ({
  meetingId,
  currentValue,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentValue || '');
  const [isSaving, setIsSaving] = useState(false);

  const statusOptions = [
    'Agendado',
    'Realizado',
    'Cancelado',
    'Não compareceu'
  ];

  const handleSave = async () => {
    if (editValue === currentValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('meeting_details')
        .update({ status: editValue })
        .eq('id', meetingId);

      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "❌ Erro ao atualizar",
          description: "Não foi possível atualizar o status.",
          variant: "destructive",
        });
        return;
      }

      onUpdate(editValue);
      setIsEditing(false);
      toast({
        title: "✅ Atualizado com sucesso",
        description: "Status foi atualizado.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "❌ Erro ao atualizar",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(currentValue || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 min-w-[200px]">
        <Select value={editValue} onValueChange={setEditValue}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 w-8 p-0"
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Realizado':
        return 'bg-emerald-100 text-emerald-800';
      case 'Agendado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="flex items-center gap-2 group">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentValue)}`}>
        {currentValue}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit className="h-3 w-3 text-gray-500" />
      </Button>
    </div>
  );
};