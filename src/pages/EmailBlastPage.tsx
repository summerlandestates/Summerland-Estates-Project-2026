import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import {
  Send,
  Mail,
  Users,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
  Calendar,
  Target,
  Sparkles,
  Lock,
  FileText,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { emailNotifications } from '@/services/emailNotifications';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const EMAIL_BLAST_PRICE = 12.99;
const RECIPIENT_STATS = {
  all: { count: 8500, label: 'All Members' },
  professionals: { count: 4200, label: 'Estate Professionals' },
  businesses: { count: 2100, label: 'Business Owners' },
  agencies: { count: 1800, label: 'Agencies & Recruiters' }
};

// Payment Form Component
function PaymentForm({ 
  onSuccess, 
  onCancel 
}: { 
  onSuccess: () => void; 
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required'
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed. Please try again.');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg mb-4">
        <div className="flex items-center gap-2 text-blue-700 mb-2">
          <Lock className="w-4 h-4" />
          <span className="font-medium">Secure Payment</span>
        </div>
        <p className="text-sm text-blue-600">
          Your payment is secured by Stripe. We never store your card details.
        </p>
      </div>

      <PaymentElement />

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-[#A89F91] hover:bg-[#8A8279] text-white"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${EMAIL_BLAST_PRICE}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function EmailBlastPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('compose');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [submissionId, setSubmissionId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    subject: '',
    content: '',
    targetAudience: 'all',
    scheduledDate: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to send an email blast');
      navigate('/login', { state: { from: '/email-blast' } });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ 
        ...prev, 
        senderEmail: user.email || '',
        senderName: user.user_metadata?.full_name || user.user_metadata?.name || ''
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.senderName.trim()) newErrors.senderName = 'Sender name is required';
    if (!formData.senderEmail.trim()) {
      newErrors.senderEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.senderEmail)) {
      newErrors.senderEmail = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.content.trim()) newErrors.content = 'Email content is required';
    if (formData.content.length > 5000) newErrors.content = 'Content must be under 5000 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Create submission record
      const { data: submission, error: subError } = await supabase
        .from('email_blast_submissions')
        .insert({
          user_id: user?.id,
          sender_name: formData.senderName,
          sender_email: formData.senderEmail,
          subject: formData.subject,
          content: formData.content,
          target_audience: formData.targetAudience,
          scheduled_send_at: formData.scheduledDate || null,
          amount_paid: EMAIL_BLAST_PRICE,
          status: 'pending_payment',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (subError) throw subError;
      setSubmissionId(submission.id);

      // Create Stripe payment intent
      const response = await fetch('/api/create-email-blast-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          amount: EMAIL_BLAST_PRICE
        })
      });

      const { clientSecret: secret } = await response.json();
      setClientSecret(secret);
      setActiveTab('payment');
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Failed to initialize payment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Update submission status
      await supabase
        .from('email_blast_submissions')
        .update({
          status: 'pending_review',
          payment_status: 'completed'
        })
        .eq('id', submissionId);

      const selectedAudience = RECIPIENT_STATS[formData.targetAudience as keyof typeof RECIPIENT_STATS];

      // Send notification to user
      await emailNotifications.notifyEmailBlast({
        userEmail: formData.senderEmail,
        userName: formData.senderName,
        subject: formData.subject,
        recipientsCount: `${selectedAudience.label} (${selectedAudience.count.toLocaleString()} recipients)`,
      });

      // Send notification to admin
      await emailNotifications.notifyAdminEmailBlast({
        sender_name: formData.senderName,
        sender_email: formData.senderEmail,
        subject: formData.subject,
        target_recipients: selectedAudience.label,
        amount_paid: EMAIL_BLAST_PRICE,
      });

      setIsSuccess(true);
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  const selectedAudience = RECIPIENT_STATS[formData.targetAudience as keyof typeof RECIPIENT_STATS];

  useEffect(() => {
    if (isSuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Email Blast Submitted - Summerland Estates"
          description="Your email blast has been submitted for review."
        />
        <NavBar currentPage="advertising" />
        
        <main className="pt-16 pb-16 min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-heading font-bold mb-4">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground mb-4">
                Your email blast has been submitted for admin review. 
                You'll receive a confirmation once it's approved and scheduled.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm"><strong>Subject:</strong> {formData.subject}</p>
                <p className="text-sm"><strong>Target:</strong> {selectedAudience.label} ({selectedAudience.count.toLocaleString()} recipients)</p>
                <p className="text-sm"><strong>Status:</strong> Pending Review</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate('/advertisements')}>
                  View Advertising Options
                </Button>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Email Blast - Summerland Estates"
        description="Send a dedicated email blast to our community of estate professionals. Reach 8,500+ members directly in their inbox."
        canonical="/email-blast"
      />
      <NavBar currentPage="advertising" />
      
      <main className="pt-0 pb-16">
        {/* Hero Banner Section */}
        <section className="relative mb-16">
          <div className="relative h-[350px] md:h-[420px] overflow-hidden">
            <img
              src="/images/advertise-bg.webp"
              alt="Email Blast Marketing"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1d2018]/70 via-[#1d2018]/50 to-[#1d2018]/80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
                  <Send className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">Email Marketing</span>
                </div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  Email Blast
                </h1>
                <p className="text-white/90 max-w-2xl mx-auto text-lg md:text-xl drop-shadow-md">
                  Reach thousands of estate professionals directly in their inbox. 
                  Perfect for announcements, promotions, and important updates.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button - Properly spaced below banner */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-[#A89F91]/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="compose" disabled={activeTab === 'payment'}>
                <FileText className="w-4 h-4 mr-2" />
                Compose
              </TabsTrigger>
              <TabsTrigger value="payment" disabled={!clientSecret}>
                <CreditCard className="w-4 h-4 mr-2" />
                Payment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Compose Your Email</h2>
                    
                    {errors.submit && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {errors.submit}
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* Sender Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="senderName">Sender Name *</Label>
                          <Input
                            id="senderName"
                            value={formData.senderName}
                            onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                            placeholder="Your name or company"
                            className={errors.senderName ? 'border-red-500' : ''}
                          />
                          {errors.senderName && (
                            <p className="text-sm text-red-500">{errors.senderName}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="senderEmail">Sender Email *</Label>
                          <Input
                            id="senderEmail"
                            type="email"
                            value={formData.senderEmail}
                            onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                            placeholder="your@email.com"
                            className={errors.senderEmail ? 'border-red-500' : ''}
                          />
                          {errors.senderEmail && (
                            <p className="text-sm text-red-500">{errors.senderEmail}</p>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject Line *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="Enter an engaging subject line"
                          className={errors.subject ? 'border-red-500' : ''}
                        />
                        {errors.subject && (
                          <p className="text-sm text-red-500">{errors.subject}</p>
                        )}
                      </div>

                      {/* Target Audience */}
                      <div className="space-y-2">
                        <Label htmlFor="targetAudience">
                          <Target className="w-4 h-4 inline mr-1" />
                          Target Audience
                        </Label>
                        <select
                          id="targetAudience"
                          value={formData.targetAudience}
                          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A89F91]"
                        >
                          {Object.entries(RECIPIENT_STATS).map(([key, stats]) => (
                            <option key={key} value={key}>
                              {stats.label} ({stats.count.toLocaleString()} recipients)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Scheduled Date */}
                      <div className="space-y-2">
                        <Label htmlFor="scheduledDate">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Preferred Send Date (Optional)
                        </Label>
                        <Input
                          id="scheduledDate"
                          type="datetime-local"
                          value={formData.scheduledDate}
                          onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                          min={new Date().toISOString().slice(0, 16)}
                        />
                        <p className="text-sm text-muted-foreground">
                          Leave blank for ASAP approval. Subject to admin review.
                        </p>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <Label htmlFor="content">Email Content *</Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          placeholder="Write your email content here... You can include:
• Your message and call-to-action
• Links to your website or offers
• Contact information
• Any special promotions"
                          rows={12}
                          className={errors.content ? 'border-red-500' : ''}
                        />
                        <div className="flex justify-between text-sm">
                          <span className={errors.content ? 'text-red-500' : 'text-muted-foreground'}>
                            {formData.content.length} / 5000 characters
                          </span>
                          <span className="text-muted-foreground">
                            Plain text recommended for best deliverability
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleProceedToPayment}
                        className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            Continue to Payment
                            <DollarSign className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#A89F91]" />
                      What's Included
                    </h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Send to {selectedAudience.count.toLocaleString()} {selectedAudience.label.toLowerCase()}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Dedicated email (not part of newsletter)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Delivered to primary inbox</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>99%+ delivery rate guarantee</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Open & click tracking included</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Admin review before sending</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6 bg-[#A89F91]/5 border-[#A89F91]/20">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">One-time fee</p>
                      <p className="text-4xl font-bold text-[#A89F91]">${EMAIL_BLAST_PRICE}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        per email blast
                      </p>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      Guidelines
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• No spam or misleading content</li>
                      <li>• Must be relevant to estate industry</li>
                      <li>• Subject to admin approval</li>
                      <li>• Sent within 24-48 hours of approval</li>
                      <li>• Refund available if not approved</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment">
              <div className="max-w-xl mx-auto">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Complete Payment</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Email Blast</span>
                      <span className="font-medium">{selectedAudience.label}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Recipients</span>
                      <span className="font-medium">{selectedAudience.count.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-[#A89F91]">${EMAIL_BLAST_PRICE}</span>
                      </div>
                    </div>
                  </div>

                  {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <PaymentForm
                        onSuccess={handlePaymentSuccess}
                        onCancel={() => setActiveTab('compose')}
                      />
                    </Elements>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
