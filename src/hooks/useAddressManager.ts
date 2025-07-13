import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface Address {
  lat?: number;
  lng?: number;
  id: string;
  type: 'Home' | 'Work' | 'Other';
  name: string;
  flatNumber: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressFormData {
  type: 'Home' | 'Work' | 'Other';
  name?: string;
  flatNumber: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export const useAddressManager = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load addresses from localStorage on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    try {
      const savedAddresses = localStorage.getItem('user_addresses');
      if (savedAddresses) {
        const parsedAddresses = JSON.parse(savedAddresses);
        setAddresses(parsedAddresses);
      } else {
        // Set default address if none exist
        const defaultAddress: Address = {
          id: '1',
          type: 'Home',
          name: 'Home',
          flatNumber: '31',
          street: 'Nizampet Rd',
          city: 'West End',
          state: 'Telangana',
          pincode: '500090',
          isDefault: true,
          createdAt: new Date().toISOString(),
        };
        setAddresses([defaultAddress]);
        saveAddresses([defaultAddress]);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load addresses');
    }
  };

  const saveAddresses = (addressList: Address[]) => {
    try {
      localStorage.setItem('user_addresses', JSON.stringify(addressList));
    } catch (error) {
      console.error('Error saving addresses:', error);
      toast.error('Failed to save addresses');
    }
  };

  const addAddress = async (addressData: AddressFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newAddress: Address = {
        id: Date.now().toString(),
        type: addressData.type,
        name: addressData.name || addressData.type,
        flatNumber: addressData.flatNumber,
        street: addressData.street,
        landmark: addressData.landmark,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        lat: addressData.lat,
        lng: addressData.lng,
        isDefault: addresses.length === 0,
        createdAt: new Date().toISOString(),
      };

      const updatedAddresses = [...addresses, newAddress];
      setAddresses(updatedAddresses);
      saveAddresses(updatedAddresses);
      toast.success('Address added successfully!');
      return true;
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (id: string, addressData: Partial<AddressFormData>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const updatedAddresses = addresses.map(addr => 
        addr.id === id 
          ? { 
              ...addr, 
              ...addressData,
              name: addressData.name || addressData.type || addr.name,
              updatedAt: new Date().toISOString()
            }
          : addr
      );
      
      setAddresses(updatedAddresses);
      saveAddresses(updatedAddresses);
      toast.success('Address updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const addressToDelete = addresses.find(addr => addr.id === id);
      if (!addressToDelete) {
        toast.error('Address not found');
        return false;
      }

      if (addresses.length === 1) {
        toast.error('Cannot delete the last address');
        return false;
      }

      let updatedAddresses = addresses.filter(addr => addr.id !== id);
      
      // If deleted address was default, make the first remaining address default
      if (addressToDelete.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      setAddresses(updatedAddresses);
      saveAddresses(updatedAddresses);
      toast.success('Address deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultAddress = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
        updatedAt: addr.id === id ? new Date().toISOString() : addr.updatedAt,
      }));

      setAddresses(updatedAddresses);
      saveAddresses(updatedAddresses);
      toast.success('Default address updated!');
      return true;
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultAddress = (): Address | null => {
    return addresses.find(addr => addr.isDefault) || null;
  };

  const getAddressById = (id: string): Address | null => {
    return addresses.find(addr => addr.id === id) || null;
  };

  const validateAddress = (addressData: Partial<AddressFormData>): string[] => {
    const errors: string[] = [];
    
    if (!addressData.flatNumber?.trim()) {
      errors.push('Flat/House number is required');
    }
    
    if (!addressData.street?.trim()) {
      errors.push('Street address is required');
    }
    
    if (!addressData.city?.trim()) {
      errors.push('City is required');
    }
    
    if (!addressData.pincode?.trim()) {
      errors.push('Pincode is required');
    } else if (!/^\d{6}$/.test(addressData.pincode.trim())) {
      errors.push('Pincode must be 6 digits');
    }
    
    if (!addressData.type) {
      errors.push('Address type is required');
    }

    return errors;
  };

  return {
    addresses,
    isLoading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    getAddressById,
    validateAddress,
    loadAddresses,
  };
};