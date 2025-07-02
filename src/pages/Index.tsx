import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Send, Users, BarChart3, CalendarDays, Clock, User, Briefcase, Phone, MessageSquare, Bot, Shield, AlertTriangle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    vendedor: '',
    dataRegistro: '',
    reunioesAgendadas: '',
    reunioesRealizadas: '',
    reunioes: [] as Array<{
      nomeLead: string;
      dataAgendamento: string;
      horarioAgendamento: string;
      status: string;
      nomeVendedor: string;
    }>
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addReuniao = () => {
    setFormData(prev => ({
      ...prev,
      reunioes: [...prev.reunioes, {
        nomeLead: '',
        dataAgendamento: '',
        horarioAgendamento: '',
        status: 'Agendado',
        nomeVendedor: ''
      }]
    }));
  };

  const removeReuniao = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reunioes: prev.reunioes.filter((_, i) => i !== index)
    }));
  };

  const updateReuniao = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      reunioes: prev.reunioes.map((reuniao, i) => 
        i === index ? { ...reuniao, [field]: value } : reuniao
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendedor || !formData.dataRegistro || !formData.reunioesAgendadas || !formData.reunioesRealizadas) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Prepare submission data for audit
    const submissionData = {
      vendedor: formData.vendedor,
      dataRegistro: formData.dataRegistro,
      reunioesAgendadas: parseInt(formData.reunioesAgendadas),
      reunioesRealizadas: parseInt(formData.reunioesRealizadas),
      reunioes: formData.reunioes
        .filter(reuniao => reuniao.nomeLead && reuniao.dataAgendamento && reuniao.horarioAgendamento)
        .map(reuniao => ({
          nomeLead: reuniao.nomeLead,
          dataAgendamento: reuniao.dataAgendamento,
          horarioAgendamento: reuniao.horarioAgendamento,
          status: reuniao.status,
          nomeVendedor: reuniao.nomeVendedor
        }))
    };

    // Log attempt start
    console.log(`[${new Date().toISOString()}] Iniciando envio de relatório para ${formData.vendedor}`);
    console.log('Dados a serem enviados:', submissionData);

    try {
      // Check connectivity first
      console.log('Verificando conectividade...');
      const { error: connectivityError } = await supabase.from('profiles').select('id').limit(1);
      if (connectivityError) {
        throw new Error('Problema de conectividade com o servidor. Verifique sua conexão.');
      }

      // Log audit attempt
      await supabase.from('submission_audit').insert({
        user_email: formData.vendedor,
        submission_data: submissionData,
        status: 'retry',
        error_message: null,
        user_agent: navigator.userAgent
      }).catch(err => console.warn('Falha ao registrar auditoria:', err));

      console.log('Enviando dados para função de email...');

      // Call the send-report-email function with retry logic
      let attempt = 1;
      const maxAttempts = 3;
      let lastError: any = null;

      while (attempt <= maxAttempts) {
        try {
          console.log(`Tentativa ${attempt} de ${maxAttempts}`);
          
          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-report-email', {
            body: submissionData
          });

          console.log(`Resultado da tentativa ${attempt}:`, emailResult);

          if (emailError) {
            console.error(`Erro na função de email (tentativa ${attempt}):`, emailError);
            lastError = new Error(`Erro ao enviar email: ${emailError.message}`);
            
            if (attempt < maxAttempts) {
              console.log(`Aguardando antes da próxima tentativa...`);
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Backoff
              attempt++;
              continue;
            }
            throw lastError;
          }

          if (!emailResult?.success) {
            console.error(`Função retornou erro (tentativa ${attempt}):`, emailResult?.error);
            lastError = new Error(emailResult?.error || 'Erro desconhecido ao enviar email');
            
            if (attempt < maxAttempts) {
              console.log(`Aguardando antes da próxima tentativa...`);
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Backoff
              attempt++;
              continue;
            }
            throw lastError;
          }

          // Success!
          console.log(`✅ Relatório enviado com sucesso na tentativa ${attempt}!`);
          
          // Log successful audit
          await supabase.from('submission_audit').insert({
            user_email: formData.vendedor,
            submission_data: submissionData,
            status: 'success',
            error_message: null,
            user_agent: navigator.userAgent
          }).catch(err => console.warn('Falha ao registrar auditoria de sucesso:', err));

          toast({
            title: "✅ Relatório enviado com sucesso!",
            description: `Seu relatório foi salvo no sistema e enviado por email (tentativa ${attempt}).`,
          });

          // Reset form
          setFormData({
            vendedor: '',
            dataRegistro: '',
            reunioesAgendadas: '',
            reunioesRealizadas: '',
            reunioes: []
          });

          return; // Exit function on success

        } catch (attemptError: any) {
          console.error(`Erro na tentativa ${attempt}:`, attemptError);
          lastError = attemptError;
          
          if (attempt < maxAttempts) {
            console.log(`Aguardando antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Backoff
          }
          attempt++;
        }
      }

      // If we get here, all attempts failed
      throw lastError || new Error('Todas as tentativas falharam');

    } catch (error: any) {
      console.error(`❌ Erro final ao enviar relatório para ${formData.vendedor}:`, error);
      
      // Log failed audit
      await supabase.from('submission_audit').insert({
        user_email: formData.vendedor,
        submission_data: submissionData,
        status: 'error',
        error_message: error.message || 'Erro desconhecido',
        user_agent: navigator.userAgent
      }).catch(err => console.warn('Falha ao registrar auditoria de erro:', err));

      toast({
        title: "❌ Erro ao enviar relatório",
        description: `${error.message || "Ocorreu um erro interno. Tente novamente."} (Dados salvos localmente para análise)`,
        variant: "destructive",
      });

      // Save to localStorage as backup
      const backupKey = `failed_report_${formData.vendedor}_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify({
        ...submissionData,
        timestamp: new Date().toISOString(),
        error: error.message
      }));
      console.log(`Backup salvo em localStorage: ${backupKey}`);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-[#1bccae] to-emerald-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LigueLead</h1>
                <p className="text-sm text-gray-600">Sistema de Relatórios de Vendas</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="border-[#1bccae] text-[#1bccae] hover:bg-emerald-50 flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Dashboard Admin
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/ai-access')}
                className="border-purple-500 text-purple-500 hover:bg-purple-50 flex items-center gap-2"
              >
                <Bot className="h-4 w-4" />
                Acesso IA
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with navigation buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📊 Relatório Diário de Vendas
            </h1>
            <p className="text-gray-600">
              Registre suas atividades e acompanhe seu desempenho
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => navigate('/sdr-reports')}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Ver Relatórios SDR
            </Button>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-emerald-200">
          <CardHeader className="bg-gradient-to-r from-[#1bccae] to-emerald-500 text-white">
            <CardTitle className="text-2xl">Novo Relatório</CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="vendedor" className="text-gray-700 font-semibold">
                    Nome do SDR *
                  </Label>
                  <Select value={formData.vendedor} onValueChange={(value) => setFormData(prev => ({ ...prev, vendedor: value }))}>
                    <SelectTrigger className="h-12 border-emerald-200 focus:border-[#1bccae]">
                      <SelectValue placeholder="Selecione um SDR" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nathalia">Nathalia</SelectItem>
                      <SelectItem value="Taynara">Taynara</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dataRegistro" className="text-gray-700 font-semibold">
                    Data do Registro *
                  </Label>
                  <Input
                    id="dataRegistro"
                    type="date"
                    value={formData.dataRegistro}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataRegistro: e.target.value }))}
                    required
                    className="h-12 border-emerald-200 focus:border-[#1bccae]"
                  />
                </div>
              </div>

              {/* Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="reunioesAgendadas" className="text-gray-700 font-semibold">
                    Reuniões Agendadas *
                  </Label>
                  <Input
                    id="reunioesAgendadas"
                    type="number"
                    min="0"
                    value={formData.reunioesAgendadas}
                    onChange={(e) => setFormData(prev => ({ ...prev, reunioesAgendadas: e.target.value }))}
                    placeholder="0"
                    required
                    className="h-12 border-emerald-200 focus:border-[#1bccae]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reunioesRealizadas" className="text-gray-700 font-semibold">
                    Reuniões Realizadas *
                  </Label>
                  <Input
                    id="reunioesRealizadas"
                    type="number"
                    min="0"
                    value={formData.reunioesRealizadas}
                    onChange={(e) => setFormData(prev => ({ ...prev, reunioesRealizadas: e.target.value }))}
                    placeholder="0"
                    required
                    className="h-12 border-emerald-200 focus:border-[#1bccae]"
                  />
                </div>
              </div>

              {/* Meeting Details */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-gray-700 font-semibold">
                    Detalhes das Reuniões (Opcional)
                  </Label>
                  <Button
                    type="button"
                    onClick={addReuniao}
                    variant="outline"
                    className="border-[#1bccae] text-[#1bccae] hover:bg-emerald-50"
                  >
                    + Adicionar Reunião
                  </Button>
                </div>

                {formData.reunioes.map((reuniao, index) => (
                  <Card key={index} className="mb-4 border-emerald-100">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-700">Reunião {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeReuniao(index)}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Remover
                        </Button>
                      </div>
                      
                      <Alert className="mb-4 border-orange-200 bg-orange-50">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          <strong>Importante:</strong> Use o mesmo nome do card do RD CRM
                        </AlertDescription>
                      </Alert>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Nome do Lead</Label>
                          <Input
                            value={reuniao.nomeLead}
                            onChange={(e) => updateReuniao(index, 'nomeLead', e.target.value)}
                            placeholder="Nome do lead"
                            className="border-emerald-200 focus:border-[#1bccae]"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600">Nome Vendedor</Label>
                          <Select value={reuniao.nomeVendedor} onValueChange={(value) => updateReuniao(index, 'nomeVendedor', value)}>
                            <SelectTrigger className="border-emerald-200 focus:border-[#1bccae]">
                              <SelectValue placeholder="Selecione um vendedor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Jean">Jean</SelectItem>
                              <SelectItem value="Rafaela">Rafaela</SelectItem>
                              <SelectItem value="Ricardo">Ricardo</SelectItem>
                              <SelectItem value="Lara">Lara</SelectItem>
                              <SelectItem value="Cris">Cris</SelectItem>
                              <SelectItem value="Guilherme">Guilherme</SelectItem>
                              <SelectItem value="Yago">Yago</SelectItem>
                              <SelectItem value="Lorena">Lorena</SelectItem>
                              <SelectItem value="André">André</SelectItem>
                              <SelectItem value="Vinícius">Vinícius</SelectItem>
                              <SelectItem value="Thamer">Thamer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600">Data do Agendamento</Label>
                          <Input
                            type="date"
                            value={reuniao.dataAgendamento}
                            onChange={(e) => updateReuniao(index, 'dataAgendamento', e.target.value)}
                            className="border-emerald-200 focus:border-[#1bccae]"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600">Horário</Label>
                          <Input
                            type="time"
                            value={reuniao.horarioAgendamento}
                            onChange={(e) => updateReuniao(index, 'horarioAgendamento', e.target.value)}
                            className="border-emerald-200 focus:border-[#1bccae]"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label className="text-sm text-gray-600">Status</Label>
                          <Select value={reuniao.status} onValueChange={(value) => updateReuniao(index, 'status', value)}>
                            <SelectTrigger className="border-emerald-200 focus:border-[#1bccae]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Agendado">Agendado</SelectItem>
                              <SelectItem value="Realizado">Realizado</SelectItem>
                              <SelectItem value="Cancelado">Cancelado</SelectItem>
                              <SelectItem value="Não compareceu">Não compareceu</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-[#1bccae] hover:bg-emerald-600 text-white text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-6 w-6" />
                    Enviar Relatório
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
