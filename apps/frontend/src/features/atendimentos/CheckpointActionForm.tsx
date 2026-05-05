import { useState } from 'react';
import type { FormEvent } from 'react';

import type { CheckpointServicoRequest } from './types';

type CheckpointActionFormProps = {
  actionLabel: string;
  isSubmitting: boolean;
  onSubmit: (payload: CheckpointServicoRequest) => void;
  tone?: 'start' | 'finish';
};

export function CheckpointActionForm({ actionLabel, isSubmitting, onSubmit, tone = 'start' }: CheckpointActionFormProps) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [fotoComprovacaoUrl, setFotoComprovacaoUrl] = useState('');
  const [observacao, setObservacao] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      latitude: parseOptionalNumber(latitude),
      longitude: parseOptionalNumber(longitude),
      fotoComprovacaoUrl: emptyToNull(fotoComprovacaoUrl),
      observacao: emptyToNull(observacao),
    });
  }

  return (
    <form className="grid gap-4 rounded-lg border border-slate-100 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
      <div>
        <h3 className="text-xl font-black text-slate-900">{actionLabel}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Os campos são opcionais no contrato atual. O backend valida o status e registra o checkpoint.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Latitude
          <input
            className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
            inputMode="decimal"
            placeholder="-30.000000"
            type="text"
            value={latitude}
            onChange={(event) => setLatitude(event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Longitude
          <input
            className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
            inputMode="decimal"
            placeholder="-51.000000"
            type="text"
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-slate-700">
        URL da evidência
        <input
          className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
          placeholder="local/checkpoints/evidencia.png"
          type="text"
          value={fotoComprovacaoUrl}
          onChange={(event) => setFotoComprovacaoUrl(event.target.value)}
        />
      </label>

      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Observação
        <textarea
          className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
          maxLength={1000}
          value={observacao}
          onChange={(event) => setObservacao(event.target.value)}
        />
      </label>

      <button
        className={[
          'min-h-11 rounded-lg px-5 text-sm font-black text-white transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-slate-300',
          tone === 'finish'
            ? 'bg-slate-900 hover:bg-slate-800 focus-visible:ring-slate-700'
            : 'bg-cyan-700 hover:bg-cyan-800 focus-visible:ring-cyan-700',
        ].join(' ')}
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Enviando...' : actionLabel}
      </button>
    </form>
  );
}

function parseOptionalNumber(value: string) {
  const normalized = value.trim().replace(',', '.');

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
