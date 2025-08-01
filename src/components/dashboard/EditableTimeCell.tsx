import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EditableTimeCellProps {
  meetingId: string;
  currentValue: string;
  onUpdate: (newValue: string) => void;
}

export const EditableTimeCell: React.FC<EditableTimeCellProps> = ({
  meetingId,
  currentValue,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentValue || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editValue === currentValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('meeting_details')
        .update({ horario_agendamento: editValue })
        .eq('id', meetingId);

      if (error) {
        console.error('Error updating horario_agendamento:', error);
        toast({
          title: "❌ Erro ao atualizar",
          description: "Não foi possível atualizar o horário.",
          variant: "destructive",
        });
        return;
      }

      onUpdate(editValue);
      setIsEditing(false);
      toast({
        title: "✅ Atualizado com sucesso",
        description: "Horário foi atualizado.",
      });
    } catch (error) {
      console.error('Error updating horario_agendamento:', error);
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
        <Input
          type="time"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="h-8 text-sm"
          disabled={isSaving}
          autoFocus
        />
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

  return (
    <div className="flex items-center gap-2 group">
      <span className="flex-1">{currentValue || 'N/A'}</span>
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