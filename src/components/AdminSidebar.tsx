import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Shield,
  Home,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  onLogout: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/jobs', icon: Briefcase, label: 'Jobs & Services' },
    { path: '/admin/content', icon: FileText, label: 'Content Pages' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Summerland Estates"
            className="h-10 w-auto"
          />
        </Link>
        <div className="mt-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#A89F91]" />
          <span className="text-sm text-gray-400">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-[#A89F91] text-white shadow-lg'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-[#A89F91]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="mb-3 px-4 py-2 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400">Logged in as</p>
          <p className="text-sm text-white truncate">{user?.email}</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-300 mb-2"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Back to Site</span>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
