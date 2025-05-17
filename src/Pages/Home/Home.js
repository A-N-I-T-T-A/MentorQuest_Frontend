import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import heroImage from '../../images/hero.jpg';

const Home = () => {
  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <div className={styles.hero} style={{ backgroundImage: `url(${heroImage})` }}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Find Your Perfect Mentor</h1>
          <p className={styles.heroSubtitle}>
            Connect with experienced professionals and learn from the best in your field
          </p>
          <div className={styles.ctaButtonContainer}>
            <Link to="/find-mentor" className={styles.ctaButton}>
              Find a Mentor
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Why Choose MentorQuest</h2>
        <div className={styles.featureGrid}>
          <div className={`${styles.featureCard} ${styles.featureCard0}`}>
            <i className="fas fa-user-check fa-3x" />
            <h3>Verified Mentors</h3>
            <p>Connect with industry professionals who have been verified for their expertise and mentoring skills</p>
          </div>
          <div className={`${styles.featureCard} ${styles.featureCard1}`}>
            <i className="fas fa-video fa-3x" />
            <h3>Live Sessions</h3>
            <p>Engage in real-time video sessions with your mentor for personalized guidance and feedback</p>
          </div>
          <div className={`${styles.featureCard} ${styles.featureCard2}`}>
            <i className="fas fa-graduation-cap fa-3x" />
            <h3>Personalized Learning</h3>
            <p>Get tailored guidance that fits your unique learning style and goals</p>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className={styles.skillsSection}>
        <h2 className={styles.sectionTitle}>Skills & Expertise</h2>
        <div className={styles.skillsGrid}>
          <div className={`${styles.skillCard} ${styles.skillCard0}`}>
            <i className="fas fa-code fa-3x" />
            <h3>Programming</h3>
            <div className={styles.skillTags}>
              <span className={styles.skillTag}>JavaScript</span>
              <span className={styles.skillTag}>Python</span>
              <span className={styles.skillTag}>Java</span>
            </div>
          </div>
          <div className={`${styles.skillCard} ${styles.skillCard1}`}>
            <i className="fas fa-paint-brush fa-3x" />
            <h3>Design</h3>
            <div className={styles.skillTags}>
              <span className={styles.skillTag}>UI/UX</span>
              <span className={styles.skillTag}>Graphic Design</span>
              <span className={styles.skillTag}>Web Design</span>
            </div>
          </div>
          <div className={`${styles.skillCard} ${styles.skillCard2}`}>
            <i className="fas fa-chart-line fa-3x" />
            <h3>Business</h3>
            <div className={styles.skillTags}>
              <span className={styles.skillTag}>Marketing</span>
              <span className={styles.skillTag}>Management</span>
              <span className={styles.skillTag}>Entrepreneurship</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.cta}>
        <h2>Ready to Start Your Journey?</h2>
        <p>Join thousands of successful mentees who have transformed their careers</p>
        <div className={styles.ctaButtonContainer}>
          <Link to="/find-mentor" className={styles.ctaButton}>
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
