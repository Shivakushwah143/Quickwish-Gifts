// // components/AdminAuthModal.tsx
// import { useState } from 'react';
// import { X, Shield, Eye, EyeOff, Lock, User } from 'lucide-react';

// interface AdminAuthModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onSuccess: () => void;
// }

// export default function AdminAuthModal({ isOpen, onClose, onSuccess }: AdminAuthModalProps) {
//     const [mode, setMode] = useState<'signin' | 'signup'>('signin');
//     const [showPassword, setShowPassword] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         username: '',
//         password: ''
//     });
//     const [error, setError] = useState('');

//     if (!isOpen) return null;

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
//         const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

//         try {
//             const endpoint = mode === 'signin' ? `${API_BASE_URL}/admin/signin` : `${API_BASE_URL}/admin/signup`;

//             const response = await fetch(endpoint, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     username: formData.username,
//                     password: formData.password
//                 }),
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 localStorage.setItem('adminToken', data.token);
//                 localStorage.setItem('adminUsername', formData.username);
//                 onSuccess();
//                 onClose();
//             } else {
//                 setError(data.message || 'Authentication failed');
//             }
//         } catch (err) {
//             setError('Network error. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setFormData(prev => ({
//             ...prev,
//             [e.target.name]: e.target.value
//         }));
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
//                 {/* Header */}
//                 <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
//                     <button
//                         onClick={onClose}
//                         className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
//                     >
//                         <X size={24} />
//                     </button>

//                     <div className="flex items-center justify-center mb-4">
//                         <div className="bg-white bg-opacity-20 p-3 rounded-full">
//                             <Shield className="w-8 h-8 text-white" />
//                         </div>
//                     </div>

//                     <h2 className="text-2xl font-bold text-center mb-2">Admin Access</h2>
//                     <p className="text-center text-indigo-100 text-sm">
//                         {mode === 'signin' ? 'Sign in to admin panel' : 'Create admin account'}
//                     </p>
//                 </div>

//                 {/* Form */}
//                 <div className="p-6">
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         <div>
//                             <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
//                                 Admin Username
//                             </label>
//                             <div className="relative">
//                                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                                 <input
//                                     type="text"
//                                     id="username"
//                                     name="username"
//                                     value={formData.username}
//                                     onChange={handleInputChange}
//                                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
//                                     placeholder="Enter admin username"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                                 Password
//                             </label>
//                             <div className="relative">
//                                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                                 <input
//                                     type={showPassword ? 'text' : 'password'}
//                                     id="password"
//                                     name="password"
//                                     value={formData.password}
//                                     onChange={handleInputChange}
//                                     className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
//                                     placeholder="Enter password"
//                                     required
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowPassword(!showPassword)}
//                                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                                 >
//                                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                                 </button>
//                             </div>
//                         </div>

//                         {error && (
//                             <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
//                                 {error}
//                             </div>
//                         )}

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                         >
//                             {loading ? (
//                                 <div className="flex items-center justify-center">
//                                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                                     Processing...
//                                 </div>
//                             ) : (
//                                 mode === 'signin' ? 'Sign In' : 'Create Admin'
//                             )}
//                         </button>
//                     </form>

//                     {/* Switch mode */}
//                     <div className="text-center mt-6">
//                         <p className="text-gray-600 text-sm">
//                             {mode === 'signin' ? "Need to create admin account? " : "Already have admin account? "}
//                             <button
//                                 onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
//                                 className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
//                             >
//                                 {mode === 'signin' ? 'Sign Up' : 'Sign In'}
//                             </button>
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// components/AdminAuthModal.tsx


import { useState } from 'react';
import { X, Shield, Eye, EyeOff, Lock, User } from 'lucide-react';

interface AdminAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdminAuthModal({ isOpen, onClose, onSuccess }: AdminAuthModalProps) {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '' 
    });
    const [error, setError] = useState('');

    if (!isOpen) return null;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

  try {
    // CORRECTED: Added /api/v1 to the endpoint URLs
    const endpoint = mode === 'signin' 
      ? `${API_BASE_URL}/api/v1/user/signin` 
      : `${API_BASE_URL}/api/v1/user/signup`;

    // Prepare request body based on mode
    const requestBody = mode === 'signin' 
      ? {
          username: formData.username,
          password: formData.password
        }
      : {
          username: formData.username,
          password: formData.password,
          email: formData.email || `${formData.username}@admin.com`
        };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUsername', formData.username);
      localStorage.setItem('userRole', 'admin');
      onSuccess();
      onClose();
    } else {
      setError(data.message || 'Authentication failed');
    }
  } catch (err) {
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
                {/* Header - Updated to pink/purple theme */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-white bg-opacity-20 p-3 rounded-full">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center mb-2">Admin Access</h2>
                    <p className="text-center text-pink-100 text-sm">
                        {mode === 'signin' ? 'Sign in to admin panel' : 'Create admin account'}
                    </p>
                </div>

                {/* Form */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {mode === 'signup' && (
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email (Optional)
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter email (optional)"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </div>
                            ) : (
                                mode === 'signin' ? 'Sign In' : 'Create Admin'
                            )}
                        </button>
                    </form>

                    {/* Switch mode */}
                    <div className="text-center mt-6">
                        <p className="text-gray-600 text-sm">
                            {mode === 'signin' ? "Need to create admin account? " : "Already have admin account? "}
                            <button
                                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                                className="text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                            >
                                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}