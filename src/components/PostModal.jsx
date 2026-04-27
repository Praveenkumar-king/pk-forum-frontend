import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../store/useAuthStore';

const PostModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [caption, setCaption] = useState('');
  const [mode, setMode] = useState('text'); // 'text' or 'image'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      return toast.error('Title is required');
    }
    if (mode === 'text' && !content.trim()) {
      return toast.error('Content is required for text posts');
    }
    if (mode === 'image' && !imageFile) {
      return toast.error('Image is required for image posts');
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Posting...');

    try {
      let uploadedImageUrl = '';
      if (mode === 'image') {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await api.post('/posts/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (!uploadRes.data.success) throw new Error('Image upload failed');
        uploadedImageUrl = uploadRes.data.imageUrl;
      }

      const payload = {
        title,
        content: mode === 'text' ? content : '',
        image_url: uploadedImageUrl,
        caption: caption
      };

      const res = await api.post('/posts/create', payload);
      if (res.data.success) {
        toast.success('Post created successfully!', { id: loadingToast });
        setTitle('');
        setContent('');
        setImageFile(null);
        setImagePreview('');
        setCaption('');
        onSuccess(res.data.post);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex gap-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={() => setMode('text')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'text' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
          >
            Text Post
          </button>
          <button
            onClick={() => setMode('image')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${mode === 'image' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
          >
            <ImageIcon size={16} />
            Image Post
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Post Title (required)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
              maxLength={100}
            />
          </div>

          {mode === 'text' ? (
            <div className="space-y-4">
              <textarea
                placeholder="What's on your mind? (required)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none text-base"
              />
              <div>
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-400 cursor-pointer"
                />
              </div>
              {imagePreview && (
                <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 h-48 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                   <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <div>
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
              <Send size={16} className={isSubmitting ? 'animate-pulse' : ''} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
