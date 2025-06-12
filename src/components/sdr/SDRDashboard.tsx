
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Calendar, CheckCircle, BarChart3, Users, RefreshCw } from 'lucide-react';
import { SDRSelector } from './SDRSelector';
import { useToast } from '@/hooks/use-toast';

interface DailyReport {
  id: string;
  vendedor: string;
  data_registro: string;
  reunioes_agendadas: number;
  reunioes_realizadas: number;
  created_at: string;
}

interface MeetingDetail {
  id: string;
  nome_lead: string;
  data_agendamento: string;
  horario_agendamento: string;
  status: string;
  vendedor_responsavel: string;
}

export const SDRDashboard: React.FC = () => {
  const [selectedSDR, setSelectedSDR] = useState<string>('');
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [meetings, setMeetings] = useState<MeetingDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedSDR) {
      fetchSDRData(selectedSDR);
    }
  }, [selectedSDR]);

  const fetchSDRData = async (sdrName: string, showRefreshMessage = false) => {
    setLoading(true);
    if (showRefreshMessage) {
      setRefreshing(true);
    }
    
    try {
      console.log('Fetching data for SDR:', sdrName);
      
      // Fetch reports for the selected SDR with no cache
      const { data: reportsData, error: reportsError } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('vendedor', sdrName)
        .order('data_registro', { ascending: false });

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
        throw reportsError;
      }

      console.log('Reports data fetched:', reportsData);

      // Fetch meetings for the selected SDR
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meeting_details')
        .select('*')
        .eq('vendedor_responsavel', sdrName)
        .order('data_agendamento', { ascending: false });

      if (meetingsError) {
        console.error('Error fetching meetings:', meetingsError);
        throw meetingsError;
      }

      setReports(reportsData || []);
      setMeetings(meetingsData || []);
      
      if (showRefreshMessage) {
        toast({
          title: "Dados atualizados",
          description: "Os relatórios foram atualizados com sucesso.",
        });
      }
    } catch (error) {
      console.error('Error fetching SDR data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar os dados do SDR.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (selectedSDR) {
      fetchSDRData(selectedSDR, true);
    }
  };

  const calculateTotals = () => {
    const totalAgendadas = reports.reduce((sum, report) => sum + report.reunioes_agendadas, 0);
    const totalRealizadas = reports.reduce((sum, report) => sum + report.reunioes_realizadas, 0);
    const totalDias = reports.length;
    
    return { totalAgendadas, totalRealizadas, totalDias };
  };

  if (!selectedSDR) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <Users className="h-16 w-16 text-[#1bccae] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Relatórios SDR</h2>
          <p className="text-gray-600 mb-6">Selecione um SDR para visualizar seus relatórios</p>
        </div>
        <SDRSelector onSDRSelect={setSelectedSDR} selectedSDR={selectedSDR} />
      </div>
    );
  }

  const { totalAgendadas, totalRealizadas, totalDias } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header with SDR selector and refresh button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-[#1bccae]" />
            Relatórios de {selectedSDR}
          </h2>
          <p className="text-gray-600">Acompanhe seu desempenho e histórico de atividades</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-[#1bccae] text-[#1bccae] hover:bg-emerald-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <SDRSelector onSDRSelect={setSelectedSDR} selectedSDR={selectedSDR} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1bccae]"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-[#1bccae]" />
                  <div>
                    <p className="text-sm text-gray-600">Reuniões Agendadas</p>
                    <p className="text-2xl font-bold text-gray-800">{totalAgendadas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-[#1bccae]" />
                  <div>
                    <p className="text-sm text-gray-600">Reuniões Realizadas</p>
                    <p className="text-2xl font-bold text-gray-800">{totalRealizadas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-[#1bccae]" />
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Conversão</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalAgendadas > 0 ? Math.round((totalRealizadas / totalAgendadas) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-[#1bccae]" />
                  <div>
                    <p className="text-sm text-gray-600">Dias Trabalhados</p>
                    <p className="text-2xl font-bold text-gray-800">{totalDias}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="reports" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reports">Relatórios Diários</TabsTrigger>
              <TabsTrigger value="meetings">Detalhes das Reuniões</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="meetings" className="space-y-4">
              <Card className="border-emerald-200">
                <CardHeader className="bg-gradient-to-r from-[#1bccae] to-emerald-500 text-white">
                  <CardTitle>Suas Reuniões</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50">
                        <TableHead>Lead</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead>Status</TableHead>
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
                        </TableRow>
                      ))}
                      {meetings.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            Nenhuma reunião encontrada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
