
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  ChevronDown, 
  ClipboardList, 
  Home, 
  LogOut, 
  Menu, 
  Settings, 
  User, 
  Users, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,  
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import NotificationsDropdown from './NotificationsDropdown';

const DashboardLayout = ({ children, pageTitle, role = 'employee' }) => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user info from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const storedEmail = localStorage.getItem('userEmail');
    const storedRole = localStorage.getItem('userRole');
    
    if (!storedEmail || !storedRole) {
      navigate('/login');
      return;
    }
    
    setUserEmail(storedEmail);
    
    // Verify user has correct role for this page
    if (role && storedRole !== role) {
      toast.error(`You don't have permission to access this page`);
      navigate(`/${storedRole}/dashboard`);
    }
  }, [navigate, role]);

  if (!mounted) return null;

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const sidebarItems = {
    employee: [
      { name: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/employee/dashboard' },
      { name: 'My Leaves', icon: <Calendar className="h-5 w-5" />, path: '/employee/leaves' },
      { name: 'Submit Request', icon: <ClipboardList className="h-5 w-5" />, path: '/employee/new-leave' },
      { name: 'Profile', icon: <User className="h-5 w-5" />, path: '/employee/profile' },
    ],
    manager: [
      { name: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/manager/dashboard' },
      { name: 'Team Calendar', icon: <Calendar className="h-5 w-5" />, path: '/manager/calendar' },
      { name: 'My Leaves', icon: <Calendar className="h-5 w-5" />, path: '/manager/leaves' },
      { name: 'Team Members', icon: <Users className="h-5 w-5" />, path: '/manager/team' },
      { name: 'Profile', icon: <User className="h-5 w-5" />, path: '/manager/profile' },
    ],
    admin: [
      { name: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/admin/dashboard' },
      { name: 'All Leaves', icon: <ClipboardList className="h-5 w-5" />, path: '/admin/leaves' },
      { name: 'Users', icon: <Users className="h-5 w-5" />, path: '/admin/users' },
      { name: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/admin/settings' },
      { name: 'Profile', icon: <User className="h-5 w-5" />, path: '/admin/profile' },
    ]
  };

  const navItems = sidebarItems[role] || sidebarItems.employee;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-brand-700">Leave Management</h1>
        </div>
        <Separator />
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                window.location.pathname === item.path
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start text-gray-600" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-6">
            <h1 className="text-xl font-bold text-brand-700">Leave Management</h1>
          </div>
          <Separator />
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  window.location.pathname === item.path
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
            <div className="pt-4">
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-600" 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            
            <h1 className="text-xl font-semibold text-gray-800 md:hidden">
              Leave Management
            </h1>
            
            <h2 className="text-lg font-medium text-gray-800 hidden md:block">
              {pageTitle}
            </h2>

            <div className="flex items-center space-x-4">
              <NotificationsDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-brand-100 text-brand-700">
                        {getInitials(userEmail)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate(`/${role}/profile`)}
                    className="cursor-pointer"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  {role === 'admin' && (
                    <DropdownMenuItem 
                      onClick={() => navigate(`/${role}/settings`)}
                      className="cursor-pointer"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
