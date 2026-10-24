import { useRef, useState } from 'react';
import {
  BookOpenCheck,
  Check,
  ChevronsUpDown,
  ClipboardCheck,
  FileArchive,
  FolderKanban,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Library,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { WORKSPACE } from '../../data/demoData';
import { navigate } from '../../lib/router';
import { useStore } from '../../lib/store';
import { useOutsideClick } from '../ui/Overlay';

export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0D9488" />
      <path d="M16 6.5 24 9.6v6.1c0 4.9-3.3 8.4-8 9.8-4.7-1.4-8-4.9-8-9.8V9.6z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="m12.4 16.2 2.6 2.6 4.8-5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface NavItem { to: string; label: string; icon: LucideIcon; count?: number }

export function Sidebar({ current, onNavigate, onHowItWorks }: { current: string; onNavigate?: () => void; onHowItWorks: () => void }) {
  const { derived } = useStore();
  const [wsOpen, setWsOpen] = useState(false);
  const wsRef = useRef<HTMLDivElement>(null);
  useOutsideClick(wsRef, () => setWsOpen(false), wsOpen);

  const sections: { label: string; items: NavItem[] }[] = [
    {
      label: 'Workspace',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/packages', label: 'Packages', icon: FolderKanban },
        { to: '/suppliers', label: 'Suppliers', icon: Users },
        { to: '/readiness', label: 'Readiness Check', icon: ClipboardCheck },
      ],
    },
    {
      label: 'Assurance',
      items: [
        { to: '/library', label: 'Requirement Library', icon: Library },
        { to: '/review', label: 'Review Queue', icon: Inbox, count: derived.reviewQueue.length },
        { to: '/audit', label: 'Audit Packs', icon: FileArchive },
      ],
    },
  ];

  const go = (to: string) => {
    navigate(to);
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col bg-navy-deep text-white">
      <div className="flex items-center gap-2.5 px-5 pb-4 pt-5">
        <Logo />
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">SupplySure</div>
          <div className="text-xs text-navy-muted">Package readiness</div>
        </div>
      </div>

      <div ref={wsRef} className="relative px-3">
        <button
          type="button"
          onClick={() => setWsOpen((v) => !v)}
          aria-expanded={wsOpen}
          className="flex w-full items-center gap-2.5 rounded-md border border-navy-line bg-navy/60 px-2.5 py-2 text-left transition-colors hover:bg-navy"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#E9EEF3] text-xs font-semibold text-navy">NC</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium">{WORKSPACE.name}</span>
            <span className="block text-2xs text-navy-muted">{WORKSPACE.kind}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 text-navy-muted" />
        </button>
        {wsOpen && (
          <div className="absolute left-3 right-3 top-full z-30 mt-1 rounded-md border border-line bg-white p-1 text-ink shadow-pop animate-pop-in">
            <div className="px-2.5 pb-1 pt-1.5 text-2xs font-medium text-muted">Workspaces</div>
            <div className="flex items-center gap-2 rounded px-2.5 py-2 text-[13px]">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-canvas text-2xs font-semibold text-navy">NC</span>
              <span className="flex-1">
                <span className="block font-medium">{WORKSPACE.name}</span>
                <span className="block text-2xs text-muted">{WORKSPACE.kind}</span>
              </span>
              <Check className="h-4 w-4 text-brand" />
            </div>
            <p className="border-t border-line-soft px-2.5 py-2 text-2xs text-muted">The demonstration environment contains a single buyer workspace.</p>
          </div>
        )}
      </div>

      <nav className="mt-5 flex-1 space-y-5 overflow-y-auto px-3" aria-label="Main">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="mb-1.5 px-2.5 text-2xs font-medium uppercase tracking-[0.08em] text-navy-muted/80">{section.label}</div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = current === item.to || current.startsWith(item.to + '/');
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <button
                      type="button"
                      onClick={() => go(item.to)}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] transition-colors ${
                        active ? 'bg-white font-medium text-navy shadow-card' : 'text-[#C9D5E1] hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? 'text-brand' : 'text-navy-muted group-hover:text-white'}`} strokeWidth={1.9} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {!!item.count && (
                        <span className={`tnum rounded px-1.5 text-2xs font-medium ${active ? 'bg-canvas text-muted' : 'bg-white/10 text-[#C9D5E1]'}`}>{item.count}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-3 px-3 pb-4 pt-3">
        <button
          type="button"
          onClick={onHowItWorks}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] text-[#C9D5E1] transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <HelpCircle className="h-4 w-4 text-navy-muted" strokeWidth={1.9} />
          How SupplySure works
        </button>
        <div className="rounded-md border border-navy-line bg-navy/50 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-white">
            <BookOpenCheck className="h-3.5 w-3.5 text-brand-accent" />
            Demonstration data
          </div>
          <p className="mt-1.5 text-2xs leading-[1.5] text-navy-muted">
            SupplySure supports buyer decisions. It does not certify or approve subcontractors. All records shown are fictional.
          </p>
        </div>
      </div>
    </div>
  );
}
