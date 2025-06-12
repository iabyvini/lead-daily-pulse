import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, LogOut, BarChart3, Users, Calendar, CheckCircle, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardFilters, FilterState } from '@/components/dashboard/DashboardFilters';
import { AdminReportsTable } from '@/components/admin/AdminReportsTable';

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

const Dashboard = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [meetings, setMeetings] = useState<MeetingDetail[]>([]);
  const [filteredReports, setFilteredReports] = useState<DailyReport[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<MeetingDetail[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const navigate = useNavigate();
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
      return;
    }

    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch daily reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('daily_reports')
        .select('*')
        .order('data_registro', { ascending: false });

      if (reportsError) throw reportsError;

      // Fetch meeting details
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meeting_details')
        .select('*')
        .order('data_agendamento', { ascending: false });

      if (meetingsError) throw meetingsError;

      const reportsWithData = reportsData || [];
      const meetingsWithData = meetingsData || [];

      setReports(reportsWithData);
      setMeetings(meetingsWithData);
      setFilteredReports(reportsWithData);
      setFilteredMeetings(meetingsWithData);
    } catch (error: any) {
      toast({
        title: "❌ Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleFiltersChange = (filters: FilterState) => {
    let filteredReportsData = [...reports];
    let filteredMeetingsData = [...meetings];

    // Filter by vendor
    if (filters.vendedor) {
      filteredReportsData = filteredReportsData.filter(
        report => report.vendedor === filters.vendedor
      );
      filteredMeetingsData = filteredMeetingsData.filter(
        meeting => meeting.vendedor_responsavel === filters.vendedor
      );
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filteredReportsData = filteredReportsData.filter(
        report => new Date(report.data_registro) >= startDate
      );
      filteredMeetingsData = filteredMeetingsData.filter(
        meeting => new Date(meeting.data_agendamento) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filteredReportsData = filteredReportsData.filter(
        report => new Date(report.data_registro) <= endDate
      );
      filteredMeetingsData = filteredMeetingsData.filter(
        meeting => new Date(meeting.data_agendamento) <= endDate
      );
    }

    setFilteredReports(filteredReportsData);
    setFilteredMeetings(filteredMeetingsData);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const calculateTotals = () => {
    const totalAgendadas = filteredReports.reduce((sum, report) => sum + report.reunioes_agendadas, 0);
    const totalRealizadas = filteredReports.reduce((sum, report) => sum + report.reunioes_realizadas, 0);
    const totalSDRs = new Set(filteredReports.map(report => report.vendedor)).size;
    
    return { totalAgendadas, totalRealizadas, totalSDRs };
  };

  const toggleAdminMode = () => {
    setAdminMode(!adminMode);
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1bccae]" />
      </div>
    );
  }

  const { totalAgendadas, totalRealizadas, totalSDRs } = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-[#1bccae]" />
              Dashboard de Relatórios
              {adminMode && <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">ADMIN</span>}
            </h1>
            <p className="text-gray-600 mt-1">Bem-vindo, {user?.email}</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button 
                variant={adminMode ? "destructive" : "outline"}
                onClick={toggleAdminMode}
                className={adminMode ? "" : "border-orange-500 text-orange-500 hover:bg-orange-50"}
              >
                <Settings className="h-4 w-4 mr-2" />
                {adminMode ? "Sair do Modo Admin" : "Modo Administrador"}
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-[#1bccae] text-[#1bccae] hover:bg-emerald-50"
            >
              Voltar ao Relatório
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Filters */}
        <DashboardFilters reports={reports} onFiltersChange={handleFiltersChange} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <Users className="h-8 w-8 text-[#1bccae]" />
                <div>
                  <p className="text-sm text-gray-600">SDRs Ativos</p>
                  <p className="text-2xl font-bold text-gray-800">{totalSDRs}</p>
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
        </div>

        {/* Charts */}
        <DashboardCharts reports={filteredReports} />

        {/* Reports Table */}
        {adminMode ? (
          <AdminReportsTable 
            reports={filteredReports} 
            onReportUpdated={fetchData}
          />
        ) : (
          <Card className="mb-8 border-emerald-200">
            <CardHeader className="bg-gradient-to-r from-[#1bccae] to-emerald-500 text-white">
              <CardTitle>Relatórios Diários</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                  {filteredReports.map((report) => (
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
            </CardContent>
          </Card>
        )}

        {/* Meetings Table */}
        <Card className="border-emerald-200">
          <CardHeader className="bg-gradient-to-r from-[#1bccae] to-emerald-500 text-white">
            <CardTitle>Detalhes das Reuniões</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
                {filteredMeetings.map((meeting) => (
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
                    <TableCell>{meeting.vendedor_responsavel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
