import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertOctagon,
  Bell,
  CalendarClock,
  FileArchive,
  FileText,
  FolderKanban,
  HelpCircle,
  Inbox,
  Menu,
  RotateCcw,
  Search,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { CURRENT_USER, PACKAGES } from '../../data/demoData';
import { TRADE_LABELS, formatShortDate } from '../../lib/formatters';
import { navigate } from '../../lib/router';
import { useStore } from '../../lib/store';
import { IconButton } from '../ui/Button';
import { useOutsideClick } from '../ui/Overlay';

interface SearchResult { id: string; group: string; icon: LucideIcon; title: string; meta: string; to: string }

function GlobalSearch() {
  const { suppliers, evidence, audits } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const has = (...xs: (string | undefined)[]) => xs.some((x) => x?.toLowerCase().includes(term));
    const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? id;
    const out: SearchResult[] = [];
    suppliers
      .filter((s) => has(s.name, TRADE_LABELS[s.trade], s.location, s.contactName))
      .slice(0, 5)
      .forEach((s) => out.push({ id: s.id, group: 'Suppliers', icon: Users, title: s.name, meta: `${TRADE_LABELS[s.trade]} · ${s.location}`, to: `/suppliers?supplier=${s.id}` }));
    PACKAGES.filter((p) => has(p.name, p.site, p.scope))
      .slice(0, 4)
      .forEach((p) => out.push({ id: p.id, group: 'Packages', icon: FolderKanban, title: p.name, meta: `${p.site} · mobilises ${formatShortDate(p.mobilisation)}`, to: `/packages/${p.id}` }));
    evidence
      .filter((e) => has(e.id, e.title, e.label, e.reference, supplierName(e.supplierId)))
      .slice(0, 6)
      .forEach((e) => out.push({ id: e.id, group: 'Evidence', icon: FileText, title: `${e.title}`, meta: `${supplierName(e.supplierId)} · ${e.id} · ${e.reference}`, to: `/suppliers?supplier=${e.supplierId}&evidence=${e.id}` }));
    audits
      .filter((a) => has(a.id, supplierName(a.assessment.supplierId)))
      .slice(0, 3)
      .forEach((a) => out.push({ id: a.id, group: 'Audit packs', icon: FileArchive, title: a.id, meta: `${supplierName(a.assessment.supplierId)} · ${PACKAGES.find((p) => p.id === a.assessment.packageId)?.name}`, to: `/audit?record=${a.id}` }));
    return out;
  }, [q, suppliers, evidence, audits]);

  useEffect(() => setActive(0), [q]);

  const choose = (r: SearchResult) => {
    navigate(r.to);
    setOpen(false);
    setQ('');
    input.current?.blur();
  };

  let lastGroup = '';
  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
      <input
        ref={input}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
          if (e.key === 'Enter' && results[active]) choose(results[active]);
        }}
        placeholder="Search suppliers, packages, evidence…"
        aria-label="Global search"
        className="h-9 w-full rounded-md border border-line bg-canvas pl-9 pr-14 text-[13px] text-ink placeholder:text-subtle transition-colors focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-white px-1.5 text-2xs text-muted sm:block">Ctrl K</kbd>
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-[420px] overflow-y-auto rounded-lg border border-line bg-white p-1.5 shadow-pop animate-pop-in scroll-thin">
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-[13px] text-muted">No demonstration records match “{q}”.</div>
          ) : (
            results.map((r, i) => {
              const header = r.group !== lastGroup ? r.group : null;
              lastGroup = r.group;
              const Icon = r.icon;
              return (
                <div key={r.group + r.id}>
                  {header && <div className="px-2.5 pb-1 pt-2 text-2xs font-medium text-muted">{header}</div>}
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(r)}
                    className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left ${i === active ? 'bg-canvas' : ''}`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">{r.title}</span>
                      <span className="block truncate text-xs text-muted">{r.meta}</span>
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const { derived, readNotifications, markNotificationsRead } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);

  const top = derived.attention[0];
  const items = [
    top && { id: 'n-top', icon: AlertOctagon, tone: 'text-bad', title: top.issue, meta: `${top.title} · ${top.kind === 'supplier' ? PACKAGES.find((p) => p.id === top.packageId)?.name : 'package'}`, to: top.supplierId ? `/readiness?supplier=${top.supplierId}&package=${top.packageId}&run=1` : `/packages/${top.packageId}` },
    { id: 'n-expiring', icon: CalendarClock, tone: 'text-warn', title: `${derived.kpis.expiring30} documents expire within 30 days`, meta: 'Supplier passports', to: '/suppliers?view=expiring' },
    { id: 'n-review', icon: Inbox, tone: 'text-info', title: `${derived.kpis.outstandingChecks} evidence items awaiting review`, meta: 'Review Queue', to: '/review' },
    ...[...PACKAGES].sort((a, b) => a.reviewDate.localeCompare(b.reviewDate)).slice(0, 1).map((p) => (
      { id: `n-review-${p.id}`, icon: FolderKanban, tone: 'text-muted', title: `${p.name} go / no-go review on ${formatShortDate(p.reviewDate)}`, meta: 'Next package review', to: `/packages/${p.id}` }
    )),
    { id: 'n-audit', icon: FileArchive, tone: 'text-muted', title: 'Audit pack SS-2026-104 generated', meta: 'Priya Shah · 23 Oct', to: '/audit?record=SS-2026-104' },
  ].filter(Boolean) as { id: string; icon: LucideIcon; tone: string; title: string; meta: string; to: string }[];

  const unread = items.filter((i) => !readNotifications.includes(i.id));

  return (
    <div ref={ref} className="relative">
      <IconButton label="Notifications" icon={Bell} onClick={() => setOpen((v) => !v)} aria-expanded={open} />
      {unread.length > 0 && (
        <span className="tnum pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[10px] font-semibold text-white ring-2 ring-white">{unread.length}</span>
      )}
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-line bg-white shadow-pop animate-pop-in">
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
            <span className="text-[13px] font-semibold">Notifications</span>
            <button type="button" className="text-xs font-medium text-brand hover:text-brand-dark disabled:text-subtle" disabled={!unread.length} onClick={() => markNotificationsRead(items.map((i) => i.id))}>
              Mark all as read
            </button>
          </div>
          <ul className="max-h-[360px] overflow-y-auto p-1.5">
            {items.map((n) => {
              const Icon = n.icon;
              const isUnread = !readNotifications.includes(n.id);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => { markNotificationsRead([n.id]); setOpen(false); navigate(n.to); }}
                    className="flex w-full items-start gap-3 rounded-md px-2.5 py-2.5 text-left hover:bg-canvas"
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${n.tone}`} />
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[13px] ${isUnread ? 'font-medium text-ink' : 'text-muted'}`}>{n.title}</span>
                      <span className="block text-xs text-muted">{n.meta}</span>
                    </span>
                    {isUnread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function ProfileMenu({ onHowItWorks, onReset }: { onHowItWorks: () => void; onReset: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white ring-offset-2 transition hover:ring-2 hover:ring-line"
      >
        {CURRENT_USER.initials}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-lg border border-line bg-white p-1.5 shadow-pop animate-pop-in">
          <div className="px-2.5 py-2">
            <div className="text-[13px] font-semibold">{CURRENT_USER.name}</div>
            <div className="text-xs text-muted">{CURRENT_USER.role} · Northstar Construction</div>
            <div className="mt-0.5 text-xs text-subtle">{CURRENT_USER.email}</div>
          </div>
          <div className="my-1 border-t border-line-soft" />
          <button type="button" onClick={() => { setOpen(false); onHowItWorks(); }} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] hover:bg-canvas">
            <HelpCircle className="h-4 w-4 text-muted" /> How SupplySure works
          </button>
          <button type="button" onClick={() => { setOpen(false); onReset(); }} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] hover:bg-canvas">
            <RotateCcw className="h-4 w-4 text-muted" /> Reset demonstration data
          </button>
          <div className="my-1 border-t border-line-soft" />
          <p className="px-2.5 py-1.5 text-2xs text-muted">Demo environment — no sign-in or account management.</p>
        </div>
      )}
    </div>
  );
}

export function Topbar({ onMenu, onHowItWorks, onReset }: { onMenu: () => void; onHowItWorks: () => void; onReset: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <IconButton label="Open navigation" icon={Menu} onClick={onMenu} className="lg:hidden" />
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-warn/30 bg-warn-bg px-2.5 py-1 text-xs font-medium text-[#94611A] md:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-warn" />
          Demo environment
        </span>
        <Notifications />
        <ProfileMenu onHowItWorks={onHowItWorks} onReset={onReset} />
      </div>
    </header>
  );
}
