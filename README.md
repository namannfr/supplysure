# SupplySure — MVP prototype

Frontend-only prototype of SupplySure: know which suppliers are ready for every package before mobilisation.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run check:data # prints the figures the demo dataset produces
```

## How it fits together

- `src/data/demoData.ts` — the one demonstration dataset: requirements, versioned requirement sets, 42 suppliers,
  6 packages, and the evidence passports (generated deterministically, plus the explicit exceptions that tell the story).
- `src/lib/readinessEngine.ts` — the deterministic rules engine. It evaluates evidence metadata for a mobilisation → finish
  window: missing, expired, expiring during the package, scope mismatch, cover below minimum, pending review, correction requested.
- `src/lib/derive.ts` — every dashboard, supplier and package figure, calculated from the engine. Nothing is typed in.
- `src/lib/store.tsx` — React state for invites, review decisions, audit packs and the latest check, saved to `localStorage`.
  Use **Profile menu → Reset demonstration data** to restore the original story.
- `src/lib/reports.ts` — printable HTML audit records (downloaded in the browser).

The demo date is fixed to 24 October 2026 (`DEMO_TODAY` in `src/lib/formatters.ts`), so the story stays the same every time.

## Suggested demo path

1. Dashboard → click **Nova Fire Protection** in *Requires attention*: the readiness check opens with a *Not ready* verdict.
2. Switch to Apex Electrical / Riverside, then move the finish date before 14 Jan 2027 (*Ready*) or the mobilisation date after it (*Not ready*).
3. **Save as audit pack**, then download it from Audit Packs.
4. Review Queue → approve Horizon's IR35 determination: Southbank Offices becomes 100% ready and the dashboard recalculates.

All companies, people and documents are fictional. SupplySure supports buyer decisions; it does not certify or approve subcontractors.
