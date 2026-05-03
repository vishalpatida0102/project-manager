import { Calendar, MessageSquareText } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { dueLabel, PRIORITY_LABEL } from '@/lib/format';
import { cn } from '@/lib/cn';

const PRIORITY_TONE = { low: 'bg-emerald-500', medium: 'bg-amber-500', high: 'bg-rose-500' };

export default function TaskCard({ task, isDragging, onClick }) {
  const due = dueLabel(task.dueDate);
  return (
    <div
      onClick={onClick}
      className={cn(
        'group rounded-lg border border-border bg-card p-3 shadow-sm cursor-pointer',
        'hover:border-primary/40 hover:shadow-md transition-all',
        isDragging && 'rotate-1 shadow-lg ring-2 ring-primary/30'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('h-1.5 w-6 rounded-full', PRIORITY_TONE[task.priority])} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {PRIORITY_LABEL[task.priority]}
        </span>
      </div>
      <p className="text-sm font-medium leading-snug">{task.title}</p>
      {task.description && (
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 flex items-start gap-1.5">
          <MessageSquareText className="h-3 w-3 mt-0.5 shrink-0" />
          <span>{task.description}</span>
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        {task.assignee ? (
          <Avatar size="xs" name={task.assignee.name} color={task.assignee.avatarColor} />
        ) : (
          <span className="text-[10px] text-muted-foreground">Unassigned</span>
        )}
        {due && (
          <Badge variant={due.tone} className="gap-1 text-[10px]">
            <Calendar className="h-3 w-3" /> {due.text}
          </Badge>
        )}
      </div>
    </div>
  );
}
