import { useEffect, useState, type ReactNode } from 'react';
import { ClipboardCheck, FileArchive, FolderKanban, IdCard, ListChecks, ShieldAlert } from 'lucide-react';
import { useStore } from '../../lib/store';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Overlay';
import { useToast } from '../ui/Toast';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({ current, children }: { current: string; children: ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [how, setHow] = useState(false);
  const [reset, setReset] = useState(false);
  const { resetDemo } = useStore();
  const toast = useToast();

  useEffect(() => setMobileNav(false), [current]);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] lg:block">
        <Sidebar current={current} onHowItWorks={() => setHow(true)} />
      </aside>

      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-navy-deep/40 animate-fade-in" onClick={() => setMobileNav(false)} />
          <div className="absolute inset-y-0 left-0 w-[264px] animate-slide-in shadow-pop">
            <Sidebar current={current} onNavigate={() => setMobileNav(false)} onHowItWorks={() => { setMobileNav(false); setHow(true); }} />
          </div>
        </div>
      )}

      <div className="lg:pl-[264px]">
        <Topbar onMenu={() => setMobileNav(true)} onHowItWorks={() => setHow(true)} onReset={() => setReset(true)} />
        <main className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-7">{children}</main>
      </div>

      <HowItWorks open={how} onClose={() => setHow(false)} />

      <Modal
        open={reset}
        onClose={() => setReset(false)}
        size="sm"
        title="Reset demonstration data?"
        footer={
          <>
            <Button onClick={() => setReset(false)}>Cancel</Button>
            <Button
              variant="dark"
              onClick={() => {
                resetDemo();
                setReset(false);
                toast({ tone: 'success', title: 'Demonstration data reset', description: 'Invited suppliers, review decisions and generated audit packs were cleared.' });
              }}
            >
              Reset data
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-muted">
          This restores the original Northstar Construction dataset. Changes saved in this browser — invited suppliers, review decisions,
          the latest readiness check and generated audit packs — will be removed.
        </p>
      </Modal>
    </div>
  );
}

const CONCEPTS = [
  { icon: IdCard, title: 'Suppliers & evidence passports', body: 'Each supplier holds its insurance, accreditations and certificates once. Every record keeps its issuer, reference, scope and expiry.' },
  { icon: FolderKanban, title: 'Packages', body: 'A package is a scope of work on a project, with a mobilisation date, a finish date and the suppliers appointed to it.' },
  { icon: ListChecks, title: 'Requirement sets', body: 'Reusable, versioned sets per trade, plus package-specific additions such as DBS checks on a school site.' },
  { icon: ClipboardCheck, title: 'Readiness checks', body: 'Deterministic rules test each requirement against the evidence for the package dates. Same inputs, same verdict.' },
  { icon: FileArchive, title: 'Audit packs', body: 'A record of the inputs, rules, evidence references and reviewer decisions behind each verdict.' },
];

export function HowItWorks({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} size="lg" title="How SupplySure works" subtitle="Know which suppliers are ready for every package before mobilisation.">
      <div className="grid gap-3 sm:grid-cols-2">
        {CONCEPTS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3 rounded-md border border-line p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink">{title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{body}</p>
            </div>
          </div>
        ))}
        <div className="flex gap-3 rounded-md border border-warn/30 bg-warn-bg/60 p-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-warn">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink">What SupplySure does not do</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
              It supports buyer decisions. It does not certify or approve subcontractors, and the engine does not verify document authenticity — reviewers do.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
