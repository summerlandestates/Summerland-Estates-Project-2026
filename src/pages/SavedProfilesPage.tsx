import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, GitCompare, Trash2, Star, MapPin } from 'lucide-react';
import { listings } from '../data/listings';
import type { Listing } from '../types';

export default function SavedProfilesPage() {
  const navigate = useNavigate();
  const [savedProfiles, setSavedProfiles] = useState<Listing[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [userName] = useState('John Smith'); // This would come from auth context

  useEffect(() => {
    window.scrollTo(0, 0);
    // Load saved profiles from localStorage
    const saved = localStorage.getItem('savedProfiles');
    if (saved) {
      const savedIds = JSON.parse(saved);
      const profiles = listings.filter(l => savedIds.includes(l.id));
      setSavedProfiles(profiles);
    }
  }, []);

  const handleRemoveProfile = (id: string) => {
    const saved = localStorage.getItem('savedProfiles');
    if (saved) {
      const savedIds = JSON.parse(saved).filter((savedId: string) => savedId !== id);
      localStorage.setItem('savedProfiles', JSON.stringify(savedIds));
      setSavedProfiles(savedProfiles.filter(p => p.id !== id));
      setSelectedForComparison(selectedForComparison.filter(selectedId => selectedId !== id));
    }
  };

  const handleToggleComparison = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter(selectedId => selectedId !== id));
    } else {
      if (selectedForComparison.length >= 5) {
        alert('You can only compare up to 5 profiles at a time');
        return;
      }
      setSelectedForComparison([...selectedForComparison, id]);
    }
  };

  const handleCompare = () => {
    if (selectedForComparison.length < 2) {
      alert('Please select at least 2 profiles to compare');
      return;
    }
    navigate('/compare', { state: { profileIds: selectedForComparison } });
  };

  if (savedProfiles.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="" />
        
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl text-center">
            <div className="mb-8">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
                No Saved Profiles
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                You haven't saved any profiles yet. Browse the directory and save profiles you're interested in.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Browse Directory
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="mb-12">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-2">
              {userName}'s Likes
            </h1>
            <p className="text-lg text-muted-foreground">
              {savedProfiles.length} saved {savedProfiles.length === 1 ? 'profile' : 'profiles'}
            </p>
          </div>

          {selectedForComparison.length > 0 && (
            <Card className="p-6 bg-primary/10 border-primary mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitCompare className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">
                      {selectedForComparison.length} profile{selectedForComparison.length !== 1 ? 's' : ''} selected for comparison
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select 2-5 profiles to compare (max 5)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedForComparison([])}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Clear Selection
                  </Button>
                  <Button
                    onClick={handleCompare}
                    disabled={selectedForComparison.length < 2}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <GitCompare className="w-4 h-4 mr-2" />
                    Compare Profiles
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProfiles.map((profile) => (
              <Card
                key={profile.id}
                className={`bg-card text-card-foreground overflow-hidden border transition-all ${
                  selectedForComparison.includes(profile.id)
                    ? 'border-primary border-2 shadow-lg'
                    : 'border-border'
                }`}
              >
                <div className="relative">
                  <img
                    src={profile.profilePhoto}
                    alt={profile.name}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleRemoveProfile(profile.id)}
                      className="bg-white/90 hover:bg-[#5f6756] text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-heading font-bold text-foreground mb-1 truncate">
                        {profile.name}
                      </h3>
                      <p className="text-muted-foreground truncate">{profile.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      {profile.category}
                    </Badge>
                    {profile.availability && (
                      <Badge className="bg-success text-white">Available</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-foreground">
                      <MapPin className="w-4 h-4 mr-1 text-accent" />
                      {profile.location}
                    </div>
                    <div className="flex items-center text-foreground">
                      <Star className="w-4 h-4 mr-1 fill-accent text-accent" />
                      {profile.rating}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      className="flex-1 border-border text-foreground hover:bg-muted"
                      onClick={() => navigate(`/profile/${profile.id}`)}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant={selectedForComparison.includes(profile.id) ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => handleToggleComparison(profile.id)}
                      className={
                        selectedForComparison.includes(profile.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'border-border text-foreground hover:bg-muted'
                      }
                    >
                      <Checkbox
                        checked={selectedForComparison.includes(profile.id)}
                        className="pointer-events-none"
                      />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
