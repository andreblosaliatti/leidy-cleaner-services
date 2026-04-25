import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

type BaseFieldProps = {
  label: string;
  error?: string;
  helperText?: string;
};

type TextInputProps = BaseFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    registration: UseFormRegisterReturn;
  };

type TextAreaProps = BaseFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    registration: UseFormRegisterReturn;
  };

const fieldClassName =
  'min-h-12 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-50';

export function TextInput({ label, error, helperText, registration, id, ...props }: TextInputProps) {
  const fieldId = id ?? registration.name;

  return (
    <label className="block" htmlFor={fieldId}>
      <span className="text-sm font-black text-slate-800">{label}</span>
      <input
        id={fieldId}
        className={`${fieldClassName} mt-2 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? `${fieldId}-support` : undefined}
        {...registration}
        {...props}
      />
      {(error || helperText) && (
        <span id={`${fieldId}-support`} className={`mt-2 block text-sm leading-5 ${error ? 'text-red-700' : 'text-slate-500'}`}>
          {error ?? helperText}
        </span>
      )}
    </label>
  );
}

export function TextArea({ label, error, helperText, registration, id, ...props }: TextAreaProps) {
  const fieldId = id ?? registration.name;

  return (
    <label className="block" htmlFor={fieldId}>
      <span className="text-sm font-black text-slate-800">{label}</span>
      <textarea
        id={fieldId}
        className={`${fieldClassName} mt-2 min-h-28 resize-y ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? `${fieldId}-support` : undefined}
        {...registration}
        {...props}
      />
      {(error || helperText) && (
        <span id={`${fieldId}-support`} className={`mt-2 block text-sm leading-5 ${error ? 'text-red-700' : 'text-slate-500'}`}>
          {error ?? helperText}
        </span>
      )}
    </label>
  );
}
