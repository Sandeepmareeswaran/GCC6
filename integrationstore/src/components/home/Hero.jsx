import React from 'react';

const Hero = () => {
          return (
                    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                              </div>

                              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
                                                  Seamlessly Integrate <br />
                                                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                            Your Entire Stack
                                                  </span>
                                        </h1>
                                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
                                                  The all-in-one platform to connect your favorite apps, automate workflows, and scale your business without the complexity.
                                        </p>
                                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                                  <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-1">
                                                            Start Free Trial
                                                  </button>
                                                  <button className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg border-2 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                                                            Watch Demo
                                                  </button>
                                        </div>

                                        <div className="mt-20 relative px-4">
                                                  <div className="max-w-4xl mx-auto bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-2xl shadow-2xl p-4 overflow-hidden">
                                                            {/* Placeholder for an app interface or dashboard image */}
                                                            <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                                                                      <span className="text-gray-400 text-sm">Dashboard Preview</span>
                                                            </div>
                                                  </div>
                                        </div>
                              </div>
                    </section>
          );
};

export default Hero;
