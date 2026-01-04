import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Crown, 
  Bell, 
  Settings, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  RefreshCw,
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  Brain,
  Wand2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedView: string;
  onViewChange: (view: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated?: Date;
}

const DashboardHeader = ({
  searchQuery,
  onSearchChange,
  selectedView,
  onViewChange,
  onRefresh,
  isRefreshing,
  lastUpdated
}: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const [notificationCount] = useState(3);

  const viewOptions = [
    { id: 'overview', label: 'Overview', icon: Grid3X3 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'content', label: 'Content', icon: List },
    { id: 'calendar', label: 'Calendar', icon: Calendar }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-purple-200/30 shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-black rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-black bg-clip-text text-transparent">
                  Vyralix AI
                </span>
              </div>
            </Link>
            <Badge className="hidden lg:flex bg-purple-100 text-purple-700 border-purple-300 text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          </div>

          {/* Main Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 text-sm">
                <Grid3X3 className="w-4 h-4 mr-1.5" />
                Dashboard
              </Button>
            </Link>
            <Link to="/ai">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 text-sm">
                <Brain className="w-4 h-4 mr-1.5" />
                AI Tools
                <Badge className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0">36</Badge>
              </Button>
            </Link>
            <Link to="/repurpose">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 text-sm">
                <Wand2 className="w-4 h-4 mr-1.5" />
                Repurpose
              </Button>
            </Link>
            <Link to="/schedule">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 text-sm">
                <Calendar className="w-4 h-4 mr-1.5" />
                Schedule
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 text-sm">
                <BarChart3 className="w-4 h-4 mr-1.5" />
                Analytics
              </Button>
            </Link>
          </nav>

          {/* Search & View Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xs sm:max-w-md lg:max-w-2xl justify-end">
            {/* Search - Hidden on small mobile */}
            <div className="hidden sm:block relative flex-1 max-w-xs md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-3 h-9 text-sm border-purple-200 focus:border-purple-400 bg-white/80"
              />
            </div>

            {/* View Selector - Hidden on mobile/tablet */}
            <div className="hidden xl:flex items-center gap-1 bg-purple-50/50 rounded-lg p-1">
              {viewOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.id}
                    variant={selectedView === option.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onViewChange(option.id)}
                    className={`h-8 px-2.5 text-xs ${
                      selectedView === option.id 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-100/50'
                    } transition-all duration-200`}
                  >
                    <Icon className="w-3.5 h-3.5 mr-1.5" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Refresh Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="relative group h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-1.5 text-sm">
                {isRefreshing ? 'Updating...' : 'Refresh'}
              </span>
              {lastUpdated && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Last: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </Button>

            {/* Mobile Navigation Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center">
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/ai" className="flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Tools Hub
                    <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0">36</Badge>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/repurpose" className="flex items-center">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Repurpose Content
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/schedule" className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Posts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/analytics" className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Mobile Search */}
                <div className="px-2 py-1.5 sm:hidden">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="pl-7 h-8 text-sm"
                    />
                  </div>
                </div>
                <DropdownMenuSeparator />
                {viewOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => onViewChange(option.id)}
                      className={selectedView === option.id ? 'bg-purple-50 text-purple-700' : ''}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      View: {option.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {notificationCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5 h-8 px-1.5 sm:px-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline font-medium text-sm max-w-24 truncate">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{user?.user_metadata?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/analytics" className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
