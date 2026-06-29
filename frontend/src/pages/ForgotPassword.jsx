import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/forgot-password', { email });
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
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
            <h3 className="mb-2 text-center">Forgot Password</h3>
            <p className="text-muted text-center mb-4">
              Enter your registered email address and we'll send you a link to reset your password.
            </p>
            <AlertMessage message={error} onClose={() => setError('')} />
            <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="text-center mt-3 mb-0">
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
