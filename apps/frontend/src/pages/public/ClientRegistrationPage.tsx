import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';
import { z } from 'zod';

import { FormAlert } from '../../components/ui/FormAlert';
import { TextInput } from '../../components/ui/FormField';
import { getDashboardPath } from '../../features/auth/session';
import { useAuth } from '../../features/auth/useAuth';
import { AuthPageLayout } from '../../layouts/AuthPageLayout';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const clientRegistrationSchema = z
  .object({
    nomeCompleto: z.string().trim().min(3, 'Informe seu nome completo.').max(160, 'Use no máximo 160 caracteres.'),
    email: z.string().trim().min(1, 'Informe seu email.').email('Informe um email válido.').max(255, 'Use no máximo 255 caracteres.'),
    telefone: z.string().trim().min(8, 'Informe um telefone válido.').max(30, 'Use no máximo 30 caracteres.'),
    senha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.').max(120, 'Use no máximo 120 caracteres.'),
    confirmarSenha: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((values) => values.senha === values.confirmarSenha, {
    message: 'As senhas devem ser iguais.',
    path: ['confirmarSenha'],
  });

type ClientRegistrationFormValues = z.infer<typeof clientRegistrationSchema>;

export function ClientRegistrationPage() {
  const { registerCliente, user } = useAuth();
  const [submitError, setSubmitError] = useState<{ message: string; details: string[] } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientRegistrationFormValues>({
    resolver: zodResolver(clientRegistrationSchema),
    defaultValues: {
      nomeCompleto: '',
      email: '',
      telefone: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  if (user) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  async function onSubmit(values: ClientRegistrationFormValues) {
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await registerCliente({
        nomeCompleto: values.nomeCompleto.trim(),
        email: values.email.trim(),
        telefone: values.telefone.trim(),
        senha: values.senha,
      });

      setSuccessMessage('Cadastro de cliente criado. Agora entre com seu email e senha para continuar.');
      reset();
    } catch (error) {
      setSubmitError({
        message: getApiErrorMessage(error),
        details: error instanceof ApiError ? error.errors : [],
      });
    }
  }

  return (
    <AuthPageLayout
      eyebrow="Conta de cliente"
      title="Organize sua faxina com praticidade e acompanhamento."
      description="Crie sua conta para contratar serviços de limpeza com profissionais verificadas."
    >
      <div>
        <h2 className="text-2xl font-black text-slate-900">Criar conta de cliente</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Preencha seus dados principais para iniciar seu cadastro.</p>

        <form className="mt-6 grid gap-5" noValidate onSubmit={handleSubmit(onSubmit)}>
          {submitError && (
            <FormAlert tone="error" title="Não foi possível criar o cadastro" message={submitError.message} details={submitError.details} />
          )}
          {successMessage && <FormAlert tone="success" title="Cadastro criado" message={successMessage} />}

          <TextInput
            autoComplete="name"
            error={errors.nomeCompleto?.message}
            label="Nome completo"
            placeholder="Seu nome completo"
            registration={register('nomeCompleto')}
            type="text"
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              autoComplete="email"
              error={errors.email?.message}
              label="Email"
              placeholder="voce@email.com"
              registration={register('email')}
              type="email"
            />
            <TextInput
              autoComplete="tel"
              error={errors.telefone?.message}
              label="Telefone"
              placeholder="(51) 99999-9999"
              registration={register('telefone')}
              type="tel"
            />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              autoComplete="new-password"
              error={errors.senha?.message}
              label="Senha"
              placeholder="Mínimo de 8 caracteres"
              registration={register('senha')}
              type="password"
            />
            <TextInput
              autoComplete="new-password"
              error={errors.confirmarSenha?.message}
              label="Confirmar senha"
              placeholder="Repita sua senha"
              registration={register('confirmarSenha')}
              type="password"
            />
          </div>

          <button
            className="min-h-12 rounded-lg bg-green-700 px-6 text-sm font-black text-white shadow-[0_14px_28px_rgba(21,128,61,0.22)] transition hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Já tem conta?{' '}
          <Link className="font-black text-green-700 hover:text-green-800" to="/entrar">
            Entrar
          </Link>
        </p>
      </div>
    </AuthPageLayout>
  );
}
