import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-5">
      <i className="fa-solid fa-circle-question fa-4x text-muted mb-3"></i>
      <h2>404 - Page Not Found</h2>
      <p className="text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
