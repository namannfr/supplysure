import { useState } from 'react';
import { ListFilter, ScanSearch } from 'lucide-react';
import { REQUIREMENT_SETS } from '../../data/demoData';
import type { Assessment, Outcome } from '../../types';
import { OutcomeBadge } from '../ui/Badge';
import { Card, CardHeader, EmptyState, TableWrap } from '../ui/Card';
import { Segmented } from '../ui/Form';

type Filter = 'all' | Outcome;

export function RequirementsTable({ assessment }: { assessment: Assessment | null }) {
  const [filter, setFilter] = useState<Filter>('all');
  const rows = assessment?.rows ?? [];
  const visible = filter === 'all' ? rows : rows.filter((r) => r.outcome === filter);
  const count = (o: Outcome) => rows.filter((r) => r.outcome === o).length;

  return (
    <Card>
      <CardHeader
        title="Requirement results"
        subtitle={assessment ? 'Each result names the evidence record it relied on' : 'Run a check to see results'}
        actions={
          <Segmented<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: rows.length },
              { value: 'not_satisfied', label: 'Not ready', count: count('not_satisfied') },
              { value: 'action', label: 'Actions', count: count('action') },
              { value: 'satisfied', label: 'Ready', count: count('satisfied') },
            ]}
          />
        }
      />
      {!assessment ? (
        <EmptyState icon={ScanSearch} title="No assessment yet" description="Choose a supplier and package, confirm the dates, then run the readiness check." />
      ) : visible.length === 0 ? (
        <EmptyState icon={ListFilter} title="No requirements in this view" description="Nothing matches this filter for the current assessment." />
      ) : (
        <TableWrap>
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-line-soft">
              <tr>
                <th className="th w-[30%] pl-5">Requirement</th>
                <th className="th">Result</th>
                <th className="th w-[38%]">Evidence and explanation</th>
                <th className="th w-[150px] pr-5">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {visible.map((r) => (
                <tr key={r.requirementId} className="align-top">
                  <td className="td pl-5 align-top">
                    <div className="text-[13px] font-medium text-ink">{r.name}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                      {r.critical ? <span className="font-medium text-ink/70">Critical</span> : <span>Non-critical</span>}
                      <span className="text-subtle">·</span>
                      <span className="truncate">{REQUIREMENT_SETS.find((s) => s.id === r.setId)?.kind === 'package' ? 'Package addition' : 'Trade set'}</span>
                    </div>
                  </td>
                  <td className="td align-top"><OutcomeBadge outcome={r.outcome} /></td>
                  <td className="td align-top">
                    {r.evidence && <div className="text-[13px] text-ink">{r.evidence.title}</div>}
                    <div className="mt-0.5 text-[13px] leading-relaxed text-muted">{r.explanation}</div>
                  </td>
                  <td className="td pr-5 align-top">
                    {r.evidence ? (
                      <div className="break-words font-mono text-[11px] leading-relaxed text-muted">
                        <div className="text-ink">{r.evidence.id}</div>
                        <div>{r.evidence.reference}</div>
                        <div>{r.evidence.issuer}</div>
                        <div className={r.evidence.verification === 'verified' ? 'text-ok' : 'text-info'}>
                          {r.evidence.verification === 'verified' ? 'Reviewer verified' : r.evidence.verification === 'pending' ? 'Not yet verified' : 'Correction requested'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-subtle">No source</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </Card>
  );
}
