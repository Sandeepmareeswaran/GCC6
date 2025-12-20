import { NavLink } from 'react-router-dom';

function Sidenavbar() {
  const styles = {
    sidenavbar: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '210px',
      background: '#1e1e2d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '20px',
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
      marginBottom: '20px',
      fontSize: '20px',
      fontWeight: '700',
      color: '#fff',
    },
    navItems: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'stretch',
      flex: 1,
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      height: '48px',
      borderRadius: '12px',
      color: '#8b8b9e',
      textDecoration: 'none',
      transition: 'all 0.15s ease',
      position: 'relative',
      padding: '8px 12px',
    },
    navItemActive: {
      color: '#ffffff',
      background: '#22c55e',
    },
    label: {
      marginLeft: '12px',
      fontSize: '14px',
      color: 'inherit',
      whiteSpace: 'nowrap',
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
          <span style={styles.label}>Home</span>
        </NavLink>

        <NavLink to="/dashboard" style={getNavStyle} title="Dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
          </svg>
          <span style={styles.label}>Dashboard</span>
        </NavLink>

        <NavLink to="/mail" style={getNavStyle} title="Mail">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span style={styles.label}>Mail</span>
        </NavLink>

        <NavLink to="/todo" style={getNavStyle} title="ToDo">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span style={styles.label}>To Do</span>
        </NavLink>

        <NavLink to="/notes" style={getNavStyle} title="Notes">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span style={styles.label}>Notes</span>
        </NavLink>

        <NavLink to="/jira" style={getNavStyle} title="Jira">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84h-9.63z" />
            <path d="M6.77 6.8a4.36 4.36 0 0 0 4.34 4.37h1.8v1.7a4.36 4.36 0 0 0 4.34 4.35V7.63a.84.84 0 0 0-.83-.83H6.77z" />
            <path d="M2 11.6c0 2.4 1.95 4.35 4.35 4.37h1.78v1.7c.01 2.39 1.95 4.33 4.35 4.33v-9.57a.84.84 0 0 0-.84-.84H2v.01z" />
          </svg>
          <span style={styles.label}>Jira</span>
        </NavLink>

        {/* Inventory Management */}
        <NavLink to="/inventory" style={getNavStyle} title="Inventory">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="11" x2="22" y2="11"></line>
            <path d="M2 15h20"></path>
            <path d="M7 19h10"></path>
          </svg>
          <span style={styles.label}>Inventory</span>
        </NavLink>

        <NavLink to="/sales" style={getNavStyle} title="Sales">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
          </svg>
          <span style={styles.label}>Sales</span>
        </NavLink>

        {/* Slack Integration */}
        <NavLink to="/slack" style={getNavStyle} title="Slack">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
          </svg>
          <span style={styles.label}>Slack</span>
        </NavLink>

        {/* Notion Integration */}
        <NavLink to="/notion" style={getNavStyle} title="Notion">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.696c-.419-.326-.979-.699-2.055-.607L2.896 2.284c-.466.07-.56.28-.373.466zM5.251 7.466v13.673c0 .746.373 1.027 1.212.98l14.498-.84c.84-.046.932-.56.932-1.166V6.63c0-.606-.233-.933-.746-.886l-15.152.84c-.56.047-.746.327-.746.886zm14.312.84c.093.42 0 .84-.42.886l-.699.14v10.057c-.606.326-1.166.513-1.632.513-.746 0-.933-.233-1.492-.933l-4.569-7.178v6.946l1.445.326s0 .84-1.166.84l-3.216.186c-.093-.186 0-.653.326-.746l.84-.233V9.5L7.326 9.36c-.093-.42.14-1.026.793-1.073l3.45-.233 4.756 7.272V8.96l-1.166-.14c-.093-.513.28-.886.746-.932zM2.896 1.028L16.83.001c1.166-.093 1.446 0 2.195.56l3.589 2.426c.56.42.746.933.746 1.586v16.239c0 1.026-.373 1.633-1.679 1.726l-15.477.886c-.979.047-1.446-.093-1.959-.747L1.682 19.08c-.56-.746-.793-1.305-.793-1.959V2.799c0-.84.373-1.679 2.008-1.772z" />
          </svg>
          <span style={styles.label}>Notion</span>
        </NavLink>

      </div>
    </nav>
  );
}

export default Sidenavbar;
