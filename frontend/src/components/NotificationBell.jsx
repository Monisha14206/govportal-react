import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  function load() {
    api.get('/notifications/mine')
      .then(({ data }) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
    // Poll every 30s so a citizen sees a status update without refreshing.
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  async function handleToggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      try {
        await api.put('/notifications/mark-all-read');
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch {
        // non-critical - leave unread state as-is on failure
      }
    }
  }

  return (
    <div className="position-relative ms-2" ref={wrapperRef}>
      <button
        type="button"
        className="btn btn-outline-light btn-sm position-relative notification-bell-btn"
        onClick={handleToggleOpen}
        aria-label="Notifications"
      >
        <i className="fa-solid fa-bell"></i>
        {unreadCount > 0 && (
          <span className="badge rounded-pill bg-danger notification-bell-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-bell-dropdown shadow">
          <div className="notification-bell-header">
            <strong>Notifications</strong>
          </div>
          {notifications.length === 0 ? (
            <div className="text-muted small p-3">No notifications yet.</div>
          ) : (
            <ul className="list-unstyled m-0">
              {notifications.map(n => (
                <li key={n.id} className={`notification-bell-item ${n.read ? '' : 'unread'}`}>
                  <div className="small">{n.message}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{n.created_at}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
