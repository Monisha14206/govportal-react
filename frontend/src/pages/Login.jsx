import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginWithCredentials } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { user } = await loginWithCredentials(email, password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    }
  }

  return (
    <div className="row justify-content-center auth-wrapper">
      <div className="col-md-5">
        <div className="card form-card">
          <div className="card-body p-4">
            <div className="text-center mb-3">
              <span className="emblem-medallion medallion-md">
                <img src="/assets/ap-emblem.jpg" alt="Andhra Pradesh State Emblem" />
              </span>
            </div>
            <h3 className="mb-4 text-center">Citizen Login</h3>
            <AlertMessage message={error} onClose={() => setError('')} />
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                <div className="text-end mt-1">
                  <Link to="/forgot-password" className="small">Forgot password?</Link>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
            <p className="text-center mt-3 mb-0">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
