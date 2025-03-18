import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { MenuIcon, User, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Toggle user profile dropdown
  const toggleUserMenu = () => setShowUserMenu((prev) => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  // Links with active tab styling
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Write", path: "/write", protected: true },
    { name: "Top Blogs", path: "/top-blogs" },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left - Logo & Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <span className="text-xl font-bold text-indigo-600">Logo</span>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map(({ name, path, protected: isProtected }) =>
                !isProtected || isAuthenticated ? (
                  <a
                    key={path}
                    href={path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors 
                      ${location.pathname === path
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                  >
                    {name}
                  </a>
                ) : null
              )}
            </div>
          </div>

          {/* Right - User Auth */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {!isAuthenticated ? (
              <>
                <button className="px-4 py-2 text-sm text-gray-700 hover:text-indigo-600" onClick={() => navigate("/login")}>
                  Sign In
                </button>
                <button className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate("/signup")}>
                  Get Started
                </button>
              </>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button className="flex items-center focus:outline-none" onClick={toggleUserMenu}>
                  {user?.profile_picture ? (
                    <img src={user.profile_picture} alt={user.username} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <User size={16} />
                    </div>
                  )}
                  <span className="ml-2 text-sm font-medium text-gray-700">{user?.name}</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg z-10">
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>
                      Your Profile
                    </a>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map(({ name, path, protected: isProtected }) =>
              !isProtected || isAuthenticated ? (
                <a
                  key={path}
                  href={path}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors
                    ${location.pathname === path
                      ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                >
                  {name}
                </a>
              ) : null
            )}
          </div>

          {/* Mobile User Menu */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {!isAuthenticated ? (
              <div className="space-y-2 px-4">
                <button className="w-full text-left block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600" onClick={() => navigate("/login")}>
                  Sign In
                </button>
                <button className="w-full text-left block px-4 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md" onClick={() => navigate("/signup")}>
                  Get Started
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center px-4 py-3">
                  {user?.profile_picture ? (
                    <img src={user.profile_picture} alt={user.username} className="h-10 w-10 rounded-full object-cover" />
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
                  <a href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                    Your Profile
                  </a>
                  <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
