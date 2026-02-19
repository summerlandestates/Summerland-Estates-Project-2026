import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar,
  Mail,
  Phone,
  User,
  Building2,
  Loader2
} from 'lucide-react';

interface JobPosting {
  id: string;
  job_title: string;
  job_category: string;
  job_description: string;
  location: string;
  salary_range: string;
  employment_types: string[];
  days_required: string[];
  hours_per_week: number | null;
  hours_per_day: number | null;
  start_time: string | null;
  end_time: string | null;
  schedule_notes: string | null;
  weekend_work_required: boolean;
  evening_work_required: boolean;
  overnight_stays_required: boolean;
  on_call_required: boolean;
  experience_required: string | null;
  qualifications: string | null;
  drivers_license_required: boolean;
  background_check_required: boolean;
  references_required: boolean;
  drug_test_required: boolean;
  benefits: string[];
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  application_instructions: string | null;
  application_deadline: string | null;
  preferred_start_date: string | null;
  travel_required: boolean;
  relocation_assistance: boolean;
  created_at: string;
  user_id: string;
  status: string;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEmploymentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'full-time': 'bg-green-100 text-green-700',
      'part-time': 'bg-blue-100 text-blue-700',
      'contract': 'bg-purple-100 text-purple-700',
      'temporary': 'bg-orange-100 text-orange-700',
      'live-in': 'bg-pink-100 text-pink-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Job Not Found</h1>
            <p className="text-muted-foreground mb-6">This job posting may have been removed or is no longer available.</p>
            <Button onClick={() => navigate('/open-roles')} className="bg-[#A89F91] hover:bg-[#8A8279] text-white">
              Browse All Jobs
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/open-roles')}
            variant="ghost"
            className="mb-6 text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Open Roles
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card className="p-8 bg-white border border-gray-100 rounded-2xl shadow-lg">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-8 h-8 text-[#A89F91]" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                      {job.job_title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {job.salary_range}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Employment Types */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-[#A89F91]/10 text-[#A89F91] border-0">
                    {job.job_category}
                  </Badge>
                  {job.employment_types?.map((type, idx) => (
                    <Badge key={idx} className={`${getEmploymentTypeBadge(type)} border-0`}>
                      {type.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>

                {/* Posted Date */}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Posted on {formatDate(job.created_at)}
                </div>
              </Card>

              {/* Job Description */}
              <Card className="p-8 bg-white border border-gray-100 rounded-2xl shadow-lg">
                <h2 className="text-xl font-heading font-bold text-foreground mb-4 pb-3 border-b border-gray-100">
                  Job Description
                </h2>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {job.job_description}
                </p>
              </Card>

              {/* Schedule & Hours */}
              <Card className="p-8 bg-white border border-gray-100 rounded-2xl shadow-lg">
                <h2 className="text-xl font-heading font-bold text-foreground mb-4 pb-3 border-b border-gray-100">
                  Schedule & Hours
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Hours per Week</span>
                      <span className="font-medium">{job.hours_per_week || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Hours per Day</span>
                      <span className="font-medium">{job.hours_per_day || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Start Time</span>
                      <span className="font-medium">{job.start_time || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">End Time</span>
                      <span className="font-medium">{job.end_time || 'Flexible'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Weekend Work</span>
                      <span className={`font-medium ${job.weekend_work_required ? 'text-orange-600' : 'text-green-600'}`}>
                        {job.weekend_work_required ? 'Required' : 'Not Required'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Evening Work</span>
                      <span className={`font-medium ${job.evening_work_required ? 'text-orange-600' : 'text-green-600'}`}>
                        {job.evening_work_required ? 'Required' : 'Not Required'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Overnight Stays</span>
                      <span className={`font-medium ${job.overnight_stays_required ? 'text-orange-600' : 'text-green-600'}`}>
                        {job.overnight_stays_required ? 'Required' : 'Not Required'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">On-Call</span>
                      <span className={`font-medium ${job.on_call_required ? 'text-orange-600' : 'text-green-600'}`}>
                        {job.on_call_required ? 'Required' : 'Not Required'}
                      </span>
                    </div>
                  </div>
                </div>
                {job.days_required && job.days_required.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="font-medium mb-2">Days Required:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.days_required.map((day, idx) => (
                        <Badge key={idx} className="bg-[#A89F91]/10 text-[#A89F91] border-0 capitalize">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {job.schedule_notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="font-medium mb-2">Schedule Notes:</p>
                    <p className="text-muted-foreground">{job.schedule_notes}</p>
                  </div>
                )}
              </Card>

              {/* Requirements */}
              <Card className="p-8 bg-white border border-gray-100 rounded-2xl shadow-lg">
                <h2 className="text-xl font-heading font-bold text-foreground mb-4 pb-3 border-b border-gray-100">
                  Requirements
                </h2>
                <div className="space-y-4">
                  {/* Experience */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-muted-foreground">Experience Required</span>
                    <span className="font-medium">{job.experience_required || 'Not specified'}</span>
                  </div>
                  
                  {/* Qualifications */}
                  {job.qualifications && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-muted-foreground mb-1">Qualifications</p>
                      <p className="font-medium">{job.qualifications}</p>
                    </div>
                  )}
                  
                  {/* Requirement Checks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Driver's License</span>
                      <span className={`font-medium ${job.drivers_license_required ? 'text-orange-600' : 'text-green-600'}`}>
                        {job.drivers_license_required ? 'Required' : 'Not Required'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Background Check</span>
                      <span className={`font-medium ${job.background_check_required ? 'text-orange-600' : 'text-green-600'}`}>
                        {job.background_check_required ? 'Required' : 'Not Required'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">References</span>
                      <span className={`font-medium ${job.references_required ? 'text-orange-600' : 'text-green-600'}`}>
                        {job.references_required ? 'Required' : 'Not Required'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Drug Test</span>
                      <span className={`font-medium ${job.drug_test_required ? 'text-orange-600' : 'text-green-600'}`}>
                        {job.drug_test_required ? 'Required' : 'Not Required'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Benefits */}
              {job.benefits?.length > 0 && (
                <Card className="p-8 bg-white border border-gray-100 rounded-2xl shadow-lg">
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4 pb-3 border-b border-gray-100">
                    Benefits
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-700 border-0 capitalize">
                        {benefit.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-6">
                {/* Apply Card */}
                <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                    Apply for this Position
                  </h3>
                  <Button 
                    className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white mb-4"
                    onClick={() => {
                      const subject = encodeURIComponent(`Application for ${job.job_title}`);
                      const body = encodeURIComponent(`Dear ${job.contact_name},\n\nI am writing to express my interest in the ${job.job_title} position at ${job.location}.\n\n[Please include your relevant experience and qualifications here]\n\nThank you for considering my application.\n\nBest regards,\n[Your Name]`);
                      window.location.href = `mailto:${job.contact_email}?subject=${subject}&body=${body}`;
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                  
                  {job.application_deadline && (
                    <p className="text-sm text-muted-foreground text-center">
                      Application deadline: {formatDate(job.application_deadline)}
                    </p>
                  )}
                </Card>

                {/* Contact Info */}
                <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {job.contact_name && (
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-3 text-[#A89F91]" />
                        <span className="text-foreground">{job.contact_name}</span>
                      </div>
                    )}
                    {job.contact_email && (
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 mr-3 text-[#A89F91]" />
                        <a href={`mailto:${job.contact_email}`} className="text-[#A89F91] hover:underline break-all">
                          {job.contact_email}
                        </a>
                      </div>
                    )}
                    {job.contact_phone && (
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 mr-3 text-[#A89F91]" />
                        <a href={`tel:${job.contact_phone}`} className="text-[#A89F91] hover:underline">
                          {job.contact_phone}
                        </a>
                      </div>
                    )}
                    {!job.contact_name && !job.contact_email && !job.contact_phone && (
                      <p className="text-muted-foreground text-sm">No contact information provided</p>
                    )}
                  </div>
                </Card>

                {/* Additional Info */}
                <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                    Additional Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    {job.preferred_start_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preferred Start:</span>
                        <span>{formatDate(job.preferred_start_date)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Travel Required:</span>
                      <span>{job.travel_required ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Relocation Assistance:</span>
                      <span>{job.relocation_assistance ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </Card>

                {/* Application Instructions */}
                {job.application_instructions && (
                  <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                      How to Apply
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {job.application_instructions}
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
