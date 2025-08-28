
// components/OrderPaymentModal.tsx
import { useState } from 'react';
import { X, ShoppingCart, MapPin, Phone, User, CreditCard, Smartphone, Copy, ExternalLink } from 'lucide-react';

interface OrderPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productPrice: number;       // current price
  originalPrice?: number;     // original price for display
  discountPercent?: number;   // optional discount
  productImage?: string;
}
interface ShippingAddress {
    name: string;
    phone: string;
    street: string;
    city: string;
    pinCode: string;
    state?: string;
}

export default function OrderPaymentModal({
    isOpen,
    onClose,
    productId,
    productName,
    productPrice,
    originalPrice,
    productImage
}: OrderPaymentModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [whatsappUrl, setWhatsappUrl] = useState('');
    const [error, setError] = useState('');
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        name: '',
        phone: '',
        street: '',
        city: '',
        pinCode: '',
        state: ''
    });

    if (!isOpen) return null;

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleCreateOrder = async () => {
        setLoading(true);
        setError('');
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;


        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to place order');
                setLoading(false);
                return;
            }

            console.log('Request payload:', {
                productId,
                shippingAddress
            });

            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId,
                    shippingAddress
                })
            });

            const data = await response.json();
            console.log('Response:', data);

            if (response.ok) {
                setOrderId(data.orderId);
                setWhatsappUrl(data.whatsappUrl);
                setCurrentStep(2);
            } else {
                setError(data.message || 'Order creation failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Order creation error:', err);
        } finally {
            setLoading(false);
        }
    };
    console.log(productPrice )

    const generateUPILink = (upiId: string, amount: number) => {
        const params = new URLSearchParams({
            pa: upiId,
            pn: 'GiftHub Store',
            am: amount.toString(),
            cu: 'INR',
            tn: `Payment for Order ${orderId}`
        });
        return `upi://pay?${params.toString()}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    const upiOptions = [
        { name: 'PhonePe', id: 'phonpe@ybl', color: 'bg-purple-600' },
        { name: 'Google Pay', id: 'gpay@okaxis', color: 'bg-blue-600' },
        { name: 'Paytm', id: 'paytm@paytm', color: 'bg-blue-500' },
        { name: 'BHIM UPI', id: 'bhim@upi', color: 'bg-green-600' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center">
                        <ShoppingCart className="w-6 h-6 text-purple-600 mr-2" />
                        <h2 className="text-xl font-bold text-gray-900">
                            {currentStep === 1 ? 'Complete Your Order' : 'Payment Options'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Step Indicator */}
                <div className="px-6 py-4 bg-gray-50">
                    <div className="flex items-center justify-center space-x-4">
                        <div className={`flex items-center ${currentStep >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                1
                            </div>
                            <span className="ml-2 text-sm font-medium">Shipping</span>
                        </div>
                        <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                        <div className={`flex items-center ${currentStep >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                2
                            </div>
                            <span className="ml-2 text-sm font-medium">Payment</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {currentStep === 1 ? (
                        // Step 1: Shipping Address
                        <div className="space-y-6">
                            {/* Product Summary */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                                <div className="flex items-center space-x-4">
                                    {productImage && (
                                        <img src={productImage} alt={productName} className="w-16 h-16 object-cover rounded-lg" />
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{productName}</h4>
                                        <p className="text-lg font-bold text-purple-600">₹{originalPrice}</p>
                                        
                                        
                                    </div>
                                    
                                </div>
                            </div>

                            Shipping Form
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Shipping Address
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={shippingAddress.name}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={shippingAddress.phone}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Enter your phone number"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={shippingAddress.street}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Street address, P.O. Box, company name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Enter your city"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={shippingAddress.state}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Enter your state (optional)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                                        <input
                                            type="text"
                                            name="pinCode"
                                            value={shippingAddress.pinCode}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Enter PIN code"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Continue Button */}
                            <button
                                onClick={handleCreateOrder}
                                disabled={loading || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pinCode}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Creating Order...
                                    </div>
                                ) : (
                                    'Continue to Payment'
                                )}
                            </button>
                        </div>
                    ) : (
                     
                        <div className="space-y-6">
                            {/* Order Confirmation */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="font-semibold text-green-800 mb-2">Order Created Successfully!</h3>
                                <p className="text-green-700 text-sm">Order ID: <span className="font-mono">{orderId}</span></p>
                            </div>

                            {/* Payment Methods */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Choose Payment Method
                                </h3>

                                {/* UPI Payment Options */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                                        <Smartphone className="w-4 h-4 mr-1" />
                                        Pay with UPI
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {upiOptions.map((upi) => (
                                            <button
                                                key={upi.id}
                                                onClick={() => window.open(generateUPILink(upi.id, productPrice), '_blank')}
                                                className={`${upi.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-between`}
                                            >
                                                <span className="font-medium">{upi.name}</span>
                                                <ExternalLink size={16} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Manual UPI Payment */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Manual UPI Payment</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between bg-white p-3 rounded border">
                                            <div>
                                                <p className="text-sm text-gray-600">UPI ID</p>
                                                <p className="font-mono text-sm">giftstore@upi</p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard('giftstore@upi')}
                                                className="text-purple-600 hover:text-purple-700"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between bg-white p-3 rounded border">
                                            <div>
                                                <p className="text-sm text-gray-600">Amount</p>
                                                <p className="font-bold text-lg">₹{originalPrice}</p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(productPrice.toString())}
                                                className="text-purple-600 hover:text-purple-700"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* WhatsApp Support */}
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Payment Confirmation</h4>
                                    <p className="text-blue-800 text-sm mb-3">
                                        After making payment, please send screenshot to WhatsApp for order confirmation
                                    </p>
                                    <a
                                        href={`https://wa.me/919575930848?text=Order%20Confirmation%20for%20Order%20ID:%20${orderId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        Send Payment Proof on WhatsApp
                                    </a>
                                </div>

                                {/* Payment Instructions */}
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h4 className="font-medium text-yellow-900 mb-2">Payment Instructions</h4>
                                    <ol className="text-yellow-800 text-sm space-y-1 list-decimal list-inside">
                                        <li>Complete the payment using any UPI app to giftstore@upi</li>
                                        <li>Take a screenshot of the successful payment confirmation</li>
                                        <li>Click "Send Payment Proof on WhatsApp" to contact admin</li>
                                        <li>Send the screenshot with your Order ID: <span className="font-mono">{orderId}</span></li>
                                        <li>Admin will verify payment and confirm your order within 24 hours</li>
                                        <li>You will receive shipping details after payment confirmation</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}