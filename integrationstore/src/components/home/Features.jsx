import React from 'react';
import styles from './Features.module.css';
import { useLanguage } from '../../context/LanguageContext';

const Features = () => {
  const { t } = useLanguage();

  const features = [
    { icon: '↔', title: 'Wide Compatibility', desc: 'Works with major CRMs, messengers, and productivity tools out-of-the-box.' },
    { icon: '⚡', title: 'Fast Setup', desc: 'Onboard in minutes with guided setup and prebuilt templates.' },
    { icon: '🔒', title: 'Secure by Design', desc: 'Encryption, role controls, and compliance-friendly integrations.' },
  ];

  return (
    <section className={styles.featuresContainer}>
      <div className={styles.grid}>
        {features.map((f, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.iconWrap}>{f.icon}</div>
            <div>
              <div className={styles.cardTitle}>{t(f.title)}</div>
              <div className={styles.cardDesc}>{t(f.desc)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
