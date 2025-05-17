"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import styles from "./FindMentor.module.css"
import { getMentors, getAvailableSkills } from "../../services/mentorService"
import { MEDIA_BASE_URL } from "../../config"
import { isAuthenticated, getCurrentUser } from "../../services/authUtils"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const FindMentor = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkills, setSelectedSkills] = useState([])
  const [priceRange, setPriceRange] = useState([0, 3000])
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [availableSkills, setAvailableSkills] = useState([])
  const notificationShown = useRef(false)

  // Fetch mentors and skills on component mount
  useEffect(() => {
    // Check if user is logged in and redirect if not a mentee
    const checkUserAccess = () => {
      // If user is not logged in, allow access
      if (!isAuthenticated()) {
        return true;
      }

      // If user is logged in, check if they're a mentee
      const userData = getCurrentUser();
      const userType = userData?.user_type?.toLowerCase();
      
      // If logged-in user is not a mentee, redirect to home page with notification
      if (userType && userType !== 'mentee') {
        // Only show notification once
        if (!notificationShown.current) {
          notificationShown.current = true;
          
          // Use setTimeout to ensure it runs after navigation completes
          setTimeout(() => {
            toast.warning('Sorry, only mentees can access the Find Mentor page.', {
              position: 'top-center',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              toastId: 'mentee-access-only', // Prevent duplicate toasts
            });
          }, 100);
        }
        
        navigate('/');
        return false;
      }
      return true;
    };

    // Check access before fetching data
    const hasAccess = checkUserAccess();
    if (!hasAccess) return;

    // Reset notification shown flag when component mounts and user has access
    notificationShown.current = false;

    const fetchData = async () => {
      try {
        const [mentorsData, skillsData] = await Promise.all([
          getMentors(searchQuery, selectedSkills, priceRange),
          getAvailableSkills()
        ]);
        console.log('Fetched mentors:', mentorsData); // Add debug log
        console.log('Mentor data structure example:', mentorsData[0]); // Display first mentor's properties
        console.log('Has feedback data:', 'feedback_count' in (mentorsData[0] || {}), 'average_rating' in (mentorsData[0] || {}));
        setMentors(mentorsData);
        setAvailableSkills(skillsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, selectedSkills, priceRange, navigate, location.pathname]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSkillSelect = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill))
    } else {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading mentors...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.findMentor}>
      <div className={styles.searchHeader}>
        <h1>Find Your Perfect Mentor</h1>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search by name, skills, or company..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className={styles.content}>
        <aside className={styles.filters}>
          <div className={styles.filterSection}>
            <h3>Skills</h3>
            <div className={styles.skillsList}>
              {availableSkills.map((skill) => (
                <label key={skill.skill_id} className={styles.skillCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill.skill_name)}
                    onChange={() => handleSkillSelect(skill.skill_name)}
                  />
                  <span>{skill.skill_name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <h3>Price Range (₹)</h3>
            <div className={styles.priceRange}>
              <input
                type="range"
                min="0"
                max="3000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number.parseInt(e.target.value)])}
              />
              <div className={styles.priceLabels}>
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}{priceRange[1] === 3000 && '+'}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.mentorsList}>
          {mentors.length === 0 ? (
            <div className={styles.noResults}>No mentors found matching your criteria</div>
          ) : (
            <>
              <div className={styles.debugInfo}>Found {mentors.length} mentors</div> {/* Add debug info */}
              {mentors.map((mentor) => (
                <div key={mentor.id} className={styles.mentorCard}>
                  <img 
                    src={mentor.profile_image ? `${MEDIA_BASE_URL}${mentor.profile_image}` : "/placeholder.svg"} 
                    alt={mentor.user?.username || 'Mentor'} 
                    className={styles.mentorImage} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                  <div className={styles.mentorInfo}>
                    <h3>{mentor.user?.first_name || 'Anonymous Mentor'}</h3>
                    <p className={styles.email}>{mentor.user?.email || 'Email not available'}</p>
                    <p className={styles.title}>
                      {mentor.designation || 'Mentor'} 
                      {mentor.company && ` at ${mentor.company}`}
                    </p>
                    <div className={styles.skills}>
                      {mentor.skills?.map((skill) => (
                        <span key={skill.skill_id} className={styles.skill}>
                          {skill.skill_name}
                        </span>
                      )) || <span className={styles.skill}>Skills not specified</span>}
                    </div>
                    <div className={styles.stats}>
                      <span className={styles.rating}>⭐ {
                        (mentor.feedback_count && mentor.feedback_count > 0) 
                          ? (mentor.average_rating ? mentor.average_rating.toFixed(1) : "0.0") 
                          : "New"
                      }</span>
                      
                      {(mentor.feedback_count && mentor.feedback_count > 0) && (
                        <span className={styles.reviews}>{mentor.feedback_count} reviews</span>
                      )}
                      
                      <span className={styles.price}>₹{parseFloat(mentor.hourly_rate || 0).toFixed(2)}/hour</span>
                    </div>
                    <button 
                      className={styles.viewProfile}
                      onClick={() => navigate(`/mentor-profile/${mentor.id}`)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default FindMentor
