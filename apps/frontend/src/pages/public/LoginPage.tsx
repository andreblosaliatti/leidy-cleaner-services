import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { FormAlert } from '../../components/ui/FormAlert';
import { TextInput } from '../../components/ui/FormField';
import { useAuth } from '../../features/auth/useAuth';
import {
  buildProfessionalAppOnlyLoginPath,
  getPreferredAuthenticatedPath,
  getProfessionalAppOnlyMessage,
  isNativeProfessionalApp,
  isProfessionalAppUser,
  PROFESSIONAL_APP_HOME_PATH,
  PROFESSIONAL_APP_ONLY_REASON,
} from '../../features/native/professionalApp';
import { AuthPageLayout } from '../../layouts/AuthPageLayout';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const loginSchema = z.object({
  email: z.string().min(1, 'Informe seu email.').email('Informe um email valido.'),
  senha: z.string().min(1, 'Informe sua senha.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, logout, status, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<{ message: string; details: string[] } | null>(null);
  const professionalAppOnlyMessage = useMemo(() => {
    const reason = new URLSearchParams(location.search).get('motivo');
    return reason === PROFESSIONAL_APP_ONLY_REASON ? getProfessionalAppOnlyMessage() : null;
  }, [location.search]);

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

  if (status === 'loading') {
    return (
      <AuthPageLayout
        eyebrow="Acesso seguro"
        title="Entre para acompanhar sua jornada na Leidy Cleaner Services."
        description="Restaurando sua sessao antes de liberar o acesso."
      >
        <div className="rounded-lg border border-cyan-100 bg-white px-6 py-5 text-sm font-semibold text-slate-700 shadow-sm">
          Carregando sua sessao...
        </div>
      </AuthPageLayout>
    );
  }

  if (user) {
    if (isNativeProfessionalApp() && !isProfessionalAppUser(user)) {
      return <Navigate to={buildProfessionalAppOnlyLoginPath()} replace />;
    }

    return <Navigate to={getPreferredAuthenticatedPath(user)} replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);

    try {
      const authenticatedUser = await login(values);

      if (isNativeProfessionalApp() && !isProfessionalAppUser(authenticatedUser)) {
        logout();
        blurActiveElement();
        navigate(buildProfessionalAppOnlyLoginPath(), { replace: true });
        return;
      }

      const redirectTo = new URLSearchParams(location.search).get('redirectTo');
      const destination = resolveLoginDestination(authenticatedUser, redirectTo);

      blurActiveElement();
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
      description="Clientes, profissionais e administracao acessam uma area organizada conforme seu perfil."
    >
      <div>
        <h2 className="text-2xl font-black text-slate-900">Entrar</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use o email e a senha cadastrados para acessar sua area.</p>

        <form className="mt-6 grid gap-5" noValidate onSubmit={handleSubmit(onSubmit)}>
          {professionalAppOnlyMessage && (
            <FormAlert tone="error" title="Acesso restrito" message={professionalAppOnlyMessage} />
          )}
          {submitError && <FormAlert tone="error" title="Nao foi possivel entrar" message={submitError.message} details={submitError.details} />}

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
            className="min-h-12 rounded-lg bg-cyan-700 px-6 text-sm font-black text-white shadow-[0_14px_28px_rgba(6,182,212,0.22)] transition hover:bg-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 grid gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
          <p>
            Ainda nao tem conta?{' '}
            <Link className="font-black text-cyan-700 hover:text-cyan-800" to="/cadastro/cliente">
              Criar conta de cliente
            </Link>
          </p>
          <p>
            Atua com limpeza?{' '}
            <Link className="font-black text-cyan-700 hover:text-cyan-800" to="/cadastro/profissional">
              Cadastrar como profissional
            </Link>
          </p>
        </div>
      </div>
    </AuthPageLayout>
  );
}

function resolveLoginDestination(
  authenticatedUser: Parameters<typeof getPreferredAuthenticatedPath>[0],
  redirectTo: string | null,
) {
  if (redirectTo?.startsWith('/app') || redirectTo?.startsWith('/profissional/app')) {
    return redirectTo;
  }

  if (isNativeProfessionalApp()) {
    return PROFESSIONAL_APP_HOME_PATH;
  }

  return getPreferredAuthenticatedPath(authenticatedUser);
}

function blurActiveElement() {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
}
