"use client"

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import styles from "./Auth.module.css";
import validationStyles from "../../styles/validation.module.css";
import authService from '../../services/authService';
import { validateEmail, validatePassword, validateName } from '../../utils/validations';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const clientId = "484205176544-tgf8fvn99mup1u7p7agmr1nsl02fmo76.apps.googleusercontent.com";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "Mentee", 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    };

    if (!validateName(formData.firstName)) {
      errors.firstName = "First name must be at least 2 characters long";
      isValid = false;
    }

    if (!validateName(formData.lastName)) {
      errors.lastName = "Last name must be at least 2 characters long";
      isValid = false;
    }

    if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!validatePassword(formData.password)) {
      errors.password = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character (e.g., #, @, $, !)";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setLoading(true);
    setError(null);
  
    try {
      // Generate a unique username if email is taken
      const baseUsername = formData.email.split('@')[0];
      const randomSuffix = Math.floor(Math.random() * 1000);
      
      const userData = {
        email: formData.email,
        username: `${baseUsername}${randomSuffix}`, // Add random number to make username unique
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        user_type: formData.accountType.toLowerCase()
      };

      const response = await authService.register(userData);
      console.log("Signup response:", response);
      
      // Navigate to the appropriate setup page
      navigate(response.redirect_url);
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Google response:', response); // For debugging
      
      const result = await authService.googleLogin(response.credential);
      
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

      // For existing users
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
      console.error('Google signup error:', err); // For debugging
      setError(err.error || "Google signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError("Google Sign-Up Failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h2>Create Account</h2>
          <p className={styles.subtitle}>Join MentorQuest to connect with mentors</p>
          
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.googleLogin}>
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={handleGoogleFailure}
              text="signup_with"  // This changes the button text to "Sign up with Google"
            />
          </div>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                required 
                className={`${formErrors.firstName ? validationStyles.errorInput : ""}`}
              />
              {formErrors.firstName && <div className={validationStyles.errorText}>{formErrors.firstName}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                required 
                className={`${formErrors.lastName ? validationStyles.errorInput : ""}`}
              />
              {formErrors.lastName && <div className={validationStyles.errorText}>{formErrors.lastName}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className={`${formErrors.email ? validationStyles.errorInput : ""}`}
              />
              {formErrors.email && <div className={validationStyles.errorText}>{formErrors.email}</div>}
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
                className={`${formErrors.password ? validationStyles.errorInput : ""}`}
              />
              {formErrors.password && <div className={validationStyles.errorText}>{formErrors.password}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
                className={`${formErrors.confirmPassword ? validationStyles.errorInput : ""}`}
              />
              {formErrors.confirmPassword && <div className={validationStyles.errorText}>{formErrors.confirmPassword}</div>}
            </div>

            <div className={styles.formGroup}>
              <label>I want to be a:</label>
              <div className={styles.roleToggle}>
                <label>
                  <input
                    type="radio"
                    name="accountType"
                    value="Mentee"
                    checked={formData.accountType === "Mentee"}
                    onChange={handleChange}
                  />
                  Mentee
                </label>
                <label>
                  <input
                    type="radio"
                    name="accountType"
                    value="Mentor"
                    checked={formData.accountType === "Mentor"}
                    onChange={handleChange}
                  />
                  Mentor
                </label>
              </div>
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className={styles.switchAuth}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </GoogleOAuthProvider>
  );
};

export default Signup;