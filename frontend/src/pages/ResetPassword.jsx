import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        {error && <p className="error">{error}</p>}
        {message ? (
          <>
            <p className="success-msg">{message}</p>
            <p><Link to="/login">Go to Login</Link></p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <input type="password" placeholder="New password (min 6 chars)" value={password}
              onChange={e => setPassword(e.target.value)} required />
            <input type="password" placeholder="Confirm new password" value={confirm}
              onChange={e => setConfirm(e.target.value)} required />
            <button type="submit">Reset Password</button>
          </form>
        )}
      </div>
    </div>
  );
}
