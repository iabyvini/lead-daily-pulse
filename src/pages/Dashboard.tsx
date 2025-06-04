
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BarChart3, Calendar, Users, TrendingUp, LogOut, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [meetings, setMeetings] = useState<MeetingDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (profile && !profile.is_admin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta área.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    if (profile?.is_admin) {
      fetchData();
    }
  }, [user, profile, navigate]);

  const fetchData = async () => {
    try {
      const { data: reportsData, error: reportsError } = await supabase
        .from('daily_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meeting_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (meetingsError) throw meetingsError;

      setReports(reportsData || []);
      setMeetings(meetingsData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const totalMeetingsScheduled = reports.reduce((sum, report) => sum + report.reunioes_agendadas, 0);
  const totalMeetingsCompleted = reports.reduce((sum, report) => sum + report.reunioes_realizadas, 0);
  const uniqueVendors = new Set(reports.map(report => report.vendedor)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#1bccae]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1bccae] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#1bccae]/10 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-[#1bccae] text-[#1bccae] hover:bg-[#1bccae] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-[#1bccae]" />
              Dashboard Administrativo
            </h1>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-[#1bccae]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Reuniões Agendadas</CardTitle>
              <Calendar className="h-4 w-4 text-[#1bccae]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1bccae]">{totalMeetingsScheduled}</div>
            </CardContent>
          </Card>
          
          <Card className="border-[#1bccae]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Reuniões Realizadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#1bccae]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1bccae]">{totalMeetingsCompleted}</div>
            </CardContent>
          </Card>
          
          <Card className="border-[#1bccae]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">SDRs Ativos</CardTitle>
              <Users className="h-4 w-4 text-[#1bccae]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1bccae]">{uniqueVendors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de relatórios */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-[#1bccae]">Relatórios Diários</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell>{new Date(report.data_registro).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{report.reunioes_agendadas}</TableCell>
                    <TableCell>{report.reunioes_realizadas}</TableCell>
                    <TableCell>{new Date(report.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tabela de detalhes das reuniões */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1bccae]">Detalhes das Reuniões</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Lead</TableHead>
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
                    <TableCell>{new Date(meeting.data_agendamento).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{meeting.horario_agendamento}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        meeting.status === 'Realizado' ? 'bg-[#1bccae]/10 text-[#1bccae]' :
                        meeting.status === 'Agendado' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {meeting.status}
                      </span>
                    </TableCell>
                    <TableCell>{meeting.vendedor_responsavel || 'Não especificado'}</TableCell>
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
