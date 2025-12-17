import React from 'react';

const FeatureItem = ({ icon, title, description }) => (
          <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-500/50 transition-all group">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                              {icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
          </div>
);

const Features = () => {
          const features = [
                    {
                              title: "One-Click Sync",
                              description: "Connect your entire software stack with a single click. No complex API configuration required.",
                              icon: (
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                              )
                    },
                    {
                              title: "Automated Workflows",
                              description: "Trigger actions across different platforms automatically based on real-time data and events.",
                              icon: (
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                              )
                    },
                    {
                              title: "Enterprise Security",
                              description: "Banking-grade encryption and compliance standards to keep your customer data safe and secure.",
                              icon: (
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                              )
                    }
          ];

          return (
                    <section className="py-24 bg-gray-50 dark:bg-black/50">
                              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="text-center mb-16">
                                                  <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                                            Powerful Features for Modern Teams
                                                  </h2>
                                                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                                            Everything you need to manage your business integrations in one place.
                                                  </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                  {features.map((feature, index) => (
                                                            <FeatureItem key={index} {...feature} />
                                                  ))}
                                        </div>
                              </div>
                    </section>
          );
};

export default Features;
