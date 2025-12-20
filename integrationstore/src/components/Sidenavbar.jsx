import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

function Sidenavbar() {
  const { theme, toggleTheme, currentTheme } = useTheme();
  const { language, setLanguage, isLoading, t } = useLanguage();

  const styles = {
    sidenavbar: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '210px',
      background: currentTheme.sidebarBg,
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
      gap: '6px',
      alignItems: 'stretch',
      flex: 1,
      width: '100%',
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      height: '42px',
      borderRadius: '12px',
      color: currentTheme.sidebarText,
      textDecoration: 'none',
      transition: 'all 0.15s ease',
      position: 'relative',
      padding: '8px 12px',
    },
    navItemActive: {
      color: currentTheme.sidebarActiveText,
      background: currentTheme.accent,
    },
    label: {
      marginLeft: '12px',
      fontSize: '14px',
      color: 'inherit',
      whiteSpace: 'nowrap',
    },
    bottomSection: {
      marginTop: 'auto',
      paddingTop: '16px',
      width: '100%',
      borderTop: `1px solid ${theme === 'dark' ? '#2d2d3d' : '#3d3d4d'}`,
    },
    languageSelector: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      marginBottom: '12px',
    },
    languageLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: '500',
      marginBottom: '4px',
      paddingLeft: '12px',
    },
    languageOptions: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
      paddingLeft: '4px',
    },
    langBtn: {
      padding: '6px 10px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    langBtnActive: {
      background: currentTheme.accent,
      color: '#ffffff',
    },
    langBtnInactive: {
      background: theme === 'dark' ? '#252535' : '#2a2a3d',
      color: '#9ca3af',
    },
    themeToggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '12px',
      borderRadius: '12px',
      background: theme === 'dark' ? '#252535' : '#2a2a3d',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease',
    },
    themeLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '500',
    },
    toggleSwitch: {
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      background: theme === 'dark' ? '#22c55e' : '#4b5563',
      position: 'relative',
      transition: 'all 0.2s ease',
    },
    toggleKnob: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: '#ffffff',
      position: 'absolute',
      top: '2px',
      left: theme === 'dark' ? '22px' : '2px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    },
    loadingBox: {
      background: currentTheme.bgCard,
      padding: '24px 40px',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    },
    spinner: {
      width: '32px',
      height: '32px',
      border: '3px solid transparent',
      borderTopColor: currentTheme.accent,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  };

  const getNavStyle = ({ isActive }) => ({
    ...styles.navItem,
    ...(isActive ? styles.navItemActive : {}),
  });

  const navItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/mail', label: 'Mail', icon: 'mail' },
    { path: '/jira', label: 'Jira', icon: 'jira' },
    { path: '/notion', label: 'Notion', icon: 'notion' },
    { path: '/slack', label: 'Slack', icon: 'slack' },
    { path: '/sales', label: 'Sales', icon: 'sales' },
    { path: '/inventory', label: 'Inventory', icon: 'inventory' },
    { path: '/todo', label: 'ToDo', icon: 'todo' },
    { path: '/notes', label: 'Notes', icon: 'notes' },
  ];

  // Fixed SVG icons
  const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );

  const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"></rect>
      <rect x="14" y="3" width="7" height="7" rx="1"></rect>
      <rect x="14" y="14" width="7" height="7" rx="1"></rect>
      <rect x="3" y="14" width="7" height="7" rx="1"></rect>
    </svg>
  );

  const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );

  const JiraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84h-9.63z"></path>
      <path d="M6.77 6.8a4.36 4.36 0 0 0 4.34 4.37h1.8v1.7a4.36 4.36 0 0 0 4.34 4.35V7.63a.84.84 0 0 0-.83-.83H6.77z"></path>
      <path d="M2 11.6c0 2.4 1.95 4.35 4.35 4.37h1.78v1.7c.01 2.39 1.95 4.33 4.35 4.33v-9.57a.84.84 0 0 0-.84-.84H2v.01z"></path>
    </svg>
  );

  const NotionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.696c-.419-.326-.979-.699-2.055-.607L2.896 2.284c-.466.07-.56.28-.373.466zM5.251 7.466v13.673c0 .746.373 1.027 1.212.98l14.498-.84c.84-.046.932-.56.932-1.166V6.63c0-.606-.233-.933-.746-.886l-15.152.84c-.56.047-.746.327-.746.886zm14.312.84c.093.42 0 .84-.42.886l-.699.14v10.057c-.606.326-1.166.513-1.632.513-.746 0-.933-.233-1.492-.933l-4.569-7.178v6.946l1.445.326s0 .84-1.166.84l-3.216.186c-.093-.186 0-.653.326-.746l.84-.233V9.5L7.326 9.36c-.093-.42.14-1.026.793-1.073l3.45-.233 4.756 7.272V8.96l-1.166-.14c-.093-.513.28-.886.746-.932z"></path>
    </svg>
  );

  const SlackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"></path>
    </svg>
  );

  const SalesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );

  const InventoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  );

  const TodoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );

  const NotesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
  );

  const getIcon = (icon) => {
    switch (icon) {
      case 'home': return <HomeIcon />;
      case 'dashboard': return <DashboardIcon />;
      case 'mail': return <MailIcon />;
      case 'jira': return <JiraIcon />;
      case 'notion': return <NotionIcon />;
      case 'slack': return <SlackIcon />;
      case 'sales': return <SalesIcon />;
      case 'inventory': return <InventoryIcon />;
      case 'todo': return <TodoIcon />;
      case 'notes': return <NotesIcon />;
      default: return null;
    }
  };

  return (
    <>
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div style={styles.spinner}></div>
            <span style={{ color: currentTheme.textPrimary, fontSize: '14px' }}>
              {t('Loading')}...
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <nav style={styles.sidenavbar}>
        <div style={styles.logo}>IS</div>
        <div style={styles.navItems}>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} style={getNavStyle} title={t(item.label)}>
              {getIcon(item.icon)}
              <span style={styles.label}>{t(item.label)}</span>
            </NavLink>
          ))}
        </div>

        <div style={styles.bottomSection}>
          <div style={styles.languageSelector}>
            <div style={styles.languageLabel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>{t('Language')}</span>
            </div>
            <div style={styles.languageOptions}>
              {Object.values(LANGUAGES).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  disabled={isLoading}
                  style={{
                    ...styles.langBtn,
                    ...(language === lang.code ? styles.langBtnActive : styles.langBtnInactive),
                    opacity: isLoading ? 0.5 : 1,
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          <button style={styles.themeToggle} onClick={toggleTheme}>
            <div style={styles.themeLabel}>
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
              <span>{t(theme === 'dark' ? 'Dark' : 'Light')}</span>
            </div>
            <div style={styles.toggleSwitch}>
              <div style={styles.toggleKnob}></div>
            </div>
          </button>
        </div>
      </nav>
    </>
  );
}

export default Sidenavbar;
