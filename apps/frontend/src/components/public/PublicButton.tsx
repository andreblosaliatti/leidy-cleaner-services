import type { AnchorHTMLAttributes, ReactNode } from 'react';

type PublicButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'light';
};

const variantClassName = {
  primary: 'bg-cyan-500 text-white shadow-[0_14px_28px_rgba(6,182,212,0.22)] hover:bg-cyan-600 focus-visible:ring-cyan-400',
  secondary: 'border border-cyan-500 bg-white text-cyan-700 hover:bg-cyan-50 focus-visible:ring-cyan-400',
  light: 'bg-white text-cyan-700 shadow-[0_12px_24px_rgba(15,23,42,0.12)] hover:bg-cyan-50 focus-visible:ring-white',
};

export function PublicButton({ children, className = '', variant = 'primary', ...props }: PublicButtonProps) {
  return (
    <a
      className={[
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        variantClassName[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </a>
  );
}
