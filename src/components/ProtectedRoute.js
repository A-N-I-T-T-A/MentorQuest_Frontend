import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken } from '../services/authUtils';

const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const location = useLocation();
  const token = getAuthToken();
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  
  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userData.user_type?.toLowerCase())) {
    // Redirect to appropriate dashboard if user type doesn't match
    const defaultRedirect = `/dashboard/${userData.user_type?.toLowerCase() || 'mentee'}`;
    return <Navigate to={defaultRedirect} replace />;
  }

  return children;
};

export default ProtectedRoute; 