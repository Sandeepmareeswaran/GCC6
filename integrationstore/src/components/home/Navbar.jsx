import React, { useState, useEffect } from 'react';

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
                              // If only email exists, use email as display name
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

          const styles = {
                    nav: {
                              position: 'fixed',
                              top: 0,
                              width: '100%',
                              zIndex: 50,
                              backdropFilter: 'blur(12px)',
                              background: 'rgba(15, 15, 35, 0.8)',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    container: {
                              maxWidth: '1280px',
                              margin: '0 auto',
                              padding: '0 24px',
                    },
                    flexContainer: {
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              height: '64px',
                    },
                    logo: {
                              fontSize: '24px',
                              fontWeight: '700',
                              background: 'linear-gradient(135deg, #4fc3f7 0%, #ab47bc 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                    },
                    navLinks: {
                              display: 'flex',
                              gap: '32px',
                    },
                    navLink: {
                              color: '#e0e0e0',
                              textDecoration: 'none',
                              fontWeight: '500',
                              transition: 'color 0.3s ease',
                              cursor: 'pointer',
                    },
                    rightSection: {
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px',
                    },
                    userInfo: {
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                    },
                    welcomeText: {
                              color: '#8b8b9e',
                              fontSize: '14px',
                    },
                    userName: {
                              color: '#fff',
                              fontWeight: '600',
                              fontSize: '15px',
                    },
                    logoutBtn: {
                              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
                              color: '#fff',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '25px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              fontSize: '14px',
                    },
                    getStartedBtn: {
                              background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
                              color: '#fff',
                              border: 'none',
                              padding: '10px 24px',
                              borderRadius: '25px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 15px rgba(79, 195, 247, 0.4)',
                    },
          };

          return (
                    <nav style={styles.nav}>
                              <div style={styles.container}>
                                        <div style={styles.flexContainer}>
                                                  <div>
                                                            <span style={styles.logo}>IntegrationStore</span>
                                                  </div>

                                                  <div style={styles.navLinks}>
                                                            <a href="#" style={styles.navLink}>Home</a>
                                                            <a href="#" style={styles.navLink}>Integrations</a>
                                                            <a href="#" style={styles.navLink}>Pricing</a>
                                                            <a href="#" style={styles.navLink}>Documentation</a>
                                                  </div>

                                                  <div style={styles.rightSection}>
                                                            <div style={styles.userInfo}>
                                                                      <span style={styles.welcomeText}>Welcome,</span>
                                                                      <span style={styles.userName}>{username}</span>
                                                            </div>

                                                            {isLoggedIn ? (
                                                                      <button style={styles.logoutBtn} onClick={handleLogout}>
                                                                                Logout
                                                                      </button>
                                                            ) : (
                                                                      <button style={styles.getStartedBtn}>
                                                                                Get Started
                                                                      </button>
                                                            )}
                                                  </div>
                                        </div>
                              </div>
                    </nav>
          );
};

export default Navbar;
