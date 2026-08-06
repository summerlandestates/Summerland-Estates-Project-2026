import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, DollarSign, Clock, Loader2, Briefcase, Users } from 'lucide-react';

interface JobFormData {
  jobTitle: string;
  jobDescription: string;
  jobCategory: string;
  location: string;
  salaryRange: string;
  employmentTypes: string[];
  daysRequired: string[];
  hoursPerWeek: string;
  hoursPerDay: string;
  startTime: string;
  endTime: string;
  scheduleNotes: string;
  weekendWorkRequired: boolean;
  eveningWorkRequired: boolean;
  overnightStaysRequired: boolean;
  onCallRequired: boolean;
  holidaysRequired: boolean;
  experienceRequired: string;
  qualifications: string;
  personalityFit: string;
  driversLicenseRequired: boolean;
  backgroundCheckRequired: boolean;
  referencesRequired: boolean;
  drugTestRequired: boolean;
  benefits: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  applicationInstructions: string;
  applicationDeadline: string;
  preferredStartDate: string;
  travelRequired: boolean;
  relocationAssistance: boolean;
}

export default function JobPostingPage() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Job form state
  const [jobForm, setJobForm] = useState<JobFormData>({
    jobTitle: '',
    jobDescription: '',
    jobCategory: '',
    location: '',
    salaryRange: '',
    employmentTypes: [],
    daysRequired: [],
    hoursPerWeek: '',
    hoursPerDay: '',
    startTime: '',
    endTime: '',
    scheduleNotes: '',
    weekendWorkRequired: false,
    eveningWorkRequired: false,
    overnightStaysRequired: false,
    onCallRequired: false,
    holidaysRequired: false,
    experienceRequired: '',
    qualifications: '',
    personalityFit: '',
    driversLicenseRequired: false,
    backgroundCheckRequired: false,
    referencesRequired: false,
    drugTestRequired: false,
    benefits: [],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    applicationInstructions: '',
    applicationDeadline: '',
    preferredStartDate: '',
    travelRequired: false,
    relocationAssistance: false,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Apply or sign in to post a placement', {
        description: 'Posting placements is available after membership approval.',
      });
      navigate('/add-listing');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('job_postings').insert({
        user_id: user.id,
        job_title: jobForm.jobTitle,
        job_description: jobForm.jobDescription,
        location: jobForm.location,
        salary_range: jobForm.salaryRange,
        employment_types: jobForm.employmentTypes,
        days_required: jobForm.daysRequired,
        hours_per_week: jobForm.hoursPerWeek ? parseInt(jobForm.hoursPerWeek) : null,
        hours_per_day: jobForm.hoursPerDay ? parseInt(jobForm.hoursPerDay) : null,
        start_time: jobForm.startTime || null,
        end_time: jobForm.endTime || null,
        schedule_notes: jobForm.scheduleNotes || null,
        weekend_work_required: jobForm.weekendWorkRequired,
        evening_work_required: jobForm.eveningWorkRequired,
        overnight_stays_required: jobForm.overnightStaysRequired,
        on_call_required: jobForm.onCallRequired,
        holidays_required: jobForm.holidaysRequired,
        experience_required: jobForm.experienceRequired || null,
        qualifications: jobForm.qualifications || null,
        personality_fit: jobForm.personalityFit || null,
        drivers_license_required: jobForm.driversLicenseRequired,
        background_check_required: jobForm.backgroundCheckRequired,
        references_required: jobForm.referencesRequired,
        drug_test_required: jobForm.drugTestRequired,
        benefits: jobForm.benefits,
        contact_name: jobForm.contactName,
        contact_email: jobForm.contactEmail,
        contact_phone: jobForm.contactPhone || null,
        application_instructions: jobForm.applicationInstructions || null,
        application_deadline: jobForm.applicationDeadline || null,
        preferred_start_date: jobForm.preferredStartDate || null,
        travel_required: jobForm.travelRequired,
        relocation_assistance: jobForm.relocationAssistance,
        status: 'active',
      });

      if (error) throw error;

      // Notify paid users whose profiles match the new job
      try {
        await fetch('/api/notify-job-matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            jobTitle: jobForm.jobTitle,
            jobDescription: jobForm.jobDescription,
            jobCategory: jobForm.jobCategory,
            location: jobForm.location
          })
        });
      } catch (err) {
        console.error('Failed to notify job matches:', err);
      }

      toast.success('Job Posted Successfully!', {
        description: 'Your job listing is now live and visible to candidates.',
      });
      navigate('/open-roles');
    } catch (error: any) {
      toast.error('Failed to post job', {
        description: error.message || 'Please try again',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEmploymentType = (type: string) => {
    setJobForm(prev => ({
      ...prev,
      employmentTypes: prev.employmentTypes.includes(type)
        ? prev.employmentTypes.filter(t => t !== type)
        : [...prev.employmentTypes, type]
    }));
  };

  const toggleDay = (day: string) => {
    setJobForm(prev => ({
      ...prev,
      daysRequired: prev.daysRequired.includes(day)
        ? prev.daysRequired.filter(d => d !== day)
        : [...prev.daysRequired, day]
    }));
  };

  const toggleBenefit = (benefit: string) => {
    setJobForm(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="jobs" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Post a Placement
            </h1>
            <p className="text-lg text-muted-foreground">
              Find the perfect candidate for your estate staffing needs
            </p>
          </div>

          <Card className="p-8 bg-card text-card-foreground">
            <form onSubmit={handlePostJob} className="space-y-8">
              {/* Job Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Job Details
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-foreground">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Estate Manager, Private Chef, Housekeeper"
                    required
                    value={jobForm.jobTitle}
                    onChange={(e) => setJobForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription" className="text-foreground">Job Description *</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                    rows={8}
                    required
                    value={jobForm.jobDescription}
                    onChange={(e) => setJobForm(prev => ({ ...prev, jobDescription: e.target.value }))}
                    className="bg-background text-foreground border-border"
                  />
                </div>
              </div>

              {/* Location & Compensation */}
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Location & Compensation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobLocation" className="text-foreground">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="jobLocation"
                        placeholder="City, State"
                        required
                        value={jobForm.location}
                        onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                        className="pl-10 bg-background text-foreground border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryRange" className="text-foreground">Salary Range *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="salaryRange"
                        placeholder="e.g., $80,000 - $120,000/year"
                        required
                        value={jobForm.salaryRange}
                        onChange={(e) => setJobForm(prev => ({ ...prev, salaryRange: e.target.value }))}
                        className="pl-10 bg-background text-foreground border-border"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Type */}
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Employment Type
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="fullTime" 
                      checked={jobForm.employmentTypes.includes('full-time')}
                      onCheckedChange={(checked) => {
                        setJobForm(prev => ({
                          ...prev,
                          employmentTypes: checked 
                            ? [...prev.employmentTypes, 'full-time']
                            : prev.employmentTypes.filter(t => t !== 'full-time')
                        }));
                      }}
                    />
                    <Label htmlFor="fullTime" className="text-foreground cursor-pointer">
                      Full-Time
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="partTime"
                      checked={jobForm.employmentTypes.includes('part-time')}
                      onCheckedChange={(checked) => {
                        setJobForm(prev => ({
                          ...prev,
                          employmentTypes: checked 
                            ? [...prev.employmentTypes, 'part-time']
                            : prev.employmentTypes.filter(t => t !== 'part-time')
                        }));
                      }}
                    />
                    <Label htmlFor="partTime" className="text-foreground cursor-pointer">
                      Part-Time
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="liveIn"
                      checked={jobForm.employmentTypes.includes('live-in')}
                      onCheckedChange={(checked) => {
                        setJobForm(prev => ({
                          ...prev,
                          employmentTypes: checked 
                            ? [...prev.employmentTypes, 'live-in']
                            : prev.employmentTypes.filter(t => t !== 'live-in')
                        }));
                      }}
                    />
                    <Label htmlFor="liveIn" className="text-foreground cursor-pointer">
                      Live-In
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="contract"
                      checked={jobForm.employmentTypes.includes('contract')}
                      onCheckedChange={(checked) => {
                        setJobForm(prev => ({
                          ...prev,
                          employmentTypes: checked 
                            ? [...prev.employmentTypes, 'contract']
                            : prev.employmentTypes.filter(t => t !== 'contract')
                        }));
                      }}
                    />
                    <Label htmlFor="contract" className="text-foreground cursor-pointer">
                      Contract
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="temporary"
                      checked={jobForm.employmentTypes.includes('temporary')}
                      onCheckedChange={(checked) => {
                        setJobForm(prev => ({
                          ...prev,
                          employmentTypes: checked 
                            ? [...prev.employmentTypes, 'temporary']
                            : prev.employmentTypes.filter(t => t !== 'temporary')
                        }));
                      }}
                    />
                    <Label htmlFor="temporary" className="text-foreground cursor-pointer">
                      Temporary
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remote"
                      checked={jobForm.employmentTypes.includes('remote')}
                      onCheckedChange={(checked) => {
                        setJobForm(prev => ({
                          ...prev,
                          employmentTypes: checked 
                            ? [...prev.employmentTypes, 'remote']
                            : prev.employmentTypes.filter(t => t !== 'remote')
                        }));
                      }}
                    />
                    <Label htmlFor="remote" className="text-foreground cursor-pointer">
                      Remote
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="holidays"
                      checked={jobForm.employmentTypes.includes('holidays')}
                      onCheckedChange={(checked) => {
                        setJobForm(prev => ({
                          ...prev,
                          employmentTypes: checked 
                            ? [...prev.employmentTypes, 'holidays']
                            : prev.employmentTypes.filter(t => t !== 'holidays')
                        }));
                      }}
                    />
                    <Label htmlFor="holidays" className="text-foreground cursor-pointer">
                      Holidays
                    </Label>
                  </div>
                </div>
              </div>

              {/* Schedule Requirements */}
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Schedule Requirements
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Days Required *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'flexible'].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox 
                            id={day}
                            checked={jobForm.daysRequired.includes(day)}
                            onCheckedChange={(checked) => {
                              setJobForm(prev => ({
                                ...prev,
                                daysRequired: checked 
                                  ? [...prev.daysRequired, day]
                                  : prev.daysRequired.filter(d => d !== day)
                              }));
                            }}
                          />
                          <Label htmlFor={day} className="text-foreground cursor-pointer capitalize">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hoursPerWeek" className="text-foreground">
                        Hours Per Week *
                      </Label>
                      <Input
                        id="hoursPerWeek"
                        type="number"
                        placeholder="e.g., 40"
                        required
                        value={jobForm.hoursPerWeek}
                        onChange={(e) => setJobForm(prev => ({ ...prev, hoursPerWeek: e.target.value }))}
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hoursPerDay" className="text-foreground">
                        Hours Per Day
                      </Label>
                      <Input
                        id="hoursPerDay"
                        type="number"
                        placeholder="e.g., 8"
                        value={jobForm.hoursPerDay}
                        onChange={(e) => setJobForm(prev => ({ ...prev, hoursPerDay: e.target.value }))}
                        className="bg-background text-foreground border-border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-foreground">
                        Typical Start Time
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={jobForm.startTime}
                        onChange={(e) => setJobForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-foreground">
                        Typical End Time
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={jobForm.endTime}
                        onChange={(e) => setJobForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="bg-background text-foreground border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduleNotes" className="text-foreground">
                      Schedule Notes
                    </Label>
                    <Textarea
                      id="scheduleNotes"
                      placeholder="Any additional schedule details, flexibility requirements, or special considerations..."
                      rows={3}
                      value={jobForm.scheduleNotes}
                      onChange={(e) => setJobForm(prev => ({ ...prev, scheduleNotes: e.target.value }))}
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="weekendWork"
                        checked={jobForm.weekendWorkRequired}
                        onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, weekendWorkRequired: !!checked }))}
                      />
                      <Label htmlFor="weekendWork" className="text-foreground cursor-pointer">
                        Weekend Work Required
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="eveningWork"
                        checked={jobForm.eveningWorkRequired}
                        onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, eveningWorkRequired: !!checked }))}
                      />
                      <Label htmlFor="eveningWork" className="text-foreground cursor-pointer">
                        Evening Work Required
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="overnightStays"
                        checked={jobForm.overnightStaysRequired}
                        onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, overnightStaysRequired: !!checked }))}
                      />
                      <Label htmlFor="overnightStays" className="text-foreground cursor-pointer">
                        Overnight Stays Required
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="onCall"
                        checked={jobForm.onCallRequired}
                        onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, onCallRequired: !!checked }))}
                      />
                      <Label htmlFor="onCall" className="text-foreground cursor-pointer">
                        On-Call Availability Required
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="holidays"
                        checked={jobForm.holidaysRequired}
                        onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, holidaysRequired: !!checked }))}
                      />
                      <Label htmlFor="holidays" className="text-foreground cursor-pointer">
                        Holidays Required
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Requirements
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-foreground">Years of Experience Required</Label>
                  <Select 
                    value={jobForm.experienceRequired} 
                    onValueChange={(value) => setJobForm(prev => ({ ...prev, experienceRequired: value }))}
                  >
                    <SelectTrigger className="bg-background text-foreground border-border">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground">
                      <SelectItem value="0-2 years" className="text-foreground cursor-pointer">0-2 years</SelectItem>
                      <SelectItem value="3-5 years" className="text-foreground cursor-pointer">3-5 years</SelectItem>
                      <SelectItem value="6-10 years" className="text-foreground cursor-pointer">6-10 years</SelectItem>
                      <SelectItem value="10+ years" className="text-foreground cursor-pointer">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications" className="text-foreground">Required Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    placeholder="List required skills, certifications, education, etc. (one per line)"
                    rows={5}
                    value={jobForm.qualifications}
                    onChange={(e) => setJobForm(prev => ({ ...prev, qualifications: e.target.value }))}
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalityFit" className="text-foreground">Personality Fit</Label>
                  <Textarea
                    id="personalityFit"
                    placeholder="Describe the ideal personality traits, work style, and cultural fit for this role..."
                    rows={4}
                    value={jobForm.personalityFit}
                    onChange={(e) => setJobForm(prev => ({ ...prev, personalityFit: e.target.value }))}
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="driversLicense"
                      checked={jobForm.driversLicenseRequired}
                      onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, driversLicenseRequired: !!checked }))}
                    />
                    <Label htmlFor="driversLicense" className="text-foreground cursor-pointer">
                      Valid Driver's License Required
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="backgroundCheck"
                      checked={jobForm.backgroundCheckRequired}
                      onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, backgroundCheckRequired: !!checked }))}
                    />
                    <Label htmlFor="backgroundCheck" className="text-foreground cursor-pointer">
                      Background Check Required
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="references"
                      checked={jobForm.referencesRequired}
                      onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, referencesRequired: !!checked }))}
                    />
                    <Label htmlFor="references" className="text-foreground cursor-pointer">
                      References Required
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="drugTest"
                      checked={jobForm.drugTestRequired}
                      onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, drugTestRequired: !!checked }))}
                    />
                    <Label htmlFor="drugTest" className="text-foreground cursor-pointer">
                      Drug Test Required
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalityFit" className="text-foreground">
                    Personality Fit
                  </Label>
                  <Textarea
                    id="personalityFit"
                    placeholder="Describe the ideal personality traits for this role (e.g., detail-oriented, outgoing, calm under pressure, etc.)"
                    rows={3}
                    value={jobForm.personalityFit}
                    onChange={(e) => setJobForm(prev => ({ ...prev, personalityFit: e.target.value }))}
                    className="bg-background text-foreground border-border"
                  />
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Benefits Offered
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'health_insurance', label: 'Health Insurance' },
                    { id: 'retirement', label: '401(k) / Retirement Plan' },
                    { id: 'paid_time_off', label: 'Paid Time Off' },
                    { id: 'housing_provided', label: 'Housing Provided' },
                    { id: 'meals_provided', label: 'Meals Provided' },
                    { id: 'car_provided', label: 'Car Provided' },
                    { id: 'professional_development', label: 'Professional Development' },
                    { id: 'performance_bonus', label: 'Performance Bonus' },
                  ].map((benefit) => (
                    <div key={benefit.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={benefit.id}
                        checked={jobForm.benefits.includes(benefit.id)}
                        onCheckedChange={(checked) => {
                          setJobForm(prev => ({
                            ...prev,
                            benefits: checked 
                              ? [...prev.benefits, benefit.id]
                              : prev.benefits.filter(b => b !== benefit.id)
                          }));
                        }}
                      />
                      <Label htmlFor={benefit.id} className="text-foreground cursor-pointer">
                        {benefit.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName" className="text-foreground">Contact Name *</Label>
                    <Input
                      id="contactName"
                      placeholder="Your name"
                      required
                      value={jobForm.contactName}
                      onChange={(e) => setJobForm(prev => ({ ...prev, contactName: e.target.value }))}
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-foreground">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      value={jobForm.contactEmail}
                      onChange={(e) => setJobForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="bg-background text-foreground border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-foreground">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={jobForm.contactPhone}
                    onChange={(e) => setJobForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicationInstructions" className="text-foreground">
                    Application Instructions
                  </Label>
                  <Textarea
                    id="applicationInstructions"
                    placeholder="How should candidates apply? Include any specific instructions..."
                    rows={4}
                    value={jobForm.applicationInstructions}
                    onChange={(e) => setJobForm(prev => ({ ...prev, applicationInstructions: e.target.value }))}
                    className="bg-background text-foreground border-border"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Additional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredStartDate" className="text-foreground">Preferred Start Date</Label>
                    <Input
                      id="preferredStartDate"
                      type="date"
                      value={jobForm.preferredStartDate}
                      onChange={(e) => setJobForm(prev => ({ ...prev, preferredStartDate: e.target.value }))}
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applicationDeadline" className="text-foreground">Application Deadline</Label>
                    <Input
                      id="applicationDeadline"
                      type="date"
                      value={jobForm.applicationDeadline}
                      onChange={(e) => setJobForm(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                      className="bg-background text-foreground border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="travelRequired"
                      checked={jobForm.travelRequired}
                      onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, travelRequired: !!checked }))}
                    />
                    <Label htmlFor="travelRequired" className="text-foreground cursor-pointer">
                      Travel Required
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="relocationAssistance"
                      checked={jobForm.relocationAssistance}
                      onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, relocationAssistance: !!checked }))}
                    />
                    <Label htmlFor="relocationAssistance" className="text-foreground cursor-pointer">
                      Relocation Assistance Offered
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6 border-t border-border">
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Post Job Listing
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  By posting a job, you agree to our terms of service and privacy policy
                </p>
              </div>
            </form>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 bg-card text-card-foreground text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Reach Qualified Candidates
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect with verified professionals actively seeking estate positions
              </p>
            </Card>

            <Card className="p-6 bg-card text-card-foreground text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Quick & Easy
              </h3>
              <p className="text-sm text-muted-foreground">
                Post your job in minutes and start receiving applications immediately
              </p>
            </Card>

            <Card className="p-6 bg-card text-card-foreground text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Manage Applications
              </h3>
              <p className="text-sm text-muted-foreground">
                Review, filter, and communicate with candidates all in one place
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
