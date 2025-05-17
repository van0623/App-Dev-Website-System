import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from './NotificationContext';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { showSuccess, showError } = useNotification();
  const [settings, setSettings] = useState({
    storeName: 'Fear of God',
    storeEmail: 'contact@fearofgod.com',
    storePhone: '+63 123 456 7890',
    storeAddress: '123 Main Street, Manila, Philippines',
    enableSales: true,
    taxRate: 12,
    shippingFee: 150,
    freeShippingThreshold: 2000,
    maintenanceMode: false,
    allowGuestCheckout: true,
    currency: 'PHP',
    currencySymbol: '₱',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from the backend when the component mounts
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/settings');
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    setIsLoading(true);
    try {
      const response = await axios.put('http://localhost:5000/api/settings', {
        ...newSettings,
        role: 'admin' // This is a temporary solution for our admin check middleware
      });
      
      if (response.data.success) {
        setSettings(newSettings);
        showSuccess('Settings updated successfully');
        return true;
      } else {
        showError(response.data.message || 'Failed to update settings');
        return false;
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showError(error.response?.data?.message || 'Failed to update settings');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSettings, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}; 