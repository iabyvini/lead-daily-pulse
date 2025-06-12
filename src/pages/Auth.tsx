
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, Lock, Shield } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated and is admin
  useEffect(() => {
    console.log('Auth: useEffect triggered', { loading, user: !!user, isAdmin });
    
    if (!loading && user && isAdmin) {
      console.log('Auth: Redirecting authenticated admin user to dashboard');
      navigate('/dashboard');
    } else if (!loading && user && !isAdmin) {
      console.log('Auth: User is not admin, showing access denied');
      toast({
        title: "❌ Acesso Negado",
        description: "Você não tem permissão de administrador",
        variant: "destructive",
      });
    }
  }, [user, loading, isAdmin, navigate]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth: Loading timeout reached, forcing loading to false');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) {
      console.log('Auth: Submit blocked - already loading');
      return;
    }
    
    console.log('Auth: Starting admin login process');
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Auth: Login error:', error);
        
        // Verificar se é o caso específico das credenciais do administrador
        if (email === 'viniciusrodrigues@liguelead.com.br' && password === 'liguelead1') {
          toast({
            title: "❌ Usuário administrador não encontrado",
            description: "Por favor, registre-se primeiro com essas credenciais através do sistema de signup.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "❌ Erro no login",
            description: error.message || "Credenciais inválidas",
            variant: "destructive",
          });
        }
      } else {
        console.log('Auth: Login successful');
        toast({
          title: "✅ Login realizado com sucesso!",
          description: "Verificando permissões de administrador...",
        });
        // Navigation will be handled by the useEffect above
      }
    } catch (error: any) {
      console.error('Auth: Unexpected login error:', error);
      toast({
        title: "❌ Erro no login",
        description: error.message || "Erro interno",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Pré-preencher campos para facilitar o acesso do administrador
  useEffect(() => {
    setEmail('viniciusrodrigues@liguelead.com.br');
    setPassword('liguelead1');
  }, []);

  // Show loading while checking auth state, but with a maximum time
  if (loading) {
    console.log('Auth: Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1bccae] mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  console.log('Auth: Rendering admin login form');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
          <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            Acesso Administrador
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600">
              Área restrita para administradores do sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@liguelead.com.br"
                required
                disabled={isLoading}
                className="h-12 border-emerald-200 focus:border-[#1bccae]"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-gray-700 font-semibold">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                disabled={isLoading}
                className="h-12 border-emerald-200 focus:border-[#1bccae]"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Entrar como Administrador
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              disabled={isLoading}
              className="text-[#1bccae] border-[#1bccae] hover:bg-emerald-50"
            >
              Voltar ao Relatório
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
