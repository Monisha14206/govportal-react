import { Fragment, useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [q, setQ] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [expanded, setExpanded] = useState(null);

  function load(params = {}) {
    api.get('/admin/contact-messages', { params }).then(({ data }) => setMessages(data.messages));
  }

  useEffect(() => { load(); }, []);

  function handleFilter(e) {
    e.preventDefault();
    load({ q, unread: unreadOnly ? 'true' : undefined });
  }

  async function handleExpand(message) {
    setExpanded(expanded === message.id ? null : message.id);
    if (!message.is_read) {
      await api.put(`/admin/contact-messages/${message.id}/read`);
      setMessages(prev => prev.map(m => (m.id === message.id ? { ...m, is_read: true } : m)));
    }
  }

  return (
    <>
      <h3 className="mb-4"><i className="fa-solid fa-envelope-open-text"></i> Contact Messages</h3>

      <form onSubmit={handleFilter} className="row g-2 mb-4 align-items-center">
        <div className="col-md-6">
          <input type="text" className="form-control" placeholder="Search by name, email, subject or message"
                 value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="col-md-3 form-check ms-2">
          <input className="form-check-input" type="checkbox" id="unreadOnly"
                 checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} />
          <label className="form-check-label" htmlFor="unreadOnly">Unread only</label>
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">Filter</button>
        </div>
      </form>

      {messages.length === 0 ? (
        <div className="alert alert-info">No contact messages match your filters.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover bg-white align-middle">
            <thead>
              <tr>
                <th></th>
                <th>From</th>
                <th>Subject</th>
                <th>Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(m => (
                <Fragment key={m.id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => handleExpand(m)}>
                    <td><i className={`fa-solid ${expanded === m.id ? 'fa-chevron-down' : 'fa-chevron-right'} text-muted`}></i></td>
                    <td>{m.name}<br /><small className="text-muted">{m.email}</small></td>
                    <td>{m.subject}</td>
                    <td>{m.created_at}</td>
                    <td>
                      {m.is_read ? (
                        <span className="badge bg-secondary">Read</span>
                      ) : (
                        <span className="badge bg-warning text-dark">Unread</span>
                      )}
                    </td>
                  </tr>
                  {expanded === m.id && (
                    <tr>
                      <td></td>
                      <td colSpan={4}>
                        <div className="p-3 bg-light rounded mb-2">
                          {m.phone && <p className="mb-1 small"><strong>Phone:</strong> {m.phone}</p>}
                          <p className="mb-0">{m.message}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
