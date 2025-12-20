import React, { useState, useEffect } from 'react';
import nstyles from './Navbar.module.css';

const Navbar = () => {
    const [username, setUsername] = useState('Guest');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('userEmail');

        if (storedUsername) {
            setUsername(storedUsername);
            setIsLoggedIn(true);
        } else if (storedEmail) {
            setUsername(storedEmail.split('@')[0]);
            setIsLoggedIn(true);
        } else {
            setUsername('Guest');
            setIsLoggedIn(false);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('username');
        setUsername('Guest');
        setIsLoggedIn(false);
        window.location.reload();
    };

    return (
        <nav className={`fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-lg ${nstyles.navRoot}`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-6">
                        <a href="#" className={`text-2xl font-extrabold ${nstyles.brand} integration-store-orange`}>Integration Store</a>
                        {/* Removed nav links for Home, Integrations, Pricing, Documentation */}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3">
                            <span className="text-sm text-gray-500">Welcome,</span>
                            <span className={`text-sm font-semibold ${nstyles.userName}`}>{username}</span>
                        </div>

                        {isLoggedIn ? (
                            <button onClick={handleLogout} className={`logoutBtn`}>Logout</button>
                        ) : (
                            <a href="#" className={`getStartedBtn`}>Get Started</a>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
