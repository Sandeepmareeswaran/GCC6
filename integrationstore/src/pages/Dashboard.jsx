import React, { useState, useEffect } from 'react';

function Dashboard() {
          const [username, setUsername] = useState('User');

          useEffect(() => {
                    const storedUsername = localStorage.getItem('username');
                    if (storedUsername) {
                              setUsername(storedUsername);
                    }
          }, []);

          const styles = {
                    container: {
                              padding: '10px',
                    },
                    header: {
                              marginBottom: '30px',
                    },
                    greeting: {
                              fontSize: '28px',
                              fontWeight: '700',
                              color: '#1e1e2d',
                              marginBottom: '5px',
                    },
                    subtitle: {
                              fontSize: '14px',
                              color: '#6b7280',
                    },
                    statsGrid: {
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                              gap: '20px',
                              marginBottom: '30px',
                    },
                    statCard: {
                              background: '#ffffff',
                              borderRadius: '16px',
                              padding: '24px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                              border: '1px solid #e5e7eb',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '16px',
                    },
                    statIcon: {
                              width: '50px',
                              height: '50px',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                    },
                    statContent: {
                              flex: 1,
                    },
                    statValue: {
                              fontSize: '26px',
                              fontWeight: '700',
                              color: '#1e1e2d',
                              marginBottom: '4px',
                    },
                    statLabel: {
                              fontSize: '13px',
                              color: '#6b7280',
                    },
                    statChange: {
                              fontSize: '12px',
                              marginTop: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                    },
                    chartSection: {
                              display: 'grid',
                              gridTemplateColumns: '2fr 1fr',
                              gap: '20px',
                              marginBottom: '30px',
                    },
                    chartCard: {
                              background: '#ffffff',
                              borderRadius: '16px',
                              padding: '24px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                              border: '1px solid #e5e7eb',
                    },
                    chartTitle: {
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#1e1e2d',
                              marginBottom: '20px',
                    },
                    chartPlaceholder: {
                              height: '200px',
                              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'flex-end',
                              justifyContent: 'space-around',
                              padding: '20px',
                    },
                    bar: {
                              width: '40px',
                              background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                              borderRadius: '6px 6px 0 0',
                              transition: 'height 0.3s ease',
                    },
                    earningsCard: {
                              background: '#ffffff',
                              borderRadius: '16px',
                              padding: '24px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                              border: '1px solid #e5e7eb',
                    },
                    progressCircle: {
                              width: '120px',
                              height: '120px',
                              borderRadius: '50%',
                              background: `conic-gradient(#22c55e 0deg 252deg, #e5e7eb 252deg 360deg)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '20px auto',
                    },
                    progressInner: {
                              width: '90px',
                              height: '90px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                              fontWeight: '700',
                              color: '#1e1e2d',
                    },
                    tableCard: {
                              background: '#ffffff',
                              borderRadius: '16px',
                              padding: '24px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                              border: '1px solid #e5e7eb',
                    },
                    table: {
                              width: '100%',
                              borderCollapse: 'collapse',
                    },
                    th: {
                              textAlign: 'left',
                              padding: '12px 16px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#6b7280',
                              textTransform: 'uppercase',
                              borderBottom: '1px solid #e5e7eb',
                    },
                    td: {
                              padding: '16px',
                              fontSize: '14px',
                              color: '#1e1e2d',
                              borderBottom: '1px solid #f3f4f6',
                    },
                    badge: {
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '500',
                    },
          };

          const stats = [
                    { label: 'Total Revenue', value: '$ 680.56', icon: '💰', color: '#dcfce7', change: '+18%', positive: true },
                    { label: 'Products', value: '2,95,025', icon: '📦', color: '#dbeafe', change: '+18%', positive: true },
                    { label: 'Store', value: '12,585', icon: '🏪', color: '#fef3c7', change: '-8%', positive: false },
                    { label: 'Active Customers', value: '42,450', icon: '👥', color: '#f3e8ff', change: '+18%', positive: true },
          ];

          const recentItems = [
                    { name: 'Laptop mt 2023', date: '01 Jan 2023', id: 'SW001254HM', price: '$42.86', status: 'Delivered' },
                    { name: 'Phone 8 GB/256 GB', date: '02 Jan 2023', id: 'QQ001494619', price: '$59.55', status: 'Delivered' },
                    { name: 'Headphone', date: '04 Jan 2023', id: 'MD56655415H', price: '$59.75', status: 'Pending' },
          ];

          return (
                    <div style={styles.container}>
                              <div style={styles.header}>
                                        <h1 style={styles.greeting}>Hello, {username}!</h1>
                                        <p style={styles.subtitle}>Check your calendar of your business</p>
                              </div>

                              <div style={styles.statsGrid}>
                                        {stats.map((stat, index) => (
                                                  <div key={index} style={styles.statCard}>
                                                            <div style={{ ...styles.statIcon, background: stat.color }}>
                                                                      <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                                                            </div>
                                                            <div style={styles.statContent}>
                                                                      <div style={styles.statValue}>{stat.value}</div>
                                                                      <div style={styles.statLabel}>{stat.label}</div>
                                                                      <div style={{ ...styles.statChange, color: stat.positive ? '#22c55e' : '#ef4444' }}>
                                                                                {stat.positive ? '↑' : '↓'} {stat.change} from last week
                                                                      </div>
                                                            </div>
                                                  </div>
                                        ))}
                              </div>

                              <div style={styles.chartSection}>
                                        <div style={styles.chartCard}>
                                                  <div style={styles.chartTitle}>Revenue Growth</div>
                                                  <div style={styles.chartPlaceholder}>
                                                            {[60, 80, 45, 90, 70, 85, 95, 75, 100, 65, 88, 72].map((height, i) => (
                                                                      <div key={i} style={{ ...styles.bar, height: `${height}%` }} />
                                                            ))}
                                                  </div>
                                        </div>

                                        <div style={styles.earningsCard}>
                                                  <div style={styles.chartTitle}>Earnings</div>
                                                  <div style={styles.progressCircle}>
                                                            <div style={styles.progressInner}>70%</div>
                                                  </div>
                                                  <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                                                                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', marginRight: '6px' }}></span>
                                                                      Active 60%
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', marginRight: '6px' }}></span>
                                                                      Pending 40%
                                                            </div>
                                                  </div>
                                        </div>
                              </div>

                              <div style={styles.tableCard}>
                                        <div style={styles.chartTitle}>Top Selling Products</div>
                                        <table style={styles.table}>
                                                  <thead>
                                                            <tr>
                                                                      <th style={styles.th}>Product Name</th>
                                                                      <th style={styles.th}>Order Date</th>
                                                                      <th style={styles.th}>Order ID</th>
                                                                      <th style={styles.th}>Price</th>
                                                                      <th style={styles.th}>Status</th>
                                                            </tr>
                                                  </thead>
                                                  <tbody>
                                                            {recentItems.map((item, index) => (
                                                                      <tr key={index}>
                                                                                <td style={styles.td}>{item.name}</td>
                                                                                <td style={styles.td}>{item.date}</td>
                                                                                <td style={styles.td}>{item.id}</td>
                                                                                <td style={styles.td}>{item.price}</td>
                                                                                <td style={styles.td}>
                                                                                          <span style={{
                                                                                                    ...styles.badge,
                                                                                                    background: item.status === 'Delivered' ? '#dcfce7' : '#fef3c7',
                                                                                                    color: item.status === 'Delivered' ? '#16a34a' : '#d97706'
                                                                                          }}>
                                                                                                    {item.status}
                                                                                          </span>
                                                                                </td>
                                                                      </tr>
                                                            ))}
                                                  </tbody>
                                        </table>
                              </div>
                    </div>
          );
}

export default Dashboard;