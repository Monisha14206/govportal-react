import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <div className="tricolor-rule"></div>
      <nav className="navbar navbar-expand-lg navbar-dark gov-navbar">
        <div className="container">
          <button
            className="hamburger-btn me-2"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sideMenu"
            aria-controls="sideMenu"
            aria-label="Open menu"
          >
            <i className="fa-solid fa-bars"></i>
          </button>

          <Link className="navbar-brand fw-bold flex-grow-1" to="/">
            <span className="emblem-medallion medallion-sm">
              <img src="/assets/ap-emblem.jpg" alt="Andhra Pradesh State Emblem" />
            </span>
            <span>
              Sachivalayam <span className="text-warning">Portal</span>
              <small>Govt. of Andhra Pradesh</small>
            </span>
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
              <li className="nav-item"><Link className="nav-link" to="/services">Services</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/contact">Contact</Link></li>

              {user ? (
                user.role === 'admin' ? (
                  <li className="nav-item"><Link className="nav-link" to="/admin/dashboard"><i className="fa-solid fa-gauge"></i> Admin Dashboard</Link></li>
                ) : (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/applications/mine">My Applications</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/complaints/mine">My Complaints</Link></li>
                  </>
                )
              ) : null}

              {user ? (
                <li className="nav-item ms-2 d-flex align-items-center gap-2">
                  <NotificationBell />
                  <Link className="btn btn-outline-light btn-sm" to="/profile">
                    <i className="fa-solid fa-user"></i> Profile
                  </Link>
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    <i className="fa-solid fa-right-from-bracket"></i> Logout ({user.name})
                  </button>
                </li>
              ) : (
                <>
                  <li className="nav-item"><Link className="btn btn-outline-light btn-sm ms-2" to="/login">Login</Link></li>
                  <li className="nav-item"><Link className="btn btn-warning btn-sm ms-2" to="/register">Register</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <Sidebar />
    </>
  );
}
