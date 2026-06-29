import { useEffect, useState } from 'react';
import api, { fileUrl } from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [updates, setUpdates] = useState({});

  function load(params = {}) {
    api.get('/admin/complaints', { params }).then(({ data }) => {
      setComplaints(data.complaints);
      setStatuses(data.statuses);
    });
  }

  useEffect(() => { load(); }, []);

  function handleFilter(e) {
    e.preventDefault();
    load({ q, status });
  }

  function setUpdateField(id, field, value) {
    setUpdates(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function handleUpdate(id) {
    const payload = updates[id] || {};
    await api.put(`/admin/complaints/${id}/status`, {
      status: payload.status || complaints.find(c => c.id === id).status,
      remarks: payload.remarks || ''
    });
    load({ q, status });
  }

  return (
    <>
      <h3 className="mb-4"><i className="fa-solid fa-comment-dots"></i> Manage Complaints</h3>

      <form onSubmit={handleFilter} className="row g-2 mb-4">
        <div className="col-md-5">
          <input type="text" className="form-control" placeholder="Search by Complaint No., subject, or citizen name"
                 value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <button type="submit" className="btn btn-primary w-100">Filter</button>
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-hover bg-white align-middle">
          <thead>
            <tr>
              <th>Complaint No.</th>
              <th>Citizen</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Filed</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id}>
                <td><code>{c.complaint_number}</code></td>
                <td>{c.complainant_name}<br /><small className="text-muted">{c.complainant_email}</small></td>
                <td>
                  {c.subject}{' '}
                  {c.attachment_path && (
                    <a href={fileUrl(c.attachment_path)} target="_blank" rel="noreferrer" title="View attachment">
                      <i className="fa-solid fa-paperclip"></i>
                    </a>
                  )}
                </td>
                <td>{c.category}</td>
                <td>{c.created_at}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>
                  <div className="d-flex gap-1">
                    <select className="form-select form-select-sm" style={{ width: 130 }}
                            defaultValue={c.status}
                            onChange={e => setUpdateField(c.id, 'status', e.target.value)}>
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="text" className="form-control form-control-sm" style={{ width: 150 }}
                           placeholder="Remarks (optional)"
                           onChange={e => setUpdateField(c.id, 'remarks', e.target.value)} />
                    <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(c.id)}>Update</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
