import { CalendarCheck, Info, Layers, ListChecks, PoundSterling, ScanLine, UserCheck } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, TableWrap } from '../components/ui/Card';
import { Modal } from '../components/ui/Overlay';
import { PACKAGES, REQUIREMENTS_BY_ID, REQUIREMENT_SETS } from '../data/demoData';
import { TRADE_LABELS, formatCover, formatDate } from '../lib/formatters';
import { navigate, setParam, type Route } from '../lib/router';
import { useStore } from '../lib/store';
import type { Requirement, RequirementSet } from '../types';

function ruleSummary(r: Requirement) {
  const rules: { icon: typeof Info; text: string }[] = [];
  if (r.checksValidity) rules.push({ icon: CalendarCheck, text: 'Must be in date from mobilisation to finish' });
  if (r.requiredScope) rules.push({ icon: ScanLine, text: `Scope must include “${r.requiredScope}”` });
  if (r.minCover) rules.push({ icon: PoundSterling, text: `Minimum cover ${formatCover(r.minCover)}` });
  if (r.manualAssessment) rules.push({ icon: UserCheck, text: 'Always requires a reviewer decision' });
  if (!rules.length) rules.push({ icon: Info, text: 'Evidence on file and verified' });
  return rules;
}

function SetRows({ sets, onOpen, usage }: { sets: RequirementSet[]; onOpen: (id: string) => void; usage: (s: RequirementSet) => string }) {
  return (
    <TableWrap>
      <table className="w-full min-w-[820px]">
        <thead className="border-b border-line-soft">
          <tr>
            <th className="th pl-5">Requirement set</th>
            <th className="th">Trade</th>
            <th className="th text-right">Requirements</th>
            <th className="th text-right">Critical</th>
            <th className="th">Version</th>
            <th className="th">Last updated</th>
            <th className="th pr-5">In use</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {sets.map((s) => (
            <tr key={s.id} className="row-link" onClick={() => onOpen(s.id)}>
              <td className="td pl-5">
                <div className="flex items-center gap-2 text-[13px] font-medium text-ink"><Layers className="h-3.5 w-3.5 text-brand" />{s.name}</div>
                <div className="pl-[22px] text-xs text-muted">{s.description}</div>
              </td>
              <td className="td text-[13px] text-ink">{s.trade ? TRADE_LABELS[s.trade] : 'Package-specific'}</td>
              <td className="td tnum text-right text-[13px]">{s.requirementIds.length}</td>
              <td className="td tnum text-right text-[13px]">{s.requirementIds.filter((id) => REQUIREMENTS_BY_ID[id].critical).length}</td>
              <td className="td"><span className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-ink">v{s.version}</span></td>
              <td className="td">
                <div className="tnum text-[13px] text-ink">{formatDate(s.updated)}</div>
                <div className="text-xs text-muted">{s.owner}</div>
              </td>
              <td className="td pr-5 text-[13px] text-muted">{usage(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

export function RequirementLibrary({ route }: { route: Route }) {
  const { suppliers } = useStore();
  const openId = route.params.get('set');
  const open = REQUIREMENT_SETS.find((s) => s.id === openId);
  const trade = REQUIREMENT_SETS.filter((s) => s.kind === 'trade');
  const pkgSets = REQUIREMENT_SETS.filter((s) => s.kind === 'package');

  const usage = (s: RequirementSet) => {
    if (s.kind === 'package') return PACKAGES.find((p) => p.id === s.packageId)?.name ?? '—';
    const n = suppliers.filter((x) => x.trade === s.trade).length;
    return `${n} supplier${n === 1 ? '' : 's'}`;
  };

  return (
    <>
      <PageHeader
        eyebrow="Reusable rules"
        title="Requirement library"
        description="Versioned requirement sets per trade, with package-specific additions layered on top. Each readiness check records the versions it used."
      />
      <div className="space-y-6">
        <Card>
          <CardHeader title="Trade requirement sets" subtitle={`${trade.length} sets · applied to every supplier of that trade`} />
          <SetRows sets={trade} onOpen={(id) => setParam(route, 'set', id)} usage={usage} />
        </Card>
        <Card>
          <CardHeader title="Package additions" subtitle="Extra requirements that apply only on a specific package" />
          <SetRows sets={pkgSets} onOpen={(id) => setParam(route, 'set', id)} usage={usage} />
        </Card>
      </div>

      <Modal
        open={!!open}
        onClose={() => setParam(route, 'set', null)}
        size="lg"
        title={open ? <span className="flex items-center gap-2">{open.name}<span className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[11px] font-normal text-ink">v{open.version}</span></span> : ''}
        subtitle={open && `${open.description} Updated ${formatDate(open.updated)} by ${open.owner}.`}
        footer={
          <>
            <span className="mr-auto text-xs text-muted">Editing requirement sets is outside this prototype.</span>
            {open?.kind === 'package' && <Button onClick={() => navigate(`/packages/${open.packageId}`)}>Open package</Button>}
            <Button variant="primary" icon={ListChecks} onClick={() => navigate('/readiness')}>Run readiness check</Button>
          </>
        }
      >
        {open && (
          <ul className="divide-y divide-line-soft rounded-md border border-line">
            {open.requirementIds.map((rid) => {
              const r = REQUIREMENTS_BY_ID[rid];
              return (
                <li key={rid} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-muted">{r.code}</span>
                    <span className="text-[13px] font-medium text-ink">{r.name}</span>
                    {r.critical ? <Badge tone="bad">Critical</Badge> : <Badge>Non-critical</Badge>}
                  </div>
                  <p className="mt-1 text-[13px] text-muted">{r.description}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {ruleSummary(r).map(({ icon: Icon, text }) => (
                      <span key={text} className="inline-flex items-center gap-1.5 text-xs text-ink/80"><Icon className="h-3.5 w-3.5 text-brand" />{text}</span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Modal>
    </>
  );
}
