import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Award, Star, Trophy, Users, Sparkles, Building2, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { emailNotifications } from '@/services/emailNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RecognitionItem {
  id: string;
  name: string;
  title: string;
  location: string;
  image?: string;
  description: string;
  date: string;
}

const employeesOfMonth: RecognitionItem[] = [
  {
    id: '1',
    name: 'Maria Santos',
    title: 'Executive Housekeeper',
    location: 'Beverly Hills, CA',
    description: 'Exceptional attention to detail and dedication to maintaining the highest standards of cleanliness and organization.',
    date: 'March 2026'
  },
  {
    id: '2',
    name: 'James Chen',
    title: 'Estate Manager',
    location: 'Miami, FL',
    description: 'Outstanding leadership in coordinating multiple properties and managing a team of 15 staff members.',
    date: 'February 2026'
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    title: 'Private Chef',
    location: 'New York, NY',
    description: 'Creative culinary excellence and ability to accommodate diverse dietary requirements with grace.',
    date: 'January 2026'
  }
];

const craftExcellence: RecognitionItem[] = [
  {
    id: '1',
    name: 'Robert Williams',
    title: 'Butler',
    location: 'Greenwich, CT',
    description: 'Master of formal service protocols with 25 years of experience in ultra-high-net-worth households.',
    date: '2026'
  },
  {
    id: '2',
    name: 'Elena Petrova',
    title: 'Nanny',
    location: 'Aspen, CO',
    description: 'Certified in early childhood development with expertise in multilingual education.',
    date: '2026'
  }
];

const vendorExcellence: RecognitionItem[] = [
  {
    id: '1',
    name: 'Premier Landscape Design',
    title: 'Landscaping Services',
    location: 'Los Angeles, CA',
    description: 'Award-winning landscape architecture firm specializing in luxury estate grounds.',
    date: '2026'
  },
  {
    id: '2',
    name: 'Elite Pool Services',
    title: 'Pool Maintenance',
    location: 'Palm Beach, FL',
    description: 'Trusted by over 50 estate properties for impeccable pool and spa maintenance.',
    date: '2026'
  }
];

export default function RecognitionPage() {
  const [activeTab, setActiveTab] = useState<'employee' | 'craft' | 'annual' | 'stories' | 'vendor'>('employee');
  const [isNominationOpen, setIsNominationOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNominationClick = () => {
    if (!user) {
      toast.error('Please log in to submit a nomination');
      navigate('/login', { state: { from: '/recognition' } });
      return;
    }
    setIsNominationOpen(true);
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead
        title="Estate Services Recognition - Summerland Estates"
        description="Celebrating excellence in estate management. Recognizing top estate professionals, vendors, and service providers in the luxury household industry."
        canonical="/recognition"
      />
      <NavBar currentPage="recognition" />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-12 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="bg-[#A89F91]/10 text-[#A89F91] border-[#A89F91]/20 px-4 py-2 text-sm font-semibold mb-6">
              Estate Services Recognition
            </Badge>
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground mb-6 tracking-tight">
              Celebrating Excellence
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Honoring the exceptional professionals and service providers who set the standard for luxury estate services.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={activeTab === 'employee' ? 'default' : 'outline'}
              onClick={() => setActiveTab('employee')}
              className={activeTab === 'employee' ? 'bg-[#A89F91] hover:bg-[#8A8279]' : 'border-[#A89F91] text-[#A89F91]'}
            >
              <Award className="w-4 h-4 mr-2" />
              Employee of the Month
            </Button>
            <Button
              variant={activeTab === 'craft' ? 'default' : 'outline'}
              onClick={() => setActiveTab('craft')}
              className={activeTab === 'craft' ? 'bg-[#A89F91] hover:bg-[#8A8279]' : 'border-[#A89F91] text-[#A89F91]'}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Craft Excellence Badge
            </Button>
            <Button
              variant={activeTab === 'annual' ? 'default' : 'outline'}
              onClick={() => setActiveTab('annual')}
              className={activeTab === 'annual' ? 'bg-[#A89F91] hover:bg-[#8A8279]' : 'border-[#A89F91] text-[#A89F91]'}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Annual Industry Honors
            </Button>
            <Button
              variant={activeTab === 'stories' ? 'default' : 'outline'}
              onClick={() => setActiveTab('stories')}
              className={activeTab === 'stories' ? 'bg-[#A89F91] hover:bg-[#8A8279]' : 'border-[#A89F91] text-[#A89F91]'}
            >
              <Users className="w-4 h-4 mr-2" />
              Featured Stories
            </Button>
            <Button
              variant={activeTab === 'vendor' ? 'default' : 'outline'}
              onClick={() => setActiveTab('vendor')}
              className={activeTab === 'vendor' ? 'bg-[#A89F91] hover:bg-[#8A8279]' : 'border-[#A89F91] text-[#A89F91]'}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Vendor Excellence
            </Button>
          </div>

          {/* Content Sections */}
          {activeTab === 'employee' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-heading font-semibold text-foreground mb-4">
                  Employee of the Month
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Recognizing outstanding professionals who go above and beyond in their service to luxury households.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {employeesOfMonth.map((employee) => (
                  <Card key={employee.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-[#A89F91]/20 flex items-center justify-center">
                          <Award className="w-10 h-10 text-[#A89F91]" />
                        </div>
                      </div>
                      <div className="text-center">
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-3">
                          <Star className="w-3 h-3 mr-1" />
                          {employee.date}
                        </Badge>
                        <h3 className="text-xl font-heading font-semibold text-foreground mb-1">
                          {employee.name}
                        </h3>
                        <p className="text-[#A89F91] font-medium mb-1">{employee.title}</p>
                        <p className="text-sm text-muted-foreground mb-4">{employee.location}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {employee.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'craft' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-heading font-semibold text-foreground mb-4">
                  Craft Excellence Badge
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Awarded to professionals who demonstrate mastery in their craft and commitment to continuous improvement.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {craftExcellence.map((professional) => (
                  <Card key={professional.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-3">
                            Craft Excellence {professional.date}
                          </Badge>
                          <h3 className="text-xl font-heading font-semibold text-foreground mb-1">
                            {professional.name}
                          </h3>
                          <p className="text-[#A89F91] font-medium mb-1">{professional.title}</p>
                          <p className="text-sm text-muted-foreground mb-3">{professional.location}</p>
                          <p className="text-muted-foreground leading-relaxed">
                            {professional.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'annual' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-heading font-semibold text-foreground mb-4">
                  Annual Industry Honors
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Our yearly celebration of the most distinguished professionals in the luxury estate services industry.
                </p>
              </div>
              <Card className="p-8 text-center">
                <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-6" />
                <h3 className="text-2xl font-heading font-semibold text-foreground mb-4">
                  2026 Annual Awards Coming Soon
                </h3>
                <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                  Nominations for the 2026 Annual Industry Honors will open in October. 
                  Categories include Estate Manager of the Year, Rising Star, and Lifetime Achievement.
                </p>
                <Button className="bg-[#A89F91] hover:bg-[#8A8279]">
                  Get Notified When Nominations Open
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'stories' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-heading font-semibold text-foreground mb-4">
                  Featured Professional Stories
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Inspiring journeys from professionals who have built exceptional careers in luxury estate services.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                      Featured Story
                    </Badge>
                    <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                      From Housekeeper to Estate Director: A 20-Year Journey
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      "I started as a part-time housekeeper and through dedication and continuous learning, 
                      I now oversee operations for three properties with a team of 25..."
                    </p>
                    <Button variant="outline" className="border-[#A89F91] text-[#A89F91]">
                      Read Full Story
                    </Button>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                      Featured Story
                    </Badge>
                    <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                      Building Trust: The Foundation of Private Service
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      "Discretion isn't just a skill—it's a way of life. After 15 years serving 
                      high-profile families, I've learned that trust is everything..."
                    </p>
                    <Button variant="outline" className="border-[#A89F91] text-[#A89F91]">
                      Read Full Story
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'vendor' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-heading font-semibold text-foreground mb-4">
                  Vendor & Business Excellence
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Recognizing service providers who consistently deliver exceptional quality to luxury estates.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {vendorExcellence.map((vendor) => (
                  <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <Badge className="bg-green-100 text-green-700 border-green-200 mb-3">
                            Vendor Excellence {vendor.date}
                          </Badge>
                          <h3 className="text-xl font-heading font-semibold text-foreground mb-1">
                            {vendor.name}
                          </h3>
                          <p className="text-[#A89F91] font-medium mb-1">{vendor.title}</p>
                          <p className="text-sm text-muted-foreground mb-3">{vendor.location}</p>
                          <p className="text-muted-foreground leading-relaxed">
                            {vendor.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="p-8 bg-[#A89F91]/5 border-[#A89F91]/20">
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Know Someone Deserving Recognition?
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                Nominate an exceptional professional or service provider for our recognition programs.
              </p>
              <Button 
                className="bg-[#A89F91] hover:bg-[#8A8279]"
                onClick={handleNominationClick}
              >
                Submit a Nomination
              </Button>
            </Card>
          </div>

          {/* Nomination Dialog */}
          <NominationDialog 
            isOpen={isNominationOpen} 
            onClose={() => setIsNominationOpen(false)} 
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Nomination Dialog Component
function NominationDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nomineeName: '',
    nomineeTitle: '',
    company: '',
    category: 'employee_of_month',
    reason: '',
    submitterName: user?.user_metadata?.full_name || '',
    submitterEmail: user?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomineeName || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const recognitionData = {
        nominee_name: formData.nomineeName,
        nominee_title: formData.nomineeTitle,
        company: formData.company,
        category: formData.category,
        reason: formData.reason,
        submitter_name: formData.submitterName,
        submitter_email: formData.submitterEmail,
        submitter_id: user?.id,
        status: 'pending',
      };

      const { error } = await supabase.from('recognitions').insert(recognitionData);

      if (error) throw error;

      // Send notification to user
      await emailNotifications.notifyRecognition({
        userEmail: formData.submitterEmail,
        userName: formData.submitterName,
        nomineeName: formData.nomineeName,
        category: formData.category,
      });

      // Send notification to admin
      await emailNotifications.notifyAdminRecognition(recognitionData);

      setIsSuccess(true);
      toast.success('Nomination submitted successfully!');
    } catch (error) {
      console.error('Error submitting nomination:', error);
      toast.error('Failed to submit nomination. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({
      nomineeName: '',
      nomineeTitle: '',
      company: '',
      category: 'employee_of_month',
      reason: '',
      submitterName: user?.user_metadata?.full_name || '',
      submitterEmail: user?.email || '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit a Nomination</DialogTitle>
          <DialogDescription>
            Nominate an exceptional professional for recognition
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nomination Submitted!</h3>
            <p className="text-muted-foreground mb-4">
              Thank you for recognizing excellence in the industry.
            </p>
            <Button onClick={handleClose} className="bg-[#A89F91] hover:bg-[#8A8279]">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nomineeName">Nominee Name *</Label>
              <Input
                id="nomineeName"
                value={formData.nomineeName}
                onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                placeholder="Enter nominee's full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="nomineeTitle">Title/Position</Label>
              <Input
                id="nomineeTitle"
                value={formData.nomineeTitle}
                onChange={(e) => setFormData({ ...formData, nomineeTitle: e.target.value })}
                placeholder="e.g., Estate Manager, Private Chef"
              />
            </div>

            <div>
              <Label htmlFor="company">Company/Property</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Where do they work?"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded-md p-2"
                required
              >
                <option value="employee_of_month">Employee of the Month</option>
                <option value="craft_excellence">Craft Excellence Award</option>
                <option value="vendor_excellence">Vendor Excellence</option>
                <option value="annual_award">Annual Excellence Award</option>
              </select>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Nomination *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Describe why this person deserves recognition..."
                rows={4}
                required
              />
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#A89F91] hover:bg-[#8A8279]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Nomination'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
