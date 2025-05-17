// src/components/SelectAccountType.js
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import styles from "./Auth.module.css"
import authService from '../../services/authService'

const SelectAccountType = () => {
  const [accountType, setAccountType] = useState("Mentee")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const location = useLocation()
  const navigate = useNavigate()
  
  const { googleToken } = location.state || {}
  
  useEffect(() => {
    console.log("Location state:", location.state);
    if (!location.state?.googleToken) {
      console.log("No Google token found, redirecting to signup");
      navigate("/signup")
    }
  }, [location.state, navigate])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      console.log("Submitting with token:", googleToken);
      console.log("Selected account type:", accountType);
      
      const response = await authService.completeGoogleSignup(googleToken, accountType)
      console.log("Response:", response);
      
      // Navigate to profile setup
      navigate(response.redirect_url)
    } catch (err) {
      console.error('Account type selection error:', err)
      setError(err.error || "Failed to complete signup. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  
  if (!location.state?.googleToken) {
    return null
  }
  
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>Complete Your Signup</h2>
        <p className={styles.subtitle}>Choose your account type to continue</p>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>I want to be a:</label>
            <div className={styles.roleToggle}>
              <label>
                <input
                  type="radio"
                  name="accountType"
                  value="Mentee"
                  checked={accountType === "Mentee"}
                  onChange={() => setAccountType("Mentee")}
                />
                Mentee
              </label>
              <label>
                <input
                  type="radio"
                  name="accountType"
                  value="Mentor"
                  checked={accountType === "Mentor"}
                  onChange={() => setAccountType("Mentor")}
                />
                Mentor
              </label>
            </div>
          </div>
          
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Processing..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SelectAccountType