
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, Bot, Database, ArrowLeft } from 'lucide-react';

const AIAccess = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading, isAI, accessLevelLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as AI
  useEffect(() => {
    console.log('AIAccess: useEffect triggered', { loading, user: !!user, isAI, accessLevelLoading });
    
    if (!loading && !accessLevelLoading && user && isAI) {
      console.log('AIAccess: Redirecting authenticated AI user to dashboard');
      toast({
        title: "✅ Acesso IA autorizado!",
        description: "Redirecionando para o dashboard IA...",
      });
      navigate('/ai-dashboard');
    }
  }, [user, loading, isAI, accessLevelLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) {
      console.log('AIAccess: Submit blocked - already loading');
      return;
    }
    
    console.log('AIAccess: Starting AI login process');
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('AIAccess: Login error:', error);
        toast({
          title: "❌ Erro no acesso IA",
          description: error.message || "Credenciais inválidas para acesso IA",
          variant: "destructive",
        });
      } else {
        console.log('AIAccess: Login successful, waiting for redirect');
        // O redirecionamento será feito pelo useEffect quando isAI for true
      }
    } catch (error: any) {
      console.error('AIAccess: Unexpected login error:', error);
      toast({
        title: "❌ Erro no acesso IA",
        description: error.message || "Erro interno",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth state
  if (loading || accessLevelLoading) {
    console.log('AIAccess: Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  console.log('AIAccess: Rendering AI login form');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-t-lg">
          <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Bot className="h-6 w-6" />
            Acesso IA
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Database className="h-5 w-5" />
              <span className="font-semibold">Acesso Completo aos Dados</span>
            </div>
            <p className="text-sm text-purple-600">
              Esta área é exclusiva para inteligências artificiais com acesso total aos dados do sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold">Usuário IA</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite o usuário da IA"
                required
                disabled={isLoading}
                className="h-12 border-purple-200 focus:border-purple-500"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-gray-700 font-semibold">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha da IA"
                required
                disabled={isLoading}
                className="h-12 border-purple-200 focus:border-purple-500"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Autenticando IA...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-5 w-5" />
                  Acessar Sistema
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              disabled={isLoading}
              className="w-full text-purple-500 border-purple-500 hover:bg-purple-50 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar à Página Inicial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAccess;
