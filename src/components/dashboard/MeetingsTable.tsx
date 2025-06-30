
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { EditableVendorCell } from './EditableVendorCell';

interface MeetingDetail {
  id: string;
  nome_lead: string;
  data_agendamento: string;
  horario_agendamento: string;
  status: string;
  vendedor_responsavel: string;
}

interface MeetingsTableProps {
  meetings: MeetingDetail[];
  onVendorUpdate: (meetingId: string, newVendor: string) => void;
}

export const MeetingsTable: React.FC<MeetingsTableProps> = ({ meetings, onVendorUpdate }) => {
  return (
    <Card className="border-emerald-200">
      <CardHeader className="bg-gradient-to-r from-[#1bccae] to-emerald-500 text-white">
        <CardTitle>Detalhes das Reuniões ({meetings.length} registros)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {meetings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50">
                <TableHead>Lead</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendedor Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">{meeting.nome_lead}</TableCell>
                  <TableCell>{format(new Date(meeting.data_agendamento), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{meeting.horario_agendamento}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      meeting.status === 'Realizado' ? 'bg-emerald-100 text-emerald-800' :
                      meeting.status === 'Agendado' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {meeting.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <EditableVendorCell
                      meetingId={meeting.id}
                      currentVendor={meeting.vendedor_responsavel || ''}
                      onUpdate={(newVendor) => onVendorUpdate(meeting.id, newVendor)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Nenhuma reunião encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
};
