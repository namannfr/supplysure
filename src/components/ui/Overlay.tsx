import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function useOutsideClick(ref: RefObject<HTMLElement>, onOutside: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onOutside();
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', key);
    };
  }, [ref, onOutside, active]);
}

function useEscape(onClose: () => void) {
  const cb = useRef(onClose);
  cb.current = onClose;
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && cb.current();
    document.addEventListener('keydown', key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', key);
      document.body.style.overflow = prev;
    };
  }, []);
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal(props: ModalProps) {
  if (!props.open) return null;
  return <ModalInner {...props} />;
}

function ModalInner({ onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  useEscape(onClose);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => panel.current?.focus(), []);
  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-deep/40 p-4 pt-[6vh] animate-fade-in" onMouseDown={onClose}>
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={`w-full ${width} rounded-lg border border-line bg-white shadow-pop outline-none animate-pop-in`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line-soft px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {subtitle && <div className="mt-0.5 text-[13px] text-muted">{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 rounded-md p-1 text-muted hover:bg-canvas hover:text-ink">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto px-5 py-4 scroll-thin">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 rounded-b-lg border-t border-line-soft bg-canvas/60 px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  headerExtra?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function Drawer(props: DrawerProps) {
  if (!props.open) return null;
  return <DrawerInner {...props} />;
}

function DrawerInner({ onClose, title, subtitle, headerExtra, children, footer }: DrawerProps) {
  useEscape(onClose);
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-navy-deep/30 animate-fade-in" onMouseDown={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        className="flex h-full w-full max-w-[660px] flex-col border-l border-line bg-white shadow-pop animate-slide-in"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-line-soft px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">{title}{subtitle && <div className="mt-0.5 text-[13px] text-muted">{subtitle}</div>}</div>
            <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 rounded-md p-1 text-muted hover:bg-canvas hover:text-ink">
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
          {headerExtra && <div className="mt-4">{headerExtra}</div>}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 scroll-thin">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line-soft bg-canvas/60 px-6 py-3">{footer}</div>}
      </aside>
    </div>,
    document.body,
  );
}
