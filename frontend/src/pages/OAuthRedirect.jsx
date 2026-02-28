import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Get token and user from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');
        const error = urlParams.get('error');

        if (error) {
            console.error('OAuth error:', error);
            navigate('/login?error=oauth_failed');
            return;
        }

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                
                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Redirect to home
                navigate('/');
            } catch (error) {
                console.error('Error parsing OAuth data:', error);
                navigate('/login?error=invalid_data');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="oauth-loading">
            <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Completing authentication...</p>
            </div>
        </div>
    );
};

export default OAuthRedirect;