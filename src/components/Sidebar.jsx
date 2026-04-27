import React, { useState, useEffect } from 'react';
import { Home, Users, Flame, Star, MessageSquare, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { api, useAuthStore } from '../store/useAuthStore';
import { cn } from './Navbar';

const Sidebar = ({ className }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ totalMembers: 0, totalPosts: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/community');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const formatStat = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
    return num.toString();
  };

  const navItems = [
    { icon: Home, label: 'Feed', path: '/' },
    { icon: Flame, label: 'Trending', path: '#trending' },
    { icon: Star, label: 'Top Posts', path: '#top' },
  ];

  return (
    <div className={cn("space-y-8", className)}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <item.icon size={18} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400"} />
                {item.label}
              </Link>
            )
          })}
          
          {user?.role === 'Admin' && (
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors mt-4 border border-red-100 dark:border-red-900/30",
                location.pathname === '/admin'
                  ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              )}
            >
              <ShieldAlert size={18} />
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-indigo-950/30 rounded-2xl p-6 border border-indigo-100/50 dark:border-indigo-500/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
        <h3 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Community Stats</h3>
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center">
                <Users size={14} className="text-blue-500" />
              </div>
              <span className="text-sm font-medium">Members</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">{formatStat(stats.totalMembers)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center">
                <MessageSquare size={14} className="text-emerald-500" />
              </div>
              <span className="text-sm font-medium">Posts</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">{formatStat(stats.totalPosts)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-500" />
          Community Rules
        </h3>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="text-blue-500 font-bold">1.</span>
            <span>Be respectful and kind to others.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 font-bold">2.</span>
            <span>No spam or self-promotion.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 font-bold">3.</span>
            <span>Keep discussions relevant.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 font-bold">4.</span>
            <span>Do not share personal info.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
