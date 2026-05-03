import { useState } from 'react';
import toast from 'react-hot-toast';
import { Sun, Moon } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Input, { Label } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import { cn } from '@/lib/cn';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#10b981', '#ec4899'];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    title: user?.title || '',
    avatarColor: user?.avatarColor || COLORS[0],
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { user: updated } = await api.patch('/auth/me', profile);
      setUser({ ...user, ...updated });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPw(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your name, title, and avatar color.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={profile.name} color={profile.avatarColor} size="xl" />
              <div className="flex-1">
                <Label>Avatar color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setProfile({ ...profile, avatarColor: c })}
                      className={cn(
                        'h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition',
                        profile.avatarColor === c ? 'ring-foreground/40' : 'ring-transparent hover:ring-foreground/20'
                      )}
                      style={{ background: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Engineering Lead"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Email (read only)</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <Button type="submit" loading={savingProfile}>
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how Stride looks for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button
              variant={theme === 'light' ? 'primary' : 'outline'}
              onClick={() => setTheme('light')}
            >
              <Sun className="h-4 w-4" /> Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'primary' : 'outline'}
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-4 w-4" /> Dark
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>We recommend a unique password of at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onChangePassword} className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="cp">Current password</Label>
              <Input
                id="cp"
                type="password"
                required
                value={pw.currentPassword}
                onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="np">New password</Label>
              <Input
                id="np"
                type="password"
                required
                minLength={6}
                value={pw.newPassword}
                onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                type="password"
                required
                minLength={6}
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              />
            </div>
            <Button type="submit" loading={savingPw}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
