import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);

  useEffect(() => {
    api.get(`/services/${id}`).then(({ data }) => setService(data.service)).catch(() => {});
  }, [id]);

  if (!service) return null;

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <button type="button" className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <div className="card form-card">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="badge bg-secondary mb-2">{service.category}</span>
                <h2>{service.name}</h2>
              </div>
              <span className="emblem-medallion medallion-sm d-none d-sm-inline-flex">
                <img src="/assets/ap-emblem.jpg" alt="Andhra Pradesh State Emblem" />
              </span>
            </div>
            <p className="text-muted">{service.description}</p>

            <hr />
            <h5><i className="fa-solid fa-file-circle-check"></i> Required Documents</h5>
            <ul>
              {service.required_documents.split(',').map((doc, idx) => (
                <li key={idx}>{doc.trim()}</li>
              ))}
            </ul>

            <div className="row mb-3">
              <div className="col-6"><strong>Fee:</strong> ₹{service.fee}</div>
              <div className="col-6"><strong>Processing Time:</strong> ~{service.processing_days} days</div>
            </div>

            <Link to={`/services/${service.id}/apply`} className="btn btn-primary btn-lg w-100">
              <i className="fa-solid fa-file-pen"></i> Apply Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
