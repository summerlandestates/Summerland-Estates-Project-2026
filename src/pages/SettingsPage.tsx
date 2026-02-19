import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, Shield, Trash2, AlertTriangle, Upload, Camera, Mail, CheckCircle2, XCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchEmailVerificationStatus();
    }
  }, [user]);

  const fetchEmailVerificationStatus = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('email_verified')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setEmailVerified(data.email_verified || false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setSendingVerification(true);

    try {
      // Use Supabase's built-in email verification
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email || '',
        options: {
          emailRedirectTo: `${window.location.origin}/settings?verified=true`,
        },
      });

      if (error) throw error;

      toast.success('Verification Email Sent!', {
        description: 'Check your inbox and click the verification link',
      });
    } catch (error: any) {
      toast.error('Failed to Send Email', {
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid File', {
          description: 'Please select an image file',
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File Too Large', {
          description: 'Please select an image under 5MB',
        });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Validation Error', {
        description: 'New passwords do not match',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Validation Error', {
        description: 'Password must be at least 6 characters',
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error('Update Failed', {
        description: error.message,
      });
    } else {
      toast.success('Password Updated!', {
        description: 'Your password has been changed successfully',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This will permanently delete all your data. Are you absolutely sure?'
    );

    if (!doubleConfirm) return;

    setDeleting(true);

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (error) {
      toast.error('Delete Failed', {
        description: error.message,
      });
      setDeleting(false);
    } else {
      toast.success('Account Deleted', {
        description: 'Your account has been permanently deleted',
      });
      await supabase.auth.signOut();
      navigate('/');
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      toast.error('No File Selected', {
        description: 'Please choose a photo to upload',
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Photo Updated!', {
        description: 'Your profile photo has been uploaded',
      });
      
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      toast.error('Upload Failed', {
        description: error.message || 'Failed to upload photo',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 page-transition">
      <NavBar currentPage="settings" />

      <main className="pt-48 pb-32">
        <div className="container mx-auto px-12 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-5xl font-heading font-bold text-gray-900 mb-4 tracking-tight">
              Account Settings
            </h1>
            <p className="text-xl text-gray-600">
              Manage your account security and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Verification */}
            <Card className={emailVerified ? "border-green-300 bg-green-50/50" : "border-orange-300 bg-orange-50/50"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Mail className="w-5 h-5 text-[#A89F91]" />
                  Email Verification
                  {emailVerified && (
                    <span className="ml-auto flex items-center gap-1 text-green-600 text-sm font-normal">
                      <CheckCircle2 className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                  {!emailVerified && (
                    <span className="ml-auto flex items-center gap-1 text-orange-600 text-sm font-normal">
                      <XCircle className="w-4 h-4" />
                      Not Verified
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {emailVerified 
                    ? 'Your email is verified and you have the verified badge' 
                    : 'Verify your email to get the verified badge'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!emailVerified ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-white border border-orange-200 rounded-lg">
                      <p className="text-sm text-gray-700 mb-4">
                        Click the button below to receive a verification link via email. Click the link in your email to verify.
                      </p>
                      <Button
                        onClick={handleSendVerificationEmail}
                        disabled={sendingVerification}
                        className="bg-[#A89F91] hover:bg-[#8A8279] text-white rounded-xl"
                      >
                        {sendingVerification ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Verification Email
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 text-green-700">
                      <CheckCircle2 className="w-6 h-6" />
                      <div>
                        <p className="font-semibold">Email Verified</p>
                        <p className="text-sm text-gray-600">You now have the verified badge on your profile</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Camera className="w-5 h-5 text-[#A89F91]" />
                  Profile Photo
                </CardTitle>
                <CardDescription className="text-gray-600">Upload or update your profile picture</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handlePhotoUpload(); }} className="space-y-4">
                  {/* Preview */}
                  {previewUrl && (
                    <div className="flex justify-center">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-[#A89F91]"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="photo-file" className="text-gray-700">Choose Photo</Label>
                    <Input
                      id="photo-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="border-gray-300 focus:border-[#A89F91] focus:ring-[#A89F91]"
                    />
                    <p className="text-sm text-gray-500">Select an image file (max 5MB)</p>
                  </div>
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="bg-[#A89F91] hover:bg-[#8A8279] text-white rounded-xl"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Update Photo
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Lock className="w-5 h-5 text-[#A89F91]" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-gray-600">Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-gray-700">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="border-gray-300 focus:border-[#A89F91] focus:ring-[#A89F91]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-gray-700">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="border-gray-300 focus:border-[#A89F91] focus:ring-[#A89F91]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-gray-700">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="border-gray-300 focus:border-[#A89F91] focus:ring-[#A89F91]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white rounded-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-gray-600">Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Delete Account</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete My Account
                        </>
                      )}
                    </Button>
                  </div>
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
