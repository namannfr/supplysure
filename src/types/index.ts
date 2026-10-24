export type TradeId =
  | 'electrical'
  | 'fire'
  | 'mechanical'
  | 'renewables'
  | 'groundworks'
  | 'scaffolding'
  | 'roofing'
  | 'steel';

export type Verification = 'verified' | 'pending' | 'correction_requested';
export type Outcome = 'satisfied' | 'action' | 'not_satisfied';
export type Verdict = 'ready' | 'action' | 'not_ready';
export type Risk = 'high' | 'medium' | 'low';
export type Priority = 'critical' | 'high' | 'medium';

export type ReasonCode =
  | 'valid'
  | 'missing'
  | 'expired'
  | 'expires_during'
  | 'scope_mismatch'
  | 'cover_short'
  | 'pending'
  | 'manual'
  | 'correction';

export interface Requirement {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  critical: boolean;
  evidenceType: string;
  /** When true the evidence must be in date for the assessment window. */
  checksValidity: boolean;
  requiredScope?: string;
  minCover?: number;
  /** Cannot be decided from metadata; always needs a reviewer decision. */
  manualAssessment?: boolean;
}

export interface RequirementSet {
  id: string;
  name: string;
  kind: 'trade' | 'package';
  trade?: TradeId;
  packageId?: string;
  version: string;
  updated: string;
  owner: string;
  description: string;
  requirementIds: string[];
}

export interface Supplier {
  id: string;
  name: string;
  trade: TradeId;
  location: string;
  contactName: string;
  email: string;
  status: 'active' | 'invited';
  joined: string;
}

export interface EvidenceRecord {
  id: string;
  supplierId: string;
  type: string;
  label: string;
  title: string;
  issuer: string;
  reference: string;
  issued: string;
  expires: string | null;
  scope?: string;
  cover?: number;
  verification: Verification;
  submitted: string;
  fileName: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewReason?: string;
  reviewNote?: string;
}

export interface Assignment {
  supplierId: string;
  scopeOfWorks: string;
  /** Pre-start evidence deadline for this supplier; defaults to the package review date. */
  evidenceDue?: string;
}

export interface Package {
  id: string;
  name: string;
  site: string;
  scope: string;
  value: string;
  manager: string;
  mobilisation: string;
  finish: string;
  /** Go / no-go readiness review. */
  reviewDate: string;
  overlaySetId?: string;
  assignments: Assignment[];
}

export interface EvidenceSnapshot {
  id: string;
  label: string;
  title: string;
  issuer: string;
  reference: string;
  expires: string | null;
  verification: Verification;
  scope?: string;
  cover?: number;
  fileName: string;
}

export interface RequirementResult {
  requirementId: string;
  setId: string;
  name: string;
  shortName: string;
  critical: boolean;
  outcome: Outcome;
  reasonCode: ReasonCode;
  explanation: string;
  source: string;
  evidence?: EvidenceSnapshot;
}

export interface CorrectiveAction {
  id: string;
  supplierId: string;
  packageId: string;
  requirementId: string;
  issue: string;
  priority: Priority;
  recommendation: string;
  due: string;
  reasonCode: ReasonCode;
}

export interface Assessment {
  id: string;
  supplierId: string;
  packageId: string;
  mobilisation: string;
  finish: string;
  requirementSets: { id: string; name: string; version: string }[];
  ranAt: string;
  verdict: Verdict;
  rows: RequirementResult[];
  actions: CorrectiveAction[];
  counts: { assessed: number; satisfied: number; action: number; notSatisfied: number };
}

export interface AuditRecord {
  id: string;
  generatedAt: string;
  reviewer: string;
  note: string;
  origin: 'seed' | 'generated';
  assessment: Assessment;
}

export interface ReviewDecision {
  evidenceId: string;
  decision: 'approved' | 'correction_requested';
  by: string;
  at: string;
  note: string;
}
