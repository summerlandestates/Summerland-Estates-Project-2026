import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  message?: string;
  currentTier?: string;
}

export default function UpgradePrompt({ feature, message, currentTier }: UpgradePromptProps) {
  const navigate = useNavigate();

  const defaultMessage = message || `This feature is not available in your current participation level.`;

  return (
    <Card className="p-12 bg-card text-card-foreground border-border/50 text-center">
      <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6">
        <Lock className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <h2 className="text-3xl font-heading font-medium text-foreground mb-4 tracking-tight">
        {feature}
      </h2>
      
      <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
        {defaultMessage}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => navigate('/pricing')}
          className="bg-primary text-primary-foreground px-8 py-4"
        >
          Review Participation Levels
        </Button>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-border text-foreground px-8 py-4"
        >
          Go Back
        </Button>
      </div>

      {currentTier && (
        <p className="text-sm text-muted-foreground mt-8">
          Current level: {currentTier}
        </p>
      )}
    </Card>
  );
}
