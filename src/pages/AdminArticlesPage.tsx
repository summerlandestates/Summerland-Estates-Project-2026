import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ArticleManager from '@/components/ArticleManager';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminArticlesPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [authLoading, user]);


  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A89F91]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

<div className="max-w-7xl mx-auto">
  <div className="mb-8">
    <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
      Manage Articles
    </h1>
    <p className="text-gray-600">Create, edit, and publish news articles.</p>
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

</div>
  );
}
