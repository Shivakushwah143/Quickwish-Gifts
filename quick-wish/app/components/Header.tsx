
// // components/Header.tsx - Example of how to integrate auth buttons
// import { useState, useEffect } from 'react';
// import { User, Gift } from 'lucide-react';
import AuthModal from '../components/AuthModel';
// import AdminAuthModal from '../components/AdminAuthModal';

// export default function Header() {
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
//   const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     // Check if user is logged in
//     const token = localStorage.getItem('token');
//     setIsLoggedIn(!!token);
//   }, []);

//   const handleAuthClick = (mode: 'signin' | 'signup') => {
//     setAuthMode(mode);
//     setIsAuthModalOpen(true);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     setIsLoggedIn(false);
//     window.location.reload();
//   };

//   return (
//     <>
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             {/* Logo */}
//             <div className="flex items-center">
//               <Gift className="w-8 h-8 text-purple-600 mr-2" />
//               <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
//                 QuickWish
//               </span>
//             </div>

//             {/* Navigation */}
//             <nav className="hidden md:flex space-x-8">
//               <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Home</a>
//               <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Categories</a>
//               <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Occasions</a>
//               <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Custom Gifts</a>
//             </nav>

//             {/* Right side */}
//             <div className="flex items-center space-x-4">
            
//               {isLoggedIn ? (
//                 <div className="flex items-center space-x-4">
//                   <button className="p-2 text-gray-700 hover:text-purple-600 transition-colors">
//                     <User size={24} />
//                   </button>
//                   <button 
//                     onClick={handleLogout}
//                     className="text-sm text-gray-700 hover:text-purple-600 transition-colors"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               ) : (
//                 <div className="flex items-center space-x-3">
//                   <button
//                     onClick={() => handleAuthClick('signin')}
//                     className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
//                   >
//                     Sign In
//                   </button>
//                   <button
//                     onClick={() => handleAuthClick('signup')}
//                     className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium"
//                   >
//                     Sign Up
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

       
//       <AuthModal 
//         isOpen={isAuthModalOpen} 
//         onClose={() => setIsAuthModalOpen(false)} 
//         initialMode={authMode}
//       />
//     </>
//   );
// } 

// //  this is design of signup and sign in endpoint make it according to our project


// components/Header.tsx
import { useState, useEffect } from 'react';
import { User, Gift, Menu, X, Shield } from 'lucide-react';
// import AuthModal from '../components/AuthModal';
import AdminAuthModal from '../components/AdminAuthModal';

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    setIsAdmin(!!adminToken);
  }, []);

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleAdminAuthClick = () => {
    setIsAdminAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.reload();
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setIsAdmin(false);
    window.location.reload();
  };

  const handleAdminAuthSuccess = () => {
    setIsAdmin(true);
    setIsAdminAuthModalOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById('mobile-menu');
      const menuButton = document.getElementById('menu-button');
      
      if (isMobileMenuOpen && mobileMenu && 
          !mobileMenu.contains(event.target as Node) && 
          menuButton && !menuButton.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="bg-white shadow-sm border-b relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Gift className="w-8 h-8 text-purple-600 mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                QuickWish
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Categories</a>
              <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Occasions</a>
              <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Custom Gifts</a>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {isAdmin ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Admin: {localStorage.getItem('adminUsername')}
                  </span>
                  <button 
                    onClick={handleAdminLogout}
                    className="text-sm text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    Admin Logout
                  </button>
                </div>
              ) : isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-700 hover:text-purple-600 transition-colors">
                    <User size={24} />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="hidden md:block text-sm text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    Logout
                  </button>
                  <button
                    onClick={handleAdminAuthClick}
                    className="hidden md:flex items-center text-sm text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    <Shield size={16} className="mr-1" />
                    Admin
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={handleAdminAuthClick}
                    className="flex items-center text-gray-700 hover:text-purple-600 transition-colors font-medium"
                  >
                    <Shield size={16} className="mr-1" />
                    Admin
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                id="menu-button"
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-100 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          id="mobile-menu"
          className={`md:hidden absolute top-16 inset-x-0 bg-white shadow-md border-t transform origin-top transition-transform duration-200 ease-out ${
            isMobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
          }`}
        >
          <div className="px-4 pt-2 pb-6 space-y-4">
            <a href="#" className="block py-2 text-gray-700 hover:text-purple-600 transition-colors">Home</a>
            <a href="#" className="block py-2 text-gray-700 hover:text-purple-600 transition-colors">Categories</a>
            <a href="#" className="block py-2 text-gray-700 hover:text-purple-600 transition-colors">Occasions</a>
            <a href="#" className="block py-2 text-gray-700 hover:text-purple-600 transition-colors">Custom Gifts</a>
            
            {isAdmin ? (
              <div className="pt-4 border-t space-y-3">
                <div className="text-sm text-gray-700 py-2">
                  Admin: {localStorage.getItem('adminUsername')}
                </div>
                <button 
                  onClick={handleAdminLogout}
                  className="w-full text-left py-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Admin Logout
                </button>
              </div>
            ) : isLoggedIn ? (
              <div className="pt-4 border-t space-y-3">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Logout
                </button>
                <button
                  onClick={handleAdminAuthClick}
                  className="w-full flex items-center text-left py-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Shield size={16} className="mr-2" />
                  Admin Login
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t space-y-3">
                <button
                  onClick={() => handleAuthClick('signin')}
                  className="w-full text-left py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleAuthClick('signup')}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium text-center"
                >
                  Sign Up
                </button>
                <button
                  onClick={handleAdminAuthClick}
                  className="w-full flex items-center text-left py-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Shield size={16} className="mr-2" />
                  Admin Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode}
      />
      
      <AdminAuthModal 
        isOpen={isAdminAuthModalOpen} 
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />
    </>
  );
}