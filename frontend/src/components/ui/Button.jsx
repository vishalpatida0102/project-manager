import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const VARIANTS = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline:
    'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm shadow-destructive/20',
  link: 'text-primary underline-offset-4 hover:underline',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
  icon: 'h-9 w-9',
};

const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', loading, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {children}
    </button>
  );
});

export default Button;
