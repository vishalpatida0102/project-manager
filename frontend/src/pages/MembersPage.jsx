import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Shield, ShieldCheck, Users, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import useAsync from '@/hooks/useAsync';
import { Card } from '@/components/ui/Card';
import Input, { Select } from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/auth';
import { fmtDate } from '@/lib/format';

export default function MembersPage() {
  const me = useAuthStore((s) => s.user);
  const { data, loading, refetch } = useAsync(() => api.get('/users'), []);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const users = data?.users || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, roleFilter]);

  const onChangeRole = async (user, role) => {
    try {
      await api.patch(`/users/${user._id}/role`, { role });
      toast.success(`${user.name} is now ${role}`);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onRemove = async (user) => {
    if (!confirm(`Remove ${user.name}? Their tasks will become unassigned.`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      toast.success('User removed');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Members</h2>
        <p className="text-sm text-muted-foreground">Everyone with access to this workspace.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="sm:w-44"
        >
          <option value="">All roles</option>
          <option value="admin">Admins</option>
          <option value="member">Members</option>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No members" description="Try clearing your filters." />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {filtered.map((u) => (
              <li key={u._id} className="flex items-center gap-4 p-4">
                <Avatar name={u.name} color={u.avatarColor} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {u.name}{' '}
                    {u._id === me?.id && (
                      <span className="text-xs font-normal text-muted-foreground">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  {u.title && <p className="text-xs text-muted-foreground mt-0.5">{u.title}</p>}
                </div>
                <Badge variant={u.role === 'admin' ? 'primary' : 'default'} className="capitalize">
                  {u.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                  {u.role}
                </Badge>
                <span className="hidden sm:inline text-xs text-muted-foreground">
                  Joined {fmtDate(u.createdAt)}
                </span>
                {me?.role === 'admin' && u._id !== me?.id && (
                  <div className="flex items-center gap-2">
                    <Select
                      className="h-8 w-32 text-xs"
                      value={u.role}
                      onChange={(e) => onChangeRole(u, e.target.value)}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </Select>
                    <button
                      type="button"
                      onClick={() => onRemove(u)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
