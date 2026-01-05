import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to login');
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-left-panel">
                <div className="signin-bg-overlay"></div>
                <div
                    className="signin-bg-image"
                    style={{ backgroundImage: 'url("https://kirtankar.com/wp-content/uploads/2025/08/Dravidian-Temple-Architecture-A-Detailed-Guide-1200x650.jpg")' }}
                ></div>
            </div>

            <div className="signin-right-panel">
                <div className="signin-form-container">
                    <div className="signin-header-text">
                        <h1 className="signin-title">Admin Portal</h1>
                        <p className="signin-subtitle">Please sign in to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="signin-form">
                        <div className="signin-form-group">
                            <label className="signin-label">Email Address</label>
                            <input
                                type="email"
                                className="signin-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="signin-form-group">
                            <label className="signin-label">Password</label>
                            <div className="signin-password-container">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="signin-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="signin-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        {error && <div style={{ color: 'red', fontSize: '0.875rem' }}>{error}</div>}

                        <button type="submit" className="signin-button-primary">
                            Sign In
                        </button>
                    </form>

                    <div className="signin-footer">
                        <div className="signin-footer-links">
                            <span>© 2025 Sankalpam</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
