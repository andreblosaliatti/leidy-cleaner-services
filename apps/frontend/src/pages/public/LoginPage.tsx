import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { FormAlert } from '../../components/ui/FormAlert';
import { TextInput } from '../../components/ui/FormField';
import { getDashboardPath } from '../../features/auth/session';
import { useAuth } from '../../features/auth/useAuth';
import { AuthPageLayout } from '../../layouts/AuthPageLayout';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const loginSchema = z.object({
  email: z.string().min(1, 'Informe seu email.').email('Informe um email válido.'),
  senha: z.string().min(1, 'Informe sua senha.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<{ message: string; details: string[] } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  if (user) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);

    try {
      const authenticatedUser = await login(values);
      const redirectTo = new URLSearchParams(location.search).get('redirectTo');
      const destination = redirectTo?.startsWith('/app') ? redirectTo : getDashboardPath(authenticatedUser);

      navigate(destination, { replace: true });
    } catch (error) {
      setSubmitError({
        message: getApiErrorMessage(error),
        details: error instanceof ApiError ? error.errors : [],
      });
    }
  }

  return (
    <AuthPageLayout
      eyebrow="Acesso seguro"
      title="Entre para acompanhar sua jornada na Leidy Cleaner Services."
      description="Clientes, profissionais e administração acessam uma área organizada conforme seu perfil."
    >
      <div>
        <h2 className="text-2xl font-black text-slate-900">Entrar</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use o email e a senha cadastrados para acessar sua área.</p>

        <form className="mt-6 grid gap-5" noValidate onSubmit={handleSubmit(onSubmit)}>
          {submitError && <FormAlert tone="error" title="Não foi possível entrar" message={submitError.message} details={submitError.details} />}

          <TextInput
            autoComplete="email"
            error={errors.email?.message}
            label="Email"
            placeholder="voce@email.com"
            registration={register('email')}
            type="email"
          />
          <TextInput
            autoComplete="current-password"
            error={errors.senha?.message}
            label="Senha"
            placeholder="Sua senha"
            registration={register('senha')}
            type="password"
          />

          <button
            className="min-h-12 rounded-lg bg-green-700 px-6 text-sm font-black text-white shadow-[0_14px_28px_rgba(21,128,61,0.22)] transition hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 grid gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
          <p>
            Ainda não tem conta?{' '}
            <Link className="font-black text-green-700 hover:text-green-800" to="/cadastro/cliente">
              Criar conta de cliente
            </Link>
          </p>
          <p>
            Atua com limpeza?{' '}
            <Link className="font-black text-green-700 hover:text-green-800" to="/cadastro/profissional">
              Cadastrar como profissional
            </Link>
          </p>
        </div>
      </div>
    </AuthPageLayout>
  );
}
