import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  if (!isOpen) return null;

  const handleNext = () => {
    if (!password) {
      return toast.error('Password is required to proceed');
    }
    setStep(2);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const loadingToast = toast.loading('Deleting account...');

    try {
      const res = await api.delete('/users/delete-account', { data: { password } });
      if (res.data.success) {
        toast.success('Account deleted successfully', { id: loadingToast });
        await logout();
        navigate('/account-deleted');
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account', { id: loadingToast });
      setStep(1); // Go back if wrong password
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
            <AlertTriangle size={24} />
            Delete Account
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                This action is permanent and cannot be undone. All your posts and profile data will be permanently removed.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter password to continue</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all dark:text-white"
                  placeholder="Your password"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-sm transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Are you absolutely sure?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Type <span className="font-bold text-red-500">Yes</span> below if you are certain. (Just click Delete for demo)
              </p>
              
              <div className="flex justify-center gap-3 pt-6">
                <button
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Yes, Delete'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
