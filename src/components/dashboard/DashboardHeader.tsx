
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, LogOut } from 'lucide-react';
import { ExportButtons } from './ExportButtons';

interface DashboardHeaderProps {
  userEmail: string;
  reports: any[];
  meetings: any[];
  onBackToReport: () => void;
  onSignOut: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userEmail,
  reports,
  meetings,
  onBackToReport,
  onSignOut
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-[#1bccae]" />
          Dashboard de Relatórios
        </h1>
        <p className="text-gray-600 mt-1">Bem-vindo, {userEmail}</p>
      </div>
      <div className="flex gap-2">
        <ExportButtons reports={reports} meetings={meetings} />
        <Button 
          variant="outline" 
          onClick={onBackToReport}
          className="border-[#1bccae] text-[#1bccae] hover:bg-emerald-50"
        >
          Voltar ao Relatório
        </Button>
        <Button 
          variant="outline" 
          onClick={onSignOut}
          className="border-red-500 text-red-500 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};
