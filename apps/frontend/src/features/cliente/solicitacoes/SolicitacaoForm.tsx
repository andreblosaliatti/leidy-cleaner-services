import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { TextArea, TextInput } from '../../../components/ui/FormField';
import type { Endereco } from '../enderecos/types';
import { tipoServicoOptions } from './solicitacaoLabels';
import type { RegiaoAtendimento, SolicitacaoFaxinaRequest, TipoServico } from './types';

const moneyNumber = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    return Number(String(value).replace(',', '.'));
  },
  z
    .number({ invalid_type_error: 'Informe um valor válido.' })
    .min(0, 'Informe um valor maior ou igual a zero.'),
);

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
  regiaoId: z.coerce.number().min(1, 'Selecione uma região.'),
  tipoServico: z.enum(['FAXINA_RESIDENCIAL', 'FAXINA_COMERCIAL', 'FAXINA_CONDOMINIO', 'FAXINA_EVENTO'], {
    required_error: 'Selecione o tipo de serviço.',
  }),
  dataHoraDesejada: z
    .string()
    .min(1, 'Informe data e horário.')
    .refine((value) => new Date(value).getTime() > Date.now(), 'Escolha uma data e horário futuros.'),
  duracaoEstimadaHoras: positiveInteger,
  observacoes: optionalText,
  valorServico: moneyNumber,
  percentualComissaoAgencia: moneyNumber,
  valorEstimadoProfissional: moneyNumber,
});

type SolicitacaoFormValues = z.infer<typeof solicitacaoSchema>;

type SolicitacaoFormProps = {
  enderecos: Endereco[];
  regioes: RegiaoAtendimento[];
  isSubmitting?: boolean;
  onSubmit: (payload: SolicitacaoFaxinaRequest) => void | Promise<void>;
};

export function SolicitacaoForm({ enderecos, regioes, isSubmitting = false, onSubmit }: SolicitacaoFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SolicitacaoFormValues>({
    resolver: zodResolver(solicitacaoSchema),
    defaultValues: {
      enderecoId: 0,
      regiaoId: 0,
      tipoServico: 'FAXINA_RESIDENCIAL',
      dataHoraDesejada: '',
      duracaoEstimadaHoras: 4,
      observacoes: undefined,
      valorServico: 0,
      percentualComissaoAgencia: 0,
      valorEstimadoProfissional: 0,
    },
  });

  async function handleValidSubmit(values: SolicitacaoFormValues) {
    await onSubmit({
      enderecoId: values.enderecoId,
      regiaoId: values.regiaoId,
      dataHoraDesejada: new Date(values.dataHoraDesejada).toISOString(),
      duracaoEstimadaHoras: values.duracaoEstimadaHoras,
      tipoServico: values.tipoServico as TipoServico,
      observacoes: values.observacoes ?? null,
      valorServico: values.valorServico,
      percentualComissaoAgencia: values.percentualComissaoAgencia,
      valorEstimadoProfissional: values.valorEstimadoProfissional,
    });
    reset();
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit(handleValidSubmit)}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block" htmlFor="enderecoId">
          <span className="text-sm font-black text-slate-800">Endereço</span>
          <select
            id="enderecoId"
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            {...register('enderecoId')}
          >
            <option value={0}>Selecione um endereço</option>
            {enderecos.map((endereco) => (
              <option key={endereco.id} value={endereco.id}>
                {endereco.logradouro}, {endereco.numero} - {endereco.bairro}
              </option>
            ))}
          </select>
          {errors.enderecoId?.message && <span className="mt-2 block text-sm text-red-700">{errors.enderecoId.message}</span>}
        </label>

        <label className="block" htmlFor="regiaoId">
          <span className="text-sm font-black text-slate-800">Região de atendimento</span>
          <select
            id="regiaoId"
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            {...register('regiaoId')}
          >
            <option value={0}>Selecione uma região</option>
            {regioes.map((regiao) => (
              <option key={regiao.id} value={regiao.id}>
                {regiao.nome}
              </option>
            ))}
          </select>
          {errors.regiaoId?.message && <span className="mt-2 block text-sm text-red-700">{errors.regiaoId.message}</span>}
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_1fr_0.7fr]">
        <label className="block" htmlFor="tipoServico">
          <span className="text-sm font-black text-slate-800">Tipo de serviço</span>
          <select
            id="tipoServico"
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
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

      <div className="grid gap-5 md:grid-cols-3">
        <TextInput
          error={errors.valorServico?.message}
          helperText="Obrigatório pelo contrato atual"
          label="Valor do serviço"
          min={0}
          registration={register('valorServico')}
          step="0.01"
          type="number"
        />
        <TextInput
          error={errors.percentualComissaoAgencia?.message}
          helperText="Obrigatório pelo contrato atual"
          label="Comissão da agência (%)"
          min={0}
          registration={register('percentualComissaoAgencia')}
          step="0.01"
          type="number"
        />
        <TextInput
          error={errors.valorEstimadoProfissional?.message}
          helperText="Obrigatório pelo contrato atual"
          label="Valor estimado profissional"
          min={0}
          registration={register('valorEstimadoProfissional')}
          step="0.01"
          type="number"
        />
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
          className="min-h-11 rounded-lg bg-green-700 px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(21,128,61,0.18)] transition hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          disabled={isSubmitting || enderecos.length === 0 || regioes.length === 0}
          type="submit"
        >
          {isSubmitting ? 'Criando...' : 'Criar solicitação'}
        </button>
      </div>
    </form>
  );
}
