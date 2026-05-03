import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';

export function Dropdown({ trigger, children, align = 'right', className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -2, scale: 0.99 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'absolute z-40 mt-2 min-w-[180px] rounded-md border border-border bg-card p-1 shadow-lg',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
            role="menu"
            onClick={() => setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ className, danger, children, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-left',
        'hover:bg-accent hover:text-accent-foreground',
        danger && 'text-destructive hover:bg-destructive/10 hover:text-destructive',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-border" />;
}
