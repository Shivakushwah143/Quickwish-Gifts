"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, Users, ShoppingCart, TrendingUp, LogOut, Shield, ShieldAlert, CheckCircle, XCircle, Eye, Calendar, MapPin, Phone, CreditCard, User, Edit, Trash2 } from 'lucide-react';
import AdminAuthModal from '../components/AdminAuthModal';
import ProductShareButton from '../components/ProductShareButton';
import AddProductModal from '../components/AddProductModal';
import CreatorManagement from '../components/CreatorManagement';
import { clearAdminAuthState, hasJwtExpired } from '../utils/auth';


interface Order {
  _id: string;
  user: string;
  product: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  amount: number;
  quantity?: number;
  finalAmount?: number;
  couponDiscount?: number;
  orderedAt: string;
  orderNumber?: string;
  paymentReportedAt?: string | null;
  paymentVerifiedAt?: string | null;
  paymentRejectedAt?: string | null;
  paymentRejectionReason?: string | null;
  paymentExpiresAt?: string | null;
  productSnapshot?: {
    productId?: string;
    name?: string;
    image?: string;
    unitPrice?: number;
    quantity?: number;
    category?: string;
  };
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

const AWAITING_STATUSES = ['AWAITING_VERIFICATION', 'PROOF_SUBMITTED'];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('stats');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [awaitingCount, setAwaitingCount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const username = localStorage.getItem('adminUsername');

    if (token && username && !hasJwtExpired(token)) {
      setIsAuthenticated(true);
      setAdminUsername(username);
      fetchOrders();
      fetchUsers();
      fetchAllProducts();
      fetchAwaitingCount();
    } else {
      clearAdminAuthState();
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

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      if (data.allusers) {
        setTotalUsers(data.total || data.allusers.length);
      }
    } catch (err) {
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

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/product?includeArchived=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      if (data.success) {
        setAllProducts(data.products);
        setTotalProducts(data.products.length);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    }
  };

  /** How many customer-reported payments are waiting for admin verification. */
  const fetchAwaitingCount = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/admin/payments/awaiting`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return;
      const data = await response.json();
      setAwaitingCount(Number(data.count) || 0);
    } catch (err) {
      console.error('Failed to fetch awaiting count:', err);
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

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/product/${updatedProduct._id}`, {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
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

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const fetchOrders = async (filterStatus?: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const query = filterStatus && filterStatus !== 'ALL'
        ? `?paymentStatus=${encodeURIComponent(filterStatus)}`
        : '';
      const response = await fetch(`${API_BASE_URL}/admin/allOrders${query}`, {
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

      } else {
        setOrders([]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  /** Admin verifies the UPI payment — the only action that confirms an order. */
  const confirmPayment = async (orderId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const confirmUrl = `${API_BASE_URL}/admin/orders/${orderId}/confirm-payment`;
      const response = await fetch(confirmUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to confirm payment');
      }

      const data = await response.json();
      const updatedOrder = data?.order;

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? {
                ...order,
                status: updatedOrder?.status || 'orderConfirmed',
                paymentStatus: updatedOrder?.paymentStatus || order.paymentStatus,
              }
            : order
        )
      );

      setSuccessMessage(updatedOrder?.paymentStatus === 'VERIFIED' ? 'Payment verified — order confirmed!' : 'Order confirmed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      void fetchAwaitingCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm payment');
    }
  };

  /** Admin could not find the payment in the UPI/bank app. Keeps the reservation. */
  const rejectPayment = async (orderId: string) => {
    const reason = window.prompt(
      'Optional note for the customer (e.g. "Payment not found in UPI app"):',
      'Payment not found in the UPI app'
    );

    if (reason === null) return; // admin cancelled the prompt

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/reject-payment`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason.trim() || 'Payment not found in the UPI app' })
      });

      if (!response.ok) {
        throw new Error('Failed to reject payment');
      }

      const data = await response.json();
      const updatedOrder = data?.order;

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? {
                ...order,
                status: updatedOrder?.status || order.status,
                paymentStatus: updatedOrder?.paymentStatus || order.paymentStatus,
              }
            : order
        )
      );

      setSuccessMessage('Payment rejected — order stays reserved.');
      setTimeout(() => setSuccessMessage(''), 3000);
      void fetchAwaitingCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject payment');
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      const data = await response.json();
      const updatedOrder = data?.order;

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? {
                ...order,
                status: updatedOrder?.status || 'Cancelled',
                paymentStatus: updatedOrder?.paymentStatus || order.paymentStatus,
              }
            : order
        )
      );

      setSuccessMessage('Order cancelled successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      void fetchAwaitingCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
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
    fetchAwaitingCount();
  };

  const handleLogout = () => {
    clearAdminAuthState();
    setIsAuthenticated(false);
    setAdminUsername('');
    router.replace('/admin/login');
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
      case 'orderconfirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'VERIFIED': return 'bg-emerald-100 text-emerald-800';
      case 'AWAITING_VERIFICATION':
      case 'PROOF_SUBMITTED': return 'bg-amber-100 text-amber-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING':
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusLabel = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'VERIFIED': return 'Verified';
      case 'AWAITING_VERIFICATION':
      case 'PROOF_SUBMITTED': return 'Awaiting Verification';
      case 'REJECTED': return 'Rejected';
      case 'PENDING':
      default: return 'Pending';
    }
  };

  /** Pending payment that outlived its reservation window — worth attention. */
  const isStalePending = (order: Order): boolean => {
    if (order.paymentStatus !== 'PENDING' || !order.paymentExpiresAt) return false;
    return new Date(order.paymentExpiresAt).getTime() < Date.now();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <AdminAuthModal
          isOpen={showAuthModal}
          onClose={() => {
            clearAdminAuthState();
            router.replace('/admin/login');
          }}
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
                {awaitingCount > 0 && (
                  <button
                    onClick={() => {
                      setView('orders');
                      setPaymentFilter('AWAITING_VERIFICATION');
                      fetchOrders('AWAITING_VERIFICATION');
                    }}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-all duration-200 flex items-center text-sm font-semibold"
                  >
                    <ShieldAlert size={18} className="mr-2" />
                    Payments: {awaitingCount} awaiting
                  </button>
                )}

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
                fetchOrders(paymentFilter);
                fetchAwaitingCount();
              }}
              className={`py-4 px-6 font-medium text-sm ${view === 'orders' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Orders
              {awaitingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                  {awaitingCount}
                </span>
              )}
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
            <button
              onClick={() => setView('creators')}
              className={`py-4 px-6 font-medium text-sm ${view === 'creators' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Creators
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {view === 'stats' ? (
            <>
              {/* Payments awaiting verification — attention banner */}
              {awaitingCount > 0 ? (
                <button
                  onClick={() => {
                    setView('orders');
                    setPaymentFilter('AWAITING_VERIFICATION');
                    fetchOrders('AWAITING_VERIFICATION');
                  }}
                  className="w-full mb-6 flex items-center justify-between gap-4 bg-amber-50 border border-amber-300 rounded-xl p-5 hover:bg-amber-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <ShieldAlert className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Payments Awaiting Verification</p>
                      <p className="text-sm text-amber-700">Customers have paid and are waiting for you to confirm in the UPI app.</p>
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-amber-700">{awaitingCount}</span>
                </button>
              ) : (
                <div className="w-full mb-6 flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl p-5">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ShieldAlert className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">Payments Awaiting Verification</p>
                    <p className="text-sm text-green-700">All reported payments have been reviewed. You&apos;re all caught up.</p>
                  </div>
                </div>
              )}

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
                      setPaymentFilter('AWAITING_VERIFICATION');
                      fetchOrders('AWAITING_VERIFICATION');
                    }}
                    className="p-4 border-2 border-dashed border-amber-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all duration-200 text-center"
                  >
                    <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Review Payments ({awaitingCount} awaiting)
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setView('orders');
                      fetchOrders('ALL');
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

                  <button
                    onClick={() => setView('creators')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 text-center"
                  >
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Manage Creators</p>
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
                          New order {order.orderNumber || `#${order._id.slice(-6)}`} received
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
                <select
                  value={paymentFilter}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPaymentFilter(value);
                    fetchOrders(value);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Filter orders by payment status"
                >
                  <option value="ALL">All payments</option>
                  <option value="AWAITING_VERIFICATION">Awaiting Payment Verification</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber || `#${order._id.slice(-6)}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              {order.productSnapshot?.image ? (
                                <img
                                  src={order.productSnapshot.image}
                                  alt={order.productSnapshot.name || 'Product'}
                                  className="w-8 h-8 object-cover rounded mr-2"
                                />
                              ) : (
                                <Package className="w-4 h-4 mr-1 text-gray-400" />
                              )}
                              <span className="max-w-[160px] truncate">{order.productSnapshot?.name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {order.shippingAddress.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{Number(order.finalAmount ?? order.amount)}
                            {order.quantity ? ` × ${order.quantity}` : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {getPaymentStatusLabel(order.paymentStatus)}
                            </span>
                            {isStalePending(order) && (
                              <span className="ml-1 px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-300" title="Payment window expired — no payment reported yet">
                                Stale
                              </span>
                            )}
                          </td>
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
                                aria-label={`View order ${order._id.slice(-6)}`}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {order.status === 'Processing' && (AWAITING_STATUSES.includes(order.paymentStatus) || order.paymentStatus === 'PENDING') && (
                                <button
                                  onClick={() => confirmPayment(order._id)}
                                  className="text-green-600 hover:text-green-900"
                                  aria-label={`Verify payment for order ${order._id.slice(-6)}`}
                                  title="Confirm Payment (verify in UPI app first)"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              {order.status === 'Processing' && (AWAITING_STATUSES.includes(order.paymentStatus) || order.paymentStatus === 'PENDING') && (
                                <button
                                  onClick={() => rejectPayment(order._id)}
                                  className="text-red-500 hover:text-red-700"
                                  aria-label={`Reject payment for order ${order._id.slice(-6)}`}
                                  title="Reject payment (not found in UPI app)"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              {order.status !== 'Cancelled' && (
                                <button
                                  onClick={() => cancelOrder(order._id)}
                                  className="text-gray-400 hover:text-red-700"
                                  aria-label={`Cancel order ${order._id.slice(-6)}`}
                                >
                                  <Trash2 className="w-4 h-4" />
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
          ) : view === 'creators' ? (
            <CreatorManagement />
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
                            <div className="flex items-center space-x-2">
                              <ProductShareButton
                                slug={product._id}
                                title={product.name}
                                price={product.price}
                                image={product.images?.[0]}
                                className="h-8 w-8 rounded-full border border-[#ead7c5] bg-white text-[#6f5d66] shadow-sm hover:text-[#b54e36]"
                              />
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
                  <p className="text-sm text-gray-600"><span className="font-medium">Order Reference:</span> {selectedOrder.orderNumber || selectedOrder._id}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Method:</span> {selectedOrder.paymentMethod || 'UPI_DIRECT'}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Amount:</span> ₹{Number(selectedOrder.finalAmount ?? selectedOrder.amount)}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Product:</span> {selectedOrder.productSnapshot?.name || '—'} {selectedOrder.quantity ? `× ${selectedOrder.quantity}` : ''}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Payment Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                      {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Order Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                  {selectedOrder.paymentReportedAt && (
                    <p className="text-sm text-gray-600"><span className="font-medium">Payment Reported:</span> {formatDate(selectedOrder.paymentReportedAt)}</p>
                  )}
                  {selectedOrder.paymentExpiresAt && (
                    <p className="text-sm text-gray-600"><span className="font-medium">Reserved Until:</span> {formatDate(selectedOrder.paymentExpiresAt)}</p>
                  )}
                  {selectedOrder.paymentRejectionReason && (
                    <p className="text-sm text-gray-600"><span className="font-medium">Rejection Note:</span> {selectedOrder.paymentRejectionReason}</p>
                  )}
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
                {selectedOrder.status === 'Processing' && (AWAITING_STATUSES.includes(selectedOrder.paymentStatus) || selectedOrder.paymentStatus === 'PENDING') && (
                  <>
                    <button
                      onClick={() => {
                        confirmPayment(selectedOrder._id);
                        setSelectedOrder(null);
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Confirm Payment
                    </button>
                    <button
                      onClick={() => {
                        rejectPayment(selectedOrder._id);
                        setSelectedOrder(null);
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject Payment
                    </button>
                  </>
                )}
                {selectedOrder.status !== 'Cancelled' && (
                  <button
                    onClick={() => {
                      cancelOrder(selectedOrder._id);
                      setSelectedOrder(null);
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel Order
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

type EditProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSuccess: (product: Product) => void;
};

function EditProductModal({ isOpen, onClose, product, onSuccess }: EditProductModalProps) {
  const [form, setForm] = useState<Product>(product);

  useEffect(() => {
    setForm(product);
  }, [product]);

  if (!isOpen) return null;

  const updateField = (field: keyof Product, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-lg font-bold text-gray-900">Edit Product</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle size={22} />
          </button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={form.price}
              onChange={(event) => updateField('price', Number(event.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Original Price</label>
            <input
              type="number"
              value={form.originalPrice ?? ''}
              onChange={(event) => updateField('originalPrice', Number(event.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              value={form.stock ?? 0}
              onChange={(event) => updateField('stock', Number(event.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <input
              value={form.category ?? ''}
              onChange={(event) => updateField('category', event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Badge</label>
            <input
              value={form.badge ?? ''}
              onChange={(event) => updateField('badge', event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description ?? ''}
              onChange={(event) => updateField('description', event.target.value)}
              className="min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t p-5">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSuccess(form)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
