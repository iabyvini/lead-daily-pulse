import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield, Users, BarChart3 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    navigate('/auth');
  };

  const handleSDRDashboard = () => {
    navigate('/sdr-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <span className="font-bold text-xl text-gray-800">LigueLead</span>
        {useAuth().user ? (
          <Button variant="outline" onClick={() => {
            useAuth().signOut();
            navigate('/');
          }} className="border-red-500 text-red-500 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        ) : null}
      </nav>
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Sistema de Relatórios <span className="text-[#1bccae]">LigueLead</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Acompanhe em tempo real o desempenho da sua equipe de vendas com relatórios detalhados e insights valiosos
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => navigate('/sdr-reports')}
              size="lg" 
              className="bg-[#1bccae] hover:bg-emerald-600 text-white px-8 py-6 text-lg"
            >
              <Users className="mr-2 h-6 w-6" />
              Ver Relatórios SDR
            </Button>
            
            <Button 
              onClick={handleSDRDashboard}
              size="lg" 
              variant="outline"
              className="border-[#1bccae] text-[#1bccae] hover:bg-emerald-50 px-8 py-6 text-lg"
            >
              <BarChart3 className="mr-2 h-6 w-6" />
              Dashboard SDR
            </Button>
            
            <Button 
              onClick={handleAdminAccess}
              size="lg" 
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-6 text-lg"
            >
              <Shield className="mr-2 h-6 w-6" />
              Acesso Administrador
            </Button>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-emerald-100 text-emerald-800 p-3 rounded-full inline-block mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Acompanhamento em Tempo Real</h2>
            <p className="text-gray-600">Visualize dados atualizados a cada instante, permitindo decisões rápidas e eficientes.</p>
          </div>
          <div className="text-center">
            <div className="bg-emerald-100 text-emerald-800 p-3 rounded-full inline-block mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3"><path d="M3 3v18h18"/><path d="M7 17V7"/><path d="M11 17V3"/><path d="M15 17v8"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Relatórios Detalhados</h2>
            <p className="text-gray-600">Explore relatórios completos que oferecem insights profundos sobre o desempenho da equipe.</p>
          </div>
          <div className="text-center">
            <div className="bg-emerald-100 text-emerald-800 p-3 rounded-full inline-block mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up"><path d="M22 7 14 15 10 11 2 9"/><path d="M17 7h5v5"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Insights Acionáveis</h2>
            <p className="text-gray-600">Transforme dados em ações com insights claros que impulsionam o crescimento das vendas.</p>
          </div>
        </section>

        <footer className="text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} LigueLead. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
