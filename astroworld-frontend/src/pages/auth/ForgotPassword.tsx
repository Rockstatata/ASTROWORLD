import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/auth/authServices';
import Earth_Video from '../../assets/videos/Earth-Zoom.mp4';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <video
          autoPlay
          muted
          loop
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
          }}
        >
          <source src={Earth_Video} type="video/mp4" />
        </video>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-gray-300 mb-4">
              If an account with that email exists, we've sent you a password reset link.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              The link will expire in 1 hour for security reasons.
            </p>
            <div className="space-y-3">
              <Link 
                to="/login"
                className="block w-full bg-space-blue hover:opacity-90 text-white font-semibold py-2 rounded-lg transition-opacity"
              >
                Back to Login
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Send Another Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <video
        autoPlay
        muted
        loop
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
        }}
      >
        <source src={Earth_Video} type="video/mp4" />
      </video>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-space-gradient bg-clip-text text-text-primary mb-2">
              ASTROWORLD
            </h1>
            <p className="text-text-primary">Reset your password</p>
          </div>

          {/* Form */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-space-blue"
                />
                <p className="text-sm text-gray-400 mt-2">
                  We'll send you a link to reset your password
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-space-blue hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-opacity disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-center text-gray-400">
              Remember your password?{' '}
              <Link to="/login" className="text-space-blue hover:text-space-bright">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;