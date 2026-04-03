import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock3, MailCheck, ShieldCheck } from 'lucide-react';

export default function RegistrationPendingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const applicantName = location.state?.name || 'Thank you';
  const applicantEmail = location.state?.email || '';
  const requiresPayment = Boolean(location.state?.requiresPayment);

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <NavBar currentPage="" />

      <main className="pt-32 pb-20">
        <div className="container mx-auto max-w-3xl px-6">
          <Card className="overflow-hidden rounded-[32px] border border-[#d9d2c8] bg-white shadow-[0_25px_80px_rgba(59,45,27,0.08)]">
            <div className="h-2 bg-gradient-to-r from-[#A89F91] via-[#d8cdbd] to-[#8A8279]" />
            <CardContent className="px-8 py-10 sm:px-12 sm:py-14">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4eee7] text-[#8A8279]">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Thank you for registering
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {applicantName}, your account is now under review. Our team will review your application and notify you as soon as it has been approved.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#ece6dd] bg-[#faf8f4] p-5">
                  <div className="mb-3 flex items-center gap-3 text-[#8A8279]">
                    <Clock3 className="h-5 w-5" />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">Review Status</h2>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Your registration remains in a pending state until an admin approves it.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#ece6dd] bg-[#faf8f4] p-5">
                  <div className="mb-3 flex items-center gap-3 text-[#8A8279]">
                    <MailCheck className="h-5 w-5" />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">Notifications</h2>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {applicantEmail
                      ? requiresPayment
                        ? `We will contact you at ${applicantEmail} once your account has been approved. After approval, you will be guided to complete membership payment.`
                        : `We will contact you at ${applicantEmail} once your account has been approved or if we need anything else.`
                      : requiresPayment
                      ? 'We will email you once your account has been approved and it is time to complete membership payment.'
                      : 'We will email you once your account has been approved or if we need anything else.'}
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => navigate('/')}
                  className="rounded-xl bg-[#A89F91] px-8 text-white hover:bg-[#8A8279]"
                >
                  Return to Homepage
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="rounded-xl border-[#cfc5b8] text-[#6f665c] hover:bg-[#f7f2ec]"
                >
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
