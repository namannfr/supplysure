import { CalendarClock, ClipboardCheck, FileText, Mail, MapPin, Send, UserRound } from 'lucide-react';
import { PACKAGES, REQUIREMENTS_BY_ID } from '../../data/demoData';
import { assignmentKey } from '../../lib/derive';
import { DEMO_TODAY, TRADE_LABELS, daysBetween, formatDate } from '../../lib/formatters';
import { evaluatePassport } from '../../lib/readinessEngine';
import { navigate } from '../../lib/router';
import { useStore } from '../../lib/store';
import type { EvidenceRecord, Outcome } from '../../types';
import { Badge, RiskBadge, VerdictBadge, VerificationBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/Card';
import { Drawer } from '../ui/Overlay';
import { useToast } from '../ui/Toast';

const OUTCOME_DOT: Record<Outcome, string> = { satisfied: 'bg-ok', action: 'bg-warn', not_satisfied: 'bg-bad' };

function ExpiryText({ iso }: { iso: string | null }) {
  if (!iso) return <span className="text-muted">No expiry</span>;
  const d = daysBetween(DEMO_TODAY, iso);
  const cls = d < 0 ? 'text-bad' : d <= 30 ? 'text-bad' : d <= 60 ? 'text-warn' : 'text-muted';
  return <span className={`tnum ${cls}`}>{d < 0 ? 'Expired ' : ''}{formatDate(iso)}</span>;
}

export function SupplierDetails({ supplierId, highlightEvidence, onClose }: { supplierId: string | null; highlightEvidence?: string | null; onClose: () => void }) {
  const { suppliers, evidence, derived } = useStore();
  const toast = useToast();
  const supplier = suppliers.find((s) => s.id === supplierId);
  const stats = derived.supplierStats.find((s) => s.supplier.id === supplierId);

  if (!supplier || !stats) return null;

  const passport = evaluatePassport(supplier, evidence, DEMO_TODAY);
  const passportTypes = new Set(passport.set.requirementIds.map((id) => REQUIREMENTS_BY_ID[id].evidenceType));
  const packageEvidence: EvidenceRecord[] = evidence.filter((e) => e.supplierId === supplier.id && !passportTypes.has(e.type));
  const invited = supplier.status === 'invited';

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-ink">{supplier.name}</h2>
            {invited ? <Badge tone="info">Invited</Badge> : <RiskBadge risk={stats.risk} />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
            <span>{TRADE_LABELS[supplier.trade]}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{supplier.location}</span>
            <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />{supplier.contactName}</span>
            <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{supplier.email}</span>
          </div>
        </div>
      }
      headerExtra={
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
          <div className="bg-white px-3 py-2.5">
            <div className="text-xs text-muted">Evidence health</div>
            <div className="tnum mt-0.5 text-[15px] font-semibold">{stats.health}%</div>
            <ProgressBar value={stats.health} className="mt-1.5" />
          </div>
          <div className="bg-white px-3 py-2.5">
            <div className="text-xs text-muted">Passport</div>
            <div className="mt-0.5 text-[13px] font-semibold">{stats.passportComplete ? 'Complete' : invited ? 'Not started' : 'Incomplete'}</div>
            <div className="tnum text-xs text-muted">{stats.satisfied} of {stats.total} satisfied</div>
          </div>
          <div className="bg-white px-3 py-2.5">
            <div className="text-xs text-muted">Live packages</div>
            <div className="tnum mt-0.5 text-[15px] font-semibold">{stats.livePackages.length}</div>
          </div>
          <div className="bg-white px-3 py-2.5">
            <div className="text-xs text-muted">Next expiry</div>
            <div className="mt-0.5 text-[13px] font-semibold">{stats.nextExpiry ? <ExpiryText iso={stats.nextExpiry.expires} /> : '—'}</div>
            {stats.nextExpiry && <div className="truncate text-xs text-muted">{stats.nextExpiry.label}</div>}
          </div>
        </div>
      }
      footer={
        <>
          <Button
            icon={Send}
            onClick={() => toast({ tone: 'info', title: 'Evidence request recorded (demo)', description: `No email was sent to ${supplier.contactName}. In the product this would notify the supplier.` })}
          >
            Request evidence update
          </Button>
          <Button variant="primary" icon={ClipboardCheck} onClick={() => navigate(`/readiness?supplier=${supplier.id}${stats.livePackages[0] ? `&package=${stats.livePackages[0].id}` : ''}`)}>
            Run readiness check
          </Button>
        </>
      }
    >
      <p className="mb-5 flex items-center gap-2 rounded-md bg-canvas px-3 py-2 text-[13px] text-muted">
        <span className={`h-1.5 w-1.5 rounded-full ${stats.risk === 'high' ? 'bg-bad' : stats.risk === 'medium' ? 'bg-warn' : 'bg-ok'}`} />
        {stats.riskReason}
      </p>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-[13px] font-semibold text-ink">Evidence passport</h3>
          <span className="text-xs text-muted">{passport.set.name} v{passport.set.version} · checked for {formatDate(DEMO_TODAY)}</span>
        </div>
        <ul className="divide-y divide-line-soft rounded-md border border-line">
          {passport.rows.map((r) => {
            const ev = r.evidence;
            const hl = ev && ev.id === highlightEvidence;
            return (
              <li key={r.requirementId} className={`flex items-start gap-3 px-3.5 py-3 ${hl ? 'bg-brand-50' : ''}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${OUTCOME_DOT[r.outcome]}`} title={r.outcome} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 text-[13px] font-medium text-ink">
                    {r.name}
                    {r.critical && <span className="text-2xs font-medium text-muted">Critical</span>}
                  </div>
                  {ev ? (
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                      <FileText className="h-3 w-3" />
                      <span>{ev.title}</span>
                      <span className="text-subtle">·</span>
                      <span className="font-mono text-[11px]">{ev.id} · {ev.reference}</span>
                    </div>
                  ) : (
                    <div className="mt-0.5 text-xs text-bad">No evidence on passport</div>
                  )}
                  {r.outcome !== 'satisfied' && ev && <div className="mt-1 text-xs text-muted">{r.explanation}</div>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                  {ev && <VerificationBadge v={ev.verification} />}
                  {ev && <ExpiryText iso={ev.expires} />}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {packageEvidence.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-2 text-[13px] font-semibold text-ink">Package-specific evidence</h3>
          <ul className="divide-y divide-line-soft rounded-md border border-line">
            {packageEvidence.map((e) => (
              <li key={e.id} className={`flex items-center gap-3 px-3.5 py-2.5 ${e.id === highlightEvidence ? 'bg-brand-50' : ''}`}>
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-ink">{e.title}</div>
                  <div className="font-mono text-[11px] text-muted">{e.id} · {e.reference}</div>
                </div>
                <VerificationBadge v={e.verification} />
                <span className="w-24 text-right text-xs"><ExpiryText iso={e.expires} /></span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h3 className="mb-2 text-[13px] font-semibold text-ink">Live packages</h3>
        {stats.livePackages.length === 0 ? (
          <p className="rounded-md border border-dashed border-line px-3.5 py-4 text-[13px] text-muted">
            {invited ? 'Not appointed to a package yet. Assess readiness once the supplier completes its passport.' : 'Not currently appointed to a live package. The passport remains available for future packages.'}
          </p>
        ) : (
          <ul className="divide-y divide-line-soft rounded-md border border-line">
            {stats.livePackages.map((p) => {
              const a = derived.assessments.get(assignmentKey(p.id, supplier.id))!;
              const scope = PACKAGES.find((x) => x.id === p.id)!.assignments.find((x) => x.supplierId === supplier.id)?.scopeOfWorks;
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => navigate(`/readiness?supplier=${supplier.id}&package=${p.id}&run=1`)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left hover:bg-canvas">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-ink">{p.name}</div>
                      <div className="truncate text-xs text-muted">{scope}</div>
                    </div>
                    <span className="hidden items-center gap-1 text-xs text-muted sm:inline-flex"><CalendarClock className="h-3.5 w-3.5" />{formatDate(p.mobilisation)}</span>
                    <VerdictBadge verdict={a.verdict} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Drawer>
  );
}
