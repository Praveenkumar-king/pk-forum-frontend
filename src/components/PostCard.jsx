import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { User, MessageSquare, Heart, Share2, Trash2, X, Eye, Lock, Clock, Copy, Check } from 'lucide-react';
import { useAuthStore, api } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useAuthStore();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsCount, setCommentsCount] = useState(0);
  
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPublic, setIsPublic] = useState(post.is_public ?? true);
  const [password, setPassword] = useState('');
  const [expiryHours, setExpiryHours] = useState(0);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (post.likes) {
      setLikesCount(post.likes.length);
      setIsLiked(post.likes.some(like => like.user_id === user?.id));
    }
    if (post.comments) {
      setCommentsCount(post.comments.length);
    }
  }, [post, user]);

  const handleLike = async () => {
    if (!user) return toast.error('Please login to like');
    try {
      const res = await api.post(`/posts/${post.id}/like`);
      if (res.data.success) {
        setIsLiked(res.data.liked);
        setLikesCount(prev => res.data.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const loadComments = async () => {
    try {
      const res = await api.get(`/posts/${post.id}/comments`);
      if (res.data.success) {
        setComments(res.data.comments);
        setCommentsCount(res.data.comments.length);
      }
    } catch (error) {
      toast.error('Failed to load comments');
    }
  };

  const toggleComments = () => {
    if (!showComments && comments.length === 0) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to comment');
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/posts/${post.id}/comment`, { content: newComment });
      if (res.data.success) {
        setComments([...comments, res.data.comment]);
        setCommentsCount(prev => prev + 1);
        setNewComment('');
        toast.success('Comment added');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) return;
    try {
      const res = await api.put(`/posts/comment/${commentId}`, { content: editCommentText });
      if (res.data.success) {
        setComments(comments.map(c => c.id === commentId ? res.data.comment : c));
        setEditingCommentId(null);
        toast.success('Comment updated');
      }
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await api.delete(`/posts/comment/${commentId}`);
      if (res.data.success) {
        setComments(comments.filter(c => c.id !== commentId));
        setCommentsCount(prev => prev - 1);
        toast.success('Comment deleted');
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await api.delete(`/posts/${post.id}`);
      if (res.data.success) {
        toast.success('Post deleted');
        if (onPostDeleted) onPostDeleted(post.id);
      }
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleShare = async () => {
    try {
      const res = await api.patch(`/posts/${post.id}/share`, {
        isPublic,
        password: password || null,
        expiryHours: Number(expiryHours)
      });
      if (res.data.success) {
        const link = `${window.location.origin}/share/${post.id}`;
        setShareLink(link);
        toast.success('Share link generated!');
      }
    } catch (error) {
      toast.error('Failed to generate share link');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-shadow relative">
      {user?.id === post.user_id && (
        <button onClick={handleDelete} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition-colors" title="Delete Post">
          <Trash2 size={18} />
        </button>
      )}

      <div className="flex items-center gap-3 mb-4 pr-8">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium overflow-hidden shrink-0">
          {post.users?.avatar_url ? (
            <img src={post.users.avatar_url} alt={post.users.name} className="w-full h-full object-cover" />
          ) : (
            post.users?.name?.charAt(0).toUpperCase() || <User size={20} />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{post.users?.name || 'Unknown User'}</h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{post.title}</h2>
        {post.content && (
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        )}
        {post.image_url && (
          <div className="mt-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img src={post.image_url} alt={post.title} className="w-full h-auto object-cover max-h-96" />
          </div>
        )}
        {post.caption && (
          <p className="text-sm text-gray-500 italic mt-2">{post.caption}</p>
        )}
      </div>

      <div className="mt-6 flex items-center gap-6 border-t border-gray-100 dark:border-gray-800 pt-4">
        <button onClick={handleLike} className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
          <Heart size={18} className={isLiked ? 'fill-red-500' : ''} />
          <span className="text-sm font-medium">{likesCount} Like{likesCount !== 1 ? 's' : ''}</span>
        </button>
        <button onClick={toggleComments} className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
          <MessageSquare size={18} />
          <span className="text-sm font-medium">{commentsCount} Comment{commentsCount !== 1 ? 's' : ''}</span>
        </button>
        {user?.id === post.user_id && (
          <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors ml-auto">
            <Share2 size={18} />
            <span className="text-sm font-medium">Share</span>
          </button>
        )}
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
          {user ? (
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
              />
              <button type="submit" disabled={!newComment.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                Post
              </button>
            </form>
          ) : (
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">Please <a href="/login" className="text-blue-500 font-medium hover:underline">login</a> to add a comment.</p>
            </div>
          )}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex shrink-0 items-center justify-center text-xs font-medium overflow-hidden">
                   {c.users?.avatar_url ? <img src={c.users.avatar_url} className="w-full h-full object-cover" /> : c.users?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">{c.users?.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">{c.created_at ? format(new Date(c.created_at), 'dd MMM yyyy, hh:mm a') : ''}</span>
                      {c.is_edited && <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full font-medium">Edited</span>}
                    </div>
                  </div>
                  {editingCommentId === c.id ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="flex-1 px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                        autoFocus
                      />
                      <button onClick={() => handleEditComment(c.id)} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors">Save</button>
                      <button onClick={() => setEditingCommentId(null)} className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded-lg text-xs font-medium transition-colors">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 dark:text-gray-300">{c.content}</p>
                      {user?.id === c.user_id && (
                        <div className="flex gap-3 mt-2">
                          <button onClick={() => { setEditingCommentId(c.id); setEditCommentText(c.content); }} className="text-xs text-blue-500 hover:text-blue-600 font-medium">Edit</button>
                          <button onClick={() => handleDeleteComment(c.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#111827] w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Share2 size={18} className="text-blue-500" /> Share Post
              </div>
              <button onClick={() => {setShowShareModal(false); setShareLink('');}} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <p className="text-gray-300 text-sm italic truncate">"{post.title}"</p>

              <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                <div className="flex gap-3 items-center">
                  <Eye className="text-gray-400" size={20} />
                  <div>
                    <p className="text-white font-medium text-sm">Public Access</p>
                    <p className="text-xs text-gray-400">Anyone with the link can view</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                  <Lock size={16} className="text-gray-400" /> Password Protection (optional)
                </div>
                {/* Hidden input to trap Chrome autofill so it doesn't target the search bar */}
                <input type="text" style={{display: 'none'}} name="fake_username_trap" aria-hidden="true" autoComplete="username" />
                <input
                  type="password"
                  name="share_new_password"
                  autoComplete="new-password"
                  placeholder="Leave empty for no password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 text-white text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                  <Clock size={16} className="text-gray-400" /> Link Expiry (optional)
                </div>
                <select 
                  value={expiryHours} 
                  onChange={(e) => setExpiryHours(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 text-white text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  <option value={0}>Never expires</option>
                  <option value={1}>1 hour</option>
                  <option value={4}>4 Hours</option>
                  <option value={8}>8 Hours</option>
                  <option value={12}>12 Hours</option>
                  <option value={48}>2 Days</option>
                  <option value={120}>5 Days</option>
                  <option value={360}>15 Days</option>
                  <option value={600}>25 Days</option>
                  <option value={720}>30 Days</option>
                </select>
              </div>

              {!shareLink ? (
                <button onClick={handleShare} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Share2 size={18} /> Generate Share Link
                </button>
              ) : (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-3">
                  <p className="text-sm text-blue-400 font-medium text-center">Link ready to share!</p>
                  <div className="flex gap-2">
                    <input readOnly value={shareLink} className="flex-1 bg-black/20 text-blue-100 text-xs px-3 py-2 rounded-lg border border-blue-500/30 outline-none" />
                    <button onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg transition-colors flex shrink-0 items-center justify-center">
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
