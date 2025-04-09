import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateAdminRoute = ({ children }) => {
  const { user } = useAuth(); // Sử dụng custom hook
  
  // Nếu chưa login hoặc không phải admin thì chuyển hướng về login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateAdminRoute;