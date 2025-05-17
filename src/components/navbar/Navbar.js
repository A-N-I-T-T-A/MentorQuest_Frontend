"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import styles from "./Navbar.module.css"
import { getAuthToken, removeAuthToken } from "../../services/authUtils"

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user_data") || "{}")
  const isLoggedIn = !!getAuthToken()
  const firstName = userData.first_name || userData.firstName || userData.email?.split('@')[0] || 'Admin'
  const profileImage = userData.profile_image

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    // Clear auth data
    removeAuthToken()
    localStorage.removeItem("user_data")
    
    // Close dropdown
    setDropdownOpen(false)
    
    // Redirect to login
    navigate("/login")
  }

  const getDashboardLink = () => {
    const userType = userData.user_type?.toLowerCase()
    return `/dashboard/${userType}`
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <Link to="/" className={styles.logo}>
          <i className="fas fa-graduation-cap"></i>
          <span>MentorQuest</span>
        </Link>

        <button 
          className={`${styles.hamburger} ${mobileMenuOpen ? styles.active : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.active : ''}`}>
          <Link to="/about" className={styles.navLink}>
            <i className="fas fa-info-circle"></i>
            <span>About</span>
          </Link>
          <Link to="/find-mentor" className={styles.navLink}>
            <i className="fas fa-search"></i>
            <span>Find Mentor</span>
          </Link>
        </div>
      </div>

      <div className={styles.navRight}>
        {isLoggedIn ? (
          <div className={styles.userMenu} ref={dropdownRef}>
            <button 
              className={styles.userButton} 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className={styles.userAvatar}>
                {profileImage ? (
                  <img src={profileImage} alt={firstName} className={styles.profileImage} />
                ) : (
                  firstName.charAt(0).toUpperCase()
                )}
              </div>
              <span className={styles.userName}>{firstName}</span>
              <i className={`fas fa-chevron-down ${dropdownOpen ? styles.rotated : ""}`}></i>
            </button>
            
            {dropdownOpen && (
              <div className={styles.dropdown}>
                <Link 
                  to={getDashboardLink()} 
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  <i className="fas fa-tachometer-alt"></i>
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/profile" 
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  <i className="fas fa-user"></i>
                  <span>Profile</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className={styles.dropdownItem}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.authButtons}>
            <Link to="/login" className={styles.loginButton}>
              <i className="fas fa-sign-in-alt"></i>
              <span>Login</span>
            </Link>
            <Link to="/signup" className={styles.signupButton}>
              <i className="fas fa-user-plus"></i>
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

