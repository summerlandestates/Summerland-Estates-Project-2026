import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Calendar, Shield, Loader2, Save, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
  email_verified: boolean | null;
}

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

  if (!user) {
    return null;
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
    }
    setLoading(false);
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
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="profile" />
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-4xl">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
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
    <div className="min-h-screen bg-gray-50 page-transition">
      <NavBar currentPage="profile" />

      <main className="pt-48 pb-32">
        <div className="container mx-auto px-12 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-5xl font-heading font-bold text-gray-900 mb-4 tracking-tight">
              My Profile
            </h1>
            <p className="text-xl text-gray-600">
              Manage your personal information
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <Card className="lg:col-span-1 border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Profile Photo</CardTitle>
                <CardDescription className="text-gray-600">Update your profile picture</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-6">
                  <AvatarImage src={previewUrl || undefined} />
                  <AvatarFallback className="bg-[#A89F91] text-white text-2xl">
                    {profile && getInitials(profile.email, profile.full_name)}
                  </AvatarFallback>
                </Avatar>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="lg:col-span-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Personal Information</CardTitle>
                <CardDescription className="text-gray-600">Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-700">Email Address</Label>
                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <Mail className="w-5 h-5 text-[#A89F91]" />
                    <span className="text-gray-900">{profile?.email}</span>
                    {emailVerified ? (
                      <Badge className="ml-auto bg-green-100 text-green-700 border-green-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="ml-auto bg-red-100 text-red-700 border-red-300 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Not Verified
                      </Badge>
                    )}
                  </div>
                  {!emailVerified && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-green-800 font-medium">Email not verified</p>
                        <p className="text-xs text-green-600">Verify your email to get a verified badge on your profile</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleSendVerificationEmail}
                        disabled={sendingVerification}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {sendingVerification ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Verify Email'
                        )}
                      </Button>
                    </div>
                  )}
                  {emailVerified && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Your email is verified - You have a verified badge on your profile
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full-name" className="text-gray-700">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="border-gray-300 focus:border-[#A89F91] focus:ring-[#A89F91]"
                  />
                </div>

                <div className="w-full space-y-2">
                  <Label htmlFor="avatar-file" className="text-gray-700">Upload Photo</Label>
                  <Input
                    id="avatar-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="border-gray-300 focus:border-[#A89F91] focus:ring-[#A89F91]"
                  />
                  <p className="text-sm text-gray-500">Select an image file (max 5MB)</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white rounded-xl"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
