"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import styles from "./Auth.module.css"
import validationStyles from "../../styles/validation.module.css"
import authService from "../../services/authService"
import { validateEmail } from "../../utils/validations"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [emailError, setEmailError] = useState({ message: "", type: "" })

  const validateForm = () => {
    let isValid = true;
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (emailValidation.message) {
      setEmailError(emailValidation);
      isValid = false;
    } else {
      setEmailError({ message: "", type: "" });
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await authService.resetPassword(email)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>Reset Password</h2>
        <p className={styles.subtitle}>
          Enter your email address and we'll send you a 6-digit code to reset your password
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className={emailError.type ? validationStyles[emailError.type] : ""}
              />
              {emailError.message && (
                <span className={validationStyles.errorText}>{emailError.message}</span>
              )}
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>

            {error && <p className={styles.errorText}>{error}</p>}

            <p className={styles.switchAuth}>
              Remember your password? <Link to="/login">Back to Login</Link>
            </p>
          </form>
        ) : (
          <div className={styles.successMessage}>
            <div className={styles.icon}>✉️</div>
            <h3>Check Your Email</h3>
            <p>We've sent a 6-digit code to your email address. You can use this code as your temporary password to log in.</p>
            <Link to="/login" className={styles.submitButton}>
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword

