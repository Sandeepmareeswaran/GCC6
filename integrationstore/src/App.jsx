import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Mail from './pages/Mail';
import ToDo from './pages/ToDo';
import Notes from './pages/Notes';
import Sidenavbar from './components/Sidenavbar';
import RegisterPopup from './components/RegisterPopup';
import './App.css';
import RightToolbar from './components/RightToolbar';
import JiraPage from './pages/JiraPage';
import Inventory from './pages/Inventory';
import Slackpage from './pages/Slackpage';
import Sales from './pages/Sales';
import NotionPage from './pages/NotionPage';
import CalendarPage from './pages/CalendarPage';
import ChatbotWidget from './components/chatbot/ChatbotWidget';

function AppContent() {
  const [showRegister, setShowRegister] = useState(false);
  const { currentTheme } = useTheme();

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setShowRegister(true);
    }
  }, []);

  const handleClosePopup = () => {
    setShowRegister(false);
  };

  return (
    <div className="app-container" style={{ background: currentTheme.bgPrimary, minHeight: '100vh' }}>
      {showRegister && <RegisterPopup onClose={handleClosePopup} />}
      <main className="main-content" style={{ background: currentTheme.bgPrimary }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mail" element={<Mail />} />
          <Route path="/todo" element={<ToDo />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/jira" element={<JiraPage />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/slack" element={<Slackpage />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/notion" element={<NotionPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </main>
      <Sidenavbar />
      <RightToolbar />
      <ChatbotWidget />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
