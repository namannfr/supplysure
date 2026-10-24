import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CURRENT_USER, PACKAGES, SEED_AUDIT_SPECS, SEED_EVIDENCE, SUPPLIERS } from '../data/demoData';
import type { Assessment, AuditRecord, EvidenceRecord, ReviewDecision, Supplier, TradeId } from '../types';
import { deriveAll, type Derived } from './derive';
import { DEMO_TODAY, nowStamp } from './formatters';
import { runAssessment } from './readinessEngine';
import { clearState, loadState, saveState } from './storage';

interface DemoState {
  suppliers: Supplier[];
  evidence: EvidenceRecord[];
  audits: AuditRecord[];
  decisions: ReviewDecision[];
  readNotifications: string[];
  lastAssessment: Assessment | null;
}

function seedAudits(): AuditRecord[] {
  return SEED_AUDIT_SPECS.map((spec) => {
    const supplier = SUPPLIERS.find((s) => s.id === spec.supplierId)!;
    const pkg = PACKAGES.find((p) => p.id === spec.packageId)!;
    return {
      id: spec.id,
      generatedAt: spec.generatedAt,
      reviewer: spec.reviewer,
      note: spec.note,
      origin: 'seed' as const,
      assessment: runAssessment({
        supplier, pkg, mobilisation: pkg.mobilisation, finish: pkg.finish, evidence: SEED_EVIDENCE, ranAt: spec.generatedAt,
      }),
    };
  }).reverse();
}

function seedState(): DemoState {
  return {
    suppliers: SUPPLIERS,
    evidence: SEED_EVIDENCE,
    audits: seedAudits(),
    decisions: [],
    readNotifications: [],
    lastAssessment: null,
  };
}

interface Store extends DemoState {
  derived: Derived;
  inviteSupplier: (input: { company: string; contact: string; email: string; trade: TradeId }) => Supplier;
  decideReview: (evidenceId: string, decision: ReviewDecision['decision'], note: string) => void;
  recordAssessment: (a: Assessment) => void;
  createAuditPack: (a: Assessment, note?: string) => AuditRecord;
  markNotificationsRead: (ids: string[]) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => loadState<DemoState>() ?? seedState());

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => saveState(state), [state]);

  const derived = useMemo(() => deriveAll(state.suppliers, state.evidence), [state.suppliers, state.evidence]);

  const inviteSupplier: Store['inviteSupplier'] = useCallback((input) => {
    const next = Math.max(...stateRef.current.suppliers.map((x) => Number(x.id.slice(1)))) + 1;
    const created: Supplier = {
        id: `S${String(next).padStart(2, '0')}`,
        name: input.company.trim(),
        trade: input.trade,
        location: '—',
        contactName: input.contact.trim(),
        email: input.email.trim(),
        status: 'invited',
        joined: DEMO_TODAY,
    };
    setState((s) => ({ ...s, suppliers: [created, ...s.suppliers] }));
    return created;
  }, []);

  const decideReview: Store['decideReview'] = useCallback((evidenceId, decision, note) => {
    setState((s) => ({
      ...s,
      evidence: s.evidence.map((e) =>
        e.id === evidenceId
          ? {
              ...e,
              verification: decision === 'approved' ? 'verified' : 'correction_requested',
              reviewedBy: CURRENT_USER.name,
              reviewedAt: DEMO_TODAY,
              reviewNote: note || undefined,
            }
          : e,
      ),
      decisions: [{ evidenceId, decision, by: CURRENT_USER.name, at: nowStamp(), note }, ...s.decisions],
    }));
  }, []);

  const recordAssessment = useCallback((a: Assessment) => setState((s) => ({ ...s, lastAssessment: a })), []);

  const createAuditPack: Store['createAuditPack'] = useCallback((a, note) => {
    const max = Math.max(100, ...stateRef.current.audits.map((r) => Number(r.id.split('-')[2])));
    const record: AuditRecord = {
        id: `SS-2026-${max + 1}`,
        generatedAt: nowStamp(),
        reviewer: CURRENT_USER.name,
        note: note ?? 'Generated from the current readiness check.',
        origin: 'generated',
        assessment: a,
    };
    setState((s) => ({ ...s, audits: [record, ...s.audits] }));
    return record;
  }, []);

  const markNotificationsRead = useCallback(
    (ids: string[]) => setState((s) => ({ ...s, readNotifications: [...new Set([...s.readNotifications, ...ids])] })),
    [],
  );

  const resetDemo = useCallback(() => {
    clearState();
    setState(seedState());
  }, []);

  const value: Store = {
    ...state,
    derived,
    inviteSupplier,
    decideReview,
    recordAssessment,
    createAuditPack,
    markNotificationsRead,
    resetDemo,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside DemoProvider');
  return ctx;
}

export function useSupplier(id: string | null | undefined) {
  const { suppliers } = useStore();
  return suppliers.find((s) => s.id === id);
}
