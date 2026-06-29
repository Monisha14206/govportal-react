import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';
import { downloadApplicationReceipt } from '../utils/pdf';

export default function SchemeApply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [files, setFiles] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get(`/schemes/${id}`).then(({ data }) => setScheme(data.scheme)).catch(() => {});
  }, [id]);

  if (!scheme) return null;

  function handleFieldChange(name, value) {
    setFormValues(prev => ({ ...prev, [name]: value }));
  }

  function handleFileChange(key, file) {
    setFiles(prev => ({ ...prev, [key]: file }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = new FormData();
    Object.entries(formValues).forEach(([key, value]) => payload.append(key, value));
    Object.entries(files).forEach(([key, file]) => {
      if (file) payload.append(key, file);
    });

    try {
      const { data } = await api.post(`/schemes/${id}/apply`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card form-card text-center">
            <div className="card-body p-5">
              <i className="fa-solid fa-circle-check fa-4x text-success mb-3"></i>
              <h3>Scheme Application Submitted Successfully!</h3>
              <p className="text-muted">Your application for <strong>{result.scheme.name}</strong> has been received.</p>

              <div className="app-number-box my-4">
                <small className="text-muted d-block">Your Application Number</small>
                <h2 className="text-primary mb-0">{result.applicationNumber}</h2>
              </div>

              <p className="small text-muted">Please save this number. You'll need it to track your application status. A confirmation has also been sent to your registered email/phone.</p>

              <div className="d-flex gap-2 justify-content-center mt-3 flex-wrap">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => downloadApplicationReceipt({
                    application_number: result.applicationNumber,
                    service_name: result.scheme.name,
                    status: 'Submitted',
                    created_at: new Date().toLocaleString()
                  })}
                >
                  <i className="fa-solid fa-download"></i> Download Receipt
                </button>
                <Link to="/scheme-applications/mine" className="btn btn-primary">View My Scheme Applications</Link>
                <Link to="/services?tab=schemes" className="btn btn-outline-secondary">Browse More Schemes</Link>
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
        <button type="button" className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <div className="card form-card">
          <div className="card-body p-4">
            <h3 className="mb-1"><i className="fa-solid fa-hand-holding-heart"></i> Apply for {scheme.name}</h3>
            <p className="text-muted mb-4">{scheme.description}</p>

            <AlertMessage message={error} onClose={() => setError('')} />

            <form onSubmit={handleSubmit}>
              <h5 className="mt-2 mb-3">Application Details</h5>
              {(scheme.form_fields || []).map(field => (
                <div className="mb-3" key={field.name}>
                  <label className="form-label">
                    {field.label}{field.required && <span className="text-danger"> *</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea className="form-control" rows={3} required={field.required}
                              onChange={e => handleFieldChange(field.name, e.target.value)} />
                  ) : field.type === 'select' ? (
                    <select className="form-select" required={field.required}
                            onChange={e => handleFieldChange(field.name, e.target.value)}>
                      <option value="">-- Select --</option>
                      {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} className="form-control" required={field.required}
                           onChange={e => handleFieldChange(field.name, e.target.value)} />
                  )}
                </div>
              ))}

              <hr className="my-4" />
              <h5 className="mb-3"><i className="fa-solid fa-paperclip"></i> Upload Supporting Documents</h5>
              <p className="text-muted small">Required: {scheme.required_documents} (JPG, PNG or PDF, max 5MB each)</p>

              {(scheme.required_documents || '').split(',').filter(Boolean).map((doc, idx) => (
                <div className="mb-3" key={idx}>
                  <label className="form-label">{doc.trim()}</label>
                  <input type="file" className="form-control" accept=".jpg,.jpeg,.png,.pdf"
                         onChange={e => handleFileChange(`doc_${idx}`, e.target.files[0])} />
                </div>
              ))}

              <button type="submit" className="btn btn-primary btn-lg w-100 mt-3" disabled={submitting}>
                <i className="fa-solid fa-paper-plane"></i> {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
