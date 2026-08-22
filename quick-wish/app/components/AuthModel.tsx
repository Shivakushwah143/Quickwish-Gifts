// components/AuthModal.tsx
import { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { X, Eye, EyeOff, Gift, Heart, Star } from 'lucide-react';
import { clearCustomerAuthState } from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const strategy = 'oauth_google';
      const currentPath = `${window.location.pathname}${window.location.search}`;
      const redirectUrl = `${window.location.origin}/sso-callback`;
      const redirectUrlComplete = `${window.location.origin}${currentPath || '/'}`;
      const authClient = mode === 'signup' ? signUp : signIn;

      if (!authClient) {
        setError('Google login is not ready. Please try again.');
        return;
      }

      await authClient.authenticateWithRedirect({
        strategy,
        redirectUrl,
        redirectUrlComplete,
      });
    } catch {
      setError('Google login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
    const endpoint = mode === 'signin'
      ? `${API_BASE_URL}/user/signin`
      : `${API_BASE_URL}/user/signup`;
      const body = mode === 'signin' 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, username: formData.username };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        clearCustomerAuthState();
        localStorage.setItem('token', data.token);
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('customerData', JSON.stringify({
          role: 'customer',
          token: data.token,
          user: data.user || null,
          email: data.user?.email || formData.email || null,
        }));
        onClose();
        window.location.reload();
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[color:var(--surface)] rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[color:var(--gold)]"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[color:var(--muted)] hover:text-[color:var(--wine)] transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 relative">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-[color:var(--wine)] p-3 rounded-full">
                <Gift className="w-8 h-8 text-[color:var(--ivory)]" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold lux-serif text-[color:var(--plum)] mb-2">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-[color:var(--muted)] text-sm">
              {mode === 'signin' 
                ? 'Customer sign in only.'
                : 'Create a customer account to buy gifts.'
              }
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-[color:var(--border)] bg-[color:var(--ivory)]/70 px-4 py-3 text-xs font-semibold text-[color:var(--muted)]">
            Customer authentication only. Creators should use the dedicated Creator Login page.
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <button
              type="button"
              onClick={() => void handleGoogleAuth()}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm font-semibold text-[color:var(--plum)] transition hover:bg-[color:var(--ivory)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black text-[#4285F4]">
                G
              </span>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-[color:var(--border)]" />
              <span className="text-xs font-semibold text-[color:var(--muted)]">or</span>
              <span className="h-px flex-1 bg-[color:var(--border)]" />
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[color:var(--muted)] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[color:var(--border)] rounded-xl focus:ring-2 focus:ring-[color:var(--gold)] focus:border-transparent transition-all duration-200 bg-[color:var(--ivory)]/60"
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[color:var(--muted)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[color:var(--border)] rounded-xl focus:ring-2 focus:ring-[color:var(--gold)] focus:border-transparent transition-all duration-200 bg-[color:var(--ivory)]/60"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[color:var(--muted)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-[color:var(--border)] rounded-xl focus:ring-2 focus:ring-[color:var(--gold)] focus:border-transparent transition-all duration-200 bg-[color:var(--ivory)]/60"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[color:var(--muted)] hover:text-[color:var(--wine)]"
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
              className="w-full bg-[color:var(--wine)] text-[color:var(--ivory)] py-3 px-4 rounded-xl font-semibold hover:bg-[#3b182f] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-[color:var(--muted)] text-sm">
              {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-[color:var(--wine)] hover:text-[color:var(--plum)] font-semibold transition-colors"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {mode === 'signup' && (
            <div className="mt-8 pt-6 border-t border-[color:var(--border)]">
              <div className="flex items-center justify-center space-x-4 text-xs text-[color:var(--muted)]">
                <div className="flex items-center">
                  <Heart className="w-4 h-4 text-[color:var(--gold)] mr-1" />
                  <span>10K+ moments celebrated</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-[color:var(--gold)] mr-1" />
                  <span>4.9 average rating</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
