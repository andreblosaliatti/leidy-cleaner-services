import { useState, type FormEvent } from 'react';

import { statusAprovacaoProfissionalOptions } from './profissionalLabels';
import type { StatusAprovacaoProfissional } from './types';

type AprovacaoProfissionalFormProps = {
  initialProfissionalId?: number;
  initialStatus?: StatusAprovacaoProfissional;
  isSubmitting: boolean;
  onSubmit: (values: { profissionalId: number; statusAprovacao: StatusAprovacaoProfissional }) => void;
};

export function AprovacaoProfissionalForm({
  initialProfissionalId,
  initialStatus = 'EM_ANALISE',
  isSubmitting,
  onSubmit,
}: AprovacaoProfissionalFormProps) {
  const [profissionalId, setProfissionalId] = useState(initialProfissionalId ? String(initialProfissionalId) : '');
  const [statusAprovacao, setStatusAprovacao] = useState<StatusAprovacaoProfissional>(initialStatus);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const hasFixedId = Boolean(initialProfissionalId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedId = Number(profissionalId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      setValidationMessage('Informe um ID de profissional válido.');
      return;
    }

    setValidationMessage(null);
    onSubmit({ profissionalId: parsedId, statusAprovacao });
  }

  return (
    <form className="grid gap-4 rounded-lg border border-slate-100 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
      {!hasFixedId && (
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          ID do perfil profissional
          <input
            className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
            disabled={isSubmitting}
            inputMode="numeric"
            type="text"
            value={profissionalId}
            onChange={(event) => setProfissionalId(event.target.value)}
          />
        </label>
      )}

      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Status de aprovação
        <select
          className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
          disabled={isSubmitting}
          value={statusAprovacao}
          onChange={(event) => setStatusAprovacao(event.target.value as StatusAprovacaoProfissional)}
        >
          {statusAprovacaoProfissionalOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {validationMessage && <p className="text-sm font-semibold text-red-700">{validationMessage}</p>}

      <button
        className="min-h-11 rounded-lg bg-green-700 px-5 text-sm font-black text-white transition hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Enviando...' : 'Salvar aprovação'}
      </button>
    </form>
  );
}
