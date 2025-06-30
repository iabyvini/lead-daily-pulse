
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { ReportsTable } from '@/components/dashboard/ReportsTable';
import { MeetingsTable } from '@/components/dashboard/MeetingsTable';

const Dashboard = () => {
  const { user, isAdmin, signOut, loading, accessLevelLoading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  
  const {
    reports,
    meetings,
    isLoading: isLoadingData,
    error,
    fetchData,
    handleVendorUpdate,
    calculateTotals
  } = useDashboardData();

  useEffect(() => {
    console.log('Dashboard: useEffect triggered', { 
      loading, 
      user: !!user, 
      isAdmin,
      accessLevelLoading,
      userEmail: user?.email 
    });

    // Se ainda está carregando auth ou access level, não fazer nada
    if (loading || accessLevelLoading) {
      console.log('Dashboard: Still loading, waiting...', { loading, accessLevelLoading });
      return;
    }

    // Marcar que a verificação de auth foi concluída
    if (!authChecked) {
      setAuthChecked(true);
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
      navigate('/auth');
      return;
    }

    // Se chegou até aqui, usuário está logado e é admin
    console.log('Dashboard: User authenticated and is admin, fetching data');
    if (!isLoadingData && reports.length === 0) {
      fetchData();
    }
  }, [user, isAdmin, loading, accessLevelLoading, navigate, authChecked, reports.length, isLoadingData, fetchData]);

  const handleSignOut = async () => {
    console.log('Dashboard: Signing out user');
    await signOut();
    navigate('/');
  };

  // Mostrar loading enquanto verifica autenticação
  if (loading || accessLevelLoading) {
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

  // Se não há usuário ou não é admin, mostrar carregamento enquanto redireciona
  if (!user || !isAdmin) {
    console.log('Dashboard: No user or not admin, showing redirect state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1bccae] mx-auto mb-4" />
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
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
        <DashboardHeader
          userEmail={user?.email || ''}
          reports={reports}
          meetings={meetings}
          onBackToReport={() => navigate('/')}
          onSignOut={handleSignOut}
        />

        <SummaryCards
          totalAgendadas={totalAgendadas}
          totalRealizadas={totalRealizadas}
          totalSDRs={totalSDRs}
        />

        <ReportsTable reports={reports} />

        <MeetingsTable 
          meetings={meetings} 
          reports={reports}
          onVendorUpdate={handleVendorUpdate} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
