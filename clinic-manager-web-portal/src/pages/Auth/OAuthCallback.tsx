import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/app/store';
import { updateTokens, login, setCredentials, fetchUserProfile } from '@/features/auth/authSlice';
import { ROUTES } from '@/constants/routes';
import { LoadingSpinner } from '@/components/common';
import { Box, Typography } from '@mui/material';
import { toast } from '@/utils/toast';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const handleCallback = async () => {
            const accessToken = searchParams.get('accessToken') || searchParams.get('token');
            const refreshToken = searchParams.get('refreshToken');
            const error = searchParams.get('error');

            if (error) {
                console.error('OAuth Error:', error);
                toast.error('Authentication failed. Please try again.');
                navigate(ROUTES.LOGIN, { state: { error: 'Authentication failed. Please try again.' } });
                return;
            }

            if (accessToken) {
                // Set tokens in Redux
                dispatch(setCredentials({
                    accessToken,
                    refreshToken: refreshToken || undefined
                }));

                // Fetch user profile to complete login
                try {
                    // We need to fetch profile to get user role and details
                    // @ts-ignore - Thunk type inference might be tricky with simple dispatch
                    await dispatch(fetchUserProfile(accessToken)).unwrap();

                    toast.success('Login successful');
                    navigate(ROUTES.MESSAGES);
                } catch (err) {
                    console.error('Failed to fetch user profile:', err);
                    toast.error('Login verification failed');
                    navigate(ROUTES.LOGIN, { state: { error: 'Login verification failed.' } });
                }
            } else {
                navigate(ROUTES.LOGIN);
            }
        };

        handleCallback();
    }, [searchParams, navigate, dispatch]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <LoadingSpinner />
            <Typography variant="h6" sx={{ mt: 2 }}>Authenticating...</Typography>
        </Box>
    );
};

export default OAuthCallback;
