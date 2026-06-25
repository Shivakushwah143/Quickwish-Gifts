// app/admin/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, Users, ShoppingCart, TrendingUp, LogOut, Shield } from 'lucide-react';
import AddProductModal from '../components/AddProductModal';
import AdminHeader from '../components/AdminHeader';
import CreatorManagement from '../components/CreatorManagement';
import { clearAdminAuthState, hasJwtExpired } from '../utils/auth';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [adminUsername, setAdminUsername] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const username = localStorage.getItem('adminUsername');

        if (token && username && !hasJwtExpired(token)) {
            setIsAuthenticated(true);
            setAdminUsername(username);
        } else {
            clearAdminAuthState();
            router.replace('/admin/login');
        }
    }, []);

    const handleAuthSuccess = () => {
        setIsAuthenticated(true);
        const username = localStorage.getItem('adminUsername') || '';
        setAdminUsername(username);
    };

    const handleLogout = () => {
        clearAdminAuthState();
        setIsAuthenticated(false);
        setAdminUsername('');
        router.replace('/admin/login');
    };

    const handleProductSuccess = () => {
        alert('Product created successfully!');
    };

    if (!isAuthenticated) return null;
    // Define the props interface
    interface AdminHeaderProps {
        onLogout: () => void;
        username: string;
    }

    return (
        <>
            <AdminHeader onLogout={handleLogout} username={adminUsername} />

            <div className="min-h-screen bg-gray-50 pt-16">
                {/* Dashboard Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* ... your stats cards code ... */}
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

                            {/* ... other action buttons ... */}
                        </div>
                    </div>

                    <div className="mt-6">
                        <CreatorManagement />
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mt-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                        <div className="space-y-3">
                            {/* ... recent activity items ... */}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
            <AddProductModal
                isOpen={showAddProductModal}
                onClose={() => setShowAddProductModal(false)}
                onSuccess={handleProductSuccess}
            />
        </>
    );
}
