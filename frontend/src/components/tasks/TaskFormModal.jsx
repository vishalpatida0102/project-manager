import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import Input, { Label, Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const STATUSES = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];
const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

function toDateInput(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

export default function TaskFormModal({ open, onClose, onSaved, project, members = [], initial }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    dueDate: '',
  });
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        status: initial.status || 'todo',
        priority: initial.priority || 'medium',
        assignee: initial.assignee?._id || initial.assignee || '',
        dueDate: toDateInput(initial.dueDate),
      });
    } else {
      setForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee: '',
        dueDate: '',
      });
    }
  }, [open, initial]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assignee: form.assignee || null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      };
      const res = isEdit
        ? await api.put(`/tasks/${initial._id}`, payload)
        : await api.post('/tasks', { ...payload, project: project._id });
      toast.success(isEdit ? 'Task updated' : 'Task created');
      onSaved?.(res.task);
      onClose?.();
    } catch (err) {
      toast.error(err.message || 'Could not save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit task' : 'Create a task'}
      description={project ? `In ${project.name}` : ''}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="task-form" loading={saving}>
            {isEdit ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
            placeholder="Briefly describe the work"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="Add any helpful detail or context..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              id="priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              id="assignee"
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
