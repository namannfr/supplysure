import { PACKAGES } from '../data/demoData';
import type { Assessment, CorrectiveAction, EvidenceRecord, Package, Priority, Risk, Supplier, Verdict } from '../types';
import { DEMO_TODAY, addDays, daysBetween, pct } from './formatters';
import { evaluatePassport, rank, runAssessment } from './readinessEngine';

export interface PackageStats {
  pkg: Package;
  total: number;
  ready: number;
  action: number;
  notReady: number;
  readiness: number;
  openActions: number;
  risk: Risk;
  status: 'At risk' | 'Actions open' | 'Ready to mobilise';
  assessments: Assessment[];
}

export interface SupplierStats {
  supplier: Supplier;
  health: number;
  satisfied: number;
  total: number;
  passportComplete: boolean;
  risk: Risk;
  riskReason: string;
  livePackages: Package[];
  nextExpiry: EvidenceRecord | null;
  pendingCount: number;
  assessments: Assessment[];
}

export interface AttentionItem {
  id: string;
  kind: 'supplier' | 'package';
  title: string;
  issue: string;
  due: string;
  severity: Priority;
  supplierId?: string;
  packageId: string;
}

export function assignmentKey(packageId: string, supplierId: string) {
  return `${packageId}:${supplierId}`;
}

export function deriveAll(suppliers: Supplier[], evidence: EvidenceRecord[], today = DEMO_TODAY) {
  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
  const ranAt = `${today}T00:00`;

  const assessments = new Map<string, Assessment>();
  for (const pkg of PACKAGES) {
    for (const a of pkg.assignments) {
      const supplier = supplierMap.get(a.supplierId);
      if (!supplier) continue;
      assessments.set(
        assignmentKey(pkg.id, supplier.id),
        runAssessment({ supplier, pkg, mobilisation: pkg.mobilisation, finish: pkg.finish, evidence, ranAt }),
      );
    }
  }

  const packageStats: PackageStats[] = PACKAGES.map((pkg) => {
    const list = pkg.assignments
      .map((a) => assessments.get(assignmentKey(pkg.id, a.supplierId)))
      .filter((x): x is Assessment => !!x);
    const count = (v: Verdict) => list.filter((x) => x.verdict === v).length;
    const ready = count('ready');
    const action = count('action');
    const notReady = count('not_ready');
    const risk: Risk = notReady > 0 ? 'high' : action > 0 ? 'medium' : 'low';
    return {
      pkg,
      total: list.length,
      ready,
      action,
      notReady,
      readiness: pct(ready, list.length),
      openActions: list.reduce((n, x) => n + x.actions.length, 0),
      risk,
      status: notReady > 0 ? 'At risk' : action > 0 ? 'Actions open' : 'Ready to mobilise',
      assessments: list,
    };
  });

  const activeSuppliers = suppliers.filter((s) => s.status === 'active');
  const in30 = addDays(today, 30);
  const in60 = addDays(today, 60);

  const supplierStats: SupplierStats[] = suppliers.map((supplier) => {
    const passport = evaluatePassport(supplier, evidence, today);
    const own = evidence.filter((e) => e.supplierId === supplier.id);
    const live = PACKAGES.filter((p) => p.assignments.some((a) => a.supplierId === supplier.id));
    const own_assessments = live
      .map((p) => assessments.get(assignmentKey(p.id, supplier.id)))
      .filter((x): x is Assessment => !!x);
    const upcoming = own
      .filter((e) => e.expires && e.expires >= today)
      .sort((a, b) => a.expires!.localeCompare(b.expires!));
    const nextExpiry = upcoming[0] ?? null;
    const pendingCount = own.filter((e) => e.verification === 'pending').length;

    let risk: Risk = 'low';
    let riskReason = 'All evidence current and verified';
    const notReadyOn = own_assessments.filter((a) => a.verdict === 'not_ready');
    if (supplier.status === 'invited') {
      risk = 'medium';
      riskReason = 'Invitation sent — passport not yet started';
    } else if (notReadyOn.length > 0 || passport.criticalFailure) {
      risk = 'high';
      riskReason = notReadyOn.length > 0
        ? `Not ready for ${notReadyOn.map((a) => PACKAGES.find((p) => p.id === a.packageId)!.name).join(', ')}`
        : 'Critical evidence missing or invalid';
    } else if (
      own_assessments.some((a) => a.verdict === 'action') ||
      pendingCount > 0 ||
      !passport.complete ||
      (nextExpiry && nextExpiry.expires! <= in60)
    ) {
      risk = 'medium';
      riskReason = own_assessments.some((a) => a.verdict === 'action')
        ? 'Actions open on a live package'
        : pendingCount > 0
          ? 'Evidence awaiting review'
          : !passport.complete
            ? 'Passport incomplete'
            : 'Evidence expiring within 60 days';
    }

    return {
      supplier,
      health: pct(passport.satisfied, passport.total),
      satisfied: passport.satisfied,
      total: passport.total,
      passportComplete: supplier.status === 'active' && passport.complete,
      risk,
      riskReason,
      livePackages: live,
      nextExpiry,
      pendingCount,
      assessments: own_assessments,
    };
  });

  const liveAssessments = [...assessments.values()];
  const allActions: CorrectiveAction[] = liveAssessments.flatMap((a) => a.actions);
  const activeIds = new Set(activeSuppliers.map((s) => s.id));
  const activeEvidence = evidence.filter((e) => activeIds.has(e.supplierId));
  const expiringIn = (limit: string) =>
    activeEvidence.filter((e) => e.expires && e.expires >= today && e.expires <= limit);

  const reviewQueue = evidence.filter((e) => e.verification === 'pending');

  const kpis = {
    assignments: liveAssessments.length,
    ready: liveAssessments.filter((a) => a.verdict === 'ready').length,
    action: liveAssessments.filter((a) => a.verdict === 'action').length,
    notReady: liveAssessments.filter((a) => a.verdict === 'not_ready').length,
    complianceRate: pct(liveAssessments.filter((a) => a.verdict === 'ready').length, liveAssessments.length),
    expiring30: expiringIn(in30).length,
    expiring60: expiringIn(in60).length,
    outstandingChecks: reviewQueue.length,
    highRisk: supplierStats.filter((s) => s.supplier.status === 'active' && s.risk === 'high').length,
    openActions: allActions.length,
    activeSuppliers: activeSuppliers.length,
    passportsComplete: supplierStats.filter((s) => s.passportComplete).length,
  };

  // Requires attention: one item per non-ready assignment plus package-level escalations.
  const attention: AttentionItem[] = [];
  for (const a of liveAssessments) {
    if (a.verdict === 'ready' || a.actions.length === 0) continue;
    const top = a.actions[0];
    attention.push({
      id: `att-${a.supplierId}-${a.packageId}`,
      kind: 'supplier',
      title: supplierMap.get(a.supplierId)!.name,
      issue: top.issue,
      due: top.due,
      severity: top.priority,
      supplierId: a.supplierId,
      packageId: a.packageId,
    });
  }
  for (const ps of packageStats) {
    if (ps.notReady >= 2) {
      attention.push({
        id: `att-pkg-${ps.pkg.id}`,
        kind: 'package',
        title: ps.pkg.name,
        issue: `${numberWord(ps.notReady)} suppliers remain not ready`,
        due: ps.pkg.reviewDate,
        severity: 'critical',
        packageId: ps.pkg.id,
      });
    }
  }
  attention.sort(
    (x, y) =>
      x.due.localeCompare(y.due) ||
      (x.kind === y.kind ? 0 : x.kind === 'package' ? -1 : 1) ||
      rank(x.severity) - rank(y.severity),
  );

  return { assessments, packageStats, supplierStats, kpis, attention, allActions, reviewQueue, expiringIn, in30, in60 };
}

export type Derived = ReturnType<typeof deriveAll>;

function numberWord(n: number) {
  return ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'][n] ?? String(n);
}

export function withinDays(iso: string, days: number, today = DEMO_TODAY) {
  const d = daysBetween(today, iso);
  return d >= 0 && d <= days;
}
