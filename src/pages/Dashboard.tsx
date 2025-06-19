
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, LogOut, BarChart3, Users, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard: useEffect triggered', { 
      loading, 
      user: !!user, 
      isAdmin,
      userEmail: user?.email 
    });

    // Se ainda está carregando, não fazer nada
    if (loading) {
      console.log('Dashboard: Still loading auth state, waiting...');
      return;
    }

    // Se não há usuário logado, redirecionar para auth
    if (!user) {
      console.log('Dashboard: No user found, redirecting to auth');
      navigate('/auth');
      return;
    }

    // Se há usuário mas não é admin, redirecionar para auth
    if (!isAdmin) {
      console.log('Dashboard: User is not admin, redirecting to auth');
      toast({
        title: "❌ Acesso negado",
        description: "Você precisa ser administrador para acessar o dashboard.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Se chegou até aqui, usuário está logado e é admin
    console.log('Dashboard: User authenticated and is admin, fetching data');
    fetchData();
  }, [user, isAdmin, loading, navigate]);

  const fetchData = async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      console.log('Dashboard: Starting to fetch data...');
      
      // Fetch daily reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('daily_reports')
        .select('*')
        .order('data_registro', { ascending: false });

      if (reportsError) {
        console.error('Dashboard: Reports error:', reportsError);
        throw reportsError;
      }

      // Fetch meeting details
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meeting_details')
        .select('*')
        .order('data_agendamento', { ascending: false });

      if (meetingsError) {
        console.error('Dashboard: Meetings error:', meetingsError);
        throw meetingsError;
      }

      const reportsWithData = reportsData || [];
      const meetingsWithData = meetingsData || [];

      console.log('Dashboard: Data fetched successfully', {
        reports: reportsWithData.length,
        meetings: meetingsWithData.length
      });

      setReports(reportsWithData);
      setMeetings(meetingsWithData);
    } catch (error: any) {
      console.error('Dashboard: Error fetching data:', error);
      setError(error.message);
      toast({
        title: "❌ Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    console.log('Dashboard: Signing out user');
    await signOut();
    navigate('/');
  };

  const calculateTotals = () => {
    const totalAgendadas = reports.reduce((sum, report) => sum + report.reunioes_agendadas, 0);
    const totalRealizadas = reports.reduce((sum, report) => sum + report.reunioes_realizadas, 0);
    const totalSDRs = new Set(reports.map(report => report.vendedor)).size;
    
    return { totalAgendadas, totalRealizadas, totalSDRs };
  };

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    console.log('Dashboard: Showing auth loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1bccae] mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário ou não é admin, não mostrar nada (redirecionamento já foi feito)
  if (!user || !isAdmin) {
    console.log('Dashboard: No user or not admin, showing empty state');
    return null;
  }

  // Mostrar loading dos dados
  if (isLoadingData) {
    console.log('Dashboard: Showing data loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1bccae] mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  // Se há erro, mostrar mensagem de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro: {error}</p>
          <Button onClick={fetchData} className="bg-[#1bccae] hover:bg-emerald-600">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  console.log('Dashboard: Rendering dashboard content');
  const { totalAgendadas, totalRealizadas, totalSDRs } = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-[#1bccae]" />
              Dashboard de Relatórios (Versão Simplificada)
            </h1>
            <p className="text-gray-600 mt-1">Bem-vindo, {user?.email}</p>
          </div>
          <div className="flex gap-2">
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

        {/* Reports Table */}
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

        {/* Meetings Table */}
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
                      <TableCell>{meeting.vendedor_responsavel}</TableCell>
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
      </div>
    </div>
  );
};

export default Dashboard;
