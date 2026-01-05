import React from 'react';
import '../styles/Admin.css';

const Header = ({ title, subtitle, actions }) => {
    return (
        <header className="admin-header">
            <div className="header-banner">
                <div className="banner-overlay"></div>
                <div className="banner-content">
                    <div>
                        <h1 className="page-title">{title}</h1>
                        <p className="page-subtitle">{subtitle}</p>
                    </div>
                    {actions && <div className="header-actions">{actions}</div>}
                </div>
            </div>
        </header>
    );
};

export default Header;
