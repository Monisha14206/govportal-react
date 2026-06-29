import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';
import StatusBadge from '../components/StatusBadge';

function BrowseServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  function load(params = {}) {
    api.get('/services', { params }).then(({ data }) => {
      setServices(data.services);
      setCategories(data.categories);
    });
  }

  useEffect(() => { load(); }, []);

  function handleFilter(e) {
    e.preventDefault();
    load({ q, category });
  }

  return (
    <>
      <form onSubmit={handleFilter} className="row g-2 mb-4">
        <div className="col-md-6">
          <input type="text" className="form-control" placeholder="Search services by name or keyword..."
                 value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100"><i className="fa-solid fa-magnifying-glass"></i> Filter</button>
        </div>
      </form>

      {services.length === 0 && (
        <div className="alert alert-info">No services match your search criteria.</div>
      )}

      <div className="row g-4">
        {services.map(s => (
          <div className="col-md-4" key={s.id}>
            <div className="card service-card h-100">
              <div className="card-body">
                <span className="badge bg-secondary mb-2">{s.category}</span>
                <h5 className="card-title">{s.name}</h5>
                <p className="card-text text-muted">{s.description}</p>
                <small className="text-muted d-block mb-2"><i className="fa-solid fa-clock"></i> Processing: ~{s.processing_days} days</small>
              </div>
              <div className="card-footer bg-transparent d-flex justify-content-between align-items-center">
                <small className="text-muted">Fee: ₹{s.fee}</small>
                <Link to={`/services/${s.id}`} className="btn btn-sm btn-primary">View &amp; Apply</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function GovernmentSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  function load(params = {}) {
    api.get('/schemes', { params }).then(({ data }) => {
      setSchemes(data.schemes);
      setCategories(data.categories);
    });
  }

  useEffect(() => { load(); }, []);

  function handleFilter(e) {
    e.preventDefault();
    load({ q, category });
  }

  return (
    <>
      <p className="text-muted">
        Browse welfare schemes offered through the Sachivalayam system and apply online directly —
        no need to visit the secretariat in person to get started.
      </p>

      <form onSubmit={handleFilter} className="row g-2 mb-4">
        <div className="col-md-6">
          <input type="text" className="form-control" placeholder="Search schemes by name or keyword..."
                 value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100"><i className="fa-solid fa-magnifying-glass"></i> Filter</button>
        </div>
      </form>

      {schemes.length === 0 && (
        <div className="alert alert-info">No schemes match your search criteria.</div>
      )}

      <div className="row g-4">
        {schemes.map(s => (
          <div className="col-md-6" key={s.id}>
            <div className="card scheme-card h-100">
              <div className="card-body">
                <span className="badge bg-warning text-dark mb-2">{s.category}</span>
                <h5 className="card-title">{s.name}</h5>
                <p className="card-text text-muted">{s.description}</p>
                <p className="small mb-1"><strong>Eligibility:</strong> {s.eligibility}</p>
                <p className="small mb-0"><strong>Benefits:</strong> {s.benefits}</p>
              </div>
              <div className="card-footer bg-transparent text-end">
                <Link to={`/schemes/${s.id}/apply`} className="btn btn-sm btn-primary">
                  <i className="fa-solid fa-file-pen"></i> Apply for this Scheme
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TrackApplicationTab() {
  const [applicationNumber, setApplicationNumber] = useState('');
  const [result, setResult] = useState(null);
  const [resultLabel, setResultLabel] = useState('Service');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    const trimmed = applicationNumber.trim();
    // Scheme applications are issued numbers like SCH-..., service
    // applications like APP-... - use that prefix to call the right endpoint.
    const isScheme = trimmed.toUpperCase().startsWith('SCH-');
    const endpoint = isScheme
      ? `/scheme-applications/track/${encodeURIComponent(trimmed)}`
      : `/applications/track/${encodeURIComponent(trimmed)}`;

    try {
      const { data } = await api.get(endpoint);
      const application = isScheme ? data.application : data.application;
      setResult({
        ...application,
        display_name: isScheme ? application.scheme_name : application.service_name
      });
      setResultLabel(isScheme ? 'Scheme Application' : 'Service Application');
      setHistory(data.history);
    } catch (err) {
      setError(err.response?.data?.error || 'No application found.');
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-9">
        <div className="card form-card mb-4">
          <div className="card-body p-4">
            <h5 className="mb-3"><i className="fa-solid fa-magnifying-glass"></i> Track Your Application</h5>
            <p className="text-muted small mb-3">Works for both service applications (APP-...) and scheme applications (SCH-...).</p>
            <AlertMessage message={error} onClose={() => setError('')} />
            <form onSubmit={handleSubmit} className="d-flex gap-2">
              <input type="text" className="form-control" placeholder="Enter your Application Number (e.g. APP-20260621-00123 or SCH-20260621-00123)"
                     value={applicationNumber} onChange={e => setApplicationNumber(e.target.value)} required />
              <button type="submit" className="btn btn-primary">Track</button>
            </form>
          </div>
        </div>

        {result && (
          <div className="card form-card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <small className="text-muted d-block">{resultLabel}</small>
                  <h5 className="mb-1">{result.display_name}</h5>
                  <small className="text-muted">Application Number: <strong>{result.application_number}</strong></small>
                </div>
                <StatusBadge status={result.status} />
              </div>

              {result.remarks && <p className="mb-3"><strong>Remarks:</strong> {result.remarks}</p>}

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

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'browse';

  function setTab(tab) {
    setSearchParams({ tab });
  }

  return (
    <>
      <h2 className="mb-4"><i className="fa-solid fa-list-check"></i> Services &amp; Schemes</h2>

      <ul className="nav nav-tabs gov-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>
            <i className="fa-solid fa-list-check"></i> Browse Services
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'schemes' ? 'active' : ''}`} onClick={() => setTab('schemes')}>
            <i className="fa-solid fa-hand-holding-heart"></i> Government Schemes
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'track' ? 'active' : ''}`} onClick={() => setTab('track')}>
            <i className="fa-solid fa-magnifying-glass"></i> Track Application
          </button>
        </li>
      </ul>

      {activeTab === 'browse' && <BrowseServices />}
      {activeTab === 'schemes' && <GovernmentSchemes />}
      {activeTab === 'track' && <TrackApplicationTab />}
    </>
  );
}
