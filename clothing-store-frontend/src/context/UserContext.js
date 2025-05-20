import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const login = (userData) => {
    console.log('UserContext: Logging in user with ID:', userData.id);
    setUser(userData);
    setIsAuthenticated(true);
    // Store user data in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  const logout = () => {
    // Get the current user ID before clearing
    const currentUserId = user?.id || 'guest';
    console.log('UserContext: Logging out user with ID:', currentUserId);
    
    // Log all localStorage keys before cleanup
    const beforeStorageKeys = Object.keys(localStorage);
    console.log('UserContext: localStorage keys before logout:', beforeStorageKeys);
    
    // Clear current user's cart
    const cartKey = `cart_${currentUserId}`;
    const cartData = localStorage.getItem(cartKey);
    console.log(`UserContext: Removing cart for ${currentUserId}:`, cartData ? JSON.parse(cartData) : 'No cart data');
    localStorage.removeItem(cartKey);
    
    // Clear any potential guest cart that might have been used
    localStorage.removeItem(`cart_guest`);
    
    // Clear user data
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    
    // Log all localStorage keys after cleanup
    const afterStorageKeys = Object.keys(localStorage);
    console.log('UserContext: localStorage keys after logout:', afterStorageKeys);
  };

  const refreshUser = async () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Fetch fresh user data from the server
        const response = await axios.get(`http://localhost:5000/api/users/${parsedUser.id}`);
        if (response.data.success) {
          const freshUserData = response.data.user;
          setUser(freshUserData);
          localStorage.setItem('user', JSON.stringify(freshUserData));
          console.log('UserContext: Refreshed user data:', freshUserData);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };
  
  // Check for saved user data on component mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('UserContext: Found saved user in localStorage:', parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Refresh user data from server
        refreshUser();
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    } else {
      console.log('UserContext: No saved user found in localStorage');
    }
  }, []);
  
  const value = {
    user,
    isAuthenticated,
    setUser,
    setIsAuthenticated,
    login,
    logout,
    refreshUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 