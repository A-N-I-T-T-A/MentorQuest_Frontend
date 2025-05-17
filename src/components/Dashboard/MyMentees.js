import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css';
import { getMentorMentees } from '../../services/mentorService';
import { MEDIA_BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyMentees = () => {
    const [mentees, setMentees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [selectedMenteeId, setSelectedMenteeId] = useState(null);
    const [endReason, setEndReason] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchMentees();
    }, []);

    const fetchMentees = async () => {
        try {
            const data = await getMentorMentees();
            // Transform the data to ensure proper structure
            const transformedMentees = data.map(mentee => ({
                ...mentee,
                user: {
                    ...mentee.user,
                    profile_image: mentee.profile_image || mentee.user?.profile_image || null
                }
            }));
            console.log('Transformed mentees:', transformedMentees); // Debug log
            setMentees(transformedMentees);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching mentees:', err);
            setError('Failed to load mentees. Please try again later.');
            setLoading(false);
        }
    };

    const viewMenteeProfile = (menteeId) => {
        navigate(`/mentee-profile/${menteeId}`);
    };

    const handleEndConnection = async (menteeId) => {
        setSelectedMenteeId(menteeId);
        setShowReasonModal(true);
    };

    const handleConfirmEndConnection = async () => {
        if (!endReason.trim()) {
            toast.error('Please provide a reason for ending the connection');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/mentorship-relationships/end/${selectedMenteeId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: endReason })
            });

            if (response.ok) {
                toast.success('Connection ended successfully');
                await fetchMentees();
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
        // Remove any leading slashes to prevent double slashes in URL
        const cleanPath = profileImage.replace(/^\/+/, '');
        return `${MEDIA_BASE_URL}/${cleanPath}`;
    };

    if (loading) return <div className="loading">Loading mentees...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard-container">
            <Sidebar userType="mentor" />
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>My Mentees</h1>
                    <p>Manage your active mentee connections</p>
                </div>

                <div className="requests-container">
                    {mentees.length === 0 ? (
                        <div className="no-requests">
                            <i className="fas fa-user-friends"></i>
                            <p>You don't have any active mentees yet.</p>
                        </div>
                    ) : (
                        <div className="requests-grid">
                            {mentees.map((mentee) => (
                                <div key={mentee.id} className="request-card">
                                    <div className="request-header">
                                        <div className="mentee-info">
                                            <div className="mentee-avatar-container">
                                                <img 
                                                    src={getProfileImageUrl(mentee.user?.profile_image)} 
                                                    alt={`${mentee.user?.first_name || 'Anonymous'}'s profile`}
                                                    className="mentee-avatar"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "/placeholder.svg";
                                                    }}
                                                />
                                            </div>
                                            <div className="mentee-details">
                                                <h3>{`${mentee.user?.first_name || 'Anonymous'} ${mentee.user?.last_name || 'Mentee'}`}</h3>
                                                <p>{mentee.user?.email || 'Email not available'}</p>
                                                {mentee.education && (
                                                    <p className="mentee-designation">{mentee.education}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="status-badge accepted">
                                            {mentee.relationship_status || 'Active'}
                                        </span>
                                    </div>
                                    
                                    <div className="mentee-skills">
                                        {mentee.skills && mentee.skills.map((skill, index) => (
                                            <span key={index} className="skill-tag">{skill.skill_name}</span>
                                        ))}
                                    </div>
                                    
                                    <div className="request-actions">
                                        <button 
                                            className="view-profile-btn"
                                            onClick={() => viewMenteeProfile(mentee.id)}
                                        >
                                            <i className="fas fa-user"></i> View Profile
                                        </button>
                                        <button 
                                            className="reject-btn"
                                            onClick={() => handleEndConnection(mentee.id)}
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

export default MyMentees;
