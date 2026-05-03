import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, Settings as SettingsIcon, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import Avatar from '@/components/ui/Avatar';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/Dropdown';
import Badge from '@/components/ui/Badge';

export default function Topbar({ onOpenMobile }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);

  if (!user) return null;

  const onLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <h1 className="text-sm font-medium text-muted-foreground">
            Welcome back, <span className="text-foreground font-semibold">{user.name.split(' ')[0]}</span>
          </h1>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <Dropdown
          trigger={
            <div className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-accent transition-colors">
              <Avatar name={user.name} color={user.avatarColor} size="sm" />
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-semibold">{user.name}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{user.role}</span>
              </div>
            </div>
          }
        >
          <div className="px-3 py-2">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <Badge variant={user.role === 'admin' ? 'primary' : 'default'} className="mt-1.5 capitalize">
              {user.role}
            </Badge>
          </div>
          <DropdownDivider />
          <DropdownItem onClick={() => navigate('/settings')}>
            <UserIcon className="h-4 w-4" /> Profile
          </DropdownItem>
          <DropdownItem onClick={() => navigate('/settings')}>
            <SettingsIcon className="h-4 w-4" /> Settings
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem danger onClick={onLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
