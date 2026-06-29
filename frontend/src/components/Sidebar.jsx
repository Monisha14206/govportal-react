import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function closeOffcanvas() {
    // Bootstrap's data attributes handle opening; for closing on link click
    // we just let the browser navigate - Bootstrap closes it automatically
    // when a click occurs outside, but we trigger a manual close too.
    const el = document.getElementById('sideMenu');
    if (el && window.bootstrap) {
      const instance = window.bootstrap.Offcanvas.getInstance(el) || new window.bootstrap.Offcanvas(el);
      instance.hide();
    }
  }

  function handleLogout() {
    closeOffcanvas();
    logout();
    navigate('/');
  }

  return (
    <div className="offcanvas offcanvas-start gov-sidebar" tabIndex="-1" id="sideMenu" aria-labelledby="sideMenuLabel">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="sideMenuLabel">
          <span className="emblem-medallion medallion-sm">
            <img src="/assets/ap-emblem.jpg" alt="Andhra Pradesh State Emblem" />
          </span>
          Sachivalayam Portal
        </h5>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
      </div>
      <div className="offcanvas-body d-flex flex-column">
        <nav className="nav nav-pills flex-column gap-1">
          <Link className="nav-link" to="/" onClick={closeOffcanvas}><i className="fa-solid fa-house"></i> Home</Link>
          <Link className="nav-link" to="/about" onClick={closeOffcanvas}><i className="fa-solid fa-circle-info"></i> About</Link>

          <div className="sidebar-section-label">Services &amp; Schemes</div>
          <Link className="nav-link" to="/services?tab=browse" onClick={closeOffcanvas}><i className="fa-solid fa-list-check"></i> Browse Services</Link>
          <Link className="nav-link" to="/services?tab=schemes" onClick={closeOffcanvas}><i className="fa-solid fa-hand-holding-heart"></i> Government Schemes</Link>
          <Link className="nav-link" to="/services?tab=track" onClick={closeOffcanvas}><i className="fa-solid fa-magnifying-glass"></i> Track Application</Link>

          <div className="sidebar-section-label">Grievances</div>
          <Link className="nav-link" to="/complaints?tab=register" onClick={closeOffcanvas}><i className="fa-solid fa-triangle-exclamation"></i> File a Complaint</Link>
          <Link className="nav-link" to="/complaints?tab=track" onClick={closeOffcanvas}><i className="fa-solid fa-magnifying-glass"></i> Track Complaint</Link>

          {user && user.role !== 'admin' && (
            <>
              <div className="sidebar-section-label">My Account</div>
              <Link className="nav-link" to="/profile" onClick={closeOffcanvas}><i className="fa-solid fa-user"></i> My Profile</Link>
              <Link className="nav-link" to="/applications/mine" onClick={closeOffcanvas}><i className="fa-solid fa-folder-open"></i> My Applications</Link>
              <Link className="nav-link" to="/scheme-applications/mine" onClick={closeOffcanvas}><i className="fa-solid fa-hand-holding-heart"></i> My Scheme Applications</Link>
              <Link className="nav-link" to="/complaints/mine" onClick={closeOffcanvas}><i className="fa-solid fa-comment-dots"></i> My Complaints</Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <>
              <div className="sidebar-section-label">Administration</div>
              <Link className="nav-link" to="/admin/dashboard" onClick={closeOffcanvas}><i className="fa-solid fa-gauge"></i> Admin Dashboard</Link>
              <Link className="nav-link" to="/admin/applications" onClick={closeOffcanvas}><i className="fa-solid fa-file-lines"></i> Manage Applications</Link>
              <Link className="nav-link" to="/admin/scheme-applications" onClick={closeOffcanvas}><i className="fa-solid fa-hand-holding-heart"></i> Manage Scheme Applications</Link>
              <Link className="nav-link" to="/admin/complaints" onClick={closeOffcanvas}><i className="fa-solid fa-comment-dots"></i> Manage Complaints</Link>
              <Link className="nav-link" to="/admin/services" onClick={closeOffcanvas}><i className="fa-solid fa-gear"></i> Manage Services</Link>
              <Link className="nav-link" to="/admin/schemes" onClick={closeOffcanvas}><i className="fa-solid fa-gears"></i> Manage Schemes</Link>
              <Link className="nav-link" to="/admin/users" onClick={closeOffcanvas}><i className="fa-solid fa-users"></i> Manage Users</Link>
              <Link className="nav-link" to="/admin/contact-messages" onClick={closeOffcanvas}><i className="fa-solid fa-envelope-open-text"></i> Contact Messages</Link>
            </>
          )}

          <div className="sidebar-section-label">Get in Touch</div>
          <Link className="nav-link" to="/contact" onClick={closeOffcanvas}><i className="fa-solid fa-phone"></i> Contact Us</Link>
        </nav>

        <div className="mt-auto pt-3 border-top">
          {user ? (
            <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i> Logout ({user.name})
            </button>
          ) : (
            <div className="d-flex gap-2">
              <Link className="btn btn-outline-primary w-50" to="/login" onClick={closeOffcanvas}>Login</Link>
              <Link className="btn btn-primary w-50" to="/register" onClick={closeOffcanvas}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
