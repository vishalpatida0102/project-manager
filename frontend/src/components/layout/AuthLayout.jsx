import { Outlet } from 'react-router-dom';
import { CheckCircle2, Sparkles, Users2, BarChart3 } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 text-white p-12 flex-col justify-between">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-black/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Stride</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
            Plan less.<br />Ship more.
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Stride is the calm command center your team has been waiting for —
            projects, tasks, and momentum, all in one place.
          </p>
          <ul className="space-y-3 text-white/90">
            <li className="flex items-center gap-3"><Sparkles className="h-5 w-5" /> Beautiful Kanban boards out of the box</li>
            <li className="flex items-center gap-3"><Users2 className="h-5 w-5" /> Role-based access for every teammate</li>
            <li className="flex items-center gap-3"><BarChart3 className="h-5 w-5" /> Real-time dashboards & activity feed</li>
          </ul>
        </div>

        <div className="relative z-10 text-sm text-white/70">
          © {new Date().getFullYear()} Stride. Crafted for high-performing teams.
        </div>
      </div>

      {/* Right — auth form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
