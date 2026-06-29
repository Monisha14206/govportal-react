import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const PIE_COLORS = ['#0b3d62', '#1a5f8c', '#f0a500', '#28a745', '#d9534f', '#6c757d'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => {
      setStats(data.stats);
      setRecentApplications(data.recentApplications);
      setRecentComplaints(data.recentComplaints);
      setStatusBreakdown((data.applicationStatusBreakdown || []).map(r => ({ name: r.status, value: r.count })));
      setCategoryBreakdown((data.complaintCategoryBreakdown || []).map(r => ({ name: r.category, value: r.count })));
    });
  }, []);

  if (!stats) return null;

  return (
    <>
      <h3 className="mb-4"><i className="fa-solid fa-gauge"></i> Admin Dashboard</h3>

      <div className="row g-3 mb-5">
        <div className="col-md-4 col-lg">
          <div className="stat-card">
            <i className="fa-solid fa-users"></i>
            <h3>{stats.totalUsers}</h3>
            <small>Registered Citizens</small>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="stat-card">
            <i className="fa-solid fa-file-lines"></i>
            <h3>{stats.totalApplications}</h3>
            <small>Total Applications</small>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="stat-card stat-warn">
            <i className="fa-solid fa-hourglass-half"></i>
            <h3>{stats.pendingApplications}</h3>
            <small>Pending Applications</small>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="stat-card">
            <i className="fa-solid fa-comment-dots"></i>
            <h3>{stats.totalComplaints}</h3>
            <small>Total Complaints</small>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="stat-card stat-danger">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <h3>{stats.openComplaints}</h3>
            <small>Open Complaints</small>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="stat-card stat-warn">
            <i className="fa-solid fa-hand-holding-heart"></i>
            <h3>{stats.pendingSchemeApplications}</h3>
            <small>Pending Scheme Applications</small>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="stat-card">
            <i className="fa-solid fa-envelope-open-text"></i>
            <h3>{stats.unreadContactMessages}</h3>
            <small>Unread Contact Messages</small>
          </div>
        </div>
      </div>

      <div className="d-flex gap-3 mb-4 flex-wrap">
        <Link to="/admin/applications" className="btn btn-primary"><i className="fa-solid fa-file-lines"></i> Manage Applications</Link>
        <Link to="/admin/scheme-applications" className="btn btn-primary"><i className="fa-solid fa-hand-holding-heart"></i> Manage Scheme Applications</Link>
        <Link to="/admin/complaints" className="btn btn-primary"><i className="fa-solid fa-comment-dots"></i> Manage Complaints</Link>
        <Link to="/admin/services" className="btn btn-outline-secondary"><i className="fa-solid fa-gear"></i> Manage Services</Link>
        <Link to="/admin/schemes" className="btn btn-outline-secondary"><i className="fa-solid fa-gears"></i> Manage Schemes</Link>
        <Link to="/admin/users" className="btn btn-outline-secondary"><i className="fa-solid fa-users"></i> Manage Users</Link>
        <Link to="/admin/contact-messages" className="btn btn-outline-secondary"><i className="fa-solid fa-envelope-open-text"></i> Contact Messages</Link>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="card form-card h-100">
            <div className="card-body">
              <h6 className="mb-3">Applications by Status</h6>
              {statusBreakdown.length === 0 ? (
                <p className="text-muted small mb-0">No applications yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {statusBreakdown.map((entry, idx) => (
                        <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card form-card h-100">
            <div className="card-body">
              <h6 className="mb-3">Complaints by Category</h6>
              {categoryBreakdown.length === 0 ? (
                <p className="text-muted small mb-0">No complaints yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryBreakdown}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1a5f8c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <h5>Recent Applications</h5>
          <div className="table-responsive">
            <table className="table table-sm bg-white">
              <thead><tr><th>App No.</th><th>Applicant</th><th>Service</th><th>Status</th></tr></thead>
              <tbody>
                {recentApplications.map(a => (
                  <tr key={a.id}>
                    <td><code>{a.application_number}</code></td>
                    <td>{a.applicant_name}</td>
                    <td>{a.service_name}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-md-6">
          <h5>Recent Complaints</h5>
          <div className="table-responsive">
            <table className="table table-sm bg-white">
              <thead><tr><th>Complaint No.</th><th>Citizen</th><th>Subject</th><th>Status</th></tr></thead>
              <tbody>
                {recentComplaints.map(c => (
                  <tr key={c.id}>
                    <td><code>{c.complaint_number}</code></td>
                    <td>{c.complainant_name}</td>
                    <td>{c.subject}</td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
