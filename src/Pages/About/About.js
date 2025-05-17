import styles from "./About.module.css"

const About = () => {
  return (
    <div className={styles.about}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>About MentorQuest</h1>
          <p>Connecting ambitious professionals with experienced mentors to accelerate career growth</p>
        </div>
      </section>

      <section className={styles.mission}>
        <div className={styles.container}>
          <h2>Our Mission</h2>
          <p>
            We believe that everyone deserves access to quality mentorship. Our platform makes it easy to connect with
            industry experts who can guide you through your professional journey.
          </p>

          <div className={styles.values}>
            <div className={styles.valueCard}>
              <span className={styles.icon}>🎯</span>
              <h3>Targeted Guidance</h3>
              <p>Connect with mentors who specialize in your field and understand your goals</p>
            </div>
            <div className={styles.valueCard}>
              <span className={styles.icon}>🤝</span>
              <h3>Quality Connections</h3>
              <p>Build meaningful relationships with experienced professionals</p>
            </div>
            <div className={styles.valueCard}>
              <span className={styles.icon}>📈</span>
              <h3>Career Growth</h3>
              <p>Accelerate your professional development with expert guidance</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <h2>How It Works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Create Your Profile</h3>
              <p>Sign up and tell us about your goals and interests</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Find Your Mentor</h3>
              <p>Browse and connect with mentors who match your needs</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Schedule Sessions</h3>
              <p>Book one-on-one sessions at times that work for you</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <h3>Grow Together</h3>
              <p>Learn, develop, and achieve your career goals</p>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>&copy; {new Date().getFullYear()} MentorQuest. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="mailto:support@mentorquest.com">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default About

