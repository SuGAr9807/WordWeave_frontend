import { useAuth } from "@/context/AuthContext";
import { MenuIcon, User, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    
    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };
    
    const handleLoginClick = () => {
      navigate('/login');
    };
    
    const handleGetStartedClick = () => {
      navigate('/signup');
    };
    
    const handleLogout = () => {
      logout();
      navigate('/');
    };
    
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    const toggleUserMenu = () => {
      setShowUserMenu(!showUserMenu);
    };
  
    return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and navigation */}
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">Logo</span>
              </div>
              
              {/* Desktop menu */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a 
                  href="/" 
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium text-gray-900 transition-colors hover:text-indigo-600"
                >
                  Home
                </a>
                {isAuthenticated && (
                  <a 
                    href="/write" 
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    Write
                  </a>
                )}
                <a 
                  href="/most-viewed" 
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  Most Viewed
                </a>
              </div>
            </div>
  
            {/* Right side - Sign in and Get Started buttons or User Profile */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {!isAuthenticated ? (
                <>
                  <button 
                    type="button" 
                    className="px-4 py-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={handleLoginClick}
                  >
                    Sign In
                  </button>
                  <button 
                    type="button"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    onClick={handleGetStartedClick}
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <div className="relative">
                  <button
                    className="flex items-center focus:outline-none"
                    onClick={toggleUserMenu}
                  >
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                        <User size={16} />
                      </div>
                    )}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {user?.name}
                    </span>
                  </button>
                  
                  {/* User dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg z-10">
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your Profile
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
  
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                aria-expanded="false"
                onClick={toggleMenu}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
  
        {/* Mobile menu */}
        <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            <a
              href="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium text-indigo-700 bg-indigo-50"
            >
              Home
            </a>
            {isAuthenticated && (
              <a
                href="/write"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                Write
              </a>
            )}
            <a
              href="/most-viewed"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              Most Viewed
            </a>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {!isAuthenticated ? (
              <div className="space-y-2 px-4">
                <button
                  type="button"
                  className="w-full text-left block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                  onClick={handleLoginClick}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="w-full text-left block px-4 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                  onClick={handleGetStartedClick}
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center px-4 py-3">
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <User size={20} />
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.name}</div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <a
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  >
                    Your Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  };
  
  export default Navbar;