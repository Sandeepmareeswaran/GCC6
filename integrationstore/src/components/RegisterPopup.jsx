import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

function RegisterPopup({ onClose }) {
          const [formData, setFormData] = useState({
                    username: '',
                    email: '',
                    password: '',
          });
          const [loading, setLoading] = useState(false);
          const [error, setError] = useState('');

          const styles = {
                    overlay: {
                              position: 'fixed',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 2000,
                    },
                    popup: {
                              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                              borderRadius: '16px',
                              padding: '40px',
                              width: '400px',
                              maxWidth: '90%',
                              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    title: {
                              color: '#fff',
                              fontSize: '28px',
                              fontWeight: '600',
                              marginBottom: '8px',
                              textAlign: 'center',
                    },
                    subtitle: {
                              color: '#8b8b9e',
                              fontSize: '14px',
                              marginBottom: '30px',
                              textAlign: 'center',
                    },
                    inputGroup: {
                              marginBottom: '20px',
                    },
                    label: {
                              display: 'block',
                              color: '#8b8b9e',
                              fontSize: '14px',
                              marginBottom: '8px',
                    },
                    input: {
                              width: '100%',
                              padding: '14px 16px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '10px',
                              color: '#fff',
                              fontSize: '16px',
                              outline: 'none',
                              transition: 'border-color 0.3s ease',
                              boxSizing: 'border-box',
                    },
                    button: {
                              width: '100%',
                              padding: '14px',
                              background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
                              border: 'none',
                              borderRadius: '10px',
                              color: '#fff',
                              fontSize: '16px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              marginTop: '10px',
                    },
                    error: {
                              color: '#ff6b6b',
                              fontSize: '14px',
                              textAlign: 'center',
                              marginBottom: '15px',
                    },
          };

          const handleChange = (e) => {
                    setFormData({
                              ...formData,
                              [e.target.name]: e.target.value,
                    });
          };

          const handleSubmit = async (e) => {
                    e.preventDefault();
                    setError('');
                    setLoading(true);

                    try {
                              // Validate fields
                              if (!formData.username || !formData.email || !formData.password) {
                                        throw new Error('Please fill in all fields');
                              }

                              // Store email and username in localStorage
                              localStorage.setItem('userEmail', formData.email);
                              localStorage.setItem('username', formData.username);

                              // Store data in Firebase (collection: GCCUserDB, document ID: email)
                              await setDoc(doc(db, 'GCCUserDB', formData.email), {
                                        username: formData.username,
                                        email: formData.email,
                                        password: formData.password,
                                        createdAt: new Date().toISOString(),
                              });

                              onClose();
                    } catch (err) {
                              setError(err.message || 'An error occurred. Please try again.');
                    } finally {
                              setLoading(false);
                    }
          };

          return (
                    <div style={styles.overlay}>
                              <div style={styles.popup}>
                                        <h2 style={styles.title}>Welcome!</h2>
                                        <p style={styles.subtitle}>Create your account to get started</p>

                                        {error && <p style={styles.error}>{error}</p>}

                                        <form onSubmit={handleSubmit}>
                                                  <div style={styles.inputGroup}>
                                                            <label style={styles.label}>Username</label>
                                                            <input
                                                                      type="text"
                                                                      name="username"
                                                                      value={formData.username}
                                                                      onChange={handleChange}
                                                                      style={styles.input}
                                                                      placeholder="Enter your username"
                                                            />
                                                  </div>

                                                  <div style={styles.inputGroup}>
                                                            <label style={styles.label}>Email</label>
                                                            <input
                                                                      type="email"
                                                                      name="email"
                                                                      value={formData.email}
                                                                      onChange={handleChange}
                                                                      style={styles.input}
                                                                      placeholder="Enter your email"
                                                            />
                                                  </div>

                                                  <div style={styles.inputGroup}>
                                                            <label style={styles.label}>Password</label>
                                                            <input
                                                                      type="password"
                                                                      name="password"
                                                                      value={formData.password}
                                                                      onChange={handleChange}
                                                                      style={styles.input}
                                                                      placeholder="Enter your password"
                                                            />
                                                  </div>

                                                  <button
                                                            type="submit"
                                                            style={{
                                                                      ...styles.button,
                                                                      opacity: loading ? 0.7 : 1,
                                                                      cursor: loading ? 'not-allowed' : 'pointer',
                                                            }}
                                                            disabled={loading}
                                                  >
                                                            {loading ? 'Creating Account...' : 'Get Started'}
                                                  </button>
                                        </form>
                              </div>
                    </div>
          );
}

export default RegisterPopup;
