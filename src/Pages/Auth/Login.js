// src/components/Login.js
"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import styles from "./Auth.module.css"
import validationStyles from "../../styles/validation.module.css"
import authService from '../../services/authService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validateEmail } from '../../utils/validations';

const clientId = "484205176544-tgf8fvn99mup1u7p7agmr1nsl02fmo76.apps.googleusercontent.com"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [formErrors, setFormErrors] = useState({
    email: { message: "", type: "" },
    password: { message: "", type: "" }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check for success message in URL parameters
    const message = new URLSearchParams(location.search).get('message');
    if (message) {
      toast.success(message);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    let isValid = true;
    const errors = {
      email: { message: "", type: "" },
      password: { message: "", type: "" }
    };

    if (!formData.email) {
      errors.email = { 
        message: "Email is required", 
        type: "error" 
      };
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = { 
        message: "Please enter a valid email address", 
        type: "error" 
      };
      isValid = false;
    }

    if (!formData.password) {
      errors.password = { 
        message: "Password is required", 
        type: "error" 
      };
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = { 
        message: "Password seems too short", 
        type: "warning" 
      };
      // We'll still allow login with short password (don't set isValid = false)
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await authService.login(formData.email, formData.password)
      
      // Store user data in localStorage
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      // For admin users, directly go to dashboard
      if (response.user.user_type.toLowerCase() === 'admin') {
        navigate('/dashboard/admin')
        return
      }
      
      // For non-admin users, check profile completion
      if (!response.user.profile_completed) {
        navigate(response.user.user_type === 'mentee' ? '/profileSetup' : '/mentorProfileSetup')
        return
      }
      
      // Navigate to the appropriate dashboard based on response
      if (response.redirect_url) {
        navigate(response.redirect_url)
      } else {
        // Fallback redirect based on user type
        const userType = response.user.user_type.toLowerCase()
        switch (userType) {
          case 'mentor':
            navigate('/dashboard/mentor')
            break
          case 'mentee':
            navigate('/dashboard/mentee')
            break
          default:
            navigate('/dashboard/mentee')
        }
      }
    } catch (err) {
      setError(err.error || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.googleLogin(response.credential);
      
      if (!result.isNewUser) {
        // Store user data for existing users
        localStorage.setItem('user_data', JSON.stringify(result.user));
      }
      
      // If this is a new user (first time Google login)
      if (result.isNewUser) {
        navigate('/select-account-type', { 
          state: { 
            googleToken: response.credential,
            email: result.email,
            firstName: result.first_name,
            lastName: result.last_name
          } 
        });
        return;
      }

      // For existing users, follow normal login flow
      if (result.user.user_type.toLowerCase() === 'admin') {
        navigate('/dashboard/admin');
        return;
      }
      
      if (!result.user.profile_completed) {
        navigate(result.user.user_type === 'mentee' ? '/profileSetup' : '/mentorProfileSetup');
        return;
      }
      
      navigate(result.redirect_url);
    } catch (err) {
      setError(err.error || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError("Google Sign-In Failed. Please try again.")
  }

  return (
    <>
      <GoogleOAuthProvider clientId={clientId}>
        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            <h2>Welcome Back</h2>
            <p className={styles.subtitle}>Log in to your account to continue</p>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.googleLogin}>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
            </div>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className={`${formErrors.email?.type === "error" ? validationStyles.errorInput : ""}`}
                />
                {formErrors.email?.message && (
                  <div className={
                    formErrors.email.type === "warning" 
                      ? validationStyles.warningText 
                      : validationStyles.errorText
                  }>
                    {formErrors.email.message}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`${formErrors.password?.type === "error" ? validationStyles.errorInput : ""}`}
                />
                {formErrors.password?.message && (
                  <div className={
                    formErrors.password.type === "warning" 
                      ? validationStyles.warningText 
                      : validationStyles.errorText
                  }>
                    {formErrors.password.message}
                  </div>
                )}
              </div>

              <div className={styles.forgotPassword}>
                <Link to="/forgotpassword">Forgot password?</Link>
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <p className={styles.switchAuth}>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </GoogleOAuthProvider>
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  )
}

export default Login