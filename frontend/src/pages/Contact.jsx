import { useState } from 'react';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/contact', form);
      setSuccess(data.message || 'Your message has been sent.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-9">
        <div className="d-flex align-items-center gap-3 mb-4">
          <span className="emblem-medallion medallion-md">
            <img src="/assets/ap-emblem.jpg" alt="Andhra Pradesh State Emblem" />
          </span>
          <div>
            <div className="eyebrow mb-1">Government of Andhra Pradesh</div>
            <h2 className="mb-0">Contact Us</h2>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card form-card h-100">
              <div className="card-body p-4">
                <h5 className="mb-3">Reach the Sachivalayam Portal Team</h5>
                <p className="text-muted mb-3">
                  For help with applications, complaints, or technical issues, reach out to us
                  through any of the channels below.
                </p>
                <p className="mb-2"><i className="fa-solid fa-envelope text-primary me-2"></i> support@sachivalayamportal.gov.in</p>
                <p className="mb-2"><i className="fa-solid fa-phone text-primary me-2"></i> 1800-XXX-XXXX (Toll-Free)</p>
                <p className="mb-0"><i className="fa-solid fa-location-dot text-primary me-2"></i> Your Local Sachivalayam / Ward Secretariat Office</p>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card form-card">
              <div className="card-body p-4">
                <AlertMessage message={error} onClose={() => setError('')} />
                <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Full Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" value={form.name} onChange={update('name')} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email <span className="text-danger">*</span></label>
                      <input type="email" className="form-control" value={form.email} onChange={update('email')} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input type="tel" className="form-control" value={form.phone} onChange={update('phone')} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Subject</label>
                      <input type="text" className="form-control" value={form.subject} onChange={update('subject')} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows={4} value={form.message} onChange={update('message')} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                    <i className="fa-solid fa-paper-plane"></i> {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
