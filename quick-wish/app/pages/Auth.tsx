// pages/auth.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import AuthModal from '../components/AuthModel';

export default function AuthPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();
  const { mode } = router.query;

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/'); // Redirect to home page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={handleClose} 
        initialMode={mode === 'signup' ? 'signup' : 'signin'}
      />
    </div>
  );
}
