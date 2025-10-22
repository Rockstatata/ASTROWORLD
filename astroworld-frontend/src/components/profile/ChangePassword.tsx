import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../services/auth/authServices';

interface ChangePasswordProps {
  onSuccess?: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password2: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess(false);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.current_password || !formData.new_password || !formData.new_password2) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.new_password !== formData.new_password2) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (formData.current_password === formData.new_password) {
      setError('New password must be different from current password');
      setLoading(false);
      return;
    }

    try {
      await authAPI.changePassword(formData);
      setSuccess(true);
      setFormData({
        current_password: '',
        new_password: '',
        new_password2: '',
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string | string[] } } };
      const errorDetail = error.response?.data?.detail;
      
      if (Array.isArray(errorDetail)) {
        setError(errorDetail.join(' '));
      } else {
        setError(errorDetail || 'Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <Key className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Change Password</h2>
          <p className="text-gray-400">Update your account password</p>
        </div>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex items-center gap-3"
        >
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="text-green-300">Password changed successfully!</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-300 whitespace-pre-line">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              name="current_password"
              required
              value={formData.current_password}
              onChange={handleChange}
              placeholder="Enter your current password"
              className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
            >
              {showPasswords.current ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              name="new_password"
              required
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Enter your new password"
              className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
            >
              {showPasswords.new ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="new_password2"
              required
              value={formData.new_password2}
              onChange={handleChange}
              placeholder="Confirm your new password"
              className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="bg-black/20 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-300 mb-2">Password Requirements:</p>
          <ul className="text-sm text-gray-400 space-y-1">
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${formData.new_password.length >= 8 ? 'bg-green-400' : 'bg-gray-600'}`} />
              At least 8 characters long
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.new_password) ? 'bg-green-400' : 'bg-gray-600'}`} />
              Contains uppercase letters
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(formData.new_password) ? 'bg-green-400' : 'bg-gray-600'}`} />
              Contains lowercase letters
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${/\d/.test(formData.new_password) ? 'bg-green-400' : 'bg-gray-600'}`} />
              Contains numbers
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password) ? 'bg-green-400' : 'bg-gray-600'}`} />
              Contains special characters
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Changing Password...
            </>
          ) : (
            <>
              <Key className="h-5 w-5" />
              Change Password
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ChangePassword;