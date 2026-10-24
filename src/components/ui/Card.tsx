import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function CardHeader({ title, subtitle, actions, className = '' }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 border-b border-line-soft px-5 py-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ProgressBar({ value, tone, className = '' }: { value: number; tone?: 'ok' | 'warn' | 'bad' | 'brand'; className?: string }) {
  const t = tone ?? (value >= 80 ? 'ok' : value >= 50 ? 'warn' : 'bad');
  const color = { ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad', brand: 'bg-brand' }[t];
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-line-soft ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color} transition-[width] duration-500`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }: { icon: import('lucide-react').LucideIcon; title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas text-muted">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="relative overflow-x-auto scroll-thin">{children}</div>;
}
