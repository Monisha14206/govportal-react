import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [form, setForm] = useState({ new_password: '', confirm_new_password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/reset-password', { email, token, ...form });
      setSuccess(data.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="row justify-content-center auth-wrapper">
        <div className="col-md-5">
          <div className="alert alert-danger">
            This reset link is invalid. Please request a new one from the{' '}
            <Link to="/forgot-password">Forgot Password</Link> page.
          </div>
        </div>
      </div>
    );
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
            <h3 className="mb-4 text-center">Reset Password</h3>
            <AlertMessage message={error} onClose={() => setError('')} />
            <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" minLength={6} value={form.new_password}
                       onChange={e => setForm({ ...form, new_password: e.target.value })} required autoFocus />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" minLength={6} value={form.confirm_new_password}
                       onChange={e => setForm({ ...form, confirm_new_password: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                {submitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
