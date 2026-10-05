import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    const finish = async () => {
      if (handled.current) return;
      handled.current = true;

      // Supabase parses tokens from the URL hash automatically on load.
      // Give the client a moment, then check for a session.
      let session = null;
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          session = data.session;
          break;
        }
        await new Promise((r) => setTimeout(r, 250));
      }

      if (!session?.user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status, application_data')
        .eq('id', session.user.id)
        .maybeSingle();

      const status =
        profile?.status ||
        profile?.application_data?.account_status ||
        session.user.user_metadata?.account_status;

      if (profile?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (status === 'pending') {
        navigate('/registration-pending', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    };

    finish();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-[#A89F91]" />
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}
