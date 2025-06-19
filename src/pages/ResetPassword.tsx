
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if we have a valid session for password reset
  useEffect(() => {
    const checkSession = async () => {
      console.log('ResetPassword: Checking session validity');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('ResetPassword: Session error:', error);
          setIsValidSession(false);
        } else if (session) {
          console.log('ResetPassword: Valid session found');
          setIsValidSession(true);
        } else {
          console.log('ResetPassword: No valid session');
          setIsValidSession(false);
        }
      } catch (error) {
        console.error('ResetPassword: Error checking session:', error);
        setIsValidSession(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    // Validate passwords
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "❌ Senha inválida",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "❌ Senhas não coincidem",
        description: "As senhas digitadas não são iguais",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('ResetPassword: Attempting to update password');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('ResetPassword: Update password error:', error);
        toast({
          title: "❌ Erro ao redefinir senha",
          description: error.message || "Não foi possível redefinir a senha",
          variant: "destructive",
        });
      } else {
        console.log('ResetPassword: Password updated successfully');
        toast({
          title: "✅ Senha redefinida com sucesso!",
          description: "Sua senha foi alterada. Redirecionando...",
        });
        
        // Redirect to dashboard after success
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      console.error('ResetPassword: Unexpected error:', error);
      toast({
        title: "❌ Erro interno",
        description: error.message || "Erro inesperado ao redefinir senha",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1bccae] mx-auto mb-4" />
          <p className="text-gray-600">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  // Show error if no valid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-emerald-200">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
            <CardTitle className="text-center text-2xl font-bold">
              Link Inválido
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-6">
              O link de redefinição de senha é inválido ou expirou. 
              Solicite um novo link de redefinição.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/auth?mode=reset')}
                className="w-full bg-[#1bccae] hover:bg-emerald-600"
              >
                Solicitar Nova Redefinição
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="w-full text-[#1bccae] border-[#1bccae] hover:bg-emerald-50 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-[#1bccae] to-emerald-500 text-white rounded-t-lg">
          <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Lock className="h-6 w-6" />
            Redefinir Senha
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-gray-700 font-semibold">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  required
                  disabled={isLoading}
                  className="h-12 border-emerald-200 focus:border-[#1bccae] pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  required
                  disabled={isLoading}
                  className="h-12 border-emerald-200 focus:border-[#1bccae] pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#1bccae] hover:bg-emerald-600 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir Senha"
              )}
            </Button>
          </form>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              disabled={isLoading}
              className="w-full text-[#1bccae] border-[#1bccae] hover:bg-emerald-50 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
