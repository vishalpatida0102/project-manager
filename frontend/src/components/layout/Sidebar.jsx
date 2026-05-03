import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Users,
  Settings,
  CheckCircle2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'My Tasks', icon: ListChecks },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ onClose }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <span className="text-base font-bold tracking-tight">Stride</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-accent"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <ul className="space-y-1">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                  )
                }
                end={item.to === '/dashboard'}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-border">
        <p className="text-sm font-semibold">Pro tip</p>
        <p className="text-xs text-muted-foreground mt-1">
          Drag tasks between columns to update status instantly.
        </p>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col border-r border-border bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border lg:hidden"
            >
              <SidebarContent onClose={onCloseMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
