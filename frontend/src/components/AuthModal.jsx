import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './styles/AuthModal.css';

const AuthModal = () => {
    const { showAuthModal, setShowAuthModal, login, signup, googleLogin, error: authError } = useAuth();
    const [activeTab, setActiveTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login form state
    const [loginData, setLoginData] = useState({
        username: '',
        password: ''
    });

    // Signup form state
    const [signupData, setSignupData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleLoginChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignupChange = (e) => {
        setSignupData({
            ...signupData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const result = await login(loginData.username, loginData.password);
            if (!result.success) {
                setError(result.error);
            } else {
                setLoginData({ username: '', password: '' });
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validate passwords match
        if (signupData.password !== signupData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        
        try {
            const result = await signup({
                firstName: signupData.firstName,
                lastName: signupData.lastName,
                email: signupData.email,
                password: signupData.password,
                username: signupData.email.split('@')[0] // Generate username from email
            });
            
            if (!result.success) {
                setError(result.error);
            } else {
                setSignupData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

const handleGoogleLogin = () => {
    // Direct hardcoded URL to backend - no dynamic variables
    window.location.href = "https://ethiopia-calander.onrender.com/api/auth/google";
};

    const closeModal = () => {
        setShowAuthModal(false);
        setError('');
        setLoginData({ username: '', password: '' });
        setSignupData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
    };

    const switchToSignup = () => {
        setActiveTab('signup');
        setError('');
    };

    const switchToLogin = () => {
        setActiveTab('login');
        setError('');
    };

    if (!showAuthModal) return null;

    return (
        <div className="auth-modal active" onClick={closeModal}>
            <div className="auth-container" onClick={(e) => e.stopPropagation()}>
                <div className="auth-header">
                    <h2>ወደ ኢትዮጵያ ቀን መቁጠሪያ እንኳን ደህና መጡ</h2>
                    <p>Welcome to Ethiopian Calendar</p>
                    <p className="auth-subtitle">Sign in to access all features</p>
                </div>
                
                <div className="auth-tabs">
                    <button 
                        className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => setActiveTab('login')}
                        disabled={loading}
                    >
                        Login
                    </button>
                    <button 
                        className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signup')}
                        disabled={loading}
                    >
                        Sign Up
                    </button>
                </div>
                
                {/* Google OAuth Button */}
                <div className="oauth-section">
                    <button 
                        className="google-btn"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" />
                        Continue with Google
                    </button>
                    <div className="divider">
                        <span>or</span>
                    </div>
                </div>
                
                {(error || authError) && (
                    <div className="auth-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {error || authError}
                    </div>
                )}
                
                <div className="auth-form">
                    {activeTab === 'login' ? (
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label htmlFor="login-username">
                                    <i className="fas fa-user"></i> Username or Email
                                </label>
                                <input 
                                    type="text" 
                                    id="login-username"
                                    name="username"
                                    value={loginData.username}
                                    onChange={handleLoginChange}
                                    placeholder="Enter your username or email"
                                    required 
                                    disabled={loading}
                                    autoComplete="username"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="login-password">
                                    <i className="fas fa-lock"></i> Password
                                </label>
                                <input 
                                    type="password" 
                                    id="login-password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    placeholder="Enter your password"
                                    required 
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                            </div>
                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input type="checkbox" /> Remember me
                                </label>
                                <button type="button" className="forgot-password">
                                    Forgot password?
                                </button>
                            </div>
                            <button 
                                type="submit" 
                                className="auth-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Logging in...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-sign-in-alt"></i> Login
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup}>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label htmlFor="signup-firstName">
                                        <i className="fas fa-user"></i> First Name
                                    </label>
                                    <input 
                                        type="text" 
                                        id="signup-firstName"
                                        name="firstName"
                                        value={signupData.firstName}
                                        onChange={handleSignupChange}
                                        placeholder="First name"
                                        required 
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group half">
                                    <label htmlFor="signup-lastName">
                                        <i className="fas fa-user"></i> Last Name
                                    </label>
                                    <input 
                                        type="text" 
                                        id="signup-lastName"
                                        name="lastName"
                                        value={signupData.lastName}
                                        onChange={handleSignupChange}
                                        placeholder="Last name"
                                        required 
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-email">
                                    <i className="fas fa-envelope"></i> Email
                                </label>
                                <input 
                                    type="email" 
                                    id="signup-email"
                                    name="email"
                                    value={signupData.email}
                                    onChange={handleSignupChange}
                                    placeholder="Enter your email"
                                    required 
                                    disabled={loading}
                                    autoComplete="email"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-password">
                                    <i className="fas fa-lock"></i> Password
                                </label>
                                <input 
                                    type="password" 
                                    id="signup-password"
                                    name="password"
                                    value={signupData.password}
                                    onChange={handleSignupChange}
                                    placeholder="Create a password (min. 6 characters)"
                                    required 
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-confirm">
                                    <i className="fas fa-lock"></i> Confirm Password
                                </label>
                                <input 
                                    type="password" 
                                    id="signup-confirm"
                                    name="confirmPassword"
                                    value={signupData.confirmPassword}
                                    onChange={handleSignupChange}
                                    placeholder="Confirm your password"
                                    required 
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="terms">
                                <label className="checkbox-label">
                                    <input type="checkbox" required /> 
                                    I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                                </label>
                            </div>
                            <button 
                                type="submit" 
                                className="auth-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Creating account...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-user-plus"></i> Sign Up
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                    
                    <div className="auth-switch">
                        {activeTab === 'login' ? (
                            <p>
                                Don't have an account?{' '}
                                <button 
                                    onClick={switchToSignup}
                                    disabled={loading}
                                >
                                    Sign up
                                </button>
                            </p>
                        ) : (
                            <p>
                                Already have an account?{' '}
                                <button 
                                    onClick={switchToLogin}
                                    disabled={loading}
                                >
                                    Login
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
