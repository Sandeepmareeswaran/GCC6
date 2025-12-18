import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Mail from './pages/Mail';
import ToDo from './pages/ToDo';
import Notes from './pages/Notes';
import Sidenavbar from './components/Sidenavbar';
import './App.css';

function App() {
  return (
    <div className="app-container">
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
