import { useState, type FormEvent } from 'react';
import { Info } from 'lucide-react';
import { TRADE_LABELS } from '../../lib/formatters';
import { useStore } from '../../lib/store';
import type { Supplier, TradeId } from '../../types';
import { Button } from '../ui/Button';
import { Field, Input, Select } from '../ui/Form';
import { Modal } from '../ui/Overlay';

const EMPTY = { company: '', contact: '', email: '', trade: '' as TradeId | '' };

export function InviteSupplierModal({ open, onClose, onInvited }: { open: boolean; onClose: () => void; onInvited: (s: Supplier) => void }) {
  const { suppliers, inviteSupplier } = useStore();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});

  const close = () => {
    setForm(EMPTY);
    setErrors({});
    onClose();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.company.trim()) next.company = 'Enter the company name.';
    else if (suppliers.some((s) => s.name.toLowerCase() === form.company.trim().toLowerCase())) next.company = 'This supplier is already in the register.';
    if (!form.contact.trim()) next.contact = 'Enter a contact name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (!form.trade) next.trade = 'Select the supplier trade.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const created = inviteSupplier({ company: form.company, contact: form.contact, email: form.email, trade: form.trade as TradeId });
    setForm(EMPTY);
    onInvited(created);
  };

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal
      open={open}
      onClose={close}
      title="Invite supplier"
      subtitle="The supplier builds one evidence passport that is reused across your packages."
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button variant="primary" type="submit" form="invite-form">Send invitation</Button>
        </>
      }
    >
      <form id="invite-form" onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Company name" htmlFor="inv-company" error={errors.company}>
          <Input id="inv-company" value={form.company} onChange={set('company')} invalid={!!errors.company} placeholder="e.g. Kestrel Electrical Ltd" autoFocus />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact name" htmlFor="inv-contact" error={errors.contact}>
            <Input id="inv-contact" value={form.contact} onChange={set('contact')} invalid={!!errors.contact} placeholder="Full name" />
          </Field>
          <Field label="Email" htmlFor="inv-email" error={errors.email}>
            <Input id="inv-email" type="email" value={form.email} onChange={set('email')} invalid={!!errors.email} placeholder="name@company.co.uk" />
          </Field>
        </div>
        <Field label="Trade" htmlFor="inv-trade" error={errors.trade} hint="Sets which requirement set the passport is built against.">
          <Select id="inv-trade" value={form.trade} onChange={set('trade')}>
            <option value="">Select a trade…</option>
            {Object.entries(TRADE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>
        <div className="flex gap-2.5 rounded-md border border-info/20 bg-info-bg px-3 py-2.5 text-xs text-[#36618A]">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          Demonstration flow — the supplier is added to this browser's register only. No email is sent.
        </div>
      </form>
    </Modal>
  );
}
