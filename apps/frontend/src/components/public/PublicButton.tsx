import type { AnchorHTMLAttributes, ReactNode } from 'react';

type PublicButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'light';
};

const variantClassName = {
  primary: 'bg-green-700 text-white shadow-[0_14px_28px_rgba(21,128,61,0.22)] hover:bg-green-800 focus-visible:ring-green-700',
  secondary: 'border border-green-700 bg-white text-green-700 hover:bg-green-50 focus-visible:ring-green-700',
  light: 'bg-white text-green-700 shadow-[0_12px_24px_rgba(15,23,42,0.12)] hover:bg-green-50 focus-visible:ring-white',
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
