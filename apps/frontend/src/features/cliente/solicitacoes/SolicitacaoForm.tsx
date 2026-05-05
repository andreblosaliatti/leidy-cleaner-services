import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { TextArea, TextInput } from '../../../components/ui/FormField';
import { formatEnderecoResumo } from '../enderecos/enderecoLabels';
import type { Endereco } from '../enderecos/types';
import { normalizeBairro } from './solicitacaoDisplay';
import { tipoServicoOptions } from './solicitacaoLabels';
import type { RegiaoAtendimento, SolicitacaoFaxinaRequest, TipoServico } from './types';

const positiveInteger = z.preprocess(
  (value) => Number(value),
  z
    .number({ invalid_type_error: 'Informe um número válido.' })
    .int('Informe um número inteiro.')
    .min(1, 'Informe ao menos 1 hora.'),
);

const optionalText = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().max(2000, 'Use uma observação menor.').optional(),
);

const solicitacaoSchema = z.object({
  enderecoId: z.coerce.number().min(1, 'Selecione um endereço.'),
  tipoServico: z.enum(['FAXINA_RESIDENCIAL', 'FAXINA_COMERCIAL', 'FAXINA_CONDOMINIO', 'FAXINA_EVENTO'], {
    required_error: 'Selecione o tipo de serviço.',
  }),
  dataHoraDesejada: z
    .string()
    .min(1, 'Informe data e horário.')
    .refine((value) => new Date(value).getTime() > Date.now(), 'Escolha uma data e horário futuros.'),
  duracaoEstimadaHoras: positiveInteger,
  observacoes: optionalText,
});

type SolicitacaoFormValues = z.infer<typeof solicitacaoSchema>;

type SolicitacaoFormProps = {
  enderecos: Endereco[];
  regioes: RegiaoAtendimento[];
  isSubmitting?: boolean;
  onSubmit: (payload: SolicitacaoFaxinaRequest) => void | Promise<void>;
};

export function SolicitacaoForm({ enderecos, regioes, isSubmitting = false, onSubmit }: SolicitacaoFormProps) {
  const [bairroError, setBairroError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SolicitacaoFormValues>({
    resolver: zodResolver(solicitacaoSchema),
    defaultValues: {
      enderecoId: 0,
      tipoServico: 'FAXINA_RESIDENCIAL',
      dataHoraDesejada: '',
      duracaoEstimadaHoras: 4,
      observacoes: undefined,
    },
  });

  const selectedEnderecoId = watch('enderecoId');
  const selectedEndereco = enderecos.find((endereco) => endereco.id === Number(selectedEnderecoId));
  const derivedRegiao = useMemo(() => {
    if (!selectedEndereco) {
      return undefined;
    }

    const bairro = normalizeBairro(selectedEndereco.bairro);
    return regioes.find((regiao) => regiao.ativo && normalizeBairro(regiao.nome) === bairro);
  }, [regioes, selectedEndereco]);
  const selectedUnsupportedBairro = Boolean(selectedEndereco && !derivedRegiao);

  async function handleValidSubmit(values: SolicitacaoFormValues) {
    if (!derivedRegiao) {
      setBairroError('Ainda não atendemos este bairro.');
      return;
    }

    setBairroError(null);
    await onSubmit({
      enderecoId: values.enderecoId,
      regiaoId: derivedRegiao.id,
      dataHoraDesejada: new Date(values.dataHoraDesejada).toISOString(),
      duracaoEstimadaHoras: values.duracaoEstimadaHoras,
      tipoServico: values.tipoServico as TipoServico,
      observacoes: values.observacoes ?? null,
    });
    reset();
    setBairroError(null);
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit(handleValidSubmit)}>
      <div className="grid gap-5">
        <label className="block" htmlFor="enderecoId">
          <span className="text-sm font-black text-slate-800">Endereço</span>
          <select
            id="enderecoId"
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            onInput={() => setBairroError(null)}
            {...register('enderecoId')}
          >
            <option value={0}>Selecione um endereço</option>
            {enderecos.map((endereco) => (
              <option key={endereco.id} value={endereco.id}>
                {formatEnderecoResumo(endereco)}
              </option>
            ))}
          </select>
          {errors.enderecoId?.message && <span className="mt-2 block text-sm text-red-700">{errors.enderecoId.message}</span>}
        </label>

        {selectedEndereco && (
          <div
            className={[
              'rounded-lg border px-4 py-3 text-sm leading-6',
              selectedUnsupportedBairro ? 'border-red-100 bg-red-50 text-red-800' : 'border-cyan-100 bg-cyan-50 text-cyan-900',
            ].join(' ')}
          >
            {selectedUnsupportedBairro ? (
              <p className="font-semibold">Ainda não atendemos este bairro.</p>
            ) : (
              <p className="font-semibold">Bairro atendido: {derivedRegiao?.nome}</p>
            )}
          </div>
        )}

        {bairroError && <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{bairroError}</p>}
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_1fr_0.7fr]">
        <label className="block" htmlFor="tipoServico">
          <span className="text-sm font-black text-slate-800">Tipo de serviço</span>
          <select
            id="tipoServico"
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            {...register('tipoServico')}
          >
            {tipoServicoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.tipoServico?.message && <span className="mt-2 block text-sm text-red-700">{errors.tipoServico.message}</span>}
        </label>

        <TextInput
          error={errors.dataHoraDesejada?.message}
          label="Data e horário desejados"
          registration={register('dataHoraDesejada')}
          type="datetime-local"
        />
        <TextInput
          error={errors.duracaoEstimadaHoras?.message}
          label="Duração estimada"
          min={1}
          registration={register('duracaoEstimadaHoras')}
          type="number"
        />
      </div>

      <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700">
        Valor será calculado conforme a duração informada.
      </div>

      <TextArea
        error={errors.observacoes?.message}
        helperText="Opcional"
        label="Observações"
        placeholder="Detalhes sobre acesso, preferências ou cuidados no local"
        registration={register('observacoes')}
      />

      <div className="flex justify-end">
        <button
          className="min-h-11 rounded-lg bg-cyan-700 px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(14,138,141,0.18)] transition hover:bg-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          disabled={isSubmitting || enderecos.length === 0 || regioes.length === 0 || selectedUnsupportedBairro}
          type="submit"
        >
          {isSubmitting ? 'Criando...' : 'Criar solicitação'}
        </button>
      </div>
    </form>
  );
}
