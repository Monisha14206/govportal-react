import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminServices() {
  const [services, setServices] = useState([]);

  function load() {
    api.get('/admin/services').then(({ data }) => setServices(data.services));
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(id) {
    await api.put(`/admin/services/${id}/toggle`);
    load();
  }

  return (
    <>
      <h3 className="mb-4"><i className="fa-solid fa-gear"></i> Manage Services</h3>

      <div className="table-responsive">
        <table className="table table-hover bg-white align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Fee</th>
              <th>Processing Days</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td>₹{s.fee}</td>
                <td>{s.processing_days}</td>
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
        To add entirely new service types with custom form fields, insert a row directly into the <code>services</code> table
        (see <code>backend/config/db.js</code> seed function for the JSON format of <code>form_fields</code>).
      </p>
    </>
  );
}
