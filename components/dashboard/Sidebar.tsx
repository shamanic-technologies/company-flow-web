/**
 * Sidebar Component
 * 
 * Displays navigation menu for the dashboard
 */
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  PlayCircle, 
  Wrench, 
  ChevronRight, 
  ChevronLeft, 
  HomeIcon,
  MenuIcon,
  X,
  BookOpen,
  ExternalLink,
  DollarSign,
  ScrollText,
  Key
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
}

/**
 * Navigation item component
 */
function NavItem({ icon, label, isActive, onClick, isCollapsed = false }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 px-3 py-2 h-auto",
        isCollapsed ? "justify-center px-2" : "justify-start",
        isActive ? "bg-blue-900/20 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300" : "text-gray-300 hover:bg-gray-800"
      )}
      onClick={onClick}
    >
      <div className={isActive ? "text-blue-400" : "text-gray-400"}>
        {icon}
      </div>
      {!isCollapsed && <span>{label}</span>}
    </Button>
  );
}

/**
 * Sidebar component with navigation menu
 */
export default function Sidebar({ className, isMobile, onMobileClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Navigation items data
  const navItems = [
    { 
      icon: <HomeIcon size={20} />, 
      label: "Get Started", 
      path: "/dashboard"
    },
    { 
      icon: <PlayCircle size={20} />, 
      label: "Playground", 
      path: "/dashboard/playground"
    },
    { 
      icon: <Wrench size={20} />, 
      label: "Available Tools", 
      path: "/dashboard/tools"
    },
    { 
      icon: <DollarSign size={20} />, 
      label: "Budget", 
      path: "/dashboard/budget"
    },
    { 
      icon: <ScrollText size={20} />, 
      label: "API Logs", 
      path: "/dashboard/logs"
    },
    { 
      icon: <Key size={20} />, 
      label: "API Keys", 
      path: "/dashboard/apikeys"
    }
  ];
  
  const toggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const openDocumentation = () => {
    window.open('https://docs.helloworld.ai', '_blank');
  };
  
  return (
    <div 
      className={cn(
        "flex flex-col h-[calc(100vh-64px)] border-r border-gray-800 bg-gray-900",
        isCollapsed ? "w-16" : "w-60",
        isMobile ? "fixed top-0 left-0 z-40 w-60 h-full" : "",
        className
      )}
    >
      {/* Mobile header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <span className="font-medium text-gray-200">Menu</span>
          <Button variant="ghost" size="sm" onClick={onMobileClose} className="p-1 h-auto">
            <X size={18} />
          </Button>
        </div>
      )}
      
      {/* Logo and collapse button */}
      {!isMobile && (
        <div className={cn(
          "flex items-center p-4 border-b border-gray-800",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && <span className="font-semibold text-xl text-gray-200">Agent Base</span>}
          <Button variant="ghost" size="sm" onClick={toggleCollapse} className="p-1 h-auto text-gray-400">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
      )}
      
      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.path}
            onClick={() => router.push(item.path)}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      {/* Documentation link at the bottom */}
      <div className="mt-auto border-t border-gray-800 p-3">
        <NavItem
          icon={<BookOpen size={20} />}
          label={isCollapsed ? "" : "Documentation"}
          isActive={false}
          onClick={openDocumentation}
          isCollapsed={isCollapsed}
        />
        {!isCollapsed && (
          <div className="pl-9 mt-1 text-xs text-gray-400 flex items-center">
            <ExternalLink size={12} className="mr-1" />
            Opens in new tab
          </div>
        )}
      </div>
    </div>
  );
} 