import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

const ACCENTS = {
  brand: 'bg-brand-50 text-brand',
  warn: 'bg-warn-bg text-warn',
  info: 'bg-info-bg text-info',
  bad: 'bg-bad-bg text-bad',
  navy: 'bg-[#E9EEF3] text-navy',
  ok: 'bg-ok-bg text-ok',
};

export function MetricCard({
  icon: Icon,
  value,
  label,
  context,
  accent = 'brand',
  onClick,
}: {
  icon: LucideIcon;
  value: ReactNode;
  label: string;
  context?: ReactNode;
  accent?: keyof typeof ACCENTS;
  onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`card group flex min-w-0 flex-col p-4 text-left ${onClick ? 'transition-colors hover:border-[#CFD8E2]' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${ACCENTS[accent]}`}>
          <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
        </span>
      </div>
      <div className="tnum mt-3 text-[28px] font-semibold leading-none tracking-[-0.02em] text-ink">{value}</div>
      <div className="mt-1.5 text-[13px] font-medium text-ink">{label}</div>
      {context && <div className="mt-0.5 text-xs text-muted">{context}</div>}
    </Tag>
  );
}
