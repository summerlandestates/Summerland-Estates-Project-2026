import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PLANS, type MeteredFeature, METERED_FEATURE_LABELS } from '@/lib/plans';
import { Sparkles, Check } from 'lucide-react';

interface UpgradePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: MeteredFeature;
  limit: number | null;
}

export default function UpgradePromptDialog({
  open,
  onOpenChange,
  feature,
  limit,
}: UpgradePromptDialogProps) {
  const navigate = useNavigate();
  const label = METERED_FEATURE_LABELS[feature];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#A89F91]/10">
            <Sparkles className="h-6 w-6 text-[#A89F91]" />
          </div>
          <DialogTitle className="text-center text-xl">
            You've used your {limit} free {label} this month
          </DialogTitle>
          <DialogDescription className="text-center">
            Upgrade to keep going — allowances reset on the 1st of each month.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2 sm:grid-cols-2">
          {PLANS.filter((p) => p.id !== 'basic').map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-gray-200 p-4 text-left"
            >
              <p className="font-semibold text-gray-900">{plan.name}</p>
              <p className="mb-2 text-sm text-[#A89F91]">{plan.priceLabel}</p>
              <ul className="space-y-1">
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#A89F91]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          <Button
            onClick={() => navigate('/pricing')}
            className="w-full bg-[#A89F91] text-white hover:bg-[#8A8279] sm:w-auto"
          >
            View Plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
