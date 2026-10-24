import { CheckCircle2, Download, ListChecks } from 'lucide-react';
import { formatDate } from '../../lib/formatters';
import type { Assessment, CorrectiveAction } from '../../types';
import { PriorityBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardHeader, EmptyState, TableWrap } from '../ui/Card';

export function ActionsTable({ actions, supplierName }: { actions: CorrectiveAction[]; supplierName?: (id: string) => string }) {
  return (
    <TableWrap>
      <table className="w-full min-w-[720px]">
        <thead className="border-b border-line-soft">
          <tr>
            {supplierName && <th className="th pl-5">Supplier</th>}
            <th className={`th w-[34%] ${supplierName ? '' : 'pl-5'}`}>Issue</th>
            <th className="th">Priority</th>
            <th className="th w-[38%]">Recommended action</th>
            <th className="th pr-5">Due</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {actions.map((a) => (
            <tr key={a.id} className="align-top">
              {supplierName && <td className="td whitespace-nowrap pl-5 text-[13px] text-ink">{supplierName(a.supplierId)}</td>}
              <td className={`td text-[13px] font-medium text-ink ${supplierName ? '' : 'pl-5'}`}>{a.issue}</td>
              <td className="td"><PriorityBadge priority={a.priority} /></td>
              <td className="td text-[13px] text-muted">{a.recommendation}</td>
              <td className="td tnum whitespace-nowrap pr-5 text-[13px] text-ink">{formatDate(a.due)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

export function CorrectiveActions({ assessment, onExport }: { assessment: Assessment | null; onExport: () => void }) {
  return (
    <Card>
      <CardHeader
        title="Actions before mobilisation"
        subtitle={assessment ? `${assessment.actions.length} action${assessment.actions.length === 1 ? '' : 's'} generated from this assessment` : 'Generated from the assessment results'}
        actions={assessment && <Button size="sm" icon={Download} onClick={onExport}>Export audit record</Button>}
      />
      {!assessment ? (
        <EmptyState icon={ListChecks} title="Actions appear after a check" description="Every requirement that is not satisfied produces a corrective action with a priority and due date." />
      ) : assessment.actions.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="No actions required" description="Every requirement is satisfied for this assessment window." />
      ) : (
        <ActionsTable actions={assessment.actions} />
      )}
    </Card>
  );
}
