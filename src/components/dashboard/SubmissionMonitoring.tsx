import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { format, subDays, isWeekend } from 'date-fns';
import ManualReportEntry from './ManualReportEntry';

interface AuditLog {
  id: string;
  user_email: string;
  submission_data: any;
  status: 'success' | 'error' | 'retry';
  error_message?: string;
  created_at: string;
}

interface MissingReport {
  sdr_name: string;
  missing_date: string;
  expected: boolean;
}

const SubmissionMonitoring = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [missingReports, setMissingReports] = useState<MissingReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuditLogs = async () => {
    const { data, error } = await supabase
      .from('submission_audit')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "❌ Erro ao carregar logs",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAuditLogs((data || []).map(log => ({
        ...log,
        status: log.status as 'success' | 'error' | 'retry'
      })));
    }
  };

  const analyzeSubmissions = async () => {
    const today = new Date();
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, i);
      return format(date, 'yyyy-MM-dd');
    }).filter(date => !isWeekend(new Date(date))); // Remove weekends

    const { data: reports, error } = await supabase
      .from('daily_reports')
      .select('vendedor, data_registro')
      .in('data_registro', past7Days);

    if (error) {
      console.error('Error analyzing submissions:', error);
      return;
    }

    const expectedSDRs = ['Nathalia', 'Taynara'];
    const missing: MissingReport[] = [];

    past7Days.forEach(date => {
      expectedSDRs.forEach(sdr => {
        const hasReport = reports?.some(r => r.vendedor === sdr && r.data_registro === date);
        if (!hasReport) {
          missing.push({
            sdr_name: sdr,
            missing_date: date,
            expected: true
          });
        }
      });
    });

    setMissingReports(missing);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAuditLogs(), analyzeSubmissions()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'retry':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      retry: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento de Submissões</h2>
          <p className="text-gray-600">Acompanhe tentativas de envio e relatórios ausentes</p>
        </div>
        <div className="flex gap-2">
          <ManualReportEntry />
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Missing Reports Alert */}
      {missingReports.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção:</strong> {missingReports.length} relatórios ausentes nos últimos 7 dias úteis.
          </AlertDescription>
        </Alert>
      )}

      {/* Missing Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Relatórios Ausentes (Últimos 7 Dias Úteis)
          </CardTitle>
          <CardDescription>
            SDRs que não enviaram relatórios nos dias esperados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {missingReports.length === 0 ? (
            <p className="text-center py-4 text-gray-500">Nenhum relatório ausente detectado!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SDR</TableHead>
                  <TableHead>Data Ausente</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missingReports.map((report, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{report.sdr_name}</TableCell>
                    <TableCell>{format(new Date(report.missing_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Contactar SDR
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            Logs de Auditoria (Últimas 50 Tentativas)
          </CardTitle>
          <CardDescription>
            Histórico detalhado de tentativas de envio de relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>SDR</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Erro</TableHead>
                <TableHead>Dados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      {getStatusBadge(log.status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{log.user_email}</TableCell>
                  <TableCell>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                  <TableCell className="max-w-xs truncate" title={log.error_message || ''}>
                    {log.error_message || '-'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionMonitoring;