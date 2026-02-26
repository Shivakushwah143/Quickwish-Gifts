
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
    const safeProductPrice = Number.isFinite(Number(productPrice)) ? Number(productPrice) : 0;
    const safeOriginalPrice = Number.isFinite(Number(originalPrice)) ? Number(originalPrice) : undefined;
    const displayPrice =
        safeProductPrice > 0
            ? safeProductPrice
            : safeOriginalPrice && safeOriginalPrice > 0
                ? safeOriginalPrice
                : 0;

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleCreateOrder = async () => {
        setLoading(true);
        setError('');
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


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
            pn: 'QuickWish Atelier',
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

    const upiId = 'giftstore@upi';
    const upiLink = generateUPILink(upiId, displayPrice);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiLink)}`;

    const upiOptions = [
        { name: 'PhonePe', id: 'phonpe@ybl', color: 'bg-[color:var(--wine)]' },
        { name: 'Google Pay', id: 'gpay@okaxis', color: 'bg-[color:var(--wine)]' },
        { name: 'Paytm', id: 'paytm@paytm', color: 'bg-[color:var(--wine)]' },
        { name: 'BHIM UPI', id: 'bhim@upi', color: 'bg-[color:var(--wine)]' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[color:var(--border)]">
                    <div className="flex items-center">
                        <ShoppingCart className="w-6 h-6 text-[color:var(--wine)] mr-2" />
                        <h2 className="text-xl font-bold text-[color:var(--plum)]">
                            {currentStep === 1 ? 'Complete Your Order' : 'Payment Options'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-[color:var(--muted)]">
                        <X size={24} />
                    </button>
                </div>

                {/* Step Indicator */}
                <div className="px-6 py-4 bg-[color:var(--ivory)]">
                    <div className="flex items-center justify-center space-x-4">
                        <div className={`flex items-center ${currentStep >= 1 ? 'text-[color:var(--wine)]' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[color:var(--wine)] text-white' : 'bg-gray-300 text-[color:var(--muted)]'}`}>
                                1
                            </div>
                            <span className="ml-2 text-sm font-medium">Shipping</span>
                        </div>
                        <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-[color:var(--wine)]' : 'bg-gray-300'}`}></div>
                        <div className={`flex items-center ${currentStep >= 2 ? 'text-[color:var(--wine)]' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[color:var(--wine)] text-white' : 'bg-gray-300 text-[color:var(--muted)]'}`}>
                                2
                            </div>
                            <span className="ml-2 text-sm font-medium">Payment</span>
                        </div>
                        <div className={`w-12 h-0.5 ${currentStep >= 3 ? 'bg-[color:var(--wine)]' : 'bg-gray-300'}`}></div>
                        <div className={`flex items-center ${currentStep >= 3 ? 'text-[color:var(--wine)]' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-[color:var(--wine)] text-white' : 'bg-gray-300 text-[color:var(--muted)]'}`}>
                                3
                            </div>
                            <span className="ml-2 text-sm font-medium">Confirmation</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {currentStep === 1 ? (
                        // Step 1: Shipping Address
                        <div className="space-y-6">
                            {/* Product Summary */}
                            <div className="bg-[color:var(--ivory)] rounded-lg p-4">
                                <h3 className="font-semibold text-[color:var(--plum)] mb-3">Order Summary</h3>
                                <div className="flex items-center space-x-4">
                                    {productImage && (
                                        <img src={productImage} alt={productName} className="w-16 h-16 object-cover rounded-lg" />
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-medium text-[color:var(--plum)]">{productName}</h4>
                                        <p className="text-lg font-bold text-[color:var(--wine)]">₹{displayPrice}</p>
                                        <span className="lux-pill inline-flex mt-2 px-2 py-0.5 text-[10px]">
                                            Same Day Delivery - ₹49 extra (Indore only)
                                        </span>
                                    </div>
                                    
                                </div>
                            </div>

                                                        <div>
                                <h3 className="font-semibold text-[color:var(--plum)] mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Shipping Address
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[color:var(--muted)] mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={shippingAddress.name}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--gold)] focus:border-transparent"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[color:var(--muted)] mb-1">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={shippingAddress.phone}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--gold)] focus:border-transparent"
                                            placeholder="Enter your phone number"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-[color:var(--muted)] mb-1">Street Address *</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={shippingAddress.street}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--gold)] focus:border-transparent"
                                            placeholder="Street address, P.O. Box, company name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[color:var(--muted)] mb-1">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--gold)] focus:border-transparent"
                                            placeholder="Enter your city"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[color:var(--muted)] mb-1">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={shippingAddress.state}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--gold)] focus:border-transparent"
                                            placeholder="Enter your state (optional)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[color:var(--muted)] mb-1">PIN Code *</label>
                                        <input
                                            type="text"
                                            name="pinCode"
                                            value={shippingAddress.pinCode}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--gold)] focus:border-transparent"
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
                                className="w-full bg-[color:var(--wine)] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#3b182f] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    ) : currentStep === 2 ? (
                     
                        <div className="space-y-6">
                            {/* Order Confirmation */}
                            <div className="bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/40 rounded-lg p-4">
                                <h3 className="font-semibold text-[color:var(--plum)] mb-2">Order Created Successfully!</h3>
                                <p className="text-[color:var(--muted)] text-sm">Order ID: <span className="font-mono">{orderId}</span></p>
                            </div>

                            {/* Payment Methods */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-[color:var(--plum)] flex items-center">
                                            <CreditCard className="w-5 h-5 mr-2" />
                                            Scan to Pay
                                        </h3>
                                        <button
                                            onClick={() => copyToClipboard(orderId)}
                                            className="text-xs text-[color:var(--wine)] hover:text-[color:var(--plum)]"
                                        >
                                            Copy Order ID
                                        </button>
                                    </div>

                                    <div className="bg-[color:var(--ivory)] border border-[color:var(--border)] rounded-xl p-4 flex flex-col items-center text-center">
                                        <img
                                            src={qrUrl}
                                            alt="UPI QR code"
                                            className="w-56 h-56 rounded-lg border border-[color:var(--border)] bg-white"
                                        />
                                        <p className="mt-3 text-sm text-[color:var(--muted)]">
                                            Scan with any UPI app to pay <span className="font-semibold text-[color:var(--wine)]">₹{displayPrice}</span>
                                        </p>
                                        <div className="mt-2 text-xs text-[color:var(--muted)]">
                                            UPI ID hidden for safety. Your payment note carries the order ID.
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(displayPrice.toString())}
                                            className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg border border-[color:var(--border)] text-xs text-[color:var(--plum)] hover:bg-white"
                                        >
                                            Copy Amount
                                            <Copy size={14} className="ml-2" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-[color:var(--muted)] flex items-center">
                                            <Smartphone className="w-4 h-4 mr-1" />
                                            Open your UPI app and scan the code
                                        </h4>
                                        <p className="text-xs text-[color:var(--muted)]">
                                            We have removed the direct app links for a smoother, reliable payment flow.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-[color:var(--ivory)] border border-[color:var(--border)] rounded-xl p-4">
                                        <h4 className="font-medium text-[color:var(--plum)] mb-2">WhatsApp Confirmation</h4>
                                        <p className="text-[color:var(--muted)] text-sm mb-3">
                                            After payment, send your screenshot and order ID. We will confirm quickly.
                                        </p>
                                        <a
                                            href={`https://wa.me/919575930848?text=Order%20Confirmation%20for%20Order%20ID:%20${orderId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center bg-[color:var(--wine)] text-white px-4 py-2 rounded-lg hover:bg-[#3b182f] transition-colors"
                                        >
                                            <Phone className="w-4 h-4 mr-2" />
                                            Send Payment Proof
                                        </a>
                                        <button
                                            onClick={() => setCurrentStep(3)}
                                            className="mt-3 w-full border border-[color:var(--border)] text-[color:var(--plum)] px-4 py-2 rounded-lg hover:bg-white transition-colors"
                                        >
                                            I have sent the proof
                                        </button>
                                    </div>

                                    <div className="bg-[color:var(--ivory)] border border-[color:var(--border)] rounded-xl p-4">
                                        <h4 className="font-medium text-[color:var(--plum)] mb-2">How it works</h4>
                                        <ol className="text-[color:var(--muted)] text-sm space-y-2 list-decimal list-inside">
                                            <li>Scan the QR and complete payment.</li>
                                            <li>Take a screenshot of the success screen.</li>
                                            <li>Tap “Send Payment Proof” on WhatsApp.</li>
                                            <li>We verify and confirm your order.</li>
                                            <li>Delivery updates arrive shortly after.</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/40 rounded-lg p-5 text-center">
                                <h3 className="font-semibold text-[color:var(--plum)] text-lg">Payment Received</h3>
                                <p className="text-[color:var(--muted)] text-sm mt-2">
                                    We are verifying your payment. This usually takes a few minutes.
                                </p>
                                <div className="mt-4 text-xs text-[color:var(--muted)]">
                                    Order ID: <span className="font-mono text-[color:var(--plum)]">{orderId}</span>
                                </div>
                            </div>

                            <div className="lux-card p-5">
                                <h4 className="font-medium text-[color:var(--plum)] mb-3">What happens next</h4>
                                <ol className="text-[color:var(--muted)] text-sm space-y-2 list-decimal list-inside">
                                    <li>We validate your payment proof.</li>
                                    <li>Your order is confirmed by our team.</li>
                                    <li>We prepare your gift with care.</li>
                                    <li>Delivery updates are sent on WhatsApp.</li>
                                </ol>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="flex-1 border border-[color:var(--border)] text-[color:var(--plum)] px-4 py-2 rounded-lg hover:bg-white transition-colors"
                                >
                                    Back to payment
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-[color:var(--wine)] text-white px-4 py-2 rounded-lg hover:bg-[#3b182f] transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}






