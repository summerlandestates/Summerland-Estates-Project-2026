import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface AdminJobEditPageProps {
  type: 'job' | 'service';
}

interface JobForm {
  job_title: string;
  job_category: string;
  job_description: string;
  location: string;
  is_remote: boolean;
  employment_types: string[];
  salary_range: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  application_instructions: string;
  status: string;
}

interface ServiceForm {
  service_needed: string;
  details: string;
  location: string;
  date_needed: string;
  budget_min: string;
  budget_max: string;
  special_requests: string;
  status: string;
}

const JOB_STATUSES = [
  { value: 'active', label: 'Published' },
  { value: 'closed', label: 'Closed' },
];

const SERVICE_STATUSES = [
  { value: 'open', label: 'Published' },
  { value: 'closed', label: 'Closed' },
];

export default function AdminJobEditPage({ type }: AdminJobEditPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [jobForm, setJobForm] = useState<JobForm>({
    job_title: '',
    job_category: '',
    job_description: '',
    location: '',
    is_remote: false,
    employment_types: [],
    salary_range: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    application_instructions: '',
    status: 'active',
  });
  const [serviceForm, setServiceForm] = useState<ServiceForm>({
    service_needed: '',
    details: '',
    location: '',
    date_needed: '',
    budget_min: '',
    budget_max: '',
    special_requests: '',
    status: 'open',
  });

  const isJob = type === 'job';
  const table = isJob ? 'job_postings' : 'service_requests';
  const label = isJob ? 'Job Posting' : 'Service Request';

  useEffect(() => {
    if (authLoading) return;
    checkAdminAndLoad();
  }, [authLoading, user, id]);

  const checkAdminAndLoad = async () => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      toast.error('Access Denied', { description: 'You do not have admin privileges' });
      navigate('/');
      return;
    }

    await loadRecord();
  };

  const loadRecord = async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setNotFound(true);
        return;
      }

      if (isJob) {
        setJobForm({
          job_title: data.job_title || '',
          job_category: data.job_category || '',
          job_description: data.job_description || '',
          location: data.location || '',
          is_remote: Array.isArray(data.employment_types)
            ? data.employment_types.includes('remote')
            : data.location === 'Remote',
          employment_types: Array.isArray(data.employment_types) ? data.employment_types : [],
          salary_range: data.salary_range || '',
          contact_name: data.contact_name || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          application_instructions: data.application_instructions || '',
          status: data.status || 'active',
        });
      } else {
        setServiceForm({
          service_needed: data.service_needed || '',
          details: data.details || '',
          location: data.location || '',
          date_needed: data.date_needed ? String(data.date_needed).slice(0, 10) : '',
          budget_min: data.budget_min != null ? String(data.budget_min) : '',
          budget_max: data.budget_max != null ? String(data.budget_max) : '',
          special_requests: data.special_requests || '',
          status: data.status || 'open',
        });
      }
    } catch (error) {
      console.error(`Error loading ${label}:`, error);
      toast.error(`Failed to load ${label.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (isJob) {
      if (!jobForm.job_title.trim() || !jobForm.job_description.trim()) {
        toast.error('Job title and description are required');
        return;
      }
      if (!jobForm.contact_name.trim() || !jobForm.contact_email.trim()) {
        toast.error('Contact name and email are required');
        return;
      }
    } else {
      if (!serviceForm.service_needed.trim()) {
        toast.error('Service needed is required');
        return;
      }
    }

    setSaving(true);
    try {
      let payload: Record<string, unknown>;
      if (isJob) {
        const types = new Set(jobForm.employment_types);
        if (jobForm.is_remote) types.add('remote'); else types.delete('remote');
        payload = {
          job_title: jobForm.job_title.trim(),
          job_category: jobForm.job_category.trim() || 'General',
          job_description: jobForm.job_description.trim(),
          location: jobForm.is_remote ? 'Remote' : jobForm.location.trim() || 'Not specified',
          employment_types: [...types],
          salary_range: jobForm.salary_range.trim() || 'Negotiable',
          contact_name: jobForm.contact_name.trim(),
          contact_email: jobForm.contact_email.trim(),
          contact_phone: jobForm.contact_phone.trim() || null,
          application_instructions: jobForm.application_instructions.trim() || null,
          status: jobForm.status,
        };
      } else {
        payload = {
          service_needed: serviceForm.service_needed.trim(),
          details: serviceForm.details.trim() || null,
          location: serviceForm.location.trim() || null,
          date_needed: serviceForm.date_needed || null,
          budget_min: serviceForm.budget_min ? parseFloat(serviceForm.budget_min) : null,
          budget_max: serviceForm.budget_max ? parseFloat(serviceForm.budget_max) : null,
          special_requests: serviceForm.special_requests.trim() || null,
          status: serviceForm.status,
        };
      }

      // Tolerate schema drift: if the DB reports an unknown column, drop it and retry.
      let updateError: { message?: string } | null = null;
      for (let i = 0; i < 10; i++) {
        const { error } = await supabase.from(table).update(payload).eq('id', id);
        if (!error) {
          updateError = null;
          break;
        }
        updateError = error;
        const missingCol = /Could not find the '([^']+)' column/i.exec(error.message || '')?.[1];
        if (!missingCol || !(missingCol in payload)) break;
        delete payload[missingCol];
      }
      if (updateError) throw updateError;

      toast.success(`${label} updated successfully`);
      navigate('/admin/jobs');
    } catch (error) {
      console.error(`Error updating ${label}:`, error);
      toast.error(`Failed to update ${label.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <Card className="p-12 text-center bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{label} Not Found</h3>
        <p className="text-gray-500 mb-4">This {label.toLowerCase()} may have been deleted.</p>
        <Button onClick={() => navigate('/admin/jobs')} className="bg-[#A89F91] hover:bg-[#8A8279] text-white">
          Back to Jobs &amp; Services
        </Button>
      </Card>
    );
  }

  const statusOptions = isJob ? JOB_STATUSES : SERVICE_STATUSES;

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/jobs')}
        className="mb-4 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs &amp; Services
      </Button>

      <Card className="p-6 bg-white max-w-3xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit {label}</h2>

        <form onSubmit={handleSave} className="space-y-5">
          {isJob ? (
            <>
              <div>
                <Label htmlFor="job_title">Job Title *</Label>
                <Input
                  id="job_title"
                  value={jobForm.job_title}
                  onChange={(e) => setJobForm({ ...jobForm, job_title: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="job_category">Job Category</Label>
                <Input
                  id="job_category"
                  value={jobForm.job_category}
                  onChange={(e) => setJobForm({ ...jobForm, job_category: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="job_description">Job Description *</Label>
                <Textarea
                  id="job_description"
                  value={jobForm.job_description}
                  onChange={(e) => setJobForm({ ...jobForm, job_description: e.target.value })}
                  className="mt-1 min-h-[140px]"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_remote"
                  checked={jobForm.is_remote}
                  onCheckedChange={(checked) => setJobForm({ ...jobForm, is_remote: !!checked })}
                />
                <Label htmlFor="is_remote" className="cursor-pointer">Remote position</Label>
              </div>

              {!jobForm.is_remote && (
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="salary_range">Salary Range</Label>
                <Input
                  id="salary_range"
                  value={jobForm.salary_range}
                  onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                  className="mt-1"
                  placeholder="e.g. $80,000 - $120,000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Contact Name *</Label>
                  <Input
                    id="contact_name"
                    value={jobForm.contact_name}
                    onChange={(e) => setJobForm({ ...jobForm, contact_name: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={jobForm.contact_email}
                    onChange={(e) => setJobForm({ ...jobForm, contact_email: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={jobForm.contact_phone}
                  onChange={(e) => setJobForm({ ...jobForm, contact_phone: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="application_instructions">Application Instructions</Label>
                <Textarea
                  id="application_instructions"
                  value={jobForm.application_instructions}
                  onChange={(e) => setJobForm({ ...jobForm, application_instructions: e.target.value })}
                  className="mt-1"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="service_needed">Service Needed *</Label>
                <Input
                  id="service_needed"
                  value={serviceForm.service_needed}
                  onChange={(e) => setServiceForm({ ...serviceForm, service_needed: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  value={serviceForm.details}
                  onChange={(e) => setServiceForm({ ...serviceForm, details: e.target.value })}
                  className="mt-1 min-h-[140px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={serviceForm.location}
                    onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="date_needed">Date Needed</Label>
                  <Input
                    id="date_needed"
                    type="date"
                    value={serviceForm.date_needed}
                    onChange={(e) => setServiceForm({ ...serviceForm, date_needed: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_min">Budget Min ($)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.budget_min}
                    onChange={(e) => setServiceForm({ ...serviceForm, budget_min: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max">Budget Max ($)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.budget_max}
                    onChange={(e) => setServiceForm({ ...serviceForm, budget_max: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="special_requests">Special Requests</Label>
                <Textarea
                  id="special_requests"
                  value={serviceForm.special_requests}
                  onChange={(e) => setServiceForm({ ...serviceForm, special_requests: e.target.value })}
                  className="mt-1"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={isJob ? jobForm.status : serviceForm.status}
              onValueChange={(value) =>
                isJob
                  ? setJobForm({ ...jobForm, status: value })
                  : setServiceForm({ ...serviceForm, status: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
                {!statusOptions.some((o) => o.value === (isJob ? jobForm.status : serviceForm.status)) && (
                  <SelectItem value={isJob ? jobForm.status : serviceForm.status}>
                    {isJob ? jobForm.status : serviceForm.status}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/jobs')}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
