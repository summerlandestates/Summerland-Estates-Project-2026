import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Megaphone, ExternalLink, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NativeAd {
  id: string;
  company_name: string;
  ad_content: string;
  image_url: string | null;
  target_url: string;
  ad_type: 'native_listing' | 'sidebar';
}

interface NativeAdProps {
  position?: 'search_results' | 'sidebar' | 'profile_sidebar';
  className?: string;
}

export default function NativeAd({ 
  position = 'search_results',
  className = '' 
}: NativeAdProps) {
  const [ad, setAd] = useState<NativeAd | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAd();
  }, [position]);

  const loadAd = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('id, company_name, ad_content, image_url, target_url, ad_type')
        .eq('ad_type', position === 'sidebar' ? 'sidebar' : 'native_listing')
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setAd(data);
    } catch (error) {
      console.error('Error loading native ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackClick = async () => {
    if (!ad) return;
    try {
      await supabase.rpc('increment_ad_clicks', { ad_id: ad.id });
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  if (loading || !ad) return null;

  // Sidebar style (for profile or search sidebar)
  if (position === 'sidebar' || position === 'profile_sidebar') {
    return (
      <Card className={`overflow-hidden border-[#A89F91]/20 ${className}`}>
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Megaphone className="w-3 h-3" />
            <span>Sponsored</span>
          </div>
          
          <a
            href={ad.target_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackClick}
            className="block group"
          >
            {ad.image_url && (
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3">
                <img
                  src={ad.image_url}
                  alt={ad.company_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#A89F91]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-[#A89F91]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-2 group-hover:text-[#A89F91] transition-colors">
                  {ad.ad_content}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {ad.company_name}
                </p>
              </div>
            </div>
          </a>
          
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full mt-3 text-[#A89F91] hover:bg-[#A89F91]/10"
            onClick={trackClick}
          >
            <a
              href={ad.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Learn More
            </a>
          </Button>
        </div>
      </Card>
    );
  }

  // Search results inline style
  return (
    <Card className={`overflow-hidden border-[#A89F91]/30 bg-gradient-to-r from-[#A89F91]/5 to-transparent ${className}`}>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-[#A89F91] border-[#A89F91]/30 text-xs">
            <Megaphone className="w-3 h-3 mr-1" />
            Sponsored
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {ad.image_url && (
            <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={ad.image_url}
                alt={ad.company_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1">
            <a
              href={ad.target_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackClick}
              className="block group"
            >
              <p className="text-sm text-[#A89F91] font-medium mb-1">
                {ad.company_name}
              </p>
              <p className="text-base font-medium line-clamp-2 group-hover:text-[#A89F91] transition-colors">
                {ad.ad_content}
              </p>
            </a>
            
            <Button
              variant="link"
              size="sm"
              asChild
              className="p-0 h-auto text-[#A89F91] hover:text-[#8A8279] mt-2"
              onClick={trackClick}
            >
              <a
                href={ad.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Visit Website
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
