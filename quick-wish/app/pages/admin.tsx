
// "use client"
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Plus, Package, Users, ShoppingCart, TrendingUp, LogOut, Shield, CheckCircle, XCircle, Eye, Calendar, MapPin, Phone, CreditCard, User } from 'lucide-react';
// import AdminAuthModal from '../components/AdminAuthModal';
// import AddProductModal from '../components/AddProductModal';

// interface User {
//   _id: string;
//   email: string;
//   username: string;
//   createdAt: string;
// }

// interface Order {
//   _id: string;
//   user: string;
//   product: string;
//   status: string;
//   paymentMethod: string;
//   amount: number;
//   orderedAt: string;
//   shippingAddress: {
//     name: string;
//     street: string;
//     city: string;
//     pinCode: string;
//     phone: string;
//   };
// }
// interface Product {
//   _id: string;
//   name: string;
//   price: number;
//   images: string[];
//   category?: string;
//   description?: string;
//   stock?: number;
//   badge?: string;
//   discountPercent?: number;
//   originalPrice?: number;
//   createdAt?: string;
// }
// export default function AdminDashboard() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [showAddProductModal, setShowAddProductModal] = useState(false);
//   const [adminUsername, setAdminUsername] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [products, setProducts] = useState<Record<string, Product>>({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [view, setView] = useState('stats'); // 'stats' or 'orders'
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
//   const [users, setUsers] = useState<User[]>([]);
//   const [allProducts, setAllProducts] = useState<Product[]>([]);
//   const [totalProducts, setTotalProducts] = useState(0);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [totalUsers, setTotalUsers] = useState(0);

//   const router = useRouter();

//   useEffect(() => {
//     const token = localStorage.getItem('adminToken');
//     const username = localStorage.getItem('adminUsername');

//     if (token && username) {
//       setIsAuthenticated(true);
//       setAdminUsername(username);
//       fetchOrders();
//     } else {
//       setShowAuthModal(true);
//     }
//   }, []);

//   // Add this function to fetch users
//   const fetchUsers = async () => {
//     try {
//       const token = localStorage.getItem('adminToken');
//       if (!token) {
//         setError('Please login as admin');
//         return;
//       }

//       const API_BASE_URL = 'http://localhost:5000';
//       const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch users');
//       }

//       const data = await response.json();
//       console.log(data)
//       if (data.success) {
//         setUsers(data.users);
//         setTotalUsers(data.total);
//       }
//     } catch (err: any) {
//       console.error('Failed to fetch users:', err);
//     }
//   };
//   // Fetch all products
//   const fetchAllProducts = async () => {
//     try {
//       const token = localStorage.getItem('adminToken');
//       if (!token) {
//         setError('Please login as admin');
//         return;
//       }

//       const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
//       const response = await fetch(`${API_BASE_URL}/api/v1/product`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch products');
//       }

//       const data = await response.json();
//       if (data.success) {
//         setAllProducts(data.products);
//         setTotalProducts(data.products.length);
//       }
//     } catch (err: any) {
//       console.error('Failed to fetch products:', err);
//       setError(err.message || 'Failed to fetch products');
//     }
//   };

//   // Edit product
//   const handleEditProduct = (product: Product) => {
//     setEditingProduct(product);
//     setShowEditModal(true);
//   };

//   // Update product
//   const handleUpdateProduct = async (updatedProduct: Product) => {
//     try {
//       const token = localStorage.getItem('adminToken');
//       if (!token) {
//         setError('Please login as admin');
//         return;
//       }

//       const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
//       const response = await fetch(`${API_BASE_URL}/api/v1/product/${updatedProduct._id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(updatedProduct)
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update product');
//       }

//       const data = await response.json();
//       if (data.success) {
//         setAllProducts(prev => prev.map(p =>
//           p._id === updatedProduct._id ? data.updateProduct : p
//         ));
//         setSuccessMessage('Product updated successfully!');
//         setShowEditModal(false);
//         setEditingProduct(null);
//         setTimeout(() => setSuccessMessage(''), 3000);
//       }
//     } catch (err: any) {
//       setError(err.message || 'Failed to update product');
//     }
//   };

//   // Delete product
//   const handleDeleteProduct = async (productId: string) => {
//     if (!confirm('Are you sure you want to delete this product?')) {
//       return;
//     }

//     try {
//       const token = localStorage.getItem('adminToken');
//       if (!token) {
//         setError('Please login as admin');
//         return;
//       }

//       const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
//       const response = await fetch(`${API_BASE_URL}/api/v1/product/${productId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete product');
//       }

//       const data = await response.json();
//       if (data.success) {
//         setAllProducts(prev => prev.filter(p => p._id !== productId));
//         setTotalProducts(prev => prev - 1);
//         setSuccessMessage('Product deleted successfully!');
//         setTimeout(() => setSuccessMessage(''), 3000);
//       }
//     } catch (err: any) {
//       setError(err.message || 'Failed to delete product');
//     }
//   };

//   // Call fetchUsers in your useEffect
//   useEffect(() => {
//     const token = localStorage.getItem('adminToken');
//     const username = localStorage.getItem('adminUsername');

//     if (token && username) {
//       setIsAuthenticated(true);
//       setAdminUsername(username);
//       fetchOrders();
//       fetchUsers();
//       fetchAllProducts();
//     } else {
//       setShowAuthModal(true);
//     }
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('adminToken');
//       if (!token) {
//         setError('Please login as admin');
//         return;
//       }

//       const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
//       const response = await fetch(`${API_BASE_URL}/api/v1/admin/allOrders`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch orders');
//       }

//       const responseData = await response.json();

//       // Extract the allOrders array from the response
//       if (responseData.allOrders && Array.isArray(responseData.allOrders)) {
//         setOrders(responseData.allOrders);

//         // Fetch product details for each order
//         const productIds = [...new Set(responseData.allOrders.map(order => order.product))];
//         await fetchProducts(productIds, token);
//       } else {
//         setOrders([]); // Set empty array if no orders found
//       }

//     } catch (err: any) {
//       setError(err.message || 'Failed to fetch orders');
//     } finally {
//       setLoading(false);
//     }
//   };
//   const fetchProducts = async (productIds: string[], token: string) => {
//     try {
//       const API_BASE_URL = 'http://localhost:5000';
//       const productsMap: Record<string, Product> = {};

//       for (const id of productIds) {
//         const response = await fetch(`${API_BASE_URL}/api/v1/product/${id}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });

//         if (response.ok) {
//           const productData = await response.json();
//           productsMap[id] = productData;
//         }
//       }

//       setProducts(productsMap);
//     } catch (err) {
//       console.error('Failed to fetch products:', err);
//     }
//   };

//   const confirmOrder = async (orderId: string) => {
//     try {
//       const token = localStorage.getItem('adminToken');
//       if (!token) {
//         setError('Please login as admin');
//         return;
//       }

//       const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
//       const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders/${orderId}/confirm`, {
//         method: 'PATCH',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to confirm order');
//       }

//       // Update the order status locally
//       setOrders(prevOrders =>
//         prevOrders.map(order =>
//           order._id === orderId ? { ...order, status: 'Confirmed' } : order
//         )
//       );

//       setSuccessMessage('Order confirmed successfully!');
//       setTimeout(() => setSuccessMessage(''), 3000);
//     } catch (err: any) {
//       setError(err.message || 'Failed to confirm order');
//     }
//   };

//   const handleAuthSuccess = () => {
//     setIsAuthenticated(true);
//     const username = localStorage.getItem('adminUsername') || '';
//     setAdminUsername(username);
//     setShowAuthModal(false);
//     fetchOrders();
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('adminToken');
//     localStorage.removeItem('adminUsername');
//     setIsAuthenticated(false);
//     setAdminUsername('');
//     router.push('/');
//   };

//   const handleProductSuccess = () => {
//     setSuccessMessage('Product created successfully!');
//     setTimeout(() => setSuccessMessage(''), 3000);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'processing': return 'bg-yellow-100 text-yellow-800';
//       case 'confirmed': return 'bg-blue-100 text-blue-800';
//       case 'shipped': return 'bg-purple-100 text-purple-800';
//       case 'delivered': return 'bg-green-100 text-green-800';
//       case 'cancelled': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
//         <AdminAuthModal
//           isOpen={showAuthModal}
//           onClose={() => router.push('/')}
//           onSuccess={handleAuthSuccess}
//         />
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="min-h-screen bg-gray-50">
//         {/* Header */}
//         <header className="bg-white shadow-sm border-b">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex justify-between items-center h-16">
//               <div className="flex items-center">
//                 <Shield className="w-8 h-8 text-indigo-600 mr-3" />
//                 <div>
//                   <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
//                   <p className="text-sm text-gray-500">Welcome back, {adminUsername}</p>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-4">
//                 <button
//                   onClick={() => setShowAddProductModal(true)}
//                   className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center"
//                 >
//                   <Plus size={20} className="mr-2" />
//                   Add Product
//                 </button>

//                 <button
//                   onClick={handleLogout}
//                   className="text-gray-500 hover:text-gray-700 flex items-center"
//                 >
//                   <LogOut size={20} className="mr-1" />
//                   Logout
//                 </button>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Navigation Tabs */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
//           <div className="flex border-b border-gray-200">
//             <button
//               onClick={() => setView('stats')}
//               className={`py-4 px-6 font-medium text-sm ${view === 'stats' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
//             >
//               Dashboard
//             </button>
//             <button
//               onClick={() => {
//                 setView('orders');
//                 fetchOrders();
//               }}
//               className={`py-4 px-6 font-medium text-sm ${view === 'orders' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
//             >
//               Orders
//             </button>
//           </div>
//         </div>

//         {/* Dashboard Content */}
//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {view === 'stats' ? (
//             <>
//               {/* Stats Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                 <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//                   <div className="flex items-center">
//                     <div className="p-3 bg-blue-100 rounded-lg">
//                       <Package className="w-6 h-6 text-blue-600" />
//                     </div>
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Total Products</p>
//                       <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//                   <div className="flex items-center">
//                     <div className="p-3 bg-green-100 rounded-lg">
//                       <ShoppingCart className="w-6 h-6 text-green-600" />
//                     </div>
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Total Orders</p>
//                       <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//                   <div className="flex items-center">
//                     <div className="p-3 bg-purple-100 rounded-lg">
//                       <Users className="w-6 h-6 text-purple-600" />
//                     </div>
//                     <div className="ml-4">
//                       <h2>Total users: {totalUsers}</h2>
//                       {users.map((user) => (
//                         <div key={user._id}>
//                           {user.username}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//                   <div className="flex items-center">
//                     <div className="p-3 bg-yellow-100 rounded-lg">
//                       <TrendingUp className="w-6 h-6 text-yellow-600" />
//                     </div>
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Revenue</p>
//                       {/* <p className="text-2xl font-bold text-gray-900">₹{orders.reduce((sum, order) => sum + order.amount, 0)}</p> */}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Quick Actions */}
//               <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <button
//                     onClick={() => setShowAddProductModal(true)}
//                     className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 text-center"
//                   >
//                     <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                     <p className="text-sm font-medium text-gray-600">Add New Product</p>
//                   </button>

//                   <button
//                     onClick={() => {
//                       setView('orders');
//                       fetchOrders();
//                     }}
//                     className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-center"
//                   >
//                     <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                     <p className="text-sm font-medium text-gray-600">View Orders</p>
//                   </button>

//                   <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-center">
//                     <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                     <p className="text-sm font-medium text-gray-600">Manage Users</p>
//                   </button>
//                   <button
//                     onClick={() => {
//                       setView('products');
//                       fetchAllProducts();
//                     }}
//                     className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-center"
//                   >
//                        <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                     Products
//                   </button>

//                 </div>
//               </div>

//               {/* Recent Activity */}
//               <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mt-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
//                 <div className="space-y-3">
//                   {orders.map((order) => (
//                     <div
//                       key={order._id}
//                       className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                     >
//                       <div className="flex items-center">
//                         <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
//                         <span className="text-sm text-gray-900">
//                           New order #{order._id.slice(-6)} received
//                         </span>
//                       </div>
//                       <span className="text-xs text-gray-500">
//                         {formatDate(order.orderedAt)}
//                       </span>
//                     </div>
//                   ))}

//                 </div>
//               </div>
//             </>
//           ) : (
          
//             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Management</h2>

//               {loading ? (
//                 <div className="flex justify-center items-center py-12">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//                 </div>
//               ) : error ? (
//                 <div className="text-red-500 text-center py-12">{error}</div>
//               ) : orders.length === 0 ? (
//                 <div className="text-center py-12 text-gray-500">
//                   <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
//                   <p>No orders found</p>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {orders.map((order) => (
//                         <tr key={order._id}>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id.slice(-6)}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             <div className="flex items-center">
//                               <User className="w-4 h-4 mr-1" />
//                               {order.shippingAddress.name}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{order.amount}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.paymentMethod}</td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
//                               {order.status}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.orderedAt)}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                             <div className="flex space-x-2">
//                               <button
//                                 onClick={() => setSelectedOrder(order)}
//                                 className="text-indigo-600 hover:text-indigo-900"
//                               >
//                                 <Eye className="w-4 h-4" />
//                               </button>
//                               {order.status === 'Processing' && (
//                                 <button
//                                   onClick={() => confirmOrder(order._id)}
//                                   className="text-green-600 hover:text-green-900"
//                                 >
//                                   <CheckCircle className="w-4 h-4" />
//                                 </button>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {view === 'products' && (
//                     <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//                       <div className="flex justify-between items-center mb-6">
//                         <h2 className="text-lg font-semibold text-gray-900">Product Management</h2>
//                         <button
//                           onClick={() => setShowAddProductModal(true)}
//                           className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
//                         >
//                           <Plus size={20} className="mr-2" />
//                           Add Product
//                         </button>
//                       </div>

//                       {loading ? (
//                         <div className="flex justify-center items-center py-12">
//                           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//                         </div>
//                       ) : allProducts.length === 0 ? (
//                         <div className="text-center py-12 text-gray-500">
//                           <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
//                           <p>No products found</p>
//                         </div>
//                       ) : (
//                         <div className="overflow-x-auto">
//                           <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gray-50">
//                               <tr>
//                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
//                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
//                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
//                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
//                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                               </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                               {allProducts.map((product) => (
//                                 <tr key={product._id}>
//                                   <td className="px-6 py-4 whitespace-nowrap">
//                                     <div className="flex items-center">
//                                       {product.images && product.images.length > 0 && (
//                                         <img
//                                           src={product.images[0]}
//                                           alt={product.name}
//                                           className="w-10 h-10 object-cover rounded-md mr-3"
//                                         />
//                                       )}
//                                       <div>
//                                         <div className="text-sm font-medium text-gray-900">{product.name}</div>
//                                         {product.badge && (
//                                           <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
//                                             {product.badge}
//                                           </span>
//                                         )}
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                     ₹{product.price}
//                                     {product.originalPrice && product.originalPrice > product.price && (
//                                       <span className="ml-2 text-xs text-gray-400 line-through">
//                                         ₹{product.originalPrice}
//                                       </span>
//                                     )}
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category || '-'}</td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock || 0}</td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                     <div className="flex space-x-2">
//                                       <button
//                                         onClick={() => handleEditProduct(product)}
//                                         className="text-indigo-600 hover:text-indigo-900"
//                                       >
//                                         Edit
//                                       </button>
//                                       <button
//                                         onClick={() => handleDeleteProduct(product._id)}
//                                         className="text-red-600 hover:text-red-900"
//                                       >
//                                         Delete
//                                       </button>
//                                     </div>
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </main>
//       </div>

//       {/* Order Detail Modal */}
//       {selectedOrder && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
//               <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
//                 <XCircle size={24} />
//               </button>
//             </div>

//             <div className="p-6 space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
//                     <User className="w-5 h-5 mr-2" />
//                     Customer Information
//                   </h3>
//                   <div className="space-y-2">
//                     <p className="text-sm text-gray-600"><span className="font-medium">Name:</span> {selectedOrder.shippingAddress.name}</p>
//                     <p className="text-sm text-gray-600 flex items-center">
//                       <Phone className="w-4 h-4 mr-1" />
//                       <span className="font-medium">Phone:</span> {selectedOrder.shippingAddress.phone}
//                     </p>
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
//                     <MapPin className="w-5 h-5 mr-2" />
//                     Shipping Address
//                   </h3>
//                   <div className="space-y-2">
//                     <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.street}</p>
//                     <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.pinCode}</p>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
//                   <CreditCard className="w-5 h-5 mr-2" />
//                   Payment Information
//                 </h3>
//                 <div className="space-y-2">
//                   <p className="text-sm text-gray-600"><span className="font-medium">Method:</span> {selectedOrder.paymentMethod}</p>
//                   <p className="text-sm text-gray-600"><span className="font-medium">Amount:</span> ₹{selectedOrder.amount}</p>
//                   <p className="text-sm text-gray-600"><span className="font-medium">Status:</span>
//                     <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
//                       {selectedOrder.status}
//                     </span>
//                   </p>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
//                   <Calendar className="w-5 h-5 mr-2" />
//                   Order Timeline
//                 </h3>
//                 <div className="space-y-2">
//                   <p className="text-sm text-gray-600"><span className="font-medium">Ordered At:</span> {formatDate(selectedOrder.orderedAt)}</p>
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-3 pt-6 border-t">
//                 <button
//                   onClick={() => setSelectedOrder(null)}
//                   className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   Close
//                 </button>
//                 {selectedOrder.status === 'Processing' && (
//                   <button
//                     onClick={() => {
//                       confirmOrder(selectedOrder._id);
//                       setSelectedOrder(null);
//                     }}
//                     className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                   >
//                     Confirm Order
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {successMessage && (
//         <div className="fixed top-4 right-4 z-50 p-4 rounded-lg bg-green-100 border border-green-300 text-green-800 text-sm font-medium shadow-lg">
//           {successMessage}
//         </div>
//       )}

//       {/* Modals */}
//       <AddProductModal
//         isOpen={showAddProductModal}
//         onClose={() => setShowAddProductModal(false)}
//         onSuccess={handleProductSuccess}
//       />
//     </>
//   );
// }

"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, Users, ShoppingCart, TrendingUp, LogOut, Shield, CheckCircle, XCircle, Eye, Calendar, MapPin, Phone, CreditCard, User, Edit, Trash2 } from 'lucide-react';
import AdminAuthModal from '../components/AdminAuthModal';
import AddProductModal from '../components/AddProductModal';


interface User {
  _id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface Order {
  _id: string;
  user: string;
  product: string;
  status: string;
  paymentMethod: string;
  amount: number;
  orderedAt: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    pinCode: string;
    phone: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category?: string;
  description?: string;
  stock?: number;
  badge?: string;
  discountPercent?: number;
  originalPrice?: number;
  createdAt?: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('stats'); 
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const username = localStorage.getItem('adminUsername');

    if (token && username) {
      setIsAuthenticated(true);
      setAdminUsername(username);
      fetchOrders();
      fetchUsers();
      fetchAllProducts();
    } else {
      setShowAuthModal(true);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const API_BASE_URL  = 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log(data)
    if (data.allusers) {
      setUsers(data.allusers);
      setTotalUsers(data.total || data.allusers.length);
    }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/v1/product`, {
       
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      if (data.success) {
        setAllProducts(data.products);
        setTotalProducts(data.products.length);
      }
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to fetch products');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const API_BASE_URL =  'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/v1/product/${updatedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const data = await response.json();
      if (data.success) {
        setAllProducts(prev => prev.map(p =>
          p._id === updatedProduct._id ? data.updateProduct : p
        ));
        setSuccessMessage('Product updated successfully!');
        setShowEditModal(false);
        setEditingProduct(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/v1/product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      const data = await response.json();
      if (data.success) {
        setAllProducts(prev => prev.filter(p => p._id !== productId));
        setTotalProducts(prev => prev - 1);
        setSuccessMessage('Product deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/allOrders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const responseData = await response.json();

      if (responseData.allOrders && Array.isArray(responseData.allOrders)) {
        setOrders(responseData.allOrders);
        
        // Calculate total revenue
        const revenue = responseData.allOrders.reduce((sum: number, order: Order) => sum + order.amount, 0);
        setTotalRevenue(revenue);

        // Fetch product details for each order
        const productIds = [...new Set(responseData.allOrders.map((order: Order) => order.product))];
        await fetchProducts(productIds, token);
      } else {
        setOrders([]);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (productIds: string[], token: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const productsMap: Record<string, Product> = {};

      for (const id of productIds) {
        const response = await fetch(`${API_BASE_URL}/api/v1/product/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const productData = await response.json();
          productsMap[id] = productData;
        }
      }

      setProducts(productsMap);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const confirmOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders/${orderId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to confirm order');
      }

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: 'Confirmed' } : order
        )
      );

      setSuccessMessage('Order confirmed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm order');
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    const username = localStorage.getItem('adminUsername') || '';
    setAdminUsername(username);
    setShowAuthModal(false);
    fetchOrders();
    fetchUsers();
    fetchAllProducts();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setIsAuthenticated(false);
    setAdminUsername('');
    router.push('/');
  };

  const handleProductSuccess = () => {
    setSuccessMessage('Product created successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
    fetchAllProducts(); // Refresh the products list
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <AdminAuthModal
          isOpen={showAuthModal}
          onClose={() => router.push('/')}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-indigo-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome back, {adminUsername}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Add Product
                </button>

                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <LogOut size={20} className="mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setView('stats')}
              className={`py-4 px-6 font-medium text-sm ${view === 'stats' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setView('orders');
                fetchOrders();
              }}
              className={`py-4 px-6 font-medium text-sm ${view === 'orders' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Orders
            </button>
            <button
              onClick={() => {
                setView('products');
                fetchAllProducts();
              }}
              className={`py-4 px-6 font-medium text-sm ${view === 'products' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Products
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {view === 'stats' ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹{totalRevenue}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 text-center"
                  >
                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Add New Product</p>
                  </button>

                  <button
                    onClick={() => {
                      setView('orders');
                      fetchOrders();
                    }}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-center"
                  >
                    <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">View Orders</p>
                  </button>

                  <button
                    onClick={() => {
                      setView('products');
                      fetchAllProducts();
                    }}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-center"
                  >
                    <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Manage Products</p>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-900">
                          New order #{order._id.slice(-6)} received
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(order.orderedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : view === 'orders' ? (
            /* Orders View */
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Management</h2>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-12">{error}</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id.slice(-6)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {order.shippingAddress.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{order.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.paymentMethod}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.orderedAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {order.status === 'Processing' && (
                                <button
                                  onClick={() => confirmOrder(order._id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Products View */
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Product Management</h2>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Add Product
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : allProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No products found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allProducts.map((product) => (
                        <tr key={product._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {product.images && product.images.length > 0 && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded-md mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                {product.badge && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                    {product.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{product.price}
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="ml-2 text-xs text-gray-400 line-through">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                              >
                                <Edit size={16} className="mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600 hover:text-red-900 flex items-center"
                              >
                                <Trash2 size={16} className="mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><span className="font-medium">Name:</span> {selectedOrder.shippingAddress.name}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      <span className="font-medium">Phone:</span> {selectedOrder.shippingAddress.phone}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Shipping Address
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.pinCode}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600"><span className="font-medium">Method:</span> {selectedOrder.paymentMethod}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Amount:</span> ₹{selectedOrder.amount}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Order Timeline
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600"><span className="font-medium">Ordered At:</span> {formatDate(selectedOrder.orderedAt)}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedOrder.status === 'Processing' && (
                  <button
                    onClick={() => {
                      confirmOrder(selectedOrder._id);
                      setSelectedOrder(null);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Confirm Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-lg bg-green-100 border border-green-300 text-green-800 text-sm font-medium shadow-lg">
          {successMessage}
        </div>
      )}

      {/* Modals */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSuccess={handleProductSuccess}
      />

      {showEditModal && editingProduct && (
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onSuccess={handleUpdateProduct}
        />
      )}
    </>
  );
}