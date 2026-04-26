import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { TextInput } from '../../../components/ui/FormField';
import type { DocumentoVerificacaoRequest } from '../perfil/types';

const optionalUrlMetadata = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().max(500, 'Use no máximo 500 caracteres.').optional(),
);

const verificacaoSchema = z.object({
  tipoDocumento: z.string().trim().min(1, 'Informe o tipo de documento.').max(40, 'Use no máximo 40 caracteres.'),
  numeroDocumento: z.string().trim().min(1, 'Informe o número do documento.').max(80, 'Use no máximo 80 caracteres.'),
  documentoFrenteUrl: optionalUrlMetadata,
  documentoVersoUrl: optionalUrlMetadata,
  selfieUrl: optionalUrlMetadata,
  comprovanteResidenciaUrl: optionalUrlMetadata,
});

type VerificacaoFormValues = z.infer<typeof verificacaoSchema>;

type VerificacaoDocumentalFormProps = {
  isSubmitting?: boolean;
  onSubmit: (payload: DocumentoVerificacaoRequest) => void | Promise<void>;
};

export function VerificacaoDocumentalForm({ isSubmitting = false, onSubmit }: VerificacaoDocumentalFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VerificacaoFormValues>({
    resolver: zodResolver(verificacaoSchema),
    defaultValues: {
      tipoDocumento: '',
      numeroDocumento: '',
      documentoFrenteUrl: undefined,
      documentoVersoUrl: undefined,
      selfieUrl: undefined,
      comprovanteResidenciaUrl: undefined,
    },
  });

  async function handleValidSubmit(values: VerificacaoFormValues) {
    await onSubmit({
      tipoDocumento: values.tipoDocumento.trim(),
      numeroDocumento: values.numeroDocumento.trim(),
      documentoFrenteUrl: values.documentoFrenteUrl ?? null,
      documentoVersoUrl: values.documentoVersoUrl ?? null,
      selfieUrl: values.selfieUrl ?? null,
      comprovanteResidenciaUrl: values.comprovanteResidenciaUrl ?? null,
    });
    reset();
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit(handleValidSubmit)}>
      <div className="grid gap-5 md:grid-cols-2">
        <TextInput
          error={errors.tipoDocumento?.message}
          label="Tipo de documento"
          placeholder="RG, CPF ou CNH"
          registration={register('tipoDocumento')}
          type="text"
        />
        <TextInput
          error={errors.numeroDocumento?.message}
          label="Número do documento"
          placeholder="Número do documento"
          registration={register('numeroDocumento')}
          type="text"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TextInput
          error={errors.documentoFrenteUrl?.message}
          helperText="Opcional. Informe URL ou caminho já disponível."
          label="Documento frente"
          placeholder="URL ou caminho"
          registration={register('documentoFrenteUrl')}
          type="text"
        />
        <TextInput
          error={errors.documentoVersoUrl?.message}
          helperText="Opcional. Informe URL ou caminho já disponível."
          label="Documento verso"
          placeholder="URL ou caminho"
          registration={register('documentoVersoUrl')}
          type="text"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TextInput
          error={errors.selfieUrl?.message}
          helperText="Opcional. O backend atual recebe metadados em JSON."
          label="Selfie"
          placeholder="URL ou caminho"
          registration={register('selfieUrl')}
          type="text"
        />
        <TextInput
          error={errors.comprovanteResidenciaUrl?.message}
          helperText="Opcional. O backend atual recebe metadados em JSON."
          label="Comprovante de residência"
          placeholder="URL ou caminho"
          registration={register('comprovanteResidenciaUrl')}
          type="text"
        />
      </div>

      <div className="flex justify-end">
        <button
          className="min-h-11 rounded-lg bg-green-700 px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(21,128,61,0.18)] transition hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Enviando...' : 'Registrar verificação'}
        </button>
      </div>
    </form>
  );
}
