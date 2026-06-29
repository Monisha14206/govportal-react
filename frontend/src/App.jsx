import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Apply from './pages/Apply';
import MyApplications from './pages/MyApplications';
import SchemeApply from './pages/SchemeApply';
import MySchemeApplications from './pages/MySchemeApplications';
import Complaints from './pages/Complaints';
import MyComplaints from './pages/MyComplaints';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminSchemeApplications from './pages/admin/AdminSchemeApplications';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminServices from './pages/admin/AdminServices';
import AdminSchemes from './pages/admin/AdminSchemes';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContactMessages from './pages/admin/AdminContactMessages';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <Navbar />
      <div className="container mt-4 mb-5 page-watermark">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/services/:id/apply" element={<ProtectedRoute><Apply /></ProtectedRoute>} />
          <Route path="/applications/mine" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
          <Route path="/schemes/:id/apply" element={<ProtectedRoute><SchemeApply /></ProtectedRoute>} />
          <Route path="/scheme-applications/mine" element={<ProtectedRoute><MySchemeApplications /></ProtectedRoute>} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaints/mine" element={<ProtectedRoute><MyComplaints /></ProtectedRoute>} />

          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
          <Route path="/admin/scheme-applications" element={<AdminRoute><AdminSchemeApplications /></AdminRoute>} />
          <Route path="/admin/complaints" element={<AdminRoute><AdminComplaints /></AdminRoute>} />
          <Route path="/admin/services" element={<AdminRoute><AdminServices /></AdminRoute>} />
          <Route path="/admin/schemes" element={<AdminRoute><AdminSchemes /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/contact-messages" element={<AdminRoute><AdminContactMessages /></AdminRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <footer className="gov-footer pt-5 pb-4">
        <div className="container">
          <div className="row gy-4">
            <div className="col-md-5">
              <div className="d-flex align-items-center gap-3 mb-3">
                <span className="emblem-medallion medallion-md">
                  <img src="/assets/ap-emblem.jpg" alt="Andhra Pradesh State Emblem" />
                </span>
                <div>
                  <h6 className="mb-0">Sachivalayam Portal</h6>
                  <small>Government of Andhra Pradesh</small>
                </div>
              </div>
              <p className="small mb-0">
                A unified platform for citizen services, government welfare schemes,
                certificates, and civic complaint resolution — bringing the village and
                ward secretariat online.
              </p>
            </div>
            <div className="col-md-3">
              <h6>Quick Links</h6>
              <ul className="list-unstyled small">
                <li className="mb-2"><Link to="/services?tab=browse">Browse Services</Link></li>
                <li className="mb-2"><Link to="/services?tab=schemes">Government Schemes</Link></li>
                <li className="mb-2"><Link to="/complaints?tab=register">File a Complaint</Link></li>
                <li className="mb-2"><Link to="/about">About this Portal</Link></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h6>Get in Touch</h6>
              <ul className="list-unstyled small">
                <li className="mb-2"><i className="fa-solid fa-envelope me-2"></i>support@sachivalayamportal.gov.in</li>
                <li className="mb-2"><i className="fa-solid fa-phone me-2"></i>1800-XXX-XXXX (Toll-Free)</li>
                <li className="mb-2"><i className="fa-solid fa-location-dot me-2"></i>Your Local Sachivalayam / Ward Secretariat</li>
              </ul>
            </div>
          </div>
          <hr />
          <p className="mb-0 small text-center">&copy; {new Date().getFullYear()} Sachivalayam Portal. All rights reserved.</p>
        </div>
      </footer>
      <div className="tricolor-rule"></div>
    </>
  );
}
