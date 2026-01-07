import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AddListingCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-primary">
      <div className="container mx-auto px-12 max-w-4xl text-center">
        <h2 className="text-5xl font-heading font-medium text-primary-foreground mb-6 tracking-tight">
          Apply for Membership
        </h2>
        <p className="text-xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          Access the right placements without public exposure.
        </p>
        <Button
          onClick={() => navigate('/add-listing')}
          size="lg"
          className="bg-tertiary text-tertiary-foreground px-12 py-6 text-base"
        >
          Request Access
        </Button>
      </div>
    </section>
  );
}
