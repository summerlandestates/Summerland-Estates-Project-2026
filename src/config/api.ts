// API Configuration - Google API key is stored securely in backend
export const API_CONFIG = {
  GOOGLE_PLACES_API_KEY: 'AIzaSyDs7HeqA1nDjpjnVtELrUZ7Lw15t6Q8Xp8',
  GOOGLE_PLACES_API_URL: 'https://maps.googleapis.com/maps/api/place',
};

// Google Places API functions - proxied through backend to avoid CORS
export const googlePlacesAPI = {
  // Autocomplete for location search
  async getPlacePredictions(input: string) {
    try {
      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(input)}`
      );
      const data = await response.json();
      return data.predictions || [];
    } catch (error) {
      console.error('Error fetching place predictions:', error);
      return [];
    }
  },

  // Get place details
  async getPlaceDetails(placeId: string) {
    try {
      const response = await fetch(
        `/api/places/details?placeId=${placeId}`
      );
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  },

  // Geocoding - convert address to coordinates
  async geocodeAddress(address: string) {
    try {
      const response = await fetch(
        `/api/places/geocode?address=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      return data.results?.[0] || null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  },

  // Reverse geocoding - convert coordinates to address
  async reverseGeocode(lat: number, lng: number) {
    try {
      const response = await fetch(
        `/api/places/reverse-geocode?lat=${lat}&lng=${lng}`
      );
      const data = await response.json();
      return data.results?.[0] || null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }
};

export default API_CONFIG;
