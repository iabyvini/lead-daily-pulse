import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Send, BarChart3, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

    try {
      // Get current user session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "❌ Erro de autenticação",
          description: "Você precisa estar logado para enviar relatórios.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Prepare data for the email function
      const emailData = {
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
            vendedorResponsavel: reuniao.nomeVendedor
          }))
      };

      console.log('Enviando dados para função de email:', emailData);

      // Call the send-report-email function
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-report-email', {
        body: emailData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('Resultado da função de email:', emailResult);

      if (emailError) {
        console.error('Erro na função de email:', emailError);
        throw new Error(`Erro ao enviar email: ${emailError.message}`);
      }

      if (!emailResult?.success) {
        console.error('Função retornou erro:', emailResult?.error);
        throw new Error(emailResult?.error || 'Erro desconhecido ao enviar email');
      }

      toast({
        title: "✅ Relatório enviado com sucesso!",
        description: "Seu relatório foi salvo no sistema e enviado por email.",
      });

      // Reset form
      setFormData({
        vendedor: '',
        dataRegistro: '',
        reunioesAgendadas: '',
        reunioesRealizadas: '',
        reunioes: []
      });

    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast({
        title: "❌ Erro ao enviar relatório",
        description: error.message || "Ocorreu um erro interno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-[#1bccae]" />
            <h1 className="text-2xl font-bold text-gray-800">LigueLead - Relatórios</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="border-[#1bccae] text-[#1bccae] hover:bg-emerald-50"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              <Shield className="h-4 w-4 mr-2" />
              Acesso Administrador
            </Button>
          </div>
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
  );
};

export default Index;
