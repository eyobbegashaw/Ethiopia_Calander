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
                
                // You might want to update your auth context here
                // For example, if you have a global state management
                if (window.updateAuthState) {
                    window.updateAuthState({ user, token });
                }
                
                // Redirect to home or dashboard
                navigate('/', { replace: true });
            } catch (error) {
                console.error('Error parsing OAuth data:', error);
                navigate('/login?error=invalid_data');
            }
        } else {
            console.error('Missing token or user data');
            navigate('/login?error=missing_data');
        }
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '40px', color: '#007bff' }}></i>
            </div>
            <p style={{ fontSize: '18px', color: '#666' }}>Completing authentication...</p>
        </div>
    );
};

export default OAuthRedirect;
