import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  ListChecks,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  FolderKanban,
} from 'lucide-react';
import api from '@/lib/api';
import useAsync from '@/hooks/useAsync';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { dueLabel, fmtRelative, PRIORITY_LABEL, STATUS_LABEL } from '@/lib/format';
import { cn } from '@/lib/cn';

const PRIORITY_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
const STATUS_COLOR = { todo: '#94a3b8', in_progress: '#6366f1', completed: '#22c55e' };

function StatCard({ icon: Icon, label, value, hint, tone = 'primary', delay = 0 }) {
  const tones = {
    primary: 'from-indigo-500/15 to-violet-500/5 text-primary',
    success: 'from-emerald-500/15 to-emerald-500/5 text-success',
    warning: 'from-amber-500/15 to-amber-500/5 text-warning',
    destructive: 'from-rose-500/15 to-rose-500/5 text-destructive',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className={cn('relative overflow-hidden bg-gradient-to-br', tones[tone])}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold tracking-tight mt-1 text-foreground">{value}</p>
              {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
            </div>
            <div className={cn('grid h-11 w-11 place-items-center rounded-xl bg-card shadow-sm', tones[tone])}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { weekday: 'short' })}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            fontSize: 12,
          }}
          labelFormatter={(d) => new Date(d).toLocaleDateString()}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          fill="url(#trend)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function DistributionChart({ data }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={88}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v, name) => [`${v} task${v === 1 ? '' : 's'}`, name]}
        />
        <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs">{v}</span>} />
        {/* Center label */}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground" style={{ fontSize: 24, fontWeight: 700 }}>
          {total}
        </text>
        <text x="50%" y="50%" dy={20} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>
          total
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function DashboardPage() {
  const { data, loading } = useAsync(() => api.get('/dashboard'), []);
  const { data: actData } = useAsync(() => api.get('/dashboard/activity'), []);

  const summary = data?.summary;

  const statusData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: STATUS_LABEL.todo, value: summary.totals.todo, color: STATUS_COLOR.todo },
      { name: STATUS_LABEL.in_progress, value: summary.totals.inProgress, color: STATUS_COLOR.in_progress },
      { name: STATUS_LABEL.completed, value: summary.totals.completed, color: STATUS_COLOR.completed },
    ].filter((d) => d.value > 0);
  }, [summary]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm">Your team's progress at a glance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ListChecks}
          label="Total tasks"
          value={summary.totals.tasks}
          hint={`Across ${summary.totals.projects} project${summary.totals.projects === 1 ? '' : 's'}`}
          tone="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={summary.totals.completed}
          hint={`${summary.totals.completedThisWeek} this week`}
          tone="success"
          delay={0.05}
        />
        <StatCard
          icon={Clock}
          label="In progress"
          value={summary.totals.inProgress}
          hint={`${summary.totals.todo} waiting in todo`}
          tone="warning"
          delay={0.1}
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={summary.totals.overdue}
          hint="Past due date, not completed"
          tone="destructive"
          delay={0.15}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Completed last 7 days
                </CardTitle>
                <CardDescription>Daily completion velocity</CardDescription>
              </div>
              <Badge variant="success">+{summary.totals.completedThisWeek}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <TrendChart data={summary.trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task distribution</CardTitle>
            <CardDescription>By current status</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length ? (
              <DistributionChart data={statusData} />
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">No tasks yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming this week</CardTitle>
            <CardDescription>Tasks with due dates in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Nothing on the horizon. Enjoy the calm. ☕️
              </p>
            )}
            {summary.upcoming.map((task) => {
              const due = dueLabel(task.dueDate);
              return (
                <Link
                  key={task._id}
                  to={`/projects/${task.project._id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 hover:bg-accent hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: task.project.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.project.name} · {PRIORITY_LABEL[task.priority]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {task.assignee && (
                      <Avatar
                        size="sm"
                        name={task.assignee.name}
                        color={task.assignee.avatarColor}
                      />
                    )}
                    {due && <Badge variant={due.tone}>{due.text}</Badge>}
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Recent activity
            </CardTitle>
            <CardDescription>Latest team updates</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={actData?.activities || []} />
          </CardContent>
        </Card>
      </div>

      {/* My Tasks shortcut */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your open tasks</CardTitle>
              <CardDescription>Items assigned to you that aren't done yet</CardDescription>
            </div>
            <Link to="/tasks" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {summary.myTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No tasks assigned. Time to ship something new!
            </p>
          ) : (
            summary.myTasks.map((task) => {
              const due = dueLabel(task.dueDate);
              return (
                <div key={task._id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <FolderKanban className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.project.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: PRIORITY_COLOR[task.priority] }}
                      title={PRIORITY_LABEL[task.priority]}
                    />
                    {due && <Badge variant={due.tone}>{due.text}</Badge>}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityFeed({ items }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No activity yet — get the team rolling!
      </p>
    );
  }
  return (
    <ol className="relative pl-5 space-y-4 max-h-[280px] overflow-y-auto scrollbar-thin">
      <span className="absolute left-2 top-1.5 bottom-1 w-px bg-border" aria-hidden />
      {items.map((a) => (
        <li key={a._id} className="relative">
          <span
            className="absolute -left-[14px] top-1 h-3 w-3 rounded-full ring-2 ring-background"
            style={{ background: a.project?.color || '#6366f1' }}
          />
          <div className="flex items-start gap-3">
            <Avatar size="xs" name={a.actor?.name} color={a.actor?.avatarColor} />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                <span className="font-medium">{a.actor?.name}</span>{' '}
                <span className="text-muted-foreground">{describeAction(a)}</span>
                {a.project?.name && (
                  <span className="text-foreground"> · {a.project.name}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {fmtRelative(a.createdAt)}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function describeAction(a) {
  switch (a.action) {
    case 'project.created':
      return 'created a project';
    case 'project.updated':
      return 'updated a project';
    case 'project.deleted':
      return 'deleted a project';
    case 'project.member_added':
      return `added ${a.target?.name || 'a member'}`;
    case 'project.member_removed':
      return `removed ${a.target?.name || 'a member'}`;
    case 'task.created':
      return `created task "${a.meta?.title || ''}"`;
    case 'task.status_changed':
      return `moved "${a.meta?.title || ''}" to ${(a.meta?.to || '').replace('_', ' ')}`;
    case 'task.assigned':
      return `assigned task to ${a.target?.name || 'someone'}`;
    case 'task.deleted':
      return `deleted task "${a.meta?.title || ''}"`;
    case 'task.updated':
      return `updated task "${a.meta?.title || ''}"`;
    case 'user.registered':
      return 'joined the workspace';
    default:
      return a.action;
  }
}
