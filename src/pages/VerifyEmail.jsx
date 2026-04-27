import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { api, useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { MailCheck } from 'lucide-react';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuthStore();
  const email = location.state?.email || searchParams.get('email') || '';
  const urlOtp = searchParams.get('otp');
  const [isVerifying, setIsVerifying] = useState(false);
  const hasAutoVerifiedRef = React.useRef(false);

  React.useEffect(() => {
    if (email && urlOtp && !isVerifying && !hasAutoVerifiedRef.current) {
      hasAutoVerifiedRef.current = true;
      handleVerify(urlOtp);
    }
  }, [email, urlOtp, isVerifying]);

  const handleVerify = async (otp) => {
    if (!email) return toast.error('Email not found. Please try logging in again.');

    setIsVerifying(true);
    const loadingToast = toast.loading('Verifying...');
    try {
      const res = await api.post('/auth/verify-email', { email, otp });
      if (res.data.success) {
        toast.success('Email verified successfully!', { id: loadingToast });
        await checkAuth(); // Update user store
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed', { id: loadingToast });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return toast.error('Email not found. Please try logging in again.');

    const loadingToast = toast.loading('Resending verification link...');
    try {
      const res = await api.post('/auth/resend-verification', { email });
      if (res.data.success) {
        toast.success('Verification link resent successfully!', { id: loadingToast });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend link', { id: loadingToast });
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p>No email provided for verification.</p>
          <button onClick={() => navigate('/login')} className="text-blue-500 mt-4 underline">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <MailCheck size={40} className="text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isVerifying ? "Verifying Email..." : "Check your email"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isVerifying ? (
              "Please wait while we verify your account."
            ) : (
              <>We've sent a verification link to <br /><span className="font-medium text-gray-900 dark:text-gray-300">{email}</span></>
            )}
          </p>
        </div>

        {!isVerifying && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Didn't receive the link? <button onClick={handleResend} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">Resend</button>
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
