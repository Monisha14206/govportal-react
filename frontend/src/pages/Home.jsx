import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Home() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get('/services').then(({ data }) => setServices(data.services.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <>
      <div className="hero-section emblem-watermark watermark-light rounded-4 p-5 mb-5 text-white text-center">
        <span className="emblem-medallion medallion-lg mb-3">
          <img src="/assets/ap-emblem.jpg" alt="Andhra Pradesh State Emblem" />
        </span>
        <div className="eyebrow mb-2">Government of Andhra Pradesh &middot; E-Governance Initiative</div>
        <h1 className="fw-bold display-5">Sachivalayam Portal</h1>
        <p className="lead mb-2">Your village &amp; ward secretariat, online.</p>
        <p className="mb-4">
          Apply for certificates and welfare schemes, upload documents, track applications,
          and resolve civic complaints — all from one place.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/services" className="btn btn-warning btn-lg"><i className="fa-solid fa-file-pen"></i> Apply for a Service</Link>
          <Link to="/complaints?tab=register" className="btn btn-outline-light btn-lg"><i className="fa-solid fa-triangle-exclamation"></i> Register a Complaint</Link>
        </div>
      </div>

      <div className="row text-center mb-5 g-3">
        <div className="col-md-3">
          <div className="p-4 quick-card h-100">
            <i className="fa-solid fa-magnifying-glass fa-2x text-primary mb-3"></i>
            <h6>Track Application</h6>
            <p className="text-muted small">Check status using your Application Number.</p>
            <Link to="/services?tab=track" className="btn btn-sm btn-outline-primary">Track Now</Link>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-4 quick-card h-100">
            <i className="fa-solid fa-comment-dots fa-2x text-primary mb-3"></i>
            <h6>Track Complaint</h6>
            <p className="text-muted small">Check resolution status using your Complaint Number.</p>
            <Link to="/complaints?tab=track" className="btn btn-sm btn-outline-primary">Track Now</Link>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-4 quick-card h-100">
            <i className="fa-solid fa-list-check fa-2x text-primary mb-3"></i>
            <h6>Browse Services</h6>
            <p className="text-muted small">Search and filter available government services.</p>
            <Link to="/services?tab=browse" className="btn btn-sm btn-outline-primary">View Services</Link>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-4 quick-card h-100">
            <i className="fa-solid fa-hand-holding-heart fa-2x text-primary mb-3"></i>
            <h6>Government Schemes</h6>
            <p className="text-muted small">Discover welfare schemes you may be eligible for.</p>
            <Link to="/services?tab=schemes" className="btn btn-sm btn-outline-primary">View Schemes</Link>
          </div>
        </div>
      </div>

      <div className="eyebrow mb-1">Citizen Services</div>
      <h3 className="mb-4">Popular Services</h3>
      <div className="row g-4 mb-5">
        {services.map(s => (
          <div className="col-md-4" key={s.id}>
            <div className="card service-card h-100">
              <div className="card-body">
                <span className="badge bg-secondary mb-2">{s.category}</span>
                <h5 className="card-title">{s.name}</h5>
                <p className="card-text text-muted">{s.description}</p>
              </div>
              <div className="card-footer bg-transparent d-flex justify-content-between align-items-center">
                <small className="text-muted">Fee: ₹{s.fee}</small>
                <Link to={`/services/${s.id}`} className="btn btn-sm btn-primary">View Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
