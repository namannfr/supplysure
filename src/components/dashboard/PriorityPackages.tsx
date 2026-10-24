import { ArrowRight } from 'lucide-react';
import type { PackageStats } from '../../lib/derive';
import { DEMO_TODAY, daysBetween, formatDate } from '../../lib/formatters';
import { navigate } from '../../lib/router';
import { RiskBadge } from '../ui/Badge';
import { Card, CardHeader, ProgressBar, TableWrap } from '../ui/Card';

const RISK_ORDER = { high: 0, medium: 1, low: 2 };

export function PriorityPackages({ stats, limit = 5 }: { stats: PackageStats[]; limit?: number }) {
  const rows = [...stats]
    .sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk] || a.pkg.mobilisation.localeCompare(b.pkg.mobilisation))
    .slice(0, limit);

  return (
    <Card>
      <CardHeader
        title="Priority packages"
        subtitle="Ordered by risk, then mobilisation date"
        actions={
          <button type="button" onClick={() => navigate('/packages')} className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:text-brand-dark">
            View all packages <ArrowRight className="h-3.5 w-3.5" />
          </button>
        }
      />
      <TableWrap>
        <table className="w-full min-w-[820px]">
          <thead className="border-b border-line-soft">
            <tr>
              <th className="th pl-5">Package</th>
              <th className="th">Mobilisation</th>
              <th className="th text-right">Suppliers</th>
              <th className="th w-[180px]">Ready</th>
              <th className="th text-right">Open actions</th>
              <th className="th">Risk</th>
              <th className="th pr-5 text-right"><span className="sr-only">View</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {rows.map((s) => {
              const days = daysBetween(DEMO_TODAY, s.pkg.mobilisation);
              return (
                <tr key={s.pkg.id} className="row-link" onClick={() => navigate(`/packages/${s.pkg.id}`)}>
                  <td className="td pl-5">
                    <div className="text-[13px] font-medium text-ink">{s.pkg.name}</div>
                    <div className="text-xs text-muted">{s.pkg.site}</div>
                  </td>
                  <td className="td">
                    <div className="tnum text-[13px] text-ink">{formatDate(s.pkg.mobilisation)}</div>
                    <div className="text-xs text-muted">in {days} days</div>
                  </td>
                  <td className="td tnum text-right text-[13px]">{s.total}</td>
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <ProgressBar value={s.readiness} tone={s.readiness >= 75 ? 'brand' : s.readiness >= 50 ? 'warn' : 'bad'} className="w-24" />
                      <span className="tnum text-[13px] text-ink">{s.ready}/{s.total}</span>
                    </div>
                  </td>
                  <td className="td tnum text-right text-[13px]">{s.openActions || <span className="text-subtle">—</span>}</td>
                  <td className="td"><RiskBadge risk={s.risk} /></td>
                  <td className="td pr-5 text-right">
                    <span className="inline-flex items-center gap-1 text-[13px] font-medium text-brand">
                      View details <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
    </Card>
  );
}
