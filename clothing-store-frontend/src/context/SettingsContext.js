import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from './NotificationContext';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { showSuccess, showError } = useNotification();
  const [settings, setSettings] = useState({
    storeName: 'Premium Streetwear',
    storeEmail: 'info@premiumstreetwear.com',
    storePhone: '+63 123 456 7890',
    storeAddress: '123 Fashion District, Manila, Philippines',
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
      if (response.data) {
        // Convert snake_case to camelCase
        const settings = {
          storeName: response.data.store_name,
          storeEmail: response.data.store_email,
          storePhone: response.data.store_phone,
          storeAddress: response.data.store_address,
          taxRate: response.data.tax_rate,
          shippingFee: response.data.shipping_fee,
          freeShippingThreshold: response.data.free_shipping_threshold,
          maintenanceMode: response.data.maintenance_mode,
          allowGuestCheckout: response.data.allow_guest_checkout,
          enableSales: response.data.enable_sales,
          currency: response.data.currency,
          currencySymbol: response.data.currency_symbol
        };
        setSettings(settings);
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
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        showError('Admin authentication required');
        return false;
      }

      // Convert camelCase to snake_case
      const convertedSettings = {
        store_name: newSettings.storeName,
        store_email: newSettings.storeEmail,
        store_phone: newSettings.storePhone,
        store_address: newSettings.storeAddress,
        tax_rate: newSettings.taxRate,
        shipping_fee: newSettings.shippingFee,
        free_shipping_threshold: newSettings.freeShippingThreshold,
        maintenance_mode: newSettings.maintenanceMode,
        allow_guest_checkout: newSettings.allowGuestCheckout,
        enable_sales: newSettings.enableSales,
        currency: newSettings.currency,
        currency_symbol: newSettings.currencySymbol
      };

      const response = await axios.put('http://localhost:5000/api/settings', convertedSettings, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (response.data) {
        // Convert snake_case back to camelCase for frontend state
        const updatedSettings = {
          storeName: response.data.store_name,
          storeEmail: response.data.store_email,
          storePhone: response.data.store_phone,
          storeAddress: response.data.store_address,
          taxRate: response.data.tax_rate,
          shippingFee: response.data.shipping_fee,
          freeShippingThreshold: response.data.free_shipping_threshold,
          maintenanceMode: response.data.maintenance_mode,
          allowGuestCheckout: response.data.allow_guest_checkout,
          enableSales: response.data.enable_sales,
          currency: response.data.currency,
          currencySymbol: response.data.currency_symbol
        };
        setSettings(updatedSettings);
        showSuccess('Settings updated successfully');
        return true;
      } else {
        showError('Failed to update settings');
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