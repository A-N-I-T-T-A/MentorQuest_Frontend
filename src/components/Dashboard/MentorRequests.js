import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getMentorshipRequests, updateMentorshipRequestStatus } from '../../services/mentorshipService';
import './Dashboard.css';

const MentorRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await getMentorshipRequests('mentor');
            // Transform the data to ensure proper structure
            const transformedRequests = response.map(request => ({
                ...request,
                mentee: {
                    ...request.mentee,
                    user: request.mentee?.user || {},
                    profile_image: request.mentee?.profile_image || null
                }
            }));
            setRequests(transformedRequests);
        } catch (err) {
            setError('Failed to fetch requests');
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (requestId, status) => {
        try {
            // Convert status to title case before sending
            const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
            
            // Get the request details before updating
            const request = requests.find(r => r.id === requestId);
            if (!request) {
                throw new Error('Request not found');
            }

            // Update the request status
            await updateMentorshipRequestStatus(requestId, formattedStatus);

            // Send email to mentee
            const emailData = {
                recipient_email: request.mentee.user.email,
                recipient_name: request.mentee.user.first_name || request.mentee.user.email.split('@')[0],
                mentor_name: `${request.mentor.user.first_name} ${request.mentor.user.last_name}`,
                status: formattedStatus,
                message: request.message,
                mentee_id: request.mentee.user.id
            };

            // Send email notification
            await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/send-request-status-email/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(emailData)
            });

            // Create dashboard notification for mentee
            await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/notifications/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    user_id: request.mentee.user.id,
                    type: 'request',
                    content: `Your mentorship request to ${request.mentor.user.first_name} ${request.mentor.user.last_name} has been ${formattedStatus.toLowerCase()}`,
                    related_id: requestId
                })
            });

            fetchRequests(); // Refresh the list
        } catch (err) {
            console.error('Error updating request status:', err);
            alert('Failed to update request status');
        }
    };

    const viewMenteeProfile = (menteeId) => {
        navigate(`/mentee-profile/${menteeId}`);
    };

    const getProfileImageUrl = (profileImage) => {
        if (!profileImage) return "/placeholder.svg";
        if (profileImage.startsWith('http')) return profileImage;
        return `${process.env.REACT_APP_API_URL}${profileImage}`;
    };

    if (loading) return <div className="loading">Loading requests...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard-container">
            <Sidebar userType="mentor" />
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Mentorship Requests</h1>
                    <p>Manage your incoming mentorship requests</p>
                </div>

                <div className="requests-container">
                    {requests.length === 0 ? (
                        <div className="no-requests">
                            <i className="fas fa-inbox"></i>
                            <p>No pending requests at the moment</p>
                        </div>
                    ) : (
                        <div className="requests-grid">
                            {requests.map((request) => (
                                <div key={request.id} className="request-card">
                                    <div className="request-header">
                                        <div className="mentee-info">
                                            <div className="mentee-avatar-container">
                                                <img 
                                                    src={getProfileImageUrl(request.mentee?.profile_image)}
                                                    alt={`${request.mentee?.user?.first_name || 'Mentee'} ${request.mentee?.user?.last_name || ''}`}
                                                    className="mentee-avatar"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "/placeholder.svg";
                                                    }}
                                                />
                                            </div>
                                            <div className="mentee-details">
                                                <h3>
                                                    {`${request.mentee?.user?.first_name || 'Anonymous'} ${request.mentee?.user?.last_name || 'Mentee'}`}
                                                </h3>
                                                <p>{request.mentee?.user?.email || 'Email not available'}</p>
                                                {request.mentee?.designation && (
                                                    <p className="mentee-designation">{request.mentee.designation}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`status-badge ${request.status}`}>
                                            {request.status?.charAt(0).toUpperCase() + (request.status?.slice(1) || '')}
                                        </span>
                                    </div>

                                    <div className="request-message">
                                        <p>{request.message || 'No message provided'}</p>
                                    </div>

                                    <div className="request-actions">
                                        <button 
                                            className="view-profile-btn"
                                            onClick={() => viewMenteeProfile(request.mentee?.id)}
                                        >
                                            <i className="fas fa-user"></i> View Profile
                                        </button>
                                        {request.status === 'Pending' && (
                                            <div className="action-buttons">
                                                <button 
                                                    className="accept-btn"
                                                    onClick={() => handleStatusUpdate(request.id, 'accepted')}
                                                >
                                                    <i className="fas fa-check"></i> Accept
                                                </button>
                                                <button 
                                                    className="reject-btn"
                                                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                                >
                                                    <i className="fas fa-times"></i> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorRequests; 