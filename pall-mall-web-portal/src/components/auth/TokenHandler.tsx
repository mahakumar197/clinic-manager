import { useEffect } from 'react';
import { useAppDispatch } from '@/app/store';
import { setCredentials } from '@/features/auth/authSlice';

/**
 * TokenHandler
 * Checks for OAuth tokens in the URL query parameters at application startup.
 * If found, saves them to Redux and cleans the URL.
 */
const TokenHandler = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Check if we are at the root path or any path really, but specifically for the callback scenario
        const searchParams = new URLSearchParams(window.location.search);
        const accessToken = searchParams.get('accessToken') || searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (accessToken) {
            // Dispatch to Redux
            dispatch(setCredentials({
                accessToken,
                refreshToken: refreshToken || undefined
            }));

            // Clean the URL without reloading
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, newUrl);
        } else if (error) {
            console.error('OAuth Error from root:', error);
            // Optional: Dispatch error state or let the Login component handle it if redirected
            // Clearing URL to avoid persistent error state in URL
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, [dispatch]);

    return null; // This component renders nothing
};

export default TokenHandler;
