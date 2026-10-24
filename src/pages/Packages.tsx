import { useMemo, useState } from 'react';
import { ArrowLeft, CalendarCheck2, CalendarClock, CalendarRange, ClipboardCheck, FolderX, Layers, ListChecks, Users } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionsTable } from '../components/readiness/CorrectiveActions';
import { Badge, VerdictBadge, type Tone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, EmptyState, ProgressBar, TableWrap } from '../components/ui/Card';
import { SearchInput, Select } from '../components/ui/Form';
import { PACKAGES, REQUIREMENTS_BY_ID, REQUIREMENT_SETS, TRADE_SET } from '../data/demoData';
import { assignmentKey, type PackageStats } from '../lib/derive';
import { DEMO_TODAY, TRADE_LABELS, daysBetween, formatDate } from '../lib/formatters';
import { rank } from '../lib/readinessEngine';
import { navigate, setParam, type Route } from '../lib/router';
import { useStore } from '../lib/store';

const STATUS_TONE: Record<PackageStats['status'], Tone> = { 'At risk': 'bad', 'Actions open': 'warn', 'Ready to mobilise': 'ok' };

export function Packages({ route }: { route: Route }) {
  const { derived } = useStore();
  const [q, setQ] = useState('');
  const status = route.params.get('status') ?? 'all';

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return derived.packageStats
      .filter((s) => !term || `${s.pkg.name} ${s.pkg.site} ${s.pkg.scope}`.toLowerCase().includes(term))
      .filter((s) => {
        if (status === 'all') return true;
        if (status === 'open') return s.status !== 'Ready to mobilise';
        return s.status === status;
      })
      .sort((a, b) => a.pkg.mobilisation.localeCompare(b.pkg.mobilisation));
  }, [derived, q, status]);

  return (
    <>
      <PageHeader
        eyebrow="Live packages"
        title="Packages"
        description="Each package carries its own dates, appointed suppliers and package-specific requirements."
        actions={<Button variant="primary" icon={ClipboardCheck} onClick={() => navigate('/readiness')}>Run readiness check</Button>}
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-line-soft px-5 py-4 md:flex-row md:items-center">
          <div className="mr-auto">
            <h2 className="text-[15px] font-semibold">Package register</h2>
            <p className="text-[13px] text-muted">{rows.length} of {PACKAGES.length} live packages · ordered by mobilisation</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SearchInput value={q} onChange={setQ} placeholder="Search packages or sites" className="w-full sm:w-64" />
            <Select value={status} onChange={(e) => setParam(route, 'status', e.target.value === 'all' ? null : e.target.value)} aria-label="Filter by status" className="w-full sm:w-48">
              <option value="all">All statuses</option>
              <option value="open">Not yet ready</option>
              <option value="At risk">At risk</option>
              <option value="Actions open">Actions open</option>
              <option value="Ready to mobilise">Ready to mobilise</option>
            </Select>
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={FolderX} title="No packages match" description="Try another search or status." action={<Button size="sm" onClick={() => { setQ(''); setParam(route, 'status', null); }}>Clear filters</Button>} />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[960px]">
              <thead className="border-b border-line-soft">
                <tr>
                  <th className="th pl-5">Package</th>
                  <th className="th">Site / project</th>
                  <th className="th">Trade / scope</th>
                  <th className="th">Mobilisation</th>
                  <th className="th text-right">Suppliers</th>
                  <th className="th w-[170px]">Readiness</th>
                  <th className="th text-right">Open actions</th>
                  <th className="th pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {rows.map((s) => (
                  <tr key={s.pkg.id} className="row-link" onClick={() => navigate(`/packages/${s.pkg.id}`)}>
                    <td className="td pl-5">
                      <div className="text-[13px] font-medium text-ink">{s.pkg.name}</div>
                      <div className="text-xs text-muted">{s.pkg.value} · {s.pkg.manager}</div>
                    </td>
                    <td className="td text-[13px] text-ink">{s.pkg.site}</td>
                    <td className="td text-[13px] text-ink">{s.pkg.scope}</td>
                    <td className="td">
                      <div className="tnum text-[13px] text-ink">{formatDate(s.pkg.mobilisation)}</div>
                      <div className="text-xs text-muted">in {daysBetween(DEMO_TODAY, s.pkg.mobilisation)} days</div>
                    </td>
                    <td className="td tnum text-right text-[13px]">{s.total}</td>
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={s.readiness} tone={s.readiness >= 75 ? 'brand' : s.readiness >= 50 ? 'warn' : 'bad'} className="w-20" />
                        <span className="tnum text-[13px] text-ink">{s.readiness}%</span>
                      </div>
                    </td>
                    <td className="td tnum text-right text-[13px]">{s.openActions || <span className="text-subtle">—</span>}</td>
                    <td className="td pr-5"><Badge tone={STATUS_TONE[s.status]} dot>{s.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}

export function PackageDetail({ id }: { id: string }) {
  const { derived, suppliers } = useStore();
  const stats = derived.packageStats.find((s) => s.pkg.id === id);

  if (!stats) {
    return (
      <Card>
        <EmptyState icon={FolderX} title="Package not found" description="This package is not part of the demonstration dataset." action={<Button size="sm" onClick={() => navigate('/packages')}>Back to packages</Button>} />
      </Card>
    );
  }

  const { pkg } = stats;
  const name = (sid: string) => suppliers.find((s) => s.id === sid)?.name ?? sid;
  const actions = stats.assessments.flatMap((a) => a.actions).sort((a, b) => rank(a.priority) - rank(b.priority) || a.due.localeCompare(b.due));
  const overlay = REQUIREMENT_SETS.find((s) => s.id === pkg.overlaySetId);
  const tradeSets = [...new Set(pkg.assignments.map((a) => suppliers.find((s) => s.id === a.supplierId)?.trade).filter(Boolean))].map(
    (t) => REQUIREMENT_SETS.find((s) => s.id === TRADE_SET[t!])!,
  );
  const firstIssue = stats.assessments.find((a) => a.verdict !== 'ready');

  const facts = [
    { icon: CalendarClock, label: 'Mobilisation', value: formatDate(pkg.mobilisation), hint: `in ${daysBetween(DEMO_TODAY, pkg.mobilisation)} days` },
    { icon: CalendarRange, label: 'Package finish', value: formatDate(pkg.finish), hint: `${Math.round(daysBetween(pkg.mobilisation, pkg.finish) / 7)} weeks on site` },
    { icon: CalendarCheck2, label: 'Go / no-go review', value: formatDate(pkg.reviewDate), hint: `in ${daysBetween(DEMO_TODAY, pkg.reviewDate)} days` },
    { icon: Users, label: 'Suppliers ready', value: `${stats.ready} of ${stats.total}`, hint: `${stats.action} with actions · ${stats.notReady} not ready` },
  ];

  return (
    <>
      <PageHeader
        back={
          <button type="button" onClick={() => navigate('/packages')} className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Packages
          </button>
        }
        eyebrow={pkg.site}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {pkg.name}
            <Badge tone={STATUS_TONE[stats.status]} dot>{stats.status}</Badge>
          </span>
        }
        description={`${pkg.scope} · ${pkg.value} · package manager ${pkg.manager}`}
        actions={
          <Button
            variant="primary"
            icon={ClipboardCheck}
            onClick={() => navigate(`/readiness?supplier=${(firstIssue ?? stats.assessments[0]).supplierId}&package=${pkg.id}&run=1`)}
          >
            {firstIssue ? 'Check first open issue' : 'Run readiness check'}
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {facts.map(({ icon: Icon, label, value, hint }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2 text-xs text-muted"><Icon className="h-3.5 w-3.5" />{label}</div>
            <div className="tnum mt-1.5 text-[17px] font-semibold text-ink">{value}</div>
            <div className="mt-0.5 text-xs text-muted">{hint}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader title="Appointed suppliers" subtitle={`Assessed at mobilisation (${formatDate(pkg.mobilisation)}) through finish`} actions={<span className="tnum text-[13px] font-medium text-ink">{stats.readiness}% ready</span>} />
            <TableWrap>
              <table className="w-full min-w-[720px]">
                <thead className="border-b border-line-soft">
                  <tr>
                    <th className="th pl-5">Supplier</th>
                    <th className="th">Scope of works</th>
                    <th className="th">Evidence due</th>
                    <th className="th text-right">Actions</th>
                    <th className="th pr-5">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {pkg.assignments.map((asg) => {
                    const a = derived.assessments.get(assignmentKey(pkg.id, asg.supplierId));
                    const s = suppliers.find((x) => x.id === asg.supplierId);
                    if (!a || !s) return null;
                    return (
                      <tr key={asg.supplierId} className="row-link" onClick={() => navigate(`/readiness?supplier=${s.id}&package=${pkg.id}&run=1`)}>
                        <td className="td pl-5">
                          <div className="whitespace-nowrap text-[13px] font-medium text-ink">{s.name}</div>
                          <div className="text-xs text-muted">{TRADE_LABELS[s.trade]}</div>
                        </td>
                        <td className="td text-[13px] text-muted">{asg.scopeOfWorks}</td>
                        <td className="td tnum whitespace-nowrap text-[13px] text-ink">{formatDate(asg.evidenceDue ?? pkg.reviewDate)}</td>
                        <td className="td tnum text-right text-[13px]">{a.actions.length || <span className="text-subtle">—</span>}</td>
                        <td className="td pr-5"><VerdictBadge verdict={a.verdict} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrap>
          </Card>

          <Card>
            <CardHeader title="Open issues" subtitle={`${actions.length} corrective action${actions.length === 1 ? '' : 's'} across this package`} />
            {actions.length === 0 ? (
              <EmptyState icon={ListChecks} title="No open issues" description="Every appointed supplier satisfies every requirement for the package window." />
            ) : (
              <ActionsTable actions={actions} supplierName={name} />
            )}
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader title="Requirements applied" subtitle="Trade set per supplier, plus package additions" />
          <div className="space-y-4 p-5">
            {overlay ? (
              <div>
                <div className="mb-2 text-xs font-medium text-muted">Package addition · v{overlay.version}</div>
                <div className="rounded-md border border-brand-100 bg-brand-50/60 p-3">
                  <div className="text-[13px] font-medium text-ink">{overlay.name}</div>
                  <p className="mt-0.5 text-xs text-muted">{overlay.description}</p>
                  <ul className="mt-2 space-y-1">
                    {overlay.requirementIds.map((rid) => (
                      <li key={rid} className="flex items-center justify-between gap-2 text-[13px]">
                        <span className="text-ink">{REQUIREMENTS_BY_ID[rid].name}</span>
                        {REQUIREMENTS_BY_ID[rid].critical && <Badge tone="bad">Critical</Badge>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="rounded-md bg-canvas px-3 py-2 text-xs text-muted">No package-specific additions. Trade sets apply as published.</p>
            )}
            <div>
              <div className="mb-2 text-xs font-medium text-muted">Trade sets in use</div>
              <ul className="divide-y divide-line-soft rounded-md border border-line">
                {tradeSets.map((s) => (
                  <li key={s.id}>
                    <button type="button" onClick={() => navigate(`/library?set=${s.id}`)} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-canvas">
                      <Layers className="h-3.5 w-3.5 text-brand" />
                      <span className="flex-1 text-[13px] text-ink">{s.name}</span>
                      <span className="tnum text-xs text-muted">v{s.version} · {s.requirementIds.length}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
