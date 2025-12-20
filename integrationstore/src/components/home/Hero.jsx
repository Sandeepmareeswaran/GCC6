import React from 'react';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.eyebrow}>New · Integrations</div>
        <h1 className={styles.title}>Discover powerful integrations that accelerate your workflows</h1>
        <p className={styles.subtitle}>Connect your favorite tools in minutes, automate repetitive tasks, and deliver seamless experiences for your team and customers.</p>
      </div>

      <div className={styles.visual}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'100%',height:'100%'}}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom:'12px'}}>
            <rect width="24" height="24" rx="8" fill="#fff" fillOpacity="0.18"/>
            <path d="M12 17a1 1 0 001-1v-2a1 1 0 10-2 0v2a1 1 0 001 1zm5-5V9a5 5 0 10-10 0v3a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2zm-8 0V9a3 3 0 016 0v3H7zm10 6a1 1 0 01-1 1H6a1 1 0 01-1-1v-4a1 1 0 011-1h12a1 1 0 011 1v4z" fill="#fff"/>
          </svg>
          <span className={styles.visualPlaceholder}>Integration Preview</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
