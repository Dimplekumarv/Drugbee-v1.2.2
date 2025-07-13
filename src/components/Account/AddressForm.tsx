import React, { useState, useEffect } from 'react';
import { MapPin, Home, Briefcase, Map as MapIcon } from 'lucide-react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import toast from 'react-hot-toast';
import { AddressFormData, useAddressManager } from '../../hooks/useAddressManager';

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

type Libraries = ('places')[];

const libraries: Libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const AddressForm: React.FC<AddressFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitButtonText = 'Save Address',
}) => {
  const { validateAddress } = useAddressManager();
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDxCf1P5kc_goDqqIX39LjhJHB5h8pAFnA",
    libraries: libraries as any,
  });

  const [formData, setFormData] = useState<AddressFormData>({
    type: 'Home',
    flatNumber: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    ...initialData,
  });

  const [center, setCenter] = useState({ 
    lat: initialData?.lat || 17.4065, 
    lng: initialData?.lng || 78.4772 
  });
  const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(
    initialData?.lat && initialData?.lng 
      ? { lat: initialData.lat, lng: initialData.lng }
      : null
  );

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { 
      componentRestrictions: { country: 'in' },
    },
    debounce: 300,
  });

  // Set initial search value if editing
  useEffect(() => {
    if (initialData?.street && initialData?.city) {
      setValue(`${initialData.flatNumber} ${initialData.street}, ${initialData.city}`, false);
    }
  }, [initialData, setValue]);

  const handleSelect = async (description: string) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      const addressComponents = results[0].address_components;

      // Extract address components
      const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
      const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
      const locality = addressComponents.find(c => c.types.includes('sublocality_level_1'))?.long_name || '';
      const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
      const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
      const postalCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';

      setCenter({ lat, lng });
      setMarker({ lat, lng });
      setFormData(prev => ({
        ...prev,
        flatNumber: prev.flatNumber || streetNumber,
        street: `${route}${locality ? `, ${locality}` : ''}`,
        city: city || prev.city,
        state: state || prev.state,
        pincode: postalCode || prev.pincode,
        lat,
        lng,
      }));
    } catch (error) {
      toast.error('Error finding address');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setCenter({ lat, lng });
          setMarker({ lat, lng });

          try {
            const results = await getGeocode({
              location: { lat, lng }
            });
            const addressComponents = results[0].address_components;

            // Extract address components
            const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
            const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
            const locality = addressComponents.find(c => c.types.includes('sublocality_level_1'))?.long_name || '';
            const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
            const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
            const postalCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';

            setFormData(prev => ({
              ...prev,
              flatNumber: prev.flatNumber || streetNumber,
              street: `${route}${locality ? `, ${locality}` : ''}`,
              city: city || prev.city,
              state: state || prev.state,
              pincode: postalCode || prev.pincode,
              lat,
              lng,
            }));
            setValue(results[0].formatted_address, false);
            toast.success('Location detected! Please verify the details.');
          } catch (error) {
            toast.error('Error finding address from location');
          }
        },
        () => {
          toast.error('Could not get your location. Please enter manually.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateAddress(formData);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handleInputChange = (field: keyof AddressFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Address Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Address Type
        </label>
        <div className="flex space-x-4">
          {(['Home', 'Work', 'Other'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleInputChange('type', type)}
              className={`flex-1 py-3 rounded-lg border flex items-center justify-center space-x-2 ${
                formData.type === type
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              } transition-colors`}
            >
              {type === 'Home' && <Home className="w-4 h-4" />}
              {type === 'Work' && <Briefcase className="w-4 h-4" />}
              {type === 'Other' && <MapPin className="w-4 h-4" />}
              <span>{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Address Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Name (Optional)
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder={`My ${formData.type} Address`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Places Autocomplete */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Location
        </label>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!ready}
            placeholder="Search your location"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-10"
          />
          <button
            type="button"
            onClick={getCurrentLocation}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            title="Use current location"
          >
            <MapIcon className="w-5 h-5" />
          </button>
        </div>
        {status === "OK" && (
          <div className="absolute z-[10000] w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
            {data.map((suggestion) => (
              <div
                key={suggestion.place_id}
                onClick={() => handleSelect(suggestion.description)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
              >
                {suggestion.description}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      {isLoaded && !loadError ? (
        <div className="rounded-lg overflow-hidden border border-gray-300">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={15}
            center={center}
            onClick={(e) => {
              if (e.latLng) {
                const latLng = {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng()
                };
                setMarker(latLng);
                setFormData(prev => ({ ...prev, lat: latLng.lat, lng: latLng.lng }));
              }
            }}
          >
            {marker && <Marker position={marker} />}
          </GoogleMap>
        </div>
      ) : (
        <div className="h-[300px] bg-gray-100 rounded-lg flex flex-col items-center justify-center">
          {loadError ? (
            <>
              <MapIcon className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm text-center">
                Map failed to load<br />
                You can still add address manually
              </p>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-600 text-sm">Loading map...</p>
            </>
          )}
        </div>
      )}

      {/* Address Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Flat/House Number*
          </label>
          <input
            type="text"
            value={formData.flatNumber}
            onChange={(e) => handleInputChange('flatNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Landmark (Optional)
          </label>
          <input
            type="text"
            value={formData.landmark || ''}
            onChange={(e) => handleInputChange('landmark', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address*
        </label>
        <input
          type="text"
          value={formData.street}
          onChange={(e) => handleInputChange('street', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City*
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pincode*
          </label>
          <input
            type="text"
            value={formData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;