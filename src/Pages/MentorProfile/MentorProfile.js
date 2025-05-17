import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MentorProfile.module.css';
import { getMentorById } from '../../services/mentorService';
import { createMentorshipRequest } from '../../services/mentorshipService';
import { MEDIA_BASE_URL } from '../../config';
import { getAuthToken } from '../../services/authUtils';
import RequestSessionPopup from '../../components/RequestSession/RequestSessionPopup';

const MentorProfile = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestPopup, setShowRequestPopup] = useState(false);

  useEffect(() => {
    const fetchMentorDetails = async () => {
      try {
        console.log('Fetching mentor details for ID:', mentorId);
        const mentorData = await getMentorById(mentorId);
        console.log('Raw mentor data:', mentorData);
        
        // Transform the data to ensure proper structure
        const transformedData = {
          ...mentorData,
          user: mentorData.user || {},
          profile_image: mentorData.profile_image ? `${MEDIA_BASE_URL}${mentorData.profile_image}` : null,
          // Transform availability from array to object format
          availability: Array.isArray(mentorData.availability) ? mentorData.availability.reduce((acc, slot) => {
            acc[slot.day_of_week] = {
              available: true,
              start_time: slot.start_time,
              end_time: slot.end_time
            };
            return acc;
          }, {}) : {},
          // Ensure skills is an array
          skills: Array.isArray(mentorData.skills) ? mentorData.skills : [],
          // Ensure other fields have default values
          bio: mentorData.bio || '',
          designation: mentorData.designation || '',
          company: mentorData.company || '',
          location: mentorData.location || '',
          experience_years: mentorData.experience_years || '',
          hourly_rate: mentorData.hourly_rate || '',
          linkedin_url: mentorData.linkedin_url || '',
          github_url: mentorData.github_url || '',
          website: mentorData.website || '',
          rating: mentorData.rating || 0,
          total_reviews: mentorData.total_reviews || 0
        };
        
        console.log('Transformed mentor data:', transformedData);
        setMentor(transformedData);
      } catch (err) {
        console.error('Error fetching mentor:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (mentorId) {
      fetchMentorDetails();
    } else {
      setError('No mentor ID provided');
      setLoading(false);
    }
  }, [mentorId]);

  const handleRequestSessionClick = () => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }
    setShowRequestPopup(true);
  };

  const handleRequestSession = async (message) => {
    try {
      await createMentorshipRequest(mentorId, message);
      alert('Request sent successfully!');
      setShowRequestPopup(false);
    } catch (err) {
      console.error('Error sending request:', err);
      alert('Failed to send request. Please try again.');
    }
  };

  const renderAvailability = () => {
    if (!mentor?.availability || Object.keys(mentor.availability).length === 0) {
      return <p>No availability specified</p>;
    }
    
    return (
      <div className={styles.availabilityGrid}>
        {Object.entries(mentor.availability).map(([day, times]) => (
          times.available && (
            <div key={day} className={`${styles.dayIndicator} ${styles.available}`}>
              <span className={styles.dayName}>{day}</span>
              <span className={styles.timeSlot}>
                {times.start_time} - {times.end_time}
              </span>
            </div>
          )
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading mentor details...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!mentor) {
    return <div className={styles.notFound}>Mentor not found</div>;
  }

  return (
    <div className={styles.mentorProfile}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.profileImageContainer}>
            <img 
              src={mentor.profile_image || "/placeholder.svg"} 
              alt={`${mentor.user?.first_name} ${mentor.user?.last_name}` || 'Mentor'} 
              className={styles.profileImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder.svg";
              }}
            />
          </div>
          <div className={styles.headerInfo}>
            <div className={styles.nameAndTitle}>
              <h1>{`${mentor.user?.first_name} ${mentor.user?.last_name}` || 'Anonymous Mentor'}</h1>
              <p className={styles.title}>
                {mentor.designation || 'Mentor'} 
                {mentor.company && ` at ${mentor.company}`}
              </p>
            </div>
            <div className={styles.locationAndRating}>
              <p className={styles.location}>
                <i className="fas fa-map-marker-alt"></i> {mentor.location || 'Location not specified'}
              </p>
              <div className={styles.rating}>
                <span className={styles.ratingText}>
                  {mentor.feedback_count && mentor.feedback_count > 0 ? (
                    <>
                      ⭐ {mentor.average_rating ? mentor.average_rating.toFixed(1) : "0.0"}
                      <span className={styles.reviewCount}> ({mentor.feedback_count} reviews)</span>
                    </>
                  ) : (
                    "New Mentor"
                  )}
                </span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button 
                className={styles.requestSessionButton}
                onClick={handleRequestSessionClick}
              >
                <i className="fas fa-handshake"></i> Connect
              </button>
              <div className={styles.priceTag}>
                ₹{parseFloat(mentor.hourly_rate || 0).toFixed(2)}/hour
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.about}>
          <h2>About</h2>
          <p className={styles.bio}>{mentor.bio || 'No bio available'}</p>
        </section>

        <section className={styles.details}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <h3>Experience</h3>
              <p>{mentor.experience_years} years</p>
            </div>
          </div>
        </section>

        <section className={styles.connect}>
          <h2>Connect</h2>
          <div className={styles.links}>
            {mentor.user?.email && (
              <a 
                href={`mailto:${mentor.user.email}`}
                className={styles.link}
              >
                <i className="fas fa-envelope"></i> Email
              </a>
            )}
            {mentor.linkedin_url && (
              <a 
                href={mentor.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.link}
              >
                <i className="fab fa-linkedin"></i> LinkedIn
              </a>
            )}
            {mentor.github_url && (
              <a 
                href={mentor.github_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.link}
              >
                <i className="fab fa-github"></i> GitHub
              </a>
            )}
            {mentor.website && (
              <a 
                href={mentor.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.link}
              >
                <i className="fas fa-globe"></i> Website
              </a>
            )}
          </div>
        </section>

        <section className={styles.availability}>
          <h2>Availability</h2>
          {renderAvailability()}
        </section>

        <section className={styles.skills}>
          <h2>Skills</h2>
          <div className={styles.skillsList}>
            {mentor.skills && mentor.skills.length > 0 ? (
              mentor.skills.map((skill) => (
                <span key={skill.id} className={styles.skill}>
                  {skill.skill_name}
                </span>
              ))
            ) : (
              <p>No skills specified</p>
            )}
          </div>
        </section>
      </div>

      {showRequestPopup && (
        <RequestSessionPopup
          mentorId={mentorId}
          onClose={() => setShowRequestPopup(false)}
          onSubmit={handleRequestSession}
        />
      )}
    </div>
  );
};

export default MentorProfile;
