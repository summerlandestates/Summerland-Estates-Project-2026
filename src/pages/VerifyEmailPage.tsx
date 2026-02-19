import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      toast.error('Invalid Request', {
        description: 'No email provided for verification',
      });
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const newCode = [...code];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    const nextEmptyIndex = newCode.findIndex(c => !c);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      toast.error('Invalid Code', {
        description: 'Please enter all 6 digits',
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: email!,
      token: verificationCode,
      type: 'signup',
    });

    if (error) {
      toast.error('Verification Failed', {
        description: error.message,
      });
      setLoading(false);
    } else {
      toast.success('Email Verified!', {
        description: 'Your account has been verified successfully',
      });
      setTimeout(() => navigate('/'), 1000);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setResending(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      toast.error('Resend Failed', {
        description: error.message,
      });
    } else {
      toast.success('Code Resent', {
        description: 'A new verification code has been sent to your email',
      });
    }

    setResending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-8">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-heading font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to<br />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold"
                disabled={loading}
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={loading || code.some(d => !d)}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Email
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              variant="ghost"
              onClick={handleResend}
              disabled={resending}
              className="text-primary hover:text-primary/80"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
