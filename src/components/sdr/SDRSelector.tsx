
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSDRs();
  }, []);

  const fetchSDRs = async () => {
    console.log('SDRSelector: Starting to fetch SDRs...');
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('vendedor')
        .order('vendedor');

      console.log('SDRSelector: Query result', { data, error });

      if (error) {
        console.error('SDRSelector: Query error:', error);
        throw error;
      }

      if (!data) {
        console.log('SDRSelector: No data returned');
        setSDRs([]);
        return;
      }

      // Get unique SDR names
      const uniqueSDRs = [...new Set(data.map(report => report.vendedor))];
      console.log('SDRSelector: Unique SDRs found:', uniqueSDRs);
      
      setSDRs(uniqueSDRs);
    } catch (error: any) {
      console.error('SDRSelector: Error fetching SDRs:', error);
      setError(error.message || 'Erro ao carregar SDRs');
      
      // Retry after 2 seconds
      setTimeout(() => {
        console.log('SDRSelector: Retrying fetch...');
        fetchSDRs();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    console.log('SDRSelector: Manual retry triggered');
    fetchSDRs();
  };

  if (error) {
    return (
      <div className="w-full max-w-xs">
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-sm text-red-600 mb-2">Erro: {error}</p>
          <button
            onClick={handleRetry}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs">
      <Select value={selectedSDR} onValueChange={onSDRSelect} disabled={loading}>
        <SelectTrigger className="h-12 border-emerald-200 focus:border-[#1bccae]">
          <SelectValue 
            placeholder={
              loading 
                ? "Carregando SDRs..." 
                : sdrs.length === 0 
                  ? "Nenhum SDR encontrado" 
                  : "Selecione um SDR"
            } 
          />
        </SelectTrigger>
        <SelectContent>
          {sdrs.length > 0 ? (
            sdrs.map((sdr) => (
              <SelectItem key={sdr} value={sdr}>
                {sdr}
              </SelectItem>
            ))
          ) : (
            !loading && (
              <SelectItem value="" disabled>
                Nenhum SDR disponível
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
      
      {loading && (
        <p className="text-xs text-gray-500 mt-1">
          Buscando dados dos SDRs...
        </p>
      )}
      
      {!loading && sdrs.length === 0 && !error && (
        <div className="mt-2">
          <p className="text-xs text-gray-500">Nenhum SDR encontrado.</p>
          <button
            onClick={handleRetry}
            className="text-xs text-[#1bccae] hover:underline mt-1"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
};
