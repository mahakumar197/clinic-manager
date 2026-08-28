import { Navigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import { useAppSelector } from '../app/store';

interface GuestRouteProps {
    children: React.ReactNode;
}

/**
 * Guest route wrapper
 * Redirects to dashboard if user is already authenticated
 */
export const GuestRoute = ({ children }: GuestRouteProps) => {
    const { accessToken } = useAppSelector((state) => state.auth);

    if (accessToken) {
        return <Navigate to={ROUTES.MESSAGES} replace />;
    }

    return <>{children}</>;
};
