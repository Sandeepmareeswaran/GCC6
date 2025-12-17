import React from 'react';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Footer from '../components/home/Footer';

const Home = () => {
          return (
                    <div className="min-h-screen bg-white dark:bg-black">
                              <Navbar />
                              <main>
                                        <Hero />
                                        <Features />
                              </main>
                              <Footer />
                    </div>
          );
};

export default Home;
