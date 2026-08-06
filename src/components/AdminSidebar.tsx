import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Shield,
  Home,
  Briefcase,
  ClipboardList,
  Edit3,
  Mail,
  Award,
  Calendar,
  Handshake,
  Send,
  Gift
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AdminSidebarProps {
  onLogout?: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await signOut();
      localStorage.removeItem('isAdmin');
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/applications', icon: ClipboardList, label: 'Applications' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/jobs', icon: Briefcase, label: 'Jobs & Services' },
    { path: '/admin/articles', icon: Edit3, label: 'Manage Articles' },
    { path: '/admin/content', icon: FileText, label: 'Content Pages' },
    { path: '/admin/events', icon: Calendar, label: 'Events' },
    { path: '/admin/recognition', icon: Award, label: 'Recognition' },
    { path: '/admin/sponsorships', icon: Handshake, label: 'Sponsorships' },
    { path: '/admin/promo-codes', icon: Gift, label: 'Promo Codes' },
    { path: '/admin/email-blasts', icon: Send, label: 'Email Blasts' },
    { path: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/logo.png"
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
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
