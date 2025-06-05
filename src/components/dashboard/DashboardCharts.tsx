
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DailyReport {
  id: string;
  vendedor: string;
  data_registro: string;
  reunioes_agendadas: number;
  reunioes_realizadas: number;
  created_at: string;
}

interface DashboardChartsProps {
  reports: DailyReport[];
}

const chartConfig = {
  agendadas: {
    label: "Reuniões Agendadas",
    color: "#1bccae",
  },
  realizadas: {
    label: "Reuniões Realizadas", 
    color: "#10b981",
  },
};

const COLORS = ['#1bccae', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'];

export const DashboardCharts = ({ reports }: DashboardChartsProps) => {
  // Dados para gráfico de barras por vendedor
  const salesRepData = reports.reduce((acc, report) => {
    const existing = acc.find(item => item.vendedor === report.vendedor);
    if (existing) {
      existing.agendadas += report.reunioes_agendadas;
      existing.realizadas += report.reunioes_realizadas;
    } else {
      acc.push({
        vendedor: report.vendedor,
        agendadas: report.reunioes_agendadas,
        realizadas: report.reunioes_realizadas,
      });
    }
    return acc;
  }, [] as Array<{ vendedor: string; agendadas: number; realizadas: number; }>);

  // Dados para gráfico de linha temporal
  const timelineData = reports.reduce((acc, report) => {
    const date = new Date(report.data_registro).toLocaleDateString('pt-BR');
    const existing = acc.find(item => item.data === date);
    if (existing) {
      existing.agendadas += report.reunioes_agendadas;
      existing.realizadas += report.reunioes_realizadas;
    } else {
      acc.push({
        data: date,
        agendadas: report.reunioes_agendadas,
        realizadas: report.reunioes_realizadas,
      });
    }
    return acc;
  }, [] as Array<{ data: string; agendadas: number; realizadas: number; }>)
  .sort((a, b) => new Date(a.data.split('/').reverse().join('-')).getTime() - new Date(b.data.split('/').reverse().join('-')).getTime());

  // Dados para gráfico de pizza
  const pieData = salesRepData.map((item, index) => ({
    name: item.vendedor,
    value: item.realizadas,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Gráfico de Barras - Performance por SDR */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-gray-800">Performance por SDR</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesRepData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="vendedor" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="agendadas" fill="var(--color-agendadas)" name="Agendadas" />
                <Bar dataKey="realizadas" fill="var(--color-realizadas)" name="Realizadas" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Linha - Evolução Temporal */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-gray-800">Evolução Temporal</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="agendadas" 
                  stroke="var(--color-agendadas)" 
                  name="Agendadas"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="realizadas" 
                  stroke="var(--color-realizadas)" 
                  name="Realizadas"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Distribuição de Reuniões Realizadas */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-gray-800">Distribuição de Reuniões Realizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Taxa de Conversão por SDR */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-gray-800">Taxa de Conversão por SDR</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesRepData.map(item => ({
                ...item,
                conversao: item.agendadas > 0 ? Math.round((item.realizadas / item.agendadas) * 100) : 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="vendedor" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="conversao" fill="#1bccae" name="Taxa de Conversão (%)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
