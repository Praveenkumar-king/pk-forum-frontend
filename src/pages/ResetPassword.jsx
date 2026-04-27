import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { api } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = location.state?.email || searchParams.get('email') || '';
  const urlOtp = searchParams.get('otp');
  
  const [step, setStep] = useState(urlOtp ? 2 : 1); // 1: OTP, 2: New Password
  const [otp, setOtp] = useState(urlOtp || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Email not found. Please try again.');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    setIsLoading(true);
    const loadingToast = toast.loading('Resetting password...');
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      if (res.data.success) {
        toast.success('Password reset successfully! Please login.', { id: loadingToast });
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password', { id: loadingToast });
      if (error.response?.status === 400) setStep(1); // Go back if OTP is invalid
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p>Invalid session.</p>
          <button onClick={() => navigate('/forgot-password')} className="text-blue-500 mt-4 underline">Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
          {step === 1 ? (
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              We've sent a password reset link to <br/><span className="font-medium text-gray-900 dark:text-gray-300">{email}</span>
              <br/><br/>Please click the link in your email to continue.
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Create a new strong password
            </p>
          )}
        </div>

        {step === 1 ? null : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
