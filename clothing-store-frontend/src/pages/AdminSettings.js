import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { useSettings } from '../context/SettingsContext';
import '../App.css';

const AdminSettings = () => {
  const { user } = useUser();
  const { showInfo } = useNotification();
  const { settings: globalSettings, isLoading: settingsLoading, updateSettings, fetchSettings } = useSettings();
  
  const [localSettings, setLocalSettings] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
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

  // Load settings from context when the component mounts or globalSettings changes
  useEffect(() => {
    setLocalSettings(globalSettings);
  }, [globalSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings(prevSettings => ({
      ...prevSettings,
      [name]: Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update settings via the context
      await updateSettings(localSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to current global settings
    setLocalSettings(globalSettings);
    showInfo('Settings reset to current values');
  };
  
  const handleRefresh = async () => {
    // Refresh settings from the database
    await fetchSettings();
    showInfo('Settings refreshed from database');
  };

  if (!user || user.role !== 'admin') {
    return <div className="access-denied">Access Denied: Admin Only</div>;
  }

  return (
    <div className="admin-settings">
      <div className="container">
        <div className="page-header">
          <Link to="/admin" className="back-button">
            Back to Admin Panel
          </Link>
          <h1>Store Settings</h1>
        </div>

        {settingsLoading ? (
          <div className="settings-loading">
            <div className="spinner"></div>
            <p>Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="settings-form">
            <div className="settings-section">
              <h2>General Settings</h2>
              
              <div className="form-group">
                <label htmlFor="storeName">Store Name</label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  value={localSettings.storeName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="storeEmail">Store Email</label>
                  <input
                    type="email"
                    id="storeEmail"
                    name="storeEmail"
                    value={localSettings.storeEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="storePhone">Store Phone</label>
                  <input
                    type="text"
                    id="storePhone"
                    name="storePhone"
                    value={localSettings.storePhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="storeAddress">Store Address</label>
                <textarea
                  id="storeAddress"
                  name="storeAddress"
                  value={localSettings.storeAddress}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="settings-section">
              <h2>Payment & Shipping</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={localSettings.currency}
                    onChange={handleChange}
                  >
                    <option value="PHP">Philippine Peso (PHP)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="currencySymbol">Currency Symbol</label>
                  <input
                    type="text"
                    id="currencySymbol"
                    name="currencySymbol"
                    value={localSettings.currencySymbol}
                    onChange={handleChange}
                    maxLength="3"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="taxRate">Tax Rate (%)</label>
                  <input
                    type="number"
                    id="taxRate"
                    name="taxRate"
                    value={localSettings.taxRate}
                    onChange={handleNumberChange}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="shippingFee">Shipping Fee</label>
                  <div className="input-with-symbol">
                    <span>{localSettings.currencySymbol}</span>
                    <input
                      type="number"
                      id="shippingFee"
                      name="shippingFee"
                      value={localSettings.shippingFee}
                      onChange={handleNumberChange}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="freeShippingThreshold">Free Shipping Threshold</label>
                <div className="input-with-symbol">
                  <span>{localSettings.currencySymbol}</span>
                  <input
                    type="number"
                    id="freeShippingThreshold"
                    name="freeShippingThreshold"
                    value={localSettings.freeShippingThreshold}
                    onChange={handleNumberChange}
                    min="0"
                    step="1"
                  />
                </div>
                <small>Set to 0 to disable free shipping</small>
              </div>
            </div>
            
            <div className="settings-section">
              <h2>Store Options</h2>
              
              <div className="form-check">
                <input
                  type="checkbox"
                  id="enableSales"
                  name="enableSales"
                  checked={localSettings.enableSales}
                  onChange={handleChange}
                />
                <label htmlFor="enableSales">Enable Sales</label>
              </div>
              
              <div className="form-check">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  name="maintenanceMode"
                  checked={localSettings.maintenanceMode}
                  onChange={handleChange}
                />
                <label htmlFor="maintenanceMode">Maintenance Mode</label>
              </div>
              
              <div className="form-check">
                <input
                  type="checkbox"
                  id="allowGuestCheckout"
                  name="allowGuestCheckout"
                  checked={localSettings.allowGuestCheckout}
                  onChange={handleChange}
                />
                <label htmlFor="allowGuestCheckout">Allow Guest Checkout</label>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Settings'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Reset Changes
              </button>
              <button 
                type="button" 
                className="btn btn-info"
                onClick={handleRefresh}
              >
                Refresh from Database
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminSettings; 