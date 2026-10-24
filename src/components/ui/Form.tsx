import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: ReactNode; error?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-ink">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-bad">{error}</p> : hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

const control =
  'h-9 w-full rounded-md border border-line bg-white px-3 text-[13px] text-ink placeholder:text-subtle transition-colors hover:border-[#CDD6E0] focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(function Input({ className = '', invalid, ...rest }, ref) {
  return <input ref={ref} className={`${control} ${invalid ? '!border-bad' : ''} ${className}`} {...rest} />;
});

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select className={`${control} appearance-none pr-8`} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${control} pl-8 pr-8`} aria-label={placeholder} />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-subtle hover:text-ink">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[] }) {
  return (
    <div className="inline-flex flex-wrap rounded-md border border-line bg-canvas p-0.5" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors ${value === o.value ? 'bg-white text-ink shadow-card ring-1 ring-line' : 'text-muted hover:text-ink'}`}
        >
          {o.label}
          {o.count !== undefined && <span className={`tnum ${value === o.value ? 'text-muted' : 'text-subtle'}`}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${control} h-auto min-h-[76px] py-2 ${props.className ?? ''}`} />;
}
