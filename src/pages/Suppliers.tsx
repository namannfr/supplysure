import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, IdCard, SearchX, UserPlus, Users } from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { PageHeader } from '../components/layout/PageHeader';
import { InviteSupplierModal } from '../components/suppliers/InviteSupplierModal';
import { SupplierDetails } from '../components/suppliers/SupplierDetails';
import { Badge, RiskBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, EmptyState, ProgressBar, TableWrap } from '../components/ui/Card';
import { SearchInput, Select } from '../components/ui/Form';
import { useToast } from '../components/ui/Toast';
import { DEMO_TODAY, TRADE_LABELS, daysBetween, formatDate } from '../lib/formatters';
import { setParam, setParams, type Route } from '../lib/router';
import { useStore } from '../lib/store';
import type { Risk, TradeId } from '../types';

const PAGE_SIZE = 15;

export function Suppliers({ route }: { route: Route }) {
  const { derived } = useStore();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [trade, setTrade] = useState<TradeId | 'all'>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [page, setPage] = useState(0);

  const risk = (route.params.get('risk') as Risk | null) ?? 'all';
  const expiringOnly = route.params.get('view') === 'expiring';
  const selected = route.params.get('supplier');
  const highlight = route.params.get('evidence');

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return derived.supplierStats.filter((s) => {
      if (term && !`${s.supplier.name} ${s.supplier.location} ${TRADE_LABELS[s.supplier.trade]}`.toLowerCase().includes(term)) return false;
      if (trade !== 'all' && s.supplier.trade !== trade) return false;
      if (risk !== 'all' && s.risk !== risk) return false;
      if (expiringOnly && !(s.nextExpiry && s.nextExpiry.expires! <= derived.in30)) return false;
      return true;
    });
  }, [derived, q, trade, risk, expiringOnly]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const filtered = q || trade !== 'all' || risk !== 'all' || expiringOnly;
  const { kpis } = derived;

  const resetFilters = () => {
    setQ('');
    setTrade('all');
    setParams(route, { risk: null, view: null });
    setPage(0);
  };

  return (
    <>
      <PageHeader
        eyebrow="Evidence passports"
        title="Suppliers"
        description="Evidence is held once and reused only where its scope and dates satisfy the package."
        actions={<Button variant="primary" icon={UserPlus} onClick={() => setInviteOpen(true)}>Invite supplier</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={Users} accent="navy" value={kpis.activeSuppliers} label="Active suppliers" context="With an evidence passport" />
        <MetricCard icon={IdCard} accent="brand" value={kpis.passportsComplete} label="Evidence passports complete" context="All trade evidence on file and in date" />
        <MetricCard icon={CalendarClock} accent="warn" value={kpis.expiring30} label="Documents expiring soon" context="Within the next 30 days" onClick={() => { setParam(route, 'view', expiringOnly ? null : 'expiring'); setPage(0); }} />
        <MetricCard icon={AlertTriangle} accent="bad" value={kpis.highRisk} label="High-risk suppliers" context="Not ready for a live package" onClick={() => { setParam(route, 'risk', risk === 'high' ? null : 'high'); setPage(0); }} />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line-soft px-5 py-4 lg:flex-row lg:items-center">
          <div className="mr-auto">
            <h2 className="text-[15px] font-semibold">Supplier register</h2>
            <p className="text-[13px] text-muted">
              {filtered ? `${rows.length} of ${derived.supplierStats.length} suppliers` : `${derived.supplierStats.length} suppliers`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Search suppliers" className="w-full sm:w-60" />
            <Select value={trade} onChange={(e) => { setTrade(e.target.value as TradeId | 'all'); setPage(0); }} aria-label="Filter by trade" className="w-[calc(50%-4px)] sm:w-44">
              <option value="all">All trades</option>
              {Object.entries(TRADE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select value={risk} onChange={(e) => { setParam(route, 'risk', e.target.value === 'all' ? null : e.target.value); setPage(0); }} aria-label="Filter by risk" className="w-[calc(50%-4px)] sm:w-36">
              <option value="all">All risk levels</option>
              <option value="high">High risk</option>
              <option value="medium">Medium risk</option>
              <option value="low">Low risk</option>
            </Select>
          </div>
        </div>
        {expiringOnly && (
          <div className="flex items-center justify-between border-b border-line-soft bg-warn-bg/50 px-5 py-2 text-[13px]">
            <span className="text-[#7A5214]">Showing suppliers with a document expiring by {formatDate(derived.in30)}</span>
            <button type="button" onClick={() => setParam(route, 'view', null)} className="text-xs font-medium text-brand">Clear</button>
          </div>
        )}

        {rows.length === 0 ? (
          <EmptyState icon={SearchX} title="No suppliers match these filters" description="Try a different search term or clear the filters." action={<Button size="sm" onClick={resetFilters}>Clear filters</Button>} />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[920px]">
              <thead className="border-b border-line-soft">
                <tr>
                  <th className="th pl-5">Supplier</th>
                  <th className="th">Trade</th>
                  <th className="th w-[190px]">Evidence health</th>
                  <th className="th text-right">Live packages</th>
                  <th className="th">Next expiry</th>
                  <th className="th">Risk</th>
                  <th className="th pr-5 text-right">Passport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {visible.map((s) => {
                  const exp = s.nextExpiry?.expires;
                  const days = exp ? daysBetween(DEMO_TODAY, exp) : null;
                  const invited = s.supplier.status === 'invited';
                  return (
                    <tr key={s.supplier.id} className={`row-link ${selected === s.supplier.id ? 'bg-brand-50/60' : ''}`} onClick={() => setParam(route, 'supplier', s.supplier.id)}>
                      <td className="td pl-5">
                        <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
                          {s.supplier.name}
                          {invited && <Badge tone="info">Invited</Badge>}
                        </div>
                        <div className="text-xs text-muted">{s.supplier.location}</div>
                      </td>
                      <td className="td text-[13px] text-ink">{TRADE_LABELS[s.supplier.trade]}</td>
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <ProgressBar value={s.health} className="w-24" />
                          <span className="tnum w-9 text-[13px] text-ink">{s.health}%</span>
                        </div>
                      </td>
                      <td className="td tnum text-right text-[13px]">{s.livePackages.length || <span className="text-subtle">—</span>}</td>
                      <td className="td">
                        {exp ? (
                          <>
                            <div className={`tnum text-[13px] ${days! <= 30 ? 'font-medium text-bad' : days! <= 60 ? 'text-warn' : 'text-ink'}`}>{formatDate(exp)}</div>
                            <div className="text-xs text-muted">{s.nextExpiry!.label}</div>
                          </>
                        ) : (
                          <span className="text-[13px] text-subtle">—</span>
                        )}
                      </td>
                      <td className="td">{invited ? <Badge tone="neutral">Pending</Badge> : <RiskBadge risk={s.risk} />}</td>
                      <td className="td pr-5 text-right">
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); setParam(route, 'supplier', s.supplier.id); }}>
                          {invited ? 'View invite' : 'View passport'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-line-soft px-5 py-3 text-[13px] text-muted">
            <span className="tnum">{current * PAGE_SIZE + 1}–{Math.min(rows.length, (current + 1) * PAGE_SIZE)} of {rows.length}</span>
            <div className="flex gap-2">
              <Button size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>Previous</Button>
              <Button size="sm" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <SupplierDetails supplierId={selected} highlightEvidence={highlight} onClose={() => setParams(route, { supplier: null, evidence: null })} />

      <InviteSupplierModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={(s) => {
          setInviteOpen(false);
          setPage(0);
          toast({ tone: 'success', title: `${s.name} invited`, description: 'Added to the register as a demonstration record. No email was sent.' });
        }}
      />
    </>
  );
}
