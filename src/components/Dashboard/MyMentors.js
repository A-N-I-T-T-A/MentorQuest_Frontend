import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyMentors = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [selectedMentorId, setSelectedMentorId] = useState(null);
    const [endReason, setEndReason] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/mentorship-relationships/active/mentee/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch mentors');
            }

            const data = await response.json();
            setMentors(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching mentors:', err);
            setError('Failed to load mentors. Please try again later.');
            setLoading(false);
        }
    };

    const viewMentorProfile = (mentorId) => {
        navigate(`/mentor-profile/${mentorId}`);
    };

    const handleEndConnection = async (mentorId) => {
        setSelectedMentorId(mentorId);
        setShowReasonModal(true);
    };

    const handleConfirmEndConnection = async () => {
        if (!endReason.trim()) {
            toast.error('Please provide a reason for ending the connection');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/mentorship-relationships/end/${selectedMentorId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: endReason })
            });

            if (response.ok) {
                toast.success('Connection ended successfully');
                await fetchMentors();
                setShowReasonModal(false);
                setEndReason('');
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to end connection');
            }
        } catch (err) {
            console.error('Error ending connection:', err);
            toast.error('Failed to end connection. Please try again.');
        } finally {
            setLoading(false);
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
                    <h1>My Mentors</h1>
                    <p>Manage your active mentor connections</p>
                </div>

                <div className="requests-container">
                    {mentors.length === 0 ? (
                        <div className="no-requests">
                            <i className="fas fa-user-friends"></i>
                            <p>You don't have any active mentors yet.</p>
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
                                                    alt={`${mentor.user?.first_name || 'Anonymous'}'s profile`}
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
                                        <span className="status-badge accepted">
                                            {mentor.relationship_status || 'Active'}
                                        </span>
                                    </div>
                                    
                                    <div className="mentee-skills">
                                        {mentor.skills && mentor.skills.map((skill, index) => (
                                            <span key={index} className="skill-tag">{skill.skill_name}</span>
                                        ))}
                                    </div>
                                    
                                    <div className="request-actions">
                                        <button 
                                            className="view-profile-btn"
                                            onClick={() => viewMentorProfile(mentor.id)}
                                        >
                                            <i className="fas fa-user"></i> View Profile
                                        </button>
                                        <button 
                                            className="reject-btn"
                                            onClick={() => handleEndConnection(mentor.id)}
                                        >
                                            <i className="fas fa-user-times"></i> End Connection
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reason Modal */}
            {showReasonModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>End Connection</h2>
                        <p>Please provide a reason for ending this connection:</p>
                        <textarea
                            value={endReason}
                            onChange={(e) => setEndReason(e.target.value)}
                            placeholder="Enter your reason here..."
                            rows="4"
                            className="reason-input"
                        />
                        <div className="modal-actions">
                            <button 
                                className="cancel-btn"
                                onClick={() => {
                                    setShowReasonModal(false);
                                    setEndReason('');
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-btn"
                                onClick={handleConfirmEndConnection}
                                disabled={loading}
                            >
                                {loading ? 'Ending...' : 'End Connection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyMentors; 