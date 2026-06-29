import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AlertMessage from '../../components/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  function load(params = {}) {
    api.get('/admin/users', { params }).then(({ data }) => setUsers(data.users));
  }

  useEffect(() => { load(); }, []);

  function handleFilter(e) {
    e.preventDefault();
    load({ q, role });
  }

  async function handleRoleChange(id, newRole) {
    setError('');
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      load({ q, role });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update role.');
    }
  }

  async function handleToggleActive(id) {
    setError('');
    try {
      await api.put(`/admin/users/${id}/toggle`);
      load({ q, role });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update account status.');
    }
  }

  return (
    <>
      <h3 className="mb-4"><i className="fa-solid fa-users"></i> Manage Users</h3>

      <AlertMessage message={error} onClose={() => setError('')} />

      <form onSubmit={handleFilter} className="row g-2 mb-4">
        <div className="col-md-5">
          <input type="text" className="form-control" placeholder="Search by name, email or phone"
                 value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="citizen">Citizen</option>
            <option value="admin">Admin</option>
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
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isSelf = u.id === currentUser?.id;
              return (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.is_active ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-danger">Deactivated</span>
                    )}
                  </td>
                  <td>{u.created_at}</td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        disabled={isSelf}
                        title={isSelf ? "You can't change your own role" : ''}
                        onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'citizen' : 'admin')}
                      >
                        {u.role === 'admin' ? 'Demote to Citizen' : 'Promote to Admin'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        disabled={isSelf}
                        title={isSelf ? "You can't deactivate your own account" : ''}
                        onClick={() => handleToggleActive(u.id)}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
