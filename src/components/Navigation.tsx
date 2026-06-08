
import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Search, Database, BarChart, User, Menu, X } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-cyber-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8" />
            <span className="font-bold text-xl">CyberGuardian</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="hover:text-cyber-accent transition-colors">
              Home
            </Link>
            <Link to="/detect" className="hover:text-cyber-accent transition-colors">
              Detect Bullying
            </Link>
            <Link to="/dataset" className="hover:text-cyber-accent transition-colors">
              Dataset
            </Link>
            <Link to="/analytics" className="hover:text-cyber-accent transition-colors">
              Analytics
            </Link>
            <Link to="/account" className="hover:text-cyber-accent transition-colors">
              Account
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden focus:outline-none" onClick={toggleMenu}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="hover:text-cyber-accent transition-colors py-2 px-4"
                onClick={toggleMenu}
              >
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Home</span>
                </div>
              </Link>
              <Link 
                to="/detect" 
                className="hover:text-cyber-accent transition-colors py-2 px-4"
                onClick={toggleMenu}
              >
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Detect Bullying</span>
                </div>
              </Link>
              <Link 
                to="/dataset" 
                className="hover:text-cyber-accent transition-colors py-2 px-4"
                onClick={toggleMenu}
              >
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Dataset</span>
                </div>
              </Link>
              <Link 
                to="/analytics" 
                className="hover:text-cyber-accent transition-colors py-2 px-4"
                onClick={toggleMenu}
              >
                <div className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5" />
                  <span>Analytics</span>
                </div>
              </Link>
              <Link 
                to="/account" 
                className="hover:text-cyber-accent transition-colors py-2 px-4"
                onClick={toggleMenu}
              >
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Account</span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
