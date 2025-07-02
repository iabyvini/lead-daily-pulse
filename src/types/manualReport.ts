export interface ManualReportData {
  vendedor: string;
  dataRegistro: string;
  reunioesAgendadas: string;
  reunioesRealizadas: string;
  ligacoesRealizadas: string;
  contatosFalados: string;
  observacoes: string;
}

export const initialFormData: ManualReportData = {
  vendedor: '',
  dataRegistro: '',
  reunioesAgendadas: '0',
  reunioesRealizadas: '0',
  ligacoesRealizadas: '0',
  contatosFalados: '0',
  observacoes: ''
};