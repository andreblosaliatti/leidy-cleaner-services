import { useState, type FormEvent } from 'react';

import { isValidNotaAvaliacao, notaAvaliacaoOptions } from './avaliacaoLabels';

type AvaliacaoFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: { nota: number; comentario: string | null }) => void;
};

export function AvaliacaoForm({ isSubmitting, onSubmit }: AvaliacaoFormProps) {
  const [nota, setNota] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidNotaAvaliacao(nota)) {
      setValidationMessage('Escolha uma nota de 1 a 5.');
      return;
    }

    setValidationMessage(null);
    onSubmit({
      nota,
      comentario: emptyToNull(comentario),
    });
  }

  return (
    <form className="grid gap-4 rounded-lg border border-slate-100 bg-white p-5 shadow-sm md:p-6" onSubmit={handleSubmit}>
      <div>
        <h3 className="text-xl font-black text-slate-900">Avaliar profissional</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Registre sua nota para o atendimento finalizado.</p>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-black text-slate-800">Nota</legend>
        <div className="grid grid-cols-5 gap-2 sm:max-w-md">
          {notaAvaliacaoOptions.map((option) => (
            <label
              key={option}
              className={[
                'flex min-h-12 cursor-pointer items-center justify-center rounded-lg border text-sm font-black transition',
                nota === option
                  ? 'border-green-700 bg-green-50 text-green-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-green-200 hover:bg-green-50',
              ].join(' ')}
            >
              <input
                className="sr-only"
                checked={nota === option}
                disabled={isSubmitting}
                name="nota"
                type="radio"
                value={option}
                onChange={() => setNota(option)}
              />
              {option}
            </label>
          ))}
        </div>
        {validationMessage && <p className="text-sm font-semibold text-red-700">{validationMessage}</p>}
      </fieldset>

      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Comentário opcional
        <textarea
          className="min-h-28 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
          disabled={isSubmitting}
          maxLength={1000}
          value={comentario}
          onChange={(event) => setComentario(event.target.value)}
        />
      </label>

      <button
        className="min-h-11 rounded-lg bg-green-700 px-5 text-sm font-black text-white transition hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </form>
  );
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
