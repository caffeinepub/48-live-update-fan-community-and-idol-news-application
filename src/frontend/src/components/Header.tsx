import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from './ui/button';
import { Menu, X, User, LogOut, Shield, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { label: 'Beranda', path: '/' },
    { label: '48 LIVE UPDATE', path: '/news' },
    { label: '48 LIVE RUMOR', path: '/rumors' },
    { label: '48 LIVE DISCUSS', path: '/discuss' },
    { label: 'Groups', path: '/groups' },
  ];

  const currentPath = routerState.location.pathname;

  return (
    <header className="sticky top-0 z-50 w-full glass-strong border-b transition-smooth">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-3 transition-smooth hover:opacity-80"
          >
            <img 
              src="/assets/generated/app-logo-futuristic.dim_200x200.png" 
              alt="48 LIVE UPDATE" 
              className="h-10 w-10 animate-glow-pulse" 
            />
            <span className="text-xl font-bold neon-text bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              48 LIVE UPDATE
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path })}
                className={`text-sm font-medium transition-smooth hover:text-primary relative group ${
                  currentPath === item.path ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
                {currentPath === item.path && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary rounded-full" />
                )}
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary rounded-full opacity-0 group-hover:opacity-100 transition-smooth" />
              </button>
            ))}
          </nav>

          {/* Desktop Auth & Theme Toggle */}
          <div className="hidden items-center gap-3 md:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full transition-glow hover:neon-glow"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {isAuthenticated && userProfile && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">{userProfile.name}</span>
              </div>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/admin' })}
                className="gap-2 glass border-primary/30 hover:neon-glow-hover transition-glow"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}
            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              className={`gap-2 transition-glow ${
                isAuthenticated 
                  ? 'glass border-border hover:border-primary/50' 
                  : 'gradient-primary hover:neon-glow-hover'
              }`}
            >
              {isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Keluar
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/50 py-4 md:hidden glass-strong">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate({ to: item.path });
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-sm font-medium transition-smooth hover:text-primary ${
                    currentPath === item.path ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => {
                    navigate({ to: '/admin' });
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-left text-sm font-medium text-muted-foreground transition-smooth hover:text-primary"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </button>
              )}
              <div className="flex flex-col gap-2 border-t border-border/50 pt-4">
                {isAuthenticated && userProfile && (
                  <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg glass">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{userProfile.name}</span>
                  </div>
                )}
                <Button
                  onClick={handleAuth}
                  disabled={disabled}
                  variant={isAuthenticated ? 'outline' : 'default'}
                  size="sm"
                  className={`w-full gap-2 transition-glow ${
                    isAuthenticated 
                      ? 'glass border-border' 
                      : 'gradient-primary hover:neon-glow-hover'
                  }`}
                >
                  {isAuthenticated ? (
                    <>
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </>
                  ) : (
                    'Masuk'
                  )}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

