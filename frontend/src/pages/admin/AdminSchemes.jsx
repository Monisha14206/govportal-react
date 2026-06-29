import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminSchemes() {
  const [schemes, setSchemes] = useState([]);

  function load() {
    api.get('/admin/schemes').then(({ data }) => setSchemes(data.schemes));
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(id) {
    await api.put(`/admin/schemes/${id}/toggle`);
    load();
  }

  return (
    <>
      <h3 className="mb-4"><i className="fa-solid fa-gears"></i> Manage Schemes</h3>

      <div className="table-responsive">
        <table className="table table-hover bg-white align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {schemes.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td>
                  {s.is_active ? (
                    <span className="badge bg-success">Active</span>
                  ) : (
                    <span className="badge bg-secondary">Inactive</span>
                  )}
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleToggle(s.id)}>
                    {s.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-muted small">
        Deactivating a scheme hides it from the public Government Schemes listing and stops new applications,
        without affecting applications already submitted for it.
      </p>
    </>
  );
}
