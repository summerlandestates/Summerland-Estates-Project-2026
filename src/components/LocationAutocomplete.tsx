import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { googlePlacesAPI } from '@/config/api';

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface Location {
  city: string;
  state: string;
  country: string;
  formattedAddress: string;
  placeId: string;
}

interface LocationAutocompleteProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export default function LocationAutocomplete({ 
  onLocationSelect, 
  placeholder = "Enter city or address...",
  className = "",
  defaultValue = ""
}: LocationAutocompleteProps) {
  const [input, setInput] = useState(defaultValue);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (input.length < 2) {
        setPredictions([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await googlePlacesAPI.getPlacePredictions(input);
        setPredictions(results);
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setPredictions([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(timeoutId);
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setSelectedLocation(null);
  };

  const handlePredictionClick = async (prediction: PlacePrediction) => {
    setInput(prediction.description);
    setShowDropdown(false);
    setIsLoading(true);

    try {
      const placeDetails = await googlePlacesAPI.getPlaceDetails(prediction.place_id);
      
      if (placeDetails) {
        const location = parsePlaceDetails(placeDetails, prediction.place_id);
        setSelectedLocation(location);
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const parsePlaceDetails = (placeDetails: any, placeId: string): Location => {
    const addressComponents = placeDetails.address_components || [];
    
    let city = '';
    let state = '';
    let country = '';

    addressComponents.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    });

    return {
      city: city || placeDetails.name || '',
      state: state || '',
      country: country || '',
      formattedAddress: placeDetails.formatted_address || placeDetails.name || '',
      placeId
    };
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-10"
          onFocus={() => input.length >= 2 && predictions.length > 0 && setShowDropdown(true)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && predictions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
          <div className="p-1">
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors"
                onClick={() => handlePredictionClick(prediction)}
              >
                <div className="font-medium text-sm">
                  {prediction.structured_formatting.main_text}
                </div>
                <div className="text-xs text-muted-foreground">
                  {prediction.structured_formatting.secondary_text}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {selectedLocation && (
        <div className="mt-2 p-2 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">
            Selected: {selectedLocation.formattedAddress}
          </p>
        </div>
      )}
    </div>
  );
}

// Hook for using location autocomplete in forms
export const useLocationAutocomplete = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const clearLocation = () => {
    setSelectedLocation(null);
  };

  return {
    selectedLocation,
    handleLocationSelect,
    clearLocation,
    city: selectedLocation?.city || '',
    state: selectedLocation?.state || '',
    country: selectedLocation?.country || '',
    formattedAddress: selectedLocation?.formattedAddress || ''
  };
};
