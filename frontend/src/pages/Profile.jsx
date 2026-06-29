import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_new_password: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);
    try {
      const { data } = await api.put('/me', profileForm);
      updateUser(data.token, data.user);
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePwSubmit(e) {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    setSavingPw(true);
    try {
      const { data } = await api.put('/me/password', pwForm);
      setPwSuccess(data.message || 'Password updated successfully.');
      setPwForm({ current_password: '', new_password: '', confirm_new_password: '' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Could not update password.');
    } finally {
      setSavingPw(false);
    }
  }

  if (!user) return null;

  return (
    <div className="row justify-content-center">
      <div className="col-md-7">
        <h3 className="mb-4"><i className="fa-solid fa-user"></i> My Profile</h3>

        <div className="card form-card mb-4">
          <div className="card-body p-4">
            <h5 className="mb-3">Account Details</h5>
            <AlertMessage message={profileError} onClose={() => setProfileError('')} />
            <AlertMessage type="success" message={profileSuccess} onClose={() => setProfileSuccess('')} />
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={profileForm.name}
                       onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={user.email} disabled />
                <small className="text-muted">Email cannot be changed. Contact support if this is incorrect.</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Mobile Number</label>
                <input type="tel" className="form-control" pattern="[0-9]{10}" placeholder="10-digit mobile number"
                       value={profileForm.phone || ''} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        <div className="card form-card">
          <div className="card-body p-4">
            <h5 className="mb-3">Change Password</h5>
            <AlertMessage message={pwError} onClose={() => setPwError('')} />
            <AlertMessage type="success" message={pwSuccess} onClose={() => setPwSuccess('')} />
            <form onSubmit={handlePwSubmit}>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" value={pwForm.current_password}
                       onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })} required />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-control" minLength={6} value={pwForm.new_password}
                         onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-control" minLength={6} value={pwForm.confirm_new_password}
                         onChange={e => setPwForm({ ...pwForm, confirm_new_password: e.target.value })} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingPw}>
                {savingPw ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
