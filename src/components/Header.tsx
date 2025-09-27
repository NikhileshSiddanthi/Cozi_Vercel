import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SearchBar } from '@/components/SearchBar';
import { NotificationBell } from '@/components/NotificationBell';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Updated navigation items as per the new "ConnectSphere" design
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
    { label: 'Groups', path: '/groups' },
    { label: 'Events/Discussions', path: '/discussions' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50" role="navigation">
      <div className="container mx-auto flex items-center justify-between h-full px-4">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="font-bold text-xl text-primary hover:bg-secondary px-2"
            aria-label="ConnectSphere Home"
          >
            ConnectSphere
          </Button>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={isActive(item.path) ? 'secondary' : 'ghost'}
              onClick={() => navigate(item.path)}
              className="font-medium"
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <SearchBar />
          </div>
          <NotificationBell />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/auth')}>Login</Button>
          )}

          {/* Mobile Navigation Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader className="pb-6">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.label}
                      variant={isActive(item.path) ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => handleNavigation(item.path)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};