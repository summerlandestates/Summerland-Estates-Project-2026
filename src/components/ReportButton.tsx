import { useState } from 'react';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ReportTargetType = 'profile' | 'job' | 'message' | 'service_request' | 'review' | 'event' | 'article' | 'post';

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  targetLabel?: string;
  variant?: 'outline' | 'ghost' | 'default';
  size?: 'default' | 'sm' | 'icon';
  className?: string;
}

const reportReasons = [
  'Spam or scam',
  'Inappropriate content',
  'Harassment or abuse',
  'Fake or misleading profile',
  'Safety concern',
  'Other',
];

const queueOfflineReport = (report: Record<string, unknown>) => {
  try {
    const existing = JSON.parse(localStorage.getItem('pendingReports') || '[]');
    existing.push(report);
    localStorage.setItem('pendingReports', JSON.stringify(existing));
  } catch {
    // ignore
  }
};

export default function ReportButton({
  targetType,
  targetId,
  targetLabel,
  variant = 'outline',
  size = 'default',
  className = '',
}: ReportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    const report = {
      reporter_id: user?.id || null,
      target_type: targetType,
      target_id: targetId,
      target_label: targetLabel || null,
      reason,
      details: details.trim() || null,
    };

    setSubmitting(true);

    if (user) {
      const { error } = await supabase.from('reports').insert(report);
      if (error) {
        queueOfflineReport(report);
      }
    } else {
      queueOfflineReport(report);
    }

    setSubmitting(false);
    setOpen(false);
    setReason('');
    setDetails('');
    toast.success('Report submitted', {
      description: 'Thank you. Our team will review this report.',
    });
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Flag className={`w-4 h-4 ${size === 'icon' ? '' : 'mr-2'}`} />
        {size !== 'icon' && 'Report'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card text-card-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-medium tracking-tight">
              Report {{ profile: 'User', job: 'Job', message: 'Message', service_request: 'Service Request', review: 'Review', event: 'Event', article: 'Article', post: 'Post' }[targetType] ?? 'Content'}
            </DialogTitle>
            <DialogDescription>
              {targetLabel ? `Reporting: ${targetLabel}` : 'Tell us what happened.'} Reports are reviewed by our team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reportReasons.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Details (optional)</Label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add any additional context..."
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#A89F91] hover:bg-[#8A8279] text-white"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
