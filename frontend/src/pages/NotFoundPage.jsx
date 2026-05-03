import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist or was moved.
        </p>
        <Link to="/dashboard" className="mt-6 inline-block">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
