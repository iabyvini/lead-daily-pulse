
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EditableTextCell } from './EditableTextCell';
import { EditableDateCell } from './EditableDateCell';
import { EditableTimeCell } from './EditableTimeCell';
import { EditableStatusCell } from './EditableStatusCell';
import { EditableVendorCell } from './EditableVendorCell';

interface MeetingDetail {
  id: string;
  nome_lead: string;
  data_agendamento: string;
  horario_agendamento: string;
  status: string;
  vendedor_responsavel: string;
  report_id?: string;
}

interface MeetingsTableProps {
  meetings: MeetingDetail[];
  reports: any[];
  onVendorUpdate: (meetingId: string, newVendor: string) => void;
  onMeetingUpdate: (meetingId: string, field: string, value: string) => void;
}

export const MeetingsTable: React.FC<MeetingsTableProps> = ({ meetings, reports, onVendorUpdate, onMeetingUpdate }) => {
  const getSDRFromReportId = (reportId: string | null | undefined) => {
    if (!reportId) return 'N/A';
    const report = reports.find(r => r.id === reportId);
    return report?.vendedor || 'N/A';
  };

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
                <TableHead>SDR Responsável</TableHead>
                <TableHead>Vendedor Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">
                    <EditableTextCell
                      meetingId={meeting.id}
                      currentValue={meeting.nome_lead}
                      fieldName="nome_lead"
                      fieldLabel="Nome do Lead"
                      onUpdate={(fieldName, newValue) => onMeetingUpdate(meeting.id, fieldName, newValue)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableDateCell
                      meetingId={meeting.id}
                      currentValue={meeting.data_agendamento}
                      onUpdate={(newValue) => onMeetingUpdate(meeting.id, 'data_agendamento', newValue)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableTimeCell
                      meetingId={meeting.id}
                      currentValue={meeting.horario_agendamento}
                      onUpdate={(newValue) => onMeetingUpdate(meeting.id, 'horario_agendamento', newValue)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableStatusCell
                      meetingId={meeting.id}
                      currentValue={meeting.status}
                      onUpdate={(newValue) => onMeetingUpdate(meeting.id, 'status', newValue)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-[#1bccae]">
                    {getSDRFromReportId(meeting.report_id)}
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
