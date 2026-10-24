/**
 * Deterministic readiness engine.
 *
 * Evaluates recorded evidence metadata against a requirement set for one assessment window
 * (mobilisation → finish). Same inputs always give the same verdict. It does not read or verify
 * document contents — verification status comes from human reviewers.
 */
import { PACKAGES, REQUIREMENTS_BY_ID, REQUIREMENT_SETS, TRADE_SET } from '../data/demoData';
import type {
  Assessment,
  CorrectiveAction,
  EvidenceRecord,
  EvidenceSnapshot,
  Package,
  Priority,
  Requirement,
  RequirementResult,
  RequirementSet,
  Supplier,
  Verdict,
} from '../types';
import { formatCover, formatDate, lowerFirst } from './formatters';

export function setsFor(supplier: Supplier, pkg?: Package): RequirementSet[] {
  const sets = [REQUIREMENT_SETS.find((s) => s.id === TRADE_SET[supplier.trade])!];
  if (pkg?.overlaySetId) sets.push(REQUIREMENT_SETS.find((s) => s.id === pkg.overlaySetId)!);
  return sets;
}

function snapshot(e: EvidenceRecord): EvidenceSnapshot {
  return {
    id: e.id,
    label: e.label,
    title: e.title,
    issuer: e.issuer,
    reference: e.reference,
    expires: e.expires,
    verification: e.verification,
    scope: e.scope,
    cover: e.cover,
    fileName: e.fileName,
  };
}

function sourceLabel(e?: EvidenceRecord): string {
  if (!e) return 'No source on passport';
  if (e.verification === 'verified') return `${e.id} · ${e.reference} · verified by ${e.reviewedBy ?? 'reviewer'}`;
  if (e.verification === 'pending') return `${e.id} · ${e.reference} · supplier-submitted, not yet verified`;
  return `${e.id} · ${e.reference} · correction requested`;
}

export function evaluateRequirement(
  req: Requirement,
  setId: string,
  evidence: EvidenceRecord | undefined,
  window: { mobilisation: string; finish: string },
): RequirementResult {
  const base = {
    requirementId: req.id,
    setId,
    name: req.name,
    shortName: req.shortName,
    critical: req.critical,
    source: sourceLabel(evidence),
    evidence: evidence ? snapshot(evidence) : undefined,
  };
  const failOutcome = req.critical ? 'not_satisfied' : 'action';

  if (!evidence) {
    return {
      ...base,
      outcome: failOutcome,
      reasonCode: 'missing',
      explanation: req.critical
        ? 'No evidence on the supplier passport. Critical requirement — the supplier cannot mobilise without it.'
        : 'No evidence on the supplier passport. Non-critical — obtain it or record a justified exception.',
    };
  }

  if (evidence.verification === 'correction_requested') {
    return {
      ...base,
      outcome: failOutcome,
      reasonCode: 'correction',
      explanation: `A reviewer requested a correction${evidence.reviewedAt ? ` on ${formatDate(evidence.reviewedAt)}` : ''}. The document does not count until it is resubmitted and verified.`,
    };
  }

  if (req.requiredScope && evidence.scope !== req.requiredScope) {
    return {
      ...base,
      outcome: failOutcome,
      reasonCode: 'scope_mismatch',
      explanation: `Evidence scope is “${evidence.scope ?? 'not stated'}”; the requirement needs “${req.requiredScope}”. Out-of-scope evidence is not accepted.`,
    };
  }

  if (req.minCover && (evidence.cover ?? 0) < req.minCover) {
    return {
      ...base,
      outcome: failOutcome,
      reasonCode: 'cover_short',
      explanation: `Recorded cover of ${formatCover(evidence.cover)} is below the ${formatCover(req.minCover)} minimum.`,
    };
  }

  if (req.checksValidity && evidence.expires && evidence.expires < window.mobilisation) {
    return {
      ...base,
      outcome: failOutcome,
      reasonCode: 'expired',
      explanation: `Expires ${formatDate(evidence.expires)}, before mobilisation on ${formatDate(window.mobilisation)}.`,
    };
  }

  if (req.manualAssessment && evidence.verification === 'pending') {
    return {
      ...base,
      outcome: 'action',
      reasonCode: 'manual',
      explanation: `Submitted ${formatDate(evidence.submitted)}. Status cannot be decided from metadata — a reviewer must make and record the determination.`,
    };
  }

  if (evidence.verification === 'pending') {
    return {
      ...base,
      outcome: 'action',
      reasonCode: 'pending',
      explanation: `Submitted ${formatDate(evidence.submitted)} and awaiting reviewer verification. Metadata looks complete but has not been confirmed.`,
    };
  }

  if (req.checksValidity && evidence.expires && evidence.expires < window.finish) {
    return {
      ...base,
      outcome: 'action',
      reasonCode: 'expires_during',
      explanation: `Valid at mobilisation but expires ${formatDate(evidence.expires)}, before the package finishes on ${formatDate(window.finish)}.`,
    };
  }

  const parts: string[] = [];
  if (evidence.cover && req.minCover) parts.push(`${formatCover(evidence.cover)} cover meets the ${formatCover(req.minCover)} minimum`);
  if (req.requiredScope) parts.push(`scope “${evidence.scope}” matches`);
  if (evidence.expires) parts.push(`valid to ${formatDate(evidence.expires)}, covering the full window`);
  else parts.push('no expiry applies');
  const text = parts.join('; ');
  return {
    ...base,
    outcome: 'satisfied',
    reasonCode: 'valid',
    explanation: text.charAt(0).toUpperCase() + text.slice(1) + '.',
  };
}

function priorityFor(r: RequirementResult): Priority {
  if (r.outcome === 'not_satisfied') return 'critical';
  if (r.reasonCode === 'expires_during' || (r.critical && r.reasonCode !== 'manual')) return 'high';
  return 'medium';
}

function actionText(r: RequirementResult, pkg: Package, window: { finish: string }): { issue: string; recommendation: string } {
  const label = r.evidence?.label ?? r.shortName;
  switch (r.reasonCode) {
    case 'missing':
      return {
        issue: `${r.shortName} missing for ${pkg.name}`,
        recommendation: r.critical
          ? `Request ${lowerFirst(r.shortName)} from the supplier and verify it before the evidence deadline.`
          : `Request ${lowerFirst(r.shortName)} or record a justified exception.`,
      };
    case 'expired':
      return {
        issue: `${label} expires before mobilisation`,
        recommendation: `Obtain renewed ${lowerFirst(label)} valid to at least ${formatDate(window.finish)}.`,
      };
    case 'expires_during':
      return {
        issue: `${label} expires during ${pkg.name} package`,
        recommendation: `Request renewal evidence before ${formatDate(r.evidence!.expires)} and set a reminder.`,
      };
    case 'scope_mismatch':
      return {
        issue: `${label} does not cover the required scope`,
        recommendation: `Request evidence covering the required scope, or reassign this scope of works.`,
      };
    case 'cover_short':
      return { issue: `${label} cover below minimum`, recommendation: 'Request an increased limit of indemnity from the supplier.' };
    case 'manual':
      return { issue: `${r.shortName} requires manual assessment`, recommendation: 'Complete the assessment in the Review Queue and record the decision.' };
    case 'pending':
      return { issue: `${label} awaiting verification`, recommendation: 'Verify the document against its metadata in the Review Queue.' };
    case 'correction':
      return { issue: `${label} correction outstanding`, recommendation: 'Chase the supplier for a corrected document.' };
    default:
      return { issue: r.shortName, recommendation: '' };
  }
}

export interface AssessmentInput {
  supplier: Supplier;
  pkg: Package;
  mobilisation: string;
  finish: string;
  evidence: EvidenceRecord[];
  ranAt: string;
}

export function runAssessment({ supplier, pkg, mobilisation, finish, evidence, ranAt }: AssessmentInput): Assessment {
  const sets = setsFor(supplier, pkg);
  const own = evidence.filter((e) => e.supplierId === supplier.id);
  const window = { mobilisation, finish };
  const rows: RequirementResult[] = [];
  for (const set of sets) {
    for (const reqId of set.requirementIds) {
      const req = REQUIREMENTS_BY_ID[reqId];
      const ev = own
        .filter((e) => e.type === req.evidenceType)
        .sort((a, b) => b.submitted.localeCompare(a.submitted))[0];
      rows.push(evaluateRequirement(req, set.id, ev, window));
    }
  }

  const assignment = pkg.assignments.find((a) => a.supplierId === supplier.id);
  let due = assignment?.evidenceDue ?? pkg.reviewDate;
  if (mobilisation < due) due = mobilisation;

  const actions: CorrectiveAction[] = rows
    .filter((r) => r.outcome !== 'satisfied')
    .map((r) => ({
      id: `${supplier.id}-${pkg.id}-${r.requirementId}`,
      supplierId: supplier.id,
      packageId: pkg.id,
      requirementId: r.requirementId,
      priority: priorityFor(r),
      due,
      reasonCode: r.reasonCode,
      ...actionText(r, pkg, window),
    }))
    .sort((a, b) => rank(a.priority) - rank(b.priority));

  const counts = {
    assessed: rows.length,
    satisfied: rows.filter((r) => r.outcome === 'satisfied').length,
    action: rows.filter((r) => r.outcome === 'action').length,
    notSatisfied: rows.filter((r) => r.outcome === 'not_satisfied').length,
  };
  const verdict: Verdict = counts.notSatisfied > 0 ? 'not_ready' : counts.action > 0 ? 'action' : 'ready';

  return {
    id: `${supplier.id}-${pkg.id}-${mobilisation}-${finish}`,
    supplierId: supplier.id,
    packageId: pkg.id,
    mobilisation,
    finish,
    requirementSets: sets.map((s) => ({ id: s.id, name: s.name, version: s.version })),
    ranAt,
    verdict,
    rows,
    actions,
    counts,
  };
}

export function rank(p: Priority): number {
  return p === 'critical' ? 0 : p === 'high' ? 1 : 2;
}

/** Passport view: the supplier's trade set evaluated for today only (no package window). */
export function evaluatePassport(supplier: Supplier, evidence: EvidenceRecord[], today: string) {
  const set = setsFor(supplier)[0];
  const own = evidence.filter((e) => e.supplierId === supplier.id);
  const rows = set.requirementIds.map((reqId) => {
    const req = REQUIREMENTS_BY_ID[reqId];
    const ev = own.filter((e) => e.type === req.evidenceType).sort((a, b) => b.submitted.localeCompare(a.submitted))[0];
    return evaluateRequirement(req, set.id, ev, { mobilisation: today, finish: today });
  });
  const satisfied = rows.filter((r) => r.outcome === 'satisfied').length;
  const complete = rows.every((r) => r.reasonCode !== 'missing' && r.outcome !== 'not_satisfied' && r.reasonCode !== 'correction');
  const criticalFailure = rows.some((r) => r.outcome === 'not_satisfied');
  return { set, rows, satisfied, total: rows.length, complete, criticalFailure };
}

export function packageById(id: string): Package | undefined {
  return PACKAGES.find((p) => p.id === id);
}

/** Compares an audit record's recorded outcome with a fresh run on current evidence. */
export function reproduces(a: Assessment, b: Assessment): boolean {
  if (a.verdict !== b.verdict || a.rows.length !== b.rows.length) return false;
  return a.rows.every((r, i) => r.outcome === b.rows[i].outcome && r.reasonCode === b.rows[i].reasonCode);
}
