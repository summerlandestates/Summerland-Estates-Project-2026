import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopNav from './AdminTopNav';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/applications': 'Applications',
  '/admin/applications/': 'Application Details',
  '/admin/users': 'User Management',
  '/admin/jobs': 'Jobs & Services',
  '/admin/articles': 'Manage Articles',
  '/admin/content': 'Content Pages',
  '/admin/content/pages/': 'Page Editor',
  '/admin/events': 'Events',
  '/admin/event/': 'Event Details',
  '/admin/recognition': 'Recognition',
  '/admin/sponsorships': 'Sponsorships',
  '/admin/promo-codes': 'Promo Codes',
  '/admin/email-blasts': 'Email Blasts',
  '/admin/newsletter': 'Newsletter',
  '/admin/settings': 'Settings',
  '/admin/new-listings': 'New Listings',
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  for (const [prefix, title] of Object.entries(pageTitles)) {
    if (prefix.endsWith('/') && pathname.startsWith(prefix)) {
      return title;
    }
  }
  return 'Admin';
}

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminSidebarCollapsed') === 'true';
    }
    return false;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', String(collapsed));
  }, [collapsed]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar collapsed={collapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 lg:hidden">
            <AdminSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopNav onMenuToggle={toggleSidebar} pageTitle={pageTitle} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
