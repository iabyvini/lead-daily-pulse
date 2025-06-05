
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, Lock } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "❌ Erro no login",
          description: error.message || "Credenciais inválidas",
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
        // Don't manually navigate here, let the useEffect handle it
      }
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      toast({
        title: "❌ Erro no login",
        description: error.message || "Erro interno",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1bccae]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-[#1bccae] to-emerald-500 text-white rounded-t-lg">
          <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Lock className="h-6 w-6" />
            Acesso ao Dashboard
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
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
              className="w-full h-12 bg-[#1bccae] hover:bg-emerald-600 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar no Dashboard"
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
