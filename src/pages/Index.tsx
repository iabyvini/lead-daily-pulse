
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, User, Phone, Calendar, Clock } from "lucide-react";

const salesSchema = z.object({
  vendedor: z.string().min(1, "Nome do vendedor é obrigatório"),
  dataRegistro: z.string(),
  contatosFalados: z.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  reunioesAgendadas: z.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  nomesLeads: z.string().optional(),
  horariosReunioes: z.string().optional(),
  ligacoesRealizadas: z.number().min(0, "Quantidade deve ser maior ou igual a 0"),
});

type SalesFormData = z.infer<typeof salesSchema>;

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

  const form = useForm<SalesFormData>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      vendedor: "",
      dataRegistro: new Date().toISOString().split('T')[0],
      contatosFalados: 0,
      reunioesAgendadas: 0,
      nomesLeads: "",
      horariosReunioes: "",
      ligacoesRealizadas: 0,
    },
  });

  const onSubmit = async (data: SalesFormData) => {
    setIsLoading(true);
    
    try {
      console.log("Dados do formulário:", data);
      
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
          Nomes dos Leads: ${data.nomesLeads || "Nenhum"}
          Horários das Reuniões: ${data.horariosReunioes || "Nenhum"}
          Ligações Realizadas: ${data.ligacoesRealizadas}
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
        nomesLeads: "",
        horariosReunioes: "",
        ligacoesRealizadas: 0,
      });
      
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <FormField
                  control={form.control}
                  name="nomesLeads"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Nomes dos Leads com Reunião Agendada</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite os nomes dos leads separados por vírgula (ex: João Silva, Maria Santos)"
                          {...field}
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horariosReunioes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Horários das Reuniões Agendadas
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite os horários correspondentes aos leads (ex: 14:00, 16:30)"
                          {...field}
                          className="min-h-[80px]"
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
                        Quantidade de Ligações Realizadas *
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

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg font-semibold"
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
