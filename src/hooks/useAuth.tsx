
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { User } from '../services/database';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string, email: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if the user is already authenticated
    const checkAuthentication = async () => {
      setIsLoading(true);
      const authenticated = authService.checkAuth();
      
      if (authenticated) {
        setIsAuthenticated(true);
        setUser(authService.state.user);
      } else {
        // If not authenticated and on a protected route, redirect to login
        const protectedRoutes = ['/detect', '/dataset', '/analytics'];
        if (protectedRoutes.includes(location.pathname)) {
          toast.warning("Please login to access this page");
          navigate('/account', { 
            replace: true, 
            state: { from: location.pathname } 
          });
        }
      }
      setIsLoading(false);
    };

    checkAuthentication();

    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((state) => {
      setIsAuthenticated(state.isAuthenticated);
      setUser(state.user);
    });

    return unsubscribe;
  }, [navigate, location.pathname]);

  const login = (username: string, password: string) => {
    const success = authService.login(username, password);
    
    if (success) {
      // Redirect user to the page they were trying to access, or to /detect by default
      const { state } = location;
      const redirectTo = state && (state as any).from ? (state as any).from : '/detect';
      navigate(redirectTo, { replace: true });
    }
    
    return success;
  };

  const register = (username: string, password: string, email: string) => {
    const success = authService.register(username, password, email);
    
    if (success) {
      // Redirect to detect page after successful registration
      navigate('/detect', { replace: true });
    }
    
    return success;
  };

  const logout = () => {
    authService.logout();
    navigate('/', { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        register,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
