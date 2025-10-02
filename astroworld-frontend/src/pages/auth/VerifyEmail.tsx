import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/auth/authServices';
import Earth_Video from '../../assets/videos/Earth-Zoom.mp4';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    if (!uid || !token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    verifyEmail(uid, token);
  }, [searchParams]);

  const verifyEmail = async (uid: string, token: string) => {
    try {
      await authAPI.verifyEmail(uid, token);
      setStatus('success');
      setMessage('Email verified successfully! You can now login.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage('Verification failed. The link may be invalid or expired.');
    }
  };

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
    <div className="min-h-screen  flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-space-blue mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <svg className="mx-auto h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-gray-300">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-300 mb-4">{message}</p>
            <button
              onClick={() => navigate('/register')}
              className="bg-space-gradient hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg"
            >
              Back to Register
            </button>
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default VerifyEmail;