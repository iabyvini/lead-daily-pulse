
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

export const useDashboardData = () => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [meetings, setMeetings] = useState<MeetingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleVendorUpdate = (meetingId: string, newVendor: string) => {
    setMeetings(prevMeetings => 
      prevMeetings.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, vendedor_responsavel: newVendor }
          : meeting
      )
    );
  };

  const calculateTotals = () => {
    const totalAgendadas = reports.reduce((sum, report) => sum + report.reunioes_agendadas, 0);
    const totalRealizadas = reports.reduce((sum, report) => sum + report.reunioes_realizadas, 0);
    const totalSDRs = new Set(reports.map(report => report.vendedor)).size;
    
    return { totalAgendadas, totalRealizadas, totalSDRs };
  };

  return {
    reports,
    meetings,
    isLoading,
    error,
    fetchData,
    handleVendorUpdate,
    calculateTotals
  };
};
