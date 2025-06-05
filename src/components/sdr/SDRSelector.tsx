
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface SDRSelectorProps {
  onSDRSelect: (sdrName: string) => void;
  selectedSDR: string;
}

export const SDRSelector: React.FC<SDRSelectorProps> = ({ onSDRSelect, selectedSDR }) => {
  const [sdrs, setSDRs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSDRs();
  }, []);

  const fetchSDRs = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('vendedor')
        .order('vendedor');

      if (error) throw error;

      // Get unique SDR names
      const uniqueSDRs = [...new Set(data.map(report => report.vendedor))];
      setSDRs(uniqueSDRs);
    } catch (error) {
      console.error('Error fetching SDRs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xs">
      <Select value={selectedSDR} onValueChange={onSDRSelect} disabled={loading}>
        <SelectTrigger className="h-12 border-emerald-200 focus:border-[#1bccae]">
          <SelectValue placeholder={loading ? "Carregando SDRs..." : "Selecione um SDR"} />
        </SelectTrigger>
        <SelectContent>
          {sdrs.map((sdr) => (
            <SelectItem key={sdr} value={sdr}>
              {sdr}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
