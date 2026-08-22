// components/AdminAuthModal.tsx
import { useEffect, useState } from "react";
import { X, Shield, Eye, EyeOff, Lock, User } from "lucide-react";
import { clearAdminAuthState } from "../utils/auth";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: "signin" | "signup";
}

export default function AdminAuthModal({ isOpen, onClose, onSuccess, initialMode = "signin" }: AdminAuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    bootstrapKey: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError("");
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

    const normalizedUsername = formData.username.trim().toLowerCase();
    const isSignup = mode === "signup";

    try {
      const response = await fetch(`${API_BASE_URL}/admin/${isSignup ? "signup" : "signin"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isSignup ? { "x-bootstrap-key": formData.bootstrapKey.trim() } : {}),
        },
        body: JSON.stringify({
          username: normalizedUsername,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        clearAdminAuthState();
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUsername", normalizedUsername);
        localStorage.setItem(
          "adminData",
          JSON.stringify({
            role: data?.role || "admin",
            token: data.token,
            admin: {
              username: normalizedUsername,
            },
          })
        );
        onSuccess();
        onClose();
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            aria-label="Close admin sign in"
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
            {mode === "signin" ? "Sign in to the admin panel" : "Create a protected admin account"}
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
              }}
              className={`rounded-lg py-2 transition ${mode === "signin" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`rounded-lg py-2 transition ${mode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Create Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {mode === "signup" && (
              <div>
                <label htmlFor="bootstrapKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Bootstrap Key
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    id="bootstrapKey"
                    name="bootstrapKey"
                    value={formData.bootstrapKey}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter bootstrap key"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                mode === "signin" ? "Sign In" : "Create Admin"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
