import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { downloadComplaintReceipt } from '../utils/pdf';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/complaints/mine').then(({ data }) => setComplaints(data.complaints));
  }, []);

  const filtered = statusFilter
    ? complaints.filter(c => c.status === statusFilter)
    : complaints;

  const statuses = [...new Set(complaints.map(c => c.status))];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h3 className="mb-0"><i className="fa-solid fa-comment-dots"></i> My Complaints</h3>
        {complaints.length > 0 && (
          <select className="form-select form-select-sm" style={{ width: 200 }}
                  value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Filter by Status: All</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {complaints.length === 0 ? (
        <div className="alert alert-info">You haven't filed any complaints yet. <Link to="/complaints?tab=register">Register a complaint</Link>.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover bg-white align-middle">
            <thead>
              <tr>
                <th>Complaint No.</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Filed On</th>
                <th>Status</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><code>{c.complaint_number}</code></td>
                  <td>{c.subject}</td>
                  <td>{c.category}</td>
                  <td>{c.created_at}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => downloadComplaintReceipt(c)}>
                      <i className="fa-solid fa-receipt"></i> Receipt
                    </button>
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
