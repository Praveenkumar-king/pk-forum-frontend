import React from 'react';
import { Link } from 'react-router-dom';
import { HeartCrack } from 'lucide-react';

const AccountDeleted = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
          <HeartCrack size={48} className="text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          We're sorry to see you go 😔
        </h1>
        
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Your account and all associated data have been permanently deleted from PK Forum.
        </p>

        <div className="pt-8">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountDeleted;
