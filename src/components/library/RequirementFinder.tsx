import { useMemo, useState } from 'react';
import { SearchX, UserSearch } from 'lucide-react';
import { PACKAGES, REQUIREMENTS, REQUIREMENT_SETS } from '../../data/demoData';
import { DEMO_TODAY, TRADE_LABELS, formatDate } from '../../lib/formatters';
import { evaluateRequirement } from '../../lib/readinessEngine';
import { navigate, setParams, type Route } from '../../lib/router';
import { useStore } from '../../lib/store';
import type { Outcome } from '../../types';
import { Badge, OutcomeBadge } from '../ui/Badge';
import { Card, CardHeader, EmptyState, TableWrap } from '../ui/Card';
import { Field, Input, SearchInput, Segmented, Select } from '../ui/Form';

type Show = 'satisfied' | 'all';

/**
 * Answers: “Which subcontractors, across every package, hold valid evidence for this requirement
 * over this timeline?” Uses the same rule as the readiness engine, one requirement at a time.
 */
export function RequirementFinder({ route }: { route: Route }) {
  const { subcontractors, evidence } = useStore();
  const [q, setQ] = useState('');
  const [show, setShow] = useState<Show>('satisfied');
  const reqId = route.params.get('req') ?? 'REQ-PL';
  const timeline = route.params.get('timeline') ?? 'P01';
  const [custom, setCustom] = useState({ mobilisation: DEMO_TODAY, finish: '2027-06-30' });

  const req = REQUIREMENTS.find((r) => r.id === reqId) ?? REQUIREMENTS[0];
  const pkg = PACKAGES.find((p) => p.id === timeline);
  const window = pkg ? { mobilisation: pkg.mobilisation, finish: pkg.finish } : custom;
  const dateError = window.finish <= window.mobilisation;

  const options = useMemo(() => {
    const term = q.trim().toLowerCase();
    return REQUIREMENTS.filter((r) => !term || `${r.name} ${r.code} ${r.shortName}`.toLowerCase().includes(term));
  }, [q]);

  const results = useMemo(() => {
    if (dateError) return [];
    const setOf = REQUIREMENT_SETS.find((s) => s.requirementIds.includes(req.id))!;
    return subcontractors
      .filter((s) => s.status === 'active')
      .map((s) => {
        const own = evidence.filter((e) => e.supplierId === s.id && e.type === req.evidenceType).sort((a, b) => b.submitted.localeCompare(a.submitted));
        // Applies via the subcontractor's trade set, a package addition on a package they're appointed to, or evidence on file.
        const applies =
          own.length > 0 ||
          REQUIREMENT_SETS.some((set) => set.kind === 'trade' && set.trade === s.trade && set.requirementIds.includes(req.id)) ||
          PACKAGES.some(
            (p) =>
              p.assignments.some((a) => a.supplierId === s.id) &&
              REQUIREMENT_SETS.find((set) => set.id === p.overlaySetId)?.requirementIds.includes(req.id),
          );
        if (!applies) return null;
        const result = evaluateRequirement(req, setOf.id, own[0], window);
        const live = PACKAGES.filter((p) => p.assignments.some((a) => a.supplierId === s.id));
        return { s, result, live };
      })
      .filter((x): x is NonNullable<typeof x> => !!x)
      .sort((a, b) => order(a.result.outcome) - order(b.result.outcome) || a.s.name.localeCompare(b.s.name));
  }, [subcontractors, evidence, req, window.mobilisation, window.finish, dateError]);

  const count = (o: Outcome) => results.filter((r) => r.result.outcome === o).length;
  const visible = show === 'all' ? results : results.filter((r) => r.result.outcome === 'satisfied');

  const pickRequirement = (id: string) => setParams(route, { req: id });

  return (
    <Card>
      <CardHeader
        title="Find ready subcontractors by requirement"
        subtitle="Search a requirement and see every subcontractor, across all packages, whose evidence satisfies it for a timeline."
      />
      <div className="grid gap-4 border-b border-line-soft px-5 py-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          <Field label="Requirement" htmlFor="rf-req">
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchInput
                value={q}
                onChange={(v) => {
                  setQ(v);
                  const term = v.trim().toLowerCase();
                  const first = REQUIREMENTS.find((r) => `${r.name} ${r.code} ${r.shortName}`.toLowerCase().includes(term));
                  if (term && first) pickRequirement(first.id);
                }}
                placeholder="Search e.g. DBS, insurance, Gas Safe"
                className="sm:w-60"
              />
              <Select id="rf-req" value={req.id} onChange={(e) => pickRequirement(e.target.value)} className="flex-1">
                {options.length === 0 && <option value={req.id}>{req.name}</option>}
                {options.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
            </div>
          </Field>
          <p className="text-xs text-muted">
            {req.critical ? 'Critical' : 'Non-critical'} · {req.description}
          </p>
        </div>
        <div className="space-y-2">
          <Field label="Timeline" htmlFor="rf-timeline">
            <Select id="rf-timeline" value={pkg ? pkg.id : 'custom'} onChange={(e) => setParams(route, { timeline: e.target.value })}>
              {PACKAGES.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {formatDate(p.mobilisation)} to {formatDate(p.finish)}</option>
              ))}
              <option value="custom">Custom dates…</option>
            </Select>
          </Field>
          {!pkg && (
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" aria-label="Start date" value={custom.mobilisation} onChange={(e) => e.target.value && setCustom((c) => ({ ...c, mobilisation: e.target.value }))} invalid={dateError} />
              <Input type="date" aria-label="Finish date" value={custom.finish} onChange={(e) => e.target.value && setCustom((c) => ({ ...c, finish: e.target.value }))} invalid={dateError} />
            </div>
          )}
          {dateError && <p className="text-xs text-bad">Finish must be after the start date.</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <p className="tnum text-[13px] text-muted">
          <span className="font-medium text-ok">{count('satisfied')} ready</span> · {count('action')} need action · {count('not_satisfied')} not satisfied
          <span className="text-subtle"> — of {results.length} subcontractors this requirement applies to</span>
        </p>
        <Segmented<Show> value={show} onChange={setShow} options={[{ value: 'satisfied', label: 'Ready only', count: count('satisfied') }, { value: 'all', label: 'All', count: results.length }]} />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={results.length ? SearchX : UserSearch}
          title={dateError ? 'Check the dates' : results.length ? 'No subcontractor is ready for this timeline' : 'No subcontractor holds this requirement'}
          description={results.length ? 'Switch to “All” to see who falls short and why.' : 'Package-specific requirements only apply to subcontractors appointed to that package.'}
        />
      ) : (
        <TableWrap>
          <table className="w-full min-w-[860px]">
            <thead className="border-y border-line-soft">
              <tr>
                <th className="th pl-5">Subcontractor</th>
                <th className="th">Result</th>
                <th className="th w-[34%]">Evidence and explanation</th>
                <th className="th pr-5">Live packages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {visible.map(({ s, result, live }) => (
                <tr key={s.id} className="row-link align-top" onClick={() => navigate(`/subcontractors?subcontractor=${s.id}${result.evidence ? `&evidence=${result.evidence.id}` : ''}`)}>
                  <td className="td pl-5">
                    <div className="text-[13px] font-medium text-ink">{s.name}</div>
                    <div className="text-xs text-muted">{TRADE_LABELS[s.trade]} · {s.location}</div>
                  </td>
                  <td className="td"><OutcomeBadge outcome={result.outcome} /></td>
                  <td className="td">
                    {result.evidence && (
                      <div className="text-[13px] text-ink">
                        {result.evidence.title} <span className="font-mono text-[11px] text-muted">· {result.evidence.id}</span>
                      </div>
                    )}
                    <div className="mt-0.5 text-[13px] text-muted">{result.explanation}</div>
                  </td>
                  <td className="td pr-5">
                    {live.length ? (
                      <div className="flex flex-wrap gap-1">{live.map((p) => <Badge key={p.id}>{p.name}</Badge>)}</div>
                    ) : (
                      <span className="text-xs text-subtle">Not on a live package</span>
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

function order(o: Outcome) {
  return o === 'satisfied' ? 0 : o === 'action' ? 1 : 2;
}
