// Prints the figures the demo dataset produces, so the story can be verified without a browser.
import { SEED_EVIDENCE, SUPPLIERS } from '../src/data/demoData';
import { deriveAll } from '../src/lib/derive';

const d = deriveAll(SUPPLIERS, SEED_EVIDENCE);
console.log('KPIs', d.kpis);
for (const p of d.packageStats) console.log(p.pkg.name.padEnd(22), `${p.ready}/${p.action}/${p.notReady}`, `${p.readiness}%`, 'actions', p.openActions);
console.log('High risk:', d.supplierStats.filter((s) => s.risk === 'high').map((s) => s.supplier.name).join(', '));
console.log('Incomplete:', d.supplierStats.filter((s) => !s.passportComplete).map((s) => s.supplier.id).join(' '));
console.log('Attention (top 6):');
for (const a of d.attention.slice(0, 6)) console.log(' ', a.due, a.severity.padEnd(8), a.title, '—', a.issue);
