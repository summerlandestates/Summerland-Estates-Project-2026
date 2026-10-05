import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Shield,
  Briefcase,
  ClipboardList,
  Edit3,
  Mail,
  Award,
  Calendar,
  Handshake,
  Send,
  Gift,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/applications', icon: ClipboardList, label: 'Applications' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/reports', icon: Shield, label: 'Reports' },
    { path: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
    { path: '/admin/articles', icon: Edit3, label: 'Articles' },
    { path: '/admin/content', icon: FileText, label: 'Content' },
    { path: '/admin/events', icon: Calendar, label: 'Events' },
    { path: '/admin/recognition', icon: Award, label: 'Recognition' },
    { path: '/admin/sponsorships', icon: Handshake, label: 'Sponsorships' },
    { path: '/admin/promo-codes', icon: Gift, label: 'Promos' },
    { path: '/admin/email-blasts', icon: Send, label: 'Emails' },
    { path: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside
      className={`bg-gradient-to-b from-[#2C2820] to-[#211D17] border-r border-[#3A342C] h-screen sticky top-0 flex flex-col shrink-0 transition-all duration-300 ${
        collapsed ? 'w-[84px]' : 'w-[240px]'
      }`}
    >
      <style>{`
        .admin-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #4A443A;
          border-radius: 20px;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #A89F91;
        }
      `}</style>

      {/* Logo + Toggle */}
      <div className={`border-b border-[#3A342C] flex-shrink-0 ${collapsed ? 'px-3 py-4' : 'px-4 py-4'}`}>
        <div className="flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#A89F91] flex items-center justify-center text-white font-serif font-bold text-lg shadow-md shrink-0 group-hover:shadow-lg group-hover:bg-[#B8AFA1] transition-all">
              SE
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="font-serif font-semibold text-[#F2EDE4] text-[15px] leading-tight">
                  Summerland
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-[#A89F91]" />
                  <span className="text-[10px] font-medium text-[#A89F91] uppercase tracking-wider">
                    Admin
                  </span>
                </div>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 rounded-md text-[#8C8478] hover:bg-[#3A342C] hover:text-[#F2EDE4] transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="mt-3 w-full flex items-center justify-center p-1.5 rounded-md text-[#8C8478] hover:bg-[#3A342C] hover:text-[#F2EDE4] transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto admin-sidebar-scroll">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg font-medium transition-all duration-200 group relative ${
                    collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5 text-sm'
                  } ${
                    active
                      ? 'bg-[#A89F91] text-white shadow-md'
                      : 'text-[#C4BCB0] hover:bg-[#3A342C] hover:text-[#F2EDE4]'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center rounded-lg transition-colors shrink-0 ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-[#3A342C] text-[#9A9183] group-hover:bg-[#4A443A] group-hover:text-[#E8E2D9]'
                    } ${collapsed ? 'w-9 h-9' : 'w-8 h-8'}`}
                  >
                    <Icon className={`${collapsed ? 'w-[18px] h-[18px]' : 'w-4 h-4'}`} />
                  </span>
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                  {!collapsed && active && (
                    <ChevronRight className="w-4 h-4 text-white opacity-70" />
                  )}
                  {collapsed && active && (
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
