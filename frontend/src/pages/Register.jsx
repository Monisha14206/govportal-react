import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    }
  }

  return (
    <div className="row justify-content-center auth-wrapper">
      <div className="col-md-6">
        <div className="card form-card">
          <div className="card-body p-4">
            <div className="text-center mb-3">
              <span className="emblem-medallion medallion-md">
                <img src="/assets/ap-emblem.jpg" alt="Andhra Pradesh State Emblem" />
              </span>
            </div>
            <h3 className="mb-4 text-center">Citizen Registration</h3>
            <AlertMessage message={error} onClose={() => setError('')} />
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={form.name} onChange={update('name')} required autoFocus />
              </div>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={form.email} onChange={update('email')} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Mobile Number</label>
                <input type="tel" className="form-control" pattern="[0-9]{10}" placeholder="10-digit mobile number" value={form.phone} onChange={update('phone')} />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" minLength={6} value={form.password} onChange={update('password')} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" minLength={6} value={form.confirm_password} onChange={update('confirm_password')} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100">Create Account</button>
            </form>
            <p className="text-center mt-3 mb-0">
              Already registered? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
