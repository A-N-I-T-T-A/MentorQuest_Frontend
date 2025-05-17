import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getMentorsBySkills } from '../../services/mentorService';
import { createMentorshipRequest, getMentorshipRequests } from '../../services/mentorshipService';
import RequestSessionPopup from '../../components/RequestSession/RequestSessionPopup';
import './Dashboard.css';

const MatchingMentors = () => {
    const navigate = useNavigate();
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRequestPopup, setShowRequestPopup] = useState(false);
    const [selectedMentorId, setSelectedMentorId] = useState(null);
    const [existingRequests, setExistingRequests] = useState([]);

    useEffect(() => {
        fetchMatchingMentors();
        fetchExistingRequests();
    }, []);

    const fetchMatchingMentors = async () => {
        try {
            const response = await getMentorsBySkills();
            console.log('Raw mentor data from API:', response);
            console.log('Mentor data structure example:', response[0]); // Display first mentor's properties
            console.log('Has feedback data:', 'feedback_count' in (response[0] || {}), 'average_rating' in (response[0] || {}));
            
            const transformedMentors = response.map(mentor => ({
                ...mentor,
                user: mentor.user || {},
                profile_image: mentor.profile_image || null
            }));
            setMentors(transformedMentors);
        } catch (err) {
            setError('Failed to fetch matching mentors');
            console.error('Error fetching mentors:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchExistingRequests = async () => {
        try {
            const response = await getMentorshipRequests('mentee');
            console.log('Existing requests:', response);
            setExistingRequests(response);
        } catch (err) {
            console.error('Error fetching existing requests:', err);
        }
    };

    const handleViewProfile = (mentorId) => {
        navigate(`/mentor-profile/${mentorId}`);
    };

    const handleRequestSession = async (mentorId) => {
        const existingRequest = existingRequests.find(request => 
            request.mentor_id === mentorId
        );

        if (existingRequest) {
            alert('You already have a pending request with this mentor.');
            return;
        }

        setSelectedMentorId(mentorId);
        setShowRequestPopup(true);
    };

    const submitRequest = async (message) => {
        try {
            await createMentorshipRequest(selectedMentorId, message);
            alert('Request sent successfully!');
            setShowRequestPopup(false);
            fetchExistingRequests();
        } catch (err) {
            console.error('Error sending request:', err);
            alert('Failed to send request. Please try again.');
        }
    };

    const getProfileImageUrl = (profileImage) => {
        if (!profileImage) return "/placeholder.svg";
        if (profileImage.startsWith('http')) return profileImage;
        return `${process.env.REACT_APP_API_URL}${profileImage}`;
    };

    if (loading) return <div className="loading">Loading mentors...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard-container">
            <Sidebar userType="mentee" />
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Find Matching Mentors</h1>
                    <p>Connect with mentors who match your skills and interests</p>
                </div>

                <div className="requests-container">
                    {mentors.length === 0 ? (
                        <div className="no-requests">
                            <i className="fas fa-search"></i>
                            <p>No matching mentors found</p>
                        </div>
                    ) : (
                        <div className="requests-grid">
                            {mentors.map((mentor) => (
                                <div key={mentor.id} className="request-card">
                                    <div className="request-header">
                                        <div className="mentee-info">
                                            <div className="mentee-avatar-container">
                                                <img 
                                                    src={getProfileImageUrl(mentor.profile_image)}
                                                    alt={`${mentor.user?.first_name || 'Mentor'} ${mentor.user?.last_name || ''}`}
                                                    className="mentee-avatar"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "/placeholder.svg";
                                                    }}
                                                />
                                            </div>
                                            <div className="mentee-details">
                                                <h3>{`${mentor.user?.first_name || 'Anonymous'} ${mentor.user?.last_name || 'Mentor'}`}</h3>
                                                <p>{mentor.user?.email || 'Email not available'}</p>
                                                {mentor.designation && (
                                                    <p className="mentee-designation">{mentor.designation}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mentee-skills">
                                        {mentor.skills && mentor.skills.map((skill, index) => (
                                            <span key={index} className="skill-tag">{skill.skill_name}</span>
                                        ))}
                                    </div>
                                    
                                    <div className="mentor-stats">
                                        <span className="rating">⭐ {
                                            (mentor.feedback_count && mentor.feedback_count > 0) 
                                                ? (mentor.average_rating ? mentor.average_rating.toFixed(1) : "0.0") 
                                                : "New"
                                        }</span>
                                        
                                        {(mentor.feedback_count && mentor.feedback_count > 0) && (
                                            <span className="reviews">{mentor.feedback_count} reviews</span>
                                        )}
                                        
                                        <span className="price">₹{parseFloat(mentor.hourly_rate || 0).toFixed(2)}/hour</span>
                                    </div>
                                    
                                    <div className="request-actions">
                                        <button 
                                            className="view-profile-btn"
                                            onClick={() => handleViewProfile(mentor.id)}
                                        >
                                            <i className="fas fa-user"></i> View Profile
                                        </button>
                                        {existingRequests.some(request => request.mentor_id === mentor.id) ? (
                                            <button 
                                                className="pending-btn"
                                                disabled
                                            >
                                                <i className="fas fa-clock"></i> Request Sent
                                            </button>
                                        ) : (
                                            <button 
                                                className="accept-btn"
                                                onClick={() => handleRequestSession(mentor.id)}
                                            >
                                                <i className="fas fa-handshake"></i> Connect
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {showRequestPopup && (
                <RequestSessionPopup
                    onClose={() => setShowRequestPopup(false)}
                    onSubmit={submitRequest}
                />
            )}
        </div>
    );
};

export default MatchingMentors;
