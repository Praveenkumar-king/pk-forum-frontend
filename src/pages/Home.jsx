import React, { useState, useEffect } from 'react';
import { Plus, User } from 'lucide-react';
import PostCard from '../components/PostCard';
import PostModal from '../components/PostModal';
import Loader from '../components/Loader';
import { api, useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = async (search = '') => {
    setIsLoading(true);
    try {
      const res = await api.get(`/posts/all${search ? `?search=${search}` : ''}`);
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    const handleSearch = (e) => {
      // Debounce logic can be handled here or in the Navbar, using simple timeout
      const value = e.detail;
      setSearchQuery(value);
      const timeoutId = setTimeout(() => {
        fetchPosts(value);
      }, 300);
      return () => clearTimeout(timeoutId);
    };

    window.addEventListener('searchPosts', handleSearch);
    return () => window.removeEventListener('searchPosts', handleSearch);
  }, []);

  const handlePostSuccess = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedId));
  };

  return (
    <div className="space-y-6">
      {/* Create Post Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800 overflow-hidden shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              isAuthenticated ? (user?.name?.charAt(0).toUpperCase() || <User size={20} />) : <User size={20} className="text-gray-400 dark:text-gray-500" />
            )}
          </div>
          <button
            onClick={() => isAuthenticated ? setIsModalOpen(true) : toast.error('Please login to create a post')}
            className="flex-1 text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
          >
            What's on your mind?
          </button>
          <button
            onClick={() => isAuthenticated ? setIsModalOpen(true) : toast.error('Please login to create a post')}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shrink-0 shadow-md transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Feed */}
      {isLoading ? (
        <Loader />
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostDeleted={handlePostDeleted} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📭</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No posts found</h3>
          <p className="text-gray-500 dark:text-gray-400">Be the first to share something with the community!</p>
        </div>
      )}

      <PostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handlePostSuccess} 
      />
    </div>
  );
};

export default Home;
