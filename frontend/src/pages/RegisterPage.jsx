import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, User, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input, { Label } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(form);
      toast.success(`Welcome to Stride, ${user.name.split(' ')[0]} 🎉`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const detail = err.details?.[0]?.message;
      toast.error(detail || err.message || 'Could not create your account');
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

      <h2 className="text-2xl font-bold tracking-tight">Create your workspace</h2>
      <p className="text-muted-foreground mt-1">The first user becomes the admin automatically.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              placeholder="Ada Lovelace"
              className="pl-9"
              value={form.name}
              onChange={onChange}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              className="pl-9"
              value={form.email}
              onChange={onChange}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="pl-9"
              value={form.password}
              onChange={onChange}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" loading={isLoading} size="lg">
          Create account <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground text-center">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
