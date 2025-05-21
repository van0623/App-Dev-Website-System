import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const updateUserData = useCallback((newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  }, []);

  const login = (userData) => {
    console.log('UserContext: Logging in user with ID:', userData.id);
    updateUserData(userData);
    setIsAuthenticated(true);
  };
  
  const logout = () => {
    const currentUserId = user?.id || 'guest';
    console.log('UserContext: Logging out user with ID:', currentUserId);
    
    // Clear current user's cart
    const cartKey = `cart_${currentUserId}`;
    localStorage.removeItem(cartKey);
    localStorage.removeItem(`cart_guest`);
    
    // Clear user data and tokens
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
  };

  const refreshUser = useCallback(async () => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!savedUser || !token) {
      console.log('UserContext: No saved user or token found');
      return;
    }

    setIsLoading(true);
    try {
      const parsedUser = JSON.parse(savedUser);
      const response = await axios.get(`http://localhost:5000/api/users/${parsedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const freshUserData = response.data.user;
        updateUserData(freshUserData);
        console.log('UserContext: Refreshed user data:', freshUserData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [updateUserData]);

  // Check for saved user data on component mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        updateUserData(parsedUser);
        setIsAuthenticated(true);
        refreshUser();
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [refreshUser, updateUserData]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    setUser: updateUserData,
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