"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, Users, ShoppingCart, TrendingUp, LogOut, Shield, ShieldAlert, CheckCircle, XCircle, Eye, Calendar, MapPin, Phone, CreditCard, User, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import AdminAuthModal from '../components/AdminAuthModal';
import ProductShareButton from '../components/ProductShareButton';
import AddProductModal from '../components/AddProductModal';
import CreatorManagement from '../components/CreatorManagement';
import { clearAdminAuthState, hasJwtExpired } from '../utils/auth';
import { heroSlides } from '../utils/constants';


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
  storefrontGroups?: string[];
  comparisons?: PriceComparison[];
  displayOrder?: number;
  createdAt?: string;
}

type PriceComparison = {
  siteName: string;
  price: number;
  url: string;
};

type StorefrontHeroImage = {
  url: string;
  title?: string;
  subtitle?: string;
  enabled?: boolean;
  displayOrder?: number;
};

type StorefrontSettings = {
  heroImages: StorefrontHeroImage[];
  featuredProductIds: string[];
  checkoutOccasionBanner: {
    image: string;
    title: string;
    subtitle: string;
  };
  giftUpgradeImages: {
    wrapping: string;
    messageCard: string;
    ferrero: string;
  };
};

const emptyStorefrontSettings: StorefrontSettings = {
  heroImages: [],
  featuredProductIds: [],
  checkoutOccasionBanner: {
    image: '',
    title: '',
    subtitle: '',
  },
  giftUpgradeImages: {
    wrapping: '',
    messageCard: '',
    ferrero: '',
  },
};

const DEFAULT_CHECKOUT_BANNER = {
  image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=85',
  title: 'Add Birthday Magic',
  subtitle: 'Pair this gift with cakes, flowers, or a note',
};

const DEFAULT_GIFT_UPGRADE_IMAGES = {
  wrapping: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=900&auto=format&fit=crop&q=80',
  messageCard: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=900&auto=format&fit=crop&q=80',
  ferrero: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=900&auto=format&fit=crop&q=80',
};

const adminInputClass = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500';
const adminSecondaryButtonClass = 'min-h-10 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500 disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:disabled:text-gray-500';
const adminDangerButtonClass = 'min-h-10 rounded border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/70 dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-950/40';

const defaultHeroImages: StorefrontHeroImage[] = heroSlides.map((slide, index) => ({
  url: slide.image,
  title: slide.title,
  subtitle: slide.subtitle,
  enabled: true,
  displayOrder: index + 1,
}));

const mergeDefaultHeroImages = (images: StorefrontHeroImage[]) => {
  const imageUrls = new Set(images.map((image) => image.url));
  return [
    ...defaultHeroImages.filter((image) => !imageUrls.has(image.url)),
    ...images,
  ].map((image, index) => ({
    ...image,
    enabled: image.enabled !== false,
    displayOrder: index + 1,
  }));
};

const AWAITING_STATUSES = ['AWAITING_VERIFICATION', 'PROOF_SUBMITTED'];
const STOREFRONT_GROUP_OPTIONS = [
  { value: 'for-her', label: 'For Her' },
  { value: 'for-him', label: 'For Him' },
  { value: 'for-mom', label: 'For Mom' },
  { value: 'for-friends', label: 'For Friends' },
  { value: 'for-couples', label: 'For Couples' },
  { value: 'for-kids', label: 'For Kids' },
  { value: 'custom-gifts', label: 'Custom Gifts' },
];

const storefrontGroupLabel = (value: string) =>
  STOREFRONT_GROUP_OPTIONS.find((option) => option.value === value)?.label || value;

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
  const [reorderingProductId, setReorderingProductId] = useState<string | null>(null);
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [storefrontSettings, setStorefrontSettings] = useState<StorefrontSettings>(emptyStorefrontSettings);
  const [storefrontLoading, setStorefrontLoading] = useState(false);
  const [storefrontSaving, setStorefrontSaving] = useState(false);
  const [storefrontUploading, setStorefrontUploading] = useState('');
  const [showFeaturedPicker, setShowFeaturedPicker] = useState(false);

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
      fetchStorefrontSettings();
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

  const persistProductOrder = async (orderedProducts: Product[], activeProductId: string) => {
    const previousProducts = allProducts;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin');
        return;
      }

      setReorderingProductId(activeProductId);
      setError('');
      setAllProducts(orderedProducts);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/product/reorder`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderedIds: orderedProducts.map((item) => item._id) }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to reorder product');
      }

      setAllProducts(Array.isArray(data.products) ? data.products : []);
      setSuccessMessage('Product order updated');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      setAllProducts(previousProducts);
      setError(err instanceof Error ? err.message : 'Failed to reorder product');
    } finally {
      setReorderingProductId(null);
    }
  };

  const moveProduct = (productId: string, targetIndex: number) => {
    const currentIndex = allProducts.findIndex((item) => item._id === productId);
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= allProducts.length || currentIndex === targetIndex) {
      return;
    }

    const nextProducts = [...allProducts];
    const [movedProduct] = nextProducts.splice(currentIndex, 1);
    nextProducts.splice(targetIndex, 0, movedProduct);
    void persistProductOrder(nextProducts, productId);
  };

  const handleReorderProduct = (productId: string, direction: 'up' | 'down') => {
    const currentIndex = allProducts.findIndex((item) => item._id === productId);
    moveProduct(productId, direction === 'up' ? currentIndex - 1 : currentIndex + 1);
  };

  const handleDropProduct = (targetProductId: string) => {
    if (!draggedProductId || draggedProductId === targetProductId) {
      setDraggedProductId(null);
      return;
    }

    const targetIndex = allProducts.findIndex((item) => item._id === targetProductId);
    moveProduct(draggedProductId, targetIndex);
    setDraggedProductId(null);
  };

  const fetchStorefrontSettings = async () => {
    try {
      setStorefrontLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/storefront-settings`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (data?.success) {
        const settings = data.settings || {};
        const heroImages = mergeDefaultHeroImages(settings.heroImages || []);
        setStorefrontSettings({
          ...emptyStorefrontSettings,
          ...settings,
          heroImages,
          checkoutOccasionBanner: {
            ...emptyStorefrontSettings.checkoutOccasionBanner,
            ...(settings.checkoutOccasionBanner || {}),
          },
          giftUpgradeImages: {
            ...emptyStorefrontSettings.giftUpgradeImages,
            ...(settings.giftUpgradeImages || {}),
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch storefront settings');
    } finally {
      setStorefrontLoading(false);
    }
  };

  const saveStorefrontSettings = async (nextSettings = storefrontSettings) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin');
        return;
      }

      setStorefrontSaving(true);
      setError('');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/admin/storefront-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextSettings),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to save storefront settings');
      }

      setStorefrontSettings({
        ...emptyStorefrontSettings,
        ...data.settings,
        heroImages: data.settings?.heroImages || [],
        checkoutOccasionBanner: {
          ...emptyStorefrontSettings.checkoutOccasionBanner,
          ...(data.settings?.checkoutOccasionBanner || {}),
        },
        giftUpgradeImages: {
          ...emptyStorefrontSettings.giftUpgradeImages,
          ...(data.settings?.giftUpgradeImages || {}),
        },
      });
      setSuccessMessage('Storefront settings saved');
      setTimeout(() => setSuccessMessage(''), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save storefront settings');
    } finally {
      setStorefrontSaving(false);
    }
  };

  const uploadStorefrontImage = async (file: File, target: string): Promise<string> => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Please login as admin');

    setStorefrontUploading(target);
    const formData = new FormData();
    formData.append('image', file);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${API_BASE_URL}/admin/storefront-settings/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json().catch(() => null);
    setStorefrontUploading('');

    if (!response.ok || !data?.success || !data?.url) {
      throw new Error(data?.message || 'Image upload failed');
    }

    return data.url;
  };

  const setAndSaveStorefrontSettings = (updater: (settings: StorefrontSettings) => StorefrontSettings) => {
    const nextSettings = updater(storefrontSettings);
    setStorefrontSettings(nextSettings);
    void saveStorefrontSettings(nextSettings);
  };

  const moveStorefrontItem = <T,>(items: T[], index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return items;
    const nextItems = [...items];
    const [moved] = nextItems.splice(index, 1);
    if (moved === undefined) return items;
    nextItems.splice(targetIndex, 0, moved);
    return nextItems;
  };

  const handleStorefrontImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    target: string,
    applyUrl: (url: string) => StorefrontSettings
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const url = await uploadStorefrontImage(file, target);
      const nextSettings = applyUrl(url);
      setStorefrontSettings(nextSettings);
      await saveStorefrontSettings(nextSettings);
    } catch (err) {
      setStorefrontUploading('');
      setError(err instanceof Error ? err.message : 'Image upload failed');
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
    fetchStorefrontSettings();
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

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
      <div className="min-h-screen overflow-x-hidden bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <header className="border-b bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3 sm:flex-nowrap sm:py-0">
              <div className="flex min-w-0 items-center">
                <Shield className="mr-2 h-7 w-7 shrink-0 text-indigo-600 sm:mr-3 sm:h-8 sm:w-8" />
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">Admin Dashboard</h1>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Welcome back, {adminUsername}</p>
                </div>
              </div>

              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                {awaitingCount > 0 && (
                  <button
                    onClick={() => {
                      setView('orders');
                      setPaymentFilter('AWAITING_VERIFICATION');
                      fetchOrders('AWAITING_VERIFICATION');
                    }}
                    className="inline-flex min-h-11 max-w-full items-center rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-amber-600 sm:px-4 sm:text-sm"
                  >
                    <ShieldAlert size={18} className="mr-1.5 shrink-0 sm:mr-2" />
                    <span className="truncate">Payments: {awaitingCount} awaiting</span>
                  </button>
                )}

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="hidden min-h-11 items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 sm:flex"
                >
                  <Plus size={20} className="mr-2" />
                  Add Product
                </button>

                <button
                  onClick={handleLogout}
                  className="inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <LogOut size={20} className="mr-1 shrink-0" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="mx-auto mt-4 max-w-7xl px-3 sm:mt-6 sm:px-6 lg:px-8">
          <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
          <div className="flex min-w-max border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setView('stats')}
              className={`min-h-11 px-4 py-3 text-sm font-medium sm:px-6 sm:py-4 ${view === 'stats' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setView('orders');
                fetchOrders(paymentFilter);
                fetchAwaitingCount();
              }}
              className={`min-h-11 px-4 py-3 text-sm font-medium sm:px-6 sm:py-4 ${view === 'orders' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
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
              className={`min-h-11 px-4 py-3 text-sm font-medium sm:px-6 sm:py-4 ${view === 'products' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Products
            </button>
            <button
              onClick={() => setView('creators')}
              className={`min-h-11 px-4 py-3 text-sm font-medium sm:px-6 sm:py-4 ${view === 'creators' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Creators
            </button>
            <button
              onClick={() => {
                setView('storefront');
                fetchStorefrontSettings();
                fetchAllProducts();
              }}
              className={`min-h-11 px-4 py-3 text-sm font-medium sm:px-6 sm:py-4 ${view === 'storefront' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Storefront
            </button>
          </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
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
                  className="mb-6 flex w-full flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between sm:p-5"
                >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="shrink-0 rounded-lg bg-amber-100 p-3">
                      <ShieldAlert className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-amber-900">Payments Awaiting Verification</p>
                      <p className="text-sm text-amber-700">Customers have paid and are waiting for you to confirm in the UPI app.</p>
                    </div>
                  </div>
                  <span className="self-start text-2xl font-bold text-amber-700 min-[380px]:self-center sm:text-3xl">{awaitingCount}</span>
                </button>
              ) : (
                <div className="mb-6 flex w-full items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 sm:gap-4 sm:p-5">
                  <div className="shrink-0 rounded-lg bg-green-100 p-3">
                    <ShieldAlert className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-green-900">Payments Awaiting Verification</p>
                    <p className="text-sm text-green-700">All reported payments have been reviewed. You&apos;re all caught up.</p>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="mb-8 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
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

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
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

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
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

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
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
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="min-h-11 rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-all duration-200 hover:border-indigo-500 hover:bg-indigo-50"
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
                    className="min-h-11 rounded-lg border-2 border-dashed border-amber-300 p-4 text-center transition-all duration-200 hover:border-amber-500 hover:bg-amber-50"
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
                    className="min-h-11 rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-all duration-200 hover:border-green-500 hover:bg-green-50"
                  >
                    <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">View Orders</p>
                  </button>

                  <button
                    onClick={() => {
                      setView('products');
                      fetchAllProducts();
                    }}
                    className="min-h-11 rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-all duration-200 hover:border-purple-500 hover:bg-purple-50"
                  >
                    <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Manage Products</p>
                  </button>

                  <button
                    onClick={() => setView('creators')}
                    className="min-h-11 rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-all duration-200 hover:border-pink-500 hover:bg-pink-50"
                  >
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Manage Creators</p>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between dark:bg-gray-800"
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
          ) : view === 'storefront' ? (
            <div className="space-y-5 sm:space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Storefront Content</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Control hero, featured products, checkout banner, and gift upgrade images.</p>
                  </div>
                  <button
                    onClick={() => void saveStorefrontSettings()}
                    disabled={storefrontSaving || storefrontLoading}
                    className="min-h-11 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {storefrontSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-950/60 sm:p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Featured Gifts / Our Best Picks</h3>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {storefrontSettings.featuredProductIds.length}/3 selected
                    </span>
                  </div>

                  <div className="relative mb-4">
                    <button
                      type="button"
                      onClick={() => setShowFeaturedPicker((value) => !value)}
                      disabled={storefrontSettings.featuredProductIds.length >= 3}
                      className="flex min-h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500 disabled:opacity-75 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:disabled:text-gray-500"
                    >
                      <span>
                        {storefrontSettings.featuredProductIds.length >= 3
                          ? 'Maximum 3 featured products selected'
                          : 'Add featured product'}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-300">{allProducts.length} products</span>
                    </button>

                    {showFeaturedPicker && storefrontSettings.featuredProductIds.length < 3 && (
                      <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                        {allProducts
                          .filter((product) => !storefrontSettings.featuredProductIds.includes(product._id))
                          .map((product) => (
                            <button
                              key={product._id}
                              type="button"
                              onClick={() => {
                                setAndSaveStorefrontSettings((settings) => ({
                                  ...settings,
                                  featuredProductIds: Array.from(new Set([...settings.featuredProductIds, product._id])).slice(0, 3),
                                }));
                                setShowFeaturedPicker(false);
                              }}
                              className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <img
                                src={product.images?.[0] || '/placeholder-image.jpg'}
                                alt={product.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{product.name}</span>
                                <span className="text-xs font-bold text-indigo-600">{formatPrice(product.price)}</span>
                              </span>
                            </button>
                          ))}
                        {allProducts.filter((product) => !storefrontSettings.featuredProductIds.includes(product._id)).length === 0 && (
                          <p className="p-3 text-sm text-gray-600 dark:text-gray-300">No more products available.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {storefrontSettings.featuredProductIds.map((productId, index) => {
                      const product = allProducts.find((item) => item._id === productId);
                      return (
                        <div key={productId} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                          <img
                            src={product?.images?.[0] || '/placeholder-image.jpg'}
                            alt={product?.name || productId}
                            className="h-36 w-full object-cover"
                          />
                          <div className="space-y-3 p-3">
                            <div>
                              <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{product?.name || productId}</p>
                              <p className="text-sm font-bold text-indigo-600">{product ? formatPrice(product.price) : 'Saved product'}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">Position {index + 1}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setAndSaveStorefrontSettings((settings) => ({
                                  ...settings,
                                  featuredProductIds: moveStorefrontItem(settings.featuredProductIds, index, 'up'),
                                }))}
                                disabled={index === 0}
                                className={adminSecondaryButtonClass}
                              >
                                Up
                              </button>
                              <button
                                onClick={() => setAndSaveStorefrontSettings((settings) => ({
                                  ...settings,
                                  featuredProductIds: moveStorefrontItem(settings.featuredProductIds, index, 'down'),
                                }))}
                                disabled={index === storefrontSettings.featuredProductIds.length - 1}
                                className={adminSecondaryButtonClass}
                              >
                                Down
                              </button>
                              <button
                                onClick={() => setAndSaveStorefrontSettings((settings) => ({
                                  ...settings,
                                  featuredProductIds: settings.featuredProductIds.filter((id) => id !== productId),
                                }))}
                                className={adminDangerButtonClass}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">Hero Images</h3>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                  Active images are used by the storefront carousel. Disabled images stay saved but hidden.
                </p>
                <label className={`${adminSecondaryButtonClass} mb-4 inline-flex cursor-pointer items-center`}>
                  {storefrontUploading === 'hero-new' ? 'Uploading...' : 'Upload Hero Image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => void handleStorefrontImageUpload(event, 'hero-new', (url) => ({
                      ...storefrontSettings,
                      heroImages: [
                        ...storefrontSettings.heroImages,
                        { url, title: '', subtitle: '', enabled: true, displayOrder: storefrontSettings.heroImages.length + 1 },
                      ],
                    }))}
                  />
                </label>
                <div className="space-y-3">
                  {storefrontSettings.heroImages.map((image, index) => (
                    <div
                      key={`${image.url}-${index}`}
                      className={`grid gap-3 rounded-lg border p-3 md:grid-cols-[120px_1fr_auto] ${
                        image.enabled === false
                          ? 'border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-950'
                          : 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/40'
                      }`}
                    >
                      <div>
                        <img src={image.url} alt={image.title || 'Hero image'} className="h-24 w-full rounded-lg object-cover" />
                        <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          image.enabled === false
                            ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        }`}>
                          {image.enabled === false ? 'Disabled' : 'Active'}
                        </span>
                      </div>
                      <div className="grid gap-2">
                        <input
                          value={image.title || ''}
                          onChange={(event) => setStorefrontSettings((settings) => ({
                            ...settings,
                            heroImages: settings.heroImages.map((item, i) => i === index ? { ...item, title: event.target.value } : item),
                          }))}
                          placeholder="Hero title"
                          className={adminInputClass}
                        />
                        <input
                          value={image.subtitle || ''}
                          onChange={(event) => setStorefrontSettings((settings) => ({
                            ...settings,
                            heroImages: settings.heroImages.map((item, i) => i === index ? { ...item, subtitle: event.target.value } : item),
                          }))}
                          placeholder="Hero subtitle"
                          className={adminInputClass}
                        />
                      </div>
                      <div className="flex flex-wrap items-start gap-2">
                        <button
                          onClick={() => setAndSaveStorefrontSettings((settings) => ({
                            ...settings,
                            heroImages: settings.heroImages.map((item, i) => i === index ? { ...item, enabled: !item.enabled } : item),
                          }))}
                          className={adminSecondaryButtonClass}
                        >
                          {image.enabled === false ? 'Enable' : 'Disable'}
                        </button>
                        <button
                          onClick={() => setAndSaveStorefrontSettings((settings) => ({
                            ...settings,
                            heroImages: moveStorefrontItem(settings.heroImages, index, 'up'),
                          }))}
                          disabled={index === 0}
                          className={adminSecondaryButtonClass}
                        >
                          Up
                        </button>
                        <button
                          onClick={() => setAndSaveStorefrontSettings((settings) => ({
                            ...settings,
                            heroImages: moveStorefrontItem(settings.heroImages, index, 'down'),
                          }))}
                          disabled={index === storefrontSettings.heroImages.length - 1}
                          className={adminSecondaryButtonClass}
                        >
                          Down
                        </button>
                        <label className={`${adminSecondaryButtonClass} inline-flex cursor-pointer items-center`}>
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => void handleStorefrontImageUpload(event, `hero-${index}`, (url) => ({
                              ...storefrontSettings,
                              heroImages: storefrontSettings.heroImages.map((item, i) => i === index ? { ...item, url } : item),
                            }))}
                          />
                        </label>
                        <button
                          onClick={() => setAndSaveStorefrontSettings((settings) => ({
                            ...settings,
                            heroImages: settings.heroImages.filter((_, i) => i !== index),
                          }))}
                          className={adminDangerButtonClass}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">Checkout Occasion Banner</h3>
                  <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <img
                      src={storefrontSettings.checkoutOccasionBanner.image || DEFAULT_CHECKOUT_BANNER.image}
                      alt="Checkout occasion banner"
                      className="h-36 w-full object-cover"
                    />
                    {!storefrontSettings.checkoutOccasionBanner.image && (
                      <p className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">Using default image</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      value={storefrontSettings.checkoutOccasionBanner.title}
                      onChange={(event) => setStorefrontSettings((settings) => ({
                        ...settings,
                        checkoutOccasionBanner: { ...settings.checkoutOccasionBanner, title: event.target.value },
                      }))}
                      placeholder={DEFAULT_CHECKOUT_BANNER.title}
                      className={`w-full ${adminInputClass}`}
                    />
                    <input
                      value={storefrontSettings.checkoutOccasionBanner.subtitle}
                      onChange={(event) => setStorefrontSettings((settings) => ({
                        ...settings,
                        checkoutOccasionBanner: { ...settings.checkoutOccasionBanner, subtitle: event.target.value },
                      }))}
                      placeholder={DEFAULT_CHECKOUT_BANNER.subtitle}
                      className={`w-full ${adminInputClass}`}
                    />
                    <div className="flex flex-wrap gap-2">
                      <label className={`${adminSecondaryButtonClass} inline-flex min-h-11 cursor-pointer items-center rounded-lg`}>
                        Replace Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => void handleStorefrontImageUpload(event, 'checkout-banner', (url) => ({
                            ...storefrontSettings,
                            checkoutOccasionBanner: { ...storefrontSettings.checkoutOccasionBanner, image: url },
                          }))}
                        />
                      </label>
                      <button
                        onClick={() => setAndSaveStorefrontSettings((settings) => ({
                          ...settings,
                          checkoutOccasionBanner: { ...settings.checkoutOccasionBanner, image: '' },
                        }))}
                        className={`${adminDangerButtonClass} min-h-11 rounded-lg`}
                      >
                        Delete Image
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">Gift Upgrade Images</h3>
                  <div className="space-y-3">
                    {([
                      ['wrapping', 'Premium Gift Wrapping'],
                      ['messageCard', 'Personalised Message Card'],
                      ['ferrero', 'Ferrero Rocher Gift Pack'],
                    ] as const).map(([key, label]) => (
                      <div key={key} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-950/60 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={storefrontSettings.giftUpgradeImages[key] || DEFAULT_GIFT_UPGRADE_IMAGES[key]}
                            alt={label}
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                            {!storefrontSettings.giftUpgradeImages[key] && (
                              <p className="text-xs text-gray-600 dark:text-gray-300">Using default image</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <label className={`${adminSecondaryButtonClass} inline-flex min-h-11 cursor-pointer items-center text-xs`}>
                            Replace
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => void handleStorefrontImageUpload(event, `upgrade-${key}`, (url) => ({
                                ...storefrontSettings,
                                giftUpgradeImages: {
                                  ...storefrontSettings.giftUpgradeImages,
                                  [key]: url,
                                },
                              }))}
                            />
                          </label>
                          <button
                            onClick={() => setAndSaveStorefrontSettings((settings) => ({
                              ...settings,
                              giftUpgradeImages: {
                                ...settings.giftUpgradeImages,
                                [key]: '',
                              },
                            }))}
                            className={`${adminDangerButtonClass} min-h-11 text-xs`}
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Products View */
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Product Management</h2>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
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
                <div className="py-12 text-center text-gray-600 dark:text-gray-300">
                  <Package className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                  <p>No products found</p>
                </div>
              ) : (
                <div className="-mx-4 overflow-x-auto sm:mx-0">
                  <table className="min-w-[920px] divide-y divide-gray-200 dark:divide-gray-800 sm:min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Product</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Price</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Stock</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                      {allProducts.map((product, index) => (
                        <tr
                          key={product._id}
                          draggable={reorderingProductId === null}
                          onDragStart={() => setDraggedProductId(product._id)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => handleDropProduct(product._id)}
                          onDragEnd={() => setDraggedProductId(null)}
                          className={`${draggedProductId === product._id ? 'opacity-70' : ''} ${draggedProductId && draggedProductId !== product._id ? 'border-t-2 border-indigo-300 dark:border-indigo-500' : ''}`}
                        >
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
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  <span className="mr-2 cursor-grab text-gray-500 dark:text-gray-400" title="Drag to reorder">::</span>
                                  {product.name}
                                </div>
                                {product.badge && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                    {product.badge}
                                  </span>
                                )}
                                {product.storefrontGroups && product.storefrontGroups.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {product.storefrontGroups.map((group) => (
                                      <span key={group} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
                                        {storefrontGroupLabel(group)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                            ₹{product.price}
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="ml-2 text-xs text-gray-500 line-through dark:text-gray-400">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{product.category || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{product.stock || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleReorderProduct(product._id, 'up')}
                                disabled={index === 0 || reorderingProductId !== null}
                                className={`${adminSecondaryButtonClass} inline-flex items-center px-2 py-1 text-xs`}
                                aria-label={`Move ${product.name} up`}
                              >
                                <ArrowUp size={14} className="mr-1" />
                                Up
                              </button>
                              <button
                                onClick={() => handleReorderProduct(product._id, 'down')}
                                disabled={index === allProducts.length - 1 || reorderingProductId !== null}
                                className={`${adminSecondaryButtonClass} inline-flex items-center px-2 py-1 text-xs`}
                                aria-label={`Move ${product.name} down`}
                              >
                                <ArrowDown size={14} className="mr-1" />
                                Down
                              </button>
                              <ProductShareButton
                                slug={product._id}
                                title={product.name}
                                price={product.price}
                                image={product.images?.[0]}
                                className="h-8 w-8 rounded-full border border-[#ead7c5] bg-white text-[#6f5d66] shadow-sm hover:text-[#b54e36]"
                              />
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="flex items-center text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-200"
                              >
                                <Edit size={16} className="mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="flex items-center text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-200"
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
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

  const updateField = (field: keyof Product, value: string | number | string[] | PriceComparison[]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleStorefrontGroup = (value: string) => {
    const current = form.storefrontGroups || [];
    updateField(
      'storefrontGroups',
      current.includes(value)
        ? current.filter((group) => group !== value)
        : [...current, value]
    );
  };

  const addComparison = () => {
    updateField('comparisons', [...(form.comparisons || []), { siteName: '', price: 0, url: '' }]);
  };

  const removeComparison = (index: number) => {
    updateField('comparisons', (form.comparisons || []).filter((_, i) => i !== index));
  };

  const updateComparison = (index: number, field: keyof PriceComparison, value: string | number) => {
    updateField(
      'comparisons',
      (form.comparisons || []).map((comparison, i) =>
        i === index ? { ...comparison, [field]: value } : comparison
      )
    );
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
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Storefront Groups</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STOREFRONT_GROUP_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={(form.storefrontGroups || []).includes(option.value)}
                    onChange={() => toggleStorefrontGroup(option.value)}
                    className="mr-2"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Price Comparisons</label>
              <button
                type="button"
                onClick={addComparison}
                className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Add
              </button>
            </div>
            <div className="space-y-3">
              {(form.comparisons || []).map((comparison, index) => (
                <div key={index} className="grid gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1fr_120px_1fr_auto]">
                  <input
                    value={comparison.siteName}
                    onChange={(event) => updateComparison(index, 'siteName', event.target.value)}
                    placeholder="Site name"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    value={comparison.price || ''}
                    onChange={(event) => updateComparison(index, 'price', Number(event.target.value))}
                    placeholder="Price"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="url"
                    value={comparison.url}
                    onChange={(event) => updateComparison(index, 'url', event.target.value)}
                    placeholder="https://example.com/product"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeComparison(index)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
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
