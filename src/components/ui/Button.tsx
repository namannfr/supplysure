import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark border border-brand-dark/20',
  secondary: 'bg-white text-ink border border-line hover:bg-canvas hover:border-[#D3DBE4]',
  ghost: 'text-muted hover:text-ink hover:bg-canvas border border-transparent',
  dark: 'bg-navy text-white hover:bg-navy-deep border border-navy-deep',
  danger: 'bg-white text-bad border border-[#F1C9CC] hover:bg-bad-bg',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-3.5 text-[13px] gap-2',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'secondary', size = 'md', icon: Icon, iconRight: IconRight, className = '', children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />}
      {children}
      {IconRight && <IconRight className="h-4 w-4 shrink-0" strokeWidth={2} />}
    </button>
  );
});

export function IconButton({ label, icon: Icon, className = '', ...rest }: { label: string; icon: LucideIcon } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink ${className}`}
      {...rest}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
    </button>
  );
}
