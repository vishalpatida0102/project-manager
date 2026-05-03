import { cn } from '@/lib/cn';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
}

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
  xl: 'h-16 w-16 text-xl',
};

export default function Avatar({ name, color = '#6366f1', size = 'md', className, ring }) {
  return (
    <span
      title={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm select-none',
        SIZES[size],
        ring && 'ring-2 ring-background',
        className
      )}
      style={{ backgroundColor: color }}
    >
      {getInitials(name) || '?'}
    </span>
  );
}

export function AvatarStack({ users = [], max = 4, size = 'sm' }) {
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;
  return (
    <div className="flex items-center -space-x-2">
      {visible.map((u) => (
        <Avatar key={u._id || u.id} name={u.name} color={u.avatarColor} size={size} ring />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-background',
            SIZES[size]
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
