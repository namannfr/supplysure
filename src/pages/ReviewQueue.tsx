import { useMemo, useState } from 'react';
import { ArrowRight, Check, FileText, Inbox, Info, RotateCcw } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge, VerdictBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, EmptyState, TableWrap } from '../components/ui/Card';
import { Field, Segmented, Textarea } from '../components/ui/Form';
import { Modal } from '../components/ui/Overlay';
import { useToast } from '../components/ui/Toast';
import { PACKAGES, REQUIREMENTS } from '../data/demoData';
import { DEMO_TODAY, TRADE_LABELS, VERDICT_LABELS, daysBetween, formatCover, formatDate, formatDateTime } from '../lib/formatters';
import { runAssessment } from '../lib/readinessEngine';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';
import type { EvidenceRecord } from '../types';

type Tab = 'pending' | 'decided';

export function ReviewQueue() {
  const { evidence, suppliers, decisions, decideReview } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('pending');
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const pending = useMemo(
    () => {
      const live = (e: EvidenceRecord) => PACKAGES.some((p) => p.assignments.some((a) => a.supplierId === e.supplierId));
      // Items blocking a live package come first, then oldest submissions.
      return evidence
        .filter((e) => e.verification === 'pending')
        .sort((a, b) => Number(live(b)) - Number(live(a)) || a.submitted.localeCompare(b.submitted));
    },
    [evidence],
  );
  const supplierOf = (e: EvidenceRecord) => suppliers.find((s) => s.id === e.supplierId)!;
  const open = evidence.find((e) => e.id === openId);

  // Show the reviewer what each decision would change on live packages before they commit.
  const impact = useMemo(() => {
    if (!open) return [];
    const supplier = supplierOf(open);
    return PACKAGES.filter((p) => p.assignments.some((a) => a.supplierId === supplier.id)).map((pkg) => {
      const run = (v: EvidenceRecord['verification']) =>
        runAssessment({
          supplier, pkg, mobilisation: pkg.mobilisation, finish: pkg.finish, ranAt: DEMO_TODAY,
          evidence: evidence.map((e) => (e.id === open.id ? { ...e, verification: v } : e)),
        }).verdict;
      return { pkg, now: run(open.verification), approved: run('verified'), corrected: run('correction_requested') };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, evidence, suppliers]);

  const decide = (decision: 'approved' | 'correction_requested') => {
    if (!open) return;
    const s = supplierOf(open);
    decideReview(open.id, decision, note.trim());
    const changed = impact.filter((i) => (decision === 'approved' ? i.approved : i.corrected) !== i.now);
    toast({
      tone: decision === 'approved' ? 'success' : 'info',
      title: decision === 'approved' ? `${open.label} approved for ${s.name}` : `Correction requested from ${s.name}`,
      description: changed.length
        ? changed.map((c) => `${c.pkg.name} is now ${VERDICT_LABELS[decision === 'approved' ? c.approved : c.corrected].toLowerCase()}`).join(' · ')
        : 'Simulated decision recorded. No email sent to the supplier.',
    });
    setOpenId(null);
    setNote('');
  };

  const req = (e: EvidenceRecord) => REQUIREMENTS.find((r) => r.evidenceType === e.type);

  return (
    <>
      <PageHeader
        eyebrow="Human review"
        title="Review queue"
        description="Evidence the engine cannot accept on metadata alone. A reviewer confirms each document before it counts toward readiness."
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'pending', label: 'Awaiting review', count: pending.length },
            { value: 'decided', label: 'Decided', count: decisions.length },
          ]}
        />
        <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Info className="h-3.5 w-3.5" />Decisions are simulated and stored in this browser only.</span>
      </div>

      <Card>
        {tab === 'pending' ? (
          pending.length === 0 ? (
            <EmptyState icon={Inbox} title="Queue is clear" description="Every submitted document has a reviewer decision." />
          ) : (
            <TableWrap>
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-line-soft">
                  <tr>
                    <th className="th pl-5">Supplier</th>
                    <th className="th">Evidence</th>
                    <th className="th w-[32%]">Reason for review</th>
                    <th className="th">Submitted</th>
                    <th className="th">Status</th>
                    <th className="th pr-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {pending.map((e) => {
                    const s = supplierOf(e);
                    const live = PACKAGES.some((p) => p.assignments.some((a) => a.supplierId === s.id));
                    const age = daysBetween(e.submitted, DEMO_TODAY);
                    return (
                      <tr key={e.id} className="row-link" onClick={() => setOpenId(e.id)}>
                        <td className="td pl-5">
                          <div className="text-[13px] font-medium text-ink">{s.name}</div>
                          <div className="text-xs text-muted">{TRADE_LABELS[s.trade]}</div>
                          {live && <div className="mt-1"><Badge tone="brand">Blocks a live package</Badge></div>}
                        </td>
                        <td className="td">
                          <div className="text-[13px] text-ink">{e.title}</div>
                          <div className="font-mono text-[11px] text-muted">{e.id} · {e.reference}</div>
                        </td>
                        <td className="td text-[13px] text-muted">{e.reviewReason ?? 'First-time verification'}</td>
                        <td className="td">
                          <div className="tnum whitespace-nowrap text-[13px] text-ink">{formatDate(e.submitted)}</div>
                          <div className={`text-xs ${age >= 10 ? 'text-warn' : 'text-muted'}`}>{age === 0 ? 'today' : age === 1 ? 'yesterday' : `${age} days ago`}</div>
                        </td>
                        <td className="td">{req(e)?.manualAssessment ? <Badge tone="warn">Manual assessment</Badge> : <Badge tone="info">Awaiting review</Badge>}</td>
                        <td className="td pr-5 text-right"><Button size="sm" onClick={(ev) => { ev.stopPropagation(); setOpenId(e.id); }}>Review</Button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrap>
          )
        ) : decisions.length === 0 ? (
          <EmptyState icon={Check} title="No decisions yet" description="Approve or request a correction on a queued item and it will be listed here." action={<Button size="sm" onClick={() => setTab('pending')}>Open queue</Button>} />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-line-soft">
                <tr>
                  <th className="th pl-5">Supplier</th>
                  <th className="th">Evidence</th>
                  <th className="th">Decision</th>
                  <th className="th">Reviewer</th>
                  <th className="th pr-5">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {decisions.map((d) => {
                  const e = evidence.find((x) => x.id === d.evidenceId);
                  if (!e) return null;
                  return (
                    <tr key={d.evidenceId + d.at} className="row-link" onClick={() => navigate(`/suppliers?supplier=${e.supplierId}&evidence=${e.id}`)}>
                      <td className="td pl-5 text-[13px] font-medium text-ink">{supplierOf(e).name}</td>
                      <td className="td">
                        <div className="text-[13px] text-ink">{e.title}</div>
                        <div className="font-mono text-[11px] text-muted">{e.id}</div>
                      </td>
                      <td className="td">{d.decision === 'approved' ? <Badge tone="ok" dot>Approved</Badge> : <Badge tone="bad" dot>Correction requested</Badge>}</td>
                      <td className="td">
                        <div className="text-[13px] text-ink">{d.by}</div>
                        <div className="text-xs text-muted">{formatDateTime(d.at)}</div>
                      </td>
                      <td className="td pr-5 text-[13px] text-muted">{d.note || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      <Modal
        open={!!open}
        onClose={() => { setOpenId(null); setNote(''); }}
        size="lg"
        title={open ? `Review ${open.label}` : ''}
        subtitle={open && `${supplierOf(open).name} · submitted ${formatDate(open.submitted)}`}
        footer={
          <>
            <span className="mr-auto text-xs text-muted">Simulated review — no message is sent to the supplier.</span>
            <Button variant="danger" icon={RotateCcw} onClick={() => decide('correction_requested')}>Request correction</Button>
            <Button variant="primary" icon={Check} onClick={() => decide('approved')}>Approve</Button>
          </>
        }
      >
        {open && (
          <div className="space-y-5">
            <div className="rounded-md border border-warn/25 bg-warn-bg/60 px-3.5 py-2.5 text-[13px] text-[#7A5214]">
              <span className="font-medium">Reason for review: </span>{open.reviewReason ?? 'First-time verification'}
            </div>
            <div>
              <h3 className="mb-2 text-[13px] font-semibold">Recorded metadata</h3>
              <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
                {[
                  ['Document', open.title],
                  ['Requirement', req(open)?.name ?? '—'],
                  ['Issuer', open.issuer],
                  ['Reference', open.reference],
                  ['Issued', formatDate(open.issued)],
                  ['Expires', open.expires ? formatDate(open.expires) : 'No expiry'],
                  ...(open.scope ? [['Scope', open.scope]] : []),
                  ...(open.cover ? [['Cover', formatCover(open.cover)]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="bg-white px-3 py-2">
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="text-[13px] text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted"><FileText className="h-3.5 w-3.5" /><span className="font-mono">{open.fileName}</span> · document preview is not part of this prototype</div>
            </div>
            <div>
              <h3 className="mb-2 text-[13px] font-semibold">Effect on live packages</h3>
              {impact.length === 0 ? (
                <p className="rounded-md bg-canvas px-3 py-2 text-[13px] text-muted">This supplier is not appointed to a live package. The decision updates its passport only.</p>
              ) : (
                <ul className="divide-y divide-line-soft rounded-md border border-line">
                  {impact.map((i) => (
                    <li key={i.pkg.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3.5 py-2.5">
                      <span className="min-w-[140px] flex-1 text-[13px] font-medium text-ink">{i.pkg.name}</span>
                      <VerdictBadge verdict={i.now} />
                      <span className="inline-flex items-center gap-1 text-xs text-muted">if approved <ArrowRight className="h-3 w-3" /></span>
                      <VerdictBadge verdict={i.approved} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Field label="Reviewer note" htmlFor="rv-note" hint="Recorded with the decision and included in later audit packs.">
              <Textarea id="rv-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Certificate checked against issuer details provided by supplier." />
            </Field>
          </div>
        )}
      </Modal>
    </>
  );
}
