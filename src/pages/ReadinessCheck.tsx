import { useEffect, useMemo, useState } from 'react';
import { PACKAGES } from '../data/demoData';
import { PageHeader } from '../components/layout/PageHeader';
import { CorrectiveActions } from '../components/readiness/CorrectiveActions';
import { ReadinessForm, type CheckInputs } from '../components/readiness/ReadinessForm';
import { ReadinessSummary } from '../components/readiness/ReadinessSummary';
import { RequirementsTable } from '../components/readiness/RequirementsTable';
import { useToast } from '../components/ui/Toast';
import { CURRENT_USER } from '../data/demoData';
import { nowStamp } from '../lib/formatters';
import { runAssessment } from '../lib/readinessEngine';
import { downloadAssessment } from '../lib/reports';
import { navigate, type Route } from '../lib/router';
import { useStore } from '../lib/store';

function inputsFor(supplierId: string, packageId: string): CheckInputs {
  const pkg = PACKAGES.find((p) => p.id === packageId) ?? PACKAGES[0];
  return { supplierId, packageId: pkg.id, mobilisation: pkg.mobilisation, finish: pkg.finish };
}

export function ReadinessCheck({ route }: { route: Route }) {
  const { subcontractors, evidence, lastAssessment, recordAssessment, createAuditPack } = useStore();
  const toast = useToast();

  const [inputs, setInputs] = useState<CheckInputs>(() =>
    lastAssessment
      ? { supplierId: lastAssessment.supplierId, packageId: lastAssessment.packageId, mobilisation: lastAssessment.mobilisation, finish: lastAssessment.finish }
      : inputsFor('S01', 'P01'),
  );
  const [ranAt, setRanAt] = useState<string | null>(lastAssessment?.ranAt ?? null);

  // Deep links from the dashboard, subcontractor drawer and package pages.
  const paramKey = route.params.toString();
  useEffect(() => {
    const s = route.params.get('subcontractor');
    if (!s) return;
    const p = route.params.get('package') ?? PACKAGES.find((x) => x.assignments.some((a) => a.supplierId === s))?.id ?? 'P01';
    setInputs(inputsFor(s, p));
    setRanAt(route.params.get('run') === '1' ? nowStamp() : null);
    window.history.replaceState(null, '', '#/readiness');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey]);

  const dateError = inputs.finish <= inputs.mobilisation ? 'Package finish must be after mobilisation.' : undefined;
  const subcontractor = subcontractors.find((s) => s.id === inputs.supplierId);
  const pkg = PACKAGES.find((p) => p.id === inputs.packageId)!;

  const assessment = useMemo(() => {
    if (!ranAt || dateError || !subcontractor) return null;
    return runAssessment({ subcontractor, pkg, mobilisation: inputs.mobilisation, finish: inputs.finish, evidence, ranAt });
  }, [ranAt, dateError, subcontractor, pkg, inputs.mobilisation, inputs.finish, evidence]);

  useEffect(() => {
    if (assessment) recordAssessment(assessment);
  }, [assessment, recordAssessment]);

  const run = () => {
    setRanAt(nowStamp());
    toast({ tone: 'success', title: 'Readiness check complete', description: `${subcontractor?.name} assessed against ${pkg.name}.` });
  };

  const exportRecord = () => {
    if (!assessment) return;
    downloadAssessment(assessment, { generatedAt: nowStamp(), reviewer: CURRENT_USER.name }, subcontractors);
    toast({ tone: 'success', title: 'Audit record downloaded', description: 'A printable HTML record of these inputs and results.' });
  };

  const savePack = () => {
    if (!assessment) return;
    const record = createAuditPack(assessment);
    toast({ tone: 'success', title: `Audit pack ${record.id} created`, description: 'Saved to Audit Packs with the inputs, results and evidence references.' });
    navigate(`/audit?record=${record.id}`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Deterministic readiness engine"
        title="Package readiness check"
        description="Test a subcontractor against one requirement set and one date. Change the package or date to see the verdict recompute."
      />
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
        <div>
          <ReadinessForm subcontractors={subcontractors} inputs={inputs} onChange={(next) => setInputs((i) => ({ ...i, ...next }))} onRun={run} dateError={dateError} />
        </div>
        <div className="min-w-0 space-y-6">
          <ReadinessSummary assessment={assessment} subcontractor={subcontractor} onExport={exportRecord} onSavePack={savePack} />
          <RequirementsTable assessment={assessment} />
          <CorrectiveActions assessment={assessment} onExport={exportRecord} />
        </div>
      </div>
    </>
  );
}
