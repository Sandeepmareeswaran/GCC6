import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Mail from './pages/Mail';
import ToDo from './pages/ToDo';
import Notes from './pages/Notes';
import Sidenavbar from './components/Sidenavbar';
import RegisterPopup from './components/RegisterPopup';
import './App.css';

function App() {
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Check if userEmail exists in localStorage
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setShowRegister(true);
    }
  }, []);

  const handleClosePopup = () => {
    setShowRegister(false);
  };

  return (
    <div className="app-container">
      {showRegister && <RegisterPopup onClose={handleClosePopup} />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mail" element={<Mail />} />
          <Route path="/todo" element={<ToDo />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </main>
      <Sidenavbar />
    </div>
  );
}

export default App;

