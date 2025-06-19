
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, LogOut, Bot, Database, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

interface DailyReport {
  id: string;
  vendedor: string;
  data_registro: string;
  reunioes_agendadas: number;
  reunioes_realizadas: number;
  ligacoes_realizadas: number;
  contatos_falados: number;
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

const AIDashboard = () => {
  const { user, isAI, signOut, loading } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [meetings, setMeetings] = useState<MeetingDetail[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AIDashboard: useEffect triggered', { 
      loading, 
      user: !!user, 
      isAI,
      userEmail: user?.email 
    });

    // Se ainda está carregando, não fazer nada
    if (loading) {
      console.log('AIDashboard: Still loading auth state, waiting...');
      return;
    }

    // Se não há usuário logado, redirecionar para ai-access
    if (!user) {
      console.log('AIDashboard: No user found, redirecting to ai-access');
      navigate('/ai-access');
      return;
    }

    // Se há usuário mas não é IA, redirecionar para ai-access
    if (!isAI) {
      console.log('AIDashboard: User is not AI, redirecting to ai-access');
      toast({
        title: "❌ Acesso negado",
        description: "Você precisa ter acesso IA para acessar este dashboard.",
        variant: "destructive",
      });
      navigate('/ai-access');
      return;
    }

    // Se chegou até aqui, usuário é IA autenticada
    console.log('AIDashboard: AI user authenticated, fetching data');
    fetchData();
  }, [user, isAI, loading, navigate]);

  const fetchData = async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      console.log('AIDashboard: Starting to fetch data...');
      
      // Fetch daily reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('daily_reports')
        .select('*')
        .order('data_registro', { ascending: false });

      if (reportsError) {
        console.error('AIDashboard: Reports error:', reportsError);
        throw reportsError;
      }

      // Fetch meeting details
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meeting_details')
        .select('*')
        .order('data_agendamento', { ascending: false });

      if (meetingsError) {
        console.error('AIDashboard: Meetings error:', meetingsError);
        throw meetingsError;
      }

      const reportsWithData = reportsData || [];
      const meetingsWithData = meetingsData || [];

      console.log('AIDashboard: Data fetched successfully', {
        reports: reportsWithData.length,
        meetings: meetingsWithData.length
      });

      setReports(reportsWithData);
      setMeetings(meetingsWithData);
    } catch (error: any) {
      console.error('AIDashboard: Error fetching data:', error);
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
    console.log('AIDashboard: Signing out AI user');
    await signOut();
    navigate('/');
  };

  const exportToJSON = () => {
    const data = {
      reports,
      meetings,
      exportDate: new Date().toISOString(),
      totalReports: reports.length,
      totalMeetings: meetings.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liguelead-data-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "✅ Dados exportados",
      description: "Arquivo JSON baixado com sucesso!",
    });
  };

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    console.log('AIDashboard: Showing auth loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação IA...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário ou não é IA, não mostrar nada (redirecionamento já foi feito)
  if (!user || !isAI) {
    console.log('AIDashboard: No user or not AI, showing empty state');
    return null;
  }

  // Mostrar loading dos dados
  if (isLoadingData) {
    console.log('AIDashboard: Showing data loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados para IA...</p>
        </div>
      </div>
    );
  }

  // Se há erro, mostrar mensagem de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro: {error}</p>
          <Button onClick={fetchData} className="bg-purple-500 hover:bg-purple-600">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  console.log('AIDashboard: Rendering AI dashboard content');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Bot className="h-8 w-8 text-purple-500" />
              Dashboard IA - Acesso Completo
            </h1>
            <p className="text-gray-600 mt-1">IA: {user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={exportToJSON}
              className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
            >
              <FileJson className="h-4 w-4" />
              Exportar JSON
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-purple-500 text-purple-500 hover:bg-purple-50"
            >
              Voltar ao Início
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Total de Relatórios</p>
                  <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Total de Reuniões</p>
                  <p className="text-2xl font-bold text-gray-800">{meetings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">SDRs Únicos</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {new Set(reports.map(r => r.vendedor)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Última Atualização</p>
                  <p className="text-sm font-bold text-gray-800">
                    {reports.length > 0 ? format(new Date(reports[0].created_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <div className="space-y-8">
          <Card className="border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
              <CardTitle>Dados Completos - Relatórios Diários</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50">
                      <TableHead>ID</TableHead>
                      <TableHead>SDR</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Reuniões Agendadas</TableHead>
                      <TableHead>Reuniões Realizadas</TableHead>
                      <TableHead>Ligações</TableHead>
                      <TableHead>Contatos</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-xs">{report.id.substring(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{report.vendedor}</TableCell>
                        <TableCell>{format(new Date(report.data_registro), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{report.reunioes_agendadas}</TableCell>
                        <TableCell>{report.reunioes_realizadas}</TableCell>
                        <TableCell>{report.ligacoes_realizadas}</TableCell>
                        <TableCell>{report.contatos_falados}</TableCell>
                        <TableCell>{format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
              <CardTitle>Dados Completos - Detalhes das Reuniões</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50">
                      <TableHead>ID</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vendedor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetings.map((meeting) => (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-mono text-xs">{meeting.id.substring(0, 8)}...</TableCell>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
