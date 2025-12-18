import { NavLink } from 'react-router-dom';

function Sidenavbar() {
          const styles = {
                    sidenavbar: {
                              position: 'fixed',
                              left: 0,
                              top: 0,
                              height: '100vh',
                              width: '80px',
                              background: '#1e1e2d',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '20px 0',
                              zIndex: 1000,
                    },
                    logo: {
                              width: '45px',
                              height: '45px',
                              background: '#f97316',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '30px',
                              fontSize: '20px',
                              fontWeight: '700',
                              color: '#fff',
                    },
                    navItems: {
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              alignItems: 'center',
                              flex: 1,
                    },
                    navItem: {
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '50px',
                              height: '50px',
                              borderRadius: '12px',
                              color: '#8b8b9e',
                              textDecoration: 'none',
                              transition: 'all 0.3s ease',
                              position: 'relative',
                    },
                    navItemActive: {
                              color: '#ffffff',
                              background: '#22c55e',
                    },
          };

          const getNavStyle = ({ isActive }) => ({
                    ...styles.navItem,
                    ...(isActive ? styles.navItemActive : {}),
          });

          return (
                    <nav style={styles.sidenavbar}>
                              <div style={styles.logo}>IS</div>
                              <div style={styles.navItems}>
                                        <NavLink to="/" style={getNavStyle} title="Home">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                                  </svg>
                                        </NavLink>

                                        <NavLink to="/dashboard" style={getNavStyle} title="Dashboard">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                                                            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                                                            <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                                                            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                                                  </svg>
                                        </NavLink>

                                        <NavLink to="/mail" style={getNavStyle} title="Mail">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                            <polyline points="22,6 12,13 2,6"></polyline>
                                                  </svg>
                                        </NavLink>

                                        <NavLink to="/todo" style={getNavStyle} title="ToDo">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                  </svg>
                                        </NavLink>

                                        <NavLink to="/notes" style={getNavStyle} title="Notes">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                            <polyline points="14 2 14 8 20 8"></polyline>
                                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                                  </svg>
                                        </NavLink>

                                        <NavLink to="/jira" style={getNavStyle} title="Jira">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84h-9.63z" />
                                                            <path d="M6.77 6.8a4.36 4.36 0 0 0 4.34 4.37h1.8v1.7a4.36 4.36 0 0 0 4.34 4.35V7.63a.84.84 0 0 0-.83-.83H6.77z" />
                                                            <path d="M2 11.6c0 2.4 1.95 4.35 4.35 4.37h1.78v1.7c.01 2.39 1.95 4.33 4.35 4.33v-9.57a.84.84 0 0 0-.84-.84H2v.01z" />
                                                  </svg>
                                        </NavLink>
                              </div>
                    </nav>
          );
}

export default Sidenavbar;
