import React from 'react';

const Footer = () => {
          return (
                    <footer className="bg-white dark:bg-black py-12 border-t border-gray-100 dark:border-gray-900">
                              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                                                  <div className="col-span-1 md:col-span-2">
                                                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 block">
                                                                      IntegrationStore
                                                            </span>
                                                            <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                                                                      Making integrations simple, secure, and accessible for businesses of all sizes.
                                                            </p>
                                                  </div>
                                                  <div>
                                                            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Product</h4>
                                                            <ul className="space-y-4">
                                                                      <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Features</a></li>
                                                                      <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Integrations</a></li>
                                                                      <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Pricing</a></li>
                                                            </ul>
                                                  </div>
                                                  <div>
                                                            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Support</h4>
                                                            <ul className="space-y-4">
                                                                      <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Documentation</a></li>
                                                                      <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">API Reference</a></li>
                                                                      <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Contact Us</a></li>
                                                            </ul>
                                                  </div>
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-gray-900 pt-8 flex flex-col md:row-row justify-between items-center text-gray-500 text-sm">
                                                  <p>© 2025 IntegrationStore Inc. All rights reserved.</p>
                                                  <div className="flex space-x-6 mt-4 md:mt-0">
                                                            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
                                                            <a href="#" className="hover:text-blue-600">Terms of Service</a>
                                                  </div>
                                        </div>
                              </div>
                    </footer>
          );
};

export default Footer;
