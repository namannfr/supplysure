import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { PackageStats } from '../../lib/derive';
import { DEMO_TODAY, daysBetween, formatShortDate, pct } from '../../lib/formatters';
import { navigate } from '../../lib/router';
import { Card, CardHeader } from '../ui/Card';
import { Select } from '../ui/Form';

const SERIES = [
  { key: 'ready', label: 'Ready', color: '#0D9488' },
  { key: 'action', label: 'Actions required', color: '#D9A441' },
  { key: 'notReady', label: 'Not ready', color: '#D64550' },
] as const;

type Range = 'all' | '30' | '60';

function barColor(v: number) {
  return v >= 75 ? 'bg-brand' : v >= 50 ? 'bg-warn' : 'bg-bad';
}

export function ReadinessChart({ stats }: { stats: PackageStats[] }) {
  const [range, setRange] = useState<Range>('all');

  const inRange = useMemo(
    () => stats.filter((s) => range === 'all' || daysBetween(DEMO_TODAY, s.pkg.mobilisation) <= Number(range)),
    [stats, range],
  );

  const totals = inRange.reduce(
    (t, s) => ({ ready: t.ready + s.ready, action: t.action + s.action, notReady: t.notReady + s.notReady, total: t.total + s.total }),
    { ready: 0, action: 0, notReady: 0, total: 0 },
  );
  const data = SERIES.map((s) => ({ name: s.label, value: totals[s.key], color: s.color }));
  const overall = pct(totals.ready, totals.total);
  const bars = [...inRange].sort((a, b) => a.pkg.mobilisation.localeCompare(b.pkg.mobilisation));
  const shown = bars.slice(0, 5);

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Readiness across live packages"
        subtitle={`${totals.total} supplier assignments, assessed for each package's dates`}
        actions={
          <Select value={range} onChange={(e) => setRange(e.target.value as Range)} aria-label="Date range" className="w-[200px]">
            <option value="all">All live packages</option>
            <option value="30">Mobilising in 30 days</option>
            <option value="60">Mobilising in 60 days</option>
          </Select>
        }
      />
      <div className="grid flex-1 gap-6 p-5 md:grid-cols-[220px_1fr] md:gap-8">
        <div className="flex flex-col items-center">
          <div className="relative h-[184px] w-[184px]" role="img" aria-label={`${overall}% of supplier assignments ready: ${totals.ready} ready, ${totals.action} actions required, ${totals.notReady} not ready`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={totals.total ? 1.5 : 0} startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
                  {data.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v: number, n: string) => [`${v} assignments`, n]}
                  contentStyle={{ borderRadius: 6, border: '1px solid #E1E7EE', fontSize: 12, padding: '6px 10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="tnum text-[28px] font-semibold leading-none tracking-[-0.02em]">{overall}%</span>
              <span className="mt-1 text-xs text-muted">ready</span>
            </div>
          </div>
          <ul className="mt-4 w-full space-y-1.5">
            {data.map((d) => (
              <li key={d.name} className="flex items-center gap-2 text-[13px]">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                <span className="flex-1 text-muted">{d.name}</span>
                <span className="tnum font-medium text-ink">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>Package · mobilisation</span>
            <span>Suppliers ready</span>
          </div>
          {shown.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-muted">No live packages mobilise in this range.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {shown.map((s) => (
                <li key={s.pkg.id}>
                  <button type="button" onClick={() => navigate(`/packages/${s.pkg.id}`)} className="group -mx-2 block w-[calc(100%+1rem)] rounded-md px-2 py-3 text-left transition-colors hover:bg-canvas">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-[13px] font-medium text-ink">
                        {s.pkg.name}
                        <span className="ml-2 font-normal text-muted">{formatShortDate(s.pkg.mobilisation)}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="tnum text-xs text-muted">{s.ready} of {s.total}</span>
                        <span className="tnum w-9 text-right text-[13px] font-semibold text-ink">{s.readiness}%</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line-soft">
                      <div className={`h-full rounded-full ${barColor(s.readiness)}`} style={{ width: `${s.readiness}%` }} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {bars.length > shown.length && (
            <button type="button" onClick={() => navigate('/packages')} className="mt-2 text-xs font-medium text-brand hover:text-brand-dark">
              +{bars.length - shown.length} more live package{bars.length - shown.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
