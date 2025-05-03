/**
 * Dashboard Header Component
 * 
 * Displays the top navigation and user profile dropdown
 */
import { useRouter } from 'next/navigation';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '../../components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import { 
  ChevronDown, 
  Loader2, 
  LogOut
} from 'lucide-react';
import { useDashboard } from './context/DashboardContext';

interface HeaderProps {
  children?: React.ReactNode;
}

/**
 * Dashboard header with navigation and user dropdown
 * Uses dashboard context for user data and utility functions
 */
export default function Header({ children }: HeaderProps) {
  const router = useRouter();
  const { user, isLoading, getUserInitials, handleLogout } = useDashboard();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {children}
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Agent Base
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
              </div>
              <span className="font-medium text-sm text-gray-400">Loading...</span>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImage || ''} alt={user?.displayName || 'User'} />
                    <AvatarFallback className="bg-gray-700 text-gray-200">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm text-gray-200">{user?.displayName || 'Guest'}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
                <DropdownMenuLabel className="text-gray-300">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-gray-800 focus:text-red-300">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
} 