import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const buildUserData = (loginData) => {
    const authenticatedUser = loginData.user;
    const profile = loginData.citizenProfile || loginData.dealerProfile || loginData.adminProfile || {};
    const role = authenticatedUser?.role || 'CITIZEN';

    return {
      ...profile,
      id: authenticatedUser.id,
      userId: authenticatedUser.id,
      profileId: profile.id ?? null,
      username: authenticatedUser.username,
      email: authenticatedUser.email,
      fullName: authenticatedUser.fullName,
      phone: authenticatedUser.phone,
      role,
    };
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');
      const userData = localStorage.getItem('userData');
      
      if (token && role && userData) {
        const parsedData = JSON.parse(userData);
        // Validate that role exists and is valid
        if (parsedData && role && ['CITIZEN', 'DEALER', 'ADMIN'].includes(role)) {
          setUser({ ...parsedData, role });
        } else {
          // Clear invalid data
          localStorage.clear();
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      localStorage.clear();
    }
    setLoading(false);
  }, []);

  const resolveLoginUsername = async (usernameOrEmail) => {
    if (!usernameOrEmail.includes('@')) {
      return usernameOrEmail;
    }

    const response = await api.get(`/users/email/${encodeURIComponent(usernameOrEmail)}`);
    return response.data?.data?.username || usernameOrEmail;
  };

  const login = async (username, password) => {
    try {
      const resolvedUsername = await resolveLoginUsername(username.trim());
      const response = await api.post('/auth/login', { username: resolvedUsername, password });
      const loginData = response.data.data;
      const userData = buildUserData(loginData);
      const role = userData.role;
      
      // For now, use username as token until JWT is implemented
      const token = `Bearer_${userData.username}_${Date.now()}`;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      
      console.log('Login successful:', { role, userData }); // Debug log
      
      return { success: true, role: role };
    } catch (error) {
      console.error('Login error:', error); // Debug log
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
