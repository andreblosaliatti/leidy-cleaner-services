import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';

import { TextInput } from '../../../components/ui/FormField';
import { ImageUploadField } from '../../../components/ui/ImageUploadField';
import type { DocumentoVerificacaoRequest } from '../perfil/types';

const verificacaoSchema = z.object({
  tipoDocumento: z.string().trim().min(1, 'Informe o tipo de documento.').max(40, 'Use no máximo 40 caracteres.'),
  numeroDocumento: z.string().trim().min(1, 'Informe o número do documento.').max(80, 'Use no máximo 80 caracteres.'),
});

type VerificacaoFormValues = z.infer<typeof verificacaoSchema>;

type VerificacaoDocumentalFormProps = {
  isSubmitting?: boolean;
  onSubmit: (payload: DocumentoVerificacaoRequest) => void | Promise<void>;
};

export function VerificacaoDocumentalForm({ isSubmitting = false, onSubmit }: VerificacaoDocumentalFormProps) {
  const [documentoFrente, setDocumentoFrente] = useState<string | null>(null);
  const [documentoVerso, setDocumentoVerso] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [comprovanteResidencia, setComprovanteResidencia] = useState<string | null>(null);

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
    },
  });

  async function handleValidSubmit(values: VerificacaoFormValues) {
    await onSubmit({
      tipoDocumento: values.tipoDocumento.trim(),
      numeroDocumento: values.numeroDocumento.trim(),
      documentoFrenteUrl: documentoFrente,
      documentoVersoUrl: documentoVerso,
      selfieUrl: selfie,
      comprovanteResidenciaUrl: comprovanteResidencia,
    });
    reset();
    setDocumentoFrente(null);
    setDocumentoVerso(null);
    setSelfie(null);
    setComprovanteResidencia(null);
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
        <ImageUploadField
          label="Documento frente"
          helperText="Selecione uma imagem ou tire uma foto."
          allowCamera
          capture="environment"
          onChange={setDocumentoFrente}
          value={documentoFrente}
        />
        <ImageUploadField
          label="Documento verso"
          helperText="Selecione uma imagem ou tire uma foto."
          allowCamera
          capture="environment"
          onChange={setDocumentoVerso}
          value={documentoVerso}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ImageUploadField
          label="Selfie"
          helperText="Tire uma selfie para verificação."
          allowCamera
          capture="user"
          onChange={setSelfie}
          value={selfie}
        />
        <ImageUploadField
          label="Comprovante de residência"
          helperText="Selecione uma imagem ou tire uma foto."
          allowCamera
          capture="environment"
          onChange={setComprovanteResidencia}
          value={comprovanteResidencia}
        />
      </div>

      <div className="flex justify-end">
        <button
          className="min-h-11 rounded-lg bg-cyan-700 px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(14,138,141,0.18)] transition hover:bg-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Enviando...' : 'Registrar verificação'}
        </button>
      </div>
    </form>
  );
}
