
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface DailyReport {
  id: string;
  vendedor: string;
  data_registro: string;
  reunioes_agendadas: number;
  reunioes_realizadas: number;
  created_at: string;
}

interface SDRReportsTableProps {
  reports: DailyReport[];
}

export const SDRReportsTable: React.FC<SDRReportsTableProps> = ({ reports }) => {
  return (
    <Card className="border-emerald-200">
      <CardHeader className="bg-gradient-to-r from-[#1bccae] to-emerald-500 text-white">
        <CardTitle>Seus Relatórios Diários</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-emerald-50">
              <TableHead>Data</TableHead>
              <TableHead>Reuniões Agendadas</TableHead>
              <TableHead>Reuniões Realizadas</TableHead>
              <TableHead>Data de Envio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{format(new Date(report.data_registro), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{report.reunioes_agendadas}</TableCell>
                <TableCell>{report.reunioes_realizadas}</TableCell>
                <TableCell>{format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
              </TableRow>
            ))}
            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Nenhum relatório encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
