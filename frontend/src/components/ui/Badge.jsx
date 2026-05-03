import { cn } from '@/lib/cn';

const VARIANTS = {
  default: 'bg-secondary text-secondary-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  outline: 'border border-border text-foreground',
};

export default function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
