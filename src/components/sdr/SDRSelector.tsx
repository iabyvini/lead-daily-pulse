
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
  const [forceEnabled, setForceEnabled] = useState(false);

  useEffect(() => {
    fetchSDRs();
    
    // Safety timeout: force enable after 5 seconds regardless of loading state
    const safetyTimeout = setTimeout(() => {
      console.log('SDRSelector: Safety timeout triggered - forcing component to be enabled');
      setLoading(false);
      setForceEnabled(true);
    }, 5000);

    return () => clearTimeout(safetyTimeout);
  }, []);

  const fetchSDRs = async () => {
    console.log('SDRSelector: Starting to fetch SDRs...');
    console.log('SDRSelector: Current state:', { loading, sdrs: sdrs.length, error });
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('vendedor')
        .order('vendedor');

      console.log('SDRSelector: Query completed', { 
        hasData: !!data, 
        dataLength: data?.length || 0, 
        hasError: !!error 
      });

      if (error) {
        console.error('SDRSelector: Query error:', error);
        throw error;
      }

      if (!data) {
        console.log('SDRSelector: No data returned from query');
        setSDRs([]);
      } else {
        // Get unique SDR names
        const uniqueSDRs = [...new Set(data.map(report => report.vendedor))];
        console.log('SDRSelector: Unique SDRs processed:', uniqueSDRs);
        setSDRs(uniqueSDRs);
      }
    } catch (error: any) {
      console.error('SDRSelector: Error in fetchSDRs:', error);
      setError(error.message || 'Erro ao carregar SDRs');
      
      // Set some fallback data to prevent empty state
      setSDRs([]);
    } finally {
      console.log('SDRSelector: Setting loading to false');
      setLoading(false);
    }
  };

  const handleRetry = () => {
    console.log('SDRSelector: Manual retry triggered');
    setForceEnabled(false);
    fetchSDRs();
  };

  // Component should be enabled if not loading OR if force enabled
  const isEnabled = !loading || forceEnabled;
  
  console.log('SDRSelector: Render state:', { 
    loading, 
    forceEnabled, 
    isEnabled, 
    sdrsCount: sdrs.length, 
    hasError: !!error 
  });

  if (error && !forceEnabled) {
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
      <Select value={selectedSDR} onValueChange={onSDRSelect} disabled={!isEnabled}>
        <SelectTrigger className="h-12 border-emerald-200 focus:border-[#1bccae]">
          <SelectValue 
            placeholder={
              loading && !forceEnabled
                ? "Carregando SDRs..." 
                : sdrs.length === 0 
                  ? "Nenhum SDR encontrado" 
                  : "Selecione um SDR"
            } 
          />
        </SelectTrigger>
        <SelectContent className="z-[9999] bg-white border border-gray-200 shadow-lg">
          {sdrs.length > 0 ? (
            sdrs.map((sdr) => (
              <SelectItem key={sdr} value={sdr}>
                {sdr}
              </SelectItem>
            ))
          ) : null}
        </SelectContent>
      </Select>
      
      {loading && !forceEnabled && (
        <p className="text-xs text-gray-500 mt-1">
          Buscando dados dos SDRs...
        </p>
      )}
      
      {(!loading || forceEnabled) && sdrs.length === 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            {error ? "Erro ao carregar SDRs." : "Nenhum SDR encontrado."}
          </p>
          <button
            onClick={handleRetry}
            className="text-xs text-[#1bccae] hover:underline mt-1"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      {forceEnabled && (
        <p className="text-xs text-yellow-600 mt-1">
          Componente desbloqueado automaticamente
        </p>
      )}
    </div>
  );
};
