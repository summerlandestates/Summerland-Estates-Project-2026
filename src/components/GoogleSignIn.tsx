import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { loadGoogleGsi } from '@/lib/googleGsi';
import { useAuth } from '@/contexts/AuthContext';

interface GoogleSignInProps {
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.805 12.041c0-.818-.067-1.414-.212-2.033H12.2v3.711h5.515c-.111.922-.711 2.311-2.045 3.244l-.019.124 3.026 2.298.21.02c1.934-1.744 3.051-4.31 3.051-7.364Z"
        fill="#4285F4"
      />
      <path
        d="M12.2 21.75c2.7 0 4.967-.866 6.623-2.344l-3.156-2.442c-.845.578-1.979.989-3.467.989-2.644 0-4.889-1.744-5.689-4.154l-.12.01-3.147 2.387-.041.112C4.848 19.519 8.267 21.75 12.2 21.75Z"
        fill="#34A853"
      />
      <path
        d="M6.511 13.799a5.702 5.702 0 0 1-.334-1.91c0-.667.123-1.311.322-1.91l-.006-.128-3.187-2.425-.104.048A9.648 9.648 0 0 0 2.111 11.89c0 1.567.389 3.045 1.09 4.414l3.31-2.505Z"
        fill="#FBBC05"
      />
      <path
        d="M12.2 5.828c1.878 0 3.145.8 3.867 1.467l2.823-2.7C17.156 3.028 14.9 2 12.2 2 8.267 2 4.848 4.231 3.202 7.474l3.297 2.505c.811-2.411 3.056-4.151 5.701-4.151Z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Renders Google's official Identity Services button when VITE_GOOGLE_CLIENT_ID
// is set — the consent popup then shows our app name/logo on our domain
// instead of supabase.co. Falls back to the Supabase redirect OAuth flow.
export default function GoogleSignIn({ onStart, onSuccess, onError, disabled = false }: GoogleSignInProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const [useRedirectFlow, setUseRedirectFlow] = useState(false);
  const { signInWithGoogle, signInWithGoogleCredential } = useAuth();

  useEffect(() => {
    if (!clientId || !containerRef.current) return;

    let cancelled = false;
    loadGoogleGsi()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        window.google!.accounts!.id!.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential) {
              onError?.('Google did not return a credential');
              return;
            }
            onStart?.();
            const { error } = await signInWithGoogleCredential(response.credential);
            if (error) {
              onError?.(error.message);
              return;
            }
            onSuccess?.();
          },
        });
        window.google!.accounts!.id!.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular',
          width: Math.min(containerRef.current.offsetWidth || 320, 400),
        });
      })
      .catch(() => {
        if (!cancelled) setUseRedirectFlow(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (!clientId || useRedirectFlow) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={async () => {
          onStart?.();
          const { error } = await signInWithGoogle();
          if (error) onError?.(error.message);
        }}
        className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[#D7DCE4] bg-white px-4 py-3 text-sm font-medium text-[#1F1F1F] shadow-sm transition-all hover:bg-[#F8FAFC] hover:border-[#C7CED9] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {disabled ? <Loader2 className="h-5 w-5 animate-spin text-[#5F6368]" /> : <GoogleIcon />}
        <span>Continue with Google</span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex w-full justify-center [&>div]:w-full ${disabled ? 'pointer-events-none opacity-70' : ''}`}
    />
  );
}
