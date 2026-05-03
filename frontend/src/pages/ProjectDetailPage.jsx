import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Plus,
  Settings as SettingsIcon,
  Trash2,
  Edit3,
  MoreHorizontal,
  Search,
} from 'lucide-react';
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
import TaskCard from '@/components/tasks/TaskCard';
import TaskFormModal from '@/components/tasks/TaskFormModal';
import ProjectFormModal from '@/components/projects/ProjectFormModal';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/cn';

const COLUMNS = [
  { id: 'todo', label: 'To do', tone: 'bg-slate-400' },
  { id: 'in_progress', label: 'In progress', tone: 'bg-indigo-500' },
  { id: 'completed', label: 'Completed', tone: 'bg-emerald-500' },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editProjectOpen, setEditProjectOpen] = useState(false);

  const { data: pData, loading, refetch } = useAsync(() => api.get(`/projects/${id}`), [id]);
  const project = pData?.project;

  const { data: tData, refetch: refetchTasks } = useAsync(
    () => api.get(`/tasks?project=${id}&limit=100&sort=order`),
    [id]
  );

  useEffect(() => {
    if (tData?.tasks) setTasks(tData.tasks);
  }, [tData]);

  const canManage = user?.role === 'admin' || project?.owner?._id === user?.id;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
    );
  }, [tasks, search]);

  const grouped = useMemo(() => {
    const map = { todo: [], in_progress: [], completed: [] };
    filtered.forEach((t) => map[t.status]?.push(t));
    Object.keys(map).forEach((k) => map[k].sort((a, b) => (a.order || 0) - (b.order || 0)));
    return map;
  }, [filtered]);

  const onCreateTask = () => {
    setEditingTask(null);
    setTaskOpen(true);
  };

  const onEditTask = (task) => {
    setEditingTask(task);
    setTaskOpen(true);
  };

  const onDeleteTask = async (task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      toast.success('Task deleted');
      refetchTasks();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onDeleteProject = async () => {
    if (!confirm(`Delete project "${project.name}"? This will remove all tasks.`)) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newGrouped = {
      todo: [...grouped.todo],
      in_progress: [...grouped.in_progress],
      completed: [...grouped.completed],
    };
    const sourceList = newGrouped[source.droppableId];
    const destList = newGrouped[destination.droppableId];
    const moved = sourceList.find((t) => t._id === draggableId);
    if (!moved) return;
    sourceList.splice(source.index, 1);
    moved.status = destination.droppableId;
    destList.splice(destination.index, 0, moved);

    // Optimistic update
    const next = [...newGrouped.todo, ...newGrouped.in_progress, ...newGrouped.completed].map(
      (t, i, arr) => {
        const sameStatus = arr.filter((x) => x.status === t.status);
        const order = sameStatus.indexOf(t);
        return { ...t, order };
      }
    );
    setTasks(next);

    const items = ['todo', 'in_progress', 'completed'].flatMap((col) =>
      newGrouped[col].map((t, idx) => ({ id: t._id, status: col, order: idx }))
    );

    try {
      await api.patch('/tasks/reorder', { project: id, items });
    } catch (err) {
      toast.error('Failed to update — refreshing');
      refetchTasks();
    }
  };

  if (loading || !project) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((c) => (
            <Skeleton key={c.id} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All projects
        </Link>
      </div>

      <Card>
        <div className="h-1.5" style={{ background: project.color }} />
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ background: project.color }}
                />
                <h2 className="text-2xl font-bold tracking-tight truncate">{project.name}</h2>
                {project.archived && <Badge variant="outline">Archived</Badge>}
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{project.description}</p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <AvatarStack
                  users={[project.owner, ...(project.members || [])].filter(Boolean)}
                  max={6}
                  size="sm"
                />
                <span className="text-xs text-muted-foreground">
                  {1 + (project.members?.length || 0)} member
                  {project.members?.length === 0 ? '' : 's'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={onCreateTask}>
                <Plus className="h-4 w-4" /> New task
              </Button>
              {canManage && (
                <Dropdown
                  trigger={
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-accent">
                      <MoreHorizontal className="h-4 w-4" />
                    </span>
                  }
                >
                  <DropdownItem onClick={() => setEditProjectOpen(true)}>
                    <SettingsIcon className="h-4 w-4" /> Project settings
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem danger onClick={onDeleteProject}>
                    <Trash2 className="h-4 w-4" /> Delete project
                  </DropdownItem>
                </Dropdown>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter tasks in this board..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Tasks added here will appear in your Kanban board. Drag between columns to update status."
          action={
            <Button onClick={onCreateTask}>
              <Plus className="h-4 w-4" /> Create the first task
            </Button>
          }
        />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((col) => (
              <Column
                key={col.id}
                column={col}
                tasks={grouped[col.id]}
                onCardClick={onEditTask}
                onDeleteCard={onDeleteTask}
                canDelete={canManage}
                onAdd={onCreateTask}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      <TaskFormModal
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        onSaved={() => refetchTasks()}
        project={project}
        members={[project.owner, ...(project.members || [])].filter(Boolean)}
        initial={editingTask}
      />

      <ProjectFormModal
        open={editProjectOpen}
        onClose={() => setEditProjectOpen(false)}
        onSaved={() => refetch()}
        initial={project}
      />
    </div>
  );
}

function Column({ column, tasks, onCardClick, onDeleteCard, canDelete, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-xl border border-border bg-card/40"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', column.tone)} />
          <h3 className="text-sm font-semibold">{column.label}</h3>
          <Badge variant="default">{tasks.length}</Badge>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Add task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-3 space-y-2.5 min-h-[120px] transition-colors',
              snapshot.isDraggingOver && 'bg-primary/5'
            )}
          >
            {tasks.map((task, idx) => (
              <Draggable key={task._id} draggableId={task._id} index={idx}>
                {(prov, snap) => (
                  <div
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    {...prov.dragHandleProps}
                    className="relative group"
                  >
                    <TaskCard
                      task={task}
                      isDragging={snap.isDragging}
                      onClick={() => onCardClick(task)}
                    />
                    {canDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCard(task);
                        }}
                        className="absolute top-2 right-2 hidden group-hover:inline-flex items-center justify-center h-6 w-6 rounded-md bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive"
                        aria-label="Delete task"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {tasks.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-6">
                Drop tasks here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </motion.div>
  );
}
