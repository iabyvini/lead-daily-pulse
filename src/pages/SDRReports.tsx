
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { SDRDashboard } from '@/components/sdr/SDRDashboard';

const SDRReports = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="h-8 w-8 text-[#1bccae]" />
              Relatórios SDR
            </h1>
            <p className="text-gray-600 mt-1">Acompanhe seu desempenho individual</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-[#1bccae] text-[#1bccae] hover:bg-emerald-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Relatório Principal
          </Button>
        </div>

        {/* SDR Dashboard */}
        <SDRDashboard />
      </div>
    </div>
  );
};

export default SDRReports;
