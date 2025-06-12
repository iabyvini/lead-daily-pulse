
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle, BarChart3 } from 'lucide-react';

interface SDRSummaryCardsProps {
  totalAgendadas: number;
  totalRealizadas: number;
  totalDias: number;
}

export const SDRSummaryCards: React.FC<SDRSummaryCardsProps> = ({
  totalAgendadas,
  totalRealizadas,
  totalDias,
}) => {
  const conversionRate = totalAgendadas > 0 ? Math.round((totalRealizadas / totalAgendadas) * 100) : 0;

  return (
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
              <p className="text-2xl font-bold text-gray-800">{conversionRate}%</p>
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
  );
};
