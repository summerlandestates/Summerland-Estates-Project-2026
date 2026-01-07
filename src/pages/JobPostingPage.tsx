import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, DollarSign, Clock, Users } from 'lucide-react';

type PostType = 'job' | 'service-request' | null;

export default function JobPostingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [postType, setPostType] = useState<PostType>(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    // Handle job posting
    alert('Job posted successfully!');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleSignUp = () => {
    setShowLoginModal(false);
    // Navigate to sign up page or show sign up modal
    alert('Redirecting to sign up...');
  };

  if (postType === null) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="jobs" />
        
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl">
            <div className="mb-12 text-center">
              <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
                Post a Job or Service Request
              </h1>
              <p className="text-lg text-muted-foreground">
                Choose the type of post you'd like to create
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-border hover:border-primary"
                onClick={() => setPostType('job')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
                    Job Posting
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Post a full-time, part-time, or contract position for estate staff
                  </p>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Create Job Posting
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-border hover:border-primary"
                onClick={() => setPostType('service-request')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
                    Service Request
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Request short-term or one-time services for your estate
                  </p>
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    Create Service Request
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (showLoginModal) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="jobs" />
        
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-md">
            <Card className="p-8 bg-card text-card-foreground">
              <h2 className="text-3xl font-heading font-bold text-foreground mb-2 text-center">
                Login Required
              </h2>
              <p className="text-muted-foreground mb-6 text-center">
                Please login to post a job listing
              </p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Login
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Don't have an account?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSignUp}
                    className="w-full border-border text-foreground hover:bg-muted"
                  >
                    Create Account
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowLoginModal(false)}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </form>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (postType === 'service-request') {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="jobs" />
        
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl">
            <Button
              variant="ghost"
              onClick={() => setPostType(null)}
              className="mb-8 text-foreground hover:bg-muted"
            >
              ← Back to Post Type Selection
            </Button>

            <div className="mb-12 text-center">
              <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
                Create Service Request
              </h1>
              <p className="text-lg text-muted-foreground">
                Request short-term or one-time services for your estate
              </p>
            </div>

            <Card className="p-8 bg-card text-card-foreground">
              <form onSubmit={handlePostJob} className="space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceNeeded" className="text-foreground">Service Needed *</Label>
                    <Input
                      id="serviceNeeded"
                      placeholder="e.g. Window Washing, Plumber, Event Staff"
                      required
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-foreground">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="City, neighborhood, or estate location"
                        required
                        className="pl-10 bg-background text-foreground border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateNeeded" className="text-foreground">Date Needed *</Label>
                    <Input
                      id="dateNeeded"
                      type="date"
                      required
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details" className="text-foreground">Details *</Label>
                    <Textarea
                      id="details"
                      placeholder="Describe the scope of work, size of property, timing, access details, etc."
                      rows={6}
                      required
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequests" className="text-foreground">Special Requests (Optional)</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Certifications, discretion, uniforms, experience, or other requirements"
                      rows={4}
                      className="bg-background text-foreground border-border"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Post Service Request
                  </Button>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Service providers will be able to submit private bids for your request
                  </p>
                </div>
              </form>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="jobs" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => setPostType(null)}
            className="mb-8 text-foreground hover:bg-muted"
          >
            ← Back to Post Type Selection
          </Button>

          <div className="mb-12 text-center">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Post a Job
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
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobCategory" className="text-foreground">Job Category *</Label>
                  <Select required>
                    <SelectTrigger className="bg-background text-foreground border-border">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground">
                      <SelectItem value="estate-management" className="text-foreground cursor-pointer">Estate Management</SelectItem>
                      <SelectItem value="culinary" className="text-foreground cursor-pointer">Culinary</SelectItem>
                      <SelectItem value="housekeeping" className="text-foreground cursor-pointer">Housekeeping</SelectItem>
                      <SelectItem value="childcare" className="text-foreground cursor-pointer">Childcare</SelectItem>
                      <SelectItem value="security" className="text-foreground cursor-pointer">Security</SelectItem>
                      <SelectItem value="maintenance" className="text-foreground cursor-pointer">Maintenance</SelectItem>
                      <SelectItem value="personal-assistant" className="text-foreground cursor-pointer">Personal Assistant</SelectItem>
                      <SelectItem value="chauffeur" className="text-foreground cursor-pointer">Chauffeur</SelectItem>
                      <SelectItem value="other" className="text-foreground cursor-pointer">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription" className="text-foreground">Job Description *</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                    rows={8}
                    required
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
                    <Label htmlFor="location" className="text-foreground">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="City, State"
                        required
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
                    <Checkbox id="fullTime" />
                    <Label htmlFor="fullTime" className="text-foreground cursor-pointer">
                      Full-Time
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="partTime" />
                    <Label htmlFor="partTime" className="text-foreground cursor-pointer">
                      Part-Time
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="liveIn" />
                    <Label htmlFor="liveIn" className="text-foreground cursor-pointer">
                      Live-In
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="contract" />
                    <Label htmlFor="contract" className="text-foreground cursor-pointer">
                      Contract
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="temporary" />
                    <Label htmlFor="temporary" className="text-foreground cursor-pointer">
                      Temporary
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
                      <div className="flex items-center space-x-2">
                        <Checkbox id="monday" />
                        <Label htmlFor="monday" className="text-foreground cursor-pointer">
                          Monday
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="tuesday" />
                        <Label htmlFor="tuesday" className="text-foreground cursor-pointer">
                          Tuesday
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="wednesday" />
                        <Label htmlFor="wednesday" className="text-foreground cursor-pointer">
                          Wednesday
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="thursday" />
                        <Label htmlFor="thursday" className="text-foreground cursor-pointer">
                          Thursday
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="friday" />
                        <Label htmlFor="friday" className="text-foreground cursor-pointer">
                          Friday
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="saturday" />
                        <Label htmlFor="saturday" className="text-foreground cursor-pointer">
                          Saturday
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="sunday" />
                        <Label htmlFor="sunday" className="text-foreground cursor-pointer">
                          Sunday
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="flexible" />
                        <Label htmlFor="flexible" className="text-foreground cursor-pointer">
                          Flexible
                        </Label>
                      </div>
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
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="weekendWork" />
                      <Label htmlFor="weekendWork" className="text-foreground cursor-pointer">
                        Weekend Work Required
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="eveningWork" />
                      <Label htmlFor="eveningWork" className="text-foreground cursor-pointer">
                        Evening Work Required
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="overnightStays" />
                      <Label htmlFor="overnightStays" className="text-foreground cursor-pointer">
                        Overnight Stays Required
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="onCall" />
                      <Label htmlFor="onCall" className="text-foreground cursor-pointer">
                        On-Call Availability Required
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
                  <Select>
                    <SelectTrigger className="bg-background text-foreground border-border">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground">
                      <SelectItem value="0-2" className="text-foreground cursor-pointer">0-2 years</SelectItem>
                      <SelectItem value="3-5" className="text-foreground cursor-pointer">3-5 years</SelectItem>
                      <SelectItem value="6-10" className="text-foreground cursor-pointer">6-10 years</SelectItem>
                      <SelectItem value="10+" className="text-foreground cursor-pointer">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications" className="text-foreground">Required Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    placeholder="List required skills, certifications, education, etc. (one per line)"
                    rows={5}
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="driversLicense" />
                    <Label htmlFor="driversLicense" className="text-foreground cursor-pointer">
                      Valid Driver's License Required
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="backgroundCheck" />
                    <Label htmlFor="backgroundCheck" className="text-foreground cursor-pointer">
                      Background Check Required
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="references" />
                    <Label htmlFor="references" className="text-foreground cursor-pointer">
                      References Required
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="drugTest" />
                    <Label htmlFor="drugTest" className="text-foreground cursor-pointer">
                      Drug Test Required
                    </Label>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Benefits Offered
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="healthInsurance" />
                    <Label htmlFor="healthInsurance" className="text-foreground cursor-pointer">
                      Health Insurance
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="retirement" />
                    <Label htmlFor="retirement" className="text-foreground cursor-pointer">
                      401(k) / Retirement Plan
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="paidTimeOff" />
                    <Label htmlFor="paidTimeOff" className="text-foreground cursor-pointer">
                      Paid Time Off
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="housingProvided" />
                    <Label htmlFor="housingProvided" className="text-foreground cursor-pointer">
                      Housing Provided
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="mealsProvided" />
                    <Label htmlFor="mealsProvided" className="text-foreground cursor-pointer">
                      Meals Provided
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="carProvided" />
                    <Label htmlFor="carProvided" className="text-foreground cursor-pointer">
                      Car Provided
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="professionalDevelopment" />
                    <Label htmlFor="professionalDevelopment" className="text-foreground cursor-pointer">
                      Professional Development
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="bonus" />
                    <Label htmlFor="bonus" className="text-foreground cursor-pointer">
                      Performance Bonus
                    </Label>
                  </div>
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
                    className="bg-background text-foreground border-border"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Additional Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-foreground">Desired Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo" className="text-foreground">
                    Additional Information
                  </Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any other details about the position, household, or requirements..."
                    rows={4}
                    className="bg-background text-foreground border-border"
                  />
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
