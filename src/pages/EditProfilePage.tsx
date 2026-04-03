import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Loader2, Save, Upload } from 'lucide-react';

interface ProfileRecord {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  application_data?: Record<string, unknown> | null;
}

const FIELD_KEYS = [
  'role',
  'bio',
  'location',
  'phone',
  'linkedin_url',
  'website_url',
  'portfolio_url',
  'years_experience',
  'available_date',
  'work_preference',
  'skills_summary',
  'languages',
  'certifications',
  'business_type',
  'service_type',
  'year_founded',
  'business_hours',
  'business_address',
  'business_phone',
  'rate_min',
  'rate_max',
  'work_title_1',
  'work_employer_1',
  'work_start_1',
  'work_end_1',
  'work_description_1',
  'work_title_2',
  'work_employer_2',
  'work_start_2',
  'work_end_2',
  'work_description_2',
  'ref_name_1',
  'ref_phone_1',
  'ref_email_1',
  'ref_name_2',
  'ref_phone_2',
  'ref_email_2',
  'other_certifications',
  'software_systems',
  'comfortable_with',
] as const;

type EditableFieldKey = (typeof FIELD_KEYS)[number];
type EditFormState = Record<EditableFieldKey, string>;

const createEmptyForm = (): EditFormState =>
  FIELD_KEYS.reduce((acc, key) => {
    acc[key] = '';
    return acc;
  }, {} as EditFormState);

const stringifyValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(', ');
  }
  return typeof value === 'string' ? value : '';
};

const getInitials = (email: string, name: string | null) => {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  return email.substring(0, 2).toUpperCase();
};

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [fullName, setFullName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState<EditFormState>(createEmptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, application_data')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        toast.error('Unable to load profile', {
          description: error.message,
        });
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      const nextForm = createEmptyForm();
      const applicationData = (data.application_data || {}) as Record<string, unknown>;

      FIELD_KEYS.forEach((key) => {
        nextForm[key] = stringifyValue(applicationData[key]);
      });

      setProfile(data);
      setForm(nextForm);
      setFullName(data.full_name || '');
      setPreviewUrl(data.avatar_url || null);
      setLoading(false);
    };

    fetchProfile();
  }, [authLoading, navigate, user]);

  const profileType = useMemo(
    () => stringifyValue(profile?.application_data?.profile_type),
    [profile]
  );

  const selectedTier = useMemo(
    () => stringifyValue(profile?.application_data?.selected_tier || profile?.application_data?.tier).replace(/-/g, ' '),
    [profile]
  );

  const updateField = (key: EditableFieldKey, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);

    try {
      let avatarUrl = profile.avatar_url;

      if (selectedFile) {
        setUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, selectedFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath);

        avatarUrl = publicUrl;
        setUploading(false);
      }

      const nextApplicationData: Record<string, unknown> = {
        ...(profile.application_data || {}),
      };

      FIELD_KEYS.forEach((key) => {
        nextApplicationData[key] = form[key].trim();
      });

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl,
          application_data: nextApplicationData,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile((current) =>
        current
          ? {
              ...current,
              full_name: fullName.trim(),
              avatar_url: avatarUrl,
              application_data: nextApplicationData,
            }
          : current
      );

      toast.success('Profile updated', {
        description: 'Your profile changes have been saved.',
      });
    } catch (error: any) {
      toast.error('Unable to save profile', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f1ea]">
        <NavBar currentPage="profile" />
        <main className="pt-32 pb-24">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#6d7662]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#f6f1ea]">
      <NavBar currentPage="profile" />

      <main className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden rounded-[28px] border border-[#d9cfc3] bg-white shadow-[0_24px_85px_rgba(62,60,52,0.08)]">
            <div className="border-b border-[#e8ddd1] bg-[linear-gradient(180deg,#fcf9f4_0%,#f7f0e8_100%)] px-6 py-6 sm:px-8 lg:px-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/my-profile')}
                    className="rounded-full border-[#d4c8bc] bg-white/80 px-4"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8d8478]">
                      Edit Profile
                    </p>
                    <h1 className="mt-2 font-heading text-4xl font-semibold text-[#23231f] sm:text-5xl">
                      Update your full profile
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#645e57]">
                      Edit your main profile details, professional information, work history, and references from one place.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 rounded-[22px] border border-white/70 bg-white shadow-sm">
                    <AvatarImage src={previewUrl || undefined} className="object-cover" />
                    <AvatarFallback className="rounded-[22px] bg-[#6d7662] text-xl text-white">
                      {getInitials(profile.email, fullName || profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm text-[#5f5951]">
                    <p className="font-medium text-[#23231f]">{profileType || 'Member profile'}</p>
                    <p className="mt-1 capitalize">{selectedTier || 'Community member'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10 px-6 py-8 sm:px-8 lg:px-10">
              <section className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-full-name">Full Name</Label>
                  <Input
                    id="edit-full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-avatar">Profile Photo</Label>
                  <Input
                    id="edit-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]"
                  />
                  <p className="text-xs text-[#7d786f]">{uploading ? 'Uploading photo...' : 'Upload a portrait image up to 5MB.'}</p>
                </div>
              </section>

              <section className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Role / Headline</Label>
                  <Input id="role" value={form.role} onChange={(e) => updateField('role', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location} onChange={(e) => updateField('location', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years-experience">Years of Experience</Label>
                  <Input id="years-experience" value={form.years_experience} onChange={(e) => updateField('years_experience', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin-url">LinkedIn URL</Label>
                  <Input id="linkedin-url" value={form.linkedin_url} onChange={(e) => updateField('linkedin_url', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website-url">Website URL</Label>
                  <Input id="website-url" value={form.website_url} onChange={(e) => updateField('website_url', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="portfolio-url">Portfolio URL</Label>
                  <Input id="portfolio-url" value={form.portfolio_url} onChange={(e) => updateField('portfolio_url', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea id="bio" value={form.bio} onChange={(e) => updateField('bio', e.target.value)} rows={5} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
              </section>

              <section className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="skills-summary">Skills Summary</Label>
                  <Textarea id="skills-summary" value={form.skills_summary} onChange={(e) => updateField('skills_summary', e.target.value)} rows={4} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages</Label>
                  <Textarea id="languages" value={form.languages} onChange={(e) => updateField('languages', e.target.value)} rows={4} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea id="certifications" value={form.certifications} onChange={(e) => updateField('certifications', e.target.value)} rows={4} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other-certifications">Additional Details</Label>
                  <Textarea id="other-certifications" value={form.other_certifications} onChange={(e) => updateField('other_certifications', e.target.value)} rows={4} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
              </section>

              <section className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="available-date">Available Date</Label>
                  <Input id="available-date" type="date" value={form.available_date} onChange={(e) => updateField('available_date', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work-preference">Work Preference</Label>
                  <Input id="work-preference" value={form.work_preference} onChange={(e) => updateField('work_preference', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-type">Business Type</Label>
                  <Input id="business-type" value={form.business_type} onChange={(e) => updateField('business_type', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-type">Service Type</Label>
                  <Input id="service-type" value={form.service_type} onChange={(e) => updateField('service_type', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year-founded">Year Founded</Label>
                  <Input id="year-founded" value={form.year_founded} onChange={(e) => updateField('year_founded', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-hours">Business Hours</Label>
                  <Input id="business-hours" value={form.business_hours} onChange={(e) => updateField('business_hours', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-address">Business Address</Label>
                  <Input id="business-address" value={form.business_address} onChange={(e) => updateField('business_address', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Business Phone</Label>
                  <Input id="business-phone" value={form.business_phone} onChange={(e) => updateField('business_phone', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-[#fcfaf7]" />
                </div>
              </section>

              <section className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[24px] border border-[#ebe2d7] bg-[#fbf8f3] p-5">
                  <h2 className="font-heading text-2xl font-medium text-[#23231f]">Work History 1</h2>
                  <div className="mt-5 space-y-4">
                    <Input placeholder="Job Title" value={form.work_title_1} onChange={(e) => updateField('work_title_1', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                    <Input placeholder="Employer" value={form.work_employer_1} onChange={(e) => updateField('work_employer_1', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="date" value={form.work_start_1} onChange={(e) => updateField('work_start_1', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                      <Input type="date" value={form.work_end_1} onChange={(e) => updateField('work_end_1', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                    </div>
                    <Textarea placeholder="Work description" value={form.work_description_1} onChange={(e) => updateField('work_description_1', e.target.value)} rows={4} className="rounded-2xl border-[#d9cfc3] bg-white" />
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#ebe2d7] bg-[#fbf8f3] p-5">
                  <h2 className="font-heading text-2xl font-medium text-[#23231f]">Work History 2</h2>
                  <div className="mt-5 space-y-4">
                    <Input placeholder="Job Title" value={form.work_title_2} onChange={(e) => updateField('work_title_2', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                    <Input placeholder="Employer" value={form.work_employer_2} onChange={(e) => updateField('work_employer_2', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="date" value={form.work_start_2} onChange={(e) => updateField('work_start_2', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                      <Input type="date" value={form.work_end_2} onChange={(e) => updateField('work_end_2', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                    </div>
                    <Textarea placeholder="Work description" value={form.work_description_2} onChange={(e) => updateField('work_description_2', e.target.value)} rows={4} className="rounded-2xl border-[#d9cfc3] bg-white" />
                  </div>
                </div>
              </section>

              <section className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[24px] border border-[#ebe2d7] bg-[#fbf8f3] p-5">
                  <h2 className="font-heading text-2xl font-medium text-[#23231f]">Reference 1</h2>
                  <div className="mt-5 space-y-4">
                    <Input placeholder="Reference Name" value={form.ref_name_1} onChange={(e) => updateField('ref_name_1', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                    <Input placeholder="Reference Phone" value={form.ref_phone_1} onChange={(e) => updateField('ref_phone_1', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                    <Input placeholder="Reference Email" value={form.ref_email_1} onChange={(e) => updateField('ref_email_1', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#ebe2d7] bg-[#fbf8f3] p-5">
                  <h2 className="font-heading text-2xl font-medium text-[#23231f]">Reference 2</h2>
                  <div className="mt-5 space-y-4">
                    <Input placeholder="Reference Name" value={form.ref_name_2} onChange={(e) => updateField('ref_name_2', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                    <Input placeholder="Reference Phone" value={form.ref_phone_2} onChange={(e) => updateField('ref_phone_2', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                    <Input placeholder="Reference Email" value={form.ref_email_2} onChange={(e) => updateField('ref_email_2', e.target.value)} className="rounded-2xl border-[#d9cfc3] bg-white" />
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-4 border-t border-[#ebe2d7] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-[#6a645d]">
                  Make your changes here and save to update the live profile.
                </div>
                <Button onClick={handleSave} disabled={saving} className="rounded-full bg-[#6d7662] px-7 text-white hover:bg-[#5f6756]">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
