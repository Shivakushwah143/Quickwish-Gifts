// import { useState, useEffect } from 'react';
// import { Shield, LogOut, User, Bell } from 'lucide-react';
// import { adminAuth } from '../utils/adminAuth';

// export default function AdminHeader() {
//   const [adminUsername, setAdminUsername] = useState('');

//   useEffect(() => {
//     const username = adminAuth.getUsername();
//     if (username) {
//       setAdminUsername(username);
//     }
//   }, []);

//   const handleLogout = () => {
//     if (confirm('Are you sure you want to logout?')) {
//       adminAuth.logout();
//     }
//   };

//   return (
//     <header className="bg-white shadow-sm border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo/Brand */}
//           <div className="flex items-center">
//             <Shield className="w-8 h-8 text-indigo-600 mr-3" />
//             <div>
//               <h1 className="text-xl font-bold text-gray-900">GiftHub Admin</h1>
//               <p className="text-sm text-gray-500">Management Dashboard</p>
//             </div>
//           </div>

//           {/* Right side - Admin info and actions */}
//           <div className="flex items-center space-x-4">
//             {/* Notifications */}
//             <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
//               <Bell size={20} />
//               <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                
//               </span>
//             </button>

//             {/* Admin Profile */}
//             <div className="flex items-center space-x-3">
//               <div className="flex items-center space-x-2">
//                 <div className="p-2 bg-indigo-100 rounded-full">
//                   <User className="w-4 h-4 text-indigo-600" />
//                 </div>
//                 <span className="text-sm font-medium text-gray-700">{adminUsername}</span>
//               </div>

//               <button
//                 onClick={handleLogout}
//                 className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
//                 title="Logout"
//               >
//                 <LogOut size={18} />
//                 <span className="text-sm">Logout</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
// components/AdminHeader.tsx
"use client";

import { Shield, LogOut, User, Bell } from 'lucide-react';

// Define the props interface
interface AdminHeaderProps {
  onLogout: () => void;
  username: string;
}

export default function AdminHeader({ onLogout, username }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">GiftHub Admin</h1>
              <p className="text-sm text-gray-500">Management Dashboard</p>
            </div>
          </div>

          {/* Right side - Admin info and actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                3
              </span>
            </button>

            {/* Admin Profile */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{username}</span>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}