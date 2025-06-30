
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

interface ReportsTableProps {
  reports: DailyReport[];
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ reports }) => {
  return (
    <Card className="mb-8 border-emerald-200">
      <CardHeader className="bg-gradient-to-r from-[#1bccae] to-emerald-500 text-white">
        <CardTitle>Relatórios Diários ({reports.length} registros)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {reports.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50">
                <TableHead>SDR</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Reuniões Agendadas</TableHead>
                <TableHead>Reuniões Realizadas</TableHead>
                <TableHead>Data de Envio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.vendedor}</TableCell>
                  <TableCell>{format(new Date(report.data_registro), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{report.reunioes_agendadas}</TableCell>
                  <TableCell>{report.reunioes_realizadas}</TableCell>
                  <TableCell>{format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Nenhum relatório encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
