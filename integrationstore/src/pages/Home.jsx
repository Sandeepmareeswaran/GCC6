import React from 'react';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';

const Home = () => {
    return (
        <div className="app-container" style={{background:'#f8fafc', minHeight:'100vh'}}>
            <Navbar />
            <main className="main-content" style={{paddingTop:'5.5rem', maxWidth:'100vw', margin:0}}>
                <Hero />
                <Features />
            </main>
        </div>
    );
};

export default Home;
