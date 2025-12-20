import React from 'react';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
    const { currentTheme } = useTheme();

    return (
        <div
            className="app-container"
            style={{
                background: currentTheme.bgPrimary,
                minHeight: '100vh',
                color: currentTheme.textPrimary
            }}
        >
            <Navbar />
            <main className="main-content" style={{ paddingTop: '5.5rem', maxWidth: '100vw', margin: 0 }}>
                <Hero />
                <Features />
            </main>
        </div>
    );
};

export default Home;
