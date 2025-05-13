import { createContext, useState, useEffect, useContext } from 'react';
import { message } from 'antd';
import { login as loginApi, register as registerApi, logout as logoutApi, checkAuth, getCurrentUser } from '../services/api';

// Create the auth context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on load
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        setLoading(true);
        const { isLoggedIn } = await checkAuth();
        
        if (isLoggedIn) {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserAuth();
  }, []);

  // Register new user
  const register = async (userData) => {
    try {
      setLoading(true);
      await registerApi(userData);
      message.success('Registration successful! Please log in.');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await loginApi(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      message.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await logoutApi();
      setUser(null);
      setIsAuthenticated(false);
      message.success('Logged out successfully');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Logout failed');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 