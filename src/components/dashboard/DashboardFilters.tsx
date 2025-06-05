
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DashboardFiltersProps {
  reports: any[];
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  vendedor: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export const DashboardFilters = ({ reports, onFiltersChange }: DashboardFiltersProps) => {
  const [filters, setFilters] = React.useState<FilterState>({
    vendedor: '',
    startDate: undefined,
    endDate: undefined,
  });

  const [startDateOpen, setStartDateOpen] = React.useState(false);
  const [endDateOpen, setEndDateOpen] = React.useState(false);

  // Get unique vendors
  const vendors = Array.from(new Set(reports.map(report => report.vendedor))).sort();

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      vendedor: '',
      startDate: undefined,
      endDate: undefined,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.vendedor || filters.startDate || filters.endDate;

  return (
    <Card className="border-emerald-200 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Filter className="h-5 w-5 text-[#1bccae]" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Filtro por Vendedor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">SDR</label>
            <Select value={filters.vendedor} onValueChange={(value) => updateFilters({ vendedor: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os SDRs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os SDRs</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor} value={vendor}>
                    {vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Inicial */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Data Inicial</label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => {
                    updateFilters({ startDate: date });
                    setStartDateOpen(false);
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data Final */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Data Final</label>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => {
                    updateFilters({ endDate: date });
                    setEndDateOpen(false);
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Botão Limpar Filtros */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 invisible">Ações</label>
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {filters.vendedor && (
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  SDR: {filters.vendedor}
                  <button
                    onClick={() => updateFilters({ vendedor: '' })}
                    className="hover:bg-emerald-200 rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.startDate && (
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  De: {format(filters.startDate, "dd/MM/yyyy")}
                  <button
                    onClick={() => updateFilters({ startDate: undefined })}
                    className="hover:bg-emerald-200 rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.endDate && (
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  Até: {format(filters.endDate, "dd/MM/yyyy")}
                  <button
                    onClick={() => updateFilters({ endDate: undefined })}
                    className="hover:bg-emerald-200 rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
