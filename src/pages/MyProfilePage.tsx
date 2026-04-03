import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import PersonalityAssessmentDialog from '@/components/PersonalityAssessmentDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  Link as LinkIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatPersonalitySummary, type PersonalityAssessmentResult } from '@/lib/personalityAssessment';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
  email_verified: boolean | null;
  application_data?: Record<string, any> | null;
}

const firstFilled = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const splitTokens = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => splitTokens(item))
      .filter((item, index, items) => items.indexOf(item) === index);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(/\r?\n|,|•|·|\|/)
    .map((token) => token.replace(/^\s*[-*]\s*/, '').trim())
    .filter(Boolean)
    .filter((token, index, items) => items.indexOf(token) === index);
};

const formatDisplayDate = (value?: string | null) => {
  if (!value) return 'Present';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

const formatJoinedDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const normalizeUrl = (value: string) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
};

export default function MyProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [fullName, setFullName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  
  // Delete profile states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'hired' | 'hired-details' | 'deleting'>('confirm');
  const [gotHired, setGotHired] = useState<boolean | null>(null);
  const [hiredByName, setHiredByName] = useState('');
  const [hiredByProfileLink, setHiredByProfileLink] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [personalityDialogOpen, setPersonalityDialogOpen] = useState(false);
  const [personalitySaving, setPersonalitySaving] = useState(false);
  const [personalityResult, setPersonalityResult] = useState<PersonalityAssessmentResult | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user, authLoading, navigate]);

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A89F91]"></div>
      </div>
    );
  }

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast.error('Error', {
        description: 'Failed to load profile',
      });
    } else {
      setProfile(data);
      setFullName(data.full_name || '');
      if (data.avatar_url) {
        setPreviewUrl(data.avatar_url);
      }
      setEmailVerified(data.email_verified || false);
      const storedPersonality = data.application_data?.personality_assessment;
      if (storedPersonality?.type) {
        setPersonalityResult(storedPersonality as PersonalityAssessmentResult);
      } else if (data.application_data?.personality_type && data.application_data?.personality) {
        setPersonalityResult({
          type: data.application_data.personality_type,
          headline: data.application_data.personality_headline || 'Assessment Result',
          summary: data.application_data.personality,
          workStyle: data.application_data.personality_work_style || 'Structured personality summary',
          strengths: typeof data.application_data.personality_strengths === 'string'
            ? data.application_data.personality_strengths.split(',').map((item: string) => item.trim()).filter(Boolean)
            : [],
          dimensions: {
            energy: 'Extrovert',
            information: 'Intuitive',
            decision: 'Thinking',
            structure: 'Judging',
          },
          scores: { energy: 0, information: 0, decision: 0, structure: 0 },
          completedAt: data.application_data.personality_completed_at || new Date().toISOString(),
        });
      } else {
        setPersonalityResult(null);
      }
    }
    setLoading(false);
  };

  const handleSavePersonality = async (result: PersonalityAssessmentResult) => {
    if (!user || !profile) return;

    setPersonalitySaving(true);

    try {
      const nextApplicationData = {
        ...(profile.application_data || {}),
        personality: formatPersonalitySummary(result),
        personality_type: result.type,
        personality_headline: result.headline,
        personality_work_style: result.workStyle,
        personality_strengths: result.strengths.join(', '),
        personality_completed_at: result.completedAt,
        personality_assessment: result,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          application_data: nextApplicationData,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile((current) => (current ? { ...current, application_data: nextApplicationData } : current));
      setPersonalityResult(result);
      setPersonalityDialogOpen(false);
      toast.success('Personality assessment saved', {
        description: `${result.type} - ${result.headline}`,
      });
    } catch (error: any) {
      toast.error('Unable to save assessment', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setPersonalitySaving(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!user) return;

    setSendingVerification(true);

    try {
      // Send verification email via Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email || '',
        options: {
          emailRedirectTo: `${window.location.origin}/my-profile?verified=true`,
        },
      });

      if (error) throw error;

      toast.success('Verification Email Sent!', {
        description: 'Check your inbox and click the verification link',
      });
    } catch (error: any) {
      toast.error('Failed to send verification email', {
        description: error.message || 'Please try again',
      });
    } finally {
      setSendingVerification(false);
    }
  };

  // Handle file selection for photo upload
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid File', { description: 'Please select an image file' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File Too Large', { description: 'Please select an image under 5MB' });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      let avatarUrl = profile?.avatar_url || null;

      // Upload new photo if selected
      if (selectedFile) {
        setUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, selectedFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
        setUploading(false);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile Updated!', {
        description: 'Your profile has been updated successfully',
      });
      setSelectedFile(null);
      fetchProfile();
    } catch (error: any) {
      toast.error('Update Failed', {
        description: error.message,
      });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const getInitials = (email: string, name: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setDeleteStep('confirm');
    setGotHired(null);
    setHiredByName('');
    setHiredByProfileLink('');
  };

  const handleDeleteConfirm = () => {
    setDeleteStep('hired');
  };

  const handleHiredResponse = (hired: boolean) => {
    setGotHired(hired);
    if (hired) {
      setDeleteStep('hired-details');
    } else {
      // Not hired, proceed to delete
      handleFinalDelete();
    }
  };

  const handleFinalDelete = async () => {
    if (!user) return;
    
    setDeleting(true);
    setDeleteStep('deleting');
    
    try {
      // If user got hired, log the hiring info
      if (gotHired && (hiredByName || hiredByProfileLink)) {
        await supabase.from('hiring_feedback').insert({
          user_id: user.id,
          hired_by_name: hiredByName || null,
          hired_by_profile_link: hiredByProfileLink || null,
          created_at: new Date().toISOString()
        });
      }

      // Delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Sign out the user
      await supabase.auth.signOut();
      
      toast.success('Account Deleted', {
        description: 'Your account has been successfully deleted.',
      });
      
      navigate('/');
    } catch (error: any) {
      toast.error('Delete Failed', {
        description: error.message || 'Failed to delete account. Please try again.',
      });
      setDeleteStep('confirm');
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteStep('confirm');
    setGotHired(null);
    setHiredByName('');
    setHiredByProfileLink('');
  };

  const applicationData = useMemo(
    () => ((profile?.application_data || {}) as Record<string, unknown>),
    [profile]
  );

  const displayName =
    fullName.trim() ||
    profile?.full_name ||
    (profile?.email ? profile.email.split('@')[0] : 'Summerland Member');
  const displayRole = firstFilled(applicationData.role, profile?.role, 'Summerland Member');
  const displaySummary = firstFilled(
    applicationData.bio,
    applicationData.individual_bio,
    applicationData.agency_bio,
    personalityResult?.summary,
    'Use this page to shape how your Summerland profile is presented to employers, households, and collaborators.'
  );
  const displayLocation = firstFilled(applicationData.location, applicationData.business_address);
  const displayPhone = firstFilled(applicationData.phone, applicationData.business_phone);
  const linkedinUrl = firstFilled(applicationData.linkedin_url, applicationData.linkedin);
  const websiteUrl = firstFilled(applicationData.website_url, applicationData.business_website);
  const portfolioUrl = firstFilled(applicationData.portfolio_url);
  const yearsExperience = firstFilled(applicationData.years_experience, applicationData.experience);
  const selectedTier = firstFilled(
    applicationData.selected_tier,
    applicationData.tier,
    applicationData.profile_type
  ).replace(/-/g, ' ');
  const workPreference = firstFilled(applicationData.work_preference);
  const availableDate = firstFilled(applicationData.available_date);
  const skills = splitTokens(applicationData.skills_summary || applicationData.skills);
  const languages = splitTokens(applicationData.languages);
  const certifications = splitTokens(
    applicationData.certifications || applicationData.other_certifications
  );
  const profileStats = [
    { label: 'Member Since', value: profile ? formatJoinedDate(profile.created_at) : '' },
    { label: 'Participation', value: selectedTier || 'Member' },
    { label: 'Experience', value: yearsExperience ? `${yearsExperience} years` : 'In progress' },
    { label: 'Availability', value: workPreference || availableDate || 'Shared on request' },
  ];

  const workHistory = [1, 2]
    .map((index) => ({
      title: firstFilled(applicationData[`work_title_${index}`]),
      employer: firstFilled(applicationData[`work_employer_${index}`]),
      start: firstFilled(applicationData[`work_start_${index}`]),
      end: firstFilled(applicationData[`work_end_${index}`]),
      description: firstFilled(applicationData[`work_description_${index}`]),
    }))
    .filter((item) => item.title || item.employer || item.description);

  const references = [1, 2]
    .map((index) => ({
      name: firstFilled(applicationData[`ref_name_${index}`]),
      phone: firstFilled(applicationData[`ref_phone_${index}`]),
      email: firstFilled(applicationData[`ref_email_${index}`]),
    }))
    .filter((item) => item.name || item.phone || item.email);

  const documentLabels = splitTokens(
    applicationData.recommendation_letters || applicationData.letters_of_rec
  )
    .map((item) => item.split('/').pop() || item)
    .slice(0, 3);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f1ea]">
        <NavBar currentPage="profile" />
        <main className="pt-40 pb-24">
          <div className="container mx-auto max-w-6xl px-5 md:px-10">
            <div className="flex items-center justify-center">
              <Loader2 className="h-9 w-9 animate-spin text-[#6d7662]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f6f1ea] page-transition">
      <NavBar currentPage="profile" />

      <main className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto max-w-6xl px-4 sm:px-5 md:px-8 lg:px-10">
          <Card className="overflow-hidden rounded-[26px] border border-[#d9cfc3] bg-white shadow-[0_24px_85px_rgba(62,60,52,0.08)] md:rounded-[34px]">
            <div className="relative overflow-hidden border-b border-[#e7ddd2] bg-[linear-gradient(180deg,#fcf9f4_0%,#f7f0e8_100%)]">
              <div className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-[#d8ccc0]/50 blur-3xl" />
              <div className="pointer-events-none absolute right-[-4.5rem] top-[-3rem] h-56 w-56 rounded-full bg-[#d7dfd0]/55 blur-3xl" />
              <div className="pointer-events-none absolute bottom-[-5rem] left-1/3 h-44 w-44 rounded-full bg-[#efe4d8]/70 blur-3xl" />
              <div className="grid gap-0 lg:grid-cols-[1.18fr_0.82fr]">
                <section className="relative z-10 p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="rounded-full bg-[#6d7662] px-4 py-1.5 text-white hover:bg-[#6d7662]">
                      My Profile
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-[#d1c7bb] bg-white/80 px-4 py-1.5 text-[#6d665f]">
                      {selectedTier || 'Community Member'}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/my-profile/edit')}
                      className="rounded-full border-[#d1c7bb] bg-white/85 px-4 py-1.5 text-[#4f4a43] hover:bg-[#5f6756]"
                    >
                      Edit Profile
                    </Button>
                  </div>

                  <div className="mt-5 max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[#8f877c]">
                      {displayRole}
                    </p>
                    <h1 className="mt-2 font-heading text-[clamp(2.7rem,8vw,5rem)] font-semibold leading-[0.92] tracking-tight text-[#25231f]">
                      {displayName}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-[#5f5951]">
                      {displayLocation && (
                        <span className="rounded-full border border-[#ddd2c5] bg-white/85 px-3 py-1.5">
                          {displayLocation}
                        </span>
                      )}
                      {yearsExperience && (
                        <span className="rounded-full border border-[#ddd2c5] bg-white/85 px-3 py-1.5">
                          {yearsExperience} years experience
                        </span>
                      )}
                      {(workPreference || availableDate) && (
                        <span className="rounded-full border border-[#ddd2c5] bg-white/85 px-3 py-1.5">
                          {workPreference || availableDate}
                        </span>
                      )}
                    </div>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5c564f] md:text-base">
                      {displaySummary}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
                    <div className="rounded-[28px] bg-[#b7a79f] px-6 py-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/80">
                        Executive Profile
                      </p>
                      <p className="mt-4 text-sm leading-7 text-white/95">
                        {personalityResult?.workStyle || displaySummary}
                      </p>
                      {skills.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-white/30 bg-white/12 px-3 py-1.5 text-xs text-white"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      {profileStats.map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-[22px] border border-[#e5d9cd] bg-white/92 px-4 py-4 shadow-sm"
                        >
                          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8d8478]">
                            {stat.label}
                          </p>
                          <p className="mt-2 text-sm font-medium text-[#23231f]">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <aside className="relative z-10 border-t border-[#e7ddd2] bg-white/80 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-8">
                  <div className="flex flex-col gap-6">
                    <div className="rounded-[30px] border border-[#e5d9cd] bg-[#f5ede3] p-5 shadow-[0_20px_45px_rgba(76,70,60,0.08)]">
                      <Avatar className="h-[260px] w-full rounded-[24px] border border-white/70 bg-white shadow-sm sm:h-[320px] lg:h-[360px]">
                        <AvatarImage src={previewUrl || undefined} className="object-cover" />
                        <AvatarFallback className="rounded-[24px] bg-[#6d7662] text-5xl text-white">
                          {getInitials(profile.email, profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="mt-4 rounded-[22px] bg-white/80 px-4 py-4 backdrop-blur-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8d8478]">
                          Profile Presence
                        </p>
                        <p className="mt-2 text-lg font-medium text-[#23231f]">{displayName}</p>
                        <p className="mt-1 text-sm text-[#6a645d]">{displayRole}</p>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-[#e5d9cd] bg-[#fffdf9] p-6">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8d8478]">
                          Contact Info
                        </p>
                        {emailVerified ? (
                          <Badge className="rounded-full bg-[#e5f4ea] text-[#2f7b4a] hover:bg-[#e5f4ea]">
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="rounded-full bg-[#fceaea] text-[#b64f4f] hover:bg-[#fceaea]">
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Not Verified
                          </Badge>
                        )}
                      </div>

                      <div className="mt-5 space-y-3 text-sm text-[#4e4a43]">
                        <div className="flex items-start gap-3 rounded-[18px] bg-[#faf6f1] px-4 py-3">
                          <Mail className="mt-1 h-4 w-4 text-[#6d7662]" />
                          <span className="break-all">{profile.email}</span>
                        </div>

                        {displayPhone && (
                          <div className="flex items-start gap-3 rounded-[18px] bg-[#faf6f1] px-4 py-3">
                            <Phone className="mt-1 h-4 w-4 text-[#6d7662]" />
                            <span>{displayPhone}</span>
                          </div>
                        )}

                        {displayLocation && (
                          <div className="flex items-start gap-3 rounded-[18px] bg-[#faf6f1] px-4 py-3">
                            <MapPin className="mt-1 h-4 w-4 text-[#6d7662]" />
                            <span>{displayLocation}</span>
                          </div>
                        )}

                        {linkedinUrl && (
                          <a
                            href={normalizeUrl(linkedinUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-start gap-3 rounded-[18px] bg-[#faf6f1] px-4 py-3 transition-colors hover:text-[#6d7662]"
                          >
                            <LinkIcon className="mt-1 h-4 w-4 text-[#6d7662]" />
                            <span className="break-all">{linkedinUrl}</span>
                          </a>
                        )}

                        {(websiteUrl || portfolioUrl) && (
                          <a
                            href={normalizeUrl(websiteUrl || portfolioUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-start gap-3 rounded-[18px] bg-[#faf6f1] px-4 py-3 transition-colors hover:text-[#6d7662]"
                          >
                            <LinkIcon className="mt-1 h-4 w-4 text-[#6d7662]" />
                            <span className="break-all">{websiteUrl || portfolioUrl}</span>
                          </a>
                        )}
                      </div>

                      {!emailVerified && (
                        <div className="mt-6 rounded-[22px] border border-[#dfe9dd] bg-[#f2f8f0] p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-4 w-4 text-[#6d7662]" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#23231f]">Verify your email</p>
                              <p className="mt-1 text-xs leading-5 text-[#5d6358]">
                                A verified badge makes your profile feel more trusted to employers and households.
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={handleSendVerificationEmail}
                            disabled={sendingVerification}
                            className="mt-4 w-full rounded-full bg-[#6d7662] text-white hover:bg-[#5f6756]"
                          >
                            {sendingVerification ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Verification Email'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
              <section className="border-b border-[#e7ddd2] p-6 sm:p-8 lg:border-r lg:p-10">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-[#6d7662]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8d8478]">
                      Career Journey
                    </p>
                    <h2 className="mt-2 font-heading text-3xl font-medium text-[#23231f]">
                      Work background
                    </h2>
                  </div>
                </div>

                <div className="mt-8 space-y-8">
                  {workHistory.length > 0 ? (
                    workHistory.map((entry, index) => (
                      <div
                        key={`${entry.title}-${entry.employer}-${index}`}
                        className="relative rounded-[26px] border border-[#ebe1d6] bg-[#fcfaf7] px-6 py-6 shadow-sm"
                      >
                        <span className="absolute left-6 top-0 h-10 w-px bg-[#ddd1c4]" />
                        <span className="absolute left-[21px] top-8 h-3.5 w-3.5 rounded-full bg-[#6d7662]" />
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8d8478]">
                          {formatDisplayDate(entry.start)}
                          {entry.start || entry.end ? ' - ' : ''}
                          {entry.end ? formatDisplayDate(entry.end) : 'Present'}
                        </p>
                        <h3 className="mt-3 font-heading text-2xl font-medium text-[#23231f]">
                          {entry.title || 'Professional Experience'}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-[#8c7f70]">
                          {entry.employer || 'Private household or employer'}
                        </p>
                        {entry.description && (
                          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4e4a43]">{entry.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-[#6b665f]">
                      Your completed application will populate this section with your recent work history.
                    </p>
                  )}
                </div>

                <div className="mt-10 border-t border-[#eee4d8] pt-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8d8478]">
                    Work References
                  </p>
                  {references.length > 0 ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {references.map((reference) => (
                        <div key={reference.name || reference.email} className="rounded-[22px] border border-[#ebe2d7] bg-[#fbf8f3] p-5">
                          <h3 className="font-heading text-xl font-medium text-[#23231f]">
                            {reference.name || 'Professional Reference'}
                          </h3>
                          <div className="mt-3 space-y-2 text-sm text-[#4e4a43]">
                            {reference.phone && <p>Phone: {reference.phone}</p>}
                            {reference.email && <p>Email: {reference.email}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-[#6b665f]">
                      References will appear here once they are included in your profile application.
                    </p>
                  )}
                </div>
              </section>

              <section className="border-b border-[#e7ddd2] bg-[#fdfaf6] p-6 sm:p-8 lg:p-10">
                <div className="grid gap-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8d8478]">
                      Expertise
                    </p>
                    <h2 className="mt-2 font-heading text-3xl font-medium text-[#23231f]">
                      Strengths & specialties
                    </h2>
                  </div>

                  <div className="grid gap-8">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8d8478]">
                        Skills & Strengths
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {skills.length > 0 ? (
                          skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-[#e4dbd0] bg-white px-3 py-1.5 text-sm text-[#4e4a43]"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm leading-6 text-[#6b665f]">
                            Add more detail to your application to highlight your strongest capabilities.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="rounded-[22px] border border-[#e8ddd1] bg-white p-5">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8d8478]">
                          Languages
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-[#4e4a43]">
                          {languages.length > 0 ? languages.join(', ') : 'Not specified yet'}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-[#e8ddd1] bg-white p-5">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8d8478]">
                          Certifications
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-[#4e4a43]">
                          {certifications.length > 0 ? certifications.join(', ') : 'No certifications listed yet'}
                        </p>
                      </div>
                    </div>

                    {(yearsExperience || workPreference || availableDate) && (
                      <div className="rounded-[24px] border border-[#e8ddd1] bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8d8478]">
                          Quick Snapshot
                        </p>
                        <div className="mt-4 space-y-3 text-sm text-[#4e4a43]">
                          {yearsExperience && (
                            <div className="flex items-center justify-between gap-4">
                              <span>Years of experience</span>
                              <span className="font-medium text-[#23231f]">{yearsExperience}</span>
                            </div>
                          )}
                          {workPreference && (
                            <div className="flex items-center justify-between gap-4">
                              <span>Work preference</span>
                              <span className="font-medium text-[#23231f]">{workPreference}</span>
                            </div>
                          )}
                          {availableDate && (
                            <div className="flex items-center justify-between gap-4">
                              <span>Available date</span>
                              <span className="font-medium text-[#23231f]">{availableDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {documentLabels.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8d8478]">
                          Uploaded Documents
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {documentLabels.map((documentName) => (
                            <span
                              key={documentName}
                              className="rounded-full border border-[#e4dbd0] bg-white px-3 py-1.5 text-xs text-[#4e4a43]"
                            >
                              {documentName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="rounded-[26px] border border-[#e8ddd1] bg-white p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8d8478]">
                            Personality Assessment
                          </p>
                          <h3 className="mt-2 font-heading text-2xl font-medium text-[#23231f]">
                            Work Style & Presence
                          </h3>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setPersonalityDialogOpen(true)}
                          className="rounded-full bg-[#6d7662] text-white hover:bg-[#5f6756]"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          {personalityResult ? 'Retake Assessment' : 'Take Assessment'}
                        </Button>
                      </div>

                      <div className="mt-6">
                        {personalityResult ? (
                          <>
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge className="rounded-full bg-[#b7a79f] px-4 py-1.5 text-white hover:bg-[#b7a79f]">
                                {personalityResult.type}
                              </Badge>
                              <Badge variant="outline" className="rounded-full border-[#d4cabf] px-4 py-1.5 text-[#5f5951]">
                                {personalityResult.headline}
                              </Badge>
                            </div>
                            <p className="mt-5 text-sm leading-7 text-[#4e4a43]">
                              {personalityResult.summary}
                            </p>
                            <p className="mt-4 text-sm leading-7 text-[#6b665f]">
                              {personalityResult.workStyle}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                              {personalityResult.strengths.map((strength) => (
                                <span
                                  key={strength}
                                  className="rounded-full border border-[#ded4c8] bg-[#faf7f3] px-3 py-1.5 text-xs text-[#4e4a43]"
                                >
                                  {strength}
                                </span>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="rounded-[22px] border border-dashed border-[#d7cdc0] bg-[#fcfaf7] p-5 text-sm leading-7 text-[#6b665f]">
                            No assessment saved yet. Completing the assessment adds a structured personality summary to your member profile.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.08fr_0.58fr]">
              <section id="profile-settings" className="p-6 sm:p-8 lg:border-r lg:border-[#e7ddd2] lg:p-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8d8478]">
                    Profile Settings
                  </p>
                  <h2 className="mt-2 font-heading text-3xl font-medium text-[#23231f]">
                    Refine your presentation
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6b665f]">
                    Keep your name and portrait current so your profile feels polished anywhere it appears across Summerland.
                  </p>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-[#4e4a43]">Full Name</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7] focus:border-[#6d7662] focus:ring-[#6d7662]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar-file" className="text-[#4e4a43]">Profile Photo</Label>
                    <Input
                      id="avatar-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7] focus:border-[#6d7662] focus:ring-[#6d7662]"
                    />
                    <p className="text-xs text-[#7d786f]">Upload a clean portrait or profile image up to 5MB.</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] border border-[#ebe2d7] bg-[#fbf8f3] p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 text-[#6d7662]" />
                      <div>
                        <p className="text-sm font-medium text-[#23231f]">Profile joined {formatJoinedDate(profile.created_at)}</p>
                        <p className="mt-1 text-xs text-[#6b665f]">
                          Save your details after updating your name or profile image.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-full bg-[#a79f91] px-6 text-white hover:bg-[#938877]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                  {uploading && (
                    <p className="mt-3 text-xs text-[#6b665f]">
                      Uploading your new profile photo...
                    </p>
                  )}
                </div>
              </section>

              <aside className="border-t border-[#e7ddd2] bg-[#fffaf7] p-6 sm:p-8 lg:border-t-0 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#b17a7a]">
                  Danger Zone
                </p>
                <h2 className="mt-2 font-heading text-3xl font-medium text-[#23231f]">
                  Delete account
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#6b665f]">
                  If you no longer want to keep your membership active, you can remove your account permanently from the platform.
                </p>

                <div className="mt-8 rounded-[24px] border border-[#efd8d8] bg-white p-5 shadow-sm">
                  <Button
                    variant="outline"
                    onClick={handleDeleteClick}
                    className="w-full rounded-full border-[#d79292] text-[#b64f4f] hover:bg-[#fff5f5]"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </aside>
            </div>
          </Card>
        </div>
      </main>

      <PersonalityAssessmentDialog
        open={personalityDialogOpen}
        onOpenChange={setPersonalityDialogOpen}
        initialResult={personalityResult}
        saving={personalitySaving}
        onComplete={handleSavePersonality}
      />

      {/* Delete Account Modal */}
      <Dialog open={showDeleteModal} onOpenChange={closeDeleteModal}>
        <DialogContent className="sm:max-w-md">
          {deleteStep === 'confirm' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your account? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:gap-0">
                <Button variant="outline" onClick={closeDeleteModal}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Delete My Account
                </Button>
              </DialogFooter>
            </>
          )}

          {deleteStep === 'hired' && (
            <>
              <DialogHeader>
                <DialogTitle>Did you get hired?</DialogTitle>
                <DialogDescription>
                  Before you go, we'd love to know if you found success on our platform.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-4 py-4">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleHiredResponse(true)}
                >
                  Yes, I got hired!
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleHiredResponse(false)}
                >
                  No
                </Button>
              </div>
            </>
          )}

          {deleteStep === 'hired-details' && (
            <>
              <DialogHeader>
                <DialogTitle>Congratulations! 🎉</DialogTitle>
                <DialogDescription>
                  We're thrilled you found success! Please share who hired you so we can celebrate.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="hired-by-name">Name of person/company who hired you</Label>
                  <Input
                    id="hired-by-name"
                    value={hiredByName}
                    onChange={(e) => setHiredByName(e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hired-by-link">Or link to their profile (optional)</Label>
                  <Input
                    id="hired-by-link"
                    value={hiredByProfileLink}
                    onChange={(e) => setHiredByProfileLink(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteStep('hired')}>
                  Back
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleFinalDelete}
                  disabled={!hiredByName && !hiredByProfileLink}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Submit & Delete Account
                </Button>
              </DialogFooter>
            </>
          )}

          {deleteStep === 'deleting' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-4" />
              <p className="text-gray-600">Deleting your account...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
