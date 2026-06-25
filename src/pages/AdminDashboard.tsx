import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/SEOHead';
import AdminSidebar from '@/components/AdminSidebar';
import ArticleManager from '@/components/ArticleManager';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    checkAdminAccess();
  }, [authLoading, user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    // Simplified admin check - if user is logged in, grant access for demo purposes
    setLoading(false);
  };


  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SEOHead title="Admin Dashboard - Summerland Estates" description="Admin dashboard." canonical="/admin/dashboard" noIndex={true} />
      <AdminSidebar onLogout={handleLogout} />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, Admin</p>
          </div>

          <Card className="border-gray-200">
              <CardContent className="pt-6">
                <ArticleManager
                  userRole="admin"
                  userId={user?.id || ''}
                  userName={user?.email || 'Admin'}
                  userAvatar={user?.user_metadata?.avatar_url}
                />
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
