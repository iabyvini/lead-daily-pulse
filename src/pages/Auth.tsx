
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, Lock, Mail, ArrowLeft, Shield } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const { signIn, resetPassword, user, loading, isAdmin, accessLevelLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if we're in reset mode from URL
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  // Redirect if already authenticated as admin
  useEffect(() => {
    console.log('Auth: useEffect triggered', { loading, user: !!user, isAdmin, accessLevelLoading });
    
    if (!loading && !accessLevelLoading && user && isAdmin) {
      console.log('Auth: Redirecting authenticated admin user to dashboard');
      navigate('/dashboard');
    }
  }, [user, loading, isAdmin, accessLevelLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) {
      console.log('Auth: Submit blocked - already loading');
      return;
    }
    
    if (mode === 'login') {
      console.log('Auth: Starting admin login process');
      setIsLoading(true);

      try {
        const { error } = await signIn(email, password);
        
        if (error) {
          console.error('Auth: Login error:', error);
          toast({
            title: "❌ Erro no login",
            description: error.message || "Credenciais inválidas para administrador",
            variant: "destructive",
          });
        } else {
          console.log('Auth: Login successful');
          toast({
            title: "✅ Login realizado com sucesso!",
            description: "Redirecionando para o dashboard...",
          });
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
    } else {
      // Reset password mode
      console.log('Auth: Starting password reset process');
      setIsLoading(true);

      try {
        const { error } = await resetPassword(email);
        
        if (error) {
          console.error('Auth: Password reset error:', error);
          toast({
            title: "❌ Erro ao enviar email",
            description: error.message || "Erro ao enviar email de redefinição",
            variant: "destructive",
          });
        } else {
          console.log('Auth: Password reset email sent');
          toast({
            title: "✅ Email enviado!",
            description: "Verifique sua caixa de entrada para redefinir sua senha.",
          });
          setMode('login');
        }
      } catch (error: any) {
        console.error('Auth: Unexpected password reset error:', error);
        toast({
          title: "❌ Erro ao enviar email",
          description: error.message || "Erro interno",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Show loading while checking auth state
  if (loading || accessLevelLoading) {
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

  console.log('Auth: Rendering admin login form in mode:', mode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-[#1bccae] to-emerald-500 text-white rounded-t-lg">
          <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            {mode === 'login' ? (
              <>
                <Shield className="h-6 w-6" />
                Acesso Administrador
              </>
            ) : (
              <>
                <Mail className="h-6 w-6" />
                Redefinir Senha
              </>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Área Administrativa</span>
            </div>
            <p className="text-sm text-emerald-600">
              Esta área é exclusiva para administradores do sistema LigueLead.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold">E-mail Administrativo</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@liguelead.com.br"
                required
                disabled={isLoading}
                className="h-12 border-emerald-200 focus:border-[#1bccae]"
              />
            </div>
            
            {mode === 'login' && (
              <div>
                <Label htmlFor="password" className="text-gray-700 font-semibold">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha administrativa"
                  required
                  disabled={isLoading}
                  className="h-12 border-emerald-200 focus:border-[#1bccae]"
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#1bccae] hover:bg-emerald-600 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {mode === 'login' ? 'Verificando...' : 'Enviando...'}
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  {mode === 'login' ? "Acessar Dashboard" : "Enviar Email de Redefinição"}
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 space-y-2">
            {mode === 'login' ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => setMode('reset')}
                  disabled={isLoading}
                  className="w-full text-[#1bccae] hover:bg-emerald-50"
                >
                  Esqueci minha senha
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  disabled={isLoading}
                  className="w-full text-[#1bccae] border-[#1bccae] hover:bg-emerald-50 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Relatório
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setMode('login')}
                disabled={isLoading}
                className="w-full text-[#1bccae] border-[#1bccae] hover:bg-emerald-50 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
