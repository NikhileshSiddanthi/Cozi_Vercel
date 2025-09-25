import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
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
import { Home, Grid3X3, Newspaper, Settings, LogOut, User, Menu, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { VisitorCounter } from '@/components/VisitorCounter';
import { CreatePostButton } from '@/components/CreatePostButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PostComposer } from '@/components/PostComposer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchAvailableGroups();
    }
  }, [user]);

  const fetchAvailableGroups = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, is_public')
        .eq('is_approved', true)
        .order('name');

      if (error) throw error;
      setAvailableGroups(data || []);
    } catch (error: any) {
      console.error('Error fetching available groups:', error);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/', key: 'home' },
    { icon: Grid3X3, label: 'Groups', path: '/', key: 'groups' },
    { icon: Newspaper, label: 'News', path: '/news', key: 'news' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleCreateClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required", 
        description: "Please log in to create a post.",
        variant: "destructive",
      });
      return;
    }

    if (availableGroups.length === 0) {
      toast({
        title: "No Groups Available",
        description: "There are no approved groups to post in at the moment.",
        variant: "destructive", 
      });
      return;
    }
    
    setShowCreateDialog(true);
  };

  return (
    <>
      {/* Skip to content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-3 py-2 rounded-md z-50"
      >
        Skip to content
      </a>
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 z-50 shadow-sm" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-between h-full px-3 md:px-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="font-bold text-lg md:text-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 md:px-3 transition-all duration-300 hover:scale-105"
              aria-label="COZI Home"
            >
              COZI
            </Button>
          </div>

          {/* Center: Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-2" aria-label="Main navigation">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate(item.path)}
                className={`gap-2 transition-all duration-300 rounded-xl ${
                  isActive(item.path) 
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg' 
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Right: Primary CTA + Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Primary CTA - Desktop */}
            <Button
              onClick={handleCreateClick}
              className="hidden md:flex gap-2 bg-blue-600 hover:bg-blue-700 hover:shadow-lg text-white font-medium transition-all duration-300 hover:scale-105 rounded-xl px-6"
              aria-label="Create new post"
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>

            {/* Visitor Counter */}
            <VisitorCounter />

            {/* Mobile Search Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden xl:hidden h-8 w-8 md:h-10 md:w-10" aria-label="Search">
                  <Search className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <SheetHeader className="pb-4">
                  <SheetTitle>Search</SheetTitle>
                </SheetHeader>
                <SearchBar />
              </SheetContent>
            </Sheet>

            {/* Desktop Search Bar */}
            <div className="hidden xl:block">
              <SearchBar />
            </div>

            {/* Mobile Navigation Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 md:h-10 md:w-10" aria-label="Open navigation menu">
                  <Menu className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader className="pb-6">
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.key}
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => handleNavigation(item.path)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Notifications */}
            <NotificationBell />

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-10 md:w-10" aria-label="User profile menu">
                  <Avatar className="h-6 w-6 md:h-8 md:w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
                      {user?.email?.charAt(0).toUpperCase()}
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
          </div>
        </div>
      </header>

      {/* Mobile Floating Action Button */}
      <Button
        onClick={handleCreateClick}
        className="md:hidden fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 hover:shadow-xl text-white z-40 transition-all duration-300 hover:scale-110"
        size="icon"
        aria-label="Create post"
      >
        <Plus className="h-7 w-7" />
      </Button>

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          
          {availableGroups.length > 0 && (
            <PostComposer
              groups={availableGroups}
              startExpanded={true}
              onSuccess={() => {
                setShowCreateDialog(false);
                fetchAvailableGroups();
                window.location.reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};