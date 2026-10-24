import { useState } from 'react';
import { ChevronRight, FolderKanban } from 'lucide-react';
import { PACKAGES } from '../../data/demoData';
import type { AttentionItem } from '../../lib/derive';
import { DEMO_TODAY, PRIORITY_LABELS, daysBetween, dueLabel } from '../../lib/formatters';
import { navigate } from '../../lib/router';
import { Card, CardHeader } from '../ui/Card';

const SEVERITY = {
  critical: { bar: 'bg-bad', text: 'text-bad' },
  high: { bar: 'bg-warn', text: 'text-warn' },
  medium: { bar: 'bg-info', text: 'text-info' },
};

export function AttentionList({ items }: { items: AttentionItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, 4);

  const open = (item: AttentionItem) =>
    item.kind === 'supplier'
      ? navigate(`/readiness?supplier=${item.supplierId}&package=${item.packageId}&run=1`)
      : navigate(`/packages/${item.packageId}`);

  return (
    <Card className="flex flex-col">
      <CardHeader title="Requires attention" subtitle="Prioritised by evidence deadline" actions={<span className="tnum text-xs text-muted">{items.length} open</span>} />
      <ul className={`flex-1 divide-y divide-line-soft ${expanded ? 'max-h-[460px] overflow-y-auto scroll-thin' : ''}`}>
        {shown.map((item) => {
          const sev = SEVERITY[item.severity];
          const urgent = daysBetween(DEMO_TODAY, item.due) <= 3;
          const pkgName = PACKAGES.find((p) => p.id === item.packageId)?.name;
          return (
            <li key={item.id}>
              <button type="button" onClick={() => open(item)} className="group flex w-full items-stretch gap-3 px-5 py-3.5 text-left transition-colors hover:bg-canvas/70">
                <span className={`w-[3px] shrink-0 rounded-full ${sev.bar}`} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                    {item.kind === 'package' && <FolderKanban className="h-3.5 w-3.5 text-muted" />}
                    <span className="truncate">{item.title}</span>
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted">{item.issue}</span>
                  <span className="mt-1.5 flex items-center gap-2 text-xs">
                    <span className={`font-medium ${sev.text}`}>{item.kind === 'package' ? 'Package' : PRIORITY_LABELS[item.severity]}</span>
                    {item.kind === 'supplier' && <span className="text-subtle">· {pkgName}</span>}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end justify-between">
                  <span className={`text-xs font-medium ${urgent ? 'text-ink' : 'text-muted'}`}>{dueLabel(item.due)}</span>
                  <ChevronRight className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {items.length > 4 && (
        <div className="border-t border-line-soft px-5 py-2.5">
          <button type="button" onClick={() => setExpanded((v) => !v)} className="text-xs font-medium text-brand hover:text-brand-dark">
            {expanded ? 'Show fewer' : `View all ${items.length} items`}
          </button>
        </div>
      )}
    </Card>
  );
}
