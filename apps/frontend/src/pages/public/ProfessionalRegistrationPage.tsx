import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';
import { z } from 'zod';

import { FormAlert } from '../../components/ui/FormAlert';
import { TextArea, TextInput } from '../../components/ui/FormField';
import { getDashboardPath } from '../../features/auth/session';
import { useAuth } from '../../features/auth/useAuth';
import { AuthPageLayout } from '../../layouts/AuthPageLayout';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const optionalTrimmedText = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().max(1000, 'Use no máximo 1000 caracteres.').optional(),
);

const optionalNonNegativeInteger = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    return Number(value);
  },
  z
    .number({ invalid_type_error: 'Informe um número válido.' })
    .int('Informe um número inteiro.')
    .min(0, 'Informe zero ou mais anos.')
    .optional(),
);

const professionalRegistrationSchema = z
  .object({
    nomeCompleto: z.string().trim().min(3, 'Informe seu nome completo.').max(160, 'Use no máximo 160 caracteres.'),
    nomeExibicao: z.string().trim().min(2, 'Informe seu nome de exibição.').max(160, 'Use no máximo 160 caracteres.'),
    email: z.string().trim().min(1, 'Informe seu email.').email('Informe um email válido.').max(255, 'Use no máximo 255 caracteres.'),
    telefone: z.string().trim().min(8, 'Informe um telefone válido.').max(30, 'Use no máximo 30 caracteres.'),
    cpf: z.string().trim().min(11, 'Informe seu CPF.').max(14, 'Use no máximo 14 caracteres.'),
    dataNascimento: z
      .string()
      .min(1, 'Informe sua data de nascimento.')
      .refine((value) => {
        const date = new Date(`${value}T00:00:00`);
        return !Number.isNaN(date.getTime()) && date < new Date();
      }, 'A data de nascimento deve estar no passado.'),
    descricao: optionalTrimmedText,
    experienciaAnos: optionalNonNegativeInteger,
    senha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.').max(120, 'Use no máximo 120 caracteres.'),
    confirmarSenha: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((values) => values.senha === values.confirmarSenha, {
    message: 'As senhas devem ser iguais.',
    path: ['confirmarSenha'],
  });

type ProfessionalRegistrationFormValues = z.infer<typeof professionalRegistrationSchema>;

export function ProfessionalRegistrationPage() {
  const { registerProfissional, user } = useAuth();
  const [submitError, setSubmitError] = useState<{ message: string; details: string[] } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfessionalRegistrationFormValues>({
    resolver: zodResolver(professionalRegistrationSchema),
    defaultValues: {
      nomeCompleto: '',
      nomeExibicao: '',
      email: '',
      telefone: '',
      cpf: '',
      dataNascimento: '',
      descricao: undefined,
      experienciaAnos: undefined,
      senha: '',
      confirmarSenha: '',
    },
  });

  if (user) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  async function onSubmit(values: ProfessionalRegistrationFormValues) {
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await registerProfissional({
        nomeCompleto: values.nomeCompleto.trim(),
        nomeExibicao: values.nomeExibicao.trim(),
        email: values.email.trim(),
        telefone: values.telefone.trim(),
        cpf: values.cpf.trim(),
        dataNascimento: values.dataNascimento,
        descricao: values.descricao,
        experienciaAnos: values.experienciaAnos,
        senha: values.senha,
      });

      setSuccessMessage('Cadastro profissional criado. Entre com seu email e senha para acompanhar as próximas etapas.');
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
      eyebrow="Conta profissional"
      title="Receba oportunidades com acompanhamento operacional."
      description="Cadastre seu perfil profissional para atuar na plataforma com verificações e organização de agenda."
    >
      <div>
        <h2 className="text-2xl font-black text-slate-900">Cadastro profissional</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Informe seus dados principais para iniciar o cadastro.</p>

        <form className="mt-6 grid gap-5" noValidate onSubmit={handleSubmit(onSubmit)}>
          {submitError && (
            <FormAlert tone="error" title="Não foi possível criar o cadastro" message={submitError.message} details={submitError.details} />
          )}
          {successMessage && <FormAlert tone="success" title="Cadastro criado" message={successMessage} />}

          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              autoComplete="name"
              error={errors.nomeCompleto?.message}
              label="Nome completo"
              placeholder="Seu nome completo"
              registration={register('nomeCompleto')}
              type="text"
            />
            <TextInput
              error={errors.nomeExibicao?.message}
              label="Nome de exibição"
              placeholder="Como clientes verão seu nome"
              registration={register('nomeExibicao')}
              type="text"
            />
          </div>

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
              autoComplete="off"
              error={errors.cpf?.message}
              label="CPF"
              placeholder="000.000.000-00"
              registration={register('cpf')}
              type="text"
            />
            <TextInput
              error={errors.dataNascimento?.message}
              label="Data de nascimento"
              registration={register('dataNascimento')}
              type="date"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              error={errors.experienciaAnos?.message}
              label="Experiência em anos"
              min={0}
              placeholder="Opcional"
              registration={register('experienciaAnos')}
              type="number"
            />
          </div>

          <TextArea
            error={errors.descricao?.message}
            helperText="Opcional"
            label="Descrição profissional"
            placeholder="Conte brevemente sobre sua experiência"
            registration={register('descricao')}
          />

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
            {isSubmitting ? 'Criando cadastro...' : 'Cadastrar como profissional'}
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
