
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
  BarChart3
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
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 min-w-0">
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-black rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-black bg-clip-text text-transparent">
                  RecyclrAI
                </span>
              </div>
            </Link>
            <Badge className="hidden md:flex bg-purple-100 text-purple-700 border-purple-300">
              <Crown className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          </div>

          {/* Search & View Controls */}
          <div className="flex items-center space-x-3 flex-1 max-w-2xl">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search content, analytics, schedules..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 border-purple-200 focus:border-purple-400 bg-white/80"
              />
            </div>

            {/* View Selector */}
            <div className="hidden lg:flex items-center space-x-1 bg-purple-50/50 rounded-lg p-1">
              {viewOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.id}
                    variant={selectedView === option.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onViewChange(option.id)}
                    className={`${
                      selectedView === option.id 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-100/50'
                    } transition-all duration-200`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Refresh Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="relative group"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2">
                {isRefreshing ? 'Updating...' : 'Refresh'}
              </span>
              {lastUpdated && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </Button>

            {/* Mobile View Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {viewOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => onViewChange(option.id)}
                      className={selectedView === option.id ? 'bg-purple-50 text-purple-700' : ''}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {option.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {notificationCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline font-medium">
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
