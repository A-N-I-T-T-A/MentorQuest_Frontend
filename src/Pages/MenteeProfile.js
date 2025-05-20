"use client"

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from './MenteeProfile.module.css';
import { getAuthToken } from '../services/authUtils';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MEDIA_BASE_URL } from '../config';
import { FaLinkedin, FaGithub, FaMapMarkerAlt, FaUserFriends } from 'react-icons/fa';

const MenteeProfile = () => {
  const { id } = useParams();
  const [mentee, setMentee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenteeProfile = async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(`https://mentorquest-backend.onrender.com/mentorapp/mentee-profile/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Transform the data to ensure proper structure
        const transformedData = {
          ...response.data,
          user: response.data.user || {},
          profile_image: response.data.profile_image ? `${MEDIA_BASE_URL}${response.data.profile_image}` : null,
          skills: Array.isArray(response.data.skills) ? response.data.skills : [],
          bio: response.data.bio || '',
          designation: response.data.designation || '',
          location: response.data.location || '',
          linkedin_url: response.data.linkedin_url || '',
          github_url: response.data.github_url || '',
          experience_level: response.data.experience_level || '',
          pending_requests_count: response.data.pending_requests_count || 0,
          active_mentorships_count: response.data.active_mentorships_count || 0
        };
        
        setMentee(transformedData);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You do not have permission to view this profile');
        } else {
          setError(err.message || "Failed to fetch mentee profile");
        }
        toast.error("Failed to fetch mentee profile");
      } finally {
        setLoading(false);
      }
    };

    fetchMenteeProfile();
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading profile...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  if (!mentee) return <div className={styles.notFound}>Mentee profile not found</div>;

  // Check if user has permission to view this profile
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const canViewProfile = 
    userData.user_type === 'admin' || 
    userData.id === mentee.user.id || 
    (userData.user_type === 'mentor' && 
     (mentee.pending_requests_count > 0 || mentee.active_mentorships_count > 0));

  if (!canViewProfile) {
    return <div className={styles.notAuthorized}>You do not have permission to view this profile</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.profileImage}>
          <img 
            src={mentee.profile_image || '/placeholder.svg'} 
            alt={`${mentee.user.first_name} ${mentee.user.last_name}`}
            className={styles.profilePic}
          />
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.name}>{mentee.user.first_name} {mentee.user.last_name}</h2>
          <p className={styles.designation}>{mentee.designation}</p>
          <p className={styles.experienceLevel}>{mentee.experience_level}</p>
          <div className={styles.metaInfo}>
            <span className={styles.metaItem}>
              <FaMapMarkerAlt className={styles.icon} />
              {mentee.location}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.bioSection}>
          <h3>About Me</h3>
          <p>{mentee.bio}</p>
        </div>

        <div className={styles.skillsSection}>
          <h3>Skills</h3>
          <div className={styles.skillsList}>
            {mentee.skills.map((skill) => (
              <span key={skill.id} className={styles.skill}>
                {skill.skill_name}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.linksSection}>
          <h3>Professional Links</h3>
          <div className={styles.linkList}>
            {mentee.linkedin_url && (
              <a 
                href={mentee.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.link}
              >
                <FaLinkedin className={styles.linkIcon} />
                LinkedIn
              </a>
            )}
            {mentee.github_url && (
              <a 
                href={mentee.github_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.link}
              >
                <FaGithub className={styles.linkIcon} />
                GitHub
              </a>
            )}
          </div>
        </div>

        <div className={styles.activitySection}>
          <h3>Recent Activity</h3>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <FaUserFriends className={styles.activityIcon} />
              <div className={styles.activityDetails}>
                <span className={styles.activityTitle}>Mentorship Requests</span>
                <span className={styles.activityValue}>{mentee.pending_requests_count > 0 ? mentee.pending_requests_count : 'No pending requests'}</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <FaUserFriends className={styles.activityIcon} />
              <div className={styles.activityDetails}>
                <span className={styles.activityTitle}>Active Mentorships</span>
                <span className={styles.activityValue}>{mentee.active_mentorships_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenteeProfile;
