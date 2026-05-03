import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Search, FolderKanban, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import api from '@/lib/api';
import useAsync from '@/hooks/useAsync';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { AvatarStack } from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/Dropdown';
import ProjectFormModal from '@/components/projects/ProjectFormModal';
import { useAuthStore } from '@/store/auth';

export default function ProjectsPage() {
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data, loading, refetch } = useAsync(() => api.get('/projects'), []);

  const projects = data?.projects || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
    );
  }, [projects, search]);

  useEffect(() => {
    if (!open) setEditing(null);
  }, [open]);

  const onDelete = async (project) => {
    if (!confirm(`Delete "${project.name}"? This will remove all its tasks.`)) return;
    try {
      await api.delete(`/projects/${project._id}`);
      toast.success('Project deleted');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onEdit = (project) => {
    setEditing(project);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground">
            All the projects you have access to.
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New project
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={projects.length ? 'No matches' : 'No projects yet'}
          description={
            projects.length
              ? 'Try a different search term.'
              : user?.role === 'admin'
              ? 'Create your first project to organize tasks for your team.'
              : "You haven't been added to any projects yet — ask an admin to invite you."
          }
          action={
            user?.role === 'admin' && (
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> Create project
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => {
            const total = (p.stats?.todo || 0) + (p.stats?.in_progress || 0) + (p.stats?.completed || 0);
            const completed = p.stats?.completed || 0;
            const pct = total ? Math.round((completed / total) * 100) : 0;
            const canManage = user?.role === 'admin' || p.owner?._id === user?.id;
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <Card className="group relative overflow-hidden hover:shadow-md hover:border-primary/40 transition-all">
                  <div className="h-1.5 w-full" style={{ background: p.color }} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/projects/${p._id}`} className="min-w-0 flex-1">
                        <h3 className="font-semibold tracking-tight truncate group-hover:text-primary transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[2.5rem]">
                          {p.description || 'No description provided.'}
                        </p>
                      </Link>
                      {canManage && (
                        <Dropdown
                          trigger={
                            <span className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
                              <MoreHorizontal className="h-4 w-4" />
                            </span>
                          }
                        >
                          <DropdownItem onClick={() => onEdit(p)}>
                            <Edit3 className="h-4 w-4" /> Edit
                          </DropdownItem>
                          <DropdownDivider />
                          <DropdownItem danger onClick={() => onDelete(p)}>
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownItem>
                        </Dropdown>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs">
                      <Badge variant="default">{total} tasks</Badge>
                      <Badge variant="success">{completed} done</Badge>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Progress</span>
                        <span className="font-medium text-foreground">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: p.color }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <AvatarStack
                        users={[p.owner, ...(p.members || []).filter((m) => m._id !== p.owner?._id)].filter(Boolean)}
                        max={4}
                        size="sm"
                      />
                      <Link
                        to={`/projects/${p._id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Open →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <ProjectFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => refetch()}
        initial={editing}
      />
    </div>
  );
}
