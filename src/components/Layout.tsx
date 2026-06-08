
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navigation from "./Navigation";
import { Button } from "../components/ui/button";
import { LogIn } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  requiresAuth?: boolean;
}

const Layout = ({ children, requiresAuth = false }: LayoutProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Check if we're on a protected route and not authenticated
  const isProtectedRoute = ['/detect', '/dataset', '/analytics'].includes(location.pathname);
  const showLoginPrompt = isProtectedRoute && !isAuthenticated;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        {showLoginPrompt ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-cyber-primary/10 rounded-full h-24 w-24 mx-auto mb-6 flex items-center justify-center">
              <LogIn className="h-12 w-12 text-cyber-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-cyber-primary">Authentication Required</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md">
              Please log in to access the cyberbullying detection features.
            </p>
            <Button 
              className="bg-cyber-primary hover:bg-cyber-dark"
              size="lg"
              onClick={() => window.location.href = '/account'}
            >
              Go to Login
            </Button>
          </div>
        ) : (
          children
        )}
      </main>
      <footer className="bg-cyber-dark text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} CyberGuardian - Cyberbullying Detection System
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-sm hover:text-cyber-accent transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm hover:text-cyber-accent transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm hover:text-cyber-accent transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
