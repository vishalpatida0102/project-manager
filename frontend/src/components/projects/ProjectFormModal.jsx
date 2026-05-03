import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import Input, { Label, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#10b981', '#ec4899'];

export default function ProjectFormModal({ open, onClose, onSaved, initial }) {
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0], members: [] });
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial);

  useEffect(() => {
    if (!open) return;
    api.get('/users').then((d) => setUsers(d.users || [])).catch(() => {});
    if (initial) {
      setForm({
        name: initial.name || '',
        description: initial.description || '',
        color: initial.color || COLORS[0],
        members: (initial.members || []).map((m) => m._id || m),
      });
    } else {
      setForm({ name: '', description: '', color: COLORS[0], members: [] });
    }
  }, [open, initial]);

  const toggleMember = (id) => {
    setForm((f) => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter((m) => m !== id) : [...f.members, id],
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      const res = isEdit
        ? await api.put(`/projects/${initial._id}`, payload)
        : await api.post('/projects', payload);
      toast.success(isEdit ? 'Project updated' : 'Project created');
      onSaved?.(res.project);
      onClose?.();
    } catch (err) {
      toast.error(err.message || 'Could not save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit project' : 'Create a new project'}
      description="Set up a workspace for your team to collaborate in."
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="project-form" loading={saving}>
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Project name</Label>
          <Input
            id="name"
            required
            placeholder="e.g. Website Relaunch"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="What is this project about?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition ${
                  form.color === c ? 'ring-foreground/40' : 'ring-transparent hover:ring-foreground/20'
                }`}
                style={{ background: c }}
                aria-label={`Pick ${c}`}
              />
            ))}
          </div>
        </div>
        <div>
          <Label>Members</Label>
          <div className="rounded-md border border-border max-h-52 overflow-y-auto scrollbar-thin">
            {users.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground">No teammates yet.</p>
            )}
            {users.map((u) => {
              const checked = form.members.includes(u._id);
              return (
                <label
                  key={u._id}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/60"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-primary"
                    checked={checked}
                    onChange={() => toggleMember(u._id)}
                  />
                  <Avatar name={u.name} color={u.avatarColor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{u.role}</span>
                </label>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
