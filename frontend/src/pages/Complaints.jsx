import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { downloadComplaintReceipt } from '../utils/pdf';

function RegisterComplaint() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: '', subject: '', description: '', location: '' });
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    api.get('/complaints/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (attachment) payload.append('attachment', attachment);

    try {
      const { data } = await api.post('/complaints', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setComplaint({
        complaint_number: data.complaintNumber,
        category: form.category,
        subject: form.subject,
        status: 'Registered',
        created_at: new Date().toLocaleString()
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="alert alert-warning">
        Please <Link to="/login">log in</Link> or <Link to="/register">create an account</Link> to file a complaint.
      </div>
    );
  }

  if (complaint) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card form-card text-center">
            <div className="card-body p-5">
              <i className="fa-solid fa-circle-check fa-4x text-success mb-3"></i>
              <h3>Complaint Registered Successfully!</h3>
              <p className="text-muted">Our team will review your complaint and take appropriate action.</p>

              <div className="app-number-box my-4">
                <small className="text-muted d-block">Your Complaint Number</small>
                <h2 className="text-primary mb-0">{complaint.complaint_number}</h2>
              </div>

              <p className="small text-muted">Please save this number to track resolution status. A confirmation has also been sent to your registered email/phone.</p>

              <div className="d-flex gap-2 justify-content-center mt-3 flex-wrap">
                <button className="btn btn-outline-primary" onClick={() => downloadComplaintReceipt(complaint)}>
                  <i className="fa-solid fa-download"></i> Download Receipt
                </button>
                <Link to="/complaints/mine" className="btn btn-primary">View My Complaints</Link>
                <Link to="/" className="btn btn-outline-secondary">Back to Home</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card form-card">
          <div className="card-body p-4">
            <AlertMessage message={error} onClose={() => setError('')} />
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Category <span className="text-danger">*</span></label>
                <select className="form-select" value={form.category} onChange={update('category')} required>
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Subject <span className="text-danger">*</span></label>
                <input type="text" className="form-control" placeholder="Brief title of the issue"
                       value={form.subject} onChange={update('subject')} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Description <span className="text-danger">*</span></label>
                <textarea className="form-control" rows={4} placeholder="Describe the issue in detail"
                          value={form.description} onChange={update('description')} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Location</label>
                <input type="text" className="form-control" placeholder="Address / landmark / ward number"
                       value={form.location} onChange={update('location')} />
              </div>
              <div className="mb-3">
                <label className="form-label">Upload Image (optional)</label>
                <input type="file" className="form-control" accept=".jpg,.jpeg,.png,.pdf"
                       onChange={e => setAttachment(e.target.files[0])} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
                <i className="fa-solid fa-paper-plane"></i> {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackComplaintTab() {
  const [complaintNumber, setComplaintNumber] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const { data } = await api.get(`/complaints/track/${encodeURIComponent(complaintNumber.trim())}`);
      setResult(data.complaint);
      setHistory(data.history);
    } catch (err) {
      setError(err.response?.data?.error || 'No complaint found.');
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-9">
        <div className="card form-card mb-4">
          <div className="card-body p-4">
            <h5 className="mb-3"><i className="fa-solid fa-magnifying-glass"></i> Track Your Complaint</h5>
            <AlertMessage message={error} onClose={() => setError('')} />
            <form onSubmit={handleSubmit} className="d-flex gap-2">
              <input type="text" className="form-control" placeholder="Enter your Complaint Number (e.g. CMP-20260621-00123)"
                     value={complaintNumber} onChange={e => setComplaintNumber(e.target.value)} required />
              <button type="submit" className="btn btn-primary">Track</button>
            </form>
          </div>
        </div>

        {result && (
          <div className="card form-card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="mb-1">{result.subject}</h5>
                  <small className="text-muted">Complaint Number: <strong>{result.complaint_number}</strong> &middot; {result.category}</small>
                </div>
                <StatusBadge status={result.status} />
              </div>

              <p>{result.description}</p>
              {result.location && <p className="text-muted small"><i className="fa-solid fa-location-dot"></i> {result.location}</p>}
              {result.remarks && <p><strong>Remarks:</strong> {result.remarks}</p>}

              <h6 className="mt-4">Status Timeline</h6>
              <ul className="timeline">
                {history.map(h => (
                  <li key={h.id}>
                    <strong>{h.status}</strong>
                    <span className="text-muted small"> &mdash; {h.created_at}</span>
                    {h.remarks && <div className="text-muted small">{h.remarks}</div>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Complaints() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'register';

  function setTab(tab) {
    setSearchParams({ tab });
  }

  return (
    <>
      <h2 className="mb-4"><i className="fa-solid fa-triangle-exclamation"></i> Complaint Portal</h2>

      <ul className="nav nav-tabs gov-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
            <i className="fa-solid fa-pen"></i> Register Complaint
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'track' ? 'active' : ''}`} onClick={() => setTab('track')}>
            <i className="fa-solid fa-magnifying-glass"></i> Track Complaint
          </button>
        </li>
      </ul>

      {activeTab === 'register' && <RegisterComplaint />}
      {activeTab === 'track' && <TrackComplaintTab />}
    </>
  );
}
