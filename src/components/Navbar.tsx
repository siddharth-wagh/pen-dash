import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Scribe's Eye
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                isHome
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              )}
            >
              <Home className="h-4 w-4" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
