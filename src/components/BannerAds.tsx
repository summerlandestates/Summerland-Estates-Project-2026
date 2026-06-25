import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface BannerAd {
  id: string;
  company_name: string;
  ad_content: string;
  image_url: string | null;
  target_url: string;
}

interface BannerAdsProps {
  position?: 'homepage_hero' | 'homepage_sidebar' | 'directory_top';
  maxAds?: number;
  className?: string;
}

export default function BannerAds({ 
  position = 'homepage_hero', 
  maxAds = 3,
  className = '' 
}: BannerAdsProps) {
  const [ads, setAds] = useState<BannerAd[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, [position]);

  const loadAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('id, company_name, ad_content, image_url, target_url')
        .eq('ad_type', 'homepage_banner')
        .eq('status', 'active')
        .eq('placement_location', position)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .limit(maxAds);

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error loading banner ads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate ads every 8 seconds
  useEffect(() => {
    if (ads.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [ads.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const trackClick = async (adId: string) => {
    try {
      // Increment click count
      await supabase.rpc('increment_ad_clicks', { ad_id: adId });
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  if (loading || ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  // Compact sidebar style
  if (position === 'homepage_sidebar') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Megaphone className="w-4 h-4" />
          <span>Sponsored</span>
        </div>
        {ads.map((ad) => (
          <Card key={ad.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <a
              href={ad.target_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(ad.id)}
              className="block"
            >
              {ad.image_url && (
                <div className="aspect-video bg-gray-100">
                  <img
                    src={ad.image_url}
                    alt={ad.company_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-3">
                <p className="font-medium text-sm line-clamp-2">{ad.ad_content}</p>
                <div className="flex items-center gap-1 text-xs text-[#A89F91] mt-2">
                  <ExternalLink className="w-3 h-3" />
                  <span>{ad.company_name}</span>
                </div>
              </div>
            </a>
          </Card>
        ))}
      </div>
    );
  }

  // Hero carousel style
  return (
    <div className={`relative ${className}`}>
      <Card className="overflow-hidden bg-gradient-to-r from-[#A89F91]/10 to-[#A89F91]/5 border-[#A89F91]/20">
        <div className="relative p-6 md:p-8">
          {/* Ad Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded-full">
            <Megaphone className="w-3 h-3" />
            <span>Sponsored</span>
          </div>

          {/* Ad Content */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            {currentAd.image_url && (
              <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-lg overflow-hidden bg-white flex-shrink-0">
                <img
                  src={currentAd.image_url}
                  alt={currentAd.company_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm text-[#A89F91] font-medium mb-2">
                {currentAd.company_name}
              </p>
              <p className="text-lg md:text-xl font-medium mb-4 line-clamp-2">
                {currentAd.ad_content}
              </p>
              <Button
                asChild
                className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                onClick={() => trackClick(currentAd.id)}
              >
                <a
                  href={currentAd.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn More
                </a>
              </Button>
            </div>
          </div>

          {/* Navigation */}
          {ads.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                aria-label="Previous ad"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                aria-label="Next ad"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-4">
                {ads.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-[#A89F91] w-4'
                        : 'bg-[#A89F91]/30 hover:bg-[#A89F91]/50'
                    }`}
                    aria-label={`Go to ad ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
