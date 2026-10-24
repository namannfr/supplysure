import { AlertTriangle, CalendarClock, ClipboardCheck, FileSearch, Library, ListTodo, ShieldCheck } from 'lucide-react';
import { AttentionList } from '../components/dashboard/AttentionList';
import { MetricCard } from '../components/dashboard/MetricCard';
import { PriorityPackages } from '../components/dashboard/PriorityPackages';
import { ReadinessChart } from '../components/dashboard/ReadinessChart';
import { WorkflowStrip } from '../components/dashboard/WorkflowStrip';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { DEMO_TODAY, formatLongDate } from '../lib/formatters';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';

export function Dashboard() {
  const { derived } = useStore();
  const { kpis } = derived;
  const nonReady = kpis.action + kpis.notReady;

  return (
    <>
      <PageHeader
        eyebrow={`Portfolio overview · ${formatLongDate(DEMO_TODAY)}`}
        title="Compliance dashboard"
        description="See which suppliers are ready for each package and planned start date—before mobilisation is at risk."
        actions={
          <>
            <Button icon={Library} onClick={() => navigate('/library')}>Open requirement library</Button>
            <Button variant="primary" icon={ClipboardCheck} onClick={() => navigate('/readiness')}>Run readiness check</Button>
          </>
        }
      />

      <WorkflowStrip />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <MetricCard icon={ShieldCheck} accent="brand" value={`${kpis.complianceRate}%`} label="Supplier compliance rate" context={`${kpis.ready} of ${kpis.assignments} package assignments ready`} onClick={() => navigate('/packages')} />
        <MetricCard icon={CalendarClock} accent="warn" value={kpis.expiring60} label="Documents expiring in 60 days" context={`${kpis.expiring30} of them within 30 days`} onClick={() => navigate('/suppliers?view=expiring')} />
        <MetricCard icon={FileSearch} accent="info" value={kpis.outstandingChecks} label="Outstanding evidence checks" context="Awaiting a reviewer decision" onClick={() => navigate('/review')} />
        <MetricCard icon={AlertTriangle} accent="bad" value={kpis.highRisk} label="High-risk suppliers" context="Not ready for a live package" onClick={() => navigate('/suppliers?risk=high')} />
        <MetricCard icon={ListTodo} accent="navy" value={kpis.openActions} label="Actions requiring attention" context={`Across ${nonReady} supplier assignments`} onClick={() => navigate('/packages?status=open')} />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <ReadinessChart stats={derived.packageStats} />
        <AttentionList items={derived.attention} />
      </div>

      <PriorityPackages stats={derived.packageStats} />

      <p className="mt-4 text-xs text-subtle">
        Figures are calculated from fictional demonstration records for Northstar Construction; they are not customer statistics.
      </p>
    </>
  );
}
