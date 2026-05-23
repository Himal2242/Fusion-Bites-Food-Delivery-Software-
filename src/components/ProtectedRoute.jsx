import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return currentUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;