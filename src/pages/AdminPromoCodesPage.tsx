import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Gift, Copy, Plus, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  tier: string | null;
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminPromoCodesPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    tier: 'professional-pro',
    maxUses: 1,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (user) {
      loadPromoCodes();
    }
  }, [user]);

  const loadPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error: any) {
      toast.error('Failed to load promo codes', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    return 'PRO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setGenerating(true);
    try {
      const code = generateCode();
      const { data, error } = await supabase
        .from('promo_codes')
        .insert({
          code,
          description: formData.description || 'Free Pro Profile for 6 months',
          discount_type: 'free_pro_6months',
          tier: formData.tier,
          max_uses: formData.maxUses,
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Promo code created', { description: code });
      setPromoCodes([data, ...promoCodes]);
      setFormData({ description: '', tier: 'professional-pro', maxUses: 1 });
    } catch (error: any) {
      toast.error('Failed to create promo code', { description: error.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !currentActive })
        .eq('id', id);

      if (error) throw error;
      setPromoCodes(promoCodes.map(pc => pc.id === id ? { ...pc, is_active: !currentActive } : pc));
      toast.success('Promo code updated');
    } catch (error: any) {
      toast.error('Failed to update promo code', { description: error.message });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard');
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A89F91]"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
              Promo Codes
            </h1>
            <p className="text-gray-600">Create free pro profile promo codes for users.</p>
          </div>

          <Card className="mb-8 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#A89F91]" />
                Create New Promo Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePromoCode} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Free Pro for 6 months"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tier">Target Tier</Label>
                  <select
                    id="tier"
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="professional-pro">Professional Pro</option>
                    <option value="business-pro">Business Pro</option>
                    <option value="agency-pro">Agency Pro</option>
                    <option value="estates-pro">Estates Pro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min={1}
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="md:col-span-3">
                  <Button 
                    type="submit" 
                    className="bg-[#A89F91] hover:bg-[#8A8279]"
                    disabled={generating}
                  >
                    {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Generate Promo Code
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Active Promo Codes</CardTitle>
            </CardHeader>
            <CardContent>
              {promoCodes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No promo codes created yet.</p>
              ) : (
                <div className="space-y-4">
                  {promoCodes.map((pc) => (
                    <div key={pc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-lg">{pc.code}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(pc.code)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Badge className={pc.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {pc.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{pc.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Tier: {pc.tier} • Uses: {pc.used_count}/{pc.max_uses} • Expires: {pc.valid_until ? new Date(pc.valid_until).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(pc.id, pc.is_active)}
                      >
                        {pc.is_active ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        {pc.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
