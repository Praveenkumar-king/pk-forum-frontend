import React, { useState, useEffect, useRef } from 'react';
import { Mail, Calendar, Key, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { api, useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import DeleteAccountModal from '../components/DeleteAccountModal';
import OTPInput from '../components/OTPInput';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFlowStep, setPasswordFlowStep] = useState(1); // 1: input, 2: otp
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { user, setUser } = useAuthStore();

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data.success) {
        setProfileData(res.data.user);
        setNewName(res.data.user.name);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be less than 5MB');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploadingAvatar(true);
    const loadingToast = toast.loading('Uploading profile picture...');
    try {
      const res = await api.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setProfileData({ ...profileData, avatar_url: res.data.user.avatar_url });
        setUser({ ...user, avatar_url: res.data.user.avatar_url });
        toast.success('Profile picture updated!', { id: loadingToast });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image', { id: loadingToast });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === profileData.name) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      const res = await api.put('/users/update-name', { name: newName });
      if (res.data.success) {
        setProfileData({ ...profileData, name: res.data.user.name });
        setUser({ ...user, name: res.data.user.name });
        toast.success('Name updated successfully');
        setIsEditingName(false);
      }
    } catch (error) {
      toast.error('Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSendPasswordOtp = async () => {
    if (passwords.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsSendingOtp(true);
    try {
      const res = await api.post('/email/send-otp', { email: profileData.email, type: 'change_password' });
      if (res.data.success) {
        toast.success('OTP sent to your email');
        setPasswordFlowStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyPasswordOtp = async (otp) => {
    setIsChangingPwd(true);
    const loadingToast = toast.loading('Updating password...');
    try {
      const res = await api.put('/users/change-password-otp', { otp, newPassword: passwords.newPassword });
      if (res.data.success) {
        toast.success('Password changed successfully!', { id: loadingToast });
        setIsChangingPassword(false);
        setPasswordFlowStep(1);
        setPasswords({ newPassword: '', confirmPassword: '' });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP', { id: loadingToast });
    } finally {
      setIsChangingPwd(false);
    }
  };

  if (isLoading) return <Loader fullScreen />;
  if (!profileData) return <div className="text-center py-10">Failed to load profile</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 relative">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-12 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-lg relative group">
              {profileData.avatar_url ? (
                <img src={profileData.avatar_url} alt={profileData.name} className={`w-full h-full object-cover ${isUploadingAvatar ? 'opacity-50' : ''}`} />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 ${isUploadingAvatar ? 'opacity-50' : ''}`}>
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div 
                onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  {isUploadingAvatar ? 'Uploading...' : 'Change'}
                </span>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </div>

            <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
              {isEditingName ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-2xl font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 text-gray-900 dark:text-white w-full max-w-[200px]"
                    autoFocus
                  />
                  <button onClick={handleUpdateName} disabled={isSavingName} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                    <Check size={20} />
                  </button>
                  <button onClick={() => { setIsEditingName(false); setNewName(profileData.name); }} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{profileData.name}</h1>
                  <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-blue-500 transition-colors">
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
              <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1 mt-1">
                <ShieldAlert size={14} className={profileData.is_verified ? "text-green-500" : "text-yellow-500"} />
                {profileData.role} • {profileData.is_verified ? 'Verified' : 'Unverified'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <Mail className="text-blue-500" size={20} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{profileData.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <Calendar className="text-purple-500" size={20} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Joined</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{profileData.created_at ? format(new Date(profileData.created_at), 'MMM dd, yyyy') : 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <div className="bg-orange-100 dark:bg-orange-500/20 text-orange-500 p-1.5 rounded-lg">
                <span className="font-bold text-lg">{profileData.totalPosts || 0}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Total Posts</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Contributions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          <Key size={24} className="text-indigo-500" />
          Account Security
        </h2>

        {!isChangingPassword ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Password</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update your password using OTP verification</p>
            </div>
            <button 
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm dark:text-white"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300">Change Password</h3>
              <button onClick={() => { setIsChangingPassword(false); setPasswordFlowStep(1); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {passwordFlowStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                  />
                </div>
                <button
                  onClick={handleSendPasswordOtp}
                  disabled={isSendingOtp}
                  className="w-full mt-4 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md transition-all flex justify-center items-center"
                >
                  {isSendingOtp ? 'Sending OTP...' : 'Send OTP via Email'}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">Enter the 6-digit code sent to your email</p>
                <OTPInput length={6} onComplete={handleVerifyPasswordOtp} />
                <button 
                  onClick={() => setPasswordFlowStep(1)} 
                  className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  Back to Password Input
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/30 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2 mb-6">
          <Trash2 size={24} />
          Danger Zone
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-400">Delete Account</h3>
            <p className="text-sm text-red-700/80 dark:text-red-400/80">Permanently remove your account and all its data</p>
          </div>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-xl font-medium transition-colors border border-red-200 dark:border-red-800/50"
          >
            Delete Account
          </button>
        </div>
      </div>

      <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} />
    </div>
  );
};

export default Profile;
