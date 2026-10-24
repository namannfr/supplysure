const STEPS = [
  { n: '01', title: 'Select a package', body: 'Use a reusable requirement set.' },
  { n: '02', title: 'Match verified evidence', body: 'Every value links to its source.' },
  { n: '03', title: 'Record readiness', body: 'Verdict is calculated for a date.' },
];

export function WorkflowStrip() {
  return (
    <ol className="mb-6 grid overflow-hidden rounded-lg border border-brand-100 bg-brand-50/70 sm:grid-cols-3">
      {STEPS.map((s, i) => (
        <li key={s.n} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-brand-100 sm:border-l sm:border-t-0' : ''}`}>
          <span className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-white text-2xs font-semibold text-brand-dark">{s.n}</span>
          <div className="min-w-0 leading-tight">
            <div className="text-[13px] font-medium text-ink">{s.title}</div>
            <div className="mt-0.5 text-xs text-muted">{s.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
