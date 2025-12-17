import React from 'react';

const Navbar = () => {
          return (
                    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/30 dark:bg-black/30 border-b border-white/20">
                              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="flex justify-between h-16 items-center">
                                                  <div className="flex-shrink-0 flex items-center">
                                                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                                      IntegrationStore
                                                            </span>
                                                  </div>
                                                  <div className="hidden md:flex space-x-8">
                                                            <a href="#" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Home</a>
                                                            <a href="#" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Integrations</a>
                                                            <a href="#" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Pricing</a>
                                                            <a href="#" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Documentation</a>
                                                  </div>
                                                  <div className="flex items-center space-x-4">
                                                            <button className="text-gray-900 dark:text-gray-100 hover:text-blue-600 font-medium px-4 py-2">Log in</button>
                                                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-blue-500/50">
                                                                      Get Started
                                                            </button>
                                                  </div>
                                        </div>
                              </div>
                    </nav>
          );
};

export default Navbar;
