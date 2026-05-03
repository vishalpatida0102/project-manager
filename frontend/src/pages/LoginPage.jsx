import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input, { Label } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.name.split(' ')[0]} 👋`);
      const dest = location.state?.from?.pathname || '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Could not sign you in');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="lg:hidden mb-8 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <span className="text-base font-bold tracking-tight">Stride</span>
      </div>

      <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
      <p className="text-muted-foreground mt-1">Sign in to continue to your workspace.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" loading={isLoading} size="lg">
          Sign in <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground text-center">
        New to Stride?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground space-y-1">
        <p>
          <strong className="font-medium text-foreground">Admin demo:</strong>{' '}
          <code className="font-mono">admin@stride.app</code> /{' '}
          <code className="font-mono">Admin@Stride2026</code>
        </p>
      </div>
    </motion.div>
  );
}
