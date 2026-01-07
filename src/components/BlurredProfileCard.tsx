import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface BlurredProfileCardProps {
  viewMode: 'grid' | 'list';
}

export default function BlurredProfileCard({ viewMode }: BlurredProfileCardProps) {
  const navigate = useNavigate();

  if (viewMode === 'list') {
    return (
      <Card className="p-6 bg-card text-card-foreground border-2 border-border relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-md bg-background/60 z-10 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-12 h-12 bg-muted flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium mb-4">
              Additional profiles available
            </p>
            <Button
              onClick={() => navigate('/pricing')}
              size="sm"
              className="bg-primary text-primary-foreground"
            >
              Review Participation Levels
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 opacity-30">
          <div className="w-full md:w-48 h-48 bg-muted rounded-lg" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-16 bg-muted rounded" />
            <div className="flex gap-4">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-4 bg-muted rounded w-24" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card text-card-foreground overflow-hidden border-2 border-border relative">
      <div className="absolute inset-0 backdrop-blur-md bg-background/60 z-10 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-foreground font-medium mb-4">
            Additional profiles available
          </p>
          <Button
            onClick={() => navigate('/pricing')}
            size="sm"
            className="bg-primary text-primary-foreground"
          >
            Review Levels
          </Button>
        </div>
      </div>
      
      <div className="opacity-30">
        <div className="w-full h-64 bg-muted" />
        <div className="p-6 space-y-3">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-16 bg-muted rounded" />
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
}
