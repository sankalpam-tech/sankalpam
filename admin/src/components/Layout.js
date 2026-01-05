import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/Admin.css';

const Layout = () => {
    return (
        <div className="admin-page-wrapper">
            <div className="admin-wrapper">
                <Sidebar />
                <div className="admin-main">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
