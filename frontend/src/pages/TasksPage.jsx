import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Filter, ListChecks, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { dueLabel, PRIORITY_LABEL, STATUS_LABEL } from '@/lib/format';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/cn';

const STATUS_TONE = {
  todo: 'default',
  in_progress: 'primary',
  completed: 'success',
};
const PRIORITY_DOT = { low: 'bg-emerald-500', medium: 'bg-amber-500', high: 'bg-rose-500' };

export default function TasksPage() {
  const user = useAuthStore((s) => s.user);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    mine: 'true',
    overdue: '',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ tasks: [], pagination: { total: 0, pages: 1 } });
  const [loading, setLoading] = useState(true);
  const [debounced, setDebounced] = useState(filters.search);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(filters.search), 250);
    return () => clearTimeout(t);
  }, [filters.search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (debounced) params.set('search', debounced);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.mine === 'true') params.set('mine', 'true');
    if (filters.overdue === 'true') params.set('overdue', 'true');
    params.set('page', page);
    params.set('limit', 12);

    api
      .get(`/tasks?${params.toString()}`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced, filters.status, filters.priority, filters.mine, filters.overdue, page]);

  const onDelete = async (task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      toast.success('Task deleted');
      setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t._id !== task._id) }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onStatusChange = async (task, status) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { status });
      setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t._id === task._id ? res.task : t)) }));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <p className="text-sm text-muted-foreground">
          Search and filter across every project you can access.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search title or description..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <Select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </Select>
          <Select value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)}>
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
          <Select value={filters.mine} onChange={(e) => setFilter('mine', e.target.value)}>
            <option value="true">Assigned to me</option>
            <option value="">All assignees</option>
          </Select>
          <div className="md:col-span-5 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={filters.overdue === 'true' ? 'destructive' : 'outline'}
              onClick={() => setFilter('overdue', filters.overdue === 'true' ? '' : 'true')}
            >
              <Filter className="h-3.5 w-3.5" />
              Overdue only
            </Button>
            <span className="text-xs text-muted-foreground ml-auto">
              {data.pagination?.total || 0} task{data.pagination?.total === 1 ? '' : 's'}
            </span>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : data.tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks match"
          description="Try clearing some filters, or assign yourself a task from a project board."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {data.tasks.map((task) => {
              const due = dueLabel(task.dueDate);
              const isAssignee = task.assignee?._id === user?.id;
              return (
                <li
                  key={task._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])}
                      title={PRIORITY_LABEL[task.priority]}
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/projects/${task.project._id}`}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {task.title}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        <span style={{ color: task.project.color }}>●</span> {task.project.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {due && <Badge variant={due.tone}>{due.text}</Badge>}
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          size="xs"
                          name={task.assignee.name}
                          color={task.assignee.avatarColor}
                        />
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {task.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                    {isAssignee || user?.role === 'admin' ? (
                      <Select
                        className="h-8 text-xs w-[140px]"
                        value={task.status}
                        onChange={(e) => onStatusChange(task, e.target.value)}
                      >
                        <option value="todo">To do</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                      </Select>
                    ) : (
                      <Badge variant={STATUS_TONE[task.status]}>{STATUS_LABEL[task.status]}</Badge>
                    )}
                    {(user?.role === 'admin' || task.createdBy?._id === user?.id) && (
                      <button
                        type="button"
                        onClick={() => onDelete(task)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* Pagination */}
      {data.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.pages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
