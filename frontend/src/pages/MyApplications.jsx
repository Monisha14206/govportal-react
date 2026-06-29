import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { downloadApplicationReceipt, downloadMockCertificate } from '../utils/pdf';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/applications/mine').then(({ data }) => setApplications(data.applications));
  }, []);

  const filtered = statusFilter
    ? applications.filter(a => a.status === statusFilter)
    : applications;

  const statuses = [...new Set(applications.map(a => a.status))];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h3 className="mb-0"><i className="fa-solid fa-folder-open"></i> My Applications</h3>
        {applications.length > 0 && (
          <select className="form-select form-select-sm" style={{ width: 200 }}
                  value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Filter by Status: All</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="alert alert-info">You haven't submitted any applications yet. <Link to="/services">Browse services</Link> to get started.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover bg-white align-middle">
            <thead>
              <tr>
                <th>Application No.</th>
                <th>Service</th>
                <th>Submitted On</th>
                <th>Status</th>
                <th>Downloads</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td><code>{a.application_number}</code></td>
                  <td>{a.service_name}</td>
                  <td>{a.created_at}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => downloadApplicationReceipt(a)}>
                        <i className="fa-solid fa-receipt"></i> Receipt
                      </button>
                      {(a.status === 'Approved' || a.status === 'Completed') && (
                        <button className="btn btn-sm btn-outline-success" onClick={() => downloadMockCertificate(a)}>
                          <i className="fa-solid fa-certificate"></i> Certificate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
