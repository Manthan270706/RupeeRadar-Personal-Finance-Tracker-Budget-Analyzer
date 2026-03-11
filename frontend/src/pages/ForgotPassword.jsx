import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.msg);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        {error && <p className="error">{error}</p>}
        {sent ? (
          <>
            <p className="success-msg">{message}</p>
            <p>Check your inbox and follow the link to reset your password.</p>
            <p><Link to="/login">Back to Login</Link></p>
          </>
        ) : (
          <>
            <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit}>
              <input type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)} required />
              <button type="submit">Send Reset Link</button>
            </form>
            <p><Link to="/login">Back to Login</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
