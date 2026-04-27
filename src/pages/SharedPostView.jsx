import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../store/useAuthStore';
import { Lock, EyeOff, Clock, ShieldAlert, Eye, Copy, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const SharedPostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fetchPost = async (pwd = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post(`/posts/shared/${id}`, { password: pwd });
      if (res.data.success) {
        setPost(res.data.post);
        setRequiresPassword(false);
      }
    } catch (err) {
      if (err.response?.status === 401 && err.response?.data?.requiresPassword) {
        setRequiresPassword(true);
        if (pwd) setPasswordError('Incorrect password');
      } else {
        setError({
           message: err.response?.data?.message || 'Failed to load post',
           status: err.response?.status
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password) return;
    fetchPost(password);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  if (isLoading && !requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock size={32} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Protected Post</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              This post is password protected. Enter the password to view its contents.
            </p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {setPassword(e.target.value); setPasswordError('');}}
                placeholder="Enter password"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                autoFocus
              />
              {passwordError && <p className="text-red-500 text-sm mt-2 text-left">{passwordError}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Unlock Post'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    let icon = <ShieldAlert size={40} className="text-red-500" />;
    if (error.status === 410) icon = <Clock size={40} className="text-orange-500" />;
    if (error.status === 403) icon = <EyeOff size={40} className="text-gray-500" />;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center space-y-6">
          <div className="flex items-center justify-center mb-4">
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Oops!</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {error.message}
          </p>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-500 font-medium underline transition-colors mt-4 inline-block">
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      {/* Top Header Navigation */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            PK
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">PK Forum</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-sm font-medium">
            <Eye size={16} />
            <span>1 views</span>
          </div>
          <button 
            onClick={copyLink}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            <Copy size={14} /> Copy
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {post && (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 sm:p-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 dark:text-gray-500 mb-8">
                <div className="flex items-center gap-1.5">
                  <User size={16} />
                  <span>Shared by <span className="font-semibold text-gray-700 dark:text-gray-300">{post.users?.name || 'Unknown'}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  <span>{post.created_at ? format(new Date(post.created_at), 'dd MMM yyyy') : ''}</span>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-800 mb-8" />

              <div className="prose dark:prose-invert max-w-none">
                {post.content && (
                  <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}
                
                {post.image_url && (
                  <div className="mt-8 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                    <img src={post.image_url} alt={post.title} className="w-full h-auto object-cover max-h-[600px]" />
                  </div>
                )}
                
                {post.caption && (
                  <p className="text-sm text-gray-500 italic mt-3 text-center">{post.caption}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center space-y-4 flex flex-col items-center">
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                Shared via PK Forum — Secure & Private
              </p>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Create your own post for free &rarr;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SharedPostView;
