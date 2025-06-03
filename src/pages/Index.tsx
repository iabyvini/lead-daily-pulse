
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Loader2, User, Phone, Calendar, Clock, Plus, Trash2 } from "lucide-react";

const salesSchema = z.object({
  vendedor: z.string().min(1, "Nome do vendedor é obrigatório"),
  dataRegistro: z.string(),
  contatosFalados: z.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  reunioesAgendadas: z.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  reunioesRealizadas: z.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  ligacoesRealizadas: z.number().min(0, "Quantidade deve ser maior ou igual a 0"),
});

type SalesFormData = z.infer<typeof salesSchema>;

interface ReuniaoLead {
  id: string;
  nomeLead: string;
  dataAgendamento: string;
  horarioAgendamento: string;
  status: "Agendado" | "Realizado" | "Reagendamento";
}

const vendedoresPredefinidos = [
  "Ana Silva",
  "Carlos Santos",
  "Maria Oliveira",
  "João Pereira",
  "Fernanda Costa",
  "Ricardo Lima"
];

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reunioes, setReunioes] = useState<ReuniaoLead[]>([]);
  const [novaReuniao, setNovaReuniao] = useState<Omit<ReuniaoLead, 'id'>>({
    nomeLead: "",
    dataAgendamento: "",
    horarioAgendamento: "",
    status: "Agendado"
  });

  const form = useForm<SalesFormData>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      vendedor: "",
      dataRegistro: new Date().toISOString().split('T')[0],
      contatosFalados: 0,
      reunioesAgendadas: 0,
      reunioesRealizadas: 0,
      ligacoesRealizadas: 0,
    },
  });

  const adicionarReuniao = () => {
    if (novaReuniao.nomeLead && novaReuniao.dataAgendamento && novaReuniao.horarioAgendamento) {
      const reuniao: ReuniaoLead = {
        ...novaReuniao,
        id: Date.now().toString()
      };
      setReunioes([...reunioes, reuniao]);
      setNovaReuniao({
        nomeLead: "",
        dataAgendamento: "",
        horarioAgendamento: "",
        status: "Agendado"
      });
    }
  };

  const removerReuniao = (id: string) => {
    setReunioes(reunioes.filter(r => r.id !== id));
  };

  const onSubmit = async (data: SalesFormData) => {
    setIsLoading(true);
    
    try {
      console.log("Dados do formulário:", data);
      console.log("Reuniões:", reunioes);
      
      // Simular envio para banco de dados
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular envio de email
      const emailData = {
        to: "viniciusrodrigues@liguelead.com.br",
        subject: `Relatório Diário de Vendas - ${data.vendedor} - ${data.dataRegistro}`,
        body: `
          Relatório Diário de Atividades de Vendas
          
          Vendedor: ${data.vendedor}
          Data: ${data.dataRegistro}
          Contatos Falados: ${data.contatosFalados}
          Reuniões Agendadas: ${data.reunioesAgendadas}
          Reuniões Realizadas: ${data.reunioesRealizadas}
          Ligações Realizadas: ${data.ligacoesRealizadas}
          
          Detalhes das Reuniões:
          ${reunioes.map(r => `- ${r.nomeLead} | ${r.dataAgendamento} ${r.horarioAgendamento} | Status: ${r.status}`).join('\n')}
        `
      };
      
      console.log("Email enviado:", emailData);
      
      toast({
        title: "✅ Relatório enviado com sucesso!",
        description: "Seus dados foram salvos e o e-mail foi enviado para a gerência.",
      });
      
      // Reset do formulário
      form.reset({
        vendedor: "",
        dataRegistro: new Date().toISOString().split('T')[0],
        contatosFalados: 0,
        reunioesAgendadas: 0,
        reunioesRealizadas: 0,
        ligacoesRealizadas: 0,
      });
      setReunioes([]);
      
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast({
        title: "❌ Erro ao enviar",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
              <User className="h-6 w-6" />
              Relatório Diário de Vendas
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="vendedor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Nome do Vendedor *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Selecione seu nome" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendedoresPredefinidos.map((vendedor) => (
                            <SelectItem key={vendedor} value={vendedor}>
                              {vendedor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataRegistro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Data do Registro</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="h-12"
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="contatosFalados"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contatos Falados *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="h-12"
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reunioesAgendadas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Reuniões Agendadas *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="h-12"
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reunioesRealizadas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Reuniões Realizadas *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="h-12"
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ligacoesRealizadas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Ligações Realizadas *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="h-12"
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Detalhes das Reuniões
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Lead</label>
                      <Input
                        value={novaReuniao.nomeLead}
                        onChange={(e) => setNovaReuniao({...novaReuniao, nomeLead: e.target.value})}
                        placeholder="Nome do lead"
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                      <Input
                        type="date"
                        value={novaReuniao.dataAgendamento}
                        onChange={(e) => setNovaReuniao({...novaReuniao, dataAgendamento: e.target.value})}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                      <Input
                        type="time"
                        value={novaReuniao.horarioAgendamento}
                        onChange={(e) => setNovaReuniao({...novaReuniao, horarioAgendamento: e.target.value})}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <Select 
                        value={novaReuniao.status} 
                        onValueChange={(value: "Agendado" | "Realizado" | "Reagendamento") => 
                          setNovaReuniao({...novaReuniao, status: value})
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Agendado">Agendado</SelectItem>
                          <SelectItem value="Realizado">Realizado</SelectItem>
                          <SelectItem value="Reagendamento">Reagendamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={adicionarReuniao}
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Reunião
                  </Button>

                  {reunioes.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-green-100">
                            <TableHead>Nome do Lead</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Horário</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reunioes.map((reuniao) => (
                            <TableRow key={reuniao.id}>
                              <TableCell className="font-medium">{reuniao.nomeLead}</TableCell>
                              <TableCell>{reuniao.dataAgendamento}</TableCell>
                              <TableCell>{reuniao.horarioAgendamento}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  reuniao.status === 'Realizado' ? 'bg-green-100 text-green-800' :
                                  reuniao.status === 'Agendado' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {reuniao.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removerReuniao(reuniao.id)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando relatório...
                    </>
                  ) : (
                    "Enviar Relatório Diário"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>📧 Relatório será enviado automaticamente para: viniciusrodrigues@liguelead.com.br</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
