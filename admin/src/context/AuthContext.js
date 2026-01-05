import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role === 'admin') {
            setUser({ role });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Check against environment variables first (Hardcoded Admin)
            const envEmail = process.env.REACT_APP_ADMIN_EMAIL;
            const envPassword = process.env.REACT_APP_ADMIN_PASSWORD;

            if (envEmail && envPassword && email === envEmail && password === envPassword) {
                // Successful hardcoded login
                const user = { name: 'Admin', email: envEmail, role: 'admin' };
                localStorage.setItem('token', 'mock-admin-token');
                localStorage.setItem('role', 'admin');
                setUser(user);
                return true;
            }

            // Fallback to API login if env vars don't match or aren't set
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            if (user.role !== 'admin') {
                throw new Error('Access denied: Admins only');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('role', user.role);
            setUser(user);
            return true;
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
