import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function AdminSchemeApplications() {
  const [applications, setApplications] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [updates, setUpdates] = useState({}); // { [id]: { status, remarks } }

  function load(params = {}) {
    api.get('/admin/scheme-applications', { params }).then(({ data }) => {
      setApplications(data.applications);
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
    await api.put(`/admin/scheme-applications/${id}/status`, {
      status: payload.status || applications.find(a => a.id === id).status,
      remarks: payload.remarks || ''
    });
    load({ q, status });
  }

  return (
    <>
      <h3 className="mb-4"><i className="fa-solid fa-hand-holding-heart"></i> Manage Scheme Applications</h3>

      <form onSubmit={handleFilter} className="row g-2 mb-4">
        <div className="col-md-5">
          <input type="text" className="form-control" placeholder="Search by Application No. or Applicant name"
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
              <th>App No.</th>
              <th>Applicant</th>
              <th>Scheme</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(a => (
              <tr key={a.id}>
                <td><code>{a.application_number}</code></td>
                <td>{a.applicant_name}<br /><small className="text-muted">{a.applicant_email}</small></td>
                <td>{a.scheme_name}</td>
                <td>{a.created_at}</td>
                <td><StatusBadge status={a.status} /></td>
                <td>
                  <div className="d-flex gap-1">
                    <select className="form-select form-select-sm" style={{ width: 140 }}
                            defaultValue={a.status}
                            onChange={e => setUpdateField(a.id, 'status', e.target.value)}>
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="text" className="form-control form-control-sm" style={{ width: 160 }}
                           placeholder="Remarks (optional)"
                           onChange={e => setUpdateField(a.id, 'remarks', e.target.value)} />
                    <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(a.id)}>Update</button>
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
